#define keys(x,y)  texelFetch(iChannel0, ivec2(x,y), 0)
#define load(x)    texelFetch(iChannel1, ivec2(x,0), 0)
#define load3(x,y) texelFetch(iChannel3, ivec2(x,y), 0)
#define font(x,y)  texelFetch(iChannel2, ivec2(x,y), 0)

bool keyState(int key) { return keys(key, 2).x < 0.5; }
bool keyDown(int key)  { return keys(key, 0).x > 0.5; }

#define ZERO min(iFrame,0)
#define MAX_STEPS  128
#define MIN_DIST   0.002
#define MAX_DIST   40.0
#define SHADOW     0.2
#define FLOOR      0.0

#define NONE 0
#define SKIN 1
#define BULB 2
#define PUPL 3

#define EYE_RADIUS 0.8

bool anim, soft, occl, light, dither, rotate;

vec3 camPos;
vec3 camTgt;
vec3 camDir;

int  AA = 2;

void basis(vec3 n, out vec3 right, out vec3 front) 
{
    if (n.y < -0.999999)
    {
        right = -vz;
        front = -vx;
    } 
    else 
    {
        float a = 1.0/(1.0+n.y);
        float b = -n.x*n.z*a;
        right = vec3(1.0-n.x*n.x*a,-n.x,b);
        front = vec3(b,-n.z,1.0-n.z*n.z*a);
    }
}

// 00000     000     
//    000   000      
//   000   0000000   
//  000    000  000  
// 000000   000000   


const vec3 cubo[26] = vec3[26](
    normalize(vec3( 0, 0, 1)),
    normalize(vec3( 0, 0,-1)),
    normalize(vec3( 0, 1, 0)),
    normalize(vec3( 0,-1, 0)),
    normalize(vec3( 1, 0, 0)),

    normalize(vec3(-1, 0, 0)),
    normalize(vec3( 1, 1, 0)),
    normalize(vec3( 1,-1, 0)),
    normalize(vec3(-1, 1, 0)),
    normalize(vec3(-1,-1, 0)),
    normalize(vec3( 1, 0, 1)),
    normalize(vec3( 1, 0,-1)),
    normalize(vec3(-1, 0, 1)),
    normalize(vec3(-1, 0,-1)),
    normalize(vec3( 0, 1, 1)),
    normalize(vec3( 0, 1,-1)),
    normalize(vec3( 0,-1, 1)),
    normalize(vec3( 0,-1,-1)),
    
    normalize(vec3( 1, 1, 1)),
    normalize(vec3( 1, 1,-1)),
    normalize(vec3( 1,-1, 1)),
    normalize(vec3(-1, 1, 1)),
    normalize(vec3( 1,-1,-1)),
    normalize(vec3(-1, 1,-1)),
    normalize(vec3(-1,-1, 1)),
    normalize(vec3(-1,-1,-1))
);

const vec3 dodeca[12] = vec3[12](
    normalize(vec3(0, 1, PHI)),
    normalize(vec3(0,-1, PHI)),
    normalize(vec3(0,-1,-PHI)),
    normalize(vec3(0, 1,-PHI)),
    normalize(vec3( 1, PHI,0)),
    normalize(vec3(-1, PHI,0)),
    normalize(vec3(-1,-PHI,0)),
    normalize(vec3( 1,-PHI,0)),
    normalize(vec3( PHI, 0,  1)),
    normalize(vec3( PHI, 0, -1)),
    normalize(vec3(-PHI, 0, -1)),
    normalize(vec3(-PHI, 0,  1))
);

const vec3 icosa[20] = vec3[20](
    normalize(vec3( 1, 1,-1)),
    normalize(vec3( 1, 1, 1)),
    normalize(vec3( 1,-1,-1)),
    normalize(vec3( 1,-1, 1)),
    normalize(vec3(-1, 1,-1)),
    normalize(vec3(-1, 1, 1)),
    normalize(vec3(-1,-1,-1)),
    normalize(vec3(-1,-1, 1)),
    normalize(vec3(0, PHI,  1.0/PHI)),
    normalize(vec3(0, PHI, -1.0/PHI)),
    normalize(vec3(0,-PHI, -1.0/PHI)),
    normalize(vec3(0,-PHI,  1.0/PHI)),
    normalize(vec3( PHI,  1.0/PHI, 0)),
    normalize(vec3( PHI, -1.0/PHI, 0)),
    normalize(vec3(-PHI, -1.0/PHI, 0)),
    normalize(vec3(-PHI,  1.0/PHI, 0)),
    normalize(vec3( 1.0/PHI, 0, PHI)),
    normalize(vec3(-1.0/PHI, 0, PHI)),
    normalize(vec3(-1.0/PHI, 0,-PHI)),
    normalize(vec3( 1.0/PHI, 0,-PHI))
);

