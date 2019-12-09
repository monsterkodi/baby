// koffee 1.6.0

/*
000000000   0000000   00000000    0000000     
   000     000   000  000   000  000   000    
   000     000   000  00000000   000   000    
   000     000   000  000        000   000    
   000      0000000   000         0000000
 */
var Flag, Polyhedron, _, abs, acos, add, ambo, calcCentroid, canonicalXYZ, canonicalize, chamfer, clamp, copyVecArray, cross, dot, dual, extrude, flatten, gyro, hollow, inset, intersect, kis, klog, mag, midName, midpoint, min, mult, neg, oneThird, perspectiva, planarize, pointPlaneDist, quinto, rayPlane, rayRay, recenter, reciprocalC, reciprocalN, ref, ref1, rescale, rotate, sub, tangentify, trisub, tween, unit, whirl, zirkularize,
    indexOf = [].indexOf;

ref = require('kxk'), clamp = ref.clamp, klog = ref.klog, _ = ref._;

ref1 = require('./math'), dot = ref1.dot, add = ref1.add, neg = ref1.neg, mult = ref1.mult, mag = ref1.mag, sub = ref1.sub, unit = ref1.unit, cross = ref1.cross, rotate = ref1.rotate, oneThird = ref1.oneThird, tween = ref1.tween, intersect = ref1.intersect, rayRay = ref1.rayRay, rayPlane = ref1.rayPlane, pointPlaneDist = ref1.pointPlaneDist, midpoint = ref1.midpoint, calcCentroid = ref1.calcCentroid, copyVecArray = ref1.copyVecArray, tangentify = ref1.tangentify, reciprocalC = ref1.reciprocalC, reciprocalN = ref1.reciprocalN, recenter = ref1.recenter, rescale = ref1.rescale, planarize = ref1.planarize;

min = Math.min, abs = Math.abs, acos = Math.acos;

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
        v1 = f[f.length - 1];
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
        v1 = f[f.length - 1];
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

