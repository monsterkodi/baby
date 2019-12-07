###
000000000   0000000   00000000    0000000     
   000     000   000  000   000  000   000    
   000     000   000  00000000   000   000    
   000     000   000  000        000   000    
   000      0000000   000         0000000     
###
#
# Polyhédronisme, Copyright 2019, Anselm Levskaya, MIT License
#
# Polyhedron Operators
#
# for each vertex of new polyhedron
#     call newV(Vname, xyz) with a symbolic name and coordinates
#
# for each flag of new polyhedron
#     call newFlag(Fname, Vname1, Vname2) with a symbolic name for the new face
#     and the symbolic name for two vertices forming an oriented edge
#
# Orientation must be dealt with properly to make a manifold mesh
# Specifically, no edge v1->v2 can ever be crossed in the same direction by two different faces
# call topoly() to assemble flags into polyhedron structure by following the orbits
# of the vertex mapping stored in the flagset for each new face

{ klog, _ } = require 'kxk'
{ add, mult, mag, sub, unit, oneThird, tween, intersect, midpoint, calcCentroid, copyVecArray } = require './math'
{ tangentify, reciprocalC, reciprocalN, recenter, planarize } = require './geo'

Flag = require './flag'
Polyhedron = require './polyhedron'

midName = (v1, v2) -> v1<v2 and "#{v1}_#{v2}" or "#{v2}_#{v1}" # unique names of midpoints

# 0000000    000   000   0000000   000      
# 000   000  000   000  000   000  000      
# 000   000  000   000  000000000  000      
# 000   000  000   000  000   000  000      
# 0000000     0000000   000   000  0000000  

dual = (poly) ->

    # klog "dual #{poly.name}" 
  
    flag = new Flag()
  
    face = [] # make table of face as fn of edge
    for i in [0...poly.vertices.length] # create empty associative table
        face[i] = {}

    for i in [0...poly.faces.length]
        f = poly.faces[i]
        v1 = f[f.length-1] # last vertex
        for v2 in f # assumes that no 2 faces share an edge in the same orientation!
            face[v1]["v#{v2}"] = "#{i}"
            v1 = v2 # current becomes previous
  
    centers = poly.centers()
    
    for i in [0...poly.faces.length]
        flag.newV "#{i}" centers[i]
  
    for i in [0...poly.faces.length]
        f = poly.faces[i]
        v1 = f[f.length-1] #previous vertex
        for v2 in f
            flag.newFlag v1, face[v2]["v#{v1}"], "#{i}"
            v1=v2 # current becomes previous
  
    dpoly = flag.topoly() # build topological dual from flags
  
    # match F index ordering to V index ordering on dual
    sortF = []
    for f in dpoly.faces
        k = intersect poly.faces[f[0]], poly.faces[f[1]], poly.faces[f[2]]
        sortF[k] = f
    dpoly.faces = sortF
  
    if poly.name[0] != "d"
        dpoly.name = "d#{poly.name}"
    else 
        dpoly.name = poly.name.slice 1
  
    dpoly

# 000   000  000   0000000  000   000  
# 000  000   000  000       0000  000  
# 0000000    000  0000000   000 0 000  
# 000  000   000       000  000  0000  
# 000   000  000  0000000   000   000  

# Kis (abbreviated from triakis) transforms an N-sided face into an N-pyramid rooted at the
# same base vertices. only kis n-sided faces, but n==0 means kis all.

