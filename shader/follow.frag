 
vec2 uv; 
float aspect;

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
    col += spark(v.x, v.y, 0.02);

    v = load1(2,0);
    col += spark(v.x+0.1, v.y, 0.03);
    
    fragColor = vec4(col,1.0);
}