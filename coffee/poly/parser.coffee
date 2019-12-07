###
00000000    0000000   00000000    0000000  00000000  00000000   
000   000  000   000  000   000  000       000       000   000  
00000000   000000000  0000000    0000000   0000000   0000000    
000        000   000  000   000       000  000       000   000  
000        000   000  000   000  0000000   00000000  000   000  
###
# Polyhédronisme
#===================================================================================================
#
# A toy for constructing and manipulating polyhedra and other meshes
#
# Copyright 2019, Anselm Levskaya
# Released under the MIT License
#
#===================================================================================================
    
{ klog } = require 'kxk'
{ add, recenter, rescale } = require './geo'

polyhedron = require './polyhedron'
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
    T: polyhedron.tetrahedron
    O: polyhedron.octahedron
    C: polyhedron.cube
    I: polyhedron.icosahedron
    D: polyhedron.dodecahedron
    P: polyhedron.prism      # n
    A: polyhedron.antiprism  # n
    Y: polyhedron.pyramid    # n
    J: polyhedron.johnson    # n
    U: polyhedron.cupola     # n
    V: polyhedron.anticupola # n
        
opmap =
    d: topo.dual
    a: topo.ambo
    k: topo.kisN
    g: topo.gyro
    p: topo.propellor
    r: topo.reflect
    c: topo.chamfer
    w: topo.whirl
    n: topo.insetN
    x: topo.extrudeN
    l: topo.loft
    P: topo.perspectiva1
    q: topo.quinto
    u: topo.trisub
    H: topo.hollow
    Z: topo.triangulate
    C: topo.canonicalize
    A: topo.adjustXY

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

generate = (notation) -> # create polyhedron from notation
  
    dispatch = (fn, arg) -> fn.apply fn, arg or []
    
    expanded = notation
    for [orig,equiv] in replacements
        expanded = expanded.replace orig, equiv
    klog "#{notation} -> #{expanded}"
    
    oplist = parser.parse(expanded).reverse()
  
    op = oplist.shift()
    basefunc = basemap[op['op']]
    baseargs = op['args']
    poly = dispatch basefunc, baseargs
  
    for op in oplist
        opfunc = opmap[op['op']]
        opargs = [poly].concat op['args']
        poly   = dispatch opfunc, opargs
  
    poly.vertices = recenter poly.vertices, poly.edges()
    poly.vertices = rescale  poly.vertices
  
    poly.vertex = poly.vertices
    poly.face   = poly.faces
    klog poly
    poly.colorize()

generate 'dC'
    
module.exports = 
    generate:generate