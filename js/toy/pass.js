// koffee 1.7.0
var Pass, assetID_to_bufferID, assetID_to_cubemapBuferID, bufferID_to_assetID, cubamepBufferID_to_assetID;

bufferID_to_assetID = function(id) {
    switch (id) {
        case 0:
            return '4dXGR8';
        case 1:
            return 'XsXGR8';
        case 2:
            return '4sXGR8';
        case 3:
            return 'XdfGR8';
        default:
            return 'none';
    }
};

assetID_to_bufferID = function(id) {
    switch (id) {
        case '4dXGR8':
            return 0;
        case 'XsXGR8':
            return 1;
        case '4sXGR8':
            return 2;
        case 'XdfGR8':
            return 3;
        default:
            return -1;
    }
};

assetID_to_cubemapBuferID = function(id) {
    return id !== '4dX3Rr' && -1 || 0;
};

cubamepBufferID_to_assetID = function(id) {
    return id === 0 && '4dX3Rr' || 'none';
};

Pass = (function() {
    function Pass(mRenderer, mID, mEffect) {
        this.mRenderer = mRenderer;
        this.mID = mID;
        this.mEffect = mEffect;
        this.mInputs = [null, null, null, null];
        this.mOutputs = [null, null, null, null];
        this.mSource = null;
        this.mType = 'image';
        this.mName = 'none';
        this.mCompile = 0;
        this.mFrame = 0;
    }

    Pass.prototype.commonHeader = function() {
        var h, i, j, ref, ref1;
        h = "#define HW_PERFORMANCE 1\nuniform vec3      iResolution;\nuniform float     iTime;\nuniform float     iChannelTime[4];\nuniform vec4      iMouse;\nuniform vec4      iDate;\nuniform float     iSampleRate;\nuniform vec3      iChannelResolution[4];\nuniform int       iFrame;\nuniform float     iTimeDelta;\nuniform float     iFrameRate;";
        for (i = j = 0, ref = this.mInputs.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
            h += "uniform sampler" + (((ref1 = this.mInputs[i]) != null ? ref1.mInfo.mType : void 0) === 'cubemap' && 'Cube' || '2D') + " iChannel" + i + ";\n";
        }
        return h;
    };

    Pass.prototype.makeHeaderImage = function() {
        this.header = this.commonHeader();
        this.header += "struct Channel\n{\n    vec3  resolution;\n    float time;\n};\nuniform Channel iChannel[4];\n\nvoid mainImage( out vec4 c,  in vec2 f );";
        return this.footer = "out vec4 outColor;\nvoid main( void )\n{\n    vec4 color = vec4(0.0,0.0,0.0,1.0);\n    mainImage(color, gl_FragCoord.xy);\n    color.w = 1.0;\n    outColor = color;\n}";
    };

    Pass.prototype.makeHeaderBuffer = function() {
        this.header = this.commonHeader();
        this.header += 'void mainImage( out vec4 c,  in vec2 f );\n';
        return this.footer = "out vec4 outColor;\nvoid main( void )\n{\n    vec4 color = vec4(0.0,0.0,0.0,1.0);\n    mainImage( color, gl_FragCoord.xy );\n    outColor = color;\n}";
    };

    Pass.prototype.makeHeaderCubemap = function() {
        this.header = this.commonHeader();
        this.header += 'void mainCubemap( out vec4 c, in vec2 f, in vec3 ro, in vec3 rd );\n';
        return this.footer = "uniform vec4 unViewport;\nuniform vec3 unCorners[5];\nout vec4 outColor;\nvoid main(void)\n{\n    vec4 color = vec4(0.0,0.0,0.0,1.0);\n    vec3 ro = unCorners[4];\n    vec2 uv = (gl_FragCoord.xy - unViewport.xy)/unViewport.zw;\n    vec3 rd = normalize( mix( mix( unCorners[0], unCorners[1], uv.x ), mix( unCorners[3], unCorners[2], uv.x ), uv.y ) - ro);\n    mainCubemap(color, gl_FragCoord.xy-unViewport.xy, ro, rd);\n    outColor = color; \n}";
    };

    Pass.prototype.makeHeaderCommon = function() {
        this.header = "uniform vec4      iDate;\nuniform float     iSampleRate;";
        return this.footer = "out vec4 outColor;\nvoid main(void)\n{\n    outColor = vec4(0.0);\n}";
    };

    Pass.prototype.makeHeader = function() {
        switch (this.mType) {
            case 'image':
                return this.makeHeaderImage();
            case 'buffer':
                return this.makeHeaderBuffer();
            case 'common':
                return this.makeHeaderCommon();
            case 'cubemap':
                return this.makeHeaderCubemap();
        }
    };

    Pass.prototype.create = function(mType, mName) {
        var ref;
        this.mType = mType;
        this.mName = mName;
        this.mSource = null;
        this.makeHeader();
        if ((ref = this.mType) === 'image' || ref === 'buffer' || ref === 'cubemap') {
            return this.mProgram = null;
        }
    };

    Pass.prototype.destroy = function() {
        return this.mSource = null;
    };

    Pass.prototype.newShader_Image = function(shaderCode, commonShaderCodes) {
        var fsSource, i, res, vsSource;
        vsSource = 'layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }';
        fsSource = this.header;
        i = 0;
        while (i < commonShaderCodes.length) {
            fsSource += commonShaderCodes[i] + '\n';
            i++;
        }
        fsSource += shaderCode;
        fsSource += this.footer;
        res = this.mRenderer.createShader(vsSource, fsSource);
        if (res.mResult === false) {
            return res.mInfo;
        }
        if (this.mProgram !== null) {
            this.mRenderer.destroyShader(this.mProgram);
        }
        this.mProgram = res;
        return null;
    };

    Pass.prototype.newShader_Cubemap = function(shaderCode, commonShaderCodes) {
        var fsSource, i, res, vsSource;
        vsSource = 'layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }';
        fsSource = this.header;
        i = 0;
        while (i < commonShaderCodes.length) {
            fsSource += commonShaderCodes[i] + '\n';
            i++;
        }
        fsSource += shaderCode;
        fsSource += this.footer;
        res = this.mRenderer.createShader(vsSource, fsSource);
        if (res.mResult === false) {
            return res.mInfo;
        }
        if (this.mProgram !== null) {
            this.mRenderer.destroyShader(this.mProgram);
        }
        this.mProgram = res;
        return null;
    };

    Pass.prototype.newShader_Common = function(shaderCode) {
        var fsSource, res, vsSource;
        vsSource = 'layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }';
        fsSource = this.header + shaderCode + this.footer;
        res = this.mRenderer.createShader(vsSource, fsSource);
        if (res.mResult === false) {
            return res.mInfo;
        }
        if (this.mProgram !== null) {
            this.mRenderer.destroyShader(this.mProgram);
        }
        this.mProgram = res;
        return null;
    };

    Pass.prototype.newShader = function(shaderCode, commonSourceCodes) {
        var res, timeStart;
        if (this.mRenderer === null) {
            return null;
        }
        timeStart = performance.now();
        res = null;
        if (this.mType === 'image') {
            res = this.newShader_Image(shaderCode, commonSourceCodes);
        } else if (this.mType === 'buffer') {
            res = this.newShader_Image(shaderCode, commonSourceCodes);
        } else if (this.mType === 'common') {
            res = this.newShader_Common(shaderCode);
        } else if (this.mType === 'cubemap') {
            res = this.newShader_Cubemap(shaderCode, commonSourceCodes);
        } else {
            alert('ERROR');
        }
        if (res === null) {
            this.mCompile = performance.now() - timeStart;
        }
        this.mSource = shaderCode;
        return res;
    };

    Pass.prototype.destroyInput = function(id) {
        if (this.mInputs[id] === null) {
            return;
        }
        if (this.mInputs[id].mInfo.mType === 'texture') {
            if (this.mInputs[id].globject !== null) {
                this.mRenderer.destroyTexture(this.mInputs[id].globject);
            }
        } else if (this.mInputs[id].mInfo.mType === 'cubemap') {
            if (this.mInputs[id].globject !== null) {
                this.mRenderer.destroyTexture(this.mInputs[id].globject);
            }
        } else if (this.mInputs[id].mInfo.mType === 'keyboard') {

        } else {

        }
        this.mInputs[id] = null;
    };

    Pass.prototype.sampler2Renderer = function(sampler) {
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

    Pass.prototype.setSamplerFilter = function(id, str, buffers, cubeBuffers) {
        var filter, inp, me, renderer;
        me = this;
        renderer = this.mRenderer;
        inp = this.mInputs[id];
        filter = Renderer.FILTER.NONE;
        if (str === 'linear') {
            filter = Renderer.FILTER.LINEAR;
        }
        if (str === 'mipmap') {
            filter = Renderer.FILTER.MIPMAP;
        }
        if (inp === null) {

        } else if (inp.mInfo.mType === 'texture') {
            if (inp.loaded) {
                renderer.setSamplerFilter(inp.globject, filter, true);
                return inp.mInfo.mSampler.filter = str;
            }
        } else if (inp.mInfo.mType === 'cubemap') {
            if (inp.loaded) {
                if (assetID_to_cubemapBuferID(inp.mInfo.mID) === 0) {
                    renderer.setSamplerFilter(cubeBuffers[id].mTexture[0], filter, true);
                    renderer.setSamplerFilter(cubeBuffers[id].mTexture[1], filter, true);
                    return inp.mInfo.mSampler.filter = str;
                } else {
                    renderer.setSamplerFilter(inp.globject, filter, true);
                    return inp.mInfo.mSampler.filter = str;
                }
            }
        } else if (inp.mInfo.mType === 'buffer') {
            renderer.setSamplerFilter(buffers[inp.id].mTexture[0], filter, true);
            renderer.setSamplerFilter(buffers[inp.id].mTexture[1], filter, true);
            return inp.mInfo.mSampler.filter = str;
        } else if (inp.mInfo.mType === 'keyboard') {
            return inp.mInfo.mSampler.filter = str;
        }
    };

    Pass.prototype.setSamplerWrap = function(id, str, buffers) {
        var inp, renderer, restr;
        renderer = this.mRenderer;
        inp = this.mInputs[id];
        restr = renderer.TEXWRP.REPEAT;
        if (str === 'clamp') {
            restr = renderer.TEXWRP.CLAMP;
        }
        if (inp === null) {

        } else if (inp.mInfo.mType === 'texture') {
            if (inp.loaded) {
                renderer.setSamplerWrap(inp.globject, restr);
                return inp.mInfo.mSampler.wrap = str;
            }
        } else if (inp.mInfo.mType === 'cubemap') {
            if (inp.loaded) {
                renderer.setSamplerWrap(inp.globject, restr);
                return inp.mInfo.mSampler.wrap = str;
            }
        } else if (inp.mInfo.mType === 'buffer') {
            renderer.setSamplerWrap(buffers[inp.id].mTexture[0], restr);
            renderer.setSamplerWrap(buffers[inp.id].mTexture[1], restr);
            return inp.mInfo.mSampler.wrap = str;
        }
    };

    Pass.prototype.getTexture = function(slot) {
        var ref;
        return (ref = this.mInputs[slot]) != null ? ref.mInfo : void 0;
    };

    Pass.prototype.setOutputs = function(slot, id) {
        return this.mOutputs[slot] = id;
    };

    Pass.prototype.setOutputsByBufferID = function(slot, id) {
        if (this.mType === 'buffer') {
            this.mOutputs[slot] = bufferID_to_assetID(id);
            return this.mEffect.resizeBuffer(id, this.mEffect.mXres, this.mEffect.mYres, false);
        } else if (this.mType === 'cubemap') {
            this.mOutputs[slot] = cubamepBufferID_to_assetID(id);
            return this.mEffect.resizeCubemapBuffer(id, 1024, 1024);
        }
    };

    Pass.prototype.newTexture = function(slot, url, buffers, cubeBuffers, keyboard) {
        var i, me, n, numLoaded, renderer, returnValue, rti, texture;
        me = this;
        renderer = this.mRenderer;
        if (renderer === null) {
            return;
        }
        texture = null;
        if (!(url != null ? url.mType : void 0)) {
            this.destroyInput(slot);
            this.mInputs[slot] = null;
            this.makeHeader();
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
                rti = this.sampler2Renderer(url.mSampler);
                channels = renderer.TEXFMT.C4I8;
                if (url.mID === 'Xdf3zn' || url.mID === '4sf3Rn' || url.mID === '4dXGzn' || url.mID === '4sf3Rr') {
                    channels = renderer.TEXFMT.C1I8;
                }
                texture.globject = renderer.createTextureFromImage(renderer.TEXTYPE.T2D, texture.image, channels, rti.mFilter, rti.mWrap, rti.mVFlip);
                texture.loaded = true;
            };
            texture.image.src = url.mSrc;
            returnValue = {
                mFailed: false,
                mNeedsShaderCompile: this.mInputs[slot] === null || this.mInputs[slot].mInfo.mType !== 'texture' && this.mInputs[slot].mInfo.mType !== 'keyboard'
            };
            this.destroyInput(slot);
            this.mInputs[slot] = texture;
            this.makeHeader();
            return returnValue;
        } else if (url.mType === 'cubemap') {
            texture = {};
            texture.mInfo = url;
            texture.globject = null;
            texture.loaded = false;
            rti = this.sampler2Renderer(url.mSampler);
            if (assetID_to_cubemapBuferID(url.mID) !== -1) {
                texture.mImage = new Image;
                texture.mImage.onload = function() {
                    texture.loaded = true;
                };
                texture.mImage.src = '/media/previz/cubemap00.png';
                this.mEffect.resizeCubemapBuffer(0, 1024, 1024);
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
                            texture.globject = renderer.createTextureFromImage(renderer.TEXTYPE.CUBEMAP, texture.image, renderer.TEXFMT.C4I8, rti.mFilter, rti.mWrap, rti.mVFlip);
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
            this.destroyInput(slot);
            this.mInputs[slot] = texture;
            this.makeHeader();
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
            this.destroyInput(slot);
            this.mInputs[slot] = texture;
            this.makeHeader();
            return returnValue;
        } else if (url.mType === 'buffer') {
            texture = {};
            texture.mInfo = url;
            texture.image = new Image;
            texture.image.src = url.mSrc;
            texture.id = assetID_to_bufferID(url.mID);
            texture.loaded = true;
            returnValue = {
                mFailed: false,
                mNeedsShaderCompile: this.mInputs[slot] === null || this.mInputs[slot].mInfo.mType !== 'texture' && this.mInputs[slot].mInfo.mType !== 'keyboard'
            };
            this.destroyInput(slot);
            this.mInputs[slot] = texture;
            this.mEffect.resizeBuffer(texture.id, this.mEffect.mXres, this.mEffect.mYres, false);
            this.setSamplerFilter(slot, url.mSampler.filter, buffers, cubeBuffers, true);
            this.setSamplerVFlip(slot, url.mSampler.vflip);
            this.setSamplerWrap(slot, url.mSampler.wrap, buffers);
            this.makeHeader();
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

    Pass.prototype.paint_Image = function(da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard) {
        var dates, filter, i, id, inp, l1, mouse, prog, resos, texID, times;
        times = [0, 0, 0, 0];
        dates = [da.getFullYear(), da.getMonth(), da.getDate(), da.getHours() * 60.0 * 60 + da.getMinutes() * 60 + da.getSeconds() + da.getMilliseconds() / 1000.0];
        mouse = [mousePosX, mousePosY, mouseOriX, mouseOriY];
        resos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
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
                        this.mRenderer.setSamplerFilter(texID[i], filter, false);
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
                    this.mRenderer.setSamplerFilter(texID[i], filter, false);
                }
            }
            i++;
        }
        this.mRenderer.attachTextures(4, texID[0], texID[1], texID[2], texID[3]);
        prog = this.mProgram;
        this.mRenderer.attachShader(prog);
        this.mRenderer.setShaderConstant1F('iTime', time);
        this.mRenderer.setShaderConstant3F('iResolution', xres, yres, 1.0);
        this.mRenderer.setShaderConstant4FV('iMouse', mouse);
        this.mRenderer.setShaderConstant4FV('iDate', dates);
        this.mRenderer.setShaderConstant1F('iSampleRate', this.mSampleRate);
        this.mRenderer.setShaderTextureUnit('iChannel0', 0);
        this.mRenderer.setShaderTextureUnit('iChannel1', 1);
        this.mRenderer.setShaderTextureUnit('iChannel2', 2);
        this.mRenderer.setShaderTextureUnit('iChannel3', 3);
        this.mRenderer.setShaderConstant1I('iFrame', this.mFrame);
        this.mRenderer.setShaderConstant1F('iTimeDelta', dtime);
        this.mRenderer.setShaderConstant1F('iFrameRate', fps);
        this.mRenderer.setShaderConstant1F('iChannel[0].time', times[0]);
        this.mRenderer.setShaderConstant1F('iChannel[1].time', times[1]);
        this.mRenderer.setShaderConstant1F('iChannel[2].time', times[2]);
        this.mRenderer.setShaderConstant1F('iChannel[3].time', times[3]);
        this.mRenderer.setShaderConstant3F('iChannel[0].resolution', resos[0], resos[1], resos[2]);
        this.mRenderer.setShaderConstant3F('iChannel[1].resolution', resos[3], resos[4], resos[5]);
        this.mRenderer.setShaderConstant3F('iChannel[2].resolution', resos[6], resos[7], resos[8]);
        this.mRenderer.setShaderConstant3F('iChannel[3].resolution', resos[9], resos[10], resos[11]);
        l1 = this.mRenderer.getAttribLocation(this.mProgram, 'pos');
        this.mRenderer.setViewport([0, 0, xres, yres]);
        this.mRenderer.drawFullScreenTriangle_XY(l1);
        this.mRenderer.dettachTextures();
    };

    Pass.prototype.setUniforms = function(da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard) {
        var dates, filter, i, id, inp, j, mouse, ref, resos, texID, times;
        times = [0, 0, 0, 0];
        dates = [da.getFullYear(), da.getMonth(), da.getDate(), da.getHours() * 60 * 60 + da.getMinutes() * 60 + da.getSeconds() + da.getMilliseconds() / 1000];
        mouse = [mousePosX, mousePosY, mouseOriX, mouseOriY];
        resos = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        texID = [null, null, null, null];
        for (i = j = 0, ref = this.mInputs.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
            inp = this.mInputs[i];
            if ((inp != null ? inp.mInfo.mType : void 0) === 'texture') {
                if (inp.loaded === true) {
                    texID[i] = inp.globject;
                    resos[3 * i + 0] = inp.image.width;
                    resos[3 * i + 1] = inp.image.height;
                    resos[3 * i + 2] = 1;
                }
            } else if ((inp != null ? inp.mInfo.mType : void 0) === 'keyboard') {
                texID[i] = keyboard.mTexture;
            } else if ((inp != null ? inp.mInfo.mType : void 0) === 'cubemap') {
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
            } else if ((inp != null ? inp.mInfo.mType : void 0) === 'buffer') {
                if (inp.loaded === true) {
                    texID[i] = buffers[inp.id].mTexture[buffers[inp.id].mLastRenderDone];
                    resos[3 * i + 0] = xres;
                    resos[3 * i + 1] = yres;
                    resos[3 * i + 2] = 1;
                }
            }
        }
        this.mRenderer.attachTextures(4, texID[0], texID[1], texID[2], texID[3]);
        this.mRenderer.attachShader(this.mProgram);
        this.mRenderer.setShaderConstant1F('iTime', time);
        this.mRenderer.setShaderConstant3F('iResolution', xres, yres, 1.0);
        this.mRenderer.setShaderConstant4FV('iMouse', mouse);
        this.mRenderer.setShaderConstant4FV('iDate', dates);
        this.mRenderer.setShaderConstant1F('iSampleRate', this.mSampleRate);
        this.mRenderer.setShaderTextureUnit('iChannel0', 0);
        this.mRenderer.setShaderTextureUnit('iChannel1', 1);
        this.mRenderer.setShaderTextureUnit('iChannel2', 2);
        this.mRenderer.setShaderTextureUnit('iChannel3', 3);
        this.mRenderer.setShaderConstant1I('iFrame', this.mFrame);
        this.mRenderer.setShaderConstant1F('iTimeDelta', dtime);
        this.mRenderer.setShaderConstant1F('iFrameRate', fps);
        this.mRenderer.setShaderConstant1F('iChannel[0].time', times[0]);
        this.mRenderer.setShaderConstant1F('iChannel[1].time', times[1]);
        this.mRenderer.setShaderConstant1F('iChannel[2].time', times[2]);
        this.mRenderer.setShaderConstant1F('iChannel[3].time', times[3]);
        this.mRenderer.setShaderConstant3F('iChannel[0].resolution', resos[0], resos[1], resos[2]);
        this.mRenderer.setShaderConstant3F('iChannel[1].resolution', resos[3], resos[4], resos[5]);
        this.mRenderer.setShaderConstant3F('iChannel[2].resolution', resos[6], resos[7], resos[8]);
        this.mRenderer.setShaderConstant3F('iChannel[3].resolution', resos[9], resos[10], resos[11]);
    };

    Pass.prototype.processInputs = function(time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard) {
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

    Pass.prototype.paint_Cubemap = function(da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard, face) {
        var C, l1, vp;
        this.processInputs(da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard, face);
        this.setUniforms(da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard);
        l1 = this.mRenderer.getAttribLocation(this.mProgram, 'pos');
        vp = [0, 0, xres, yres];
        this.mRenderer.setViewport(vp);
        C = (function() {
            switch (face) {
                case 0:
                    return [1, 1, 1, 1, 1, -1, 1, -1, -1, 1, -1, 1, 0, 0, 0];
                case 1:
                    return [-1, 1, -1, -1, 1, 1, -1, -1, 1, -1, -1, -1, 0, 0, 0];
                case 2:
                    return [-1, 1, -1, 1, 1, -1, 1, 1, 1, -1, 1, 1, 0, 0, 0];
                case 3:
                    return [-1, -1, 1, 1, -1, 1, 1, -1, -1, -1, -1, -1, 0, 0, 0];
                case 4:
                    return [-1, 1, 1, 1, 1, 1, 1, -1, 1, -1, -1, 1, 0, 0, 0];
                default:
                    return [1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, 0, 0, 0];
            }
        })();
        this.mRenderer.setShaderConstant3FV('unCorners', C);
        this.mRenderer.setShaderConstant4FV('unViewport', vp);
        this.mRenderer.drawUnitQuad_XY(l1);
        return this.mRenderer.dettachTextures();
    };

    Pass.prototype.paint = function(da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, isPaused, bufferID, bufferNeedsMimaps, buffers, cubeBuffers, keyboard, effect) {
        var buffer, dstID, face;
        if (this.mType === 'image') {
            this.mRenderer.setRenderTarget(null);
            this.paint_Image(da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard);
            this.mFrame++;
        } else if (this.mType === 'common') {

        } else if (this.mType === 'buffer') {
            this.mEffect.resizeBuffer(bufferID, this.mEffect.mXres, this.mEffect.mYres, false);
            buffer = buffers[bufferID];
            dstID = 1 - buffer.mLastRenderDone;
            this.mRenderer.setRenderTarget(buffer.mTarget[dstID]);
            this.paint_Image(da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard);
            if (bufferNeedsMimaps) {
                this.mRenderer.createMipmaps(buffer.mTexture[dstID]);
            }
            buffers[bufferID].mLastRenderDone = 1 - buffers[bufferID].mLastRenderDone;
            this.mFrame++;
        } else if (this.mType === 'cubemap') {
            this.mEffect.resizeCubemapBuffer(bufferID, 1024, 1024, false);
            buffer = cubeBuffers[bufferID];
            xres = buffer.mResolution[0];
            yres = buffer.mResolution[1];
            dstID = 1 - buffer.mLastRenderDone;
            face = 0;
            while (face < 6) {
                this.mRenderer.setRenderTargetCubeMap(buffer.mTarget[dstID], face);
                this.Ppaint_Cubemap(da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard, face);
                face++;
            }
            this.mRenderer.setRenderTargetCubeMap(null, 0);
            if (bufferNeedsMimaps) {
                this.mRenderer.createMipmaps(buffer.mTexture[dstID]);
            }
            cubeBuffers[bufferID].mLastRenderDone = 1 - cubeBuffers[bufferID].mLastRenderDone;
            this.mFrame++;
        }
    };

    return Pass;

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFzcy5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLElBQUE7O0FBQUEsbUJBQUEsR0FBc0IsU0FBQyxFQUFEO0FBQ1gsWUFBTyxFQUFQO0FBQUEsYUFDRSxDQURGO21CQUNTO0FBRFQsYUFFRSxDQUZGO21CQUVTO0FBRlQsYUFHRSxDQUhGO21CQUdTO0FBSFQsYUFJRSxDQUpGO21CQUlTO0FBSlQ7bUJBS0U7QUFMRjtBQURXOztBQVF0QixtQkFBQSxHQUFzQixTQUFDLEVBQUQ7QUFDWCxZQUFPLEVBQVA7QUFBQSxhQUNFLFFBREY7bUJBQ2dCO0FBRGhCLGFBRUUsUUFGRjttQkFFZ0I7QUFGaEIsYUFHRSxRQUhGO21CQUdnQjtBQUhoQixhQUlFLFFBSkY7bUJBSWdCO0FBSmhCO21CQUtFLENBQUM7QUFMSDtBQURXOztBQVF0Qix5QkFBQSxHQUE2QixTQUFDLEVBQUQ7V0FBUSxFQUFBLEtBQU0sUUFBTixJQUFtQixDQUFDLENBQXBCLElBQXlCO0FBQWpDOztBQUM3QiwwQkFBQSxHQUE2QixTQUFDLEVBQUQ7V0FBUSxFQUFBLEtBQU0sQ0FBTixJQUFZLFFBQVosSUFBd0I7QUFBaEM7O0FBRXZCO0lBRUMsY0FBQyxTQUFELEVBQWEsR0FBYixFQUFtQixPQUFuQjtRQUFDLElBQUMsQ0FBQSxZQUFEO1FBQVksSUFBQyxDQUFBLE1BQUQ7UUFBTSxJQUFDLENBQUEsVUFBRDtRQUVsQixJQUFDLENBQUEsT0FBRCxHQUFZLENBQUUsSUFBRixFQUFPLElBQVAsRUFBWSxJQUFaLEVBQWlCLElBQWpCO1FBQ1osSUFBQyxDQUFBLFFBQUQsR0FBWSxDQUFFLElBQUYsRUFBTyxJQUFQLEVBQVksSUFBWixFQUFpQixJQUFqQjtRQUNaLElBQUMsQ0FBQSxPQUFELEdBQVk7UUFDWixJQUFDLENBQUEsS0FBRCxHQUFZO1FBQ1osSUFBQyxDQUFBLEtBQUQsR0FBWTtRQUNaLElBQUMsQ0FBQSxRQUFELEdBQVk7UUFDWixJ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biAgICByZXR1cm4gc3dpdGNoIGlkXG4gICAgICAgIHdoZW4gMCB0aGVuICc0ZFhHUjgnXG4gICAgICAgIHdoZW4gMSB0aGVuICdYc1hHUjgnXG4gICAgICAgIHdoZW4gMiB0aGVuICc0c1hHUjgnXG4gICAgICAgIHdoZW4gMyB0aGVuICdYZGZHUjgnXG4gICAgICAgIGVsc2UgJ25vbmUnXG5cbmFzc2V0SURfdG9fYnVmZmVySUQgPSAoaWQpIC0+XG4gICAgcmV0dXJuIHN3aXRjaCBpZFxuICAgICAgICB3aGVuICc0ZFhHUjgnIHRoZW4gMFxuICAgICAgICB3aGVuICdYc1hHUjgnIHRoZW4gMVxuICAgICAgICB3aGVuICc0c1hHUjgnIHRoZW4gMlxuICAgICAgICB3aGVuICdYZGZHUjgnIHRoZW4gM1xuICAgICAgICBlbHNlIC0xXG5cbmFzc2V0SURfdG9fY3ViZW1hcEJ1ZmVySUQgID0gKGlkKSAtPiBpZCAhPSAnNGRYM1JyJyBhbmQgLTEgb3IgMFxuY3ViYW1lcEJ1ZmZlcklEX3RvX2Fzc2V0SUQgPSAoaWQpIC0+IGlkID09IDAgYW5kICc0ZFgzUnInIG9yICdub25lJ1xuXG5jbGFzcyBQYXNzXG4gICAgXG4gICAgQDogKEBtUmVuZGVyZXIsIEBtSUQsIEBtRWZmZWN0KSAtPlxuICAgICAgICBcbiAgICAgICAgQG1JbnB1dHMgID0gWyBudWxsIG51bGwgbnVsbCBudWxsIF1cbiAgICAgICAgQG1PdXRwdXRzID0gWyBudWxsIG51bGwgbnVsbCBudWxsIF1cbiAgICAgICAgQG1Tb3VyY2UgID0gbnVsbFxuICAgICAgICBAbVR5cGUgICAgPSAnaW1hZ2UnXG4gICAgICAgIEBtTmFtZSAgICA9ICdub25lJ1xuICAgICAgICBAbUNvbXBpbGUgPSAwXG4gICAgICAgIEBtRnJhbWUgICA9IDBcbiAgICAgICAgXG4gICAgY29tbW9uSGVhZGVyOiAtPlxuICAgICAgICBcbiAgICAgICAgaCA9IFwiXCJcIlxuICAgICAgICAgICAgI2RlZmluZSBIV19QRVJGT1JNQU5DRSAxXG4gICAgICAgICAgICB1bmlmb3JtIHZlYzMgICAgICBpUmVzb2x1dGlvbjtcbiAgICAgICAgICAgIHVuaWZvcm0gZmxvYXQgICAgIGlUaW1lO1xuICAgICAgICAgICAgdW5pZm9ybSBmbG9hdCAgICAgaUNoYW5uZWxUaW1lWzRdO1xuICAgICAgICAgICAgdW5pZm9ybSB2ZWM0ICAgICAgaU1vdXNlO1xuICAgICAgICAgICAgdW5pZm9ybSB2ZWM0ICAgICAgaURhdGU7XG4gICAgICAgICAgICB1bmlmb3JtIGZsb2F0ICAgICBpU2FtcGxlUmF0ZTtcbiAgICAgICAgICAgIHVuaWZvcm0gdmVjMyAgICAgIGlDaGFubmVsUmVzb2x1dGlvbls0XTtcbiAgICAgICAgICAgIHVuaWZvcm0gaW50ICAgICAgIGlGcmFtZTtcbiAgICAgICAgICAgIHVuaWZvcm0gZmxvYXQgICAgIGlUaW1lRGVsdGE7XG4gICAgICAgICAgICB1bmlmb3JtIGZsb2F0ICAgICBpRnJhbWVSYXRlO1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAgIGZvciBpIGluIFswLi4uQG1JbnB1dHMubGVuZ3RoXVxuICAgICAgICAgICAgaCArPSBcInVuaWZvcm0gc2FtcGxlciN7IEBtSW5wdXRzW2ldPy5tSW5mby5tVHlwZSA9PSAnY3ViZW1hcCcgYW5kICdDdWJlJyBvciAnMkQnIH0gaUNoYW5uZWwje2l9O1xcblwiXG4gICAgICAgIGhcblxuICAgIG1ha2VIZWFkZXJJbWFnZTogLT5cbiAgICAgICAgXG4gICAgICAgIEBoZWFkZXIgID0gQGNvbW1vbkhlYWRlcigpXG4gICAgICAgIEBoZWFkZXIgKz0gXCJcIlwiXG4gICAgICAgICAgICBzdHJ1Y3QgQ2hhbm5lbFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZlYzMgIHJlc29sdXRpb247XG4gICAgICAgICAgICAgICAgZmxvYXQgdGltZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB1bmlmb3JtIENoYW5uZWwgaUNoYW5uZWxbNF07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHZvaWQgbWFpbkltYWdlKCBvdXQgdmVjNCBjLCAgaW4gdmVjMiBmICk7XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAZm9vdGVyID0gXCJcIlwiXG4gICAgICAgICAgICBvdXQgdmVjNCBvdXRDb2xvcjtcbiAgICAgICAgICAgIHZvaWQgbWFpbiggdm9pZCApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmVjNCBjb2xvciA9IHZlYzQoMC4wLDAuMCwwLjAsMS4wKTtcbiAgICAgICAgICAgICAgICBtYWluSW1hZ2UoY29sb3IsIGdsX0ZyYWdDb29yZC54eSk7XG4gICAgICAgICAgICAgICAgY29sb3IudyA9IDEuMDtcbiAgICAgICAgICAgICAgICBvdXRDb2xvciA9IGNvbG9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgXG4gICAgbWFrZUhlYWRlckJ1ZmZlcjogLT5cbiAgICAgICAgXG4gICAgICAgIEBoZWFkZXIgID0gQGNvbW1vbkhlYWRlcigpXG4gICAgICAgIEBoZWFkZXIgKz0gJ3ZvaWQgbWFpbkltYWdlKCBvdXQgdmVjNCBjLCAgaW4gdmVjMiBmICk7XFxuJ1xuICAgICAgICBcbiAgICAgICAgQGZvb3RlciA9IFwiXCJcIlxuICAgICAgICAgICAgb3V0IHZlYzQgb3V0Q29sb3I7XG4gICAgICAgICAgICB2b2lkIG1haW4oIHZvaWQgKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZlYzQgY29sb3IgPSB2ZWM0KDAuMCwwLjAsMC4wLDEuMCk7XG4gICAgICAgICAgICAgICAgbWFpbkltYWdlKCBjb2xvciwgZ2xfRnJhZ0Nvb3JkLnh5ICk7XG4gICAgICAgICAgICAgICAgb3V0Q29sb3IgPSBjb2xvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgIFxuICAgIG1ha2VIZWFkZXJDdWJlbWFwOiAtPlxuICAgICAgICBcbiAgICAgICAgQGhlYWRlciAgPSBAY29tbW9uSGVhZGVyKClcbiAgICAgICAgQGhlYWRlciArPSAndm9pZCBtYWluQ3ViZW1hcCggb3V0IHZlYzQgYywgaW4gdmVjMiBmLCBpbiB2ZWMzIHJvLCBpbiB2ZWMzIHJkICk7XFxuJ1xuICAgICAgICBcbiAgICAgICAgQGZvb3RlciAgPSBcIlwiXCJcbiAgICAgICAgICAgIHVuaWZvcm0gdmVjNCB1blZpZXdwb3J0O1xuICAgICAgICAgICAgdW5pZm9ybSB2ZWMzIHVuQ29ybmVyc1s1XTtcbiAgICAgICAgICAgIG91dCB2ZWM0IG91dENvbG9yO1xuICAgICAgICAgICAgdm9pZCBtYWluKHZvaWQpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmVjNCBjb2xvciA9IHZlYzQoMC4wLDAuMCwwLjAsMS4wKTtcbiAgICAgICAgICAgICAgICB2ZWMzIHJvID0gdW5Db3JuZXJzWzRdO1xuICAgICAgICAgICAgICAgIHZlYzIgdXYgPSAoZ2xfRnJhZ0Nvb3JkLnh5IC0gdW5WaWV3cG9ydC54eSkvdW5WaWV3cG9ydC56dztcbiAgICAgICAgICAgICAgICB2ZWMzIHJkID0gbm9ybWFsaXplKCBtaXgoIG1peCggdW5Db3JuZXJzWzBdLCB1bkNvcm5lcnNbMV0sIHV2LnggKSwgbWl4KCB1bkNvcm5lcnNbM10sIHVuQ29ybmVyc1syXSwgdXYueCApLCB1di55ICkgLSBybyk7XG4gICAgICAgICAgICAgICAgbWFpbkN1YmVtYXAoY29sb3IsIGdsX0ZyYWdDb29yZC54eS11blZpZXdwb3J0Lnh5LCBybywgcmQpO1xuICAgICAgICAgICAgICAgIG91dENvbG9yID0gY29sb3I7IFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXCJcIlwiXG4gICAgXG4gICAgbWFrZUhlYWRlckNvbW1vbjogLT5cbiAgICAgICAgQGhlYWRlciA9IFwiXCJcIlxuICAgICAgICAgICAgdW5pZm9ybSB2ZWM0ICAgICAgaURhdGU7XG4gICAgICAgICAgICB1bmlmb3JtIGZsb2F0ICAgICBpU2FtcGxlUmF0ZTtcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgICBAZm9vdGVyICA9IFwiXCJcIlxuICAgICAgICAgICAgb3V0IHZlYzQgb3V0Q29sb3I7XG4gICAgICAgICAgICB2b2lkIG1haW4odm9pZClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBvdXRDb2xvciA9IHZlYzQoMC4wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFwiXCJcIlxuICAgIFxuICAgIG1ha2VIZWFkZXI6IC0+XG4gICAgICAgIHN3aXRjaCBAbVR5cGUgXG4gICAgICAgICAgICB3aGVuICdpbWFnZScgICB0aGVuIEBtYWtlSGVhZGVySW1hZ2UoKVxuICAgICAgICAgICAgd2hlbiAnYnVmZmVyJyAgdGhlbiBAbWFrZUhlYWRlckJ1ZmZlcigpXG4gICAgICAgICAgICB3aGVuICdjb21tb24nICB0aGVuIEBtYWtlSGVhZGVyQ29tbW9uKClcbiAgICAgICAgICAgIHdoZW4gJ2N1YmVtYXAnIHRoZW4gQG1ha2VIZWFkZXJDdWJlbWFwKClcbiAgICAgICAgXG4gICAgY3JlYXRlOiAoQG1UeXBlLCBAbU5hbWUpIC0+XG4gICAgICAgIEBtU291cmNlID0gbnVsbFxuICAgICAgICBAbWFrZUhlYWRlcigpXG4gICAgICAgIGlmIEBtVHlwZSBpbiBbJ2ltYWdlJyAnYnVmZmVyJyAnY3ViZW1hcCddXG4gICAgICAgICAgICBAbVByb2dyYW0gPSBudWxsXG4gICAgXG4gICAgZGVzdHJveTogLT4gQG1Tb3VyY2UgPSBudWxsXG4gICAgXG4gICAgbmV3U2hhZGVyX0ltYWdlOiAoc2hhZGVyQ29kZSwgY29tbW9uU2hhZGVyQ29kZXMpIC0+XG4gICAgICAgIHZzU291cmNlID0gJ2xheW91dChsb2NhdGlvbiA9IDApIGluIHZlYzIgcG9zOyB2b2lkIG1haW4oKSB7IGdsX1Bvc2l0aW9uID0gdmVjNChwb3MueHksMC4wLDEuMCk7IH0nXG4gICAgICAgIGZzU291cmNlID0gQGhlYWRlclxuICAgICAgICBpID0gMFxuICAgICAgICB3aGlsZSBpIDwgY29tbW9uU2hhZGVyQ29kZXMubGVuZ3RoXG4gICAgICAgICAgICBmc1NvdXJjZSArPSBjb21tb25TaGFkZXJDb2Rlc1tpXSArICdcXG4nXG4gICAgICAgICAgICBpKytcbiAgICAgICAgZnNTb3VyY2UgKz0gc2hhZGVyQ29kZVxuICAgICAgICBmc1NvdXJjZSArPSBAZm9vdGVyXG4gICAgICAgIHJlcyA9IEBtUmVuZGVyZXIuY3JlYXRlU2hhZGVyKHZzU291cmNlLCBmc1NvdXJjZSlcbiAgICAgICAgaWYgcmVzLm1SZXN1bHQgPT0gZmFsc2VcbiAgICAgICAgICAgIHJldHVybiByZXMubUluZm9cbiAgICAgICAgaWYgQG1Qcm9ncmFtICE9IG51bGxcbiAgICAgICAgICAgIEBtUmVuZGVyZXIuZGVzdHJveVNoYWRlciBAbVByb2dyYW1cbiAgICAgICAgQG1Qcm9ncmFtID0gcmVzXG4gICAgICAgIG51bGxcbiAgICBcbiAgICBuZXdTaGFkZXJfQ3ViZW1hcDogKHNoYWRlckNvZGUsIGNvbW1vblNoYWRlckNvZGVzKSAtPlxuICAgICAgICB2c1NvdXJjZSA9ICdsYXlvdXQobG9jYXRpb24gPSAwKSBpbiB2ZWMyIHBvczsgdm9pZCBtYWluKCkgeyBnbF9Qb3NpdGlvbiA9IHZlYzQocG9zLnh5LDAuMCwxLjApOyB9J1xuICAgICAgICBmc1NvdXJjZSA9IEBoZWFkZXJcbiAgICAgICAgaSA9IDBcbiAgICAgICAgd2hpbGUgaSA8IGNvbW1vblNoYWRlckNvZGVzLmxlbmd0aFxuICAgICAgICAgICAgZnNTb3VyY2UgKz0gY29tbW9uU2hhZGVyQ29kZXNbaV0gKyAnXFxuJ1xuICAgICAgICAgICAgaSsrXG4gICAgICAgIGZzU291cmNlICs9IHNoYWRlckNvZGVcbiAgICAgICAgZnNTb3VyY2UgKz0gQGZvb3RlclxuICAgICAgICByZXMgPSBAbVJlbmRlcmVyLmNyZWF0ZVNoYWRlcih2c1NvdXJjZSwgZnNTb3VyY2UpXG4gICAgICAgIGlmIHJlcy5tUmVzdWx0ID09IGZhbHNlXG4gICAgICAgICAgICByZXR1cm4gcmVzLm1JbmZvXG4gICAgICAgIGlmIEBtUHJvZ3JhbSAhPSBudWxsXG4gICAgICAgICAgICBAbVJlbmRlcmVyLmRlc3Ryb3lTaGFkZXIgQG1Qcm9ncmFtXG4gICAgICAgIEBtUHJvZ3JhbSA9IHJlc1xuICAgICAgICBudWxsXG4gICAgXG4gICAgbmV3U2hhZGVyX0NvbW1vbjogKHNoYWRlckNvZGUpIC0+XG4gICAgICAgIHZzU291cmNlID0gJ2xheW91dChsb2NhdGlvbiA9IDApIGluIHZlYzIgcG9zOyB2b2lkIG1haW4oKSB7IGdsX1Bvc2l0aW9uID0gdmVjNChwb3MueHksMC4wLDEuMCk7IH0nXG4gICAgICAgIGZzU291cmNlID0gQGhlYWRlciArIHNoYWRlckNvZGUgKyBAZm9vdGVyXG4gICAgICAgIHJlcyA9IEBtUmVuZGVyZXIuY3JlYXRlU2hhZGVyKHZzU291cmNlLCBmc1NvdXJjZSlcbiAgICAgICAgaWYgcmVzLm1SZXN1bHQgPT0gZmFsc2VcbiAgICAgICAgICAgIHJldHVybiByZXMubUluZm9cbiAgICAgICAgaWYgQG1Qcm9ncmFtICE9IG51bGxcbiAgICAgICAgICAgIEBtUmVuZGVyZXIuZGVzdHJveVNoYWRlciBAbVByb2dyYW1cbiAgICAgICAgQG1Qcm9ncmFtID0gcmVzXG4gICAgICAgIG51bGxcbiAgICBcbiAgICBuZXdTaGFkZXI6IChzaGFkZXJDb2RlLCBjb21tb25Tb3VyY2VDb2RlcykgLT5cbiAgICAgICAgaWYgQG1SZW5kZXJlciA9PSBudWxsXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB0aW1lU3RhcnQgPSBwZXJmb3JtYW5jZS5ub3coKVxuICAgICAgICByZXMgPSBudWxsXG4gICAgICAgIGlmIEBtVHlwZSA9PSAnaW1hZ2UnXG4gICAgICAgICAgICByZXMgPSBAbmV3U2hhZGVyX0ltYWdlKHNoYWRlckNvZGUsIGNvbW1vblNvdXJjZUNvZGVzKVxuICAgICAgICBlbHNlIGlmIEBtVHlwZSA9PSAnYnVmZmVyJ1xuICAgICAgICAgICAgcmVzID0gQG5ld1NoYWRlcl9JbWFnZShzaGFkZXJDb2RlLCBjb21tb25Tb3VyY2VDb2RlcylcbiAgICAgICAgZWxzZSBpZiBAbVR5cGUgPT0gJ2NvbW1vbidcbiAgICAgICAgICAgIHJlcyA9IEBuZXdTaGFkZXJfQ29tbW9uKHNoYWRlckNvZGUpXG4gICAgICAgIGVsc2UgaWYgQG1UeXBlID09ICdjdWJlbWFwJ1xuICAgICAgICAgICAgcmVzID0gQG5ld1NoYWRlcl9DdWJlbWFwKHNoYWRlckNvZGUsIGNvbW1vblNvdXJjZUNvZGVzKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBhbGVydCAnRVJST1InXG4gICAgICAgIGlmIHJlcyA9PSBudWxsXG4gICAgICAgICAgICBAbUNvbXBpbGUgPSBwZXJmb3JtYW5jZS5ub3coKSAtIHRpbWVTdGFydFxuICAgICAgICBAbVNvdXJjZSA9IHNoYWRlckNvZGVcbiAgICAgICAgcmVzXG4gICAgXG4gICAgZGVzdHJveUlucHV0OiAoaWQpIC0+XG4gICAgICAgIGlmIEBtSW5wdXRzW2lkXSA9PSBudWxsXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgaWYgQG1JbnB1dHNbaWRdLm1JbmZvLm1UeXBlID09ICd0ZXh0dXJlJ1xuICAgICAgICAgICAgaWYgQG1JbnB1dHNbaWRdLmdsb2JqZWN0ICE9IG51bGxcbiAgICAgICAgICAgICAgICBAbVJlbmRlcmVyLmRlc3Ryb3lUZXh0dXJlIEBtSW5wdXRzW2lkXS5nbG9iamVjdFxuICAgICAgICBlbHNlIGlmIEBtSW5wdXRzW2lkXS5tSW5mby5tVHlwZSA9PSAnY3ViZW1hcCdcbiAgICAgICAgICAgIGlmIEBtSW5wdXRzW2lkXS5nbG9iamVjdCAhPSBudWxsXG4gICAgICAgICAgICAgICAgQG1SZW5kZXJlci5kZXN0cm95VGV4dHVyZSBAbUlucHV0c1tpZF0uZ2xvYmplY3RcbiAgICAgICAgZWxzZSBpZiBAbUlucHV0c1tpZF0ubUluZm8ubVR5cGUgPT0gJ2tleWJvYXJkJ1xuICAgICAgICBlbHNlXG4gICAgICAgIEBtSW5wdXRzW2lkXSA9IG51bGxcbiAgICAgICAgcmV0dXJuXG4gICAgXG4gICAgc2FtcGxlcjJSZW5kZXJlcjogKHNhbXBsZXIpIC0+XG4gICAgICAgIGZpbHRlciA9IEBtUmVuZGVyZXIuRklMVEVSLk5PTkVcbiAgICAgICAgaWYgc2FtcGxlci5maWx0ZXIgPT0gJ2xpbmVhcidcbiAgICAgICAgICAgIGZpbHRlciA9IEBtUmVuZGVyZXIuRklMVEVSLkxJTkVBUlxuICAgICAgICBpZiBzYW1wbGVyLmZpbHRlciA9PSAnbWlwbWFwJ1xuICAgICAgICAgICAgZmlsdGVyID0gQG1SZW5kZXJlci5GSUxURVIuTUlQTUFQXG4gICAgICAgIHdyYXAgPSBAbVJlbmRlcmVyLlRFWFdSUC5SRVBFQVRcbiAgICAgICAgaWYgc2FtcGxlci53cmFwID09ICdjbGFtcCdcbiAgICAgICAgICAgIHdyYXAgPSBAbVJlbmRlcmVyLlRFWFdSUC5DTEFNUFxuICAgICAgICB2ZmxpcCA9IGZhbHNlXG4gICAgICAgIGlmIHNhbXBsZXIudmZsaXAgPT0gJ3RydWUnXG4gICAgICAgICAgICB2ZmxpcCA9IHRydWVcbiAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBtRmlsdGVyOiBmaWx0ZXJcbiAgICAgICAgICAgIG1XcmFwOiAgIHdyYXBcbiAgICAgICAgICAgIG1WRmxpcDogIHZmbGlwXG4gICAgXG4gICAgc2V0U2FtcGxlckZpbHRlcjogKGlkLCBzdHIsIGJ1ZmZlcnMsIGN1YmVCdWZmZXJzKSAtPlxuICAgICAgICBtZSA9IHRoaXNcbiAgICAgICAgcmVuZGVyZXIgPSBAbVJlbmRlcmVyXG4gICAgICAgIGlucCA9IEBtSW5wdXRzW2lkXVxuICAgICAgICBmaWx0ZXIgPSBSZW5kZXJlci5GSUxURVIuTk9ORVxuICAgICAgICBpZiBzdHIgPT0gJ2xpbmVhcidcbiAgICAgICAgICAgIGZpbHRlciA9IFJlbmRlcmVyLkZJTFRFUi5MSU5FQVJcbiAgICAgICAgaWYgc3RyID09ICdtaXBtYXAnXG4gICAgICAgICAgICBmaWx0ZXIgPSBSZW5kZXJlci5GSUxURVIuTUlQTUFQXG4gICAgICAgIGlmIGlucCA9PSBudWxsXG4gICAgICAgIGVsc2UgaWYgaW5wLm1JbmZvLm1UeXBlID09ICd0ZXh0dXJlJ1xuICAgICAgICAgICAgaWYgaW5wLmxvYWRlZFxuICAgICAgICAgICAgICAgIHJlbmRlcmVyLnNldFNhbXBsZXJGaWx0ZXIgaW5wLmdsb2JqZWN0LCBmaWx0ZXIsIHRydWVcbiAgICAgICAgICAgICAgICBpbnAubUluZm8ubVNhbXBsZXIuZmlsdGVyID0gc3RyXG4gICAgICAgIGVsc2UgaWYgaW5wLm1JbmZvLm1UeXBlID09ICdjdWJlbWFwJ1xuICAgICAgICAgICAgaWYgaW5wLmxvYWRlZFxuICAgICAgICAgICAgICAgIGlmIGFzc2V0SURfdG9fY3ViZW1hcEJ1ZmVySUQoaW5wLm1JbmZvLm1JRCkgPT0gMFxuICAgICAgICAgICAgICAgICAgICByZW5kZXJlci5zZXRTYW1wbGVyRmlsdGVyIGN1YmVCdWZmZXJzW2lkXS5tVGV4dHVyZVswXSwgZmlsdGVyLCB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcmVyLnNldFNhbXBsZXJGaWx0ZXIgY3ViZUJ1ZmZlcnNbaWRdLm1UZXh0dXJlWzFdLCBmaWx0ZXIsIHRydWVcbiAgICAgICAgICAgICAgICAgICAgaW5wLm1JbmZvLm1TYW1wbGVyLmZpbHRlciA9IHN0clxuICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyZXIuc2V0U2FtcGxlckZpbHRlciBpbnAuZ2xvYmplY3QsIGZpbHRlciwgdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBpbnAubUluZm8ubVNhbXBsZXIuZmlsdGVyID0gc3RyXG4gICAgICAgIGVsc2UgaWYgaW5wLm1JbmZvLm1UeXBlID09ICdidWZmZXInXG4gICAgICAgICAgICByZW5kZXJlci5zZXRTYW1wbGVyRmlsdGVyIGJ1ZmZlcnNbaW5wLmlkXS5tVGV4dHVyZVswXSwgZmlsdGVyLCB0cnVlXG4gICAgICAgICAgICByZW5kZXJlci5zZXRTYW1wbGVyRmlsdGVyIGJ1ZmZlcnNbaW5wLmlkXS5tVGV4dHVyZVsxXSwgZmlsdGVyLCB0cnVlXG4gICAgICAgICAgICBpbnAubUluZm8ubVNhbXBsZXIuZmlsdGVyID0gc3RyXG4gICAgICAgIGVsc2UgaWYgaW5wLm1JbmZvLm1UeXBlID09ICdrZXlib2FyZCdcbiAgICAgICAgICAgIGlucC5tSW5mby5tU2FtcGxlci5maWx0ZXIgPSBzdHJcbiAgICBcbiAgICBzZXRTYW1wbGVyV3JhcDogKGlkLCBzdHIsIGJ1ZmZlcnMpIC0+XG4gICAgICAgIHJlbmRlcmVyID0gQG1SZW5kZXJlclxuICAgICAgICBpbnAgPSBAbUlucHV0c1tpZF1cbiAgICAgICAgcmVzdHIgPSByZW5kZXJlci5URVhXUlAuUkVQRUFUXG4gICAgICAgIGlmIHN0ciA9PSAnY2xhbXAnXG4gICAgICAgICAgICByZXN0ciA9IHJlbmRlcmVyLlRFWFdSUC5DTEFNUFxuICAgICAgICBpZiBpbnAgPT0gbnVsbFxuICAgICAgICBlbHNlIGlmIGlucC5tSW5mby5tVHlwZSA9PSAndGV4dHVyZSdcbiAgICAgICAgICAgIGlmIGlucC5sb2FkZWRcbiAgICAgICAgICAgICAgICByZW5kZXJlci5zZXRTYW1wbGVyV3JhcCBpbnAuZ2xvYmplY3QsIHJlc3RyXG4gICAgICAgICAgICAgICAgaW5wLm1JbmZvLm1TYW1wbGVyLndyYXAgPSBzdHJcbiAgICAgICAgZWxzZSBpZiBpbnAubUluZm8ubVR5cGUgPT0gJ2N1YmVtYXAnXG4gICAgICAgICAgICBpZiBpbnAubG9hZGVkXG4gICAgICAgICAgICAgICAgcmVuZGVyZXIuc2V0U2FtcGxlcldyYXAgaW5wLmdsb2JqZWN0LCByZXN0clxuICAgICAgICAgICAgICAgIGlucC5tSW5mby5tU2FtcGxlci53cmFwID0gc3RyXG4gICAgICAgIGVsc2UgaWYgaW5wLm1JbmZvLm1UeXBlID09ICdidWZmZXInXG4gICAgICAgICAgICByZW5kZXJlci5zZXRTYW1wbGVyV3JhcCBidWZmZXJzW2lucC5pZF0ubVRleHR1cmVbMF0sIHJlc3RyXG4gICAgICAgICAgICByZW5kZXJlci5zZXRTYW1wbGVyV3JhcCBidWZmZXJzW2lucC5pZF0ubVRleHR1cmVbMV0sIHJlc3RyXG4gICAgICAgICAgICBpbnAubUluZm8ubVNhbXBsZXIud3JhcCA9IHN0clxuICAgIFxuICAgIGdldFRleHR1cmU6IChzbG90KSAtPiBAbUlucHV0c1tzbG90XT8ubUluZm9cbiAgICBcbiAgICBzZXRPdXRwdXRzOiAoc2xvdCwgaWQpIC0+IEBtT3V0cHV0c1tzbG90XSA9IGlkXG4gICAgXG4gICAgc2V0T3V0cHV0c0J5QnVmZmVySUQ6IChzbG90LCBpZCkgLT5cbiAgICAgICAgaWYgQG1UeXBlID09ICdidWZmZXInXG4gICAgICAgICAgICBAbU91dHB1dHNbc2xvdF0gPSBidWZmZXJJRF90b19hc3NldElEKGlkKVxuICAgICAgICAgICAgQG1FZmZlY3QucmVzaXplQnVmZmVyIGlkLCBAbUVmZmVjdC5tWHJlcywgQG1FZmZlY3QubVlyZXMsIGZhbHNlXG4gICAgICAgIGVsc2UgaWYgQG1UeXBlID09ICdjdWJlbWFwJ1xuICAgICAgICAgICAgQG1PdXRwdXRzW3Nsb3RdID0gY3ViYW1lcEJ1ZmZlcklEX3RvX2Fzc2V0SUQoaWQpXG4gICAgICAgICAgICBAbUVmZmVjdC5yZXNpemVDdWJlbWFwQnVmZmVyIGlkLCAxMDI0LCAxMDI0XG4gICAgXG4gICAgbmV3VGV4dHVyZTogKHNsb3QsIHVybCwgYnVmZmVycywgY3ViZUJ1ZmZlcnMsIGtleWJvYXJkKSAtPlxuICAgICAgICBtZSA9IHRoaXNcbiAgICAgICAgcmVuZGVyZXIgPSBAbVJlbmRlcmVyXG4gICAgICAgIGlmIHJlbmRlcmVyID09IG51bGxcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICB0ZXh0dXJlID0gbnVsbFxuICAgICAgICBpZiBub3QgdXJsPy5tVHlwZVxuICAgICAgICAgICAgQGRlc3Ryb3lJbnB1dCBzbG90XG4gICAgICAgICAgICBAbUlucHV0c1tzbG90XSA9IG51bGxcbiAgICAgICAgICAgIEBtYWtlSGVhZGVyKClcbiAgICAgICAgICAgIHJldHVybiBcbiAgICAgICAgICAgICAgICBtRmFpbGVkOiBmYWxzZVxuICAgICAgICAgICAgICAgIG1OZWVkc1NoYWRlckNvbXBpbGU6IGZhbHNlXG4gICAgICAgIGVsc2UgaWYgdXJsLm1UeXBlID09ICd0ZXh0dXJlJ1xuICAgICAgICAgICAgdGV4dHVyZSA9IHt9XG4gICAgICAgICAgICB0ZXh0dXJlLm1JbmZvID0gdXJsXG4gICAgICAgICAgICB0ZXh0dXJlLmdsb2JqZWN0ID0gbnVsbFxuICAgICAgICAgICAgdGV4dHVyZS5sb2FkZWQgPSBmYWxzZVxuICAgICAgICAgICAgdGV4dHVyZS5pbWFnZSA9IG5ldyBJbWFnZVxuICAgICAgICAgICAgdGV4dHVyZS5pbWFnZS5jcm9zc09yaWdpbiA9ICcnXG4gICAgXG4gICAgICAgICAgICB0ZXh0dXJlLmltYWdlLm9ubG9hZCA9IC0+XG4gICAgICAgICAgICAgICAgcnRpID0gQHNhbXBsZXIyUmVuZGVyZXIodXJsLm1TYW1wbGVyKVxuICAgICAgICAgICAgICAgICMgTy5NLkcuIElRSVEgRklYIFRISVNcbiAgICAgICAgICAgICAgICBjaGFubmVscyA9IHJlbmRlcmVyLlRFWEZNVC5DNEk4XG4gICAgICAgICAgICAgICAgaWYgdXJsLm1JRCA9PSAnWGRmM3puJyBvciB1cmwubUlEID09ICc0c2YzUm4nIG9yIHVybC5tSUQgPT0gJzRkWEd6bicgb3IgdXJsLm1JRCA9PSAnNHNmM1JyJ1xuICAgICAgICAgICAgICAgICAgICBjaGFubmVscyA9IHJlbmRlcmVyLlRFWEZNVC5DMUk4XG4gICAgICAgICAgICAgICAgdGV4dHVyZS5nbG9iamVjdCA9IHJlbmRlcmVyLmNyZWF0ZVRleHR1cmVGcm9tSW1hZ2UocmVuZGVyZXIuVEVYVFlQRS5UMkQsIHRleHR1cmUuaW1hZ2UsIGNoYW5uZWxzLCBydGkubUZpbHRlciwgcnRpLm1XcmFwLCBydGkubVZGbGlwKVxuICAgICAgICAgICAgICAgIHRleHR1cmUubG9hZGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgIHJldHVyblxuICAgIFxuICAgICAgICAgICAgdGV4dHVyZS5pbWFnZS5zcmMgPSB1cmwubVNyY1xuICAgICAgICAgICAgcmV0dXJuVmFsdWUgPSBcbiAgICAgICAgICAgICAgICBtRmFpbGVkOiBmYWxzZVxuICAgICAgICAgICAgICAgIG1OZWVkc1NoYWRlckNvbXBpbGU6IEBtSW5wdXRzW3Nsb3RdID09IG51bGwgb3IgQG1JbnB1dHNbc2xvdF0ubUluZm8ubVR5cGUgIT0gJ3RleHR1cmUnIGFuZCBAbUlucHV0c1tzbG90XS5tSW5mby5tVHlwZSAhPSAna2V5Ym9hcmQnXG4gICAgICAgICAgICBAZGVzdHJveUlucHV0IHNsb3RcbiAgICAgICAgICAgIEBtSW5wdXRzW3Nsb3RdID0gdGV4dHVyZVxuICAgICAgICAgICAgQG1ha2VIZWFkZXIoKVxuICAgICAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlXG4gICAgICAgIGVsc2UgaWYgdXJsLm1UeXBlID09ICdjdWJlbWFwJ1xuICAgICAgICAgICAgdGV4dHVyZSA9IHt9XG4gICAgICAgICAgICB0ZXh0dXJlLm1JbmZvID0gdXJsXG4gICAgICAgICAgICB0ZXh0dXJlLmdsb2JqZWN0ID0gbnVsbFxuICAgICAgICAgICAgdGV4dHVyZS5sb2FkZWQgPSBmYWxzZVxuICAgICAgICAgICAgcnRpID0gQHNhbXBsZXIyUmVuZGVyZXIodXJsLm1TYW1wbGVyKVxuICAgICAgICAgICAgaWYgYXNzZXRJRF90b19jdWJlbWFwQnVmZXJJRCh1cmwubUlEKSAhPSAtMVxuICAgICAgICAgICAgICAgIHRleHR1cmUubUltYWdlID0gbmV3IEltYWdlXG4gICAgXG4gICAgICAgICAgICAgICAgdGV4dHVyZS5tSW1hZ2Uub25sb2FkID0gLT5cbiAgICAgICAgICAgICAgICAgICAgdGV4dHVyZS5sb2FkZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgIFxuICAgICAgICAgICAgICAgIHRleHR1cmUubUltYWdlLnNyYyA9ICcvbWVkaWEvcHJldml6L2N1YmVtYXAwMC5wbmcnXG4gICAgICAgICAgICAgICAgQG1FZmZlY3QucmVzaXplQ3ViZW1hcEJ1ZmZlciAwIDEwMjQgMTAyNFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRleHR1cmUuaW1hZ2UgPSBbXG4gICAgICAgICAgICAgICAgICAgIG5ldyBJbWFnZVxuICAgICAgICAgICAgICAgICAgICBuZXcgSW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgbmV3IEltYWdlXG4gICAgICAgICAgICAgICAgICAgIG5ldyBJbWFnZVxuICAgICAgICAgICAgICAgICAgICBuZXcgSW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgbmV3IEltYWdlXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIG51bUxvYWRlZCA9IDBcbiAgICAgICAgICAgICAgICBpID0gMFxuICAgICAgICAgICAgICAgIHdoaWxlIGkgPCA2XG4gICAgICAgICAgICAgICAgICAgIHRleHR1cmUuaW1hZ2VbaV0ubUlkID0gaVxuICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlLmltYWdlW2ldLmNyb3NzT3JpZ2luID0gJydcbiAgICBcbiAgICAgICAgICAgICAgICAgICAgdGV4dHVyZS5pbWFnZVtpXS5vbmxvYWQgPSAtPlxuICAgICAgICAgICAgICAgICAgICAgICAgaWQgPSBAbUlkXG4gICAgICAgICAgICAgICAgICAgICAgICBudW1Mb2FkZWQrK1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgbnVtTG9hZGVkID09IDZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0dXJlLmdsb2JqZWN0ID0gcmVuZGVyZXIuY3JlYXRlVGV4dHVyZUZyb21JbWFnZShyZW5kZXJlci5URVhUWVBFLkNVQkVNQVAsIHRleHR1cmUuaW1hZ2UsIHJlbmRlcmVyLlRFWEZNVC5DNEk4LCBydGkubUZpbHRlciwgcnRpLm1XcmFwLCBydGkubVZGbGlwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHR1cmUubG9hZGVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIGkgPT0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dHVyZS5pbWFnZVtpXS5zcmMgPSB1cmwubVNyY1xuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBuID0gdXJsLm1TcmMubGFzdEluZGV4T2YoJy4nKVxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dHVyZS5pbWFnZVtpXS5zcmMgPSB1cmwubVNyYy5zdWJzdHJpbmcoMCwgbikgKyAnXycgKyBpICsgdXJsLm1TcmMuc3Vic3RyaW5nKG4sIHVybC5tU3JjLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICByZXR1cm5WYWx1ZSA9IFxuICAgICAgICAgICAgICAgIG1GYWlsZWQ6IGZhbHNlXG4gICAgICAgICAgICAgICAgbU5lZWRzU2hhZGVyQ29tcGlsZTogQG1JbnB1dHNbc2xvdF0gPT0gbnVsbCBvciBAbUlucHV0c1tzbG90XS5tSW5mby5tVHlwZSAhPSAnY3ViZW1hcCdcbiAgICAgICAgICAgIEBkZXN0cm95SW5wdXQgc2xvdFxuICAgICAgICAgICAgQG1JbnB1dHNbc2xvdF0gPSB0ZXh0dXJlXG4gICAgICAgICAgICBAbWFrZUhlYWRlcigpXG4gICAgICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgICAgICAgZWxzZSBpZiB1cmwubVR5cGUgPT0gJ2tleWJvYXJkJ1xuICAgICAgICAgICAgdGV4dHVyZSA9IHt9XG4gICAgICAgICAgICB0ZXh0dXJlLm1JbmZvID0gdXJsXG4gICAgICAgICAgICB0ZXh0dXJlLmdsb2JqZWN0ID0gbnVsbFxuICAgICAgICAgICAgdGV4dHVyZS5sb2FkZWQgPSB0cnVlXG4gICAgICAgICAgICB0ZXh0dXJlLmtleWJvYXJkID0ge31cbiAgICAgICAgICAgIHJldHVyblZhbHVlID0gXG4gICAgICAgICAgICAgICAgbUZhaWxlZDogZmFsc2VcbiAgICAgICAgICAgICAgICBtTmVlZHNTaGFkZXJDb21waWxlOiBAbUlucHV0c1tzbG90XSA9PSBudWxsIG9yIEBtSW5wdXRzW3Nsb3RdLm1JbmZvLm1UeXBlICE9ICd0ZXh0dXJlJyBhbmQgQG1JbnB1dHNbc2xvdF0ubUluZm8ubVR5cGUgIT0gJ2tleWJvYXJkJ1xuICAgICAgICAgICAgQGRlc3Ryb3lJbnB1dCBzbG90XG4gICAgICAgICAgICBAbUlucHV0c1tzbG90XSA9IHRleHR1cmVcbiAgICAgICAgICAgIEBtYWtlSGVhZGVyKClcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICAgICAgICBlbHNlIGlmIHVybC5tVHlwZSA9PSAnYnVmZmVyJ1xuICAgICAgICAgICAgdGV4dHVyZSA9IHt9XG4gICAgICAgICAgICB0ZXh0dXJlLm1JbmZvID0gdXJsXG4gICAgICAgICAgICB0ZXh0dXJlLmltYWdlID0gbmV3IEltYWdlXG4gICAgICAgICAgICB0ZXh0dXJlLmltYWdlLnNyYyA9IHVybC5tU3JjXG4gICAgICAgICAgICB0ZXh0dXJlLmlkID0gYXNzZXRJRF90b19idWZmZXJJRCh1cmwubUlEKVxuICAgICAgICAgICAgdGV4dHVyZS5sb2FkZWQgPSB0cnVlXG4gICAgICAgICAgICByZXR1cm5WYWx1ZSA9IFxuICAgICAgICAgICAgICAgIG1GYWlsZWQ6IGZhbHNlXG4gICAgICAgICAgICAgICAgbU5lZWRzU2hhZGVyQ29tcGlsZTogQG1JbnB1dHNbc2xvdF0gPT0gbnVsbCBvciBAbUlucHV0c1tzbG90XS5tSW5mby5tVHlwZSAhPSAndGV4dHVyZScgYW5kIEBtSW5wdXRzW3Nsb3RdLm1JbmZvLm1UeXBlICE9ICdrZXlib2FyZCdcbiAgICAgICAgICAgIEBkZXN0cm95SW5wdXQgc2xvdFxuICAgICAgICAgICAgQG1JbnB1dHNbc2xvdF0gPSB0ZXh0dXJlXG4gICAgICAgICAgICBAbUVmZmVjdC5yZXNpemVCdWZmZXIgdGV4dHVyZS5pZCwgQG1FZmZlY3QubVhyZXMsIEBtRWZmZWN0Lm1ZcmVzLCBmYWxzZVxuXG4gICAgICAgICAgICBAc2V0U2FtcGxlckZpbHRlciBzbG90LCB1cmwubVNhbXBsZXIuZmlsdGVyLCBidWZmZXJzLCBjdWJlQnVmZmVycywgdHJ1ZVxuICAgICAgICAgICAgQHNldFNhbXBsZXJWRmxpcCBzbG90LCB1cmwubVNhbXBsZXIudmZsaXBcbiAgICAgICAgICAgIEBzZXRTYW1wbGVyV3JhcCBzbG90LCB1cmwubVNhbXBsZXIud3JhcCwgYnVmZmVyc1xuICAgICAgICAgICAgQG1ha2VIZWFkZXIoKVxuICAgICAgICAgICAgcmV0dXJuIHJldHVyblZhbHVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGFsZXJ0ICdpbnB1dCB0eXBlIGVycm9yJ1xuICAgICAgICAgICAgcmV0dXJuIG1GYWlsZWQ6dHJ1ZVxuICAgICAgICByZXR1cm4gbUZhaWxlZDp0cnVlXG4gICAgXG4gICAgcGFpbnRfSW1hZ2U6IChkYSwgdGltZSwgZHRpbWUsIGZwcywgbW91c2VPcmlYLCBtb3VzZU9yaVksIG1vdXNlUG9zWCwgbW91c2VQb3NZLCB4cmVzLCB5cmVzLCBidWZmZXJzLCBjdWJlQnVmZmVycywga2V5Ym9hcmQpIC0+XG4gICAgICAgIHRpbWVzID0gWyAwIDAgMCAwIF1cbiAgICAgICAgZGF0ZXMgPSBbXG4gICAgICAgICAgICBkYS5nZXRGdWxsWWVhcigpXG4gICAgICAgICAgICBkYS5nZXRNb250aCgpXG4gICAgICAgICAgICBkYS5nZXREYXRlKClcbiAgICAgICAgICAgIGRhLmdldEhvdXJzKCkgKiA2MC4wICogNjAgKyBkYS5nZXRNaW51dGVzKCkgKiA2MCArIGRhLmdldFNlY29uZHMoKSArIGRhLmdldE1pbGxpc2Vjb25kcygpIC8gMTAwMC4wXG4gICAgICAgIF1cbiAgICAgICAgbW91c2UgPSBbIG1vdXNlUG9zWCwgbW91c2VQb3NZLCBtb3VzZU9yaVgsIG1vdXNlT3JpWSBdIFxuICAgICAgICByZXNvcyA9IFsgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgXVxuICAgICAgICB0ZXhJRCA9IFsgbnVsbCBudWxsIG51bGwgbnVsbCBdXG4gICAgICAgIGkgPSAwXG4gICAgICAgIHdoaWxlIGkgPCBAbUlucHV0cy5sZW5ndGhcbiAgICAgICAgICAgIGlucCA9IEBtSW5wdXRzW2ldXG4gICAgICAgICAgICBpZiBpbnAgPT0gbnVsbFxuICAgICAgICAgICAgZWxzZSBpZiBpbnAubUluZm8ubVR5cGUgPT0gJ3RleHR1cmUnXG4gICAgICAgICAgICAgICAgaWYgaW5wLmxvYWRlZCA9PSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIHRleElEW2ldID0gaW5wLmdsb2JqZWN0XG4gICAgICAgICAgICAgICAgICAgIHJlc29zWzMgKiBpICsgMF0gPSBpbnAuaW1hZ2Uud2lkdGhcbiAgICAgICAgICAgICAgICAgICAgcmVzb3NbMyAqIGkgKyAxXSA9IGlucC5pbWFnZS5oZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgcmVzb3NbMyAqIGkgKyAyXSA9IDFcbiAgICAgICAgICAgIGVsc2UgaWYgaW5wLm1JbmZvLm1UeXBlID09ICdrZXlib2FyZCdcbiAgICAgICAgICAgICAgICB0ZXhJRFtpXSA9IGtleWJvYXJkLm1UZXh0dXJlXG4gICAgICAgICAgICBlbHNlIGlmIGlucC5tSW5mby5tVHlwZSA9PSAnY3ViZW1hcCdcbiAgICAgICAgICAgICAgICBpZiBpbnAubG9hZGVkID09IHRydWVcbiAgICAgICAgICAgICAgICAgICAgaWQgPSBhc3NldElEX3RvX2N1YmVtYXBCdWZlcklEKGlucC5tSW5mby5tSUQpXG4gICAgICAgICAgICAgICAgICAgIGlmIGlkICE9IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXhJRFtpXSA9IGN1YmVCdWZmZXJzW2lkXS5tVGV4dHVyZVtjdWJlQnVmZmVyc1tpZF0ubUxhc3RSZW5kZXJEb25lXVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3NbMyAqIGkgKyAwXSA9IGN1YmVCdWZmZXJzW2lkXS5tUmVzb2x1dGlvblswXVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3NbMyAqIGkgKyAxXSA9IGN1YmVCdWZmZXJzW2lkXS5tUmVzb2x1dGlvblsxXVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3NbMyAqIGkgKyAyXSA9IDFcbiAgICAgICAgICAgICAgICAgICAgICAgICMgaGFjay4gaW4gd2ViZ2wyLjAgd2UgaGF2ZSBzYW1wbGVycywgc28gd2UgZG9uJ3QgbmVlZCB0aGlzIGNyYXAgaGVyZVxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyID0gQG1SZW5kZXJlci5GSUxURVIuTk9ORVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgaW5wLm1JbmZvLm1TYW1wbGVyLmZpbHRlciA9PSAnbGluZWFyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlciA9IEBtUmVuZGVyZXIuRklMVEVSLkxJTkVBUlxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBpbnAubUluZm8ubVNhbXBsZXIuZmlsdGVyID09ICdtaXBtYXAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyID0gQG1SZW5kZXJlci5GSUxURVIuTUlQTUFQXG4gICAgICAgICAgICAgICAgICAgICAgICBAbVJlbmRlcmVyLnNldFNhbXBsZXJGaWx0ZXIgdGV4SURbaV0sIGZpbHRlciwgZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4SURbaV0gPSBpbnAuZ2xvYmplY3RcbiAgICAgICAgICAgIGVsc2UgaWYgaW5wLm1JbmZvLm1UeXBlID09ICdidWZmZXInXG4gICAgICAgICAgICAgICAgaWYgaW5wLmxvYWRlZCA9PSB0cnVlXG4gICAgICAgICAgICAgICAgICAgIGlkID0gaW5wLmlkXG4gICAgICAgICAgICAgICAgICAgIHRleElEW2ldID0gYnVmZmVyc1tpZF0ubVRleHR1cmVbYnVmZmVyc1tpZF0ubUxhc3RSZW5kZXJEb25lXVxuICAgICAgICAgICAgICAgICAgICByZXNvc1szICogaSArIDBdID0geHJlc1xuICAgICAgICAgICAgICAgICAgICByZXNvc1szICogaSArIDFdID0geXJlc1xuICAgICAgICAgICAgICAgICAgICByZXNvc1szICogaSArIDJdID0gMVxuICAgICAgICAgICAgICAgICAgICAjIGhhY2suIGluIHdlYmdsMi4wIHdlIGhhdmUgc2FtcGxlcnMsIHNvIHdlIGRvbid0IG5lZWQgdGhpcyBjcmFwIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyID0gQG1SZW5kZXJlci5GSUxURVIuTk9ORVxuICAgICAgICAgICAgICAgICAgICBpZiBpbnAubUluZm8ubVNhbXBsZXIuZmlsdGVyID09ICdsaW5lYXInXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXIgPSBAbVJlbmRlcmVyLkZJTFRFUi5MSU5FQVJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBpbnAubUluZm8ubVNhbXBsZXIuZmlsdGVyID09ICdtaXBtYXAnXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXIgPSBAbVJlbmRlcmVyLkZJTFRFUi5NSVBNQVBcbiAgICAgICAgICAgICAgICAgICAgQG1SZW5kZXJlci5zZXRTYW1wbGVyRmlsdGVyIHRleElEW2ldLCBmaWx0ZXIsIGZhbHNlXG4gICAgICAgICAgICBpKytcbiAgICAgICAgQG1SZW5kZXJlci5hdHRhY2hUZXh0dXJlcyA0LCB0ZXhJRFswXSwgdGV4SURbMV0sIHRleElEWzJdLCB0ZXhJRFszXVxuICAgICAgICBwcm9nID0gQG1Qcm9ncmFtXG4gICAgICAgIEBtUmVuZGVyZXIuYXR0YWNoU2hhZGVyIHByb2dcbiAgICAgICAgQG1SZW5kZXJlci5zZXRTaGFkZXJDb25zdGFudDFGICAnaVRpbWUnIHRpbWVcbiAgICAgICAgQG1SZW5kZXJlci5zZXRTaGFkZXJDb25zdGFudDNGICAnaVJlc29sdXRpb24nIHhyZXMsIHlyZXMsIDEuMFxuICAgICAgICBAbVJlbmRlcmVyLnNldFNoYWRlckNvbnN0YW50NEZWICdpTW91c2UnIG1vdXNlXG4gICAgICAgIEBtUmVuZGVyZXIuc2V0U2hhZGVyQ29uc3RhbnQ0RlYgJ2lEYXRlJyBkYXRlc1xuICAgICAgICBAbVJlbmRlcmVyLnNldFNoYWRlckNvbnN0YW50MUYgICdpU2FtcGxlUmF0ZScgQG1TYW1wbGVSYXRlXG4gICAgICAgIEBtUmVuZGVyZXIuc2V0U2hhZGVyVGV4dHVyZVVuaXQgJ2lDaGFubmVsMCcgMFxuICAgICAgICBAbVJlbmRlcmVyLnNldFNoYWRlclRleHR1cmVVbml0ICdpQ2hhbm5lbDEnIDFcbiAgICAgICAgQG1SZW5kZXJlci5zZXRTaGFkZXJUZXh0dXJlVW5pdCAnaUNoYW5uZWwyJyAyXG4gICAgICAgIEBtUmVuZGVyZXIuc2V0U2hhZGVyVGV4dHVyZVVuaXQgJ2lDaGFubmVsMycgM1xuICAgICAgICBAbVJlbmRlcmVyLnNldFNoYWRlckNvbnN0YW50MUkgICdpRnJhbWUnIEBtRnJhbWVcbiAgICAgICAgQG1SZW5kZXJlci5zZXRTaGFkZXJDb25zdGFudDFGICAnaVRpbWVEZWx0YScgZHRpbWVcbiAgICAgICAgQG1SZW5kZXJlci5zZXRTaGFkZXJDb25zdGFudDFGICAnaUZyYW1lUmF0ZScgZnBzXG4gICAgICAgIEBtUmVuZGVyZXIuc2V0U2hhZGVyQ29uc3RhbnQxRiAgJ2lDaGFubmVsWzBdLnRpbWUnIHRpbWVzWzBdXG4gICAgICAgIEBtUmVuZGVyZXIuc2V0U2hhZGVyQ29uc3RhbnQxRiAgJ2lDaGFubmVsWzFdLnRpbWUnIHRpbWVzWzFdXG4gICAgICAgIEBtUmVuZGVyZXIuc2V0U2hhZGVyQ29uc3RhbnQxRiAgJ2lDaGFubmVsWzJdLnRpbWUnIHRpbWVzWzJdXG4gICAgICAgIEBtUmVuZGVyZXIuc2V0U2hhZGVyQ29uc3RhbnQxRiAgJ2lDaGFubmVsWzNdLnRpbWUnIHRpbWVzWzNdXG4gICAgICAgIEBtUmVuZGVyZXIuc2V0U2hhZGVyQ29uc3RhbnQzRiAgJ2lDaGFubmVsWzBdLnJlc29sdXRpb24nIHJlc29zWzBdLCByZXNvc1sxXSwgcmVzb3NbMl1cbiAgICAgICAgQG1SZW5kZXJlci5zZXRTaGFkZXJDb25zdGFudDNGICAnaUNoYW5uZWxbMV0ucmVzb2x1dGlvbicgcmVzb3NbM10sIHJlc29zWzRdLCByZXNvc1s1XVxuICAgICAgICBAbVJlbmRlcmVyLnNldFNoYWRlckNvbnN0YW50M0YgICdpQ2hhbm5lbFsyXS5yZXNvbHV0aW9uJyByZXNvc1s2XSwgcmVzb3NbN10sIHJlc29zWzhdXG4gICAgICAgIEBtUmVuZGVyZXIuc2V0U2hhZGVyQ29uc3RhbnQzRiAgJ2lDaGFubmVsWzNdLnJlc29sdXRpb24nIHJlc29zWzldLCByZXNvc1sxMF0sIHJlc29zWzExXVxuICAgICAgICBsMSA9IEBtUmVuZGVyZXIuZ2V0QXR0cmliTG9jYXRpb24oQG1Qcm9ncmFtLCAncG9zJylcbiAgICAgICAgQG1SZW5kZXJlci5zZXRWaWV3cG9ydCBbIDAsIDAsIHhyZXMsIHlyZXMgXVxuICAgICAgICBAbVJlbmRlcmVyLmRyYXdGdWxsU2NyZWVuVHJpYW5nbGVfWFkgbDFcbiAgICAgICAgQG1SZW5kZXJlci5kZXR0YWNoVGV4dHVyZXMoKVxuICAgICAgICByZXR1cm5cbiAgICBcbiAgICBzZXRVbmlmb3JtczogKGRhLCB0aW1lLCBkdGltZSwgZnBzLCBtb3VzZU9yaVgsIG1vdXNlT3JpWSwgbW91c2VQb3NYLCBtb3VzZVBvc1ksIHhyZXMsIHlyZXMsIGJ1ZmZlcnMsIGN1YmVCdWZmZXJzLCBrZXlib2FyZCkgLT5cbiAgICAgICAgdGltZXMgPSBbIDAgMCAwIDAgXVxuICAgICAgICBkYXRlcyA9IFtcbiAgICAgICAgICAgIGRhLmdldEZ1bGxZZWFyKClcbiAgICAgICAgICAgIGRhLmdldE1vbnRoKClcbiAgICAgICAgICAgIGRhLmdldERhdGUoKVxuICAgICAgICAgICAgZGEuZ2V0SG91cnMoKSAqIDYwICogNjAgKyBkYS5nZXRNaW51dGVzKCkgKiA2MCArIGRhLmdldFNlY29uZHMoKSArIGRhLmdldE1pbGxpc2Vjb25kcygpIC8gMTAwMFxuICAgICAgICBdXG4gICAgICAgIG1vdXNlID0gWyBtb3VzZVBvc1gsIG1vdXNlUG9zWSwgbW91c2VPcmlYLCBtb3VzZU9yaVkgXVxuICAgICAgICByZXNvcyA9IFsgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgXVxuICAgICAgICB0ZXhJRCA9IFsgbnVsbCBudWxsIG51bGwgbnVsbCBdXG4gICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMC4uLkBtSW5wdXRzLmxlbmd0aF1cbiAgICAgICAgICAgIGlucCA9IEBtSW5wdXRzW2ldXG4gICAgICAgICAgICBpZiBpbnA/Lm1JbmZvLm1UeXBlID09ICd0ZXh0dXJlJ1xuICAgICAgICAgICAgICAgIGlmIGlucC5sb2FkZWQgPT0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB0ZXhJRFtpXSA9IGlucC5nbG9iamVjdFxuICAgICAgICAgICAgICAgICAgICByZXNvc1szICogaSArIDBdID0gaW5wLmltYWdlLndpZHRoXG4gICAgICAgICAgICAgICAgICAgIHJlc29zWzMgKiBpICsgMV0gPSBpbnAuaW1hZ2UuaGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgIHJlc29zWzMgKiBpICsgMl0gPSAxXG4gICAgICAgICAgICBlbHNlIGlmIGlucD8ubUluZm8ubVR5cGUgPT0gJ2tleWJvYXJkJ1xuICAgICAgICAgICAgICAgIHRleElEW2ldID0ga2V5Ym9hcmQubVRleHR1cmVcbiAgICAgICAgICAgIGVsc2UgaWYgaW5wPy5tSW5mby5tVHlwZSA9PSAnY3ViZW1hcCdcbiAgICAgICAgICAgICAgICBpZiBpbnAubG9hZGVkID09IHRydWVcbiAgICAgICAgICAgICAgICAgICAgaWQgPSBhc3NldElEX3RvX2N1YmVtYXBCdWZlcklEKGlucC5tSW5mby5tSUQpXG4gICAgICAgICAgICAgICAgICAgIGlmIGlkICE9IC0xXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXhJRFtpXSA9IGN1YmVCdWZmZXJzW2lkXS5tVGV4dHVyZVtjdWJlQnVmZmVyc1tpZF0ubUxhc3RSZW5kZXJEb25lXVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3NbMyAqIGkgKyAwXSA9IGN1YmVCdWZmZXJzW2lkXS5tUmVzb2x1dGlvblswXVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3NbMyAqIGkgKyAxXSA9IGN1YmVCdWZmZXJzW2lkXS5tUmVzb2x1dGlvblsxXVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb3NbMyAqIGkgKyAyXSA9IDFcbiAgICAgICAgICAgICAgICAgICAgICAgICMgaGFjay4gaW4gd2ViZ2wyLjAgd2UgaGF2ZSBzYW1wbGVycywgc28gd2UgZG9uJ3QgbmVlZCB0aGlzIGNyYXAgaGVyZVxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyID0gQG1SZW5kZXJlci5GSUxURVIuTk9ORVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgaW5wLm1JbmZvLm1TYW1wbGVyLmZpbHRlciA9PSAnbGluZWFyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlciA9IEBtUmVuZGVyZXIuRklMVEVSLkxJTkVBUlxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiBpbnAubUluZm8ubVNhbXBsZXIuZmlsdGVyID09ICdtaXBtYXAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyID0gQG1SZW5kZXJlci5GSUxURVIuTUlQTUFQXG4gICAgICAgICAgICAgICAgICAgICAgICBAbVJlbmRlcmVyLlNldFNhbXBsZXJGaWx0ZXIgdGV4SURbaV0sIGZpbHRlciwgZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4SURbaV0gPSBpbnAuZ2xvYmplY3RcbiAgICAgICAgICAgIGVsc2UgaWYgaW5wPy5tSW5mby5tVHlwZSA9PSAnYnVmZmVyJ1xuICAgICAgICAgICAgICAgIGlmIGlucC5sb2FkZWQgPT0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICB0ZXhJRFtpXSA9IGJ1ZmZlcnNbaW5wLmlkXS5tVGV4dHVyZVtidWZmZXJzW2lucC5pZF0ubUxhc3RSZW5kZXJEb25lXVxuICAgICAgICAgICAgICAgICAgICByZXNvc1szICogaSArIDBdID0geHJlc1xuICAgICAgICAgICAgICAgICAgICByZXNvc1szICogaSArIDFdID0geXJlc1xuICAgICAgICAgICAgICAgICAgICByZXNvc1szICogaSArIDJdID0gMVxuXG4gICAgICAgIEBtUmVuZGVyZXIuYXR0YWNoVGV4dHVyZXMgNCwgdGV4SURbMF0sIHRleElEWzFdLCB0ZXhJRFsyXSwgdGV4SURbM11cbiAgICAgICAgQG1SZW5kZXJlci5hdHRhY2hTaGFkZXIgQG1Qcm9ncmFtXG4gICAgICAgIEBtUmVuZGVyZXIuc2V0U2hhZGVyQ29uc3RhbnQxRiAgJ2lUaW1lJyB0aW1lXG4gICAgICAgIEBtUmVuZGVyZXIuc2V0U2hhZGVyQ29uc3RhbnQzRiAgJ2lSZXNvbHV0aW9uJyB4cmVzLCB5cmVzLCAxLjBcbiAgICAgICAgQG1SZW5kZXJlci5zZXRTaGFkZXJDb25zdGFudDRGViAnaU1vdXNlJyBtb3VzZVxuICAgICAgICBAbVJlbmRlcmVyLnNldFNoYWRlckNvbnN0YW50NEZWICdpRGF0ZScgZGF0ZXNcbiAgICAgICAgQG1SZW5kZXJlci5zZXRTaGFkZXJDb25zdGFudDFGICAnaVNhbXBsZVJhdGUnIEBtU2FtcGxlUmF0ZVxuICAgICAgICBAbVJlbmRlcmVyLnNldFNoYWRlclRleHR1cmVVbml0ICdpQ2hhbm5lbDAnIDBcbiAgICAgICAgQG1SZW5kZXJlci5zZXRTaGFkZXJUZXh0dXJlVW5pdCAnaUNoYW5uZWwxJyAxXG4gICAgICAgIEBtUmVuZGVyZXIuc2V0U2hhZGVyVGV4dHVyZVVuaXQgJ2lDaGFubmVsMicgMlxuICAgICAgICBAbVJlbmRlcmVyLnNldFNoYWRlclRleHR1cmVVbml0ICdpQ2hhbm5lbDMnIDNcbiAgICAgICAgQG1SZW5kZXJlci5zZXRTaGFkZXJDb25zdGFudDFJICAnaUZyYW1lJyBAbUZyYW1lXG4gICAgICAgIEBtUmVuZGVyZXIuc2V0U2hhZGVyQ29uc3RhbnQxRiAgJ2lUaW1lRGVsdGEnIGR0aW1lXG4gICAgICAgIEBtUmVuZGVyZXIuc2V0U2hhZGVyQ29uc3RhbnQxRiAgJ2lGcmFtZVJhdGUnIGZwc1xuICAgICAgICBAbVJlbmRlcmVyLnNldFNoYWRlckNvbnN0YW50MUYgICdpQ2hhbm5lbFswXS50aW1lJyB0aW1lc1swXVxuICAgICAgICBAbVJlbmRlcmVyLnNldFNoYWRlckNvbnN0YW50MUYgICdpQ2hhbm5lbFsxXS50aW1lJyB0aW1lc1sxXVxuICAgICAgICBAbVJlbmRlcmVyLnNldFNoYWRlckNvbnN0YW50MUYgICdpQ2hhbm5lbFsyXS50aW1lJyB0aW1lc1syXVxuICAgICAgICBAbVJlbmRlcmVyLnNldFNoYWRlckNvbnN0YW50MUYgICdpQ2hhbm5lbFszXS50aW1lJyB0aW1lc1szXVxuICAgICAgICBAbVJlbmRlcmVyLnNldFNoYWRlckNvbnN0YW50M0YgICdpQ2hhbm5lbFswXS5yZXNvbHV0aW9uJyByZXNvc1swXSwgcmVzb3NbMV0sIHJlc29zWzJdXG4gICAgICAgIEBtUmVuZGVyZXIuc2V0U2hhZGVyQ29uc3RhbnQzRiAgJ2lDaGFubmVsWzFdLnJlc29sdXRpb24nIHJlc29zWzNdLCByZXNvc1s0XSwgcmVzb3NbNV1cbiAgICAgICAgQG1SZW5kZXJlci5zZXRTaGFkZXJDb25zdGFudDNGICAnaUNoYW5uZWxbMl0ucmVzb2x1dGlvbicgcmVzb3NbNl0sIHJlc29zWzddLCByZXNvc1s4XVxuICAgICAgICBAbVJlbmRlcmVyLnNldFNoYWRlckNvbnN0YW50M0YgICdpQ2hhbm5lbFszXS5yZXNvbHV0aW9uJyByZXNvc1s5XSwgcmVzb3NbMTBdLCByZXNvc1sxMV1cbiAgICAgICAgcmV0dXJuXG4gICAgXG4gICAgcHJvY2Vzc0lucHV0czogKHRpbWUsIGR0aW1lLCBmcHMsIG1vdXNlT3JpWCwgbW91c2VPcmlZLCBtb3VzZVBvc1gsIG1vdXNlUG9zWSwgeHJlcywgeXJlcywgYnVmZmVycywgY3ViZUJ1ZmZlcnMsIGtleWJvYXJkKSAtPlxuICAgICAgICBpID0gMFxuICAgICAgICB3aGlsZSBpIDwgQG1JbnB1dHMubGVuZ3RoXG4gICAgICAgICAgICBpbnAgPSBAbUlucHV0c1tpXVxuICAgICAgICAgICAgaWYgaW5wID09IG51bGxcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGlmIGlucC5tSW5mby5tVHlwZSA9PSAnYnVmZmVyJ1xuICAgICAgICAgICAgICAgIGlmIGlucC5sb2FkZWQgPT0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBpZCA9IGlucC5pZFxuICAgICAgICAgICAgICAgICAgICB0ZXhJRCA9IGJ1ZmZlcnNbaWRdLm1UZXh0dXJlW2J1ZmZlcnNbaWRdLm1MYXN0UmVuZGVyRG9uZV1cbiAgICAgICAgICAgICAgICAgICAgIyBoYWNrLiBpbiB3ZWJnbDIuMCB3ZSBoYXZlIHNhbXBsZXJzLCBzbyB3ZSBkb24ndCBuZWVkIHRoaXMgY3JhcCBoZXJlXG4gICAgICAgICAgICAgICAgICAgIGZpbHRlciA9IEBtUmVuZGVyZXIuRklMVEVSLk5PTkVcbiAgICAgICAgICAgICAgICAgICAgaWYgaW5wLm1JbmZvLm1TYW1wbGVyLmZpbHRlciA9PSAnbGluZWFyJ1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyID0gQG1SZW5kZXJlci5GSUxURVIuTElORUFSXG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgaW5wLm1JbmZvLm1TYW1wbGVyLmZpbHRlciA9PSAnbWlwbWFwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyID0gQG1SZW5kZXJlci5GSUxURVIuTUlQTUFQXG4gICAgICAgICAgICAgICAgICAgIEBtUmVuZGVyZXIuU2V0U2FtcGxlckZpbHRlciB0ZXhJRCwgZmlsdGVyLCBmYWxzZVxuICAgICAgICAgICAgaSsrXG4gICAgICAgIHJldHVyblxuICAgIFxuICAgIHBhaW50X0N1YmVtYXA6IChkYSwgdGltZSwgZHRpbWUsIGZwcywgbW91c2VPcmlYLCBtb3VzZU9yaVksIG1vdXNlUG9zWCwgbW91c2VQb3NZLCB4cmVzLCB5cmVzLCBidWZmZXJzLCBjdWJlQnVmZmVycywga2V5Ym9hcmQsIGZhY2UpIC0+XG4gICAgICAgIFxuICAgICAgICBAcHJvY2Vzc0lucHV0cyBkYSwgdGltZSwgZHRpbWUsIGZwcywgbW91c2VPcmlYLCBtb3VzZU9yaVksIG1vdXNlUG9zWCwgbW91c2VQb3NZLCB4cmVzLCB5cmVzLCBidWZmZXJzLCBjdWJlQnVmZmVycywga2V5Ym9hcmQsIGZhY2VcbiAgICAgICAgQHNldFVuaWZvcm1zICAgZGEsIHRpbWUsIGR0aW1lLCBmcHMsIG1vdXNlT3JpWCwgbW91c2VPcmlZLCBtb3VzZVBvc1gsIG1vdXNlUG9zWSwgeHJlcywgeXJlcywgYnVmZmVycywgY3ViZUJ1ZmZlcnMsIGtleWJvYXJkXG4gICAgICAgIGwxID0gQG1SZW5kZXJlci5nZXRBdHRyaWJMb2NhdGlvbiBAbVByb2dyYW0sICdwb3MnXG4gICAgICAgIHZwID0gWyAwLCAwLCB4cmVzLCB5cmVzIF1cbiAgICAgICAgQG1SZW5kZXJlci5zZXRWaWV3cG9ydCB2cFxuICAgICAgICBDID0gc3dpdGNoIGZhY2VcbiAgICAgICAgICAgIHdoZW4gMCB0aGVuIFsgIDEgIDEgIDEgIDEgIDEgLTEgIDEgLTEgLTEgIDEgLTEgIDEgMCAwIDBdXG4gICAgICAgICAgICB3aGVuIDEgdGhlbiBbIC0xICAxIC0xIC0xICAxICAxIC0xIC0xICAxIC0xIC0xIC0xIDAgMCAwXVxuICAgICAgICAgICAgd2hlbiAyIHRoZW4gWyAtMSAgMSAtMSAgMSAgMSAtMSAgMSAgMSAgMSAtMSAgMSAgMSAwIDAgMF1cbiAgICAgICAgICAgIHdoZW4gMyB0aGVuIFsgLTEgLTEgIDEgIDEgLTEgIDEgIDEgLTEgLTEgLTEgLTEgLTEgMCAwIDBdXG4gICAgICAgICAgICB3aGVuIDQgdGhlbiBbIC0xICAxICAxICAxICAxICAxICAxIC0xICAxIC0xIC0xICAxIDAgMCAwXVxuICAgICAgICAgICAgZWxzZSAgICAgICAgWyAgMSAgMSAtMSAtMSAgMSAtMSAtMSAtMSAtMSAgMSAtMSAtMSAwIDAgMF1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQG1SZW5kZXJlci5zZXRTaGFkZXJDb25zdGFudDNGViAndW5Db3JuZXJzJyBDXG4gICAgICAgIEBtUmVuZGVyZXIuc2V0U2hhZGVyQ29uc3RhbnQ0RlYgJ3VuVmlld3BvcnQnIHZwXG4gICAgICAgIEBtUmVuZGVyZXIuZHJhd1VuaXRRdWFkX1hZIGwxXG4gICAgICAgIEBtUmVuZGVyZXIuZGV0dGFjaFRleHR1cmVzKClcbiAgICBcbiAgICBwYWludDogKGRhLCB0aW1lLCBkdGltZSwgZnBzLCBtb3VzZU9yaVgsIG1vdXNlT3JpWSwgbW91c2VQb3NYLCBtb3VzZVBvc1ksIHhyZXMsIHlyZXMsIGlzUGF1c2VkLCBidWZmZXJJRCwgYnVmZmVyTmVlZHNNaW1hcHMsIGJ1ZmZlcnMsIGN1YmVCdWZmZXJzLCBrZXlib2FyZCwgZWZmZWN0KSAtPlxuICAgICAgICBpZiBAbVR5cGUgPT0gJ2ltYWdlJ1xuICAgICAgICAgICAgQG1SZW5kZXJlci5zZXRSZW5kZXJUYXJnZXQgbnVsbFxuICAgICAgICAgICAgQHBhaW50X0ltYWdlIGRhLCB0aW1lLCBkdGltZSwgZnBzLCBtb3VzZU9yaVgsIG1vdXNlT3JpWSwgbW91c2VQb3NYLCBtb3VzZVBvc1ksIHhyZXMsIHlyZXMsIGJ1ZmZlcnMsIGN1YmVCdWZmZXJzLCBrZXlib2FyZFxuICAgICAgICAgICAgQG1GcmFtZSsrXG4gICAgICAgIGVsc2UgaWYgQG1UeXBlID09ICdjb21tb24nXG4gICAgICAgICAgICAjY29uc29sZS5sb2coXCJyZW5kZXJpbmcgY29tbW9uXCIpO1xuICAgICAgICBlbHNlIGlmIEBtVHlwZSA9PSAnYnVmZmVyJ1xuICAgICAgICAgICAgQG1FZmZlY3QucmVzaXplQnVmZmVyIGJ1ZmZlcklELCBAbUVmZmVjdC5tWHJlcywgQG1FZmZlY3QubVlyZXMsIGZhbHNlXG4gICAgICAgICAgICBidWZmZXIgPSBidWZmZXJzW2J1ZmZlcklEXVxuICAgICAgICAgICAgZHN0SUQgPSAxIC0gKGJ1ZmZlci5tTGFzdFJlbmRlckRvbmUpXG4gICAgICAgICAgICBAbVJlbmRlcmVyLnNldFJlbmRlclRhcmdldCBidWZmZXIubVRhcmdldFtkc3RJRF1cbiAgICAgICAgICAgIEBwYWludF9JbWFnZSBkYSwgdGltZSwgZHRpbWUsIGZwcywgbW91c2VPcmlYLCBtb3VzZU9yaVksIG1vdXNlUG9zWCwgbW91c2VQb3NZLCB4cmVzLCB5cmVzLCBidWZmZXJzLCBjdWJlQnVmZmVycywga2V5Ym9hcmRcblxuICAgICAgICAgICAgaWYgYnVmZmVyTmVlZHNNaW1hcHNcbiAgICAgICAgICAgICAgICBAbVJlbmRlcmVyLmNyZWF0ZU1pcG1hcHMgYnVmZmVyLm1UZXh0dXJlW2RzdElEXVxuICAgICAgICAgICAgYnVmZmVyc1tidWZmZXJJRF0ubUxhc3RSZW5kZXJEb25lID0gMSAtIChidWZmZXJzW2J1ZmZlcklEXS5tTGFzdFJlbmRlckRvbmUpXG4gICAgICAgICAgICBAbUZyYW1lKytcbiAgICAgICAgZWxzZSBpZiBAbVR5cGUgPT0gJ2N1YmVtYXAnXG4gICAgICAgICAgICBAbUVmZmVjdC5yZXNpemVDdWJlbWFwQnVmZmVyIGJ1ZmZlcklELCAxMDI0LCAxMDI0LCBmYWxzZVxuICAgICAgICAgICAgYnVmZmVyID0gY3ViZUJ1ZmZlcnNbYnVmZmVySURdXG4gICAgICAgICAgICB4cmVzID0gYnVmZmVyLm1SZXNvbHV0aW9uWzBdXG4gICAgICAgICAgICB5cmVzID0gYnVmZmVyLm1SZXNvbHV0aW9uWzFdXG4gICAgICAgICAgICBkc3RJRCA9IDEgLSAoYnVmZmVyLm1MYXN0UmVuZGVyRG9uZSlcbiAgICAgICAgICAgIGZhY2UgPSAwXG4gICAgICAgICAgICB3aGlsZSBmYWNlIDwgNlxuICAgICAgICAgICAgICAgIEBtUmVuZGVyZXIuc2V0UmVuZGVyVGFyZ2V0Q3ViZU1hcCBidWZmZXIubVRhcmdldFtkc3RJRF0sIGZhY2VcbiAgICAgICAgICAgICAgICBAUHBhaW50X0N1YmVtYXAgZGEsIHRpbWUsIGR0aW1lLCBmcHMsIG1vdXNlT3JpWCwgbW91c2VPcmlZLCBtb3VzZVBvc1gsIG1vdXNlUG9zWSwgeHJlcywgeXJlcywgYnVmZmVycywgY3ViZUJ1ZmZlcnMsIGtleWJvYXJkLCBmYWNlXG4gICAgICAgICAgICAgICAgZmFjZSsrXG4gICAgICAgICAgICBAbVJlbmRlcmVyLnNldFJlbmRlclRhcmdldEN1YmVNYXAgbnVsbCwgMFxuICAgICAgICAgICAgaWYgYnVmZmVyTmVlZHNNaW1hcHNcbiAgICAgICAgICAgICAgICBAbVJlbmRlcmVyLmNyZWF0ZU1pcG1hcHMgYnVmZmVyLm1UZXh0dXJlW2RzdElEXVxuICAgICAgICAgICAgY3ViZUJ1ZmZlcnNbYnVmZmVySURdLm1MYXN0UmVuZGVyRG9uZSA9IDEgLSAoY3ViZUJ1ZmZlcnNbYnVmZmVySURdLm1MYXN0UmVuZGVyRG9uZSlcbiAgICAgICAgICAgIEBtRnJhbWUrK1xuICAgICAgICByZXR1cm5cbiAgICBcbiJdfQ==
//# sourceURL=../../coffee/toy/pass.coffee