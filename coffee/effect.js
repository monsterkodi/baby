
// 00000000  00000000  00000000  00000000   0000000  000000000  
// 000       000       000       000       000          000     
// 0000000   000000    000000    0000000   000          000     
// 000       000       000       000       000          000     
// 00000000  000       000       00000000   0000000     000     

function Effect(gl, xres, yres, obj)
{
    this.mCreated = false;
    this.mRenderer = null;
    this.mGLContext = gl;
    this.mXres = xres;
    this.mYres = yres;
    this.mGainNode = null;
    this.mPasses = [];
    this.mFrame = 0;
    this.mMaxBuffers = 4;
    this.mMaxCubeBuffers = 1;
    this.mMaxPasses = this.mMaxBuffers + 3;
    this.mBuffers = [];
    this.mCubeBuffers = [];
    this.mScreenshotSytem = null;

    this.mIsLowEnd = false;

    if (gl == null) 
        return;

    this.mRenderer = piRenderer();
    if (!this.mRenderer.Initialize(gl))
        return;

    var vsSourceC, fsSourceC;

    vsSourceC = "layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";
    fsSourceC = "uniform vec4 v; uniform sampler2D t; out vec4 outColor; void main() { outColor = textureLod(t, gl_FragCoord.xy / v.zw, 0.0); }";
            
    var res = this.mRenderer.CreateShader(vsSourceC, fsSourceC);
    if (res.mResult == false)
    {
        console.log("Failed to compile shader to copy buffers : " + res.mInfo);
        return;
    }
    this.mProgramCopy = res;

    var vsSourceD, fsSourceD;
    vsSourceD = "layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";
    fsSourceD = "uniform vec4 v; uniform sampler2D t; out vec4 outColor; void main() { vec2 uv = gl_FragCoord.xy / v.zw; outColor = texture(t, vec2(uv.x,1.0-uv.y)); }";

    var res = this.mRenderer.CreateShader(vsSourceD, fsSourceD);
    if (res.mResult == false)
    {
        console.log("Failed to compile shader to downscale buffers : " + res);
        return;
    }
    this.mProgramDownscale = res;

    // set all buffers and cubemaps to null
    for( let i=0; i<this.mMaxBuffers; i++ )
    {
        this.mBuffers[i] = { mTexture: [null, null], 
                             mTarget:  [null, null], 
                             mResolution: [0, 0],
                             mLastRenderDone: 0,
                             mThumbnailRenderTarget: null,
                             mThumbnailTexture: null,
                             mThumbnailBuffer:  null,
                             mThumbnailRes: [0, 0] };
    }

    for( let i=0; i<this.mMaxCubeBuffers; i++ )
    {
        this.mCubeBuffers[i] = { mTexture: [null, null], 
                                mTarget:  [null, null], 
                                mResolution: [0, 0],
                                mLastRenderDone: 0,
                                mThumbnailRenderTarget: null,
                                mThumbnailTexture: null,
                                mThumbnailBuffer:  null,
                                mThumbnailRes: [0, 0] };
    }

    var keyboardData = new Uint8Array( 256*3 );
    for( var j=0; j<(256*3); j++ ) { keyboardData[j] = 0; }
    var kayboardTexture = this.mRenderer.CreateTexture( this.mRenderer.TEXTYPE.T2D, 256, 3, this.mRenderer.TEXFMT.C1I8, this.mRenderer.FILTER.NONE, this.mRenderer.TEXWRP.CLAMP, null);
    var keyboardImage = new Image();

    this.mKeyboard = { mData: keyboardData, mTexture: kayboardTexture, mIcon: keyboardImage };

    this.mCreated = true;
}

