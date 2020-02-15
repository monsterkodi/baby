#define keys(x,y)  texelFetch(iChannel0, ivec2(x,y), 0)
#define load(x)    texelFetch(iChannel1, ivec2(x,0), 0)
#define load2(x,y) texelFetch(iChannel1, ivec2(x,y), 0)
bool keyState(int key) { return keys(key, 2).x < 0.5; }
bool keyDown(int key)  { return keys(key, 0).x > 0.5; }

#define ZERO min(iFrame,0)
#define CAM_DIST   6.0
#define MAX_STEPS  128
#define MIN_DIST   0.001
#define MAX_DIST   200.0

#define NONE   0
#define FLOOR  1
#define TANK1  2
#define TANK2  4
#define NMAT   5
#define GLOW   100

Mat[NMAT] material = Mat[NMAT](
    //  hue   sat  lum    shiny  glossy
    Mat(0.5,  0.0,  1.0,   0.0,   1.0 ),
    Mat(0.0,  1.0,  0.6,   0.1,   0.7 ), // TANK1
    Mat(0.0,  1.0,  0.6,   0.1,   0.2 ),
    Mat(0.6,  1.0,  0.6,   0.1,   0.7 ), // TANK2
    Mat(0.6,  1.0,  0.6,   0.1,   0.2 )
);

bool space, anim, soft, occl, light, dither, foggy, rotate, normal, depthb;

float hash(float n) { return fract(cos(n)*45758.5453); }
mat2  rot2(float a) { vec2 v = sin(vec2(1.570796, 0) + a); return mat2(v, -v.y, v.x); }

float at;

// 000000000   0000000   000   000  000   000  
//    000     000   000  0000  000  000  000   
//    000     000000000  000 0 000  0000000    
//    000     000   000  000  0000  000  000   
//    000     000   000  000   000  000   000  

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

void renderTank(int id)
{
    Tank t  = tanks[id];
    vec3 p  = t.pos + 1.39*t.up;
    
    float d = sdHalfSphere(p, t.up, 1.5, 0.4);
    
    if (d > sdf.dist+1.5) return;
    
    p += 0.7*t.up;
    vec3 tt = t.turret;
    
    d = opUnion(d, sdCapsule(p, p+tt*2.5, 0.3), 0.02);
    d = opUnion(d, sdHalfSphere(p+tt*2.8, -tt, 0.7, 0.1), 0.1);
    d = opDiff (d, sdCapsule(p+tt, p+tt*3.5, 0.15), 0.2);
    sdMat(t.mat, d);
    sdMat(t.mat+1, sdLink(t.pos-t.dir*0.5+0.9*t.up+1.3*t.rgt, t.pos+t.dir*0.5+0.9*t.up+1.3*t.rgt, t.rgt, vec3(0.7, 0.3, 0.2), -1.0));
    sdMat(t.mat+1, sdLink(t.pos-t.dir*0.5+0.9*t.up-1.3*t.rgt, t.pos+t.dir*0.5+0.9*t.up-1.3*t.rgt, t.rgt, vec3(0.7, 0.3, 0.2),  1.0));
}

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
    
    if (cam.pos.y > 0.0) sdMat(FLOOR, d);
    return d;
}
 
// 00     00   0000000   00000000   
// 000   000  000   000  000   000  
// 000000000  000000000  00000000   
// 000 0 000  000   000  000        
// 000   000  000   000  000        

float map(vec3 p)
{
    sdf = SDF(MAX_DIST, p, NONE);
    
    floorDist();
        
    for (int id = ZERO; id < 2; id++)
        renderTank(id);
        
    if (false && gl.march) { 
        sdMat(GLOW, sdSphere(gl.light3, 0.1));
        sdMat(GLOW, sdSphere(gl.light2, 0.1));
        sdMat(GLOW, sdSphere(gl.light1, 0.1));
    }
    if (gl.march) { 
        sdMat(GLOW, sdSphere(bullets[0].pos, 0.5));
        sdMat(GLOW, sdSphere(bullets[1].pos, 0.5));
    }
    return sdf.dist;
}

