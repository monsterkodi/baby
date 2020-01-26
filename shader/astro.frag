// #define TOY  1

#define MAX_STEPS 128
#define MIN_DIST   0.0001
#define MAX_DIST  80.0
#define SHADOW     0.001
#define PI 3.1415926535897
#define ZERO min(iFrame,0)

#define FLOOR -3.5

#define NONE  0
#define BODY  1
#define VISOR 2

vec3 v0 = vec3(0,0,0);
vec3 vx = vec3(1,0,0);
vec3 vy = vec3(0,1,0);
vec3 vz = vec3(0,0,1);

vec3 red   = vec3(0.8,0.0,0.0);
vec3 green = vec3(0.0,0.5,0.0);
vec3 blue  = vec3(0.2,0.2,1.0);
vec3 white = vec3(1.0,1.0,1.0);

struct ray {
    vec3 pos;
    vec3 dir;
};

struct sdf {
    float dist;
    vec3  pos;
    int   mat;
};

bool soft;

sdf s;
vec2 frag;
vec3 camPos;
vec3 camTgt;
vec3 camDir;

vec3 pHip;      vec3 pHipT;     vec3 pHipL;     vec3 pHipR;     vec3 pHipUp;    
vec3 pTorsoT;   vec3 pTorsoB;   vec3 pTorsoL;   vec3 pTorsoR;   vec3 pTorsoUp;  
vec3 pArmL;     vec3 pArmR;     vec3 pArmLup;   vec3 pArmLx;    vec3 pArmLz;    vec3 pArmRup;   vec3 pArmRx; vec3 pArmRz;
vec3 pLegL;     vec3 pLegR;     vec3 pLegLup;   vec3 pLegLx;    vec3 pLegLz;    vec3 pLegRup;   vec3 pLegRx; vec3 pLegRz; 
vec3 pFootL;    vec3 pFootR;    vec3 pFootLup;  vec3 pFootLz;   vec3 pFootRup;  vec3 pFootRz;
vec3 pHandL;    vec3 pHandR;    vec3 pHandLz;   vec3 pHandRz;   vec3 pHandLup;  vec3 pHandRup;
vec3 pHead;     vec3 pHeadUp;   vec3 pHeadZ; 
vec3 pArmLud;   vec3 pArmRud;
vec3 pLegLud;   vec3 pLegRud;
vec3 pElbowL;   vec3 pElbowR;
vec3 pPalmL;    vec3 pPalmR;
vec3 pKneeR;    vec3 pKneeL;
vec3 pHeelL;    vec3 pHeelR;
vec3 pToeL;     vec3 pToeR;
vec3 pSpine;
vec3 pNeck;

vec4 qHip;      
vec4 qTorso; 
vec4 qArmL;     vec4 qArmR; vec4 qHandL; vec4 qHandR;
vec4 qLegL;     vec4 qLegR; vec4 qFootL; vec4 qFootR;
vec4 qHead;     
vec4 qKneeL;    vec4 qKneeR;
vec4 qElbowL;   vec4 qElbowR;

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

float iRange(float l, float h, float f) { return l+(h-l)*(sin(iTime)*0.5+0.5); }
float iRange(float l, float h) { return iRange(l,h,1.0); }

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
    float half_angle = deg2rad(angle*0.5);
    return vec4(axis*sin(half_angle), cos(half_angle));
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

vec3 rotY(vec3 v, float deg)
{
    float rad = deg2rad(deg);
    float c = cos(rad);
    float s = sin(rad);
    return vec3(v.x*c+v.z*s, v.y, v.z*c+v.x*s);
}

vec3 rotX(vec3 v, float deg)
{
    float rad = deg2rad(deg);
    float c = cos(rad);
    float s = sin(rad);
    return vec3(v.x, v.y*c+v.z*s, v.z*c+v.y*s);
}