Effect.prototype.ResizeCubemapBuffer = function(i, xres, yres )
{
    let oldXres = this.mCubeBuffers[i].mResolution[0];
    let oldYres = this.mCubeBuffers[i].mResolution[1];

    if( this.mCubeBuffers[i].mTexture[0]==null || oldXres != xres || oldYres != yres )
    {
        var texture1 = this.mRenderer.CreateTexture(this.mRenderer.TEXTYPE.CUBEMAP,
            xres, yres,
            this.mRenderer.TEXFMT.C4F16,
            this.mRenderer.FILTER.LINEAR,
            this.mRenderer.TEXWRP.CLAMP, 
            null);
        var target1 = this.mRenderer.CreateRenderTargetCubeMap( texture1, null, false);

        var texture2 = this.mRenderer.CreateTexture(this.mRenderer.TEXTYPE.CUBEMAP,
            xres, yres,
            this.mRenderer.TEXFMT.C4F16,
            this.mRenderer.FILTER.LINEAR,
            this.mRenderer.TEXWRP.CLAMP, 
            null);

        var target2 = this.mRenderer.CreateRenderTargetCubeMap( texture2, null, false);

        // Store new buffers
        this.mCubeBuffers[i].mTexture = [texture1,texture2], 
        this.mCubeBuffers[i].mTarget =  [target1, target2 ], 
        this.mCubeBuffers[i].mLastRenderDone = 0;
        this.mCubeBuffers[i].mResolution[0] = xres;
        this.mCubeBuffers[i].mResolution[1] = yres;
    }
}

Effect.prototype.ResizeBuffer = function( i, xres, yres, skipIfNotExists )
{
    if( skipIfNotExists && this.mBuffers[i].mTexture[0]==null ) return;

    let oldXres = this.mBuffers[i].mResolution[0];
    let oldYres = this.mBuffers[i].mResolution[1];

    if( oldXres != xres || oldYres != yres )
    {
        let needCopy = (this.mBuffers[i].mTexture[0]!=null);

        let texture1 = this.mRenderer.CreateTexture(this.mRenderer.TEXTYPE.T2D,
            xres, yres,
            this.mRenderer.TEXFMT.C4F32,
            (needCopy) ? this.mBuffers[i].mTexture[0].mFilter : this.mRenderer.FILTER.NONE,
            (needCopy) ? this.mBuffers[i].mTexture[0].mWrap   : this.mRenderer.TEXWRP.CLAMP, 
            null);

        let texture2 = this.mRenderer.CreateTexture(this.mRenderer.TEXTYPE.T2D,
            xres, yres,
            this.mRenderer.TEXFMT.C4F32,
            (needCopy) ? this.mBuffers[i].mTexture[1].mFilter : this.mRenderer.FILTER.NONE,
            (needCopy) ? this.mBuffers[i].mTexture[1].mWrap   : this.mRenderer.TEXWRP.CLAMP, 
            null);

        let target1 = this.mRenderer.CreateRenderTarget( texture1, null, null, null, null, false);
        let target2 = this.mRenderer.CreateRenderTarget( texture2, null, null, null, null, false);

        if( needCopy )
        {
            var v = [0, 0, Math.min(xres, oldXres), Math.min(yres, oldYres)];
            this.mRenderer.SetBlend(false);
            this.mRenderer.SetViewport(v);
            this.mRenderer.AttachShader(this.mProgramCopy);
            var l1 = this.mRenderer.GetAttribLocation(this.mProgramCopy, "pos");
            var vOld = [0, 0, oldXres, oldYres];
            this.mRenderer.SetShaderConstant4FV("v", vOld);

            // Copy old buffers 1 to new buffer
            this.mRenderer.SetRenderTarget(target1);
            this.mRenderer.AttachTextures(1, this.mBuffers[i].mTexture[0], null, null, null);
            this.mRenderer.DrawUnitQuad_XY(l1);

            // Copy old buffers 2 to new buffer
            this.mRenderer.SetRenderTarget(target2);
            this.mRenderer.AttachTextures(1, this.mBuffers[i].mTexture[1], null, null, null);
            this.mRenderer.DrawUnitQuad_XY(l1);

            // Deallocate old memory
            this.mRenderer.DestroyTexture(this.mBuffers[i].mTexture[0]);
            this.mRenderer.DestroyRenderTarget(this.mBuffers[i].mTarget[0]);
            this.mRenderer.DestroyTexture(this.mBuffers[i].mTexture[1]);
            this.mRenderer.DestroyRenderTarget(this.mBuffers[i].mTarget[1]);
            //this.mRenderer.DestroyTexture(this.mBuffers[i].thumbnailTexture);
        }

        // Store new buffers
        this.mBuffers[i].mTexture = [texture1,texture2], 
        this.mBuffers[i].mTarget =  [target1, target2 ], 
        this.mBuffers[i].mLastRenderDone = 0;
        this.mBuffers[i].mResolution[0] = xres;
        this.mBuffers[i].mResolution[1] = yres;
    }
}

