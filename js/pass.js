// koffee 1.7.0
var Pass, assetID_to_bufferID, assetID_to_cubemapBuferID, bufferID_to_assetID, cubamepBufferID_to_assetID;

bufferID_to_assetID = function(id) {
    if (id === 0) {
        return '4dXGR8';
    }
    if (id === 1) {
        return 'XsXGR8';
    }
    if (id === 2) {
        return '4sXGR8';
    }
    if (id === 3) {
        return 'XdfGR8';
    }
    return 'none';
};

assetID_to_bufferID = function(id) {
    if (id === '4dXGR8') {
        return 0;
    }
    if (id === 'XsXGR8') {
        return 1;
    }
    if (id === '4sXGR8') {
        return 2;
    }
    if (id === 'XdfGR8') {
        return 3;
    }
    return -1;
};

assetID_to_cubemapBuferID = function(id) {
    if (id === '4dX3Rr') {
        return 0;
    }
    return -1;
};

cubamepBufferID_to_assetID = function(id) {
    if (id === 0) {
        return '4dX3Rr';
    }
    return 'none';
};

Pass = function(renderer, isLowEnd, forceMuted, forcePaused, outputGainNode, copyProgram, id, effect) {
    this.mID = id;
    this.mInputs = [null, null, null, null];
    this.mOutputs = [null, null, null, null];
    this.mSource = null;
    this.mGainNode = outputGainNode;
    this.mEffect = effect;
    this.mRenderer = renderer;
    this.mProgramCopy = copyProgram;
    this.mCompilationTime = 0;
    this.mType = 'image';
    this.mName = 'none';
    this.mFrame = 0;
    this.mIsLowEnd = isLowEnd;
};

Pass.prototype.MakeHeader_Image = function() {
    var header, i, inp;
    header = '';
    header += '#define HW_PERFORMANCE ' + (this.mIsLowEnd === true ? '0' : '1') + '\n';
    header += 'uniform vec3      iResolution;\n' + 'uniform float     iTime;\n' + 'uniform float     iChannelTime[4];\n' + 'uniform vec4      iMouse;\n' + 'uniform vec4      iDate;\n' + 'uniform float     iSampleRate;\n' + 'uniform vec3      iChannelResolution[4];\n' + 'uniform int       iFrame;\n' + 'uniform float     iTimeDelta;\n' + 'uniform float     iFrameRate;\n';
    header += 'struct Channel\n';
    header += '{\n';
    header += '    vec3  resolution;\n';
    header += '    float time;\n';
    header += '};\n';
    header += 'uniform Channel iChannel[4];\n';
    i = 0;
    while (i < this.mInputs.length) {
        inp = this.mInputs[i];
        if (inp === null) {
            header += 'uniform sampler2D iChannel' + i + ';\n';
        } else if (inp.mInfo.mType === 'cubemap') {
            header += 'uniform samplerCube iChannel' + i + ';\n';
        } else {
            header += 'uniform sampler2D iChannel' + i + ';\n';
        }
        i++;
    }
    header += 'void mainImage( out vec4 c,  in vec2 f );\n';
    this.mImagePassFooter = '';
    this.mImagePassFooter += '\nout vec4 outColor;\n';
    this.mImagePassFooter += '\nvoid main( void )' + '{' + 'vec4 color = vec4(0.0,0.0,0.0,1.0);' + 'mainImage( color, gl_FragCoord.xy );' + 'color.w = 1.0;';
    this.mImagePassFooter += 'outColor = color;}';
    this.mHeader = header;
};

Pass.prototype.MakeHeader_Buffer = function() {
    var header, i, inp;
    header = '';
    header += '#define HW_PERFORMANCE ' + (this.mIsLowEnd === true ? '0' : '1') + '\n';
    header += 'uniform vec3      iResolution;\n' + 'uniform float     iTime;\n' + 'uniform float     iChannelTime[4];\n' + 'uniform vec4      iMouse;\n' + 'uniform vec4      iDate;\n' + 'uniform float     iSampleRate;\n' + 'uniform vec3      iChannelResolution[4];\n' + 'uniform int       iFrame;\n' + 'uniform float     iTimeDelta;\n' + 'uniform float     iFrameRate;\n';
    i = 0;
    while (i < this.mInputs.length) {
        inp = this.mInputs[i];
        if (inp === null) {
            header += 'uniform sampler2D iChannel' + i + ';\n';
        } else if (inp.mInfo.mType === 'cubemap') {
            header += 'uniform samplerCube iChannel' + i + ';\n';
        } else {
            header += 'uniform sampler2D iChannel' + i + ';\n';
        }
        i++;
    }
    header += 'void mainImage( out vec4 c,  in vec2 f );\n';
    this.mImagePassFooter = '';
    this.mImagePassFooter += '\nout vec4 outColor;\n';
    this.mImagePassFooter += '\nvoid main( void )\n' + '{' + 'vec4 color = vec4(0.0,0.0,0.0,1.0);' + 'mainImage( color, gl_FragCoord.xy );';
    this.mImagePassFooter += 'outColor = color; }';
    this.mHeader = header;
};

Pass.prototype.MakeHeader_Cubemap = function() {
    var header, i, inp;
    header = '';
    header += '#define HW_PERFORMANCE ' + (this.mIsLowEnd === true ? '0' : '1') + '\n';
    header += 'uniform vec3      iResolution;\n' + 'uniform float     iTime;\n' + 'uniform float     iChannelTime[4];\n' + 'uniform vec4      iMouse;\n' + 'uniform vec4      iDate;\n' + 'uniform float     iSampleRate;\n' + 'uniform vec3      iChannelResolution[4];\n' + 'uniform int       iFrame;\n' + 'uniform float     iTimeDelta;\n' + 'uniform float     iFrameRate;\n';
    i = 0;
    while (i < this.mInputs.length) {
        inp = this.mInputs[i];
        if (inp === null) {
            header += 'uniform sampler2D iChannel' + i + ';\n';
        } else if (inp.mInfo.mType === 'cubemap') {
            header += 'uniform samplerCube iChannel' + i + ';\n';
        } else {
            header += 'uniform sampler2D iChannel' + i + ';\n';
        }
        i++;
    }
    header += 'void mainCubemap( out vec4 c, in vec2 f, in vec3 ro, in vec3 rd );\n';
    this.mImagePassFooter = '\n' + 'uniform vec4 unViewport;\n' + 'uniform vec3 unCorners[5];\n';
    this.mImagePassFooter += '\nout vec4 outColor;\n';
    this.mImagePassFooter += '\nvoid main( void )\n' + '{' + 'vec4 color = vec4(0.0,0.0,0.0,1.0);' + 'vec3 ro = unCorners[4];' + 'vec2 uv = (gl_FragCoord.xy - unViewport.xy)/unViewport.zw;' + 'vec3 rd = normalize( mix( mix( unCorners[0], unCorners[1], uv.x ),' + 'mix( unCorners[3], unCorners[2], uv.x ), uv.y ) - ro);' + 'mainCubemap( color, gl_FragCoord.xy-unViewport.xy, ro, rd );';
    this.mImagePassFooter += 'outColor = color; }';
    this.mHeader = header;
};

Pass.prototype.MakeHeader_Common = function() {
    var header, headerlength;
    header = '';
    headerlength = 0;
    header += 'uniform vec4      iDate;\n' + 'uniform float     iSampleRate;\n';
    headerlength += 2;
    this.mImagePassFooter = '';
    this.mImagePassFooter += '\nout vec4 outColor;\n';
    this.mImagePassFooter += '\nvoid main( void )\n' + '{';
    this.mImagePassFooter += 'outColor = vec4(0.0); }';
    this.mHeader = header;
};

Pass.prototype.MakeHeader = function() {
    if (this.mType === 'image') {
        this.MakeHeader_Image();
    } else if (this.mType === 'buffer') {
        this.MakeHeader_Buffer();
    } else if (this.mType === 'common') {
        this.MakeHeader_Common();
    } else if (this.mType === 'cubemap') {
        this.MakeHeader_Cubemap();
    } else {
        alert('ERROR');
    }
};

Pass.prototype.Create_Image = function(wa) {
    this.MakeHeader();
    this.mSampleRate = 44100;
    this.mProgram = null;
};

Pass.prototype.Destroy_Image = function(wa) {};

Pass.prototype.Create_Buffer = function(wa) {
    this.MakeHeader();
    this.mSampleRate = 44100;
    this.mProgram = null;
};

Pass.prototype.Destroy_Buffer = function(wa) {};

Pass.prototype.Create_Cubemap = function(wa) {
    this.MakeHeader();
    this.mSampleRate = 44100;
    this.mProgram = null;
};

Pass.prototype.Destroy_Cubemap = function(wa) {};

Pass.prototype.Create_Common = function(wa) {
    this.MakeHeader();
};

Pass.prototype.Destroy_Common = function(wa) {};

Pass.prototype.Create = function(passType, passName, wa) {
    this.mType = passType;
    this.mName = passName;
    this.mSource = null;
    if (passType === 'image') {
        this.Create_Image(wa);
    } else if (passType === 'buffer') {
        this.Create_Buffer(wa);
    } else if (passType === 'common') {
        this.Create_Common(wa);
    } else if (passType === 'cubemap') {
        this.Create_Cubemap(wa);
    } else {
        alert('ERROR');
    }
};

Pass.prototype.Destroy = function(wa) {
    this.mSource = null;
    if (this.mType === 'image') {
        this.Destroy_Image(wa);
    } else if (this.mType === 'buffer') {
        this.Destroy_Buffer(wa);
    } else if (this.mType === 'common') {
        this.Destroy_Common(wa);
    } else if (this.mType === 'cubemap') {
        this.Destroy_Cubemap(wa);
    } else {
        alert('ERROR');
    }
};

Pass.prototype.NewShader_Image = function(shaderCode, commonShaderCodes) {
    var fsSource, i, res, vsSource;
    vsSource = void 0;
    vsSource = 'layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }';
    fsSource = this.mHeader;
    i = 0;
    while (i < commonShaderCodes.length) {
        fsSource += commonShaderCodes[i] + '\n';
        i++;
    }
    fsSource += shaderCode;
    fsSource += this.mImagePassFooter;
    res = this.mRenderer.CreateShader(vsSource, fsSource);
    if (res.mResult === false) {
        return res.mInfo;
    }
    if (this.mProgram !== null) {
        this.mRenderer.DestroyShader(this.mProgram);
    }
    this.mProgram = res;
    return null;
};

Pass.prototype.NewShader_Cubemap = function(shaderCode, commonShaderCodes) {
    var fsSource, i, res, vsSource;
    vsSource = void 0;
    vsSource = 'layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }';
    fsSource = this.mHeader;
    i = 0;
    while (i < commonShaderCodes.length) {
        fsSource += commonShaderCodes[i] + '\n';
        i++;
    }
    fsSource += shaderCode;
    fsSource += this.mImagePassFooter;
    res = this.mRenderer.CreateShader(vsSource, fsSource);
    if (res.mResult === false) {
        return res.mInfo;
    }
    if (this.mProgram !== null) {
        this.mRenderer.DestroyShader(this.mProgram);
    }
    this.mProgram = res;
    return null;
};

Pass.prototype.NewShader_Common = function(shaderCode) {
    var fsSource, res, vsSource;
    vsSource = void 0;
    vsSource = 'layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }';
    fsSource = this.mHeader + shaderCode + this.mImagePassFooter;
    res = this.mRenderer.CreateShader(vsSource, fsSource);
    if (res.mResult === false) {
        return res.mInfo;
    }
    if (this.mProgram !== null) {
        this.mRenderer.DestroyShader(this.mProgram);
    }
    this.mProgram = res;
    return null;
};

Pass.prototype.NewShader = function(shaderCode, commonSourceCodes) {
    var compilationTime, res, timeStart;
    if (this.mRenderer === null) {
        return null;
    }
    timeStart = performance.now();
    res = null;
    if (this.mType === 'image') {
        res = this.NewShader_Image(shaderCode, commonSourceCodes);
    } else if (this.mType === 'buffer') {
        res = this.NewShader_Image(shaderCode, commonSourceCodes);
    } else if (this.mType === 'common') {
        res = this.NewShader_Common(shaderCode);
    } else if (this.mType === 'cubemap') {
        res = this.NewShader_Cubemap(shaderCode, commonSourceCodes);
    } else {
        alert('ERROR');
    }
    compilationTime = performance.now() - timeStart;
    if (res === null) {
        this.mCompilationTime = compilationTime;
    }
    this.mSource = shaderCode;
    return res;
};

Pass.prototype.DestroyInput = function(id) {
    if (this.mInputs[id] === null) {
        return;
    }
    if (this.mInputs[id].mInfo.mType === 'texture') {
        if (this.mInputs[id].globject !== null) {
            this.mRenderer.DestroyTexture(this.mInputs[id].globject);
        }
    } else if (this.mInputs[id].mInfo.mType === 'cubemap') {
        if (this.mInputs[id].globject !== null) {
            this.mRenderer.DestroyTexture(this.mInputs[id].globject);
        }
    } else if (this.mInputs[id].mInfo.mType === 'keyboard') {

    } else {

    }
    this.mInputs[id] = null;
};

Pass.prototype.Sampler2Renderer = function(sampler) {
    var filter, vflip, wrap;
    filter = this.mRenderer.FILTER.NONE;
    if (sampler.filter === 'linear') {
        filter = this.mRenderer.FILTER.LINEAR;
    }
    if (sampler.filter === 'mipmap') {
        filter = this.mRenderer.FILTER.MIPMAP;
    }
    wrap = this.mRenderer.TEXWRP.REPEAT;
    if (sampler.wrap === 'clamp') {
        wrap = this.mRenderer.TEXWRP.CLAMP;
    }
    vflip = false;
    if (sampler.vflip === 'true') {
        vflip = true;
    }
    return {
        mFilter: filter,
        mWrap: wrap,
        mVFlip: vflip
    };
};

Pass.prototype.GetSamplerVFlip = function(id) {
    var inp;
    inp = this.mInputs[id];
    return inp.mInfo.mSampler.vflip;
};

Pass.prototype.SetSamplerVFlip = function(id, str) {
    var filter, inp, me, renderer;
    me = this;
    renderer = this.mRenderer;
    inp = this.mInputs[id];
    filter = false;
    if (str === 'true') {
        filter = true;
    }
    if (inp === null) {

    } else if (inp.mInfo.mType === 'texture') {
        if (inp.loaded) {
            renderer.SetSamplerVFlip(inp.globject, filter, inp.image);
            inp.mInfo.mSampler.vflip = str;
        }
    } else if (inp.mInfo.mType === 'cubemap') {
        if (inp.loaded) {
            renderer.SetSamplerVFlip(inp.globject, filter, inp.image);
            inp.mInfo.mSampler.vflip = str;
        }
    }
};

Pass.prototype.GetAcceptsVFlip = function(id) {
    var inp;
    inp = this.mInputs[id];
    if (inp === null) {
        return false;
    }
    if (inp.mInfo.mType === 'texture') {
        return true;
    }
    if (inp.mInfo.mType === 'cubemap') {
        return true;
    }
    if (inp.mInfo.mType === 'keyboard') {
        return false;
    }
    if (inp.mInfo.mType === 'buffer') {
        return false;
    }
    return true;
};

Pass.prototype.GetSamplerFilter = function(id) {
    var inp;
    inp = this.mInputs[id];
    if (inp === null) {
        return;
    }
    return inp.mInfo.mSampler.filter;
};

Pass.prototype.SetSamplerFilter = function(id, str, buffers, cubeBuffers) {
    var filter, inp, me, renderer;
    me = this;
    renderer = this.mRenderer;
    inp = this.mInputs[id];
    filter = renderer.FILTER.NONE;
    if (str === 'linear') {
        filter = renderer.FILTER.LINEAR;
    }
    if (str === 'mipmap') {
        filter = renderer.FILTER.MIPMAP;
    }
    if (inp === null) {

    } else if (inp.mInfo.mType === 'texture') {
        if (inp.loaded) {
            renderer.SetSamplerFilter(inp.globject, filter, true);
            inp.mInfo.mSampler.filter = str;
        }
    } else if (inp.mInfo.mType === 'cubemap') {
        if (inp.loaded) {
            if (assetID_to_cubemapBuferID(inp.mInfo.mID) === 0) {
                renderer.SetSamplerFilter(cubeBuffers[id].mTexture[0], filter, true);
                renderer.SetSamplerFilter(cubeBuffers[id].mTexture[1], filter, true);
                inp.mInfo.mSampler.filter = str;
            } else {
                renderer.SetSamplerFilter(inp.globject, filter, true);
                inp.mInfo.mSampler.filter = str;
            }
        }
    } else if (inp.mInfo.mType === 'buffer') {
        renderer.SetSamplerFilter(buffers[inp.id].mTexture[0], filter, true);
        renderer.SetSamplerFilter(buffers[inp.id].mTexture[1], filter, true);
        inp.mInfo.mSampler.filter = str;
    } else if (inp.mInfo.mType === 'keyboard') {
        inp.mInfo.mSampler.filter = str;
    }
};

Pass.prototype.GetAcceptsMipmapping = function(id) {
    var inp;
    inp = this.mInputs[id];
    if (inp === null) {
        return false;
    }
    if (inp.mInfo.mType === 'texture') {
        return true;
    }
    if (inp.mInfo.mType === 'cubemap') {
        return true;
    }
    if (inp.mInfo.mType === 'keyboard') {
        return false;
    }
    if (inp.mInfo.mType === 'buffer') {
        return true;
    }
    return false;
};

