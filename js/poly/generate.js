// koffee 1.6.0

/*
 0000000   00000000  000   000  00000000  00000000    0000000   000000000  00000000  
000        000       0000  000  000       000   000  000   000     000     000       
000  0000  0000000   000 0 000  0000000   0000000    000000000     000     0000000   
000   000  000       000  0000  000       000   000  000   000     000     000       
 0000000   00000000  000   000  00000000  000   000  000   000     000     00000000
 */
var PEG, alias, basemap, generate, klog, opmap, parser, poly, recenter, ref, replacements, rescale, topo;

klog = require('kxk').klog;

ref = require('./math'), recenter = ref.recenter, rescale = ref.rescale;

poly = require('./poly');

topo = require('./topo');

PEG = require('pegjs');

parser = PEG.generate("start  = opspec+\n\nopspec \n    = lettr:opcode args:opargs {return {\"op\":lettr,\"args\":args};}\n    / lettr:opcode float:float {return {\"op\":lettr,\"args\":[float]};}\n    / lettr:opcode             {return {\"op\":lettr,\"args\":[]};}\n\nopargs = \"(\"\n         num:( float:float \",\"? {return float} )+\n         \")\" {return num;}\n\nopcode = op:[a-zA-Z] {return op;}\n\nint   = digits:[0-9-]+   { return parseInt(digits.join(\"\"), 10); }\nfloat = digits:[0-9.-]+  { return parseFloat(digits.join(\"\"), 10); }");

basemap = {
    T: poly.tetrahedron,
    C: poly.cube,
    O: poly.octahedron,
    D: poly.dodecahedron,
    I: poly.icosahedron,
    P: poly.prism,
    A: poly.antiprism,
    Y: poly.pyramid,
    U: poly.cupola,
    V: poly.anticupola
};

opmap = {
    a: topo.ambo,
    b: topo.bevel,
    c: topo.chamfer,
    d: topo.dual,
    e: topo.expand,
    f: topo.flatten,
    g: topo.gyro,
    h: topo.hollow,
    k: topo.kis,
    n: topo.inset,
    p: topo.perspectiva,
    q: topo.quinto,
    r: topo.sphericalize,
    t: topo.truncate,
    u: topo.trisub,
    v: topo.canonicalize,
    w: topo.whirl,
    x: topo.extrude,
    z: topo.zirkularize
};

replacements = [[/o/g, 'jj'], [/m/g, 'kj'], [/j/g, 'da'], [/s/g, 'dg'], [/dd/g, ''], [/ad/g, 'a'], [/gd/g, 'g'], [/aO/g, 'aC'], [/aI/g, 'aD'], [/gO/g, 'gC'], [/gI/g, 'gD']];

alias = {
    cube: 'C',
    tetrahedron: 'T',
    octahedron: 'O',
    dodecahedron: 'D',
    icosahedron: 'I',
    'truncated tetrahedron': 't.6667T',
    'truncated cube': 't.5858C',
    'truncated octahedron': 't.6667O',
    'truncated dodecahedron': 't.5528D',
    'truncated icosahedron': 't.667I',
    'truncated cuboctahedron': 'z1.151b.667C',
    'truncated icosidodecahedron': 'z1.226b.667D',
    'cuboctahedron': 'djC',
    'icosidodecahedron': 'djD',
    'rhombicuboctahedron': 'e1.414C',
    'rhombicosidodecahedron': 'e.8541D',
    'snub cube': 'dgC',
    'snub dodecahedron': 'dgD',
    'triakis tetrahedron': 'vdtT',
    'triakis octahedron': 'vdtC',
    'tetrakis hexahedron': 'rdtO',
    'triakis icosahedron': 'vdtD',
    'pentakis dodecahedron': 'rkD',
    'disdyakis triacontahedron': 'rmD',
    'disdyakis dodecahedron': 'vmC',
    'rhombic dodecahedron': 'vjC',
    'rhombic triacontahedron': 'vjD',
    'deltoidal icositetrahedron': 'voC',
    'deltoidal hexecontahedron': 'oD',
    'pentagonal icositetrahedron': 'gC',
    'pentagonal hexecontahedron': 'gD'
};

