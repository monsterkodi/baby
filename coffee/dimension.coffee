###
0000000    000  00     00  00000000  000   000   0000000  000   0000000   000   000
000   000  000  000   000  000       0000  000  000       000  000   000  0000  000
000   000  000  000000000  0000000   000 0 000  0000000   000  000   000  000 0 000
000   000  000  000 0 000  000       000  0000       000  000  000   000  000  0000
0000000    000  000   000  00000000  000   000  0000000   000   0000000   000   000
###

{ Color3, Mesh, StandardMaterial, TransformNode } = require 'babylonjs'
{ klog } = require 'kxk'
{ random } = Math
{ vec } = require './poly/math'
generate = require './poly/generate'

class Dimension extends TransformNode

    @: (@world, @scale, pos=vec()) ->
        
        @scene = @world.scene
        super 'dimension' @scene
        
        @position.copyFrom pos

        s = @scale
        @scaling = vec s, s, s
        
        for i in [0..9]
        
            p = Mesh.CreatePolyhedron "dim_#{i}" {custom:generate 'h0.01I'}, @scene
            s = 1 - i*0.1
            p.scaling = vec s, s, s
            p.parent = @
            p.material = new StandardMaterial
            p.material.diffuseColor = new Color3 1 1 1
            # p.material.alpha = 0.5
        
    del: ->
        klog "dim del #{@name}"
        @dispose()
        
    scaleDown: ->
        
        s = @scaling.x/100
        @scaling = vec s, s , s

    scaleUp: (offset) ->
        
        @position.subtractInPlace offset
        s = @scaling.x*100
        @scaling = vec s, s , s
        
module.exports = Dimension
