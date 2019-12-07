###
 0000000   00000000  000   000  00000000  00000000    0000000   000000000  00000000  
000        000       0000  000  000       000   000  000   000     000     000       
000  0000  0000000   000 0 000  0000000   0000000    000000000     000     0000000   
000   000  000       000  0000  000       000   000  000   000     000     000       
 0000000   00000000  000   000  00000000  000   000  000   000     000     00000000  
###
#
# Polyhédronisme, Copyright 2019, Anselm Levskaya, MIT License
    
{ klog } = require 'kxk'
{ add, recenter, rescale } = require './geo'

poly = require './poly'
topo = require './topo'
PEG  = require 'pegjs'
    
parser = PEG.generate """
    start  = opspec+
    
    opspec 
        = lettr:opcode args:opargs {return {"op":lettr,"args":args};}
        / lettr:opcode float:float {return {"op":lettr,"args":[float]};}
        / lettr:opcode             {return {"op":lettr,"args":[]};}
    
    opargs = "("
             num:( float:float ","? {return float} )+
             ")" {return num;}
    
    opcode = op:[a-zA-Z] {return op;}
    
    int   = digits:[0-9-]+   { return parseInt(digits.join(""), 10); }
    float = digits:[0-9.-]+  { return parseFloat(digits.join(""), 10); }
    """

basemap = 
    T: poly.tetrahedron
    C: poly.cube
    O: poly.octahedron
    D: poly.dodecahedron
    I: poly.icosahedron
    P: poly.prism      # n
    A: poly.antiprism  # n
    Y: poly.pyramid    # n
    U: poly.cupola     # n
    V: poly.anticupola # n
        
opmap =
    d: topo.dual
    a: topo.ambo
    k: topo.kis
    g: topo.gyro
    r: topo.reflect
    c: topo.chamfer
    w: topo.whirl
    n: topo.inset
    x: topo.extrude
    p: topo.perspectiva
    q: topo.quinto
    u: topo.trisub
    h: topo.hollow
    f: topo.flatten
    v: topo.canonicalize
    z: topo.zirkularize

replacements = [
    [/e/g,      'aa']    # e    -> aa   explode
    [/b/g,      'ta']    # b    -> ta   bevel
    [/o/g,      'jj']    # o    -> jj   ortho
    [/m/g,      'kj']    # m    -> kj   meta
    [/t(\d*)/g, 'dk$1d'] # t(n) -> dk(n)d
    [/j/g,      'dad']   # j    -> dad  
    [/s/g,      'dgd']   # s    -> dgd  
    [/dd/g,     '']      # dd   -> 
    [/ad/g,     'a']     # ad   -> a   
    [/gd/g,     'g']     # gd   -> g   
    [/aO/g,     'aC']    # aO   -> aC  
    [/aI/g,     'aD']    # aI   -> aD  
    [/gO/g,     'gC']    # gO   -> gC  
    [/gI/g,     'gD']    # gI   -> gD  
]

#  0000000   00000000  000   000  00000000  00000000    0000000   000000000  00000000
# 000        000       0000  000  000       000   000  000   000     000     000     
# 000  0000  0000000   000 0 000  0000000   0000000    000000000     000     0000000 
# 000   000  000       000  0000  000       000   000  000   000     000     000     
#  0000000   00000000  000   000  00000000  000   000  000   000     000     00000000

generate = (notation, normalize=true) ->
  
    dispatch = (fn, arg) -> fn.apply fn, arg or []
    
    expanded = notation
    for [orig,equiv] in replacements
        expanded = expanded.replace orig, equiv
    # klog "#{notation} -> #{expanded}"
    
    oplist = parser.parse(expanded).reverse()
  
    op = oplist.shift()
    basefunc = basemap[op['op']]
    baseargs = op['args']
    poly = dispatch basefunc, baseargs
  
    for op in oplist
        opfunc = opmap[op['op']]
        opargs = [poly].concat op['args']
        poly   = dispatch opfunc, opargs
          
    if normalize
        poly.vertices = recenter poly.vertices, poly.edges()
        poly.vertices = rescale  poly.vertices
  
    poly.vertex = poly.vertices
    poly.face   = poly.faces
    poly #.colorize()

module.exports = generate