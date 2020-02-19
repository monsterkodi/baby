// koffee 1.7.0
var Effect;

Effect = function(gl, xres, yres, obj) {
    var fsSourceC, fsSourceD, i, j, kayboardTexture, keyboardData, keyboardImage, res, vsSourceC, vsSourceD;
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
    if (gl === null) {
        return;
    }
    this.mRenderer = piRenderer();
    if (!this.mRenderer.Initialize(gl)) {
        return;
    }
    vsSourceC = void 0;
    fsSourceC = void 0;
    vsSourceC = 'layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }';
    fsSourceC = 'uniform vec4 v; uniform sampler2D t; out vec4 outColor; void main() { outColor = textureLod(t, gl_FragCoord.xy / v.zw, 0.0); }';
    res = this.mRenderer.CreateShader(vsSourceC, fsSourceC);
    if (res.mResult === false) {
        console.log('Failed to compile shader to copy buffers : ' + res.mInfo);
        return;
    }
    this.mProgramCopy = res;
    vsSourceD = void 0;
    fsSourceD = void 0;
    vsSourceD = 'layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }';
    fsSourceD = 'uniform vec4 v; uniform sampler2D t; out vec4 outColor; void main() { vec2 uv = gl_FragCoord.xy / v.zw; outColor = texture(t, vec2(uv.x,1.0-uv.y)); }';
    res = this.mRenderer.CreateShader(vsSourceD, fsSourceD);
    if (res.mResult === false) {
        console.log('Failed to compile shader to downscale buffers : ' + res);
        return;
    }
    this.mProgramDownscale = res;
    i = 0;
    while (i < this.mMaxBuffers) {
        this.mBuffers[i] = {
            mTexture: [null, null],
            mTarget: [null, null],
            mResolution: [0, 0],
            mLastRenderDone: 0,
            mThumbnailRenderTarget: null,
            mThumbnailTexture: null,
            mThumbnailBuffer: null,
            mThumbnailRes: [0, 0]
        };
        i++;
    }
    i = 0;
    while (i < this.mMaxCubeBuffers) {
        this.mCubeBuffers[i] = {
            mTexture: [null, null],
            mTarget: [null, null],
            mResolution: [0, 0],
            mLastRenderDone: 0,
            mThumbnailRenderTarget: null,
            mThumbnailTexture: null,
            mThumbnailBuffer: null,
            mThumbnailRes: [0, 0]
        };
        i++;
    }
    keyboardData = new Uint8Array(256 * 3);
    j = 0;
    while (j < 256 * 3) {
        keyboardData[j] = 0;
        j++;
    }
    kayboardTexture = this.mRenderer.CreateTexture(this.mRenderer.TEXTYPE.T2D, 256, 3, this.mRenderer.TEXFMT.C1I8, this.mRenderer.FILTER.NONE, this.mRenderer.TEXWRP.CLAMP, null);
    keyboardImage = new Image;
    this.mKeyboard = {
        mData: keyboardData,
        mTexture: kayboardTexture,
        mIcon: keyboardImage
    };
    this.mCreated = true;
};

Effect.prototype.ResizeCubemapBuffer = function(i, xres, yres) {
    var oldXres, oldYres, target1, target2, texture1, texture2;
    oldXres = this.mCubeBuffers[i].mResolution[0];
    oldYres = this.mCubeBuffers[i].mResolution[1];
    if (this.mCubeBuffers[i].mTexture[0] === null || oldXres !== xres || oldYres !== yres) {
        texture1 = this.mRenderer.CreateTexture(this.mRenderer.TEXTYPE.CUBEMAP, xres, yres, this.mRenderer.TEXFMT.C4F16, this.mRenderer.FILTER.LINEAR, this.mRenderer.TEXWRP.CLAMP, null);
        target1 = this.mRenderer.CreateRenderTargetCubeMap(texture1, null, false);
        texture2 = this.mRenderer.CreateTexture(this.mRenderer.TEXTYPE.CUBEMAP, xres, yres, this.mRenderer.TEXFMT.C4F16, this.mRenderer.FILTER.LINEAR, this.mRenderer.TEXWRP.CLAMP, null);
        target2 = this.mRenderer.CreateRenderTargetCubeMap(texture2, null, false);
        this.mCubeBuffers[i].mTexture = [texture1, texture2];
        this.mCubeBuffers[i].mTarget = [target1, target2];
        this.mCubeBuffers[i].mLastRenderDone = 0;
        this.mCubeBuffers[i].mResolution[0] = xres;
        this.mCubeBuffers[i].mResolution[1] = yres;
    }
};

Effect.prototype.ResizeBuffer = function(i, xres, yres, skipIfNotExists) {
    var l1, needCopy, oldXres, oldYres, target1, target2, texture1, texture2, v, vOld;
    if (skipIfNotExists && this.mBuffers[i].mTexture[0] === null) {
        return;
    }
    oldXres = this.mBuffers[i].mResolution[0];
    oldYres = this.mBuffers[i].mResolution[1];
    if (oldXres !== xres || oldYres !== yres) {
        needCopy = this.mBuffers[i].mTexture[0] !== null;
        texture1 = this.mRenderer.CreateTexture(this.mRenderer.TEXTYPE.T2D, xres, yres, this.mRenderer.TEXFMT.C4F32, (needCopy ? this.mBuffers[i].mTexture[0].mFilter : this.mRenderer.FILTER.NONE), (needCopy ? this.mBuffers[i].mTexture[0].mWrap : this.mRenderer.TEXWRP.CLAMP), null);
        texture2 = this.mRenderer.CreateTexture(this.mRenderer.TEXTYPE.T2D, xres, yres, this.mRenderer.TEXFMT.C4F32, (needCopy ? this.mBuffers[i].mTexture[1].mFilter : this.mRenderer.FILTER.NONE), (needCopy ? this.mBuffers[i].mTexture[1].mWrap : this.mRenderer.TEXWRP.CLAMP), null);
        target1 = this.mRenderer.CreateRenderTarget(texture1, null, null, null, null, false);
        target2 = this.mRenderer.CreateRenderTarget(texture2, null, null, null, null, false);
        if (needCopy) {
            v = [0, 0, Math.min(xres, oldXres), Math.min(yres, oldYres)];
            this.mRenderer.SetBlend(false);
            this.mRenderer.SetViewport(v);
            this.mRenderer.AttachShader(this.mProgramCopy);
            l1 = this.mRenderer.GetAttribLocation(this.mProgramCopy, 'pos');
            vOld = [0, 0, oldXres, oldYres];
            this.mRenderer.SetShaderConstant4FV('v', vOld);
            this.mRenderer.SetRenderTarget(target1);
            this.mRenderer.AttachTextures(1, this.mBuffers[i].mTexture[0], null, null, null);
            this.mRenderer.DrawUnitQuad_XY(l1);
            this.mRenderer.SetRenderTarget(target2);
            this.mRenderer.AttachTextures(1, this.mBuffers[i].mTexture[1], null, null, null);
            this.mRenderer.DrawUnitQuad_XY(l1);
            this.mRenderer.DestroyTexture(this.mBuffers[i].mTexture[0]);
            this.mRenderer.DestroyRenderTarget(this.mBuffers[i].mTarget[0]);
            this.mRenderer.DestroyTexture(this.mBuffers[i].mTexture[1]);
            this.mRenderer.DestroyRenderTarget(this.mBuffers[i].mTarget[1]);
        }
        this.mBuffers[i].mTexture = [texture1, texture2];
        this.mBuffers[i].mTarget = [target1, target2];
        this.mBuffers[i].mLastRenderDone = 0;
        this.mBuffers[i].mResolution[0] = xres;
        this.mBuffers[i].mResolution[1] = yres;
    }
};

Effect.prototype.saveScreenshot = function(passid) {
    var blob, bufferID, bytes, cubeBuffer, data, height, l1, numComponents, pass, program, target, texture, type, width, xres, yres;
    pass = this.mPasses[passid];
    if (pass.mType === 'buffer') {
        bufferID = assetID_to_bufferID(this.mPasses[passid].mOutputs[0]);
        texture = this.mBuffers[bufferID].mTarget[this.mBuffers[bufferID].mLastRenderDone];
        numComponents = 3;
        width = texture.mTex0.mXres;
        height = texture.mTex0.mYres;
        type = 'Float';
        bytes = new Float32Array(width * height * 4);
        this.mRenderer.GetPixelDataRenderTarget(texture, bytes, width, height);
        blob = piExportToEXR(width, height, numComponents, type, bytes);
        piTriggerDownload('image.exr', blob);
    } else if (pass.mType === 'cubemap') {
        xres = 4096;
        yres = 2048;
        this.mScreenshotSytem.Allocate(xres, yres);
        cubeBuffer = this.mCubeBuffers[0];
        target = this.mScreenshotSytem.GetTarget();
        this.mRenderer.SetRenderTarget(target);
        program = this.mScreenshotSytem.GetProgram();
        this.mRenderer.AttachShader(program);
        l1 = this.mRenderer.GetAttribLocation(program, 'pos');
        this.mRenderer.SetViewport([0, 0, xres, yres]);
        this.mRenderer.AttachTextures(1, cubeBuffer.mTexture[cubeBuffer.mLastRenderDone], null, null, null);
        this.mRenderer.DrawUnitQuad_XY(l1);
        this.mRenderer.DettachTextures();
        this.mRenderer.SetRenderTarget(null);
        data = new Float32Array(xres * yres * 4);
        this.mRenderer.GetPixelDataRenderTarget(target, data, xres, yres);
        blob = piExportToEXR(xres, yres, 3, 'Float', data);
        piTriggerDownload('image.exr', blob);
    }
};

Effect.prototype.ResizeBuffers = function(xres, yres) {
    var i;
    i = 0;
    while (i < this.mMaxBuffers) {
        this.ResizeBuffer(i, xres, yres, true);
        i++;
    }
};

Effect.prototype.GetTexture = function(passid, slot) {
    return this.mPasses[passid].GetTexture(slot);
};

Effect.prototype.NewTexture = function(passid, slot, url) {
    return this.mPasses[passid].NewTexture(null, slot, url, this.mBuffers, this.mCubeBuffers, this.mKeyboard);
};

Effect.prototype.SetOutputs = function(passid, slot, url) {
    this.mPasses[passid].SetOutputs(slot, url);
};

Effect.prototype.SetOutputsByBufferID = function(passid, slot, id) {
    this.mPasses[passid].SetOutputsByBufferID(slot, id);
};

Effect.prototype.GetAcceptsLinear = function(passid, slot) {
    return this.mPasses[passid].GetAcceptsLinear(slot);
};

Effect.prototype.GetAcceptsMipmapping = function(passid, slot) {
    return this.mPasses[passid].GetAcceptsMipmapping(slot);
};

Effect.prototype.GetAcceptsWrapRepeat = function(passid, slot) {
    return this.mPasses[passid].GetAcceptsWrapRepeat(slot);
};

Effect.prototype.GetAcceptsVFlip = function(passid, slot) {
    return this.mPasses[passid].GetAcceptsVFlip(slot);
};

Effect.prototype.SetSamplerFilter = function(passid, slot, str) {
    this.mPasses[passid].SetSamplerFilter(slot, str, this.mBuffers, this.mCubeBuffers);
};

Effect.prototype.GetSamplerFilter = function(passid, slot) {
    return this.mPasses[passid].GetSamplerFilter(slot);
};

Effect.prototype.SetSamplerWrap = function(passid, slot, str) {
    this.mPasses[passid].SetSamplerWrap(slot, str, this.mBuffers);
};

Effect.prototype.GetSamplerWrap = function(passid, slot) {
    return this.mPasses[passid].GetSamplerWrap(slot);
};

Effect.prototype.SetSamplerVFlip = function(passid, slot, str) {
    this.mPasses[passid].SetSamplerVFlip(slot, str);
};

Effect.prototype.GetSamplerVFlip = function(passid, slot) {
    return this.mPasses[passid].GetSamplerVFlip(slot);
};

Effect.prototype.SetKeyDown = function(passid, k) {
    if (this.mKeyboard.mData[k + 0 * 256] === 255) {
        return;
    }
    this.mKeyboard.mData[k + 0 * 256] = 255;
    this.mKeyboard.mData[k + 1 * 256] = 255;
    this.mKeyboard.mData[k + 2 * 256] = 255 - this.mKeyboard.mData[k + 2 * 256];
    this.mRenderer.UpdateTexture(this.mKeyboard.mTexture, 0, 0, 256, 3, this.mKeyboard.mData);
};

Effect.prototype.SetKeyUp = function(passid, k) {
    this.mKeyboard.mData[k + 0 * 256] = 0;
    this.mKeyboard.mData[k + 1 * 256] = 0;
    this.mRenderer.UpdateTexture(this.mKeyboard.mTexture, 0, 0, 256, 3, this.mKeyboard.mData);
};

Effect.prototype.SetSize = function(xres, yres) {
    var oldXres, oldYres;
    if (xres !== this.mXres || yres !== this.mYres) {
        oldXres = this.mXres;
        oldYres = this.mYres;
        this.mXres = xres;
        this.mYres = yres;
        this.ResizeBuffers(xres, yres);
        return true;
    }
    return false;
};

Effect.prototype.PauseInput = function(passid, id) {
    return this.mPasses[passid].TooglePauseInput(this.mAudioContext, id);
};

Effect.prototype.ResetTime = function() {
    var i, num;
    this.mFrame = 0;
    num = this.mPasses.length;
    i = 0;
    while (i < num) {
        this.mPasses[i].mFrame = 0;
        i++;
    }
};

Effect.prototype.Paint = function(time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, isPaused) {
    var i;
    var i;
    var i;
    var bufferID;
    var needMipMaps;
    var j;
    var k;
    var inp;
    var i;
    var k;
    var bufferID, da, face, i, inp, j, k, needMipMaps, num, wa, xres, yres;
    wa = null;
    da = new Date;
    xres = this.mXres / 1;
    yres = this.mYres / 1;
    if (this.mFrame === 0) {
        i = 0;
        while (i < this.mMaxBuffers) {
            if (this.mBuffers[i].mTexture[0] !== null) {
                this.mRenderer.SetRenderTarget(this.mBuffers[i].mTarget[0]);
                this.mRenderer.Clear(this.mRenderer.CLEAR.Color, [0.0, 0.0, 0.0, 0.0], 1.0, 0);
                this.mRenderer.SetRenderTarget(this.mBuffers[i].mTarget[1]);
                this.mRenderer.Clear(this.mRenderer.CLEAR.Color, [0.0, 0.0, 0.0, 0.0], 1.0, 0);
            }
            i++;
        }
        i = 0;
        while (i < this.mMaxCubeBuffers) {
            if (this.mCubeBuffers[i].mTexture[0] !== null) {
                face = 0;
                while (face < 6) {
                    this.mRenderer.SetRenderTargetCubeMap(this.mCubeBuffers[i].mTarget[0], face);
                    this.mRenderer.Clear(this.mRenderer.CLEAR.Color, [0.0, 0.0, 0.0, 0.0], 1.0, 0);
                    this.mRenderer.SetRenderTargetCubeMap(this.mCubeBuffers[i].mTarget[1], face);
                    this.mRenderer.Clear(this.mRenderer.CLEAR.Color, [0.0, 0.0, 0.0, 0.0], 1.0, 0);
                    face++;
                }
            }
            i++;
        }
    }
    num = this.mPasses.length;
    i = 0;
    while (i < num) {
        if (this.mPasses[i].mType !== 'buffer') {
            i++;
            continue;
        }
        if (this.mPasses[i].mProgram === null) {
            i++;
            continue;
        }
        bufferID = assetID_to_bufferID(this.mPasses[i].mOutputs[0]);
        needMipMaps = false;
        j = 0;
        while (j < num) {
            k = 0;
            while (k < this.mPasses[j].mInputs.length) {
                inp = this.mPasses[j].mInputs[k];
                if (inp !== null && inp.mInfo.mType === 'buffer' && inp.id === bufferID && inp.mInfo.mSampler.filter === 'mipmap') {
                    needMipMaps = true;
                    break;
                }
                k++;
            }
            j++;
        }
        this.mPasses[i].Paint(wa, da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, isPaused, bufferID, needMipMaps, this.mBuffers, this.mCubeBuffers, this.mKeyboard, this);
        i++;
    }
    i = 0;
    while (i < num) {
        if (this.mPasses[i].mType !== 'cubemap') {
            i++;
            continue;
        }
        if (this.mPasses[i].mProgram === null) {
            i++;
            continue;
        }
        bufferID = 0;
        needMipMaps = false;
        j = 0;
        while (j < num) {
            k = 0;
            while (k < this.mPasses[j].mInputs.length) {
                inp = this.mPasses[j].mInputs[k];
                if (inp !== null && inp.mInfo.mType === 'cubemap') {
                    if (assetID_to_cubemapBuferID(inp.mInfo.mID) === 0 && inp.mInfo.mSampler.filter === 'mipmap') {
                        needMipMaps = true;
                        break;
                    }
                }
                k++;
            }
            j++;
        }
        this.mPasses[i].Paint(wa, da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, isPaused, bufferID, needMipMaps, this.mBuffers, this.mCubeBuffers, this.mKeyboard, this);
        i++;
    }
    i = 0;
    while (i < num) {
        if (this.mPasses[i].mType !== 'image') {
            i++;
            continue;
        }
        if (this.mPasses[i].mProgram === null) {
            i++;
            continue;
        }
        this.mPasses[i].Paint(wa, da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, isPaused, null, false, this.mBuffers, this.mCubeBuffers, this.mKeyboard, this);
        i++;
    }
    k = 0;
    while (k < 256) {
        this.mKeyboard.mData[k + 1 * 256] = 0;
        k++;
    }
    this.mRenderer.UpdateTexture(this.mKeyboard.mTexture, 0, 0, 256, 3, this.mKeyboard.mData);
    this.mFrame++;
};

Effect.prototype.NewShader = function(shaderCode, passid) {
    var commonSourceCodes, i;
    commonSourceCodes = [];
    i = 0;
    while (i < this.mPasses.length) {
        if (this.mPasses[i].mType === 'common') {
            commonSourceCodes.push(this.mPasses[i].mSource);
        }
        i++;
    }
    return this.mPasses[passid].NewShader(shaderCode, commonSourceCodes);
};

Effect.prototype.GetNumPasses = function() {
    return this.mPasses.length;
};

Effect.prototype.GetNumOfType = function(passtype) {
    var id, j;
    id = 0;
    j = 0;
    while (j < this.mPasses.length) {
        if (this.mPasses[j].mType === passtype) {
            id++;
        }
        j++;
    }
    return id;
};

Effect.prototype.GetPassType = function(id) {
    return this.mPasses[id].mType;
};

Effect.prototype.GetPassName = function(id) {
    return this.mPasses[id].mName;
};

