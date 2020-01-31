 
float spark(float x, float y, float r)
{
    float v = r/length(gl.uv-vec2(x,y));
    // return smoothstep(0.6,1.0,v);
    return pow(v, 2.0);
}

float powi(int a, int b) { return pow(float(a), float(b)); }
float log10(float a) { return log(a)/log(10.0); }

float print(ivec2 pos, int ch)
{
    ivec2 r = gl.ifrag-pos; bool i = r.y>0 && r.x>0 && r.x<=font.size.y && r.y<=font.size.y;
    return i ? texelFetch(iChannel2,ivec2((ch%16)*64,(1024-64-64*(ch/16)))+r*64/font.size.y,0).r : 0.0;
}

float print(ivec2 pos, float v)
{
    float c = 0.0; ivec2 a = font.adv; float f = abs(v);
    int i = fract(v) == 0.0 ? 1 : fract(v*10.0) == 0.0 ? -1 : -2;
    int ch, u = max(1,int(log10(f))+1);
    ivec2 p = pos+6*a;
    for (; i <= u; i++) {
        if (i == 0)     ch = 46;
       	else if (i > 0) ch = 48+int(mod(f, powi(10,i))/powi(10,i-1));
        else            ch = 48+int(mod(f+0.005, powi(10,i+1))/powi(10,i));
        c = max(c, print(p-i*a, ch)*float(i+3)/30.0); }
    if (v < 0.0) c = max(c, print(p-i*a, 45)*float(i)/30.0);
	return c;
}

float print(ivec2 pos, vec4 v)
{
    float c = 0.0;
    for (int i = 0; i < 4; i++) {
    	c = max(c, print(pos, v[i]));
        pos += font.adv*8; }
    return c;
}

float print(ivec2 pos, vec3 v)
{
    float c = 0.0;
    for (int i = 0; i < 3; i++) {
    	c = max(c, print(pos, v[i]));
        pos += font.adv*8; }
    return c;
}

float print(ivec2 pos, vec2 v)
{
    float c = 0.0;
    for (int i = 0; i < 2; i++) {
    	c = max(c, print(pos, v[i]));
        pos += font.adv*8; }
    return c;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    initGlobal(fragCoord, iResolution);
    
    bool dither = keyState(KEY_LEFT);
    
    vec3 col = vec3(0.0);

    col += print(ivec2(0,font.size.y*7),  load(1,0));
    // col += print(ivec2(0,font.size.y*6),  load(2,0));
    col += print(ivec2(0,font.size.y*5),  vec3(iTime, iFrameRate, 1000.0*iTimeDelta));
    col += print(ivec2(0,font.size.y*4),  vec2(iCompile, gl.option));
    col += print(ivec2(0,font.size.y*3),  vec3(iResolution.xy, gl.aspect));
    col += print(ivec2(0,font.size.y*2),  iMouse);
    col += print(ivec2(0,font.size.y*1),  (2.0*abs(iMouse)-vec4(iResolution.xyxy))/iResolution.y);
       
    if (false) {
        float i = gl.uv.x;
        col += spark(i, 0.9*sin(2.2*iTime+i*2.0*PI), 0.02) * hsl(sin(iTime), 1.0, 0.5);
        col += spark(i, 0.3*sin(1.2*iTime+i*2.0*PI), 0.01);
        col += spark(i, 0.6*sin(1.2*iTime+i*2.0*PI), 0.01);
        col += spark(i, 0.9*sin(1.2*iTime+i*2.0*PI), 0.02);
    }

    if (false) {
        col *= texelFetch(iChannel2, ivec2(fragCoord), 0).rrr;
        for (int i = 0; i < 10; i++)
        {
            col += print(ivec2(i*font.size.x,font.size.y*1), 48+i);
            col += hsl(0.6, 1.0, 0.8*print(ivec2(i*font.size.x,font.size.y*0), 65+i));
        }
    }
    
    if (true) {
        vec2 mv = (iMouse.xy+iMouse.xy-iResolution.xy)/iResolution.y;
        col += spark(mv.x, mv.y, 0.02)*0.5;
        
        col += spark(0.0, 0.9*sin(2.2*iTime), 0.02)*0.1;
        
        vec4 v = 0.9*load(1,0);
        col += spark(v.x, v.y, 0.02);
    
        v = 0.9*load(2,0);
        col += spark(v.x+0.1, v.y, 0.03);
    }
    
    if (dither)
    {
        col -= vec3(hash12(gl.frag)*0.002);
        col = max(col, v0);
    }
    
    col = pow(col, vec3(1.0/2.2));
    fragColor = vec4(col,1.0);
}