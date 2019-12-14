// koffee 1.6.0

/*
000000000   0000000   00000000    0000000     
   000     000   000  000   000  000   000    
   000     000   000  00000000   000   000    
   000     000   000  000        000   000    
   000      0000000   000         0000000
 */
var Flag, Polyhedron, Vect, _, add, ambo, angle, bevel, calcCentroid, canonicalize, chamfer, clamp, clockwise, copyVecArray, cross, dual, expand, extrude, flatten, gyro, hollow, inset, intersect, kis, klog, mag, midName, midpoint, min, mult, neg, oneThird, perspectiva, planarize, quinto, rayPlane, rayRay, ref, ref1, rotate, sphericalize, sub, tangentify, trisub, truncate, tween, unit, whirl, zirkularize,
    indexOf = [].indexOf;

ref = require('kxk'), _ = ref._, clamp = ref.clamp, klog = ref.klog;

ref1 = require('./math'), add = ref1.add, angle = ref1.angle, calcCentroid = ref1.calcCentroid, clockwise = ref1.clockwise, copyVecArray = ref1.copyVecArray, cross = ref1.cross, intersect = ref1.intersect, mag = ref1.mag, midpoint = ref1.midpoint, mult = ref1.mult, neg = ref1.neg, oneThird = ref1.oneThird, planarize = ref1.planarize, rayPlane = ref1.rayPlane, rayRay = ref1.rayRay, rotate = ref1.rotate, sub = ref1.sub, tangentify = ref1.tangentify, tween = ref1.tween, unit = ref1.unit;

min = Math.min;

Vect = require('../vect');

Flag = require('./flag');

Polyhedron = require('./polyhedron');

midName = function(v1, v2) {
    return v1 < v2 && (v1 + "_" + v2) || (v2 + "_" + v1);
};

flatten = function(poly, iterations) {
    var debug, flatness, l, neighbors, normals, offsets, ref2, ref3, ref4, vertexdist, vi;
    if (iterations == null) {
        iterations = 100;
    }
    normals = poly.normals();
    neighbors = poly.neighbors();
    ref2 = poly.flatness(), flatness = ref2[0], vertexdist = ref2[1], offsets = ref2[2];
    while (iterations && flatness > 0.001) {
        iterations -= 1;
        for (vi = l = 0, ref3 = poly.vertex.length; 0 <= ref3 ? l < ref3 : l > ref3; vi = 0 <= ref3 ? ++l : --l) {
            if (neighbors[vi].length <= 2) {
                continue;
            }
            if (neighbors[vi].length >= 6) {
                continue;
            }
            poly.vertex[vi] = add(poly.vertex[vi], mult(0.3, offsets[vi]));
        }
        debug = false;
        ref4 = poly.flatness(), flatness = ref4[0], vertexdist = ref4[1], offsets = ref4[2];
    }
    return poly;
};

hollow = function(poly, insetf, thickness) {
    var centers, det, edge, f, f1, f2, face, fi, fl, flag, fname, fr, i, i1, i2, il, ind, ins, ir, j1, l, len, len1, len2, len3, len4, len5, lr, m, name, name1, neighbors, ni, nl, normals, nr, ns, p, q, r, ref2, ref3, ref4, s, set, t, u, v, v1, v2, v3, v4, vertexMap, vi, wing, wings, z;
    if (insetf == null) {
        insetf = 0.5;
    }
    if (thickness == null) {
        thickness = 0.5;
    }
    insetf = clamp(0.1, 0.9, insetf);
    normals = poly.normals();
    centers = poly.centers();
    wings = poly.wings();
    neighbors = poly.neighbors();
    if (thickness != null) {
        thickness;
    } else {
        thickness = 2e308;
    }
    set = {};
    ins = function(e, f) {
        if (set[e] != null) {
            set[e];
        } else {
            set[e] = {};
        }
        if (!set[e][f]) {
            set[e][f] = tween(poly.vertex[e], centers[f], insetf);
        }
        return set[e][f];
    };
    det = {};
    ind = function(e, f) {
        if (det[e] != null) {
            det[e];
        } else {
            det[e] = {};
        }
        if (!det[e][f]) {
            det[e][f] = add(ins(e, f), mult(-thickness, normals[f]));
        }
        return det[e][f];
    };
    for (l = 0, len = wings.length; l < len; l++) {
        wing = wings[l];
        fr = wing[2].fr;
        fl = wing[2].fl;
        ir = ins(wing[1], fr);
        il = ins(wing[1], fl);
        nr = neg(normals[fr]);
        nl = neg(normals[fl]);
        lr = rayRay([ir, add(ir, nr)], [il, add(il, nl)]);
        thickness = min(thickness, mag(sub(ir, lr)));
        thickness = min(thickness, mag(sub(il, lr)));
    }
    flag = new Flag();
    for (i = m = 0, ref2 = poly.vertex.length; 0 <= ref2 ? m < ref2 : m > ref2; i = 0 <= ref2 ? ++m : --m) {
        p = poly.vertex[i];
        flag.vert("v" + i, p);
    }
    for (fi = q = 0, ref3 = poly.face.length; 0 <= ref3 ? q < ref3 : q > ref3; fi = 0 <= ref3 ? ++q : --q) {
        face = poly.face[fi];
        for (r = 0, len1 = face.length; r < len1; r++) {
            vi = face[r];
            flag.vert("fin" + fi + "v" + vi, ins(vi, fi));
            flag.vert("findown" + fi + "v" + vi, ind(vi, fi));
        }
    }
    for (fi = s = 0, ref4 = poly.face.length; 0 <= ref4 ? s < ref4 : s > ref4; fi = 0 <= ref4 ? ++s : --s) {
        f = poly.face[fi];
        v1 = "v" + f[f.length - 1];
        for (t = 0, len2 = f.length; t < len2; t++) {
            v = f[t];
            v2 = "v" + v;
            i1 = "fin" + fi + v1;
            i2 = "fin" + fi + v2;
            f1 = "findown" + fi + v1;
            f2 = "findown" + fi + v2;
            fname = "tops" + fi + v1;
            flag.edge(fname, v1, v2);
            flag.edge(fname, v2, i2);
            flag.edge(fname, i2, i1);
            flag.edge(fname, i1, v1);
            fname = "sides" + fi + v1;
            flag.edge(fname, i1, i2);
            flag.edge(fname, i2, f2);
            flag.edge(fname, f2, f1);
            flag.edge(fname, f1, i1);
            v1 = v2;
        }
    }
    vertexMap = {};
    for (u = 0, len3 = wings.length; u < len3; u++) {
        wing = wings[u];
        fr = wing[2].fr;
        fl = wing[2].fl;
        v1 = "findown" + fr + "v" + wing[0];
        v2 = "findown" + fr + "v" + wing[1];
        v3 = "findown" + fl + "v" + wing[1];
        v4 = "findown" + fl + "v" + wing[0];
        if (0.001 < mag(sub(ind(wing[1], fr), ind(wing[1], fl)))) {
            fname = "stitch_" + fl + "_" + fr;
            flag.edge(fname, v1, v2);
            flag.edge(fname, v2, v3);
            flag.edge(fname, v3, v4);
            flag.edge(fname, v4, v1);
        }
        if (vertexMap[name = wing[0]] != null) {
            vertexMap[name];
        } else {
            vertexMap[name] = {};
        }
        vertexMap[wing[0]][wing[1]] = [v1, v4];
        if (vertexMap[name1 = wing[1]] != null) {
            vertexMap[name1];
        } else {
            vertexMap[name1] = {};
        }
        vertexMap[wing[1]][wing[0]] = [v3, v2];
    }
    for (vi = z = 0, len4 = neighbors.length; z < len4; vi = ++z) {
        ns = neighbors[vi];
        for (j1 = 0, len5 = ns.length; j1 < len5; j1++) {
            ni = ns[j1];
            edge = vertexMap[vi][ni];
            flag.edge("snitch_" + vi, edge[0], edge[1]);
        }
    }
    return flag.topoly("h" + poly.name);
};

expand = function(poly, amount) {
    var a, b, centers, d, f, face, faces, fi, imap, l, len, len1, m, n, neighbors, newV, nextV, o, oldedges, q, ref2, v, verts, vi, vmap, wing, wings;
    if (amount == null) {
        amount = 0.5;
    }
    amount = clamp(0, 10, amount);
    oldedges = poly.edges();
    centers = poly.centers();
    neighbors = poly.neighbors();
    wings = poly.wings();
    verts = [];
    faces = [];
    vmap = {};
    imap = {};
    newV = 0;
    for (fi = l = 0, ref2 = poly.face.length; 0 <= ref2 ? l < ref2 : l > ref2; fi = 0 <= ref2 ? ++l : --l) {
        d = sub(mult(1 + amount, centers[fi]), centers[fi]);
        f = poly.face[fi];
        face = [];
        for (vi = m = 0, len = f.length; m < len; vi = ++m) {
            v = f[vi];
            if (vmap[v] != null) {
                vmap[v];
            } else {
                vmap[v] = [];
            }
            vmap[v].push(newV);
            imap[newV] = v;
            verts.push(add(poly.vertex[v], d));
            nextV = newV + (vi === f.length - 1 && -f.length + 1 || 1);
            face.push(newV);
            newV++;
        }
        faces.push(face);
    }
    for (q = 0, len1 = wings.length; q < len1; q++) {
        wing = wings[q];
        a = wing[0], b = wing[1];
        face = vmap[a].concat(vmap[b]);
        face = face.filter(function(v) {
            return (indexOf.call(faces[wing[2].fr], v) >= 0) || (indexOf.call(faces[wing[2].fl], v) >= 0);
        });
        faces.push(clockwise(verts, face));
    }
    for (o in vmap) {
        n = vmap[o];
        faces.push(clockwise(verts, n));
    }
    return new Polyhedron("e" + poly.name, faces, verts);
};

sphericalize = function(poly) {
    var l, len, ref2, vertex, verts, vi;
    verts = [];
    ref2 = poly.vertex;
    for (vi = l = 0, len = ref2.length; l < len; vi = ++l) {
        vertex = ref2[vi];
        verts.push(unit(poly.vertex[vi]));
    }
    return new Polyhedron("z" + poly.name, poly.face, verts);
};

zirkularize = function(poly, grow, n) {
    var angl, axis, centers, f, fi, l, len, len1, m, q, ref2, ref3, results, v, vertices, verts;
    if (grow == null) {
        grow = 1;
    }
    if (n == null) {
        n = 6;
    }
    vertices = [];
    centers = poly.centers();
    ref2 = poly.face;
    for (fi = l = 0, len = ref2.length; l < len; fi = ++l) {
        f = ref2[fi];
        if (f.length === n || n === 0) {
            for (m = 0, len1 = f.length; m < len1; m++) {
                v = f[m];
                axis = cross(centers[fi], poly.vertex[v]);
                angl = angle(centers[fi], poly.vertex[v]);
                vertices[v] = rotate(centers[fi], axis, angl * grow);
            }
        }
    }
    verts = (function() {
        results = [];
        for (var q = 0, ref3 = poly.vertex.length; 0 <= ref3 ? q < ref3 : q > ref3; 0 <= ref3 ? q++ : q--){ results.push(q); }
        return results;
    }).apply(this).map(function(i) {
        var ref3;
        return (ref3 = vertices[i]) != null ? ref3 : poly.vertex[i];
    });
    return new Polyhedron("z" + poly.name, poly.face, verts);
};

