// koffee 1.7.0

/*
000000000   0000000   000   000  
   000     000   000   000 000   
   000     000   000    00000    
   000     000   000     000     
   000      0000000      000
 */
var Toy,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Toy = (function() {
    Toy.instance = null;

    function Toy(mCanvas) {
        var devicePixelRatio;
        this.mCanvas = mCanvas;
        this.resize = bind(this.resize, this);
        this.renderLoop = bind(this.renderLoop, this);
        this.mCreated = false;
        this.mGLContext = null;
        this.mEffect = null;
        this.mTo = null;
        this.mIsPaused = false;
        this.mForceFrame = false;
        this.mPass = [];
        this.mActiveDoc = 0;
        devicePixelRatio = window.devicePixelRatio || 1;
        this.mCanvas.tabIndex = '0';
        this.mCanvas.width = this.mCanvas.offsetWidth * devicePixelRatio;
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
        if (!this.mGLContext) {
            console.log('no gl context');
        }
        this.mErrors = new Array();
        this.mEffect = new Effect(this.mGLContext, this.mCanvas.width, this.mCanvas.height, this);
        if (!this.mEffect.mCreated) {
            console.log('no effect');
            return;
        }
        this.mCanvas.addEventListener('webglcontextlost', function(event) {
            console.log('webglcontextlost');
            return event.preventDefault();
        });
        this.loadNew();
    }

    Toy.prototype.startRendering = function() {
        this.mIsRendering = true;
        return this.renderLoop();
    };

    Toy.prototype.renderLoop = function() {
        var dtime, ltime, time;
        if (!this.mGLContext) {
            return;
        }
        requestAnimationFrame(this.renderLoop);
        if (this.mIsPaused && !this.mForceFrame) {
            return;
        }
        this.mForceFrame = false;
        time = performance.now();
        ltime = 0.0;
        dtime = 0.0;
        if (this.mIsPaused) {
            ltime = this.mTf;
            dtime = 1000.0 / 60.0;
        } else {
            ltime = time - this.mTo;
            if (this.mRestarted) {
                dtime = 1000.0 / 60.0;
            } else {
                dtime = ltime - this.mTf;
            }
            this.mTf = ltime;
        }
        this.mRestarted = false;
        return this.mEffect.Paint(ltime / 1000.0, dtime / 1000.0, 60, this.mMouseOriX, this.mMouseOriY, this.mMousePosX, this.mMousePosY, this.mIsPaused);
    };

    Toy.prototype.resize = function(xres, yres) {
        if (this.mCanvas) {
            this.mCanvas.width = this.mCanvas.offsetWidth;
            this.mCanvas.height = this.mCanvas.offsetHeight;
            this.mEffect.SetSize(this.mCanvas.width, this.mCanvas.height);
            return this.mForceFrame = true;
        }
    };

    Toy.prototype.logErrors = function(result) {
        if (result) {
            return console.log(result);
        }
    };

    Toy.prototype.setTexture = function(slot, url) {
        var res;
        res = this.mEffect.NewTexture(this.mActiveDoc, slot, url);
        if (!res.mFailed) {
            return this.mPass[this.mActiveDoc].mDirty = res.mNeedsShaderCompile;
        }
    };

    Toy.prototype.getTexture = function(slot) {
        return this.mEffect.GetTexture(this.mActiveDoc, slot);
    };

    Toy.prototype.setShaderFromEditor = function(forceall) {
        var anyErrors, i, j, k, l, m, num, recompileAll, ref, ref1, result, shaderCode;
        anyErrors = false;
        num = this.mEffect.GetNumPasses();
        recompileAll = false;
        for (i = k = 0, ref = num; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
            if (this.mEffect.GetPassType(i) === 'common' && (this.mPass[i].mDirty || forceall)) {
                recompileAll = true;
                break;
            }
        }
        for (j = l = 0; l < 5; j = ++l) {
            for (i = m = 0, ref1 = num; 0 <= ref1 ? m < ref1 : m > ref1; i = 0 <= ref1 ? ++m : --m) {
                if (j === 0 && this.mEffect.GetPassType(i) !== 'common') {
                    continue;
                }
                if (j === 1 && this.mEffect.GetPassType(i) !== 'buffer') {
                    continue;
                }
                if (j === 2 && this.mEffect.GetPassType(i) !== 'cubemap') {
                    continue;
                }
                if (j === 3 && this.mEffect.GetPassType(i) !== 'image') {
                    continue;
                }
                if (j === 4 && this.mEffect.GetPassType(i) !== 'sound') {
                    continue;
                }
                if (recompileAll || this.mPass[i].mDirty || forceall) {
                    shaderCode = this.mPass[i].mCode;
                    result = this.mEffect.NewShader(shaderCode, i);
                    if (result) {
                        anyErrors = true;
                    }
                    this.mPass[i].mError = result;
                    this.mPass[i].mDirty = false;
                }
            }
        }
        this.logErrors(this.mPass[this.mActiveDoc].mError);
        if (!anyErrors) {
            if (!this.mIsRendering) {
                gToy.startRendering();
            }
            return this.mForceFrame = true;
        }
    };

    Toy.prototype.loadNew = function() {
        var i, k, passes, ref, res;
        passes = [
            {
                inputs: [],
                outputs: [
                    {
                        channel: 0,
                        id: "4dfGRr"
                    }
                ],
                type: 'image',
                code: "void mainImage( out vec4 fragColor, in vec2 fragCoord )\n{\n    vec2 uv = fragCoord/iResolution.xy;\n    vec3 col = 0.15 + 0.15*cos(0.1*iTime+uv.xyx+vec3(0,2,4));\n    fragColor = vec4(col,1.0);\n}"
            }
        ];
        res = this.mEffect.newScriptJSON(passes);
        this.mPass = [];
        for (i = k = 0, ref = res.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
            this.mPass[i] = {
                mCode: res[i].mShader,
                mFailed: res[i].mFailed,
                mError: res[i].mError,
                mDirty: false
            };
        }
        this.logErrors(this.mPass[0].mError);
        return this.startRendering();
    };

    Toy.resize = function() {
        return this.instance.resize();
    };

    Toy.init = function() {
        return this.instance = new Toy(document.getElementById('glCanvas'));
    };

    return Toy;

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG95LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxHQUFBO0lBQUE7O0FBUU07SUFFRixHQUFDLENBQUEsUUFBRCxHQUFZOztJQUVULGFBQUMsT0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsVUFBRDs7O1FBRUEsSUFBQyxDQUFBLFFBQUQsR0FBZTtRQUNmLElBQUMsQ0FBQSxVQUFELEdBQWU7UUFDZixJQUFDLENBQUEsT0FBRCxHQUFlO1FBQ2YsSUFBQyxDQUFBLEdBQUQsR0FBZTtRQUNmLElBQUMsQ0FBQSxTQUFELEdBQWU7UUFDZixJQUFDLENBQUEsV0FBRCxHQUFlO1FBQ2YsSUFBQyxDQUFBLEtBQUQsR0FBZTtRQUNmLElBQUMsQ0FBQSxVQUFELEdBQWU7UUFFZixnQkFBQSxHQUFtQixNQUFNLENBQUMsZ0JBQVAsSUFBMkI7UUFFOUMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxRQUFULEdBQW9CO1FBQ3BCLElBQUMsQ0FBQSxPQUFPLENBQUMsS0FBVCxHQUFrQixJQUFDLENBQUEsT0FBTyxDQUFDLFdBQVQsR0FBdUI7UUFDekMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULEdBQWtCLElBQUMsQ0FBQSxPQUFPLENBQUMsWUFBVCxHQUF3QjtRQUUxQyxJQUFDLENBQUEsR0FBRCxHQUFjLFdBQVcsQ0FBQyxHQUFaLENBQUE7UUFDZCxJQUFDLENBQUEsR0FBRCxHQUFjO1FBQ2QsSUFBQyxDQUFBLFVBQUQsR0FBYztRQUNkLElBQUMsQ0FBQSxVQUFELEdBQWM7UUFDZCxJQUFDLENBQUEsVUFBRCxHQUFjO1FBQ2QsSUFBQyxDQUFBLFVBQUQsR0FBYztRQUNkLElBQUMsQ0FBQSxVQUFELEdBQWM7UUFDZCxJQUFDLENBQUEsWUFBRCxHQUFnQjtRQUVoQixJQUFDLENBQUEsVUFBRCxHQUFjLGlCQUFBLENBQWtCLElBQUMsQ0FBQSxPQUFuQjtRQUVkLElBQUcsQ0FBSSxJ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QUEsRUFBTSx1TUFKQTthQUFEOztRQWNULEdBQUEsR0FBTSxJQUFDLENBQUEsT0FBTyxDQUFDLGFBQVQsQ0FBdUIsTUFBdkI7UUFFTixJQUFDLENBQUEsS0FBRCxHQUFTO0FBRVQsYUFBUyxtRkFBVDtZQUNJLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFQLEdBQ0k7Z0JBQUEsS0FBQSxFQUFTLEdBQUksQ0FBQSxDQUFBLENBQUUsQ0FBQyxPQUFoQjtnQkFDQSxPQUFBLEVBQVMsR0FBSSxDQUFBLENBQUEsQ0FBRSxDQUFDLE9BRGhCO2dCQUVBLE1BQUEsRUFBUyxHQUFJLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFGaEI7Z0JBR0EsTUFBQSxFQUFTLEtBSFQ7O0FBRlI7UUFPQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBckI7ZUFDQSxJQUFDLENBQUEsY0FBRCxDQUFBO0lBM0JLOztJQTZCVCxHQUFDLENBQUEsTUFBRCxHQUFTLFNBQUE7ZUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQVYsQ0FBQTtJQUFIOztJQUNULEdBQUMsQ0FBQSxJQUFELEdBQVMsU0FBQTtlQUFHLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxHQUFKLENBQVEsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsVUFBeEIsQ0FBUjtJQUFmIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwIDAwMCAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgICAgMDAwMDAgICAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgIDAwMCAgICAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuIyMjXG5cbmNsYXNzIFRveVxuXG4gICAgQGluc3RhbmNlID0gbnVsbFxuICAgIFxuICAgIEA6IChAbUNhbnZhcykgLT5cblxuICAgICAgICBAbUNyZWF0ZWQgICAgPSBmYWxzZVxuICAgICAgICBAbUdMQ29udGV4dCAgPSBudWxsXG4gICAgICAgIEBtRWZmZWN0ICAgICA9IG51bGxcbiAgICAgICAgQG1UbyAgICAgICAgID0gbnVsbFxuICAgICAgICBAbUlzUGF1c2VkICAgPSBmYWxzZVxuICAgICAgICBAbUZvcmNlRnJhbWUgPSBmYWxzZVxuICAgICAgICBAbVBhc3MgICAgICAgPSBbXVxuICAgICAgICBAbUFjdGl2ZURvYyAgPSAwXG4gICAgXG4gICAgICAgIGRldmljZVBpeGVsUmF0aW8gPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyBvciAxXG4gICAgXG4gICAgICAgIEBtQ2FudmFzLnRhYkluZGV4ID0gJzAnXG4gICAgICAgIEBtQ2FudmFzLndpZHRoICA9IEBtQ2FudmFzLm9mZnNldFdpZHRoICogZGV2aWNlUGl4ZWxSYXRpb1xuICAgICAgICBAbUNhbnZhcy5oZWlnaHQgPSBAbUNhbnZhcy5vZmZzZXRIZWlnaHQgKiBkZXZpY2VQaXhlbFJhdGlvXG4gICAgXG4gICAgICAgIEBtVG8gICAgICAgID0gcGVyZm9ybWFuY2Uubm93KClcbiAgICAgICAgQG1UZiAgICAgICAgPSAwXG4gICAgICAgIEBtUmVzdGFydGVkID0gdHJ1ZVxuICAgICAgICBAbU1vdXNlT3JpWCA9IDBcbiAgICAgICAgQG1Nb3VzZU9yaVkgPSAwXG4gICAgICAgIEBtTW91c2VQb3NYID0gMFxuICAgICAgICBAbU1vdXNlUG9zWSA9IDBcbiAgICAgICAgQG1Jc1JlbmRlcmluZyA9IGZhbHNlXG4gICAgXG4gICAgICAgIEBtR0xDb250ZXh0ID0gcGlDcmVhdGVHbENvbnRleHQgQG1DYW52YXNcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBAbUdMQ29udGV4dFxuICAgICAgICAgICAgbG9nICdubyBnbCBjb250ZXh0J1xuICAgIFxuICAgICAgICBAbUVycm9ycyA9IG5ldyBBcnJheSgpXG4gICAgICAgIFxuICAgICAgICBAbUVmZmVjdCA9IG5ldyBFZmZlY3QoQG1HTENvbnRleHQsIEBtQ2FudmFzLndpZHRoLCBAbUNhbnZhcy5oZWlnaHQsIHRoaXMpXG4gICAgICAgIGlmIG5vdCBAbUVmZmVjdC5tQ3JlYXRlZFxuICAgICAgICAgICAgbG9nICdubyBlZmZlY3QnXG4gICAgICAgICAgICByZXR1cm5cbiAgICBcbiAgICAgICAgQG1DYW52YXMuYWRkRXZlbnRMaXN0ZW5lciAnd2ViZ2xjb250ZXh0bG9zdCcgKGV2ZW50KSAtPlxuICAgICAgICAgICAgbG9nICd3ZWJnbGNvbnRleHRsb3N0J1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxuICAgICAgICBcbiAgICAgICAgQGxvYWROZXcoKVxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgc3RhcnRSZW5kZXJpbmc6IC0+XG5cbiAgICAgICAgQG1Jc1JlbmRlcmluZyA9IHRydWVcbiAgICAgICAgQHJlbmRlckxvb3AoKVxuICAgIFxuICAgIHJlbmRlckxvb3A6ID0+XG4gICAgICAgIFxuICAgICAgICBpZiBub3QgQG1HTENvbnRleHQgdGhlbiByZXR1cm5cblxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgQHJlbmRlckxvb3BcblxuICAgICAgICBpZiBAbUlzUGF1c2VkIGFuZCBub3QgQG1Gb3JjZUZyYW1lXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICBAbUZvcmNlRnJhbWUgPSBmYWxzZVxuXG4gICAgICAgIHRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKVxuXG4gICAgICAgIGx0aW1lID0gMC4wXG4gICAgICAgIGR0aW1lID0gMC4wXG4gICAgICAgIGlmIEBtSXNQYXVzZWRcbiAgICAgICAgICAgIGx0aW1lID0gQG1UZlxuICAgICAgICAgICAgZHRpbWUgPSAxMDAwLjAgLyA2MC4wXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGx0aW1lID0gdGltZSAtIEBtVG9cbiAgICAgICAgICAgIGlmIEBtUmVzdGFydGVkXG4gICAgICAgICAgICAgICAgZHRpbWUgPSAxMDAwLjAvNjAuMFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGR0aW1lID0gbHRpbWUgLSBAbVRmIFxuICAgICAgICAgICAgQG1UZiA9IGx0aW1lXG4gICAgICAgIEBtUmVzdGFydGVkID0gZmFsc2VcblxuICAgICAgICBAbUVmZmVjdC5QYWludCBsdGltZS8xMDAwLjAsIGR0aW1lLzEwMDAuMCwgNjAsIEBtTW91c2VPcmlYLCBAbU1vdXNlT3JpWSwgQG1Nb3VzZVBvc1gsIEBtTW91c2VQb3NZLCBAbUlzUGF1c2VkIFxuXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgcmVzaXplOiAoeHJlcywgeXJlcykgPT5cblxuICAgICAgICBpZiBAbUNhbnZhc1xuICAgICAgICAgICAgQG1DYW52YXMud2lkdGggID0gQG1DYW52YXMub2Zmc2V0V2lkdGhcbiAgICAgICAgICAgIEBtQ2FudmFzLmhlaWdodCA9IEBtQ2FudmFzLm9mZnNldEhlaWdodFxuICAgICAgICAgICAgQG1FZmZlY3QuU2V0U2l6ZSBAbUNhbnZhcy53aWR0aCwgQG1DYW52YXMuaGVpZ2h0XG4gICAgICAgICAgICBAbUZvcmNlRnJhbWUgPSB0cnVlXG5cbiAgICBsb2dFcnJvcnM6IChyZXN1bHQpIC0+IGxvZyByZXN1bHQgaWYgcmVzdWx0XG5cbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgc2V0VGV4dHVyZTogKHNsb3QsIHVybCkgLT5cblxuICAgICAgICByZXMgPSBAbUVmZmVjdC5OZXdUZXh0dXJlIEBtQWN0aXZlRG9jLCBzbG90LCB1cmxcbiAgICAgICAgaWYgbm90IHJlcy5tRmFpbGVkXG4gICAgICAgICAgICBAbVBhc3NbQG1BY3RpdmVEb2NdLm1EaXJ0eSA9IHJlcy5tTmVlZHNTaGFkZXJDb21waWxlXG5cbiAgICBnZXRUZXh0dXJlOiAoc2xvdCkgLT5cbiAgICAgICAgQG1FZmZlY3QuR2V0VGV4dHVyZSggQG1BY3RpdmVEb2MsIHNsb3QgKVxuXG4gICAgc2V0U2hhZGVyRnJvbUVkaXRvcjogKGZvcmNlYWxsKSAtPlxuXG4gICAgICAgIGFueUVycm9ycyA9IGZhbHNlXG5cbiAgICAgICAgbnVtID0gQG1FZmZlY3QuR2V0TnVtUGFzc2VzKClcblxuICAgICAgICByZWNvbXBpbGVBbGwgPSBmYWxzZVxuICAgICAgICBmb3IgaSBpbiBbMC4uLm51bV1cbiAgICAgICAgICAgIGlmIEBtRWZmZWN0LkdldFBhc3NUeXBlKGkpID09ICdjb21tb24nIGFuZCAoQG1QYXNzW2ldLm1EaXJ0eSBvciBmb3JjZWFsbClcbiAgICAgICAgICAgICAgICByZWNvbXBpbGVBbGwgPSB0cnVlXG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICBmb3IgaiBpbiBbMC4uLjVdXG4gICAgICAgICAgICBmb3IgaSBpbiBbMC4uLm51bV1cbiAgICAgICAgICAgICAgICBpZiBqID09IDAgYW5kIEBtRWZmZWN0LkdldFBhc3NUeXBlKGkpICE9ICdjb21tb24nICAgdGhlbiBjb250aW51ZVxuICAgICAgICAgICAgICAgIGlmIGogPT0gMSBhbmQgQG1FZmZlY3QuR2V0UGFzc1R5cGUoaSkgIT0gJ2J1ZmZlcicgICB0aGVuIGNvbnRpbnVlXG4gICAgICAgICAgICAgICAgaWYgaiA9PSAyIGFuZCBAbUVmZmVjdC5HZXRQYXNzVHlwZShpKSAhPSAnY3ViZW1hcCcgIHRoZW4gY29udGludWVcbiAgICAgICAgICAgICAgICBpZiBqID09IDMgYW5kIEBtRWZmZWN0LkdldFBhc3NUeXBlKGkpICE9ICdpbWFnZScgICAgdGhlbiBjb250aW51ZVxuICAgICAgICAgICAgICAgIGlmIGogPT0gNCBhbmQgQG1FZmZlY3QuR2V0UGFzc1R5cGUoaSkgIT0gJ3NvdW5kJyAgICB0aGVuIGNvbnRpbnVlXG5cbiAgICAgICAgICAgICAgICBpZiByZWNvbXBpbGVBbGwgb3IgQG1QYXNzW2ldLm1EaXJ0eSBvciBmb3JjZWFsbFxuICAgICAgICAgICAgICAgICAgICBzaGFkZXJDb2RlID0gQG1QYXNzW2ldLm1Db2RlXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IEBtRWZmZWN0Lk5ld1NoYWRlciBzaGFkZXJDb2RlLCBpXG4gICAgICAgICAgICAgICAgICAgIGlmIHJlc3VsdFxuICAgICAgICAgICAgICAgICAgICAgICAgYW55RXJyb3JzID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBAbVBhc3NbaV0ubUVycm9yID0gcmVzdWx0XG4gICAgICAgICAgICAgICAgICAgIEBtUGFzc1tpXS5tRGlydHkgPSBmYWxzZVxuXG4gICAgICAgIEBsb2dFcnJvcnMgQG1QYXNzW0BtQWN0aXZlRG9jXS5tRXJyb3JcblxuICAgICAgICBpZiBub3QgYW55RXJyb3JzXG4gICAgICAgICAgICBpZiBub3QgQG1Jc1JlbmRlcmluZ1xuICAgICAgICAgICAgICAgIGdUb3kuc3RhcnRSZW5kZXJpbmcoKVxuICAgICAgICAgICAgQG1Gb3JjZUZyYW1lID0gdHJ1ZVxuXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAgICAgIDAwICBcbiAgICBcbiAgICBsb2FkTmV3OiAtPlxuICAgICAgICBwYXNzZXMgPSBbe1xuICAgICAgICAgICAgaW5wdXRzOiAgW11cbiAgICAgICAgICAgIG91dHB1dHM6IFsge2NoYW5uZWw6MCwgaWQ6XCI0ZGZHUnJcIiB9IF1cbiAgICAgICAgICAgIHR5cGU6ICAgICdpbWFnZSdcbiAgICAgICAgICAgIGNvZGU6IFwiXCJcIlxuICAgICAgICAgICAgICAgIHZvaWQgbWFpbkltYWdlKCBvdXQgdmVjNCBmcmFnQ29sb3IsIGluIHZlYzIgZnJhZ0Nvb3JkIClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHZlYzIgdXYgPSBmcmFnQ29vcmQvaVJlc29sdXRpb24ueHk7XG4gICAgICAgICAgICAgICAgICAgIHZlYzMgY29sID0gMC4xNSArIDAuMTUqY29zKDAuMSppVGltZSt1di54eXgrdmVjMygwLDIsNCkpO1xuICAgICAgICAgICAgICAgICAgICBmcmFnQ29sb3IgPSB2ZWM0KGNvbCwxLjApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcIlwiXCJcbiAgICAgICAgfV1cbiAgICAgICAgXG4gICAgICAgIHJlcyA9IEBtRWZmZWN0Lm5ld1NjcmlwdEpTT04gcGFzc2VzXG4gICAgICAgIFxuICAgICAgICBAbVBhc3MgPSBbXVxuICAgICAgICBcbiAgICAgICAgZm9yIGkgaW4gWzAuLi5yZXMubGVuZ3RoXVxuICAgICAgICAgICAgQG1QYXNzW2ldID0gXG4gICAgICAgICAgICAgICAgbUNvZGU6ICAgcmVzW2ldLm1TaGFkZXJcbiAgICAgICAgICAgICAgICBtRmFpbGVkOiByZXNbaV0ubUZhaWxlZFxuICAgICAgICAgICAgICAgIG1FcnJvcjogIHJlc1tpXS5tRXJyb3JcbiAgICAgICAgICAgICAgICBtRGlydHk6ICBmYWxzZVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAbG9nRXJyb3JzIEBtUGFzc1swXS5tRXJyb3JcbiAgICAgICAgQHN0YXJ0UmVuZGVyaW5nKClcbiAgICAgICAgXG4gICAgQHJlc2l6ZTogLT4gQGluc3RhbmNlLnJlc2l6ZSgpXG4gICAgQGluaXQ6ICAgLT4gQGluc3RhbmNlID0gbmV3IFRveSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCAnZ2xDYW52YXMnXG4iXX0=
//# sourceURL=../coffee/toy.coffee