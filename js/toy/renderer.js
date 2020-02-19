// koffee 1.7.0
var Renderer;

Renderer = (function() {
    function Renderer(mGL1) {
        var extensions, maxCubeSize, maxRenderbufferSize, maxTexSize, textureUnits, vertices;
        this.mGL = mGL1;
        this.mFloat32Textures = true;
        this.mFloat32Filter = this.mGL.getExtension('OES_texture_float_linear');
        this.mFloat16Textures = true;
        this.mFloat16Filter = this.mGL.getExtension('OES_texture_half_float_linear');
        this.mDerivatives = true;
        this.mDrawBuffers = true;
        this.mDepthTextures = true;
        this.mAnisotropic = this.mGL.getExtension('EXT_texture_filter_anisotropic');
        this.mRenderToFloat32F = this.mGL.getExtension('EXT_color_buffer_float');
        maxTexSize = this.mGL.getParameter(this.mGL.MAX_TEXTURE_SIZE);
        maxCubeSize = this.mGL.getParameter(this.mGL.MAX_CUBE_MAP_TEXTURE_SIZE);
        maxRenderbufferSize = this.mGL.getParameter(this.mGL.MAX_RENDERBUFFER_SIZE);
        extensions = this.mGL.getSupportedExtensions();
        textureUnits = this.mGL.getParameter(this.mGL.MAX_TEXTURE_IMAGE_UNITS);
        console.log('WebGL:' + ' F32 Textures: ' + (this.mFloat32Textures !== null ? 'yes' : 'no') + ', Render to 32F: ' + (this.mRenderToFloat32F !== null ? 'yes' : 'no') + ', Max Texture Size: ' + maxTexSize + ', Max Render Buffer Size: ' + maxRenderbufferSize + ', Max Cubemap Size: ' + maxCubeSize);
        vertices = new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0]);
        this.mVBO_Quad = this.mGL.createBuffer();
        this.mGL.bindBuffer(this.mGL.ARRAY_BUFFER, this.mVBO_Quad);
        this.mGL.bufferData(this.mGL.ARRAY_BUFFER, vertices, this.mGL.STATIC_DRAW);
        this.mGL.bindBuffer(this.mGL.ARRAY_BUFFER, null);
        this.mVBO_Tri = this.mGL.createBuffer();
        this.mGL.bindBuffer(this.mGL.ARRAY_BUFFER, this.mVBO_Tri);
        this.mGL.bufferData(this.mGL.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0]), this.mGL.STATIC_DRAW);
        this.mGL.bindBuffer(this.mGL.ARRAY_BUFFER, null);
        this.mVBO_CubePosNor = this.mGL.createBuffer();
        this.mGL.bindBuffer(this.mGL.ARRAY_BUFFER, this.mVBO_CubePosNor);
        this.mGL.bufferData(this.mGL.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, -1.0, -1.0, 0.0, 0.0, -1.0, -1.0, 1.0, -1.0, 0.0, 0.0, -1.0, 1.0, -1.0, -1.0, 0.0, 0.0, -1.0, 1.0, 1.0, -1.0, 0.0, 0.0, 1.0, 1.0, -1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0, 1.0, -1.0, 0.0, 1.0, 0.0, -1.0, 1.0, 1.0, 0.0, 1.0, 0.0, -1.0, 1.0, -1.0, 0.0, 1.0, 0.0, 1.0, -1.0, -1.0, 0.0, -1.0, 0.0, 1.0, -1.0, 1.0, 0.0, -1.0, 0.0, -1.0, -1.0, -1.0, 0.0, -1.0, 0.0, -1.0, -1.0, 1.0, 0.0, -1.0, 0.0, -1.0, 1.0, 1.0, 0.0, 0.0, 1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, -1.0, 1.0, 0.0, 0.0, 1.0, -1.0, -1.0, -1.0, 0.0, 0.0, -1.0, -1.0, 1.0, -1.0, 0.0, 0.0, -1.0, 1.0, -1.0, -1.0, 0.0, 0.0, -1.0, 1.0, 1.0, -1.0, 0.0, 0.0, -1.0]), this.mGL.STATIC_DRAW);
        this.mGL.bindBuffer(this.mGL.ARRAY_BUFFER, null);
        this.mVBO_CubePos = this.mGL.createBuffer();
        this.mGL.bindBuffer(this.mGL.ARRAY_BUFFER, this.mVBO_CubePos);
        this.mGL.bufferData(this.mGL.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0]), this.mGL.STATIC_DRAW);
        this.mGL.bindBuffer(this.mGL.ARRAY_BUFFER, null);
    }

    Renderer.CLEAR = {
        Color: 1,
        Zbuffer: 2,
        Stencil: 4
    };

    Renderer.TEXFMT = {
        C4I8: 0,
        C1I8: 1,
        C1F16: 2,
        C4F16: 3,
        C1F32: 4,
        C4F32: 5,
        Z16: 6,
        Z24: 7,
        Z32: 8,
        C3F32: 9
    };

    Renderer.TEXWRP = {
        CLAMP: 0,
        REPEAT: 1
    };

    Renderer.BUFTYPE = {
        STATIC: 0,
        DYNAMIC: 1
    };

    Renderer.PRIMTYPE = {
        POINTS: 0,
        LINES: 1,
        LINE_LOOP: 2,
        LINE_STRIP: 3,
        TRIANGLES: 4,
        TRIANGLE_STRIP: 5
    };

    Renderer.RENDSTGATE = {
        WIREFRAME: 0,
        FRONT_FACE: 1,
        CULL_FACE: 2,
        DEPTH_TEST: 3,
        ALPHA_TO_COVERAGE: 4
    };

    Renderer.TEXTYPE = {
        T2D: 0,
        T3D: 1,
        CUBEMAP: 2
    };

    Renderer.FILTER = {
        NONE: 0,
        LINEAR: 1,
        MIPMAP: 2,
        NONE_MIPMAP: 3
    };

    Renderer.TYPE = {
        UINT8: 0,
        UINT16: 1,
        UINT32: 2,
        FLOAT16: 3,
        FLOAT32: 4,
        FLOAT64: 5
    };

    Renderer.prototype.iFormatPI2GL = function(format) {
        switch (format) {
            case Renderer.TEXFMT.C4I8:
                return {
                    mGLFormat: this.mGL.RGBA8,
                    mGLExternal: this.mGL.RGBA,
                    mGLType: this.mGL.UNSIGNED_BYTE
                };
            case Renderer.TEXFMT.C1I8:
                return {
                    mGLFormat: this.mGL.R8,
                    mGLExternal: this.mGL.RED,
                    mGLType: this.mGL.UNSIGNED_BYTE
                };
            case Renderer.TEXFMT.C1F16:
                return {
                    mGLFormat: this.mGL.R16F,
                    mGLExternal: this.mGL.RED,
                    mGLType: this.mGL.FLOAT
                };
            case Renderer.TEXFMT.C4F16:
                return {
                    mGLFormat: this.mGL.RGBA16F,
                    mGLExternal: this.mGL.RGBA,
                    mGLType: this.mGL.FLOAT
                };
            case Renderer.TEXFMT.C1F32:
                return {
                    mGLFormat: this.mGL.R32F,
                    mGLExternal: this.mGL.RED,
                    mGLType: this.mGL.FLOAT
                };
            case Renderer.TEXFMT.C4F32:
                return {
                    mGLFormat: this.mGL.RGBA32F,
                    mGLExternal: this.mGL.RGBA,
                    mGLType: this.mGL.FLOAT
                };
            case Renderer.TEXFMT.C3F32:
                return {
                    mGLFormat: this.mGL.RGB32F,
                    mGLExternal: this.mGL.RGB,
                    mGLType: this.mGL.FLOAT
                };
            case Renderer.TEXFMT.Z16:
                return {
                    mGLFormat: this.mGL.DEPTH_COMPONENT16,
                    mGLExternal: this.mGL.DEPTH_COMPONENT,
                    mGLType: this.mGL.UNSIGNED_SHORT
                };
            case Renderer.TEXFMT.Z24:
                return {
                    mGLFormat: this.mGL.DEPTH_COMPONENT24,
                    mGLExternal: this.mGL.DEPTH_COMPONENT,
                    mGLType: this.mGL.UNSIGNED_SHORT
                };
            case Renderer.TEXFMT.Z32:
                return {
                    mGLFormat: this.mGL.DEPTH_COMPONENT32F,
                    mGLExternal: this.mGL.DEPTH_COMPONENT,
                    mGLType: this.mGL.UNSIGNED_SHORT
                };
            default:
                return null;
        }
    };

    Renderer.prototype.checkErrors = function() {
        var error, prop, results;
        error = this.mGL.getError();
        if (error !== this.mGL.NO_ERROR) {
            results = [];
            for (prop in this.mGL) {
                if (typeof this.mGL[prop] === 'number') {
                    if (this.mGL[prop] === error) {
                        console.log('GL Error ' + error + ': ' + prop);
                        break;
                    } else {
                        results.push(void 0);
                    }
                } else {
                    results.push(void 0);
                }
            }
            return results;
        }
    };

    Renderer.prototype.clear = function(flags, ccolor, cdepth, cstencil) {
        var mode;
        mode = 0;
        if (flags & 1) {
            mode |= this.mGL.COLOR_BUFFER_BIT;
            this.mGL.clearColor(ccolor[0], ccolor[1], ccolor[2], ccolor[3]);
        }
        if (flags & 2) {
            mode |= this.mGL.DEPTH_BUFFER_BIT;
            this.mGL.clearDepth(cdepth);
        }
        if (flags & 4) {
            mode |= this.mGL.STENCIL_BUFFER_BIT;
            this.mGL.clearStencil(cstencil);
        }
        return this.mGL.clear(mode);
    };

    Renderer.prototype.createTexture = function(type, xres, yres, format, filter, wrap, buffer) {
        var glFoTy, glWrap, id;
        if (!this.mGL) {
            return;
        }
        id = this.mGL.createTexture();
        glFoTy = this.iFormatPI2GL(format);
        glWrap = this.mGL.REPEAT;
        if (wrap === Renderer.TEXWRP.CLAMP) {
            glWrap = this.mGL.CLAMP_TO_EDGE;
        }
        if (type === Renderer.TEXTYPE.T2D) {
            this.mGL.bindTexture(this.mGL.TEXTURE_2D, id);
            this.mGL.texImage2D(this.mGL.TEXTURE_2D, 0, glFoTy.mGLFormat, xres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer);
            this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_WRAP_S, glWrap);
            this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_WRAP_T, glWrap);
            if (filter === Renderer.FILTER.NONE) {
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MAG_FILTER, this.mGL.NEAREST);
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MIN_FILTER, this.mGL.NEAREST);
            } else if (filter === Renderer.FILTER.LINEAR) {
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MAG_FILTER, this.mGL.LINEAR);
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MIN_FILTER, this.mGL.LINEAR);
            } else if (filter === Renderer.FILTER.MIPMAP) {
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MAG_FILTER, this.mGL.LINEAR);
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MIN_FILTER, this.mGL.LINEAR_MIPMAP_LINEAR);
                this.mGL.generateMipmap(this.mGL.TEXTURE_2D);
            } else {
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MAG_FILTER, this.mGL.NEAREST);
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MIN_FILTER, this.mGL.NEAREST_MIPMAP_LINEAR);
                this.mGL.generateMipmap(this.mGL.TEXTURE_2D);
            }
            this.mGL.bindTexture(this.mGL.TEXTURE_2D, null);
        } else if (type === Renderer.TEXTYPE.T3D) {
            this.mGL.bindTexture(this.mGL.TEXTURE_3D, id);
            this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_BASE_LEVEL, 0);
            this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_MAX_LEVEL, Math.log2(xres));
            if (filter === Renderer.FILTER.NONE) {
                this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_MAG_FILTER, this.mGL.NEAREST);
                this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_MIN_FILTER, this.mGL.NEAREST);
            } else if (filter === Renderer.FILTER.LINEAR) {
                this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_MAG_FILTER, this.mGL.LINEAR);
                this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_MIN_FILTER, this.mGL.LINEAR);
            } else if (filter === Renderer.FILTER.MIPMAP) {
                this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_MAG_FILTER, this.mGL.LINEAR);
                this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_MIN_FILTER, this.mGL.LINEAR_MIPMAP_LINEAR);
            } else {
                this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_MAG_FILTER, this.mGL.NEAREST);
                this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_MIN_FILTER, this.mGL.NEAREST_MIPMAP_LINEAR);
                this.mGL.generateMipmap(this.mGL.TEXTURE_3D);
            }
            this.mGL.texImage3D(this.mGL.TEXTURE_3D, 0, glFoTy.mGLFormat, xres, yres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer);
            this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_WRAP_R, glWrap);
            this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_WRAP_S, glWrap);
            this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_WRAP_T, glWrap);
            if (filter === Renderer.FILTER.MIPMAP) {
                this.mGL.generateMipmap(this.mGL.TEXTURE_3D);
            }
            this.mGL.bindTexture(this.mGL.TEXTURE_3D, null);
        } else {
            this.mGL.bindTexture(this.mGL.TEXTURE_CUBE_MAP, id);
            this.mGL.texImage2D(this.mGL.TEXTURE_CUBE_MAP_POSITIVE_X, 0, glFoTy.mGLFormat, xres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer);
            this.mGL.texImage2D(this.mGL.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, glFoTy.mGLFormat, xres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer);
            this.mGL.texImage2D(this.mGL.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, glFoTy.mGLFormat, xres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer);
            this.mGL.texImage2D(this.mGL.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, glFoTy.mGLFormat, xres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer);
            this.mGL.texImage2D(this.mGL.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, glFoTy.mGLFormat, xres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer);
            this.mGL.texImage2D(this.mGL.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, glFoTy.mGLFormat, xres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer);
            if (filter === Renderer.FILTER.NONE) {
                this.mGL.texParameteri(this.mGL.TEXTURE_CUBE_MAP, this.mGL.TEXTURE_MAG_FILTER, this.mGL.NEAREST);
                this.mGL.texParameteri(this.mGL.TEXTURE_CUBE_MAP, this.mGL.TEXTURE_MIN_FILTER, this.mGL.NEAREST);
            } else if (filter === Renderer.FILTER.LINEAR) {
                this.mGL.texParameteri(this.mGL.TEXTURE_CUBE_MAP, this.mGL.TEXTURE_MAG_FILTER, this.mGL.LINEAR);
                this.mGL.texParameteri(this.mGL.TEXTURE_CUBE_MAP, this.mGL.TEXTURE_MIN_FILTER, this.mGL.LINEAR);
            } else if (filter === Renderer.FILTER.MIPMAP) {
                this.mGL.texParameteri(this.mGL.TEXTURE_CUBE_MAP, this.mGL.TEXTURE_MAG_FILTER, this.mGL.LINEAR);
                this.mGL.texParameteri(this.mGL.TEXTURE_CUBE_MAP, this.mGL.TEXTURE_MIN_FILTER, this.mGL.LINEAR_MIPMAP_LINEAR);
            }
            if (filter === Renderer.FILTER.MIPMAP) {
                this.mGL.generateMipmap(this.mGL.TEXTURE_CUBE_MAP);
            }
            this.mGL.bindTexture(this.mGL.TEXTURE_CUBE_MAP, null);
        }
        return {
            mObjectID: id,
            mXres: xres,
            mYres: yres,
            mFormat: format,
            mType: type,
            mFilter: filter,
            mWrap: wrap,
            mVFlip: false
        };
    };

    Renderer.prototype.createTextureFromImage = function(type, image, format, filter, wrap, flipY) {
        var glFoTy, glWrap, id;
        if (this.mGL === null) {
            return null;
        }
        id = this.mGL.createTexture();
        glFoTy = this.iFormatPI2GL(format);
        glWrap = this.mGL.REPEAT;
        if (wrap === Renderer.TEXWRP.CLAMP) {
            glWrap = this.mGL.CLAMP_TO_EDGE;
        }
        if (type === Renderer.TEXTYPE.T2D) {
            this.mGL.bindTexture(this.mGL.TEXTURE_2D, id);
            this.mGL.pixelStorei(this.mGL.UNPACK_FLIP_Y_WEBGL, flipY);
            this.mGL.pixelStorei(this.mGL.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            this.mGL.pixelStorei(this.mGL.UNPACK_COLORSPACE_CONVERSION_WEBGL, this.mGL.NONE);
            this.mGL.texImage2D(this.mGL.TEXTURE_2D, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image);
            this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_WRAP_S, glWrap);
            this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_WRAP_T, glWrap);
            if (filter === Renderer.FILTER.NONE) {
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MAG_FILTER, this.mGL.NEAREST);
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MIN_FILTER, this.mGL.NEAREST);
            } else if (filter === Renderer.FILTER.LINEAR) {
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MAG_FILTER, this.mGL.LINEAR);
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MIN_FILTER, this.mGL.LINEAR);
            } else if (filter === Renderer.FILTER.MIPMAP) {
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MAG_FILTER, this.mGL.LINEAR);
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MIN_FILTER, this.mGL.LINEAR_MIPMAP_LINEAR);
                this.mGL.generateMipmap(this.mGL.TEXTURE_2D);
            } else {
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MAG_FILTER, this.mGL.LINEAR);
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MIN_FILTER, this.mGL.NEAREST_MIPMAP_LINEAR);
                this.mGL.generateMipmap(this.mGL.TEXTURE_2D);
            }
            this.mGL.bindTexture(this.mGL.TEXTURE_2D, null);
        } else if (type === Renderer.TEXTYPE.T3D) {
            return null;
        } else {
            this.mGL.bindTexture(this.mGL.TEXTURE_CUBE_MAP, id);
            this.mGL.pixelStorei(this.mGL.UNPACK_FLIP_Y_WEBGL, flipY);
            this.mGL.activeTexture(this.mGL.TEXTURE0);
            this.mGL.texImage2D(this.mGL.TEXTURE_CUBE_MAP_POSITIVE_X, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[0]);
            this.mGL.texImage2D(this.mGL.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[1]);
            this.mGL.texImage2D(this.mGL.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, flipY ? image[3] : image[2]);
            this.mGL.texImage2D(this.mGL.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, flipY ? image[2] : image[3]);
            this.mGL.texImage2D(this.mGL.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[4]);
            this.mGL.texImage2D(this.mGL.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[5]);
            if (filter === Renderer.FILTER.NONE) {
                this.mGL.texParameteri(this.mGL.TEXTURE_CUBE_MAP, this.mGL.TEXTURE_MAG_FILTER, this.mGL.NEAREST);
                this.mGL.texParameteri(this.mGL.TEXTURE_CUBE_MAP, this.mGL.TEXTURE_MIN_FILTER, this.mGL.NEAREST);
            } else if (filter === Renderer.FILTER.LINEAR) {
                this.mGL.texParameteri(this.mGL.TEXTURE_CUBE_MAP, this.mGL.TEXTURE_MAG_FILTER, this.mGL.LINEAR);
                this.mGL.texParameteri(this.mGL.TEXTURE_CUBE_MAP, this.mGL.TEXTURE_MIN_FILTER, this.mGL.LINEAR);
            } else if (filter === Renderer.FILTER.MIPMAP) {
                this.mGL.texParameteri(this.mGL.TEXTURE_CUBE_MAP, this.mGL.TEXTURE_MAG_FILTER, this.mGL.LINEAR);
                this.mGL.texParameteri(this.mGL.TEXTURE_CUBE_MAP, this.mGL.TEXTURE_MIN_FILTER, this.mGL.LINEAR_MIPMAP_LINEAR);
                this.mGL.generateMipmap(this.mGL.TEXTURE_CUBE_MAP);
            }
            this.mGL.bindTexture(this.mGL.TEXTURE_CUBE_MAP, null);
        }
        return {
            mObjectID: id,
            mXres: image.width,
            mYres: image.height,
            mFormat: format,
            mType: type,
            mFilter: filter,
            mWrap: wrap,
            mVFlip: flipY
        };
    };

    Renderer.prototype.setSamplerFilter = function(te, filter, doGenerateMipsIfNeeded) {
        if (te.mFilter === filter) {
            return;
        }
        if (te.mType === Renderer.TEXTYPE.T2D) {
            this.mGL.bindTexture(this.mGL.TEXTURE_2D, te.mObjectID);
            if (filter === Renderer.FILTER.NONE) {
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MAG_FILTER, this.mGL.NEAREST);
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MIN_FILTER, this.mGL.NEAREST);
            } else if (filter === Renderer.FILTER.LINEAR) {
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MAG_FILTER, this.mGL.LINEAR);
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MIN_FILTER, this.mGL.LINEAR);
            } else if (filter === Renderer.FILTER.MIPMAP) {
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MAG_FILTER, this.mGL.LINEAR);
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MIN_FILTER, this.mGL.LINEAR_MIPMAP_LINEAR);
                if (doGenerateMipsIfNeeded) {
                    this.mGL.generateMipmap(this.mGL.TEXTURE_2D);
                }
            } else {
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MAG_FILTER, this.mGL.NEAREST);
                this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_MIN_FILTER, this.mGL.NEAREST_MIPMAP_LINEAR);
                if (doGenerateMipsIfNeeded) {
                    this.mGL.generateMipmap(this.mGL.TEXTURE_2D);
                }
            }
            this.mGL.bindTexture(this.mGL.TEXTURE_2D, null);
        } else if (te.mType === Renderer.TEXTYPE.T3D) {
            this.mGL.bindTexture(this.mGL.TEXTURE_3D, te.mObjectID);
            if (filter === Renderer.FILTER.NONE) {
                this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_MAG_FILTER, this.mGL.NEAREST);
                this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_MIN_FILTER, this.mGL.NEAREST);
            } else if (filter === Renderer.FILTER.LINEAR) {
                this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_MAG_FILTER, this.mGL.LINEAR);
                this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_MIN_FILTER, this.mGL.LINEAR);
            } else if (filter === Renderer.FILTER.MIPMAP) {
                this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_MAG_FILTER, this.mGL.LINEAR);
                this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_MIN_FILTER, this.mGL.LINEAR_MIPMAP_LINEAR);
                if (doGenerateMipsIfNeeded) {
                    this.mGL.generateMipmap(this.mGL.TEXTURE_3D);
                }
            } else {
                this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_MAG_FILTER, this.mGL.NEAREST);
                this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_MIN_FILTER, this.mGL.NEAREST_MIPMAP_LINEAR);
                if (doGenerateMipsIfNeeded) {
                    this.mGL.generateMipmap(this.mGL.TEXTURE_3D);
                }
            }
            this.mGL.bindTexture(this.mGL.TEXTURE_3D, null);
        } else {
            this.mGL.bindTexture(this.mGL.TEXTURE_CUBE_MAP, te.mObjectID);
            if (filter === Renderer.FILTER.NONE) {
                this.mGL.texParameteri(this.mGL.TEXTURE_CUBE_MAP, this.mGL.TEXTURE_MAG_FILTER, this.mGL.NEAREST);
                this.mGL.texParameteri(this.mGL.TEXTURE_CUBE_MAP, this.mGL.TEXTURE_MIN_FILTER, this.mGL.NEAREST);
            } else if (filter === Renderer.FILTER.LINEAR) {
                this.mGL.texParameteri(this.mGL.TEXTURE_CUBE_MAP, this.mGL.TEXTURE_MAG_FILTER, this.mGL.LINEAR);
                this.mGL.texParameteri(this.mGL.TEXTURE_CUBE_MAP, this.mGL.TEXTURE_MIN_FILTER, this.mGL.LINEAR);
            } else if (filter === Renderer.FILTER.MIPMAP) {
                this.mGL.texParameteri(this.mGL.TEXTURE_CUBE_MAP, this.mGL.TEXTURE_MAG_FILTER, this.mGL.LINEAR);
                this.mGL.texParameteri(this.mGL.TEXTURE_CUBE_MAP, this.mGL.TEXTURE_MIN_FILTER, this.mGL.LINEAR_MIPMAP_LINEAR);
                if (doGenerateMipsIfNeeded) {
                    this.mGL.generateMipmap(this.mGL.TEXTURE_CUBE_MAP);
                }
            } else {
                this.mGL.texParameteri(this.mGL.TEXTURE_CUBE_MAP, this.mGL.TEXTURE_MAG_FILTER, this.mGL.NEAREST);
                this.mGL.texParameteri(this.mGL.TEXTURE_CUBE_MAP, this.mGL.TEXTURE_MIN_FILTER, this.mGL.NEAREST_MIPMAP_LINEAR);
                if (doGenerateMipsIfNeeded) {
                    this.mGL.generateMipmap(this.mGL.TEXTURE_CUBE_MAP);
                }
            }
            this.mGL.bindTexture(this.mGL.TEXTURE_CUBE_MAP, null);
        }
        return te.mFilter = filter;
    };

    Renderer.prototype.setSamplerWrap = function(te, wrap) {
        var glWrap, id;
        if (te.mWrap === wrap) {
            return;
        }
        glWrap = this.mGL.REPEAT;
        if (wrap === Renderer.TEXWRP.CLAMP) {
            glWrap = this.mGL.CLAMP_TO_EDGE;
        }
        id = te.mObjectID;
        if (te.mType === Renderer.TEXTYPE.T2D) {
            this.mGL.bindTexture(this.mGL.TEXTURE_2D, id);
            this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_WRAP_S, glWrap);
            this.mGL.texParameteri(this.mGL.TEXTURE_2D, this.mGL.TEXTURE_WRAP_T, glWrap);
            this.mGL.bindTexture(this.mGL.TEXTURE_2D, null);
        } else if (te.mType === Renderer.TEXTYPE.T3D) {
            this.mGL.bindTexture(this.mGL.TEXTURE_3D, id);
            this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_WRAP_R, glWrap);
            this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_WRAP_S, glWrap);
            this.mGL.texParameteri(this.mGL.TEXTURE_3D, this.mGL.TEXTURE_WRAP_T, glWrap);
            this.mGL.bindTexture(this.mGL.TEXTURE_3D, null);
        }
        return te.mWrap = wrap;
    };

    Renderer.prototype.setSamplerVFlip = function(te, vflip, image) {
        var glFoTy, id;
        if (te.mVFlip === vflip) {
            return;
        }
        id = te.mObjectID;
        if (te.mType === Renderer.TEXTYPE.T2D) {
            if (image !== null) {
                this.mGL.activeTexture(this.mGL.TEXTURE0);
                this.mGL.bindTexture(this.mGL.TEXTURE_2D, id);
                this.mGL.pixelStorei(this.mGL.UNPACK_FLIP_Y_WEBGL, vflip);
                glFoTy = this.iFormatPI2GL(te.mFormat);
                this.mGL.texImage2D(this.mGL.TEXTURE_2D, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image);
                this.mGL.bindTexture(this.mGL.TEXTURE_2D, null);
            }
        } else if (te.mType === Renderer.TEXTYPE.CUBEMAP) {
            if (image !== null) {
                glFoTy = this.iFormatPI2GL(te.mFormat);
                this.mGL.activeTexture(this.mGL.TEXTURE0);
                this.mGL.bindTexture(this.mGL.TEXTURE_CUBE_MAP, id);
                this.mGL.pixelStorei(this.mGL.UNPACK_FLIP_Y_WEBGL, vflip);
                this.mGL.texImage2D(this.mGL.TEXTURE_CUBE_MAP_POSITIVE_X, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[0]);
                this.mGL.texImage2D(this.mGL.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[1]);
                this.mGL.texImage2D(this.mGL.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, vflip ? image[3] : image[2]);
                this.mGL.texImage2D(this.mGL.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, vflip ? image[2] : image[3]);
                this.mGL.texImage2D(this.mGL.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[4]);
                this.mGL.texImage2D(this.mGL.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[5]);
                this.mGL.bindTexture(this.mGL.TEXTURE_CUBE_MAP, null);
            }
        }
        return te.mVFlip = vflip;
    };

    Renderer.prototype.createMipmaps = function(te) {
        if (te.mType === Renderer.TEXTYPE.T2D) {
            this.mGL.activeTexture(this.mGL.TEXTURE0);
            this.mGL.bindTexture(this.mGL.TEXTURE_2D, te.mObjectID);
            this.mGL.generateMipmap(this.mGL.TEXTURE_2D);
            return this.mGL.bindTexture(this.mGL.TEXTURE_2D, null);
        } else if (te.mType === Renderer.TEXTYPE.CUBEMAP) {
            this.mGL.activeTexture(this.mGL.TEXTURE0);
            this.mGL.bindTexture(this.mGL.TEXTURE_CUBE_MAP, te.mObjectID);
            this.mGL.generateMipmap(this.mGL.TEXTURE_CUBE_MAP);
            return this.mGL.bindTexture(this.mGL.TEXTURE_CUBE_MAP, null);
        }
    };

    Renderer.prototype.updateTexture = function(tex, x0, y0, xres, yres, buffer) {
        var glFoTy;
        glFoTy = this.iFormatPI2GL(tex.mFormat);
        if (tex.mType === Renderer.TEXTYPE.T2D) {
            this.mGL.activeTexture(this.mGL.TEXTURE0);
            this.mGL.bindTexture(this.mGL.TEXTURE_2D, tex.mObjectID);
            this.mGL.pixelStorei(this.mGL.UNPACK_FLIP_Y_WEBGL, tex.mVFlip);
            this.mGL.texSubImage2D(this.mGL.TEXTURE_2D, 0, x0, y0, xres, yres, glFoTy.mGLExternal, glFoTy.mGLType, buffer);
            return this.mGL.bindTexture(this.mGL.TEXTURE_2D, null);
        }
    };

    Renderer.prototype.updateTextureFromImage = function(tex, image) {
        var glFoTy;
        glFoTy = this.iFormatPI2GL(tex.mFormat);
        if (tex.mType === Renderer.TEXTYPE.T2D) {
            this.mGL.activeTexture(this.mGL.TEXTURE0);
            this.mGL.bindTexture(this.mGL.TEXTURE_2D, tex.mObjectID);
            this.mGL.pixelStorei(this.mGL.UNPACK_FLIP_Y_WEBGL, tex.mVFlip);
            this.mGL.texImage2D(this.mGL.TEXTURE_2D, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image);
            return this.mGL.bindTexture(this.mGL.TEXTURE_2D, null);
        }
    };

    Renderer.prototype.destroyTexture = function(te) {
        return this.mGL.deleteTexture(te.mObjectID);
    };

    Renderer.prototype.attachTextures = function(num, t0, t1, t2, t3) {
        if (num > 0 && t0 !== null) {
            this.mGL.activeTexture(this.mGL.TEXTURE0);
            if (t0.mType === Renderer.TEXTYPE.T2D) {
                this.mGL.bindTexture(this.mGL.TEXTURE_2D, t0.mObjectID);
            } else if (t0.mType === Renderer.TEXTYPE.T3D) {
                this.mGL.bindTexture(this.mGL.TEXTURE_3D, t0.mObjectID);
            } else if (t0.mType === Renderer.TEXTYPE.CUBEMAP) {
                this.mGL.bindTexture(this.mGL.TEXTURE_CUBE_MAP, t0.mObjectID);
            }
        }
        if (num > 1 && t1 !== null) {
            this.mGL.activeTexture(this.mGL.TEXTURE1);
            if (t1.mType === Renderer.TEXTYPE.T2D) {
                this.mGL.bindTexture(this.mGL.TEXTURE_2D, t1.mObjectID);
            } else if (t1.mType === Renderer.TEXTYPE.T3D) {
                this.mGL.bindTexture(this.mGL.TEXTURE_3D, t1.mObjectID);
            } else if (t1.mType === Renderer.TEXTYPE.CUBEMAP) {
                this.mGL.bindTexture(this.mGL.TEXTURE_CUBE_MAP, t1.mObjectID);
            }
        }
        if (num > 2 && t2 !== null) {
            this.mGL.activeTexture(this.mGL.TEXTURE2);
            if (t2.mType === Renderer.TEXTYPE.T2D) {
                this.mGL.bindTexture(this.mGL.TEXTURE_2D, t2.mObjectID);
            } else if (t2.mType === Renderer.TEXTYPE.T3D) {
                this.mGL.bindTexture(this.mGL.TEXTURE_3D, t2.mObjectID);
            } else if (t2.mType === Renderer.TEXTYPE.CUBEMAP) {
                this.mGL.bindTexture(this.mGL.TEXTURE_CUBE_MAP, t2.mObjectID);
            }
        }
        if (num > 3 && t3 !== null) {
            this.mGL.activeTexture(this.mGL.TEXTURE3);
            if (t3.mType === Renderer.TEXTYPE.T2D) {
                this.mGL.bindTexture(this.mGL.TEXTURE_2D, t3.mObjectID);
            } else if (t3.mType === Renderer.TEXTYPE.T3D) {
                this.mGL.bindTexture(this.mGL.TEXTURE_3D, t3.mObjectID);
            } else if (t3.mType === Renderer.TEXTYPE.CUBEMAP) {
                this.mGL.bindTexture(this.mGL.TEXTURE_CUBE_MAP, t3.mObjectID);
            }
        }
    };

    Renderer.prototype.dettachTextures = function() {
        this.mGL.activeTexture(this.mGL.TEXTURE0);
        this.mGL.bindTexture(this.mGL.TEXTURE_2D, null);
        this.mGL.bindTexture(this.mGL.TEXTURE_CUBE_MAP, null);
        this.mGL.activeTexture(this.mGL.TEXTURE1);
        this.mGL.bindTexture(this.mGL.TEXTURE_2D, null);
        this.mGL.bindTexture(this.mGL.TEXTURE_CUBE_MAP, null);
        this.mGL.activeTexture(this.mGL.TEXTURE2);
        this.mGL.bindTexture(this.mGL.TEXTURE_2D, null);
        this.mGL.bindTexture(this.mGL.TEXTURE_CUBE_MAP, null);
        this.mGL.activeTexture(this.mGL.TEXTURE3);
        this.mGL.bindTexture(this.mGL.TEXTURE_2D, null);
        return this.mGL.bindTexture(this.mGL.TEXTURE_CUBE_MAP, null);
    };

    Renderer.prototype.createRenderTarget = function(color0) {
        var id;
        id = this.mGL.createFramebuffer();
        this.mGL.bindFramebuffer(this.mGL.FRAMEBUFFER, id);
        this.mGL.framebufferTexture2D(this.mGL.FRAMEBUFFER, this.mGL.DEPTH_ATTACHMENT, this.mGL.TEXTURE_2D, depth.mObjectID, 0);
        if (color0 !== null) {
            this.mGL.framebufferTexture2D(this.mGL.FRAMEBUFFER, this.mGL.COLOR_ATTACHMENT0, this.mGL.TEXTURE_2D, color0.mObjectID, 0);
        }
        if (this.mGL.checkFramebufferStatus(mGL.FRAMEBUFFER) !== this.mGL.FRAMEBUFFER_COMPLETE) {
            return null;
        }
        this.mGL.bindRenderbuffer(this.mGL.RENDERBUFFER, null);
        this.mGL.bindFramebuffer(this.mGL.FRAMEBUFFER, null);
        return {
            mObjectID: id,
            mTex0: color0
        };
    };

    Renderer.prototype.destroyRenderTarget = function(tex) {
        return this.mGL.deleteFramebuffer(tex.mObjectID);
    };

    Renderer.prototype.setRenderTarget = function(tex) {
        return this.mGL.bindFramebuffer(this.mGL.FRAMEBUFFER, tex != null ? tex.mObjectID : void 0);
    };

    Renderer.prototype.createRenderTargetNew = function(wantColor0, wantZbuffer, xres, yres, samples) {
        var cb, id, zb;
        id = this.mGL.createFramebuffer();
        this.mGL.bindFramebuffer(this.mGL.FRAMEBUFFER, id);
        if (wantZbuffer === true) {
            zb = this.mGL.createRenderbuffer();
            this.mGL.bindRenderbuffer(this.mGL.RENDERBUFFER, zb);
            if (samples === 1) {
                this.mGL.renderbufferStorage(this.mGL.RENDERBUFFER, this.mGL.DEPTH_COMPONENT16, xres, yres);
            } else {
                this.mGL.renderbufferStorageMultisample(this.mGL.RENDERBUFFER, samples, this.mGL.DEPTH_COMPONENT16, xres, yres);
            }
            this.mGL.framebufferRenderbuffer(this.mGL.FRAMEBUFFER, this.mGL.DEPTH_ATTACHMENT, this.mGL.RENDERBUFFER, zb);
        }
        if (wantColor0) {
            cb = this.mGL.createRenderbuffer();
            this.mGL.bindRenderbuffer(this.mGL.RENDERBUFFER, cb);
            if (samples === 1) {
                this.mGL.renderbufferStorage(this.mGL.RENDERBUFFER, this.mGL.RGBA8, xres, yres);
            } else {
                this.mGL.renderbufferStorageMultisample(this.mGL.RENDERBUFFER, samples, this.mGL.RGBA8, xres, yres);
            }
            this.mGL.framebufferRenderbuffer(this.mGL.FRAMEBUFFER, this.mGL.COLOR_ATTACHMENT0, this.mGL.RENDERBUFFER, cb);
        }
        if (this.mGL.checkFramebufferStatus(mGL.FRAMEBUFFER) !== this.mGL.FRAMEBUFFER_COMPLETE) {
            return null;
        }
        this.mGL.bindRenderbuffer(this.mGL.RENDERBUFFER, null);
        this.mGL.bindFramebuffer(this.mGL.FRAMEBUFFER, null);
        return {
            mObjectID: id,
            mXres: xres,
            mYres: yres,
            mTex0: color0
        };
    };

    Renderer.prototype.createRenderTargetCubeMap = function(color0) {
        var id;
        id = this.mGL.createFramebuffer();
        this.mGL.bindFramebuffer(this.mGL.FRAMEBUFFER, id);
        this.mGL.framebufferTexture2D(this.mGL.FRAMEBUFFER, this.mGL.DEPTH_ATTACHMENT, this.mGL.TEXTURE_2D, depth.mObjectID, 0);
        if (color0 !== null) {
            this.mGL.framebufferTexture2D(this.mGL.FRAMEBUFFER, this.mGL.COLOR_ATTACHMENT0, this.mGL.TEXTURE_CUBE_MAP_POSITIVE_X, color0.mObjectID, 0);
        }
        if (this.mGL.checkFramebufferStatus(mGL.FRAMEBUFFER) !== this.mGL.FRAMEBUFFER_COMPLETE) {
            return null;
        }
        this.mGL.bindRenderbuffer(this.mGL.RENDERBUFFER, null);
        this.mGL.bindFramebuffer(this.mGL.FRAMEBUFFER, null);
        return {
            mObjectID: id,
            mTex0: color0
        };
    };

    Renderer.prototype.setRenderTargetCubeMap = function(fbo, face) {
        if (fbo === null) {
            return this.mGL.bindFramebuffer(this.mGL.FRAMEBUFFER, null);
        } else {
            this.mGL.bindFramebuffer(this.mGL.FRAMEBUFFER, fbo.mObjectID);
            return this.mGL.framebufferTexture2D(this.mGL.FRAMEBUFFER, this.mGL.COLOR_ATTACHMENT0, this.mGL.TEXTURE_CUBE_MAP_POSITIVE_X + face, fbo.mTex0.mObjectID, 0);
        }
    };

    Renderer.prototype.blitRenderTarget = function(dst, src) {
        this.mGL.bindFramebuffer(this.mGL.READ_FRAMEBUFFER, src.mObjectID);
        this.mGL.bindFramebuffer(this.mGL.DRAW_FRAMEBUFFER, dst.mObjectID);
        this.mGL.clearBufferfv(this.mGL.COLOR, 0, [0, 0, 0, 1]);
        return this.mGL.blitFramebuffer(0, 0, src.mXres, src.mYres, 0, 0, src.mXres, src.mYres, this.mGL.COLOR_BUFFER_BIT, this.mGL.LINEAR);
    };

    Renderer.prototype.setViewport = function(vp) {
        return this.mGL.viewport(vp[0], vp[1], vp[2], vp[3]);
    };

    Renderer.prototype.setWriteMask = function(c0, c1, c2, c3, z) {
        this.mGL.depthMask(z);
        return this.mGL.colorMask(c0, c0, c0, c0);
    };

    Renderer.prototype.setState = function(stateName, stateValue) {
        if (stateName === Renderer.RENDSTGATE.WIREFRAME) {
            if (stateValue) {
                return this.mGL.polygonMode(this.mGL.FRONT_AND_BACK, this.mGL.LINE);
            } else {
                return this.mGL.polygonMode(this.mGL.FRONT_AND_BACK, this.mGL.FILL);
            }
        } else if (stateName === Renderer.RENDSTGATE.FRONT_FACE) {
            if (stateValue) {
                return this.mGL.cullFace(this.mGL.BACK);
            } else {
                return this.mGL.cullFace(this.mGL.FRONT);
            }
        } else if (stateName === Renderer.RENDSTGATE.CULL_FACE) {
            if (stateValue) {
                return this.mGL.enable(this.mGL.CULL_FACE);
            } else {
                return this.mGL.disable(this.mGL.CULL_FACE);
            }
        } else if (stateName === Renderer.RENDSTGATE.DEPTH_TEST) {
            if (stateValue) {
                return this.mGL.enable(this.mGL.DEPTH_TEST);
            } else {
                return this.mGL.disable(this.mGL.DEPTH_TEST);
            }
        } else if (stateName === Renderer.RENDSTGATE.ALPHA_TO_COVERAGE) {
            if (stateValue) {
                return this.mGL.enable(this.mGL.SAMPLE_ALPHA_TO_COVERAGE);
            } else {
                return this.mGL.disable(this.mGL.SAMPLE_ALPHA_TO_COVERAGE);
            }
        }
    };

    Renderer.prototype.setMultisample = function(v) {
        if (v === true) {
            this.mGL.enable(this.mGL.SAMPLE_COVERAGE);
            return this.mGL.sampleCoverage(1.0, false);
        } else {
            return this.mGL.disable(this.mGL.SAMPLE_COVERAGE);
        }
    };

    Renderer.prototype.createShader = function(vsSource, fsSource) {
        var fs, infoLog, mShaderHeader, te, vs;
        if (this.mGL === null) {
            return {
                mProgram: null,
                mResult: false,
                mInfo: 'No WebGL',
                mHeaderLines: 0
            };
        }
        te = {
            mProgram: null,
            mResult: true,
            mInfo: 'Shader compiled successfully',
            mHeaderLines: 0,
            mErrorType: 0
        };
        vs = this.mGL.createShader(this.mGL.VERTEX_SHADER);
        fs = this.mGL.createShader(this.mGL.FRAGMENT_SHADER);
        mShaderHeader = '#version 300 es\n' + '#ifdef GL_ES\n' + 'precision highp float;\n' + 'precision highp int;\n' + 'precision mediump sampler3D;\n' + '#endif\n';
        this.mGL.shaderSource(vs, mShaderHeader + vsSource);
        this.mGL.shaderSource(fs, mShaderHeader + fsSource);
        this.mGL.compileShader(vs);
        this.mGL.compileShader(fs);
        if (!this.mGL.getShaderParameter(vs, this.mGL.COMPILE_STATUS)) {
            infoLog = this.mGL.getShaderInfoLog(vs);
            te.mInfo = infoLog;
            te.mErrorType = 0;
            te.mResult = false;
            return te;
        }
        if (!this.mGL.getShaderParameter(fs, this.mGL.COMPILE_STATUS)) {
            infoLog = this.mGL.getShaderInfoLog(fs);
            te.mInfo = infoLog;
            te.mErrorType = 1;
            te.mResult = false;
            return te;
        }
        te.mProgram = this.mGL.createProgram();
        this.mGL.attachShader(te.mProgram, vs);
        this.mGL.attachShader(te.mProgram, fs);
        this.mGL.linkProgram(te.mProgram);
        if (!this.mGL.getProgramParameter(te.mProgram, this.mGL.LINK_STATUS)) {
            infoLog = this.mGL.getProgramInfoLog(te.mProgram);
            this.mGL.deleteProgram(te.mProgram);
            te.mInfo = infoLog;
            te.mErrorType = 2;
            te.mResult = false;
        }
        return te;
    };

    Renderer.prototype.attachShader = function(shader) {
        this.mBindedShader = shader;
        return this.mGL.useProgram(shader != null ? shader.mProgram : void 0);
    };

    Renderer.prototype.detachShader = function() {
        return this.mGL.useProgram(null);
    };

    Renderer.prototype.destroyShader = function(tex) {
        return this.mGL.deleteProgram(tex.mProgram);
    };

    Renderer.prototype.getAttribLocation = function(shader, name) {
        return this.mGL.getAttribLocation(shader.mProgram, name);
    };

    Renderer.prototype.setShaderConstantLocation = function(shader, name) {
        return this.mGL.getUniformLocation(shader.mProgram, name);
    };

    Renderer.prototype.setShaderConstant1F_Pos = function(pos, x) {
        this.mGL.uniform1f(pos, x);
        return true;
    };

    Renderer.prototype.setShaderConstant1FV_Pos = function(pos, x) {
        this.mGL.uniform1fv(pos, x);
        return true;
    };

    Renderer.prototype.setShaderConstant1F = function(uname, x) {
        var pos;
        pos = this.mGL.getUniformLocation(this.mBindedShader.mProgram, uname);
        if (pos === null) {
            return false;
        }
        this.mGL.uniform1f(pos, x);
        return true;
    };

    Renderer.prototype.setShaderConstant1I = function(uname, x) {
        var pos;
        pos = this.mGL.getUniformLocation(this.mBindedShader.mProgram, uname);
        if (pos === null) {
            return false;
        }
        this.mGL.uniform1i(pos, x);
        return true;
    };

    Renderer.prototype.setShaderConstant2F = function(uname, x) {
        var pos;
        pos = this.mGL.getUniformLocation(this.mBindedShader.mProgram, uname);
        if (pos === null) {
            return false;
        }
        this.mGL.uniform2fv(pos, x);
        return true;
    };

    Renderer.prototype.setShaderConstant3F = function(uname, x, y, z) {
        var pos;
        pos = this.mGL.getUniformLocation(this.mBindedShader.mProgram, uname);
        if (pos === null) {
            return false;
        }
        this.mGL.uniform3f(pos, x, y, z);
        return true;
    };

    Renderer.prototype.setShaderConstant1FV = function(uname, x) {
        var pos;
        pos = this.mGL.getUniformLocation(this.mBindedShader.mProgram, uname);
        if (pos === null) {
            return false;
        }
        this.mGL.uniform1fv(pos, new Float32Array(x));
        return true;
    };

    Renderer.prototype.setShaderConstant3FV = function(uname, x) {
        var pos;
        pos = this.mGL.getUniformLocation(this.mBindedShader.mProgram, uname);
        if (pos === null) {
            return false;
        }
        this.mGL.uniform3fv(pos, new Float32Array(x));
        return true;
    };

    Renderer.prototype.setShaderConstant4FV = function(uname, x) {
        var pos;
        pos = this.mGL.getUniformLocation(this.mBindedShader.mProgram, uname);
        if (pos === null) {
            return false;
        }
        this.mGL.uniform4fv(pos, new Float32Array(x));
        return true;
    };

    Renderer.prototype.setShaderTextureUnit = function(uname, unit) {
        var pos, program;
        program = this.mBindedShader;
        pos = this.mGL.getUniformLocation(program.mProgram, uname);
        if (pos === null) {
            return false;
        }
        this.mGL.uniform1i(pos, unit);
        return true;
    };

    Renderer.prototype.createVertexArray = function(data, mode) {
        var id;
        id = this.mGL.createBuffer();
        this.mGL.bindBuffer(this.mGL.ARRAY_BUFFER, id);
        if (mode === me.BUFTYPE.STATIC) {
            this.mGL.bufferData(this.mGL.ARRAY_BUFFER, data, this.mGL.STATIC_DRAW);
        } else {
            this.mGL.bufferData(this.mGL.ARRAY_BUFFER, data, this.mGL.DYNAMIC_DRAW);
        }
        return {
            mObject: id
        };
    };

    Renderer.prototype.createIndexArray = function(data, mode) {
        var id;
        id = this.mGL.createBuffer();
        this.mGL.bindBuffer(this.mGL.ELEMENT_ARRAY_BUFFER, id);
        if (mode === me.BUFTYPE.STATIC) {
            this.mGL.bufferData(this.mGL.ELEMENT_ARRAY_BUFFER, data, this.mGL.STATIC_DRAW);
        } else {
            this.mGL.bufferData(this.mGL.ELEMENT_ARRAY_BUFFER, data, this.mGL.DYNAMIC_DRAW);
        }
        return {
            mObject: id
        };
    };

    Renderer.prototype.destroyArray = function(tex) {
        return this.mGL.destroyBuffer(tex.mObject);
    };

    Renderer.prototype.attachVertexArray = function(tex, attribs, pos) {
        var dsize, dtype, i, id, num, offset, results, shader, stride;
        shader = this.mBindedShader;
        this.mGL.bindBuffer(this.mGL.ARRAY_BUFFER, tex.mObject);
        num = attribs.mChannels.length;
        stride = attribs.mStride;
        offset = 0;
        i = 0;
        results = [];
        while (i < num) {
            id = pos[i];
            this.mGL.enableVertexAttribArray(id);
            dtype = this.mGL.FLOAT;
            dsize = 4;
            if (attribs.mChannels[i].mType === me.TYPE.UINT8) {
                dtype = this.mGL.UNSIGNED_BYTE;
                dsize = 1;
            } else if (attribs.mChannels[i].mType === me.TYPE.UINT16) {
                dtype = this.mGL.UNSIGNED_SHORT;
                dsize = 2;
            } else if (attribs.mChannels[i].mType === me.TYPE.FLOAT32) {
                dtype = this.mGL.FLOAT;
                dsize = 4;
            }
            this.mGL.vertexAttribPointer(id, attribs.mChannels[i].mNumComponents, dtype, attribs.mChannels[i].mNormalize, stride, offset);
            offset += attribs.mChannels[i].mNumComponents * dsize;
            results.push(i++);
        }
        return results;
    };

    Renderer.prototype.attachIndexArray = function(tex) {
        return this.mGL.bindBuffer(this.mGL.ELEMENT_ARRAY_BUFFER, tex.mObject);
    };

    Renderer.prototype.detachVertexArray = function(tex, attribs) {
        var i, num;
        num = attribs.mChannels.length;
        i = 0;
        while (i < num) {
            this.mGL.disableVertexAttribArray(i);
            i++;
        }
        return this.mGL.bindBuffer(this.mGL.ARRAY_BUFFER, null);
    };

    Renderer.prototype.detachIndexArray = function(tex) {
        return this.mGL.bindBuffer(this.mGL.ELEMENT_ARRAY_BUFFER, null);
    };

    Renderer.prototype.drawPrimitive = function(typeOfPrimitive, num, useIndexArray, numInstances) {
        var glType;
        glType = this.mGL.POINTS;
        if (typeOfPrimitive === me.PRIMTYPE.POINTS) {
            glType = this.mGL.POINTS;
        }
        if (typeOfPrimitive === me.PRIMTYPE.LINES) {
            glType = this.mGL.LINES;
        }
        if (typeOfPrimitive === me.PRIMTYPE.LINE_LOOP) {
            glType = this.mGL.LINE_LOOP;
        }
        if (typeOfPrimitive === me.PRIMTYPE.LINE_STRIP) {
            glType = this.mGL.LINE_STRIP;
        }
        if (typeOfPrimitive === me.PRIMTYPE.TRIANGLES) {
            glType = this.mGL.TRIANGLES;
        }
        if (typeOfPrimitive === me.PRIMTYPE.TRIANGLE_STRIP) {
            glType = this.mGL.TRIANGLE_STRIP;
        }
        if (numInstances <= 1) {
            if (useIndexArray) {
                return this.mGL.drawElements(glType, num, this.mGL.UNSIGNED_SHORT, 0);
            } else {
                return this.mGL.drawArrays(glType, 0, num);
            }
        } else {
            this.mGL.drawArraysInstanced(glType, 0, num, numInstances);
            return this.mGL.drawElementsInstanced(glType, num, this.mGL.UNSIGNED_SHORT, 0, numInstances);
        }
    };

    Renderer.prototype.drawFullScreenTriangle_XY = function(vpos) {
        this.mGL.bindBuffer(this.mGL.ARRAY_BUFFER, this.mVBO_Tri);
        this.mGL.vertexAttribPointer(vpos, 2, this.mGL.FLOAT, false, 0, 0);
        this.mGL.enableVertexAttribArray(vpos);
        this.mGL.drawArrays(this.mGL.TRIANGLES, 0, 3);
        this.mGL.disableVertexAttribArray(vpos);
        return this.mGL.bindBuffer(this.mGL.ARRAY_BUFFER, null);
    };

    Renderer.prototype.drawUnitQuad_XY = function(vpos) {
        this.mGL.bindBuffer(this.mGL.ARRAY_BUFFER, this.mVBO_Quad);
        this.mGL.vertexAttribPointer(vpos, 2, this.mGL.FLOAT, false, 0, 0);
        this.mGL.enableVertexAttribArray(vpos);
        this.mGL.drawArrays(this.mGL.TRIANGLES, 0, 6);
        this.mGL.disableVertexAttribArray(vpos);
        return this.mGL.bindBuffer(this.mGL.ARRAY_BUFFER, null);
    };

    Renderer.prototype.setBlend = function(enabled) {
        if (enabled) {
            this.mGL.enable(this.mGL.BLEND);
            this.mGL.blendEquationSeparate(this.mGL.FUNC_ADD, this.mGL.FUNC_ADD);
            return this.mGL.blendFuncSeparate(this.mGL.SRC_ALPHA, this.mGL.ONE_MINUS_SRC_ALPHA, this.mGL.ONE, this.mGL.ONE_MINUS_SRC_ALPHA);
        } else {
            return this.mGL.disable(this.mGL.BLEND);
        }
    };

    Renderer.prototype.getPixelData = function(data, offset, xres, yres) {
        return this.mGL.readPixels(0, 0, xres, yres, this.mGL.RGBA, this.mGL.UNSIGNED_BYTE, data, offset);
    };

    Renderer.prototype.getPixelDataRenderTarget = function(obj, data, xres, yres) {
        this.mGL.bindFramebuffer(this.mGL.FRAMEBUFFER, obj.mObjectID);
        this.mGL.readBuffer(this.mGL.COLOR_ATTACHMENT0);
        this.mGL.readPixels(0, 0, xres, yres, this.mGL.RGBA, this.mGL.FLOAT, data, 0);
        return this.mGL.bindFramebuffer(this.mGL.FRAMEBUFFER, null);
    };

    Renderer.createGlContext = function(cv) {
        return cv.getContext('webgl2', {
            alpha: false,
            depth: false,
            stencil: false,
            premultipliedAlpha: false,
            antialias: false,
            preserveDrawingBuffer: false,
            powerPreference: 'high-performance'
        });
    };

    return Renderer;

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFNQSxJQUFBOztBQUFNO0lBRUMsa0JBQUMsSUFBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsTUFBRDtRQUVBLElBQUMsQ0FBQSxnQkFBRCxHQUFvQjtRQUNwQixJQUFDLENBQUEsY0FBRCxHQUFrQixJQUFDLENBQUEsR0FBRyxDQUFDLFlBQUwsQ0FBa0IsMEJBQWxCO1FBQ2xCLElBQUMsQ0FBQSxnQkFBRCxHQUFvQjtRQUNwQixJQUFDLENBQUEsY0FBRCxHQUFrQixJQUFDLENBQUEsR0FBRyxDQUFDLFlBQUwsQ0FBa0IsK0JBQWxCO1FBQ2xCLElBQUMsQ0FBQSxZQUFELEdBQWdCO1FBQ2hCLElBQUMsQ0FBQSxZQUFELEdBQWdCO1FBQ2hCLElBQUMsQ0FBQSxjQUFELEdBQWtCO1FBQ2xCLElBQUMsQ0FBQSxZQUFELEdBQWdCLElBQUMsQ0FBQSxHQUFHLENBQUMsWUFBTCxDQUFrQixnQ0FBbEI7UUFDaEIsSUFBQyxDQUFBLGlCQUFELEdBQXFCLElBQUMsQ0FBQSxHQUFHLENBQUMsWUFBTCxDQUFrQix3QkFBbEI7UUFDckIsVUFBQSxHQUFhLElBQUMsQ0FBQSxHQUFHLENBQUMsWUFBTCxDQUFrQixJQUFDLENBQUEsR0FBRyxDQUFDLGdCQUF2QjtRQUNiLFdBQUEsR0FBYyxJQUFDLENBQUEsR0FBRyxDQUFDLFlBQUwsQ0FBa0IsSUFBQyxDQUFBLEdBQUcsQ0FBQyx5QkFBdkI7UUFDZCxtQkFBQSxHQUFzQixJQUFDLENBQUEsR0FBRyxDQUFDLFlBQUwsQ0FBa0IsSUFBQyxDQUFBLEdBQUcsQ0FBQyxxQkFBdkI7UUFDdEIsVUFBQSxHQUFhLElBQUMsQ0FBQSxHQUFHLENBQUMsc0JBQUwsQ0FBQTtRQUNiLFlBQUEsR0FBZSxJQUFDLENBQUEsR0FBRyxDQUFDLFlBQUwsQ0FBa0IsSUFBQyxDQUFBLEdBQUcsQ0FBQyx1QkFBdkI7UUFDZixPQUFP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V0FBN0YsRUFBMEcsTUFBTSxDQUFDLE9BQWpILEVBQTBILE1BQTFIO1lBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxVQUFMLENBQWdCLElBQUMsQ0FBQSxHQUFHLENBQUMsMkJBQXJCLEVBQWtELENBQWxELEVBQXFELE1BQU0sQ0FBQyxTQUE1RCxFQUF1RSxJQUF2RSxFQUE2RSxJQUE3RSxFQUFtRixDQUFuRixFQUFzRixNQUFNLENBQUMsV0FBN0YsRUFBMEcsTUFBTSxDQUFDLE9BQWpILEVBQTBILE1BQTFIO1lBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxVQUFMLENBQWdCLElBQUMsQ0FBQSxHQUFHLENBQUMsMkJBQXJCLEVBQWtELENBQWxELEVBQXFELE1BQU0sQ0FBQyxTQUE1RCxFQUF1RSxJQUF2RSxFQUE2RSxJQUE3RSxFQUFtRixDQUFuRixFQUFzRixNQUFNLENBQUMsV0FBN0YsRUFBMEcsTUFBTSxDQUFDLE9BQWpILEVBQTBILE1BQTFIO1lBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxVQUFMLENBQWdCLElBQUMsQ0FBQSxHQUFHLENBQUMsMkJBQXJCLEVBQWtELENBQWxELEVBQXFELE1BQU0sQ0FBQyxTQUE1RCxFQUF1RSxJQUF2RSxFQUE2RSxJQUE3RSxFQUFtRixDQUFuRixFQUFzRixNQUFNLENBQUMsV0FBN0YsRUFBMEcsTUFBTSxDQUFDLE9BQWpILEVBQTBILE1BQTFIO1lBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxVQUFMLENBQWdCLElBQUMsQ0FBQSxHQUFHLENBQUMsMkJBQXJCLEVBQWtELENBQWxELEVBQXFELE1BQU0sQ0FBQyxTQUE1RCxFQUF1RSxJQUF2RSxFQUE2RSxJQUE3RSxFQUFtRixDQUFuRixFQUFzRixNQUFNLENBQUMsV0FBN0YsRUFBMEcsTUFBTSxDQUFDLE9BQWpILEVBQTBILE1BQTFIO1lBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxVQUFMLENBQWdCLElBQUMsQ0FBQSxHQUFHLENBQUMsMkJBQXJCLEVBQWtELENBQWxELEVBQXFELE1BQU0sQ0FBQyxTQUE1RCxFQUF1RSxJ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QUFuQixFQUFzQixJQUF0QixFQUE0QixJQUE1QixFQUFrQyxJQUFDLENBQUEsR0FBRyxDQUFDLElBQXZDLEVBQTZDLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBbEQsRUFBeUQsSUFBekQsRUFBK0QsQ0FBL0Q7ZUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLGVBQUwsQ0FBcUIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxXQUExQixFQUF1QyxJQUF2QztJQUpzQjs7SUFNMUIsUUFBQyxDQUFBLGVBQUQsR0FBa0IsU0FBQyxFQUFEO2VBQ2QsRUFBRSxDQUFDLFVBQUgsQ0FBYyxRQUFkLEVBQ0k7WUFBQSxLQUFBLEVBQU8sS0FBUDtZQUNBLEtBQUEsRUFBTyxLQURQO1lBRUEsT0FBQSxFQUFTLEtBRlQ7WUFHQSxrQkFBQSxFQUFvQixLQUhwQjtZQUlBLFNBQUEsRUFBVyxLQUpYO1lBS0EscUJBQUEsRUFBdUIsS0FMdkI7WUFNQSxlQUFBLEVBQWlCLGtCQU5qQjtTQURKO0lBRGMiLCJzb3VyY2VzQ29udGVudCI6WyIjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jIHBpTGlicyAyMDE0LTIwMTcgLSBodHRwOi8vd3d3LmlxdWlsZXpsZXMub3JnL3d3dy9tYXRlcmlhbC9waUxpYnMvcGlMaWJzLmh0bVxuI1xuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5jbGFzcyBSZW5kZXJlciBcbiAgICBcbiAgICBAOiAoQG1HTCkgLT5cblxuICAgICAgICBAbUZsb2F0MzJUZXh0dXJlcyA9IHRydWVcbiAgICAgICAgQG1GbG9hdDMyRmlsdGVyID0gQG1HTC5nZXRFeHRlbnNpb24oJ09FU190ZXh0dXJlX2Zsb2F0X2xpbmVhcicpXG4gICAgICAgIEBtRmxvYXQxNlRleHR1cmVzID0gdHJ1ZVxuICAgICAgICBAbUZsb2F0MTZGaWx0ZXIgPSBAbUdMLmdldEV4dGVuc2lvbignT0VTX3RleHR1cmVfaGFsZl9mbG9hdF9saW5lYXInKVxuICAgICAgICBAbURlcml2YXRpdmVzID0gdHJ1ZVxuICAgICAgICBAbURyYXdCdWZmZXJzID0gdHJ1ZVxuICAgICAgICBAbURlcHRoVGV4dHVyZXMgPSB0cnVlXG4gICAgICAgIEBtQW5pc290cm9waWMgPSBAbUdMLmdldEV4dGVuc2lvbignRVhUX3RleHR1cmVfZmlsdGVyX2FuaXNvdHJvcGljJylcbiAgICAgICAgQG1SZW5kZXJUb0Zsb2F0MzJGID0gQG1HTC5nZXRFeHRlbnNpb24oJ0VYVF9jb2xvcl9idWZmZXJfZmxvYXQnKVxuICAgICAgICBtYXhUZXhTaXplID0gQG1HTC5nZXRQYXJhbWV0ZXIoQG1HTC5NQVhfVEVYVFVSRV9TSVpFKVxuICAgICAgICBtYXhDdWJlU2l6ZSA9IEBtR0wuZ2V0UGFyYW1ldGVyKEBtR0wuTUFYX0NVQkVfTUFQX1RFWFRVUkVfU0laRSlcbiAgICAgICAgbWF4UmVuZGVyYnVmZmVyU2l6ZSA9IEBtR0wuZ2V0UGFyYW1ldGVyKEBtR0wuTUFYX1JFTkRFUkJVRkZFUl9TSVpFKVxuICAgICAgICBleHRlbnNpb25zID0gQG1HTC5nZXRTdXBwb3J0ZWRFeHRlbnNpb25zKClcbiAgICAgICAgdGV4dHVyZVVuaXRzID0gQG1HTC5nZXRQYXJhbWV0ZXIoQG1HTC5NQVhfVEVYVFVSRV9JTUFHRV9VTklUUylcbiAgICAgICAgY29uc29sZS5sb2cgJ1dlYkdMOicgKyAnIEYzMiBUZXh0dXJlczogJyArIChpZiBAbUZsb2F0MzJUZXh0dXJlcyAhPSBudWxsIHRoZW4gJ3llcycgZWxzZSAnbm8nKSArICcsIFJlbmRlciB0byAzMkY6ICcgKyAoaWYgQG1SZW5kZXJUb0Zsb2F0MzJGICE9IG51bGwgdGhlbiAneWVzJyBlbHNlICdubycpICsgJywgTWF4IFRleHR1cmUgU2l6ZTogJyArIG1heFRleFNpemUgKyAnLCBNYXggUmVuZGVyIEJ1ZmZlciBTaXplOiAnICsgbWF4UmVuZGVyYnVmZmVyU2l6ZSArICcsIE1heCBDdWJlbWFwIFNpemU6ICcgKyBtYXhDdWJlU2l6ZVxuXG4gICAgICAgIHZlcnRpY2VzID0gbmV3IEZsb2F0MzJBcnJheSBbIC0xLjAgLTEuMCAxLjAgLTEuMCAtMS4wIDEuMCAxLjAgLTEuMCAxLjAgMS4wIC0xLjAgMS4wIF1cbiAgICAgICAgQG1WQk9fUXVhZCA9IEBtR0wuY3JlYXRlQnVmZmVyKClcbiAgICAgICAgQG1HTC5iaW5kQnVmZmVyIEBtR0wuQVJSQVlfQlVGRkVSLCBAbVZCT19RdWFkXG4gICAgICAgIEBtR0wuYnVmZmVyRGF0YSBAbUdMLkFSUkFZX0JVRkZFUiwgdmVydGljZXMsIEBtR0wuU1RBVElDX0RSQVdcbiAgICAgICAgQG1HTC5iaW5kQnVmZmVyIEBtR0wuQVJSQVlfQlVGRkVSLCBudWxsXG4gICAgICAgICMgY3JlYXRlIGEgMkQgdHJpYW5nbGUgVmVydGV4IEJ1ZmZlclxuICAgICAgICBAbVZCT19UcmkgPSBAbUdMLmNyZWF0ZUJ1ZmZlcigpXG4gICAgICAgIEBtR0wuYmluZEJ1ZmZlciBAbUdMLkFSUkFZX0JVRkZFUiwgQG1WQk9fVHJpXG4gICAgICAgIEBtR0wuYnVmZmVyRGF0YSBAbUdMLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShbIC0xLjAgLTEuMCAzLjAgLTEuMCAtMS4wIDMuMCBdKSwgQG1HTC5TVEFUSUNfRFJBV1xuICAgICAgICBAbUdMLmJpbmRCdWZmZXIgQG1HTC5BUlJBWV9CVUZGRVIsIG51bGxcbiAgICAgICAgIyBjcmVhdGUgYSAzRCBjdWJlIFZlcnRleCBCdWZmZXJcbiAgICAgICAgQG1WQk9fQ3ViZVBvc05vciA9IEBtR0wuY3JlYXRlQnVmZmVyKClcbiAgICAgICAgQG1HTC5iaW5kQnVmZmVyIEBtR0wuQVJSQVlfQlVGRkVSLCBAbVZCT19DdWJlUG9zTm9yXG4gICAgICAgIEBtR0wuYnVmZmVyRGF0YSBAbUdMLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShbXG4gICAgICAgICAgICAtMS4wIC0xLjAgLTEuMCAtMS4wIDAuMCAwLjAgLTEuMCAtMS4wIDEuMCAtMS4wIDAuMCAwLjAgLTEuMCAxLjAgLTEuMCAtMS4wIDAuMCAwLjAgLTEuMCAxLjAgMS4wIC0xLjAgMC4wIDAuMCAxLjAgMS4wIC0xLjAgMS4wIDAuMCAwLjAgMS4wXG4gICAgICAgICAgICAxLjAgMS4wIDEuMCAwLjAgMC4wIDEuMCAtMS4wIC0xLjAgMS4wIDAuMCAwLjAgMS4wIC0xLjAgMS4wIDEuMCAwLjAgMC4wIDEuMCAxLjAgMS4wIDAuMCAxLjAgMC4wIDEuMCAxLjAgLTEuMCAwLjAgMS4wXG4gICAgICAgICAgICAwLjAgLTEuMCAxLjAgMS4wIDAuMCAxLjAgMC4wIC0xLjAgMS4wIC0xLjAgMC4wIDEuMCAwLjAgMS4wIC0xLjAgLTEuMCAwLjAgLTEuMCAwLjAgMS4wIC0xLjAgMS4wIDAuMCAtMS4wIDAuMCAtMS4wIC0xLjBcbiAgICAgICAgICAgIC0xLjAgMC4wIC0xLjAgMC4wIC0xLjAgLTEuMCAxLjAgMC4wIC0xLjAgMC4wIC0xLjAgMS4wIDEuMCAwLjAgMC4wIDEuMCAtMS4wIC0xLjAgMS4wIDAuMCAwLjAgMS4wIDEuMCAxLjAgMS4wIDAuMCAwLjAgMS4wXG4gICAgICAgICAgICAxLjAgLTEuMCAxLjAgMC4wIDAuMCAxLjAgLTEuMCAtMS4wIC0xLjAgMC4wIDAuMCAtMS4wIC0xLjAgMS4wIC0xLjAgMC4wIDAuMCAtMS4wIDEuMCAtMS4wIC0xLjAgMC4wIDAuMCAtMS4wIDEuMCAxLjAgLTEuMCAwLjAgMC4wIC0xLjBcbiAgICAgICAgXSksIEBtR0wuU1RBVElDX0RSQVdcbiAgICAgICAgQG1HTC5iaW5kQnVmZmVyIEBtR0wuQVJSQVlfQlVGRkVSLCBudWxsXG4gICAgICAgIEBtVkJPX0N1YmVQb3MgPSBAbUdMLmNyZWF0ZUJ1ZmZlcigpXG4gICAgICAgIEBtR0wuYmluZEJ1ZmZlciBAbUdMLkFSUkFZX0JVRkZFUiwgQG1WQk9fQ3ViZVBvc1xuICAgICAgICBAbUdMLmJ1ZmZlckRhdGEgQG1HTC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoW1xuICAgICAgICAgICAgLTEuMCAtMS4wIC0xLjAgLTEuMCAtMS4wIDEuMCAtMS4wIDEuMCAtMS4wIC0xLjAgMS4wIDEuMCAxLjAgMS4wIC0xLjAgMS4wIDEuMCAxLjAgMS4wIC0xLjAgLTEuMCAxLjAgLTEuMCAxLjAgMS4wIDEuMCAxLjAgMS4wXG4gICAgICAgICAgICAxLjAgLTEuMCAtMS4wIDEuMCAxLjAgLTEuMCAxLjAgLTEuMCAxLjAgLTEuMCAtMS4wIDEuMCAtMS4wIDEuMCAtMS4wIC0xLjAgLTEuMCAtMS4wIC0xLjAgMS4wIC0xLjAgMS4wIDEuMCAtMS4wIC0xLjAgMS4wIDEuMCAxLjBcbiAgICAgICAgICAgIDEuMCAxLjAgLTEuMCAxLjAgLTEuMCAtMS4wIC0xLjAgLTEuMCAxLjAgLTEuMCAxLjAgLTEuMCAtMS4wIDEuMCAxLjAgLTEuMFxuICAgICAgICBdKSwgQG1HTC5TVEFUSUNfRFJBV1xuICAgICAgICBAbUdMLmJpbmRCdWZmZXIgQG1HTC5BUlJBWV9CVUZGRVIsIG51bGxcblxuICAgIEBDTEVBUiAgICAgID0gQ29sb3I6MSBaYnVmZmVyOjIgU3RlbmNpbDo0XG4gICAgQFRFWEZNVCAgICAgPSBDNEk4OjAgQzFJODoxIEMxRjE2OjIgQzRGMTY6MyBDMUYzMjo0IEM0RjMyOjUgWjE2OjYgWjI0OjcgWjMyOjggQzNGMzI6OVxuICAgIEBURVhXUlAgICAgID0gQ0xBTVA6MCBSRVBFQVQ6MVxuICAgIEBCVUZUWVBFICAgID0gU1RBVElDOjAgRFlOQU1JQzoxXG4gICAgQFBSSU1UWVBFICAgPSBQT0lOVFM6MCBMSU5FUzoxIExJTkVfTE9PUDoyIExJTkVfU1RSSVA6MyBUUklBTkdMRVM6NCBUUklBTkdMRV9TVFJJUDo1XG4gICAgQFJFTkRTVEdBVEUgPSBXSVJFRlJBTUU6MCBGUk9OVF9GQUNFOjEgQ1VMTF9GQUNFOjIgREVQVEhfVEVTVDozIEFMUEhBX1RPX0NPVkVSQUdFOjRcbiAgICBAVEVYVFlQRSAgICA9IFQyRDowIFQzRDoxIENVQkVNQVA6MlxuICAgIEBGSUxURVIgICAgID0gTk9ORTowIExJTkVBUjoxIE1JUE1BUDoyIE5PTkVfTUlQTUFQOjNcbiAgICBAVFlQRSAgICAgICA9IFVJTlQ4OjAgVUlOVDE2OjEgVUlOVDMyOjIgRkxPQVQxNjozIEZMT0FUMzI6NCBGTE9BVDY0OjVcblxuICAgIGlGb3JtYXRQSTJHTDogKGZvcm1hdCkgLT5cbiAgICAgICAgcmV0dXJuIHN3aXRjaCBmb3JtYXRcbiAgICAgICAgICAgIHdoZW4gUmVuZGVyZXIuVEVYRk1ULkM0SThcbiAgICAgICAgICAgICAgICAgICAgbUdMRm9ybWF0OiAgIEBtR0wuUkdCQThcbiAgICAgICAgICAgICAgICAgICAgbUdMRXh0ZXJuYWw6IEBtR0wuUkdCQVxuICAgICAgICAgICAgICAgICAgICBtR0xUeXBlOiAgICAgQG1HTC5VTlNJR05FRF9CWVRFXG4gICAgICAgICAgICB3aGVuIFJlbmRlcmVyLlRFWEZNVC5DMUk4XG4gICAgICAgICAgICAgICAgICAgIG1HTEZvcm1hdDogQG1HTC5SOFxuICAgICAgICAgICAgICAgICAgICBtR0xFeHRlcm5hbDogQG1HTC5SRURcbiAgICAgICAgICAgICAgICAgICAgbUdMVHlwZTogQG1HTC5VTlNJR05FRF9CWVRFXG4gICAgICAgICAgICB3aGVuIFJlbmRlcmVyLlRFWEZNVC5DMUYxNlxuICAgICAgICAgICAgICAgICAgICBtR0xGb3JtYXQ6IEBtR0wuUjE2RlxuICAgICAgICAgICAgICAgICAgICBtR0xFeHRlcm5hbDogQG1HTC5SRURcbiAgICAgICAgICAgICAgICAgICAgbUdMVHlwZTogQG1HTC5GTE9BVFxuICAgICAgICAgICAgd2hlbiBSZW5kZXJlci5URVhGTVQuQzRGMTZcbiAgICAgICAgICAgICAgICAgICAgbUdMRm9ybWF0OiBAbUdMLlJHQkExNkZcbiAgICAgICAgICAgICAgICAgICAgbUdMRXh0ZXJuYWw6IEBtR0wuUkdCQVxuICAgICAgICAgICAgICAgICAgICBtR0xUeXBlOiBAbUdMLkZMT0FUXG4gICAgICAgICAgICB3aGVuIFJlbmRlcmVyLlRFWEZNVC5DMUYzMlxuICAgICAgICAgICAgICAgICAgICBtR0xGb3JtYXQ6IEBtR0wuUjMyRlxuICAgICAgICAgICAgICAgICAgICBtR0xFeHRlcm5hbDogQG1HTC5SRURcbiAgICAgICAgICAgICAgICAgICAgbUdMVHlwZTogQG1HTC5GTE9BVFxuICAgICAgICAgICAgd2hlbiBSZW5kZXJlci5URVhGTVQuQzRGMzJcbiAgICAgICAgICAgICAgICAgICAgbUdMRm9ybWF0OiBAbUdMLlJHQkEzMkZcbiAgICAgICAgICAgICAgICAgICAgbUdMRXh0ZXJuYWw6IEBtR0wuUkdCQVxuICAgICAgICAgICAgICAgICAgICBtR0xUeXBlOiBAbUdMLkZMT0FUXG4gICAgICAgICAgICB3aGVuIFJlbmRlcmVyLlRFWEZNVC5DM0YzMlxuICAgICAgICAgICAgICAgICAgICBtR0xGb3JtYXQ6IEBtR0wuUkdCMzJGXG4gICAgICAgICAgICAgICAgICAgIG1HTEV4dGVybmFsOiBAbUdMLlJHQlxuICAgICAgICAgICAgICAgICAgICBtR0xUeXBlOiBAbUdMLkZMT0FUXG4gICAgICAgICAgICB3aGVuIFJlbmRlcmVyLlRFWEZNVC5aMTZcbiAgICAgICAgICAgICAgICAgICAgbUdMRm9ybWF0OiBAbUdMLkRFUFRIX0NPTVBPTkVOVDE2XG4gICAgICAgICAgICAgICAgICAgIG1HTEV4dGVybmFsOiBAbUdMLkRFUFRIX0NPTVBPTkVOVFxuICAgICAgICAgICAgICAgICAgICBtR0xUeXBlOiBAbUdMLlVOU0lHTkVEX1NIT1JUXG4gICAgICAgICAgICB3aGVuIFJlbmRlcmVyLlRFWEZNVC5aMjRcbiAgICAgICAgICAgICAgICAgICAgbUdMRm9ybWF0OiBAbUdMLkRFUFRIX0NPTVBPTkVOVDI0XG4gICAgICAgICAgICAgICAgICAgIG1HTEV4dGVybmFsOiBAbUdMLkRFUFRIX0NPTVBPTkVOVFxuICAgICAgICAgICAgICAgICAgICBtR0xUeXBlOiBAbUdMLlVOU0lHTkVEX1NIT1JUXG4gICAgICAgICAgICB3aGVuIFJlbmRlcmVyLlRFWEZNVC5aMzJcbiAgICAgICAgICAgICAgICAgICAgbUdMRm9ybWF0OiBAbUdMLkRFUFRIX0NPTVBPTkVOVDMyRlxuICAgICAgICAgICAgICAgICAgICBtR0xFeHRlcm5hbDogQG1HTC5ERVBUSF9DT01QT05FTlRcbiAgICAgICAgICAgICAgICAgICAgbUdMVHlwZTogQG1HTC5VTlNJR05FRF9TSE9SVFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG51bGxcblxuICAgIGNoZWNrRXJyb3JzOiAtPlxuICAgICAgICBlcnJvciA9IEBtR0wuZ2V0RXJyb3IoKVxuICAgICAgICBpZiBlcnJvciAhPSBAbUdMLk5PX0VSUk9SXG4gICAgICAgICAgICBmb3IgcHJvcCBvZiBAbUdMXG4gICAgICAgICAgICAgICAgaWYgdHlwZW9mIEBtR0xbcHJvcF0gPT0gJ251bWJlcidcbiAgICAgICAgICAgICAgICAgICAgaWYgQG1HTFtwcm9wXSA9PSBlcnJvclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgJ0dMIEVycm9yICcgKyBlcnJvciArICc6ICcgKyBwcm9wXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuXG4gICAgY2xlYXI6IChmbGFncywgY2NvbG9yLCBjZGVwdGgsIGNzdGVuY2lsKSAtPlxuICAgICAgICBtb2RlID0gMFxuICAgICAgICBpZiBmbGFncyAmIDFcbiAgICAgICAgICAgIG1vZGUgfD0gQG1HTC5DT0xPUl9CVUZGRVJfQklUXG4gICAgICAgICAgICBAbUdMLmNsZWFyQ29sb3IgY2NvbG9yWzBdLCBjY29sb3JbMV0sIGNjb2xvclsyXSwgY2NvbG9yWzNdXG4gICAgICAgIGlmIGZsYWdzICYgMlxuICAgICAgICAgICAgbW9kZSB8PSBAbUdMLkRFUFRIX0JVRkZFUl9CSVRcbiAgICAgICAgICAgIEBtR0wuY2xlYXJEZXB0aCBjZGVwdGhcbiAgICAgICAgaWYgZmxhZ3MgJiA0XG4gICAgICAgICAgICBtb2RlIHw9IEBtR0wuU1RFTkNJTF9CVUZGRVJfQklUXG4gICAgICAgICAgICBAbUdMLmNsZWFyU3RlbmNpbCBjc3RlbmNpbFxuICAgICAgICBAbUdMLmNsZWFyIG1vZGVcblxuICAgIGNyZWF0ZVRleHR1cmU6ICh0eXBlLCB4cmVzLCB5cmVzLCBmb3JtYXQsIGZpbHRlciwgd3JhcCwgYnVmZmVyKSAtPlxuICAgICAgICBpZiBub3QgQG1HTCB0aGVuIHJldHVyblxuICAgICAgICBpZCA9IEBtR0wuY3JlYXRlVGV4dHVyZSgpXG4gICAgICAgIGdsRm9UeSA9IEBpRm9ybWF0UEkyR0woZm9ybWF0KVxuICAgICAgICBnbFdyYXAgPSBAbUdMLlJFUEVBVFxuICAgICAgICBpZiB3cmFwID09IFJlbmRlcmVyLlRFWFdSUC5DTEFNUFxuICAgICAgICAgICAgZ2xXcmFwID0gQG1HTC5DTEFNUF9UT19FREdFXG4gICAgICAgIGlmIHR5cGUgPT0gUmVuZGVyZXIuVEVYVFlQRS5UMkRcbiAgICAgICAgICAgIEBtR0wuYmluZFRleHR1cmUgQG1HTC5URVhUVVJFXzJELCBpZFxuICAgICAgICAgICAgQG1HTC50ZXhJbWFnZTJEIEBtR0wuVEVYVFVSRV8yRCwgMCwgZ2xGb1R5Lm1HTEZvcm1hdCwgeHJlcywgeXJlcywgMCwgZ2xGb1R5Lm1HTEV4dGVybmFsLCBnbEZvVHkubUdMVHlwZSwgYnVmZmVyXG4gICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzJELCBAbUdMLlRFWFRVUkVfV1JBUF9TLCBnbFdyYXBcbiAgICAgICAgICAgIEBtR0wudGV4UGFyYW1ldGVyaSBAbUdMLlRFWFRVUkVfMkQsIEBtR0wuVEVYVFVSRV9XUkFQX1QsIGdsV3JhcFxuICAgICAgICAgICAgaWYgZmlsdGVyID09IFJlbmRlcmVyLkZJTFRFUi5OT05FXG4gICAgICAgICAgICAgICAgQG1HTC50ZXhQYXJhbWV0ZXJpIEBtR0wuVEVYVFVSRV8yRCwgQG1HTC5URVhUVVJFX01BR19GSUxURVIsIEBtR0wuTkVBUkVTVFxuICAgICAgICAgICAgICAgIEBtR0wudGV4UGFyYW1ldGVyaSBAbUdMLlRFWFRVUkVfMkQsIEBtR0wuVEVYVFVSRV9NSU5fRklMVEVSLCBAbUdMLk5FQVJFU1RcbiAgICAgICAgICAgIGVsc2UgaWYgZmlsdGVyID09IFJlbmRlcmVyLkZJTFRFUi5MSU5FQVJcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzJELCBAbUdMLlRFWFRVUkVfTUFHX0ZJTFRFUiwgQG1HTC5MSU5FQVJcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzJELCBAbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgQG1HTC5MSU5FQVJcbiAgICAgICAgICAgIGVsc2UgaWYgZmlsdGVyID09IFJlbmRlcmVyLkZJTFRFUi5NSVBNQVBcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzJELCBAbUdMLlRFWFRVUkVfTUFHX0ZJTFRFUiwgQG1HTC5MSU5FQVJcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzJELCBAbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgQG1HTC5MSU5FQVJfTUlQTUFQX0xJTkVBUlxuICAgICAgICAgICAgICAgIEBtR0wuZ2VuZXJhdGVNaXBtYXAgQG1HTC5URVhUVVJFXzJEXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQG1HTC50ZXhQYXJhbWV0ZXJpIEBtR0wuVEVYVFVSRV8yRCwgQG1HTC5URVhUVVJFX01BR19GSUxURVIsIEBtR0wuTkVBUkVTVFxuICAgICAgICAgICAgICAgIEBtR0wudGV4UGFyYW1ldGVyaSBAbUdMLlRFWFRVUkVfMkQsIEBtR0wuVEVYVFVSRV9NSU5fRklMVEVSLCBAbUdMLk5FQVJFU1RfTUlQTUFQX0xJTkVBUlxuICAgICAgICAgICAgICAgIEBtR0wuZ2VuZXJhdGVNaXBtYXAgQG1HTC5URVhUVVJFXzJEXG4gICAgICAgICAgICBAbUdMLmJpbmRUZXh0dXJlIEBtR0wuVEVYVFVSRV8yRCwgbnVsbFxuICAgICAgICBlbHNlIGlmIHR5cGUgPT0gUmVuZGVyZXIuVEVYVFlQRS5UM0RcbiAgICAgICAgICAgIEBtR0wuYmluZFRleHR1cmUgQG1HTC5URVhUVVJFXzNELCBpZFxuICAgICAgICAgICAgQG1HTC50ZXhQYXJhbWV0ZXJpIEBtR0wuVEVYVFVSRV8zRCwgQG1HTC5URVhUVVJFX0JBU0VfTEVWRUwsIDBcbiAgICAgICAgICAgIEBtR0wudGV4UGFyYW1ldGVyaSBAbUdMLlRFWFRVUkVfM0QsIEBtR0wuVEVYVFVSRV9NQVhfTEVWRUwsIE1hdGgubG9nMih4cmVzKVxuICAgICAgICAgICAgaWYgZmlsdGVyID09IFJlbmRlcmVyLkZJTFRFUi5OT05FXG4gICAgICAgICAgICAgICAgQG1HTC50ZXhQYXJhbWV0ZXJpIEBtR0wuVEVYVFVSRV8zRCwgQG1HTC5URVhUVVJFX01BR19GSUxURVIsIEBtR0wuTkVBUkVTVFxuICAgICAgICAgICAgICAgIEBtR0wudGV4UGFyYW1ldGVyaSBAbUdMLlRFWFRVUkVfM0QsIEBtR0wuVEVYVFVSRV9NSU5fRklMVEVSLCBAbUdMLk5FQVJFU1RcbiAgICAgICAgICAgIGVsc2UgaWYgZmlsdGVyID09IFJlbmRlcmVyLkZJTFRFUi5MSU5FQVJcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzNELCBAbUdMLlRFWFRVUkVfTUFHX0ZJTFRFUiwgQG1HTC5MSU5FQVJcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzNELCBAbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgQG1HTC5MSU5FQVJcbiAgICAgICAgICAgIGVsc2UgaWYgZmlsdGVyID09IFJlbmRlcmVyLkZJTFRFUi5NSVBNQVBcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzNELCBAbUdMLlRFWFRVUkVfTUFHX0ZJTFRFUiwgQG1HTC5MSU5FQVJcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzNELCBAbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgQG1HTC5MSU5FQVJfTUlQTUFQX0xJTkVBUlxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBtR0wudGV4UGFyYW1ldGVyaSBAbUdMLlRFWFRVUkVfM0QsIEBtR0wuVEVYVFVSRV9NQUdfRklMVEVSLCBAbUdMLk5FQVJFU1RcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzNELCBAbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgQG1HTC5ORUFSRVNUX01JUE1BUF9MSU5FQVJcbiAgICAgICAgICAgICAgICBAbUdMLmdlbmVyYXRlTWlwbWFwIEBtR0wuVEVYVFVSRV8zRFxuICAgICAgICAgICAgQG1HTC50ZXhJbWFnZTNEIEBtR0wuVEVYVFVSRV8zRCwgMCwgZ2xGb1R5Lm1HTEZvcm1hdCwgeHJlcywgeXJlcywgeXJlcywgMCwgZ2xGb1R5Lm1HTEV4dGVybmFsLCBnbEZvVHkubUdMVHlwZSwgYnVmZmVyXG4gICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzNELCBAbUdMLlRFWFRVUkVfV1JBUF9SLCBnbFdyYXBcbiAgICAgICAgICAgIEBtR0wudGV4UGFyYW1ldGVyaSBAbUdMLlRFWFRVUkVfM0QsIEBtR0wuVEVYVFVSRV9XUkFQX1MsIGdsV3JhcFxuICAgICAgICAgICAgQG1HTC50ZXhQYXJhbWV0ZXJpIEBtR0wuVEVYVFVSRV8zRCwgQG1HTC5URVhUVVJFX1dSQVBfVCwgZ2xXcmFwXG4gICAgICAgICAgICBpZiBmaWx0ZXIgPT0gUmVuZGVyZXIuRklMVEVSLk1JUE1BUFxuICAgICAgICAgICAgICAgIEBtR0wuZ2VuZXJhdGVNaXBtYXAgQG1HTC5URVhUVVJFXzNEXG4gICAgICAgICAgICBAbUdMLmJpbmRUZXh0dXJlIEBtR0wuVEVYVFVSRV8zRCwgbnVsbFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAbUdMLmJpbmRUZXh0dXJlIEBtR0wuVEVYVFVSRV9DVUJFX01BUCwgaWRcbiAgICAgICAgICAgIEBtR0wudGV4SW1hZ2UyRCBAbUdMLlRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWCwgMCwgZ2xGb1R5Lm1HTEZvcm1hdCwgeHJlcywgeXJlcywgMCwgZ2xGb1R5Lm1HTEV4dGVybmFsLCBnbEZvVHkubUdMVHlwZSwgYnVmZmVyXG4gICAgICAgICAgICBAbUdMLnRleEltYWdlMkQgQG1HTC5URVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1gsIDAsIGdsRm9UeS5tR0xGb3JtYXQsIHhyZXMsIHlyZXMsIDAsIGdsRm9UeS5tR0xFeHRlcm5hbCwgZ2xGb1R5Lm1HTFR5cGUsIGJ1ZmZlclxuICAgICAgICAgICAgQG1HTC50ZXhJbWFnZTJEIEBtR0wuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9ZLCAwLCBnbEZvVHkubUdMRm9ybWF0LCB4cmVzLCB5cmVzLCAwLCBnbEZvVHkubUdMRXh0ZXJuYWwsIGdsRm9UeS5tR0xUeXBlLCBidWZmZXJcbiAgICAgICAgICAgIEBtR0wudGV4SW1hZ2UyRCBAbUdMLlRFWFRVUkVfQ1VCRV9NQVBfTkVHQVRJVkVfWSwgMCwgZ2xGb1R5Lm1HTEZvcm1hdCwgeHJlcywgeXJlcywgMCwgZ2xGb1R5Lm1HTEV4dGVybmFsLCBnbEZvVHkubUdMVHlwZSwgYnVmZmVyXG4gICAgICAgICAgICBAbUdMLnRleEltYWdlMkQgQG1HTC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1osIDAsIGdsRm9UeS5tR0xGb3JtYXQsIHhyZXMsIHlyZXMsIDAsIGdsRm9UeS5tR0xFeHRlcm5hbCwgZ2xGb1R5Lm1HTFR5cGUsIGJ1ZmZlclxuICAgICAgICAgICAgQG1HTC50ZXhJbWFnZTJEIEBtR0wuVEVYVFVSRV9DVUJFX01BUF9ORUdBVElWRV9aLCAwLCBnbEZvVHkubUdMRm9ybWF0LCB4cmVzLCB5cmVzLCAwLCBnbEZvVHkubUdMRXh0ZXJuYWwsIGdsRm9UeS5tR0xUeXBlLCBidWZmZXJcbiAgICAgICAgICAgIGlmIGZpbHRlciA9PSBSZW5kZXJlci5GSUxURVIuTk9ORVxuICAgICAgICAgICAgICAgIEBtR0wudGV4UGFyYW1ldGVyaSBAbUdMLlRFWFRVUkVfQ1VCRV9NQVAsIEBtR0wuVEVYVFVSRV9NQUdfRklMVEVSLCBAbUdMLk5FQVJFU1RcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFX0NVQkVfTUFQLCBAbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgQG1HTC5ORUFSRVNUXG4gICAgICAgICAgICBlbHNlIGlmIGZpbHRlciA9PSBSZW5kZXJlci5GSUxURVIuTElORUFSXG4gICAgICAgICAgICAgICAgQG1HTC50ZXhQYXJhbWV0ZXJpIEBtR0wuVEVYVFVSRV9DVUJFX01BUCwgQG1HTC5URVhUVVJFX01BR19GSUxURVIsIEBtR0wuTElORUFSXG4gICAgICAgICAgICAgICAgQG1HTC50ZXhQYXJhbWV0ZXJpIEBtR0wuVEVYVFVSRV9DVUJFX01BUCwgQG1HTC5URVhUVVJFX01JTl9GSUxURVIsIEBtR0wuTElORUFSXG4gICAgICAgICAgICBlbHNlIGlmIGZpbHRlciA9PSBSZW5kZXJlci5GSUxURVIuTUlQTUFQXG4gICAgICAgICAgICAgICAgQG1HTC50ZXhQYXJhbWV0ZXJpIEBtR0wuVEVYVFVSRV9DVUJFX01BUCwgQG1HTC5URVhUVVJFX01BR19GSUxURVIsIEBtR0wuTElORUFSXG4gICAgICAgICAgICAgICAgQG1HTC50ZXhQYXJhbWV0ZXJpIEBtR0wuVEVYVFVSRV9DVUJFX01BUCwgQG1HTC5URVhUVVJFX01JTl9GSUxURVIsIEBtR0wuTElORUFSX01JUE1BUF9MSU5FQVJcbiAgICAgICAgICAgIGlmIGZpbHRlciA9PSBSZW5kZXJlci5GSUxURVIuTUlQTUFQXG4gICAgICAgICAgICAgICAgQG1HTC5nZW5lcmF0ZU1pcG1hcCBAbUdMLlRFWFRVUkVfQ1VCRV9NQVBcbiAgICAgICAgICAgIEBtR0wuYmluZFRleHR1cmUgQG1HTC5URVhUVVJFX0NVQkVfTUFQLCBudWxsXG5cbiAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBtT2JqZWN0SUQ6IGlkXG4gICAgICAgICAgICBtWHJlczogeHJlc1xuICAgICAgICAgICAgbVlyZXM6IHlyZXNcbiAgICAgICAgICAgIG1Gb3JtYXQ6IGZvcm1hdFxuICAgICAgICAgICAgbVR5cGU6IHR5cGVcbiAgICAgICAgICAgIG1GaWx0ZXI6IGZpbHRlclxuICAgICAgICAgICAgbVdyYXA6IHdyYXBcbiAgICAgICAgICAgIG1WRmxpcDogZmFsc2VcblxuICAgIGNyZWF0ZVRleHR1cmVGcm9tSW1hZ2U6ICh0eXBlLCBpbWFnZSwgZm9ybWF0LCBmaWx0ZXIsIHdyYXAsIGZsaXBZKSAtPlxuICAgICAgICBpZiBAbUdMID09IG51bGxcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIGlkID0gQG1HTC5jcmVhdGVUZXh0dXJlKClcbiAgICAgICAgZ2xGb1R5ID0gQGlGb3JtYXRQSTJHTChmb3JtYXQpXG4gICAgICAgIGdsV3JhcCA9IEBtR0wuUkVQRUFUXG4gICAgICAgIGlmIHdyYXAgPT0gUmVuZGVyZXIuVEVYV1JQLkNMQU1QXG4gICAgICAgICAgICBnbFdyYXAgPSBAbUdMLkNMQU1QX1RPX0VER0VcbiAgICAgICAgaWYgdHlwZSA9PSBSZW5kZXJlci5URVhUWVBFLlQyRFxuICAgICAgICAgICAgQG1HTC5iaW5kVGV4dHVyZSBAbUdMLlRFWFRVUkVfMkQsIGlkXG4gICAgICAgICAgICBAbUdMLnBpeGVsU3RvcmVpIEBtR0wuVU5QQUNLX0ZMSVBfWV9XRUJHTCwgZmxpcFlcbiAgICAgICAgICAgIEBtR0wucGl4ZWxTdG9yZWkgQG1HTC5VTlBBQ0tfUFJFTVVMVElQTFlfQUxQSEFfV0VCR0wsIGZhbHNlXG4gICAgICAgICAgICBAbUdMLnBpeGVsU3RvcmVpIEBtR0wuVU5QQUNLX0NPTE9SU1BBQ0VfQ09OVkVSU0lPTl9XRUJHTCwgQG1HTC5OT05FXG4gICAgICAgICAgICBAbUdMLnRleEltYWdlMkQgQG1HTC5URVhUVVJFXzJELCAwLCBnbEZvVHkubUdMRm9ybWF0LCBnbEZvVHkubUdMRXh0ZXJuYWwsIGdsRm9UeS5tR0xUeXBlLCBpbWFnZVxuICAgICAgICAgICAgQG1HTC50ZXhQYXJhbWV0ZXJpIEBtR0wuVEVYVFVSRV8yRCwgQG1HTC5URVhUVVJFX1dSQVBfUywgZ2xXcmFwXG4gICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzJELCBAbUdMLlRFWFRVUkVfV1JBUF9ULCBnbFdyYXBcbiAgICAgICAgICAgIGlmIGZpbHRlciA9PSBSZW5kZXJlci5GSUxURVIuTk9ORVxuICAgICAgICAgICAgICAgIEBtR0wudGV4UGFyYW1ldGVyaSBAbUdMLlRFWFRVUkVfMkQsIEBtR0wuVEVYVFVSRV9NQUdfRklMVEVSLCBAbUdMLk5FQVJFU1RcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzJELCBAbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgQG1HTC5ORUFSRVNUXG4gICAgICAgICAgICBlbHNlIGlmIGZpbHRlciA9PSBSZW5kZXJlci5GSUxURVIuTElORUFSXG4gICAgICAgICAgICAgICAgQG1HTC50ZXhQYXJhbWV0ZXJpIEBtR0wuVEVYVFVSRV8yRCwgQG1HTC5URVhUVVJFX01BR19GSUxURVIsIEBtR0wuTElORUFSXG4gICAgICAgICAgICAgICAgQG1HTC50ZXhQYXJhbWV0ZXJpIEBtR0wuVEVYVFVSRV8yRCwgQG1HTC5URVhUVVJFX01JTl9GSUxURVIsIEBtR0wuTElORUFSXG4gICAgICAgICAgICBlbHNlIGlmIGZpbHRlciA9PSBSZW5kZXJlci5GSUxURVIuTUlQTUFQXG4gICAgICAgICAgICAgICAgQG1HTC50ZXhQYXJhbWV0ZXJpIEBtR0wuVEVYVFVSRV8yRCwgQG1HTC5URVhUVVJFX01BR19GSUxURVIsIEBtR0wuTElORUFSXG4gICAgICAgICAgICAgICAgQG1HTC50ZXhQYXJhbWV0ZXJpIEBtR0wuVEVYVFVSRV8yRCwgQG1HTC5URVhUVVJFX01JTl9GSUxURVIsIEBtR0wuTElORUFSX01JUE1BUF9MSU5FQVJcbiAgICAgICAgICAgICAgICBAbUdMLmdlbmVyYXRlTWlwbWFwIEBtR0wuVEVYVFVSRV8yRFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBtR0wudGV4UGFyYW1ldGVyaSBAbUdMLlRFWFRVUkVfMkQsIEBtR0wuVEVYVFVSRV9NQUdfRklMVEVSLCBAbUdMLkxJTkVBUlxuICAgICAgICAgICAgICAgIEBtR0wudGV4UGFyYW1ldGVyaSBAbUdMLlRFWFRVUkVfMkQsIEBtR0wuVEVYVFVSRV9NSU5fRklMVEVSLCBAbUdMLk5FQVJFU1RfTUlQTUFQX0xJTkVBUlxuICAgICAgICAgICAgICAgIEBtR0wuZ2VuZXJhdGVNaXBtYXAgQG1HTC5URVhUVVJFXzJEXG4gICAgICAgICAgICBAbUdMLmJpbmRUZXh0dXJlIEBtR0wuVEVYVFVSRV8yRCwgbnVsbFxuICAgICAgICBlbHNlIGlmIHR5cGUgPT0gUmVuZGVyZXIuVEVYVFlQRS5UM0RcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBtR0wuYmluZFRleHR1cmUgQG1HTC5URVhUVVJFX0NVQkVfTUFQLCBpZFxuICAgICAgICAgICAgQG1HTC5waXhlbFN0b3JlaSBAbUdMLlVOUEFDS19GTElQX1lfV0VCR0wsIGZsaXBZXG4gICAgICAgICAgICBAbUdMLmFjdGl2ZVRleHR1cmUgQG1HTC5URVhUVVJFMFxuICAgICAgICAgICAgQG1HTC50ZXhJbWFnZTJEIEBtR0wuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9YLCAwLCBnbEZvVHkubUdMRm9ybWF0LCBnbEZvVHkubUdMRXh0ZXJuYWwsIGdsRm9UeS5tR0xUeXBlLCBpbWFnZVswXVxuICAgICAgICAgICAgQG1HTC50ZXhJbWFnZTJEIEBtR0wuVEVYVFVSRV9DVUJFX01BUF9ORUdBVElWRV9YLCAwLCBnbEZvVHkubUdMRm9ybWF0LCBnbEZvVHkubUdMRXh0ZXJuYWwsIGdsRm9UeS5tR0xUeXBlLCBpbWFnZVsxXVxuICAgICAgICAgICAgQG1HTC50ZXhJbWFnZTJEIEBtR0wuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9ZLCAwLCBnbEZvVHkubUdMRm9ybWF0LCBnbEZvVHkubUdMRXh0ZXJuYWwsIGdsRm9UeS5tR0xUeXBlLCBpZiBmbGlwWSB0aGVuIGltYWdlWzNdIGVsc2UgaW1hZ2VbMl1cbiAgICAgICAgICAgIEBtR0wudGV4SW1hZ2UyRCBAbUdMLlRFWFRVUkVfQ1VCRV9NQVBfTkVHQVRJVkVfWSwgMCwgZ2xGb1R5Lm1HTEZvcm1hdCwgZ2xGb1R5Lm1HTEV4dGVybmFsLCBnbEZvVHkubUdMVHlwZSwgaWYgZmxpcFkgdGhlbiBpbWFnZVsyXSBlbHNlIGltYWdlWzNdXG4gICAgICAgICAgICBAbUdMLnRleEltYWdlMkQgQG1HTC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1osIDAsIGdsRm9UeS5tR0xGb3JtYXQsIGdsRm9UeS5tR0xFeHRlcm5hbCwgZ2xGb1R5Lm1HTFR5cGUsIGltYWdlWzRdXG4gICAgICAgICAgICBAbUdMLnRleEltYWdlMkQgQG1HTC5URVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1osIDAsIGdsRm9UeS5tR0xGb3JtYXQsIGdsRm9UeS5tR0xFeHRlcm5hbCwgZ2xGb1R5Lm1HTFR5cGUsIGltYWdlWzVdXG4gICAgICAgICAgICBpZiBmaWx0ZXIgPT0gUmVuZGVyZXIuRklMVEVSLk5PTkVcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFX0NVQkVfTUFQLCBAbUdMLlRFWFRVUkVfTUFHX0ZJTFRFUiwgQG1HTC5ORUFSRVNUXG4gICAgICAgICAgICAgICAgQG1HTC50ZXhQYXJhbWV0ZXJpIEBtR0wuVEVYVFVSRV9DVUJFX01BUCwgQG1HTC5URVhUVVJFX01JTl9GSUxURVIsIEBtR0wuTkVBUkVTVFxuICAgICAgICAgICAgZWxzZSBpZiBmaWx0ZXIgPT0gUmVuZGVyZXIuRklMVEVSLkxJTkVBUlxuICAgICAgICAgICAgICAgIEBtR0wudGV4UGFyYW1ldGVyaSBAbUdMLlRFWFRVUkVfQ1VCRV9NQVAsIEBtR0wuVEVYVFVSRV9NQUdfRklMVEVSLCBAbUdMLkxJTkVBUlxuICAgICAgICAgICAgICAgIEBtR0wudGV4UGFyYW1ldGVyaSBAbUdMLlRFWFRVUkVfQ1VCRV9NQVAsIEBtR0wuVEVYVFVSRV9NSU5fRklMVEVSLCBAbUdMLkxJTkVBUlxuICAgICAgICAgICAgZWxzZSBpZiBmaWx0ZXIgPT0gUmVuZGVyZXIuRklMVEVSLk1JUE1BUFxuICAgICAgICAgICAgICAgIEBtR0wudGV4UGFyYW1ldGVyaSBAbUdMLlRFWFRVUkVfQ1VCRV9NQVAsIEBtR0wuVEVYVFVSRV9NQUdfRklMVEVSLCBAbUdMLkxJTkVBUlxuICAgICAgICAgICAgICAgIEBtR0wudGV4UGFyYW1ldGVyaSBAbUdMLlRFWFRVUkVfQ1VCRV9NQVAsIEBtR0wuVEVYVFVSRV9NSU5fRklMVEVSLCBAbUdMLkxJTkVBUl9NSVBNQVBfTElORUFSXG4gICAgICAgICAgICAgICAgQG1HTC5nZW5lcmF0ZU1pcG1hcCBAbUdMLlRFWFRVUkVfQ1VCRV9NQVBcbiAgICAgICAgICAgIEBtR0wuYmluZFRleHR1cmUgQG1HTC5URVhUVVJFX0NVQkVfTUFQLCBudWxsXG4gICAgICAgIHJldHVyblxuICAgICAgICAgICAgbU9iamVjdElEOiBpZFxuICAgICAgICAgICAgbVhyZXM6IGltYWdlLndpZHRoXG4gICAgICAgICAgICBtWXJlczogaW1hZ2UuaGVpZ2h0XG4gICAgICAgICAgICBtRm9ybWF0OiBmb3JtYXRcbiAgICAgICAgICAgIG1UeXBlOiB0eXBlXG4gICAgICAgICAgICBtRmlsdGVyOiBmaWx0ZXJcbiAgICAgICAgICAgIG1XcmFwOiB3cmFwXG4gICAgICAgICAgICBtVkZsaXA6IGZsaXBZXG5cbiAgICBzZXRTYW1wbGVyRmlsdGVyOiAodGUsIGZpbHRlciwgZG9HZW5lcmF0ZU1pcHNJZk5lZWRlZCkgLT5cbiAgICAgICAgaWYgdGUubUZpbHRlciA9PSBmaWx0ZXJcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBpZiB0ZS5tVHlwZSA9PSBSZW5kZXJlci5URVhUWVBFLlQyRFxuICAgICAgICAgICAgQG1HTC5iaW5kVGV4dHVyZSBAbUdMLlRFWFRVUkVfMkQsIHRlLm1PYmplY3RJRFxuICAgICAgICAgICAgaWYgZmlsdGVyID09IFJlbmRlcmVyLkZJTFRFUi5OT05FXG4gICAgICAgICAgICAgICAgQG1HTC50ZXhQYXJhbWV0ZXJpIEBtR0wuVEVYVFVSRV8yRCwgQG1HTC5URVhUVVJFX01BR19GSUxURVIsIEBtR0wuTkVBUkVTVFxuICAgICAgICAgICAgICAgIEBtR0wudGV4UGFyYW1ldGVyaSBAbUdMLlRFWFRVUkVfMkQsIEBtR0wuVEVYVFVSRV9NSU5fRklMVEVSLCBAbUdMLk5FQVJFU1RcbiAgICAgICAgICAgIGVsc2UgaWYgZmlsdGVyID09IFJlbmRlcmVyLkZJTFRFUi5MSU5FQVJcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzJELCBAbUdMLlRFWFRVUkVfTUFHX0ZJTFRFUiwgQG1HTC5MSU5FQVJcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzJELCBAbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgQG1HTC5MSU5FQVJcbiAgICAgICAgICAgIGVsc2UgaWYgZmlsdGVyID09IFJlbmRlcmVyLkZJTFRFUi5NSVBNQVBcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzJELCBAbUdMLlRFWFRVUkVfTUFHX0ZJTFRFUiwgQG1HTC5MSU5FQVJcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzJELCBAbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgQG1HTC5MSU5FQVJfTUlQTUFQX0xJTkVBUlxuICAgICAgICAgICAgICAgIGlmIGRvR2VuZXJhdGVNaXBzSWZOZWVkZWRcbiAgICAgICAgICAgICAgICAgICAgQG1HTC5nZW5lcmF0ZU1pcG1hcCBAbUdMLlRFWFRVUkVfMkRcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzJELCBAbUdMLlRFWFRVUkVfTUFHX0ZJTFRFUiwgQG1HTC5ORUFSRVNUXG4gICAgICAgICAgICAgICAgQG1HTC50ZXhQYXJhbWV0ZXJpIEBtR0wuVEVYVFVSRV8yRCwgQG1HTC5URVhUVVJFX01JTl9GSUxURVIsIEBtR0wuTkVBUkVTVF9NSVBNQVBfTElORUFSXG4gICAgICAgICAgICAgICAgaWYgZG9HZW5lcmF0ZU1pcHNJZk5lZWRlZFxuICAgICAgICAgICAgICAgICAgICBAbUdMLmdlbmVyYXRlTWlwbWFwIEBtR0wuVEVYVFVSRV8yRFxuICAgICAgICAgICAgQG1HTC5iaW5kVGV4dHVyZSBAbUdMLlRFWFRVUkVfMkQsIG51bGxcbiAgICAgICAgZWxzZSBpZiB0ZS5tVHlwZSA9PSBSZW5kZXJlci5URVhUWVBFLlQzRFxuICAgICAgICAgICAgQG1HTC5iaW5kVGV4dHVyZSBAbUdMLlRFWFRVUkVfM0QsIHRlLm1PYmplY3RJRFxuICAgICAgICAgICAgaWYgZmlsdGVyID09IFJlbmRlcmVyLkZJTFRFUi5OT05FXG4gICAgICAgICAgICAgICAgQG1HTC50ZXhQYXJhbWV0ZXJpIEBtR0wuVEVYVFVSRV8zRCwgQG1HTC5URVhUVVJFX01BR19GSUxURVIsIEBtR0wuTkVBUkVTVFxuICAgICAgICAgICAgICAgIEBtR0wudGV4UGFyYW1ldGVyaSBAbUdMLlRFWFRVUkVfM0QsIEBtR0wuVEVYVFVSRV9NSU5fRklMVEVSLCBAbUdMLk5FQVJFU1RcbiAgICAgICAgICAgIGVsc2UgaWYgZmlsdGVyID09IFJlbmRlcmVyLkZJTFRFUi5MSU5FQVJcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzNELCBAbUdMLlRFWFRVUkVfTUFHX0ZJTFRFUiwgQG1HTC5MSU5FQVJcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzNELCBAbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgQG1HTC5MSU5FQVJcbiAgICAgICAgICAgIGVsc2UgaWYgZmlsdGVyID09IFJlbmRlcmVyLkZJTFRFUi5NSVBNQVBcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzNELCBAbUdMLlRFWFRVUkVfTUFHX0ZJTFRFUiwgQG1HTC5MSU5FQVJcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzNELCBAbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgQG1HTC5MSU5FQVJfTUlQTUFQX0xJTkVBUlxuICAgICAgICAgICAgICAgIGlmIGRvR2VuZXJhdGVNaXBzSWZOZWVkZWRcbiAgICAgICAgICAgICAgICAgICAgQG1HTC5nZW5lcmF0ZU1pcG1hcCBAbUdMLlRFWFRVUkVfM0RcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzNELCBAbUdMLlRFWFRVUkVfTUFHX0ZJTFRFUiwgQG1HTC5ORUFSRVNUXG4gICAgICAgICAgICAgICAgQG1HTC50ZXhQYXJhbWV0ZXJpIEBtR0wuVEVYVFVSRV8zRCwgQG1HTC5URVhUVVJFX01JTl9GSUxURVIsIEBtR0wuTkVBUkVTVF9NSVBNQVBfTElORUFSXG4gICAgICAgICAgICAgICAgaWYgZG9HZW5lcmF0ZU1pcHNJZk5lZWRlZFxuICAgICAgICAgICAgICAgICAgICBAbUdMLmdlbmVyYXRlTWlwbWFwIEBtR0wuVEVYVFVSRV8zRFxuICAgICAgICAgICAgQG1HTC5iaW5kVGV4dHVyZSBAbUdMLlRFWFRVUkVfM0QsIG51bGxcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQG1HTC5iaW5kVGV4dHVyZSBAbUdMLlRFWFRVUkVfQ1VCRV9NQVAsIHRlLm1PYmplY3RJRFxuICAgICAgICAgICAgaWYgZmlsdGVyID09IFJlbmRlcmVyLkZJTFRFUi5OT05FXG4gICAgICAgICAgICAgICAgQG1HTC50ZXhQYXJhbWV0ZXJpIEBtR0wuVEVYVFVSRV9DVUJFX01BUCwgQG1HTC5URVhUVVJFX01BR19GSUxURVIsIEBtR0wuTkVBUkVTVFxuICAgICAgICAgICAgICAgIEBtR0wudGV4UGFyYW1ldGVyaSBAbUdMLlRFWFRVUkVfQ1VCRV9NQVAsIEBtR0wuVEVYVFVSRV9NSU5fRklMVEVSLCBAbUdMLk5FQVJFU1RcbiAgICAgICAgICAgIGVsc2UgaWYgZmlsdGVyID09IFJlbmRlcmVyLkZJTFRFUi5MSU5FQVJcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFX0NVQkVfTUFQLCBAbUdMLlRFWFRVUkVfTUFHX0ZJTFRFUiwgQG1HTC5MSU5FQVJcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFX0NVQkVfTUFQLCBAbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgQG1HTC5MSU5FQVJcbiAgICAgICAgICAgIGVsc2UgaWYgZmlsdGVyID09IFJlbmRlcmVyLkZJTFRFUi5NSVBNQVBcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFX0NVQkVfTUFQLCBAbUdMLlRFWFRVUkVfTUFHX0ZJTFRFUiwgQG1HTC5MSU5FQVJcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFX0NVQkVfTUFQLCBAbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgQG1HTC5MSU5FQVJfTUlQTUFQX0xJTkVBUlxuICAgICAgICAgICAgICAgIGlmIGRvR2VuZXJhdGVNaXBzSWZOZWVkZWRcbiAgICAgICAgICAgICAgICAgICAgQG1HTC5nZW5lcmF0ZU1pcG1hcCBAbUdMLlRFWFRVUkVfQ1VCRV9NQVBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFX0NVQkVfTUFQLCBAbUdMLlRFWFRVUkVfTUFHX0ZJTFRFUiwgQG1HTC5ORUFSRVNUXG4gICAgICAgICAgICAgICAgQG1HTC50ZXhQYXJhbWV0ZXJpIEBtR0wuVEVYVFVSRV9DVUJFX01BUCwgQG1HTC5URVhUVVJFX01JTl9GSUxURVIsIEBtR0wuTkVBUkVTVF9NSVBNQVBfTElORUFSXG4gICAgICAgICAgICAgICAgaWYgZG9HZW5lcmF0ZU1pcHNJZk5lZWRlZFxuICAgICAgICAgICAgICAgICAgICBAbUdMLmdlbmVyYXRlTWlwbWFwIEBtR0wuVEVYVFVSRV9DVUJFX01BUFxuICAgICAgICAgICAgQG1HTC5iaW5kVGV4dHVyZSBAbUdMLlRFWFRVUkVfQ1VCRV9NQVAsIG51bGxcbiAgICAgICAgdGUubUZpbHRlciA9IGZpbHRlclxuXG4gICAgc2V0U2FtcGxlcldyYXA6ICh0ZSwgd3JhcCkgLT5cbiAgICAgICAgaWYgdGUubVdyYXAgPT0gd3JhcFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIGdsV3JhcCA9IEBtR0wuUkVQRUFUXG4gICAgICAgIGlmIHdyYXAgPT0gUmVuZGVyZXIuVEVYV1JQLkNMQU1QXG4gICAgICAgICAgICBnbFdyYXAgPSBAbUdMLkNMQU1QX1RPX0VER0VcbiAgICAgICAgaWQgPSB0ZS5tT2JqZWN0SURcbiAgICAgICAgaWYgdGUubVR5cGUgPT0gUmVuZGVyZXIuVEVYVFlQRS5UMkRcbiAgICAgICAgICAgIEBtR0wuYmluZFRleHR1cmUgQG1HTC5URVhUVVJFXzJELCBpZFxuICAgICAgICAgICAgQG1HTC50ZXhQYXJhbWV0ZXJpIEBtR0wuVEVYVFVSRV8yRCwgQG1HTC5URVhUVVJFX1dSQVBfUywgZ2xXcmFwXG4gICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzJELCBAbUdMLlRFWFRVUkVfV1JBUF9ULCBnbFdyYXBcbiAgICAgICAgICAgIEBtR0wuYmluZFRleHR1cmUgQG1HTC5URVhUVVJFXzJELCBudWxsXG4gICAgICAgIGVsc2UgaWYgdGUubVR5cGUgPT0gUmVuZGVyZXIuVEVYVFlQRS5UM0RcbiAgICAgICAgICAgIEBtR0wuYmluZFRleHR1cmUgQG1HTC5URVhUVVJFXzNELCBpZFxuICAgICAgICAgICAgQG1HTC50ZXhQYXJhbWV0ZXJpIEBtR0wuVEVYVFVSRV8zRCwgQG1HTC5URVhUVVJFX1dSQVBfUiwgZ2xXcmFwXG4gICAgICAgICAgICBAbUdMLnRleFBhcmFtZXRlcmkgQG1HTC5URVhUVVJFXzNELCBAbUdMLlRFWFRVUkVfV1JBUF9TLCBnbFdyYXBcbiAgICAgICAgICAgIEBtR0wudGV4UGFyYW1ldGVyaSBAbUdMLlRFWFRVUkVfM0QsIEBtR0wuVEVYVFVSRV9XUkFQX1QsIGdsV3JhcFxuICAgICAgICAgICAgQG1HTC5iaW5kVGV4dHVyZSBAbUdMLlRFWFRVUkVfM0QsIG51bGxcbiAgICAgICAgdGUubVdyYXAgPSB3cmFwXG5cbiAgICBzZXRTYW1wbGVyVkZsaXA6ICh0ZSwgdmZsaXAsIGltYWdlKSAtPlxuICAgICAgICBpZiB0ZS5tVkZsaXAgPT0gdmZsaXBcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBpZCA9IHRlLm1PYmplY3RJRFxuICAgICAgICBpZiB0ZS5tVHlwZSA9PSBSZW5kZXJlci5URVhUWVBFLlQyRFxuICAgICAgICAgICAgaWYgaW1hZ2UgIT0gbnVsbFxuICAgICAgICAgICAgICAgIEBtR0wuYWN0aXZlVGV4dHVyZSBAbUdMLlRFWFRVUkUwXG4gICAgICAgICAgICAgICAgQG1HTC5iaW5kVGV4dHVyZSBAbUdMLlRFWFRVUkVfMkQsIGlkXG4gICAgICAgICAgICAgICAgQG1HTC5waXhlbFN0b3JlaSBAbUdMLlVOUEFDS19GTElQX1lfV0VCR0wsIHZmbGlwXG4gICAgICAgICAgICAgICAgZ2xGb1R5ID0gQGlGb3JtYXRQSTJHTCh0ZS5tRm9ybWF0KVxuICAgICAgICAgICAgICAgIEBtR0wudGV4SW1hZ2UyRCBAbUdMLlRFWFRVUkVfMkQsIDAsIGdsRm9UeS5tR0xGb3JtYXQsIGdsRm9UeS5tR0xFeHRlcm5hbCwgZ2xGb1R5Lm1HTFR5cGUsIGltYWdlXG4gICAgICAgICAgICAgICAgQG1HTC5iaW5kVGV4dHVyZSBAbUdMLlRFWFRVUkVfMkQsIG51bGxcbiAgICAgICAgZWxzZSBpZiB0ZS5tVHlwZSA9PSBSZW5kZXJlci5URVhUWVBFLkNVQkVNQVBcbiAgICAgICAgICAgIGlmIGltYWdlICE9IG51bGxcbiAgICAgICAgICAgICAgICBnbEZvVHkgPSBAaUZvcm1hdFBJMkdMKHRlLm1Gb3JtYXQpXG4gICAgICAgICAgICAgICAgQG1HTC5hY3RpdmVUZXh0dXJlIEBtR0wuVEVYVFVSRTBcbiAgICAgICAgICAgICAgICBAbUdMLmJpbmRUZXh0dXJlIEBtR0wuVEVYVFVSRV9DVUJFX01BUCwgaWRcbiAgICAgICAgICAgICAgICBAbUdMLnBpeGVsU3RvcmVpIEBtR0wuVU5QQUNLX0ZMSVBfWV9XRUJHTCwgdmZsaXBcbiAgICAgICAgICAgICAgICBAbUdMLnRleEltYWdlMkQgQG1HTC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1gsIDAsIGdsRm9UeS5tR0xGb3JtYXQsIGdsRm9UeS5tR0xFeHRlcm5hbCwgZ2xGb1R5Lm1HTFR5cGUsIGltYWdlWzBdXG4gICAgICAgICAgICAgICAgQG1HTC50ZXhJbWFnZTJEIEBtR0wuVEVYVFVSRV9DVUJFX01BUF9ORUdBVElWRV9YLCAwLCBnbEZvVHkubUdMRm9ybWF0LCBnbEZvVHkubUdMRXh0ZXJuYWwsIGdsRm9UeS5tR0xUeXBlLCBpbWFnZVsxXVxuICAgICAgICAgICAgICAgIEBtR0wudGV4SW1hZ2UyRCBAbUdMLlRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWSwgMCwgZ2xGb1R5Lm1HTEZvcm1hdCwgZ2xGb1R5Lm1HTEV4dGVybmFsLCBnbEZvVHkubUdMVHlwZSwgaWYgdmZsaXAgdGhlbiBpbWFnZVszXSBlbHNlIGltYWdlWzJdXG4gICAgICAgICAgICAgICAgQG1HTC50ZXhJbWFnZTJEIEBtR0wuVEVYVFVSRV9DVUJFX01BUF9ORUdBVElWRV9ZLCAwLCBnbEZvVHkubUdMRm9ybWF0LCBnbEZvVHkubUdMRXh0ZXJuYWwsIGdsRm9UeS5tR0xUeXBlLCBpZiB2ZmxpcCB0aGVuIGltYWdlWzJdIGVsc2UgaW1hZ2VbM11cbiAgICAgICAgICAgICAgICBAbUdMLnRleEltYWdlMkQgQG1HTC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1osIDAsIGdsRm9UeS5tR0xGb3JtYXQsIGdsRm9UeS5tR0xFeHRlcm5hbCwgZ2xGb1R5Lm1HTFR5cGUsIGltYWdlWzRdXG4gICAgICAgICAgICAgICAgQG1HTC50ZXhJbWFnZTJEIEBtR0wuVEVYVFVSRV9DVUJFX01BUF9ORUdBVElWRV9aLCAwLCBnbEZvVHkubUdMRm9ybWF0LCBnbEZvVHkubUdMRXh0ZXJuYWwsIGdsRm9UeS5tR0xUeXBlLCBpbWFnZVs1XVxuICAgICAgICAgICAgICAgIEBtR0wuYmluZFRleHR1cmUgQG1HTC5URVhUVVJFX0NVQkVfTUFQLCBudWxsXG4gICAgICAgIHRlLm1WRmxpcCA9IHZmbGlwXG5cbiAgICBjcmVhdGVNaXBtYXBzOiAodGUpIC0+XG4gICAgICAgIGlmIHRlLm1UeXBlID09IFJlbmRlcmVyLlRFWFRZUEUuVDJEXG4gICAgICAgICAgICBAbUdMLmFjdGl2ZVRleHR1cmUgQG1HTC5URVhUVVJFMFxuICAgICAgICAgICAgQG1HTC5iaW5kVGV4dHVyZSBAbUdMLlRFWFRVUkVfMkQsIHRlLm1PYmplY3RJRFxuICAgICAgICAgICAgQG1HTC5nZW5lcmF0ZU1pcG1hcCBAbUdMLlRFWFRVUkVfMkRcbiAgICAgICAgICAgIEBtR0wuYmluZFRleHR1cmUgQG1HTC5URVhUVVJFXzJELCBudWxsXG4gICAgICAgIGVsc2UgaWYgdGUubVR5cGUgPT0gUmVuZGVyZXIuVEVYVFlQRS5DVUJFTUFQXG4gICAgICAgICAgICBAbUdMLmFjdGl2ZVRleHR1cmUgQG1HTC5URVhUVVJFMFxuICAgICAgICAgICAgQG1HTC5iaW5kVGV4dHVyZSBAbUdMLlRFWFRVUkVfQ1VCRV9NQVAsIHRlLm1PYmplY3RJRFxuICAgICAgICAgICAgQG1HTC5nZW5lcmF0ZU1pcG1hcCBAbUdMLlRFWFRVUkVfQ1VCRV9NQVBcbiAgICAgICAgICAgIEBtR0wuYmluZFRleHR1cmUgQG1HTC5URVhUVVJFX0NVQkVfTUFQLCBudWxsXG5cbiAgICB1cGRhdGVUZXh0dXJlOiAodGV4LCB4MCwgeTAsIHhyZXMsIHlyZXMsIGJ1ZmZlcikgLT5cbiAgICAgICAgZ2xGb1R5ID0gQGlGb3JtYXRQSTJHTCh0ZXgubUZvcm1hdClcbiAgICAgICAgaWYgdGV4Lm1UeXBlID09IFJlbmRlcmVyLlRFWFRZUEUuVDJEXG4gICAgICAgICAgICBAbUdMLmFjdGl2ZVRleHR1cmUgQG1HTC5URVhUVVJFMFxuICAgICAgICAgICAgQG1HTC5iaW5kVGV4dHVyZSBAbUdMLlRFWFRVUkVfMkQsIHRleC5tT2JqZWN0SURcbiAgICAgICAgICAgIEBtR0wucGl4ZWxTdG9yZWkgQG1HTC5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCB0ZXgubVZGbGlwXG4gICAgICAgICAgICBAbUdMLnRleFN1YkltYWdlMkQgQG1HTC5URVhUVVJFXzJELCAwLCB4MCwgeTAsIHhyZXMsIHlyZXMsIGdsRm9UeS5tR0xFeHRlcm5hbCwgZ2xGb1R5Lm1HTFR5cGUsIGJ1ZmZlclxuICAgICAgICAgICAgQG1HTC5iaW5kVGV4dHVyZSBAbUdMLlRFWFRVUkVfMkQsIG51bGxcblxuICAgIHVwZGF0ZVRleHR1cmVGcm9tSW1hZ2U6ICh0ZXgsIGltYWdlKSAtPlxuICAgICAgICBnbEZvVHkgPSBAaUZvcm1hdFBJMkdMKHRleC5tRm9ybWF0KVxuICAgICAgICBpZiB0ZXgubVR5cGUgPT0gUmVuZGVyZXIuVEVYVFlQRS5UMkRcbiAgICAgICAgICAgIEBtR0wuYWN0aXZlVGV4dHVyZSBAbUdMLlRFWFRVUkUwXG4gICAgICAgICAgICBAbUdMLmJpbmRUZXh0dXJlIEBtR0wuVEVYVFVSRV8yRCwgdGV4Lm1PYmplY3RJRFxuICAgICAgICAgICAgQG1HTC5waXhlbFN0b3JlaSBAbUdMLlVOUEFDS19GTElQX1lfV0VCR0wsIHRleC5tVkZsaXBcbiAgICAgICAgICAgIEBtR0wudGV4SW1hZ2UyRCBAbUdMLlRFWFRVUkVfMkQsIDAsIGdsRm9UeS5tR0xGb3JtYXQsIGdsRm9UeS5tR0xFeHRlcm5hbCwgZ2xGb1R5Lm1HTFR5cGUsIGltYWdlXG4gICAgICAgICAgICBAbUdMLmJpbmRUZXh0dXJlIEBtR0wuVEVYVFVSRV8yRCwgbnVsbFxuXG4gICAgZGVzdHJveVRleHR1cmU6ICh0ZSkgLT4gQG1HTC5kZWxldGVUZXh0dXJlIHRlLm1PYmplY3RJRFxuXG4gICAgYXR0YWNoVGV4dHVyZXM6IChudW0sIHQwLCB0MSwgdDIsIHQzKSAtPlxuICAgICAgICBpZiBudW0gPiAwIGFuZCB0MCAhPSBudWxsXG4gICAgICAgICAgICBAbUdMLmFjdGl2ZVRleHR1cmUgQG1HTC5URVhUVVJFMFxuICAgICAgICAgICAgaWYgdDAubVR5cGUgPT0gUmVuZGVyZXIuVEVYVFlQRS5UMkRcbiAgICAgICAgICAgICAgICBAbUdMLmJpbmRUZXh0dXJlIEBtR0wuVEVYVFVSRV8yRCwgdDAubU9iamVjdElEXG4gICAgICAgICAgICBlbHNlIGlmIHQwLm1UeXBlID09IFJlbmRlcmVyLlRFWFRZUEUuVDNEXG4gICAgICAgICAgICAgICAgQG1HTC5iaW5kVGV4dHVyZSBAbUdMLlRFWFRVUkVfM0QsIHQwLm1PYmplY3RJRFxuICAgICAgICAgICAgZWxzZSBpZiB0MC5tVHlwZSA9PSBSZW5kZXJlci5URVhUWVBFLkNVQkVNQVBcbiAgICAgICAgICAgICAgICBAbUdMLmJpbmRUZXh0dXJlIEBtR0wuVEVYVFVSRV9DVUJFX01BUCwgdDAubU9iamVjdElEXG4gICAgICAgIGlmIG51bSA+IDEgYW5kIHQxICE9IG51bGxcbiAgICAgICAgICAgIEBtR0wuYWN0aXZlVGV4dHVyZSBAbUdMLlRFWFRVUkUxXG4gICAgICAgICAgICBpZiB0MS5tVHlwZSA9PSBSZW5kZXJlci5URVhUWVBFLlQyRFxuICAgICAgICAgICAgICAgIEBtR0wuYmluZFRleHR1cmUgQG1HTC5URVhUVVJFXzJELCB0MS5tT2JqZWN0SURcbiAgICAgICAgICAgIGVsc2UgaWYgdDEubVR5cGUgPT0gUmVuZGVyZXIuVEVYVFlQRS5UM0RcbiAgICAgICAgICAgICAgICBAbUdMLmJpbmRUZXh0dXJlIEBtR0wuVEVYVFVSRV8zRCwgdDEubU9iamVjdElEXG4gICAgICAgICAgICBlbHNlIGlmIHQxLm1UeXBlID09IFJlbmRlcmVyLlRFWFRZUEUuQ1VCRU1BUFxuICAgICAgICAgICAgICAgIEBtR0wuYmluZFRleHR1cmUgQG1HTC5URVhUVVJFX0NVQkVfTUFQLCB0MS5tT2JqZWN0SURcbiAgICAgICAgaWYgbnVtID4gMiBhbmQgdDIgIT0gbnVsbFxuICAgICAgICAgICAgQG1HTC5hY3RpdmVUZXh0dXJlIEBtR0wuVEVYVFVSRTJcbiAgICAgICAgICAgIGlmIHQyLm1UeXBlID09IFJlbmRlcmVyLlRFWFRZUEUuVDJEXG4gICAgICAgICAgICAgICAgQG1HTC5iaW5kVGV4dHVyZSBAbUdMLlRFWFRVUkVfMkQsIHQyLm1PYmplY3RJRFxuICAgICAgICAgICAgZWxzZSBpZiB0Mi5tVHlwZSA9PSBSZW5kZXJlci5URVhUWVBFLlQzRFxuICAgICAgICAgICAgICAgIEBtR0wuYmluZFRleHR1cmUgQG1HTC5URVhUVVJFXzNELCB0Mi5tT2JqZWN0SURcbiAgICAgICAgICAgIGVsc2UgaWYgdDIubVR5cGUgPT0gUmVuZGVyZXIuVEVYVFlQRS5DVUJFTUFQXG4gICAgICAgICAgICAgICAgQG1HTC5iaW5kVGV4dHVyZSBAbUdMLlRFWFRVUkVfQ1VCRV9NQVAsIHQyLm1PYmplY3RJRFxuICAgICAgICBpZiBudW0gPiAzIGFuZCB0MyAhPSBudWxsXG4gICAgICAgICAgICBAbUdMLmFjdGl2ZVRleHR1cmUgQG1HTC5URVhUVVJFM1xuICAgICAgICAgICAgaWYgdDMubVR5cGUgPT0gUmVuZGVyZXIuVEVYVFlQRS5UMkRcbiAgICAgICAgICAgICAgICBAbUdMLmJpbmRUZXh0dXJlIEBtR0wuVEVYVFVSRV8yRCwgdDMubU9iamVjdElEXG4gICAgICAgICAgICBlbHNlIGlmIHQzLm1UeXBlID09IFJlbmRlcmVyLlRFWFRZUEUuVDNEXG4gICAgICAgICAgICAgICAgQG1HTC5iaW5kVGV4dHVyZSBAbUdMLlRFWFRVUkVfM0QsIHQzLm1PYmplY3RJRFxuICAgICAgICAgICAgZWxzZSBpZiB0My5tVHlwZSA9PSBSZW5kZXJlci5URVhUWVBFLkNVQkVNQVBcbiAgICAgICAgICAgICAgICBAbUdMLmJpbmRUZXh0dXJlIEBtR0wuVEVYVFVSRV9DVUJFX01BUCwgdDMubU9iamVjdElEXG4gICAgICAgIHJldHVyblxuXG4gICAgZGV0dGFjaFRleHR1cmVzOiAtPlxuICAgICAgICBAbUdMLmFjdGl2ZVRleHR1cmUgQG1HTC5URVhUVVJFMFxuICAgICAgICBAbUdMLmJpbmRUZXh0dXJlIEBtR0wuVEVYVFVSRV8yRCwgbnVsbFxuICAgICAgICBAbUdMLmJpbmRUZXh0dXJlIEBtR0wuVEVYVFVSRV9DVUJFX01BUCwgbnVsbFxuICAgICAgICBAbUdMLmFjdGl2ZVRleHR1cmUgQG1HTC5URVhUVVJFMVxuICAgICAgICBAbUdMLmJpbmRUZXh0dXJlIEBtR0wuVEVYVFVSRV8yRCwgbnVsbFxuICAgICAgICBAbUdMLmJpbmRUZXh0dXJlIEBtR0wuVEVYVFVSRV9DVUJFX01BUCwgbnVsbFxuICAgICAgICBAbUdMLmFjdGl2ZVRleHR1cmUgQG1HTC5URVhUVVJFMlxuICAgICAgICBAbUdMLmJpbmRUZXh0dXJlIEBtR0wuVEVYVFVSRV8yRCwgbnVsbFxuICAgICAgICBAbUdMLmJpbmRUZXh0dXJlIEBtR0wuVEVYVFVSRV9DVUJFX01BUCwgbnVsbFxuICAgICAgICBAbUdMLmFjdGl2ZVRleHR1cmUgQG1HTC5URVhUVVJFM1xuICAgICAgICBAbUdMLmJpbmRUZXh0dXJlIEBtR0wuVEVYVFVSRV8yRCwgbnVsbFxuICAgICAgICBAbUdMLmJpbmRUZXh0dXJlIEBtR0wuVEVYVFVSRV9DVUJFX01BUCwgbnVsbFxuXG4gICAgY3JlYXRlUmVuZGVyVGFyZ2V0OiAoY29sb3IwKSAtPlxuICAgICAgICBpZCA9IEBtR0wuY3JlYXRlRnJhbWVidWZmZXIoKVxuICAgICAgICBAbUdMLmJpbmRGcmFtZWJ1ZmZlciBAbUdMLkZSQU1FQlVGRkVSLCBpZFxuICAgICAgICBAbUdMLmZyYW1lYnVmZmVyVGV4dHVyZTJEIEBtR0wuRlJBTUVCVUZGRVIsIEBtR0wuREVQVEhfQVRUQUNITUVOVCwgQG1HTC5URVhUVVJFXzJELCBkZXB0aC5tT2JqZWN0SUQsIDBcbiAgICAgICAgaWYgY29sb3IwICE9IG51bGxcbiAgICAgICAgICAgIEBtR0wuZnJhbWVidWZmZXJUZXh0dXJlMkQgQG1HTC5GUkFNRUJVRkZFUiwgQG1HTC5DT0xPUl9BVFRBQ0hNRU5UMCwgQG1HTC5URVhUVVJFXzJELCBjb2xvcjAubU9iamVjdElELCAwXG4gICAgICAgIGlmIEBtR0wuY2hlY2tGcmFtZWJ1ZmZlclN0YXR1cyhtR0wuRlJBTUVCVUZGRVIpICE9IEBtR0wuRlJBTUVCVUZGRVJfQ09NUExFVEVcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIEBtR0wuYmluZFJlbmRlcmJ1ZmZlciBAbUdMLlJFTkRFUkJVRkZFUiwgbnVsbFxuICAgICAgICBAbUdMLmJpbmRGcmFtZWJ1ZmZlciAgQG1HTC5GUkFNRUJVRkZFUiwgbnVsbFxuICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIG1PYmplY3RJRDogaWRcbiAgICAgICAgICAgIG1UZXgwOiBjb2xvcjBcblxuICAgIGRlc3Ryb3lSZW5kZXJUYXJnZXQ6ICh0ZXgpIC0+XG4gICAgICAgIEBtR0wuZGVsZXRlRnJhbWVidWZmZXIgdGV4Lm1PYmplY3RJRFxuXG4gICAgc2V0UmVuZGVyVGFyZ2V0OiAodGV4KSAtPiBAbUdMLmJpbmRGcmFtZWJ1ZmZlciBAbUdMLkZSQU1FQlVGRkVSLCB0ZXg/Lm1PYmplY3RJRFxuXG4gICAgY3JlYXRlUmVuZGVyVGFyZ2V0TmV3OiAod2FudENvbG9yMCwgd2FudFpidWZmZXIsIHhyZXMsIHlyZXMsIHNhbXBsZXMpIC0+XG4gICAgICAgIGlkID0gQG1HTC5jcmVhdGVGcmFtZWJ1ZmZlcigpXG4gICAgICAgIEBtR0wuYmluZEZyYW1lYnVmZmVyIEBtR0wuRlJBTUVCVUZGRVIsIGlkXG4gICAgICAgIGlmIHdhbnRaYnVmZmVyID09IHRydWVcbiAgICAgICAgICAgIHpiID0gQG1HTC5jcmVhdGVSZW5kZXJidWZmZXIoKVxuICAgICAgICAgICAgQG1HTC5iaW5kUmVuZGVyYnVmZmVyIEBtR0wuUkVOREVSQlVGRkVSLCB6YlxuICAgICAgICAgICAgaWYgc2FtcGxlcyA9PSAxXG4gICAgICAgICAgICAgICAgQG1HTC5yZW5kZXJidWZmZXJTdG9yYWdlIEBtR0wuUkVOREVSQlVGRkVSLCBAbUdMLkRFUFRIX0NPTVBPTkVOVDE2LCB4cmVzLCB5cmVzXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQG1HTC5yZW5kZXJidWZmZXJTdG9yYWdlTXVsdGlzYW1wbGUgQG1HTC5SRU5ERVJCVUZGRVIsIHNhbXBsZXMsIEBtR0wuREVQVEhfQ09NUE9ORU5UMTYsIHhyZXMsIHlyZXNcbiAgICAgICAgICAgIEBtR0wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIgQG1HTC5GUkFNRUJVRkZFUiwgQG1HTC5ERVBUSF9BVFRBQ0hNRU5ULCBAbUdMLlJFTkRFUkJVRkZFUiwgemJcbiAgICAgICAgaWYgd2FudENvbG9yMFxuICAgICAgICAgICAgY2IgPSBAbUdMLmNyZWF0ZVJlbmRlcmJ1ZmZlcigpXG4gICAgICAgICAgICBAbUdMLmJpbmRSZW5kZXJidWZmZXIgQG1HTC5SRU5ERVJCVUZGRVIsIGNiXG4gICAgICAgICAgICBpZiBzYW1wbGVzID09IDFcbiAgICAgICAgICAgICAgICBAbUdMLnJlbmRlcmJ1ZmZlclN0b3JhZ2UgQG1HTC5SRU5ERVJCVUZGRVIsIEBtR0wuUkdCQTgsIHhyZXMsIHlyZXNcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAbUdMLnJlbmRlcmJ1ZmZlclN0b3JhZ2VNdWx0aXNhbXBsZSBAbUdMLlJFTkRFUkJVRkZFUiwgc2FtcGxlcywgQG1HTC5SR0JBOCwgeHJlcywgeXJlc1xuICAgICAgICAgICAgQG1HTC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlciBAbUdMLkZSQU1FQlVGRkVSLCBAbUdMLkNPTE9SX0FUVEFDSE1FTlQwLCBAbUdMLlJFTkRFUkJVRkZFUiwgY2JcbiAgICAgICAgaWYgQG1HTC5jaGVja0ZyYW1lYnVmZmVyU3RhdHVzKG1HTC5GUkFNRUJVRkZFUikgIT0gQG1HTC5GUkFNRUJVRkZFUl9DT01QTEVURVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgQG1HTC5iaW5kUmVuZGVyYnVmZmVyIEBtR0wuUkVOREVSQlVGRkVSLCBudWxsXG4gICAgICAgIEBtR0wuYmluZEZyYW1lYnVmZmVyIEBtR0wuRlJBTUVCVUZGRVIsIG51bGxcbiAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBtT2JqZWN0SUQ6IGlkXG4gICAgICAgICAgICBtWHJlczogeHJlc1xuICAgICAgICAgICAgbVlyZXM6IHlyZXNcbiAgICAgICAgICAgIG1UZXgwOiBjb2xvcjBcblxuICAgIGNyZWF0ZVJlbmRlclRhcmdldEN1YmVNYXA6IChjb2xvcjApIC0+XG4gICAgICAgIGlkID0gQG1HTC5jcmVhdGVGcmFtZWJ1ZmZlcigpXG4gICAgICAgIEBtR0wuYmluZEZyYW1lYnVmZmVyIEBtR0wuRlJBTUVCVUZGRVIsIGlkXG4gICAgICAgIEBtR0wuZnJhbWVidWZmZXJUZXh0dXJlMkQgQG1HTC5GUkFNRUJVRkZFUiwgQG1HTC5ERVBUSF9BVFRBQ0hNRU5ULCBAbUdMLlRFWFRVUkVfMkQsIGRlcHRoLm1PYmplY3RJRCwgMFxuICAgICAgICBpZiBjb2xvcjAgIT0gbnVsbFxuICAgICAgICAgICAgQG1HTC5mcmFtZWJ1ZmZlclRleHR1cmUyRCBAbUdMLkZSQU1FQlVGRkVSLCBAbUdMLkNPTE9SX0FUVEFDSE1FTlQwLCBAbUdMLlRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWCwgY29sb3IwLm1PYmplY3RJRCwgMFxuICAgICAgICBpZiBAbUdMLmNoZWNrRnJhbWVidWZmZXJTdGF0dXMobUdMLkZSQU1FQlVGRkVSKSAhPSBAbUdMLkZSQU1FQlVGRkVSX0NPTVBMRVRFXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBAbUdMLmJpbmRSZW5kZXJidWZmZXIgQG1HTC5SRU5ERVJCVUZGRVIsIG51bGxcbiAgICAgICAgQG1HTC5iaW5kRnJhbWVidWZmZXIgQG1HTC5GUkFNRUJVRkZFUiwgbnVsbFxuICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIG1PYmplY3RJRDogaWRcbiAgICAgICAgICAgIG1UZXgwOiBjb2xvcjBcblxuICAgIHNldFJlbmRlclRhcmdldEN1YmVNYXA6IChmYm8sIGZhY2UpIC0+XG4gICAgICAgIGlmIGZibyA9PSBudWxsXG4gICAgICAgICAgICBAbUdMLmJpbmRGcmFtZWJ1ZmZlciBAbUdMLkZSQU1FQlVGRkVSLCBudWxsXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBtR0wuYmluZEZyYW1lYnVmZmVyIEBtR0wuRlJBTUVCVUZGRVIsIGZiby5tT2JqZWN0SURcbiAgICAgICAgICAgIEBtR0wuZnJhbWVidWZmZXJUZXh0dXJlMkQgQG1HTC5GUkFNRUJVRkZFUiwgQG1HTC5DT0xPUl9BVFRBQ0hNRU5UMCwgQG1HTC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1ggKyBmYWNlLCBmYm8ubVRleDAubU9iamVjdElELCAwXG5cbiAgICBibGl0UmVuZGVyVGFyZ2V0OiAoZHN0LCBzcmMpIC0+XG4gICAgICAgIEBtR0wuYmluZEZyYW1lYnVmZmVyIEBtR0wuUkVBRF9GUkFNRUJVRkZFUiwgc3JjLm1PYmplY3RJRFxuICAgICAgICBAbUdMLmJpbmRGcmFtZWJ1ZmZlciBAbUdMLkRSQVdfRlJBTUVCVUZGRVIsIGRzdC5tT2JqZWN0SURcbiAgICAgICAgQG1HTC5jbGVhckJ1ZmZlcmZ2IEBtR0wuQ09MT1IsIDAsIFsgMCAwIDAgMSBdXG4gICAgICAgIEBtR0wuYmxpdEZyYW1lYnVmZmVyIDAsIDAsIHNyYy5tWHJlcywgc3JjLm1ZcmVzLCAwLCAwLCBzcmMubVhyZXMsIHNyYy5tWXJlcywgQG1HTC5DT0xPUl9CVUZGRVJfQklULCBAbUdMLkxJTkVBUlxuXG4gICAgc2V0Vmlld3BvcnQ6ICh2cCkgLT5cbiAgICAgICAgQG1HTC52aWV3cG9ydCB2cFswXSwgdnBbMV0sIHZwWzJdLCB2cFszXVxuXG4gICAgc2V0V3JpdGVNYXNrOiAoYzAsIGMxLCBjMiwgYzMsIHopIC0+XG4gICAgICAgIEBtR0wuZGVwdGhNYXNrIHpcbiAgICAgICAgQG1HTC5jb2xvck1hc2sgYzAsIGMwLCBjMCwgYzBcblxuICAgIHNldFN0YXRlOiAoc3RhdGVOYW1lLCBzdGF0ZVZhbHVlKSAtPlxuICAgICAgICBpZiBzdGF0ZU5hbWUgPT0gUmVuZGVyZXIuUkVORFNUR0FURS5XSVJFRlJBTUVcbiAgICAgICAgICAgIGlmIHN0YXRlVmFsdWVcbiAgICAgICAgICAgICAgICBAbUdMLnBvbHlnb25Nb2RlIEBtR0wuRlJPTlRfQU5EX0JBQ0ssIEBtR0wuTElORVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEBtR0wucG9seWdvbk1vZGUgQG1HTC5GUk9OVF9BTkRfQkFDSywgQG1HTC5GSUxMXG4gICAgICAgIGVsc2UgaWYgc3RhdGVOYW1lID09IFJlbmRlcmVyLlJFTkRTVEdBVEUuRlJPTlRfRkFDRVxuICAgICAgICAgICAgaWYgc3RhdGVWYWx1ZVxuICAgICAgICAgICAgICAgIEBtR0wuY3VsbEZhY2UgQG1HTC5CQUNLXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQG1HTC5jdWxsRmFjZSBAbUdMLkZST05UXG4gICAgICAgIGVsc2UgaWYgc3RhdGVOYW1lID09IFJlbmRlcmVyLlJFTkRTVEdBVEUuQ1VMTF9GQUNFXG4gICAgICAgICAgICBpZiBzdGF0ZVZhbHVlXG4gICAgICAgICAgICAgICAgQG1HTC5lbmFibGUgQG1HTC5DVUxMX0ZBQ0VcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAbUdMLmRpc2FibGUgQG1HTC5DVUxMX0ZBQ0VcbiAgICAgICAgZWxzZSBpZiBzdGF0ZU5hbWUgPT0gUmVuZGVyZXIuUkVORFNUR0FURS5ERVBUSF9URVNUXG4gICAgICAgICAgICBpZiBzdGF0ZVZhbHVlXG4gICAgICAgICAgICAgICAgQG1HTC5lbmFibGUgQG1HTC5ERVBUSF9URVNUXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQG1HTC5kaXNhYmxlIEBtR0wuREVQVEhfVEVTVFxuICAgICAgICBlbHNlIGlmIHN0YXRlTmFtZSA9PSBSZW5kZXJlci5SRU5EU1RHQVRFLkFMUEhBX1RPX0NPVkVSQUdFXG4gICAgICAgICAgICBpZiBzdGF0ZVZhbHVlXG4gICAgICAgICAgICAgICAgQG1HTC5lbmFibGUgQG1HTC5TQU1QTEVfQUxQSEFfVE9fQ09WRVJBR0VcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAbUdMLmRpc2FibGUgQG1HTC5TQU1QTEVfQUxQSEFfVE9fQ09WRVJBR0VcblxuICAgIHNldE11bHRpc2FtcGxlOiAodikgLT5cbiAgICAgICAgaWYgdiA9PSB0cnVlXG4gICAgICAgICAgICBAbUdMLmVuYWJsZSBAbUdMLlNBTVBMRV9DT1ZFUkFHRVxuICAgICAgICAgICAgQG1HTC5zYW1wbGVDb3ZlcmFnZSAxLjAsIGZhbHNlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBtR0wuZGlzYWJsZSBAbUdMLlNBTVBMRV9DT1ZFUkFHRVxuXG4gICAgY3JlYXRlU2hhZGVyOiAodnNTb3VyY2UsIGZzU291cmNlKSAtPlxuICAgICAgICBpZiBAbUdMID09IG51bGxcbiAgICAgICAgICAgIHJldHVybiBcbiAgICAgICAgICAgICAgICBtUHJvZ3JhbTogbnVsbFxuICAgICAgICAgICAgICAgIG1SZXN1bHQ6IGZhbHNlXG4gICAgICAgICAgICAgICAgbUluZm86ICdObyBXZWJHTCdcbiAgICAgICAgICAgICAgICBtSGVhZGVyTGluZXM6IDBcbiAgICAgICAgdGUgPSBcbiAgICAgICAgICAgIG1Qcm9ncmFtOiBudWxsXG4gICAgICAgICAgICBtUmVzdWx0OiB0cnVlXG4gICAgICAgICAgICBtSW5mbzogJ1NoYWRlciBjb21waWxlZCBzdWNjZXNzZnVsbHknXG4gICAgICAgICAgICBtSGVhZGVyTGluZXM6IDBcbiAgICAgICAgICAgIG1FcnJvclR5cGU6IDBcbiAgICAgICAgdnMgPSBAbUdMLmNyZWF0ZVNoYWRlcihAbUdMLlZFUlRFWF9TSEFERVIpXG4gICAgICAgIGZzID0gQG1HTC5jcmVhdGVTaGFkZXIoQG1HTC5GUkFHTUVOVF9TSEFERVIpXG4gICAgICAgIG1TaGFkZXJIZWFkZXIgPSAnI3ZlcnNpb24gMzAwIGVzXFxuJyArICcjaWZkZWYgR0xfRVNcXG4nICsgJ3ByZWNpc2lvbiBoaWdocCBmbG9hdDtcXG4nICsgJ3ByZWNpc2lvbiBoaWdocCBpbnQ7XFxuJyArICdwcmVjaXNpb24gbWVkaXVtcCBzYW1wbGVyM0Q7XFxuJyArICcjZW5kaWZcXG4nXG4gICAgICAgIEBtR0wuc2hhZGVyU291cmNlIHZzLCBtU2hhZGVySGVhZGVyICsgdnNTb3VyY2VcbiAgICAgICAgQG1HTC5zaGFkZXJTb3VyY2UgZnMsIG1TaGFkZXJIZWFkZXIgKyBmc1NvdXJjZVxuICAgICAgICBAbUdMLmNvbXBpbGVTaGFkZXIgdnNcbiAgICAgICAgQG1HTC5jb21waWxlU2hhZGVyIGZzXG4gICAgICAgIGlmIG5vdCBAbUdMLmdldFNoYWRlclBhcmFtZXRlcih2cywgQG1HTC5DT01QSUxFX1NUQVRVUylcbiAgICAgICAgICAgIGluZm9Mb2cgPSBAbUdMLmdldFNoYWRlckluZm9Mb2codnMpXG4gICAgICAgICAgICB0ZS5tSW5mbyA9IGluZm9Mb2dcbiAgICAgICAgICAgIHRlLm1FcnJvclR5cGUgPSAwXG4gICAgICAgICAgICB0ZS5tUmVzdWx0ID0gZmFsc2VcbiAgICAgICAgICAgIHJldHVybiB0ZVxuICAgICAgICBpZiBub3QgQG1HTC5nZXRTaGFkZXJQYXJhbWV0ZXIoZnMsIEBtR0wuQ09NUElMRV9TVEFUVVMpXG4gICAgICAgICAgICBpbmZvTG9nID0gQG1HTC5nZXRTaGFkZXJJbmZvTG9nKGZzKVxuICAgICAgICAgICAgdGUubUluZm8gPSBpbmZvTG9nXG4gICAgICAgICAgICB0ZS5tRXJyb3JUeXBlID0gMVxuICAgICAgICAgICAgdGUubVJlc3VsdCA9IGZhbHNlXG4gICAgICAgICAgICByZXR1cm4gdGVcbiAgICAgICAgdGUubVByb2dyYW0gPSBAbUdMLmNyZWF0ZVByb2dyYW0oKVxuICAgICAgICBAbUdMLmF0dGFjaFNoYWRlciB0ZS5tUHJvZ3JhbSwgdnNcbiAgICAgICAgQG1HTC5hdHRhY2hTaGFkZXIgdGUubVByb2dyYW0sIGZzXG4gICAgICAgIEBtR0wubGlua1Byb2dyYW0gdGUubVByb2dyYW1cbiAgICAgICAgaWYgbm90IEBtR0wuZ2V0UHJvZ3JhbVBhcmFtZXRlcih0ZS5tUHJvZ3JhbSwgQG1HTC5MSU5LX1NUQVRVUylcbiAgICAgICAgICAgIGluZm9Mb2cgPSBAbUdMLmdldFByb2dyYW1JbmZvTG9nKHRlLm1Qcm9ncmFtKVxuICAgICAgICAgICAgQG1HTC5kZWxldGVQcm9ncmFtIHRlLm1Qcm9ncmFtXG4gICAgICAgICAgICB0ZS5tSW5mbyA9IGluZm9Mb2dcbiAgICAgICAgICAgIHRlLm1FcnJvclR5cGUgPSAyXG4gICAgICAgICAgICB0ZS5tUmVzdWx0ID0gZmFsc2VcbiAgICAgICAgdGVcblxuICAgIGF0dGFjaFNoYWRlcjogKHNoYWRlcikgLT5cbiAgICAgICAgQG1CaW5kZWRTaGFkZXIgPSBzaGFkZXJcbiAgICAgICAgQG1HTC51c2VQcm9ncmFtIHNoYWRlcj8ubVByb2dyYW1cblxuICAgIGRldGFjaFNoYWRlcjogLT4gQG1HTC51c2VQcm9ncmFtIG51bGxcblxuICAgIGRlc3Ryb3lTaGFkZXI6ICh0ZXgpIC0+IEBtR0wuZGVsZXRlUHJvZ3JhbSB0ZXgubVByb2dyYW1cblxuICAgIGdldEF0dHJpYkxvY2F0aW9uOiAoc2hhZGVyLCBuYW1lKSAtPlxuICAgICAgICBAbUdMLmdldEF0dHJpYkxvY2F0aW9uIHNoYWRlci5tUHJvZ3JhbSwgbmFtZVxuXG4gICAgc2V0U2hhZGVyQ29uc3RhbnRMb2NhdGlvbjogKHNoYWRlciwgbmFtZSkgLT5cbiAgICAgICAgQG1HTC5nZXRVbmlmb3JtTG9jYXRpb24gc2hhZGVyLm1Qcm9ncmFtLCBuYW1lXG5cbiAgICBzZXRTaGFkZXJDb25zdGFudDFGX1BvczogKHBvcywgeCkgLT5cbiAgICAgICAgQG1HTC51bmlmb3JtMWYgcG9zLCB4XG4gICAgICAgIHRydWVcblxuICAgIHNldFNoYWRlckNvbnN0YW50MUZWX1BvczogKHBvcywgeCkgLT5cbiAgICAgICAgQG1HTC51bmlmb3JtMWZ2IHBvcywgeFxuICAgICAgICB0cnVlXG5cbiAgICBzZXRTaGFkZXJDb25zdGFudDFGOiAodW5hbWUsIHgpIC0+XG4gICAgICAgIHBvcyA9IEBtR0wuZ2V0VW5pZm9ybUxvY2F0aW9uKEBtQmluZGVkU2hhZGVyLm1Qcm9ncmFtLCB1bmFtZSlcbiAgICAgICAgaWYgcG9zID09IG51bGxcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICBAbUdMLnVuaWZvcm0xZiBwb3MsIHhcbiAgICAgICAgdHJ1ZVxuXG4gICAgc2V0U2hhZGVyQ29uc3RhbnQxSTogKHVuYW1lLCB4KSAtPlxuICAgICAgICBwb3MgPSBAbUdMLmdldFVuaWZvcm1Mb2NhdGlvbihAbUJpbmRlZFNoYWRlci5tUHJvZ3JhbSwgdW5hbWUpXG4gICAgICAgIGlmIHBvcyA9PSBudWxsXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgQG1HTC51bmlmb3JtMWkgcG9zLCB4XG4gICAgICAgIHRydWVcblxuICAgIHNldFNoYWRlckNvbnN0YW50MkY6ICh1bmFtZSwgeCkgLT5cbiAgICAgICAgcG9zID0gQG1HTC5nZXRVbmlmb3JtTG9jYXRpb24oQG1CaW5kZWRTaGFkZXIubVByb2dyYW0sIHVuYW1lKVxuICAgICAgICBpZiBwb3MgPT0gbnVsbFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIEBtR0wudW5pZm9ybTJmdiBwb3MsIHhcbiAgICAgICAgdHJ1ZVxuXG4gICAgc2V0U2hhZGVyQ29uc3RhbnQzRjogKHVuYW1lLCB4LCB5LCB6KSAtPlxuICAgICAgICBwb3MgPSBAbUdMLmdldFVuaWZvcm1Mb2NhdGlvbihAbUJpbmRlZFNoYWRlci5tUHJvZ3JhbSwgdW5hbWUpXG4gICAgICAgIGlmIHBvcyA9PSBudWxsXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgQG1HTC51bmlmb3JtM2YgcG9zLCB4LCB5LCB6XG4gICAgICAgIHRydWVcblxuICAgIHNldFNoYWRlckNvbnN0YW50MUZWOiAodW5hbWUsIHgpIC0+XG4gICAgICAgIHBvcyA9IEBtR0wuZ2V0VW5pZm9ybUxvY2F0aW9uKEBtQmluZGVkU2hhZGVyLm1Qcm9ncmFtLCB1bmFtZSlcbiAgICAgICAgaWYgcG9zID09IG51bGxcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICBAbUdMLnVuaWZvcm0xZnYgcG9zLCBuZXcgRmxvYXQzMkFycmF5KHgpXG4gICAgICAgIHRydWVcblxuICAgIHNldFNoYWRlckNvbnN0YW50M0ZWOiAodW5hbWUsIHgpIC0+XG4gICAgICAgIHBvcyA9IEBtR0wuZ2V0VW5pZm9ybUxvY2F0aW9uKEBtQmluZGVkU2hhZGVyLm1Qcm9ncmFtLCB1bmFtZSlcbiAgICAgICAgaWYgcG9zID09IG51bGxcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICBAbUdMLnVuaWZvcm0zZnYgcG9zLCBuZXcgRmxvYXQzMkFycmF5KHgpXG4gICAgICAgIHRydWVcblxuICAgIHNldFNoYWRlckNvbnN0YW50NEZWOiAodW5hbWUsIHgpIC0+XG4gICAgICAgIHBvcyA9IEBtR0wuZ2V0VW5pZm9ybUxvY2F0aW9uKEBtQmluZGVkU2hhZGVyLm1Qcm9ncmFtLCB1bmFtZSlcbiAgICAgICAgaWYgcG9zID09IG51bGxcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICBAbUdMLnVuaWZvcm00ZnYgcG9zLCBuZXcgRmxvYXQzMkFycmF5KHgpXG4gICAgICAgIHRydWVcblxuICAgIHNldFNoYWRlclRleHR1cmVVbml0OiAodW5hbWUsIHVuaXQpIC0+XG4gICAgICAgIHByb2dyYW0gPSBAbUJpbmRlZFNoYWRlclxuICAgICAgICBwb3MgPSBAbUdMLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLm1Qcm9ncmFtLCB1bmFtZSlcbiAgICAgICAgaWYgcG9zID09IG51bGxcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICBAbUdMLnVuaWZvcm0xaSBwb3MsIHVuaXRcbiAgICAgICAgdHJ1ZVxuXG4gICAgY3JlYXRlVmVydGV4QXJyYXk6IChkYXRhLCBtb2RlKSAtPlxuICAgICAgICBpZCA9IEBtR0wuY3JlYXRlQnVmZmVyKClcbiAgICAgICAgQG1HTC5iaW5kQnVmZmVyIEBtR0wuQVJSQVlfQlVGRkVSLCBpZFxuICAgICAgICBpZiBtb2RlID09IG1lLkJVRlRZUEUuU1RBVElDXG4gICAgICAgICAgICBAbUdMLmJ1ZmZlckRhdGEgQG1HTC5BUlJBWV9CVUZGRVIsIGRhdGEsIEBtR0wuU1RBVElDX0RSQVdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQG1HTC5idWZmZXJEYXRhIEBtR0wuQVJSQVlfQlVGRkVSLCBkYXRhLCBAbUdMLkRZTkFNSUNfRFJBV1xuICAgICAgICByZXR1cm4gbU9iamVjdDppZFxuXG4gICAgY3JlYXRlSW5kZXhBcnJheTogKGRhdGEsIG1vZGUpIC0+XG4gICAgICAgIGlkID0gQG1HTC5jcmVhdGVCdWZmZXIoKVxuICAgICAgICBAbUdMLmJpbmRCdWZmZXIgQG1HTC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaWRcbiAgICAgICAgaWYgbW9kZSA9PSBtZS5CVUZUWVBFLlNUQVRJQ1xuICAgICAgICAgICAgQG1HTC5idWZmZXJEYXRhIEBtR0wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGRhdGEsIEBtR0wuU1RBVElDX0RSQVdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQG1HTC5idWZmZXJEYXRhIEBtR0wuRUxFTUVOVF9BUlJBWV9CVUZGRVIsIGRhdGEsIEBtR0wuRFlOQU1JQ19EUkFXXG4gICAgICAgIHJldHVybiBtT2JqZWN0OmlkXG5cbiAgICBkZXN0cm95QXJyYXk6ICh0ZXgpIC0+IEBtR0wuZGVzdHJveUJ1ZmZlciB0ZXgubU9iamVjdFxuXG4gICAgYXR0YWNoVmVydGV4QXJyYXk6ICh0ZXgsIGF0dHJpYnMsIHBvcykgLT5cbiAgICAgICAgc2hhZGVyID0gQG1CaW5kZWRTaGFkZXJcbiAgICAgICAgQG1HTC5iaW5kQnVmZmVyIEBtR0wuQVJSQVlfQlVGRkVSLCB0ZXgubU9iamVjdFxuICAgICAgICBudW0gPSBhdHRyaWJzLm1DaGFubmVscy5sZW5ndGhcbiAgICAgICAgc3RyaWRlID0gYXR0cmlicy5tU3RyaWRlXG4gICAgICAgIG9mZnNldCA9IDBcbiAgICAgICAgaSA9IDBcbiAgICAgICAgd2hpbGUgaSA8IG51bVxuICAgICAgICAgICAgaWQgPSBwb3NbaV1cbiAgICAgICAgICAgIEBtR0wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkgaWRcbiAgICAgICAgICAgIGR0eXBlID0gQG1HTC5GTE9BVFxuICAgICAgICAgICAgZHNpemUgPSA0XG4gICAgICAgICAgICBpZiBhdHRyaWJzLm1DaGFubmVsc1tpXS5tVHlwZSA9PSBtZS5UWVBFLlVJTlQ4XG4gICAgICAgICAgICAgICAgZHR5cGUgPSBAbUdMLlVOU0lHTkVEX0JZVEVcbiAgICAgICAgICAgICAgICBkc2l6ZSA9IDFcbiAgICAgICAgICAgIGVsc2UgaWYgYXR0cmlicy5tQ2hhbm5lbHNbaV0ubVR5cGUgPT0gbWUuVFlQRS5VSU5UMTZcbiAgICAgICAgICAgICAgICBkdHlwZSA9IEBtR0wuVU5TSUdORURfU0hPUlRcbiAgICAgICAgICAgICAgICBkc2l6ZSA9IDJcbiAgICAgICAgICAgIGVsc2UgaWYgYXR0cmlicy5tQ2hhbm5lbHNbaV0ubVR5cGUgPT0gbWUuVFlQRS5GTE9BVDMyXG4gICAgICAgICAgICAgICAgZHR5cGUgPSBAbUdMLkZMT0FUXG4gICAgICAgICAgICAgICAgZHNpemUgPSA0XG4gICAgICAgICAgICBAbUdMLnZlcnRleEF0dHJpYlBvaW50ZXIgaWQsIGF0dHJpYnMubUNoYW5uZWxzW2ldLm1OdW1Db21wb25lbnRzLCBkdHlwZSwgYXR0cmlicy5tQ2hhbm5lbHNbaV0ubU5vcm1hbGl6ZSwgc3RyaWRlLCBvZmZzZXRcbiAgICAgICAgICAgIG9mZnNldCArPSBhdHRyaWJzLm1DaGFubmVsc1tpXS5tTnVtQ29tcG9uZW50cyAqIGRzaXplXG4gICAgICAgICAgICBpKytcblxuICAgIGF0dGFjaEluZGV4QXJyYXk6ICh0ZXgpIC0+XG4gICAgICAgIEBtR0wuYmluZEJ1ZmZlciBAbUdMLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCB0ZXgubU9iamVjdFxuXG4gICAgZGV0YWNoVmVydGV4QXJyYXk6ICh0ZXgsIGF0dHJpYnMpIC0+XG4gICAgICAgIG51bSA9IGF0dHJpYnMubUNoYW5uZWxzLmxlbmd0aFxuICAgICAgICBpID0gMFxuICAgICAgICB3aGlsZSBpIDwgbnVtXG4gICAgICAgICAgICBAbUdMLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheSBpXG4gICAgICAgICAgICBpKytcbiAgICAgICAgQG1HTC5iaW5kQnVmZmVyIEBtR0wuQVJSQVlfQlVGRkVSLCBudWxsXG5cbiAgICBkZXRhY2hJbmRleEFycmF5OiAodGV4KSAtPlxuICAgICAgICBAbUdMLmJpbmRCdWZmZXIgQG1HTC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgbnVsbFxuXG4gICAgZHJhd1ByaW1pdGl2ZTogKHR5cGVPZlByaW1pdGl2ZSwgbnVtLCB1c2VJbmRleEFycmF5LCBudW1JbnN0YW5jZXMpIC0+XG4gICAgICAgIGdsVHlwZSA9IEBtR0wuUE9JTlRTXG4gICAgICAgIGlmIHR5cGVPZlByaW1pdGl2ZSA9PSBtZS5QUklNVFlQRS5QT0lOVFNcbiAgICAgICAgICAgIGdsVHlwZSA9IEBtR0wuUE9JTlRTXG4gICAgICAgIGlmIHR5cGVPZlByaW1pdGl2ZSA9PSBtZS5QUklNVFlQRS5MSU5FU1xuICAgICAgICAgICAgZ2xUeXBlID0gQG1HTC5MSU5FU1xuICAgICAgICBpZiB0eXBlT2ZQcmltaXRpdmUgPT0gbWUuUFJJTVRZUEUuTElORV9MT09QXG4gICAgICAgICAgICBnbFR5cGUgPSBAbUdMLkxJTkVfTE9PUFxuICAgICAgICBpZiB0eXBlT2ZQcmltaXRpdmUgPT0gbWUuUFJJTVRZUEUuTElORV9TVFJJUFxuICAgICAgICAgICAgZ2xUeXBlID0gQG1HTC5MSU5FX1NUUklQXG4gICAgICAgIGlmIHR5cGVPZlByaW1pdGl2ZSA9PSBtZS5QUklNVFlQRS5UUklBTkdMRVNcbiAgICAgICAgICAgIGdsVHlwZSA9IEBtR0wuVFJJQU5HTEVTXG4gICAgICAgIGlmIHR5cGVPZlByaW1pdGl2ZSA9PSBtZS5QUklNVFlQRS5UUklBTkdMRV9TVFJJUFxuICAgICAgICAgICAgZ2xUeXBlID0gQG1HTC5UUklBTkdMRV9TVFJJUFxuICAgICAgICBpZiBudW1JbnN0YW5jZXMgPD0gMVxuICAgICAgICAgICAgaWYgdXNlSW5kZXhBcnJheVxuICAgICAgICAgICAgICAgIEBtR0wuZHJhd0VsZW1lbnRzIGdsVHlwZSwgbnVtLCBAbUdMLlVOU0lHTkVEX1NIT1JULCAwXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQG1HTC5kcmF3QXJyYXlzIGdsVHlwZSwgMCwgbnVtXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBtR0wuZHJhd0FycmF5c0luc3RhbmNlZCBnbFR5cGUsIDAsIG51bSwgbnVtSW5zdGFuY2VzXG4gICAgICAgICAgICBAbUdMLmRyYXdFbGVtZW50c0luc3RhbmNlZCBnbFR5cGUsIG51bSwgQG1HTC5VTlNJR05FRF9TSE9SVCwgMCwgbnVtSW5zdGFuY2VzXG5cbiAgICBkcmF3RnVsbFNjcmVlblRyaWFuZ2xlX1hZOiAodnBvcykgLT5cbiAgICAgICAgQG1HTC5iaW5kQnVmZmVyIEBtR0wuQVJSQVlfQlVGRkVSLCBAbVZCT19UcmlcbiAgICAgICAgQG1HTC52ZXJ0ZXhBdHRyaWJQb2ludGVyIHZwb3MsIDIsIEBtR0wuRkxPQVQsIGZhbHNlLCAwLCAwXG4gICAgICAgIEBtR0wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkgdnBvc1xuICAgICAgICBAbUdMLmRyYXdBcnJheXMgQG1HTC5UUklBTkdMRVMsIDAsIDNcbiAgICAgICAgQG1HTC5kaXNhYmxlVmVydGV4QXR0cmliQXJyYXkgdnBvc1xuICAgICAgICBAbUdMLmJpbmRCdWZmZXIgQG1HTC5BUlJBWV9CVUZGRVIsIG51bGxcblxuICAgIGRyYXdVbml0UXVhZF9YWTogKHZwb3MpIC0+XG4gICAgICAgIEBtR0wuYmluZEJ1ZmZlciBAbUdMLkFSUkFZX0JVRkZFUiwgQG1WQk9fUXVhZFxuICAgICAgICBAbUdMLnZlcnRleEF0dHJpYlBvaW50ZXIgdnBvcywgMiwgQG1HTC5GTE9BVCwgZmFsc2UsIDAsIDBcbiAgICAgICAgQG1HTC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSB2cG9zXG4gICAgICAgIEBtR0wuZHJhd0FycmF5cyBAbUdMLlRSSUFOR0xFUywgMCwgNlxuICAgICAgICBAbUdMLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheSB2cG9zXG4gICAgICAgIEBtR0wuYmluZEJ1ZmZlciBAbUdMLkFSUkFZX0JVRkZFUiwgbnVsbFxuXG4gICAgc2V0QmxlbmQ6IChlbmFibGVkKSAtPlxuICAgICAgICBpZiBlbmFibGVkXG4gICAgICAgICAgICBAbUdMLmVuYWJsZSBAbUdMLkJMRU5EXG4gICAgICAgICAgICBAbUdMLmJsZW5kRXF1YXRpb25TZXBhcmF0ZSBAbUdMLkZVTkNfQURELCBAbUdMLkZVTkNfQUREXG4gICAgICAgICAgICBAbUdMLmJsZW5kRnVuY1NlcGFyYXRlIEBtR0wuU1JDX0FMUEhBLCBAbUdMLk9ORV9NSU5VU19TUkNfQUxQSEEsIEBtR0wuT05FLCBAbUdMLk9ORV9NSU5VU19TUkNfQUxQSEFcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQG1HTC5kaXNhYmxlIEBtR0wuQkxFTkRcblxuICAgIGdldFBpeGVsRGF0YTogKGRhdGEsIG9mZnNldCwgeHJlcywgeXJlcykgLT5cbiAgICAgICAgQG1HTC5yZWFkUGl4ZWxzIDAsIDAsIHhyZXMsIHlyZXMsIEBtR0wuUkdCQSwgQG1HTC5VTlNJR05FRF9CWVRFLCBkYXRhLCBvZmZzZXRcblxuICAgIGdldFBpeGVsRGF0YVJlbmRlclRhcmdldDogKG9iaiwgZGF0YSwgeHJlcywgeXJlcykgLT5cbiAgICAgICAgQG1HTC5iaW5kRnJhbWVidWZmZXIgQG1HTC5GUkFNRUJVRkZFUiwgb2JqLm1PYmplY3RJRFxuICAgICAgICBAbUdMLnJlYWRCdWZmZXIgQG1HTC5DT0xPUl9BVFRBQ0hNRU5UMFxuICAgICAgICBAbUdMLnJlYWRQaXhlbHMgMCwgMCwgeHJlcywgeXJlcywgQG1HTC5SR0JBLCBAbUdMLkZMT0FULCBkYXRhLCAwXG4gICAgICAgIEBtR0wuYmluZEZyYW1lYnVmZmVyIEBtR0wuRlJBTUVCVUZGRVIsIG51bGxcblxuICAgIEBjcmVhdGVHbENvbnRleHQ6IChjdikgLT5cbiAgICAgICAgY3YuZ2V0Q29udGV4dCAnd2ViZ2wyJywgXG4gICAgICAgICAgICBhbHBoYTogZmFsc2VcbiAgICAgICAgICAgIGRlcHRoOiBmYWxzZVxuICAgICAgICAgICAgc3RlbmNpbDogZmFsc2VcbiAgICAgICAgICAgIHByZW11bHRpcGxpZWRBbHBoYTogZmFsc2VcbiAgICAgICAgICAgIGFudGlhbGlhczogZmFsc2VcbiAgICAgICAgICAgIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjogZmFsc2VcbiAgICAgICAgICAgIHBvd2VyUHJlZmVyZW5jZTogJ2hpZ2gtcGVyZm9ybWFuY2UnIFxuICAgICAgICAgICAgIyBcImxvd19wb3dlclwiLCBcImhpZ2hfcGVyZm9ybWFuY2VcIiwgXCJkZWZhdWx0XCJcbiJdfQ==
//# sourceURL=../../coffee/toy/renderer.coffee