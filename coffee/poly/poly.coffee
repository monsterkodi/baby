###
00000000    0000000   000      000   000
000   000  000   000  000       000 000 
00000000   000   000  000        00000  
000        000   000  000         000   
000         0000000   0000000     000   
###

# Polyhédronisme, Copyright 2019, Anselm Levskaya, MIT License

{ add, mult, normal } = require './math'
{ canonicalXYZ, flatten } = require './topo'
{ PI, cos, pow, sin, sqrt } = Math
Polyhedron = require './polyhedron'

# 000000000  00000000  000000000  00000000    0000000 
#    000     000          000     000   000  000   000
#    000     0000000      000     0000000    000000000
#    000     000          000     000   000  000   000
#    000     00000000     000     000   000  000   000

tetrahedron = ->
    new Polyhedron 'T' [ [0,1,2], [0,2,3], [0,3,1], [1,3,2] ], [ [1.0,1.0,1.0], [1.0,-1.0,-1.0], [-1.0,1.0,-1.0], [-1.0,-1.0,1.0] ]

#  0000000  000   000  0000000    00000000  
# 000       000   000  000   000  000       
# 000       000   000  0000000    0000000   
# 000       000   000  000   000  000       
#  0000000   0000000   0000000    00000000  

cube = ->
    new Polyhedron 'C' [ [3,0,1,2], [3,4,5,0], [0,5,6,1], [1,6,7,2], [2,7,4,3], [5,4,7,6] ], [ [0.707,0.707,0.707], [-0.707,0.707,0.707], [-0.707,-0.707,0.707], [0.707,-0.707,0.707], [0.707,-0.707,-0.707], [0.707,0.707,-0.707], [-0.707,0.707,-0.707], [-0.707,-0.707,-0.707] ]

#  0000000    0000000  000000000   0000000   
# 000   000  000          000     000   000  
# 000   000  000          000     000000000  
# 000   000  000          000     000   000  
#  0000000    0000000     000     000   000  

octahedron = ->
    new Polyhedron 'O' [ [0,1,2], [0,2,3], [0,3,4], [0,4,1], [1,4,5], [1,5,2], [2,5,3], [3,5,4] ], [ [0,0,1.414], [1.414,0,0], [0,1.414,0], [-1.414,0,0], [0,-1.414,0], [0,0,-1.414] ]

# 000   0000000   0000000    0000000   0000000   
# 000  000       000   000  000       000   000  
# 000  000       000   000  0000000   000000000  
# 000  000       000   000       000  000   000  
# 000   0000000   0000000   0000000   000   000  

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

# 0000000     0000000   0000000    00000000   0000000   0000000   
# 000   000  000   000  000   000  000       000       000   000  
# 000   000  000   000  000   000  0000000   000       000000000  
# 000   000  000   000  000   000  000       000       000   000  
# 0000000     0000000   0000000    00000000   0000000  000   000  

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
        poly.vertex.push [-cos(i*theta), -sin(i*theta), -h]
    for i in [0...n] # vertex #'s n to 2n-1 around other
        poly.vertex.push [-cos(i*theta), -sin(i*theta), h]
  
    poly.face.push [n-1..0]  # top
    poly.face.push [n...2*n] # bottom
    for i in [0...n] #n square sides
        poly.face.push [i, (i+1)%n, ((i+1)%n)+n, i+n]
    flatten poly, 1

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
      poly.vertex.push [r * cos(i*theta), r * sin(i*theta), h]
    for i in [0...n] # vertex #'s n...2n-1 around other
      poly.vertex.push [r * cos((i+0.5)*theta), r * sin((i+0.5)*theta), -h]
  
    poly.face.push [n-1..0]     # top
    poly.face.push [n..(2*n)-1] # bottom
    for i in [0...n] # 2n triangular sides
      poly.face.push [i, (i+1)%n, i+n]
      poly.face.push [i, i+n, ((((n+i)-1)%n)+n)]
  
    flatten poly,1 

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
        poly.vertex.push [-cos(i*theta), -sin(i*theta), -0.2]
    poly.vertex.push [0 0 height] # apex
  
    poly.face.push [n-1..0] # base
    for i in [0...n] # n triangular sides
        poly.face.push [i, (i+1)%n, n]
  
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
        poly.vertex.push [0,0,0]
        
    for i in [0...n]
      poly.vertex[2*i  ] = [rb * cos(PI*(2*i)/n + PI/2/n+alpha), rb * sin(PI*(2*i)/n + PI/2/n+alpha), 0.0]
      poly.vertex[2*i+1] = [rb * cos(PI*(2*i+1)/n + PI/2/n-alpha), rb * sin(PI*(2*i+1)/n + PI/2/n-alpha), 0.0]
      poly.vertex[2*n+i] = [rt * cos(2*PI*i/n), rt * sin(2*PI*i/n), height]
    
    poly.face.push [2*n-1..0]   # base
    poly.face.push [2*n..3*n-1] # top
    for i in [0...n] # n triangular sides and n square sides
        poly.face.push [(2*i+1)%(2*n), (2*i+2)%(2*n), 2*n+(i+1)%n]
        poly.face.push [2*i, (2*i+1)%(2*n), 2*n+(i+1)%n, 2*n+i]
  
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
        poly.vertex.push [0,0,0]

    for i in [0...n] # fill vertices
        poly.vertex[2*i  ] = [rb * cos(PI*(2*i)/n + alpha), rb * sin(PI*(2*i)/n + alpha), 0.0]
        poly.vertex[2*i+1] = [rb * cos(PI*(2*i+1)/n - alpha), rb * sin(PI*(2*i+1)/n - alpha), 0.0]
        poly.vertex[2*n+i] = [rt * cos(2*PI*i/n), rt * sin(2*PI*i/n), height]
    
    poly.face.push [2*n-1..0]   # base
    poly.face.push [2*n..3*n-1] # top
    
    for i in [0...n] # n triangular sides and n square sides
        poly.face.push [(2*i)%(2*n), (2*i+1)%(2*n), 2*n+(i)%n]
        poly.face.push [2*n+(i+1)%n, (2*i+1)%(2*n), (2*i+2)%(2*n)]
        poly.face.push [2*n+(i+1)%n, 2*n+(i)%n, (2*i+1)%(2*n)]
  
    poly  
    
# 00000000  000   000  00000000    0000000   00000000   000000000   0000000  
# 000        000 000   000   000  000   000  000   000     000     000       
# 0000000     00000    00000000   000   000  0000000       000     0000000   
# 000        000 000   000        000   000  000   000     000          000  
# 00000000  000   000  000         0000000   000   000     000     0000000   

module.exports =
    
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
