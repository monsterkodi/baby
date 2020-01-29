###
 0000000  000   000   0000000   0000000    00000000  00000000   
000       000   000  000   000  000   000  000       000   000  
0000000   000000000  000000000  000   000  0000000   0000000    
     000  000   000  000   000  000   000  000       000   000  
0000000   000   000  000   000  0000000    00000000  000   000  
###

{ Effect, Engine, Mesh, MeshBuilder, RawTexture, RenderTargetTexture, ShaderMaterial, Texture, Vector2, Vector3, Vector4 } = require 'babylonjs'
{ performance } = require 'perf_hooks'
{ klog, slash } = require 'kxk'
        
class Shader
    
    @: (@world) ->

        @scene = @world.scene
        @frameRates = []
        @buffers = []
        @textures = []

        klog "buffers #{@world.canvas.width}x#{@world.canvas.height}"
        for i in [0...3]
            # buffer = new Float32Array 4*@world.canvas.width*@world.canvas.height
            buffer = new Uint8Array 4*@world.canvas.width*@world.canvas.height
            @buffers.push buffer
            l = buffer.length
            for j in [0...2]
                buffer[j*4]   = 1
                buffer[j*4+1] = 2
                buffer[j*4+2] = 3
                buffer[j*4+3] = 255
            # @textures.push RawTexture.CreateRGBATexture buffer, @world.canvas.width, @world.canvas.height, 
                # @scene, false, false, Texture.NEAREST_SAMPLINGMODE, Engine.TEXTURETYPE_FLOAT
            @textures.push new RawTexture buffer, @world.canvas.width, @world.canvas.height, Engine.TEXTUREFORMAT_RGBA,
                @scene, false #, false, Texture.BILINEAR_SAMPLINGMODE, Engine.TEXTURETYPE_FLOAT
                
        @textures[1] = new Texture("#{__dirname}/../img/font.png", @scene)
        @keytexture = RawTexture.CreateRTexture @world.keys, 256, 3, @scene, false
        @iFrame = 0
        @vertexShader =  """
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
        # fragSource = slash.readText "#{__dirname}/../shader/astro.frag"
        # fragSource = slash.readText "#{__dirname}/../shader/astro_noquat.frag"
        fragSource = slash.readText "#{__dirname}/../shader/follow.frag"
        bufferSource = slash.readText "#{__dirname}/../shader/buffer.frag"
        
        Effect.ShadersStore.mainVertexShader = @vertexShader
        Effect.ShadersStore.mainFragmentShader = @shaderCode fragSource 
        
        Effect.ShadersStore.bufferVertexShader = @vertexShader
        Effect.ShadersStore.bufferFragmentShader = @shaderCode bufferSource 
        
        @uniforms = [
            'worldViewProjection' 'iMs' 'iDist' 'iMaxDist' 'iMinDist' 
            'iCenter' 'iCamera' 'iFrameRate' 
            'iDelta' 'iTime' 'iTimeDelta' 'iMouse' 'iResolution' 
            'iRotate' 'iDegree' 'iFrame' 'iCompile'
        ]
            
        @shaderStart = performance.now()
        
        @bufferMaterial = new ShaderMaterial "bufferShader", @scene,  
                vertex:   'buffer'
                fragment: 'buffer'
            ,
                attributes: ['position' 'normal' 'uv']
                uniforms:   @uniforms
        
        @shaderMaterial = new ShaderMaterial "shader", @scene,  
                vertex:   'main'
                fragment: 'main'
            ,
                attributes: ['position' 'normal' 'uv']
                uniforms:   @uniforms
                
        @plane2 = MeshBuilder.CreatePlane "plane2", { width: 10, height: 10 }, @scene
        @plane2.material = @bufferMaterial
        @plane2.billboardMode = Mesh.BILLBOARDMODE_ALL

        @plane = MeshBuilder.CreatePlane "plane", { width: 10, height: 10 }, @scene
        @plane.material = @shaderMaterial
        @plane.billboardMode = Mesh.BILLBOARDMODE_ALL
        
        @shaderMaterial.onCompiled = => 
            @compileTime = parseInt performance.now()-@shaderStart
            klog "shader compileTime #{@compileTime/1000}s" 
            
        @bufferMaterial.onCompiled = => 
            compileTime = parseInt performance.now()-@shaderStart
            klog "buffer compileTime #{compileTime/1000}s" 
            
        @renderBuffers()
        
    shaderCode: (fragSource) ->
        """
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
            uniform sampler2D iChannel1;
            uniform sampler2D iChannel2;
            uniform sampler2D iChannel3;
            
            #{fragSource}
                                    
            void main(void) 
            {
                mainImage(gl_FragColor, gl_FragCoord.xy);
            }
            """
        
    renderBuffers: ->
                
        @renderTarget = new RenderTargetTexture "buf", { width:@world.canvas.width, height:@world.canvas.height }, @scene, false #, false, Texture.BILINEAR_SAMPLINGMODE, Engine.TEXTURETYPE_BYTE
        @renderTarget.renderList.push @plane2
        @scene.customRenderTargets.push @renderTarget
    
        @renderTarget.onBeforeRender = () => 
            
            @keytexture.update @world.keys
            @plane2.isVisible = true
            @plane2.position.copyFrom @world.camera.position.add @world.camera.getDir().scale 2
                    
            mouseX = @world.camera.mouseX * window.devicePixelRatio ? 0;
            mouseY = @world.camera.mouseY * window.devicePixelRatio ? @world.canvas.height;
             
            @bufferMaterial.setTexture 'iChannel0'   @keytexture
            @bufferMaterial.setTexture 'iChannel1'   @textures[0]
            @bufferMaterial.setTexture 'iChannel2'   @textures[1]
            @bufferMaterial.setTexture 'iChannel3'   @textures[2]
            @bufferMaterial.setInt     'iFrame'      @iFrame
            @bufferMaterial.setFloat   'iFrameRate'  Math.round @fps
            @bufferMaterial.setFloat   'iMs'         @world.engine.getDeltaTime()
            @bufferMaterial.setFloat   'iCompile'    @compileTime/1000
            @bufferMaterial.setFloat   'iTime'       performance.now()/1000
            @bufferMaterial.setFloat   'iTimeDelta'  @world.engine.getDeltaTime()/1000
            @bufferMaterial.setFloat   'iDist'       @world.camera.dist
            @bufferMaterial.setFloat   'iMinDist'    @world.camera.minDist
            @bufferMaterial.setFloat   'iMaxDist'    @world.camera.maxDist
            @bufferMaterial.setFloat   'iRotate'     @world.camera.rotate
            @bufferMaterial.setFloat   'iDegree'     @world.camera.degree
            @bufferMaterial.setVector2 'iDelta'      new Vector2(@world.camera.mouseDelta.x, @world.camera.mouseDelta.y) 
            @bufferMaterial.setVector4 'iMouse'      new Vector4(mouseX, @world.canvas.height-mouseY, @world.camera.downButtons, 0)
            @bufferMaterial.setVector2 'iResolution' new Vector2(@world.canvas.width, @world.canvas.height)
            @bufferMaterial.setVector3 'iCenter'     new Vector3(@world.camera.center.x, @world.camera.center.y, @world.camera.center.z)
            @bufferMaterial.setVector3 'iCamera'     new Vector3(@world.camera.position.x, @world.camera.position.y, @world.camera.position.z)
            
        @renderTarget.onAfterRender = () => 
            
        @scene.onAfterRenderTargetsRenderObservable.add => 
            
            @textures[0].update @renderTarget.readPixels()
            
    render: ->

        @plane2.isVisible = false
        @plane.position.copyFrom @world.camera.position.add @world.camera.getDir().scale 1.5
        
        mouseX = @world.camera.mouseX*window.devicePixelRatio ? 0;
        mouseY = @world.camera.mouseY*window.devicePixelRatio ? @world.canvas.height;
        
        @frameRates.push @world.engine.getFps()
        if @frameRates.length > 30 then @frameRates.shift()
        @fps = 0
        for r in @frameRates then @fps += r
        @fps /= @frameRates.length

        @shaderMaterial.setTexture 'iChannel0'   @keytexture
        @shaderMaterial.setTexture 'iChannel1'   @textures[0]
        @shaderMaterial.setTexture 'iChannel2'   @textures[1]
        @shaderMaterial.setTexture 'iChannel3'   @textures[2]
        @shaderMaterial.setInt     'iFrame'      @iFrame++
        @shaderMaterial.setFloat   'iFrameRate'  Math.round @fps
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
        @shaderMaterial.setVector4 'iMouse'      new Vector4(mouseX, @world.canvas.height-mouseY, @world.camera.downButtons, 0)
        @shaderMaterial.setVector2 'iResolution' new Vector2(@world.canvas.width, @world.canvas.height)
        @shaderMaterial.setVector3 'iCenter'     new Vector3(@world.camera.center.x, @world.camera.center.y, @world.camera.center.z)
        @shaderMaterial.setVector3 'iCamera'     new Vector3(@world.camera.position.x, @world.camera.position.y, @world.camera.position.z)
            
        for i in [256...512] 
            @world.keys[i] = 0
        
module.exports = Shader
