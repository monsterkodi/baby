###
000   000   0000000   00000000   000      0000000    
000 0 000  000   000  000   000  000      000   000  
000000000  000   000  0000000    000      000   000  
000   000  000   000  000   000  000      000   000  
00     00   0000000   000   000  0000000  0000000    
###

{ prefs, elem, klog } = require 'kxk'

{ Engine, Scene, Color3, Vector3, FramingBehavior, Mesh, SimplificationType, DirectionalLight, AmbientLight, ShadowGenerator, StandardMaterial, MeshBuilder, HemisphericLight, SpotLight, ArcRotateCamera, FlyCamera } = require 'babylonjs'

poly = require './poly'
PolyGen = require './polygen'

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

        if 1
            @camera = new ArcRotateCamera "Camera", 0 0 0 Vector3.Zero(), @scene
            @camera.lowerRadiusLimit = 2
            @camera.upperRadiusLimit = 100
            @camera.setPosition new Vector3 0 0, -10
            @camera.useFramingBehavior = true
            FramingBehavior.mode = FramingBehavior.FitFrustumSidesMode
            FramingBehavior.radiusScale = 4
        else
            @camera = new FlyCamera "FlyCamera", new Vector3(0, 0, -10), @scene
            
        @camera.attachControl @canvas, false
        @camera.wheelDeltaPercentage = 0.02
        @camera.inertia = 0.7
        @camera.speed = 1

        light0 = new HemisphericLight 'light1' new Vector3(0, 1, 0), @scene
        light0.intensity = 1
        light = new DirectionalLight 'light' new Vector3(0, -1, 0), @scene
        light.position.y = 100
        light.intensity = 0.1
        
        shadowGenerator = new ShadowGenerator 8*1024, light
        shadowGenerator.useExponentialShadowMap = true
        shadowGenerator.usePoissonSampling = true
        shadowGenerator.usePercentageCloserFiltering = true
        shadowGenerator.useContactHardeningShadow = true
        
        ground = MeshBuilder.CreateGround "ground" {width:1000 height:1000 subdivisions: 4}, @scene
        ground.material = new StandardMaterial "mat", @scene
        ground.material.specularColor = new Color3 0.05 0.05 0.05
        a = 0.05
        ground.material.diffuseColor = new Color3 a, a, a
        ground.receiveShadows = true
        ground.position.y = -4
             
        i = 0
        z = 0
        x = 0
        for k,v of poly
            p = Mesh.CreatePolyhedron k, {custom: poly[k]}, @scene
            p.receiveShadows = true
            shadowGenerator.addShadowCaster p
            p.material = new StandardMaterial "mat", @scene
            c = switch poly[k].category
                when "Platonic Solid" then new Color3 0.1 0.1 0.1
                when "Archimedean Solid" then new Color3 1 1 1
                when "Johnson Solid" then new Color3 1 0 0
                when "Antiprism" then new Color3 0 0.3 0
                when "Prism" then new Color3 1 1 0
                when "Disk" then new Color3 0 0 1
                else new Color3 0 0 1
            p.material.diffuseColor = c
            
            p.position.x = x
            p.position.z = z
            p.position.y = -3
            x += 3
            i++
            if i > 9
                i = 0
                x = 0
                z += 3

        test = PolyGen.test()
        klog test
        test.face.splice 0, 16
        p = Mesh.CreatePolyhedron "tets" {custom:test}, @scene
        p.convertToFlatShadedMesh()
        p.receiveShadows = true
        p.position.x =  -3
        shadowGenerator.addShadowCaster p
        p.material = new StandardMaterial 'mat' @scene
        p.material.alpha = 0.8
        p.material.diffuseColor = new Color3 1 1 1
                
        @engine.runRenderLoop @animate
     
        for i in [0..10]
             
            truncated = PolyGen.truncate PolyGen.cuboctahedron(), i*0.1
            # klog i*0.1, truncated.face
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
            
            truncated = PolyGen.truncate PolyGen.tetrahedron(), i*0.1
    
            p = Mesh.CreatePolyhedron "icosahedron" {custom:truncated}, @scene
            p.convertToFlatShadedMesh()
            p.receiveShadows = true
            p.position.z = -3*(i-0)
            shadowGenerator.addShadowCaster p
            p.material = new StandardMaterial 'mat' @scene
            p.material.alpha = 0.8
            p.material.diffuseColor = new Color3 0 1 1
            
        for i in [0..10]
            
            truncated = PolyGen.truncate PolyGen.cube(), i*0.1
    
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
            
            truncated = PolyGen.truncate PolyGen.octahedron(), i*0.1
    
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
            
            truncated = PolyGen.truncate PolyGen.dodecahedron(), i*0.1
    
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
            
            truncated = PolyGen.truncate PolyGen.icosahedron(), i*0.1
    
            p = Mesh.CreatePolyhedron "icosahedron" {custom:truncated}, @scene
            p.convertToFlatShadedMesh()
            p.receiveShadows = true
            p.position.x =  12
            p.position.z = -3*(i-0)
            shadowGenerator.addShadowCaster p
            p.material = new StandardMaterial 'mat' @scene
            p.material.alpha = 0.8
            p.material.diffuseColor = new Color3 1 0 0
            
        if prefs.get 'inspector'
            @toggleInspector()
               
    onMouseDown: (event) =>
        
        result = @scene.pick @scene.pointerX, @scene.pointerY
        @mouseDownMesh = result.pickedMesh            

    onMouseUp: (event) =>                

        result = @scene.pick @scene.pointerX, @scene.pointerY
        if mesh = result.pickedMesh
            if mesh.name != 'ground' and mesh == @mouseDownMesh
                @camera.setTarget mesh
                
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