kis = (poly, n, apexdist) ->

    n ?= 0
    apexdist ?= 0

    # klog "kis of #{n and "#{n}-sided faces of " or ''}#{poly.name}"

    flag = new Flag()
    for i in [0...poly.vertices.length]
        p = poly.vertices[i] # each old vertex is a new vertex
        flag.newV "v#{i}" p
  
    normals = poly.normals()
    centers = poly.centers()
    foundAny = false
    for i in [0...poly.faces.length]
        f = poly.faces[i]
        v1 = "v#{f[f.length-1]}"
        for v in f
            v2 = "v#{v}"
            if f.length == n or n == 0
                foundAny = true;
                apex = "apex#{i}"
                fname = "#{i}#{v1}"
                # new vertices in centers of n-sided face
                flag.newV apex, add centers[i], mult apexdist, normals[i]
                flag.newFlag fname,   v1,   v2 # the old edge of original face
                flag.newFlag fname,   v2, apex # up to apex of pyramid
                flag.newFlag fname, apex,   v1 # and back down again
            else
                flag.newFlag "#{i}", v1, v2  # same old flag, if non-n
            
            v1 = v2 # current becomes previous
  
    if not foundAny
        klog "No #{n}-fold components were found."
  
    flag.topoly "k#{n}#{poly.name}"

#  0000000   00     00  0000000     0000000   
# 000   000  000   000  000   000  000   000  
# 000000000  000000000  0000000    000   000  
# 000   000  000 0 000  000   000  000   000  
# 000   000  000   000  0000000     0000000   

# The best way to think of the ambo operator is as a topological "tween" between a polyhedron
# and its dual polyhedron.  Thus the ambo of a dual polyhedron is the same as the ambo of the
# original. Also called "Rectify".

ambo = (poly) ->
    
    # klog "ambo of #{poly.name}"
    
    flag = new Flag()
  
    # For each face f in the original poly
    for i in [0...poly.faces.length]
        f = poly.faces[i]
        [v1, v2] = f.slice(-2)
        for v3 in f
            if v1 < v2 # vertices are the midpoints of all edges of original poly
                flag.newV midName(v1,v2), midpoint poly.vertices[v1], poly.vertices[v2]
            # face corresponds to the original f
            flag.newFlag "orig#{i}"  midName(v1,v2), midName(v2,v3)
            # face corresponds to (the truncated) v2
            flag.newFlag "dual#{v2}" midName(v2,v3), midName(v1,v2)
            # shift over one
            [v1, v2] = [v2, v3]
  
    flag.topoly "a#{poly.name}"

#  0000000   000   000  00000000    0000000   
# 000         000 000   000   000  000   000  
# 000  0000    00000    0000000    000   000  
# 000   000     000     000   000  000   000  
#  0000000      000     000   000   0000000   

gyro = (poly) ->

    klog "gyro of #{poly.name}"
  
    flag = new Flag()
  
    for i in [0...poly.vertices.length]
        flag.newV "v#{i}" unit poly.vertices[i] # each old vertex is a new vertex

    centers = poly.centers() # new vertices in center of each face
    for i in [0...poly.faces.length]
        f = poly.faces[i]
        flag.newV "center#{i}" unit centers[i]
  
    for i in [0...poly.faces.length]
        f = poly.faces[i]
        [v1, v2] = f.slice(-2)
        for j in [0...f.length]
            v = f[j]
            v3 = v
            flag.newV(v1+"~"+v2, oneThird(poly.vertices[v1],poly.vertices[v2]));  # new v in face
            fname = i+"f"+v1
            flag.newFlag fname, "center#{i}"  v1+"~"+v2 # five new flags
            flag.newFlag fname, v1+"~"+v2,  v2+"~"+v1
            flag.newFlag fname, v2+"~"+v1,  "v#{v2}"
            flag.newFlag fname, "v#{v2}"     v2+"~"+v3
            flag.newFlag fname, v2+"~"+v3,  "center#{i}"
            [v1, v2] = [v2, v3] # shift over one
  
    flag.topoly "g#{poly.name}"

# 00000000   00000000  00000000  000      00000000   0000000  000000000  
# 000   000  000       000       000      000       000          000     
# 0000000    0000000   000000    000      0000000   000          000     
# 000   000  000       000       000      000       000          000     
# 000   000  00000000  000       0000000  00000000   0000000     000     

reflect = (poly) -> # geometric reflection through origin

    klog "reflection of #{poly.name}"
    # reflect each point through origin
    for i in [0...poly.vertices.length]
        poly.vertices[i] = mult -1, poly.vertices[i]
    # repair clockwise-ness of faces
    for i in [0...poly.faces.length]
        poly.faces[i] = poly.faces[i].reverse()
    poly.name = "r#{poly.name}"
    poly

