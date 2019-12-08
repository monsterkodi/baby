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

{ clamp, klog, _ } = require 'kxk'
{ dot, add, neg, mult, mag, sub, unit, cross, rotate, oneThird, tween, intersect, rayRay, rayPlane, pointPlaneDist, midpoint, calcCentroid, copyVecArray } = require './math'
{ tangentify, reciprocalC, reciprocalN, recenter, rescale, planarize } = require './geo'
{ min, abs, acos } = Math

Flag = require './flag'
Polyhedron = require './polyhedron'

midName = (v1, v2) -> v1<v2 and "#{v1}_#{v2}" or "#{v2}_#{v1}" # unique names of midpoints

# 0000000  000  00000000   000   000  000   000  000       0000000   00000000   000  0000000  00000000  
#    000   000  000   000  000  000   000   000  000      000   000  000   000  000     000   000       
#   000    000  0000000    0000000    000   000  000      000000000  0000000    000    000    0000000   
#  000     000  000   000  000  000   000   000  000      000   000  000   000  000   000     000       
# 0000000  000  000   000  000   000   0000000   0000000  000   000  000   000  000  0000000  00000000  

zirkularize = (poly, n) ->
    
    n ?= 0
    vertices = []
    
    for i in [0...poly.faces.length]
        f = poly.faces[i]
        if f.length == n or n == 0
            [v1, v2] = f.slice -2
            for v3 in f
                v12 = sub poly.vertices[v2], poly.vertices[v1]
                v32 = sub poly.vertices[v2], poly.vertices[v3]
                if abs(mag(v12) - mag(v32)) > 0.001
                    m12 = midpoint poly.vertices[v1], poly.vertices[v2]
                    m32 = midpoint poly.vertices[v3], poly.vertices[v2]
                    u12 = unit m12
                    u32 = unit m32
                    nc = add u12, u32
                    pn = cross nc, cross poly.vertices[v1], poly.vertices[v3]
                    if mag(v12) > mag(v32)
                        r = rayPlane poly.vertices[v3], v32, [0 0 0], pn
                    else
                        r = rayPlane poly.vertices[v1], v12, [0 0 0], pn
                    vertices[v2] = r
                [v1, v2] = [v2, v3]
  
    verts = [0...poly.vertices.length].map (i) -> vertices[i] ? poly.vertices[i]
    
    new Polyhedron "z#{poly.name}" poly.faces, verts

# 0000000    000   000   0000000   000      
# 000   000  000   000  000   000  000      
# 000   000  000   000  000000000  000      
# 000   000  000   000  000   000  000      
# 0000000     0000000   000   000  0000000  

dual = (poly) ->

    # klog "dual #{poly.name}" 
  
    flag = new Flag()
  
    face = [] 
    for i in [0...poly.vertices.length] 
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

    # klog "gyro of #{poly.name}"
  
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
            [v1, v2] = [v2, v3]
  
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