vec3 v26(vec3 p)
{
    float d = 0.0;
    int id = -1;
    vec3 n = normalize(p);
    for (int i = 0; i < 26; i++)
    {
        float dt = dot(n,cubo[i]);
        if (dt > d)
        {
            d = dt;
            id = i;
        }
    }
    return cubo[id];
}

vec3 map26(vec3 p)
{
    vec3 m = v26(p);
    vec3 q = p-m;
    vec3 r, f;
    basis(m,r,f);
    return vec3(dot(r,q),dot(m,q),dot(f,q));
}

vec3 v20(vec3 p)
{
    float d = 0.0;
    int id = -1;
    vec3 n = normalize(p);
    for (int i = 0; i < 20; i++)
    {
        float dt = dot(n,icosa[i]);
        if (dt > d)
        {
            d = dt;
            id = i;
        }
    }
    return icosa[id];
}

vec3 map20(vec3 p)
{
    vec3 m = v20(p);
    vec3 q = p-m;
    vec3 r, f;
    basis(m,r,f);
    return vec3(dot(r,q),dot(m,q),dot(f,q));
}

vec3 v12(vec3 p)
{
    float d = 0.0;
    int id = -1;
    vec3 n = normalize(p);
    for (int i = 0; i < 12; i++)
    {
        float dt = dot(n,dodeca[i]);
        if (dt > d)
        {
            d = dt;
            id = i;
        }
    }
    return dodeca[id];
}

vec3 map12(vec3 p)
{
    vec3 m = v12(p);
    vec3 q = p-m;
    vec3 r, f;
    basis(m,r,f);
    return vec3(dot(r,q),dot(m,q),dot(f,q));
}

vec3 v32(vec3 p)
{
    vec3  n = normalize(p);
    vec3  m1 = v12(p);
    vec3  m2 = v20(p);
    float d1 = dot(n,m1);
    float d2 = dot(n,m2);
    if (d1 > d2) return m1;
    return m2;
}

vec3 map32(vec3 p)
{
    vec3 m = v32(p);
    vec3 q = p-m;
    vec3 r, f;
    basis(m,r,f);
    return vec3(dot(r,q),dot(m,q),dot(f,q));
}

// 00000000  000  0000000    
// 000       000  000   000  
// 000000    000  0000000    
// 000       000  000   000  
// 000       000  0000000    

vec4 sphericalFibonacci(vec3 p, float num)
{
    float m   = 1.0-1.0/num;
    float phi = min(atan(p.y,p.x),PI);
    float k   = max(2.0, floor(log(num*PI*sqrt(5.0)*(1.0-p.z*p.z))/log(PHI+1.0)));
    float Fk  = pow(PHI,k)/sqrt(5.0);
    vec2  F   = vec2(round(Fk), round(Fk*PHI));
    vec2  ka  = 2.0*F/num;
    vec2  kb  = 2.0*PI*(fract((F+1.0)*PHI)-(PHI-1.0));    
    mat2  iB  = mat2(ka.y,-ka.x, kb.y,-kb.x)/(ka.y*kb.x-ka.x*kb.y);
    
    vec2  c   = floor(iB*vec2(phi, p.z-m));
    float d   = 0.0;
    vec4  res = vec4(0);
    
    for (int s=0; s<4; s++)
    {
        vec2  uv  = vec2(s&1,s>>1);
        float i   = dot(F,uv+c); 
        float phi = 2.0*PI*fract(i*PHI);
        float cot = m-2.0*i/num; 
        float sit = sqrt(1.0-cot*cot); 
        vec3  q   = vec3(cos(phi)*sit, sin(phi)*sit, cot);
        float d1  = dot(p,q);
        if (d1 > d)
        {
            d   = d1;
            // res = vec4(q,d);
            res = vec4(q,i);
        }
    }
    return res;
}

//  0000000  000000000   0000000   000      000   000  
// 000          000     000   000  000      000  000   
// 0000000      000     000000000  000      0000000    
//      000     000     000   000  000      000  000   
// 0000000      000     000   000  0000000  000   000  

