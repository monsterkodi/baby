
var gToy = null;

function Toy (parentElement)
{
    if (parentElement==null) return;

    var me = this;

    this.mNeedsSave = false;
    this.mAreThereAnyErrors = false;
    this.mCreated = false;
    this.mGLContext = null;
    this.mEffect = null;
    this.mTo = null;
    this.mTOffset = 0;
    this.mCanvas = null;
    this.mIsPaused = false;
    this.mForceFrame = false;
    // this.mInfo = null;
    this.mPass = [];
    this.mActiveDoc = 0;

    var devicePixelRatio = window.devicePixelRatio || 1;

    this.mCanvas = document.getElementById("demogl");
    this.mCanvas.tabIndex = "0";
    this.mCanvas.width  = this.mCanvas.offsetWidth * devicePixelRatio;
    this.mCanvas.height = this.mCanvas.offsetHeight * devicePixelRatio;

    this.mTo = performance.now();
    this.mTf = 0;
    this.mRestarted = true;
    this.mMouseOriX = 0;
    this.mMouseOriY = 0;
    this.mMousePosX = 0;
    this.mMousePosY = 0;
    this.mIsRendering = false;

    this.mGLContext = piCreateGlContext(this.mCanvas); 
    
    if (this.mGLContext==null)
    {
        console.log("no gl context");
    }

    this.mErrors = new Array();
    
    this.mEffect = new Effect(this.mGLContext, this.mCanvas.width, this.mCanvas.height, this);
    if (!this.mEffect.mCreated)
    {
        console.log("no effect");
        return;
    }

    this.mCanvas.addEventListener("webglcontextlost", function(event) 
    {
        console.log("webglcontextlost");
        event.preventDefault();
        me.mIsPaused = true;
        alert('toy: ooops, your WebGL implementation has crashed!');
    }, false);
    
    this.loadNew();
}

Toy.prototype.startRendering = function()
{
    this.mIsRendering = true;
    var me = this;

    function renderLoop()
    {
        if( me.mGLContext==null ) return;

        me.mEffect.RequestAnimationFrame(renderLoop);

        if (me.mIsPaused && !me.mForceFrame)
        {
            me.mEffect.UpdateInputs( me.mActiveDoc, false );
            return;
        }
        me.mForceFrame = false;

        var time = performance.now();

        var ltime = 0.0;
        var dtime = 0.0;
        if( me.mIsPaused ) 
        {
            ltime = me.mTf;
            dtime = 1000.0 / 60.0;
        }
        else
        {
            ltime = me.mTOffset + time - me.mTo;
            if( me.mRestarted )
                dtime = 1000.0/60.0;
            else
                dtime = ltime - me.mTf; 
            me.mTf = ltime;
        }
        me.mRestarted = false;

        me.mEffect.Paint(ltime/1000.0, dtime/1000.0, 60, me.mMouseOriX, me.mMouseOriY, me.mMousePosX, me.mMousePosY, me.mIsPaused );
    }

    renderLoop();
}

Toy.prototype.resize = function( xres, yres )
{
    console.log("resize", xres, yres);
    
    if (!this.mCanvas) { return; }
    
    
    this.mCanvas.setAttribute("width", xres);
    this.mCanvas.setAttribute("height", yres);
    this.mCanvas.width = xres;
    this.mCanvas.height = yres;

    this.mEffect.SetSize(xres,yres);
    this.mForceFrame = true;
}

Toy.prototype.SetErrors = function(result)
{
    if (result==null)
    {
        this.mForceFrame = true;
    }
    else
    {
        console.log(result);
    }
}

Toy.prototype.GetAnyErrors = function()
{
    return this.mAreThereAnyErrors;
}

Toy.prototype.SetErrorsGlobal = function(areThereAnyErrors)
{
    this.mAreThereAnyErrors = areThereAnyErrors;
    var eleWrapper = document.getElementById('editorWrapper');

    if( areThereAnyErrors==false )
    {
        this.mForceFrame = true;
    }
}

