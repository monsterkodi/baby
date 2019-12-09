###
00000000  000       0000000    0000000 
000       000      000   000  000      
000000    000      000000000  000  0000
000       000      000   000  000   000
000       0000000  000   000   0000000 
###
#
# Polyhédronisme, Copyright 2019, Anselm Levskaya, MIT License

{ kerror } = require 'kxk'
{ mag, sub } = require './math'

Polyhedron = require './polyhedron'

class Flag
    
    @: ->
        @flags    = {} # [face][vertex] -> next vertex
        @vertices = {} # [name] -> coordinates
  
    newV: (vertName, coords) ->
        if not @vertices[vertName]
            @vertices[vertName] = coords
        else
            diff = sub coords, @vertices[vertName]
            if mag(diff) > 0.02
                # klog "#{vertName}" mag diff
                return true
        false
                # @vertices[vertName] = add @vertices[vertName], mult 0.5 diff
  
    edge: (faceName, vertName1, vertName2) ->
        
        @flags[faceName] ?= {}
        @flags[faceName][vertName1] = vertName2
  
    topoly: (name='polyhedron') ->

        poly = new Polyhedron name
    
        nm2idx = {}
        ctr = 0
        for name,v of @vertices
            poly.vertices[ctr] = @vertices[name]
            nm2idx[name] = ctr++
            
        # klog 'topoly' @
            
        ctr = 0
        for i,face of @flags
            newFace = []
            for j,v0 of face
                vN = v0 # any vertex as starting point
                break

            newFace.push nm2idx[vN]
            vN = @flags[i][vN] # goto next vertex
            faceCount = 0
            while vN != v0 # loop until back to start
                newFace.push nm2idx[vN]
                vN = @flags[i][vN]
                if faceCount++ > 100 # prevent infinite loop
                    kerror "Bad flag with neverending face:" i, @flags[i]
                    break
            poly.faces[ctr] = newFace
            ctr++
            
        # klog 'poly' poly
        
        poly

module.exports = Flag