dual = function(poly) {
    var centers, dpoly, f, face, flag, i, k, l, len, len1, len2, m, q, r, ref2, ref3, ref4, ref5, ref6, s, sortF, t, u, v1, v2;
    flag = new Flag();
    face = [];
    for (i = l = 0, ref2 = poly.vertex.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        face[i] = {};
    }
    for (i = m = 0, ref3 = poly.face.length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        f = poly.face[i];
        v1 = f.slice(-1)[0];
        for (q = 0, len = f.length; q < len; q++) {
            v2 = f[q];
            face[v1]["v" + v2] = "" + i;
            v1 = v2;
        }
    }
    centers = poly.centers();
    for (i = r = 0, ref4 = poly.face.length; 0 <= ref4 ? r < ref4 : r > ref4; i = 0 <= ref4 ? ++r : --r) {
        flag.vert("" + i, centers[i]);
    }
    for (i = s = 0, ref5 = poly.face.length; 0 <= ref5 ? s < ref5 : s > ref5; i = 0 <= ref5 ? ++s : --s) {
        f = poly.face[i];
        v1 = f.slice(-1)[0];
        for (t = 0, len1 = f.length; t < len1; t++) {
            v2 = f[t];
            flag.edge(v1, face[v2]["v" + v1], "" + i);
            v1 = v2;
        }
    }
    dpoly = flag.topoly();
    sortF = [];
    ref6 = dpoly.face;
    for (u = 0, len2 = ref6.length; u < len2; u++) {
        f = ref6[u];
        k = intersect(poly.face[f[0]], poly.face[f[1]], poly.face[f[2]]);
        sortF[k] = f;
    }
    dpoly.face = sortF;
    if (poly.name[0] !== "d") {
        dpoly.name = "d" + poly.name;
    } else {
        dpoly.name = poly.name.slice(1);
    }
    return dpoly;
};

kis = function(poly, apexdist, n) {
    var apex, centers, f, flag, fname, foundAny, i, l, len, m, normals, q, ref2, ref3, v, v1, v2;
    if (apexdist == null) {
        apexdist = 0.5;
    }
    if (n == null) {
        n = 0;
    }
    apexdist = clamp(-1, 10, apexdist);
    if (apexdist < 0) {
        apexdist = apexdist * poly.minFaceDist();
    }
    flag = new Flag();
    for (i = l = 0, ref2 = poly.vertex.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        flag.vert("v" + i, poly.vertex[i]);
    }
    normals = poly.normals();
    centers = poly.centers();
    foundAny = false;
    for (i = m = 0, ref3 = poly.face.length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        f = poly.face[i];
        v1 = "v" + f[f.length - 1];
        for (q = 0, len = f.length; q < len; q++) {
            v = f[q];
            v2 = "v" + v;
            if (f.length === n || n === 0) {
                foundAny = true;
                apex = "apex" + i;
                fname = "" + i + v1;
                flag.vert(apex, add(centers[i], mult(apexdist, normals[i])));
                flag.edge(fname, v1, v2);
                flag.edge(fname, v2, apex);
                flag.edge(fname, apex, v1);
            } else {
                flag.edge("" + i, v1, v2);
            }
            v1 = v2;
        }
    }
    if (!foundAny) {
        klog("No " + n + "-fold components were found.");
    }
    return flag.topoly("k" + n + poly.name);
};

truncate = function(poly, factor) {
    var depth, edgeMap, face, fi, i, ii, l, len, m, neighbors, newFace, ni, nl, numFaces, numVertices, q, r, ref2, ref3, ref4, ref5, ref6, ref7, s, t, vertexIndex, vi, vp;
    if (factor == null) {
        factor = 0.5;
    }
    factor = clamp(0, 1, factor);
    edgeMap = {};
    numFaces = poly.face.length;
    numVertices = poly.vertex.length;
    neighbors = poly.neighbors();
    depth = 0.5 * factor * poly.minEdgeLength();
    for (vertexIndex = l = 0, ref2 = numVertices; 0 <= ref2 ? l < ref2 : l > ref2; vertexIndex = 0 <= ref2 ? ++l : --l) {
        if (edgeMap[vertexIndex] != null) {
            edgeMap[vertexIndex];
        } else {
            edgeMap[vertexIndex] = {};
        }
        face = [];
        nl = neighbors[vertexIndex].length;
        for (ii = m = 0, ref3 = nl; 0 <= ref3 ? m < ref3 : m > ref3; ii = 0 <= ref3 ? ++m : --m) {
            ni = neighbors[vertexIndex][ii];
            edgeMap[vertexIndex][ni] = poly.vertex.length;
            vp = poly.edge(vertexIndex, ni);
            vp.normalize();
            vp.scaleInPlace(depth);
            vp.addInPlace(poly.vert(vertexIndex));
            face.push(poly.vertex.length);
            poly.vertex.push([vp.x, vp.y, vp.z]);
        }
        poly.face.push(face);
    }
    for (fi = q = 0, ref4 = numFaces; 0 <= ref4 ? q < ref4 : q > ref4; fi = 0 <= ref4 ? ++q : --q) {
        face = poly.face[fi];
        newFace = [];
        for (vi = r = 0, ref5 = face.length; 0 <= ref5 ? r < ref5 : r > ref5; vi = 0 <= ref5 ? ++r : --r) {
            ni = (vi + 1) % face.length;
            newFace.push(edgeMap[face[vi]][face[ni]]);
            if (factor < 1) {
                newFace.push(edgeMap[face[ni]][face[vi]]);
            }
        }
        poly.face[fi] = newFace;
    }
    poly.vertex.splice(0, numVertices);
    ref6 = poly.face;
    for (s = 0, len = ref6.length; s < len; s++) {
        face = ref6[s];
        for (i = t = 0, ref7 = face.length; 0 <= ref7 ? t < ref7 : t > ref7; i = 0 <= ref7 ? ++t : --t) {
            face[i] -= numVertices;
        }
    }
    return poly;
};

ambo = function(poly) {
    var f, flag, i, l, len, m, ref2, ref3, ref4, v1, v2, v3;
    flag = new Flag();
    for (i = l = 0, ref2 = poly.face.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        f = poly.face[i];
        ref3 = f.slice(-2), v1 = ref3[0], v2 = ref3[1];
        for (m = 0, len = f.length; m < len; m++) {
            v3 = f[m];
            if (v1 < v2) {
                flag.vert(midName(v1, v2), midpoint(poly.vertex[v1], poly.vertex[v2]));
            }
            flag.edge("orig" + i, midName(v1, v2), midName(v2, v3));
            flag.edge("dual" + v2, midName(v2, v3), midName(v1, v2));
            ref4 = [v2, v3], v1 = ref4[0], v2 = ref4[1];
        }
    }
    return flag.topoly("a" + poly.name);
};

bevel = function(poly, factor) {
    var p;
    if (factor == null) {
        factor = 0.5;
    }
    p = truncate(ambo(poly), factor);
    p.name = "b" + poly.name;
    return p;
};

chamfer = function(poly, factor) {
    var centers, cmid, cr, e0, e1, ed, edge, el, flag, head, l, len, len1, len2, lr, m, minEdgeLength, moved, n_h, n_t, nf, nl, nmid, nnl, nnr, normals, npl, npr, nr, pl, pmid, pnm, pr, q, rr, tail, wings;
    if (factor == null) {
        factor = 0.5;
    }
    factor = clamp(0.001, 0.995, factor);
    flag = new Flag();
    normals = poly.normals();
    centers = poly.centers();
    wings = poly.wings();
    minEdgeLength = 2e308;
    for (l = 0, len = wings.length; l < len; l++) {
        edge = wings[l];
        e0 = poly.vertex[edge[0]];
        e1 = poly.vertex[edge[1]];
        ed = unit(sub(e1, e0));
        nr = unit(sub(poly.vertex[edge[2].nr], e1));
        pr = unit(sub(poly.vertex[edge[2].pr], e0));
        cr = rayRay([e1, mult(0.5, add(add(e1, nr), sub(e1, ed)))], [e0, mult(0.5, add(add(e0, pr), add(e0, ed)))]);
        el = mag(sub(e1, rayRay([e1, add(e1, nr)], [cr, add(cr, ed)])));
        minEdgeLength = min(minEdgeLength, el);
        el = mag(sub(e0, rayRay([e0, add(e0, pr)], [cr, sub(cr, ed)])));
        minEdgeLength = min(minEdgeLength, el);
    }
    minEdgeLength *= factor;
    moved = {};
    for (m = 0, len1 = wings.length; m < len1; m++) {
        edge = wings[m];
        e0 = poly.vertex[edge[0]];
        e1 = poly.vertex[edge[1]];
        rr = [add(e0, mult(minEdgeLength, unit(sub(poly.vertex[edge[2].pr], e0)))), add(e1, mult(minEdgeLength, unit(sub(poly.vertex[edge[2].nr], e1))))];
        lr = [add(e0, mult(minEdgeLength, unit(sub(poly.vertex[edge[2].pl], e0)))), add(e1, mult(minEdgeLength, unit(sub(poly.vertex[edge[2].nl], e1))))];
        moved[edge[1] + "▸" + edge[0] + "l"] = rr;
        moved[edge[0] + "▸" + edge[1] + "r"] = rr;
        moved[edge[1] + "▸" + edge[0] + "r"] = lr;
        moved[edge[0] + "▸" + edge[1] + "l"] = lr;
    }
    for (q = 0, len2 = wings.length; q < len2; q++) {
        edge = wings[q];
        e0 = poly.vertex[edge[0]];
        e1 = poly.vertex[edge[1]];
        nf = edge[0] + "▸" + edge[1];
        n_h = "" + edge[1];
        n_t = "" + edge[0];
        nnr = n_h + "▸" + edge[2].fr;
        nnl = n_h + "▸" + edge[2].fl;
        npr = n_t + "▸" + edge[2].fr;
        npl = n_t + "▸" + edge[2].fl;
        nr = rayRay(moved[edge[0] + "▸" + edge[1] + "r"], moved[edge[1] + "▸" + edge[2].nr + "r"]);
        nl = rayRay(moved[edge[0] + "▸" + edge[1] + "l"], moved[edge[1] + "▸" + edge[2].nl + "l"]);
        pr = rayRay(moved[edge[0] + "▸" + edge[1] + "r"], moved[edge[2].pr + "▸" + edge[0] + "r"]);
        pl = rayRay(moved[edge[0] + "▸" + edge[1] + "l"], moved[edge[2].pl + "▸" + edge[0] + "l"]);
        pmid = midpoint(pl, pr);
        nmid = midpoint(nl, nr);
        cmid = midpoint(pmid, nmid);
        pnm = cross(sub(pmid, nmid), sub(pl, pr));
        head = rayPlane([0, 0, 0], e1, cmid, pnm);
        tail = rayPlane([0, 0, 0], e0, cmid, pnm);
        flag.vert(n_h, head);
        flag.vert(n_t, tail);
        flag.vert(nnr, nr);
        flag.vert(nnl, nl);
        flag.vert(npl, pl);
        flag.vert(npr, pr);
        flag.edge(nf, n_h, nnr);
        flag.edge(nf, nnr, npr);
        flag.edge(nf, npr, n_t);
        flag.edge(nf, n_t, npl);
        flag.edge(nf, npl, nnl);
        flag.edge(nf, nnl, n_h);
        flag.edge("" + edge[2].fr, npr, nnr);
        flag.edge("" + edge[2].fl, nnl, npl);
    }
    return flag.topoly("c" + poly.name);
};

whirl = function(poly, n) {
    var centers, cv1name, cv2name, f, flag, fname, i, j, l, m, q, ref2, ref3, ref4, ref5, ref6, v, v1, v1_2, v2, v3;
    if (n == null) {
        n = 0;
    }
    flag = new Flag();
    for (i = l = 0, ref2 = poly.vertex.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        flag.vert("v" + i, unit(poly.vertex[i]));
    }
    centers = poly.centers();
    for (i = m = 0, ref3 = poly.face.length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        f = poly.face[i];
        ref4 = f.slice(-2), v1 = ref4[0], v2 = ref4[1];
        for (j = q = 0, ref5 = f.length; 0 <= ref5 ? q < ref5 : q > ref5; j = 0 <= ref5 ? ++q : --q) {
            v = f[j];
            v3 = v;
            v1_2 = oneThird(poly.vertex[v1], poly.vertex[v2]);
            flag.vert(v1 + "~" + v2, v1_2);
            cv1name = "center" + i + "~" + v1;
            cv2name = "center" + i + "~" + v2;
            flag.vert(cv1name, unit(oneThird(centers[i], v1_2)));
            fname = i + "f" + v1;
            flag.edge(fname, cv1name, v1 + "~" + v2);
            flag.edge(fname, v1 + "~" + v2, v2 + "~" + v1);
            flag.edge(fname, v2 + "~" + v1, "v" + v2);
            flag.edge(fname, "v" + v2, v2 + "~" + v3);
            flag.edge(fname, v2 + "~" + v3, cv2name);
            flag.edge(fname, cv2name, cv1name);
            flag.edge("c" + i, cv1name, cv2name);
            ref6 = [v2, v3], v1 = ref6[0], v2 = ref6[1];
        }
    }
    return flag.topoly("w" + poly.name);
};

