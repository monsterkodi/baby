// koffee 1.7.0
var piCreateGlContext, piRenderer;

piRenderer = function() {
    var iFormatPI2GL, mAnisotropic, mBindedShader, mDepthTextures, mDerivatives, mDrawBuffers, mFloat16Filter, mFloat16Textures, mFloat32Filter, mFloat32Textures, mGL, mRenderToFloat32F, mVBO_CubePos, mVBO_CubePosNor, mVBO_Quad, mVBO_Tri, me;
    mGL = null;
    mBindedShader = null;
    mFloat32Textures = void 0;
    mFloat32Filter = void 0;
    mFloat16Textures = void 0;
    mDrawBuffers = void 0;
    mDepthTextures = void 0;
    mDerivatives = void 0;
    mFloat32Filter = void 0;
    mFloat16Filter = void 0;
    mAnisotropic = void 0;
    mRenderToFloat32F = void 0;
    mVBO_Quad = null;
    mVBO_Tri = null;
    mVBO_CubePosNor = null;
    mVBO_CubePos = null;
    me = {};
    me.CLEAR = {
        Color: 1,
        Zbuffer: 2,
        Stencil: 4
    };
    me.TEXFMT = {
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
    me.TEXWRP = {
        CLAMP: 0,
        REPEAT: 1
    };
    me.BUFTYPE = {
        STATIC: 0,
        DYNAMIC: 1
    };
    me.PRIMTYPE = {
        POINTS: 0,
        LINES: 1,
        LINE_LOOP: 2,
        LINE_STRIP: 3,
        TRIANGLES: 4,
        TRIANGLE_STRIP: 5
    };
    me.RENDSTGATE = {
        WIREFRAME: 0,
        FRONT_FACE: 1,
        CULL_FACE: 2,
        DEPTH_TEST: 3,
        ALPHA_TO_COVERAGE: 4
    };
    me.TEXTYPE = {
        T2D: 0,
        T3D: 1,
        CUBEMAP: 2
    };
    me.FILTER = {
        NONE: 0,
        LINEAR: 1,
        MIPMAP: 2,
        NONE_MIPMAP: 3
    };
    me.TYPE = {
        UINT8: 0,
        UINT16: 1,
        UINT32: 2,
        FLOAT16: 3,
        FLOAT32: 4,
        FLOAT64: 5
    };
    iFormatPI2GL = function(format) {
        if (format === me.TEXFMT.C4I8) {
            return {
                mGLFormat: mGL.RGBA8,
                mGLExternal: mGL.RGBA,
                mGLType: mGL.UNSIGNED_BYTE
            };
        } else if (format === me.TEXFMT.C1I8) {
            return {
                mGLFormat: mGL.R8,
                mGLExternal: mGL.RED,
                mGLType: mGL.UNSIGNED_BYTE
            };
        } else if (format === me.TEXFMT.C1F16) {
            return {
                mGLFormat: mGL.R16F,
                mGLExternal: mGL.RED,
                mGLType: mGL.FLOAT
            };
        } else if (format === me.TEXFMT.C4F16) {
            return {
                mGLFormat: mGL.RGBA16F,
                mGLExternal: mGL.RGBA,
                mGLType: mGL.FLOAT
            };
        } else if (format === me.TEXFMT.C1F32) {
            return {
                mGLFormat: mGL.R32F,
                mGLExternal: mGL.RED,
                mGLType: mGL.FLOAT
            };
        } else if (format === me.TEXFMT.C4F32) {
            return {
                mGLFormat: mGL.RGBA32F,
                mGLExternal: mGL.RGBA,
                mGLType: mGL.FLOAT
            };
        } else if (format === me.TEXFMT.C3F32) {
            return {
                mGLFormat: mGL.RGB32F,
                mGLExternal: mGL.RGB,
                mGLType: mGL.FLOAT
            };
        } else if (format === me.TEXFMT.Z16) {
            return {
                mGLFormat: mGL.DEPTH_COMPONENT16,
                mGLExternal: mGL.DEPTH_COMPONENT,
                mGLType: mGL.UNSIGNED_SHORT
            };
        } else if (format === me.TEXFMT.Z24) {
            return {
                mGLFormat: mGL.DEPTH_COMPONENT24,
                mGLExternal: mGL.DEPTH_COMPONENT,
                mGLType: mGL.UNSIGNED_SHORT
            };
        } else if (format === me.TEXFMT.Z32) {
            return {
                mGLFormat: mGL.DEPTH_COMPONENT32F,
                mGLExternal: mGL.DEPTH_COMPONENT,
                mGLType: mGL.UNSIGNED_SHORT
            };
        }
        return null;
    };
    me.Initialize = function(gl) {
        var extensions, maxCubeSize, maxRenderbufferSize, maxTexSize, textureUnits, vertices;
        mGL = gl;
        mFloat32Textures = true;
        mFloat32Filter = mGL.getExtension('OES_texture_float_linear');
        mFloat16Textures = true;
        mFloat16Filter = mGL.getExtension('OES_texture_half_float_linear');
        mDerivatives = true;
        mDrawBuffers = true;
        mDepthTextures = true;
        mAnisotropic = mGL.getExtension('EXT_texture_filter_anisotropic');
        mRenderToFloat32F = mGL.getExtension('EXT_color_buffer_float');
        maxTexSize = mGL.getParameter(mGL.MAX_TEXTURE_SIZE);
        maxCubeSize = mGL.getParameter(mGL.MAX_CUBE_MAP_TEXTURE_SIZE);
        maxRenderbufferSize = mGL.getParameter(mGL.MAX_RENDERBUFFER_SIZE);
        extensions = mGL.getSupportedExtensions();
        textureUnits = mGL.getParameter(mGL.MAX_TEXTURE_IMAGE_UNITS);
        console.log('WebGL:' + ' F32 Textures: ' + (mFloat32Textures !== null ? 'yes' : 'no') + ', Render to 32F: ' + (mRenderToFloat32F !== null ? 'yes' : 'no') + ', Max Texture Size: ' + maxTexSize + ', Max Render Buffer Size: ' + maxRenderbufferSize + ', Max Cubemap Size: ' + maxCubeSize);
        vertices = new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0]);
        mVBO_Quad = mGL.createBuffer();
        mGL.bindBuffer(mGL.ARRAY_BUFFER, mVBO_Quad);
        mGL.bufferData(mGL.ARRAY_BUFFER, vertices, mGL.STATIC_DRAW);
        mGL.bindBuffer(mGL.ARRAY_BUFFER, null);
        mVBO_Tri = mGL.createBuffer();
        mGL.bindBuffer(mGL.ARRAY_BUFFER, mVBO_Tri);
        mGL.bufferData(mGL.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0]), mGL.STATIC_DRAW);
        mGL.bindBuffer(mGL.ARRAY_BUFFER, null);
        mVBO_CubePosNor = mGL.createBuffer();
        mGL.bindBuffer(mGL.ARRAY_BUFFER, mVBO_CubePosNor);
        mGL.bufferData(mGL.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, -1.0, -1.0, 0.0, 0.0, -1.0, -1.0, 1.0, -1.0, 0.0, 0.0, -1.0, 1.0, -1.0, -1.0, 0.0, 0.0, -1.0, 1.0, 1.0, -1.0, 0.0, 0.0, 1.0, 1.0, -1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 1.0, -1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0, 1.0, -1.0, 0.0, 1.0, 0.0, -1.0, 1.0, 1.0, 0.0, 1.0, 0.0, -1.0, 1.0, -1.0, 0.0, 1.0, 0.0, 1.0, -1.0, -1.0, 0.0, -1.0, 0.0, 1.0, -1.0, 1.0, 0.0, -1.0, 0.0, -1.0, -1.0, -1.0, 0.0, -1.0, 0.0, -1.0, -1.0, 1.0, 0.0, -1.0, 0.0, -1.0, 1.0, 1.0, 0.0, 0.0, 1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, -1.0, 1.0, 0.0, 0.0, 1.0, -1.0, -1.0, -1.0, 0.0, 0.0, -1.0, -1.0, 1.0, -1.0, 0.0, 0.0, -1.0, 1.0, -1.0, -1.0, 0.0, 0.0, -1.0, 1.0, 1.0, -1.0, 0.0, 0.0, -1.0]), mGL.STATIC_DRAW);
        mGL.bindBuffer(mGL.ARRAY_BUFFER, null);
        mVBO_CubePos = mGL.createBuffer();
        mGL.bindBuffer(mGL.ARRAY_BUFFER, mVBO_CubePos);
        mGL.bufferData(mGL.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0]), mGL.STATIC_DRAW);
        mGL.bindBuffer(mGL.ARRAY_BUFFER, null);
        return true;
    };
    me.CheckErrors = function() {
        var error, prop;
        error = mGL.getError();
        if (error !== mGL.NO_ERROR) {
            for (prop in mGL) {
                if (typeof mGL[prop] === 'number') {
                    if (mGL[prop] === error) {
                        console.log('GL Error ' + error + ': ' + prop);
                        break;
                    }
                }
            }
        }
    };
    me.Clear = function(flags, ccolor, cdepth, cstencil) {
        var mode;
        mode = 0;
        if (flags & 1) {
            mode |= mGL.COLOR_BUFFER_BIT;
            mGL.clearColor(ccolor[0], ccolor[1], ccolor[2], ccolor[3]);
        }
        if (flags & 2) {
            mode |= mGL.DEPTH_BUFFER_BIT;
            mGL.clearDepth(cdepth);
        }
        if (flags & 4) {
            mode |= mGL.STENCIL_BUFFER_BIT;
            mGL.clearStencil(cstencil);
        }
        mGL.clear(mode);
    };
    me.CreateTexture = function(type, xres, yres, format, filter, wrap, buffer) {
        var glFoTy, glWrap, id;
        if (mGL === null) {
            return null;
        }
        id = mGL.createTexture();
        glFoTy = iFormatPI2GL(format);
        glWrap = mGL.REPEAT;
        if (wrap === me.TEXWRP.CLAMP) {
            glWrap = mGL.CLAMP_TO_EDGE;
        }
        if (type === me.TEXTYPE.T2D) {
            mGL.bindTexture(mGL.TEXTURE_2D, id);
            mGL.texImage2D(mGL.TEXTURE_2D, 0, glFoTy.mGLFormat, xres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer);
            mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_WRAP_S, glWrap);
            mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_WRAP_T, glWrap);
            if (filter === me.FILTER.NONE) {
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
            } else if (filter === me.FILTER.LINEAR) {
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR);
            } else if (filter === me.FILTER.MIPMAP) {
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
                mGL.generateMipmap(mGL.TEXTURE_2D);
            } else {
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST_MIPMAP_LINEAR);
                mGL.generateMipmap(mGL.TEXTURE_2D);
            }
            mGL.bindTexture(mGL.TEXTURE_2D, null);
        } else if (type === me.TEXTYPE.T3D) {
            mGL.bindTexture(mGL.TEXTURE_3D, id);
            mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_BASE_LEVEL, 0);
            mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAX_LEVEL, Math.log2(xres));
            if (filter === me.FILTER.NONE) {
                mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
            } else if (filter === me.FILTER.LINEAR) {
                mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR);
            } else if (filter === me.FILTER.MIPMAP) {
                mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
            } else {
                mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST_MIPMAP_LINEAR);
                mGL.generateMipmap(mGL.TEXTURE_3D);
            }
            mGL.texImage3D(mGL.TEXTURE_3D, 0, glFoTy.mGLFormat, xres, yres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer);
            mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_WRAP_R, glWrap);
            mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_WRAP_S, glWrap);
            mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_WRAP_T, glWrap);
            if (filter === me.FILTER.MIPMAP) {
                mGL.generateMipmap(mGL.TEXTURE_3D);
            }
            mGL.bindTexture(mGL.TEXTURE_3D, null);
        } else {
            mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, id);
            mGL.texImage2D(mGL.TEXTURE_CUBE_MAP_POSITIVE_X, 0, glFoTy.mGLFormat, xres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer);
            mGL.texImage2D(mGL.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, glFoTy.mGLFormat, xres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer);
            mGL.texImage2D(mGL.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, glFoTy.mGLFormat, xres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer);
            mGL.texImage2D(mGL.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, glFoTy.mGLFormat, xres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer);
            mGL.texImage2D(mGL.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, glFoTy.mGLFormat, xres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer);
            mGL.texImage2D(mGL.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, glFoTy.mGLFormat, xres, yres, 0, glFoTy.mGLExternal, glFoTy.mGLType, buffer);
            if (filter === me.FILTER.NONE) {
                mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
            } else if (filter === me.FILTER.LINEAR) {
                mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR);
            } else if (filter === me.FILTER.MIPMAP) {
                mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
            }
            if (filter === me.FILTER.MIPMAP) {
                mGL.generateMipmap(mGL.TEXTURE_CUBE_MAP);
            }
            mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, null);
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
    me.CreateTextureFromImage = function(type, image, format, filter, wrap, flipY) {
        var glFoTy, glWrap, id;
        if (mGL === null) {
            return null;
        }
        id = mGL.createTexture();
        glFoTy = iFormatPI2GL(format);
        glWrap = mGL.REPEAT;
        if (wrap === me.TEXWRP.CLAMP) {
            glWrap = mGL.CLAMP_TO_EDGE;
        }
        if (type === me.TEXTYPE.T2D) {
            mGL.bindTexture(mGL.TEXTURE_2D, id);
            mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, flipY);
            mGL.pixelStorei(mGL.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            mGL.pixelStorei(mGL.UNPACK_COLORSPACE_CONVERSION_WEBGL, mGL.NONE);
            mGL.texImage2D(mGL.TEXTURE_2D, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image);
            mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_WRAP_S, glWrap);
            mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_WRAP_T, glWrap);
            if (filter === me.FILTER.NONE) {
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
            } else if (filter === me.FILTER.LINEAR) {
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR);
            } else if (filter === me.FILTER.MIPMAP) {
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
                mGL.generateMipmap(mGL.TEXTURE_2D);
            } else {
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST_MIPMAP_LINEAR);
                mGL.generateMipmap(mGL.TEXTURE_2D);
            }
            mGL.bindTexture(mGL.TEXTURE_2D, null);
        } else if (type === me.TEXTYPE.T3D) {
            return null;
        } else {
            mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, id);
            mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, flipY);
            mGL.activeTexture(mGL.TEXTURE0);
            mGL.texImage2D(mGL.TEXTURE_CUBE_MAP_POSITIVE_X, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[0]);
            mGL.texImage2D(mGL.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[1]);
            mGL.texImage2D(mGL.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, flipY ? image[3] : image[2]);
            mGL.texImage2D(mGL.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, flipY ? image[2] : image[3]);
            mGL.texImage2D(mGL.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[4]);
            mGL.texImage2D(mGL.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[5]);
            if (filter === me.FILTER.NONE) {
                mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
            } else if (filter === me.FILTER.LINEAR) {
                mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR);
            } else if (filter === me.FILTER.MIPMAP) {
                mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
                mGL.generateMipmap(mGL.TEXTURE_CUBE_MAP);
            }
            mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, null);
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
    me.SetSamplerFilter = function(te, filter, doGenerateMipsIfNeeded) {
        if (te.mFilter === filter) {
            return;
        }
        if (te.mType === me.TEXTYPE.T2D) {
            mGL.bindTexture(mGL.TEXTURE_2D, te.mObjectID);
            if (filter === me.FILTER.NONE) {
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
            } else if (filter === me.FILTER.LINEAR) {
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR);
            } else if (filter === me.FILTER.MIPMAP) {
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
                if (doGenerateMipsIfNeeded) {
                    mGL.generateMipmap(mGL.TEXTURE_2D);
                }
            } else {
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST_MIPMAP_LINEAR);
                if (doGenerateMipsIfNeeded) {
                    mGL.generateMipmap(mGL.TEXTURE_2D);
                }
            }
            mGL.bindTexture(mGL.TEXTURE_2D, null);
        } else if (te.mType === me.TEXTYPE.T3D) {
            mGL.bindTexture(mGL.TEXTURE_3D, te.mObjectID);
            if (filter === me.FILTER.NONE) {
                mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
            } else if (filter === me.FILTER.LINEAR) {
                mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR);
            } else if (filter === me.FILTER.MIPMAP) {
                mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
                if (doGenerateMipsIfNeeded) {
                    mGL.generateMipmap(mGL.TEXTURE_3D);
                }
            } else {
                mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST_MIPMAP_LINEAR);
                if (doGenerateMipsIfNeeded) {
                    mGL.generateMipmap(mGL.TEXTURE_3D);
                }
            }
            mGL.bindTexture(mGL.TEXTURE_3D, null);
        } else {
            mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, te.mObjectID);
            if (filter === me.FILTER.NONE) {
                mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST);
            } else if (filter === me.FILTER.LINEAR) {
                mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR);
            } else if (filter === me.FILTER.MIPMAP) {
                mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.LINEAR);
                mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.LINEAR_MIPMAP_LINEAR);
                if (doGenerateMipsIfNeeded) {
                    mGL.generateMipmap(mGL.TEXTURE_CUBE_MAP);
                }
            } else {
                mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MAG_FILTER, mGL.NEAREST);
                mGL.texParameteri(mGL.TEXTURE_CUBE_MAP, mGL.TEXTURE_MIN_FILTER, mGL.NEAREST_MIPMAP_LINEAR);
                if (doGenerateMipsIfNeeded) {
                    mGL.generateMipmap(mGL.TEXTURE_CUBE_MAP);
                }
            }
            mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, null);
        }
        te.mFilter = filter;
    };
    me.SetSamplerWrap = function(te, wrap) {
        var glWrap, id;
        if (te.mWrap === wrap) {
            return;
        }
        glWrap = mGL.REPEAT;
        if (wrap === me.TEXWRP.CLAMP) {
            glWrap = mGL.CLAMP_TO_EDGE;
        }
        id = te.mObjectID;
        if (te.mType === me.TEXTYPE.T2D) {
            mGL.bindTexture(mGL.TEXTURE_2D, id);
            mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_WRAP_S, glWrap);
            mGL.texParameteri(mGL.TEXTURE_2D, mGL.TEXTURE_WRAP_T, glWrap);
            mGL.bindTexture(mGL.TEXTURE_2D, null);
        } else if (te.mType === me.TEXTYPE.T3D) {
            mGL.bindTexture(mGL.TEXTURE_3D, id);
            mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_WRAP_R, glWrap);
            mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_WRAP_S, glWrap);
            mGL.texParameteri(mGL.TEXTURE_3D, mGL.TEXTURE_WRAP_T, glWrap);
            mGL.bindTexture(mGL.TEXTURE_3D, null);
        }
        te.mWrap = wrap;
    };
    me.SetSamplerVFlip = function(te, vflip, image) {
        var glFoTy;
        var glFoTy, id;
        if (te.mVFlip === vflip) {
            return;
        }
        id = te.mObjectID;
        if (te.mType === me.TEXTYPE.T2D) {
            if (image !== null) {
                mGL.activeTexture(mGL.TEXTURE0);
                mGL.bindTexture(mGL.TEXTURE_2D, id);
                mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, vflip);
                glFoTy = iFormatPI2GL(te.mFormat);
                mGL.texImage2D(mGL.TEXTURE_2D, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image);
                mGL.bindTexture(mGL.TEXTURE_2D, null);
            }
        } else if (te.mType === me.TEXTYPE.CUBEMAP) {
            if (image !== null) {
                glFoTy = iFormatPI2GL(te.mFormat);
                mGL.activeTexture(mGL.TEXTURE0);
                mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, id);
                mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, vflip);
                mGL.texImage2D(mGL.TEXTURE_CUBE_MAP_POSITIVE_X, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[0]);
                mGL.texImage2D(mGL.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[1]);
                mGL.texImage2D(mGL.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, vflip ? image[3] : image[2]);
                mGL.texImage2D(mGL.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, vflip ? image[2] : image[3]);
                mGL.texImage2D(mGL.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[4]);
                mGL.texImage2D(mGL.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image[5]);
                mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, null);
            }
        }
        te.mVFlip = vflip;
    };
    me.CreateMipmaps = function(te) {
        if (te.mType === me.TEXTYPE.T2D) {
            mGL.activeTexture(mGL.TEXTURE0);
            mGL.bindTexture(mGL.TEXTURE_2D, te.mObjectID);
            mGL.generateMipmap(mGL.TEXTURE_2D);
            mGL.bindTexture(mGL.TEXTURE_2D, null);
        } else if (te.mType === me.TEXTYPE.CUBEMAP) {
            mGL.activeTexture(mGL.TEXTURE0);
            mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, te.mObjectID);
            mGL.generateMipmap(mGL.TEXTURE_CUBE_MAP);
            mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, null);
        }
    };
    me.UpdateTexture = function(tex, x0, y0, xres, yres, buffer) {
        var glFoTy;
        glFoTy = iFormatPI2GL(tex.mFormat);
        if (tex.mType === me.TEXTYPE.T2D) {
            mGL.activeTexture(mGL.TEXTURE0);
            mGL.bindTexture(mGL.TEXTURE_2D, tex.mObjectID);
            mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, tex.mVFlip);
            mGL.texSubImage2D(mGL.TEXTURE_2D, 0, x0, y0, xres, yres, glFoTy.mGLExternal, glFoTy.mGLType, buffer);
            mGL.bindTexture(mGL.TEXTURE_2D, null);
        }
    };
    me.UpdateTextureFromImage = function(tex, image) {
        var glFoTy;
        glFoTy = iFormatPI2GL(tex.mFormat);
        if (tex.mType === me.TEXTYPE.T2D) {
            mGL.activeTexture(mGL.TEXTURE0);
            mGL.bindTexture(mGL.TEXTURE_2D, tex.mObjectID);
            mGL.pixelStorei(mGL.UNPACK_FLIP_Y_WEBGL, tex.mVFlip);
            mGL.texImage2D(mGL.TEXTURE_2D, 0, glFoTy.mGLFormat, glFoTy.mGLExternal, glFoTy.mGLType, image);
            mGL.bindTexture(mGL.TEXTURE_2D, null);
        }
    };
    me.DestroyTexture = function(te) {
        mGL.deleteTexture(te.mObjectID);
    };
    me.AttachTextures = function(num, t0, t1, t2, t3) {
        if (num > 0 && t0 !== null) {
            mGL.activeTexture(mGL.TEXTURE0);
            if (t0.mType === me.TEXTYPE.T2D) {
                mGL.bindTexture(mGL.TEXTURE_2D, t0.mObjectID);
            } else if (t0.mType === me.TEXTYPE.T3D) {
                mGL.bindTexture(mGL.TEXTURE_3D, t0.mObjectID);
            } else if (t0.mType === me.TEXTYPE.CUBEMAP) {
                mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, t0.mObjectID);
            }
        }
        if (num > 1 && t1 !== null) {
            mGL.activeTexture(mGL.TEXTURE1);
            if (t1.mType === me.TEXTYPE.T2D) {
                mGL.bindTexture(mGL.TEXTURE_2D, t1.mObjectID);
            } else if (t1.mType === me.TEXTYPE.T3D) {
                mGL.bindTexture(mGL.TEXTURE_3D, t1.mObjectID);
            } else if (t1.mType === me.TEXTYPE.CUBEMAP) {
                mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, t1.mObjectID);
            }
        }
        if (num > 2 && t2 !== null) {
            mGL.activeTexture(mGL.TEXTURE2);
            if (t2.mType === me.TEXTYPE.T2D) {
                mGL.bindTexture(mGL.TEXTURE_2D, t2.mObjectID);
            } else if (t2.mType === me.TEXTYPE.T3D) {
                mGL.bindTexture(mGL.TEXTURE_3D, t2.mObjectID);
            } else if (t2.mType === me.TEXTYPE.CUBEMAP) {
                mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, t2.mObjectID);
            }
        }
        if (num > 3 && t3 !== null) {
            mGL.activeTexture(mGL.TEXTURE3);
            if (t3.mType === me.TEXTYPE.T2D) {
                mGL.bindTexture(mGL.TEXTURE_2D, t3.mObjectID);
            } else if (t3.mType === me.TEXTYPE.T3D) {
                mGL.bindTexture(mGL.TEXTURE_3D, t3.mObjectID);
            } else if (t3.mType === me.TEXTYPE.CUBEMAP) {
                mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, t3.mObjectID);
            }
        }
    };
    me.DettachTextures = function() {
        mGL.activeTexture(mGL.TEXTURE0);
        mGL.bindTexture(mGL.TEXTURE_2D, null);
        mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, null);
        mGL.activeTexture(mGL.TEXTURE1);
        mGL.bindTexture(mGL.TEXTURE_2D, null);
        mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, null);
        mGL.activeTexture(mGL.TEXTURE2);
        mGL.bindTexture(mGL.TEXTURE_2D, null);
        mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, null);
        mGL.activeTexture(mGL.TEXTURE3);
        mGL.bindTexture(mGL.TEXTURE_2D, null);
        mGL.bindTexture(mGL.TEXTURE_CUBE_MAP, null);
    };
    me.CreateRenderTarget = function(color0, color1, color2, color3, depth, wantZbuffer) {
        var id, zb;
        id = mGL.createFramebuffer();
        mGL.bindFramebuffer(mGL.FRAMEBUFFER, id);
        if (depth === null) {
            if (wantZbuffer === true) {
                zb = mGL.createRenderbuffer();
                mGL.bindRenderbuffer(mGL.RENDERBUFFER, zb);
                mGL.renderbufferStorage(mGL.RENDERBUFFER, mGL.DEPTH_COMPONENT16, color0.mXres, color0.mYres);
                mGL.framebufferRenderbuffer(mGL.FRAMEBUFFER, mGL.DEPTH_ATTACHMENT, mGL.RENDERBUFFER, zb);
            }
        } else {
            mGL.framebufferTexture2D(mGL.FRAMEBUFFER, mGL.DEPTH_ATTACHMENT, mGL.TEXTURE_2D, depth.mObjectID, 0);
        }
        if (color0 !== null) {
            mGL.framebufferTexture2D(mGL.FRAMEBUFFER, mGL.COLOR_ATTACHMENT0, mGL.TEXTURE_2D, color0.mObjectID, 0);
        }
        if (mGL.checkFramebufferStatus(mGL.FRAMEBUFFER) !== mGL.FRAMEBUFFER_COMPLETE) {
            return null;
        }
        mGL.bindRenderbuffer(mGL.RENDERBUFFER, null);
        mGL.bindFramebuffer(mGL.FRAMEBUFFER, null);
        return {
            mObjectID: id,
            mTex0: color0
        };
    };
    me.DestroyRenderTarget = function(tex) {
        mGL.deleteFramebuffer(tex.mObjectID);
    };
    me.SetRenderTarget = function(tex) {
        if (tex === null) {
            mGL.bindFramebuffer(mGL.FRAMEBUFFER, null);
        } else {
            mGL.bindFramebuffer(mGL.FRAMEBUFFER, tex.mObjectID);
        }
    };
    me.CreateRenderTargetNew = function(wantColor0, wantZbuffer, xres, yres, samples) {
        var cb, id, zb;
        id = mGL.createFramebuffer();
        mGL.bindFramebuffer(mGL.FRAMEBUFFER, id);
        if (wantZbuffer === true) {
            zb = mGL.createRenderbuffer();
            mGL.bindRenderbuffer(mGL.RENDERBUFFER, zb);
            if (samples === 1) {
                mGL.renderbufferStorage(mGL.RENDERBUFFER, mGL.DEPTH_COMPONENT16, xres, yres);
            } else {
                mGL.renderbufferStorageMultisample(mGL.RENDERBUFFER, samples, mGL.DEPTH_COMPONENT16, xres, yres);
            }
            mGL.framebufferRenderbuffer(mGL.FRAMEBUFFER, mGL.DEPTH_ATTACHMENT, mGL.RENDERBUFFER, zb);
        }
        if (wantColor0) {
            cb = mGL.createRenderbuffer();
            mGL.bindRenderbuffer(mGL.RENDERBUFFER, cb);
            if (samples === 1) {
                mGL.renderbufferStorage(mGL.RENDERBUFFER, mGL.RGBA8, xres, yres);
            } else {
                mGL.renderbufferStorageMultisample(mGL.RENDERBUFFER, samples, mGL.RGBA8, xres, yres);
            }
            mGL.framebufferRenderbuffer(mGL.FRAMEBUFFER, mGL.COLOR_ATTACHMENT0, mGL.RENDERBUFFER, cb);
        }
        if (mGL.checkFramebufferStatus(mGL.FRAMEBUFFER) !== mGL.FRAMEBUFFER_COMPLETE) {
            return null;
        }
        mGL.bindRenderbuffer(mGL.RENDERBUFFER, null);
        mGL.bindFramebuffer(mGL.FRAMEBUFFER, null);
        return {
            mObjectID: id,
            mXres: xres,
            mYres: yres,
            mTex0: color0
        };
    };
    me.CreateRenderTargetCubeMap = function(color0, depth, wantZbuffer) {
        var id, zb;
        id = mGL.createFramebuffer();
        mGL.bindFramebuffer(mGL.FRAMEBUFFER, id);
        if (depth === null) {
            if (wantZbuffer === true) {
                zb = mGL.createRenderbuffer();
                mGL.bindRenderbuffer(mGL.RENDERBUFFER, zb);
                mGL.renderbufferStorage(mGL.RENDERBUFFER, mGL.DEPTH_COMPONENT16, color0.mXres, color0.mYres);
                mGL.framebufferRenderbuffer(mGL.FRAMEBUFFER, mGL.DEPTH_ATTACHMENT, mGL.RENDERBUFFER, zb);
            }
        } else {
            mGL.framebufferTexture2D(mGL.FRAMEBUFFER, mGL.DEPTH_ATTACHMENT, mGL.TEXTURE_2D, depth.mObjectID, 0);
        }
        if (color0 !== null) {
            mGL.framebufferTexture2D(mGL.FRAMEBUFFER, mGL.COLOR_ATTACHMENT0, mGL.TEXTURE_CUBE_MAP_POSITIVE_X, color0.mObjectID, 0);
        }
        if (mGL.checkFramebufferStatus(mGL.FRAMEBUFFER) !== mGL.FRAMEBUFFER_COMPLETE) {
            return null;
        }
        mGL.bindRenderbuffer(mGL.RENDERBUFFER, null);
        mGL.bindFramebuffer(mGL.FRAMEBUFFER, null);
        return {
            mObjectID: id,
            mTex0: color0
        };
    };
    me.SetRenderTargetCubeMap = function(fbo, face) {
        if (fbo === null) {
            mGL.bindFramebuffer(mGL.FRAMEBUFFER, null);
        } else {
            mGL.bindFramebuffer(mGL.FRAMEBUFFER, fbo.mObjectID);
            mGL.framebufferTexture2D(mGL.FRAMEBUFFER, mGL.COLOR_ATTACHMENT0, mGL.TEXTURE_CUBE_MAP_POSITIVE_X + face, fbo.mTex0.mObjectID, 0);
        }
    };
    me.BlitRenderTarget = function(dst, src) {
        mGL.bindFramebuffer(mGL.READ_FRAMEBUFFER, src.mObjectID);
        mGL.bindFramebuffer(mGL.DRAW_FRAMEBUFFER, dst.mObjectID);
        mGL.clearBufferfv(mGL.COLOR, 0, [0.0, 0.0, 0.0, 1.0]);
        mGL.blitFramebuffer(0, 0, src.mXres, src.mYres, 0, 0, src.mXres, src.mYres, mGL.COLOR_BUFFER_BIT, mGL.LINEAR);
    };
    me.SetViewport = function(vp) {
        mGL.viewport(vp[0], vp[1], vp[2], vp[3]);
    };
    me.SetWriteMask = function(c0, c1, c2, c3, z) {
        mGL.depthMask(z);
        mGL.colorMask(c0, c0, c0, c0);
    };
    me.SetState = function(stateName, stateValue) {
        if (stateName === me.RENDSTGATE.WIREFRAME) {
            if (stateValue) {
                mGL.polygonMode(mGL.FRONT_AND_BACK, mGL.LINE);
            } else {
                mGL.polygonMode(mGL.FRONT_AND_BACK, mGL.FILL);
            }
        } else if (stateName === me.RENDSTGATE.FRONT_FACE) {
            if (stateValue) {
                mGL.cullFace(mGL.BACK);
            } else {
                mGL.cullFace(mGL.FRONT);
            }
        } else if (stateName === me.RENDSTGATE.CULL_FACE) {
            if (stateValue) {
                mGL.enable(mGL.CULL_FACE);
            } else {
                mGL.disable(mGL.CULL_FACE);
            }
        } else if (stateName === me.RENDSTGATE.DEPTH_TEST) {
            if (stateValue) {
                mGL.enable(mGL.DEPTH_TEST);
            } else {
                mGL.disable(mGL.DEPTH_TEST);
            }
        } else if (stateName === me.RENDSTGATE.ALPHA_TO_COVERAGE) {
            if (stateValue) {
                mGL.enable(mGL.SAMPLE_ALPHA_TO_COVERAGE);
            } else {
                mGL.disable(mGL.SAMPLE_ALPHA_TO_COVERAGE);
            }
        }
    };
    me.SetMultisample = function(v) {
        if (v === true) {
            mGL.enable(mGL.SAMPLE_COVERAGE);
            mGL.sampleCoverage(1.0, false);
        } else {
            mGL.disable(mGL.SAMPLE_COVERAGE);
        }
    };
    me.CreateShader = function(vsSource, fsSource) {
        var infoLog;
        var infoLog;
        var fs, infoLog, mShaderHeader, te, vs;
        if (mGL === null) {
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
        vs = mGL.createShader(mGL.VERTEX_SHADER);
        fs = mGL.createShader(mGL.FRAGMENT_SHADER);
        mShaderHeader = '#version 300 es\n' + '#ifdef GL_ES\n' + 'precision highp float;\n' + 'precision highp int;\n' + 'precision mediump sampler3D;\n' + '#endif\n';
        vsSource = mShaderHeader + vsSource;
        fsSource = mShaderHeader + fsSource;
        mGL.shaderSource(vs, vsSource);
        mGL.shaderSource(fs, fsSource);
        mGL.compileShader(vs);
        mGL.compileShader(fs);
        if (!mGL.getShaderParameter(vs, mGL.COMPILE_STATUS)) {
            infoLog = mGL.getShaderInfoLog(vs);
            te.mInfo = infoLog;
            te.mErrorType = 0;
            te.mResult = false;
            return te;
        }
        if (!mGL.getShaderParameter(fs, mGL.COMPILE_STATUS)) {
            infoLog = mGL.getShaderInfoLog(fs);
            te.mInfo = infoLog;
            te.mErrorType = 1;
            te.mResult = false;
            return te;
        }
        te.mProgram = mGL.createProgram();
        mGL.attachShader(te.mProgram, vs);
        mGL.attachShader(te.mProgram, fs);
        mGL.linkProgram(te.mProgram);
        if (!mGL.getProgramParameter(te.mProgram, mGL.LINK_STATUS)) {
            infoLog = mGL.getProgramInfoLog(te.mProgram);
            mGL.deleteProgram(te.mProgram);
            te.mInfo = infoLog;
            te.mErrorType = 2;
            te.mResult = false;
            return te;
        }
        return te;
    };
    me.AttachShader = function(shader) {
        if (shader === null) {
            mBindedShader = null;
            mGL.useProgram(null);
        } else {
            mBindedShader = shader;
            mGL.useProgram(shader.mProgram);
        }
    };
    me.DetachShader = function() {
        mGL.useProgram(null);
    };
    me.DestroyShader = function(tex) {
        mGL.deleteProgram(tex.mProgram);
    };
    me.GetAttribLocation = function(shader, name) {
        return mGL.getAttribLocation(shader.mProgram, name);
    };
    me.SetShaderConstantLocation = function(shader, name) {
        return mGL.getUniformLocation(shader.mProgram, name);
    };
    me.SetShaderConstantMat4F = function(uname, params, istranspose) {
        var pos, program, tmp;
        program = mBindedShader;
        pos = mGL.getUniformLocation(program.mProgram, uname);
        if (pos === null) {
            return false;
        }
        if (istranspose === false) {
            tmp = new Float32Array([params[0], params[4], params[8], params[12], params[1], params[5], params[9], params[13], params[2], params[6], params[10], params[14], params[3], params[7], params[11], params[15]]);
            mGL.uniformMatrix4fv(pos, false, tmp);
        } else {
            mGL.uniformMatrix4fv(pos, false, new Float32Array(params));
        }
        return true;
    };
    me.SetShaderConstant1F_Pos = function(pos, x) {
        mGL.uniform1f(pos, x);
        return true;
    };
    me.SetShaderConstant1FV_Pos = function(pos, x) {
        mGL.uniform1fv(pos, x);
        return true;
    };
    me.SetShaderConstant1F = function(uname, x) {
        var pos;
        pos = mGL.getUniformLocation(mBindedShader.mProgram, uname);
        if (pos === null) {
            return false;
        }
        mGL.uniform1f(pos, x);
        return true;
    };
    me.SetShaderConstant1I = function(uname, x) {
        var pos;
        pos = mGL.getUniformLocation(mBindedShader.mProgram, uname);
        if (pos === null) {
            return false;
        }
        mGL.uniform1i(pos, x);
        return true;
    };
    me.SetShaderConstant2F = function(uname, x) {
        var pos;
        pos = mGL.getUniformLocation(mBindedShader.mProgram, uname);
        if (pos === null) {
            return false;
        }
        mGL.uniform2fv(pos, x);
        return true;
    };
    me.SetShaderConstant3F = function(uname, x, y, z) {
        var pos;
        pos = mGL.getUniformLocation(mBindedShader.mProgram, uname);
        if (pos === null) {
            return false;
        }
        mGL.uniform3f(pos, x, y, z);
        return true;
    };
    me.SetShaderConstant1FV = function(uname, x) {
        var pos;
        pos = mGL.getUniformLocation(mBindedShader.mProgram, uname);
        if (pos === null) {
            return false;
        }
        mGL.uniform1fv(pos, new Float32Array(x));
        return true;
    };
    me.SetShaderConstant3FV = function(uname, x) {
        var pos;
        pos = mGL.getUniformLocation(mBindedShader.mProgram, uname);
        if (pos === null) {
            return false;
        }
        mGL.uniform3fv(pos, new Float32Array(x));
        return true;
    };
    me.SetShaderConstant4FV = function(uname, x) {
        var pos;
        pos = mGL.getUniformLocation(mBindedShader.mProgram, uname);
        if (pos === null) {
            return false;
        }
        mGL.uniform4fv(pos, new Float32Array(x));
        return true;
    };
    me.SetShaderTextureUnit = function(uname, unit) {
        var pos, program;
        program = mBindedShader;
        pos = mGL.getUniformLocation(program.mProgram, uname);
        if (pos === null) {
            return false;
        }
        mGL.uniform1i(pos, unit);
        return true;
    };
    me.CreateVertexArray = function(data, mode) {
        var id;
        id = mGL.createBuffer();
        mGL.bindBuffer(mGL.ARRAY_BUFFER, id);
        if (mode === me.BUFTYPE.STATIC) {
            mGL.bufferData(mGL.ARRAY_BUFFER, data, mGL.STATIC_DRAW);
        } else {
            mGL.bufferData(mGL.ARRAY_BUFFER, data, mGL.DYNAMIC_DRAW);
        }
        return {
            mObject: id
        };
    };
    me.CreateIndexArray = function(data, mode) {
        var id;
        id = mGL.createBuffer();
        mGL.bindBuffer(mGL.ELEMENT_ARRAY_BUFFER, id);
        if (mode === me.BUFTYPE.STATIC) {
            mGL.bufferData(mGL.ELEMENT_ARRAY_BUFFER, data, mGL.STATIC_DRAW);
        } else {
            mGL.bufferData(mGL.ELEMENT_ARRAY_BUFFER, data, mGL.DYNAMIC_DRAW);
        }
        return {
            mObject: id
        };
    };
    me.DestroyArray = function(tex) {
        mGL.destroyBuffer(tex.mObject);
    };
    me.AttachVertexArray = function(tex, attribs, pos) {
        var dsize, dtype, i, id, num, offset, shader, stride;
        shader = mBindedShader;
        mGL.bindBuffer(mGL.ARRAY_BUFFER, tex.mObject);
        num = attribs.mChannels.length;
        stride = attribs.mStride;
        offset = 0;
        i = 0;
        while (i < num) {
            id = pos[i];
            mGL.enableVertexAttribArray(id);
            dtype = mGL.FLOAT;
            dsize = 4;
            if (attribs.mChannels[i].mType === me.TYPE.UINT8) {
                dtype = mGL.UNSIGNED_BYTE;
                dsize = 1;
            } else if (attribs.mChannels[i].mType === me.TYPE.UINT16) {
                dtype = mGL.UNSIGNED_SHORT;
                dsize = 2;
            } else if (attribs.mChannels[i].mType === me.TYPE.FLOAT32) {
                dtype = mGL.FLOAT;
                dsize = 4;
            }
            mGL.vertexAttribPointer(id, attribs.mChannels[i].mNumComponents, dtype, attribs.mChannels[i].mNormalize, stride, offset);
            offset += attribs.mChannels[i].mNumComponents * dsize;
            i++;
        }
    };
    me.AttachIndexArray = function(tex) {
        mGL.bindBuffer(mGL.ELEMENT_ARRAY_BUFFER, tex.mObject);
    };
    me.DetachVertexArray = function(tex, attribs) {
        var i, num;
        num = attribs.mChannels.length;
        i = 0;
        while (i < num) {
            mGL.disableVertexAttribArray(i);
            i++;
        }
        mGL.bindBuffer(mGL.ARRAY_BUFFER, null);
    };
    me.DetachIndexArray = function(tex) {
        mGL.bindBuffer(mGL.ELEMENT_ARRAY_BUFFER, null);
    };
    me.DrawPrimitive = function(typeOfPrimitive, num, useIndexArray, numInstances) {
        var glType;
        glType = mGL.POINTS;
        if (typeOfPrimitive === me.PRIMTYPE.POINTS) {
            glType = mGL.POINTS;
        }
        if (typeOfPrimitive === me.PRIMTYPE.LINES) {
            glType = mGL.LINES;
        }
        if (typeOfPrimitive === me.PRIMTYPE.LINE_LOOP) {
            glType = mGL.LINE_LOOP;
        }
        if (typeOfPrimitive === me.PRIMTYPE.LINE_STRIP) {
            glType = mGL.LINE_STRIP;
        }
        if (typeOfPrimitive === me.PRIMTYPE.TRIANGLES) {
            glType = mGL.TRIANGLES;
        }
        if (typeOfPrimitive === me.PRIMTYPE.TRIANGLE_STRIP) {
            glType = mGL.TRIANGLE_STRIP;
        }
        if (numInstances <= 1) {
            if (useIndexArray) {
                mGL.drawElements(glType, num, mGL.UNSIGNED_SHORT, 0);
            } else {
                mGL.drawArrays(glType, 0, num);
            }
        } else {
            mGL.drawArraysInstanced(glType, 0, num, numInstances);
            mGL.drawElementsInstanced(glType, num, mGL.UNSIGNED_SHORT, 0, numInstances);
        }
    };
    me.DrawFullScreenTriangle_XY = function(vpos) {
        mGL.bindBuffer(mGL.ARRAY_BUFFER, mVBO_Tri);
        mGL.vertexAttribPointer(vpos, 2, mGL.FLOAT, false, 0, 0);
        mGL.enableVertexAttribArray(vpos);
        mGL.drawArrays(mGL.TRIANGLES, 0, 3);
        mGL.disableVertexAttribArray(vpos);
        mGL.bindBuffer(mGL.ARRAY_BUFFER, null);
    };
    me.DrawUnitQuad_XY = function(vpos) {
        mGL.bindBuffer(mGL.ARRAY_BUFFER, mVBO_Quad);
        mGL.vertexAttribPointer(vpos, 2, mGL.FLOAT, false, 0, 0);
        mGL.enableVertexAttribArray(vpos);
        mGL.drawArrays(mGL.TRIANGLES, 0, 6);
        mGL.disableVertexAttribArray(vpos);
        mGL.bindBuffer(mGL.ARRAY_BUFFER, null);
    };
    me.SetBlend = function(enabled) {
        if (enabled) {
            mGL.enable(mGL.BLEND);
            mGL.blendEquationSeparate(mGL.FUNC_ADD, mGL.FUNC_ADD);
            mGL.blendFuncSeparate(mGL.SRC_ALPHA, mGL.ONE_MINUS_SRC_ALPHA, mGL.ONE, mGL.ONE_MINUS_SRC_ALPHA);
        } else {
            mGL.disable(mGL.BLEND);
        }
    };
    me.GetPixelData = function(data, offset, xres, yres) {
        mGL.readPixels(0, 0, xres, yres, mGL.RGBA, mGL.UNSIGNED_BYTE, data, offset);
    };
    me.GetPixelDataRenderTarget = function(obj, data, xres, yres) {
        mGL.bindFramebuffer(mGL.FRAMEBUFFER, obj.mObjectID);
        mGL.readBuffer(mGL.COLOR_ATTACHMENT0);
        mGL.readPixels(0, 0, xres, yres, mGL.RGBA, mGL.FLOAT, data, 0);
        mGL.bindFramebuffer(mGL.FRAMEBUFFER, null);
    };
    return me;
};

