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
        
        for d in [0..2]
            @dimstack.push new TransformNode 'trans' @scene, true
            sz = ((d == 2) and 10000 or 0.01)
            @dimstack[-1].scaling.copyFromFloats sz, sz, sz
            for dim in @newDims()
                dim.parent = @dimstack[-1]
                                        
    newDims: ->
        
        dims = []
        dims.push new Dimension @world, 1, vec()
        dims.push new Dimension @world, 1, vec 2 0 0
        dims.push new Dimension @world, 1, vec 0 2 0
        dims.push new Dimension @world, 1, vec 0 0 2
        dims.push new Dimension @world, 1, vec -2 0 0
        dims.push new Dimension @world, 1, vec 0 -2 0
        dims.push new Dimension @world, 1, vec 0 0 -2
        dims        
        
    render: ->
        
        swapDist = 40000
        campos = vec @world.camera.position
        oldDistance = @distance
                
        higer = @dimstack[2].getChildren()
        higer.sort (a,b) -> campos.to(a.getAbsolutePosition()).length()-campos.to(b.getAbsolutePosition()).length()
        @dimstack[1].parent = higer[0]
        @dimstack[1].markAsDirty()
        
        midle = @dimstack[1].getChildren()
        midle.sort (a,b) -> campos.to(a.getAbsolutePosition()).length()-campos.to(b.getAbsolutePosition()).length()
        @dimstack[0].parent = midle[0]
        @dimstack[0].markAsDirty()
        
        lower = @dimstack[0].getChildren()
        lower.sort (a,b) -> campos.to(a.getAbsolutePosition()).length()-campos.to(b.getAbsolutePosition()).length()
        
        @distance = campos.to(lower[0].getAbsolutePosition()).length()
        @distFactor = @distance / swapDist
        
        # klog 'distance' parseInt @distance #, higer[0].name, midle[0].name, lower[0].name
                        
        if @distance >= swapDist
            if oldDistance < swapDist
                # klog 'distance' @distance, 'distFactor' @distFactor

                hig2ctr = vec(higer[0].getAbsolutePosition()).to @world.camera.center
                
                for low in @dimstack[0]
                    low.del()
                @dimstack[0].dispose()
                
                sz = 0.01
                @dimstack[2].scaling.copyFromFloats sz, sz, sz
                
                trans2 = new TransformNode 'trans' @scene, true
                                          
                sz = 10000
                trans2.scaling.copyFromFloats sz, sz, sz
                
                for dim in @newDims()
                    dim.parent = trans2
                
                @dimstack.shift()
                @dimstack.push trans2
                
                @dimstack[1].parent = trans2.getChildren()[0]
                
                @world.camera.dist *= 0.01
                @world.camera.center = vec higer[0].getAbsolutePosition().add hig2ctr.mul 0.01
                @world.camera.navigate()
                
                @distance *= 0.01
                @distFactor = @distance / swapDist
                # klog 'newDistance' @distance, @world.camera.position.length()
                                
        else if @distance < swapDist/100 and oldDistance > swapDist/100

                # klog 'distance' @distance, 'distFactor' @distFactor

                mid2ctr = vec(midle[0].getAbsolutePosition()).to @world.camera.center
                
                @dimstack[1].parent = null
                
                for high in @dimstack[2]
                    high.del()
                @dimstack[2].dispose()
                
                sz = 10000
                @dimstack[1].scaling.copyFromFloats sz, sz, sz

                trans0 = new TransformNode 'trans' @scene, true
                                
                sz = 0.01
                trans0.scaling.copyFromFloats sz, sz, sz
                
                for dim in @newDims()
                    dim.parent = trans0
                
                @dimstack.pop()
                @dimstack.unshift trans0
                   
                @world.camera.dist *= 100
                @world.camera.center = vec midle[0].getAbsolutePosition().add mid2ctr.mul 100
                @world.camera.navigate()
                
                @distance *= 100
                @distFactor = @distance / swapDist
                # klog 'newDistance' @distance, @world.camera.position.length()
            
module.exports = Space
