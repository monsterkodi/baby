#define keys(x,y)  texelFetch(iChannel0, ivec2(x,y), 0)
#define load(x)    texelFetch(iChannel1, ivec2((x),0), 0)
#define load2(x,y) texelFetch(iChannel1, ivec2((x),(y)), 0)
#define save(a,c)    if((gl.ifrag.x==(a))&&(gl.ifrag.y==0)){gl.color=(c);}
#define save2(a,b,c) if((gl.ifrag.x==(a))&&(gl.ifrag.y==(b))){gl.color=(c);}
bool keyState(int key) { return keys(key, 2).x < 0.5; }
bool keyDown(int key)  { return keys(key, 0).x > 0.5; }

int  id = -1;
int  num = 0;

#define SPEED    0.05
#define DAMP     0.5

vec2 hash(int n) { return fract(sin(vec2(float(n),float(n)*7.))*43758.5); }

vec3 attract(vec3 tankpos, vec3 target, float dist, float a, float s2, float s3)
{
    vec3  w = target-tankpos;
    float x = length(w);
    float k = dist+s2;
    float d = (2.0*dist+s2)*0.5;
    float xkd = (x-d)/(k-d);
    float l = min(max(-1.0, -abs(x-d)/(k-d)), xkd*exp(1.0+xkd));
    float r = max(-1.0, xkd*exp(1.0-xkd)-max(0.0,(1.0-s3)*(1.0-exp(1.0-x/k))));
    float f = a*max(r,l)*0.5+0.5;
    return w*f;
}

vec3 repulse(vec3 tankpos, vec3 target, float dist, float a)
{
    vec3 w = target-tankpos;
    float x = length(w);
    if (x < EPS) return a*0.5*(hash31(float(id))-vec3(0.5)).xyz;
    return w*a*(smoothstep(0.0, dist, x)-1.0)/x;
}

Tank loadTank(int i)
{
    Tank t;
    t.pos    = load2(i, 1).xyz;
    t.up     = load2(i, 2).xyz;
    t.dir    = load2(i, 3).xyz;
    t.vel    = load2(i, 4).xyz;
    t.turret = load2(i, 5).xyz;
    t.track  = load2(i, 6).xy;
    return t;
}

void saveTank(int i, Tank t)
{
    save2(i, 1, vec4(t.pos,   0));
    save2(i, 2, vec4(t.up,    0));
    save2(i, 3, vec4(t.dir,   0));
    save2(i, 4, vec4(t.vel,   0));
    save2(i, 5, vec4(t.turret,0));
    save2(i, 6, vec4(t.track, 0,0));
}

void tank()
{
    Tank t = loadTank(id);
    
    float d, v, a;
    vec3 acc, vel, w;
    
    /*
    for (int i = 1; i <= num; i++) 
    {
        if (i == id) continue;
        Tank to = loadTank(i);
        acc += repulse(t.pos, to.pos, 0.55, 4.0);
	}

    acc += attract(t.pos, v0, 5.0, 0.9, 0.2, 0.1);
    acc += repulse(t.pos, v0, 15.5, 10.0);
    */
    
    if (id == 1)
    {
        acc += keyDown(KEY_UP)   ? t.dir* 10.0 : v0;
        acc += keyDown(KEY_DOWN) ? t.dir*-10.0 : v0;
    }
    
    t.vel += acc*SPEED;
    t.vel *= pow(DAMP, SPEED);
    
    w = t.pos+t.vel*SPEED;
    
    t.pos.x  = clamp(w.x, -20.0, 20.0);
    t.pos.y  = 0.0;
    t.pos.z  = clamp(w.z, -20.0, 20.0);
    
    saveTank(id, t);
}

void initTank(int i)
{
   Tank t;
   t.pos    = vec3(5,2,5);
   t.dir    = vx;
   t.up     = vy;
   t.turret = vx;
   t.track = vec2(0);
   saveTank(i, t);
}

// 00     00   0000000   000  000   000  
// 000   000  000   000  000  0000  000  
// 000000000  000000000  000  000 0 000  
// 000 0 000  000   000  000  000  0000  
// 000   000  000   000  000  000   000  

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    initGlobal(fragCoord, iResolution, iMouse, iTime);
    
    if (iFrame < 10)
    {
        save(0,vec4(2,0,0,0));
        initTank(1);
        initTank(2);
        fragColor = gl.color;
        return;
    }

    ivec2 mem = ivec2(fragCoord);
    id = mem.x;

	num = int(load(0).x);
    
    if (id == 0 && mem.y == 0)
    {
        save(id,vec4(3,0,0,0));
    }
    else if (id > 0 && id <= num) // && mem.y < 7)
    {
        tank();
    }
    else
    {
        return;
    }
    
    fragColor = gl.color;
}