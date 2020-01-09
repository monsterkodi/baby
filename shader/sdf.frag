
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

vec3 rotY(vec3 v, float deg)
{
    float rad = deg2rad(deg);
    float c = cos(rad);
    float s = sin(rad);
    return vec3(v.x*c+v.z*s, v.y, v.z*c+v.x*s);
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

//  0000000   00000000  000000000  0000000    000   0000000  000000000  
// 000        000          000     000   000  000  000          000     
// 000  0000  0000000      000     000   000  000  0000000      000     
// 000   000  000          000     000   000  000       000     000     
//  0000000   00000000     000     0000000    000  0000000      000     

float getDist(vec3 p)
{
    float m = 1000.0;
    
    vec3 p3 = rotAxisAngle(vec3(0,0,-5), vec3(0,0,-1), iTime*36.0);
    
    m = min(m, sdSphere (p, vec3(0,0,0), 0.5));
    m = min(m, sdCapsule(p, vec3(0,0,0), vec3(2,0,0), 0.2));
    m = min(m, sdCapsule(p, vec3(0,0,0), vec3(0,2,0), 0.2));
    m = min(m, sdCapsule(p, vec3(0,0,0), vec3(0,0,2), 0.2));
    // m = min(m, sdCapsule(p, vec3(0,0,0), p3, 0.2));
    m = min(m, sdPlane(p, vec3(0,-1.0,0), vec3(0,1,0)));
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
    float t = iTime*1.0;
    vec3 lp = rotY(vec3(0, 10, -10), iTime*36.0);
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
    
    float an = 2.0*PI*iMouse.x/iResolution.x-0.5;
    vec3  ro = vec3(10.0*sin(an), 1, -10.0*cos(an));
    vec3  ct = vec3(0,1,0);

    vec3 ww = normalize(ct-ro);
    vec3 uu = normalize(cross(ww, vec3(0,1,0)));
    vec3 vv = normalize(cross(uu, ww));
    
    vec3 rd = normalize(uv.x*uu + uv.y*vv + 1.5*ww);
    
    float f = rayMarch(ro, rd);
    
    vec3 p = ro + f * rd;
    
    fragColor = vec4(vec3(getLight(p)), 1.0);
}