chamfer = (poly, factor=0.5) ->
    
    factor  = clamp 0.001 0.995 factor
    flag    = new Flag()
    normals = poly.normals()
    centers = poly.centers()
    wings   = poly.wings()
        
    minEdgeLength = Infinity

    # klog poly.name, wings
    
    planeNormal = (edge, e0, e1) ->

        dir = sub e1, e0
        dr  = unit cross normals[edge[2].fr], dir
        dl  = unit cross dir, normals[edge[2].fl]
        unit cross dir, cross(dir, unit(add dr, dl))
    
    for edge in wings
        e0  = poly.vertices[edge[0]]
        e1  = poly.vertices[edge[1]]
        edgeLength = mag sub e0, e1
        minEdgeLength = min minEdgeLength, edgeLength/2

    minEdgeLength *= factor
    klog poly.name, minEdgeLength
        
    moved = {}
    for edge in wings
        e0  = poly.vertices[edge[0]]
        e1  = poly.vertices[edge[1]]
        moved["#{edge[1]}#{edge[0]}l"] = moved["#{edge[0]}#{edge[1]}r"] = [
            add e0, mult minEdgeLength, unit sub poly.vertices[edge[2].pr], e0
            add e1, mult minEdgeLength, unit sub poly.vertices[edge[2].nr], e1]
        moved["#{edge[1]}#{edge[0]}r"] = moved["#{edge[0]}#{edge[1]}l"] = [
            add e0, mult minEdgeLength, unit sub poly.vertices[edge[2].pl], e0
            add e1, mult minEdgeLength, unit sub poly.vertices[edge[2].nl], e1]

    for edge in wings
        e0   = poly.vertices[edge[0]]
        e1   = poly.vertices[edge[1]]
        
        nf  = "#{edge[0]}▸#{edge[1]}" 
        n_h = "#{edge[1]}"
        n_t = "#{edge[0]}"

        nnr = "#{n_h}▸#{edge[2].fr}"
        nnl = "#{n_h}▸#{edge[2].fl}"
        npr = "#{n_t}▸#{edge[2].fr}"
        npl = "#{n_t}▸#{edge[2].fl}"        
                
        nr = rayRay moved["#{edge[0]}#{edge[1]}r"], moved["#{edge[1]}#{edge[2].nr}r"]
        nl = rayRay moved["#{edge[0]}#{edge[1]}l"], moved["#{edge[1]}#{edge[2].nl}l"]
        pr = rayRay moved["#{edge[0]}#{edge[1]}r"], moved["#{edge[2].pr}#{edge[0]}r"]
        pl = rayRay moved["#{edge[0]}#{edge[1]}l"], moved["#{edge[2].pl}#{edge[0]}l"]
        
        # if flag.newV(n_h, head) then klog 'n_h'
        # if flag.newV(n_t, tail) then klog 'n_t'
        if flag.newV(nnr, nr) then klog 'nnr'
        if flag.newV(nnl, nl) then klog 'nnl'
        if flag.newV(npl, pl) then klog 'npl'
        if flag.newV(npr, pr) then klog 'npr'

        # flag.newFlag nf, n_h, nnr
        # flag.newFlag nf, nnr, npr
        # flag.newFlag nf, npr, n_t
        # flag.newFlag nf, n_t, npl
        # flag.newFlag nf, npl, nnl
        # flag.newFlag nf, nnl, n_h
        
        flag.newFlag nf, nnr, npr
        flag.newFlag nf, npr, npl
        flag.newFlag nf, npl, nnl
        flag.newFlag nf, nnl, nnr
        
        # flag.newFlag "#{edge[2].fr}" npr, nnr
        # flag.newFlag "#{edge[2].fl}" nnl, npl
        
    flag.topoly "c#{poly.name}"

chamfer1 = (poly, factor=0.5) ->

    factor  = clamp 0.001 0.995 factor
    flag    = new Flag()
    normals = poly.normals()
    centers = poly.centers()
    wings   = poly.wings()
        
    minDepth = Infinity

    klog poly.name #, poly, wings
    
    planeNormal = (edge, e0, e1) ->

        dir = sub e1, e0
        dr = unit cross normals[edge[2].fr], dir
        dl = unit cross dir, normals[edge[2].fl]
        unit cross dir, cross(dir, unit(add dr, dl))
    
    for edge in wings
        e0  = poly.vertices[edge[0]]
        e1  = poly.vertices[edge[1]]
        pnm = planeNormal edge, e0, e1
        
        minDepth = Math.min minDepth, mag sub e0, rayPlane [0 0 0], e0, centers[edge[2].fr], pnm
        minDepth = Math.min minDepth, mag sub e1, rayPlane [0 0 0], e1, centers[edge[2].fr], pnm
        minDepth = Math.min minDepth, mag sub e1, rayPlane [0 0 0], e1, centers[edge[2].fl], pnm
        minDepth = Math.min minDepth, mag sub e0, rayPlane [0 0 0], e0, centers[edge[2].fl], pnm

    cutDepth = factor * minDepth
                
    for edge in wings
        e0   = poly.vertices[edge[0]]
        e1   = poly.vertices[edge[1]]
        pnm = planeNormal edge, e0, e1
                
        he = sub e1, mult cutDepth, pnm
        te = sub e0, mult cutDepth, pnm
        head = rayPlane [0 0 0], e1, he, pnm
        tail = rayPlane [0 0 0], e0, te, pnm
        
        menr = unit add unit(sub e0, e1), unit(sub poly.vertices[edge[2].nr], e1)
        menl = unit add unit(sub e0, e1), unit(sub poly.vertices[edge[2].nl], e1)
        mepr = unit add unit(sub e1, e0), unit(sub poly.vertices[edge[2].pr], e0)
        mepl = unit add unit(sub e1, e0), unit(sub poly.vertices[edge[2].pl], e0)
                        
        nr = rayPlane e1, menr, head, pnm
        nl = rayPlane e1, menl, head, pnm
        pr = rayPlane e0, mepr, tail, pnm
        pl = rayPlane e0, mepl, tail, pnm
        
        nf  = "#{edge[0]}▸#{edge[1]}" 
        n_h = "#{edge[1]}"
        n_t = "#{edge[0]}"

        nnr = "#{n_h}▸#{edge[2].fr}"
        nnl = "#{n_h}▸#{edge[2].fl}"
        npr = "#{n_t}▸#{edge[2].fr}"
        npl = "#{n_t}▸#{edge[2].fl}"                
        
        if flag.newV(n_h, head) then klog 'n_h'
        if flag.newV(n_t, tail) then klog 'n_t'
        if flag.newV(nnr, nr) then klog 'nnr'
        if flag.newV(nnl, nl) then klog 'nnl'
        if flag.newV(npl, pl) then klog 'npl'
        if flag.newV(npr, pr) then klog 'npr'

        flag.newFlag nf, n_h, nnr
        flag.newFlag nf, nnr, npr
        flag.newFlag nf, npr, n_t
        flag.newFlag nf, n_t, npl
        flag.newFlag nf, npl, nnl
        flag.newFlag nf, nnl, n_h
        
        flag.newFlag "#{edge[2].fr}" npr, nnr
        flag.newFlag "#{edge[2].fl}" nnl, npl
        
    flag.topoly "c#{poly.name}"