vec4 pivot = vec4(vy, 0);

void calcAnim()
{
    pivot.w = 4.0 + sin(1.0*iTime*1.0);
}

float stalk(float open)
{
    vec3 n = pivot.xyz * pivot.w;
    float d = sdCapsule(v0, n, 0.3);
    d = opUnion(d, sdSphere(n, EYE_RADIUS*1.25));    
    d = opInter(d, sdPlane(n*(2.0-open), pivot.xyz), 0.2);
    return d;
}

// 00000000  000   000  00000000  
// 000        000 000   000       
// 0000000     00000    0000000   
// 000          000     000       
// 00000000     000     00000000  

void eye(float id)
{
    vec3 pos = pivot.xyz * pivot.w;
    vec3 n = pivot.xyz;
    float r = EYE_RADIUS;
    float d = sdSphere(pos, r);
    
    if (d < gl.sdf.dist) { gl.sdf.mat = BULB; gl.sdf.dist = d; }
    if (d > gl.sdf.dist+r) return;
    
    return;
    
    vec3 hsh1 = hash31(id+floor(iTime*id/(id-0.5)*0.2));
    vec3 hsh2 = hash31(id+floor(iTime*id/(id-0.5)*0.3));
    
    n  = normalize(n+(hsh1 + hsh2 - 1.0)*(dot(n,vz)-0.5));
    
    vec3 pupil = pos+1.0*r*n;
    vec3 lens  = pos+0.5*r*n;
    
    d = opDiff(d, sdSphere(pupil, r*0.75), r*0.1);

    if (d < gl.sdf.dist) { gl.sdf.mat = BULB; gl.sdf.dist = d; }
    
    d = min(d, sdEllipsoid(lens, r*vec3(0.7, 0.7, 0.35)));
    
    if (d < gl.sdf.dist) { gl.sdf.mat = PUPL; gl.sdf.dist = d; }
}

// 00     00   0000000   00000000   
// 000   000  000   000  000   000  
// 000000000  000000000  00000000   
// 000 0 000  000   000  000        
// 000   000  000   000  000        

float map(vec3 p)
{
    // float open = smoothstep(0.9, 0.8, dot(p, camDir));
    float open = smoothstep(0.9999, 0.9980, sin(iTime*1.1)*0.5+0.5);
    
    if (gl.option==2) 
    {
        vec3 r,f;
        vec4 fib = sphericalFibonacci(normalize(p),32.0);
        vec3 q = p-fib.xyz;
        vec3 n = normalize(fib.xyz);
        basis(n,r,f);
        p = vec3(dot(r,q),dot(n,q),dot(f,q));
        open = (mod(fib.w, 2.0) == 0.0) ? 0.0 : open;
    } 
    else if (gl.option==1)
    {
        p = map32(p);
    }
    else
    {
        p = map20(p);
    }
    
    gl.sdf = SDF(1000.0, p, NONE);
    
    // float d = sdSphere(v0, 2.0-0.2*smoothstep(1.0, 0.8, sin(iTime*TAU)*0.5+0.5));
    float d = sdSphere(v0, 2.0);

    d = opUnion(d, stalk(open), 0.3);
    
    if (d < gl.sdf.dist) { gl.sdf.mat = SKIN; gl.sdf.dist = d; }

    if (open > 0.8f)
    {
        // d = min(d, eye(fib.w));
        eye(0.0);
    }

    return gl.sdf.dist;
}

vec3 getNormal(vec3 p)
{
    vec3 n = v0;
    for (int i=ZERO; i<4; i++)
    {
        vec3 e = 0.5773*(2.0*vec3((((i+3)>>1)&1),((i>>1)&1),(i&1))-1.0);
        n += e*map(p+e*0.0001);
    }
    return normalize(n);
}

// 00     00   0000000   00000000    0000000  000   000  
// 000   000  000   000  000   000  000       000   000  
// 000000000  000000000  0000000    000       000000000  
// 000 0 000  000   000  000   000  000       000   000  
// 000   000  000   000  000   000   0000000  000   000  

float rayMarch(vec3 ro, vec3 rd)
{
    float dz = 0.0;
    for (int i = ZERO; i < MAX_STEPS; i++)
    {
        vec3 p = ro + dz * rd;
        float d = map(p);
        dz += d;
        if (d < MIN_DIST) return dz;
        if (dz > MAX_DIST) break;
    }
    gl.sdf.mat = NONE;
    return dz;
}