#  0000000  000   000   0000000   00     00  00000000  00000000  00000000   
# 000       000   000  000   000  000   000  000       000       000   000  
# 000       000000000  000000000  000000000  000000    0000000   0000000    
# 000       000   000  000   000  000 0 000  000       000       000   000  
#  0000000  000   000  000   000  000   000  000       00000000  000   000  

# A truncation along a polyhedron's edges.
# Chamfering or edge-truncation is similar to expansion, moving faces apart and outward,
# but also maintains the original vertices. Adds a new hexagonal face in place of each
# original edge.
# A polyhedron with e edges will have a chamfered form containing 2e new vertices,
# 3e new edges, and e new hexagonal faces. -- Wikipedia
# See also http:#dmccooey.com/polyhedra/Chamfer.html
#
# The dist parameter could control how deeply to chamfer.
# But I'm not sure about implementing that yet.
#
# Q: what is the dual operation of chamfering? I.e.
# if cX = dxdX, and xX = dcdX, what operation is x?

# We could "almost" do this in terms of already-implemented operations:
# cC = t4daC = t4jC, cO = t3daO, cD = t5daD, cI = t3daI
# But it doesn't work for cases like T.

chamfer = (poly, dist) ->
    klog "chamfer of #{poly.name}"
  
    dist ?= 0.5
  
    flag = new Flag()
  
    normals = poly.normals()
  
    # For each face f in the original poly
    for i in [0...poly.faces.length]
        f = poly.faces[i]
        v1 = f[f.length-1]
        v1new = i + "_" + v1
    
        for v2 in f
          # TODO: figure out what distances will give us a planar hex face.
          # Move each old vertex further from the origin.
          flag.newV(v2, mult(1.0 + dist, poly.vertices[v2]))
          # Add a new vertex, moved parallel to normal.
          v2new = i + "_" + v2
          flag.newV(v2new, add(poly.vertices[v2], mult(dist*1.5, normals[i])))
          # Four new flags:
          # One whose face corresponds to the original face:
          flag.newFlag("orig#{i}", v1new, v2new)
          # And three for the edges of the new hexagon:
          facename = (v1<v2 ? "hex#{v1}_#{v2}" : "hex#{v2}_#{v1}")
          flag.newFlag(facename, v2, v2new)
          flag.newFlag(facename, v2new, v1new)
          flag.newFlag(facename, v1new, v1)
          v1 = v2;
          v1new = v2new

    flag.topoly "c#{poly.name}"

# 000   000  000   000  000  00000000   000      
# 000 0 000  000   000  000  000   000  000      
# 000000000  000000000  000  0000000    000      
# 000   000  000   000  000  000   000  000      
# 00     00  000   000  000  000   000  0000000  

# Gyro followed by truncation of vertices centered on original faces.
# This create 2 new hexagons for every original edge.
# (https:#en.wikipedia.org/wiki/Conway_polyhedron_notation#Operations_on_polyhedra)
#
# Possible extension: take a parameter n that means only whirl n-sided faces.
# If we do that, the flags marked #* below will need to have their other sides
# filled in one way or another, depending on whether the adjacent face is
# whirled or not.