gyro = function(poly, factor) {
    var centers, f, flag, fname, i, j, l, m, q, r, ref2, ref3, ref4, ref5, ref6, ref7, v, v1, v2, v3;
    if (factor == null) {
        factor = 0.5;
    }
    factor = clamp(0.2, 0.8, factor);
    flag = new Flag();
    for (i = l = 0, ref2 = poly.vertex.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        flag.vert("v" + i, poly.vertex[i]);
    }
    centers = poly.centers();
    for (i = m = 0, ref3 = poly.face.length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        flag.vert("center" + i, centers[i]);
    }
    for (i = q = 0, ref4 = poly.face.length; 0 <= ref4 ? q < ref4 : q > ref4; i = 0 <= ref4 ? ++q : --q) {
        f = poly.face[i];
        ref5 = f.slice(-2), v1 = ref5[0], v2 = ref5[1];
        for (j = r = 0, ref6 = f.length; 0 <= ref6 ? r < ref6 : r > ref6; j = 0 <= ref6 ? ++r : --r) {
            v = f[j];
            v3 = v;
            flag.vert(v1 + "~" + v2, tween(poly.vertex[v1], poly.vertex[v2], factor));
            fname = i + "f" + v1;
            flag.edge(fname, "center" + i, v1 + "~" + v2);
            flag.edge(fname, v1 + "~" + v2, v2 + "~" + v1);
            flag.edge(fname, v2 + "~" + v1, "v" + v2);
            flag.edge(fname, "v" + v2, v2 + "~" + v3);
            flag.edge(fname, v2 + "~" + v3, "center" + i);
            ref7 = [v2, v3], v1 = ref7[0], v2 = ref7[1];
        }
    }
    return flag.topoly("g" + poly.name);
};

quinto = function(poly) {
    var centroid, f, flag, i, innerpt, l, len, m, midpt, ref2, ref3, ref4, v1, v2, v3;
    flag = new Flag();
    for (i = l = 0, ref2 = poly.face.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        f = poly.face[i];
        centroid = calcCentroid(f.map(function(idx) {
            return poly.vertex[idx];
        }));
        ref3 = f.slice(-2), v1 = ref3[0], v2 = ref3[1];
        for (m = 0, len = f.length; m < len; m++) {
            v3 = f[m];
            midpt = midpoint(poly.vertex[v1], poly.vertex[v2]);
            innerpt = midpoint(midpt, centroid);
            flag.vert(midName(v1, v2), midpt);
            flag.vert(("inner_" + i + "_") + midName(v1, v2), innerpt);
            flag.vert("" + v2, poly.vertex[v2]);
            flag.edge("f" + i + "_" + v2, ("inner_" + i + "_") + midName(v1, v2), midName(v1, v2));
            flag.edge("f" + i + "_" + v2, midName(v1, v2), "" + v2);
            flag.edge("f" + i + "_" + v2, "" + v2, midName(v2, v3));
            flag.edge("f" + i + "_" + v2, midName(v2, v3), ("inner_" + i + "_") + midName(v2, v3));
            flag.edge("f" + i + "_" + v2, ("inner_" + i + "_") + midName(v2, v3), ("inner_" + i + "_") + midName(v1, v2));
            flag.edge("f_in_" + i, ("inner_" + i + "_") + midName(v1, v2), ("inner_" + i + "_") + midName(v2, v3));
            ref4 = [v2, v3], v1 = ref4[0], v2 = ref4[1];
        }
    }
    return flag.topoly("q" + poly.name);
};

inset = function(poly, inset, popout, n) {
    var centers, f, flag, fname, foundAny, i, l, len, len1, m, normals, p, q, r, ref2, ref3, ref4, s, v, v1, v2;
    if (inset == null) {
        inset = 0.5;
    }
    if (popout == null) {
        popout = -0.2;
    }
    if (n == null) {
        n = 0;
    }
    inset = clamp(0.25, 0.99, inset);
    popout = min(popout, inset);
    flag = new Flag();
    for (i = l = 0, ref2 = poly.vertex.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        p = poly.vertex[i];
        flag.vert("v" + i, p);
    }
    normals = poly.normals();
    centers = poly.centers();
    for (i = m = 0, ref3 = poly.face.length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        f = poly.face[i];
        if (f.length === n || n === 0) {
            for (q = 0, len = f.length; q < len; q++) {
                v = f[q];
                flag.vert("f" + i + "v" + v, add(tween(poly.vertex[v], centers[i], inset), mult(popout, normals[i])));
            }
        }
    }
    foundAny = false;
    for (i = r = 0, ref4 = poly.face.length; 0 <= ref4 ? r < ref4 : r > ref4; i = 0 <= ref4 ? ++r : --r) {
        f = poly.face[i];
        v1 = "v" + f[f.length - 1];
        for (s = 0, len1 = f.length; s < len1; s++) {
            v = f[s];
            v2 = "v" + v;
            if (f.length === n || n === 0) {
                foundAny = true;
                fname = i + v1;
                flag.edge(fname, v1, v2);
                flag.edge(fname, v2, "f" + i + v2);
                flag.edge(fname, "f" + i + v2, "f" + i + v1);
                flag.edge(fname, "f" + i + v1, v1);
                flag.edge("ex" + i, "f" + i + v1, "f" + i + v2);
            } else {
                flag.edge(i, v1, v2);
            }
            v1 = v2;
        }
    }
    if (!foundAny) {
        klog("No " + n + "-fold components were found.");
    }
    return flag.topoly("n" + n + poly.name);
};

extrude = function(poly, popout, insetf, n) {
    var newpoly;
    if (popout == null) {
        popout = 1;
    }
    if (insetf == null) {
        insetf = 0.5;
    }
    if (n == null) {
        n = 0;
    }
    newpoly = inset(poly, insetf, popout, n);
    newpoly.name = "x" + n + poly.name;
    return newpoly;
};

perspectiva = function(poly) {
    var centers, f, flag, i, l, len, m, q, ref2, ref3, ref4, ref5, v, v1, v12, v2, v21, v23, v3, vert1, vert2, vert3;
    centers = poly.centers();
    flag = new Flag();
    for (i = l = 0, ref2 = poly.vertex.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        flag.vert("v" + i, poly.vertex[i]);
    }
    for (i = m = 0, ref3 = poly.face.length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        f = poly.face[i];
        v1 = "v" + f[f.length - 2];
        v2 = "v" + f[f.length - 1];
        vert1 = poly.vertex[f[f.length - 2]];
        vert2 = poly.vertex[f[f.length - 1]];
        for (q = 0, len = f.length; q < len; q++) {
            v = f[q];
            v3 = "v" + v;
            vert3 = poly.vertex[v];
            v12 = v1 + "~" + v2;
            v21 = v2 + "~" + v1;
            v23 = v2 + "~" + v3;
            flag.vert(v12, midpoint(midpoint(vert1, vert2), centers[i]));
            flag.edge("in" + i, v12, v23);
            flag.edge("f" + i + v2, v23, v12);
            flag.edge("f" + i + v2, v12, v2);
            flag.edge("f" + i + v2, v2, v23);
            flag.edge("f" + v12, v1, v21);
            flag.edge("f" + v12, v21, v12);
            flag.edge("f" + v12, v12, v1);
            ref4 = [v2, v3], v1 = ref4[0], v2 = ref4[1];
            ref5 = [vert2, vert3], vert1 = ref5[0], vert2 = ref5[1];
        }
    }
    return flag.topoly("P" + poly.name);
};

trisub = function(poly, n) {
    var EPSILON_CLOSE, f, faces, fn, i, i1, i2, i3, j, j1, k1, l, l1, len, m, newpos, pos, q, r, ref10, ref11, ref12, ref13, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, s, t, u, uniqVs, uniqmap, v, v1, v2, v21, v3, v31, verts, vmap, w, z;
    if (n == null) {
        n = 2;
    }
    for (fn = l = 0, ref2 = poly.face.length; 0 <= ref2 ? l < ref2 : l > ref2; fn = 0 <= ref2 ? ++l : --l) {
        if (poly.face[fn].length !== 3) {
            return poly;
        }
    }
    verts = [];
    vmap = {};
    pos = 0;
    for (fn = m = 0, ref3 = poly.face.length; 0 <= ref3 ? m < ref3 : m > ref3; fn = 0 <= ref3 ? ++m : --m) {
        f = poly.face[fn];
        ref4 = f.slice(-3), i1 = ref4[0], i2 = ref4[1], i3 = ref4[2];
        v1 = poly.vertex[i1];
        v2 = poly.vertex[i2];
        v3 = poly.vertex[i3];
        v21 = sub(v2, v1);
        v31 = sub(v3, v1);
        for (i = q = 0, ref5 = n; 0 <= ref5 ? q <= ref5 : q >= ref5; i = 0 <= ref5 ? ++q : --q) {
            for (j = r = 0, ref6 = n - i; 0 <= ref6 ? r <= ref6 : r >= ref6; j = 0 <= ref6 ? ++r : --r) {
                v = add(add(v1, mult(i / n, v21)), mult(j / n, v31));
                vmap["v" + fn + "-" + i + "-" + j] = pos++;
                verts.push(v);
            }
        }
    }
    EPSILON_CLOSE = 1.0e-8;
    uniqVs = [];
    newpos = 0;
    uniqmap = {};
    for (i = s = 0, len = verts.length; s < len; i = ++s) {
        v = verts[i];
        if (indexOf.call(uniqmap, i) >= 0) {
            continue;
        }
        uniqmap[i] = newpos;
        uniqVs.push(v);
        for (j = t = ref7 = i + 1, ref8 = verts.length; ref7 <= ref8 ? t < ref8 : t > ref8; j = ref7 <= ref8 ? ++t : --t) {
            w = verts[j];
            if (mag(sub(v, w)) < EPSILON_CLOSE) {
                uniqmap[j] = newpos;
            }
        }
        newpos++;
    }
    faces = [];
    for (fn = u = 0, ref9 = poly.face.length; 0 <= ref9 ? u < ref9 : u > ref9; fn = 0 <= ref9 ? ++u : --u) {
        for (i = z = 0, ref10 = n; 0 <= ref10 ? z < ref10 : z > ref10; i = 0 <= ref10 ? ++z : --z) {
            for (j = j1 = 0, ref11 = n - i; 0 <= ref11 ? j1 < ref11 : j1 > ref11; j = 0 <= ref11 ? ++j1 : --j1) {
                faces.push([uniqmap[vmap["v" + fn + "-" + i + "-" + j]], uniqmap[vmap["v" + fn + "-" + (i + 1) + "-" + j]], uniqmap[vmap["v" + fn + "-" + i + "-" + (j + 1)]]]);
            }
        }
        for (i = k1 = 1, ref12 = n; 1 <= ref12 ? k1 < ref12 : k1 > ref12; i = 1 <= ref12 ? ++k1 : --k1) {
            for (j = l1 = 0, ref13 = n - i; 0 <= ref13 ? l1 < ref13 : l1 > ref13; j = 0 <= ref13 ? ++l1 : --l1) {
                faces.push([uniqmap[vmap["v" + fn + "-" + i + "-" + j]], uniqmap[vmap["v" + fn + "-" + i + "-" + (j + 1)]], uniqmap[vmap["v" + fn + "-" + (i - 1) + "-" + (j + 1)]]]);
            }
        }
    }
    return new Polyhedron("u" + n + poly.name, faces, uniqVs);
};

canonicalize = function(poly, iter) {
    var edges, faces, i, l, maxChange, oldVs, ref2, verts;
    if (iter == null) {
        iter = 200;
    }
    faces = poly.face;
    edges = poly.edges();
    verts = poly.vertex;
    maxChange = 1.0;
    for (i = l = 0, ref2 = iter; 0 <= ref2 ? l <= ref2 : l >= ref2; i = 0 <= ref2 ? ++l : --l) {
        oldVs = copyVecArray(verts);
        verts = tangentify(verts, edges);
        verts = planarize(verts, faces);
        maxChange = _.max(_.map(_.zip(verts, oldVs), function(arg) {
            var x, y;
            x = arg[0], y = arg[1];
            return mag(sub(x, y));
        }));
        if (maxChange < 1e-8) {
            break;
        }
    }
    poly.verts = verts;
    return poly.rescale();
};

