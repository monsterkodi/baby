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

ϕ = (Math.sqrt(5)-1)/2

class World
    
    @: (@view) ->
        
        @paused = false
        @view.focus()
        
        @canvas = elem 'canvas' class:'babylon' parent:@view
        
        @engine = new Engine @canvas, true
        @scene = new Scene @engine 
        @resized()
        
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
        @cursor.position = @camera.position
        
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
  
        rows = [
            # ['cC'] 
            # ['cC'] 
            # ['c0T''c0.25T''cT''c0.75T''c1T']
            ['c0C''c0.25C''cC''c0.57C''c0.58C''c0.59C''c1C']
            # ['c0O''c0.25O''cO''c0.75O''c1O']
            # ['c0D''c0.25D''cD''c0.75D''c1D']
            # ['c0I''c0.25I''cI''c0.75I''c1I']
            # ['T''C''O''D''I']
            # ['cT''cC''cO''cD''cI']
            # ['z6ztT''z6ztO''ztI']
            # ['v10z6cT''vcC''vcO''vcD''vcI']
            # ['dT''dC''dO''dD''dI']
            # ['aT''aC''aO''aD''aI']
            # ['kT''kC''kO''kD''kI']
            # ['vgT''vgC''vgO''vgD''vgI']
            # ['rT''rC''rO''rD''rI']
            # ['vwT''vwC''vwO''vwD''vwI']
            # ['nT''nC''nO''nD''nI']
            # ['xT''xC''xO''xD''xI']
            # ['pT''pC''pO''pD''pI']
            # ['qT''qC''qO''qD''qI']
            # ['hT''hC''hO''hD''hI']
            # ['uT''uC''uO''uD''uI']
            # ['eT''eC''eO''eD''eI']
#             
            # ['vjT''vjC''vjO''vjD''vjI']
            # ['sT''sC''sO''sD''sI']
            # ['dzdk(0,-0.5)dT''dzdk(0,-0.3)dT''dzdk(0,0)dT''dzdk(0,0.8)dT''dzdk(0,1.2)dT']
            # ['dk(3,0.1)ztT''dk(3,-0.3)ztT''dk(3,-0.4)ztT''dk(3,-0.45)ztT''dk(3,-0.5)ztT']
            # ['x(0,1)T''x(0,2)C''x(0,3)O''x(0,4)D''x(0,5)I']
            # ['x(3,1,0)n(0,0.5,0)T''n(0,0.5,-0.3)C''n(0,0.25,-0.1)O''n(0,0.8,-0.2)D''nI']
            # ['dztT''dztC''dztO''dztD''dztI']
            # ['dk(3,0.1)ztT''t3dztC''t4dztO''t3dztD''t5dztI''t6dztI']
            # ['kT''vjC''kO''kC''oC''mC''vgC''vjD''kI''kD''oD''mD''vgD']

            # ['Y3''Y4''Y5''Y6''Y7''Y8''Y9''Y10''Y11''Y12']
            # ['P3''P4''P5''P6''P7''P8''P9''P10''P11''P12']
            # ['A3''A4''A5''A6''A7''A8''A9''A10''A11''A12']
            # ['U3''U4''U5''U6''U7''U8''U9''U10''U11''U12']
            # ['V3''V4''V5''V6''V7''V8''V9''V10''V11''V12']
            # ['hY3''hY4''hY5''hY6''hY7''hY8''hY9''hY10''hY11''hY12''hY13''hY14']
            ]
        
        ri = 0
        for row in rows
            ci = 0
            ri++
            for code in row
                ci++
                # for d,y in ['' 'c' 'cc']
                for d,y in ['']
                    poly = generate d+code, false
                    p = Mesh.CreatePolyhedron d+code, {custom:poly}, @scene
                    # @scene.showNormals p
                    @scene.showFaces p, poly
                    @scene.label p
                    p.receiveShadows = true
                    p.position.x = 3*ci
                    p.position.z = 3*ri
                    p.position.y = y*3
                    p.rotate Vect.unitX, deg2rad -90
                    # p.convertToFlatShadedMesh()
                    shadowGenerator.addShadowCaster p
                    p.material = new StandardMaterial 'mat' @scene
                    p.material.alpha = 1
                    f = ci/5
                    p.material.diffuseColor = new Color3 f*((ri&1)>>0), f*((ri&2)>>1), f*((ri&4)>>2)
            
    # 00     00   0000000   000   000   0000000  00000000  
    # 000   000  000   000  000   000  000       000       
    # 000000000  000   000  000   000  0000000   0000000   
    # 000 0 000  000   000  000   000       000  000       
    # 000   000   0000000    0000000   0000000   00000000  
    
    onMouseDown: (event) =>
        
        window.addEventListener 'pointermove' @onMouseMove
        
        result = @scene.pick @scene.pointerX, @scene.pointerY
        if event.buttons & 2 and result.pickedMesh.name != 'ground'
            @mouseDownMesh = result.pickedMesh 
        else
            @mouseDownMesh = null
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
                @cursor.position = mesh.getAbsolutePosition()
                @camera.fadeToPos mesh.getAbsolutePosition()
            else
                if not @mouseDownMesh
                    @cursor.position = @camera.position
                
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
        @engine.resize()
        # @scene.resize()
    
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
