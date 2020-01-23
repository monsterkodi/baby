// #define TOY  1

#define MAX_STEPS 128
#define MIN_DIST   0.005
#define MAX_DIST  50.0
#define SHADOW     0.3
#define FLOOR      0.0

#define PI 3.1415926535897
#define ZERO min(iFrame,0)
#define AA 2

#define NONE  0
#define PLANE 1
#define HEAD  2
#define BULB  3
#define PUPL  4
#define BLCK  5
#define BBOX  6

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
bool soft;
float brth;
bool animat;
vec3 camPos;
vec3 camTgt;
vec3 camDir;

vec3 v0 = vec3(0,0,0);
vec3 vx = vec3(1,0,0);
vec3 vy = vec3(0,1,0);
vec3 vz = vec3(0,0,1);
    
float rad2deg(float r) { return 180.0 * r / PI; }
float deg2rad(float d) { return PI * d / 180.0; }

vec3 hash33(vec3 p3)
{
    p3 = fract(p3 * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy + p3.yxx)*p3.zyx);
}

vec3 hash31(float p)
{
   vec3 p3 = fract(vec3(p) * vec3(.1031, .1030, .0973));
   p3 += dot(p3, p3.yzx+33.33);
   return fract((p3.xxy+p3.yzz)*p3.zyx); 
}

float clamp01(float v) { return clamp(v, 0.0, 1.0); }

float gradientNoise(vec2 uv)
{
    return fract(52.9829189 * fract(dot(uv, vec2(0.06711056, 0.00583715))));
}

// 0000000    000   0000000   000  000000000  
// 000   000  000  000        000     000     
// 000   000  000  000  0000  000     000     
// 000   000  000  000   000  000     000     
// 0000000    000   0000000   000     000     

float digitBin(const int x)
{
    return x==0?480599.0:x==1?139810.0:x==2?476951.0:x==3?476999.0:x==4?350020.0:x==5?464711.0:x==6?464727.0:x==7?476228.0:x==8?481111.0:x==9?481095.0:0.0;
}

