###
 0000000   00000000   0000000   
000        000       000   000  
000  0000  0000000   000   000  
000   000  000       000   000  
 0000000   00000000   0000000   
###
# Polyhédronisme
#==================================================================================================
# A toy for constructing and manipulating polyhedra and other meshes
#    
# Includes implementation of the conway polyhedral operators derived
# from code by mathematician and mathematical sculptor George W. Hart http:#www.georgehart.com/
#
# Copyright 2019, Anselm Levskaya
# Released under the MIT License
#
#==================================================================================================
    
{ _ } = require 'kxk'
{ random, round, floor, sqrt, sin, cos, tan, asin, acos, atan, abs, pow, log, PI, LN10 } = Math

sigfigs = (N, nsigs) -> # string with nsigs digits ignoring magnitude
    
  mantissa = N / pow 10, floor log(N)/LN10
  truncated_mantissa = round mantissa * pow 10, nsigs-1
  "#{truncated_mantissa}"

clone = (obj) -> # deep-copy
    
    if not obj or typeof(obj) != 'object'
        return obj
    newInstance = new obj.constructor()
    for key of obj 
        newInstance[key] = clone obj[key]
    newInstance

randomchoice = (array) -> array[floor random()*array.length]

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
midpoint = (v1, v2) => mult 1/2.0, add v1, v2
oneThird = (v1, v2) => tween v1, v2, 1/3.0

reciprocal = (vec) -> mult(1.0 / mag2(vec), vec) # reflect in unit sphere

tangentPoint = (v1, v2) -> # point where line v1...v2 tangent to an origin sphere
  d = sub v2, v1
  sub v1, mult dot(d, v1)/mag2(d), d

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
  
    tmpverts.map (v) => [dot(n, v), dot(p, v)]

# copies array of arrays by value (deep copy)
copyVecArray = (vecArray) ->
    newVecArray = new Array vecArray.length
    end = vecArray.length
    for i in [0...end]
        newVecArray[i] = vecArray[i].slice 0
    newVecArray

# 3d matrix vector multiply
mv3 = (mat,vec) ->
    #Ghetto custom def of matrix-vector mult
    #example matrix: [[a,b,c],[d,e,f],[g,h,i]]
    [(mat[0][0]*vec[0])+(mat[0][1]*vec[1])+(mat[0][2]*vec[2]),
     (mat[1][0]*vec[0])+(mat[1][1]*vec[1])+(mat[1][2]*vec[2]),
     (mat[2][0]*vec[0])+(mat[2][1]*vec[1])+(mat[2][2]*vec[2])]

# 3d matrix matrix multiply
mm3 = (A,B) ->
    [[(A[0][0]*B[0][0])+(A[0][1]*B[1][0])+(A[0][2]*B[2][0]),
     (A[0][0]*B[0][1])+(A[0][1]*B[1][1])+(A[0][2]*B[2][1]),
     (A[0][0]*B[0][2])+(A[0][1]*B[1][2])+(A[0][2]*B[2][2])],
    [(A[1][0]*B[0][0])+(A[1][1]*B[1][0])+(A[1][2]*B[2][0]),
     (A[1][0]*B[0][1])+(A[1][1]*B[1][1])+(A[1][2]*B[2][1]),
     (A[1][0]*B[0][2])+(A[1][1]*B[1][2])+(A[1][2]*B[2][2])],
    [(A[2][0]*B[0][0])+(A[2][1]*B[1][0])+(A[2][2]*B[2][0]),
     (A[2][0]*B[0][1])+(A[2][1]*B[1][1])+(A[2][2]*B[2][1]),
     (A[2][0]*B[0][2])+(A[2][1]*B[1][2])+(A[2][2]*B[2][2])]]

eye3 = [[1 0 0], [0 1 0], [0 0 1]]