whirl = (poly, n) ->

    klog "whirl of #{poly.name}"
    n ?= 0
    
    flag = new Flag()
  
    # each old vertex is a new vertex
    for i in [0...poly.vertices.length]
        flag.newV "v#{i}" unit poly.vertices[i]

    # new vertices around center of each face
    centers = poly.centers()
  
    for i in [0...poly.faces.length]
        f = poly.faces[i]
        [v1, v2] = f.slice(-2)
        for j in [0...f.length]
            v = f[j]
            v3 = v
            # New vertex along edge
            v1_2 = oneThird(poly.vertices[v1],poly.vertices[v2])
            flag.newV(v1+"~"+v2, v1_2)
            # New vertices near center of face
            cv1name = "center#{i}~#{v1}"
            cv2name = "center#{i}~#{v2}"
            flag.newV(cv1name, unit(oneThird(centers[i], v1_2)))
            fname = i+"f"+v1
            # New hexagon for each original edge
            flag.newFlag(fname, cv1name,   v1+"~"+v2)
            flag.newFlag(fname, v1+"~"+v2, v2+"~"+v1) #*
            flag.newFlag(fname, v2+"~"+v1, "v#{v2}")  #*
            flag.newFlag(fname, "v#{v2}",  v2+"~"+v3) #*
            flag.newFlag(fname, v2+"~"+v3, cv2name)
            flag.newFlag(fname, cv2name,   cv1name)
            # New face in center of each old face      
            flag.newFlag("c#{i}", cv1name, cv2name)
            
            [v1, v2] = [v2, v3] # shift over one
  
    flag.topoly "w#{poly.name}"

#  0000000   000   000  000  000   000  000000000   0000000   
# 000   000  000   000  000  0000  000     000     000   000  
# 000 00 00  000   000  000  000 0 000     000     000   000  
# 000 0000   000   000  000  000  0000     000     000   000  
#  00000 00   0000000   000  000   000     000      0000000   

quinto = (poly) -> # creates a pentagon for every point in the original face, as well as one new inset face.
    
    # klog "quinto of #{poly.name}"
    flag = new Flag()
  
    # For each face f in the original poly
    for i in [0...poly.faces.length]
        f = poly.faces[i]
        centroid = calcCentroid f.map (idx) -> poly.vertices[idx]
        # walk over face vertex-triplets
        [v1, v2] = f.slice -2
        for v3 in f
            # for each face-corner, we make two new points:
            midpt = midpoint poly.vertices[v1], poly.vertices[v2]
            innerpt = midpoint midpt, centroid
            flag.newV midName(v1,v2), midpt
            flag.newV "inner_#{i}_" + midName(v1,v2), innerpt
            # and add the old corner-vertex
            flag.newV "#{v2}" poly.vertices[v2]
          
            # pentagon for each vertex in original face
            flag.newFlag("f#{i}_#{v2}", "inner_#{i}_"+midName(v1, v2), midName(v1, v2))
            flag.newFlag("f#{i}_#{v2}", midName(v1, v2), "#{v2}")
            flag.newFlag("f#{i}_#{v2}", "#{v2}", midName(v2, v3))
            flag.newFlag("f#{i}_#{v2}", midName(v2, v3), "inner_#{i}_"+midName(v2, v3))
            flag.newFlag("f#{i}_#{v2}", "inner_#{i}_"+midName(v2, v3), "inner_#{i}_"+midName(v1, v2))
      
            # inner rotated face of same vertex-number as original
            flag.newFlag("f_in_#{i}", "inner_#{i}_"+midName(v1, v2), "inner_#{i}_"+midName(v2, v3))
      
            [v1, v2] = [v2, v3] # shift over one
  
    flag.topoly "q#{poly.name}"

# 000  000   000   0000000  00000000  000000000
# 000  0000  000  000       000          000   
# 000  000 0 000  0000000   0000000      000   
# 000  000  0000       000  000          000   
# 000  000   000  0000000   00000000     000   

