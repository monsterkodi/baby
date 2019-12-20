###
 0000000   000   000   0000000   000000000
000   000  000   000  000   000     000   
000 00 00  000   000  000000000     000   
000 0000   000   000  000   000     000   
 00000 00   0000000   000   000     000   
###

{ deg2rad, rad2deg } = require 'kxk'
{ acos, asin, atan2, cos, sin, sqrt } = Math

Vect = require './vect'

class Quat
    
    @: (x=0, y=0, z=0, w=1) ->
        
        if x.x? and x.y? and x.z?
            @set x.x, x.y, x.z, x.w ? 0
        else if Array.isArray w
            @set w[0], w[1], w[2], w[3]
        else
            @set x, y, z, w
            
        if Number.isNaN @x
            throw new Error
             
    set: (@x, @y, @z, @w=1) ->
            
    rotateAxisAngle: (axis, angle) ->
        
        @multiplyInPlace Quat.axisAngle axis, angle
        @
       
    rotate:  (v) -> v.applyQuaternion @
    rotated: (v) -> new Vect(v).applyQuaternion @
        
    clone: -> new Quat @
    copy: (q) ->
        @x = q.x
        @y = q.y
        @z = q.z
        @w = q.w
        @
        
    rounded: ->        
        minDist = 1000
        minQuat = null
        up   = @rotate Vect.unitY
        back = @rotate Vect.unitZ
        for q in [  Quat.XupY
                    Quat.XupZ
                    Quat.XdownY
                    Quat.XdownZ
                    Quat.YupX
                    Quat.YupZ
                    Quat.YdownX
                    Quat.YdownZ
                    Quat.ZupX
                    Quat.ZupY
                    Quat.ZdownX
                    Quat.ZdownY
                    Quat.minusXupY
                    Quat.minusXupZ
                    Quat.minusXdownY
                    Quat.minusXdownZ
                    Quat.minusYupX
                    Quat.minusYupZ
                    Quat.minusYdownX
                    Quat.minusYdownZ
                    Quat.minusZupX
                    Quat.minusZupY
                    Quat.minusZdownX
                    Quat.minusZdownY
                    ]
            upDiff   = 1 - up.dot q.rotate Vect.unitY
            backDiff = 1 - back.dot q.rotate Vect.unitZ
            l = upDiff + backDiff
            if l < minDist
                minDist = l
                minQuat = q
                if l < 0.0001
                    break
        minQuat
        
    round: -> @clone @normalize().rounded()

    euler: -> [
        rad2deg atan2 2*(@w*@x+@y*@z), 1-2*(@x*@x+@y*@y)
        rad2deg asin  2*(@w*@y-@z*@x)
        rad2deg atan2 2*(@w*@z+@x*@y), 1-2*(@y*@y+@z*@z)]

    add: (quat) ->
        @w += quat.w 
        @x += quat.x 
        @y += quat.y 
        @z += quat.z
        @
    
    sub: (quat) ->
        @w -= quat.w 
        @x -= quat.x 
        @y -= quat.y 
        @z -= quat.z
        @
    
    minus: (quat) -> @clone().sub quat

    dot: (q) -> @x*q.x + @y*q.y + @z*q.z + @w*q.w
    
    normalize: ->
        l = sqrt @w*@w + @x*@x + @y*@y + @z*@z 
        if l != 0.0
            @w /= l 
            @x /= l 
            @y /= l 
            @z /= l
        @

    invert: ->
        l = sqrt @w*@w + @x*@x + @y*@y + @z*@z 
        if l != 0.0 
            @w /= l 
            @x = -@x/l
            @y = -@y/l
            @z = -@z/l 
        @

    isZero: -> @x==@y==@z==0 and @w==1
    reset: -> 
        @x=@y=@z=0
        @w=1 
        @
        
    conjugate: -> 
        @x = -@x
        @y = -@y
        @z = -@z
        @ 
        
    getNormal:     -> @clone().normalize()
    getConjugate:  -> @clone().conjugate()
    getInverse:    -> @clone().invert()
    neg:           -> new Quat -@w,-@x,-@y,-@z
    vector:        -> new Vect @x, @y, @z
    length:        -> sqrt @w*@w + @x*@x + @y*@y + @z*@z
    eql:       (q) -> @w==q.w and @x=q.x and @y==q.y and @z==q.z
    
    mul: (quatOrScalar) ->
        if quatOrScalar instanceof Quat
            quat = quatOrScalar
            a = (@w + @x) * (quat.w + quat.x)
            b = (@z - @y) * (quat.y - quat.z)
            c = (@w - @x) * (quat.y + quat.z) 
            d = (@y + @z) * (quat.w - quat.x)
            e = (@x + @z) * (quat.x + quat.y)
            f = (@x - @z) * (quat.x - quat.y)
            g = (@w + @y) * (quat.w - quat.z)
            h = (@w - @y) * (quat.w + quat.z)
            new Quat b + (-e - f + g + h)/2,
                     a -  (e + f + g + h)/2,
                     c +  (e - f + g - h)/2,
                     d +  (e - f - g + h)/2
        else
            f = parseFloat quatOrScalar
            new Quat @w*f, @x*f, @y*f, @z*f

    slerp: (quat, t) ->

        to1   = [0,0,0,0]
        cosom = @x * quat.x + @y * quat.y + @z * quat.z + @w * quat.w # calc cosine
        
        if cosom < 0 # adjust signs (if necessary)
            cosom = -cosom 
            to1[0] = -quat.x
            to1[1] = -quat.y
            to1[2] = -quat.z
            to1[3] = -quat.w
        else  
            to1[0] = quat.x
            to1[1] = quat.y
            to1[2] = quat.z
            to1[3] = quat.w
        
        if (1.0 - cosom) > 0.001 # calculate coefficients
            omega  = acos cosom  # standard case (slerp)
            sinom  = sin omega 
            scale0 = sin((1.0 - t) * omega) / sinom
            scale1 = sin(t * omega) / sinom
        else # "from" and "to" quaternions are very close -> we can do a linear interpolation
            scale0 = 1.0 - t
            scale1 = t

        new Quat scale0 * @w + scale1 * to1[3],
                 scale0 * @x + scale1 * to1[0], 
                 scale0 * @y + scale1 * to1[1],
                 scale0 * @z + scale1 * to1[2]

    #  0000000  000000000   0000000   000000000  000   0000000    
    # 000          000     000   000     000     000  000         
    # 0000000      000     000000000     000     000  000         
    #      000     000     000   000     000     000  000         
    # 0000000      000     000   000     000     000   0000000    
    
    @axisAngle: (axis, angle) -> 
        
        halfAngle = deg2rad(angle)/2 
        s = sin halfAngle
        
        new Quat axis.x * s,
                 axis.y * s,
                 axis.z * s,
                 cos halfAngle
                 
    @rotationFromEuler: (x,y,z) ->
        x = deg2rad x
        y = deg2rad y
        z = deg2rad z
        q = new Quat cos(x/2) * cos(y/2) * cos(z/2) + sin(x/2) * sin(y/2) * sin(z/2),
                     sin(x/2) * cos(y/2) * cos(z/2) - cos(x/2) * sin(y/2) * sin(z/2),
                     cos(x/2) * sin(y/2) * cos(z/2) + sin(x/2) * cos(y/2) * sin(z/2),
                     cos(x/2) * cos(y/2) * sin(z/2) - sin(x/2) * sin(y/2) * cos(z/2)
        q.normalize()
    
module.exports = Quat
