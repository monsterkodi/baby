// https://www.shadertoy.com/view/4lyGzR 'Biomine' by Shane

#define keys(x,y)  texelFetch(iChannel0, ivec2(x,y), 0)
bool keyState(int key) { return keys(key, 2).x < 0.5; }
bool keyDown(int key)  { return keys(key, 0).x > 0.5; }

#define ZERO min(iFrame,0)
#define CAM_DIST   0.01
#define MAX_STEPS  256
#define MIN_DIST   0.001
#define MAX_DIST   60.0

bool space, anim, soft, occl, light, dither, foggy, rotate, normal, depthb;

float hash(float n) { return fract(cos(n)*45758.5453); }
mat2  rot2(float a) { vec2 v = sin(vec2(1.570796, 0) + a); return mat2(v, -v.y, v.x); }

int screen;

float noise3D(in vec3 p)
{
	const vec3 s = vec3(7, 157, 113);
	vec3 ip = floor(p); p -= ip; 
    vec4 h = vec4(0., s.yz, s.y + s.z) + dot(ip, s);
    p = p*p*(3. - 2.*p); 
    h = mix(fract(sin(h)*43758.5453), fract(sin(h + s.x)*43758.5453), p.x);
    h.xy = mix(h.xz, h.yw, p.y);
    return mix(h.x, h.y, p.z);
}

float drawSphere(in vec3 p)
{
    p = fract(p)-.5;    
    return dot(p, p);
}

float cellTile(in vec3 p)
{
    vec4 d; 
    d.x = drawSphere(p - vec3(.81, .62, .53)); p.xy = vec2(p.y-p.x, p.y + p.x)*.7071;
    d.y = drawSphere(p - vec3(.39, .2,  .11)); p.yz = vec2(p.z-p.y, p.z + p.y)*.7071;
    d.z = drawSphere(p - vec3(.62, .24, .06)); p.xz = vec2(p.z-p.x, p.z + p.x)*.7071;
    d.w = drawSphere(p - vec3(.2,  .82, .64));
    d.xy = min(d.xz, d.yw);
    return min(d.x, d.y)*2.66;
}

// 00     00   0000000   00000000   
// 000   000  000   000  000   000  
// 000000000  000000000  00000000   
// 000 0 000  000   000  000        
// 000   000  000   000  000        

float map(vec3 p)
{
    float t = sin(iTime)*0.5+0.5;
    // p += sin(p.zxy*0.3) + sin(p.yzx*0.3); //  * (sin(iTime*0.5)*0.5+0.5); // space perturbance
    if (anim)
        p *= rotMat(normalize(cam.x), 0.6*length((p-cam.pos).yz));
    float d1 = dot(cos(p*PI2), sin(p.yzx*PI2)) + 1.0; // gyroid lattice
    // float d2 = dot(cos(p*PI2), sin(p.xzy*PI2*1.0001)) + 1.1; // vertical struts
    float d2 = MAX_DIST;
    // float d3 = dot(cos(p*PI2), cos(p.xzy*PI2)) + 1.1; // bobbles
    float d3 = MAX_DIST; // bobbles
    float d = opUnion(opUnion(d1, d2), d3);
    // return d + sin(iTime*0.5)*.05; 
    // d = d1;
    
    d = min(d, length(p-gl.light1+vec3(0,0.4,0))-0.4);
    
    return d + 0.25; // +sin(iTime*0.5)*.05; 
}

// 0000000    000   000  00     00  00000000   
// 000   000  000   000  000   000  000   000  
// 0000000    000   000  000000000  00000000   
// 000   000  000   000  000 0 000  000        
// 0000000     0000000   000   000  000        

float bumpSurf( in vec3 p)
{
    return cellTile(p*10.0) + 0.2*noise3D(p*96.0);
}

vec3 doBumpMap(in vec3 p, in vec3 nor, float factor)
{
    if (anim)
        p *= rotMat(normalize(cam.x), 0.6*length((p-cam.pos).yz));
    
    const vec2 e = vec2(0.001, 0);
    float ref = bumpSurf(p);                 
    vec3 grad = (vec3(bumpSurf(p - e.xyy),
                      bumpSurf(p - e.yxy),
                      bumpSurf(p - e.yyx))-ref)/e.x;                     
    grad -= nor*dot(nor, grad);          
    return normalize( nor + grad*factor );
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
        // if (abs(h)<0.002*(t*.125 + 1.) || t>MAX_DIST) break; 
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
    
    n = doBumpMap(p, n, 0.008);
    
    float ao = occl ? calculateAO(p, n) : 1.0;
    
    vec3 ld = gl.light1-p;

    float distlpsp = max(length(ld), 0.001);
    
    ld /= distlpsp;
    
    float atten = 1.0/(1.0 + distlpsp*0.25);
    float ambience = 0.1;
    float diff = max(dot(n, ld), 0.0);
    float spec = pow(max(dot(reflect(-ld, n), -rd), 0.0), 32.0);
    float fre  = pow(clamp(dot(n, rd) + 1.0, 0.0, 1.0), 1.0);
    
    float shading = softShadow(p, ld, 0.05, distlpsp, 8.0);
    
    col = vec3(1,0,0)*(diff + ambience + spec);
    col += vec3(0.8, 0.5, 0)*pow(fre, 4.0)*2.0;
    col *= atten*shading*ao;
    
    if (light) col = vec3(ao);
    else if (foggy) col = mix(vec3(0.02,0.0,0.0), col, 1.0/(1.0+4.0*d*d/(MAX_DIST/2.0)));
    
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
    soft   = !keyState(KEY_DOWN);
    space  = !keyState(KEY_SPACE);
    foggy  =  keyState(KEY_F);
	
    float t = 0.5*iTime;
    
    initCam(CAM_DIST, (iMouse.z > 0.0 ? -gl.mp : (rotate 
        // ? vec2(0.2*cos(iTime*0.15), -0.2+0.4*sin(iTime*0.3)) 
        ? vec2(0,0) 
        : -gl.mp)));
    
    if (iMouse.z < 1.0 && rotate) 
    {
        lookAtFrom(vec3(0,0,2.5), vec3(0,0,0));
        lookPan(vec3(-t,0,0));
        orbit(sin(t*1.0)*10.0, sin(t*0.5)*5.0);
    }
        
    #ifndef TOY
    if (space) lookAtFrom(iCenter, iCamera);
    #endif
    
    gl.uv = (2.0*fragCoord-iResolution.xy)/iResolution.y;
    vec3 rd = normalize(gl.uv.x*cam.x + gl.uv.y*cam.up + cam.fov*cam.dir);
    
    // gl.light1 = cam.pos+cam.dir*3.5 - sin(-PI2+iTime*PI2)*cam.up;
    
    vec3 cd = vz;
    vec3 cu = vy;
    vec3 lp = vec3(-t,0,0);
    gl.light1 = lp+cd*(2.5+0.4*(1.35 + cos(1.7+t*PI2))) + cu*(0.35-0.5*(sin(-PI2+t*PI2)));
    
    float d = march(cam.pos, rd);
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
        col = getLight(p, n, rd, d);
    }
        
    #ifndef TOY
    col += vec3(print(0,0,vec2(iFrameRate, iTime)));
    #endif    

    fragColor = vec4(sqrt(clamp(col, 0., 1.)), 1.0);
}