Pass.prototype.GetAcceptsLinear = function(id) {
    var inp;
    inp = this.mInputs[id];
    if (inp === null) {
        return false;
    }
    if (inp.mInfo.mType === 'texture') {
        return true;
    }
    if (inp.mInfo.mType === 'cubemap') {
        return true;
    }
    if (inp.mInfo.mType === 'keyboard') {
        return false;
    }
    if (inp.mInfo.mType === 'buffer') {
        return true;
    }
    return false;
};

Pass.prototype.GetAcceptsWrapRepeat = function(id) {
    var inp;
    inp = this.mInputs[id];
    if (inp === null) {
        return false;
    }
    if (inp.mInfo.mType === 'texture') {
        return true;
    }
    if (inp.mInfo.mType === 'cubemap') {
        return false;
    }
    if (inp.mInfo.mType === 'keyboard') {
        return false;
    }
    if (inp.mInfo.mType === 'buffer') {
        return true;
    }
    return false;
};

Pass.prototype.GetSamplerWrap = function(id) {
    var inp;
    inp = this.mInputs[id];
    return inp.mInfo.mSampler.wrap;
};

Pass.prototype.SetSamplerWrap = function(id, str, buffers) {
    var inp, me, renderer, restr;
    me = this;
    renderer = this.mRenderer;
    inp = this.mInputs[id];
    restr = renderer.TEXWRP.REPEAT;
    if (str === 'clamp') {
        restr = renderer.TEXWRP.CLAMP;
    }
    if (inp === null) {

    } else if (inp.mInfo.mType === 'texture') {
        if (inp.loaded) {
            renderer.SetSamplerWrap(inp.globject, restr);
            inp.mInfo.mSampler.wrap = str;
        }
    } else if (inp.mInfo.mType === 'cubemap') {
        if (inp.loaded) {
            renderer.SetSamplerWrap(inp.globject, restr);
            inp.mInfo.mSampler.wrap = str;
        }
    } else if (inp.mInfo.mType === 'buffer') {
        renderer.SetSamplerWrap(buffers[inp.id].mTexture[0], restr);
        renderer.SetSamplerWrap(buffers[inp.id].mTexture[1], restr);
        inp.mInfo.mSampler.wrap = str;
    }
};

Pass.prototype.GetTexture = function(slot) {
    var inp;
    inp = this.mInputs[slot];
    if (inp === null) {
        return null;
    }
    return inp.mInfo;
};

Pass.prototype.SetOutputs = function(slot, id) {
    this.mOutputs[slot] = id;
};

Pass.prototype.SetOutputsByBufferID = function(slot, id) {
    if (this.mType === 'buffer') {
        this.mOutputs[slot] = bufferID_to_assetID(id);
        this.mEffect.ResizeBuffer(id, this.mEffect.mXres, this.mEffect.mYres, false);
    } else if (this.mType === 'cubemap') {
        this.mOutputs[slot] = cubamepBufferID_to_assetID(id);
        this.mEffect.ResizeCubemapBuffer(id, 1024, 1024);
    }
};

Pass.prototype.NewTexture = function(wa, slot, url, buffers, cubeBuffers, keyboard) {
    var returnValue;
    var returnValue;
    var returnValue;
    var i, me, n, numLoaded, renderer, returnValue, rti, texture;
    me = this;
    renderer = this.mRenderer;
    if (renderer === null) {
        return;
    }
    texture = null;
    if (url === null || url.mType === null) {
        me.DestroyInput(slot);
        me.mInputs[slot] = null;
        me.MakeHeader();
        return {
            mFailed: false,
            mNeedsShaderCompile: false
        };
    } else if (url.mType === 'texture') {
        texture = {};
        texture.mInfo = url;
        texture.globject = null;
        texture.loaded = false;
        texture.image = new Image;
        texture.image.crossOrigin = '';
        texture.image.onload = function() {
            var channels, rti;
            rti = me.Sampler2Renderer(url.mSampler);
            channels = renderer.TEXFMT.C4I8;
            if (url.mID === 'Xdf3zn' || url.mID === '4sf3Rn' || url.mID === '4dXGzn' || url.mID === '4sf3Rr') {
                channels = renderer.TEXFMT.C1I8;
            }
            texture.globject = renderer.CreateTextureFromImage(renderer.TEXTYPE.T2D, texture.image, channels, rti.mFilter, rti.mWrap, rti.mVFlip);
            texture.loaded = true;
        };
        texture.image.src = url.mSrc;
        returnValue = {
            mFailed: false,
            mNeedsShaderCompile: this.mInputs[slot] === null || this.mInputs[slot].mInfo.mType !== 'texture' && this.mInputs[slot].mInfo.mType !== 'keyboard'
        };
        this.DestroyInput(slot);
        this.mInputs[slot] = texture;
        this.MakeHeader();
        return returnValue;
    } else if (url.mType === 'cubemap') {
        texture = {};
        texture.mInfo = url;
        texture.globject = null;
        texture.loaded = false;
        rti = me.Sampler2Renderer(url.mSampler);
        if (assetID_to_cubemapBuferID(url.mID) !== -1) {
            texture.mImage = new Image;
            texture.mImage.onload = function() {
                texture.loaded = true;
            };
            texture.mImage.src = '/media/previz/cubemap00.png';
            this.mEffect.ResizeCubemapBuffer(0, 1024, 1024);
        } else {
            texture.image = [new Image, new Image, new Image, new Image, new Image, new Image];
            numLoaded = 0;
            i = 0;
            while (i < 6) {
                texture.image[i].mId = i;
                texture.image[i].crossOrigin = '';
                texture.image[i].onload = function() {
                    var id;
                    id = this.mId;
                    numLoaded++;
                    if (numLoaded === 6) {
                        texture.globject = renderer.CreateTextureFromImage(renderer.TEXTYPE.CUBEMAP, texture.image, renderer.TEXFMT.C4I8, rti.mFilter, rti.mWrap, rti.mVFlip);
                        texture.loaded = true;
                    }
                };
                if (i === 0) {
                    texture.image[i].src = url.mSrc;
                } else {
                    n = url.mSrc.lastIndexOf('.');
                    texture.image[i].src = url.mSrc.substring(0, n) + '_' + i + url.mSrc.substring(n, url.mSrc.length);
                }
                i++;
            }
        }
        returnValue = {
            mFailed: false,
            mNeedsShaderCompile: this.mInputs[slot] === null || this.mInputs[slot].mInfo.mType !== 'cubemap'
        };
        this.DestroyInput(slot);
        this.mInputs[slot] = texture;
        this.MakeHeader();
        return returnValue;
    } else if (url.mType === 'keyboard') {
        texture = {};
        texture.mInfo = url;
        texture.globject = null;
        texture.loaded = true;
        texture.keyboard = {};
        returnValue = {
            mFailed: false,
            mNeedsShaderCompile: this.mInputs[slot] === null || this.mInputs[slot].mInfo.mType !== 'texture' && this.mInputs[slot].mInfo.mType !== 'keyboard'
        };
        this.DestroyInput(slot);
        this.mInputs[slot] = texture;
        this.MakeHeader();
        return returnValue;
    } else if (url.mType === 'buffer') {
        texture = {};
        texture.mInfo = url;
        texture.image = new Image;
        texture.image.onload = function() {};
        texture.image.src = url.mSrc;
        texture.id = assetID_to_bufferID(url.mID);
        texture.loaded = true;
        returnValue = {
            mFailed: false,
            mNeedsShaderCompile: this.mInputs[slot] === null || this.mInputs[slot].mInfo.mType !== 'texture' && this.mInputs[slot].mInfo.mType !== 'keyboard'
        };
        this.DestroyInput(slot);
        this.mInputs[slot] = texture;
        this.mEffect.ResizeBuffer(texture.id, this.mEffect.mXres, this.mEffect.mYres, false);
        this.SetSamplerFilter(slot, url.mSampler.filter, buffers, cubeBuffers, true);
        this.SetSamplerVFlip(slot, url.mSampler.vflip);
        this.SetSamplerWrap(slot, url.mSampler.wrap, buffers);
        this.MakeHeader();
        return returnValue;
    } else {
        alert('input type error');
        return {
            mFailed: true
        };
    }
    return {
        mFailed: true
    };
};

Pass.prototype.Paint_Image = function(wa, d, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard) {
    var id;
    var filter;
    var dates, filter, i, id, inp, l1, mouse, prog, resos, texID, times;
    times = [0.0, 0.0, 0.0, 0.0];
    dates = [d.getFullYear(), d.getMonth(), d.getDate(), d.getHours() * 60.0 * 60 + d.getMinutes() * 60 + d.getSeconds() + d.getMilliseconds() / 1000.0];
    mouse = [mousePosX, mousePosY, mouseOriX, mouseOriY];
    resos = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    texID = [null, null, null, null];
    i = 0;
    while (i < this.mInputs.length) {
        inp = this.mInputs[i];
        if (inp === null) {

        } else if (inp.mInfo.mType === 'texture') {
            if (inp.loaded === true) {
                texID[i] = inp.globject;
                resos[3 * i + 0] = inp.image.width;
                resos[3 * i + 1] = inp.image.height;
                resos[3 * i + 2] = 1;
            }
        } else if (inp.mInfo.mType === 'keyboard') {
            texID[i] = keyboard.mTexture;
        } else if (inp.mInfo.mType === 'cubemap') {
            if (inp.loaded === true) {
                id = assetID_to_cubemapBuferID(inp.mInfo.mID);
                if (id !== -1) {
                    texID[i] = cubeBuffers[id].mTexture[cubeBuffers[id].mLastRenderDone];
                    resos[3 * i + 0] = cubeBuffers[id].mResolution[0];
                    resos[3 * i + 1] = cubeBuffers[id].mResolution[1];
                    resos[3 * i + 2] = 1;
                    filter = this.mRenderer.FILTER.NONE;
                    if (inp.mInfo.mSampler.filter === 'linear') {
                        filter = this.mRenderer.FILTER.LINEAR;
                    } else if (inp.mInfo.mSampler.filter === 'mipmap') {
                        filter = this.mRenderer.FILTER.MIPMAP;
                    }
                    this.mRenderer.SetSamplerFilter(texID[i], filter, false);
                } else {
                    texID[i] = inp.globject;
                }
            }
        } else if (inp.mInfo.mType === 'buffer') {
            if (inp.loaded === true) {
                id = inp.id;
                texID[i] = buffers[id].mTexture[buffers[id].mLastRenderDone];
                resos[3 * i + 0] = xres;
                resos[3 * i + 1] = yres;
                resos[3 * i + 2] = 1;
                filter = this.mRenderer.FILTER.NONE;
                if (inp.mInfo.mSampler.filter === 'linear') {
                    filter = this.mRenderer.FILTER.LINEAR;
                } else if (inp.mInfo.mSampler.filter === 'mipmap') {
                    filter = this.mRenderer.FILTER.MIPMAP;
                }
                this.mRenderer.SetSamplerFilter(texID[i], filter, false);
            }
        }
        i++;
    }
    this.mRenderer.AttachTextures(4, texID[0], texID[1], texID[2], texID[3]);
    prog = this.mProgram;
    this.mRenderer.AttachShader(prog);
    this.mRenderer.SetShaderConstant1F('iTime', time);
    this.mRenderer.SetShaderConstant3F('iResolution', xres, yres, 1.0);
    this.mRenderer.SetShaderConstant4FV('iMouse', mouse);
    this.mRenderer.SetShaderConstant4FV('iDate', dates);
    this.mRenderer.SetShaderConstant1F('iSampleRate', this.mSampleRate);
    this.mRenderer.SetShaderTextureUnit('iChannel0', 0);
    this.mRenderer.SetShaderTextureUnit('iChannel1', 1);
    this.mRenderer.SetShaderTextureUnit('iChannel2', 2);
    this.mRenderer.SetShaderTextureUnit('iChannel3', 3);
    this.mRenderer.SetShaderConstant1I('iFrame', this.mFrame);
    this.mRenderer.SetShaderConstant1F('iTimeDelta', dtime);
    this.mRenderer.SetShaderConstant1F('iFrameRate', fps);
    this.mRenderer.SetShaderConstant1F('iChannel[0].time', times[0]);
    this.mRenderer.SetShaderConstant1F('iChannel[1].time', times[1]);
    this.mRenderer.SetShaderConstant1F('iChannel[2].time', times[2]);
    this.mRenderer.SetShaderConstant1F('iChannel[3].time', times[3]);
    this.mRenderer.SetShaderConstant3F('iChannel[0].resolution', resos[0], resos[1], resos[2]);
    this.mRenderer.SetShaderConstant3F('iChannel[1].resolution', resos[3], resos[4], resos[5]);
    this.mRenderer.SetShaderConstant3F('iChannel[2].resolution', resos[6], resos[7], resos[8]);
    this.mRenderer.SetShaderConstant3F('iChannel[3].resolution', resos[9], resos[10], resos[11]);
    l1 = this.mRenderer.GetAttribLocation(this.mProgram, 'pos');
    this.mRenderer.SetViewport([0, 0, xres, yres]);
    this.mRenderer.DrawFullScreenTriangle_XY(l1);
    this.mRenderer.DettachTextures();
};

Pass.prototype.SetUniforms = function(wa, d, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard) {
    var dates, filter, i, id, inp, mouse, resos, texID, times;
    times = [0.0, 0.0, 0.0, 0.0];
    dates = [d.getFullYear(), d.getMonth(), d.getDate(), d.getHours() * 60.0 * 60 + d.getMinutes() * 60 + d.getSeconds() + d.getMilliseconds() / 1000.0];
    mouse = [mousePosX, mousePosY, mouseOriX, mouseOriY];
    resos = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    texID = [null, null, null, null];
    i = 0;
    while (i < this.mInputs.length) {
        inp = this.mInputs[i];
        if (inp === null) {

        } else if (inp.mInfo.mType === 'texture') {
            if (inp.loaded === true) {
                texID[i] = inp.globject;
                resos[3 * i + 0] = inp.image.width;
                resos[3 * i + 1] = inp.image.height;
                resos[3 * i + 2] = 1;
            }
        } else if (inp.mInfo.mType === 'keyboard') {
            texID[i] = keyboard.mTexture;
        } else if (inp.mInfo.mType === 'cubemap') {
            if (inp.loaded === true) {
                id = assetID_to_cubemapBuferID(inp.mInfo.mID);
                if (id !== -1) {
                    texID[i] = cubeBuffers[id].mTexture[cubeBuffers[id].mLastRenderDone];
                    resos[3 * i + 0] = cubeBuffers[id].mResolution[0];
                    resos[3 * i + 1] = cubeBuffers[id].mResolution[1];
                    resos[3 * i + 2] = 1;
                    filter = this.mRenderer.FILTER.NONE;
                    if (inp.mInfo.mSampler.filter === 'linear') {
                        filter = this.mRenderer.FILTER.LINEAR;
                    } else if (inp.mInfo.mSampler.filter === 'mipmap') {
                        filter = this.mRenderer.FILTER.MIPMAP;
                    }
                    this.mRenderer.SetSamplerFilter(texID[i], filter, false);
                } else {
                    texID[i] = inp.globject;
                }
            }
        } else if (inp.mInfo.mType === 'buffer') {
            if (inp.loaded === true) {
                texID[i] = buffers[inp.id].mTexture[buffers[inp.id].mLastRenderDone];
                resos[3 * i + 0] = xres;
                resos[3 * i + 1] = yres;
                resos[3 * i + 2] = 1;
            }
        }
        i++;
    }
    this.mRenderer.AttachTextures(4, texID[0], texID[1], texID[2], texID[3]);
    this.mRenderer.AttachShader(this.mProgram);
    this.mRenderer.SetShaderConstant1F('iTime', time);
    this.mRenderer.SetShaderConstant3F('iResolution', xres, yres, 1.0);
    this.mRenderer.SetShaderConstant4FV('iMouse', mouse);
    this.mRenderer.SetShaderConstant4FV('iDate', dates);
    this.mRenderer.SetShaderConstant1F('iSampleRate', this.mSampleRate);
    this.mRenderer.SetShaderTextureUnit('iChannel0', 0);
    this.mRenderer.SetShaderTextureUnit('iChannel1', 1);
    this.mRenderer.SetShaderTextureUnit('iChannel2', 2);
    this.mRenderer.SetShaderTextureUnit('iChannel3', 3);
    this.mRenderer.SetShaderConstant1I('iFrame', this.mFrame);
    this.mRenderer.SetShaderConstant1F('iTimeDelta', dtime);
    this.mRenderer.SetShaderConstant1F('iFrameRate', fps);
    this.mRenderer.SetShaderConstant1F('iChannel[0].time', times[0]);
    this.mRenderer.SetShaderConstant1F('iChannel[1].time', times[1]);
    this.mRenderer.SetShaderConstant1F('iChannel[2].time', times[2]);
    this.mRenderer.SetShaderConstant1F('iChannel[3].time', times[3]);
    this.mRenderer.SetShaderConstant3F('iChannel[0].resolution', resos[0], resos[1], resos[2]);
    this.mRenderer.SetShaderConstant3F('iChannel[1].resolution', resos[3], resos[4], resos[5]);
    this.mRenderer.SetShaderConstant3F('iChannel[2].resolution', resos[6], resos[7], resos[8]);
    this.mRenderer.SetShaderConstant3F('iChannel[3].resolution', resos[9], resos[10], resos[11]);
};

Pass.prototype.ProcessInputs = function(wa, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard) {
    var filter, i, id, inp, texID;
    i = 0;
    while (i < this.mInputs.length) {
        inp = this.mInputs[i];
        if (inp === null) {

        } else {

        }
        if (inp.mInfo.mType === 'buffer') {
            if (inp.loaded === true) {
                id = inp.id;
                texID = buffers[id].mTexture[buffers[id].mLastRenderDone];
                filter = this.mRenderer.FILTER.NONE;
                if (inp.mInfo.mSampler.filter === 'linear') {
                    filter = this.mRenderer.FILTER.LINEAR;
                } else if (inp.mInfo.mSampler.filter === 'mipmap') {
                    filter = this.mRenderer.FILTER.MIPMAP;
                }
                this.mRenderer.SetSamplerFilter(texID, filter, false);
            }
        }
        i++;
    }
};