//  0000000  000   000   0000000   0000000     0000000   000   000  
// 000       000   000  000   000  000   000  000   000  000 0 000  
// 0000000   000000000  000000000  000   000  000   000  000000000  
//      000  000   000  000   000  000   000  000   000  000   000  
// 0000000   000   000  000   000  0000000     0000000   00     00  

float softShadow(vec3 ro, vec3 lp, float k)
{
    float shade = 1.;
    float dist = MIN_DIST;    
    vec3 rd = (lp-ro);
    float end = max(length(rd), MIN_DIST);
    float stepDist = end/25.0;
    rd /= end;
    for (int i=0; i<25; i++)
    {
        float h = map(ro+rd*dist);
        shade = min(shade, k*h/dist);
        dist += clamp(h, 0.02, stepDist*2.0);
        
        if (h < 0.0 || dist > end) break; 
    }

    return min(max(shade, 0.0) + SHADOW, 1.0); 
}

//  0000000    0000000   0000000  000      000   000   0000000  000   0000000   000   000  
// 000   000  000       000       000      000   000  000       000  000   000  0000  000  
// 000   000  000       000       000      000   000  0000000   000  000   000  000 0 000  
// 000   000  000       000       000      000   000       000  000  000   000  000  0000  
//  0000000    0000000   0000000  0000000   0000000   0000000   000   0000000   000   000  

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

// 000      000   0000000   000   000  000000000  
// 000      000  000        000   000     000     
// 000      000  000  0000  000000000     000     
// 000      000  000   000  000   000     000     
// 0000000  000   0000000   000   000     000     

vec3 getLight(vec3 p, vec3 n, int mat)
{
    vec3 col;
    switch (mat)
    {
        case SKIN: col = vec3(0.4, 0.0, 0.0); break;
        case PUPL: col = vec3(0.1, 0.1, 0.5); break;
        case BULB: col = vec3(0.95);          break;
        case NONE: col = vec3(0.1, 0.1, 0.6); break;
    }
    
    if (mat == NONE) return col;
    
    vec3 l = normalize(gl.light-p);
 
    float ambient = 0.05;
    float dif = clamp(dot(n,l), 0.0, 1.0);
    
    if (mat == PUPL)
    {
        dif = clamp(dot(n,normalize(mix(camPos,gl.light,0.1)-p)), 0.0, 1.0);
        dif = mix(pow(dif, 16.0), dif, 0.2);
        dif += 1.0 - smoothstep(0.0, 0.2, dif);
        if (mat == PUPL) ambient = 0.1;
    }
    else if (mat == BULB)
    {
        dif = mix(pow(dif, 32.0), 3.0*dif+1.0, 0.2);
        ambient = 0.12;
    }
    else if (mat == SKIN)
    {
        dif = mix(pow(dif, 2.0), dif, 0.2);
    }
    
    if (mat == SKIN || mat == BULB)
    {
        dif *= softShadow(p, gl.light, 6.0);        
    }
    
    float df = smoothstep(7.0, 2.0, length(p));
    //col = mix(vec3((col.x+col.y+col.z)/3.0), col, df*(1.0-smoothstep(1.0, 0.8, sin(iTime*TAU)*0.5+0.5)));
    
    col *= clamp(dif, ambient, 1.0);
    col *= getOcclusion(p, n);
    
    if (light) col = vec3(vec3((col.x+col.y+col.z)/3.0)*clamp(dif, ambient, 1.0)*getOcclusion(p, n));
    
   	if (mat == PUPL || mat == BULB)
    {
        col += vec3(pow(clamp01(smoothstep(0.9,1.0,dot(n, l))), 0.8));
    }
    else if (mat == SKIN)
    {
        col += col*vec3(pow(clamp01(smoothstep(0.25,1.0,dot(n, l))), 2.0));
        col += 0.5*col*vec3(pow(clamp01(smoothstep(0.5,0.55,dot(n, l))), 11.8));
        col += vec3(pow(clamp01(smoothstep(0.989,1.0,dot(n, l))), 0.5));
    }
    
    if (light) col = clamp(col, 0.0, 1.0);
    return col;
}

