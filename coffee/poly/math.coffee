###
00     00   0000000   000000000  000   000
000   000  000   000     000     000   000
000000000  000000000     000     000000000
000 0 000  000   000     000     000   000
000   000  000   000     000     000   000
###

# Polyhédronisme, Copyright 2019, Anselm Levskaya, MIT License
    
{ klog } = require 'kxk'
{ E, sqrt } = Math

Vect = require '../vect'
Quat = require '../quat'
vec  = (x,y,z)   -> new Vect x, y, z
quat = (x,y,z,w) -> new Quat x, y, z, w

clone = (obj) -> # deep-copy
    
    if not obj or typeof(obj) != 'object'
        return obj
    newInstance = new obj.constructor()
    for key of obj 
        newInstance[key] = clone obj[key]
    newInstance

neg      = (v) -> [-v[0], -v[1], -v[2]]
mult     = (c, v) -> [c*v[0], c*v[1], c*v[2]]
_mult    = (v1, v2) -> [v1[0]*v2[0], v1[1]*v2[1], v1[2]*v2[2]]
add      = (v1, v2) -> [v1[0]+v2[0], v1[1]+v2[1], v1[2]+v2[2]]
sub      = (v1, v2) -> [v1[0]-v2[0], v1[1]-v2[1], v1[2]-v2[2]]
dot      = (v1, v2) -> (v1[0]*v2[0]) + (v1[1]*v2[1]) + (v1[2]*v2[2])
cross    = (d1, d2) -> [(d1[1]*d2[2]) - (d1[2]*d2[1]), (d1[2]*d2[0]) - (d1[0]*d2[2]), (d1[0]*d2[1]) - (d1[1]*d2[0])]
mag      = (v) -> sqrt dot v, v
mag2     = (v) -> dot v, v
unit     = (v) -> if l = mag(v) then mult(1/l, v) else [1 0 0]
tween    = (v1, v2, t) -> [((1-t)*v1[0]) + (t*v2[0]), ((1-t)*v1[1]) + (t*v2[1]), ((1-t)*v1[2]) + (t*v2[2])]
midpoint = (v1, v2) -> mult 0.5, add v1, v2
oneThird = (v1, v2) -> tween v1, v2, 1/3.0

angle = (v1, v2) -> vec(v1).angle vec(v2)

rotate = (v, axis, angle) ->
    rot = Quat.axisAngle vec(axis), angle
    res = rot.rotated v
    res.coords()

tangentPoint = (v1, v2) -> # point where line v1...v2 tangent to an origin sphere
    d = sub v2, v1
    l2 = mag2 d
    return v1 if l2 == 0
    sub v1, mult dot(d, v1)/l2, d

edgeDist = (v1, v2) -> sqrt mag2 tangentPoint v1, v2 # distance of line v1...v2 to origin

pointRayDist = (v, rp, rd) ->
    
    vp = sub rp, v
    cr = cross rd, vp
    pn = cross cr, rd
    pointPlaneDist v, rp, pn
    
pointPlaneDist = (v, pp, pn) ->
    
    rp = rayPlane v, pn, pp, pn
    mag sub rp, v

#  0000000  000       0000000    0000000  000   000  000   000  000   0000000  00000000  
# 000       000      000   000  000       000  000   000 0 000  000  000       000       
# 000       000      000   000  000       0000000    000000000  000  0000000   0000000   
# 000       000      000   000  000       000  000   000   000  000       000  000       
#  0000000  0000000   0000000    0000000  000   000  00     00  000  0000000   00000000  

clockwise = (verts, indices) ->
    
    vl = indices.map (vi) -> verts[vi]

    midp = center vl

    frst = sub vl[0], midp
    crss = cross frst, midp

    indices.sort (a,b) ->
        av = sub verts[a], midp
        aa = angle frst, av
        aa *= -1 if dot(crss, av) < 0
        
        bv = sub verts[b], midp
        bb = angle frst, bv
        bb *= -1 if dot(crss, bv) < 0
        
        bb - aa
                
    indices
    
# 00000000    0000000   000   000  
# 000   000  000   000   000 000   
# 0000000    000000000    00000    
# 000   000  000   000     000     
# 000   000  000   000     000     

rayPlane = (rayPos, rayDirection, planePos, planeNormal) ->
    
    x = dot(sub(planePos, rayPos), planeNormal) / dot(rayDirection, planeNormal)
    add rayPos, mult x, rayDirection
  
rayRay= (rayA, rayB) ->

    A = rayA[0]
    B = rayB[0]
    a = sub rayA[1], A
    b = sub rayB[1], B
    c = sub B, A
    aa = dot a, a
    ab = dot a, b
    ac = dot a, c
    bc = dot b, c
    bb = dot b, b
    D = add A, mult (-ab*bc+ac*bb)/(aa*bb-ab*ab), a
    E = add B, mult ( ab*ac-bc*aa)/(aa*bb-ab*ab), b
    
    if 0.1 < mag sub D, E
        klog 'no intersect?' mag sub D, E
    mult 0.5, add D, E
    
# find vector orthogonal to plane of 3 pts
orthogonal = (v1,v2,v3) -> cross sub(v2, v1), sub(v3, v2)

# find first element common to 3 sets by brute force search
intersect = (set1, set2, set3) ->
    for s1 in set1
        for s2 in set2
            if s1 == s2
                for s3 in set3
                    if s1 == s3
                        return s1
    null # empty intersection

