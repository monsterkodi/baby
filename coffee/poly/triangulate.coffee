###
000000000  00000000   000   0000000   000   000   0000000   000   000  000       0000000   000000000  00000000  
   000     000   000  000  000   000  0000  000  000        000   000  000      000   000     000     000       
   000     0000000    000  000000000  000 0 000  000  0000  000   000  000      000000000     000     0000000   
   000     000   000  000  000   000  000  0000  000   000  000   000  000      000   000     000     000       
   000     000   000  000  000   000  000   000   0000000    0000000   0000000  000   000     000     00000000  
###
# Polyhédronisme
#==================================================================================================
#
# A toy for constructing and manipulating polyhedra and other meshes
#
# Copyright 2019, Anselm Levskaya
# Released under the MIT License
#

# Ear-based triangulation of 2d faces, takes array of 2d coords in the face ordering
# Returns indices of the new diagonal lines to cut.
#
# assumes planarity of course, so this isn't the ideal algo for making aesthetically pleasing
# "flattening" choices in distorted polyhedral planes.

{ Polyhedron } = require './polyhedron'

getDiagonals = (verts) ->

    limiter = 999
    diagonals = []
    ear = []
    facelen = verts.length
  
    XOR = (x, y) -> (x or y) and !(x and y);
    Area2 = (Va,Vb,Vc)  -> ((Vb[0]-Va[0])*(Vc[1]-Va[1])) - ((Vc[0]-Va[0])*(Vb[1]-Va[1]));
    Left = (Va, Vb, Vc) -> Area2(Va, Vb, Vc) > 0;
    LeftOn = (Va, Vb, Vc) -> Area2(Va, Vb, Vc) >= 0;
    Collinear = (Va, Vb, Vc) -> Area2(Va, Vb, Vc) == 0;
  
    Between = (Va, Vb, Vc) ->
        if Collinear Va, Vb, Vc  
            return false
        if Va[0] != Vb[0] 
            return ((Va[0] <= Vc[0]) and (Vc[0] <= Vb[0])) or ((Va[0] >= Vc[0]) and (Vc[0] >= Vb[0]))
        else 
            return ((Va[1] <= Vc[1]) and (Vc[1] <= Vb[1])) or ((Va[1] >= Vc[1]) and (Vc[1] >= Vb[1]))
  
    IntersectProp = (Va, Vb, Vc, Vd) ->
        if Collinear(Va, Vb, Vc) or Collinear(Va, Vb, Vd) or Collinear(Vc, Vd, Va) or Collinear(Vc, Vd, Vb) 
            return false

        XOR(Left(Va, Vb, Vc), Left(Va, Vb, Vd)) and XOR(Left(Vc, Vd, Va), Left(Vc, Vd, Vb))
  
    Intersect = (Va, Vb, Vc, Vd) ->
        if IntersectProp Va, Vb, Vc, Vd
            true
        else
            Between(Va, Vb, Vc) or Between(Va, Vb, Vd) or Between(Vc, Vd, Va) or Between(Vc, Vd, Vb)
  
    InCone = (a, b) ->
        a1 = (a+1+facelen)%facelen
        a0 = ((a-1)+facelen)%facelen
        if LeftOn verts[a], verts[a1], verts[a0]
            return Left(verts[a], verts[b], verts[a0]) and Left(verts[b], verts[a], verts[a1])
        not (LeftOn(verts[a], verts[b], verts[a1]) and LeftOn(verts[b], verts[a], verts[a0]))
  
    Diagonalie = (a, b) ->
        c = 0
        while true
            c1 = (c+1+facelen)%facelen
            if ((c != a) and (c1 != a) and (c != b) and (c1 != b) and IntersectProp(verts[a], verts[b], verts[c], verts[c1])) 
                return false
            c  = (c+1+facelen)%facelen
            if c == 0
                break
        return true
  
    Diagonal = (a, b) -> InCone(a, b) and InCone(b, a) and Diagonalie(a, b)
  
    v1 = 0
    while true
        v2 = (v1+1+facelen)%facelen # v1.next
        v0 = ((v1-1)+facelen)%facelen # v1.prev
        ear[v1] = Diagonal v0, v2
        v1 = (v1+1+facelen)%facelen 
        if v1 == 0 then break
  
    origIdx = [0...facelen]
    n = facelen # verts.length
    z = limiter 
    head = 0 #??
    while (z > 0) and (n > 3)
        z -= 1
        v2 = head
        y = limiter
        while true
            y -= 1;
            broke = false
            if ear[v2]
                v3 = (v2+1+facelen)%facelen # v2.next
                v4 = (v3+1+facelen)%facelen # v3.next
                v1 = ((v2-1)+facelen)%facelen # v2.prev
                v0 = ((v1-1)+facelen)%facelen # v1.prev
                diagonals.push([ origIdx[v1], origIdx[v3] ]) 
                ear[v1] = Diagonal(v0, v3) 
                ear[v3] = Diagonal(v1, v4) 
                #v1.next = v3
                #v3.prev = v1
                verts = verts.slice(0, +v2 + 1 or undefined).concat(verts.slice(v3))
                origIdx = origIdx.slice(0, +v2 + 1 or undefined).concat(origIdx.slice(v3))
                if (v0>v2) then v0 -= 1
                if (v1>v2) then v1 -= 1
                if (v3>v2) then v3 -= 1
                if (v4>v2) then v4 -= 1
                facelen--
                head = v3
                n--
                broke = true
            v2 = (v2+1+facelen)%facelen # v2.next
            if y <= 0 or broke or v2 == head 
                break
  
    return diagonals