chamfer2 = (poly, factor=0.5) ->

    factor = clamp 0.001 0.995 factor
    flag = new Flag()
    normals = poly.normals()
    centers = poly.centers()
    wings   = poly.wings()
        
    for edge in wings
        e0  = poly.vertices[edge[0]]
        e1  = poly.vertices[edge[1]]
        nfl = normals[edge[2].fl]
        nfr = normals[edge[2].fr]
        emp = midpoint e0, e1
        edir = sub e1, e0
        faceAngle = acos dot nfl, nfr
        
        mpr = rotate emp, edir, -factor*faceAngle/2
        mpl = rotate emp, edir,  factor*faceAngle/2
        
        e1fr = sub centers[edge[2].fr], e1
        e1fl = sub centers[edge[2].fl], e1
        e0fr = sub centers[edge[2].fr], e0
        e0fl = sub centers[edge[2].fl], e0
        
        nr = rayPlane mpr, edir,      e1, unit cross nfr, e1fr
        nl = rayPlane mpl, edir,      e1, unit cross nfl, e1fl
        pr = rayPlane mpr, neg(edir), e0, unit cross nfr, e0fr
        pl = rayPlane mpl, neg(edir), e0, unit cross nfl, e0fl

        nf  = "#{edge[0]}▸#{edge[1]}" 
        n_h = "#{edge[1]}"
        n_t = "#{edge[0]}"

        nnr = "#{n_h}▸#{edge[2].fr}"
        nnl = "#{n_h}▸#{edge[2].fl}"
        npr = "#{n_t}▸#{edge[2].fr}"
        npl = "#{n_t}▸#{edge[2].fl}"                

        nfn = unit emp
        nmp = midpoint nr, pl
        
        flag.newV n_h, rayPlane [0 0 0], e1, nmp, nfn 
        flag.newV n_t, rayPlane [0 0 0], e0, nmp, nfn
        flag.newV nnr, nr
        flag.newV nnl, nl
        flag.newV npl, pl
        flag.newV npr, pr

        flag.newFlag nf, n_h, nnr
        flag.newFlag nf, nnr, npr
        flag.newFlag nf, npr, n_t
        flag.newFlag nf, n_t, npl
        flag.newFlag nf, npl, nnl
        flag.newFlag nf, nnl, n_h
        
        flag.newFlag "#{edge[2].fr}" npr, nnr
        flag.newFlag "#{edge[2].fl}" nnl, npl
        
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
  
    for i in [0...poly.vertices.length]
        flag.newV "v#{i}" unit poly.vertices[i]

    centers = poly.centers()
  
    for i in [0...poly.faces.length]
        f = poly.faces[i]
        [v1, v2] = f.slice -2
        for j in [0...f.length]
            v = f[j]
            v3 = v
            v1_2 = oneThird poly.vertices[v1], poly.vertices[v2]
            flag.newV(v1+"~"+v2, v1_2)
            cv1name = "center#{i}~#{v1}"
            cv2name = "center#{i}~#{v2}"
            flag.newV cv1name, unit oneThird centers[i], v1_2
            fname = i+"f"+v1
            flag.newFlag fname, cv1name,   v1+"~"+v2
            flag.newFlag fname, v1+"~"+v2, v2+"~"+v1 
            flag.newFlag fname, v2+"~"+v1, "v#{v2}"  
            flag.newFlag fname, "v#{v2}",  v2+"~"+v3 
            flag.newFlag fname, v2+"~"+v3, cv2name
            flag.newFlag fname, cv2name,   cv1name
            flag.newFlag "c#{i}", cv1name, cv2name
            
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
            flag.newFlag "f#{i}_#{v2}", "inner_#{i}_"+midName(v1, v2), midName(v1, v2)
            flag.newFlag "f#{i}_#{v2}", midName(v1, v2), "#{v2}"
            flag.newFlag "f#{i}_#{v2}", "#{v2}", midName(v2, v3)
            flag.newFlag "f#{i}_#{v2}", midName(v2, v3), "inner_#{i}_"+midName(v2, v3)
            flag.newFlag "f#{i}_#{v2}", "inner_#{i}_"+midName(v2, v3), "inner_#{i}_"+midName(v1, v2)
      
            # inner rotated face of same vertex-number as original
            flag.newFlag "f_in_#{i}", "inner_#{i}_"+midName(v1, v2), "inner_#{i}_"+midName(v2, v3)
      
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

