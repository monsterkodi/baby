
#define MAX_STEPS 128
#define MIN_DIST  0.01
#define MAX_DIST  100.0

#define PI 3.141592653589793

struct ray {
    vec3 pos;
    vec3 dir;
};

struct sdf {
    float dist;
    vec3 pos;
};

float rad2deg(float r) { return 180.0 * r / PI; }
float deg2rad(float d) { return PI * d / 180.0; }

//  0000000   000   000   0000000   000000000  
// 000   000  000   000  000   000     000     
// 000 00 00  000   000  000000000     000     
// 000 0000   000   000  000   000     000     
//  00000 00   0000000   000   000     000     

mat3 alignMatrix(vec3 dir) {
    vec3 f = normalize(dir);
    vec3 s = normalize(cross(f, vec3(0.48, 0.6, 0.64)));
    vec3 u = cross(s, f);
    return mat3(u, s, f);
}

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
  p = p - a;
  vec3 q = vec3( p.x, max(abs(p.y)-le,0.0), p.z );
  return length(vec2(length(q.xy)-r1,q.z)) - r2;
}

float sdCylinder(vec3 p, vec3 a, float h, float r)
{
    p = p - a;
    vec2 d = abs(vec2(length(p.xz),p.y)) - vec2(r,h);
    return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

float sdTorusX(vec3 p, vec3 a, vec2 t)
{
  p = p - a;
  vec2 q = vec2(length(p.yz)-t.x,p.x);
  return length(q)-t.y;
}

float sdTorusY(vec3 p, vec3 a, vec2 t)
{
  p = p - a;
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float sdTorusZ(vec3 p, vec3 a, vec2 t)
{
  p = p - a;
  vec2 q = vec2(length(p.xy)-t.x,p.z);
  return length(q)-t.y;
}

float sdSphere(vec3 p, vec3 a, float r)
{
    return length(p-a)-r;
}

float sdPlane(vec3 p, vec3 a, vec3 n)
{   
    return dot(n, p-a);
}

float sdBox(vec3 p, vec3 b)
{
    vec3 q = abs(p)-b;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
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

float hip(out sdf s, vec3 pos)
{
    float d = sdSphere(s.pos, pos, 0.5);
    
    // if (d > s.dist) return s.dist;
    
    d = opUnion(d, sdSphere(s.pos, pos+vec3(0,0.6,0), 0.3));

    vec3 r = rotAxisAngle(vec3(0,0.6,0), vec3(0,0,1), 120.0);
    d = opUnion(d, sdSphere(s.pos, pos+r, 0.3));
    
    vec3 l = rotAxisAngle(vec3(0,0.6,0), vec3(0,0,1), -120.0);
    d = opUnion(d, sdSphere(s.pos, pos+l, 0.3));
    
    d = opDiff (d, sdPlane(s.pos, pos+vec3(0,0.6,0), vec3(0,-1,0)));
    d = opDiff (d, sdPlane(s.pos, pos+rotZ(vec3(0,0.6,0), 120.0), rotZ(vec3(0,-1,0), 120.0)));
    d = opDiff (d, sdPlane(s.pos, pos+rotZ(vec3(0,0.6,0), -120.0), rotZ(vec3(0,-1,0), -120.0)));
    
    s.dist = min(s.dist, d);
    return s.dist;
}

//  0000000  00000000   000  000   000  00000000  
// 000       000   000  000  0000  000  000       
// 0000000   00000000   000  000 0 000  0000000   
//      000  000        000  000  0000  000       
// 0000000   000        000  000   000  00000000  

float spineHi(out sdf s, vec3 pos)
{
    float d = sdSphere(s.pos, pos, 0.25);
    
    if (d > s.dist+0.2) return s.dist;
    
    d = opUnion(d, sdCapsule(s.pos, pos, pos+vec3(0,0.5,0), 0.15));
    d = opUnion(d, sdSphere(s.pos, pos+vec3(0,0.5,0), 0.25));
    d = opDiff (d, sdPlane(s.pos, pos+vec3(0,-.1,0), vec3(0,1,0)));
    s.dist = min(s.dist, d);
    return s.dist;
}

float spineLow(out sdf s, vec3 pos)
{
    float d = sdSphere(s.pos, pos, 0.25);
    
    if (d > s.dist+0.2) return s.dist;
    
    d = opUnion(d, sdCapsule(s.pos, pos, pos+vec3(0,0.5,0), 0.15));
    d = opUnion(d, sdSphere(s.pos, pos+vec3(0,0.5,0), 0.22));
    s.dist = min(s.dist, d);
    return s.dist;
}

float torso(out sdf s, vec3 pos)
{
    float d = sdSphere(s.pos, pos, 1.0);
    
    if (d > s.dist+0.2) return s.dist;
    
    d = opDiff (d, 0.15, sdPlane(s.pos, pos, vec3(0,-1,0)));
    d = opDiff (d, 0.15, sdCylinder(s.pos, pos, 0.1, 0.75)-.075);

    d = opUnion(d, sdSphere(s.pos, pos+vec3(0,0,0), 0.3));
    d = opDiff (d, sdPlane(s.pos, pos+vec3(0,0,0), vec3(0,-1,0)));
    
    d = opUnion(d, sdSphere(s.pos, pos+vec3(0,-1.1,0), 0.3));

    vec3 r = rotAxisAngle(vec3(0,1.2,0), vec3(0,0,1), 120.0);
    d = opUnion(d, sdSphere(s.pos, pos+r, 0.3));
     
    vec3 l = rotAxisAngle(vec3(0,1.2,0), vec3(0,0,1), -120.0);
    d = opUnion(d, sdSphere(s.pos, pos+l, 0.3));

    d = opDiff (d, sdPlane(s.pos, pos+vec3(0,-1.1,0), vec3(0,1,0)));
    d = opDiff (d, sdPlane(s.pos, pos+rotZ(vec3(0,1.2,0), 120.0), rotZ(vec3(0,-1,0), 120.0)));
    d = opDiff (d, sdPlane(s.pos, pos+rotZ(vec3(0,1.2,0), -120.0), rotZ(vec3(0,-1,0), -120.0)));
    
    s.dist = min(s.dist, d);
    return s.dist;
}

// 000   000  00000000   0000000   0000000    
// 000   000  000       000   000  000   000  
// 000000000  0000000   000000000  000   000  
// 000   000  000       000   000  000   000  
// 000   000  00000000  000   000  0000000    

float head(out sdf s, vec3 pos)
{
    float d = sdSphere(s.pos, pos, 1.3);
    
    if (d > s.dist+0.3) return s.dist;
    
    d = opDiff (d, 0.15, sdPlane(s.pos, pos, vec3(0,1,0)));
    d = opDiff (d, 0.15, sdCylinder(s.pos, pos, 0.1, 1.05)-.075);

    d = opUnion(d, sdSphere(s.pos, pos+vec3(0,0,0), 0.3));
    d = opDiff (d, sdPlane(s.pos, pos+vec3(0,0,0), vec3(0,1,0)));

    vec3 mirror = s.pos;
    mirror.x = abs(mirror.x);
    d = opUnion(d, sdSphere(mirror, pos+vec3(0.5, 0.45, -1.3), 0.33));
    d = opDiff (d, 0.1, sdSphere(mirror, pos+vec3(0.5, 0.45, -1.3), 0.25));
    d = opDiff (d, 0.1, sdPlane(s.pos, pos+vec3(0,0,-1.4), vec3(0,0,1.0)));
    
    d = min(d, sdSphere(mirror, pos+vec3(0.5, 0.45, -1.3), 0.25));

    s.dist = min(s.dist, d);
    return s.dist;
}

//  0000000   00000000   00     00  
// 000   000  000   000  000   000  
// 000000000  0000000    000000000  
// 000   000  000   000  000 0 000  
// 000   000  000   000  000   000  

float arm(out sdf s, vec3 pos, float side)
{
    vec3 p = s.pos;
    p.x *= side;
    
    float bb = sdSphere(p, pos+vec3(-0.45,-1.2,0), 2.0);
    if (bb > s.dist) return s.dist;
    
    float d = sdSphere(p, pos, 0.25);
    
    d = opUnion(d, sdLink(p, pos+vec3(0.55,-1.8,0), 1.0, 1.0, 0.1));
    d = opDiff(d, sdPlane(p, pos+vec3(0.28,0,0), normalize(vec3(-1,-0.7,0))));
    d = opDiff(d, sdPlane(p, pos+vec3(0,-1.1,0), vec3(0,1,0)));
    
    d = opUnion(d, sdTorusX(p, pos+vec3(-0.45,-1.2,0), vec2(0.2, 0.07)));
    
    s.dist = min(s.dist, d);
    
    d = sdCapsule(p, pos+vec3(-0.45,-1.45,0), pos+vec3(-0.45,-2.2,0), 0.1);
    d = opUnion(d, sdTorusX(p, pos+vec3(-0.3,-1.2,0), vec2(0.2, 0.07)));
    d = opUnion(d, sdTorusX(p, pos+vec3(-0.6,-1.2,0), vec2(0.2, 0.07)));
    
    d = opUnion(d, sdSphere(p, pos+vec3(-0.45,-2.35,0), 0.3));
    d = opDiff (d, sdPlane (p, pos+vec3(-0.45,-2.35,0), vec3(0,1,0)));
    
    s.dist = min(s.dist, d);
    return s.dist;
}

// 00000000   0000000    0000000   000000000  
// 000       000   000  000   000     000     
// 000000    000   000  000   000     000     
// 000       000   000  000   000     000     
// 000        0000000    0000000      000     

float foot(out sdf s, vec3 pos, float side)
{
    vec3 p = s.pos;
    p.x *= side;
    
    float d = sdSphere(p, pos+vec3(0,-0.75,0), 0.5);
    
    if (d > s.dist+0.7) return s.dist;
    
    d = opUnion(d, 0.1, sdSphere(p, pos, 0.25));
    d = opUnion(d, sdSphere(p, pos+vec3(0,-0.75,-0.75), 0.4));
    d = opDiff (d, sdPlane (p, pos+vec3(0,-0.75,0), vec3(0,1,0)));
    
    s.dist = min(s.dist, d);
    return s.dist;
}

float hand(out sdf s, vec3 pos, float side)
{
    vec3 p = s.pos;
    p.x *= side;
    
    float d = sdSphere(p, pos+vec3(0,-0.6,0), 0.4);
    
    if (d > s.dist+0.5) return s.dist;
    
    d = opDiff (d, sdPlane (p, pos+vec3(0,-0.6,0), vec3(0,0,-1)));
    d = opUnion(d, sdSphere(p, pos, 0.25));
    
    s.dist = min(s.dist, d);
    return s.dist;    
}

// 00     00   0000000   00000000   
// 000   000  000   000  000   000  
// 000000000  000000000  00000000   
// 000 0 000  000   000  000        
// 000   000  000   000  000        

float map(vec3 p)
{
    float planeDist = sdPlane(p, vec3(0,-3.5,0), vec3(0,1,0));
    
    if (iCamera.y < -3.5) { planeDist = 1000.0; }
    
    sdf s = sdf(planeDist, p);
        
    hip         (s, vec3(0,0,0));
    spineLow    (s, vec3(0,0.6,0));
    spineHi     (s, vec3(0,1.1,0));
    torso       (s, vec3(0,2.7,0));
    spineLow    (s, vec3(0,2.7,0));
    spineHi     (s, vec3(0,3.2,0));
    head        (s, vec3(0,3.7,0));
    
    vec3 r;
    r = rotAxisAngle(vec3(0,1.2,0), vec3(0,0,1), 120.0);
    arm         (s, vec3(0,2.7,0)+r, 1.0);          
    arm         (s, vec3(0,2.7,0)+r, -1.0);      
    
    hand        (s, r+vec3(-0.45,0.35,0), 1.0);
    hand        (s, r+vec3(-0.45,0.35,0), -1.0);
    
    r = rotAxisAngle(vec3(0,0.6,0), vec3(0,0,1), 120.0);
    arm         (s, r, 1.0);
    arm         (s, r, -1.0);
    
    foot        (s, r+vec3(-0.45,-2.35,0), 1.0);
    foot        (s, r+vec3(-0.45,-2.35,0), -1.0);
    
    return s.dist;
}

float mapPlane(vec3 p)
{
    return sdPlane(p, vec3(0,-3.5,0), vec3(0,1,0));
}

vec3 getNormal(vec3 p)
{
    vec2 e = vec2(0.0001, 0);
    return normalize(vec3(map(p)) - vec3(map(p-e.xyy), map(p-e.yxy), map(p-e.yyx)));
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

float rayMarch(vec3 ro, vec3 rd)
{
    float dz = 0.0;
    
    if (!rayIntersectsSphere(ro, rd, vec3(0,1.0,0), 5.0))
    {
        for (int i = 0; i < MAX_STEPS; i++)
        {
            vec3 p = ro + dz * rd;
            float dp = mapPlane(p);
            dz += dp;
            if (dp < MIN_DIST || dz > MAX_DIST) break;
        }
        return dz;
    }
    
    for (int i = 0; i < MAX_STEPS; i++)
    {
        vec3 p = ro + dz * rd;
        float dp = map(p);
        dz += dp;
        if (dp < MIN_DIST || dz > MAX_DIST) break;
    }
    return dz;
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
        float h = map(ro+rd*t);
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
        float h = map(ro+rd*t);
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
    float t = 0.0; // iTime/10.0;
    vec3 lp = rotX(vec3(0, 10, -10), -15.0 - 45.0*sin(t));
    lp = rotY(lp, 45.0*sin(t));
    vec3 l = normalize(lp - p);
 
    float dif = dot(n,l);
    
    vec3 off = p+n*2.0*MIN_DIST;

    dif *= softShadow(off, normalize(lp-off), MIN_DIST, 100.0, 0.02);
    // dif *= hardShadow(off, normalize(lp-off), MIN_DIST, 100.0, 0.5);
        
    return clamp(dif, 0.0, 1.0);
}

//  0000000    0000000   0000000  000      000   000   0000000  000   0000000   000   000  
// 000   000  000       000       000      000   000  000       000  000   000  0000  000  
// 000   000  000       000       000      000   000  0000000   000  000   000  000 0 000  
// 000   000  000       000       000      000   000       000  000  000   000  000  0000  
//  0000000    0000000   0000000  0000000   0000000   0000000   000   0000000   000   000  

float getOcclusion(vec3 p, vec3 n)
{
    float a = 0.0;
    float weight = .5;
    for (int i=1; i<=9; i++) 
    {
        float d = (float(i) / 9.0) * 1.0;
        a += weight*(d - map(p + n*d));
        weight *= 0.6;
    }
    return clamp(1.0 - a, 0.0, 1.0);
}

// 00     00   0000000   000  000   000  
// 000   000  000   000  000  0000  000  
// 000000000  000000000  000  000 0 000  
// 000 0 000  000   000  000  000  0000  
// 000   000  000   000  000  000   000  

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = (fragCoord-.5*iResolution.xy)/iResolution.y;
        
    vec3 ro = iCamera;
    vec3 ct = iCenter;
    
    ro.x *= -1.0;
    ct.x *= -1.0;

    vec3 ww = normalize(ct-ro);
    vec3 uu = normalize(cross(ww, vec3(0,1,0)));
    vec3 vv = normalize(cross(uu, ww));
    
    vec3 rd = normalize(uv.x*uu + uv.y*vv + 1.0*ww);
    
    float f = rayMarch(ro, rd);
    
    vec3 p = ro + f * rd;
    vec3 n = getNormal(p);
    
    // float l = getLight(p,n);
    float l = getLight(p,n) * getOcclusion(p,n);
    // float l = getOcclusion(p,n);
    if (fragCoord.x < 2.5 && (iResolution.y * floor(1000.0/iMs) / 60.0 - fragCoord.y) < 2.0)
        l = 1.0-l;
    fragColor = vec4(vec3(l), 1.0);
}
