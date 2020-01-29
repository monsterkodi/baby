#define load0(x,y) texelFetch(iChannel0, ivec2(x,y), 0)
#define load1(x,y) texelFetch(iChannel1, ivec2(x,y), 0)
#define load2(x,y) texelFetch(iChannel2, ivec2(x,y), 0)
#define load3(x,y) texelFetch(iChannel3, ivec2(x,y), 0)

const float eps = 0.0000001;

vec3 hsl2rgb( in vec3 c )
{
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}

vec3 hsl(float h, float s, float l) { return hsl2rgb(vec3(h,s,l)); }

vec3 rgb2hsl( vec3 col )
{
    float minc = min( col.r, min(col.g, col.b) );
    float maxc = max( col.r, max(col.g, col.b) );
    vec3  mask = step(col.grr,col.rgb) * step(col.bbg,col.rgb);
    vec3 h = mask * (vec3(0.0,2.0,4.0) + (col.gbr-col.brg)/(maxc-minc + eps)) / 6.0;
    return vec3( fract( 1.0 + h.x + h.y + h.z ),              
                 (maxc-minc)/(1.0-abs(minc+maxc-1.0) + eps),  
                 (minc+maxc)*0.5 );                           
}
 
vec2 uv; 
float aspect;
#define PI 3.1415926535897

float spark(float x, float y, float r)
{
    return smoothstep(0.6,1.0,r/length(uv-vec2(x,y)));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    aspect = iResolution.x / iResolution.y;

    vec2 uvc = fragCoord.xy / iResolution.xy;
	
    vec3 hsv = vec3( uvc.x, 0.5+0.5*sin(iTime*2.0), uvc.y);
	vec3 rgb = hsl2rgb(hsv);
    vec3 col = pow(rgb, vec3(2.2));
    
	uv = (fragCoord+fragCoord-iResolution.xy)/iResolution.y;
    
    col *= 0.2*texelFetch(iChannel2, ivec2((fragCoord-iResolution.xy/2.0+vec2(iResolution.x/2.0,0.0))*2048.0/iResolution.y), 0).rrr;
    // col = texelFetch(iChannel2, ivec2(fragCoord), 0).rgb;
       
    float i = uv.x;
    // col += spark(i, 0.9*sin(2.2*iTime+i*2.0*PI), 0.02) * hsl(sin(iTime), 1.0, 0.5);
    // col += spark(i, 0.3*sin(1.2*iTime+i*2.0*PI), 0.01);
    // col += spark(i, 0.6*sin(1.2*iTime+i*2.0*PI), 0.01);
    // col += spark(i, 0.9*sin(1.2*iTime+i*2.0*PI), 0.02);
    
    vec2 mv = (iMouse.xy+iMouse.xy-iResolution.xy)/iResolution.y;
    col += spark(mv.x, mv.y, 0.02)*0.5;
    
    col += spark(0.0, 0.9*sin(2.2*iTime), 0.02)*0.1;
    
    vec4 v = load1(1,0);
    v += 0.01;
    col += spark(v.x, v.y, 0.02);
    // save(1,0,v);

    v = load1(2,0);
    col += spark(v.x, v.y, 0.03);
    
    fragColor = vec4(col,1.0);
}