// koffee 1.6.0

/*
000000000   0000000   00000000    0000000     
   000     000   000  000   000  000   000    
   000     000   000  00000000   000   000    
   000     000   000  000        000   000    
   000      0000000   000         0000000
 */
var Flag, Polyhedron, _, abs, add, ambo, calcCentroid, canonicalXYZ, canonicalize, chamfer, clamp, copyVecArray, cross, dual, extrude, flatten, gyro, hollow, inset, intersect, kis, klog, mag, midName, midpoint, min, mult, oneThird, perspectiva, planarize, quinto, rayPlane, rayRay, recenter, reciprocalC, reciprocalN, ref, ref1, rescale, sqrt, sub, tangentify, trisub, truncate, tween, unit, whirl, zirkularize, ϕ,
    indexOf = [].indexOf;

ref = require('kxk'), _ = ref._, clamp = ref.clamp, klog = ref.klog;

ref1 = require('./math'), add = ref1.add, calcCentroid = ref1.calcCentroid, copyVecArray = ref1.copyVecArray, cross = ref1.cross, intersect = ref1.intersect, mag = ref1.mag, midpoint = ref1.midpoint, mult = ref1.mult, oneThird = ref1.oneThird, planarize = ref1.planarize, rayPlane = ref1.rayPlane, rayRay = ref1.rayRay, recenter = ref1.recenter, reciprocalC = ref1.reciprocalC, reciprocalN = ref1.reciprocalN, rescale = ref1.rescale, sub = ref1.sub, tangentify = ref1.tangentify, tween = ref1.tween, unit = ref1.unit;

abs = Math.abs, min = Math.min, sqrt = Math.sqrt;

ϕ = (sqrt(5) - 1) / 2;

Flag = require('./flag');

Polyhedron = require('./polyhedron');

midName = function(v1, v2) {
    return v1 < v2 && (v1 + "_" + v2) || (v2 + "_" + v1);
};

zirkularize = function(poly, n) {
    var f, i, l, len, m, m12, m32, nc, o, pn, r, ref2, ref3, ref4, ref5, results, u12, u32, v1, v12, v2, v3, v32, vertices, verts;
    if (n != null) {
        n;
    } else {
        n = 0;
    }
    vertices = [];
    for (i = l = 0, ref2 = poly.faces.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        f = poly.faces[i];
        if (f.length === n || n === 0) {
            ref3 = f.slice(-2), v1 = ref3[0], v2 = ref3[1];
            for (m = 0, len = f.length; m < len; m++) {
                v3 = f[m];
                v12 = sub(poly.vertices[v2], poly.vertices[v1]);
                v32 = sub(poly.vertices[v2], poly.vertices[v3]);
                if (abs(mag(v12) - mag(v32)) > 0.001) {
                    m12 = midpoint(poly.vertices[v1], poly.vertices[v2]);
                    m32 = midpoint(poly.vertices[v3], poly.vertices[v2]);
                    u12 = unit(m12);
                    u32 = unit(m32);
                    nc = add(u12, u32);
                    pn = cross(nc, cross(poly.vertices[v1], poly.vertices[v3]));
                    if (mag(v12) > mag(v32)) {
                        r = rayPlane(poly.vertices[v3], v32, [0, 0, 0], pn);
                    } else {
                        r = rayPlane(poly.vertices[v1], v12, [0, 0, 0], pn);
                    }
                    vertices[v2] = r;
                }
                ref4 = [v2, v3], v1 = ref4[0], v2 = ref4[1];
            }
        }
    }
    verts = (function() {
        results = [];
        for (var o = 0, ref5 = poly.vertices.length; 0 <= ref5 ? o < ref5 : o > ref5; 0 <= ref5 ? o++ : o--){ results.push(o); }
        return results;
    }).apply(this).map(function(i) {
        var ref5;
        return (ref5 = vertices[i]) != null ? ref5 : poly.vertices[i];
    });
    return new Polyhedron("z" + poly.name, poly.faces, verts);
};

dual = function(poly) {
    var centers, dpoly, f, face, flag, i, k, l, len, len1, len2, m, o, q, ref2, ref3, ref4, ref5, ref6, s, sortF, t, u, v1, v2;
    flag = new Flag();
    face = [];
    for (i = l = 0, ref2 = poly.vertices.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        face[i] = {};
    }
    for (i = m = 0, ref3 = poly.faces.length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        f = poly.faces[i];
        v1 = f.slice(-1)[0];
        for (o = 0, len = f.length; o < len; o++) {
            v2 = f[o];
            face[v1]["v" + v2] = "" + i;
            v1 = v2;
        }
    }
    centers = poly.centers();
    for (i = q = 0, ref4 = poly.faces.length; 0 <= ref4 ? q < ref4 : q > ref4; i = 0 <= ref4 ? ++q : --q) {
        flag.vert("" + i, centers[i]);
    }
    for (i = s = 0, ref5 = poly.faces.length; 0 <= ref5 ? s < ref5 : s > ref5; i = 0 <= ref5 ? ++s : --s) {
        f = poly.faces[i];
        v1 = f.slice(-1)[0];
        for (t = 0, len1 = f.length; t < len1; t++) {
            v2 = f[t];
            flag.edge(v1, face[v2]["v" + v1], "" + i);
            v1 = v2;
        }
    }
    dpoly = flag.topoly();
    sortF = [];
    ref6 = dpoly.faces;
    for (u = 0, len2 = ref6.length; u < len2; u++) {
        f = ref6[u];
        k = intersect(poly.faces[f[0]], poly.faces[f[1]], poly.faces[f[2]]);
        sortF[k] = f;
    }
    dpoly.faces = sortF;
    if (poly.name[0] !== "d") {
        dpoly.name = "d" + poly.name;
    } else {
        dpoly.name = poly.name.slice(1);
    }
    return dpoly;
};

kis = function(poly, apexdist, n) {
    var apex, centers, f, flag, fname, foundAny, i, l, len, m, normals, o, p, ref2, ref3, v, v1, v2;
    if (apexdist == null) {
        apexdist = 0;
    }
    if (n == null) {
        n = 0;
    }
    flag = new Flag();
    for (i = l = 0, ref2 = poly.vertices.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        p = poly.vertices[i];
        flag.vert("v" + i, p);
    }
    normals = poly.normals();
    centers = poly.centers();
    foundAny = false;
    for (i = m = 0, ref3 = poly.faces.length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        f = poly.faces[i];
        v1 = "v" + f[f.length - 1];
        for (o = 0, len = f.length; o < len; o++) {
            v = f[o];
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
    var depth, edge0, edgeMap, face, fi, i, ii, l, len, m, neighbors, newFace, ni, nl, numFaces, numVertices, o, q, ref2, ref3, ref4, ref5, ref6, ref7, s, t, vertexIndex, vi, vp;
    if (factor == null) {
        factor = 0.5;
    }
    factor = clamp(0, 1, factor);
    edgeMap = {};
    numFaces = poly.faces.length;
    numVertices = poly.vertices.length;
    neighbors = poly.neighbors();
    edge0 = poly.edge(0, neighbors[0][0]);
    depth = 0.5 * factor * edge0.length();
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
            edgeMap[vertexIndex][ni] = poly.vertices.length;
            vp = poly.edge(vertexIndex, ni);
            vp.normalize();
            vp.scaleInPlace(depth);
            vp.addInPlace(poly.vert(vertexIndex));
            face.push(poly.vertices.length);
            poly.vertices.push([vp.x, vp.y, vp.z]);
        }
        poly.faces.push(face);
    }
    for (fi = o = 0, ref4 = numFaces; 0 <= ref4 ? o < ref4 : o > ref4; fi = 0 <= ref4 ? ++o : --o) {
        face = poly.faces[fi];
        newFace = [];
        for (vi = q = 0, ref5 = face.length; 0 <= ref5 ? q < ref5 : q > ref5; vi = 0 <= ref5 ? ++q : --q) {
            ni = (vi + 1) % face.length;
            newFace.push(edgeMap[face[vi]][face[ni]]);
            if (factor < 1) {
                newFace.push(edgeMap[face[ni]][face[vi]]);
            }
        }
        poly.faces[fi] = newFace;
    }
    poly.vertices.splice(0, numVertices);
    ref6 = poly.faces;
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
    for (i = l = 0, ref2 = poly.faces.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        f = poly.faces[i];
        ref3 = f.slice(-2), v1 = ref3[0], v2 = ref3[1];
        for (m = 0, len = f.length; m < len; m++) {
            v3 = f[m];
            if (v1 < v2) {
                flag.vert(midName(v1, v2), midpoint(poly.vertices[v1], poly.vertices[v2]));
            }
            flag.edge("orig" + i, midName(v1, v2), midName(v2, v3));
            flag.edge("dual" + v2, midName(v2, v3), midName(v1, v2));
            ref4 = [v2, v3], v1 = ref4[0], v2 = ref4[1];
        }
    }
    return flag.topoly("a" + poly.name);
};

