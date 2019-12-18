###
000000000  00000000   00000000  00000000
   000     000   000  000       000     
   000     0000000    0000000   0000000 
   000     000   000  000       000     
   000     000   000  00000000  00000000
###

{ Color3, TransformNode, Vector3 } = require 'babylonjs'
{ colors } = require 'kxk'
{ random } = Math
{ vec } = require './poly/math'
generate = require './poly/generate'

class Tree extends TransformNode

    @: (@world) ->
        
        @scene = @world.scene
        super 'tree' @scene
        
        shapes = ['hC''hO''hD''hdjC''hT''hI']
        colors = [
            new Color3 1 0 0
            new Color3 0 .5 0
            new Color3 0 0 1
            new Color3 1 0 1
            new Color3 1 1 0
            new Color3 .3 .3 .3
            ]
        
        for index in [0...shapes.length]
            inst = @world.shapes.create shapes[index], colors[index]
            inst.scaling = new Vector3 100, 100, 100
            inst.position.x = index*200
            inst.parent = @

module.exports = Tree
