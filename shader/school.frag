// #define TOY  1

#define MAX_STEPS 48
#define MIN_DIST  0.01
#define MAX_DIST  30.0

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
vec3 camPos;
vec3 camTgt;
vec3 camDir;
float spaceMod = 7.0;

vec3 v0 = vec3(0,0,0);
vec3 vx = vec3(1,0,0);
vec3 vy = vec3(0,1,0);
vec3 vz = vec3(0,0,1);
    
float rad2deg(float r) { return 180.0 * r / PI; }
float deg2rad(float d) { return PI * d / 180.0; }

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
    if (fDigitIndex > (-fDecimalPlaces - 1.01)) {
        if (fDigitIndex > fBiggestIndex) {
            if((bNeg) && (fDigitIndex < (fBiggestIndex+1.5))) fCharBin = 1792.0;
        } else {        
            if (fDigitIndex == -1.0) {
                if (fDecimalPlaces > 0.0) fCharBin = 2.0;
            } else {
                float fReducedRangeValue = fValue;
                if (fDigitIndex < 0.0) { fReducedRangeValue = fract( fValue ); fDigitIndex += 1.0; }
                float fDigitValue = (abs(fReducedRangeValue / (pow(10.0, fDigitIndex))));
                fCharBin = digitBin(int(floor(mod(fDigitValue, 10.0))));
            }
        }
    }
    return floor(mod((fCharBin / pow(2.0, floor(fract(vStringCoords.x) * 4.0) + (floor(vStringCoords.y * 5.0) * 4.0))), 2.0));
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

