# Polyhédronisme
#===================================================================================================
#
# A toy for constructing and manipulating polyhedra.
#
# Copyright 2019, Anselm Levskaya
# Released under the MIT License
#

_ = require 'lodash'

__range__ = (left, right, inclusive) -> if inclusive then [left..right] else [left...right]

{ add, mult } = require './geo'

# Polyhedra Functions
#=================================================================================================
#
# Topology stored as set of faces.  Each face is list of n vertex indices
# corresponding to one oriented, n-sided face.  Vertices listed clockwise as seen from outside.

faceToEdges = (face) -> # array of edges [v1,v2] for face
    edges = []
    [v1] = face.slice -1
    for v2 in face
        edges.push [v1, v2]
        v1 = v2
    edges

vertColors = (poly) ->
    vertcolors = []
    for [i...poly.faces.length]
        for v in poly.faces[i]
            vertcolors[v] = poly.face_classes[i]
    vertcolors

rwb_palette = ['#ff7777' '#dddddd' '#889999' '#fff0e5' '#aa3333' '#ff0000' '#ffffff' '#aaaaaa']
PALETTE = rwb_palette  # GLOBAL
palette = (n) -> hextofloats PALETTE[n % PALETTE.length]
                     
hextofloats = (hexstr) ->

    if hexstr[0] == "#" then hexstr = hexstr.slice 1

    if hexstr.length == 3
        hexstr.split('').map (c) => parseInt(c+c, 16)/255
    else 
        hexstr.match(/.{2}/g).map (c) => parseInt(c, 16)/255

paintPolyhedron = (poly) -> # Color the faces of the polyhedra for display
    
    poly.face_classes = []
    colormemory = {}
  
    # memoized color assignment to faces of similar areas
    colorassign = (hash, colormemory) ->
        if hash in colormemory
            return colormemory[hash]
        fclr = _.toArray(colormemory).length
        colormemory[hash] = fclr
        fclr
  
    for f in poly.faces

        if COLOR_METHOD == "area" # color by face planar area assuming flatness
            face_verts = f.map (v) -> poly.vertices[v]
            clr = colorassign sigfigs(planararea(face_verts), COLOR_SENSITIVITY), colormemory
        else if COLOR_METHOD == "signature" # color by congruence signature
            face_verts = f.map (v) -> poly.vertices[v]
            clr = colorassign faceSignature(face_verts, COLOR_SENSITIVITY), colormemory
        else # color by face-sidedness
            clr = f.length - 3
        poly.face_classes.push clr

    console.log _.toArray(colormemory).length+" face classes"
    poly

sortfaces = (poly) -> # z sorts faces of poly
    
    # smallestZ = (x) -> _.sortBy(x,(a,b)->a[2]-b[2])[0]
    # closests = (smallestZ(poly.vertices[v] for v in f) for f in poly.faces)
  
    centroids  = poly.centers()
    normals    = poly.normals()
    ray_origin = [0,0, ((persp_z_max * persp_ratio) - persp_z_min)/(1-persp_ratio)]
  
    # sort by binary-space partition: are you on same side as view-origin or not?
    # !!! there is something wrong with @ even triangulated surfaces have artifacts.
    planesort = (a,b) -> -dot(sub(ray_origin,a[0]),a[1]) * dot(sub(b[0],a[0]),a[1])
  
    # sort by centroid z-depth: not correct but more stable heuristic w. weird non-planar "polygons"
    zcentroidsort = (a, b) => a[0][2]-b[0][2]
  
    zsortIndex = _.zip(centroids, normals, [0...poly.faces.length])
        .sort(zcentroidsort)
        .map (x) -> x[2]
  
    # sort all face-associated properties
    poly.faces = zsortIndex.map (idx) -> poly.faces[idx]
    poly.face_classes = zsortIndex.map (idx) -> poly.face_classes[idx]

class polyhedron 

    @: (@name, @faces, @vertices) ->

        @faces    ?= []
        @vertices ?= []
        @name     ?= "null polyhedron"
  
    # return a non-redundant list of the polyhedron's edges
    edges: ->
        uniqEdges = {}
        faceEdges = @faces.map faceToEdges
        for edgeSet in faceEdges
            for e in edgeSet
                if e[0] < e[1]
                  [a, b] = e
                else 
                  [b, a] = e
                uniqEdges["#{a}~#{b}"] = e
        return _.values uniqEdges
      
    centers: -> # array of face centers
        centersArray = []
        for face in @faces
            fcenter = [0 0 0]
            for vidx in face
                fcenter = add fcenter, @vertices[vidx]
            centersArray.push mult 1.0/face.length, fcenter
        centersArray
  
    normals: -> # array of face normals
        normalsArray = []
        for face in @faces
            normalsArray.push normal face.map (vidx) => @vertices[vidx]
        normalsArray
  
    data: ->
        nEdges = (@faces.length + @vertices.length) - 2; # E = V + F - 2
        return "#{@faces.length} faces, #{nEdges} edges, #{@vertices.length} vertices"
        
