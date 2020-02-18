function bufferID_to_assetID( id )
{
    if( id==0 ) return '4dXGR8';
    if( id==1 ) return 'XsXGR8';
    if( id==2 ) return '4sXGR8';
    if( id==3 ) return 'XdfGR8';
    return 'none';
}
function assetID_to_bufferID( id )
{
    if( id=='4dXGR8' ) return 0;
    if( id=='XsXGR8' ) return 1;
    if( id=='4sXGR8' ) return 2;
    if( id=='XdfGR8' ) return 3;
    return -1;
}

function assetID_to_cubemapBuferID( id )
{
    if( id=='4dX3Rr' ) return 0;
    return -1;
}
function cubamepBufferID_to_assetID( id )
{
    if( id==0 ) return '4dX3Rr';
    return 'none';
}

function Pass(renderer, isLowEnd, forceMuted, forcePaused, outputGainNode, copyProgram, id, effect)
{
    this.mID = id;
    this.mInputs = [null, null, null, null ];
    this.mOutputs = [null, null, null, null ];
    this.mSource = null;
    this.mGainNode = outputGainNode;
    this.mEffect = effect;
    this.mRenderer = renderer;
    this.mProgramCopy = copyProgram; 
    this.mCompilationTime = 0;

    this.mType = "image";
    this.mName = "none";
    this.mFrame = 0;

    this.mIsLowEnd = isLowEnd;
}

Pass.prototype.MakeHeader_Image = function()
{
    var header = "";

    header += "#define HW_PERFORMANCE " + ((this.mIsLowEnd==true)?"0":"1") + "\n";

    header += "uniform vec3      iResolution;\n" +
              "uniform float     iTime;\n" +
              "uniform float     iChannelTime[4];\n" +
              "uniform vec4      iMouse;\n" +
              "uniform vec4      iDate;\n" +
              "uniform float     iSampleRate;\n" +
              "uniform vec3      iChannelResolution[4];\n" +
              "uniform int       iFrame;\n" +
              "uniform float     iTimeDelta;\n" +
              "uniform float     iFrameRate;\n";

    header += "struct Channel\n";
    header += "{\n";
    header += "    vec3  resolution;\n";
    header += "    float time;\n";
    header += "};\n";
    header += "uniform Channel iChannel[4];\n";

    for( let i=0; i<this.mInputs.length; i++ )
    {
        let inp = this.mInputs[i];

             if( inp==null )                  header += "uniform sampler2D iChannel" + i + ";\n";
        else if( inp.mInfo.mType=="cubemap" ) header += "uniform samplerCube iChannel" + i + ";\n";
        else                                  header += "uniform sampler2D iChannel" + i + ";\n";
    }

    header += "void mainImage( out vec4 c,  in vec2 f );\n"

    this.mImagePassFooter = "";
    this.mImagePassFooter += "\nout vec4 outColor;\n";
    this.mImagePassFooter += "\nvoid main( void )" +
    "{" +
        "vec4 color = vec4(0.0,0.0,0.0,1.0);" +
        "mainImage( color, gl_FragCoord.xy );" +
        "color.w = 1.0;";

    this.mImagePassFooter +=  "outColor = color;}";

    this.mHeader = header;
}

Pass.prototype.MakeHeader_Buffer = function()
{
    var header = "";
    
    header += "#define HW_PERFORMANCE " + ((this.mIsLowEnd==true)?"0":"1") + "\n";

    header += "uniform vec3      iResolution;\n" +
              "uniform float     iTime;\n" +
              "uniform float     iChannelTime[4];\n" +
              "uniform vec4      iMouse;\n" +
              "uniform vec4      iDate;\n" +
              "uniform float     iSampleRate;\n" +
              "uniform vec3      iChannelResolution[4];\n" +
              "uniform int       iFrame;\n" +
              "uniform float     iTimeDelta;\n" +
              "uniform float     iFrameRate;\n";

    for (var i = 0; i < this.mInputs.length; i++)
    {
        var inp = this.mInputs[i];
             if( inp==null )                  header += "uniform sampler2D iChannel" + i + ";\n";
        else if( inp.mInfo.mType=="cubemap" ) header += "uniform samplerCube iChannel" + i + ";\n";
        else                                  header += "uniform sampler2D iChannel" + i + ";\n";
    }

    header += "void mainImage( out vec4 c,  in vec2 f );\n"

    this.mImagePassFooter = "";
    this.mImagePassFooter += "\nout vec4 outColor;\n";
    this.mImagePassFooter += "\nvoid main( void )\n" +
    "{" +
        "vec4 color = vec4(0.0,0.0,0.0,1.0);" +
        "mainImage( color, gl_FragCoord.xy );";
    this.mImagePassFooter +="outColor = color; }";

    this.mHeader = header;
}

