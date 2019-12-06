# Polyhédronisme
#==================================================================================================
# A toy for constructing and manipulating polyhedra and other meshes
# Includes implementation of the conway polyhedral operators derived
# from code by mathematician and mathematical sculptor
# George W. Hart http:#www.georgehart.com/
# Copyright 2019, Anselm Levskaya
# Released under the MIT License


# Math / Vector / Matrix Functions
#==================================================================================================

{ random, round, floor, sqrt, sin, cos, tan, asin, acos, atan, abs, pow, log, PI, LN10 } = Math

log10 = (x) -> log(x)/LN10

# returns string w. nsigs digits ignoring magnitude
sigfigs = (N, nsigs) ->
  mantissa = N / pow 10, floor log10 N
  truncated_mantissa = round mantissa * pow 10, nsigs-1
  return "#{truncated_mantissa}"

# general recursive deep-copy function
clone = (obj) -> 
    if not obj or typeof(obj) != 'object'
        return obj
    newInstance = new obj.constructor()
    for key of obj 
        newInstance[key] = clone obj[key]
    newInstance

# often useful
randomchoice = (array) ->
    array[floor random()*array.length]

# 3d scalar multiplication
mult = (c, vec) -> 
  [c*vec[0], c*vec[1], c*vec[2]]

# 3d element-wise multiply
_mult = (vec1, vec2) -> 
  [vec1[0]*vec2[0], vec1[1]*vec2[1], vec1[2]*vec2[2]]

# 3d vector addition
add = (vec1, vec2) -> 
  [vec1[0]+vec2[0], vec1[1]+vec2[1], vec1[2]+vec2[2]]

# 3d vector subtraction
sub = (vec1, vec2) -> 
  [vec1[0]-vec2[0], vec1[1]-vec2[1], vec1[2]-vec2[2]]

# 3d dot product
dot = (vec1, vec2) -> 
  (vec1[0]*vec2[0]) + (vec1[1]*vec2[1]) + (vec1[2]*vec2[2])

# 3d cross product d1 x d2
cross = (d1, d2) -> 
  [(d1[1]*d2[2]) - (d1[2]*d2[1]) 
   (d1[2]*d2[0]) - (d1[0]*d2[2])  
   (d1[0]*d2[1]) - (d1[1]*d2[0])]

# vector norm
mag = (vec) -> sqrt dot vec, vec

# vector magnitude squared
mag2 = (vec) -> dot vec, vec

# makes vector unit length
unit = (vec) -> mult 1/sqrt(mag2(vec)), vec

# midpoint between vec1, vec2
midpoint = (vec1, vec2) => mult(1/2.0, add(vec1, vec2))

# parametric segment between vec1, vec2 w. parameter t ranging from 0 to 1
tween = (vec1, vec2, t) => 
  [((1-t)*vec1[0]) + (t*vec2[0]) 
   ((1-t)*vec1[1]) + (t*vec2[1]) 
   ((1-t)*vec1[2]) + (t*vec2[2])]

# uses above to go one-third of the way along vec1->vec2 line
oneThird = (vec1, vec2) => tween(vec1, vec2, 1/3.0)

# reflect 3vec in unit sphere, spherical reciprocal
reciprocal = (vec) -> mult(1.0 / mag2(vec), vec)

# point where line v1...v2 tangent to an origin sphere
tangentPoint = (v1, v2) ->
  d = sub v2, v1
  sub v1, mult dot(d, v1)/mag2(d), d

# distance of line v1...v2 to origin
edgeDist = (v1, v2) -> sqrt mag2 tangentPoint v1, v2

# square of distance from point v3 to line segment v1...v2
# http:#mathworld.wolfram.com/Point-LineDistance3-Dimensional.html
# calculates min distance from 
# point v3 to finite line segment between v1 and v2
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
# -- do the below algos assume this be normalized or not?
orthogonal = (v1,v2,v3) ->
    # adjacent edge vectors
    d1 = sub v2, v1
    d2 = sub v3, v2
    # cross product
    cross d1, d2

# find first element common to 3 sets by brute force search
intersect = (set1, set2, set3) ->
    for s1 in set1
        for s2 in set2
            if s1 == s2
                for s3 in set3
                    if s1 == s3
                        return s1
    null # empty intersection

# calculate centroid of array of vertices
calcCentroid = (vertices) ->
    # running sum of vertex coords
    centroidV = [0,0,0]
    for v in vertices
        centroidV = add centroidV, v
    mult 1 / vertices.length, centroidV 

# calculate average normal vector for array of vertices
normal = (vertices) ->
    # running sum of normal vectors
    normalV = [0,0,0] 
    [v1, v2] = vertices.slice -2
    for v3 in vertices
        normalV = add normalV, orthogonal v1, v2, v3
        [v1, v2] = [v2, v3]
    # shift over one
    unit(normalV)

# calculates area planar face by summing over subtriangle areas
# this assumes planarity.
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
    sig = ""
    for x in cross_array 
        sig += sigfigs x, sensitivity
    # hack to make reflected faces share the same signature
    for x in cross_array.reverse() 
        sig += sigfigs x, sensitivity
    sig

# projects 3d polyhedral face to 2d polygon
# for triangulation and face display
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

eye3 = [[1,0,0], [0,1,0], [0,0,1]]

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
        [x, y, z] = [0, 0, 1]
    
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

module.exports = 
    add:add
    sub:sub
    mult:mult
    