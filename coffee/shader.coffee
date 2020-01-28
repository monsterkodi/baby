###
 0000000  000   000   0000000   0000000    00000000  00000000   
000       000   000  000   000  000   000  000       000   000  
0000000   000000000  000000000  000   000  0000000   0000000    
     000  000   000  000   000  000   000  000       000   000  
0000000   000   000  000   000  0000000    00000000  000   000  
###

{ Mesh, MeshBuilder, RawTexture, ShaderMaterial, Vector2, Vector3, Vector4 } = require 'babylonjs'
{ performance } = require 'perf_hooks'
{ klog, slash } = require 'kxk'
        
class Shader
    
    @: (@world) ->

        @scene = @world.scene
        @frameRates = []
        @iFrame = 0
        vertexShader =  """
            precision highp float;
            attribute vec3 position;
            attribute vec2 uv;
            uniform mat4 worldViewProjection;
            void main(void) {
                gl_Position = worldViewProjection * vec4(position, 1.0);
            }
            """
        
        # fragSource = slash.readText "#{__dirname}/../shader/graph.frag"
        # fragSource = slash.readText "#{__dirname}/../shader/kalamari.frag"
        # fragSource = slash.readText "#{__dirname}/../shader/kalamari_blueprint.frag"
        # fragSource = slash.readText "#{__dirname}/../shader/krap.frag"
        # fragSource = slash.readText "#{__dirname}/../shader/twist.frag"
        # fragSource = slash.readText "#{__dirname}/../shader/worm.frag"
        # fragSource = slash.readText "#{__dirname}/../shader/kerl.frag"
        fragSource = slash.readText "#{__dirname}/../shader/astro.frag"
                    
        fragmentShader = """
            precision highp float;
            uniform float iTime;
            uniform float iTimeDelta;
            uniform float iFrameRate;
            uniform float iMs;
            uniform float iCompile;
            uniform float iDist;
            uniform float iMinDist;
            uniform float iMaxDist;
            uniform float iRotate;
            uniform float iDegree;
            uniform vec2  iDelta;
            uniform vec4  iMouse;
            uniform vec2  iResolution;
            uniform vec3  iCenter;
            uniform vec3  iCamera;
            uniform int   iFrame;
            uniform sampler2D iChannel0;
            
            #{fragSource}
                                    
            void main(void) 
            {
                mainImage(gl_FragColor, gl_FragCoord.xy);
            }
            """
            
        @shaderStart = performance.now()
        @shaderMaterial = new ShaderMaterial "shader", @scene,  
                fragmentSource:fragmentShader
                vertexSource:  vertexShader
            ,
                attributes: ['position' 'normal' 'uv']
                uniforms:   ['worldViewProjection' 'iMs' 'iDist' 'iMaxDist' 'iMinDist' 'iCenter' 'iCamera' 'iFrameRate' 
                             'iDelta' 'iTime' 'iTimeDelta' 'iMouse' 'iResolution' 'iRotate' 'iDegree' 'iFrame' 'iCompile']
            
        @plane = MeshBuilder.CreatePlane "plane", { width: 10, height: 10 }, @scene
        @plane.material = @shaderMaterial
        @plane.billboardMode = Mesh.BILLBOARDMODE_ALL
           
        @shaderMaterial.onCompiled = => 
            @compileTime = parseInt performance.now()-@shaderStart
            klog "compileTime #{@compileTime/1000}s" 
        
    render: ->
        
        @plane.position.copyFrom @world.camera.position.add @world.camera.getDir().scale 2
        
        dpr = window.devicePixelRatio
        
        mouseX = @world.camera.mouseX ? 0;
        mouseY = @world.camera.mouseY ? @world.canvas.height/dpr;
        
        @frameRates.push @world.engine.getFps()
        if @frameRates.length > 30 then @frameRates.shift()
        fps = 0
        for r in @frameRates then fps += r
        fps /= @frameRates.length

        @shaderMaterial.setTexture 'iChannel0'   RawTexture.CreateRTexture @world.keys, 256, 3, @scene, false
        @shaderMaterial.setInt     'iFrame'      @iFrame++
        @shaderMaterial.setFloat   'iFrameRate'  Math.round fps
        @shaderMaterial.setFloat   'iMs'         @world.engine.getDeltaTime()
        @shaderMaterial.setFloat   'iCompile'    @compileTime/1000
        @shaderMaterial.setFloat   'iTime'       performance.now()/1000
        @shaderMaterial.setFloat   'iTimeDelta'  @world.engine.getDeltaTime()/1000
        @shaderMaterial.setFloat   'iDist'       @world.camera.dist
        @shaderMaterial.setFloat   'iMinDist'    @world.camera.minDist
        @shaderMaterial.setFloat   'iMaxDist'    @world.camera.maxDist
        @shaderMaterial.setFloat   'iRotate'     @world.camera.rotate
        @shaderMaterial.setFloat   'iDegree'     @world.camera.degree
        @shaderMaterial.setVector2 'iDelta'      new Vector2(@world.camera.mouseDelta.x, @world.camera.mouseDelta.y) 
        @shaderMaterial.setVector4 'iMouse'      new Vector4(mouseX*dpr, @world.canvas.height-mouseY*dpr, @world.camera.downButtons, 0)
        @shaderMaterial.setVector2 'iResolution' new Vector2(@world.canvas.width, @world.canvas.height)
        @shaderMaterial.setVector3 'iCenter'     new Vector3(@world.camera.center.x, @world.camera.center.y, @world.camera.center.z)
        @shaderMaterial.setVector3 'iCamera'     new Vector3(@world.camera.position.x, @world.camera.position.y, @world.camera.position.z)
            
        for i in [256...512] 
            @world.keys[i] = 0
        
module.exports = Shader