generate = function(notation, normalize) {
    var baseargs, basefunc, dispatch, equiv, expanded, i, j, len, len1, op, opargs, opfunc, oplist, orig, ref1;
    if (normalize == null) {
        normalize = true;
    }
    dispatch = function(fn, arg) {
        return fn.apply(fn, arg || []);
    };
    expanded = notation;
    for (i = 0, len = replacements.length; i < len; i++) {
        ref1 = replacements[i], orig = ref1[0], equiv = ref1[1];
        expanded = expanded.replace(orig, equiv);
    }
    oplist = parser.parse(expanded).reverse();
    op = oplist.shift();
    basefunc = basemap[op['op']];
    baseargs = op['args'];
    poly = dispatch(basefunc, baseargs);
    for (j = 0, len1 = oplist.length; j < len1; j++) {
        op = oplist[j];
        opfunc = opmap[op['op']];
        opargs = [poly].concat(op['args']);
        poly = dispatch(opfunc, opargs);
    }
    if (normalize) {
        poly.vertex = recenter(poly.vertex, poly.edges());
        poly.vertex = rescale(poly.vertex);
    }
    return poly;
};

generate.alias = alias;

module.exports = generate;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGUuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVVFLE9BQVMsT0FBQSxDQUFRLEtBQVI7O0FBQ1gsTUFBd0IsT0FBQSxDQUFRLFFBQVIsQ0FBeEIsRUFBRSx1QkFBRixFQUFZOztBQUVaLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7QUFDUCxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0FBQ1AsR0FBQSxHQUFPLE9BQUEsQ0FBUSxPQUFSOztBQUVQLE1BQUEsR0FBUyxHQUFHLENBQUMsUUFBSixDQUFhLDZnQkFBYjs7QUFrQlQsT0FBQSxHQUNJO0lBQUEsQ0FBQSxFQUFHLElBQUksQ0FBQyxXQUFSO0lBQ0EsQ0FBQSxFQUFHLElBQUksQ0FBQyxJQURSO0lBRUEsQ0FBQSxFQUFHLElBQUksQ0FBQyxVQUZSO0lBR0EsQ0FBQSxFQUFHLElBQUksQ0FBQyxZQUhSO0lBSUEsQ0FBQSxFQUFHLElBQUksQ0FBQyxXQUpSO0lBS0EsQ0FBQSxFQUFHLElBQUksQ0FBQyxLQUxSO0lBTUEsQ0FBQSxFQUFHLElBQUksQ0FBQyxTQU5SO0lBT0EsQ0FBQSxFQUFHLElBQUksQ0FBQyxPQVBSO0lBUUEsQ0FBQSxFQUFHLElBQUksQ0FBQyxNQVJSO0lBU0EsQ0FBQSxFQUFHLElBQUksQ0FBQyxVQVRSOzs7QUFXSixLQUFBLEdBQ0k7SUFBQSxDQUFBLEVBQUcsSUFBSSxDQUFDLElBQVI7SUFDQSxDQUFBLEVBQUcsSUFBSSxDQUFDLEtBRFI7SUFFQSxDQUFBLEVBQUcsSUFBSSxDQUFDLE9BRlI7SUFHQSxDQUFBLEVBQUcsSUFBSSxDQUFDLElBSFI7SUFJQSxDQUFBLEVBQUcsSUFBSSxDQUFDLE1BSlI7SUFLQSxDQUFBLEVBQUcsSUFBSSxDQUFDLE9BTFI7SUFNQSxDQUFBLEVBQUcsSUFBSSxDQUFDLElBTlI7SUFPQSxDQUFBLEVBQUcsSUFBSSxDQUFDLE1BUFI7SUFR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VyxPQUFRLENBQUEsRUFBRyxDQUFBLElBQUEsQ0FBSDtJQUNuQixRQUFBLEdBQVcsRUFBRyxDQUFBLE1BQUE7SUFDZCxJQUFBLEdBQU8sUUFBQSxDQUFTLFFBQVQsRUFBbUIsUUFBbkI7QUFFUCxTQUFBLDBDQUFBOztRQUNJLE1BQUEsR0FBUyxLQUFNLENBQUEsRUFBRyxDQUFBLElBQUEsQ0FBSDtRQUNmLE1BQUEsR0FBUyxDQUFDLElBQUQsQ0FBTSxDQUFDLE1BQVAsQ0FBYyxFQUFHLENBQUEsTUFBQSxDQUFqQjtRQUNULElBQUEsR0FBUyxRQUFBLENBQVMsTUFBVCxFQUFpQixNQUFqQjtBQUhiO0lBS0EsSUFBRyxTQUFIO1FBQ0ksSUFBSSxDQUFDLE1BQUwsR0FBYyxRQUFBLENBQVMsSUFBSSxDQUFDLE1BQWQsRUFBc0IsSUFBSSxDQUFDLEtBQUwsQ0FBQSxDQUF0QjtRQUNkLElBQUksQ0FBQyxNQUFMLEdBQWMsT0FBQSxDQUFTLElBQUksQ0FBQyxNQUFkLEVBRmxCOztXQUlBO0FBeEJPOztBQTBCWCxRQUFRLENBQUMsS0FBVCxHQUFpQjs7QUFFakIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICBcbjAwMCAgICAgICAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbjAwMCAgMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcbiMjI1xuXG4jIFBvbHlow6lkcm9uaXNtZSwgQ29weXJpZ2h0IDIwMTksIEFuc2VsbSBMZXZza2F5YSwgTUlUIExpY2Vuc2VcbiAgICBcbnsga2xvZyB9ID0gcmVxdWlyZSAna3hrJ1xueyByZWNlbnRlciwgcmVzY2FsZSB9ID0gcmVxdWlyZSAnLi9tYXRoJ1xuXG5wb2x5ID0gcmVxdWlyZSAnLi9wb2x5J1xudG9wbyA9IHJlcXVpcmUgJy4vdG9wbydcblBFRyAgPSByZXF1aXJlICdwZWdqcydcbiAgICBcbnBhcnNlciA9IFBFRy5nZW5lcmF0ZSBcIlwiXCJcbiAgICBzdGFydCAgPSBvcHNwZWMrXG4gICAgXG4gICAgb3BzcGVjIFxuICAgICAgICA9IGxldHRyOm9wY29kZSBhcmdzOm9wYXJncyB7cmV0dXJuIHtcIm9wXCI6bGV0dHIsXCJhcmdzXCI6YXJnc307fVxuICAgICAgICAvIGxldHRyOm9wY29kZSBmbG9hdDpmbG9hdCB7cmV0dXJuIHtcIm9wXCI6bGV0dHIsXCJhcmdzXCI6W2Zsb2F0XX07fVxuICAgICAgICAvIGxldHRyOm9wY29kZSAgICAgICAgICAgICB7cmV0dXJuIHtcIm9wXCI6bGV0dHIsXCJhcmdzXCI6W119O31cbiAgICBcbiAgICBvcGFyZ3MgPSBcIihcIlxuICAgICAgICAgICAgIG51bTooIGZsb2F0OmZsb2F0IFwiLFwiPyB7cmV0dXJuIGZsb2F0fSApK1xuICAgICAgICAgICAgIFwiKVwiIHtyZXR1cm4gbnVtO31cbiAgICBcbiAgICBvcGNvZGUgPSBvcDpbYS16QS1aXSB7cmV0dXJuIG9wO31cbiAgICBcbiAgICBpbnQgICA9IGRpZ2l0czpbMC05LV0rICAgeyByZXR1cm4gcGFyc2VJbnQoZGlnaXRzLmpvaW4oXCJcIiksIDEwKTsgfVxuICAgIGZsb2F0ID0gZGlnaXRzOlswLTkuLV0rICB7IHJldHVybiBwYXJzZUZsb2F0KGRpZ2l0cy5qb2luKFwiXCIpLCAxMCk7IH1cbiAgICBcIlwiXCJcblxuYmFzZW1hcCA9IFxuICAgIFQ6IHBvbHkudGV0cmFoZWRyb25cbiAgICBDOiBwb2x5LmN1YmVcbiAgICBPOiBwb2x5Lm9jdGFoZWRyb25cbiAgICBEOiBwb2x5LmRvZGVjYWhlZHJvblxuICAgIEk6IHBvbHkuaWNvc2FoZWRyb25cbiAgICBQOiBwb2x5LnByaXNtICAgICAgIyBuXG4gICAgQTogcG9seS5hbnRpcHJpc20gICMgblxuICAgIFk6IHBvbHkucHlyYW1pZCAgICAjIG5cbiAgICBVOiBwb2x5LmN1cG9sYSAgICAgIyBuXG4gICAgVjogcG9seS5hbnRpY3Vwb2xhICMgblxuICAgICAgICBcbm9wbWFwID1cbiAgICBhOiB0b3BvLmFtYm9cbiAgICBiOiB0b3BvLmJldmVsXG4gICAgYzogdG9wby5jaGFtZmVyXG4gICAgZDogdG9wby5kdWFsXG4gICAgZTogdG9wby5leHBhbmRcbiAgICBmOiB0b3BvLmZsYXR0ZW5cbiAgICBnOiB0b3BvLmd5cm9cbiAgICBoOiB0b3BvLmhvbGxvd1xuICAgIGs6IHRvcG8ua2lzXG4gICAgbjogdG9wby5pbnNldFxuICAgIHA6IHRvcG8ucGVyc3BlY3RpdmFcbiAgICBxOiB0b3BvLnF1aW50b1xuICAgIHI6IHRvcG8uc3BoZXJpY2FsaXplXG4gICAgdDogdG9wby50cnVuY2F0ZVxuICAgIHU6IHRvcG8udHJpc3ViXG4gICAgdjogdG9wby5jYW5vbmljYWxpemVcbiAgICB3OiB0b3BvLndoaXJsXG4gICAgeDogdG9wby5leHRydWRlXG4gICAgejogdG9wby56aXJrdWxhcml6ZVxuXG5yZXBsYWNlbWVudHMgPSBbXG4gICAgWy9vL2csICAgICAgJ2pqJ10gICAgIyBvICAgIC0+IGpqICAgb3J0aG9cbiAgICBbL20vZywgICAgICAna2onXSAgICAjIG0gICAgLT4ga2ogICBtZXRhXG4gICAgWy9qL2csICAgICAgJ2RhJ10gICAgIyBqICAgIC0+IGRhXG4gICAgWy9zL2csICAgICAgJ2RnJ10gICAgIyBzICAgIC0+IGRnXG4gICAgWy9kZC9nLCAgICAgJyddICAgICAgIyBkZCAgIC0+IFxuICAgIFsvYWQvZywgICAgICdhJ10gICAgICMgYWQgICAtPiBhICAgXG4gICAgWy9nZC9nLCAgICAgJ2cnXSAgICAgIyBnZCAgIC0+IGcgICBcbiAgICBbL2FPL2csICAgICAnYUMnXSAgICAjIGFPICAgLT4gYUMgIFxuICAgIFsvYUkvZywgICAgICdhRCddICAgICMgYUkgICAtPiBhRCAgXG4gICAgWy9nTy9nLCAgICAgJ2dDJ10gICAgIyBnTyAgIC0+IGdDICBcbiAgICBbL2dJL2csICAgICAnZ0QnXSAgICAjIGdJICAgLT4gZ0QgIFxuXVxuXG5hbGlhcyA9IFxuICAgICMgcGxhdG9uaWNcbiAgICBjdWJlOiAgICAgICAgICAgICAgICAgICAgICAgICAgICdDJ1xuICAgIHRldHJhaGVkcm9uOiAgICAgICAgICAgICAgICAgICAgJ1QnXG4gICAgb2N0YWhlZHJvbjogICAgICAgICAgICAgICAgICAgICAnTydcbiAgICBkb2RlY2FoZWRyb246ICAgICAgICAgICAgICAgICAgICdEJ1xuICAgIGljb3NhaGVkcm9uOiAgICAgICAgICAgICAgICAgICAgJ0knXG4gICAgIyBhcmNoaW1lZGlhblxuICAgICd0cnVuY2F0ZWQgdGV0cmFoZWRyb24nOiAgICAgICAgJ3QuNjY2N1QnXG4gICAgJ3RydW5jYXRlZCBjdWJlJzogICAgICAgICAgICAgICAndC41ODU4QydcbiAgICAndHJ1bmNhdGVkIG9jdGFoZWRyb24nOiAgICAgICAgICd0LjY2NjdPJ1xuICAgICd0cnVuY2F0ZWQgZG9kZWNhaGVkcm9uJzogICAgICAgJ3QuNTUyOEQnXG4gICAgJ3RydW5jYXRlZCBpY29zYWhlZHJvbic6ICAgICAgICAndC42NjdJJ1xuICAgICd0cnVuY2F0ZWQgY3Vib2N0YWhlZHJvbic6ICAgICAgJ3oxLjE1MWIuNjY3QydcbiAgICAndHJ1bmNhdGVkIGljb3NpZG9kZWNhaGVkcm9uJzogICd6MS4yMjZiLjY2N0QnXG4gICAgJ2N1Ym9jdGFoZWRyb24nOiAgICAgICAgICAgICAgICAnZGpDJyBcbiAgICAnaWNvc2lkb2RlY2FoZWRyb24nOiAgICAgICAgICAgICdkakQnIFxuICAgICdyaG9tYmljdWJvY3RhaGVkcm9uJzogICAgICAgICAgJ2UxLjQxNEMnXG4gICAgJ3Job21iaWNvc2lkb2RlY2FoZWRyb24nOiAgICAgICAnZS44NTQxRCdcbiAgICAnc251YiBjdWJlJzogICAgICAgICAgICAgICAgICAgICdkZ0MnIFxuICAgICdzbnViIGRvZGVjYWhlZHJvbic6ICAgICAgICAgICAgJ2RnRCcgXG4gICAgIyBjYXRhbGFuXG4gICAgJ3RyaWFraXMgdGV0cmFoZWRyb24nOiAgICAgICAgICAndmR0VCcgIyAna1QnIFxuICAgICd0cmlha2lzIG9jdGFoZWRyb24nOiAgICAgICAgICAgJ3ZkdEMnICMgJ2tPJyBcbiAgICAndGV0cmFraXMgaGV4YWhlZHJvbic6ICAgICAgICAgICdyZHRPJyAjICdrQycgXG4gICAgJ3RyaWFraXMgaWNvc2FoZWRyb24nOiAgICAgICAgICAndmR0RCcgIyAna0knIFxuICAgICdwZW50YWtpcyBkb2RlY2FoZWRyb24nOiAgICAgICAgJ3JrRCcgIyAnay4yNTE1RCcgXG4gICAgJ2Rpc2R5YWtpcyB0cmlhY29udGFoZWRyb24nOiAgICAncm1EJyAjXG4gICAgJ2Rpc2R5YWtpcyBkb2RlY2FoZWRyb24nOiAgICAgICAndm1DJyAjXG4gICAgJ3Job21iaWMgZG9kZWNhaGVkcm9uJzogICAgICAgICAndmpDJyAjXG4gICAgJ3Job21iaWMgdHJpYWNvbnRhaGVkcm9uJzogICAgICAndmpEJyAjXG4gICAgJ2RlbHRvaWRhbCBpY29zaXRldHJhaGVkcm9uJzogICAndm9DJyAjXG4gICAgJ2RlbHRvaWRhbCBoZXhlY29udGFoZWRyb24nOiAgICAnb0QnICAjXG4gICAgJ3BlbnRhZ29uYWwgaWNvc2l0ZXRyYWhlZHJvbic6ICAnZ0MnICAjXG4gICAgJ3BlbnRhZ29uYWwgaGV4ZWNvbnRhaGVkcm9uJzogICAnZ0QnICAjXG4gICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwXG4jIDAwMCAgICAgICAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgXG4jIDAwMCAgMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwXG5cbmdlbmVyYXRlID0gKG5vdGF0aW9uLCBub3JtYWxpemU9dHJ1ZSkgLT5cbiAgXG4gICAgZGlzcGF0Y2ggPSAoZm4sIGFyZykgLT4gZm4uYXBwbHkgZm4sIGFyZyBvciBbXVxuICAgIFxuICAgIGV4cGFuZGVkID0gbm90YXRpb25cbiAgICBmb3IgW29yaWcsZXF1aXZdIGluIHJlcGxhY2VtZW50c1xuICAgICAgICBleHBhbmRlZCA9IGV4cGFuZGVkLnJlcGxhY2Ugb3JpZywgZXF1aXZcbiAgICBcbiAgICBvcGxpc3QgPSBwYXJzZXIucGFyc2UoZXhwYW5kZWQpLnJldmVyc2UoKVxuICBcbiAgICBvcCA9IG9wbGlzdC5zaGlmdCgpXG4gICAgYmFzZWZ1bmMgPSBiYXNlbWFwW29wWydvcCddXVxuICAgIGJhc2VhcmdzID0gb3BbJ2FyZ3MnXVxuICAgIHBvbHkgPSBkaXNwYXRjaCBiYXNlZnVuYywgYmFzZWFyZ3NcbiAgXG4gICAgZm9yIG9wIGluIG9wbGlzdFxuICAgICAgICBvcGZ1bmMgPSBvcG1hcFtvcFsnb3AnXV1cbiAgICAgICAgb3BhcmdzID0gW3BvbHldLmNvbmNhdCBvcFsnYXJncyddXG4gICAgICAgIHBvbHkgICA9IGRpc3BhdGNoIG9wZnVuYywgb3BhcmdzXG5cbiAgICBpZiBub3JtYWxpemVcbiAgICAgICAgcG9seS52ZXJ0ZXggPSByZWNlbnRlciBwb2x5LnZlcnRleCwgcG9seS5lZGdlcygpXG4gICAgICAgIHBvbHkudmVydGV4ID0gcmVzY2FsZSAgcG9seS52ZXJ0ZXhcbiAgXG4gICAgcG9seVxuXG5nZW5lcmF0ZS5hbGlhcyA9IGFsaWFzXG4gICAgXG5tb2R1bGUuZXhwb3J0cyA9IGdlbmVyYXRlXG4iXX0=
//# sourceURL=../../coffee/poly/generate.coffee