module.exports = {
    dual: dual,
    bevel: bevel,
    trisub: trisub,
    truncate: truncate,
    perspectiva: perspectiva,
    kis: kis,
    ambo: ambo,
    gyro: gyro,
    chamfer: chamfer,
    whirl: whirl,
    quinto: quinto,
    inset: inset,
    extrude: extrude,
    expand: expand,
    hollow: hollow,
    flatten: flatten,
    zirkularize: zirkularize,
    sphericalize: sphericalize,
    canonicalize: canonicalize
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9wby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsa1pBQUE7SUFBQTs7QUFVQSxNQUFxQixPQUFBLENBQVEsS0FBUixDQUFyQixFQUFFLFNBQUYsRUFBSyxpQkFBTCxFQUFZOztBQUNaLE9BQWlMLE9BQUEsQ0FBUSxRQUFSLENBQWpMLEVBQUUsY0FBRixFQUFPLGtCQUFQLEVBQWMsZ0NBQWQsRUFBNEIsMEJBQTVCLEVBQXVDLGdDQUF2QyxFQUFxRCxrQkFBckQsRUFBNEQsMEJBQTVELEVBQXVFLGNBQXZFLEVBQTRFLHdCQUE1RSxFQUFzRixnQkFBdEYsRUFBNEYsY0FBNUYsRUFBaUcsd0JBQWpHLEVBQTJHLDBCQUEzRyxFQUFzSCx3QkFBdEgsRUFBZ0ksb0JBQWhJLEVBQXdJLG9CQUF4SSxFQUFnSixjQUFoSixFQUFxSiw0QkFBckosRUFBaUssa0JBQWpLLEVBQXdLOztBQUN0SyxNQUFROztBQUVWLElBQUEsR0FBTyxPQUFBLENBQVEsU0FBUjs7QUFDUCxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0FBQ1AsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztBQUViLE9BQUEsR0FBVSxTQUFDLEVBQUQsRUFBSyxFQUFMO1dBQVksRUFBQSxHQUFHLEVBQUgsSUFBVSxDQUFHLEVBQUQsR0FBSSxHQUFKLEdBQU8sRUFBVCxDQUFWLElBQTJCLENBQUcsRUFBRCxHQUFJLEdBQUosR0FBTyxFQUFUO0FBQXZDOztBQVFWLE9BQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxVQUFQO0FBRU4sUUFBQTs7UUFGYSxhQUFXOztJQUV4QixPQUFBLEdBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBQTtJQUNWLFNBQUEsR0FBWSxJQUFJLENBQUMsU0FBTCxDQUFBO0lBQ1osT0FBZ0MsSUFBSSxDQUFDLFFBQUwsQ0FBQSxDQUFoQyxFQUFDLGtCQUFELEVBQVUsb0JBQVYsRUFBcUI7QUFLckIsV0FB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QixZQWxCaEIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgICBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgICBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgICBcbiAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAwMDAwMDAwICAgICBcbiMjI1xuXG4jIFBvbHlow6lkcm9uaXNtZSwgQ29weXJpZ2h0IDIwMTksIEFuc2VsbSBMZXZza2F5YSwgTUlUIExpY2Vuc2VcblxueyBfLCBjbGFtcCwga2xvZyB9ID0gcmVxdWlyZSAna3hrJ1xueyBhZGQsIGFuZ2xlLCBjYWxjQ2VudHJvaWQsIGNsb2Nrd2lzZSwgY29weVZlY0FycmF5LCBjcm9zcywgaW50ZXJzZWN0LCBtYWcsIG1pZHBvaW50LCBtdWx0LCBuZWcsIG9uZVRoaXJkLCBwbGFuYXJpemUsIHJheVBsYW5lLCByYXlSYXksIHJvdGF0ZSwgc3ViLCB0YW5nZW50aWZ5LCB0d2VlbiwgdW5pdCB9ID0gcmVxdWlyZSAnLi9tYXRoJ1xueyBtaW4gfSA9IE1hdGhcblxuVmVjdCA9IHJlcXVpcmUgJy4uL3ZlY3QnXG5GbGFnID0gcmVxdWlyZSAnLi9mbGFnJ1xuUG9seWhlZHJvbiA9IHJlcXVpcmUgJy4vcG9seWhlZHJvbidcblxubWlkTmFtZSA9ICh2MSwgdjIpIC0+IHYxPHYyIGFuZCBcIiN7djF9XyN7djJ9XCIgb3IgXCIje3YyfV8je3YxfVwiXG5cbiMgMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMDAgIDAwMCAgXG4jIDAwMDAwMCAgICAwMDAgICAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwIDAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgIDAwMDAgIFxuIyAwMDAgICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbmZsYXR0ZW4gPSAocG9seSwgaXRlcmF0aW9ucz0xMDApIC0+XG4gICAgXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgbmVpZ2hib3JzID0gcG9seS5uZWlnaGJvcnMoKVxuICAgIFtmbGF0bmVzcyx2ZXJ0ZXhkaXN0LG9mZnNldHNdID0gcG9seS5mbGF0bmVzcygpXG5cbiAgICAjIGlmIGZsYXRuZXNzID4gMC4wMDFcbiAgICAgICAgIyBwb2x5LmRlYnVnID0gW11cbiAgICAjIGRlYnVnID0gdHJ1ZVxuICAgIHdoaWxlIGl0ZXJhdGlvbnMgYW5kIGZsYXRuZXNzID4gMC4wMDFcbiAgICAgICAgIyBrbG9nIFwiI3twb2x5Lm5hbWV9ICN7aXRlcmF0aW9uc30gI3tmbGF0bmVzc31cIlxuICAgICAgICBpdGVyYXRpb25zIC09IDFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBmb3IgdmkgaW4gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdXG4gICAgICAgICAgICBjb250aW51ZSBpZiBuZWlnaGJvcnNbdmldLmxlbmd0aCA8PSAyXG4gICAgICAgICAgICBjb250aW51ZSBpZiBuZWlnaGJvcnNbdmldLmxlbmd0aCA+PSA2XG5cbiAgICAgICAgICAgICMgaWYgZGVidWdcbiAgICAgICAgICAgICAgICAjIHBvbHkuZGVidWdMaW5lIHBvbHkudmVydGV4W3ZpXSwgYWRkIHBvbHkudmVydGV4W3ZpXSwgb2Zmc2V0c1t2aV1cbiAgICAgICAgICAgIHBvbHkudmVydGV4W3ZpXSA9IGFkZCBwb2x5LnZlcnRleFt2aV0sIG11bHQgMC4zLCBvZmZzZXRzW3ZpXVxuICAgICAgICBcbiAgICAgICAgZGVidWcgPSBmYWxzZVxuICAgICAgICBbZmxhdG5lc3MsdmVydGV4ZGlzdCxvZmZzZXRzXSA9IHBvbHkuZmxhdG5lc3MoKSAgICAgICAgICAgIFxuICAgICAgICBcbiAgICBwb2x5XG5cbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICBcblxuaG9sbG93ID0gKHBvbHksIGluc2V0Zj0wLjUsIHRoaWNrbmVzcz0wLjUpIC0+XG5cbiAgICBpbnNldGYgICAgPSBjbGFtcCAwLjEgMC45IGluc2V0ZlxuICAgIG5vcm1hbHMgICA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyAgID0gcG9seS5jZW50ZXJzKClcbiAgICB3aW5ncyAgICAgPSBwb2x5LndpbmdzKClcbiAgICBuZWlnaGJvcnMgPSBwb2x5Lm5laWdoYm9ycygpXG4gICAgXG4gICAgdGhpY2tuZXNzID89IEluZmluaXR5XG4gICAgXG4gICAgc2V0ID0ge31cbiAgICBpbnMgPSAoZSxmKSAtPlxuICAgICAgICBzZXRbZV0gPz0ge31cbiAgICAgICAgaWYgbm90IHNldFtlXVtmXVxuICAgICAgICAgICAgc2V0W2VdW2ZdID0gdHdlZW4gcG9seS52ZXJ0ZXhbZV0sIGNlbnRlcnNbZl0sIGluc2V0ZlxuICAgICAgICBzZXRbZV1bZl1cbiAgICAgICAgXG4gICAgZGV0ID0ge31cbiAgICBpbmQgPSAoZSxmKSAtPlxuICAgICAgICBkZXRbZV0gPz0ge31cbiAgICAgICAgaWYgbm90IGRldFtlXVtmXVxuICAgICAgICAgICAgZGV0W2VdW2ZdID0gYWRkIGlucyhlLGYpLCBtdWx0IC10aGlja25lc3MsIG5vcm1hbHNbZl1cbiAgICAgICAgZGV0W2VdW2ZdXG4gICAgICAgIFxuICAgIGZvciB3aW5nIGluIHdpbmdzXG4gICAgICAgIGZyID0gd2luZ1syXS5mclxuICAgICAgICBmbCA9IHdpbmdbMl0uZmxcbiAgICAgICAgaXIgPSBpbnMgd2luZ1sxXSwgZnJcbiAgICAgICAgaWwgPSBpbnMgd2luZ1sxXSwgZmxcbiAgICAgICAgICBcbiAgICAgICAgbnIgPSBuZWcgbm9ybWFsc1tmcl1cbiAgICAgICAgbmwgPSBuZWcgbm9ybWFsc1tmbF1cbiAgICAgICAgICAgXG4gICAgICAgIGxyID0gcmF5UmF5IFtpciwgYWRkIGlyLCBucl0sIFtpbCwgYWRkIGlsLCBubF1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgdGhpY2tuZXNzID0gbWluIHRoaWNrbmVzcywgbWFnIHN1YiBpciwgbHJcbiAgICAgICAgdGhpY2tuZXNzID0gbWluIHRoaWNrbmVzcywgbWFnIHN1YiBpbCwgbHJcbiAgICAgICAgICAgICAgICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIFxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0ZXgubGVuZ3RoXVxuICAgICAgICBwID0gcG9seS52ZXJ0ZXhbaV1cbiAgICAgICAgZmxhZy52ZXJ0IFwidiN7aX1cIiBwXG5cbiAgICBmb3IgZmkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmYWNlID0gcG9seS5mYWNlW2ZpXVxuICAgICAgICBmb3IgdmkgaW4gZmFjZVxuICAgICAgICAgICAgZmxhZy52ZXJ0IFwiZmluI3tmaX12I3t2aX1cIiAgICAgaW5zIHZpLCBmaVxuICAgICAgICAgICAgZmxhZy52ZXJ0IFwiZmluZG93biN7Zml9diN7dml9XCIgaW5kIHZpLCBmaVxuICBcbiAgICBmb3IgZmkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ZpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHYyID0gXCJ2I3t2fVwiXG4gICAgICAgICAgICBpMSA9IFwiZmluI3tmaX0je3YxfVwiXG4gICAgICAgICAgICBpMiA9IFwiZmluI3tmaX0je3YyfVwiXG4gICAgICAgICAgICBmMSA9IFwiZmluZG93biN7Zml9I3t2MX1cIlxuICAgICAgICAgICAgZjIgPSBcImZpbmRvd24je2ZpfSN7djJ9XCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm5hbWUgPSBcInRvcHMje2ZpfSN7djF9XCJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjEsIHYyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYyLCBpMlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBpMiwgaTFcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgaTEsIHYxXG4gICAgICBcbiAgICAgICAgICAgIGZuYW1lID0gXCJzaWRlcyN7Zml9I3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBpMSwgaTJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgaTIsIGYyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIGYyLCBmMVxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBmMSwgaTFcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdjEgPSB2MlxuICAgICAgIFxuICAgIHZlcnRleE1hcCA9IHt9XG4gICAgZm9yIHdpbmcgaW4gd2luZ3NcbiAgICAgICAgZnIgPSB3aW5nWzJdLmZyXG4gICAgICAgIGZsID0gd2luZ1syXS5mbCAgICAgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHYxID0gXCJmaW5kb3duI3tmcn12I3t3aW5nWzBdfVwiXG4gICAgICAgIHYyID0gXCJmaW5kb3duI3tmcn12I3t3aW5nWzFdfVwiXG4gICAgICAgIHYzID0gXCJmaW5kb3duI3tmbH12I3t3aW5nWzFdfVwiXG4gICAgICAgIHY0ID0gXCJmaW5kb3duI3tmbH12I3t3aW5nWzBdfVwiXG4gICAgICAgIFxuICAgICAgICBpZiAwLjAwMSA8IG1hZyBzdWIgaW5kKHdpbmdbMV0sIGZyKSwgaW5kKHdpbmdbMV0sIGZsKVxuICAgICAgICBcbiAgICAgICAgICAgIGZuYW1lID0gXCJzdGl0Y2hfI3tmbH1fI3tmcn1cIlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MSwgdjJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjIsIHYzXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYzLCB2NFxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2NCwgdjFcbiAgICAgICAgICAgIFxuICAgICAgICB2ZXJ0ZXhNYXBbd2luZ1swXV0gPz0ge31cbiAgICAgICAgdmVydGV4TWFwW3dpbmdbMF1dW3dpbmdbMV1dID0gW3YxLCB2NF1cbiAgICAgICAgdmVydGV4TWFwW3dpbmdbMV1dID89IHt9XG4gICAgICAgIHZlcnRleE1hcFt3aW5nWzFdXVt3aW5nWzBdXSA9IFt2MywgdjJdXG5cbiAgICBmb3IgbnMsdmkgaW4gbmVpZ2hib3JzXG4gICAgICAgIGZvciBuaSBpbiBuc1xuICAgICAgICAgICAgZWRnZSA9IHZlcnRleE1hcFt2aV1bbmldXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJzbml0Y2hfI3t2aX1cIiwgZWRnZVswXSwgZWRnZVsxXVxuICBcbiAgICBmbGFnLnRvcG9seSBcImgje3BvbHkubmFtZX1cIlxuXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG5cbmV4cGFuZCA9IChwb2x5LCBhbW91bnQ9MC41KSAtPlxuXG4gICAgYW1vdW50ICAgID0gY2xhbXAgMCAxMCBhbW91bnRcbiAgICBvbGRlZGdlcyAgPSBwb2x5LmVkZ2VzKClcbiAgICBjZW50ZXJzICAgPSBwb2x5LmNlbnRlcnMoKVxuICAgIG5laWdoYm9ycyA9IHBvbHkubmVpZ2hib3JzKClcbiAgICB3aW5ncyAgICAgPSBwb2x5LndpbmdzKClcbiAgICAgICAgXG4gICAgdmVydHMgPSBbXVxuICAgIGZhY2VzID0gW11cbiAgICB2bWFwICA9IHt9XG4gICAgaW1hcCAgPSB7fVxuICAgIG5ld1YgID0gMFxuICAgIGZvciBmaSBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgIGQgPSBzdWIgbXVsdCgxK2Ftb3VudCwgY2VudGVyc1tmaV0pLCBjZW50ZXJzW2ZpXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ZpXVxuICAgICAgICBmYWNlID0gW11cbiAgICAgICAgZm9yIHYsdmkgaW4gZlxuICAgICAgICAgICAgdm1hcFt2XSA/PSBbXVxuICAgICAgICAgICAgdm1hcFt2XS5wdXNoIG5ld1ZcbiAgICAgICAgICAgIGltYXBbbmV3Vl0gPSB2XG4gICAgICAgICAgICB2ZXJ0cy5wdXNoIGFkZCBwb2x5LnZlcnRleFt2XSwgZFxuICAgICAgICAgICAgbmV4dFYgPSBuZXdWKyh2aT09Zi5sZW5ndGgtMSBhbmQgLWYubGVuZ3RoKzEgb3IgMSlcbiAgICAgICAgICAgIGZhY2UucHVzaCBuZXdWXG4gICAgICAgICAgICBuZXdWKytcbiAgICAgICAgZmFjZXMucHVzaCBmYWNlXG4gICAgICAgICAgICBcbiAgICBmb3Igd2luZyBpbiB3aW5nc1xuICAgICAgICBbYSxiXSA9IHdpbmdcbiAgICAgICAgZmFjZSA9IHZtYXBbYV0uY29uY2F0IHZtYXBbYl1cbiAgICAgICAgZmFjZSA9IGZhY2UuZmlsdGVyICh2KSAtPiAodiBpbiBmYWNlc1t3aW5nWzJdLmZyXSkgb3IgKHYgaW4gZmFjZXNbd2luZ1syXS5mbF0pXG4gICAgICAgIGZhY2VzLnB1c2ggY2xvY2t3aXNlIHZlcnRzLCBmYWNlXG5cbiAgICBmb3IgbyxuIG9mIHZtYXBcbiAgICAgICAgZmFjZXMucHVzaCBjbG9ja3dpc2UgdmVydHMsIG5cbiAgICAgICAgXG4gICAgbmV3IFBvbHloZWRyb24gXCJlI3twb2x5Lm5hbWV9XCIgZmFjZXMsIHZlcnRzXG5cbiMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiMgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbnNwaGVyaWNhbGl6ZSA9IChwb2x5KSAtPlxuXG4gICAgdmVydHMgPSBbXVxuICAgIGZvciB2ZXJ0ZXgsdmkgaW4gcG9seS52ZXJ0ZXhcbiAgICAgICAgdmVydHMucHVzaCB1bml0IHBvbHkudmVydGV4W3ZpXVxuICAgICAgICBcbiAgICBuZXcgUG9seWhlZHJvbiBcInoje3BvbHkubmFtZX1cIiBwb2x5LmZhY2UsIHZlcnRzXG5cbiMgMDAwMDAwMCAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAgIDAwMCAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiMgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG56aXJrdWxhcml6ZSA9IChwb2x5LCBncm93PTEsIG49NikgLT5cblxuICAgIHZlcnRpY2VzID0gW11cbiAgICBcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgICBcbiAgICBmb3IgZixmaSBpbiBwb2x5LmZhY2VcblxuICAgICAgICBpZiBmLmxlbmd0aCA9PSBuIG9yIG4gPT0gMFxuICAgICAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgICAgIGF4aXMgPSBjcm9zcyBjZW50ZXJzW2ZpXSwgcG9seS52ZXJ0ZXhbdl1cbiAgICAgICAgICAgICAgICBhbmdsID0gYW5nbGUgY2VudGVyc1tmaV0sIHBvbHkudmVydGV4W3ZdXG4gICAgICAgICAgICAgICAgdmVydGljZXNbdl0gPSByb3RhdGUgY2VudGVyc1tmaV0sIGF4aXMsIGFuZ2wgKiBncm93XG4gICAgICAgICAgICAgICAgXG4gICAgdmVydHMgPSBbMC4uLnBvbHkudmVydGV4Lmxlbmd0aF0ubWFwIChpKSAtPiB2ZXJ0aWNlc1tpXSA/IHBvbHkudmVydGV4W2ldXG4gICAgIFxuICAgIG5ldyBQb2x5aGVkcm9uIFwieiN7cG9seS5uYW1lfVwiIHBvbHkuZmFjZSwgdmVydHNcblxuIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG5cbmR1YWwgPSAocG9seSkgLT5cblxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZhY2UgPSBbXSBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGV4Lmxlbmd0aF0gXG4gICAgICAgIGZhY2VbaV0gPSB7fVxuXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIHYxID0gZlstMV1cbiAgICAgICAgZm9yIHYyIGluIGZcbiAgICAgICAgICAgIGZhY2VbdjFdW1widiN7djJ9XCJdID0gXCIje2l9XCJcbiAgICAgICAgICAgIHYxID0gdjJcbiAgXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmbGFnLnZlcnQgXCIje2l9XCIgY2VudGVyc1tpXVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VbaV1cbiAgICAgICAgdjEgPSBmWy0xXVxuICAgICAgICBmb3IgdjIgaW4gZlxuICAgICAgICAgICAgZmxhZy5lZGdlIHYxLCBmYWNlW3YyXVtcInYje3YxfVwiXSwgXCIje2l9XCJcbiAgICAgICAgICAgIHYxID0gdjJcbiAgXG4gICAgZHBvbHkgPSBmbGFnLnRvcG9seSgpXG4gIFxuICAgIHNvcnRGID0gW11cbiAgICBmb3IgZiBpbiBkcG9seS5mYWNlXG4gICAgICAgIGsgPSBpbnRlcnNlY3QgcG9seS5mYWNlW2ZbMF1dLCBwb2x5LmZhY2VbZlsxXV0sIHBvbHkuZmFjZVtmWzJdXVxuICAgICAgICBzb3J0RltrXSA9IGZcbiAgICBkcG9seS5mYWNlID0gc29ydEZcbiAgXG4gICAgaWYgcG9seS5uYW1lWzBdICE9IFwiZFwiXG4gICAgICAgIGRwb2x5Lm5hbWUgPSBcImQje3BvbHkubmFtZX1cIlxuICAgIGVsc2UgXG4gICAgICAgIGRwb2x5Lm5hbWUgPSBwb2x5Lm5hbWUuc2xpY2UgMVxuICBcbiAgICBkcG9seVxuXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG4jIEtpcyAoYWJicmV2aWF0ZWQgZnJvbSB0cmlha2lzKSB0cmFuc2Zvcm1zIGFuIE4tc2lkZWQgZmFjZSBpbnRvIGFuIE4tcHlyYW1pZCByb290ZWQgYXQgdGhlXG4jIHNhbWUgYmFzZSB2ZXJ0aWNlcy4gb25seSBraXMgbi1zaWRlZCBmYWNlcywgYnV0IG49PTAgbWVhbnMga2lzIGFsbC5cblxua2lzID0gKHBvbHksIGFwZXhkaXN0PTAuNSwgbj0wKSAtPlxuXG4gICAgYXBleGRpc3QgPSBjbGFtcCAtMSAxMCBhcGV4ZGlzdFxuICAgIFxuICAgIGlmIGFwZXhkaXN0IDwgMFxuICAgICAgICBhcGV4ZGlzdCA9IGFwZXhkaXN0ICogcG9seS5taW5GYWNlRGlzdCgpXG4gICAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGV4Lmxlbmd0aF1cbiAgICAgICAgZmxhZy52ZXJ0IFwidiN7aX1cIiBwb2x5LnZlcnRleFtpXVxuICBcbiAgICBub3JtYWxzID0gcG9seS5ub3JtYWxzKClcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgICBmb3VuZEFueSA9IGZhbHNlXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIHYxID0gXCJ2I3tmW2YubGVuZ3RoLTFdfVwiXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIHYyID0gXCJ2I3t2fVwiXG4gICAgICAgICAgICBpZiBmLmxlbmd0aCA9PSBuIG9yIG4gPT0gMFxuICAgICAgICAgICAgICAgIGZvdW5kQW55ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBhcGV4ID0gXCJhcGV4I3tpfVwiXG4gICAgICAgICAgICAgICAgZm5hbWUgPSBcIiN7aX0je3YxfVwiXG5cbiAgICAgICAgICAgICAgICBmbGFnLnZlcnQgYXBleCwgYWRkIGNlbnRlcnNbaV0sIG11bHQgYXBleGRpc3QsIG5vcm1hbHNbaV1cbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsICAgdjEsICAgdjJcbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsICAgdjIsIGFwZXhcbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIGFwZXgsICAgdjFcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UgXCIje2l9XCIsIHYxLCB2MlxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2MSA9IHYyXG4gIFxuICAgIGlmIG5vdCBmb3VuZEFueVxuICAgICAgICBrbG9nIFwiTm8gI3tufS1mb2xkIGNvbXBvbmVudHMgd2VyZSBmb3VuZC5cIlxuICBcbiAgICBmbGFnLnRvcG9seSBcImsje259I3twb2x5Lm5hbWV9XCJcblxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIFxuXG50cnVuY2F0ZSA9IChwb2x5LCBmYWN0b3I9MC41KSAtPlxuXG4gICAgZmFjdG9yID0gY2xhbXAgMCAxIGZhY3RvclxuICAgIGVkZ2VNYXAgPSB7fVxuICAgIFxuICAgIG51bUZhY2VzICAgID0gcG9seS5mYWNlLmxlbmd0aFxuICAgIG51bVZlcnRpY2VzID0gcG9seS52ZXJ0ZXgubGVuZ3RoXG4gICAgbmVpZ2hib3JzICAgPSBwb2x5Lm5laWdoYm9ycygpXG4gICAgXG4gICAgZGVwdGggPSAwLjUgKiBmYWN0b3IgKiBwb2x5Lm1pbkVkZ2VMZW5ndGgoKVxuICAgIFxuICAgIGZvciB2ZXJ0ZXhJbmRleCBpbiBbMC4uLm51bVZlcnRpY2VzXVxuICAgICAgICBcbiAgICAgICAgZWRnZU1hcFt2ZXJ0ZXhJbmRleF0gPz0ge31cbiAgICAgICAgZmFjZSA9IFtdXG4gICAgICAgIFxuICAgICAgICBubCA9IG5laWdoYm9yc1t2ZXJ0ZXhJbmRleF0ubGVuZ3RoXG4gICAgICAgIGZvciBpaSBpbiBbMC4uLm5sXVxuICAgICAgICAgICAgbmkgPSBuZWlnaGJvcnNbdmVydGV4SW5kZXhdW2lpXVxuICAgICAgICAgICAgZWRnZU1hcFt2ZXJ0ZXhJbmRleF1bbmldID0gcG9seS52ZXJ0ZXgubGVuZ3RoXG4gICAgICAgICAgICB2cCA9IHBvbHkuZWRnZSB2ZXJ0ZXhJbmRleCwgbmlcbiAgICAgICAgICAgIHZwLm5vcm1hbGl6ZSgpXG4gICAgICAgICAgICB2cC5zY2FsZUluUGxhY2UgZGVwdGhcbiAgICAgICAgICAgIHZwLmFkZEluUGxhY2UgcG9seS52ZXJ0IHZlcnRleEluZGV4XG4gICAgICAgICAgICBmYWNlLnB1c2ggcG9seS52ZXJ0ZXgubGVuZ3RoXG4gICAgICAgICAgICBwb2x5LnZlcnRleC5wdXNoIFt2cC54LCB2cC55LCB2cC56XVxuICAgICAgICAgICAgXG4gICAgICAgIHBvbHkuZmFjZS5wdXNoIGZhY2VcbiAgICBcbiAgICBmb3IgZmkgaW4gWzAuLi5udW1GYWNlc11cbiAgICAgICAgZmFjZSA9IHBvbHkuZmFjZVtmaV1cbiAgICAgICAgbmV3RmFjZSA9IFtdXG4gICAgICAgIGZvciB2aSBpbiBbMC4uLmZhY2UubGVuZ3RoXVxuICAgICAgICAgICAgbmkgPSAodmkrMSkgJSBmYWNlLmxlbmd0aFxuICAgICAgICAgICAgbmV3RmFjZS5wdXNoIGVkZ2VNYXBbZmFjZVt2aV1dW2ZhY2VbbmldXVxuICAgICAgICAgICAgaWYgZmFjdG9yIDwgMVxuICAgICAgICAgICAgICAgIG5ld0ZhY2UucHVzaCBlZGdlTWFwW2ZhY2VbbmldXVtmYWNlW3ZpXV1cbiAgICAgICAgcG9seS5mYWNlW2ZpXSA9IG5ld0ZhY2VcbiAgICAgIFxuICAgIHBvbHkudmVydGV4LnNwbGljZSAwLCBudW1WZXJ0aWNlc1xuICAgIGZvciBmYWNlIGluIHBvbHkuZmFjZVxuICAgICAgICBmb3IgaSBpbiBbMC4uLmZhY2UubGVuZ3RoXVxuICAgICAgICAgICAgZmFjZVtpXSAtPSBudW1WZXJ0aWNlc1xuICAgICAgICBcbiAgICBwb2x5XG4gICAgXG4jICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgXG5cbiMgVG9wb2xvZ2ljYWwgXCJ0d2VlblwiIGJldHdlZW4gYSBwb2x5aGVkcm9uIGFuZCBpdHMgZHVhbCBwb2x5aGVkcm9uLlxuXG5hbWJvID0gKHBvbHkpIC0+XG4gICAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSgtMilcbiAgICAgICAgZm9yIHYzIGluIGZcbiAgICAgICAgICAgIGlmIHYxIDwgdjJcbiAgICAgICAgICAgICAgICBmbGFnLnZlcnQgbWlkTmFtZSh2MSx2MiksIG1pZHBvaW50IHBvbHkudmVydGV4W3YxXSwgcG9seS52ZXJ0ZXhbdjJdXG5cbiAgICAgICAgICAgIGZsYWcuZWRnZSBcIm9yaWcje2l9XCIgIG1pZE5hbWUodjEsdjIpLCBtaWROYW1lKHYyLHYzKVxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZHVhbCN7djJ9XCIgbWlkTmFtZSh2Mix2MyksIG1pZE5hbWUodjEsdjIpXG5cbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M11cbiAgXG4gICAgZmxhZy50b3BvbHkgXCJhI3twb2x5Lm5hbWV9XCJcblxuYmV2ZWwgPSAocG9seSwgZmFjdG9yPTAuNSkgLT5cbiAgICBcbiAgICBwID0gdHJ1bmNhdGUgYW1ibyhwb2x5KSwgZmFjdG9yXG4gICAgcC5uYW1lID0gXCJiI3twb2x5Lm5hbWV9XCJcbiAgICBwXG4gICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbmNoYW1mZXIgPSAocG9seSwgZmFjdG9yPTAuNSkgLT5cbiAgICBcbiAgICBmYWN0b3IgID0gY2xhbXAgMC4wMDEgMC45OTUgZmFjdG9yXG4gICAgZmxhZyAgICA9IG5ldyBGbGFnKClcbiAgICBub3JtYWxzID0gcG9seS5ub3JtYWxzKClcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgICB3aW5ncyAgID0gcG9seS53aW5ncygpXG4gICAgICAgIFxuICAgIG1pbkVkZ2VMZW5ndGggPSBJbmZpbml0eVxuICAgIFxuICAgIGZvciBlZGdlIGluIHdpbmdzXG4gICAgICAgIGUwID0gcG9seS52ZXJ0ZXhbZWRnZVswXV1cbiAgICAgICAgZTEgPSBwb2x5LnZlcnRleFtlZGdlWzFdXVxuICAgICAgICBlZCA9IHVuaXQgc3ViIGUxLCBlMFxuICAgICAgICBcbiAgICAgICAgbnIgPSB1bml0IHN1YiBwb2x5LnZlcnRleFtlZGdlWzJdLm5yXSwgZTFcbiAgICAgICAgcHIgPSB1bml0IHN1YiBwb2x5LnZlcnRleFtlZGdlWzJdLnByXSwgZTBcbiAgICAgICAgY3IgPSByYXlSYXkgW2UxLCBtdWx0IDAuNSwgYWRkIGFkZChlMSwgbnIpLCBzdWIoZTEsIGVkKV0sXG4gICAgICAgICAgICAgICAgICAgIFtlMCwgbXVsdCAwLjUsIGFkZCBhZGQoZTAsIHByKSwgYWRkKGUwLCBlZCldXG5cbiAgICAgICAgZWwgPSBtYWcgc3ViIGUxLCByYXlSYXkgW2UxLCBhZGQoZTEsIG5yKV0sIFtjciwgYWRkKGNyLCBlZCldXG4gICAgICAgIG1pbkVkZ2VMZW5ndGggPSBtaW4gbWluRWRnZUxlbmd0aCwgZWxcblxuICAgICAgICBlbCA9IG1hZyBzdWIgZTAsIHJheVJheSBbZTAsIGFkZChlMCwgcHIpXSwgW2NyLCBzdWIoY3IsIGVkKV1cbiAgICAgICAgbWluRWRnZUxlbmd0aCA9IG1pbiBtaW5FZGdlTGVuZ3RoLCBlbFxuICAgICAgICBcbiAgICBtaW5FZGdlTGVuZ3RoICo9IGZhY3RvclxuICAgICAgICBcbiAgICBtb3ZlZCA9IHt9XG4gICAgZm9yIGVkZ2UgaW4gd2luZ3NcbiAgICAgICAgZTAgID0gcG9seS52ZXJ0ZXhbZWRnZVswXV1cbiAgICAgICAgZTEgID0gcG9seS52ZXJ0ZXhbZWRnZVsxXV1cbiAgICAgICAgcnIgPSBbXG4gICAgICAgICAgICBhZGQoZTAsIG11bHQgbWluRWRnZUxlbmd0aCwgdW5pdCBzdWIgcG9seS52ZXJ0ZXhbZWRnZVsyXS5wcl0sIGUwKSxcbiAgICAgICAgICAgIGFkZChlMSwgbXVsdCBtaW5FZGdlTGVuZ3RoLCB1bml0IHN1YiBwb2x5LnZlcnRleFtlZGdlWzJdLm5yXSwgZTEpXVxuICAgICAgICBsciA9IFtcbiAgICAgICAgICAgIGFkZChlMCwgbXVsdCBtaW5FZGdlTGVuZ3RoLCB1bml0IHN1YiBwb2x5LnZlcnRleFtlZGdlWzJdLnBsXSwgZTApLFxuICAgICAgICAgICAgYWRkKGUxLCBtdWx0IG1pbkVkZ2VMZW5ndGgsIHVuaXQgc3ViIHBvbHkudmVydGV4W2VkZ2VbMl0ubmxdLCBlMSldXG4gICAgICAgICAgICBcbiAgICAgICAgbW92ZWRbXCIje2VkZ2VbMV194pa4I3tlZGdlWzBdfWxcIl0gPSByclxuICAgICAgICBtb3ZlZFtcIiN7ZWRnZVswXX3ilrgje2VkZ2VbMV19clwiXSA9IHJyXG4gICAgICAgIG1vdmVkW1wiI3tlZGdlWzFdfeKWuCN7ZWRnZVswXX1yXCJdID0gbHJcbiAgICAgICAgbW92ZWRbXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfWxcIl0gPSBsclxuICAgICAgICAgICAgXG4gICAgZm9yIGVkZ2UgaW4gd2luZ3NcbiAgICAgICAgZTAgICA9IHBvbHkudmVydGV4W2VkZ2VbMF1dXG4gICAgICAgIGUxICAgPSBwb2x5LnZlcnRleFtlZGdlWzFdXVxuICAgICAgICBcbiAgICAgICAgbmYgID0gXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfVwiIFxuICAgICAgICBuX2ggPSBcIiN7ZWRnZVsxXX1cIlxuICAgICAgICBuX3QgPSBcIiN7ZWRnZVswXX1cIlxuICAgICAgICBcbiAgICAgICAgbm5yID0gXCIje25faH3ilrgje2VkZ2VbMl0uZnJ9XCJcbiAgICAgICAgbm5sID0gXCIje25faH3ilrgje2VkZ2VbMl0uZmx9XCJcbiAgICAgICAgbnByID0gXCIje25fdH3ilrgje2VkZ2VbMl0uZnJ9XCJcbiAgICAgICAgbnBsID0gXCIje25fdH3ilrgje2VkZ2VbMl0uZmx9XCIgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBuciA9IHJheVJheSBtb3ZlZFtcIiN7ZWRnZVswXX3ilrgje2VkZ2VbMV19clwiXSwgbW92ZWRbXCIje2VkZ2VbMV194pa4I3tlZGdlWzJdLm5yfXJcIl1cbiAgICAgICAgbmwgPSByYXlSYXkgbW92ZWRbXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfWxcIl0sIG1vdmVkW1wiI3tlZGdlWzFdfeKWuCN7ZWRnZVsyXS5ubH1sXCJdXG4gICAgICAgIHByID0gcmF5UmF5IG1vdmVkW1wiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1yXCJdLCBtb3ZlZFtcIiN7ZWRnZVsyXS5wcn3ilrgje2VkZ2VbMF19clwiXVxuICAgICAgICBwbCA9IHJheVJheSBtb3ZlZFtcIiN7ZWRnZVswXX3ilrgje2VkZ2VbMV19bFwiXSwgbW92ZWRbXCIje2VkZ2VbMl0ucGx94pa4I3tlZGdlWzBdfWxcIl1cbiAgICAgICAgXG4gICAgICAgIHBtaWQgPSBtaWRwb2ludCBwbCwgcHJcbiAgICAgICAgbm1pZCA9IG1pZHBvaW50IG5sLCBuclxuICAgICAgICBjbWlkID0gbWlkcG9pbnQgcG1pZCwgbm1pZFxuICAgICAgICBwbm0gID0gY3Jvc3Mgc3ViKHBtaWQsbm1pZCksIHN1YihwbCxwcilcblxuICAgICAgICBoZWFkID0gcmF5UGxhbmUgWzAgMCAwXSwgZTEsIGNtaWQsIHBubVxuICAgICAgICB0YWlsID0gcmF5UGxhbmUgWzAgMCAwXSwgZTAsIGNtaWQsIHBubVxuICAgICAgICBcbiAgICAgICAgZmxhZy52ZXJ0IG5faCwgaGVhZFxuICAgICAgICBmbGFnLnZlcnQgbl90LCB0YWlsXG4gICAgICAgIGZsYWcudmVydCBubnIsIG5yXG4gICAgICAgIGZsYWcudmVydCBubmwsIG5sXG4gICAgICAgIGZsYWcudmVydCBucGwsIHBsXG4gICAgICAgIGZsYWcudmVydCBucHIsIHByXG5cbiAgICAgICAgZmxhZy5lZGdlIG5mLCBuX2gsIG5uclxuICAgICAgICBmbGFnLmVkZ2UgbmYsIG5uciwgbnByXG4gICAgICAgIGZsYWcuZWRnZSBuZiwgbnByLCBuX3RcbiAgICAgICAgZmxhZy5lZGdlIG5mLCBuX3QsIG5wbFxuICAgICAgICBmbGFnLmVkZ2UgbmYsIG5wbCwgbm5sXG4gICAgICAgIGZsYWcuZWRnZSBuZiwgbm5sLCBuX2hcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZmxhZy5lZGdlIFwiI3tlZGdlWzJdLmZyfVwiIG5wciwgbm5yXG4gICAgICAgIGZsYWcuZWRnZSBcIiN7ZWRnZVsyXS5mbH1cIiBubmwsIG5wbFxuICAgICAgICBcbiAgICBmbGFnLnRvcG9seSBcImMje3BvbHkubmFtZX1cIlxuXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG5cbndoaXJsID0gKHBvbHksIG49MCkgLT5cblxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0ZXgubGVuZ3RoXVxuICAgICAgICBmbGFnLnZlcnQgXCJ2I3tpfVwiIHVuaXQgcG9seS52ZXJ0ZXhbaV1cblxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VbaV1cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlIC0yXG4gICAgICAgIGZvciBqIGluIFswLi4uZi5sZW5ndGhdXG4gICAgICAgICAgICB2ID0gZltqXVxuICAgICAgICAgICAgdjMgPSB2XG4gICAgICAgICAgICB2MV8yID0gb25lVGhpcmQgcG9seS52ZXJ0ZXhbdjFdLCBwb2x5LnZlcnRleFt2Ml1cbiAgICAgICAgICAgIGZsYWcudmVydCh2MStcIn5cIit2MiwgdjFfMilcbiAgICAgICAgICAgIGN2MW5hbWUgPSBcImNlbnRlciN7aX1+I3t2MX1cIlxuICAgICAgICAgICAgY3YybmFtZSA9IFwiY2VudGVyI3tpfX4je3YyfVwiXG4gICAgICAgICAgICBmbGFnLnZlcnQgY3YxbmFtZSwgdW5pdCBvbmVUaGlyZCBjZW50ZXJzW2ldLCB2MV8yXG4gICAgICAgICAgICBmbmFtZSA9IGkrXCJmXCIrdjFcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgY3YxbmFtZSwgICB2MStcIn5cIit2MlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MStcIn5cIit2MiwgdjIrXCJ+XCIrdjEgXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYyK1wiflwiK3YxLCBcInYje3YyfVwiICBcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgXCJ2I3t2Mn1cIiwgIHYyK1wiflwiK3YzIFxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MitcIn5cIit2MywgY3YybmFtZVxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBjdjJuYW1lLCAgIGN2MW5hbWVcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImMje2l9XCIsIGN2MW5hbWUsIGN2Mm5hbWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICBcbiAgICAjIGNhbm9uaWNhbGl6ZSBcbiAgICBmbGFnLnRvcG9seSBcIncje3BvbHkubmFtZX1cIlxuXG4jICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwMCAgICAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG5cbmd5cm8gPSAocG9seSxmYWN0b3I9MC41KSAtPlxuXG4gICAgZmFjdG9yID0gY2xhbXAgMC4yLCAwLjgsIGZhY3RvclxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0ZXgubGVuZ3RoXVxuICAgICAgICAjIGZsYWcudmVydCBcInYje2l9XCIgdW5pdCBwb2x5LnZlcnRleFtpXVxuICAgICAgICBmbGFnLnZlcnQgXCJ2I3tpfVwiIHBvbHkudmVydGV4W2ldXG5cbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgICMgZmxhZy52ZXJ0IFwiY2VudGVyI3tpfVwiIHVuaXQgY2VudGVyc1tpXVxuICAgICAgICBmbGFnLnZlcnQgXCJjZW50ZXIje2l9XCIgY2VudGVyc1tpXVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VbaV1cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlKC0yKVxuICAgICAgICBmb3IgaiBpbiBbMC4uLmYubGVuZ3RoXVxuICAgICAgICAgICAgdiA9IGZbal1cbiAgICAgICAgICAgIHYzID0gdlxuICAgICAgICAgICAgZmxhZy52ZXJ0IHYxK1wiflwiK3YyLCB0d2VlbiBwb2x5LnZlcnRleFt2MV0scG9seS52ZXJ0ZXhbdjJdLCBmYWN0b3JcbiAgICAgICAgICAgIGZuYW1lID0gaStcImZcIit2MVxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBcImNlbnRlciN7aX1cIiAgdjErXCJ+XCIrdjJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjErXCJ+XCIrdjIsICB2MitcIn5cIit2MVxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MitcIn5cIit2MSwgIFwidiN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgXCJ2I3t2Mn1cIiAgICAgdjIrXCJ+XCIrdjNcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjIrXCJ+XCIrdjMsICBcImNlbnRlciN7aX1cIlxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICBcbiAgICAjIGNhbm9uaWNhbGl6ZSBcbiAgICBmbGFnLnRvcG9seSBcImcje3BvbHkubmFtZX1cIlxuICAgIFxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAwMCAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuIyAwMDAgMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiMgIDAwMDAwIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgXG5cbnF1aW50byA9IChwb2x5KSAtPiAjIGNyZWF0ZXMgYSBwZW50YWdvbiBmb3IgZXZlcnkgdmVydGV4IGFuZCBhIG5ldyBpbnNldCBmYWNlXG4gICAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIGNlbnRyb2lkID0gY2FsY0NlbnRyb2lkIGYubWFwIChpZHgpIC0+IHBvbHkudmVydGV4W2lkeF1cblxuICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UgLTJcbiAgICAgICAgZm9yIHYzIGluIGZcbiAgICAgICAgICAgIG1pZHB0ID0gbWlkcG9pbnQgcG9seS52ZXJ0ZXhbdjFdLCBwb2x5LnZlcnRleFt2Ml1cbiAgICAgICAgICAgIGlubmVycHQgPSBtaWRwb2ludCBtaWRwdCwgY2VudHJvaWRcbiAgICAgICAgICAgIGZsYWcudmVydCBtaWROYW1lKHYxLHYyKSwgbWlkcHRcbiAgICAgICAgICAgIGZsYWcudmVydCBcImlubmVyXyN7aX1fXCIgKyBtaWROYW1lKHYxLHYyKSwgaW5uZXJwdFxuICAgICAgICAgICAgZmxhZy52ZXJ0IFwiI3t2Mn1cIiBwb2x5LnZlcnRleFt2Ml1cbiAgICAgICAgICBcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9XyN7djJ9XCIsIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYxLCB2MiksIG1pZE5hbWUodjEsIHYyKVxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7aX1fI3t2Mn1cIiwgbWlkTmFtZSh2MSwgdjIpLCBcIiN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9XyN7djJ9XCIsIFwiI3t2Mn1cIiwgbWlkTmFtZSh2MiwgdjMpXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfV8je3YyfVwiLCBtaWROYW1lKHYyLCB2MyksIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYyLCB2MylcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9XyN7djJ9XCIsIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYyLCB2MyksIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYxLCB2MilcbiAgICAgIFxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZl9pbl8je2l9XCIsIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYxLCB2MiksIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYyLCB2MylcbiAgICAgIFxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICBcbiAgICBmbGFnLnRvcG9seSBcInEje3BvbHkubmFtZX1cIlxuXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMFxuIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICBcbiMgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgXG4jIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAwMDAgICBcblxuaW5zZXQgPSAocG9seSwgaW5zZXQ9MC41LCBwb3BvdXQ9LTAuMiwgbj0wKSAtPlxuICBcbiAgICBpbnNldCA9IGNsYW1wIDAuMjUgMC45OSBpbnNldFxuICAgIHBvcG91dCA9IG1pbiBwb3BvdXQsIGluc2V0XG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGV4Lmxlbmd0aF1cbiAgICAgICAgcCA9IHBvbHkudmVydGV4W2ldXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgcFxuXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICAgICAgZmxhZy52ZXJ0IFwiZiN7aX12I3t2fVwiIGFkZCB0d2Vlbihwb2x5LnZlcnRleFt2XSxjZW50ZXJzW2ldLGluc2V0KSwgbXVsdChwb3BvdXQsbm9ybWFsc1tpXSlcbiAgXG4gICAgZm91bmRBbnkgPSBmYWxzZSAjIGFsZXJ0IGlmIGRvbid0IGZpbmQgYW55XG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIHYxID0gXCJ2I3tmW2YubGVuZ3RoLTFdfVwiXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIHYyID0gXCJ2I3t2fVwiO1xuICAgICAgICAgICAgaWYgZi5sZW5ndGggPT0gbiBvciBuID09IDBcbiAgICAgICAgICAgICAgICBmb3VuZEFueSA9IHRydWVcbiAgICAgICAgICAgICAgICBmbmFtZSA9IGkgKyB2MVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZShmbmFtZSwgICAgICB2MSwgICAgICAgdjIpXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlKGZuYW1lLCAgICAgIHYyLCAgICAgICBcImYje2l9I3t2Mn1cIilcbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UoZm5hbWUsIFwiZiN7aX0je3YyfVwiLCAgXCJmI3tpfSN7djF9XCIpXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlKGZuYW1lLCBcImYje2l9I3t2MX1cIiwgIHYxKVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZShcImV4I3tpfVwiLCBcImYje2l9I3t2MX1cIiwgIFwiZiN7aX0je3YyfVwiKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZShpLCB2MSwgdjIpICBcbiAgICAgICAgICAgIHYxPXYyXG4gIFxuICAgIGlmIG5vdCBmb3VuZEFueVxuICAgICAgICBrbG9nIFwiTm8gI3tufS1mb2xkIGNvbXBvbmVudHMgd2VyZSBmb3VuZC5cIlxuICBcbiAgICBmbGFnLnRvcG9seSBcIm4je259I3twb2x5Lm5hbWV9XCJcblxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcblxuZXh0cnVkZSA9IChwb2x5LCBwb3BvdXQ9MSwgaW5zZXRmPTAuNSwgbj0wKSAtPlxuICAgIG5ld3BvbHkgPSBpbnNldCBwb2x5LCBpbnNldGYsIHBvcG91dCwgblxuICAgIG5ld3BvbHkubmFtZSA9IFwieCN7bn0je3BvbHkubmFtZX1cIlxuICAgIG5ld3BvbHlcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAwMFxuIyAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4jIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAgICAgICAwMDAgICAwMDBcblxucGVyc3BlY3RpdmEgPSAocG9seSkgLT4gIyBhbiBvcGVyYXRpb24gcmV2ZXJzZS1lbmdpbmVlcmVkIGZyb20gUGVyc3BlY3RpdmEgQ29ycG9ydW0gUmVndWxhcml1bVxuXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgcG9seS52ZXJ0ZXhbaV1cbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBcbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0yXX1cIlxuICAgICAgICB2MiA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICB2ZXJ0MSA9IHBvbHkudmVydGV4W2ZbZi5sZW5ndGgtMl1dXG4gICAgICAgIHZlcnQyID0gcG9seS52ZXJ0ZXhbZltmLmxlbmd0aC0xXV1cbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgdjMgPSBcInYje3Z9XCJcbiAgICAgICAgICAgIHZlcnQzID0gcG9seS52ZXJ0ZXhbdl1cbiAgICAgICAgICAgIHYxMiA9IHYxK1wiflwiK3YyXG4gICAgICAgICAgICB2MjEgPSB2MitcIn5cIit2MVxuICAgICAgICAgICAgdjIzID0gdjIrXCJ+XCIrdjNcbiAgICAgIFxuICAgICAgICAgICAgIyBvbiBlYWNoIE5mYWNlLCBOIG5ldyBwb2ludHMgaW5zZXQgZnJvbSBlZGdlIG1pZHBvaW50cyB0b3dhcmRzIGNlbnRlciA9IFwic3RlbGxhdGVkXCIgcG9pbnRzXG4gICAgICAgICAgICBmbGFnLnZlcnQgdjEyLCBtaWRwb2ludCBtaWRwb2ludCh2ZXJ0MSx2ZXJ0MiksIGNlbnRlcnNbaV0gXG4gICAgICBcbiAgICAgICAgICAgICMgaW5zZXQgTmZhY2UgbWFkZSBvZiBuZXcsIHN0ZWxsYXRlZCBwb2ludHNcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImluI3tpfVwiIHYxMiwgdjIzXG4gICAgICBcbiAgICAgICAgICAgICMgbmV3IHRyaSBmYWNlIGNvbnN0aXR1dGluZyB0aGUgcmVtYWluZGVyIG9mIHRoZSBzdGVsbGF0ZWQgTmZhY2VcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9I3t2Mn1cIiB2MjMsIHYxMlxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7aX0je3YyfVwiIHYxMiwgdjJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9I3t2Mn1cIiB2MiwgIHYyM1xuICAgICAgXG4gICAgICAgICAgICAjIG9uZSBvZiB0aGUgdHdvIG5ldyB0cmlhbmdsZXMgcmVwbGFjaW5nIG9sZCBlZGdlIGJldHdlZW4gdjEtPnYyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3t2MTJ9XCIgdjEsICB2MjFcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje3YxMn1cIiB2MjEsIHYxMlxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7djEyfVwiIHYxMiwgdjFcbiAgICAgIFxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICAgICAgICAgICAgW3ZlcnQxLCB2ZXJ0Ml0gPSBbdmVydDIsIHZlcnQzXVxuICBcbiAgICBmbGFnLnRvcG9seSBcIlAje3BvbHkubmFtZX1cIlxuXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG5cbnRyaXN1YiA9IChwb2x5LCBuPTIpIC0+XG4gICAgXG4gICAgZm9yIGZuIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgaWYgcG9seS5mYWNlW2ZuXS5sZW5ndGggIT0gM1xuICAgICAgICAgICAgcmV0dXJuIHBvbHlcbiAgXG4gICAgdmVydHMgPSBbXVxuICAgIHZtYXAgPSB7fVxuICAgIHBvcyA9IDBcbiAgICBmb3IgZm4gaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ZuXVxuICAgICAgICBbaTEsIGkyLCBpM10gPSBmLnNsaWNlIC0zXG4gICAgICAgIHYxID0gcG9seS52ZXJ0ZXhbaTFdXG4gICAgICAgIHYyID0gcG9seS52ZXJ0ZXhbaTJdXG4gICAgICAgIHYzID0gcG9seS52ZXJ0ZXhbaTNdXG4gICAgICAgIHYyMSA9IHN1YiB2MiwgdjFcbiAgICAgICAgdjMxID0gc3ViIHYzLCB2MVxuICAgICAgICBmb3IgaSBpbiBbMC4ubl1cbiAgICAgICAgICAgIGZvciBqIGluIFswLi5uLWldXG4gICAgICAgICAgICAgICAgdiA9IGFkZCBhZGQodjEsIG11bHQoaS9uLCB2MjEpKSwgbXVsdChqL24sIHYzMSlcbiAgICAgICAgICAgICAgICB2bWFwW1widiN7Zm59LSN7aX0tI3tqfVwiXSA9IHBvcysrXG4gICAgICAgICAgICAgICAgdmVydHMucHVzaCB2XG4gIFxuICAgIEVQU0lMT05fQ0xPU0UgPSAxLjBlLThcbiAgICB1bmlxVnMgPSBbXVxuICAgIG5ld3BvcyA9IDBcbiAgICB1bmlxbWFwID0ge31cbiAgICBmb3IgdixpIGluIHZlcnRzXG4gICAgICAgIGlmIGkgaW4gdW5pcW1hcCB0aGVuIGNvbnRpbnVlICMgYWxyZWFkeSBtYXBwZWRcbiAgICAgICAgdW5pcW1hcFtpXSA9IG5ld3Bvc1xuICAgICAgICB1bmlxVnMucHVzaCB2XG4gICAgICAgIGZvciBqIGluIFtpKzEuLi52ZXJ0cy5sZW5ndGhdXG4gICAgICAgICAgICB3ID0gdmVydHNbal1cbiAgICAgICAgICAgIGlmIG1hZyhzdWIodiwgdykpIDwgRVBTSUxPTl9DTE9TRVxuICAgICAgICAgICAgICAgIHVuaXFtYXBbal0gPSBuZXdwb3NcbiAgICAgICAgbmV3cG9zKytcbiAgXG4gICAgZmFjZXMgPSBbXVxuICAgIGZvciBmbiBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgIGZvciBpIGluIFswLi4ubl1cbiAgICAgICAgICAgIGZvciBqIGluIFswLi4ubi1pXVxuICAgICAgICAgICAgICAgIGZhY2VzLnB1c2ggW3VuaXFtYXBbdm1hcFtcInYje2ZufS0je2l9LSN7an1cIl1dLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpKzF9LSN7an1cIl1dLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2orMX1cIl1dXVxuICAgICAgICBmb3IgaSBpbiBbMS4uLm5dXG4gICAgICAgICAgICBmb3IgaiBpbiBbMC4uLm4taV1cbiAgICAgICAgICAgICAgICBmYWNlcy5wdXNoIFt1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2p9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqKzF9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aS0xfS0je2orMX1cIl1dXVxuICBcbiAgICBuZXcgUG9seWhlZHJvbiBcInUje259I3twb2x5Lm5hbWV9XCIgZmFjZXMsIHVuaXFWc1xuXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4jIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbiMgU2xvdyBDYW5vbmljYWxpemF0aW9uIEFsZ29yaXRobVxuI1xuIyBUaGlzIGFsZ29yaXRobSBoYXMgc29tZSBjb252ZXJnZW5jZSBwcm9ibGVtcywgd2hhdCByZWFsbHkgbmVlZHMgdG8gYmUgZG9uZSBpcyB0b1xuIyBzdW0gdGhlIHRocmVlIGZvcmNpbmcgZmFjdG9ycyB0b2dldGhlciBhcyBhIGNvaGVyZW50IGZvcmNlIGFuZCB0byB1c2UgYSBoYWxmLWRlY2VudFxuIyBpbnRlZ3JhdG9yIHRvIG1ha2Ugc3VyZSB0aGF0IGl0IGNvbnZlcmdlcyB3ZWxsIGFzIG9wcG9zZWQgdG8gdGhlIGN1cnJlbnQgaGFjayBvZlxuIyBhZC1ob2Mgc3RhYmlsaXR5IG11bHRpcGxpZXJzLiAgSWRlYWxseSBvbmUgd291bGQgaW1wbGVtZW50IGEgY29uanVnYXRlIGdyYWRpZW50XG4jIGRlc2NlbnQgb3Igc2ltaWxhciBwcmV0dHkgdGhpbmcuXG4jXG4jIE9ubHkgdHJ5IHRvIHVzZSB0aGlzIG9uIGNvbnZleCBwb2x5aGVkcmEgdGhhdCBoYXZlIGEgY2hhbmNlIG9mIGJlaW5nIGNhbm9uaWNhbGl6ZWQsXG4jIG90aGVyd2lzZSBpdCB3aWxsIHByb2JhYmx5IGJsb3cgdXAgdGhlIGdlb21ldHJ5LiAgQSBtdWNoIHRyaWNraWVyIC8gc21hcnRlciBzZWVkLXN5bW1ldHJ5XG4jIGJhc2VkIGdlb21ldHJpY2FsIHJlZ3VsYXJpemVyIHNob3VsZCBiZSB1c2VkIGZvciBmYW5jaWVyL3dlaXJkZXIgcG9seWhlZHJhLlxuXG5jYW5vbmljYWxpemUgPSAocG9seSwgaXRlcj0yMDApIC0+XG5cbiAgICBmYWNlcyA9IHBvbHkuZmFjZVxuICAgIGVkZ2VzID0gcG9seS5lZGdlcygpXG4gICAgdmVydHMgPSBwb2x5LnZlcnRleFxuICAgIG1heENoYW5nZSA9IDEuMFxuICAgIGZvciBpIGluIFswLi5pdGVyXVxuICAgICAgICBvbGRWcyA9IGNvcHlWZWNBcnJheSB2ZXJ0c1xuICAgICAgICB2ZXJ0cyA9IHRhbmdlbnRpZnkgdmVydHMsIGVkZ2VzXG4gICAgICAgICMgdmVydHMgPSByZWNlbnRlciB2ZXJ0cywgZWRnZXNcbiAgICAgICAgdmVydHMgPSBwbGFuYXJpemUgdmVydHMsIGZhY2VzXG4gICAgICAgIG1heENoYW5nZSA9IF8ubWF4IF8ubWFwIF8uemlwKHZlcnRzLCBvbGRWcyksIChbeCwgeV0pIC0+IG1hZyBzdWIgeCwgeVxuICAgICAgICBpZiBtYXhDaGFuZ2UgPCAxZS04XG4gICAgICAgICAgICBicmVha1xuICAgICMgdmVydHMgPSByZXNjYWxlIHZlcnRzXG4gICAgIyBuZXcgUG9seWhlZHJvbiBwb2x5Lm5hbWUsIHBvbHkuZmFjZSwgdmVydHNcbiAgICBwb2x5LnZlcnRzID0gdmVydHNcbiAgICBwb2x5LnJlc2NhbGUoKVxuICAgICAgICBcbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gICAgZHVhbDogICAgICAgICAgIGR1YWxcbiAgICBiZXZlbDogICAgICAgICAgYmV2ZWxcbiAgICB0cmlzdWI6ICAgICAgICAgdHJpc3ViXG4gICAgdHJ1bmNhdGU6ICAgICAgIHRydW5jYXRlXG4gICAgcGVyc3BlY3RpdmE6ICAgIHBlcnNwZWN0aXZhXG4gICAga2lzOiAgICAgICAgICAgIGtpc1xuICAgIGFtYm86ICAgICAgICAgICBhbWJvXG4gICAgZ3lybzogICAgICAgICAgIGd5cm9cbiAgICBjaGFtZmVyOiAgICAgICAgY2hhbWZlclxuICAgIHdoaXJsOiAgICAgICAgICB3aGlybFxuICAgIHF1aW50bzogICAgICAgICBxdWludG9cbiAgICBpbnNldDogICAgICAgICAgaW5zZXRcbiAgICBleHRydWRlOiAgICAgICAgZXh0cnVkZVxuICAgIGV4cGFuZDogICAgICAgICBleHBhbmRcbiAgICBob2xsb3c6ICAgICAgICAgaG9sbG93XG4gICAgZmxhdHRlbjogICAgICAgIGZsYXR0ZW5cbiAgICB6aXJrdWxhcml6ZTogICAgemlya3VsYXJpemVcbiAgICBzcGhlcmljYWxpemU6ICAgc3BoZXJpY2FsaXplXG4gICAgY2Fub25pY2FsaXplOiAgIGNhbm9uaWNhbGl6ZVxuICAgICJdfQ==
//# sourceURL=../../coffee/poly/topo.coffee