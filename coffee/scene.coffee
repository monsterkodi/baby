###
 0000000   0000000  00000000  000   000  00000000
000       000       000       0000  000  000     
0000000   000       0000000   000 0 000  0000000 
     000  000       000       000  0000  000     
0000000    0000000  00000000  000   000  00000000
###

{ klog } = require 'kxk'
babylon = require 'babylonjs'

Vect = require './vect'
{ Color3, Vector3, VertexBuffer, MeshBuilder } = require 'babylonjs'

class Scene extends babylon.Scene 

    @: (engine) -> super

    showNormals: (mesh, size, color)->
        
        normals   = mesh.getVerticesData VertexBuffer.NormalKind
        positions = mesh.getVerticesData VertexBuffer.PositionKind
        color ?= new Color3 0.2 0.2 0.2
        size  ?= 0.2
        lines  = []
        
        for i in [0...normals.length] by 3
            v1 = Vector3.FromArray positions, i
            v2 = v1.add Vector3.FromArray(normals, i).scaleInPlace(size)
            lines.push [v1, v2]
            
        system = MeshBuilder.CreateLineSystem 'normals' lines:lines
        system.color = color
        mesh.addChild system
        system
        
    showFaces: (mesh, poly, color)->
                
        color ?= new Color3 0 0 0
        lines  = []

        for face in poly.face
            v1 = new Vect poly.vertex[face[-1]]
            for vi in [0...face.length]
                v2 = new Vect poly.vertex[face[vi]]
                lines.push [v1, v2]
                v1 = v2
            
        system = MeshBuilder.CreateLineSystem 'faces' lines:lines
        system.scaling = new Vector3 1.005 1.005 1.005
        system.color = color
        mesh.addChild system
        system

module.exports = Scene
