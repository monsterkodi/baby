#define inside(a) (fragCoord.x == a.x+0.5 && fragCoord.y == a.y+0.5)
#define save(a,b,c) if(inside(vec2(a,b))){fragColor=c;}
#define load(x,y) texelFetch(iChannel1, ivec2(x,y), 0)

int  id = -1;
int  num = 0;
vec4 val;

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    ivec2 mem = ivec2(fragCoord);
    if (mem.y > 0) return;
    id = mem.x;
    
    val = load(id, 0);
    vec4 v = vec4(val.rgb+vec3(0.01), 1.0);
    if (mem.x == 1) v.x = sin(iTime)*0.5+0.5;
    save(id,0,v);
}