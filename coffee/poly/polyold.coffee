###
00000000    0000000   000      000   000
000   000  000   000  000       000 000 
00000000   000   000  000        00000  
000        000   000  000         000   
000         0000000   0000000     000   
###

{ klog } = require 'kxk'

Vect = require '../vect'
Quat = require '../quat'

sqrt = Math.sqrt
ϕ = (sqrt(5)-1)/2
        
class Poly
        
    # 000   000  00000000  000   0000000   000   000  0000000     0000000   00000000    0000000  
    # 0000  000  000       000  000        000   000  000   000  000   000  000   000  000       
    # 000 0 000  0000000   000  000  0000  000000000  0000000    000   000  0000000    0000000   
    # 000  0000  000       000  000   000  000   000  000   000  000   000  000   000       000  
    # 000   000  00000000  000   0000000   000   000  0000000     0000000   000   000  0000000   
    
    @neighbors: (poly) ->

        neighbors = ([] for v in poly.vertex)
        for face in poly.face
            for vi in [0...face.length]
                ni = (vi+1) % face.length
                if face[ni] not in neighbors[face[vi]]
                    neighbors[face[vi]].push face[ni]
                if face[vi] not in neighbors[face[ni]]
                    neighbors[face[ni]].push face[vi]          
              
        for vi in [0...neighbors.length]
            toVertex = new Vect poly.vertex[vi]
            toVertex.normalize()
            toN0 = new Vect poly.vertex[neighbors[vi][0]]
            perp = toVertex.crossed toN0
            neighbors[vi].sort (a,b) ->
                aa = Vect.GetAngleBetweenVectors perp, new Vect(poly.vertex[a]), toVertex
                bb = Vect.GetAngleBetweenVectors perp, new Vect(poly.vertex[b]), toVertex
                aa - bb
                    
        neighbors
     
    # 0000000    000   000  00     00  00000000   
    # 000   000  000   000  000   000  000   000  
    # 000   000  000   000  000000000  00000000   
    # 000   000  000   000  000 0 000  000        
    # 0000000     0000000   000   000  000        
    
    @dump: (poly) ->
        
        # klog 'neighbors: [' + poly.neighbors.map((n) -> '[' + n.map((d)->"#{d}").join(' ') + ']').join(' ') + ']'
        @dumpNeighbors poly.neighbors
        klog 'face: [' + poly.face.map((n) -> '[' + n.map((d)->"#{d}").join(' ') + ']').join(' ') + ']'
        klog 'vertex: ['  + poly.vertex.map((n) -> '[' + n.map((d)->"#{d}").join(' ') + ']').join(' ') + ']'
        
    @dumpNeighbors: (neighbors) ->
        
        klog 'neighbors: [' + neighbors.map((n) -> '[' + n.map((d)->"#{d}").join(' ') + ']').join(' ') + ']'
        
    # 000   000  00000000  00000000   000000000  00000000  000   000  
    # 000   000  000       000   000     000     000        000 000   
    #  000 000   0000000   0000000       000     0000000     00000    
    #    000     000       000   000     000     000        000 000   
    #     0      00000000  000   000     000     00000000  000   000  
    
    @vertex: (poly, vi) ->
        
        new Vect poly.vertex[vi][0], poly.vertex[vi][1], poly.vertex[vi][2]
                
    @vertexNormal: (poly, vi) ->
         
        sum = new Vector3 0 0 0
        for ni in poly.neighbors[vi]
            sum.addInPlace @edge poly, vi, ni
        sum.normalize()
        sum
        
    # 00000000  0000000     0000000   00000000  
    # 000       000   000  000        000       
    # 0000000   000   000  000  0000  0000000   
    # 000       000   000  000   000  000       
    # 00000000  0000000     0000000   00000000  
    
    @edge: (poly, v1, v2) ->
        
        @vertex(poly, v2).subtract @vertex(poly, v1)
    
    @edgeNormal: (poly, v1, v2) ->
        
        @vertexNormal(poly, v1).add(@vertexNormal(poly, v2)).scale(0.5)
        
    # 000000000  00000000   000   000  000   000   0000000   0000000   000000000  00000000  
    #    000     000   000  000   000  0000  000  000       000   000     000     000       
    #    000     0000000    000   000  000 0 000  000       000000000     000     0000000   
    #    000     000   000  000   000  000  0000  000       000   000     000     000       
    #    000     000   000   0000000   000   000   0000000  000   000     000     00000000  
    
    @truncate: (poly, factor=ϕ) ->

        edgeMap = {}
        
        numFaces = poly.face.length
        numVertices = poly.vertex.length
        
        edge0 = @edge poly, 0, poly.neighbors[0][0]
        depth = 0.5 * factor * edge0.length() 
        
        for vertexIndex in [0...numVertices]
            
            edgeMap[vertexIndex] ?= {}
            face = []
            
            nl = poly.neighbors[vertexIndex].length
            for ii in [0...nl]
                ni = poly.neighbors[vertexIndex][ii]
                edgeMap[vertexIndex][ni] = poly.vertex.length
                vp = @edge poly, vertexIndex, ni
                vp.normalize()
                vp.scaleInPlace depth
                vp.addInPlace @vertex poly, vertexIndex
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
            
        poly.neighbors = @neighbors poly
        poly
        
    # 000000000  00000000  000000000  00000000    0000000 
    #    000     000          000     000   000  000   000
    #    000     0000000      000     0000000    000000000
    #    000     000          000     000   000  000   000
    #    000     00000000     000     000   000  000   000
    
    @tetrahedron: ->
    
        neighbors:  [[1 2 3] [2 0 3] [3 0 1] [1 0 2]]        
        face:       [[0 1 2] [0 2 3] [0 3 1] [3 2 1]]
        vertex:[
            [0 1 0]
            [0 -1 -sqrt(8/9)*1.5] 
            [-sqrt(2/3)*1.5 -1 sqrt(2/9)*1.5] 
            [sqrt(2/3)*1.5 -1 sqrt(2/9)*1.5]
        ]
        
    #  0000000  000   000  0000000    00000000  
    # 000       000   000  000   000  000       
    # 000       000   000  0000000    0000000   
    # 000       000   000  000   000  000       
    #  0000000   0000000   0000000    00000000  
    
    @cube: ->
        
        neighbors:  [[1 3 4] [0 7 2] [1 6 3] [2 5 0] [5 7 0] [4 3 6] [5 2 7] [6 1 4]]
        face:       [[0 1 2 3] [4 5 6 7] [1 0 4 7] [0 3 5 4] [3 2 6 5] [2 1 7 6]]
        vertex:     [[1 1 -1] [1 -1 -1] [-1 -1 -1] [-1 1 -1] [1 1 1] [-1 1 1] [-1 -1 1] [1 -1 1]]
        
    #  0000000    0000000  000000000   0000000   
    # 000   000  000          000     000   000  
    # 000   000  000          000     000000000  
    # 000   000  000          000     000   000  
    #  0000000    0000000     000     000   000  
    
    @octahedron: ->
        
        neighbors:  [[4 1 2 3] [2 0 4 5] [0 1 5 3] [0 2 5 4] [0 3 5 1] [3 2 1 4]]
        face:       [[0 1 2] [0 2 3] [0 3 4] [0 4 1] [5 2 1] [5 3 2] [5 4 3] [5 1 4]]
        vertex:     [[0 1 0] [-1 0 0] [0 0 1] [1 0 0] [0 0 -1] [0 -1 0]]
        
    # 0000000     0000000   0000000    00000000   0000000   0000000 
    # 000   000  000   000  000   000  000       000       000   000
    # 000   000  000   000  000   000  0000000   000       000000000
    # 000   000  000   000  000   000  000       000       000   000
    # 0000000     0000000   0000000    00000000   0000000  000   000
    
    @dodecahedron: (h=ϕ) ->
        
        s = ϕ*(1)
        b = ϕ*(1+h)
        a = ϕ*(1-h*h)

        neighbors: [[12 8 16] [12 19 9] [9 18 15] [15 17 8] [11 13 16] [19 13 10] [10 14 18] [17 14 11] [9 3 0] [1 2 8] [5 11 6] [7 10 4] [0 13 1] [12 4 5] [15 6 7] [2 14 3] [17 4 0] [3 7 16] [19 6 2] [1 5 18]]
        face:  [[0 12 1 9 8] [8 9 2 15 3] 
                [9 1 19 18 2] [18 19 5 10 6] [8 3 17 16 0] [16 17 7 11 4]
                [14 15 2 18 6] [17 3 15 14 7] [12 13 5 19 1] [0 16 4 13 12]
                [10 11 7 14 6] [5 13 4 11 10]
                ]
        vertex:[ 
            [ s,  s,  s] #_0
            [ s,  s, -s] # 1
            [-s,  s, -s] # 2
            [-s,  s,  s] # 3
            [ s, -s,  s] # 4
            [ s, -s, -s] # 5
            [-s, -s, -s] # 6
            [-s, -s,  s] # 7
            [ 0,  b,  a] # 8
            [ 0,  b, -a] # 9
            [ 0, -b, -a] # 10
            [ 0, -b,  a] # 11
            [ b,  a,  0] # 12
            [ b, -a,  0] # 13
            [-b, -a,  0] # 14
            [-b,  a,  0] # 15
            [ a,  0,  b] # 16
            [-a,  0,  b] # 17
            [-a,  0, -b] # 18
            [ a,  0, -b] # 19
        ]

    # 000   0000000   0000000    0000000   0000000   
    # 000  000       000   000  000       000   000  
    # 000  000       000   000  0000000   000000000  
    # 000  000       000   000       000  000   000  
    # 000   0000000   0000000   0000000   000   000  
    
    @icosahedron: ->
                
        neighbors: [[8 4 1 7 9] [0 4 11 10 7] [5 3 6 10 11] [6 2 5 8 9] [1 0 8 5 11] [3 2 11 4 8] [2 3 9 7 10] [0 1 10 6 9] [0 9 3 5 4] [8 0 7 6 3] [1 11 2 6 7] [10 1 4 5 2]]
        face: [
            [0 4 1] [0 1 7] [1 11 10] [0 9 8]
            [1 10 7] [0 7 9] [0 8 4] [1 4 11]   
            [2 3 6] [2 5 3] [2 10 11] [3 8 9]
            [2 6 10] [3 9 6] [3 5 8] [2 11 5]
            [6 7 10] [7 6 9] [4 5 11] [5 4 8]
        ]
        vertex: [ 
            [ 0  1  ϕ]
            [ 0  1 -ϕ]
            [ 0 -1 -ϕ]
            [ 0 -1  ϕ]
            [ 1  ϕ, 0]
            [ 1 -ϕ, 0]
            [-1 -ϕ, 0]
            [-1  ϕ, 0]
            [ ϕ, 0  1]
            [-ϕ, 0  1]
            [-ϕ, 0 -1]
            [ ϕ, 0 -1]
        ]
        
    #  0000000  000   000  0000000     0000000    0000000  000000000   0000000 
    # 000       000   000  000   000  000   000  000          000     000   000
    # 000       000   000  0000000    000   000  000          000     000000000
    # 000       000   000  000   000  000   000  000          000     000   000
    #  0000000   0000000   0000000     0000000    0000000     000     000   000

    @cuboctahedron: ->
        
        neighbors:  [[1 8 11 3] [2 9 8 0] [3 10 9 1] [10 2 0 11] [8 5 7 11] [4 8 9 6] [5 9 10 7] [6 10 11 4] [0 1 5 4] [1 2 6 5] [2 3 7 6] [4 7 3 0]]
        face:       [[3 2 1 0] [4 5 6 7] [0 8 4 11] [1 9 5 8] [2 10 6 9] [3 11 7 10] [0 11 3] [0 1 8] [1 2 9] [2 3 10] [4 8 5] [5 9 6] [6 10 7] [7 11 4]]
        vertex:     [[1 1 0] [0 1 1] [-1 1 0] [0 1 -1] [1 -1 0] [0 -1 1] [-1 -1 0] [0 -1 -1] [1 0 1] [-1 0 1] [-1 0 -1] [1 0 -1]]
           
    @icosidodecahedron: ->
        
        neighbors: [[38 26 1 2] [50 2 0 25] [49 36 0 1] [57 4 5 37] [27 5 3 59] [38 3 4 29] [56 7 8 27] [45 8 6 55] [28 6 7 47] [51 10 11 46] [25 11 9 53] [47 9 10 24] [40 13 14 34] [49 14 12 39] [35 12 13 48] [41 16 17 57] [40 30 17 15] [58 15 16 32] [43 19 20 31] [55 20 18 42] [32 18 19 54] [44 22 23 51] [33 23 21 43] [52 21 22 35] [28 11 25 26] [10 1 26 24] [24 29 25 0] [4 6 28 29] [29 24 27 8] [5 27 28 26] [31 34 32 16] [33 18 32 30] [17 30 31 20] [34 31 35 22] [12 35 33 30] [23 33 34 14] [37 39 38 2] [41 3 38 36] [0 36 37 5] [13 40 41 36] [16 41 39 12] [39 37 40 15] [45 19 43 44] [22 44 42 18] [42 46 43 21] [46 42 47 7] [9 47 45 44] [8 45 46 11] [52 14 49 50] [2 50 48 13] [48 53 49 1] [9 21 52 53] [53 48 51 23] [10 51 52 50] [58 20 55 56] [7 56 54 19] [54 59 55 6] [15 58 59 3] [59 54 57 17] [4 57 58 56]]
        vertex: [[0.8090169943749476 0.5 0.30901699437494745] [0.30901699437494745 0.8090169943749476 0.5] [0.5 0.30901699437494745 0.8090169943749476] [0.8090169943749476 0.5 -0.30901699437494745] [0.5 0.30901699437494745 -0.8090169943749476] [0.30901699437494745 0.8090169943749476 -0.5] [-0.30901699437494745 0.8090169943749476 -0.5] [-0.5 0.30901699437494745 -0.8090169943749476] [-0.8090169943749476 0.5 -0.30901699437494745] [-0.8090169943749476 0.5 0.30901699437494745] [-0.5 0.30901699437494745 0.8090169943749476] [-0.30901699437494745 0.8090169943749476 0.5] [0.30901699437494745 -0.8090169943749476 0.5] [0.8090169943749476 -0.5 0.30901699437494745] [0.5 -0.30901699437494745 0.8090169943749476] [0.5 -0.30901699437494745 -0.8090169943749476] [0.8090169943749476 -0.5 -0.30901699437494745] [0.30901699437494745 -0.8090169943749476 -0.5] [-0.30901699437494745 -0.8090169943749476 -0.5] [-0.8090169943749476 -0.5 -0.30901699437494745] [-0.5 -0.30901699437494745 -0.8090169943749476] [-0.5 -0.30901699437494745 0.8090169943749476] [-0.8090169943749476 -0.5 0.30901699437494745] [-0.30901699437494745 -0.8090169943749476 0.5] [0 1.0000000000000002 -5.551115123125783e-17] [-0.30901699437494745 0.8090169943749476 0.5] [0.30901699437494745 0.8090169943749476 0.5] [0.30901699437494745 0.8090169943749476 -0.5] [-0.30901699437494745 0.8090169943749476 -0.5] [0 1.0000000000000002 5.551115123125783e-17] [0.30901699437494745 -0.8090169943749476 -0.5] [0 -1.0000000000000002 5.551115123125783e-17] [-0.30901699437494745 -0.8090169943749476 -0.5] [-0.30901699437494745 -0.8090169943749476 0.5] [0 -1.0000000000000002 -5.551115123125783e-17] [0.30901699437494745 -0.8090169943749476 0.5] [0.8090169943749476 0.5 0.30901699437494745] [1.0000000000000002 -5.551115123125783e-17 0] [0.8090169943749476 0.5 -0.30901699437494745] [1.0000000000000002 5.551115123125783e-17 0] [0.8090169943749476 -0.5 0.30901699437494745] [0.8090169943749476 -0.5 -0.30901699437494745] [-1.0000000000000002 5.551115123125783e-17 0] [-0.8090169943749476 -0.5 -0.30901699437494745] [-0.8090169943749476 -0.5 0.30901699437494745] [-0.8090169943749476 0.5 -0.30901699437494745] [-1.0000000000000002 -5.551115123125783e-17 0] [-0.8090169943749476 0.5 0.30901699437494745] [-5.551115123125783e-17 0 1.0000000000000002] [0.5 -0.30901699437494745 0.8090169943749476] [0.5 0.30901699437494745 0.8090169943749476] [-0.5 0.30901699437494745 0.8090169943749476] [-0.5 -0.30901699437494745 0.8090169943749476] [5.551115123125783e-17 0 1.0000000000000002] [5.551115123125783e-17 0 -1.0000000000000002] [-0.5 -0.30901699437494745 -0.8090169943749476] [-0.5 0.30901699437494745 -0.8090169943749476] [0.5 0.30901699437494745 -0.8090169943749476] [0.5 -0.30901699437494745 -0.8090169943749476] [-5.551115123125783e-17 0 -1.0000000000000002]]
        face: [[0 38 5 29 26] [24 28 8 47 11] [27 4 59 56 6] [54 58 17 32 20] [25 10 53 50 1] [48 52 23 35 14] [42 45 7 55 19] [51 9 46 44 21] [37 41 15 57 3] [2 49 13 39 36] [31 33 22 43 18] [16 40 12 34 30] [0 1 2] [3 4 5] [6 7 8] [9 10 11] [12 13 14] [15 16 17] [18 19 20] [21 22 23] [24 25 26] [27 28 29] [30 31 32] [33 34 35] [36 37 38] [39 40 41] [42 43 44] [45 46 47] [48 49 50] [51 52 53] [54 55 56] [57 58 59]]
        
    @icosidodecahedron1: ->
        
        neighbors: [[44 21 1 4] [20 5 2 0] [9 35 3 1] [39 46 4 2] [45 40 0 3] [1 20 6 9] [24 56 7 5] [55 50 8 6] [54 36 9 7] [35 2 5 8] [25 16 11 14] [15 30 12 10] [34 52 13 11] [51 59 14 12] [58 26 10 13] [30 11 16 19] [10 25 17 15] [29 42 18 16] [41 49 19 17] [48 31 15 18] [5 1 21 24] [0 44 22 20] [43 28 23 21] [27 57 24 22] [56 6 20 23] [16 10 26 29] [14 58 27 25] [57 23 28 26] [22 43 29 27] [42 17 25 28] [11 15 31 34] [19 48 32 30] [47 38 33 31] [37 53 34 32] [52 12 30 33] [2 9 36 39] [8 54 37 35] [53 33 38 36] [32 47 39 37] [46 3 35 38] [4 45 41 44] [49 18 42 40] [17 29 43 41] [28 22 44 42] [21 0 40 43] [40 4 46 49] [3 39 47 45] [38 32 48 46] [31 19 49 47] [18 41 45 48] [7 55 51 54] [59 13 52 50] [12 34 53 51] [33 37 54 52] [36 8 50 53] [50 7 56 59] [6 24 57 55] [23 27 58 56] [26 14 59 57] [13 51 55 58]]
        vertex: [[0.30901699437494745 0.5 0.8090169943749475] [0.49999999999999994 0.8090169943749475 0.30901699437494745] [0 1 1.1102230246251565e-16] [-0.49999999999999994 0.8090169943749475 0.30901699437494745] [-0.30901699437494745 0.5 0.8090169943749475] [0 1 -1.1102230246251565e-16] [0.49999999999999994 0.8090169943749475 -0.30901699437494745] [0.30901699437494745 0.5 -0.8090169943749475] [-0.30901699437494745 0.5 -0.8090169943749475] [-0.49999999999999994 0.8090169943749475 -0.30901699437494745] [0.49999999999999994 -0.8090169943749475 -0.30901699437494745] [0 -1 -1.1102230246251565e-16] [-0.49999999999999994 -0.8090169943749475 -0.30901699437494745] [-0.30901699437494745 -0.5 -0.8090169943749475] [0.30901699437494745 -0.5 -0.8090169943749475] [-0.49999999999999994 -0.8090169943749475 0.30901699437494745] [0 -1 1.1102230246251565e-16] [0.49999999999999994 -0.8090169943749475 0.30901699437494745] [0.30901699437494745 -0.5 0.8090169943749475] [-0.30901699437494745 -0.5 0.8090169943749475] [0.5 0.8090169943749475 -0.30901699437494745] [0.5 0.8090169943749475 0.30901699437494745] [0.8090169943749475 0.3090169943749475 0.4999999999999999] [1 1.1102230246251565e-16 0] [0.8090169943749475 0.3090169943749475 -0.4999999999999999] [0.5 -0.8090169943749475 0.30901699437494745] [0.5 -0.8090169943749475 -0.30901699437494745] [0.8090169943749475 -0.3090169943749475 -0.4999999999999999] [1 -1.1102230246251565e-16 0] [0.8090169943749475 -0.3090169943749475 0.4999999999999999] [-0.5 -0.8090169943749475 -0.30901699437494745] [-0.5 -0.8090169943749475 0.30901699437494745] [-0.8090169943749475 -0.3090169943749475 0.4999999999999999] [-1 -1.1102230246251565e-16 0] [-0.8090169943749475 -0.3090169943749475 -0.4999999999999999] [-0.5 0.8090169943749475 0.30901699437494745] [-0.5 0.8090169943749475 -0.30901699437494745] [-0.8090169943749475 0.3090169943749475 -0.4999999999999999] [-1 1.1102230246251565e-16 0] [-0.8090169943749475 0.3090169943749475 0.4999999999999999] [0.30901699437494745 0.49999999999999994 0.8090169943749475] [1.1102230246251565e-16 0 1] [0.30901699437494745 -0.49999999999999994 0.8090169943749475] [0.8090169943749475 -0.3090169943749474 0.5000000000000001] [0.8090169943749475 0.3090169943749474 0.5000000000000001] [-1.1102230246251565e-16 0 1] [-0.30901699437494745 0.49999999999999994 0.8090169943749475] [-0.8090169943749475 0.3090169943749474 0.5000000000000001] [-0.8090169943749475 -0.3090169943749474 0.5000000000000001] [-0.30901699437494745 -0.49999999999999994 0.8090169943749475] [-0.30901699437494745 0.49999999999999994 -0.8090169943749475] [-1.1102230246251565e-16 0 -1] [-0.30901699437494745 -0.49999999999999994 -0.8090169943749475] [-0.8090169943749475 -0.3090169943749474 -0.5000000000000001] [-0.8090169943749475 0.3090169943749474 -0.5000000000000001] [1.1102230246251565e-16 0 -1] [0.30901699437494745 0.49999999999999994 -0.8090169943749475] [0.8090169943749475 0.3090169943749474 -0.5000000000000001] [0.8090169943749475 -0.3090169943749474 -0.5000000000000001] [0.30901699437494745 -0.49999999999999994 -0.8090169943749475]]
        face: [[1 20 5] [2 9 35] [7 55 50] [4 45 40] [8 54 36] [3 39 46] [0 44 21] [6 24 56] [11 15 30] [10 25 16] [13 51 59] [18 41 49] [12 34 52] [19 48 31] [17 29 42] [14 58 26] [33 37 53] [38 32 47] [23 27 57] [28 22 43] [0 1 2 3 4] [5 6 7 8 9] [10 11 12 13 14] [15 16 17 18 19] [20 21 22 23 24] [25 26 27 28 29] [30 31 32 33 34] [35 36 37 38 39] [40 41 42 43 44] [45 46 47 48 49] [50 51 52 53 54] [55 56 57 58 59]]
        
    @icosidodecahedron2: ->
        
        neighbors: [[1 2 3 4] [2 0 6 5] [0 1 8 7] [4 0 10 9] [0 3 12 11] [1 6 13 14] [5 1 11 15] [2 8 16 10] [7 2 14 17] [3 10 18 19] [9 3 7 16] [4 12 15 6] [11 4 19 20] [14 5 22 21] [5 13 17 8] [6 11 23 22] [10 7 25 24] [8 14 26 25] [19 9 24 27] [9 18 20 12] [12 19 28 23] [13 22 29 26] [21 13 15 23] [22 15 20 28] [16 25 27 18] [24 16 17 26] [25 17 21 29] [18 24 29 28] [23 20 27 29] [26 21 28 27]]
        vertex:[[0,0,1.051462],[0.618034,0,0.8506508],[0.2763932,0.5527864,0.8506508],[-0.618034,0,0.8506508],[-0.2763932,-0.5527864,0.8506508],[1,0,0.3249197],[0.7236068,-0.5527864,0.5257311],[-0.1708204,0.8944272,0.5257311],[0.4472136,0.8944272,0.3249197],[-1,0,0.3249197],[-0.7236068,0.5527864,0.5257311],[0.1708204,-0.8944272,0.5257311],[-0.4472136,-0.8944272,0.3249197],[1,0,-0.3249197],[0.8944272,0.5527864,0],[0.5527864,-0.8944272,0],[-0.5527864,0.8944272,0],[0.4472136,0.8944272,-0.3249197],[-1,0,-0.3249197],[-0.8944272,-0.5527864,0],[-0.4472136,-0.8944272,-0.3249197],[0.618034,0,-0.8506508],[0.7236068,-0.5527864,-0.5257311],[0.1708204,-0.8944272,-0.5257311],[-0.7236068,0.5527864,-0.5257311],[-0.1708204,0.8944272,-0.5257311],[0.2763932,0.5527864,-0.8506508],[-0.618034,0,-0.8506508],[-0.2763932,-0.5527864,-0.8506508],[0,0,-1.051462]]
        face:[[0,1,2],[0,3,4],[1,6,5],[2,8,7],[3,10,9],[4,12,11],[5,13,14],[6,11,15],[7,16,10],[8,14,17],[9,18,19],[12,19,20],[13,22,21],[15,23,22],[16,25,24],[17,26,25],[18,24,27],[20,28,23],[21,29,26],[27,29,28],[0,2,7,10,3],[0,4,11,6,1],[1,5,14,8,2],[3,9,19,12,4],[5,6,15,22,13],[7,8,17,25,16],[9,10,16,24,18],[11,12,20,23,15],[13,21,26,17,14],[18,27,28,20,19],[21,22,23,28,29],[24,25,26,29,27]] 
        
    @truncatedicosidodecahedron: ->

        neighbors: [[1 2 3] [0 5 4] [4 6 0] [8 7 0] [1 9 2] [10 11 1] [12 13 2] [14 15 3] [3 13 14] [17 16 4] [5 19 18] [18 17 5] [6 21 20] [20 8 6] [8 22 7] [24 23 7] [25 26 9] [9 11 25] [10 27 11] [28 29 10] [12 30 13] [31 32 12] [33 34 14] [35 28 15] [15 34 35] [17 36 16] [38 37 16] [40 39 18] [19 23 41] [41 40 19] [43 42 20] [21 37 44] [44 43 21] [22 46 45] [45 24 22] [24 47 23] [48 49 25] [50 31 26] [26 49 50] [51 52 27] [27 29 51] [28 53 29] [54 55 30] [30 32 54] [31 56 32] [33 57 34] [55 58 33] [59 53 35] [36 61 60] [60 38 36] [38 62 37] [40 63 39] [64 61 39] [65 41 47] [43 66 42] [46 42 67] [62 68 44] [70 69 45] [67 70 46] [47 71 65] [48 72 49] [73 48 52] [56 50 74] [75 76 51] [52 76 73] [59 77 53] [78 79 54] [55 79 58] [74 80 56] [81 82 57] [57 58 81] [82 83 59] [85 84 60] [64 85 61] [62 86 68] [63 88 87] [87 64 63] [89 88 65] [66 91 90] [90 67 66] [92 91 68] [70 93 69] [71 69 94] [94 89 71] [95 96 72] [72 73 95] [96 97 74] [75 98 76] [99 75 77] [77 83 99] [78 100 79] [101 78 80] [80 97 101] [102 103 81] [82 103 83] [85 104 84] [86 84 105] [105 92 86] [107 106 87] [89 107 88] [109 108 90] [92 109 91] [93 108 110] [110 94 93] [111 112 95] [96 112 97] [113 111 98] [98 99 113] [114 102 100] [100 101 114] [102 115 103] [104 106 116] [116 105 104] [107 117 106] [109 118 108] [118 117 110] [111 119 112] [119 113 115] [115 114 119] [118 116 117]]
        vertex:[[0,0,1.008759],[0.2629922,0,0.973874],[-0.00462747,0.2629515,0.973874],[-0.2211363,-0.1423503,0.973874],[0.2583647,0.2629515,0.9389886],[0.4673861,-0.1423503,0.8825429],[-0.2303913,0.3835526,0.9041033],[-0.3159502,-0.372678,0.8825429],[-0.4469001,-0.02174919,0.9041033],[0.4581312,0.3835526,0.8127722],[0.5351104,-0.372678,0.7696515],[0.6671526,-0.02174919,0.7563265],[-0.3326926,0.5786893,0.7563265],[-0.4515276,0.2412023,0.8692179],[-0.541714,-0.2520769,0.8127722],[-0.248226,-0.6030057,0.7696515],[0.518368,0.5786893,0.6434351],[0.6625252,0.2412023,0.7214412],[0.7348768,-0.2520769,0.6434351],[0.4402965,-0.6030057,0.6783205],[-0.5538289,0.436339,0.7214412],[-0.2724557,0.7738261,0.5869894],[-0.6997536,-0.3618034,0.6301101],[-0.04383203,-0.745356,0.6783205],[-0.4062656,-0.7127322,0.5869894],[0.722762,0.436339,0.552104],[0.4160667,0.7738261,0.4956583],[0.8398294,-0.3618034,0.4258876],[0.2191601,-0.745356,0.6434351],[0.5452491,-0.7127322,0.460773],[-0.7147284,0.4891254,0.5172187],[-0.07268925,0.8944272,0.460773],[-0.4333553,0.8266125,0.3827669],[-0.8606531,-0.309017,0.4258876],[-0.6320294,-0.5921311,0.5172187],[-0.2018716,-0.8550825,0.4956583],[0.8248546,0.4891254,0.3129962],[0.1903029,0.8944272,0.4258876],[0.5181594,0.8266125,0.2565505],[0.9419221,-0.309017,0.1867798],[0.7450156,-0.5921311,0.3345566],[0.3241127,-0.8550825,0.4258876],[-0.8727679,0.3793989,0.3345566],[-0.6544916,0.6842621,0.3478816],[-0.2335888,0.9472136,0.2565505],[-0.7929289,-0.5393447,0.3129962],[-0.9629544,-0.1138803,0.2781109],[-0.096919,-0.9648091,0.2781109],[0.9298072,0.3793989,0.09544872],[0.7225533,0.6842621,0.1652194],[0.2923956,0.9472136,0.1867798],[0.8471082,-0.5393447,0.09544872],[1.002159,-0.1138803,0.01744268],[0.1660732,-0.9648091,0.2432255],[-0.8125311,0.5745356,0.1652194],[-0.9675818,0.1490712,0.2432255],[-0.1314961,1,0.01744268],[-0.8275059,-0.5745356,0.05232804],[-0.9975315,-0.1490712,0.01744268],[-0.1314961,-1,0.01744268],[0.8275059,0.5745356,-0.05232804],[0.9975315,0.1490712,-0.01744268],[0.1314961,1,-0.01744268],[0.8125311,-0.5745356,-0.1652194],[0.9675818,-0.1490712,-0.2432255],[0.1314961,-1,-0.01744268],[-0.8471082,0.5393447,-0.09544872],[-1.002159,0.1138803,-0.01744268],[-0.1660732,0.9648091,-0.2432255],[-0.7225533,-0.6842621,-0.1652194],[-0.9298072,-0.3793989,-0.09544872],[-0.2923956,-0.9472136,-0.1867798],[0.7929289,0.5393447,-0.3129962],[0.9629544,0.1138803,-0.2781109],[0.096919,0.9648091,-0.2781109],[0.6544916,-0.6842621,-0.3478816],[0.8727679,-0.3793989,-0.3345566],[0.2335888,-0.9472136,-0.2565505],[-0.7450156,0.5921311,-0.3345566],[-0.9419221,0.309017,-0.1867798],[-0.3241127,0.8550825,-0.4258876],[-0.8248546,-0.4891254,-0.3129962],[-0.5181594,-0.8266125,-0.2565505],[-0.1903029,-0.8944272,-0.4258876],[0.6320294,0.5921311,-0.5172187],[0.8606531,0.309017,-0.4258876],[0.2018716,0.8550825,-0.4956583],[0.7147284,-0.4891254,-0.5172187],[0.4333553,-0.8266125,-0.3827669],[0.07268925,-0.8944272,-0.460773],[-0.8398294,0.3618034,-0.4258876],[-0.5452491,0.7127322,-0.460773],[-0.2191601,0.745356,-0.6434351],[-0.722762,-0.436339,-0.552104],[-0.4160667,-0.7738261,-0.4956583],[0.6997536,0.3618034,-0.6301101],[0.4062656,0.7127322,-0.5869894],[0.04383203,0.745356,-0.6783205],[0.5538289,-0.436339,-0.7214412],[0.2724557,-0.7738261,-0.5869894],[-0.7348768,0.2520769,-0.6434351],[-0.4402965,0.6030057,-0.6783205],[-0.6625252,-0.2412023,-0.7214412],[-0.518368,-0.5786893,-0.6434351],[0.541714,0.2520769,-0.8127722],[0.248226,0.6030057,-0.7696515],[0.4515276,-0.2412023,-0.8692179],[0.3326926,-0.5786893,-0.7563265],[-0.6671526,0.02174919,-0.7563265],[-0.5351104,0.372678,-0.7696515],[-0.4581312,-0.3835526,-0.8127722],[0.4469001,0.02174919,-0.9041033],[0.3159502,0.372678,-0.8825429],[0.2303913,-0.3835526,-0.9041033],[-0.4673861,0.1423503,-0.8825429],[-0.2583647,-0.2629515,-0.9389886],[0.2211363,0.1423503,-0.973874],[0.00462747,-0.2629515,-0.973874],[-0.2629922,0,-0.973874],[0,0,-1.008759]]
        face:[[0,1,4,2],[3,8,14,7],[5,10,18,11],[6,12,20,13],[9,17,25,16],[15,24,35,23],[19,28,41,29],[21,31,44,32],[22,33,45,34],[26,38,50,37],[27,40,51,39],[30,43,54,42],[36,48,60,49],[46,55,67,58],[47,59,65,53],[52,64,73,61],[56,62,74,68],[57,70,81,69],[63,75,87,76],[66,78,90,79],[71,82,94,83],[72,85,95,84],[77,89,99,88],[80,92,101,91],[86,96,105,97],[93,102,110,103],[98,107,113,106],[100,109,114,108],[104,111,116,112],[115,118,119,117],[0,2,6,13,8,3],[1,5,11,17,9,4],[7,14,22,34,24,15],[10,19,29,40,27,18],[12,21,32,43,30,20],[16,25,36,49,38,26],[23,35,47,53,41,28],[31,37,50,62,56,44],[33,46,58,70,57,45],[39,51,63,76,64,52],[42,54,66,79,67,55],[48,61,73,85,72,60],[59,71,83,89,77,65],[68,74,86,97,92,80],[69,81,93,103,94,82],[75,88,99,107,98,87],[78,91,101,109,100,90],[84,95,104,112,105,96],[102,108,114,118,115,110],[106,113,117,119,116,111],[0,3,7,15,23,28,19,10,5,1],[2,4,9,16,26,37,31,21,12,6],[8,13,20,30,42,55,46,33,22,14],[11,18,27,39,52,61,48,36,25,17],[24,34,45,57,69,82,71,59,47,35],[29,41,53,65,77,88,75,63,51,40],[32,44,56,68,80,91,78,66,54,43],[38,49,60,72,84,96,86,74,62,50],[58,67,79,90,100,108,102,93,81,70],[64,76,87,98,106,111,104,95,85,73],[83,94,103,110,115,117,113,107,99,89],[92,97,105,112,116,119,118,114,109,101]]

    @snubicosidodecahedron: ->

        neighbors: [[1 2 3 4 5] [2 0 6 7 8] [0 1 8 9 3] [0 2 10 11 4] [0 3 11 12 5] [0 4 12 13 14] [7 1 14 15 16] [1 6 16 17 8] [1 7 18 9 2] [2 8 18 19 20] [11 3 20 21 22] [3 10 22 23 4] [5 4 24 25 13] [5 12 25 26 14] [5 13 26 15 6] [6 14 26 27 16] [6 15 28 17 7] [7 16 28 29 30] [9 8 30 31 19] [9 18 31 32 20] [9 19 32 21 10] [10 20 32 33 22] [10 21 34 23 11] [11 22 34 35 24] [25 12 23 35 36] [12 24 36 37 13] [14 13 38 27 15] [15 26 38 39 40] [17 16 40 41 29] [17 28 41 42 30] [17 29 42 31 18] [18 30 42 43 19] [20 19 44 33 21] [21 32 44 45 46] [23 22 46 47 35] [23 34 47 36 24] [24 35 48 37 25] [25 36 48 49 38] [27 26 37 49 39] [27 38 49 50 40] [27 39 50 41 28] [28 40 50 51 29] [30 29 52 43 31] [31 42 52 53 44] [33 32 43 53 45] [33 44 53 54 46] [33 45 54 47 34] [34 46 54 55 35] [37 36 55 56 49] [37 48 56 39 38] [40 39 57 51 41] [41 50 57 58 52] [43 42 51 58 53] [43 52 58 45 44] [46 45 59 55 47] [47 54 59 56 48] [48 55 59 57 49] [51 50 56 59 58] [51 57 59 53 52] [55 54 58 57 56]]
        vertex:[[0,0,1.028031],[0.4638569,0,0.9174342],[0.2187436,0.4090409,0.9174342],[-0.2575486,0.3857874,0.9174342],[-0.4616509,-0.04518499,0.9174342],[-0.177858,-0.4284037,0.9174342],[0.5726782,-0.4284037,0.7384841],[0.8259401,-0.04518499,0.6104342],[0.6437955,0.3857874,0.702527],[0.349648,0.7496433,0.6104342],[-0.421009,0.7120184,0.6104342],[-0.6783139,0.3212396,0.702527],[-0.6031536,-0.4466658,0.702527],[-0.2749612,-0.7801379,0.6104342],[0.1760766,-0.6931717,0.7384841],[0.5208138,-0.7801379,0.4206978],[0.8552518,-0.4466658,0.3547998],[1.01294,-0.03548596,0.1718776],[0.7182239,0.661842,0.3208868],[0.3633691,0.9454568,0.1758496],[-0.04574087,0.9368937,0.4206978],[-0.4537394,0.905564,0.1758496],[-0.7792791,0.5887312,0.3208868],[-0.9537217,0.1462217,0.3547998],[-0.9072701,-0.3283699,0.3547998],[-0.6503371,-0.7286577,0.3208868],[0.08459482,-0.9611501,0.3547998],[0.3949153,-0.9491262,-0.007072558],[0.9360473,-0.409557,-0.1136978],[0.9829382,0.02692292,-0.2999274],[0.9463677,0.4014808,-0.007072558],[0.6704578,0.7662826,-0.1419366],[-0.05007646,1.025698,-0.04779978],[-0.4294337,0.8845784,-0.2999274],[-0.9561681,0.3719321,-0.06525234],[-1.022036,-0.1000338,-0.04779978],[-0.8659056,-0.5502712,-0.06525234],[-0.5227761,-0.8778535,-0.1136978],[-0.06856319,-1.021542,-0.09273844],[0.2232046,-0.8974878,-0.4489366],[0.6515438,-0.7200947,-0.3373472],[0.7969535,-0.3253959,-0.5619888],[0.8066872,0.4395354,-0.461425],[0.4468035,0.735788,-0.5619888],[0.001488801,0.8961155,-0.503809],[-0.3535403,0.6537658,-0.7102452],[-0.7399517,0.5547758,-0.4489366],[-0.9120238,0.1102196,-0.461425],[-0.6593998,-0.6182798,-0.4896639],[-0.2490651,-0.8608088,-0.503809],[0.4301047,-0.5764987,-0.734512],[0.5057577,-0.1305283,-0.8854492],[0.5117735,0.3422252,-0.8232973],[0.09739587,0.5771941,-0.8451093],[-0.6018946,0.2552591,-0.7933564],[-0.6879024,-0.2100741,-0.734512],[-0.3340437,-0.5171509,-0.8232973],[0.08570633,-0.3414376,-0.9658797],[0.1277354,0.1313635,-1.011571],[-0.3044499,-0.06760332,-0.979586]]
        face:[[0,1,2],[0,2,3],[0,3,4],[0,4,5],[1,6,7],[1,7,8],[1,8,2],[2,8,9],[3,10,11],[3,11,4],[4,12,5],[5,12,13],[5,13,14],[6,14,15],[6,15,16],[6,16,7],[7,16,17],[8,18,9],[9,18,19],[9,19,20],[10,20,21],[10,21,22],[10,22,11],[11,22,23],[12,24,25],[12,25,13],[13,26,14],[14,26,15],[15,26,27],[16,28,17],[17,28,29],[17,29,30],[18,30,31],[18,31,19],[19,32,20],[20,32,21],[21,32,33],[22,34,23],[23,34,35],[23,35,24],[24,35,36],[24,36,25],[25,36,37],[26,38,27],[27,38,39],[27,39,40],[28,40,41],[28,41,29],[29,42,30],[30,42,31],[31,42,43],[32,44,33],[33,44,45],[33,45,46],[34,46,47],[34,47,35],[36,48,37],[37,48,49],[37,49,38],[38,49,39],[39,50,40],[40,50,41],[41,50,51],[42,52,43],[43,52,53],[43,53,44],[44,53,45],[45,54,46],[46,54,47],[47,54,55],[48,55,56],[48,56,49],[50,57,51],[51,57,58],[51,58,52],[52,58,53],[54,59,55],[55,59,56],[56,59,57],[57,59,58],[0,5,14,6,1],[2,9,20,10,3],[4,11,23,24,12],[7,17,30,18,8],[13,25,37,38,26],[15,27,40,28,16],[19,31,43,44,32],[21,33,46,34,22],[29,41,51,52,42],[35,47,55,48,36],[39,49,56,57,50],[45,53,58,59,54]]

    @rhombicosidodecahedron: ->

        neighbors: [[2 3 4 1] [6 5 0 7] [3 0 5 8] [0 2 10 9] [9 12 11 0] [1 6 13 2] [5 1 14 15] [16 14 1 11] [18 10 2 17] [12 4 3 19] [8 18 20 3] [21 22 7 4] [4 9 23 21] [15 24 17 5] [7 16 25 6] [24 13 6 26] [14 7 22 27] [29 28 8 13] [10 8 28 30] [31 23 9 20] [30 32 19 10] [22 11 12 33] [11 21 34 16] [19 31 35 12] [13 15 36 29] [27 37 26 14] [38 36 15 25] [37 25 16 39] [17 29 40 18] [28 17 24 41] [32 20 18 42] [23 19 32 43] [20 30 44 31] [45 34 21 35] [33 45 39 22] [43 46 33 23] [26 38 47 24] [25 27 48 38] [36 26 37 49] [50 48 27 34] [41 51 42 28] [51 40 29 47] [52 44 30 40] [46 35 31 53] [42 52 53 32] [34 33 46 50] [35 43 54 45] [49 55 41 36] [39 50 56 37] [55 47 38 56] [48 39 45 57] [40 41 55 52] [44 42 51 58] [58 54 43 44] [53 58 57 46] [47 49 59 51] [57 59 49 48] [59 56 50 54] [54 53 52 59] [56 57 58 55]]
        vertex:[[0,0,1.026054],[0.447838,0,0.9231617],[-0.02363976,0.4472136,0.9231617],[-0.4050732,0.190983,0.9231617],[-0.1693344,-0.4145898,0.9231617],[0.4241982,0.4472136,0.8202696],[0.7673818,0.190983,0.6537868],[0.5552827,-0.4145898,0.7566788],[-0.2312241,0.7562306,0.6537868],[-0.5744076,-0.2236068,0.8202696],[-0.6126576,0.5,0.6537868],[0.1738492,-0.6708204,0.7566788],[-0.4669629,-0.6381966,0.6537868],[0.493393,0.7562306,0.4873039],[0.8748265,-0.2236068,0.4873039],[0.8365765,0.5,0.320821],[0.7054921,-0.6381966,0.3844118],[0.08831973,0.9472136,0.3844118],[-0.5434628,0.809017,0.320821],[-0.8866463,-0.1708204,0.4873039],[-0.9102861,0.2763932,0.3844118],[-0.1237794,-0.8944272,0.4873039],[0.3240586,-0.8944272,0.3844118],[-0.7792016,-0.5854102,0.320821],[0.6289922,0.809017,0.05144604],[1.010426,-0.1708204,0.05144604],[0.9867859,0.2763932,-0.05144604],[0.8410913,-0.5854102,-0.05144604],[-0.223919,1,0.05144604],[0.223919,1,-0.05144604],[-0.8410913,0.5854102,0.05144604],[-0.9867859,-0.2763932,0.05144604],[-1.010426,0.1708204,-0.05144604],[-0.223919,-1,0.05144604],[0.223919,-1,-0.05144604],[-0.6289922,-0.809017,-0.05144604],[0.7792016,0.5854102,-0.320821],[0.9102861,-0.2763932,-0.3844118],[0.8866463,0.1708204,-0.4873039],[0.5434628,-0.809017,-0.320821],[-0.3240586,0.8944272,-0.3844118],[0.1237794,0.8944272,-0.4873039],[-0.7054921,0.6381966,-0.3844118],[-0.8365765,-0.5,-0.320821],[-0.8748265,0.2236068,-0.4873039],[-0.08831973,-0.9472136,-0.3844118],[-0.493393,-0.7562306,-0.4873039],[0.4669629,0.6381966,-0.6537868],[0.6126576,-0.5,-0.6537868],[0.5744076,0.2236068,-0.8202696],[0.2312241,-0.7562306,-0.6537868],[-0.1738492,0.6708204,-0.7566788],[-0.5552827,0.4145898,-0.7566788],[-0.7673818,-0.190983,-0.6537868],[-0.4241982,-0.4472136,-0.8202696],[0.1693344,0.4145898,-0.9231617],[0.4050732,-0.190983,-0.9231617],[0.02363976,-0.4472136,-0.9231617],[-0.447838,0,-0.9231617],[0,0,-1.026054]]
        face:[[0,2,3],[1,6,5],[4,9,12],[7,16,14],[8,18,10],[11,21,22],[13,15,24],[17,29,28],[19,31,23],[20,30,32],[25,27,37],[26,38,36],[33,45,34],[35,43,46],[39,50,48],[40,41,51],[42,52,44],[47,49,55],[53,58,54],[56,57,59],[0,1,5,2],[0,3,9,4],[1,7,14,6],[2,8,10,3],[4,12,21,11],[5,6,15,13],[7,11,22,16],[8,17,28,18],[9,19,23,12],[10,18,30,20],[13,24,29,17],[14,16,27,25],[15,26,36,24],[19,20,32,31],[21,33,34,22],[23,31,43,35],[25,37,38,26],[27,39,48,37],[28,29,41,40],[30,42,44,32],[33,35,46,45],[34,45,50,39],[36,38,49,47],[40,51,52,42],[41,47,55,51],[43,53,54,46],[44,52,58,53],[48,50,57,56],[49,56,59,55],[54,58,59,57],[0,4,11,7,1],[2,5,13,17,8],[3,10,20,19,9],[6,14,25,26,15],[12,23,35,33,21],[16,22,34,39,27],[18,28,40,42,30],[24,36,47,41,29],[31,32,44,53,43],[37,48,56,49,38],[45,46,54,57,50],[51,55,59,58,52]] 
        
    @rhombicubocahedron: ->

        neighbors: [[2 3 4 1] [6 5 0 7] [3 0 5 8] [0 2 10 9] [9 11 7 0] [1 6 12 2] [5 1 13 14] [15 13 1 4] [16 10 2 12] [11 4 3 17] [8 16 17 3] [4 9 18 15] [14 19 8 5] [7 15 20 6] [19 12 6 20] [13 7 11 21] [10 8 19 22] [22 18 9 10] [17 22 21 11] [12 14 23 16] [21 23 14 13] [23 20 15 18] [18 17 16 23] [20 21 22 19]]
        vertex:[[0,0,1.070722],[0.7148135,0,0.7971752],[-0.104682,0.7071068,0.7971752],[-0.6841528,0.2071068,0.7971752],[-0.104682,-0.7071068,0.7971752],[0.6101315,0.7071068,0.5236279],[1.04156,0.2071068,0.1367736],[0.6101315,-0.7071068,0.5236279],[-0.3574067,1,0.1367736],[-0.7888348,-0.5,0.5236279],[-0.9368776,0.5,0.1367736],[-0.3574067,-1,0.1367736],[0.3574067,1,-0.1367736],[0.9368776,-0.5,-0.1367736],[0.7888348,0.5,-0.5236279],[0.3574067,-1,-0.1367736],[-0.6101315,0.7071068,-0.5236279],[-1.04156,-0.2071068,-0.1367736],[-0.6101315,-0.7071068,-0.5236279],[0.104682,0.7071068,-0.7971752],[0.6841528,-0.2071068,-0.7971752],[0.104682,-0.7071068,-0.7971752],[-0.7148135,0,-0.7971752],[0,0,-1.070722]]
        face:[[0,2,3],[1,6,5],[4,9,11],[7,15,13],[8,16,10],[12,14,19],[17,22,18],[20,21,23],[0,1,5,2],[0,3,9,4],[0,4,7,1],[1,7,13,6],[2,5,12,8],[2,8,10,3],[3,10,17,9],[4,11,15,7],[5,6,14,12],[6,13,20,14],[8,12,19,16],[9,17,18,11],[10,16,22,17],[11,18,21,15],[13,15,21,20],[14,20,23,19],[16,19,23,22],[18,22,23,21]]
    
    @snubcuboctahedron: ->

        neighbors: [[1 2 3 4 5] [2 0 6 7 8] [0 1 8 9 3] [0 2 10 11 4] [0 3 11 12 5] [0 4 12 13 6] [7 1 5 13 14] [1 6 14 15 8] [1 7 16 9 2] [2 8 16 17 10] [11 3 9 17 18] [3 10 18 19 4] [5 4 19 20 13] [5 12 20 14 6] [6 13 21 15 7] [7 14 21 22 16] [9 8 15 22 17] [9 16 22 18 10] [10 17 23 19 11] [11 18 23 20 12] [12 19 23 21 13] [15 14 20 23 22] [15 21 23 17 16] [19 18 22 21 20]]
        vertex:[[0,0,1.077364],[0.7442063,0,0.7790187],[0.3123013,0.6755079,0.7790187],[-0.482096,0.5669449,0.7790187],[-0.7169181,-0.1996786,0.7790187],[-0.1196038,-0.7345325,0.7790187],[0.6246025,-0.7345325,0.4806734],[1.056508,-0.1996786,0.06806912],[0.8867128,0.5669449,0.2302762],[0.2621103,1.042774,0.06806912],[-0.532287,0.9342111,0.06806912],[-1.006317,0.3082417,0.2302762],[-0.7020817,-0.784071,0.2302762],[0.02728827,-1.074865,0.06806912],[0.6667271,-0.784071,-0.3184664],[0.8216855,-0.09111555,-0.6908285],[0.6518908,0.6755079,-0.5286215],[-0.1196038,0.8751866,-0.6168117],[-0.8092336,0.4758293,-0.5286215],[-0.9914803,-0.2761507,-0.3184664],[-0.4467414,-0.825648,-0.5286215],[0.1926974,-0.5348539,-0.915157],[0.1846311,0.2587032,-1.029416],[-0.5049987,-0.1406541,-0.9412258]]
        face:[[0,1,2],[0,2,3],[0,3,4],[0,4,5],[1,6,7],[1,7,8],[1,8,2],[2,8,9],[3,10,11],[3,11,4],[4,12,5],[5,12,13],[5,13,6],[6,13,14],[6,14,7],[7,14,15],[8,16,9],[9,16,17],[9,17,10],[10,17,18],[10,18,11],[11,18,19],[12,19,20],[12,20,13],[14,21,15],[15,21,22],[15,22,16],[16,22,17],[18,23,19],[19,23,20],[20,23,21],[21,23,22],[0,5,6,1],[2,9,10,3],[4,11,19,12],[7,15,16,8],[13,20,21,14],[17,22,23,18]]        
    
module.exports = Poly
