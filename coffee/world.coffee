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
            ['tT' 'xT' 'nT' 'cT' 'hT'     '' 'pT''pC''pO''pD''pI'  ''  'mA3' 'qY3' 'fjY8' 'sP3' 'bY8' ]
            ['tC' 'xC' 'nC' 'cC' 'hC'     '' 'eT''eC''eO''eD''eI'  ''  'mU3' 'qU3' 'fjU3' 'sA3' 'bP3' ]
            ['tO' 'xO' 'nO' 'cO' 'hO'     '' 'kT''kC''kO''kD''kI'  ''  'mV3' 'qP6' 'fjV3' 'sY6' 'bP7' ]
            ['tD' 'xD' 'nD' 'cD' 'hD'     '' 'qT''qC''qO''qD''qI'  ''  'mA8' 'qA3' 'fjU5' 'sP7' 'bU3' ]
            ['tI' 'xI' 'nI' 'cI' 'hI'     '' 'uT''uC''uO''uD''uI'  ''  'mV6' 'qV3' 'fjU7' 'sA8' 'bU7' ]
            ['']
            ['sT' 'k-.5T' 'kT' 'k4T' 'fwT' '' 'aT' 'fgT' 'fjT' 'x(0,0)T' 'dztT'  ''  'foY7'  'kU3'  'xY6' 'pY3' 'fcU3']
            [  '' 'k-.5C' 'kC' 'k4C' 'fwC' '' 'aC' 'fgC' 'fjC' 'x(0,1)C' 'dztC'  ''  'foY12' 'kV3'  'xP8' 'pA3' 'fcV3']
            ['sO' 'k-.5O' 'kO' 'k4O' 'fwO' '' 'aO' 'fgO' 'fjO' 'x(0,2)O' 'dztO'  ''  'foP9'  'kP7'  'xA3' 'pU3' 'hU3']
            [  '' 'k-.5D' 'kD' 'k4D' 'fwD' '' 'aD' 'fgD' 'fjD' 'x(0,3)D' 'dztD'  ''  'foU7'  'kV7'  'xU6' 'pP6' 'eU6']
            ['sI' 'k-.5I' 'kI' 'k4I' 'fwI' '' 'aI' 'fgI' 'fjI' 'x(0,4)I' 'dztI'  ''  'foV9'  'kP12' 'xV3' 'pY8' 'feU3']
            ['']
            ['Y5' 'eY5''foY5''fcY5' 'bY5' '' 'kY5''xY5''mY5''sY5''pY5' '' 'qY5''fjY5''hY5''nY5' 'aY5']
            ['P5' 'eP5''foP5''fcP5' 'bP5' '' 'kP5''xP5''mP5''sP5''pP5' '' 'qP5''fjP5''hP5''nP5' 'aP5']
            ['A5''feA5''foA5''fcA5' 'bA5' '' 'kA5''xA5''mA5''sA5''pA5' '' 'qA5''fjA5''hA5''nA5' 'aA5']
            ['U5' 'eU5''foU5''fcU5' 'bU5' '' 'kU5''xU5''mU5''sU5''pU5' '' 'qU5''fjU5''hU5''nU5' 'aU5']
            ['V5''feV5''foV5''fcV5''fbV5' '' 'kV5''xV5''mV5''sV5''pV5' '' 'qV5''fjV5''hV5''nV5''faV5']
            ]

        # rows = [[]]
        # for alias,code of generate.alias
            # rows[0].push 'h(.3,.1)'+code
                        
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
                for d,y in ['']
                    poly = generate d+code, true
                    # klog '---------' d+code, poly.flatness()[0]
                    poly.colorize 'signature'
                    # klog 'colors' poly.name, poly.colors
                    faceColors = poly.colors.map (ci) -> colors[ci]
                    
                    p = Mesh.CreatePolyhedron d+code, {custom:poly, faceColors:faceColors}, @scene
                    # @scene.showNormals p
                    @scene.showFaces p, poly
                    # @scene.showIndices p, poly
                    # @scene.showDebug p, poly
                    # @scene.label p
                    p.receiveShadows = true
                    p.position.x = 3*ci
                    p.position.z = 3*ri
                    p.position.y = y*3
                    p.rotate Vect.unitX, deg2rad -90
                    p.convertToFlatShadedMesh()
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
        
        @highlightMesh?.material?.diffuseColor = @preHighlightColor
        @preHighlightColor = mesh?.material?.diffuseColor
        mesh?.material?.diffuseColor = @preHighlightColor.multiply new Color3 1.5 1.5 1.5
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
