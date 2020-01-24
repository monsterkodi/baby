// #define TOY  1

#define MAX_STEPS 64
#define MIN_DIST  0.005
#define MAX_DIST  25.0

#define PI 3.1415926535897
#define ZERO min(iFrame,0)

#define NONE  0
#define HEAD  1
#define TAIL  2
#define BULB  3
#define PUPL  4

struct ray {
    vec3 pos;
    vec3 dir;
};

struct sdf {
    float dist;
    vec3  pos;
    int   mat;
};

sdf s;
int mat;
vec2 frag;
bool animat;
vec3 camPos;
vec3 camTgt;
vec3 camDir;

vec3 v0 = vec3(0,0,0);
vec3 vx = vec3(1,0,0);
vec3 vy = vec3(0,1,0);
vec3 vz = vec3(0,0,1);

vec3 red   = vec3(0.8,0.0,0.0);
vec3 green = vec3(0.0,0.5,0.0);
vec3 blue  = vec3(0.2,0.2,1.0);
vec3 white = vec3(1.0,1.0,1.0);

float rad2deg(float r) { return 180.0 * r / PI; }
float deg2rad(float d) { return PI * d / 180.0; }

vec3 posOnPlane(vec3 p, vec3 a, vec3 n)
{
    return p-dot(p-a,n)*n;
}

vec3 posOnPlane(vec3 p, vec3 n)
{
    return p-dot(p,n)*n;
}

// 0000000    000   0000000   000  000000000  
// 000   000  000  000        000     000     
// 000   000  000  000  0000  000     000     
// 000   000  000  000   000  000     000     
// 0000000    000   0000000   000     000     

float digit(int x, int y, float value, float format)
{     
    float digits  = floor(format);
    float decimal = fract(format)*10.0;
    vec2 pos = (frag-vec2(float(x),float(y))) / vec2(16.0, 25.0);
    
    if ((pos.y < 0.0) || (pos.y >= 1.0)) return 0.0;
    if ((pos.x < 0.0) || (pos.x >= digits+decimal+2.0)) return 0.0;
    
    bool neg = value < 0.0;
    value = abs(value);
    
    float log10 = log2(abs(value))/log2(10.0);
    float maxIndex = max(floor(log10), 0.0);
    float index = digits - floor(pos.x);
    float bin = 0.;
    if (index > (-decimal - 1.01))
    {
        if (index > maxIndex) { if (neg && index < maxIndex+1.5) bin = 1792.; } // minus sign 
        else if (index == -1.0) { if (decimal > 0.0) bin = 2.; } // decimal dot 
        else 
        {
            float reduced = value;
            if (index < 0.0) 
            { 
                reduced = fract(value); 
                index += 1.0; 
            }

            switch (int(floor(mod(abs(reduced/(pow(10.0, index))), 10.0))))
            {
            case 0: bin = 480599.; break;
            case 1: bin = 139810.+65536.; break;
            case 2: bin = 476951.; break;
            case 3: bin = 476999.; break;
            case 4: bin = 350020.; break;
            case 5: bin = 464711.; break;
            case 6: bin = 464727.; break;
            case 7: bin = 476228.; break;
            case 8: bin = 481111.; break;
            case 9: bin = 481095.; break;
            }
        }
    }

    return floor(mod((float(bin) / pow(2.0, floor(fract(pos.x)*4.0) + (floor(pos.y*5.0)*4.0))), 2.0));
}

//  0000000   000   000   0000000   000000000  
// 000   000  000   000  000   000     000     
// 000 00 00  000   000  000000000     000     
// 000 0000   000   000  000   000     000     
//  00000 00   0000000   000   000     000     

vec4 quatAxisAngle(vec3 axis, float angle)
{ 
    vec4 qr;
    float half_angle = deg2rad(angle * 0.5);
    qr.x = axis.x * sin(half_angle);
    qr.y = axis.y * sin(half_angle);
    qr.z = axis.z * sin(half_angle);
    qr.w = cos(half_angle);
    return qr;
}

vec4 quatConj(vec4 q)
{ 
    return vec4(-q.x, -q.y, -q.z, q.w); 
}
  
vec4 quatMul(vec4 q1, vec4 q2)
{ 
    vec4 qr;
    qr.x = (q1.w * q2.x) + (q1.x * q2.w) + (q1.y * q2.z) - (q1.z * q2.y);
    qr.y = (q1.w * q2.y) - (q1.x * q2.z) + (q1.y * q2.w) + (q1.z * q2.x);
    qr.z = (q1.w * q2.z) + (q1.x * q2.y) - (q1.y * q2.x) + (q1.z * q2.w);
    qr.w = (q1.w * q2.w) - (q1.x * q2.x) - (q1.y * q2.y) - (q1.z * q2.z);
    return qr;
}

