###
000   000   0000000   00000000   000      0000000    
000 0 000  000   000  000   000  000      000   000  
000000000  000   000  0000000    000      000   000  
000   000  000   000  000   000  000      000   000  
00     00   0000000   000   000  0000000  0000000    
###

{ colors, deg2rad, elem, empty, prefs } = require 'kxk'
{ Camera, Color3, DirectionalLight, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, ShadowGenerator, StandardMaterial, Vector3 } = require 'babylonjs'

generate = require './poly/generate'
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
                                                      
        rows = [
            ['tT' 'xT' 'nT' 'cT' 'hT'     '' 'pT''pC''pO''pD''pI'  ''  'mA3' 'qY3' 'jY8' 'sP3' 'bY8' ]
            ['tC' 'xC' 'nC' 'cC' 'hC'     '' 'eT''eC''eO''eD''eI'  ''  'mU3' 'qU3' 'jU3' 'sA3' 'bP3' ]
            ['tO' 'xO' 'nO' 'cO' 'hO'     '' 'kT''kC''kO''kD''kI'  ''  'mV3' 'qP6' 'jV3' 'sY6' 'bP7' ]
            ['tD' 'xD' 'nD' 'cD' 'hD'     '' 'qT''qC''qO''qD''qI'  ''  'mA8' 'qA3' 'jU5' 'sP7' 'bU3' ]
            ['tI' 'xI' 'nI' 'cI' 'hI'     '' 'uT''uC''uO''uD''uI'  ''  'mV6' 'qV3' 'jU7' 'sA8' 'bU7' ]
            ['']
            ['sT' 'k-.5T' 'kT' 'k4T' 'wT' '' 'aT' 'gT' 'vjT' 'x(0,0)T' 'dztT'  ''  'oY7'  'kU3'  'xY6' 'pY3' 'cU3']
            ['sC' 'k-.5C' 'kC' 'k4C' 'wC' '' 'aC' 'gC' 'vjC' 'x(0,1)C' 'dztC'  ''  'oY12' 'kV3'  'xP8' 'pA3' 'cV3']
            ['sO' 'k-.5O' 'kO' 'k4O' 'wO' '' 'aO' 'gO' 'vjO' 'x(0,2)O' 'dztO'  ''  'oP9'  'kP7'  'xA3' 'pU3' 'hU3']
            ['sD' 'k-.5D' 'kD' 'k4D' 'wD' '' 'aD' 'gD' 'vjD' 'x(0,3)D' 'dztD'  ''  'oU7'  'kV7'  'xU6' 'pP6' 'eU6']
            ['sI' 'k-.5I' 'kI' 'k4I' 'wI' '' 'aI' 'gI' 'vjI' 'x(0,4)I' 'dztI'  ''  'oV9'  'kP12' 'xV3' 'pY8' 'eU3']
            ['']
            ['Y5''eY5''oY5''cY5''bY5' '' 'kY5''xY5''mY5''sY5''pY5' '' 'qY5''jY5''hY5''nY5''aY5']
            ['P5''eP5''oP5''cP5''bP5' '' 'kP5''xP5''mP5''sP5''pP5' '' 'qP5''jP5''hP5''nP5''aP5']
            ['A5''eA5''oA5''cA5''bA5' '' 'kA5''xA5''mA5''sA5''pA5' '' 'qA5''jA5''hA5''nA5''aA5']
            ['U5''eU5''oU5''cU5''bU5' '' 'kU5''xU5''mU5''sU5''pU5' '' 'qU5''jU5''hU5''nU5''aU5']
            ['V5''eV5''oV5''cV5''bV5' '' 'kV5''xV5''mV5''sV5''pV5' '' 'qV5''jV5''hV5''nV5''aV5']
            ]
            
        rows1 = [
            ['t0T''t.25T''tT''t.75T''t1T' '' 't.99t.66T''t.99t.66t.66T' '' '' '' '' 'sT''sC''sO''sD''sI']
            ['t0C''t.25C''tC''t.75C''t1C' '' 't.99t.66C''t.99t.66t.66C' '' '' '' '' 'x(0,1)T''x(0,2)C''x(0,3)O''x(0,4)D''x(0,5)I']
            ['t0O''t.25O''tO''t.75O''t1O' '' 't.99t.66O''t.99t.66t.66O' '' '' '' '' 'dztT''dztC''dztO''dztD''dztI']
            ['t0D''t.25D''tD''t.75D''t1D' '' 't.99t.66D''t.99t.66t.66D' '' '' '' '' 'vz6fwT''vz6fwC''vz6fwO''vz6fwD''vz6fwI']
            ['t0I''t.25I''tI''t.75I''t1I' '' 't.99t.66I''t.99t.66t.66I' '' '' '' '' 'wT''wC''wO''wD''wI']
            ['']
            ['k0T''k-.25T''k-.5T''k-.75T''k-1T' '' 'k0T''k.25T''kT''k.75T''k1T' '' 'k2T''k3T''k4T''k6T''k8T']
            ['k0C''k-.25C''k-.5C''k-.75C''k-1C' '' 'k0C''k.25C''kC''k.75C''k1C' '' 'k2C''k3C''k4C''k6C''k8C']
            ['k0O''k-.25O''k-.5O''k-.75O''k-1O' '' 'k0O''k.25O''kO''k.75O''k1O' '' 'k2O''k3O''k4O''k6O''k8O']
            ['k0D''k-.25D''k-.5D''k-.75D''k-1D' '' 'k0D''k.25D''kD''k.75D''k1D' '' 'k2D''k3D''k4D''k6D''k8D']
            ['k0I''k-.25I''k-.5I''k-.75I''k-1I' '' 'k0I''k.25I''kI''k.75I''k1I' '' 'k2I''k3I''k4I''k6I''k8I']
            ['']
            ['c0T''c.25T''cT''c.75T''c1T' '' 'h0T''h.25T''hT''h.75T''h1T' '' 'pT''pC''pO''pD''pI' ]
            ['c0C''c.25C''cC''c.75C''c1C' '' 'h0C''h.25C''hC''h.75C''h1C' '' 'eT''eC''eO''eD''eI' ]
            ['c0O''c.25O''cO''c.75O''c1O' '' 'h0O''h.25O''hO''h.75O''h1O' '' 'kT''kC''kO''kD''kI' ]
            ['c0D''c.25D''cD''c.75D''c1D' '' 'h0D''h.25D''hD''h.75D''h1D' '' 'qT''qC''qO''qD''qI' ]
            ['c0I''c.25I''cI''c.75I''c1I' '' 'h0I''h.25I''hI''h.75I''h1I' '' 'uT''uC''uO''uD''uI' ]
            ['']
            ['x0T''x.25T''xT''x.75T''x1T' '' 'n0T''n.25T''nT''n.75T''n1T''' 'vjT''vjC''vjO''vjD''vjI'    ]
            ['x0C''x.25C''xC''x.75C''x1C' '' 'n0C''n.25C''nC''n.75C''n1C''' 'v10z6cT''vcC''vcO''vcD''vcI']
            ['x0O''x.25O''xO''x.75O''x1O' '' 'n0O''n.25O''nO''n.75O''n1O''' 'aT''aC''aO''aD''aI'         ]
            ['x0D''x.25D''xD''x.75D''x1D' '' 'n0D''n.25D''nD''n.75D''n1D''' 'gT''gC''gO''gD''gI'         ]
            ['x0I''x.25I''xI''x.75I''x1I' '' 'n0I''n.25I''nI''n.75I''n1I''' 'wT''wC''wO''wD''wI'         ]
            ]
            
        rows2 = [
            ['Y3''Y4''Y5''Y6''Y7' '' 'Y8''Y9''Y10''Y11''Y12' '' 'eY3''eY5''eY7''eY9''eY12']
            ['P3''P4''P5''P6''P7' '' 'P8''P9''P10''P11''P12' '' 'eP3''eP5''eP7''eP9''eP12']
            ['A3''A4''A5''A6''A7' '' 'A8''A9''A10''A11''A12' '' 'eA3''eA5''eA7''eA9''eA12']
            ['U3''U4''U5''U6''U7' '' 'U8''U9''U10''U11''U12' '' 'eU3''eU5''eU7''eU9''eU12']
            ['V3''V4''V5''V6''V7' '' 'V8''V9''V10''V11''V12' '' 'eV3''eV5''eV7''eV9''eV12']
            ['']
            ['hY3''hY5''hY7''hY9''hY12' '' 'cY3''cY5''cY7''cY9''cY12' '' 'pY3''pY5''pY7''pY9''pY12']
            ['hP3''hP5''hP7''hP9''hP12' '' 'cP3''cP5''cP7''cP9''cP12' '' 'pP3''pP5''pP7''pP9''pP12']
            ['hA3''hA5''hA7''hA9''hA12' '' 'cA3''cA5''cA7''cA9''cA12' '' 'pA3''pA5''pA7''pA9''pA12']
            ['hU3''hU5''hU7''hU9''hU12' '' 'cU3''cU5''cU7''cU9''cU12' '' 'pU3''pU5''pU7''pU9''pU12']
            ['hV3''hV5''hV7''hV9''hV12' '' 'cV3''cV5''cV7''cV9''cV12' '' 'pV3''pV5''pV7''pV9''pV12']
            ['']
            ['kY3''kY5''kY7''kY9''kY12' '' 'xY3''xY5''xY7''xY9''xY12' '' 'nY3''nY5''nY7''nY9''nY12']
            ['kP3''kP5''kP7''kP9''kP12' '' 'xP3''xP5''xP7''xP9''xP12' '' 'nP3''nP5''nP7''nP9''nP12']
            ['kA3''kA5''kA7''kA9''kA12' '' 'xA3''xA5''xA7''xA9''xA12' '' 'nA3''nA5''nA7''nA9''nA12']
            ['kU3''kU5''kU7''kU9''kU12' '' 'xU3''xU5''xU7''xU9''xU12' '' 'nU3''nU5''nU7''nU9''nU12']
            ['kV3''kV5''kV7''kV9''kV12' '' 'xV3''xV5''xV7''xV9''xV12' '' 'nV3''nV5''nV7''nV9''nV12']
            ['']
            ['oY3''oY5''oY7''oY9''oY12' '' 'bY3''bY5''bY7''bY9''bY12' '' 'sY3''sY5''sY7''sY9''sY12']
            ['oP3''oP5''oP7''oP9''oP12' '' 'bP3''bP5''bP7''bP9''bP12' '' 'sP3''sP5''sP7''sP9''sP12']
            ['oA3''oA5''oA7''oA9''oA12' '' 'bA3''bA5''bA7''bA9''bA12' '' 'sA3''sA5''sA7''sA9''sA12']
            ['oU3''oU5''oU7''oU9''oU12' '' 'bU3''bU5''bU7''bU9''bU12' '' 'sU3''sU5''sU7''sU9''sU12']
            ['oV3''oV5''oV7''oV9''oV12' '' 'bV3''bV5''bV7''bV9''bV12' '' 'sV3''sV5''sV7''sV9''sV12']
            ['']
            ['mY3''mY5''mY7''mY9''mY12' '' 'qY3''qY5''qY7''qY9''qY12' '' 'jY3''jY5''jY7''jY9''jY12']
            ['mP3''mP5''mP7''mP9''mP12' '' 'qP3''qP5''qP7''qP9''qP12' '' 'jP3''jP5''jP7''jP9''jP12']
            ['mA3''mA5''mA7''mA9''mA12' '' 'qA3''qA5''qA7''qA9''qA12' '' 'jA3''jA5''jA7''jA9''jA12']
            ['mU3''mU5''mU7''mU9''mU12' '' 'qU3''qU5''qU7''qU9''qU12' '' 'jU3''jU5''jU7''jU9''jU12']
            ['mV3''mV5''mV7''mV9''mV12' '' 'qV3''qV5''qV7''qV9''qV12' '' 'jV3''jV5''jV7''jV9''jV12']
            ]
            
        # rows=[]
        # rows.unshift [[]]
        # for alias,code of generate.alias
            # rows[0].push 'h(.3,.1)'+code
            
        # rows = [[ 'Y7' 'Y12' 'P9' 'U7' 'V9' ]
                # [ 'fY7' 'fY12' 'fP9' 'fU7' 'fV9' ]
                # [ 'aY7' 'aY12' 'aP9' 'aU7' 'aV9' ]
                # [ 'jY7' 'jY12' 'jP9' 'jU7' 'jV9' ]
                # [ 'oY7' 'oY12' 'oP9' 'oU7' 'oV9' ]
                # ]
        # rows = [['faV9']]
            
        colors = [
            new Color3 .5 .5 .5
            new Color3 .8 .8  1
            new Color3 .5 .5  1
            new Color3 .4 .4  .9
            new Color3 .3 .3  .8
            new Color3 .2 .2  .7
            new Color3 .1 .1  .6
            new Color3  0  0  .5
            new Color3  1  1  1
            new Color3 .2 .2 .2
        ]
        
        ri = 0
        for row in rows
            ci = 0
            ri++
            for code in row
                ci++
                continue if empty code
                for d,y in ['f']
                    poly = generate d+code, true
                    # klog parseInt(poly.maxEdgeDifference() * 1000), d+code
                    
                    poly.colorize 'signature'
                    # klog 'colors' poly.name, poly.colors
                    faceColors = poly.colors.map (ci) -> colors[ci]
                    
                    p = Mesh.CreatePolyhedron d+code, {custom:poly, faceColors:faceColors}, @scene
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
                    p.material.diffuseColor = new Color3 .25 .25 .25
            
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
