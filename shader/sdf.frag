
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

float sdCylinder(vec3 p, vec3 a, float h, float r)
{
    p = p - a;
    vec2 d = abs(vec2(length(p.xz),p.y)) - vec2(r,h);
    return min(max(d.x,d.y),0.0) + length(max(d,0.0));
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

float opDiff(float d1, float k, float d2) 
{
    float h = clamp(0.5 - 0.5*(d2+d1)/k, 0.0, 1.0);
    return mix(d1, -d2, h) + k*h*(1.0-h); 
}

float opInter(float d1, float d2) 
{
    float k = 0.03;
    float h = clamp(0.5 - 0.5*(d2-d1)/k, 0.0, 1.0);
    return mix(d2, d1, h) + k*h*(1.0-h);
}

struct ray {
    vec3 pos;
    vec3 dir;
};

struct sdf {
    float dist;
    vec3 pos;
};

// 000   000  000  00000000   
// 000   000  000  000   000  
// 000000000  000  00000000   
// 000   000  000  000        
// 000   000  000  000        

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

//  0000000  00000000   000  000   000  00000000  
// 000       000   000  000  0000  000  000       
// 0000000   00000000   000  000 0 000  0000000   
//      000  000        000  000  0000  000       
// 0000000   000        000  000   000  00000000  

float spineHi(out sdf s, vec3 pos)
{
    float d = sdSphere(s.pos, pos, 0.25);
    d = opUnion(d, sdCapsule(s.pos, pos, pos+vec3(0,0.5,0), 0.15));
    d = opUnion(d, sdSphere(s.pos, pos+vec3(0,0.5,0), 0.25));
    d = opDiff (d, sdPlane(s.pos, pos+vec3(0,-.1,0), vec3(0,1,0)));
    s.dist = min(s.dist, d);
    return s.dist;
}

float spineLow(out sdf s, vec3 pos)
{
    float d = sdSphere(s.pos, pos, 0.25);
    d = opUnion(d, sdCapsule(s.pos, pos, pos+vec3(0,0.5,0), 0.15));
    d = opUnion(d, sdSphere(s.pos, pos+vec3(0,0.5,0), 0.22));
    s.dist = min(s.dist, d);
    return s.dist;
}

float torso(out sdf s, vec3 pos)
{
    float d = sdSphere(s.pos, pos, 1.0);
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

float head(out sdf s, vec3 pos)
{
    float d = sdSphere(s.pos, pos, 1.3);
    d = opDiff (d, 0.15, sdPlane(s.pos, pos, vec3(0,1,0)));
    d = opDiff (d, 0.15, sdCylinder(s.pos, pos, 0.1, 1.05)-.075);

    d = opUnion(d, sdSphere(s.pos, pos+vec3(0,0,0), 0.3));
    d = opDiff (d, sdPlane(s.pos, pos+vec3(0,0,0), vec3(0,1,0)));

    vec3 mirror = s.pos;
    mirror.x = abs(mirror.x);
    d = opUnion(d, sdSphere(mirror, pos+vec3(0.5, 0.45, -1.3), 0.33));
    d = opDiff (d, 0.1, sdSphere(mirror, pos+vec3(0.5, 0.45, -1.3), 0.25));
    d = opDiff (d, 0.1, sdPlane(s.pos, pos+vec3(0,0,-1.3), vec3(0,0,1.0)));
    
    d = min(d, sdSphere(mirror, pos+vec3(0.5, 0.45, -1.3), 0.25));

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
    vec3 p3 = rotAxisAngle(vec3(0,0,-5), vec3(0,0,-1), iTime*36.0);
    
    sdf s = sdf(1000.0, p);
    
    hip(s, vec3(0,0,0));
    spineLow(s, vec3(0,0.6,0));
    spineHi(s, vec3(0,1.1,0));
    torso(s, vec3(0,2.7,0));
    spineLow(s, vec3(0,2.7,0));
    spineHi(s, vec3(0,3.2,0));
    head(s, vec3(0,3.7,0));
    
    if (iCamera.y > -1.0)
    {
        s.dist = min(s.dist, sdPlane(p, vec3(0,-1.0,0), vec3(0,1,0)));
    }
    
    return s.dist;
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

float rayMarch(vec3 ro, vec3 rd)
{
    float dz = 0.0;
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

float softShadow( in vec3 ro, in vec3 rd, float mint, float maxt, const float w )
{
 	float t = mint;
    float res = 1.0;
    for( int i=0; i<256; i++ )
    {
        float h = map(ro+rd*t);
        if (h <= 0.0)
        {
            res = 0.0;
            break;
        }
        res = min( res, h/(w*t) );
        t += min(h, 0.2);
        if (res < -1.0 || t > maxt) break;
    }
    res = max(res,-1.0);

    return 0.25*(1.0+res)*(1.0+res)*(2.0-res);
}

float hardShadow( in vec3 ro, in vec3 rd, float mint, float maxt, const float w)
{
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

float getLight(vec3 p)
{
    float t = iTime*3.0;
    vec3 lp = rotY(vec3(0, 10, -10), t);
    vec3 l = normalize(lp - p);
    vec3 n = getNormal(p);
 
    float dif = dot(n,l);
    
    vec3 off = p+n*2.0*MIN_DIST;

    dif *= softShadow(off, normalize(lp-off), MIN_DIST, 10.0, 0.05);
    // dif *= hardShadow(off, normalize(lp-off), MIN_DIST, 10.0, 0.5);
        
    return clamp(dif, 0.0, 1.0);
}

//  0000000    0000000   0000000  000      000   000   0000000  000   0000000   000   000  
// 000   000  000       000       000      000   000  000       000  000   000  0000  000  
// 000   000  000       000       000      000   000  0000000   000  000   000  000 0 000  
// 000   000  000       000       000      000   000       000  000  000   000  000  0000  
//  0000000    0000000   0000000  0000000   0000000   0000000   000   0000000   000   000  

const vec3 aoDir[12] = vec3[12](
    vec3(0.357407, 0.357407, 0.862856),
    vec3(0.357407, 0.862856, 0.357407),
    vec3(0.862856, 0.357407, 0.357407),
    vec3(-0.357407, 0.357407, 0.862856),
    vec3(-0.357407, 0.862856, 0.357407),
    vec3(-0.862856, 0.357407, 0.357407),
    vec3(0.357407, -0.357407, 0.862856),
    vec3(0.357407, -0.862856, 0.357407),
    vec3(0.862856, -0.357407, 0.357407),
    vec3(-0.357407, -0.357407, 0.862856),
    vec3(-0.357407, -0.862856, 0.357407),
    vec3(-0.862856, -0.357407, 0.357407)
);

float occ(vec3 p, vec3 n)
{
    float dist = 10.0*MIN_DIST;
    float occ = 1.0;
    for (int i = 0; i < 4; i++)
    {
        float d = map(p + dist * n);
        occ = min(occ, d / dist);
        if (d < MIN_DIST) { break; }
        // dist += 4.0*MIN_DIST;
        dist *= 1.5;
    }
    return max(occ, 0.0);
}

float getOcclusion(vec3 p)
{
    mat3 mat = alignMatrix(getNormal(p));
    float l = 0.0;
    for (int i = 0; i < 12; i++) 
    {
        vec3 m = mat * aoDir[i];
        l += occ(p, m);
    }
    // return clamp(0.1*l, 0.0, 1.0);
    return pow(0.2 * l, 0.4);
    // return l*0.2;
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
    
    vec3 rd = normalize(uv.x*uu + uv.y*vv + 1.5*ww);
    
    float f = rayMarch(ro, rd);
    
    vec3 p = ro + f * rd;
    
    float l = getLight(p);
    // float l = max(getLight(p), getOcclusion(p));
    // float l = getLight(p) * getOcclusion(p);
    // float l = getOcclusion(p);
    if (fragCoord.x < 2.5 && (iResolution.y * floor(1000.0/iMs) / 60.0 - fragCoord.y) < 2.0)
        l = 1.0-l;
    fragColor = vec4(vec3(l), 1.0);
}
