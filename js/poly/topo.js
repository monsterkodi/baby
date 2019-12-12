// koffee 1.6.0

/*
000000000   0000000   00000000    0000000     
   000     000   000  000   000  000   000    
   000     000   000  00000000   000   000    
   000     000   000  000        000   000    
   000      0000000   000         0000000
 */
var Flag, Polyhedron, Vect, _, add, ambo, angle, bevel, calcCentroid, canonicalXYZ, canonicalize, chamfer, clamp, clockwise, copyVecArray, cross, dual, expand, extrude, faceToEdges, flatten, gyro, hollow, inset, intersect, kis, klog, mag, midName, midpoint, min, mult, oneThird, perspectiva, planarize, quinto, rayPlane, rayRay, recenter, reciprocalC, reciprocalN, ref, ref1, rescale, rotate, sphericalize, sqrt, sub, tangentify, trisub, truncate, tween, unit, whirl, zirkularize, ϕ,
    indexOf = [].indexOf;

ref = require('kxk'), _ = ref._, clamp = ref.clamp, klog = ref.klog;

ref1 = require('./math'), add = ref1.add, angle = ref1.angle, calcCentroid = ref1.calcCentroid, clockwise = ref1.clockwise, copyVecArray = ref1.copyVecArray, cross = ref1.cross, faceToEdges = ref1.faceToEdges, intersect = ref1.intersect, mag = ref1.mag, midpoint = ref1.midpoint, mult = ref1.mult, oneThird = ref1.oneThird, planarize = ref1.planarize, rayPlane = ref1.rayPlane, rayRay = ref1.rayRay, recenter = ref1.recenter, reciprocalC = ref1.reciprocalC, reciprocalN = ref1.reciprocalN, rescale = ref1.rescale, rotate = ref1.rotate, sub = ref1.sub, tangentify = ref1.tangentify, tween = ref1.tween, unit = ref1.unit;

min = Math.min, sqrt = Math.sqrt;

Vect = require('../vect');

ϕ = (sqrt(5) - 1) / 2;

Flag = require('./flag');

Polyhedron = require('./polyhedron');

