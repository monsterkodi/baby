###
000000000   0000000   00000000    0000000     
   000     000   000  000   000  000   000    
   000     000   000  00000000   000   000    
   000     000   000  000        000   000    
   000      0000000   000         0000000     
###

# Polyhédronisme, Copyright 2019, Anselm Levskaya, MIT License

{ _, clamp, klog } = require 'kxk'
{ add, angle, calcCentroid, clockwise, copyVecArray, cross, intersect, mag, midpoint, mult, oneThird, planarize, rayPlane, rayRay, recenter, reciprocalC, reciprocalN, rescale, rotate, sub, tangentify, tween, unit } = require './math'
{ min, sqrt } = Math
Vect = require '../vect'

ϕ = (sqrt(5)-1)/2

Flag = require './flag'
Polyhedron = require './polyhedron'

midName = (v1, v2) -> v1<v2 and "#{v1}_#{v2}" or "#{v2}_#{v1}"

# 00000000  000   000  00000000    0000000   000   000  0000000    
# 000        000 000   000   000  000   000  0000  000  000   000  
# 0000000     00000    00000000   000000000  000 0 000  000   000  
# 000        000 000   000        000   000  000  0000  000   000  
# 00000000  000   000  000        000   000  000   000  0000000    

expand = (poly, amount=0.5) ->

    amount    = clamp 0 10 amount
    oldedges  = poly.edges()
    centers   = poly.centers()
    neighbors = poly.neighbors()
    wings     = poly.wings()
        
    verts = []
    faces = []
    vmap  = {}
    imap  = {}
    newV  = 0
    for fi in [0...poly.face.length]
        d = sub mult(1+amount, centers[fi]), centers[fi]
        f = poly.face[fi]
        face = []
        for v,vi in f
            vmap[v] ?= []
            vmap[v].push newV
            imap[newV] = v
            verts.push add poly.vertex[v], d
            nextV = newV+(vi==f.length-1 and -f.length+1 or 1)
            face.push newV
            newV++
        faces.push face
            
    for wing in wings
        [a,b] = wing
        face = vmap[a].concat vmap[b]
        face = face.filter (v) -> (v in faces[wing[2].fr]) or (v in faces[wing[2].fl])
        clockwise verts, face
        faces.push face

    for o,n of vmap
        clockwise verts, n
        faces.push n
        
    new Polyhedron "e#{poly.name}" faces, verts

#  0000000  00000000   000   000  00000000  00000000   000   0000000   0000000   000      000  0000000  00000000  
# 000       000   000  000   000  000       000   000  000  000       000   000  000      000     000   000       
# 0000000   00000000   000000000  0000000   0000000    000  000       000000000  000      000    000    0000000   
#      000  000        000   000  000       000   000  000  000       000   000  000      000   000     000       
# 0000000   000        000   000  00000000  000   000  000   0000000  000   000  0000000  000  0000000  00000000  

sphericalize = (poly) ->

    verts = []
    for vertex,vi in poly.vertex
        verts.push unit poly.vertex[vi]
        
    new Polyhedron "z#{poly.name}" poly.face, verts

# 0000000  000  00000000   000   000  000   000  000       0000000   00000000   000  0000000  00000000  
#    000   000  000   000  000  000   000   000  000      000   000  000   000  000     000   000       
#   000    000  0000000    0000000    000   000  000      000000000  0000000    000    000    0000000   
#  000     000  000   000  000  000   000   000  000      000   000  000   000  000   000     000       
# 0000000  000  000   000  000   000   0000000   0000000  000   000  000   000  000  0000000  00000000  

zirkularize = (poly, grow=1, n=6) ->

    vertices = []
    
    centers = poly.centers()
    
    for f,fi in poly.face

        if f.length == n or n == 0
            for v in f
                axis = cross centers[fi], poly.vertex[v]
                angl = angle centers[fi], poly.vertex[v]
                vertices[v] = rotate centers[fi], axis, angl * grow
                
    verts = [0...poly.vertex.length].map (i) -> vertices[i] ? poly.vertex[i]
     
    new Polyhedron "z#{poly.name}" poly.face, verts