module.exports.polyhedron = polyhedron

module.exports.tetrahedron = ->
    new polyhedron 'T' [ [0,1,2], [0,2,3], [0,3,1], [1,3,2] ], [ [1.0,1.0,1.0], [1.0,-1.0,-1.0], [-1.0,1.0,-1.0], [-1.0,-1.0,1.0] ]

module.exports.octahedron = ->
    new polyhedron 'O' [ [0,1,2], [0,2,3], [0,3,4], [0,4,1], [1,4,5], [1,5,2], [2,5,3], [3,5,4] ], [ [0,0,1.414], [1.414,0,0], [0,1.414,0], [-1.414,0,0], [0,-1.414,0], [0,0,-1.414] ]

module.exports.cube = ->
    new polyhedron 'C' [ [3,0,1,2], [3,4,5,0], [0,5,6,1], [1,6,7,2], [2,7,4,3], [5,4,7,6] ], [ [0.707,0.707,0.707], [-0.707,0.707,0.707], [-0.707,-0.707,0.707], [0.707,-0.707,0.707], [0.707,-0.707,-0.707], [0.707,0.707,-0.707], [-0.707,0.707,-0.707], [-0.707,-0.707,-0.707] ]

module.exports.icosahedron = ->
    new polyhedron 'I' [ 
            [0,1,2], [0,2,3], [0,3,4], [0,4,5],
            [0,5,1], [1,5,7], [1,7,6], [1,6,2],
            [2,6,8], [2,8,3], [3,8,9], [3,9,4],
            [4,9,10], [4,10,5], [5,10,7], [6,7,11],
            [6,11,8], [7,10,11], [8,11,9], [9,11,10] 
        ],[ 
            [0,0,1.176], [1.051,0,0.526],
            [0.324,1.0,0.525], [-0.851,0.618,0.526],
            [-0.851,-0.618,0.526], [0.325,-1.0,0.526],
            [0.851,0.618,-0.526], [0.851,-0.618,-0.526],
            [-0.325,1.0,-0.526], [-1.051,0,-0.526],
            [-0.325,-1.0,-0.526], [0,0,-1.176] ]

module.exports.dodecahedron = ->
    new polyhedron 'D' [ 
            [0,1,4,7,2], [0,2,6,9,3], [0,3,8,5,1],
            [1,5,11,10,4], [2,7,13,12,6], [3,9,15,14,8]
            [4,10,16,13,7], [5,8,14,17,11], [6,12,18,15,9]
            [10,11,17,19,16], [12,13,16,19,18], [14,15,18,19,17] 
        ],[
            [0,0,1.07047], [0.713644,0,0.797878],
            [-0.356822,0.618,0.797878], [-0.356822,-0.618,0.797878],
            [0.797878,0.618034,0.356822], [0.797878,-0.618,0.356822],
            [-0.934172,0.381966,0.356822], [0.136294,1.0,0.356822],
            [0.136294,-1.0,0.356822], [-0.934172,-0.381966,0.356822],
            [0.934172,0.381966,-0.356822], [0.934172,-0.381966,-0.356822],
            [-0.797878,0.618,-0.356822], [-0.136294,1.0,-0.356822],
            [-0.136294,-1.0,-0.356822], [-0.797878,-0.618034,-0.356822],
            [0.356822,0.618,-0.797878], [0.356822,-0.618,-0.797878],
            [-0.713644,0,-0.797878], [0,0,-1.07047] ]

module.exports.prism = (n) ->

    theta = (2*PI)/n # pie angle
    h = sin theta/2 # half-edge
    poly = new polyhedron "P#{n}"
  
    for i in [0...n] # vertex #'s 0 to n-1 around one face
        poly.vertices.push [-cos(i*theta), -sin(i*theta), -h]
    for i in [0...n] # vertex #'s n to 2n-1 around other
        poly.vertices.push [-cos(i*theta), -sin(i*theta), h]
  
    poly.faces.push __range__ n-1, 0, true  #top
    poly.faces.push __range__ n, 2*n, false #bottom
    for i in [0...n] #n square sides
        poly.faces.push [i, (i+1)%n, ((i+1)%n)+n, i+n]
    adjustXYZ poly, 1

