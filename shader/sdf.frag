// #define TOY  1

#ifdef TOY
#define MAX_STEPS 40
#define MIN_DIST  0.02
#define MAX_DIST  60.0
#else
#define MAX_STEPS 64
#define MIN_DIST  0.01
#define MAX_DIST  100.0
#endif

#define PI 3.141592653589793
#define ZERO min(iFrame,0)

#define FLOOR -3.5

#define PLANE 0.0
#define BODY  1.0
#define BONE  2.0
#define BULB  3.0

struct ray {
    vec3 pos;
    vec3 dir;
};

struct sdf {
    float dist;
    float mat;
    vec3  pos;
};

sdf s;
vec3 camPos;
vec3 vec0 = vec3(0,0,0);

vec3 pHip;
vec3 pHipT;
vec3 pHipL;
vec3 pHipR;
vec3 pHipUp;
vec3 pHipRotL;
vec3 pHipRotR;

vec3 pSpine, pNeck;

vec3 pTorsoT;
vec3 pTorsoB;
vec3 pTorsoL;
vec3 pTorsoR;
vec3 pTorsoUp;
vec3 pTorsoRotL;
vec3 pTorsoRotR;

vec3 pHead;
vec3 pHeadUp;
vec3 pHeadZ;
vec3 pEyeL;
vec3 pEyeR;
vec3 pEyeHoleL;
vec3 pEyeHoleR;

vec3 pArmL;
vec3 pArmR;
vec3 pHandL;
vec3 pHandR;
vec3 pLegL;
vec3 pLegR;
vec3 pFootL;
vec3 pFootR;

vec3 pArmLup;
vec3 pArmLx;
vec3 pArmLz;
vec3 pElbowL;

vec3 pArmRup;
vec3 pArmRx;
vec3 pArmRz;
vec3 pElbowR;

vec3 pLegRup;
vec3 pLegRx;
vec3 pLegRz;
vec3 pKneeR;

vec3 pLegLup;
vec3 pLegLx;
vec3 pLegLz;
vec3 pKneeL;

vec3 pFootLup;
vec3 pFootLz;
vec3 pHeelL;
vec3 pToeL;

vec3 pFootRup;
vec3 pFootRz;
vec3 pHeelR;
vec3 pToeR;

vec3 pPalmL;
vec3 pHandLz;
vec3 pPalmR;
vec3 pHandRz;

float rad2deg(float r) { return 180.0 * r / PI; }
float deg2rad(float d) { return PI * d / 180.0; }

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

float sdTorus(vec3 p, vec3 a, vec3 n, vec2 r)
{
    vec3 q = p-a;
    return length(vec2(length(posOnPlane(q, n))-r.x,abs(dot(n, q))))-r.y;
}

float distToDoublePlane(vec3 p, vec3 n, float d)
{
    float dt = dot(p,n);
    return dt-sign(dt)*d;
}

float sdDoubleTorus(vec3 p, vec3 a, vec3 n, vec3 r)
{
    vec3 q = p-a;
    return length(vec2(length(posOnPlane(q, n))-r.x, distToDoublePlane(n, q, r.z)))-r.y;
}

float sdBend(vec3 p, vec3 a, vec3 n, vec3 d, float side, vec2 r)
{
    vec3 q = p-a;

    if (dot(q,side*d) > 0.0) return length(q)-r.y;
    
    vec3 c = cross(d,n);
    vec3 pp = q - r.x*c + side*r.x*d;
    if (dot(pp,c) > 0.0) return length(pp)-r.y;

    return length(vec2(length(posOnPlane(q, n)-r.x*c)-r.x,abs(dot(n, q))))-r.y;
}

float sdSphere(vec3 p, vec3 a, float r)
{
    return length(p-a)-r;
}

float sdHalfSphere(vec3 p, vec3 a, vec3 n, float r)
{
    vec3 q = p-a;
    float dt = dot(q, n);
    float sd = length(q)-r;
    if (dt > 0.0)
    {
        return sd;
    }
    return max(sd,-dt);
}

float sdSocket(vec3 p, vec3 a, vec3 n, float r, float k)
{
    vec3 q = p-a;
    float dp = dot(q, n);
    float ds = length(q)-r;
    if (dp > k)
    {
        return ds;
    }
    else if (ds < -k*2.0)
    {
        return -dp+k;
    }

    return sdTorus(p, a+k*n, n, vec2(r-k,k));
}

float sdSocket(vec3 p, vec3 a, vec3 n, float r)
{
    return sdSocket(p, a, n, r, 0.05);
}