Pass.prototype.MakeHeader_Cubemap = function()
{
    var header = "";
    
    header += "#define HW_PERFORMANCE " + ((this.mIsLowEnd==true)?"0":"1") + "\n";

    header += "uniform vec3      iResolution;\n" +
              "uniform float     iTime;\n" +
              "uniform float     iChannelTime[4];\n" +
              "uniform vec4      iMouse;\n" +
              "uniform vec4      iDate;\n" +
              "uniform float     iSampleRate;\n" +
              "uniform vec3      iChannelResolution[4];\n" +
              "uniform int       iFrame;\n" +
              "uniform float     iTimeDelta;\n" +
              "uniform float     iFrameRate;\n";

    for (var i = 0; i < this.mInputs.length; i++)
    {
        var inp = this.mInputs[i];
             if( inp==null )                  header += "uniform sampler2D iChannel" + i + ";\n";
        else if( inp.mInfo.mType=="cubemap" ) header += "uniform samplerCube iChannel" + i + ";\n";
        else                                  header += "uniform sampler2D iChannel" + i + ";\n";
    }

    header += "void mainCubemap( out vec4 c, in vec2 f, in vec3 ro, in vec3 rd );\n"

    this.mImagePassFooter = "\n" +
    "uniform vec4 unViewport;\n" +
    "uniform vec3 unCorners[5];\n";

    this.mImagePassFooter += "\nout vec4 outColor;\n";
    this.mImagePassFooter += "\nvoid main( void )\n" +
    "{" +
        "vec4 color = vec4(0.0,0.0,0.0,1.0);" +

        "vec3 ro = unCorners[4];" +
        "vec2 uv = (gl_FragCoord.xy - unViewport.xy)/unViewport.zw;" + 
        "vec3 rd = normalize( mix( mix( unCorners[0], unCorners[1], uv.x )," +
                                  "mix( unCorners[3], unCorners[2], uv.x ), uv.y ) - ro);" + 

        "mainCubemap( color, gl_FragCoord.xy-unViewport.xy, ro, rd );";
    this.mImagePassFooter +="outColor = color; }";

    this.mHeader = header;
}

Pass.prototype.MakeHeader_Common = function ()
{
    var header = "";
    var headerlength = 0;

    header += "uniform vec4      iDate;\n" +
              "uniform float     iSampleRate;\n";
    headerlength += 2;


    this.mImagePassFooter = "";
    this.mImagePassFooter += "\nout vec4 outColor;\n";
    this.mImagePassFooter += "\nvoid main( void )\n" +
    "{";
    this.mImagePassFooter += "outColor = vec4(0.0); }";

    this.mHeader = header;
}

Pass.prototype.MakeHeader = function()
{
         if( this.mType=="image" ) this.MakeHeader_Image();
    else if( this.mType=="buffer") this.MakeHeader_Buffer();
    else if( this.mType=="common") this.MakeHeader_Common();
    else if( this.mType=="cubemap") this.MakeHeader_Cubemap();
    else alert("ERROR");
}

Pass.prototype.Create_Image = function( wa )
{
    this.MakeHeader();
    this.mSampleRate = 44100;
    this.mProgram = null;
}
Pass.prototype.Destroy_Image = function( wa )
{
}

Pass.prototype.Create_Buffer = function( wa )
{
    this.MakeHeader();
    this.mSampleRate = 44100;
    this.mProgram = null;
}

Pass.prototype.Destroy_Buffer = function( wa )
{
}

Pass.prototype.Create_Cubemap = function( wa )
{
    this.MakeHeader();
    this.mSampleRate = 44100;
    this.mProgram = null;
}

Pass.prototype.Destroy_Cubemap = function( wa )
{
}

Pass.prototype.Create_Common = function( wa )
{
    this.MakeHeader();
}

Pass.prototype.Destroy_Common = function( wa )
{
}

Pass.prototype.Create = function( passType, passName, wa )
{
    this.mType = passType;
    this.mName = passName;
    this.mSource = null;

         if( passType=="image" ) this.Create_Image( wa );
    else if( passType=="buffer") this.Create_Buffer( wa );
    else if( passType=="common") this.Create_Common( wa );
    else if( passType=="cubemap") this.Create_Cubemap( wa );
    else alert("ERROR");
}

Pass.prototype.Destroy = function( wa )
{
    this.mSource = null;
         if( this.mType=="image" ) this.Destroy_Image( wa );
    else if( this.mType=="buffer") this.Destroy_Buffer( wa );
    else if( this.mType=="common") this.Destroy_Common( wa );
    else if( this.mType=="cubemap") this.Destroy_Cubemap( wa );
    else alert("ERROR");
}

Pass.prototype.NewShader_Image = function( shaderCode, commonShaderCodes )
{
    var vsSource;
    vsSource = "layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";

    var fsSource = this.mHeader;
    for (var i = 0; i < commonShaderCodes.length; i++)
    {
        fsSource += commonShaderCodes[i]+'\n';
    }

    fsSource += shaderCode;
    fsSource += this.mImagePassFooter;

    var res = this.mRenderer.CreateShader(vsSource, fsSource);

    if (res.mResult == false)
        return res.mInfo;

    if( this.mProgram != null )
        this.mRenderer.DestroyShader( this.mProgram );

    this.mProgram = res;

    return null;
}

Pass.prototype.NewShader_Cubemap = function( shaderCode, commonShaderCodes )
{
    var vsSource;
    vsSource = "layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";

    var fsSource = this.mHeader;
    for (var i = 0; i < commonShaderCodes.length; i++)
    {
        fsSource += commonShaderCodes[i]+'\n';
    }

    fsSource += shaderCode;
    fsSource += this.mImagePassFooter;

    var res = this.mRenderer.CreateShader(vsSource, fsSource);

    if (res.mResult == false)
        return res.mInfo;

    if( this.mProgram != null )
        this.mRenderer.DestroyShader( this.mProgram );

    this.mProgram = res;

    return null;
}