# 0000000    000   000   0000000   000      
# 000   000  000   000  000   000  000      
# 000   000  000   000  000000000  000      
# 000   000  000   000  000   000  000      
# 0000000     0000000   000   000  0000000  

dual = (poly) ->

    flag = new Flag()
  
    face = [] 
    for i in [0...poly.vertex.length] 
        face[i] = {}

    for i in [0...poly.face.length]
        f = poly.face[i]
        v1 = f[-1]
        for v2 in f
            face[v1]["v#{v2}"] = "#{i}"
            v1 = v2
  
    centers = poly.centers()
    
    for i in [0...poly.face.length]
        flag.vert "#{i}" centers[i]
  
    for i in [0...poly.face.length]
        f = poly.face[i]
        v1 = f[-1]
        for v2 in f
            flag.edge v1, face[v2]["v#{v1}"], "#{i}"
            v1 = v2
  
    dpoly = flag.topoly()
  
    sortF = []
    for f in dpoly.face
        k = intersect poly.face[f[0]], poly.face[f[1]], poly.face[f[2]]
        sortF[k] = f
    dpoly.face = sortF
  
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

kis = (poly, apexdist=0.5, n=0) ->

    apexdist = clamp -1 10 apexdist
    
    if apexdist < 0
        apexdist = apexdist * poly.minFaceDist()
    
    flag = new Flag()
    for i in [0...poly.vertex.length]
        flag.vert "v#{i}" poly.vertex[i]
  
    normals = poly.normals()
    centers = poly.centers()
    foundAny = false
    for i in [0...poly.face.length]
        f = poly.face[i]
        v1 = "v#{f[f.length-1]}"
        for v in f
            v2 = "v#{v}"
            if f.length == n or n == 0
                foundAny = true;
                apex = "apex#{i}"
                fname = "#{i}#{v1}"

                flag.vert apex, add centers[i], mult apexdist, normals[i]
                flag.edge fname,   v1,   v2
                flag.edge fname,   v2, apex
                flag.edge fname, apex,   v1
            else
                flag.edge "#{i}", v1, v2
            
            v1 = v2
  
    if not foundAny
        klog "No #{n}-fold components were found."
  
    flag.topoly "k#{n}#{poly.name}"

# 000000000  00000000   000   000  000   000   0000000   0000000   000000000  00000000  
#    000     000   000  000   000  0000  000  000       000   000     000     000       
#    000     0000000    000   000  000 0 000  000       000000000     000     0000000   
#    000     000   000  000   000  000  0000  000       000   000     000     000       
#    000     000   000   0000000   000   000   0000000  000   000     000     00000000  

truncate = (poly, factor=0.5) ->

    factor = clamp 0 1 factor
    edgeMap = {}
    
    numFaces    = poly.face.length
    numVertices = poly.vertex.length
    neighbors   = poly.neighbors()
    
    depth = 0.5 * factor * poly.minEdgeLength()
    
    for vertexIndex in [0...numVertices]
        
        edgeMap[vertexIndex] ?= {}
        face = []
        
        nl = neighbors[vertexIndex].length
        for ii in [0...nl]
            ni = neighbors[vertexIndex][ii]
            edgeMap[vertexIndex][ni] = poly.vertex.length
            vp = poly.edge vertexIndex, ni
            vp.normalize()
            vp.scaleInPlace depth
            vp.addInPlace poly.vert vertexIndex
            face.push poly.vertex.length
            poly.vertex.push [vp.x, vp.y, vp.z]
            
        poly.face.push face
    
    for fi in [0...numFaces]
        face = poly.face[fi]
        newFace = []
        for vi in [0...face.length]
            ni = (vi+1) % face.length
            newFace.push edgeMap[face[vi]][face[ni]]
            if factor < 1
                newFace.push edgeMap[face[ni]][face[vi]]
        poly.face[fi] = newFace
      
    poly.vertex.splice 0, numVertices
    for face in poly.face
        for i in [0...face.length]
            face[i] -= numVertices
        
    poly
    
#  0000000   00     00  0000000     0000000   
# 000   000  000   000  000   000  000   000  
# 000000000  000000000  0000000    000   000  
# 000   000  000 0 000  000   000  000   000  
# 000   000  000   000  0000000     0000000   

