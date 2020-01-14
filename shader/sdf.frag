
#define MAX_STEPS 128
#define MIN_DIST  0.01
#define MAX_DIST  100.0

#define PI 3.141592653589793

#define ZERO min(iFrame,0)

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

vec3 pHipT;
vec3 pHipL;
vec3 pHipR;
vec3 pSpine;
vec3 pNeck;
vec3 pTorsoT;
vec3 pTorsoB;
vec3 pTorsoL;
vec3 pTorsoR;
vec3 pHead;
vec3 pEyeL;
vec3 pEyeR;
vec3 pArmL;
vec3 pArmR;
vec3 pHandL;
vec3 pHandR;
vec3 pLegL;
vec3 pLegR;
vec3 pFootL;
vec3 pFootR;

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

float sdLink( vec3 p, vec3 a, float le, float r1, float r2 )
{
  p = p-a;
  vec3 q = vec3( p.x, max(abs(p.y)-le,0.0), p.z );
  return length(vec2(length(q.xy)-r1,q.z)) - r2;
}

float sdCylinder(vec3 p, vec3 a, float h, float r)
{
    p = p - a;
    vec2 d = abs(vec2(length(p.xz),p.y)) - vec2(r,h);
    return min(max(d.x,d.y),0.0) + length(max(d,0.0));
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

float sdTorus(vec3 p, vec3 a, vec3 n, vec2 r)
{
    p = p-a;
    return length(vec2(length(posOnPlane(p, n))-r.x,abs(dot(n, p))))-r.y;
}

float sdBend(vec3 p, vec3 a, vec3 n, vec3 d, float side, vec2 r)
{
    p = p-a;

    if (dot(p,side*d) > 0.0) return length(p)-r.y;
    
    vec3 c = cross(d,n);
    vec3 pp = p-r.x*c+side*r.x*d;
    if (dot(pp,c) > 0.0) return length(pp)-r.y;

    pp = posOnPlane(p, n);
    return length(vec2(length(pp-r.x*c)-r.x,abs(dot(n, p))))-r.y;
}

float sdSphere(vec3 p, vec3 a, float r)
{
    return length(p-a)-r;
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

// 000   000  000  00000000   
// 000   000  000  000   000  
// 000000000  000  00000000   
// 000   000  000  000        
// 000   000  000  000        

void hip(vec3 pos, vec4 q)
{
    vec3 p = s.pos;
    float d = sdSphere(p, pos, 0.5);
    
    vec3 up = rotate(q, vec3(0,1,0));
    pHipT = pos + up*0.6;
    d = opUnion(d, sdSphere(p, pHipT, 0.3));
    d = opDiff (d, sdPlane (p, pHipT, -up));
    
    vec3 rot = rotate(q, rotZ(vec3(0,0.6,0), 120.0));
    pHipL = pos + rot;
    
    d = opUnion(d, sdSphere(p, pHipL, 0.3));
    d = opDiff (d, sdPlane (p, pHipL, -rot));

    rot = rotate(q, rotZ(vec3(0,0.6,0), -120.0));
    pHipR = pos + rot;
    
    d = opUnion(d, sdSphere(p, pHipR, 0.3));
    d = opDiff (d, sdPlane (p, pHipR, -rot));
    
    if (d < s.dist) { s.mat = BODY; s.dist = d; }
}

//  0000000  00000000   000  000   000  00000000  
// 000       000   000  000  0000  000  000       
// 0000000   00000000   000  000 0 000  0000000   
//      000  000        000  000  0000  000       
// 0000000   000        000  000   000  00000000  

void spine(vec3 pos, bool high, vec4 q, inout vec3 top)
{
    vec3 p = s.pos;
    float d = sdSphere(p, pos, 0.25);
    vec3 up = rotate(q, vec3(0,1,0));
    top = pos + up*0.5;

    if (d > s.dist+0.2) return;
    
    d = opUnion(d, sdCapsule(p, pos, top, 0.15));
    d = opUnion(d, sdSphere (p, top, high ? 0.25 : 0.22));
    
    if (high)
    {
        d = opDiff (d, sdPlane(p, pos-0.1*up, up));
    }

    if (d < s.dist) { s.mat = BONE; s.dist = d; }
}

// 000000000   0000000   00000000    0000000   0000000   
//    000     000   000  000   000  000       000   000  
//    000     000   000  0000000    0000000   000   000  
//    000     000   000  000   000       000  000   000  
//    000      0000000   000   000  0000000    0000000   

void torso(vec3 pos, vec4 q)
{
    vec3 p = s.pos;
    vec3 up = rotate(q, vec3(0,1,0));
    vec3 r  = rotZ(vec3(0,1.2,0), 120.0);
    vec3 rotL = rotate(q, r); r.x *= -1.0;
    vec3 rotR = rotate(q, r);
    pTorsoT = pos + up*1.2;    
    pTorsoR = pTorsoT + rotR;
    pTorsoL = pTorsoT + rotL;

    float d = sdSphere(p, pTorsoT, 1.0);
    if (d > s.dist+0.2) return;
    
    d = opDiff (d, 0.15, sdPlane   (p, pTorsoT, -up));
    d = opDiff (d, 0.15, sdCylinder(p, pTorsoT, pTorsoT-0.1*up, 0.75)-.075); 

    d = opUnion(d, sdSphere(p, pTorsoT, 0.3));
    d = opDiff (d, sdPlane (p, pTorsoT, -up));
    
    d = opUnion(d, sdSphere(p, pTorsoB, 0.3));
    d = opDiff (d, sdPlane (p, pTorsoB, up));
     
    d = opUnion(d, sdSphere(p, pTorsoR, 0.3));
    d = opDiff (d, sdPlane (p, pTorsoR, -rotR));

    d = opUnion(d, sdSphere(p, pTorsoL, 0.3));
    d = opDiff (d, sdPlane (p, pTorsoL, -rotL));
    
    if (d < s.dist) { s.mat = BODY; s.dist = d; }
}

// 000   000  00000000   0000000   0000000    
// 000   000  000       000   000  000   000  
// 000000000  0000000   000000000  000   000  
// 000   000  000       000   000  000   000  
// 000   000  00000000  000   000  0000000    

void head(vec3 pos, vec4 q)
{
    vec3 p = s.pos;
    float d = sdSphere(p, pos, 1.3);
    
    pEyeL = pos+rotate(q, vec3( 0.5, 0.45, -1.3));
    pEyeR = pos+rotate(q, vec3(-0.5, 0.45, -1.3));

    if (d > s.dist+0.3) return;
    
    vec3 up = rotate(q, vec3(0,1,0));
    vec3 z  = rotate(q, vec3(0,0,1));
    d = opDiff (d, 0.15, sdPlane(p, pos, up));
    d = opDiff (d, 0.15, sdCylinder(p, pos, pos-0.1*up, 1.05)-.075);

    d = opUnion(d, sdSphere(p, pos, 0.3));
    d = opDiff (d, sdPlane (p, pos, up));
    
    d = opUnion(d,      sdSphere(p, pEyeL, 0.33));
    d = opUnion(d,      sdSphere(p, pEyeR, 0.33));
    d = opDiff (d, 0.1, sdSphere(p, pEyeL, 0.25));
    d = opDiff (d, 0.1, sdSphere(p, pEyeR, 0.25));
    d = opDiff (d, 0.1, sdPlane (p, pos-1.4*z, z));

    if (d < s.dist) { s.mat = BODY; s.dist = d; }
}

// 00000000  000   000  00000000  
// 000        000 000   000       
// 0000000     00000    0000000   
// 000          000     000       
// 00000000     000     00000000  

void eye(vec3 pos, vec4 q)
{
    vec3 p = s.pos;
    float d = sdSphere(p, pos, 0.25);
    if (d > s.dist) return;
    
    vec3 eyeCam = normalize(camPos - pos);
    vec3 nZ = rotate(q, vec3(0,0,-1));
    eyeCam = mix(nZ, eyeCam, dot(nZ, eyeCam));
    d = opDiff(d, 0.01, sdSphere(p, pos+eyeCam*0.25, 0.15));

    if (d < s.dist) { s.mat = BULB; s.dist = d; }
}

//  0000000   00000000   00     00  
// 000   000  000   000  000   000  
// 000000000  0000000    000000000  
// 000   000  000   000  000 0 000  
// 000   000  000   000  000   000  

void arm(vec3 pos, float side, vec4 q, inout vec3 hand)
{
    vec3 p = s.pos;
     
    vec3 up = rotate(q, vec3(0,1,0));
    vec3 x  = rotate(q, vec3(1,0,0));
    vec3 z  = rotate(q, vec3(0,0,1));
    
    hand = pos -side*0.45*x -2.35*up;
    
    vec3 elbow = pos -side*0.45*x -1.2*up;
    float bb = sdSphere(p, elbow, 2.0);
    if (bb > s.dist) return;
     
    float d = sdSphere(p, pos, 0.25);
    
    d = opUnion(d, sdBend(p, pos, z, x, side, vec2(0.45, 0.1)));
    d = min(d, sdCapsule(p, elbow+0.75*up, elbow+0.2*up, 0.1));
         
    d = opUnion(d, sdTorus(p, elbow, x, vec2(0.2, 0.07)));
     
    if (d < s.dist) { s.mat = BONE; s.dist = d; }
    
    d = sdCapsule(p, elbow-0.25*up, elbow-1.0*up, 0.1);

    d = opUnion(d, sdTorus(p, elbow-0.15*x, x, vec2(0.2, 0.07)));
    d = opUnion(d, sdTorus(p, elbow+0.15*x, x, vec2(0.2, 0.07)));
     
    d = opUnion(d, sdSphere(p, hand, 0.3));
    d = opDiff (d, sdPlane (p, hand, up));
     
    if (d < s.dist) { s.mat = BONE; s.dist = d; }
}

// 00000000   0000000    0000000   000000000  
// 000       000   000  000   000     000     
// 000000    000   000  000   000     000     
// 000       000   000  000   000     000     
// 000        0000000    0000000      000     

void foot(vec3 pos, float side)
{
    vec3 p = s.pos-pos;
    p.x *= side;
    
    float d = sdSphere(p, vec3(0,-0.75,0), 0.5);
    
    if (d > s.dist+0.9) return;
    
    d = opUnion(d, 0.1, sdSphere(p, vec0, 0.25));
    d = opUnion(d, sdSphere(p, vec3(0,-0.75,-0.75), 0.4));
    d = opDiff (d, sdPlane (p, vec3(0,-0.75,0), vec3(0,1,0)));
    
    d = min(d, sdTorus(p, vec3(0,-0.75,0),     vec3(0,1,0), vec2(0.57, 0.07)));
    d = min(d, sdTorus(p, vec3(0,-0.75,-0.75), vec3(0,1,0), vec2(0.47, 0.07)));
    
    if (d < s.dist) { s.mat = BODY; s.dist = d; }
}

// 000   000   0000000   000   000  0000000    
// 000   000  000   000  0000  000  000   000  
// 000000000  000000000  000 0 000  000   000  
// 000   000  000   000  000  0000  000   000  
// 000   000  000   000  000   000  0000000    

void hand(vec3 pos, float side)
{
    vec3 p = s.pos - pos;
    p.x *= side;
    
    float d = sdSphere(p, vec3(0,-0.6,0), 0.4);
    
    if (d > s.dist+0.3) return;
    
    d = opDiff (d, sdPlane (p, vec3(0,-0.6,0), vec3(0,0,-1)));
    d = opUnion(d, sdSphere(p, vec0, 0.25));
    
    d = min(d, sdCapsule(p, vec3( 0.4,-0.8, 0.1), vec3( 0.4,-1.0, 0.1), 0.1));
    d = min(d, sdCapsule(p, vec3( 0.4,-1.2, 0.1), vec3( 0.4,-1.4, 0.1), 0.1));
    
    d = min(d, sdCapsule(p, vec3(    0,-1.10,-0.1), vec3(    0,-1.30,-0.1), 0.1));
    d = min(d, sdCapsule(p, vec3(-0.23,-1.05,-0.1), vec3(-0.23,-1.25,-0.1), 0.1));
    d = min(d, sdCapsule(p, vec3( 0.23,-1.05,-0.1), vec3( 0.23,-1.25,-0.1), 0.1));
    
    d = min(d, sdCapsule(p, vec3(    0,-1.50,-0.1), vec3(    0,-1.7, -0.1), 0.1));
    d = min(d, sdCapsule(p, vec3(-0.23,-1.45,-0.1), vec3(-0.23,-1.65,-0.1), 0.1));
    d = min(d, sdCapsule(p, vec3( 0.23,-1.45,-0.1), vec3( 0.23,-1.65,-0.1), 0.1));
    
    if (d < s.dist) { s.mat = BODY; s.dist = d; }
}

// 00     00   0000000   00000000   
// 000   000  000   000  000   000  
// 000000000  000000000  00000000   
// 000 0 000  000   000  000        
// 000   000  000   000  000        

vec2 map(vec3 p)
{
    float planeDist = sdPlane(p, vec3(0,-3.5,0), vec3(0,1,0));
     
    if (iCamera.y < -3.5) { planeDist = 1000.0; }
     
    s = sdf(planeDist, PLANE, p);
         
    vec4 q1 = quatAxisAngle(vec3(0,1,0), sin(iTime*2.0)*20.0);
    vec4 q2 = quatAxisAngle(vec3(1,0,0), 10.0+sin(iTime*2.0)*20.0);
    vec4 q  = quatMul(q2, q1);
    vec4 qr = quatAxisAngle(vec3(0,1,0), sin(iTime*1.0)*15.0);
    vec4 qz = vec4(0,0,0,1);
    // q = qz;
    hip  (vec3(-sin(iTime*4.0), 0, 0), q);
    spine(pHipT,   false, q, pSpine);
    spine(pSpine,   true, q, pTorsoB);
    torso(pTorsoB, q);
    spine(pTorsoT, false, qz, pNeck);
    spine(pNeck,    true, qz, pHead);
    head (pHead, qz);
    eye  (pEyeL, qr);
    eye  (pEyeR, qr);
         
    vec4 qa = quatAxisAngle(vec3(0,0,1), sin(iTime*4.0)*20.0);
    
    arm  (pTorsoR,  1.0, qa, pHandR);
    hand (pHandR,   1.0);
    
    arm  (pHipR,    1.0, qa, pFootR);
    foot (pFootR,   1.0);

    arm  (pHipL,   -1.0, qa, pFootL);
    foot (pFootL,  -1.0);

    qa = quatAxisAngle(vec3(0,0,1), -sin(iTime*4.0)*20.0);
    
    arm  (pTorsoL, -1.0, qa, pHandL);
    hand (pHandL,  -1.0);
    
    return vec2(s.dist, s.mat);
}

vec2 mapPlane(vec3 p)
{
    return vec2(sdPlane(p, vec3(0,-3.5,0), vec3(0,1,0)), PLANE);
}

/*
vec3 getNormal(vec3 p)
{
    vec2 e = vec2(0.0001, 0);
    return normalize(vec3(map(p).x) - vec3(map(p-e.xyy).x, map(p-e.yxy).x, map(p-e.yyx).x));
}
*/

vec3 getNormal(vec3 p)
{
    const float h = 0.0001;    
    vec3 n = vec0;
    for (int i=ZERO; i<4; i++)
    {
        vec3 e = 0.5773*(2.0*vec3((((i+3)>>1)&1),((i>>1)&1),(i&1))-1.0);
        n += e*map(p+e*h).x;
    }
    return normalize(n);
}

// 00     00   0000000   00000000    0000000  000   000  
// 000   000  000   000  000   000  000       000   000  
// 000000000  000000000  0000000    000       000000000  
// 000 0 000  000   000  000   000  000       000   000  
// 000   000  000   000  000   000   0000000  000   000  

vec3 posOnRay(vec3 ro, vec3 rd, vec3 p)
{
    return ro + max(0.0, dot(p - ro, rd) / dot(rd, rd)) * rd;
}

bool rayIntersectsSphere(vec3 ro, vec3 rd, vec3 ctr, float r)
{
    return length(posOnRay(ro, rd, ctr) - ctr) < r;
}

vec2 rayMarch(vec3 ro, vec3 rd)
{
    float dz = 0.0;
    
    if (!rayIntersectsSphere(ro, rd, vec3(0,1.0,0), 5.0))
    {
        for (int i = 0; i < MAX_STEPS; i++)
        {
            vec3 p = ro + dz * rd;
            vec2 hit = mapPlane(p);
            dz += hit.x;
            if (hit.x < MIN_DIST) return vec2(dz,PLANE);
            if (dz > MAX_DIST) break;
        }
        return vec2(dz,-1.0);
    }
    
    for (int i = 0; i < MAX_STEPS; i++)
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

float softShadow(vec3 ro, vec3 rd, float mint, float maxt, const float w)
{
    if (!rayIntersectsSphere(ro, rd, vec3(0,1.0,0), 5.0))
    {
        return 0.0;
    }
    
 	float t = mint;
    float res = 1.0;
    for (int i=0; i<128; i++)
    {
        float h = map(ro+rd*t).x;
        if (h <= 0.0)
        {
            res = 0.0;
            break;
        }
        res = min( res, h/(w*t) );
        t += h;
        if (res < -1.0 || t > maxt) break;
    }
    res = max(res,-1.0);

    return 0.25*(1.0+res)*(1.0+res)*(2.0-res);
}

float hardShadow(vec3 ro, vec3 rd, float mint, float maxt, const float w)
{
    if (!rayIntersectsSphere(ro, rd, vec3(0,1.0,0), 5.0))
    {
        return 0.0;
    }
    
    for (float t=mint; t<maxt;)
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
    vec3 lp = rotY(rotX(vec3(0, 10, -10), -10.0 - 30.0*t), 20.0*t);
    vec3 l = normalize(lp - p);
 
    float dif = dot(n,l);
    
    vec3 off = p+n*2.0*MIN_DIST;

    //dif *= softShadow(off, normalize(lp-off), MIN_DIST, 100.0, 0.02);
    dif *= hardShadow(off, normalize(lp-off), MIN_DIST, 100.0, 0.5);
        
    return clamp(dif, 0.0, 1.0);
}

//  0000000    0000000   0000000  000      000   000   0000000  000   0000000   000   000  
// 000   000  000       000       000      000   000  000       000  000   000  0000  000  
// 000   000  000       000       000      000   000  0000000   000  000   000  000 0 000  
// 000   000  000       000       000      000   000       000  000  000   000  000  0000  
//  0000000    0000000   0000000  0000000   0000000   0000000   000   0000000   000   000  

/*
float getOcclusion(vec3 p, vec3 n)
{
    float a = 0.0;
    float weight = .5;
    for (int i=1; i<=9; i++) 
    {
        float d = (float(i) / 9.0) * 1.0;
        a += weight*(d - map(p + n*d).x);
        weight *= 0.6;
    }
    return clamp(1.0 - a, 0.0, 1.0);
}
*/

// 00     00   0000000   000  000   000  
// 000   000  000   000  000  0000  000  
// 000000000  000000000  000  000 0 000  
// 000 0 000  000   000  000  000  0000  
// 000   000  000   000  000  000   000  

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
    vec3 ct;
    
    if (true)
    {
        ct = vec0;
        camPos = rotY(rotX(vec3(0,0,-15), -20.0+30.0*sin(iTime*0.5)), 70.0*sin(iTime*0.3));
    }
    else
    {
        ct = iCenter;
        camPos = iCamera;
        camPos.x *= -1.0;
        ct.x *= -1.0;
    }
    
    vec3 ww = normalize(ct-camPos);
    vec3 uu = normalize(cross(ww, vec3(0,1,0)));
    vec3 vv = normalize(cross(uu, ww));
    
    vec3 rd = normalize(uv.x*uu + uv.y*vv + 1.0*ww);
    
    vec2 hit = rayMarch(camPos, rd);
    
    vec3 p = camPos + hit.x * rd;
    vec3 n = getNormal(p);
    
    float l = getLight(p,n);
    // float l = getLight(p,n) * getOcclusion(p,n);
    // float l = getOcclusion(p,n);
    // if (fragCoord.x < 2.5 && (iResolution.y * floor(1000.0/iMs) / 60.0 - fragCoord.y) < 2.0)
        // l = 1.0-l;
        
    vec3 col;
    
    if      (hit.y < PLANE) col = vec3(0,0,0); 
    else if (hit.y < BODY)  col = vec3(0.2,0.2,0.2); 
    else if (hit.y < BONE)  col = vec3(1.0,0.0,0.0); 
    else if (hit.y < BULB)  col = vec3(1.0,1.0,0.0);
    else col = vec3(1,1,1);
        
    fragColor = vec4(col * l, 1.0);
}