midName = function(v1, v2) {
    return v1 < v2 && (v1 + "_" + v2) || (v2 + "_" + v1);
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

hollow = function(poly, insetf, thickness) {
    var centers, d1, d2, dualnormals, e0, e1, edge, f, f1, f2, flag, fname, i, i1, i2, insetv, l, len, len1, len2, m, mn, mo, n0, n1, normals, p, q, r, ref2, ref3, ref4, ref5, ref6, s, t, u, v, v1, v2, wings;
    if (insetf == null) {
        insetf = 0.5;
    }
    if (thickness == null) {
        thickness = 0.5;
    }
    insetf = clamp(0.1, 0.9, insetf);
    dualnormals = dual(poly).normals();
    normals = poly.normals();
    centers = poly.centers();
    wings = poly.wings();
    if (thickness != null) {
        thickness;
    } else {
        thickness = 2e308;
    }
    for (i = l = 0, ref2 = poly.face.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        ref3 = faceToEdges(poly.face[i]);
        for (m = 0, len = ref3.length; m < len; m++) {
            edge = ref3[m];
            e0 = poly.vertex[edge[0]];
            e1 = poly.vertex[edge[1]];
            n0 = tween(e0, centers[i], insetf);
            n1 = tween(e1, centers[i], insetf);
            mo = midpoint(e0, e1);
            mn = midpoint(n0, n1);
            thickness = min(thickness, mag(sub(mo, mn)));
        }
    }
    klog(insetf, thickness);
    flag = new Flag();
    for (i = q = 0, ref4 = poly.vertex.length; 0 <= ref4 ? q < ref4 : q > ref4; i = 0 <= ref4 ? ++q : --q) {
        p = poly.vertex[i];
        flag.vert("v" + i, p);
    }
    for (i = r = 0, ref5 = poly.face.length; 0 <= ref5 ? r < ref5 : r > ref5; i = 0 <= ref5 ? ++r : --r) {
        f = poly.face[i];
        for (s = 0, len1 = f.length; s < len1; s++) {
            v = f[s];
            insetv = tween(poly.vertex[v], centers[i], insetf);
            flag.vert("fin" + i + "v" + v, insetv);
            flag.vert("findown" + i + "v" + v, add(insetv, mult(-thickness, normals[i])));
        }
    }
    for (i = t = 0, ref6 = poly.face.length; 0 <= ref6 ? t < ref6 : t > ref6; i = 0 <= ref6 ? ++t : --t) {
        f = poly.face[i];
        v1 = "v" + f[f.length - 1];
        for (u = 0, len2 = f.length; u < len2; u++) {
            v = f[u];
            v2 = "v" + v;
            i1 = "fin" + i + v1;
            i2 = "fin" + i + v2;
            d1 = "down" + v1;
            d2 = "down" + v2;
            f1 = "findown" + i + v1;
            f2 = "findown" + i + v2;
            fname = i + v1;
            flag.edge(fname, v1, v2);
            flag.edge(fname, v2, i2);
            flag.edge(fname, i2, i1);
            flag.edge(fname, i1, v1);
            fname = "sides" + i + v1;
            flag.edge(fname, i1, i2);
            flag.edge(fname, i2, f2);
            flag.edge(fname, f2, f1);
            flag.edge(fname, f1, i1);
            v1 = v2;
        }
    }
    return flag.topoly("h" + poly.name);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9wby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsOGRBQUE7SUFBQTs7QUFVQSxNQUFxQixPQUFBLENBQVEsS0FBUixDQUFyQixFQUFFLFNBQUYsRUFBSyxpQkFBTCxFQUFZOztBQUNaLE9BQXNPLE9BQUEsQ0FBUSxRQUFSLENBQXRPLEVBQUUsY0FBRixFQUFPLGtCQUFQLEVBQWMsZ0NBQWQsRUFBNEIsMEJBQTVCLEVBQXVDLGdDQUF2QyxFQUFxRCxrQkFBckQsRUFBNEQsOEJBQTVELEVBQXlFLDBCQUF6RSxFQUFvRixjQUFwRixFQUF5Rix3QkFBekYsRUFBbUcsZ0JBQW5HLEVBQXlHLHdCQUF6RyxFQUFtSCwwQkFBbkgsRUFBOEgsd0JBQTlILEVBQXdJLG9CQUF4SSxFQUFnSix3QkFBaEosRUFBMEosOEJBQTFKLEVBQXVLLDhCQUF2SyxFQUFvTCxzQkFBcEwsRUFBNkwsb0JBQTdMLEVBQXFNLGNBQXJNLEVBQTBNLDRCQUExTSxFQUFzTixrQkFBdE4sRUFBNk47O0FBQzNOLGNBQUYsRUFBTzs7QUFDUCxJQUFBLEdBQU8sT0FBQSxDQUFRLFNBQVI7O0FBRVAsQ0FBQSxHQUFJLENBQUMsSUFBQSxDQUFLLENBQUwsQ0FBQSxHQUFRLENBQVQsQ0FBQSxHQUFZOztBQUVoQixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0FBQ1AsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztBQUViLE9BQUEsR0FBVSxTQUFDLEVBQUQsRUFBSyxFQUFMO1dBQVksRUFBQSxHQUFHLEVBQUgsSUFBVSxDQUFHLEVBQUQsR0FBSSxHQUFKLEdBQU8sRUFBVCxDQUFWLElBQTJCLENBQUcsRUFBRCxHQUFJLEdBQUosR0FBTyxFQUFUO0FBQXZDOztBQVFWLE1BQUEsR0FBUyxTQUFDLElBQUQsRUFBTyxNQUFQO0FBRUwsUUFBQTs7UUFGWSxTQUFPOztJQUVuQixNQUFBLEdBQVksS0FBQSxDQUFN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LEVBQWdCLEtBWGhCO0lBWUEsT0FBQSxFQUFnQixPQVpoQjtJQWFBLE1BQUEsRUFBZ0IsTUFiaEI7SUFjQSxNQUFBLEVBQWdCLE1BZGhCO0lBZUEsT0FBQSxFQUFnQixPQWZoQjtJQWdCQSxXQUFBLEVBQWdCLFdBaEJoQjtJQWlCQSxZQUFBLEVBQWdCLFlBakJoQjtJQWtCQSxZQUFBLEVBQWdCLFlBbEJoQjtJQW1CQSxZQUFBLEVBQWdCLFlBbkJoQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgIFxuICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAgIFxuIyMjXG5cbiMgUG9seWjDqWRyb25pc21lLCBDb3B5cmlnaHQgMjAxOSwgQW5zZWxtIExldnNrYXlhLCBNSVQgTGljZW5zZVxuXG57IF8sIGNsYW1wLCBrbG9nIH0gPSByZXF1aXJlICdreGsnXG57IGFkZCwgYW5nbGUsIGNhbGNDZW50cm9pZCwgY2xvY2t3aXNlLCBjb3B5VmVjQXJyYXksIGNyb3NzLCBmYWNlVG9FZGdlcywgaW50ZXJzZWN0LCBtYWcsIG1pZHBvaW50LCBtdWx0LCBvbmVUaGlyZCwgcGxhbmFyaXplLCByYXlQbGFuZSwgcmF5UmF5LCByZWNlbnRlciwgcmVjaXByb2NhbEMsIHJlY2lwcm9jYWxOLCByZXNjYWxlLCByb3RhdGUsIHN1YiwgdGFuZ2VudGlmeSwgdHdlZW4sIHVuaXQgfSA9IHJlcXVpcmUgJy4vbWF0aCdcbnsgbWluLCBzcXJ0IH0gPSBNYXRoXG5WZWN0ID0gcmVxdWlyZSAnLi4vdmVjdCdcblxuz5UgPSAoc3FydCg1KS0xKS8yXG5cbkZsYWcgPSByZXF1aXJlICcuL2ZsYWcnXG5Qb2x5aGVkcm9uID0gcmVxdWlyZSAnLi9wb2x5aGVkcm9uJ1xuXG5taWROYW1lID0gKHYxLCB2MikgLT4gdjE8djIgYW5kIFwiI3t2MX1fI3t2Mn1cIiBvciBcIiN7djJ9XyN7djF9XCJcblxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuXG5leHBhbmQgPSAocG9seSwgYW1vdW50PTAuNSkgLT5cblxuICAgIGFtb3VudCAgICA9IGNsYW1wIDAgMTAgYW1vdW50XG4gICAgb2xkZWRnZXMgID0gcG9seS5lZGdlcygpXG4gICAgY2VudGVycyAgID0gcG9seS5jZW50ZXJzKClcbiAgICBuZWlnaGJvcnMgPSBwb2x5Lm5laWdoYm9ycygpXG4gICAgd2luZ3MgICAgID0gcG9seS53aW5ncygpXG4gICAgICAgIFxuICAgIHZlcnRzID0gW11cbiAgICBmYWNlcyA9IFtdXG4gICAgdm1hcCAgPSB7fVxuICAgIGltYXAgID0ge31cbiAgICBuZXdWICA9IDBcbiAgICBmb3IgZmkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBkID0gc3ViIG11bHQoMSthbW91bnQsIGNlbnRlcnNbZmldKSwgY2VudGVyc1tmaV1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtmaV1cbiAgICAgICAgZmFjZSA9IFtdXG4gICAgICAgIGZvciB2LHZpIGluIGZcbiAgICAgICAgICAgIHZtYXBbdl0gPz0gW11cbiAgICAgICAgICAgIHZtYXBbdl0ucHVzaCBuZXdWXG4gICAgICAgICAgICBpbWFwW25ld1ZdID0gdlxuICAgICAgICAgICAgdmVydHMucHVzaCBhZGQgcG9seS52ZXJ0ZXhbdl0sIGRcbiAgICAgICAgICAgIG5leHRWID0gbmV3Visodmk9PWYubGVuZ3RoLTEgYW5kIC1mLmxlbmd0aCsxIG9yIDEpXG4gICAgICAgICAgICBmYWNlLnB1c2ggbmV3VlxuICAgICAgICAgICAgbmV3VisrXG4gICAgICAgIGZhY2VzLnB1c2ggZmFjZVxuICAgICAgICAgICAgXG4gICAgZm9yIHdpbmcgaW4gd2luZ3NcbiAgICAgICAgW2EsYl0gPSB3aW5nXG4gICAgICAgIGZhY2UgPSB2bWFwW2FdLmNvbmNhdCB2bWFwW2JdXG4gICAgICAgIGZhY2UgPSBmYWNlLmZpbHRlciAodikgLT4gKHYgaW4gZmFjZXNbd2luZ1syXS5mcl0pIG9yICh2IGluIGZhY2VzW3dpbmdbMl0uZmxdKVxuICAgICAgICBjbG9ja3dpc2UgdmVydHMsIGZhY2VcbiAgICAgICAgZmFjZXMucHVzaCBmYWNlXG5cbiAgICBmb3IgbyxuIG9mIHZtYXBcbiAgICAgICAgY2xvY2t3aXNlIHZlcnRzLCBuXG4gICAgICAgIGZhY2VzLnB1c2ggblxuICAgICAgICBcbiAgICBuZXcgUG9seWhlZHJvbiBcImUje3BvbHkubmFtZX1cIiBmYWNlcywgdmVydHNcblxuIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuIyAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxuc3BoZXJpY2FsaXplID0gKHBvbHkpIC0+XG5cbiAgICB2ZXJ0cyA9IFtdXG4gICAgZm9yIHZlcnRleCx2aSBpbiBwb2x5LnZlcnRleFxuICAgICAgICB2ZXJ0cy5wdXNoIHVuaXQgcG9seS52ZXJ0ZXhbdmldXG4gICAgICAgIFxuICAgIG5ldyBQb2x5aGVkcm9uIFwieiN7cG9seS5uYW1lfVwiIHBvbHkuZmFjZSwgdmVydHNcblxuIyAwMDAwMDAwICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4jICAgMDAwICAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuIyAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbnppcmt1bGFyaXplID0gKHBvbHksIGdyb3c9MSwgbj02KSAtPlxuXG4gICAgdmVydGljZXMgPSBbXVxuICAgIFxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIFxuICAgIGZvciBmLGZpIGluIHBvbHkuZmFjZVxuXG4gICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICAgICAgYXhpcyA9IGNyb3NzIGNlbnRlcnNbZmldLCBwb2x5LnZlcnRleFt2XVxuICAgICAgICAgICAgICAgIGFuZ2wgPSBhbmdsZSBjZW50ZXJzW2ZpXSwgcG9seS52ZXJ0ZXhbdl1cbiAgICAgICAgICAgICAgICB2ZXJ0aWNlc1t2XSA9IHJvdGF0ZSBjZW50ZXJzW2ZpXSwgYXhpcywgYW5nbCAqIGdyb3dcbiAgICAgICAgICAgICAgICBcbiAgICB2ZXJ0cyA9IFswLi4ucG9seS52ZXJ0ZXgubGVuZ3RoXS5tYXAgKGkpIC0+IHZlcnRpY2VzW2ldID8gcG9seS52ZXJ0ZXhbaV1cbiAgICAgXG4gICAgbmV3IFBvbHloZWRyb24gXCJ6I3twb2x5Lm5hbWV9XCIgcG9seS5mYWNlLCB2ZXJ0c1xuXG4jIDAwMDAwMDAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICBcblxuZHVhbCA9IChwb2x5KSAtPlxuXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgZmFjZSA9IFtdIFxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0ZXgubGVuZ3RoXSBcbiAgICAgICAgZmFjZVtpXSA9IHt9XG5cbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VbaV1cbiAgICAgICAgdjEgPSBmWy0xXVxuICAgICAgICBmb3IgdjIgaW4gZlxuICAgICAgICAgICAgZmFjZVt2MV1bXCJ2I3t2Mn1cIl0gPSBcIiN7aX1cIlxuICAgICAgICAgICAgdjEgPSB2MlxuICBcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgIGZsYWcudmVydCBcIiN7aX1cIiBjZW50ZXJzW2ldXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICB2MSA9IGZbLTFdXG4gICAgICAgIGZvciB2MiBpbiBmXG4gICAgICAgICAgICBmbGFnLmVkZ2UgdjEsIGZhY2VbdjJdW1widiN7djF9XCJdLCBcIiN7aX1cIlxuICAgICAgICAgICAgdjEgPSB2MlxuICBcbiAgICBkcG9seSA9IGZsYWcudG9wb2x5KClcbiAgXG4gICAgc29ydEYgPSBbXVxuICAgIGZvciBmIGluIGRwb2x5LmZhY2VcbiAgICAgICAgayA9IGludGVyc2VjdCBwb2x5LmZhY2VbZlswXV0sIHBvbHkuZmFjZVtmWzFdXSwgcG9seS5mYWNlW2ZbMl1dXG4gICAgICAgIHNvcnRGW2tdID0gZlxuICAgIGRwb2x5LmZhY2UgPSBzb3J0RlxuICBcbiAgICBpZiBwb2x5Lm5hbWVbMF0gIT0gXCJkXCJcbiAgICAgICAgZHBvbHkubmFtZSA9IFwiZCN7cG9seS5uYW1lfVwiXG4gICAgZWxzZSBcbiAgICAgICAgZHBvbHkubmFtZSA9IHBvbHkubmFtZS5zbGljZSAxXG4gIFxuICAgIGRwb2x5XG5cbiMgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgIDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbiMgS2lzIChhYmJyZXZpYXRlZCBmcm9tIHRyaWFraXMpIHRyYW5zZm9ybXMgYW4gTi1zaWRlZCBmYWNlIGludG8gYW4gTi1weXJhbWlkIHJvb3RlZCBhdCB0aGVcbiMgc2FtZSBiYXNlIHZlcnRpY2VzLiBvbmx5IGtpcyBuLXNpZGVkIGZhY2VzLCBidXQgbj09MCBtZWFucyBraXMgYWxsLlxuXG5raXMgPSAocG9seSwgYXBleGRpc3Q9MC41LCBuPTApIC0+XG5cbiAgICBhcGV4ZGlzdCA9IGNsYW1wIC0xIDEwIGFwZXhkaXN0XG4gICAgXG4gICAgaWYgYXBleGRpc3QgPCAwXG4gICAgICAgIGFwZXhkaXN0ID0gYXBleGRpc3QgKiBwb2x5Lm1pbkZhY2VEaXN0KClcbiAgICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0ZXgubGVuZ3RoXVxuICAgICAgICBmbGFnLnZlcnQgXCJ2I3tpfVwiIHBvbHkudmVydGV4W2ldXG4gIFxuICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIGZvdW5kQW55ID0gZmFsc2VcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VbaV1cbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgdjIgPSBcInYje3Z9XCJcbiAgICAgICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICAgICAgZm91bmRBbnkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGFwZXggPSBcImFwZXgje2l9XCJcbiAgICAgICAgICAgICAgICBmbmFtZSA9IFwiI3tpfSN7djF9XCJcblxuICAgICAgICAgICAgICAgIGZsYWcudmVydCBhcGV4LCBhZGQgY2VudGVyc1tpXSwgbXVsdCBhcGV4ZGlzdCwgbm9ybWFsc1tpXVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgICB2MSwgICB2MlxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgICB2MiwgYXBleFxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgYXBleCwgICB2MVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZSBcIiN7aX1cIiwgdjEsIHYyXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHYxID0gdjJcbiAgXG4gICAgaWYgbm90IGZvdW5kQW55XG4gICAgICAgIGtsb2cgXCJObyAje259LWZvbGQgY29tcG9uZW50cyB3ZXJlIGZvdW5kLlwiXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiayN7bn0je3BvbHkubmFtZX1cIlxuXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgXG5cbnRydW5jYXRlID0gKHBvbHksIGZhY3Rvcj0wLjUpIC0+XG5cbiAgICBmYWN0b3IgPSBjbGFtcCAwIDEgZmFjdG9yXG4gICAgZWRnZU1hcCA9IHt9XG4gICAgXG4gICAgbnVtRmFjZXMgICAgPSBwb2x5LmZhY2UubGVuZ3RoXG4gICAgbnVtVmVydGljZXMgPSBwb2x5LnZlcnRleC5sZW5ndGhcbiAgICBuZWlnaGJvcnMgICA9IHBvbHkubmVpZ2hib3JzKClcbiAgICBcbiAgICBkZXB0aCA9IDAuNSAqIGZhY3RvciAqIHBvbHkubWluRWRnZUxlbmd0aCgpXG4gICAgXG4gICAgZm9yIHZlcnRleEluZGV4IGluIFswLi4ubnVtVmVydGljZXNdXG4gICAgICAgIFxuICAgICAgICBlZGdlTWFwW3ZlcnRleEluZGV4XSA/PSB7fVxuICAgICAgICBmYWNlID0gW11cbiAgICAgICAgXG4gICAgICAgIG5sID0gbmVpZ2hib3JzW3ZlcnRleEluZGV4XS5sZW5ndGhcbiAgICAgICAgZm9yIGlpIGluIFswLi4ubmxdXG4gICAgICAgICAgICBuaSA9IG5laWdoYm9yc1t2ZXJ0ZXhJbmRleF1baWldXG4gICAgICAgICAgICBlZGdlTWFwW3ZlcnRleEluZGV4XVtuaV0gPSBwb2x5LnZlcnRleC5sZW5ndGhcbiAgICAgICAgICAgIHZwID0gcG9seS5lZGdlIHZlcnRleEluZGV4LCBuaVxuICAgICAgICAgICAgdnAubm9ybWFsaXplKClcbiAgICAgICAgICAgIHZwLnNjYWxlSW5QbGFjZSBkZXB0aFxuICAgICAgICAgICAgdnAuYWRkSW5QbGFjZSBwb2x5LnZlcnQgdmVydGV4SW5kZXhcbiAgICAgICAgICAgIGZhY2UucHVzaCBwb2x5LnZlcnRleC5sZW5ndGhcbiAgICAgICAgICAgIHBvbHkudmVydGV4LnB1c2ggW3ZwLngsIHZwLnksIHZwLnpdXG4gICAgICAgICAgICBcbiAgICAgICAgcG9seS5mYWNlLnB1c2ggZmFjZVxuICAgIFxuICAgIGZvciBmaSBpbiBbMC4uLm51bUZhY2VzXVxuICAgICAgICBmYWNlID0gcG9seS5mYWNlW2ZpXVxuICAgICAgICBuZXdGYWNlID0gW11cbiAgICAgICAgZm9yIHZpIGluIFswLi4uZmFjZS5sZW5ndGhdXG4gICAgICAgICAgICBuaSA9ICh2aSsxKSAlIGZhY2UubGVuZ3RoXG4gICAgICAgICAgICBuZXdGYWNlLnB1c2ggZWRnZU1hcFtmYWNlW3ZpXV1bZmFjZVtuaV1dXG4gICAgICAgICAgICBpZiBmYWN0b3IgPCAxXG4gICAgICAgICAgICAgICAgbmV3RmFjZS5wdXNoIGVkZ2VNYXBbZmFjZVtuaV1dW2ZhY2VbdmldXVxuICAgICAgICBwb2x5LmZhY2VbZmldID0gbmV3RmFjZVxuICAgICAgXG4gICAgcG9seS52ZXJ0ZXguc3BsaWNlIDAsIG51bVZlcnRpY2VzXG4gICAgZm9yIGZhY2UgaW4gcG9seS5mYWNlXG4gICAgICAgIGZvciBpIGluIFswLi4uZmFjZS5sZW5ndGhdXG4gICAgICAgICAgICBmYWNlW2ldIC09IG51bVZlcnRpY2VzXG4gICAgICAgIFxuICAgIHBvbHlcbiAgICBcbiMgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICBcblxuIyBUb3BvbG9naWNhbCBcInR3ZWVuXCIgYmV0d2VlbiBhIHBvbHloZWRyb24gYW5kIGl0cyBkdWFsIHBvbHloZWRyb24uXG5cbmFtYm8gPSAocG9seSkgLT5cbiAgICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VbaV1cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlKC0yKVxuICAgICAgICBmb3IgdjMgaW4gZlxuICAgICAgICAgICAgaWYgdjEgPCB2MlxuICAgICAgICAgICAgICAgIGZsYWcudmVydCBtaWROYW1lKHYxLHYyKSwgbWlkcG9pbnQgcG9seS52ZXJ0ZXhbdjFdLCBwb2x5LnZlcnRleFt2Ml1cblxuICAgICAgICAgICAgZmxhZy5lZGdlIFwib3JpZyN7aX1cIiAgbWlkTmFtZSh2MSx2MiksIG1pZE5hbWUodjIsdjMpXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJkdWFsI3t2Mn1cIiBtaWROYW1lKHYyLHYzKSwgbWlkTmFtZSh2MSx2MilcblxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICBcbiAgICBmbGFnLnRvcG9seSBcImEje3BvbHkubmFtZX1cIlxuXG5iZXZlbCA9IChwb2x5LCBmYWN0b3I9MC41KSAtPlxuICAgIFxuICAgIHAgPSB0cnVuY2F0ZSBhbWJvKHBvbHkpLCBmYWN0b3JcbiAgICBwLm5hbWUgPSBcImIje3BvbHkubmFtZX1cIlxuICAgIHBcbiAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcblxuY2hhbWZlciA9IChwb2x5LCBmYWN0b3I9MC41KSAtPlxuICAgIFxuICAgIGZhY3RvciAgPSBjbGFtcCAwLjAwMSAwLjk5NSBmYWN0b3JcbiAgICBmbGFnICAgID0gbmV3IEZsYWcoKVxuICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIHdpbmdzICAgPSBwb2x5LndpbmdzKClcbiAgICAgICAgXG4gICAgbWluRWRnZUxlbmd0aCA9IEluZmluaXR5XG4gICAgXG4gICAgZm9yIGVkZ2UgaW4gd2luZ3NcbiAgICAgICAgZTAgPSBwb2x5LnZlcnRleFtlZGdlWzBdXVxuICAgICAgICBlMSA9IHBvbHkudmVydGV4W2VkZ2VbMV1dXG4gICAgICAgIGVkID0gdW5pdCBzdWIgZTEsIGUwXG4gICAgICAgIFxuICAgICAgICBuciA9IHVuaXQgc3ViIHBvbHkudmVydGV4W2VkZ2VbMl0ubnJdLCBlMVxuICAgICAgICBwciA9IHVuaXQgc3ViIHBvbHkudmVydGV4W2VkZ2VbMl0ucHJdLCBlMFxuICAgICAgICBjciA9IHJheVJheSBbZTEsIG11bHQgMC41LCBhZGQgYWRkKGUxLCBuciksIHN1YihlMSwgZWQpXSxcbiAgICAgICAgICAgICAgICAgICAgW2UwLCBtdWx0IDAuNSwgYWRkIGFkZChlMCwgcHIpLCBhZGQoZTAsIGVkKV1cblxuICAgICAgICBlbCA9IG1hZyBzdWIgZTEsIHJheVJheSBbZTEsIGFkZChlMSwgbnIpXSwgW2NyLCBhZGQoY3IsIGVkKV1cbiAgICAgICAgbWluRWRnZUxlbmd0aCA9IG1pbiBtaW5FZGdlTGVuZ3RoLCBlbFxuXG4gICAgICAgIGVsID0gbWFnIHN1YiBlMCwgcmF5UmF5IFtlMCwgYWRkKGUwLCBwcildLCBbY3IsIHN1YihjciwgZWQpXVxuICAgICAgICBtaW5FZGdlTGVuZ3RoID0gbWluIG1pbkVkZ2VMZW5ndGgsIGVsXG4gICAgICAgIFxuICAgIG1pbkVkZ2VMZW5ndGggKj0gZmFjdG9yXG4gICAgICAgIFxuICAgIG1vdmVkID0ge31cbiAgICBmb3IgZWRnZSBpbiB3aW5nc1xuICAgICAgICBlMCAgPSBwb2x5LnZlcnRleFtlZGdlWzBdXVxuICAgICAgICBlMSAgPSBwb2x5LnZlcnRleFtlZGdlWzFdXVxuICAgICAgICByciA9IFtcbiAgICAgICAgICAgIGFkZChlMCwgbXVsdCBtaW5FZGdlTGVuZ3RoLCB1bml0IHN1YiBwb2x5LnZlcnRleFtlZGdlWzJdLnByXSwgZTApLFxuICAgICAgICAgICAgYWRkKGUxLCBtdWx0IG1pbkVkZ2VMZW5ndGgsIHVuaXQgc3ViIHBvbHkudmVydGV4W2VkZ2VbMl0ubnJdLCBlMSldXG4gICAgICAgIGxyID0gW1xuICAgICAgICAgICAgYWRkKGUwLCBtdWx0IG1pbkVkZ2VMZW5ndGgsIHVuaXQgc3ViIHBvbHkudmVydGV4W2VkZ2VbMl0ucGxdLCBlMCksXG4gICAgICAgICAgICBhZGQoZTEsIG11bHQgbWluRWRnZUxlbmd0aCwgdW5pdCBzdWIgcG9seS52ZXJ0ZXhbZWRnZVsyXS5ubF0sIGUxKV1cbiAgICAgICAgICAgIFxuICAgICAgICBtb3ZlZFtcIiN7ZWRnZVsxXX3ilrgje2VkZ2VbMF19bFwiXSA9IHJyXG4gICAgICAgIG1vdmVkW1wiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1yXCJdID0gcnJcbiAgICAgICAgbW92ZWRbXCIje2VkZ2VbMV194pa4I3tlZGdlWzBdfXJcIl0gPSBsclxuICAgICAgICBtb3ZlZFtcIiN7ZWRnZVswXX3ilrgje2VkZ2VbMV19bFwiXSA9IGxyXG4gICAgICAgICAgICBcbiAgICBmb3IgZWRnZSBpbiB3aW5nc1xuICAgICAgICBlMCAgID0gcG9seS52ZXJ0ZXhbZWRnZVswXV1cbiAgICAgICAgZTEgICA9IHBvbHkudmVydGV4W2VkZ2VbMV1dXG4gICAgICAgIFxuICAgICAgICBuZiAgPSBcIiN7ZWRnZVswXX3ilrgje2VkZ2VbMV19XCIgXG4gICAgICAgIG5faCA9IFwiI3tlZGdlWzFdfVwiXG4gICAgICAgIG5fdCA9IFwiI3tlZGdlWzBdfVwiXG4gICAgICAgIFxuICAgICAgICBubnIgPSBcIiN7bl9ofeKWuCN7ZWRnZVsyXS5mcn1cIlxuICAgICAgICBubmwgPSBcIiN7bl9ofeKWuCN7ZWRnZVsyXS5mbH1cIlxuICAgICAgICBucHIgPSBcIiN7bl90feKWuCN7ZWRnZVsyXS5mcn1cIlxuICAgICAgICBucGwgPSBcIiN7bl90feKWuCN7ZWRnZVsyXS5mbH1cIiAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIG5yID0gcmF5UmF5IG1vdmVkW1wiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1yXCJdLCBtb3ZlZFtcIiN7ZWRnZVsxXX3ilrgje2VkZ2VbMl0ubnJ9clwiXVxuICAgICAgICBubCA9IHJheVJheSBtb3ZlZFtcIiN7ZWRnZVswXX3ilrgje2VkZ2VbMV19bFwiXSwgbW92ZWRbXCIje2VkZ2VbMV194pa4I3tlZGdlWzJdLm5sfWxcIl1cbiAgICAgICAgcHIgPSByYXlSYXkgbW92ZWRbXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfXJcIl0sIG1vdmVkW1wiI3tlZGdlWzJdLnByfeKWuCN7ZWRnZVswXX1yXCJdXG4gICAgICAgIHBsID0gcmF5UmF5IG1vdmVkW1wiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1sXCJdLCBtb3ZlZFtcIiN7ZWRnZVsyXS5wbH3ilrgje2VkZ2VbMF19bFwiXVxuICAgICAgICBcbiAgICAgICAgcG1pZCA9IG1pZHBvaW50IHBsLCBwclxuICAgICAgICBubWlkID0gbWlkcG9pbnQgbmwsIG5yXG4gICAgICAgIGNtaWQgPSBtaWRwb2ludCBwbWlkLCBubWlkXG4gICAgICAgIHBubSAgPSBjcm9zcyBzdWIocG1pZCxubWlkKSwgc3ViKHBsLHByKVxuXG4gICAgICAgIGhlYWQgPSByYXlQbGFuZSBbMCAwIDBdLCBlMSwgY21pZCwgcG5tXG4gICAgICAgIHRhaWwgPSByYXlQbGFuZSBbMCAwIDBdLCBlMCwgY21pZCwgcG5tXG4gICAgICAgIFxuICAgICAgICBmbGFnLnZlcnQgbl9oLCBoZWFkXG4gICAgICAgIGZsYWcudmVydCBuX3QsIHRhaWxcbiAgICAgICAgZmxhZy52ZXJ0IG5uciwgbnJcbiAgICAgICAgZmxhZy52ZXJ0IG5ubCwgbmxcbiAgICAgICAgZmxhZy52ZXJ0IG5wbCwgcGxcbiAgICAgICAgZmxhZy52ZXJ0IG5wciwgcHJcblxuICAgICAgICBmbGFnLmVkZ2UgbmYsIG5faCwgbm5yXG4gICAgICAgIGZsYWcuZWRnZSBuZiwgbm5yLCBucHJcbiAgICAgICAgZmxhZy5lZGdlIG5mLCBucHIsIG5fdFxuICAgICAgICBmbGFnLmVkZ2UgbmYsIG5fdCwgbnBsXG4gICAgICAgIGZsYWcuZWRnZSBuZiwgbnBsLCBubmxcbiAgICAgICAgZmxhZy5lZGdlIG5mLCBubmwsIG5faFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBmbGFnLmVkZ2UgXCIje2VkZ2VbMl0uZnJ9XCIgbnByLCBubnJcbiAgICAgICAgZmxhZy5lZGdlIFwiI3tlZGdlWzJdLmZsfVwiIG5ubCwgbnBsXG4gICAgICAgIFxuICAgIGZsYWcudG9wb2x5IFwiYyN7cG9seS5uYW1lfVwiXG5cbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICBcblxud2hpcmwgPSAocG9seSwgbj0wKSAtPlxuXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgdW5pdCBwb2x5LnZlcnRleFtpXVxuXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UgLTJcbiAgICAgICAgZm9yIGogaW4gWzAuLi5mLmxlbmd0aF1cbiAgICAgICAgICAgIHYgPSBmW2pdXG4gICAgICAgICAgICB2MyA9IHZcbiAgICAgICAgICAgIHYxXzIgPSBvbmVUaGlyZCBwb2x5LnZlcnRleFt2MV0sIHBvbHkudmVydGV4W3YyXVxuICAgICAgICAgICAgZmxhZy52ZXJ0KHYxK1wiflwiK3YyLCB2MV8yKVxuICAgICAgICAgICAgY3YxbmFtZSA9IFwiY2VudGVyI3tpfX4je3YxfVwiXG4gICAgICAgICAgICBjdjJuYW1lID0gXCJjZW50ZXIje2l9fiN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcudmVydCBjdjFuYW1lLCB1bml0IG9uZVRoaXJkIGNlbnRlcnNbaV0sIHYxXzJcbiAgICAgICAgICAgIGZuYW1lID0gaStcImZcIit2MVxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBjdjFuYW1lLCAgIHYxK1wiflwiK3YyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYxK1wiflwiK3YyLCB2MitcIn5cIit2MSBcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjIrXCJ+XCIrdjEsIFwidiN7djJ9XCIgIFxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBcInYje3YyfVwiLCAgdjIrXCJ+XCIrdjMgXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYyK1wiflwiK3YzLCBjdjJuYW1lXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIGN2Mm5hbWUsICAgY3YxbmFtZVxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiYyN7aX1cIiwgY3YxbmFtZSwgY3YybmFtZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gIFxuICAgIGNhbm9uaWNhbGl6ZSBmbGFnLnRvcG9seSBcIncje3BvbHkubmFtZX1cIlxuXG4jICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwMCAgICAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG5cbmd5cm8gPSAocG9seSkgLT5cblxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0ZXgubGVuZ3RoXVxuICAgICAgICBmbGFnLnZlcnQgXCJ2I3tpfVwiIHVuaXQgcG9seS52ZXJ0ZXhbaV1cblxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICBmbGFnLnZlcnQgXCJjZW50ZXIje2l9XCIgdW5pdCBjZW50ZXJzW2ldXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UoLTIpXG4gICAgICAgIGZvciBqIGluIFswLi4uZi5sZW5ndGhdXG4gICAgICAgICAgICB2ID0gZltqXVxuICAgICAgICAgICAgdjMgPSB2XG4gICAgICAgICAgICBmbGFnLnZlcnQgdjErXCJ+XCIrdjIsIG9uZVRoaXJkIHBvbHkudmVydGV4W3YxXSxwb2x5LnZlcnRleFt2Ml1cbiAgICAgICAgICAgIGZuYW1lID0gaStcImZcIit2MVxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBcImNlbnRlciN7aX1cIiAgdjErXCJ+XCIrdjJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjErXCJ+XCIrdjIsICB2MitcIn5cIit2MVxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MitcIn5cIit2MSwgIFwidiN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgXCJ2I3t2Mn1cIiAgICAgdjIrXCJ+XCIrdjNcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjIrXCJ+XCIrdjMsICBcImNlbnRlciN7aX1cIlxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICBcbiAgICBjYW5vbmljYWxpemUgZmxhZy50b3BvbHkgXCJnI3twb2x5Lm5hbWV9XCJcbiAgICBcbiMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuIyAwMDAgMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiMgMDAwIDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMCAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIFxuXG5xdWludG8gPSAocG9seSkgLT4gIyBjcmVhdGVzIGEgcGVudGFnb24gZm9yIGV2ZXJ5IHZlcnRleCBhbmQgYSBuZXcgaW5zZXQgZmFjZVxuICAgIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICBjZW50cm9pZCA9IGNhbGNDZW50cm9pZCBmLm1hcCAoaWR4KSAtPiBwb2x5LnZlcnRleFtpZHhdXG5cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlIC0yXG4gICAgICAgIGZvciB2MyBpbiBmXG4gICAgICAgICAgICBtaWRwdCA9IG1pZHBvaW50IHBvbHkudmVydGV4W3YxXSwgcG9seS52ZXJ0ZXhbdjJdXG4gICAgICAgICAgICBpbm5lcnB0ID0gbWlkcG9pbnQgbWlkcHQsIGNlbnRyb2lkXG4gICAgICAgICAgICBmbGFnLnZlcnQgbWlkTmFtZSh2MSx2MiksIG1pZHB0XG4gICAgICAgICAgICBmbGFnLnZlcnQgXCJpbm5lcl8je2l9X1wiICsgbWlkTmFtZSh2MSx2MiksIGlubmVycHRcbiAgICAgICAgICAgIGZsYWcudmVydCBcIiN7djJ9XCIgcG9seS52ZXJ0ZXhbdjJdXG4gICAgICAgICAgXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfV8je3YyfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpLCBtaWROYW1lKHYxLCB2MilcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9XyN7djJ9XCIsIG1pZE5hbWUodjEsIHYyKSwgXCIje3YyfVwiXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfV8je3YyfVwiLCBcIiN7djJ9XCIsIG1pZE5hbWUodjIsIHYzKVxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7aX1fI3t2Mn1cIiwgbWlkTmFtZSh2MiwgdjMpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfV8je3YyfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpXG4gICAgICBcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImZfaW5fI3tpfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpXG4gICAgICBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M11cbiAgXG4gICAgZmxhZy50b3BvbHkgXCJxI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDBcbiMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgXG4jIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgIFxuIyAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgMDAwICAgXG5cbmluc2V0ID0gKHBvbHksIGluc2V0PTAuNSwgcG9wb3V0PS0wLjIsIG49MCkgLT5cbiAgXG4gICAgaW5zZXQgPSBjbGFtcCAwLjI1IDAuOTkgaW5zZXRcbiAgICBwb3BvdXQgPSBtaW4gcG9wb3V0LCBpbnNldFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdXG4gICAgICAgIHAgPSBwb2x5LnZlcnRleFtpXVxuICAgICAgICBmbGFnLnZlcnQgXCJ2I3tpfVwiIHBcblxuICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICBpZiBmLmxlbmd0aCA9PSBuIG9yIG4gPT0gMFxuICAgICAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgICAgIGZsYWcudmVydCBcImYje2l9diN7dn1cIiBhZGQgdHdlZW4ocG9seS52ZXJ0ZXhbdl0sY2VudGVyc1tpXSxpbnNldCksIG11bHQocG9wb3V0LG5vcm1hbHNbaV0pXG4gIFxuICAgIGZvdW5kQW55ID0gZmFsc2UgIyBhbGVydCBpZiBkb24ndCBmaW5kIGFueVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MiA9IFwidiN7dn1cIjtcbiAgICAgICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICAgICAgZm91bmRBbnkgPSB0cnVlXG4gICAgICAgICAgICAgICAgZm5hbWUgPSBpICsgdjFcbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UoZm5hbWUsICAgICAgdjEsICAgICAgIHYyKVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZShmbmFtZSwgICAgICB2MiwgICAgICAgXCJmI3tpfSN7djJ9XCIpXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlKGZuYW1lLCBcImYje2l9I3t2Mn1cIiwgIFwiZiN7aX0je3YxfVwiKVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZShmbmFtZSwgXCJmI3tpfSN7djF9XCIsICB2MSlcbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UoXCJleCN7aX1cIiwgXCJmI3tpfSN7djF9XCIsICBcImYje2l9I3t2Mn1cIilcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UoaSwgdjEsIHYyKSAgXG4gICAgICAgICAgICB2MT12MlxuICBcbiAgICBpZiBub3QgZm91bmRBbnlcbiAgICAgICAga2xvZyBcIk5vICN7bn0tZm9sZCBjb21wb25lbnRzIHdlcmUgZm91bmQuXCJcbiAgXG4gICAgZmxhZy50b3BvbHkgXCJuI3tufSN7cG9seS5uYW1lfVwiXG5cbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG5cbmV4dHJ1ZGUgPSAocG9seSwgcG9wb3V0PTEsIGluc2V0Zj0wLjUsIG49MCkgLT5cbiAgICBuZXdwb2x5ID0gaW5zZXQgcG9seSwgaW5zZXRmLCBwb3BvdXQsIG5cbiAgICBuZXdwb2x5Lm5hbWUgPSBcIngje259I3twb2x5Lm5hbWV9XCJcbiAgICBuZXdwb2x5XG5cbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICBcblxuaG9sbG93ID0gKHBvbHksIGluc2V0Zj0wLjUsIHRoaWNrbmVzcz0wLjUpIC0+XG5cbiAgICBpbnNldGYgPSBjbGFtcCAwLjEgMC45IGluc2V0ZlxuICAgIGR1YWxub3JtYWxzID0gZHVhbChwb2x5KS5ub3JtYWxzKClcbiAgICBub3JtYWxzID0gcG9seS5ub3JtYWxzKClcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgICB3aW5ncyAgID0gcG9seS53aW5ncygpXG4gICAgXG4gICAgdGhpY2tuZXNzID89IEluZmluaXR5XG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmb3IgZWRnZSBpbiBmYWNlVG9FZGdlcyBwb2x5LmZhY2VbaV1cbiAgICAgICAgICAgIGUwID0gcG9seS52ZXJ0ZXhbZWRnZVswXV1cbiAgICAgICAgICAgIGUxID0gcG9seS52ZXJ0ZXhbZWRnZVsxXV1cbiAgICAgICAgICAgIG4wID0gdHdlZW4gZTAsIGNlbnRlcnNbaV0sIGluc2V0ZlxuICAgICAgICAgICAgbjEgPSB0d2VlbiBlMSwgY2VudGVyc1tpXSwgaW5zZXRmXG4gICAgICAgICAgICBtbyA9IG1pZHBvaW50IGUwLCBlMVxuICAgICAgICAgICAgbW4gPSBtaWRwb2ludCBuMCwgbjFcbiAgICAgICAgICAgIHRoaWNrbmVzcyA9IG1pbiB0aGlja25lc3MsIG1hZyBzdWIgbW8sIG1uXG4gICAgXG4gICAga2xvZyBpbnNldGYsIHRoaWNrbmVzc1xuICAgIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdXG4gICAgICAgIHAgPSBwb2x5LnZlcnRleFtpXVxuICAgICAgICBmbGFnLnZlcnQgXCJ2I3tpfVwiIHBcbiAgICAgICAgIyBmbGFnLnZlcnQgXCJkb3dudiN7aX1cIiBhZGQgcCwgbXVsdCAtdGhpY2tuZXNzLCBkdWFsbm9ybWFsc1tpXVxuXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIGluc2V0diA9IHR3ZWVuIHBvbHkudmVydGV4W3ZdLCBjZW50ZXJzW2ldLCBpbnNldGZcbiAgICAgICAgICAgIGZsYWcudmVydCBcImZpbiN7aX12I3t2fVwiIGluc2V0dlxuICAgICAgICAgICAgZmxhZy52ZXJ0IFwiZmluZG93biN7aX12I3t2fVwiIGFkZCBpbnNldHYsIG11bHQgLXRoaWNrbmVzcywgbm9ybWFsc1tpXVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VbaV1cbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2MiA9IFwidiN7dn1cIlxuICAgICAgICAgICAgaTEgPSBcImZpbiN7aX0je3YxfVwiXG4gICAgICAgICAgICBpMiA9IFwiZmluI3tpfSN7djJ9XCJcbiAgICAgICAgICAgIGQxID0gXCJkb3duI3t2MX1cIlxuICAgICAgICAgICAgZDIgPSBcImRvd24je3YyfVwiXG4gICAgICAgICAgICBmMSA9IFwiZmluZG93biN7aX0je3YxfVwiXG4gICAgICAgICAgICBmMiA9IFwiZmluZG93biN7aX0je3YyfVwiXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZuYW1lID0gaSArIHYxXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYxLCB2MlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MiwgaTJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgaTIsIGkxXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIGkxLCB2MVxuICAgICAgXG4gICAgICAgICAgICBmbmFtZSA9IFwic2lkZXMje2l9I3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBpMSwgaTJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgaTIsIGYyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIGYyLCBmMVxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBmMSwgaTFcbiAgICAgIFxuICAgICAgICAgICAgIyBmbmFtZSA9IFwiYm90dG9tI3tpfSN7djF9XCJcbiAgICAgICAgICAgICMgZmxhZy5lZGdlIGZuYW1lLCBkMiwgZDFcbiAgICAgICAgICAgICMgZmxhZy5lZGdlIGZuYW1lLCBkMSwgZjFcbiAgICAgICAgICAgICMgZmxhZy5lZGdlIGZuYW1lLCBmMSwgZjJcbiAgICAgICAgICAgICMgZmxhZy5lZGdlIGZuYW1lLCBmMiwgZDJcbiAgICAgIFxuICAgICAgICAgICAgdjEgPSB2MlxuICBcbiAgICBmbGFnLnRvcG9seSBcImgje3BvbHkubmFtZX1cIlxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMDAwXG4jIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcbiMgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMCAgICAgIDAwMCAgIDAwMFxuXG5wZXJzcGVjdGl2YSA9IChwb2x5KSAtPiAjIGFuIG9wZXJhdGlvbiByZXZlcnNlLWVuZ2luZWVyZWQgZnJvbSBQZXJzcGVjdGl2YSBDb3Jwb3J1bSBSZWd1bGFyaXVtXG5cbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGV4Lmxlbmd0aF1cbiAgICAgICAgZmxhZy52ZXJ0IFwidiN7aX1cIiBwb2x5LnZlcnRleFtpXVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgIFxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIHYxID0gXCJ2I3tmW2YubGVuZ3RoLTJdfVwiXG4gICAgICAgIHYyID0gXCJ2I3tmW2YubGVuZ3RoLTFdfVwiXG4gICAgICAgIHZlcnQxID0gcG9seS52ZXJ0ZXhbZltmLmxlbmd0aC0yXV1cbiAgICAgICAgdmVydDIgPSBwb2x5LnZlcnRleFtmW2YubGVuZ3RoLTFdXVxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MyA9IFwidiN7dn1cIlxuICAgICAgICAgICAgdmVydDMgPSBwb2x5LnZlcnRleFt2XVxuICAgICAgICAgICAgdjEyID0gdjErXCJ+XCIrdjJcbiAgICAgICAgICAgIHYyMSA9IHYyK1wiflwiK3YxXG4gICAgICAgICAgICB2MjMgPSB2MitcIn5cIit2M1xuICAgICAgXG4gICAgICAgICAgICAjIG9uIGVhY2ggTmZhY2UsIE4gbmV3IHBvaW50cyBpbnNldCBmcm9tIGVkZ2UgbWlkcG9pbnRzIHRvd2FyZHMgY2VudGVyID0gXCJzdGVsbGF0ZWRcIiBwb2ludHNcbiAgICAgICAgICAgIGZsYWcudmVydCB2MTIsIG1pZHBvaW50IG1pZHBvaW50KHZlcnQxLHZlcnQyKSwgY2VudGVyc1tpXSBcbiAgICAgIFxuICAgICAgICAgICAgIyBpbnNldCBOZmFjZSBtYWRlIG9mIG5ldywgc3RlbGxhdGVkIHBvaW50c1xuICAgICAgICAgICAgZmxhZy5lZGdlIFwiaW4je2l9XCIgdjEyLCB2MjNcbiAgICAgIFxuICAgICAgICAgICAgIyBuZXcgdHJpIGZhY2UgY29uc3RpdHV0aW5nIHRoZSByZW1haW5kZXIgb2YgdGhlIHN0ZWxsYXRlZCBOZmFjZVxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7aX0je3YyfVwiIHYyMywgdjEyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfSN7djJ9XCIgdjEyLCB2MlxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7aX0je3YyfVwiIHYyLCAgdjIzXG4gICAgICBcbiAgICAgICAgICAgICMgb25lIG9mIHRoZSB0d28gbmV3IHRyaWFuZ2xlcyByZXBsYWNpbmcgb2xkIGVkZ2UgYmV0d2VlbiB2MS0+djJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje3YxMn1cIiB2MSwgIHYyMVxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7djEyfVwiIHYyMSwgdjEyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3t2MTJ9XCIgdjEyLCB2MVxuICAgICAgXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gICAgICAgICAgICBbdmVydDEsIHZlcnQyXSA9IFt2ZXJ0MiwgdmVydDNdXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiUCN7cG9seS5uYW1lfVwiXG5cbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcblxudHJpc3ViID0gKHBvbHksIG49MikgLT5cbiAgICBcbiAgICBmb3IgZm4gaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBpZiBwb2x5LmZhY2VbZm5dLmxlbmd0aCAhPSAzXG4gICAgICAgICAgICByZXR1cm4gcG9seVxuICBcbiAgICB2ZXJ0cyA9IFtdXG4gICAgdm1hcCA9IHt9XG4gICAgcG9zID0gMFxuICAgIGZvciBmbiBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VbZm5dXG4gICAgICAgIFtpMSwgaTIsIGkzXSA9IGYuc2xpY2UgLTNcbiAgICAgICAgdjEgPSBwb2x5LnZlcnRleFtpMV1cbiAgICAgICAgdjIgPSBwb2x5LnZlcnRleFtpMl1cbiAgICAgICAgdjMgPSBwb2x5LnZlcnRleFtpM11cbiAgICAgICAgdjIxID0gc3ViIHYyLCB2MVxuICAgICAgICB2MzEgPSBzdWIgdjMsIHYxXG4gICAgICAgIGZvciBpIGluIFswLi5uXVxuICAgICAgICAgICAgZm9yIGogaW4gWzAuLm4taV1cbiAgICAgICAgICAgICAgICB2ID0gYWRkIGFkZCh2MSwgbXVsdChpL24sIHYyMSkpLCBtdWx0KGovbiwgdjMxKVxuICAgICAgICAgICAgICAgIHZtYXBbXCJ2I3tmbn0tI3tpfS0je2p9XCJdID0gcG9zKytcbiAgICAgICAgICAgICAgICB2ZXJ0cy5wdXNoIHZcbiAgXG4gICAgRVBTSUxPTl9DTE9TRSA9IDEuMGUtOFxuICAgIHVuaXFWcyA9IFtdXG4gICAgbmV3cG9zID0gMFxuICAgIHVuaXFtYXAgPSB7fVxuICAgIGZvciB2LGkgaW4gdmVydHNcbiAgICAgICAgaWYgaSBpbiB1bmlxbWFwIHRoZW4gY29udGludWUgIyBhbHJlYWR5IG1hcHBlZFxuICAgICAgICB1bmlxbWFwW2ldID0gbmV3cG9zXG4gICAgICAgIHVuaXFWcy5wdXNoIHZcbiAgICAgICAgZm9yIGogaW4gW2krMS4uLnZlcnRzLmxlbmd0aF1cbiAgICAgICAgICAgIHcgPSB2ZXJ0c1tqXVxuICAgICAgICAgICAgaWYgbWFnKHN1Yih2LCB3KSkgPCBFUFNJTE9OX0NMT1NFXG4gICAgICAgICAgICAgICAgdW5pcW1hcFtqXSA9IG5ld3Bvc1xuICAgICAgICBuZXdwb3MrK1xuICBcbiAgICBmYWNlcyA9IFtdXG4gICAgZm9yIGZuIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZm9yIGkgaW4gWzAuLi5uXVxuICAgICAgICAgICAgZm9yIGogaW4gWzAuLi5uLWldXG4gICAgICAgICAgICAgICAgZmFjZXMucHVzaCBbdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2krMX0tI3tqfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2l9LSN7aisxfVwiXV1dXG4gICAgICAgIGZvciBpIGluIFsxLi4ubl1cbiAgICAgICAgICAgIGZvciBqIGluIFswLi4ubi1pXVxuICAgICAgICAgICAgICAgIGZhY2VzLnB1c2ggW3VuaXFtYXBbdm1hcFtcInYje2ZufS0je2l9LSN7an1cIl1dLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2orMX1cIl1dLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpLTF9LSN7aisxfVwiXV1dXG4gIFxuICAgIG5ldyBQb2x5aGVkcm9uIFwidSN7bn0je3BvbHkubmFtZX1cIiBmYWNlcywgdW5pcVZzXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxuIyBTbG93IENhbm9uaWNhbGl6YXRpb24gQWxnb3JpdGhtXG4jXG4jIFRoaXMgYWxnb3JpdGhtIGhhcyBzb21lIGNvbnZlcmdlbmNlIHByb2JsZW1zLCB3aGF0IHJlYWxseSBuZWVkcyB0byBiZSBkb25lIGlzIHRvXG4jIHN1bSB0aGUgdGhyZWUgZm9yY2luZyBmYWN0b3JzIHRvZ2V0aGVyIGFzIGEgY29oZXJlbnQgZm9yY2UgYW5kIHRvIHVzZSBhIGhhbGYtZGVjZW50XG4jIGludGVncmF0b3IgdG8gbWFrZSBzdXJlIHRoYXQgaXQgY29udmVyZ2VzIHdlbGwgYXMgb3Bwb3NlZCB0byB0aGUgY3VycmVudCBoYWNrIG9mXG4jIGFkLWhvYyBzdGFiaWxpdHkgbXVsdGlwbGllcnMuICBJZGVhbGx5IG9uZSB3b3VsZCBpbXBsZW1lbnQgYSBjb25qdWdhdGUgZ3JhZGllbnRcbiMgZGVzY2VudCBvciBzaW1pbGFyIHByZXR0eSB0aGluZy5cbiNcbiMgT25seSB0cnkgdG8gdXNlIHRoaXMgb24gY29udmV4IHBvbHloZWRyYSB0aGF0IGhhdmUgYSBjaGFuY2Ugb2YgYmVpbmcgY2Fub25pY2FsaXplZCxcbiMgb3RoZXJ3aXNlIGl0IHdpbGwgcHJvYmFibHkgYmxvdyB1cCB0aGUgZ2VvbWV0cnkuICBBIG11Y2ggdHJpY2tpZXIgLyBzbWFydGVyIHNlZWQtc3ltbWV0cnlcbiMgYmFzZWQgZ2VvbWV0cmljYWwgcmVndWxhcml6ZXIgc2hvdWxkIGJlIHVzZWQgZm9yIGZhbmNpZXIvd2VpcmRlciBwb2x5aGVkcmEuXG5cbmNhbm9uaWNhbGl6ZSA9IChwb2x5LCBpdGVyPTIwMCkgLT5cblxuICAgIGZhY2VzID0gcG9seS5mYWNlXG4gICAgZWRnZXMgPSBwb2x5LmVkZ2VzKClcbiAgICB2ZXJ0cyA9IHBvbHkudmVydGV4XG4gICAgbWF4Q2hhbmdlID0gMS4wXG4gICAgZm9yIGkgaW4gWzAuLml0ZXJdXG4gICAgICAgIG9sZFZzID0gY29weVZlY0FycmF5IHZlcnRzXG4gICAgICAgIHZlcnRzID0gdGFuZ2VudGlmeSB2ZXJ0cywgZWRnZXNcbiAgICAgICAgdmVydHMgPSByZWNlbnRlciB2ZXJ0cywgZWRnZXNcbiAgICAgICAgdmVydHMgPSBwbGFuYXJpemUgdmVydHMsIGZhY2VzXG4gICAgICAgIG1heENoYW5nZSA9IF8ubWF4IF8ubWFwIF8uemlwKHZlcnRzLCBvbGRWcyksIChbeCwgeV0pIC0+IG1hZyBzdWIgeCwgeVxuICAgICAgICBpZiBtYXhDaGFuZ2UgPCAxZS04XG4gICAgICAgICAgICBicmVha1xuICAgIHZlcnRzID0gcmVzY2FsZSB2ZXJ0c1xuICAgIG5ldyBQb2x5aGVkcm9uIHBvbHkubmFtZSwgcG9seS5mYWNlLCB2ZXJ0c1xuICAgIFxuY2Fub25pY2FsWFlaID0gKHBvbHksIGl0ZXJhdGlvbnMpIC0+XG5cbiAgICBpdGVyYXRpb25zID89IDFcbiAgICBkcG9seSA9IGR1YWwgcG9seVxuICBcbiAgICBmb3IgY291bnQgaW4gWzAuLi5pdGVyYXRpb25zXSAjIHJlY2lwcm9jYXRlIGZhY2Ugbm9ybWFsc1xuICAgICAgICBkcG9seS52ZXJ0ZXggPSByZWNpcHJvY2FsTiBwb2x5XG4gICAgICAgIHBvbHkudmVydGV4ICA9IHJlY2lwcm9jYWxOIGRwb2x5XG4gIFxuICAgIG5ldyBQb2x5aGVkcm9uIHBvbHkubmFtZSwgcG9seS5mYWNlLCBwb2x5LnZlcnRleFxuXG5mbGF0dGVuID0gKHBvbHksIGl0ZXJhdGlvbnMpIC0+ICMgcXVpY2sgcGxhbmFyaXphdGlvblxuICAgIFxuICAgIGl0ZXJhdGlvbnMgPz0gMVxuICAgIGRwb2x5ID0gZHVhbCBwb2x5XG4gIFxuICAgIGZvciBjb3VudCBpbiBbMC4uLml0ZXJhdGlvbnNdXG4gICAgICAgIGRwb2x5LnZlcnRleCA9IHJlY2lwcm9jYWxDIHBvbHlcbiAgICAgICAgcG9seS52ZXJ0ZXggID0gcmVjaXByb2NhbEMgZHBvbHlcbiAgXG4gICAgbmV3IFBvbHloZWRyb24gcG9seS5uYW1lLCBwb2x5LmZhY2UsIHBvbHkudmVydGV4XG4gICAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcblxubW9kdWxlLmV4cG9ydHMgPVxuICAgIGR1YWw6ICAgICAgICAgICBkdWFsXG4gICAgYmV2ZWw6ICAgICAgICAgIGJldmVsXG4gICAgdHJpc3ViOiAgICAgICAgIHRyaXN1YlxuICAgIHRydW5jYXRlOiAgICAgICB0cnVuY2F0ZVxuICAgIHBlcnNwZWN0aXZhOiAgICBwZXJzcGVjdGl2YVxuICAgIGtpczogICAgICAgICAgICBraXNcbiAgICBhbWJvOiAgICAgICAgICAgYW1ib1xuICAgIGd5cm86ICAgICAgICAgICBneXJvXG4gICAgY2hhbWZlcjogICAgICAgIGNoYW1mZXJcbiAgICB3aGlybDogICAgICAgICAgd2hpcmxcbiAgICBxdWludG86ICAgICAgICAgcXVpbnRvXG4gICAgaW5zZXQ6ICAgICAgICAgIGluc2V0XG4gICAgZXh0cnVkZTogICAgICAgIGV4dHJ1ZGVcbiAgICBleHBhbmQ6ICAgICAgICAgZXhwYW5kXG4gICAgaG9sbG93OiAgICAgICAgIGhvbGxvd1xuICAgIGZsYXR0ZW46ICAgICAgICBmbGF0dGVuXG4gICAgemlya3VsYXJpemU6ICAgIHppcmt1bGFyaXplXG4gICAgc3BoZXJpY2FsaXplOiAgIHNwaGVyaWNhbGl6ZVxuICAgIGNhbm9uaWNhbGl6ZTogICBjYW5vbmljYWxpemVcbiAgICBjYW5vbmljYWxYWVo6ICAgY2Fub25pY2FsWFlaXG4gICAgIl19
//# sourceURL=../../coffee/poly/topo.coffee