inset = (poly, n, inset_dist, popout_dist) ->

    n ?= 0
    inset_dist ?= 0.5
    popout_dist ?= -0.2
  
    klog "inset of #{n and "#{n}-sided" or 'all'} faces of #{poly.name}"
  
    flag = new Flag()
    for i in [0...poly.vertices.length]
        # each old vertex is a new vertex
        p = poly.vertices[i]
        flag.newV "v#{i}" p

    normals = poly.normals()
    centers = poly.centers()
    for i in [0...poly.faces.length] # new inset vertex for every vert in face
        f = poly.faces[i]
        if f.length == n or n == 0
            for v in f
                flag.newV "f#{i}v#{v}" add tween(poly.vertices[v],centers[i],inset_dist), mult(popout_dist,normals[i])
  
    foundAny = false # alert if don't find any
    for i in [0...poly.faces.length]
        f = poly.faces[i]
        v1 = "v#{f[f.length-1]}"
        for v in f
            v2 = "v#{v}";
            if f.length == n or n == 0
                foundAny = true
                fname = i + v1
                flag.newFlag(fname,      v1,       v2)
                flag.newFlag(fname,      v2,       "f#{i}#{v2}")
                flag.newFlag(fname, "f#{i}#{v2}",  "f#{i}#{v1}")
                flag.newFlag(fname, "f#{i}#{v1}",  v1)
                # new inset, extruded face
                flag.newFlag("ex#{i}", "f#{i}#{v1}",  "f#{i}#{v2}")
            else
                flag.newFlag(i, v1, v2)  # same old flag, if non-n
            v1=v2 # current becomes previous
  
    if not foundAny
        klog "No #{n}-fold components were found."
  
    flag.topoly "n#{n}#{poly.name}"

# 00000000  000   000  000000000  00000000   000   000  0000000    00000000
# 000        000 000      000     000   000  000   000  000   000  000     
# 0000000     00000       000     0000000    000   000  000   000  0000000 
# 000        000 000      000     000   000  000   000  000   000  000     
# 00000000  000   000     000     000   000   0000000   0000000    00000000

extrude = (poly, n) ->
    newpoly = inset poly, n, 0.0, 0.3
    newpoly.name = "x#{n}#{poly.name}"
    newpoly

# 000       0000000   00000000  000000000  
# 000      000   000  000          000     
# 000      000   000  000000       000     
# 000      000   000  000          000     
# 0000000   0000000   000          000     

loft = (poly, n, alpha) ->
    newpoly = inset poly, n, alpha, 0.0
    newpoly.name = "l#{n}#{poly.name}"
    newpoly

# 000   000   0000000   000      000       0000000   000   000  
# 000   000  000   000  000      000      000   000  000 0 000  
# 000000000  000   000  000      000      000   000  000000000  
# 000   000  000   000  000      000      000   000  000   000  
# 000   000   0000000   0000000  0000000   0000000   00     00  

hollow = (poly, inset_dist, thickness) ->

    inset_dist ?= 0.5
    thickness ?= 0.2
  
    klog "hollow #{poly.name}"
  
    dualnormals = dual(poly).normals()
    normals = poly.normals()
    centers = poly.centers()
  
    flag = new Flag()
    for i in [0...poly.vertices.length]
        # each old vertex is a new vertex
        p = poly.vertices[i]
        flag.newV "v#{i}" p
        flag.newV "downv#{i}" add p, mult -1*thickness,dualnormals[i]

    # new inset vertex for every vert in face
    for i in [0...poly.faces.length]
        f = poly.faces[i]
        for v in f
            flag.newV "fin#{i}v#{v}" tween poly.vertices[v], centers[i], inset_dist
            flag.newV "findown#{i}v#{v}" add tween(poly.vertices[v],centers[i],inset_dist), mult(-1*thickness,normals[i])
  
    for i in [0...poly.faces.length]
        f = poly.faces[i]
        v1 = "v#{f[f.length-1]}"
        for v in f
            v2 = "v#{v}"
            fname = i + v1
            flag.newFlag fname, v1,            v2
            flag.newFlag fname, v2,            "fin#{i}#{v2}"
            flag.newFlag fname, "fin#{i}#{v2}" "fin#{i}#{v1}"
            flag.newFlag fname, "fin#{i}#{v1}" v1
      
            fname = "sides#{i}#{v1}"
            flag.newFlag fname, "fin#{i}#{v1}"     "fin#{i}#{v2}"
            flag.newFlag fname, "fin#{i}#{v2}"     "findown#{i}#{v2}"
            flag.newFlag fname, "findown#{i}#{v2}" "findown#{i}#{v1}"
            flag.newFlag fname, "findown#{i}#{v1}" "fin#{i}#{v1}"
      
            fname = "bottom#{i}#{v1}"
            flag.newFlag fname,  "down#{v2}"        "down#{v1}"
            flag.newFlag fname,  "down#{v1}"        "findown#{i}#{v1}"
            flag.newFlag fname,  "findown#{i}#{v1}" "findown#{i}#{v2}"
            flag.newFlag fname,  "findown#{i}#{v2}" "down#{v2}"
      
            v1 = v2 # current becomes previous
  
    flag.topoly "H#{poly.name}"