Effect.prototype.newScriptJSON = function(passes) {
    var i, j, lid, numInputs, numOutputs, numPasses, outputCH, outputID, psrc, pt, res, result, rpass, rpassName, samp, shaderStr, sid, ssrc, styp;
    numPasses = passes.length;
    if (numPasses < 1 || numPasses > this.mMaxPasses) {
        return {
            mFailed: true,
            mError: 'Incorrect number of passes, wrong shader format',
            mShader: null
        };
    }
    res = [];
    res.mFailed = false;
    j = 0;
    while (j < numPasses) {
        rpass = passes[j];
        this.mPasses[j] = new Pass(this.mRenderer, this.mIsLowEnd, true, false, this.mGainNode, this.mProgramDownscale, j, this);
        numInputs = rpass.inputs.length;
        i = 0;
        while (i < 4) {
            this.mPasses[j].NewTexture(null, i, null, null, null);
            i++;
        }
        i = 0;
        while (i < numInputs) {
            lid = rpass.inputs[i].channel;
            styp = rpass.inputs[i].type;
            sid = rpass.inputs[i].id;
            ssrc = rpass.inputs[i].filepath;
            psrc = rpass.inputs[i].previewfilepath;
            samp = rpass.inputs[i].sampler;
            this.mPasses[j].NewTexture(this.mAudioContext, lid, {
                mType: styp,
                mID: sid,
                mSrc: ssrc,
                mSampler: samp,
                mPreviewSrc: psrc
            }, this.mBuffers, this.mCubeBuffers, this.mKeyboard);
            i++;
        }
        i = 0;
        while (i < 4) {
            this.mPasses[j].SetOutputs(i, null);
            i++;
        }
        numOutputs = rpass.outputs.length;
        i = 0;
        while (i < numOutputs) {
            outputID = rpass.outputs[i].id;
            outputCH = rpass.outputs[i].channel;
            this.mPasses[j].SetOutputs(outputCH, outputID);
            i++;
        }
        rpassName = '';
        if (rpass.type === 'common') {
            rpassName = 'Common';
        }
        if (rpass.type === 'image') {
            rpassName = 'Image';
        }
        if (rpass.type === 'buffer') {
            rpassName = 'Buffer ' + String.fromCharCode(65 + assetID_to_bufferID(this.mPasses[j].mOutputs[0]));
        }
        if (rpass.type === 'cubemap') {
            rpassName = 'Cube A';
        }
        this.mPasses[j].Create(rpass.type, rpassName, this.mAudioContext);
        j++;
    }
    pt = 0;
    while (pt < 5) {
        j = 0;
        while (j < numPasses) {
            rpass = passes[j];
            if (pt === 0 && rpass.type !== 'common') {
                j++;
                continue;
            }
            if (pt === 1 && rpass.type !== 'buffer') {
                j++;
                continue;
            }
            if (pt === 2 && rpass.type !== 'image') {
                j++;
                continue;
            }
            if (pt === 4 && rpass.type !== 'cubemap') {
                j++;
                continue;
            }
            shaderStr = rpass.code;
            result = this.NewShader(shaderStr, j);
            if (result !== null) {
                res.mFailed = true;
                res[j] = {
                    mFailed: true,
                    mError: result,
                    mShader: shaderStr
                };
            } else {
                res[j] = {
                    mFailed: false,
                    mError: null,
                    mShader: shaderStr
                };
            }
            j++;
        }
        pt++;
    }
    return res;
};

Effect.prototype.GetCompilationTime = function(id) {
    return this.mPasses[id].GetCompilationTime();
};

Effect.prototype.DestroyPass = function(id) {
    this.mPasses[id].Destroy(this.mAudioContext);
    this.mPasses.splice(id, 1);
};

Effect.prototype.AddPass = function(passType, passName) {
    var id, res, shaderStr;
    shaderStr = null;
    if (passType === 'buffer') {
        shaderStr = 'void mainImage( out vec4 fragColor, in vec2 fragCoord )\n{\n    fragColor = vec4(0.0,0.0,1.0,1.0);\n}';
    }
    if (passType === 'common') {
        shaderStr = 'vec4 someFunction( vec4 a, float b )\n{\n    return a+b;\n}';
    }
    if (passType === 'cubemap') {
        shaderStr = 'void mainCubemap( out vec4 fragColor, in vec2 fragCoord, in vec3 rayOri, in vec3 rayDir )\n{\n    // Ray direction as color\n    vec3 col = 0.5 + 0.5*rayDir;\n\n    // Output to cubemap\n    fragColor = vec4(col,1.0);\n}';
    }
    id = this.GetNumPasses();
    this.mPasses[id] = new Pass(this.mRenderer, this.mIsLowEnd, true, false, this.mGainNode, this.mProgramDownscale, id, this);
    this.mPasses[id].Create(passType, passName, this.mAudioContext);
    res = this.NewShader(shaderStr, id);
    return {
        mId: id,
        mShader: shaderStr,
        mError: res
    };
};

Effect.prototype.IsBufferPassUsed = function(bufferID) {
    var j;
    j = 0;
    while (j < this.mPasses.length) {
        if (this.mPasses[j].mType !== 'buffer') {
            j++;
            continue;
        }
        if (this.mPasses[j].mOutputs[0] === bufferID_to_assetID(bufferID)) {
            return true;
        }
        j++;
    }
    return false;
};

Effect.prototype.exportToJSON = function() {
    var i;
    var i, j, numPasses, outputID, result;
    result = {};
    result.ver = '0.1';
    result.renderpass = [];
    numPasses = this.mPasses.length;
    j = 0;
    while (j < numPasses) {
        result.renderpass[j] = {};
        result.renderpass[j].outputs = new Array;
        i = 0;
        while (i < 4) {
            outputID = this.mPasses[j].mOutputs[i];
            if (outputID === null) {
                i++;
                continue;
            }
            result.renderpass[j].outputs.push({
                channel: i,
                id: outputID
            });
            i++;
        }
        result.renderpass[j].inputs = new Array;
        i = 0;
        while (i < 4) {
            if (this.mPasses[j].mInputs[i] === null) {
                i++;
                continue;
            }
            result.renderpass[j].inputs.push({
                channel: i,
                type: this.mPasses[j].mInputs[i].mInfo.mType,
                id: this.mPasses[j].mInputs[i].mInfo.mID,
                filepath: this.mPasses[j].mInputs[i].mInfo.mSrc,
                sampler: this.mPasses[j].mInputs[i].mInfo.mSampler
            });
            i++;
        }
        result.renderpass[j].code = this.mPasses[j].mSource;
        result.renderpass[j].name = this.mPasses[j].mName;
        result.renderpass[j].description = '';
        result.renderpass[j].type = this.mPasses[j].mType;
        j++;
    }
    result.flags = this.calcFlags();
    return result;
};

