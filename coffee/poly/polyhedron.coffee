###
00000000    0000000   000      000   000  000   000  00000000  0000000    00000000    0000000   000   000  
000   000  000   000  000       000 000   000   000  000       000   000  000   000  000   000  0000  000  
00000000   000   000  000        00000    000000000  0000000   000   000  0000000    000   000  000 0 000  
000        000   000  000         000     000   000  000       000   000  000   000  000   000  000  0000  
000         0000000   0000000     000     000   000  00000000  0000000    000   000   0000000   000   000  
###
#
# Polyhédronisme, Copyright 2019, Anselm Levskaya, MIT License
#

{ _ } = require 'kxk'
{ add, mult, normal } = require './math'

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

module.exports = Polyhedron
    