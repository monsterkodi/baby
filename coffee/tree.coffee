###
000000000  00000000   00000000  00000000
   000     000   000  000       000     
   000     0000000    0000000   0000000 
   000     000   000  000       000     
   000     000   000  00000000  00000000
###

{ Color3, Quaternion, TransformNode, Vector3 } = require 'babylonjs'
{ klog } = require 'kxk'
{ abs } = Math
{ normal, vec } = require './poly/math'
Vect = require './vect'
generate = require './poly/generate'

class Tree extends TransformNode

    @: (@world) ->
        
        @scene = @world.scene
        super 'tree' @scene
        
        @instances = []
        @shapes = ['I''C''djC''O''T''D''O''I']
        @colors = [
            new Color3 0 0 0.2
            new Color3 0 0 0.4
            new Color3 0 0 0.6
            new Color3 0 0 0.8
            new Color3 0 0 1
            ]
            
        @branch 'C' 0
        
    render: ->
        
        for inst in @instances
            if inst.normal
                inst.rotationQuaternion.multiplyInPlace Quaternion.RotationAxis vec(0,1,0), 0.005
            
    branch: (code, depth, scale=1000, pos, parent, normal) ->
        
        pos ?= new Vector3(0 0 0)
        code = @shapes[depth]
        inst = @world.shapes.create code, @colors[depth]
        if normal
            ay = Vector3.FromArray normal
            if abs(Vector3.Dot(ay, new Vector3(0,0,1))) < 1
                ax = new Vector3(0,0,1).cross(ay)
                az = ax.cross(ay)
            else
                ax = new Vector3(1,0,0).cross(ay)
                az = ax.cross(ay)
            inst.rotationQuaternion = Quaternion.RotationQuaternionFromAxis ax, ay, az
        inst.parent = parent
        inst.normal = normal
        inst.position.copyFrom pos
        inst.scaling = new Vector3 scale, scale, scale
        
        @instances.push inst
        
        if depth < 3
            poly = generate code
            centers = poly.centers()
            normals = poly.normals()
            for center,ci in centers
                @branch code, depth+1, 0.4, Vector3.FromArray(center).scale(1.5), inst, normals[ci]

module.exports = Tree