# equates triplets of numbers if they can be rotated into identity
triEq = (tri1, tri2) -> (((tri1[0] == tri2[0]) and (tri1[1] == tri2[1]) and (tri1[2] == tri2[2])) or ((tri1[0] == tri2[1]) and (tri1[1] == tri2[2]) and (tri1[2] == tri2[0]))  or ((tri1[0] == tri2[2]) and (tri1[1] == tri2[0]) and (tri1[2] == tri2[1]))) 

# god-awful but working hack to turn diagonals into triangles
# switch to an edge-matching algo, it would be 10x simpler
diagsToTris = (f,diags) ->
    edges = []
    redges = []
    # get edges from faces as assoc arrays
    for [v1, v2] in ([0...f.length].map (i) -> [i, (i+1)%f.length])
        edges[v1]  = [v2]
        redges[v2] = [v1]
    for d in diags  # push the diagonals into the assoc arrays in both directions!
        edges[d[0]].push d[1]
        edges[d[1]].push d[0]
        redges[d[0]].push d[1]
        redges[d[1]].push d[0]
    tris=[]
    for d in diags # orig N-face, N-2 triangles from the N-3 diagonals
        for e1 in edges[d[1]] # edge after diag
            for e2 in redges[d[0]] # edge before diag
                if e1 == e2 # if they meet we have a triangle!
                    tris.push [d[0],d[1],e1]
        for e1 in edges[d[0]] # same as above for other dir along diagonal
            for e2 in redges[d[1]]
                if e1 == e2
                    tris.push [d[1],d[0],e1]
                    
    # unfortunately the above duplicates triangles, so filter out repeats
    uniques = [tris.pop()]
    for tri in tris
        already_present = false
        for extant_tri in uniques
            if triEq tri, extant_tri
                already_present = true
                break
        if not already_present 
            uniques.push tri
  
    return uniques

# driver routine, projects 3d face to 2d, get diagonals then triangles,
# then builds new polyhedron out of them, preserving original face colors
triangulate = (poly, colors) ->

    klog "triangulate #{poly.name}"
  
    newpoly = new Polyhedron poly.name # don't change the name
    newpoly.vertices = clone poly.vertices
    newpoly.face_classes = []

    for [i...poly.faces.length] 
        f = poly.faces[i]
        if f.length > 3
            TwoDface = project2dface f.map (v) -> poly.vertices[v]
            diags = getDiagonals TwoDface
            tris  = diagsToTris f,diags
            for [j...tris.length]
                tri = tris[j]
                newpoly.faces.push [ f[tri[0]], f[tri[1]], f[tri[2]] ]
                if colors  
                    newpoly.face_classes.push poly.face_classes[i]
        else
            newpoly.faces.push [f[0], f[1], f[2]]
            if colors
                newpoly.face_classes.push poly.face_classes[i]
    newpoly