piCreateGlContext = function(cv) {
    var opts;
    opts = {
        alpha: false,
        depth: false,
        stencil: false,
        premultipliedAlpha: false,
        antialias: false,
        preserveDrawingBuffer: false,
        powerPreference: 'high-performance'
    };
    return cv.getContext('webgl2', opts);
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFNQSxJQUFBOztBQUFBLFVBQUEsR0FBYSxTQUFBO0FBQ1QsUUFBQTtJQUFBLEdBQUEsR0FBTTtJQUNOLGFBQUEsR0FBZ0I7SUFDaEIsZ0JBQUEsR0FBbUI7SUFDbkIsY0FBQSxHQUFpQjtJQUNqQixnQkFBQSxHQUFtQjtJQUNuQixZQUFBLEdBQWU7SUFDZixjQUFBLEdBQWlCO0lBQ2pCLFlBQUEsR0FBZTtJQUNmLGNBQUEsR0FBaUI7SUFDakIsY0FBQSxHQUFpQjtJQUNqQixZQUFBLEdBQWU7SUFDZixpQkFBQSxHQUFvQjtJQUNwQixTQUFBLEdBQVk7SUFDWixRQUFBLEdBQVc7SUFDWCxlQUFBLEdBQWtCO0lBQ2xCLFlBQUEsR0FBZTtJQUNmLEVBQUEsR0FBSztJQUNMLEVBQUUsQ0FBQyxLQUFILEdBQ0k7UUFBQSxLQUFBLEVBQU8sQ0FBUDtRQUNBLE9BQUEsRUFBUyxDQURUO1FBRUEsT0FBQSxFQUFTLENBRlQ7O0lBR0osRUFBRSxDQUFDLE1BQUgsR0FDSTtRQUFBLElBQUEsRUFBTSxDQUFOO1FBQ0EsSUFBQSxFQUFNLENBRE47UUFFQSxLQUFBLEVBQU8sQ0FGUDtRQUdBLEtBQUEsRUFBTyxDQUhQO1FBSUEsS0FBQSxFQUFPLENBSlA7UUFLQSxLQUFBLEVBQU8sQ0FMUDtRQU1BLEdBQUEsRUFBSyxDQU5MO1FBT0EsR0FBQSxFQUFLLENBUEw7UUFRQSxHQUFBLEVBQUssQ0FSTDtRQVNBLEtBQUEsRUFBTyxDQVRQOztJQVVKLEVBQUUsQ0FBQyxNQUFILEdBQ0k7UUFBQSxLQUFBLEVBQU8sQ0FBUDtRQUNBLE1BQUEsRUFBUSxDQURSOztJQUVKLEVBQUUsQ0FBQyxPQUFILEdBQ0k7UUFBQSxNQUFBLEVBQVEsQ0FBUjtRQUNBLE9BQUEsRUFBUyxDQURUOztJQUVKLEVBQUUsQ0FBQyxRQUFILEdBQ0k7UUFBQSxNQUFBLEVBQVEsQ0FBUjtRQUNB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QUFkLEVBQXdCLElBQXhCO0FBVmdCIiwic291cmNlc0NvbnRlbnQiOlsiIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyBwaUxpYnMgMjAxNC0yMDE3IC0gaHR0cDovL3d3dy5pcXVpbGV6bGVzLm9yZy93d3cvbWF0ZXJpYWwvcGlMaWJzL3BpTGlicy5odG1cbiNcbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxucGlSZW5kZXJlciA9IC0+XG4gICAgbUdMID0gbnVsbFxuICAgIG1CaW5kZWRTaGFkZXIgPSBudWxsXG4gICAgbUZsb2F0MzJUZXh0dXJlcyA9IHVuZGVmaW5lZFxuICAgIG1GbG9hdDMyRmlsdGVyID0gdW5kZWZpbmVkXG4gICAgbUZsb2F0MTZUZXh0dXJlcyA9IHVuZGVmaW5lZFxuICAgIG1EcmF3QnVmZmVycyA9IHVuZGVmaW5lZFxuICAgIG1EZXB0aFRleHR1cmVzID0gdW5kZWZpbmVkXG4gICAgbURlcml2YXRpdmVzID0gdW5kZWZpbmVkXG4gICAgbUZsb2F0MzJGaWx0ZXIgPSB1bmRlZmluZWRcbiAgICBtRmxvYXQxNkZpbHRlciA9IHVuZGVmaW5lZFxuICAgIG1Bbmlzb3Ryb3BpYyA9IHVuZGVmaW5lZFxuICAgIG1SZW5kZXJUb0Zsb2F0MzJGID0gdW5kZWZpbmVkXG4gICAgbVZCT19RdWFkID0gbnVsbFxuICAgIG1WQk9fVHJpID0gbnVsbFxuICAgIG1WQk9fQ3ViZVBvc05vciA9IG51bGxcbiAgICBtVkJPX0N1YmVQb3MgPSBudWxsXG4gICAgbWUgPSB7fVxuICAgIG1lLkNMRUFSID1cbiAgICAgICAgQ29sb3I6IDFcbiAgICAgICAgWmJ1ZmZlcjogMlxuICAgICAgICBTdGVuY2lsOiA0XG4gICAgbWUuVEVYRk1UID1cbiAgICAgICAgQzRJODogMFxuICAgICAgICBDMUk4OiAxXG4gICAgICAgIEMxRjE2OiAyXG4gICAgICAgIEM0RjE2OiAzXG4gICAgICAgIEMxRjMyOiA0XG4gICAgICAgIEM0RjMyOiA1XG4gICAgICAgIFoxNjogNlxuICAgICAgICBaMjQ6IDdcbiAgICAgICAgWjMyOiA4XG4gICAgICAgIEMzRjMyOiA5XG4gICAgbWUuVEVYV1JQID1cbiAgICAgICAgQ0xBTVA6IDBcbiAgICAgICAgUkVQRUFUOiAxXG4gICAgbWUuQlVGVFlQRSA9XG4gICAgICAgIFNUQVRJQzogMFxuICAgICAgICBEWU5BTUlDOiAxXG4gICAgbWUuUFJJTVRZUEUgPVxuICAgICAgICBQT0lOVFM6IDBcbiAgICAgICAgTElORVM6IDFcbiAgICAgICAgTElORV9MT09QOiAyXG4gICAgICAgIExJTkVfU1RSSVA6IDNcbiAgICAgICAgVFJJQU5HTEVTOiA0XG4gICAgICAgIFRSSUFOR0xFX1NUUklQOiA1XG4gICAgbWUuUkVORFNUR0FURSA9XG4gICAgICAgIFdJUkVGUkFNRTogMFxuICAgICAgICBGUk9OVF9GQUNFOiAxXG4gICAgICAgIENVTExfRkFDRTogMlxuICAgICAgICBERVBUSF9URVNUOiAzXG4gICAgICAgIEFMUEhBX1RPX0NPVkVSQUdFOiA0XG4gICAgbWUuVEVYVFlQRSA9XG4gICAgICAgIFQyRDogMFxuICAgICAgICBUM0Q6IDFcbiAgICAgICAgQ1VCRU1BUDogMlxuICAgIG1lLkZJTFRFUiA9XG4gICAgICAgIE5PTkU6IDBcbiAgICAgICAgTElORUFSOiAxXG4gICAgICAgIE1JUE1BUDogMlxuICAgICAgICBOT05FX01JUE1BUDogM1xuICAgIG1lLlRZUEUgPVxuICAgICAgICBVSU5UODogMFxuICAgICAgICBVSU5UMTY6IDFcbiAgICAgICAgVUlOVDMyOiAyXG4gICAgICAgIEZMT0FUMTY6IDNcbiAgICAgICAgRkxPQVQzMjogNFxuICAgICAgICBGTE9BVDY0OiA1XG5cbiAgICBpRm9ybWF0UEkyR0wgPSAoZm9ybWF0KSAtPlxuICAgICAgICBpZiBmb3JtYXQgPT0gbWUuVEVYRk1ULkM0SThcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbUdMRm9ybWF0OiBtR0wuUkdCQThcbiAgICAgICAgICAgICAgICBtR0xFeHRlcm5hbDogbUdMLlJHQkFcbiAgICAgICAgICAgICAgICBtR0xUeXBlOiBtR0wuVU5TSUdORURfQllURVxuICAgICAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIGZvcm1hdCA9PSBtZS5URVhGTVQuQzFJOFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBtR0xGb3JtYXQ6IG1HTC5SOFxuICAgICAgICAgICAgICAgIG1HTEV4dGVybmFsOiBtR0wuUkVEXG4gICAgICAgICAgICAgICAgbUdMVHlwZTogbUdMLlVOU0lHTkVEX0JZVEVcbiAgICAgICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiBmb3JtYXQgPT0gbWUuVEVYRk1ULkMxRjE2XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG1HTEZvcm1hdDogbUdMLlIxNkZcbiAgICAgICAgICAgICAgICBtR0xFeHRlcm5hbDogbUdMLlJFRFxuICAgICAgICAgICAgICAgIG1HTFR5cGU6IG1HTC5GTE9BVFxuICAgICAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIGZvcm1hdCA9PSBtZS5URVhGTVQuQzRGMTZcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbUdMRm9ybWF0OiBtR0wuUkdCQTE2RlxuICAgICAgICAgICAgICAgIG1HTEV4dGVybmFsOiBtR0wuUkdCQVxuICAgICAgICAgICAgICAgIG1HTFR5cGU6IG1HTC5GTE9BVFxuICAgICAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIGZvcm1hdCA9PSBtZS5URVhGTVQuQzFGMzJcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbUdMRm9ybWF0OiBtR0wuUjMyRlxuICAgICAgICAgICAgICAgIG1HTEV4dGVybmFsOiBtR0wuUkVEXG4gICAgICAgICAgICAgICAgbUdMVHlwZTogbUdMLkZMT0FUXG4gICAgICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgZm9ybWF0ID09IG1lLlRFWEZNVC5DNEYzMlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBtR0xGb3JtYXQ6IG1HTC5SR0JBMzJGXG4gICAgICAgICAgICAgICAgbUdMRXh0ZXJuYWw6IG1HTC5SR0JBXG4gICAgICAgICAgICAgICAgbUdMVHlwZTogbUdMLkZMT0FUXG4gICAgICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgZm9ybWF0ID09IG1lLlRFWEZNVC5DM0YzMlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBtR0xGb3JtYXQ6IG1HTC5SR0IzMkZcbiAgICAgICAgICAgICAgICBtR0xFeHRlcm5hbDogbUdMLlJHQlxuICAgICAgICAgICAgICAgIG1HTFR5cGU6IG1HTC5GTE9BVFxuICAgICAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIGZvcm1hdCA9PSBtZS5URVhGTVQuWjE2XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIG1HTEZvcm1hdDogbUdMLkRFUFRIX0NPTVBPTkVOVDE2XG4gICAgICAgICAgICAgICAgbUdMRXh0ZXJuYWw6IG1HTC5ERVBUSF9DT01QT05FTlRcbiAgICAgICAgICAgICAgICBtR0xUeXBlOiBtR0wuVU5TSUdORURfU0hPUlRcbiAgICAgICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiBmb3JtYXQgPT0gbWUuVEVYRk1ULloyNFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBtR0xGb3JtYXQ6IG1HTC5ERVBUSF9DT01QT05FTlQyNFxuICAgICAgICAgICAgICAgIG1HTEV4dGVybmFsOiBtR0wuREVQVEhfQ09NUE9ORU5UXG4gICAgICAgICAgICAgICAgbUdMVHlwZTogbUdMLlVOU0lHTkVEX1NIT1JUXG4gICAgICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgZm9ybWF0ID09IG1lLlRFWEZNVC5aMzJcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgbUdMRm9ybWF0OiBtR0wuREVQVEhfQ09NUE9ORU5UMzJGXG4gICAgICAgICAgICAgICAgbUdMRXh0ZXJuYWw6IG1HTC5ERVBUSF9DT01QT05FTlRcbiAgICAgICAgICAgICAgICBtR0xUeXBlOiBtR0wuVU5TSUdORURfU0hPUlRcbiAgICAgICAgICAgIH1cbiAgICAgICAgbnVsbFxuXG4gICAgbWUuSW5pdGlhbGl6ZSA9IChnbCkgLT5cbiAgICAgICAgbUdMID0gZ2xcbiAgICAgICAgbUZsb2F0MzJUZXh0dXJlcyA9IHRydWVcbiAgICAgICAgbUZsb2F0MzJGaWx0ZXIgPSBtR0wuZ2V0RXh0ZW5zaW9uKCdPRVNfdGV4dHVyZV9mbG9hdF9saW5lYXInKVxuICAgICAgICBtRmxvYXQxNlRleHR1cmVzID0gdHJ1ZVxuICAgICAgICBtRmxvYXQxNkZpbHRlciA9IG1HTC5nZXRFeHRlbnNpb24oJ09FU190ZXh0dXJlX2hhbGZfZmxvYXRfbGluZWFyJylcbiAgICAgICAgbURlcml2YXRpdmVzID0gdHJ1ZVxuICAgICAgICBtRHJhd0J1ZmZlcnMgPSB0cnVlXG4gICAgICAgIG1EZXB0aFRleHR1cmVzID0gdHJ1ZVxuICAgICAgICBtQW5pc290cm9waWMgPSBtR0wuZ2V0RXh0ZW5zaW9uKCdFWFRfdGV4dHVyZV9maWx0ZXJfYW5pc290cm9waWMnKVxuICAgICAgICBtUmVuZGVyVG9GbG9hdDMyRiA9IG1HTC5nZXRFeHRlbnNpb24oJ0VYVF9jb2xvcl9idWZmZXJfZmxvYXQnKVxuICAgICAgICBtYXhUZXhTaXplID0gbUdMLmdldFBhcmFtZXRlcihtR0wuTUFYX1RFWFRVUkVfU0laRSlcbiAgICAgICAgbWF4Q3ViZVNpemUgPSBtR0wuZ2V0UGFyYW1ldGVyKG1HTC5NQVhfQ1VCRV9NQVBfVEVYVFVSRV9TSVpFKVxuICAgICAgICBtYXhSZW5kZXJidWZmZXJTaXplID0gbUdMLmdldFBhcmFtZXRlcihtR0wuTUFYX1JFTkRFUkJVRkZFUl9TSVpFKVxuICAgICAgICBleHRlbnNpb25zID0gbUdMLmdldFN1cHBvcnRlZEV4dGVuc2lvbnMoKVxuICAgICAgICB0ZXh0dXJlVW5pdHMgPSBtR0wuZ2V0UGFyYW1ldGVyKG1HTC5NQVhfVEVYVFVSRV9JTUFHRV9VTklUUylcbiAgICAgICAgY29uc29sZS5sb2cgJ1dlYkdMOicgKyAnIEYzMiBUZXh0dXJlczogJyArIChpZiBtRmxvYXQzMlRleHR1cmVzICE9IG51bGwgdGhlbiAneWVzJyBlbHNlICdubycpICsgJywgUmVuZGVyIHRvIDMyRjogJyArIChpZiBtUmVuZGVyVG9GbG9hdDMyRiAhPSBudWxsIHRoZW4gJ3llcycgZWxzZSAnbm8nKSArICcsIE1heCBUZXh0dXJlIFNpemU6ICcgKyBtYXhUZXhTaXplICsgJywgTWF4IFJlbmRlciBCdWZmZXIgU2l6ZTogJyArIG1heFJlbmRlcmJ1ZmZlclNpemUgKyAnLCBNYXggQ3ViZW1hcCBTaXplOiAnICsgbWF4Q3ViZVNpemVcbiAgICAgICAgIyBjcmVhdGUgYSAyRCBxdWFkIFZlcnRleCBCdWZmZXJcbiAgICAgICAgdmVydGljZXMgPSBuZXcgRmxvYXQzMkFycmF5KFtcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgXSlcbiAgICAgICAgbVZCT19RdWFkID0gbUdMLmNyZWF0ZUJ1ZmZlcigpXG4gICAgICAgIG1HTC5iaW5kQnVmZmVyIG1HTC5BUlJBWV9CVUZGRVIsIG1WQk9fUXVhZFxuICAgICAgICBtR0wuYnVmZmVyRGF0YSBtR0wuQVJSQVlfQlVGRkVSLCB2ZXJ0aWNlcywgbUdMLlNUQVRJQ19EUkFXXG4gICAgICAgIG1HTC5iaW5kQnVmZmVyIG1HTC5BUlJBWV9CVUZGRVIsIG51bGxcbiAgICAgICAgIyBjcmVhdGUgYSAyRCB0cmlhbmdsZSBWZXJ0ZXggQnVmZmVyXG4gICAgICAgIG1WQk9fVHJpID0gbUdMLmNyZWF0ZUJ1ZmZlcigpXG4gICAgICAgIG1HTC5iaW5kQnVmZmVyIG1HTC5BUlJBWV9CVUZGRVIsIG1WQk9fVHJpXG4gICAgICAgIG1HTC5idWZmZXJEYXRhIG1HTC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoW1xuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgMy4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAzLjBcbiAgICAgICAgXSksIG1HTC5TVEFUSUNfRFJBV1xuICAgICAgICBtR0wuYmluZEJ1ZmZlciBtR0wuQVJSQVlfQlVGRkVSLCBudWxsXG4gICAgICAgICMgY3JlYXRlIGEgM0QgY3ViZSBWZXJ0ZXggQnVmZmVyXG4gICAgICAgIG1WQk9fQ3ViZVBvc05vciA9IG1HTC5jcmVhdGVCdWZmZXIoKVxuICAgICAgICBtR0wuYmluZEJ1ZmZlciBtR0wuQVJSQVlfQlVGRkVSLCBtVkJPX0N1YmVQb3NOb3JcbiAgICAgICAgbUdMLmJ1ZmZlckRhdGEgbUdMLkFSUkFZX0JVRkZFUiwgbmV3IEZsb2F0MzJBcnJheShbXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAwLjBcbiAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAwLjBcbiAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAwLjBcbiAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgMC4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAwLjBcbiAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAwLjBcbiAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgMC4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAwLjBcbiAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgMC4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAwLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAwLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgMC4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAwLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgMC4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAwLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAwLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgMC4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAwLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgMC4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAwLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAwLjBcbiAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgMC4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgMC4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAwLjBcbiAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAwLjBcbiAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAwLjBcbiAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAwLjBcbiAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgMC4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgIF0pLCBtR0wuU1RBVElDX0RSQVdcbiAgICAgICAgbUdMLmJpbmRCdWZmZXIgbUdMLkFSUkFZX0JVRkZFUiwgbnVsbFxuICAgICAgICAjIGNyZWF0ZSBhIDNEIGN1YmUgVmVydGV4IEJ1ZmZlclxuICAgICAgICBtVkJPX0N1YmVQb3MgPSBtR0wuY3JlYXRlQnVmZmVyKClcbiAgICAgICAgbUdMLmJpbmRCdWZmZXIgbUdMLkFSUkFZX0JVRkZFUiwgbVZCT19DdWJlUG9zXG4gICAgICAgIG1HTC5idWZmZXJEYXRhIG1HTC5BUlJBWV9CVUZGRVIsIG5ldyBGbG9hdDMyQXJyYXkoW1xuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIC0xLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICAgICAgMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAtMS4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgICAgIDEuMFxuICAgICAgICAgICAgLTEuMFxuICAgICAgICBdKSwgbUdMLlNUQVRJQ19EUkFXXG4gICAgICAgIG1HTC5iaW5kQnVmZmVyIG1HTC5BUlJBWV9CVUZGRVIsIG51bGxcbiAgICAgICAgdHJ1ZVxuXG4gICAgbWUuQ2hlY2tFcnJvcnMgPSAtPlxuICAgICAgICBlcnJvciA9IG1HTC5nZXRFcnJvcigpXG4gICAgICAgIGlmIGVycm9yICE9IG1HTC5OT19FUlJPUlxuICAgICAgICAgICAgZm9yIHByb3Agb2YgbUdMXG4gICAgICAgICAgICAgICAgaWYgdHlwZW9mIG1HTFtwcm9wXSA9PSAnbnVtYmVyJ1xuICAgICAgICAgICAgICAgICAgICBpZiBtR0xbcHJvcF0gPT0gZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nICdHTCBFcnJvciAnICsgZXJyb3IgKyAnOiAnICsgcHJvcFxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgcmV0dXJuXG5cbiAgICBtZS5DbGVhciA9IChmbGFncywgY2NvbG9yLCBjZGVwdGgsIGNzdGVuY2lsKSAtPlxuICAgICAgICBtb2RlID0gMFxuICAgICAgICBpZiBmbGFncyAmIDFcbiAgICAgICAgICAgIG1vZGUgfD0gbUdMLkNPTE9SX0JVRkZFUl9CSVRcbiAgICAgICAgICAgIG1HTC5jbGVhckNvbG9yIGNjb2xvclswXSwgY2NvbG9yWzFdLCBjY29sb3JbMl0sIGNjb2xvclszXVxuICAgICAgICBpZiBmbGFncyAmIDJcbiAgICAgICAgICAgIG1vZGUgfD0gbUdMLkRFUFRIX0JVRkZFUl9CSVRcbiAgICAgICAgICAgIG1HTC5jbGVhckRlcHRoIGNkZXB0aFxuICAgICAgICBpZiBmbGFncyAmIDRcbiAgICAgICAgICAgIG1vZGUgfD0gbUdMLlNURU5DSUxfQlVGRkVSX0JJVFxuICAgICAgICAgICAgbUdMLmNsZWFyU3RlbmNpbCBjc3RlbmNpbFxuICAgICAgICBtR0wuY2xlYXIgbW9kZVxuICAgICAgICByZXR1cm5cblxuICAgIG1lLkNyZWF0ZVRleHR1cmUgPSAodHlwZSwgeHJlcywgeXJlcywgZm9ybWF0LCBmaWx0ZXIsIHdyYXAsIGJ1ZmZlcikgLT5cbiAgICAgICAgaWYgbUdMID09IG51bGxcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIGlkID0gbUdMLmNyZWF0ZVRleHR1cmUoKVxuICAgICAgICBnbEZvVHkgPSBpRm9ybWF0UEkyR0woZm9ybWF0KVxuICAgICAgICBnbFdyYXAgPSBtR0wuUkVQRUFUXG4gICAgICAgIGlmIHdyYXAgPT0gbWUuVEVYV1JQLkNMQU1QXG4gICAgICAgICAgICBnbFdyYXAgPSBtR0wuQ0xBTVBfVE9fRURHRVxuICAgICAgICBpZiB0eXBlID09IG1lLlRFWFRZUEUuVDJEXG4gICAgICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfMkQsIGlkXG4gICAgICAgICAgICBtR0wudGV4SW1hZ2UyRCBtR0wuVEVYVFVSRV8yRCwgMCwgZ2xGb1R5Lm1HTEZvcm1hdCwgeHJlcywgeXJlcywgMCwgZ2xGb1R5Lm1HTEV4dGVybmFsLCBnbEZvVHkubUdMVHlwZSwgYnVmZmVyXG4gICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV8yRCwgbUdMLlRFWFRVUkVfV1JBUF9TLCBnbFdyYXBcbiAgICAgICAgICAgIG1HTC50ZXhQYXJhbWV0ZXJpIG1HTC5URVhUVVJFXzJELCBtR0wuVEVYVFVSRV9XUkFQX1QsIGdsV3JhcFxuICAgICAgICAgICAgaWYgZmlsdGVyID09IG1lLkZJTFRFUi5OT05FXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfMkQsIG1HTC5URVhUVVJFX01BR19GSUxURVIsIG1HTC5ORUFSRVNUXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfMkQsIG1HTC5URVhUVVJFX01JTl9GSUxURVIsIG1HTC5ORUFSRVNUXG4gICAgICAgICAgICBlbHNlIGlmIGZpbHRlciA9PSBtZS5GSUxURVIuTElORUFSXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfMkQsIG1HTC5URVhUVVJFX01BR19GSUxURVIsIG1HTC5MSU5FQVJcbiAgICAgICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV8yRCwgbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgbUdMLkxJTkVBUlxuICAgICAgICAgICAgZWxzZSBpZiBmaWx0ZXIgPT0gbWUuRklMVEVSLk1JUE1BUFxuICAgICAgICAgICAgICAgIG1HTC50ZXhQYXJhbWV0ZXJpIG1HTC5URVhUVVJFXzJELCBtR0wuVEVYVFVSRV9NQUdfRklMVEVSLCBtR0wuTElORUFSXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfMkQsIG1HTC5URVhUVVJFX01JTl9GSUxURVIsIG1HTC5MSU5FQVJfTUlQTUFQX0xJTkVBUlxuICAgICAgICAgICAgICAgIG1HTC5nZW5lcmF0ZU1pcG1hcCBtR0wuVEVYVFVSRV8yRFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG1HTC50ZXhQYXJhbWV0ZXJpIG1HTC5URVhUVVJFXzJELCBtR0wuVEVYVFVSRV9NQUdfRklMVEVSLCBtR0wuTkVBUkVTVFxuICAgICAgICAgICAgICAgIG1HTC50ZXhQYXJhbWV0ZXJpIG1HTC5URVhUVVJFXzJELCBtR0wuVEVYVFVSRV9NSU5fRklMVEVSLCBtR0wuTkVBUkVTVF9NSVBNQVBfTElORUFSXG4gICAgICAgICAgICAgICAgbUdMLmdlbmVyYXRlTWlwbWFwIG1HTC5URVhUVVJFXzJEXG4gICAgICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfMkQsIG51bGxcbiAgICAgICAgZWxzZSBpZiB0eXBlID09IG1lLlRFWFRZUEUuVDNEXG4gICAgICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfM0QsIGlkXG4gICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV8zRCwgbUdMLlRFWFRVUkVfQkFTRV9MRVZFTCwgMFxuICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfM0QsIG1HTC5URVhUVVJFX01BWF9MRVZFTCwgTWF0aC5sb2cyKHhyZXMpXG4gICAgICAgICAgICBpZiBmaWx0ZXIgPT0gbWUuRklMVEVSLk5PTkVcbiAgICAgICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV8zRCwgbUdMLlRFWFRVUkVfTUFHX0ZJTFRFUiwgbUdMLk5FQVJFU1RcbiAgICAgICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV8zRCwgbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgbUdMLk5FQVJFU1RcbiAgICAgICAgICAgIGVsc2UgaWYgZmlsdGVyID09IG1lLkZJTFRFUi5MSU5FQVJcbiAgICAgICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV8zRCwgbUdMLlRFWFRVUkVfTUFHX0ZJTFRFUiwgbUdMLkxJTkVBUlxuICAgICAgICAgICAgICAgIG1HTC50ZXhQYXJhbWV0ZXJpIG1HTC5URVhUVVJFXzNELCBtR0wuVEVYVFVSRV9NSU5fRklMVEVSLCBtR0wuTElORUFSXG4gICAgICAgICAgICBlbHNlIGlmIGZpbHRlciA9PSBtZS5GSUxURVIuTUlQTUFQXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfM0QsIG1HTC5URVhUVVJFX01BR19GSUxURVIsIG1HTC5MSU5FQVJcbiAgICAgICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV8zRCwgbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgbUdMLkxJTkVBUl9NSVBNQVBfTElORUFSXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfM0QsIG1HTC5URVhUVVJFX01BR19GSUxURVIsIG1HTC5ORUFSRVNUXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfM0QsIG1HTC5URVhUVVJFX01JTl9GSUxURVIsIG1HTC5ORUFSRVNUX01JUE1BUF9MSU5FQVJcbiAgICAgICAgICAgICAgICBtR0wuZ2VuZXJhdGVNaXBtYXAgbUdMLlRFWFRVUkVfM0RcbiAgICAgICAgICAgIG1HTC50ZXhJbWFnZTNEIG1HTC5URVhUVVJFXzNELCAwLCBnbEZvVHkubUdMRm9ybWF0LCB4cmVzLCB5cmVzLCB5cmVzLCAwLCBnbEZvVHkubUdMRXh0ZXJuYWwsIGdsRm9UeS5tR0xUeXBlLCBidWZmZXJcbiAgICAgICAgICAgIG1HTC50ZXhQYXJhbWV0ZXJpIG1HTC5URVhUVVJFXzNELCBtR0wuVEVYVFVSRV9XUkFQX1IsIGdsV3JhcFxuICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfM0QsIG1HTC5URVhUVVJFX1dSQVBfUywgZ2xXcmFwXG4gICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV8zRCwgbUdMLlRFWFRVUkVfV1JBUF9ULCBnbFdyYXBcbiAgICAgICAgICAgIGlmIGZpbHRlciA9PSBtZS5GSUxURVIuTUlQTUFQXG4gICAgICAgICAgICAgICAgbUdMLmdlbmVyYXRlTWlwbWFwIG1HTC5URVhUVVJFXzNEXG4gICAgICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfM0QsIG51bGxcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbUdMLmJpbmRUZXh0dXJlIG1HTC5URVhUVVJFX0NVQkVfTUFQLCBpZFxuICAgICAgICAgICAgbUdMLnRleEltYWdlMkQgbUdMLlRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWCwgMCwgZ2xGb1R5Lm1HTEZvcm1hdCwgeHJlcywgeXJlcywgMCwgZ2xGb1R5Lm1HTEV4dGVybmFsLCBnbEZvVHkubUdMVHlwZSwgYnVmZmVyXG4gICAgICAgICAgICBtR0wudGV4SW1hZ2UyRCBtR0wuVEVYVFVSRV9DVUJFX01BUF9ORUdBVElWRV9YLCAwLCBnbEZvVHkubUdMRm9ybWF0LCB4cmVzLCB5cmVzLCAwLCBnbEZvVHkubUdMRXh0ZXJuYWwsIGdsRm9UeS5tR0xUeXBlLCBidWZmZXJcbiAgICAgICAgICAgIG1HTC50ZXhJbWFnZTJEIG1HTC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1ksIDAsIGdsRm9UeS5tR0xGb3JtYXQsIHhyZXMsIHlyZXMsIDAsIGdsRm9UeS5tR0xFeHRlcm5hbCwgZ2xGb1R5Lm1HTFR5cGUsIGJ1ZmZlclxuICAgICAgICAgICAgbUdMLnRleEltYWdlMkQgbUdMLlRFWFRVUkVfQ1VCRV9NQVBfTkVHQVRJVkVfWSwgMCwgZ2xGb1R5Lm1HTEZvcm1hdCwgeHJlcywgeXJlcywgMCwgZ2xGb1R5Lm1HTEV4dGVybmFsLCBnbEZvVHkubUdMVHlwZSwgYnVmZmVyXG4gICAgICAgICAgICBtR0wudGV4SW1hZ2UyRCBtR0wuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9aLCAwLCBnbEZvVHkubUdMRm9ybWF0LCB4cmVzLCB5cmVzLCAwLCBnbEZvVHkubUdMRXh0ZXJuYWwsIGdsRm9UeS5tR0xUeXBlLCBidWZmZXJcbiAgICAgICAgICAgIG1HTC50ZXhJbWFnZTJEIG1HTC5URVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1osIDAsIGdsRm9UeS5tR0xGb3JtYXQsIHhyZXMsIHlyZXMsIDAsIGdsRm9UeS5tR0xFeHRlcm5hbCwgZ2xGb1R5Lm1HTFR5cGUsIGJ1ZmZlclxuICAgICAgICAgICAgaWYgZmlsdGVyID09IG1lLkZJTFRFUi5OT05FXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfQ1VCRV9NQVAsIG1HTC5URVhUVVJFX01BR19GSUxURVIsIG1HTC5ORUFSRVNUXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfQ1VCRV9NQVAsIG1HTC5URVhUVVJFX01JTl9GSUxURVIsIG1HTC5ORUFSRVNUXG4gICAgICAgICAgICBlbHNlIGlmIGZpbHRlciA9PSBtZS5GSUxURVIuTElORUFSXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfQ1VCRV9NQVAsIG1HTC5URVhUVVJFX01BR19GSUxURVIsIG1HTC5MSU5FQVJcbiAgICAgICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV9DVUJFX01BUCwgbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgbUdMLkxJTkVBUlxuICAgICAgICAgICAgZWxzZSBpZiBmaWx0ZXIgPT0gbWUuRklMVEVSLk1JUE1BUFxuICAgICAgICAgICAgICAgIG1HTC50ZXhQYXJhbWV0ZXJpIG1HTC5URVhUVVJFX0NVQkVfTUFQLCBtR0wuVEVYVFVSRV9NQUdfRklMVEVSLCBtR0wuTElORUFSXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfQ1VCRV9NQVAsIG1HTC5URVhUVVJFX01JTl9GSUxURVIsIG1HTC5MSU5FQVJfTUlQTUFQX0xJTkVBUlxuICAgICAgICAgICAgaWYgZmlsdGVyID09IG1lLkZJTFRFUi5NSVBNQVBcbiAgICAgICAgICAgICAgICBtR0wuZ2VuZXJhdGVNaXBtYXAgbUdMLlRFWFRVUkVfQ1VCRV9NQVBcbiAgICAgICAgICAgIG1HTC5iaW5kVGV4dHVyZSBtR0wuVEVYVFVSRV9DVUJFX01BUCwgbnVsbFxuICAgICAgICB7XG4gICAgICAgICAgICBtT2JqZWN0SUQ6IGlkXG4gICAgICAgICAgICBtWHJlczogeHJlc1xuICAgICAgICAgICAgbVlyZXM6IHlyZXNcbiAgICAgICAgICAgIG1Gb3JtYXQ6IGZvcm1hdFxuICAgICAgICAgICAgbVR5cGU6IHR5cGVcbiAgICAgICAgICAgIG1GaWx0ZXI6IGZpbHRlclxuICAgICAgICAgICAgbVdyYXA6IHdyYXBcbiAgICAgICAgICAgIG1WRmxpcDogZmFsc2VcbiAgICAgICAgfVxuXG4gICAgbWUuQ3JlYXRlVGV4dHVyZUZyb21JbWFnZSA9ICh0eXBlLCBpbWFnZSwgZm9ybWF0LCBmaWx0ZXIsIHdyYXAsIGZsaXBZKSAtPlxuICAgICAgICBpZiBtR0wgPT0gbnVsbFxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgaWQgPSBtR0wuY3JlYXRlVGV4dHVyZSgpXG4gICAgICAgIGdsRm9UeSA9IGlGb3JtYXRQSTJHTChmb3JtYXQpXG4gICAgICAgIGdsV3JhcCA9IG1HTC5SRVBFQVRcbiAgICAgICAgaWYgd3JhcCA9PSBtZS5URVhXUlAuQ0xBTVBcbiAgICAgICAgICAgIGdsV3JhcCA9IG1HTC5DTEFNUF9UT19FREdFXG4gICAgICAgIGlmIHR5cGUgPT0gbWUuVEVYVFlQRS5UMkRcbiAgICAgICAgICAgIG1HTC5iaW5kVGV4dHVyZSBtR0wuVEVYVFVSRV8yRCwgaWRcbiAgICAgICAgICAgIG1HTC5waXhlbFN0b3JlaSBtR0wuVU5QQUNLX0ZMSVBfWV9XRUJHTCwgZmxpcFlcbiAgICAgICAgICAgIG1HTC5waXhlbFN0b3JlaSBtR0wuVU5QQUNLX1BSRU1VTFRJUExZX0FMUEhBX1dFQkdMLCBmYWxzZVxuICAgICAgICAgICAgbUdMLnBpeGVsU3RvcmVpIG1HTC5VTlBBQ0tfQ09MT1JTUEFDRV9DT05WRVJTSU9OX1dFQkdMLCBtR0wuTk9ORVxuICAgICAgICAgICAgbUdMLnRleEltYWdlMkQgbUdMLlRFWFRVUkVfMkQsIDAsIGdsRm9UeS5tR0xGb3JtYXQsIGdsRm9UeS5tR0xFeHRlcm5hbCwgZ2xGb1R5Lm1HTFR5cGUsIGltYWdlXG4gICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV8yRCwgbUdMLlRFWFRVUkVfV1JBUF9TLCBnbFdyYXBcbiAgICAgICAgICAgIG1HTC50ZXhQYXJhbWV0ZXJpIG1HTC5URVhUVVJFXzJELCBtR0wuVEVYVFVSRV9XUkFQX1QsIGdsV3JhcFxuICAgICAgICAgICAgaWYgZmlsdGVyID09IG1lLkZJTFRFUi5OT05FXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfMkQsIG1HTC5URVhUVVJFX01BR19GSUxURVIsIG1HTC5ORUFSRVNUXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfMkQsIG1HTC5URVhUVVJFX01JTl9GSUxURVIsIG1HTC5ORUFSRVNUXG4gICAgICAgICAgICBlbHNlIGlmIGZpbHRlciA9PSBtZS5GSUxURVIuTElORUFSXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfMkQsIG1HTC5URVhUVVJFX01BR19GSUxURVIsIG1HTC5MSU5FQVJcbiAgICAgICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV8yRCwgbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgbUdMLkxJTkVBUlxuICAgICAgICAgICAgZWxzZSBpZiBmaWx0ZXIgPT0gbWUuRklMVEVSLk1JUE1BUFxuICAgICAgICAgICAgICAgIG1HTC50ZXhQYXJhbWV0ZXJpIG1HTC5URVhUVVJFXzJELCBtR0wuVEVYVFVSRV9NQUdfRklMVEVSLCBtR0wuTElORUFSXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfMkQsIG1HTC5URVhUVVJFX01JTl9GSUxURVIsIG1HTC5MSU5FQVJfTUlQTUFQX0xJTkVBUlxuICAgICAgICAgICAgICAgIG1HTC5nZW5lcmF0ZU1pcG1hcCBtR0wuVEVYVFVSRV8yRFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG1HTC50ZXhQYXJhbWV0ZXJpIG1HTC5URVhUVVJFXzJELCBtR0wuVEVYVFVSRV9NQUdfRklMVEVSLCBtR0wuTElORUFSXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfMkQsIG1HTC5URVhUVVJFX01JTl9GSUxURVIsIG1HTC5ORUFSRVNUX01JUE1BUF9MSU5FQVJcbiAgICAgICAgICAgICAgICBtR0wuZ2VuZXJhdGVNaXBtYXAgbUdMLlRFWFRVUkVfMkRcbiAgICAgICAgICAgIG1HTC5iaW5kVGV4dHVyZSBtR0wuVEVYVFVSRV8yRCwgbnVsbFxuICAgICAgICBlbHNlIGlmIHR5cGUgPT0gbWUuVEVYVFlQRS5UM0RcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1HTC5iaW5kVGV4dHVyZSBtR0wuVEVYVFVSRV9DVUJFX01BUCwgaWRcbiAgICAgICAgICAgIG1HTC5waXhlbFN0b3JlaSBtR0wuVU5QQUNLX0ZMSVBfWV9XRUJHTCwgZmxpcFlcbiAgICAgICAgICAgIG1HTC5hY3RpdmVUZXh0dXJlIG1HTC5URVhUVVJFMFxuICAgICAgICAgICAgbUdMLnRleEltYWdlMkQgbUdMLlRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWCwgMCwgZ2xGb1R5Lm1HTEZvcm1hdCwgZ2xGb1R5Lm1HTEV4dGVybmFsLCBnbEZvVHkubUdMVHlwZSwgaW1hZ2VbMF1cbiAgICAgICAgICAgIG1HTC50ZXhJbWFnZTJEIG1HTC5URVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1gsIDAsIGdsRm9UeS5tR0xGb3JtYXQsIGdsRm9UeS5tR0xFeHRlcm5hbCwgZ2xGb1R5Lm1HTFR5cGUsIGltYWdlWzFdXG4gICAgICAgICAgICBtR0wudGV4SW1hZ2UyRCBtR0wuVEVYVFVSRV9DVUJFX01BUF9QT1NJVElWRV9ZLCAwLCBnbEZvVHkubUdMRm9ybWF0LCBnbEZvVHkubUdMRXh0ZXJuYWwsIGdsRm9UeS5tR0xUeXBlLCBpZiBmbGlwWSB0aGVuIGltYWdlWzNdIGVsc2UgaW1hZ2VbMl1cbiAgICAgICAgICAgIG1HTC50ZXhJbWFnZTJEIG1HTC5URVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1ksIDAsIGdsRm9UeS5tR0xGb3JtYXQsIGdsRm9UeS5tR0xFeHRlcm5hbCwgZ2xGb1R5Lm1HTFR5cGUsIGlmIGZsaXBZIHRoZW4gaW1hZ2VbMl0gZWxzZSBpbWFnZVszXVxuICAgICAgICAgICAgbUdMLnRleEltYWdlMkQgbUdMLlRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWiwgMCwgZ2xGb1R5Lm1HTEZvcm1hdCwgZ2xGb1R5Lm1HTEV4dGVybmFsLCBnbEZvVHkubUdMVHlwZSwgaW1hZ2VbNF1cbiAgICAgICAgICAgIG1HTC50ZXhJbWFnZTJEIG1HTC5URVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1osIDAsIGdsRm9UeS5tR0xGb3JtYXQsIGdsRm9UeS5tR0xFeHRlcm5hbCwgZ2xGb1R5Lm1HTFR5cGUsIGltYWdlWzVdXG4gICAgICAgICAgICBpZiBmaWx0ZXIgPT0gbWUuRklMVEVSLk5PTkVcbiAgICAgICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV9DVUJFX01BUCwgbUdMLlRFWFRVUkVfTUFHX0ZJTFRFUiwgbUdMLk5FQVJFU1RcbiAgICAgICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV9DVUJFX01BUCwgbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgbUdMLk5FQVJFU1RcbiAgICAgICAgICAgIGVsc2UgaWYgZmlsdGVyID09IG1lLkZJTFRFUi5MSU5FQVJcbiAgICAgICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV9DVUJFX01BUCwgbUdMLlRFWFRVUkVfTUFHX0ZJTFRFUiwgbUdMLkxJTkVBUlxuICAgICAgICAgICAgICAgIG1HTC50ZXhQYXJhbWV0ZXJpIG1HTC5URVhUVVJFX0NVQkVfTUFQLCBtR0wuVEVYVFVSRV9NSU5fRklMVEVSLCBtR0wuTElORUFSXG4gICAgICAgICAgICBlbHNlIGlmIGZpbHRlciA9PSBtZS5GSUxURVIuTUlQTUFQXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfQ1VCRV9NQVAsIG1HTC5URVhUVVJFX01BR19GSUxURVIsIG1HTC5MSU5FQVJcbiAgICAgICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV9DVUJFX01BUCwgbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgbUdMLkxJTkVBUl9NSVBNQVBfTElORUFSXG4gICAgICAgICAgICAgICAgbUdMLmdlbmVyYXRlTWlwbWFwIG1HTC5URVhUVVJFX0NVQkVfTUFQXG4gICAgICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfQ1VCRV9NQVAsIG51bGxcbiAgICAgICAge1xuICAgICAgICAgICAgbU9iamVjdElEOiBpZFxuICAgICAgICAgICAgbVhyZXM6IGltYWdlLndpZHRoXG4gICAgICAgICAgICBtWXJlczogaW1hZ2UuaGVpZ2h0XG4gICAgICAgICAgICBtRm9ybWF0OiBmb3JtYXRcbiAgICAgICAgICAgIG1UeXBlOiB0eXBlXG4gICAgICAgICAgICBtRmlsdGVyOiBmaWx0ZXJcbiAgICAgICAgICAgIG1XcmFwOiB3cmFwXG4gICAgICAgICAgICBtVkZsaXA6IGZsaXBZXG4gICAgICAgIH1cblxuICAgIG1lLlNldFNhbXBsZXJGaWx0ZXIgPSAodGUsIGZpbHRlciwgZG9HZW5lcmF0ZU1pcHNJZk5lZWRlZCkgLT5cbiAgICAgICAgaWYgdGUubUZpbHRlciA9PSBmaWx0ZXJcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICBpZiB0ZS5tVHlwZSA9PSBtZS5URVhUWVBFLlQyRFxuICAgICAgICAgICAgbUdMLmJpbmRUZXh0dXJlIG1HTC5URVhUVVJFXzJELCB0ZS5tT2JqZWN0SURcbiAgICAgICAgICAgIGlmIGZpbHRlciA9PSBtZS5GSUxURVIuTk9ORVxuICAgICAgICAgICAgICAgIG1HTC50ZXhQYXJhbWV0ZXJpIG1HTC5URVhUVVJFXzJELCBtR0wuVEVYVFVSRV9NQUdfRklMVEVSLCBtR0wuTkVBUkVTVFxuICAgICAgICAgICAgICAgIG1HTC50ZXhQYXJhbWV0ZXJpIG1HTC5URVhUVVJFXzJELCBtR0wuVEVYVFVSRV9NSU5fRklMVEVSLCBtR0wuTkVBUkVTVFxuICAgICAgICAgICAgZWxzZSBpZiBmaWx0ZXIgPT0gbWUuRklMVEVSLkxJTkVBUlxuICAgICAgICAgICAgICAgIG1HTC50ZXhQYXJhbWV0ZXJpIG1HTC5URVhUVVJFXzJELCBtR0wuVEVYVFVSRV9NQUdfRklMVEVSLCBtR0wuTElORUFSXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfMkQsIG1HTC5URVhUVVJFX01JTl9GSUxURVIsIG1HTC5MSU5FQVJcbiAgICAgICAgICAgIGVsc2UgaWYgZmlsdGVyID09IG1lLkZJTFRFUi5NSVBNQVBcbiAgICAgICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV8yRCwgbUdMLlRFWFRVUkVfTUFHX0ZJTFRFUiwgbUdMLkxJTkVBUlxuICAgICAgICAgICAgICAgIG1HTC50ZXhQYXJhbWV0ZXJpIG1HTC5URVhUVVJFXzJELCBtR0wuVEVYVFVSRV9NSU5fRklMVEVSLCBtR0wuTElORUFSX01JUE1BUF9MSU5FQVJcbiAgICAgICAgICAgICAgICBpZiBkb0dlbmVyYXRlTWlwc0lmTmVlZGVkXG4gICAgICAgICAgICAgICAgICAgIG1HTC5nZW5lcmF0ZU1pcG1hcCBtR0wuVEVYVFVSRV8yRFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG1HTC50ZXhQYXJhbWV0ZXJpIG1HTC5URVhUVVJFXzJELCBtR0wuVEVYVFVSRV9NQUdfRklMVEVSLCBtR0wuTkVBUkVTVFxuICAgICAgICAgICAgICAgIG1HTC50ZXhQYXJhbWV0ZXJpIG1HTC5URVhUVVJFXzJELCBtR0wuVEVYVFVSRV9NSU5fRklMVEVSLCBtR0wuTkVBUkVTVF9NSVBNQVBfTElORUFSXG4gICAgICAgICAgICAgICAgaWYgZG9HZW5lcmF0ZU1pcHNJZk5lZWRlZFxuICAgICAgICAgICAgICAgICAgICBtR0wuZ2VuZXJhdGVNaXBtYXAgbUdMLlRFWFRVUkVfMkRcbiAgICAgICAgICAgIG1HTC5iaW5kVGV4dHVyZSBtR0wuVEVYVFVSRV8yRCwgbnVsbFxuICAgICAgICBlbHNlIGlmIHRlLm1UeXBlID09IG1lLlRFWFRZUEUuVDNEXG4gICAgICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfM0QsIHRlLm1PYmplY3RJRFxuICAgICAgICAgICAgaWYgZmlsdGVyID09IG1lLkZJTFRFUi5OT05FXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfM0QsIG1HTC5URVhUVVJFX01BR19GSUxURVIsIG1HTC5ORUFSRVNUXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfM0QsIG1HTC5URVhUVVJFX01JTl9GSUxURVIsIG1HTC5ORUFSRVNUXG4gICAgICAgICAgICBlbHNlIGlmIGZpbHRlciA9PSBtZS5GSUxURVIuTElORUFSXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfM0QsIG1HTC5URVhUVVJFX01BR19GSUxURVIsIG1HTC5MSU5FQVJcbiAgICAgICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV8zRCwgbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgbUdMLkxJTkVBUlxuICAgICAgICAgICAgZWxzZSBpZiBmaWx0ZXIgPT0gbWUuRklMVEVSLk1JUE1BUFxuICAgICAgICAgICAgICAgIG1HTC50ZXhQYXJhbWV0ZXJpIG1HTC5URVhUVVJFXzNELCBtR0wuVEVYVFVSRV9NQUdfRklMVEVSLCBtR0wuTElORUFSXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfM0QsIG1HTC5URVhUVVJFX01JTl9GSUxURVIsIG1HTC5MSU5FQVJfTUlQTUFQX0xJTkVBUlxuICAgICAgICAgICAgICAgIGlmIGRvR2VuZXJhdGVNaXBzSWZOZWVkZWRcbiAgICAgICAgICAgICAgICAgICAgbUdMLmdlbmVyYXRlTWlwbWFwIG1HTC5URVhUVVJFXzNEXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfM0QsIG1HTC5URVhUVVJFX01BR19GSUxURVIsIG1HTC5ORUFSRVNUXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfM0QsIG1HTC5URVhUVVJFX01JTl9GSUxURVIsIG1HTC5ORUFSRVNUX01JUE1BUF9MSU5FQVJcbiAgICAgICAgICAgICAgICBpZiBkb0dlbmVyYXRlTWlwc0lmTmVlZGVkXG4gICAgICAgICAgICAgICAgICAgIG1HTC5nZW5lcmF0ZU1pcG1hcCBtR0wuVEVYVFVSRV8zRFxuICAgICAgICAgICAgbUdMLmJpbmRUZXh0dXJlIG1HTC5URVhUVVJFXzNELCBudWxsXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1HTC5iaW5kVGV4dHVyZSBtR0wuVEVYVFVSRV9DVUJFX01BUCwgdGUubU9iamVjdElEXG4gICAgICAgICAgICBpZiBmaWx0ZXIgPT0gbWUuRklMVEVSLk5PTkVcbiAgICAgICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV9DVUJFX01BUCwgbUdMLlRFWFRVUkVfTUFHX0ZJTFRFUiwgbUdMLk5FQVJFU1RcbiAgICAgICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV9DVUJFX01BUCwgbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgbUdMLk5FQVJFU1RcbiAgICAgICAgICAgIGVsc2UgaWYgZmlsdGVyID09IG1lLkZJTFRFUi5MSU5FQVJcbiAgICAgICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV9DVUJFX01BUCwgbUdMLlRFWFRVUkVfTUFHX0ZJTFRFUiwgbUdMLkxJTkVBUlxuICAgICAgICAgICAgICAgIG1HTC50ZXhQYXJhbWV0ZXJpIG1HTC5URVhUVVJFX0NVQkVfTUFQLCBtR0wuVEVYVFVSRV9NSU5fRklMVEVSLCBtR0wuTElORUFSXG4gICAgICAgICAgICBlbHNlIGlmIGZpbHRlciA9PSBtZS5GSUxURVIuTUlQTUFQXG4gICAgICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfQ1VCRV9NQVAsIG1HTC5URVhUVVJFX01BR19GSUxURVIsIG1HTC5MSU5FQVJcbiAgICAgICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV9DVUJFX01BUCwgbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgbUdMLkxJTkVBUl9NSVBNQVBfTElORUFSXG4gICAgICAgICAgICAgICAgaWYgZG9HZW5lcmF0ZU1pcHNJZk5lZWRlZFxuICAgICAgICAgICAgICAgICAgICBtR0wuZ2VuZXJhdGVNaXBtYXAgbUdMLlRFWFRVUkVfQ1VCRV9NQVBcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV9DVUJFX01BUCwgbUdMLlRFWFRVUkVfTUFHX0ZJTFRFUiwgbUdMLk5FQVJFU1RcbiAgICAgICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV9DVUJFX01BUCwgbUdMLlRFWFRVUkVfTUlOX0ZJTFRFUiwgbUdMLk5FQVJFU1RfTUlQTUFQX0xJTkVBUlxuICAgICAgICAgICAgICAgIGlmIGRvR2VuZXJhdGVNaXBzSWZOZWVkZWRcbiAgICAgICAgICAgICAgICAgICAgbUdMLmdlbmVyYXRlTWlwbWFwIG1HTC5URVhUVVJFX0NVQkVfTUFQXG4gICAgICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfQ1VCRV9NQVAsIG51bGxcbiAgICAgICAgdGUubUZpbHRlciA9IGZpbHRlclxuICAgICAgICByZXR1cm5cblxuICAgIG1lLlNldFNhbXBsZXJXcmFwID0gKHRlLCB3cmFwKSAtPlxuICAgICAgICBpZiB0ZS5tV3JhcCA9PSB3cmFwXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgZ2xXcmFwID0gbUdMLlJFUEVBVFxuICAgICAgICBpZiB3cmFwID09IG1lLlRFWFdSUC5DTEFNUFxuICAgICAgICAgICAgZ2xXcmFwID0gbUdMLkNMQU1QX1RPX0VER0VcbiAgICAgICAgaWQgPSB0ZS5tT2JqZWN0SURcbiAgICAgICAgaWYgdGUubVR5cGUgPT0gbWUuVEVYVFlQRS5UMkRcbiAgICAgICAgICAgIG1HTC5iaW5kVGV4dHVyZSBtR0wuVEVYVFVSRV8yRCwgaWRcbiAgICAgICAgICAgIG1HTC50ZXhQYXJhbWV0ZXJpIG1HTC5URVhUVVJFXzJELCBtR0wuVEVYVFVSRV9XUkFQX1MsIGdsV3JhcFxuICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfMkQsIG1HTC5URVhUVVJFX1dSQVBfVCwgZ2xXcmFwXG4gICAgICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfMkQsIG51bGxcbiAgICAgICAgZWxzZSBpZiB0ZS5tVHlwZSA9PSBtZS5URVhUWVBFLlQzRFxuICAgICAgICAgICAgbUdMLmJpbmRUZXh0dXJlIG1HTC5URVhUVVJFXzNELCBpZFxuICAgICAgICAgICAgbUdMLnRleFBhcmFtZXRlcmkgbUdMLlRFWFRVUkVfM0QsIG1HTC5URVhUVVJFX1dSQVBfUiwgZ2xXcmFwXG4gICAgICAgICAgICBtR0wudGV4UGFyYW1ldGVyaSBtR0wuVEVYVFVSRV8zRCwgbUdMLlRFWFRVUkVfV1JBUF9TLCBnbFdyYXBcbiAgICAgICAgICAgIG1HTC50ZXhQYXJhbWV0ZXJpIG1HTC5URVhUVVJFXzNELCBtR0wuVEVYVFVSRV9XUkFQX1QsIGdsV3JhcFxuICAgICAgICAgICAgbUdMLmJpbmRUZXh0dXJlIG1HTC5URVhUVVJFXzNELCBudWxsXG4gICAgICAgIHRlLm1XcmFwID0gd3JhcFxuICAgICAgICByZXR1cm5cblxuICAgIG1lLlNldFNhbXBsZXJWRmxpcCA9ICh0ZSwgdmZsaXAsIGltYWdlKSAtPlxuICAgICAgICBgdmFyIGdsRm9UeWBcbiAgICAgICAgaWYgdGUubVZGbGlwID09IHZmbGlwXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgaWQgPSB0ZS5tT2JqZWN0SURcbiAgICAgICAgaWYgdGUubVR5cGUgPT0gbWUuVEVYVFlQRS5UMkRcbiAgICAgICAgICAgIGlmIGltYWdlICE9IG51bGxcbiAgICAgICAgICAgICAgICBtR0wuYWN0aXZlVGV4dHVyZSBtR0wuVEVYVFVSRTBcbiAgICAgICAgICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfMkQsIGlkXG4gICAgICAgICAgICAgICAgbUdMLnBpeGVsU3RvcmVpIG1HTC5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCB2ZmxpcFxuICAgICAgICAgICAgICAgIGdsRm9UeSA9IGlGb3JtYXRQSTJHTCh0ZS5tRm9ybWF0KVxuICAgICAgICAgICAgICAgIG1HTC50ZXhJbWFnZTJEIG1HTC5URVhUVVJFXzJELCAwLCBnbEZvVHkubUdMRm9ybWF0LCBnbEZvVHkubUdMRXh0ZXJuYWwsIGdsRm9UeS5tR0xUeXBlLCBpbWFnZVxuICAgICAgICAgICAgICAgIG1HTC5iaW5kVGV4dHVyZSBtR0wuVEVYVFVSRV8yRCwgbnVsbFxuICAgICAgICBlbHNlIGlmIHRlLm1UeXBlID09IG1lLlRFWFRZUEUuQ1VCRU1BUFxuICAgICAgICAgICAgaWYgaW1hZ2UgIT0gbnVsbFxuICAgICAgICAgICAgICAgIGdsRm9UeSA9IGlGb3JtYXRQSTJHTCh0ZS5tRm9ybWF0KVxuICAgICAgICAgICAgICAgIG1HTC5hY3RpdmVUZXh0dXJlIG1HTC5URVhUVVJFMFxuICAgICAgICAgICAgICAgIG1HTC5iaW5kVGV4dHVyZSBtR0wuVEVYVFVSRV9DVUJFX01BUCwgaWRcbiAgICAgICAgICAgICAgICBtR0wucGl4ZWxTdG9yZWkgbUdMLlVOUEFDS19GTElQX1lfV0VCR0wsIHZmbGlwXG4gICAgICAgICAgICAgICAgbUdMLnRleEltYWdlMkQgbUdMLlRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWCwgMCwgZ2xGb1R5Lm1HTEZvcm1hdCwgZ2xGb1R5Lm1HTEV4dGVybmFsLCBnbEZvVHkubUdMVHlwZSwgaW1hZ2VbMF1cbiAgICAgICAgICAgICAgICBtR0wudGV4SW1hZ2UyRCBtR0wuVEVYVFVSRV9DVUJFX01BUF9ORUdBVElWRV9YLCAwLCBnbEZvVHkubUdMRm9ybWF0LCBnbEZvVHkubUdMRXh0ZXJuYWwsIGdsRm9UeS5tR0xUeXBlLCBpbWFnZVsxXVxuICAgICAgICAgICAgICAgIG1HTC50ZXhJbWFnZTJEIG1HTC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1ksIDAsIGdsRm9UeS5tR0xGb3JtYXQsIGdsRm9UeS5tR0xFeHRlcm5hbCwgZ2xGb1R5Lm1HTFR5cGUsIGlmIHZmbGlwIHRoZW4gaW1hZ2VbM10gZWxzZSBpbWFnZVsyXVxuICAgICAgICAgICAgICAgIG1HTC50ZXhJbWFnZTJEIG1HTC5URVhUVVJFX0NVQkVfTUFQX05FR0FUSVZFX1ksIDAsIGdsRm9UeS5tR0xGb3JtYXQsIGdsRm9UeS5tR0xFeHRlcm5hbCwgZ2xGb1R5Lm1HTFR5cGUsIGlmIHZmbGlwIHRoZW4gaW1hZ2VbMl0gZWxzZSBpbWFnZVszXVxuICAgICAgICAgICAgICAgIG1HTC50ZXhJbWFnZTJEIG1HTC5URVhUVVJFX0NVQkVfTUFQX1BPU0lUSVZFX1osIDAsIGdsRm9UeS5tR0xGb3JtYXQsIGdsRm9UeS5tR0xFeHRlcm5hbCwgZ2xGb1R5Lm1HTFR5cGUsIGltYWdlWzRdXG4gICAgICAgICAgICAgICAgbUdMLnRleEltYWdlMkQgbUdMLlRFWFRVUkVfQ1VCRV9NQVBfTkVHQVRJVkVfWiwgMCwgZ2xGb1R5Lm1HTEZvcm1hdCwgZ2xGb1R5Lm1HTEV4dGVybmFsLCBnbEZvVHkubUdMVHlwZSwgaW1hZ2VbNV1cbiAgICAgICAgICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfQ1VCRV9NQVAsIG51bGxcbiAgICAgICAgdGUubVZGbGlwID0gdmZsaXBcbiAgICAgICAgcmV0dXJuXG5cbiAgICBtZS5DcmVhdGVNaXBtYXBzID0gKHRlKSAtPlxuICAgICAgICBpZiB0ZS5tVHlwZSA9PSBtZS5URVhUWVBFLlQyRFxuICAgICAgICAgICAgbUdMLmFjdGl2ZVRleHR1cmUgbUdMLlRFWFRVUkUwXG4gICAgICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfMkQsIHRlLm1PYmplY3RJRFxuICAgICAgICAgICAgbUdMLmdlbmVyYXRlTWlwbWFwIG1HTC5URVhUVVJFXzJEXG4gICAgICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfMkQsIG51bGxcbiAgICAgICAgZWxzZSBpZiB0ZS5tVHlwZSA9PSBtZS5URVhUWVBFLkNVQkVNQVBcbiAgICAgICAgICAgIG1HTC5hY3RpdmVUZXh0dXJlIG1HTC5URVhUVVJFMFxuICAgICAgICAgICAgbUdMLmJpbmRUZXh0dXJlIG1HTC5URVhUVVJFX0NVQkVfTUFQLCB0ZS5tT2JqZWN0SURcbiAgICAgICAgICAgIG1HTC5nZW5lcmF0ZU1pcG1hcCBtR0wuVEVYVFVSRV9DVUJFX01BUFxuICAgICAgICAgICAgbUdMLmJpbmRUZXh0dXJlIG1HTC5URVhUVVJFX0NVQkVfTUFQLCBudWxsXG4gICAgICAgIHJldHVyblxuXG4gICAgbWUuVXBkYXRlVGV4dHVyZSA9ICh0ZXgsIHgwLCB5MCwgeHJlcywgeXJlcywgYnVmZmVyKSAtPlxuICAgICAgICBnbEZvVHkgPSBpRm9ybWF0UEkyR0wodGV4Lm1Gb3JtYXQpXG4gICAgICAgIGlmIHRleC5tVHlwZSA9PSBtZS5URVhUWVBFLlQyRFxuICAgICAgICAgICAgbUdMLmFjdGl2ZVRleHR1cmUgbUdMLlRFWFRVUkUwXG4gICAgICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfMkQsIHRleC5tT2JqZWN0SURcbiAgICAgICAgICAgIG1HTC5waXhlbFN0b3JlaSBtR0wuVU5QQUNLX0ZMSVBfWV9XRUJHTCwgdGV4Lm1WRmxpcFxuICAgICAgICAgICAgbUdMLnRleFN1YkltYWdlMkQgbUdMLlRFWFRVUkVfMkQsIDAsIHgwLCB5MCwgeHJlcywgeXJlcywgZ2xGb1R5Lm1HTEV4dGVybmFsLCBnbEZvVHkubUdMVHlwZSwgYnVmZmVyXG4gICAgICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfMkQsIG51bGxcbiAgICAgICAgcmV0dXJuXG5cbiAgICBtZS5VcGRhdGVUZXh0dXJlRnJvbUltYWdlID0gKHRleCwgaW1hZ2UpIC0+XG4gICAgICAgIGdsRm9UeSA9IGlGb3JtYXRQSTJHTCh0ZXgubUZvcm1hdClcbiAgICAgICAgaWYgdGV4Lm1UeXBlID09IG1lLlRFWFRZUEUuVDJEXG4gICAgICAgICAgICBtR0wuYWN0aXZlVGV4dHVyZSBtR0wuVEVYVFVSRTBcbiAgICAgICAgICAgIG1HTC5iaW5kVGV4dHVyZSBtR0wuVEVYVFVSRV8yRCwgdGV4Lm1PYmplY3RJRFxuICAgICAgICAgICAgbUdMLnBpeGVsU3RvcmVpIG1HTC5VTlBBQ0tfRkxJUF9ZX1dFQkdMLCB0ZXgubVZGbGlwXG4gICAgICAgICAgICBtR0wudGV4SW1hZ2UyRCBtR0wuVEVYVFVSRV8yRCwgMCwgZ2xGb1R5Lm1HTEZvcm1hdCwgZ2xGb1R5Lm1HTEV4dGVybmFsLCBnbEZvVHkubUdMVHlwZSwgaW1hZ2VcbiAgICAgICAgICAgIG1HTC5iaW5kVGV4dHVyZSBtR0wuVEVYVFVSRV8yRCwgbnVsbFxuICAgICAgICByZXR1cm5cblxuICAgIG1lLkRlc3Ryb3lUZXh0dXJlID0gKHRlKSAtPlxuICAgICAgICBtR0wuZGVsZXRlVGV4dHVyZSB0ZS5tT2JqZWN0SURcbiAgICAgICAgcmV0dXJuXG5cbiAgICBtZS5BdHRhY2hUZXh0dXJlcyA9IChudW0sIHQwLCB0MSwgdDIsIHQzKSAtPlxuICAgICAgICBpZiBudW0gPiAwIGFuZCB0MCAhPSBudWxsXG4gICAgICAgICAgICBtR0wuYWN0aXZlVGV4dHVyZSBtR0wuVEVYVFVSRTBcbiAgICAgICAgICAgIGlmIHQwLm1UeXBlID09IG1lLlRFWFRZUEUuVDJEXG4gICAgICAgICAgICAgICAgbUdMLmJpbmRUZXh0dXJlIG1HTC5URVhUVVJFXzJELCB0MC5tT2JqZWN0SURcbiAgICAgICAgICAgIGVsc2UgaWYgdDAubVR5cGUgPT0gbWUuVEVYVFlQRS5UM0RcbiAgICAgICAgICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfM0QsIHQwLm1PYmplY3RJRFxuICAgICAgICAgICAgZWxzZSBpZiB0MC5tVHlwZSA9PSBtZS5URVhUWVBFLkNVQkVNQVBcbiAgICAgICAgICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfQ1VCRV9NQVAsIHQwLm1PYmplY3RJRFxuICAgICAgICBpZiBudW0gPiAxIGFuZCB0MSAhPSBudWxsXG4gICAgICAgICAgICBtR0wuYWN0aXZlVGV4dHVyZSBtR0wuVEVYVFVSRTFcbiAgICAgICAgICAgIGlmIHQxLm1UeXBlID09IG1lLlRFWFRZUEUuVDJEXG4gICAgICAgICAgICAgICAgbUdMLmJpbmRUZXh0dXJlIG1HTC5URVhUVVJFXzJELCB0MS5tT2JqZWN0SURcbiAgICAgICAgICAgIGVsc2UgaWYgdDEubVR5cGUgPT0gbWUuVEVYVFlQRS5UM0RcbiAgICAgICAgICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfM0QsIHQxLm1PYmplY3RJRFxuICAgICAgICAgICAgZWxzZSBpZiB0MS5tVHlwZSA9PSBtZS5URVhUWVBFLkNVQkVNQVBcbiAgICAgICAgICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfQ1VCRV9NQVAsIHQxLm1PYmplY3RJRFxuICAgICAgICBpZiBudW0gPiAyIGFuZCB0MiAhPSBudWxsXG4gICAgICAgICAgICBtR0wuYWN0aXZlVGV4dHVyZSBtR0wuVEVYVFVSRTJcbiAgICAgICAgICAgIGlmIHQyLm1UeXBlID09IG1lLlRFWFRZUEUuVDJEXG4gICAgICAgICAgICAgICAgbUdMLmJpbmRUZXh0dXJlIG1HTC5URVhUVVJFXzJELCB0Mi5tT2JqZWN0SURcbiAgICAgICAgICAgIGVsc2UgaWYgdDIubVR5cGUgPT0gbWUuVEVYVFlQRS5UM0RcbiAgICAgICAgICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfM0QsIHQyLm1PYmplY3RJRFxuICAgICAgICAgICAgZWxzZSBpZiB0Mi5tVHlwZSA9PSBtZS5URVhUWVBFLkNVQkVNQVBcbiAgICAgICAgICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfQ1VCRV9NQVAsIHQyLm1PYmplY3RJRFxuICAgICAgICBpZiBudW0gPiAzIGFuZCB0MyAhPSBudWxsXG4gICAgICAgICAgICBtR0wuYWN0aXZlVGV4dHVyZSBtR0wuVEVYVFVSRTNcbiAgICAgICAgICAgIGlmIHQzLm1UeXBlID09IG1lLlRFWFRZUEUuVDJEXG4gICAgICAgICAgICAgICAgbUdMLmJpbmRUZXh0dXJlIG1HTC5URVhUVVJFXzJELCB0My5tT2JqZWN0SURcbiAgICAgICAgICAgIGVsc2UgaWYgdDMubVR5cGUgPT0gbWUuVEVYVFlQRS5UM0RcbiAgICAgICAgICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfM0QsIHQzLm1PYmplY3RJRFxuICAgICAgICAgICAgZWxzZSBpZiB0My5tVHlwZSA9PSBtZS5URVhUWVBFLkNVQkVNQVBcbiAgICAgICAgICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfQ1VCRV9NQVAsIHQzLm1PYmplY3RJRFxuICAgICAgICByZXR1cm5cblxuICAgIG1lLkRldHRhY2hUZXh0dXJlcyA9IC0+XG4gICAgICAgIG1HTC5hY3RpdmVUZXh0dXJlIG1HTC5URVhUVVJFMFxuICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfMkQsIG51bGxcbiAgICAgICAgbUdMLmJpbmRUZXh0dXJlIG1HTC5URVhUVVJFX0NVQkVfTUFQLCBudWxsXG4gICAgICAgIG1HTC5hY3RpdmVUZXh0dXJlIG1HTC5URVhUVVJFMVxuICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfMkQsIG51bGxcbiAgICAgICAgbUdMLmJpbmRUZXh0dXJlIG1HTC5URVhUVVJFX0NVQkVfTUFQLCBudWxsXG4gICAgICAgIG1HTC5hY3RpdmVUZXh0dXJlIG1HTC5URVhUVVJFMlxuICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfMkQsIG51bGxcbiAgICAgICAgbUdMLmJpbmRUZXh0dXJlIG1HTC5URVhUVVJFX0NVQkVfTUFQLCBudWxsXG4gICAgICAgIG1HTC5hY3RpdmVUZXh0dXJlIG1HTC5URVhUVVJFM1xuICAgICAgICBtR0wuYmluZFRleHR1cmUgbUdMLlRFWFRVUkVfMkQsIG51bGxcbiAgICAgICAgbUdMLmJpbmRUZXh0dXJlIG1HTC5URVhUVVJFX0NVQkVfTUFQLCBudWxsXG4gICAgICAgIHJldHVyblxuXG4gICAgbWUuQ3JlYXRlUmVuZGVyVGFyZ2V0ID0gKGNvbG9yMCwgY29sb3IxLCBjb2xvcjIsIGNvbG9yMywgZGVwdGgsIHdhbnRaYnVmZmVyKSAtPlxuICAgICAgICBpZCA9IG1HTC5jcmVhdGVGcmFtZWJ1ZmZlcigpXG4gICAgICAgIG1HTC5iaW5kRnJhbWVidWZmZXIgbUdMLkZSQU1FQlVGRkVSLCBpZFxuICAgICAgICBpZiBkZXB0aCA9PSBudWxsXG4gICAgICAgICAgICBpZiB3YW50WmJ1ZmZlciA9PSB0cnVlXG4gICAgICAgICAgICAgICAgemIgPSBtR0wuY3JlYXRlUmVuZGVyYnVmZmVyKClcbiAgICAgICAgICAgICAgICBtR0wuYmluZFJlbmRlcmJ1ZmZlciBtR0wuUkVOREVSQlVGRkVSLCB6YlxuICAgICAgICAgICAgICAgIG1HTC5yZW5kZXJidWZmZXJTdG9yYWdlIG1HTC5SRU5ERVJCVUZGRVIsIG1HTC5ERVBUSF9DT01QT05FTlQxNiwgY29sb3IwLm1YcmVzLCBjb2xvcjAubVlyZXNcbiAgICAgICAgICAgICAgICBtR0wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIgbUdMLkZSQU1FQlVGRkVSLCBtR0wuREVQVEhfQVRUQUNITUVOVCwgbUdMLlJFTkRFUkJVRkZFUiwgemJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbUdMLmZyYW1lYnVmZmVyVGV4dHVyZTJEIG1HTC5GUkFNRUJVRkZFUiwgbUdMLkRFUFRIX0FUVEFDSE1FTlQsIG1HTC5URVhUVVJFXzJELCBkZXB0aC5tT2JqZWN0SUQsIDBcbiAgICAgICAgaWYgY29sb3IwICE9IG51bGxcbiAgICAgICAgICAgIG1HTC5mcmFtZWJ1ZmZlclRleHR1cmUyRCBtR0wuRlJBTUVCVUZGRVIsIG1HTC5DT0xPUl9BVFRBQ0hNRU5UMCwgbUdMLlRFWFRVUkVfMkQsIGNvbG9yMC5tT2JqZWN0SUQsIDBcbiAgICAgICAgaWYgbUdMLmNoZWNrRnJhbWVidWZmZXJTdGF0dXMobUdMLkZSQU1FQlVGRkVSKSAhPSBtR0wuRlJBTUVCVUZGRVJfQ09NUExFVEVcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIG1HTC5iaW5kUmVuZGVyYnVmZmVyIG1HTC5SRU5ERVJCVUZGRVIsIG51bGxcbiAgICAgICAgbUdMLmJpbmRGcmFtZWJ1ZmZlciBtR0wuRlJBTUVCVUZGRVIsIG51bGxcbiAgICAgICAge1xuICAgICAgICAgICAgbU9iamVjdElEOiBpZFxuICAgICAgICAgICAgbVRleDA6IGNvbG9yMFxuICAgICAgICB9XG5cbiAgICBtZS5EZXN0cm95UmVuZGVyVGFyZ2V0ID0gKHRleCkgLT5cbiAgICAgICAgbUdMLmRlbGV0ZUZyYW1lYnVmZmVyIHRleC5tT2JqZWN0SURcbiAgICAgICAgcmV0dXJuXG5cbiAgICBtZS5TZXRSZW5kZXJUYXJnZXQgPSAodGV4KSAtPlxuICAgICAgICBpZiB0ZXggPT0gbnVsbFxuICAgICAgICAgICAgbUdMLmJpbmRGcmFtZWJ1ZmZlciBtR0wuRlJBTUVCVUZGRVIsIG51bGxcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbUdMLmJpbmRGcmFtZWJ1ZmZlciBtR0wuRlJBTUVCVUZGRVIsIHRleC5tT2JqZWN0SURcbiAgICAgICAgcmV0dXJuXG5cbiAgICBtZS5DcmVhdGVSZW5kZXJUYXJnZXROZXcgPSAod2FudENvbG9yMCwgd2FudFpidWZmZXIsIHhyZXMsIHlyZXMsIHNhbXBsZXMpIC0+XG4gICAgICAgIGlkID0gbUdMLmNyZWF0ZUZyYW1lYnVmZmVyKClcbiAgICAgICAgbUdMLmJpbmRGcmFtZWJ1ZmZlciBtR0wuRlJBTUVCVUZGRVIsIGlkXG4gICAgICAgIGlmIHdhbnRaYnVmZmVyID09IHRydWVcbiAgICAgICAgICAgIHpiID0gbUdMLmNyZWF0ZVJlbmRlcmJ1ZmZlcigpXG4gICAgICAgICAgICBtR0wuYmluZFJlbmRlcmJ1ZmZlciBtR0wuUkVOREVSQlVGRkVSLCB6YlxuICAgICAgICAgICAgaWYgc2FtcGxlcyA9PSAxXG4gICAgICAgICAgICAgICAgbUdMLnJlbmRlcmJ1ZmZlclN0b3JhZ2UgbUdMLlJFTkRFUkJVRkZFUiwgbUdMLkRFUFRIX0NPTVBPTkVOVDE2LCB4cmVzLCB5cmVzXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbUdMLnJlbmRlcmJ1ZmZlclN0b3JhZ2VNdWx0aXNhbXBsZSBtR0wuUkVOREVSQlVGRkVSLCBzYW1wbGVzLCBtR0wuREVQVEhfQ09NUE9ORU5UMTYsIHhyZXMsIHlyZXNcbiAgICAgICAgICAgIG1HTC5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlciBtR0wuRlJBTUVCVUZGRVIsIG1HTC5ERVBUSF9BVFRBQ0hNRU5ULCBtR0wuUkVOREVSQlVGRkVSLCB6YlxuICAgICAgICBpZiB3YW50Q29sb3IwXG4gICAgICAgICAgICBjYiA9IG1HTC5jcmVhdGVSZW5kZXJidWZmZXIoKVxuICAgICAgICAgICAgbUdMLmJpbmRSZW5kZXJidWZmZXIgbUdMLlJFTkRFUkJVRkZFUiwgY2JcbiAgICAgICAgICAgIGlmIHNhbXBsZXMgPT0gMVxuICAgICAgICAgICAgICAgIG1HTC5yZW5kZXJidWZmZXJTdG9yYWdlIG1HTC5SRU5ERVJCVUZGRVIsIG1HTC5SR0JBOCwgeHJlcywgeXJlc1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG1HTC5yZW5kZXJidWZmZXJTdG9yYWdlTXVsdGlzYW1wbGUgbUdMLlJFTkRFUkJVRkZFUiwgc2FtcGxlcywgbUdMLlJHQkE4LCB4cmVzLCB5cmVzXG4gICAgICAgICAgICBtR0wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIgbUdMLkZSQU1FQlVGRkVSLCBtR0wuQ09MT1JfQVRUQUNITUVOVDAsIG1HTC5SRU5ERVJCVUZGRVIsIGNiXG4gICAgICAgIGlmIG1HTC5jaGVja0ZyYW1lYnVmZmVyU3RhdHVzKG1HTC5GUkFNRUJVRkZFUikgIT0gbUdMLkZSQU1FQlVGRkVSX0NPTVBMRVRFXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICBtR0wuYmluZFJlbmRlcmJ1ZmZlciBtR0wuUkVOREVSQlVGRkVSLCBudWxsXG4gICAgICAgIG1HTC5iaW5kRnJhbWVidWZmZXIgbUdMLkZSQU1FQlVGRkVSLCBudWxsXG4gICAgICAgIHtcbiAgICAgICAgICAgIG1PYmplY3RJRDogaWRcbiAgICAgICAgICAgIG1YcmVzOiB4cmVzXG4gICAgICAgICAgICBtWXJlczogeXJlc1xuICAgICAgICAgICAgbVRleDA6IGNvbG9yMFxuICAgICAgICB9XG5cbiAgICBtZS5DcmVhdGVSZW5kZXJUYXJnZXRDdWJlTWFwID0gKGNvbG9yMCwgZGVwdGgsIHdhbnRaYnVmZmVyKSAtPlxuICAgICAgICBpZCA9IG1HTC5jcmVhdGVGcmFtZWJ1ZmZlcigpXG4gICAgICAgIG1HTC5iaW5kRnJhbWVidWZmZXIgbUdMLkZSQU1FQlVGRkVSLCBpZFxuICAgICAgICBpZiBkZXB0aCA9PSBudWxsXG4gICAgICAgICAgICBpZiB3YW50WmJ1ZmZlciA9PSB0cnVlXG4gICAgICAgICAgICAgICAgemIgPSBtR0wuY3JlYXRlUmVuZGVyYnVmZmVyKClcbiAgICAgICAgICAgICAgICBtR0wuYmluZFJlbmRlcmJ1ZmZlciBtR0wuUkVOREVSQlVGRkVSLCB6YlxuICAgICAgICAgICAgICAgIG1HTC5yZW5kZXJidWZmZXJTdG9yYWdlIG1HTC5SRU5ERVJCVUZGRVIsIG1HTC5ERVBUSF9DT01QT05FTlQxNiwgY29sb3IwLm1YcmVzLCBjb2xvcjAubVlyZXNcbiAgICAgICAgICAgICAgICBtR0wuZnJhbWVidWZmZXJSZW5kZXJidWZmZXIgbUdMLkZSQU1FQlVGRkVSLCBtR0wuREVQVEhfQVRUQUNITUVOVCwgbUdMLlJFTkRFUkJVRkZFUiwgemJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbUdMLmZyYW1lYnVmZmVyVGV4dHVyZTJEIG1HTC5GUkFNRUJVRkZFUiwgbUdMLkRFUFRIX0FUVEFDSE1FTlQsIG1HTC5URVhUVVJFXzJELCBkZXB0aC5tT2JqZWN0SUQsIDBcbiAgICAgICAgaWYgY29sb3IwICE9IG51bGxcbiAgICAgICAgICAgIG1HTC5mcmFtZWJ1ZmZlclRleHR1cmUyRCBtR0wuRlJBTUVCVUZGRVIsIG1HTC5DT0xPUl9BVFRBQ0hNRU5UMCwgbUdMLlRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWCwgY29sb3IwLm1PYmplY3RJRCwgMFxuICAgICAgICBpZiBtR0wuY2hlY2tGcmFtZWJ1ZmZlclN0YXR1cyhtR0wuRlJBTUVCVUZGRVIpICE9IG1HTC5GUkFNRUJVRkZFUl9DT01QTEVURVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgbUdMLmJpbmRSZW5kZXJidWZmZXIgbUdMLlJFTkRFUkJVRkZFUiwgbnVsbFxuICAgICAgICBtR0wuYmluZEZyYW1lYnVmZmVyIG1HTC5GUkFNRUJVRkZFUiwgbnVsbFxuICAgICAgICB7XG4gICAgICAgICAgICBtT2JqZWN0SUQ6IGlkXG4gICAgICAgICAgICBtVGV4MDogY29sb3IwXG4gICAgICAgIH1cblxuICAgIG1lLlNldFJlbmRlclRhcmdldEN1YmVNYXAgPSAoZmJvLCBmYWNlKSAtPlxuICAgICAgICBpZiBmYm8gPT0gbnVsbFxuICAgICAgICAgICAgbUdMLmJpbmRGcmFtZWJ1ZmZlciBtR0wuRlJBTUVCVUZGRVIsIG51bGxcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbUdMLmJpbmRGcmFtZWJ1ZmZlciBtR0wuRlJBTUVCVUZGRVIsIGZiby5tT2JqZWN0SURcbiAgICAgICAgICAgIG1HTC5mcmFtZWJ1ZmZlclRleHR1cmUyRCBtR0wuRlJBTUVCVUZGRVIsIG1HTC5DT0xPUl9BVFRBQ0hNRU5UMCwgbUdMLlRFWFRVUkVfQ1VCRV9NQVBfUE9TSVRJVkVfWCArIGZhY2UsIGZiby5tVGV4MC5tT2JqZWN0SUQsIDBcbiAgICAgICAgcmV0dXJuXG5cbiAgICBtZS5CbGl0UmVuZGVyVGFyZ2V0ID0gKGRzdCwgc3JjKSAtPlxuICAgICAgICBtR0wuYmluZEZyYW1lYnVmZmVyIG1HTC5SRUFEX0ZSQU1FQlVGRkVSLCBzcmMubU9iamVjdElEXG4gICAgICAgIG1HTC5iaW5kRnJhbWVidWZmZXIgbUdMLkRSQVdfRlJBTUVCVUZGRVIsIGRzdC5tT2JqZWN0SURcbiAgICAgICAgbUdMLmNsZWFyQnVmZmVyZnYgbUdMLkNPTE9SLCAwLCBbXG4gICAgICAgICAgICAwLjBcbiAgICAgICAgICAgIDAuMFxuICAgICAgICAgICAgMC4wXG4gICAgICAgICAgICAxLjBcbiAgICAgICAgXVxuICAgICAgICBtR0wuYmxpdEZyYW1lYnVmZmVyIDAsIDAsIHNyYy5tWHJlcywgc3JjLm1ZcmVzLCAwLCAwLCBzcmMubVhyZXMsIHNyYy5tWXJlcywgbUdMLkNPTE9SX0JVRkZFUl9CSVQsIG1HTC5MSU5FQVJcbiAgICAgICAgcmV0dXJuXG5cbiAgICBtZS5TZXRWaWV3cG9ydCA9ICh2cCkgLT5cbiAgICAgICAgbUdMLnZpZXdwb3J0IHZwWzBdLCB2cFsxXSwgdnBbMl0sIHZwWzNdXG4gICAgICAgIHJldHVyblxuXG4gICAgbWUuU2V0V3JpdGVNYXNrID0gKGMwLCBjMSwgYzIsIGMzLCB6KSAtPlxuICAgICAgICBtR0wuZGVwdGhNYXNrIHpcbiAgICAgICAgbUdMLmNvbG9yTWFzayBjMCwgYzAsIGMwLCBjMFxuICAgICAgICByZXR1cm5cblxuICAgIG1lLlNldFN0YXRlID0gKHN0YXRlTmFtZSwgc3RhdGVWYWx1ZSkgLT5cbiAgICAgICAgaWYgc3RhdGVOYW1lID09IG1lLlJFTkRTVEdBVEUuV0lSRUZSQU1FXG4gICAgICAgICAgICBpZiBzdGF0ZVZhbHVlXG4gICAgICAgICAgICAgICAgbUdMLnBvbHlnb25Nb2RlIG1HTC5GUk9OVF9BTkRfQkFDSywgbUdMLkxJTkVcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBtR0wucG9seWdvbk1vZGUgbUdMLkZST05UX0FORF9CQUNLLCBtR0wuRklMTFxuICAgICAgICBlbHNlIGlmIHN0YXRlTmFtZSA9PSBtZS5SRU5EU1RHQVRFLkZST05UX0ZBQ0VcbiAgICAgICAgICAgIGlmIHN0YXRlVmFsdWVcbiAgICAgICAgICAgICAgICBtR0wuY3VsbEZhY2UgbUdMLkJBQ0tcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBtR0wuY3VsbEZhY2UgbUdMLkZST05UXG4gICAgICAgIGVsc2UgaWYgc3RhdGVOYW1lID09IG1lLlJFTkRTVEdBVEUuQ1VMTF9GQUNFXG4gICAgICAgICAgICBpZiBzdGF0ZVZhbHVlXG4gICAgICAgICAgICAgICAgbUdMLmVuYWJsZSBtR0wuQ1VMTF9GQUNFXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbUdMLmRpc2FibGUgbUdMLkNVTExfRkFDRVxuICAgICAgICBlbHNlIGlmIHN0YXRlTmFtZSA9PSBtZS5SRU5EU1RHQVRFLkRFUFRIX1RFU1RcbiAgICAgICAgICAgIGlmIHN0YXRlVmFsdWVcbiAgICAgICAgICAgICAgICBtR0wuZW5hYmxlIG1HTC5ERVBUSF9URVNUXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgbUdMLmRpc2FibGUgbUdMLkRFUFRIX1RFU1RcbiAgICAgICAgZWxzZSBpZiBzdGF0ZU5hbWUgPT0gbWUuUkVORFNUR0FURS5BTFBIQV9UT19DT1ZFUkFHRVxuICAgICAgICAgICAgaWYgc3RhdGVWYWx1ZVxuICAgICAgICAgICAgICAgIG1HTC5lbmFibGUgbUdMLlNBTVBMRV9BTFBIQV9UT19DT1ZFUkFHRVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG1HTC5kaXNhYmxlIG1HTC5TQU1QTEVfQUxQSEFfVE9fQ09WRVJBR0VcbiAgICAgICAgcmV0dXJuXG5cbiAgICBtZS5TZXRNdWx0aXNhbXBsZSA9ICh2KSAtPlxuICAgICAgICBpZiB2ID09IHRydWVcbiAgICAgICAgICAgIG1HTC5lbmFibGUgbUdMLlNBTVBMRV9DT1ZFUkFHRVxuICAgICAgICAgICAgbUdMLnNhbXBsZUNvdmVyYWdlIDEuMCwgZmFsc2VcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbUdMLmRpc2FibGUgbUdMLlNBTVBMRV9DT1ZFUkFHRVxuICAgICAgICByZXR1cm5cblxuICAgIG1lLkNyZWF0ZVNoYWRlciA9ICh2c1NvdXJjZSwgZnNTb3VyY2UpIC0+XG4gICAgICAgIGB2YXIgaW5mb0xvZ2BcbiAgICAgICAgYHZhciBpbmZvTG9nYFxuICAgICAgICBpZiBtR0wgPT0gbnVsbFxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBtUHJvZ3JhbTogbnVsbFxuICAgICAgICAgICAgICAgIG1SZXN1bHQ6IGZhbHNlXG4gICAgICAgICAgICAgICAgbUluZm86ICdObyBXZWJHTCdcbiAgICAgICAgICAgICAgICBtSGVhZGVyTGluZXM6IDBcbiAgICAgICAgICAgIH1cbiAgICAgICAgdGUgPSBcbiAgICAgICAgICAgIG1Qcm9ncmFtOiBudWxsXG4gICAgICAgICAgICBtUmVzdWx0OiB0cnVlXG4gICAgICAgICAgICBtSW5mbzogJ1NoYWRlciBjb21waWxlZCBzdWNjZXNzZnVsbHknXG4gICAgICAgICAgICBtSGVhZGVyTGluZXM6IDBcbiAgICAgICAgICAgIG1FcnJvclR5cGU6IDBcbiAgICAgICAgdnMgPSBtR0wuY3JlYXRlU2hhZGVyKG1HTC5WRVJURVhfU0hBREVSKVxuICAgICAgICBmcyA9IG1HTC5jcmVhdGVTaGFkZXIobUdMLkZSQUdNRU5UX1NIQURFUilcbiAgICAgICAgbVNoYWRlckhlYWRlciA9ICcjdmVyc2lvbiAzMDAgZXNcXG4nICsgJyNpZmRlZiBHTF9FU1xcbicgKyAncHJlY2lzaW9uIGhpZ2hwIGZsb2F0O1xcbicgKyAncHJlY2lzaW9uIGhpZ2hwIGludDtcXG4nICsgJ3ByZWNpc2lvbiBtZWRpdW1wIHNhbXBsZXIzRDtcXG4nICsgJyNlbmRpZlxcbidcbiAgICAgICAgdnNTb3VyY2UgPSBtU2hhZGVySGVhZGVyICsgdnNTb3VyY2VcbiAgICAgICAgZnNTb3VyY2UgPSBtU2hhZGVySGVhZGVyICsgZnNTb3VyY2VcbiAgICAgICAgbUdMLnNoYWRlclNvdXJjZSB2cywgdnNTb3VyY2VcbiAgICAgICAgbUdMLnNoYWRlclNvdXJjZSBmcywgZnNTb3VyY2VcbiAgICAgICAgbUdMLmNvbXBpbGVTaGFkZXIgdnNcbiAgICAgICAgbUdMLmNvbXBpbGVTaGFkZXIgZnNcbiAgICAgICAgaWYgIW1HTC5nZXRTaGFkZXJQYXJhbWV0ZXIodnMsIG1HTC5DT01QSUxFX1NUQVRVUylcbiAgICAgICAgICAgIGluZm9Mb2cgPSBtR0wuZ2V0U2hhZGVySW5mb0xvZyh2cylcbiAgICAgICAgICAgIHRlLm1JbmZvID0gaW5mb0xvZ1xuICAgICAgICAgICAgdGUubUVycm9yVHlwZSA9IDBcbiAgICAgICAgICAgIHRlLm1SZXN1bHQgPSBmYWxzZVxuICAgICAgICAgICAgcmV0dXJuIHRlXG4gICAgICAgIGlmICFtR0wuZ2V0U2hhZGVyUGFyYW1ldGVyKGZzLCBtR0wuQ09NUElMRV9TVEFUVVMpXG4gICAgICAgICAgICBpbmZvTG9nID0gbUdMLmdldFNoYWRlckluZm9Mb2coZnMpXG4gICAgICAgICAgICB0ZS5tSW5mbyA9IGluZm9Mb2dcbiAgICAgICAgICAgIHRlLm1FcnJvclR5cGUgPSAxXG4gICAgICAgICAgICB0ZS5tUmVzdWx0ID0gZmFsc2VcbiAgICAgICAgICAgIHJldHVybiB0ZVxuICAgICAgICB0ZS5tUHJvZ3JhbSA9IG1HTC5jcmVhdGVQcm9ncmFtKClcbiAgICAgICAgbUdMLmF0dGFjaFNoYWRlciB0ZS5tUHJvZ3JhbSwgdnNcbiAgICAgICAgbUdMLmF0dGFjaFNoYWRlciB0ZS5tUHJvZ3JhbSwgZnNcbiAgICAgICAgbUdMLmxpbmtQcm9ncmFtIHRlLm1Qcm9ncmFtXG4gICAgICAgIGlmICFtR0wuZ2V0UHJvZ3JhbVBhcmFtZXRlcih0ZS5tUHJvZ3JhbSwgbUdMLkxJTktfU1RBVFVTKVxuICAgICAgICAgICAgaW5mb0xvZyA9IG1HTC5nZXRQcm9ncmFtSW5mb0xvZyh0ZS5tUHJvZ3JhbSlcbiAgICAgICAgICAgIG1HTC5kZWxldGVQcm9ncmFtIHRlLm1Qcm9ncmFtXG4gICAgICAgICAgICB0ZS5tSW5mbyA9IGluZm9Mb2dcbiAgICAgICAgICAgIHRlLm1FcnJvclR5cGUgPSAyXG4gICAgICAgICAgICB0ZS5tUmVzdWx0ID0gZmFsc2VcbiAgICAgICAgICAgIHJldHVybiB0ZVxuICAgICAgICB0ZVxuXG4gICAgbWUuQXR0YWNoU2hhZGVyID0gKHNoYWRlcikgLT5cbiAgICAgICAgaWYgc2hhZGVyID09IG51bGxcbiAgICAgICAgICAgIG1CaW5kZWRTaGFkZXIgPSBudWxsXG4gICAgICAgICAgICBtR0wudXNlUHJvZ3JhbSBudWxsXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1CaW5kZWRTaGFkZXIgPSBzaGFkZXJcbiAgICAgICAgICAgIG1HTC51c2VQcm9ncmFtIHNoYWRlci5tUHJvZ3JhbVxuICAgICAgICByZXR1cm5cblxuICAgIG1lLkRldGFjaFNoYWRlciA9IC0+XG4gICAgICAgIG1HTC51c2VQcm9ncmFtIG51bGxcbiAgICAgICAgcmV0dXJuXG5cbiAgICBtZS5EZXN0cm95U2hhZGVyID0gKHRleCkgLT5cbiAgICAgICAgbUdMLmRlbGV0ZVByb2dyYW0gdGV4Lm1Qcm9ncmFtXG4gICAgICAgIHJldHVyblxuXG4gICAgbWUuR2V0QXR0cmliTG9jYXRpb24gPSAoc2hhZGVyLCBuYW1lKSAtPlxuICAgICAgICBtR0wuZ2V0QXR0cmliTG9jYXRpb24gc2hhZGVyLm1Qcm9ncmFtLCBuYW1lXG5cbiAgICBtZS5TZXRTaGFkZXJDb25zdGFudExvY2F0aW9uID0gKHNoYWRlciwgbmFtZSkgLT5cbiAgICAgICAgbUdMLmdldFVuaWZvcm1Mb2NhdGlvbiBzaGFkZXIubVByb2dyYW0sIG5hbWVcblxuICAgIG1lLlNldFNoYWRlckNvbnN0YW50TWF0NEYgPSAodW5hbWUsIHBhcmFtcywgaXN0cmFuc3Bvc2UpIC0+XG4gICAgICAgIHByb2dyYW0gPSBtQmluZGVkU2hhZGVyXG4gICAgICAgIHBvcyA9IG1HTC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbS5tUHJvZ3JhbSwgdW5hbWUpXG4gICAgICAgIGlmIHBvcyA9PSBudWxsXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgaWYgaXN0cmFuc3Bvc2UgPT0gZmFsc2VcbiAgICAgICAgICAgIHRtcCA9IG5ldyBGbG9hdDMyQXJyYXkoW1xuICAgICAgICAgICAgICAgIHBhcmFtc1swXVxuICAgICAgICAgICAgICAgIHBhcmFtc1s0XVxuICAgICAgICAgICAgICAgIHBhcmFtc1s4XVxuICAgICAgICAgICAgICAgIHBhcmFtc1sxMl1cbiAgICAgICAgICAgICAgICBwYXJhbXNbMV1cbiAgICAgICAgICAgICAgICBwYXJhbXNbNV1cbiAgICAgICAgICAgICAgICBwYXJhbXNbOV1cbiAgICAgICAgICAgICAgICBwYXJhbXNbMTNdXG4gICAgICAgICAgICAgICAgcGFyYW1zWzJdXG4gICAgICAgICAgICAgICAgcGFyYW1zWzZdXG4gICAgICAgICAgICAgICAgcGFyYW1zWzEwXVxuICAgICAgICAgICAgICAgIHBhcmFtc1sxNF1cbiAgICAgICAgICAgICAgICBwYXJhbXNbM11cbiAgICAgICAgICAgICAgICBwYXJhbXNbN11cbiAgICAgICAgICAgICAgICBwYXJhbXNbMTFdXG4gICAgICAgICAgICAgICAgcGFyYW1zWzE1XVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIG1HTC51bmlmb3JtTWF0cml4NGZ2IHBvcywgZmFsc2UsIHRtcFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBtR0wudW5pZm9ybU1hdHJpeDRmdiBwb3MsIGZhbHNlLCBuZXcgRmxvYXQzMkFycmF5KHBhcmFtcylcbiAgICAgICAgdHJ1ZVxuXG4gICAgbWUuU2V0U2hhZGVyQ29uc3RhbnQxRl9Qb3MgPSAocG9zLCB4KSAtPlxuICAgICAgICBtR0wudW5pZm9ybTFmIHBvcywgeFxuICAgICAgICB0cnVlXG5cbiAgICBtZS5TZXRTaGFkZXJDb25zdGFudDFGVl9Qb3MgPSAocG9zLCB4KSAtPlxuICAgICAgICBtR0wudW5pZm9ybTFmdiBwb3MsIHhcbiAgICAgICAgdHJ1ZVxuXG4gICAgbWUuU2V0U2hhZGVyQ29uc3RhbnQxRiA9ICh1bmFtZSwgeCkgLT5cbiAgICAgICAgcG9zID0gbUdMLmdldFVuaWZvcm1Mb2NhdGlvbihtQmluZGVkU2hhZGVyLm1Qcm9ncmFtLCB1bmFtZSlcbiAgICAgICAgaWYgcG9zID09IG51bGxcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICBtR0wudW5pZm9ybTFmIHBvcywgeFxuICAgICAgICB0cnVlXG5cbiAgICBtZS5TZXRTaGFkZXJDb25zdGFudDFJID0gKHVuYW1lLCB4KSAtPlxuICAgICAgICBwb3MgPSBtR0wuZ2V0VW5pZm9ybUxvY2F0aW9uKG1CaW5kZWRTaGFkZXIubVByb2dyYW0sIHVuYW1lKVxuICAgICAgICBpZiBwb3MgPT0gbnVsbFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIG1HTC51bmlmb3JtMWkgcG9zLCB4XG4gICAgICAgIHRydWVcblxuICAgIG1lLlNldFNoYWRlckNvbnN0YW50MkYgPSAodW5hbWUsIHgpIC0+XG4gICAgICAgIHBvcyA9IG1HTC5nZXRVbmlmb3JtTG9jYXRpb24obUJpbmRlZFNoYWRlci5tUHJvZ3JhbSwgdW5hbWUpXG4gICAgICAgIGlmIHBvcyA9PSBudWxsXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgbUdMLnVuaWZvcm0yZnYgcG9zLCB4XG4gICAgICAgIHRydWVcblxuICAgIG1lLlNldFNoYWRlckNvbnN0YW50M0YgPSAodW5hbWUsIHgsIHksIHopIC0+XG4gICAgICAgIHBvcyA9IG1HTC5nZXRVbmlmb3JtTG9jYXRpb24obUJpbmRlZFNoYWRlci5tUHJvZ3JhbSwgdW5hbWUpXG4gICAgICAgIGlmIHBvcyA9PSBudWxsXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgbUdMLnVuaWZvcm0zZiBwb3MsIHgsIHksIHpcbiAgICAgICAgdHJ1ZVxuXG4gICAgbWUuU2V0U2hhZGVyQ29uc3RhbnQxRlYgPSAodW5hbWUsIHgpIC0+XG4gICAgICAgIHBvcyA9IG1HTC5nZXRVbmlmb3JtTG9jYXRpb24obUJpbmRlZFNoYWRlci5tUHJvZ3JhbSwgdW5hbWUpXG4gICAgICAgIGlmIHBvcyA9PSBudWxsXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgbUdMLnVuaWZvcm0xZnYgcG9zLCBuZXcgRmxvYXQzMkFycmF5KHgpXG4gICAgICAgIHRydWVcblxuICAgIG1lLlNldFNoYWRlckNvbnN0YW50M0ZWID0gKHVuYW1lLCB4KSAtPlxuICAgICAgICBwb3MgPSBtR0wuZ2V0VW5pZm9ybUxvY2F0aW9uKG1CaW5kZWRTaGFkZXIubVByb2dyYW0sIHVuYW1lKVxuICAgICAgICBpZiBwb3MgPT0gbnVsbFxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIG1HTC51bmlmb3JtM2Z2IHBvcywgbmV3IEZsb2F0MzJBcnJheSh4KVxuICAgICAgICB0cnVlXG5cbiAgICBtZS5TZXRTaGFkZXJDb25zdGFudDRGViA9ICh1bmFtZSwgeCkgLT5cbiAgICAgICAgcG9zID0gbUdMLmdldFVuaWZvcm1Mb2NhdGlvbihtQmluZGVkU2hhZGVyLm1Qcm9ncmFtLCB1bmFtZSlcbiAgICAgICAgaWYgcG9zID09IG51bGxcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICBtR0wudW5pZm9ybTRmdiBwb3MsIG5ldyBGbG9hdDMyQXJyYXkoeClcbiAgICAgICAgdHJ1ZVxuXG4gICAgbWUuU2V0U2hhZGVyVGV4dHVyZVVuaXQgPSAodW5hbWUsIHVuaXQpIC0+XG4gICAgICAgIHByb2dyYW0gPSBtQmluZGVkU2hhZGVyXG4gICAgICAgIHBvcyA9IG1HTC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbS5tUHJvZ3JhbSwgdW5hbWUpXG4gICAgICAgIGlmIHBvcyA9PSBudWxsXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgbUdMLnVuaWZvcm0xaSBwb3MsIHVuaXRcbiAgICAgICAgdHJ1ZVxuXG4gICAgbWUuQ3JlYXRlVmVydGV4QXJyYXkgPSAoZGF0YSwgbW9kZSkgLT5cbiAgICAgICAgaWQgPSBtR0wuY3JlYXRlQnVmZmVyKClcbiAgICAgICAgbUdMLmJpbmRCdWZmZXIgbUdMLkFSUkFZX0JVRkZFUiwgaWRcbiAgICAgICAgaWYgbW9kZSA9PSBtZS5CVUZUWVBFLlNUQVRJQ1xuICAgICAgICAgICAgbUdMLmJ1ZmZlckRhdGEgbUdMLkFSUkFZX0JVRkZFUiwgZGF0YSwgbUdMLlNUQVRJQ19EUkFXXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1HTC5idWZmZXJEYXRhIG1HTC5BUlJBWV9CVUZGRVIsIGRhdGEsIG1HTC5EWU5BTUlDX0RSQVdcbiAgICAgICAgeyBtT2JqZWN0OiBpZCB9XG5cbiAgICBtZS5DcmVhdGVJbmRleEFycmF5ID0gKGRhdGEsIG1vZGUpIC0+XG4gICAgICAgIGlkID0gbUdMLmNyZWF0ZUJ1ZmZlcigpXG4gICAgICAgIG1HTC5iaW5kQnVmZmVyIG1HTC5FTEVNRU5UX0FSUkFZX0JVRkZFUiwgaWRcbiAgICAgICAgaWYgbW9kZSA9PSBtZS5CVUZUWVBFLlNUQVRJQ1xuICAgICAgICAgICAgbUdMLmJ1ZmZlckRhdGEgbUdMLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBkYXRhLCBtR0wuU1RBVElDX0RSQVdcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgbUdMLmJ1ZmZlckRhdGEgbUdMLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBkYXRhLCBtR0wuRFlOQU1JQ19EUkFXXG4gICAgICAgIHsgbU9iamVjdDogaWQgfVxuXG4gICAgbWUuRGVzdHJveUFycmF5ID0gKHRleCkgLT5cbiAgICAgICAgbUdMLmRlc3Ryb3lCdWZmZXIgdGV4Lm1PYmplY3RcbiAgICAgICAgcmV0dXJuXG5cbiAgICBtZS5BdHRhY2hWZXJ0ZXhBcnJheSA9ICh0ZXgsIGF0dHJpYnMsIHBvcykgLT5cbiAgICAgICAgc2hhZGVyID0gbUJpbmRlZFNoYWRlclxuICAgICAgICBtR0wuYmluZEJ1ZmZlciBtR0wuQVJSQVlfQlVGRkVSLCB0ZXgubU9iamVjdFxuICAgICAgICBudW0gPSBhdHRyaWJzLm1DaGFubmVscy5sZW5ndGhcbiAgICAgICAgc3RyaWRlID0gYXR0cmlicy5tU3RyaWRlXG4gICAgICAgIG9mZnNldCA9IDBcbiAgICAgICAgaSA9IDBcbiAgICAgICAgd2hpbGUgaSA8IG51bVxuICAgICAgICAgICAgaWQgPSBwb3NbaV1cbiAgICAgICAgICAgIG1HTC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSBpZFxuICAgICAgICAgICAgZHR5cGUgPSBtR0wuRkxPQVRcbiAgICAgICAgICAgIGRzaXplID0gNFxuICAgICAgICAgICAgaWYgYXR0cmlicy5tQ2hhbm5lbHNbaV0ubVR5cGUgPT0gbWUuVFlQRS5VSU5UOFxuICAgICAgICAgICAgICAgIGR0eXBlID0gbUdMLlVOU0lHTkVEX0JZVEVcbiAgICAgICAgICAgICAgICBkc2l6ZSA9IDFcbiAgICAgICAgICAgIGVsc2UgaWYgYXR0cmlicy5tQ2hhbm5lbHNbaV0ubVR5cGUgPT0gbWUuVFlQRS5VSU5UMTZcbiAgICAgICAgICAgICAgICBkdHlwZSA9IG1HTC5VTlNJR05FRF9TSE9SVFxuICAgICAgICAgICAgICAgIGRzaXplID0gMlxuICAgICAgICAgICAgZWxzZSBpZiBhdHRyaWJzLm1DaGFubmVsc1tpXS5tVHlwZSA9PSBtZS5UWVBFLkZMT0FUMzJcbiAgICAgICAgICAgICAgICBkdHlwZSA9IG1HTC5GTE9BVFxuICAgICAgICAgICAgICAgIGRzaXplID0gNFxuICAgICAgICAgICAgbUdMLnZlcnRleEF0dHJpYlBvaW50ZXIgaWQsIGF0dHJpYnMubUNoYW5uZWxzW2ldLm1OdW1Db21wb25lbnRzLCBkdHlwZSwgYXR0cmlicy5tQ2hhbm5lbHNbaV0ubU5vcm1hbGl6ZSwgc3RyaWRlLCBvZmZzZXRcbiAgICAgICAgICAgIG9mZnNldCArPSBhdHRyaWJzLm1DaGFubmVsc1tpXS5tTnVtQ29tcG9uZW50cyAqIGRzaXplXG4gICAgICAgICAgICBpKytcbiAgICAgICAgcmV0dXJuXG5cbiAgICBtZS5BdHRhY2hJbmRleEFycmF5ID0gKHRleCkgLT5cbiAgICAgICAgbUdMLmJpbmRCdWZmZXIgbUdMLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCB0ZXgubU9iamVjdFxuICAgICAgICByZXR1cm5cblxuICAgIG1lLkRldGFjaFZlcnRleEFycmF5ID0gKHRleCwgYXR0cmlicykgLT5cbiAgICAgICAgbnVtID0gYXR0cmlicy5tQ2hhbm5lbHMubGVuZ3RoXG4gICAgICAgIGkgPSAwXG4gICAgICAgIHdoaWxlIGkgPCBudW1cbiAgICAgICAgICAgIG1HTC5kaXNhYmxlVmVydGV4QXR0cmliQXJyYXkgaVxuICAgICAgICAgICAgaSsrXG4gICAgICAgIG1HTC5iaW5kQnVmZmVyIG1HTC5BUlJBWV9CVUZGRVIsIG51bGxcbiAgICAgICAgcmV0dXJuXG5cbiAgICBtZS5EZXRhY2hJbmRleEFycmF5ID0gKHRleCkgLT5cbiAgICAgICAgbUdMLmJpbmRCdWZmZXIgbUdMLkVMRU1FTlRfQVJSQVlfQlVGRkVSLCBudWxsXG4gICAgICAgIHJldHVyblxuXG4gICAgbWUuRHJhd1ByaW1pdGl2ZSA9ICh0eXBlT2ZQcmltaXRpdmUsIG51bSwgdXNlSW5kZXhBcnJheSwgbnVtSW5zdGFuY2VzKSAtPlxuICAgICAgICBnbFR5cGUgPSBtR0wuUE9JTlRTXG4gICAgICAgIGlmIHR5cGVPZlByaW1pdGl2ZSA9PSBtZS5QUklNVFlQRS5QT0lOVFNcbiAgICAgICAgICAgIGdsVHlwZSA9IG1HTC5QT0lOVFNcbiAgICAgICAgaWYgdHlwZU9mUHJpbWl0aXZlID09IG1lLlBSSU1UWVBFLkxJTkVTXG4gICAgICAgICAgICBnbFR5cGUgPSBtR0wuTElORVNcbiAgICAgICAgaWYgdHlwZU9mUHJpbWl0aXZlID09IG1lLlBSSU1UWVBFLkxJTkVfTE9PUFxuICAgICAgICAgICAgZ2xUeXBlID0gbUdMLkxJTkVfTE9PUFxuICAgICAgICBpZiB0eXBlT2ZQcmltaXRpdmUgPT0gbWUuUFJJTVRZUEUuTElORV9TVFJJUFxuICAgICAgICAgICAgZ2xUeXBlID0gbUdMLkxJTkVfU1RSSVBcbiAgICAgICAgaWYgdHlwZU9mUHJpbWl0aXZlID09IG1lLlBSSU1UWVBFLlRSSUFOR0xFU1xuICAgICAgICAgICAgZ2xUeXBlID0gbUdMLlRSSUFOR0xFU1xuICAgICAgICBpZiB0eXBlT2ZQcmltaXRpdmUgPT0gbWUuUFJJTVRZUEUuVFJJQU5HTEVfU1RSSVBcbiAgICAgICAgICAgIGdsVHlwZSA9IG1HTC5UUklBTkdMRV9TVFJJUFxuICAgICAgICBpZiBudW1JbnN0YW5jZXMgPD0gMVxuICAgICAgICAgICAgaWYgdXNlSW5kZXhBcnJheVxuICAgICAgICAgICAgICAgIG1HTC5kcmF3RWxlbWVudHMgZ2xUeXBlLCBudW0sIG1HTC5VTlNJR05FRF9TSE9SVCwgMFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIG1HTC5kcmF3QXJyYXlzIGdsVHlwZSwgMCwgbnVtXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1HTC5kcmF3QXJyYXlzSW5zdGFuY2VkIGdsVHlwZSwgMCwgbnVtLCBudW1JbnN0YW5jZXNcbiAgICAgICAgICAgIG1HTC5kcmF3RWxlbWVudHNJbnN0YW5jZWQgZ2xUeXBlLCBudW0sIG1HTC5VTlNJR05FRF9TSE9SVCwgMCwgbnVtSW5zdGFuY2VzXG4gICAgICAgIHJldHVyblxuXG4gICAgbWUuRHJhd0Z1bGxTY3JlZW5UcmlhbmdsZV9YWSA9ICh2cG9zKSAtPlxuICAgICAgICBtR0wuYmluZEJ1ZmZlciBtR0wuQVJSQVlfQlVGRkVSLCBtVkJPX1RyaVxuICAgICAgICBtR0wudmVydGV4QXR0cmliUG9pbnRlciB2cG9zLCAyLCBtR0wuRkxPQVQsIGZhbHNlLCAwLCAwXG4gICAgICAgIG1HTC5lbmFibGVWZXJ0ZXhBdHRyaWJBcnJheSB2cG9zXG4gICAgICAgIG1HTC5kcmF3QXJyYXlzIG1HTC5UUklBTkdMRVMsIDAsIDNcbiAgICAgICAgbUdMLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheSB2cG9zXG4gICAgICAgIG1HTC5iaW5kQnVmZmVyIG1HTC5BUlJBWV9CVUZGRVIsIG51bGxcbiAgICAgICAgcmV0dXJuXG5cbiAgICBtZS5EcmF3VW5pdFF1YWRfWFkgPSAodnBvcykgLT5cbiAgICAgICAgbUdMLmJpbmRCdWZmZXIgbUdMLkFSUkFZX0JVRkZFUiwgbVZCT19RdWFkXG4gICAgICAgIG1HTC52ZXJ0ZXhBdHRyaWJQb2ludGVyIHZwb3MsIDIsIG1HTC5GTE9BVCwgZmFsc2UsIDAsIDBcbiAgICAgICAgbUdMLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5IHZwb3NcbiAgICAgICAgbUdMLmRyYXdBcnJheXMgbUdMLlRSSUFOR0xFUywgMCwgNlxuICAgICAgICBtR0wuZGlzYWJsZVZlcnRleEF0dHJpYkFycmF5IHZwb3NcbiAgICAgICAgbUdMLmJpbmRCdWZmZXIgbUdMLkFSUkFZX0JVRkZFUiwgbnVsbFxuICAgICAgICByZXR1cm5cblxuICAgIG1lLlNldEJsZW5kID0gKGVuYWJsZWQpIC0+XG4gICAgICAgIGlmIGVuYWJsZWRcbiAgICAgICAgICAgIG1HTC5lbmFibGUgbUdMLkJMRU5EXG4gICAgICAgICAgICBtR0wuYmxlbmRFcXVhdGlvblNlcGFyYXRlIG1HTC5GVU5DX0FERCwgbUdMLkZVTkNfQUREXG4gICAgICAgICAgICBtR0wuYmxlbmRGdW5jU2VwYXJhdGUgbUdMLlNSQ19BTFBIQSwgbUdMLk9ORV9NSU5VU19TUkNfQUxQSEEsIG1HTC5PTkUsIG1HTC5PTkVfTUlOVVNfU1JDX0FMUEhBXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIG1HTC5kaXNhYmxlIG1HTC5CTEVORFxuICAgICAgICByZXR1cm5cblxuICAgIG1lLkdldFBpeGVsRGF0YSA9IChkYXRhLCBvZmZzZXQsIHhyZXMsIHlyZXMpIC0+XG4gICAgICAgIG1HTC5yZWFkUGl4ZWxzIDAsIDAsIHhyZXMsIHlyZXMsIG1HTC5SR0JBLCBtR0wuVU5TSUdORURfQllURSwgZGF0YSwgb2Zmc2V0XG4gICAgICAgIHJldHVyblxuXG4gICAgbWUuR2V0UGl4ZWxEYXRhUmVuZGVyVGFyZ2V0ID0gKG9iaiwgZGF0YSwgeHJlcywgeXJlcykgLT5cbiAgICAgICAgbUdMLmJpbmRGcmFtZWJ1ZmZlciBtR0wuRlJBTUVCVUZGRVIsIG9iai5tT2JqZWN0SURcbiAgICAgICAgbUdMLnJlYWRCdWZmZXIgbUdMLkNPTE9SX0FUVEFDSE1FTlQwXG4gICAgICAgIG1HTC5yZWFkUGl4ZWxzIDAsIDAsIHhyZXMsIHlyZXMsIG1HTC5SR0JBLCBtR0wuRkxPQVQsIGRhdGEsIDBcbiAgICAgICAgbUdMLmJpbmRGcmFtZWJ1ZmZlciBtR0wuRlJBTUVCVUZGRVIsIG51bGxcbiAgICAgICAgcmV0dXJuXG5cbiAgICBtZVxuXG5waUNyZWF0ZUdsQ29udGV4dCA9IChjdikgLT5cbiAgICBvcHRzID0gXG4gICAgICAgIGFscGhhOiBmYWxzZVxuICAgICAgICBkZXB0aDogZmFsc2VcbiAgICAgICAgc3RlbmNpbDogZmFsc2VcbiAgICAgICAgcHJlbXVsdGlwbGllZEFscGhhOiBmYWxzZVxuICAgICAgICBhbnRpYWxpYXM6IGZhbHNlXG4gICAgICAgIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjogZmFsc2VcbiAgICAgICAgcG93ZXJQcmVmZXJlbmNlOiAnaGlnaC1wZXJmb3JtYW5jZSdcbiAgICAjIFwibG93X3Bvd2VyXCIsIFwiaGlnaF9wZXJmb3JtYW5jZVwiLCBcImRlZmF1bHRcIlxuICAgIGN2LmdldENvbnRleHQgJ3dlYmdsMicsIG9wdHNcbiJdfQ==
//# sourceURL=../coffee/renderer.coffee