vec3 rotate(vec4 quat, vec3 p)
{
    vec4 conj = quatConj(quat);
    vec4 q_tmp = quatMul(quat, vec4(p, 0));
    return quatMul(q_tmp, conj).xyz;
}

vec3 rotate(vec4 quat, vec3 o, vec3 p)
{
    vec4 conj = quatConj(quat);
    vec4 q_tmp = quatMul(quat, vec4(p-o, 0));
    return o + quatMul(q_tmp, conj).xyz;
}

// 00000000    0000000   000000000  
// 000   000  000   000     000     
// 0000000    000   000     000     
// 000   000  000   000     000     
// 000   000   0000000      000     

vec3 rotAxisAngle(vec3 position, vec3 axis, float angle)
{ 
    vec4 qr = quatAxisAngle(axis, angle);
    vec4 qr_conj = quatConj(qr);
    vec4 q_pos = vec4(position.x, position.y, position.z, 0);
    
    vec4 q_tmp = quatMul(qr, q_pos);
    qr = quatMul(q_tmp, qr_conj);
    
    return vec3(qr.x, qr.y, qr.z);
}

vec3 rotRayAngle(vec3 position, vec3 ro, vec3 rd, float angle)
{ 
    return rotAxisAngle(position-ro, rd-ro, angle)+ro;
}

//  0000000   00000000   
// 000   000  000   000  
// 000   000  00000000   
// 000   000  000        
//  0000000   000        

float opUnion(float d1, float d2) 
{
    float k = 0.05;
    float h = clamp(0.5 + 0.5*(d2-d1)/k, 0.0, 1.0);
    return mix(d2, d1, h) - k*h*(1.0-h);
}

float opUnion(float d1, float k, float d2) 
{
    float h = clamp(0.5 + 0.5*(d2-d1)/k, 0.0, 1.0);
    return mix(d2, d1, h) - k*h*(1.0-h);
}

float opDiff(float d1, float d2) 
{
    float k = 0.05;
    float h = clamp(0.5 - 0.5*(d2+d1)/k, 0.0, 1.0);
    return mix(d1, -d2, h) + k*h*(1.0-h); 
}

float opDiff(float d1, float k, float d2) 
{
    float h = clamp(0.5 - 0.5*(d2+d1)/k, 0.0, 1.0);
    return mix(d1, -d2, h) + k*h*(1.0-h); 
}

//  0000000  0000000    
// 000       000   000  
// 0000000   000   000  
//      000  000   000  
// 0000000   0000000    

float sdSphere(vec3 p, vec3 a, float r)
{
    return length(p-a)-r;
}

float sdPlane(vec3 p, vec3 a, vec3 n)
{   
    return dot(n, p-a);
}

float sdCone(vec3 p, vec3 a, vec3 b, float r1, float r2)
{
    vec3 ab = b-a;
    vec3 ap = p-a;
    float t = dot(ab,ap) / dot(ab,ab);
    t = clamp(t, 0.0, 1.0);
    vec3 c = a + t*ab;
    return length(p-c)-(t*r2+(1.0-t)*r1);      
}

float sdTorus(vec3 p, vec3 a, vec3 n, vec2 r)
{
    vec3 q = p-a;
    return length(vec2(length(posOnPlane(q, n))-r.x,abs(dot(n, q))))-r.y;
}

float sdEllipsoid( in vec3 p, in vec3 r )
{
    float k0 = length(p/r);
    float k1 = length(p/(r*r));
    return k0*(k0-1.0)/k1;
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r)
{
    vec3 ab = b-a;
    vec3 ap = p-a;
    float t = dot(ab,ap) / dot(ab,ab);
    t = clamp(t, 0.0, 1.0);
    vec3 c = a + t*ab;
    return length(p-c)-r;        
}

// 000      00000000   0000000   00000000  
// 000      000       000   000  000       
// 000      0000000   000000000  000000    
// 000      000       000   000  000       
// 0000000  00000000  000   000  000       

