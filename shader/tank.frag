#define keys(x,y)  texelFetch(iChannel0, ivec2(x,y), 0)
#define load(x)    texelFetch(iChannel1, ivec2(x,0), 0)
#define load2(x,y) texelFetch(iChannel1, ivec2(x,y), 0)
bool keyState(int key) { return keys(key, 2).x < 0.5; }
bool keyDown(int key)  { return keys(key, 0).x > 0.5; }

#define ZERO min(iFrame,0)
#define CAM_DIST   6.0
#define MAX_STEPS  256
#define MIN_DIST   0.001
#define MAX_DIST   100.0

#define NONE   0
#define FLOOR  1
#define TANK1  2
#define TANK2  4
#define NMAT   5
#define GLOW   100

Mat[NMAT] material = Mat[NMAT](
    //  hue   sat  lum    shiny  glossy
    Mat(0.5,  1.0,  1.0,   0.0,   0.0 ),
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

Tank[2] tanks;

Tank loadTank(int id)
{
    Tank t;
    t.pos    = load2(id, 1).xyz;
    t.up     = load2(id, 2).xyz;
    t.dir    = load2(id, 3).xyz;
    t.vel    = load2(id, 4).xyz;
    t.turret = load2(id, 5).xyz;
    t.track  = load2(id, 6).xy;
    return t;
}

void tank(int i)
{
    Tank t = tanks[i];
    vec3 p = t.pos + 1.39*t.up;
    vec3 tr = normalize(cross(t.up, t.dir));
    vec3 td = normalize(cross(t.up, tr));
    
    float d = sdHalfSphere(p, t.up, 1.5, 0.4);
    
    if (d > sdf.dist+1.5) return;
    
    p += 0.7*t.up;
    vec3 tt = t.turret;
    if (dot(tt, t.up) < 0.0) tt = normalize(posOnPlane(p+tt, p, t.up)-p);
    d = opUnion(d, sdCapsule(p, p+tt*2.5, 0.3), 0.02);
    d = opUnion(d, sdHalfSphere(p+tt*2.8, -tt, 0.7, 0.1), 0.1);
    d = opDiff (d, sdCapsule(p+tt, p+tt*3.5, 0.15), 0.2);
    sdMat(t.mat, d);
    
    sdMat(t.mat+1, sdLink(t.pos-td*0.5+0.9*t.up+1.3*tr, t.pos+td*0.5+0.9*t.up+1.3*tr, tr, vec3(0.7, 0.3, 0.2), -1.0));
    sdMat(t.mat+1, sdLink(t.pos-td*0.5+0.9*t.up-1.3*tr, t.pos+td*0.5+0.9*t.up-1.3*tr, tr, vec3(0.7, 0.3, 0.2),  1.0));
}

// 00000000  000       0000000    0000000   00000000   
// 000       000      000   000  000   000  000   000  
// 000000    000      000   000  000   000  0000000    
// 000       000      000   000  000   000  000   000  
// 000       0000000   0000000    0000000   000   000  

float floorDist()
{
    float d = sdPlane(vec3(0,0,0), vy);
    d = opDiff(d, sdSphere(vx*2.0+vy*2.0, 4.0), 1.5);
    if (cam.pos.y > 0.0) sdMat(FLOOR, d);
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

// 00     00   0000000   00000000   
// 000   000  000   000  000   000  
// 000000000  000000000  00000000   
// 000 0 000  000   000  000        
// 000   000  000   000  000        

float map(vec3 p)
{
    sdf = SDF(MAX_DIST, p, NONE);
    
    floorDist();
        
    for (int i = ZERO; i < 2; i++)
        tank(i);
        
    if (false && gl.march) { 
        sdMat(GLOW, sdSphere(gl.light3, 0.1));
        sdMat(GLOW, sdSphere(gl.light2, 0.1));
        sdMat(GLOW, sdSphere(gl.light1, 0.1));
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
    if (mat == NONE) return vec3(0.06);
    if (mat == GLOW) return white;
    
    Mat m = material[mat-1];

    vec3 bn = dither ? bumpMap(p, n, 0.005) : n;

    vec3  col = hsl(m.hue, m.sat, m.lum);
    
    if (mat == TANK2+1 || mat == TANK1+1) 
    {
        float s = tanks[mat/2-1].track[gl.tuv.z > 0.0 ? 0 : 1];
        bn = normalize(bn+vec3(sin(TAU*gl.tuv.x*3.0+fract(at)*s*TAU)*gl.tuv.y,0,0));
    }
    
    float dl1 = dot(bn,normalize(gl.light1-p));
    float dl2 = dot(bn,normalize(gl.light2-p));
    float dl3 = dot(bn,normalize(gl.light3-p));
    float dnl = max(max(dl1, dl2), dl3);
    float dsl = mix(dnl, clamp01(dl1 + dl2 + dl3), 0.85);
    
    col  = (light) ? gray(col) : col;
    
    col += pow(m.glossy, 3.0)*vec3(pow(smoothstep(0.0+m.glossy*0.9, 1.0, dsl), 1.0+40.0*m.glossy));
    col *= clamp(pow(dnl, 1.0+m.shiny*20.0), gl.ambient, 1.0) * getOcclusion(p, n);
    col *= softShadow(p, gl.light1, 2.0); 
    col *= softShadow(p, gl.light2, 2.0); 
    col *= softShadow(p, gl.light3, 5.0); 

    return clamp01(col);
}

// 00     00   0000000   000  000   000  
// 000   000  000   000  000  0000  000  
// 000000000  000000000  000  000 0 000  
// 000 0 000  000   000  000  000  0000  
// 000   000  000   000  000  000   000  

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    initGlobal(fragCoord, iResolution, iMouse, iTime);
    gl.zero = ZERO;
    gl.shadow = 0.5;
    gl.ambient = 0.25;
    for (int i = KEY_1; i <= KEY_9; i++) { if (keyDown(i)) { gl.option = i-KEY_1+1; break; } }
    
    rotate =  keyState(KEY_R);
    anim   =  keyState(KEY_P);
    occl   =  keyState(KEY_O);
    dither =  keyState(KEY_D);
    normal = !keyState(KEY_X);
    depthb = !keyState(KEY_Z);
    light  = !keyState(KEY_L);
    space  =  keyState(KEY_SPACE);
    foggy  =  keyState(KEY_F);
    
    if (anim) at = 0.9*iTime;
    
    initCam(CAM_DIST, vec2(0));
    
    lookAtFrom(vec3(0.5*0.25,-0.5*0.25,0), vec3(0,3.0,CAM_DIST));
    if (rotate)
        orbitYaw(-at*10.0);
            
    if (iMouse.z > 0.0)
        lookAtFrom(vec3(0.5*0.25,-0.5*0.25,0), rotAxisAngle(vec3(0,3.0,CAM_DIST-2.5*gl.mp.y), vy, gl.mp.x*90.0));
        
    #ifndef TOY
    if (space) lookAtFrom(iCenter, iCamera);
    #endif
    
    gl.uv = (2.0*fragCoord-iResolution.xy)/iResolution.y;
    vec3 rd = normalize(gl.uv.x*cam.x + gl.uv.y*cam.up + cam.fov*cam.dir);
    
    int num = int(load(0).x);
    
    // t2 -= floorHeight(t2, t2n)*vy;
    
    for (int i = ZERO; i < num; i++)
    {
        tanks[i] = loadTank(i+1);
        tanks[i].mat = TANK1+i*2;
        tanks[i].turret = normalize(tanks[i].dir*0.1+normalize(tanks[i].vel))*clamp(length(tanks[i].vel), 0.75, 1.0); 
    }

    gl.light1 = tanks[0].pos+15.0*vy;
    gl.light2 = tanks[1].pos+15.0*vy;
    gl.light3 = vy*20.0;
    
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
        if (foggy) col = mix(col, vec3(0.5), smoothstep(MAX_DIST*0.5, MAX_DIST*0.75, d));
    }
        
    #ifndef TOY
    col += vec3(print(0,0,vec3(iFrameRate, iTime, float(num))));
    // col += vec3(print(0,2,tanks[0].pos));
    // col += vec3(print(0,1,tanks[1].pos));
    #endif    

    fragColor = postProc(col, dither, true, true);
}