// 00     00   0000000   000  000   000
// 000   000  000   000  000  0000  000
// 000000000  000000000  000  000 0 000
// 000 0 000  000   000  000  000  0000
// 000   000  000   000  000  000   000

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    initGlobal(fragCoord, iResolution, iMouse, iTime);
    for (int i = KEY_1; i <= KEY_9; i++) { if (keyDown(i)) { gl.option = i-KEY_1+1; break; } }
    
    soft   = !keyState(KEY_DOWN);
    light  = !keyState(KEY_LEFT);
    anim   =  keyState(KEY_RIGHT);
    occl   =  keyState(KEY_UP);
    dither =  keyState(KEY_D);
    rotate = !keyState(KEY_R);
    
    calcAnim();
    
    vec3 cols = v0, col = v0;
    
    if (!soft) AA = 1; 
    
   	vec2 ao = vec2(0);
    
    float md = 30.0;
    
    float mx = -gl.mp.x*2.0;
    float my = -gl.mp.y*2.0;
    
    if (rotate) 
    {
        mx += iTime*0.15;
        my += iTime*0.05;
    }
        
    camTgt = v0; 
    camPos = rotAxisAngle(rotAxisAngle(vec3(0,0,md), vx, 89.0*my), vy, -90.0*mx);
    camDir = normalize(camTgt-camPos);
        
    vec3 cr = cross(camDir, vec3(0,1,0));
    vec3 up = normalize(cross(cr,camDir));
    gl.light = (-0.2*cr + 0.5*up -camDir)*md; 
    
    vec3 uu = normalize(cross(camDir, vy));
    vec3 vv = normalize(cross(uu, camDir));
    
    float fov = 4.0;
    if (gl.option > 3) fov += float(gl.option);
    
    for( int am=ZERO; am<AA; am++ )
    for( int an=ZERO; an<AA; an++ )
    {
        if (AA > 1) ao = vec2(float(am),float(an))/float(AA)-0.5;

        gl.uv = (2.0*(fragCoord+ao)-iResolution.xy)/iResolution.y;
    
        vec3 rd = normalize(gl.uv.x*uu + gl.uv.y*vv + fov*camDir);
        float d = rayMarch(camPos, rd);
        
        int mat = gl.sdf.mat;
        
        vec3 p = camPos + d * rd;
        vec3 n = getNormal(p);
                    
        col = getLight(p, n, mat);

        cols += col;
    }
    
    col = cols/float(AA*AA);
    
    #ifndef TOY
    col += vec3(print(0, 0, iFrameRate));
    
    // col += vec3(print(0, 3, iv26(vx)));
    // col += vec3(print(0, 2, iv26(vy)));
    // col += vec3(print(0, 1, iv26(vz)));
    // col += vec3(print(0, 6, iv26(-vx-vy+vz)));
    // col += vec3(print(0, 5, iv26(-vz-vx)));
    // col += vec3(print(0, 4, iv26(-vy-vz)));
    
    // col += vec3(print(0, 8, id26(-vx+vy+vz)));
    // col += vec3(print(0, 7, id26(-vx+vy-vz)));
    // col += vec3(print(0, 6, id26(-vx-vy+vz)));
    // col += vec3(print(0, 5, id26(-vx-vy-vz)));
    // col += vec3(print(0, 4, id26(vx+vy+vz)));
    // col += vec3(print(0, 3, id26(vx+vy-vz)));
    // col += vec3(print(0, 2, id26(vx-vy+vz)));
    // col += vec3(print(0, 1, id26(vx-vy-vz)));
    
    // col += vec3(print(0, 12, id26(-vy+vz)));
    // col += vec3(print(0, 11, id26(-vy-vz)));
    // col += vec3(print(0, 10, id26( vy+vz)));
    // col += vec3(print(0,  9, id26( vy-vz)));
    // col += vec3(print(0, 8, id26(-vx+vy)));
    // col += vec3(print(0, 7, id26(-vx-vy)));
    // col += vec3(print(0, 6, id26(-vx+vz)));
    // col += vec3(print(0, 5, id26(-vx-vz)));
    // col += vec3(print(0, 4, id26( vx+vy)));
    // col += vec3(print(0, 3, id26( vx-vy)));
    // col += vec3(print(0, 2, id26( vx+vz)));
    // col += vec3(print(0, 1, id26( vx-vz)));
    #endif
    
    if (dither)
    {
        float dit = gradientNoise(fragCoord.xy);
        col -= vec3(dit/256.0);
    }
    
    col  = pow(col, vec3(1.0/2.2));
    
    col *= vec3(smoothstep(1.8, 0.5, length(gl.uv)/max(gl.aspect,1.0)));
    
    fragColor = vec4(col,1.0);
}