// koffee 1.6.0

/*
000000000   0000000   00000000    0000000     
   000     000   000  000   000  000   000    
   000     000   000  00000000   000   000    
   000     000   000  000        000   000    
   000      0000000   000         0000000
 */
var Flag, Polyhedron, _, abs, acos, add, ambo, calcCentroid, canonicalXYZ, canonicalize, chamfer, clamp, copyVecArray, cross, dot, dual, extrude, flatten, gyro, hollow, inset, intersect, kis, klog, mag, midName, midpoint, min, mult, neg, oneThird, perspectiva, planarize, pointPlaneDist, quinto, rayPlane, rayRay, recenter, reciprocalC, reciprocalN, ref, ref1, ref2, rescale, rotate, sub, tangentify, trisub, tween, unit, whirl, zirkularize,
    indexOf = [].indexOf;

ref = require('kxk'), clamp = ref.clamp, klog = ref.klog, _ = ref._;

ref1 = require('./math'), dot = ref1.dot, add = ref1.add, neg = ref1.neg, mult = ref1.mult, mag = ref1.mag, sub = ref1.sub, unit = ref1.unit, cross = ref1.cross, rotate = ref1.rotate, oneThird = ref1.oneThird, tween = ref1.tween, intersect = ref1.intersect, rayRay = ref1.rayRay, rayPlane = ref1.rayPlane, pointPlaneDist = ref1.pointPlaneDist, midpoint = ref1.midpoint, calcCentroid = ref1.calcCentroid, copyVecArray = ref1.copyVecArray;

ref2 = require('./geo'), tangentify = ref2.tangentify, reciprocalC = ref2.reciprocalC, reciprocalN = ref2.reciprocalN, recenter = ref2.recenter, rescale = ref2.rescale, planarize = ref2.planarize;

min = Math.min, abs = Math.abs, acos = Math.acos;

Flag = require('./flag');

Polyhedron = require('./polyhedron');

midName = function(v1, v2) {
    return v1 < v2 && (v1 + "_" + v2) || (v2 + "_" + v1);
};

zirkularize = function(poly, n) {
    var f, i, l, len, m, m12, m32, nc, o, pn, r, ref3, ref4, ref5, ref6, results, u12, u32, v1, v12, v2, v3, v32, vertices, verts;
    if (n != null) {
        n;
    } else {
        n = 0;
    }
    vertices = [];
    for (i = l = 0, ref3 = poly.faces.length; 0 <= ref3 ? l < ref3 : l > ref3; i = 0 <= ref3 ? ++l : --l) {
        f = poly.faces[i];
        if (f.length === n || n === 0) {
            ref4 = f.slice(-2), v1 = ref4[0], v2 = ref4[1];
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
                ref5 = [v2, v3], v1 = ref5[0], v2 = ref5[1];
            }
        }
    }
    verts = (function() {
        results = [];
        for (var o = 0, ref6 = poly.vertices.length; 0 <= ref6 ? o < ref6 : o > ref6; 0 <= ref6 ? o++ : o--){ results.push(o); }
        return results;
    }).apply(this).map(function(i) {
        var ref6;
        return (ref6 = vertices[i]) != null ? ref6 : poly.vertices[i];
    });
    return new Polyhedron("z" + poly.name, poly.faces, verts);
};