Effect.prototype.saveScreenshot = function(passid)
{
    let pass = this.mPasses[passid];

    if( pass.mType == "buffer" )
    {
        let bufferID = assetID_to_bufferID( this.mPasses[passid].mOutputs[0] );

        let texture = this.mBuffers[bufferID].mTarget[ this.mBuffers[bufferID].mLastRenderDone ];

        let numComponents = 3;
        let width = texture.mTex0.mXres;
        let height = texture.mTex0.mYres;
        let type = "Float"; // Other options Float, Half, Uint
        let bytes = new Float32Array(width * height * 4 );//numComponents);
        this.mRenderer.GetPixelDataRenderTarget( texture, bytes, width, height );
        let blob = piExportToEXR(width, height, numComponents, type, bytes);

        // Offer download automatically to the user
        piTriggerDownload("image.exr", blob);
    }
    else if( pass.mType == "cubemap" )
    {
        let xres = 4096;
        let yres = 2048;
        this.mScreenshotSytem.Allocate( xres, yres );

        let cubeBuffer = this.mCubeBuffers[0];

        let target = this.mScreenshotSytem.GetTarget();
        this.mRenderer.SetRenderTarget( target );

        var program = this.mScreenshotSytem.GetProgram();
        this.mRenderer.AttachShader(program);
        let l1 = this.mRenderer.GetAttribLocation(program, "pos");
        this.mRenderer.SetViewport( [0, 0, xres, yres] );
        this.mRenderer.AttachTextures(1, cubeBuffer.mTexture[ cubeBuffer.mLastRenderDone ], null, null, null);
        this.mRenderer.DrawUnitQuad_XY(l1);
        this.mRenderer.DettachTextures();
        this.mRenderer.SetRenderTarget( null );

        let data = new Float32Array(xres*yres*4);
        this.mRenderer.GetPixelDataRenderTarget( target, data, xres, yres );

        let blob = piExportToEXR(xres, yres, 3, "Float", data );
        piTriggerDownload("image.exr", blob);
    }
}

Effect.prototype.ResizeBuffers = function(xres, yres)
{
    for( var i=0; i<this.mMaxBuffers; i++ )
    {
        this.ResizeBuffer(i, xres, yres, true);
    }
}

Effect.prototype.GetTexture = function( passid, slot )
{
    return this.mPasses[passid].GetTexture( slot );
}

Effect.prototype.NewTexture = function( passid, slot, url )
{
    return this.mPasses[passid].NewTexture( null, slot, url, this.mBuffers, this.mCubeBuffers, this.mKeyboard );
}

Effect.prototype.SetOutputs = function( passid, slot, url )
{
    this.mPasses[passid].SetOutputs( slot, url );
}

Effect.prototype.SetOutputsByBufferID = function( passid, slot, id )
{
    this.mPasses[passid].SetOutputsByBufferID( slot, id );
}

Effect.prototype.GetAcceptsLinear = function (passid, slot) 
{
    return this.mPasses[passid].GetAcceptsLinear(slot);
}

