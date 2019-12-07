###
 0000000   00000000   0000000   
000        000       000   000  
000  0000  0000000   000   000  
000   000  000       000   000  
 0000000   00000000   0000000   
###
#
# Polyhédronisme, Copyright 2019, Anselm Levskaya, MIT License
#
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

Polyhedron = require './polyhedron'
{ _ } = require 'kxk'
{ add, sub, dot, mag, mult, unit, normal, orthogonal, reciprocal, edgeDist, tangentPoint, calcCentroid, copyVecArray } = require './math'
{ sqrt } = Math
    
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
    rescale:        rescale
    recenter:       recenter
    planarize:      planarize
    reciprocalN:    reciprocalN
    reciprocalC:    reciprocalC
    tangentify:     tangentify
    