chamfer = function(poly, factor) {
    var centers, cmid, cr, e0, e1, ed, edge, el, flag, head, l, len, len1, len2, lr, m, minEdgeLength, moved, n_h, n_t, nf, nl, nmid, nnl, nnr, normals, npl, npr, nr, o, pl, pmid, pnm, pr, rr, tail, wings;
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
        e0 = poly.vertices[edge[0]];
        e1 = poly.vertices[edge[1]];
        ed = unit(sub(e1, e0));
        nr = unit(sub(poly.vertices[edge[2].nr], e1));
        pr = unit(sub(poly.vertices[edge[2].pr], e0));
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
        e0 = poly.vertices[edge[0]];
        e1 = poly.vertices[edge[1]];
        rr = [add(e0, mult(minEdgeLength, unit(sub(poly.vertices[edge[2].pr], e0)))), add(e1, mult(minEdgeLength, unit(sub(poly.vertices[edge[2].nr], e1))))];
        lr = [add(e0, mult(minEdgeLength, unit(sub(poly.vertices[edge[2].pl], e0)))), add(e1, mult(minEdgeLength, unit(sub(poly.vertices[edge[2].nl], e1))))];
        moved[edge[1] + "▸" + edge[0] + "l"] = rr;
        moved[edge[0] + "▸" + edge[1] + "r"] = rr;
        moved[edge[1] + "▸" + edge[0] + "r"] = lr;
        moved[edge[0] + "▸" + edge[1] + "l"] = lr;
    }
    for (o = 0, len2 = wings.length; o < len2; o++) {
        edge = wings[o];
        e0 = poly.vertices[edge[0]];
        e1 = poly.vertices[edge[1]];
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
    var centers, cv1name, cv2name, f, flag, fname, i, j, l, m, o, ref2, ref3, ref4, ref5, ref6, v, v1, v1_2, v2, v3;
    if (n == null) {
        n = 0;
    }
    flag = new Flag();
    for (i = l = 0, ref2 = poly.vertices.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        flag.vert("v" + i, unit(poly.vertices[i]));
    }
    centers = poly.centers();
    for (i = m = 0, ref3 = poly.faces.length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        f = poly.faces[i];
        ref4 = f.slice(-2), v1 = ref4[0], v2 = ref4[1];
        for (j = o = 0, ref5 = f.length; 0 <= ref5 ? o < ref5 : o > ref5; j = 0 <= ref5 ? ++o : --o) {
            v = f[j];
            v3 = v;
            v1_2 = oneThird(poly.vertices[v1], poly.vertices[v2]);
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
    var centers, f, flag, fname, i, j, l, m, o, q, ref2, ref3, ref4, ref5, ref6, ref7, v, v1, v2, v3;
    flag = new Flag();
    for (i = l = 0, ref2 = poly.vertices.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        flag.vert("v" + i, unit(poly.vertices[i]));
    }
    centers = poly.centers();
    for (i = m = 0, ref3 = poly.faces.length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        f = poly.faces[i];
        flag.vert("center" + i, unit(centers[i]));
    }
    for (i = o = 0, ref4 = poly.faces.length; 0 <= ref4 ? o < ref4 : o > ref4; i = 0 <= ref4 ? ++o : --o) {
        f = poly.faces[i];
        ref5 = f.slice(-2), v1 = ref5[0], v2 = ref5[1];
        for (j = q = 0, ref6 = f.length; 0 <= ref6 ? q < ref6 : q > ref6; j = 0 <= ref6 ? ++q : --q) {
            v = f[j];
            v3 = v;
            flag.vert(v1 + "~" + v2, oneThird(poly.vertices[v1], poly.vertices[v2]));
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
    for (i = l = 0, ref2 = poly.faces.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        f = poly.faces[i];
        centroid = calcCentroid(f.map(function(idx) {
            return poly.vertices[idx];
        }));
        ref3 = f.slice(-2), v1 = ref3[0], v2 = ref3[1];
        for (m = 0, len = f.length; m < len; m++) {
            v3 = f[m];
            midpt = midpoint(poly.vertices[v1], poly.vertices[v2]);
            innerpt = midpoint(midpt, centroid);
            flag.vert(midName(v1, v2), midpt);
            flag.vert(("inner_" + i + "_") + midName(v1, v2), innerpt);
            flag.vert("" + v2, poly.vertices[v2]);
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
    var centers, f, flag, fname, foundAny, i, l, len, len1, m, normals, o, p, q, ref2, ref3, ref4, s, v, v1, v2;
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
    for (i = l = 0, ref2 = poly.vertices.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        p = poly.vertices[i];
        flag.vert("v" + i, p);
    }
    normals = poly.normals();
    centers = poly.centers();
    for (i = m = 0, ref3 = poly.faces.length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        f = poly.faces[i];
        if (f.length === n || n === 0) {
            for (o = 0, len = f.length; o < len; o++) {
                v = f[o];
                flag.vert("f" + i + "v" + v, add(tween(poly.vertices[v], centers[i], inset), mult(popout, normals[i])));
            }
        }
    }
    foundAny = false;
    for (i = q = 0, ref4 = poly.faces.length; 0 <= ref4 ? q < ref4 : q > ref4; i = 0 <= ref4 ? ++q : --q) {
        f = poly.faces[i];
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
    var centers, dualnormals, f, flag, fname, i, l, len, len1, m, normals, o, p, q, ref2, ref3, ref4, s, v, v1, v2;
    if (insetf != null) {
        insetf;
    } else {
        insetf = 0.5;
    }
    insetf = clamp(0.1, 0.9, insetf);
    if (thickness != null) {
        thickness;
    } else {
        thickness = insetf * 2 / 3;
    }
    thickness = min(insetf * 2 / 3, thickness);
    dualnormals = dual(poly).normals();
    normals = poly.normals();
    centers = poly.centers();
    flag = new Flag();
    for (i = l = 0, ref2 = poly.vertices.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        p = poly.vertices[i];
        flag.vert("v" + i, p);
        flag.vert("downv" + i, add(p, mult(-1 * thickness, dualnormals[i])));
    }
    for (i = m = 0, ref3 = poly.faces.length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        f = poly.faces[i];
        for (o = 0, len = f.length; o < len; o++) {
            v = f[o];
            flag.vert("fin" + i + "v" + v, tween(poly.vertices[v], centers[i], insetf));
            flag.vert("findown" + i + "v" + v, add(tween(poly.vertices[v], centers[i], insetf), mult(-1 * thickness, normals[i])));
        }
    }
    for (i = q = 0, ref4 = poly.faces.length; 0 <= ref4 ? q < ref4 : q > ref4; i = 0 <= ref4 ? ++q : --q) {
        f = poly.faces[i];
        v1 = "v" + f[f.length - 1];
        for (s = 0, len1 = f.length; s < len1; s++) {
            v = f[s];
            v2 = "v" + v;
            fname = i + v1;
            flag.edge(fname, v1, v2);
            flag.edge(fname, v2, "fin" + i + v2);
            flag.edge(fname, "fin" + i + v2, "fin" + i + v1);
            flag.edge(fname, "fin" + i + v1, v1);
            fname = "sides" + i + v1;
            flag.edge(fname, "fin" + i + v1, "fin" + i + v2);
            flag.edge(fname, "fin" + i + v2, "findown" + i + v2);
            flag.edge(fname, "findown" + i + v2, "findown" + i + v1);
            flag.edge(fname, "findown" + i + v1, "fin" + i + v1);
            fname = "bottom" + i + v1;
            flag.edge(fname, "down" + v2, "down" + v1);
            flag.edge(fname, "down" + v1, "findown" + i + v1);
            flag.edge(fname, "findown" + i + v1, "findown" + i + v2);
            flag.edge(fname, "findown" + i + v2, "down" + v2);
            v1 = v2;
        }
    }
    return flag.topoly("H" + poly.name);
};

perspectiva = function(poly) {
    var centers, f, flag, i, l, len, m, o, ref2, ref3, ref4, ref5, v, v1, v12, v2, v21, v23, v3, vert1, vert2, vert3;
    centers = poly.centers();
    flag = new Flag();
    for (i = l = 0, ref2 = poly.vertices.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        flag.vert("v" + i, poly.vertices[i]);
    }
    for (i = m = 0, ref3 = poly.faces.length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        f = poly.faces[i];
        v1 = "v" + f[f.length - 2];
        v2 = "v" + f[f.length - 1];
        vert1 = poly.vertices[f[f.length - 2]];
        vert2 = poly.vertices[f[f.length - 1]];
        for (o = 0, len = f.length; o < len; o++) {
            v = f[o];
            v3 = "v" + v;
            vert3 = poly.vertices[v];
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
    var EPSILON_CLOSE, f, faces, fn, i, i1, i2, i3, j, j1, k1, l, l1, len, m, newpos, o, pos, q, ref10, ref11, ref12, ref13, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, s, t, u, uniqVs, uniqmap, v, v1, v2, v21, v3, v31, verts, vmap, w, z;
    if (n == null) {
        n = 2;
    }
    for (fn = l = 0, ref2 = poly.faces.length; 0 <= ref2 ? l < ref2 : l > ref2; fn = 0 <= ref2 ? ++l : --l) {
        if (poly.faces[fn].length !== 3) {
            return poly;
        }
    }
    verts = [];
    vmap = {};
    pos = 0;
    for (fn = m = 0, ref3 = poly.faces.length; 0 <= ref3 ? m < ref3 : m > ref3; fn = 0 <= ref3 ? ++m : --m) {
        f = poly.faces[fn];
        ref4 = f.slice(-3), i1 = ref4[0], i2 = ref4[1], i3 = ref4[2];
        v1 = poly.vertices[i1];
        v2 = poly.vertices[i2];
        v3 = poly.vertices[i3];
        v21 = sub(v2, v1);
        v31 = sub(v3, v1);
        for (i = o = 0, ref5 = n; 0 <= ref5 ? o <= ref5 : o >= ref5; i = 0 <= ref5 ? ++o : --o) {
            for (j = q = 0, ref6 = n - i; 0 <= ref6 ? q <= ref6 : q >= ref6; j = 0 <= ref6 ? ++q : --q) {
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
    for (fn = u = 0, ref9 = poly.faces.length; 0 <= ref9 ? u < ref9 : u > ref9; fn = 0 <= ref9 ? ++u : --u) {
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
    var edges, faces, i, l, maxChange, newpoly, oldVs, ref2, verts;
    if (iter == null) {
        iter = 200;
    }
    faces = poly.faces;
    edges = poly.edges();
    verts = poly.vertices;
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
    newpoly = new Polyhedron(poly.name, poly.faces, verts);
    return newpoly;
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
        dpoly.vertices = reciprocalN(poly);
        poly.vertices = reciprocalN(dpoly);
    }
    return new Polyhedron(poly.name, poly.faces, poly.vertices);
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
        dpoly.vertices = reciprocalC(poly);
        poly.vertices = reciprocalC(dpoly);
    }
    return new Polyhedron(poly.name, poly.faces, poly.vertices);
};

module.exports = {
    dual: dual,
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
    hollow: hollow,
    flatten: flatten,
    zirkularize: zirkularize,
    canonicalize: canonicalize,
    canonicalXYZ: canonicalXYZ
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9wby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEseVpBQUE7SUFBQTs7QUFVQSxNQUFxQixPQUFBLENBQVEsS0FBUixDQUFyQixFQUFFLFNBQUYsRUFBSyxpQkFBTCxFQUFZOztBQUNaLE9BQStMLE9BQUEsQ0FBUSxRQUFSLENBQS9MLEVBQUUsY0FBRixFQUFPLGdDQUFQLEVBQXFCLGdDQUFyQixFQUFtQyxrQkFBbkMsRUFBMEMsMEJBQTFDLEVBQXFELGNBQXJELEVBQTBELHdCQUExRCxFQUFvRSxnQkFBcEUsRUFBMEUsd0JBQTFFLEVBQW9GLDBCQUFwRixFQUErRix3QkFBL0YsRUFBeUcsb0JBQXpHLEVBQWlILHdCQUFqSCxFQUEySCw4QkFBM0gsRUFBd0ksOEJBQXhJLEVBQXFKLHNCQUFySixFQUE4SixjQUE5SixFQUFtSyw0QkFBbkssRUFBK0ssa0JBQS9LLEVBQXNMOztBQUNwTCxjQUFGLEVBQU8sY0FBUCxFQUFZOztBQUVaLENBQUEsR0FBSSxDQUFDLElBQUEsQ0FBSyxDQUFMLENBQUEsR0FBUSxDQUFULENBQUEsR0FBWTs7QUFFaEIsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztBQUNQLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7QUFFYixPQUFBLEdBQVUsU0FBQyxFQUFELEVBQUssRUFBTDtXQUFZLEVBQUEsR0FBRyxFQUFILElBQVUsQ0FBRyxFQUFELEdBQUksR0FBSixHQUFPLEVBQVQsQ0FBVixJQUEyQixDQUFHLEVBQUQsR0FBSSxHQUFKLEdBQU8sRUFBVDtBQUF2Qzs7QUFRVixXQUFBLEdBQWMsU0FBQyxJQUFELEVBQU8sQ0FBUDtBQUVWLFFBQUE7O1FBQUE7O1FBQUEsSUFBSzs7SUFDTCxRQUFBLEdBQVc7QUFFWCxTQUFTLCtGQUFUO1FBQ0ksQ0FBQSxHQUFJLElBQUksQ0FBQyxLQUFNLENBQUEsQ0FBQTtRQUNmLElBQUcsQ0FBQyxDQUFD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LE9BQUEsRUFBZ0IsT0FYaEI7SUFZQSxNQUFBLEVBQWdCLE1BWmhCO0lBYUEsT0FBQSxFQUFnQixPQWJoQjtJQWNBLFdBQUEsRUFBZ0IsV0FkaEI7SUFlQSxZQUFBLEVBQWdCLFlBZmhCO0lBZ0JBLFlBQUEsRUFBZ0IsWUFoQmhCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgICAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgICAgXG4gICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICAgMDAwMDAwMCAgICAgXG4jIyNcblxuIyBQb2x5aMOpZHJvbmlzbWUsIENvcHlyaWdodCAyMDE5LCBBbnNlbG0gTGV2c2theWEsIE1JVCBMaWNlbnNlXG5cbnsgXywgY2xhbXAsIGtsb2cgfSA9IHJlcXVpcmUgJ2t4aydcbnsgYWRkLCBjYWxjQ2VudHJvaWQsIGNvcHlWZWNBcnJheSwgY3Jvc3MsIGludGVyc2VjdCwgbWFnLCBtaWRwb2ludCwgbXVsdCwgb25lVGhpcmQsIHBsYW5hcml6ZSwgcmF5UGxhbmUsIHJheVJheSwgcmVjZW50ZXIsIHJlY2lwcm9jYWxDLCByZWNpcHJvY2FsTiwgcmVzY2FsZSwgc3ViLCB0YW5nZW50aWZ5LCB0d2VlbiwgdW5pdCB9ID0gcmVxdWlyZSAnLi9tYXRoJ1xueyBhYnMsIG1pbiwgc3FydCB9ID0gTWF0aFxuXG7PlSA9IChzcXJ0KDUpLTEpLzJcblxuRmxhZyA9IHJlcXVpcmUgJy4vZmxhZydcblBvbHloZWRyb24gPSByZXF1aXJlICcuL3BvbHloZWRyb24nXG5cbm1pZE5hbWUgPSAodjEsIHYyKSAtPiB2MTx2MiBhbmQgXCIje3YxfV8je3YyfVwiIG9yIFwiI3t2Mn1fI3t2MX1cIlxuXG4jIDAwMDAwMDAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiMgICAwMDAgICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxuemlya3VsYXJpemUgPSAocG9seSwgbikgLT5cbiAgICBcbiAgICBuID89IDBcbiAgICB2ZXJ0aWNlcyA9IFtdXG4gICAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgaWYgZi5sZW5ndGggPT0gbiBvciBuID09IDBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSAtMlxuICAgICAgICAgICAgZm9yIHYzIGluIGZcbiAgICAgICAgICAgICAgICB2MTIgPSBzdWIgcG9seS52ZXJ0aWNlc1t2Ml0sIHBvbHkudmVydGljZXNbdjFdXG4gICAgICAgICAgICAgICAgdjMyID0gc3ViIHBvbHkudmVydGljZXNbdjJdLCBwb2x5LnZlcnRpY2VzW3YzXVxuICAgICAgICAgICAgICAgIGlmIGFicyhtYWcodjEyKSAtIG1hZyh2MzIpKSA+IDAuMDAxXG4gICAgICAgICAgICAgICAgICAgIG0xMiA9IG1pZHBvaW50IHBvbHkudmVydGljZXNbdjFdLCBwb2x5LnZlcnRpY2VzW3YyXVxuICAgICAgICAgICAgICAgICAgICBtMzIgPSBtaWRwb2ludCBwb2x5LnZlcnRpY2VzW3YzXSwgcG9seS52ZXJ0aWNlc1t2Ml1cbiAgICAgICAgICAgICAgICAgICAgdTEyID0gdW5pdCBtMTJcbiAgICAgICAgICAgICAgICAgICAgdTMyID0gdW5pdCBtMzJcbiAgICAgICAgICAgICAgICAgICAgbmMgPSBhZGQgdTEyLCB1MzJcbiAgICAgICAgICAgICAgICAgICAgcG4gPSBjcm9zcyBuYywgY3Jvc3MgcG9seS52ZXJ0aWNlc1t2MV0sIHBvbHkudmVydGljZXNbdjNdXG4gICAgICAgICAgICAgICAgICAgIGlmIG1hZyh2MTIpID4gbWFnKHYzMilcbiAgICAgICAgICAgICAgICAgICAgICAgIHIgPSByYXlQbGFuZSBwb2x5LnZlcnRpY2VzW3YzXSwgdjMyLCBbMCAwIDBdLCBwblxuICAgICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICByID0gcmF5UGxhbmUgcG9seS52ZXJ0aWNlc1t2MV0sIHYxMiwgWzAgMCAwXSwgcG5cbiAgICAgICAgICAgICAgICAgICAgdmVydGljZXNbdjJdID0gclxuICAgICAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M11cbiAgXG4gICAgdmVydHMgPSBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXS5tYXAgKGkpIC0+IHZlcnRpY2VzW2ldID8gcG9seS52ZXJ0aWNlc1tpXVxuICAgIFxuICAgIG5ldyBQb2x5aGVkcm9uIFwieiN7cG9seS5uYW1lfVwiIHBvbHkuZmFjZXMsIHZlcnRzXG5cbiMgMDAwMDAwMCAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuXG5kdWFsID0gKHBvbHkpIC0+XG5cbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICBmYWNlID0gW10gXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF0gXG4gICAgICAgIGZhY2VbaV0gPSB7fVxuXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgdjEgPSBmWy0xXVxuICAgICAgICBmb3IgdjIgaW4gZlxuICAgICAgICAgICAgZmFjZVt2MV1bXCJ2I3t2Mn1cIl0gPSBcIiN7aX1cIlxuICAgICAgICAgICAgdjEgPSB2MlxuICBcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmbGFnLnZlcnQgXCIje2l9XCIgY2VudGVyc1tpXVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IGZbLTFdXG4gICAgICAgIGZvciB2MiBpbiBmXG4gICAgICAgICAgICBmbGFnLmVkZ2UgdjEsIGZhY2VbdjJdW1widiN7djF9XCJdLCBcIiN7aX1cIlxuICAgICAgICAgICAgdjEgPSB2MlxuICBcbiAgICBkcG9seSA9IGZsYWcudG9wb2x5KClcbiAgXG4gICAgc29ydEYgPSBbXVxuICAgIGZvciBmIGluIGRwb2x5LmZhY2VzXG4gICAgICAgIGsgPSBpbnRlcnNlY3QgcG9seS5mYWNlc1tmWzBdXSwgcG9seS5mYWNlc1tmWzFdXSwgcG9seS5mYWNlc1tmWzJdXVxuICAgICAgICBzb3J0RltrXSA9IGZcbiAgICBkcG9seS5mYWNlcyA9IHNvcnRGXG4gIFxuICAgIGlmIHBvbHkubmFtZVswXSAhPSBcImRcIlxuICAgICAgICBkcG9seS5uYW1lID0gXCJkI3twb2x5Lm5hbWV9XCJcbiAgICBlbHNlIFxuICAgICAgICBkcG9seS5uYW1lID0gcG9seS5uYW1lLnNsaWNlIDFcbiAgXG4gICAgZHBvbHlcblxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICBcblxuIyBLaXMgKGFiYnJldmlhdGVkIGZyb20gdHJpYWtpcykgdHJhbnNmb3JtcyBhbiBOLXNpZGVkIGZhY2UgaW50byBhbiBOLXB5cmFtaWQgcm9vdGVkIGF0IHRoZVxuIyBzYW1lIGJhc2UgdmVydGljZXMuIG9ubHkga2lzIG4tc2lkZWQgZmFjZXMsIGJ1dCBuPT0wIG1lYW5zIGtpcyBhbGwuXG5cbmtpcyA9IChwb2x5LCBhcGV4ZGlzdD0wLCBuPTApIC0+XG5cbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgIHAgPSBwb2x5LnZlcnRpY2VzW2ldXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgcFxuICBcbiAgICBub3JtYWxzID0gcG9seS5ub3JtYWxzKClcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgICBmb3VuZEFueSA9IGZhbHNlXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgdjIgPSBcInYje3Z9XCJcbiAgICAgICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICAgICAgZm91bmRBbnkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGFwZXggPSBcImFwZXgje2l9XCJcbiAgICAgICAgICAgICAgICBmbmFtZSA9IFwiI3tpfSN7djF9XCJcblxuICAgICAgICAgICAgICAgIGZsYWcudmVydCBhcGV4LCBhZGQgY2VudGVyc1tpXSwgbXVsdCBhcGV4ZGlzdCwgbm9ybWFsc1tpXVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgICB2MSwgICB2MlxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgICB2MiwgYXBleFxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgYXBleCwgICB2MVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZSBcIiN7aX1cIiwgdjEsIHYyXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHYxID0gdjJcbiAgXG4gICAgaWYgbm90IGZvdW5kQW55XG4gICAgICAgIGtsb2cgXCJObyAje259LWZvbGQgY29tcG9uZW50cyB3ZXJlIGZvdW5kLlwiXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiayN7bn0je3BvbHkubmFtZX1cIlxuXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgXG5cbnRydW5jYXRlID0gKHBvbHksIGZhY3Rvcj0wLjUpIC0+XG5cbiAgICBmYWN0b3IgPSBjbGFtcCAwIDEgZmFjdG9yXG4gICAgZWRnZU1hcCA9IHt9XG4gICAgXG4gICAgbnVtRmFjZXMgICAgPSBwb2x5LmZhY2VzLmxlbmd0aFxuICAgIG51bVZlcnRpY2VzID0gcG9seS52ZXJ0aWNlcy5sZW5ndGhcbiAgICBuZWlnaGJvcnMgICA9IHBvbHkubmVpZ2hib3JzKClcbiAgICBcbiAgICBlZGdlMCA9IHBvbHkuZWRnZSAwIG5laWdoYm9yc1swXVswXVxuICAgIGRlcHRoID0gMC41ICogZmFjdG9yICogZWRnZTAubGVuZ3RoKCkgXG4gICAgXG4gICAgZm9yIHZlcnRleEluZGV4IGluIFswLi4ubnVtVmVydGljZXNdXG4gICAgICAgIFxuICAgICAgICBlZGdlTWFwW3ZlcnRleEluZGV4XSA/PSB7fVxuICAgICAgICBmYWNlID0gW11cbiAgICAgICAgXG4gICAgICAgIG5sID0gbmVpZ2hib3JzW3ZlcnRleEluZGV4XS5sZW5ndGhcbiAgICAgICAgZm9yIGlpIGluIFswLi4ubmxdXG4gICAgICAgICAgICBuaSA9IG5laWdoYm9yc1t2ZXJ0ZXhJbmRleF1baWldXG4gICAgICAgICAgICBlZGdlTWFwW3ZlcnRleEluZGV4XVtuaV0gPSBwb2x5LnZlcnRpY2VzLmxlbmd0aFxuICAgICAgICAgICAgdnAgPSBwb2x5LmVkZ2UgdmVydGV4SW5kZXgsIG5pXG4gICAgICAgICAgICB2cC5ub3JtYWxpemUoKVxuICAgICAgICAgICAgdnAuc2NhbGVJblBsYWNlIGRlcHRoXG4gICAgICAgICAgICB2cC5hZGRJblBsYWNlIHBvbHkudmVydCB2ZXJ0ZXhJbmRleFxuICAgICAgICAgICAgZmFjZS5wdXNoIHBvbHkudmVydGljZXMubGVuZ3RoXG4gICAgICAgICAgICBwb2x5LnZlcnRpY2VzLnB1c2ggW3ZwLngsIHZwLnksIHZwLnpdXG4gICAgICAgICAgICBcbiAgICAgICAgcG9seS5mYWNlcy5wdXNoIGZhY2VcbiAgICBcbiAgICBmb3IgZmkgaW4gWzAuLi5udW1GYWNlc11cbiAgICAgICAgZmFjZSA9IHBvbHkuZmFjZXNbZmldXG4gICAgICAgIG5ld0ZhY2UgPSBbXVxuICAgICAgICBmb3IgdmkgaW4gWzAuLi5mYWNlLmxlbmd0aF1cbiAgICAgICAgICAgIG5pID0gKHZpKzEpICUgZmFjZS5sZW5ndGhcbiAgICAgICAgICAgIG5ld0ZhY2UucHVzaCBlZGdlTWFwW2ZhY2VbdmldXVtmYWNlW25pXV1cbiAgICAgICAgICAgIGlmIGZhY3RvciA8IDFcbiAgICAgICAgICAgICAgICBuZXdGYWNlLnB1c2ggZWRnZU1hcFtmYWNlW25pXV1bZmFjZVt2aV1dXG4gICAgICAgIHBvbHkuZmFjZXNbZmldID0gbmV3RmFjZVxuICAgICAgXG4gICAgcG9seS52ZXJ0aWNlcy5zcGxpY2UgMCwgbnVtVmVydGljZXNcbiAgICBmb3IgZmFjZSBpbiBwb2x5LmZhY2VzXG4gICAgICAgIGZvciBpIGluIFswLi4uZmFjZS5sZW5ndGhdXG4gICAgICAgICAgICBmYWNlW2ldIC09IG51bVZlcnRpY2VzXG4gICAgICAgIFxuICAgIHBvbHlcbiAgICBcbiMgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICBcblxuIyBUb3BvbG9naWNhbCBcInR3ZWVuXCIgYmV0d2VlbiBhIHBvbHloZWRyb24gYW5kIGl0cyBkdWFsIHBvbHloZWRyb24uXG5cbmFtYm8gPSAocG9seSkgLT5cbiAgICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UoLTIpXG4gICAgICAgIGZvciB2MyBpbiBmXG4gICAgICAgICAgICBpZiB2MSA8IHYyXG4gICAgICAgICAgICAgICAgZmxhZy52ZXJ0IG1pZE5hbWUodjEsdjIpLCBtaWRwb2ludCBwb2x5LnZlcnRpY2VzW3YxXSwgcG9seS52ZXJ0aWNlc1t2Ml1cblxuICAgICAgICAgICAgZmxhZy5lZGdlIFwib3JpZyN7aX1cIiAgbWlkTmFtZSh2MSx2MiksIG1pZE5hbWUodjIsdjMpXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJkdWFsI3t2Mn1cIiBtaWROYW1lKHYyLHYzKSwgbWlkTmFtZSh2MSx2MilcblxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICBcbiAgICBmbGFnLnRvcG9seSBcImEje3BvbHkubmFtZX1cIlxuXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbmNoYW1mZXIgPSAocG9seSwgZmFjdG9yPTAuNSkgLT5cbiAgICBcbiAgICBmYWN0b3IgID0gY2xhbXAgMC4wMDEgMC45OTUgZmFjdG9yXG4gICAgZmxhZyAgICA9IG5ldyBGbGFnKClcbiAgICBub3JtYWxzID0gcG9seS5ub3JtYWxzKClcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgICB3aW5ncyAgID0gcG9seS53aW5ncygpXG4gICAgICAgIFxuICAgIG1pbkVkZ2VMZW5ndGggPSBJbmZpbml0eVxuICAgIFxuICAgIGZvciBlZGdlIGluIHdpbmdzXG4gICAgICAgIGUwID0gcG9seS52ZXJ0aWNlc1tlZGdlWzBdXVxuICAgICAgICBlMSA9IHBvbHkudmVydGljZXNbZWRnZVsxXV1cbiAgICAgICAgZWQgPSB1bml0IHN1YiBlMSwgZTBcbiAgICAgICAgXG4gICAgICAgIG5yID0gdW5pdCBzdWIgcG9seS52ZXJ0aWNlc1tlZGdlWzJdLm5yXSwgZTFcbiAgICAgICAgcHIgPSB1bml0IHN1YiBwb2x5LnZlcnRpY2VzW2VkZ2VbMl0ucHJdLCBlMFxuICAgICAgICBjciA9IHJheVJheSBbZTEsIG11bHQgMC41LCBhZGQgYWRkKGUxLCBuciksIHN1YihlMSwgZWQpXSxcbiAgICAgICAgICAgICAgICAgICAgW2UwLCBtdWx0IDAuNSwgYWRkIGFkZChlMCwgcHIpLCBhZGQoZTAsIGVkKV1cblxuICAgICAgICBlbCA9IG1hZyBzdWIgZTEsIHJheVJheSBbZTEsIGFkZChlMSwgbnIpXSwgW2NyLCBhZGQoY3IsIGVkKV1cbiAgICAgICAgbWluRWRnZUxlbmd0aCA9IG1pbiBtaW5FZGdlTGVuZ3RoLCBlbFxuXG4gICAgICAgIGVsID0gbWFnIHN1YiBlMCwgcmF5UmF5IFtlMCwgYWRkKGUwLCBwcildLCBbY3IsIHN1YihjciwgZWQpXVxuICAgICAgICBtaW5FZGdlTGVuZ3RoID0gbWluIG1pbkVkZ2VMZW5ndGgsIGVsXG4gICAgICAgIFxuICAgIG1pbkVkZ2VMZW5ndGggKj0gZmFjdG9yXG4gICAgICAgIFxuICAgIG1vdmVkID0ge31cbiAgICBmb3IgZWRnZSBpbiB3aW5nc1xuICAgICAgICBlMCAgPSBwb2x5LnZlcnRpY2VzW2VkZ2VbMF1dXG4gICAgICAgIGUxICA9IHBvbHkudmVydGljZXNbZWRnZVsxXV1cbiAgICAgICAgcnIgPSBbXG4gICAgICAgICAgICBhZGQoZTAsIG11bHQgbWluRWRnZUxlbmd0aCwgdW5pdCBzdWIgcG9seS52ZXJ0aWNlc1tlZGdlWzJdLnByXSwgZTApLFxuICAgICAgICAgICAgYWRkKGUxLCBtdWx0IG1pbkVkZ2VMZW5ndGgsIHVuaXQgc3ViIHBvbHkudmVydGljZXNbZWRnZVsyXS5ucl0sIGUxKV1cbiAgICAgICAgbHIgPSBbXG4gICAgICAgICAgICBhZGQoZTAsIG11bHQgbWluRWRnZUxlbmd0aCwgdW5pdCBzdWIgcG9seS52ZXJ0aWNlc1tlZGdlWzJdLnBsXSwgZTApLFxuICAgICAgICAgICAgYWRkKGUxLCBtdWx0IG1pbkVkZ2VMZW5ndGgsIHVuaXQgc3ViIHBvbHkudmVydGljZXNbZWRnZVsyXS5ubF0sIGUxKV1cbiAgICAgICAgICAgIFxuICAgICAgICBtb3ZlZFtcIiN7ZWRnZVsxXX3ilrgje2VkZ2VbMF19bFwiXSA9IHJyXG4gICAgICAgIG1vdmVkW1wiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1yXCJdID0gcnJcbiAgICAgICAgbW92ZWRbXCIje2VkZ2VbMV194pa4I3tlZGdlWzBdfXJcIl0gPSBsclxuICAgICAgICBtb3ZlZFtcIiN7ZWRnZVswXX3ilrgje2VkZ2VbMV19bFwiXSA9IGxyXG4gICAgICAgICAgICBcbiAgICBmb3IgZWRnZSBpbiB3aW5nc1xuICAgICAgICBlMCAgID0gcG9seS52ZXJ0aWNlc1tlZGdlWzBdXVxuICAgICAgICBlMSAgID0gcG9seS52ZXJ0aWNlc1tlZGdlWzFdXVxuICAgICAgICBcbiAgICAgICAgbmYgID0gXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfVwiIFxuICAgICAgICBuX2ggPSBcIiN7ZWRnZVsxXX1cIlxuICAgICAgICBuX3QgPSBcIiN7ZWRnZVswXX1cIlxuICAgICAgICBcbiAgICAgICAgbm5yID0gXCIje25faH3ilrgje2VkZ2VbMl0uZnJ9XCJcbiAgICAgICAgbm5sID0gXCIje25faH3ilrgje2VkZ2VbMl0uZmx9XCJcbiAgICAgICAgbnByID0gXCIje25fdH3ilrgje2VkZ2VbMl0uZnJ9XCJcbiAgICAgICAgbnBsID0gXCIje25fdH3ilrgje2VkZ2VbMl0uZmx9XCIgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBuciA9IHJheVJheSBtb3ZlZFtcIiN7ZWRnZVswXX3ilrgje2VkZ2VbMV19clwiXSwgbW92ZWRbXCIje2VkZ2VbMV194pa4I3tlZGdlWzJdLm5yfXJcIl1cbiAgICAgICAgbmwgPSByYXlSYXkgbW92ZWRbXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfWxcIl0sIG1vdmVkW1wiI3tlZGdlWzFdfeKWuCN7ZWRnZVsyXS5ubH1sXCJdXG4gICAgICAgIHByID0gcmF5UmF5IG1vdmVkW1wiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1yXCJdLCBtb3ZlZFtcIiN7ZWRnZVsyXS5wcn3ilrgje2VkZ2VbMF19clwiXVxuICAgICAgICBwbCA9IHJheVJheSBtb3ZlZFtcIiN7ZWRnZVswXX3ilrgje2VkZ2VbMV19bFwiXSwgbW92ZWRbXCIje2VkZ2VbMl0ucGx94pa4I3tlZGdlWzBdfWxcIl1cbiAgICAgICAgXG4gICAgICAgIHBtaWQgPSBtaWRwb2ludCBwbCwgcHJcbiAgICAgICAgbm1pZCA9IG1pZHBvaW50IG5sLCBuclxuICAgICAgICBjbWlkID0gbWlkcG9pbnQgcG1pZCwgbm1pZFxuICAgICAgICBwbm0gID0gY3Jvc3Mgc3ViKHBtaWQsbm1pZCksIHN1YihwbCxwcilcblxuICAgICAgICBoZWFkID0gcmF5UGxhbmUgWzAgMCAwXSwgZTEsIGNtaWQsIHBubVxuICAgICAgICB0YWlsID0gcmF5UGxhbmUgWzAgMCAwXSwgZTAsIGNtaWQsIHBubVxuICAgICAgICBcbiAgICAgICAgZmxhZy52ZXJ0IG5faCwgaGVhZFxuICAgICAgICBmbGFnLnZlcnQgbl90LCB0YWlsXG4gICAgICAgIGZsYWcudmVydCBubnIsIG5yXG4gICAgICAgIGZsYWcudmVydCBubmwsIG5sXG4gICAgICAgIGZsYWcudmVydCBucGwsIHBsXG4gICAgICAgIGZsYWcudmVydCBucHIsIHByXG5cbiAgICAgICAgZmxhZy5lZGdlIG5mLCBuX2gsIG5uclxuICAgICAgICBmbGFnLmVkZ2UgbmYsIG5uciwgbnByXG4gICAgICAgIGZsYWcuZWRnZSBuZiwgbnByLCBuX3RcbiAgICAgICAgZmxhZy5lZGdlIG5mLCBuX3QsIG5wbFxuICAgICAgICBmbGFnLmVkZ2UgbmYsIG5wbCwgbm5sXG4gICAgICAgIGZsYWcuZWRnZSBuZiwgbm5sLCBuX2hcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZmxhZy5lZGdlIFwiI3tlZGdlWzJdLmZyfVwiIG5wciwgbm5yXG4gICAgICAgIGZsYWcuZWRnZSBcIiN7ZWRnZVsyXS5mbH1cIiBubmwsIG5wbFxuICAgICAgICBcbiAgICBmbGFnLnRvcG9seSBcImMje3BvbHkubmFtZX1cIlxuXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG5cbndoaXJsID0gKHBvbHksIG49MCkgLT5cblxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgdW5pdCBwb2x5LnZlcnRpY2VzW2ldXG5cbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlIC0yXG4gICAgICAgIGZvciBqIGluIFswLi4uZi5sZW5ndGhdXG4gICAgICAgICAgICB2ID0gZltqXVxuICAgICAgICAgICAgdjMgPSB2XG4gICAgICAgICAgICB2MV8yID0gb25lVGhpcmQgcG9seS52ZXJ0aWNlc1t2MV0sIHBvbHkudmVydGljZXNbdjJdXG4gICAgICAgICAgICBmbGFnLnZlcnQodjErXCJ+XCIrdjIsIHYxXzIpXG4gICAgICAgICAgICBjdjFuYW1lID0gXCJjZW50ZXIje2l9fiN7djF9XCJcbiAgICAgICAgICAgIGN2Mm5hbWUgPSBcImNlbnRlciN7aX1+I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy52ZXJ0IGN2MW5hbWUsIHVuaXQgb25lVGhpcmQgY2VudGVyc1tpXSwgdjFfMlxuICAgICAgICAgICAgZm5hbWUgPSBpK1wiZlwiK3YxXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIGN2MW5hbWUsICAgdjErXCJ+XCIrdjJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjErXCJ+XCIrdjIsIHYyK1wiflwiK3YxIFxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MitcIn5cIit2MSwgXCJ2I3t2Mn1cIiAgXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIFwidiN7djJ9XCIsICB2MitcIn5cIit2MyBcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjIrXCJ+XCIrdjMsIGN2Mm5hbWVcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgY3YybmFtZSwgICBjdjFuYW1lXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJjI3tpfVwiLCBjdjFuYW1lLCBjdjJuYW1lXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M11cbiAgXG4gICAgY2Fub25pY2FsaXplIGZsYWcudG9wb2x5IFwidyN7cG9seS5uYW1lfVwiXG5cbiMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAwICAgIDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcblxuZ3lybyA9IChwb2x5KSAtPlxuXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgZmxhZy52ZXJ0IFwidiN7aX1cIiB1bml0IHBvbHkudmVydGljZXNbaV1cblxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIGZsYWcudmVydCBcImNlbnRlciN7aX1cIiB1bml0IGNlbnRlcnNbaV1cbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlKC0yKVxuICAgICAgICBmb3IgaiBpbiBbMC4uLmYubGVuZ3RoXVxuICAgICAgICAgICAgdiA9IGZbal1cbiAgICAgICAgICAgIHYzID0gdlxuICAgICAgICAgICAgZmxhZy52ZXJ0IHYxK1wiflwiK3YyLCBvbmVUaGlyZCBwb2x5LnZlcnRpY2VzW3YxXSxwb2x5LnZlcnRpY2VzW3YyXVxuICAgICAgICAgICAgZm5hbWUgPSBpK1wiZlwiK3YxXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIFwiY2VudGVyI3tpfVwiICB2MStcIn5cIit2MlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MStcIn5cIit2MiwgIHYyK1wiflwiK3YxXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYyK1wiflwiK3YxLCAgXCJ2I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBcInYje3YyfVwiICAgICB2MitcIn5cIit2M1xuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MitcIn5cIit2MywgIFwiY2VudGVyI3tpfVwiXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gIFxuICAgIGNhbm9uaWNhbGl6ZSBmbGFnLnRvcG9seSBcImcje3BvbHkubmFtZX1cIlxuICAgIFxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAwMCAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuIyAwMDAgMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiMgIDAwMDAwIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgXG5cbnF1aW50byA9IChwb2x5KSAtPiAjIGNyZWF0ZXMgYSBwZW50YWdvbiBmb3IgZXZlcnkgdmVydGV4IGFuZCBhIG5ldyBpbnNldCBmYWNlXG4gICAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgY2VudHJvaWQgPSBjYWxjQ2VudHJvaWQgZi5tYXAgKGlkeCkgLT4gcG9seS52ZXJ0aWNlc1tpZHhdXG5cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlIC0yXG4gICAgICAgIGZvciB2MyBpbiBmXG4gICAgICAgICAgICBtaWRwdCA9IG1pZHBvaW50IHBvbHkudmVydGljZXNbdjFdLCBwb2x5LnZlcnRpY2VzW3YyXVxuICAgICAgICAgICAgaW5uZXJwdCA9IG1pZHBvaW50IG1pZHB0LCBjZW50cm9pZFxuICAgICAgICAgICAgZmxhZy52ZXJ0IG1pZE5hbWUodjEsdjIpLCBtaWRwdFxuICAgICAgICAgICAgZmxhZy52ZXJ0IFwiaW5uZXJfI3tpfV9cIiArIG1pZE5hbWUodjEsdjIpLCBpbm5lcnB0XG4gICAgICAgICAgICBmbGFnLnZlcnQgXCIje3YyfVwiIHBvbHkudmVydGljZXNbdjJdXG4gICAgICAgICAgXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfV8je3YyfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpLCBtaWROYW1lKHYxLCB2MilcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9XyN7djJ9XCIsIG1pZE5hbWUodjEsIHYyKSwgXCIje3YyfVwiXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfV8je3YyfVwiLCBcIiN7djJ9XCIsIG1pZE5hbWUodjIsIHYzKVxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7aX1fI3t2Mn1cIiwgbWlkTmFtZSh2MiwgdjMpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfV8je3YyfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpXG4gICAgICBcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImZfaW5fI3tpfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpXG4gICAgICBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M11cbiAgXG4gICAgZmxhZy50b3BvbHkgXCJxI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDBcbiMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgXG4jIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgIFxuIyAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgMDAwICAgXG5cbmluc2V0ID0gKHBvbHksIGluc2V0PTAuNSwgcG9wb3V0PS0wLjIsIG49MCkgLT5cbiAgXG4gICAgaW5zZXQgPSBjbGFtcCAwLjI1IDAuOTkgaW5zZXRcbiAgICBwb3BvdXQgPSBtaW4gcG9wb3V0LCBpbnNldFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgcCA9IHBvbHkudmVydGljZXNbaV1cbiAgICAgICAgZmxhZy52ZXJ0IFwidiN7aX1cIiBwXG5cbiAgICBub3JtYWxzID0gcG9seS5ub3JtYWxzKClcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBpZiBmLmxlbmd0aCA9PSBuIG9yIG4gPT0gMFxuICAgICAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgICAgIGZsYWcudmVydCBcImYje2l9diN7dn1cIiBhZGQgdHdlZW4ocG9seS52ZXJ0aWNlc1t2XSxjZW50ZXJzW2ldLGluc2V0KSwgbXVsdChwb3BvdXQsbm9ybWFsc1tpXSlcbiAgXG4gICAgZm91bmRBbnkgPSBmYWxzZSAjIGFsZXJ0IGlmIGRvbid0IGZpbmQgYW55XG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgdjIgPSBcInYje3Z9XCI7XG4gICAgICAgICAgICBpZiBmLmxlbmd0aCA9PSBuIG9yIG4gPT0gMFxuICAgICAgICAgICAgICAgIGZvdW5kQW55ID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGZuYW1lID0gaSArIHYxXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlKGZuYW1lLCAgICAgIHYxLCAgICAgICB2MilcbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UoZm5hbWUsICAgICAgdjIsICAgICAgIFwiZiN7aX0je3YyfVwiKVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZShmbmFtZSwgXCJmI3tpfSN7djJ9XCIsICBcImYje2l9I3t2MX1cIilcbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UoZm5hbWUsIFwiZiN7aX0je3YxfVwiLCAgdjEpXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlKFwiZXgje2l9XCIsIFwiZiN7aX0je3YxfVwiLCAgXCJmI3tpfSN7djJ9XCIpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlKGksIHYxLCB2MikgIFxuICAgICAgICAgICAgdjE9djJcbiAgXG4gICAgaWYgbm90IGZvdW5kQW55XG4gICAgICAgIGtsb2cgXCJObyAje259LWZvbGQgY29tcG9uZW50cyB3ZXJlIGZvdW5kLlwiXG4gIFxuICAgIGZsYWcudG9wb2x5IFwibiN7bn0je3BvbHkubmFtZX1cIlxuXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuXG5leHRydWRlID0gKHBvbHksIHBvcG91dD0xLCBpbnNldGY9MC41LCBuPTApIC0+XG4gICAgbmV3cG9seSA9IGluc2V0IHBvbHksIGluc2V0ZiwgcG9wb3V0LCBuXG4gICAgbmV3cG9seS5uYW1lID0gXCJ4I3tufSN7cG9seS5uYW1lfVwiXG4gICAgbmV3cG9seVxuXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgXG5cbmhvbGxvdyA9IChwb2x5LCBpbnNldGYsIHRoaWNrbmVzcykgLT5cblxuICAgIGluc2V0ZiA/PSAwLjVcbiAgICBpbnNldGYgID0gY2xhbXAgMC4xIDAuOSBpbnNldGZcbiAgICB0aGlja25lc3MgPz0gaW5zZXRmKjIvM1xuICAgIHRoaWNrbmVzcyA9IG1pbiBpbnNldGYqMi8zLCB0aGlja25lc3NcbiAgXG4gICAgZHVhbG5vcm1hbHMgPSBkdWFsKHBvbHkpLm5vcm1hbHMoKVxuICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgIHAgPSBwb2x5LnZlcnRpY2VzW2ldXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgcFxuICAgICAgICBmbGFnLnZlcnQgXCJkb3dudiN7aX1cIiBhZGQgcCwgbXVsdCAtMSp0aGlja25lc3MsZHVhbG5vcm1hbHNbaV1cblxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIGZsYWcudmVydCBcImZpbiN7aX12I3t2fVwiIHR3ZWVuIHBvbHkudmVydGljZXNbdl0sIGNlbnRlcnNbaV0sIGluc2V0ZlxuICAgICAgICAgICAgZmxhZy52ZXJ0IFwiZmluZG93biN7aX12I3t2fVwiIGFkZCB0d2Vlbihwb2x5LnZlcnRpY2VzW3ZdLGNlbnRlcnNbaV0saW5zZXRmKSwgbXVsdCgtMSp0aGlja25lc3Msbm9ybWFsc1tpXSlcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgdjIgPSBcInYje3Z9XCJcbiAgICAgICAgICAgIGZuYW1lID0gaSArIHYxXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYxLCAgICAgICAgICAgIHYyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYyLCAgICAgICAgICAgIFwiZmluI3tpfSN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgXCJmaW4je2l9I3t2Mn1cIiBcImZpbiN7aX0je3YxfVwiXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIFwiZmluI3tpfSN7djF9XCIgdjFcbiAgICAgIFxuICAgICAgICAgICAgZm5hbWUgPSBcInNpZGVzI3tpfSN7djF9XCJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgXCJmaW4je2l9I3t2MX1cIiAgICAgXCJmaW4je2l9I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBcImZpbiN7aX0je3YyfVwiICAgICBcImZpbmRvd24je2l9I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBcImZpbmRvd24je2l9I3t2Mn1cIiBcImZpbmRvd24je2l9I3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBcImZpbmRvd24je2l9I3t2MX1cIiBcImZpbiN7aX0je3YxfVwiXG4gICAgICBcbiAgICAgICAgICAgIGZuYW1lID0gXCJib3R0b20je2l9I3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCAgXCJkb3duI3t2Mn1cIiAgICAgICAgXCJkb3duI3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCAgXCJkb3duI3t2MX1cIiAgICAgICAgXCJmaW5kb3duI3tpfSN7djF9XCJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgIFwiZmluZG93biN7aX0je3YxfVwiIFwiZmluZG93biN7aX0je3YyfVwiXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsICBcImZpbmRvd24je2l9I3t2Mn1cIiBcImRvd24je3YyfVwiXG4gICAgICBcbiAgICAgICAgICAgIHYxID0gdjJcbiAgXG4gICAgZmxhZy50b3BvbHkgXCJII3twb2x5Lm5hbWV9XCJcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAwMFxuIyAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4jIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAgICAgICAwMDAgICAwMDBcblxucGVyc3BlY3RpdmEgPSAocG9seSkgLT4gIyBhbiBvcGVyYXRpb24gcmV2ZXJzZS1lbmdpbmVlcmVkIGZyb20gUGVyc3BlY3RpdmEgQ29ycG9ydW0gUmVndWxhcml1bVxuXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgZmxhZy52ZXJ0IFwidiN7aX1cIiBwb2x5LnZlcnRpY2VzW2ldXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIFxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0yXX1cIlxuICAgICAgICB2MiA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICB2ZXJ0MSA9IHBvbHkudmVydGljZXNbZltmLmxlbmd0aC0yXV1cbiAgICAgICAgdmVydDIgPSBwb2x5LnZlcnRpY2VzW2ZbZi5sZW5ndGgtMV1dXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIHYzID0gXCJ2I3t2fVwiXG4gICAgICAgICAgICB2ZXJ0MyA9IHBvbHkudmVydGljZXNbdl1cbiAgICAgICAgICAgIHYxMiA9IHYxK1wiflwiK3YyXG4gICAgICAgICAgICB2MjEgPSB2MitcIn5cIit2MVxuICAgICAgICAgICAgdjIzID0gdjIrXCJ+XCIrdjNcbiAgICAgIFxuICAgICAgICAgICAgIyBvbiBlYWNoIE5mYWNlLCBOIG5ldyBwb2ludHMgaW5zZXQgZnJvbSBlZGdlIG1pZHBvaW50cyB0b3dhcmRzIGNlbnRlciA9IFwic3RlbGxhdGVkXCIgcG9pbnRzXG4gICAgICAgICAgICBmbGFnLnZlcnQgdjEyLCBtaWRwb2ludCBtaWRwb2ludCh2ZXJ0MSx2ZXJ0MiksIGNlbnRlcnNbaV0gXG4gICAgICBcbiAgICAgICAgICAgICMgaW5zZXQgTmZhY2UgbWFkZSBvZiBuZXcsIHN0ZWxsYXRlZCBwb2ludHNcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImluI3tpfVwiIHYxMiwgdjIzXG4gICAgICBcbiAgICAgICAgICAgICMgbmV3IHRyaSBmYWNlIGNvbnN0aXR1dGluZyB0aGUgcmVtYWluZGVyIG9mIHRoZSBzdGVsbGF0ZWQgTmZhY2VcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9I3t2Mn1cIiB2MjMsIHYxMlxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7aX0je3YyfVwiIHYxMiwgdjJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9I3t2Mn1cIiB2MiwgIHYyM1xuICAgICAgXG4gICAgICAgICAgICAjIG9uZSBvZiB0aGUgdHdvIG5ldyB0cmlhbmdsZXMgcmVwbGFjaW5nIG9sZCBlZGdlIGJldHdlZW4gdjEtPnYyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3t2MTJ9XCIgdjEsICB2MjFcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje3YxMn1cIiB2MjEsIHYxMlxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7djEyfVwiIHYxMiwgdjFcbiAgICAgIFxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICAgICAgICAgICAgW3ZlcnQxLCB2ZXJ0Ml0gPSBbdmVydDIsIHZlcnQzXVxuICBcbiAgICBmbGFnLnRvcG9seSBcIlAje3BvbHkubmFtZX1cIlxuXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG5cbnRyaXN1YiA9IChwb2x5LCBuPTIpIC0+XG4gICAgXG4gICAgZm9yIGZuIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGlmIHBvbHkuZmFjZXNbZm5dLmxlbmd0aCAhPSAzXG4gICAgICAgICAgICByZXR1cm4gcG9seVxuICBcbiAgICB2ZXJ0cyA9IFtdXG4gICAgdm1hcCA9IHt9XG4gICAgcG9zID0gMFxuICAgIGZvciBmbiBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tmbl1cbiAgICAgICAgW2kxLCBpMiwgaTNdID0gZi5zbGljZSAtM1xuICAgICAgICB2MSA9IHBvbHkudmVydGljZXNbaTFdXG4gICAgICAgIHYyID0gcG9seS52ZXJ0aWNlc1tpMl1cbiAgICAgICAgdjMgPSBwb2x5LnZlcnRpY2VzW2kzXVxuICAgICAgICB2MjEgPSBzdWIgdjIsIHYxXG4gICAgICAgIHYzMSA9IHN1YiB2MywgdjFcbiAgICAgICAgZm9yIGkgaW4gWzAuLm5dXG4gICAgICAgICAgICBmb3IgaiBpbiBbMC4ubi1pXVxuICAgICAgICAgICAgICAgIHYgPSBhZGQgYWRkKHYxLCBtdWx0KGkvbiwgdjIxKSksIG11bHQoai9uLCB2MzEpXG4gICAgICAgICAgICAgICAgdm1hcFtcInYje2ZufS0je2l9LSN7an1cIl0gPSBwb3MrK1xuICAgICAgICAgICAgICAgIHZlcnRzLnB1c2ggdlxuICBcbiAgICBFUFNJTE9OX0NMT1NFID0gMS4wZS04XG4gICAgdW5pcVZzID0gW11cbiAgICBuZXdwb3MgPSAwXG4gICAgdW5pcW1hcCA9IHt9XG4gICAgZm9yIHYsaSBpbiB2ZXJ0c1xuICAgICAgICBpZiBpIGluIHVuaXFtYXAgdGhlbiBjb250aW51ZSAjIGFscmVhZHkgbWFwcGVkXG4gICAgICAgIHVuaXFtYXBbaV0gPSBuZXdwb3NcbiAgICAgICAgdW5pcVZzLnB1c2ggdlxuICAgICAgICBmb3IgaiBpbiBbaSsxLi4udmVydHMubGVuZ3RoXVxuICAgICAgICAgICAgdyA9IHZlcnRzW2pdXG4gICAgICAgICAgICBpZiBtYWcoc3ViKHYsIHcpKSA8IEVQU0lMT05fQ0xPU0VcbiAgICAgICAgICAgICAgICB1bmlxbWFwW2pdID0gbmV3cG9zXG4gICAgICAgIG5ld3BvcysrXG4gIFxuICAgIGZhY2VzID0gW11cbiAgICBmb3IgZm4gaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZm9yIGkgaW4gWzAuLi5uXVxuICAgICAgICAgICAgZm9yIGogaW4gWzAuLi5uLWldXG4gICAgICAgICAgICAgICAgZmFjZXMucHVzaCBbdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2krMX0tI3tqfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2l9LSN7aisxfVwiXV1dXG4gICAgICAgIGZvciBpIGluIFsxLi4ubl1cbiAgICAgICAgICAgIGZvciBqIGluIFswLi4ubi1pXVxuICAgICAgICAgICAgICAgIGZhY2VzLnB1c2ggW3VuaXFtYXBbdm1hcFtcInYje2ZufS0je2l9LSN7an1cIl1dLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2orMX1cIl1dLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpLTF9LSN7aisxfVwiXV1dXG4gIFxuICAgIG5ldyBQb2x5aGVkcm9uIFwidSN7bn0je3BvbHkubmFtZX1cIiBmYWNlcywgdW5pcVZzXG5cbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxuIyBTbG93IENhbm9uaWNhbGl6YXRpb24gQWxnb3JpdGhtXG4jXG4jIFRoaXMgYWxnb3JpdGhtIGhhcyBzb21lIGNvbnZlcmdlbmNlIHByb2JsZW1zLCB3aGF0IHJlYWxseSBuZWVkcyB0byBiZSBkb25lIGlzIHRvXG4jIHN1bSB0aGUgdGhyZWUgZm9yY2luZyBmYWN0b3JzIHRvZ2V0aGVyIGFzIGEgY29uaGVyZW50IGZvcmNlIGFuZCB0byB1c2UgYSBoYWxmLWRlY2VudFxuIyBpbnRlZ3JhdG9yIHRvIG1ha2Ugc3VyZSB0aGF0IGl0IGNvbnZlcmdlcyB3ZWxsIGFzIG9wcG9zZWQgdG8gdGhlIGN1cnJlbnQgaGFjayBvZlxuIyBhZC1ob2Mgc3RhYmlsaXR5IG11bHRpcGxpZXJzLiAgSWRlYWxseSBvbmUgd291bGQgaW1wbGVtZW50IGEgY29uanVnYXRlIGdyYWRpZW50XG4jIGRlc2NlbnQgb3Igc2ltaWxhciBwcmV0dHkgdGhpbmcuXG4jXG4jIE9ubHkgdHJ5IHRvIHVzZSB0aGlzIG9uIGNvbnZleCBwb2x5aGVkcmEgdGhhdCBoYXZlIGEgY2hhbmNlIG9mIGJlaW5nIGNhbm9uaWNhbGl6ZWQsXG4jIG90aGVyd2lzZSBpdCB3aWxsIHByb2JhYmx5IGJsb3cgdXAgdGhlIGdlb21ldHJ5LiAgQSBtdWNoIHRyaWNraWVyIC8gc21hcnRlciBzZWVkLXN5bW1ldHJ5XG4jIGJhc2VkIGdlb21ldHJpY2FsIHJlZ3VsYXJpemVyIHNob3VsZCBiZSB1c2VkIGZvciBmYW5jaWVyL3dlaXJkZXIgcG9seWhlZHJhLlxuXG5jYW5vbmljYWxpemUgPSAocG9seSwgaXRlcj0yMDApIC0+XG5cbiAgICBmYWNlcyA9IHBvbHkuZmFjZXNcbiAgICBlZGdlcyA9IHBvbHkuZWRnZXMoKVxuICAgIHZlcnRzID0gcG9seS52ZXJ0aWNlc1xuICAgIG1heENoYW5nZSA9IDEuMFxuICAgIGZvciBpIGluIFswLi5pdGVyXVxuICAgICAgICBvbGRWcyA9IGNvcHlWZWNBcnJheSB2ZXJ0c1xuICAgICAgICB2ZXJ0cyA9IHRhbmdlbnRpZnkgdmVydHMsIGVkZ2VzXG4gICAgICAgIHZlcnRzID0gcmVjZW50ZXIgdmVydHMsIGVkZ2VzXG4gICAgICAgIHZlcnRzID0gcGxhbmFyaXplIHZlcnRzLCBmYWNlc1xuICAgICAgICBtYXhDaGFuZ2UgPSBfLm1heCBfLm1hcCBfLnppcCh2ZXJ0cywgb2xkVnMpLCAoW3gsIHldKSAtPiBtYWcgc3ViIHgsIHlcbiAgICAgICAgaWYgbWF4Q2hhbmdlIDwgMWUtOFxuICAgICAgICAgICAgYnJlYWtcbiAgICB2ZXJ0cyA9IHJlc2NhbGUodmVydHMpXG4gICAgbmV3cG9seSA9IG5ldyBQb2x5aGVkcm9uIHBvbHkubmFtZSwgcG9seS5mYWNlcywgdmVydHNcbiAgICBuZXdwb2x5XG4gICAgXG5jYW5vbmljYWxYWVogPSAocG9seSwgaXRlcmF0aW9ucykgLT5cblxuICAgIGl0ZXJhdGlvbnMgPz0gMVxuICAgIGRwb2x5ID0gZHVhbCBwb2x5XG4gIFxuICAgIGZvciBjb3VudCBpbiBbMC4uLml0ZXJhdGlvbnNdICMgcmVjaXByb2NhdGUgZmFjZSBub3JtYWxzXG4gICAgICAgIGRwb2x5LnZlcnRpY2VzID0gcmVjaXByb2NhbE4gcG9seVxuICAgICAgICBwb2x5LnZlcnRpY2VzICA9IHJlY2lwcm9jYWxOIGRwb2x5XG4gIFxuICAgIG5ldyBQb2x5aGVkcm9uIHBvbHkubmFtZSwgcG9seS5mYWNlcywgcG9seS52ZXJ0aWNlc1xuXG5mbGF0dGVuID0gKHBvbHksIGl0ZXJhdGlvbnMpIC0+ICMgcXVpY2sgcGxhbmFyaXphdGlvblxuICAgIFxuICAgIGl0ZXJhdGlvbnMgPz0gMVxuICAgIGRwb2x5ID0gZHVhbCBwb2x5XG4gIFxuICAgIGZvciBjb3VudCBpbiBbMC4uLml0ZXJhdGlvbnNdXG4gICAgICAgIGRwb2x5LnZlcnRpY2VzID0gcmVjaXByb2NhbEMgcG9seVxuICAgICAgICBwb2x5LnZlcnRpY2VzICA9IHJlY2lwcm9jYWxDIGRwb2x5XG4gIFxuICAgIG5ldyBQb2x5aGVkcm9uIHBvbHkubmFtZSwgcG9seS5mYWNlcywgcG9seS52ZXJ0aWNlc1xuICAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICBcbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgICBkdWFsOiAgICAgICAgICAgZHVhbFxuICAgIHRyaXN1YjogICAgICAgICB0cmlzdWJcbiAgICB0cnVuY2F0ZTogICAgICAgdHJ1bmNhdGVcbiAgICBwZXJzcGVjdGl2YTogICAgcGVyc3BlY3RpdmFcbiAgICBraXM6ICAgICAgICAgICAga2lzXG4gICAgYW1ibzogICAgICAgICAgIGFtYm9cbiAgICBneXJvOiAgICAgICAgICAgZ3lyb1xuICAgIGNoYW1mZXI6ICAgICAgICBjaGFtZmVyXG4gICAgd2hpcmw6ICAgICAgICAgIHdoaXJsXG4gICAgcXVpbnRvOiAgICAgICAgIHF1aW50b1xuICAgIGluc2V0OiAgICAgICAgICBpbnNldFxuICAgIGV4dHJ1ZGU6ICAgICAgICBleHRydWRlXG4gICAgaG9sbG93OiAgICAgICAgIGhvbGxvd1xuICAgIGZsYXR0ZW46ICAgICAgICBmbGF0dGVuXG4gICAgemlya3VsYXJpemU6ICAgIHppcmt1bGFyaXplXG4gICAgY2Fub25pY2FsaXplOiAgIGNhbm9uaWNhbGl6ZVxuICAgIGNhbm9uaWNhbFhZWjogICBjYW5vbmljYWxYWVpcbiAgICAiXX0=
//# sourceURL=../../coffee/poly/topo.coffee