Pass.prototype.Paint_Cubemap = function(wa, d, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard, face) {
    var apex, corA, corB, corC, corD, corners, l1, vp;
    this.ProcessInputs(wa, d, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard, face);
    this.SetUniforms(wa, d, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard);
    l1 = this.mRenderer.GetAttribLocation(this.mProgram, 'pos');
    vp = [0, 0, xres, yres];
    this.mRenderer.SetViewport(vp);
    corA = [-1.0, -1.0, -1.0];
    corB = [1.0, -1.0, -1.0];
    corC = [1.0, 1.0, -1.0];
    corD = [-1.0, 1.0, -1.0];
    apex = [0.0, 0.0, 0.0];
    if (face === 0) {
        corA = [1.0, 1.0, 1.0];
        corB = [1.0, 1.0, -1.0];
        corC = [1.0, -1.0, -1.0];
        corD = [1.0, -1.0, 1.0];
    } else if (face === 1) {
        corA = [-1.0, 1.0, -1.0];
        corB = [-1.0, 1.0, 1.0];
        corC = [-1.0, -1.0, 1.0];
        corD = [-1.0, -1.0, -1.0];
    } else if (face === 2) {
        corA = [-1.0, 1.0, -1.0];
        corB = [1.0, 1.0, -1.0];
        corC = [1.0, 1.0, 1.0];
        corD = [-1.0, 1.0, 1.0];
    } else if (face === 3) {
        corA = [-1.0, -1.0, 1.0];
        corB = [1.0, -1.0, 1.0];
        corC = [1.0, -1.0, -1.0];
        corD = [-1.0, -1.0, -1.0];
    } else if (face === 4) {
        corA = [-1.0, 1.0, 1.0];
        corB = [1.0, 1.0, 1.0];
        corC = [1.0, -1.0, 1.0];
        corD = [-1.0, -1.0, 1.0];
    } else {
        corA = [1.0, 1.0, -1.0];
        corB = [-1.0, 1.0, -1.0];
        corC = [-1.0, -1.0, -1.0];
        corD = [1.0, -1.0, -1.0];
    }
    corners = [corA[0], corA[1], corA[2], corB[0], corB[1], corB[2], corC[0], corC[1], corC[2], corD[0], corD[1], corD[2], apex[0], apex[1], apex[2]];
    this.mRenderer.SetShaderConstant3FV('unCorners', corners);
    this.mRenderer.SetShaderConstant4FV('unViewport', vp);
    this.mRenderer.DrawUnitQuad_XY(l1);
    this.mRenderer.DettachTextures();
};

Pass.prototype.Paint = function(wa, da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, isPaused, bufferID, bufferNeedsMimaps, buffers, cubeBuffers, keyboard, effect) {
    var buffer;
    var dstID;
    var buffer, dstID, face;
    if (this.mType === 'image') {
        this.mRenderer.SetRenderTarget(null);
        this.Paint_Image(wa, da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard);
        this.mFrame++;
    } else if (this.mType === 'common') {

    } else if (this.mType === 'buffer') {
        this.mEffect.ResizeBuffer(bufferID, this.mEffect.mXres, this.mEffect.mYres, false);
        buffer = buffers[bufferID];
        dstID = 1 - buffer.mLastRenderDone;
        this.mRenderer.SetRenderTarget(buffer.mTarget[dstID]);
        this.Paint_Image(wa, da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard);
        if (bufferNeedsMimaps) {
            this.mRenderer.CreateMipmaps(buffer.mTexture[dstID]);
        }
        buffers[bufferID].mLastRenderDone = 1 - buffers[bufferID].mLastRenderDone;
        this.mFrame++;
    } else if (this.mType === 'cubemap') {
        this.mEffect.ResizeCubemapBuffer(bufferID, 1024, 1024, false);
        buffer = cubeBuffers[bufferID];
        xres = buffer.mResolution[0];
        yres = buffer.mResolution[1];
        dstID = 1 - buffer.mLastRenderDone;
        face = 0;
        while (face < 6) {
            this.mRenderer.SetRenderTargetCubeMap(buffer.mTarget[dstID], face);
            this.Paint_Cubemap(wa, da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard, face);
            face++;
        }
        this.mRenderer.SetRenderTargetCubeMap(null, 0);
        if (bufferNeedsMimaps) {
            this.mRenderer.CreateMipmaps(buffer.mTexture[dstID]);
        }
        cubeBuffers[bufferID].mLastRenderDone = 1 - cubeBuffers[bufferID].mLastRenderDone;
        this.mFrame++;
    }
};