dual = function(poly) {
    var centers, dpoly, f, face, flag, i, k, l, len, len1, len2, m, o, q, ref3, ref4, ref5, ref6, ref7, s, sortF, t, u, v1, v2;
    flag = new Flag();
    face = [];
    for (i = l = 0, ref3 = poly.vertices.length; 0 <= ref3 ? l < ref3 : l > ref3; i = 0 <= ref3 ? ++l : --l) {
        face[i] = {};
    }
    for (i = m = 0, ref4 = poly.faces.length; 0 <= ref4 ? m < ref4 : m > ref4; i = 0 <= ref4 ? ++m : --m) {
        f = poly.faces[i];
        v1 = f[f.length - 1];
        for (o = 0, len = f.length; o < len; o++) {
            v2 = f[o];
            face[v1]["v" + v2] = "" + i;
            v1 = v2;
        }
    }
    centers = poly.centers();
    for (i = q = 0, ref5 = poly.faces.length; 0 <= ref5 ? q < ref5 : q > ref5; i = 0 <= ref5 ? ++q : --q) {
        flag.newV("" + i, centers[i]);
    }
    for (i = s = 0, ref6 = poly.faces.length; 0 <= ref6 ? s < ref6 : s > ref6; i = 0 <= ref6 ? ++s : --s) {
        f = poly.faces[i];
        v1 = f[f.length - 1];
        for (t = 0, len1 = f.length; t < len1; t++) {
            v2 = f[t];
            flag.newFlag(v1, face[v2]["v" + v1], "" + i);
            v1 = v2;
        }
    }
    dpoly = flag.topoly();
    sortF = [];
    ref7 = dpoly.faces;
    for (u = 0, len2 = ref7.length; u < len2; u++) {
        f = ref7[u];
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
    var apex, centers, f, flag, fname, foundAny, i, l, len, m, normals, o, p, ref3, ref4, v, v1, v2;
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
    for (i = l = 0, ref3 = poly.vertices.length; 0 <= ref3 ? l < ref3 : l > ref3; i = 0 <= ref3 ? ++l : --l) {
        p = poly.vertices[i];
        flag.newV("v" + i, p);
    }
    normals = poly.normals();
    centers = poly.centers();
    foundAny = false;
    for (i = m = 0, ref4 = poly.faces.length; 0 <= ref4 ? m < ref4 : m > ref4; i = 0 <= ref4 ? ++m : --m) {
        f = poly.faces[i];
        v1 = "v" + f[f.length - 1];
        for (o = 0, len = f.length; o < len; o++) {
            v = f[o];
            v2 = "v" + v;
            if (f.length === n || n === 0) {
                foundAny = true;
                apex = "apex" + i;
                fname = "" + i + v1;
                flag.newV(apex, add(centers[i], mult(apexdist, normals[i])));
                flag.newFlag(fname, v1, v2);
                flag.newFlag(fname, v2, apex);
                flag.newFlag(fname, apex, v1);
            } else {
                flag.newFlag("" + i, v1, v2);
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
    var f, flag, i, l, len, m, ref3, ref4, ref5, v1, v2, v3;
    flag = new Flag();
    for (i = l = 0, ref3 = poly.faces.length; 0 <= ref3 ? l < ref3 : l > ref3; i = 0 <= ref3 ? ++l : --l) {
        f = poly.faces[i];
        ref4 = f.slice(-2), v1 = ref4[0], v2 = ref4[1];
        for (m = 0, len = f.length; m < len; m++) {
            v3 = f[m];
            if (v1 < v2) {
                flag.newV(midName(v1, v2), midpoint(poly.vertices[v1], poly.vertices[v2]));
            }
            flag.newFlag("orig" + i, midName(v1, v2), midName(v2, v3));
            flag.newFlag("dual" + v2, midName(v2, v3), midName(v1, v2));
            ref5 = [v2, v3], v1 = ref5[0], v2 = ref5[1];
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
        flag.newV(n_h, head);
        flag.newV(n_t, tail);
        flag.newV(nnr, nr);
        flag.newV(nnl, nl);
        flag.newV(npl, pl);
        flag.newV(npr, pr);
        flag.newFlag(nf, n_h, nnr);
        flag.newFlag(nf, nnr, npr);
        flag.newFlag(nf, npr, n_t);
        flag.newFlag(nf, n_t, npl);
        flag.newFlag(nf, npl, nnl);
        flag.newFlag(nf, nnl, n_h);
        flag.newFlag("" + edge[2].fr, npr, nnr);
        flag.newFlag("" + edge[2].fl, nnl, npl);
    }
    return flag.topoly("c" + poly.name);
};

whirl = function(poly, n) {
    var centers, cv1name, cv2name, f, flag, fname, i, j, l, m, o, ref3, ref4, ref5, ref6, ref7, v, v1, v1_2, v2, v3;
    if (n == null) {
        n = 0;
    }
    flag = new Flag();
    for (i = l = 0, ref3 = poly.vertices.length; 0 <= ref3 ? l < ref3 : l > ref3; i = 0 <= ref3 ? ++l : --l) {
        flag.newV("v" + i, unit(poly.vertices[i]));
    }
    centers = poly.centers();
    for (i = m = 0, ref4 = poly.faces.length; 0 <= ref4 ? m < ref4 : m > ref4; i = 0 <= ref4 ? ++m : --m) {
        f = poly.faces[i];
        ref5 = f.slice(-2), v1 = ref5[0], v2 = ref5[1];
        for (j = o = 0, ref6 = f.length; 0 <= ref6 ? o < ref6 : o > ref6; j = 0 <= ref6 ? ++o : --o) {
            v = f[j];
            v3 = v;
            v1_2 = oneThird(poly.vertices[v1], poly.vertices[v2]);
            flag.newV(v1 + "~" + v2, v1_2);
            cv1name = "center" + i + "~" + v1;
            cv2name = "center" + i + "~" + v2;
            flag.newV(cv1name, unit(oneThird(centers[i], v1_2)));
            fname = i + "f" + v1;
            flag.newFlag(fname, cv1name, v1 + "~" + v2);
            flag.newFlag(fname, v1 + "~" + v2, v2 + "~" + v1);
            flag.newFlag(fname, v2 + "~" + v1, "v" + v2);
            flag.newFlag(fname, "v" + v2, v2 + "~" + v3);
            flag.newFlag(fname, v2 + "~" + v3, cv2name);
            flag.newFlag(fname, cv2name, cv1name);
            flag.newFlag("c" + i, cv1name, cv2name);
            ref7 = [v2, v3], v1 = ref7[0], v2 = ref7[1];
        }
    }
    return canonicalize(flag.topoly("w" + poly.name));
};

gyro = function(poly) {
    var centers, f, flag, fname, i, j, l, m, o, q, ref3, ref4, ref5, ref6, ref7, ref8, v, v1, v2, v3;
    flag = new Flag();
    for (i = l = 0, ref3 = poly.vertices.length; 0 <= ref3 ? l < ref3 : l > ref3; i = 0 <= ref3 ? ++l : --l) {
        flag.newV("v" + i, unit(poly.vertices[i]));
    }
    centers = poly.centers();
    for (i = m = 0, ref4 = poly.faces.length; 0 <= ref4 ? m < ref4 : m > ref4; i = 0 <= ref4 ? ++m : --m) {
        f = poly.faces[i];
        flag.newV("center" + i, unit(centers[i]));
    }
    for (i = o = 0, ref5 = poly.faces.length; 0 <= ref5 ? o < ref5 : o > ref5; i = 0 <= ref5 ? ++o : --o) {
        f = poly.faces[i];
        ref6 = f.slice(-2), v1 = ref6[0], v2 = ref6[1];
        for (j = q = 0, ref7 = f.length; 0 <= ref7 ? q < ref7 : q > ref7; j = 0 <= ref7 ? ++q : --q) {
            v = f[j];
            v3 = v;
            flag.newV(v1 + "~" + v2, oneThird(poly.vertices[v1], poly.vertices[v2]));
            fname = i + "f" + v1;
            flag.newFlag(fname, "center" + i, v1 + "~" + v2);
            flag.newFlag(fname, v1 + "~" + v2, v2 + "~" + v1);
            flag.newFlag(fname, v2 + "~" + v1, "v" + v2);
            flag.newFlag(fname, "v" + v2, v2 + "~" + v3);
            flag.newFlag(fname, v2 + "~" + v3, "center" + i);
            ref8 = [v2, v3], v1 = ref8[0], v2 = ref8[1];
        }
    }
    return canonicalize(flag.topoly("g" + poly.name));
};

quinto = function(poly) {
    var centroid, f, flag, i, innerpt, l, len, m, midpt, ref3, ref4, ref5, v1, v2, v3;
    flag = new Flag();
    for (i = l = 0, ref3 = poly.faces.length; 0 <= ref3 ? l < ref3 : l > ref3; i = 0 <= ref3 ? ++l : --l) {
        f = poly.faces[i];
        centroid = calcCentroid(f.map(function(idx) {
            return poly.vertices[idx];
        }));
        ref4 = f.slice(-2), v1 = ref4[0], v2 = ref4[1];
        for (m = 0, len = f.length; m < len; m++) {
            v3 = f[m];
            midpt = midpoint(poly.vertices[v1], poly.vertices[v2]);
            innerpt = midpoint(midpt, centroid);
            flag.newV(midName(v1, v2), midpt);
            flag.newV(("inner_" + i + "_") + midName(v1, v2), innerpt);
            flag.newV("" + v2, poly.vertices[v2]);
            flag.newFlag("f" + i + "_" + v2, ("inner_" + i + "_") + midName(v1, v2), midName(v1, v2));
            flag.newFlag("f" + i + "_" + v2, midName(v1, v2), "" + v2);
            flag.newFlag("f" + i + "_" + v2, "" + v2, midName(v2, v3));
            flag.newFlag("f" + i + "_" + v2, midName(v2, v3), ("inner_" + i + "_") + midName(v2, v3));
            flag.newFlag("f" + i + "_" + v2, ("inner_" + i + "_") + midName(v2, v3), ("inner_" + i + "_") + midName(v1, v2));
            flag.newFlag("f_in_" + i, ("inner_" + i + "_") + midName(v1, v2), ("inner_" + i + "_") + midName(v2, v3));
            ref5 = [v2, v3], v1 = ref5[0], v2 = ref5[1];
        }
    }
    return flag.topoly("q" + poly.name);
};

inset = function(poly, inset, popout, n) {
    var centers, f, flag, fname, foundAny, i, l, len, len1, m, normals, o, p, q, ref3, ref4, ref5, s, v, v1, v2;
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
    for (i = l = 0, ref3 = poly.vertices.length; 0 <= ref3 ? l < ref3 : l > ref3; i = 0 <= ref3 ? ++l : --l) {
        p = poly.vertices[i];
        flag.newV("v" + i, p);
    }
    normals = poly.normals();
    centers = poly.centers();
    for (i = m = 0, ref4 = poly.faces.length; 0 <= ref4 ? m < ref4 : m > ref4; i = 0 <= ref4 ? ++m : --m) {
        f = poly.faces[i];
        if (f.length === n || n === 0) {
            for (o = 0, len = f.length; o < len; o++) {
                v = f[o];
                flag.newV("f" + i + "v" + v, add(tween(poly.vertices[v], centers[i], inset), mult(popout, normals[i])));
            }
        }
    }
    foundAny = false;
    for (i = q = 0, ref5 = poly.faces.length; 0 <= ref5 ? q < ref5 : q > ref5; i = 0 <= ref5 ? ++q : --q) {
        f = poly.faces[i];
        v1 = "v" + f[f.length - 1];
        for (s = 0, len1 = f.length; s < len1; s++) {
            v = f[s];
            v2 = "v" + v;
            if (f.length === n || n === 0) {
                foundAny = true;
                fname = i + v1;
                flag.newFlag(fname, v1, v2);
                flag.newFlag(fname, v2, "f" + i + v2);
                flag.newFlag(fname, "f" + i + v2, "f" + i + v1);
                flag.newFlag(fname, "f" + i + v1, v1);
                flag.newFlag("ex" + i, "f" + i + v1, "f" + i + v2);
            } else {
                flag.newFlag(i, v1, v2);
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
    var centers, dualnormals, f, flag, fname, i, l, len, len1, m, normals, o, p, q, ref3, ref4, ref5, s, v, v1, v2;
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
    for (i = l = 0, ref3 = poly.vertices.length; 0 <= ref3 ? l < ref3 : l > ref3; i = 0 <= ref3 ? ++l : --l) {
        p = poly.vertices[i];
        flag.newV("v" + i, p);
        flag.newV("downv" + i, add(p, mult(-1 * thickness, dualnormals[i])));
    }
    for (i = m = 0, ref4 = poly.faces.length; 0 <= ref4 ? m < ref4 : m > ref4; i = 0 <= ref4 ? ++m : --m) {
        f = poly.faces[i];
        for (o = 0, len = f.length; o < len; o++) {
            v = f[o];
            flag.newV("fin" + i + "v" + v, tween(poly.vertices[v], centers[i], insetf));
            flag.newV("findown" + i + "v" + v, add(tween(poly.vertices[v], centers[i], insetf), mult(-1 * thickness, normals[i])));
        }
    }
    for (i = q = 0, ref5 = poly.faces.length; 0 <= ref5 ? q < ref5 : q > ref5; i = 0 <= ref5 ? ++q : --q) {
        f = poly.faces[i];
        v1 = "v" + f[f.length - 1];
        for (s = 0, len1 = f.length; s < len1; s++) {
            v = f[s];
            v2 = "v" + v;
            fname = i + v1;
            flag.newFlag(fname, v1, v2);
            flag.newFlag(fname, v2, "fin" + i + v2);
            flag.newFlag(fname, "fin" + i + v2, "fin" + i + v1);
            flag.newFlag(fname, "fin" + i + v1, v1);
            fname = "sides" + i + v1;
            flag.newFlag(fname, "fin" + i + v1, "fin" + i + v2);
            flag.newFlag(fname, "fin" + i + v2, "findown" + i + v2);
            flag.newFlag(fname, "findown" + i + v2, "findown" + i + v1);
            flag.newFlag(fname, "findown" + i + v1, "fin" + i + v1);
            fname = "bottom" + i + v1;
            flag.newFlag(fname, "down" + v2, "down" + v1);
            flag.newFlag(fname, "down" + v1, "findown" + i + v1);
            flag.newFlag(fname, "findown" + i + v1, "findown" + i + v2);
            flag.newFlag(fname, "findown" + i + v2, "down" + v2);
            v1 = v2;
        }
    }
    return flag.topoly("H" + poly.name);
};

perspectiva = function(poly) {
    var centers, f, flag, i, l, len, m, o, ref3, ref4, ref5, ref6, v, v1, v12, v2, v21, v23, v3, vert1, vert2, vert3;
    centers = poly.centers();
    flag = new Flag();
    for (i = l = 0, ref3 = poly.vertices.length; 0 <= ref3 ? l < ref3 : l > ref3; i = 0 <= ref3 ? ++l : --l) {
        flag.newV("v" + i, poly.vertices[i]);
    }
    for (i = m = 0, ref4 = poly.faces.length; 0 <= ref4 ? m < ref4 : m > ref4; i = 0 <= ref4 ? ++m : --m) {
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
            flag.newV(v12, midpoint(midpoint(vert1, vert2), centers[i]));
            flag.newFlag("in" + i, v12, v23);
            flag.newFlag("f" + i + v2, v23, v12);
            flag.newFlag("f" + i + v2, v12, v2);
            flag.newFlag("f" + i + v2, v2, v23);
            flag.newFlag("f" + v12, v1, v21);
            flag.newFlag("f" + v12, v21, v12);
            flag.newFlag("f" + v12, v12, v1);
            ref5 = [v2, v3], v1 = ref5[0], v2 = ref5[1];
            ref6 = [vert2, vert3], vert1 = ref6[0], vert2 = ref6[1];
        }
    }
    return flag.topoly("P" + poly.name);
};

trisub = function(poly, n) {
    var EPSILON_CLOSE, f, faces, fn, i, i1, i2, i3, j, j1, k1, l, l1, len, m, newVs, newpos, o, pos, q, ref10, ref11, ref12, ref13, ref14, ref3, ref4, ref5, ref6, ref7, ref8, ref9, s, t, u, uniqVs, uniqmap, v, v1, v2, v21, v3, v31, vmap, w, z;
    if (n == null) {
        n = 2;
    }
    for (fn = l = 0, ref3 = poly.faces.length; 0 <= ref3 ? l < ref3 : l > ref3; fn = 0 <= ref3 ? ++l : --l) {
        if (poly.faces[fn].length !== 3) {
            return poly;
        }
    }
    newVs = [];
    vmap = {};
    pos = 0;
    for (fn = m = 0, ref4 = poly.faces.length; 0 <= ref4 ? m < ref4 : m > ref4; fn = 0 <= ref4 ? ++m : --m) {
        f = poly.faces[fn];
        ref5 = f.slice(-3), i1 = ref5[0], i2 = ref5[1], i3 = ref5[2];
        v1 = poly.vertices[i1];
        v2 = poly.vertices[i2];
        v3 = poly.vertices[i3];
        v21 = sub(v2, v1);
        v31 = sub(v3, v1);
        for (i = o = 0, ref6 = n; 0 <= ref6 ? o <= ref6 : o >= ref6; i = 0 <= ref6 ? ++o : --o) {
            for (j = q = 0, ref7 = n - i; 0 <= ref7 ? q <= ref7 : q >= ref7; j = 0 <= ref7 ? ++q : --q) {
                v = add(add(v1, mult(i / n, v21)), mult(j / n, v31));
                vmap["v" + fn + "-" + i + "-" + j] = pos++;
                newVs.push(v);
            }
        }
    }
    EPSILON_CLOSE = 1.0e-8;
    uniqVs = [];
    newpos = 0;
    uniqmap = {};
    for (i = s = 0, len = newVs.length; s < len; i = ++s) {
        v = newVs[i];
        if (indexOf.call(uniqmap, i) >= 0) {
            continue;
        }
        uniqmap[i] = newpos;
        uniqVs.push(v);
        for (j = t = ref8 = i + 1, ref9 = newVs.length; ref8 <= ref9 ? t < ref9 : t > ref9; j = ref8 <= ref9 ? ++t : --t) {
            w = newVs[j];
            if (mag(sub(v, w)) < EPSILON_CLOSE) {
                uniqmap[j] = newpos;
            }
        }
        newpos++;
    }
    faces = [];
    for (fn = u = 0, ref10 = poly.faces.length; 0 <= ref10 ? u < ref10 : u > ref10; fn = 0 <= ref10 ? ++u : --u) {
        for (i = z = 0, ref11 = n; 0 <= ref11 ? z < ref11 : z > ref11; i = 0 <= ref11 ? ++z : --z) {
            for (j = j1 = 0, ref12 = n - i; 0 <= ref12 ? j1 < ref12 : j1 > ref12; j = 0 <= ref12 ? ++j1 : --j1) {
                faces.push([uniqmap[vmap["v" + fn + "-" + i + "-" + j]], uniqmap[vmap["v" + fn + "-" + (i + 1) + "-" + j]], uniqmap[vmap["v" + fn + "-" + i + "-" + (j + 1)]]]);
            }
        }
        for (i = k1 = 1, ref13 = n; 1 <= ref13 ? k1 < ref13 : k1 > ref13; i = 1 <= ref13 ? ++k1 : --k1) {
            for (j = l1 = 0, ref14 = n - i; 0 <= ref14 ? l1 < ref14 : l1 > ref14; j = 0 <= ref14 ? ++l1 : --l1) {
                faces.push([uniqmap[vmap["v" + fn + "-" + i + "-" + j]], uniqmap[vmap["v" + fn + "-" + i + "-" + (j + 1)]], uniqmap[vmap["v" + fn + "-" + (i - 1) + "-" + (j + 1)]]]);
            }
        }
    }
    return new Polyhedron("u" + n + poly.name, faces, uniqVs);
};

canonicalize = function(poly, iter) {
    var edges, faces, i, l, maxChange, newVs, newpoly, oldVs, ref3;
    if (iter == null) {
        iter = 200;
    }
    faces = poly.faces;
    edges = poly.edges();
    newVs = poly.vertices;
    maxChange = 1.0;
    for (i = l = 0, ref3 = iter; 0 <= ref3 ? l <= ref3 : l >= ref3; i = 0 <= ref3 ? ++l : --l) {
        oldVs = copyVecArray(newVs);
        newVs = tangentify(newVs, edges);
        newVs = recenter(newVs, edges);
        newVs = planarize(newVs, faces);
        maxChange = _.max(_.map(_.zip(newVs, oldVs), function(arg) {
            var x, y;
            x = arg[0], y = arg[1];
            return mag(sub(x, y));
        }));
        if (maxChange < 1e-8) {
            break;
        }
    }
    newVs = rescale(newVs);
    newpoly = new Polyhedron(poly.name, poly.faces, newVs);
    return newpoly;
};

canonicalXYZ = function(poly, iterations) {
    var count, dpoly, l, ref3;
    if (iterations != null) {
        iterations;
    } else {
        iterations = 1;
    }
    dpoly = dual(poly);
    for (count = l = 0, ref3 = iterations; 0 <= ref3 ? l < ref3 : l > ref3; count = 0 <= ref3 ? ++l : --l) {
        dpoly.vertices = reciprocalN(poly);
        poly.vertices = reciprocalN(dpoly);
    }
    return new Polyhedron(poly.name, poly.faces, poly.vertices);
};

flatten = function(poly, iterations) {
    var count, dpoly, l, ref3;
    if (iterations != null) {
        iterations;
    } else {
        iterations = 1;
    }
    dpoly = dual(poly);
    for (count = l = 0, ref3 = iterations; 0 <= ref3 ? l < ref3 : l > ref3; count = 0 <= ref3 ? ++l : --l) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9wby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsb2JBQUE7SUFBQTs7QUF3QkEsTUFBcUIsT0FBQSxDQUFRLEtBQVIsQ0FBckIsRUFBRSxpQkFBRixFQUFTLGVBQVQsRUFBZTs7QUFDZixPQUE2SixPQUFBLENBQVEsUUFBUixDQUE3SixFQUFFLGNBQUYsRUFBTyxjQUFQLEVBQVksY0FBWixFQUFpQixnQkFBakIsRUFBdUIsY0FBdkIsRUFBNEIsY0FBNUIsRUFBaUMsZ0JBQWpDLEVBQXVDLGtCQUF2QyxFQUE4QyxvQkFBOUMsRUFBc0Qsd0JBQXRELEVBQWdFLGtCQUFoRSxFQUF1RSwwQkFBdkUsRUFBa0Ysb0JBQWxGLEVBQTBGLHdCQUExRixFQUFvRyxvQ0FBcEcsRUFBb0gsd0JBQXBILEVBQThILGdDQUE5SCxFQUE0STs7QUFDNUksT0FBeUUsT0FBQSxDQUFRLE9BQVIsQ0FBekUsRUFBRSw0QkFBRixFQUFjLDhCQUFkLEVBQTJCLDhCQUEzQixFQUF3Qyx3QkFBeEMsRUFBa0Qsc0JBQWxELEVBQTJEOztBQUN6RCxjQUFGLEVBQU8sY0FBUCxFQUFZOztBQUVaLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7QUFDUCxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0FBRWIsT0FBQSxHQUFVLFNBQUMsRUFBRCxFQUFLLEVBQUw7V0FBWSxFQUFBLEdBQUcsRUFBSCxJQUFVLENBQUcsRUFBRCxHQUFJLEdBQUosR0FBTyxFQUFULENBQVYsSUFBMkIsQ0FBRyxFQUFELEdBQUksR0FBSixHQUFPLEVBQVQ7QUFBdkM7O0FBUVYsV0FBQSxHQUFjLFNBQUMsSUFBRCxFQUFPLENBQVA7QUFFVixRQUFBOztRQUFBOztRQUFBLElBQUs7O0lBQ0wsUUFBQSxHQUFXO0FBRVgsU0FBUywrRkFBVDtRQUNJLENBQUEsR0FBSSxJQUFJLENBQUMsS0FBTSxDQUFBLENBQUE7UUFDZixJQUFH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QixFQUEwQixJQUFJLENBQUMsS0FBL0IsRUFBc0MsSUFBSSxDQUFDLFFBQTNDO0FBVk07O0FBa0JWLE1BQU0sQ0FBQyxPQUFQLEdBQ0k7SUFBQSxJQUFBLEVBQWdCLElBQWhCO0lBQ0EsTUFBQSxFQUFnQixNQURoQjtJQUVBLFdBQUEsRUFBZ0IsV0FGaEI7SUFHQSxHQUFBLEVBQWdCLEdBSGhCO0lBSUEsSUFBQSxFQUFnQixJQUpoQjtJQUtBLElBQUEsRUFBZ0IsSUFMaEI7SUFNQSxPQUFBLEVBQWdCLE9BTmhCO0lBT0EsS0FBQSxFQUFnQixLQVBoQjtJQVFBLE1BQUEsRUFBZ0IsTUFSaEI7SUFTQSxLQUFBLEVBQWdCLEtBVGhCO0lBVUEsT0FBQSxFQUFnQixPQVZoQjtJQVdBLE1BQUEsRUFBZ0IsTUFYaEI7SUFZQSxPQUFBLEVBQWdCLE9BWmhCO0lBYUEsV0FBQSxFQUFnQixXQWJoQjtJQWNBLFlBQUEsRUFBZ0IsWUFkaEI7SUFlQSxZQUFBLEVBQWdCLFlBZmhCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgICAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgICAgXG4gICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICAgMDAwMDAwMCAgICAgXG4jIyNcbiNcbiMgUG9seWjDqWRyb25pc21lLCBDb3B5cmlnaHQgMjAxOSwgQW5zZWxtIExldnNrYXlhLCBNSVQgTGljZW5zZVxuI1xuIyBQb2x5aGVkcm9uIE9wZXJhdG9yc1xuI1xuIyBmb3IgZWFjaCB2ZXJ0ZXggb2YgbmV3IHBvbHloZWRyb25cbiMgICAgIGNhbGwgbmV3VihWbmFtZSwgeHl6KSB3aXRoIGEgc3ltYm9saWMgbmFtZSBhbmQgY29vcmRpbmF0ZXNcbiNcbiMgZm9yIGVhY2ggZmxhZyBvZiBuZXcgcG9seWhlZHJvblxuIyAgICAgY2FsbCBuZXdGbGFnKEZuYW1lLCBWbmFtZTEsIFZuYW1lMikgd2l0aCBhIHN5bWJvbGljIG5hbWUgZm9yIHRoZSBuZXcgZmFjZVxuIyAgICAgYW5kIHRoZSBzeW1ib2xpYyBuYW1lIGZvciB0d28gdmVydGljZXMgZm9ybWluZyBhbiBvcmllbnRlZCBlZGdlXG4jXG4jIE9yaWVudGF0aW9uIG11c3QgYmUgZGVhbHQgd2l0aCBwcm9wZXJseSB0byBtYWtlIGEgbWFuaWZvbGQgbWVzaFxuIyBTcGVjaWZpY2FsbHksIG5vIGVkZ2UgdjEtPnYyIGNhbiBldmVyIGJlIGNyb3NzZWQgaW4gdGhlIHNhbWUgZGlyZWN0aW9uIGJ5IHR3byBkaWZmZXJlbnQgZmFjZXNcbiMgY2FsbCB0b3BvbHkoKSB0byBhc3NlbWJsZSBmbGFncyBpbnRvIHBvbHloZWRyb24gc3RydWN0dXJlIGJ5IGZvbGxvd2luZyB0aGUgb3JiaXRzXG4jIG9mIHRoZSB2ZXJ0ZXggbWFwcGluZyBzdG9yZWQgaW4gdGhlIGZsYWdzZXQgZm9yIGVhY2ggbmV3IGZhY2VcblxueyBjbGFtcCwga2xvZywgXyB9ID0gcmVxdWlyZSAna3hrJ1xueyBkb3QsIGFkZCwgbmVnLCBtdWx0LCBtYWcsIHN1YiwgdW5pdCwgY3Jvc3MsIHJvdGF0ZSwgb25lVGhpcmQsIHR3ZWVuLCBpbnRlcnNlY3QsIHJheVJheSwgcmF5UGxhbmUsIHBvaW50UGxhbmVEaXN0LCBtaWRwb2ludCwgY2FsY0NlbnRyb2lkLCBjb3B5VmVjQXJyYXkgfSA9IHJlcXVpcmUgJy4vbWF0aCdcbnsgdGFuZ2VudGlmeSwgcmVjaXByb2NhbEMsIHJlY2lwcm9jYWxOLCByZWNlbnRlciwgcmVzY2FsZSwgcGxhbmFyaXplIH0gPSByZXF1aXJlICcuL2dlbydcbnsgbWluLCBhYnMsIGFjb3MgfSA9IE1hdGhcblxuRmxhZyA9IHJlcXVpcmUgJy4vZmxhZydcblBvbHloZWRyb24gPSByZXF1aXJlICcuL3BvbHloZWRyb24nXG5cbm1pZE5hbWUgPSAodjEsIHYyKSAtPiB2MTx2MiBhbmQgXCIje3YxfV8je3YyfVwiIG9yIFwiI3t2Mn1fI3t2MX1cIiAjIHVuaXF1ZSBuYW1lcyBvZiBtaWRwb2ludHNcblxuIyAwMDAwMDAwICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4jICAgMDAwICAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuIyAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbnppcmt1bGFyaXplID0gKHBvbHksIG4pIC0+XG4gICAgXG4gICAgbiA/PSAwXG4gICAgdmVydGljZXMgPSBbXVxuICAgIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UgLTJcbiAgICAgICAgICAgIGZvciB2MyBpbiBmXG4gICAgICAgICAgICAgICAgdjEyID0gc3ViIHBvbHkudmVydGljZXNbdjJdLCBwb2x5LnZlcnRpY2VzW3YxXVxuICAgICAgICAgICAgICAgIHYzMiA9IHN1YiBwb2x5LnZlcnRpY2VzW3YyXSwgcG9seS52ZXJ0aWNlc1t2M11cbiAgICAgICAgICAgICAgICBpZiBhYnMobWFnKHYxMikgLSBtYWcodjMyKSkgPiAwLjAwMVxuICAgICAgICAgICAgICAgICAgICBtMTIgPSBtaWRwb2ludCBwb2x5LnZlcnRpY2VzW3YxXSwgcG9seS52ZXJ0aWNlc1t2Ml1cbiAgICAgICAgICAgICAgICAgICAgbTMyID0gbWlkcG9pbnQgcG9seS52ZXJ0aWNlc1t2M10sIHBvbHkudmVydGljZXNbdjJdXG4gICAgICAgICAgICAgICAgICAgIHUxMiA9IHVuaXQgbTEyXG4gICAgICAgICAgICAgICAgICAgIHUzMiA9IHVuaXQgbTMyXG4gICAgICAgICAgICAgICAgICAgIG5jID0gYWRkIHUxMiwgdTMyXG4gICAgICAgICAgICAgICAgICAgIHBuID0gY3Jvc3MgbmMsIGNyb3NzIHBvbHkudmVydGljZXNbdjFdLCBwb2x5LnZlcnRpY2VzW3YzXVxuICAgICAgICAgICAgICAgICAgICBpZiBtYWcodjEyKSA+IG1hZyh2MzIpXG4gICAgICAgICAgICAgICAgICAgICAgICByID0gcmF5UGxhbmUgcG9seS52ZXJ0aWNlc1t2M10sIHYzMiwgWzAgMCAwXSwgcG5cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgciA9IHJheVBsYW5lIHBvbHkudmVydGljZXNbdjFdLCB2MTIsIFswIDAgMF0sIHBuXG4gICAgICAgICAgICAgICAgICAgIHZlcnRpY2VzW3YyXSA9IHJcbiAgICAgICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gIFxuICAgIHZlcnRzID0gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF0ubWFwIChpKSAtPiB2ZXJ0aWNlc1tpXSA/IHBvbHkudmVydGljZXNbaV1cbiAgICBcbiAgICBuZXcgUG9seWhlZHJvbiBcInoje3BvbHkubmFtZX1cIiBwb2x5LmZhY2VzLCB2ZXJ0c1xuXG4jIDAwMDAwMDAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICBcblxuZHVhbCA9IChwb2x5KSAtPlxuXG4gICAgIyBrbG9nIFwiZHVhbCAje3BvbHkubmFtZX1cIiBcbiAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgZmFjZSA9IFtdIFxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdIFxuICAgICAgICBmYWNlW2ldID0ge31cblxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gZltmLmxlbmd0aC0xXSAjIGxhc3QgdmVydGV4XG4gICAgICAgIGZvciB2MiBpbiBmICMgYXNzdW1lcyB0aGF0IG5vIDIgZmFjZXMgc2hhcmUgYW4gZWRnZSBpbiB0aGUgc2FtZSBvcmllbnRhdGlvbiFcbiAgICAgICAgICAgIGZhY2VbdjFdW1widiN7djJ9XCJdID0gXCIje2l9XCJcbiAgICAgICAgICAgIHYxID0gdjIgIyBjdXJyZW50IGJlY29tZXMgcHJldmlvdXNcbiAgXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZmxhZy5uZXdWIFwiI3tpfVwiIGNlbnRlcnNbaV1cbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgdjEgPSBmW2YubGVuZ3RoLTFdICNwcmV2aW91cyB2ZXJ0ZXhcbiAgICAgICAgZm9yIHYyIGluIGZcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyB2MSwgZmFjZVt2Ml1bXCJ2I3t2MX1cIl0sIFwiI3tpfVwiXG4gICAgICAgICAgICB2MT12MiAjIGN1cnJlbnQgYmVjb21lcyBwcmV2aW91c1xuICBcbiAgICBkcG9seSA9IGZsYWcudG9wb2x5KCkgIyBidWlsZCB0b3BvbG9naWNhbCBkdWFsIGZyb20gZmxhZ3NcbiAgXG4gICAgIyBtYXRjaCBGIGluZGV4IG9yZGVyaW5nIHRvIFYgaW5kZXggb3JkZXJpbmcgb24gZHVhbFxuICAgIHNvcnRGID0gW11cbiAgICBmb3IgZiBpbiBkcG9seS5mYWNlc1xuICAgICAgICBrID0gaW50ZXJzZWN0IHBvbHkuZmFjZXNbZlswXV0sIHBvbHkuZmFjZXNbZlsxXV0sIHBvbHkuZmFjZXNbZlsyXV1cbiAgICAgICAgc29ydEZba10gPSBmXG4gICAgZHBvbHkuZmFjZXMgPSBzb3J0RlxuICBcbiAgICBpZiBwb2x5Lm5hbWVbMF0gIT0gXCJkXCJcbiAgICAgICAgZHBvbHkubmFtZSA9IFwiZCN7cG9seS5uYW1lfVwiXG4gICAgZWxzZSBcbiAgICAgICAgZHBvbHkubmFtZSA9IHBvbHkubmFtZS5zbGljZSAxXG4gIFxuICAgIGRwb2x5XG5cbiMgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgIDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbiMgS2lzIChhYmJyZXZpYXRlZCBmcm9tIHRyaWFraXMpIHRyYW5zZm9ybXMgYW4gTi1zaWRlZCBmYWNlIGludG8gYW4gTi1weXJhbWlkIHJvb3RlZCBhdCB0aGVcbiMgc2FtZSBiYXNlIHZlcnRpY2VzLiBvbmx5IGtpcyBuLXNpZGVkIGZhY2VzLCBidXQgbj09MCBtZWFucyBraXMgYWxsLlxuXG5raXMgPSAocG9seSwgbiwgYXBleGRpc3QpIC0+XG5cbiAgICBuID89IDBcbiAgICBhcGV4ZGlzdCA/PSAwXG5cbiAgICAjIGtsb2cgXCJraXMgb2YgI3tuIGFuZCBcIiN7bn0tc2lkZWQgZmFjZXMgb2YgXCIgb3IgJyd9I3twb2x5Lm5hbWV9XCJcblxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgcCA9IHBvbHkudmVydGljZXNbaV0gIyBlYWNoIG9sZCB2ZXJ0ZXggaXMgYSBuZXcgdmVydGV4XG4gICAgICAgIGZsYWcubmV3ViBcInYje2l9XCIgcFxuICBcbiAgICBub3JtYWxzID0gcG9seS5ub3JtYWxzKClcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgICBmb3VuZEFueSA9IGZhbHNlXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgdjIgPSBcInYje3Z9XCJcbiAgICAgICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICAgICAgZm91bmRBbnkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGFwZXggPSBcImFwZXgje2l9XCJcbiAgICAgICAgICAgICAgICBmbmFtZSA9IFwiI3tpfSN7djF9XCJcbiAgICAgICAgICAgICAgICAjIG5ldyB2ZXJ0aWNlcyBpbiBjZW50ZXJzIG9mIG4tc2lkZWQgZmFjZVxuICAgICAgICAgICAgICAgIGZsYWcubmV3ViBhcGV4LCBhZGQgY2VudGVyc1tpXSwgbXVsdCBhcGV4ZGlzdCwgbm9ybWFsc1tpXVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgICB2MSwgICB2MiAjIHRoZSBvbGQgZWRnZSBvZiBvcmlnaW5hbCBmYWNlXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCAgIHYyLCBhcGV4ICMgdXAgdG8gYXBleCBvZiBweXJhbWlkXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBhcGV4LCAgIHYxICMgYW5kIGJhY2sgZG93biBhZ2FpblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcIiN7aX1cIiwgdjEsIHYyICAjIHNhbWUgb2xkIGZsYWcsIGlmIG5vbi1uXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHYxID0gdjIgIyBjdXJyZW50IGJlY29tZXMgcHJldmlvdXNcbiAgXG4gICAgaWYgbm90IGZvdW5kQW55XG4gICAgICAgIGtsb2cgXCJObyAje259LWZvbGQgY29tcG9uZW50cyB3ZXJlIGZvdW5kLlwiXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiayN7bn0je3BvbHkubmFtZX1cIlxuXG4jICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgXG5cbiMgVGhlIGJlc3Qgd2F5IHRvIHRoaW5rIG9mIHRoZSBhbWJvIG9wZXJhdG9yIGlzIGFzIGEgdG9wb2xvZ2ljYWwgXCJ0d2VlblwiIGJldHdlZW4gYSBwb2x5aGVkcm9uXG4jIGFuZCBpdHMgZHVhbCBwb2x5aGVkcm9uLiAgVGh1cyB0aGUgYW1ibyBvZiBhIGR1YWwgcG9seWhlZHJvbiBpcyB0aGUgc2FtZSBhcyB0aGUgYW1ibyBvZiB0aGVcbiMgb3JpZ2luYWwuIEFsc28gY2FsbGVkIFwiUmVjdGlmeVwiLlxuXG5hbWJvID0gKHBvbHkpIC0+XG4gICAgXG4gICAgIyBrbG9nIFwiYW1ibyBvZiAje3BvbHkubmFtZX1cIlxuICAgIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgICMgRm9yIGVhY2ggZmFjZSBmIGluIHRoZSBvcmlnaW5hbCBwb2x5XG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlKC0yKVxuICAgICAgICBmb3IgdjMgaW4gZlxuICAgICAgICAgICAgaWYgdjEgPCB2MiAjIHZlcnRpY2VzIGFyZSB0aGUgbWlkcG9pbnRzIG9mIGFsbCBlZGdlcyBvZiBvcmlnaW5hbCBwb2x5XG4gICAgICAgICAgICAgICAgZmxhZy5uZXdWIG1pZE5hbWUodjEsdjIpLCBtaWRwb2ludCBwb2x5LnZlcnRpY2VzW3YxXSwgcG9seS52ZXJ0aWNlc1t2Ml1cbiAgICAgICAgICAgICMgZmFjZSBjb3JyZXNwb25kcyB0byB0aGUgb3JpZ2luYWwgZlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwib3JpZyN7aX1cIiAgbWlkTmFtZSh2MSx2MiksIG1pZE5hbWUodjIsdjMpXG4gICAgICAgICAgICAjIGZhY2UgY29ycmVzcG9uZHMgdG8gKHRoZSB0cnVuY2F0ZWQpIHYyXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJkdWFsI3t2Mn1cIiBtaWROYW1lKHYyLHYzKSwgbWlkTmFtZSh2MSx2MilcbiAgICAgICAgICAgICMgc2hpZnQgb3ZlciBvbmVcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M11cbiAgXG4gICAgZmxhZy50b3BvbHkgXCJhI3twb2x5Lm5hbWV9XCJcblxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5jaGFtZmVyID0gKHBvbHksIGZhY3Rvcj0wLjUpIC0+XG4gICAgXG4gICAgZmFjdG9yICA9IGNsYW1wIDAuMDAxIDAuOTk1IGZhY3RvclxuICAgIGZsYWcgICAgPSBuZXcgRmxhZygpXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgd2luZ3MgICA9IHBvbHkud2luZ3MoKVxuICAgICAgICBcbiAgICBtaW5FZGdlTGVuZ3RoID0gSW5maW5pdHlcbiAgICBcbiAgICBmb3IgZWRnZSBpbiB3aW5nc1xuICAgICAgICBlMCA9IHBvbHkudmVydGljZXNbZWRnZVswXV1cbiAgICAgICAgZTEgPSBwb2x5LnZlcnRpY2VzW2VkZ2VbMV1dXG4gICAgICAgIGVkID0gdW5pdCBzdWIgZTEsIGUwXG4gICAgICAgIFxuICAgICAgICBuciA9IHVuaXQgc3ViIHBvbHkudmVydGljZXNbZWRnZVsyXS5ucl0sIGUxXG4gICAgICAgIHByID0gdW5pdCBzdWIgcG9seS52ZXJ0aWNlc1tlZGdlWzJdLnByXSwgZTBcbiAgICAgICAgY3IgPSByYXlSYXkgW2UxLCBtdWx0IDAuNSwgYWRkIGFkZChlMSwgbnIpLCBzdWIoZTEsIGVkKV0sXG4gICAgICAgICAgICAgICAgICAgIFtlMCwgbXVsdCAwLjUsIGFkZCBhZGQoZTAsIHByKSwgYWRkKGUwLCBlZCldXG5cbiAgICAgICAgZWwgPSBtYWcgc3ViIGUxLCByYXlSYXkgW2UxLCBhZGQoZTEsIG5yKV0sIFtjciwgYWRkKGNyLCBlZCldXG4gICAgICAgIG1pbkVkZ2VMZW5ndGggPSBtaW4gbWluRWRnZUxlbmd0aCwgZWxcblxuICAgICAgICBlbCA9IG1hZyBzdWIgZTAsIHJheVJheSBbZTAsIGFkZChlMCwgcHIpXSwgW2NyLCBzdWIoY3IsIGVkKV1cbiAgICAgICAgbWluRWRnZUxlbmd0aCA9IG1pbiBtaW5FZGdlTGVuZ3RoLCBlbFxuICAgICAgICBcbiAgICBtaW5FZGdlTGVuZ3RoICo9IGZhY3RvclxuICAgICAgICBcbiAgICBtb3ZlZCA9IHt9XG4gICAgZm9yIGVkZ2UgaW4gd2luZ3NcbiAgICAgICAgZTAgID0gcG9seS52ZXJ0aWNlc1tlZGdlWzBdXVxuICAgICAgICBlMSAgPSBwb2x5LnZlcnRpY2VzW2VkZ2VbMV1dXG4gICAgICAgIHJyID0gW1xuICAgICAgICAgICAgYWRkKGUwLCBtdWx0IG1pbkVkZ2VMZW5ndGgsIHVuaXQgc3ViIHBvbHkudmVydGljZXNbZWRnZVsyXS5wcl0sIGUwKSxcbiAgICAgICAgICAgIGFkZChlMSwgbXVsdCBtaW5FZGdlTGVuZ3RoLCB1bml0IHN1YiBwb2x5LnZlcnRpY2VzW2VkZ2VbMl0ubnJdLCBlMSldXG4gICAgICAgIGxyID0gW1xuICAgICAgICAgICAgYWRkKGUwLCBtdWx0IG1pbkVkZ2VMZW5ndGgsIHVuaXQgc3ViIHBvbHkudmVydGljZXNbZWRnZVsyXS5wbF0sIGUwKSxcbiAgICAgICAgICAgIGFkZChlMSwgbXVsdCBtaW5FZGdlTGVuZ3RoLCB1bml0IHN1YiBwb2x5LnZlcnRpY2VzW2VkZ2VbMl0ubmxdLCBlMSldXG4gICAgICAgICAgICBcbiAgICAgICAgbW92ZWRbXCIje2VkZ2VbMV194pa4I3tlZGdlWzBdfWxcIl0gPSByclxuICAgICAgICBtb3ZlZFtcIiN7ZWRnZVswXX3ilrgje2VkZ2VbMV19clwiXSA9IHJyXG4gICAgICAgIG1vdmVkW1wiI3tlZGdlWzFdfeKWuCN7ZWRnZVswXX1yXCJdID0gbHJcbiAgICAgICAgbW92ZWRbXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfWxcIl0gPSBsclxuICAgICAgICAgICAgXG4gICAgZm9yIGVkZ2UgaW4gd2luZ3NcbiAgICAgICAgZTAgICA9IHBvbHkudmVydGljZXNbZWRnZVswXV1cbiAgICAgICAgZTEgICA9IHBvbHkudmVydGljZXNbZWRnZVsxXV1cbiAgICAgICAgXG4gICAgICAgIG5mICA9IFwiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1cIiBcbiAgICAgICAgbl9oID0gXCIje2VkZ2VbMV19XCJcbiAgICAgICAgbl90ID0gXCIje2VkZ2VbMF19XCJcbiAgICAgICAgXG4gICAgICAgIG5uciA9IFwiI3tuX2h94pa4I3tlZGdlWzJdLmZyfVwiXG4gICAgICAgIG5ubCA9IFwiI3tuX2h94pa4I3tlZGdlWzJdLmZsfVwiXG4gICAgICAgIG5wciA9IFwiI3tuX3R94pa4I3tlZGdlWzJdLmZyfVwiXG4gICAgICAgIG5wbCA9IFwiI3tuX3R94pa4I3tlZGdlWzJdLmZsfVwiICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgbnIgPSByYXlSYXkgbW92ZWRbXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfXJcIl0sIG1vdmVkW1wiI3tlZGdlWzFdfeKWuCN7ZWRnZVsyXS5ucn1yXCJdXG4gICAgICAgIG5sID0gcmF5UmF5IG1vdmVkW1wiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1sXCJdLCBtb3ZlZFtcIiN7ZWRnZVsxXX3ilrgje2VkZ2VbMl0ubmx9bFwiXVxuICAgICAgICBwciA9IHJheVJheSBtb3ZlZFtcIiN7ZWRnZVswXX3ilrgje2VkZ2VbMV19clwiXSwgbW92ZWRbXCIje2VkZ2VbMl0ucHJ94pa4I3tlZGdlWzBdfXJcIl1cbiAgICAgICAgcGwgPSByYXlSYXkgbW92ZWRbXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfWxcIl0sIG1vdmVkW1wiI3tlZGdlWzJdLnBsfeKWuCN7ZWRnZVswXX1sXCJdXG4gICAgICAgIFxuICAgICAgICBwbWlkID0gbWlkcG9pbnQgcGwsIHByXG4gICAgICAgIG5taWQgPSBtaWRwb2ludCBubCwgbnJcbiAgICAgICAgY21pZCA9IG1pZHBvaW50IHBtaWQsIG5taWRcbiAgICAgICAgcG5tICA9IGNyb3NzIHN1YihwbWlkLG5taWQpLCBzdWIocGwscHIpXG5cbiAgICAgICAgaGVhZCA9IHJheVBsYW5lIFswIDAgMF0sIGUxLCBjbWlkLCBwbm1cbiAgICAgICAgdGFpbCA9IHJheVBsYW5lIFswIDAgMF0sIGUwLCBjbWlkLCBwbm1cbiAgICAgICAgXG4gICAgICAgIGZsYWcubmV3ViBuX2gsIGhlYWRcbiAgICAgICAgZmxhZy5uZXdWIG5fdCwgdGFpbFxuICAgICAgICBmbGFnLm5ld1Ygbm5yLCBuclxuICAgICAgICBmbGFnLm5ld1Ygbm5sLCBubFxuICAgICAgICBmbGFnLm5ld1YgbnBsLCBwbFxuICAgICAgICBmbGFnLm5ld1YgbnByLCBwclxuXG4gICAgICAgIGZsYWcubmV3RmxhZyBuZiwgbl9oLCBubnJcbiAgICAgICAgZmxhZy5uZXdGbGFnIG5mLCBubnIsIG5wclxuICAgICAgICBmbGFnLm5ld0ZsYWcgbmYsIG5wciwgbl90XG4gICAgICAgIGZsYWcubmV3RmxhZyBuZiwgbl90LCBucGxcbiAgICAgICAgZmxhZy5uZXdGbGFnIG5mLCBucGwsIG5ubFxuICAgICAgICBmbGFnLm5ld0ZsYWcgbmYsIG5ubCwgbl9oXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGZsYWcubmV3RmxhZyBcIiN7ZWRnZVsyXS5mcn1cIiBucHIsIG5uclxuICAgICAgICBmbGFnLm5ld0ZsYWcgXCIje2VkZ2VbMl0uZmx9XCIgbm5sLCBucGxcbiAgICAgICAgXG4gICAgZmxhZy50b3BvbHkgXCJjI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuXG4jIEd5cm8gZm9sbG93ZWQgYnkgdHJ1bmNhdGlvbiBvZiB2ZXJ0aWNlcyBjZW50ZXJlZCBvbiBvcmlnaW5hbCBmYWNlcy5cbiMgVGhpcyBjcmVhdGUgMiBuZXcgaGV4YWdvbnMgZm9yIGV2ZXJ5IG9yaWdpbmFsIGVkZ2UuXG4jIChodHRwczojZW4ud2lraXBlZGlhLm9yZy93aWtpL0NvbndheV9wb2x5aGVkcm9uX25vdGF0aW9uI09wZXJhdGlvbnNfb25fcG9seWhlZHJhKVxuI1xuIyBQb3NzaWJsZSBleHRlbnNpb246IHRha2UgYSBwYXJhbWV0ZXIgbiB0aGF0IG1lYW5zIG9ubHkgd2hpcmwgbi1zaWRlZCBmYWNlcy5cbiMgSWYgd2UgZG8gdGhhdCwgdGhlIGZsYWdzIG1hcmtlZCAjKiBiZWxvdyB3aWxsIG5lZWQgdG8gaGF2ZSB0aGVpciBvdGhlciBzaWRlc1xuIyBmaWxsZWQgaW4gb25lIHdheSBvciBhbm90aGVyLCBkZXBlbmRpbmcgb24gd2hldGhlciB0aGUgYWRqYWNlbnQgZmFjZSBpc1xuIyB3aGlybGVkIG9yIG5vdC5cblxud2hpcmwgPSAocG9seSwgbj0wKSAtPlxuXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgZmxhZy5uZXdWIFwidiN7aX1cIiB1bml0IHBvbHkudmVydGljZXNbaV1cblxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UgLTJcbiAgICAgICAgZm9yIGogaW4gWzAuLi5mLmxlbmd0aF1cbiAgICAgICAgICAgIHYgPSBmW2pdXG4gICAgICAgICAgICB2MyA9IHZcbiAgICAgICAgICAgIHYxXzIgPSBvbmVUaGlyZCBwb2x5LnZlcnRpY2VzW3YxXSwgcG9seS52ZXJ0aWNlc1t2Ml1cbiAgICAgICAgICAgIGZsYWcubmV3Vih2MStcIn5cIit2MiwgdjFfMilcbiAgICAgICAgICAgIGN2MW5hbWUgPSBcImNlbnRlciN7aX1+I3t2MX1cIlxuICAgICAgICAgICAgY3YybmFtZSA9IFwiY2VudGVyI3tpfX4je3YyfVwiXG4gICAgICAgICAgICBmbGFnLm5ld1YgY3YxbmFtZSwgdW5pdCBvbmVUaGlyZCBjZW50ZXJzW2ldLCB2MV8yXG4gICAgICAgICAgICBmbmFtZSA9IGkrXCJmXCIrdjFcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgY3YxbmFtZSwgICB2MStcIn5cIit2MlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCB2MStcIn5cIit2MiwgdjIrXCJ+XCIrdjEgXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIHYyK1wiflwiK3YxLCBcInYje3YyfVwiICBcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgXCJ2I3t2Mn1cIiwgIHYyK1wiflwiK3YzIFxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCB2MitcIn5cIit2MywgY3YybmFtZVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBjdjJuYW1lLCAgIGN2MW5hbWVcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImMje2l9XCIsIGN2MW5hbWUsIGN2Mm5hbWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXSAjIHNoaWZ0IG92ZXIgb25lXG4gIFxuICAgIGNhbm9uaWNhbGl6ZSBmbGFnLnRvcG9seSBcIncje3BvbHkubmFtZX1cIlxuXG4jICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwMCAgICAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG5cbmd5cm8gPSAocG9seSkgLT5cblxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgIGZsYWcubmV3ViBcInYje2l9XCIgdW5pdCBwb2x5LnZlcnRpY2VzW2ldXG5cbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBmbGFnLm5ld1YgXCJjZW50ZXIje2l9XCIgdW5pdCBjZW50ZXJzW2ldXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSgtMilcbiAgICAgICAgZm9yIGogaW4gWzAuLi5mLmxlbmd0aF1cbiAgICAgICAgICAgIHYgPSBmW2pdXG4gICAgICAgICAgICB2MyA9IHZcbiAgICAgICAgICAgIGZsYWcubmV3ViB2MStcIn5cIit2Miwgb25lVGhpcmQgcG9seS52ZXJ0aWNlc1t2MV0scG9seS52ZXJ0aWNlc1t2Ml1cbiAgICAgICAgICAgIGZuYW1lID0gaStcImZcIit2MVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBcImNlbnRlciN7aX1cIiAgdjErXCJ+XCIrdjJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgdjErXCJ+XCIrdjIsICB2MitcIn5cIit2MVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCB2MitcIn5cIit2MSwgIFwidiN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgXCJ2I3t2Mn1cIiAgICAgdjIrXCJ+XCIrdjNcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgdjIrXCJ+XCIrdjMsICBcImNlbnRlciN7aX1cIlxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICBcbiAgICBjYW5vbmljYWxpemUgZmxhZy50b3BvbHkgXCJnI3twb2x5Lm5hbWV9XCJcbiAgICBcbiMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuIyAwMDAgMDAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiMgMDAwIDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMCAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIFxuXG5xdWludG8gPSAocG9seSkgLT4gIyBjcmVhdGVzIGEgcGVudGFnb24gZm9yIGV2ZXJ5IHBvaW50IGluIHRoZSBvcmlnaW5hbCBmYWNlLCBhcyB3ZWxsIGFzIG9uZSBuZXcgaW5zZXQgZmFjZS5cbiAgICBcbiAgICAjIGtsb2cgXCJxdWludG8gb2YgI3twb2x5Lm5hbWV9XCJcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICAjIEZvciBlYWNoIGZhY2UgZiBpbiB0aGUgb3JpZ2luYWwgcG9seVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIGNlbnRyb2lkID0gY2FsY0NlbnRyb2lkIGYubWFwIChpZHgpIC0+IHBvbHkudmVydGljZXNbaWR4XVxuICAgICAgICAjIHdhbGsgb3ZlciBmYWNlIHZlcnRleC10cmlwbGV0c1xuICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UgLTJcbiAgICAgICAgZm9yIHYzIGluIGZcbiAgICAgICAgICAgICMgZm9yIGVhY2ggZmFjZS1jb3JuZXIsIHdlIG1ha2UgdHdvIG5ldyBwb2ludHM6XG4gICAgICAgICAgICBtaWRwdCA9IG1pZHBvaW50IHBvbHkudmVydGljZXNbdjFdLCBwb2x5LnZlcnRpY2VzW3YyXVxuICAgICAgICAgICAgaW5uZXJwdCA9IG1pZHBvaW50IG1pZHB0LCBjZW50cm9pZFxuICAgICAgICAgICAgZmxhZy5uZXdWIG1pZE5hbWUodjEsdjIpLCBtaWRwdFxuICAgICAgICAgICAgZmxhZy5uZXdWIFwiaW5uZXJfI3tpfV9cIiArIG1pZE5hbWUodjEsdjIpLCBpbm5lcnB0XG4gICAgICAgICAgICAjIGFuZCBhZGQgdGhlIG9sZCBjb3JuZXItdmVydGV4XG4gICAgICAgICAgICBmbGFnLm5ld1YgXCIje3YyfVwiIHBvbHkudmVydGljZXNbdjJdXG4gICAgICAgICAgXG4gICAgICAgICAgICAjIHBlbnRhZ29uIGZvciBlYWNoIHZlcnRleCBpbiBvcmlnaW5hbCBmYWNlXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmI3tpfV8je3YyfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpLCBtaWROYW1lKHYxLCB2MilcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImYje2l9XyN7djJ9XCIsIG1pZE5hbWUodjEsIHYyKSwgXCIje3YyfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmI3tpfV8je3YyfVwiLCBcIiN7djJ9XCIsIG1pZE5hbWUodjIsIHYzKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiZiN7aX1fI3t2Mn1cIiwgbWlkTmFtZSh2MiwgdjMpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmI3tpfV8je3YyfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpXG4gICAgICBcbiAgICAgICAgICAgICMgaW5uZXIgcm90YXRlZCBmYWNlIG9mIHNhbWUgdmVydGV4LW51bWJlciBhcyBvcmlnaW5hbFxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiZl9pbl8je2l9XCIsIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYxLCB2MiksIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYyLCB2MylcbiAgICAgIFxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXSAjIHNoaWZ0IG92ZXIgb25lXG4gIFxuICAgIGZsYWcudG9wb2x5IFwicSN7cG9seS5uYW1lfVwiXG5cbiMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAwXG4jIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgIFxuIyAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAwMDAgICBcbiMgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAgICAgIDAwMCAgIFxuXG5pbnNldCA9IChwb2x5LCBpbnNldD0wLjUsIHBvcG91dD0tMC4yLCBuPTApIC0+XG4gIFxuICAgIGluc2V0ID0gY2xhbXAgMC4yNSAwLjk5IGluc2V0XG4gICAgcG9wb3V0ID0gbWluIHBvcG91dCwgaW5zZXRcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgIHAgPSBwb2x5LnZlcnRpY2VzW2ldXG4gICAgICAgIGZsYWcubmV3ViBcInYje2l9XCIgcFxuXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgaWYgZi5sZW5ndGggPT0gbiBvciBuID09IDBcbiAgICAgICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgICAgICBmbGFnLm5ld1YgXCJmI3tpfXYje3Z9XCIgYWRkIHR3ZWVuKHBvbHkudmVydGljZXNbdl0sY2VudGVyc1tpXSxpbnNldCksIG11bHQocG9wb3V0LG5vcm1hbHNbaV0pXG4gIFxuICAgIGZvdW5kQW55ID0gZmFsc2UgIyBhbGVydCBpZiBkb24ndCBmaW5kIGFueVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gXCJ2I3tmW2YubGVuZ3RoLTFdfVwiXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIHYyID0gXCJ2I3t2fVwiO1xuICAgICAgICAgICAgaWYgZi5sZW5ndGggPT0gbiBvciBuID09IDBcbiAgICAgICAgICAgICAgICBmb3VuZEFueSA9IHRydWVcbiAgICAgICAgICAgICAgICBmbmFtZSA9IGkgKyB2MVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgICAgICB2MSwgICAgICAgdjIpXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCAgICAgIHYyLCAgICAgICBcImYje2l9I3t2Mn1cIilcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsIFwiZiN7aX0je3YyfVwiLCAgXCJmI3tpfSN7djF9XCIpXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCBcImYje2l9I3t2MX1cIiwgIHYxKVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImV4I3tpfVwiLCBcImYje2l9I3t2MX1cIiwgIFwiZiN7aX0je3YyfVwiKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyhpLCB2MSwgdjIpICBcbiAgICAgICAgICAgIHYxPXYyXG4gIFxuICAgIGlmIG5vdCBmb3VuZEFueVxuICAgICAgICBrbG9nIFwiTm8gI3tufS1mb2xkIGNvbXBvbmVudHMgd2VyZSBmb3VuZC5cIlxuICBcbiAgICBmbGFnLnRvcG9seSBcIm4je259I3twb2x5Lm5hbWV9XCJcblxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcblxuZXh0cnVkZSA9IChwb2x5LCBwb3BvdXQ9MSwgaW5zZXRmPTAuNSwgbj0wKSAtPlxuICAgIG5ld3BvbHkgPSBpbnNldCBwb2x5LCBpbnNldGYsIHBvcG91dCwgblxuICAgIG5ld3BvbHkubmFtZSA9IFwieCN7bn0je3BvbHkubmFtZX1cIlxuICAgIG5ld3BvbHlcblxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIFxuXG5ob2xsb3cgPSAocG9seSwgaW5zZXRmLCB0aGlja25lc3MpIC0+XG5cbiAgICBpbnNldGYgPz0gMC41XG4gICAgaW5zZXRmICA9IGNsYW1wIDAuMSAwLjkgaW5zZXRmXG4gICAgdGhpY2tuZXNzID89IGluc2V0ZioyLzNcbiAgICB0aGlja25lc3MgPSBtaW4gaW5zZXRmKjIvMywgdGhpY2tuZXNzXG4gIFxuICAgIGR1YWxub3JtYWxzID0gZHVhbChwb2x5KS5ub3JtYWxzKClcbiAgICBub3JtYWxzID0gcG9seS5ub3JtYWxzKClcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXVxuICAgICAgICBwID0gcG9seS52ZXJ0aWNlc1tpXVxuICAgICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHBcbiAgICAgICAgZmxhZy5uZXdWIFwiZG93bnYje2l9XCIgYWRkIHAsIG11bHQgLTEqdGhpY2tuZXNzLGR1YWxub3JtYWxzW2ldXG5cbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICBmbGFnLm5ld1YgXCJmaW4je2l9diN7dn1cIiB0d2VlbiBwb2x5LnZlcnRpY2VzW3ZdLCBjZW50ZXJzW2ldLCBpbnNldGZcbiAgICAgICAgICAgIGZsYWcubmV3ViBcImZpbmRvd24je2l9diN7dn1cIiBhZGQgdHdlZW4ocG9seS52ZXJ0aWNlc1t2XSxjZW50ZXJzW2ldLGluc2V0ZiksIG11bHQoLTEqdGhpY2tuZXNzLG5vcm1hbHNbaV0pXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gXCJ2I3tmW2YubGVuZ3RoLTFdfVwiXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIHYyID0gXCJ2I3t2fVwiXG4gICAgICAgICAgICBmbmFtZSA9IGkgKyB2MVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCB2MSwgICAgICAgICAgICB2MlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCB2MiwgICAgICAgICAgICBcImZpbiN7aX0je3YyfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIFwiZmluI3tpfSN7djJ9XCIgXCJmaW4je2l9I3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBcImZpbiN7aX0je3YxfVwiIHYxXG4gICAgICBcbiAgICAgICAgICAgIGZuYW1lID0gXCJzaWRlcyN7aX0je3YxfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIFwiZmluI3tpfSN7djF9XCIgICAgIFwiZmluI3tpfSN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgXCJmaW4je2l9I3t2Mn1cIiAgICAgXCJmaW5kb3duI3tpfSN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgXCJmaW5kb3duI3tpfSN7djJ9XCIgXCJmaW5kb3duI3tpfSN7djF9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgXCJmaW5kb3duI3tpfSN7djF9XCIgXCJmaW4je2l9I3t2MX1cIlxuICAgICAgXG4gICAgICAgICAgICBmbmFtZSA9IFwiYm90dG9tI3tpfSN7djF9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgIFwiZG93biN7djJ9XCIgICAgICAgIFwiZG93biN7djF9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgIFwiZG93biN7djF9XCIgICAgICAgIFwiZmluZG93biN7aX0je3YxfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsICBcImZpbmRvd24je2l9I3t2MX1cIiBcImZpbmRvd24je2l9I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCAgXCJmaW5kb3duI3tpfSN7djJ9XCIgXCJkb3duI3t2Mn1cIlxuICAgICAgXG4gICAgICAgICAgICB2MSA9IHYyXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiSCN7cG9seS5uYW1lfVwiXG5cbiMgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwMDBcbiMgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuIyAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwICAgICAgMDAwICAgMDAwXG5cbnBlcnNwZWN0aXZhID0gKHBvbHkpIC0+ICMgYW4gb3BlcmF0aW9uIHJldmVyc2UtZW5naW5lZXJlZCBmcm9tIFBlcnNwZWN0aXZhIENvcnBvcnVtIFJlZ3VsYXJpdW1cblxuICAgICMga2xvZyBcInN0ZWxsYSBvZiAje3BvbHkubmFtZX1cIlxuICBcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKCkgIyBjYWxjdWxhdGUgZmFjZSBjZW50ZXJzXG4gIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgZmxhZy5uZXdWIFwidiN7aX1cIiBwb2x5LnZlcnRpY2VzW2ldXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIFxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0yXX1cIlxuICAgICAgICB2MiA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICB2ZXJ0MSA9IHBvbHkudmVydGljZXNbZltmLmxlbmd0aC0yXV1cbiAgICAgICAgdmVydDIgPSBwb2x5LnZlcnRpY2VzW2ZbZi5sZW5ndGgtMV1dXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIHYzID0gXCJ2I3t2fVwiXG4gICAgICAgICAgICB2ZXJ0MyA9IHBvbHkudmVydGljZXNbdl1cbiAgICAgICAgICAgIHYxMiA9IHYxK1wiflwiK3YyXG4gICAgICAgICAgICB2MjEgPSB2MitcIn5cIit2MVxuICAgICAgICAgICAgdjIzID0gdjIrXCJ+XCIrdjNcbiAgICAgIFxuICAgICAgICAgICAgIyBvbiBlYWNoIE5mYWNlLCBOIG5ldyBwb2ludHMgaW5zZXQgZnJvbSBlZGdlIG1pZHBvaW50cyB0b3dhcmRzIGNlbnRlciA9IFwic3RlbGxhdGVkXCIgcG9pbnRzXG4gICAgICAgICAgICBmbGFnLm5ld1YgdjEyLCBtaWRwb2ludCBtaWRwb2ludCh2ZXJ0MSx2ZXJ0MiksIGNlbnRlcnNbaV0gXG4gICAgICBcbiAgICAgICAgICAgICMgaW5zZXQgTmZhY2UgbWFkZSBvZiBuZXcsIHN0ZWxsYXRlZCBwb2ludHNcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImluI3tpfVwiIHYxMiwgdjIzXG4gICAgICBcbiAgICAgICAgICAgICMgbmV3IHRyaSBmYWNlIGNvbnN0aXR1dGluZyB0aGUgcmVtYWluZGVyIG9mIHRoZSBzdGVsbGF0ZWQgTmZhY2VcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImYje2l9I3t2Mn1cIiB2MjMsIHYxMlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiZiN7aX0je3YyfVwiIHYxMiwgdjJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImYje2l9I3t2Mn1cIiB2MiwgIHYyM1xuICAgICAgXG4gICAgICAgICAgICAjIG9uZSBvZiB0aGUgdHdvIG5ldyB0cmlhbmdsZXMgcmVwbGFjaW5nIG9sZCBlZGdlIGJldHdlZW4gdjEtPnYyXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmI3t2MTJ9XCIgdjEsICB2MjFcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImYje3YxMn1cIiB2MjEsIHYxMlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiZiN7djEyfVwiIHYxMiwgdjFcbiAgICAgIFxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXSAgIyBjdXJyZW50IGJlY29tZXMgcHJldmlvdXNcbiAgICAgICAgICAgIFt2ZXJ0MSwgdmVydDJdID0gW3ZlcnQyLCB2ZXJ0M11cbiAgXG4gICAgZmxhZy50b3BvbHkgXCJQI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuXG50cmlzdWIgPSAocG9seSwgbj0yKSAtPlxuICAgIFxuICAgICMgTm8tT3AgZm9yIG5vbi10cmlhbmd1bGFyIG1lc2hlc1xuICAgIGZvciBmbiBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBpZiBwb2x5LmZhY2VzW2ZuXS5sZW5ndGggIT0gM1xuICAgICAgICAgICAgcmV0dXJuIHBvbHlcbiAgXG4gICAgbmV3VnMgPSBbXVxuICAgIHZtYXAgPSB7fVxuICAgIHBvcyA9IDBcbiAgICBmb3IgZm4gaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbZm5dXG4gICAgICAgIFtpMSwgaTIsIGkzXSA9IGYuc2xpY2UgLTNcbiAgICAgICAgdjEgPSBwb2x5LnZlcnRpY2VzW2kxXVxuICAgICAgICB2MiA9IHBvbHkudmVydGljZXNbaTJdXG4gICAgICAgIHYzID0gcG9seS52ZXJ0aWNlc1tpM11cbiAgICAgICAgdjIxID0gc3ViIHYyLCB2MVxuICAgICAgICB2MzEgPSBzdWIgdjMsIHYxXG4gICAgICAgIGZvciBpIGluIFswLi5uXVxuICAgICAgICAgICAgZm9yIGogaW4gWzAuLm4taV1cbiAgICAgICAgICAgICAgICB2ID0gYWRkIGFkZCh2MSwgbXVsdChpL24sIHYyMSkpLCBtdWx0KGovbiwgdjMxKVxuICAgICAgICAgICAgICAgIHZtYXBbXCJ2I3tmbn0tI3tpfS0je2p9XCJdID0gcG9zKytcbiAgICAgICAgICAgICAgICBuZXdWcy5wdXNoIHZcbiAgXG4gICAgRVBTSUxPTl9DTE9TRSA9IDEuMGUtOFxuICAgIHVuaXFWcyA9IFtdXG4gICAgbmV3cG9zID0gMFxuICAgIHVuaXFtYXAgPSB7fVxuICAgIGZvciB2LGkgaW4gbmV3VnNcbiAgICAgICAgaWYgaSBpbiB1bmlxbWFwIHRoZW4gY29udGludWUgIyBhbHJlYWR5IG1hcHBlZFxuICAgICAgICB1bmlxbWFwW2ldID0gbmV3cG9zXG4gICAgICAgIHVuaXFWcy5wdXNoIHZcbiAgICAgICAgZm9yIGogaW4gW2krMS4uLm5ld1ZzLmxlbmd0aF1cbiAgICAgICAgICAgIHcgPSBuZXdWc1tqXVxuICAgICAgICAgICAgaWYgbWFnKHN1Yih2LCB3KSkgPCBFUFNJTE9OX0NMT1NFXG4gICAgICAgICAgICAgICAgdW5pcW1hcFtqXSA9IG5ld3Bvc1xuICAgICAgICBuZXdwb3MrK1xuICBcbiAgICBmYWNlcyA9IFtdXG4gICAgZm9yIGZuIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGZvciBpIGluIFswLi4ubl1cbiAgICAgICAgICAgIGZvciBqIGluIFswLi4ubi1pXVxuICAgICAgICAgICAgICAgIGZhY2VzLnB1c2ggW3VuaXFtYXBbdm1hcFtcInYje2ZufS0je2l9LSN7an1cIl1dLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpKzF9LSN7an1cIl1dLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2orMX1cIl1dXVxuICAgICAgICBmb3IgaSBpbiBbMS4uLm5dXG4gICAgICAgICAgICBmb3IgaiBpbiBbMC4uLm4taV1cbiAgICAgICAgICAgICAgICBmYWNlcy5wdXNoIFt1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2p9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqKzF9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aS0xfS0je2orMX1cIl1dXVxuICBcbiAgICAjIGtsb2cgJ2ZhY2VzJyBmYWNlc1xuICAgICMga2xvZyAndmVydGljZXMnIHVuaXFWcyAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBcbiAgICBuZXcgUG9seWhlZHJvbiBcInUje259I3twb2x5Lm5hbWV9XCIgZmFjZXMsIHVuaXFWc1xuXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4jIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbmNhbm9uaWNhbGl6ZSA9IChwb2x5LCBpdGVyPTIwMCkgLT5cblxuICAgICMga2xvZyBcImNhbm9uaWNhbGl6ZSAje3BvbHkubmFtZX1cIlxuICAgIGZhY2VzID0gcG9seS5mYWNlc1xuICAgIGVkZ2VzID0gcG9seS5lZGdlcygpXG4gICAgbmV3VnMgPSBwb2x5LnZlcnRpY2VzXG4gICAgbWF4Q2hhbmdlID0gMS4wICMgY29udmVyZ2VuY2UgdHJhY2tlclxuICAgIGZvciBpIGluIFswLi5pdGVyXVxuICAgICAgICBvbGRWcyA9IGNvcHlWZWNBcnJheSBuZXdWc1xuICAgICAgICBuZXdWcyA9IHRhbmdlbnRpZnkgbmV3VnMsIGVkZ2VzXG4gICAgICAgIG5ld1ZzID0gcmVjZW50ZXIgbmV3VnMsIGVkZ2VzXG4gICAgICAgIG5ld1ZzID0gcGxhbmFyaXplIG5ld1ZzLCBmYWNlc1xuICAgICAgICBtYXhDaGFuZ2UgPSBfLm1heCBfLm1hcCBfLnppcChuZXdWcywgb2xkVnMpLCAoW3gsIHldKSAtPiBtYWcgc3ViIHgsIHlcbiAgICAgICAgaWYgbWF4Q2hhbmdlIDwgMWUtOFxuICAgICAgICAgICAgYnJlYWtcbiAgICAjIG9uZSBzaG91bGQgbm93IHJlc2NhbGUsIGJ1dCBub3QgcmVzY2FsaW5nIGhlcmUgbWFrZXMgZm9yIHZlcnkgaW50ZXJlc3RpbmcgbnVtZXJpY2FsXG4gICAgIyBpbnN0YWJpbGl0aWVzIHRoYXQgbWFrZSBpbnRlcmVzdGluZyBtdXRhbnRzIG9uIG11bHRpcGxlIGFwcGxpY2F0aW9ucy4uLlxuICAgICMgbW9yZSBleHBlcmllbmNlIHdpbGwgdGVsbCB3aGF0IHRvIGRvXG4gICAgbmV3VnMgPSByZXNjYWxlKG5ld1ZzKVxuICAgICMga2xvZyBcIltjYW5vbmljYWxpemF0aW9uIGRvbmUsIGxhc3QgfGRlbHRhVnw9I3ttYXhDaGFuZ2V9XVwiXG4gICAgbmV3cG9seSA9IG5ldyBQb2x5aGVkcm9uIHBvbHkubmFtZSwgcG9seS5mYWNlcywgbmV3VnNcbiAgICAjIGtsb2cgXCJjYW5vbmljYWxpemVcIiBuZXdwb2x5XG4gICAgbmV3cG9seVxuICAgIFxuY2Fub25pY2FsWFlaID0gKHBvbHksIGl0ZXJhdGlvbnMpIC0+XG5cbiAgICBpdGVyYXRpb25zID89IDFcbiAgICBkcG9seSA9IGR1YWwgcG9seVxuICAgICMga2xvZyBcImNhbm9uaWNhbFhZWiAje3BvbHkubmFtZX1cIlxuICBcbiAgICBmb3IgY291bnQgaW4gWzAuLi5pdGVyYXRpb25zXSAjIHJlY2lwcm9jYXRlIGZhY2Ugbm9ybWFsc1xuICAgICAgICBkcG9seS52ZXJ0aWNlcyA9IHJlY2lwcm9jYWxOIHBvbHlcbiAgICAgICAgcG9seS52ZXJ0aWNlcyAgPSByZWNpcHJvY2FsTiBkcG9seVxuICBcbiAgICBuZXcgUG9seWhlZHJvbiBwb2x5Lm5hbWUsIHBvbHkuZmFjZXMsIHBvbHkudmVydGljZXNcblxuZmxhdHRlbiA9IChwb2x5LCBpdGVyYXRpb25zKSAtPiAjIHF1aWNrIHBsYW5hcml6YXRpb25cbiAgICBcbiAgICBpdGVyYXRpb25zID89IDFcbiAgICBkcG9seSA9IGR1YWwgcG9seSAjIHYncyBvZiBkdWFsIGFyZSBpbiBvcmRlciBvZiBhcmcncyBmJ3NcbiAgICAjIGtsb2cgXCJmbGF0dGVuICN7cG9seS5uYW1lfVwiXG4gIFxuICAgIGZvciBjb3VudCBpbiBbMC4uLml0ZXJhdGlvbnNdICMgcmVjaXByb2NhdGUgZmFjZSBjZW50ZXJzXG4gICAgICAgIGRwb2x5LnZlcnRpY2VzID0gcmVjaXByb2NhbEMgcG9seVxuICAgICAgICBwb2x5LnZlcnRpY2VzICA9IHJlY2lwcm9jYWxDIGRwb2x5XG4gIFxuICAgIG5ldyBQb2x5aGVkcm9uIHBvbHkubmFtZSwgcG9seS5mYWNlcywgcG9seS52ZXJ0aWNlc1xuICAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICBcbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgICBkdWFsOiAgICAgICAgICAgZHVhbFxuICAgIHRyaXN1YjogICAgICAgICB0cmlzdWJcbiAgICBwZXJzcGVjdGl2YTogICAgcGVyc3BlY3RpdmFcbiAgICBraXM6ICAgICAgICAgICAga2lzXG4gICAgYW1ibzogICAgICAgICAgIGFtYm9cbiAgICBneXJvOiAgICAgICAgICAgZ3lyb1xuICAgIGNoYW1mZXI6ICAgICAgICBjaGFtZmVyXG4gICAgd2hpcmw6ICAgICAgICAgIHdoaXJsXG4gICAgcXVpbnRvOiAgICAgICAgIHF1aW50b1xuICAgIGluc2V0OiAgICAgICAgICBpbnNldFxuICAgIGV4dHJ1ZGU6ICAgICAgICBleHRydWRlXG4gICAgaG9sbG93OiAgICAgICAgIGhvbGxvd1xuICAgIGZsYXR0ZW46ICAgICAgICBmbGF0dGVuXG4gICAgemlya3VsYXJpemU6ICAgIHppcmt1bGFyaXplXG4gICAgY2Fub25pY2FsaXplOiAgIGNhbm9uaWNhbGl6ZVxuICAgIGNhbm9uaWNhbFhZWjogICBjYW5vbmljYWxYWVpcbiAgICAiXX0=
//# sourceURL=../../coffee/poly/topo.coffee