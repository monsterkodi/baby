###
00000000    0000000   000      000   000  000   000  00000000  0000000    00000000    0000000   000   000  
000   000  000   000  000       000 000   000   000  000       000   000  000   000  000   000  0000  000  
00000000   000   000  000        00000    000000000  0000000   000   000  0000000    000   000  000 0 000  
000        000   000  000         000     000   000  000       000   000  000   000  000   000  000  0000  
000         0000000   0000000     000     000   000  00000000  0000000    000   000   0000000   000   000  
###

# Polyhédronisme, Copyright 2019, Anselm Levskaya, MIT License

{ _, rad2deg, valid } = require 'kxk'
{ add, center, cross, dot, faceToEdges, facesToWings, mag, mult, normal, pointPlaneDist, sub, tangentPoint, vec } = require './math'
{ abs, min } = Math
Vect = require '../vect'

class Polyhedron 

    @: (@name, @face, @vertex) ->

        @name   ?= "polyhedron"
        @face   ?= []
        @vertex ?= [] 
        @debug   = []

    # 0000000    00000000  0000000    000   000   0000000   
    # 000   000  000       000   000  000   000  000        
    # 000   000  0000000   0000000    000   000  000  0000  
    # 000   000  000       000   000  000   000  000   000  
    # 0000000    00000000  0000000     0000000    0000000   
    
    debugLine: (v1, v2) ->
        
        if v1.constructor.name == 'Number'
            v1 = @vertex[v1]
        else if v1.toArray?
            a = []
            v1.toArray a
            v1 = a

        if v2.constructor.name == 'Number'
            v2 = @vertex[v2]
        else if v2.toArray?
            a = []
            v2 = v2.toArray a
            v2 = a
        
        @debug.push [v1, v2]
        
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
                aa = perp.angle @vert(a), toVertex
                bb = perp.angle @vert(b), toVertex
                
                # aa = Vect.GetAngleBetweenVectors perp, @vert(a), toVertex
                # bb = Vect.GetAngleBetweenVectors perp, @vert(b), toVertex
                aa - bb
                    
        neighbors
        
    neighborsAndFaces: -> # unused

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
                aa = perp.angle @vert(a), toVertex
                bb = perp.angle @vert(b), toVertex                
                # aa = Vect.GetAngleBetweenVectors perp, @vert(a.vertex), toVertex
                # bb = Vect.GetAngleBetweenVectors perp, @vert(b.vertex), toVertex
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
        
        @vert(v2).sub @vert(v1)
    
    edgeNormal: (v1, v2) ->
        
        @vertexNormal(v1).add(@vertexNormal(v2)).scale(0.5)
        
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
    
        vec @vertex[vi]
                
    vertexNormal: (vi) ->
         
        sum = vec 0 0 0
        for ni in @neighbors(vi)
            sum.add @edge vi, ni
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
        
    normalize: ->
        
        @recenter()
        @rescale()
        @        
        
    # 00000000   00000000   0000000  00000000  000   000  000000000  00000000  00000000   
    # 000   000  000       000       000       0000  000     000     000       000   000  
    # 0000000    0000000   000       0000000   000 0 000     000     0000000   0000000    
    # 000   000  000       000       000       000  0000     000     000       000   000  
    # 000   000  00000000   0000000  00000000  000   000     000     00000000  000   000  
    
    recenter: ->
        # recenters entire polyhedron such that center of mass is at origin
        edges = @edges()
        edgecenters = edges.map ([a, b]) => tangentPoint @vertex[a], @vertex[b]
        
        polycenter = [0 0 0]
    
        for v in edgecenters
            polycenter = add polycenter, v
            
        polycenter = mult 1/edges.length, polycenter
    
        @vertex = _.map @vertex, (x) -> sub x, polycenter
        @debug = _.map @debug, (dbg) -> dbg.map (x) -> sub x, polycenter
        @
    
    # 00000000   00000000   0000000   0000000   0000000   000      00000000  
    # 000   000  000       000       000       000   000  000      000       
    # 0000000    0000000   0000000   000       000000000  000      0000000   
    # 000   000  000            000  000       000   000  000      000       
    # 000   000  00000000  0000000    0000000  000   000  0000000  00000000  
    
    rescale: ->
        # rescales maximum radius of polyhedron to 1
        polycenter = [0 0 0]
        maxExtent = _.max _.map @vertex, (x) -> mag x
        s = 1 / maxExtent
        @vertex = _.map @vertex, (x) -> [s*x[0], s*x[1], s*x[2]]
        @debug = _.map @debug, (dbg) -> dbg.map (x) -> [s*x[0], s*x[1], s*x[2]]
        @
            
    #  0000000  00000000  000   000  000000000  00000000  00000000    0000000  
    # 000       000       0000  000     000     000       000   000  000       
    # 000       0000000   000 0 000     000     0000000   0000000    0000000   
    # 000       000       000  0000     000     000       000   000       000  
    #  0000000  00000000  000   000     000     00000000  000   000  0000000   
    
    centers: -> @face.map (f) => center f.map (vi) => @vertex[vi]
        
    minFaceDist: ->
        
        minFaceDist = Infinity
        
        for ctr in @centers()
            minFaceDist = min minFaceDist, mag ctr
            
        minFaceDist

    # 00000000  000       0000000   000000000  000   000  00000000   0000000   0000000  
    # 000       000      000   000     000     0000  000  000       000       000       
    # 000000    000      000000000     000     000 0 000  0000000   0000000   0000000   
    # 000       000      000   000     000     000  0000  000            000       000  
    # 000       0000000  000   000     000     000   000  00000000  0000000   0000000   
    
    flatness: ->
        
        vertexdist = {}
        offsets = {}
        neighbors = @neighbors()
        
        for face,fi in @face
            continue if face.length <= 3
            # continue if face.length >= 6
            for vi in face
                others = face.filter((v) => v != vi).map (v) => @vertex[v]
                norm = normal others
                cent = center others
                d = pointPlaneDist @vertex[vi], cent, norm
                s = dot(norm,sub(@vertex[vi],cent))>0 and 1 or -1
                vertexdist["#{fi}▸#{vi}"] = s*d
                    
        avg = @vertex.map (v) -> vec()
        
        for face,fi in @face
            continue if face.length <= 3
            # continue if face.length >= 6
            fi = parseInt fi
            face = @face[fi]
            for vi in face
                others = face.filter((v) -> v != vi).map (v) => @vertex[v]
                norm = normal others
                vdist = vertexdist["#{fi}▸#{vi}"]
                avg[vi].add vec mult -vdist, norm
        
        for vi in [0...@vertex.length]
            offsets[vi] = avg[vi].mul(1/neighbors[vi].length).coords()

        flatness = 0
        
        if valid vertexdist
            for k,vd of vertexdist
                flatness += abs vd
            flatness /= _.size vertexdist
            
        [ flatness, vertexdist, offsets ]
  
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
    