Effect.prototype.GetAcceptsMipmapping = function (passid, slot) 
{
    return this.mPasses[passid].GetAcceptsMipmapping(slot);
}

Effect.prototype.GetAcceptsWrapRepeat = function (passid, slot) 
{
    return this.mPasses[passid].GetAcceptsWrapRepeat(slot);
}

Effect.prototype.GetAcceptsVFlip = function (passid, slot)
{
    return this.mPasses[passid].GetAcceptsVFlip(slot);
}

Effect.prototype.SetSamplerFilter = function (passid, slot, str) 
{
    this.mPasses[passid].SetSamplerFilter(slot, str, this.mBuffers, this.mCubeBuffers);
}

Effect.prototype.GetSamplerFilter = function (passid, slot) {
    return this.mPasses[passid].GetSamplerFilter(slot);
}

Effect.prototype.SetSamplerWrap = function (passid, slot, str) {
    this.mPasses[passid].SetSamplerWrap(slot, str, this.mBuffers);
}

Effect.prototype.GetSamplerWrap = function (passid, slot) {
    return this.mPasses[passid].GetSamplerWrap(slot);
}

Effect.prototype.SetSamplerVFlip = function (passid, slot, str) {
    this.mPasses[passid].SetSamplerVFlip(slot, str);
}

Effect.prototype.GetSamplerVFlip = function (passid, slot) {
    return this.mPasses[passid].GetSamplerVFlip(slot);
}

Effect.prototype.SetKeyDown = function( passid, k )
{
    if( this.mKeyboard.mData[ k + 0*256 ] == 255 ) return;

    this.mKeyboard.mData[ k + 0*256 ] = 255;
    this.mKeyboard.mData[ k + 1*256 ] = 255;
    this.mKeyboard.mData[ k + 2*256 ] = 255 - this.mKeyboard.mData[ k + 2*256 ];
    this.mRenderer.UpdateTexture( this.mKeyboard.mTexture, 0, 0, 256, 3, this.mKeyboard.mData );
}

Effect.prototype.SetKeyUp = function( passid, k )
{
    this.mKeyboard.mData[ k + 0*256 ] = 0;
    this.mKeyboard.mData[ k + 1*256 ] = 0;
    this.mRenderer.UpdateTexture( this.mKeyboard.mTexture, 0, 0, 256, 3, this.mKeyboard.mData );
}

Effect.prototype.SetSize = function(xres,yres)
{
    if( xres !== this.mXres || yres !== this.mYres )
    {
        var oldXres = this.mXres;
        var oldYres = this.mYres;
        this.mXres = xres;
        this.mYres = yres;
        this.ResizeBuffers(xres, yres);
        return true;
    }
    return false;
}

Effect.prototype.PauseInput = function( passid, id )
{
    return this.mPasses[passid].TooglePauseInput( this.mAudioContext, id );
}

Effect.prototype.ResetTime = function()
{
    this.mFrame = 0;

    let num = this.mPasses.length;
    for( let i=0; i<num; i++ )
    {
        this.mPasses[i].mFrame = 0;
    }
}

