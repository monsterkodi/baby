// koffee 1.6.0

/*
000000000   0000000   00000000    0000000     
   000     000   000  000   000  000   000    
   000     000   000  00000000   000   000    
   000     000   000  000        000   000    
   000      0000000   000         0000000
 */
var Flag, Polyhedron, Vect, _, add, ambo, angle, bevel, calcCentroid, canonicalXYZ, canonicalize, chamfer, clamp, clockwise, copyVecArray, cross, dual, expand, extrude, flatten, gyro, hollow, inset, intersect, kis, klog, mag, midName, midpoint, min, mult, neg, oneThird, perspectiva, planarize, quinto, rayPlane, rayRay, recenter, reciprocalC, reciprocalN, ref, ref1, rescale, rotate, sphericalize, sqrt, sub, tangentify, trisub, truncate, tween, unit, whirl, zirkularize, ϕ,
    indexOf = [].indexOf;

ref = require('kxk'), _ = ref._, clamp = ref.clamp, klog = ref.klog;

ref1 = require('./math'), add = ref1.add, angle = ref1.angle, calcCentroid = ref1.calcCentroid, clockwise = ref1.clockwise, copyVecArray = ref1.copyVecArray, cross = ref1.cross, intersect = ref1.intersect, mag = ref1.mag, midpoint = ref1.midpoint, mult = ref1.mult, neg = ref1.neg, oneThird = ref1.oneThird, planarize = ref1.planarize, rayPlane = ref1.rayPlane, rayRay = ref1.rayRay, recenter = ref1.recenter, reciprocalC = ref1.reciprocalC, reciprocalN = ref1.reciprocalN, rescale = ref1.rescale, rotate = ref1.rotate, sub = ref1.sub, tangentify = ref1.tangentify, tween = ref1.tween, unit = ref1.unit;

min = Math.min, sqrt = Math.sqrt;

Vect = require('../vect');

ϕ = (sqrt(5) - 1) / 2;

Flag = require('./flag');

Polyhedron = require('./polyhedron');

midName = function(v1, v2) {
    return v1 < v2 && (v1 + "_" + v2) || (v2 + "_" + v1);
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
        verts = recenter(verts, edges);
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
    verts = rescale(verts);
    return new Polyhedron(poly.name, poly.face, verts);
};

canonicalXYZ = function(poly, iterations) {
    var count, dpoly, l, ref2;
    if (iterations != null) {
        iterations;
    } else {
        iterations = 1;
    }
    dpoly = dual(poly);
    for (count = l = 0, ref2 = iterations; 0 <= ref2 ? l < ref2 : l > ref2; count = 0 <= ref2 ? ++l : --l) {
        dpoly.vertex = reciprocalN(poly);
        poly.vertex = reciprocalN(dpoly);
    }
    return new Polyhedron(poly.name, poly.face, poly.vertex);
};

