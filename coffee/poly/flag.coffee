###
00000000  000       0000000    0000000 
000       000      000   000  000      
000000    000      000000000  000  0000
000       000      000   000  000   000
000       0000000  000   000   0000000 
###
#
# Polyhédronisme, Copyright 2019, Anselm Levskaya, MIT License

{ kerror, klog } = require 'kxk'
Polyhedron = require './polyhedron'

class Flag
    
    @: ->
        @flags    = {} # [face][vertex] -> next vertex
        @vertices = {} # [name] -> coordinates
  
    newV: (vertName, coordinates) ->
        
        if not @vertices[vertName]
            @vertices[vertName] = coordinates
  
    newFlag: (faceName, vertName1, vertName2) ->
        
        @flags[faceName] ?= {}
        @flags[faceName][vertName1] = vertName2
  
    topoly: (name='polyhedron') ->

        poly = new Polyhedron name
    
        # ctr = 0
        for i,v of @vertices
            poly.vertices[ctr] = @vertices[i]
            # vertidxs[i] = ctr # number the vertices
            # ctr++
            
        klog 'topoly' @
            
        ctr = 0
        for i,face of @flags
            newFace = []
            for j,v0 of face
                v = v0 # any vertex as starting point
                break

            newFace.push v # @vertidxs[v] # record index
            v = @flags[i][v] # goto next vertex
            faceCount = 0
            while v != v0 # loop until back to start
                newFace.push v # @vertidxs[v]
                v = @flags[i][v]
                if faceCount++ > 100 # prevent infinite loop
                    kerror "Bad flag with neverending face:" i, @flags[i]
                    break
            poly.faces[ctr] = newFace
            ctr++
            
        # klog 'poly' poly
        
        poly

module.exports = Flag