// 00     00   0000000   00000000    0000000  000   000  
// 000   000  000   000  000   000  000       000   000  
// 000000000  000000000  0000000    000       000000000  
// 000 0 000  000   000  000   000  000       000   000  
// 000   000  000   000  000   000   0000000  000   000  

float march(in vec3 ro, in vec3 rd)
{
    float t = 0.0, d;
    for(int i = ZERO; i < MAX_STEPS; i++)
    {
        vec3 p = ro+rd*t;
        gl.rd = rd;
        d = map(p);
        t += d;
        if (d < MIN_DIST) return t;
        if (t > MAX_DIST) break;
    }
    sdf.mat = NONE;
    return min(t, MAX_DIST);
}

vec3 getNormal(vec3 p)
{
    vec3 n = v0;
    for (int i=ZERO; i<4; i++) {
        vec3 e = 0.5773*(2.0*vec3((((i+3)>>1)&1),((i>>1)&1),(i&1))-1.0);
        n += e*map(p+e*0.0001); }
    return normalize(n);
}

//  0000000   00     00  0000000    000  00000000  000   000  000000000    
// 000   000  000   000  000   000  000  000       0000  000     000       
// 000000000  000000000  0000000    000  0000000   000 0 000     000       
// 000   000  000 0 000  000   000  000  000       000  0000     000       
// 000   000  000   000  0000000    000  00000000  000   000     000       

float getOcclusion(vec3 p, vec3 n)
{
    if (!occl) return 1.0;
    float a = 0.0;
    float weight = 1.0;
    for (int i = ZERO; i <= 6; i++)
    {
        float d = (float(i) / 6.0) * 0.3;
        a += weight * (d - map(p + n*d));
        weight *= 0.8;
    }
    float f = clamp01(1.0-a);
    return f*f;
}

//  0000000  000   000   0000000   0000000     0000000   000   000  
// 000       000   000  000   000  000   000  000   000  000 0 000  
// 0000000   000000000  000000000  000   000  000   000  000000000  
//      000  000   000  000   000  000   000  000   000  000   000  
// 0000000   000   000  000   000  0000000     0000000   00     00  

float softShadow(vec3 ro, vec3 lp, float k)
{
    float shade = 1.0;
    float dist = MIN_DIST;    
    vec3 rd = (lp-ro);
    float end = max(length(rd), MIN_DIST);
    float stepDist = end/25.0;
    rd /= end;
    for (int i = ZERO; i < 25; i++)
    {
        float h = map(ro+rd*dist);
        shade = min(shade, k*h/dist);
        dist += clamp(h, 0.02, stepDist);
        if (h < 0.0 || dist > end) break; 
    }
    return min(max(shade, 0.0)+gl.shadow, 1.0); 
}

// 000      000   0000000   000   000  000000000  
// 000      000  000        000   000     000     
// 000      000  000  0000  000000000     000     
// 000      000  000   000  000   000     000     
// 0000000  000   0000000   000   000     000     

