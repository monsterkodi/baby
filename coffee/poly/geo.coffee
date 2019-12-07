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
{ dual } = require './topo'
{ add, dot, mult, unit, orthogonal, reciprocal, edgeDist } = require './math'
    
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
    {Polyhedron} = require './polyhedron'
    Niter ?= 1
    klog "canonicalize #{poly.name}"
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
    klog "[canonicalization done, last |deltaV|=#{maxChange}]"
    newpoly = new Polyhedron poly.name, poly.faces, newVs
    klog "canonicalize" newpoly
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
    dpoly = dual poly
    # klog "canonicalXYZ #{poly.name}"
  
    for count in [0...nIterations] # reciprocate face normals
        dpoly.vertices = reciprocalN poly
        poly.vertices  = reciprocalN dpoly
  
    new Polyhedron poly.name, poly.faces, poly.vertices

adjustXYZ = (poly, nIterations) -> # quick planarization
    
    nIterations ?= 1
    dpoly = dual poly # v's of dual are in order of arg's f's
    # klog "adjustXYZ #{poly.name}"
  
    for count in [0...nIterations] # reciprocate face centers
        dpoly.vertices = reciprocalC poly
        poly.vertices  = reciprocalC dpoly
  
    new Polyhedron poly.name, poly.faces, poly.vertices

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
    