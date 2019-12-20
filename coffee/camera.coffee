###
 0000000   0000000   00     00  00000000  00000000    0000000 
000       000   000  000   000  000       000   000  000   000
000       000000000  000000000  0000000   0000000    000000000
000       000   000  000 0 000  000       000   000  000   000
 0000000  000   000  000   000  00000000  000   000  000   000
###

{ clamp, deg2rad, gamepad, prefs, reduce } = require 'kxk'
{ Camera, PointLight, Quaternion, UniversalCamera, Vector3 } = require 'babylonjs'

Vect = require './vect'
Quat = require './quat'

animate = require './animate'

vec = (x,y,z) -> new Vect x, y, z
quat = (x,y,z,w) -> new Quat x, y, z, w

class Camera extends UniversalCamera

    @: (@world) ->
        
        {@scene, @canvas, @view} = @world

        width  = @view.clientWidth
        height = @view.clientHeight
             
        info = 
            dist:   1000
            degree: 90 
            rotate: 0 
            pos:    {x:0,y:0,z:0}
            center: {x:0,y:0,z:0}
            
        values = prefs.get 'camera' info
        
        @size       = vec width, height
        @moveFade   = vec 0 0 0
        @center     = vec values.center
        @degree     = values.degree
        @rotate     = values.rotate
        @dist       = values.dist
        @minDist    = 10 #1000
        @maxDist    = 10000
        @moveDist   = 0.1
        @wheelInert = 0
        @moveX      = 0
        @moveY      = 0
        @moveZ      = 0
        @quat       = quat()
        
        super 'Camera' new Vector3(0 0 0), @scene

        @maxZ       = 100000
        @minZ       = 1
        
        @fov = deg2rad 60
        @rotationQuaternion = new Quaternion()
        @position.copyFrom values.pos
                
        @inertia = 0.8
        
        @light = new PointLight 'spot' @position, @scene
        @light.intensity = 0.5
                      
        @gamepad = new gamepad true
        @gamepad.on 'button' @onPadButton
        
        @view.addEventListener 'mousewheel' @onMouseWheel
        @navigate()

    getDir:   -> quat(@rotationQuaternion).rotated Vect.unitZ
    getUp:    -> quat(@rotationQuaternion).rotated Vect.unitY
    getRight: -> quat(@rotationQuaternion).rotated Vect.unitX

    setCenter: (p) ->

        @center = vec p
        @navigate()
    
    reset: ->
        @center = vec()
        @degree = 90
        @rotate = 0
        @dist   = 1000
        @navigate()
        
    del: =>
        
        @view.removeEventListener 'mousewheel' @onMouseWheel
    
    # 00000000   00000000  000   000  0000000    00000000  00000000   
    # 000   000  000       0000  000  000   000  000       000   000  
    # 0000000    0000000   000 0 000  000   000  0000000   0000000    
    # 000   000  000       000  0000  000   000  000       000   000  
    # 000   000  00000000  000   000  0000000    00000000  000   000  
    
    render: ->
        
        if @world.space?
            @speedFactor = @world.space.distFactor * 10000
        else
            @speedFactor = 1000
        @speedFactor *= 4 if @fastSpeed
        
        if state = @gamepad.getState()
            @onPadAxis state
        
    # 00000000    0000000   0000000    
    # 000   000  000   000  000   000  
    # 00000000   000000000  000   000  
    # 000        000   000  000   000  
    # 000        000   000  0000000    
        
    onPadAxis: (state) => 
    
        @rotate += state.right.x
        @degree -= state.right.y
                    
        if state.left.x == state.left.y == state.right.x == state.right.y == 0
            true
        else
            @fading = false
            if @dist > @moveDist
                @dist   = @moveDist
                @center = @getDir().mul(@dist).add @position
            
            speed = 0.02
            @moveRelative speed*state.left.x, 0, speed*state.left.y
            
            @navigate()
                            
    onPadButton: (button, value) =>
        
        if value
            switch button
                when 'LB' then @moveDown()
                when 'RB' then @moveUp()
                when 'LT' then @fastSpeed = true
        else
            switch button
                when 'LB' then @stopDown()
                when 'RB' then @stopUp()
                when 'LT' then @fastSpeed = false
        
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
            s = @speedFactor * 4
            @pan x*2*s/@size.x, y*s/@size.y
            
        if event.buttons & 3
            s = @dist == @moveDist and 500 or 2000
            @pivot s*x/@size.x, s*y/@size.y            
            
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
        
        if @dist <= @moveDist
            @dist = @centerTarget.dist @position
            @center = @getDir().mul(@dist).add @position

        @startFadeCenter()

    startFadeCenter: -> 
        
        if not @fading
            animate @fadeCenter
            @fading = true
            
    fadeCenter: (deltaSeconds) =>
        
        return if not @fading
        @center.fade @centerTarget, deltaSeconds
        @navigate()
        if @center.dist(@centerTarget) > 0.05
            animate @fadeCenter
            true
        else
            delete @fading

    # 00     00   0000000   000   000  00000000  
    # 000   000  000   000  000   000  000       
    # 000000000  000   000   000 000   0000000   
    # 000 0 000  000   000     000     000       
    # 000   000   0000000       0      00000000  
    
    moveForward:  (v=1)  -> @startMove @moveZ = v
    moveRight:    (v=1)  -> @startMove @moveX = v
    moveUp:       (v=1)  -> @startMove @moveY = v
    moveLeft:     (v=-1) -> @startMove @moveX = v
    moveDown:     (v=-1) -> @startMove @moveY = v
    moveBackward: (v=-1) -> @startMove @moveZ = v          

    stopRight:    -> @moveX = clamp -1 0 @moveX
    stopLeft:     -> @moveX = clamp  0 1 @moveX
    stopUp:       -> @moveY = clamp -1 0 @moveY
    stopDown:     -> @moveY = clamp  0 1 @moveY
    stopForward:  -> @moveZ = clamp -1 0 @moveZ
    stopBackward: -> @moveZ = clamp  0 1 @moveZ
        
    stopMoving: ->
        
        @fading = false
        @moving = false
        @moveX = 0
        @moveY = 0
        @moveZ = 0
       
    startMove: -> 
        
        @fading = false
        if not @moving
            @dist   = @moveDist
            @center = @getDir().mul(@dist).plus @position
            animate @moveCenter
            @moving = true
            
    moveCenter: (deltaSeconds) =>
        
        return if not @moving
        
        @moveRelative(deltaSeconds *     (@moveX or @moveFade.x)
                      deltaSeconds *     (@moveY or @moveFade.y)
                      deltaSeconds * 2 * (@moveZ or @moveFade.z))
        
        @navigate()
                
        @moveFade.x = @moveX or reduce @moveFade.x, deltaSeconds
        @moveFade.y = @moveY or reduce @moveFade.y, deltaSeconds
        @moveFade.z = @moveZ or reduce @moveFade.z, deltaSeconds
        
        if @moveFade.length() > 0.001
            animate @moveCenter
        else
            @stopMoving()
        
    moveRelative: (x, y, z) ->
        
        v = vec x, y, z
        v.scale @speedFactor
        v.applyQuaternion @rotationQuaternion
        
        @center.add v
            
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
        if Math.abs(@wheelInert) > 0.001
            if @wheelInert > 0 and @dist > @minDist or @wheelInert < 0 and @dist < @maxDist
                animate @inertZoom
                return true

        delete @zooming
        @wheelInert = 0
    
    setDist: (factor) =>
                
        @dist = clamp @minDist, @maxDist, @dist*factor
        @navigate()
        
    setFov: (fov) -> @fov = Math.max 2.0 Math.min fov, 175.0
    
    scaleDown: ->
        
        @center.scale 0.01
        @position.scaleInPlace 0.01
        @dist *= 0.01
        @navigate()

    scaleUp: (offset) ->
        
        @center.sub offset
        @position.sub offset
        
        @center.scale 100
        @position.scaleInPlace 100
        @dist *= 100
        @navigate()
        
    # 000   000   0000000   000   000  000   0000000    0000000   000000000  00000000  
    # 0000  000  000   000  000   000  000  000        000   000     000     000       
    # 000 0 000  000000000   000 000   000  000  0000  000000000     000     0000000   
    # 000  0000  000   000     000     000  000   000  000   000     000     000       
    # 000   000  000   000      0      000   0000000   000   000     000     00000000  
    
    navigate: -> 
        
        @degree = clamp 1 179 @degree
        
        yaw   = deg2rad @rotate
        pitch = deg2rad @degree
        
        @rotationQuaternion.copyFrom Quaternion.RotationYawPitchRoll yaw, pitch, 0
        v = new Vector3 0 0 -@dist
        v.rotateByQuaternionAroundPointToRef @rotationQuaternion, Vector3.ZeroReadOnly, v
        @position.copyFrom @center.plus v
        @setTarget new Vector3 @center.x, @center.y, @center.z
        
        info = 
            rotate: @rotate 
            degree: @degree 
            dist:   @dist
            pos:    {x:@position.x, y:@position.y, z:@position.z}
            center: {x:@center.x, y:@center.y, z:@center.z}

        prefs.set 'camera' info
        
        if 12*@minDist/@dist >= 8
            @scene.style.fontSize = 12*@minDist/@dist
        else
            @scene.style.fontSize = 0
        
module.exports = Camera