kis = function(poly, n, apexdist) {
    var apex, centers, f, flag, fname, foundAny, i, l, len, m, normals, o, p, ref2, ref3, v, v1, v2;
    if (n != null) {
        n;
    } else {
        n = 0;
    }
    if (apexdist != null) {
        apexdist;
    } else {
        apexdist = 0;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9wby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsOGFBQUE7SUFBQTs7QUF3QkEsTUFBcUIsT0FBQSxDQUFRLEtBQVIsQ0FBckIsRUFBRSxpQkFBRixFQUFTLGVBQVQsRUFBZTs7QUFDZixPQUV5RSxPQUFBLENBQVEsUUFBUixDQUZ6RSxFQUFFLGNBQUYsRUFBTyxjQUFQLEVBQVksY0FBWixFQUFpQixnQkFBakIsRUFBdUIsY0FBdkIsRUFBNEIsY0FBNUIsRUFBaUMsZ0JBQWpDLEVBQXVDLGtCQUF2QyxFQUE4QyxvQkFBOUMsRUFBc0Qsd0JBQXRELEVBQWdFLGtCQUFoRSxFQUF1RSwwQkFBdkUsRUFBa0Ysb0JBQWxGLEVBQ0Usd0JBREYsRUFDWSxvQ0FEWixFQUM0Qix3QkFENUIsRUFDc0MsZ0NBRHRDLEVBQ29ELGdDQURwRCxFQUVFLDRCQUZGLEVBRWMsOEJBRmQsRUFFMkIsOEJBRjNCLEVBRXdDLHdCQUZ4QyxFQUVrRCxzQkFGbEQsRUFFMkQ7O0FBQ3pELGNBQUYsRUFBTyxjQUFQLEVBQVk7O0FBRVosSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztBQUNQLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7QUFFYixPQUFBLEdBQVUsU0FBQyxFQUFELEVBQUssRUFBTDtXQUFZLEVBQUEsR0FBRyxFQUFILElBQVUsQ0FBRyxFQUFELEdBQUksR0FBSixHQUFPLEVBQVQsQ0FBVixJQUEyQixDQUFHLEVBQUQsR0FBSSxHQUFKLEdBQU8sRUFBVDtBQUF2Qzs7QUFRVixXQUFBLEdBQWMsU0FBQyxJQUFELEVBQU8sQ0FBUDtBQUVWLFFBQUE7O1FBQUE7O1FBQUEsSUFBSzs7SUFDTCxRQUFBLEdBQVc7QUFFWCxTQUFTLCtGQUFUO1FBQ0ksQ0FBQSxHQUFJLElBQUksQ0FBQyxLQUFNLENBQUEsQ0FBQTtRQUNmLElBQUcsQ0FBQyxDQUFDLE1BQUYsS0FBWSxDQUFaLElBQWlC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QWtCVixNQUFNLENBQUMsT0FBUCxHQUNJO0lBQUEsSUFBQSxFQUFnQixJQUFoQjtJQUNBLE1BQUEsRUFBZ0IsTUFEaEI7SUFFQSxXQUFBLEVBQWdCLFdBRmhCO0lBR0EsR0FBQSxFQUFnQixHQUhoQjtJQUlBLElBQUEsRUFBZ0IsSUFKaEI7SUFLQSxJQUFBLEVBQWdCLElBTGhCO0lBTUEsT0FBQSxFQUFnQixPQU5oQjtJQU9BLEtBQUEsRUFBZ0IsS0FQaEI7SUFRQSxNQUFBLEVBQWdCLE1BUmhCO0lBU0EsS0FBQSxFQUFnQixLQVRoQjtJQVVBLE9BQUEsRUFBZ0IsT0FWaEI7SUFXQSxNQUFBLEVBQWdCLE1BWGhCO0lBWUEsT0FBQSxFQUFnQixPQVpoQjtJQWFBLFdBQUEsRUFBZ0IsV0FiaEI7SUFjQSxZQUFBLEVBQWdCLFlBZGhCO0lBZUEsWUFBQSxFQUFnQixZQWZoQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgIFxuICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAgIFxuIyMjXG4jXG4jIFBvbHlow6lkcm9uaXNtZSwgQ29weXJpZ2h0IDIwMTksIEFuc2VsbSBMZXZza2F5YSwgTUlUIExpY2Vuc2VcbiNcbiMgUG9seWhlZHJvbiBPcGVyYXRvcnNcbiNcbiMgZm9yIGVhY2ggdmVydGV4IG9mIG5ldyBwb2x5aGVkcm9uXG4jICAgICBjYWxsIHZlcnQoVm5hbWUsIHh5eikgd2l0aCBhIHN5bWJvbGljIG5hbWUgYW5kIGNvb3JkaW5hdGVzXG4jXG4jIGZvciBlYWNoIGZsYWcgb2YgbmV3IHBvbHloZWRyb25cbiMgICAgIGNhbGwgZWRnZShGbmFtZSwgVm5hbWUxLCBWbmFtZTIpIHdpdGggYSBzeW1ib2xpYyBuYW1lIGZvciB0aGUgbmV3IGZhY2VcbiMgICAgIGFuZCB0aGUgc3ltYm9saWMgbmFtZSBmb3IgdHdvIHZlcnRpY2VzIGZvcm1pbmcgYW4gb3JpZW50ZWQgZWRnZVxuI1xuIyBPcmllbnRhdGlvbiBtdXN0IGJlIGRlYWx0IHdpdGggcHJvcGVybHkgdG8gbWFrZSBhIG1hbmlmb2xkIG1lc2hcbiMgU3BlY2lmaWNhbGx5LCBubyBlZGdlIHYxLT52MiBjYW4gZXZlciBiZSBjcm9zc2VkIGluIHRoZSBzYW1lIGRpcmVjdGlvbiBieSB0d28gZGlmZmVyZW50IGZhY2VzXG4jIGNhbGwgdG9wb2x5KCkgdG8gYXNzZW1ibGUgZmxhZ3MgaW50byBwb2x5aGVkcm9uIHN0cnVjdHVyZSBieSBmb2xsb3dpbmcgdGhlIG9yYml0c1xuIyBvZiB0aGUgdmVydGV4IG1hcHBpbmcgc3RvcmVkIGluIHRoZSBmbGFnc2V0IGZvciBlYWNoIG5ldyBmYWNlXG5cbnsgY2xhbXAsIGtsb2csIF8gfSA9IHJlcXVpcmUgJ2t4aydcbnsgZG90LCBhZGQsIG5lZywgbXVsdCwgbWFnLCBzdWIsIHVuaXQsIGNyb3NzLCByb3RhdGUsIG9uZVRoaXJkLCB0d2VlbiwgaW50ZXJzZWN0LCByYXlSYXksIFxuICByYXlQbGFuZSwgcG9pbnRQbGFuZURpc3QsIG1pZHBvaW50LCBjYWxjQ2VudHJvaWQsIGNvcHlWZWNBcnJheSxcbiAgdGFuZ2VudGlmeSwgcmVjaXByb2NhbEMsIHJlY2lwcm9jYWxOLCByZWNlbnRlciwgcmVzY2FsZSwgcGxhbmFyaXplIH0gPSByZXF1aXJlICcuL21hdGgnXG57IG1pbiwgYWJzLCBhY29zIH0gPSBNYXRoXG5cbkZsYWcgPSByZXF1aXJlICcuL2ZsYWcnXG5Qb2x5aGVkcm9uID0gcmVxdWlyZSAnLi9wb2x5aGVkcm9uJ1xuXG5taWROYW1lID0gKHYxLCB2MikgLT4gdjE8djIgYW5kIFwiI3t2MX1fI3t2Mn1cIiBvciBcIiN7djJ9XyN7djF9XCIgIyB1bmlxdWUgbmFtZXMgb2YgbWlkcG9pbnRzXG5cbiMgMDAwMDAwMCAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAgIDAwMCAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiMgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG56aXJrdWxhcml6ZSA9IChwb2x5LCBuKSAtPlxuICAgIFxuICAgIG4gPz0gMFxuICAgIHZlcnRpY2VzID0gW11cbiAgICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBpZiBmLmxlbmd0aCA9PSBuIG9yIG4gPT0gMFxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlIC0yXG4gICAgICAgICAgICBmb3IgdjMgaW4gZlxuICAgICAgICAgICAgICAgIHYxMiA9IHN1YiBwb2x5LnZlcnRpY2VzW3YyXSwgcG9seS52ZXJ0aWNlc1t2MV1cbiAgICAgICAgICAgICAgICB2MzIgPSBzdWIgcG9seS52ZXJ0aWNlc1t2Ml0sIHBvbHkudmVydGljZXNbdjNdXG4gICAgICAgICAgICAgICAgaWYgYWJzKG1hZyh2MTIpIC0gbWFnKHYzMikpID4gMC4wMDFcbiAgICAgICAgICAgICAgICAgICAgbTEyID0gbWlkcG9pbnQgcG9seS52ZXJ0aWNlc1t2MV0sIHBvbHkudmVydGljZXNbdjJdXG4gICAgICAgICAgICAgICAgICAgIG0zMiA9IG1pZHBvaW50IHBvbHkudmVydGljZXNbdjNdLCBwb2x5LnZlcnRpY2VzW3YyXVxuICAgICAgICAgICAgICAgICAgICB1MTIgPSB1bml0IG0xMlxuICAgICAgICAgICAgICAgICAgICB1MzIgPSB1bml0IG0zMlxuICAgICAgICAgICAgICAgICAgICBuYyA9IGFkZCB1MTIsIHUzMlxuICAgICAgICAgICAgICAgICAgICBwbiA9IGNyb3NzIG5jLCBjcm9zcyBwb2x5LnZlcnRpY2VzW3YxXSwgcG9seS52ZXJ0aWNlc1t2M11cbiAgICAgICAgICAgICAgICAgICAgaWYgbWFnKHYxMikgPiBtYWcodjMyKVxuICAgICAgICAgICAgICAgICAgICAgICAgciA9IHJheVBsYW5lIHBvbHkudmVydGljZXNbdjNdLCB2MzIsIFswIDAgMF0sIHBuXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHIgPSByYXlQbGFuZSBwb2x5LnZlcnRpY2VzW3YxXSwgdjEyLCBbMCAwIDBdLCBwblxuICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNlc1t2Ml0gPSByXG4gICAgICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICBcbiAgICB2ZXJ0cyA9IFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdLm1hcCAoaSkgLT4gdmVydGljZXNbaV0gPyBwb2x5LnZlcnRpY2VzW2ldXG4gICAgXG4gICAgbmV3IFBvbHloZWRyb24gXCJ6I3twb2x5Lm5hbWV9XCIgcG9seS5mYWNlcywgdmVydHNcblxuIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG5cbmR1YWwgPSAocG9seSkgLT5cblxuICAgICMga2xvZyBcImR1YWwgI3twb2x5Lm5hbWV9XCIgXG4gIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZhY2UgPSBbXSBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXSBcbiAgICAgICAgZmFjZVtpXSA9IHt9XG5cbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IGZbZi5sZW5ndGgtMV0gIyBsYXN0IHZlcnRleFxuICAgICAgICBmb3IgdjIgaW4gZiAjIGFzc3VtZXMgdGhhdCBubyAyIGZhY2VzIHNoYXJlIGFuIGVkZ2UgaW4gdGhlIHNhbWUgb3JpZW50YXRpb24hXG4gICAgICAgICAgICBmYWNlW3YxXVtcInYje3YyfVwiXSA9IFwiI3tpfVwiXG4gICAgICAgICAgICB2MSA9IHYyICMgY3VycmVudCBiZWNvbWVzIHByZXZpb3VzXG4gIFxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGZsYWcudmVydCBcIiN7aX1cIiBjZW50ZXJzW2ldXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gZltmLmxlbmd0aC0xXSAjcHJldmlvdXMgdmVydGV4XG4gICAgICAgIGZvciB2MiBpbiBmXG4gICAgICAgICAgICBmbGFnLmVkZ2UgdjEsIGZhY2VbdjJdW1widiN7djF9XCJdLCBcIiN7aX1cIlxuICAgICAgICAgICAgdjE9djIgIyBjdXJyZW50IGJlY29tZXMgcHJldmlvdXNcbiAgXG4gICAgZHBvbHkgPSBmbGFnLnRvcG9seSgpICMgYnVpbGQgdG9wb2xvZ2ljYWwgZHVhbCBmcm9tIGZsYWdzXG4gIFxuICAgICMgbWF0Y2ggRiBpbmRleCBvcmRlcmluZyB0byBWIGluZGV4IG9yZGVyaW5nIG9uIGR1YWxcbiAgICBzb3J0RiA9IFtdXG4gICAgZm9yIGYgaW4gZHBvbHkuZmFjZXNcbiAgICAgICAgayA9IGludGVyc2VjdCBwb2x5LmZhY2VzW2ZbMF1dLCBwb2x5LmZhY2VzW2ZbMV1dLCBwb2x5LmZhY2VzW2ZbMl1dXG4gICAgICAgIHNvcnRGW2tdID0gZlxuICAgIGRwb2x5LmZhY2VzID0gc29ydEZcbiAgXG4gICAgaWYgcG9seS5uYW1lWzBdICE9IFwiZFwiXG4gICAgICAgIGRwb2x5Lm5hbWUgPSBcImQje3BvbHkubmFtZX1cIlxuICAgIGVsc2UgXG4gICAgICAgIGRwb2x5Lm5hbWUgPSBwb2x5Lm5hbWUuc2xpY2UgMVxuICBcbiAgICBkcG9seVxuXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG4jIEtpcyAoYWJicmV2aWF0ZWQgZnJvbSB0cmlha2lzKSB0cmFuc2Zvcm1zIGFuIE4tc2lkZWQgZmFjZSBpbnRvIGFuIE4tcHlyYW1pZCByb290ZWQgYXQgdGhlXG4jIHNhbWUgYmFzZSB2ZXJ0aWNlcy4gb25seSBraXMgbi1zaWRlZCBmYWNlcywgYnV0IG49PTAgbWVhbnMga2lzIGFsbC5cblxua2lzID0gKHBvbHksIG4sIGFwZXhkaXN0KSAtPlxuXG4gICAgbiA/PSAwXG4gICAgYXBleGRpc3QgPz0gMFxuXG4gICAgIyBrbG9nIFwia2lzIG9mICN7biBhbmQgXCIje259LXNpZGVkIGZhY2VzIG9mIFwiIG9yICcnfSN7cG9seS5uYW1lfVwiXG5cbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgIHAgPSBwb2x5LnZlcnRpY2VzW2ldICMgZWFjaCBvbGQgdmVydGV4IGlzIGEgbmV3IHZlcnRleFxuICAgICAgICBmbGFnLnZlcnQgXCJ2I3tpfVwiIHBcbiAgXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm91bmRBbnkgPSBmYWxzZVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gXCJ2I3tmW2YubGVuZ3RoLTFdfVwiXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIHYyID0gXCJ2I3t2fVwiXG4gICAgICAgICAgICBpZiBmLmxlbmd0aCA9PSBuIG9yIG4gPT0gMFxuICAgICAgICAgICAgICAgIGZvdW5kQW55ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBhcGV4ID0gXCJhcGV4I3tpfVwiXG4gICAgICAgICAgICAgICAgZm5hbWUgPSBcIiN7aX0je3YxfVwiXG4gICAgICAgICAgICAgICAgIyBuZXcgdmVydGljZXMgaW4gY2VudGVycyBvZiBuLXNpZGVkIGZhY2VcbiAgICAgICAgICAgICAgICBmbGFnLnZlcnQgYXBleCwgYWRkIGNlbnRlcnNbaV0sIG11bHQgYXBleGRpc3QsIG5vcm1hbHNbaV1cbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsICAgdjEsICAgdjIgIyB0aGUgb2xkIGVkZ2Ugb2Ygb3JpZ2luYWwgZmFjZVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgICB2MiwgYXBleCAjIHVwIHRvIGFwZXggb2YgcHlyYW1pZFxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgYXBleCwgICB2MSAjIGFuZCBiYWNrIGRvd24gYWdhaW5cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UgXCIje2l9XCIsIHYxLCB2MiAgIyBzYW1lIG9sZCBmbGFnLCBpZiBub24tblxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2MSA9IHYyICMgY3VycmVudCBiZWNvbWVzIHByZXZpb3VzXG4gIFxuICAgIGlmIG5vdCBmb3VuZEFueVxuICAgICAgICBrbG9nIFwiTm8gI3tufS1mb2xkIGNvbXBvbmVudHMgd2VyZSBmb3VuZC5cIlxuICBcbiAgICBmbGFnLnRvcG9seSBcImsje259I3twb2x5Lm5hbWV9XCJcblxuIyAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuXG4jIFRvcG9sb2dpY2FsIFwidHdlZW5cIiBiZXR3ZWVuIGEgcG9seWhlZHJvbiBhbmQgaXRzIGR1YWwgcG9seWhlZHJvbi5cblxuYW1ibyA9IChwb2x5KSAtPlxuICAgIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSgtMilcbiAgICAgICAgZm9yIHYzIGluIGZcbiAgICAgICAgICAgIGlmIHYxIDwgdjIgIyB2ZXJ0aWNlcyBhcmUgdGhlIG1pZHBvaW50cyBvZiBhbGwgZWRnZXMgb2Ygb3JpZ2luYWwgcG9seVxuICAgICAgICAgICAgICAgIGZsYWcudmVydCBtaWROYW1lKHYxLHYyKSwgbWlkcG9pbnQgcG9seS52ZXJ0aWNlc1t2MV0sIHBvbHkudmVydGljZXNbdjJdXG4gICAgICAgICAgICAjIGZhY2UgY29ycmVzcG9uZHMgdG8gdGhlIG9yaWdpbmFsIGZcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcIm9yaWcje2l9XCIgIG1pZE5hbWUodjEsdjIpLCBtaWROYW1lKHYyLHYzKVxuICAgICAgICAgICAgIyBmYWNlIGNvcnJlc3BvbmRzIHRvICh0aGUgdHJ1bmNhdGVkKSB2MlxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZHVhbCN7djJ9XCIgbWlkTmFtZSh2Mix2MyksIG1pZE5hbWUodjEsdjIpXG4gICAgICAgICAgICAjIHNoaWZ0IG92ZXIgb25lXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiYSN7cG9seS5uYW1lfVwiXG5cbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcblxuY2hhbWZlciA9IChwb2x5LCBmYWN0b3I9MC41KSAtPlxuICAgIFxuICAgIGZhY3RvciAgPSBjbGFtcCAwLjAwMSAwLjk5NSBmYWN0b3JcbiAgICBmbGFnICAgID0gbmV3IEZsYWcoKVxuICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIHdpbmdzICAgPSBwb2x5LndpbmdzKClcbiAgICAgICAgXG4gICAgbWluRWRnZUxlbmd0aCA9IEluZmluaXR5XG4gICAgXG4gICAgZm9yIGVkZ2UgaW4gd2luZ3NcbiAgICAgICAgZTAgPSBwb2x5LnZlcnRpY2VzW2VkZ2VbMF1dXG4gICAgICAgIGUxID0gcG9seS52ZXJ0aWNlc1tlZGdlWzFdXVxuICAgICAgICBlZCA9IHVuaXQgc3ViIGUxLCBlMFxuICAgICAgICBcbiAgICAgICAgbnIgPSB1bml0IHN1YiBwb2x5LnZlcnRpY2VzW2VkZ2VbMl0ubnJdLCBlMVxuICAgICAgICBwciA9IHVuaXQgc3ViIHBvbHkudmVydGljZXNbZWRnZVsyXS5wcl0sIGUwXG4gICAgICAgIGNyID0gcmF5UmF5IFtlMSwgbXVsdCAwLjUsIGFkZCBhZGQoZTEsIG5yKSwgc3ViKGUxLCBlZCldLFxuICAgICAgICAgICAgICAgICAgICBbZTAsIG11bHQgMC41LCBhZGQgYWRkKGUwLCBwciksIGFkZChlMCwgZWQpXVxuXG4gICAgICAgIGVsID0gbWFnIHN1YiBlMSwgcmF5UmF5IFtlMSwgYWRkKGUxLCBucildLCBbY3IsIGFkZChjciwgZWQpXVxuICAgICAgICBtaW5FZGdlTGVuZ3RoID0gbWluIG1pbkVkZ2VMZW5ndGgsIGVsXG5cbiAgICAgICAgZWwgPSBtYWcgc3ViIGUwLCByYXlSYXkgW2UwLCBhZGQoZTAsIHByKV0sIFtjciwgc3ViKGNyLCBlZCldXG4gICAgICAgIG1pbkVkZ2VMZW5ndGggPSBtaW4gbWluRWRnZUxlbmd0aCwgZWxcbiAgICAgICAgXG4gICAgbWluRWRnZUxlbmd0aCAqPSBmYWN0b3JcbiAgICAgICAgXG4gICAgbW92ZWQgPSB7fVxuICAgIGZvciBlZGdlIGluIHdpbmdzXG4gICAgICAgIGUwICA9IHBvbHkudmVydGljZXNbZWRnZVswXV1cbiAgICAgICAgZTEgID0gcG9seS52ZXJ0aWNlc1tlZGdlWzFdXVxuICAgICAgICByciA9IFtcbiAgICAgICAgICAgIGFkZChlMCwgbXVsdCBtaW5FZGdlTGVuZ3RoLCB1bml0IHN1YiBwb2x5LnZlcnRpY2VzW2VkZ2VbMl0ucHJdLCBlMCksXG4gICAgICAgICAgICBhZGQoZTEsIG11bHQgbWluRWRnZUxlbmd0aCwgdW5pdCBzdWIgcG9seS52ZXJ0aWNlc1tlZGdlWzJdLm5yXSwgZTEpXVxuICAgICAgICBsciA9IFtcbiAgICAgICAgICAgIGFkZChlMCwgbXVsdCBtaW5FZGdlTGVuZ3RoLCB1bml0IHN1YiBwb2x5LnZlcnRpY2VzW2VkZ2VbMl0ucGxdLCBlMCksXG4gICAgICAgICAgICBhZGQoZTEsIG11bHQgbWluRWRnZUxlbmd0aCwgdW5pdCBzdWIgcG9seS52ZXJ0aWNlc1tlZGdlWzJdLm5sXSwgZTEpXVxuICAgICAgICAgICAgXG4gICAgICAgIG1vdmVkW1wiI3tlZGdlWzFdfeKWuCN7ZWRnZVswXX1sXCJdID0gcnJcbiAgICAgICAgbW92ZWRbXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfXJcIl0gPSByclxuICAgICAgICBtb3ZlZFtcIiN7ZWRnZVsxXX3ilrgje2VkZ2VbMF19clwiXSA9IGxyXG4gICAgICAgIG1vdmVkW1wiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1sXCJdID0gbHJcbiAgICAgICAgICAgIFxuICAgIGZvciBlZGdlIGluIHdpbmdzXG4gICAgICAgIGUwICAgPSBwb2x5LnZlcnRpY2VzW2VkZ2VbMF1dXG4gICAgICAgIGUxICAgPSBwb2x5LnZlcnRpY2VzW2VkZ2VbMV1dXG4gICAgICAgIFxuICAgICAgICBuZiAgPSBcIiN7ZWRnZVswXX3ilrgje2VkZ2VbMV19XCIgXG4gICAgICAgIG5faCA9IFwiI3tlZGdlWzFdfVwiXG4gICAgICAgIG5fdCA9IFwiI3tlZGdlWzBdfVwiXG4gICAgICAgIFxuICAgICAgICBubnIgPSBcIiN7bl9ofeKWuCN7ZWRnZVsyXS5mcn1cIlxuICAgICAgICBubmwgPSBcIiN7bl9ofeKWuCN7ZWRnZVsyXS5mbH1cIlxuICAgICAgICBucHIgPSBcIiN7bl90feKWuCN7ZWRnZVsyXS5mcn1cIlxuICAgICAgICBucGwgPSBcIiN7bl90feKWuCN7ZWRnZVsyXS5mbH1cIiAgICAgICAgXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIG5yID0gcmF5UmF5IG1vdmVkW1wiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1yXCJdLCBtb3ZlZFtcIiN7ZWRnZVsxXX3ilrgje2VkZ2VbMl0ubnJ9clwiXVxuICAgICAgICBubCA9IHJheVJheSBtb3ZlZFtcIiN7ZWRnZVswXX3ilrgje2VkZ2VbMV19bFwiXSwgbW92ZWRbXCIje2VkZ2VbMV194pa4I3tlZGdlWzJdLm5sfWxcIl1cbiAgICAgICAgcHIgPSByYXlSYXkgbW92ZWRbXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfXJcIl0sIG1vdmVkW1wiI3tlZGdlWzJdLnByfeKWuCN7ZWRnZVswXX1yXCJdXG4gICAgICAgIHBsID0gcmF5UmF5IG1vdmVkW1wiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1sXCJdLCBtb3ZlZFtcIiN7ZWRnZVsyXS5wbH3ilrgje2VkZ2VbMF19bFwiXVxuICAgICAgICBcbiAgICAgICAgcG1pZCA9IG1pZHBvaW50IHBsLCBwclxuICAgICAgICBubWlkID0gbWlkcG9pbnQgbmwsIG5yXG4gICAgICAgIGNtaWQgPSBtaWRwb2ludCBwbWlkLCBubWlkXG4gICAgICAgIHBubSAgPSBjcm9zcyBzdWIocG1pZCxubWlkKSwgc3ViKHBsLHByKVxuXG4gICAgICAgIGhlYWQgPSByYXlQbGFuZSBbMCAwIDBdLCBlMSwgY21pZCwgcG5tXG4gICAgICAgIHRhaWwgPSByYXlQbGFuZSBbMCAwIDBdLCBlMCwgY21pZCwgcG5tXG4gICAgICAgIFxuICAgICAgICBmbGFnLnZlcnQgbl9oLCBoZWFkXG4gICAgICAgIGZsYWcudmVydCBuX3QsIHRhaWxcbiAgICAgICAgZmxhZy52ZXJ0IG5uciwgbnJcbiAgICAgICAgZmxhZy52ZXJ0IG5ubCwgbmxcbiAgICAgICAgZmxhZy52ZXJ0IG5wbCwgcGxcbiAgICAgICAgZmxhZy52ZXJ0IG5wciwgcHJcblxuICAgICAgICBmbGFnLmVkZ2UgbmYsIG5faCwgbm5yXG4gICAgICAgIGZsYWcuZWRnZSBuZiwgbm5yLCBucHJcbiAgICAgICAgZmxhZy5lZGdlIG5mLCBucHIsIG5fdFxuICAgICAgICBmbGFnLmVkZ2UgbmYsIG5fdCwgbnBsXG4gICAgICAgIGZsYWcuZWRnZSBuZiwgbnBsLCBubmxcbiAgICAgICAgZmxhZy5lZGdlIG5mLCBubmwsIG5faFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBmbGFnLmVkZ2UgXCIje2VkZ2VbMl0uZnJ9XCIgbnByLCBubnJcbiAgICAgICAgZmxhZy5lZGdlIFwiI3tlZGdlWzJdLmZsfVwiIG5ubCwgbnBsXG4gICAgICAgIFxuICAgIGZsYWcudG9wb2x5IFwiYyN7cG9seS5uYW1lfVwiXG5cbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICBcblxuIyBHeXJvIGZvbGxvd2VkIGJ5IHRydW5jYXRpb24gb2YgdmVydGljZXMgY2VudGVyZWQgb24gb3JpZ2luYWwgZmFjZXMuXG4jIFRoaXMgY3JlYXRlIDIgbmV3IGhleGFnb25zIGZvciBldmVyeSBvcmlnaW5hbCBlZGdlLlxuIyAoaHR0cHM6I2VuLndpa2lwZWRpYS5vcmcvd2lraS9Db253YXlfcG9seWhlZHJvbl9ub3RhdGlvbiNPcGVyYXRpb25zX29uX3BvbHloZWRyYSlcbiNcbiMgUG9zc2libGUgZXh0ZW5zaW9uOiB0YWtlIGEgcGFyYW1ldGVyIG4gdGhhdCBtZWFucyBvbmx5IHdoaXJsIG4tc2lkZWQgZmFjZXMuXG4jIElmIHdlIGRvIHRoYXQsIHRoZSBmbGFncyBtYXJrZWQgIyogYmVsb3cgd2lsbCBuZWVkIHRvIGhhdmUgdGhlaXIgb3RoZXIgc2lkZXNcbiMgZmlsbGVkIGluIG9uZSB3YXkgb3IgYW5vdGhlciwgZGVwZW5kaW5nIG9uIHdoZXRoZXIgdGhlIGFkamFjZW50IGZhY2UgaXNcbiMgd2hpcmxlZCBvciBub3QuXG5cbndoaXJsID0gKHBvbHksIG49MCkgLT5cblxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgdW5pdCBwb2x5LnZlcnRpY2VzW2ldXG5cbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlIC0yXG4gICAgICAgIGZvciBqIGluIFswLi4uZi5sZW5ndGhdXG4gICAgICAgICAgICB2ID0gZltqXVxuICAgICAgICAgICAgdjMgPSB2XG4gICAgICAgICAgICB2MV8yID0gb25lVGhpcmQgcG9seS52ZXJ0aWNlc1t2MV0sIHBvbHkudmVydGljZXNbdjJdXG4gICAgICAgICAgICBmbGFnLnZlcnQodjErXCJ+XCIrdjIsIHYxXzIpXG4gICAgICAgICAgICBjdjFuYW1lID0gXCJjZW50ZXIje2l9fiN7djF9XCJcbiAgICAgICAgICAgIGN2Mm5hbWUgPSBcImNlbnRlciN7aX1+I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy52ZXJ0IGN2MW5hbWUsIHVuaXQgb25lVGhpcmQgY2VudGVyc1tpXSwgdjFfMlxuICAgICAgICAgICAgZm5hbWUgPSBpK1wiZlwiK3YxXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIGN2MW5hbWUsICAgdjErXCJ+XCIrdjJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjErXCJ+XCIrdjIsIHYyK1wiflwiK3YxIFxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MitcIn5cIit2MSwgXCJ2I3t2Mn1cIiAgXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIFwidiN7djJ9XCIsICB2MitcIn5cIit2MyBcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjIrXCJ+XCIrdjMsIGN2Mm5hbWVcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgY3YybmFtZSwgICBjdjFuYW1lXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJjI3tpfVwiLCBjdjFuYW1lLCBjdjJuYW1lXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M10gIyBzaGlmdCBvdmVyIG9uZVxuICBcbiAgICBjYW5vbmljYWxpemUgZmxhZy50b3BvbHkgXCJ3I3twb2x5Lm5hbWV9XCJcblxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgIDAwMDAgICAgMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuXG5neXJvID0gKHBvbHkpIC0+XG5cbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXVxuICAgICAgICBmbGFnLnZlcnQgXCJ2I3tpfVwiIHVuaXQgcG9seS52ZXJ0aWNlc1tpXVxuXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgZmxhZy52ZXJ0IFwiY2VudGVyI3tpfVwiIHVuaXQgY2VudGVyc1tpXVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UoLTIpXG4gICAgICAgIGZvciBqIGluIFswLi4uZi5sZW5ndGhdXG4gICAgICAgICAgICB2ID0gZltqXVxuICAgICAgICAgICAgdjMgPSB2XG4gICAgICAgICAgICBmbGFnLnZlcnQgdjErXCJ+XCIrdjIsIG9uZVRoaXJkIHBvbHkudmVydGljZXNbdjFdLHBvbHkudmVydGljZXNbdjJdXG4gICAgICAgICAgICBmbmFtZSA9IGkrXCJmXCIrdjFcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgXCJjZW50ZXIje2l9XCIgIHYxK1wiflwiK3YyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYxK1wiflwiK3YyLCAgdjIrXCJ+XCIrdjFcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjIrXCJ+XCIrdjEsICBcInYje3YyfVwiXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIFwidiN7djJ9XCIgICAgIHYyK1wiflwiK3YzXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYyK1wiflwiK3YzLCAgXCJjZW50ZXIje2l9XCJcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M11cbiAgXG4gICAgY2Fub25pY2FsaXplIGZsYWcudG9wb2x5IFwiZyN7cG9seS5uYW1lfVwiXG4gICAgXG4jICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiMgMDAwIDAwIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuIyAgMDAwMDAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICBcblxucXVpbnRvID0gKHBvbHkpIC0+ICMgY3JlYXRlcyBhIHBlbnRhZ29uIGZvciBldmVyeSBwb2ludCBpbiB0aGUgb3JpZ2luYWwgZmFjZSwgYXMgd2VsbCBhcyBvbmUgbmV3IGluc2V0IGZhY2UuXG4gICAgXG4gICAgIyBrbG9nIFwicXVpbnRvIG9mICN7cG9seS5uYW1lfVwiXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgIyBGb3IgZWFjaCBmYWNlIGYgaW4gdGhlIG9yaWdpbmFsIHBvbHlcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBjZW50cm9pZCA9IGNhbGNDZW50cm9pZCBmLm1hcCAoaWR4KSAtPiBwb2x5LnZlcnRpY2VzW2lkeF1cbiAgICAgICAgIyB3YWxrIG92ZXIgZmFjZSB2ZXJ0ZXgtdHJpcGxldHNcbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlIC0yXG4gICAgICAgIGZvciB2MyBpbiBmXG4gICAgICAgICAgICAjIGZvciBlYWNoIGZhY2UtY29ybmVyLCB3ZSBtYWtlIHR3byBuZXcgcG9pbnRzOlxuICAgICAgICAgICAgbWlkcHQgPSBtaWRwb2ludCBwb2x5LnZlcnRpY2VzW3YxXSwgcG9seS52ZXJ0aWNlc1t2Ml1cbiAgICAgICAgICAgIGlubmVycHQgPSBtaWRwb2ludCBtaWRwdCwgY2VudHJvaWRcbiAgICAgICAgICAgIGZsYWcudmVydCBtaWROYW1lKHYxLHYyKSwgbWlkcHRcbiAgICAgICAgICAgIGZsYWcudmVydCBcImlubmVyXyN7aX1fXCIgKyBtaWROYW1lKHYxLHYyKSwgaW5uZXJwdFxuICAgICAgICAgICAgIyBhbmQgYWRkIHRoZSBvbGQgY29ybmVyLXZlcnRleFxuICAgICAgICAgICAgZmxhZy52ZXJ0IFwiI3t2Mn1cIiBwb2x5LnZlcnRpY2VzW3YyXVxuICAgICAgICAgIFxuICAgICAgICAgICAgIyBwZW50YWdvbiBmb3IgZWFjaCB2ZXJ0ZXggaW4gb3JpZ2luYWwgZmFjZVxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7aX1fI3t2Mn1cIiwgXCJpbm5lcl8je2l9X1wiK21pZE5hbWUodjEsIHYyKSwgbWlkTmFtZSh2MSwgdjIpXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfV8je3YyfVwiLCBtaWROYW1lKHYxLCB2MiksIFwiI3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7aX1fI3t2Mn1cIiwgXCIje3YyfVwiLCBtaWROYW1lKHYyLCB2MylcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9XyN7djJ9XCIsIG1pZE5hbWUodjIsIHYzKSwgXCJpbm5lcl8je2l9X1wiK21pZE5hbWUodjIsIHYzKVxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7aX1fI3t2Mn1cIiwgXCJpbm5lcl8je2l9X1wiK21pZE5hbWUodjIsIHYzKSwgXCJpbm5lcl8je2l9X1wiK21pZE5hbWUodjEsIHYyKVxuICAgICAgXG4gICAgICAgICAgICAjIGlubmVyIHJvdGF0ZWQgZmFjZSBvZiBzYW1lIHZlcnRleC1udW1iZXIgYXMgb3JpZ2luYWxcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImZfaW5fI3tpfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpXG4gICAgICBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M10gIyBzaGlmdCBvdmVyIG9uZVxuICBcbiAgICBmbGFnLnRvcG9seSBcInEje3BvbHkubmFtZX1cIlxuXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMFxuIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICBcbiMgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgXG4jIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAwMDAgICBcblxuaW5zZXQgPSAocG9seSwgaW5zZXQ9MC41LCBwb3BvdXQ9LTAuMiwgbj0wKSAtPlxuICBcbiAgICBpbnNldCA9IGNsYW1wIDAuMjUgMC45OSBpbnNldFxuICAgIHBvcG91dCA9IG1pbiBwb3BvdXQsIGluc2V0XG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXVxuICAgICAgICBwID0gcG9seS52ZXJ0aWNlc1tpXVxuICAgICAgICBmbGFnLnZlcnQgXCJ2I3tpfVwiIHBcblxuICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICAgICAgZmxhZy52ZXJ0IFwiZiN7aX12I3t2fVwiIGFkZCB0d2Vlbihwb2x5LnZlcnRpY2VzW3ZdLGNlbnRlcnNbaV0saW5zZXQpLCBtdWx0KHBvcG91dCxub3JtYWxzW2ldKVxuICBcbiAgICBmb3VuZEFueSA9IGZhbHNlICMgYWxlcnQgaWYgZG9uJ3QgZmluZCBhbnlcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MiA9IFwidiN7dn1cIjtcbiAgICAgICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICAgICAgZm91bmRBbnkgPSB0cnVlXG4gICAgICAgICAgICAgICAgZm5hbWUgPSBpICsgdjFcbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UoZm5hbWUsICAgICAgdjEsICAgICAgIHYyKVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZShmbmFtZSwgICAgICB2MiwgICAgICAgXCJmI3tpfSN7djJ9XCIpXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlKGZuYW1lLCBcImYje2l9I3t2Mn1cIiwgIFwiZiN7aX0je3YxfVwiKVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZShmbmFtZSwgXCJmI3tpfSN7djF9XCIsICB2MSlcbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UoXCJleCN7aX1cIiwgXCJmI3tpfSN7djF9XCIsICBcImYje2l9I3t2Mn1cIilcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UoaSwgdjEsIHYyKSAgXG4gICAgICAgICAgICB2MT12MlxuICBcbiAgICBpZiBub3QgZm91bmRBbnlcbiAgICAgICAga2xvZyBcIk5vICN7bn0tZm9sZCBjb21wb25lbnRzIHdlcmUgZm91bmQuXCJcbiAgXG4gICAgZmxhZy50b3BvbHkgXCJuI3tufSN7cG9seS5uYW1lfVwiXG5cbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG5cbmV4dHJ1ZGUgPSAocG9seSwgcG9wb3V0PTEsIGluc2V0Zj0wLjUsIG49MCkgLT5cbiAgICBuZXdwb2x5ID0gaW5zZXQgcG9seSwgaW5zZXRmLCBwb3BvdXQsIG5cbiAgICBuZXdwb2x5Lm5hbWUgPSBcIngje259I3twb2x5Lm5hbWV9XCJcbiAgICBuZXdwb2x5XG5cbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICBcblxuaG9sbG93ID0gKHBvbHksIGluc2V0ZiwgdGhpY2tuZXNzKSAtPlxuXG4gICAgaW5zZXRmID89IDAuNVxuICAgIGluc2V0ZiAgPSBjbGFtcCAwLjEgMC45IGluc2V0ZlxuICAgIHRoaWNrbmVzcyA/PSBpbnNldGYqMi8zXG4gICAgdGhpY2tuZXNzID0gbWluIGluc2V0ZioyLzMsIHRoaWNrbmVzc1xuICBcbiAgICBkdWFsbm9ybWFscyA9IGR1YWwocG9seSkubm9ybWFscygpXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgcCA9IHBvbHkudmVydGljZXNbaV1cbiAgICAgICAgZmxhZy52ZXJ0IFwidiN7aX1cIiBwXG4gICAgICAgIGZsYWcudmVydCBcImRvd252I3tpfVwiIGFkZCBwLCBtdWx0IC0xKnRoaWNrbmVzcyxkdWFsbm9ybWFsc1tpXVxuXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgZmxhZy52ZXJ0IFwiZmluI3tpfXYje3Z9XCIgdHdlZW4gcG9seS52ZXJ0aWNlc1t2XSwgY2VudGVyc1tpXSwgaW5zZXRmXG4gICAgICAgICAgICBmbGFnLnZlcnQgXCJmaW5kb3duI3tpfXYje3Z9XCIgYWRkIHR3ZWVuKHBvbHkudmVydGljZXNbdl0sY2VudGVyc1tpXSxpbnNldGYpLCBtdWx0KC0xKnRoaWNrbmVzcyxub3JtYWxzW2ldKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MiA9IFwidiN7dn1cIlxuICAgICAgICAgICAgZm5hbWUgPSBpICsgdjFcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjEsICAgICAgICAgICAgdjJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjIsICAgICAgICAgICAgXCJmaW4je2l9I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBcImZpbiN7aX0je3YyfVwiIFwiZmluI3tpfSN7djF9XCJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgXCJmaW4je2l9I3t2MX1cIiB2MVxuICAgICAgXG4gICAgICAgICAgICBmbmFtZSA9IFwic2lkZXMje2l9I3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBcImZpbiN7aX0je3YxfVwiICAgICBcImZpbiN7aX0je3YyfVwiXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIFwiZmluI3tpfSN7djJ9XCIgICAgIFwiZmluZG93biN7aX0je3YyfVwiXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIFwiZmluZG93biN7aX0je3YyfVwiIFwiZmluZG93biN7aX0je3YxfVwiXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIFwiZmluZG93biN7aX0je3YxfVwiIFwiZmluI3tpfSN7djF9XCJcbiAgICAgIFxuICAgICAgICAgICAgZm5hbWUgPSBcImJvdHRvbSN7aX0je3YxfVwiXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsICBcImRvd24je3YyfVwiICAgICAgICBcImRvd24je3YxfVwiXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsICBcImRvd24je3YxfVwiICAgICAgICBcImZpbmRvd24je2l9I3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCAgXCJmaW5kb3duI3tpfSN7djF9XCIgXCJmaW5kb3duI3tpfSN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgIFwiZmluZG93biN7aX0je3YyfVwiIFwiZG93biN7djJ9XCJcbiAgICAgIFxuICAgICAgICAgICAgdjEgPSB2MlxuICBcbiAgICBmbGFnLnRvcG9seSBcIkgje3BvbHkubmFtZX1cIlxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMDAwXG4jIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcbiMgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMCAgICAgIDAwMCAgIDAwMFxuXG5wZXJzcGVjdGl2YSA9IChwb2x5KSAtPiAjIGFuIG9wZXJhdGlvbiByZXZlcnNlLWVuZ2luZWVyZWQgZnJvbSBQZXJzcGVjdGl2YSBDb3Jwb3J1bSBSZWd1bGFyaXVtXG5cbiAgICAjIGtsb2cgXCJzdGVsbGEgb2YgI3twb2x5Lm5hbWV9XCJcbiAgXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpICMgY2FsY3VsYXRlIGZhY2UgY2VudGVyc1xuICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgcG9seS52ZXJ0aWNlc1tpXVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBcbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMl19XCJcbiAgICAgICAgdjIgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgdmVydDEgPSBwb2x5LnZlcnRpY2VzW2ZbZi5sZW5ndGgtMl1dXG4gICAgICAgIHZlcnQyID0gcG9seS52ZXJ0aWNlc1tmW2YubGVuZ3RoLTFdXVxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MyA9IFwidiN7dn1cIlxuICAgICAgICAgICAgdmVydDMgPSBwb2x5LnZlcnRpY2VzW3ZdXG4gICAgICAgICAgICB2MTIgPSB2MStcIn5cIit2MlxuICAgICAgICAgICAgdjIxID0gdjIrXCJ+XCIrdjFcbiAgICAgICAgICAgIHYyMyA9IHYyK1wiflwiK3YzXG4gICAgICBcbiAgICAgICAgICAgICMgb24gZWFjaCBOZmFjZSwgTiBuZXcgcG9pbnRzIGluc2V0IGZyb20gZWRnZSBtaWRwb2ludHMgdG93YXJkcyBjZW50ZXIgPSBcInN0ZWxsYXRlZFwiIHBvaW50c1xuICAgICAgICAgICAgZmxhZy52ZXJ0IHYxMiwgbWlkcG9pbnQgbWlkcG9pbnQodmVydDEsdmVydDIpLCBjZW50ZXJzW2ldIFxuICAgICAgXG4gICAgICAgICAgICAjIGluc2V0IE5mYWNlIG1hZGUgb2YgbmV3LCBzdGVsbGF0ZWQgcG9pbnRzXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJpbiN7aX1cIiB2MTIsIHYyM1xuICAgICAgXG4gICAgICAgICAgICAjIG5ldyB0cmkgZmFjZSBjb25zdGl0dXRpbmcgdGhlIHJlbWFpbmRlciBvZiB0aGUgc3RlbGxhdGVkIE5mYWNlXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfSN7djJ9XCIgdjIzLCB2MTJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9I3t2Mn1cIiB2MTIsIHYyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfSN7djJ9XCIgdjIsICB2MjNcbiAgICAgIFxuICAgICAgICAgICAgIyBvbmUgb2YgdGhlIHR3byBuZXcgdHJpYW5nbGVzIHJlcGxhY2luZyBvbGQgZWRnZSBiZXR3ZWVuIHYxLT52MlxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7djEyfVwiIHYxLCAgdjIxXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3t2MTJ9XCIgdjIxLCB2MTJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje3YxMn1cIiB2MTIsIHYxXG4gICAgICBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M10gICMgY3VycmVudCBiZWNvbWVzIHByZXZpb3VzXG4gICAgICAgICAgICBbdmVydDEsIHZlcnQyXSA9IFt2ZXJ0MiwgdmVydDNdXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiUCN7cG9seS5uYW1lfVwiXG5cbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcblxudHJpc3ViID0gKHBvbHksIG49MikgLT5cbiAgICBcbiAgICAjIE5vLU9wIGZvciBub24tdHJpYW5ndWxhciBtZXNoZXNcbiAgICBmb3IgZm4gaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgaWYgcG9seS5mYWNlc1tmbl0ubGVuZ3RoICE9IDNcbiAgICAgICAgICAgIHJldHVybiBwb2x5XG4gIFxuICAgIHZlcnRzID0gW11cbiAgICB2bWFwID0ge31cbiAgICBwb3MgPSAwXG4gICAgZm9yIGZuIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ZuXVxuICAgICAgICBbaTEsIGkyLCBpM10gPSBmLnNsaWNlIC0zXG4gICAgICAgIHYxID0gcG9seS52ZXJ0aWNlc1tpMV1cbiAgICAgICAgdjIgPSBwb2x5LnZlcnRpY2VzW2kyXVxuICAgICAgICB2MyA9IHBvbHkudmVydGljZXNbaTNdXG4gICAgICAgIHYyMSA9IHN1YiB2MiwgdjFcbiAgICAgICAgdjMxID0gc3ViIHYzLCB2MVxuICAgICAgICBmb3IgaSBpbiBbMC4ubl1cbiAgICAgICAgICAgIGZvciBqIGluIFswLi5uLWldXG4gICAgICAgICAgICAgICAgdiA9IGFkZCBhZGQodjEsIG11bHQoaS9uLCB2MjEpKSwgbXVsdChqL24sIHYzMSlcbiAgICAgICAgICAgICAgICB2bWFwW1widiN7Zm59LSN7aX0tI3tqfVwiXSA9IHBvcysrXG4gICAgICAgICAgICAgICAgdmVydHMucHVzaCB2XG4gIFxuICAgIEVQU0lMT05fQ0xPU0UgPSAxLjBlLThcbiAgICB1bmlxVnMgPSBbXVxuICAgIG5ld3BvcyA9IDBcbiAgICB1bmlxbWFwID0ge31cbiAgICBmb3IgdixpIGluIHZlcnRzXG4gICAgICAgIGlmIGkgaW4gdW5pcW1hcCB0aGVuIGNvbnRpbnVlICMgYWxyZWFkeSBtYXBwZWRcbiAgICAgICAgdW5pcW1hcFtpXSA9IG5ld3Bvc1xuICAgICAgICB1bmlxVnMucHVzaCB2XG4gICAgICAgIGZvciBqIGluIFtpKzEuLi52ZXJ0cy5sZW5ndGhdXG4gICAgICAgICAgICB3ID0gdmVydHNbal1cbiAgICAgICAgICAgIGlmIG1hZyhzdWIodiwgdykpIDwgRVBTSUxPTl9DTE9TRVxuICAgICAgICAgICAgICAgIHVuaXFtYXBbal0gPSBuZXdwb3NcbiAgICAgICAgbmV3cG9zKytcbiAgXG4gICAgZmFjZXMgPSBbXVxuICAgIGZvciBmbiBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmb3IgaSBpbiBbMC4uLm5dXG4gICAgICAgICAgICBmb3IgaiBpbiBbMC4uLm4taV1cbiAgICAgICAgICAgICAgICBmYWNlcy5wdXNoIFt1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2p9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aSsxfS0je2p9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqKzF9XCJdXV1cbiAgICAgICAgZm9yIGkgaW4gWzEuLi5uXVxuICAgICAgICAgICAgZm9yIGogaW4gWzAuLi5uLWldXG4gICAgICAgICAgICAgICAgZmFjZXMucHVzaCBbdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2l9LSN7aisxfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2ktMX0tI3tqKzF9XCJdXV1cbiAgXG4gICAgIyBrbG9nICdmYWNlcycgZmFjZXNcbiAgICAjIGtsb2cgJ3ZlcnRpY2VzJyB1bmlxVnMgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgXG4gICAgbmV3IFBvbHloZWRyb24gXCJ1I3tufSN7cG9seS5uYW1lfVwiIGZhY2VzLCB1bmlxVnNcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG4jIFNsb3cgQ2Fub25pY2FsaXphdGlvbiBBbGdvcml0aG1cbiNcbiMgVGhpcyBhbGdvcml0aG0gaGFzIHNvbWUgY29udmVyZ2VuY2UgcHJvYmxlbXMsIHdoYXQgcmVhbGx5IG5lZWRzIHRvIGJlIGRvbmUgaXMgdG9cbiMgc3VtIHRoZSB0aHJlZSBmb3JjaW5nIGZhY3RvcnMgdG9nZXRoZXIgYXMgYSBjb25oZXJlbnQgZm9yY2UgYW5kIHRvIHVzZSBhIGhhbGYtZGVjZW50XG4jIGludGVncmF0b3IgdG8gbWFrZSBzdXJlIHRoYXQgaXQgY29udmVyZ2VzIHdlbGwgYXMgb3Bwb3NlZCB0byB0aGUgY3VycmVudCBoYWNrIG9mXG4jIGFkLWhvYyBzdGFiaWxpdHkgbXVsdGlwbGllcnMuICBJZGVhbGx5IG9uZSB3b3VsZCBpbXBsZW1lbnQgYSBjb25qdWdhdGUgZ3JhZGllbnRcbiMgZGVzY2VudCBvciBzaW1pbGFyIHByZXR0eSB0aGluZy5cbiNcbiMgT25seSB0cnkgdG8gdXNlIHRoaXMgb24gY29udmV4IHBvbHloZWRyYSB0aGF0IGhhdmUgYSBjaGFuY2Ugb2YgYmVpbmcgY2Fub25pY2FsaXplZCxcbiMgb3RoZXJ3aXNlIGl0IHdpbGwgcHJvYmFibHkgYmxvdyB1cCB0aGUgZ2VvbWV0cnkuICBBIG11Y2ggdHJpY2tpZXIgLyBzbWFydGVyIHNlZWQtc3ltbWV0cnlcbiMgYmFzZWQgZ2VvbWV0cmljYWwgcmVndWxhcml6ZXIgc2hvdWxkIGJlIHVzZWQgZm9yIGZhbmNpZXIvd2VpcmRlciBwb2x5aGVkcmEuXG5cbmNhbm9uaWNhbGl6ZSA9IChwb2x5LCBpdGVyPTIwMCkgLT5cblxuICAgICMga2xvZyBcImNhbm9uaWNhbGl6ZSAje3BvbHkubmFtZX1cIlxuICAgIGZhY2VzID0gcG9seS5mYWNlc1xuICAgIGVkZ2VzID0gcG9seS5lZGdlcygpXG4gICAgdmVydHMgPSBwb2x5LnZlcnRpY2VzXG4gICAgbWF4Q2hhbmdlID0gMS4wICMgY29udmVyZ2VuY2UgdHJhY2tlclxuICAgIGZvciBpIGluIFswLi5pdGVyXVxuICAgICAgICBvbGRWcyA9IGNvcHlWZWNBcnJheSB2ZXJ0c1xuICAgICAgICB2ZXJ0cyA9IHRhbmdlbnRpZnkgdmVydHMsIGVkZ2VzXG4gICAgICAgIHZlcnRzID0gcmVjZW50ZXIgdmVydHMsIGVkZ2VzXG4gICAgICAgIHZlcnRzID0gcGxhbmFyaXplIHZlcnRzLCBmYWNlc1xuICAgICAgICBtYXhDaGFuZ2UgPSBfLm1heCBfLm1hcCBfLnppcCh2ZXJ0cywgb2xkVnMpLCAoW3gsIHldKSAtPiBtYWcgc3ViIHgsIHlcbiAgICAgICAgaWYgbWF4Q2hhbmdlIDwgMWUtOFxuICAgICAgICAgICAgYnJlYWtcbiAgICAjIG9uZSBzaG91bGQgbm93IHJlc2NhbGUsIGJ1dCBub3QgcmVzY2FsaW5nIGhlcmUgbWFrZXMgZm9yIHZlcnkgaW50ZXJlc3RpbmcgbnVtZXJpY2FsXG4gICAgIyBpbnN0YWJpbGl0aWVzIHRoYXQgbWFrZSBpbnRlcmVzdGluZyBtdXRhbnRzIG9uIG11bHRpcGxlIGFwcGxpY2F0aW9ucy4uLlxuICAgICMgbW9yZSBleHBlcmllbmNlIHdpbGwgdGVsbCB3aGF0IHRvIGRvXG4gICAgdmVydHMgPSByZXNjYWxlKHZlcnRzKVxuICAgICMga2xvZyBcIltjYW5vbmljYWxpemF0aW9uIGRvbmUsIGxhc3QgfGRlbHRhVnw9I3ttYXhDaGFuZ2V9XVwiXG4gICAgbmV3cG9seSA9IG5ldyBQb2x5aGVkcm9uIHBvbHkubmFtZSwgcG9seS5mYWNlcywgdmVydHNcbiAgICAjIGtsb2cgXCJjYW5vbmljYWxpemVcIiBuZXdwb2x5XG4gICAgbmV3cG9seVxuICAgIFxuY2Fub25pY2FsWFlaID0gKHBvbHksIGl0ZXJhdGlvbnMpIC0+XG5cbiAgICBpdGVyYXRpb25zID89IDFcbiAgICBkcG9seSA9IGR1YWwgcG9seVxuICAgICMga2xvZyBcImNhbm9uaWNhbFhZWiAje3BvbHkubmFtZX1cIlxuICBcbiAgICBmb3IgY291bnQgaW4gWzAuLi5pdGVyYXRpb25zXSAjIHJlY2lwcm9jYXRlIGZhY2Ugbm9ybWFsc1xuICAgICAgICBkcG9seS52ZXJ0aWNlcyA9IHJlY2lwcm9jYWxOIHBvbHlcbiAgICAgICAgcG9seS52ZXJ0aWNlcyAgPSByZWNpcHJvY2FsTiBkcG9seVxuICBcbiAgICBuZXcgUG9seWhlZHJvbiBwb2x5Lm5hbWUsIHBvbHkuZmFjZXMsIHBvbHkudmVydGljZXNcblxuZmxhdHRlbiA9IChwb2x5LCBpdGVyYXRpb25zKSAtPiAjIHF1aWNrIHBsYW5hcml6YXRpb25cbiAgICBcbiAgICBpdGVyYXRpb25zID89IDFcbiAgICBkcG9seSA9IGR1YWwgcG9seSAjIHYncyBvZiBkdWFsIGFyZSBpbiBvcmRlciBvZiBhcmcncyBmJ3NcbiAgICAjIGtsb2cgXCJmbGF0dGVuICN7cG9seS5uYW1lfVwiXG4gIFxuICAgIGZvciBjb3VudCBpbiBbMC4uLml0ZXJhdGlvbnNdICMgcmVjaXByb2NhdGUgZmFjZSBjZW50ZXJzXG4gICAgICAgIGRwb2x5LnZlcnRpY2VzID0gcmVjaXByb2NhbEMgcG9seVxuICAgICAgICBwb2x5LnZlcnRpY2VzICA9IHJlY2lwcm9jYWxDIGRwb2x5XG4gIFxuICAgIG5ldyBQb2x5aGVkcm9uIHBvbHkubmFtZSwgcG9seS5mYWNlcywgcG9seS52ZXJ0aWNlc1xuICAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICBcbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgICBkdWFsOiAgICAgICAgICAgZHVhbFxuICAgIHRyaXN1YjogICAgICAgICB0cmlzdWJcbiAgICBwZXJzcGVjdGl2YTogICAgcGVyc3BlY3RpdmFcbiAgICBraXM6ICAgICAgICAgICAga2lzXG4gICAgYW1ibzogICAgICAgICAgIGFtYm9cbiAgICBneXJvOiAgICAgICAgICAgZ3lyb1xuICAgIGNoYW1mZXI6ICAgICAgICBjaGFtZmVyXG4gICAgd2hpcmw6ICAgICAgICAgIHdoaXJsXG4gICAgcXVpbnRvOiAgICAgICAgIHF1aW50b1xuICAgIGluc2V0OiAgICAgICAgICBpbnNldFxuICAgIGV4dHJ1ZGU6ICAgICAgICBleHRydWRlXG4gICAgaG9sbG93OiAgICAgICAgIGhvbGxvd1xuICAgIGZsYXR0ZW46ICAgICAgICBmbGF0dGVuXG4gICAgemlya3VsYXJpemU6ICAgIHppcmt1bGFyaXplXG4gICAgY2Fub25pY2FsaXplOiAgIGNhbm9uaWNhbGl6ZVxuICAgIGNhbm9uaWNhbFhZWjogICBjYW5vbmljYWxYWVpcbiAgICAiXX0=
//# sourceURL=../../coffee/poly/topo.coffee