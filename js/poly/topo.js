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
    return canonicalize(flag.topoly("w" + poly.name));
};

gyro = function(poly) {
    var centers, f, flag, fname, i, j, l, m, q, r, ref2, ref3, ref4, ref5, ref6, ref7, v, v1, v2, v3;
    flag = new Flag();
    for (i = l = 0, ref2 = poly.vertex.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        flag.vert("v" + i, unit(poly.vertex[i]));
    }
    centers = poly.centers();
    for (i = m = 0, ref3 = poly.face.length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        f = poly.face[i];
        flag.vert("center" + i, unit(centers[i]));
    }
    for (i = q = 0, ref4 = poly.face.length; 0 <= ref4 ? q < ref4 : q > ref4; i = 0 <= ref4 ? ++q : --q) {
        f = poly.face[i];
        ref5 = f.slice(-2), v1 = ref5[0], v2 = ref5[1];
        for (j = r = 0, ref6 = f.length; 0 <= ref6 ? r < ref6 : r > ref6; j = 0 <= ref6 ? ++r : --r) {
            v = f[j];
            v3 = v;
            flag.vert(v1 + "~" + v2, oneThird(poly.vertex[v1], poly.vertex[v2]));
            fname = i + "f" + v1;
            flag.edge(fname, "center" + i, v1 + "~" + v2);
            flag.edge(fname, v1 + "~" + v2, v2 + "~" + v1);
            flag.edge(fname, v2 + "~" + v1, "v" + v2);
            flag.edge(fname, "v" + v2, v2 + "~" + v3);
            flag.edge(fname, v2 + "~" + v3, "center" + i);
            ref7 = [v2, v3], v1 = ref7[0], v2 = ref7[1];
        }
    }
    return canonicalize(flag.topoly("g" + poly.name));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9wby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsa1pBQUE7SUFBQTs7QUFVQSxNQUFxQixPQUFBLENBQVEsS0FBUixDQUFyQixFQUFFLFNBQUYsRUFBSyxpQkFBTCxFQUFZOztBQUNaLE9BQWlMLE9BQUEsQ0FBUSxRQUFSLENBQWpMLEVBQUUsY0FBRixFQUFPLGtCQUFQLEVBQWMsZ0NBQWQsRUFBNEIsMEJBQTVCLEVBQXVDLGdDQUF2QyxFQUFxRCxrQkFBckQsRUFBNEQsMEJBQTVELEVBQXVFLGNBQXZFLEVBQTRFLHdCQUE1RSxFQUFzRixnQkFBdEYsRUFBNEYsY0FBNUYsRUFBaUcsd0JBQWpHLEVBQTJHLDBCQUEzRyxFQUFzSCx3QkFBdEgsRUFBZ0ksb0JBQWhJLEVBQXdJLG9CQUF4SSxFQUFnSixjQUFoSixFQUFxSiw0QkFBckosRUFBaUssa0JBQWpLLEVBQXdLOztBQUN0SyxNQUFROztBQUVWLElBQUEsR0FBTyxPQUFBLENBQVEsU0FBUjs7QUFDUCxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0FBQ1AsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztBQUViLE9BQUEsR0FBVSxTQUFDLEVBQUQsRUFBSyxFQUFMO1dBQVksRUFBQSxHQUFHLEVBQUgsSUFBVSxDQUFHLEVBQUQsR0FBSSxHQUFKLEdBQU8sRUFBVCxDQUFWLElBQTJCLENBQUcsRUFBRCxHQUFJLEdBQUosR0FBTyxFQUFUO0FBQXZDOztBQVFWLE9BQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxVQUFQO0FBRU4sUUFBQTs7UUFGYSxhQUFXOztJQUV4QixPQUFBLEdBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBQTtJQUNWLFNBQUEsR0FBWSxJQUFJLENBQUMsU0FBTCxDQUFBO0lBQ1osT0FBZ0MsSUFBSSxDQUFDLFFBQUwsQ0FBQSxDQUFoQyxFQUFDLGtCQUFELEVBQVUsb0JBQVYsRUFBcUI7QUFLckIsV0FBTSxVQUFBLElBQWUsUUFBQSxHQUFXLEtBQWhDO1FBRUksVUFBQSxJQUFjO0FBRWQsYUFBVSxrR0FBVjtZQUNJLElBQVksU0FBVSxDQUFBLEVBQUEsQ0FBRyxDQUFDLE1BQWQsSUFBd0IsQ0FBcEM7QUFBQSx5QkFBQTs7WUFDQSxJQUFZLFNBQVUsQ0FBQSxFQUFBLENBQUcsQ0FBQyxNQUFkLElBQXdCLENBQXBDO0FBQUEseUJBQUE7O1lBSUEsSUFBSSxDQUFDLE1BQU8sQ0FBQSxFQUFBLENBQVosR0FBa0IsR0FBQSxDQUFJLElBQUksQ0FBQyxNQUFPLENBQUEsRUFBQSxDQUFoQixFQUFxQixJQUFBLENBQUssR0FBTCxFQUFVLE9BQVEsQ0FBQSxFQUFBLENBQWxCLENBQXJCO0FBTnRCO1FBUUEsS0FBQSxHQUFRO1FBQ1IsT0FBZ0MsSUFBSSxDQUFDLFFBQUwsQ0FBQSxDQUFoQyxFQUFDLGtCQUFELEVBQVUsb0JBQVYsRUFBcUI7SUFiekI7V0FlQTtBQXhCTTs7QUFnQ1YsTUFBQSxHQUFTLFNBQUMsSUFBRCxFQUFPLE1BQVAsRUFBbUIsU0FBbkI7QUFFTCxRQUFBOztRQUZZLFNBQU87OztRQUFLLFlBQVU7O0lBRWxDLE1BQUEsR0FBWSxLQUFBLENBQU0sR0FBTixFQUFVLEdBQVYsRUFBYyxNQUFkO0lBQ1osT0FBQSxHQUFZLElBQUksQ0FBQyxPQUFMLENBQUE7SUFDWixPQUFBLEdBQVksSUFBSSxDQUFDLE9BQUwsQ0FBQTtJQUNaLEtBQUEsR0FBWSxJQUFJLENBQUMsS0FBTCxDQUFBO0lBQ1osU0FBQSxHQUFZLElBQUksQ0FBQyxTQUFMLENBQUE7O1FBRVo7O1FBQUEsWUFBYTs7SUFFYixHQUFBLEdBQU07SUFDTixHQUFBLEdBQU0sU0FBQyxDQUFELEVBQUcsQ0FBSDs7WUFDRixHQUFJLENBQUEsQ0FBQTs7WUFBSixHQUFJLENBQUEsQ0FBQSxJQUFNOztRQUNWLElBQUcsQ0FBSSxHQUFJLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFkO1lBQ0ksR0FBSSxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBUCxHQUFZLEtBQUEsQ0FBTSxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBbEIsRUFBc0IsT0FBUSxDQUFBLENBQUEsQ0FBOUIsRUFBa0MsTUFBbEMsRUFEaEI7O2VBRUEsR0FBSSxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUE7SUFKTDtJQU1OLEdBQUEsR0FBTTtJQUNOLEdBQUEsR0FBTSxTQUFDLENBQUQsRUFBRyxDQUFIOztZQUNGLEdBQUksQ0FBQSxDQUFBOztZQUFKLEdBQUksQ0FBQSxDQUFBLElBQU07O1FBQ1YsSUFBRyxDQUFJLEdBQUksQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQWQ7WUFDSSxHQUFJLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFQLEdBQVksR0FBQSxDQUFJLEdBQUEsQ0FBSSxDQUFKLEVBQU0sQ0FBTixDQUFKLEVBQWMsSUFBQSxDQUFLLENBQUMsU0FBTixFQUFpQixPQUFRLENBQUEsQ0FBQSxDQUF6QixDQUFkLEVBRGhCOztlQUVBLEdBQUksQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBO0lBSkw7QUFNTixTQUFBLHVDQUFBOztRQUNJLEVBQUEsR0FBSyxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUM7UUFDYixFQUFBLEdBQUssSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDO1FBQ2IsRUFBQSxHQUFLLEdBQUEsQ0FBSSxJQUFLLENBQUEsQ0FBQSxDQUFULEVBQWEsRUFBYjtRQUNMLEVBQUEsR0FBSyxHQUFBLENBQUksSUFBSyxDQUFBLENBQUEsQ0FBVCxFQUFhLEVBQWI7UUFFTCxFQUFBLEdBQUssR0FBQSxDQUFJLE9BQVEsQ0FBQSxFQUFBLENBQVo7UUFDTCxFQUFBLEdBQUssR0FBQSxDQUFJLE9BQVEsQ0FBQSxFQUFBLENBQVo7UUFFTCxFQUFBLEdBQUssTUFBQSxDQUFPLENBQUMsRUFBRCxFQUFLLEdBQUEsQ0FBSSxFQUFKLEVBQVEsRUFBUixDQUFMLENBQVAsRUFBeUIsQ0FBQyxFQUFELEVBQUssR0FBQSxDQUFJLEVBQUosRUFBUSxFQUFSLENBQUwsQ0FBekI7UUFFTCxTQUFBLEdBQVksR0FBQSxDQUFJLFNBQUosRUFBZSxHQUFBLENBQUksR0FBQSxDQUFJLEVBQUosRUFBUSxFQUFSLENBQUosQ0FBZjtRQUNaLFNBQUEsR0FBWSxHQUFBLENBQUksU0FBSixFQUFlLEdBQUEsQ0FBSSxHQUFBLENBQUksRUFBSixFQUFRLEVBQVIsQ0FBSixDQUFmO0FBWmhCO0lBY0EsSUFBQSxHQUFPLElBQUksSUFBSixDQUFBO0FBRVAsU0FBUyxnR0FBVDtRQUNJLENBQUEsR0FBSSxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUE7UUFDaEIsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFBLEdBQUksQ0FBZCxFQUFrQixDQUFsQjtBQUZKO0FBSUEsU0FBVSxnR0FBVjtRQUNJLElBQUEsR0FBTyxJQUFJLENBQUMsSUFBSyxDQUFBLEVBQUE7QUFDakIsYUFBQSx3Q0FBQTs7WUFDSSxJQUFJLENBQUMsSUFBTCxDQUFVLEtBQUEsR0FBTSxFQUFOLEdBQVMsR0FBVCxHQUFZLEVBQXRCLEVBQStCLEdBQUEsQ0FBSSxFQUFKLEVBQVEsRUFBUixDQUEvQjtZQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBQSxHQUFVLEVBQVYsR0FBYSxHQUFiLEdBQWdCLEVBQTFCLEVBQStCLEdBQUEsQ0FBSSxFQUFKLEVBQVEsRUFBUixDQUEvQjtBQUZKO0FBRko7QUFNQSxTQUFVLGdHQUFWO1FBQ0ksQ0FBQSxHQUFJLElBQUksQ0FBQyxJQUFLLENBQUEsRUFBQTtRQUNkLEVBQUEsR0FBSyxHQUFBLEdBQUksQ0FBRSxDQUFBLENBQUMsQ0FBQyxNQUFGLEdBQVMsQ0FBVDtBQUNYLGFBQUEscUNBQUE7O1lBRUksRUFBQSxHQUFLLEdBQUEsR0FBSTtZQUNULEVBQUEsR0FBSyxLQUFBLEdBQU0sRUFBTixHQUFXO1lBQ2hCLEVBQUEsR0FBSyxLQUFBLEdBQU0sRUFBTixHQUFXO1lBQ2hCLEVBQUEsR0FBSyxTQUFBLEdBQVUsRUFBVixHQUFlO1lBQ3BCLEVBQUEsR0FBSyxTQUFBLEdBQVUsRUFBVixHQUFlO1lBRXBCLEtBQUEsR0FBUSxNQUFBLEdBQU8sRUFBUCxHQUFZO1lBQ3BCLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBVixFQUFpQixFQUFqQixFQUFxQixFQUFyQjtZQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBVixFQUFpQixFQUFqQixFQUFxQixFQUFyQjtZQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBVixFQUFpQixFQUFqQixFQUFxQixFQUFyQjtZQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBVixFQUFpQixFQUFqQixFQUFxQixFQUFyQjtZQUVBLEtBQUEsR0FBUSxPQUFBLEdBQVEsRUFBUixHQUFhO1lBQ3JCLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBVixFQUFpQixFQUFqQixFQUFxQixFQUFyQjtZQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBVixFQUFpQixFQUFqQixFQUFxQixFQUFyQjtZQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBVixFQUFpQixFQUFqQixFQUFxQixFQUFyQjtZQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBVixFQUFpQixFQUFqQixFQUFxQixFQUFyQjtZQUVBLEVBQUEsR0FBSztBQXBCVDtBQUhKO0lBeUJBLFNBQUEsR0FBWTtBQUNaLFNBQUEseUNBQUE7O1FBQ0ksRUFBQSxHQUFLLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQztRQUNiLEVBQUEsR0FBSyxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUM7UUFFYixFQUFBLEdBQUssU0FBQSxHQUFVLEVBQVYsR0FBYSxHQUFiLEdBQWdCLElBQUssQ0FBQSxDQUFBO1FBQzFCLEVBQUEsR0FBSyxTQUFBLEdBQVUsRUFBVixHQUFhLEdBQWIsR0FBZ0IsSUFBSyxDQUFBLENBQUE7UUFDMUIsRUFBQSxHQUFLLFNBQUEsR0FBVSxFQUFWLEdBQWEsR0FBYixHQUFnQixJQUFLLENBQUEsQ0FBQTtRQUMxQixFQUFBLEdBQUssU0FBQSxHQUFVLEVBQVYsR0FBYSxHQUFiLEdBQWdCLElBQUssQ0FBQSxDQUFBO1FBRTFCLElBQUcsS0FBQSxHQUFRLEdBQUEsQ0FBSSxHQUFBLENBQUksR0FBQSxDQUFJLElBQUssQ0FBQSxDQUFBLENBQVQsRUFBYSxFQUFiLENBQUosRUFBc0IsR0FBQSxDQUFJLElBQUssQ0FBQSxDQUFBLENBQVQsRUFBYSxFQUFiLENBQXRCLENBQUosQ0FBWDtZQUVJLEtBQUEsR0FBUSxTQUFBLEdBQVUsRUFBVixHQUFhLEdBQWIsR0FBZ0I7WUFDeEIsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFWLEVBQWlCLEVBQWpCLEVBQXFCLEVBQXJCO1lBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFWLEVBQWlCLEVBQWpCLEVBQXFCLEVBQXJCO1lBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFWLEVBQWlCLEVBQWpCLEVBQXFCLEVBQXJCO1lBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFWLEVBQWlCLEVBQWpCLEVBQXFCLEVBQXJCLEVBTko7OztZQVFBOztZQUFBLGtCQUFzQjs7UUFDdEIsU0FBVSxDQUFBLElBQUssQ0FBQSxDQUFBLENBQUwsQ0FBUyxDQUFBLElBQUssQ0FBQSxDQUFBLENBQUwsQ0FBbkIsR0FBOEIsQ0FBQyxFQUFELEVBQUssRUFBTDs7WUFDOUI7O1lBQUEsbUJBQXNCOztRQUN0QixTQUFVLENBQUEsSUFBSyxDQUFBLENBQUEsQ0FBTCxDQUFTLENBQUEsSUFBSyxDQUFBLENBQUEsQ0FBTCxDQUFuQixHQUE4QixDQUFDLEVBQUQsRUFBSyxFQUFMO0FBcEJsQztBQXNCQSxTQUFBLHVEQUFBOztBQUNJLGFBQUEseUNBQUE7O1lBQ0ksSUFBQSxHQUFPLFNBQVUsQ0FBQSxFQUFBLENBQUksQ0FBQSxFQUFBO1lBQ3JCLElBQUksQ0FBQyxJQUFMLENBQVUsU0FBQSxHQUFVLEVBQXBCLEVBQTBCLElBQUssQ0FBQSxDQUFBLENBQS9CLEVBQW1DLElBQUssQ0FBQSxDQUFBLENBQXhDO0FBRko7QUFESjtXQUtBLElBQUksQ0FBQyxNQUFMLENBQVksR0FBQSxHQUFJLElBQUksQ0FBQyxJQUFyQjtBQXZHSzs7QUErR1QsTUFBQSxHQUFTLFNBQUMsSUFBRCxFQUFPLE1BQVA7QUFFTCxRQUFBOztRQUZZLFNBQU87O0lBRW5CLE1BQUEsR0FBWSxLQUFBLENBQU0sQ0FBTixFQUFRLEVBQVIsRUFBVyxNQUFYO0lBQ1osUUFBQSxHQUFZLElBQUksQ0FBQyxLQUFMLENBQUE7SUFDWixPQUFBLEdBQVksSUFBSSxDQUFDLE9BQUwsQ0FBQTtJQUNaLFNBQUEsR0FBWSxJQUFJLENBQUMsU0FBTCxDQUFBO0lBQ1osS0FBQSxHQUFZLElBQUksQ0FBQyxLQUFMLENBQUE7SUFFWixLQUFBLEdBQVE7SUFDUixLQUFBLEdBQVE7SUFDUixJQUFBLEdBQVE7SUFDUixJQUFBLEdBQVE7SUFDUixJQUFBLEdBQVE7QUFDUixTQUFVLGdHQUFWO1FBQ0ksQ0FBQSxHQUFJLEdBQUEsQ0FBSSxJQUFBLENBQUssQ0FBQSxHQUFFLE1BQVAsRUFBZSxPQUFRLENBQUEsRUFBQSxDQUF2QixDQUFKLEVBQWlDLE9BQVEsQ0FBQSxFQUFBLENBQXpDO1FBQ0osQ0FBQSxHQUFJLElBQUksQ0FBQyxJQUFLLENBQUEsRUFBQTtRQUNkLElBQUEsR0FBTztBQUNQLGFBQUEsNkNBQUE7OztnQkFDSSxJQUFLLENBQUEsQ0FBQTs7Z0JBQUwsSUFBSyxDQUFBLENBQUEsSUFBTTs7WUFDWCxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsSUFBUixDQUFhLElBQWI7WUFDQSxJQUFLLENBQUEsSUFBQSxDQUFMLEdBQWE7WUFDYixLQUFLLENBQUMsSUFBTixDQUFXLEdBQUEsQ0FBSSxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBaEIsRUFBb0IsQ0FBcEIsQ0FBWDtZQUNBLEtBQUEsR0FBUSxJQUFBLEdBQUssQ0FBQyxFQUFBLEtBQUksQ0FBQyxDQUFDLE1BQUYsR0FBUyxDQUFiLElBQW1CLENBQUMsQ0FBQyxDQUFDLE1BQUgsR0FBVSxDQUE3QixJQUFrQyxDQUFuQztZQUNiLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBVjtZQUNBLElBQUE7QUFQSjtRQVFBLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWDtBQVpKO0FBY0EsU0FBQSx5Q0FBQTs7UUFDSyxXQUFELEVBQUc7UUFDSCxJQUFBLEdBQU8sSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQVIsQ0FBZSxJQUFLLENBQUEsQ0FBQSxDQUFwQjtRQUNQLElBQUEsR0FBTyxJQUFJLENBQUMsTUFBTCxDQUFZLFNBQUMsQ0FBRDttQkFBTyxDQUFDLGFBQUssS0FBTSxDQUFBLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxFQUFSLENBQVgsRUFBQSxDQUFBLE1BQUQsQ0FBQSxJQUE0QixDQUFDLGFBQUssS0FBTSxDQUFBLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxFQUFSLENBQVgsRUFBQSxDQUFBLE1BQUQ7UUFBbkMsQ0FBWjtRQUNQLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBQSxDQUFVLEtBQVYsRUFBaUIsSUFBakIsQ0FBWDtBQUpKO0FBTUEsU0FBQSxTQUFBOztRQUNJLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBQSxDQUFVLEtBQVYsRUFBaUIsQ0FBakIsQ0FBWDtBQURKO1dBR0EsSUFBSSxVQUFKLENBQWUsR0FBQSxHQUFJLElBQUksQ0FBQyxJQUF4QixFQUErQixLQUEvQixFQUFzQyxLQUF0QztBQXBDSzs7QUE0Q1QsWUFBQSxHQUFlLFNBQUMsSUFBRDtBQUVYLFFBQUE7SUFBQSxLQUFBLEdBQVE7QUFDUjtBQUFBLFNBQUEsZ0RBQUE7O1FBQ0ksS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFBLENBQUssSUFBSSxDQUFDLE1BQU8sQ0FBQSxFQUFBLENBQWpCLENBQVg7QUFESjtXQUdBLElBQUksVUFBSixDQUFlLEdBQUEsR0FBSSxJQUFJLENBQUMsSUFBeEIsRUFBK0IsSUFBSSxDQUFDLElBQXBDLEVBQTBDLEtBQTFDO0FBTlc7O0FBY2YsV0FBQSxHQUFjLFNBQUMsSUFBRCxFQUFPLElBQVAsRUFBZSxDQUFmO0FBRVYsUUFBQTs7UUFGaUIsT0FBSzs7O1FBQUcsSUFBRTs7SUFFM0IsUUFBQSxHQUFXO0lBRVgsT0FBQSxHQUFVLElBQUksQ0FBQyxPQUFMLENBQUE7QUFFVjtBQUFBLFNBQUEsZ0RBQUE7O1FBRUksSUFBRyxDQUFDLENBQUMsTUFBRixLQUFZLENBQVosSUFBaUIsQ0FBQSxLQUFLLENBQXpCO0FBQ0ksaUJBQUEscUNBQUE7O2dCQUNJLElBQUEsR0FBTyxLQUFBLENBQU0sT0FBUSxDQUFBLEVBQUEsQ0FBZCxFQUFtQixJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBL0I7Z0JBQ1AsSUFBQSxHQUFPLEtBQUEsQ0FBTSxPQUFRLENBQUEsRUFBQSxDQUFkLEVBQW1CLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUEvQjtnQkFDUCxRQUFTLENBQUEsQ0FBQSxDQUFULEdBQWMsTUFBQSxDQUFPLE9BQVEsQ0FBQSxFQUFBLENBQWYsRUFBb0IsSUFBcEIsRUFBMEIsSUFBQSxHQUFPLElBQWpDO0FBSGxCLGFBREo7O0FBRko7SUFRQSxLQUFBLEdBQVE7Ozs7a0JBQXdCLENBQUMsR0FBekIsQ0FBNkIsU0FBQyxDQUFEO0FBQU8sWUFBQTtxREFBYyxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUE7SUFBakMsQ0FBN0I7V0FFUixJQUFJLFVBQUosQ0FBZSxHQUFBLEdBQUksSUFBSSxDQUFDLElBQXhCLEVBQStCLElBQUksQ0FBQyxJQUFwQyxFQUEwQyxLQUExQztBQWhCVTs7QUF3QmQsSUFBQSxHQUFPLFNBQUMsSUFBRDtBQUVILFFBQUE7SUFBQSxJQUFBLEdBQU8sSUFBSSxJQUFKLENBQUE7SUFFUCxJQUFBLEdBQU87QUFDUCxTQUFTLGdHQUFUO1FBQ0ksSUFBSyxDQUFBLENBQUEsQ0FBTCxHQUFVO0FBRGQ7QUFHQSxTQUFTLDhGQUFUO1FBQ0ksQ0FBQSxHQUFJLElBQUksQ0FBQyxJQUFLLENBQUEsQ0FBQTtRQUNkLEVBQUEsR0FBSyxDQUFFLFVBQUUsQ0FBQSxDQUFBO0FBQ1QsYUFBQSxtQ0FBQTs7WUFDSSxJQUFLLENBQUEsRUFBQSxDQUFJLENBQUEsR0FBQSxHQUFJLEVBQUosQ0FBVCxHQUFxQixFQUFBLEdBQUc7WUFDeEIsRUFBQSxHQUFLO0FBRlQ7QUFISjtJQU9BLE9BQUEsR0FBVSxJQUFJLENBQUMsT0FBTCxDQUFBO0FBRVYsU0FBUyw4RkFBVDtRQUNJLElBQUksQ0FBQyxJQUFMLENBQVUsRUFBQSxHQUFHLENBQWIsRUFBaUIsT0FBUSxDQUFBLENBQUEsQ0FBekI7QUFESjtBQUdBLFNBQVMsOEZBQVQ7UUFDSSxDQUFBLEdBQUksSUFBSSxDQUFDLElBQUssQ0FBQSxDQUFBO1FBQ2QsRUFBQSxHQUFLLENBQUUsVUFBRSxDQUFBLENBQUE7QUFDVCxhQUFBLHFDQUFBOztZQUNJLElBQUksQ0FBQyxJQUFMLENBQVUsRUFBVixFQUFjLElBQUssQ0FBQSxFQUFBLENBQUksQ0FBQSxHQUFBLEdBQUksRUFBSixDQUF2QixFQUFrQyxFQUFBLEdBQUcsQ0FBckM7WUFDQSxFQUFBLEdBQUs7QUFGVDtBQUhKO0lBT0EsS0FBQSxHQUFRLElBQUksQ0FBQyxNQUFMLENBQUE7SUFFUixLQUFBLEdBQVE7QUFDUjtBQUFBLFNBQUEsd0NBQUE7O1FBQ0ksQ0FBQSxHQUFJLFNBQUEsQ0FBVSxJQUFJLENBQUMsSUFBSyxDQUFBLENBQUUsQ0FBQSxDQUFBLENBQUYsQ0FBcEIsRUFBMkIsSUFBSSxDQUFDLElBQUssQ0FBQSxDQUFFLENBQUEsQ0FBQSxDQUFGLENBQXJDLEVBQTRDLElBQUksQ0FBQyxJQUFLLENBQUEsQ0FBRSxDQUFBLENBQUEsQ0FBRixDQUF0RDtRQUNKLEtBQU0sQ0FBQSxDQUFBLENBQU4sR0FBVztBQUZmO0lBR0EsS0FBSyxDQUFDLElBQU4sR0FBYTtJQUViLElBQUcsSUFBSSxDQUFDLElBQUssQ0FBQSxDQUFBLENBQVYsS0FBZ0IsR0FBbkI7UUFDSSxLQUFLLENBQUMsSUFBTixHQUFhLEdBQUEsR0FBSSxJQUFJLENBQUMsS0FEMUI7S0FBQSxNQUFBO1FBR0ksS0FBSyxDQUFDLElBQU4sR0FBYSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQVYsQ0FBZ0IsQ0FBaEIsRUFIakI7O1dBS0E7QUF4Q0c7O0FBbURQLEdBQUEsR0FBTSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQXFCLENBQXJCO0FBRUYsUUFBQTs7UUFGUyxXQUFTOzs7UUFBSyxJQUFFOztJQUV6QixRQUFBLEdBQVcsS0FBQSxDQUFNLENBQUMsQ0FBUCxFQUFTLEVBQVQsRUFBWSxRQUFaO0lBRVgsSUFBRyxRQUFBLEdBQVcsQ0FBZDtRQUNJLFFBQUEsR0FBVyxRQUFBLEdBQVcsSUFBSSxDQUFDLFdBQUwsQ0FBQSxFQUQxQjs7SUFHQSxJQUFBLEdBQU8sSUFBSSxJQUFKLENBQUE7QUFDUCxTQUFTLGdHQUFUO1FBQ0ksSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFBLEdBQUksQ0FBZCxFQUFrQixJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBOUI7QUFESjtJQUdBLE9BQUEsR0FBVSxJQUFJLENBQUMsT0FBTCxDQUFBO0lBQ1YsT0FBQSxHQUFVLElBQUksQ0FBQyxPQUFMLENBQUE7SUFDVixRQUFBLEdBQVc7QUFDWCxTQUFTLDhGQUFUO1FBQ0ksQ0FBQSxHQUFJLElBQUksQ0FBQyxJQUFLLENBQUEsQ0FBQTtRQUNkLEVBQUEsR0FBSyxHQUFBLEdBQUksQ0FBRSxDQUFBLENBQUMsQ0FBQyxNQUFGLEdBQVMsQ0FBVDtBQUNYLGFBQUEsbUNBQUE7O1lBQ0ksRUFBQSxHQUFLLEdBQUEsR0FBSTtZQUNULElBQUcsQ0FBQyxDQUFDLE1BQUYsS0FBWSxDQUFaLElBQWlCLENBQUEsS0FBSyxDQUF6QjtnQkFDSSxRQUFBLEdBQVc7Z0JBQ1gsSUFBQSxHQUFPLE1BQUEsR0FBTztnQkFDZCxLQUFBLEdBQVEsRUFBQSxHQUFHLENBQUgsR0FBTztnQkFFZixJQUFJLENBQUMsSUFBTCxDQUFVLElBQVYsRUFBZ0IsR0FBQSxDQUFJLE9BQVEsQ0FBQSxDQUFBLENBQVosRUFBZ0IsSUFBQSxDQUFLLFFBQUwsRUFBZSxPQUFRLENBQUEsQ0FBQSxDQUF2QixDQUFoQixDQUFoQjtnQkFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLEtBQVYsRUFBbUIsRUFBbkIsRUFBeUIsRUFBekI7Z0JBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFWLEVBQW1CLEVBQW5CLEVBQXVCLElBQXZCO2dCQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBVixFQUFpQixJQUFqQixFQUF5QixFQUF6QixFQVJKO2FBQUEsTUFBQTtnQkFVSSxJQUFJLENBQUMsSUFBTCxDQUFVLEVBQUEsR0FBRyxDQUFiLEVBQWtCLEVBQWxCLEVBQXNCLEVBQXRCLEVBVko7O1lBWUEsRUFBQSxHQUFLO0FBZFQ7QUFISjtJQW1CQSxJQUFHLENBQUksUUFBUDtRQUNJLElBQUEsQ0FBSyxLQUFBLEdBQU0sQ0FBTixHQUFRLDhCQUFiLEVBREo7O1dBR0EsSUFBSSxDQUFDLE1BQUwsQ0FBWSxHQUFBLEdBQUksQ0FBSixHQUFRLElBQUksQ0FBQyxJQUF6QjtBQXBDRTs7QUE0Q04sUUFBQSxHQUFXLFNBQUMsSUFBRCxFQUFPLE1BQVA7QUFFUCxRQUFBOztRQUZjLFNBQU87O0lBRXJCLE1BQUEsR0FBUyxLQUFBLENBQU0sQ0FBTixFQUFRLENBQVIsRUFBVSxNQUFWO0lBQ1QsT0FBQSxHQUFVO0lBRVYsUUFBQSxHQUFjLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDeEIsV0FBQSxHQUFjLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDMUIsU0FBQSxHQUFjLElBQUksQ0FBQyxTQUFMLENBQUE7SUFFZCxLQUFBLEdBQVEsR0FBQSxHQUFNLE1BQU4sR0FBZSxJQUFJLENBQUMsYUFBTCxDQUFBO0FBRXZCLFNBQW1CLDZHQUFuQjs7WUFFSSxPQUFRLENBQUEsV0FBQTs7WUFBUixPQUFRLENBQUEsV0FBQSxJQUFnQjs7UUFDeEIsSUFBQSxHQUFPO1FBRVAsRUFBQSxHQUFLLFNBQVUsQ0FBQSxXQUFBLENBQVksQ0FBQztBQUM1QixhQUFVLGtGQUFWO1lBQ0ksRUFBQSxHQUFLLFNBQVUsQ0FBQSxXQUFBLENBQWEsQ0FBQSxFQUFBO1lBQzVCLE9BQVEsQ0FBQSxXQUFBLENBQWEsQ0FBQSxFQUFBLENBQXJCLEdBQTJCLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDdkMsRUFBQSxHQUFLLElBQUksQ0FBQyxJQUFMLENBQVUsV0FBVixFQUF1QixFQUF2QjtZQUNMLEVBQUUsQ0FBQyxTQUFILENBQUE7WUFDQSxFQUFFLENBQUMsWUFBSCxDQUFnQixLQUFoQjtZQUNBLEVBQUUsQ0FBQyxVQUFILENBQWMsSUFBSSxDQUFDLElBQUwsQ0FBVSxXQUFWLENBQWQ7WUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBdEI7WUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQVosQ0FBaUIsQ0FBQyxFQUFFLENBQUMsQ0FBSixFQUFPLEVBQUUsQ0FBQyxDQUFWLEVBQWEsRUFBRSxDQUFDLENBQWhCLENBQWpCO0FBUko7UUFVQSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQVYsQ0FBZSxJQUFmO0FBaEJKO0FBa0JBLFNBQVUsd0ZBQVY7UUFDSSxJQUFBLEdBQU8sSUFBSSxDQUFDLElBQUssQ0FBQSxFQUFBO1FBQ2pCLE9BQUEsR0FBVTtBQUNWLGFBQVUsMkZBQVY7WUFDSSxFQUFBLEdBQUssQ0FBQyxFQUFBLEdBQUcsQ0FBSixDQUFBLEdBQVMsSUFBSSxDQUFDO1lBQ25CLE9BQU8sQ0FBQyxJQUFSLENBQWEsT0FBUSxDQUFBLElBQUssQ0FBQSxFQUFBLENBQUwsQ0FBVSxDQUFBLElBQUssQ0FBQSxFQUFBLENBQUwsQ0FBL0I7WUFDQSxJQUFHLE1BQUEsR0FBUyxDQUFaO2dCQUNJLE9BQU8sQ0FBQyxJQUFSLENBQWEsT0FBUSxDQUFBLElBQUssQ0FBQSxFQUFBLENBQUwsQ0FBVSxDQUFBLElBQUssQ0FBQSxFQUFBLENBQUwsQ0FBL0IsRUFESjs7QUFISjtRQUtBLElBQUksQ0FBQyxJQUFLLENBQUEsRUFBQSxDQUFWLEdBQWdCO0FBUnBCO0lBVUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFaLENBQW1CLENBQW5CLEVBQXNCLFdBQXRCO0FBQ0E7QUFBQSxTQUFBLHNDQUFBOztBQUNJLGFBQVMseUZBQVQ7WUFDSSxJQUFLLENBQUEsQ0FBQSxDQUFMLElBQVc7QUFEZjtBQURKO1dBSUE7QUE1Q087O0FBc0RYLElBQUEsR0FBTyxTQUFDLElBQUQ7QUFFSCxRQUFBO0lBQUEsSUFBQSxHQUFPLElBQUksSUFBSixDQUFBO0FBRVAsU0FBUyw4RkFBVDtRQUNJLENBQUEsR0FBSSxJQUFJLENBQUMsSUFBSyxDQUFBLENBQUE7UUFDZCxPQUFXLENBQUMsQ0FBQyxLQUFGLENBQVEsQ0FBQyxDQUFULENBQVgsRUFBQyxZQUFELEVBQUs7QUFDTCxhQUFBLG1DQUFBOztZQUNJLElBQUcsRUFBQSxHQUFLLEVBQVI7Z0JBQ0ksSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFBLENBQVEsRUFBUixFQUFXLEVBQVgsQ0FBVixFQUEwQixRQUFBLENBQVMsSUFBSSxDQUFDLE1BQU8sQ0FBQSxFQUFBLENBQXJCLEVBQTBCLElBQUksQ0FBQyxNQUFPLENBQUEsRUFBQSxDQUF0QyxDQUExQixFQURKOztZQUdBLElBQUksQ0FBQyxJQUFMLENBQVUsTUFBQSxHQUFPLENBQWpCLEVBQXNCLE9BQUEsQ0FBUSxFQUFSLEVBQVcsRUFBWCxDQUF0QixFQUFzQyxPQUFBLENBQVEsRUFBUixFQUFXLEVBQVgsQ0FBdEM7WUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLE1BQUEsR0FBTyxFQUFqQixFQUFzQixPQUFBLENBQVEsRUFBUixFQUFXLEVBQVgsQ0FBdEIsRUFBc0MsT0FBQSxDQUFRLEVBQVIsRUFBVyxFQUFYLENBQXRDO1lBRUEsT0FBVyxDQUFDLEVBQUQsRUFBSyxFQUFMLENBQVgsRUFBQyxZQUFELEVBQUs7QUFQVDtBQUhKO1dBWUEsSUFBSSxDQUFDLE1BQUwsQ0FBWSxHQUFBLEdBQUksSUFBSSxDQUFDLElBQXJCO0FBaEJHOztBQWtCUCxLQUFBLEdBQVEsU0FBQyxJQUFELEVBQU8sTUFBUDtBQUVKLFFBQUE7O1FBRlcsU0FBTzs7SUFFbEIsQ0FBQSxHQUFJLFFBQUEsQ0FBUyxJQUFBLENBQUssSUFBTCxDQUFULEVBQXFCLE1BQXJCO0lBQ0osQ0FBQyxDQUFDLElBQUYsR0FBUyxHQUFBLEdBQUksSUFBSSxDQUFDO1dBQ2xCO0FBSkk7O0FBWVIsT0FBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLE1BQVA7QUFFTixRQUFBOztRQUZhLFNBQU87O0lBRXBCLE1BQUEsR0FBVSxLQUFBLENBQU0sS0FBTixFQUFZLEtBQVosRUFBa0IsTUFBbEI7SUFDVixJQUFBLEdBQVUsSUFBSSxJQUFKLENBQUE7SUFDVixPQUFBLEdBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBQTtJQUNWLE9BQUEsR0FBVSxJQUFJLENBQUMsT0FBTCxDQUFBO0lBQ1YsS0FBQSxHQUFVLElBQUksQ0FBQyxLQUFMLENBQUE7SUFFVixhQUFBLEdBQWdCO0FBRWhCLFNBQUEsdUNBQUE7O1FBQ0ksRUFBQSxHQUFLLElBQUksQ0FBQyxNQUFPLENBQUEsSUFBSyxDQUFBLENBQUEsQ0FBTDtRQUNqQixFQUFBLEdBQUssSUFBSSxDQUFDLE1BQU8sQ0FBQSxJQUFLLENBQUEsQ0FBQSxDQUFMO1FBQ2pCLEVBQUEsR0FBSyxJQUFBLENBQUssR0FBQSxDQUFJLEVBQUosRUFBUSxFQUFSLENBQUw7UUFFTCxFQUFBLEdBQUssSUFBQSxDQUFLLEdBQUEsQ0FBSSxJQUFJLENBQUMsTUFBTyxDQUFBLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxFQUFSLENBQWhCLEVBQTZCLEVBQTdCLENBQUw7UUFDTCxFQUFBLEdBQUssSUFBQSxDQUFLLEdBQUEsQ0FBSSxJQUFJLENBQUMsTUFBTyxDQUFBLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxFQUFSLENBQWhCLEVBQTZCLEVBQTdCLENBQUw7UUFDTCxFQUFBLEdBQUssTUFBQSxDQUFPLENBQUMsRUFBRCxFQUFLLElBQUEsQ0FBSyxHQUFMLEVBQVUsR0FBQSxDQUFJLEdBQUEsQ0FBSSxFQUFKLEVBQVEsRUFBUixDQUFKLEVBQWlCLEdBQUEsQ0FBSSxFQUFKLEVBQVEsRUFBUixDQUFqQixDQUFWLENBQUwsQ0FBUCxFQUNPLENBQUMsRUFBRCxFQUFLLElBQUEsQ0FBSyxHQUFMLEVBQVUsR0FBQSxDQUFJLEdBQUEsQ0FBSSxFQUFKLEVBQVEsRUFBUixDQUFKLEVBQWlCLEdBQUEsQ0FBSSxFQUFKLEVBQVEsRUFBUixDQUFqQixDQUFWLENBQUwsQ0FEUDtRQUdMLEVBQUEsR0FBSyxHQUFBLENBQUksR0FBQSxDQUFJLEVBQUosRUFBUSxNQUFBLENBQU8sQ0FBQyxFQUFELEVBQUssR0FBQSxDQUFJLEVBQUosRUFBUSxFQUFSLENBQUwsQ0FBUCxFQUEwQixDQUFDLEVBQUQsRUFBSyxHQUFBLENBQUksRUFBSixFQUFRLEVBQVIsQ0FBTCxDQUExQixDQUFSLENBQUo7UUFDTCxhQUFBLEdBQWdCLEdBQUEsQ0FBSSxhQUFKLEVBQW1CLEVBQW5CO1FBRWhCLEVBQUEsR0FBSyxHQUFBLENBQUksR0FBQSxDQUFJLEVBQUosRUFBUSxNQUFBLENBQU8sQ0FBQyxFQUFELEVBQUssR0FBQSxDQUFJLEVBQUosRUFBUSxFQUFSLENBQUwsQ0FBUCxFQUEwQixDQUFDLEVBQUQsRUFBSyxHQUFBLENBQUksRUFBSixFQUFRLEVBQVIsQ0FBTCxDQUExQixDQUFSLENBQUo7UUFDTCxhQUFBLEdBQWdCLEdBQUEsQ0FBSSxhQUFKLEVBQW1CLEVBQW5CO0FBZHBCO0lBZ0JBLGFBQUEsSUFBaUI7SUFFakIsS0FBQSxHQUFRO0FBQ1IsU0FBQSx5Q0FBQTs7UUFDSSxFQUFBLEdBQU0sSUFBSSxDQUFDLE1BQU8sQ0FBQSxJQUFLLENBQUEsQ0FBQSxDQUFMO1FBQ2xCLEVBQUEsR0FBTSxJQUFJLENBQUMsTUFBTyxDQUFBLElBQUssQ0FBQSxDQUFBLENBQUw7UUFDbEIsRUFBQSxHQUFLLENBQ0QsR0FBQSxDQUFJLEVBQUosRUFBUSxJQUFBLENBQUssYUFBTCxFQUFvQixJQUFBLENBQUssR0FBQSxDQUFJLElBQUksQ0FBQyxNQUFPLENBQUEsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLEVBQVIsQ0FBaEIsRUFBNkIsRUFBN0IsQ0FBTCxDQUFwQixDQUFSLENBREMsRUFFRCxHQUFBLENBQUksRUFBSixFQUFRLElBQUEsQ0FBSyxhQUFMLEVBQW9CLElBQUEsQ0FBSyxHQUFBLENBQUksSUFBSSxDQUFDLE1BQU8sQ0FBQSxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsRUFBUixDQUFoQixFQUE2QixFQUE3QixDQUFMLENBQXBCLENBQVIsQ0FGQztRQUdMLEVBQUEsR0FBSyxDQUNELEdBQUEsQ0FBSSxFQUFKLEVBQVEsSUFBQSxDQUFLLGFBQUwsRUFBb0IsSUFBQSxDQUFLLEdBQUEsQ0FBSSxJQUFJLENBQUMsTUFBTyxDQUFBLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxFQUFSLENBQWhCLEVBQTZCLEVBQTdCLENBQUwsQ0FBcEIsQ0FBUixDQURDLEVBRUQsR0FBQSxDQUFJLEVBQUosRUFBUSxJQUFBLENBQUssYUFBTCxFQUFvQixJQUFBLENBQUssR0FBQSxDQUFJLElBQUksQ0FBQyxNQUFPLENBQUEsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLEVBQVIsQ0FBaEIsRUFBNkIsRUFBN0IsQ0FBTCxDQUFwQixDQUFSLENBRkM7UUFJTCxLQUFNLENBQUcsSUFBSyxDQUFBLENBQUEsQ0FBTixHQUFTLEdBQVQsR0FBWSxJQUFLLENBQUEsQ0FBQSxDQUFqQixHQUFvQixHQUF0QixDQUFOLEdBQWtDO1FBQ2xDLEtBQU0sQ0FBRyxJQUFLLENBQUEsQ0FBQSxDQUFOLEdBQVMsR0FBVCxHQUFZLElBQUssQ0FBQSxDQUFBLENBQWpCLEdBQW9CLEdBQXRCLENBQU4sR0FBa0M7UUFDbEMsS0FBTSxDQUFHLElBQUssQ0FBQSxDQUFBLENBQU4sR0FBUyxHQUFULEdBQVksSUFBSyxDQUFBLENBQUEsQ0FBakIsR0FBb0IsR0FBdEIsQ0FBTixHQUFrQztRQUNsQyxLQUFNLENBQUcsSUFBSyxDQUFBLENBQUEsQ0FBTixHQUFTLEdBQVQsR0FBWSxJQUFLLENBQUEsQ0FBQSxDQUFqQixHQUFvQixHQUF0QixDQUFOLEdBQWtDO0FBYnRDO0FBZUEsU0FBQSx5Q0FBQTs7UUFDSSxFQUFBLEdBQU8sSUFBSSxDQUFDLE1BQU8sQ0FBQSxJQUFLLENBQUEsQ0FBQSxDQUFMO1FBQ25CLEVBQUEsR0FBTyxJQUFJLENBQUMsTUFBTyxDQUFBLElBQUssQ0FBQSxDQUFBLENBQUw7UUFFbkIsRUFBQSxHQUFTLElBQUssQ0FBQSxDQUFBLENBQU4sR0FBUyxHQUFULEdBQVksSUFBSyxDQUFBLENBQUE7UUFDekIsR0FBQSxHQUFNLEVBQUEsR0FBRyxJQUFLLENBQUEsQ0FBQTtRQUNkLEdBQUEsR0FBTSxFQUFBLEdBQUcsSUFBSyxDQUFBLENBQUE7UUFFZCxHQUFBLEdBQVMsR0FBRCxHQUFLLEdBQUwsR0FBUSxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUM7UUFDeEIsR0FBQSxHQUFTLEdBQUQsR0FBSyxHQUFMLEdBQVEsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDO1FBQ3hCLEdBQUEsR0FBUyxHQUFELEdBQUssR0FBTCxHQUFRLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQztRQUN4QixHQUFBLEdBQVMsR0FBRCxHQUFLLEdBQUwsR0FBUSxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUM7UUFFeEIsRUFBQSxHQUFLLE1BQUEsQ0FBTyxLQUFNLENBQUcsSUFBSyxDQUFBLENBQUEsQ0FBTixHQUFTLEdBQVQsR0FBWSxJQUFLLENBQUEsQ0FBQSxDQUFqQixHQUFvQixHQUF0QixDQUFiLEVBQXdDLEtBQU0sQ0FBRyxJQUFLLENBQUEsQ0FBQSxDQUFOLEdBQVMsR0FBVCxHQUFZLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxFQUFwQixHQUF1QixHQUF6QixDQUE5QztRQUNMLEVBQUEsR0FBSyxNQUFBLENBQU8sS0FBTSxDQUFHLElBQUssQ0FBQSxDQUFBLENBQU4sR0FBUyxHQUFULEdBQVksSUFBSyxDQUFBLENBQUEsQ0FBakIsR0FBb0IsR0FBdEIsQ0FBYixFQUF3QyxLQUFNLENBQUcsSUFBSyxDQUFBLENBQUEsQ0FBTixHQUFTLEdBQVQsR0FBWSxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsRUFBcEIsR0FBdUIsR0FBekIsQ0FBOUM7UUFDTCxFQUFBLEdBQUssTUFBQSxDQUFPLEtBQU0sQ0FBRyxJQUFLLENBQUEsQ0FBQSxDQUFOLEdBQVMsR0FBVCxHQUFZLElBQUssQ0FBQSxDQUFBLENBQWpCLEdBQW9CLEdBQXRCLENBQWIsRUFBd0MsS0FBTSxDQUFHLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxFQUFULEdBQVksR0FBWixHQUFlLElBQUssQ0FBQSxDQUFBLENBQXBCLEdBQXVCLEdBQXpCLENBQTlDO1FBQ0wsRUFBQSxHQUFLLE1BQUEsQ0FBTyxLQUFNLENBQUcsSUFBSyxDQUFBLENBQUEsQ0FBTixHQUFTLEdBQVQsR0FBWSxJQUFLLENBQUEsQ0FBQSxDQUFqQixHQUFvQixHQUF0QixDQUFiLEVBQXdDLEtBQU0sQ0FBRyxJQUFLLENBQUEsQ0FBQSxDQUFFLENBQUMsRUFBVCxHQUFZLEdBQVosR0FBZSxJQUFLLENBQUEsQ0FBQSxDQUFwQixHQUF1QixHQUF6QixDQUE5QztRQUVMLElBQUEsR0FBTyxRQUFBLENBQVMsRUFBVCxFQUFhLEVBQWI7UUFDUCxJQUFBLEdBQU8sUUFBQSxDQUFTLEVBQVQsRUFBYSxFQUFiO1FBQ1AsSUFBQSxHQUFPLFFBQUEsQ0FBUyxJQUFULEVBQWUsSUFBZjtRQUNQLEdBQUEsR0FBTyxLQUFBLENBQU0sR0FBQSxDQUFJLElBQUosRUFBUyxJQUFULENBQU4sRUFBc0IsR0FBQSxDQUFJLEVBQUosRUFBTyxFQUFQLENBQXRCO1FBRVAsSUFBQSxHQUFPLFFBQUEsQ0FBUyxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTCxDQUFULEVBQWtCLEVBQWxCLEVBQXNCLElBQXRCLEVBQTRCLEdBQTVCO1FBQ1AsSUFBQSxHQUFPLFFBQUEsQ0FBUyxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTCxDQUFULEVBQWtCLEVBQWxCLEVBQXNCLElBQXRCLEVBQTRCLEdBQTVCO1FBRVAsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFWLEVBQWUsSUFBZjtRQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBVixFQUFlLElBQWY7UUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQVYsRUFBZSxFQUFmO1FBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFWLEVBQWUsRUFBZjtRQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBVixFQUFlLEVBQWY7UUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQVYsRUFBZSxFQUFmO1FBRUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxFQUFWLEVBQWMsR0FBZCxFQUFtQixHQUFuQjtRQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsRUFBVixFQUFjLEdBQWQsRUFBbUIsR0FBbkI7UUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLEVBQVYsRUFBYyxHQUFkLEVBQW1CLEdBQW5CO1FBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxFQUFWLEVBQWMsR0FBZCxFQUFtQixHQUFuQjtRQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsRUFBVixFQUFjLEdBQWQsRUFBbUIsR0FBbkI7UUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLEVBQVYsRUFBYyxHQUFkLEVBQW1CLEdBQW5CO1FBRUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxFQUFBLEdBQUcsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLEVBQXJCLEVBQTBCLEdBQTFCLEVBQStCLEdBQS9CO1FBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxFQUFBLEdBQUcsSUFBSyxDQUFBLENBQUEsQ0FBRSxDQUFDLEVBQXJCLEVBQTBCLEdBQTFCLEVBQStCLEdBQS9CO0FBekNKO1dBMkNBLElBQUksQ0FBQyxNQUFMLENBQVksR0FBQSxHQUFJLElBQUksQ0FBQyxJQUFyQjtBQXZGTTs7QUErRlYsS0FBQSxHQUFRLFNBQUMsSUFBRCxFQUFPLENBQVA7QUFFSixRQUFBOztRQUZXLElBQUU7O0lBRWIsSUFBQSxHQUFPLElBQUksSUFBSixDQUFBO0FBRVAsU0FBUyxnR0FBVDtRQUNJLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBQSxHQUFJLENBQWQsRUFBa0IsSUFBQSxDQUFLLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQSxDQUFqQixDQUFsQjtBQURKO0lBR0EsT0FBQSxHQUFVLElBQUksQ0FBQyxPQUFMLENBQUE7QUFFVixTQUFTLDhGQUFUO1FBQ0ksQ0FBQSxHQUFJLElBQUksQ0FBQyxJQUFLLENBQUEsQ0FBQTtRQUNkLE9BQVcsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxDQUFDLENBQVQsQ0FBWCxFQUFDLFlBQUQsRUFBSztBQUNMLGFBQVMsc0ZBQVQ7WUFDSSxDQUFBLEdBQUksQ0FBRSxDQUFBLENBQUE7WUFDTixFQUFBLEdBQUs7WUFDTCxJQUFBLEdBQU8sUUFBQSxDQUFTLElBQUksQ0FBQyxNQUFPLENBQUEsRUFBQSxDQUFyQixFQUEwQixJQUFJLENBQUMsTUFBTyxDQUFBLEVBQUEsQ0FBdEM7WUFDUCxJQUFJLENBQUMsSUFBTCxDQUFVLEVBQUEsR0FBRyxHQUFILEdBQU8sRUFBakIsRUFBcUIsSUFBckI7WUFDQSxPQUFBLEdBQVUsUUFBQSxHQUFTLENBQVQsR0FBVyxHQUFYLEdBQWM7WUFDeEIsT0FBQSxHQUFVLFFBQUEsR0FBUyxDQUFULEdBQVcsR0FBWCxHQUFjO1lBQ3hCLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixFQUFtQixJQUFBLENBQUssUUFBQSxDQUFTLE9BQVEsQ0FBQSxDQUFBLENBQWpCLEVBQXFCLElBQXJCLENBQUwsQ0FBbkI7WUFDQSxLQUFBLEdBQVEsQ0FBQSxHQUFFLEdBQUYsR0FBTTtZQUNkLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBVixFQUFpQixPQUFqQixFQUE0QixFQUFBLEdBQUcsR0FBSCxHQUFPLEVBQW5DO1lBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFWLEVBQWlCLEVBQUEsR0FBRyxHQUFILEdBQU8sRUFBeEIsRUFBNEIsRUFBQSxHQUFHLEdBQUgsR0FBTyxFQUFuQztZQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBVixFQUFpQixFQUFBLEdBQUcsR0FBSCxHQUFPLEVBQXhCLEVBQTRCLEdBQUEsR0FBSSxFQUFoQztZQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBVixFQUFpQixHQUFBLEdBQUksRUFBckIsRUFBNEIsRUFBQSxHQUFHLEdBQUgsR0FBTyxFQUFuQztZQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBVixFQUFpQixFQUFBLEdBQUcsR0FBSCxHQUFPLEVBQXhCLEVBQTRCLE9BQTVCO1lBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFWLEVBQWlCLE9BQWpCLEVBQTRCLE9BQTVCO1lBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFBLEdBQUksQ0FBZCxFQUFtQixPQUFuQixFQUE0QixPQUE1QjtZQUVBLE9BQVcsQ0FBQyxFQUFELEVBQUssRUFBTCxDQUFYLEVBQUMsWUFBRCxFQUFLO0FBakJUO0FBSEo7V0FzQkEsWUFBQSxDQUFhLElBQUksQ0FBQyxNQUFMLENBQVksR0FBQSxHQUFJLElBQUksQ0FBQyxJQUFyQixDQUFiO0FBL0JJOztBQXVDUixJQUFBLEdBQU8sU0FBQyxJQUFEO0FBRUgsUUFBQTtJQUFBLElBQUEsR0FBTyxJQUFJLElBQUosQ0FBQTtBQUVQLFNBQVMsZ0dBQVQ7UUFDSSxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQUEsR0FBSSxDQUFkLEVBQWtCLElBQUEsQ0FBSyxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBakIsQ0FBbEI7QUFESjtJQUdBLE9BQUEsR0FBVSxJQUFJLENBQUMsT0FBTCxDQUFBO0FBQ1YsU0FBUyw4RkFBVDtRQUNJLENBQUEsR0FBSSxJQUFJLENBQUMsSUFBSyxDQUFBLENBQUE7UUFDZCxJQUFJLENBQUMsSUFBTCxDQUFVLFFBQUEsR0FBUyxDQUFuQixFQUF1QixJQUFBLENBQUssT0FBUSxDQUFBLENBQUEsQ0FBYixDQUF2QjtBQUZKO0FBSUEsU0FBUyw4RkFBVDtRQUNJLENBQUEsR0FBSSxJQUFJLENBQUMsSUFBSyxDQUFBLENBQUE7UUFDZCxPQUFXLENBQUMsQ0FBQyxLQUFGLENBQVEsQ0FBQyxDQUFULENBQVgsRUFBQyxZQUFELEVBQUs7QUFDTCxhQUFTLHNGQUFUO1lBQ0ksQ0FBQSxHQUFJLENBQUUsQ0FBQSxDQUFBO1lBQ04sRUFBQSxHQUFLO1lBQ0wsSUFBSSxDQUFDLElBQUwsQ0FBVSxFQUFBLEdBQUcsR0FBSCxHQUFPLEVBQWpCLEVBQXFCLFFBQUEsQ0FBUyxJQUFJLENBQUMsTUFBTyxDQUFBLEVBQUEsQ0FBckIsRUFBeUIsSUFBSSxDQUFDLE1BQU8sQ0FBQSxFQUFBLENBQXJDLENBQXJCO1lBQ0EsS0FBQSxHQUFRLENBQUEsR0FBRSxHQUFGLEdBQU07WUFDZCxJQUFJLENBQUMsSUFBTCxDQUFVLEtBQVYsRUFBaUIsUUFBQSxHQUFTLENBQTFCLEVBQStCLEVBQUEsR0FBRyxHQUFILEdBQU8sRUFBdEM7WUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLEtBQVYsRUFBaUIsRUFBQSxHQUFHLEdBQUgsR0FBTyxFQUF4QixFQUE2QixFQUFBLEdBQUcsR0FBSCxHQUFPLEVBQXBDO1lBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFWLEVBQWlCLEVBQUEsR0FBRyxHQUFILEdBQU8sRUFBeEIsRUFBNkIsR0FBQSxHQUFJLEVBQWpDO1lBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFWLEVBQWlCLEdBQUEsR0FBSSxFQUFyQixFQUE4QixFQUFBLEdBQUcsR0FBSCxHQUFPLEVBQXJDO1lBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFWLEVBQWlCLEVBQUEsR0FBRyxHQUFILEdBQU8sRUFBeEIsRUFBNkIsUUFBQSxHQUFTLENBQXRDO1lBQ0EsT0FBVyxDQUFDLEVBQUQsRUFBSyxFQUFMLENBQVgsRUFBQyxZQUFELEVBQUs7QUFWVDtBQUhKO1dBZUEsWUFBQSxDQUFhLElBQUksQ0FBQyxNQUFMLENBQVksR0FBQSxHQUFJLElBQUksQ0FBQyxJQUFyQixDQUFiO0FBM0JHOztBQW1DUCxNQUFBLEdBQVMsU0FBQyxJQUFEO0FBRUwsUUFBQTtJQUFBLElBQUEsR0FBTyxJQUFJLElBQUosQ0FBQTtBQUVQLFNBQVMsOEZBQVQ7UUFDSSxDQUFBLEdBQUksSUFBSSxDQUFDLElBQUssQ0FBQSxDQUFBO1FBQ2QsUUFBQSxHQUFXLFlBQUEsQ0FBYSxDQUFDLENBQUMsR0FBRixDQUFNLFNBQUMsR0FBRDttQkFBUyxJQUFJLENBQUMsTUFBTyxDQUFBLEdBQUE7UUFBckIsQ0FBTixDQUFiO1FBRVgsT0FBVyxDQUFDLENBQUMsS0FBRixDQUFRLENBQUMsQ0FBVCxDQUFYLEVBQUMsWUFBRCxFQUFLO0FBQ0wsYUFBQSxtQ0FBQTs7WUFDSSxLQUFBLEdBQVEsUUFBQSxDQUFTLElBQUksQ0FBQyxNQUFPLENBQUEsRUFBQSxDQUFyQixFQUEwQixJQUFJLENBQUMsTUFBTyxDQUFBLEVBQUEsQ0FBdEM7WUFDUixPQUFBLEdBQVUsUUFBQSxDQUFTLEtBQVQsRUFBZ0IsUUFBaEI7WUFDVixJQUFJLENBQUMsSUFBTCxDQUFVLE9BQUEsQ0FBUSxFQUFSLEVBQVcsRUFBWCxDQUFWLEVBQTBCLEtBQTFCO1lBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxDQUFBLFFBQUEsR0FBUyxDQUFULEdBQVcsR0FBWCxDQUFBLEdBQWdCLE9BQUEsQ0FBUSxFQUFSLEVBQVcsRUFBWCxDQUExQixFQUEwQyxPQUExQztZQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsRUFBQSxHQUFHLEVBQWIsRUFBa0IsSUFBSSxDQUFDLE1BQU8sQ0FBQSxFQUFBLENBQTlCO1lBRUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFBLEdBQUksQ0FBSixHQUFNLEdBQU4sR0FBUyxFQUFuQixFQUF5QixDQUFBLFFBQUEsR0FBUyxDQUFULEdBQVcsR0FBWCxDQUFBLEdBQWMsT0FBQSxDQUFRLEVBQVIsRUFBWSxFQUFaLENBQXZDLEVBQXdELE9BQUEsQ0FBUSxFQUFSLEVBQVksRUFBWixDQUF4RDtZQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBQSxHQUFJLENBQUosR0FBTSxHQUFOLEdBQVMsRUFBbkIsRUFBeUIsT0FBQSxDQUFRLEVBQVIsRUFBWSxFQUFaLENBQXpCLEVBQTBDLEVBQUEsR0FBRyxFQUE3QztZQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBQSxHQUFJLENBQUosR0FBTSxHQUFOLEdBQVMsRUFBbkIsRUFBeUIsRUFBQSxHQUFHLEVBQTVCLEVBQWtDLE9BQUEsQ0FBUSxFQUFSLEVBQVksRUFBWixDQUFsQztZQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBQSxHQUFJLENBQUosR0FBTSxHQUFOLEdBQVMsRUFBbkIsRUFBeUIsT0FBQSxDQUFRLEVBQVIsRUFBWSxFQUFaLENBQXpCLEVBQTBDLENBQUEsUUFBQSxHQUFTLENBQVQsR0FBVyxHQUFYLENBQUEsR0FBYyxPQUFBLENBQVEsRUFBUixFQUFZLEVBQVosQ0FBeEQ7WUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQUEsR0FBSSxDQUFKLEdBQU0sR0FBTixHQUFTLEVBQW5CLEVBQXlCLENBQUEsUUFBQSxHQUFTLENBQVQsR0FBVyxHQUFYLENBQUEsR0FBYyxPQUFBLENBQVEsRUFBUixFQUFZLEVBQVosQ0FBdkMsRUFBd0QsQ0FBQSxRQUFBLEdBQVMsQ0FBVCxHQUFXLEdBQVgsQ0FBQSxHQUFjLE9BQUEsQ0FBUSxFQUFSLEVBQVksRUFBWixDQUF0RTtZQUVBLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBQSxHQUFRLENBQWxCLEVBQXVCLENBQUEsUUFBQSxHQUFTLENBQVQsR0FBVyxHQUFYLENBQUEsR0FBYyxPQUFBLENBQVEsRUFBUixFQUFZLEVBQVosQ0FBckMsRUFBc0QsQ0FBQSxRQUFBLEdBQVMsQ0FBVCxHQUFXLEdBQVgsQ0FBQSxHQUFjLE9BQUEsQ0FBUSxFQUFSLEVBQVksRUFBWixDQUFwRTtZQUVBLE9BQVcsQ0FBQyxFQUFELEVBQUssRUFBTCxDQUFYLEVBQUMsWUFBRCxFQUFLO0FBZlQ7QUFMSjtXQXNCQSxJQUFJLENBQUMsTUFBTCxDQUFZLEdBQUEsR0FBSSxJQUFJLENBQUMsSUFBckI7QUExQks7O0FBa0NULEtBQUEsR0FBUSxTQUFDLElBQUQsRUFBTyxLQUFQLEVBQWtCLE1BQWxCLEVBQStCLENBQS9CO0FBRUosUUFBQTs7UUFGVyxRQUFNOzs7UUFBSyxTQUFPLENBQUM7OztRQUFLLElBQUU7O0lBRXJDLEtBQUEsR0FBUSxLQUFBLENBQU0sSUFBTixFQUFXLElBQVgsRUFBZ0IsS0FBaEI7SUFDUixNQUFBLEdBQVMsR0FBQSxDQUFJLE1BQUosRUFBWSxLQUFaO0lBQ1QsSUFBQSxHQUFPLElBQUksSUFBSixDQUFBO0FBQ1AsU0FBUyxnR0FBVDtRQUNJLENBQUEsR0FBSSxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUE7UUFDaEIsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFBLEdBQUksQ0FBZCxFQUFrQixDQUFsQjtBQUZKO0lBSUEsT0FBQSxHQUFVLElBQUksQ0FBQyxPQUFMLENBQUE7SUFDVixPQUFBLEdBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBQTtBQUNWLFNBQVMsOEZBQVQ7UUFDSSxDQUFBLEdBQUksSUFBSSxDQUFDLElBQUssQ0FBQSxDQUFBO1FBQ2QsSUFBRyxDQUFDLENBQUMsTUFBRixLQUFZLENBQVosSUFBaUIsQ0FBQSxLQUFLLENBQXpCO0FBQ0ksaUJBQUEsbUNBQUE7O2dCQUNJLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBQSxHQUFJLENBQUosR0FBTSxHQUFOLEdBQVMsQ0FBbkIsRUFBdUIsR0FBQSxDQUFJLEtBQUEsQ0FBTSxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUEsQ0FBbEIsRUFBcUIsT0FBUSxDQUFBLENBQUEsQ0FBN0IsRUFBZ0MsS0FBaEMsQ0FBSixFQUE0QyxJQUFBLENBQUssTUFBTCxFQUFZLE9BQVEsQ0FBQSxDQUFBLENBQXBCLENBQTVDLENBQXZCO0FBREosYUFESjs7QUFGSjtJQU1BLFFBQUEsR0FBVztBQUNYLFNBQVMsOEZBQVQ7UUFDSSxDQUFBLEdBQUksSUFBSSxDQUFDLElBQUssQ0FBQSxDQUFBO1FBQ2QsRUFBQSxHQUFLLEdBQUEsR0FBSSxDQUFFLENBQUEsQ0FBQyxDQUFDLE1BQUYsR0FBUyxDQUFUO0FBQ1gsYUFBQSxxQ0FBQTs7WUFDSSxFQUFBLEdBQUssR0FBQSxHQUFJO1lBQ1QsSUFBRyxDQUFDLENBQUMsTUFBRixLQUFZLENBQVosSUFBaUIsQ0FBQSxLQUFLLENBQXpCO2dCQUNJLFFBQUEsR0FBVztnQkFDWCxLQUFBLEdBQVEsQ0FBQSxHQUFJO2dCQUNaLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBVixFQUFzQixFQUF0QixFQUFnQyxFQUFoQztnQkFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLEtBQVYsRUFBc0IsRUFBdEIsRUFBZ0MsR0FBQSxHQUFJLENBQUosR0FBUSxFQUF4QztnQkFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLEtBQVYsRUFBaUIsR0FBQSxHQUFJLENBQUosR0FBUSxFQUF6QixFQUFnQyxHQUFBLEdBQUksQ0FBSixHQUFRLEVBQXhDO2dCQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBVixFQUFpQixHQUFBLEdBQUksQ0FBSixHQUFRLEVBQXpCLEVBQWdDLEVBQWhDO2dCQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBQSxHQUFLLENBQWYsRUFBb0IsR0FBQSxHQUFJLENBQUosR0FBUSxFQUE1QixFQUFtQyxHQUFBLEdBQUksQ0FBSixHQUFRLEVBQTNDLEVBUEo7YUFBQSxNQUFBO2dCQVNJLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBVixFQUFhLEVBQWIsRUFBaUIsRUFBakIsRUFUSjs7WUFVQSxFQUFBLEdBQUc7QUFaUDtBQUhKO0lBaUJBLElBQUcsQ0FBSSxRQUFQO1FBQ0ksSUFBQSxDQUFLLEtBQUEsR0FBTSxDQUFOLEdBQVEsOEJBQWIsRUFESjs7V0FHQSxJQUFJLENBQUMsTUFBTCxDQUFZLEdBQUEsR0FBSSxDQUFKLEdBQVEsSUFBSSxDQUFDLElBQXpCO0FBdENJOztBQThDUixPQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sTUFBUCxFQUFpQixNQUFqQixFQUE2QixDQUE3QjtBQUNOLFFBQUE7O1FBRGEsU0FBTzs7O1FBQUcsU0FBTzs7O1FBQUssSUFBRTs7SUFDckMsT0FBQSxHQUFVLEtBQUEsQ0FBTSxJQUFOLEVBQVksTUFBWixFQUFvQixNQUFwQixFQUE0QixDQUE1QjtJQUNWLE9BQU8sQ0FBQyxJQUFSLEdBQWUsR0FBQSxHQUFJLENBQUosR0FBUSxJQUFJLENBQUM7V0FDNUI7QUFITTs7QUFXVixXQUFBLEdBQWMsU0FBQyxJQUFEO0FBRVYsUUFBQTtJQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsT0FBTCxDQUFBO0lBRVYsSUFBQSxHQUFPLElBQUksSUFBSixDQUFBO0FBQ1AsU0FBUyxnR0FBVDtRQUNJLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBQSxHQUFJLENBQWQsRUFBa0IsSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFBLENBQTlCO0FBREo7QUFHQSxTQUFTLDhGQUFUO1FBRUksQ0FBQSxHQUFJLElBQUksQ0FBQyxJQUFLLENBQUEsQ0FBQTtRQUNkLEVBQUEsR0FBSyxHQUFBLEdBQUksQ0FBRSxDQUFBLENBQUMsQ0FBQyxNQUFGLEdBQVMsQ0FBVDtRQUNYLEVBQUEsR0FBSyxHQUFBLEdBQUksQ0FBRSxDQUFBLENBQUMsQ0FBQyxNQUFGLEdBQVMsQ0FBVDtRQUNYLEtBQUEsR0FBUSxJQUFJLENBQUMsTUFBTyxDQUFBLENBQUUsQ0FBQSxDQUFDLENBQUMsTUFBRixHQUFTLENBQVQsQ0FBRjtRQUNwQixLQUFBLEdBQVEsSUFBSSxDQUFDLE1BQU8sQ0FBQSxDQUFFLENBQUEsQ0FBQyxDQUFDLE1BQUYsR0FBUyxDQUFULENBQUY7QUFDcEIsYUFBQSxtQ0FBQTs7WUFDSSxFQUFBLEdBQUssR0FBQSxHQUFJO1lBQ1QsS0FBQSxHQUFRLElBQUksQ0FBQyxNQUFPLENBQUEsQ0FBQTtZQUNwQixHQUFBLEdBQU0sRUFBQSxHQUFHLEdBQUgsR0FBTztZQUNiLEdBQUEsR0FBTSxFQUFBLEdBQUcsR0FBSCxHQUFPO1lBQ2IsR0FBQSxHQUFNLEVBQUEsR0FBRyxHQUFILEdBQU87WUFHYixJQUFJLENBQUMsSUFBTCxDQUFVLEdBQVYsRUFBZSxRQUFBLENBQVMsUUFBQSxDQUFTLEtBQVQsRUFBZSxLQUFmLENBQVQsRUFBZ0MsT0FBUSxDQUFBLENBQUEsQ0FBeEMsQ0FBZjtZQUdBLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBQSxHQUFLLENBQWYsRUFBbUIsR0FBbkIsRUFBd0IsR0FBeEI7WUFHQSxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQUEsR0FBSSxDQUFKLEdBQVEsRUFBbEIsRUFBdUIsR0FBdkIsRUFBNEIsR0FBNUI7WUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQUEsR0FBSSxDQUFKLEdBQVEsRUFBbEIsRUFBdUIsR0FBdkIsRUFBNEIsRUFBNUI7WUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQUEsR0FBSSxDQUFKLEdBQVEsRUFBbEIsRUFBdUIsRUFBdkIsRUFBNEIsR0FBNUI7WUFHQSxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQUEsR0FBSSxHQUFkLEVBQW9CLEVBQXBCLEVBQXlCLEdBQXpCO1lBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFBLEdBQUksR0FBZCxFQUFvQixHQUFwQixFQUF5QixHQUF6QjtZQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBQSxHQUFJLEdBQWQsRUFBb0IsR0FBcEIsRUFBeUIsRUFBekI7WUFFQSxPQUFXLENBQUMsRUFBRCxFQUFLLEVBQUwsQ0FBWCxFQUFDLFlBQUQsRUFBSztZQUNMLE9BQWlCLENBQUMsS0FBRCxFQUFRLEtBQVIsQ0FBakIsRUFBQyxlQUFELEVBQVE7QUF4Qlo7QUFQSjtXQWlDQSxJQUFJLENBQUMsTUFBTCxDQUFZLEdBQUEsR0FBSSxJQUFJLENBQUMsSUFBckI7QUF6Q1U7O0FBaURkLE1BQUEsR0FBUyxTQUFDLElBQUQsRUFBTyxDQUFQO0FBRUwsUUFBQTs7UUFGWSxJQUFFOztBQUVkLFNBQVUsZ0dBQVY7UUFDSSxJQUFHLElBQUksQ0FBQyxJQUFLLENBQUEsRUFBQSxDQUFHLENBQUMsTUFBZCxLQUF3QixDQUEzQjtBQUNJLG1CQUFPLEtBRFg7O0FBREo7SUFJQSxLQUFBLEdBQVE7SUFDUixJQUFBLEdBQU87SUFDUCxHQUFBLEdBQU07QUFDTixTQUFVLGdHQUFWO1FBQ0ksQ0FBQSxHQUFJLElBQUksQ0FBQyxJQUFLLENBQUEsRUFBQTtRQUNkLE9BQWUsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxDQUFDLENBQVQsQ0FBZixFQUFDLFlBQUQsRUFBSyxZQUFMLEVBQVM7UUFDVCxFQUFBLEdBQUssSUFBSSxDQUFDLE1BQU8sQ0FBQSxFQUFBO1FBQ2pCLEVBQUEsR0FBSyxJQUFJLENBQUMsTUFBTyxDQUFBLEVBQUE7UUFDakIsRUFBQSxHQUFLLElBQUksQ0FBQyxNQUFPLENBQUEsRUFBQTtRQUNqQixHQUFBLEdBQU0sR0FBQSxDQUFJLEVBQUosRUFBUSxFQUFSO1FBQ04sR0FBQSxHQUFNLEdBQUEsQ0FBSSxFQUFKLEVBQVEsRUFBUjtBQUNOLGFBQVMsaUZBQVQ7QUFDSSxpQkFBUyxxRkFBVDtnQkFDSSxDQUFBLEdBQUksR0FBQSxDQUFJLEdBQUEsQ0FBSSxFQUFKLEVBQVEsSUFBQSxDQUFLLENBQUEsR0FBRSxDQUFQLEVBQVUsR0FBVixDQUFSLENBQUosRUFBNkIsSUFBQSxDQUFLLENBQUEsR0FBRSxDQUFQLEVBQVUsR0FBVixDQUE3QjtnQkFDSixJQUFLLENBQUEsR0FBQSxHQUFJLEVBQUosR0FBTyxHQUFQLEdBQVUsQ0FBVixHQUFZLEdBQVosR0FBZSxDQUFmLENBQUwsR0FBMkIsR0FBQTtnQkFDM0IsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYO0FBSEo7QUFESjtBQVJKO0lBY0EsYUFBQSxHQUFnQjtJQUNoQixNQUFBLEdBQVM7SUFDVCxNQUFBLEdBQVM7SUFDVCxPQUFBLEdBQVU7QUFDVixTQUFBLCtDQUFBOztRQUNJLElBQUcsYUFBSyxPQUFMLEVBQUEsQ0FBQSxNQUFIO0FBQXFCLHFCQUFyQjs7UUFDQSxPQUFRLENBQUEsQ0FBQSxDQUFSLEdBQWE7UUFDYixNQUFNLENBQUMsSUFBUCxDQUFZLENBQVo7QUFDQSxhQUFTLDJHQUFUO1lBQ0ksQ0FBQSxHQUFJLEtBQU0sQ0FBQSxDQUFBO1lBQ1YsSUFBRyxHQUFBLENBQUksR0FBQSxDQUFJLENBQUosRUFBTyxDQUFQLENBQUosQ0FBQSxHQUFpQixhQUFwQjtnQkFDSSxPQUFRLENBQUEsQ0FBQSxDQUFSLEdBQWEsT0FEakI7O0FBRko7UUFJQSxNQUFBO0FBUko7SUFVQSxLQUFBLEdBQVE7QUFDUixTQUFVLGdHQUFWO0FBQ0ksYUFBUyxvRkFBVDtBQUNJLGlCQUFTLDZGQUFUO2dCQUNJLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBQyxPQUFRLENBQUEsSUFBSyxDQUFBLEdBQUEsR0FBSSxFQUFKLEdBQU8sR0FBUCxHQUFVLENBQVYsR0FBWSxHQUFaLEdBQWUsQ0FBZixDQUFMLENBQVQsRUFDQyxPQUFRLENBQUEsSUFBSyxDQUFBLEdBQUEsR0FBSSxFQUFKLEdBQU8sR0FBUCxHQUFTLENBQUMsQ0FBQSxHQUFFLENBQUgsQ0FBVCxHQUFjLEdBQWQsR0FBaUIsQ0FBakIsQ0FBTCxDQURULEVBRUMsT0FBUSxDQUFBLElBQUssQ0FBQSxHQUFBLEdBQUksRUFBSixHQUFPLEdBQVAsR0FBVSxDQUFWLEdBQVksR0FBWixHQUFjLENBQUMsQ0FBQSxHQUFFLENBQUgsQ0FBZCxDQUFMLENBRlQsQ0FBWDtBQURKO0FBREo7QUFLQSxhQUFTLHlGQUFUO0FBQ0ksaUJBQVMsNkZBQVQ7Z0JBQ0ksS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFDLE9BQVEsQ0FBQSxJQUFLLENBQUEsR0FBQSxHQUFJLEVBQUosR0FBTyxHQUFQLEdBQVUsQ0FBVixHQUFZLEdBQVosR0FBZSxDQUFmLENBQUwsQ0FBVCxFQUNDLE9BQVEsQ0FBQSxJQUFLLENBQUEsR0FBQSxHQUFJLEVBQUosR0FBTyxHQUFQLEdBQVUsQ0FBVixHQUFZLEdBQVosR0FBYyxDQUFDLENBQUEsR0FBRSxDQUFILENBQWQsQ0FBTCxDQURULEVBRUMsT0FBUSxDQUFBLElBQUssQ0FBQSxHQUFBLEdBQUksRUFBSixHQUFPLEdBQVAsR0FBUyxDQUFDLENBQUEsR0FBRSxDQUFILENBQVQsR0FBYyxHQUFkLEdBQWdCLENBQUMsQ0FBQSxHQUFFLENBQUgsQ0FBaEIsQ0FBTCxDQUZULENBQVg7QUFESjtBQURKO0FBTko7V0FZQSxJQUFJLFVBQUosQ0FBZSxHQUFBLEdBQUksQ0FBSixHQUFRLElBQUksQ0FBQyxJQUE1QixFQUFtQyxLQUFuQyxFQUEwQyxNQUExQztBQWxESzs7QUFzRVQsWUFBQSxHQUFlLFNBQUMsSUFBRCxFQUFPLElBQVA7QUFFWCxRQUFBOztRQUZrQixPQUFLOztJQUV2QixLQUFBLEdBQVEsSUFBSSxDQUFDO0lBQ2IsS0FBQSxHQUFRLElBQUksQ0FBQyxLQUFMLENBQUE7SUFDUixLQUFBLEdBQVEsSUFBSSxDQUFDO0lBQ2IsU0FBQSxHQUFZO0FBQ1osU0FBUyxvRkFBVDtRQUNJLEtBQUEsR0FBUSxZQUFBLENBQWEsS0FBYjtRQUNSLEtBQUEsR0FBUSxVQUFBLENBQVcsS0FBWCxFQUFrQixLQUFsQjtRQUVSLEtBQUEsR0FBUSxTQUFBLENBQVUsS0FBVixFQUFpQixLQUFqQjtRQUNSLFNBQUEsR0FBWSxDQUFDLENBQUMsR0FBRixDQUFNLENBQUMsQ0FBQyxHQUFGLENBQU0sQ0FBQyxDQUFDLEdBQUYsQ0FBTSxLQUFOLEVBQWEsS0FBYixDQUFOLEVBQTJCLFNBQUMsR0FBRDtBQUFZLGdCQUFBO1lBQVYsWUFBRzttQkFBTyxHQUFBLENBQUksR0FBQSxDQUFJLENBQUosRUFBTyxDQUFQLENBQUo7UUFBWixDQUEzQixDQUFOO1FBQ1osSUFBRyxTQUFBLEdBQVksSUFBZjtBQUNJLGtCQURKOztBQU5KO0lBVUEsSUFBSSxDQUFDLEtBQUwsR0FBYTtXQUNiLElBQUksQ0FBQyxPQUFMLENBQUE7QUFqQlc7O0FBeUJmLE1BQU0sQ0FBQyxPQUFQLEdBQ0k7SUFBQSxJQUFBLEVBQWdCLElBQWhCO0lBQ0EsS0FBQSxFQUFnQixLQURoQjtJQUVBLE1BQUEsRUFBZ0IsTUFGaEI7SUFHQSxRQUFBLEVBQWdCLFFBSGhCO0lBSUEsV0FBQSxFQUFnQixXQUpoQjtJQUtBLEdBQUEsRUFBZ0IsR0FMaEI7SUFNQSxJQUFBLEVBQWdCLElBTmhCO0lBT0EsSUFBQSxFQUFnQixJQVBoQjtJQVFBLE9BQUEsRUFBZ0IsT0FSaEI7SUFTQSxLQUFBLEVBQWdCLEtBVGhCO0lBVUEsTUFBQSxFQUFnQixNQVZoQjtJQVdBLEtBQUEsRUFBZ0IsS0FYaEI7SUFZQSxPQUFBLEVBQWdCLE9BWmhCO0lBYUEsTUFBQSxFQUFnQixNQWJoQjtJQWNBLE1BQUEsRUFBZ0IsTUFkaEI7SUFlQSxPQUFBLEVBQWdCLE9BZmhCO0lBZ0JBLFdBQUEsRUFBZ0IsV0FoQmhCO0lBaUJBLFlBQUEsRUFBZ0IsWUFqQmhCO0lBa0JBLFlBQUEsRUFBZ0IsWUFsQmhCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgICAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgICAgXG4gICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICAgMDAwMDAwMCAgICAgXG4jIyNcblxuIyBQb2x5aMOpZHJvbmlzbWUsIENvcHlyaWdodCAyMDE5LCBBbnNlbG0gTGV2c2theWEsIE1JVCBMaWNlbnNlXG5cbnsgXywgY2xhbXAsIGtsb2cgfSA9IHJlcXVpcmUgJ2t4aydcbnsgYWRkLCBhbmdsZSwgY2FsY0NlbnRyb2lkLCBjbG9ja3dpc2UsIGNvcHlWZWNBcnJheSwgY3Jvc3MsIGludGVyc2VjdCwgbWFnLCBtaWRwb2ludCwgbXVsdCwgbmVnLCBvbmVUaGlyZCwgcGxhbmFyaXplLCByYXlQbGFuZSwgcmF5UmF5LCByb3RhdGUsIHN1YiwgdGFuZ2VudGlmeSwgdHdlZW4sIHVuaXQgfSA9IHJlcXVpcmUgJy4vbWF0aCdcbnsgbWluIH0gPSBNYXRoXG5cblZlY3QgPSByZXF1aXJlICcuLi92ZWN0J1xuRmxhZyA9IHJlcXVpcmUgJy4vZmxhZydcblBvbHloZWRyb24gPSByZXF1aXJlICcuL3BvbHloZWRyb24nXG5cbm1pZE5hbWUgPSAodjEsIHYyKSAtPiB2MTx2MiBhbmQgXCIje3YxfV8je3YyfVwiIG9yIFwiI3t2Mn1fI3t2MX1cIlxuXG4jIDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwICAwMDAgIFxuIyAwMDAwMDAgICAgMDAwICAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAwMDAwICBcbiMgMDAwICAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5mbGF0dGVuID0gKHBvbHksIGl0ZXJhdGlvbnM9MTAwKSAtPlxuICAgIFxuICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICAgIG5laWdoYm9ycyA9IHBvbHkubmVpZ2hib3JzKClcbiAgICBbZmxhdG5lc3MsdmVydGV4ZGlzdCxvZmZzZXRzXSA9IHBvbHkuZmxhdG5lc3MoKVxuXG4gICAgIyBpZiBmbGF0bmVzcyA+IDAuMDAxXG4gICAgICAgICMgcG9seS5kZWJ1ZyA9IFtdXG4gICAgIyBkZWJ1ZyA9IHRydWVcbiAgICB3aGlsZSBpdGVyYXRpb25zIGFuZCBmbGF0bmVzcyA+IDAuMDAxXG4gICAgICAgICMga2xvZyBcIiN7cG9seS5uYW1lfSAje2l0ZXJhdGlvbnN9ICN7ZmxhdG5lc3N9XCJcbiAgICAgICAgaXRlcmF0aW9ucyAtPSAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgZm9yIHZpIGluIFswLi4ucG9seS52ZXJ0ZXgubGVuZ3RoXVxuICAgICAgICAgICAgY29udGludWUgaWYgbmVpZ2hib3JzW3ZpXS5sZW5ndGggPD0gMlxuICAgICAgICAgICAgY29udGludWUgaWYgbmVpZ2hib3JzW3ZpXS5sZW5ndGggPj0gNlxuXG4gICAgICAgICAgICAjIGlmIGRlYnVnXG4gICAgICAgICAgICAgICAgIyBwb2x5LmRlYnVnTGluZSBwb2x5LnZlcnRleFt2aV0sIGFkZCBwb2x5LnZlcnRleFt2aV0sIG9mZnNldHNbdmldXG4gICAgICAgICAgICBwb2x5LnZlcnRleFt2aV0gPSBhZGQgcG9seS52ZXJ0ZXhbdmldLCBtdWx0IDAuMywgb2Zmc2V0c1t2aV1cbiAgICAgICAgXG4gICAgICAgIGRlYnVnID0gZmFsc2VcbiAgICAgICAgW2ZsYXRuZXNzLHZlcnRleGRpc3Qsb2Zmc2V0c10gPSBwb2x5LmZsYXRuZXNzKCkgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgcG9seVxuXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgXG5cbmhvbGxvdyA9IChwb2x5LCBpbnNldGY9MC41LCB0aGlja25lc3M9MC41KSAtPlxuXG4gICAgaW5zZXRmICAgID0gY2xhbXAgMC4xIDAuOSBpbnNldGZcbiAgICBub3JtYWxzICAgPSBwb2x5Lm5vcm1hbHMoKVxuICAgIGNlbnRlcnMgICA9IHBvbHkuY2VudGVycygpXG4gICAgd2luZ3MgICAgID0gcG9seS53aW5ncygpXG4gICAgbmVpZ2hib3JzID0gcG9seS5uZWlnaGJvcnMoKVxuICAgIFxuICAgIHRoaWNrbmVzcyA/PSBJbmZpbml0eVxuICAgIFxuICAgIHNldCA9IHt9XG4gICAgaW5zID0gKGUsZikgLT5cbiAgICAgICAgc2V0W2VdID89IHt9XG4gICAgICAgIGlmIG5vdCBzZXRbZV1bZl1cbiAgICAgICAgICAgIHNldFtlXVtmXSA9IHR3ZWVuIHBvbHkudmVydGV4W2VdLCBjZW50ZXJzW2ZdLCBpbnNldGZcbiAgICAgICAgc2V0W2VdW2ZdXG4gICAgICAgIFxuICAgIGRldCA9IHt9XG4gICAgaW5kID0gKGUsZikgLT5cbiAgICAgICAgZGV0W2VdID89IHt9XG4gICAgICAgIGlmIG5vdCBkZXRbZV1bZl1cbiAgICAgICAgICAgIGRldFtlXVtmXSA9IGFkZCBpbnMoZSxmKSwgbXVsdCAtdGhpY2tuZXNzLCBub3JtYWxzW2ZdXG4gICAgICAgIGRldFtlXVtmXVxuICAgICAgICBcbiAgICBmb3Igd2luZyBpbiB3aW5nc1xuICAgICAgICBmciA9IHdpbmdbMl0uZnJcbiAgICAgICAgZmwgPSB3aW5nWzJdLmZsXG4gICAgICAgIGlyID0gaW5zIHdpbmdbMV0sIGZyXG4gICAgICAgIGlsID0gaW5zIHdpbmdbMV0sIGZsXG4gICAgICAgICAgXG4gICAgICAgIG5yID0gbmVnIG5vcm1hbHNbZnJdXG4gICAgICAgIG5sID0gbmVnIG5vcm1hbHNbZmxdXG4gICAgICAgICAgIFxuICAgICAgICBsciA9IHJheVJheSBbaXIsIGFkZCBpciwgbnJdLCBbaWwsIGFkZCBpbCwgbmxdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHRoaWNrbmVzcyA9IG1pbiB0aGlja25lc3MsIG1hZyBzdWIgaXIsIGxyXG4gICAgICAgIHRoaWNrbmVzcyA9IG1pbiB0aGlja25lc3MsIG1hZyBzdWIgaWwsIGxyXG4gICAgICAgICAgICAgICAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGV4Lmxlbmd0aF1cbiAgICAgICAgcCA9IHBvbHkudmVydGV4W2ldXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgcFxuXG4gICAgZm9yIGZpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZmFjZSA9IHBvbHkuZmFjZVtmaV1cbiAgICAgICAgZm9yIHZpIGluIGZhY2VcbiAgICAgICAgICAgIGZsYWcudmVydCBcImZpbiN7Zml9diN7dml9XCIgICAgIGlucyB2aSwgZmlcbiAgICAgICAgICAgIGZsYWcudmVydCBcImZpbmRvd24je2ZpfXYje3ZpfVwiIGluZCB2aSwgZmlcbiAgXG4gICAgZm9yIGZpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtmaV1cbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2MiA9IFwidiN7dn1cIlxuICAgICAgICAgICAgaTEgPSBcImZpbiN7Zml9I3t2MX1cIlxuICAgICAgICAgICAgaTIgPSBcImZpbiN7Zml9I3t2Mn1cIlxuICAgICAgICAgICAgZjEgPSBcImZpbmRvd24je2ZpfSN7djF9XCJcbiAgICAgICAgICAgIGYyID0gXCJmaW5kb3duI3tmaX0je3YyfVwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZuYW1lID0gXCJ0b3BzI3tmaX0je3YxfVwiXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYxLCB2MlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MiwgaTJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgaTIsIGkxXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIGkxLCB2MVxuICAgICAgXG4gICAgICAgICAgICBmbmFtZSA9IFwic2lkZXMje2ZpfSN7djF9XCJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgaTEsIGkyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIGkyLCBmMlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBmMiwgZjFcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgZjEsIGkxXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHYxID0gdjJcbiAgICAgICBcbiAgICB2ZXJ0ZXhNYXAgPSB7fVxuICAgIGZvciB3aW5nIGluIHdpbmdzXG4gICAgICAgIGZyID0gd2luZ1syXS5mclxuICAgICAgICBmbCA9IHdpbmdbMl0uZmwgICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICB2MSA9IFwiZmluZG93biN7ZnJ9diN7d2luZ1swXX1cIlxuICAgICAgICB2MiA9IFwiZmluZG93biN7ZnJ9diN7d2luZ1sxXX1cIlxuICAgICAgICB2MyA9IFwiZmluZG93biN7Zmx9diN7d2luZ1sxXX1cIlxuICAgICAgICB2NCA9IFwiZmluZG93biN7Zmx9diN7d2luZ1swXX1cIlxuICAgICAgICBcbiAgICAgICAgaWYgMC4wMDEgPCBtYWcgc3ViIGluZCh3aW5nWzFdLCBmciksIGluZCh3aW5nWzFdLCBmbClcbiAgICAgICAgXG4gICAgICAgICAgICBmbmFtZSA9IFwic3RpdGNoXyN7Zmx9XyN7ZnJ9XCJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjEsIHYyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYyLCB2M1xuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MywgdjRcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjQsIHYxXG4gICAgICAgICAgICBcbiAgICAgICAgdmVydGV4TWFwW3dpbmdbMF1dID89IHt9XG4gICAgICAgIHZlcnRleE1hcFt3aW5nWzBdXVt3aW5nWzFdXSA9IFt2MSwgdjRdXG4gICAgICAgIHZlcnRleE1hcFt3aW5nWzFdXSA/PSB7fVxuICAgICAgICB2ZXJ0ZXhNYXBbd2luZ1sxXV1bd2luZ1swXV0gPSBbdjMsIHYyXVxuXG4gICAgZm9yIG5zLHZpIGluIG5laWdoYm9yc1xuICAgICAgICBmb3IgbmkgaW4gbnNcbiAgICAgICAgICAgIGVkZ2UgPSB2ZXJ0ZXhNYXBbdmldW25pXVxuICAgICAgICAgICAgZmxhZy5lZGdlIFwic25pdGNoXyN7dml9XCIsIGVkZ2VbMF0sIGVkZ2VbMV1cbiAgXG4gICAgZmxhZy50b3BvbHkgXCJoI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuXG5leHBhbmQgPSAocG9seSwgYW1vdW50PTAuNSkgLT5cblxuICAgIGFtb3VudCAgICA9IGNsYW1wIDAgMTAgYW1vdW50XG4gICAgb2xkZWRnZXMgID0gcG9seS5lZGdlcygpXG4gICAgY2VudGVycyAgID0gcG9seS5jZW50ZXJzKClcbiAgICBuZWlnaGJvcnMgPSBwb2x5Lm5laWdoYm9ycygpXG4gICAgd2luZ3MgICAgID0gcG9seS53aW5ncygpXG4gICAgICAgIFxuICAgIHZlcnRzID0gW11cbiAgICBmYWNlcyA9IFtdXG4gICAgdm1hcCAgPSB7fVxuICAgIGltYXAgID0ge31cbiAgICBuZXdWICA9IDBcbiAgICBmb3IgZmkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBkID0gc3ViIG11bHQoMSthbW91bnQsIGNlbnRlcnNbZmldKSwgY2VudGVyc1tmaV1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtmaV1cbiAgICAgICAgZmFjZSA9IFtdXG4gICAgICAgIGZvciB2LHZpIGluIGZcbiAgICAgICAgICAgIHZtYXBbdl0gPz0gW11cbiAgICAgICAgICAgIHZtYXBbdl0ucHVzaCBuZXdWXG4gICAgICAgICAgICBpbWFwW25ld1ZdID0gdlxuICAgICAgICAgICAgdmVydHMucHVzaCBhZGQgcG9seS52ZXJ0ZXhbdl0sIGRcbiAgICAgICAgICAgIG5leHRWID0gbmV3Visodmk9PWYubGVuZ3RoLTEgYW5kIC1mLmxlbmd0aCsxIG9yIDEpXG4gICAgICAgICAgICBmYWNlLnB1c2ggbmV3VlxuICAgICAgICAgICAgbmV3VisrXG4gICAgICAgIGZhY2VzLnB1c2ggZmFjZVxuICAgICAgICAgICAgXG4gICAgZm9yIHdpbmcgaW4gd2luZ3NcbiAgICAgICAgW2EsYl0gPSB3aW5nXG4gICAgICAgIGZhY2UgPSB2bWFwW2FdLmNvbmNhdCB2bWFwW2JdXG4gICAgICAgIGZhY2UgPSBmYWNlLmZpbHRlciAodikgLT4gKHYgaW4gZmFjZXNbd2luZ1syXS5mcl0pIG9yICh2IGluIGZhY2VzW3dpbmdbMl0uZmxdKVxuICAgICAgICBmYWNlcy5wdXNoIGNsb2Nrd2lzZSB2ZXJ0cywgZmFjZVxuXG4gICAgZm9yIG8sbiBvZiB2bWFwXG4gICAgICAgIGZhY2VzLnB1c2ggY2xvY2t3aXNlIHZlcnRzLCBuXG4gICAgICAgIFxuICAgIG5ldyBQb2x5aGVkcm9uIFwiZSN7cG9seS5uYW1lfVwiIGZhY2VzLCB2ZXJ0c1xuXG4jICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG5zcGhlcmljYWxpemUgPSAocG9seSkgLT5cblxuICAgIHZlcnRzID0gW11cbiAgICBmb3IgdmVydGV4LHZpIGluIHBvbHkudmVydGV4XG4gICAgICAgIHZlcnRzLnB1c2ggdW5pdCBwb2x5LnZlcnRleFt2aV1cbiAgICAgICAgXG4gICAgbmV3IFBvbHloZWRyb24gXCJ6I3twb2x5Lm5hbWV9XCIgcG9seS5mYWNlLCB2ZXJ0c1xuXG4jIDAwMDAwMDAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiMgICAwMDAgICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxuemlya3VsYXJpemUgPSAocG9seSwgZ3Jvdz0xLCBuPTYpIC0+XG5cbiAgICB2ZXJ0aWNlcyA9IFtdXG4gICAgXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgXG4gICAgZm9yIGYsZmkgaW4gcG9seS5mYWNlXG5cbiAgICAgICAgaWYgZi5sZW5ndGggPT0gbiBvciBuID09IDBcbiAgICAgICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgICAgICBheGlzID0gY3Jvc3MgY2VudGVyc1tmaV0sIHBvbHkudmVydGV4W3ZdXG4gICAgICAgICAgICAgICAgYW5nbCA9IGFuZ2xlIGNlbnRlcnNbZmldLCBwb2x5LnZlcnRleFt2XVxuICAgICAgICAgICAgICAgIHZlcnRpY2VzW3ZdID0gcm90YXRlIGNlbnRlcnNbZmldLCBheGlzLCBhbmdsICogZ3Jvd1xuICAgICAgICAgICAgICAgIFxuICAgIHZlcnRzID0gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdLm1hcCAoaSkgLT4gdmVydGljZXNbaV0gPyBwb2x5LnZlcnRleFtpXVxuICAgICBcbiAgICBuZXcgUG9seWhlZHJvbiBcInoje3BvbHkubmFtZX1cIiBwb2x5LmZhY2UsIHZlcnRzXG5cbiMgMDAwMDAwMCAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuXG5kdWFsID0gKHBvbHkpIC0+XG5cbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICBmYWNlID0gW10gXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdIFxuICAgICAgICBmYWNlW2ldID0ge31cblxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICB2MSA9IGZbLTFdXG4gICAgICAgIGZvciB2MiBpbiBmXG4gICAgICAgICAgICBmYWNlW3YxXVtcInYje3YyfVwiXSA9IFwiI3tpfVwiXG4gICAgICAgICAgICB2MSA9IHYyXG4gIFxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZmxhZy52ZXJ0IFwiI3tpfVwiIGNlbnRlcnNbaV1cbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIHYxID0gZlstMV1cbiAgICAgICAgZm9yIHYyIGluIGZcbiAgICAgICAgICAgIGZsYWcuZWRnZSB2MSwgZmFjZVt2Ml1bXCJ2I3t2MX1cIl0sIFwiI3tpfVwiXG4gICAgICAgICAgICB2MSA9IHYyXG4gIFxuICAgIGRwb2x5ID0gZmxhZy50b3BvbHkoKVxuICBcbiAgICBzb3J0RiA9IFtdXG4gICAgZm9yIGYgaW4gZHBvbHkuZmFjZVxuICAgICAgICBrID0gaW50ZXJzZWN0IHBvbHkuZmFjZVtmWzBdXSwgcG9seS5mYWNlW2ZbMV1dLCBwb2x5LmZhY2VbZlsyXV1cbiAgICAgICAgc29ydEZba10gPSBmXG4gICAgZHBvbHkuZmFjZSA9IHNvcnRGXG4gIFxuICAgIGlmIHBvbHkubmFtZVswXSAhPSBcImRcIlxuICAgICAgICBkcG9seS5uYW1lID0gXCJkI3twb2x5Lm5hbWV9XCJcbiAgICBlbHNlIFxuICAgICAgICBkcG9seS5uYW1lID0gcG9seS5uYW1lLnNsaWNlIDFcbiAgXG4gICAgZHBvbHlcblxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICBcblxuIyBLaXMgKGFiYnJldmlhdGVkIGZyb20gdHJpYWtpcykgdHJhbnNmb3JtcyBhbiBOLXNpZGVkIGZhY2UgaW50byBhbiBOLXB5cmFtaWQgcm9vdGVkIGF0IHRoZVxuIyBzYW1lIGJhc2UgdmVydGljZXMuIG9ubHkga2lzIG4tc2lkZWQgZmFjZXMsIGJ1dCBuPT0wIG1lYW5zIGtpcyBhbGwuXG5cbmtpcyA9IChwb2x5LCBhcGV4ZGlzdD0wLjUsIG49MCkgLT5cblxuICAgIGFwZXhkaXN0ID0gY2xhbXAgLTEgMTAgYXBleGRpc3RcbiAgICBcbiAgICBpZiBhcGV4ZGlzdCA8IDBcbiAgICAgICAgYXBleGRpc3QgPSBhcGV4ZGlzdCAqIHBvbHkubWluRmFjZURpc3QoKVxuICAgIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgcG9seS52ZXJ0ZXhbaV1cbiAgXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm91bmRBbnkgPSBmYWxzZVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MiA9IFwidiN7dn1cIlxuICAgICAgICAgICAgaWYgZi5sZW5ndGggPT0gbiBvciBuID09IDBcbiAgICAgICAgICAgICAgICBmb3VuZEFueSA9IHRydWU7XG4gICAgICAgICAgICAgICAgYXBleCA9IFwiYXBleCN7aX1cIlxuICAgICAgICAgICAgICAgIGZuYW1lID0gXCIje2l9I3t2MX1cIlxuXG4gICAgICAgICAgICAgICAgZmxhZy52ZXJ0IGFwZXgsIGFkZCBjZW50ZXJzW2ldLCBtdWx0IGFwZXhkaXN0LCBub3JtYWxzW2ldXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCAgIHYxLCAgIHYyXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCAgIHYyLCBhcGV4XG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBhcGV4LCAgIHYxXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlIFwiI3tpfVwiLCB2MSwgdjJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdjEgPSB2MlxuICBcbiAgICBpZiBub3QgZm91bmRBbnlcbiAgICAgICAga2xvZyBcIk5vICN7bn0tZm9sZCBjb21wb25lbnRzIHdlcmUgZm91bmQuXCJcbiAgXG4gICAgZmxhZy50b3BvbHkgXCJrI3tufSN7cG9seS5uYW1lfVwiXG5cbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcblxudHJ1bmNhdGUgPSAocG9seSwgZmFjdG9yPTAuNSkgLT5cblxuICAgIGZhY3RvciA9IGNsYW1wIDAgMSBmYWN0b3JcbiAgICBlZGdlTWFwID0ge31cbiAgICBcbiAgICBudW1GYWNlcyAgICA9IHBvbHkuZmFjZS5sZW5ndGhcbiAgICBudW1WZXJ0aWNlcyA9IHBvbHkudmVydGV4Lmxlbmd0aFxuICAgIG5laWdoYm9ycyAgID0gcG9seS5uZWlnaGJvcnMoKVxuICAgIFxuICAgIGRlcHRoID0gMC41ICogZmFjdG9yICogcG9seS5taW5FZGdlTGVuZ3RoKClcbiAgICBcbiAgICBmb3IgdmVydGV4SW5kZXggaW4gWzAuLi5udW1WZXJ0aWNlc11cbiAgICAgICAgXG4gICAgICAgIGVkZ2VNYXBbdmVydGV4SW5kZXhdID89IHt9XG4gICAgICAgIGZhY2UgPSBbXVxuICAgICAgICBcbiAgICAgICAgbmwgPSBuZWlnaGJvcnNbdmVydGV4SW5kZXhdLmxlbmd0aFxuICAgICAgICBmb3IgaWkgaW4gWzAuLi5ubF1cbiAgICAgICAgICAgIG5pID0gbmVpZ2hib3JzW3ZlcnRleEluZGV4XVtpaV1cbiAgICAgICAgICAgIGVkZ2VNYXBbdmVydGV4SW5kZXhdW25pXSA9IHBvbHkudmVydGV4Lmxlbmd0aFxuICAgICAgICAgICAgdnAgPSBwb2x5LmVkZ2UgdmVydGV4SW5kZXgsIG5pXG4gICAgICAgICAgICB2cC5ub3JtYWxpemUoKVxuICAgICAgICAgICAgdnAuc2NhbGVJblBsYWNlIGRlcHRoXG4gICAgICAgICAgICB2cC5hZGRJblBsYWNlIHBvbHkudmVydCB2ZXJ0ZXhJbmRleFxuICAgICAgICAgICAgZmFjZS5wdXNoIHBvbHkudmVydGV4Lmxlbmd0aFxuICAgICAgICAgICAgcG9seS52ZXJ0ZXgucHVzaCBbdnAueCwgdnAueSwgdnAuel1cbiAgICAgICAgICAgIFxuICAgICAgICBwb2x5LmZhY2UucHVzaCBmYWNlXG4gICAgXG4gICAgZm9yIGZpIGluIFswLi4ubnVtRmFjZXNdXG4gICAgICAgIGZhY2UgPSBwb2x5LmZhY2VbZmldXG4gICAgICAgIG5ld0ZhY2UgPSBbXVxuICAgICAgICBmb3IgdmkgaW4gWzAuLi5mYWNlLmxlbmd0aF1cbiAgICAgICAgICAgIG5pID0gKHZpKzEpICUgZmFjZS5sZW5ndGhcbiAgICAgICAgICAgIG5ld0ZhY2UucHVzaCBlZGdlTWFwW2ZhY2VbdmldXVtmYWNlW25pXV1cbiAgICAgICAgICAgIGlmIGZhY3RvciA8IDFcbiAgICAgICAgICAgICAgICBuZXdGYWNlLnB1c2ggZWRnZU1hcFtmYWNlW25pXV1bZmFjZVt2aV1dXG4gICAgICAgIHBvbHkuZmFjZVtmaV0gPSBuZXdGYWNlXG4gICAgICBcbiAgICBwb2x5LnZlcnRleC5zcGxpY2UgMCwgbnVtVmVydGljZXNcbiAgICBmb3IgZmFjZSBpbiBwb2x5LmZhY2VcbiAgICAgICAgZm9yIGkgaW4gWzAuLi5mYWNlLmxlbmd0aF1cbiAgICAgICAgICAgIGZhY2VbaV0gLT0gbnVtVmVydGljZXNcbiAgICAgICAgXG4gICAgcG9seVxuICAgIFxuIyAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuXG4jIFRvcG9sb2dpY2FsIFwidHdlZW5cIiBiZXR3ZWVuIGEgcG9seWhlZHJvbiBhbmQgaXRzIGR1YWwgcG9seWhlZHJvbi5cblxuYW1ibyA9IChwb2x5KSAtPlxuICAgIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UoLTIpXG4gICAgICAgIGZvciB2MyBpbiBmXG4gICAgICAgICAgICBpZiB2MSA8IHYyXG4gICAgICAgICAgICAgICAgZmxhZy52ZXJ0IG1pZE5hbWUodjEsdjIpLCBtaWRwb2ludCBwb2x5LnZlcnRleFt2MV0sIHBvbHkudmVydGV4W3YyXVxuXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJvcmlnI3tpfVwiICBtaWROYW1lKHYxLHYyKSwgbWlkTmFtZSh2Mix2MylcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImR1YWwje3YyfVwiIG1pZE5hbWUodjIsdjMpLCBtaWROYW1lKHYxLHYyKVxuXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiYSN7cG9seS5uYW1lfVwiXG5cbmJldmVsID0gKHBvbHksIGZhY3Rvcj0wLjUpIC0+XG4gICAgXG4gICAgcCA9IHRydW5jYXRlIGFtYm8ocG9seSksIGZhY3RvclxuICAgIHAubmFtZSA9IFwiYiN7cG9seS5uYW1lfVwiXG4gICAgcFxuICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5jaGFtZmVyID0gKHBvbHksIGZhY3Rvcj0wLjUpIC0+XG4gICAgXG4gICAgZmFjdG9yICA9IGNsYW1wIDAuMDAxIDAuOTk1IGZhY3RvclxuICAgIGZsYWcgICAgPSBuZXcgRmxhZygpXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgd2luZ3MgICA9IHBvbHkud2luZ3MoKVxuICAgICAgICBcbiAgICBtaW5FZGdlTGVuZ3RoID0gSW5maW5pdHlcbiAgICBcbiAgICBmb3IgZWRnZSBpbiB3aW5nc1xuICAgICAgICBlMCA9IHBvbHkudmVydGV4W2VkZ2VbMF1dXG4gICAgICAgIGUxID0gcG9seS52ZXJ0ZXhbZWRnZVsxXV1cbiAgICAgICAgZWQgPSB1bml0IHN1YiBlMSwgZTBcbiAgICAgICAgXG4gICAgICAgIG5yID0gdW5pdCBzdWIgcG9seS52ZXJ0ZXhbZWRnZVsyXS5ucl0sIGUxXG4gICAgICAgIHByID0gdW5pdCBzdWIgcG9seS52ZXJ0ZXhbZWRnZVsyXS5wcl0sIGUwXG4gICAgICAgIGNyID0gcmF5UmF5IFtlMSwgbXVsdCAwLjUsIGFkZCBhZGQoZTEsIG5yKSwgc3ViKGUxLCBlZCldLFxuICAgICAgICAgICAgICAgICAgICBbZTAsIG11bHQgMC41LCBhZGQgYWRkKGUwLCBwciksIGFkZChlMCwgZWQpXVxuXG4gICAgICAgIGVsID0gbWFnIHN1YiBlMSwgcmF5UmF5IFtlMSwgYWRkKGUxLCBucildLCBbY3IsIGFkZChjciwgZWQpXVxuICAgICAgICBtaW5FZGdlTGVuZ3RoID0gbWluIG1pbkVkZ2VMZW5ndGgsIGVsXG5cbiAgICAgICAgZWwgPSBtYWcgc3ViIGUwLCByYXlSYXkgW2UwLCBhZGQoZTAsIHByKV0sIFtjciwgc3ViKGNyLCBlZCldXG4gICAgICAgIG1pbkVkZ2VMZW5ndGggPSBtaW4gbWluRWRnZUxlbmd0aCwgZWxcbiAgICAgICAgXG4gICAgbWluRWRnZUxlbmd0aCAqPSBmYWN0b3JcbiAgICAgICAgXG4gICAgbW92ZWQgPSB7fVxuICAgIGZvciBlZGdlIGluIHdpbmdzXG4gICAgICAgIGUwICA9IHBvbHkudmVydGV4W2VkZ2VbMF1dXG4gICAgICAgIGUxICA9IHBvbHkudmVydGV4W2VkZ2VbMV1dXG4gICAgICAgIHJyID0gW1xuICAgICAgICAgICAgYWRkKGUwLCBtdWx0IG1pbkVkZ2VMZW5ndGgsIHVuaXQgc3ViIHBvbHkudmVydGV4W2VkZ2VbMl0ucHJdLCBlMCksXG4gICAgICAgICAgICBhZGQoZTEsIG11bHQgbWluRWRnZUxlbmd0aCwgdW5pdCBzdWIgcG9seS52ZXJ0ZXhbZWRnZVsyXS5ucl0sIGUxKV1cbiAgICAgICAgbHIgPSBbXG4gICAgICAgICAgICBhZGQoZTAsIG11bHQgbWluRWRnZUxlbmd0aCwgdW5pdCBzdWIgcG9seS52ZXJ0ZXhbZWRnZVsyXS5wbF0sIGUwKSxcbiAgICAgICAgICAgIGFkZChlMSwgbXVsdCBtaW5FZGdlTGVuZ3RoLCB1bml0IHN1YiBwb2x5LnZlcnRleFtlZGdlWzJdLm5sXSwgZTEpXVxuICAgICAgICAgICAgXG4gICAgICAgIG1vdmVkW1wiI3tlZGdlWzFdfeKWuCN7ZWRnZVswXX1sXCJdID0gcnJcbiAgICAgICAgbW92ZWRbXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfXJcIl0gPSByclxuICAgICAgICBtb3ZlZFtcIiN7ZWRnZVsxXX3ilrgje2VkZ2VbMF19clwiXSA9IGxyXG4gICAgICAgIG1vdmVkW1wiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1sXCJdID0gbHJcbiAgICAgICAgICAgIFxuICAgIGZvciBlZGdlIGluIHdpbmdzXG4gICAgICAgIGUwICAgPSBwb2x5LnZlcnRleFtlZGdlWzBdXVxuICAgICAgICBlMSAgID0gcG9seS52ZXJ0ZXhbZWRnZVsxXV1cbiAgICAgICAgXG4gICAgICAgIG5mICA9IFwiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1cIiBcbiAgICAgICAgbl9oID0gXCIje2VkZ2VbMV19XCJcbiAgICAgICAgbl90ID0gXCIje2VkZ2VbMF19XCJcbiAgICAgICAgXG4gICAgICAgIG5uciA9IFwiI3tuX2h94pa4I3tlZGdlWzJdLmZyfVwiXG4gICAgICAgIG5ubCA9IFwiI3tuX2h94pa4I3tlZGdlWzJdLmZsfVwiXG4gICAgICAgIG5wciA9IFwiI3tuX3R94pa4I3tlZGdlWzJdLmZyfVwiXG4gICAgICAgIG5wbCA9IFwiI3tuX3R94pa4I3tlZGdlWzJdLmZsfVwiICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgbnIgPSByYXlSYXkgbW92ZWRbXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfXJcIl0sIG1vdmVkW1wiI3tlZGdlWzFdfeKWuCN7ZWRnZVsyXS5ucn1yXCJdXG4gICAgICAgIG5sID0gcmF5UmF5IG1vdmVkW1wiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1sXCJdLCBtb3ZlZFtcIiN7ZWRnZVsxXX3ilrgje2VkZ2VbMl0ubmx9bFwiXVxuICAgICAgICBwciA9IHJheVJheSBtb3ZlZFtcIiN7ZWRnZVswXX3ilrgje2VkZ2VbMV19clwiXSwgbW92ZWRbXCIje2VkZ2VbMl0ucHJ94pa4I3tlZGdlWzBdfXJcIl1cbiAgICAgICAgcGwgPSByYXlSYXkgbW92ZWRbXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfWxcIl0sIG1vdmVkW1wiI3tlZGdlWzJdLnBsfeKWuCN7ZWRnZVswXX1sXCJdXG4gICAgICAgIFxuICAgICAgICBwbWlkID0gbWlkcG9pbnQgcGwsIHByXG4gICAgICAgIG5taWQgPSBtaWRwb2ludCBubCwgbnJcbiAgICAgICAgY21pZCA9IG1pZHBvaW50IHBtaWQsIG5taWRcbiAgICAgICAgcG5tICA9IGNyb3NzIHN1YihwbWlkLG5taWQpLCBzdWIocGwscHIpXG5cbiAgICAgICAgaGVhZCA9IHJheVBsYW5lIFswIDAgMF0sIGUxLCBjbWlkLCBwbm1cbiAgICAgICAgdGFpbCA9IHJheVBsYW5lIFswIDAgMF0sIGUwLCBjbWlkLCBwbm1cbiAgICAgICAgXG4gICAgICAgIGZsYWcudmVydCBuX2gsIGhlYWRcbiAgICAgICAgZmxhZy52ZXJ0IG5fdCwgdGFpbFxuICAgICAgICBmbGFnLnZlcnQgbm5yLCBuclxuICAgICAgICBmbGFnLnZlcnQgbm5sLCBubFxuICAgICAgICBmbGFnLnZlcnQgbnBsLCBwbFxuICAgICAgICBmbGFnLnZlcnQgbnByLCBwclxuXG4gICAgICAgIGZsYWcuZWRnZSBuZiwgbl9oLCBubnJcbiAgICAgICAgZmxhZy5lZGdlIG5mLCBubnIsIG5wclxuICAgICAgICBmbGFnLmVkZ2UgbmYsIG5wciwgbl90XG4gICAgICAgIGZsYWcuZWRnZSBuZiwgbl90LCBucGxcbiAgICAgICAgZmxhZy5lZGdlIG5mLCBucGwsIG5ubFxuICAgICAgICBmbGFnLmVkZ2UgbmYsIG5ubCwgbl9oXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGZsYWcuZWRnZSBcIiN7ZWRnZVsyXS5mcn1cIiBucHIsIG5uclxuICAgICAgICBmbGFnLmVkZ2UgXCIje2VkZ2VbMl0uZmx9XCIgbm5sLCBucGxcbiAgICAgICAgXG4gICAgZmxhZy50b3BvbHkgXCJjI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuXG53aGlybCA9IChwb2x5LCBuPTApIC0+XG5cbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGV4Lmxlbmd0aF1cbiAgICAgICAgZmxhZy52ZXJ0IFwidiN7aX1cIiB1bml0IHBvbHkudmVydGV4W2ldXG5cbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSAtMlxuICAgICAgICBmb3IgaiBpbiBbMC4uLmYubGVuZ3RoXVxuICAgICAgICAgICAgdiA9IGZbal1cbiAgICAgICAgICAgIHYzID0gdlxuICAgICAgICAgICAgdjFfMiA9IG9uZVRoaXJkIHBvbHkudmVydGV4W3YxXSwgcG9seS52ZXJ0ZXhbdjJdXG4gICAgICAgICAgICBmbGFnLnZlcnQodjErXCJ+XCIrdjIsIHYxXzIpXG4gICAgICAgICAgICBjdjFuYW1lID0gXCJjZW50ZXIje2l9fiN7djF9XCJcbiAgICAgICAgICAgIGN2Mm5hbWUgPSBcImNlbnRlciN7aX1+I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy52ZXJ0IGN2MW5hbWUsIHVuaXQgb25lVGhpcmQgY2VudGVyc1tpXSwgdjFfMlxuICAgICAgICAgICAgZm5hbWUgPSBpK1wiZlwiK3YxXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIGN2MW5hbWUsICAgdjErXCJ+XCIrdjJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjErXCJ+XCIrdjIsIHYyK1wiflwiK3YxIFxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MitcIn5cIit2MSwgXCJ2I3t2Mn1cIiAgXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIFwidiN7djJ9XCIsICB2MitcIn5cIit2MyBcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjIrXCJ+XCIrdjMsIGN2Mm5hbWVcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgY3YybmFtZSwgICBjdjFuYW1lXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJjI3tpfVwiLCBjdjFuYW1lLCBjdjJuYW1lXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M11cbiAgXG4gICAgY2Fub25pY2FsaXplIGZsYWcudG9wb2x5IFwidyN7cG9seS5uYW1lfVwiXG5cbiMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAwICAgIDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcblxuZ3lybyA9IChwb2x5KSAtPlxuXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgdW5pdCBwb2x5LnZlcnRleFtpXVxuXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIGZsYWcudmVydCBcImNlbnRlciN7aX1cIiB1bml0IGNlbnRlcnNbaV1cbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSgtMilcbiAgICAgICAgZm9yIGogaW4gWzAuLi5mLmxlbmd0aF1cbiAgICAgICAgICAgIHYgPSBmW2pdXG4gICAgICAgICAgICB2MyA9IHZcbiAgICAgICAgICAgIGZsYWcudmVydCB2MStcIn5cIit2Miwgb25lVGhpcmQgcG9seS52ZXJ0ZXhbdjFdLHBvbHkudmVydGV4W3YyXVxuICAgICAgICAgICAgZm5hbWUgPSBpK1wiZlwiK3YxXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIFwiY2VudGVyI3tpfVwiICB2MStcIn5cIit2MlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MStcIn5cIit2MiwgIHYyK1wiflwiK3YxXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYyK1wiflwiK3YxLCAgXCJ2I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBcInYje3YyfVwiICAgICB2MitcIn5cIit2M1xuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MitcIn5cIit2MywgIFwiY2VudGVyI3tpfVwiXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gIFxuICAgIGNhbm9uaWNhbGl6ZSBmbGFnLnRvcG9seSBcImcje3BvbHkubmFtZX1cIlxuICAgIFxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAwMCAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuIyAwMDAgMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiMgIDAwMDAwIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgXG5cbnF1aW50byA9IChwb2x5KSAtPiAjIGNyZWF0ZXMgYSBwZW50YWdvbiBmb3IgZXZlcnkgdmVydGV4IGFuZCBhIG5ldyBpbnNldCBmYWNlXG4gICAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIGNlbnRyb2lkID0gY2FsY0NlbnRyb2lkIGYubWFwIChpZHgpIC0+IHBvbHkudmVydGV4W2lkeF1cblxuICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UgLTJcbiAgICAgICAgZm9yIHYzIGluIGZcbiAgICAgICAgICAgIG1pZHB0ID0gbWlkcG9pbnQgcG9seS52ZXJ0ZXhbdjFdLCBwb2x5LnZlcnRleFt2Ml1cbiAgICAgICAgICAgIGlubmVycHQgPSBtaWRwb2ludCBtaWRwdCwgY2VudHJvaWRcbiAgICAgICAgICAgIGZsYWcudmVydCBtaWROYW1lKHYxLHYyKSwgbWlkcHRcbiAgICAgICAgICAgIGZsYWcudmVydCBcImlubmVyXyN7aX1fXCIgKyBtaWROYW1lKHYxLHYyKSwgaW5uZXJwdFxuICAgICAgICAgICAgZmxhZy52ZXJ0IFwiI3t2Mn1cIiBwb2x5LnZlcnRleFt2Ml1cbiAgICAgICAgICBcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9XyN7djJ9XCIsIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYxLCB2MiksIG1pZE5hbWUodjEsIHYyKVxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7aX1fI3t2Mn1cIiwgbWlkTmFtZSh2MSwgdjIpLCBcIiN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9XyN7djJ9XCIsIFwiI3t2Mn1cIiwgbWlkTmFtZSh2MiwgdjMpXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfV8je3YyfVwiLCBtaWROYW1lKHYyLCB2MyksIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYyLCB2MylcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9XyN7djJ9XCIsIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYyLCB2MyksIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYxLCB2MilcbiAgICAgIFxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZl9pbl8je2l9XCIsIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYxLCB2MiksIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYyLCB2MylcbiAgICAgIFxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICBcbiAgICBmbGFnLnRvcG9seSBcInEje3BvbHkubmFtZX1cIlxuXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMFxuIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICBcbiMgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgXG4jIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAwMDAgICBcblxuaW5zZXQgPSAocG9seSwgaW5zZXQ9MC41LCBwb3BvdXQ9LTAuMiwgbj0wKSAtPlxuICBcbiAgICBpbnNldCA9IGNsYW1wIDAuMjUgMC45OSBpbnNldFxuICAgIHBvcG91dCA9IG1pbiBwb3BvdXQsIGluc2V0XG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGV4Lmxlbmd0aF1cbiAgICAgICAgcCA9IHBvbHkudmVydGV4W2ldXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgcFxuXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICAgICAgZmxhZy52ZXJ0IFwiZiN7aX12I3t2fVwiIGFkZCB0d2Vlbihwb2x5LnZlcnRleFt2XSxjZW50ZXJzW2ldLGluc2V0KSwgbXVsdChwb3BvdXQsbm9ybWFsc1tpXSlcbiAgXG4gICAgZm91bmRBbnkgPSBmYWxzZSAjIGFsZXJ0IGlmIGRvbid0IGZpbmQgYW55XG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIHYxID0gXCJ2I3tmW2YubGVuZ3RoLTFdfVwiXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIHYyID0gXCJ2I3t2fVwiO1xuICAgICAgICAgICAgaWYgZi5sZW5ndGggPT0gbiBvciBuID09IDBcbiAgICAgICAgICAgICAgICBmb3VuZEFueSA9IHRydWVcbiAgICAgICAgICAgICAgICBmbmFtZSA9IGkgKyB2MVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZShmbmFtZSwgICAgICB2MSwgICAgICAgdjIpXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlKGZuYW1lLCAgICAgIHYyLCAgICAgICBcImYje2l9I3t2Mn1cIilcbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UoZm5hbWUsIFwiZiN7aX0je3YyfVwiLCAgXCJmI3tpfSN7djF9XCIpXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlKGZuYW1lLCBcImYje2l9I3t2MX1cIiwgIHYxKVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZShcImV4I3tpfVwiLCBcImYje2l9I3t2MX1cIiwgIFwiZiN7aX0je3YyfVwiKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZShpLCB2MSwgdjIpICBcbiAgICAgICAgICAgIHYxPXYyXG4gIFxuICAgIGlmIG5vdCBmb3VuZEFueVxuICAgICAgICBrbG9nIFwiTm8gI3tufS1mb2xkIGNvbXBvbmVudHMgd2VyZSBmb3VuZC5cIlxuICBcbiAgICBmbGFnLnRvcG9seSBcIm4je259I3twb2x5Lm5hbWV9XCJcblxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcblxuZXh0cnVkZSA9IChwb2x5LCBwb3BvdXQ9MSwgaW5zZXRmPTAuNSwgbj0wKSAtPlxuICAgIG5ld3BvbHkgPSBpbnNldCBwb2x5LCBpbnNldGYsIHBvcG91dCwgblxuICAgIG5ld3BvbHkubmFtZSA9IFwieCN7bn0je3BvbHkubmFtZX1cIlxuICAgIG5ld3BvbHlcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAwMFxuIyAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4jIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAgICAgICAwMDAgICAwMDBcblxucGVyc3BlY3RpdmEgPSAocG9seSkgLT4gIyBhbiBvcGVyYXRpb24gcmV2ZXJzZS1lbmdpbmVlcmVkIGZyb20gUGVyc3BlY3RpdmEgQ29ycG9ydW0gUmVndWxhcml1bVxuXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgcG9seS52ZXJ0ZXhbaV1cbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBcbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0yXX1cIlxuICAgICAgICB2MiA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICB2ZXJ0MSA9IHBvbHkudmVydGV4W2ZbZi5sZW5ndGgtMl1dXG4gICAgICAgIHZlcnQyID0gcG9seS52ZXJ0ZXhbZltmLmxlbmd0aC0xXV1cbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgdjMgPSBcInYje3Z9XCJcbiAgICAgICAgICAgIHZlcnQzID0gcG9seS52ZXJ0ZXhbdl1cbiAgICAgICAgICAgIHYxMiA9IHYxK1wiflwiK3YyXG4gICAgICAgICAgICB2MjEgPSB2MitcIn5cIit2MVxuICAgICAgICAgICAgdjIzID0gdjIrXCJ+XCIrdjNcbiAgICAgIFxuICAgICAgICAgICAgIyBvbiBlYWNoIE5mYWNlLCBOIG5ldyBwb2ludHMgaW5zZXQgZnJvbSBlZGdlIG1pZHBvaW50cyB0b3dhcmRzIGNlbnRlciA9IFwic3RlbGxhdGVkXCIgcG9pbnRzXG4gICAgICAgICAgICBmbGFnLnZlcnQgdjEyLCBtaWRwb2ludCBtaWRwb2ludCh2ZXJ0MSx2ZXJ0MiksIGNlbnRlcnNbaV0gXG4gICAgICBcbiAgICAgICAgICAgICMgaW5zZXQgTmZhY2UgbWFkZSBvZiBuZXcsIHN0ZWxsYXRlZCBwb2ludHNcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImluI3tpfVwiIHYxMiwgdjIzXG4gICAgICBcbiAgICAgICAgICAgICMgbmV3IHRyaSBmYWNlIGNvbnN0aXR1dGluZyB0aGUgcmVtYWluZGVyIG9mIHRoZSBzdGVsbGF0ZWQgTmZhY2VcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9I3t2Mn1cIiB2MjMsIHYxMlxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7aX0je3YyfVwiIHYxMiwgdjJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9I3t2Mn1cIiB2MiwgIHYyM1xuICAgICAgXG4gICAgICAgICAgICAjIG9uZSBvZiB0aGUgdHdvIG5ldyB0cmlhbmdsZXMgcmVwbGFjaW5nIG9sZCBlZGdlIGJldHdlZW4gdjEtPnYyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3t2MTJ9XCIgdjEsICB2MjFcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje3YxMn1cIiB2MjEsIHYxMlxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7djEyfVwiIHYxMiwgdjFcbiAgICAgIFxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICAgICAgICAgICAgW3ZlcnQxLCB2ZXJ0Ml0gPSBbdmVydDIsIHZlcnQzXVxuICBcbiAgICBmbGFnLnRvcG9seSBcIlAje3BvbHkubmFtZX1cIlxuXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG5cbnRyaXN1YiA9IChwb2x5LCBuPTIpIC0+XG4gICAgXG4gICAgZm9yIGZuIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgaWYgcG9seS5mYWNlW2ZuXS5sZW5ndGggIT0gM1xuICAgICAgICAgICAgcmV0dXJuIHBvbHlcbiAgXG4gICAgdmVydHMgPSBbXVxuICAgIHZtYXAgPSB7fVxuICAgIHBvcyA9IDBcbiAgICBmb3IgZm4gaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ZuXVxuICAgICAgICBbaTEsIGkyLCBpM10gPSBmLnNsaWNlIC0zXG4gICAgICAgIHYxID0gcG9seS52ZXJ0ZXhbaTFdXG4gICAgICAgIHYyID0gcG9seS52ZXJ0ZXhbaTJdXG4gICAgICAgIHYzID0gcG9seS52ZXJ0ZXhbaTNdXG4gICAgICAgIHYyMSA9IHN1YiB2MiwgdjFcbiAgICAgICAgdjMxID0gc3ViIHYzLCB2MVxuICAgICAgICBmb3IgaSBpbiBbMC4ubl1cbiAgICAgICAgICAgIGZvciBqIGluIFswLi5uLWldXG4gICAgICAgICAgICAgICAgdiA9IGFkZCBhZGQodjEsIG11bHQoaS9uLCB2MjEpKSwgbXVsdChqL24sIHYzMSlcbiAgICAgICAgICAgICAgICB2bWFwW1widiN7Zm59LSN7aX0tI3tqfVwiXSA9IHBvcysrXG4gICAgICAgICAgICAgICAgdmVydHMucHVzaCB2XG4gIFxuICAgIEVQU0lMT05fQ0xPU0UgPSAxLjBlLThcbiAgICB1bmlxVnMgPSBbXVxuICAgIG5ld3BvcyA9IDBcbiAgICB1bmlxbWFwID0ge31cbiAgICBmb3IgdixpIGluIHZlcnRzXG4gICAgICAgIGlmIGkgaW4gdW5pcW1hcCB0aGVuIGNvbnRpbnVlICMgYWxyZWFkeSBtYXBwZWRcbiAgICAgICAgdW5pcW1hcFtpXSA9IG5ld3Bvc1xuICAgICAgICB1bmlxVnMucHVzaCB2XG4gICAgICAgIGZvciBqIGluIFtpKzEuLi52ZXJ0cy5sZW5ndGhdXG4gICAgICAgICAgICB3ID0gdmVydHNbal1cbiAgICAgICAgICAgIGlmIG1hZyhzdWIodiwgdykpIDwgRVBTSUxPTl9DTE9TRVxuICAgICAgICAgICAgICAgIHVuaXFtYXBbal0gPSBuZXdwb3NcbiAgICAgICAgbmV3cG9zKytcbiAgXG4gICAgZmFjZXMgPSBbXVxuICAgIGZvciBmbiBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgIGZvciBpIGluIFswLi4ubl1cbiAgICAgICAgICAgIGZvciBqIGluIFswLi4ubi1pXVxuICAgICAgICAgICAgICAgIGZhY2VzLnB1c2ggW3VuaXFtYXBbdm1hcFtcInYje2ZufS0je2l9LSN7an1cIl1dLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpKzF9LSN7an1cIl1dLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2orMX1cIl1dXVxuICAgICAgICBmb3IgaSBpbiBbMS4uLm5dXG4gICAgICAgICAgICBmb3IgaiBpbiBbMC4uLm4taV1cbiAgICAgICAgICAgICAgICBmYWNlcy5wdXNoIFt1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2p9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqKzF9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aS0xfS0je2orMX1cIl1dXVxuICBcbiAgICBuZXcgUG9seWhlZHJvbiBcInUje259I3twb2x5Lm5hbWV9XCIgZmFjZXMsIHVuaXFWc1xuXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4jIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbiMgU2xvdyBDYW5vbmljYWxpemF0aW9uIEFsZ29yaXRobVxuI1xuIyBUaGlzIGFsZ29yaXRobSBoYXMgc29tZSBjb252ZXJnZW5jZSBwcm9ibGVtcywgd2hhdCByZWFsbHkgbmVlZHMgdG8gYmUgZG9uZSBpcyB0b1xuIyBzdW0gdGhlIHRocmVlIGZvcmNpbmcgZmFjdG9ycyB0b2dldGhlciBhcyBhIGNvaGVyZW50IGZvcmNlIGFuZCB0byB1c2UgYSBoYWxmLWRlY2VudFxuIyBpbnRlZ3JhdG9yIHRvIG1ha2Ugc3VyZSB0aGF0IGl0IGNvbnZlcmdlcyB3ZWxsIGFzIG9wcG9zZWQgdG8gdGhlIGN1cnJlbnQgaGFjayBvZlxuIyBhZC1ob2Mgc3RhYmlsaXR5IG11bHRpcGxpZXJzLiAgSWRlYWxseSBvbmUgd291bGQgaW1wbGVtZW50IGEgY29uanVnYXRlIGdyYWRpZW50XG4jIGRlc2NlbnQgb3Igc2ltaWxhciBwcmV0dHkgdGhpbmcuXG4jXG4jIE9ubHkgdHJ5IHRvIHVzZSB0aGlzIG9uIGNvbnZleCBwb2x5aGVkcmEgdGhhdCBoYXZlIGEgY2hhbmNlIG9mIGJlaW5nIGNhbm9uaWNhbGl6ZWQsXG4jIG90aGVyd2lzZSBpdCB3aWxsIHByb2JhYmx5IGJsb3cgdXAgdGhlIGdlb21ldHJ5LiAgQSBtdWNoIHRyaWNraWVyIC8gc21hcnRlciBzZWVkLXN5bW1ldHJ5XG4jIGJhc2VkIGdlb21ldHJpY2FsIHJlZ3VsYXJpemVyIHNob3VsZCBiZSB1c2VkIGZvciBmYW5jaWVyL3dlaXJkZXIgcG9seWhlZHJhLlxuXG5jYW5vbmljYWxpemUgPSAocG9seSwgaXRlcj0yMDApIC0+XG5cbiAgICBmYWNlcyA9IHBvbHkuZmFjZVxuICAgIGVkZ2VzID0gcG9seS5lZGdlcygpXG4gICAgdmVydHMgPSBwb2x5LnZlcnRleFxuICAgIG1heENoYW5nZSA9IDEuMFxuICAgIGZvciBpIGluIFswLi5pdGVyXVxuICAgICAgICBvbGRWcyA9IGNvcHlWZWNBcnJheSB2ZXJ0c1xuICAgICAgICB2ZXJ0cyA9IHRhbmdlbnRpZnkgdmVydHMsIGVkZ2VzXG4gICAgICAgICMgdmVydHMgPSByZWNlbnRlciB2ZXJ0cywgZWRnZXNcbiAgICAgICAgdmVydHMgPSBwbGFuYXJpemUgdmVydHMsIGZhY2VzXG4gICAgICAgIG1heENoYW5nZSA9IF8ubWF4IF8ubWFwIF8uemlwKHZlcnRzLCBvbGRWcyksIChbeCwgeV0pIC0+IG1hZyBzdWIgeCwgeVxuICAgICAgICBpZiBtYXhDaGFuZ2UgPCAxZS04XG4gICAgICAgICAgICBicmVha1xuICAgICMgdmVydHMgPSByZXNjYWxlIHZlcnRzXG4gICAgIyBuZXcgUG9seWhlZHJvbiBwb2x5Lm5hbWUsIHBvbHkuZmFjZSwgdmVydHNcbiAgICBwb2x5LnZlcnRzID0gdmVydHNcbiAgICBwb2x5LnJlc2NhbGUoKVxuICAgICAgICBcbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gICAgZHVhbDogICAgICAgICAgIGR1YWxcbiAgICBiZXZlbDogICAgICAgICAgYmV2ZWxcbiAgICB0cmlzdWI6ICAgICAgICAgdHJpc3ViXG4gICAgdHJ1bmNhdGU6ICAgICAgIHRydW5jYXRlXG4gICAgcGVyc3BlY3RpdmE6ICAgIHBlcnNwZWN0aXZhXG4gICAga2lzOiAgICAgICAgICAgIGtpc1xuICAgIGFtYm86ICAgICAgICAgICBhbWJvXG4gICAgZ3lybzogICAgICAgICAgIGd5cm9cbiAgICBjaGFtZmVyOiAgICAgICAgY2hhbWZlclxuICAgIHdoaXJsOiAgICAgICAgICB3aGlybFxuICAgIHF1aW50bzogICAgICAgICBxdWludG9cbiAgICBpbnNldDogICAgICAgICAgaW5zZXRcbiAgICBleHRydWRlOiAgICAgICAgZXh0cnVkZVxuICAgIGV4cGFuZDogICAgICAgICBleHBhbmRcbiAgICBob2xsb3c6ICAgICAgICAgaG9sbG93XG4gICAgZmxhdHRlbjogICAgICAgIGZsYXR0ZW5cbiAgICB6aXJrdWxhcml6ZTogICAgemlya3VsYXJpemVcbiAgICBzcGhlcmljYWxpemU6ICAgc3BoZXJpY2FsaXplXG4gICAgY2Fub25pY2FsaXplOiAgIGNhbm9uaWNhbGl6ZVxuICAgICJdfQ==
//# sourceURL=../../coffee/poly/topo.coffee