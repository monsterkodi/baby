#define keys(x,y)  texelFetch(iChannel0, ivec2(x,y), 0)
#define load(x)    texelFetch(iChannel1, ivec2((x),0), 0)
#define load2(x,y) texelFetch(iChannel1, ivec2((x),(y)), 0)
#define save(a,c)    if((gl.ifrag.x==(a))&&(gl.ifrag.y==0)){gl.color=(c);}
#define save2(a,b,c) if((gl.ifrag.x==(a))&&(gl.ifrag.y==(b))){gl.color=(c);}
bool keyState(int key) { return keys(key, 2).x < 0.5; }
bool keyDown(int key)  { return keys(key, 0).x > 0.5; }

#define ZERO min(iFrame,0)
#define SPEED    0.05
#define DAMP     0.5

#define MAX_STEPS  128
#define MIN_DIST   0.005
#define MAX_DIST   100.0

#define NONE    0
#define TANK    1
#define BULLET  5

// 00000000  000       0000000    0000000   00000000   
// 000       000      000   000  000   000  000   000  
// 000000    000      000   000  000   000  0000000    
// 000       000      000   000  000   000  000   000  
// 000       0000000   0000000    0000000   000   000  

float floorDist()
{
    float d = sdPlane(vec3(0,0,0), vy);
    d = opDiff(d, sdSphere(vx*2.0+vy*2.0, 4.0), 1.5);
    return d;
}

vec3 floorNormal(vec3 p)
{
    vec3 n = v0;
    for (int i=ZERO; i<4; i++) {
        vec3 e = 0.5773*(2.0*vec3((((i+3)>>1)&1),((i>>1)&1),(i&1))-1.0);
        sdf.pos = p+e*0.0001;
        n += e*floorDist(); }
    return normalize(n);
}

float floorHeight(vec3 p, out vec3 n)
{
    float t = 0.0, d;
    sdf = SDF(MAX_DIST, p, NONE);
    for (int i = ZERO; i < MAX_STEPS; i++)
    {
        sdf.pos = p-vy*t;
        d = floorDist();
        t += d;
        if (d < MIN_DIST) 
        {
            n = floorNormal(sdf.pos);
            return t;
        }
        if (t > MAX_DIST) break;
    }
    return min(t, MAX_DIST);
}

//  0000000   000000000  000000000  00000000    0000000    0000000  000000000  
// 000   000     000        000     000   000  000   000  000          000     
// 000000000     000        000     0000000    000000000  000          000     
// 000   000     000        000     000   000  000   000  000          000     
// 000   000     000        000     000   000  000   000   0000000     000     

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

// 00000000   00000000  00000000   000   000  000       0000000  00000000  
// 000   000  000       000   000  000   000  000      000       000       
// 0000000    0000000   00000000   000   000  000      0000000   0000000   
// 000   000  000       000        000   000  000           000  000       
// 000   000  00000000  000         0000000   0000000  0000000   00000000  

vec3 repulse(vec3 tankpos, vec3 target, float dist, float a)
{
    vec3 w = target-tankpos;
    float x = length(w);
    if (x < EPS) return a*0.5*(hash31(dot(tankpos, target))-vec3(0.5));
    return w*a*(smoothstep(0.0, dist, x)-1.0)/x;
}

/*
000000000   0000000   000   000  000   000  
   000     000   000  0000  000  000  000   
   000     000000000  000 0 000  0000000    
   000     000   000  000  0000  000  000   
   000     000   000  000   000  000   000  
*/

// 000       0000000    0000000   0000000    
// 000      000   000  000   000  000   000  
// 000      000   000  000000000  000   000  
// 000      000   000  000   000  000   000  
// 0000000   0000000   000   000  0000000    

Tank loadTank(int i)
{
    Tank t;
    t.mat    = int(load2(i, 0).x);
    t.pos    = load2(i, 1).xyz;
    t.up     = load2(i, 2).xyz;
    t.dir    = load2(i, 3).xyz;
    t.vel    = load2(i, 4).xyz;
    t.turret = load2(i, 5).xyz;
    t.track  = load2(i, 6).xy;
    return t;
}

Bullet loadBullet(int i)
{
    Bullet b;
    b.mat    = int(load2(i+2, 0).x);
    b.pos    = load2(i+2, 1).xyz;
    b.dir    = load2(i+2, 2).xyz;
    return b;
}

//  0000000   0000000   000   000  00000000  
// 000       000   000  000   000  000       
// 0000000   000000000   000 000   0000000   
//      000  000   000     000     000       
// 0000000   000   000      0      00000000  

void saveTank(int i, Tank t)
{
    save2(i, 0, vec4(float(t.mat)));
    save2(i, 1, vec4(t.pos,   0));
    save2(i, 2, vec4(t.up,    0));
    save2(i, 3, vec4(t.dir,   0));
    save2(i, 4, vec4(t.vel,   0));
    save2(i, 5, vec4(t.turret,0));
    save2(i, 6, vec4(t.track, 0,0));
}

