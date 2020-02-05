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

#define NUM_EYES 1

bool anim, soft, occl, light, dither, rotate;

vec3 camPos;
vec3 camTgt;
vec3 camDir;

int  AA = 2;

float SKINDist;

vec4 pivot = vec4(normalize(vec3(1)), 0);

void calcAnim()
{
    pivot.w = 4.0 + sin(1.0*iTime*1.0);
}

float branch(float open)
{
    vec3 n = pivot.xyz * pivot.w;
    float d = sdCapsule(v0, n, 0.3);
    d = opUnion(d, sdSphere(n, 1.0));    
    d = opInter(d, sdPlane(n*(2.0-open), pivot.xyz), 0.2);
    
    return d;
}

float eye()
{
    vec3 n = pivot.xyz * pivot.w;
    float d = sdSphere(n, 0.8);
    return d;
}

// 00     00   0000000   00000000   
// 000   000  000   000  000   000  
// 000000000  000000000  00000000   
// 000 0 000  000   000  000        
// 000   000  000   000  000        

ivec3 iv26(vec3 p)
{
    vec3 n = normalize(p);
    float dx = dot(n, vx);
    float dy = dot(n, vy);
    float dz = dot(n, vz);
    float dp = cos(3.0*PI/8.0);
    float dn = cos(5.0*PI/8.0);
    return ivec3(dx>=dp?1:dx<=dn?-1:0, dy>=dp?1:dy<=dn?-1:0, dz>=dp?1:dz<=dn?-1:0);
} 

int id26(vec3 p) 
{
    ivec3 v = iv26(p);
    ivec3 a = abs(v);
    int sum = a.x + a.y + a.z;
    int ssm = v.x + v.y + v.z;
    if (sum == 1) // 6 faces
        return a.y*2+a.z*4 + (ssm > 0 ? 0 : 1);
    else if (sum == 3) // 8 corners
        return 6 + (v.y*2+2)/2 + (a.z+v.z)/2 + (v.x > 0 ? 0 : 4);
    else // 12 edges
        return 14 + (4+v.x*4) + (v.x == 0 ? (1+v.y + (v.z+1)/2) : ((1-a.y)*(v.z+1)/2) + (1-a.z)*(2+(v.y+1)/2));
}

float map(vec3 p)
{
    // float open = smoothstep(0.9, 0.8, dot(p, camDir));
    float open = smoothstep(0.9999, 0.9980, sin(iTime*1.1)*0.5+0.5);
    
    open = id26(p) == 0 ? 1.0 : open;

    // if (gl.option == 2 || gl.option == 3)
        p = abs(p);
     
    vec3 r;
    
    r = polar(p);
        
    // if (gl.option == 1 || gl.option == 3)
    {
        if (r.x < (PI/2.0)/4.0) 
        {
            r.x += (PI/2.0)/2.0;
        }
        else if (r.x > 3.0*(PI/2.0)/4.0)
        {
            r.x -= (PI/2.0)/2.0;
        }
    }
    
    p = unpolar(r);
                
    gl.sdf = SDF(1000.0, p, NONE);
    
    float d = sdSphere(v0, 2.0-0.2*smoothstep(1.0, 0.8, sin(iTime*TAU)*0.5+0.5));

    d = opUnion(d, branch(open), 0.3);
    
    gl.sdf.mat = (d < gl.sdf.dist) ? SKIN : gl.sdf.mat;
    gl.sdf.dist = min(d, gl.sdf.dist);
    
    if (open > 0.8f)
    {
        d = min(d, eye());
    }

    gl.sdf.mat = (d < gl.sdf.dist) ? BULB : gl.sdf.mat;
    gl.sdf.dist = min(d, gl.sdf.dist);
    
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

float shiny(float rough, float NoH, const vec3 h) 
{
    float o = 1.0 - NoH * NoH;
    float a = NoH * rough;
    float k = rough / (o + a * a);
    float d = k * k / PI;
    return d;
}

vec3 getLight(vec3 p, vec3 n, vec3 col, int mat)
{
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
    col = mix(vec3((col.x+col.y+col.z)/3.0), col, df*(1.0-smoothstep(1.0, 0.8, sin(iTime*TAU)*0.5+0.5)));
    
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
                
        if      (mat == SKIN) col = vec3(0.4, 0.0, 0.0);
        else if (mat == PUPL) col = vec3(0.1, 0.1, 0.5);
        else if (mat == BULB) col = vec3(0.95);
        else if (mat == NONE) col = vec3(0.1, 0.1, 0.6);
    
        col = getLight(p, n, col, mat);

        cols += col;
    }
    
    col = cols/float(AA*AA);
    
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
    
    col += vec3(print(0, 12, id26(-vy+vz)));
    col += vec3(print(0, 11, id26(-vy-vz)));
    col += vec3(print(0, 10, id26( vy+vz)));
    col += vec3(print(0,  9, id26( vy-vz)));
    
    col += vec3(print(0, 8, id26(-vx+vy)));
    col += vec3(print(0, 7, id26(-vx-vy)));
    col += vec3(print(0, 6, id26(-vx+vz)));
    col += vec3(print(0, 5, id26(-vx-vz)));
    col += vec3(print(0, 4, id26( vx+vy)));
    col += vec3(print(0, 3, id26( vx-vy)));
    col += vec3(print(0, 2, id26( vx+vz)));
    col += vec3(print(0, 1, id26( vx-vz)));
        
    if (dither)
    {
        float dit = gradientNoise(fragCoord.xy);
        col -= vec3(dit/256.0);
    }
    
    col  = pow(col, vec3(1.0/2.2));
    
    col *= vec3(smoothstep(1.8, 0.5, length(gl.uv)/max(gl.aspect,1.0)));
    
    fragColor = vec4(col,1.0);
}