Effect.prototype.Paint = function(time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, isPaused)
{
    let wa = null;
    let da = new Date();
    let xres = this.mXres / 1;
    let yres = this.mYres / 1;

    if( this.mFrame==0 )
    {
        for( let i=0; i<this.mMaxBuffers; i++ )
        {
            if( this.mBuffers[i].mTexture[0]!=null )
            {
                this.mRenderer.SetRenderTarget( this.mBuffers[i].mTarget[0] );
                this.mRenderer.Clear( this.mRenderer.CLEAR.Color, [0.0,0.0,0.0,0.0], 1.0, 0   );
                this.mRenderer.SetRenderTarget( this.mBuffers[i].mTarget[1] );
                this.mRenderer.Clear( this.mRenderer.CLEAR.Color, [0.0,0.0,0.0,0.0], 1.0, 0   );
            }
        }
        for( let i=0; i<this.mMaxCubeBuffers; i++ )
        {
            if( this.mCubeBuffers[i].mTexture[0]!=null )
            {
                for( let face=0; face<6; face++ )
                {
                    this.mRenderer.SetRenderTargetCubeMap( this.mCubeBuffers[i].mTarget[0], face );
                    this.mRenderer.Clear( this.mRenderer.CLEAR.Color, [0.0,0.0,0.0,0.0], 1.0, 0   );
                    this.mRenderer.SetRenderTargetCubeMap( this.mCubeBuffers[i].mTarget[1], face );
                    this.mRenderer.Clear( this.mRenderer.CLEAR.Color, [0.0,0.0,0.0,0.0], 1.0, 0   );
                }
            }
        }
    }

    let num = this.mPasses.length;

    // render buffers second
    for( let i=0; i<num; i++ )
    {
        if( this.mPasses[i].mType != "buffer" ) continue;
        if( this.mPasses[i].mProgram==null ) continue;
        var bufferID = assetID_to_bufferID( this.mPasses[i].mOutputs[0] );

        // check if any downstream pass needs mipmaps when reading from this buffer
        var needMipMaps = false;
        for( var j=0; j<num; j++ )
        {
            for( var k=0; k<this.mPasses[j].mInputs.length; k++ )
            {
                var inp = this.mPasses[j].mInputs[k];
                if( inp!=null && inp.mInfo.mType=="buffer" && inp.id === bufferID && inp.mInfo.mSampler.filter === "mipmap")
                {
                    needMipMaps = true;
                    break;
                }
            }
        }

        this.mPasses[i].Paint(wa, da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, isPaused, bufferID, needMipMaps, this.mBuffers, this.mCubeBuffers, this.mKeyboard, this );
    }

    // render cubemap buffers second
    for( let i=0; i<num; i++ )
    {
        if( this.mPasses[i].mType != "cubemap" ) continue;
        if( this.mPasses[i].mProgram==null ) continue;
        var bufferID = 0;//assetID_to_bufferID( this.mPasses[i].mOutputs[0] );

        // check if any downstream pass needs mipmaps when reading from this buffer
        var needMipMaps = false;

        for( var j=0; j<num; j++ )
        {
            for( var k=0; k<this.mPasses[j].mInputs.length; k++ )
            {
                var inp = this.mPasses[j].mInputs[k];
                if( inp!=null && inp.mInfo.mType=="cubemap" )
                {
                    if( assetID_to_cubemapBuferID(inp.mInfo.mID)==0 && inp.mInfo.mSampler.filter === "mipmap" )
                    {
                        needMipMaps = true;
                        break;
                    }
                }
            }
        }

        this.mPasses[i].Paint( wa, da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, isPaused, bufferID, needMipMaps, this.mBuffers, this.mCubeBuffers, this.mKeyboard, this );
    }

    // render image last
    for( let i=0; i<num; i++ )
    {
        if( this.mPasses[i].mType != "image" ) continue;
        if( this.mPasses[i].mProgram==null ) continue;
        this.mPasses[i].Paint( wa, da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, isPaused, null, false, this.mBuffers, this.mCubeBuffers, this.mKeyboard, this );
    }   

    // erase keypresses
    for( var k=0; k<256; k++ )
    {
       this.mKeyboard.mData[ k + 1*256 ] = 0;
    }
    this.mRenderer.UpdateTexture( this.mKeyboard.mTexture, 0, 0, 256, 3, this.mKeyboard.mData );

    this.mFrame++;
}

Effect.prototype.NewShader = function( shaderCode, passid )
{
    var commonSourceCodes = [];

    for( var i=0; i<this.mPasses.length; i++ )
    {
        if( this.mPasses[i].mType=="common")
        {
            commonSourceCodes.push(this.mPasses[i].mSource);
        }
    }

    return this.mPasses[passid].NewShader( shaderCode, commonSourceCodes );
}

