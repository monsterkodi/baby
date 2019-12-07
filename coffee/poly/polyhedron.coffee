# Polyhédronisme
#===================================================================================================
#
# A toy for constructing and manipulating polyhedra.
#
# Copyright 2019, Anselm Levskaya
# Released under the MIT License

{ _ } = require 'kxk'
{ add, mult } = require './geo'

# 00000000    0000000   000      000   000  000   000  00000000  0000000    00000000    0000000   000   000  
# 000   000  000   000  000       000 000   000   000  000       000   000  000   000  000   000  0000  000  
# 00000000   000   000  000        00000    000000000  0000000   000   000  0000000    000   000  000 0 000  
# 000        000   000  000         000     000   000  000       000   000  000   000  000   000  000  0000  
# 000         0000000   0000000     000     000   000  00000000  0000000    000   000   0000000   000   000  

class Polyhedron 

    @: (@name, @faces, @vertices) ->

        @faces    ?= [] # vertices listed clockwise as seen from outside.
        @vertices ?= [] 
        @name     ?= "null polyhedron"
  
    faceToEdges: (face) -> # array of edges [v1,v2] for face
        edges = []
        [v1] = face.slice -1
        for v2 in face
            edges.push [v1, v2]
            v1 = v2
        edges
        
    edges: ->
        uniqEdges = {}
        faceEdges = @faces.map @faceToEdges
        for edgeSet in faceEdges
            for e in edgeSet
                if e[0]<e[1] then [a, b] = e
                else              [b, a] = e
                uniqEdges["#{a}~#{b}"] = e
        _.values uniqEdges
      
    centers: -> 
        centersArray = []
        for face in @faces
            fcenter = [0 0 0]
            for vidx in face
                fcenter = add fcenter, @vertices[vidx]
            centersArray.push mult 1.0/face.length, fcenter
        centersArray
  
    normals: -> 
        normalsArray = []
        for face in @faces
            normalsArray.push normal face.map (vidx) => @vertices[vidx]
        normalsArray
  
    data: ->
        nEdges = (@faces.length + @vertices.length) - 2; # E = V + F - 2
        "#{@faces.length} faces, #{nEdges} edges, #{@vertices.length} vertices"
        
    colorize: (method='sidedness') -> # assign color indices to faces
        
        @colors = []
        colormemory = {}
        colorassign = (hash) -> colormemory[hash] ?= _.size colormemory
      
        for f in @faces
            switch method
                when 'area' # color by face planar area assuming flatness
                    face_verts = f.map (v) => @vertices[v]
                    clr = colorassign sigfigs planararea(face_verts), 2
                when 'signature' # color by congruence signature
                    face_verts = f.map (v) => @vertices[v]
                    clr = colorassign faceSignature face_verts, 2
                else # color by face-sidedness
                    clr = f.length - 3
            @colors.push clr
    
        # klog "#{_.size(colormemory)+1} colors:" @colors
        @

# 00000000   000       0000000   000000000   0000000   000   000  000   0000000    
# 000   000  000      000   000     000     000   000  0000  000  000  000         
# 00000000   000      000000000     000     000   000  000 0 000  000  000         
# 000        000      000   000     000     000   000  000  0000  000  000         
# 000        0000000  000   000     000      0000000   000   000  000   0000000    
        
tetrahedron = ->
    new Polyhedron 'T' [ [0,1,2], [0,2,3], [0,3,1], [1,3,2] ], [ [1.0,1.0,1.0], [1.0,-1.0,-1.0], [-1.0,1.0,-1.0], [-1.0,-1.0,1.0] ]

octahedron = ->
    new Polyhedron 'O' [ [0,1,2], [0,2,3], [0,3,4], [0,4,1], [1,4,5], [1,5,2], [2,5,3], [3,5,4] ], [ [0,0,1.414], [1.414,0,0], [0,1.414,0], [-1.414,0,0], [0,-1.414,0], [0,0,-1.414] ]

