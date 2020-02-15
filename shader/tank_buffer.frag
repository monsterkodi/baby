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

#define MAX_STEPS  32
#define MIN_DIST   0.005
#define MAX_DIST   100.0

#define NONE    0
#define TANK    2
#define BULLET  6

// 00000000  000       0000000    0000000   00000000   
// 000       000      000   000  000   000  000   000  
// 000000    000      000   000  000   000  0000000    
// 000       000      000   000  000   000  000   000  
// 000       0000000   0000000    0000000   000   000  

float floorDist()
{
    float d = floorSinus(); 
    
    vec3  fpos = floor(mod(sdf.pos, 256.0));
    vec3  frct = fract(sdf.pos);
    ivec2 ipos = ivec2(fpos.xz);
    
    float sx = frct.x>=0.5?1.0:-1.0;
    float sz = frct.z>=0.5?1.0:-1.0;
    
    vec4  p0 = load2(ipos.x, ipos.y);
    vec4  px = load2((ipos.x + int(sx)) % 256, ipos.y);    
    vec4  pz = load2(ipos.x, (ipos.y + int(sz)) % 256);
    
    float hx = mix(p0.w, px.w, abs(frct.x-0.5)*2.0);
    float hz = mix(p0.w, pz.w, abs(frct.z-0.5)*2.0);
    float ph = mix(hx, hz, 0.5);
    
    d -= ph;
    
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

Tank loadTank(int id)
{
    Tank t;
    int i = id+1;
    t.mat    = int(load2(i, 0).x);
    t.pos    = load2(i, 1).xyz;
    t.up     = load2(i, 2).xyz;
    t.dir    = load2(i, 3).xyz;
    t.rgt    = load2(i, 4).xyz;
    t.vel    = load2(i, 5).xyz;
    t.turret = load2(i, 6).xyz;
    t.track  = load2(i, 7).xy;
    return t;
}

Bullet loadBullet(int id)
{
    Bullet b;
    int i = id+3;
    b.mat    = int(load2(i, 0).x);
    b.pos    = load2(i, 1).xyz;
    b.dir    = load2(i, 2).xyz;
    return b;
}

//  0000000   0000000   000   000  00000000  
// 000       000   000  000   000  000       
// 0000000   000000000   000 000   0000000   
//      000  000   000     000     000       
// 0000000   000   000      0      00000000  

void saveTank(int id, Tank t)
{
    int i = id+1;
    save2(i, 0, vec4(float(t.mat)));
    save2(i, 1, vec4(t.pos,   0));
    save2(i, 2, vec4(t.up,    0));
    save2(i, 3, vec4(t.dir,   0));
    save2(i, 4, vec4(t.rgt,   0));
    save2(i, 5, vec4(t.vel,   0));
    save2(i, 6, vec4(t.turret,0));
    save2(i, 7, vec4(t.track, 0,0));
}

void saveBullet(int id, Bullet b)
{
    int i = id+3;
    save2(i, 0, vec4(float(b.mat)));
    save2(i, 1, vec4(b.pos, 0));
    save2(i, 2, vec4(b.dir, 0));
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
   t.pos    = vec3(id*7,2,0);
   t.dir    = vx;
   t.up     = vy;
   t.rgt    = vz;
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
    vec3 acc, vel;
    
    for (int i = ZERO; i < 2; i++) 
    {
        if (i == id) continue;
        Tank to = loadTank(i);
        acc += repulse(t.pos, to.pos, 5.0, 100.0);
	}
    
    float td = iTimeDelta*60.0;
    
    if (iMouse.z > 0.0)
    {
        // acc += attract(t.pos, v0, 3.0, 3.0, 6.0, 9.0);
    }
    
    if (id == 0)
    {
        float accel = 10.0*td;
        acc += keyDown(KEY_UP)   ? t.dir* accel : v0;
        acc += keyDown(KEY_DOWN) ? t.dir*-0.5*accel : v0;
        
        float rotSpeed = 4.0*td;
        t.dir = rotAxisAngle(t.dir, t.up, keyDown(KEY_LEFT) ? -rotSpeed : keyDown(KEY_RIGHT) ? rotSpeed : 0.0);        
        t.dir = normalize(t.dir);
    }
    
    t.vel += acc*SPEED;
    t.vel *= pow(DAMP, SPEED);
    
    vec3 oldPosR = t.pos + 1.3*t.rgt;
    vec3 oldPosL = t.pos - 1.3*t.rgt;
    
    t.pos += t.vel*SPEED;
    t.pos -= floorHeight(t.pos, t.up)*vy; // this sets up
    
    t.rgt = normalize(cross(t.dir, t.up));
    t.dir = normalize(cross(t.up, t.rgt));
    
    vec3 deltaR = (t.pos + 1.3*t.rgt)-oldPosR;
    vec3 deltaL = (t.pos - 1.3*t.rgt)-oldPosL;
    float dr = length(deltaR);
    float dl = length(deltaL);
    if (dl > EPS)
    {
        t.track.x = fract(t.track.x-dot(normalize(deltaL), t.dir)*dl);
    }
    if (dr > EPS)
    {
        t.track.y = fract(t.track.y-dot(normalize(deltaR), t.dir)*dr);
    }
    
    t.turret = normalize(mix(t.turret, t.dir, 0.1))*(0.75+0.25*smoothstep(0.0, 3.0, length(t.vel)));
    
    tanks[id] = t;
    saveTank(id, t);
}

// 000   000   0000000   000      00000000  
// 000   000  000   000  000      000       
// 000000000  000   000  000      0000000   
// 000   000  000   000  000      000       
// 000   000   0000000   0000000  00000000  

void calcHole(int x, int y)
{
    vec4 h = load2(x,y);
    save2(x, y, h);
}

void initHole(int x, int y)
{
    vec4 h1 = vec4(normalize(vec3(-cos(float(x)*0.2), 1, 0)), 2.0*sin(float(x)*0.2));
    vec4 h2 = vec4(normalize(vec3(0, 1, -cos(float(y)*0.5))), 1.0*sin(float(y)*0.5));
    vec4 h = mix(h1, h2, 0.5);
    save2(x, y, h);
}

//  0000000  000   000   0000000    0000000   000000000  
// 000       000   000  000   000  000   000     000     
// 0000000   000000000  000   000  000   000     000     
//      000  000   000  000   000  000   000     000     
// 0000000   000   000   0000000    0000000      000     

vec3 muzzleTip(Tank t)
{
    return t.pos + 2.09*t.up + t.turret*2.8;
}

void shoot(int id, inout Bullet b)
{
    Tank t = loadTank(id);
    b.mat = BULLET+id;
    b.pos = muzzleTip(t);
    b.dir = t.turret;
}

void calcBullet(int id)
{
    Bullet b = loadBullet(id);
    
    if (id == 0 && keyDown(KEY_SPACE) && b.mat == NONE)  
    {
        shoot(id, b);
    }

    Tank t = tanks[id];
    
    if (b.mat != NONE)
    {
        float td = iTimeDelta*60.0;
        b.pos += b.dir*td;
        b.dir -= 0.01*vy*td;
        sdf.pos = b.pos;
        if (floorSinus() < 0.0)
        {
            b.mat = NONE;
            b.pos = muzzleTip(t);
        }
    }
    else
    {
        b.pos = muzzleTip(t);
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

    ivec2 mem = ivec2(fragCoord);
    int id = mem.x;
    
    if (iFrame < 30)
    {
        if (id == 0 && mem.y == 0)
        {
            save(0,vec4(30.1,0,0,0));
        }
        else
        {
            if (id >= 1 && id <= 2 && mem.y < 8)
            {
                initTank(id-1);
            }
            else if (id >= 3 && id <= 4 && mem.y < 3)
            {
                initBullet(id-3);
            }
            else
            {
                initHole(mem.x, mem.y);
            }
        }
        
        fragColor = gl.color;
        return;
    }

    if (id == 0 && mem.y == 0)
    {
        save(id,vec4(load(0).x+0.1,0,0,0));
    }
    else
    {
        if (id >= 1 && id <= 2 && mem.y < 8)
        {
            calcTank(id-1);
        }
        else if (id >= 3 && id <= 4 && mem.y < 3)
        {
            calcTank(id-3);
            calcBullet(id-3);
        }
        else
        {
            calcHole(mem.x, mem.y);
        }
    }
    
    fragColor = gl.color;
}