# Topological "tween" between a polyhedron and its dual polyhedron.

ambo = (poly) ->
    
    flag = new Flag()
  
    for i in [0...poly.face.length]
        f = poly.face[i]
        [v1, v2] = f.slice(-2)
        for v3 in f
            if v1 < v2
                flag.vert midName(v1,v2), midpoint poly.vertex[v1], poly.vertex[v2]

            flag.edge "orig#{i}"  midName(v1,v2), midName(v2,v3)
            flag.edge "dual#{v2}" midName(v2,v3), midName(v1,v2)

            [v1, v2] = [v2, v3]
  
    flag.topoly "a#{poly.name}"

bevel = (poly, factor=0.5) ->
    
    p = truncate ambo(poly), factor
    p.name = "b#{poly.name}"
    p
    
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
    
    for edge in wings
        e0 = poly.vertex[edge[0]]
        e1 = poly.vertex[edge[1]]
        ed = unit sub e1, e0
        
        nr = unit sub poly.vertex[edge[2].nr], e1
        pr = unit sub poly.vertex[edge[2].pr], e0
        cr = rayRay [e1, mult 0.5, add add(e1, nr), sub(e1, ed)],
                    [e0, mult 0.5, add add(e0, pr), add(e0, ed)]

        el = mag sub e1, rayRay [e1, add(e1, nr)], [cr, add(cr, ed)]
        minEdgeLength = min minEdgeLength, el

        el = mag sub e0, rayRay [e0, add(e0, pr)], [cr, sub(cr, ed)]
        minEdgeLength = min minEdgeLength, el
        
    minEdgeLength *= factor
        
    moved = {}
    for edge in wings
        e0  = poly.vertex[edge[0]]
        e1  = poly.vertex[edge[1]]
        rr = [
            add(e0, mult minEdgeLength, unit sub poly.vertex[edge[2].pr], e0),
            add(e1, mult minEdgeLength, unit sub poly.vertex[edge[2].nr], e1)]
        lr = [
            add(e0, mult minEdgeLength, unit sub poly.vertex[edge[2].pl], e0),
            add(e1, mult minEdgeLength, unit sub poly.vertex[edge[2].nl], e1)]
            
        moved["#{edge[1]}▸#{edge[0]}l"] = rr
        moved["#{edge[0]}▸#{edge[1]}r"] = rr
        moved["#{edge[1]}▸#{edge[0]}r"] = lr
        moved["#{edge[0]}▸#{edge[1]}l"] = lr
            
    for edge in wings
        e0   = poly.vertex[edge[0]]
        e1   = poly.vertex[edge[1]]
        
        nf  = "#{edge[0]}▸#{edge[1]}" 
        n_h = "#{edge[1]}"
        n_t = "#{edge[0]}"
        
        nnr = "#{n_h}▸#{edge[2].fr}"
        nnl = "#{n_h}▸#{edge[2].fl}"
        npr = "#{n_t}▸#{edge[2].fr}"
        npl = "#{n_t}▸#{edge[2].fl}"        
                
        nr = rayRay moved["#{edge[0]}▸#{edge[1]}r"], moved["#{edge[1]}▸#{edge[2].nr}r"]
        nl = rayRay moved["#{edge[0]}▸#{edge[1]}l"], moved["#{edge[1]}▸#{edge[2].nl}l"]
        pr = rayRay moved["#{edge[0]}▸#{edge[1]}r"], moved["#{edge[2].pr}▸#{edge[0]}r"]
        pl = rayRay moved["#{edge[0]}▸#{edge[1]}l"], moved["#{edge[2].pl}▸#{edge[0]}l"]
        
        pmid = midpoint pl, pr
        nmid = midpoint nl, nr
        cmid = midpoint pmid, nmid
        pnm  = cross sub(pmid,nmid), sub(pl,pr)

        head = rayPlane [0 0 0], e1, cmid, pnm
        tail = rayPlane [0 0 0], e0, cmid, pnm
        
        flag.vert n_h, head
        flag.vert n_t, tail
        flag.vert nnr, nr
        flag.vert nnl, nl
        flag.vert npl, pl
        flag.vert npr, pr

        flag.edge nf, n_h, nnr
        flag.edge nf, nnr, npr
        flag.edge nf, npr, n_t
        flag.edge nf, n_t, npl
        flag.edge nf, npl, nnl
        flag.edge nf, nnl, n_h
                
        flag.edge "#{edge[2].fr}" npr, nnr
        flag.edge "#{edge[2].fl}" nnl, npl
        
    flag.topoly "c#{poly.name}"