Pass.prototype.NewShader_Common = function (shaderCode)
{
    var vsSource;
    vsSource = "layout(location = 0) in vec2 pos; void main() { gl_Position = vec4(pos.xy,0.0,1.0); }";

    var fsSource = this.mHeader + shaderCode + this.mImagePassFooter;
    var res = this.mRenderer.CreateShader(vsSource, fsSource);

    if (res.mResult == false)
        return res.mInfo;

    if (this.mProgram != null)
        this.mRenderer.DestroyShader(this.mProgram);

    this.mProgram = res;

    return null;
}

Pass.prototype.NewShader = function (shaderCode, commonSourceCodes)
{
    if( this.mRenderer==null ) return null;
    
    let timeStart = performance.now();

    var res = null;

         if( this.mType=="image" )  res = this.NewShader_Image( shaderCode, commonSourceCodes );
    else if( this.mType=="buffer")  res = this.NewShader_Image( shaderCode, commonSourceCodes );
    else if( this.mType=="common")  res = this.NewShader_Common( shaderCode );
    else if( this.mType=="cubemap") res = this.NewShader_Cubemap( shaderCode, commonSourceCodes );
    else alert("ERROR");

    let compilationTime = performance.now() - timeStart;

    if( res==null )
    {
        this.mCompilationTime = compilationTime;
    }

    this.mSource = shaderCode;
    return res;
}

Pass.prototype.DestroyInput = function( id )
{
    if( this.mInputs[id]==null ) return;

    if( this.mInputs[id].mInfo.mType=="texture" )
    {
        if( this.mInputs[id].globject != null )
            this.mRenderer.DestroyTexture(this.mInputs[id].globject);
    }
    else if( this.mInputs[id].mInfo.mType=="cubemap" )
    {
        if( this.mInputs[id].globject != null )
            this.mRenderer.DestroyTexture(this.mInputs[id].globject);
    }
    else if( this.mInputs[id].mInfo.mType=="keyboard" )
    {
    }

    this.mInputs[id] = null;
}

Pass.prototype.Sampler2Renderer = function (sampler)
{
    var filter = this.mRenderer.FILTER.NONE;
    if (sampler.filter === "linear") filter = this.mRenderer.FILTER.LINEAR;
    if (sampler.filter === "mipmap") filter = this.mRenderer.FILTER.MIPMAP;
    var wrap = this.mRenderer.TEXWRP.REPEAT;
    if (sampler.wrap === "clamp") wrap = this.mRenderer.TEXWRP.CLAMP;
    var vflip = false;
    if (sampler.vflip === "true") vflip = true;

    return { mFilter: filter, mWrap: wrap, mVFlip: vflip };
}

Pass.prototype.GetSamplerVFlip = function (id)
{
    var inp = this.mInputs[id];

    return inp.mInfo.mSampler.vflip;
}

Pass.prototype.SetSamplerVFlip = function (id, str) 
{
    var me = this;
    var renderer = this.mRenderer;
    var inp = this.mInputs[id];

    var filter = false;
    if (str === "true") filter = true;

    if (inp == null)
    {
    }
    else if (inp.mInfo.mType == "texture")
    {
        if (inp.loaded)
        {
            renderer.SetSamplerVFlip(inp.globject, filter, inp.image);
            inp.mInfo.mSampler.vflip = str;
        }
    }
    else if (inp.mInfo.mType == "cubemap")
    {
        if (inp.loaded) 
        {
            renderer.SetSamplerVFlip(inp.globject, filter, inp.image);
            inp.mInfo.mSampler.vflip = str;
        }
    }
}

Pass.prototype.GetAcceptsVFlip = function (id)
{
    var inp = this.mInputs[id];

    if (inp == null) return false;
    if (inp.mInfo.mType == "texture")  return true;
    if (inp.mInfo.mType == "cubemap")  return true;
    if (inp.mInfo.mType == "keyboard") return false;
    if (inp.mInfo.mType == "buffer")   return false;
    return true;
}

Pass.prototype.GetSamplerFilter = function (id)
{
    var inp = this.mInputs[id];
    if( inp==null) return;
    return inp.mInfo.mSampler.filter;
}