flatten = function(poly, iterations) {
    var count, dpoly, l, ref2;
    if (iterations != null) {
        iterations;
    } else {
        iterations = 1;
    }
    dpoly = dual(poly);
    for (count = l = 0, ref2 = iterations; 0 <= ref2 ? l < ref2 : l > ref2; count = 0 <= ref2 ? ++l : --l) {
        dpoly.vertex = reciprocalC(poly);
        poly.vertex = reciprocalC(dpoly);
    }
    return new Polyhedron(poly.name, poly.face, poly.vertex);
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
    canonicalize: canonicalize,
    canonicalXYZ: canonicalXYZ
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9wby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsc2RBQUE7SUFBQTs7QUFVQSxNQUFxQixPQUFBLENBQVEsS0FBUixDQUFyQixFQUFFLFNBQUYsRUFBSyxpQkFBTCxFQUFZOztBQUNaLE9BQThOLE9BQUEsQ0FBUSxRQUFSLENBQTlOLEVBQUUsY0FBRixFQUFPLGtCQUFQLEVBQWMsZ0NBQWQsRUFBNEIsMEJBQTVCLEVBQXVDLGdDQUF2QyxFQUFxRCxrQkFBckQsRUFBNEQsMEJBQTVELEVBQXVFLGNBQXZFLEVBQTRFLHdCQUE1RSxFQUFzRixnQkFBdEYsRUFBNEYsY0FBNUYsRUFBaUcsd0JBQWpHLEVBQTJHLDBCQUEzRyxFQUFzSCx3QkFBdEgsRUFBZ0ksb0JBQWhJLEVBQXdJLHdCQUF4SSxFQUFrSiw4QkFBbEosRUFBK0osOEJBQS9KLEVBQTRLLHNCQUE1SyxFQUFxTCxvQkFBckwsRUFBNkwsY0FBN0wsRUFBa00sNEJBQWxNLEVBQThNLGtCQUE5TSxFQUFxTjs7QUFDbk4sY0FBRixFQUFPOztBQUNQLElBQUEsR0FBTyxPQUFBLENBQVEsU0FBUjs7QUFFUCxDQUFBLEdBQUksQ0FBQyxJQUFBLENBQUssQ0FBTCxDQUFBLEdBQVEsQ0FBVCxDQUFBLEdBQVk7O0FBRWhCLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7QUFDUCxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0FBRWIsT0FBQSxHQUFVLFNBQUMsRUFBRCxFQUFLLEVBQUw7V0FBWSxFQUFBLEdBQUcsRUFBSCxJQUFVLENBQUcsRUFBRCxHQUFJLEdBQUosR0FBTyxFQUFULENBQVYsSUFBMkIsQ0FBRyxFQUFELEdBQUksR0FBSixHQUFPLEVBQVQ7QUFBdkM7O0FBUVYsTUFBQSxHQUFTLFNBQUMsSUFBRCxFQUFPLE1BQVAsRUFBbUIsU0FBbkI7QUFFTCxRQUFBOztRQUZZLFNBQU87OztRQUFLLFlBQVU7O0lB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QUFBLEVBQWdCLEtBWGhCO0lBWUEsT0FBQSxFQUFnQixPQVpoQjtJQWFBLE1BQUEsRUFBZ0IsTUFiaEI7SUFjQSxNQUFBLEVBQWdCLE1BZGhCO0lBZUEsT0FBQSxFQUFnQixPQWZoQjtJQWdCQSxXQUFBLEVBQWdCLFdBaEJoQjtJQWlCQSxZQUFBLEVBQWdCLFlBakJoQjtJQWtCQSxZQUFBLEVBQWdCLFlBbEJoQjtJQW1CQSxZQUFBLEVBQWdCLFlBbkJoQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgIFxuICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAgIFxuIyMjXG5cbiMgUG9seWjDqWRyb25pc21lLCBDb3B5cmlnaHQgMjAxOSwgQW5zZWxtIExldnNrYXlhLCBNSVQgTGljZW5zZVxuXG57IF8sIGNsYW1wLCBrbG9nIH0gPSByZXF1aXJlICdreGsnXG57IGFkZCwgYW5nbGUsIGNhbGNDZW50cm9pZCwgY2xvY2t3aXNlLCBjb3B5VmVjQXJyYXksIGNyb3NzLCBpbnRlcnNlY3QsIG1hZywgbWlkcG9pbnQsIG11bHQsIG5lZywgb25lVGhpcmQsIHBsYW5hcml6ZSwgcmF5UGxhbmUsIHJheVJheSwgcmVjZW50ZXIsIHJlY2lwcm9jYWxDLCByZWNpcHJvY2FsTiwgcmVzY2FsZSwgcm90YXRlLCBzdWIsIHRhbmdlbnRpZnksIHR3ZWVuLCB1bml0IH0gPSByZXF1aXJlICcuL21hdGgnXG57IG1pbiwgc3FydCB9ID0gTWF0aFxuVmVjdCA9IHJlcXVpcmUgJy4uL3ZlY3QnXG5cbs+VID0gKHNxcnQoNSktMSkvMlxuXG5GbGFnID0gcmVxdWlyZSAnLi9mbGFnJ1xuUG9seWhlZHJvbiA9IHJlcXVpcmUgJy4vcG9seWhlZHJvbidcblxubWlkTmFtZSA9ICh2MSwgdjIpIC0+IHYxPHYyIGFuZCBcIiN7djF9XyN7djJ9XCIgb3IgXCIje3YyfV8je3YxfVwiXG5cbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICBcblxuaG9sbG93ID0gKHBvbHksIGluc2V0Zj0wLjUsIHRoaWNrbmVzcz0wLjUpIC0+XG5cbiAgICBpbnNldGYgICAgPSBjbGFtcCAwLjEgMC45IGluc2V0ZlxuICAgIG5vcm1hbHMgICA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyAgID0gcG9seS5jZW50ZXJzKClcbiAgICB3aW5ncyAgICAgPSBwb2x5LndpbmdzKClcbiAgICBuZWlnaGJvcnMgPSBwb2x5Lm5laWdoYm9ycygpXG4gICAgXG4gICAgdGhpY2tuZXNzID89IEluZmluaXR5XG4gICAgXG4gICAgc2V0ID0ge31cbiAgICBpbnMgPSAoZSxmKSAtPlxuICAgICAgICBzZXRbZV0gPz0ge31cbiAgICAgICAgaWYgbm90IHNldFtlXVtmXVxuICAgICAgICAgICAgc2V0W2VdW2ZdID0gdHdlZW4gcG9seS52ZXJ0ZXhbZV0sIGNlbnRlcnNbZl0sIGluc2V0ZlxuICAgICAgICBzZXRbZV1bZl1cbiAgICAgICAgXG4gICAgZGV0ID0ge31cbiAgICBpbmQgPSAoZSxmKSAtPlxuICAgICAgICBkZXRbZV0gPz0ge31cbiAgICAgICAgaWYgbm90IGRldFtlXVtmXVxuICAgICAgICAgICAgZGV0W2VdW2ZdID0gYWRkIGlucyhlLGYpLCBtdWx0IC10aGlja25lc3MsIG5vcm1hbHNbZl1cbiAgICAgICAgZGV0W2VdW2ZdXG4gICAgICAgIFxuICAgIGZvciB3aW5nIGluIHdpbmdzXG4gICAgICAgIGZyID0gd2luZ1syXS5mclxuICAgICAgICBmbCA9IHdpbmdbMl0uZmxcbiAgICAgICAgaXIgPSBpbnMgd2luZ1sxXSwgZnJcbiAgICAgICAgaWwgPSBpbnMgd2luZ1sxXSwgZmxcbiAgICAgICAgICBcbiAgICAgICAgbnIgPSBuZWcgbm9ybWFsc1tmcl1cbiAgICAgICAgbmwgPSBuZWcgbm9ybWFsc1tmbF1cbiAgICAgICAgICAgXG4gICAgICAgIGxyID0gcmF5UmF5IFtpciwgYWRkIGlyLCBucl0sIFtpbCwgYWRkIGlsLCBubF1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgdGhpY2tuZXNzID0gbWluIHRoaWNrbmVzcywgbWFnIHN1YiBpciwgbHJcbiAgICAgICAgdGhpY2tuZXNzID0gbWluIHRoaWNrbmVzcywgbWFnIHN1YiBpbCwgbHJcbiAgICAgICAgICAgICAgICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIFxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0ZXgubGVuZ3RoXVxuICAgICAgICBwID0gcG9seS52ZXJ0ZXhbaV1cbiAgICAgICAgZmxhZy52ZXJ0IFwidiN7aX1cIiBwXG5cbiAgICBmb3IgZmkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmYWNlID0gcG9seS5mYWNlW2ZpXVxuICAgICAgICBmb3IgdmkgaW4gZmFjZVxuICAgICAgICAgICAgZmxhZy52ZXJ0IFwiZmluI3tmaX12I3t2aX1cIiAgICAgaW5zIHZpLCBmaVxuICAgICAgICAgICAgZmxhZy52ZXJ0IFwiZmluZG93biN7Zml9diN7dml9XCIgaW5kIHZpLCBmaVxuICBcbiAgICBmb3IgZmkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ZpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHYyID0gXCJ2I3t2fVwiXG4gICAgICAgICAgICBpMSA9IFwiZmluI3tmaX0je3YxfVwiXG4gICAgICAgICAgICBpMiA9IFwiZmluI3tmaX0je3YyfVwiXG4gICAgICAgICAgICBmMSA9IFwiZmluZG93biN7Zml9I3t2MX1cIlxuICAgICAgICAgICAgZjIgPSBcImZpbmRvd24je2ZpfSN7djJ9XCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm5hbWUgPSBcInRvcHMje2ZpfSN7djF9XCJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjEsIHYyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYyLCBpMlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBpMiwgaTFcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgaTEsIHYxXG4gICAgICBcbiAgICAgICAgICAgIGZuYW1lID0gXCJzaWRlcyN7Zml9I3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBpMSwgaTJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgaTIsIGYyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIGYyLCBmMVxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBmMSwgaTFcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdjEgPSB2MlxuICAgICAgIFxuICAgIHZlcnRleE1hcCA9IHt9XG4gICAgZm9yIHdpbmcgaW4gd2luZ3NcbiAgICAgICAgZnIgPSB3aW5nWzJdLmZyXG4gICAgICAgIGZsID0gd2luZ1syXS5mbCAgICAgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHYxID0gXCJmaW5kb3duI3tmcn12I3t3aW5nWzBdfVwiXG4gICAgICAgIHYyID0gXCJmaW5kb3duI3tmcn12I3t3aW5nWzFdfVwiXG4gICAgICAgIHYzID0gXCJmaW5kb3duI3tmbH12I3t3aW5nWzFdfVwiXG4gICAgICAgIHY0ID0gXCJmaW5kb3duI3tmbH12I3t3aW5nWzBdfVwiXG4gICAgICAgIFxuICAgICAgICBpZiAwLjAwMSA8IG1hZyBzdWIgaW5kKHdpbmdbMV0sIGZyKSwgaW5kKHdpbmdbMV0sIGZsKVxuICAgICAgICBcbiAgICAgICAgICAgIGZuYW1lID0gXCJzdGl0Y2hfI3tmbH1fI3tmcn1cIlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MSwgdjJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjIsIHYzXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYzLCB2NFxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2NCwgdjFcbiAgICAgICAgICAgIFxuICAgICAgICB2ZXJ0ZXhNYXBbd2luZ1swXV0gPz0ge31cbiAgICAgICAgdmVydGV4TWFwW3dpbmdbMF1dW3dpbmdbMV1dID0gW3YxLCB2NF1cbiAgICAgICAgdmVydGV4TWFwW3dpbmdbMV1dID89IHt9XG4gICAgICAgIHZlcnRleE1hcFt3aW5nWzFdXVt3aW5nWzBdXSA9IFt2MywgdjJdXG5cbiAgICBmb3IgbnMsdmkgaW4gbmVpZ2hib3JzXG4gICAgICAgIGZvciBuaSBpbiBuc1xuICAgICAgICAgICAgZWRnZSA9IHZlcnRleE1hcFt2aV1bbmldXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJzbml0Y2hfI3t2aX1cIiwgZWRnZVswXSwgZWRnZVsxXVxuICBcbiAgICBmbGFnLnRvcG9seSBcImgje3BvbHkubmFtZX1cIlxuXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG5cbmV4cGFuZCA9IChwb2x5LCBhbW91bnQ9MC41KSAtPlxuXG4gICAgYW1vdW50ICAgID0gY2xhbXAgMCAxMCBhbW91bnRcbiAgICBvbGRlZGdlcyAgPSBwb2x5LmVkZ2VzKClcbiAgICBjZW50ZXJzICAgPSBwb2x5LmNlbnRlcnMoKVxuICAgIG5laWdoYm9ycyA9IHBvbHkubmVpZ2hib3JzKClcbiAgICB3aW5ncyAgICAgPSBwb2x5LndpbmdzKClcbiAgICAgICAgXG4gICAgdmVydHMgPSBbXVxuICAgIGZhY2VzID0gW11cbiAgICB2bWFwICA9IHt9XG4gICAgaW1hcCAgPSB7fVxuICAgIG5ld1YgID0gMFxuICAgIGZvciBmaSBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgIGQgPSBzdWIgbXVsdCgxK2Ftb3VudCwgY2VudGVyc1tmaV0pLCBjZW50ZXJzW2ZpXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ZpXVxuICAgICAgICBmYWNlID0gW11cbiAgICAgICAgZm9yIHYsdmkgaW4gZlxuICAgICAgICAgICAgdm1hcFt2XSA/PSBbXVxuICAgICAgICAgICAgdm1hcFt2XS5wdXNoIG5ld1ZcbiAgICAgICAgICAgIGltYXBbbmV3Vl0gPSB2XG4gICAgICAgICAgICB2ZXJ0cy5wdXNoIGFkZCBwb2x5LnZlcnRleFt2XSwgZFxuICAgICAgICAgICAgbmV4dFYgPSBuZXdWKyh2aT09Zi5sZW5ndGgtMSBhbmQgLWYubGVuZ3RoKzEgb3IgMSlcbiAgICAgICAgICAgIGZhY2UucHVzaCBuZXdWXG4gICAgICAgICAgICBuZXdWKytcbiAgICAgICAgZmFjZXMucHVzaCBmYWNlXG4gICAgICAgICAgICBcbiAgICBmb3Igd2luZyBpbiB3aW5nc1xuICAgICAgICBbYSxiXSA9IHdpbmdcbiAgICAgICAgZmFjZSA9IHZtYXBbYV0uY29uY2F0IHZtYXBbYl1cbiAgICAgICAgZmFjZSA9IGZhY2UuZmlsdGVyICh2KSAtPiAodiBpbiBmYWNlc1t3aW5nWzJdLmZyXSkgb3IgKHYgaW4gZmFjZXNbd2luZ1syXS5mbF0pXG4gICAgICAgIGNsb2Nrd2lzZSB2ZXJ0cywgZmFjZVxuICAgICAgICBmYWNlcy5wdXNoIGZhY2VcblxuICAgIGZvciBvLG4gb2Ygdm1hcFxuICAgICAgICBjbG9ja3dpc2UgdmVydHMsIG5cbiAgICAgICAgZmFjZXMucHVzaCBuXG4gICAgICAgIFxuICAgIG5ldyBQb2x5aGVkcm9uIFwiZSN7cG9seS5uYW1lfVwiIGZhY2VzLCB2ZXJ0c1xuXG4jICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG5zcGhlcmljYWxpemUgPSAocG9seSkgLT5cblxuICAgIHZlcnRzID0gW11cbiAgICBmb3IgdmVydGV4LHZpIGluIHBvbHkudmVydGV4XG4gICAgICAgIHZlcnRzLnB1c2ggdW5pdCBwb2x5LnZlcnRleFt2aV1cbiAgICAgICAgXG4gICAgbmV3IFBvbHloZWRyb24gXCJ6I3twb2x5Lm5hbWV9XCIgcG9seS5mYWNlLCB2ZXJ0c1xuXG4jIDAwMDAwMDAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiMgICAwMDAgICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxuemlya3VsYXJpemUgPSAocG9seSwgZ3Jvdz0xLCBuPTYpIC0+XG5cbiAgICB2ZXJ0aWNlcyA9IFtdXG4gICAgXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgXG4gICAgZm9yIGYsZmkgaW4gcG9seS5mYWNlXG5cbiAgICAgICAgaWYgZi5sZW5ndGggPT0gbiBvciBuID09IDBcbiAgICAgICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgICAgICBheGlzID0gY3Jvc3MgY2VudGVyc1tmaV0sIHBvbHkudmVydGV4W3ZdXG4gICAgICAgICAgICAgICAgYW5nbCA9IGFuZ2xlIGNlbnRlcnNbZmldLCBwb2x5LnZlcnRleFt2XVxuICAgICAgICAgICAgICAgIHZlcnRpY2VzW3ZdID0gcm90YXRlIGNlbnRlcnNbZmldLCBheGlzLCBhbmdsICogZ3Jvd1xuICAgICAgICAgICAgICAgIFxuICAgIHZlcnRzID0gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdLm1hcCAoaSkgLT4gdmVydGljZXNbaV0gPyBwb2x5LnZlcnRleFtpXVxuICAgICBcbiAgICBuZXcgUG9seWhlZHJvbiBcInoje3BvbHkubmFtZX1cIiBwb2x5LmZhY2UsIHZlcnRzXG5cbiMgMDAwMDAwMCAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuXG5kdWFsID0gKHBvbHkpIC0+XG5cbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICBmYWNlID0gW10gXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdIFxuICAgICAgICBmYWNlW2ldID0ge31cblxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICB2MSA9IGZbLTFdXG4gICAgICAgIGZvciB2MiBpbiBmXG4gICAgICAgICAgICBmYWNlW3YxXVtcInYje3YyfVwiXSA9IFwiI3tpfVwiXG4gICAgICAgICAgICB2MSA9IHYyXG4gIFxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZmxhZy52ZXJ0IFwiI3tpfVwiIGNlbnRlcnNbaV1cbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIHYxID0gZlstMV1cbiAgICAgICAgZm9yIHYyIGluIGZcbiAgICAgICAgICAgIGZsYWcuZWRnZSB2MSwgZmFjZVt2Ml1bXCJ2I3t2MX1cIl0sIFwiI3tpfVwiXG4gICAgICAgICAgICB2MSA9IHYyXG4gIFxuICAgIGRwb2x5ID0gZmxhZy50b3BvbHkoKVxuICBcbiAgICBzb3J0RiA9IFtdXG4gICAgZm9yIGYgaW4gZHBvbHkuZmFjZVxuICAgICAgICBrID0gaW50ZXJzZWN0IHBvbHkuZmFjZVtmWzBdXSwgcG9seS5mYWNlW2ZbMV1dLCBwb2x5LmZhY2VbZlsyXV1cbiAgICAgICAgc29ydEZba10gPSBmXG4gICAgZHBvbHkuZmFjZSA9IHNvcnRGXG4gIFxuICAgIGlmIHBvbHkubmFtZVswXSAhPSBcImRcIlxuICAgICAgICBkcG9seS5uYW1lID0gXCJkI3twb2x5Lm5hbWV9XCJcbiAgICBlbHNlIFxuICAgICAgICBkcG9seS5uYW1lID0gcG9seS5uYW1lLnNsaWNlIDFcbiAgXG4gICAgZHBvbHlcblxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICBcblxuIyBLaXMgKGFiYnJldmlhdGVkIGZyb20gdHJpYWtpcykgdHJhbnNmb3JtcyBhbiBOLXNpZGVkIGZhY2UgaW50byBhbiBOLXB5cmFtaWQgcm9vdGVkIGF0IHRoZVxuIyBzYW1lIGJhc2UgdmVydGljZXMuIG9ubHkga2lzIG4tc2lkZWQgZmFjZXMsIGJ1dCBuPT0wIG1lYW5zIGtpcyBhbGwuXG5cbmtpcyA9IChwb2x5LCBhcGV4ZGlzdD0wLjUsIG49MCkgLT5cblxuICAgIGFwZXhkaXN0ID0gY2xhbXAgLTEgMTAgYXBleGRpc3RcbiAgICBcbiAgICBpZiBhcGV4ZGlzdCA8IDBcbiAgICAgICAgYXBleGRpc3QgPSBhcGV4ZGlzdCAqIHBvbHkubWluRmFjZURpc3QoKVxuICAgIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgcG9seS52ZXJ0ZXhbaV1cbiAgXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm91bmRBbnkgPSBmYWxzZVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MiA9IFwidiN7dn1cIlxuICAgICAgICAgICAgaWYgZi5sZW5ndGggPT0gbiBvciBuID09IDBcbiAgICAgICAgICAgICAgICBmb3VuZEFueSA9IHRydWU7XG4gICAgICAgICAgICAgICAgYXBleCA9IFwiYXBleCN7aX1cIlxuICAgICAgICAgICAgICAgIGZuYW1lID0gXCIje2l9I3t2MX1cIlxuXG4gICAgICAgICAgICAgICAgZmxhZy52ZXJ0IGFwZXgsIGFkZCBjZW50ZXJzW2ldLCBtdWx0IGFwZXhkaXN0LCBub3JtYWxzW2ldXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCAgIHYxLCAgIHYyXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCAgIHYyLCBhcGV4XG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBhcGV4LCAgIHYxXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlIFwiI3tpfVwiLCB2MSwgdjJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdjEgPSB2MlxuICBcbiAgICBpZiBub3QgZm91bmRBbnlcbiAgICAgICAga2xvZyBcIk5vICN7bn0tZm9sZCBjb21wb25lbnRzIHdlcmUgZm91bmQuXCJcbiAgXG4gICAgZmxhZy50b3BvbHkgXCJrI3tufSN7cG9seS5uYW1lfVwiXG5cbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcblxudHJ1bmNhdGUgPSAocG9seSwgZmFjdG9yPTAuNSkgLT5cblxuICAgIGZhY3RvciA9IGNsYW1wIDAgMSBmYWN0b3JcbiAgICBlZGdlTWFwID0ge31cbiAgICBcbiAgICBudW1GYWNlcyAgICA9IHBvbHkuZmFjZS5sZW5ndGhcbiAgICBudW1WZXJ0aWNlcyA9IHBvbHkudmVydGV4Lmxlbmd0aFxuICAgIG5laWdoYm9ycyAgID0gcG9seS5uZWlnaGJvcnMoKVxuICAgIFxuICAgIGRlcHRoID0gMC41ICogZmFjdG9yICogcG9seS5taW5FZGdlTGVuZ3RoKClcbiAgICBcbiAgICBmb3IgdmVydGV4SW5kZXggaW4gWzAuLi5udW1WZXJ0aWNlc11cbiAgICAgICAgXG4gICAgICAgIGVkZ2VNYXBbdmVydGV4SW5kZXhdID89IHt9XG4gICAgICAgIGZhY2UgPSBbXVxuICAgICAgICBcbiAgICAgICAgbmwgPSBuZWlnaGJvcnNbdmVydGV4SW5kZXhdLmxlbmd0aFxuICAgICAgICBmb3IgaWkgaW4gWzAuLi5ubF1cbiAgICAgICAgICAgIG5pID0gbmVpZ2hib3JzW3ZlcnRleEluZGV4XVtpaV1cbiAgICAgICAgICAgIGVkZ2VNYXBbdmVydGV4SW5kZXhdW25pXSA9IHBvbHkudmVydGV4Lmxlbmd0aFxuICAgICAgICAgICAgdnAgPSBwb2x5LmVkZ2UgdmVydGV4SW5kZXgsIG5pXG4gICAgICAgICAgICB2cC5ub3JtYWxpemUoKVxuICAgICAgICAgICAgdnAuc2NhbGVJblBsYWNlIGRlcHRoXG4gICAgICAgICAgICB2cC5hZGRJblBsYWNlIHBvbHkudmVydCB2ZXJ0ZXhJbmRleFxuICAgICAgICAgICAgZmFjZS5wdXNoIHBvbHkudmVydGV4Lmxlbmd0aFxuICAgICAgICAgICAgcG9seS52ZXJ0ZXgucHVzaCBbdnAueCwgdnAueSwgdnAuel1cbiAgICAgICAgICAgIFxuICAgICAgICBwb2x5LmZhY2UucHVzaCBmYWNlXG4gICAgXG4gICAgZm9yIGZpIGluIFswLi4ubnVtRmFjZXNdXG4gICAgICAgIGZhY2UgPSBwb2x5LmZhY2VbZmldXG4gICAgICAgIG5ld0ZhY2UgPSBbXVxuICAgICAgICBmb3IgdmkgaW4gWzAuLi5mYWNlLmxlbmd0aF1cbiAgICAgICAgICAgIG5pID0gKHZpKzEpICUgZmFjZS5sZW5ndGhcbiAgICAgICAgICAgIG5ld0ZhY2UucHVzaCBlZGdlTWFwW2ZhY2VbdmldXVtmYWNlW25pXV1cbiAgICAgICAgICAgIGlmIGZhY3RvciA8IDFcbiAgICAgICAgICAgICAgICBuZXdGYWNlLnB1c2ggZWRnZU1hcFtmYWNlW25pXV1bZmFjZVt2aV1dXG4gICAgICAgIHBvbHkuZmFjZVtmaV0gPSBuZXdGYWNlXG4gICAgICBcbiAgICBwb2x5LnZlcnRleC5zcGxpY2UgMCwgbnVtVmVydGljZXNcbiAgICBmb3IgZmFjZSBpbiBwb2x5LmZhY2VcbiAgICAgICAgZm9yIGkgaW4gWzAuLi5mYWNlLmxlbmd0aF1cbiAgICAgICAgICAgIGZhY2VbaV0gLT0gbnVtVmVydGljZXNcbiAgICAgICAgXG4gICAgcG9seVxuICAgIFxuIyAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuXG4jIFRvcG9sb2dpY2FsIFwidHdlZW5cIiBiZXR3ZWVuIGEgcG9seWhlZHJvbiBhbmQgaXRzIGR1YWwgcG9seWhlZHJvbi5cblxuYW1ibyA9IChwb2x5KSAtPlxuICAgIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UoLTIpXG4gICAgICAgIGZvciB2MyBpbiBmXG4gICAgICAgICAgICBpZiB2MSA8IHYyXG4gICAgICAgICAgICAgICAgZmxhZy52ZXJ0IG1pZE5hbWUodjEsdjIpLCBtaWRwb2ludCBwb2x5LnZlcnRleFt2MV0sIHBvbHkudmVydGV4W3YyXVxuXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJvcmlnI3tpfVwiICBtaWROYW1lKHYxLHYyKSwgbWlkTmFtZSh2Mix2MylcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImR1YWwje3YyfVwiIG1pZE5hbWUodjIsdjMpLCBtaWROYW1lKHYxLHYyKVxuXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiYSN7cG9seS5uYW1lfVwiXG5cbmJldmVsID0gKHBvbHksIGZhY3Rvcj0wLjUpIC0+XG4gICAgXG4gICAgcCA9IHRydW5jYXRlIGFtYm8ocG9seSksIGZhY3RvclxuICAgIHAubmFtZSA9IFwiYiN7cG9seS5uYW1lfVwiXG4gICAgcFxuICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5jaGFtZmVyID0gKHBvbHksIGZhY3Rvcj0wLjUpIC0+XG4gICAgXG4gICAgZmFjdG9yICA9IGNsYW1wIDAuMDAxIDAuOTk1IGZhY3RvclxuICAgIGZsYWcgICAgPSBuZXcgRmxhZygpXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgd2luZ3MgICA9IHBvbHkud2luZ3MoKVxuICAgICAgICBcbiAgICBtaW5FZGdlTGVuZ3RoID0gSW5maW5pdHlcbiAgICBcbiAgICBmb3IgZWRnZSBpbiB3aW5nc1xuICAgICAgICBlMCA9IHBvbHkudmVydGV4W2VkZ2VbMF1dXG4gICAgICAgIGUxID0gcG9seS52ZXJ0ZXhbZWRnZVsxXV1cbiAgICAgICAgZWQgPSB1bml0IHN1YiBlMSwgZTBcbiAgICAgICAgXG4gICAgICAgIG5yID0gdW5pdCBzdWIgcG9seS52ZXJ0ZXhbZWRnZVsyXS5ucl0sIGUxXG4gICAgICAgIHByID0gdW5pdCBzdWIgcG9seS52ZXJ0ZXhbZWRnZVsyXS5wcl0sIGUwXG4gICAgICAgIGNyID0gcmF5UmF5IFtlMSwgbXVsdCAwLjUsIGFkZCBhZGQoZTEsIG5yKSwgc3ViKGUxLCBlZCldLFxuICAgICAgICAgICAgICAgICAgICBbZTAsIG11bHQgMC41LCBhZGQgYWRkKGUwLCBwciksIGFkZChlMCwgZWQpXVxuXG4gICAgICAgIGVsID0gbWFnIHN1YiBlMSwgcmF5UmF5IFtlMSwgYWRkKGUxLCBucildLCBbY3IsIGFkZChjciwgZWQpXVxuICAgICAgICBtaW5FZGdlTGVuZ3RoID0gbWluIG1pbkVkZ2VMZW5ndGgsIGVsXG5cbiAgICAgICAgZWwgPSBtYWcgc3ViIGUwLCByYXlSYXkgW2UwLCBhZGQoZTAsIHByKV0sIFtjciwgc3ViKGNyLCBlZCldXG4gICAgICAgIG1pbkVkZ2VMZW5ndGggPSBtaW4gbWluRWRnZUxlbmd0aCwgZWxcbiAgICAgICAgXG4gICAgbWluRWRnZUxlbmd0aCAqPSBmYWN0b3JcbiAgICAgICAgXG4gICAgbW92ZWQgPSB7fVxuICAgIGZvciBlZGdlIGluIHdpbmdzXG4gICAgICAgIGUwICA9IHBvbHkudmVydGV4W2VkZ2VbMF1dXG4gICAgICAgIGUxICA9IHBvbHkudmVydGV4W2VkZ2VbMV1dXG4gICAgICAgIHJyID0gW1xuICAgICAgICAgICAgYWRkKGUwLCBtdWx0IG1pbkVkZ2VMZW5ndGgsIHVuaXQgc3ViIHBvbHkudmVydGV4W2VkZ2VbMl0ucHJdLCBlMCksXG4gICAgICAgICAgICBhZGQoZTEsIG11bHQgbWluRWRnZUxlbmd0aCwgdW5pdCBzdWIgcG9seS52ZXJ0ZXhbZWRnZVsyXS5ucl0sIGUxKV1cbiAgICAgICAgbHIgPSBbXG4gICAgICAgICAgICBhZGQoZTAsIG11bHQgbWluRWRnZUxlbmd0aCwgdW5pdCBzdWIgcG9seS52ZXJ0ZXhbZWRnZVsyXS5wbF0sIGUwKSxcbiAgICAgICAgICAgIGFkZChlMSwgbXVsdCBtaW5FZGdlTGVuZ3RoLCB1bml0IHN1YiBwb2x5LnZlcnRleFtlZGdlWzJdLm5sXSwgZTEpXVxuICAgICAgICAgICAgXG4gICAgICAgIG1vdmVkW1wiI3tlZGdlWzFdfeKWuCN7ZWRnZVswXX1sXCJdID0gcnJcbiAgICAgICAgbW92ZWRbXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfXJcIl0gPSByclxuICAgICAgICBtb3ZlZFtcIiN7ZWRnZVsxXX3ilrgje2VkZ2VbMF19clwiXSA9IGxyXG4gICAgICAgIG1vdmVkW1wiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1sXCJdID0gbHJcbiAgICAgICAgICAgIFxuICAgIGZvciBlZGdlIGluIHdpbmdzXG4gICAgICAgIGUwICAgPSBwb2x5LnZlcnRleFtlZGdlWzBdXVxuICAgICAgICBlMSAgID0gcG9seS52ZXJ0ZXhbZWRnZVsxXV1cbiAgICAgICAgXG4gICAgICAgIG5mICA9IFwiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1cIiBcbiAgICAgICAgbl9oID0gXCIje2VkZ2VbMV19XCJcbiAgICAgICAgbl90ID0gXCIje2VkZ2VbMF19XCJcbiAgICAgICAgXG4gICAgICAgIG5uciA9IFwiI3tuX2h94pa4I3tlZGdlWzJdLmZyfVwiXG4gICAgICAgIG5ubCA9IFwiI3tuX2h94pa4I3tlZGdlWzJdLmZsfVwiXG4gICAgICAgIG5wciA9IFwiI3tuX3R94pa4I3tlZGdlWzJdLmZyfVwiXG4gICAgICAgIG5wbCA9IFwiI3tuX3R94pa4I3tlZGdlWzJdLmZsfVwiICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgbnIgPSByYXlSYXkgbW92ZWRbXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfXJcIl0sIG1vdmVkW1wiI3tlZGdlWzFdfeKWuCN7ZWRnZVsyXS5ucn1yXCJdXG4gICAgICAgIG5sID0gcmF5UmF5IG1vdmVkW1wiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1sXCJdLCBtb3ZlZFtcIiN7ZWRnZVsxXX3ilrgje2VkZ2VbMl0ubmx9bFwiXVxuICAgICAgICBwciA9IHJheVJheSBtb3ZlZFtcIiN7ZWRnZVswXX3ilrgje2VkZ2VbMV19clwiXSwgbW92ZWRbXCIje2VkZ2VbMl0ucHJ94pa4I3tlZGdlWzBdfXJcIl1cbiAgICAgICAgcGwgPSByYXlSYXkgbW92ZWRbXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfWxcIl0sIG1vdmVkW1wiI3tlZGdlWzJdLnBsfeKWuCN7ZWRnZVswXX1sXCJdXG4gICAgICAgIFxuICAgICAgICBwbWlkID0gbWlkcG9pbnQgcGwsIHByXG4gICAgICAgIG5taWQgPSBtaWRwb2ludCBubCwgbnJcbiAgICAgICAgY21pZCA9IG1pZHBvaW50IHBtaWQsIG5taWRcbiAgICAgICAgcG5tICA9IGNyb3NzIHN1YihwbWlkLG5taWQpLCBzdWIocGwscHIpXG5cbiAgICAgICAgaGVhZCA9IHJheVBsYW5lIFswIDAgMF0sIGUxLCBjbWlkLCBwbm1cbiAgICAgICAgdGFpbCA9IHJheVBsYW5lIFswIDAgMF0sIGUwLCBjbWlkLCBwbm1cbiAgICAgICAgXG4gICAgICAgIGZsYWcudmVydCBuX2gsIGhlYWRcbiAgICAgICAgZmxhZy52ZXJ0IG5fdCwgdGFpbFxuICAgICAgICBmbGFnLnZlcnQgbm5yLCBuclxuICAgICAgICBmbGFnLnZlcnQgbm5sLCBubFxuICAgICAgICBmbGFnLnZlcnQgbnBsLCBwbFxuICAgICAgICBmbGFnLnZlcnQgbnByLCBwclxuXG4gICAgICAgIGZsYWcuZWRnZSBuZiwgbl9oLCBubnJcbiAgICAgICAgZmxhZy5lZGdlIG5mLCBubnIsIG5wclxuICAgICAgICBmbGFnLmVkZ2UgbmYsIG5wciwgbl90XG4gICAgICAgIGZsYWcuZWRnZSBuZiwgbl90LCBucGxcbiAgICAgICAgZmxhZy5lZGdlIG5mLCBucGwsIG5ubFxuICAgICAgICBmbGFnLmVkZ2UgbmYsIG5ubCwgbl9oXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGZsYWcuZWRnZSBcIiN7ZWRnZVsyXS5mcn1cIiBucHIsIG5uclxuICAgICAgICBmbGFnLmVkZ2UgXCIje2VkZ2VbMl0uZmx9XCIgbm5sLCBucGxcbiAgICAgICAgXG4gICAgZmxhZy50b3BvbHkgXCJjI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuXG53aGlybCA9IChwb2x5LCBuPTApIC0+XG5cbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGV4Lmxlbmd0aF1cbiAgICAgICAgZmxhZy52ZXJ0IFwidiN7aX1cIiB1bml0IHBvbHkudmVydGV4W2ldXG5cbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSAtMlxuICAgICAgICBmb3IgaiBpbiBbMC4uLmYubGVuZ3RoXVxuICAgICAgICAgICAgdiA9IGZbal1cbiAgICAgICAgICAgIHYzID0gdlxuICAgICAgICAgICAgdjFfMiA9IG9uZVRoaXJkIHBvbHkudmVydGV4W3YxXSwgcG9seS52ZXJ0ZXhbdjJdXG4gICAgICAgICAgICBmbGFnLnZlcnQodjErXCJ+XCIrdjIsIHYxXzIpXG4gICAgICAgICAgICBjdjFuYW1lID0gXCJjZW50ZXIje2l9fiN7djF9XCJcbiAgICAgICAgICAgIGN2Mm5hbWUgPSBcImNlbnRlciN7aX1+I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy52ZXJ0IGN2MW5hbWUsIHVuaXQgb25lVGhpcmQgY2VudGVyc1tpXSwgdjFfMlxuICAgICAgICAgICAgZm5hbWUgPSBpK1wiZlwiK3YxXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIGN2MW5hbWUsICAgdjErXCJ+XCIrdjJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjErXCJ+XCIrdjIsIHYyK1wiflwiK3YxIFxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MitcIn5cIit2MSwgXCJ2I3t2Mn1cIiAgXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIFwidiN7djJ9XCIsICB2MitcIn5cIit2MyBcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjIrXCJ+XCIrdjMsIGN2Mm5hbWVcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgY3YybmFtZSwgICBjdjFuYW1lXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJjI3tpfVwiLCBjdjFuYW1lLCBjdjJuYW1lXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M11cbiAgXG4gICAgY2Fub25pY2FsaXplIGZsYWcudG9wb2x5IFwidyN7cG9seS5uYW1lfVwiXG5cbiMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAwICAgIDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcblxuZ3lybyA9IChwb2x5KSAtPlxuXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgdW5pdCBwb2x5LnZlcnRleFtpXVxuXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIGZsYWcudmVydCBcImNlbnRlciN7aX1cIiB1bml0IGNlbnRlcnNbaV1cbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSgtMilcbiAgICAgICAgZm9yIGogaW4gWzAuLi5mLmxlbmd0aF1cbiAgICAgICAgICAgIHYgPSBmW2pdXG4gICAgICAgICAgICB2MyA9IHZcbiAgICAgICAgICAgIGZsYWcudmVydCB2MStcIn5cIit2Miwgb25lVGhpcmQgcG9seS52ZXJ0ZXhbdjFdLHBvbHkudmVydGV4W3YyXVxuICAgICAgICAgICAgZm5hbWUgPSBpK1wiZlwiK3YxXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIFwiY2VudGVyI3tpfVwiICB2MStcIn5cIit2MlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MStcIn5cIit2MiwgIHYyK1wiflwiK3YxXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYyK1wiflwiK3YxLCAgXCJ2I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBcInYje3YyfVwiICAgICB2MitcIn5cIit2M1xuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MitcIn5cIit2MywgIFwiY2VudGVyI3tpfVwiXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gIFxuICAgIGNhbm9uaWNhbGl6ZSBmbGFnLnRvcG9seSBcImcje3BvbHkubmFtZX1cIlxuICAgIFxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAwMCAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuIyAwMDAgMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiMgIDAwMDAwIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgXG5cbnF1aW50byA9IChwb2x5KSAtPiAjIGNyZWF0ZXMgYSBwZW50YWdvbiBmb3IgZXZlcnkgdmVydGV4IGFuZCBhIG5ldyBpbnNldCBmYWNlXG4gICAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIGNlbnRyb2lkID0gY2FsY0NlbnRyb2lkIGYubWFwIChpZHgpIC0+IHBvbHkudmVydGV4W2lkeF1cblxuICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UgLTJcbiAgICAgICAgZm9yIHYzIGluIGZcbiAgICAgICAgICAgIG1pZHB0ID0gbWlkcG9pbnQgcG9seS52ZXJ0ZXhbdjFdLCBwb2x5LnZlcnRleFt2Ml1cbiAgICAgICAgICAgIGlubmVycHQgPSBtaWRwb2ludCBtaWRwdCwgY2VudHJvaWRcbiAgICAgICAgICAgIGZsYWcudmVydCBtaWROYW1lKHYxLHYyKSwgbWlkcHRcbiAgICAgICAgICAgIGZsYWcudmVydCBcImlubmVyXyN7aX1fXCIgKyBtaWROYW1lKHYxLHYyKSwgaW5uZXJwdFxuICAgICAgICAgICAgZmxhZy52ZXJ0IFwiI3t2Mn1cIiBwb2x5LnZlcnRleFt2Ml1cbiAgICAgICAgICBcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9XyN7djJ9XCIsIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYxLCB2MiksIG1pZE5hbWUodjEsIHYyKVxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7aX1fI3t2Mn1cIiwgbWlkTmFtZSh2MSwgdjIpLCBcIiN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9XyN7djJ9XCIsIFwiI3t2Mn1cIiwgbWlkTmFtZSh2MiwgdjMpXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfV8je3YyfVwiLCBtaWROYW1lKHYyLCB2MyksIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYyLCB2MylcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9XyN7djJ9XCIsIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYyLCB2MyksIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYxLCB2MilcbiAgICAgIFxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZl9pbl8je2l9XCIsIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYxLCB2MiksIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYyLCB2MylcbiAgICAgIFxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICBcbiAgICBmbGFnLnRvcG9seSBcInEje3BvbHkubmFtZX1cIlxuXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMFxuIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICBcbiMgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgXG4jIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAwMDAgICBcblxuaW5zZXQgPSAocG9seSwgaW5zZXQ9MC41LCBwb3BvdXQ9LTAuMiwgbj0wKSAtPlxuICBcbiAgICBpbnNldCA9IGNsYW1wIDAuMjUgMC45OSBpbnNldFxuICAgIHBvcG91dCA9IG1pbiBwb3BvdXQsIGluc2V0XG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGV4Lmxlbmd0aF1cbiAgICAgICAgcCA9IHBvbHkudmVydGV4W2ldXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgcFxuXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICAgICAgZmxhZy52ZXJ0IFwiZiN7aX12I3t2fVwiIGFkZCB0d2Vlbihwb2x5LnZlcnRleFt2XSxjZW50ZXJzW2ldLGluc2V0KSwgbXVsdChwb3BvdXQsbm9ybWFsc1tpXSlcbiAgXG4gICAgZm91bmRBbnkgPSBmYWxzZSAjIGFsZXJ0IGlmIGRvbid0IGZpbmQgYW55XG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIHYxID0gXCJ2I3tmW2YubGVuZ3RoLTFdfVwiXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIHYyID0gXCJ2I3t2fVwiO1xuICAgICAgICAgICAgaWYgZi5sZW5ndGggPT0gbiBvciBuID09IDBcbiAgICAgICAgICAgICAgICBmb3VuZEFueSA9IHRydWVcbiAgICAgICAgICAgICAgICBmbmFtZSA9IGkgKyB2MVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZShmbmFtZSwgICAgICB2MSwgICAgICAgdjIpXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlKGZuYW1lLCAgICAgIHYyLCAgICAgICBcImYje2l9I3t2Mn1cIilcbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UoZm5hbWUsIFwiZiN7aX0je3YyfVwiLCAgXCJmI3tpfSN7djF9XCIpXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlKGZuYW1lLCBcImYje2l9I3t2MX1cIiwgIHYxKVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZShcImV4I3tpfVwiLCBcImYje2l9I3t2MX1cIiwgIFwiZiN7aX0je3YyfVwiKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZShpLCB2MSwgdjIpICBcbiAgICAgICAgICAgIHYxPXYyXG4gIFxuICAgIGlmIG5vdCBmb3VuZEFueVxuICAgICAgICBrbG9nIFwiTm8gI3tufS1mb2xkIGNvbXBvbmVudHMgd2VyZSBmb3VuZC5cIlxuICBcbiAgICBmbGFnLnRvcG9seSBcIm4je259I3twb2x5Lm5hbWV9XCJcblxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcblxuZXh0cnVkZSA9IChwb2x5LCBwb3BvdXQ9MSwgaW5zZXRmPTAuNSwgbj0wKSAtPlxuICAgIG5ld3BvbHkgPSBpbnNldCBwb2x5LCBpbnNldGYsIHBvcG91dCwgblxuICAgIG5ld3BvbHkubmFtZSA9IFwieCN7bn0je3BvbHkubmFtZX1cIlxuICAgIG5ld3BvbHlcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAwMFxuIyAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4jIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAgICAgICAwMDAgICAwMDBcblxucGVyc3BlY3RpdmEgPSAocG9seSkgLT4gIyBhbiBvcGVyYXRpb24gcmV2ZXJzZS1lbmdpbmVlcmVkIGZyb20gUGVyc3BlY3RpdmEgQ29ycG9ydW0gUmVndWxhcml1bVxuXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgcG9seS52ZXJ0ZXhbaV1cbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBcbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0yXX1cIlxuICAgICAgICB2MiA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICB2ZXJ0MSA9IHBvbHkudmVydGV4W2ZbZi5sZW5ndGgtMl1dXG4gICAgICAgIHZlcnQyID0gcG9seS52ZXJ0ZXhbZltmLmxlbmd0aC0xXV1cbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgdjMgPSBcInYje3Z9XCJcbiAgICAgICAgICAgIHZlcnQzID0gcG9seS52ZXJ0ZXhbdl1cbiAgICAgICAgICAgIHYxMiA9IHYxK1wiflwiK3YyXG4gICAgICAgICAgICB2MjEgPSB2MitcIn5cIit2MVxuICAgICAgICAgICAgdjIzID0gdjIrXCJ+XCIrdjNcbiAgICAgIFxuICAgICAgICAgICAgIyBvbiBlYWNoIE5mYWNlLCBOIG5ldyBwb2ludHMgaW5zZXQgZnJvbSBlZGdlIG1pZHBvaW50cyB0b3dhcmRzIGNlbnRlciA9IFwic3RlbGxhdGVkXCIgcG9pbnRzXG4gICAgICAgICAgICBmbGFnLnZlcnQgdjEyLCBtaWRwb2ludCBtaWRwb2ludCh2ZXJ0MSx2ZXJ0MiksIGNlbnRlcnNbaV0gXG4gICAgICBcbiAgICAgICAgICAgICMgaW5zZXQgTmZhY2UgbWFkZSBvZiBuZXcsIHN0ZWxsYXRlZCBwb2ludHNcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImluI3tpfVwiIHYxMiwgdjIzXG4gICAgICBcbiAgICAgICAgICAgICMgbmV3IHRyaSBmYWNlIGNvbnN0aXR1dGluZyB0aGUgcmVtYWluZGVyIG9mIHRoZSBzdGVsbGF0ZWQgTmZhY2VcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9I3t2Mn1cIiB2MjMsIHYxMlxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7aX0je3YyfVwiIHYxMiwgdjJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9I3t2Mn1cIiB2MiwgIHYyM1xuICAgICAgXG4gICAgICAgICAgICAjIG9uZSBvZiB0aGUgdHdvIG5ldyB0cmlhbmdsZXMgcmVwbGFjaW5nIG9sZCBlZGdlIGJldHdlZW4gdjEtPnYyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3t2MTJ9XCIgdjEsICB2MjFcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje3YxMn1cIiB2MjEsIHYxMlxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7djEyfVwiIHYxMiwgdjFcbiAgICAgIFxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICAgICAgICAgICAgW3ZlcnQxLCB2ZXJ0Ml0gPSBbdmVydDIsIHZlcnQzXVxuICBcbiAgICBmbGFnLnRvcG9seSBcIlAje3BvbHkubmFtZX1cIlxuXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG5cbnRyaXN1YiA9IChwb2x5LCBuPTIpIC0+XG4gICAgXG4gICAgZm9yIGZuIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgaWYgcG9seS5mYWNlW2ZuXS5sZW5ndGggIT0gM1xuICAgICAgICAgICAgcmV0dXJuIHBvbHlcbiAgXG4gICAgdmVydHMgPSBbXVxuICAgIHZtYXAgPSB7fVxuICAgIHBvcyA9IDBcbiAgICBmb3IgZm4gaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ZuXVxuICAgICAgICBbaTEsIGkyLCBpM10gPSBmLnNsaWNlIC0zXG4gICAgICAgIHYxID0gcG9seS52ZXJ0ZXhbaTFdXG4gICAgICAgIHYyID0gcG9seS52ZXJ0ZXhbaTJdXG4gICAgICAgIHYzID0gcG9seS52ZXJ0ZXhbaTNdXG4gICAgICAgIHYyMSA9IHN1YiB2MiwgdjFcbiAgICAgICAgdjMxID0gc3ViIHYzLCB2MVxuICAgICAgICBmb3IgaSBpbiBbMC4ubl1cbiAgICAgICAgICAgIGZvciBqIGluIFswLi5uLWldXG4gICAgICAgICAgICAgICAgdiA9IGFkZCBhZGQodjEsIG11bHQoaS9uLCB2MjEpKSwgbXVsdChqL24sIHYzMSlcbiAgICAgICAgICAgICAgICB2bWFwW1widiN7Zm59LSN7aX0tI3tqfVwiXSA9IHBvcysrXG4gICAgICAgICAgICAgICAgdmVydHMucHVzaCB2XG4gIFxuICAgIEVQU0lMT05fQ0xPU0UgPSAxLjBlLThcbiAgICB1bmlxVnMgPSBbXVxuICAgIG5ld3BvcyA9IDBcbiAgICB1bmlxbWFwID0ge31cbiAgICBmb3IgdixpIGluIHZlcnRzXG4gICAgICAgIGlmIGkgaW4gdW5pcW1hcCB0aGVuIGNvbnRpbnVlICMgYWxyZWFkeSBtYXBwZWRcbiAgICAgICAgdW5pcW1hcFtpXSA9IG5ld3Bvc1xuICAgICAgICB1bmlxVnMucHVzaCB2XG4gICAgICAgIGZvciBqIGluIFtpKzEuLi52ZXJ0cy5sZW5ndGhdXG4gICAgICAgICAgICB3ID0gdmVydHNbal1cbiAgICAgICAgICAgIGlmIG1hZyhzdWIodiwgdykpIDwgRVBTSUxPTl9DTE9TRVxuICAgICAgICAgICAgICAgIHVuaXFtYXBbal0gPSBuZXdwb3NcbiAgICAgICAgbmV3cG9zKytcbiAgXG4gICAgZmFjZXMgPSBbXVxuICAgIGZvciBmbiBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgIGZvciBpIGluIFswLi4ubl1cbiAgICAgICAgICAgIGZvciBqIGluIFswLi4ubi1pXVxuICAgICAgICAgICAgICAgIGZhY2VzLnB1c2ggW3VuaXFtYXBbdm1hcFtcInYje2ZufS0je2l9LSN7an1cIl1dLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpKzF9LSN7an1cIl1dLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2orMX1cIl1dXVxuICAgICAgICBmb3IgaSBpbiBbMS4uLm5dXG4gICAgICAgICAgICBmb3IgaiBpbiBbMC4uLm4taV1cbiAgICAgICAgICAgICAgICBmYWNlcy5wdXNoIFt1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2p9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqKzF9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aS0xfS0je2orMX1cIl1dXVxuICBcbiAgICBuZXcgUG9seWhlZHJvbiBcInUje259I3twb2x5Lm5hbWV9XCIgZmFjZXMsIHVuaXFWc1xuXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4jIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbiMgU2xvdyBDYW5vbmljYWxpemF0aW9uIEFsZ29yaXRobVxuI1xuIyBUaGlzIGFsZ29yaXRobSBoYXMgc29tZSBjb252ZXJnZW5jZSBwcm9ibGVtcywgd2hhdCByZWFsbHkgbmVlZHMgdG8gYmUgZG9uZSBpcyB0b1xuIyBzdW0gdGhlIHRocmVlIGZvcmNpbmcgZmFjdG9ycyB0b2dldGhlciBhcyBhIGNvaGVyZW50IGZvcmNlIGFuZCB0byB1c2UgYSBoYWxmLWRlY2VudFxuIyBpbnRlZ3JhdG9yIHRvIG1ha2Ugc3VyZSB0aGF0IGl0IGNvbnZlcmdlcyB3ZWxsIGFzIG9wcG9zZWQgdG8gdGhlIGN1cnJlbnQgaGFjayBvZlxuIyBhZC1ob2Mgc3RhYmlsaXR5IG11bHRpcGxpZXJzLiAgSWRlYWxseSBvbmUgd291bGQgaW1wbGVtZW50IGEgY29uanVnYXRlIGdyYWRpZW50XG4jIGRlc2NlbnQgb3Igc2ltaWxhciBwcmV0dHkgdGhpbmcuXG4jXG4jIE9ubHkgdHJ5IHRvIHVzZSB0aGlzIG9uIGNvbnZleCBwb2x5aGVkcmEgdGhhdCBoYXZlIGEgY2hhbmNlIG9mIGJlaW5nIGNhbm9uaWNhbGl6ZWQsXG4jIG90aGVyd2lzZSBpdCB3aWxsIHByb2JhYmx5IGJsb3cgdXAgdGhlIGdlb21ldHJ5LiAgQSBtdWNoIHRyaWNraWVyIC8gc21hcnRlciBzZWVkLXN5bW1ldHJ5XG4jIGJhc2VkIGdlb21ldHJpY2FsIHJlZ3VsYXJpemVyIHNob3VsZCBiZSB1c2VkIGZvciBmYW5jaWVyL3dlaXJkZXIgcG9seWhlZHJhLlxuXG5jYW5vbmljYWxpemUgPSAocG9seSwgaXRlcj0yMDApIC0+XG5cbiAgICBmYWNlcyA9IHBvbHkuZmFjZVxuICAgIGVkZ2VzID0gcG9seS5lZGdlcygpXG4gICAgdmVydHMgPSBwb2x5LnZlcnRleFxuICAgIG1heENoYW5nZSA9IDEuMFxuICAgIGZvciBpIGluIFswLi5pdGVyXVxuICAgICAgICBvbGRWcyA9IGNvcHlWZWNBcnJheSB2ZXJ0c1xuICAgICAgICB2ZXJ0cyA9IHRhbmdlbnRpZnkgdmVydHMsIGVkZ2VzXG4gICAgICAgIHZlcnRzID0gcmVjZW50ZXIgdmVydHMsIGVkZ2VzXG4gICAgICAgIHZlcnRzID0gcGxhbmFyaXplIHZlcnRzLCBmYWNlc1xuICAgICAgICBtYXhDaGFuZ2UgPSBfLm1heCBfLm1hcCBfLnppcCh2ZXJ0cywgb2xkVnMpLCAoW3gsIHldKSAtPiBtYWcgc3ViIHgsIHlcbiAgICAgICAgaWYgbWF4Q2hhbmdlIDwgMWUtOFxuICAgICAgICAgICAgYnJlYWtcbiAgICB2ZXJ0cyA9IHJlc2NhbGUgdmVydHNcbiAgICBuZXcgUG9seWhlZHJvbiBwb2x5Lm5hbWUsIHBvbHkuZmFjZSwgdmVydHNcbiAgICBcbmNhbm9uaWNhbFhZWiA9IChwb2x5LCBpdGVyYXRpb25zKSAtPlxuXG4gICAgaXRlcmF0aW9ucyA/PSAxXG4gICAgZHBvbHkgPSBkdWFsIHBvbHlcbiAgXG4gICAgZm9yIGNvdW50IGluIFswLi4uaXRlcmF0aW9uc10gIyByZWNpcHJvY2F0ZSBmYWNlIG5vcm1hbHNcbiAgICAgICAgZHBvbHkudmVydGV4ID0gcmVjaXByb2NhbE4gcG9seVxuICAgICAgICBwb2x5LnZlcnRleCAgPSByZWNpcHJvY2FsTiBkcG9seVxuICBcbiAgICBuZXcgUG9seWhlZHJvbiBwb2x5Lm5hbWUsIHBvbHkuZmFjZSwgcG9seS52ZXJ0ZXhcblxuZmxhdHRlbiA9IChwb2x5LCBpdGVyYXRpb25zKSAtPiAjIHF1aWNrIHBsYW5hcml6YXRpb25cbiAgICBcbiAgICBpdGVyYXRpb25zID89IDFcbiAgICBkcG9seSA9IGR1YWwgcG9seVxuICBcbiAgICBmb3IgY291bnQgaW4gWzAuLi5pdGVyYXRpb25zXVxuICAgICAgICBkcG9seS52ZXJ0ZXggPSByZWNpcHJvY2FsQyBwb2x5XG4gICAgICAgIHBvbHkudmVydGV4ICA9IHJlY2lwcm9jYWxDIGRwb2x5XG4gIFxuICAgIG5ldyBQb2x5aGVkcm9uIHBvbHkubmFtZSwgcG9seS5mYWNlLCBwb2x5LnZlcnRleFxuICAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICBcbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgICBkdWFsOiAgICAgICAgICAgZHVhbFxuICAgIGJldmVsOiAgICAgICAgICBiZXZlbFxuICAgIHRyaXN1YjogICAgICAgICB0cmlzdWJcbiAgICB0cnVuY2F0ZTogICAgICAgdHJ1bmNhdGVcbiAgICBwZXJzcGVjdGl2YTogICAgcGVyc3BlY3RpdmFcbiAgICBraXM6ICAgICAgICAgICAga2lzXG4gICAgYW1ibzogICAgICAgICAgIGFtYm9cbiAgICBneXJvOiAgICAgICAgICAgZ3lyb1xuICAgIGNoYW1mZXI6ICAgICAgICBjaGFtZmVyXG4gICAgd2hpcmw6ICAgICAgICAgIHdoaXJsXG4gICAgcXVpbnRvOiAgICAgICAgIHF1aW50b1xuICAgIGluc2V0OiAgICAgICAgICBpbnNldFxuICAgIGV4dHJ1ZGU6ICAgICAgICBleHRydWRlXG4gICAgZXhwYW5kOiAgICAgICAgIGV4cGFuZFxuICAgIGhvbGxvdzogICAgICAgICBob2xsb3dcbiAgICBmbGF0dGVuOiAgICAgICAgZmxhdHRlblxuICAgIHppcmt1bGFyaXplOiAgICB6aXJrdWxhcml6ZVxuICAgIHNwaGVyaWNhbGl6ZTogICBzcGhlcmljYWxpemVcbiAgICBjYW5vbmljYWxpemU6ICAgY2Fub25pY2FsaXplXG4gICAgY2Fub25pY2FsWFlaOiAgIGNhbm9uaWNhbFhZWlxuICAgICJdfQ==
//# sourceURL=../../coffee/poly/topo.coffee