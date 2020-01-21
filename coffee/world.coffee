###
000   000   0000000   00000000   000      0000000    
000 0 000  000   000  000   000  000      000   000  
000000000  000   000  0000000    000      000   000  
000   000  000   000  000   000  000      000   000  
00     00   0000000   000   000  0000000  0000000    
###

{ elem, prefs } = require 'kxk'
{ Camera, Color3, DirectionalLight, Engine, HemisphericLight, MeshBuilder, Scene, Space, StandardMaterial, Vector3 } = require 'babylonjs'
{ vec } = require './poly/math'
generate = require './poly/generate'
Vect     = require './vect'
Camera   = require './camera'
Scene    = require './scene'
Space    = require './space'
Tree     = require './tree'
Shapes   = require './shapes'
Shader   = require './shader'
animate  = require './animate'

ϕ = (Math.sqrt(5)-1)/2

class World
    
    @: (@view) ->
        
        @paused = false
        @view.focus()
        
        @keys = new Float32Array 3*256
        
        @canvas = elem 'canvas' class:'babylon' parent:@view
        
        @engine = new Engine @canvas
        
        @scene  = new Scene @
        @shapes = new Shapes @scene
        @resized()
        
        a = 0.0 #0.065
        @scene.clearColor = new Color3 a, a, a

        @camera = new Camera @
        
        hemi = new HemisphericLight 'hemi' new Vector3(0 1 0), @scene
        hemi.intensity = 0.5
        
        light = new DirectionalLight 'light' new Vector3(0 -1 0), @scene
        light.position.y = 3

        @scene.initFog()
                
        if 0
            ground = MeshBuilder.CreateGround 'ground' {width:1000 height:1000 subdivisions: 4}, @scene
            ground.material = new StandardMaterial 'ground' @scene
            ground.material.specularColor = new Color3 0.05 0.05 0.05
            a = 0.05
            ground.material.diffuseColor = new Color3 a, a, a
            ground.receiveShadows = true
            ground.position.y = -2
             
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
  
        # vy = vec(0,1,0);
        # vx = vec(1,0,0);
#         
        # c1 = vec( 1.0, 1.0, 1.0).normalize().rotate(vy, -45.0).rotate(vx, -54.735)
        # c2 = vec( 1.0,-1.0,-1.0).normalize().rotate(vy, -45.0).rotate(vx, -54.735)
        # c3 = vec(-1.0, 1.0,-1.0).normalize().rotate(vy, -45.0).rotate(vx, -54.735)
        # c4 = vec(-1.0,-1.0, 1.0).normalize().rotate(vy, -45.0).rotate(vx, -54.735)
#         
        # n1 = c1.minus(c4).crossed(c4.minus(c2)).normalize()
        # n2 = c2.minus(c3).crossed(c3.minus(c1)).normalize()
        # n3 = c3.minus(c2).crossed(c2.minus(c4)).normalize()
        # n4 = c4.minus(c1).crossed(c1.minus(c3)).normalize()
#         
        # klog "vec3 c1 = vec3(#{c1.x}, #{c1.y}, #{c1.z});"
        # klog "vec3 c2 = vec3(#{c2.x}, #{c2.y}, #{c2.z});"
        # klog "vec3 c3 = vec3(#{c3.x}, #{c3.y}, #{c3.z});"
        # klog "vec3 c4 = vec3(#{c4.x}, #{c4.y}, #{c4.z});"
#              
        # klog "vec3 n1 = vec3(#{n1.x}, #{n1.y}, #{n1.z});"
        # klog "vec3 n2 = vec3(#{n2.x}, #{n2.y}, #{n2.z});"
        # klog "vec3 n3 = vec3(#{n3.x}, #{n3.y}, #{n3.z});"
        # klog "vec3 n4 = vec3(#{n4.x}, #{n4.y}, #{n4.z});"
        
        @shader = new Shader @
        # if 0
            # @space = new Space @
        # else if 0
            # @tree = new Tree @
        # else
            # @shapes.dah()
            
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
            # @highlight mesh    
            @scene.legend.show mesh.name
        else
            @scene.legend.show @legendMesh
        
    onMouseUp: (event) =>                
        
        if mesh = @pickedMesh()
            if mesh == @mouseDownMesh
                @cursor.position = mesh.getAbsolutePosition()
                @camera.fadeToPos mesh.getAbsolutePosition()
                @scene.legend.show mesh.name
                @legendMesh = mesh.name

        else if not @mouseDownMesh
            @cursor.position = [0 -1000 0]
            @scene.legend.hide()
            @legendMesh = null
                
        @camera.onMouseUp event
          
    pickedMesh: ->
        
        return null
        
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
                        
            @space?.render()
            @tree?.render()
            @shader?.render()
            @camera.render()
            @scene.render()
            animate.tick @engine.getDeltaTime()/1000
    
    # 00000000   00000000   0000000  000  0000000  00000000  
    # 000   000  000       000       000     000   000       
    # 0000000    0000000   0000000   000    000    0000000   
    # 000   000  000            000  000   000     000       
    # 000   000  00000000  0000000   000  0000000  00000000  
    
    resized: => 

        dpr = window.devicePixelRatio
        @engine.setSize @view.clientWidth * dpr, @view.clientHeight * dpr
        @canvas.style.transform = "scale(#{1/dpr})"
        @canvas.style.transformOrigin = "top left"
    
    # 000   000  00000000  000   000  
    # 000  000   000        000 000   
    # 0000000    0000000     00000    
    # 000  000   000          000     
    # 000   000  00000000     000     
    
    modKeyComboEventDown: (mod, key, combo, event) ->
        
        # klog 'modKeyComboEventDown' mod, key, combo, event.which, key.charCodeAt(0)
        if event.which < 256 and not event.repeat
            @keys[event.which]     = 1
            @keys[event.which+256] = 1
            @keys[event.which+512] = 1-@keys[event.which+512]
        switch key
            when 'e' then @camera.moveUp()
            when 'q' then @camera.moveDown()
            when 'a' then @camera.moveLeft()
            when 'd' then @camera.moveRight()
            when 'w' then @camera.moveForward()
            when 's' then @camera.moveBackward()
            when 'x' 'esc' then @camera.stopMoving()
            when 'r' then @camera.reset()
        
    modKeyComboEventUp: (mod, key, combo, event) ->

        # klog 'modKeyComboEventUp' mod, key, combo, event.code
        if event.which < 256
            @keys[event.which] = 0
        
        switch key
            when 'e' then @camera.stopUp()
            when 'q' then @camera.stopDown()
            when 'a' then @camera.stopLeft()
            when 'd' then @camera.stopRight()
            when 'w' then @camera.stopForward()
            when 's' then @camera.stopBackward()
        
        
module.exports = World