Pass.prototype.SetSamplerFilter = function (id, str, buffers, cubeBuffers) 
{
    var me = this;
    var renderer = this.mRenderer;
    var inp = this.mInputs[id];

    var filter = renderer.FILTER.NONE;
    if (str == "linear") filter = renderer.FILTER.LINEAR;
    if (str == "mipmap") filter = renderer.FILTER.MIPMAP;

    if (inp == null)
    {
    }
    else if (inp.mInfo.mType == "texture")
    {
        if (inp.loaded)
        {
            renderer.SetSamplerFilter(inp.globject, filter, true);
            inp.mInfo.mSampler.filter = str;
        }
    }
    else if (inp.mInfo.mType == "cubemap")
    {
        if (inp.loaded) 
        {
            if( assetID_to_cubemapBuferID(inp.mInfo.mID)==0)
            {
                renderer.SetSamplerFilter(cubeBuffers[id].mTexture[0], filter, true);
                renderer.SetSamplerFilter(cubeBuffers[id].mTexture[1], filter, true);
                inp.mInfo.mSampler.filter = str;
            }
            else
            {
                renderer.SetSamplerFilter(inp.globject, filter, true);
                inp.mInfo.mSampler.filter = str;
            }
        }
    }
    else if (inp.mInfo.mType == "buffer")
    {
        renderer.SetSamplerFilter(buffers[inp.id].mTexture[0], filter, true);
        renderer.SetSamplerFilter(buffers[inp.id].mTexture[1], filter, true);
        inp.mInfo.mSampler.filter = str;
    }
    else if (inp.mInfo.mType === "keyboard")
    {
        inp.mInfo.mSampler.filter = str;
    }
}

Pass.prototype.GetAcceptsMipmapping = function (id)
{
    var inp = this.mInputs[id];

    if (inp == null) return false;
    if (inp.mInfo.mType == "texture") return true;
    if (inp.mInfo.mType == "cubemap") return true;
    if (inp.mInfo.mType == "keyboard")  return false;
    if (inp.mInfo.mType == "buffer") return true;
    return false;
}

Pass.prototype.GetAcceptsLinear = function (id)
{
    var inp = this.mInputs[id];

    if (inp == null) return false;
    if (inp.mInfo.mType == "texture") return true;
    if (inp.mInfo.mType == "cubemap") return true;
    if (inp.mInfo.mType == "keyboard")  return false;
    if (inp.mInfo.mType == "buffer") return true;
    return false;
}

Pass.prototype.GetAcceptsWrapRepeat = function (id)
{
    var inp = this.mInputs[id];

    if (inp == null) return false;
    if (inp.mInfo.mType == "texture") return true;
    if (inp.mInfo.mType == "cubemap") return false;
    if (inp.mInfo.mType == "keyboard")  return false;
    if (inp.mInfo.mType == "buffer") return true;
    return false;
}

Pass.prototype.GetSamplerWrap = function (id)
{
    var inp = this.mInputs[id];
    return inp.mInfo.mSampler.wrap;
}
Pass.prototype.SetSamplerWrap = function (id, str, buffers)
{
    var me = this;
    var renderer = this.mRenderer;
    var inp = this.mInputs[id];

    var restr = renderer.TEXWRP.REPEAT;
    if (str == "clamp") restr = renderer.TEXWRP.CLAMP;

    if (inp == null) 
    {
    }
    else if (inp.mInfo.mType == "texture")
    {
        if (inp.loaded) 
        {
            renderer.SetSamplerWrap(inp.globject, restr);
            inp.mInfo.mSampler.wrap = str;
        }
    }
    else if (inp.mInfo.mType == "cubemap") 
    {
        if (inp.loaded)
        {
            renderer.SetSamplerWrap(inp.globject, restr);
            inp.mInfo.mSampler.wrap = str;
        }
    }
    else if (inp.mInfo.mType == "buffer")
    {
        renderer.SetSamplerWrap(buffers[inp.id].mTexture[0], restr);
        renderer.SetSamplerWrap(buffers[inp.id].mTexture[1], restr);
        inp.mInfo.mSampler.wrap = str;
    }
}

Pass.prototype.GetTexture = function( slot )
{
    var inp = this.mInputs[slot];
    if( inp==null ) return null;
    return inp.mInfo;

}

Pass.prototype.SetOutputs = function( slot, id )
{
    this.mOutputs[slot] = id;
}

Pass.prototype.SetOutputsByBufferID = function( slot, id )
{
    if( this.mType=="buffer" )
    {
        this.mOutputs[slot] = bufferID_to_assetID( id );

        this.mEffect.ResizeBuffer( id, this.mEffect.mXres, this.mEffect.mYres, false );
    }
    else if( this.mType=="cubemap" )
    {
        this.mOutputs[slot] = cubamepBufferID_to_assetID( id );
        this.mEffect.ResizeCubemapBuffer(id, 1024, 1024 );
    }
}

