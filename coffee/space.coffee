###
 0000000  00000000    0000000    0000000  00000000
000       000   000  000   000  000       000     
0000000   00000000   000000000  000       0000000 
     000  000        000   000  000       000     
0000000   000        000   000   0000000  00000000
###

{ Space, TransformNode } = require 'babylonjs'
{ klog } = require 'kxk'
{ random } = Math
{ vec } = require './poly/math'
generate = require './poly/generate'
Dimension = require './dimension'

class Space

    @: (@world) ->

        @scene = @world.scene
        @dimstack = []
        
        @trans = new TransformNode 'trans' @scene, true
        
        sz = 1
        for d in [0..2]
            dims = 
            @dimstack.push @newDims sz
            sz *= 100
            
        for dim in @dimstack[0]
            dim.parent = @trans
        for dim in @dimstack[1]
            dim.parent = null
        for dim in @dimstack[2]
            dim.parent = null
            
    newDims: (sz) ->
        
        dims = []
        for i in [0...8]
            dims.push new Dimension @world, sz, vec 2*sz*(i%2), 2*sz*((i>>1)%2), 2*sz*((i>>2)%2)
            dims[-1].name = "dim_#{i}"
        dims        
        
    render: ->
        
        campos = vec @world.camera.position
        oldDistance = @distance
        
        swapDist = 19000
        
        @distance = campos.length()
        @distFactor = @distance / swapDist
        
        klog 'distance' @distance
        
        if @distance >= swapDist
            if oldDistance < swapDist
                klog 'distance' @distance, 'distFactor' @distFactor
                
                for low in @dimstack[0]
                    low.del()
                
                for high in @dimstack[1]
                    high.scaleDown()

                for high in @dimstack[2]
                    high.scaleDown()
                    
                @dimstack[0] = @dimstack[1]
                @dimstack[1] = @dimstack[2]
                                
                @world.camera.scaleDown()
                @distance *= 0.01
                @distFactor = @distance / swapDist
                klog 'newDistance' @distance, @world.camera.position.length()
                @dimstack[2] = @newDims 10000
                
                for dim in @dimstack[0]
                    dim.parent = @trans
                for dim in @dimstack[1]
                    dim.parent = null
                for dim in @dimstack[2]
                    dim.parent = null
                
        else
            @dimstack[1].sort (a,b) ->
                campos.to(a.position).length()-campos.to(b.position).length()
            @trans.position.copyFrom @dimstack[1][0].position
            
            @distance = campos.to(@dimstack[1][0].position).length()
            @distFactor = @distance / swapDist
            
            if @distance < swapDist/100 and oldDistance > swapDist/100
            
                klog 'distance' @distance, 'distFactor' @distFactor
                offset = vec @dimstack[1][0].position
                
                for high in @dimstack[2]
                    high.del()
                
                for low in @dimstack[1]
                    low.scaleUp offset

                for low in @dimstack[0]
                    low.scaleUp offset
                    
                @dimstack[2] = @dimstack[1]
                @dimstack[1] = @dimstack[0]
                
                @world.camera.scaleUp offset
                @distance *= 100
                @distFactor = @distance / swapDist
                klog 'newDistance' @distance, @world.camera.position.length()
                
                @dimstack[0] = @newDims 1
                
                for dim in @dimstack[0]
                    dim.parent = @trans
                for dim in @dimstack[1]
                    dim.parent = null
                for dim in @dimstack[2]
                    dim.parent = null
            
module.exports = Space
