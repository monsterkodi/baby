###
00000000    0000000   000      000   000  000   000  00000000  0000000    00000000    0000000   000   000  
000   000  000   000  000       000 000   000   000  000       000   000  000   000  000   000  0000  000  
00000000   000   000  000        00000    000000000  0000000   000   000  0000000    000   000  000 0 000  
000        000   000  000         000     000   000  000       000   000  000   000  000   000  000  0000  
000         0000000   0000000     000     000   000  00000000  0000000    000   000   0000000   000   000  
###

# Polyhédronisme, Copyright 2019, Anselm Levskaya, MIT License

{ _, rad2deg } = require 'kxk'
{ add, cross, faceToEdges, facesToWings, mag, mult, normal, sub } = require './math'
{ min } = Math
Vect = require '../vect'

class Polyhedron 

    @: (@name, @face, @vertex) ->

        @face   ?= []
        @vertex ?= [] 
        @name   ?= "polyhedron"

    # 000   000  00000000  000   0000000   000   000  0000000     0000000   00000000    0000000  
    # 0000  000  000       000  000        000   000  000   000  000   000  000   000  000       
    # 000 0 000  0000000   000  000  0000  000000000  0000000    000   000  0000000    0000000   
    # 000  0000  000       000  000   000  000   000  000   000  000   000  000   000       000  
    # 000   000  00000000  000   0000000   000   000  0000000     0000000   000   000  0000000   
    
    neighbors: ->

        neighbors = ([] for v in @vertex)
        for face in @face
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
        
    neighborsAndFaces: ->

        neighbors = ([] for v in @vertex)
        for face,fi in @face
            for vi in [0...face.length]
                ni = (vi+1) % face.length
                if face[ni] not in neighbors[face[vi]]
                    neighbors[face[vi]].push vertex:face[ni], face:fi
                if face[vi] not in neighbors[face[ni]]
                    neighbors[face[ni]].push vertex:face[vi], face:fi
              
        for vi in [0...neighbors.length]
            toVertex = @vert vi
            toVertex.normalize()
            toN0 = @vert neighbors[vi][0]
            perp = toVertex.crossed toN0
            neighbors[vi].sort (a,b) =>
                aa = Vect.GetAngleBetweenVectors perp, @vert(a.vertex), toVertex
                bb = Vect.GetAngleBetweenVectors perp, @vert(b.vertex), toVertex
                aa - bb
                    
        neighbors
        
    # 000   000  000  000   000   0000000    0000000  
    # 000 0 000  000  0000  000  000        000       
    # 000000000  000  000 0 000  000  0000  0000000   
    # 000   000  000  000  0000  000   000       000  
    # 00     00  000  000   000   0000000   0000000   
    
    wings: -> facesToWings @face
                        
    # 00000000  0000000     0000000   00000000   0000000  
    # 000       000   000  000        000       000       
    # 0000000   000   000  000  0000  0000000   0000000   
    # 000       000   000  000   000  000            000  
    # 00000000  0000000     0000000   00000000  0000000   
    
    edges: ->
        
        uniqEdges = {}
        faceEdges = @face.map faceToEdges
        for edgeSet in faceEdges
            for e in edgeSet
                if e[0]<e[1] then [a, b] = e
                else              [b, a] = e
                uniqEdges["#{a}~#{b}"] = e
        _.values uniqEdges
      
    edge: (v1, v2) ->
        
        @vert(v2).subtract @vert(v1)
    
    edgeNormal: (v1, v2) ->
        
        @vertexNormal(v1).addInPlace(@vertexNormal(v2)).scale(0.5)
        
    minEdgeLength: ->
        
        minEdgeLength = Infinity
        
        for edge in @edges()
            minEdgeLength = min minEdgeLength, @vert(edge[0]).dist @vert edge[1]
            
        minEdgeLength

    maxEdgeDifference: ->
        diffs = []
        for face in @face
            length = []
            for edge in faceToEdges face
                length.push @vert(edge[0]).to(@vert(edge[1])).length()
            diffs.push _.max(length) - _.min(length)
        _.max diffs
        
    # 000   000  00000000  00000000   000000000  00000000  000   000  
    # 000   000  000       000   000     000     000        000 000   
    #  000 000   0000000   0000000       000     0000000     00000    
    #    000     000       000   000     000     000        000 000   
    #     0      00000000  000   000     000     00000000  000   000  
    
    vert: (vi) -> 
    
        new Vect @vertex[vi]
                
    vertexNormal: (vi) ->
         
        sum = new Vect 0 0 0
        for ni in @neighbors(vi)
            sum.addInPlace @edge vi, ni
        sum.normalize()
        sum
                
    facesAtVertex: (vi) ->
        
        faces = []
        for face,fi in @face
            if vi in face
                faces.push fi
        faces
        
    scale: (factor) ->
        
        for v in @vertex
            v[0] *= factor
            v[1] *= factor
            v[2] *= factor
        @
        
    #  0000000  00000000  000   000  000000000  00000000  00000000    0000000  
    # 000       000       0000  000     000     000       000   000  000       
    # 000       0000000   000 0 000     000     0000000   0000000    0000000   
    # 000       000       000  0000     000     000       000   000       000  
    #  0000000  00000000  000   000     000     00000000  000   000  0000000   
    
    centers: -> 
        centersArray = []
        for face in @face
            fcenter = [0 0 0]
            for vidx in face
                fcenter = add fcenter, @vertex[vidx]
            centersArray.push mult 1.0/face.length, fcenter
        centersArray
        
    minFaceDist: ->
        
        minFaceDist = Infinity
        
        for center in @centers()
            minFaceDist = min minFaceDist, mag center
            
        minFaceDist
  
    # 000   000   0000000   00000000   00     00   0000000   000       0000000  
    # 0000  000  000   000  000   000  000   000  000   000  000      000       
    # 000 0 000  000   000  0000000    000000000  000000000  000      0000000   
    # 000  0000  000   000  000   000  000 0 000  000   000  000           000  
    # 000   000   0000000   000   000  000   000  000   000  0000000  0000000   
    
    normals: -> 
        
        normalsArray = []
        for face in @face
            normalsArray.push normal face.map (vidx) => @vertex[vidx]
        normalsArray
  
    data: ->
        
        nEdges = (@face.length + @vertex.length) - 2 # E = V + F - 2
        "#{@face.length} faces, #{nEdges} edges, #{@vertex.length} vertices"
        
    colorize: (method='sidedness') -> # assign color indices to faces
        
        @colors = []
        colormemory = {}
        colorassign = (hash) -> colormemory[hash] ?= _.size colormemory
      
        switch method
            when 'signature' # color by congruence signature
                @colors = @face.map (f) => colorassign @signature f
            else # color by face-sidedness
                @colors = @face.map (f) -> f.length - 3
    
        # klog "#{_.size(colormemory)+1} colors:" @colors
        @

    #  0000000  000   0000000   000   000   0000000   000000000  000   000  00000000   00000000  
    # 000       000  000        0000  000  000   000     000     000   000  000   000  000       
    # 0000000   000  000  0000  000 0 000  000000000     000     000   000  0000000    0000000   
    #      000  000  000   000  000  0000  000   000     000     000   000  000   000  000       
    # 0000000   000   0000000   000   000  000   000     000      0000000   000   000  00000000  
    
    signature: (face) ->
    
        vertices = face.map (v) => @vertex[v]
        angles = []
        
        [v1, v2] = vertices.slice -2
        for v3 in vertices # accumulate inner angles        
            angles.push parseInt rad2deg mag cross sub(v1, v2), sub(v3, v2)
            [v1, v2] = [v2, v3]
    
        angles.sort().join '_'
        
module.exports = Polyhedron
    