# 00000000   00000000  00000000    0000000  00000000   00000000   0000000  000000000  000  000   000   0000000 
# 000   000  000       000   000  000       000   000  000       000          000     000  000   000  000   000
# 00000000   0000000   0000000    0000000   00000000   0000000   000          000     000   000 000   000000000
# 000        000       000   000       000  000        000       000          000     000     000     000   000
# 000        00000000  000   000  0000000   000        00000000   0000000     000     000      0      000   000

perspectiva = (poly) -> # an operation reverse-engineered from Perspectiva Corporum Regularium

    # klog "stella of #{poly.name}"
  
    centers = poly.centers() # calculate face centers
  
    flag = new Flag()
    for i in [0...poly.vertices.length]
        flag.newV "v#{i}" poly.vertices[i]
  
    for i in [0...poly.faces.length]
        
        f = poly.faces[i]
        v1 = "v#{f[f.length-2]}"
        v2 = "v#{f[f.length-1]}"
        vert1 = poly.vertices[f[f.length-2]]
        vert2 = poly.vertices[f[f.length-1]]
        for v in f
            v3 = "v#{v}"
            vert3 = poly.vertices[v]
            v12 = v1+"~"+v2
            v21 = v2+"~"+v1
            v23 = v2+"~"+v3
      
            # on each Nface, N new points inset from edge midpoints towards center = "stellated" points
            flag.newV v12, midpoint midpoint(vert1,vert2), centers[i] 
      
            # inset Nface made of new, stellated points
            flag.newFlag "in#{i}" v12, v23
      
            # new tri face constituting the remainder of the stellated Nface
            flag.newFlag "f#{i}#{v2}" v23, v12
            flag.newFlag "f#{i}#{v2}" v12, v2
            flag.newFlag "f#{i}#{v2}" v2,  v23
      
            # one of the two new triangles replacing old edge between v1->v2
            flag.newFlag "f#{v12}" v1,  v21
            flag.newFlag "f#{v12}" v21, v12
            flag.newFlag "f#{v12}" v12, v1
      
            [v1, v2] = [v2, v3]  # current becomes previous
            [vert1, vert2] = [vert2, vert3]
  
    flag.topoly "P#{poly.name}"

# 000000000  00000000   000   0000000  000   000  0000000    
#    000     000   000  000  000       000   000  000   000  
#    000     0000000    000  0000000   000   000  0000000    
#    000     000   000  000       000  000   000  000   000  
#    000     000   000  000  0000000    0000000   0000000    