module.exports.antiprism = (n) ->

    theta = (2*PI)/n # pie angle
    h = sqrt 1-(4/((4+(2*cos(theta/2)))-(2*cos(theta))))
    r = sqrt 1-h*h
    f = sqrt h*h + pow r*cos(theta/2), 2
    # correction so edge midpoints (not vertices) on unit sphere
    r = -r/f
    h = -h/f
    poly = new polyhedron "A#{n}"
  
    for i in [0...n] # vertex #'s 0...n-1 around one face
      poly.vertices.push [r * cos(i*theta), r * sin(i*theta), h]
    for i in [0...n] # vertex #'s n...2n-1 around other
      poly.vertices.push [r * cos((i+0.5)*theta), r * sin((i+0.5)*theta), -h]
  
    poly.faces.push __range__ n-1, 0, true   #top
    poly.faces.push __range__ n, (2*n)-1, true #bottom
    for i in [0...n] #2n triangular sides
      poly.faces.push [i, (i+1)%n, i+n]
      poly.faces.push [i, i+n, ((((n+i)-1)%n)+n)]
  
    adjustXYZ poly,1 

module.exports.pyramid = (n) ->

    theta = (2*PI)/n # pie angle
    height = 1
    poly = new polyhedron "Y#{n}"
  
    for i in [0...n] # vertex #'s 0...n-1 around one face
        poly.vertices.push [-cos(i*theta), -sin(i*theta), -0.2]
    poly.vertices.push [0,0, height] # apex
  
    poly.faces.push __range__ n-1, 0, true # base
    for i in [0...n] # n triangular sides
        poly.faces.push [i, (i+1)%n, n]
  
    canonicalXYZ poly, 3

module.exports.cupola = (n, alpha, height) ->

    n ?= 3
    alpha ?= 0.0

    poly = new polyhedron "U#{n}"

    if n < 2 then return poly

    s = 1.0
    # alternative face/height scaling 

    rb = s / 2 / sin(PI / 2 / n)
    rt = s / 2 / sin(PI / n)
    if not height
        height = (rb - rt)
        # set correct height for regularity for n=3,4,5
        if 2 <= n <= 5
            height = s * sqrt(1 - 1 / 4 / sin(PI/n) / sin(PI/n))
    # init 3N vertices
    for i in [0...3*n]
        poly.vertices.push [0,0,0]
        
    # fill vertices
    for i in [0...n]
      poly.vertices[2*i] = [rb * cos(PI*(2*i)/n + PI/2/n+alpha), 
                            rb * sin(PI*(2*i)/n + PI/2/n+alpha),
                            0.0]
      poly.vertices[2*i+1] = [rb * cos(PI*(2*i+1)/n + PI/2/n-alpha), 
                              rb * sin(PI*(2*i+1)/n + PI/2/n-alpha), 
                              0.0]
      poly.vertices[2*n+i] = [rt * cos(2*PI*i/n), 
                              rt * sin(2*PI*i/n), 
                              height]
    
    poly.faces.push __range__ 2*n-1, 0, true # base
    poly.faces.push __range__ 2*n, 3*n-1, true # top
    for i in [0...n] # n triangular sides and n square sides
        poly.faces.push [(2*i+1)%(2*n), (2*i+2)%(2*n), 2*n+(i+1)%n]
        poly.faces.push [2*i, (2*i+1)%(2*n), 2*n+(i+1)%n, 2*n+i]
  
    poly

module.exports.anticupola = (n, alpha, height) ->

    n ?= 3
    alpha ?= 0.0
  
    poly = new polyhedron "U#{n}"
  
    if n < 3 then return poly
  
    s = 1.0
    # alternative face/height scaling 
    rb = s / 2 / sin(PI / 2 / n)
    rt = s / 2 / sin(PI / n)
    if not height
        height = rb - rt
    # init 3N vertices
    for i in [0...3*n]
        poly.vertices.push [0,0,0]

    # fill vertices
    for i in [0...n]
        poly.vertices[2*i] = [rb * cos(PI*(2*i)/n + alpha), 
                              rb * sin(PI*(2*i)/n + alpha),
                              0.0]
        poly.vertices[2*i+1] = [rb * cos(PI*(2*i+1)/n - alpha), 
                                rb * sin(PI*(2*i+1)/n - alpha), 
                                0.0]
        poly.vertices[2*n+i] = [rt * cos(2*PI*i/n), 
                                rt * sin(2*PI*i/n), 
                                height]
    
    poly.faces.push __range__ 2*n-1, 0, true # base
    poly.faces.push __range__ 2*n, 3*n-1, true # top
    
    for i in [0...n] # n triangular sides and n square sides
        poly.faces.push [(2*i)%(2*n), (2*i+1)%(2*n), 2*n+(i)%n]
        poly.faces.push [2*n+(i+1)%n, (2*i+1)%(2*n), (2*i+2)%(2*n)]
        poly.faces.push [2*n+(i+1)%n, 2*n+(i)%n, (2*i+1)%(2*n)]
  
    poly  
    