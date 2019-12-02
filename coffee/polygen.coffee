###
00000000    0000000   000      000   000   0000000   00000000  000   000
000   000  000   000  000       000 000   000        000       0000  000
00000000   000   000  000        00000    000  0000  0000000   000 0 000
000        000   000  000         000     000   000  000       000  0000
000         0000000   0000000     000      0000000   00000000  000   000
###

{ klog } = require 'kxk'
{ Vector3 } = require 'babylonjs'

sqrt = Math.sqrt
ϕ = (sqrt(5)-1)/2
        
class PolyGen
    
    @neighbors: (poly) ->

        neighbors = ([] for v in poly.vertex)
        for face in poly.face
            for vi in [0...face.length]
                ni = (vi+1) % face.length
                if face[ni] not in neighbors[face[vi]]
                    neighbors[face[vi]].unshift face[ni]
                if face[vi] not in neighbors[face[ni]]
                    neighbors[face[ni]].push face[vi]          
        neighbors
                
    @vertex: (poly, vi) ->
        
        new Vector3 poly.vertex[vi][0], poly.vertex[vi][1], poly.vertex[vi][2]
        
    @edge: (poly, v1, v2) ->
        
        @vertex(poly, v2).subtract @vertex(poly, v1)
        
    @vertexNormal: (poly, vertexIndex) ->
        
        sum = new Vector3 0 0 0
        for ni in poly.neighbors[vertexIndex]
            sum.addInPlace @edge poly, vertexIndex, ni
        sum.normalize()
        sum
        
    @calcDepth: (poly, factor, vertexIndex) ->
        
        norm = @vertexNormal poly, vertexIndex
        edge = @edge poly, vertexIndex, poly.neighbors[0][0]
        
        edge.length() * 0.5 * factor
        
    @truncate: (poly, factor=ϕ) ->

        edgeMap = {}
        
        numFaces = poly.face.length
        
        depth = @calcDepth poly, factor, 0
        
        numVertices = poly.vertex.length
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
                newFace.push edgeMap[face[ni]][face[vi]]
            poly.face[fi] = newFace
            
        poly.neighbors = @neighbors poly
            
        # klog poly
        poly
        
    # 000000000  00000000  000000000  00000000    0000000 
    #    000     000          000     000   000  000   000
    #    000     0000000      000     0000000    000000000
    #    000     000          000     000   000  000   000
    #    000     00000000     000     000   000  000   000
    
    @tetrahedron:
    
        neighbors: [[1 2 3] [2 0 3] [3 0 1] [1 0 2]]        
        face:  [[0 1 2] [0 2 3] [0 3 1] [3 2 1]]
        vertex:[
            [0,1,0]
            [0,-1,-sqrt(8/9)*1.5] 
            [-sqrt(2/3)*1.5,-1,sqrt(2/9)*1.5] 
            [sqrt(2/3)*1.5,-1,sqrt(2/9)*1.5]
        ]
        
    #  0000000  000   000  0000000    00000000  
    # 000       000   000  000   000  000       
    # 000       000   000  0000000    0000000   
    # 000       000   000  000   000  000       
    #  0000000   0000000   0000000    00000000  
    
    @cube:
        
        neighbors: [[4 1 3] [2 0 7] [6 3 1] [5 0 2] [5 7 0] [6 4 3] [7 5 2] [1 4 6]]
        face:  [[0 1 2 3] [4 5 6 7] [1 0 4 7] [0 3 5 4] [3 2 6 5] [2 1 7 6]]
        vertex:[[1,1,-1], [1,-1,-1], [-1,-1,-1], [-1,1,-1], [1 1 1], [-1,1,1], [-1,-1,1], [1,-1,1]]
        
    #  0000000    0000000  000000000   0000000   
    # 000   000  000          000     000   000  
    # 000   000  000          000     000000000  
    # 000   000  000          000     000   000  
    #  0000000    0000000     000     000   000  
    
    @octahedron:
        
        neighbors: [[1 2 3 4] [5 2 0 4] [3 0 1 5] [4 0 2 5] [1 0 3 5] [4 3 2 1]]        
        face:  [[0 1 2] [0 2 3] [0 3 4] [0 4 1] [5 2 1] [5 3 2] [5 4 3] [5 1 4]]
        vertex:[[0,1,0], [-1,0,0], [0,0,1], [1,0,0], [0,0,-1], [0,-1,0]]
        
    # 0000000     0000000   0000000    00000000   0000000   0000000 
    # 000   000  000   000  000   000  000       000       000   000
    # 000   000  000   000  000   000  0000000   000       000000000
    # 000   000  000   000  000   000  000       000       000   000
    # 0000000     0000000   0000000    00000000   0000000  000   000
    
    @dodecahedron: (h=ϕ) ->
        
        s = ϕ*(1)
        b = ϕ*(1+h)
        a = ϕ*(1-h*h)

        neighbors: [[12 8 16] [19 9 12] [15 9 18] [17 8 15] [13 16 11] [10 19 13] [14 18 10] [11 17 14] [0 9 3] [2 8 1] [11 6 5] [4 7 10] [13 1 0] [5 12 4] [7 15 6] [3 2 14] [0 17 4] [7 16 3] [2 19 6] [5 18 1]]        
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
                
        neighbors: [[4 1 7 9 8] [0 4 11 10 7] [3 6 10 11 5] [2 5 8 9 6] [5 11 1 0 8] [8 3 2 11 4] [7 10 2 3 9] [9 0 1 10 6] [4 0 9 3 5] [6 3 8 0 7] [7 1 11 2 6] [5 2 10 1 4]]        
        face: [
            [0 4 1] [0 1 7] [1 11 10] [0 9 8]
            [1 10 7] [0 7 9] [0 8 4] [1 4 11]   
            [2 3 6] [2 5 3] [2 10 11] [3 8 9]
            [2 6 10] [3 9 6] [3 5 8] [2 11 5]
            [6 7 10] [7 6 9] [4 5 11] [5 4 8]
        ]
        vertex: [ 
            [ 0,  1,  ϕ]
            [ 0,  1, -ϕ]
            [ 0, -1, -ϕ]
            [ 0, -1,  ϕ]
            [ 1,  ϕ,  0]
            [ 1, -ϕ,  0]
            [-1, -ϕ,  0]
            [-1,  ϕ,  0]
            [ ϕ,  0,  1]
            [-ϕ,  0,  1]
            [-ϕ,  0, -1]
            [ ϕ,  0, -1]
        ]
        
module.exports = PolyGen
