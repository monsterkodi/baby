###
 0000000   0000000  00000000  000   000  00000000
000       000       000       0000  000  000     
0000000   000       0000000   000 0 000  0000000 
     000  000       000       000  0000  000     
0000000    0000000  00000000  000   000  00000000
###

{ klog } = require 'kxk'
{ Color3, MeshBuilder, Scene, Vector3, VertexBuffer } = require 'babylonjs'

babylon = require 'babylonjs'
GUI     = require 'babylonjs-gui'
Vect    = require './vect'
Legend  = require './legend'

class Scene extends babylon.Scene 

    @: (engine) -> 
    
        super
        @ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI 'ui'
        
        @legend = new Legend @ui
        
        @style = @ui.createStyle()
        @style.fontSize = 12
        @style.fontFamily = 'fontMono'
        @style.height = "20px"

    # 000   000   0000000   00000000   00     00   0000000   000       0000000  
    # 0000  000  000   000  000   000  000   000  000   000  000      000       
    # 000 0 000  000   000  0000000    000000000  000000000  000      0000000   
    # 000  0000  000   000  000   000  000 0 000  000   000  000           000  
    # 000   000   0000000   000   000  000   000  000   000  0000000  0000000   
    
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
        
    # 00000000   0000000    0000000  00000000   0000000  
    # 000       000   000  000       000       000       
    # 000000    000000000  000       0000000   0000000   
    # 000       000   000  000       000            000  
    # 000       000   000   0000000  00000000  0000000   
    
    showDebug: (mesh, poly)->
        
        if poly.debug
            lines = poly.debug.map (dbg) -> dbg.map (v) -> new Vector3 v[0], v[1], v[2]
            system = MeshBuilder.CreateLineSystem 'faces' lines:lines
            system.scaling = new Vector3 1.03 1.03 1.03
            system.color = new Color3 1 1 0
            system.alpha = 0.5
            mesh.addChild system
            system
        
    # 00000000   0000000    0000000  00000000   0000000  
    # 000       000   000  000       000       000       
    # 000000    000000000  000       0000000   0000000   
    # 000       000   000  000       000            000  
    # 000       000   000   0000000  00000000  0000000   
    
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
        
    # 000       0000000   0000000    00000000  000      
    # 000      000   000  000   000  000       000      
    # 000      000000000  0000000    0000000   000      
    # 000      000   000  000   000  000       000      
    # 0000000  000   000  0000000    00000000  0000000  
    
    label: (mesh, name=mesh.name) ->
        
        label = new GUI.Rectangle "label_#{mesh.name}"
        label.background = "white"
        label.height = "20px"
        label.alpha = 0
        label.width = "#{name.length*8}px"
        label.cornerRadius = 10
        label.thickness = 0
        @ui.addControl label
        label.linkWithMesh mesh

        text = new GUI.TextBlock()
        text.text = name
        text.color = "black"
        text.style = @style
        @ui.addControl text
        text.linkWithMesh mesh

module.exports = Scene
