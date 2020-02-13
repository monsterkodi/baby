#define keys(x,y)  texelFetch(iChannel0, ivec2(x,y), 0)
bool keyState(int key) { return keys(key, 2).x < 0.5; }
bool keyDown(int key)  { return keys(key, 0).x > 0.5; }

#define ZERO min(iFrame,0)
#define CAM_DIST   6.0
#define MAX_STEPS  256
#define MIN_DIST   0.001
#define MAX_DIST   100.0

#define NONE   0
#define FLOOR  1
#define TANK   2
#define TANK2  4
#define TANK3  6
#define TANK4  8
#define GLOW   9

Mat[9] material = Mat[9](
    //  hue   sat  lum    shiny  glossy
    Mat(0.5,  1.0,  1.0,   0.0,   0.0 ),
    Mat(0.0,  1.0,  0.6,   0.1,   0.7 ),
    Mat(0.0,  0.75, 0.05,  0.0,   0.8 ),
    Mat(0.6,  1.0,  0.6,   0.1,   0.7 ),
    Mat(0.6,  0.75, 0.05,  0.0,   0.8 ),
    Mat(0.2,  1.0,  0.6,   0.1,   0.7 ),
    Mat(0.2,  0.75, 0.05,  0.0,   0.8 ),
    Mat(0.4,  1.0,  0.6,   0.1,   0.7 ),
    Mat(0.4,  0.75, 0.05,  0.0,   0.8 )
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

struct Tank {
    int mat;
    vec3 pos;
    vec3 up;
    vec3 dir;
    vec3 turret;
};

void tank(Tank t)
{
    vec3 p = t.pos + 1.39*t.up;
    float d = sdHalfSphere(p, t.up, 1.5, 0.4);
    p += 0.7*t.up;
    d = opUnion(d, sdCapsule(p, p+t.turret*2.5, 0.3), 0.02);
    d = opUnion(d, sdHalfSphere(p+t.turret*2.8, -t.turret, 0.7, 0.1), 0.1);
    d = opDiff (d, sdCapsule(p+t.turret, p+t.turret*3.5, 0.15), 0.2);
    sdMat(t.mat, d);
    
    vec3 tr = cross(t.up, t.dir);
    sdMat(t.mat+1, sdLink(t.pos-t.dir+0.9*t.up+1.3*tr, t.pos+t.dir+0.9*t.up+1.3*tr, tr, vec3(0.7, 0.4, 0.2)));
    sdMat(t.mat+1, sdLink(t.pos-t.dir+0.9*t.up-1.3*tr, t.pos+t.dir+0.9*t.up-1.3*tr, tr, vec3(0.7, 0.4, 0.2)));
}

// 00     00   0000000   00000000   
// 000   000  000   000  000   000  
// 000000000  000000000  00000000   
// 000 0 000  000   000  000        
// 000   000  000   000  000        

float map(vec3 p)
{
    sdf = SDF(MAX_DIST, p, NONE);
    
    if (cam.pos.y > 0.0) sdMat(FLOOR, sdPlane(vec3(0,0,0), vy));
        
    Tank[4] tanks = Tank[4](
        Tank(TANK,  vec3(sin( at),0, 0), vy, -vx, normalize(cos(at)*vz+sin(at)*vx+(sin(at)*0.5+0.5)*vy)),
        Tank(TANK2, vec3(sin(-at),0, 4), vy, -vx, normalize(cos(at)*vz+sin(at)*vx+(sin(at)*0.5+0.5)*vy)),
        Tank(TANK3, vec3(sin( at),0, 8), vy, -vx, normalize(cos(at)*vz+sin(at)*vx+(sin(at)*0.5+0.5)*vy)),
        Tank(TANK4, vec3(sin(-at),0,12), vy, -vx, normalize(cos(at)*vz+sin(at)*vx+(sin(at)*0.5+0.5)*vy))
        ); 

    for (int i = 2; i < 4; i++)
        tank(tanks[i]);
        
    if (gl.march) { 
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

    vec3 bn = dither ? bumpMap(p, n, 0.003) : n;

    vec3  col = hsl(m.hue, m.sat, m.lum);
    
    float dl1 = dot(bn,normalize(gl.light1-p));
    float dl2 = dot(bn,normalize(gl.light2-p));
    float dl3 = dot(bn,normalize(gl.light3-p));
    float dnl = max(max(dl1, dl2), dl3);
    
    col  = (light) ? gray(col) : col;
    
    col += pow(m.glossy, 3.0)*vec3(pow(smoothstep(0.0+m.glossy*0.9, 1.0, dnl), 1.0+40.0*m.glossy));
    col *= clamp(pow(dnl, 1.0+m.shiny*20.0), gl.ambient, 1.0) * getOcclusion(p, n);
    col *= softShadow(p, gl.light1, 1.0); 
    col *= softShadow(p, gl.light2, 1.0); 
    col *= softShadow(p, gl.light3, 1.0); 

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
    anim   =  keyState(KEY_RIGHT);
    occl   =  keyState(KEY_UP);
    dither = !keyState(KEY_D);
    normal = !keyState(KEY_X);
    depthb = !keyState(KEY_Z);
    light  = !keyState(KEY_LEFT);
    space  =  keyState(KEY_SPACE);
    foggy  =  keyState(KEY_F);
    
    if (anim) at = 0.5*iTime;
    
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
    
    gl.light1 = vec3(-1,1,0); // vy*(7.0+4.0*(sin(at))) + 5.0*vx;
    gl.light2 = vec3( 1,1,0); // vy*(7.0+4.0*(sin(at))) + 5.0*vy;
    gl.light3 = vy*(7.0+4.0*(sin(at))) + 5.0*vz;
    
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
        if (foggy) col = mix(col, vec3(0.07), smoothstep(MAX_DIST*0.1, MAX_DIST*0.5, d));
    }
        
    #ifndef TOY
    col += vec3(print(0,0,vec2(iFrameRate, iTime)));
    #endif    

    fragColor = postProc(col, dither, true, true);
}