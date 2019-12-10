###
000   000   0000000   00000000   000      0000000    
000 0 000  000   000  000   000  000      000   000  
000000000  000   000  0000000    000      000   000  
000   000  000   000  000   000  000      000   000  
00     00   0000000   000   000  0000000  0000000    
###

{ deg2rad, elem, empty, prefs } = require 'kxk'
{ Camera, Color3, DirectionalLight, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, ShadowGenerator, StandardMaterial, Vector3 } = require 'babylonjs'

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
             
        @cursor = MeshBuilder.CreateIcoSphere 'cursor' flat:false radius:1.1, @scene
        @cursor.material = new StandardMaterial 'mat' @scene
        @cursor.material.diffuseColor = new Color3 0.05 0.05 0.05
        @cursor.material.specularColor = new Color3 0 0 0
        @cursor.material.alpha = 0.5
        @cursor.position = [0 -1000 0]
        @cursor.backFaceCulling = true
        @cursor = @cursor.flipFaces true
        
        @engine.runRenderLoop @animate
        if prefs.get 'inspector'
            @toggleInspector()
             
        window.addEventListener 'pointerdown' @onMouseDown
        window.addEventListener 'pointermove' @onMouseMove
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
                    poly = Poly.truncate Poly[m](), i*0.1
                    p = Mesh.CreatePolyhedron m, {custom:poly}, @scene
                    @scene.showFaces p, poly
                    p.receiveShadows = true
                    p.convertToFlatShadedMesh()
                    p.position.x = -3*j
                    p.position.z = -3*i
                    shadowGenerator.addShadowCaster p
                    p.material = new StandardMaterial 'mat' @scene
                    p.material.alpha = 1 # 0.8
                    p.material.diffuseColor = new Color3 i/12 (j/6)%1 1-j/12
  
        rows = [
            ['tT' 'tC' 'tO' 'tD' 'tI']
            # ['c0T''c.25T''cT''c.75T''c1T' '' 'h0T''h.25T''hT''h.75T''h1T']
            # ['c0C''c.25C''cC''c.75C''c1C' '' 'h0C''h.25C''hC''h.75C''h1C']
            # ['c0O''c.25O''cO''c.75O''c1O' '' 'h0O''h.25O''hO''h.75O''h1O']
            # ['c0D''c.25D''cD''c.75D''c1D' '' 'h0D''h.25D''hD''h.75D''h1D']
            # ['c0I''c.25I''cI''c.75I''c1I' '' 'h0I''h.25I''hI''h.75I''h1I']
            # ['']
            # ['x0T''x.25T''xT''x.75T''x1T' '' 'n0T''n.25T''nT''n.75T''n1T']
            # ['x0C''x.25C''xC''x.75C''x1C' '' 'n0C''n.25C''nC''n.75C''n1C']
            # ['x0O''x.25O''xO''x.75O''x1O' '' 'n0O''n.25O''nO''n.75O''n1O']
            # ['x0D''x.25D''xD''x.75D''x1D' '' 'n0D''n.25D''nD''n.75D''n1D']
            # ['x0I''x.25I''xI''x.75I''x1I' '' 'n0I''n.25I''nI''n.75I''n1I']
            # ['']
            # ['pT''pC''pO''pD''pI' '' 'z6ztT''z6ztO''ztI']
            # ['eT''eC''eO''eD''eI' '' 'v10z6cT''vcC''vcO''vcD''vcI']
            # ['kT''kC''kO''kD''kI' '' 'aT''aC''aO''aD''aI']
            # ['qT''qC''qO''qD''qI' '' 'gT''gC''gO''gD''gI']
            # ['uT''uC''uO''uD''uI' '' 'wT''wC''wO''wD''wI']
             
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
                continue if empty code
                # for d,y in ['' 'c.64' 'c.64c.64']
                for d,y in ['']
                    poly = generate d+code, true
                    # klog poly
                    p = Mesh.CreatePolyhedron d+code, {custom:poly}, @scene
                    # @scene.showNormals p
                    @scene.showFaces p, poly
                    # @scene.showDebug p, poly
                    # @scene.label p
                    p.receiveShadows = true
                    p.position.x = 3*ci
                    p.position.z = 3*ri
                    p.position.y = y*3
                    p.rotate Vect.unitX, deg2rad -90
                    # p.convertToFlatShadedMesh()
                    shadowGenerator.addShadowCaster p
                    p.material = new StandardMaterial 'mat' @scene
                    p.material.alpha = 1
                    f = (ci%6)/5
                    r = ri%6
                    p.material.diffuseColor = new Color3 f*((r&1)>>0), f*((r&2)>>1), f*((r&4)>>2)
            
    # 00     00   0000000   000   000   0000000  00000000  
    # 000   000  000   000  000   000  000       000       
    # 000000000  000   000  000   000  0000000   0000000   
    # 000 0 000  000   000  000   000       000  000       
    # 000   000   0000000    0000000   0000000   00000000  
    
    onMouseDown: (event) =>
        
        @mouseDownMesh = @pickedMesh()
        @camera.onMouseDown event

    onMouseMove: (event) =>
        
        @camera.onMouseDrag event
        if mesh = @pickedMesh()
            @highlight mesh    
            @scene.legend.show mesh            
        else
            @scene.legend.show @legendMesh
        
    onMouseUp: (event) =>                
        
        if mesh = @pickedMesh()
            if mesh == @mouseDownMesh
                @cursor.position = mesh.getAbsolutePosition()
                @camera.fadeToPos mesh.getAbsolutePosition()
                @scene.legend.show mesh
                @legendMesh = mesh

        else if not @mouseDownMesh
            @cursor.position = [0 -1000 0]
            @scene.legend.hide()
            @legendMesh = null
                
        @camera.onMouseUp event
          
    pickedMesh: ->
        
        if result = @scene.pick(@scene.pointerX, @scene.pointerY, (m) -> m.name not in ['ground' 'cursor'])
            if result.pickedMesh?.name in ['faces''normals']
                result.pickedMesh.parent
            else
                result.pickedMesh
        
    highlight: (mesh) ->
        
        @highlightMesh?.material.diffuseColor = @preHighlightColor
        @preHighlightColor = mesh.material.diffuseColor
        mesh.material.diffuseColor = @preHighlightColor.multiply new Color3 1.5 1.5 1.5
        @highlightMesh = mesh        
                
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

        # klog 'modKeyComboEventUp' mod, key, combo, event.code
        switch key
            when 'e' then @camera.stopUp()
            when 'q' then @camera.stopDown()
            when 'a' then @camera.stopLeft()
            when 'd' then @camera.stopRight()
            when 'w' then @camera.stopForward()
            when 's' then @camera.stopBackward()
        
        
module.exports = World
