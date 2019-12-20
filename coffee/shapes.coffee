###
 0000000  000   000   0000000   00000000   00000000   0000000
000       000   000  000   000  000   000  000       000     
0000000   000000000  000000000  00000000   0000000   0000000 
     000  000   000  000   000  000        000            000
0000000   000   000  000   000  000        00000000  0000000 
###

{ Color3, Mesh, Vector3 } = require 'babylonjs'
{ colors, deg2rad, empty } = require 'kxk'
generate = require './poly/generate'
Vect = require './vect'

class Shapes
    
    @: (@scene) ->

        @meshes = {}
    
    create: (code, color) ->
        
        if not @meshes[code]
            
            poly = generate code 
            @meshes[code] = Mesh.CreatePolyhedron poly.name, {custom:poly}, @scene
            @meshes[code].registerInstancedBuffer 'color' 4
            @meshes[code].instancedBuffers.color = color
            
        inst = @meshes[code].createInstance "inst_#{code}"
        inst.instancedBuffers.color = color
        inst
        
    dah: ->
        
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
            ['V5''feV5''foV5''fcV5''fbV5' '' 'kV5''xV5''mV5''sV5''pV5' '' 'qV5''fjV5''hV5''nV5' 'faV5'] 
            ]

        # rows = [['tO']]
        # for alias,code of generate.alias
            # rows[0].push 'h(.3,.1)'+code
                      
        colors = [
            new Color3 .3 .3 .3
            new Color3 .2 .2 .5
            new Color3 .5 .5  1
            new Color3 .4 .4 .9
            new Color3 .3 .3 .7
            new Color3 .2 .2 .5
            new Color3 .1 .1 .3
            new Color3  1 .4 .4 
            new Color3 .6 .3 .3 
            new Color3 .4 .2 .2 
            new Color3 .2 .1 .1 
        ]
        
        ri = 0
        for row in rows
            ci = 0
            ri++
            for code in row
                ci++
                continue if empty code
                for d,y in ['']
                    # klog d+code
                    poly = generate d+code, true
                    poly.colorize 'signature'
                    faceColors = poly.colors.map (ci) -> colors[parseInt ci]
                    
                    p = Mesh.CreatePolyhedron d+code, {custom:poly, faceColors:faceColors}, @scene
                    @scene.showFaces p, poly
                    
                    # @scene.showNormals p
                    # @scene.showIndices p, poly
                    # @scene.showDebug p, poly
                    # @scene.label p
                    # p.receiveShadows = true
                    p.scaling = new Vector3 100 100 100
                    p.position.x = 300*ci
                    p.position.z = 300*ri
                    p.position.y = y*300
                    p.rotate Vect.unitX, deg2rad -90
                    # p.convertToFlatShadedMesh()
                    # @scene.shadowGenerator?.addShadowCaster p

module.exports = Shapes