Pass.prototype.GetCompilationTime = function() {
    return this.mCompilationTime;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFzcy5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUE7O0FBQUEsbUJBQUEsR0FBc0IsU0FBQyxFQUFEO0lBQ2xCLElBQUcsRUFBQSxLQUFNLENBQVQ7QUFDSSxlQUFPLFNBRFg7O0lBRUEsSUFBRyxFQUFBLEtBQU0sQ0FBVDtBQUNJLGVBQU8sU0FEWDs7SUFFQSxJQUFHLEVBQUEsS0FBTSxDQUFUO0FBQ0ksZUFBTyxTQURYOztJQUVBLElBQUcsRUFBQSxLQUFNLENBQVQ7QUFDSSxlQUFPLFNBRFg7O1dBRUE7QUFUa0I7O0FBV3RCLG1CQUFBLEdBQXNCLFNBQUMsRUFBRDtJQUNsQixJQUFHLEVBQUEsS0FBTSxRQUFUO0FBQ0ksZUFBTyxFQURYOztJQUVBLElBQUcsRUFBQSxLQUFNLFFBQVQ7QUFDSSxlQUFPLEVBRFg7O0lBRUEsSUFBRyxFQUFBLEtBQU0sUUFBVDtBQUNJLGVBQU8sRUFEWDs7SUFFQSxJQUFHLEVBQUEsS0FBTSxRQUFUO0FBQ0ksZUFBTyxFQURYOztXQUVBLENBQUM7QUFUaUI7O0FBV3RCLHlCQUFBLEdBQTRCLFNBQUMsRUFBRDtJQUN4QixJQUFHLEVBQUEsS0FBTSxRQUFUO0FBQ0ksZUFBTyxFQURYOztXQUVBLENBQUM7QUFIdUI7O0FBSzVCLDBCQUFBLEdBQTZCLFNBQUMsRUFBRDtJQUN6QixJQUFHLEVBQUEsS0FBTSxDQUFUO0FBQ0ksZUFBTyxTQURYOztXQUVBO0FBSHlCOztBQUs3QixJQUFBLEdBQU8sU0FBQyxRQUFELEVBQVcsUUFBWCxFQUFxQixVQUFyQixFQUFpQyxXQUFqQyxFQUE4QyxjQUE5QyxFQUE4RCxXQUE5RCxFQUEyRSxFQUEzRSxFQUErRSxNQUEvRTtJQUNILElBQUMsQ0FBQSxHQUFELEdBQU87SUFDUCxJQUFDLENBQUEsT0FBRCxHQUFXLENBQ1AsSUFETyxFQUVQLElBRk8sRUFHUCxJQUhPLEVBSVAsSUFKTztJQU1YLElBQUMsQ0FBQSxRQUFELEdB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R0FoQkM7O0FBcEJLOztBQXVDZCxJQUFJLENBQUEsU0FBRSxDQUFBLGtCQUFOLEdBQTJCLFNBQUE7V0FDdkIsSUFBQyxDQUFBO0FBRHNCIiwic291cmNlc0NvbnRlbnQiOlsiYnVmZmVySURfdG9fYXNzZXRJRCA9IChpZCkgLT5cbiAgICBpZiBpZCA9PSAwXG4gICAgICAgIHJldHVybiAnNGRYR1I4J1xuICAgIGlmIGlkID09IDFcbiAgICAgICAgcmV0dXJuICdYc1hHUjgnXG4gICAgaWYgaWQgPT0gMlxuICAgICAgICByZXR1cm4gJzRzWEdSOCdcbiAgICBpZiBpZCA9PSAzXG4gICAgICAgIHJldHVybiAnWGRmR1I4J1xuICAgICdub25lJ1xuXG5hc3NldElEX3RvX2J1ZmZlcklEID0gKGlkKSAtPlxuICAgIGlmIGlkID09ICc0ZFhHUjgnXG4gICAgICAgIHJldHVybiAwXG4gICAgaWYgaWQgPT0gJ1hzWEdSOCdcbiAgICAgICAgcmV0dXJuIDFcbiAgICBpZiBpZCA9PSAnNHNYR1I4J1xuICAgICAgICByZXR1cm4gMlxuICAgIGlmIGlkID09ICdYZGZHUjgnXG4gICAgICAgIHJldHVybiAzXG4gICAgLTFcblxuYXNzZXRJRF90b19jdWJlbWFwQnVmZXJJRCA9IChpZCkgLT5cbiAgICBpZiBpZCA9PSAnNGRYM1JyJ1xuICAgICAgICByZXR1cm4gMFxuICAgIC0xXG5cbmN1YmFtZXBCdWZmZXJJRF90b19hc3NldElEID0gKGlkKSAtPlxuICAgIGlmIGlkID09IDBcbiAgICAgICAgcmV0dXJuICc0ZFgzUnInXG4gICAgJ25vbmUnXG5cblBhc3MgPSAocmVuZGVyZXIsIGlzTG93RW5kLCBmb3JjZU11dGVkLCBmb3JjZVBhdXNlZCwgb3V0cHV0R2Fpbk5vZGUsIGNvcHlQcm9ncmFtLCBpZCwgZWZmZWN0KSAtPlxuICAgIEBtSUQgPSBpZFxuICAgIEBtSW5wdXRzID0gW1xuICAgICAgICBudWxsXG4gICAgICAgIG51bGxcbiAgICAgICAgbnVsbFxuICAgICAgICBudWxsXG4gICAgXVxuICAgIEBtT3V0cHV0cyA9IFtcbiAgICAgICAgbnVsbFxuICAgICAgICBudWxsXG4gICAgICAgIG51bGxcbiAgICAgICAgbnVsbFxuICAgIF1cbiAgICBAbVNvdXJjZSA9IG51bGxcbiAgICBAbUdhaW5Ob2RlID0gb3V0cHV0R2Fpbk5vZGVcbiAgICBAbUVmZmVjdCA9IGVmZmVjdFxuICAgIEBtUmVuZGVyZXIgPSByZW5kZXJlclxuICAgIEBtUHJvZ3JhbUNvcHkgPSBjb3B5UHJvZ3JhbVxuICAgIEBtQ29tcGlsYXRpb25UaW1lID0gMFxuICAgIEBtVHlwZSA9ICdpbWFnZSdcbiAgICBAbU5hbWUgPSAnbm9uZSdcbiAgICBAbUZyYW1lID0gMFxuICAgIEBtSXNMb3dFbmQgPSBpc0xvd0VuZFxuICAgIHJldHVyblxuXG5QYXNzOjpNYWtlSGVhZGVyX0ltYWdlID0gLT5cbiAgICBoZWFkZXIgPSAnJ1xuICAgIGhlYWRlciArPSAnI2RlZmluZSBIV19QRVJGT1JNQU5DRSAnICsgKGlmIEBtSXNMb3dFbmQgPT0gdHJ1ZSB0aGVuICcwJyBlbHNlICcxJykgKyAnXFxuJ1xuICAgIGhlYWRlciArPSAndW5pZm9ybSB2ZWMzICAgICAgaVJlc29sdXRpb247XFxuJyArICd1bmlmb3JtIGZsb2F0ICAgICBpVGltZTtcXG4nICsgJ3VuaWZvcm0gZmxvYXQgICAgIGlDaGFubmVsVGltZVs0XTtcXG4nICsgJ3VuaWZvcm0gdmVjNCAgICAgIGlNb3VzZTtcXG4nICsgJ3VuaWZvcm0gdmVjNCAgICAgIGlEYXRlO1xcbicgKyAndW5pZm9ybSBmbG9hdCAgICAgaVNhbXBsZVJhdGU7XFxuJyArICd1bmlmb3JtIHZlYzMgICAgICBpQ2hhbm5lbFJlc29sdXRpb25bNF07XFxuJyArICd1bmlmb3JtIGludCAgICAgICBpRnJhbWU7XFxuJyArICd1bmlmb3JtIGZsb2F0ICAgICBpVGltZURlbHRhO1xcbicgKyAndW5pZm9ybSBmbG9hdCAgICAgaUZyYW1lUmF0ZTtcXG4nXG4gICAgaGVhZGVyICs9ICdzdHJ1Y3QgQ2hhbm5lbFxcbidcbiAgICBoZWFkZXIgKz0gJ3tcXG4nXG4gICAgaGVhZGVyICs9ICcgICAgdmVjMyAgcmVzb2x1dGlvbjtcXG4nXG4gICAgaGVhZGVyICs9ICcgICAgZmxvYXQgdGltZTtcXG4nXG4gICAgaGVhZGVyICs9ICd9O1xcbidcbiAgICBoZWFkZXIgKz0gJ3VuaWZvcm0gQ2hhbm5lbCBpQ2hhbm5lbFs0XTtcXG4nXG4gICAgaSA9IDBcbiAgICB3aGlsZSBpIDwgQG1JbnB1dHMubGVuZ3RoXG4gICAgICAgIGlucCA9IEBtSW5wdXRzW2ldXG4gICAgICAgIGlmIGlucCA9PSBudWxsXG4gICAgICAgICAgICBoZWFkZXIgKz0gJ3VuaWZvcm0gc2FtcGxlcjJEIGlDaGFubmVsJyArIGkgKyAnO1xcbidcbiAgICAgICAgZWxzZSBpZiBpbnAubUluZm8ubVR5cGUgPT0gJ2N1YmVtYXAnXG4gICAgICAgICAgICBoZWFkZXIgKz0gJ3VuaWZvcm0gc2FtcGxlckN1YmUgaUNoYW5uZWwnICsgaSArICc7XFxuJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgICBoZWFkZXIgKz0gJ3VuaWZvcm0gc2FtcGxlcjJEIGlDaGFubmVsJyArIGkgKyAnO1xcbidcbiAgICAgICAgaSsrXG4gICAgaGVhZGVyICs9ICd2b2lkIG1haW5JbWFnZSggb3V0IHZlYzQgYywgIGluIHZlYzIgZiApO1xcbidcbiAgICBAbUltYWdlUGFzc0Zvb3RlciA9ICcnXG4gICAgQG1JbWFnZVBhc3NGb290ZXIgKz0gJ1xcbm91dCB2ZWM0IG91dENvbG9yO1xcbidcbiAgICBAbUltYWdlUGFzc0Zvb3RlciArPSAnXFxudm9pZCBtYWluKCB2b2lkICknICsgJ3snICsgJ3ZlYzQgY29sb3IgPSB2ZWM0KDAuMCwwLjAsMC4wLDEuMCk7JyArICdtYWluSW1hZ2UoIGNvbG9yLCBnbF9GcmFnQ29vcmQueHkgKTsnICsgJ2NvbG9yLncgPSAxLjA7J1xuICAgIEBtSW1hZ2VQYXNzRm9vdGVyICs9ICdvdXRDb2xvciA9IGNvbG9yO30nXG4gICAgQG1IZWFkZXIgPSBoZWFkZXJcbiAgICByZXR1cm5cblxuUGFzczo6TWFrZUhlYWRlcl9CdWZmZXIgPSAtPlxuICAgIGhlYWRlciA9ICcnXG4gICAgaGVhZGVyICs9ICcjZGVmaW5lIEhXX1BFUkZPUk1BTkNFICcgKyAoaWYgQG1Jc0xvd0VuZCA9PSB0cnVlIHRoZW4gJzAnIGVsc2UgJzEnKSArICdcXG4nXG4gICAgaGVhZGVyICs9ICd1bmlmb3JtIHZlYzMgICAgICBpUmVzb2x1dGlvbjtcXG4nICsgJ3VuaWZvcm0gZmxvYXQgICAgIGlUaW1lO1xcbicgKyAndW5pZm9ybSBmbG9hdCAgICAgaUNoYW5uZWxUaW1lWzRdO1xcbicgKyAndW5pZm9ybSB2ZWM0ICAgICAgaU1vdXNlO1xcbicgKyAndW5pZm9ybSB2ZWM0ICAgICAgaURhdGU7XFxuJyArICd1bmlmb3JtIGZsb2F0ICAgICBpU2FtcGxlUmF0ZTtcXG4nICsgJ3VuaWZvcm0gdmVjMyAgICAgIGlDaGFubmVsUmVzb2x1dGlvbls0XTtcXG4nICsgJ3VuaWZvcm0gaW50ICAgICAgIGlGcmFtZTtcXG4nICsgJ3VuaWZvcm0gZmxvYXQgICAgIGlUaW1lRGVsdGE7XFxuJyArICd1bmlmb3JtIGZsb2F0ICAgICBpRnJhbWVSYXRlO1xcbidcbiAgICBpID0gMFxuICAgIHdoaWxlIGkgPCBAbUlucHV0cy5sZW5ndGhcbiAgICAgICAgaW5wID0gQG1JbnB1dHNbaV1cbiAgICAgICAgaWYgaW5wID09IG51bGxcbiAgICAgICAgICAgIGhlYWRlciArPSAndW5pZm9ybSBzYW1wbGVyMkQgaUNoYW5uZWwnICsgaSArICc7XFxuJ1xuICAgICAgICBlbHNlIGlmIGlucC5tSW5mby5tVHlwZSA9PSAnY3ViZW1hcCdcbiAgICAgICAgICAgIGhlYWRlciArPSAndW5pZm9ybSBzYW1wbGVyQ3ViZSBpQ2hhbm5lbCcgKyBpICsgJztcXG4nXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGhlYWRlciArPSAndW5pZm9ybSBzYW1wbGVyMkQgaUNoYW5uZWwnICsgaSArICc7XFxuJ1xuICAgICAgICBpKytcbiAgICBoZWFkZXIgKz0gJ3ZvaWQgbWFpbkltYWdlKCBvdXQgdmVjNCBjLCAgaW4gdmVjMiBmICk7XFxuJ1xuICAgIEBtSW1hZ2VQYXNzRm9vdGVyID0gJydcbiAgICBAbUltYWdlUGFzc0Zvb3RlciArPSAnXFxub3V0IHZlYzQgb3V0Q29sb3I7XFxuJ1xuICAgIEBtSW1hZ2VQYXNzRm9vdGVyICs9ICdcXG52b2lkIG1haW4oIHZvaWQgKVxcbicgKyAneycgKyAndmVjNCBjb2xvciA9IHZlYzQoMC4wLDAuMCwwLjAsMS4wKTsnICsgJ21haW5JbWFnZSggY29sb3IsIGdsX0ZyYWdDb29yZC54eSApOydcbiAgICBAbUltYWdlUGFzc0Zvb3RlciArPSAnb3V0Q29sb3IgPSBjb2xvcjsgfSdcbiAgICBAbUhlYWRlciA9IGhlYWRlclxuICAgIHJldHVyblxuXG5QYXNzOjpNYWtlSGVhZGVyX0N1YmVtYXAgPSAtPlxuICAgIGhlYWRlciA9ICcnXG4gICAgaGVhZGVyICs9ICcjZGVmaW5lIEhXX1BFUkZPUk1BTkNFICcgKyAoaWYgQG1Jc0xvd0VuZCA9PSB0cnVlIHRoZW4gJzAnIGVsc2UgJzEnKSArICdcXG4nXG4gICAgaGVhZGVyICs9ICd1bmlmb3JtIHZlYzMgICAgICBpUmVzb2x1dGlvbjtcXG4nICsgJ3VuaWZvcm0gZmxvYXQgICAgIGlUaW1lO1xcbicgKyAndW5pZm9ybSBmbG9hdCAgICAgaUNoYW5uZWxUaW1lWzRdO1xcbicgKyAndW5pZm9ybSB2ZWM0ICAgICAgaU1vdXNlO1xcbicgKyAndW5pZm9ybSB2ZWM0ICAgICAgaURhdGU7XFxuJyArICd1bmlmb3JtIGZsb2F0ICAgICBpU2FtcGxlUmF0ZTtcXG4nICsgJ3VuaWZvcm0gdmVjMyAgICAgIGlDaGFubmVsUmVzb2x1dGlvbls0XTtcXG4nICsgJ3VuaWZvcm0gaW50ICAgICAgIGlGcmFtZTtcXG4nICsgJ3VuaWZvcm0gZmxvYXQgICAgIGlUaW1lRGVsdGE7XFxuJyArICd1bmlmb3JtIGZsb2F0ICAgICBpRnJhbWVSYXRlO1xcbidcbiAgICBpID0gMFxuICAgIHdoaWxlIGkgPCBAbUlucHV0cy5sZW5ndGhcbiAgICAgICAgaW5wID0gQG1JbnB1dHNbaV1cbiAgICAgICAgaWYgaW5wID09IG51bGxcbiAgICAgICAgICAgIGhlYWRlciArPSAndW5pZm9ybSBzYW1wbGVyMkQgaUNoYW5uZWwnICsgaSArICc7XFxuJ1xuICAgICAgICBlbHNlIGlmIGlucC5tSW5mby5tVHlwZSA9PSAnY3ViZW1hcCdcbiAgICAgICAgICAgIGhlYWRlciArPSAndW5pZm9ybSBzYW1wbGVyQ3ViZSBpQ2hhbm5lbCcgKyBpICsgJztcXG4nXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGhlYWRlciArPSAndW5pZm9ybSBzYW1wbGVyMkQgaUNoYW5uZWwnICsgaSArICc7XFxuJ1xuICAgICAgICBpKytcbiAgICBoZWFkZXIgKz0gJ3ZvaWQgbWFpbkN1YmVtYXAoIG91dCB2ZWM0IGMsIGluIHZlYzIgZiwgaW4gdmVjMyBybywgaW4gdmVjMyByZCApO1xcbidcbiAgICBAbUltYWdlUGFzc0Zvb3RlciA9ICdcXG4nICsgJ3VuaWZvcm0gdmVjNCB1blZpZXdwb3J0O1xcbicgKyAndW5pZm9ybSB2ZWMzIHVuQ29ybmVyc1s1XTtcXG4nXG4gICAgQG1JbWFnZVBhc3NGb290ZXIgKz0gJ1xcbm91dCB2ZWM0IG91dENvbG9yO1xcbidcbiAgICBAbUltYWdlUGFzc0Zvb3RlciArPSAnXFxudm9pZCBtYWluKCB2b2lkIClcXG4nICsgJ3snICsgJ3ZlYzQgY29sb3IgPSB2ZWM0KDAuMCwwLjAsMC4wLDEuMCk7JyArICd2ZWMzIHJvID0gdW5Db3JuZXJzWzRdOycgKyAndmVjMiB1diA9IChnbF9GcmFnQ29vcmQueHkgLSB1blZpZXdwb3J0Lnh5KS91blZpZXdwb3J0Lnp3OycgKyAndmVjMyByZCA9IG5vcm1hbGl6ZSggbWl4KCBtaXgoIHVuQ29ybmVyc1swXSwgdW5Db3JuZXJzWzFdLCB1di54ICksJyArICdtaXgoIHVuQ29ybmVyc1szXSwgdW5Db3JuZXJzWzJdLCB1di54ICksIHV2LnkgKSAtIHJvKTsnICsgJ21haW5DdWJlbWFwKCBjb2xvciwgZ2xfRnJhZ0Nvb3JkLnh5LXVuVmlld3BvcnQueHksIHJvLCByZCApOydcbiAgICBAbUltYWdlUGFzc0Zvb3RlciArPSAnb3V0Q29sb3IgPSBjb2xvcjsgfSdcbiAgICBAbUhlYWRlciA9IGhlYWRlclxuICAgIHJldHVyblxuXG5QYXNzOjpNYWtlSGVhZGVyX0NvbW1vbiA9IC0+XG4gICAgaGVhZGVyID0gJydcbiAgICBoZWFkZXJsZW5ndGggPSAwXG4gICAgaGVhZGVyICs9ICd1bmlmb3JtIHZlYzQgICAgICBpRGF0ZTtcXG4nICsgJ3VuaWZvcm0gZmxvYXQgICAgIGlTYW1wbGVSYXRlO1xcbidcbiAgICBoZWFkZXJsZW5ndGggKz0gMlxuICAgIEBtSW1hZ2VQYXNzRm9vdGVyID0gJydcbiAgICBAbUltYWdlUGFzc0Zvb3RlciArPSAnXFxub3V0IHZlYzQgb3V0Q29sb3I7XFxuJ1xuICAgIEBtSW1hZ2VQYXNzRm9vdGVyICs9ICdcXG52b2lkIG1haW4oIHZvaWQgKVxcbicgKyAneydcbiAgICBAbUltYWdlUGFzc0Zvb3RlciArPSAnb3V0Q29sb3IgPSB2ZWM0KDAuMCk7IH0nXG4gICAgQG1IZWFkZXIgPSBoZWFkZXJcbiAgICByZXR1cm5cblxuUGFzczo6TWFrZUhlYWRlciA9IC0+XG4gICAgaWYgQG1UeXBlID09ICdpbWFnZSdcbiAgICAgICAgQE1ha2VIZWFkZXJfSW1hZ2UoKVxuICAgIGVsc2UgaWYgQG1UeXBlID09ICdidWZmZXInXG4gICAgICAgIEBNYWtlSGVhZGVyX0J1ZmZlcigpXG4gICAgZWxzZSBpZiBAbVR5cGUgPT0gJ2NvbW1vbidcbiAgICAgICAgQE1ha2VIZWFkZXJfQ29tbW9uKClcbiAgICBlbHNlIGlmIEBtVHlwZSA9PSAnY3ViZW1hcCdcbiAgICAgICAgQE1ha2VIZWFkZXJfQ3ViZW1hcCgpXG4gICAgZWxzZVxuICAgICAgICBhbGVydCAnRVJST1InXG4gICAgcmV0dXJuXG5cblBhc3M6OkNyZWF0ZV9JbWFnZSA9ICh3YSkgLT5cbiAgICBATWFrZUhlYWRlcigpXG4gICAgQG1TYW1wbGVSYXRlID0gNDQxMDBcbiAgICBAbVByb2dyYW0gPSBudWxsXG4gICAgcmV0dXJuXG5cblBhc3M6OkRlc3Ryb3lfSW1hZ2UgPSAod2EpIC0+XG5cblBhc3M6OkNyZWF0ZV9CdWZmZXIgPSAod2EpIC0+XG4gICAgQE1ha2VIZWFkZXIoKVxuICAgIEBtU2FtcGxlUmF0ZSA9IDQ0MTAwXG4gICAgQG1Qcm9ncmFtID0gbnVsbFxuICAgIHJldHVyblxuXG5QYXNzOjpEZXN0cm95X0J1ZmZlciA9ICh3YSkgLT5cblxuUGFzczo6Q3JlYXRlX0N1YmVtYXAgPSAod2EpIC0+XG4gICAgQE1ha2VIZWFkZXIoKVxuICAgIEBtU2FtcGxlUmF0ZSA9IDQ0MTAwXG4gICAgQG1Qcm9ncmFtID0gbnVsbFxuICAgIHJldHVyblxuXG5QYXNzOjpEZXN0cm95X0N1YmVtYXAgPSAod2EpIC0+XG5cblBhc3M6OkNyZWF0ZV9Db21tb24gPSAod2EpIC0+XG4gICAgQE1ha2VIZWFkZXIoKVxuICAgIHJldHVyblxuXG5QYXNzOjpEZXN0cm95X0NvbW1vbiA9ICh3YSkgLT5cblxuUGFzczo6Q3JlYXRlID0gKHBhc3NUeXBlLCBwYXNzTmFtZSwgd2EpIC0+XG4gICAgQG1UeXBlID0gcGFzc1R5cGVcbiAgICBAbU5hbWUgPSBwYXNzTmFtZVxuICAgIEBtU291cmNlID0gbnVsbFxuICAgIGlmIHBhc3NUeXBlID09ICdpbWFnZSdcbiAgICAgICAgQENyZWF0ZV9JbWFnZSB3YVxuICAgIGVsc2UgaWYgcGFzc1R5cGUgPT0gJ2J1ZmZlcidcbiAgICAgICAgQENyZWF0ZV9CdWZmZXIgd2FcbiAgICBlbHNlIGlmIHBhc3NUeXBlID09ICdjb21tb24nXG4gICAgICAgIEBDcmVhdGVfQ29tbW9uIHdhXG4gICAgZWxzZSBpZiBwYXNzVHlwZSA9PSAnY3ViZW1hcCdcbiAgICAgICAgQENyZWF0ZV9DdWJlbWFwIHdhXG4gICAgZWxzZVxuICAgICAgICBhbGVydCAnRVJST1InXG4gICAgcmV0dXJuXG5cblBhc3M6OkRlc3Ryb3kgPSAod2EpIC0+XG4gICAgQG1Tb3VyY2UgPSBudWxsXG4gICAgaWYgQG1UeXBlID09ICdpbWFnZSdcbiAgICAgICAgQERlc3Ryb3lfSW1hZ2Ugd2FcbiAgICBlbHNlIGlmIEBtVHlwZSA9PSAnYnVmZmVyJ1xuICAgICAgICBARGVzdHJveV9CdWZmZXIgd2FcbiAgICBlbHNlIGlmIEBtVHlwZSA9PSAnY29tbW9uJ1xuICAgICAgICBARGVzdHJveV9Db21tb24gd2FcbiAgICBlbHNlIGlmIEBtVHlwZSA9PSAnY3ViZW1hcCdcbiAgICAgICAgQERlc3Ryb3lfQ3ViZW1hcCB3YVxuICAgIGVsc2VcbiAgICAgICAgYWxlcnQgJ0VSUk9SJ1xuICAgIHJldHVyblxuXG5QYXNzOjpOZXdTaGFkZXJfSW1hZ2UgPSAoc2hhZGVyQ29kZSwgY29tbW9uU2hhZGVyQ29kZXMpIC0+XG4gICAgdnNTb3VyY2UgPSB1bmRlZmluZWRcbiAgICB2c1NvdXJjZSA9ICdsYXlvdXQobG9jYXRpb24gPSAwKSBpbiB2ZWMyIHBvczsgdm9pZCBtYWluKCkgeyBnbF9Qb3NpdGlvbiA9IHZlYzQocG9zLnh5LDAuMCwxLjApOyB9J1xuICAgIGZzU291cmNlID0gQG1IZWFkZXJcbiAgICBpID0gMFxuICAgIHdoaWxlIGkgPCBjb21tb25TaGFkZXJDb2Rlcy5sZW5ndGhcbiAgICAgICAgZnNTb3VyY2UgKz0gY29tbW9uU2hhZGVyQ29kZXNbaV0gKyAnXFxuJ1xuICAgICAgICBpKytcbiAgICBmc1NvdXJjZSArPSBzaGFkZXJDb2RlXG4gICAgZnNTb3VyY2UgKz0gQG1JbWFnZVBhc3NGb290ZXJcbiAgICByZXMgPSBAbVJlbmRlcmVyLkNyZWF0ZVNoYWRlcih2c1NvdXJjZSwgZnNTb3VyY2UpXG4gICAgaWYgcmVzLm1SZXN1bHQgPT0gZmFsc2VcbiAgICAgICAgcmV0dXJuIHJlcy5tSW5mb1xuICAgIGlmIEBtUHJvZ3JhbSAhPSBudWxsXG4gICAgICAgIEBtUmVuZGVyZXIuRGVzdHJveVNoYWRlciBAbVByb2dyYW1cbiAgICBAbVByb2dyYW0gPSByZXNcbiAgICBudWxsXG5cblBhc3M6Ok5ld1NoYWRlcl9DdWJlbWFwID0gKHNoYWRlckNvZGUsIGNvbW1vblNoYWRlckNvZGVzKSAtPlxuICAgIHZzU291cmNlID0gdW5kZWZpbmVkXG4gICAgdnNTb3VyY2UgPSAnbGF5b3V0KGxvY2F0aW9uID0gMCkgaW4gdmVjMiBwb3M7IHZvaWQgbWFpbigpIHsgZ2xfUG9zaXRpb24gPSB2ZWM0KHBvcy54eSwwLjAsMS4wKTsgfSdcbiAgICBmc1NvdXJjZSA9IEBtSGVhZGVyXG4gICAgaSA9IDBcbiAgICB3aGlsZSBpIDwgY29tbW9uU2hhZGVyQ29kZXMubGVuZ3RoXG4gICAgICAgIGZzU291cmNlICs9IGNvbW1vblNoYWRlckNvZGVzW2ldICsgJ1xcbidcbiAgICAgICAgaSsrXG4gICAgZnNTb3VyY2UgKz0gc2hhZGVyQ29kZVxuICAgIGZzU291cmNlICs9IEBtSW1hZ2VQYXNzRm9vdGVyXG4gICAgcmVzID0gQG1SZW5kZXJlci5DcmVhdGVTaGFkZXIodnNTb3VyY2UsIGZzU291cmNlKVxuICAgIGlmIHJlcy5tUmVzdWx0ID09IGZhbHNlXG4gICAgICAgIHJldHVybiByZXMubUluZm9cbiAgICBpZiBAbVByb2dyYW0gIT0gbnVsbFxuICAgICAgICBAbVJlbmRlcmVyLkRlc3Ryb3lTaGFkZXIgQG1Qcm9ncmFtXG4gICAgQG1Qcm9ncmFtID0gcmVzXG4gICAgbnVsbFxuXG5QYXNzOjpOZXdTaGFkZXJfQ29tbW9uID0gKHNoYWRlckNvZGUpIC0+XG4gICAgdnNTb3VyY2UgPSB1bmRlZmluZWRcbiAgICB2c1NvdXJjZSA9ICdsYXlvdXQobG9jYXRpb24gPSAwKSBpbiB2ZWMyIHBvczsgdm9pZCBtYWluKCkgeyBnbF9Qb3NpdGlvbiA9IHZlYzQocG9zLnh5LDAuMCwxLjApOyB9J1xuICAgIGZzU291cmNlID0gQG1IZWFkZXIgKyBzaGFkZXJDb2RlICsgQG1JbWFnZVBhc3NGb290ZXJcbiAgICByZXMgPSBAbVJlbmRlcmVyLkNyZWF0ZVNoYWRlcih2c1NvdXJjZSwgZnNTb3VyY2UpXG4gICAgaWYgcmVzLm1SZXN1bHQgPT0gZmFsc2VcbiAgICAgICAgcmV0dXJuIHJlcy5tSW5mb1xuICAgIGlmIEBtUHJvZ3JhbSAhPSBudWxsXG4gICAgICAgIEBtUmVuZGVyZXIuRGVzdHJveVNoYWRlciBAbVByb2dyYW1cbiAgICBAbVByb2dyYW0gPSByZXNcbiAgICBudWxsXG5cblBhc3M6Ok5ld1NoYWRlciA9IChzaGFkZXJDb2RlLCBjb21tb25Tb3VyY2VDb2RlcykgLT5cbiAgICBpZiBAbVJlbmRlcmVyID09IG51bGxcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICB0aW1lU3RhcnQgPSBwZXJmb3JtYW5jZS5ub3coKVxuICAgIHJlcyA9IG51bGxcbiAgICBpZiBAbVR5cGUgPT0gJ2ltYWdlJ1xuICAgICAgICByZXMgPSBATmV3U2hhZGVyX0ltYWdlKHNoYWRlckNvZGUsIGNvbW1vblNvdXJjZUNvZGVzKVxuICAgIGVsc2UgaWYgQG1UeXBlID09ICdidWZmZXInXG4gICAgICAgIHJlcyA9IEBOZXdTaGFkZXJfSW1hZ2Uoc2hhZGVyQ29kZSwgY29tbW9uU291cmNlQ29kZXMpXG4gICAgZWxzZSBpZiBAbVR5cGUgPT0gJ2NvbW1vbidcbiAgICAgICAgcmVzID0gQE5ld1NoYWRlcl9Db21tb24oc2hhZGVyQ29kZSlcbiAgICBlbHNlIGlmIEBtVHlwZSA9PSAnY3ViZW1hcCdcbiAgICAgICAgcmVzID0gQE5ld1NoYWRlcl9DdWJlbWFwKHNoYWRlckNvZGUsIGNvbW1vblNvdXJjZUNvZGVzKVxuICAgIGVsc2VcbiAgICAgICAgYWxlcnQgJ0VSUk9SJ1xuICAgIGNvbXBpbGF0aW9uVGltZSA9IHBlcmZvcm1hbmNlLm5vdygpIC0gdGltZVN0YXJ0XG4gICAgaWYgcmVzID09IG51bGxcbiAgICAgICAgQG1Db21waWxhdGlvblRpbWUgPSBjb21waWxhdGlvblRpbWVcbiAgICBAbVNvdXJjZSA9IHNoYWRlckNvZGVcbiAgICByZXNcblxuUGFzczo6RGVzdHJveUlucHV0ID0gKGlkKSAtPlxuICAgIGlmIEBtSW5wdXRzW2lkXSA9PSBudWxsXG4gICAgICAgIHJldHVyblxuICAgIGlmIEBtSW5wdXRzW2lkXS5tSW5mby5tVHlwZSA9PSAndGV4dHVyZSdcbiAgICAgICAgaWYgQG1JbnB1dHNbaWRdLmdsb2JqZWN0ICE9IG51bGxcbiAgICAgICAgICAgIEBtUmVuZGVyZXIuRGVzdHJveVRleHR1cmUgQG1JbnB1dHNbaWRdLmdsb2JqZWN0XG4gICAgZWxzZSBpZiBAbUlucHV0c1tpZF0ubUluZm8ubVR5cGUgPT0gJ2N1YmVtYXAnXG4gICAgICAgIGlmIEBtSW5wdXRzW2lkXS5nbG9iamVjdCAhPSBudWxsXG4gICAgICAgICAgICBAbVJlbmRlcmVyLkRlc3Ryb3lUZXh0dXJlIEBtSW5wdXRzW2lkXS5nbG9iamVjdFxuICAgIGVsc2UgaWYgQG1JbnB1dHNbaWRdLm1JbmZvLm1UeXBlID09ICdrZXlib2FyZCdcbiAgICBlbHNlXG4gICAgQG1JbnB1dHNbaWRdID0gbnVsbFxuICAgIHJldHVyblxuXG5QYXNzOjpTYW1wbGVyMlJlbmRlcmVyID0gKHNhbXBsZXIpIC0+XG4gICAgZmlsdGVyID0gQG1SZW5kZXJlci5GSUxURVIuTk9ORVxuICAgIGlmIHNhbXBsZXIuZmlsdGVyID09ICdsaW5lYXInXG4gICAgICAgIGZpbHRlciA9IEBtUmVuZGVyZXIuRklMVEVSLkxJTkVBUlxuICAgIGlmIHNhbXBsZXIuZmlsdGVyID09ICdtaXBtYXAnXG4gICAgICAgIGZpbHRlciA9IEBtUmVuZGVyZXIuRklMVEVSLk1JUE1BUFxuICAgIHdyYXAgPSBAbVJlbmRlcmVyLlRFWFdSUC5SRVBFQVRcbiAgICBpZiBzYW1wbGVyLndyYXAgPT0gJ2NsYW1wJ1xuICAgICAgICB3cmFwID0gQG1SZW5kZXJlci5URVhXUlAuQ0xBTVBcbiAgICB2ZmxpcCA9IGZhbHNlXG4gICAgaWYgc2FtcGxlci52ZmxpcCA9PSAndHJ1ZSdcbiAgICAgICAgdmZsaXAgPSB0cnVlXG4gICAge1xuICAgICAgICBtRmlsdGVyOiBmaWx0ZXJcbiAgICAgICAgbVdyYXA6IHdyYXBcbiAgICAgICAgbVZGbGlwOiB2ZmxpcFxuICAgIH1cblxuUGFzczo6R2V0U2FtcGxlclZGbGlwID0gKGlkKSAtPlxuICAgIGlucCA9IEBtSW5wdXRzW2lkXVxuICAgIGlucC5tSW5mby5tU2FtcGxlci52ZmxpcFxuXG5QYXNzOjpTZXRTYW1wbGVyVkZsaXAgPSAoaWQsIHN0cikgLT5cbiAgICBtZSA9IHRoaXNcbiAgICByZW5kZXJlciA9IEBtUmVuZGVyZXJcbiAgICBpbnAgPSBAbUlucHV0c1tpZF1cbiAgICBmaWx0ZXIgPSBmYWxzZVxuICAgIGlmIHN0ciA9PSAndHJ1ZSdcbiAgICAgICAgZmlsdGVyID0gdHJ1ZVxuICAgIGlmIGlucCA9PSBudWxsXG4gICAgZWxzZSBpZiBpbnAubUluZm8ubVR5cGUgPT0gJ3RleHR1cmUnXG4gICAgICAgIGlmIGlucC5sb2FkZWRcbiAgICAgICAgICAgIHJlbmRlcmVyLlNldFNhbXBsZXJWRmxpcCBpbnAuZ2xvYmplY3QsIGZpbHRlciwgaW5wLmltYWdlXG4gICAgICAgICAgICBpbnAubUluZm8ubVNhbXBsZXIudmZsaXAgPSBzdHJcbiAgICBlbHNlIGlmIGlucC5tSW5mby5tVHlwZSA9PSAnY3ViZW1hcCdcbiAgICAgICAgaWYgaW5wLmxvYWRlZFxuICAgICAgICAgICAgcmVuZGVyZXIuU2V0U2FtcGxlclZGbGlwIGlucC5nbG9iamVjdCwgZmlsdGVyLCBpbnAuaW1hZ2VcbiAgICAgICAgICAgIGlucC5tSW5mby5tU2FtcGxlci52ZmxpcCA9IHN0clxuICAgIHJldHVyblxuXG5QYXNzOjpHZXRBY2NlcHRzVkZsaXAgPSAoaWQpIC0+XG4gICAgaW5wID0gQG1JbnB1dHNbaWRdXG4gICAgaWYgaW5wID09IG51bGxcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgaWYgaW5wLm1JbmZvLm1UeXBlID09ICd0ZXh0dXJlJ1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIGlmIGlucC5tSW5mby5tVHlwZSA9PSAnY3ViZW1hcCdcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICBpZiBpbnAubUluZm8ubVR5cGUgPT0gJ2tleWJvYXJkJ1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICBpZiBpbnAubUluZm8ubVR5cGUgPT0gJ2J1ZmZlcidcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgdHJ1ZVxuXG5QYXNzOjpHZXRTYW1wbGVyRmlsdGVyID0gKGlkKSAtPlxuICAgIGlucCA9IEBtSW5wdXRzW2lkXVxuICAgIGlmIGlucCA9PSBudWxsXG4gICAgICAgIHJldHVyblxuICAgIGlucC5tSW5mby5tU2FtcGxlci5maWx0ZXJcblxuUGFzczo6U2V0U2FtcGxlckZpbHRlciA9IChpZCwgc3RyLCBidWZmZXJzLCBjdWJlQnVmZmVycykgLT5cbiAgICBtZSA9IHRoaXNcbiAgICByZW5kZXJlciA9IEBtUmVuZGVyZXJcbiAgICBpbnAgPSBAbUlucHV0c1tpZF1cbiAgICBmaWx0ZXIgPSByZW5kZXJlci5GSUxURVIuTk9ORVxuICAgIGlmIHN0ciA9PSAnbGluZWFyJ1xuICAgICAgICBmaWx0ZXIgPSByZW5kZXJlci5GSUxURVIuTElORUFSXG4gICAgaWYgc3RyID09ICdtaXBtYXAnXG4gICAgICAgIGZpbHRlciA9IHJlbmRlcmVyLkZJTFRFUi5NSVBNQVBcbiAgICBpZiBpbnAgPT0gbnVsbFxuICAgIGVsc2UgaWYgaW5wLm1JbmZvLm1UeXBlID09ICd0ZXh0dXJlJ1xuICAgICAgICBpZiBpbnAubG9hZGVkXG4gICAgICAgICAgICByZW5kZXJlci5TZXRTYW1wbGVyRmlsdGVyIGlucC5nbG9iamVjdCwgZmlsdGVyLCB0cnVlXG4gICAgICAgICAgICBpbnAubUluZm8ubVNhbXBsZXIuZmlsdGVyID0gc3RyXG4gICAgZWxzZSBpZiBpbnAubUluZm8ubVR5cGUgPT0gJ2N1YmVtYXAnXG4gICAgICAgIGlmIGlucC5sb2FkZWRcbiAgICAgICAgICAgIGlmIGFzc2V0SURfdG9fY3ViZW1hcEJ1ZmVySUQoaW5wLm1JbmZvLm1JRCkgPT0gMFxuICAgICAgICAgICAgICAgIHJlbmRlcmVyLlNldFNhbXBsZXJGaWx0ZXIgY3ViZUJ1ZmZlcnNbaWRdLm1UZXh0dXJlWzBdLCBmaWx0ZXIsIHRydWVcbiAgICAgICAgICAgICAgICByZW5kZXJlci5TZXRTYW1wbGVyRmlsdGVyIGN1YmVCdWZmZXJzW2lkXS5tVGV4dHVyZVsxXSwgZmlsdGVyLCB0cnVlXG4gICAgICAgICAgICAgICAgaW5wLm1JbmZvLm1TYW1wbGVyLmZpbHRlciA9IHN0clxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlbmRlcmVyLlNldFNhbXBsZXJGaWx0ZXIgaW5wLmdsb2JqZWN0LCBmaWx0ZXIsIHRydWVcbiAgICAgICAgICAgICAgICBpbnAubUluZm8ubVNhbXBsZXIuZmlsdGVyID0gc3RyXG4gICAgZWxzZSBpZiBpbnAubUluZm8ubVR5cGUgPT0gJ2J1ZmZlcidcbiAgICAgICAgcmVuZGVyZXIuU2V0U2FtcGxlckZpbHRlciBidWZmZXJzW2lucC5pZF0ubVRleHR1cmVbMF0sIGZpbHRlciwgdHJ1ZVxuICAgICAgICByZW5kZXJlci5TZXRTYW1wbGVyRmlsdGVyIGJ1ZmZlcnNbaW5wLmlkXS5tVGV4dHVyZVsxXSwgZmlsdGVyLCB0cnVlXG4gICAgICAgIGlucC5tSW5mby5tU2FtcGxlci5maWx0ZXIgPSBzdHJcbiAgICBlbHNlIGlmIGlucC5tSW5mby5tVHlwZSA9PSAna2V5Ym9hcmQnXG4gICAgICAgIGlucC5tSW5mby5tU2FtcGxlci5maWx0ZXIgPSBzdHJcbiAgICByZXR1cm5cblxuUGFzczo6R2V0QWNjZXB0c01pcG1hcHBpbmcgPSAoaWQpIC0+XG4gICAgaW5wID0gQG1JbnB1dHNbaWRdXG4gICAgaWYgaW5wID09IG51bGxcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgaWYgaW5wLm1JbmZvLm1UeXBlID09ICd0ZXh0dXJlJ1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIGlmIGlucC5tSW5mby5tVHlwZSA9PSAnY3ViZW1hcCdcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICBpZiBpbnAubUluZm8ubVR5cGUgPT0gJ2tleWJvYXJkJ1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICBpZiBpbnAubUluZm8ubVR5cGUgPT0gJ2J1ZmZlcidcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICBmYWxzZVxuXG5QYXNzOjpHZXRBY2NlcHRzTGluZWFyID0gKGlkKSAtPlxuICAgIGlucCA9IEBtSW5wdXRzW2lkXVxuICAgIGlmIGlucCA9PSBudWxsXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIGlmIGlucC5tSW5mby5tVHlwZSA9PSAndGV4dHVyZSdcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICBpZiBpbnAubUluZm8ubVR5cGUgPT0gJ2N1YmVtYXAnXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgaWYgaW5wLm1JbmZvLm1UeXBlID09ICdrZXlib2FyZCdcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgaWYgaW5wLm1JbmZvLm1UeXBlID09ICdidWZmZXInXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgZmFsc2VcblxuUGFzczo6R2V0QWNjZXB0c1dyYXBSZXBlYXQgPSAoaWQpIC0+XG4gICAgaW5wID0gQG1JbnB1dHNbaWRdXG4gICAgaWYgaW5wID09IG51bGxcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgaWYgaW5wLm1JbmZvLm1UeXBlID09ICd0ZXh0dXJlJ1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIGlmIGlucC5tSW5mby5tVHlwZSA9PSAnY3ViZW1hcCdcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgaWYgaW5wLm1JbmZvLm1UeXBlID09ICdrZXlib2FyZCdcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgaWYgaW5wLm1JbmZvLm1UeXBlID09ICdidWZmZXInXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgZmFsc2VcblxuUGFzczo6R2V0U2FtcGxlcldyYXAgPSAoaWQpIC0+XG4gICAgaW5wID0gQG1JbnB1dHNbaWRdXG4gICAgaW5wLm1JbmZvLm1TYW1wbGVyLndyYXBcblxuUGFzczo6U2V0U2FtcGxlcldyYXAgPSAoaWQsIHN0ciwgYnVmZmVycykgLT5cbiAgICBtZSA9IHRoaXNcbiAgICByZW5kZXJlciA9IEBtUmVuZGVyZXJcbiAgICBpbnAgPSBAbUlucHV0c1tpZF1cbiAgICByZXN0ciA9IHJlbmRlcmVyLlRFWFdSUC5SRVBFQVRcbiAgICBpZiBzdHIgPT0gJ2NsYW1wJ1xuICAgICAgICByZXN0ciA9IHJlbmRlcmVyLlRFWFdSUC5DTEFNUFxuICAgIGlmIGlucCA9PSBudWxsXG4gICAgZWxzZSBpZiBpbnAubUluZm8ubVR5cGUgPT0gJ3RleHR1cmUnXG4gICAgICAgIGlmIGlucC5sb2FkZWRcbiAgICAgICAgICAgIHJlbmRlcmVyLlNldFNhbXBsZXJXcmFwIGlucC5nbG9iamVjdCwgcmVzdHJcbiAgICAgICAgICAgIGlucC5tSW5mby5tU2FtcGxlci53cmFwID0gc3RyXG4gICAgZWxzZSBpZiBpbnAubUluZm8ubVR5cGUgPT0gJ2N1YmVtYXAnXG4gICAgICAgIGlmIGlucC5sb2FkZWRcbiAgICAgICAgICAgIHJlbmRlcmVyLlNldFNhbXBsZXJXcmFwIGlucC5nbG9iamVjdCwgcmVzdHJcbiAgICAgICAgICAgIGlucC5tSW5mby5tU2FtcGxlci53cmFwID0gc3RyXG4gICAgZWxzZSBpZiBpbnAubUluZm8ubVR5cGUgPT0gJ2J1ZmZlcidcbiAgICAgICAgcmVuZGVyZXIuU2V0U2FtcGxlcldyYXAgYnVmZmVyc1tpbnAuaWRdLm1UZXh0dXJlWzBdLCByZXN0clxuICAgICAgICByZW5kZXJlci5TZXRTYW1wbGVyV3JhcCBidWZmZXJzW2lucC5pZF0ubVRleHR1cmVbMV0sIHJlc3RyXG4gICAgICAgIGlucC5tSW5mby5tU2FtcGxlci53cmFwID0gc3RyXG4gICAgcmV0dXJuXG5cblBhc3M6OkdldFRleHR1cmUgPSAoc2xvdCkgLT5cbiAgICBpbnAgPSBAbUlucHV0c1tzbG90XVxuICAgIGlmIGlucCA9PSBudWxsXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgaW5wLm1JbmZvXG5cblBhc3M6OlNldE91dHB1dHMgPSAoc2xvdCwgaWQpIC0+XG4gICAgQG1PdXRwdXRzW3Nsb3RdID0gaWRcbiAgICByZXR1cm5cblxuUGFzczo6U2V0T3V0cHV0c0J5QnVmZmVySUQgPSAoc2xvdCwgaWQpIC0+XG4gICAgaWYgQG1UeXBlID09ICdidWZmZXInXG4gICAgICAgIEBtT3V0cHV0c1tzbG90XSA9IGJ1ZmZlcklEX3RvX2Fzc2V0SUQoaWQpXG4gICAgICAgIEBtRWZmZWN0LlJlc2l6ZUJ1ZmZlciBpZCwgQG1FZmZlY3QubVhyZXMsIEBtRWZmZWN0Lm1ZcmVzLCBmYWxzZVxuICAgIGVsc2UgaWYgQG1UeXBlID09ICdjdWJlbWFwJ1xuICAgICAgICBAbU91dHB1dHNbc2xvdF0gPSBjdWJhbWVwQnVmZmVySURfdG9fYXNzZXRJRChpZClcbiAgICAgICAgQG1FZmZlY3QuUmVzaXplQ3ViZW1hcEJ1ZmZlciBpZCwgMTAyNCwgMTAyNFxuICAgIHJldHVyblxuXG5QYXNzOjpOZXdUZXh0dXJlID0gKHdhLCBzbG90LCB1cmwsIGJ1ZmZlcnMsIGN1YmVCdWZmZXJzLCBrZXlib2FyZCkgLT5cbiAgICBgdmFyIHJldHVyblZhbHVlYFxuICAgIGB2YXIgcmV0dXJuVmFsdWVgXG4gICAgYHZhciByZXR1cm5WYWx1ZWBcbiAgICBtZSA9IHRoaXNcbiAgICByZW5kZXJlciA9IEBtUmVuZGVyZXJcbiAgICBpZiByZW5kZXJlciA9PSBudWxsXG4gICAgICAgIHJldHVyblxuICAgIHRleHR1cmUgPSBudWxsXG4gICAgaWYgdXJsID09IG51bGwgb3IgdXJsLm1UeXBlID09IG51bGxcbiAgICAgICAgbWUuRGVzdHJveUlucHV0IHNsb3RcbiAgICAgICAgbWUubUlucHV0c1tzbG90XSA9IG51bGxcbiAgICAgICAgbWUuTWFrZUhlYWRlcigpXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtRmFpbGVkOiBmYWxzZVxuICAgICAgICAgICAgbU5lZWRzU2hhZGVyQ29tcGlsZTogZmFsc2VcbiAgICAgICAgfVxuICAgIGVsc2UgaWYgdXJsLm1UeXBlID09ICd0ZXh0dXJlJ1xuICAgICAgICB0ZXh0dXJlID0ge31cbiAgICAgICAgdGV4dHVyZS5tSW5mbyA9IHVybFxuICAgICAgICB0ZXh0dXJlLmdsb2JqZWN0ID0gbnVsbFxuICAgICAgICB0ZXh0dXJlLmxvYWRlZCA9IGZhbHNlXG4gICAgICAgIHRleHR1cmUuaW1hZ2UgPSBuZXcgSW1hZ2VcbiAgICAgICAgdGV4dHVyZS5pbWFnZS5jcm9zc09yaWdpbiA9ICcnXG5cbiAgICAgICAgdGV4dHVyZS5pbWFnZS5vbmxvYWQgPSAtPlxuICAgICAgICAgICAgcnRpID0gbWUuU2FtcGxlcjJSZW5kZXJlcih1cmwubVNhbXBsZXIpXG4gICAgICAgICAgICAjIE8uTS5HLiBJUUlRIEZJWCBUSElTXG4gICAgICAgICAgICBjaGFubmVscyA9IHJlbmRlcmVyLlRFWEZNVC5DNEk4XG4gICAgICAgICAgICBpZiB1cmwubUlEID09ICdYZGYzem4nIG9yIHVybC5tSUQgPT0gJzRzZjNSbicgb3IgdXJsLm1JRCA9PSAnNGRYR3puJyBvciB1cmwubUlEID09ICc0c2YzUnInXG4gICAgICAgICAgICAgICAgY2hhbm5lbHMgPSByZW5kZXJlci5URVhGTVQuQzFJOFxuICAgICAgICAgICAgdGV4dHVyZS5nbG9iamVjdCA9IHJlbmRlcmVyLkNyZWF0ZVRleHR1cmVGcm9tSW1hZ2UocmVuZGVyZXIuVEVYVFlQRS5UMkQsIHRleHR1cmUuaW1hZ2UsIGNoYW5uZWxzLCBydGkubUZpbHRlciwgcnRpLm1XcmFwLCBydGkubVZGbGlwKVxuICAgICAgICAgICAgdGV4dHVyZS5sb2FkZWQgPSB0cnVlXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICB0ZXh0dXJlLmltYWdlLnNyYyA9IHVybC5tU3JjXG4gICAgICAgIHJldHVyblZhbHVlID0gXG4gICAgICAgICAgICBtRmFpbGVkOiBmYWxzZVxuICAgICAgICAgICAgbU5lZWRzU2hhZGVyQ29tcGlsZTogQG1JbnB1dHNbc2xvdF0gPT0gbnVsbCBvciBAbUlucHV0c1tzbG90XS5tSW5mby5tVHlwZSAhPSAndGV4dHVyZScgYW5kIEBtSW5wdXRzW3Nsb3RdLm1JbmZvLm1UeXBlICE9ICdrZXlib2FyZCdcbiAgICAgICAgQERlc3Ryb3lJbnB1dCBzbG90XG4gICAgICAgIEBtSW5wdXRzW3Nsb3RdID0gdGV4dHVyZVxuICAgICAgICBATWFrZUhlYWRlcigpXG4gICAgICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICAgIGVsc2UgaWYgdXJsLm1UeXBlID09ICdjdWJlbWFwJ1xuICAgICAgICB0ZXh0dXJlID0ge31cbiAgICAgICAgdGV4dHVyZS5tSW5mbyA9IHVybFxuICAgICAgICB0ZXh0dXJlLmdsb2JqZWN0ID0gbnVsbFxuICAgICAgICB0ZXh0dXJlLmxvYWRlZCA9IGZhbHNlXG4gICAgICAgIHJ0aSA9IG1lLlNhbXBsZXIyUmVuZGVyZXIodXJsLm1TYW1wbGVyKVxuICAgICAgICBpZiBhc3NldElEX3RvX2N1YmVtYXBCdWZlcklEKHVybC5tSUQpICE9IC0xXG4gICAgICAgICAgICB0ZXh0dXJlLm1JbWFnZSA9IG5ldyBJbWFnZVxuXG4gICAgICAgICAgICB0ZXh0dXJlLm1JbWFnZS5vbmxvYWQgPSAtPlxuICAgICAgICAgICAgICAgIHRleHR1cmUubG9hZGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgICAgICB0ZXh0dXJlLm1JbWFnZS5zcmMgPSAnL21lZGlhL3ByZXZpei9jdWJlbWFwMDAucG5nJ1xuICAgICAgICAgICAgQG1FZmZlY3QuUmVzaXplQ3ViZW1hcEJ1ZmZlciAwLCAxMDI0LCAxMDI0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRleHR1cmUuaW1hZ2UgPSBbXG4gICAgICAgICAgICAgICAgbmV3IEltYWdlXG4gICAgICAgICAgICAgICAgbmV3IEltYWdlXG4gICAgICAgICAgICAgICAgbmV3IEltYWdlXG4gICAgICAgICAgICAgICAgbmV3IEltYWdlXG4gICAgICAgICAgICAgICAgbmV3IEltYWdlXG4gICAgICAgICAgICAgICAgbmV3IEltYWdlXG4gICAgICAgICAgICBdXG4gICAgICAgICAgICBudW1Mb2FkZWQgPSAwXG4gICAgICAgICAgICBpID0gMFxuICAgICAgICAgICAgd2hpbGUgaSA8IDZcbiAgICAgICAgICAgICAgICB0ZXh0dXJlLmltYWdlW2ldLm1JZCA9IGlcbiAgICAgICAgICAgICAgICB0ZXh0dXJlLmltYWdlW2ldLmNyb3NzT3JpZ2luID0gJydcblxuICAgICAgICAgICAgICAgIHRleHR1cmUuaW1hZ2VbaV0ub25sb2FkID0gLT5cbiAgICAgICAgICAgICAgICAgICAgaWQgPSBAbUlkXG4gICAgICAgICAgICAgICAgICAgIG51bUxvYWRlZCsrXG4gICAgICAgICAgICAgICAgICAgIGlmIG51bUxvYWRlZCA9PSA2XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlLmdsb2JqZWN0ID0gcmVuZGVyZXIuQ3JlYXRlVGV4dHVyZUZyb21JbWFnZShyZW5kZXJlci5URVhUWVBFLkNVQkVNQVAsIHRleHR1cmUuaW1hZ2UsIHJlbmRlcmVyLlRFWEZNVC5DNEk4LCBydGkubUZpbHRlciwgcnRpLm1XcmFwLCBydGkubVZGbGlwKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dHVyZS5sb2FkZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuXG4gICAgICAgICAgICAgICAgaWYgaSA9PSAwXG4gICAgICAgICAgICAgICAgICAgIHRleHR1cmUuaW1hZ2VbaV0uc3JjID0gdXJsLm1TcmNcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG4gPSB1cmwubVNyYy5sYXN0SW5kZXhPZignLicpXG4gICAgICAgICAgICAgICAgICAgIHRleHR1cmUuaW1hZ2VbaV0uc3JjID0gdXJsLm1TcmMuc3Vic3RyaW5nKDAsIG4pICsgJ18nICsgaSArIHVybC5tU3JjLnN1YnN0cmluZyhuLCB1cmwubVNyYy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgaSsrXG4gICAgICAgIHJldHVyblZhbHVlID0gXG4gICAgICAgICAgICBtRmFpbGVkOiBmYWxzZVxuICAgICAgICAgICAgbU5lZWRzU2hhZGVyQ29tcGlsZTogQG1JbnB1dHNbc2xvdF0gPT0gbnVsbCBvciBAbUlucHV0c1tzbG90XS5tSW5mby5tVHlwZSAhPSAnY3ViZW1hcCdcbiAgICAgICAgQERlc3Ryb3lJbnB1dCBzbG90XG4gICAgICAgIEBtSW5wdXRzW3Nsb3RdID0gdGV4dHVyZVxuICAgICAgICBATWFrZUhlYWRlcigpXG4gICAgICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICAgIGVsc2UgaWYgdXJsLm1UeXBlID09ICdrZXlib2FyZCdcbiAgICAgICAgdGV4dHVyZSA9IHt9XG4gICAgICAgIHRleHR1cmUubUluZm8gPSB1cmxcbiAgICAgICAgdGV4dHVyZS5nbG9iamVjdCA9IG51bGxcbiAgICAgICAgdGV4dHVyZS5sb2FkZWQgPSB0cnVlXG4gICAgICAgIHRleHR1cmUua2V5Ym9hcmQgPSB7fVxuICAgICAgICByZXR1cm5WYWx1ZSA9IFxuICAgICAgICAgICAgbUZhaWxlZDogZmFsc2VcbiAgICAgICAgICAgIG1OZWVkc1NoYWRlckNvbXBpbGU6IEBtSW5wdXRzW3Nsb3RdID09IG51bGwgb3IgQG1JbnB1dHNbc2xvdF0ubUluZm8ubVR5cGUgIT0gJ3RleHR1cmUnIGFuZCBAbUlucHV0c1tzbG90XS5tSW5mby5tVHlwZSAhPSAna2V5Ym9hcmQnXG4gICAgICAgIEBEZXN0cm95SW5wdXQgc2xvdFxuICAgICAgICBAbUlucHV0c1tzbG90XSA9IHRleHR1cmVcbiAgICAgICAgQE1ha2VIZWFkZXIoKVxuICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgICBlbHNlIGlmIHVybC5tVHlwZSA9PSAnYnVmZmVyJ1xuICAgICAgICB0ZXh0dXJlID0ge31cbiAgICAgICAgdGV4dHVyZS5tSW5mbyA9IHVybFxuICAgICAgICB0ZXh0dXJlLmltYWdlID0gbmV3IEltYWdlXG5cbiAgICAgICAgdGV4dHVyZS5pbWFnZS5vbmxvYWQgPSAtPlxuXG4gICAgICAgIHRleHR1cmUuaW1hZ2Uuc3JjID0gdXJsLm1TcmNcbiAgICAgICAgdGV4dHVyZS5pZCA9IGFzc2V0SURfdG9fYnVmZmVySUQodXJsLm1JRClcbiAgICAgICAgdGV4dHVyZS5sb2FkZWQgPSB0cnVlXG4gICAgICAgIHJldHVyblZhbHVlID0gXG4gICAgICAgICAgICBtRmFpbGVkOiBmYWxzZVxuICAgICAgICAgICAgbU5lZWRzU2hhZGVyQ29tcGlsZTogQG1JbnB1dHNbc2xvdF0gPT0gbnVsbCBvciBAbUlucHV0c1tzbG90XS5tSW5mby5tVHlwZSAhPSAndGV4dHVyZScgYW5kIEBtSW5wdXRzW3Nsb3RdLm1JbmZvLm1UeXBlICE9ICdrZXlib2FyZCdcbiAgICAgICAgQERlc3Ryb3lJbnB1dCBzbG90XG4gICAgICAgIEBtSW5wdXRzW3Nsb3RdID0gdGV4dHVyZVxuICAgICAgICBAbUVmZmVjdC5SZXNpemVCdWZmZXIgdGV4dHVyZS5pZCwgQG1FZmZlY3QubVhyZXMsIEBtRWZmZWN0Lm1ZcmVzLCBmYWxzZVxuICAgICAgICAjIFNldHRpbmcgdGhlIHBhc3NlcyBzYW1wbGVyc1xuICAgICAgICBAU2V0U2FtcGxlckZpbHRlciBzbG90LCB1cmwubVNhbXBsZXIuZmlsdGVyLCBidWZmZXJzLCBjdWJlQnVmZmVycywgdHJ1ZVxuICAgICAgICBAU2V0U2FtcGxlclZGbGlwIHNsb3QsIHVybC5tU2FtcGxlci52ZmxpcFxuICAgICAgICBAU2V0U2FtcGxlcldyYXAgc2xvdCwgdXJsLm1TYW1wbGVyLndyYXAsIGJ1ZmZlcnNcbiAgICAgICAgQE1ha2VIZWFkZXIoKVxuICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgICBlbHNlXG4gICAgICAgIGFsZXJ0ICdpbnB1dCB0eXBlIGVycm9yJ1xuICAgICAgICByZXR1cm4geyBtRmFpbGVkOiB0cnVlIH1cbiAgICB7IG1GYWlsZWQ6IHRydWUgfVxuXG5QYXNzOjpQYWludF9JbWFnZSA9ICh3YSwgZCwgdGltZSwgZHRpbWUsIGZwcywgbW91c2VPcmlYLCBtb3VzZU9yaVksIG1vdXNlUG9zWCwgbW91c2VQb3NZLCB4cmVzLCB5cmVzLCBidWZmZXJzLCBjdWJlQnVmZmVycywga2V5Ym9hcmQpIC0+XG4gICAgYHZhciBpZGBcbiAgICBgdmFyIGZpbHRlcmBcbiAgICB0aW1lcyA9IFtcbiAgICAgICAgMC4wXG4gICAgICAgIDAuMFxuICAgICAgICAwLjBcbiAgICAgICAgMC4wXG4gICAgXVxuICAgIGRhdGVzID0gW1xuICAgICAgICBkLmdldEZ1bGxZZWFyKClcbiAgICAgICAgZC5nZXRNb250aCgpXG4gICAgICAgIGQuZ2V0RGF0ZSgpXG4gICAgICAgIGQuZ2V0SG91cnMoKSAqIDYwLjAgKiA2MCArIGQuZ2V0TWludXRlcygpICogNjAgKyBkLmdldFNlY29uZHMoKSArIGQuZ2V0TWlsbGlzZWNvbmRzKCkgLyAxMDAwLjBcbiAgICBdXG4gICAgbW91c2UgPSBbXG4gICAgICAgIG1vdXNlUG9zWFxuICAgICAgICBtb3VzZVBvc1lcbiAgICAgICAgbW91c2VPcmlYXG4gICAgICAgIG1vdXNlT3JpWVxuICAgIF1cbiAgICByZXNvcyA9IFtcbiAgICAgICAgMC4wXG4gICAgICAgIDAuMFxuICAgICAgICAwLjBcbiAgICAgICAgMC4wXG4gICAgICAgIDAuMFxuICAgICAgICAwLjBcbiAgICAgICAgMC4wXG4gICAgICAgIDAuMFxuICAgICAgICAwLjBcbiAgICAgICAgMC4wXG4gICAgICAgIDAuMFxuICAgICAgICAwLjBcbiAgICBdXG4gICAgdGV4SUQgPSBbXG4gICAgICAgIG51bGxcbiAgICAgICAgbnVsbFxuICAgICAgICBudWxsXG4gICAgICAgIG51bGxcbiAgICBdXG4gICAgaSA9IDBcbiAgICB3aGlsZSBpIDwgQG1JbnB1dHMubGVuZ3RoXG4gICAgICAgIGlucCA9IEBtSW5wdXRzW2ldXG4gICAgICAgIGlmIGlucCA9PSBudWxsXG4gICAgICAgIGVsc2UgaWYgaW5wLm1JbmZvLm1UeXBlID09ICd0ZXh0dXJlJ1xuICAgICAgICAgICAgaWYgaW5wLmxvYWRlZCA9PSB0cnVlXG4gICAgICAgICAgICAgICAgdGV4SURbaV0gPSBpbnAuZ2xvYmplY3RcbiAgICAgICAgICAgICAgICByZXNvc1szICogaSArIDBdID0gaW5wLmltYWdlLndpZHRoXG4gICAgICAgICAgICAgICAgcmVzb3NbMyAqIGkgKyAxXSA9IGlucC5pbWFnZS5oZWlnaHRcbiAgICAgICAgICAgICAgICByZXNvc1szICogaSArIDJdID0gMVxuICAgICAgICBlbHNlIGlmIGlucC5tSW5mby5tVHlwZSA9PSAna2V5Ym9hcmQnXG4gICAgICAgICAgICB0ZXhJRFtpXSA9IGtleWJvYXJkLm1UZXh0dXJlXG4gICAgICAgIGVsc2UgaWYgaW5wLm1JbmZvLm1UeXBlID09ICdjdWJlbWFwJ1xuICAgICAgICAgICAgaWYgaW5wLmxvYWRlZCA9PSB0cnVlXG4gICAgICAgICAgICAgICAgaWQgPSBhc3NldElEX3RvX2N1YmVtYXBCdWZlcklEKGlucC5tSW5mby5tSUQpXG4gICAgICAgICAgICAgICAgaWYgaWQgIT0gLTFcbiAgICAgICAgICAgICAgICAgICAgdGV4SURbaV0gPSBjdWJlQnVmZmVyc1tpZF0ubVRleHR1cmVbY3ViZUJ1ZmZlcnNbaWRdLm1MYXN0UmVuZGVyRG9uZV1cbiAgICAgICAgICAgICAgICAgICAgcmVzb3NbMyAqIGkgKyAwXSA9IGN1YmVCdWZmZXJzW2lkXS5tUmVzb2x1dGlvblswXVxuICAgICAgICAgICAgICAgICAgICByZXNvc1szICogaSArIDFdID0gY3ViZUJ1ZmZlcnNbaWRdLm1SZXNvbHV0aW9uWzFdXG4gICAgICAgICAgICAgICAgICAgIHJlc29zWzMgKiBpICsgMl0gPSAxXG4gICAgICAgICAgICAgICAgICAgICMgaGFjay4gaW4gd2ViZ2wyLjAgd2UgaGF2ZSBzYW1wbGVycywgc28gd2UgZG9uJ3QgbmVlZCB0aGlzIGNyYXAgaGVyZVxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXIgPSBAbVJlbmRlcmVyLkZJTFRFUi5OT05FXG4gICAgICAgICAgICAgICAgICAgIGlmIGlucC5tSW5mby5tU2FtcGxlci5maWx0ZXIgPT0gJ2xpbmVhcidcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlciA9IEBtUmVuZGVyZXIuRklMVEVSLkxJTkVBUlxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIGlucC5tSW5mby5tU2FtcGxlci5maWx0ZXIgPT0gJ21pcG1hcCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlciA9IEBtUmVuZGVyZXIuRklMVEVSLk1JUE1BUFxuICAgICAgICAgICAgICAgICAgICBAbVJlbmRlcmVyLlNldFNhbXBsZXJGaWx0ZXIgdGV4SURbaV0sIGZpbHRlciwgZmFsc2VcbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIHRleElEW2ldID0gaW5wLmdsb2JqZWN0XG4gICAgICAgIGVsc2UgaWYgaW5wLm1JbmZvLm1UeXBlID09ICdidWZmZXInXG4gICAgICAgICAgICBpZiBpbnAubG9hZGVkID09IHRydWVcbiAgICAgICAgICAgICAgICBpZCA9IGlucC5pZFxuICAgICAgICAgICAgICAgIHRleElEW2ldID0gYnVmZmVyc1tpZF0ubVRleHR1cmVbYnVmZmVyc1tpZF0ubUxhc3RSZW5kZXJEb25lXVxuICAgICAgICAgICAgICAgIHJlc29zWzMgKiBpICsgMF0gPSB4cmVzXG4gICAgICAgICAgICAgICAgcmVzb3NbMyAqIGkgKyAxXSA9IHlyZXNcbiAgICAgICAgICAgICAgICByZXNvc1szICogaSArIDJdID0gMVxuICAgICAgICAgICAgICAgICMgaGFjay4gaW4gd2ViZ2wyLjAgd2UgaGF2ZSBzYW1wbGVycywgc28gd2UgZG9uJ3QgbmVlZCB0aGlzIGNyYXAgaGVyZVxuICAgICAgICAgICAgICAgIGZpbHRlciA9IEBtUmVuZGVyZXIuRklMVEVSLk5PTkVcbiAgICAgICAgICAgICAgICBpZiBpbnAubUluZm8ubVNhbXBsZXIuZmlsdGVyID09ICdsaW5lYXInXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlciA9IEBtUmVuZGVyZXIuRklMVEVSLkxJTkVBUlxuICAgICAgICAgICAgICAgIGVsc2UgaWYgaW5wLm1JbmZvLm1TYW1wbGVyLmZpbHRlciA9PSAnbWlwbWFwJ1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXIgPSBAbVJlbmRlcmVyLkZJTFRFUi5NSVBNQVBcbiAgICAgICAgICAgICAgICBAbVJlbmRlcmVyLlNldFNhbXBsZXJGaWx0ZXIgdGV4SURbaV0sIGZpbHRlciwgZmFsc2VcbiAgICAgICAgaSsrXG4gICAgQG1SZW5kZXJlci5BdHRhY2hUZXh0dXJlcyA0LCB0ZXhJRFswXSwgdGV4SURbMV0sIHRleElEWzJdLCB0ZXhJRFszXVxuICAgIHByb2cgPSBAbVByb2dyYW1cbiAgICBAbVJlbmRlcmVyLkF0dGFjaFNoYWRlciBwcm9nXG4gICAgQG1SZW5kZXJlci5TZXRTaGFkZXJDb25zdGFudDFGICdpVGltZScsIHRpbWVcbiAgICBAbVJlbmRlcmVyLlNldFNoYWRlckNvbnN0YW50M0YgJ2lSZXNvbHV0aW9uJywgeHJlcywgeXJlcywgMS4wXG4gICAgQG1SZW5kZXJlci5TZXRTaGFkZXJDb25zdGFudDRGViAnaU1vdXNlJywgbW91c2VcbiAgICBAbVJlbmRlcmVyLlNldFNoYWRlckNvbnN0YW50NEZWICdpRGF0ZScsIGRhdGVzXG4gICAgQG1SZW5kZXJlci5TZXRTaGFkZXJDb25zdGFudDFGICdpU2FtcGxlUmF0ZScsIEBtU2FtcGxlUmF0ZVxuICAgIEBtUmVuZGVyZXIuU2V0U2hhZGVyVGV4dHVyZVVuaXQgJ2lDaGFubmVsMCcsIDBcbiAgICBAbVJlbmRlcmVyLlNldFNoYWRlclRleHR1cmVVbml0ICdpQ2hhbm5lbDEnLCAxXG4gICAgQG1SZW5kZXJlci5TZXRTaGFkZXJUZXh0dXJlVW5pdCAnaUNoYW5uZWwyJywgMlxuICAgIEBtUmVuZGVyZXIuU2V0U2hhZGVyVGV4dHVyZVVuaXQgJ2lDaGFubmVsMycsIDNcbiAgICBAbVJlbmRlcmVyLlNldFNoYWRlckNvbnN0YW50MUkgJ2lGcmFtZScsIEBtRnJhbWVcbiAgICBAbVJlbmRlcmVyLlNldFNoYWRlckNvbnN0YW50MUYgJ2lUaW1lRGVsdGEnLCBkdGltZVxuICAgIEBtUmVuZGVyZXIuU2V0U2hhZGVyQ29uc3RhbnQxRiAnaUZyYW1lUmF0ZScsIGZwc1xuICAgIEBtUmVuZGVyZXIuU2V0U2hhZGVyQ29uc3RhbnQxRiAnaUNoYW5uZWxbMF0udGltZScsIHRpbWVzWzBdXG4gICAgQG1SZW5kZXJlci5TZXRTaGFkZXJDb25zdGFudDFGICdpQ2hhbm5lbFsxXS50aW1lJywgdGltZXNbMV1cbiAgICBAbVJlbmRlcmVyLlNldFNoYWRlckNvbnN0YW50MUYgJ2lDaGFubmVsWzJdLnRpbWUnLCB0aW1lc1syXVxuICAgIEBtUmVuZGVyZXIuU2V0U2hhZGVyQ29uc3RhbnQxRiAnaUNoYW5uZWxbM10udGltZScsIHRpbWVzWzNdXG4gICAgQG1SZW5kZXJlci5TZXRTaGFkZXJDb25zdGFudDNGICdpQ2hhbm5lbFswXS5yZXNvbHV0aW9uJywgcmVzb3NbMF0sIHJlc29zWzFdLCByZXNvc1syXVxuICAgIEBtUmVuZGVyZXIuU2V0U2hhZGVyQ29uc3RhbnQzRiAnaUNoYW5uZWxbMV0ucmVzb2x1dGlvbicsIHJlc29zWzNdLCByZXNvc1s0XSwgcmVzb3NbNV1cbiAgICBAbVJlbmRlcmVyLlNldFNoYWRlckNvbnN0YW50M0YgJ2lDaGFubmVsWzJdLnJlc29sdXRpb24nLCByZXNvc1s2XSwgcmVzb3NbN10sIHJlc29zWzhdXG4gICAgQG1SZW5kZXJlci5TZXRTaGFkZXJDb25zdGFudDNGICdpQ2hhbm5lbFszXS5yZXNvbHV0aW9uJywgcmVzb3NbOV0sIHJlc29zWzEwXSwgcmVzb3NbMTFdXG4gICAgbDEgPSBAbVJlbmRlcmVyLkdldEF0dHJpYkxvY2F0aW9uKEBtUHJvZ3JhbSwgJ3BvcycpXG4gICAgQG1SZW5kZXJlci5TZXRWaWV3cG9ydCBbXG4gICAgICAgIDBcbiAgICAgICAgMFxuICAgICAgICB4cmVzXG4gICAgICAgIHlyZXNcbiAgICBdXG4gICAgQG1SZW5kZXJlci5EcmF3RnVsbFNjcmVlblRyaWFuZ2xlX1hZIGwxXG4gICAgQG1SZW5kZXJlci5EZXR0YWNoVGV4dHVyZXMoKVxuICAgIHJldHVyblxuXG5QYXNzOjpTZXRVbmlmb3JtcyA9ICh3YSwgZCwgdGltZSwgZHRpbWUsIGZwcywgbW91c2VPcmlYLCBtb3VzZU9yaVksIG1vdXNlUG9zWCwgbW91c2VQb3NZLCB4cmVzLCB5cmVzLCBidWZmZXJzLCBjdWJlQnVmZmVycywga2V5Ym9hcmQpIC0+XG4gICAgdGltZXMgPSBbXG4gICAgICAgIDAuMFxuICAgICAgICAwLjBcbiAgICAgICAgMC4wXG4gICAgICAgIDAuMFxuICAgIF1cbiAgICBkYXRlcyA9IFtcbiAgICAgICAgZC5nZXRGdWxsWWVhcigpXG4gICAgICAgIGQuZ2V0TW9udGgoKVxuICAgICAgICBkLmdldERhdGUoKVxuICAgICAgICBkLmdldEhvdXJzKCkgKiA2MC4wICogNjAgKyBkLmdldE1pbnV0ZXMoKSAqIDYwICsgZC5nZXRTZWNvbmRzKCkgKyBkLmdldE1pbGxpc2Vjb25kcygpIC8gMTAwMC4wXG4gICAgXVxuICAgIG1vdXNlID0gW1xuICAgICAgICBtb3VzZVBvc1hcbiAgICAgICAgbW91c2VQb3NZXG4gICAgICAgIG1vdXNlT3JpWFxuICAgICAgICBtb3VzZU9yaVlcbiAgICBdXG4gICAgcmVzb3MgPSBbXG4gICAgICAgIDAuMFxuICAgICAgICAwLjBcbiAgICAgICAgMC4wXG4gICAgICAgIDAuMFxuICAgICAgICAwLjBcbiAgICAgICAgMC4wXG4gICAgICAgIDAuMFxuICAgICAgICAwLjBcbiAgICAgICAgMC4wXG4gICAgICAgIDAuMFxuICAgICAgICAwLjBcbiAgICAgICAgMC4wXG4gICAgXVxuICAgIHRleElEID0gW1xuICAgICAgICBudWxsXG4gICAgICAgIG51bGxcbiAgICAgICAgbnVsbFxuICAgICAgICBudWxsXG4gICAgXVxuICAgIGkgPSAwXG4gICAgd2hpbGUgaSA8IEBtSW5wdXRzLmxlbmd0aFxuICAgICAgICBpbnAgPSBAbUlucHV0c1tpXVxuICAgICAgICBpZiBpbnAgPT0gbnVsbFxuICAgICAgICBlbHNlIGlmIGlucC5tSW5mby5tVHlwZSA9PSAndGV4dHVyZSdcbiAgICAgICAgICAgIGlmIGlucC5sb2FkZWQgPT0gdHJ1ZVxuICAgICAgICAgICAgICAgIHRleElEW2ldID0gaW5wLmdsb2JqZWN0XG4gICAgICAgICAgICAgICAgcmVzb3NbMyAqIGkgKyAwXSA9IGlucC5pbWFnZS53aWR0aFxuICAgICAgICAgICAgICAgIHJlc29zWzMgKiBpICsgMV0gPSBpbnAuaW1hZ2UuaGVpZ2h0XG4gICAgICAgICAgICAgICAgcmVzb3NbMyAqIGkgKyAyXSA9IDFcbiAgICAgICAgZWxzZSBpZiBpbnAubUluZm8ubVR5cGUgPT0gJ2tleWJvYXJkJ1xuICAgICAgICAgICAgdGV4SURbaV0gPSBrZXlib2FyZC5tVGV4dHVyZVxuICAgICAgICBlbHNlIGlmIGlucC5tSW5mby5tVHlwZSA9PSAnY3ViZW1hcCdcbiAgICAgICAgICAgIGlmIGlucC5sb2FkZWQgPT0gdHJ1ZVxuICAgICAgICAgICAgICAgIGlkID0gYXNzZXRJRF90b19jdWJlbWFwQnVmZXJJRChpbnAubUluZm8ubUlEKVxuICAgICAgICAgICAgICAgIGlmIGlkICE9IC0xXG4gICAgICAgICAgICAgICAgICAgIHRleElEW2ldID0gY3ViZUJ1ZmZlcnNbaWRdLm1UZXh0dXJlW2N1YmVCdWZmZXJzW2lkXS5tTGFzdFJlbmRlckRvbmVdXG4gICAgICAgICAgICAgICAgICAgIHJlc29zWzMgKiBpICsgMF0gPSBjdWJlQnVmZmVyc1tpZF0ubVJlc29sdXRpb25bMF1cbiAgICAgICAgICAgICAgICAgICAgcmVzb3NbMyAqIGkgKyAxXSA9IGN1YmVCdWZmZXJzW2lkXS5tUmVzb2x1dGlvblsxXVxuICAgICAgICAgICAgICAgICAgICByZXNvc1szICogaSArIDJdID0gMVxuICAgICAgICAgICAgICAgICAgICAjIGhhY2suIGluIHdlYmdsMi4wIHdlIGhhdmUgc2FtcGxlcnMsIHNvIHdlIGRvbid0IG5lZWQgdGhpcyBjcmFwIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyID0gQG1SZW5kZXJlci5GSUxURVIuTk9ORVxuICAgICAgICAgICAgICAgICAgICBpZiBpbnAubUluZm8ubVNhbXBsZXIuZmlsdGVyID09ICdsaW5lYXInXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXIgPSBAbVJlbmRlcmVyLkZJTFRFUi5MSU5FQVJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBpbnAubUluZm8ubVNhbXBsZXIuZmlsdGVyID09ICdtaXBtYXAnXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXIgPSBAbVJlbmRlcmVyLkZJTFRFUi5NSVBNQVBcbiAgICAgICAgICAgICAgICAgICAgQG1SZW5kZXJlci5TZXRTYW1wbGVyRmlsdGVyIHRleElEW2ldLCBmaWx0ZXIsIGZhbHNlXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB0ZXhJRFtpXSA9IGlucC5nbG9iamVjdFxuICAgICAgICBlbHNlIGlmIGlucC5tSW5mby5tVHlwZSA9PSAnYnVmZmVyJ1xuICAgICAgICAgICAgaWYgaW5wLmxvYWRlZCA9PSB0cnVlXG4gICAgICAgICAgICAgICAgdGV4SURbaV0gPSBidWZmZXJzW2lucC5pZF0ubVRleHR1cmVbYnVmZmVyc1tpbnAuaWRdLm1MYXN0UmVuZGVyRG9uZV1cbiAgICAgICAgICAgICAgICByZXNvc1szICogaSArIDBdID0geHJlc1xuICAgICAgICAgICAgICAgIHJlc29zWzMgKiBpICsgMV0gPSB5cmVzXG4gICAgICAgICAgICAgICAgcmVzb3NbMyAqIGkgKyAyXSA9IDFcbiAgICAgICAgaSsrXG4gICAgQG1SZW5kZXJlci5BdHRhY2hUZXh0dXJlcyA0LCB0ZXhJRFswXSwgdGV4SURbMV0sIHRleElEWzJdLCB0ZXhJRFszXVxuICAgIEBtUmVuZGVyZXIuQXR0YWNoU2hhZGVyIEBtUHJvZ3JhbVxuICAgIEBtUmVuZGVyZXIuU2V0U2hhZGVyQ29uc3RhbnQxRiAnaVRpbWUnLCB0aW1lXG4gICAgQG1SZW5kZXJlci5TZXRTaGFkZXJDb25zdGFudDNGICdpUmVzb2x1dGlvbicsIHhyZXMsIHlyZXMsIDEuMFxuICAgIEBtUmVuZGVyZXIuU2V0U2hhZGVyQ29uc3RhbnQ0RlYgJ2lNb3VzZScsIG1vdXNlXG4gICAgQG1SZW5kZXJlci5TZXRTaGFkZXJDb25zdGFudDRGViAnaURhdGUnLCBkYXRlc1xuICAgIEBtUmVuZGVyZXIuU2V0U2hhZGVyQ29uc3RhbnQxRiAnaVNhbXBsZVJhdGUnLCBAbVNhbXBsZVJhdGVcbiAgICBAbVJlbmRlcmVyLlNldFNoYWRlclRleHR1cmVVbml0ICdpQ2hhbm5lbDAnLCAwXG4gICAgQG1SZW5kZXJlci5TZXRTaGFkZXJUZXh0dXJlVW5pdCAnaUNoYW5uZWwxJywgMVxuICAgIEBtUmVuZGVyZXIuU2V0U2hhZGVyVGV4dHVyZVVuaXQgJ2lDaGFubmVsMicsIDJcbiAgICBAbVJlbmRlcmVyLlNldFNoYWRlclRleHR1cmVVbml0ICdpQ2hhbm5lbDMnLCAzXG4gICAgQG1SZW5kZXJlci5TZXRTaGFkZXJDb25zdGFudDFJICdpRnJhbWUnLCBAbUZyYW1lXG4gICAgQG1SZW5kZXJlci5TZXRTaGFkZXJDb25zdGFudDFGICdpVGltZURlbHRhJywgZHRpbWVcbiAgICBAbVJlbmRlcmVyLlNldFNoYWRlckNvbnN0YW50MUYgJ2lGcmFtZVJhdGUnLCBmcHNcbiAgICBAbVJlbmRlcmVyLlNldFNoYWRlckNvbnN0YW50MUYgJ2lDaGFubmVsWzBdLnRpbWUnLCB0aW1lc1swXVxuICAgIEBtUmVuZGVyZXIuU2V0U2hhZGVyQ29uc3RhbnQxRiAnaUNoYW5uZWxbMV0udGltZScsIHRpbWVzWzFdXG4gICAgQG1SZW5kZXJlci5TZXRTaGFkZXJDb25zdGFudDFGICdpQ2hhbm5lbFsyXS50aW1lJywgdGltZXNbMl1cbiAgICBAbVJlbmRlcmVyLlNldFNoYWRlckNvbnN0YW50MUYgJ2lDaGFubmVsWzNdLnRpbWUnLCB0aW1lc1szXVxuICAgIEBtUmVuZGVyZXIuU2V0U2hhZGVyQ29uc3RhbnQzRiAnaUNoYW5uZWxbMF0ucmVzb2x1dGlvbicsIHJlc29zWzBdLCByZXNvc1sxXSwgcmVzb3NbMl1cbiAgICBAbVJlbmRlcmVyLlNldFNoYWRlckNvbnN0YW50M0YgJ2lDaGFubmVsWzFdLnJlc29sdXRpb24nLCByZXNvc1szXSwgcmVzb3NbNF0sIHJlc29zWzVdXG4gICAgQG1SZW5kZXJlci5TZXRTaGFkZXJDb25zdGFudDNGICdpQ2hhbm5lbFsyXS5yZXNvbHV0aW9uJywgcmVzb3NbNl0sIHJlc29zWzddLCByZXNvc1s4XVxuICAgIEBtUmVuZGVyZXIuU2V0U2hhZGVyQ29uc3RhbnQzRiAnaUNoYW5uZWxbM10ucmVzb2x1dGlvbicsIHJlc29zWzldLCByZXNvc1sxMF0sIHJlc29zWzExXVxuICAgIHJldHVyblxuXG5QYXNzOjpQcm9jZXNzSW5wdXRzID0gKHdhLCB0aW1lLCBkdGltZSwgZnBzLCBtb3VzZU9yaVgsIG1vdXNlT3JpWSwgbW91c2VQb3NYLCBtb3VzZVBvc1ksIHhyZXMsIHlyZXMsIGJ1ZmZlcnMsIGN1YmVCdWZmZXJzLCBrZXlib2FyZCkgLT5cbiAgICBpID0gMFxuICAgIHdoaWxlIGkgPCBAbUlucHV0cy5sZW5ndGhcbiAgICAgICAgaW5wID0gQG1JbnB1dHNbaV1cbiAgICAgICAgaWYgaW5wID09IG51bGxcbiAgICAgICAgZWxzZVxuICAgICAgICBpZiBpbnAubUluZm8ubVR5cGUgPT0gJ2J1ZmZlcidcbiAgICAgICAgICAgIGlmIGlucC5sb2FkZWQgPT0gdHJ1ZVxuICAgICAgICAgICAgICAgIGlkID0gaW5wLmlkXG4gICAgICAgICAgICAgICAgdGV4SUQgPSBidWZmZXJzW2lkXS5tVGV4dHVyZVtidWZmZXJzW2lkXS5tTGFzdFJlbmRlckRvbmVdXG4gICAgICAgICAgICAgICAgIyBoYWNrLiBpbiB3ZWJnbDIuMCB3ZSBoYXZlIHNhbXBsZXJzLCBzbyB3ZSBkb24ndCBuZWVkIHRoaXMgY3JhcCBoZXJlXG4gICAgICAgICAgICAgICAgZmlsdGVyID0gQG1SZW5kZXJlci5GSUxURVIuTk9ORVxuICAgICAgICAgICAgICAgIGlmIGlucC5tSW5mby5tU2FtcGxlci5maWx0ZXIgPT0gJ2xpbmVhcidcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyID0gQG1SZW5kZXJlci5GSUxURVIuTElORUFSXG4gICAgICAgICAgICAgICAgZWxzZSBpZiBpbnAubUluZm8ubVNhbXBsZXIuZmlsdGVyID09ICdtaXBtYXAnXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlciA9IEBtUmVuZGVyZXIuRklMVEVSLk1JUE1BUFxuICAgICAgICAgICAgICAgIEBtUmVuZGVyZXIuU2V0U2FtcGxlckZpbHRlciB0ZXhJRCwgZmlsdGVyLCBmYWxzZVxuICAgICAgICBpKytcbiAgICByZXR1cm5cblxuUGFzczo6UGFpbnRfQ3ViZW1hcCA9ICh3YSwgZCwgdGltZSwgZHRpbWUsIGZwcywgbW91c2VPcmlYLCBtb3VzZU9yaVksIG1vdXNlUG9zWCwgbW91c2VQb3NZLCB4cmVzLCB5cmVzLCBidWZmZXJzLCBjdWJlQnVmZmVycywga2V5Ym9hcmQsIGZhY2UpIC0+XG4gICAgQFByb2Nlc3NJbnB1dHMgd2EsIGQsIHRpbWUsIGR0aW1lLCBmcHMsIG1vdXNlT3JpWCwgbW91c2VPcmlZLCBtb3VzZVBvc1gsIG1vdXNlUG9zWSwgeHJlcywgeXJlcywgYnVmZmVycywgY3ViZUJ1ZmZlcnMsIGtleWJvYXJkLCBmYWNlXG4gICAgQFNldFVuaWZvcm1zIHdhLCBkLCB0aW1lLCBkdGltZSwgZnBzLCBtb3VzZU9yaVgsIG1vdXNlT3JpWSwgbW91c2VQb3NYLCBtb3VzZVBvc1ksIHhyZXMsIHlyZXMsIGJ1ZmZlcnMsIGN1YmVCdWZmZXJzLCBrZXlib2FyZFxuICAgIGwxID0gQG1SZW5kZXJlci5HZXRBdHRyaWJMb2NhdGlvbihAbVByb2dyYW0sICdwb3MnKVxuICAgIHZwID0gW1xuICAgICAgICAwXG4gICAgICAgIDBcbiAgICAgICAgeHJlc1xuICAgICAgICB5cmVzXG4gICAgXVxuICAgIEBtUmVuZGVyZXIuU2V0Vmlld3BvcnQgdnBcbiAgICBjb3JBID0gW1xuICAgICAgICAtMS4wXG4gICAgICAgIC0xLjBcbiAgICAgICAgLTEuMFxuICAgIF1cbiAgICBjb3JCID0gW1xuICAgICAgICAxLjBcbiAgICAgICAgLTEuMFxuICAgICAgICAtMS4wXG4gICAgXVxuICAgIGNvckMgPSBbXG4gICAgICAgIDEuMFxuICAgICAgICAxLjBcbiAgICAgICAgLTEuMFxuICAgIF1cbiAgICBjb3JEID0gW1xuICAgICAgICAtMS4wXG4gICAgICAgIDEuMFxuICAgICAgICAtMS4wXG4gICAgXVxuICAgIGFwZXggPSBbXG4gICAgICAgIDAuMFxuICAgICAgICAwLjBcbiAgICAgICAgMC4wXG4gICAgXVxuICAgIGlmIGZhY2UgPT0gMFxuICAgICAgICBjb3JBID0gW1xuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICBdXG4gICAgICAgIGNvckIgPSBbXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICBdXG4gICAgICAgIGNvckMgPSBbXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgXVxuICAgICAgICBjb3JEID0gW1xuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgXVxuICAgIGVsc2UgaWYgZmFjZSA9PSAxXG4gICAgICAgIGNvckEgPSBbXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgXVxuICAgICAgICBjb3JCID0gW1xuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgXVxuICAgICAgICBjb3JDID0gW1xuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgIF1cbiAgICAgICAgY29yRCA9IFtcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgXVxuICAgIGVsc2UgaWYgZmFjZSA9PSAyXG4gICAgICAgIGNvckEgPSBbXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgXVxuICAgICAgICBjb3JCID0gW1xuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgXVxuICAgICAgICBjb3JDID0gW1xuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICBdXG4gICAgICAgIGNvckQgPSBbXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICBdXG4gICAgZWxzZSBpZiBmYWNlID09IDNcbiAgICAgICAgY29yQSA9IFtcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICBdXG4gICAgICAgIGNvckIgPSBbXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICBdXG4gICAgICAgIGNvckMgPSBbXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgXVxuICAgICAgICBjb3JEID0gW1xuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICBdXG4gICAgZWxzZSBpZiBmYWNlID09IDRcbiAgICAgICAgY29yQSA9IFtcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgIF1cbiAgICAgICAgY29yQiA9IFtcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgXVxuICAgICAgICBjb3JDID0gW1xuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgXVxuICAgICAgICBjb3JEID0gW1xuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgIF1cbiAgICBlbHNlXG4gICAgICAgIGNvckEgPSBbXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICBdXG4gICAgICAgIGNvckIgPSBbXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgXVxuICAgICAgICBjb3JDID0gW1xuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICBdXG4gICAgICAgIGNvckQgPSBbXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgXVxuICAgIGNvcm5lcnMgPSBbXG4gICAgICAgIGNvckFbMF1cbiAgICAgICAgY29yQVsxXVxuICAgICAgICBjb3JBWzJdXG4gICAgICAgIGNvckJbMF1cbiAgICAgICAgY29yQlsxXVxuICAgICAgICBjb3JCWzJdXG4gICAgICAgIGNvckNbMF1cbiAgICAgICAgY29yQ1sxXVxuICAgICAgICBjb3JDWzJdXG4gICAgICAgIGNvckRbMF1cbiAgICAgICAgY29yRFsxXVxuICAgICAgICBjb3JEWzJdXG4gICAgICAgIGFwZXhbMF1cbiAgICAgICAgYXBleFsxXVxuICAgICAgICBhcGV4WzJdXG4gICAgXVxuICAgIEBtUmVuZGVyZXIuU2V0U2hhZGVyQ29uc3RhbnQzRlYgJ3VuQ29ybmVycycsIGNvcm5lcnNcbiAgICBAbVJlbmRlcmVyLlNldFNoYWRlckNvbnN0YW50NEZWICd1blZpZXdwb3J0JywgdnBcbiAgICBAbVJlbmRlcmVyLkRyYXdVbml0UXVhZF9YWSBsMVxuICAgIEBtUmVuZGVyZXIuRGV0dGFjaFRleHR1cmVzKClcbiAgICByZXR1cm5cblxuUGFzczo6UGFpbnQgPSAod2EsIGRhLCB0aW1lLCBkdGltZSwgZnBzLCBtb3VzZU9yaVgsIG1vdXNlT3JpWSwgbW91c2VQb3NYLCBtb3VzZVBvc1ksIHhyZXMsIHlyZXMsIGlzUGF1c2VkLCBidWZmZXJJRCwgYnVmZmVyTmVlZHNNaW1hcHMsIGJ1ZmZlcnMsIGN1YmVCdWZmZXJzLCBrZXlib2FyZCwgZWZmZWN0KSAtPlxuICAgIGB2YXIgYnVmZmVyYFxuICAgIGB2YXIgZHN0SURgXG4gICAgaWYgQG1UeXBlID09ICdpbWFnZSdcbiAgICAgICAgQG1SZW5kZXJlci5TZXRSZW5kZXJUYXJnZXQgbnVsbFxuICAgICAgICBAUGFpbnRfSW1hZ2Ugd2EsIGRhLCB0aW1lLCBkdGltZSwgZnBzLCBtb3VzZU9yaVgsIG1vdXNlT3JpWSwgbW91c2VQb3NYLCBtb3VzZVBvc1ksIHhyZXMsIHlyZXMsIGJ1ZmZlcnMsIGN1YmVCdWZmZXJzLCBrZXlib2FyZFxuICAgICAgICBAbUZyYW1lKytcbiAgICBlbHNlIGlmIEBtVHlwZSA9PSAnY29tbW9uJ1xuICAgICAgICAjY29uc29sZS5sb2coXCJyZW5kZXJpbmcgY29tbW9uXCIpO1xuICAgIGVsc2UgaWYgQG1UeXBlID09ICdidWZmZXInXG4gICAgICAgIEBtRWZmZWN0LlJlc2l6ZUJ1ZmZlciBidWZmZXJJRCwgQG1FZmZlY3QubVhyZXMsIEBtRWZmZWN0Lm1ZcmVzLCBmYWxzZVxuICAgICAgICBidWZmZXIgPSBidWZmZXJzW2J1ZmZlcklEXVxuICAgICAgICBkc3RJRCA9IDEgLSAoYnVmZmVyLm1MYXN0UmVuZGVyRG9uZSlcbiAgICAgICAgQG1SZW5kZXJlci5TZXRSZW5kZXJUYXJnZXQgYnVmZmVyLm1UYXJnZXRbZHN0SURdXG4gICAgICAgIEBQYWludF9JbWFnZSB3YSwgZGEsIHRpbWUsIGR0aW1lLCBmcHMsIG1vdXNlT3JpWCwgbW91c2VPcmlZLCBtb3VzZVBvc1gsIG1vdXNlUG9zWSwgeHJlcywgeXJlcywgYnVmZmVycywgY3ViZUJ1ZmZlcnMsIGtleWJvYXJkXG4gICAgICAgICMgY29tcHV0ZSBtaXBtYXBzIGlmIG5lZWRlZFxuICAgICAgICBpZiBidWZmZXJOZWVkc01pbWFwc1xuICAgICAgICAgICAgQG1SZW5kZXJlci5DcmVhdGVNaXBtYXBzIGJ1ZmZlci5tVGV4dHVyZVtkc3RJRF1cbiAgICAgICAgYnVmZmVyc1tidWZmZXJJRF0ubUxhc3RSZW5kZXJEb25lID0gMSAtIChidWZmZXJzW2J1ZmZlcklEXS5tTGFzdFJlbmRlckRvbmUpXG4gICAgICAgIEBtRnJhbWUrK1xuICAgIGVsc2UgaWYgQG1UeXBlID09ICdjdWJlbWFwJ1xuICAgICAgICBAbUVmZmVjdC5SZXNpemVDdWJlbWFwQnVmZmVyIGJ1ZmZlcklELCAxMDI0LCAxMDI0LCBmYWxzZVxuICAgICAgICBidWZmZXIgPSBjdWJlQnVmZmVyc1tidWZmZXJJRF1cbiAgICAgICAgeHJlcyA9IGJ1ZmZlci5tUmVzb2x1dGlvblswXVxuICAgICAgICB5cmVzID0gYnVmZmVyLm1SZXNvbHV0aW9uWzFdXG4gICAgICAgIGRzdElEID0gMSAtIChidWZmZXIubUxhc3RSZW5kZXJEb25lKVxuICAgICAgICBmYWNlID0gMFxuICAgICAgICB3aGlsZSBmYWNlIDwgNlxuICAgICAgICAgICAgQG1SZW5kZXJlci5TZXRSZW5kZXJUYXJnZXRDdWJlTWFwIGJ1ZmZlci5tVGFyZ2V0W2RzdElEXSwgZmFjZVxuICAgICAgICAgICAgQFBhaW50X0N1YmVtYXAgd2EsIGRhLCB0aW1lLCBkdGltZSwgZnBzLCBtb3VzZU9yaVgsIG1vdXNlT3JpWSwgbW91c2VQb3NYLCBtb3VzZVBvc1ksIHhyZXMsIHlyZXMsIGJ1ZmZlcnMsIGN1YmVCdWZmZXJzLCBrZXlib2FyZCwgZmFjZVxuICAgICAgICAgICAgZmFjZSsrXG4gICAgICAgIEBtUmVuZGVyZXIuU2V0UmVuZGVyVGFyZ2V0Q3ViZU1hcCBudWxsLCAwXG4gICAgICAgICMgY29tcHV0ZSBtaXBtYXBzIGlmIG5lZWRlZFxuICAgICAgICBpZiBidWZmZXJOZWVkc01pbWFwc1xuICAgICAgICAgICAgQG1SZW5kZXJlci5DcmVhdGVNaXBtYXBzIGJ1ZmZlci5tVGV4dHVyZVtkc3RJRF1cbiAgICAgICAgY3ViZUJ1ZmZlcnNbYnVmZmVySURdLm1MYXN0UmVuZGVyRG9uZSA9IDEgLSAoY3ViZUJ1ZmZlcnNbYnVmZmVySURdLm1MYXN0UmVuZGVyRG9uZSlcbiAgICAgICAgQG1GcmFtZSsrXG4gICAgcmV0dXJuXG5cblBhc3M6OkdldENvbXBpbGF0aW9uVGltZSA9IC0+XG4gICAgQG1Db21waWxhdGlvblRpbWVcbiJdfQ==
//# sourceURL=../coffee/pass.coffee