extrude = (poly, n, popout=1, insetf=0.5) ->
    newpoly = inset poly, n, insetf, popout
    newpoly.name = "x#{n}#{poly.name}"
    newpoly

# 000   000   0000000   000      000       0000000   000   000  
# 000   000  000   000  000      000      000   000  000 0 000  
# 000000000  000   000  000      000      000   000  000000000  
# 000   000  000   000  000      000      000   000  000   000  
# 000   000   0000000   0000000  0000000   0000000   00     00  

hollow = (poly, inset_dist, thickness) ->

    inset_dist ?= 0.5
    thickness ?= 0.2
  
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

trisub = (poly, n=2) ->
    
    # No-Op for non-triangular meshes
    for fn in [0...poly.faces.length]
        if poly.faces[fn].length != 3
            return poly
  
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
                v = add add(v1, mult(i/n, v21)), mult(j/n, v31)
                vmap["v#{fn}-#{i}-#{j}"] = pos++
                newVs.push v
  
    EPSILON_CLOSE = 1.0e-8
    uniqVs = []
    newpos = 0
    uniqmap = {}
    for v,i in newVs
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
  
    # klog 'faces' faces
    # klog 'vertices' uniqVs                         
    
    new Polyhedron "u#{n}#{poly.name}" faces, uniqVs

#  0000000   0000000   000   000   0000000   000   000  000   0000000   0000000   000      000  0000000  00000000  
# 000       000   000  0000  000  000   000  0000  000  000  000       000   000  000      000     000   000       
# 000       000000000  000 0 000  000   000  000 0 000  000  000       000000000  000      000    000    0000000   
# 000       000   000  000  0000  000   000  000  0000  000  000       000   000  000      000   000     000       
#  0000000  000   000  000   000   0000000   000   000  000   0000000  000   000  0000000  000  0000000  00000000  

canonicalize = (poly, iter=200) ->

    # klog "canonicalize #{poly.name}"
    faces = poly.faces
    edges = poly.edges()
    newVs = poly.vertices
    maxChange = 1.0 # convergence tracker
    for i in [0..iter]
        oldVs = copyVecArray newVs
        newVs = tangentify newVs, edges
        newVs = recenter newVs, edges
        newVs = planarize newVs, faces
        maxChange = _.max _.map _.zip(newVs, oldVs), ([x, y]) -> mag sub x, y
        if maxChange < 1e-8
            break
    # one should now rescale, but not rescaling here makes for very interesting numerical
    # instabilities that make interesting mutants on multiple applications...
    # more experience will tell what to do
    newVs = rescale(newVs)
    # klog "[canonicalization done, last |deltaV|=#{maxChange}]"
    newpoly = new Polyhedron poly.name, poly.faces, newVs
    # klog "canonicalize" newpoly
    newpoly
    
canonicalXYZ = (poly, iterations) ->

    iterations ?= 1
    dpoly = dual poly
    # klog "canonicalXYZ #{poly.name}"
  
    for count in [0...iterations] # reciprocate face normals
        dpoly.vertices = reciprocalN poly
        poly.vertices  = reciprocalN dpoly
  
    new Polyhedron poly.name, poly.faces, poly.vertices

flatten = (poly, iterations) -> # quick planarization
    
    iterations ?= 1
    dpoly = dual poly # v's of dual are in order of arg's f's
    # klog "flatten #{poly.name}"
  
    for count in [0...iterations] # reciprocate face centers
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
    hollow:         hollow
    flatten:        flatten
    zirkularize:    zirkularize
    canonicalize:   canonicalize
    canonicalXYZ:   canonicalXYZ
    