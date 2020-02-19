// koffee 1.7.0
var Effect;

Effect = (function() {
    function Effect(mGLContext, mXres, mYres) {
        var fs, i, j, kayboardTexture, keyboardData, keyboardImage, res, vs;
        this.mGLContext = mGLContext;
        this.mXres = mXres;
        this.mYres = mYres;
        this.mCreated = false;
        this.mRenderer = null;
        this.mPasses = [];
        this.mFrame = 0;
        this.mMaxBuffers = 4;
        this.mMaxCubeBuffers = 1;
        this.mMaxPasses = this.mMaxBuffers + 3;
        this.mBuffers = [];
        this.mCubeBuffers = [];
        this.mRenderer = new Renderer(this.mGLContext);
        vs = 'layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }';
        fs = 'uniform vec4 v; uniform sampler2D t; out vec4 outColor; void main() { outColor = textureLod(t, gl_FragCoord.xy / v.zw, 0.0); }';
        this.mProgramCopy = this.mRenderer.createShader(vs, fs);
        if (this.mProgramCopy.mResult === false) {
            console.error('Failed to compile shader to copy buffers:', res.mInfo);
            return;
        }
        vs = 'layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }';
        fs = 'uniform vec4 v; uniform sampler2D t; out vec4 outColor; void main() { vec2 uv = gl_FragCoord.xy / v.zw; outColor = texture(t, vec2(uv.x,1.0-uv.y)); }';
        res = this.mRenderer.createShader(vs, fs);
        if (res.mResult === false) {
            console.error('Failed to compile shader to downscale buffers:', res);
            return;
        }
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
        kayboardTexture = this.mRenderer.createTexture(Renderer.TEXTYPE.T2D, 256, 3, Renderer.TEXFMT.C1I8, Renderer.FILTER.NONE, Renderer.TEXWRP.CLAMP, null);
        keyboardImage = new Image;
        this.mKeyboard = {
            mData: keyboardData,
            mTexture: kayboardTexture,
            mIcon: keyboardImage
        };
        this.mCreated = true;
    }

    Effect.prototype.resizeCubemapBuffer = function(i, xres, yres) {
        var oldXres, oldYres, target1, target2, texture1, texture2;
        oldXres = this.mCubeBuffers[i].mResolution[0];
        oldYres = this.mCubeBuffers[i].mResolution[1];
        if (this.mCubeBuffers[i].mTexture[0] === null || oldXres !== xres || oldYres !== yres) {
            texture1 = this.mRenderer.createTexture(Renderer.TEXTYPE.CUBEMAP, xres, yres, Renderer.TEXFMT.C4F16, Renderer.FILTER.LINEAR, Renderer.TEXWRP.CLAMP, null);
            target1 = this.mRenderer.createRenderTargetCubeMap(texture1);
            texture2 = this.mRenderer.createTexture(Renderer.TEXTYPE.CUBEMAP, xres, yres, Renderer.TEXFMT.C4F16, Renderer.FILTER.LINEAR, Renderer.TEXWRP.CLAMP, null);
            target2 = this.mRenderer.createRenderTargetCubeMap(texture2);
            this.mCubeBuffers[i].mTexture = [texture1, texture2];
            this.mCubeBuffers[i].mTarget = [target1, target2];
            this.mCubeBuffers[i].mLastRenderDone = 0;
            this.mCubeBuffers[i].mResolution[0] = xres;
            return this.mCubeBuffers[i].mResolution[1] = yres;
        }
    };

    Effect.prototype.resizeBuffer = function(i, xres, yres, skipIfNotExists) {
        var l1, needCopy, oldXres, oldYres, target1, target2, texture1, texture2, v, vOld;
        if (skipIfNotExists && !this.mBuffers[i].mTexture[0]) {
            return;
        }
        oldXres = this.mBuffers[i].mResolution[0];
        oldYres = this.mBuffers[i].mResolution[1];
        if (oldXres !== xres || oldYres !== yres) {
            needCopy = this.mBuffers[i].mTexture[0] !== null;
            texture1 = this.mRenderer.createTexture(Renderer.TEXTYPE.T2D, xres, yres, Renderer.TEXFMT.C4F32, (needCopy ? this.mBuffers[i].mTexture[0].mFilter : Renderer.FILTER.NONE), (needCopy ? this.mBuffers[i].mTexture[0].mWrap : Renderer.TEXWRP.CLAMP), null);
            texture2 = this.mRenderer.createTexture(Renderer.TEXTYPE.T2D, xres, yres, Renderer.TEXFMT.C4F32, (needCopy ? this.mBuffers[i].mTexture[1].mFilter : Renderer.FILTER.NONE), (needCopy ? this.mBuffers[i].mTexture[1].mWrap : Renderer.TEXWRP.CLAMP), null);
            target1 = this.mRenderer.createRenderTarget(texture1);
            target2 = this.mRenderer.createRenderTarget(texture2);
            if (needCopy) {
                v = [0, 0, Math.min(xres, oldXres), Math.min(yres, oldYres)];
                this.mRenderer.setBlend(false);
                this.mRenderer.setViewport(v);
                this.mRenderer.attachShader(this.mProgramCopy);
                l1 = this.mRenderer.getAttribLocation(this.mProgramCopy, 'pos');
                vOld = [0, 0, oldXres, oldYres];
                this.mRenderer.setShaderConstant4FV('v', vOld);
                this.mRenderer.setRenderTarget(target1);
                this.mRenderer.attachTextures(1, this.mBuffers[i].mTexture[0], null, null, null);
                this.mRenderer.drawUnitQuad_XY(l1);
                this.mRenderer.setRenderTarget(target2);
                this.mRenderer.attachTextures(1, this.mBuffers[i].mTexture[1], null, null, null);
                this.mRenderer.drawUnitQuad_XY(l1);
                this.mRenderer.destroyTexture(this.mBuffers[i].mTexture[0]);
                this.mRenderer.destroyRenderTarget(this.mBuffers[i].mTarget[0]);
                this.mRenderer.destroyTexture(this.mBuffers[i].mTexture[1]);
                this.mRenderer.destroyRenderTarget(this.mBuffers[i].mTarget[1]);
            }
            this.mBuffers[i].mTexture = [texture1, texture2];
            this.mBuffers[i].mTarget = [target1, target2];
            this.mBuffers[i].mLastRenderDone = 0;
            this.mBuffers[i].mResolution[0] = xres;
            return this.mBuffers[i].mResolution[1] = yres;
        }
    };

    Effect.prototype.resizeBuffers = function(xres, yres) {
        var i;
        i = 0;
        while (i < this.mMaxBuffers) {
            this.resizeBuffer(i, xres, yres, true);
            i++;
        }
        return this;
    };

    Effect.prototype.getTexture = function(passid, slot) {
        return this.mPasses[passid].GetTexture(slot);
    };

    Effect.prototype.newTexture = function(passid, slot, url) {
        return this.mPasses[passid].NewTexture(slot, url, this.mBuffers, this.mCubeBuffers, this.mKeyboard);
    };

    Effect.prototype.setOutputs = function(passid, slot, url) {
        this.mPasses[passid].SetOutputs(slot, url);
    };

    Effect.prototype.setOutputsByBufferID = function(passid, slot, id) {
        this.mPasses[passid].SetOutputsByBufferID(slot, id);
    };

    Effect.prototype.getKeyDown = function(passid, k) {
        if (this.mKeyboard.mData[k + 0 * 256] === 255) {
            return;
        }
        this.mKeyboard.mData[k + 0 * 256] = 255;
        this.mKeyboard.mData[k + 1 * 256] = 255;
        this.mKeyboard.mData[k + 2 * 256] = 255 - this.mKeyboard.mData[k + 2 * 256];
        this.mRenderer.updateTexture(this.mKeyboard.mTexture, 0, 0, 256, 3, this.mKeyboard.mData);
    };

    Effect.prototype.setKeyUp = function(passid, k) {
        this.mKeyboard.mData[k + 0 * 256] = 0;
        this.mKeyboard.mData[k + 1 * 256] = 0;
        this.mRenderer.updateTexture(this.mKeyboard.mTexture, 0, 0, 256, 3, this.mKeyboard.mData);
    };

    Effect.prototype.setSize = function(xres, yres) {
        var oldXres, oldYres;
        if (xres !== this.mXres || yres !== this.mYres) {
            oldXres = this.mXres;
            oldYres = this.mYres;
            this.mXres = xres;
            this.mYres = yres;
            this.resizeBuffers(xres, yres);
            return true;
        }
        return false;
    };

    Effect.prototype.resetTime = function() {
        var i, num;
        this.mFrame = 0;
        num = this.mPasses.length;
        i = 0;
        while (i < num) {
            this.mPasses[i].mFrame = 0;
            i++;
        }
    };

    Effect.prototype.paint = function(time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, isPaused) {
        var bufferID, da, face, i, inp, j, k, needMipMaps, num, xres, yres;
        da = new Date;
        xres = this.mXres / 1;
        yres = this.mYres / 1;
        if (this.mFrame === 0) {
            i = 0;
            while (i < this.mMaxBuffers) {
                if (this.mBuffers[i].mTexture[0] !== null) {
                    this.mRenderer.setRenderTarget(this.mBuffers[i].mTarget[0]);
                    this.mRenderer.clear(this.mRenderer.cLEAR.Color, [0, 0, 0, 0], 1.0, 0);
                    this.mRenderer.setRenderTarget(this.mBuffers[i].mTarget[1]);
                    this.mRenderer.clear(this.mRenderer.cLEAR.Color, [0, 0, 0, 0], 1.0, 0);
                }
                i++;
            }
            i = 0;
            while (i < this.mMaxCubeBuffers) {
                if (this.mCubeBuffers[i].mTexture[0] !== null) {
                    face = 0;
                    while (face < 6) {
                        this.mRenderer.setRenderTargetCubeMap(this.mCubeBuffers[i].mTarget[0], face);
                        this.mRenderer.clear(this.mRenderer.cLEAR.Color, [0, 0, 0, 0], 1.0, 0);
                        this.mRenderer.setRenderTargetCubeMap(this.mCubeBuffers[i].mTarget[1], face);
                        this.mRenderer.clear(this.mRenderer.cLEAR.Color, [0, 0, 0, 0], 1.0, 0);
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
            this.mPasses[i].paint(da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, isPaused, bufferID, needMipMaps, this.mBuffers, this.mCubeBuffers, this.mKeyboard, this);
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
            this.mPasses[i].paint(da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, isPaused, bufferID, needMipMaps, this.mBuffers, this.mCubeBuffers, this.mKeyboard, this);
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
            this.mPasses[i].paint(da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, isPaused, null, false, this.mBuffers, this.mCubeBuffers, this.mKeyboard, this);
            i++;
        }
        k = 0;
        while (k < 256) {
            this.mKeyboard.mData[k + 1 * 256] = 0;
            k++;
        }
        this.mRenderer.updateTexture(this.mKeyboard.mTexture, 0, 0, 256, 3, this.mKeyboard.mData);
        this.mFrame++;
    };

    Effect.prototype.newShader = function(shaderCode, passid) {
        var commonSourceCodes, i;
        commonSourceCodes = [];
        i = 0;
        while (i < this.mPasses.length) {
            if (this.mPasses[i].mType === 'common') {
                commonSourceCodes.push(this.mPasses[i].mSource);
            }
            i++;
        }
        return this.mPasses[passid].newShader(shaderCode, commonSourceCodes);
    };

    Effect.prototype.getNumPasses = function() {
        return this.mPasses.length;
    };

    Effect.prototype.getNumOfType = function(passtype) {
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

    Effect.prototype.getPassType = function(id) {
        return this.mPasses[id].mType;
    };

    Effect.prototype.getPassName = function(id) {
        return this.mPasses[id].mName;
    };

    Effect.prototype.newScriptJSON = function(passes) {
        var i, j, numInputs, numOutputs, numPasses, outputCH, outputID, pt, res, result, rpass, rpassName, shaderStr;
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
            this.mPasses[j] = new Pass(this.mRenderer, j, this);
            numInputs = rpass.inputs.length;
            i = 0;
            while (i < 4) {
                this.mPasses[j].newTexture(i);
                i++;
            }
            i = 0;
            while (i < numInputs) {
                this.mPasses[j].newTexture(rpass.inputs[i].channel, {
                    mType: rpass.inputs[i].type,
                    mID: rpass.inputs[i].id,
                    mSrc: rpass.inputs[i].filepath,
                    mSampler: rpass.inputs[i].sampler
                }, this.mBuffers, this.mCubeBuffers, this.mKeyboard);
                i++;
            }
            i = 0;
            while (i < 4) {
                this.mPasses[j].setOutputs(i, null);
                i++;
            }
            numOutputs = rpass.outputs.length;
            i = 0;
            while (i < numOutputs) {
                outputID = rpass.outputs[i].id;
                outputCH = rpass.outputs[i].channel;
                this.mPasses[j].setOutputs(outputCH, outputID);
                i++;
            }
            rpassName = (function() {
                switch (rpass.type) {
                    case 'common':
                        return 'Common';
                    case 'image':
                        return 'Image';
                    case 'buffer':
                        return 'Buffer ' + String.fromCharCode(65 + assetID_to_bufferID(this.mPasses[j].mOutputs[0]));
                    case 'cubemap':
                        return 'Cube A';
                }
            }).call(this);
            this.mPasses[j].create(rpass.type, rpassName);
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
                result = this.newShader(shaderStr, j);
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

    return Effect;

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWZmZWN0LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBTUEsSUFBQTs7QUFBTTtJQUVDLGdCQUFDLFVBQUQsRUFBYyxLQUFkLEVBQXNCLEtBQXRCO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxhQUFEO1FBQWEsSUFBQyxDQUFBLFFBQUQ7UUFBUSxJQUFDLENBQUEsUUFBRDtRQUVyQixJQUFDLENBQUEsUUFBRCxHQUFzQjtRQUN0QixJQUFDLENBQUEsU0FBRCxHQUFzQjtRQUN0QixJQUFDLENBQUEsT0FBRCxHQUFzQjtRQUN0QixJQUFDLENBQUEsTUFBRCxHQUFzQjtRQUN0QixJQUFDLENBQUEsV0FBRCxHQUFzQjtRQUN0QixJQUFDLENBQUEsZUFBRCxHQUFzQjtRQUN0QixJQUFDLENBQUEsVUFBRCxHQUFzQixJQUFDLENBQUEsV0FBRCxHQUFlO1FBQ3JDLElBQUMsQ0FBQSxRQUFELEdBQXNCO1FBQ3RCLElBQUMsQ0FBQSxZQUFELEdBQXNCO1FBQ3RCLElBQUMsQ0FBQSxTQUFELEdBQXNCLElBQUksUUFBSixDQUFhLElBQUMsQ0FBQSxVQUFkO1FBRXRCLEVBQUEsR0FBSztRQUNMLEVBQUEsR0FBSztRQUNMLElBQUMsQ0FBQSxZQUFELEdBQWdCLElBQUMsQ0FBQSxTQUFTLENBQUMsWUFBWCxDQUF3QixFQUF4QixFQUE0QixFQUE1QjtRQUNoQixJQUFHLElBQUMsQ0FBQSxZQUFZLENBQUMsT0FBZCxLQUF5QixLQUE1QjtZQUNHLE9BQUEsQ0FBQyxLQUFELENBQU8sMkNBQVAsRUFBbUQsR0FBRyxDQUFDLEtBQXZEO0FBQ0MsbUJBRko7O1FBSUEsRUFBQSxHQUFLO1FBQ0wsRUFBQSxHQUFLO1FBQ0wsR0FBQSxHQUFNLElBQUMsQ0FBQSxTQUFTLENBQUMsWUFBWCxDQUF3QixFQUF4QixFQUE0QixFQUE1QjtRQUNOLElBQUcsR0FBRyxDQUFDLE9BQUosS0FBZSxLQUFsQjtZQUNHLE9BQUEsQ0FBQyxLQUFE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bnQiOlsiIyAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgIDAwMDAwMCAgICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICBcblxuY2xhc3MgRWZmZWN0IFxuICAgIFxuICAgIEA6IChAbUdMQ29udGV4dCwgQG1YcmVzLCBAbVlyZXMpIC0+XG4gICAgICAgIFxuICAgICAgICBAbUNyZWF0ZWQgICAgICAgICAgID0gZmFsc2VcbiAgICAgICAgQG1SZW5kZXJlciAgICAgICAgICA9IG51bGxcbiAgICAgICAgQG1QYXNzZXMgICAgICAgICAgICA9IFtdXG4gICAgICAgIEBtRnJhbWUgICAgICAgICAgICAgPSAwXG4gICAgICAgIEBtTWF4QnVmZmVycyAgICAgICAgPSA0XG4gICAgICAgIEBtTWF4Q3ViZUJ1ZmZlcnMgICAgPSAxXG4gICAgICAgIEBtTWF4UGFzc2VzICAgICAgICAgPSBAbU1heEJ1ZmZlcnMgKyAzXG4gICAgICAgIEBtQnVmZmVycyAgICAgICAgICAgPSBbXVxuICAgICAgICBAbUN1YmVCdWZmZXJzICAgICAgID0gW11cbiAgICAgICAgQG1SZW5kZXJlciAgICAgICAgICA9IG5ldyBSZW5kZXJlciBAbUdMQ29udGV4dFxuICAgICAgICBcbiAgICAgICAgdnMgPSAnbGF5b3V0KGxvY2F0aW9uID0gMCkgaW4gdmVjMiBwb3M7IHZvaWQgbWFpbigpIHsgZ2xfUG9zaXRpb24gPSB2ZWM0KHBvcy54eSwwLjAsMS4wKTsgfSdcbiAgICAgICAgZnMgPSAndW5pZm9ybSB2ZWM0IHY7IHVuaWZvcm0gc2FtcGxlcjJEIHQ7IG91dCB2ZWM0IG91dENvbG9yOyB2b2lkIG1haW4oKSB7IG91dENvbG9yID0gdGV4dHVyZUxvZCh0LCBnbF9GcmFnQ29vcmQueHkgLyB2Lnp3LCAwLjApOyB9J1xuICAgICAgICBAbVByb2dyYW1Db3B5ID0gQG1SZW5kZXJlci5jcmVhdGVTaGFkZXIgdnMsIGZzXG4gICAgICAgIGlmIEBtUHJvZ3JhbUNvcHkubVJlc3VsdCA9PSBmYWxzZVxuICAgICAgICAgICAgZXJyb3IgJ0ZhaWxlZCB0byBjb21waWxlIHNoYWRlciB0byBjb3B5IGJ1ZmZlcnM6JyByZXMubUluZm9cbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICAgICAgdnMgPSAnbGF5b3V0KGxvY2F0aW9uID0gMCkgaW4gdmVjMiBwb3M7IHZvaWQgbWFpbigpIHsgZ2xfUG9zaXRpb24gPSB2ZWM0KHBvcy54eSwwLjAsMS4wKTsgfSdcbiAgICAgICAgZnMgPSAndW5pZm9ybSB2ZWM0IHY7IHVuaWZvcm0gc2FtcGxlcjJEIHQ7IG91dCB2ZWM0IG91dENvbG9yOyB2b2lkIG1haW4oKSB7IHZlYzIgdXYgPSBnbF9GcmFnQ29vcmQueHkgLyB2Lnp3OyBvdXRDb2xvciA9IHRleHR1cmUodCwgdmVjMih1di54LDEuMC11di55KSk7IH0nXG4gICAgICAgIHJlcyA9IEBtUmVuZGVyZXIuY3JlYXRlU2hhZGVyIHZzLCBmc1xuICAgICAgICBpZiByZXMubVJlc3VsdCA9PSBmYWxzZVxuICAgICAgICAgICAgZXJyb3IgJ0ZhaWxlZCB0byBjb21waWxlIHNoYWRlciB0byBkb3duc2NhbGUgYnVmZmVyczonIHJlc1xuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgaSA9IDBcbiAgICAgICAgd2hpbGUgaSA8IEBtTWF4QnVmZmVyc1xuICAgICAgICAgICAgQG1CdWZmZXJzW2ldID1cbiAgICAgICAgICAgICAgICBtVGV4dHVyZTogWyBudWxsIG51bGwgXVxuICAgICAgICAgICAgICAgIG1UYXJnZXQ6ICBbIG51bGwgbnVsbCBdXG4gICAgICAgICAgICAgICAgbVJlc29sdXRpb246IFsgMCAwIF1cbiAgICAgICAgICAgICAgICBtTGFzdFJlbmRlckRvbmU6IDBcbiAgICAgICAgICAgICAgICBtVGh1bWJuYWlsUmVuZGVyVGFyZ2V0OiBudWxsXG4gICAgICAgICAgICAgICAgbVRodW1ibmFpbFRleHR1cmU6IG51bGxcbiAgICAgICAgICAgICAgICBtVGh1bWJuYWlsQnVmZmVyOiBudWxsXG4gICAgICAgICAgICAgICAgbVRodW1ibmFpbFJlczogWyAwIDAgXVxuICAgICAgICAgICAgaSsrXG4gICAgICAgIGkgPSAwXG4gICAgICAgIHdoaWxlIGkgPCBAbU1heEN1YmVCdWZmZXJzXG4gICAgICAgICAgICBAbUN1YmVCdWZmZXJzW2ldID1cbiAgICAgICAgICAgICAgICBtVGV4dHVyZTogWyBudWxsIG51bGwgXVxuICAgICAgICAgICAgICAgIG1UYXJnZXQ6IFsgbnVsbCBudWxsIF1cbiAgICAgICAgICAgICAgICBtUmVzb2x1dGlvbjogWyAwIDAgXVxuICAgICAgICAgICAgICAgIG1MYXN0UmVuZGVyRG9uZTogMFxuICAgICAgICAgICAgICAgIG1UaHVtYm5haWxSZW5kZXJUYXJnZXQ6IG51bGxcbiAgICAgICAgICAgICAgICBtVGh1bWJuYWlsVGV4dHVyZTogbnVsbFxuICAgICAgICAgICAgICAgIG1UaHVtYm5haWxCdWZmZXI6IG51bGxcbiAgICAgICAgICAgICAgICBtVGh1bWJuYWlsUmVzOiBbIDAgMCBdXG4gICAgICAgICAgICBpKytcbiAgICAgICAga2V5Ym9hcmREYXRhID0gbmV3IFVpbnQ4QXJyYXkoMjU2ICogMylcbiAgICAgICAgaiA9IDBcbiAgICAgICAgd2hpbGUgaiA8IDI1NiAqIDNcbiAgICAgICAgICAgIGtleWJvYXJkRGF0YVtqXSA9IDBcbiAgICAgICAgICAgIGorK1xuICAgICAgICBrYXlib2FyZFRleHR1cmUgPSBAbVJlbmRlcmVyLmNyZWF0ZVRleHR1cmUoUmVuZGVyZXIuVEVYVFlQRS5UMkQsIDI1NiwgMywgUmVuZGVyZXIuVEVYRk1ULkMxSTgsIFJlbmRlcmVyLkZJTFRFUi5OT05FLCBSZW5kZXJlci5URVhXUlAuQ0xBTVAsIG51bGwpXG4gICAgICAgIGtleWJvYXJkSW1hZ2UgPSBuZXcgSW1hZ2VcbiAgICAgICAgQG1LZXlib2FyZCA9XG4gICAgICAgICAgICBtRGF0YToga2V5Ym9hcmREYXRhXG4gICAgICAgICAgICBtVGV4dHVyZToga2F5Ym9hcmRUZXh0dXJlXG4gICAgICAgICAgICBtSWNvbjoga2V5Ym9hcmRJbWFnZVxuICAgICAgICBAbUNyZWF0ZWQgPSB0cnVlXG5cbiAgICByZXNpemVDdWJlbWFwQnVmZmVyOiAoaSwgeHJlcywgeXJlcykgLT5cbiAgICAgICAgXG4gICAgICAgIG9sZFhyZXMgPSBAbUN1YmVCdWZmZXJzW2ldLm1SZXNvbHV0aW9uWzBdXG4gICAgICAgIG9sZFlyZXMgPSBAbUN1YmVCdWZmZXJzW2ldLm1SZXNvbHV0aW9uWzFdXG4gICAgICAgIFxuICAgICAgICBpZiBAbUN1YmVCdWZmZXJzW2ldLm1UZXh0dXJlWzBdID09IG51bGwgb3Igb2xkWHJlcyAhPSB4cmVzIG9yIG9sZFlyZXMgIT0geXJlc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICB0ZXh0dXJlMSA9IEBtUmVuZGVyZXIuY3JlYXRlVGV4dHVyZShSZW5kZXJlci5URVhUWVBFLkNVQkVNQVAsIHhyZXMsIHlyZXMsIFJlbmRlcmVyLlRFWEZNVC5DNEYxNiwgUmVuZGVyZXIuRklMVEVSLkxJTkVBUiwgUmVuZGVyZXIuVEVYV1JQLkNMQU1QLCBudWxsKVxuICAgICAgICAgICAgdGFyZ2V0MSAgPSBAbVJlbmRlcmVyLmNyZWF0ZVJlbmRlclRhcmdldEN1YmVNYXAgdGV4dHVyZTFcbiAgICAgICAgICAgIHRleHR1cmUyID0gQG1SZW5kZXJlci5jcmVhdGVUZXh0dXJlKFJlbmRlcmVyLlRFWFRZUEUuQ1VCRU1BUCwgeHJlcywgeXJlcywgUmVuZGVyZXIuVEVYRk1ULkM0RjE2LCBSZW5kZXJlci5GSUxURVIuTElORUFSLCBSZW5kZXJlci5URVhXUlAuQ0xBTVAsIG51bGwpXG4gICAgICAgICAgICB0YXJnZXQyICA9IEBtUmVuZGVyZXIuY3JlYXRlUmVuZGVyVGFyZ2V0Q3ViZU1hcCB0ZXh0dXJlMlxuXG4gICAgICAgICAgICBAbUN1YmVCdWZmZXJzW2ldLm1UZXh0dXJlID0gWyB0ZXh0dXJlMSwgdGV4dHVyZTIgXVxuICAgICAgICAgICAgQG1DdWJlQnVmZmVyc1tpXS5tVGFyZ2V0ICA9IFsgdGFyZ2V0MSwgdGFyZ2V0MiBdXG4gICAgICAgICAgICBAbUN1YmVCdWZmZXJzW2ldLm1MYXN0UmVuZGVyRG9uZSA9IDBcbiAgICAgICAgICAgIEBtQ3ViZUJ1ZmZlcnNbaV0ubVJlc29sdXRpb25bMF0gPSB4cmVzXG4gICAgICAgICAgICBAbUN1YmVCdWZmZXJzW2ldLm1SZXNvbHV0aW9uWzFdID0geXJlc1xuXG4gICAgcmVzaXplQnVmZmVyOiAoaSwgeHJlcywgeXJlcywgc2tpcElmTm90RXhpc3RzKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgc2tpcElmTm90RXhpc3RzIGFuZCBub3QgQG1CdWZmZXJzW2ldLm1UZXh0dXJlWzBdXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgb2xkWHJlcyA9IEBtQnVmZmVyc1tpXS5tUmVzb2x1dGlvblswXVxuICAgICAgICBvbGRZcmVzID0gQG1CdWZmZXJzW2ldLm1SZXNvbHV0aW9uWzFdXG4gICAgICAgIGlmIG9sZFhyZXMgIT0geHJlcyBvciBvbGRZcmVzICE9IHlyZXNcbiAgICAgICAgICAgIG5lZWRDb3B5ID0gQG1CdWZmZXJzW2ldLm1UZXh0dXJlWzBdICE9IG51bGxcbiAgICAgICAgICAgIHRleHR1cmUxID0gQG1SZW5kZXJlci5jcmVhdGVUZXh0dXJlKFJlbmRlcmVyLlRFWFRZUEUuVDJELCB4cmVzLCB5cmVzLCBSZW5kZXJlci5URVhGTVQuQzRGMzIsIChpZiBuZWVkQ29weSB0aGVuIEBtQnVmZmVyc1tpXS5tVGV4dHVyZVswXS5tRmlsdGVyIGVsc2UgUmVuZGVyZXIuRklMVEVSLk5PTkUpLCAoaWYgbmVlZENvcHkgdGhlbiBAbUJ1ZmZlcnNbaV0ubVRleHR1cmVbMF0ubVdyYXAgZWxzZSBSZW5kZXJlci5URVhXUlAuQ0xBTVApLCBudWxsKVxuICAgICAgICAgICAgdGV4dHVyZTIgPSBAbVJlbmRlcmVyLmNyZWF0ZVRleHR1cmUoUmVuZGVyZXIuVEVYVFlQRS5UMkQsIHhyZXMsIHlyZXMsIFJlbmRlcmVyLlRFWEZNVC5DNEYzMiwgKGlmIG5lZWRDb3B5IHRoZW4gQG1CdWZmZXJzW2ldLm1UZXh0dXJlWzFdLm1GaWx0ZXIgZWxzZSBSZW5kZXJlci5GSUxURVIuTk9ORSksIChpZiBuZWVkQ29weSB0aGVuIEBtQnVmZmVyc1tpXS5tVGV4dHVyZVsxXS5tV3JhcCBlbHNlIFJlbmRlcmVyLlRFWFdSUC5DTEFNUCksIG51bGwpXG4gICAgICAgICAgICB0YXJnZXQxICA9IEBtUmVuZGVyZXIuY3JlYXRlUmVuZGVyVGFyZ2V0IHRleHR1cmUxXG4gICAgICAgICAgICB0YXJnZXQyICA9IEBtUmVuZGVyZXIuY3JlYXRlUmVuZGVyVGFyZ2V0IHRleHR1cmUyXG4gICAgICAgICAgICBpZiBuZWVkQ29weVxuICAgICAgICAgICAgICAgIHYgPSBbIDAsIDAsIE1hdGgubWluKHhyZXMsIG9sZFhyZXMpLCBNYXRoLm1pbih5cmVzLCBvbGRZcmVzKSBdXG4gICAgICAgICAgICAgICAgQG1SZW5kZXJlci5zZXRCbGVuZCBmYWxzZVxuICAgICAgICAgICAgICAgIEBtUmVuZGVyZXIuc2V0Vmlld3BvcnQgdlxuICAgICAgICAgICAgICAgIEBtUmVuZGVyZXIuYXR0YWNoU2hhZGVyIEBtUHJvZ3JhbUNvcHlcbiAgICAgICAgICAgICAgICBsMSA9IEBtUmVuZGVyZXIuZ2V0QXR0cmliTG9jYXRpb24gQG1Qcm9ncmFtQ29weSwgJ3BvcydcbiAgICAgICAgICAgICAgICB2T2xkID0gWyAwLCAwLCBvbGRYcmVzLCBvbGRZcmVzIF1cbiAgICAgICAgICAgICAgICBAbVJlbmRlcmVyLnNldFNoYWRlckNvbnN0YW50NEZWICd2JyB2T2xkXG5cbiAgICAgICAgICAgICAgICBAbVJlbmRlcmVyLnNldFJlbmRlclRhcmdldCB0YXJnZXQxXG4gICAgICAgICAgICAgICAgQG1SZW5kZXJlci5hdHRhY2hUZXh0dXJlcyAxLCBAbUJ1ZmZlcnNbaV0ubVRleHR1cmVbMF0sIG51bGwsIG51bGwsIG51bGxcbiAgICAgICAgICAgICAgICBAbVJlbmRlcmVyLmRyYXdVbml0UXVhZF9YWSBsMVxuXG4gICAgICAgICAgICAgICAgQG1SZW5kZXJlci5zZXRSZW5kZXJUYXJnZXQgdGFyZ2V0MlxuICAgICAgICAgICAgICAgIEBtUmVuZGVyZXIuYXR0YWNoVGV4dHVyZXMgMSwgQG1CdWZmZXJzW2ldLm1UZXh0dXJlWzFdLCBudWxsLCBudWxsLCBudWxsXG4gICAgICAgICAgICAgICAgQG1SZW5kZXJlci5kcmF3VW5pdFF1YWRfWFkgbDFcblxuICAgICAgICAgICAgICAgIEBtUmVuZGVyZXIuZGVzdHJveVRleHR1cmUgQG1CdWZmZXJzW2ldLm1UZXh0dXJlWzBdXG4gICAgICAgICAgICAgICAgQG1SZW5kZXJlci5kZXN0cm95UmVuZGVyVGFyZ2V0IEBtQnVmZmVyc1tpXS5tVGFyZ2V0WzBdXG4gICAgICAgICAgICAgICAgQG1SZW5kZXJlci5kZXN0cm95VGV4dHVyZSBAbUJ1ZmZlcnNbaV0ubVRleHR1cmVbMV1cbiAgICAgICAgICAgICAgICBAbVJlbmRlcmVyLmRlc3Ryb3lSZW5kZXJUYXJnZXQgQG1CdWZmZXJzW2ldLm1UYXJnZXRbMV1cblxuICAgICAgICAgICAgQG1CdWZmZXJzW2ldLm1UZXh0dXJlID0gWyB0ZXh0dXJlMSwgdGV4dHVyZTIgXVxuICAgICAgICAgICAgQG1CdWZmZXJzW2ldLm1UYXJnZXQgID0gWyB0YXJnZXQxLCAgdGFyZ2V0MiAgXVxuICAgICAgICAgICAgQG1CdWZmZXJzW2ldLm1MYXN0UmVuZGVyRG9uZSA9IDBcbiAgICAgICAgICAgIEBtQnVmZmVyc1tpXS5tUmVzb2x1dGlvblswXSA9IHhyZXNcbiAgICAgICAgICAgIEBtQnVmZmVyc1tpXS5tUmVzb2x1dGlvblsxXSA9IHlyZXNcblxuICAgIHJlc2l6ZUJ1ZmZlcnM6ICh4cmVzLCB5cmVzKSAtPlxuICAgICAgICBpID0gMFxuICAgICAgICB3aGlsZSBpIDwgQG1NYXhCdWZmZXJzXG4gICAgICAgICAgICBAcmVzaXplQnVmZmVyIGksIHhyZXMsIHlyZXMsIHRydWVcbiAgICAgICAgICAgIGkrK1xuICAgICAgICBAXG5cbiAgICBnZXRUZXh0dXJlOiAocGFzc2lkLCBzbG90KSAtPlxuICAgICAgICBAbVBhc3Nlc1twYXNzaWRdLkdldFRleHR1cmUgc2xvdFxuXG4gICAgbmV3VGV4dHVyZTogKHBhc3NpZCwgc2xvdCwgdXJsKSAtPlxuICAgICAgICBAbVBhc3Nlc1twYXNzaWRdLk5ld1RleHR1cmUgc2xvdCwgdXJsLCBAbUJ1ZmZlcnMsIEBtQ3ViZUJ1ZmZlcnMsIEBtS2V5Ym9hcmRcbiAgICBcbiAgICBzZXRPdXRwdXRzOiAocGFzc2lkLCBzbG90LCB1cmwpIC0+XG4gICAgICAgIEBtUGFzc2VzW3Bhc3NpZF0uU2V0T3V0cHV0cyBzbG90LCB1cmxcbiAgICAgICAgcmV0dXJuXG4gICAgXG4gICAgc2V0T3V0cHV0c0J5QnVmZmVySUQ6IChwYXNzaWQsIHNsb3QsIGlkKSAtPlxuICAgICAgICBAbVBhc3Nlc1twYXNzaWRdLlNldE91dHB1dHNCeUJ1ZmZlcklEIHNsb3QsIGlkXG4gICAgICAgIHJldHVyblxuICAgICAgICBcbiAgICBnZXRLZXlEb3duOiAocGFzc2lkLCBrKSAtPlxuICAgICAgICBpZiBAbUtleWJvYXJkLm1EYXRhW2sgKyAwICogMjU2XSA9PSAyNTVcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBAbUtleWJvYXJkLm1EYXRhW2sgKyAwICogMjU2XSA9IDI1NVxuICAgICAgICBAbUtleWJvYXJkLm1EYXRhW2sgKyAxICogMjU2XSA9IDI1NVxuICAgICAgICBAbUtleWJvYXJkLm1EYXRhW2sgKyAyICogMjU2XSA9IDI1NSAtIChAbUtleWJvYXJkLm1EYXRhW2sgKyAyICogMjU2XSlcbiAgICAgICAgQG1SZW5kZXJlci51cGRhdGVUZXh0dXJlIEBtS2V5Ym9hcmQubVRleHR1cmUsIDAsIDAsIDI1NiwgMywgQG1LZXlib2FyZC5tRGF0YVxuICAgICAgICByZXR1cm5cbiAgICBcbiAgICBzZXRLZXlVcDogKHBhc3NpZCwgaykgLT5cbiAgICAgICAgQG1LZXlib2FyZC5tRGF0YVtrICsgMCAqIDI1Nl0gPSAwXG4gICAgICAgIEBtS2V5Ym9hcmQubURhdGFbayArIDEgKiAyNTZdID0gMFxuICAgICAgICBAbVJlbmRlcmVyLnVwZGF0ZVRleHR1cmUgQG1LZXlib2FyZC5tVGV4dHVyZSwgMCwgMCwgMjU2LCAzLCBAbUtleWJvYXJkLm1EYXRhXG4gICAgICAgIHJldHVyblxuICAgIFxuICAgIHNldFNpemU6ICh4cmVzLCB5cmVzKSAtPlxuICAgICAgICBpZiB4cmVzICE9IEBtWHJlcyBvciB5cmVzICE9IEBtWXJlc1xuICAgICAgICAgICAgb2xkWHJlcyA9IEBtWHJlc1xuICAgICAgICAgICAgb2xkWXJlcyA9IEBtWXJlc1xuICAgICAgICAgICAgQG1YcmVzID0geHJlc1xuICAgICAgICAgICAgQG1ZcmVzID0geXJlc1xuICAgICAgICAgICAgQHJlc2l6ZUJ1ZmZlcnMgeHJlcywgeXJlc1xuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgZmFsc2VcbiAgICAgICAgXG4gICAgcmVzZXRUaW1lOiAtPlxuICAgICAgICBAbUZyYW1lID0gMFxuICAgICAgICBudW0gPSBAbVBhc3Nlcy5sZW5ndGhcbiAgICAgICAgaSA9IDBcbiAgICAgICAgd2hpbGUgaSA8IG51bVxuICAgICAgICAgICAgQG1QYXNzZXNbaV0ubUZyYW1lID0gMFxuICAgICAgICAgICAgaSsrXG4gICAgICAgIHJldHVyblxuICAgIFxuICAgIHBhaW50OiAodGltZSwgZHRpbWUsIGZwcywgbW91c2VPcmlYLCBtb3VzZU9yaVksIG1vdXNlUG9zWCwgbW91c2VQb3NZLCBpc1BhdXNlZCkgLT5cbiAgICAgICAgXG4gICAgICAgIGRhICAgPSBuZXcgRGF0ZVxuICAgICAgICB4cmVzID0gQG1YcmVzIC8gMVxuICAgICAgICB5cmVzID0gQG1ZcmVzIC8gMVxuICAgICAgICBpZiBAbUZyYW1lID09IDBcbiAgICAgICAgICAgIGkgPSAwXG4gICAgICAgICAgICB3aGlsZSBpIDwgQG1NYXhCdWZmZXJzXG4gICAgICAgICAgICAgICAgaWYgQG1CdWZmZXJzW2ldLm1UZXh0dXJlWzBdICE9IG51bGxcbiAgICAgICAgICAgICAgICAgICAgQG1SZW5kZXJlci5zZXRSZW5kZXJUYXJnZXQgQG1CdWZmZXJzW2ldLm1UYXJnZXRbMF1cbiAgICAgICAgICAgICAgICAgICAgQG1SZW5kZXJlci5jbGVhciBAbVJlbmRlcmVyLmNMRUFSLkNvbG9yLCBbIDAgMCAwIDAgXSwgMS4wLCAwXG4gICAgICAgICAgICAgICAgICAgIEBtUmVuZGVyZXIuc2V0UmVuZGVyVGFyZ2V0IEBtQnVmZmVyc1tpXS5tVGFyZ2V0WzFdXG4gICAgICAgICAgICAgICAgICAgIEBtUmVuZGVyZXIuY2xlYXIgQG1SZW5kZXJlci5jTEVBUi5Db2xvciwgWyAwIDAgMCAwIF0sIDEuMCwgMFxuICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgaSA9IDBcbiAgICAgICAgICAgIHdoaWxlIGkgPCBAbU1heEN1YmVCdWZmZXJzXG4gICAgICAgICAgICAgICAgaWYgQG1DdWJlQnVmZmVyc1tpXS5tVGV4dHVyZVswXSAhPSBudWxsXG4gICAgICAgICAgICAgICAgICAgIGZhY2UgPSAwXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIGZhY2UgPCA2XG4gICAgICAgICAgICAgICAgICAgICAgICBAbVJlbmRlcmVyLnNldFJlbmRlclRhcmdldEN1YmVNYXAgQG1DdWJlQnVmZmVyc1tpXS5tVGFyZ2V0WzBdLCBmYWNlXG4gICAgICAgICAgICAgICAgICAgICAgICBAbVJlbmRlcmVyLmNsZWFyIEBtUmVuZGVyZXIuY0xFQVIuQ29sb3IsIFsgMCAwIDAgMCBdLCAxLjAsIDBcbiAgICAgICAgICAgICAgICAgICAgICAgIEBtUmVuZGVyZXIuc2V0UmVuZGVyVGFyZ2V0Q3ViZU1hcCBAbUN1YmVCdWZmZXJzW2ldLm1UYXJnZXRbMV0sIGZhY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIEBtUmVuZGVyZXIuY2xlYXIgQG1SZW5kZXJlci5jTEVBUi5Db2xvciwgWyAwIDAgMCAwIF0sIDEuMCwgMFxuICAgICAgICAgICAgICAgICAgICAgICAgZmFjZSsrXG4gICAgICAgICAgICAgICAgaSsrXG4gICAgICAgIG51bSA9IEBtUGFzc2VzLmxlbmd0aFxuICAgICAgICAjIHJlbmRlciBidWZmZXJzIHNlY29uZFxuICAgICAgICBpID0gMFxuICAgICAgICB3aGlsZSBpIDwgbnVtXG4gICAgICAgICAgICBpZiBAbVBhc3Nlc1tpXS5tVHlwZSAhPSAnYnVmZmVyJ1xuICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICBpZiBAbVBhc3Nlc1tpXS5tUHJvZ3JhbSA9PSBudWxsXG4gICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIGJ1ZmZlcklEID0gYXNzZXRJRF90b19idWZmZXJJRChAbVBhc3Nlc1tpXS5tT3V0cHV0c1swXSlcbiAgICAgICAgICAgICMgY2hlY2sgaWYgYW55IGRvd25zdHJlYW0gcGFzcyBuZWVkcyBtaXBtYXBzIHdoZW4gcmVhZGluZyBmcm9tIHRoaXMgYnVmZmVyXG4gICAgICAgICAgICBuZWVkTWlwTWFwcyA9IGZhbHNlXG4gICAgICAgICAgICBqID0gMFxuICAgICAgICAgICAgd2hpbGUgaiA8IG51bVxuICAgICAgICAgICAgICAgIGsgPSAwXG4gICAgICAgICAgICAgICAgd2hpbGUgayA8IEBtUGFzc2VzW2pdLm1JbnB1dHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIGlucCA9IEBtUGFzc2VzW2pdLm1JbnB1dHNba11cbiAgICAgICAgICAgICAgICAgICAgaWYgaW5wICE9IG51bGwgYW5kIGlucC5tSW5mby5tVHlwZSA9PSAnYnVmZmVyJyBhbmQgaW5wLmlkID09IGJ1ZmZlcklEIGFuZCBpbnAubUluZm8ubVNhbXBsZXIuZmlsdGVyID09ICdtaXBtYXAnXG4gICAgICAgICAgICAgICAgICAgICAgICBuZWVkTWlwTWFwcyA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIGsrK1xuICAgICAgICAgICAgICAgIGorK1xuICAgICAgICAgICAgQG1QYXNzZXNbaV0ucGFpbnQgZGEsIHRpbWUsIGR0aW1lLCBmcHMsIG1vdXNlT3JpWCwgbW91c2VPcmlZLCBtb3VzZVBvc1gsIG1vdXNlUG9zWSwgeHJlcywgeXJlcywgaXNQYXVzZWQsIGJ1ZmZlcklELCBuZWVkTWlwTWFwcywgQG1CdWZmZXJzLCBAbUN1YmVCdWZmZXJzLCBAbUtleWJvYXJkLCBAXG4gICAgICAgICAgICBpKytcbiAgICAgICAgIyByZW5kZXIgY3ViZW1hcCBidWZmZXJzIHNlY29uZFxuICAgICAgICBpID0gMFxuICAgICAgICB3aGlsZSBpIDwgbnVtXG4gICAgICAgICAgICBpZiBAbVBhc3Nlc1tpXS5tVHlwZSAhPSAnY3ViZW1hcCdcbiAgICAgICAgICAgICAgICBpKytcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgaWYgQG1QYXNzZXNbaV0ubVByb2dyYW0gPT0gbnVsbFxuICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgICAgICBidWZmZXJJRCA9IDBcbiAgICAgICAgICAgICMgY2hlY2sgaWYgYW55IGRvd25zdHJlYW0gcGFzcyBuZWVkcyBtaXBtYXBzIHdoZW4gcmVhZGluZyBmcm9tIHRoaXMgYnVmZmVyXG4gICAgICAgICAgICBuZWVkTWlwTWFwcyA9IGZhbHNlXG4gICAgICAgICAgICBqID0gMFxuICAgICAgICAgICAgd2hpbGUgaiA8IG51bVxuICAgICAgICAgICAgICAgIGsgPSAwXG4gICAgICAgICAgICAgICAgd2hpbGUgayA8IEBtUGFzc2VzW2pdLm1JbnB1dHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIGlucCA9IEBtUGFzc2VzW2pdLm1JbnB1dHNba11cbiAgICAgICAgICAgICAgICAgICAgaWYgaW5wICE9IG51bGwgYW5kIGlucC5tSW5mby5tVHlwZSA9PSAnY3ViZW1hcCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGFzc2V0SURfdG9fY3ViZW1hcEJ1ZmVySUQoaW5wLm1JbmZvLm1JRCkgPT0gMCBhbmQgaW5wLm1JbmZvLm1TYW1wbGVyLmZpbHRlciA9PSAnbWlwbWFwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5lZWRNaXBNYXBzID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICAgICAgICAgIGsrK1xuICAgICAgICAgICAgICAgIGorK1xuICAgICAgICAgICAgQG1QYXNzZXNbaV0ucGFpbnQgZGEsIHRpbWUsIGR0aW1lLCBmcHMsIG1vdXNlT3JpWCwgbW91c2VPcmlZLCBtb3VzZVBvc1gsIG1vdXNlUG9zWSwgeHJlcywgeXJlcywgaXNQYXVzZWQsIGJ1ZmZlcklELCBuZWVkTWlwTWFwcywgQG1CdWZmZXJzLCBAbUN1YmVCdWZmZXJzLCBAbUtleWJvYXJkLCBAXG4gICAgICAgICAgICBpKytcbiAgICAgICAgIyByZW5kZXIgaW1hZ2UgbGFzdFxuICAgICAgICBpID0gMFxuICAgICAgICB3aGlsZSBpIDwgbnVtXG4gICAgICAgICAgICBpZiBAbVBhc3Nlc1tpXS5tVHlwZSAhPSAnaW1hZ2UnXG4gICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgIGlmIEBtUGFzc2VzW2ldLm1Qcm9ncmFtID09IG51bGxcbiAgICAgICAgICAgICAgICBpKytcbiAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgQG1QYXNzZXNbaV0ucGFpbnQgZGEsIHRpbWUsIGR0aW1lLCBmcHMsIG1vdXNlT3JpWCwgbW91c2VPcmlZLCBtb3VzZVBvc1gsIG1vdXNlUG9zWSwgeHJlcywgeXJlcywgaXNQYXVzZWQsIG51bGwsIGZhbHNlLCBAbUJ1ZmZlcnMsIEBtQ3ViZUJ1ZmZlcnMsIEBtS2V5Ym9hcmQsIEBcbiAgICAgICAgICAgIGkrK1xuXG4gICAgICAgIGsgPSAwXG4gICAgICAgIHdoaWxlIGsgPCAyNTZcbiAgICAgICAgICAgIEBtS2V5Ym9hcmQubURhdGFbayArIDEgKiAyNTZdID0gMFxuICAgICAgICAgICAgaysrXG4gICAgICAgIEBtUmVuZGVyZXIudXBkYXRlVGV4dHVyZSBAbUtleWJvYXJkLm1UZXh0dXJlLCAwLCAwLCAyNTYsIDMsIEBtS2V5Ym9hcmQubURhdGFcbiAgICAgICAgQG1GcmFtZSsrXG4gICAgICAgIHJldHVyblxuICAgIFxuICAgIG5ld1NoYWRlcjogKHNoYWRlckNvZGUsIHBhc3NpZCkgLT5cbiAgICAgICAgY29tbW9uU291cmNlQ29kZXMgPSBbXVxuICAgICAgICBpID0gMFxuICAgICAgICB3aGlsZSBpIDwgQG1QYXNzZXMubGVuZ3RoXG4gICAgICAgICAgICBpZiBAbVBhc3Nlc1tpXS5tVHlwZSA9PSAnY29tbW9uJ1xuICAgICAgICAgICAgICAgIGNvbW1vblNvdXJjZUNvZGVzLnB1c2ggQG1QYXNzZXNbaV0ubVNvdXJjZVxuICAgICAgICAgICAgaSsrXG4gICAgICAgIEBtUGFzc2VzW3Bhc3NpZF0ubmV3U2hhZGVyIHNoYWRlckNvZGUsIGNvbW1vblNvdXJjZUNvZGVzXG4gICAgXG4gICAgZ2V0TnVtUGFzc2VzOiAtPlxuICAgICAgICBAbVBhc3Nlcy5sZW5ndGhcbiAgICBcbiAgICBnZXROdW1PZlR5cGU6IChwYXNzdHlwZSkgLT5cbiAgICAgICAgaWQgPSAwXG4gICAgICAgIGogPSAwXG4gICAgICAgIHdoaWxlIGogPCBAbVBhc3Nlcy5sZW5ndGhcbiAgICAgICAgICAgIGlmIEBtUGFzc2VzW2pdLm1UeXBlID09IHBhc3N0eXBlXG4gICAgICAgICAgICAgICAgaWQrK1xuICAgICAgICAgICAgaisrXG4gICAgICAgIGlkXG4gICAgXG4gICAgZ2V0UGFzc1R5cGU6IChpZCkgLT5cbiAgICAgICAgQG1QYXNzZXNbaWRdLm1UeXBlXG4gICAgXG4gICAgZ2V0UGFzc05hbWU6IChpZCkgLT5cbiAgICAgICAgQG1QYXNzZXNbaWRdLm1OYW1lXG4gICAgXG4gICAgbmV3U2NyaXB0SlNPTjogKHBhc3NlcykgLT5cbiAgICAgICAgbnVtUGFzc2VzID0gcGFzc2VzLmxlbmd0aFxuICAgICAgICBpZiBudW1QYXNzZXMgPCAxIG9yIG51bVBhc3NlcyA+IEBtTWF4UGFzc2VzXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICBtRmFpbGVkOiB0cnVlXG4gICAgICAgICAgICAgICAgbUVycm9yOiAnSW5jb3JyZWN0IG51bWJlciBvZiBwYXNzZXMsIHdyb25nIHNoYWRlciBmb3JtYXQnXG4gICAgICAgICAgICAgICAgbVNoYWRlcjogbnVsbFxuICAgICAgICByZXMgPSBbXVxuICAgICAgICByZXMubUZhaWxlZCA9IGZhbHNlXG4gICAgICAgIGogPSAwXG4gICAgICAgIHdoaWxlIGogPCBudW1QYXNzZXNcbiAgICAgICAgICAgIHJwYXNzID0gcGFzc2VzW2pdXG4gICAgICAgICAgICBAbVBhc3Nlc1tqXSA9IG5ldyBQYXNzIEBtUmVuZGVyZXIsIGosIEBcbiAgICAgICAgICAgIG51bUlucHV0cyA9IHJwYXNzLmlucHV0cy5sZW5ndGhcbiAgICAgICAgICAgIGkgPSAwXG4gICAgICAgICAgICB3aGlsZSBpIDwgNFxuICAgICAgICAgICAgICAgIEBtUGFzc2VzW2pdLm5ld1RleHR1cmUgaVxuICAgICAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgaSA9IDBcbiAgICAgICAgICAgIHdoaWxlIGkgPCBudW1JbnB1dHNcbiAgICAgICAgICAgICAgICBAbVBhc3Nlc1tqXS5uZXdUZXh0dXJlIHJwYXNzLmlucHV0c1tpXS5jaGFubmVsLCBcbiAgICAgICAgICAgICAgICAgICAgbVR5cGU6ICAgICAgcnBhc3MuaW5wdXRzW2ldLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgbUlEOiAgICAgICAgcnBhc3MuaW5wdXRzW2ldLmlkXG4gICAgICAgICAgICAgICAgICAgIG1TcmM6ICAgICAgIHJwYXNzLmlucHV0c1tpXS5maWxlcGF0aFxuICAgICAgICAgICAgICAgICAgICBtU2FtcGxlcjogICBycGFzcy5pbnB1dHNbaV0uc2FtcGxlclxuICAgICAgICAgICAgICAgICwgQG1CdWZmZXJzLCBAbUN1YmVCdWZmZXJzLCBAbUtleWJvYXJkXG4gICAgICAgICAgICAgICAgaSsrXG4gICAgICAgICAgICBpID0gMFxuICAgICAgICAgICAgd2hpbGUgaSA8IDRcbiAgICAgICAgICAgICAgICBAbVBhc3Nlc1tqXS5zZXRPdXRwdXRzIGksIG51bGxcbiAgICAgICAgICAgICAgICBpKytcbiAgICAgICAgICAgIG51bU91dHB1dHMgPSBycGFzcy5vdXRwdXRzLmxlbmd0aFxuICAgICAgICAgICAgaSA9IDBcbiAgICAgICAgICAgIHdoaWxlIGkgPCBudW1PdXRwdXRzXG4gICAgICAgICAgICAgICAgb3V0cHV0SUQgPSBycGFzcy5vdXRwdXRzW2ldLmlkXG4gICAgICAgICAgICAgICAgb3V0cHV0Q0ggPSBycGFzcy5vdXRwdXRzW2ldLmNoYW5uZWxcbiAgICAgICAgICAgICAgICBAbVBhc3Nlc1tqXS5zZXRPdXRwdXRzIG91dHB1dENILCBvdXRwdXRJRFxuICAgICAgICAgICAgICAgIGkrK1xuXG4gICAgICAgICAgICBycGFzc05hbWUgPSBzd2l0Y2ggcnBhc3MudHlwZVxuICAgICAgICAgICAgICAgIHdoZW4gJ2NvbW1vbicgIHRoZW4gJ0NvbW1vbidcbiAgICAgICAgICAgICAgICB3aGVuICdpbWFnZScgICB0aGVuICdJbWFnZSdcbiAgICAgICAgICAgICAgICB3aGVuICdidWZmZXInICB0aGVuICdCdWZmZXIgJyArIFN0cmluZy5mcm9tQ2hhckNvZGUoNjUgKyBhc3NldElEX3RvX2J1ZmZlcklEKEBtUGFzc2VzW2pdLm1PdXRwdXRzWzBdKSlcbiAgICAgICAgICAgICAgICB3aGVuICdjdWJlbWFwJyB0aGVuICdDdWJlIEEnXG4gICAgICAgICAgICBAbVBhc3Nlc1tqXS5jcmVhdGUgcnBhc3MudHlwZSwgcnBhc3NOYW1lXG4gICAgICAgICAgICBqKytcbiAgICAgICAgICAgIFxuICAgICAgICBwdCA9IDBcbiAgICAgICAgd2hpbGUgcHQgPCA1XG4gICAgICAgICAgICBqID0gMFxuICAgICAgICAgICAgd2hpbGUgaiA8IG51bVBhc3Nlc1xuICAgICAgICAgICAgICAgIHJwYXNzID0gcGFzc2VzW2pdXG4gICAgICAgICAgICAgICAgaWYgcHQgPT0gMCBhbmQgcnBhc3MudHlwZSAhPSAnY29tbW9uJ1xuICAgICAgICAgICAgICAgICAgICBqKytcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICBpZiBwdCA9PSAxIGFuZCBycGFzcy50eXBlICE9ICdidWZmZXInXG4gICAgICAgICAgICAgICAgICAgIGorK1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgICAgICAgIGlmIHB0ID09IDIgYW5kIHJwYXNzLnR5cGUgIT0gJ2ltYWdlJ1xuICAgICAgICAgICAgICAgICAgICBqKytcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICBpZiBwdCA9PSA0IGFuZCBycGFzcy50eXBlICE9ICdjdWJlbWFwJ1xuICAgICAgICAgICAgICAgICAgICBqKytcbiAgICAgICAgICAgICAgICAgICAgY29udGludWVcbiAgICAgICAgICAgICAgICBzaGFkZXJTdHIgPSBycGFzcy5jb2RlXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gQG5ld1NoYWRlciBzaGFkZXJTdHIsIGpcbiAgICAgICAgICAgICAgICBpZiByZXN1bHQgIT0gbnVsbFxuICAgICAgICAgICAgICAgICAgICByZXMubUZhaWxlZCA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgcmVzW2pdID1cbiAgICAgICAgICAgICAgICAgICAgICAgIG1GYWlsZWQ6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgIG1FcnJvcjogIHJlc3VsdFxuICAgICAgICAgICAgICAgICAgICAgICAgbVNoYWRlcjogc2hhZGVyU3RyXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICByZXNbal0gPVxuICAgICAgICAgICAgICAgICAgICAgICAgbUZhaWxlZDogZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIG1FcnJvcjogIG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1TaGFkZXI6IHNoYWRlclN0clxuICAgICAgICAgICAgICAgIGorK1xuICAgICAgICAgICAgcHQrK1xuICAgICAgICAgICAgXG4gICAgICAgIHJlc1xuICAgICAgICAiXX0=
//# sourceURL=../../coffee/toy/effect.coffee