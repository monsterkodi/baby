###
000   000   0000000   00000000   000      0000000    
000 0 000  000   000  000   000  000      000   000  
000000000  000   000  0000000    000      000   000  
000   000  000   000  000   000  000      000   000  
00     00   0000000   000   000  0000000  0000000    
###

{ prefs, elem } = require 'kxk'

{ ArcRotateCamera, FramingBehavior, Engine, Scene, Color3, Vector3, Mesh, SimplificationType, DirectionalLight, AmbientLight, ShadowGenerator, StandardMaterial, MeshBuilder, HemisphericLight, SpotLight } = require 'babylonjs'

{ generate } = require './poly/parser'
Poly    = require './poly/polyold'
Vect    = require './vect'
Camera  = require './camera'
animate = require './animate'

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

        @camera = new Camera @scene, @view, @canvas
        
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
             
        window.addEventListener 'pointerdown' @onMouseDown
        window.addEventListener 'pointerup'   @onMouseUp
            
        names = [
            'tetrahedron'
            'cube'
            'octahedron'
            'dodecahedron'
            'icosahedron'
            'cuboctahedron'
            'icosidodecahedron'
            'truncatedicosidodecahedron' 
            'rhombicosidodecahedron' 
            'rhombicubocahedron' 
            'snubicosidodecahedron' 
            'snubcuboctahedron'
        ]
        
        for m,j in names
            
            for i in [0..10]
                truncated = Poly.truncate Poly[m](), i*0.1
                p = Mesh.CreatePolyhedron m, {custom:truncated}, @scene
                p.receiveShadows = true
                p.convertToFlatShadedMesh()
                p.position.x = 3*j
                p.position.z = 3*i
                shadowGenerator.addShadowCaster p
                p.material = new StandardMaterial 'mat' @scene
                p.material.alpha = 1 # 0.8
                p.material.diffuseColor = new Color3 i/12 (j/6)%1 1-j/12
            
        j = 0
        # for code in ['T' 'tT' 'C' 'tC' 'O' 'tO' 'D' 'tD' 'I' 'tI' 'P3' 'P4' 'P5']
        # for code in ['A3''A4''A5''A6''A7''A8''A9''A10''A11''A12']
        # for code in ['P3''P4''P5''P6''P7''P8''P9''P10''P11''P12''P13''P14']
        for code in ['Y3''Y4''Y5''Y6''Y7''Y8''Y9''Y10''Y11''Y12''Y13''Y14']
            poly = generate code
            # klog poly
            p = Mesh.CreatePolyhedron m, {custom:poly}, @scene
            p.receiveShadows = true
            p.position.x =  3*j++
            p.position.z = -3
            shadowGenerator.addShadowCaster p
            p.material = new StandardMaterial 'mat' @scene
            p.material.alpha = 1 # 0.8
            p.material.diffuseColor = new Color3 i/12 (j/6)%1 1-j/12
                
        # Poly.dump Poly.truncate Poly.icosahedron(), 1
        # Poly.dump Poly.truncate Poly.dodecahedron(), 1
                
    # 00     00   0000000   000   000   0000000  00000000  
    # 000   000  000   000  000   000  000       000       
    # 000000000  000   000  000   000  0000000   0000000   
    # 000 0 000  000   000  000   000       000  000       
    # 000   000   0000000    0000000   0000000   00000000  
    
    onMouseDown: (event) =>
        
        window.addEventListener 'pointermove' @onMouseMove
        
        result = @scene.pick @scene.pointerX, @scene.pointerY
        if event.buttons & 2
            @mouseDownMesh = result.pickedMesh         
        @camera.onMouseDown event

    onMouseMove: (event) =>
        
        @camera.onMouseDrag event
        
    onMouseUp: (event) =>                

        window.removeEventListener 'pointermove' @onMouseMove
         
        result = @scene.pick @scene.pointerX, @scene.pointerY
        if mesh = result.pickedMesh
            if mesh.name != 'ground' and mesh == @mouseDownMesh
                @camera.fadeToPos mesh.getAbsolutePosition()
                
        @camera.onMouseUp event
                
    # 000  000   000   0000000  00000000   00000000   0000000  000000000   0000000   00000000   
    # 000  0000  000  000       000   000  000       000          000     000   000  000   000  
    # 000  000 0 000  0000000   00000000   0000000   000          000     000   000  0000000    
    # 000  000  0000       000  000        000       000          000     000   000  000   000  
    # 000  000   000  0000000   000        00000000   0000000     000      0000000   000   000  
    
    toggleInspector: ->
        
        if @scene.debugLayer.isVisible()
            @scene.debugLayer.hide()
            prefs.set 'inspector' false
        else
            @scene.debugLayer.show overlay:true showInspector:true
            prefs.set 'inspector' true
        
    start: -> @view.focus()

    #  0000000   000   000  000  00     00   0000000   000000000  00000000  
    # 000   000  0000  000  000  000   000  000   000     000     000       
    # 000000000  000 0 000  000  000000000  000000000     000     0000000   
    # 000   000  000  0000  000  000 0 000  000   000     000     000       
    # 000   000  000   000  000  000   000  000   000     000     00000000  
    
    animate: =>

        if not @paused
            @scene.render()
            
            animate.tick @engine.getDeltaTime()/1000
    
    # 00000000   00000000   0000000  000  0000000  00000000  
    # 000   000  000       000       000     000   000       
    # 0000000    0000000   0000000   000    000    0000000   
    # 000   000  000            000  000   000     000       
    # 000   000  00000000  0000000   000  0000000  00000000  
    
    resized: => 

        @canvas.width = @view.clientWidth
        @canvas.height = @view.clientHeight
    
    # 000   000  00000000  000   000  
    # 000  000   000        000 000   
    # 0000000    0000000     00000    
    # 000  000   000          000     
    # 000   000  00000000     000     
    
    modKeyComboEventDown: (mod, key, combo, event) ->
        
        # klog 'modKeyComboEventDown' mod, key, combo, event.which
        switch key
            when 'e' then @camera.moveUp()
            when 'q' then @camera.moveDown()
            when 'a' then @camera.moveLeft()
            when 'd' then @camera.moveRight()
            when 'w' then @camera.moveForward()
            when 's' then @camera.moveBackward()
            when 'x' 'esc' then @camera.stopMoving()
        
    modKeyComboEventUp: (mod, key, combo, event) ->

        switch key
            when 'e' then @camera.stopUp()
            when 'q' then @camera.stopDown()
            when 'a' then @camera.stopLeft()
            when 'd' then @camera.stopRight()
            when 'w' then @camera.stopForward()
            when 's' then @camera.stopBackward()
        
        # klog 'modKeyComboEventUp' mod, key, combo, event.code
        
module.exports = World
