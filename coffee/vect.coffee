###
000   000  00000000   0000000  000000000
000   000  000       000          000   
 000 000   0000000   000          000   
   000     000       000          000   
    0      00000000   0000000     000   
###

{ randRange, rad2deg } = require 'kxk'
{ Vector3 } = require 'babylonjs'
{ round, acos, atan2, abs, sqrt } = Math 

class Vect extends Vector3

    @counter = 0
    @tmp = new Vect
    
    @: (x=0,y=0,z=0) ->
        
        Vect.counter += 1
        
        if x.x? and x.y?
            super x.x, x.y, x.z ? 0
        else if Array.isArray x
            super x[0], x[1], x[2] ? 0
        else
            super x, y, z ? 0
        if Number.isNaN @x
            throw new Error
            
    toString: -> "#{@x} #{@y} #{@z}"
            
    clone: -> new Vect @
    copy: (v) -> 
        @x = v.x
        @y = v.y 
        @z = v.z ? 0
        @

    parallel: (n) ->
        dot = @x*n.x + @y*n.y + @z*n.z
        new Vect dot*n.x, dot*n.y, dot*n.z

    perpendicular: (n) -> # projection of normalized vector n to vector that is perpendicular to this
        dot = @x*n.x + @y*n.y + @z*n.z
        new Vect @x-dot*n.x, @y-dot*n.y, @z-dot*n.z 

    reflect: (n) ->
        dot = 2*(@x*n.x + @y*n.y + @z*n.z)
        new Vect @x-dot*n.x, @y-dot*n.y, @z-dot*n.z
        
    rotated: (axis, angle) -> @clone().rotate axis,angle
    rotate: (axis, angle) ->
        Quat = require './quat'
        @applyQuaternion Quat.axisAngle axis, angle
        @

    crossed: (v) -> @clone().cross(v)
    cross: (v) ->
        ax = @x 
        ay = @y 
        az = @z
        @x = ay * v.z - az * v.y
        @y = az * v.x - ax * v.z
        @z = ax * v.y - ay * v.x
        @
    
    normal: -> @clone().normalize()
    normalize: ->
        l = @length()
        if l
            l = 1.0/l
            @x *= l
            @y *= l
            @z *= l
        @    

    xyperp: -> new Vect -@y, @x
    
    rounded: -> @clone().round()
    round: -> 
        @x = round @x 
        @y = round @y 
        @z = round @z
        @

    equals: (o) -> @manhattan(o) < 0.001
    same:   (o) -> @x==o.x and @y==o.y and z=o.z

    faded: (o, val) -> @clone().fade o, val
    fade: (o, val) -> # linear interpolation from this (val==0) to other (val==1)
        
        @x = @x * (1-val) + o.x * val
        @y = @y * (1-val) + o.y * val
        @z = @z * (1-val) + o.z * val
        @
    
    xyangle: (v) ->
        
        thisXY  = new Vect(@x, @y).normal()
        otherXY = new Vect(v.x, v.y).normal()
        if thisXY.xyperp().dot otherXY >= 0 
            return rad2deg(acos(thisXY.dot otherXY))
        -rad2deg(acos(thisXY.dot otherXY))
        
    paris: (o) -> 
        m = [abs(o.x-@x),abs(o.y-@y),abs(o.z-@z)]
        m.sort (a,b) -> b-a
        m[0]+0.2*m[1]+0.1*m[2]
    
    manhattan: (o) -> abs(o.x-@x)+abs(o.y-@y)+abs(o.z-@z)
    dist:   (o) -> @minus(o).length()
    length:    -> sqrt @x*@x + @y*@y + @z*@z
    dot:   (v) -> @x*v.x + @y*v.y + @z*v.z
    
    mul:   (f) -> new Vect @x*f, @y*f, @z*f
    div:   (d) -> new Vect @x/d, @y/d, @z/d
    plus:  (v) -> new Vect(v).add @
    minus: (v) -> new Vect(v).neg().add @
    neg:       -> new Vect -@x, -@y, -@z
    to:    (v) -> new Vect(v).sub @
        
    angle: (v) -> 
        
        if l = @length()
            if o = v.length()
                x = @x / l
                y = @y / l
                z = @z / l
                p = v.x / o
                q = v.y / o
                r = v.z / o
                return rad2deg acos x*p + y*q + z*r
        0    
    
    negate:  -> @scale -1
    scale: (f) ->
        @x *= f
        @y *= f
        @z *= f
        @
        
    reset: ->
        @x = @y = @z = 0
        @
    
    isZero: -> @x == @y == @z == 0

    randomize: -> 
        @set randRange(-1,1),randRange(-1,1),randRange(-1,1)
        @normalize()
        @
        
    polarize: ->
        radius = @length()
        theta = atan2 @y, @x
        phi   = acos @z / radius
        @x = theta
        @y = phi
        @z = radius
        @
        
    @random: -> new Vect().randomize()
            
    @rayPlaneIntersection: (rayPos, rayDirection, planePos, planeNormal) ->
        x = planePos.minus(rayPos).dot(planeNormal) / rayDirection.dot(planeNormal)
        return rayPos.plus rayDirection.mul x

    @pointMappedToPlane: (point, planePos, planeNormal) ->
        point.minus(planeNormal).dot point.minus(planePos).dot(planeNormal)

    @rayPlaneIntersectionFactor: (rayPos, rayDir, planePos, planeNormal) ->
        rayDot = rayDir.dot planeNormal
        if Number.isNaN rayDot
            throw new Error
        return 2 if rayDot == 0
        r = planePos.minus(rayPos).dot(planeNormal) / rayDot
        if Number.isNaN r
            log 'rayPos' rayPos
            log 'rayDir' rayDir
            log 'planePos' planePos
            log 'planeNormal' planeNormal
            throw new Error
        r

    @PX = 0
    @PY = 1
    @PZ = 2
    @NX = 3
    @NY = 4
    @NZ = 5
        
    @unitX  = new Vect  1  0  0
    @unitY  = new Vect  0  1  0
    @unitZ  = new Vect  0  0  1
    @minusX = new Vect -1  0  0
    @minusY = new Vect  0 -1  0
    @minusZ = new Vect  0  0 -1
    
    @normals = [Vect.unitX, Vect.unitY, Vect.unitZ, Vect.minusX, Vect.minusY, Vect.minusZ]
        
    @perpNormals: (v) -> 
        i = @normalIndex(v)
        switch i
            when @PX then [@unitY, @unitZ, @minusY, @minusZ]
            when @PY then [@minusX, @unitZ, @unitX, @minusZ]
            when @PZ then [@unitY, @minusX, @minusY, @unitX]
            when @NX then [@unitY, @minusZ, @minusY, @unitZ]            
            when @NY then [@minusX, @minusZ, @unitX, @unitZ]            
            when @NZ then [@unitY, @unitX, @minusY, @minusX]            
    
    @normalIndex: (v) -> 
    
        cn = @closestNormal v
        for i in [0...6]
            if Vect.normals[i].equals cn
                return i
        -1
    
    @closestNormal: (v) ->
        
        Vect.tmp.copy v
        Vect.tmp.normalize()
        angles = []
        for n in Vect.normals
            if n.equals Vect.tmp
                return n
            angles.push [n.angle(Vect.tmp), n]
                
        angles.sort (a,b) -> a[0]-b[0]
        angles[0][1]
    
module.exports = Vect
