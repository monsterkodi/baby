# 00000000  00000000  00000000  00000000   0000000  000000000  
# 000       000       000       000       000          000     
# 0000000   000000    000000    0000000   000          000     
# 000       000       000       000       000          000     
# 00000000  000       000       00000000   0000000     000     

class Effect 
    
    @: (@mGLContext, @mXres, @mYres) ->
        
        @mCreated           = false
        @mRenderer          = null
        @mPasses            = []
        @mFrame             = 0
        @mMaxBuffers        = 4
        @mMaxCubeBuffers    = 1
        @mMaxPasses         = @mMaxBuffers + 3
        @mBuffers           = []
        @mCubeBuffers       = []
        @mRenderer          = new Renderer @mGLContext
        
        vs = 'layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }'
        fs = 'uniform vec4 v; uniform sampler2D t; out vec4 outColor; void main() { outColor = textureLod(t, gl_FragCoord.xy / v.zw, 0.0); }'
        @mProgramCopy = @mRenderer.createShader vs, fs
        if @mProgramCopy.mResult == false
            error 'Failed to compile shader to copy buffers:' res.mInfo
            return
        
        vs = 'layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }'
        fs = 'uniform vec4 v; uniform sampler2D t; out vec4 outColor; void main() { vec2 uv = gl_FragCoord.xy / v.zw; outColor = texture(t, vec2(uv.x,1.0-uv.y)); }'
        res = @mRenderer.createShader vs, fs
        if res.mResult == false
            error 'Failed to compile shader to downscale buffers:' res
            return

        i = 0
        while i < @mMaxBuffers
            @mBuffers[i] =
                mTexture: [ null null ]
                mTarget:  [ null null ]
                mResolution: [ 0 0 ]
                mLastRenderDone: 0
                mThumbnailRenderTarget: null
                mThumbnailTexture: null
                mThumbnailBuffer: null
                mThumbnailRes: [ 0 0 ]
            i++
        i = 0
        while i < @mMaxCubeBuffers
            @mCubeBuffers[i] =
                mTexture: [ null null ]
                mTarget: [ null null ]
                mResolution: [ 0 0 ]
                mLastRenderDone: 0
                mThumbnailRenderTarget: null
                mThumbnailTexture: null
                mThumbnailBuffer: null
                mThumbnailRes: [ 0 0 ]
            i++
        keyboardData = new Uint8Array(256 * 3)
        j = 0
        while j < 256 * 3
            keyboardData[j] = 0
            j++
        kayboardTexture = @mRenderer.createTexture(Renderer.TEXTYPE.T2D, 256, 3, Renderer.TEXFMT.C1I8, Renderer.FILTER.NONE, Renderer.TEXWRP.CLAMP, null)
        keyboardImage = new Image
        @mKeyboard =
            mData: keyboardData
            mTexture: kayboardTexture
            mIcon: keyboardImage
        @mCreated = true

    resizeCubemapBuffer: (i, xres, yres) ->
        
        oldXres = @mCubeBuffers[i].mResolution[0]
        oldYres = @mCubeBuffers[i].mResolution[1]
        
        if @mCubeBuffers[i].mTexture[0] == null or oldXres != xres or oldYres != yres
            
            texture1 = @mRenderer.createTexture(Renderer.TEXTYPE.CUBEMAP, xres, yres, Renderer.TEXFMT.C4F16, Renderer.FILTER.LINEAR, Renderer.TEXWRP.CLAMP, null)
            target1  = @mRenderer.createRenderTargetCubeMap texture1
            texture2 = @mRenderer.createTexture(Renderer.TEXTYPE.CUBEMAP, xres, yres, Renderer.TEXFMT.C4F16, Renderer.FILTER.LINEAR, Renderer.TEXWRP.CLAMP, null)
            target2  = @mRenderer.createRenderTargetCubeMap texture2

            @mCubeBuffers[i].mTexture = [ texture1, texture2 ]
            @mCubeBuffers[i].mTarget  = [ target1, target2 ]
            @mCubeBuffers[i].mLastRenderDone = 0
            @mCubeBuffers[i].mResolution[0] = xres
            @mCubeBuffers[i].mResolution[1] = yres

    resizeBuffer: (i, xres, yres, skipIfNotExists) ->
        
        if skipIfNotExists and not @mBuffers[i].mTexture[0]
            return
        oldXres = @mBuffers[i].mResolution[0]
        oldYres = @mBuffers[i].mResolution[1]
        if oldXres != xres or oldYres != yres
            needCopy = @mBuffers[i].mTexture[0] != null
            texture1 = @mRenderer.createTexture(Renderer.TEXTYPE.T2D, xres, yres, Renderer.TEXFMT.C4F32, (if needCopy then @mBuffers[i].mTexture[0].mFilter else Renderer.FILTER.NONE), (if needCopy then @mBuffers[i].mTexture[0].mWrap else Renderer.TEXWRP.CLAMP), null)
            texture2 = @mRenderer.createTexture(Renderer.TEXTYPE.T2D, xres, yres, Renderer.TEXFMT.C4F32, (if needCopy then @mBuffers[i].mTexture[1].mFilter else Renderer.FILTER.NONE), (if needCopy then @mBuffers[i].mTexture[1].mWrap else Renderer.TEXWRP.CLAMP), null)
            target1  = @mRenderer.createRenderTarget texture1
            target2  = @mRenderer.createRenderTarget texture2
            if needCopy
                v = [ 0, 0, Math.min(xres, oldXres), Math.min(yres, oldYres) ]
                @mRenderer.setBlend false
                @mRenderer.setViewport v
                @mRenderer.attachShader @mProgramCopy
                l1 = @mRenderer.getAttribLocation @mProgramCopy, 'pos'
                vOld = [ 0, 0, oldXres, oldYres ]
                @mRenderer.setShaderConstant4FV 'v' vOld

                @mRenderer.setRenderTarget target1
                @mRenderer.attachTextures 1, @mBuffers[i].mTexture[0], null, null, null
                @mRenderer.drawUnitQuad_XY l1

                @mRenderer.setRenderTarget target2
                @mRenderer.attachTextures 1, @mBuffers[i].mTexture[1], null, null, null
                @mRenderer.drawUnitQuad_XY l1

                @mRenderer.destroyTexture @mBuffers[i].mTexture[0]
                @mRenderer.destroyRenderTarget @mBuffers[i].mTarget[0]
                @mRenderer.destroyTexture @mBuffers[i].mTexture[1]
                @mRenderer.destroyRenderTarget @mBuffers[i].mTarget[1]

            @mBuffers[i].mTexture = [ texture1, texture2 ]
            @mBuffers[i].mTarget  = [ target1,  target2  ]
            @mBuffers[i].mLastRenderDone = 0
            @mBuffers[i].mResolution[0] = xres
            @mBuffers[i].mResolution[1] = yres

    resizeBuffers: (xres, yres) ->
        i = 0
        while i < @mMaxBuffers
            @resizeBuffer i, xres, yres, true
            i++
        @

    getTexture: (passid, slot) ->
        @mPasses[passid].GetTexture slot

    newTexture: (passid, slot, url) ->
        @mPasses[passid].NewTexture slot, url, @mBuffers, @mCubeBuffers, @mKeyboard
    
    setOutputs: (passid, slot, url) ->
        @mPasses[passid].SetOutputs slot, url
        return
    
    setOutputsByBufferID: (passid, slot, id) ->
        @mPasses[passid].SetOutputsByBufferID slot, id
        return
        
    getKeyDown: (passid, k) ->
        if @mKeyboard.mData[k + 0 * 256] == 255
            return
        @mKeyboard.mData[k + 0 * 256] = 255
        @mKeyboard.mData[k + 1 * 256] = 255
        @mKeyboard.mData[k + 2 * 256] = 255 - (@mKeyboard.mData[k + 2 * 256])
        @mRenderer.updateTexture @mKeyboard.mTexture, 0, 0, 256, 3, @mKeyboard.mData
        return
    
    setKeyUp: (passid, k) ->
        @mKeyboard.mData[k + 0 * 256] = 0
        @mKeyboard.mData[k + 1 * 256] = 0
        @mRenderer.updateTexture @mKeyboard.mTexture, 0, 0, 256, 3, @mKeyboard.mData
        return
    
    setSize: (xres, yres) ->
        if xres != @mXres or yres != @mYres
            oldXres = @mXres
            oldYres = @mYres
            @mXres = xres
            @mYres = yres
            @resizeBuffers xres, yres
            return true
        false
        
    resetTime: ->
        @mFrame = 0
        num = @mPasses.length
        i = 0
        while i < num
            @mPasses[i].mFrame = 0
            i++
        return
    
    paint: (time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, isPaused) ->
        
        da   = new Date
        xres = @mXres / 1
        yres = @mYres / 1
        if @mFrame == 0
            i = 0
            while i < @mMaxBuffers
                if @mBuffers[i].mTexture[0] != null
                    @mRenderer.setRenderTarget @mBuffers[i].mTarget[0]
                    @mRenderer.clear @mRenderer.cLEAR.Color, [ 0 0 0 0 ], 1.0, 0
                    @mRenderer.setRenderTarget @mBuffers[i].mTarget[1]
                    @mRenderer.clear @mRenderer.cLEAR.Color, [ 0 0 0 0 ], 1.0, 0
                i++
            i = 0
            while i < @mMaxCubeBuffers
                if @mCubeBuffers[i].mTexture[0] != null
                    face = 0
                    while face < 6
                        @mRenderer.setRenderTargetCubeMap @mCubeBuffers[i].mTarget[0], face
                        @mRenderer.clear @mRenderer.cLEAR.Color, [ 0 0 0 0 ], 1.0, 0
                        @mRenderer.setRenderTargetCubeMap @mCubeBuffers[i].mTarget[1], face
                        @mRenderer.clear @mRenderer.cLEAR.Color, [ 0 0 0 0 ], 1.0, 0
                        face++
                i++
        num = @mPasses.length
        # render buffers second
        i = 0
        while i < num
            if @mPasses[i].mType != 'buffer'
                i++
                continue
            if @mPasses[i].mProgram == null
                i++
                continue
            bufferID = assetID_to_bufferID(@mPasses[i].mOutputs[0])
            # check if any downstream pass needs mipmaps when reading from this buffer
            needMipMaps = false
            j = 0
            while j < num
                k = 0
                while k < @mPasses[j].mInputs.length
                    inp = @mPasses[j].mInputs[k]
                    if inp != null and inp.mInfo.mType == 'buffer' and inp.id == bufferID and inp.mInfo.mSampler.filter == 'mipmap'
                        needMipMaps = true
                        break
                    k++
                j++
            @mPasses[i].paint da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, isPaused, bufferID, needMipMaps, @mBuffers, @mCubeBuffers, @mKeyboard, @
            i++
        # render cubemap buffers second
        i = 0
        while i < num
            if @mPasses[i].mType != 'cubemap'
                i++
                continue
            if @mPasses[i].mProgram == null
                i++
                continue
            bufferID = 0
            # check if any downstream pass needs mipmaps when reading from this buffer
            needMipMaps = false
            j = 0
            while j < num
                k = 0
                while k < @mPasses[j].mInputs.length
                    inp = @mPasses[j].mInputs[k]
                    if inp != null and inp.mInfo.mType == 'cubemap'
                        if assetID_to_cubemapBuferID(inp.mInfo.mID) == 0 and inp.mInfo.mSampler.filter == 'mipmap'
                            needMipMaps = true
                            break
                    k++
                j++
            @mPasses[i].paint da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, isPaused, bufferID, needMipMaps, @mBuffers, @mCubeBuffers, @mKeyboard, @
            i++
        # render image last
        i = 0
        while i < num
            if @mPasses[i].mType != 'image'
                i++
                continue
            if @mPasses[i].mProgram == null
                i++
                continue
            @mPasses[i].paint da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, isPaused, null, false, @mBuffers, @mCubeBuffers, @mKeyboard, @
            i++

        k = 0
        while k < 256
            @mKeyboard.mData[k + 1 * 256] = 0
            k++
        @mRenderer.updateTexture @mKeyboard.mTexture, 0, 0, 256, 3, @mKeyboard.mData
        @mFrame++
        return
    
    newShader: (shaderCode, passid) ->
        commonSourceCodes = []
        i = 0
        while i < @mPasses.length
            if @mPasses[i].mType == 'common'
                commonSourceCodes.push @mPasses[i].mSource
            i++
        @mPasses[passid].newShader shaderCode, commonSourceCodes
    
    getNumPasses: ->
        @mPasses.length
    
    getNumOfType: (passtype) ->
        id = 0
        j = 0
        while j < @mPasses.length
            if @mPasses[j].mType == passtype
                id++
            j++
        id
    
    getPassType: (id) ->
        @mPasses[id].mType
    
    getPassName: (id) ->
        @mPasses[id].mName
    
    newScriptJSON: (passes) ->
        numPasses = passes.length
        if numPasses < 1 or numPasses > @mMaxPasses
            return
                mFailed: true
                mError: 'Incorrect number of passes, wrong shader format'
                mShader: null
        res = []
        res.mFailed = false
        j = 0
        while j < numPasses
            rpass = passes[j]
            @mPasses[j] = new Pass @mRenderer, j, @
            numInputs = rpass.inputs.length
            i = 0
            while i < 4
                @mPasses[j].newTexture i
                i++
            i = 0
            while i < numInputs
                @mPasses[j].newTexture rpass.inputs[i].channel, 
                    mType:      rpass.inputs[i].type
                    mID:        rpass.inputs[i].id
                    mSrc:       rpass.inputs[i].filepath
                    mSampler:   rpass.inputs[i].sampler
                , @mBuffers, @mCubeBuffers, @mKeyboard
                i++
            i = 0
            while i < 4
                @mPasses[j].setOutputs i, null
                i++
            numOutputs = rpass.outputs.length
            i = 0
            while i < numOutputs
                outputID = rpass.outputs[i].id
                outputCH = rpass.outputs[i].channel
                @mPasses[j].setOutputs outputCH, outputID
                i++

            rpassName = switch rpass.type
                when 'common'  then 'Common'
                when 'image'   then 'Image'
                when 'buffer'  then 'Buffer ' + String.fromCharCode(65 + assetID_to_bufferID(@mPasses[j].mOutputs[0]))
                when 'cubemap' then 'Cube A'
            @mPasses[j].create rpass.type, rpassName
            j++
            
        pt = 0
        while pt < 5
            j = 0
            while j < numPasses
                rpass = passes[j]
                if pt == 0 and rpass.type != 'common'
                    j++
                    continue
                if pt == 1 and rpass.type != 'buffer'
                    j++
                    continue
                if pt == 2 and rpass.type != 'image'
                    j++
                    continue
                if pt == 4 and rpass.type != 'cubemap'
                    j++
                    continue
                shaderStr = rpass.code
                result = @newShader shaderStr, j
                if result != null
                    res.mFailed = true
                    res[j] =
                        mFailed: true
                        mError:  result
                        mShader: shaderStr
                else
                    res[j] =
                        mFailed: false
                        mError:  null
                        mShader: shaderStr
                j++
            pt++
            
        res
        