# 000   000  000   000  000  00000000   000      
# 000 0 000  000   000  000  000   000  000      
# 000000000  000000000  000  0000000    000      
# 000   000  000   000  000  000   000  000      
# 00     00  000   000  000  000   000  0000000  

whirl = (poly, n=0) ->

    flag = new Flag()
  
    for i in [0...poly.vertex.length]
        flag.vert "v#{i}" unit poly.vertex[i]

    centers = poly.centers()
  
    for i in [0...poly.face.length]
        f = poly.face[i]
        [v1, v2] = f.slice -2
        for j in [0...f.length]
            v = f[j]
            v3 = v
            v1_2 = oneThird poly.vertex[v1], poly.vertex[v2]
            flag.vert(v1+"~"+v2, v1_2)
            cv1name = "center#{i}~#{v1}"
            cv2name = "center#{i}~#{v2}"
            flag.vert cv1name, unit oneThird centers[i], v1_2
            fname = i+"f"+v1
            flag.edge fname, cv1name,   v1+"~"+v2
            flag.edge fname, v1+"~"+v2, v2+"~"+v1 
            flag.edge fname, v2+"~"+v1, "v#{v2}"  
            flag.edge fname, "v#{v2}",  v2+"~"+v3 
            flag.edge fname, v2+"~"+v3, cv2name
            flag.edge fname, cv2name,   cv1name
            flag.edge "c#{i}", cv1name, cv2name
            
            [v1, v2] = [v2, v3]
  
    canonicalize flag.topoly "w#{poly.name}"

#  0000000   000   000  00000000    0000000   
# 000         000 000   000   000  000   000  
# 000  0000    00000    0000000    000   000  
# 000   000     000     000   000  000   000  
#  0000000      000     000   000   0000000   

gyro = (poly) ->

    flag = new Flag()
  
    for i in [0...poly.vertex.length]
        flag.vert "v#{i}" unit poly.vertex[i]

    centers = poly.centers()
    for i in [0...poly.face.length]
        f = poly.face[i]
        flag.vert "center#{i}" unit centers[i]
  
    for i in [0...poly.face.length]
        f = poly.face[i]
        [v1, v2] = f.slice(-2)
        for j in [0...f.length]
            v = f[j]
            v3 = v
            flag.vert v1+"~"+v2, oneThird poly.vertex[v1],poly.vertex[v2]
            fname = i+"f"+v1
            flag.edge fname, "center#{i}"  v1+"~"+v2
            flag.edge fname, v1+"~"+v2,  v2+"~"+v1
            flag.edge fname, v2+"~"+v1,  "v#{v2}"
            flag.edge fname, "v#{v2}"     v2+"~"+v3
            flag.edge fname, v2+"~"+v3,  "center#{i}"
            [v1, v2] = [v2, v3]
  
    canonicalize flag.topoly "g#{poly.name}"
    
#  0000000   000   000  000  000   000  000000000   0000000   
# 000   000  000   000  000  0000  000     000     000   000  
# 000 00 00  000   000  000  000 0 000     000     000   000  
# 000 0000   000   000  000  000  0000     000     000   000  
#  00000 00   0000000   000  000   000     000      0000000   

