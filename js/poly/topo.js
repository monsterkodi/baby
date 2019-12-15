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
    insetf = clamp(0.01, 0.99, insetf);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9wby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsa1pBQUE7SUFBQTs7QUFVQSxNQUFxQixPQUFBLENBQVEsS0FBUixDQUFyQixFQUFFLFNBQUYsRUFBSyxpQkFBTCxFQUFZOztBQUNaLE9BQWlMLE9BQUEsQ0FBUSxRQUFSLENBQWpMLEVBQUUsY0FBRixFQUFPLGtCQUFQLEVBQWMsZ0NBQWQsRUFBNEIsMEJBQTVCLEVBQXVDLGdDQUF2QyxFQUFxRCxrQkFBckQsRUFBNEQsMEJBQTVELEVBQXVFLGNBQXZFLEVBQTRFLHdCQUE1RSxFQUFzRixnQkFBdEYsRUFBNEYsY0FBNUYsRUFBaUcsd0JBQWpHLEVBQTJHLDBCQUEzRyxFQUFzSCx3QkFBdEgsRUFBZ0ksb0JBQWhJLEVBQXdJLG9CQUF4SSxFQUFnSixjQUFoSixFQUFxSiw0QkFBckosRUFBaUssa0JBQWpLLEVBQXdLOztBQUN0SyxNQUFROztBQUVWLElBQUEsR0FBTyxPQUFBLENBQVEsU0FBUjs7QUFDUCxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0FBQ1AsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztBQUViLE9BQUEsR0FBVSxTQUFDLEVBQUQsRUFBSyxFQUFMO1dBQVksRUFBQSxHQUFHLEVBQUgsSUFBVSxDQUFHLEVBQUQsR0FBSSxHQUFKLEdBQU8sRUFBVCxDQUFWLElBQTJCLENBQUcsRUFBRCxHQUFJLEdBQUosR0FBTyxFQUFUO0FBQXZDOztBQVFWLE9BQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxVQUFQO0FBRU4sUUFBQTs7UUFGYSxhQUFXOztJQUV4QixPQUFBLEdBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBQTtJQUNWLFNBQUEsR0FBWSxJQUFJLENBQUMsU0FBTCxDQUFBO0lBQ1osT0FBZ0MsSUFBSSxDQUFDLFFBQUwsQ0FBQSxDQUFoQyxFQUFDLGtCQUFELEVBQVUsb0JBQVYsRUFBcUI7QUFLckIsV0FB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QWdCLFlBbEJoQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgIFxuICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAgIFxuIyMjXG5cbiMgUG9seWjDqWRyb25pc21lLCBDb3B5cmlnaHQgMjAxOSwgQW5zZWxtIExldnNrYXlhLCBNSVQgTGljZW5zZVxuXG57IF8sIGNsYW1wLCBrbG9nIH0gPSByZXF1aXJlICdreGsnXG57IGFkZCwgYW5nbGUsIGNhbGNDZW50cm9pZCwgY2xvY2t3aXNlLCBjb3B5VmVjQXJyYXksIGNyb3NzLCBpbnRlcnNlY3QsIG1hZywgbWlkcG9pbnQsIG11bHQsIG5lZywgb25lVGhpcmQsIHBsYW5hcml6ZSwgcmF5UGxhbmUsIHJheVJheSwgcm90YXRlLCBzdWIsIHRhbmdlbnRpZnksIHR3ZWVuLCB1bml0IH0gPSByZXF1aXJlICcuL21hdGgnXG57IG1pbiB9ID0gTWF0aFxuXG5WZWN0ID0gcmVxdWlyZSAnLi4vdmVjdCdcbkZsYWcgPSByZXF1aXJlICcuL2ZsYWcnXG5Qb2x5aGVkcm9uID0gcmVxdWlyZSAnLi9wb2x5aGVkcm9uJ1xuXG5taWROYW1lID0gKHYxLCB2MikgLT4gdjE8djIgYW5kIFwiI3t2MX1fI3t2Mn1cIiBvciBcIiN7djJ9XyN7djF9XCJcblxuIyAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgICAgMDAwMCAgMDAwICBcbiMgMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcblxuZmxhdHRlbiA9IChwb2x5LCBpdGVyYXRpb25zPTEwMCkgLT5cbiAgICBcbiAgICBub3JtYWxzID0gcG9seS5ub3JtYWxzKClcbiAgICBuZWlnaGJvcnMgPSBwb2x5Lm5laWdoYm9ycygpXG4gICAgW2ZsYXRuZXNzLHZlcnRleGRpc3Qsb2Zmc2V0c10gPSBwb2x5LmZsYXRuZXNzKClcblxuICAgICMgaWYgZmxhdG5lc3MgPiAwLjAwMVxuICAgICAgICAjIHBvbHkuZGVidWcgPSBbXVxuICAgICMgZGVidWcgPSB0cnVlXG4gICAgd2hpbGUgaXRlcmF0aW9ucyBhbmQgZmxhdG5lc3MgPiAwLjAwMVxuICAgICAgICAjIGtsb2cgXCIje3BvbHkubmFtZX0gI3tpdGVyYXRpb25zfSAje2ZsYXRuZXNzfVwiXG4gICAgICAgIGl0ZXJhdGlvbnMgLT0gMVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGZvciB2aSBpbiBbMC4uLnBvbHkudmVydGV4Lmxlbmd0aF1cbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIG5laWdoYm9yc1t2aV0ubGVuZ3RoIDw9IDJcbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIG5laWdoYm9yc1t2aV0ubGVuZ3RoID49IDZcblxuICAgICAgICAgICAgIyBpZiBkZWJ1Z1xuICAgICAgICAgICAgICAgICMgcG9seS5kZWJ1Z0xpbmUgcG9seS52ZXJ0ZXhbdmldLCBhZGQgcG9seS52ZXJ0ZXhbdmldLCBvZmZzZXRzW3ZpXVxuICAgICAgICAgICAgcG9seS52ZXJ0ZXhbdmldID0gYWRkIHBvbHkudmVydGV4W3ZpXSwgbXVsdCAwLjMsIG9mZnNldHNbdmldXG4gICAgICAgIFxuICAgICAgICBkZWJ1ZyA9IGZhbHNlXG4gICAgICAgIFtmbGF0bmVzcyx2ZXJ0ZXhkaXN0LG9mZnNldHNdID0gcG9seS5mbGF0bmVzcygpICAgICAgICAgICAgXG4gICAgICAgIFxuICAgIHBvbHlcblxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIFxuXG5ob2xsb3cgPSAocG9seSwgaW5zZXRmPTAuNSwgdGhpY2tuZXNzPTAuNSkgLT5cblxuICAgIGluc2V0ZiAgICA9IGNsYW1wIDAuMDEgMC45OSBpbnNldGZcbiAgICBub3JtYWxzICAgPSBwb2x5Lm5vcm1hbHMoKVxuICAgIGNlbnRlcnMgICA9IHBvbHkuY2VudGVycygpXG4gICAgd2luZ3MgICAgID0gcG9seS53aW5ncygpXG4gICAgbmVpZ2hib3JzID0gcG9seS5uZWlnaGJvcnMoKVxuICAgIFxuICAgIHRoaWNrbmVzcyA/PSBJbmZpbml0eVxuICAgIFxuICAgIHNldCA9IHt9XG4gICAgaW5zID0gKGUsZikgLT5cbiAgICAgICAgc2V0W2VdID89IHt9XG4gICAgICAgIGlmIG5vdCBzZXRbZV1bZl1cbiAgICAgICAgICAgIHNldFtlXVtmXSA9IHR3ZWVuIHBvbHkudmVydGV4W2VdLCBjZW50ZXJzW2ZdLCBpbnNldGZcbiAgICAgICAgc2V0W2VdW2ZdXG4gICAgICAgIFxuICAgIGRldCA9IHt9XG4gICAgaW5kID0gKGUsZikgLT5cbiAgICAgICAgZGV0W2VdID89IHt9XG4gICAgICAgIGlmIG5vdCBkZXRbZV1bZl1cbiAgICAgICAgICAgIGRldFtlXVtmXSA9IGFkZCBpbnMoZSxmKSwgbXVsdCAtdGhpY2tuZXNzLCBub3JtYWxzW2ZdXG4gICAgICAgIGRldFtlXVtmXVxuICAgICAgICBcbiAgICBmb3Igd2luZyBpbiB3aW5nc1xuICAgICAgICBmciA9IHdpbmdbMl0uZnJcbiAgICAgICAgZmwgPSB3aW5nWzJdLmZsXG4gICAgICAgIGlyID0gaW5zIHdpbmdbMV0sIGZyXG4gICAgICAgIGlsID0gaW5zIHdpbmdbMV0sIGZsXG4gICAgICAgICAgXG4gICAgICAgIG5yID0gbmVnIG5vcm1hbHNbZnJdXG4gICAgICAgIG5sID0gbmVnIG5vcm1hbHNbZmxdXG4gICAgICAgICAgIFxuICAgICAgICBsciA9IHJheVJheSBbaXIsIGFkZCBpciwgbnJdLCBbaWwsIGFkZCBpbCwgbmxdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIHRoaWNrbmVzcyA9IG1pbiB0aGlja25lc3MsIG1hZyBzdWIgaXIsIGxyXG4gICAgICAgIHRoaWNrbmVzcyA9IG1pbiB0aGlja25lc3MsIG1hZyBzdWIgaWwsIGxyXG4gICAgICAgICAgICAgICAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGV4Lmxlbmd0aF1cbiAgICAgICAgcCA9IHBvbHkudmVydGV4W2ldXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgcFxuXG4gICAgZm9yIGZpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZmFjZSA9IHBvbHkuZmFjZVtmaV1cbiAgICAgICAgZm9yIHZpIGluIGZhY2VcbiAgICAgICAgICAgIGZsYWcudmVydCBcImZpbiN7Zml9diN7dml9XCIgICAgIGlucyB2aSwgZmlcbiAgICAgICAgICAgIGZsYWcudmVydCBcImZpbmRvd24je2ZpfXYje3ZpfVwiIGluZCB2aSwgZmlcbiAgXG4gICAgZm9yIGZpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtmaV1cbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2MiA9IFwidiN7dn1cIlxuICAgICAgICAgICAgaTEgPSBcImZpbiN7Zml9I3t2MX1cIlxuICAgICAgICAgICAgaTIgPSBcImZpbiN7Zml9I3t2Mn1cIlxuICAgICAgICAgICAgZjEgPSBcImZpbmRvd24je2ZpfSN7djF9XCJcbiAgICAgICAgICAgIGYyID0gXCJmaW5kb3duI3tmaX0je3YyfVwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZuYW1lID0gXCJ0b3BzI3tmaX0je3YxfVwiXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYxLCB2MlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MiwgaTJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgaTIsIGkxXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIGkxLCB2MVxuICAgICAgXG4gICAgICAgICAgICBmbmFtZSA9IFwic2lkZXMje2ZpfSN7djF9XCJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgaTEsIGkyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIGkyLCBmMlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBmMiwgZjFcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgZjEsIGkxXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHYxID0gdjJcbiAgICAgICBcbiAgICB2ZXJ0ZXhNYXAgPSB7fVxuICAgIGZvciB3aW5nIGluIHdpbmdzXG4gICAgICAgIGZyID0gd2luZ1syXS5mclxuICAgICAgICBmbCA9IHdpbmdbMl0uZmwgICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICB2MSA9IFwiZmluZG93biN7ZnJ9diN7d2luZ1swXX1cIlxuICAgICAgICB2MiA9IFwiZmluZG93biN7ZnJ9diN7d2luZ1sxXX1cIlxuICAgICAgICB2MyA9IFwiZmluZG93biN7Zmx9diN7d2luZ1sxXX1cIlxuICAgICAgICB2NCA9IFwiZmluZG93biN7Zmx9diN7d2luZ1swXX1cIlxuICAgICAgICBcbiAgICAgICAgaWYgMC4wMDEgPCBtYWcgc3ViIGluZCh3aW5nWzFdLCBmciksIGluZCh3aW5nWzFdLCBmbClcbiAgICAgICAgXG4gICAgICAgICAgICBmbmFtZSA9IFwic3RpdGNoXyN7Zmx9XyN7ZnJ9XCJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjEsIHYyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYyLCB2M1xuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MywgdjRcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjQsIHYxXG4gICAgICAgICAgICBcbiAgICAgICAgdmVydGV4TWFwW3dpbmdbMF1dID89IHt9XG4gICAgICAgIHZlcnRleE1hcFt3aW5nWzBdXVt3aW5nWzFdXSA9IFt2MSwgdjRdXG4gICAgICAgIHZlcnRleE1hcFt3aW5nWzFdXSA/PSB7fVxuICAgICAgICB2ZXJ0ZXhNYXBbd2luZ1sxXV1bd2luZ1swXV0gPSBbdjMsIHYyXVxuXG4gICAgZm9yIG5zLHZpIGluIG5laWdoYm9yc1xuICAgICAgICBmb3IgbmkgaW4gbnNcbiAgICAgICAgICAgIGVkZ2UgPSB2ZXJ0ZXhNYXBbdmldW25pXVxuICAgICAgICAgICAgZmxhZy5lZGdlIFwic25pdGNoXyN7dml9XCIsIGVkZ2VbMF0sIGVkZ2VbMV1cbiAgXG4gICAgZmxhZy50b3BvbHkgXCJoI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuXG5leHBhbmQgPSAocG9seSwgYW1vdW50PTAuNSkgLT5cblxuICAgIGFtb3VudCAgICA9IGNsYW1wIDAgMTAgYW1vdW50XG4gICAgb2xkZWRnZXMgID0gcG9seS5lZGdlcygpXG4gICAgY2VudGVycyAgID0gcG9seS5jZW50ZXJzKClcbiAgICBuZWlnaGJvcnMgPSBwb2x5Lm5laWdoYm9ycygpXG4gICAgd2luZ3MgICAgID0gcG9seS53aW5ncygpXG4gICAgICAgIFxuICAgIHZlcnRzID0gW11cbiAgICBmYWNlcyA9IFtdXG4gICAgdm1hcCAgPSB7fVxuICAgIGltYXAgID0ge31cbiAgICBuZXdWICA9IDBcbiAgICBmb3IgZmkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBkID0gc3ViIG11bHQoMSthbW91bnQsIGNlbnRlcnNbZmldKSwgY2VudGVyc1tmaV1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtmaV1cbiAgICAgICAgZmFjZSA9IFtdXG4gICAgICAgIGZvciB2LHZpIGluIGZcbiAgICAgICAgICAgIHZtYXBbdl0gPz0gW11cbiAgICAgICAgICAgIHZtYXBbdl0ucHVzaCBuZXdWXG4gICAgICAgICAgICBpbWFwW25ld1ZdID0gdlxuICAgICAgICAgICAgdmVydHMucHVzaCBhZGQgcG9seS52ZXJ0ZXhbdl0sIGRcbiAgICAgICAgICAgIG5leHRWID0gbmV3Visodmk9PWYubGVuZ3RoLTEgYW5kIC1mLmxlbmd0aCsxIG9yIDEpXG4gICAgICAgICAgICBmYWNlLnB1c2ggbmV3VlxuICAgICAgICAgICAgbmV3VisrXG4gICAgICAgIGZhY2VzLnB1c2ggZmFjZVxuICAgICAgICAgICAgXG4gICAgZm9yIHdpbmcgaW4gd2luZ3NcbiAgICAgICAgW2EsYl0gPSB3aW5nXG4gICAgICAgIGZhY2UgPSB2bWFwW2FdLmNvbmNhdCB2bWFwW2JdXG4gICAgICAgIGZhY2UgPSBmYWNlLmZpbHRlciAodikgLT4gKHYgaW4gZmFjZXNbd2luZ1syXS5mcl0pIG9yICh2IGluIGZhY2VzW3dpbmdbMl0uZmxdKVxuICAgICAgICBmYWNlcy5wdXNoIGNsb2Nrd2lzZSB2ZXJ0cywgZmFjZVxuXG4gICAgZm9yIG8sbiBvZiB2bWFwXG4gICAgICAgIGZhY2VzLnB1c2ggY2xvY2t3aXNlIHZlcnRzLCBuXG4gICAgICAgIFxuICAgIG5ldyBQb2x5aGVkcm9uIFwiZSN7cG9seS5uYW1lfVwiIGZhY2VzLCB2ZXJ0c1xuXG4jICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG5zcGhlcmljYWxpemUgPSAocG9seSkgLT5cblxuICAgIHZlcnRzID0gW11cbiAgICBmb3IgdmVydGV4LHZpIGluIHBvbHkudmVydGV4XG4gICAgICAgIHZlcnRzLnB1c2ggdW5pdCBwb2x5LnZlcnRleFt2aV1cbiAgICAgICAgXG4gICAgbmV3IFBvbHloZWRyb24gXCJ6I3twb2x5Lm5hbWV9XCIgcG9seS5mYWNlLCB2ZXJ0c1xuXG4jIDAwMDAwMDAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiMgICAwMDAgICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxuemlya3VsYXJpemUgPSAocG9seSwgZ3Jvdz0xLCBuPTYpIC0+XG5cbiAgICB2ZXJ0aWNlcyA9IFtdXG4gICAgXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgXG4gICAgZm9yIGYsZmkgaW4gcG9seS5mYWNlXG5cbiAgICAgICAgaWYgZi5sZW5ndGggPT0gbiBvciBuID09IDBcbiAgICAgICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgICAgICBheGlzID0gY3Jvc3MgY2VudGVyc1tmaV0sIHBvbHkudmVydGV4W3ZdXG4gICAgICAgICAgICAgICAgYW5nbCA9IGFuZ2xlIGNlbnRlcnNbZmldLCBwb2x5LnZlcnRleFt2XVxuICAgICAgICAgICAgICAgIHZlcnRpY2VzW3ZdID0gcm90YXRlIGNlbnRlcnNbZmldLCBheGlzLCBhbmdsICogZ3Jvd1xuICAgICAgICAgICAgICAgIFxuICAgIHZlcnRzID0gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdLm1hcCAoaSkgLT4gdmVydGljZXNbaV0gPyBwb2x5LnZlcnRleFtpXVxuICAgICBcbiAgICBuZXcgUG9seWhlZHJvbiBcInoje3BvbHkubmFtZX1cIiBwb2x5LmZhY2UsIHZlcnRzXG5cbiMgMDAwMDAwMCAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuXG5kdWFsID0gKHBvbHkpIC0+XG5cbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICBmYWNlID0gW10gXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdIFxuICAgICAgICBmYWNlW2ldID0ge31cblxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICB2MSA9IGZbLTFdXG4gICAgICAgIGZvciB2MiBpbiBmXG4gICAgICAgICAgICBmYWNlW3YxXVtcInYje3YyfVwiXSA9IFwiI3tpfVwiXG4gICAgICAgICAgICB2MSA9IHYyXG4gIFxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZmxhZy52ZXJ0IFwiI3tpfVwiIGNlbnRlcnNbaV1cbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIHYxID0gZlstMV1cbiAgICAgICAgZm9yIHYyIGluIGZcbiAgICAgICAgICAgIGZsYWcuZWRnZSB2MSwgZmFjZVt2Ml1bXCJ2I3t2MX1cIl0sIFwiI3tpfVwiXG4gICAgICAgICAgICB2MSA9IHYyXG4gIFxuICAgIGRwb2x5ID0gZmxhZy50b3BvbHkoKVxuICBcbiAgICBzb3J0RiA9IFtdXG4gICAgZm9yIGYgaW4gZHBvbHkuZmFjZVxuICAgICAgICBrID0gaW50ZXJzZWN0IHBvbHkuZmFjZVtmWzBdXSwgcG9seS5mYWNlW2ZbMV1dLCBwb2x5LmZhY2VbZlsyXV1cbiAgICAgICAgc29ydEZba10gPSBmXG4gICAgZHBvbHkuZmFjZSA9IHNvcnRGXG4gIFxuICAgIGlmIHBvbHkubmFtZVswXSAhPSBcImRcIlxuICAgICAgICBkcG9seS5uYW1lID0gXCJkI3twb2x5Lm5hbWV9XCJcbiAgICBlbHNlIFxuICAgICAgICBkcG9seS5uYW1lID0gcG9seS5uYW1lLnNsaWNlIDFcbiAgXG4gICAgZHBvbHlcblxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICBcblxuIyBLaXMgKGFiYnJldmlhdGVkIGZyb20gdHJpYWtpcykgdHJhbnNmb3JtcyBhbiBOLXNpZGVkIGZhY2UgaW50byBhbiBOLXB5cmFtaWQgcm9vdGVkIGF0IHRoZVxuIyBzYW1lIGJhc2UgdmVydGljZXMuIG9ubHkga2lzIG4tc2lkZWQgZmFjZXMsIGJ1dCBuPT0wIG1lYW5zIGtpcyBhbGwuXG5cbmtpcyA9IChwb2x5LCBhcGV4ZGlzdD0wLjUsIG49MCkgLT5cblxuICAgIGFwZXhkaXN0ID0gY2xhbXAgLTEgMTAgYXBleGRpc3RcbiAgICBcbiAgICBpZiBhcGV4ZGlzdCA8IDBcbiAgICAgICAgYXBleGRpc3QgPSBhcGV4ZGlzdCAqIHBvbHkubWluRmFjZURpc3QoKVxuICAgIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgcG9seS52ZXJ0ZXhbaV1cbiAgXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm91bmRBbnkgPSBmYWxzZVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MiA9IFwidiN7dn1cIlxuICAgICAgICAgICAgaWYgZi5sZW5ndGggPT0gbiBvciBuID09IDBcbiAgICAgICAgICAgICAgICBmb3VuZEFueSA9IHRydWU7XG4gICAgICAgICAgICAgICAgYXBleCA9IFwiYXBleCN7aX1cIlxuICAgICAgICAgICAgICAgIGZuYW1lID0gXCIje2l9I3t2MX1cIlxuXG4gICAgICAgICAgICAgICAgZmxhZy52ZXJ0IGFwZXgsIGFkZCBjZW50ZXJzW2ldLCBtdWx0IGFwZXhkaXN0LCBub3JtYWxzW2ldXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCAgIHYxLCAgIHYyXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCAgIHYyLCBhcGV4XG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBhcGV4LCAgIHYxXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlIFwiI3tpfVwiLCB2MSwgdjJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdjEgPSB2MlxuICBcbiAgICBpZiBub3QgZm91bmRBbnlcbiAgICAgICAga2xvZyBcIk5vICN7bn0tZm9sZCBjb21wb25lbnRzIHdlcmUgZm91bmQuXCJcbiAgXG4gICAgZmxhZy50b3BvbHkgXCJrI3tufSN7cG9seS5uYW1lfVwiXG5cbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcblxudHJ1bmNhdGUgPSAocG9seSwgZmFjdG9yPTAuNSkgLT5cblxuICAgIGZhY3RvciA9IGNsYW1wIDAgMSBmYWN0b3JcbiAgICBlZGdlTWFwID0ge31cbiAgICBcbiAgICBudW1GYWNlcyAgICA9IHBvbHkuZmFjZS5sZW5ndGhcbiAgICBudW1WZXJ0aWNlcyA9IHBvbHkudmVydGV4Lmxlbmd0aFxuICAgIG5laWdoYm9ycyAgID0gcG9seS5uZWlnaGJvcnMoKVxuICAgIFxuICAgIGRlcHRoID0gMC41ICogZmFjdG9yICogcG9seS5taW5FZGdlTGVuZ3RoKClcbiAgICBcbiAgICBmb3IgdmVydGV4SW5kZXggaW4gWzAuLi5udW1WZXJ0aWNlc11cbiAgICAgICAgXG4gICAgICAgIGVkZ2VNYXBbdmVydGV4SW5kZXhdID89IHt9XG4gICAgICAgIGZhY2UgPSBbXVxuICAgICAgICBcbiAgICAgICAgbmwgPSBuZWlnaGJvcnNbdmVydGV4SW5kZXhdLmxlbmd0aFxuICAgICAgICBmb3IgaWkgaW4gWzAuLi5ubF1cbiAgICAgICAgICAgIG5pID0gbmVpZ2hib3JzW3ZlcnRleEluZGV4XVtpaV1cbiAgICAgICAgICAgIGVkZ2VNYXBbdmVydGV4SW5kZXhdW25pXSA9IHBvbHkudmVydGV4Lmxlbmd0aFxuICAgICAgICAgICAgdnAgPSBwb2x5LmVkZ2UgdmVydGV4SW5kZXgsIG5pXG4gICAgICAgICAgICB2cC5ub3JtYWxpemUoKVxuICAgICAgICAgICAgdnAuc2NhbGVJblBsYWNlIGRlcHRoXG4gICAgICAgICAgICB2cC5hZGRJblBsYWNlIHBvbHkudmVydCB2ZXJ0ZXhJbmRleFxuICAgICAgICAgICAgZmFjZS5wdXNoIHBvbHkudmVydGV4Lmxlbmd0aFxuICAgICAgICAgICAgcG9seS52ZXJ0ZXgucHVzaCBbdnAueCwgdnAueSwgdnAuel1cbiAgICAgICAgICAgIFxuICAgICAgICBwb2x5LmZhY2UucHVzaCBmYWNlXG4gICAgXG4gICAgZm9yIGZpIGluIFswLi4ubnVtRmFjZXNdXG4gICAgICAgIGZhY2UgPSBwb2x5LmZhY2VbZmldXG4gICAgICAgIG5ld0ZhY2UgPSBbXVxuICAgICAgICBmb3IgdmkgaW4gWzAuLi5mYWNlLmxlbmd0aF1cbiAgICAgICAgICAgIG5pID0gKHZpKzEpICUgZmFjZS5sZW5ndGhcbiAgICAgICAgICAgIG5ld0ZhY2UucHVzaCBlZGdlTWFwW2ZhY2VbdmldXVtmYWNlW25pXV1cbiAgICAgICAgICAgIGlmIGZhY3RvciA8IDFcbiAgICAgICAgICAgICAgICBuZXdGYWNlLnB1c2ggZWRnZU1hcFtmYWNlW25pXV1bZmFjZVt2aV1dXG4gICAgICAgIHBvbHkuZmFjZVtmaV0gPSBuZXdGYWNlXG4gICAgICBcbiAgICBwb2x5LnZlcnRleC5zcGxpY2UgMCwgbnVtVmVydGljZXNcbiAgICBmb3IgZmFjZSBpbiBwb2x5LmZhY2VcbiAgICAgICAgZm9yIGkgaW4gWzAuLi5mYWNlLmxlbmd0aF1cbiAgICAgICAgICAgIGZhY2VbaV0gLT0gbnVtVmVydGljZXNcbiAgICAgICAgXG4gICAgcG9seVxuICAgIFxuIyAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuXG4jIFRvcG9sb2dpY2FsIFwidHdlZW5cIiBiZXR3ZWVuIGEgcG9seWhlZHJvbiBhbmQgaXRzIGR1YWwgcG9seWhlZHJvbi5cblxuYW1ibyA9IChwb2x5KSAtPlxuICAgIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UoLTIpXG4gICAgICAgIGZvciB2MyBpbiBmXG4gICAgICAgICAgICBpZiB2MSA8IHYyXG4gICAgICAgICAgICAgICAgZmxhZy52ZXJ0IG1pZE5hbWUodjEsdjIpLCBtaWRwb2ludCBwb2x5LnZlcnRleFt2MV0sIHBvbHkudmVydGV4W3YyXVxuXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJvcmlnI3tpfVwiICBtaWROYW1lKHYxLHYyKSwgbWlkTmFtZSh2Mix2MylcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImR1YWwje3YyfVwiIG1pZE5hbWUodjIsdjMpLCBtaWROYW1lKHYxLHYyKVxuXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiYSN7cG9seS5uYW1lfVwiXG5cbmJldmVsID0gKHBvbHksIGZhY3Rvcj0wLjUpIC0+XG4gICAgXG4gICAgcCA9IHRydW5jYXRlIGFtYm8ocG9seSksIGZhY3RvclxuICAgIHAubmFtZSA9IFwiYiN7cG9seS5uYW1lfVwiXG4gICAgcFxuICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5jaGFtZmVyID0gKHBvbHksIGZhY3Rvcj0wLjUpIC0+XG4gICAgXG4gICAgZmFjdG9yICA9IGNsYW1wIDAuMDAxIDAuOTk1IGZhY3RvclxuICAgIGZsYWcgICAgPSBuZXcgRmxhZygpXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgd2luZ3MgICA9IHBvbHkud2luZ3MoKVxuICAgICAgICBcbiAgICBtaW5FZGdlTGVuZ3RoID0gSW5maW5pdHlcbiAgICBcbiAgICBmb3IgZWRnZSBpbiB3aW5nc1xuICAgICAgICBlMCA9IHBvbHkudmVydGV4W2VkZ2VbMF1dXG4gICAgICAgIGUxID0gcG9seS52ZXJ0ZXhbZWRnZVsxXV1cbiAgICAgICAgZWQgPSB1bml0IHN1YiBlMSwgZTBcbiAgICAgICAgXG4gICAgICAgIG5yID0gdW5pdCBzdWIgcG9seS52ZXJ0ZXhbZWRnZVsyXS5ucl0sIGUxXG4gICAgICAgIHByID0gdW5pdCBzdWIgcG9seS52ZXJ0ZXhbZWRnZVsyXS5wcl0sIGUwXG4gICAgICAgIGNyID0gcmF5UmF5IFtlMSwgbXVsdCAwLjUsIGFkZCBhZGQoZTEsIG5yKSwgc3ViKGUxLCBlZCldLFxuICAgICAgICAgICAgICAgICAgICBbZTAsIG11bHQgMC41LCBhZGQgYWRkKGUwLCBwciksIGFkZChlMCwgZWQpXVxuXG4gICAgICAgIGVsID0gbWFnIHN1YiBlMSwgcmF5UmF5IFtlMSwgYWRkKGUxLCBucildLCBbY3IsIGFkZChjciwgZWQpXVxuICAgICAgICBtaW5FZGdlTGVuZ3RoID0gbWluIG1pbkVkZ2VMZW5ndGgsIGVsXG5cbiAgICAgICAgZWwgPSBtYWcgc3ViIGUwLCByYXlSYXkgW2UwLCBhZGQoZTAsIHByKV0sIFtjciwgc3ViKGNyLCBlZCldXG4gICAgICAgIG1pbkVkZ2VMZW5ndGggPSBtaW4gbWluRWRnZUxlbmd0aCwgZWxcbiAgICAgICAgXG4gICAgbWluRWRnZUxlbmd0aCAqPSBmYWN0b3JcbiAgICAgICAgXG4gICAgbW92ZWQgPSB7fVxuICAgIGZvciBlZGdlIGluIHdpbmdzXG4gICAgICAgIGUwICA9IHBvbHkudmVydGV4W2VkZ2VbMF1dXG4gICAgICAgIGUxICA9IHBvbHkudmVydGV4W2VkZ2VbMV1dXG4gICAgICAgIHJyID0gW1xuICAgICAgICAgICAgYWRkKGUwLCBtdWx0IG1pbkVkZ2VMZW5ndGgsIHVuaXQgc3ViIHBvbHkudmVydGV4W2VkZ2VbMl0ucHJdLCBlMCksXG4gICAgICAgICAgICBhZGQoZTEsIG11bHQgbWluRWRnZUxlbmd0aCwgdW5pdCBzdWIgcG9seS52ZXJ0ZXhbZWRnZVsyXS5ucl0sIGUxKV1cbiAgICAgICAgbHIgPSBbXG4gICAgICAgICAgICBhZGQoZTAsIG11bHQgbWluRWRnZUxlbmd0aCwgdW5pdCBzdWIgcG9seS52ZXJ0ZXhbZWRnZVsyXS5wbF0sIGUwKSxcbiAgICAgICAgICAgIGFkZChlMSwgbXVsdCBtaW5FZGdlTGVuZ3RoLCB1bml0IHN1YiBwb2x5LnZlcnRleFtlZGdlWzJdLm5sXSwgZTEpXVxuICAgICAgICAgICAgXG4gICAgICAgIG1vdmVkW1wiI3tlZGdlWzFdfeKWuCN7ZWRnZVswXX1sXCJdID0gcnJcbiAgICAgICAgbW92ZWRbXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfXJcIl0gPSByclxuICAgICAgICBtb3ZlZFtcIiN7ZWRnZVsxXX3ilrgje2VkZ2VbMF19clwiXSA9IGxyXG4gICAgICAgIG1vdmVkW1wiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1sXCJdID0gbHJcbiAgICAgICAgICAgIFxuICAgIGZvciBlZGdlIGluIHdpbmdzXG4gICAgICAgIGUwICAgPSBwb2x5LnZlcnRleFtlZGdlWzBdXVxuICAgICAgICBlMSAgID0gcG9seS52ZXJ0ZXhbZWRnZVsxXV1cbiAgICAgICAgXG4gICAgICAgIG5mICA9IFwiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1cIiBcbiAgICAgICAgbl9oID0gXCIje2VkZ2VbMV19XCJcbiAgICAgICAgbl90ID0gXCIje2VkZ2VbMF19XCJcbiAgICAgICAgXG4gICAgICAgIG5uciA9IFwiI3tuX2h94pa4I3tlZGdlWzJdLmZyfVwiXG4gICAgICAgIG5ubCA9IFwiI3tuX2h94pa4I3tlZGdlWzJdLmZsfVwiXG4gICAgICAgIG5wciA9IFwiI3tuX3R94pa4I3tlZGdlWzJdLmZyfVwiXG4gICAgICAgIG5wbCA9IFwiI3tuX3R94pa4I3tlZGdlWzJdLmZsfVwiICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgbnIgPSByYXlSYXkgbW92ZWRbXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfXJcIl0sIG1vdmVkW1wiI3tlZGdlWzFdfeKWuCN7ZWRnZVsyXS5ucn1yXCJdXG4gICAgICAgIG5sID0gcmF5UmF5IG1vdmVkW1wiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1sXCJdLCBtb3ZlZFtcIiN7ZWRnZVsxXX3ilrgje2VkZ2VbMl0ubmx9bFwiXVxuICAgICAgICBwciA9IHJheVJheSBtb3ZlZFtcIiN7ZWRnZVswXX3ilrgje2VkZ2VbMV19clwiXSwgbW92ZWRbXCIje2VkZ2VbMl0ucHJ94pa4I3tlZGdlWzBdfXJcIl1cbiAgICAgICAgcGwgPSByYXlSYXkgbW92ZWRbXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfWxcIl0sIG1vdmVkW1wiI3tlZGdlWzJdLnBsfeKWuCN7ZWRnZVswXX1sXCJdXG4gICAgICAgIFxuICAgICAgICBwbWlkID0gbWlkcG9pbnQgcGwsIHByXG4gICAgICAgIG5taWQgPSBtaWRwb2ludCBubCwgbnJcbiAgICAgICAgY21pZCA9IG1pZHBvaW50IHBtaWQsIG5taWRcbiAgICAgICAgcG5tICA9IGNyb3NzIHN1YihwbWlkLG5taWQpLCBzdWIocGwscHIpXG5cbiAgICAgICAgaGVhZCA9IHJheVBsYW5lIFswIDAgMF0sIGUxLCBjbWlkLCBwbm1cbiAgICAgICAgdGFpbCA9IHJheVBsYW5lIFswIDAgMF0sIGUwLCBjbWlkLCBwbm1cbiAgICAgICAgXG4gICAgICAgIGZsYWcudmVydCBuX2gsIGhlYWRcbiAgICAgICAgZmxhZy52ZXJ0IG5fdCwgdGFpbFxuICAgICAgICBmbGFnLnZlcnQgbm5yLCBuclxuICAgICAgICBmbGFnLnZlcnQgbm5sLCBubFxuICAgICAgICBmbGFnLnZlcnQgbnBsLCBwbFxuICAgICAgICBmbGFnLnZlcnQgbnByLCBwclxuXG4gICAgICAgIGZsYWcuZWRnZSBuZiwgbl9oLCBubnJcbiAgICAgICAgZmxhZy5lZGdlIG5mLCBubnIsIG5wclxuICAgICAgICBmbGFnLmVkZ2UgbmYsIG5wciwgbl90XG4gICAgICAgIGZsYWcuZWRnZSBuZiwgbl90LCBucGxcbiAgICAgICAgZmxhZy5lZGdlIG5mLCBucGwsIG5ubFxuICAgICAgICBmbGFnLmVkZ2UgbmYsIG5ubCwgbl9oXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGZsYWcuZWRnZSBcIiN7ZWRnZVsyXS5mcn1cIiBucHIsIG5uclxuICAgICAgICBmbGFnLmVkZ2UgXCIje2VkZ2VbMl0uZmx9XCIgbm5sLCBucGxcbiAgICAgICAgXG4gICAgZmxhZy50b3BvbHkgXCJjI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuXG53aGlybCA9IChwb2x5LCBuPTApIC0+XG5cbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGV4Lmxlbmd0aF1cbiAgICAgICAgZmxhZy52ZXJ0IFwidiN7aX1cIiB1bml0IHBvbHkudmVydGV4W2ldXG5cbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSAtMlxuICAgICAgICBmb3IgaiBpbiBbMC4uLmYubGVuZ3RoXVxuICAgICAgICAgICAgdiA9IGZbal1cbiAgICAgICAgICAgIHYzID0gdlxuICAgICAgICAgICAgdjFfMiA9IG9uZVRoaXJkIHBvbHkudmVydGV4W3YxXSwgcG9seS52ZXJ0ZXhbdjJdXG4gICAgICAgICAgICBmbGFnLnZlcnQodjErXCJ+XCIrdjIsIHYxXzIpXG4gICAgICAgICAgICBjdjFuYW1lID0gXCJjZW50ZXIje2l9fiN7djF9XCJcbiAgICAgICAgICAgIGN2Mm5hbWUgPSBcImNlbnRlciN7aX1+I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy52ZXJ0IGN2MW5hbWUsIHVuaXQgb25lVGhpcmQgY2VudGVyc1tpXSwgdjFfMlxuICAgICAgICAgICAgZm5hbWUgPSBpK1wiZlwiK3YxXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIGN2MW5hbWUsICAgdjErXCJ+XCIrdjJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjErXCJ+XCIrdjIsIHYyK1wiflwiK3YxIFxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MitcIn5cIit2MSwgXCJ2I3t2Mn1cIiAgXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIFwidiN7djJ9XCIsICB2MitcIn5cIit2MyBcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjIrXCJ+XCIrdjMsIGN2Mm5hbWVcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgY3YybmFtZSwgICBjdjFuYW1lXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJjI3tpfVwiLCBjdjFuYW1lLCBjdjJuYW1lXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M11cbiAgXG4gICAgIyBjYW5vbmljYWxpemUgXG4gICAgZmxhZy50b3BvbHkgXCJ3I3twb2x5Lm5hbWV9XCJcblxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgIDAwMDAgICAgMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuXG5neXJvID0gKHBvbHksZmFjdG9yPTAuNSkgLT5cblxuICAgIGZhY3RvciA9IGNsYW1wIDAuMiwgMC44LCBmYWN0b3JcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGV4Lmxlbmd0aF1cbiAgICAgICAgIyBmbGFnLnZlcnQgXCJ2I3tpfVwiIHVuaXQgcG9seS52ZXJ0ZXhbaV1cbiAgICAgICAgZmxhZy52ZXJ0IFwidiN7aX1cIiBwb2x5LnZlcnRleFtpXVxuXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICAjIGZsYWcudmVydCBcImNlbnRlciN7aX1cIiB1bml0IGNlbnRlcnNbaV1cbiAgICAgICAgZmxhZy52ZXJ0IFwiY2VudGVyI3tpfVwiIGNlbnRlcnNbaV1cbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSgtMilcbiAgICAgICAgZm9yIGogaW4gWzAuLi5mLmxlbmd0aF1cbiAgICAgICAgICAgIHYgPSBmW2pdXG4gICAgICAgICAgICB2MyA9IHZcbiAgICAgICAgICAgIGZsYWcudmVydCB2MStcIn5cIit2MiwgdHdlZW4gcG9seS52ZXJ0ZXhbdjFdLHBvbHkudmVydGV4W3YyXSwgZmFjdG9yXG4gICAgICAgICAgICBmbmFtZSA9IGkrXCJmXCIrdjFcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgXCJjZW50ZXIje2l9XCIgIHYxK1wiflwiK3YyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYxK1wiflwiK3YyLCAgdjIrXCJ+XCIrdjFcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjIrXCJ+XCIrdjEsICBcInYje3YyfVwiXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIFwidiN7djJ9XCIgICAgIHYyK1wiflwiK3YzXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYyK1wiflwiK3YzLCAgXCJjZW50ZXIje2l9XCJcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M11cbiAgXG4gICAgIyBjYW5vbmljYWxpemUgXG4gICAgZmxhZy50b3BvbHkgXCJnI3twb2x5Lm5hbWV9XCJcbiAgICBcbiMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuIyAwMDAgMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiMgMDAwIDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMCAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIFxuXG5xdWludG8gPSAocG9seSkgLT4gIyBjcmVhdGVzIGEgcGVudGFnb24gZm9yIGV2ZXJ5IHZlcnRleCBhbmQgYSBuZXcgaW5zZXQgZmFjZVxuICAgIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICBjZW50cm9pZCA9IGNhbGNDZW50cm9pZCBmLm1hcCAoaWR4KSAtPiBwb2x5LnZlcnRleFtpZHhdXG5cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlIC0yXG4gICAgICAgIGZvciB2MyBpbiBmXG4gICAgICAgICAgICBtaWRwdCA9IG1pZHBvaW50IHBvbHkudmVydGV4W3YxXSwgcG9seS52ZXJ0ZXhbdjJdXG4gICAgICAgICAgICBpbm5lcnB0ID0gbWlkcG9pbnQgbWlkcHQsIGNlbnRyb2lkXG4gICAgICAgICAgICBmbGFnLnZlcnQgbWlkTmFtZSh2MSx2MiksIG1pZHB0XG4gICAgICAgICAgICBmbGFnLnZlcnQgXCJpbm5lcl8je2l9X1wiICsgbWlkTmFtZSh2MSx2MiksIGlubmVycHRcbiAgICAgICAgICAgIGZsYWcudmVydCBcIiN7djJ9XCIgcG9seS52ZXJ0ZXhbdjJdXG4gICAgICAgICAgXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfV8je3YyfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpLCBtaWROYW1lKHYxLCB2MilcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9XyN7djJ9XCIsIG1pZE5hbWUodjEsIHYyKSwgXCIje3YyfVwiXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfV8je3YyfVwiLCBcIiN7djJ9XCIsIG1pZE5hbWUodjIsIHYzKVxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7aX1fI3t2Mn1cIiwgbWlkTmFtZSh2MiwgdjMpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfV8je3YyfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpXG4gICAgICBcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImZfaW5fI3tpfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpXG4gICAgICBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M11cbiAgXG4gICAgZmxhZy50b3BvbHkgXCJxI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDBcbiMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgXG4jIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgIFxuIyAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgMDAwICAgXG5cbmluc2V0ID0gKHBvbHksIGluc2V0PTAuNSwgcG9wb3V0PS0wLjIsIG49MCkgLT5cbiAgXG4gICAgaW5zZXQgPSBjbGFtcCAwLjI1IDAuOTkgaW5zZXRcbiAgICBwb3BvdXQgPSBtaW4gcG9wb3V0LCBpbnNldFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdXG4gICAgICAgIHAgPSBwb2x5LnZlcnRleFtpXVxuICAgICAgICBmbGFnLnZlcnQgXCJ2I3tpfVwiIHBcblxuICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICBpZiBmLmxlbmd0aCA9PSBuIG9yIG4gPT0gMFxuICAgICAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgICAgIGZsYWcudmVydCBcImYje2l9diN7dn1cIiBhZGQgdHdlZW4ocG9seS52ZXJ0ZXhbdl0sY2VudGVyc1tpXSxpbnNldCksIG11bHQocG9wb3V0LG5vcm1hbHNbaV0pXG4gIFxuICAgIGZvdW5kQW55ID0gZmFsc2UgIyBhbGVydCBpZiBkb24ndCBmaW5kIGFueVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MiA9IFwidiN7dn1cIjtcbiAgICAgICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICAgICAgZm91bmRBbnkgPSB0cnVlXG4gICAgICAgICAgICAgICAgZm5hbWUgPSBpICsgdjFcbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UoZm5hbWUsICAgICAgdjEsICAgICAgIHYyKVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZShmbmFtZSwgICAgICB2MiwgICAgICAgXCJmI3tpfSN7djJ9XCIpXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlKGZuYW1lLCBcImYje2l9I3t2Mn1cIiwgIFwiZiN7aX0je3YxfVwiKVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZShmbmFtZSwgXCJmI3tpfSN7djF9XCIsICB2MSlcbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UoXCJleCN7aX1cIiwgXCJmI3tpfSN7djF9XCIsICBcImYje2l9I3t2Mn1cIilcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UoaSwgdjEsIHYyKSAgXG4gICAgICAgICAgICB2MT12MlxuICBcbiAgICBpZiBub3QgZm91bmRBbnlcbiAgICAgICAga2xvZyBcIk5vICN7bn0tZm9sZCBjb21wb25lbnRzIHdlcmUgZm91bmQuXCJcbiAgXG4gICAgZmxhZy50b3BvbHkgXCJuI3tufSN7cG9seS5uYW1lfVwiXG5cbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG5cbmV4dHJ1ZGUgPSAocG9seSwgcG9wb3V0PTEsIGluc2V0Zj0wLjUsIG49MCkgLT5cbiAgICBuZXdwb2x5ID0gaW5zZXQgcG9seSwgaW5zZXRmLCBwb3BvdXQsIG5cbiAgICBuZXdwb2x5Lm5hbWUgPSBcIngje259I3twb2x5Lm5hbWV9XCJcbiAgICBuZXdwb2x5XG5cbiMgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwMDBcbiMgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuIyAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwICAgICAgMDAwICAgMDAwXG5cbnBlcnNwZWN0aXZhID0gKHBvbHkpIC0+ICMgYW4gb3BlcmF0aW9uIHJldmVyc2UtZW5naW5lZXJlZCBmcm9tIFBlcnNwZWN0aXZhIENvcnBvcnVtIFJlZ3VsYXJpdW1cblxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0ZXgubGVuZ3RoXVxuICAgICAgICBmbGFnLnZlcnQgXCJ2I3tpfVwiIHBvbHkudmVydGV4W2ldXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgXG4gICAgICAgIGYgPSBwb2x5LmZhY2VbaV1cbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMl19XCJcbiAgICAgICAgdjIgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgdmVydDEgPSBwb2x5LnZlcnRleFtmW2YubGVuZ3RoLTJdXVxuICAgICAgICB2ZXJ0MiA9IHBvbHkudmVydGV4W2ZbZi5sZW5ndGgtMV1dXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIHYzID0gXCJ2I3t2fVwiXG4gICAgICAgICAgICB2ZXJ0MyA9IHBvbHkudmVydGV4W3ZdXG4gICAgICAgICAgICB2MTIgPSB2MStcIn5cIit2MlxuICAgICAgICAgICAgdjIxID0gdjIrXCJ+XCIrdjFcbiAgICAgICAgICAgIHYyMyA9IHYyK1wiflwiK3YzXG4gICAgICBcbiAgICAgICAgICAgICMgb24gZWFjaCBOZmFjZSwgTiBuZXcgcG9pbnRzIGluc2V0IGZyb20gZWRnZSBtaWRwb2ludHMgdG93YXJkcyBjZW50ZXIgPSBcInN0ZWxsYXRlZFwiIHBvaW50c1xuICAgICAgICAgICAgZmxhZy52ZXJ0IHYxMiwgbWlkcG9pbnQgbWlkcG9pbnQodmVydDEsdmVydDIpLCBjZW50ZXJzW2ldIFxuICAgICAgXG4gICAgICAgICAgICAjIGluc2V0IE5mYWNlIG1hZGUgb2YgbmV3LCBzdGVsbGF0ZWQgcG9pbnRzXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJpbiN7aX1cIiB2MTIsIHYyM1xuICAgICAgXG4gICAgICAgICAgICAjIG5ldyB0cmkgZmFjZSBjb25zdGl0dXRpbmcgdGhlIHJlbWFpbmRlciBvZiB0aGUgc3RlbGxhdGVkIE5mYWNlXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfSN7djJ9XCIgdjIzLCB2MTJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9I3t2Mn1cIiB2MTIsIHYyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfSN7djJ9XCIgdjIsICB2MjNcbiAgICAgIFxuICAgICAgICAgICAgIyBvbmUgb2YgdGhlIHR3byBuZXcgdHJpYW5nbGVzIHJlcGxhY2luZyBvbGQgZWRnZSBiZXR3ZWVuIHYxLT52MlxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7djEyfVwiIHYxLCAgdjIxXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3t2MTJ9XCIgdjIxLCB2MTJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje3YxMn1cIiB2MTIsIHYxXG4gICAgICBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M11cbiAgICAgICAgICAgIFt2ZXJ0MSwgdmVydDJdID0gW3ZlcnQyLCB2ZXJ0M11cbiAgXG4gICAgZmxhZy50b3BvbHkgXCJQI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuXG50cmlzdWIgPSAocG9seSwgbj0yKSAtPlxuICAgIFxuICAgIGZvciBmbiBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgIGlmIHBvbHkuZmFjZVtmbl0ubGVuZ3RoICE9IDNcbiAgICAgICAgICAgIHJldHVybiBwb2x5XG4gIFxuICAgIHZlcnRzID0gW11cbiAgICB2bWFwID0ge31cbiAgICBwb3MgPSAwXG4gICAgZm9yIGZuIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtmbl1cbiAgICAgICAgW2kxLCBpMiwgaTNdID0gZi5zbGljZSAtM1xuICAgICAgICB2MSA9IHBvbHkudmVydGV4W2kxXVxuICAgICAgICB2MiA9IHBvbHkudmVydGV4W2kyXVxuICAgICAgICB2MyA9IHBvbHkudmVydGV4W2kzXVxuICAgICAgICB2MjEgPSBzdWIgdjIsIHYxXG4gICAgICAgIHYzMSA9IHN1YiB2MywgdjFcbiAgICAgICAgZm9yIGkgaW4gWzAuLm5dXG4gICAgICAgICAgICBmb3IgaiBpbiBbMC4ubi1pXVxuICAgICAgICAgICAgICAgIHYgPSBhZGQgYWRkKHYxLCBtdWx0KGkvbiwgdjIxKSksIG11bHQoai9uLCB2MzEpXG4gICAgICAgICAgICAgICAgdm1hcFtcInYje2ZufS0je2l9LSN7an1cIl0gPSBwb3MrK1xuICAgICAgICAgICAgICAgIHZlcnRzLnB1c2ggdlxuICBcbiAgICBFUFNJTE9OX0NMT1NFID0gMS4wZS04XG4gICAgdW5pcVZzID0gW11cbiAgICBuZXdwb3MgPSAwXG4gICAgdW5pcW1hcCA9IHt9XG4gICAgZm9yIHYsaSBpbiB2ZXJ0c1xuICAgICAgICBpZiBpIGluIHVuaXFtYXAgdGhlbiBjb250aW51ZSAjIGFscmVhZHkgbWFwcGVkXG4gICAgICAgIHVuaXFtYXBbaV0gPSBuZXdwb3NcbiAgICAgICAgdW5pcVZzLnB1c2ggdlxuICAgICAgICBmb3IgaiBpbiBbaSsxLi4udmVydHMubGVuZ3RoXVxuICAgICAgICAgICAgdyA9IHZlcnRzW2pdXG4gICAgICAgICAgICBpZiBtYWcoc3ViKHYsIHcpKSA8IEVQU0lMT05fQ0xPU0VcbiAgICAgICAgICAgICAgICB1bmlxbWFwW2pdID0gbmV3cG9zXG4gICAgICAgIG5ld3BvcysrXG4gIFxuICAgIGZhY2VzID0gW11cbiAgICBmb3IgZm4gaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmb3IgaSBpbiBbMC4uLm5dXG4gICAgICAgICAgICBmb3IgaiBpbiBbMC4uLm4taV1cbiAgICAgICAgICAgICAgICBmYWNlcy5wdXNoIFt1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2p9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aSsxfS0je2p9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqKzF9XCJdXV1cbiAgICAgICAgZm9yIGkgaW4gWzEuLi5uXVxuICAgICAgICAgICAgZm9yIGogaW4gWzAuLi5uLWldXG4gICAgICAgICAgICAgICAgZmFjZXMucHVzaCBbdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2l9LSN7aisxfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2ktMX0tI3tqKzF9XCJdXV1cbiAgXG4gICAgbmV3IFBvbHloZWRyb24gXCJ1I3tufSN7cG9seS5uYW1lfVwiIGZhY2VzLCB1bmlxVnNcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG4jIFNsb3cgQ2Fub25pY2FsaXphdGlvbiBBbGdvcml0aG1cbiNcbiMgVGhpcyBhbGdvcml0aG0gaGFzIHNvbWUgY29udmVyZ2VuY2UgcHJvYmxlbXMsIHdoYXQgcmVhbGx5IG5lZWRzIHRvIGJlIGRvbmUgaXMgdG9cbiMgc3VtIHRoZSB0aHJlZSBmb3JjaW5nIGZhY3RvcnMgdG9nZXRoZXIgYXMgYSBjb2hlcmVudCBmb3JjZSBhbmQgdG8gdXNlIGEgaGFsZi1kZWNlbnRcbiMgaW50ZWdyYXRvciB0byBtYWtlIHN1cmUgdGhhdCBpdCBjb252ZXJnZXMgd2VsbCBhcyBvcHBvc2VkIHRvIHRoZSBjdXJyZW50IGhhY2sgb2ZcbiMgYWQtaG9jIHN0YWJpbGl0eSBtdWx0aXBsaWVycy4gIElkZWFsbHkgb25lIHdvdWxkIGltcGxlbWVudCBhIGNvbmp1Z2F0ZSBncmFkaWVudFxuIyBkZXNjZW50IG9yIHNpbWlsYXIgcHJldHR5IHRoaW5nLlxuI1xuIyBPbmx5IHRyeSB0byB1c2UgdGhpcyBvbiBjb252ZXggcG9seWhlZHJhIHRoYXQgaGF2ZSBhIGNoYW5jZSBvZiBiZWluZyBjYW5vbmljYWxpemVkLFxuIyBvdGhlcndpc2UgaXQgd2lsbCBwcm9iYWJseSBibG93IHVwIHRoZSBnZW9tZXRyeS4gIEEgbXVjaCB0cmlja2llciAvIHNtYXJ0ZXIgc2VlZC1zeW1tZXRyeVxuIyBiYXNlZCBnZW9tZXRyaWNhbCByZWd1bGFyaXplciBzaG91bGQgYmUgdXNlZCBmb3IgZmFuY2llci93ZWlyZGVyIHBvbHloZWRyYS5cblxuY2Fub25pY2FsaXplID0gKHBvbHksIGl0ZXI9MjAwKSAtPlxuXG4gICAgZmFjZXMgPSBwb2x5LmZhY2VcbiAgICBlZGdlcyA9IHBvbHkuZWRnZXMoKVxuICAgIHZlcnRzID0gcG9seS52ZXJ0ZXhcbiAgICBtYXhDaGFuZ2UgPSAxLjBcbiAgICBmb3IgaSBpbiBbMC4uaXRlcl1cbiAgICAgICAgb2xkVnMgPSBjb3B5VmVjQXJyYXkgdmVydHNcbiAgICAgICAgdmVydHMgPSB0YW5nZW50aWZ5IHZlcnRzLCBlZGdlc1xuICAgICAgICAjIHZlcnRzID0gcmVjZW50ZXIgdmVydHMsIGVkZ2VzXG4gICAgICAgIHZlcnRzID0gcGxhbmFyaXplIHZlcnRzLCBmYWNlc1xuICAgICAgICBtYXhDaGFuZ2UgPSBfLm1heCBfLm1hcCBfLnppcCh2ZXJ0cywgb2xkVnMpLCAoW3gsIHldKSAtPiBtYWcgc3ViIHgsIHlcbiAgICAgICAgaWYgbWF4Q2hhbmdlIDwgMWUtOFxuICAgICAgICAgICAgYnJlYWtcbiAgICAjIHZlcnRzID0gcmVzY2FsZSB2ZXJ0c1xuICAgICMgbmV3IFBvbHloZWRyb24gcG9seS5uYW1lLCBwb2x5LmZhY2UsIHZlcnRzXG4gICAgcG9seS52ZXJ0cyA9IHZlcnRzXG4gICAgcG9seS5yZXNjYWxlKClcbiAgICAgICAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcblxubW9kdWxlLmV4cG9ydHMgPVxuICAgIGR1YWw6ICAgICAgICAgICBkdWFsXG4gICAgYmV2ZWw6ICAgICAgICAgIGJldmVsXG4gICAgdHJpc3ViOiAgICAgICAgIHRyaXN1YlxuICAgIHRydW5jYXRlOiAgICAgICB0cnVuY2F0ZVxuICAgIHBlcnNwZWN0aXZhOiAgICBwZXJzcGVjdGl2YVxuICAgIGtpczogICAgICAgICAgICBraXNcbiAgICBhbWJvOiAgICAgICAgICAgYW1ib1xuICAgIGd5cm86ICAgICAgICAgICBneXJvXG4gICAgY2hhbWZlcjogICAgICAgIGNoYW1mZXJcbiAgICB3aGlybDogICAgICAgICAgd2hpcmxcbiAgICBxdWludG86ICAgICAgICAgcXVpbnRvXG4gICAgaW5zZXQ6ICAgICAgICAgIGluc2V0XG4gICAgZXh0cnVkZTogICAgICAgIGV4dHJ1ZGVcbiAgICBleHBhbmQ6ICAgICAgICAgZXhwYW5kXG4gICAgaG9sbG93OiAgICAgICAgIGhvbGxvd1xuICAgIGZsYXR0ZW46ICAgICAgICBmbGF0dGVuXG4gICAgemlya3VsYXJpemU6ICAgIHppcmt1bGFyaXplXG4gICAgc3BoZXJpY2FsaXplOiAgIHNwaGVyaWNhbGl6ZVxuICAgIGNhbm9uaWNhbGl6ZTogICBjYW5vbmljYWxpemVcbiAgICAiXX0=
//# sourceURL=../../coffee/poly/topo.coffee