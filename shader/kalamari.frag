#define TOY  1

#define MAX_STEPS 64
#define MIN_DIST  0.01
#define MAX_DIST  80.0

#define PI 3.141592653589793
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

vec3 v0 = vec3(0,0,0);
vec3 vx = vec3(1,0,0);
vec3 vy = vec3(0,1,0);
vec3 vz = vec3(0,0,1);
    
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
    vec3 c1 = vec3(-5.551115123125783e-17, 0.9957819157813607, -0.09175170953613682);
    vec3 c2 = vec3(0.8164965809277261, -0.28867513459481303, 0.5);
    vec3 c3 = vec3(5.551115123125783e-17, -0.41843164659173454, -0.9082482904638632);
    vec3 c4 = vec3(-0.8164965809277261, -0.2886751345948131, 0.49999999999999994);
    
    c1 *= s;
    c2 *= s;
    c3 *= s;
    c4 *= s;
    
    vec3 n1 = normalize(cross(c2-c1,c1-c3));
    vec3 n2 = normalize(cross(c2-c1,c4-c2));
    vec3 n3 = normalize(cross(c2-c3,c2-c4));
    vec3 n4 = normalize(cross(c3-c1,c3-c4));
    
    float d = sdSphere(p,a,2.0); 
    d = opDiff(d, r, sdPlane(p, c1, n1));
    d = opDiff(d, r, sdPlane(p, c4, n2));
    d = opDiff(d, r, sdPlane(p, c4, n3));
    d = opDiff(d, r, sdPlane(p, c4, n4));
  
    return d;
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

// 000   000  00000000   0000000   0000000    
// 000   000  000       000   000  000   000  
// 000000000  0000000   000000000  000   000  
// 000   000  000       000   000  000   000  
// 000   000  00000000  000   000  0000000    

float sdSocket(vec3 p, vec3 a, vec3 n, float r)
{
    return opDiff(opDiff(sdSphere(p, a, r), 0.2, sdPlane(p, a, -n)), 0.2, sdSphere(p, a, r-0.2));
}

void head(vec3 pos)
{
    float d = sdTetra(s.pos, pos, 2.0, 0.7);
    if (d < s.dist) { s.mat = HEAD; s.dist = d; }
    
    vec3 p;
    float ed = 0.8;
    float pd = 0.4;
    float ld = 0.2;
    
    vec3 left = vec3(0.8164965809277259, 0.28867513459481303, -0.5);
    vec3 eyel = pos + ed*left;
    
    vec3 right = vec3(-0.8164965809277261, 0.2886751345948129, -0.5);
    vec3 eyer = pos + ed*right;
    
    vec3 back = vec3(-4.509849296471688e-17, 0.41843164659173443, 0.9082482904638631);
    vec3 eyeb = pos + ed*back;
    
    float sr = 0.56;
    d = opUnion(d, sdSocket(s.pos, eyel, left,  sr));
    d = opUnion(d, sdSocket(s.pos, eyer, right, sr));
    d = opUnion(d, sdSocket(s.pos, eyeb, back,  sr));
    
    if (d < s.dist) { s.mat = HEAD; s.dist = d; }
    
    vec3 nl = normalize(camPos - eyel);
    vec3 nr = normalize(camPos - eyer);
    vec3 nb = normalize(camPos - eyeb);
    
    // nl = left;
    // nr = right;
    
    eye(eyel, eyel + pd*nl, eyel + ld*nl);
    eye(eyer, eyer + pd*nr, eyer + ld*nr);
    eye(eyeb, eyeb + pd*nb, eyeb + ld*nb);
}

//  0000000   00000000   00     00  
// 000   000  000   000  000   000  
// 000000000  0000000    000000000  
// 000   000  000   000  000 0 000  
// 000   000  000   000  000   000  

void arms()
{
    
}

// 00     00   0000000   00000000   
// 000   000  000   000  000   000  
// 000000000  000000000  00000000   
// 000 0 000  000   000  000        
// 000   000  000   000  000        

float map(vec3 p)
{
    s = sdf(1000.0, p, NONE);
         
    head (vec3(0,0,0));
    arms ();

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

// 000      000   0000000   000   000  000000000  
// 000      000  000        000   000     000     
// 000      000  000  0000  000000000     000     
// 000      000  000   000  000   000     000     
// 0000000  000   0000000   000   000     000     

float getLight(vec3 p, vec3 n)
{
    vec3 lp = vec3(0, 10, 0);
    vec3 l = normalize(lp-p);
 
    float dif = dot(n,l);
    
    vec3 off = p+n*2.0*MIN_DIST;

    dif *= hardShadow(off, normalize(lp-off), MIN_DIST, 100.0, 0.5);
        
    float ambient = 0.2;
    
    if (mat == BULB)
    {
        ambient = 0.5;
    }
    
    return clamp(dif, ambient, 1.0);
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
    
    ct = iCenter; camPos = iCamera;
    camPos.x *= -1.0; ct.x *= -1.0;

    vec3 ww = normalize(ct-camPos);
    vec3 uu = normalize(cross(ww, vec3(0,1,0)));
    vec3 vv = normalize(cross(uu, ww));
    
    vec3 rd = normalize(uv.x*uu + uv.y*vv + 1.0*ww);
    
    float d = rayMarch(camPos, rd);
    mat = s.mat;
    
    vec3  p = camPos + d * rd;
    vec3  n = getNormal(p);
    float l = getLight(p,n);
        
    vec3 col;
    
    if      (mat == NONE)  col = vec3(0.2,0.2,0.2); 
    else if (mat == HEAD)  col = vec3(0.3,0.3,1.0); 
    else if (mat == TAIL)  col = vec3(1.0,1.0,0.0);
    else if (mat == PUPL)  col = vec3(0.5,0.5,1.0);
    else col = vec3(1,1,1);

    fragColor = vec4(col * l, 1.0);
}
