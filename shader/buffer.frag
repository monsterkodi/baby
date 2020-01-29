#define inside(a) (fragCoord.x == a.x+0.5 && fragCoord.y == a.y+0.5)
#define save(a,b,c) if(inside(vec2(a,b))){fragColor=c;return;}
#define load(x,y) texelFetch(iChannel1, ivec2(x,y), 0)

int id = -1;
int num = 0;
vec4 val;

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    ivec2 mem = ivec2(fragCoord);
    if (mem.y > 0) return;
	if (mem.x == 0)
    {
        return;
    }
    if (mem.x > 10)
    {
        return;
    }
    
    id = mem.x;
    val = load(id, 0);
    save(id,0,float(id)*0.5+val+0.003*(fragCoord.x-2.0));
}