Effect.prototype.GetNumPasses = function()
{
    return this.mPasses.length;
}

Effect.prototype.GetNumOfType = function(passtype)
{
    var id = 0;
    for( var j=0; j<this.mPasses.length; j++ )
    {
        if( this.mPasses[j].mType===passtype )
        {
            id++;
        }
    }
    return id;
}

Effect.prototype.GetPassType = function( id )
{
    return this.mPasses[id].mType;
}
Effect.prototype.GetPassName = function( id )
{
    return this.mPasses[id].mName;
}

Effect.prototype.newScriptJSON = function( passes )
{
    var numPasses = passes.length;

    if ( numPasses<1 || numPasses>this.mMaxPasses )
    {
        return { mFailed : true, mError : "Incorrect number of passes, wrong shader format", mShader:null };
    }

    var res = [];
    res.mFailed = false;

    for (var j = 0; j < numPasses; j++)
    {
        var rpass = passes[j];

        this.mPasses[j] = new Pass(this.mRenderer, this.mIsLowEnd, 
                                            true, false, this.mGainNode, this.mProgramDownscale, j, this);

        var numInputs = rpass.inputs.length;

        for (var i = 0; i < 4; i++)
        {
            this.mPasses[j].NewTexture(null, i, null, null, null);
        }
        
        for (var i = 0; i < numInputs; i++)
        {
            var lid  = rpass.inputs[i].channel;
            var styp = rpass.inputs[i].type;
            var sid  = rpass.inputs[i].id;
            var ssrc = rpass.inputs[i].filepath;
            var psrc = rpass.inputs[i].previewfilepath;
            var samp = rpass.inputs[i].sampler;

            this.mPasses[j].NewTexture(this.mAudioContext, lid, { mType: styp, mID: sid, mSrc: ssrc, mSampler: samp, mPreviewSrc: psrc }, this.mBuffers, this.mCubeBuffers, this.mKeyboard);
        }

        for (var i = 0; i < 4; i++)
        {
            this.mPasses[j].SetOutputs(i, null);
        }

        var numOutputs = rpass.outputs.length;
        for (var i = 0; i < numOutputs; i++)
        {
            var outputID = rpass.outputs[i].id;
            var outputCH = rpass.outputs[i].channel;
            this.mPasses[j].SetOutputs(outputCH, outputID);
        }

        // create some hardcoded names. This should come from the DB
        var rpassName = "";
        if (rpass.type == "common") rpassName = "Common";
        if (rpass.type == "image") rpassName = "Image";
        if (rpass.type == "buffer") rpassName = "Buffer " + String.fromCharCode(65 + assetID_to_bufferID(this.mPasses[j].mOutputs[0]));
        if (rpass.type == "cubemap") rpassName = "Cube A";// " + String.fromCharCode(65 + assetID_to_bufferID(this.mPasses[j].mOutputs[0]));

        this.mPasses[j].Create(rpass.type, rpassName, this.mAudioContext);
    }

    for (var pt = 0; pt < 5; pt++)
    {
        for (var j = 0; j < numPasses; j++)
        {
            var rpass = passes[j];

            if (pt == 0 && rpass.type != "common") continue;
            if (pt == 1 && rpass.type != "buffer") continue;
            if (pt == 2 && rpass.type != "image") continue;
            if (pt == 4 && rpass.type != "cubemap") continue;

            var shaderStr = rpass.code;

            var result = this.NewShader(shaderStr, j);

            if (result != null) {
                res.mFailed = true;
                res[j] = {
                    mFailed: true,
                    mError: result,
                    mShader: shaderStr
                };
            }
            else {
                res[j] = {
                    mFailed: false,
                    mError: null,
                    mShader: shaderStr
                };
            }
        }
    }

    return res;
}