Toy.prototype.SetTexture = function( slot, url )
{
    this.mNeedsSave = true;
    var res = this.mEffect.NewTexture( this.mActiveDoc, slot, url );
    if( res.mFailed==false )
    {
        this.mPass[this.mActiveDoc].mDirty = res.mNeedsShaderCompile;
    }
}

Toy.prototype.GetTexture = function( slot )
{
    return this.mEffect.GetTexture( this.mActiveDoc, slot );
}

Toy.prototype.SetShaderFromEditor = function( forceall )
{
    window.setTimeout(function()
    {
        var anyErrors = false;

        var num = this.mEffect.GetNumPasses();

        var recompileAll = false;
        for (var i = 0; i < num; i++)
        {
            if (this.mEffect.GetPassType(i) == "common" && (this.mPass[i].mDirty || forceall))
            {
                recompileAll = true;
                break;
            }
        }

        for (var j = 0; j < 5; j++)
        {
            for (var i = 0; i < num; i++)
            {
                if (j == 0 && this.mEffect.GetPassType(i) != "common") continue;
                if (j == 1 && this.mEffect.GetPassType(i) != "buffer") continue;
                if (j == 2 && this.mEffect.GetPassType(i) != "cubemap") continue;
                if (j == 3 && this.mEffect.GetPassType(i) != "image") continue;
                if (j == 4 && this.mEffect.GetPassType(i) != "sound") continue;

                if (recompileAll || this.mPass[i].mDirty || forceall )
                {
                    var shaderCode = this.mPass[i].mCode;

                    var result = this.mEffect.NewShader(shaderCode, i);

                    var eleLab = document.getElementById("tab" + i);
                    if (result != null)
                    {
                        anyErrors = true;
                        eleLab.classList.add("errorYes");
                    }
                    else
                    {
                        eleLab.classList.remove("errorYes");
                    }

                    this.mPass[i].mError = result;
                    this.mPass[i].mDirty = false;
                }
            }
        }

        this.SetErrors(this.mPass[this.mActiveDoc].mError);
        this.SetErrorsGlobal(anyErrors);

        if( !anyErrors )
        {
            if( !this.mIsRendering )
            {
                gToy.startRendering();
            }

            this.mForceFrame = true;
        }
    }.bind(this), 10 );
}

Toy.prototype.loadNew = function()
{
    var passes = [
                    {
		    		"inputs": [],
		    		"outputs": [ {"channel":0, "id":"4dfGRr" } ],
                    "type":"image",
                    "code": "void mainImage( out vec4 fragColor, in vec2 fragCoord )\n{\n    // Normalized pixel coordinates (from 0 to 1)\n    vec2 uv = fragCoord/iResolution.xy;\n\n    // Time varying pixel color\n    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));\n\n    // Output to screen\n    fragColor = vec4(col,1.0);\n}",
		    		"name":"",
		    		"description":""
		    		}
                ];

    var res = this.mEffect.newScriptJSON(passes);

    this.mPass = [];

    var num = res.length;
    for( var i=0; i<num; i++ )
    {
        this.mPass[i] = { mCode:   res[i].mShader,
                          mFailed: res[i].mFailed,
                          mError:  res[i].mError,
                          mDirty:  false,
                        };
    }
    this.SetErrors( this.mPass[0].mError, true );
    this.SetErrorsGlobal( res.mFailed, true );

    this.startRendering();
}

// 00000000   00000000   0000000  000  0000000  00000000  
// 000   000  000       000       000     000   000       
// 0000000    0000000   0000000   000    000    0000000   
// 000   000  000            000  000   000     000       
// 000   000  00000000  0000000   000  0000000  00000000  

function watchResize()
{
    var srdiv = document.getElementById("demogl");
    if (srdiv)
    {
        gToy.resize(srdiv.offsetWidth, srdiv.offsetHeight);
    }
}

// 000  000   000  000  000000000  
// 000  0000  000  000     000     
// 000  000 0 000  000     000     
// 000  000  0000  000     000     
// 000  000   000  000     000     

function watchInit()
{
    gToy = new Toy(document.getElementById("player"));
}
