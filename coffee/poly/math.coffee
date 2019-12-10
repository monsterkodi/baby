###
00     00   0000000   000000000  000   000
000   000  000   000     000     000   000
000000000  000000000     000     000000000
000 0 000  000   000     000     000   000
000   000  000   000     000     000   000
###

# Polyhédronisme, Copyright 2019, Anselm Levskaya, MIT License
    
{ _, klog, rad2deg } = require 'kxk'
{ E, abs, floor, pow, random, round, sqrt } = Math

Vect = require '../vect'
Quat = require '../quat'

sigfigs = (N, nsigs) -> # string with nsigs digits ignoring magnitude
    
  mantissa = N / pow 10 floor log(N)/LN10
  truncated_mantissa = round mantissa * pow 10 nsigs-1
  "#{truncated_mantissa}"

clone = (obj) -> # deep-copy
    
    if not obj or typeof(obj) != 'object'
        return obj
    newInstance = new obj.constructor()
    for key of obj 
        newInstance[key] = clone obj[key]
    newInstance

randomchoice = (array) -> array[floor random()*array.length]

neg      = (vec) -> [-vec[0], -vec[1], -vec[2]]
mult     = (c, vec) -> [c*vec[0], c*vec[1], c*vec[2]]
_mult    = (v1, v2) -> [v1[0]*v2[0], v1[1]*v2[1], v1[2]*v2[2]]
add      = (v1, v2) -> [v1[0]+v2[0], v1[1]+v2[1], v1[2]+v2[2]]
sub      = (v1, v2) -> [v1[0]-v2[0], v1[1]-v2[1], v1[2]-v2[2]]
dot      = (v1, v2) -> (v1[0]*v2[0]) + (v1[1]*v2[1]) + (v1[2]*v2[2])
cross    = (d1, d2) -> [(d1[1]*d2[2]) - (d1[2]*d2[1]), (d1[2]*d2[0]) - (d1[0]*d2[2]), (d1[0]*d2[1]) - (d1[1]*d2[0])]
mag      = (vec) -> sqrt dot vec, vec
mag2     = (vec) -> dot vec, vec
unit     = (vec) -> mult 1/sqrt(mag2(vec)), vec
tween    = (v1, v2, t) -> [((1-t)*v1[0]) + (t*v2[0]), ((1-t)*v1[1]) + (t*v2[1]), ((1-t)*v1[2]) + (t*v2[2])]
midpoint = (v1, v2) -> mult 0.5, add v1, v2
oneThird = (v1, v2) -> tween v1, v2, 1/3.0

rotate = (vec, axis, angle) ->
    rot = Quat.axisAngle (new Vect axis), rad2deg angle
    res = rot.rotated vec
    res.coords()

reciprocal = (vec) -> mult 1.0/mag2(vec), vec # reflect in unit sphere

tangentPoint = (v1, v2) -> # point where line v1...v2 tangent to an origin sphere
    d = sub v2, v1
    l2 = mag2 d
    return v1 if l2 == 0
    sub v1, mult dot(d, v1)/l2, d

edgeDist = (v1, v2) -> sqrt mag2 tangentPoint v1, v2 # distance of line v1...v2 to origin

# square of distance from point v3 to line segment v1...v2
# http:#mathworld.wolfram.com/Point-LineDistance3-Dimensional.html
# calculates min distance from point v3 to finite line segment between v1 and v2

linePointDist2 = (v1, v2, v3) ->

    d21 = sub v2, v1
    d13 = sub v1, v3
    d23 = sub v2, v3
    m2 = mag2 d21
    t = -dot(d13, d21)/m2
    if t <= 0
        # closest to point beyond v1, clip to |v3-v1|^2
        result = mag2 d13
    else if (t >= 1) 
        # closest to point beyond v2, clip to |v3-v2|^2
        result = mag2 d23
    else
        # closest in-between v1, v2
        result = mag2(cross d21, d13)/m2
    result
    
pointPlaneDist = (pos, planePos, planeNormal) ->
    
    mag sub pos, rayPlane pos, planeNormal, planePos, planeNormal
    
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

# calculate average normal vector for array of vertices
normal = (vertices) ->
    normalV = [0 0 0] 
    [v1, v2] = vertices.slice -2
    for v3 in vertices
        normalV = add normalV, orthogonal v1, v2, v3
        [v1, v2] = [v2, v3]
    unit normalV

# calculates area planar face by summing over subtriangle areas, assumes planarity.
planararea = (vertices) ->
    area = 0.0
    vsum = [0 0 0]
    [v1, v2] = vertices.slice(-2)
    for v3 in vertices
        vsum = add vsum, cross v1, v2
        [v1, v2] = [v2, v3]
    area = abs dot(normal(vertices), vsum) / 2.0

