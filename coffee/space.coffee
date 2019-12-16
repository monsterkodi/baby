###
 0000000  00000000    0000000    0000000  00000000
000       000   000  000   000  000       000     
0000000   00000000   000000000  000       0000000 
     000  000        000   000  000       000     
0000000   000        000   000   0000000  00000000
###

{ Space } = require 'babylonjs'
{ klog } = require 'kxk'
{ random } = Math
{ vec } = require './poly/math'
generate = require './poly/generate'
Dimension = require './dimension'

class Space

    @: (@world) ->

        @scene = @world.scene
        @higher = []
        for i in [0...8]
            @higher.push new Dimension @world, 10000, vec 20000*(i%2), 20000*((i>>1)%2), 20000*((i>>2)%2)
            @higher[-1].name = "higher_#{i}"
        
        @lower = []
        for i in [0...8]
            @lower.push new Dimension @world, 100, vec 200*(i%2), 200*((i>>1)%2), 200*((i>>2)%2)
            @lower[-1].name = "lower_#{i}"
        
    render: ->
        
        campos = vec @world.camera.position
        oldDistance = @distance
        
        swapDist = 19000
        
        @distance = campos.length()
        @distFactor = @distance / swapDist
        
        klog 'distance' @distance
        
        if @distance >= swapDist
            if oldDistance < swapDist
                # klog 'distance' @distance, 'distFactor' @distFactor, 'lower' @lower.length
                
                for lower in @lower
                    lower.del()
                
                for higher in @higher
                    higher.scaleDown()
                    
                @lower = @higher
                
                @world.camera.scaleDown()
                @distance *= 0.01
                @distFactor = @distance / swapDist
                klog 'newDistance' @distance, @world.camera.position.length()
                @higher = []
                for i in [0...8]
                    @higher.push new Dimension @world, 10000, vec 20000*(i%2), 20000*((i>>1)%2), 20000*((i>>2)%2)
                    @higher[-1].name = "higher_#{i}"
                
        else
            @lower.sort (a,b) ->
                campos.to(a.position).length()-campos.to(b.position).length()
                
            @distance = campos.to(@lower[0].position).length()
            @distFactor = @distance / swapDist
            
            if @distance < swapDist/100 and oldDistance > swapDist/100
            
                # klog 'distance' @distance, 'distFactor' @distFactor, 'lower' @lower[0].name
                offset = vec @lower[0].position
                
                for higher in @higher
                    higher.del()
                
                for lower in @lower
                    lower.scaleUp offset
                
                @higher = @lower

                @world.camera.scaleUp offset
                @distance *= 100
                @distFactor = @distance / swapDist
                klog 'newDistance' @distance, @world.camera.position.length()
                
                @lower = []
                for i in [0...4]
                    @lower.push new Dimension @world, 1, vec 2*(i%2), 2*((i>>1)%2), 2*((i>>2)%2)
                    @lower[-1].name = "lower_#{i}"
                
module.exports = Space