trisub = (poly, n) ->
    
    klog "trisub of #{poly.name}"
    
    n ?= 2
    
    # No-Op for non-triangular meshes
    for fn in [0...poly.faces.length]
        if poly.faces[fn].length != 3
            return poly
  
    # Calculate redundant set of new vertices for subdivided mesh.
    newVs = []
    vmap = {}
    pos = 0
    for fn in [0...poly.faces.length]
        f = poly.faces[fn]
        [i1, i2, i3] = f.slice -3
        v1 = poly.vertices[i1]
        v2 = poly.vertices[i2]
        v3 = poly.vertices[i3]
        v21 = sub v2, v1
        v31 = sub v3, v1
        for i in [0..n]
            for j in [0..n-i]
                v = add add(v1, mult(i * 1.0 / n, v21)), mult(j * 1.0 / n, v31)
                vmap["v#{fn}-#{i}-#{j}"] = pos++
                newVs.push v
  
    # The above vertices are redundant along original edges, 
    # we need to build an index map into a uniqueified list of them.
    # We identify vertices that are closer than a certain epsilon distance.
    EPSILON_CLOSE = 1.0e-8
    uniqVs = []
    newpos = 0
    uniqmap = {}
    for [i, v] in newVs.entries()
        if i in uniqmap then continue # already mapped
        uniqmap[i] = newpos
        uniqVs.push v
        for j in [i+1...newVs.length]
            w = newVs[j]
            if mag(sub(v, w)) < EPSILON_CLOSE
                uniqmap[j] = newpos
        newpos++
  
    faces = []
    for fn in [0...poly.faces.length]
        for i in [0...n]
            for j in [0...n-i]
                faces.push [uniqmap[vmap["v#{fn}-#{i}-#{j}"]], 
                            uniqmap[vmap["v#{fn}-#{i+1}-#{j}"]], 
                            uniqmap[vmap["v#{fn}-#{i}-#{j+1}"]]]
        for i in [1...n]
            for j in [0...n-i]
                faces.push [uniqmap[vmap["v#{fn}-#{i}-#{j}"]], 
                            uniqmap[vmap["v#{fn}-#{i}-#{j+1}"]], 
                            uniqmap[vmap["v#{fn}-#{i-1}-#{j+1}"]]]
  
    new Polyhedron "u#{n}#{poly.name}" faces, uniqVs

# combines above three constraint adjustments in iterative cycle
canonicalize = (poly, Niter) ->

    Niter ?= 1
    # klog "canonicalize #{poly.name}"
    faces = poly.faces
    edges = poly.edges()
    newVs = poly.vertices
    maxChange = 1.0 # convergence tracker
    for i in [0..Niter]
        oldVs = copyVecArray newVs #copy vertices
        newVs = tangentify newVs, edges
        newVs = recenter newVs, edges
        newVs = planarize newVs, faces
        maxChange = _.max _.map _.zip(newVs, oldVs), ([x, y]) -> mag sub x, y
        if maxChange < 1e-8
            break
    # one should now rescale, but not rescaling here makes for very interesting numerical
    # instabilities that make interesting mutants on multiple applications...
    # more experience will tell what to do
    #newVs = rescale(newVs)
    # klog "[canonicalization done, last |deltaV|=#{maxChange}]"
    newpoly = new Polyhedron poly.name, poly.faces, newVs
    # klog "canonicalize" newpoly
    newpoly
    
canonicalXYZ = (poly, nIterations) ->

    nIterations ?= 1
    dpoly = dual poly
    # klog "canonicalXYZ #{poly.name}"
  
    for count in [0...nIterations] # reciprocate face normals
        dpoly.vertices = reciprocalN poly
        poly.vertices  = reciprocalN dpoly
  
    new Polyhedron poly.name, poly.faces, poly.vertices

flatten = (poly, nIterations) -> # quick planarization
    
    nIterations ?= 1
    dpoly = dual poly # v's of dual are in order of arg's f's
    # klog "flatten #{poly.name}"
  
    for count in [0...nIterations] # reciprocate face centers
        dpoly.vertices = reciprocalC poly
        poly.vertices  = reciprocalC dpoly
  
    new Polyhedron poly.name, poly.faces, poly.vertices
    
# 00000000  000   000  00000000    0000000   00000000   000000000   0000000  
# 000        000 000   000   000  000   000  000   000     000     000       
# 0000000     00000    00000000   000   000  0000000       000     0000000   
# 000        000 000   000        000   000  000   000     000          000  
# 00000000  000   000  000         0000000   000   000     000     0000000   

module.exports =
    dual:           dual
    trisub:         trisub
    perspectiva:    perspectiva
    kis:            kis
    ambo:           ambo
    gyro:           gyro
    reflect:        reflect
    chamfer:        chamfer
    whirl:          whirl
    quinto:         quinto
    inset:          inset
    extrude:        extrude
    loft:           loft
    hollow:         hollow
    flatten:        flatten
    canonicalize:   canonicalize
    canonicalXYZ:   canonicalXYZ
    