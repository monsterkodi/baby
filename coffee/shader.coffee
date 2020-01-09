###
 0000000  000   000   0000000   0000000    00000000  00000000   
000       000   000  000   000  000   000  000       000   000  
0000000   000000000  000000000  000   000  0000000   0000000    
     000  000   000  000   000  000   000  000       000   000  
0000000   000   000  000   000  0000000    00000000  000   000  
###

{ Mesh, MeshBuilder, ShaderMaterial, Vector2 } = require 'babylonjs'
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
            uniform vec2  iMouse;
            uniform vec2  iResolution;
            
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
                uniforms:   ['worldViewProjection' 'iTime' 'iMouse' 'iResolution']
            
        @plane = MeshBuilder.CreatePlane "plane", { width: 10, height: 10 }, @scene
        @plane.material = @shaderMaterial
        @plane.billboardMode = Mesh.BILLBOARDMODE_ALL
           
    render: ->
        
        @plane.position.copyFrom @world.camera.position.add @world.camera.getDir().scale 2
        
        @shaderMaterial.setFloat   'iTime' performance.now()/1000
        @shaderMaterial.setVector2 'iMouse'      new Vector2(@world.camera.mouseX, @world.canvas.height-@world.camera.mouseY)
        @shaderMaterial.setVector2 'iResolution' new Vector2(@world.canvas.width, @world.canvas.height)
                
module.exports = Shader
