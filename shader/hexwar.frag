// https://www.shadertoy.com/view/4lyGzR 'Biomine' by Shane

#define keys(x,y)  texelFetch(iChannel0, ivec2(x,y), 0)
bool keyState(int key) { return keys(key, 2).x < 0.5; }
bool keyDown(int key)  { return keys(key, 0).x > 0.5; }

#define ZERO min(iFrame,0)
#define CAM_DIST   1.0
#define MAX_STEPS  128
#define MIN_DIST   0.001
#define MAX_DIST   160.0

#define NONE 0
#define HEXA 1
#define TANK 2

bool space, anim, soft, occl, light, dither, foggy, rotate, normal, depthb;

float hash(float n) { return fract(cos(n)*45758.5453); }
mat2  rot2(float a) { vec2 v = sin(vec2(1.570796, 0) + a); return mat2(v, -v.y, v.x); }

float at;
int screen;

// 000   000  00000000  000   000   0000000   
// 000   000  000        000 000   000   000  
// 000000000  0000000     00000    000000000  
// 000   000  000        000 000   000   000  
// 000   000  00000000  000   000  000   000  

void hexa()
{
    sdMat(HEXA, sdHexagon(v0, vec3(1,1,0.1))); 
    sdMat(TANK, sdSphere(v0, 1.001)); 
}

float hexHeight(vec2 p)
{
    return dot(sin(p*2.0 - cos(p.yx*1.4)), vec2(0.25)) + 0.5;
}
 
void field()
{
    vec3 a = gl.sdf.pos;
    vec2 p = a.xz;
    const float r = 0.25;
    const vec2 s = vec2(0.866025, 1);
    vec4 c1 = floor(vec4(p, p - vec2(0,0.5))/s.xyxy) + vec4(0,0,0,0.5);
    vec4 c2 = floor(vec4(p - vec2(0.5,0.25), p - vec2(0.5,0.75))/s.xyxy) + vec4(0.5,0.25,0.5,0.75);
    
    vec4 h1 = vec4(p - (c1.xy + 0.5)*s, p - (c1.zw + 0.5)*s);
    vec4 h2 = vec4(p - (c2.xy + 0.5)*s, p - (c2.zw + 0.5)*s);
    
    vec4 obj = vec4(sdHexagon(vec3(h1.x,a.y,h1.y), v0, vec3(r,hexHeight(c1.xy),0.05)),
                    sdHexagon(vec3(h1.z,a.y,h1.w), v0, vec3(r,hexHeight(c1.zw),0.05)),
                    sdHexagon(vec3(h2.x,a.y,h2.y), v0, vec3(r,hexHeight(c2.xy),0.05)),
                    sdHexagon(vec3(h2.z,a.y,h2.w), v0, vec3(r,hexHeight(c2.zw),0.05)));
                    
    float d = min(min(obj.x, obj.y), min(obj.z, obj.w));

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
    
    // hexa();
    
    field();
    
    return gl.sdf.dist;
}

// 00     00   0000000   00000000    0000000  000   000  
// 000   000  000   000  000   000  000       000   000  
// 000000000  000000000  0000000    000       000000000  
// 000 0 000  000   000  000   000  000       000   000  
// 000   000  000   000  000   000   0000000  000   000  

float march(in vec3 ro, in vec3 rd)
{
    float t = 0.0, h;
    for(int i = 0; i < 72; i++)
    {
        h = map(ro+rd*t);
        if (abs(h)<0.001*max(t*.25, 1.) || t>MAX_DIST) break;        
        t += step(h, 1.)*h*.2 + h*.5;
    }
    return min(t, MAX_DIST);
}

vec3 getNormal(in vec3 p) 
{
	const vec2 e = vec2(0.002, 0);
	return normalize(vec3(map(p + e.xyy) - map(p - e.xyy), map(p + e.yxy) - map(p - e.yxy),	map(p + e.yyx) - map(p - e.yyx)));
}

//  0000000  000   000   0000000   0000000     0000000   000   000  
// 000       000   000  000   000  000   000  000   000  000 0 000  
// 0000000   000000000  000000000  000   000  000   000  000000000  
//      000  000   000  000   000  000   000  000   000  000   000  
// 0000000   000   000  000   000  0000000     0000000   00     00  

float softShadow(vec3 ro, vec3 rd, float start, float end, float k)
{
    float shade = 1.0;
    float dist = start;

    for (int i=0; i<16; i++)
    {
        float h = map(ro + rd*dist);
        shade = min(shade, k*h/dist);

        dist += clamp(h, 0.01, 0.25);
        
        if (h<0.001 || dist > end) break; 
    }
    return min(max(shade, 0.) + 0.1, 1.0); 
}

//  0000000   00     00  0000000    000  00000000  000   000  000000000    
// 000   000  000   000  000   000  000  000       0000  000     000       
// 000000000  000000000  0000000    000  0000000   000 0 000     000       
// 000   000  000 0 000  000   000  000  000       000  0000     000       
// 000   000  000   000  0000000    000  00000000  000   000     000       

float calculateAO( in vec3 p, in vec3 n )
{
	float ao = 0.0, l;
    const float maxDist = 3.;
    const float nbIte = 1.0;
    for( float i=1.; i< nbIte+.5; i++ )
    {
        l = (i + hash(i))*.5/nbIte*maxDist;
        ao += (l - map( p + n*l ))/(1.+ l); 
    }
    return clamp(1.- ao/nbIte, 0., 1.);
}

// 000      000   0000000   000   000  000000000  
// 000      000  000        000   000     000     
// 000      000  000  0000  000000000     000     
// 000      000  000   000  000   000     000     
// 0000000  000   0000000   000   000     000     

vec3 getLight(vec3 p, vec3 n, vec3 rd, float d)
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
    
    float ao = occl ? calculateAO(p, n) : 1.0;
        
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
// 00     00   0000000   000  000   000  
// 000   000  000   000  000  0000  000  
// 000000000  000000000  000  000 0 000  
// 000 0 000  000   000  000  000  0000  
// 000   000  000   000  000  000   000  

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    initGlobal(fragCoord, iResolution, iMouse, iTime);
    gl.zero = ZERO;
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
    
    gl.light1 = cam.pos + 2.0*cam.up - 1.0*cam.x;
    
    gl.march = true;
    float d = march(cam.pos, rd);
    vec3  p = cam.pos + d * rd;
    vec3  n = getNormal(p);
    vec3  col = v0;
    gl.march = false;
           
    if (normal || depthb)
    {
        vec3 nc = normal ? d >= MAX_DIST ? black : n : white;
        vec3 zc = depthb ? vec3(1.0-pow(d/MAX_DIST,0.1)) : white;
        col = nc*zc;
    }
    else
    {
        col = getLight(p, n, rd, d);
    }
        
    #ifndef TOY
    col += vec3(print(0,0,vec2(iFrameRate, iTime)));
    #endif    

    fragColor = vec4(sqrt(clamp(col, 0., 1.)), 1.0);
}