calcCentroid = (vertices) ->
    centroidV = [0 0 0]
    for v in vertices
        centroidV = add centroidV, v
    mult 1 / vertices.length, centroidV 

# 000   000   0000000   00000000   00     00   0000000   000      
# 0000  000  000   000  000   000  000   000  000   000  000      
# 000 0 000  000   000  0000000    000000000  000000000  000      
# 000  0000  000   000  000   000  000 0 000  000   000  000      
# 000   000   0000000   000   000  000   000  000   000  0000000  

normal = (vertices) ->

    nv = [0 0 0] 
    [v1, v2] = vertices.slice -2
    for v3 in vertices
        nv = add nv, orthogonal v1, v2, v3
        [v1, v2] = [v2, v3]
    unit nv
    
center = (vertices) ->

    ctr = [0 0 0]
    for v in vertices
        ctr = add ctr, v
    mult 1.0/vertices.length, ctr

copyVecArray = (vecArray) -> # copies array of arrays by value (deep copy)
    
    newVecArray = new Array vecArray.length
    end = vecArray.length
    for i in [0...end]
        newVecArray[i] = vecArray[i].slice 0
    newVecArray

# 000   000  000  000   000   0000000    0000000  
# 000 0 000  000  0000  000  000        000       
# 000000000  000  000 0 000  000  0000  0000000   
# 000   000  000  000  0000  000   000       000  
# 00     00  000  000   000   0000000   0000000   

facesToWings = (faces) ->
    
    nvert = {}
    pvert = {}
    epool = []
    for fi in [0...faces.length]
        edges = faceToEdges faces[fi]
        edges.forEach (edge) -> 
            nvert[fi] ?= {}
            pvert[fi] ?= {}
            nvert[fi][edge[0]] = edge[1]
            pvert[fi][edge[1]] = edge[0]
            edge.push fr:fi
        epool = epool.concat edges
        
    wings = []
    
    while epool.length
        edge = epool.shift()
        edge[2].nr = nvert[edge[2].fr][edge[1]]
        edge[2].pr = pvert[edge[2].fr][edge[0]]
        for oi in [0...epool.length]
            other = epool[oi]
            if other[0] == edge[1] and other[1] == edge[0]
                edge[2].fl = other[2].fr
                edge[2].nl = pvert[edge[2].fl][edge[1]]
                edge[2].pl = nvert[edge[2].fl][edge[0]]
                epool.splice oi, 1
                break
        
        wings.push edge

    wings

faceToEdges = (face) -> 
    # array of edges [v1,v2] for list of vertices
    edges = []
    v1 = face[-1]
    for v2 in face
        edges.push [v1, v2]
        v1 = v2
    edges
    
# 000000000   0000000   000   000   0000000   00000000  000   000  000000000  000  00000000  000   000  
#    000     000   000  0000  000  000        000       0000  000     000     000  000        000 000   
#    000     000000000  000 0 000  000  0000  0000000   000 0 000     000     000  000000      00000    
#    000     000   000  000  0000  000   000  000       000  0000     000     000  000          000     
#    000     000   000  000   000   0000000   00000000  000   000     000     000  000          000     

tangentify = (vertices, edges) ->
    # adjusts vertices on edges such that each edge is tangent to an origin sphere
    newVs = copyVecArray vertices
    for e in edges
        t = tangentPoint newVs[e[0]], newVs[e[1]] 
        c = mult (1-sqrt(dot(t,t)))*0.05, t
        newVs[e[0]] = add newVs[e[0]], c
        newVs[e[1]] = add newVs[e[1]], c
    newVs

# 00000000   000       0000000   000   000   0000000   00000000   000  0000000  00000000  
# 000   000  000      000   000  0000  000  000   000  000   000  000     000   000       
# 00000000   000      000000000  000 0 000  000000000  0000000    000    000    0000000   
# 000        000      000   000  000  0000  000   000  000   000  000   000     000       
# 000        0000000  000   000  000   000  000   000  000   000  000  0000000  00000000  

planarize = (vertices, faces) ->
    # adjusts vertices in each face to improve its planarity
    STABILITY_FACTOR = 0.1 # Hack to improve convergence
    newVs = copyVecArray vertices # copy vertices
    for f in faces
        coords = f.map (v) -> vertices[v]
        n = normal coords # find avg of normals for each vertex triplet
        c = calcCentroid coords # find planar centroid
        if dot(n, c) < 0 # correct sign if needed
            n = mult -1.0, n
        for v in f # project (vertex - centroid) onto normal, subtract off this component
            newVs[v] = add newVs[v], mult dot(mult(STABILITY_FACTOR, n), sub(c, vertices[v])), n
    newVs
    
module.exports =
    vec:            vec
    add:            add
    sub:            sub
    dot:            dot
    mag:            mag
    neg:            neg
    quat:           quat
    mult:           mult
    unit:           unit
    angle:          angle
    cross:          cross
    tween:          tween
    normal:         normal
    center:         center
    rotate:         rotate
    rayRay:         rayRay
    edgeDist:       edgeDist
    oneThird:       oneThird
    midpoint:       midpoint
    rayPlane:       rayPlane
    intersect:      intersect
    clockwise:      clockwise
    planarize:      planarize
    tangentify:     tangentify
    orthogonal:     orthogonal
    faceToEdges:    faceToEdges
    pointRayDist:   pointRayDist
    facesToWings:   facesToWings
    calcCentroid:   calcCentroid
    copyVecArray:   copyVecArray
    tangentPoint:   tangentPoint
    pointPlaneDist: pointPlaneDist
    
    