Effect.prototype.calcFlags = function() {
    var flagKeyboard, flagMultipass, i, j, numPasses, pass;
    flagKeyboard = false;
    flagMultipass = false;
    numPasses = this.mPasses.length;
    j = 0;
    while (j < numPasses) {
        pass = this.mPasses[j];
        if (pass.mType === 'buffer') {
            flagMultipass = true;
        }
        i = 0;
        while (i < 4) {
            if (pass.mInputs[i] === null) {
                i++;
                continue;
            }
            if (pass.mInputs[i].mInfo.mType === 'keyboard') {
                flagKeyboard = true;
            }
            i++;
        }
        j++;
    }
    return {
        mFlagKeyboard: flagKeyboard,
        mFlagMultipass: flagMultipass
    };
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBTUEsSUFBQTs7QUFBQSxNQUFBLEdBQVMsU0FBQyxFQUFELEVBQUssSUFBTCxFQUFXLElBQVgsRUFBaUIsR0FBakI7QUFDTCxRQUFBO0lBQUEsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUNaLElBQUMsQ0FBQSxTQUFELEdBQWE7SUFDYixJQUFDLENBQUEsVUFBRCxHQUFjO0lBQ2QsSUFBQyxDQUFBLEtBQUQsR0FBUztJQUNULElBQUMsQ0FBQSxLQUFELEdBQVM7SUFDVCxJQUFDLENBQUEsU0FBRCxHQUFhO0lBQ2IsSUFBQyxDQUFBLE9BQUQsR0FBVztJQUNYLElBQUMsQ0FBQSxNQUFELEdBQVU7SUFDVixJQUFDLENBQUEsV0FBRCxHQUFlO0lBQ2YsSUFBQyxDQUFBLGVBQUQsR0FBbUI7SUFDbkIsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsV0FBRCxHQUFlO0lBQzdCLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFDWixJQUFDLENBQUEsWUFBRCxHQUFnQjtJQUNoQixJQUFDLENBQUEsZ0JBQUQsR0FBb0I7SUFDcEIsSUFBQyxDQUFBLFNBQUQsR0FBYTtJQUNiLElBQUcsRUFBQSxLQUFNLElBQVQ7QUFDSSxlQURKOztJQUVBLElBQUMsQ0FBQSxTQUFELEdBQWEsVUFBQSxDQUFBO0lBQ2IsSUFBRyxDQUFDLElBQUMsQ0FBQSxTQUFTLENBQUMsVUFBWCxDQUFzQixFQUF0QixDQUFKO0FBQ0ksZUFESjs7SUFFQSxTQUFBLEdBQVk7SUFDWixTQUFBLEdBQVk7SUFDWixTQUFBLEdBQVk7SUFDWixTQUFBLEdBQVk7SUFDWixHQUFBLEdBQU0sSUFBQyxDQUFBLFNBQVMsQ0FBQyxZQUFYLENBQXdCLFNBQXhCLEVBQW1DLFNBQW5DO0lBQ04sSUFBRyxHQUFHLENBQUMsT0FBSixLQUFlLEtBQWxCO1FBQ0ksT0FBTyxDQUFDLEdBQVIsQ0FBWSw2Q0FBQSxHQUFnRCxHQUFHLENBQUMsS0FBaEU7QUFDQSxlQUZKOztJQUdBLElBQUMsQ0FBQSxZQUFELEdBQWdCO0lBQ2hCLFNBQUEsR0FBWTtJQUNaLFNBQUEsR0FBWTtJQUNaLFNBQUEsR0FBWTtJQUNaLFNBQUEsR0FBWTtJQUNaLEdBQUEsR0FBTSxJQUFDLENBQUEsU0FBUyxDQUFDLFlBQVgsQ0FBd0IsU0FBeEIsRUFBbUMsU0FBbkM7SUFDTixJQUFHLEdBQUcsQ0FBQyxPQUFKLEtBQWUsS0FBbEI7UUFDSSxPQUFPLENBQUMsR0FBUixDQUFZLGtEQUFBLEdBQXFELEdBQWpFO0FBQ0EsZUFGSjs7SUFHQSxJQUFDLENBQUEsaUJBQUQsR0FBcUI7SUFFckIsQ0FBQSxHQUFJO0FBQ0osV0FBTSxDQUFBLEdBQUksSUFBQyxDQUFBLFdBQVg7UUFDSSxJQUFDLENBQUEsUUFBUyxDQUFBLENBQUEsQ0FBVixHQUNJO1lBQUEsUUFBQSxFQUFVLENBQ04sSUFETSxFQUVOLElBRk0sQ0FBVjtZQUlBLE9BQUEsRUFBUyxDQUNMLElBREssRUFFTCxJQUZLLENBSlQ7WUFRQSxXQUFBLEVBQWEsQ0FDVCxDQURTLEVBRVQsQ0FGUyxDQVJiO1lBWUEsZUFBQSxFQUFpQixDQVpqQjtZQWFBLHNCQUFBLEVBQXdCLElBYnhCO1lBY0EsaUJBQUEsRUFBbUIsSUFkbkI7WUFlQSxnQkFBQSxFQUFrQixJQWZsQjtZQWdCQSxhQUFBLEVBQWUsQ0FDWCxDQURXLEVBRVgsQ0FGVyxDQWhCZjs7UUFvQkosQ0FBQTtJQXRCSjtJQXVCQSxDQUFBLEdBQUk7QUFDSixXQUFNLENBQUEsR0FBSSxJQUFDLENBQUEsZUFBWDtRQUNJLElBQUMsQ0FBQSxZQUFhLENBQUEsQ0FBQSxDQUFkLEdBQ0k7WUFBQSxRQUFBLEVBQVUsQ0FDTixJQURNLEVBRU4sSUFGTSxDQUFWO1lBSUEsT0FBQSxFQUFTLENBQ0wsSUFESyxFQUVMLElBRkssQ0FKVDtZQVFBLFdBQUEsRUFBYSxDQUNULENBRFMsRUFFVCxDQUZTLENBUmI7WUFZQSxlQUFBLEVBQWlCLENBWmpCO1lBYUEsc0JBQUEsRUFBd0IsSUFieEI7WUFjQSxpQkFBQSxFQUFtQixJQWRuQjtZQWVBLGdCQUFBLEVBQWtCLElBZmxCO1lBZ0JBLGFBQUEsRUFBZSxDQUNYLENBRFcsRUFFWCxDQUZXLENBaEJmOztRQW9CSixDQUFBO0lBdEJKO0lBdUJBLFlBQUEsR0FBZSxJQUFJLFVBQUosQ0FBZSxHQUFBLEdBQU0sQ0FBckI7SUFDZixDQUFBLEdBQUk7QUFDSixXQUFNLENBQUEsR0FBSSxHQUFBLEdBQU0sQ0FBaEI7UUFDSSxZQUFhLENBQUEsQ0FBQSxDQUFiLEdBQWtCO1FBQ2xCLENBQUE7SUFGSjtJQUdBLGVBQUEsR0FBa0IsSUFBQyxDQUFBLFNBQVMsQ0FBQyxhQUFYLENBQXlCLElBQUMsQ0FBQSxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQTVDLEVBQWlELEdBQWpELEVBQXNELENBQXRELEVBQXlELElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBTSxDQUFDLElBQTNFLEVBQWlGLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBTSxDQUFDLElBQW5HLEVBQXlHLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQTNILEVBQWtJLElBQWxJO0lBQ2xCLGFBQUEsR0FBZ0IsSUFBSTtJQUNwQixJQUFDLENBQUEsU0FBRCxHQUNJO1FBQUEsS0FBQSxFQUFPLFlBQVA7UUFDQSxRQUFBLEVBQVUsZUFEVjtRQUVBLEtBQUEsRUFBTyxhQUZQOztJQUdKLElBQUMsQ0FBQSxRQUFELEdBQVk7QUFuR1A7O0FBc0dULE1BQU0sQ0FBQSxTQUFFLENBQUEsbUJBQVIsR0FBOEIsU0FBQyxDQUFELEVBQUksSUFBSixFQUFVLElBQVY7QUFDMUIsUUFBQTtJQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsWUFBYSxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQVksQ0FBQSxDQUFBO0lBQ3ZDLE9BQUEsR0FBVSxJQUFDLENBQUEsWUFBYSxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQVksQ0FBQSxDQUFBO0lBQ3ZDLElBQUcsSUFBQyxDQUFBLFlBQWEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUExQixLQUFnQyxJQUFoQyxJQUF3QyxPQUFBLEtBQVcsSUFBbkQsSUFBMkQsT0FBQSxLQUFXLElBQXpFO1FBQ0ksUUFBQSxHQUFXLElBQUMsQ0FBQSxTQUFTLENBQUMsYUFBWCxDQUF5QixJQUFDLENBQUEsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUE1QyxFQUFxRCxJQUFyRCxFQUEyRCxJQUEzRCxFQUFpRSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFuRixFQUEwRixJQUFDLENBQUEsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUE1RyxFQUFvSCxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUF0SSxFQUE2SSxJQUE3STtRQUNYLE9BQUEsR0FBVSxJQUFDLENBQUEsU0FBUyxDQUFDLHlCQUFYLENBQXFDLFFBQXJDLEVBQStDLElBQS9DLEVBQXFELEtBQXJEO1FBQ1YsUUFBQSxHQUFXLElBQUMsQ0FBQSxTQUFTLENBQUMsYUFBWCxDQUF5QixJQUFDLENBQUEsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUE1QyxFQUFxRCxJQUFyRCxFQUEyRCxJQUEzRCxFQUFpRSxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFuRixFQUEwRixJQUFDLENBQUEsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUE1RyxFQUFvSCxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUF0SSxFQUE2SSxJQUE3STtRQUNYLE9BQUEsR0FBVSxJQUFDLENBQUEsU0FBUyxDQUFDLHlCQUFYLENBQXFDLFFBQXJDLEVBQStDLElBQS9DLEVBQXFELEtBQXJEO1FBRVYsSUFBQyxDQUFBLFlBQWEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxRQUFqQixHQUE0QixDQUN4QixRQUR3QixFQUV4QixRQUZ3QjtRQUk1QixJQUFDLENBQUEsWUFBYSxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQWpCLEdBQTJCLENBQ3ZCLE9BRHVCLEVBRXZCLE9BRnVCO1FBSTNCLElBQUMsQ0FBQSxZQUFhLENBQUEsQ0FBQSxDQUFFLENBQUMsZUFBakIsR0FBbUM7UUFDbkMsSUFBQyxDQUFBLFlBQWEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUE3QixHQUFrQztRQUNsQyxJQUFDLENBQUEsWUFBYSxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQVksQ0FBQSxDQUFBLENBQTdCLEdBQWtDLEtBaEJ0Qzs7QUFIMEI7O0FBc0I5QixNQUFNLENBQUEsU0FBRSxDQUFBLFlBQVIsR0FBdUIsU0FBQyxDQUFELEVBQUksSUFBSixFQUFVLElBQVYsRUFBZ0IsZUFBaEI7QUFDbkIsUUFBQTtJQUFBLElBQUcsZUFBQSxJQUFvQixJQUFDLENBQUEsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQXRCLEtBQTRCLElBQW5EO0FBQ0ksZUFESjs7SUFFQSxPQUFBLEdBQVUsSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUFZLENBQUEsQ0FBQTtJQUNuQyxPQUFBLEdBQVUsSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUFZLENBQUEsQ0FBQTtJQUNuQyxJQUFHLE9BQUEsS0FBVyxJQUFYLElBQW1CLE9BQUEsS0FBVyxJQUFqQztRQUNJLFFBQUEsR0FBVyxJQUFDLENBQUEsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQXRCLEtBQTRCO1FBQ3ZDLFFBQUEsR0FBVyxJQUFDLENBQUEsU0FBUyxDQUFDLGFBQVgsQ0FBeUIsSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBNUMsRUFBaUQsSUFBakQsRUFBdUQsSUFBdkQsRUFBNkQsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBL0UsRUFBc0YsQ0FBSSxRQUFILEdBQWlCLElBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQTFDLEdBQXVELElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBTSxDQUFDLElBQTFFLENBQXRGLEVBQXVLLENBQUksUUFBSCxHQUFpQixJQUFDLENBQUEsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUExQyxHQUFxRCxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUF4RSxDQUF2SyxFQUF1UCxJQUF2UDtRQUNYLFFBQUEsR0FBVyxJQUFDLENBQUEsU0FBUyxDQUFDLGFBQVgsQ0FBeUIsSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFPLENBQUMsR0FBNUMsRUFBaUQsSUFBakQsRUFBdUQsSUFBdkQsRUFBNkQsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBL0UsRUFBc0YsQ0FBSSxRQUFILEdBQWlCLElBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQTFDLEdBQXVELElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBTSxDQUFDLElBQTFFLENBQXRGLEVBQXVLLENBQUksUUFBSCxHQUFpQixJQUFDLENBQUEsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUExQyxHQUFxRCxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUF4RSxDQUF2SyxFQUF1UCxJQUF2UDtRQUNYLE9BQUEsR0FBVSxJQUFDLENBQUEsU0FBUyxDQUFDLGtCQUFYLENBQThCLFFBQTlCLEVBQXdDLElBQXhDLEVBQThDLElBQTlDLEVBQW9ELElBQXBELEVBQTBELElBQTFELEVBQWdFLEtBQWhFO1FBQ1YsT0FBQSxHQUFVLElBQUMsQ0FBQSxTQUFTLENBQUMsa0JBQVgsQ0FBOEIsUUFBOUIsRUFBd0MsSUFBeEMsRUFBOEMsSUFBOUMsRUFBb0QsSUFBcEQsRUFBMEQsSUFBMUQsRUFBZ0UsS0FBaEU7UUFDVixJQUFHLFFBQUg7WUFDSSxDQUFBLEdBQUksQ0FDQSxDQURBLEVBRUEsQ0FGQSxFQUdBLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBVCxFQUFlLE9BQWYsQ0FIQSxFQUlBLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBVCxFQUFlLE9BQWYsQ0FKQTtZQU1KLElBQUMsQ0FBQSxTQUFTLENBQUMsUUFBWCxDQUFvQixLQUFwQjtZQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsV0FBWCxDQUF1QixDQUF2QjtZQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsWUFBWCxDQUF3QixJQUFDLENBQUEsWUFBekI7WUFDQSxFQUFBLEdBQUssSUFBQyxDQUFBLFNBQVMsQ0FBQyxpQkFBWCxDQUE2QixJQUFDLENBQUEsWUFBOUIsRUFBNEMsS0FBNUM7WUFDTCxJQUFBLEdBQU8sQ0FDSCxDQURHLEVBRUgsQ0FGRyxFQUdILE9BSEcsRUFJSCxPQUpHO1lBTVAsSUFBQyxDQUFBLFNBQVMsQ0FBQyxvQkFBWCxDQUFnQyxHQUFoQyxFQUFxQyxJQUFyQztZQUVBLElBQUMsQ0FBQSxTQUFTLENBQUMsZUFBWCxDQUEyQixPQUEzQjtZQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsY0FBWCxDQUEwQixDQUExQixFQUE2QixJQUFDLENBQUEsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQW5ELEVBQXVELElBQXZELEVBQTZELElBQTdELEVBQW1FLElBQW5FO1lBQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxlQUFYLENBQTJCLEVBQTNCO1lBRUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxlQUFYLENBQTJCLE9BQTNCO1lBQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxjQUFYLENBQTBCLENBQTFCLEVBQTZCLElBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBbkQsRUFBdUQsSUFBdkQsRUFBNkQsSUFBN0QsRUFBbUUsSUFBbkU7WUFDQSxJQUFDLENBQUEsU0FBUyxDQUFDLGVBQVgsQ0FBMkIsRUFBM0I7WUFFQSxJQUFDLENBQUEsU0FBUyxDQUFDLGNBQVgsQ0FBMEIsSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUFoRDtZQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsbUJBQVgsQ0FBK0IsSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUFwRDtZQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsY0FBWCxDQUEwQixJQUFDLENBQUEsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQWhEO1lBQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxtQkFBWCxDQUErQixJQUFDLENBQUEsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQXBELEVBOUJKOztRQWlDQSxJQUFDLENBQUEsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQWIsR0FBd0IsQ0FDcEIsUUFEb0IsRUFFcEIsUUFGb0I7UUFJeEIsSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFiLEdBQXVCLENBQ25CLE9BRG1CLEVBRW5CLE9BRm1CO1FBSXZCLElBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsZUFBYixHQUErQjtRQUMvQixJQUFDLENBQUEsUUFBUyxDQUFBLENBQUEsQ0FBRSxDQUFDLFdBQVksQ0FBQSxDQUFBLENBQXpCLEdBQThCO1FBQzlCLElBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBWSxDQUFBLENBQUEsQ0FBekIsR0FBOEIsS0FqRGxDOztBQUxtQjs7QUF5RHZCLE1BQU0sQ0FBQSxTQUFFLENBQUEsY0FBUixHQUF5QixTQUFDLE1BQUQ7QUFDckIsUUFBQTtJQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsT0FBUSxDQUFBLE1BQUE7SUFDaEIsSUFBRyxJQUFJLENBQUMsS0FBTCxLQUFjLFFBQWpCO1FBQ0ksUUFBQSxHQUFXLG1CQUFBLENBQW9CLElBQUMsQ0FBQSxPQUFRLENBQUEsTUFBQSxDQUFPLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBOUM7UUFDWCxPQUFBLEdBQVUsSUFBQyxDQUFBLFFBQVMsQ0FBQSxRQUFBLENBQVMsQ0FBQyxPQUFRLENBQUEsSUFBQyxDQUFBLFFBQVMsQ0FBQSxRQUFBLENBQVMsQ0FBQyxlQUFwQjtRQUN0QyxhQUFBLEdBQWdCO1FBQ2hCLEtBQUEsR0FBUSxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQ3RCLE1BQUEsR0FBUyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQ3ZCLElBQUEsR0FBTztRQUVQLEtBQUEsR0FBUSxJQUFJLFlBQUosQ0FBaUIsS0FBQSxHQUFRLE1BQVIsR0FBaUIsQ0FBbEM7UUFFUixJQUFDLENBQUEsU0FBUyxDQUFDLHdCQUFYLENBQW9DLE9BQXBDLEVBQTZDLEtBQTdDLEVBQW9ELEtBQXBELEVBQTJELE1BQTNEO1FBQ0EsSUFBQSxHQUFPLGFBQUEsQ0FBYyxLQUFkLEVBQXFCLE1BQXJCLEVBQTZCLGFBQTdCLEVBQTRDLElBQTVDLEVBQWtELEtBQWxEO1FBRVAsaUJBQUEsQ0FBa0IsV0FBbEIsRUFBK0IsSUFBL0IsRUFiSjtLQUFBLE1BY0ssSUFBRyxJQUFJLENBQUMsS0FBTCxLQUFjLFNBQWpCO1FBQ0QsSUFBQSxHQUFPO1FBQ1AsSUFBQSxHQUFPO1FBQ1AsSUFBQyxDQUFBLGdCQUFnQixDQUFDLFFBQWxCLENBQTJCLElBQTNCLEVBQWlDLElBQWpDO1FBQ0EsVUFBQSxHQUFhLElBQUMsQ0FBQSxZQUFhLENBQUEsQ0FBQTtRQUMzQixNQUFBLEdBQVMsSUFBQyxDQUFBLGdCQUFnQixDQUFDLFNBQWxCLENBQUE7UUFDVCxJQUFDLENBQUEsU0FBUyxDQUFDLGVBQVgsQ0FBMkIsTUFBM0I7UUFDQSxPQUFBLEdBQVUsSUFBQyxDQUFBLGdCQUFnQixDQUFDLFVBQWxCLENBQUE7UUFDVixJQUFDLENBQUEsU0FBUyxDQUFDLFlBQVgsQ0FBd0IsT0FBeEI7UUFDQSxFQUFBLEdBQUssSUFBQyxDQUFBLFNBQVMsQ0FBQyxpQkFBWCxDQUE2QixPQUE3QixFQUFzQyxLQUF0QztRQUNMLElBQUMsQ0FBQSxTQUFTLENBQUMsV0FBWCxDQUF1QixDQUNuQixDQURtQixFQUVuQixDQUZtQixFQUduQixJQUhtQixFQUluQixJQUptQixDQUF2QjtRQU1BLElBQUMsQ0FBQSxTQUFTLENBQUMsY0FBWCxDQUEwQixDQUExQixFQUE2QixVQUFVLENBQUMsUUFBUyxDQUFBLFVBQVUsQ0FBQyxlQUFYLENBQWpELEVBQThFLElBQTlFLEVBQW9GLElBQXBGLEVBQTBGLElBQTFGO1FBQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxlQUFYLENBQTJCLEVBQTNCO1FBQ0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxlQUFYLENBQUE7UUFDQSxJQUFDLENBQUEsU0FBUyxDQUFDLGVBQVgsQ0FBMkIsSUFBM0I7UUFDQSxJQUFBLEdBQU8sSUFBSSxZQUFKLENBQWlCLElBQUEsR0FBTyxJQUFQLEdBQWMsQ0FBL0I7UUFDUCxJQUFDLENBQUEsU0FBUyxDQUFDLHdCQUFYLENBQW9DLE1BQXBDLEVBQTRDLElBQTVDLEVBQWtELElBQWxELEVBQXdELElBQXhEO1FBQ0EsSUFBQSxHQUFPLGFBQUEsQ0FBYyxJQUFkLEVBQW9CLElBQXBCLEVBQTBCLENBQTFCLEVBQTZCLE9BQTdCLEVBQXNDLElBQXRDO1FBQ1AsaUJBQUEsQ0FBa0IsV0FBbEIsRUFBK0IsSUFBL0IsRUF2QkM7O0FBaEJnQjs7QUEwQ3pCLE1BQU0sQ0FBQSxTQUFFLENBQUEsYUFBUixHQUF3QixTQUFDLElBQUQsRUFBTyxJQUFQO0FBQ3BCLFFBQUE7SUFBQSxDQUFBLEdBQUk7QUFDSixXQUFNLENBQUEsR0FBSSxJQUFDLENBQUEsV0FBWDtRQUNJLElBQUMsQ0FBQSxZQUFELENBQWMsQ0FBZCxFQUFpQixJQUFqQixFQUF1QixJQUF2QixFQUE2QixJQUE3QjtRQUNBLENBQUE7SUFGSjtBQUZvQjs7QUFPeEIsTUFBTSxDQUFBLFNBQUUsQ0FBQSxVQUFSLEdBQXFCLFNBQUMsTUFBRCxFQUFTLElBQVQ7V0FDakIsSUFBQyxDQUFBLE9BQVEsQ0FBQSxNQUFBLENBQU8sQ0FBQyxVQUFqQixDQUE0QixJQUE1QjtBQURpQjs7QUFHckIsTUFBTSxDQUFBLFNBQUUsQ0FBQSxVQUFSLEdBQXFCLFNBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxHQUFmO1dBQ2pCLElBQUMsQ0FBQSxPQUFRLENBQUEsTUFBQSxDQUFPLENBQUMsVUFBakIsQ0FBNEIsSUFBNUIsRUFBa0MsSUFBbEMsRUFBd0MsR0FBeEMsRUFBNkMsSUFBQyxDQUFBLFFBQTlDLEVBQXdELElBQUMsQ0FBQSxZQUF6RCxFQUF1RSxJQUFDLENBQUEsU0FBeEU7QUFEaUI7O0FBR3JCLE1BQU0sQ0FBQSxTQUFFLENBQUEsVUFBUixHQUFxQixTQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsR0FBZjtJQUNqQixJQUFDLENBQUEsT0FBUSxDQUFBLE1BQUEsQ0FBTyxDQUFDLFVBQWpCLENBQTRCLElBQTVCLEVBQWtDLEdBQWxDO0FBRGlCOztBQUlyQixNQUFNLENBQUEsU0FBRSxDQUFBLG9CQUFSLEdBQStCLFNBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxFQUFmO0lBQzNCLElBQUMsQ0FBQSxPQUFRLENBQUEsTUFBQSxDQUFPLENBQUMsb0JBQWpCLENBQXNDLElBQXRDLEVBQTRDLEVBQTVDO0FBRDJCOztBQUkvQixNQUFNLENBQUEsU0FBRSxDQUFBLGdCQUFSLEdBQTJCLFNBQUMsTUFBRCxFQUFTLElBQVQ7V0FDdkIsSUFBQyxDQUFBLE9BQVEsQ0FBQSxNQUFBLENBQU8sQ0FBQyxnQkFBakIsQ0FBa0MsSUFBbEM7QUFEdUI7O0FBRzNCLE1BQU0sQ0FBQSxTQUFFLENBQUEsb0JBQVIsR0FBK0IsU0FBQyxNQUFELEVBQVMsSUFBVDtXQUMzQixJQUFDLENBQUEsT0FBUSxDQUFBLE1BQUEsQ0FBTyxDQUFDLG9CQUFqQixDQUFzQyxJQUF0QztBQUQyQjs7QUFHL0IsTUFBTSxDQUFBLFNBQUUsQ0FBQSxvQkFBUixHQUErQixTQUFDLE1BQUQsRUFBUyxJQUFUO1dBQzNCLElBQUMsQ0FBQSxPQUFRLENBQUEsTUFBQSxDQUFPLENBQUMsb0JBQWpCLENBQXNDLElBQXRDO0FBRDJCOztBQUcvQixNQUFNLENBQUEsU0FBRSxDQUFBLGVBQVIsR0FBMEIsU0FBQyxNQUFELEVBQVMsSUFBVDtXQUN0QixJQUFDLENBQUEsT0FBUSxDQUFBLE1BQUEsQ0FBTyxDQUFDLGVBQWpCLENBQWlDLElBQWpDO0FBRHNCOztBQUcxQixNQUFNLENBQUEsU0FBRSxDQUFBLGdCQUFSLEdBQTJCLFNBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxHQUFmO0lBQ3ZCLElBQUMsQ0FBQSxPQUFRLENBQUEsTUFBQSxDQUFPLENBQUMsZ0JBQWpCLENBQWtDLElBQWxDLEVBQXdDLEdBQXhDLEVBQTZDLElBQUMsQ0FBQSxRQUE5QyxFQUF3RCxJQUFDLENBQUEsWUFBekQ7QUFEdUI7O0FBSTNCLE1BQU0sQ0FBQSxTQUFFLENBQUEsZ0JBQVIsR0FBMkIsU0FBQyxNQUFELEVBQVMsSUFBVDtXQUN2QixJQUFDLENBQUEsT0FBUSxDQUFBLE1BQUEsQ0FBTyxDQUFDLGdCQUFqQixDQUFrQyxJQUFsQztBQUR1Qjs7QUFHM0IsTUFBTSxDQUFBLFNBQUUsQ0FBQSxjQUFSLEdBQXlCLFNBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxHQUFmO0lBQ3JCLElBQUMsQ0FBQSxPQUFRLENBQUEsTUFBQSxDQUFPLENBQUMsY0FBakIsQ0FBZ0MsSUFBaEMsRUFBc0MsR0FBdEMsRUFBMkMsSUFBQyxDQUFBLFFBQTVDO0FBRHFCOztBQUl6QixNQUFNLENBQUEsU0FBRSxDQUFBLGNBQVIsR0FBeUIsU0FBQyxNQUFELEVBQVMsSUFBVDtXQUNyQixJQUFDLENBQUEsT0FBUSxDQUFBLE1BQUEsQ0FBTyxDQUFDLGNBQWpCLENBQWdDLElBQWhDO0FBRHFCOztBQUd6QixNQUFNLENBQUEsU0FBRSxDQUFBLGVBQVIsR0FBMEIsU0FBQyxNQUFELEVBQVMsSUFBVCxFQUFlLEdBQWY7SUFDdEIsSUFBQyxDQUFBLE9BQVEsQ0FBQSxNQUFBLENBQU8sQ0FBQyxlQUFqQixDQUFpQyxJQUFqQyxFQUF1QyxHQUF2QztBQURzQjs7QUFJMUIsTUFBTSxDQUFBLFNBQUUsQ0FBQSxlQUFSLEdBQTBCLFNBQUMsTUFBRCxFQUFTLElBQVQ7V0FDdEIsSUFBQyxDQUFBLE9BQVEsQ0FBQSxNQUFBLENBQU8sQ0FBQyxlQUFqQixDQUFpQyxJQUFqQztBQURzQjs7QUFHMUIsTUFBTSxDQUFBLFNBQUUsQ0FBQSxVQUFSLEdBQXFCLFNBQUMsTUFBRCxFQUFTLENBQVQ7SUFDakIsSUFBRyxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQU0sQ0FBQSxDQUFBLEdBQUksQ0FBQSxHQUFJLEdBQVIsQ0FBakIsS0FBaUMsR0FBcEM7QUFDSSxlQURKOztJQUVBLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBTSxDQUFBLENBQUEsR0FBSSxDQUFBLEdBQUksR0FBUixDQUFqQixHQUFnQztJQUNoQyxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQU0sQ0FBQSxDQUFBLEdBQUksQ0FBQSxHQUFJLEdBQVIsQ0FBakIsR0FBZ0M7SUFDaEMsSUFBQyxDQUFBLFNBQVMsQ0FBQyxLQUFNLENBQUEsQ0FBQSxHQUFJLENBQUEsR0FBSSxHQUFSLENBQWpCLEdBQWdDLEdBQUEsR0FBTyxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQU0sQ0FBQSxDQUFBLEdBQUksQ0FBQSxHQUFJLEdBQVI7SUFDeEQsSUFBQyxDQUFBLFNBQVMsQ0FBQyxhQUFYLENBQXlCLElBQUMsQ0FBQSxTQUFTLENBQUMsUUFBcEMsRUFBOEMsQ0FBOUMsRUFBaUQsQ0FBakQsRUFBb0QsR0FBcEQsRUFBeUQsQ0FBekQsRUFBNEQsSUFBQyxDQUFBLFNBQVMsQ0FBQyxLQUF2RTtBQU5pQjs7QUFTckIsTUFBTSxDQUFBLFNBQUUsQ0FBQSxRQUFSLEdBQW1CLFNBQUMsTUFBRCxFQUFTLENBQVQ7SUFDZixJQUFDLENBQUEsU0FBUyxDQUFDLEtBQU0sQ0FBQSxDQUFBLEdBQUksQ0FBQSxHQUFJLEdBQVIsQ0FBakIsR0FBZ0M7SUFDaEMsSUFBQyxDQUFBLFNBQVMsQ0FBQyxLQUFNLENBQUEsQ0FBQSxHQUFJLENBQUEsR0FBSSxHQUFSLENBQWpCLEdBQWdDO0lBQ2hDLElBQUMsQ0FBQSxTQUFTLENBQUMsYUFBWCxDQUF5QixJQUFDLENBQUEsU0FBUyxDQUFDLFFBQXBDLEVBQThDLENBQTlDLEVBQWlELENBQWpELEVBQW9ELEdBQXBELEVBQXlELENBQXpELEVBQTRELElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBdkU7QUFIZTs7QUFNbkIsTUFBTSxDQUFBLFNBQUUsQ0FBQSxPQUFSLEdBQWtCLFNBQUMsSUFBRCxFQUFPLElBQVA7QUFDZCxRQUFBO0lBQUEsSUFBRyxJQUFBLEtBQVEsSUFBQyxDQUFBLEtBQVQsSUFBa0IsSUFBQSxLQUFRLElBQUMsQ0FBQSxLQUE5QjtRQUNJLE9BQUEsR0FBVSxJQUFDLENBQUE7UUFDWCxPQUFBLEdBQVUsSUFBQyxDQUFBO1FBQ1gsSUFBQyxDQUFBLEtBQUQsR0FBUztRQUNULElBQUMsQ0FBQSxLQUFELEdBQVM7UUFDVCxJQUFDLENBQUEsYUFBRCxDQUFlLElBQWYsRUFBcUIsSUFBckI7QUFDQSxlQUFPLEtBTlg7O1dBT0E7QUFSYzs7QUFVbEIsTUFBTSxDQUFBLFNBQUUsQ0FBQSxVQUFSLEdBQXFCLFNBQUMsTUFBRCxFQUFTLEVBQVQ7V0FDakIsSUFBQyxDQUFBLE9BQVEsQ0FBQSxNQUFBLENBQU8sQ0FBQyxnQkFBakIsQ0FBa0MsSUFBQyxDQUFBLGFBQW5DLEVBQWtELEVBQWxEO0FBRGlCOztBQUdyQixNQUFNLENBQUEsU0FBRSxDQUFBLFNBQVIsR0FBb0IsU0FBQTtBQUNoQixRQUFBO0lBQUEsSUFBQyxDQUFBLE1BQUQsR0FBVTtJQUNWLEdBQUEsR0FBTSxJQUFDLENBQUEsT0FBTyxDQUFDO0lBQ2YsQ0FBQSxHQUFJO0FBQ0osV0FBTSxDQUFBLEdBQUksR0FBVjtRQUNJLElBQUMsQ0FBQSxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBWixHQUFxQjtRQUNyQixDQUFBO0lBRko7QUFKZ0I7O0FBU3BCLE1BQU0sQ0FBQSxTQUFFLENBQUEsS0FBUixHQUFnQixTQUFDLElBQUQsRUFBTyxLQUFQLEVBQWMsR0FBZCxFQUFtQixTQUFuQixFQUE4QixTQUE5QixFQUF5QyxTQUF6QyxFQUFvRCxTQUFwRCxFQUErRCxRQUEvRDtJQUNaO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0FBVEEsUUFBQTtJQVVBLEVBQUEsR0FBSztJQUNMLEVBQUEsR0FBSyxJQUFJO0lBQ1QsSUFBQSxHQUFPLElBQUMsQ0FBQSxLQUFELEdBQVM7SUFDaEIsSUFBQSxHQUFPLElBQUMsQ0FBQSxLQUFELEdBQVM7SUFDaEIsSUFBRyxJQUFDLENBQUEsTUFBRCxLQUFXLENBQWQ7UUFDSSxDQUFBLEdBQUk7QUFDSixlQUFNLENBQUEsR0FBSSxJQUFDLENBQUEsV0FBWDtZQUNJLElBQUcsSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUF0QixLQUE0QixJQUEvQjtnQkFDSSxJQUFDLENBQUEsU0FBUyxDQUFDLGVBQVgsQ0FBMkIsSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUFoRDtnQkFDQSxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBaUIsSUFBQyxDQUFBLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBbEMsRUFBeUMsQ0FDckMsR0FEcUMsRUFFckMsR0FGcUMsRUFHckMsR0FIcUMsRUFJckMsR0FKcUMsQ0FBekMsRUFLRyxHQUxILEVBS1EsQ0FMUjtnQkFNQSxJQUFDLENBQUEsU0FBUyxDQUFDLGVBQVgsQ0FBMkIsSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUFoRDtnQkFDQSxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBaUIsSUFBQyxDQUFBLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBbEMsRUFBeUMsQ0FDckMsR0FEcUMsRUFFckMsR0FGcUMsRUFHckMsR0FIcUMsRUFJckMsR0FKcUMsQ0FBekMsRUFLRyxHQUxILEVBS1EsQ0FMUixFQVRKOztZQWVBLENBQUE7UUFoQko7UUFpQkEsQ0FBQSxHQUFJO0FBQ0osZUFBTSxDQUFBLEdBQUksSUFBQyxDQUFBLGVBQVg7WUFDSSxJQUFHLElBQUMsQ0FBQSxZQUFhLENBQUEsQ0FBQSxDQUFFLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBMUIsS0FBZ0MsSUFBbkM7Z0JBQ0ksSUFBQSxHQUFPO0FBQ1AsdUJBQU0sSUFBQSxHQUFPLENBQWI7b0JBQ0ksSUFBQyxDQUFBLFNBQVMsQ0FBQyxzQkFBWCxDQUFrQyxJQUFDLENBQUEsWUFBYSxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQTNELEVBQStELElBQS9EO29CQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsS0FBWCxDQUFpQixJQUFDLENBQUEsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFsQyxFQUF5QyxDQUNyQyxHQURxQyxFQUVyQyxHQUZxQyxFQUdyQyxHQUhxQyxFQUlyQyxHQUpxQyxDQUF6QyxFQUtHLEdBTEgsRUFLUSxDQUxSO29CQU1BLElBQUMsQ0FBQSxTQUFTLENBQUMsc0JBQVgsQ0FBa0MsSUFBQyxDQUFBLFlBQWEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUEzRCxFQUErRCxJQUEvRDtvQkFDQSxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQVgsQ0FBaUIsSUFBQyxDQUFBLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBbEMsRUFBeUMsQ0FDckMsR0FEcUMsRUFFckMsR0FGcUMsRUFHckMsR0FIcUMsRUFJckMsR0FKcUMsQ0FBekMsRUFLRyxHQUxILEVBS1EsQ0FMUjtvQkFNQSxJQUFBO2dCQWZKLENBRko7O1lBa0JBLENBQUE7UUFuQkosQ0FwQko7O0lBd0NBLEdBQUEsR0FBTSxJQUFDLENBQUEsT0FBTyxDQUFDO0lBRWYsQ0FBQSxHQUFJO0FBQ0osV0FBTSxDQUFBLEdBQUksR0FBVjtRQUNJLElBQUcsSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFaLEtBQXFCLFFBQXhCO1lBQ0ksQ0FBQTtBQUNBLHFCQUZKOztRQUdBLElBQUcsSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxRQUFaLEtBQXdCLElBQTNCO1lBQ0ksQ0FBQTtBQUNBLHFCQUZKOztRQUdBLFFBQUEsR0FBVyxtQkFBQSxDQUFvQixJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQVMsQ0FBQSxDQUFBLENBQXpDO1FBRVgsV0FBQSxHQUFjO1FBQ2QsQ0FBQSxHQUFJO0FBQ0osZUFBTSxDQUFBLEdBQUksR0FBVjtZQUNJLENBQUEsR0FBSTtBQUNKLG1CQUFNLENBQUEsR0FBSSxJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQU8sQ0FBQyxNQUE5QjtnQkFDSSxHQUFBLEdBQU0sSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFRLENBQUEsQ0FBQTtnQkFDMUIsSUFBRyxHQUFBLEtBQU8sSUFBUCxJQUFnQixHQUFHLENBQUMsS0FBSyxDQUFDLEtBQVYsS0FBbUIsUUFBbkMsSUFBZ0QsR0FBRyxDQUFDLEVBQUosS0FBVSxRQUExRCxJQUF1RSxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFuQixLQUE2QixRQUF2RztvQkFDSSxXQUFBLEdBQWM7QUFDZCwwQkFGSjs7Z0JBR0EsQ0FBQTtZQUxKO1lBTUEsQ0FBQTtRQVJKO1FBU0EsSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFaLENBQWtCLEVBQWxCLEVBQXNCLEVBQXRCLEVBQTBCLElBQTFCLEVBQWdDLEtBQWhDLEVBQXVDLEdBQXZDLEVBQTRDLFNBQTVDLEVBQXVELFNBQXZELEVBQWtFLFNBQWxFLEVBQTZFLFNBQTdFLEVBQXdGLElBQXhGLEVBQThGLElBQTlGLEVBQW9HLFFBQXBHLEVBQThHLFFBQTlHLEVBQXdILFdBQXhILEVBQXFJLElBQUMsQ0FBQSxRQUF0SSxFQUFnSixJQUFDLENBQUEsWUFBakosRUFBK0osSUFBQyxDQUFBLFNBQWhLLEVBQTJLLElBQTNLO1FBQ0EsQ0FBQTtJQXJCSjtJQXVCQSxDQUFBLEdBQUk7QUFDSixXQUFNLENBQUEsR0FBSSxHQUFWO1FBQ0ksSUFBRyxJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQVosS0FBcUIsU0FBeEI7WUFDSSxDQUFBO0FBQ0EscUJBRko7O1FBR0EsSUFBRyxJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQVosS0FBd0IsSUFBM0I7WUFDSSxDQUFBO0FBQ0EscUJBRko7O1FBR0EsUUFBQSxHQUFXO1FBR1gsV0FBQSxHQUFjO1FBQ2QsQ0FBQSxHQUFJO0FBQ0osZUFBTSxDQUFBLEdBQUksR0FBVjtZQUNJLENBQUEsR0FBSTtBQUNKLG1CQUFNLENBQUEsR0FBSSxJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQU8sQ0FBQyxNQUE5QjtnQkFDSSxHQUFBLEdBQU0sSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFRLENBQUEsQ0FBQTtnQkFDMUIsSUFBRyxHQUFBLEtBQU8sSUFBUCxJQUFnQixHQUFHLENBQUMsS0FBSyxDQUFDLEtBQVYsS0FBbUIsU0FBdEM7b0JBQ0ksSUFBRyx5QkFBQSxDQUEwQixHQUFHLENBQUMsS0FBSyxDQUFDLEdBQXBDLENBQUEsS0FBNEMsQ0FBNUMsSUFBa0QsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBbkIsS0FBNkIsUUFBbEY7d0JBQ0ksV0FBQSxHQUFjO0FBQ2QsOEJBRko7cUJBREo7O2dCQUlBLENBQUE7WUFOSjtZQU9BLENBQUE7UUFUSjtRQVVBLElBQUMsQ0FBQSxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBWixDQUFrQixFQUFsQixFQUFzQixFQUF0QixFQUEwQixJQUExQixFQUFnQyxLQUFoQyxFQUF1QyxHQUF2QyxFQUE0QyxTQUE1QyxFQUF1RCxTQUF2RCxFQUFrRSxTQUFsRSxFQUE2RSxTQUE3RSxFQUF3RixJQUF4RixFQUE4RixJQUE5RixFQUFvRyxRQUFwRyxFQUE4RyxRQUE5RyxFQUF3SCxXQUF4SCxFQUFxSSxJQUFDLENBQUEsUUFBdEksRUFBZ0osSUFBQyxDQUFBLFlBQWpKLEVBQStKLElBQUMsQ0FBQSxTQUFoSyxFQUEySyxJQUEzSztRQUNBLENBQUE7SUF2Qko7SUF5QkEsQ0FBQSxHQUFJO0FBQ0osV0FBTSxDQUFBLEdBQUksR0FBVjtRQUNJLElBQUcsSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFaLEtBQXFCLE9BQXhCO1lBQ0ksQ0FBQTtBQUNBLHFCQUZKOztRQUdBLElBQUcsSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxRQUFaLEtBQXdCLElBQTNCO1lBQ0ksQ0FBQTtBQUNBLHFCQUZKOztRQUdBLElBQUMsQ0FBQSxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBWixDQUFrQixFQUFsQixFQUFzQixFQUF0QixFQUEwQixJQUExQixFQUFnQyxLQUFoQyxFQUF1QyxHQUF2QyxFQUE0QyxTQUE1QyxFQUF1RCxTQUF2RCxFQUFrRSxTQUFsRSxFQUE2RSxTQUE3RSxFQUF3RixJQUF4RixFQUE4RixJQUE5RixFQUFvRyxRQUFwRyxFQUE4RyxJQUE5RyxFQUFvSCxLQUFwSCxFQUEySCxJQUFDLENBQUEsUUFBNUgsRUFBc0ksSUFBQyxDQUFBLFlBQXZJLEVBQXFKLElBQUMsQ0FBQSxTQUF0SixFQUFpSyxJQUFqSztRQUNBLENBQUE7SUFSSjtJQVVBLENBQUEsR0FBSTtBQUNKLFdBQU0sQ0FBQSxHQUFJLEdBQVY7UUFDSSxJQUFDLENBQUEsU0FBUyxDQUFDLEtBQU0sQ0FBQSxDQUFBLEdBQUksQ0FBQSxHQUFJLEdBQVIsQ0FBakIsR0FBZ0M7UUFDaEMsQ0FBQTtJQUZKO0lBR0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxhQUFYLENBQXlCLElBQUMsQ0FBQSxTQUFTLENBQUMsUUFBcEMsRUFBOEMsQ0FBOUMsRUFBaUQsQ0FBakQsRUFBb0QsR0FBcEQsRUFBeUQsQ0FBekQsRUFBNEQsSUFBQyxDQUFBLFNBQVMsQ0FBQyxLQUF2RTtJQUNBLElBQUMsQ0FBQSxNQUFEO0FBM0hZOztBQThIaEIsTUFBTSxDQUFBLFNBQUUsQ0FBQSxTQUFSLEdBQW9CLFNBQUMsVUFBRCxFQUFhLE1BQWI7QUFDaEIsUUFBQTtJQUFBLGlCQUFBLEdBQW9CO0lBQ3BCLENBQUEsR0FBSTtBQUNKLFdBQU0sQ0FBQSxHQUFJLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBbkI7UUFDSSxJQUFHLElBQUMsQ0FBQSxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBWixLQUFxQixRQUF4QjtZQUNJLGlCQUFpQixDQUFDLElBQWxCLENBQXVCLElBQUMsQ0FBQSxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBbkMsRUFESjs7UUFFQSxDQUFBO0lBSEo7V0FJQSxJQUFDLENBQUEsT0FBUSxDQUFBLE1BQUEsQ0FBTyxDQUFDLFNBQWpCLENBQTJCLFVBQTNCLEVBQXVDLGlCQUF2QztBQVBnQjs7QUFTcEIsTUFBTSxDQUFBLFNBQUUsQ0FBQSxZQUFSLEdBQXVCLFNBQUE7V0FDbkIsSUFBQyxDQUFBLE9BQU8sQ0FBQztBQURVOztBQUd2QixNQUFNLENBQUEsU0FBRSxDQUFBLFlBQVIsR0FBdUIsU0FBQyxRQUFEO0FBQ25CLFFBQUE7SUFBQSxFQUFBLEdBQUs7SUFDTCxDQUFBLEdBQUk7QUFDSixXQUFNLENBQUEsR0FBSSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQW5CO1FBQ0ksSUFBRyxJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQVosS0FBcUIsUUFBeEI7WUFDSSxFQUFBLEdBREo7O1FBRUEsQ0FBQTtJQUhKO1dBSUE7QUFQbUI7O0FBU3ZCLE1BQU0sQ0FBQSxTQUFFLENBQUEsV0FBUixHQUFzQixTQUFDLEVBQUQ7V0FDbEIsSUFBQyxDQUFBLE9BQVEsQ0FBQSxFQUFBLENBQUcsQ0FBQztBQURLOztBQUd0QixNQUFNLENBQUEsU0FBRSxDQUFBLFdBQVIsR0FBc0IsU0FBQyxFQUFEO1dBQ2xCLElBQUMsQ0FBQSxPQUFRLENBQUEsRUFBQSxDQUFHLENBQUM7QUFESzs7QUFHdEIsTUFBTSxDQUFBLFNBQUUsQ0FBQSxhQUFSLEdBQXdCLFNBQUMsTUFBRDtBQUNwQixRQUFBO0lBQUEsU0FBQSxHQUFZLE1BQU0sQ0FBQztJQUNuQixJQUFHLFNBQUEsR0FBWSxDQUFaLElBQWlCLFNBQUEsR0FBWSxJQUFDLENBQUEsVUFBakM7QUFDSSxlQUFPO1lBQ0gsT0FBQSxFQUFTLElBRE47WUFFSCxNQUFBLEVBQVEsaURBRkw7WUFHSCxPQUFBLEVBQVMsSUFITjtVQURYOztJQU1BLEdBQUEsR0FBTTtJQUNOLEdBQUcsQ0FBQyxPQUFKLEdBQWM7SUFDZCxDQUFBLEdBQUk7QUFDSixXQUFNLENBQUEsR0FBSSxTQUFWO1FBQ0ksS0FBQSxHQUFRLE1BQU8sQ0FBQSxDQUFBO1FBQ2YsSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLENBQVQsR0FBYyxJQUFJLElBQUosQ0FBUyxJQUFDLENBQUEsU0FBVixFQUFxQixJQUFDLENBQUEsU0FBdEIsRUFBaUMsSUFBakMsRUFBdUMsS0FBdkMsRUFBOEMsSUFBQyxDQUFBLFNBQS9DLEVBQTBELElBQUMsQ0FBQSxpQkFBM0QsRUFBOEUsQ0FBOUUsRUFBaUYsSUFBakY7UUFDZCxTQUFBLEdBQVksS0FBSyxDQUFDLE1BQU0sQ0FBQztRQUN6QixDQUFBLEdBQUk7QUFDSixlQUFNLENBQUEsR0FBSSxDQUFWO1lBQ0ksSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxVQUFaLENBQXVCLElBQXZCLEVBQTZCLENBQTdCLEVBQWdDLElBQWhDLEVBQXNDLElBQXRDLEVBQTRDLElBQTVDO1lBQ0EsQ0FBQTtRQUZKO1FBR0EsQ0FBQSxHQUFJO0FBQ0osZUFBTSxDQUFBLEdBQUksU0FBVjtZQUNJLEdBQUEsR0FBTSxLQUFLLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDO1lBQ3RCLElBQUEsR0FBTyxLQUFLLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDO1lBQ3ZCLEdBQUEsR0FBTSxLQUFLLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDO1lBQ3RCLElBQUEsR0FBTyxLQUFLLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDO1lBQ3ZCLElBQUEsR0FBTyxLQUFLLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDO1lBQ3ZCLElBQUEsR0FBTyxLQUFLLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDO1lBQ3ZCLElBQUMsQ0FBQSxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsVUFBWixDQUF1QixJQUFDLENBQUEsYUFBeEIsRUFBdUMsR0FBdkMsRUFBNEM7Z0JBQ3hDLEtBQUEsRUFBTyxJQURpQztnQkFFeEMsR0FBQSxFQUFLLEdBRm1DO2dCQUd4QyxJQUFBLEVBQU0sSUFIa0M7Z0JBSXhDLFFBQUEsRUFBVSxJQUo4QjtnQkFLeEMsV0FBQSxFQUFhLElBTDJCO2FBQTVDLEVBTUcsSUFBQyxDQUFBLFFBTkosRUFNYyxJQUFDLENBQUEsWUFOZixFQU02QixJQUFDLENBQUEsU0FOOUI7WUFPQSxDQUFBO1FBZEo7UUFlQSxDQUFBLEdBQUk7QUFDSixlQUFNLENBQUEsR0FBSSxDQUFWO1lBQ0ksSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxVQUFaLENBQXVCLENBQXZCLEVBQTBCLElBQTFCO1lBQ0EsQ0FBQTtRQUZKO1FBR0EsVUFBQSxHQUFhLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDM0IsQ0FBQSxHQUFJO0FBQ0osZUFBTSxDQUFBLEdBQUksVUFBVjtZQUNJLFFBQUEsR0FBVyxLQUFLLENBQUMsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDO1lBQzVCLFFBQUEsR0FBVyxLQUFLLENBQUMsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDO1lBQzVCLElBQUMsQ0FBQSxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsVUFBWixDQUF1QixRQUF2QixFQUFpQyxRQUFqQztZQUNBLENBQUE7UUFKSjtRQU1BLFNBQUEsR0FBWTtRQUNaLElBQUcsS0FBSyxDQUFDLElBQU4sS0FBYyxRQUFqQjtZQUNJLFNBQUEsR0FBWSxTQURoQjs7UUFFQSxJQUFHLEtBQUssQ0FBQyxJQUFOLEtBQWMsT0FBakI7WUFDSSxTQUFBLEdBQVksUUFEaEI7O1FBRUEsSUFBRyxLQUFLLENBQUMsSUFBTixLQUFjLFFBQWpCO1lBQ0ksU0FBQSxHQUFZLFNBQUEsR0FBWSxNQUFNLENBQUMsWUFBUCxDQUFvQixFQUFBLEdBQUssbUJBQUEsQ0FBb0IsSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxRQUFTLENBQUEsQ0FBQSxDQUF6QyxDQUF6QixFQUQ1Qjs7UUFFQSxJQUFHLEtBQUssQ0FBQyxJQUFOLEtBQWMsU0FBakI7WUFDSSxTQUFBLEdBQVksU0FEaEI7O1FBR0EsSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFaLENBQW1CLEtBQUssQ0FBQyxJQUF6QixFQUErQixTQUEvQixFQUEwQyxJQUFDLENBQUEsYUFBM0M7UUFDQSxDQUFBO0lBL0NKO0lBZ0RBLEVBQUEsR0FBSztBQUNMLFdBQU0sRUFBQSxHQUFLLENBQVg7UUFDSSxDQUFBLEdBQUk7QUFDSixlQUFNLENBQUEsR0FBSSxTQUFWO1lBQ0ksS0FBQSxHQUFRLE1BQU8sQ0FBQSxDQUFBO1lBQ2YsSUFBRyxFQUFBLEtBQU0sQ0FBTixJQUFZLEtBQUssQ0FBQyxJQUFOLEtBQWMsUUFBN0I7Z0JBQ0ksQ0FBQTtBQUNBLHlCQUZKOztZQUdBLElBQUcsRUFBQSxLQUFNLENBQU4sSUFBWSxLQUFLLENBQUMsSUFBTixLQUFjLFFBQTdCO2dCQUNJLENBQUE7QUFDQSx5QkFGSjs7WUFHQSxJQUFHLEVBQUEsS0FBTSxDQUFOLElBQVksS0FBSyxDQUFDLElBQU4sS0FBYyxPQUE3QjtnQkFDSSxDQUFBO0FBQ0EseUJBRko7O1lBR0EsSUFBRyxFQUFBLEtBQU0sQ0FBTixJQUFZLEtBQUssQ0FBQyxJQUFOLEtBQWMsU0FBN0I7Z0JBQ0ksQ0FBQTtBQUNBLHlCQUZKOztZQUdBLFNBQUEsR0FBWSxLQUFLLENBQUM7WUFDbEIsTUFBQSxHQUFTLElBQUMsQ0FBQSxTQUFELENBQVcsU0FBWCxFQUFzQixDQUF0QjtZQUNULElBQUcsTUFBQSxLQUFVLElBQWI7Z0JBQ0ksR0FBRyxDQUFDLE9BQUosR0FBYztnQkFDZCxHQUFJLENBQUEsQ0FBQSxDQUFKLEdBQ0k7b0JBQUEsT0FBQSxFQUFTLElBQVQ7b0JBQ0EsTUFBQSxFQUFRLE1BRFI7b0JBRUEsT0FBQSxFQUFTLFNBRlQ7a0JBSFI7YUFBQSxNQUFBO2dCQU9JLEdBQUksQ0FBQSxDQUFBLENBQUosR0FDSTtvQkFBQSxPQUFBLEVBQVMsS0FBVDtvQkFDQSxNQUFBLEVBQVEsSUFEUjtvQkFFQSxPQUFBLEVBQVMsU0FGVDtrQkFSUjs7WUFXQSxDQUFBO1FBM0JKO1FBNEJBLEVBQUE7SUE5Qko7V0ErQkE7QUEzRm9COztBQTZGeEIsTUFBTSxDQUFBLFNBQUUsQ0FBQSxrQkFBUixHQUE2QixTQUFDLEVBQUQ7V0FDekIsSUFBQyxDQUFBLE9BQVEsQ0FBQSxFQUFBLENBQUcsQ0FBQyxrQkFBYixDQUFBO0FBRHlCOztBQUc3QixNQUFNLENBQUEsU0FBRSxDQUFBLFdBQVIsR0FBc0IsU0FBQyxFQUFEO0lBQ2xCLElBQUMsQ0FBQSxPQUFRLENBQUEsRUFBQSxDQUFHLENBQUMsT0FBYixDQUFxQixJQUFDLENBQUEsYUFBdEI7SUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLE1BQVQsQ0FBZ0IsRUFBaEIsRUFBb0IsQ0FBcEI7QUFGa0I7O0FBS3RCLE1BQU0sQ0FBQSxTQUFFLENBQUEsT0FBUixHQUFrQixTQUFDLFFBQUQsRUFBVyxRQUFYO0FBQ2QsUUFBQTtJQUFBLFNBQUEsR0FBWTtJQUNaLElBQUcsUUFBQSxLQUFZLFFBQWY7UUFDSSxTQUFBLEdBQVksd0dBRGhCOztJQUVBLElBQUcsUUFBQSxLQUFZLFFBQWY7UUFDSSxTQUFBLEdBQVksOERBRGhCOztJQUVBLElBQUcsUUFBQSxLQUFZLFNBQWY7UUFDSSxTQUFBLEdBQVksK05BRGhCOztJQUVBLEVBQUEsR0FBSyxJQUFDLENBQUEsWUFBRCxDQUFBO0lBQ0wsSUFBQyxDQUFBLE9BQVEsQ0FBQSxFQUFBLENBQVQsR0FBZSxJQUFJLElBQUosQ0FBUyxJQUFDLENBQUEsU0FBVixFQUFxQixJQUFDLENBQUEsU0FBdEIsRUFBaUMsSUFBakMsRUFBdUMsS0FBdkMsRUFBOEMsSUFBQyxDQUFBLFNBQS9DLEVBQTBELElBQUMsQ0FBQSxpQkFBM0QsRUFBOEUsRUFBOUUsRUFBa0YsSUFBbEY7SUFDZixJQUFDLENBQUEsT0FBUSxDQUFBLEVBQUEsQ0FBRyxDQUFDLE1BQWIsQ0FBb0IsUUFBcEIsRUFBOEIsUUFBOUIsRUFBd0MsSUFBQyxDQUFBLGFBQXpDO0lBQ0EsR0FBQSxHQUFNLElBQUMsQ0FBQSxTQUFELENBQVcsU0FBWCxFQUFzQixFQUF0QjtXQUVOO1FBQUEsR0FBQSxFQUFLLEVBQUw7UUFDQSxPQUFBLEVBQVMsU0FEVDtRQUVBLE1BQUEsRUFBUSxHQUZSOztBQWJjOztBQW1CbEIsTUFBTSxDQUFBLFNBQUUsQ0FBQSxnQkFBUixHQUEyQixTQUFDLFFBQUQ7QUFDdkIsUUFBQTtJQUFBLENBQUEsR0FBSTtBQUNKLFdBQU0sQ0FBQSxHQUFJLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBbkI7UUFDSSxJQUFHLElBQUMsQ0FBQSxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBWixLQUFxQixRQUF4QjtZQUNJLENBQUE7QUFDQSxxQkFGSjs7UUFHQSxJQUFHLElBQUMsQ0FBQSxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsUUFBUyxDQUFBLENBQUEsQ0FBckIsS0FBMkIsbUJBQUEsQ0FBb0IsUUFBcEIsQ0FBOUI7QUFDSSxtQkFBTyxLQURYOztRQUVBLENBQUE7SUFOSjtXQU9BO0FBVHVCOztBQVczQixNQUFNLENBQUEsU0FBRSxDQUFBLFlBQVIsR0FBdUIsU0FBQTtJQUNuQjtBQUFBLFFBQUE7SUFDQSxNQUFBLEdBQVM7SUFDVCxNQUFNLENBQUMsR0FBUCxHQUFhO0lBQ2IsTUFBTSxDQUFDLFVBQVAsR0FBb0I7SUFDcEIsU0FBQSxHQUFZLElBQUMsQ0FBQSxPQUFPLENBQUM7SUFDckIsQ0FBQSxHQUFJO0FBQ0osV0FBTSxDQUFBLEdBQUksU0FBVjtRQUNJLE1BQU0sQ0FBQyxVQUFXLENBQUEsQ0FBQSxDQUFsQixHQUF1QjtRQUN2QixNQUFNLENBQUMsVUFBVyxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQXJCLEdBQStCLElBQUk7UUFDbkMsQ0FBQSxHQUFJO0FBQ0osZUFBTSxDQUFBLEdBQUksQ0FBVjtZQUNJLFFBQUEsR0FBVyxJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLFFBQVMsQ0FBQSxDQUFBO1lBQ2hDLElBQUcsUUFBQSxLQUFZLElBQWY7Z0JBQ0ksQ0FBQTtBQUNBLHlCQUZKOztZQUdBLE1BQU0sQ0FBQyxVQUFXLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBTyxDQUFDLElBQTdCLENBQ0k7Z0JBQUEsT0FBQSxFQUFTLENBQVQ7Z0JBQ0EsRUFBQSxFQUFJLFFBREo7YUFESjtZQUdBLENBQUE7UUFSSjtRQVNBLE1BQU0sQ0FBQyxVQUFXLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBckIsR0FBOEIsSUFBSTtRQUNsQyxDQUFBLEdBQUk7QUFDSixlQUFNLENBQUEsR0FBSSxDQUFWO1lBQ0ksSUFBRyxJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQXBCLEtBQTBCLElBQTdCO2dCQUNJLENBQUE7QUFDQSx5QkFGSjs7WUFHQSxNQUFNLENBQUMsVUFBVyxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQU0sQ0FBQyxJQUE1QixDQUNJO2dCQUFBLE9BQUEsRUFBUyxDQUFUO2dCQUNBLElBQUEsRUFBTSxJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFLLENBQUMsS0FEbkM7Z0JBRUEsRUFBQSxFQUFJLElBQUMsQ0FBQSxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLEtBQUssQ0FBQyxHQUZqQztnQkFHQSxRQUFBLEVBQVUsSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBSyxDQUFDLElBSHZDO2dCQUlBLE9BQUEsRUFBUyxJQUFDLENBQUEsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFLLENBQUMsUUFKdEM7YUFESjtZQU1BLENBQUE7UUFWSjtRQVdBLE1BQU0sQ0FBQyxVQUFXLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBckIsR0FBNEIsSUFBQyxDQUFBLE9BQVEsQ0FBQSxDQUFBLENBQUUsQ0FBQztRQUN4QyxNQUFNLENBQUMsVUFBVyxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQXJCLEdBQTRCLElBQUMsQ0FBQSxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUM7UUFDeEMsTUFBTSxDQUFDLFVBQVcsQ0FBQSxDQUFBLENBQUUsQ0FBQyxXQUFyQixHQUFtQztRQUNuQyxNQUFNLENBQUMsVUFBVyxDQUFBLENBQUEsQ0FBRSxDQUFDLElBQXJCLEdBQTRCLElBQUMsQ0FBQSxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUM7UUFDeEMsQ0FBQTtJQTlCSjtJQStCQSxNQUFNLENBQUMsS0FBUCxHQUFlLElBQUMsQ0FBQSxTQUFELENBQUE7V0FDZjtBQXZDbUI7O0FBeUN2QixNQUFNLENBQUEsU0FBRSxDQUFBLFNBQVIsR0FBb0IsU0FBQTtBQUNoQixRQUFBO0lBQUEsWUFBQSxHQUFlO0lBQ2YsYUFBQSxHQUFnQjtJQUNoQixTQUFBLEdBQVksSUFBQyxDQUFBLE9BQU8sQ0FBQztJQUNyQixDQUFBLEdBQUk7QUFDSixXQUFNLENBQUEsR0FBSSxTQUFWO1FBQ0ksSUFBQSxHQUFPLElBQUMsQ0FBQSxPQUFRLENBQUEsQ0FBQTtRQUNoQixJQUFHLElBQUksQ0FBQyxLQUFMLEtBQWMsUUFBakI7WUFDSSxhQUFBLEdBQWdCLEtBRHBCOztRQUVBLENBQUEsR0FBSTtBQUNKLGVBQU0sQ0FBQSxHQUFJLENBQVY7WUFDSSxJQUFHLElBQUksQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUFiLEtBQW1CLElBQXRCO2dCQUNJLENBQUE7QUFDQSx5QkFGSjs7WUFHQSxJQUFHLElBQUksQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsS0FBSyxDQUFDLEtBQXRCLEtBQStCLFVBQWxDO2dCQUNJLFlBQUEsR0FBZSxLQURuQjs7WUFFQSxDQUFBO1FBTko7UUFPQSxDQUFBO0lBWko7V0FhQTtRQUNJLGFBQUEsRUFBZSxZQURuQjtRQUVJLGNBQUEsRUFBZ0IsYUFGcEI7O0FBbEJnQiIsInNvdXJjZXNDb250ZW50IjpbIiMgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAwMDAwMDAgICAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuIyAwMDAwMDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgXG5cbkVmZmVjdCA9IChnbCwgeHJlcywgeXJlcywgb2JqKSAtPlxuICAgIEBtQ3JlYXRlZCA9IGZhbHNlXG4gICAgQG1SZW5kZXJlciA9IG51bGxcbiAgICBAbUdMQ29udGV4dCA9IGdsXG4gICAgQG1YcmVzID0geHJlc1xuICAgIEBtWXJlcyA9IHlyZXNcbiAgICBAbUdhaW5Ob2RlID0gbnVsbFxuICAgIEBtUGFzc2VzID0gW11cbiAgICBAbUZyYW1lID0gMFxuICAgIEBtTWF4QnVmZmVycyA9IDRcbiAgICBAbU1heEN1YmVCdWZmZXJzID0gMVxuICAgIEBtTWF4UGFzc2VzID0gQG1NYXhCdWZmZXJzICsgM1xuICAgIEBtQnVmZmVycyA9IFtdXG4gICAgQG1DdWJlQnVmZmVycyA9IFtdXG4gICAgQG1TY3JlZW5zaG90U3l0ZW0gPSBudWxsXG4gICAgQG1Jc0xvd0VuZCA9IGZhbHNlXG4gICAgaWYgZ2wgPT0gbnVsbFxuICAgICAgICByZXR1cm5cbiAgICBAbVJlbmRlcmVyID0gcGlSZW5kZXJlcigpXG4gICAgaWYgIUBtUmVuZGVyZXIuSW5pdGlhbGl6ZShnbClcbiAgICAgICAgcmV0dXJuXG4gICAgdnNTb3VyY2VDID0gdW5kZWZpbmVkXG4gICAgZnNTb3VyY2VDID0gdW5kZWZpbmVkXG4gICAgdnNTb3VyY2VDID0gJ2xheW91dChsb2NhdGlvbiA9IDApIGluIHZlYzIgcG9zOyB2b2lkIG1haW4oKSB7IGdsX1Bvc2l0aW9uID0gdmVjNChwb3MueHksMC4wLDEuMCk7IH0nXG4gICAgZnNTb3VyY2VDID0gJ3VuaWZvcm0gdmVjNCB2OyB1bmlmb3JtIHNhbXBsZXIyRCB0OyBvdXQgdmVjNCBvdXRDb2xvcjsgdm9pZCBtYWluKCkgeyBvdXRDb2xvciA9IHRleHR1cmVMb2QodCwgZ2xfRnJhZ0Nvb3JkLnh5IC8gdi56dywgMC4wKTsgfSdcbiAgICByZXMgPSBAbVJlbmRlcmVyLkNyZWF0ZVNoYWRlcih2c1NvdXJjZUMsIGZzU291cmNlQylcbiAgICBpZiByZXMubVJlc3VsdCA9PSBmYWxzZVxuICAgICAgICBjb25zb2xlLmxvZyAnRmFpbGVkIHRvIGNvbXBpbGUgc2hhZGVyIHRvIGNvcHkgYnVmZmVycyA6ICcgKyByZXMubUluZm9cbiAgICAgICAgcmV0dXJuXG4gICAgQG1Qcm9ncmFtQ29weSA9IHJlc1xuICAgIHZzU291cmNlRCA9IHVuZGVmaW5lZFxuICAgIGZzU291cmNlRCA9IHVuZGVmaW5lZFxuICAgIHZzU291cmNlRCA9ICdsYXlvdXQobG9jYXRpb24gPSAwKSBpbiB2ZWMyIHBvczsgdm9pZCBtYWluKCkgeyBnbF9Qb3NpdGlvbiA9IHZlYzQocG9zLnh5LDAuMCwxLjApOyB9J1xuICAgIGZzU291cmNlRCA9ICd1bmlmb3JtIHZlYzQgdjsgdW5pZm9ybSBzYW1wbGVyMkQgdDsgb3V0IHZlYzQgb3V0Q29sb3I7IHZvaWQgbWFpbigpIHsgdmVjMiB1diA9IGdsX0ZyYWdDb29yZC54eSAvIHYuenc7IG91dENvbG9yID0gdGV4dHVyZSh0LCB2ZWMyKHV2LngsMS4wLXV2LnkpKTsgfSdcbiAgICByZXMgPSBAbVJlbmRlcmVyLkNyZWF0ZVNoYWRlcih2c1NvdXJjZUQsIGZzU291cmNlRClcbiAgICBpZiByZXMubVJlc3VsdCA9PSBmYWxzZVxuICAgICAgICBjb25zb2xlLmxvZyAnRmFpbGVkIHRvIGNvbXBpbGUgc2hhZGVyIHRvIGRvd25zY2FsZSBidWZmZXJzIDogJyArIHJlc1xuICAgICAgICByZXR1cm5cbiAgICBAbVByb2dyYW1Eb3duc2NhbGUgPSByZXNcbiAgICAjIHNldCBhbGwgYnVmZmVycyBhbmQgY3ViZW1hcHMgdG8gbnVsbFxuICAgIGkgPSAwXG4gICAgd2hpbGUgaSA8IEBtTWF4QnVmZmVyc1xuICAgICAgICBAbUJ1ZmZlcnNbaV0gPVxuICAgICAgICAgICAgbVRleHR1cmU6IFtcbiAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgbVRhcmdldDogW1xuICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBtUmVzb2x1dGlvbjogW1xuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBtTGFzdFJlbmRlckRvbmU6IDBcbiAgICAgICAgICAgIG1UaHVtYm5haWxSZW5kZXJUYXJnZXQ6IG51bGxcbiAgICAgICAgICAgIG1UaHVtYm5haWxUZXh0dXJlOiBudWxsXG4gICAgICAgICAgICBtVGh1bWJuYWlsQnVmZmVyOiBudWxsXG4gICAgICAgICAgICBtVGh1bWJuYWlsUmVzOiBbXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgIF1cbiAgICAgICAgaSsrXG4gICAgaSA9IDBcbiAgICB3aGlsZSBpIDwgQG1NYXhDdWJlQnVmZmVyc1xuICAgICAgICBAbUN1YmVCdWZmZXJzW2ldID1cbiAgICAgICAgICAgIG1UZXh0dXJlOiBbXG4gICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICAgICAgICAgIG51bGxcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIG1UYXJnZXQ6IFtcbiAgICAgICAgICAgICAgICBudWxsXG4gICAgICAgICAgICAgICAgbnVsbFxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgbVJlc29sdXRpb246IFtcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgbUxhc3RSZW5kZXJEb25lOiAwXG4gICAgICAgICAgICBtVGh1bWJuYWlsUmVuZGVyVGFyZ2V0OiBudWxsXG4gICAgICAgICAgICBtVGh1bWJuYWlsVGV4dHVyZTogbnVsbFxuICAgICAgICAgICAgbVRodW1ibmFpbEJ1ZmZlcjogbnVsbFxuICAgICAgICAgICAgbVRodW1ibmFpbFJlczogW1xuICAgICAgICAgICAgICAgIDBcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdXG4gICAgICAgIGkrK1xuICAgIGtleWJvYXJkRGF0YSA9IG5ldyBVaW50OEFycmF5KDI1NiAqIDMpXG4gICAgaiA9IDBcbiAgICB3aGlsZSBqIDwgMjU2ICogM1xuICAgICAgICBrZXlib2FyZERhdGFbal0gPSAwXG4gICAgICAgIGorK1xuICAgIGtheWJvYXJkVGV4dHVyZSA9IEBtUmVuZGVyZXIuQ3JlYXRlVGV4dHVyZShAbVJlbmRlcmVyLlRFWFRZUEUuVDJELCAyNTYsIDMsIEBtUmVuZGVyZXIuVEVYRk1ULkMxSTgsIEBtUmVuZGVyZXIuRklMVEVSLk5PTkUsIEBtUmVuZGVyZXIuVEVYV1JQLkNMQU1QLCBudWxsKVxuICAgIGtleWJvYXJkSW1hZ2UgPSBuZXcgSW1hZ2VcbiAgICBAbUtleWJvYXJkID1cbiAgICAgICAgbURhdGE6IGtleWJvYXJkRGF0YVxuICAgICAgICBtVGV4dHVyZToga2F5Ym9hcmRUZXh0dXJlXG4gICAgICAgIG1JY29uOiBrZXlib2FyZEltYWdlXG4gICAgQG1DcmVhdGVkID0gdHJ1ZVxuICAgIHJldHVyblxuXG5FZmZlY3Q6OlJlc2l6ZUN1YmVtYXBCdWZmZXIgPSAoaSwgeHJlcywgeXJlcykgLT5cbiAgICBvbGRYcmVzID0gQG1DdWJlQnVmZmVyc1tpXS5tUmVzb2x1dGlvblswXVxuICAgIG9sZFlyZXMgPSBAbUN1YmVCdWZmZXJzW2ldLm1SZXNvbHV0aW9uWzFdXG4gICAgaWYgQG1DdWJlQnVmZmVyc1tpXS5tVGV4dHVyZVswXSA9PSBudWxsIG9yIG9sZFhyZXMgIT0geHJlcyBvciBvbGRZcmVzICE9IHlyZXNcbiAgICAgICAgdGV4dHVyZTEgPSBAbVJlbmRlcmVyLkNyZWF0ZVRleHR1cmUoQG1SZW5kZXJlci5URVhUWVBFLkNVQkVNQVAsIHhyZXMsIHlyZXMsIEBtUmVuZGVyZXIuVEVYRk1ULkM0RjE2LCBAbVJlbmRlcmVyLkZJTFRFUi5MSU5FQVIsIEBtUmVuZGVyZXIuVEVYV1JQLkNMQU1QLCBudWxsKVxuICAgICAgICB0YXJnZXQxID0gQG1SZW5kZXJlci5DcmVhdGVSZW5kZXJUYXJnZXRDdWJlTWFwKHRleHR1cmUxLCBudWxsLCBmYWxzZSlcbiAgICAgICAgdGV4dHVyZTIgPSBAbVJlbmRlcmVyLkNyZWF0ZVRleHR1cmUoQG1SZW5kZXJlci5URVhUWVBFLkNVQkVNQVAsIHhyZXMsIHlyZXMsIEBtUmVuZGVyZXIuVEVYRk1ULkM0RjE2LCBAbVJlbmRlcmVyLkZJTFRFUi5MSU5FQVIsIEBtUmVuZGVyZXIuVEVYV1JQLkNMQU1QLCBudWxsKVxuICAgICAgICB0YXJnZXQyID0gQG1SZW5kZXJlci5DcmVhdGVSZW5kZXJUYXJnZXRDdWJlTWFwKHRleHR1cmUyLCBudWxsLCBmYWxzZSlcbiAgICAgICAgIyBTdG9yZSBuZXcgYnVmZmVyc1xuICAgICAgICBAbUN1YmVCdWZmZXJzW2ldLm1UZXh0dXJlID0gW1xuICAgICAgICAgICAgdGV4dHVyZTFcbiAgICAgICAgICAgIHRleHR1cmUyXG4gICAgICAgIF1cbiAgICAgICAgQG1DdWJlQnVmZmVyc1tpXS5tVGFyZ2V0ID0gW1xuICAgICAgICAgICAgdGFyZ2V0MVxuICAgICAgICAgICAgdGFyZ2V0MlxuICAgICAgICBdXG4gICAgICAgIEBtQ3ViZUJ1ZmZlcnNbaV0ubUxhc3RSZW5kZXJEb25lID0gMFxuICAgICAgICBAbUN1YmVCdWZmZXJzW2ldLm1SZXNvbHV0aW9uWzBdID0geHJlc1xuICAgICAgICBAbUN1YmVCdWZmZXJzW2ldLm1SZXNvbHV0aW9uWzFdID0geXJlc1xuICAgIHJldHVyblxuXG5FZmZlY3Q6OlJlc2l6ZUJ1ZmZlciA9IChpLCB4cmVzLCB5cmVzLCBza2lwSWZOb3RFeGlzdHMpIC0+XG4gICAgaWYgc2tpcElmTm90RXhpc3RzIGFuZCBAbUJ1ZmZlcnNbaV0ubVRleHR1cmVbMF0gPT0gbnVsbFxuICAgICAgICByZXR1cm5cbiAgICBvbGRYcmVzID0gQG1CdWZmZXJzW2ldLm1SZXNvbHV0aW9uWzBdXG4gICAgb2xkWXJlcyA9IEBtQnVmZmVyc1tpXS5tUmVzb2x1dGlvblsxXVxuICAgIGlmIG9sZFhyZXMgIT0geHJlcyBvciBvbGRZcmVzICE9IHlyZXNcbiAgICAgICAgbmVlZENvcHkgPSBAbUJ1ZmZlcnNbaV0ubVRleHR1cmVbMF0gIT0gbnVsbFxuICAgICAgICB0ZXh0dXJlMSA9IEBtUmVuZGVyZXIuQ3JlYXRlVGV4dHVyZShAbVJlbmRlcmVyLlRFWFRZUEUuVDJELCB4cmVzLCB5cmVzLCBAbVJlbmRlcmVyLlRFWEZNVC5DNEYzMiwgKGlmIG5lZWRDb3B5IHRoZW4gQG1CdWZmZXJzW2ldLm1UZXh0dXJlWzBdLm1GaWx0ZXIgZWxzZSBAbVJlbmRlcmVyLkZJTFRFUi5OT05FKSwgKGlmIG5lZWRDb3B5IHRoZW4gQG1CdWZmZXJzW2ldLm1UZXh0dXJlWzBdLm1XcmFwIGVsc2UgQG1SZW5kZXJlci5URVhXUlAuQ0xBTVApLCBudWxsKVxuICAgICAgICB0ZXh0dXJlMiA9IEBtUmVuZGVyZXIuQ3JlYXRlVGV4dHVyZShAbVJlbmRlcmVyLlRFWFRZUEUuVDJELCB4cmVzLCB5cmVzLCBAbVJlbmRlcmVyLlRFWEZNVC5DNEYzMiwgKGlmIG5lZWRDb3B5IHRoZW4gQG1CdWZmZXJzW2ldLm1UZXh0dXJlWzFdLm1GaWx0ZXIgZWxzZSBAbVJlbmRlcmVyLkZJTFRFUi5OT05FKSwgKGlmIG5lZWRDb3B5IHRoZW4gQG1CdWZmZXJzW2ldLm1UZXh0dXJlWzFdLm1XcmFwIGVsc2UgQG1SZW5kZXJlci5URVhXUlAuQ0xBTVApLCBudWxsKVxuICAgICAgICB0YXJnZXQxID0gQG1SZW5kZXJlci5DcmVhdGVSZW5kZXJUYXJnZXQodGV4dHVyZTEsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIGZhbHNlKVxuICAgICAgICB0YXJnZXQyID0gQG1SZW5kZXJlci5DcmVhdGVSZW5kZXJUYXJnZXQodGV4dHVyZTIsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIGZhbHNlKVxuICAgICAgICBpZiBuZWVkQ29weVxuICAgICAgICAgICAgdiA9IFtcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgICAgIE1hdGgubWluKHhyZXMsIG9sZFhyZXMpXG4gICAgICAgICAgICAgICAgTWF0aC5taW4oeXJlcywgb2xkWXJlcylcbiAgICAgICAgICAgIF1cbiAgICAgICAgICAgIEBtUmVuZGVyZXIuU2V0QmxlbmQgZmFsc2VcbiAgICAgICAgICAgIEBtUmVuZGVyZXIuU2V0Vmlld3BvcnQgdlxuICAgICAgICAgICAgQG1SZW5kZXJlci5BdHRhY2hTaGFkZXIgQG1Qcm9ncmFtQ29weVxuICAgICAgICAgICAgbDEgPSBAbVJlbmRlcmVyLkdldEF0dHJpYkxvY2F0aW9uKEBtUHJvZ3JhbUNvcHksICdwb3MnKVxuICAgICAgICAgICAgdk9sZCA9IFtcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgICAgIG9sZFhyZXNcbiAgICAgICAgICAgICAgICBvbGRZcmVzXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBAbVJlbmRlcmVyLlNldFNoYWRlckNvbnN0YW50NEZWICd2Jywgdk9sZFxuICAgICAgICAgICAgIyBDb3B5IG9sZCBidWZmZXJzIDEgdG8gbmV3IGJ1ZmZlclxuICAgICAgICAgICAgQG1SZW5kZXJlci5TZXRSZW5kZXJUYXJnZXQgdGFyZ2V0MVxuICAgICAgICAgICAgQG1SZW5kZXJlci5BdHRhY2hUZXh0dXJlcyAxLCBAbUJ1ZmZlcnNbaV0ubVRleHR1cmVbMF0sIG51bGwsIG51bGwsIG51bGxcbiAgICAgICAgICAgIEBtUmVuZGVyZXIuRHJhd1VuaXRRdWFkX1hZIGwxXG4gICAgICAgICAgICAjIENvcHkgb2xkIGJ1ZmZlcnMgMiB0byBuZXcgYnVmZmVyXG4gICAgICAgICAgICBAbVJlbmRlcmVyLlNldFJlbmRlclRhcmdldCB0YXJnZXQyXG4gICAgICAgICAgICBAbVJlbmRlcmVyLkF0dGFjaFRleHR1cmVzIDEsIEBtQnVmZmVyc1tpXS5tVGV4dHVyZVsxXSwgbnVsbCwgbnVsbCwgbnVsbFxuICAgICAgICAgICAgQG1SZW5kZXJlci5EcmF3VW5pdFF1YWRfWFkgbDFcbiAgICAgICAgICAgICMgRGVhbGxvY2F0ZSBvbGQgbWVtb3J5XG4gICAgICAgICAgICBAbVJlbmRlcmVyLkRlc3Ryb3lUZXh0dXJlIEBtQnVmZmVyc1tpXS5tVGV4dHVyZVswXVxuICAgICAgICAgICAgQG1SZW5kZXJlci5EZXN0cm95UmVuZGVyVGFyZ2V0IEBtQnVmZmVyc1tpXS5tVGFyZ2V0WzBdXG4gICAgICAgICAgICBAbVJlbmRlcmVyLkRlc3Ryb3lUZXh0dXJlIEBtQnVmZmVyc1tpXS5tVGV4dHVyZVsxXVxuICAgICAgICAgICAgQG1SZW5kZXJlci5EZXN0cm95UmVuZGVyVGFyZ2V0IEBtQnVmZmVyc1tpXS5tVGFyZ2V0WzFdXG4gICAgICAgICAgICAjdGhpcy5tUmVuZGVyZXIuRGVzdHJveVRleHR1cmUodGhpcy5tQnVmZmVyc1tpXS50aHVtYm5haWxUZXh0dXJlKTtcbiAgICAgICAgIyBTdG9yZSBuZXcgYnVmZmVyc1xuICAgICAgICBAbUJ1ZmZlcnNbaV0ubVRleHR1cmUgPSBbXG4gICAgICAgICAgICB0ZXh0dXJlMVxuICAgICAgICAgICAgdGV4dHVyZTJcbiAgICAgICAgXVxuICAgICAgICBAbUJ1ZmZlcnNbaV0ubVRhcmdldCA9IFtcbiAgICAgICAgICAgIHRhcmdldDFcbiAgICAgICAgICAgIHRhcmdldDJcbiAgICAgICAgXVxuICAgICAgICBAbUJ1ZmZlcnNbaV0ubUxhc3RSZW5kZXJEb25lID0gMFxuICAgICAgICBAbUJ1ZmZlcnNbaV0ubVJlc29sdXRpb25bMF0gPSB4cmVzXG4gICAgICAgIEBtQnVmZmVyc1tpXS5tUmVzb2x1dGlvblsxXSA9IHlyZXNcbiAgICByZXR1cm5cblxuRWZmZWN0OjpzYXZlU2NyZWVuc2hvdCA9IChwYXNzaWQpIC0+XG4gICAgcGFzcyA9IEBtUGFzc2VzW3Bhc3NpZF1cbiAgICBpZiBwYXNzLm1UeXBlID09ICdidWZmZXInXG4gICAgICAgIGJ1ZmZlcklEID0gYXNzZXRJRF90b19idWZmZXJJRChAbVBhc3Nlc1twYXNzaWRdLm1PdXRwdXRzWzBdKVxuICAgICAgICB0ZXh0dXJlID0gQG1CdWZmZXJzW2J1ZmZlcklEXS5tVGFyZ2V0W0BtQnVmZmVyc1tidWZmZXJJRF0ubUxhc3RSZW5kZXJEb25lXVxuICAgICAgICBudW1Db21wb25lbnRzID0gM1xuICAgICAgICB3aWR0aCA9IHRleHR1cmUubVRleDAubVhyZXNcbiAgICAgICAgaGVpZ2h0ID0gdGV4dHVyZS5tVGV4MC5tWXJlc1xuICAgICAgICB0eXBlID0gJ0Zsb2F0J1xuICAgICAgICAjIE90aGVyIG9wdGlvbnMgRmxvYXQsIEhhbGYsIFVpbnRcbiAgICAgICAgYnl0ZXMgPSBuZXcgRmxvYXQzMkFycmF5KHdpZHRoICogaGVpZ2h0ICogNClcbiAgICAgICAgI251bUNvbXBvbmVudHMpO1xuICAgICAgICBAbVJlbmRlcmVyLkdldFBpeGVsRGF0YVJlbmRlclRhcmdldCB0ZXh0dXJlLCBieXRlcywgd2lkdGgsIGhlaWdodFxuICAgICAgICBibG9iID0gcGlFeHBvcnRUb0VYUih3aWR0aCwgaGVpZ2h0LCBudW1Db21wb25lbnRzLCB0eXBlLCBieXRlcylcbiAgICAgICAgIyBPZmZlciBkb3dubG9hZCBhdXRvbWF0aWNhbGx5IHRvIHRoZSB1c2VyXG4gICAgICAgIHBpVHJpZ2dlckRvd25sb2FkICdpbWFnZS5leHInLCBibG9iXG4gICAgZWxzZSBpZiBwYXNzLm1UeXBlID09ICdjdWJlbWFwJ1xuICAgICAgICB4cmVzID0gNDA5NlxuICAgICAgICB5cmVzID0gMjA0OFxuICAgICAgICBAbVNjcmVlbnNob3RTeXRlbS5BbGxvY2F0ZSB4cmVzLCB5cmVzXG4gICAgICAgIGN1YmVCdWZmZXIgPSBAbUN1YmVCdWZmZXJzWzBdXG4gICAgICAgIHRhcmdldCA9IEBtU2NyZWVuc2hvdFN5dGVtLkdldFRhcmdldCgpXG4gICAgICAgIEBtUmVuZGVyZXIuU2V0UmVuZGVyVGFyZ2V0IHRhcmdldFxuICAgICAgICBwcm9ncmFtID0gQG1TY3JlZW5zaG90U3l0ZW0uR2V0UHJvZ3JhbSgpXG4gICAgICAgIEBtUmVuZGVyZXIuQXR0YWNoU2hhZGVyIHByb2dyYW1cbiAgICAgICAgbDEgPSBAbVJlbmRlcmVyLkdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sICdwb3MnKVxuICAgICAgICBAbVJlbmRlcmVyLlNldFZpZXdwb3J0IFtcbiAgICAgICAgICAgIDBcbiAgICAgICAgICAgIDBcbiAgICAgICAgICAgIHhyZXNcbiAgICAgICAgICAgIHlyZXNcbiAgICAgICAgXVxuICAgICAgICBAbVJlbmRlcmVyLkF0dGFjaFRleHR1cmVzIDEsIGN1YmVCdWZmZXIubVRleHR1cmVbY3ViZUJ1ZmZlci5tTGFzdFJlbmRlckRvbmVdLCBudWxsLCBudWxsLCBudWxsXG4gICAgICAgIEBtUmVuZGVyZXIuRHJhd1VuaXRRdWFkX1hZIGwxXG4gICAgICAgIEBtUmVuZGVyZXIuRGV0dGFjaFRleHR1cmVzKClcbiAgICAgICAgQG1SZW5kZXJlci5TZXRSZW5kZXJUYXJnZXQgbnVsbFxuICAgICAgICBkYXRhID0gbmV3IEZsb2F0MzJBcnJheSh4cmVzICogeXJlcyAqIDQpXG4gICAgICAgIEBtUmVuZGVyZXIuR2V0UGl4ZWxEYXRhUmVuZGVyVGFyZ2V0IHRhcmdldCwgZGF0YSwgeHJlcywgeXJlc1xuICAgICAgICBibG9iID0gcGlFeHBvcnRUb0VYUih4cmVzLCB5cmVzLCAzLCAnRmxvYXQnLCBkYXRhKVxuICAgICAgICBwaVRyaWdnZXJEb3dubG9hZCAnaW1hZ2UuZXhyJywgYmxvYlxuICAgIHJldHVyblxuXG5FZmZlY3Q6OlJlc2l6ZUJ1ZmZlcnMgPSAoeHJlcywgeXJlcykgLT5cbiAgICBpID0gMFxuICAgIHdoaWxlIGkgPCBAbU1heEJ1ZmZlcnNcbiAgICAgICAgQFJlc2l6ZUJ1ZmZlciBpLCB4cmVzLCB5cmVzLCB0cnVlXG4gICAgICAgIGkrK1xuICAgIHJldHVyblxuXG5FZmZlY3Q6OkdldFRleHR1cmUgPSAocGFzc2lkLCBzbG90KSAtPlxuICAgIEBtUGFzc2VzW3Bhc3NpZF0uR2V0VGV4dHVyZSBzbG90XG5cbkVmZmVjdDo6TmV3VGV4dHVyZSA9IChwYXNzaWQsIHNsb3QsIHVybCkgLT5cbiAgICBAbVBhc3Nlc1twYXNzaWRdLk5ld1RleHR1cmUgbnVsbCwgc2xvdCwgdXJsLCBAbUJ1ZmZlcnMsIEBtQ3ViZUJ1ZmZlcnMsIEBtS2V5Ym9hcmRcblxuRWZmZWN0OjpTZXRPdXRwdXRzID0gKHBhc3NpZCwgc2xvdCwgdXJsKSAtPlxuICAgIEBtUGFzc2VzW3Bhc3NpZF0uU2V0T3V0cHV0cyBzbG90LCB1cmxcbiAgICByZXR1cm5cblxuRWZmZWN0OjpTZXRPdXRwdXRzQnlCdWZmZXJJRCA9IChwYXNzaWQsIHNsb3QsIGlkKSAtPlxuICAgIEBtUGFzc2VzW3Bhc3NpZF0uU2V0T3V0cHV0c0J5QnVmZmVySUQgc2xvdCwgaWRcbiAgICByZXR1cm5cblxuRWZmZWN0OjpHZXRBY2NlcHRzTGluZWFyID0gKHBhc3NpZCwgc2xvdCkgLT5cbiAgICBAbVBhc3Nlc1twYXNzaWRdLkdldEFjY2VwdHNMaW5lYXIgc2xvdFxuXG5FZmZlY3Q6OkdldEFjY2VwdHNNaXBtYXBwaW5nID0gKHBhc3NpZCwgc2xvdCkgLT5cbiAgICBAbVBhc3Nlc1twYXNzaWRdLkdldEFjY2VwdHNNaXBtYXBwaW5nIHNsb3RcblxuRWZmZWN0OjpHZXRBY2NlcHRzV3JhcFJlcGVhdCA9IChwYXNzaWQsIHNsb3QpIC0+XG4gICAgQG1QYXNzZXNbcGFzc2lkXS5HZXRBY2NlcHRzV3JhcFJlcGVhdCBzbG90XG5cbkVmZmVjdDo6R2V0QWNjZXB0c1ZGbGlwID0gKHBhc3NpZCwgc2xvdCkgLT5cbiAgICBAbVBhc3Nlc1twYXNzaWRdLkdldEFjY2VwdHNWRmxpcCBzbG90XG5cbkVmZmVjdDo6U2V0U2FtcGxlckZpbHRlciA9IChwYXNzaWQsIHNsb3QsIHN0cikgLT5cbiAgICBAbVBhc3Nlc1twYXNzaWRdLlNldFNhbXBsZXJGaWx0ZXIgc2xvdCwgc3RyLCBAbUJ1ZmZlcnMsIEBtQ3ViZUJ1ZmZlcnNcbiAgICByZXR1cm5cblxuRWZmZWN0OjpHZXRTYW1wbGVyRmlsdGVyID0gKHBhc3NpZCwgc2xvdCkgLT5cbiAgICBAbVBhc3Nlc1twYXNzaWRdLkdldFNhbXBsZXJGaWx0ZXIgc2xvdFxuXG5FZmZlY3Q6OlNldFNhbXBsZXJXcmFwID0gKHBhc3NpZCwgc2xvdCwgc3RyKSAtPlxuICAgIEBtUGFzc2VzW3Bhc3NpZF0uU2V0U2FtcGxlcldyYXAgc2xvdCwgc3RyLCBAbUJ1ZmZlcnNcbiAgICByZXR1cm5cblxuRWZmZWN0OjpHZXRTYW1wbGVyV3JhcCA9IChwYXNzaWQsIHNsb3QpIC0+XG4gICAgQG1QYXNzZXNbcGFzc2lkXS5HZXRTYW1wbGVyV3JhcCBzbG90XG5cbkVmZmVjdDo6U2V0U2FtcGxlclZGbGlwID0gKHBhc3NpZCwgc2xvdCwgc3RyKSAtPlxuICAgIEBtUGFzc2VzW3Bhc3NpZF0uU2V0U2FtcGxlclZGbGlwIHNsb3QsIHN0clxuICAgIHJldHVyblxuXG5FZmZlY3Q6OkdldFNhbXBsZXJWRmxpcCA9IChwYXNzaWQsIHNsb3QpIC0+XG4gICAgQG1QYXNzZXNbcGFzc2lkXS5HZXRTYW1wbGVyVkZsaXAgc2xvdFxuXG5FZmZlY3Q6OlNldEtleURvd24gPSAocGFzc2lkLCBrKSAtPlxuICAgIGlmIEBtS2V5Ym9hcmQubURhdGFbayArIDAgKiAyNTZdID09IDI1NVxuICAgICAgICByZXR1cm5cbiAgICBAbUtleWJvYXJkLm1EYXRhW2sgKyAwICogMjU2XSA9IDI1NVxuICAgIEBtS2V5Ym9hcmQubURhdGFbayArIDEgKiAyNTZdID0gMjU1XG4gICAgQG1LZXlib2FyZC5tRGF0YVtrICsgMiAqIDI1Nl0gPSAyNTUgLSAoQG1LZXlib2FyZC5tRGF0YVtrICsgMiAqIDI1Nl0pXG4gICAgQG1SZW5kZXJlci5VcGRhdGVUZXh0dXJlIEBtS2V5Ym9hcmQubVRleHR1cmUsIDAsIDAsIDI1NiwgMywgQG1LZXlib2FyZC5tRGF0YVxuICAgIHJldHVyblxuXG5FZmZlY3Q6OlNldEtleVVwID0gKHBhc3NpZCwgaykgLT5cbiAgICBAbUtleWJvYXJkLm1EYXRhW2sgKyAwICogMjU2XSA9IDBcbiAgICBAbUtleWJvYXJkLm1EYXRhW2sgKyAxICogMjU2XSA9IDBcbiAgICBAbVJlbmRlcmVyLlVwZGF0ZVRleHR1cmUgQG1LZXlib2FyZC5tVGV4dHVyZSwgMCwgMCwgMjU2LCAzLCBAbUtleWJvYXJkLm1EYXRhXG4gICAgcmV0dXJuXG5cbkVmZmVjdDo6U2V0U2l6ZSA9ICh4cmVzLCB5cmVzKSAtPlxuICAgIGlmIHhyZXMgIT0gQG1YcmVzIG9yIHlyZXMgIT0gQG1ZcmVzXG4gICAgICAgIG9sZFhyZXMgPSBAbVhyZXNcbiAgICAgICAgb2xkWXJlcyA9IEBtWXJlc1xuICAgICAgICBAbVhyZXMgPSB4cmVzXG4gICAgICAgIEBtWXJlcyA9IHlyZXNcbiAgICAgICAgQFJlc2l6ZUJ1ZmZlcnMgeHJlcywgeXJlc1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIGZhbHNlXG5cbkVmZmVjdDo6UGF1c2VJbnB1dCA9IChwYXNzaWQsIGlkKSAtPlxuICAgIEBtUGFzc2VzW3Bhc3NpZF0uVG9vZ2xlUGF1c2VJbnB1dCBAbUF1ZGlvQ29udGV4dCwgaWRcblxuRWZmZWN0OjpSZXNldFRpbWUgPSAtPlxuICAgIEBtRnJhbWUgPSAwXG4gICAgbnVtID0gQG1QYXNzZXMubGVuZ3RoXG4gICAgaSA9IDBcbiAgICB3aGlsZSBpIDwgbnVtXG4gICAgICAgIEBtUGFzc2VzW2ldLm1GcmFtZSA9IDBcbiAgICAgICAgaSsrXG4gICAgcmV0dXJuXG5cbkVmZmVjdDo6UGFpbnQgPSAodGltZSwgZHRpbWUsIGZwcywgbW91c2VPcmlYLCBtb3VzZU9yaVksIG1vdXNlUG9zWCwgbW91c2VQb3NZLCBpc1BhdXNlZCkgLT5cbiAgICBgdmFyIGlgXG4gICAgYHZhciBpYFxuICAgIGB2YXIgaWBcbiAgICBgdmFyIGJ1ZmZlcklEYFxuICAgIGB2YXIgbmVlZE1pcE1hcHNgXG4gICAgYHZhciBqYFxuICAgIGB2YXIga2BcbiAgICBgdmFyIGlucGBcbiAgICBgdmFyIGlgXG4gICAgYHZhciBrYFxuICAgIHdhID0gbnVsbFxuICAgIGRhID0gbmV3IERhdGVcbiAgICB4cmVzID0gQG1YcmVzIC8gMVxuICAgIHlyZXMgPSBAbVlyZXMgLyAxXG4gICAgaWYgQG1GcmFtZSA9PSAwXG4gICAgICAgIGkgPSAwXG4gICAgICAgIHdoaWxlIGkgPCBAbU1heEJ1ZmZlcnNcbiAgICAgICAgICAgIGlmIEBtQnVmZmVyc1tpXS5tVGV4dHVyZVswXSAhPSBudWxsXG4gICAgICAgICAgICAgICAgQG1SZW5kZXJlci5TZXRSZW5kZXJUYXJnZXQgQG1CdWZmZXJzW2ldLm1UYXJnZXRbMF1cbiAgICAgICAgICAgICAgICBAbVJlbmRlcmVyLkNsZWFyIEBtUmVuZGVyZXIuQ0xFQVIuQ29sb3IsIFtcbiAgICAgICAgICAgICAgICAgICAgMC4wXG4gICAgICAgICAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgICAgICAgICAwLjBcbiAgICAgICAgICAgICAgICAgICAgMC4wXG4gICAgICAgICAgICAgICAgXSwgMS4wLCAwXG4gICAgICAgICAgICAgICAgQG1SZW5kZXJlci5TZXRSZW5kZXJUYXJnZXQgQG1CdWZmZXJzW2ldLm1UYXJnZXRbMV1cbiAgICAgICAgICAgICAgICBAbVJlbmRlcmVyLkNsZWFyIEBtUmVuZGVyZXIuQ0xFQVIuQ29sb3IsIFtcbiAgICAgICAgICAgICAgICAgICAgMC4wXG4gICAgICAgICAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgICAgICAgICAwLjBcbiAgICAgICAgICAgICAgICAgICAgMC4wXG4gICAgICAgICAgICAgICAgXSwgMS4wLCAwXG4gICAgICAgICAgICBpKytcbiAgICAgICAgaSA9IDBcbiAgICAgICAgd2hpbGUgaSA8IEBtTWF4Q3ViZUJ1ZmZlcnNcbiAgICAgICAgICAgIGlmIEBtQ3ViZUJ1ZmZlcnNbaV0ubVRleHR1cmVbMF0gIT0gbnVsbFxuICAgICAgICAgICAgICAgIGZhY2UgPSAwXG4gICAgICAgICAgICAgICAgd2hpbGUgZmFjZSA8IDZcbiAgICAgICAgICAgICAgICAgICAgQG1SZW5kZXJlci5TZXRSZW5kZXJUYXJnZXRDdWJlTWFwIEBtQ3ViZUJ1ZmZlcnNbaV0ubVRhcmdldFswXSwgZmFjZVxuICAgICAgICAgICAgICAgICAgICBAbVJlbmRlcmVyLkNsZWFyIEBtUmVuZGVyZXIuQ0xFQVIuQ29sb3IsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgICAgICAgICAgICAgMC4wXG4gICAgICAgICAgICAgICAgICAgICAgICAwLjBcbiAgICAgICAgICAgICAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgICAgICAgICBdLCAxLjAsIDBcbiAgICAgICAgICAgICAgICAgICAgQG1SZW5kZXJlci5TZXRSZW5kZXJUYXJnZXRDdWJlTWFwIEBtQ3ViZUJ1ZmZlcnNbaV0ubVRhcmdldFsxXSwgZmFjZVxuICAgICAgICAgICAgICAgICAgICBAbVJlbmRlcmVyLkNsZWFyIEBtUmVuZGVyZXIuQ0xFQVIuQ29sb3IsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgICAgICAgICAgICAgMC4wXG4gICAgICAgICAgICAgICAgICAgICAgICAwLjBcbiAgICAgICAgICAgICAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgICAgICAgICBdLCAxLjAsIDBcbiAgICAgICAgICAgICAgICAgICAgZmFjZSsrXG4gICAgICAgICAgICBpKytcbiAgICBudW0gPSBAbVBhc3Nlcy5sZW5ndGhcbiAgICAjIHJlbmRlciBidWZmZXJzIHNlY29uZFxuICAgIGkgPSAwXG4gICAgd2hpbGUgaSA8IG51bVxuICAgICAgICBpZiBAbVBhc3Nlc1tpXS5tVHlwZSAhPSAnYnVmZmVyJ1xuICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICBpZiBAbVBhc3Nlc1tpXS5tUHJvZ3JhbSA9PSBudWxsXG4gICAgICAgICAgICBpKytcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIGJ1ZmZlcklEID0gYXNzZXRJRF90b19idWZmZXJJRChAbVBhc3Nlc1tpXS5tT3V0cHV0c1swXSlcbiAgICAgICAgIyBjaGVjayBpZiBhbnkgZG93bnN0cmVhbSBwYXNzIG5lZWRzIG1pcG1hcHMgd2hlbiByZWFkaW5nIGZyb20gdGhpcyBidWZmZXJcbiAgICAgICAgbmVlZE1pcE1hcHMgPSBmYWxzZVxuICAgICAgICBqID0gMFxuICAgICAgICB3aGlsZSBqIDwgbnVtXG4gICAgICAgICAgICBrID0gMFxuICAgICAgICAgICAgd2hpbGUgayA8IEBtUGFzc2VzW2pdLm1JbnB1dHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgaW5wID0gQG1QYXNzZXNbal0ubUlucHV0c1trXVxuICAgICAgICAgICAgICAgIGlmIGlucCAhPSBudWxsIGFuZCBpbnAubUluZm8ubVR5cGUgPT0gJ2J1ZmZlcicgYW5kIGlucC5pZCA9PSBidWZmZXJJRCBhbmQgaW5wLm1JbmZvLm1TYW1wbGVyLmZpbHRlciA9PSAnbWlwbWFwJ1xuICAgICAgICAgICAgICAgICAgICBuZWVkTWlwTWFwcyA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgICAgICBrKytcbiAgICAgICAgICAgIGorK1xuICAgICAgICBAbVBhc3Nlc1tpXS5QYWludCB3YSwgZGEsIHRpbWUsIGR0aW1lLCBmcHMsIG1vdXNlT3JpWCwgbW91c2VPcmlZLCBtb3VzZVBvc1gsIG1vdXNlUG9zWSwgeHJlcywgeXJlcywgaXNQYXVzZWQsIGJ1ZmZlcklELCBuZWVkTWlwTWFwcywgQG1CdWZmZXJzLCBAbUN1YmVCdWZmZXJzLCBAbUtleWJvYXJkLCB0aGlzXG4gICAgICAgIGkrK1xuICAgICMgcmVuZGVyIGN1YmVtYXAgYnVmZmVycyBzZWNvbmRcbiAgICBpID0gMFxuICAgIHdoaWxlIGkgPCBudW1cbiAgICAgICAgaWYgQG1QYXNzZXNbaV0ubVR5cGUgIT0gJ2N1YmVtYXAnXG4gICAgICAgICAgICBpKytcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIGlmIEBtUGFzc2VzW2ldLm1Qcm9ncmFtID09IG51bGxcbiAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgYnVmZmVySUQgPSAwXG4gICAgICAgICNhc3NldElEX3RvX2J1ZmZlcklEKCB0aGlzLm1QYXNzZXNbaV0ubU91dHB1dHNbMF0gKTtcbiAgICAgICAgIyBjaGVjayBpZiBhbnkgZG93bnN0cmVhbSBwYXNzIG5lZWRzIG1pcG1hcHMgd2hlbiByZWFkaW5nIGZyb20gdGhpcyBidWZmZXJcbiAgICAgICAgbmVlZE1pcE1hcHMgPSBmYWxzZVxuICAgICAgICBqID0gMFxuICAgICAgICB3aGlsZSBqIDwgbnVtXG4gICAgICAgICAgICBrID0gMFxuICAgICAgICAgICAgd2hpbGUgayA8IEBtUGFzc2VzW2pdLm1JbnB1dHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgaW5wID0gQG1QYXNzZXNbal0ubUlucHV0c1trXVxuICAgICAgICAgICAgICAgIGlmIGlucCAhPSBudWxsIGFuZCBpbnAubUluZm8ubVR5cGUgPT0gJ2N1YmVtYXAnXG4gICAgICAgICAgICAgICAgICAgIGlmIGFzc2V0SURfdG9fY3ViZW1hcEJ1ZmVySUQoaW5wLm1JbmZvLm1JRCkgPT0gMCBhbmQgaW5wLm1JbmZvLm1TYW1wbGVyLmZpbHRlciA9PSAnbWlwbWFwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgbmVlZE1pcE1hcHMgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGsrK1xuICAgICAgICAgICAgaisrXG4gICAgICAgIEBtUGFzc2VzW2ldLlBhaW50IHdhLCBkYSwgdGltZSwgZHRpbWUsIGZwcywgbW91c2VPcmlYLCBtb3VzZU9yaVksIG1vdXNlUG9zWCwgbW91c2VQb3NZLCB4cmVzLCB5cmVzLCBpc1BhdXNlZCwgYnVmZmVySUQsIG5lZWRNaXBNYXBzLCBAbUJ1ZmZlcnMsIEBtQ3ViZUJ1ZmZlcnMsIEBtS2V5Ym9hcmQsIHRoaXNcbiAgICAgICAgaSsrXG4gICAgIyByZW5kZXIgaW1hZ2UgbGFzdFxuICAgIGkgPSAwXG4gICAgd2hpbGUgaSA8IG51bVxuICAgICAgICBpZiBAbVBhc3Nlc1tpXS5tVHlwZSAhPSAnaW1hZ2UnXG4gICAgICAgICAgICBpKytcbiAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIGlmIEBtUGFzc2VzW2ldLm1Qcm9ncmFtID09IG51bGxcbiAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgQG1QYXNzZXNbaV0uUGFpbnQgd2EsIGRhLCB0aW1lLCBkdGltZSwgZnBzLCBtb3VzZU9yaVgsIG1vdXNlT3JpWSwgbW91c2VQb3NYLCBtb3VzZVBvc1ksIHhyZXMsIHlyZXMsIGlzUGF1c2VkLCBudWxsLCBmYWxzZSwgQG1CdWZmZXJzLCBAbUN1YmVCdWZmZXJzLCBAbUtleWJvYXJkLCB0aGlzXG4gICAgICAgIGkrK1xuICAgICMgZXJhc2Uga2V5cHJlc3Nlc1xuICAgIGsgPSAwXG4gICAgd2hpbGUgayA8IDI1NlxuICAgICAgICBAbUtleWJvYXJkLm1EYXRhW2sgKyAxICogMjU2XSA9IDBcbiAgICAgICAgaysrXG4gICAgQG1SZW5kZXJlci5VcGRhdGVUZXh0dXJlIEBtS2V5Ym9hcmQubVRleHR1cmUsIDAsIDAsIDI1NiwgMywgQG1LZXlib2FyZC5tRGF0YVxuICAgIEBtRnJhbWUrK1xuICAgIHJldHVyblxuXG5FZmZlY3Q6Ok5ld1NoYWRlciA9IChzaGFkZXJDb2RlLCBwYXNzaWQpIC0+XG4gICAgY29tbW9uU291cmNlQ29kZXMgPSBbXVxuICAgIGkgPSAwXG4gICAgd2hpbGUgaSA8IEBtUGFzc2VzLmxlbmd0aFxuICAgICAgICBpZiBAbVBhc3Nlc1tpXS5tVHlwZSA9PSAnY29tbW9uJ1xuICAgICAgICAgICAgY29tbW9uU291cmNlQ29kZXMucHVzaCBAbVBhc3Nlc1tpXS5tU291cmNlXG4gICAgICAgIGkrK1xuICAgIEBtUGFzc2VzW3Bhc3NpZF0uTmV3U2hhZGVyIHNoYWRlckNvZGUsIGNvbW1vblNvdXJjZUNvZGVzXG5cbkVmZmVjdDo6R2V0TnVtUGFzc2VzID0gLT5cbiAgICBAbVBhc3Nlcy5sZW5ndGhcblxuRWZmZWN0OjpHZXROdW1PZlR5cGUgPSAocGFzc3R5cGUpIC0+XG4gICAgaWQgPSAwXG4gICAgaiA9IDBcbiAgICB3aGlsZSBqIDwgQG1QYXNzZXMubGVuZ3RoXG4gICAgICAgIGlmIEBtUGFzc2VzW2pdLm1UeXBlID09IHBhc3N0eXBlXG4gICAgICAgICAgICBpZCsrXG4gICAgICAgIGorK1xuICAgIGlkXG5cbkVmZmVjdDo6R2V0UGFzc1R5cGUgPSAoaWQpIC0+XG4gICAgQG1QYXNzZXNbaWRdLm1UeXBlXG5cbkVmZmVjdDo6R2V0UGFzc05hbWUgPSAoaWQpIC0+XG4gICAgQG1QYXNzZXNbaWRdLm1OYW1lXG5cbkVmZmVjdDo6bmV3U2NyaXB0SlNPTiA9IChwYXNzZXMpIC0+XG4gICAgbnVtUGFzc2VzID0gcGFzc2VzLmxlbmd0aFxuICAgIGlmIG51bVBhc3NlcyA8IDEgb3IgbnVtUGFzc2VzID4gQG1NYXhQYXNzZXNcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG1GYWlsZWQ6IHRydWVcbiAgICAgICAgICAgIG1FcnJvcjogJ0luY29ycmVjdCBudW1iZXIgb2YgcGFzc2VzLCB3cm9uZyBzaGFkZXIgZm9ybWF0J1xuICAgICAgICAgICAgbVNoYWRlcjogbnVsbFxuICAgICAgICB9XG4gICAgcmVzID0gW11cbiAgICByZXMubUZhaWxlZCA9IGZhbHNlXG4gICAgaiA9IDBcbiAgICB3aGlsZSBqIDwgbnVtUGFzc2VzXG4gICAgICAgIHJwYXNzID0gcGFzc2VzW2pdXG4gICAgICAgIEBtUGFzc2VzW2pdID0gbmV3IFBhc3MoQG1SZW5kZXJlciwgQG1Jc0xvd0VuZCwgdHJ1ZSwgZmFsc2UsIEBtR2Fpbk5vZGUsIEBtUHJvZ3JhbURvd25zY2FsZSwgaiwgdGhpcylcbiAgICAgICAgbnVtSW5wdXRzID0gcnBhc3MuaW5wdXRzLmxlbmd0aFxuICAgICAgICBpID0gMFxuICAgICAgICB3aGlsZSBpIDwgNFxuICAgICAgICAgICAgQG1QYXNzZXNbal0uTmV3VGV4dHVyZSBudWxsLCBpLCBudWxsLCBudWxsLCBudWxsXG4gICAgICAgICAgICBpKytcbiAgICAgICAgaSA9IDBcbiAgICAgICAgd2hpbGUgaSA8IG51bUlucHV0c1xuICAgICAgICAgICAgbGlkID0gcnBhc3MuaW5wdXRzW2ldLmNoYW5uZWxcbiAgICAgICAgICAgIHN0eXAgPSBycGFzcy5pbnB1dHNbaV0udHlwZVxuICAgICAgICAgICAgc2lkID0gcnBhc3MuaW5wdXRzW2ldLmlkXG4gICAgICAgICAgICBzc3JjID0gcnBhc3MuaW5wdXRzW2ldLmZpbGVwYXRoXG4gICAgICAgICAgICBwc3JjID0gcnBhc3MuaW5wdXRzW2ldLnByZXZpZXdmaWxlcGF0aFxuICAgICAgICAgICAgc2FtcCA9IHJwYXNzLmlucHV0c1tpXS5zYW1wbGVyXG4gICAgICAgICAgICBAbVBhc3Nlc1tqXS5OZXdUZXh0dXJlIEBtQXVkaW9Db250ZXh0LCBsaWQsIHtcbiAgICAgICAgICAgICAgICBtVHlwZTogc3R5cFxuICAgICAgICAgICAgICAgIG1JRDogc2lkXG4gICAgICAgICAgICAgICAgbVNyYzogc3NyY1xuICAgICAgICAgICAgICAgIG1TYW1wbGVyOiBzYW1wXG4gICAgICAgICAgICAgICAgbVByZXZpZXdTcmM6IHBzcmNcbiAgICAgICAgICAgIH0sIEBtQnVmZmVycywgQG1DdWJlQnVmZmVycywgQG1LZXlib2FyZFxuICAgICAgICAgICAgaSsrXG4gICAgICAgIGkgPSAwXG4gICAgICAgIHdoaWxlIGkgPCA0XG4gICAgICAgICAgICBAbVBhc3Nlc1tqXS5TZXRPdXRwdXRzIGksIG51bGxcbiAgICAgICAgICAgIGkrK1xuICAgICAgICBudW1PdXRwdXRzID0gcnBhc3Mub3V0cHV0cy5sZW5ndGhcbiAgICAgICAgaSA9IDBcbiAgICAgICAgd2hpbGUgaSA8IG51bU91dHB1dHNcbiAgICAgICAgICAgIG91dHB1dElEID0gcnBhc3Mub3V0cHV0c1tpXS5pZFxuICAgICAgICAgICAgb3V0cHV0Q0ggPSBycGFzcy5vdXRwdXRzW2ldLmNoYW5uZWxcbiAgICAgICAgICAgIEBtUGFzc2VzW2pdLlNldE91dHB1dHMgb3V0cHV0Q0gsIG91dHB1dElEXG4gICAgICAgICAgICBpKytcbiAgICAgICAgIyBjcmVhdGUgc29tZSBoYXJkY29kZWQgbmFtZXMuIFRoaXMgc2hvdWxkIGNvbWUgZnJvbSB0aGUgREJcbiAgICAgICAgcnBhc3NOYW1lID0gJydcbiAgICAgICAgaWYgcnBhc3MudHlwZSA9PSAnY29tbW9uJ1xuICAgICAgICAgICAgcnBhc3NOYW1lID0gJ0NvbW1vbidcbiAgICAgICAgaWYgcnBhc3MudHlwZSA9PSAnaW1hZ2UnXG4gICAgICAgICAgICBycGFzc05hbWUgPSAnSW1hZ2UnXG4gICAgICAgIGlmIHJwYXNzLnR5cGUgPT0gJ2J1ZmZlcidcbiAgICAgICAgICAgIHJwYXNzTmFtZSA9ICdCdWZmZXIgJyArIFN0cmluZy5mcm9tQ2hhckNvZGUoNjUgKyBhc3NldElEX3RvX2J1ZmZlcklEKEBtUGFzc2VzW2pdLm1PdXRwdXRzWzBdKSlcbiAgICAgICAgaWYgcnBhc3MudHlwZSA9PSAnY3ViZW1hcCdcbiAgICAgICAgICAgIHJwYXNzTmFtZSA9ICdDdWJlIEEnXG4gICAgICAgICMgXCIgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKDY1ICsgYXNzZXRJRF90b19idWZmZXJJRCh0aGlzLm1QYXNzZXNbal0ubU91dHB1dHNbMF0pKTtcbiAgICAgICAgQG1QYXNzZXNbal0uQ3JlYXRlIHJwYXNzLnR5cGUsIHJwYXNzTmFtZSwgQG1BdWRpb0NvbnRleHRcbiAgICAgICAgaisrXG4gICAgcHQgPSAwXG4gICAgd2hpbGUgcHQgPCA1XG4gICAgICAgIGogPSAwXG4gICAgICAgIHdoaWxlIGogPCBudW1QYXNzZXNcbiAgICAgICAgICAgIHJwYXNzID0gcGFzc2VzW2pdXG4gICAgICAgICAgICBpZiBwdCA9PSAwIGFuZCBycGFzcy50eXBlICE9ICdjb21tb24nXG4gICAgICAgICAgICAgICAgaisrXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIGlmIHB0ID09IDEgYW5kIHJwYXNzLnR5cGUgIT0gJ2J1ZmZlcidcbiAgICAgICAgICAgICAgICBqKytcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgaWYgcHQgPT0gMiBhbmQgcnBhc3MudHlwZSAhPSAnaW1hZ2UnXG4gICAgICAgICAgICAgICAgaisrXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIGlmIHB0ID09IDQgYW5kIHJwYXNzLnR5cGUgIT0gJ2N1YmVtYXAnXG4gICAgICAgICAgICAgICAgaisrXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIHNoYWRlclN0ciA9IHJwYXNzLmNvZGVcbiAgICAgICAgICAgIHJlc3VsdCA9IEBOZXdTaGFkZXIoc2hhZGVyU3RyLCBqKVxuICAgICAgICAgICAgaWYgcmVzdWx0ICE9IG51bGxcbiAgICAgICAgICAgICAgICByZXMubUZhaWxlZCA9IHRydWVcbiAgICAgICAgICAgICAgICByZXNbal0gPVxuICAgICAgICAgICAgICAgICAgICBtRmFpbGVkOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgIG1FcnJvcjogcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgIG1TaGFkZXI6IHNoYWRlclN0clxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlc1tqXSA9XG4gICAgICAgICAgICAgICAgICAgIG1GYWlsZWQ6IGZhbHNlXG4gICAgICAgICAgICAgICAgICAgIG1FcnJvcjogbnVsbFxuICAgICAgICAgICAgICAgICAgICBtU2hhZGVyOiBzaGFkZXJTdHJcbiAgICAgICAgICAgIGorK1xuICAgICAgICBwdCsrXG4gICAgcmVzXG5cbkVmZmVjdDo6R2V0Q29tcGlsYXRpb25UaW1lID0gKGlkKSAtPlxuICAgIEBtUGFzc2VzW2lkXS5HZXRDb21waWxhdGlvblRpbWUoKVxuXG5FZmZlY3Q6OkRlc3Ryb3lQYXNzID0gKGlkKSAtPlxuICAgIEBtUGFzc2VzW2lkXS5EZXN0cm95IEBtQXVkaW9Db250ZXh0XG4gICAgQG1QYXNzZXMuc3BsaWNlIGlkLCAxXG4gICAgcmV0dXJuXG5cbkVmZmVjdDo6QWRkUGFzcyA9IChwYXNzVHlwZSwgcGFzc05hbWUpIC0+XG4gICAgc2hhZGVyU3RyID0gbnVsbFxuICAgIGlmIHBhc3NUeXBlID09ICdidWZmZXInXG4gICAgICAgIHNoYWRlclN0ciA9ICd2b2lkIG1haW5JbWFnZSggb3V0IHZlYzQgZnJhZ0NvbG9yLCBpbiB2ZWMyIGZyYWdDb29yZCApXFxue1xcbiAgICBmcmFnQ29sb3IgPSB2ZWM0KDAuMCwwLjAsMS4wLDEuMCk7XFxufSdcbiAgICBpZiBwYXNzVHlwZSA9PSAnY29tbW9uJ1xuICAgICAgICBzaGFkZXJTdHIgPSAndmVjNCBzb21lRnVuY3Rpb24oIHZlYzQgYSwgZmxvYXQgYiApXFxue1xcbiAgICByZXR1cm4gYStiO1xcbn0nXG4gICAgaWYgcGFzc1R5cGUgPT0gJ2N1YmVtYXAnXG4gICAgICAgIHNoYWRlclN0ciA9ICd2b2lkIG1haW5DdWJlbWFwKCBvdXQgdmVjNCBmcmFnQ29sb3IsIGluIHZlYzIgZnJhZ0Nvb3JkLCBpbiB2ZWMzIHJheU9yaSwgaW4gdmVjMyByYXlEaXIgKVxcbntcXG4gICAgLy8gUmF5IGRpcmVjdGlvbiBhcyBjb2xvclxcbiAgICB2ZWMzIGNvbCA9IDAuNSArIDAuNSpyYXlEaXI7XFxuXFxuICAgIC8vIE91dHB1dCB0byBjdWJlbWFwXFxuICAgIGZyYWdDb2xvciA9IHZlYzQoY29sLDEuMCk7XFxufSdcbiAgICBpZCA9IEBHZXROdW1QYXNzZXMoKVxuICAgIEBtUGFzc2VzW2lkXSA9IG5ldyBQYXNzKEBtUmVuZGVyZXIsIEBtSXNMb3dFbmQsIHRydWUsIGZhbHNlLCBAbUdhaW5Ob2RlLCBAbVByb2dyYW1Eb3duc2NhbGUsIGlkLCB0aGlzKVxuICAgIEBtUGFzc2VzW2lkXS5DcmVhdGUgcGFzc1R5cGUsIHBhc3NOYW1lLCBAbUF1ZGlvQ29udGV4dFxuICAgIHJlcyA9IEBOZXdTaGFkZXIoc2hhZGVyU3RyLCBpZClcbiAgICBcbiAgICBtSWQ6IGlkXG4gICAgbVNoYWRlcjogc2hhZGVyU3RyXG4gICAgbUVycm9yOiByZXNcblxuIyB0aGlzIHNob3VsZCBiZSByZW1vdmVkIG9uY2Ugd2UgaGF2ZSBNdWx0aVBhc3MgMi4wIGFuZCBwYXNzZXMgcmVuZGVyIHRvIGFyYml0cmFyeSBidWZmZXJzXG5cbkVmZmVjdDo6SXNCdWZmZXJQYXNzVXNlZCA9IChidWZmZXJJRCkgLT5cbiAgICBqID0gMFxuICAgIHdoaWxlIGogPCBAbVBhc3Nlcy5sZW5ndGhcbiAgICAgICAgaWYgQG1QYXNzZXNbal0ubVR5cGUgIT0gJ2J1ZmZlcidcbiAgICAgICAgICAgIGorK1xuICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgaWYgQG1QYXNzZXNbal0ubU91dHB1dHNbMF0gPT0gYnVmZmVySURfdG9fYXNzZXRJRChidWZmZXJJRClcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIGorK1xuICAgIGZhbHNlXG5cbkVmZmVjdDo6ZXhwb3J0VG9KU09OID0gLT5cbiAgICBgdmFyIGlgXG4gICAgcmVzdWx0ID0ge31cbiAgICByZXN1bHQudmVyID0gJzAuMSdcbiAgICByZXN1bHQucmVuZGVycGFzcyA9IFtdXG4gICAgbnVtUGFzc2VzID0gQG1QYXNzZXMubGVuZ3RoXG4gICAgaiA9IDBcbiAgICB3aGlsZSBqIDwgbnVtUGFzc2VzXG4gICAgICAgIHJlc3VsdC5yZW5kZXJwYXNzW2pdID0ge31cbiAgICAgICAgcmVzdWx0LnJlbmRlcnBhc3Nbal0ub3V0cHV0cyA9IG5ldyBBcnJheVxuICAgICAgICBpID0gMFxuICAgICAgICB3aGlsZSBpIDwgNFxuICAgICAgICAgICAgb3V0cHV0SUQgPSBAbVBhc3Nlc1tqXS5tT3V0cHV0c1tpXVxuICAgICAgICAgICAgaWYgb3V0cHV0SUQgPT0gbnVsbFxuICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICByZXN1bHQucmVuZGVycGFzc1tqXS5vdXRwdXRzLnB1c2hcbiAgICAgICAgICAgICAgICBjaGFubmVsOiBpXG4gICAgICAgICAgICAgICAgaWQ6IG91dHB1dElEXG4gICAgICAgICAgICBpKytcbiAgICAgICAgcmVzdWx0LnJlbmRlcnBhc3Nbal0uaW5wdXRzID0gbmV3IEFycmF5XG4gICAgICAgIGkgPSAwXG4gICAgICAgIHdoaWxlIGkgPCA0XG4gICAgICAgICAgICBpZiBAbVBhc3Nlc1tqXS5tSW5wdXRzW2ldID09IG51bGxcbiAgICAgICAgICAgICAgICBpKytcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgcmVzdWx0LnJlbmRlcnBhc3Nbal0uaW5wdXRzLnB1c2hcbiAgICAgICAgICAgICAgICBjaGFubmVsOiBpXG4gICAgICAgICAgICAgICAgdHlwZTogQG1QYXNzZXNbal0ubUlucHV0c1tpXS5tSW5mby5tVHlwZVxuICAgICAgICAgICAgICAgIGlkOiBAbVBhc3Nlc1tqXS5tSW5wdXRzW2ldLm1JbmZvLm1JRFxuICAgICAgICAgICAgICAgIGZpbGVwYXRoOiBAbVBhc3Nlc1tqXS5tSW5wdXRzW2ldLm1JbmZvLm1TcmNcbiAgICAgICAgICAgICAgICBzYW1wbGVyOiBAbVBhc3Nlc1tqXS5tSW5wdXRzW2ldLm1JbmZvLm1TYW1wbGVyXG4gICAgICAgICAgICBpKytcbiAgICAgICAgcmVzdWx0LnJlbmRlcnBhc3Nbal0uY29kZSA9IEBtUGFzc2VzW2pdLm1Tb3VyY2VcbiAgICAgICAgcmVzdWx0LnJlbmRlcnBhc3Nbal0ubmFtZSA9IEBtUGFzc2VzW2pdLm1OYW1lXG4gICAgICAgIHJlc3VsdC5yZW5kZXJwYXNzW2pdLmRlc2NyaXB0aW9uID0gJydcbiAgICAgICAgcmVzdWx0LnJlbmRlcnBhc3Nbal0udHlwZSA9IEBtUGFzc2VzW2pdLm1UeXBlXG4gICAgICAgIGorK1xuICAgIHJlc3VsdC5mbGFncyA9IEBjYWxjRmxhZ3MoKVxuICAgIHJlc3VsdFxuXG5FZmZlY3Q6OmNhbGNGbGFncyA9IC0+XG4gICAgZmxhZ0tleWJvYXJkID0gZmFsc2VcbiAgICBmbGFnTXVsdGlwYXNzID0gZmFsc2VcbiAgICBudW1QYXNzZXMgPSBAbVBhc3Nlcy5sZW5ndGhcbiAgICBqID0gMFxuICAgIHdoaWxlIGogPCBudW1QYXNzZXNcbiAgICAgICAgcGFzcyA9IEBtUGFzc2VzW2pdXG4gICAgICAgIGlmIHBhc3MubVR5cGUgPT0gJ2J1ZmZlcidcbiAgICAgICAgICAgIGZsYWdNdWx0aXBhc3MgPSB0cnVlXG4gICAgICAgIGkgPSAwXG4gICAgICAgIHdoaWxlIGkgPCA0XG4gICAgICAgICAgICBpZiBwYXNzLm1JbnB1dHNbaV0gPT0gbnVsbFxuICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICBpZiBwYXNzLm1JbnB1dHNbaV0ubUluZm8ubVR5cGUgPT0gJ2tleWJvYXJkJ1xuICAgICAgICAgICAgICAgIGZsYWdLZXlib2FyZCA9IHRydWVcbiAgICAgICAgICAgIGkrK1xuICAgICAgICBqKytcbiAgICB7XG4gICAgICAgIG1GbGFnS2V5Ym9hcmQ6IGZsYWdLZXlib2FyZFxuICAgICAgICBtRmxhZ011bHRpcGFzczogZmxhZ011bHRpcGFzc1xuICAgIH1cbiJdfQ==
//# sourceURL=../coffee/effect.coffee