float digit(vec2 vStringCoords, float fValue, float fMaxDigits, float fDecimalPlaces)
{       
    if ((vStringCoords.y < 0.0) || (vStringCoords.y >= 1.0)) return 0.0;
    
    bool bNeg = fValue < 0.0;
    fValue = abs(fValue);
    
    float fLog10Value = log2(abs(fValue)) / log2(10.0);
    float fBiggestIndex = max(floor(fLog10Value), 0.0);
    float fDigitIndex = fMaxDigits - floor(vStringCoords.x);
    float fCharBin = 0.0;
    if (fDigitIndex > (-fDecimalPlaces - 1.01)) 
    {
        if (fDigitIndex > fBiggestIndex) 
        {
            if((bNeg) && (fDigitIndex < (fBiggestIndex+1.5))) fCharBin = 1792.0;
        } 
        else 
        {
            if (fDigitIndex == -1.0) 
            {
                if (fDecimalPlaces > 0.0) fCharBin = 2.0;
            } 
            else 
            {
                float fReducedRangeValue = fValue;
                if (fDigitIndex < 0.0) { fReducedRangeValue = fract( fValue ); fDigitIndex += 1.0; }
                float fDigitValue = (abs(fReducedRangeValue / (pow(10.0, fDigitIndex))));
                fCharBin = digitBin(int(floor(mod(fDigitValue, 10.0))));
            }
        }
    }
    return floor(mod(fCharBin / pow(2.0, floor(fract(vStringCoords.x) * 4.0) + (floor(vStringCoords.y * 5.0) * 4.0)), 2.0));
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

vec3 posOnPlane(vec3 p, vec3 n)
{
    return p-dot(p,n)*n;
}

float sdTorus(vec3 p, vec3 a, vec3 n, float rl, float rs)
{
    vec3 q = p-a;
    return length(vec2(length(posOnPlane(q, n))-rl,abs(dot(n, q))))-rs;
}

float sdConeBend(vec3 p, vec3 a, vec3 b, float fa, float fb, bool smth)
{
    vec3 ab = b-a;
    vec3 ap = p-a;
    vec3 n  = normalize(ab);
    float l = length(ab);
    float dp = dot(ab,ap);
    float dn = dot(ab,ab);
    float t = dp / dn;
    float ct = clamp(t, -0.5, 10.0);
    float ra = l*fa;
    float rb = l*fb;
    
    vec3 lp = a+ab*clamp01(t);
    return length(p-lp) - (ct*rb+(1.0-ct)*ra);
}

// 00000000  000   000  00000000  
// 000        000 000   000       
// 0000000     00000    0000000   
// 000          000     000       
// 00000000     000     00000000  

void eye(vec3 pos, vec3 pupil, vec3 lens)
{
    float d = sdSphere(s.pos, pos, 0.35);
    if (d > s.dist) return;
    
    d = opDiff(d, 0.05, sdSphere(s.pos, pupil, 0.15));

    if (d < s.dist) { s.mat = BULB; s.dist = d; }
    
    d = min(d, sdSphere(s.pos, lens, 0.2));
    
    if (d < s.dist) { s.mat = PUPL; s.dist = d; }
}

// 000      00000000   0000000   
// 000      000       000        
// 000      0000000   000  0000  
// 000      000       000   000  
// 0000000  00000000   0000000   

float leg(vec3 pos, vec3 n)
{
    float d = sdConeBend(s.pos, pos, pos+n*0.2, 2.1, 2.5, true);
    
    d = opDiff(d, 0.2, sdPlane(s.pos, pos+n*0.5, -n));
    d = opDiff(d, 0.1, sdSphere(s.pos, pos+n*0.7, 0.4));
    
    return d;
}

float ear(vec3 pos, vec3 n)
{
    float d = sdConeBend(s.pos, pos, pos+n*0.22, 1.0, 1.3, true);
    
    d = opDiff(d, 0.2, sdSphere(s.pos, pos+n*(0.6 + 0.15*brth/2.0), 0.1));
    
    return d;
}

// 000   000  00000000   0000000   0000000    
// 000   000  000       000   000  000   000  
// 000000000  0000000   000000000  000   000  
// 000   000  000       000   000  000   000  
// 000   000  00000000  000   000  0000000    

void head(vec3 pos)
{        
    float bd = sdSphere(s.pos, pos, 1.75);    

    if (bd > MIN_DIST*1.1) 
    {
        if (bd < s.dist) { s.mat = BBOX; s.dist = bd; }
        return;
    }

    float tt = 1.0-fract(iTime*0.35);
    float aa = cos(tt*tt*PI*2.0); 
    float ab = cos(tt*PI*2.0); 
    
    brth = 2.0*mix(smoothstep(-0.8, 0.95, aa), ab, 0.3);
    pos.z -= brth*0.015;
    vec3 off = vec3(0, 1.35, 0);
    
    vec3 ny = rotAxisAngle(vy, vx, -2.0*brth);
    vec3 nz = rotAxisAngle(vz, vx, -2.0*brth);
    float d = sdSphere(s.pos, pos, 1.0+brth*0.01);

    vec3 earln = rotAxisAngle(rotAxisAngle(nz, vx, -48.0), ny,  130.0);
    vec3 earrn = rotAxisAngle(rotAxisAngle(nz, vx, -48.0), ny, -130.0);
    d = opUnion(d, 0.2, ear(pos + earln, normalize(earln+hash31(floor(iTime*0.7))*0.2)));
    d = opUnion(d, 0.2, ear(pos + earrn, normalize(earrn+hash31(floor(iTime*0.7)+0.5)*0.2)));
    
    vec3 eyeln = rotAxisAngle(rotAxisAngle(nz, vx, -42.0), ny,  48.0);
    vec3 eyern = rotAxisAngle(rotAxisAngle(nz, vx, -42.0), ny, -48.0);
    vec3 eyel  = pos + eyeln*0.9;
    vec3 eyer  = pos + eyern*0.9;
        
    d = opUnion(d, 0.15, sdTorus(s.pos, eyel, eyeln, 0.4, 0.05));
    d = opUnion(d, 0.15, sdTorus(s.pos, eyer, eyern, 0.4, 0.05));
    
    vec3 legln = rotAxisAngle(rotAxisAngle(vz, vx, 42.0 - 3.0*brth), ny,  120.0);
    vec3 legrn = rotAxisAngle(rotAxisAngle(vz, vx, 42.0 - 3.0*brth), ny, -120.0);
    vec3 legfn = rotAxisAngle(rotAxisAngle(vz, vx, 42.0 + 0.5*brth), ny,    0.0);
    
    d = opUnion(d, 0.2, leg(pos + legln, legln));
    d = opUnion(d, 0.2, leg(pos + legrn, legrn));
    d = opUnion(d, 0.2, leg(pos + legfn, legfn));
    
    if (d < s.dist) { s.mat = HEAD; s.dist = d; }
    
    vec3 hsh1 = hash31(floor(iTime*0.3));
    vec3 hsh2 = hash31(floor(iTime));
    
    vec3 cp = camPos + hsh1*2.0 + hsh2*0.5;
    vec3 nl = normalize(cp - eyel);
    vec3 nr = normalize(cp - eyer);
        
    float pd = 0.3;
    float ld = 0.16;
    
    eye(eyel, eyel + pd*nl, eyel + ld*nl);
    eye(eyer, eyer + pd*nr, eyer + ld*nr);
}

void plane(vec3 pos)
{        
    if (camPos.y < FLOOR) return;
    float d = sdPlane(s.pos, pos, vy);
    if (d < s.dist) { s.mat = PLANE; s.dist = d; }
}

// 00     00   0000000   00000000   
// 000   000  000   000  000   000  
// 000000000  000000000  00000000   
// 000 0 000  000   000  000        
// 000   000  000   000  000        

float map(vec3 p)
{
    s = sdf(1000.0, p, NONE);
         
    plane(v0);
    head(vec3(0,1.35,0));

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

float softShadow(vec3 ro, vec3 lp, float k)
{
    float shade = 1.;
    float dist = MIN_DIST;    
    vec3 rd = (lp-ro);
    float end = max(length(rd), MIN_DIST);
    float stepDist = end/22.0;
    rd /= end;
    for (int i=0; i<22; i++)
    {
        float h = map(ro+rd*dist);
        if (s.mat != BBOX)
            shade = min(shade, k*h/dist);
        dist += clamp(h, 0.02, stepDist*2.0);
        
        if (h < 0.0 || dist > end) break; 
    }

    return min(max(shade, 0.0) + SHADOW, 1.0); 
}

// 000      000   0000000   000   000  000000000  
// 000      000  000        000   000     000     
// 000      000  000  0000  000000000     000     
// 000      000  000   000  000   000     000     
// 0000000  000   0000000   000   000     000     

float shiny(float rough, float NoH, const vec3 h) 
{
    float oneMinusNoHSquared = 1.0 - NoH * NoH;
    float a = NoH * rough;
    float k = rough / (oneMinusNoHSquared + a * a);
    float d = k * k / PI;
    return d;
}

vec3 getLight(vec3 p, vec3 n, vec3 col)
{
    if (mat == NONE) return col;
    
    vec3 cr = cross(camDir, vec3(0,1,0));
    vec3 up = normalize(cross(cr,camDir));
    vec3 lp = 2.0 * (camPos + vec3(0,2.0,0) + up*5.0); 
    vec3 l = normalize(lp-p);
 
    float ambient = 0.005;
    float dif = clamp(dot(n,l), 0.0, 1.0);
    
    if (mat == PUPL)
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
        float exp = soft ? 4.0 : 2.0;
        float smx = soft ? 0.75 : 0.99;
        
        vec3  n2c = normalize(camPos-p);
        vec3  bcl = normalize(n2c + l);
        float dnh = dot(n, bcl);
        float shi = shiny(1.9, dnh, bcl);
        
        dif = pow(dif, exp);
        dif += shi;
        ambient = 0.1;
    }
    
    //if (mat != PUPL && mat != BULB)
    if (mat == HEAD || mat == PLANE)
    {
        dif *= softShadow(p, lp, 4.0);        
    }
    
    vec3 hl = v0;
    if (mat == PUPL || mat == BULB)
    {
        hl = vec3(pow(clamp01(smoothstep(0.9,1.0,dot(n, l))), 20.0));
    }
    
    return col * clamp(dif, ambient, 1.0) + hl;
}

// 00000000   0000000    0000000   
// 000       000   000  000        
// 000000    000   000  000  0000  
// 000       000   000  000   000  
// 000        0000000    0000000   

vec3 fog(vec3 col, vec3 bg, float dist)
{
    float f = smoothstep(5.0, MAX_DIST, dist);
    return mix(col, bg, f);
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
    bool dither = true;
    bool camrot = texelFetch(iChannel0, ivec2(KEY_RIGHT, 2), 0).x > 0.5;
    bool space  = texelFetch(iChannel0, ivec2(KEY_SPACE, 2), 0).x < 0.5;
         soft   = texelFetch(iChannel0, ivec2(KEY_DOWN,  2), 0).x < 0.5;
         animat = texelFetch(iChannel0, ivec2(KEY_UP,    2), 0).x < 0.5;
        
    if (animat) 
    {
        float tt = 1.0-fract(iTime*0.5);
    }
    vec3 col;
        
#if AA > 1
    for( int am=ZERO; am<AA; am++ )
    for( int an=ZERO; an<AA; an++ )
    {
    vec2 ao = vec2(float(am),float(an)) / float(AA) - 0.5;
    vec2 uv = ((fragCoord+ao)-.5*iResolution.xy)/iResolution.y;
#else    
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
#endif
    
    float aspect = iResolution.x/iResolution.y;
    
    float md = 7.0;
    float mx = 2.0*(iMouse.x/iResolution.x-0.5);
    float my = 2.0*(iMouse.y/iResolution.y-0.5);
    
    if (iMouse.z <= 0.0 && camrot)
    {
        mx = iTime/4.;
        my = -0.5+0.25*sin(iTime/8.);
        dither = true;
    }
    
    camTgt = vec3(0,1.0,0); 
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
        
    vec3 rd = normalize(uv.x*uu + uv.y*vv + 1.0*ww);

    float d = rayMarch(camPos, rd);
    mat = s.mat;
    
    vec3  p = camPos + d * rd;
    vec3  n = getNormal(p);
            
    ifdef TOY
    if      (mat == HEAD)  col = vec3(1.0, 1.0, 0.0);
    else if (mat == PLANE) col = vec3(0.5, 0.0, 0.0);
    else if (mat == PUPL)  col = vec3(0.1, 0.1, 0.5);
    else if (mat == BULB)  col = vec3(1.0, 1.0, 1.0);
    else if (mat == NONE)  col = vec3(0.3, 0.0, 0.0);
   #else
    if      (mat == HEAD)  col = vec3(0.03);
    else if (mat == PLANE) col = vec3(0.02);
    else if (mat == PUPL)  col = vec3(0.01);
    else if (mat == BULB)  col = vec3(0.09);
    else if (mat == NONE)  col = vec3(0.01);
    #endif
    
    col = getLight(p, n, col);
    
    if (mat != NONE)
    {
        col = fog(col, vec3(0.01), d);
    }
    
#if AA>1
    }
    col /= float(AA*AA);
#endif
    
    col *= clamp(1.0-1.1*length((fragCoord-.5*iResolution.xy)/iResolution.xy), 0.0, 1.0);
    
    if (dither)
    {
        float dit = gradientNoise(fragCoord.xy);
        col += vec3(dit/1024.0);
    }
    
    #ifndef TOY
    vec2  fontSize = vec2(20.0, 35.0);  
    float isDigit = digit(fragCoord / fontSize, iFrameRate, 2.0, 0.0);
    col = mix(col, vec3(1.0, 1.0, 1.0), isDigit);
    #endif
    
    col = pow(col, vec3(1.0/2.2));
    fragColor = vec4(col, 1.0);
}
