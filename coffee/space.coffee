###
 0000000  00000000    0000000    0000000  00000000
000       000   000  000   000  000       000     
0000000   00000000   000000000  000       0000000 
     000  000        000   000  000       000     
0000000   000        000   000   0000000  00000000
###

{ Color3, Mesh, Space, StandardMaterial } = require 'babylonjs'
{ deg2rad, klog } = require 'kxk'
{ random } = Math
{ vec } = require './poly/math'
generate = require './poly/generate'
Dimension = require './dimension'

class Space

    @: (@world) ->

        @scene = @world.scene
        @dimension = new Dimension @world, 10000
        
        @lower = []
        for i in [0...8]
            @lower.push new Dimension @world, 100, vec 200*(i%2), 200*((i>>1)%2), 200*((i>>2)%2)
            @lower[-1].name = "lower_#{i}"
        
        if 0
            poly = generate 'h0.1jgD' true
            poly.colorize 'signature'
            
            p = Mesh.CreatePolyhedron poly.name, {custom:poly}, @scene
            @scene.showFaces p, poly
            
            p.material = new StandardMaterial
            p.material.diffuseColor = new Color3 0 0 0.1
            
            for i in [0...10]
                inst = p.createInstance "#{poly.name}_#{i}" 
                s = 40+i*40 #(1+random()*3)*100
                inst.scaling = vec s, s, s
                # inst.position.x = (random()-0.5)*10
                # inst.position.z = (random()-0.5)*10
                # inst.position.y = 10+(random())*20

                inst.rotate vec(0,1,0), deg2rad random()*180
                inst.rotate vec(1,0,0), deg2rad random()*180
    
                @scene.shadowGenerator?.addShadowCaster inst

        if 0
            poly = generate 'h0.6O' true
            poly.colorize 'signature'
            
            p = Mesh.CreatePolyhedron poly.name, {custom:poly}, @scene
            @scene.showFaces p, poly
                
            for i in [0...100]
                inst = p.createInstance "#{poly.name}_#{i}" 
                s = (1+random()*3)*.1
                inst.scaling = vec s, s, s
                inst.position.x = (random()-0.5)*20
                inst.position.z = (random()-0.5)*20
                inst.position.y = (random())*5
                inst.rotate vec(0,1,0), random()

    render: ->
        
        campos = vec @world.camera.position
        oldDistance = @distance
        
        swapDist = 5000
        
        @distance = campos.length()
        @distFactor = @distance / swapDist
        
        if @distance >= swapDist
            if oldDistance < swapDist
                klog 'distance' @distance, 'distFactor' @distFactor, 'lower' @lower.length
                
                for lower in @lower
                    lower.del()
                
                @dimension.scaleDown()
                @world.camera.scaleDown()
                @distance *= 0.01
                @distFactor = @distance / swapDist
                klog 'newDistance' @distance, @world.camera.position.length()
                @lower = [@dimension]
                @dimension = new Dimension @world, swapDist
        else
            # klog 'inner'
            @lower.sort (a,b) ->
                campos.to(a.position).length()-campos.to(b.position).length()
                
            @distance = campos.to(@lower[0].position).length()
            @distFactor = @distance / swapDist
            
            if @distance < 50 and oldDistance > 50 
            
                klog 'distance' @distance, 'distFactor' @distFactor, 'lower' @lower[0].name
                
                @dimension.del()
                @dimension = @lower.shift()

                for lower in @lower
                    lower.del()
                
                offset = vec @dimension.position
                @dimension.scaleUp offset
                @world.camera.scaleUp offset
                @distance *= 100
                @distFactor = @distance / swapDist
                klog 'newDistance' @distance, @world.camera.position.length()
                
                @lower = []
                for i in [0...4]
                    @lower.push new Dimension @world, 100, vec 200*(i%2), 200*((i>>1)%2), 200*((i>>2)%2)
                    @lower[-1].name = "lower_#{i}"
                
module.exports = Space
