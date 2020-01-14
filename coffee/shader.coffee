###
 0000000  000   000   0000000   0000000    00000000  00000000   
000       000   000  000   000  000   000  000       000   000  
0000000   000000000  000000000  000   000  0000000   0000000    
     000  000   000  000   000  000   000  000       000   000  
0000000   000   000  000   000  0000000    00000000  000   000  
###

{ Mesh, MeshBuilder, ShaderMaterial, Vector2, Vector3 } = require 'babylonjs'
{ performance } = require 'perf_hooks'
{ slash } = require 'kxk'
# Vect = require './vect'
        
class Shader
    
    @: (@world) ->

        @scene = @world.scene
        
        vertexShader =  """
            precision highp float;
            attribute vec3 position;
            attribute vec2 uv;
            uniform mat4 worldViewProjection;
            void main(void) {
                gl_Position = worldViewProjection * vec4(position, 1.0);
            }
            """
        
        fragSource = slash.readText "#{__dirname}/../shader/sdf.frag"
                    
        fragmentShader = """
            precision highp float;
            uniform float iTime;
            uniform float iMs;
            uniform float iDist;
            uniform float iMinDist;
            uniform float iMaxDist;
            uniform float iRotate;
            uniform float iDegree;
            uniform vec2  iDelta;
            uniform vec2  iMouse;
            uniform vec2  iResolution;
            uniform vec3  iCenter;
            uniform vec3  iCamera;
            
            #{fragSource}
                                    
            void main(void) 
            {
                mainImage(gl_FragColor, gl_FragCoord.xy);
            }
            """
            
        @shaderMaterial = new ShaderMaterial "shader", @scene,  
                fragmentSource:fragmentShader
                vertexSource:  vertexShader
            ,
                attributes: ['position' 'normal' 'uv']
                uniforms:   ['worldViewProjection' 'iMs' 'iDist' 'iMaxDist' 'iMinDist' 'iCenter' 'iCamera'
                             'iDelta' 'iTime' 'iMouse' 'iResolution' 'iRotate' 'iDegree']
            
        @plane = MeshBuilder.CreatePlane "plane", { width: 10, height: 10 }, @scene
        @plane.material = @shaderMaterial
        @plane.billboardMode = Mesh.BILLBOARDMODE_ALL
           
    render: ->
        
        @plane.position.copyFrom @world.camera.position.add @world.camera.getDir().scale 2
        
        dpr = window.devicePixelRatio
        
        mouseX = @world.camera.mouseX ? 0;
        mouseY = @world.camera.mouseY ? @world.canvas.height/dpr;
        
        @shaderMaterial.setFloat   'iMs'         @world.engine.getDeltaTime()
        @shaderMaterial.setFloat   'iTime'       performance.now()/1000
        @shaderMaterial.setFloat   'iDist'       @world.camera.dist
        @shaderMaterial.setFloat   'iMinDist'    @world.camera.minDist
        @shaderMaterial.setFloat   'iMaxDist'    @world.camera.maxDist
        @shaderMaterial.setFloat   'iRotate'     @world.camera.rotate
        @shaderMaterial.setFloat   'iDegree'     @world.camera.degree
        @shaderMaterial.setVector2 'iDelta'      new Vector2(@world.camera.mouseDelta.x, @world.camera.mouseDelta.y) 
        @shaderMaterial.setVector2 'iMouse'      new Vector2(mouseX*dpr, @world.canvas.height-mouseY*dpr)
        @shaderMaterial.setVector2 'iResolution' new Vector2(@world.canvas.width, @world.canvas.height)
        @shaderMaterial.setVector3 'iCenter'     new Vector3(@world.camera.center.x, @world.camera.center.y, @world.camera.center.z)
        @shaderMaterial.setVector3 'iCamera'     new Vector3(@world.camera.position.x, @world.camera.position.y, @world.camera.position.z)
                
module.exports = Shader