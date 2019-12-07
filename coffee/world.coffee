###
000   000   0000000   00000000   000      0000000    
000 0 000  000   000  000   000  000      000   000  
000000000  000   000  0000000    000      000   000  
000   000  000   000  000   000  000      000   000  
00     00   0000000   000   000  0000000  0000000    
###

{ deg2rad, prefs, elem, klog } = require 'kxk'
{ ArcRotateCamera, FramingBehavior, Engine, Color3, Vector3, Mesh, SimplificationType, DirectionalLight, AmbientLight, ShadowGenerator, StandardMaterial, MeshBuilder, HemisphericLight, SpotLight, PointLight } = require 'babylonjs'

generate = require './poly/generate'
Poly     = require './poly/polyold'
Vect     = require './vect'
Camera   = require './camera'
Scene    = require './scene'
animate  = require './animate'

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
        
        hemi = new HemisphericLight 'hemi' new Vect(0 1 0), @scene
        hemi.intensity = 0.5
        
        light = new DirectionalLight 'light' (new Vector3(0 -1 0)), @scene
        light.position.y = 3
        # light.intensity = 0.1
        
        shadowGenerator = new ShadowGenerator 8*1024, light
        shadowGenerator.bias = 0.0002
        shadowGenerator.darkness = 0.8
        shadowGenerator.useExponentialShadowMap = true
        shadowGenerator.usePoissonSampling = true
        shadowGenerator.usePercentageCloserFiltering = true
        shadowGenerator.useContactHardeningShadow = true
        
        ground = MeshBuilder.CreateGround 'ground' {width:1000 height:1000 subdivisions: 4}, @scene
        ground.material = new StandardMaterial 'mat' @scene
        ground.material.specularColor = new Color3 0.05 0.05 0.05
        a = 0.05
        ground.material.diffuseColor = new Color3 a, a, a
        ground.receiveShadows = true
        ground.position.y = -4
             
        @cursor = MeshBuilder.CreateIcoSphere 'cursor' flat:false radius:0.99, @scene
        @cursor.material = new StandardMaterial 'mat' @scene
        @cursor.material.diffuseColor = new Color3 0.05 0.05 0.05
        @cursor.material.alpha = 0.25
        
        @engine.runRenderLoop @animate
        if prefs.get 'inspector'
            @toggleInspector()
             
        window.addEventListener 'pointerdown' @onMouseDown
        window.addEventListener 'pointerup'   @onMouseUp
            
        if 0
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
                    p.position.y = -2
                    shadowGenerator.addShadowCaster p
                    p.material = new StandardMaterial 'mat' @scene
                    p.material.alpha = 1 # 0.8
                    p.material.diffuseColor = new Color3 i/12 (j/6)%1 1-j/12
            
        z = 0
        rows = [
            # ['T' 'tT' 'C' 'tC' 'O' 'tO' 'D' 'tD' 'I' 'tI']
            # ['Y3''Y4''Y5''Y6''Y7''Y8''Y9''Y10''Y11''Y12']
            # ['P3''P4''P5''P6''P7''P8''P9''P10''P11''P12']
            # ['A3''A4''A5''A6''A7''A8''A9''A10''A11''A12']
            # ['U3''U4''U5''U6''U7''U8''U9''U10''U11''U12']
            # ['V3''V4''V5''V6''V7''V8''V9''V10''V11''V12']
            # ['hY3''hY4''hY5''hY6''hY7''hY8''hY9''hY10''hY11''hY12''hY13''hY14']
            # ['hT''hC''hO''hD''hI']
            # ['pT''ptT''pC''ptC''pO''ptO''pD''ptD''pI''ptI']
            # ['pY3''pY4''pY5''pY6''pY7''pY8''pY9''pY10''pY11''pY12']
            # ['pP3''pP4''pP5''pP6''pP7''pP8''pP9''pP10''pP11''pP12']
            # ['pA3''pA4''pA5''pA6''pA7''pA8''pA9''pA10''pA11''pA12']
            # ['pU3''pU4''pU5''pU6''pU7''pU8''pU9''pU10''pU11''pU12']
            # ['pV3''pV4''pV5''pV6''pV7''pV8''pV9''pV10''pV11''pV12']
            # ['qT''qtT''qC''qtC''qO''qtO''qD''qtD''qI''qtI']
            # ['qY3''qY4''qY5''qY6''qY7''qY8''qY9''qY10''qY11''qY12']
            # ['qP3''qP4''qP5''qP6''qP7''qP8''qP9''qP10''qP11''qP12']
            # ['qA3''qA4''qA5''qA6''qA7''qA8''qA9''qA10''qA11''qA12']
            # ['qU3''qU4''qU5''qU6''qU7''qU8''qU9''qU10''qU11''qU12']
            # ['qV3''qV4''qV5''qV6''qV7''qV8''qV9''qV10''qV11''qV12']
            ['T''C''O''D''I']
            ['dT''dC''dO''dD''dI']
            ['kdT''kdC''kdO''kdD''kdI']
            ['tT''tC''tO''tD''tI']
            ['kT''jC''kO''kC''oC''mC''gC''jD''kI''kD''oD''mD''gD']
            ['Y3''Y4''Y5''Y6''Y7''Y8''Y9''Y10''Y11''Y12']
            ['P3''P4''P5''P6''P7''P8''P9''P10''P11''P12']
            ['A3''A4''A5''A6''A7''A8''A9''A10''A11''A12']
            ['U3''U4''U5''U6''U7''U8''U9''U10''U11''U12']
            # ['kdT''kdC''kdO''kdD''kdI']
            # ['kdY3''kdY4''kdY5''kdY6''kdY7''kdY8''kdY9''kdY10''kdY11''kdY12']
            # ['kdP3''kdP4''kdP5''kdP6''kdP7''kdP8''kdP9''kdP10''kdP11''kdP12']
            # ['kdA3''kdA4''kdA5''kdA6''kdA7''kdA8''kdA9''kdA10''kdA11''kdA12']
            # ['kdU3''kdU4''kdU5''kdU6''kdU7''kdU8''kdU9''kdU10''kdU11''kdU12']
            # ['kdaT''kdaC''kdaO''kdaD''kdaI']
            # ['tT''tC''tO''tD''tI']
            # ['tY3''tY4''tY5''tY6''tY7''tY8''tY9''tY10''tY11''tY12']
            # ['tP3''tP4''tP5''tP6''tP7''tP8''tP9''tP10''tP11''tP12']
            # ['tA3''tA4''tA5''tA6''tA7''tA8''tA9''tA10''tA11''tA12']
            # ['tU3''tU4''tU5''tU6''tU7''tU8''tU9''tU10''tU11''tU12']
            # ['taT''taC''taO''taD''taI']
            # ['taY3''taY4''taY5''taY6''taY7''taY8''taY9''taY10''taY11''taY12']
            # ['taP3''taP4''taP5''taP6''taP7''taP8''taP9''taP10''taP11''taP12']
            # ['taA3''taA4''taA5''taA6''taA7''taA8''taA9''taA10''taA11''taA12']
            # ['taU3''taU4''taU5''taU6''taU7''taU8''taU9''taU10''taU11''taU12']
            # ['aT''aC''aO''aD''aI']
            # ['aY3''aY4''aY5''aY6''aY7''aY8''aY9''aY10''aY11''aY12']
            # ['aP3''aP4''aP5''aP6''aP7''aP8''aP9''aP10''aP11''aP12']
            # ['aA3''aA4''aA5''aA6''aA7''aA8''aA9''aA10''aA11''aA12']
            # ['aU3''aU4''aU5''aU6''aU7''aU8''aU9''aU10''aU11''aU12']
            ]
        
        for row in rows
            j = 0
            z++
            for code in row
                j++
                # for d,y in ['' 'd' 'kd' 'dkd']
                for d,y in ['']
                    poly = generate d+code
                    p = Mesh.CreatePolyhedron code, {custom:poly}, @scene
                    # @scene.showNormals p
                    @scene.showFaces p, poly
                    p.receiveShadows = true
                    p.position.x = 3*j
                    p.position.z = 3*z
                    p.position.y = y*3
                    p.rotate Vect.unitX, deg2rad -90
                    p.convertToFlatShadedMesh()
                    shadowGenerator.addShadowCaster p
                    p.material = new StandardMaterial 'mat' @scene
                    p.material.alpha = 1
                    p.material.diffuseColor = new Color3 i/12 (j/6)%1 1-j/12                
                
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
                if mesh.name in ['faces''normals']
                    klog mesh.parent.name
                else
                    klog mesh.name
                @cursor.position = mesh.getAbsolutePosition()
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
