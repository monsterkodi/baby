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

#define NONE  0
#define PLANE 1
#define BULB  2
#define PUPL  3

bool anim, soft, occl, light;

vec3 camPos;
vec3 camTgt;
vec3 camDir;

int  AA = 2;

float planeDist;

vec4 pivot[26];

void poseSphere()
{
    pivot[0].xyz =  vx; 
    pivot[1].xyz =  vy; 
    pivot[2].xyz =  vz;
    pivot[3].xyz =  vx + vy;
    pivot[4].xyz =  vy + vz;
    pivot[5].xyz =  vz + vx;
    pivot[6].xyz =  vx + vy + vz;
    
    for (int i = 0; i <= 6; i++) pivot[i].xyz = normalize(pivot[i].xyz);
}

void calcAnim()
{
    for (int i = 0; i <=2; i++) pivot[i].w = 4.0 + sin(float(i)*2.0*PI/5.0+1.0*iTime*1.0);
    for (int i = 3; i <=5; i++) pivot[i].w = 4.0 + sin(float(i)*2.0*PI/5.0+1.0*iTime*1.3);
    for (int i = 6; i <=6; i++) pivot[i].w = 5.0 + sin(float(i)*2.0*PI/5.0+1.0*iTime*1.6);
}

float branch(int i)
{
    vec3 n = pivot[i].xyz * pivot[i].w;
    float d = sdCapsule(v0, n, 0.3);
    d = opUnion(d, sdSphere(n, 1.0));
    
    float f = smoothstep(0.8, 0.9, dot(abs(pivot[i].xyz), abs(camDir)));
    d = opInter(d, sdPlane(n*(2.0-f), pivot[i].xyz), 0.2);
    
    return d;
}

float eye(int i)
{
    vec3 n = pivot[i].xyz * pivot[i].w;
    float d = sdSphere(n, 0.8);
    return d;
}

// 00     00   0000000   00000000   
// 000   000  000   000  000   000  
// 000000000  000000000  00000000   
// 000 0 000  000   000  000        
// 000   000  000   000  000        

float map(vec3 p)
{
    gl.sdf = SDF(1000.0, p, NONE);
    
    float d = sdSphere(v0, 2.0);
    
    gl.sdf.pos = abs(gl.sdf.pos);
    for (int i = ZERO; i <=6; i++)
    {
        d = opUnion(d, branch(i));
    }
    
    gl.sdf.mat = (d < gl.sdf.dist) ? PLANE : gl.sdf.mat;
    gl.sdf.dist = min(d, gl.sdf.dist);
    
    for (int i = ZERO; i <=6; i++)
    {
        d = min(d, eye(i));
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
        //if (s.mat != BBOX)
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
 
    float ambient = 0.5;
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
    else if (mat == PLANE)
    {
        dif = mix(pow(dif, 2.0), dif, 0.2);
    }
    
    if (mat == PLANE || mat == BULB)
    {
        dif *= softShadow(p, gl.light, 6.0);        
    }
       
    col *= clamp(dif, ambient, 1.0);
    col *= getOcclusion(p, n);
    
    if (light) col = vec3(dif*getOcclusion(p, n));
    
   	if (mat == PUPL || mat == BULB)
    {
        col += vec3(pow(clamp01(smoothstep(0.9,1.0,dot(n, l))), 20.0));
    }
    else if (mat == PLANE)
    {
        col += col*vec3(pow(clamp01(smoothstep(0.25,1.0,dot(n, l))), 2.0));
        col += col*vec3(pow(clamp01(smoothstep(0.9,1.0,dot(n, l))), 4.0));
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
    
    soft  = !keyState(KEY_DOWN);
    light = !keyState(KEY_LEFT);
    anim  =  keyState(KEY_RIGHT);
    occl  =  keyState(KEY_UP);
    
    poseSphere();
    calcAnim();
    
    vec3 cols = v0, col = v0;
    
    if (!soft) AA = 1; 
    
   	vec2 ao = vec2(0);
    
    float md = 30.0;
    float mx = -gl.mp.x + iTime*0.15;
    float my = -gl.mp.y + iTime*0.05;
        
    camTgt = v0; 
    camPos = rotAxisAngle(rotAxisAngle(vec3(0,0,md), vx, 89.0*my), vy, -90.0*mx);
    camDir = normalize(camTgt-camPos);
        
    vec3 cr = cross(camDir, vec3(0,1,0));
    vec3 up = normalize(cross(cr,camDir));
    gl.light = (-0.2*cr + 0.5*up -camDir)*md; 
    
    vec3 uu = normalize(cross(camDir, vy));
    vec3 vv = normalize(cross(uu, camDir));
    float fov = 4.0 + float(gl.option);
    
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
                
        if      (mat == PLANE) col = vec3(0.005);
        else if (mat == PUPL)  col = vec3(0.1, 0.1, 0.5);
        else if (mat == BULB)  col = vec3(0.1);
        else if (mat == NONE)  col = vec3(0.001);
    
        col = getLight(p, n, col, mat);

        cols += col;
    }
    
    col = cols/float(AA*AA);
    
    col *= pow(clamp01(1.2*gl.aspect-length(gl.uv)), 0.5);
    col  = pow(col, vec3(1.0/2.2));
    
    col += vec3(print(0, 0, iFrameRate));
    
    fragColor = vec4(col,1.0);
}