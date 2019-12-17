###
 0000000   0000000  00000000  000   000  00000000
000       000       000       0000  000  000     
0000000   000       0000000   000 0 000  0000000 
     000  000       000       000  0000  000     
0000000    0000000  00000000  000   000  00000000
###

{ valid } = require 'kxk'
{ Color3, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3, VertexBuffer } = require 'babylonjs'
{ vec } = require './poly/math'
babylon  = require 'babylonjs'
GUI      = require 'babylonjs-gui'
Vect     = require './vect'
Legend   = require './legend'
generate = require './poly/generate'

class Scene extends babylon.Scene 

    @: (@world) ->
    
        super @world.engine
        
        @ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI 'ui'
        
        @legend = new Legend @ui
        
        @faceIndexMat = new StandardMaterial 'faceIndexMat'
        @faceIndexMat.diffuseColor = new Color3 .5 .5 1            
        @faceIndexMat.alpha = 0.5

        @vertIndexMat = new StandardMaterial 'vertIndexMat'
        @vertIndexMat.diffuseColor = new Color3 1 1 1
        @vertIndexMat.alpha = 0.5
        
        @style = @ui.createStyle()
        @style.fontSize = 10
        @style.fontFamily = 'fontMono'
        @style.height = '20px'

    initFog: (color) ->

        color ?= new Color3 0 0 0
        @fogColor = color
        @fogMode  = Scene.FOGMODE_LINEAR
        
    render: ->
            
        @fogStart = (@world.space?.distFactor ? 0.2) * 50000
        @fogEnd   = 2*@fogStart
        super
            
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
            v2 = v1.addInPlace Vector3.FromArray(normals, i).scaleInPlace(size)
            lines.push [v1, v2]
            
        system = MeshBuilder.CreateLineSystem 'normals' lines:lines
        system.color = color
        mesh.addChild system
        system
        
    # 0000000    00000000  0000000    000   000   0000000   
    # 000   000  000       000   000  000   000  000        
    # 000   000  0000000   0000000    000   000  000  0000  
    # 000   000  000       000   000  000   000  000   000  
    # 0000000    00000000  0000000     0000000    0000000   
    
    showDebug: (mesh, poly)->
        
        if valid poly.debug
            lines = poly.debug.map (dbg) -> dbg.map (v) -> vec v
            system = MeshBuilder.CreateLineSystem 'faces' lines:lines
            # system.scaling = vec 1.03 1.03 1.03
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
                
        color ?= new Color3 0 0 0 #0.06 0.06 0.06
        lines  = []

        for face in poly.face
            v1 = poly.vert face[-1]
            for vi in [0...face.length]
                v2 = poly.vert face[vi]
                lines.push [v1, v2]
                v1 = v2
            
        system = MeshBuilder.CreateLineSystem 'faces' lines:lines, useVertexAlpha:false
        # system = new LinesMesh 'faces' parent:mesh, useVertexAlpha:false
        # system.scaling = vec 1.005 1.005 1.005
        system.color = color
        mesh.addChild system
        system
    
    # 000  000   000  0000000    000   0000000  00000000   0000000  
    # 000  0000  000  000   000  000  000       000       000       
    # 000  000 0 000  000   000  000  000       0000000   0000000   
    # 000  000  0000  000   000  000  000       000            000  
    # 000  000   000  0000000    000   0000000  00000000  0000000   
    
    showIndices: (mesh, poly) ->

        for vx,vi in poly.vertex
            d = Mesh.CreatePolyhedron "#{vi}" {custom:generate('O').scale(0.1)}, @
            d.material = @vertIndexMat
            mesh.addChild d
            d.locallyTranslate poly.vert vi
            d.lookAt poly.vert(vi).plus vec poly.vertexNormal vi
            @label d 
            
        normals = poly.normals()
            
        for ctr,fi in poly.centers()
            c = Mesh.CreatePolyhedron "#{fi}" {custom:generate('C').scale(0.1)}, @
            c.material = @faceIndexMat
            mesh.addChild c
            c.locallyTranslate vec ctr
            c.lookAt vec(ctr).plus normals[fi]
            @label c 
        
    # 000       0000000   0000000    00000000  000      
    # 000      000   000  000   000  000       000      
    # 000      000000000  0000000    0000000   000      
    # 000      000   000  000   000  000       000      
    # 0000000  000   000  0000000    00000000  0000000  
    
    label: (mesh, name=mesh.name) ->
        
        # label = new GUI.Rectangle "label_#{mesh.name}"
        # label.background = "white"
        # label.height = "20px"
        # label.alpha = 1
        # label.width = "#{name.length*8}px"
        # label.cornerRadius = 10
        # label.thickness = 0
        # @ui.addControl label
        # label.linkWithMesh mesh

        text = new GUI.TextBlock()
        text.text = name
        text.color = "black"
        text.style = @style
        @ui.addControl text
        text.linkWithMesh mesh

module.exports = Scene
