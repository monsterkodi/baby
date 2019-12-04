###
000   000   0000000   00000000   000      0000000    
000 0 000  000   000  000   000  000      000   000  
000000000  000   000  0000000    000      000   000  
000   000  000   000  000   000  000      000   000  
00     00   0000000   000   000  0000000  0000000    
###

{ prefs, elem, klog } = require 'kxk'

{ ArcRotateCamera, FramingBehavior, Engine, Scene, Color3, Vector3, Mesh, SimplificationType, DirectionalLight, AmbientLight, ShadowGenerator, StandardMaterial, MeshBuilder, HemisphericLight, SpotLight } = require 'babylonjs'

Poly   = require './poly'
Vect   = require './vect'
Camera = require './camera'

class World
    
    @: (@view) ->
        
        @paused = false
        @view.focus()
        
        @canvas = elem 'canvas' class:'babylon' parent:@view
        
        window.addEventListener 'pointerdown' @onMouseDown
        window.addEventListener 'pointerup'   @onMouseUp

        @resized()
        @engine = new Engine @canvas, true
        
        @scene = new Scene @engine 
        
        a = 0.06
        @scene.clearColor = new Color3 a, a, a

        @camera = new Camera @scene, @view, @canvas
        
        # if 1
            # @camera = new ArcRotateCamera "Camera" 0 0 0 Vect.Zero(), @scene
            # @camera.lowerRadiusLimit = 2
            # @camera.upperRadiusLimit = 100
            # @camera.setPosition new Vect 0 0 -10
            # @camera.useFramingBehavior = true
            # FramingBehavior.mode = FramingBehavior.FitFrustumSidesMode
            # FramingBehavior.radiusScale = 4
        # # else
            # # @camera = new FlyCamera "FlyCamera" new Vect(0 0 -10), @scene
#             
        # @camera.attachControl @canvas, false
        # @camera.wheelDeltaPercentage = 0.02
        # @camera.inertia = 0.7
        # @camera.speed = 1

        light0 = new HemisphericLight 'light1' new Vect(0 1 0), @scene
        light0.intensity = 1
        light = new DirectionalLight 'light' new Vect(0 -1 0), @scene
        light.position.y = 100
        light.intensity = 0.1
        
        shadowGenerator = new ShadowGenerator 8*1024, light
        shadowGenerator.useExponentialShadowMap = true
        shadowGenerator.usePoissonSampling = true
        shadowGenerator.usePercentageCloserFiltering = true
        shadowGenerator.useContactHardeningShadow = true
        
        ground = MeshBuilder.CreateGround "ground" {width:1000 height:1000 subdivisions: 4}, @scene
        ground.material = new StandardMaterial "mat" @scene
        ground.material.specularColor = new Color3 0.05 0.05 0.05
        a = 0.05
        ground.material.diffuseColor = new Color3 a, a, a
        ground.receiveShadows = true
        ground.position.y = -4
             
        @engine.runRenderLoop @animate
        if prefs.get 'inspector'
            @toggleInspector()
             
        # Poly.dumpNeighbors Poly.cube().neighbors
        # Poly.dump Poly.truncate Poly.cube(), 0.5
            
        for i in [0..10]
             
            truncated = Poly.truncate Poly.cuboctahedron(), i*0.1
            p = Mesh.CreatePolyhedron "cuboctahedron" {custom:truncated}, @scene
            p.convertToFlatShadedMesh()
            p.receiveShadows = true
            p.position.x =  15
            p.position.z = -3*(i-0)
            shadowGenerator.addShadowCaster p
            p.material = new StandardMaterial 'mat' @scene
            p.material.alpha = 0.8
            p.material.diffuseColor = new Color3 0 1 0
        
        for i in [0..10]
            
            truncated = Poly.truncate Poly.tetrahedron(), i*0.1
    
            p = Mesh.CreatePolyhedron "icosahedron" {custom:truncated}, @scene
            p.convertToFlatShadedMesh()
            p.receiveShadows = true
            p.position.z = -3*(i-0)
            shadowGenerator.addShadowCaster p
            p.material = new StandardMaterial 'mat' @scene
            p.material.alpha = 0.8
            p.material.diffuseColor = new Color3 0 1 1
            
        for i in [0..10]
            
            truncated = Poly.truncate Poly.cube(), i*0.1
    
            p = Mesh.CreatePolyhedron "icosahedron" {custom:truncated}, @scene
            p.convertToFlatShadedMesh()
            p.receiveShadows = true
            p.position.x =  3
            p.position.z = -3*(i-0)
            shadowGenerator.addShadowCaster p
            p.material = new StandardMaterial 'mat' @scene
            p.material.alpha = 0.8
            p.material.diffuseColor = new Color3 1 0 1
            
        for i in [0..10]
            
            truncated = Poly.truncate Poly.octahedron(), i*0.1
    
            p = Mesh.CreatePolyhedron "icosahedron" {custom:truncated}, @scene
            p.convertToFlatShadedMesh()
            p.receiveShadows = true
            p.position.x =  6
            p.position.z = -3*(i-0)
            shadowGenerator.addShadowCaster p
            p.material = new StandardMaterial 'mat' @scene
            p.material.alpha = 0.8
            p.material.diffuseColor = new Color3 1 1 0
            
        for i in [0..10]
            
            truncated = Poly.truncate Poly.dodecahedron(), i*0.1
    
            p = Mesh.CreatePolyhedron "icosahedron" {custom:truncated}, @scene
            p.convertToFlatShadedMesh()
            p.receiveShadows = true
            p.position.x =  9
            p.position.z = -3*(i-0)
            shadowGenerator.addShadowCaster p
            p.material = new StandardMaterial 'mat' @scene
            p.material.alpha = 0.8
            p.material.diffuseColor = new Color3 0 0 1
            
        for i in [0..10]
            
            truncated = Poly.truncate Poly.icosahedron(), i*0.1
    
            p = Mesh.CreatePolyhedron "icosahedron" {custom:truncated}, @scene
            p.convertToFlatShadedMesh()
            p.receiveShadows = true
            p.position.x =  12
            p.position.z = -3*(i-0)
            shadowGenerator.addShadowCaster p
            p.material = new StandardMaterial 'mat' @scene
            p.material.alpha = 0.8
            p.material.diffuseColor = new Color3 1 0 0
                           
    onMouseDown: (event) =>
        
        result = @scene.pick @scene.pointerX, @scene.pointerY
        @mouseDownMesh = result.pickedMesh            

    onMouseUp: (event) =>                

        result = @scene.pick @scene.pointerX, @scene.pointerY
        if mesh = result.pickedMesh
            if mesh.name != 'ground' and mesh == @mouseDownMesh
                @camera.setTarget mesh.getAbsolutePosition()
                # @camera.setTarget mesh
                
    toggleInspector: ->
        
        if @scene.debugLayer.isVisible()
            @scene.debugLayer.hide()
            prefs.set 'inspector' false
        else
            @scene.debugLayer.show overlay:true showInspector:true
            prefs.set 'inspector' true
        
    start: -> @view.focus()

    animate: =>

        if not @paused
            @scene.render()
    
    resized: => 

        @canvas.width = @view.clientWidth
        @canvas.height = @view.clientHeight
    
    modKeyComboEventDown: (mod, key, combo, event) ->
        
        klog 'modKeyComboEventDown' mod, key, combo, event
        
    modKeyComboEventUp: (mod, key, combo, event) ->
        
        klog 'modKeyComboEventUp' mod, key, combo, event
        
module.exports = World