quinto = (poly) -> # creates a pentagon for every vertex and a new inset face
    
    flag = new Flag()
  
    for i in [0...poly.face.length]
        f = poly.face[i]
        centroid = calcCentroid f.map (idx) -> poly.vertex[idx]

        [v1, v2] = f.slice -2
        for v3 in f
            midpt = midpoint poly.vertex[v1], poly.vertex[v2]
            innerpt = midpoint midpt, centroid
            flag.vert midName(v1,v2), midpt
            flag.vert "inner_#{i}_" + midName(v1,v2), innerpt
            flag.vert "#{v2}" poly.vertex[v2]
          
            flag.edge "f#{i}_#{v2}", "inner_#{i}_"+midName(v1, v2), midName(v1, v2)
            flag.edge "f#{i}_#{v2}", midName(v1, v2), "#{v2}"
            flag.edge "f#{i}_#{v2}", "#{v2}", midName(v2, v3)
            flag.edge "f#{i}_#{v2}", midName(v2, v3), "inner_#{i}_"+midName(v2, v3)
            flag.edge "f#{i}_#{v2}", "inner_#{i}_"+midName(v2, v3), "inner_#{i}_"+midName(v1, v2)
      
            flag.edge "f_in_#{i}", "inner_#{i}_"+midName(v1, v2), "inner_#{i}_"+midName(v2, v3)
      
            [v1, v2] = [v2, v3]
  
    flag.topoly "q#{poly.name}"

# 000  000   000   0000000  00000000  000000000
# 000  0000  000  000       000          000   
# 000  000 0 000  0000000   0000000      000   
# 000  000  0000       000  000          000   
# 000  000   000  0000000   00000000     000   

inset = (poly, inset=0.5, popout=-0.2, n=0) ->
  
    inset = clamp 0.25 0.99 inset
    popout = min popout, inset
    flag = new Flag()
    for i in [0...poly.vertex.length]
        p = poly.vertex[i]
        flag.vert "v#{i}" p

    normals = poly.normals()
    centers = poly.centers()
    for i in [0...poly.face.length]
        f = poly.face[i]
        if f.length == n or n == 0
            for v in f
                flag.vert "f#{i}v#{v}" add tween(poly.vertex[v],centers[i],inset), mult(popout,normals[i])
  
    foundAny = false # alert if don't find any
    for i in [0...poly.face.length]
        f = poly.face[i]
        v1 = "v#{f[f.length-1]}"
        for v in f
            v2 = "v#{v}";
            if f.length == n or n == 0
                foundAny = true
                fname = i + v1
                flag.edge(fname,      v1,       v2)
                flag.edge(fname,      v2,       "f#{i}#{v2}")
                flag.edge(fname, "f#{i}#{v2}",  "f#{i}#{v1}")
                flag.edge(fname, "f#{i}#{v1}",  v1)
                flag.edge("ex#{i}", "f#{i}#{v1}",  "f#{i}#{v2}")
            else
                flag.edge(i, v1, v2)  
            v1=v2
  
    if not foundAny
        klog "No #{n}-fold components were found."
  
    flag.topoly "n#{n}#{poly.name}"

# 00000000  000   000  000000000  00000000   000   000  0000000    00000000
# 000        000 000      000     000   000  000   000  000   000  000     
# 0000000     00000       000     0000000    000   000  000   000  0000000 
# 000        000 000      000     000   000  000   000  000   000  000     
# 00000000  000   000     000     000   000   0000000   0000000    00000000

extrude = (poly, popout=1, insetf=0.5, n=0) ->
    newpoly = inset poly, insetf, popout, n
    newpoly.name = "x#{n}#{poly.name}"
    newpoly

# 000   000   0000000   000      000       0000000   000   000  
# 000   000  000   000  000      000      000   000  000 0 000  
# 000000000  000   000  000      000      000   000  000000000  
# 000   000  000   000  000      000      000   000  000   000  
# 000   000   0000000   0000000  0000000   0000000   00     00  

