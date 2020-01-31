
int  id = -1;
int  num = 0;
vec4 val;

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    initGlobal(fragCoord);
    
    ivec2 mem = ivec2(fragCoord);
    if (mem.y > 0) return;
    id = mem.x;
    
    val = load(id, 0);
    
    if (mem.x == 0)
    {
        val.x = floor(iTime*0.2);
    }
    else
    {
        if (mem.x == 1) { val.x = sin(iTime)*0.5+0.5; }
        else
        {
            val.rgb += vec3(0.01);
        }
    }
    save(id,0,val);
    fragColor = gl.color;
}