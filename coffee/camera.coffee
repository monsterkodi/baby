###
 0000000   0000000   00     00  00000000  00000000    0000000 
000       000   000  000   000  000       000   000  000   000
000       000000000  000000000  0000000   0000000    000000000
000       000   000  000 0 000  000       000   000  000   000
 0000000  000   000  000   000  00000000  000   000  000   000
###

{ clamp, deg2rad, reduce } = require 'kxk'
{ Camera, PointLight, UniversalCamera } = require 'babylonjs'

Vect = require './vect'
Quat = require './quat'

animate = require './animate'

vec = (x,y,z) -> new Vect x, y, z
quat = (x,y,z,w) -> new Quat x, y, z, w

class Camera extends UniversalCamera

    @: (@scene, @view, @canvas) ->
        
        width  = @view.clientWidth
        height = @view.clientHeight
                
        @size       = vec width, height
        @dist       = 10
        @maxDist    = 100
        @minDist    = 2
        @center     = vec 10.5 3 6
        @moveFade   = vec 0 0 0
        @degree     = 90
        @rotate     = 0
        @wheelInert = 0
        @pivotX     = 0
        @pivotY     = 0
        @moveX      = 0
        @moveY      = 0
        @moveZ      = 0
        @quat       = quat()

        
        super 'Camera' vec(0 -10 0), @scene

        @fov = deg2rad 20
        @rotationQuaternion = new Quat()
        @setTarget @center
                
        @inertia = 0.8
        
        @light = new PointLight 'spot' @position, @scene
        @light.intensity = 0.5
                        
        @view.addEventListener 'mousewheel' @onMouseWheel
        @navigate()

    getDir:    -> @rotationQuaternion.rotated Vect.unitZ
    getUp:     -> @rotationQuaternion.rotated Vect.unitY
    getRight:  -> @rotationQuaternion.rotated Vect.unitX

    setCenter: (p) ->

        @center = vec p
        @navigate()
    
    del: =>
        
        @view.removeEventListener  'mousewheel' @onMouseWheel
        
    # 00     00   0000000   000   000   0000000  00000000  
    # 000   000  000   000  000   000  000       000       
    # 000000000  000   000  000   000  0000000   0000000   
    # 000 0 000  000   000  000   000       000  000       
    # 000   000   0000000    0000000   0000000   00000000  
    
    onMouseDown: (event) => 
        
        @downButtons = event.buttons
        @mouseMoved  = false
            
        @mouseX = event.clientX
        @mouseY = event.clientY
        
        @downPos = vec @mouseX, @mouseY
        
    onMouseUp: (event) => #klog 'up'

    onMouseDrag: (event) =>

        x = event.clientX-@mouseX
        y = event.clientY-@mouseY

        @mouseX = event.clientX
        @mouseY = event.clientY
        
        if @downPos?.dist(vec @mouseX, @mouseY) > 60
            @mouseMoved = true
        
        if event.buttons & 4
            s = @dist
            @pan x*2*s/@size.x, y*s/@size.y
            
        if event.buttons & 3
            @pivot 4000*x/@size.x, 2000*y/@size.y            
            
    # 00000000   000  000   000   0000000   000000000  
    # 000   000  000  000   000  000   000     000     
    # 00000000   000   000 000   000   000     000     
    # 000        000     000     000   000     000     
    # 000        000      0       0000000      000     
    
    pivot: (x,y) ->
         
        @rotate += 0.1*x
        @degree += 0.1*y
                 
        @navigate()
           
    # 00000000    0000000   000   000  
    # 000   000  000   000  0000  000  
    # 00000000   000000000  000 0 000  
    # 000        000   000  000  0000  
    # 000        000   000  000   000  
    
    pan: (x,y) ->
        
        right = vec -x, 0, 0 
        right.applyQuaternion @rotationQuaternion

        up = vec 0, y, 0 
        up.applyQuaternion @rotationQuaternion
        
        @center.add right.plus up
        @centerTarget?.copy @center
        @navigate()
            
    # 00000000   0000000    0000000  000   000   0000000  
    # 000       000   000  000       000   000  000       
    # 000000    000   000  000       000   000  0000000   
    # 000       000   000  000       000   000       000  
    # 000        0000000    0000000   0000000   0000000   
                     
    fadeToPos: (v) -> 
        
        @centerTarget = vec v
        @startFadeCenter()

    startFadeCenter: -> 
        
        if not @fading
            animate @fadeCenter
            @fading = true
            
    fadeCenter: (deltaSeconds) =>
        
        return if not @fading
        
        @center.fade @centerTarget, deltaSeconds
        @navigate()
        
        if @center.dist(@centerTarget) > 0.00001
            animate @fadeCenter
            true
        else
            delete @fading

    # 00     00   0000000   000   000  00000000  
    # 000   000  000   000  000   000  000       
    # 000000000  000   000   000 000   0000000   
    # 000 0 000  000   000     000     000       
    # 000   000   0000000       0      00000000  
    
    moveForward:  -> @startMove @moveZ = 1
    moveRight:    -> @startMove @moveX = 1
    moveUp:       -> @startMove @moveY = 1
    moveLeft:     -> @startMove @moveX = -1
    moveDown:     -> @startMove @moveY = -1
    moveBackward: -> @startMove @moveZ = -1          

    stopRight:    -> @moveX = clamp -1 0 @moveX
    stopLeft:     -> @moveX = clamp  0 1 @moveX
    stopUp:       -> @moveY = clamp -1 0 @moveY
    stopDown:     -> @moveY = clamp  0 1 @moveY
    stopForward:  -> @moveZ = clamp -1 0 @moveZ
    stopBackward: -> @moveZ = clamp  0 1 @moveZ
        
    stopMoving: ->
        
        @moving = false
        @moveX = 0
        @moveY = 0
        @moveZ = 0
       
    startMove: -> 
        
        @fading = false
        if not @moving
            @dist = @minDist
            @center = @position.plus @getDir().mul @dist
            animate @moveCenter
            @moving = true
            
    moveCenter: (deltaSeconds) =>
        
        return if not @moving
                
        dir = vec()
        dir.add Vect.unitX.mul 10 * (@moveX or @moveFade.x)
        dir.add Vect.unitY.mul 10 * (@moveY or @moveFade.y)
        dir.add Vect.unitZ.mul 10 * (@moveZ or @moveFade.z)
        
        dir.scale deltaSeconds
        @rotationQuaternion.rotate dir
        
        @center.add dir
        @navigate()
        
        @moveFade.x = @moveX or reduce @moveFade.x, deltaSeconds
        @moveFade.y = @moveY or reduce @moveFade.y, deltaSeconds
        @moveFade.z = @moveZ or reduce @moveFade.z, deltaSeconds
        
        if @moveFade.length() > 0.001
            animate @moveCenter
        else
            @stopMoving()
        
    # 000   000  000   000  00000000  00000000  000      
    # 000 0 000  000   000  000       000       000      
    # 000000000  000000000  0000000   0000000   000      
    # 000   000  000   000  000       000       000      
    # 00     00  000   000  00000000  00000000  0000000  
    
    onMouseWheel: (event) => 
            
        if @wheelInert > 0 and event.wheelDelta < 0
            @wheelInert = 0
            return
            
        if @wheelInert < 0 and event.wheelDelta > 0
            @wheelInert = 0
            return
            
        @wheelInert += event.wheelDelta * (1+(@dist/@maxDist)*3) * 0.0001
        
        @startZoom()

    # 0000000   0000000    0000000   00     00  
    #    000   000   000  000   000  000   000  
    #   000    000   000  000   000  000000000  
    #  000     000   000  000   000  000 0 000  
    # 0000000   0000000    0000000   000   000  

    startZoomIn: ->
        
        @wheelInert = (1+(@dist/@maxDist)*3)*10
        @startZoom()
        
    startZoomOut: ->
        
        @wheelInert = -(1+(@dist/@maxDist)*3)*10
        @startZoom()
    
    startZoom: -> 
        
        if not @zooming
            animate @inertZoom
            @zooming = true
            
    stopZoom: -> 
        
        @wheelInert = 0
        @zooming = false
    
    inertZoom: (deltaSeconds) =>

        @setDist 1 - clamp -0.02 0.02 @wheelInert
        @wheelInert = reduce @wheelInert, deltaSeconds*0.2
        if Math.abs(@wheelInert) > 0.00000001
            animate @inertZoom
            true
        else
            delete @zooming
            @wheelInert = 0
    
    setDist: (factor) =>
                
        @dist = clamp @minDist, @maxDist, @dist*factor
        @navigate()
        
    setFov: (fov) -> @fov = Math.max(2.0 Math.min fov, 175.0)
    
    # 000   000  00000000   0000000     0000000   000000000  00000000  
    # 000   000  000   000  000   000  000   000     000     000       
    # 000   000  00000000   000   000  000000000     000     0000000   
    # 000   000  000        000   000  000   000     000     000       
    #  0000000   000        0000000    000   000     000     00000000  
    
    navigate: -> 
        
        @degree = clamp 1 179 @degree
        
        yaw   = deg2rad @rotate
        pitch = deg2rad @degree
        @rotationQuaternion.copyFrom Quat.RotationYawPitchRoll yaw, pitch, 0
        @position.copyFrom @center.plus @rotationQuaternion.rotate vec(0 0 -@dist)
        @setTarget @center
        
        if 18*@minDist/@dist >= 8
            @scene.style.fontSize = 18*@minDist/@dist
        else
            @scene.style.fontSize = 0
        
module.exports = Camera
