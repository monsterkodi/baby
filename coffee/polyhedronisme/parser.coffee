# Polyhédronisme
#===================================================================================================
#
# A toy for constructing and manipulating polyhedra and other meshes
#
# Copyright 2019, Anselm Levskaya
# Released under the MIT License

# Parser Routines
#===================================================================================================

# fairly straightforward Parser Expression Grammar spec for simple operator-chain-on-base-polyhedra recipes
    
{ add } = require './geo'
    
PEG = require 'pegjs'
    
parser = PEG.generate """
    /* series of opspecs */
    start  = opspec+
    
    /* opspec one of:
     A  - single letter
     A3 - single letter and float
     B(5,4.3,3) - function call format w. float args
    */
    opspec 
        = lettr:opcode args:opargs {return {"op":lettr,"args":args};}
        / lettr:opcode float:float {return {"op":lettr,"args":[float]};}
        / lettr:opcode             {return {"op":lettr,"args":[]};}
    
    /*
    parentheses surrounding comma-delimited list of floats i.e.
    ( 1 , 3.2, 4 ) or (1) or (2,3)
    */
    opargs = "("
               num:( float:float ","? {return float} )+
             ")" {return num;}
    
    /* just a letter */
    opcode = op:[a-zA-Z] {return op;}
    
    /* standard numerical types */
    int   = digits:[0-9-]+   { return parseInt(digits.join(""), 10);  }
    float = digits:[0-9.-]+  { return parseFloat(digits.join(""), 10); }
    """

polyhedron = require './polyhedron'

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
    
topo = require './topo'
    
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

# list of basic equivalences, easier to replace before parsing
specreplacements = [
    [/e/g, "aa"]   # e --> aa   (abbr. for explode)
    [/b/g, "ta"]   # b --> ta   (abbr. for bevel)
    [/o/g, "jj"]   # o --> jj   (abbr. for ortho)
    [/m/g, "kj"]   # m --> kj   (abbr. for meta)
    [/t(\d*)/g, "dk$1d"],  # t(n) --> dk(n)d  (dual operations)
    [/j/g, "dad"]  # j --> dad  (dual operations) # Why not j --> da ?
    [/s/g, "dgd"]  # s --> dgd  (dual operations) # Why not s --> dg ?
    [/dd/g, ""]    # dd --> null  (order 2)
    [/ad/g, "a"]   # ad --> a   (a_ = ad_)
    [/gd/g, "g"]   # gd --> g   (g_ = gd_)
    [/aO/g, "aC"]  # aO --> aC  (for uniqueness)
    [/aI/g, "aD"]  # aI --> aD  (for uniqueness)
    [/gO/g, "gC"]  # gO --> gC  (for uniqueness)
    [/gI/g, "gD"]  # gI --> gD  (for uniqueness)
]

getOps = (notation) ->
    
    expanded = notation
    for [orig,equiv] in specreplacements
        expanded = expanded.replace orig, equiv
    console.log "#{notation} executed as #{expanded}"
    expanded

generatePoly = (notation) -> # create polyhedron from notation
  
    dispatch = (fn, args) -> fn.apply fn, args or []
    
    ops_spec = getOps notation
    oplist = parser.parse(ops_spec).reverse()
  
    op = oplist.shift()
    basefunc = basemap[op["op"]]
    baseargs = op["args"]
    poly = dispatch basefunc, baseargs
  
    for op in oplist
        opfunc = opmap[op["op"]]
        opargs = [poly].concat op["args"]
        poly = dispatch opfunc, opargs
  
    # Recenter polyhedra at origin (rarely needed)
    poly.vertices = recenter poly.vertices, poly.edges()
    poly.vertices = rescale poly.vertices
  
    # Color the faces of the polyhedra for display
    poly = paintPolyhedron poly

generatePoly 'tT'
    