float opInter(float d1, float d2) 
{
    float k = 0.05;
    float h = clamp(0.5 - 0.5*(d2-d1)/k, 0.0, 1.0);
    return mix(d2, d1, h) + k*h*(1.0-h);
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

float sdTetra(vec3 p, vec3 a, float s, float r)
{
    p = p - a;
    vec3 c1 = vec3( 0, 1, 0);
    vec3 c2 = vec3( 0.8165, -0.3333,  0.47140);
    vec3 c3 = vec3( 0,      -0.3333, -0.94281);
    vec3 c4 = vec3(-0.8165, -0.3333,  0.47140);
    
    c1 *= s;
    c2 *= s;
    c3 *= s;
    c4 *= s;
        
    vec3 n1 = vec3( 0.0000,  0.3333,  0.942812);
    vec3 n2 = vec3( 0.8165,  0.3333, -0.471400);
    vec3 n3 = vec3( 0.0000, -1.0000,  0.000000);
    vec3 n4 = vec3(-0.8165,  0.3333, -0.471400);
    
    float d = sdSphere(p,v0,2.0); 
    d = opDiff(d, r, sdPlane(p, c1, -n1));
    d = opDiff(d, r, sdPlane(p, c2, -n2));
    d = opDiff(d, r, sdPlane(p, c3, -n3));
    d = opDiff(d, r, sdPlane(p, c4, -n4));
  
    return d;
}

float sdSocket(vec3 p, vec3 a, vec3 n, float r)
{
    return opDiff(opDiff(sdSphere(p, a, r), 0.2, sdPlane(p, a, -n)), 0.2, sdSphere(p, a, r-0.2));
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

// 00000000  000   000  00000000  
// 000        000 000   000       
// 0000000     00000    0000000   
// 000          000     000       
// 00000000     000     00000000  

void eye(vec3 pos, vec3 pupil, vec3 lens)
{
    float d = sdSphere(s.pos, pos, 0.4);
    if (d > s.dist) return;
    
    d = opDiff(d, 0.05, sdSphere(s.pos, pupil, 0.2));

    if (d < s.dist) { s.mat = BULB; s.dist = d; }
    
    d = min(d, sdSphere(s.pos, lens, 0.21));
    
    if (d < s.dist) { s.mat = PUPL; s.dist = d; }
}

//  0000000   00000000   00     00  
// 000   000  000   000  000   000  
// 000000000  0000000    000000000  
// 000   000  000   000  000 0 000  
// 000   000  000   000  000   000  

void arm(vec3 pos, vec3 r, vec3 n)
{
    vec3 p = s.pos-pos;
    
    // float d = 1000.0;
    
    float d = sdSphere(p, v0, 0.25);
    
    n *= 0.3;
    
    vec3 p1 = v0;
    vec3 p2 = p1 + n;
    
    float tt = 1.0-fract((iTime*2.0)/PI/2.0);
    float aa = cos(tt*tt*PI*2.0);
    
    float lf = 1.0;
    float sf = 1.0;
    float a  = -(1.0+aa)*17.0+3.0;
        
    for (int i = 0; i < 25; i++)
    {
        d = opUnion(d, sdCone(p, p1, p2, 0.2*sf, 0.2*sf*0.9));
        p1 = p2;
        n  = rotAxisAngle(n, r, a) * lf;
        sf *= 0.9;
        lf *= 0.988;
        p2 += n;
    }
    
    if (d < s.dist) { s.mat = TAIL; s.dist = d; }
}

// 000   000  00000000   0000000   0000000    
// 000   000  000       000   000  000   000  
// 000000000  0000000   000000000  000   000  
// 000   000  000       000   000  000   000  
// 000   000  00000000  000   000  0000000    

void head(vec3 pos)
{
    float d = sdTetra(s.pos, pos, 2.0, 0.7);
    if (d < s.dist) { s.mat = HEAD; s.dist = d; }
    
    vec3 p;
    float ed = 0.8;
    float pd = 0.4;
    float ld = 0.2;
    
    vec3 n1 = vec3( 0.0000,  0.3333,  0.942812);
    vec3 n2 = vec3( 0.8165,  0.3333, -0.471400);
    vec3 n3 = vec3( 0.0000, -1.0000,  0.000000);
    vec3 n4 = vec3(-0.8165,  0.3333, -0.471400);
    
    vec3 left = n2;
    vec3 eyel = pos + ed*left;
    
    vec3 right = n4;
    vec3 eyer = pos + ed*right;
    
    vec3 back = n1;
    vec3 eyeb = pos + ed*back;
    
    float sr = 0.56;
    d = opUnion(d, sdSocket(s.pos, eyel, left,  sr));
    d = opUnion(d, sdSocket(s.pos, eyer, right, sr));
    d = opUnion(d, sdSocket(s.pos, eyeb, back,  sr));
        
    float oo = 0.4;
    float od = 0.8;
    
    vec3 arml = pos - od*vy - oo*left;
    vec3 armr = pos - od*vy - oo*right;
    vec3 armb = pos - od*vy - oo*back;
    
    vec3 armln = normalize(arml - 0.03*left  - vy);
    vec3 armrn = normalize(armr - 0.03*right - vy);
    vec3 armbn = normalize(armb - 0.03*back  - vy);
    
    d = opUnion(d, sdSocket(s.pos, arml, armln, 0.35));
    d = opUnion(d, sdSocket(s.pos, armr, armrn, 0.35));
    d = opUnion(d, sdSocket(s.pos, armb, armbn, 0.35));
        
    if (d < s.dist) { s.mat = HEAD; s.dist = d; }
    
    vec3 nl = normalize(camPos - eyel);
    vec3 nr = normalize(camPos - eyer);
    vec3 nb = normalize(camPos - eyeb);
    
    eye(eyel, eyel + pd*nl, eyel + ld*nl);
    eye(eyer, eyer + pd*nr, eyer + ld*nr);
    eye(eyeb, eyeb + pd*nb, eyeb + ld*nb);
    
    vec3 armlr = normalize(cross(arml, armln));
    vec3 armrr = normalize(cross(armr, armrn));
    vec3 armbr = normalize(cross(armb, armbn));
    
    float tt = 1.0-fract((iTime*2.0)/PI/2.0);
    float aa = cos(tt*tt*PI*2.0)+1.0;    
    
    armln = rotAxisAngle(armln, armlr, aa*15.);
    armrn = rotAxisAngle(armrn, armrr, aa*15.);
    armbn = rotAxisAngle(armbn, armbr, aa*15.);
    
    arm(arml, armlr, armln);
    arm(armr, armrr, armrn);
    arm(armb, armbr, armbn);
}

// 00     00   0000000   00000000   
// 000   000  000   000  000   000  
// 000000000  000000000  00000000   
// 000 0 000  000   000  000        
// 000   000  000   000  000        

float map(vec3 p)
{
    vec3 q = mod(p, spaceMod) - spaceMod/2.0;
    float camDist = length(p-camPos);
    float ds = 0.1*(camDist/MAX_DIST);
    // q.y = sin(iTime*2.5+2.0*PI*fract(p).x)*cos(iTime*1.5+2.0*PI*fract(p).y)*ds+p.y; 
    q.y = p.y; 

    s = sdf(MAX_DIST, q, NONE);
         
    float as = sin(iTime);
    float tt = 1.0-fract((iTime*2.0)/PI/2.0);
    float aa = cos(tt*tt*PI*2.0)+1.0;    
    head(vec3(0,-aa*0.3+as*0.2,0));

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
    return MAX_DIST;
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
        ambient = 0.1;
        if (mat == TAIL)
            ambient = 0.0;
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
            
    return clamp(dif, ambient, 1.0);
}

// 00000000   0000000    0000000   
// 000       000   000  000        
// 000000    000   000  000  0000  
// 000       000   000  000   000  
// 000        0000000    0000000   

vec3 fog(vec3 col, float dist)
{
    float f = 1.0-dist/MAX_DIST;
    vec3 fc = vec3(0.001,0.001,0.01);
    f = smoothstep(MAX_DIST*0.5, MAX_DIST, dist);
    return mix(col, fc, f);
}

// 00     00   0000000   000  000   000  
// 000   000  000   000  000  0000  000  
// 000000000  000000000  000  000 0 000  
// 000 0 000  000   000  000  000  0000  
// 000   000  000   000  000  000   000  

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
    vec3 ct;
    
    #ifdef TOY
        camTgt = vec3(spaceMod/2.,-spaceMod/4.,spaceMod/2.); 
        float my = -2.0*(iMouse.y/iResolution.y-0.5);
        float mx =  2.0*(iMouse.x/iResolution.x-0.5);
        float md =  8.0;
        if (iMouse.z <= 0.0)
        {
            mx = iTime/100.;
            my = 0.25*sin(iTime/50.);
        }
        
        camPos = rotAxisAngle(rotAxisAngle(vec3(0,0,md), vx, -89.0*my), vy, -180.0*mx);
    #else
        camTgt = iCenter;
        camPos = iCamera;
        camPos.x *= -1.0;
        camTgt.x *= -1.0;
    #endif
    
    camDir = normalize(camTgt-camPos);
    
    vec3 ww = normalize(camTgt-camPos);
    vec3 uu = normalize(cross(ww, vec3(0,1,0)));
    vec3 vv = normalize(cross(uu, ww));
    
    float ss = sin(iTime*1.5+2.0*PI*uv.x) * cos(iTime*2.5+20.0*uv.y);
    float sc = cos(iTime*2.5+2.0*PI*uv.y);
    uv.y+=ss*0.01;
    uv.x+=sc*0.02;
    
    vec3 rd = normalize(uv.x*uu + uv.y*vv + 1.0*ww);
    
    float d = rayMarch(camPos, rd);
    mat = s.mat;
    
    vec3  p = camPos + d * rd;
    vec3  n = getNormal(p);
    float l = getLight(p,n);
        
    vec3 col;
    
    if      (mat == NONE)  col = vec3(.005, .005, .025);
    else if (mat == HEAD)  col = vec3(0.3,0.3,1.0); 
    else if (mat == PUPL)  col = vec3(0.1,0.1,0.5);
    else if (mat == BULB)  col = vec3(1.0,1.0,1.0);
    else if (mat == TAIL)  col = vec3(0.1,0.1,0.5); 

    col *= l;
    
    col = fog(col, d);
    
    #ifndef TOY
        vec2  fontSize = vec2(20.0, 35.0);  
        float isDigit = digit(fragCoord / fontSize, iMs, 2.0, 0.0);
        col = mix( col, vec3(1.0, 1.0, 1.0), isDigit);
    #endif
    
    col = pow(col, vec3(1.0/2.2));
    fragColor = vec4(col, 1.0);
}