void leaf()
{    
    vec3 pos = s.pos;
    pos.y -= cos(0.4*pos.z)+0.3*cos(pos.x);
    
    pos.x = abs(pos.x);
    float d = sdEllipsoid(pos, vec3(2.2, 0.3, 4.3)*1.0);
    
    vec2 cd = vec2(cos(abs(pos.z/2.43)*PI/5.0)*(2.8)-pos.x, fract(pos.z));
    float co = 0.65 - length(cd - vec2(0.5, 0.5));
    
    d = opDiff(d, 0.2, -co);
    
    if (d < s.dist) { s.mat = TAIL; s.dist = d; }
}

// 000000000  000   000  000   0000000  000000000  
//    000     000 0 000  000  000          000     
//    000     000000000  000  00 00000      000     
//    000     000   000  000       000     000     
//    000     00     00  000  0000000      000     

void twist()
{
    vec3 r = vec3( 0, 0, 1);
    vec3 n = vec3( -1, 0, 0); 
    vec3 p = s.pos;
    
    float d = 1000.0;
    
    vec3 p1 = v0;
    vec3 p2 = p1 + n;
    
    float lf = 1.0;
    float sf = 1.0;
    float a = 12.0; // sin(iTime)*30.0;
    
    for (int i = 0; i < 25; i++)
    {
        d = min(d, sdCone(p, p1, p2, 0.5*sf, 0.5*sf*0.9));
        p1 = p2;
        n  = rotAxisAngle(n, r, a) * lf;
        sf *= 0.9;
        lf *= 0.991;
        p2 += n;
    }
    
    if (d < s.dist) { s.mat = HEAD; s.dist = d; }
}

//  0000000  000   000  00000000   000      
// 000       000   000  000   000  000      
// 000       000   000  0000000    000      
// 000       000   000  000   000  000      
//  0000000   0000000   000   000  0000000  

void curl()
{
    vec3 p = s.pos;
    
    if (p.x > 0.0)
    {
        p -= vec3(2,0,0);
        p = rotAxisAngle(p, vz, length(p)*10.0);
        p += vec3(2,0,0);
    }

    float d = sdCapsule(p, 10.0*vx, -10.0*vx, 1.1);
    if (d < s.dist) { s.mat = HEAD; s.dist = d; }
}

// 00     00   0000000   00000000   
// 000   000  000   000  000   000  
// 000000000  000000000  00000000   
// 000 0 000  000   000  000        
// 000   000  000   000  000        

float map(vec3 p)
{
    s = sdf(1000.0, p, NONE);
     
    //leaf();
    //twist();
    curl();

    return s.dist;
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
    s.mat = NONE;
    return dz;
}

//  0000000  000   000   0000000   0000000     0000000   000   000  
// 000       000   000  000   000  000   000  000   000  000 0 000  
// 0000000   000000000  000000000  000   000  000   000  000000000  
//      000  000   000  000   000  000   000  000   000  000   000  
// 0000000   000   000  000   000  0000000     0000000   00     00  

float hardShadow(vec3 ro, vec3 rd, float mint, float maxt, const float w)
{
    for (float t=mint+float(ZERO); t<maxt;)
    {
        float h = map(ro+rd*t);
        if (h < 0.001)
        {
            return w;
        }
        t+=h;
    }
    return 1.0;
}

float softShadow(vec3 ro, vec3 lp, float k)
{
    const int maxIterationsShad = 24; 
    
    vec3 rd = (lp-ro);

    float shade = 1.;
    float dist = .0035;    
    float end = max(length(rd), .001);
    float stepDist = end/float(maxIterationsShad);
    
    rd /= end;

    for (int i=0; i<maxIterationsShad; i++)
    {
        float h = map(ro + rd*dist);
        shade = min(shade, k*h/dist);
        dist += clamp(h, .02, stepDist*2.);
        
        if (h<.0001 || dist > end) break; 
    }

    return min(max(shade, 0.) + .05, 1.); 
}

// 000      000   0000000   000   000  000000000  
// 000      000  000        000   000     000     
// 000      000  000  0000  000000000     000     
// 000      000  000   000  000   000     000     
// 0000000  000   0000000   000   000     000     