# congruence signature for assigning same colors to congruent faces
faceSignature = (vertices, sensitivity) ->

    cross_array = []
    [v1, v2] = vertices.slice -2
    for v3 in vertices
        # accumulate inner angles
        cross_array.push mag cross sub(v1, v2), sub(v3, v2)
        [v1, v2] = [v2, v3]

    # sort angles to create unique sequence
    cross_array.sort (a,b) -> a-b
  
    # render sorted angles as quantized digit strings
    # this is the congruence signature
    sig = ''
    for x in cross_array 
        sig += sigfigs x, sensitivity
    # hack to make reflected faces share the same signature
    for x in cross_array.reverse() 
        sig += sigfigs x, sensitivity
    sig

# projects 3d polyhedral face to 2d polygon for triangulation and face display
project2dface = (verts) ->
    tmpverts = clone verts
    v0 = verts[0]
    tmpverts = _.map (tmpverts,x) -> x-v0
  
    n = normal verts
    c = unit calcCentroid verts #XXX: correct?
    p = cross n, c
  
    tmpverts.map (v) -> [dot(n, v), dot(p, v)]

copyVecArray = (vecArray) -> # copies array of arrays by value (deep copy)
    
    newVecArray = new Array vecArray.length
    end = vecArray.length
    for i in [0...end]
        newVecArray[i] = vecArray[i].slice 0
    newVecArray

# adjusts vertices on edges such that each edge is tangent to an origin sphere
tangentify = (vertices, edges) ->

    newVs = copyVecArray vertices
    for e in edges
        t = tangentPoint newVs[e[0]], newVs[e[1]] 
        c = mult (1-sqrt(dot(t,t)))*0.05, t
        newVs[e[0]] = add newVs[e[0]], c
        newVs[e[1]] = add newVs[e[1]], c
    newVs

# recenters entire polyhedron such that center of mass is at origin
recenter = (vertices, edges) ->

    edgecenters = edges.map ([a, b]) -> tangentPoint vertices[a], vertices[b]
    
    polycenter = [0 0 0]

    for v in edgecenters
        polycenter = add polycenter, v
        
    polycenter = mult 1/edges.length, polycenter

    _.map vertices, (x) -> sub x, polycenter

# rescales maximum radius of polyhedron to 1
rescale = (vertices) ->
    polycenter = [0 0 0]
    maxExtent = _.max _.map vertices, (x) -> mag x
    s = 1 / maxExtent
    _.map vertices, (x) -> [s*x[0], s*x[1], s*x[2]]

# adjusts vertices in each face to improve its planarity
planarize = (vertices, faces) ->
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

# Hacky Canonicalization Algorithm
# Using center of gravity of vertices for each face to planarize faces

# get the spherical reciprocals of face centers
reciprocalC = (poly) ->
    centers = poly.centers()
    for c in centers
        c = mult 1.0/dot(c,c), c
    centers

# make array of vertices reciprocal to given planes
reciprocalN = (poly) ->
    ans = []
    for f in poly.faces #for each face
        centroid    = [0 0 0] # running sum of vertex coords
        normalV     = [0 0 0] # running sum of normal vectors
        avgEdgeDist = 0.0 # running sum for avg edge distance
    
        [v1, v2] = f.slice -2
        for v3 in f
            centroid     = add centroid, poly.vertices[v3]
            normalV      = add normalV, orthogonal poly.vertices[v1], poly.vertices[v2], poly.vertices[v3]
            avgEdgeDist += edgeDist poly.vertices[v1], poly.vertices[v2]
            [v1, v2] = [v2, v3]
    
        centroid    = mult 1.0/f.length, centroid
        normalV     = unit normalV
        avgEdgeDist = avgEdgeDist / f.length
        tmp   = reciprocal mult dot(centroid, normalV), normalV # based on face
        ans.push mult (1 + avgEdgeDist) / 2, tmp
    ans
    
module.exports =
    add:            add
    sub:            sub
    dot:            dot
    mag:            mag
    neg:            neg
    mult:           mult
    unit:           unit
    cross:          cross
    tween:          tween
    normal:         normal
    rotate:         rotate
    rayRay:         rayRay
    oneThird:       oneThird
    midpoint:       midpoint
    calcCentroid:   calcCentroid
    copyVecArray:   copyVecArray
    reciprocal:     reciprocal
    edgeDist:       edgeDist
    intersect:      intersect
    orthogonal:     orthogonal
    tangentPoint:   tangentPoint
    pointPlaneDist: pointPlaneDist
    rayPlane:       rayPlane
    rescale:        rescale
    recenter:       recenter
    planarize:      planarize
    reciprocalN:    reciprocalN
    reciprocalC:    reciprocalC
    tangentify:     tangentify
    
    