Pass.prototype.NewTexture = function( wa, slot, url, buffers, cubeBuffers, keyboard )
{
    var me = this;
    var renderer = this.mRenderer;

    if( renderer==null ) return;

    var texture = null;

    if( url==null || url.mType==null )
    {
        me.DestroyInput( slot );
        me.mInputs[slot] = null;
        me.MakeHeader();
        return { mFailed:false, mNeedsShaderCompile:false };
    }
    else if( url.mType=="texture" )
    {
        texture = {};
        texture.mInfo = url;
        texture.globject = null;
        texture.loaded = false;
        texture.image = new Image();
        texture.image.crossOrigin = '';
        texture.image.onload = function()
        {
            var rti = me.Sampler2Renderer(url.mSampler);

            // O.M.G. IQIQ FIX THIS
            var channels = renderer.TEXFMT.C4I8;
            if (url.mID == "Xdf3zn" || url.mID == "4sf3Rn" || url.mID == "4dXGzn" || url.mID == "4sf3Rr")
                channels = renderer.TEXFMT.C1I8;
            
            texture.globject = renderer.CreateTextureFromImage(renderer.TEXTYPE.T2D, texture.image, channels, rti.mFilter, rti.mWrap, rti.mVFlip);

            texture.loaded = true;
        }
        texture.image.src = url.mSrc;

        var returnValue = { mFailed:false, mNeedsShaderCompile: (this.mInputs[slot]==null ) || (
                                                                (this.mInputs[slot].mInfo.mType!="texture") && 
                                                                (this.mInputs[slot].mInfo.mType!="keyboard")) };
        this.DestroyInput( slot );
        this.mInputs[slot] = texture;
        this.MakeHeader();
        return returnValue;
    }
    else if( url.mType=="cubemap" )
    {
        texture = {};
        texture.mInfo = url;
        texture.globject = null;
        texture.loaded = false;

        var rti = me.Sampler2Renderer(url.mSampler);

        if( assetID_to_cubemapBuferID(url.mID)!=-1 )
        {
            texture.mImage = new Image();
            texture.mImage.onload = function()
            {
                texture.loaded = true;
            }
            texture.mImage.src = "/media/previz/cubemap00.png";

            this.mEffect.ResizeCubemapBuffer(0, 1024, 1024 );

        }
        else
        {
            texture.image = [ new Image(), new Image(), new Image(), new Image(), new Image(), new Image() ];

            var numLoaded = 0;
            for( var i=0; i<6; i++ )
            {
                texture.image[i].mId = i;
                texture.image[i].crossOrigin = '';
                texture.image[i].onload = function()
                {
                    var id = this.mId;
                    numLoaded++;
                    if( numLoaded==6 )
                    {
                        texture.globject = renderer.CreateTextureFromImage(renderer.TEXTYPE.CUBEMAP, texture.image, renderer.TEXFMT.C4I8, rti.mFilter, rti.mWrap, rti.mVFlip);
                        texture.loaded = true;
                    }
                }

                if( i == 0) 
                {
                    texture.image[i].src = url.mSrc;
                } 
                else 
                {
                    var n = url.mSrc.lastIndexOf(".");
                    texture.image[i].src = url.mSrc.substring(0, n) + "_" + i + url.mSrc.substring(n, url.mSrc.length);
                }
            }
        }

        var returnValue = { mFailed:false, mNeedsShaderCompile: (this.mInputs[slot]==null ) || (
                                                                (this.mInputs[slot].mInfo.mType!="cubemap")) };

        this.DestroyInput( slot );
        this.mInputs[slot] = texture;
        this.MakeHeader();
        return returnValue;
    }
    else if( url.mType=="keyboard" )
    {
        texture = {};
        texture.mInfo = url;
        texture.globject = null;
        texture.loaded = true;

        texture.keyboard = {};

        var returnValue = { mFailed:false, mNeedsShaderCompile: (this.mInputs[slot]==null ) || (
                                                                (this.mInputs[slot].mInfo.mType!="texture") && 
                                                                (this.mInputs[slot].mInfo.mType!="keyboard")) };
        this.DestroyInput( slot );
        this.mInputs[slot] = texture;
        this.MakeHeader();
        return returnValue;
    }
    else if( url.mType=="buffer" )
    {
        texture = {};
        texture.mInfo = url;

        texture.image = new Image();
        texture.image.onload = function()
        {
        }
        texture.image.src = url.mSrc;
        texture.id = assetID_to_bufferID( url.mID );
        texture.loaded = true;

        var returnValue = { mFailed:false, mNeedsShaderCompile: (this.mInputs[slot]==null ) || (
                                                                (this.mInputs[slot].mInfo.mType!="texture") && 
                                                                (this.mInputs[slot].mInfo.mType!="keyboard")) };

        this.DestroyInput( slot );
        this.mInputs[slot] = texture;

        this.mEffect.ResizeBuffer(texture.id, this.mEffect.mXres, this.mEffect.mYres, false );

        // Setting the passes samplers
        this.SetSamplerFilter(slot, url.mSampler.filter, buffers, cubeBuffers, true);
        this.SetSamplerVFlip(slot, url.mSampler.vflip);
        this.SetSamplerWrap(slot, url.mSampler.wrap, buffers);

        this.MakeHeader();
        return returnValue;
    }
    else
    {
        alert( "input type error" );
        return { mFailed: true };
    }

    return { mFailed: true };

}