vec3 getLight(vec3 p, vec3 n, int mat, float d)
{
    if (mat == NONE) return vec3(0.5);
    if (mat == GLOW) return white;
    
    Mat m = material[mat-1];

    vec3 bn = dither ? bumpMap(p, n, 0.005) : n;

    vec3  col = hsl(m.hue, m.sat, m.lum);
    
    if (mat == TANK2+1 || mat == TANK1+1)
    {
        float ts = tanks[mat/2-1].track[gl.tuv.z > 0.0 ? 0 : 1];
        float ss = sin(TAU*fract(gl.tuv.x+ts)*3.0)*gl.tuv.y;
        bn = normalize(bn+vec3(ss,0,0));
        col *= 1.0+ss*0.5;
    }
    else if (mat == FLOOR)
    {
        col *= 1.0+p.y*0.2;
    }
    
    float dl1 = dot(bn,normalize(gl.light1-p));
    float dl2 = dot(bn,normalize(gl.light2-p));
    // float dl3 = dot(bn,normalize(gl.light3-p));
    float dl3 = 0.5*dot(bn,vy); //directional
    float dnl = max(max(dl1, dl2), dl3);
    float dsl = mix(dnl, clamp01(dl1 + dl2 + dl3), 0.5);
    
    col  = (light) ? gray(col) : col;
    
    col += pow(m.glossy, 3.0)*vec3(pow(smoothstep(0.0+m.glossy*0.9, 1.0, dsl), 1.0+40.0*m.glossy));
    col *= clamp(pow(dnl, 1.0+m.shiny*20.0), gl.ambient, 1.0) * getOcclusion(p, n);
    col *= softShadow(p, vec3(p.x,gl.light3.y,p.z), 5.0); 

    return clamp01(col);
}

// 00     00   0000000   000  000   000  
// 000   000  000   000  000  0000  000  
// 000000000  000000000  000  000 0 000  
// 000 0 000  000   000  000  000  0000  
// 000   000  000   000  000  000   000  

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    initGlobal(fragCoord, iResolution, iMouse, iTime);
    gl.zero = ZERO;
    gl.shadow = 0.5;
    gl.ambient = 0.25;
    for (int i = KEY_1; i <= KEY_9; i++) { if (keyDown(i)) { gl.option = i-KEY_1+1; break; } }
    
    rotate =  keyState(KEY_R);
    anim   =  keyState(KEY_P);
    occl   =  keyState(KEY_O);
    dither =  keyState(KEY_G);
    normal = !keyState(KEY_X);
    depthb = !keyState(KEY_Z);
    light  = !keyState(KEY_L);
    space  = !keyState(KEY_T);
    foggy  =  keyState(KEY_F);
    
    if (anim) at = 0.9*iTime;
    
    initCam(CAM_DIST, vec2(0));
    
    lookAtFrom(load2(0,1).xyz, load2(0,2).xyz);

    #ifndef TOY
    if (space) lookAtFrom(iCenter, iCamera);
    #endif
    
    gl.uv = (2.0*fragCoord-iResolution.xy)/iResolution.y;
    vec3 rd = normalize(gl.uv.x*cam.x + gl.uv.y*cam.up + cam.fov*cam.dir);
    
    for (int i = ZERO; i < 2; i++)
    {
        tanks[i]   = loadTank(i);
        bullets[i] = loadBullet(i);        
    }
    
    gl.light1 = bullets[0].pos;
    gl.light2 = bullets[1].pos;
    gl.light3 = vy*10.0;
    
    gl.march = true;
    float d = march(cam.pos, rd);
    gl.march = false;
    int mat = sdf.mat;
    
    vec3  p = cam.pos + d * rd;
    vec3  n = getNormal(p);
    vec3  col = v0;
           
    if (normal || depthb)
    {
        vec3 nc = normal ? d >= MAX_DIST ? black : n : white;
        vec3 zc = depthb ? vec3(1.0-pow(d/MAX_DIST,0.1)) : white;
        col = nc*zc;
    }
    else
    {
        col = getLight(p, n, mat, d);
        if (foggy) col = mix(col, vec3(0.5), smoothstep(MAX_DIST*0.8, MAX_DIST*0.95, d));
    }
        
    #ifndef TOY
    if (false)
    {
        col += vec3(print(0,0,vec3(iFrameRate, iTime, bullets[0].mat)));
        col += vec3(print(0,2,tanks[0].vel));
        col += vec3(print(0,1,tanks[1].vel));
    }
    else
    {
        if (gl.frag.x < 256.0 && gl.frag.y < 256.0)
        {
            vec4 h = load2(int(gl.frag.x), int(gl.frag.y));
            col = vec3(h.w * 0.25 + 0.5);
        }
    }
    #endif  
    
    fragColor = postProc(col, dither, true, true);
}