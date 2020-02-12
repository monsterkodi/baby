// https://www.shadertoy.com/view/4lyGzR 'Biomine' by Shane

#define keys(x,y)  texelFetch(iChannel0, ivec2(x,y), 0)
bool keyState(int key) { return keys(key, 2).x < 0.5; }
bool keyDown(int key)  { return keys(key, 0).x > 0.5; }

#define ZERO min(iFrame,0)
#define CAM_DIST   3.0
#define MAX_STEPS  150
#define MIN_DIST   0.001
#define MAX_DIST   20.0
#define HEX_DIST   8.0

#define NONE 0
#define HEXA 1
#define TANK 2
#define GLOW 3
#define BBOX 9

Mat[5] material = Mat[5](
    //  hue   sat  lum    shiny  glossy
    Mat(0.67, 1.0, 0.6,   0.3,   0.9 ), // HEXA
    Mat(0.05, 1.0, 1.0,   0.3,   0.5 ), // TANK
    
    Mat(0.33, 1.0, 0.5,   0.1,   1.0 ), 
    Mat(0.67, 1.0, 0.75,  0.3,   0.6 ),
    Mat(0.5,  0.0, 0.01,  0.0,   0.0 )
);

float spark(float x, float y, float r)
{
    return pow(r/length(gl.uv-vec2(x,y)), 3.0);
}

bool space, anim, soft, occl, light, dither, foggy, rotate, normal, depthb;

float hash(float n) { return fract(cos(n)*45758.5453); }
mat2  rot2(float a) { vec2 v = sin(vec2(1.570796, 0) + a); return mat2(v, -v.y, v.x); }

float at;
vec2 hexid;
int screen;

// 000   000  00000000  000   000   0000000   
// 000   000  000        000 000   000   000  
// 000000000  0000000     00000    000000000  
// 000   000  000        000 000   000   000  
// 000   000  00000000  000   000  000   000  

float shoreDist(vec3 p)
{
    return max(0.0, length(p.xz-vec2(0.5,-0.5))-3.6);
}

float mountain(vec2 p)
{
    return 0.1+0.6*dot(cos(p), cos(p))*(1.2-length(p-vec2(0.5,-0.5))/2.6);
}

float hexHeight(vec2 p)
{
    float t = iTime*2.0;
    float shore = length(p-vec2(0.5,-0.5));
    if (shore > 2.6) return 0.08 + sin(t+p.x)*0.02 + cos(t+p.y)*0.02;
    
    return 0.15+0.6*dot(cos(p.xy), cos(p.xy))*(1.2-shore/2.6);
}
 
// 00000000  000  00000000  000      0000000    
// 000       000  000       000      000   000  
// 000000    000  0000000   000      000   000  
// 000       000  000       000      000   000  
// 000       000  00000000  0000000  0000000    

void field()
{
    vec3 a = gl.sdf.pos;
    vec2 p = a.xz;
    
    float rd = 0.25;
    vec2 s = vec2(0.8660254, 1);

    /*
    float hd = sdSphere(v0, 1.0);
    if (hd > HEX_DIST) { gl.sdf.dist = gl.sdf.pos.y; return; }
    */
        
    float fy = 0.8660254;
    float ry = fy*rd;
    float rx = rd*1.5;
    float dy = ry*2.0;
    s = vec2(rd*1.5, dy);
    
    vec2 c1, c2, c3;
    vec2 fps = floor(p/s);
    bool odd = mod(fps.x,2.0) >= 1.0;
    if (odd) fps.y += 0.5;
    
    c1 = fps*s; 
    
    if (odd)
    {
        c2 = c1+vec2(rx,-ry);
        c3 = c1+vec2(rx, ry);
    }
    else
    {
        c2 = c1+vec2( 0, dy);
        c3 = c1+vec2(rx, ry);
    }
          
    vec2  r1 = p - c1;
    vec2  r2 = p - c2;
    vec2  r3 = p - c3;
          
    float h1 = hexHeight(c1);
    float h2 = hexHeight(c2);
    float h3 = hexHeight(c3);
    
    float d1 = sdHexagon(vec3(r1.x,a.y-h1,r1.y), v0, vec3(rd*fy,h1,0.05));
    float d2 = sdHexagon(vec3(r2.x,a.y-h2,r2.y), v0, vec3(rd*fy,h2,0.05));
    float d3 = sdHexagon(vec3(r3.x,a.y-h3,r3.y), v0, vec3(rd*fy,h3,0.05));

    float d = min(min(d1,d2), d3);

    if (gl.march)
    {
        if      (d1 == d) hexid = c1;
        else if (d2 == d) hexid = c2;
        else if (d3 == d) hexid = c3;
    }
    
    sdMat(HEXA, d);
}