Pass.prototype.Paint_Image = function(  wa, d, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard )
{
    var times = [ 0.0, 0.0, 0.0, 0.0 ];

    var dates = [ d.getFullYear(), // the year (four digits)
                  d.getMonth(),    // the month (from 0-11)
                  d.getDate(),     // the day of the month (from 1-31)
                  d.getHours()*60.0*60 + d.getMinutes()*60 + d.getSeconds()  + d.getMilliseconds()/1000.0 ];

    var mouse = [  mousePosX, mousePosY, mouseOriX, mouseOriY ];

    var resos = [ 0.0,0.0,0.0, 0.0,0.0,0.0, 0.0,0.0,0.0, 0.0,0.0,0.0 ];

    var texID = [ null, null, null, null];

    for( var i=0; i<this.mInputs.length; i++ )
    {
        var inp = this.mInputs[i];

        if( inp==null )
        {
        }
        else if( inp.mInfo.mType=="texture" )
        {
            if( inp.loaded==true  )
            {
                texID[i] = inp.globject;
                resos[3*i+0] = inp.image.width;
                resos[3*i+1] = inp.image.height;
                resos[3*i+2] = 1;
            }
        }
        else if( inp.mInfo.mType=="keyboard" )
        {
            texID[i] = keyboard.mTexture;
        }
        else if( inp.mInfo.mType=="cubemap" )
        {
            if (inp.loaded == true)
            {
                let id = assetID_to_cubemapBuferID(inp.mInfo.mID);
                if( id!=-1 )
                {
                    texID[i] = cubeBuffers[id].mTexture[ cubeBuffers[id].mLastRenderDone ];
                    resos[3*i+0] = cubeBuffers[id].mResolution[0];
                    resos[3*i+1] = cubeBuffers[id].mResolution[1];
                    resos[3*i+2] = 1;
    
                    // hack. in webgl2.0 we have samplers, so we don't need this crap here
                    var filter = this.mRenderer.FILTER.NONE;
                         if (inp.mInfo.mSampler.filter === "linear") filter = this.mRenderer.FILTER.LINEAR;
                    else if (inp.mInfo.mSampler.filter === "mipmap") filter = this.mRenderer.FILTER.MIPMAP;
                    this.mRenderer.SetSamplerFilter( texID[i], filter, false);
                }
                else
                {
                    texID[i] = inp.globject;
                }
            }
        }
        else if( inp.mInfo.mType==="buffer" )
        {
            if( inp.loaded===true  )
            {
                var id = inp.id;
                texID[i] = buffers[id].mTexture[ buffers[id].mLastRenderDone ];
                resos[3*i+0] = xres;
                resos[3*i+1] = yres;
                resos[3*i+2] = 1;
                // hack. in webgl2.0 we have samplers, so we don't need this crap here
                var filter = this.mRenderer.FILTER.NONE;
                     if (inp.mInfo.mSampler.filter === "linear") filter = this.mRenderer.FILTER.LINEAR;
                else if (inp.mInfo.mSampler.filter === "mipmap") filter = this.mRenderer.FILTER.MIPMAP;
                this.mRenderer.SetSamplerFilter( texID[i], filter, false);
            }
        }
    }

    this.mRenderer.AttachTextures( 4, texID[0], texID[1], texID[2], texID[3] );

    var prog = this.mProgram;

    this.mRenderer.AttachShader(prog);

    this.mRenderer.SetShaderConstant1F(  "iTime", time);
    this.mRenderer.SetShaderConstant3F(  "iResolution", xres, yres, 1.0);
    this.mRenderer.SetShaderConstant4FV( "iMouse", mouse);
    this.mRenderer.SetShaderConstant4FV( "iDate", dates );
    this.mRenderer.SetShaderConstant1F(  "iSampleRate", this.mSampleRate);
    this.mRenderer.SetShaderTextureUnit( "iChannel0", 0 );
    this.mRenderer.SetShaderTextureUnit( "iChannel1", 1 );
    this.mRenderer.SetShaderTextureUnit( "iChannel2", 2 );
    this.mRenderer.SetShaderTextureUnit( "iChannel3", 3 );
    this.mRenderer.SetShaderConstant1I(  "iFrame", this.mFrame );
    this.mRenderer.SetShaderConstant1F(  "iTimeDelta", dtime);
    this.mRenderer.SetShaderConstant1F(  "iFrameRate", fps );

    this.mRenderer.SetShaderConstant1F(  "iChannel[0].time",       times[0] );
    this.mRenderer.SetShaderConstant1F(  "iChannel[1].time",       times[1] );
    this.mRenderer.SetShaderConstant1F(  "iChannel[2].time",       times[2] );
    this.mRenderer.SetShaderConstant1F(  "iChannel[3].time",       times[3] );
    this.mRenderer.SetShaderConstant3F(  "iChannel[0].resolution", resos[0], resos[ 1], resos[ 2] );
    this.mRenderer.SetShaderConstant3F(  "iChannel[1].resolution", resos[3], resos[ 4], resos[ 5] );
    this.mRenderer.SetShaderConstant3F(  "iChannel[2].resolution", resos[6], resos[ 7], resos[ 8] );
    this.mRenderer.SetShaderConstant3F(  "iChannel[3].resolution", resos[9], resos[10], resos[11] );

    var l1 = this.mRenderer.GetAttribLocation(this.mProgram, "pos");

    this.mRenderer.SetViewport([0, 0, xres, yres]);
    this.mRenderer.DrawFullScreenTriangle_XY( l1 );

    this.mRenderer.DettachTextures();
}

