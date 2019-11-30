###
000   000   0000000   00000000   000      0000000    
000 0 000  000   000  000   000  000      000   000  
000000000  000   000  0000000    000      000   000  
000   000  000   000  000   000  000      000   000  
00     00   0000000   000   000  0000000  0000000    
###

{ elem, klog } = require 'kxk'

{ Engine, Scene, Color3, Vector3, Mesh, DirectionalLight, AmbientLight, ShadowGenerator, StandardMaterial, MeshBuilder, HemisphericLight, SpotLight, ArcRotateCamera, FlyCamera } = require 'babylonjs'

poly = require './poly'

class World
    
    @: (@view) ->
        
        @paused = false
        @view.focus()
        
        @canvas = elem 'canvas' class:'babylon' parent:@view

        @resized()
        @engine = new Engine @canvas, true
        
        @scene = new Scene @engine 
        a = 0.06
        @scene.clearColor = new Color3 a, a, a

        if 1
            camera = new ArcRotateCamera "Camera", 0 0 0 Vector3.Zero(), @scene
            camera.lowerRadiusLimit = 2
            camera.upperRadiusLimit = 100
            camera.setPosition new Vector3 0 0, -10
        else
            camera = new FlyCamera "FlyCamera", new Vector3(0, 0, -10), @scene
        camera.attachControl @canvas, true

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
        a = 0.05
        ground.material.diffuseColor = new Color3 a, a, a
        ground.receiveShadows = true
        ground.position.y = -4

        if 0
            sphere = MeshBuilder.CreateSphere 'sphere' { diameter: 1 }, @scene
            sphere.material = new StandardMaterial "mat", @scene
            sphere.material.diffuseColor = new Color3 1 1 0
            sphere.material.specularPower = 6
            sphere.translate new Vector3(0 1 0), 2
            sphere.receiveShadows = true
            shadowGenerator.addShadowCaster sphere
            
            box = MeshBuilder.CreateBox 'box' {}, @scene
            box.material = new StandardMaterial "boxMat", @scene
            box.material.diffuseColor = new Color3 1 0 0
            box.translate new Vector3(1 1 0), 2
            box.receiveShadows = true        
            shadowGenerator.addShadowCaster box
    
            box = MeshBuilder.CreateBox 'box' {}, @scene
            box.material = new StandardMaterial "boxMat", @scene
            box.material.diffuseColor = new Color3 0 1 0
            box.translate new Vector3(0 2 0), 2
            box.receiveShadows = true        
            shadowGenerator.addShadowCaster box
            
            box = MeshBuilder.CreateBox 'box' {}, @scene
            box.material = new StandardMaterial "boxMat", @scene
            box.material.diffuseColor = new Color3 0 0 1
            box.translate new Vector3(0 1 1), 2
            box.receiveShadows = true                
            shadowGenerator.addShadowCaster box
             
        i = 0
        z = 0
        x = 0
        # for k,v of poly
        for k in ['Cuboctahedron', 'TruncatedCuboctahedron']
            p = Mesh.CreatePolyhedron "sap" {custom: poly[k]}, @scene
            # p.receiveShadows = true
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
            x += 3
            i++
            if i > 9
                i = 0
                x = 0
                z += 3
        
        @engine.runRenderLoop @animate
    
    start: -> @view.focus()

    animate: =>

        if not @paused
            @scene.render()
    
    resized: => 
        klog 'resized' @view.clientWidth, @view.clientHeight
        @canvas.width = @view.clientWidth
        @canvas.height = @view.clientHeight
    
    modKeyComboEventDown: (mod, key, combo, event) ->
        
        klog 'modKeyComboEventDown' mod, key, combo, event
        
    modKeyComboEventUp: (mod, key, combo, event) ->
        
        klog 'modKeyComboEventUp' mod, key, combo, event
        
module.exports = World