float getLight(vec3 p, vec3 n)
{
    vec3 cr = cross(camDir, vec3(0,1,0));
    vec3 up = normalize(cross(cr,camDir));
    vec3 lp = camPos + vec3(0,2.0,0) + up*5.0; 
    lp *= 5.0;
    vec3 l = normalize(lp-p);
 
    float ambient = 0.005;
    float dif = clamp(dot(n,l), 0.0, 1.0);
    if (mat == PUPL || mat == TAIL)
    {
        dif = clamp(dot(n,normalize(mix(camPos,lp,0.1)-p)), 0.0, 1.0);
        dif = mix(pow(dif, 16.0), 1.0*dif, 0.2);
        dif += 1.0 - smoothstep(0.0, 0.2, dif);
        if (mat == PUPL) ambient = 0.1;
    }
    else if (mat == BULB)
    {
        dif = mix(pow(dif, 32.0), 3.0*dif+1.0, 0.2);
        ambient = 0.2;
    }
    else if (mat == HEAD)
    {
        dif = pow(dif, 4.0);
    }
    //dif *= hardShadow(p, normalize(lp-p), MIN_DIST, 100.0, 0.2);
    dif *= softShadow(p, lp, 1.4);        
    return clamp(dif, ambient, 1.0);
}

// 00     00   0000000   000  000   000  
// 000   000  000   000  000  0000  000  
// 000000000  000000000  000  000 0 000  
// 000 0 000  000   000  000  000  0000  
// 000   000  000   000  000  000   000  

const int KEY_LEFT  = 37;
const int KEY_UP    = 38;
const int KEY_RIGHT = 39;
const int KEY_DOWN  = 40;
const int KEY_SPACE = 32;

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{    
    frag = fragCoord;
    bool camrot = texelFetch(iChannel0, ivec2(KEY_RIGHT, 2), 0).x > 0.5;
    bool scroll = texelFetch(iChannel0, ivec2(KEY_DOWN,  2), 0).x > 0.5;
    bool space  = texelFetch(iChannel0, ivec2(KEY_SPACE, 2), 0).x < 0.5;
         animat = texelFetch(iChannel0, ivec2(KEY_UP,    2), 0).x > 0.5;
            
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
    vec3 ct;
    
    float aspect = iResolution.x/iResolution.y;
    
    float md = 5.5;
    float mx = 2.0*(iMouse.x/iResolution.x-0.5);
    float my = 2.0*(iMouse.y/iResolution.y-0.5);
    
    if (iMouse.z <= 0.0 && camrot)
    {
        float ts = 276.2;
        mx = 0.3*sin(ts+iTime/12.0);
        my = -0.20-0.10*cos(ts+iTime/8.0);
    }
    
    camTgt = vec3(0,1.2,0); 

    camPos = rotAxisAngle(rotAxisAngle(vec3(0,0,md), vx, 89.0*my), vy, -180.0*mx);
    
    #ifndef TOY
        if (space)
        {
            camTgt = iCenter;
            camPos = iCamera;
            camPos.x *= -1.0;
            camTgt.x *= -1.0;
        }
    #endif
    
    camDir = normalize(camTgt-camPos);
    
    vec3 ww = normalize(camTgt-camPos);
    vec3 uu = normalize(cross(ww, vec3(0,1,0)));
    vec3 vv = normalize(cross(uu, ww));
        
    vec3 rd = normalize(uv.x*uu + uv.y*vv + ww);

    float d = rayMarch(camPos, rd);
    mat = s.mat;
    
    vec3  p = camPos + d * rd;
    vec3  n = getNormal(p);
        
    vec3 col;
    
    if (mat == NONE)  
    {
        vec2 guv = fragCoord.xy - iResolution.xy / 2.;
        float grid = dot(step(mod(guv.xyxy, vec4(10,10,100,100)), vec4(1)), vec4(.5, .5, 1., 1.));
        col = mix(vec3(.001), vec3(0.02,0.02,0.02), grid);
    }
    else if (mat == HEAD)  col = getLight(p,n) * vec3(0.1);

    #ifndef TOY
    col = mix(col, white, digit(0,   0,  iFrameRate, 2.0));
    col = mix(col, blue,  digit(0,  40,  iTime,      4.1));
    col = mix(col, green, digit(150, 0,  iMouse.y,   5.0));
    col = mix(col, red,   digit(150, 40, iMouse.x,   5.0));
    col = mix(col, green, digit(250, 0,  my,         3.2));
    col = mix(col, red,   digit(250, 40, mx,         3.2));
    if (frag.x >= 350. && frag.x < 550. && frag.y < 25.)
    {
        uv = (iMouse.xy-.5*iResolution.xy)/iResolution.y;
        rd = normalize(uv.x*uu + uv.y*vv + ww);
        d  = rayMarch(camPos, rd);
        if (d < MAX_DIST)
            col = mix(col, blue, digit(350, 0,  d,      3.2));
    }
    #endif
    
    col = pow(col, vec3(1.0/2.2));
    fragColor = vec4(col, 1.0);
}