float sdPlane(vec3 p, vec3 a, vec3 n)
{   
    return dot(n, p-a);
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

//  0000000   000   000  000  00     00  
// 000   000  0000  000  000  000   000  
// 000000000  000 0 000  000  000000000  
// 000   000  000  0000  000  000 0 000  
// 000   000  000   000  000  000   000  

void calcAnim()
{
    vec4 q1 = quatAxisAngle(vec3(0,1,0),  sin(iTime*2.0)*20.0);
    vec4 q2 = quatAxisAngle(vec3(1,0,0),  sin(iTime*2.0)*20.0-10.0);
    vec4 q  = quatMul(q2, q1);
    vec4 qr = quatAxisAngle(vec3(0,1,0),  sin(iTime*1.0)*15.0);
    vec4 qz = vec4(0,0,0,1);            
    vec4 qa = quatAxisAngle(vec3(0,0,1),  sin(iTime*4.0)*20.0);
    vec4 qb = quatAxisAngle(vec3(0,0,1), -sin(iTime*4.0)*20.0);
    
    if (true)
    {
        pHip = vec3(-sin(iTime*4.0), 0, 0);
    }
    else
    {
        q    = qz;
        qa   = qz;
        qb   = qz;
        pHip = vec0;
    }
    
    pHipUp   = rotate(q, vec3(0,1,0));
    pHipT    = pHip + pHipUp*0.6;
    
    pHipRotL = rotate(q, rotZ(vec3(0,1,0), 120.0));
    pHipRotR = rotate(q, rotZ(vec3(0,1,0), -120.0));
    
    pHipL    = pHip + 0.6*pHipRotL;
    pHipR    = pHip + 0.6*pHipRotR;
    
    pSpine   = pHipT  + 0.5*pHipUp;
    pTorsoB  = pSpine + 0.5*pHipUp;
    
    pTorsoRotL = 1.2*pHipRotL;
    pTorsoRotR = 1.2*pHipRotR;
    
    pTorsoUp = pHipUp;
    pTorsoT  = pTorsoB + pTorsoUp*1.2;
    pTorsoR  = pTorsoT + pTorsoRotR;
    pTorsoL  = pTorsoT + pTorsoRotL;
    
    pNeck    = pTorsoT + 0.5*pHipUp;
    pHead    = pNeck   + 0.5*pHipUp;
    
    pEyeL    = pHead+rotate(qz, vec3( 0.5, 0.45, -1.3));
    pEyeR    = pHead+rotate(qz, vec3(-0.5, 0.45, -1.3));
    pHeadUp  = rotate(qz, vec3(0,1,0));
    pHeadZ   = rotate(qz, vec3(0,0,1));
    
    vec3 nZ = rotate(qr, vec3(0,0,-1));
    vec3 eyeCam = normalize(camPos - (pEyeL+pEyeR)*0.5);
    eyeCam = mix(nZ, eyeCam, dot(nZ, eyeCam));
    pEyeHoleL = pEyeL+eyeCam*0.25;
    pEyeHoleR = pEyeR+eyeCam*0.25;
        
    pArmLup = rotate(qb, vec3(0,1,0));
    pArmLx  = rotate(qb, vec3(1,0,0));
    pArmLz  = rotate(qb, vec3(0,0,1));
    
    pHandL  = pTorsoL +0.45*pArmLx -2.35*pArmLup;    
    pElbowL = pTorsoL +0.45*pArmLx -1.20*pArmLup;
    
    pArmRup = rotate(qa, vec3(0,1,0));
    pArmRx  = rotate(qa, vec3(1,0,0));
    pArmRz  = rotate(qa, vec3(0,0,1));
    
    pHandR  = pTorsoR -0.45*pArmRx -2.35*pArmRup;    
    pElbowR = pTorsoR -0.45*pArmRx -1.20*pArmRup;
    
    pPalmL  = pHandL - 0.6 * pArmLup;
    pPalmR  = pHandR - 0.6 * pArmRup;
    pHandLz = -pArmLx;
    pHandRz =  pArmRx;

    pLegLup = rotate(qa, vec3(0,1,0));
    pLegLx  = rotate(qa, vec3(1,0,0));
    pLegLz  = rotate(qa, vec3(0,0,1));
    
    pFootL  = pHipL +0.45*pLegLx -2.35*pLegLup;    
    pKneeL  = pHipL +0.45*pLegLx -1.20*pLegLup;

    pLegRup = rotate(qa, vec3(0,1,0));
    pLegRx  = rotate(qa, vec3(1,0,0));
    pLegRz  = rotate(qa, vec3(0,0,1));
    
    pFootR  = pHipR -0.45*pLegRx -2.35*pLegRup;    
    pKneeR  = pHipR -0.45*pLegRx -1.20*pLegRup;
    
    pFootLup = vec3(0,1,0);
    pFootLz  = vec3(0,0,1);
    pHeelL   = pFootL -0.75 * pFootLup;
    pToeL    = pHeelL -0.75 * pFootLz;
    
    pFootRup = vec3(0,1,0);
    pFootRz  = vec3(0,0,1);
    pHeelR   = pFootR -0.75 * pFootRup;
    pToeR    = pHeelR -0.75 * pFootRz;    
}

// 000   000  000  00000000   
// 000   000  000  000   000  
// 000000000  000  00000000   
// 000   000  000  000        
// 000   000  000  000        

void hip()
{
    float d = sdSphere(s.pos, pHip, 0.5);
    
    d = opUnion(d, sdSocket(s.pos, pHipT, -pHipUp,   0.3));
    d = opUnion(d, sdSocket(s.pos, pHipL, -pHipRotL, 0.3));
    d = opUnion(d, sdSocket(s.pos, pHipR, -pHipRotR, 0.3));
    
    if (d < s.dist) { s.mat = BODY; s.dist = d; }
}

//  0000000  00000000   000  000   000  00000000  
// 000       000   000  000  0000  000  000       
// 0000000   00000000   000  000 0 000  0000000   
//      000  000        000  000  0000  000       
// 0000000   000        000  000   000  00000000  

void spine(vec3 pos, vec3 mid, vec3 top)
{
    vec3 up = normalize(top-mid);
    float d = sdSocket(s.pos, mid, up, 0.25);

    if (d > s.dist+0.5) return;
    
    d = opUnion(d, sdCapsule(s.pos, mid, top, 0.15));
    d = opUnion(d, sdSphere (s.pos, top, 0.25));

    d = min    (d, sdSphere (s.pos, mid, 0.22));
    d = opUnion(d, sdSphere (s.pos, pos, 0.25));
    d = opUnion(d, sdCapsule(s.pos, pos, mid, 0.15));
    
    if (d < s.dist) { s.mat = BONE; s.dist = d; }
}

// 000000000   0000000   00000000    0000000   0000000   
//    000     000   000  000   000  000       000   000  
//    000     000   000  0000000    0000000   000   000  
//    000     000   000  000   000       000  000   000  
//    000      0000000   000   000  0000000    0000000   

void torso()
{
    float d = sdSocket(s.pos, pTorsoT, -pTorsoUp, 1.0, 0.1);
    
    if (d > s.dist+0.25) return;
    
    d = opUnion(d, sdSocket(s.pos, pTorsoT, -pTorsoUp, 0.3));
    d = opUnion(d, sdSocket(s.pos, pTorsoB, pTorsoUp, 0.3));
    d = opUnion(d, sdSocket(s.pos, pTorsoR, -pTorsoRotR, 0.3));
    d = opUnion(d, sdSocket(s.pos, pTorsoL, -pTorsoRotL, 0.3));
    
    if (d < s.dist) { s.mat = BODY; s.dist = d; }
}

// 00000000  000   000  00000000  
// 000        000 000   000       
// 0000000     00000    0000000   
// 000          000     000       
// 00000000     000     00000000  

void eye(vec3 pos, vec3 pupil)
{
    float d = sdSphere(s.pos, pos, 0.25);
    if (d > s.dist) return;
    
    d = opDiff(d, 0.01, sdSphere(s.pos, pupil, 0.15));

    if (d < s.dist) { s.mat = BULB; s.dist = d; }
}

// 000   000  00000000   0000000   0000000    
// 000   000  000       000   000  000   000  
// 000000000  0000000   000000000  000   000  
// 000   000  000       000   000  000   000  
// 000   000  00000000  000   000  0000000    

void head()
{
    float d = sdSocket(s.pos, pHead, pHeadUp, 1.3, 0.1);
    
    if (d > s.dist+0.3) return;
    
    d = opUnion(d, sdSocket(s.pos, pHead, pHeadUp, 0.3));
    d = opUnion(d, sdSocket(s.pos, pEyeL, pHeadZ, 0.33));
    d = opUnion(d, sdSocket(s.pos, pEyeR, pHeadZ, 0.33));

    if (d < s.dist) { s.mat = BODY; s.dist = d; }
    
    eye(pEyeL, pEyeHoleL);
    eye(pEyeR, pEyeHoleR);
}

//  0000000   00000000   00     00  
// 000   000  000   000  000   000  
// 000000000  0000000    000000000  
// 000   000  000   000  000 0 000  
// 000   000  000   000  000   000  

void arm(vec3 pos, float side, vec3 elbow, vec3 hand, vec3 up, vec3 x, vec3 z)
{
    float bb = sdSphere(s.pos, elbow, 2.0);
    if (bb > s.dist) return;
     
    float d = sdSphere(s.pos, pos, 0.25);
    
    d = opUnion(d, sdBend(s.pos, pos, z, x, side, vec2(0.45, 0.1)));
    d = min    (d, sdCapsule(s.pos, elbow+0.75*up, elbow+0.2*up, 0.1));
         
    d = opUnion(d, sdTorus(s.pos, elbow, x, vec2(0.2, 0.07)));
     
    if (d < s.dist) { s.mat = BONE; s.dist = d; }
    
    d = sdCapsule(s.pos, elbow-0.25*up, elbow-1.0*up, 0.1);

    d = opUnion(d, sdDoubleTorus(s.pos, elbow, x, vec3(0.2, 0.07, 0.15)));
    d = opUnion(d, sdSocket(s.pos, hand, up, 0.3));
     
    if (d < s.dist) { s.mat = BONE; s.dist = d; }
}

// 00000000   0000000    0000000   000000000  
// 000       000   000  000   000     000     
// 000000    000   000  000   000     000     
// 000       000   000  000   000     000     
// 000        0000000    0000000      000     

void foot(vec3 pos, vec3 heel, vec3 toe, vec3 up)
{
    float d = sdHalfSphere(s.pos, heel, up, 0.5);
    
    if (d > s.dist+0.9) return;
    
    d = opUnion(d, 0.1, sdSphere(s.pos, pos, 0.25));
    d = opUnion(d, sdHalfSphere (s.pos, toe, up, 0.4));
    
    d = opUnion(d, 0.02, sdTorus(s.pos, heel, up, vec2(0.53, 0.07)));
    d = opUnion(d, 0.02, sdTorus(s.pos, toe,  up, vec2(0.43, 0.07)));
    
    if (d < s.dist) { s.mat = BODY; s.dist = d; }
}

// 000   000   0000000   000   000  0000000    
// 000   000  000   000  0000  000  000   000  
// 000000000  000000000  000 0 000  000   000  
// 000   000  000   000  000  0000  000   000  
// 000   000  000   000  000   000  0000000    

void hand(vec3 pos, vec3 palm, vec3 z)
{    
    float d = sdSocket(s.pos, palm, -z, 0.5);
    
    d = opUnion(d, sdSphere(s.pos, pos, 0.25));
    
    if (d < s.dist) { s.mat = BODY; s.dist = d; }
}

// 00     00   0000000   00000000   
// 000   000  000   000  000   000  
// 000000000  000000000  00000000   
// 000 0 000  000   000  000        
// 000   000  000   000  000        

vec2 map(vec3 p)
{
    float planeDist = sdPlane(p, vec3(0,FLOOR,0), vec3(0,1,0));
   
    #ifdef TOY
    #else
    if (iCamera.y < FLOOR) { planeDist = 1000.0; }
    #endif
     
    s = sdf(planeDist, PLANE, p);
         
    hip  ();
    spine(pHipT, pSpine, pTorsoB);
    torso();
    spine(pTorsoT, pNeck, pHead);
    head ();
             
    arm  (pTorsoR,  1.0, pElbowR, pHandR, pArmRup, pArmRx, pArmRz);
    arm  (pTorsoL, -1.0, pElbowL, pHandL, pArmLup, pArmLx, pArmLz);
    arm  (pHipR,    1.0, pKneeR,  pFootR, pLegRup, pLegRx, pLegRz);
    arm  (pHipL,   -1.0, pKneeL,  pFootL, pLegLup, pLegLx, pLegLz);
    foot (pFootR,   pHeelR, pToeR, pFootRup);
    foot (pFootL,   pHeelL, pToeL, pFootLup);
    hand (pHandR,   pPalmR, pHandRz);
    hand (pHandL,   pPalmL, pHandLz);
    
    return vec2(s.dist, s.mat);
}

vec3 getNormal(vec3 p)
{
    vec3 n = vec0;
    for (int i=ZERO; i<4; i++)
    {
        vec3 e = 0.5773*(2.0*vec3((((i+3)>>1)&1),((i>>1)&1),(i&1))-1.0);
        n += e*map(p+e*0.0001).x;
    }
    return normalize(n);
}

// 00     00   0000000   00000000    0000000  000   000  
// 000   000  000   000  000   000  000       000   000  
// 000000000  000000000  0000000    000       000000000  
// 000 0 000  000   000  000   000  000       000   000  
// 000   000  000   000  000   000   0000000  000   000  

vec2 rayMarch(vec3 ro, vec3 rd)
{
    float dz = 0.0;
    /*
    if (!rayIntersectsSphere(ro, rd, vec3(0,1.0,0), 5.0))
    {
        for (int i = 0; i < MAX_STEPS; i++)
        {
            vec3 p = ro + dz * rd;
            vec2 hit = vec2(sdPlane(p, vec3(0,FLOOR,0), vec3(0,1,0)), PLANE);
            dz += hit.x;
            if (hit.x < MIN_DIST) return vec2(dz,PLANE);
            if (dz > MAX_DIST) break;
        }
        return vec2(dz,-1.0);
    }
    */
    for (int i = ZERO; i < MAX_STEPS; i++)
    {
        vec3 p = ro + dz * rd;
        vec2 hit = map(p);
        dz += hit.x;
        if (hit.x < MIN_DIST) return vec2(dz,hit.y);
        if (dz > MAX_DIST) break;
    }
    return vec2(dz,-1.0);
}

//  0000000  000   000   0000000   0000000     0000000   000   000  
// 000       000   000  000   000  000   000  000   000  000 0 000  
// 0000000   000000000  000000000  000   000  000   000  000000000  
//      000  000   000  000   000  000   000  000   000  000   000  
// 0000000   000   000  000   000  0000000     0000000   00     00  

float hardShadow(vec3 ro, vec3 rd, float mint, float maxt, const float w)
{
    if (!rayIntersectsSphere(ro, rd, vec3(0,1.0,0), 5.0))
    {
        return 0.0;
    }
    
    for (float t=mint+float(ZERO); t<maxt;)
    {
        float h = map(ro+rd*t).x;
        if (h < 0.001)
        {
            return w;
        }
        t+=h;
    }
    return 1.0;
}

// 000      000   0000000   000   000  000000000  
// 000      000  000        000   000     000     
// 000      000  000  0000  000000000     000     
// 000      000  000   000  000   000     000     
// 0000000  000   0000000   000   000     000     

float getLight(vec3 p, vec3 n)
{
    float t = sin(iTime*0.2);
    vec3 lp = rotY(rotX(vec3(0, 10, -10), -10.0 - 20.0*t), 20.0*t);
    vec3 l = normalize(lp - p);
 
    float dif = dot(n,l);
    
    vec3 off = p+n*2.0*MIN_DIST;

    dif *= hardShadow(off, normalize(lp-off), MIN_DIST, 100.0, 0.5);
        
    return clamp(dif, 0.0, 1.0);
}

// 00     00   0000000   000  000   000  
// 000   000  000   000  000  0000  000  
// 000000000  000000000  000  000 0 000  
// 000 0 000  000   000  000  000  0000  
// 000   000  000   000  000  000   000  

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
    vec3 ct;
    
    #ifdef TOY
        ct = vec0;
        camPos = rotY(rotX(vec3(0,0,-15), -20.0+10.0*sin(iTime*0.1)), 50.0*sin(iTime*0.2));
    #else
        ct = iCenter;
        camPos = iCamera;
        camPos.x *= -1.0;
        ct.x *= -1.0;
    #endif

    calcAnim();
    
    vec3 ww = normalize(ct-camPos);
    vec3 uu = normalize(cross(ww, vec3(0,1,0)));
    vec3 vv = normalize(cross(uu, ww));
    
    vec3 rd = normalize(uv.x*uu + uv.y*vv + 1.0*ww);
    
    vec2 hit = rayMarch(camPos, rd);
    
    vec3 p = camPos + hit.x * rd;
    vec3 n = getNormal(p);
    
    float l = getLight(p,n);
        
    vec3 col;
    
    if      (hit.y < PLANE) col = vec3(0,0,0); 
    else if (hit.y < BODY)  col = vec3(0.2,0.2,0.2); 
    else if (hit.y < BONE)  col = vec3(1.0,0.0,0.0); 
    else if (hit.y < BULB)  col = vec3(1.0,1.0,0.0);
    else col = vec3(1,1,1);

    #if !TOY
    if (fragCoord.x < 2.5 && (iResolution.y * floor(1000.0/iMs) / 60.0 - fragCoord.y) < 2.0)
    {
        l = 1.0-l;
        col = vec3(1,1,1);
    }
    #endif
    
    fragColor = vec4(col * l, 1.0);
}
