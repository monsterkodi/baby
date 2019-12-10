###
00000000    0000000   000      000   000  000   000  00000000  0000000    00000000    0000000   000   000  
000   000  000   000  000       000 000   000   000  000       000   000  000   000  000   000  0000  000  
00000000   000   000  000        00000    000000000  0000000   000   000  0000000    000   000  000 0 000  
000        000   000  000         000     000   000  000       000   000  000   000  000   000  000  0000  
000         0000000   0000000     000     000   000  00000000  0000000    000   000   0000000   000   000  
###

# Polyhédronisme, Copyright 2019, Anselm Levskaya, MIT License

{ _ } = require 'kxk'
{ add, mult, normal } = require './math'
Vect = require '../vect'

class Polyhedron 

    @: (@name, @faces, @vertices) ->

        @faces    ?= []
        @vertices ?= [] 
        @name     ?= "polyhedron"

    # 000   000  00000000  000   0000000   000   000  0000000     0000000   00000000    0000000  
    # 0000  000  000       000  000        000   000  000   000  000   000  000   000  000       
    # 000 0 000  0000000   000  000  0000  000000000  0000000    000   000  0000000    0000000   
    # 000  0000  000       000  000   000  000   000  000   000  000   000  000   000       000  
    # 000   000  00000000  000   0000000   000   000  0000000     0000000   000   000  0000000   
    
    neighbors: ->

        neighbors = ([] for v in @vertices)
        for face in @faces
            for vi in [0...face.length]
                ni = (vi+1) % face.length
                if face[ni] not in neighbors[face[vi]]
                    neighbors[face[vi]].push face[ni]
                if face[vi] not in neighbors[face[ni]]
                    neighbors[face[ni]].push face[vi]          
              
        for vi in [0...neighbors.length]
            toVertex = @vert vi
            toVertex.normalize()
            toN0 = @vert neighbors[vi][0]
            perp = toVertex.crossed toN0
            neighbors[vi].sort (a,b) =>
                aa = Vect.GetAngleBetweenVectors perp, @vert(a), toVertex
                bb = Vect.GetAngleBetweenVectors perp, @vert(b), toVertex
                aa - bb
                    
        neighbors
        
    # 000   000  000  000   000   0000000    0000000  
    # 000 0 000  000  0000  000  000        000       
    # 000000000  000  000 0 000  000  0000  0000000   
    # 000   000  000  000  0000  000   000       000  
    # 00     00  000  000   000   0000000   0000000   
    
    wings: ->
        
        nvert = {}
        pvert = {}
        epool = []
        for fi in [0...@faces.length]
            edges = @faceToEdges @faces[fi]
            edges.forEach (edge) -> 
                nvert[fi] ?= {}
                pvert[fi] ?= {}
                nvert[fi][edge[0]] = edge[1]
                pvert[fi][edge[1]] = edge[0]
                edge.push fr:fi
            epool = epool.concat edges
            
        wings = []
        
        while epool.length
            edge = epool.shift()
            edge[2].nr = nvert[edge[2].fr][edge[1]]
            edge[2].pr = pvert[edge[2].fr][edge[0]]
            for oi in [0...epool.length]
                other = epool[oi]
                if other[0] == edge[1] and other[1] == edge[0]
                    edge[2].fl = other[2].fr
                    edge[2].nl = pvert[edge[2].fl][edge[1]]
                    edge[2].pl = nvert[edge[2].fl][edge[0]]
                    epool.splice oi, 1
                    break
            
            wings.push edge
    
        wings
        
    faceToEdges: (face) -> # array of edges [v1,v2] for face
        edges = []
        v1 = face[-1]
        for v2 in face
            edges.push [v1, v2]
            v1 = v2
        edges
        
    # 00000000  0000000     0000000   00000000   0000000  
    # 000       000   000  000        000       000       
    # 0000000   000   000  000  0000  0000000   0000000   
    # 000       000   000  000   000  000            000  
    # 00000000  0000000     0000000   00000000  0000000   
    
    edges: ->
        
        uniqEdges = {}
        faceEdges = @faces.map @faceToEdges
        for edgeSet in faceEdges
            for e in edgeSet
                if e[0]<e[1] then [a, b] = e
                else              [b, a] = e
                uniqEdges["#{a}~#{b}"] = e
        _.values uniqEdges
      
    edge: (v1, v2) ->
        
        @vert(v2).subtract @vert(v1)
    
    edgeNormal: (v1, v2) ->
        
        @vertNormal(v1).add(@vertNormal(v2)).scale(0.5)
        
    # 000   000  00000000  00000000   000000000  00000000  000   000  
    # 000   000  000       000   000     000     000        000 000   
    #  000 000   0000000   0000000       000     0000000     00000    
    #    000     000       000   000     000     000        000 000   
    #     0      00000000  000   000     000     00000000  000   000  
    
    vert: (vi) -> 
    
        new Vect @vertices[vi]
                
    vertNormal: (vi) ->
         
        sum = new Vector3 0 0 0
        for ni in @neighbors(vi)
            sum.addInPlace @edge vi, ni
        sum.normalize()
        sum
                
    #  0000000  00000000  000   000  000000000  00000000  00000000    0000000  
    # 000       000       0000  000     000     000       000   000  000       
    # 000       0000000   000 0 000     000     0000000   0000000    0000000   
    # 000       000       000  0000     000     000       000   000       000  
    #  0000000  00000000  000   000     000     00000000  000   000  0000000   
    
    centers: -> 
        centersArray = []
        for face in @faces
            fcenter = [0 0 0]
            for vidx in face
                fcenter = add fcenter, @vertices[vidx]
            centersArray.push mult 1.0/face.length, fcenter
        centersArray
  
    # 000   000   0000000   00000000   00     00   0000000   000       0000000  
    # 0000  000  000   000  000   000  000   000  000   000  000      000       
    # 000 0 000  000   000  0000000    000000000  000000000  000      0000000   
    # 000  0000  000   000  000   000  000 0 000  000   000  000           000  
    # 000   000   0000000   000   000  000   000  000   000  0000000  0000000   
    
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

module.exports = Polyhedron
    