Pass.prototype.SetUniforms = function( wa, d, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard )
{
    var times = [ 0.0, 0.0, 0.0, 0.0 ];

    var dates = [ d.getFullYear(), // the year (four digits)
                  d.getMonth(),    // the month (from 0-11)
                  d.getDate(),     // the day of the month (from 1-31)
                  d.getHours()*60.0*60 + d.getMinutes()*60 + d.getSeconds()  + d.getMilliseconds()/1000.0 ];

    var mouse = [  mousePosX, mousePosY, mouseOriX, mouseOriY ];

    var resos = [ 0.0,0.0,0.0, 0.0,0.0,0.0, 0.0,0.0,0.0, 0.0,0.0,0.0 ];

    var texID = [ null, null, null, null];

    for( var i=0; i<this.mInputs.length; i++ )
    {
        var inp = this.mInputs[i];

        if( inp==null )
        {
        }
        else if( inp.mInfo.mType=="texture" )
        {
            if( inp.loaded==true  )
            {
                texID[i] = inp.globject;
                resos[3*i+0] = inp.image.width;
                resos[3*i+1] = inp.image.height;
                resos[3*i+2] = 1;
            }
        }
        else if( inp.mInfo.mType=="keyboard" )
        {
            texID[i] = keyboard.mTexture;
        }
        else if( inp.mInfo.mType=="cubemap" )
        {
            if (inp.loaded == true)
            {
                let id = assetID_to_cubemapBuferID(inp.mInfo.mID);
                if( id!=-1 )
                {
                    texID[i] = cubeBuffers[id].mTexture[ cubeBuffers[id].mLastRenderDone ];
                    resos[3*i+0] = cubeBuffers[id].mResolution[0];
                    resos[3*i+1] = cubeBuffers[id].mResolution[1];
                    resos[3*i+2] = 1;
    
                    // hack. in webgl2.0 we have samplers, so we don't need this crap here
                    var filter = this.mRenderer.FILTER.NONE;
                         if (inp.mInfo.mSampler.filter === "linear") filter = this.mRenderer.FILTER.LINEAR;
                    else if (inp.mInfo.mSampler.filter === "mipmap") filter = this.mRenderer.FILTER.MIPMAP;
                    this.mRenderer.SetSamplerFilter( texID[i], filter, false);
                }
                else
                {
                    texID[i] = inp.globject;
                }
            }

        }
        else if( inp.mInfo.mType==="buffer" )
        {
            if( inp.loaded===true  )
            {
                texID[i] = buffers[inp.id].mTexture[ buffers[inp.id].mLastRenderDone ];
                resos[3*i+0] = xres;
                resos[3*i+1] = yres;
                resos[3*i+2] = 1;
            }
        }
    }

    this.mRenderer.AttachTextures( 4, texID[0], texID[1], texID[2], texID[3] );

    this.mRenderer.AttachShader(this.mProgram);

    this.mRenderer.SetShaderConstant1F(  "iTime", time);
    this.mRenderer.SetShaderConstant3F(  "iResolution", xres, yres, 1.0);
    this.mRenderer.SetShaderConstant4FV( "iMouse", mouse);
    this.mRenderer.SetShaderConstant4FV( "iDate", dates );
    this.mRenderer.SetShaderConstant1F(  "iSampleRate", this.mSampleRate);
    this.mRenderer.SetShaderTextureUnit( "iChannel0", 0 );
    this.mRenderer.SetShaderTextureUnit( "iChannel1", 1 );
    this.mRenderer.SetShaderTextureUnit( "iChannel2", 2 );
    this.mRenderer.SetShaderTextureUnit( "iChannel3", 3 );
    this.mRenderer.SetShaderConstant1I(  "iFrame", this.mFrame );
    this.mRenderer.SetShaderConstant1F(  "iTimeDelta", dtime);
    this.mRenderer.SetShaderConstant1F(  "iFrameRate", fps );

    this.mRenderer.SetShaderConstant1F(  "iChannel[0].time",       times[0] );
    this.mRenderer.SetShaderConstant1F(  "iChannel[1].time",       times[1] );
    this.mRenderer.SetShaderConstant1F(  "iChannel[2].time",       times[2] );
    this.mRenderer.SetShaderConstant1F(  "iChannel[3].time",       times[3] );
    this.mRenderer.SetShaderConstant3F(  "iChannel[0].resolution", resos[0], resos[ 1], resos[ 2] );
    this.mRenderer.SetShaderConstant3F(  "iChannel[1].resolution", resos[3], resos[ 4], resos[ 5] );
    this.mRenderer.SetShaderConstant3F(  "iChannel[2].resolution", resos[6], resos[ 7], resos[ 8] );
    this.mRenderer.SetShaderConstant3F(  "iChannel[3].resolution", resos[9], resos[10], resos[11] );
}

Pass.prototype.ProcessInputs = function( wa, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard )
{
    for( var i=0; i<this.mInputs.length; i++ )
    {
        var inp = this.mInputs[i];

        if( inp==null )
        {
        }
        if( inp.mInfo.mType==="buffer" )
        {
            if (inp.loaded===true)
            {
                var id = inp.id;
                var texID = buffers[id].mTexture[ buffers[id].mLastRenderDone ];

                // hack. in webgl2.0 we have samplers, so we don't need this crap here
                var filter = this.mRenderer.FILTER.NONE;
                     if (inp.mInfo.mSampler.filter === "linear") filter = this.mRenderer.FILTER.LINEAR;
                else if (inp.mInfo.mSampler.filter === "mipmap") filter = this.mRenderer.FILTER.MIPMAP;
                this.mRenderer.SetSamplerFilter( texID, filter, false);
            }
        }
    }
}

