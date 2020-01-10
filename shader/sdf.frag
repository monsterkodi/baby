
#define MAX_STEPS 128
#define MIN_DIST  0.01
#define MAX_DIST  100.0

#define PI 3.141592653589793

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

float opUnion(float d1, float d2) 
{
    float k = 0.03;
    float h = clamp(0.5 + 0.5*(d2-d1)/k, 0.0, 1.0);
    return mix(d2, d1, h) - k*h*(1.0-h); 
}

float opDiff(float d1, float d2) 
{
    float k = 0.03;
    float h = clamp(0.5 - 0.5*(d2+d1)/k, 0.0, 1.0);
    return mix(d1, -d2, h) + k*h*(1.0-h); 
}

//  0000000   00000000  000000000  0000000    000   0000000  000000000  
// 000        000          000     000   000  000  000          000     
// 000  0000  0000000      000     000   000  000  0000000      000     
// 000   000  000          000     000   000  000       000     000     
//  0000000   00000000     000     0000000    000  0000000      000     

struct ray {
    vec3 pos;
    vec3 dir;
};

struct sdf {
    float dist;
    vec3 pos;
};

float hip(out sdf s, vec3 pos)
{
    float d = sdSphere(s.pos, pos, 0.5);
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

float spine(out sdf s, vec3 pos)
{
    float d = sdSphere(s.pos, pos, 0.25);
    d = opUnion(d, sdCapsule(s.pos, pos, pos+vec3(0,0.5,0), 0.15));
    d = opUnion(d, sdSphere(s.pos, pos+vec3(0,0.5,0), 0.2));
    s.dist = min(s.dist, d);
    return s.dist;
}

float getDist(vec3 p)
{
    float m = 1000.0;
    
    vec3 p3 = rotAxisAngle(vec3(0,0,-5), vec3(0,0,-1), iTime*36.0);
    
    sdf s = sdf(1000.0, p);
    
    hip(s, vec3(0,0,0));
    spine(s, vec3(0,0.6,0));
    
    // m = opUnion(m, sdSphere (p, vec3(0,0,0), 0.5));
    // m = opUnion(m, sdCapsule(p, vec3(0,0,0), vec3(2,0,0), 0.2));
    // m = opUnion(m, sdCapsule(p, vec3(0,0,0), vec3(0,2,0), 0.2));
    // m = opUnion(m, sdCapsule(p, vec3(0,0,0), vec3(0,0,2), 0.2));

    // m = opUnion(m, sdSphere (p, vec3(0,0,2), 0.55));
    // m = opDiff (m, sdBox (p + vec3(0,0,-2.5), vec3(1, 1, 0.5)));
    // m = opDiff (m, sdSphere (p, vec3(0,0,2), 0.45));

    // m = opUnion(m, sdSphere (p, vec3(0,2,0), 0.55));
    // m = opDiff (m, sdBox (p + vec3(0,-2.5,0), vec3(1, 0.5, 1)));

    // m = min(m, sdSphere (p, vec3(0,2,0), 0.45));
    // m = opUnion(m, sdCapsule(p, vec3(0,2.2,0), rotRayAngle(vec3(1,2.2,0), vec3(0,2.2,0), vec3(0,1,0), iTime*36.0), 0.2));
//     
    // m = opUnion(m, sdSphere (p, vec3(2,0,0), 0.55));
    // m = opDiff (m, sdBox (p + vec3(-2.5,0,0), vec3(0.5, 1, 1)));
//     
    // m = min(m, sdSphere (p, vec3(2,0,0), 0.45));
    // m = opUnion(m, sdCapsule(p, vec3(2.2,0,0), rotRayAngle(vec3(3.2,1,0), vec3(2.2,0,0), vec3(1,0,0), iTime*36.0), 0.2));
    
    m = min(s.dist, sdPlane(p, vec3(0,-1.0,0), vec3(0,1,0)));
    return m;
}

vec3 getNormal(vec3 p)
{
    float d = getDist(p);
    vec2 e = vec2(0.01, 0);
    vec3 n = d - vec3(getDist(p-e.xyy), getDist(p-e.yxy), getDist(p-e.yyx));
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
    for (int i = 0; i < MAX_STEPS; i++)
    {
        vec3 p = ro + dz * rd;
        float dp = getDist(p);
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

float softShadow( in vec3 ro, in vec3 rd, float tmin, float tmax, const float w )
{
    float t = tmin;
    float res = 1.0;
    for( int i=0; i<256; i++ )
    {
        float h = getDist(ro + t*rd);
        res = min( res, h/(w*t) );
        t += clamp(h, 0.005, 0.50);
        if ( res<-1.0 || t>tmax ) break;
    }

    res = max(res,-1.0); 

    return 0.25*(1.0+res)*(1.0+res)*(2.0-res);
}

// 000      000   0000000   000   000  000000000  
// 000      000  000        000   000     000     
// 000      000  000  0000  000000000     000     
// 000      000  000   000  000   000     000     
// 0000000  000   0000000   000   000     000     

float getLight(vec3 p)
{
    float t = 0.0; // iTime*36.0;
    vec3 lp = rotY(vec3(0, 10, -10), t);
    vec3 l = normalize(lp - p);
    vec3 n = getNormal(p);
 
    float dif = dot(n,l);
    
    vec3 off = p+n*2.0*MIN_DIST;

    dif *= softShadow(off, normalize(lp-off), MIN_DIST, 10.0, 0.3);
        
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
    
    float ay = 2.0*(iMouse.x/iResolution.x-0.5);
    float ax = clamp(iMouse.y/iResolution.y, 0.0, 0.99);
    vec3  ro = vec3(0,0,5);
    ro = rotX(ro, ax*90.0);
    ro = rotY(ro, ay*180.0);
    vec3  ct = vec3(0,0,0);

    vec3 ww = normalize(ct-ro);
    vec3 uu = normalize(cross(ww, vec3(0,1,0)));
    vec3 vv = normalize(cross(uu, ww));
    
    vec3 rd = normalize(uv.x*uu + uv.y*vv + 1.5*ww);
    
    float f = rayMarch(ro, rd);
    
    vec3 p = ro + f * rd;
    
    fragColor = vec4(vec3(getLight(p)), 1.0);
}