// 00     00   0000000   00000000   
// 000   000  000   000  000   000  
// 000000000  000000000  00000000   
// 000 0 000  000   000  000        
// 000   000  000   000  000        

float map(vec3 p)
{
    float t = sin(iTime)*0.5+0.5;
    
    gl.sdf = SDF(MAX_DIST, p, NONE);
    
    field();
    
    if (gl.march) sdMat(GLOW, sdSphere(gl.light2, 0.1));
    
    return gl.sdf.dist;
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
        d = map(p);
        t += min(d, max(0.0625,shoreDist(p)));
        if (d < MIN_DIST) return t;
        if (t > MAX_DIST) break;
    }
    gl.sdf.mat = NONE;
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

//  0000000  000   000   0000000   0000000     0000000   000   000  
// 000       000   000  000   000  000   000  000   000  000 0 000  
// 0000000   000000000  000000000  000   000  000   000  000000000  
//      000  000   000  000   000  000   000  000   000  000   000  
// 0000000   000   000  000   000  0000000     0000000   00     00  

float hardShadow(vec3 ro, vec3 n, vec3 lp)
{
    ro += 1.2*MIN_DIST*n;
    vec3 rd = normalize(lp-ro);
    float end = max(length(lp-ro), MIN_DIST);
    for (float t=float(ZERO); t<end;)
    {
        vec3 p = ro+rd*t;
        float d = map(p);
        if (d < MIN_DIST*0.5)
        {
            return 0.0;
        }
        t += min(d, max(0.06,shoreDist(p)));
    }
    return 1.0;
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

// 000      000   0000000   000   000  000000000  
// 000      000  000        000   000     000     
// 000      000  000  0000  000000000     000     
// 000      000  000   000  000   000     000     
// 0000000  000   0000000   000   000     000     

vec3 getLight(vec3 p, vec3 n, int mat, float d)
{
    if (mat == NONE) return black;
    if (mat == GLOW) return white;
    
    Mat m = material[mat-1];

    float shadow2 = dither ? 1.0 : hardShadow(p, n, gl.light2);
    
    vec3 bn = dither ? bumpMap(p, n, 0.003) : n;

    if (p.y > 0.25)
    {
        m.lum = 0.6+pow(mountain(hexid)*1.4, 2.0);
        // m.hue = sin(iTime*0.2)*0.5+0.5;
    }
    
    vec3  col = hsl(m.hue, m.sat, m.lum);
    
    float dl1 = dot(bn,normalize(gl.light1-p));
    float dl2 = dot(bn,normalize(gl.light2-p)) * shadow2;
    float dnl = foggy ? max(dl1*0.85, dl2) : max(dl1, dl2);
    
    col  = (light) ? gray(col) : col;
    
    col += pow(m.glossy, 3.0)*vec3(pow(smoothstep(0.0+m.glossy*0.9, 1.0, max(dl1, dl2)), 1.0+40.0*m.glossy));
    col *= clamp(pow(dnl, 1.0+m.shiny*20.0), gl.ambient, 1.0) * 
           max(gl.shadow, shadow2) *
           getOcclusion(p, n);

    if (p.y < 0.25)
    {
        vec2  p2 = abs(hexid+vec2(0.5,0.5));
        float d1 = sdLine(p2, vec2(100,HEX_DIST), vec2(-100,HEX_DIST))/HEX_DIST;
        float d2 = sdLine(p2, vec2(HEX_DIST*1.315,0), vec2(0.5*HEX_DIST*1.29,HEX_DIST))/HEX_DIST;
        col *= smoothstep(0.04, 0.3, min(d1, d2));
        col *= clamp01(pow(p.y*4.0, 1.5));
    }
        
    return clamp01(col);
}

/*
vec3 getLight2(vec3 p, vec3 n, vec3 rd, float d)
{
    vec3 col = v0;
    vec3 frc = v0;
    
    float ff;
    
    vec3 p2l = gl.light1-p;
    float lightDist = length(p2l);
    float atten = pow(max(0.0, 1.0-lightDist/40.0), 1.0);
        
    int mat = gl.sdf.mat;
    
    switch (mat)
    {
        case HEXA: 
            col = vec3(1,1,1); 
            frc = vec3(1,1,1);
            ff  = 1.0;
            p2l -= cam.dir*0.2;
            break;
    }
    
    float ao = occl ? getOcclusion(p, n) : 1.0;
        
    vec3 ln = normalize(p2l);
    
    float ambience = 0.01;
    float diff = max(dot(n, ln), 0.0);
    float spec = pow(max(dot(reflect(-ln, n), -rd), 0.0), 32.0);
    float fre  = pow(clamp(dot(n, rd) + 1.0, 0.0, 1.0), 1.0);
    
    float shading = softShadow(p, ln, 0.05, lightDist, 8.0);
    
    if (mat == HEXA) 
    {
        col *= diff + ambience + spec + frc*pow(fre,4.0)*ff;
        col *= atten*shading*ao;
    }
    
    if (light) col = vec3(atten*shading*ao*(diff + ambience + spec +pow(fre,4.0)*ff));
    else if (foggy) col = mix(vec3(0.001,0.0,0.0), col, 1.0/(1.0+d*d/MAX_DIST));
    
    return col;
}
*/
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
    for (int i = KEY_1; i <= KEY_9; i++) { if (keyDown(i)) { gl.option = i-KEY_1+1; break; } }
    
    rotate =  keyState(KEY_R);
    anim   =  keyState(KEY_RIGHT);
    occl   =  keyState(KEY_UP);
    dither =  keyState(KEY_D);
    normal = !keyState(KEY_X);
    depthb = !keyState(KEY_Z);
    light  = !keyState(KEY_LEFT);
    space  =  keyState(KEY_SPACE);
    foggy  =  keyState(KEY_F);
	
    if (anim)
        at = 0.5*iTime;
    
    initCam(CAM_DIST, vec2(0));
    
    lookAtFrom(vec3(0,0,2.5), vec3(0,0,0));
    lookPan(vec3(-at,0,0));
    if (rotate)
        orbit(sin(at*1.0)*10.0, sin(at*0.5)*5.0);
            
    // if (iMouse.z > 0.0)
        // lookAtFrom(vec3(-at,0,2.5), vec3(-at,0,2.5) + rotAxisAngle(vec3(0,0,-2.5-1.5*gl.mp.y), vy, gl.mp.x*90.0));
        
    #ifndef TOY
    if (space) lookAtFrom(iCenter, iCamera);
    #endif
    
    gl.uv = (2.0*fragCoord-iResolution.xy)/iResolution.y;
    vec3 rd = normalize(gl.uv.x*cam.x + gl.uv.y*cam.up + cam.fov*cam.dir);
    
    gl.light1 = cam.pos + 1.0*vy;
    gl.light2 = 2.0*vy*(2.4+1.5*(sin(iTime*0.2)*0.5+0.5)); //  - 1.0*vx;
    
    hexid = vec2(0);
    gl.march = true;
    float d = march(cam.pos, rd);
    gl.march = false;
    int mat = gl.sdf.mat;
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
        // col = getLight(p, n, rd, d);
        col = getLight(p, n, mat, d);
    }
        
    #ifndef TOY
    col += vec3(print(0,0,vec2(iFrameRate, iTime)));
    #endif    

    fragColor = vec4(sqrt(clamp(col, 0., 1.)), 1.0);
}