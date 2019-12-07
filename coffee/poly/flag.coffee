###
00000000  000       0000000    0000000 
000       000      000   000  000      
000000    000      000000000  000  0000
000       000      000   000  000   000
000       0000000  000   000   0000000 
###

{ kerror } = require 'kxk'
Polyhedron = require './polyhedron'

# Polyhedron Flag Construct
#
# A Flag is an associative triple of a face index and two adjacent vertex vertidxs,
# listed in geometric clockwise order (staring into the normal)
#
# Face_i -> V_i -> V_j
#
# They are a useful abstraction for defining topological transformations of the polyhedral mesh, as
# one can refer to vertices and faces that don't yet exist or haven't been traversed yet in the
# transformation code.
#
# A flag is similar in concept to a directed halfedge in halfedge data structures.

class Flag
    
    @: ->
        @flags    = {} # flags[face][vertex] = next vertex
        @vertidxs = {} # [symbolic names] holds vertex index
        @vertices = {} # XYZ coordinates
  
    newV: (vertName, coordinates) ->
        
        if not @vertidxs[vertName]
            @vertidxs[vertName] = 0
            @vertices[vertName] = coordinates
  
    newFlag: (faceName, vertName1, vertName2) ->
        
        @flags[faceName] ?= {}
        @flags[faceName][vertName1] = vertName2
  
    topoly: (name='polyhedron') ->

        poly = new Polyhedron name
    
        # klog 'topoly' @
        
        ctr = 0 
        for i,v of @vertidxs 
            poly.vertices[ctr] = @vertices[i]
            @vertidxs[i] = ctr # number the vertices
            ctr++
            
        ctr = 0
        for i,face of @flags
            newFace = []
            for j,v0 of face
                v = v0 # any vertex as starting point
                break

            newFace.push @vertidxs[v] # record index
            v = @flags[i][v] # goto next vertex
            faceCount = 0
            while v != v0 # loop until back to start
                newFace.push @vertidxs[v]
                v = @flags[i][v]
                if faceCount++ > 100 # prevent infinite loop on badly formed flagsets
                    kerror "Bad flag with neverending face:" i, @flags[i]
                    break
            poly.faces[ctr] = newFace
            ctr++
            
        # klog 'poly' poly
        
        poly

module.exports = Flag