Pass.prototype.Paint_Cubemap = function(  wa, d, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard, face )
{
    this.ProcessInputs( wa, d, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard, face );
    this.SetUniforms( wa, d, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard );

    var l1 = this.mRenderer.GetAttribLocation(this.mProgram, "pos");

    var vp = [0, 0, xres, yres];

    this.mRenderer.SetViewport(vp);

    var corA = [ -1.0, -1.0, -1.0 ];
    var corB = [  1.0, -1.0, -1.0 ];
    var corC = [  1.0,  1.0, -1.0 ];
    var corD = [ -1.0,  1.0, -1.0 ];
    var apex = [  0.0,  0.0,  0.0 ];

    if( face==0 )
    {
        corA = [  1.0,  1.0,  1.0 ];
        corB = [  1.0,  1.0, -1.0 ];
        corC = [  1.0, -1.0, -1.0 ];
        corD = [  1.0, -1.0,  1.0 ];
    }
    else if( face==1 ) // -X
    {
        corA = [ -1.0,  1.0, -1.0 ];
        corB = [ -1.0,  1.0,  1.0 ];
        corC = [ -1.0, -1.0,  1.0 ];
        corD = [ -1.0, -1.0, -1.0 ];
    }
    else if( face==2 ) // +Y
    {
        corA = [ -1.0,  1.0, -1.0 ];
        corB = [  1.0,  1.0, -1.0 ];
        corC = [  1.0,  1.0,  1.0 ];
        corD = [ -1.0,  1.0,  1.0 ];
    }
    else if( face==3 ) // -Y
    {
        corA = [ -1.0, -1.0,  1.0 ];
        corB = [  1.0, -1.0,  1.0 ];
        corC = [  1.0, -1.0, -1.0 ];
        corD = [ -1.0, -1.0, -1.0 ];
    }
    else if( face==4 ) // +Z
    {
        corA = [ -1.0,  1.0,  1.0 ];
        corB = [  1.0,  1.0,  1.0 ];
        corC = [  1.0, -1.0,  1.0 ];
        corD = [ -1.0, -1.0,  1.0 ];
    }
    else //if( face==5 ) // -Z
    {
        corA = [  1.0,  1.0, -1.0 ];
        corB = [ -1.0,  1.0, -1.0 ];
        corC = [ -1.0, -1.0, -1.0 ];
        corD = [  1.0, -1.0, -1.0 ];
    }

    var corners = [ corA[0], corA[1], corA[2], 
                    corB[0], corB[1], corB[2], 
                    corC[0], corC[1], corC[2], 
                    corD[0], corD[1], corD[2],
                    apex[0], apex[1], apex[2]];

    this.mRenderer.SetShaderConstant3FV("unCorners", corners);
    this.mRenderer.SetShaderConstant4FV("unViewport", vp);

    this.mRenderer.DrawUnitQuad_XY(l1);

    this.mRenderer.DettachTextures();
}

Pass.prototype.Paint = function(wa, da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, isPaused, bufferID, bufferNeedsMimaps, buffers, cubeBuffers, keyboard, effect )
{
    if( this.mType==="image" )
    {
        this.mRenderer.SetRenderTarget( null );
        this.Paint_Image(wa, da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard );
        this.mFrame++;
    }
    else if( this.mType==="common" )
    {
        //console.log("rendering common");
    }
    else if( this.mType=="buffer" )
    {
        this.mEffect.ResizeBuffer(bufferID, this.mEffect.mXres, this.mEffect.mYres, false );

        var buffer = buffers[bufferID];

        var dstID = 1 - buffer.mLastRenderDone;

        this.mRenderer.SetRenderTarget( buffer.mTarget[dstID] );
        this.Paint_Image(wa, da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard );

        // compute mipmaps if needed
        if( bufferNeedsMimaps )
        {
            this.mRenderer.CreateMipmaps( buffer.mTexture[dstID]);
        }

        buffers[bufferID].mLastRenderDone = 1 - buffers[bufferID].mLastRenderDone;
        this.mFrame++;
    }
    else if( this.mType=="cubemap" )
    {
        this.mEffect.ResizeCubemapBuffer(bufferID, 1024, 1024, false );

        var buffer = cubeBuffers[bufferID];

        xres = buffer.mResolution[0];
        yres = buffer.mResolution[1];
        var dstID = 1 - buffer.mLastRenderDone;
        for( let face=0; face<6; face++ )
        {
            this.mRenderer.SetRenderTargetCubeMap( buffer.mTarget[dstID], face );
            this.Paint_Cubemap(wa, da, time, dtime, fps, mouseOriX, mouseOriY, mousePosX, mousePosY, xres, yres, buffers, cubeBuffers, keyboard, face );
        }
        this.mRenderer.SetRenderTargetCubeMap( null, 0 );

        // compute mipmaps if needed
        if( bufferNeedsMimaps )
        {
            this.mRenderer.CreateMipmaps( buffer.mTexture[dstID]);
        }
        cubeBuffers[bufferID].mLastRenderDone = 1 - cubeBuffers[bufferID].mLastRenderDone;

        this.mFrame++;
    }
}

Pass.prototype.GetCompilationTime = function()
{
    return this.mCompilationTime;
}