vec3 rotZ(vec3 v, float deg)
{
    float rad = deg2rad(deg);
    float c = cos(rad);
    float s = sin(rad);
    return vec3(v.x*c+v.y*s, v.y*c+v.x*s, v.z);
}

vec3 posOnPlane(vec3 p, vec3 a, vec3 n)
{
    return p-dot(p-a,n)*n;
}

vec3 posOnPlane(vec3 p, vec3 n)
{
    return p-dot(p,n)*n;
}

vec3 posOnRay(vec3 ro, vec3 rd, vec3 p)
{
    return ro + max(0.0, dot(p - ro, rd) / dot(rd, rd)) * rd;
}

bool rayIntersectsSphere(vec3 ro, vec3 rd, vec3 ctr, float r)
{
    return length(posOnRay(ro, rd, ctr) - ctr) < r;
}

//  0000000   00000000   
// 000   000  000   000  
// 000   000  00000000   
// 000   000  000        
//  0000000   000        

float opUnion(float d1, float d2) 
{
    float k = 0.15;
    float h = clamp(0.5 + 0.5*(d2-d1)/k, 0.0, 1.0);
    return mix(d2, d1, h) - k*h*(1.0-h);
}

float opUnion(float d1, float d2, float k) 
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

float opDiff(float d1, float d2, float k) 
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