hollow = (poly, insetf, thickness) ->

    insetf ?= 0.5
    insetf  = clamp 0.1 0.9 insetf
    thickness ?= insetf*2/3
    thickness = min insetf*2/3, thickness
  
    dualnormals = dual(poly).normals()
    normals = poly.normals()
    centers = poly.centers()
  
    flag = new Flag()
    for i in [0...poly.vertex.length]
        p = poly.vertex[i]
        flag.vert "v#{i}" p
        flag.vert "downv#{i}" add p, mult -1*thickness,dualnormals[i]

    for i in [0...poly.face.length]
        f = poly.face[i]
        for v in f
            flag.vert "fin#{i}v#{v}" tween poly.vertex[v], centers[i], insetf
            flag.vert "findown#{i}v#{v}" add tween(poly.vertex[v],centers[i],insetf), mult(-1*thickness,normals[i])
  
    for i in [0...poly.face.length]
        f = poly.face[i]
        v1 = "v#{f[f.length-1]}"
        for v in f
            v2 = "v#{v}"
            fname = i + v1
            flag.edge fname, v1,            v2
            flag.edge fname, v2,            "fin#{i}#{v2}"
            flag.edge fname, "fin#{i}#{v2}" "fin#{i}#{v1}"
            flag.edge fname, "fin#{i}#{v1}" v1
      
            fname = "sides#{i}#{v1}"
            flag.edge fname, "fin#{i}#{v1}"     "fin#{i}#{v2}"
            flag.edge fname, "fin#{i}#{v2}"     "findown#{i}#{v2}"
            flag.edge fname, "findown#{i}#{v2}" "findown#{i}#{v1}"
            flag.edge fname, "findown#{i}#{v1}" "fin#{i}#{v1}"
      
            fname = "bottom#{i}#{v1}"
            flag.edge fname,  "down#{v2}"        "down#{v1}"
            flag.edge fname,  "down#{v1}"        "findown#{i}#{v1}"
            flag.edge fname,  "findown#{i}#{v1}" "findown#{i}#{v2}"
            flag.edge fname,  "findown#{i}#{v2}" "down#{v2}"
      
            v1 = v2
  
    flag.topoly "H#{poly.name}"

# 00000000   00000000  00000000    0000000  00000000   00000000   0000000  000000000  000  000   000   0000000 
# 000   000  000       000   000  000       000   000  000       000          000     000  000   000  000   000
# 00000000   0000000   0000000    0000000   00000000   0000000   000          000     000   000 000   000000000
# 000        000       000   000       000  000        000       000          000     000     000     000   000
# 000        00000000  000   000  0000000   000        00000000   0000000     000     000      0      000   000

perspectiva = (poly) -> # an operation reverse-engineered from Perspectiva Corporum Regularium

    centers = poly.centers()
  
    flag = new Flag()
    for i in [0...poly.vertex.length]
        flag.vert "v#{i}" poly.vertex[i]
  
    for i in [0...poly.face.length]
        
        f = poly.face[i]
        v1 = "v#{f[f.length-2]}"
        v2 = "v#{f[f.length-1]}"
        vert1 = poly.vertex[f[f.length-2]]
        vert2 = poly.vertex[f[f.length-1]]
        for v in f
            v3 = "v#{v}"
            vert3 = poly.vertex[v]
            v12 = v1+"~"+v2
            v21 = v2+"~"+v1
            v23 = v2+"~"+v3
      
            # on each Nface, N new points inset from edge midpoints towards center = "stellated" points
            flag.vert v12, midpoint midpoint(vert1,vert2), centers[i] 
      
            # inset Nface made of new, stellated points
            flag.edge "in#{i}" v12, v23
      
            # new tri face constituting the remainder of the stellated Nface
            flag.edge "f#{i}#{v2}" v23, v12
            flag.edge "f#{i}#{v2}" v12, v2
            flag.edge "f#{i}#{v2}" v2,  v23
      
            # one of the two new triangles replacing old edge between v1->v2
            flag.edge "f#{v12}" v1,  v21
            flag.edge "f#{v12}" v21, v12
            flag.edge "f#{v12}" v12, v1
      
            [v1, v2] = [v2, v3]
            [vert1, vert2] = [vert2, vert3]
  
    flag.topoly "P#{poly.name}"

# 000000000  00000000   000   0000000  000   000  0000000    
#    000     000   000  000  000       000   000  000   000  
#    000     0000000    000  0000000   000   000  0000000    
#    000     000   000  000       000  000   000  000   000  
#    000     000   000  000  0000000    0000000   0000000    

