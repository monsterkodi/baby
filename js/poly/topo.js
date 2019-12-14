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
        iterations = 1;
    }
    normals = poly.normals();
    neighbors = poly.neighbors();
    ref2 = poly.flatness(), flatness = ref2[0], vertexdist = ref2[1], offsets = ref2[2];
    if (flatness > 0.001) {
        poly.debug = [];
    }
    debug = true;
    while (iterations && flatness > 0.001) {
        klog(poly.name + " " + iterations + " " + flatness);
        iterations -= 1;
        for (vi = l = 0, ref3 = poly.vertex.length; 0 <= ref3 ? l < ref3 : l > ref3; vi = 0 <= ref3 ? ++l : --l) {
            if (neighbors[vi].length <= 2) {
                continue;
            }
            if (neighbors[vi].length >= 6) {
                continue;
            }
            if (debug) {
                poly.debugLine(poly.vertex[vi], add(poly.vertex[vi], offsets[vi]));
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
        clockwise(verts, face);
        faces.push(face);
    }
    for (o in vmap) {
        n = vmap[o];
        clockwise(verts, n);
        faces.push(n);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9wby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsa1pBQUE7SUFBQTs7QUFVQSxNQUFxQixPQUFBLENBQVEsS0FBUixDQUFyQixFQUFFLFNBQUYsRUFBSyxpQkFBTCxFQUFZOztBQUNaLE9BQWlMLE9BQUEsQ0FBUSxRQUFSLENBQWpMLEVBQUUsY0FBRixFQUFPLGtCQUFQLEVBQWMsZ0NBQWQsRUFBNEIsMEJBQTVCLEVBQXVDLGdDQUF2QyxFQUFxRCxrQkFBckQsRUFBNEQsMEJBQTVELEVBQXVFLGNBQXZFLEVBQTRFLHdCQUE1RSxFQUFzRixnQkFBdEYsRUFBNEYsY0FBNUYsRUFBaUcsd0JBQWpHLEVBQTJHLDBCQUEzRyxFQUFzSCx3QkFBdEgsRUFBZ0ksb0JBQWhJLEVBQXdJLG9CQUF4SSxFQUFnSixjQUFoSixFQUFxSiw0QkFBckosRUFBaUssa0JBQWpLLEVBQXdLOztBQUN0SyxNQUFROztBQUVWLElBQUEsR0FBTyxPQUFBLENBQVEsU0FBUjs7QUFDUCxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0FBQ1AsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztBQUViLE9BQUEsR0FBVSxTQUFDLEVBQUQsRUFBSyxFQUFMO1dBQVksRUFBQSxHQUFHLEVBQUgsSUFBVSxDQUFHLEVBQUQsR0FBSSxHQUFKLEdBQU8sRUFBVCxDQUFWLElBQTJCLENBQUcsRUFBRCxHQUFJLEdBQUosR0FBTyxFQUFUO0FBQXZDOztBQVFWLE9BQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxVQUFQO0FBRU4sUUFBQTs7UUFGYSxhQUFXOztJQUV4QixPQUFBLEdBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBQTtJQUNWLFNBQUEsR0FBWSxJQUFJLENBQUMsU0FBTCxDQUFBO0lBQ1osT0FBZ0MsSUFBSSxDQUFDLFFBQUwsQ0FBQSxDQUFoQyxFQUFDLGtCQUFELEVBQVUsb0JBQVYsRUFBcUI7SUFFckIsSUFB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O0lBSUEsV0FBQSxFQUFnQixXQUpoQjtJQUtBLEdBQUEsRUFBZ0IsR0FMaEI7SUFNQSxJQUFBLEVBQWdCLElBTmhCO0lBT0EsSUFBQSxFQUFnQixJQVBoQjtJQVFBLE9BQUEsRUFBZ0IsT0FSaEI7SUFTQSxLQUFBLEVBQWdCLEtBVGhCO0lBVUEsTUFBQSxFQUFnQixNQVZoQjtJQVdBLEtBQUEsRUFBZ0IsS0FYaEI7SUFZQSxPQUFBLEVBQWdCLE9BWmhCO0lBYUEsTUFBQSxFQUFnQixNQWJoQjtJQWNBLE1BQUEsRUFBZ0IsTUFkaEI7SUFlQSxPQUFBLEVBQWdCLE9BZmhCO0lBZ0JBLFdBQUEsRUFBZ0IsV0FoQmhCO0lBaUJBLFlBQUEsRUFBZ0IsWUFqQmhCO0lBa0JBLFlBQUEsRUFBZ0IsWUFsQmhCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgICAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgICAgXG4gICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICAgMDAwMDAwMCAgICAgXG4jIyNcblxuIyBQb2x5aMOpZHJvbmlzbWUsIENvcHlyaWdodCAyMDE5LCBBbnNlbG0gTGV2c2theWEsIE1JVCBMaWNlbnNlXG5cbnsgXywgY2xhbXAsIGtsb2cgfSA9IHJlcXVpcmUgJ2t4aydcbnsgYWRkLCBhbmdsZSwgY2FsY0NlbnRyb2lkLCBjbG9ja3dpc2UsIGNvcHlWZWNBcnJheSwgY3Jvc3MsIGludGVyc2VjdCwgbWFnLCBtaWRwb2ludCwgbXVsdCwgbmVnLCBvbmVUaGlyZCwgcGxhbmFyaXplLCByYXlQbGFuZSwgcmF5UmF5LCByb3RhdGUsIHN1YiwgdGFuZ2VudGlmeSwgdHdlZW4sIHVuaXQgfSA9IHJlcXVpcmUgJy4vbWF0aCdcbnsgbWluIH0gPSBNYXRoXG5cblZlY3QgPSByZXF1aXJlICcuLi92ZWN0J1xuRmxhZyA9IHJlcXVpcmUgJy4vZmxhZydcblBvbHloZWRyb24gPSByZXF1aXJlICcuL3BvbHloZWRyb24nXG5cbm1pZE5hbWUgPSAodjEsIHYyKSAtPiB2MTx2MiBhbmQgXCIje3YxfV8je3YyfVwiIG9yIFwiI3t2Mn1fI3t2MX1cIlxuXG4jIDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwICAwMDAgIFxuIyAwMDAwMDAgICAgMDAwICAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAwMDAwICBcbiMgMDAwICAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5mbGF0dGVuID0gKHBvbHksIGl0ZXJhdGlvbnM9MSkgLT5cbiAgICBcbiAgICBub3JtYWxzID0gcG9seS5ub3JtYWxzKClcbiAgICBuZWlnaGJvcnMgPSBwb2x5Lm5laWdoYm9ycygpXG4gICAgW2ZsYXRuZXNzLHZlcnRleGRpc3Qsb2Zmc2V0c10gPSBwb2x5LmZsYXRuZXNzKClcblxuICAgIGlmIGZsYXRuZXNzID4gMC4wMDFcbiAgICAgICAgcG9seS5kZWJ1ZyA9IFtdXG4gICAgZGVidWcgPSB0cnVlXG4gICAgd2hpbGUgaXRlcmF0aW9ucyBhbmQgZmxhdG5lc3MgPiAwLjAwMVxuICAgICAgICBrbG9nIFwiI3twb2x5Lm5hbWV9ICN7aXRlcmF0aW9uc30gI3tmbGF0bmVzc31cIlxuICAgICAgICBpdGVyYXRpb25zIC09IDFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBmb3IgdmkgaW4gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdXG4gICAgICAgICAgICBjb250aW51ZSBpZiBuZWlnaGJvcnNbdmldLmxlbmd0aCA8PSAyXG4gICAgICAgICAgICBjb250aW51ZSBpZiBuZWlnaGJvcnNbdmldLmxlbmd0aCA+PSA2XG5cbiAgICAgICAgICAgIGlmIGRlYnVnXG4gICAgICAgICAgICAgICAgcG9seS5kZWJ1Z0xpbmUgcG9seS52ZXJ0ZXhbdmldLCBhZGQgcG9seS52ZXJ0ZXhbdmldLCBvZmZzZXRzW3ZpXVxuICAgICAgICAgICAgcG9seS52ZXJ0ZXhbdmldID0gYWRkIHBvbHkudmVydGV4W3ZpXSwgbXVsdCAwLjMsIG9mZnNldHNbdmldXG4gICAgICAgIFxuICAgICAgICBkZWJ1ZyA9IGZhbHNlXG4gICAgICAgIFtmbGF0bmVzcyx2ZXJ0ZXhkaXN0LG9mZnNldHNdID0gcG9seS5mbGF0bmVzcygpICAgICAgICAgICAgXG4gICAgIyBlbHNlXG4gICAgICAgICMga2xvZyBcImZsYWNoIHdpZSBlaW5lIGZsdW5kZXIgI3twb2x5Lm5hbWV9XCJcbiAgICAgICAgXG4gICAgcG9seVxuXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgXG5cbmhvbGxvdyA9IChwb2x5LCBpbnNldGY9MC41LCB0aGlja25lc3M9MC41KSAtPlxuXG4gICAgaW5zZXRmICAgID0gY2xhbXAgMC4xIDAuOSBpbnNldGZcbiAgICBub3JtYWxzICAgPSBwb2x5Lm5vcm1hbHMoKVxuICAgIGNlbnRlcnMgICA9IHBvbHkuY2VudGVycygpXG4gICAgd2luZ3MgICAgID0gcG9seS53aW5ncygpXG4gICAgbmVpZ2hib3JzID0gcG9seS5uZWlnaGJvcnMoKVxuICAgIFxuICAgIHRoaWNrbmVzcyA/PSBJbmZpbml0eVxuICAgIFxuICAgIHNldCA9IHt9XG4gICAgaW5zID0gKGUsZikgLT5cbiAgICAgICAgc2V0W2VdID89IHt9XG4gICAgICAgIGlmIG5vdCBzZXRbZV1bZl1cbiAgICAgICAgICAgIHNldFtlXVtmXSA9IHR3ZWVuIHBvbHkudmVydGV4W2VdLCBjZW50ZXJzW2ZdLCBpbnNldGZcbiAgICAgICAgc2V0W2VdW2ZdXG4gICAgICAgIFxuICAgIGRldCA9IHt9XG4gICAgaW5kID0gKGUsZikgLT5cbiAgICAgICAgZGV0W2VdID89IHt9XG4gICAgICAgIGlmIG5vdCBkZXRbZV1bZl1cbiAgICAgICAgICAgIGRldFtlXVtmXSA9IGFkZCBpbnMoZSxmKSwgbXVsdCAtdGhpY2tuZXNzLCBub3JtYWxzW2ZdXG4gICAgICAgIGRldFtlXVtmXVxuICAgICAgICBcbiAgICBmb3Igd2luZyBpbiB3aW5nc1xuICAgICAgICBmciA9IHdpbmdbMl0uZnJcbiAgICAgICAgZmwgPSB3aW5nWzJdLmZsXG4gICAgICAgIGlyID0gaW5zIHdpbmdbMV0sIGZyXG4gICAgICAgIGlsID0gaW5zIHdpbmdbMV0sIGZsXG4gICAgICAgICAgXG4gICAgICAgIG5yID0gbmVnIG5vcm1hbHNbZnJdXG4gICAgICAgIG5sID0gbmVnIG5vcm1hbHNbZmxdXG4gICAgICAgICAgIFxuICAgICAgICBsciA9IHJheVJheSBbaXIsIGFkZCBpciwgbnJdLCBbaWwsIGFkZCBpbCwgbmxdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHRoaWNrbmVzcyA9IG1pbiB0aGlja25lc3MsIG1hZyBzdWIgaXIsIGxyXG4gICAgICAgIHRoaWNrbmVzcyA9IG1pbiB0aGlja25lc3MsIG1hZyBzdWIgaWwsIGxyXG4gICAgICAgICAgICAgICAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGV4Lmxlbmd0aF1cbiAgICAgICAgcCA9IHBvbHkudmVydGV4W2ldXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgcFxuXG4gICAgZm9yIGZpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZmFjZSA9IHBvbHkuZmFjZVtmaV1cbiAgICAgICAgZm9yIHZpIGluIGZhY2VcbiAgICAgICAgICAgIGZsYWcudmVydCBcImZpbiN7Zml9diN7dml9XCIgICAgIGlucyB2aSwgZmlcbiAgICAgICAgICAgIGZsYWcudmVydCBcImZpbmRvd24je2ZpfXYje3ZpfVwiIGluZCB2aSwgZmlcbiAgXG4gICAgZm9yIGZpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtmaV1cbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2MiA9IFwidiN7dn1cIlxuICAgICAgICAgICAgaTEgPSBcImZpbiN7Zml9I3t2MX1cIlxuICAgICAgICAgICAgaTIgPSBcImZpbiN7Zml9I3t2Mn1cIlxuICAgICAgICAgICAgZjEgPSBcImZpbmRvd24je2ZpfSN7djF9XCJcbiAgICAgICAgICAgIGYyID0gXCJmaW5kb3duI3tmaX0je3YyfVwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZuYW1lID0gXCJ0b3BzI3tmaX0je3YxfVwiXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYxLCB2MlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MiwgaTJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgaTIsIGkxXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIGkxLCB2MVxuICAgICAgXG4gICAgICAgICAgICBmbmFtZSA9IFwic2lkZXMje2ZpfSN7djF9XCJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgaTEsIGkyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIGkyLCBmMlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBmMiwgZjFcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgZjEsIGkxXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHYxID0gdjJcbiAgICAgICBcbiAgICB2ZXJ0ZXhNYXAgPSB7fVxuICAgIGZvciB3aW5nIGluIHdpbmdzXG4gICAgICAgIGZyID0gd2luZ1syXS5mclxuICAgICAgICBmbCA9IHdpbmdbMl0uZmwgICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICB2MSA9IFwiZmluZG93biN7ZnJ9diN7d2luZ1swXX1cIlxuICAgICAgICB2MiA9IFwiZmluZG93biN7ZnJ9diN7d2luZ1sxXX1cIlxuICAgICAgICB2MyA9IFwiZmluZG93biN7Zmx9diN7d2luZ1sxXX1cIlxuICAgICAgICB2NCA9IFwiZmluZG93biN7Zmx9diN7d2luZ1swXX1cIlxuICAgICAgICBcbiAgICAgICAgaWYgMC4wMDEgPCBtYWcgc3ViIGluZCh3aW5nWzFdLCBmciksIGluZCh3aW5nWzFdLCBmbClcbiAgICAgICAgXG4gICAgICAgICAgICBmbmFtZSA9IFwic3RpdGNoXyN7Zmx9XyN7ZnJ9XCJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjEsIHYyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYyLCB2M1xuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MywgdjRcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjQsIHYxXG4gICAgICAgICAgICBcbiAgICAgICAgdmVydGV4TWFwW3dpbmdbMF1dID89IHt9XG4gICAgICAgIHZlcnRleE1hcFt3aW5nWzBdXVt3aW5nWzFdXSA9IFt2MSwgdjRdXG4gICAgICAgIHZlcnRleE1hcFt3aW5nWzFdXSA/PSB7fVxuICAgICAgICB2ZXJ0ZXhNYXBbd2luZ1sxXV1bd2luZ1swXV0gPSBbdjMsIHYyXVxuXG4gICAgZm9yIG5zLHZpIGluIG5laWdoYm9yc1xuICAgICAgICBmb3IgbmkgaW4gbnNcbiAgICAgICAgICAgIGVkZ2UgPSB2ZXJ0ZXhNYXBbdmldW25pXVxuICAgICAgICAgICAgZmxhZy5lZGdlIFwic25pdGNoXyN7dml9XCIsIGVkZ2VbMF0sIGVkZ2VbMV1cbiAgXG4gICAgZmxhZy50b3BvbHkgXCJoI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuXG5leHBhbmQgPSAocG9seSwgYW1vdW50PTAuNSkgLT5cblxuICAgIGFtb3VudCAgICA9IGNsYW1wIDAgMTAgYW1vdW50XG4gICAgb2xkZWRnZXMgID0gcG9seS5lZGdlcygpXG4gICAgY2VudGVycyAgID0gcG9seS5jZW50ZXJzKClcbiAgICBuZWlnaGJvcnMgPSBwb2x5Lm5laWdoYm9ycygpXG4gICAgd2luZ3MgICAgID0gcG9seS53aW5ncygpXG4gICAgICAgIFxuICAgIHZlcnRzID0gW11cbiAgICBmYWNlcyA9IFtdXG4gICAgdm1hcCAgPSB7fVxuICAgIGltYXAgID0ge31cbiAgICBuZXdWICA9IDBcbiAgICBmb3IgZmkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBkID0gc3ViIG11bHQoMSthbW91bnQsIGNlbnRlcnNbZmldKSwgY2VudGVyc1tmaV1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtmaV1cbiAgICAgICAgZmFjZSA9IFtdXG4gICAgICAgIGZvciB2LHZpIGluIGZcbiAgICAgICAgICAgIHZtYXBbdl0gPz0gW11cbiAgICAgICAgICAgIHZtYXBbdl0ucHVzaCBuZXdWXG4gICAgICAgICAgICBpbWFwW25ld1ZdID0gdlxuICAgICAgICAgICAgdmVydHMucHVzaCBhZGQgcG9seS52ZXJ0ZXhbdl0sIGRcbiAgICAgICAgICAgIG5leHRWID0gbmV3Visodmk9PWYubGVuZ3RoLTEgYW5kIC1mLmxlbmd0aCsxIG9yIDEpXG4gICAgICAgICAgICBmYWNlLnB1c2ggbmV3VlxuICAgICAgICAgICAgbmV3VisrXG4gICAgICAgIGZhY2VzLnB1c2ggZmFjZVxuICAgICAgICAgICAgXG4gICAgZm9yIHdpbmcgaW4gd2luZ3NcbiAgICAgICAgW2EsYl0gPSB3aW5nXG4gICAgICAgIGZhY2UgPSB2bWFwW2FdLmNvbmNhdCB2bWFwW2JdXG4gICAgICAgIGZhY2UgPSBmYWNlLmZpbHRlciAodikgLT4gKHYgaW4gZmFjZXNbd2luZ1syXS5mcl0pIG9yICh2IGluIGZhY2VzW3dpbmdbMl0uZmxdKVxuICAgICAgICBjbG9ja3dpc2UgdmVydHMsIGZhY2VcbiAgICAgICAgZmFjZXMucHVzaCBmYWNlXG5cbiAgICBmb3IgbyxuIG9mIHZtYXBcbiAgICAgICAgY2xvY2t3aXNlIHZlcnRzLCBuXG4gICAgICAgIGZhY2VzLnB1c2ggblxuICAgICAgICBcbiAgICBuZXcgUG9seWhlZHJvbiBcImUje3BvbHkubmFtZX1cIiBmYWNlcywgdmVydHNcblxuIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuIyAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxuc3BoZXJpY2FsaXplID0gKHBvbHkpIC0+XG5cbiAgICB2ZXJ0cyA9IFtdXG4gICAgZm9yIHZlcnRleCx2aSBpbiBwb2x5LnZlcnRleFxuICAgICAgICB2ZXJ0cy5wdXNoIHVuaXQgcG9seS52ZXJ0ZXhbdmldXG4gICAgICAgIFxuICAgIG5ldyBQb2x5aGVkcm9uIFwieiN7cG9seS5uYW1lfVwiIHBvbHkuZmFjZSwgdmVydHNcblxuIyAwMDAwMDAwICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4jICAgMDAwICAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuIyAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbnppcmt1bGFyaXplID0gKHBvbHksIGdyb3c9MSwgbj02KSAtPlxuXG4gICAgdmVydGljZXMgPSBbXVxuICAgIFxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIFxuICAgIGZvciBmLGZpIGluIHBvbHkuZmFjZVxuXG4gICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICAgICAgYXhpcyA9IGNyb3NzIGNlbnRlcnNbZmldLCBwb2x5LnZlcnRleFt2XVxuICAgICAgICAgICAgICAgIGFuZ2wgPSBhbmdsZSBjZW50ZXJzW2ZpXSwgcG9seS52ZXJ0ZXhbdl1cbiAgICAgICAgICAgICAgICB2ZXJ0aWNlc1t2XSA9IHJvdGF0ZSBjZW50ZXJzW2ZpXSwgYXhpcywgYW5nbCAqIGdyb3dcbiAgICAgICAgICAgICAgICBcbiAgICB2ZXJ0cyA9IFswLi4ucG9seS52ZXJ0ZXgubGVuZ3RoXS5tYXAgKGkpIC0+IHZlcnRpY2VzW2ldID8gcG9seS52ZXJ0ZXhbaV1cbiAgICAgXG4gICAgbmV3IFBvbHloZWRyb24gXCJ6I3twb2x5Lm5hbWV9XCIgcG9seS5mYWNlLCB2ZXJ0c1xuXG4jIDAwMDAwMDAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICBcblxuZHVhbCA9IChwb2x5KSAtPlxuXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgZmFjZSA9IFtdIFxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0ZXgubGVuZ3RoXSBcbiAgICAgICAgZmFjZVtpXSA9IHt9XG5cbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VbaV1cbiAgICAgICAgdjEgPSBmWy0xXVxuICAgICAgICBmb3IgdjIgaW4gZlxuICAgICAgICAgICAgZmFjZVt2MV1bXCJ2I3t2Mn1cIl0gPSBcIiN7aX1cIlxuICAgICAgICAgICAgdjEgPSB2MlxuICBcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgIGZsYWcudmVydCBcIiN7aX1cIiBjZW50ZXJzW2ldXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICB2MSA9IGZbLTFdXG4gICAgICAgIGZvciB2MiBpbiBmXG4gICAgICAgICAgICBmbGFnLmVkZ2UgdjEsIGZhY2VbdjJdW1widiN7djF9XCJdLCBcIiN7aX1cIlxuICAgICAgICAgICAgdjEgPSB2MlxuICBcbiAgICBkcG9seSA9IGZsYWcudG9wb2x5KClcbiAgXG4gICAgc29ydEYgPSBbXVxuICAgIGZvciBmIGluIGRwb2x5LmZhY2VcbiAgICAgICAgayA9IGludGVyc2VjdCBwb2x5LmZhY2VbZlswXV0sIHBvbHkuZmFjZVtmWzFdXSwgcG9seS5mYWNlW2ZbMl1dXG4gICAgICAgIHNvcnRGW2tdID0gZlxuICAgIGRwb2x5LmZhY2UgPSBzb3J0RlxuICBcbiAgICBpZiBwb2x5Lm5hbWVbMF0gIT0gXCJkXCJcbiAgICAgICAgZHBvbHkubmFtZSA9IFwiZCN7cG9seS5uYW1lfVwiXG4gICAgZWxzZSBcbiAgICAgICAgZHBvbHkubmFtZSA9IHBvbHkubmFtZS5zbGljZSAxXG4gIFxuICAgIGRwb2x5XG5cbiMgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgIDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbiMgS2lzIChhYmJyZXZpYXRlZCBmcm9tIHRyaWFraXMpIHRyYW5zZm9ybXMgYW4gTi1zaWRlZCBmYWNlIGludG8gYW4gTi1weXJhbWlkIHJvb3RlZCBhdCB0aGVcbiMgc2FtZSBiYXNlIHZlcnRpY2VzLiBvbmx5IGtpcyBuLXNpZGVkIGZhY2VzLCBidXQgbj09MCBtZWFucyBraXMgYWxsLlxuXG5raXMgPSAocG9seSwgYXBleGRpc3Q9MC41LCBuPTApIC0+XG5cbiAgICBhcGV4ZGlzdCA9IGNsYW1wIC0xIDEwIGFwZXhkaXN0XG4gICAgXG4gICAgaWYgYXBleGRpc3QgPCAwXG4gICAgICAgIGFwZXhkaXN0ID0gYXBleGRpc3QgKiBwb2x5Lm1pbkZhY2VEaXN0KClcbiAgICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0ZXgubGVuZ3RoXVxuICAgICAgICBmbGFnLnZlcnQgXCJ2I3tpfVwiIHBvbHkudmVydGV4W2ldXG4gIFxuICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIGZvdW5kQW55ID0gZmFsc2VcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VbaV1cbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgdjIgPSBcInYje3Z9XCJcbiAgICAgICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICAgICAgZm91bmRBbnkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGFwZXggPSBcImFwZXgje2l9XCJcbiAgICAgICAgICAgICAgICBmbmFtZSA9IFwiI3tpfSN7djF9XCJcblxuICAgICAgICAgICAgICAgIGZsYWcudmVydCBhcGV4LCBhZGQgY2VudGVyc1tpXSwgbXVsdCBhcGV4ZGlzdCwgbm9ybWFsc1tpXVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgICB2MSwgICB2MlxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgICB2MiwgYXBleFxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgYXBleCwgICB2MVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZSBcIiN7aX1cIiwgdjEsIHYyXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHYxID0gdjJcbiAgXG4gICAgaWYgbm90IGZvdW5kQW55XG4gICAgICAgIGtsb2cgXCJObyAje259LWZvbGQgY29tcG9uZW50cyB3ZXJlIGZvdW5kLlwiXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiayN7bn0je3BvbHkubmFtZX1cIlxuXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgXG5cbnRydW5jYXRlID0gKHBvbHksIGZhY3Rvcj0wLjUpIC0+XG5cbiAgICBmYWN0b3IgPSBjbGFtcCAwIDEgZmFjdG9yXG4gICAgZWRnZU1hcCA9IHt9XG4gICAgXG4gICAgbnVtRmFjZXMgICAgPSBwb2x5LmZhY2UubGVuZ3RoXG4gICAgbnVtVmVydGljZXMgPSBwb2x5LnZlcnRleC5sZW5ndGhcbiAgICBuZWlnaGJvcnMgICA9IHBvbHkubmVpZ2hib3JzKClcbiAgICBcbiAgICBkZXB0aCA9IDAuNSAqIGZhY3RvciAqIHBvbHkubWluRWRnZUxlbmd0aCgpXG4gICAgXG4gICAgZm9yIHZlcnRleEluZGV4IGluIFswLi4ubnVtVmVydGljZXNdXG4gICAgICAgIFxuICAgICAgICBlZGdlTWFwW3ZlcnRleEluZGV4XSA/PSB7fVxuICAgICAgICBmYWNlID0gW11cbiAgICAgICAgXG4gICAgICAgIG5sID0gbmVpZ2hib3JzW3ZlcnRleEluZGV4XS5sZW5ndGhcbiAgICAgICAgZm9yIGlpIGluIFswLi4ubmxdXG4gICAgICAgICAgICBuaSA9IG5laWdoYm9yc1t2ZXJ0ZXhJbmRleF1baWldXG4gICAgICAgICAgICBlZGdlTWFwW3ZlcnRleEluZGV4XVtuaV0gPSBwb2x5LnZlcnRleC5sZW5ndGhcbiAgICAgICAgICAgIHZwID0gcG9seS5lZGdlIHZlcnRleEluZGV4LCBuaVxuICAgICAgICAgICAgdnAubm9ybWFsaXplKClcbiAgICAgICAgICAgIHZwLnNjYWxlSW5QbGFjZSBkZXB0aFxuICAgICAgICAgICAgdnAuYWRkSW5QbGFjZSBwb2x5LnZlcnQgdmVydGV4SW5kZXhcbiAgICAgICAgICAgIGZhY2UucHVzaCBwb2x5LnZlcnRleC5sZW5ndGhcbiAgICAgICAgICAgIHBvbHkudmVydGV4LnB1c2ggW3ZwLngsIHZwLnksIHZwLnpdXG4gICAgICAgICAgICBcbiAgICAgICAgcG9seS5mYWNlLnB1c2ggZmFjZVxuICAgIFxuICAgIGZvciBmaSBpbiBbMC4uLm51bUZhY2VzXVxuICAgICAgICBmYWNlID0gcG9seS5mYWNlW2ZpXVxuICAgICAgICBuZXdGYWNlID0gW11cbiAgICAgICAgZm9yIHZpIGluIFswLi4uZmFjZS5sZW5ndGhdXG4gICAgICAgICAgICBuaSA9ICh2aSsxKSAlIGZhY2UubGVuZ3RoXG4gICAgICAgICAgICBuZXdGYWNlLnB1c2ggZWRnZU1hcFtmYWNlW3ZpXV1bZmFjZVtuaV1dXG4gICAgICAgICAgICBpZiBmYWN0b3IgPCAxXG4gICAgICAgICAgICAgICAgbmV3RmFjZS5wdXNoIGVkZ2VNYXBbZmFjZVtuaV1dW2ZhY2VbdmldXVxuICAgICAgICBwb2x5LmZhY2VbZmldID0gbmV3RmFjZVxuICAgICAgXG4gICAgcG9seS52ZXJ0ZXguc3BsaWNlIDAsIG51bVZlcnRpY2VzXG4gICAgZm9yIGZhY2UgaW4gcG9seS5mYWNlXG4gICAgICAgIGZvciBpIGluIFswLi4uZmFjZS5sZW5ndGhdXG4gICAgICAgICAgICBmYWNlW2ldIC09IG51bVZlcnRpY2VzXG4gICAgICAgIFxuICAgIHBvbHlcbiAgICBcbiMgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICBcblxuIyBUb3BvbG9naWNhbCBcInR3ZWVuXCIgYmV0d2VlbiBhIHBvbHloZWRyb24gYW5kIGl0cyBkdWFsIHBvbHloZWRyb24uXG5cbmFtYm8gPSAocG9seSkgLT5cbiAgICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VbaV1cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlKC0yKVxuICAgICAgICBmb3IgdjMgaW4gZlxuICAgICAgICAgICAgaWYgdjEgPCB2MlxuICAgICAgICAgICAgICAgIGZsYWcudmVydCBtaWROYW1lKHYxLHYyKSwgbWlkcG9pbnQgcG9seS52ZXJ0ZXhbdjFdLCBwb2x5LnZlcnRleFt2Ml1cblxuICAgICAgICAgICAgZmxhZy5lZGdlIFwib3JpZyN7aX1cIiAgbWlkTmFtZSh2MSx2MiksIG1pZE5hbWUodjIsdjMpXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJkdWFsI3t2Mn1cIiBtaWROYW1lKHYyLHYzKSwgbWlkTmFtZSh2MSx2MilcblxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICBcbiAgICBmbGFnLnRvcG9seSBcImEje3BvbHkubmFtZX1cIlxuXG5iZXZlbCA9IChwb2x5LCBmYWN0b3I9MC41KSAtPlxuICAgIFxuICAgIHAgPSB0cnVuY2F0ZSBhbWJvKHBvbHkpLCBmYWN0b3JcbiAgICBwLm5hbWUgPSBcImIje3BvbHkubmFtZX1cIlxuICAgIHBcbiAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcblxuY2hhbWZlciA9IChwb2x5LCBmYWN0b3I9MC41KSAtPlxuICAgIFxuICAgIGZhY3RvciAgPSBjbGFtcCAwLjAwMSAwLjk5NSBmYWN0b3JcbiAgICBmbGFnICAgID0gbmV3IEZsYWcoKVxuICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIHdpbmdzICAgPSBwb2x5LndpbmdzKClcbiAgICAgICAgXG4gICAgbWluRWRnZUxlbmd0aCA9IEluZmluaXR5XG4gICAgXG4gICAgZm9yIGVkZ2UgaW4gd2luZ3NcbiAgICAgICAgZTAgPSBwb2x5LnZlcnRleFtlZGdlWzBdXVxuICAgICAgICBlMSA9IHBvbHkudmVydGV4W2VkZ2VbMV1dXG4gICAgICAgIGVkID0gdW5pdCBzdWIgZTEsIGUwXG4gICAgICAgIFxuICAgICAgICBuciA9IHVuaXQgc3ViIHBvbHkudmVydGV4W2VkZ2VbMl0ubnJdLCBlMVxuICAgICAgICBwciA9IHVuaXQgc3ViIHBvbHkudmVydGV4W2VkZ2VbMl0ucHJdLCBlMFxuICAgICAgICBjciA9IHJheVJheSBbZTEsIG11bHQgMC41LCBhZGQgYWRkKGUxLCBuciksIHN1YihlMSwgZWQpXSxcbiAgICAgICAgICAgICAgICAgICAgW2UwLCBtdWx0IDAuNSwgYWRkIGFkZChlMCwgcHIpLCBhZGQoZTAsIGVkKV1cblxuICAgICAgICBlbCA9IG1hZyBzdWIgZTEsIHJheVJheSBbZTEsIGFkZChlMSwgbnIpXSwgW2NyLCBhZGQoY3IsIGVkKV1cbiAgICAgICAgbWluRWRnZUxlbmd0aCA9IG1pbiBtaW5FZGdlTGVuZ3RoLCBlbFxuXG4gICAgICAgIGVsID0gbWFnIHN1YiBlMCwgcmF5UmF5IFtlMCwgYWRkKGUwLCBwcildLCBbY3IsIHN1YihjciwgZWQpXVxuICAgICAgICBtaW5FZGdlTGVuZ3RoID0gbWluIG1pbkVkZ2VMZW5ndGgsIGVsXG4gICAgICAgIFxuICAgIG1pbkVkZ2VMZW5ndGggKj0gZmFjdG9yXG4gICAgICAgIFxuICAgIG1vdmVkID0ge31cbiAgICBmb3IgZWRnZSBpbiB3aW5nc1xuICAgICAgICBlMCAgPSBwb2x5LnZlcnRleFtlZGdlWzBdXVxuICAgICAgICBlMSAgPSBwb2x5LnZlcnRleFtlZGdlWzFdXVxuICAgICAgICByciA9IFtcbiAgICAgICAgICAgIGFkZChlMCwgbXVsdCBtaW5FZGdlTGVuZ3RoLCB1bml0IHN1YiBwb2x5LnZlcnRleFtlZGdlWzJdLnByXSwgZTApLFxuICAgICAgICAgICAgYWRkKGUxLCBtdWx0IG1pbkVkZ2VMZW5ndGgsIHVuaXQgc3ViIHBvbHkudmVydGV4W2VkZ2VbMl0ubnJdLCBlMSldXG4gICAgICAgIGxyID0gW1xuICAgICAgICAgICAgYWRkKGUwLCBtdWx0IG1pbkVkZ2VMZW5ndGgsIHVuaXQgc3ViIHBvbHkudmVydGV4W2VkZ2VbMl0ucGxdLCBlMCksXG4gICAgICAgICAgICBhZGQoZTEsIG11bHQgbWluRWRnZUxlbmd0aCwgdW5pdCBzdWIgcG9seS52ZXJ0ZXhbZWRnZVsyXS5ubF0sIGUxKV1cbiAgICAgICAgICAgIFxuICAgICAgICBtb3ZlZFtcIiN7ZWRnZVsxXX3ilrgje2VkZ2VbMF19bFwiXSA9IHJyXG4gICAgICAgIG1vdmVkW1wiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1yXCJdID0gcnJcbiAgICAgICAgbW92ZWRbXCIje2VkZ2VbMV194pa4I3tlZGdlWzBdfXJcIl0gPSBsclxuICAgICAgICBtb3ZlZFtcIiN7ZWRnZVswXX3ilrgje2VkZ2VbMV19bFwiXSA9IGxyXG4gICAgICAgICAgICBcbiAgICBmb3IgZWRnZSBpbiB3aW5nc1xuICAgICAgICBlMCAgID0gcG9seS52ZXJ0ZXhbZWRnZVswXV1cbiAgICAgICAgZTEgICA9IHBvbHkudmVydGV4W2VkZ2VbMV1dXG4gICAgICAgIFxuICAgICAgICBuZiAgPSBcIiN7ZWRnZVswXX3ilrgje2VkZ2VbMV19XCIgXG4gICAgICAgIG5faCA9IFwiI3tlZGdlWzFdfVwiXG4gICAgICAgIG5fdCA9IFwiI3tlZGdlWzBdfVwiXG4gICAgICAgIFxuICAgICAgICBubnIgPSBcIiN7bl9ofeKWuCN7ZWRnZVsyXS5mcn1cIlxuICAgICAgICBubmwgPSBcIiN7bl9ofeKWuCN7ZWRnZVsyXS5mbH1cIlxuICAgICAgICBucHIgPSBcIiN7bl90feKWuCN7ZWRnZVsyXS5mcn1cIlxuICAgICAgICBucGwgPSBcIiN7bl90feKWuCN7ZWRnZVsyXS5mbH1cIiAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIG5yID0gcmF5UmF5IG1vdmVkW1wiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1yXCJdLCBtb3ZlZFtcIiN7ZWRnZVsxXX3ilrgje2VkZ2VbMl0ubnJ9clwiXVxuICAgICAgICBubCA9IHJheVJheSBtb3ZlZFtcIiN7ZWRnZVswXX3ilrgje2VkZ2VbMV19bFwiXSwgbW92ZWRbXCIje2VkZ2VbMV194pa4I3tlZGdlWzJdLm5sfWxcIl1cbiAgICAgICAgcHIgPSByYXlSYXkgbW92ZWRbXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfXJcIl0sIG1vdmVkW1wiI3tlZGdlWzJdLnByfeKWuCN7ZWRnZVswXX1yXCJdXG4gICAgICAgIHBsID0gcmF5UmF5IG1vdmVkW1wiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1sXCJdLCBtb3ZlZFtcIiN7ZWRnZVsyXS5wbH3ilrgje2VkZ2VbMF19bFwiXVxuICAgICAgICBcbiAgICAgICAgcG1pZCA9IG1pZHBvaW50IHBsLCBwclxuICAgICAgICBubWlkID0gbWlkcG9pbnQgbmwsIG5yXG4gICAgICAgIGNtaWQgPSBtaWRwb2ludCBwbWlkLCBubWlkXG4gICAgICAgIHBubSAgPSBjcm9zcyBzdWIocG1pZCxubWlkKSwgc3ViKHBsLHByKVxuXG4gICAgICAgIGhlYWQgPSByYXlQbGFuZSBbMCAwIDBdLCBlMSwgY21pZCwgcG5tXG4gICAgICAgIHRhaWwgPSByYXlQbGFuZSBbMCAwIDBdLCBlMCwgY21pZCwgcG5tXG4gICAgICAgIFxuICAgICAgICBmbGFnLnZlcnQgbl9oLCBoZWFkXG4gICAgICAgIGZsYWcudmVydCBuX3QsIHRhaWxcbiAgICAgICAgZmxhZy52ZXJ0IG5uciwgbnJcbiAgICAgICAgZmxhZy52ZXJ0IG5ubCwgbmxcbiAgICAgICAgZmxhZy52ZXJ0IG5wbCwgcGxcbiAgICAgICAgZmxhZy52ZXJ0IG5wciwgcHJcblxuICAgICAgICBmbGFnLmVkZ2UgbmYsIG5faCwgbm5yXG4gICAgICAgIGZsYWcuZWRnZSBuZiwgbm5yLCBucHJcbiAgICAgICAgZmxhZy5lZGdlIG5mLCBucHIsIG5fdFxuICAgICAgICBmbGFnLmVkZ2UgbmYsIG5fdCwgbnBsXG4gICAgICAgIGZsYWcuZWRnZSBuZiwgbnBsLCBubmxcbiAgICAgICAgZmxhZy5lZGdlIG5mLCBubmwsIG5faFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBmbGFnLmVkZ2UgXCIje2VkZ2VbMl0uZnJ9XCIgbnByLCBubnJcbiAgICAgICAgZmxhZy5lZGdlIFwiI3tlZGdlWzJdLmZsfVwiIG5ubCwgbnBsXG4gICAgICAgIFxuICAgIGZsYWcudG9wb2x5IFwiYyN7cG9seS5uYW1lfVwiXG5cbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICBcblxud2hpcmwgPSAocG9seSwgbj0wKSAtPlxuXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgdW5pdCBwb2x5LnZlcnRleFtpXVxuXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UgLTJcbiAgICAgICAgZm9yIGogaW4gWzAuLi5mLmxlbmd0aF1cbiAgICAgICAgICAgIHYgPSBmW2pdXG4gICAgICAgICAgICB2MyA9IHZcbiAgICAgICAgICAgIHYxXzIgPSBvbmVUaGlyZCBwb2x5LnZlcnRleFt2MV0sIHBvbHkudmVydGV4W3YyXVxuICAgICAgICAgICAgZmxhZy52ZXJ0KHYxK1wiflwiK3YyLCB2MV8yKVxuICAgICAgICAgICAgY3YxbmFtZSA9IFwiY2VudGVyI3tpfX4je3YxfVwiXG4gICAgICAgICAgICBjdjJuYW1lID0gXCJjZW50ZXIje2l9fiN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcudmVydCBjdjFuYW1lLCB1bml0IG9uZVRoaXJkIGNlbnRlcnNbaV0sIHYxXzJcbiAgICAgICAgICAgIGZuYW1lID0gaStcImZcIit2MVxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBjdjFuYW1lLCAgIHYxK1wiflwiK3YyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYxK1wiflwiK3YyLCB2MitcIn5cIit2MSBcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjIrXCJ+XCIrdjEsIFwidiN7djJ9XCIgIFxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBcInYje3YyfVwiLCAgdjIrXCJ+XCIrdjMgXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYyK1wiflwiK3YzLCBjdjJuYW1lXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIGN2Mm5hbWUsICAgY3YxbmFtZVxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiYyN7aX1cIiwgY3YxbmFtZSwgY3YybmFtZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gIFxuICAgIGNhbm9uaWNhbGl6ZSBmbGFnLnRvcG9seSBcIncje3BvbHkubmFtZX1cIlxuXG4jICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwMCAgICAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG5cbmd5cm8gPSAocG9seSkgLT5cblxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0ZXgubGVuZ3RoXVxuICAgICAgICBmbGFnLnZlcnQgXCJ2I3tpfVwiIHVuaXQgcG9seS52ZXJ0ZXhbaV1cblxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICBmbGFnLnZlcnQgXCJjZW50ZXIje2l9XCIgdW5pdCBjZW50ZXJzW2ldXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UoLTIpXG4gICAgICAgIGZvciBqIGluIFswLi4uZi5sZW5ndGhdXG4gICAgICAgICAgICB2ID0gZltqXVxuICAgICAgICAgICAgdjMgPSB2XG4gICAgICAgICAgICBmbGFnLnZlcnQgdjErXCJ+XCIrdjIsIG9uZVRoaXJkIHBvbHkudmVydGV4W3YxXSxwb2x5LnZlcnRleFt2Ml1cbiAgICAgICAgICAgIGZuYW1lID0gaStcImZcIit2MVxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBcImNlbnRlciN7aX1cIiAgdjErXCJ+XCIrdjJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjErXCJ+XCIrdjIsICB2MitcIn5cIit2MVxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MitcIn5cIit2MSwgIFwidiN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgXCJ2I3t2Mn1cIiAgICAgdjIrXCJ+XCIrdjNcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjIrXCJ+XCIrdjMsICBcImNlbnRlciN7aX1cIlxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICBcbiAgICBjYW5vbmljYWxpemUgZmxhZy50b3BvbHkgXCJnI3twb2x5Lm5hbWV9XCJcbiAgICBcbiMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuIyAwMDAgMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiMgMDAwIDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMCAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIFxuXG5xdWludG8gPSAocG9seSkgLT4gIyBjcmVhdGVzIGEgcGVudGFnb24gZm9yIGV2ZXJ5IHZlcnRleCBhbmQgYSBuZXcgaW5zZXQgZmFjZVxuICAgIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICBjZW50cm9pZCA9IGNhbGNDZW50cm9pZCBmLm1hcCAoaWR4KSAtPiBwb2x5LnZlcnRleFtpZHhdXG5cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlIC0yXG4gICAgICAgIGZvciB2MyBpbiBmXG4gICAgICAgICAgICBtaWRwdCA9IG1pZHBvaW50IHBvbHkudmVydGV4W3YxXSwgcG9seS52ZXJ0ZXhbdjJdXG4gICAgICAgICAgICBpbm5lcnB0ID0gbWlkcG9pbnQgbWlkcHQsIGNlbnRyb2lkXG4gICAgICAgICAgICBmbGFnLnZlcnQgbWlkTmFtZSh2MSx2MiksIG1pZHB0XG4gICAgICAgICAgICBmbGFnLnZlcnQgXCJpbm5lcl8je2l9X1wiICsgbWlkTmFtZSh2MSx2MiksIGlubmVycHRcbiAgICAgICAgICAgIGZsYWcudmVydCBcIiN7djJ9XCIgcG9seS52ZXJ0ZXhbdjJdXG4gICAgICAgICAgXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfV8je3YyfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpLCBtaWROYW1lKHYxLCB2MilcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9XyN7djJ9XCIsIG1pZE5hbWUodjEsIHYyKSwgXCIje3YyfVwiXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfV8je3YyfVwiLCBcIiN7djJ9XCIsIG1pZE5hbWUodjIsIHYzKVxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7aX1fI3t2Mn1cIiwgbWlkTmFtZSh2MiwgdjMpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfV8je3YyfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpXG4gICAgICBcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImZfaW5fI3tpfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpXG4gICAgICBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M11cbiAgXG4gICAgZmxhZy50b3BvbHkgXCJxI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDBcbiMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgXG4jIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgIFxuIyAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgMDAwICAgXG5cbmluc2V0ID0gKHBvbHksIGluc2V0PTAuNSwgcG9wb3V0PS0wLjIsIG49MCkgLT5cbiAgXG4gICAgaW5zZXQgPSBjbGFtcCAwLjI1IDAuOTkgaW5zZXRcbiAgICBwb3BvdXQgPSBtaW4gcG9wb3V0LCBpbnNldFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdXG4gICAgICAgIHAgPSBwb2x5LnZlcnRleFtpXVxuICAgICAgICBmbGFnLnZlcnQgXCJ2I3tpfVwiIHBcblxuICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICBpZiBmLmxlbmd0aCA9PSBuIG9yIG4gPT0gMFxuICAgICAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgICAgIGZsYWcudmVydCBcImYje2l9diN7dn1cIiBhZGQgdHdlZW4ocG9seS52ZXJ0ZXhbdl0sY2VudGVyc1tpXSxpbnNldCksIG11bHQocG9wb3V0LG5vcm1hbHNbaV0pXG4gIFxuICAgIGZvdW5kQW55ID0gZmFsc2UgIyBhbGVydCBpZiBkb24ndCBmaW5kIGFueVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MiA9IFwidiN7dn1cIjtcbiAgICAgICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICAgICAgZm91bmRBbnkgPSB0cnVlXG4gICAgICAgICAgICAgICAgZm5hbWUgPSBpICsgdjFcbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UoZm5hbWUsICAgICAgdjEsICAgICAgIHYyKVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZShmbmFtZSwgICAgICB2MiwgICAgICAgXCJmI3tpfSN7djJ9XCIpXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlKGZuYW1lLCBcImYje2l9I3t2Mn1cIiwgIFwiZiN7aX0je3YxfVwiKVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZShmbmFtZSwgXCJmI3tpfSN7djF9XCIsICB2MSlcbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UoXCJleCN7aX1cIiwgXCJmI3tpfSN7djF9XCIsICBcImYje2l9I3t2Mn1cIilcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UoaSwgdjEsIHYyKSAgXG4gICAgICAgICAgICB2MT12MlxuICBcbiAgICBpZiBub3QgZm91bmRBbnlcbiAgICAgICAga2xvZyBcIk5vICN7bn0tZm9sZCBjb21wb25lbnRzIHdlcmUgZm91bmQuXCJcbiAgXG4gICAgZmxhZy50b3BvbHkgXCJuI3tufSN7cG9seS5uYW1lfVwiXG5cbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG5cbmV4dHJ1ZGUgPSAocG9seSwgcG9wb3V0PTEsIGluc2V0Zj0wLjUsIG49MCkgLT5cbiAgICBuZXdwb2x5ID0gaW5zZXQgcG9seSwgaW5zZXRmLCBwb3BvdXQsIG5cbiAgICBuZXdwb2x5Lm5hbWUgPSBcIngje259I3twb2x5Lm5hbWV9XCJcbiAgICBuZXdwb2x5XG5cbiMgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwMDBcbiMgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuIyAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwICAgICAgMDAwICAgMDAwXG5cbnBlcnNwZWN0aXZhID0gKHBvbHkpIC0+ICMgYW4gb3BlcmF0aW9uIHJldmVyc2UtZW5naW5lZXJlZCBmcm9tIFBlcnNwZWN0aXZhIENvcnBvcnVtIFJlZ3VsYXJpdW1cblxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0ZXgubGVuZ3RoXVxuICAgICAgICBmbGFnLnZlcnQgXCJ2I3tpfVwiIHBvbHkudmVydGV4W2ldXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgXG4gICAgICAgIGYgPSBwb2x5LmZhY2VbaV1cbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMl19XCJcbiAgICAgICAgdjIgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgdmVydDEgPSBwb2x5LnZlcnRleFtmW2YubGVuZ3RoLTJdXVxuICAgICAgICB2ZXJ0MiA9IHBvbHkudmVydGV4W2ZbZi5sZW5ndGgtMV1dXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIHYzID0gXCJ2I3t2fVwiXG4gICAgICAgICAgICB2ZXJ0MyA9IHBvbHkudmVydGV4W3ZdXG4gICAgICAgICAgICB2MTIgPSB2MStcIn5cIit2MlxuICAgICAgICAgICAgdjIxID0gdjIrXCJ+XCIrdjFcbiAgICAgICAgICAgIHYyMyA9IHYyK1wiflwiK3YzXG4gICAgICBcbiAgICAgICAgICAgICMgb24gZWFjaCBOZmFjZSwgTiBuZXcgcG9pbnRzIGluc2V0IGZyb20gZWRnZSBtaWRwb2ludHMgdG93YXJkcyBjZW50ZXIgPSBcInN0ZWxsYXRlZFwiIHBvaW50c1xuICAgICAgICAgICAgZmxhZy52ZXJ0IHYxMiwgbWlkcG9pbnQgbWlkcG9pbnQodmVydDEsdmVydDIpLCBjZW50ZXJzW2ldIFxuICAgICAgXG4gICAgICAgICAgICAjIGluc2V0IE5mYWNlIG1hZGUgb2YgbmV3LCBzdGVsbGF0ZWQgcG9pbnRzXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJpbiN7aX1cIiB2MTIsIHYyM1xuICAgICAgXG4gICAgICAgICAgICAjIG5ldyB0cmkgZmFjZSBjb25zdGl0dXRpbmcgdGhlIHJlbWFpbmRlciBvZiB0aGUgc3RlbGxhdGVkIE5mYWNlXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfSN7djJ9XCIgdjIzLCB2MTJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9I3t2Mn1cIiB2MTIsIHYyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfSN7djJ9XCIgdjIsICB2MjNcbiAgICAgIFxuICAgICAgICAgICAgIyBvbmUgb2YgdGhlIHR3byBuZXcgdHJpYW5nbGVzIHJlcGxhY2luZyBvbGQgZWRnZSBiZXR3ZWVuIHYxLT52MlxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7djEyfVwiIHYxLCAgdjIxXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3t2MTJ9XCIgdjIxLCB2MTJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje3YxMn1cIiB2MTIsIHYxXG4gICAgICBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M11cbiAgICAgICAgICAgIFt2ZXJ0MSwgdmVydDJdID0gW3ZlcnQyLCB2ZXJ0M11cbiAgXG4gICAgZmxhZy50b3BvbHkgXCJQI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuXG50cmlzdWIgPSAocG9seSwgbj0yKSAtPlxuICAgIFxuICAgIGZvciBmbiBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgIGlmIHBvbHkuZmFjZVtmbl0ubGVuZ3RoICE9IDNcbiAgICAgICAgICAgIHJldHVybiBwb2x5XG4gIFxuICAgIHZlcnRzID0gW11cbiAgICB2bWFwID0ge31cbiAgICBwb3MgPSAwXG4gICAgZm9yIGZuIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtmbl1cbiAgICAgICAgW2kxLCBpMiwgaTNdID0gZi5zbGljZSAtM1xuICAgICAgICB2MSA9IHBvbHkudmVydGV4W2kxXVxuICAgICAgICB2MiA9IHBvbHkudmVydGV4W2kyXVxuICAgICAgICB2MyA9IHBvbHkudmVydGV4W2kzXVxuICAgICAgICB2MjEgPSBzdWIgdjIsIHYxXG4gICAgICAgIHYzMSA9IHN1YiB2MywgdjFcbiAgICAgICAgZm9yIGkgaW4gWzAuLm5dXG4gICAgICAgICAgICBmb3IgaiBpbiBbMC4ubi1pXVxuICAgICAgICAgICAgICAgIHYgPSBhZGQgYWRkKHYxLCBtdWx0KGkvbiwgdjIxKSksIG11bHQoai9uLCB2MzEpXG4gICAgICAgICAgICAgICAgdm1hcFtcInYje2ZufS0je2l9LSN7an1cIl0gPSBwb3MrK1xuICAgICAgICAgICAgICAgIHZlcnRzLnB1c2ggdlxuICBcbiAgICBFUFNJTE9OX0NMT1NFID0gMS4wZS04XG4gICAgdW5pcVZzID0gW11cbiAgICBuZXdwb3MgPSAwXG4gICAgdW5pcW1hcCA9IHt9XG4gICAgZm9yIHYsaSBpbiB2ZXJ0c1xuICAgICAgICBpZiBpIGluIHVuaXFtYXAgdGhlbiBjb250aW51ZSAjIGFscmVhZHkgbWFwcGVkXG4gICAgICAgIHVuaXFtYXBbaV0gPSBuZXdwb3NcbiAgICAgICAgdW5pcVZzLnB1c2ggdlxuICAgICAgICBmb3IgaiBpbiBbaSsxLi4udmVydHMubGVuZ3RoXVxuICAgICAgICAgICAgdyA9IHZlcnRzW2pdXG4gICAgICAgICAgICBpZiBtYWcoc3ViKHYsIHcpKSA8IEVQU0lMT05fQ0xPU0VcbiAgICAgICAgICAgICAgICB1bmlxbWFwW2pdID0gbmV3cG9zXG4gICAgICAgIG5ld3BvcysrXG4gIFxuICAgIGZhY2VzID0gW11cbiAgICBmb3IgZm4gaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmb3IgaSBpbiBbMC4uLm5dXG4gICAgICAgICAgICBmb3IgaiBpbiBbMC4uLm4taV1cbiAgICAgICAgICAgICAgICBmYWNlcy5wdXNoIFt1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2p9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aSsxfS0je2p9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqKzF9XCJdXV1cbiAgICAgICAgZm9yIGkgaW4gWzEuLi5uXVxuICAgICAgICAgICAgZm9yIGogaW4gWzAuLi5uLWldXG4gICAgICAgICAgICAgICAgZmFjZXMucHVzaCBbdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2l9LSN7aisxfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2ktMX0tI3tqKzF9XCJdXV1cbiAgXG4gICAgbmV3IFBvbHloZWRyb24gXCJ1I3tufSN7cG9seS5uYW1lfVwiIGZhY2VzLCB1bmlxVnNcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG4jIFNsb3cgQ2Fub25pY2FsaXphdGlvbiBBbGdvcml0aG1cbiNcbiMgVGhpcyBhbGdvcml0aG0gaGFzIHNvbWUgY29udmVyZ2VuY2UgcHJvYmxlbXMsIHdoYXQgcmVhbGx5IG5lZWRzIHRvIGJlIGRvbmUgaXMgdG9cbiMgc3VtIHRoZSB0aHJlZSBmb3JjaW5nIGZhY3RvcnMgdG9nZXRoZXIgYXMgYSBjb2hlcmVudCBmb3JjZSBhbmQgdG8gdXNlIGEgaGFsZi1kZWNlbnRcbiMgaW50ZWdyYXRvciB0byBtYWtlIHN1cmUgdGhhdCBpdCBjb252ZXJnZXMgd2VsbCBhcyBvcHBvc2VkIHRvIHRoZSBjdXJyZW50IGhhY2sgb2ZcbiMgYWQtaG9jIHN0YWJpbGl0eSBtdWx0aXBsaWVycy4gIElkZWFsbHkgb25lIHdvdWxkIGltcGxlbWVudCBhIGNvbmp1Z2F0ZSBncmFkaWVudFxuIyBkZXNjZW50IG9yIHNpbWlsYXIgcHJldHR5IHRoaW5nLlxuI1xuIyBPbmx5IHRyeSB0byB1c2UgdGhpcyBvbiBjb252ZXggcG9seWhlZHJhIHRoYXQgaGF2ZSBhIGNoYW5jZSBvZiBiZWluZyBjYW5vbmljYWxpemVkLFxuIyBvdGhlcndpc2UgaXQgd2lsbCBwcm9iYWJseSBibG93IHVwIHRoZSBnZW9tZXRyeS4gIEEgbXVjaCB0cmlja2llciAvIHNtYXJ0ZXIgc2VlZC1zeW1tZXRyeVxuIyBiYXNlZCBnZW9tZXRyaWNhbCByZWd1bGFyaXplciBzaG91bGQgYmUgdXNlZCBmb3IgZmFuY2llci93ZWlyZGVyIHBvbHloZWRyYS5cblxuY2Fub25pY2FsaXplID0gKHBvbHksIGl0ZXI9MjAwKSAtPlxuXG4gICAgZmFjZXMgPSBwb2x5LmZhY2VcbiAgICBlZGdlcyA9IHBvbHkuZWRnZXMoKVxuICAgIHZlcnRzID0gcG9seS52ZXJ0ZXhcbiAgICBtYXhDaGFuZ2UgPSAxLjBcbiAgICBmb3IgaSBpbiBbMC4uaXRlcl1cbiAgICAgICAgb2xkVnMgPSBjb3B5VmVjQXJyYXkgdmVydHNcbiAgICAgICAgdmVydHMgPSB0YW5nZW50aWZ5IHZlcnRzLCBlZGdlc1xuICAgICAgICAjIHZlcnRzID0gcmVjZW50ZXIgdmVydHMsIGVkZ2VzXG4gICAgICAgIHZlcnRzID0gcGxhbmFyaXplIHZlcnRzLCBmYWNlc1xuICAgICAgICBtYXhDaGFuZ2UgPSBfLm1heCBfLm1hcCBfLnppcCh2ZXJ0cywgb2xkVnMpLCAoW3gsIHldKSAtPiBtYWcgc3ViIHgsIHlcbiAgICAgICAgaWYgbWF4Q2hhbmdlIDwgMWUtOFxuICAgICAgICAgICAgYnJlYWtcbiAgICAjIHZlcnRzID0gcmVzY2FsZSB2ZXJ0c1xuICAgICMgbmV3IFBvbHloZWRyb24gcG9seS5uYW1lLCBwb2x5LmZhY2UsIHZlcnRzXG4gICAgcG9seS52ZXJ0cyA9IHZlcnRzXG4gICAgcG9seS5yZXNjYWxlKClcbiAgICAgICAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcblxubW9kdWxlLmV4cG9ydHMgPVxuICAgIGR1YWw6ICAgICAgICAgICBkdWFsXG4gICAgYmV2ZWw6ICAgICAgICAgIGJldmVsXG4gICAgdHJpc3ViOiAgICAgICAgIHRyaXN1YlxuICAgIHRydW5jYXRlOiAgICAgICB0cnVuY2F0ZVxuICAgIHBlcnNwZWN0aXZhOiAgICBwZXJzcGVjdGl2YVxuICAgIGtpczogICAgICAgICAgICBraXNcbiAgICBhbWJvOiAgICAgICAgICAgYW1ib1xuICAgIGd5cm86ICAgICAgICAgICBneXJvXG4gICAgY2hhbWZlcjogICAgICAgIGNoYW1mZXJcbiAgICB3aGlybDogICAgICAgICAgd2hpcmxcbiAgICBxdWludG86ICAgICAgICAgcXVpbnRvXG4gICAgaW5zZXQ6ICAgICAgICAgIGluc2V0XG4gICAgZXh0cnVkZTogICAgICAgIGV4dHJ1ZGVcbiAgICBleHBhbmQ6ICAgICAgICAgZXhwYW5kXG4gICAgaG9sbG93OiAgICAgICAgIGhvbGxvd1xuICAgIGZsYXR0ZW46ICAgICAgICBmbGF0dGVuXG4gICAgemlya3VsYXJpemU6ICAgIHppcmt1bGFyaXplXG4gICAgc3BoZXJpY2FsaXplOiAgIHNwaGVyaWNhbGl6ZVxuICAgIGNhbm9uaWNhbGl6ZTogICBjYW5vbmljYWxpemVcbiAgICAiXX0=
//# sourceURL=../../coffee/poly/topo.coffee