void saveBullet(int i, Bullet b)
{
    save2(i+2, 0, vec4(float(b.mat)));
    save2(i+2, 1, vec4(b.pos, 0));
    save2(i+2, 2, vec4(b.dir, 0));
}

// 000  000   000  000  000000000  
// 000  0000  000  000     000     
// 000  000 0 000  000     000     
// 000  000  0000  000     000     
// 000  000   000  000     000     

void initTank(int id)
{
   Tank t;
   t.mat    = TANK+id*2;
   t.pos    = vec3(id*5,2,0);
   t.dir    = vx;
   t.up     = vy;
   t.turret = vx;
   t.track  = vec2(0);
   saveTank(id, t);
}

void initBullet(int id)
{
   Bullet b;
   b.mat    = NONE;
   b.pos    = vy*2.2;
   b.dir    = vx;
   saveBullet(id, b);
}

//  0000000   0000000   000       0000000  
// 000       000   000  000      000       
// 000       000000000  000      000       
// 000       000   000  000      000       
//  0000000  000   000  0000000   0000000  

void calcTank(int id)
{
    Tank t = loadTank(id);
    
    float d, v, a;
    vec3 acc, vel, w;
    
    for (int i = 1; i <= 2; i++) 
    {
        if (i == id) continue;
        Tank to = loadTank(i);
        acc += repulse(t.pos, to.pos, 5.0, 100.0);
	}
    
    if (iMouse.z > 0.0)
    {
        acc += attract(t.pos, v0, 3.0, 3.0, 6.0, 9.0);
    }
    
    if (id == 1)
    {
        float accel = 40.0;
        acc += keyDown(KEY_UP)   ? t.dir* accel : v0;
        acc += keyDown(KEY_DOWN) ? t.dir*-0.5*accel : v0;
        
        float rotSpeed = 4.0;
        t.dir = rotAxisAngle(t.dir, t.up, keyDown(KEY_LEFT) ? -rotSpeed : keyDown(KEY_RIGHT) ? rotSpeed : 0.0);        
        t.dir = normalize(t.dir);
    }
    else 
    {
        t.track = vec2(1,-1);
        t.dir = normalize(mix(t.dir, t.vel, 0.02));
    }
    
    t.vel += acc*SPEED;
    t.vel *= pow(DAMP, SPEED);
    t.vel = mix(t.vel, t.dir, 0.1);
    
    w = t.pos+t.vel*SPEED;
    
    t.pos = vec3(clamp(w.x, -20.0, 20.0), 0.0, clamp(w.z, -20.0, 20.0));
    
    t.pos -= floorHeight(t.pos, t.up)*vy;
    
    t.track.x = dot(t.vel, t.dir)*length(t.vel);
    t.track.y = dot(t.vel, t.dir)*length(t.vel);
    
    saveTank(id, t);
}

//  0000000  000   000   0000000    0000000   000000000  
// 000       000   000  000   000  000   000     000     
// 0000000   000000000  000   000  000   000     000     
//      000  000   000  000   000  000   000     000     
// 0000000   000   000   0000000    0000000      000     

void shoot(int id, inout Bullet b)
{
    Tank t = loadTank(id);
    b.mat = BULLET+id;
    b.pos = t.pos+t.up*2.0+t.turret*3.0;
    b.dir = t.turret;
}

void calcBullet(int id)
{
    Bullet b = loadBullet(id);
    
    if (keyDown(KEY_SPACE) && b.mat == NONE)  
    {
        shoot(id, b);
    }
    
    b.pos += b.dir*0.1;
    b.pos -= 0.01*vy;
    
    if (b.pos.y < 0.0)
    {
        b.mat == NONE;
    }
    saveBullet(id, b);
}

// 00     00   0000000   000  000   000  
// 000   000  000   000  000  0000  000  
// 000000000  000000000  000  000 0 000  
// 000 0 000  000   000  000  000  0000  
// 000   000  000   000  000  000   000  

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    initGlobal(fragCoord, iResolution, iMouse, iTime);
    
    if (iFrame < 30)
    {
        save(0,vec4(30.1,0,0,0));
        initTank(1);
        initTank(2);
        initBullet(1);
        initBullet(2);
        fragColor = gl.color;
        return;
    }

    ivec2 mem = ivec2(fragCoord);
    int id = mem.x;

    if (id == 0 && mem.y == 0)
    {
        save(id,vec4(load(0).x+0.1,0,0,0));
    }
    else if (mem.y < 7)
    {
        if (id >= 1 && id <= 2)
        {
            calcTank(id);
        }
        else if (id >= 3 && id <= 4)
        {
            calcBullet(id-2);
        }
        else
        {
            return;
        }
    }
    else
    {
        return;
    }
    
    fragColor = gl.color;
}