# Rotation Matrix
# Totally ghetto, not at all in agreement with euler angles!
# use quaternions instead
rotm = (phi, theta, psi) ->
    xy_mat = [
        [cos(phi), -1.0*sin(phi),  0.0]
        [sin(phi),      cos(phi),  0.0]
        [0.0,                0.0,  1.0]]
    yz_mat = [
        [cos(theta), 0, -1.0*sin(theta)]
        [         0, 1,               0]
        [sin(theta), 0,      cos(theta)]]
    xz_mat = [
        [1.0,        0,             0]
        [  0, cos(psi), -1.0*sin(psi)]
        [  0, sin(psi),      cos(psi)]]
    mm3(xz_mat, mm3(yz_mat,xy_mat))

# Rotation Matrix defined by rotation about (unit) axis [x,y,z] for angle radians
vec_rotm = (angle, x, y, z) ->

    angle /= 2
    sinA = sin angle
    cosA = cos angle
    sinA2 = sinA*sinA
    length = mag [x,y,z]
    if length == 0
        [x, y, z] = [0 0 1]
    
    if length != 1
        [x, y, z] = unit [x, y, z]

    if ((x == 1) && (y == 0) && (z == 0)) 
        m = [[1,              0,           0]
             [0,    1-(2*sinA2), 2*sinA*cosA]
             [0,   -2*sinA*cosA, 1-(2*sinA2)]]
    else if ((x == 0) && (y == 1) && (z == 0)) 
        m = [[1-(2*sinA2), 0,  -2*sinA*cosA]
             [          0, 1,             0]
             [2*sinA*cosA, 0,   1-(2*sinA2)]]
    else if ((x == 0) && (y == 0) && (z == 1)) 
        m = [[   1-(2*sinA2),   2*sinA*cosA, 0]
             [  -2*sinA*cosA,   1-(2*sinA2), 0]
             [             0,             0, 1]]
    else 
        x2 = x*x
        y2 = y*y
        z2 = z*z
        m = [
          [1-(2*(y2+z2)*sinA2), 2*((x*y*sinA2)+(z*sinA*cosA)), 2*((x*z*sinA2)-(y*sinA*cosA))]
          [2*((y*x*sinA2)-(z*sinA*cosA)), 1-(2*(z2+x2)*sinA2), 2*((y*z*sinA2)+(x*sinA*cosA))]
          [2*((z*x*sinA2)+(y*sinA*cosA)), 2*((z*y*sinA2)-(x*sinA*cosA)), 1-(2*(x2+y2)*sinA2)]]
    m

# Perspective Transform
# assumes world's been rotated appropriately such that Z is depth
# scales perspective such that inside depth regions min_real_depth <--> max_real_depth
# perspective lengths vary no more than:   desired_ratio
# with target dimension of roughly length: desired_length
perspT = (vec3, max_real_depth, min_real_depth, desired_ratio, desired_length) ->
    z0 = ((max_real_depth * desired_ratio) - min_real_depth) / (1-desired_ratio)
    scalefactor = (desired_length * desired_ratio) / (1-desired_ratio)
    # projected [X, Y]
    [(scalefactor*vec3[0])/(vec3[2]+z0), (scalefactor*vec3[1])/(vec3[2]+z0)]

# Inverses perspective transform by projecting plane onto a unit sphere at origin
invperspT = (x, y, dx, dy, max_real_depth, min_real_depth, desired_ratio, desired_length) ->
    z0 = ((max_real_depth * desired_ratio) - min_real_depth)/(1-desired_ratio)
    s = (desired_length * desired_ratio)/(1-desired_ratio)
    xp = x-dx
    yp = y-dy
    s2 = s*s
    z02 = z0*z0
    xp2 = xp*xp
    yp2 = yp*yp
  
    xsphere = ((2*s*xp*z0) + sqrt((4*s2*xp2*z02) + (4*xp2*(s2+xp2+yp2)*(1-z02))))/(2.0*(s2+xp2+yp2))
    ysphere = (((s*yp*z0)/(s2+xp2+yp2)) + ((yp*sqrt((4*s2*z02) + (4*(s2+xp2+yp2)*(1-z02))))/(2.0*(s2+xp2+yp2))))
    zsphere = sqrt(1 - (xsphere*xsphere) - (ysphere*ysphere))
  
    [xsphere, ysphere, zsphere]