cube = ->
    new Polyhedron 'C' [ [3,0,1,2], [3,4,5,0], [0,5,6,1], [1,6,7,2], [2,7,4,3], [5,4,7,6] ], [ [0.707,0.707,0.707], [-0.707,0.707,0.707], [-0.707,-0.707,0.707], [0.707,-0.707,0.707], [0.707,-0.707,-0.707], [0.707,0.707,-0.707], [-0.707,0.707,-0.707], [-0.707,-0.707,-0.707] ]

icosahedron = ->
    new Polyhedron 'I' [ 
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

dodecahedron = ->
    new Polyhedron 'D' [ 
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

# 00000000   00000000   000   0000000  00     00  
# 000   000  000   000  000  000       000   000  
# 00000000   0000000    000  0000000   000000000  
# 000        000   000  000       000  000 0 000  
# 000        000   000  000  0000000   000   000  

prism = (n) ->

    theta = (2*PI)/n # pie angle
    h = sin theta/2 # half-edge
    poly = new Polyhedron "P#{n}"
  
    for i in [0...n] # vertex #'s 0 to n-1 around one face
        poly.vertices.push [-cos(i*theta), -sin(i*theta), -h]
    for i in [0...n] # vertex #'s n to 2n-1 around other
        poly.vertices.push [-cos(i*theta), -sin(i*theta), h]
  
    poly.faces.push [n-1..0]  # top
    poly.faces.push [n...2*n] # bottom
    for i in [0...n] #n square sides
        poly.faces.push [i, (i+1)%n, ((i+1)%n)+n, i+n]
    adjustXYZ poly, 1

#  0000000   000   000  000000000  000  00000000   00000000   000   0000000  00     00  
# 000   000  0000  000     000     000  000   000  000   000  000  000       000   000  
# 000000000  000 0 000     000     000  00000000   0000000    000  0000000   000000000  
# 000   000  000  0000     000     000  000        000   000  000       000  000 0 000  
# 000   000  000   000     000     000  000        000   000  000  0000000   000   000  

antiprism = (n) ->

    theta = (2*PI)/n # pie angle
    h = sqrt 1-(4/((4+(2*cos(theta/2)))-(2*cos(theta))))
    r = sqrt 1-h*h
    f = sqrt h*h + pow r*cos(theta/2), 2
    # correction so edge midpoints (not vertices) on unit sphere
    r = -r/f
    h = -h/f
    poly = new Polyhedron "A#{n}"
  
    for i in [0...n] # vertex #'s 0...n-1 around one face
      poly.vertices.push [r * cos(i*theta), r * sin(i*theta), h]
    for i in [0...n] # vertex #'s n...2n-1 around other
      poly.vertices.push [r * cos((i+0.5)*theta), r * sin((i+0.5)*theta), -h]
  
    poly.faces.push [n-1..0]     # top
    poly.faces.push [n..(2*n)-1] # bottom
    for i in [0...n] # 2n triangular sides
      poly.faces.push [i, (i+1)%n, i+n]
      poly.faces.push [i, i+n, ((((n+i)-1)%n)+n)]
  
    adjustXYZ poly,1 

# 00000000   000   000  00000000    0000000   00     00  000  0000000    
# 000   000   000 000   000   000  000   000  000   000  000  000   000  
# 00000000     00000    0000000    000000000  000000000  000  000   000  
# 000           000     000   000  000   000  000 0 000  000  000   000  
# 000           000     000   000  000   000  000   000  000  0000000    

pyramid = (n) ->

    theta = (2*PI)/n # pie angle
    height = 1
    poly = new Polyhedron "Y#{n}"
  
    for i in [0...n] # vertex #'s 0...n-1 around one face
        poly.vertices.push [-cos(i*theta), -sin(i*theta), -0.2]
    poly.vertices.push [0 0 height] # apex
  
    poly.faces.push [n-1..0] # base
    for i in [0...n] # n triangular sides
        poly.faces.push [i, (i+1)%n, n]
  
    canonicalXYZ poly, 3

#  0000000  000   000  00000000    0000000   000       0000000   
# 000       000   000  000   000  000   000  000      000   000  
# 000       000   000  00000000   000   000  000      000000000  
# 000       000   000  000        000   000  000      000   000  
#  0000000   0000000   000         0000000   0000000  000   000  

cupola = (n, alpha, height) ->

    n ?= 3
    alpha ?= 0.0

    poly = new Polyhedron "U#{n}"

    if n < 2 then return poly

    s = 1.0
    rb = s / 2 / sin(PI / 2 / n)
    rt = s / 2 / sin(PI / n)
    if not height
        height = (rb - rt)
        if 2 <= n <= 5 # set correct height for regularity for n=3,4,5
            height = s * sqrt(1 - 1 / 4 / sin(PI/n) / sin(PI/n))

    for i in [0...3*n]
        poly.vertices.push [0,0,0]
        
    for i in [0...n]
      poly.vertices[2*i  ] = [rb * cos(PI*(2*i)/n + PI/2/n+alpha), rb * sin(PI*(2*i)/n + PI/2/n+alpha), 0.0]
      poly.vertices[2*i+1] = [rb * cos(PI*(2*i+1)/n + PI/2/n-alpha), rb * sin(PI*(2*i+1)/n + PI/2/n-alpha), 0.0]
      poly.vertices[2*n+i] = [rt * cos(2*PI*i/n), rt * sin(2*PI*i/n), height]
    
    poly.faces.push [2*n-1..0]   # base
    poly.faces.push [2*n..3*n-1] # top
    for i in [0...n] # n triangular sides and n square sides
        poly.faces.push [(2*i+1)%(2*n), (2*i+2)%(2*n), 2*n+(i+1)%n]
        poly.faces.push [2*i, (2*i+1)%(2*n), 2*n+(i+1)%n, 2*n+i]
  
    poly

#  0000000   000   000  000000000  000   0000000  000   000  00000000    0000000   000       0000000   
# 000   000  0000  000     000     000  000       000   000  000   000  000   000  000      000   000  
# 000000000  000 0 000     000     000  000       000   000  00000000   000   000  000      000000000  
# 000   000  000  0000     000     000  000       000   000  000        000   000  000      000   000  
# 000   000  000   000     000     000   0000000   0000000   000         0000000   0000000  000   000  

anticupola = (n, alpha, height) ->

    n ?= 3
    alpha ?= 0.0
  
    poly = new Polyhedron "U#{n}"
  
    if n < 3 then return poly
  
    s = 1.0
    rb = s / 2 / sin PI / 2 / n
    rt = s / 2 / sin PI / n
    
    if not height
        height = rb - rt

    for i in [0...3*n]
        poly.vertices.push [0,0,0]

    for i in [0...n] # fill vertices
        poly.vertices[2*i  ] = [rb * cos(PI*(2*i)/n + alpha), rb * sin(PI*(2*i)/n + alpha), 0.0]
        poly.vertices[2*i+1] = [rb * cos(PI*(2*i+1)/n - alpha), rb * sin(PI*(2*i+1)/n - alpha), 0.0]
        poly.vertices[2*n+i] = [rt * cos(2*PI*i/n), rt * sin(2*PI*i/n), height]
    
    poly.faces.push [2*n-1..0]   # base
    poly.faces.push [2*n..3*n-1] # top
    
    for i in [0...n] # n triangular sides and n square sides
        poly.faces.push [(2*i)%(2*n), (2*i+1)%(2*n), 2*n+(i)%n]
        poly.faces.push [2*n+(i+1)%n, (2*i+1)%(2*n), (2*i+2)%(2*n)]
        poly.faces.push [2*n+(i+1)%n, 2*n+(i)%n, (2*i+1)%(2*n)]
  
    poly  
    
# 00000000  000   000  00000000    0000000   00000000   000000000   0000000  
# 000        000 000   000   000  000   000  000   000     000     000       
# 0000000     00000    00000000   000   000  0000000       000     0000000   
# 000        000 000   000        000   000  000   000     000          000  
# 00000000  000   000  000         0000000   000   000     000     0000000   

module.exports =
    
    Polyhedron:   Polyhedron
    cube:         cube
    octahedron:   octahedron
    tetrahedron:  tetrahedron
    icosahedron:  icosahedron
    dodecahedron: dodecahedron
    prism:        prism
    cupola:       cupola
    pyramid:      pyramid
    antiprism:    antiprism
    anticupola:   anticupola
