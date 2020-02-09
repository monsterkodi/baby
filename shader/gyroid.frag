// https://www.shadertoy.com/view/4lyGzR 'Biomine' by Shane

#define FAR 50.0

float hash(float n) { return fract(cos(n)*45758.5453); }
mat2  rot2(float a) { vec2 v = sin(vec2(1.570796, 0) + a); return mat2(v, -v.y, v.x); }

float noise3D(in vec3 p)
{
	const vec3 s = vec3(7, 157, 113);
	vec3 ip = floor(p); p -= ip; 
    vec4 h = vec4(0., s.yz, s.y + s.z) + dot(ip, s);
    p = p*p*(3. - 2.*p); 
    h = mix(fract(sin(h)*43758.5453), fract(sin(h + s.x)*43758.5453), p.x);
    h.xy = mix(h.xz, h.yw, p.y);
    return mix(h.x, h.y, p.z);
}

float drawSphere(in vec3 p)
{
    p = fract(p)-.5;    
    return dot(p, p);
}

float cellTile(in vec3 p)
{
    vec4 d; 
    d.x = drawSphere(p - vec3(.81, .62, .53)); p.xy = vec2(p.y-p.x, p.y + p.x)*.7071;
    d.y = drawSphere(p - vec3(.39, .2, .11));  p.yz = vec2(p.z-p.y, p.z + p.y)*.7071;
    d.z = drawSphere(p - vec3(.62, .24, .06)); p.xz = vec2(p.z-p.x, p.z + p.x)*.7071;
    d.w = drawSphere(p - vec3(.2, .82, .64));
    d.xy = min(d.xz, d.yw);
    return min(d.x, d.y)*2.66;
}

vec2 path(in float z)
{ 
    float a = sin(z * 0.11);
    float b = cos(z * 0.14);
    return vec2(a*4. - b*1.5, b*1.7 + a*1.5); 
}

float smaxP(float a, float b, float s){
    
    float h = clamp( 0.5 + 0.5*(a-b)/s, 0., 1.);
    return mix(b, a, h) + h*(1.0-h)*s;
}

float map(vec3 p)
{
    p.xy -= path(p.z);
    p += sin(p.zxy*0.1) * 1.0 * (sin(iTime*0.5)*0.5+0.5); // space perturbance
    float d = dot(cos(p*PI2), sin(p.yzx*PI2)) + 1.; // gyroid lattice
    return d + sin(iTime*0.5)*.05; 
}

float bumpSurf( in vec3 p)
{
    return cellTile(p*10.0) + 0.2*noise3D(p*96.0);
}

vec3 doBumpMap(in vec3 p, in vec3 nor, float bumpfactor)
{
    const vec2 e = vec2(0.001, 0);
    float ref = bumpSurf(p);                 
    vec3 grad = (vec3(bumpSurf(p - e.xyy),
                      bumpSurf(p - e.yxy),
                      bumpSurf(p - e.yyx))-ref)/e.x;                     
    grad -= nor*dot(nor, grad);          
    return normalize( nor + grad*bumpfactor );
}

float march(in vec3 ro, in vec3 rd)
{
    float t = 0.0, h;
    for(int i = 0; i < 72; i++)
    {
        h = map(ro+rd*t);
        // if (abs(h)<0.002*(t*.125 + 1.) || t>FAR) break; 
        if (abs(h)<0.001*max(t*.25, 1.) || t>FAR) break;        
        t += step(h, 1.)*h*.2 + h*.5;
    }
    return min(t, FAR);
}

vec3 getNormal(in vec3 p) 
{
	const vec2 e = vec2(0.002, 0);
	return normalize(vec3(map(p + e.xyy) - map(p - e.xyy), map(p + e.yxy) - map(p - e.yxy),	map(p + e.yyx) - map(p - e.yyx)));
}

float softShadow(vec3 ro, vec3 rd, float start, float end, float k)
{
    float shade = 1.0;
    float dist = start;

    for (int i=0; i<16; i++)
    {
        float h = map(ro + rd*dist);
        shade = min(shade, k*h/dist);

        dist += clamp(h, 0.01, 0.25);
        
        if (h<0.001 || dist > end) break; 
    }
    return min(max(shade, 0.) + 0.1, 1.0); 
}

float calculateAO( in vec3 p, in vec3 n )
{
	float ao = 0.0, l;
    const float maxDist = 3.;
    const float nbIte = 1.0;
    for( float i=1.; i< nbIte+.5; i++ )
    {
        l = (i + hash(i))*.5/nbIte*maxDist;
        ao += (l - map( p + n*l ))/(1.+ l); 
    }
    return clamp(1.- ao/nbIte, 0., 1.);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ){
	
	vec2 uv = (fragCoord - iResolution.xy*0.5)/iResolution.y;
	
    vec3 lookAt = vec3(0, 1, -iTime*0.2 + 0.1);  
    vec3 camPos = lookAt + vec3(0.0, 0.0, -0.1);
    vec3 lightPos = camPos + vec3(0, .5, 5);

	lookAt.xy += path(lookAt.z);
	camPos.xy += path(camPos.z);
	lightPos.xy += path(lightPos.z);

    float FOV = PI2;
    vec3 forward = normalize(lookAt-camPos);
    vec3 right = normalize(vec3(forward.z, 0., -forward.x )); 
    vec3 up = cross(forward, right);

    vec3 rd;
    if (true)
    {
        rd = normalize(forward + FOV*uv.x*right + FOV*uv.y*up);
    }
    else { // Lens distortion
        rd = (forward + FOV*uv.x*right + FOV*uv.y*up);
        rd = normalize(vec3(rd.xy, rd.z - dot(rd.xy, rd.xy)*.25));    
    }
    
	rd.xy = rot2( path(lookAt.z).x/16. )*rd.xy;
		
    float t = march(camPos, rd);
    
    vec3 sceneCol = vec3(0);
	
    if (t<FAR)
    {
	    vec3 sp = t * rd+camPos;
	    vec3 sn = getNormal(sp);       

        sn = doBumpMap(sp, sn, .008);
	    
	    float ao = calculateAO(sp, sn);
    	
	    vec3 ld = lightPos-sp;

	    float distlpsp = max(length(ld), 0.001);
    	
	    ld /= distlpsp;
	    
        float atten = 1./(1. + distlpsp*0.25);
        float ambience = 0.1;
	    float diff = max( dot(sn, ld), 0.0);
	    float spec = pow(max( dot( reflect(-ld, sn), -rd ), 0.0 ), 32.);
        float fre  = pow( clamp(dot(sn, rd) + 1., .0, 1.), 1.);
        
        float shading = softShadow(sp, ld, 0.05, distlpsp, 8.);
    	
        sceneCol = vec3(1,0,0)*(diff + ambience + spec);
        sceneCol += vec3(.8, .5, 0)*pow(fre, 4.)*2.0;
        sceneCol *= atten*shading*ao;
        // sceneCol = vec3(ao);
	}
       
    vec3 sky = vec3(0.01,0.01,0.0);
    sceneCol = mix(sky, sceneCol, 1./(t*t/FAR/FAR*8. + 1.));

	fragColor = vec4(sqrt(clamp(sceneCol, 0., 1.)), 1.0);
}