###
0000000    000  00     00  00000000  000   000   0000000  000   0000000   000   000
000   000  000  000   000  000       0000  000  000       000  000   000  0000  000
000   000  000  000000000  0000000   000 0 000  0000000   000  000   000  000 0 000
000   000  000  000 0 000  000       000  0000       000  000  000   000  000  0000
0000000    000  000   000  00000000  000   000  0000000   000   0000000   000   000
###

{ Color3, TransformNode, Vector3 } = require 'babylonjs'
{ klog } = require 'kxk'
{ random } = Math
{ vec } = require './poly/math'
generate = require './poly/generate'

class Dimension extends TransformNode

    @: (@world, @scale, index) ->
        
        pos = [
            vec 2 0 0
            vec 0 2 0
            vec 0 0 2
            vec -2 0 0
            vec 0 -2 0
            vec 0 0 -2
            ][index]
        
        @scene = @world.scene
        super 'dimension' @scene
        
        @position.copyFrom pos

        s = @scale
        @scaling = vec s, s, s
                 
        shapes = ['h0.02C''h0.02O''h0.02D''h0.02djC''h0.02T''h0.02I']
                
        for i in [0...5]
            inst = @world.shapes.create shapes[index], new Color3 0.5 0.5 1 # p.createInstance "#{poly.name}_#{i}" 
            s = 1 - i*0.2
            inst.scaling = new Vector3 s, s, s
            inst.parent = @
            # inst.rotate vec(0,1,0), deg2rad i*6
            # inst.rotate vec(1,0,0), deg2rad random()*180
        
    del: ->
        # klog "dim del #{@name}"
        @dispose()
                
module.exports = Dimension