# Returns rotation matrix that takes vec1 to vec2
getVec2VecRotM = (vec1, vec2) ->
    axis  = cross(vec1, vec2)
    angle = acos(dot(vec1, vec2))
    vec_rotm(-1*angle, axis[0], axis[1], axis[2])

# Slow Canonicalization Algorithm
#
# This algorithm has some convergence problems, what really needs to be done is to
# sum the three forcing factors together as a conherent force and to use a half-decent
# integrator to make sure that it converges well as opposed to the current hack of
# ad-hoc stability multipliers.  Ideally one would implement a conjugate gradient
# descent or similar pretty thing.
#
# Only try to use this on convex polyhedra that have a chance of being canonicalized,
# otherwise it will probably blow up the geometry.  A much trickier / smarter seed-symmetry
# based geometrical regularizer should be used for fancier/weirder polyhedra.
    
# adjusts vertices on edges such that each edge is tangent to an origin sphere
tangentify = (vertices, edges) ->
    # hack to improve convergence
    STABILITY_FACTOR = 0.1
    # copy vertices
    newVs = copyVecArray vertices
    for e in edges
        # the point closest to origin
        t = tangentPoint newVs[e[0]], newVs[e[1]] 
        # adjustment from sphere
        c = mult (1-sqrt(dot(t,t)))*STABILITY_FACTOR/2, t
        newVs[e[0]] = add newVs[e[0]], c
        newVs[e[1]] = add newVs[e[1]], c
    newVs

# recenters entire polyhedron such that center of mass is at origin
recenter = (vertices, edges) ->
    #centers of edges
    edgecenters = edges.map ([a, b]) -> tangentPoint vertices[a], vertices[b]
    polycenter = [0 0 0]
    # sum centers to find center of gravity
    for v in edgecenters
        polycenter = add polycenter, v
    polycenter = mult 1/edges.length, polycenter
    # subtract off any deviation from center
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

# combines above three constraint adjustments in iterative cycle
canonicalize = (poly, Niter) ->
    Niter ?= 1
    console.log "Canonicalizing #{poly.name}..."
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
    console.log "[canonicalization done, last |deltaV|=#{maxChange}]"
    newpoly = new Polyhedron newVs, poly.faces, poly.name
    console.log "canonicalize" newpoly
    newpoly

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

canonicalXYZ = (poly, nIterations) ->
    nIterations ?= 1
    dpoly = dual(poly)
    console.log "Pseudo-canonicalizing #{poly.name}..."
  
    # iteratively reciprocate face normals
    for count in [0...nIterations]
        dpoly.vertices = reciprocalN poly
        poly.vertices  = reciprocalN dpoly
  
    new Polyhedron poly.vertices, poly.faces, poly.name

adjustXYZ = (poly, nIterations) -> # quick planarization
    nIterations ?= 1
    dpoly = dual poly # v's of dual are in order of arg's f's
    console.log "Planarizing #{poly.name}..."
  
    for count in [0...nIterations]
        # reciprocate face centers
        dpoly.vertices = reciprocalC poly
        poly.vertices  = reciprocalC dpoly
  
    new Polyhedron poly.vertices, poly.faces, poly.name

module.exports = 
    rescale:        rescale
    tangentify:     tangentify
    recenter:       recenter
    planarize:      planarize
    canonicalize:   canonicalize
    reciprocalN:    reciprocalN
    reciprocalC:    reciprocalC
    adjustXYZ:      adjustXYZ
    canonicalXYZ:   canonicalXYZ
    add:            add
    sub:            sub
    mult:           mult
    intersect:      intersect
    tangentPoint:   tangentPoint
    