trisub = (poly, n=2) ->
    
    for fn in [0...poly.face.length]
        if poly.face[fn].length != 3
            return poly
  
    verts = []
    vmap = {}
    pos = 0
    for fn in [0...poly.face.length]
        f = poly.face[fn]
        [i1, i2, i3] = f.slice -3
        v1 = poly.vertex[i1]
        v2 = poly.vertex[i2]
        v3 = poly.vertex[i3]
        v21 = sub v2, v1
        v31 = sub v3, v1
        for i in [0..n]
            for j in [0..n-i]
                v = add add(v1, mult(i/n, v21)), mult(j/n, v31)
                vmap["v#{fn}-#{i}-#{j}"] = pos++
                verts.push v
  
    EPSILON_CLOSE = 1.0e-8
    uniqVs = []
    newpos = 0
    uniqmap = {}
    for v,i in verts
        if i in uniqmap then continue # already mapped
        uniqmap[i] = newpos
        uniqVs.push v
        for j in [i+1...verts.length]
            w = verts[j]
            if mag(sub(v, w)) < EPSILON_CLOSE
                uniqmap[j] = newpos
        newpos++
  
    faces = []
    for fn in [0...poly.face.length]
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

#  0000000   0000000   000   000   0000000   000   000  000   0000000   0000000   000      000  0000000  00000000  
# 000       000   000  0000  000  000   000  0000  000  000  000       000   000  000      000     000   000       
# 000       000000000  000 0 000  000   000  000 0 000  000  000       000000000  000      000    000    0000000   
# 000       000   000  000  0000  000   000  000  0000  000  000       000   000  000      000   000     000       
#  0000000  000   000  000   000   0000000   000   000  000   0000000  000   000  0000000  000  0000000  00000000  

# Slow Canonicalization Algorithm
#
# This algorithm has some convergence problems, what really needs to be done is to
# sum the three forcing factors together as a coherent force and to use a half-decent
# integrator to make sure that it converges well as opposed to the current hack of
# ad-hoc stability multipliers.  Ideally one would implement a conjugate gradient
# descent or similar pretty thing.
#
# Only try to use this on convex polyhedra that have a chance of being canonicalized,
# otherwise it will probably blow up the geometry.  A much trickier / smarter seed-symmetry
# based geometrical regularizer should be used for fancier/weirder polyhedra.

canonicalize = (poly, iter=200) ->

    faces = poly.face
    edges = poly.edges()
    verts = poly.vertex
    maxChange = 1.0
    for i in [0..iter]
        oldVs = copyVecArray verts
        verts = tangentify verts, edges
        verts = recenter verts, edges
        verts = planarize verts, faces
        maxChange = _.max _.map _.zip(verts, oldVs), ([x, y]) -> mag sub x, y
        if maxChange < 1e-8
            break
    verts = rescale verts
    new Polyhedron poly.name, poly.face, verts
    
canonicalXYZ = (poly, iterations) ->

    iterations ?= 1
    dpoly = dual poly
  
    for count in [0...iterations] # reciprocate face normals
        dpoly.vertex = reciprocalN poly
        poly.vertex  = reciprocalN dpoly
  
    new Polyhedron poly.name, poly.face, poly.vertex

flatten = (poly, iterations) -> # quick planarization
    
    iterations ?= 1
    dpoly = dual poly
  
    for count in [0...iterations]
        dpoly.vertex = reciprocalC poly
        poly.vertex  = reciprocalC dpoly
  
    new Polyhedron poly.name, poly.face, poly.vertex
    
# 00000000  000   000  00000000    0000000   00000000   000000000   0000000  
# 000        000 000   000   000  000   000  000   000     000     000       
# 0000000     00000    00000000   000   000  0000000       000     0000000   
# 000        000 000   000        000   000  000   000     000          000  
# 00000000  000   000  000         0000000   000   000     000     0000000   

module.exports =
    dual:           dual
    bevel:          bevel
    trisub:         trisub
    truncate:       truncate
    perspectiva:    perspectiva
    kis:            kis
    ambo:           ambo
    gyro:           gyro
    chamfer:        chamfer
    whirl:          whirl
    quinto:         quinto
    inset:          inset
    extrude:        extrude
    expand:         expand
    hollow:         hollow
    flatten:        flatten
    zirkularize:    zirkularize
    sphericalize:   sphericalize
    canonicalize:   canonicalize
    canonicalXYZ:   canonicalXYZ
    