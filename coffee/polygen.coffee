###
00000000    0000000   000      000   000   0000000   00000000  000   000
000   000  000   000  000       000 000   000        000       0000  000
00000000   000   000  000        00000    000  0000  0000000   000 0 000
000        000   000  000         000     000   000  000       000  0000
000         0000000   0000000     000      0000000   00000000  000   000
###

sqrt = Math.sqrt
ϕ = (sqrt(5)-1)/2
        
class PolyGen
    
    @tetrahedron:

        face:  [[0 1 2] [0 2 3] [0 3 1] [3 2 1]]
        vertex:[
            [0,1,0]
            [0,-1,-sqrt(8/9)*1.5] 
            [-sqrt(2/3)*1.5,-1,sqrt(2/9)*1.5] 
            [sqrt(2/3)*1.5,-1,sqrt(2/9)*1.5]
        ]
        
    @cube:

        face:  [[0 1 2 3], [4 5 6 7] [1 0 4 7] [0 3 5 4] [3 2 6 5] [2 1 7 6]]
        vertex:[[1,1,-1], [1,-1,-1], [-1,-1,-1], [-1,1,-1], [1 1 1], [-1,1,1], [-1,-1,1], [1,-1,1]]
        
    @octahedron:
        
        vertex:[[0,1,0], [-1,0,0], [0,0,1], [1,0,0], [0,0,-1], [0,-1,0]]
        face:  [[0 1 2] [0 2 3] [0 3 4] [0 4 1] [5 2 1] [5 3 2] [5 4 3] [5 1 4]]

    @icosahedron: ->
                
        face: [
            [0 4 1] [0 1 7] [1 11 10] [0 9 8]
            [1 10 7] [0 7 9] [0 8 4] [1 4 11]   
            [2 3 6] [2 5 3] [2 10 11] [3 8 9]
            [2 6 10] [3 9 6] [3 5 8] [2 11 5]
            [6 7 10] [7 6 9] [4 5 11] [5 4 8]
        ]
        vertex: [ 
            [0,  1,  ϕ]
            [0,  1, -ϕ]
            [0, -1, -ϕ]
            [0, -1,  ϕ]
            [ 1,  ϕ, 0]
            [ 1, -ϕ, 0]
            [-1, -ϕ, 0]
            [-1,  ϕ, 0]
            [ ϕ, 0,  1]
            [-ϕ, 0,  1]
            [-ϕ, 0, -1]
            [ ϕ, 0, -1]
        ]
        
    @dodecahedron: (h=ϕ) ->
        
        s = ϕ*(1)
        b = ϕ*(1+h)
        a = ϕ*(1-h*h)

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
                
module.exports = PolyGen