float sdCapsule(vec3 p, vec3 a, vec3 b, float r)
{
    vec3 ab = b-a;
    vec3 ap = p-a;
    float t = dot(ab,ap) / dot(ab,ab);
    t = clamp(t, 0.0, 1.0);
    vec3 c = a + t*ab;
    return length(p-c)-r;        
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

float sdSphere(vec3 p, vec3 a, float r)
{
    return length(p-a)-r;
}

float sdPlane(vec3 p, vec3 a, vec3 n)
{   
    return dot(n, p-a);
}

float sdCylinder(vec3 p, vec3 a, vec3 b, float r)
{
  vec3  ba = b - a;
  vec3  pa = p - a;
  float baba = dot(ba,ba);
  float paba = dot(pa,ba);
  float x = length(pa*baba-ba*paba) - r*baba;
  float y = abs(paba-baba*0.5)-baba*0.5;
  float x2 = x*x;
  float y2 = y*y*baba;
  float d = (max(x,y)<0.0)?-min(x2,y2):(((x>0.0)?x2:0.0)+((y>0.0)?y2:0.0));
  return sign(d)*sqrt(abs(d))/baba;
}

// 00000000    0000000    0000000  00000000  
// 000   000  000   000  000       000       
// 00000000   000   000  0000000   0000000   
// 000        000   000       000  000       
// 000         0000000   0000000   00000000  

void poseDancing()
{
    pHip = vec3(-sin(iTime*4.0), 0, 0);
    
    vec3 x = vec3(1,0,0);
    vec3 y = vec3(0,1,0);
    vec3 z = vec3(0,0,1);
    
    float sq = sin(iTime*0.25);
    float sh = sin(iTime*0.5);
    float s1 = sin(iTime);
    float s2 = sin(iTime*2.0);
    float t2 = sin(iTime*2.0+PI);
    float s4 = sin(iTime*4.0);
    float t4 = sin(iTime*4.0+PI);
    float s8 = sin(iTime*8.0);
    float s16 = sin(iTime*16.0);
    
    vec4 q0 = vec4(0,0,0,1);            
    vec4 q1 = quatAxisAngle(y, s2*20.0);
    vec4 q2 = quatAxisAngle(x, s2*20.0-5.0);
    vec4 q3 = quatAxisAngle(z, t2*10.0-10.0);
    vec4 q6 = quatAxisAngle(z, t4*10.0);
    vec4 q7 = quatAxisAngle(x, s16*3.0);
    vec4 qh = quatAxisAngle(x, abs(s8)*(sq*20.0+40.0));

    qHip    = quatMul(q2,     q1);  
    qTorso  = quatMul(qHip,   q1); 
    qHead   = quatMul(q7,  q6); 
    
    qArmL   = quatAxisAngle(z, -t2*20.0);
    qArmR   = quatMul(quatAxisAngle(z,  s4*20.0), q3);
    qLegR   = quatAxisAngle(z,  s4*20.0);
            
    qFootL  = quatAxisAngle(y, -smoothstep(0.0, 1.0, s4)*(sh*20.0+30.0));
    qFootR  = quatAxisAngle(y,  smoothstep(0.0, 1.0, t4)*(sq*15.0+25.0));
            
    qLegL   = quatMul(qLegR, qFootL);  
    qLegR   = quatMul(qLegR, qFootR);  
    
    qKneeL  = quatMul(qLegL, quatAxisAngle(-x, smoothstep(0.0, 1.0, s4)*(sq*40.0+50.0)));
    qKneeR  = quatMul(qLegR, quatAxisAngle(-x, smoothstep(0.0, 1.0, t4)*(sq*40.0+50.0)));
    qElbowL = quatMul(qArmL, quatAxisAngle( x, smoothstep(0.0, 1.0, t4)*(sq*50.0+60.0))); 
    qElbowR = quatMul(qArmR, quatAxisAngle( x, smoothstep(0.0, 1.0, s4)*(sq*50.0+60.0)));
    
    qHandR  = quatMul(qh, quatMul(qArmR, qElbowR));
    qHandL  = quatMul(qh, quatMul(qArmL, qElbowL));
}

void poseNeutral()
{
    pHip = v0;
    
    vec4 q = vec4(0,0,0,1);
    qHip  = q; 
    qTorso = q; 
    qArmL = q; qArmR = q; qHandL = q; qHandR = q;
    qLegL = q; qLegR = q; qFootL = q; qFootR = q;
    qHead = q; 
    qKneeL = q; qKneeR = q;
    qElbowL = q; qElbowR = q;    
}

void poseFloating()
{
    poseNeutral();
    
    float s0 = sin(iTime*0.125);
    float s1 = sin(iTime*0.25);
    float s2 = sin(iTime*0.5);
    float s3 = sin(iTime*1.0);
    float s4 = sin(iTime*4.0);
    
    pHip = vec3(-sin(iTime/4.0)*0.3, -sin(iTime/4.0)*0.5 , 0);
    
    qTorso = quatMul(quatAxisAngle(vx, s2*15.0), quatAxisAngle(vy, s1*15.0));
    
    float ht = iTime*0.25;
    vec3 hsh1 = mix(hash31(floor(ht)), hash31(floor(ht)+1.0), smoothstep(0.0,1.0,fract(ht)));
    
    // qHead  = quatMul(quatAxisAngle(vx, s3*15.0), quatAxisAngle(vy, s2*15.0));
    // qHead  = quatMul(quatAxisAngle(hsh1, 10.0), quatAxisAngle(hsh2, 10.0));
    qHead   = quatMul(quatAxisAngle(vy, 30.0-60.0*hsh1.y), quatAxisAngle(vx, 10.0-20.0*hsh1.x));

    qArmL   = quatMul(quatAxisAngle(vy, -30.0-s3*20.0), quatAxisAngle(vz, 30.0-s1*20.0));
    qElbowL = quatMul(qArmL, quatAxisAngle( vx, 60.0+s1*30.0)); 
    
    qArmR   = quatMul(quatAxisAngle(vy, 30.0-s3*20.0), quatAxisAngle(vz, -30.0-s1*20.0));
    qElbowR = quatMul(qArmR, quatAxisAngle( vx, 60.0-s2*30.0)); 

    qLegL   = quatMul(quatAxisAngle(vy, -0.0-s0*20.0), quatAxisAngle(vz, 20.0-s1*20.0));
    qKneeL  = quatMul(qLegL, quatAxisAngle( vx, -60.0+s1*30.0)); 
    
    qLegR   = quatMul(quatAxisAngle(vy, 0.0-s2*20.0), quatAxisAngle(vz, -20.0-s1*20.0));
    qKneeR  = quatMul(qKneeR, quatAxisAngle( vx, -60.0+s2*30.0)); 
    
    qHandL  = qElbowL;
    qHandR  = qElbowR;
    
    qFootL = qKneeL; 
    qFootR = qKneeR;
}

//  0000000   000   000  000  00     00  
// 000   000  0000  000  000  000   000  
// 000000000  000 0 000  000  000000000  
// 000   000  000  0000  000  000 0 000  
// 000   000  000   000  000  000   000  

void calcAnim()
{
    pHipUp   = rotate(qHip, vy);
    pHipT    = pHip + pHipUp*0.6;
        
    pHipL    = pHip + rotate(qHip, rotZ(vec3(0,0.3,0),  120.0));
    pHipR    = pHip + rotate(qHip, rotZ(vec3(0,0.3,0), -120.0));
        
    pTorsoUp = pHipUp;
    pTorsoB  = pHip+1.5*pHipUp;
    pTorsoT  = pTorsoB + pTorsoUp*0.3;
    pTorsoR  = pTorsoT + rotate(qTorso, rotZ(vec3(-1.2,0,0), 0.0));
    pTorsoL  = pTorsoT + rotate(qTorso, rotZ(vec3( 1.2,0,0), 0.0));
    
    pHeadUp  = rotate(qHead, vy);
    pHeadZ   = rotate(qHead, vz);
    pHead    = pTorsoT + rotate(qTorso, vy);
    
    pArmLup = rotate(qArmL,   vy);
    pArmLud = rotate(qElbowL, vy);
    pArmLx  = rotate(qArmL,   vx);
    pArmLz  = rotate(qArmL,   vz);
    
    pElbowL = pTorsoL +0.45*pArmLx -1.20*pArmLup;
    pHandL  = pElbowL -1.15*pArmLud;    
    
    pArmRup = rotate(qArmR,   vy);
    pArmRud = rotate(qElbowR, vy);
    pArmRx  = rotate(qArmR,   vx);
    pArmRz  = rotate(qArmR,   vz);
    
    pElbowR = pTorsoR -0.45*pArmRx -1.20*pArmRup;
    pHandR  = pElbowR -1.15*pArmRud;    

    pHandLz = rotate(qHandL, -vx);
    pHandRz = rotate(qHandR, vx);

    pHandLup = rotate(qHandL, vy);
    pHandRup = rotate(qHandR, vy);
    pPalmL  = pHandL - 0.6 * pHandLup;
    pPalmR  = pHandR - 0.6 * pHandRup;

    pLegLup = rotate(qLegL, vy);
    pLegLud = rotate(qKneeL, vy);
    pLegLx  = rotate(qLegL, vx);
    pLegLz  = rotate(qLegL, vz);
    
    pKneeL  = pHipL +0.45*pLegLx -1.20*pLegLup;
    pFootL  = pKneeL -1.15*pLegLud;

    pLegRup = rotate(qLegR, vy);
    pLegRud = rotate(qKneeR, vy);
    pLegRx  = rotate(qLegR, vx);
    pLegRz  = rotate(qLegR, vz);
    
    pKneeR  = pHipR -0.45*pLegRx -1.20*pLegRup;
    pFootR  = pKneeR -1.15*pLegRud;    

    pFootLup = rotate(qFootL, vy);
    pFootLz  = rotate(qFootL, vz);
    pHeelL   = pFootL -0.75 * pFootLup;
    pToeL    = pHeelL -0.75 * pFootLz;
    
    pFootRup = rotate(qFootR, vy);
    pFootRz  = rotate(qFootR, vz);
    pHeelR   = pFootR -0.75 * pFootRup;
    pToeR    = pHeelR -0.75 * pFootRz;    
}

//  0000000   00000000   00     00  
// 000   000  000   000  000   000  
// 000000000  0000000    000000000  
// 000   000  000   000  000 0 000  
// 000   000  000   000  000   000  

float arm(vec3 pos, float side, vec3 elbow, vec3 ud, vec3 x)
{
    float d = sdCapsule(s.pos, pos-side*x*0.15, elbow, 0.45);
    return opUnion(d, sdCapsule(s.pos, elbow-0.2*ud, elbow-1.0*ud, 0.45), 0.2);
}

// 00000000   0000000    0000000   000000000  
// 000       000   000  000   000     000     
// 000000    000   000  000   000     000     
// 000       000   000  000   000     000     
// 000        0000000    0000000      000     

float foot(vec3 pos, vec3 heel, vec3 toe, vec3 up)
{
    float d = sdCapsule(s.pos, heel, toe, 0.7);
    return opDiff(d, sdPlane(s.pos, heel-0.3*up, up), 0.3);
}

// 00     00   0000000   00000000   
// 000   000  000   000  000   000  
// 000000000  000000000  00000000   
// 000 0 000  000   000  000        
// 000   000  000   000  000        

float map(vec3 p)
{
    float d = 1000.0;
    s = sdf(d, p, NONE);
    d = opUnion(d, sdSphere(s.pos, pHip, 0.9));
    d = opUnion(d, sdSphere(s.pos, pTorsoB, 1.3));
    d = opUnion(d, sdCapsule(s.pos, pTorsoL-0.0*pTorsoUp, pTorsoR-0.0*pTorsoUp, 0.7));
    
    d = min(d, arm  (pTorsoR,  1.0, pElbowR, pArmRud, pArmRx));
    d = min(d, sdSphere(s.pos, pPalmR, 0.65));
    
    d = min(d, arm  (pTorsoL, -1.0, pElbowL, pArmLud, pArmLx));
    d = min(d, sdSphere(s.pos, pPalmL, 0.65));
    
    d = min(d, arm  (pHipR,    1.0, pKneeR,  pLegRud, pLegRx));
    d = min(d, foot (pFootR, pHeelR,  pToeR,  pFootRup));
    
    d = min(d, arm  (pHipL,   -1.0, pKneeL,  pLegLud, pLegLx));
    d = min(d, foot (pFootL, pHeelL,  pToeL,  pFootLup));
    
    d = min(d, sdSphere(s.pos, pHead+pHeadUp, 1.6));
    d = opDiff(d, sdSphere(s.pos, pHead+pHeadUp-(pHeadZ-pHeadUp*0.5)*0.5, 1.2), 0.5);
    
    if (d < s.dist) { s.mat = BODY; s.dist = d; }
    
    d = min(d, sdSphere(s.pos, pHead+pHeadUp, 1.5));
    if (d < s.dist) { s.mat = VISOR; s.dist = d; }
    
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
    float d = k * k * (1.0 / PI);
    return d;
}

vec3 getLight(vec3 p, vec3 n, vec3 col, int mat)
{
    if (mat == NONE) return col;
    
    vec3 cr = cross(camDir, vec3(0,1,0));
    vec3 up = normalize(cross(cr,camDir));
    vec3 lp = rotX(vec3(0, 10, -10), -10.0);
    vec3 l = normalize(lp - p);
 
    float ambient = 0.0;
    float dif = clamp(dot(n,l), 0.0, 1.0);
    
    if (mat == BODY)
    {
        float exp = 8.0;
        float smx = 0.5;
        
        vec3  n2c = normalize(camPos-p);
        vec3  bcl = normalize(n2c + l);
        float dnh = clamp01(dot(n, bcl));
        float shi = shiny(0.45, dnh, bcl);
        
        dif = clamp01(mix(pow(dif, exp), shi, smx));
    }
    
    float shadow = soft ? softShadow(p, lp, 8.0) : hardShadow(p, l, MIN_DIST, 100.0, 0.01);
    dif *= shadow;
    
    vec3 hl = vec3(pow(clamp01(smoothstep(0.9,1.0,dot(n, l))), 20.0));
    
    return col * clamp(dif, ambient, 1.0) + hl * shadow;
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
    
    bool dither = texelFetch(iChannel0, ivec2(KEY_LEFT,  2), 0).x < 0.5;
    bool camrot = texelFetch(iChannel0, ivec2(KEY_RIGHT, 2), 0).x < 0.5;
         soft   = texelFetch(iChannel0, ivec2(KEY_DOWN,  2), 0).x < 0.5;
    bool animat = texelFetch(iChannel0, ivec2(KEY_UP,    2), 0).x < 0.5;
    bool space  = texelFetch(iChannel0, ivec2(KEY_SPACE, 2), 0).x < 0.5;

    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
    vec3 ct;
    
    float aspect = iResolution.x/iResolution.y;
    
    float mx = 2.0*(iMouse.x/iResolution.x-0.5);
    float my = 2.0*(iMouse.y/iResolution.y-0.5);
    float md = -12.5-my*2.5;
    
    if (iMouse.z <= 0.0 && camrot)
    {
        float ts = 276.2;
        mx = 0.3*sin(ts+iTime/2.0);
        my = -0.20-0.10*cos(ts+iTime/1.0);
    }
    
    camTgt = vec3(0,1.2,0); 

    // camPos = rotAxisAngle(rotAxisAngle(vec3(0,0,-md), vx, 89.0*my), vy, -180.0*mx);
    camPos = rotAxisAngle(rotAxisAngle(vec3(0,0,md), vx, 20.0+30.0*my), vy, 90.0*mx);

    #ifndef TOY
        if (space)
        {
            camTgt = iCenter;
            camPos = iCamera;
            camPos.x *= -1.0;
            camTgt.x *= -1.0;
        }
    #endif
        
    if (animat) poseFloating();
    else        poseDancing(); // poseNeutral();
    
    calcAnim();
    
    vec3 ww = normalize(camTgt-camPos);
    vec3 uu = normalize(cross(ww, vy));
    vec3 vv = normalize(cross(uu, ww));
    
    vec3 rd = normalize(uv.x*uu + uv.y*vv + 1.0*ww);
    
    float d = rayMarch(camPos, rd);
    int mat = s.mat;
    
    vec3  p = camPos + d * rd;
    vec3  n = getNormal(p);
        
    vec3 col;
    
    if      (mat == NONE)  col = vec3(0,0,0); 
    else if (mat == BODY)  col = vec3(1.0,1.0,1.0); 
    else if (mat == VISOR) col = vec3(0.0,0.0,0.0);
    else col = vec3(1,1,1);
    
    col = getLight(p, n, col, mat);

    /*
    if (dither && mat != NONE)
    {
        col += vec3(gradientNoise(frag.xy)/1256.0);
    }*/

    col = mix(col, white, digit(0,   0,  iFrameRate, 2.0));
    col = mix(col, blue,  digit(0,  40,  iTime,      4.1));
    col = mix(col, green, digit(150, 0,  iMouse.y,   5.0));
    col = mix(col, red,   digit(150, 40, iMouse.x,   5.0));
    col = mix(col, green, digit(250, 0,  my,         3.2));
    col = mix(col, red,   digit(250, 40, mx,         3.2));
        
    if (frag.x >= 350. && frag.x < 500. && frag.y < 160.)
    {
        uv = (iMouse.xy-.5*iResolution.xy)/iResolution.y;
        rd = normalize(uv.x*uu + uv.y*vv + ww);
        d  = rayMarch(camPos, rd);
        if (d < MAX_DIST)
        {
            p = camPos + d * rd;
            col = mix(col, white, digit(350,   0, d,   3.2));
            col = mix(col, red,   digit(350, 120, p.x, 3.2));
            col = mix(col, green, digit(350,  80, p.y, 3.2));
            col = mix(col, blue,  digit(350,  40, p.z, 3.2));
        }
    }
    
    col = pow(col, vec3(1.0/2.2));
    fragColor = vec4(col, 1.0);
}