Effect.prototype.GetCompilationTime = function( id )
{
    return this.mPasses[id].GetCompilationTime();
}

Effect.prototype.DestroyPass = function( id )
{
   this.mPasses[id].Destroy( this.mAudioContext );
   this.mPasses.splice(id, 1);
}

Effect.prototype.AddPass = function( passType, passName )
{
    var shaderStr = null;

    if( passType=="buffer" ) shaderStr = "void mainImage( out vec4 fragColor, in vec2 fragCoord )\n{\n    fragColor = vec4(0.0,0.0,1.0,1.0);\n}";
    if( passType=="common" ) shaderStr = "vec4 someFunction( vec4 a, float b )\n{\n    return a+b;\n}";
    if( passType=="cubemap" ) shaderStr = "void mainCubemap( out vec4 fragColor, in vec2 fragCoord, in vec3 rayOri, in vec3 rayDir )\n{\n    // Ray direction as color\n    vec3 col = 0.5 + 0.5*rayDir;\n\n    // Output to cubemap\n    fragColor = vec4(col,1.0);\n}";

    var id = this.GetNumPasses();
    this.mPasses[id] = new Pass( this.mRenderer, this.mIsLowEnd, 
                                 true, false, this.mGainNode, 
                                 this.mProgramDownscale, id, this );

    this.mPasses[id].Create( passType, passName, this.mAudioContext );
    var res = this.NewShader(shaderStr, id);


    return { mId : id, mShader : shaderStr, mError : res };
}

// this should be removed once we have MultiPass 2.0 and passes render to arbitrary buffers
Effect.prototype.IsBufferPassUsed = function( bufferID )
{
    for( var j=0; j<this.mPasses.length; j++ )
    {
        if(  this.mPasses[j].mType !== "buffer" ) continue;
        if(  this.mPasses[j].mOutputs[0] === bufferID_to_assetID(bufferID) ) return true;
    }
    return false;
}

Effect.prototype.exportToJSON = function()
{
    var result = {};

    result.ver = "0.1";

    result.renderpass = [];

    var numPasses = this.mPasses.length;
    for( var j=0; j<numPasses; j++ )
    {
        result.renderpass[j] = {};

        result.renderpass[j].outputs = new Array();
        for( var i = 0; i<4; i++ )
        {
            var outputID = this.mPasses[j].mOutputs[i];
            if( outputID==null ) continue;
            result.renderpass[j].outputs.push( { channel: i, id: outputID } );
        }
        result.renderpass[j].inputs = new Array();
        for( var i = 0; i<4; i++ )
        {
            if( this.mPasses[j].mInputs[i]==null ) continue;
            result.renderpass[j].inputs.push( {channel: i,
                                               type    : this.mPasses[j].mInputs[i].mInfo.mType,
                                               id      : this.mPasses[j].mInputs[i].mInfo.mID,
                                               filepath: this.mPasses[j].mInputs[i].mInfo.mSrc,
                                               sampler : this.mPasses[j].mInputs[i].mInfo.mSampler });
        }

        result.renderpass[j].code = this.mPasses[j].mSource;
        result.renderpass[j].name = this.mPasses[j].mName
        result.renderpass[j].description = "";
        result.renderpass[j].type = this.mPasses[j].mType;
    }

    result.flags = this.calcFlags();

    return result;
}

Effect.prototype.calcFlags = function () 
{
    var flagKeyboard = false;
    var flagMultipass = false;

    var numPasses = this.mPasses.length;
    for (var j = 0; j < numPasses; j++) {
        var pass = this.mPasses[j];

        if (pass.mType == "buffer") flagMultipass = true;

        for (var i = 0; i < 4; i++) {
            if (pass.mInputs[i] == null) continue;

            if (pass.mInputs[i].mInfo.mType == "keyboard") flagKeyboard = true;
        }
    }

    return {
        mFlagKeyboard: flagKeyboard,
        mFlagMultipass: flagMultipass
    };
}
