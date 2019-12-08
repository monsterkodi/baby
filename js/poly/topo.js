// koffee 1.6.0

/*
000000000   0000000   00000000    0000000     
   000     000   000  000   000  000   000    
   000     000   000  00000000   000   000    
   000     000   000  000        000   000    
   000      0000000   000         0000000
 */
var Flag, Polyhedron, _, abs, acos, add, ambo, calcCentroid, canonicalXYZ, canonicalize, chamfer, chamfer1, chamfer2, clamp, copyVecArray, cross, dot, dual, extrude, flatten, gyro, hollow, inset, intersect, kis, klog, mag, midName, midpoint, min, mult, neg, oneThird, perspectiva, planarize, pointPlaneDist, quinto, rayPlane, rayRay, recenter, reciprocalC, reciprocalN, ref, ref1, ref2, reflect, rescale, rotate, sub, tangentify, trisub, tween, unit, whirl, zirkularize,
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
    return flag.topoly("g" + poly.name);
};

reflect = function(poly) {
    var i, l, m, ref3, ref4;
    klog("reflection of " + poly.name);
    for (i = l = 0, ref3 = poly.vertices.length; 0 <= ref3 ? l < ref3 : l > ref3; i = 0 <= ref3 ? ++l : --l) {
        poly.vertices[i] = mult(-1, poly.vertices[i]);
    }
    for (i = m = 0, ref4 = poly.faces.length; 0 <= ref4 ? m < ref4 : m > ref4; i = 0 <= ref4 ? ++m : --m) {
        poly.faces[i] = poly.faces[i].reverse();
    }
    poly.name = "r" + poly.name;
    return poly;
};

chamfer = function(poly, factor) {
    var centers, e0, e1, edge, edgeLength, flag, l, len, len1, len2, m, minEdgeLength, moved, n_h, n_t, nf, nl, nnl, nnr, normals, npl, npr, nr, o, pl, planeNormal, pr, wings;
    if (factor == null) {
        factor = 0.5;
    }
    factor = clamp(0.001, 0.995, factor);
    flag = new Flag();
    normals = poly.normals();
    centers = poly.centers();
    wings = poly.wings();
    minEdgeLength = 2e308;
    planeNormal = function(edge, e0, e1) {
        var dir, dl, dr;
        dir = sub(e1, e0);
        dr = unit(cross(normals[edge[2].fr], dir));
        dl = unit(cross(dir, normals[edge[2].fl]));
        return unit(cross(dir, cross(dir, unit(add(dr, dl)))));
    };
    for (l = 0, len = wings.length; l < len; l++) {
        edge = wings[l];
        e0 = poly.vertices[edge[0]];
        e1 = poly.vertices[edge[1]];
        edgeLength = mag(sub(e0, e1));
        minEdgeLength = min(minEdgeLength, edgeLength / 2);
    }
    minEdgeLength *= factor;
    klog(poly.name, minEdgeLength);
    moved = {};
    for (m = 0, len1 = wings.length; m < len1; m++) {
        edge = wings[m];
        e0 = poly.vertices[edge[0]];
        e1 = poly.vertices[edge[1]];
        moved["" + edge[1] + edge[0] + "l"] = moved["" + edge[0] + edge[1] + "r"] = [add(e0, mult(minEdgeLength, unit(sub(poly.vertices[edge[2].pr], e0)))), add(e1, mult(minEdgeLength, unit(sub(poly.vertices[edge[2].nr], e1))))];
        moved["" + edge[1] + edge[0] + "r"] = moved["" + edge[0] + edge[1] + "l"] = [add(e0, mult(minEdgeLength, unit(sub(poly.vertices[edge[2].pl], e0)))), add(e1, mult(minEdgeLength, unit(sub(poly.vertices[edge[2].nl], e1))))];
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
        nr = rayRay(moved["" + edge[0] + edge[1] + "r"], moved["" + edge[1] + edge[2].nr + "r"]);
        nl = rayRay(moved["" + edge[0] + edge[1] + "l"], moved["" + edge[1] + edge[2].nl + "l"]);
        pr = rayRay(moved["" + edge[0] + edge[1] + "r"], moved["" + edge[2].pr + edge[0] + "r"]);
        pl = rayRay(moved["" + edge[0] + edge[1] + "l"], moved["" + edge[2].pl + edge[0] + "l"]);
        if (flag.newV(nnr, nr)) {
            klog('nnr');
        }
        if (flag.newV(nnl, nl)) {
            klog('nnl');
        }
        if (flag.newV(npl, pl)) {
            klog('npl');
        }
        if (flag.newV(npr, pr)) {
            klog('npr');
        }
        flag.newFlag(nf, nnr, npr);
        flag.newFlag(nf, npr, npl);
        flag.newFlag(nf, npl, nnl);
        flag.newFlag(nf, nnl, nnr);
    }
    return flag.topoly("c" + poly.name);
};

chamfer1 = function(poly, factor) {
    var centers, cutDepth, e0, e1, edge, flag, he, head, l, len, len1, m, menl, menr, mepl, mepr, minDepth, n_h, n_t, nf, nl, nnl, nnr, normals, npl, npr, nr, pl, planeNormal, pnm, pr, tail, te, wings;
    if (factor == null) {
        factor = 0.5;
    }
    factor = clamp(0.001, 0.995, factor);
    flag = new Flag();
    normals = poly.normals();
    centers = poly.centers();
    wings = poly.wings();
    minDepth = 2e308;
    klog(poly.name);
    planeNormal = function(edge, e0, e1) {
        var dir, dl, dr;
        dir = sub(e1, e0);
        dr = unit(cross(normals[edge[2].fr], dir));
        dl = unit(cross(dir, normals[edge[2].fl]));
        return unit(cross(dir, cross(dir, unit(add(dr, dl)))));
    };
    for (l = 0, len = wings.length; l < len; l++) {
        edge = wings[l];
        e0 = poly.vertices[edge[0]];
        e1 = poly.vertices[edge[1]];
        pnm = planeNormal(edge, e0, e1);
        minDepth = Math.min(minDepth, mag(sub(e0, rayPlane([0, 0, 0], e0, centers[edge[2].fr], pnm))));
        minDepth = Math.min(minDepth, mag(sub(e1, rayPlane([0, 0, 0], e1, centers[edge[2].fr], pnm))));
        minDepth = Math.min(minDepth, mag(sub(e1, rayPlane([0, 0, 0], e1, centers[edge[2].fl], pnm))));
        minDepth = Math.min(minDepth, mag(sub(e0, rayPlane([0, 0, 0], e0, centers[edge[2].fl], pnm))));
    }
    cutDepth = factor * minDepth;
    for (m = 0, len1 = wings.length; m < len1; m++) {
        edge = wings[m];
        e0 = poly.vertices[edge[0]];
        e1 = poly.vertices[edge[1]];
        pnm = planeNormal(edge, e0, e1);
        he = sub(e1, mult(cutDepth, pnm));
        te = sub(e0, mult(cutDepth, pnm));
        head = rayPlane([0, 0, 0], e1, he, pnm);
        tail = rayPlane([0, 0, 0], e0, te, pnm);
        menr = unit(add(unit(sub(e0, e1)), unit(sub(poly.vertices[edge[2].nr], e1))));
        menl = unit(add(unit(sub(e0, e1)), unit(sub(poly.vertices[edge[2].nl], e1))));
        mepr = unit(add(unit(sub(e1, e0)), unit(sub(poly.vertices[edge[2].pr], e0))));
        mepl = unit(add(unit(sub(e1, e0)), unit(sub(poly.vertices[edge[2].pl], e0))));
        nr = rayPlane(e1, menr, head, pnm);
        nl = rayPlane(e1, menl, head, pnm);
        pr = rayPlane(e0, mepr, tail, pnm);
        pl = rayPlane(e0, mepl, tail, pnm);
        nf = edge[0] + "▸" + edge[1];
        n_h = "" + edge[1];
        n_t = "" + edge[0];
        nnr = n_h + "▸" + edge[2].fr;
        nnl = n_h + "▸" + edge[2].fl;
        npr = n_t + "▸" + edge[2].fr;
        npl = n_t + "▸" + edge[2].fl;
        if (flag.newV(n_h, head)) {
            klog('n_h');
        }
        if (flag.newV(n_t, tail)) {
            klog('n_t');
        }
        if (flag.newV(nnr, nr)) {
            klog('nnr');
        }
        if (flag.newV(nnl, nl)) {
            klog('nnl');
        }
        if (flag.newV(npl, pl)) {
            klog('npl');
        }
        if (flag.newV(npr, pr)) {
            klog('npr');
        }
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

chamfer2 = function(poly, factor) {
    var centers, e0, e0fl, e0fr, e1, e1fl, e1fr, edge, edir, emp, faceAngle, flag, l, len, mpl, mpr, n_h, n_t, nf, nfl, nfn, nfr, nl, nmp, nnl, nnr, normals, npl, npr, nr, pl, pr, wings;
    if (factor == null) {
        factor = 0.5;
    }
    factor = clamp(0.001, 0.995, factor);
    flag = new Flag();
    normals = poly.normals();
    centers = poly.centers();
    wings = poly.wings();
    for (l = 0, len = wings.length; l < len; l++) {
        edge = wings[l];
        e0 = poly.vertices[edge[0]];
        e1 = poly.vertices[edge[1]];
        nfl = normals[edge[2].fl];
        nfr = normals[edge[2].fr];
        emp = midpoint(e0, e1);
        edir = sub(e1, e0);
        faceAngle = acos(dot(nfl, nfr));
        mpr = rotate(emp, edir, -factor * faceAngle / 2);
        mpl = rotate(emp, edir, factor * faceAngle / 2);
        e1fr = sub(centers[edge[2].fr], e1);
        e1fl = sub(centers[edge[2].fl], e1);
        e0fr = sub(centers[edge[2].fr], e0);
        e0fl = sub(centers[edge[2].fl], e0);
        nr = rayPlane(mpr, edir, e1, unit(cross(nfr, e1fr)));
        nl = rayPlane(mpl, edir, e1, unit(cross(nfl, e1fl)));
        pr = rayPlane(mpr, neg(edir), e0, unit(cross(nfr, e0fr)));
        pl = rayPlane(mpl, neg(edir), e0, unit(cross(nfl, e0fl)));
        nf = edge[0] + "▸" + edge[1];
        n_h = "" + edge[1];
        n_t = "" + edge[0];
        nnr = n_h + "▸" + edge[2].fr;
        nnl = n_h + "▸" + edge[2].fl;
        npr = n_t + "▸" + edge[2].fr;
        npl = n_t + "▸" + edge[2].fl;
        nfn = unit(emp);
        nmp = midpoint(nr, pl);
        flag.newV(n_h, rayPlane([0, 0, 0], e1, nmp, nfn));
        flag.newV(n_t, rayPlane([0, 0, 0], e0, nmp, nfn));
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
    klog("whirl of " + poly.name);
    if (n != null) {
        n;
    } else {
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
    return flag.topoly("w" + poly.name);
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

inset = function(poly, n, inset_dist, popout_dist) {
    var centers, f, flag, fname, foundAny, i, l, len, len1, m, normals, o, p, q, ref3, ref4, ref5, s, v, v1, v2;
    if (n != null) {
        n;
    } else {
        n = 0;
    }
    if (inset_dist != null) {
        inset_dist;
    } else {
        inset_dist = 0.5;
    }
    if (popout_dist != null) {
        popout_dist;
    } else {
        popout_dist = -0.2;
    }
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
                flag.newV("f" + i + "v" + v, add(tween(poly.vertices[v], centers[i], inset_dist), mult(popout_dist, normals[i])));
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

extrude = function(poly, n, popout, insetf) {
    var newpoly;
    if (popout == null) {
        popout = 1;
    }
    if (insetf == null) {
        insetf = 0.5;
    }
    newpoly = inset(poly, n, insetf, popout);
    newpoly.name = "x" + n + poly.name;
    return newpoly;
};

hollow = function(poly, inset_dist, thickness) {
    var centers, dualnormals, f, flag, fname, i, l, len, len1, m, normals, o, p, q, ref3, ref4, ref5, s, v, v1, v2;
    if (inset_dist != null) {
        inset_dist;
    } else {
        inset_dist = 0.5;
    }
    if (thickness != null) {
        thickness;
    } else {
        thickness = 0.2;
    }
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
            flag.newV("fin" + i + "v" + v, tween(poly.vertices[v], centers[i], inset_dist));
            flag.newV("findown" + i + "v" + v, add(tween(poly.vertices[v], centers[i], inset_dist), mult(-1 * thickness, normals[i])));
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
    reflect: reflect,
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9wby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsaWRBQUE7SUFBQTs7QUF3QkEsTUFBcUIsT0FBQSxDQUFRLEtBQVIsQ0FBckIsRUFBRSxpQkFBRixFQUFTLGVBQVQsRUFBZTs7QUFDZixPQUE2SixPQUFBLENBQVEsUUFBUixDQUE3SixFQUFFLGNBQUYsRUFBTyxjQUFQLEVBQVksY0FBWixFQUFpQixnQkFBakIsRUFBdUIsY0FBdkIsRUFBNEIsY0FBNUIsRUFBaUMsZ0JBQWpDLEVBQXVDLGtCQUF2QyxFQUE4QyxvQkFBOUMsRUFBc0Qsd0JBQXRELEVBQWdFLGtCQUFoRSxFQUF1RSwwQkFBdkUsRUFBa0Ysb0JBQWxGLEVBQTBGLHdCQUExRixFQUFvRyxvQ0FBcEcsRUFBb0gsd0JBQXBILEVBQThILGdDQUE5SCxFQUE0STs7QUFDNUksT0FBeUUsT0FBQSxDQUFRLE9BQVIsQ0FBekUsRUFBRSw0QkFBRixFQUFjLDhCQUFkLEVBQTJCLDhCQUEzQixFQUF3Qyx3QkFBeEMsRUFBa0Qsc0JBQWxELEVBQTJEOztBQUN6RCxjQUFGLEVBQU8sY0FBUCxFQUFZOztBQUVaLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7QUFDUCxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0FBRWIsT0FBQSxHQUFVLFNBQUMsRUFBRCxFQUFLLEVBQUw7V0FBWSxFQUFBLEdBQUcsRUFBSCxJQUFVLENBQUcsRUFBRCxHQUFJLEdBQUosR0FBTyxFQUFULENBQVYsSUFBMkIsQ0FBRyxFQUFELEdBQUksR0FBSixHQUFPLEVBQVQ7QUFBdkM7O0FBUVYsV0FBQSxHQUFjLFNBQUMsSUFBRCxFQUFPLENBQVA7QUFFVixRQUFBOztRQUFBOztRQUFBLElBQUs7O0lBQ0wsUUFBQSxHQUFXO0FBRVgsU0FBUywrRkFBVDtRQUNJLENBQUEsR0FBSSxJQUFJLENBQUMsS0FBTSxDQUFBLENBQUE7UUFDZixJQUFH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QWdCLFlBaEJoQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgIFxuICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAgIFxuIyMjXG4jXG4jIFBvbHlow6lkcm9uaXNtZSwgQ29weXJpZ2h0IDIwMTksIEFuc2VsbSBMZXZza2F5YSwgTUlUIExpY2Vuc2VcbiNcbiMgUG9seWhlZHJvbiBPcGVyYXRvcnNcbiNcbiMgZm9yIGVhY2ggdmVydGV4IG9mIG5ldyBwb2x5aGVkcm9uXG4jICAgICBjYWxsIG5ld1YoVm5hbWUsIHh5eikgd2l0aCBhIHN5bWJvbGljIG5hbWUgYW5kIGNvb3JkaW5hdGVzXG4jXG4jIGZvciBlYWNoIGZsYWcgb2YgbmV3IHBvbHloZWRyb25cbiMgICAgIGNhbGwgbmV3RmxhZyhGbmFtZSwgVm5hbWUxLCBWbmFtZTIpIHdpdGggYSBzeW1ib2xpYyBuYW1lIGZvciB0aGUgbmV3IGZhY2VcbiMgICAgIGFuZCB0aGUgc3ltYm9saWMgbmFtZSBmb3IgdHdvIHZlcnRpY2VzIGZvcm1pbmcgYW4gb3JpZW50ZWQgZWRnZVxuI1xuIyBPcmllbnRhdGlvbiBtdXN0IGJlIGRlYWx0IHdpdGggcHJvcGVybHkgdG8gbWFrZSBhIG1hbmlmb2xkIG1lc2hcbiMgU3BlY2lmaWNhbGx5LCBubyBlZGdlIHYxLT52MiBjYW4gZXZlciBiZSBjcm9zc2VkIGluIHRoZSBzYW1lIGRpcmVjdGlvbiBieSB0d28gZGlmZmVyZW50IGZhY2VzXG4jIGNhbGwgdG9wb2x5KCkgdG8gYXNzZW1ibGUgZmxhZ3MgaW50byBwb2x5aGVkcm9uIHN0cnVjdHVyZSBieSBmb2xsb3dpbmcgdGhlIG9yYml0c1xuIyBvZiB0aGUgdmVydGV4IG1hcHBpbmcgc3RvcmVkIGluIHRoZSBmbGFnc2V0IGZvciBlYWNoIG5ldyBmYWNlXG5cbnsgY2xhbXAsIGtsb2csIF8gfSA9IHJlcXVpcmUgJ2t4aydcbnsgZG90LCBhZGQsIG5lZywgbXVsdCwgbWFnLCBzdWIsIHVuaXQsIGNyb3NzLCByb3RhdGUsIG9uZVRoaXJkLCB0d2VlbiwgaW50ZXJzZWN0LCByYXlSYXksIHJheVBsYW5lLCBwb2ludFBsYW5lRGlzdCwgbWlkcG9pbnQsIGNhbGNDZW50cm9pZCwgY29weVZlY0FycmF5IH0gPSByZXF1aXJlICcuL21hdGgnXG57IHRhbmdlbnRpZnksIHJlY2lwcm9jYWxDLCByZWNpcHJvY2FsTiwgcmVjZW50ZXIsIHJlc2NhbGUsIHBsYW5hcml6ZSB9ID0gcmVxdWlyZSAnLi9nZW8nXG57IG1pbiwgYWJzLCBhY29zIH0gPSBNYXRoXG5cbkZsYWcgPSByZXF1aXJlICcuL2ZsYWcnXG5Qb2x5aGVkcm9uID0gcmVxdWlyZSAnLi9wb2x5aGVkcm9uJ1xuXG5taWROYW1lID0gKHYxLCB2MikgLT4gdjE8djIgYW5kIFwiI3t2MX1fI3t2Mn1cIiBvciBcIiN7djJ9XyN7djF9XCIgIyB1bmlxdWUgbmFtZXMgb2YgbWlkcG9pbnRzXG5cbiMgMDAwMDAwMCAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAgIDAwMCAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiMgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG56aXJrdWxhcml6ZSA9IChwb2x5LCBuKSAtPlxuICAgIFxuICAgIG4gPz0gMFxuICAgIHZlcnRpY2VzID0gW11cbiAgICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBpZiBmLmxlbmd0aCA9PSBuIG9yIG4gPT0gMFxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlIC0yXG4gICAgICAgICAgICBmb3IgdjMgaW4gZlxuICAgICAgICAgICAgICAgIHYxMiA9IHN1YiBwb2x5LnZlcnRpY2VzW3YyXSwgcG9seS52ZXJ0aWNlc1t2MV1cbiAgICAgICAgICAgICAgICB2MzIgPSBzdWIgcG9seS52ZXJ0aWNlc1t2Ml0sIHBvbHkudmVydGljZXNbdjNdXG4gICAgICAgICAgICAgICAgaWYgYWJzKG1hZyh2MTIpIC0gbWFnKHYzMikpID4gMC4wMDFcbiAgICAgICAgICAgICAgICAgICAgbTEyID0gbWlkcG9pbnQgcG9seS52ZXJ0aWNlc1t2MV0sIHBvbHkudmVydGljZXNbdjJdXG4gICAgICAgICAgICAgICAgICAgIG0zMiA9IG1pZHBvaW50IHBvbHkudmVydGljZXNbdjNdLCBwb2x5LnZlcnRpY2VzW3YyXVxuICAgICAgICAgICAgICAgICAgICB1MTIgPSB1bml0IG0xMlxuICAgICAgICAgICAgICAgICAgICB1MzIgPSB1bml0IG0zMlxuICAgICAgICAgICAgICAgICAgICBuYyA9IGFkZCB1MTIsIHUzMlxuICAgICAgICAgICAgICAgICAgICBwbiA9IGNyb3NzIG5jLCBjcm9zcyBwb2x5LnZlcnRpY2VzW3YxXSwgcG9seS52ZXJ0aWNlc1t2M11cbiAgICAgICAgICAgICAgICAgICAgaWYgbWFnKHYxMikgPiBtYWcodjMyKVxuICAgICAgICAgICAgICAgICAgICAgICAgciA9IHJheVBsYW5lIHBvbHkudmVydGljZXNbdjNdLCB2MzIsIFswIDAgMF0sIHBuXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHIgPSByYXlQbGFuZSBwb2x5LnZlcnRpY2VzW3YxXSwgdjEyLCBbMCAwIDBdLCBwblxuICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNlc1t2Ml0gPSByXG4gICAgICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICBcbiAgICB2ZXJ0cyA9IFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdLm1hcCAoaSkgLT4gdmVydGljZXNbaV0gPyBwb2x5LnZlcnRpY2VzW2ldXG4gICAgXG4gICAgbmV3IFBvbHloZWRyb24gXCJ6I3twb2x5Lm5hbWV9XCIgcG9seS5mYWNlcywgdmVydHNcblxuIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG5cbmR1YWwgPSAocG9seSkgLT5cblxuICAgICMga2xvZyBcImR1YWwgI3twb2x5Lm5hbWV9XCIgXG4gIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZhY2UgPSBbXSBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXSBcbiAgICAgICAgZmFjZVtpXSA9IHt9XG5cbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IGZbZi5sZW5ndGgtMV0gIyBsYXN0IHZlcnRleFxuICAgICAgICBmb3IgdjIgaW4gZiAjIGFzc3VtZXMgdGhhdCBubyAyIGZhY2VzIHNoYXJlIGFuIGVkZ2UgaW4gdGhlIHNhbWUgb3JpZW50YXRpb24hXG4gICAgICAgICAgICBmYWNlW3YxXVtcInYje3YyfVwiXSA9IFwiI3tpfVwiXG4gICAgICAgICAgICB2MSA9IHYyICMgY3VycmVudCBiZWNvbWVzIHByZXZpb3VzXG4gIFxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGZsYWcubmV3ViBcIiN7aX1cIiBjZW50ZXJzW2ldXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gZltmLmxlbmd0aC0xXSAjcHJldmlvdXMgdmVydGV4XG4gICAgICAgIGZvciB2MiBpbiBmXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgdjEsIGZhY2VbdjJdW1widiN7djF9XCJdLCBcIiN7aX1cIlxuICAgICAgICAgICAgdjE9djIgIyBjdXJyZW50IGJlY29tZXMgcHJldmlvdXNcbiAgXG4gICAgZHBvbHkgPSBmbGFnLnRvcG9seSgpICMgYnVpbGQgdG9wb2xvZ2ljYWwgZHVhbCBmcm9tIGZsYWdzXG4gIFxuICAgICMgbWF0Y2ggRiBpbmRleCBvcmRlcmluZyB0byBWIGluZGV4IG9yZGVyaW5nIG9uIGR1YWxcbiAgICBzb3J0RiA9IFtdXG4gICAgZm9yIGYgaW4gZHBvbHkuZmFjZXNcbiAgICAgICAgayA9IGludGVyc2VjdCBwb2x5LmZhY2VzW2ZbMF1dLCBwb2x5LmZhY2VzW2ZbMV1dLCBwb2x5LmZhY2VzW2ZbMl1dXG4gICAgICAgIHNvcnRGW2tdID0gZlxuICAgIGRwb2x5LmZhY2VzID0gc29ydEZcbiAgXG4gICAgaWYgcG9seS5uYW1lWzBdICE9IFwiZFwiXG4gICAgICAgIGRwb2x5Lm5hbWUgPSBcImQje3BvbHkubmFtZX1cIlxuICAgIGVsc2UgXG4gICAgICAgIGRwb2x5Lm5hbWUgPSBwb2x5Lm5hbWUuc2xpY2UgMVxuICBcbiAgICBkcG9seVxuXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG4jIEtpcyAoYWJicmV2aWF0ZWQgZnJvbSB0cmlha2lzKSB0cmFuc2Zvcm1zIGFuIE4tc2lkZWQgZmFjZSBpbnRvIGFuIE4tcHlyYW1pZCByb290ZWQgYXQgdGhlXG4jIHNhbWUgYmFzZSB2ZXJ0aWNlcy4gb25seSBraXMgbi1zaWRlZCBmYWNlcywgYnV0IG49PTAgbWVhbnMga2lzIGFsbC5cblxua2lzID0gKHBvbHksIG4sIGFwZXhkaXN0KSAtPlxuXG4gICAgbiA/PSAwXG4gICAgYXBleGRpc3QgPz0gMFxuXG4gICAgIyBrbG9nIFwia2lzIG9mICN7biBhbmQgXCIje259LXNpZGVkIGZhY2VzIG9mIFwiIG9yICcnfSN7cG9seS5uYW1lfVwiXG5cbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgIHAgPSBwb2x5LnZlcnRpY2VzW2ldICMgZWFjaCBvbGQgdmVydGV4IGlzIGEgbmV3IHZlcnRleFxuICAgICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHBcbiAgXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm91bmRBbnkgPSBmYWxzZVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gXCJ2I3tmW2YubGVuZ3RoLTFdfVwiXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIHYyID0gXCJ2I3t2fVwiXG4gICAgICAgICAgICBpZiBmLmxlbmd0aCA9PSBuIG9yIG4gPT0gMFxuICAgICAgICAgICAgICAgIGZvdW5kQW55ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBhcGV4ID0gXCJhcGV4I3tpfVwiXG4gICAgICAgICAgICAgICAgZm5hbWUgPSBcIiN7aX0je3YxfVwiXG4gICAgICAgICAgICAgICAgIyBuZXcgdmVydGljZXMgaW4gY2VudGVycyBvZiBuLXNpZGVkIGZhY2VcbiAgICAgICAgICAgICAgICBmbGFnLm5ld1YgYXBleCwgYWRkIGNlbnRlcnNbaV0sIG11bHQgYXBleGRpc3QsIG5vcm1hbHNbaV1cbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsICAgdjEsICAgdjIgIyB0aGUgb2xkIGVkZ2Ugb2Ygb3JpZ2luYWwgZmFjZVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgICB2MiwgYXBleCAjIHVwIHRvIGFwZXggb2YgcHlyYW1pZFxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgYXBleCwgICB2MSAjIGFuZCBiYWNrIGRvd24gYWdhaW5cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCIje2l9XCIsIHYxLCB2MiAgIyBzYW1lIG9sZCBmbGFnLCBpZiBub24tblxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2MSA9IHYyICMgY3VycmVudCBiZWNvbWVzIHByZXZpb3VzXG4gIFxuICAgIGlmIG5vdCBmb3VuZEFueVxuICAgICAgICBrbG9nIFwiTm8gI3tufS1mb2xkIGNvbXBvbmVudHMgd2VyZSBmb3VuZC5cIlxuICBcbiAgICBmbGFnLnRvcG9seSBcImsje259I3twb2x5Lm5hbWV9XCJcblxuIyAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuXG4jIFRoZSBiZXN0IHdheSB0byB0aGluayBvZiB0aGUgYW1ibyBvcGVyYXRvciBpcyBhcyBhIHRvcG9sb2dpY2FsIFwidHdlZW5cIiBiZXR3ZWVuIGEgcG9seWhlZHJvblxuIyBhbmQgaXRzIGR1YWwgcG9seWhlZHJvbi4gIFRodXMgdGhlIGFtYm8gb2YgYSBkdWFsIHBvbHloZWRyb24gaXMgdGhlIHNhbWUgYXMgdGhlIGFtYm8gb2YgdGhlXG4jIG9yaWdpbmFsLiBBbHNvIGNhbGxlZCBcIlJlY3RpZnlcIi5cblxuYW1ibyA9IChwb2x5KSAtPlxuICAgIFxuICAgICMga2xvZyBcImFtYm8gb2YgI3twb2x5Lm5hbWV9XCJcbiAgICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICAjIEZvciBlYWNoIGZhY2UgZiBpbiB0aGUgb3JpZ2luYWwgcG9seVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSgtMilcbiAgICAgICAgZm9yIHYzIGluIGZcbiAgICAgICAgICAgIGlmIHYxIDwgdjIgIyB2ZXJ0aWNlcyBhcmUgdGhlIG1pZHBvaW50cyBvZiBhbGwgZWRnZXMgb2Ygb3JpZ2luYWwgcG9seVxuICAgICAgICAgICAgICAgIGZsYWcubmV3ViBtaWROYW1lKHYxLHYyKSwgbWlkcG9pbnQgcG9seS52ZXJ0aWNlc1t2MV0sIHBvbHkudmVydGljZXNbdjJdXG4gICAgICAgICAgICAjIGZhY2UgY29ycmVzcG9uZHMgdG8gdGhlIG9yaWdpbmFsIGZcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcIm9yaWcje2l9XCIgIG1pZE5hbWUodjEsdjIpLCBtaWROYW1lKHYyLHYzKVxuICAgICAgICAgICAgIyBmYWNlIGNvcnJlc3BvbmRzIHRvICh0aGUgdHJ1bmNhdGVkKSB2MlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiZHVhbCN7djJ9XCIgbWlkTmFtZSh2Mix2MyksIG1pZE5hbWUodjEsdjIpXG4gICAgICAgICAgICAjIHNoaWZ0IG92ZXIgb25lXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiYSN7cG9seS5uYW1lfVwiXG5cbiMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAwICAgIDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcblxuZ3lybyA9IChwb2x5KSAtPlxuXG4gICAgIyBrbG9nIFwiZ3lybyBvZiAje3BvbHkubmFtZX1cIlxuICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXVxuICAgICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHVuaXQgcG9seS52ZXJ0aWNlc1tpXSAjIGVhY2ggb2xkIHZlcnRleCBpcyBhIG5ldyB2ZXJ0ZXhcblxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKSAjIG5ldyB2ZXJ0aWNlcyBpbiBjZW50ZXIgb2YgZWFjaCBmYWNlXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgZmxhZy5uZXdWIFwiY2VudGVyI3tpfVwiIHVuaXQgY2VudGVyc1tpXVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UoLTIpXG4gICAgICAgIGZvciBqIGluIFswLi4uZi5sZW5ndGhdXG4gICAgICAgICAgICB2ID0gZltqXVxuICAgICAgICAgICAgdjMgPSB2XG4gICAgICAgICAgICBmbGFnLm5ld1YodjErXCJ+XCIrdjIsIG9uZVRoaXJkKHBvbHkudmVydGljZXNbdjFdLHBvbHkudmVydGljZXNbdjJdKSk7ICAjIG5ldyB2IGluIGZhY2VcbiAgICAgICAgICAgIGZuYW1lID0gaStcImZcIit2MVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBcImNlbnRlciN7aX1cIiAgdjErXCJ+XCIrdjIgIyBmaXZlIG5ldyBmbGFnc1xuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCB2MStcIn5cIit2MiwgIHYyK1wiflwiK3YxXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIHYyK1wiflwiK3YxLCAgXCJ2I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBcInYje3YyfVwiICAgICB2MitcIn5cIit2M1xuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCB2MitcIn5cIit2MywgIFwiY2VudGVyI3tpfVwiXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiZyN7cG9seS5uYW1lfVwiXG5cbiMgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICBcblxucmVmbGVjdCA9IChwb2x5KSAtPiAjIGdlb21ldHJpYyByZWZsZWN0aW9uIHRocm91Z2ggb3JpZ2luXG5cbiAgICBrbG9nIFwicmVmbGVjdGlvbiBvZiAje3BvbHkubmFtZX1cIlxuICAgICMgcmVmbGVjdCBlYWNoIHBvaW50IHRocm91Z2ggb3JpZ2luXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgcG9seS52ZXJ0aWNlc1tpXSA9IG11bHQgLTEsIHBvbHkudmVydGljZXNbaV1cbiAgICAjIHJlcGFpciBjbG9ja3dpc2UtbmVzcyBvZiBmYWNlc1xuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIHBvbHkuZmFjZXNbaV0gPSBwb2x5LmZhY2VzW2ldLnJldmVyc2UoKVxuICAgIHBvbHkubmFtZSA9IFwiciN7cG9seS5uYW1lfVwiXG4gICAgcG9seVxuXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbmNoYW1mZXIgPSAocG9seSwgZmFjdG9yPTAuNSkgLT5cbiAgICBcbiAgICBmYWN0b3IgID0gY2xhbXAgMC4wMDEgMC45OTUgZmFjdG9yXG4gICAgZmxhZyAgICA9IG5ldyBGbGFnKClcbiAgICBub3JtYWxzID0gcG9seS5ub3JtYWxzKClcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgICB3aW5ncyAgID0gcG9seS53aW5ncygpXG4gICAgICAgIFxuICAgIG1pbkVkZ2VMZW5ndGggPSBJbmZpbml0eVxuXG4gICAgIyBrbG9nIHBvbHkubmFtZSwgd2luZ3NcbiAgICBcbiAgICBwbGFuZU5vcm1hbCA9IChlZGdlLCBlMCwgZTEpIC0+XG5cbiAgICAgICAgZGlyID0gc3ViIGUxLCBlMFxuICAgICAgICBkciAgPSB1bml0IGNyb3NzIG5vcm1hbHNbZWRnZVsyXS5mcl0sIGRpclxuICAgICAgICBkbCAgPSB1bml0IGNyb3NzIGRpciwgbm9ybWFsc1tlZGdlWzJdLmZsXVxuICAgICAgICB1bml0IGNyb3NzIGRpciwgY3Jvc3MoZGlyLCB1bml0KGFkZCBkciwgZGwpKVxuICAgIFxuICAgIGZvciBlZGdlIGluIHdpbmdzXG4gICAgICAgIGUwICA9IHBvbHkudmVydGljZXNbZWRnZVswXV1cbiAgICAgICAgZTEgID0gcG9seS52ZXJ0aWNlc1tlZGdlWzFdXVxuICAgICAgICBlZGdlTGVuZ3RoID0gbWFnIHN1YiBlMCwgZTFcbiAgICAgICAgbWluRWRnZUxlbmd0aCA9IG1pbiBtaW5FZGdlTGVuZ3RoLCBlZGdlTGVuZ3RoLzJcblxuICAgIG1pbkVkZ2VMZW5ndGggKj0gZmFjdG9yXG4gICAga2xvZyBwb2x5Lm5hbWUsIG1pbkVkZ2VMZW5ndGhcbiAgICAgICAgXG4gICAgbW92ZWQgPSB7fVxuICAgIGZvciBlZGdlIGluIHdpbmdzXG4gICAgICAgIGUwICA9IHBvbHkudmVydGljZXNbZWRnZVswXV1cbiAgICAgICAgZTEgID0gcG9seS52ZXJ0aWNlc1tlZGdlWzFdXVxuICAgICAgICBtb3ZlZFtcIiN7ZWRnZVsxXX0je2VkZ2VbMF19bFwiXSA9IG1vdmVkW1wiI3tlZGdlWzBdfSN7ZWRnZVsxXX1yXCJdID0gW1xuICAgICAgICAgICAgYWRkIGUwLCBtdWx0IG1pbkVkZ2VMZW5ndGgsIHVuaXQgc3ViIHBvbHkudmVydGljZXNbZWRnZVsyXS5wcl0sIGUwXG4gICAgICAgICAgICBhZGQgZTEsIG11bHQgbWluRWRnZUxlbmd0aCwgdW5pdCBzdWIgcG9seS52ZXJ0aWNlc1tlZGdlWzJdLm5yXSwgZTFdXG4gICAgICAgIG1vdmVkW1wiI3tlZGdlWzFdfSN7ZWRnZVswXX1yXCJdID0gbW92ZWRbXCIje2VkZ2VbMF19I3tlZGdlWzFdfWxcIl0gPSBbXG4gICAgICAgICAgICBhZGQgZTAsIG11bHQgbWluRWRnZUxlbmd0aCwgdW5pdCBzdWIgcG9seS52ZXJ0aWNlc1tlZGdlWzJdLnBsXSwgZTBcbiAgICAgICAgICAgIGFkZCBlMSwgbXVsdCBtaW5FZGdlTGVuZ3RoLCB1bml0IHN1YiBwb2x5LnZlcnRpY2VzW2VkZ2VbMl0ubmxdLCBlMV1cblxuICAgIGZvciBlZGdlIGluIHdpbmdzXG4gICAgICAgIGUwICAgPSBwb2x5LnZlcnRpY2VzW2VkZ2VbMF1dXG4gICAgICAgIGUxICAgPSBwb2x5LnZlcnRpY2VzW2VkZ2VbMV1dXG4gICAgICAgIFxuICAgICAgICBuZiAgPSBcIiN7ZWRnZVswXX3ilrgje2VkZ2VbMV19XCIgXG4gICAgICAgIG5faCA9IFwiI3tlZGdlWzFdfVwiXG4gICAgICAgIG5fdCA9IFwiI3tlZGdlWzBdfVwiXG5cbiAgICAgICAgbm5yID0gXCIje25faH3ilrgje2VkZ2VbMl0uZnJ9XCJcbiAgICAgICAgbm5sID0gXCIje25faH3ilrgje2VkZ2VbMl0uZmx9XCJcbiAgICAgICAgbnByID0gXCIje25fdH3ilrgje2VkZ2VbMl0uZnJ9XCJcbiAgICAgICAgbnBsID0gXCIje25fdH3ilrgje2VkZ2VbMl0uZmx9XCIgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBuciA9IHJheVJheSBtb3ZlZFtcIiN7ZWRnZVswXX0je2VkZ2VbMV19clwiXSwgbW92ZWRbXCIje2VkZ2VbMV19I3tlZGdlWzJdLm5yfXJcIl1cbiAgICAgICAgbmwgPSByYXlSYXkgbW92ZWRbXCIje2VkZ2VbMF19I3tlZGdlWzFdfWxcIl0sIG1vdmVkW1wiI3tlZGdlWzFdfSN7ZWRnZVsyXS5ubH1sXCJdXG4gICAgICAgIHByID0gcmF5UmF5IG1vdmVkW1wiI3tlZGdlWzBdfSN7ZWRnZVsxXX1yXCJdLCBtb3ZlZFtcIiN7ZWRnZVsyXS5wcn0je2VkZ2VbMF19clwiXVxuICAgICAgICBwbCA9IHJheVJheSBtb3ZlZFtcIiN7ZWRnZVswXX0je2VkZ2VbMV19bFwiXSwgbW92ZWRbXCIje2VkZ2VbMl0ucGx9I3tlZGdlWzBdfWxcIl1cbiAgICAgICAgXG4gICAgICAgICMgaWYgZmxhZy5uZXdWKG5faCwgaGVhZCkgdGhlbiBrbG9nICduX2gnXG4gICAgICAgICMgaWYgZmxhZy5uZXdWKG5fdCwgdGFpbCkgdGhlbiBrbG9nICduX3QnXG4gICAgICAgIGlmIGZsYWcubmV3VihubnIsIG5yKSB0aGVuIGtsb2cgJ25ucidcbiAgICAgICAgaWYgZmxhZy5uZXdWKG5ubCwgbmwpIHRoZW4ga2xvZyAnbm5sJ1xuICAgICAgICBpZiBmbGFnLm5ld1YobnBsLCBwbCkgdGhlbiBrbG9nICducGwnXG4gICAgICAgIGlmIGZsYWcubmV3VihucHIsIHByKSB0aGVuIGtsb2cgJ25wcidcblxuICAgICAgICAjIGZsYWcubmV3RmxhZyBuZiwgbl9oLCBubnJcbiAgICAgICAgIyBmbGFnLm5ld0ZsYWcgbmYsIG5uciwgbnByXG4gICAgICAgICMgZmxhZy5uZXdGbGFnIG5mLCBucHIsIG5fdFxuICAgICAgICAjIGZsYWcubmV3RmxhZyBuZiwgbl90LCBucGxcbiAgICAgICAgIyBmbGFnLm5ld0ZsYWcgbmYsIG5wbCwgbm5sXG4gICAgICAgICMgZmxhZy5uZXdGbGFnIG5mLCBubmwsIG5faFxuICAgICAgICBcbiAgICAgICAgZmxhZy5uZXdGbGFnIG5mLCBubnIsIG5wclxuICAgICAgICBmbGFnLm5ld0ZsYWcgbmYsIG5wciwgbnBsXG4gICAgICAgIGZsYWcubmV3RmxhZyBuZiwgbnBsLCBubmxcbiAgICAgICAgZmxhZy5uZXdGbGFnIG5mLCBubmwsIG5uclxuICAgICAgICBcbiAgICAgICAgIyBmbGFnLm5ld0ZsYWcgXCIje2VkZ2VbMl0uZnJ9XCIgbnByLCBubnJcbiAgICAgICAgIyBmbGFnLm5ld0ZsYWcgXCIje2VkZ2VbMl0uZmx9XCIgbm5sLCBucGxcbiAgICAgICAgXG4gICAgZmxhZy50b3BvbHkgXCJjI3twb2x5Lm5hbWV9XCJcblxuY2hhbWZlcjEgPSAocG9seSwgZmFjdG9yPTAuNSkgLT5cblxuICAgIGZhY3RvciAgPSBjbGFtcCAwLjAwMSAwLjk5NSBmYWN0b3JcbiAgICBmbGFnICAgID0gbmV3IEZsYWcoKVxuICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIHdpbmdzICAgPSBwb2x5LndpbmdzKClcbiAgICAgICAgXG4gICAgbWluRGVwdGggPSBJbmZpbml0eVxuXG4gICAga2xvZyBwb2x5Lm5hbWUgIywgcG9seSwgd2luZ3NcbiAgICBcbiAgICBwbGFuZU5vcm1hbCA9IChlZGdlLCBlMCwgZTEpIC0+XG5cbiAgICAgICAgZGlyID0gc3ViIGUxLCBlMFxuICAgICAgICBkciA9IHVuaXQgY3Jvc3Mgbm9ybWFsc1tlZGdlWzJdLmZyXSwgZGlyXG4gICAgICAgIGRsID0gdW5pdCBjcm9zcyBkaXIsIG5vcm1hbHNbZWRnZVsyXS5mbF1cbiAgICAgICAgdW5pdCBjcm9zcyBkaXIsIGNyb3NzKGRpciwgdW5pdChhZGQgZHIsIGRsKSlcbiAgICBcbiAgICBmb3IgZWRnZSBpbiB3aW5nc1xuICAgICAgICBlMCAgPSBwb2x5LnZlcnRpY2VzW2VkZ2VbMF1dXG4gICAgICAgIGUxICA9IHBvbHkudmVydGljZXNbZWRnZVsxXV1cbiAgICAgICAgcG5tID0gcGxhbmVOb3JtYWwgZWRnZSwgZTAsIGUxXG4gICAgICAgIFxuICAgICAgICBtaW5EZXB0aCA9IE1hdGgubWluIG1pbkRlcHRoLCBtYWcgc3ViIGUwLCByYXlQbGFuZSBbMCAwIDBdLCBlMCwgY2VudGVyc1tlZGdlWzJdLmZyXSwgcG5tXG4gICAgICAgIG1pbkRlcHRoID0gTWF0aC5taW4gbWluRGVwdGgsIG1hZyBzdWIgZTEsIHJheVBsYW5lIFswIDAgMF0sIGUxLCBjZW50ZXJzW2VkZ2VbMl0uZnJdLCBwbm1cbiAgICAgICAgbWluRGVwdGggPSBNYXRoLm1pbiBtaW5EZXB0aCwgbWFnIHN1YiBlMSwgcmF5UGxhbmUgWzAgMCAwXSwgZTEsIGNlbnRlcnNbZWRnZVsyXS5mbF0sIHBubVxuICAgICAgICBtaW5EZXB0aCA9IE1hdGgubWluIG1pbkRlcHRoLCBtYWcgc3ViIGUwLCByYXlQbGFuZSBbMCAwIDBdLCBlMCwgY2VudGVyc1tlZGdlWzJdLmZsXSwgcG5tXG5cbiAgICBjdXREZXB0aCA9IGZhY3RvciAqIG1pbkRlcHRoXG4gICAgICAgICAgICAgICAgXG4gICAgZm9yIGVkZ2UgaW4gd2luZ3NcbiAgICAgICAgZTAgICA9IHBvbHkudmVydGljZXNbZWRnZVswXV1cbiAgICAgICAgZTEgICA9IHBvbHkudmVydGljZXNbZWRnZVsxXV1cbiAgICAgICAgcG5tID0gcGxhbmVOb3JtYWwgZWRnZSwgZTAsIGUxXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGhlID0gc3ViIGUxLCBtdWx0IGN1dERlcHRoLCBwbm1cbiAgICAgICAgdGUgPSBzdWIgZTAsIG11bHQgY3V0RGVwdGgsIHBubVxuICAgICAgICBoZWFkID0gcmF5UGxhbmUgWzAgMCAwXSwgZTEsIGhlLCBwbm1cbiAgICAgICAgdGFpbCA9IHJheVBsYW5lIFswIDAgMF0sIGUwLCB0ZSwgcG5tXG4gICAgICAgIFxuICAgICAgICBtZW5yID0gdW5pdCBhZGQgdW5pdChzdWIgZTAsIGUxKSwgdW5pdChzdWIgcG9seS52ZXJ0aWNlc1tlZGdlWzJdLm5yXSwgZTEpXG4gICAgICAgIG1lbmwgPSB1bml0IGFkZCB1bml0KHN1YiBlMCwgZTEpLCB1bml0KHN1YiBwb2x5LnZlcnRpY2VzW2VkZ2VbMl0ubmxdLCBlMSlcbiAgICAgICAgbWVwciA9IHVuaXQgYWRkIHVuaXQoc3ViIGUxLCBlMCksIHVuaXQoc3ViIHBvbHkudmVydGljZXNbZWRnZVsyXS5wcl0sIGUwKVxuICAgICAgICBtZXBsID0gdW5pdCBhZGQgdW5pdChzdWIgZTEsIGUwKSwgdW5pdChzdWIgcG9seS52ZXJ0aWNlc1tlZGdlWzJdLnBsXSwgZTApXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgbnIgPSByYXlQbGFuZSBlMSwgbWVuciwgaGVhZCwgcG5tXG4gICAgICAgIG5sID0gcmF5UGxhbmUgZTEsIG1lbmwsIGhlYWQsIHBubVxuICAgICAgICBwciA9IHJheVBsYW5lIGUwLCBtZXByLCB0YWlsLCBwbm1cbiAgICAgICAgcGwgPSByYXlQbGFuZSBlMCwgbWVwbCwgdGFpbCwgcG5tXG4gICAgICAgIFxuICAgICAgICBuZiAgPSBcIiN7ZWRnZVswXX3ilrgje2VkZ2VbMV19XCIgXG4gICAgICAgIG5faCA9IFwiI3tlZGdlWzFdfVwiXG4gICAgICAgIG5fdCA9IFwiI3tlZGdlWzBdfVwiXG5cbiAgICAgICAgbm5yID0gXCIje25faH3ilrgje2VkZ2VbMl0uZnJ9XCJcbiAgICAgICAgbm5sID0gXCIje25faH3ilrgje2VkZ2VbMl0uZmx9XCJcbiAgICAgICAgbnByID0gXCIje25fdH3ilrgje2VkZ2VbMl0uZnJ9XCJcbiAgICAgICAgbnBsID0gXCIje25fdH3ilrgje2VkZ2VbMl0uZmx9XCIgICAgICAgICAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBpZiBmbGFnLm5ld1Yobl9oLCBoZWFkKSB0aGVuIGtsb2cgJ25faCdcbiAgICAgICAgaWYgZmxhZy5uZXdWKG5fdCwgdGFpbCkgdGhlbiBrbG9nICduX3QnXG4gICAgICAgIGlmIGZsYWcubmV3VihubnIsIG5yKSB0aGVuIGtsb2cgJ25ucidcbiAgICAgICAgaWYgZmxhZy5uZXdWKG5ubCwgbmwpIHRoZW4ga2xvZyAnbm5sJ1xuICAgICAgICBpZiBmbGFnLm5ld1YobnBsLCBwbCkgdGhlbiBrbG9nICducGwnXG4gICAgICAgIGlmIGZsYWcubmV3VihucHIsIHByKSB0aGVuIGtsb2cgJ25wcidcblxuICAgICAgICBmbGFnLm5ld0ZsYWcgbmYsIG5faCwgbm5yXG4gICAgICAgIGZsYWcubmV3RmxhZyBuZiwgbm5yLCBucHJcbiAgICAgICAgZmxhZy5uZXdGbGFnIG5mLCBucHIsIG5fdFxuICAgICAgICBmbGFnLm5ld0ZsYWcgbmYsIG5fdCwgbnBsXG4gICAgICAgIGZsYWcubmV3RmxhZyBuZiwgbnBsLCBubmxcbiAgICAgICAgZmxhZy5uZXdGbGFnIG5mLCBubmwsIG5faFxuICAgICAgICBcbiAgICAgICAgZmxhZy5uZXdGbGFnIFwiI3tlZGdlWzJdLmZyfVwiIG5wciwgbm5yXG4gICAgICAgIGZsYWcubmV3RmxhZyBcIiN7ZWRnZVsyXS5mbH1cIiBubmwsIG5wbFxuICAgICAgICBcbiAgICBmbGFnLnRvcG9seSBcImMje3BvbHkubmFtZX1cIlxuXG5jaGFtZmVyMiA9IChwb2x5LCBmYWN0b3I9MC41KSAtPlxuXG4gICAgZmFjdG9yID0gY2xhbXAgMC4wMDEgMC45OTUgZmFjdG9yXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgICBub3JtYWxzID0gcG9seS5ub3JtYWxzKClcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgICB3aW5ncyAgID0gcG9seS53aW5ncygpXG4gICAgICAgIFxuICAgIGZvciBlZGdlIGluIHdpbmdzXG4gICAgICAgIGUwICA9IHBvbHkudmVydGljZXNbZWRnZVswXV1cbiAgICAgICAgZTEgID0gcG9seS52ZXJ0aWNlc1tlZGdlWzFdXVxuICAgICAgICBuZmwgPSBub3JtYWxzW2VkZ2VbMl0uZmxdXG4gICAgICAgIG5mciA9IG5vcm1hbHNbZWRnZVsyXS5mcl1cbiAgICAgICAgZW1wID0gbWlkcG9pbnQgZTAsIGUxXG4gICAgICAgIGVkaXIgPSBzdWIgZTEsIGUwXG4gICAgICAgIGZhY2VBbmdsZSA9IGFjb3MgZG90IG5mbCwgbmZyXG4gICAgICAgIFxuICAgICAgICBtcHIgPSByb3RhdGUgZW1wLCBlZGlyLCAtZmFjdG9yKmZhY2VBbmdsZS8yXG4gICAgICAgIG1wbCA9IHJvdGF0ZSBlbXAsIGVkaXIsICBmYWN0b3IqZmFjZUFuZ2xlLzJcbiAgICAgICAgXG4gICAgICAgIGUxZnIgPSBzdWIgY2VudGVyc1tlZGdlWzJdLmZyXSwgZTFcbiAgICAgICAgZTFmbCA9IHN1YiBjZW50ZXJzW2VkZ2VbMl0uZmxdLCBlMVxuICAgICAgICBlMGZyID0gc3ViIGNlbnRlcnNbZWRnZVsyXS5mcl0sIGUwXG4gICAgICAgIGUwZmwgPSBzdWIgY2VudGVyc1tlZGdlWzJdLmZsXSwgZTBcbiAgICAgICAgXG4gICAgICAgIG5yID0gcmF5UGxhbmUgbXByLCBlZGlyLCAgICAgIGUxLCB1bml0IGNyb3NzIG5mciwgZTFmclxuICAgICAgICBubCA9IHJheVBsYW5lIG1wbCwgZWRpciwgICAgICBlMSwgdW5pdCBjcm9zcyBuZmwsIGUxZmxcbiAgICAgICAgcHIgPSByYXlQbGFuZSBtcHIsIG5lZyhlZGlyKSwgZTAsIHVuaXQgY3Jvc3MgbmZyLCBlMGZyXG4gICAgICAgIHBsID0gcmF5UGxhbmUgbXBsLCBuZWcoZWRpciksIGUwLCB1bml0IGNyb3NzIG5mbCwgZTBmbFxuXG4gICAgICAgIG5mICA9IFwiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1cIiBcbiAgICAgICAgbl9oID0gXCIje2VkZ2VbMV19XCJcbiAgICAgICAgbl90ID0gXCIje2VkZ2VbMF19XCJcblxuICAgICAgICBubnIgPSBcIiN7bl9ofeKWuCN7ZWRnZVsyXS5mcn1cIlxuICAgICAgICBubmwgPSBcIiN7bl9ofeKWuCN7ZWRnZVsyXS5mbH1cIlxuICAgICAgICBucHIgPSBcIiN7bl90feKWuCN7ZWRnZVsyXS5mcn1cIlxuICAgICAgICBucGwgPSBcIiN7bl90feKWuCN7ZWRnZVsyXS5mbH1cIiAgICAgICAgICAgICAgICBcblxuICAgICAgICBuZm4gPSB1bml0IGVtcFxuICAgICAgICBubXAgPSBtaWRwb2ludCBuciwgcGxcbiAgICAgICAgXG4gICAgICAgIGZsYWcubmV3ViBuX2gsIHJheVBsYW5lIFswIDAgMF0sIGUxLCBubXAsIG5mbiBcbiAgICAgICAgZmxhZy5uZXdWIG5fdCwgcmF5UGxhbmUgWzAgMCAwXSwgZTAsIG5tcCwgbmZuXG4gICAgICAgIGZsYWcubmV3ViBubnIsIG5yXG4gICAgICAgIGZsYWcubmV3ViBubmwsIG5sXG4gICAgICAgIGZsYWcubmV3ViBucGwsIHBsXG4gICAgICAgIGZsYWcubmV3ViBucHIsIHByXG5cbiAgICAgICAgZmxhZy5uZXdGbGFnIG5mLCBuX2gsIG5uclxuICAgICAgICBmbGFnLm5ld0ZsYWcgbmYsIG5uciwgbnByXG4gICAgICAgIGZsYWcubmV3RmxhZyBuZiwgbnByLCBuX3RcbiAgICAgICAgZmxhZy5uZXdGbGFnIG5mLCBuX3QsIG5wbFxuICAgICAgICBmbGFnLm5ld0ZsYWcgbmYsIG5wbCwgbm5sXG4gICAgICAgIGZsYWcubmV3RmxhZyBuZiwgbm5sLCBuX2hcbiAgICAgICAgXG4gICAgICAgIGZsYWcubmV3RmxhZyBcIiN7ZWRnZVsyXS5mcn1cIiBucHIsIG5uclxuICAgICAgICBmbGFnLm5ld0ZsYWcgXCIje2VkZ2VbMl0uZmx9XCIgbm5sLCBucGxcbiAgICAgICAgXG4gICAgZmxhZy50b3BvbHkgXCJjI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuXG4jIEd5cm8gZm9sbG93ZWQgYnkgdHJ1bmNhdGlvbiBvZiB2ZXJ0aWNlcyBjZW50ZXJlZCBvbiBvcmlnaW5hbCBmYWNlcy5cbiMgVGhpcyBjcmVhdGUgMiBuZXcgaGV4YWdvbnMgZm9yIGV2ZXJ5IG9yaWdpbmFsIGVkZ2UuXG4jIChodHRwczojZW4ud2lraXBlZGlhLm9yZy93aWtpL0NvbndheV9wb2x5aGVkcm9uX25vdGF0aW9uI09wZXJhdGlvbnNfb25fcG9seWhlZHJhKVxuI1xuIyBQb3NzaWJsZSBleHRlbnNpb246IHRha2UgYSBwYXJhbWV0ZXIgbiB0aGF0IG1lYW5zIG9ubHkgd2hpcmwgbi1zaWRlZCBmYWNlcy5cbiMgSWYgd2UgZG8gdGhhdCwgdGhlIGZsYWdzIG1hcmtlZCAjKiBiZWxvdyB3aWxsIG5lZWQgdG8gaGF2ZSB0aGVpciBvdGhlciBzaWRlc1xuIyBmaWxsZWQgaW4gb25lIHdheSBvciBhbm90aGVyLCBkZXBlbmRpbmcgb24gd2hldGhlciB0aGUgYWRqYWNlbnQgZmFjZSBpc1xuIyB3aGlybGVkIG9yIG5vdC5cblxud2hpcmwgPSAocG9seSwgbikgLT5cblxuICAgIGtsb2cgXCJ3aGlybCBvZiAje3BvbHkubmFtZX1cIlxuICAgIG4gPz0gMFxuICAgIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgIGZsYWcubmV3ViBcInYje2l9XCIgdW5pdCBwb2x5LnZlcnRpY2VzW2ldXG5cbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlIC0yXG4gICAgICAgIGZvciBqIGluIFswLi4uZi5sZW5ndGhdXG4gICAgICAgICAgICB2ID0gZltqXVxuICAgICAgICAgICAgdjMgPSB2XG4gICAgICAgICAgICB2MV8yID0gb25lVGhpcmQgcG9seS52ZXJ0aWNlc1t2MV0sIHBvbHkudmVydGljZXNbdjJdXG4gICAgICAgICAgICBmbGFnLm5ld1YodjErXCJ+XCIrdjIsIHYxXzIpXG4gICAgICAgICAgICBjdjFuYW1lID0gXCJjZW50ZXIje2l9fiN7djF9XCJcbiAgICAgICAgICAgIGN2Mm5hbWUgPSBcImNlbnRlciN7aX1+I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy5uZXdWIGN2MW5hbWUsIHVuaXQgb25lVGhpcmQgY2VudGVyc1tpXSwgdjFfMlxuICAgICAgICAgICAgZm5hbWUgPSBpK1wiZlwiK3YxXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIGN2MW5hbWUsICAgdjErXCJ+XCIrdjJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgdjErXCJ+XCIrdjIsIHYyK1wiflwiK3YxIFxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCB2MitcIn5cIit2MSwgXCJ2I3t2Mn1cIiAgXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIFwidiN7djJ9XCIsICB2MitcIn5cIit2MyBcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgdjIrXCJ+XCIrdjMsIGN2Mm5hbWVcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgY3YybmFtZSwgICBjdjFuYW1lXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJjI3tpfVwiLCBjdjFuYW1lLCBjdjJuYW1lXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M10gIyBzaGlmdCBvdmVyIG9uZVxuICBcbiAgICBmbGFnLnRvcG9seSBcIncje3BvbHkubmFtZX1cIlxuXG4jICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiMgMDAwIDAwIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuIyAgMDAwMDAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICBcblxucXVpbnRvID0gKHBvbHkpIC0+ICMgY3JlYXRlcyBhIHBlbnRhZ29uIGZvciBldmVyeSBwb2ludCBpbiB0aGUgb3JpZ2luYWwgZmFjZSwgYXMgd2VsbCBhcyBvbmUgbmV3IGluc2V0IGZhY2UuXG4gICAgXG4gICAgIyBrbG9nIFwicXVpbnRvIG9mICN7cG9seS5uYW1lfVwiXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgIyBGb3IgZWFjaCBmYWNlIGYgaW4gdGhlIG9yaWdpbmFsIHBvbHlcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBjZW50cm9pZCA9IGNhbGNDZW50cm9pZCBmLm1hcCAoaWR4KSAtPiBwb2x5LnZlcnRpY2VzW2lkeF1cbiAgICAgICAgIyB3YWxrIG92ZXIgZmFjZSB2ZXJ0ZXgtdHJpcGxldHNcbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlIC0yXG4gICAgICAgIGZvciB2MyBpbiBmXG4gICAgICAgICAgICAjIGZvciBlYWNoIGZhY2UtY29ybmVyLCB3ZSBtYWtlIHR3byBuZXcgcG9pbnRzOlxuICAgICAgICAgICAgbWlkcHQgPSBtaWRwb2ludCBwb2x5LnZlcnRpY2VzW3YxXSwgcG9seS52ZXJ0aWNlc1t2Ml1cbiAgICAgICAgICAgIGlubmVycHQgPSBtaWRwb2ludCBtaWRwdCwgY2VudHJvaWRcbiAgICAgICAgICAgIGZsYWcubmV3ViBtaWROYW1lKHYxLHYyKSwgbWlkcHRcbiAgICAgICAgICAgIGZsYWcubmV3ViBcImlubmVyXyN7aX1fXCIgKyBtaWROYW1lKHYxLHYyKSwgaW5uZXJwdFxuICAgICAgICAgICAgIyBhbmQgYWRkIHRoZSBvbGQgY29ybmVyLXZlcnRleFxuICAgICAgICAgICAgZmxhZy5uZXdWIFwiI3t2Mn1cIiBwb2x5LnZlcnRpY2VzW3YyXVxuICAgICAgICAgIFxuICAgICAgICAgICAgIyBwZW50YWdvbiBmb3IgZWFjaCB2ZXJ0ZXggaW4gb3JpZ2luYWwgZmFjZVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiZiN7aX1fI3t2Mn1cIiwgXCJpbm5lcl8je2l9X1wiK21pZE5hbWUodjEsIHYyKSwgbWlkTmFtZSh2MSwgdjIpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmI3tpfV8je3YyfVwiLCBtaWROYW1lKHYxLCB2MiksIFwiI3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiZiN7aX1fI3t2Mn1cIiwgXCIje3YyfVwiLCBtaWROYW1lKHYyLCB2MylcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImYje2l9XyN7djJ9XCIsIG1pZE5hbWUodjIsIHYzKSwgXCJpbm5lcl8je2l9X1wiK21pZE5hbWUodjIsIHYzKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiZiN7aX1fI3t2Mn1cIiwgXCJpbm5lcl8je2l9X1wiK21pZE5hbWUodjIsIHYzKSwgXCJpbm5lcl8je2l9X1wiK21pZE5hbWUodjEsIHYyKVxuICAgICAgXG4gICAgICAgICAgICAjIGlubmVyIHJvdGF0ZWQgZmFjZSBvZiBzYW1lIHZlcnRleC1udW1iZXIgYXMgb3JpZ2luYWxcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImZfaW5fI3tpfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpXG4gICAgICBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M10gIyBzaGlmdCBvdmVyIG9uZVxuICBcbiAgICBmbGFnLnRvcG9seSBcInEje3BvbHkubmFtZX1cIlxuXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMFxuIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICBcbiMgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgXG4jIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAwMDAgICBcblxuaW5zZXQgPSAocG9seSwgbiwgaW5zZXRfZGlzdCwgcG9wb3V0X2Rpc3QpIC0+XG5cbiAgICBuID89IDBcbiAgICBpbnNldF9kaXN0ID89IDAuNVxuICAgIHBvcG91dF9kaXN0ID89IC0wLjJcbiAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXVxuICAgICAgICAjIGVhY2ggb2xkIHZlcnRleCBpcyBhIG5ldyB2ZXJ0ZXhcbiAgICAgICAgcCA9IHBvbHkudmVydGljZXNbaV1cbiAgICAgICAgZmxhZy5uZXdWIFwidiN7aX1cIiBwXG5cbiAgICBub3JtYWxzID0gcG9seS5ub3JtYWxzKClcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXSAjIG5ldyBpbnNldCB2ZXJ0ZXggZm9yIGV2ZXJ5IHZlcnQgaW4gZmFjZVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBpZiBmLmxlbmd0aCA9PSBuIG9yIG4gPT0gMFxuICAgICAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgICAgIGZsYWcubmV3ViBcImYje2l9diN7dn1cIiBhZGQgdHdlZW4ocG9seS52ZXJ0aWNlc1t2XSxjZW50ZXJzW2ldLGluc2V0X2Rpc3QpLCBtdWx0KHBvcG91dF9kaXN0LG5vcm1hbHNbaV0pXG4gIFxuICAgIGZvdW5kQW55ID0gZmFsc2UgIyBhbGVydCBpZiBkb24ndCBmaW5kIGFueVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gXCJ2I3tmW2YubGVuZ3RoLTFdfVwiXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIHYyID0gXCJ2I3t2fVwiO1xuICAgICAgICAgICAgaWYgZi5sZW5ndGggPT0gbiBvciBuID09IDBcbiAgICAgICAgICAgICAgICBmb3VuZEFueSA9IHRydWVcbiAgICAgICAgICAgICAgICBmbmFtZSA9IGkgKyB2MVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgICAgICB2MSwgICAgICAgdjIpXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCAgICAgIHYyLCAgICAgICBcImYje2l9I3t2Mn1cIilcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsIFwiZiN7aX0je3YyfVwiLCAgXCJmI3tpfSN7djF9XCIpXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCBcImYje2l9I3t2MX1cIiwgIHYxKVxuICAgICAgICAgICAgICAgICMgbmV3IGluc2V0LCBleHRydWRlZCBmYWNlXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnKFwiZXgje2l9XCIsIFwiZiN7aX0je3YxfVwiLCAgXCJmI3tpfSN7djJ9XCIpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGksIHYxLCB2MikgICMgc2FtZSBvbGQgZmxhZywgaWYgbm9uLW5cbiAgICAgICAgICAgIHYxPXYyICMgY3VycmVudCBiZWNvbWVzIHByZXZpb3VzXG4gIFxuICAgIGlmIG5vdCBmb3VuZEFueVxuICAgICAgICBrbG9nIFwiTm8gI3tufS1mb2xkIGNvbXBvbmVudHMgd2VyZSBmb3VuZC5cIlxuICBcbiAgICBmbGFnLnRvcG9seSBcIm4je259I3twb2x5Lm5hbWV9XCJcblxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcblxuZXh0cnVkZSA9IChwb2x5LCBuLCBwb3BvdXQ9MSwgaW5zZXRmPTAuNSkgLT5cbiAgICBuZXdwb2x5ID0gaW5zZXQgcG9seSwgbiwgaW5zZXRmLCBwb3BvdXRcbiAgICBuZXdwb2x5Lm5hbWUgPSBcIngje259I3twb2x5Lm5hbWV9XCJcbiAgICBuZXdwb2x5XG5cbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICBcblxuaG9sbG93ID0gKHBvbHksIGluc2V0X2Rpc3QsIHRoaWNrbmVzcykgLT5cblxuICAgIGluc2V0X2Rpc3QgPz0gMC41XG4gICAgdGhpY2tuZXNzID89IDAuMlxuICBcbiAgICBkdWFsbm9ybWFscyA9IGR1YWwocG9seSkubm9ybWFscygpXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgIyBlYWNoIG9sZCB2ZXJ0ZXggaXMgYSBuZXcgdmVydGV4XG4gICAgICAgIHAgPSBwb2x5LnZlcnRpY2VzW2ldXG4gICAgICAgIGZsYWcubmV3ViBcInYje2l9XCIgcFxuICAgICAgICBmbGFnLm5ld1YgXCJkb3dudiN7aX1cIiBhZGQgcCwgbXVsdCAtMSp0aGlja25lc3MsZHVhbG5vcm1hbHNbaV1cblxuICAgICMgbmV3IGluc2V0IHZlcnRleCBmb3IgZXZlcnkgdmVydCBpbiBmYWNlXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgZmxhZy5uZXdWIFwiZmluI3tpfXYje3Z9XCIgdHdlZW4gcG9seS52ZXJ0aWNlc1t2XSwgY2VudGVyc1tpXSwgaW5zZXRfZGlzdFxuICAgICAgICAgICAgZmxhZy5uZXdWIFwiZmluZG93biN7aX12I3t2fVwiIGFkZCB0d2Vlbihwb2x5LnZlcnRpY2VzW3ZdLGNlbnRlcnNbaV0saW5zZXRfZGlzdCksIG11bHQoLTEqdGhpY2tuZXNzLG5vcm1hbHNbaV0pXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gXCJ2I3tmW2YubGVuZ3RoLTFdfVwiXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIHYyID0gXCJ2I3t2fVwiXG4gICAgICAgICAgICBmbmFtZSA9IGkgKyB2MVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCB2MSwgICAgICAgICAgICB2MlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCB2MiwgICAgICAgICAgICBcImZpbiN7aX0je3YyfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIFwiZmluI3tpfSN7djJ9XCIgXCJmaW4je2l9I3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBcImZpbiN7aX0je3YxfVwiIHYxXG4gICAgICBcbiAgICAgICAgICAgIGZuYW1lID0gXCJzaWRlcyN7aX0je3YxfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIFwiZmluI3tpfSN7djF9XCIgICAgIFwiZmluI3tpfSN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgXCJmaW4je2l9I3t2Mn1cIiAgICAgXCJmaW5kb3duI3tpfSN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgXCJmaW5kb3duI3tpfSN7djJ9XCIgXCJmaW5kb3duI3tpfSN7djF9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgXCJmaW5kb3duI3tpfSN7djF9XCIgXCJmaW4je2l9I3t2MX1cIlxuICAgICAgXG4gICAgICAgICAgICBmbmFtZSA9IFwiYm90dG9tI3tpfSN7djF9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgIFwiZG93biN7djJ9XCIgICAgICAgIFwiZG93biN7djF9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgIFwiZG93biN7djF9XCIgICAgICAgIFwiZmluZG93biN7aX0je3YxfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsICBcImZpbmRvd24je2l9I3t2MX1cIiBcImZpbmRvd24je2l9I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCAgXCJmaW5kb3duI3tpfSN7djJ9XCIgXCJkb3duI3t2Mn1cIlxuICAgICAgXG4gICAgICAgICAgICB2MSA9IHYyICMgY3VycmVudCBiZWNvbWVzIHByZXZpb3VzXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiSCN7cG9seS5uYW1lfVwiXG5cbiMgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwMDBcbiMgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMFxuIyAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAwICAgICAgMDAwICAgMDAwXG5cbnBlcnNwZWN0aXZhID0gKHBvbHkpIC0+ICMgYW4gb3BlcmF0aW9uIHJldmVyc2UtZW5naW5lZXJlZCBmcm9tIFBlcnNwZWN0aXZhIENvcnBvcnVtIFJlZ3VsYXJpdW1cblxuICAgICMga2xvZyBcInN0ZWxsYSBvZiAje3BvbHkubmFtZX1cIlxuICBcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKCkgIyBjYWxjdWxhdGUgZmFjZSBjZW50ZXJzXG4gIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgZmxhZy5uZXdWIFwidiN7aX1cIiBwb2x5LnZlcnRpY2VzW2ldXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIFxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0yXX1cIlxuICAgICAgICB2MiA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICB2ZXJ0MSA9IHBvbHkudmVydGljZXNbZltmLmxlbmd0aC0yXV1cbiAgICAgICAgdmVydDIgPSBwb2x5LnZlcnRpY2VzW2ZbZi5sZW5ndGgtMV1dXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIHYzID0gXCJ2I3t2fVwiXG4gICAgICAgICAgICB2ZXJ0MyA9IHBvbHkudmVydGljZXNbdl1cbiAgICAgICAgICAgIHYxMiA9IHYxK1wiflwiK3YyXG4gICAgICAgICAgICB2MjEgPSB2MitcIn5cIit2MVxuICAgICAgICAgICAgdjIzID0gdjIrXCJ+XCIrdjNcbiAgICAgIFxuICAgICAgICAgICAgIyBvbiBlYWNoIE5mYWNlLCBOIG5ldyBwb2ludHMgaW5zZXQgZnJvbSBlZGdlIG1pZHBvaW50cyB0b3dhcmRzIGNlbnRlciA9IFwic3RlbGxhdGVkXCIgcG9pbnRzXG4gICAgICAgICAgICBmbGFnLm5ld1YgdjEyLCBtaWRwb2ludCBtaWRwb2ludCh2ZXJ0MSx2ZXJ0MiksIGNlbnRlcnNbaV0gXG4gICAgICBcbiAgICAgICAgICAgICMgaW5zZXQgTmZhY2UgbWFkZSBvZiBuZXcsIHN0ZWxsYXRlZCBwb2ludHNcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImluI3tpfVwiIHYxMiwgdjIzXG4gICAgICBcbiAgICAgICAgICAgICMgbmV3IHRyaSBmYWNlIGNvbnN0aXR1dGluZyB0aGUgcmVtYWluZGVyIG9mIHRoZSBzdGVsbGF0ZWQgTmZhY2VcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImYje2l9I3t2Mn1cIiB2MjMsIHYxMlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiZiN7aX0je3YyfVwiIHYxMiwgdjJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImYje2l9I3t2Mn1cIiB2MiwgIHYyM1xuICAgICAgXG4gICAgICAgICAgICAjIG9uZSBvZiB0aGUgdHdvIG5ldyB0cmlhbmdsZXMgcmVwbGFjaW5nIG9sZCBlZGdlIGJldHdlZW4gdjEtPnYyXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmI3t2MTJ9XCIgdjEsICB2MjFcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImYje3YxMn1cIiB2MjEsIHYxMlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiZiN7djEyfVwiIHYxMiwgdjFcbiAgICAgIFxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXSAgIyBjdXJyZW50IGJlY29tZXMgcHJldmlvdXNcbiAgICAgICAgICAgIFt2ZXJ0MSwgdmVydDJdID0gW3ZlcnQyLCB2ZXJ0M11cbiAgXG4gICAgZmxhZy50b3BvbHkgXCJQI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuXG50cmlzdWIgPSAocG9seSwgbj0yKSAtPlxuICAgIFxuICAgICMgTm8tT3AgZm9yIG5vbi10cmlhbmd1bGFyIG1lc2hlc1xuICAgIGZvciBmbiBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBpZiBwb2x5LmZhY2VzW2ZuXS5sZW5ndGggIT0gM1xuICAgICAgICAgICAgcmV0dXJuIHBvbHlcbiAgXG4gICAgbmV3VnMgPSBbXVxuICAgIHZtYXAgPSB7fVxuICAgIHBvcyA9IDBcbiAgICBmb3IgZm4gaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbZm5dXG4gICAgICAgIFtpMSwgaTIsIGkzXSA9IGYuc2xpY2UgLTNcbiAgICAgICAgdjEgPSBwb2x5LnZlcnRpY2VzW2kxXVxuICAgICAgICB2MiA9IHBvbHkudmVydGljZXNbaTJdXG4gICAgICAgIHYzID0gcG9seS52ZXJ0aWNlc1tpM11cbiAgICAgICAgdjIxID0gc3ViIHYyLCB2MVxuICAgICAgICB2MzEgPSBzdWIgdjMsIHYxXG4gICAgICAgIGZvciBpIGluIFswLi5uXVxuICAgICAgICAgICAgZm9yIGogaW4gWzAuLm4taV1cbiAgICAgICAgICAgICAgICB2ID0gYWRkIGFkZCh2MSwgbXVsdChpL24sIHYyMSkpLCBtdWx0KGovbiwgdjMxKVxuICAgICAgICAgICAgICAgIHZtYXBbXCJ2I3tmbn0tI3tpfS0je2p9XCJdID0gcG9zKytcbiAgICAgICAgICAgICAgICBuZXdWcy5wdXNoIHZcbiAgXG4gICAgRVBTSUxPTl9DTE9TRSA9IDEuMGUtOFxuICAgIHVuaXFWcyA9IFtdXG4gICAgbmV3cG9zID0gMFxuICAgIHVuaXFtYXAgPSB7fVxuICAgIGZvciB2LGkgaW4gbmV3VnNcbiAgICAgICAgaWYgaSBpbiB1bmlxbWFwIHRoZW4gY29udGludWUgIyBhbHJlYWR5IG1hcHBlZFxuICAgICAgICB1bmlxbWFwW2ldID0gbmV3cG9zXG4gICAgICAgIHVuaXFWcy5wdXNoIHZcbiAgICAgICAgZm9yIGogaW4gW2krMS4uLm5ld1ZzLmxlbmd0aF1cbiAgICAgICAgICAgIHcgPSBuZXdWc1tqXVxuICAgICAgICAgICAgaWYgbWFnKHN1Yih2LCB3KSkgPCBFUFNJTE9OX0NMT1NFXG4gICAgICAgICAgICAgICAgdW5pcW1hcFtqXSA9IG5ld3Bvc1xuICAgICAgICBuZXdwb3MrK1xuICBcbiAgICBmYWNlcyA9IFtdXG4gICAgZm9yIGZuIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGZvciBpIGluIFswLi4ubl1cbiAgICAgICAgICAgIGZvciBqIGluIFswLi4ubi1pXVxuICAgICAgICAgICAgICAgIGZhY2VzLnB1c2ggW3VuaXFtYXBbdm1hcFtcInYje2ZufS0je2l9LSN7an1cIl1dLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpKzF9LSN7an1cIl1dLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2orMX1cIl1dXVxuICAgICAgICBmb3IgaSBpbiBbMS4uLm5dXG4gICAgICAgICAgICBmb3IgaiBpbiBbMC4uLm4taV1cbiAgICAgICAgICAgICAgICBmYWNlcy5wdXNoIFt1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2p9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqKzF9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aS0xfS0je2orMX1cIl1dXVxuICBcbiAgICAjIGtsb2cgJ2ZhY2VzJyBmYWNlc1xuICAgICMga2xvZyAndmVydGljZXMnIHVuaXFWcyAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBcbiAgICBuZXcgUG9seWhlZHJvbiBcInUje259I3twb2x5Lm5hbWV9XCIgZmFjZXMsIHVuaXFWc1xuXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4jIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbmNhbm9uaWNhbGl6ZSA9IChwb2x5LCBpdGVyPTIwMCkgLT5cblxuICAgICMga2xvZyBcImNhbm9uaWNhbGl6ZSAje3BvbHkubmFtZX1cIlxuICAgIGZhY2VzID0gcG9seS5mYWNlc1xuICAgIGVkZ2VzID0gcG9seS5lZGdlcygpXG4gICAgbmV3VnMgPSBwb2x5LnZlcnRpY2VzXG4gICAgbWF4Q2hhbmdlID0gMS4wICMgY29udmVyZ2VuY2UgdHJhY2tlclxuICAgIGZvciBpIGluIFswLi5pdGVyXVxuICAgICAgICBvbGRWcyA9IGNvcHlWZWNBcnJheSBuZXdWc1xuICAgICAgICBuZXdWcyA9IHRhbmdlbnRpZnkgbmV3VnMsIGVkZ2VzXG4gICAgICAgIG5ld1ZzID0gcmVjZW50ZXIgbmV3VnMsIGVkZ2VzXG4gICAgICAgIG5ld1ZzID0gcGxhbmFyaXplIG5ld1ZzLCBmYWNlc1xuICAgICAgICBtYXhDaGFuZ2UgPSBfLm1heCBfLm1hcCBfLnppcChuZXdWcywgb2xkVnMpLCAoW3gsIHldKSAtPiBtYWcgc3ViIHgsIHlcbiAgICAgICAgaWYgbWF4Q2hhbmdlIDwgMWUtOFxuICAgICAgICAgICAgYnJlYWtcbiAgICAjIG9uZSBzaG91bGQgbm93IHJlc2NhbGUsIGJ1dCBub3QgcmVzY2FsaW5nIGhlcmUgbWFrZXMgZm9yIHZlcnkgaW50ZXJlc3RpbmcgbnVtZXJpY2FsXG4gICAgIyBpbnN0YWJpbGl0aWVzIHRoYXQgbWFrZSBpbnRlcmVzdGluZyBtdXRhbnRzIG9uIG11bHRpcGxlIGFwcGxpY2F0aW9ucy4uLlxuICAgICMgbW9yZSBleHBlcmllbmNlIHdpbGwgdGVsbCB3aGF0IHRvIGRvXG4gICAgbmV3VnMgPSByZXNjYWxlKG5ld1ZzKVxuICAgICMga2xvZyBcIltjYW5vbmljYWxpemF0aW9uIGRvbmUsIGxhc3QgfGRlbHRhVnw9I3ttYXhDaGFuZ2V9XVwiXG4gICAgbmV3cG9seSA9IG5ldyBQb2x5aGVkcm9uIHBvbHkubmFtZSwgcG9seS5mYWNlcywgbmV3VnNcbiAgICAjIGtsb2cgXCJjYW5vbmljYWxpemVcIiBuZXdwb2x5XG4gICAgbmV3cG9seVxuICAgIFxuY2Fub25pY2FsWFlaID0gKHBvbHksIGl0ZXJhdGlvbnMpIC0+XG5cbiAgICBpdGVyYXRpb25zID89IDFcbiAgICBkcG9seSA9IGR1YWwgcG9seVxuICAgICMga2xvZyBcImNhbm9uaWNhbFhZWiAje3BvbHkubmFtZX1cIlxuICBcbiAgICBmb3IgY291bnQgaW4gWzAuLi5pdGVyYXRpb25zXSAjIHJlY2lwcm9jYXRlIGZhY2Ugbm9ybWFsc1xuICAgICAgICBkcG9seS52ZXJ0aWNlcyA9IHJlY2lwcm9jYWxOIHBvbHlcbiAgICAgICAgcG9seS52ZXJ0aWNlcyAgPSByZWNpcHJvY2FsTiBkcG9seVxuICBcbiAgICBuZXcgUG9seWhlZHJvbiBwb2x5Lm5hbWUsIHBvbHkuZmFjZXMsIHBvbHkudmVydGljZXNcblxuZmxhdHRlbiA9IChwb2x5LCBpdGVyYXRpb25zKSAtPiAjIHF1aWNrIHBsYW5hcml6YXRpb25cbiAgICBcbiAgICBpdGVyYXRpb25zID89IDFcbiAgICBkcG9seSA9IGR1YWwgcG9seSAjIHYncyBvZiBkdWFsIGFyZSBpbiBvcmRlciBvZiBhcmcncyBmJ3NcbiAgICAjIGtsb2cgXCJmbGF0dGVuICN7cG9seS5uYW1lfVwiXG4gIFxuICAgIGZvciBjb3VudCBpbiBbMC4uLml0ZXJhdGlvbnNdICMgcmVjaXByb2NhdGUgZmFjZSBjZW50ZXJzXG4gICAgICAgIGRwb2x5LnZlcnRpY2VzID0gcmVjaXByb2NhbEMgcG9seVxuICAgICAgICBwb2x5LnZlcnRpY2VzICA9IHJlY2lwcm9jYWxDIGRwb2x5XG4gIFxuICAgIG5ldyBQb2x5aGVkcm9uIHBvbHkubmFtZSwgcG9seS5mYWNlcywgcG9seS52ZXJ0aWNlc1xuICAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICBcbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgICBkdWFsOiAgICAgICAgICAgZHVhbFxuICAgIHRyaXN1YjogICAgICAgICB0cmlzdWJcbiAgICBwZXJzcGVjdGl2YTogICAgcGVyc3BlY3RpdmFcbiAgICBraXM6ICAgICAgICAgICAga2lzXG4gICAgYW1ibzogICAgICAgICAgIGFtYm9cbiAgICBneXJvOiAgICAgICAgICAgZ3lyb1xuICAgIHJlZmxlY3Q6ICAgICAgICByZWZsZWN0XG4gICAgY2hhbWZlcjogICAgICAgIGNoYW1mZXJcbiAgICB3aGlybDogICAgICAgICAgd2hpcmxcbiAgICBxdWludG86ICAgICAgICAgcXVpbnRvXG4gICAgaW5zZXQ6ICAgICAgICAgIGluc2V0XG4gICAgZXh0cnVkZTogICAgICAgIGV4dHJ1ZGVcbiAgICBob2xsb3c6ICAgICAgICAgaG9sbG93XG4gICAgZmxhdHRlbjogICAgICAgIGZsYXR0ZW5cbiAgICB6aXJrdWxhcml6ZTogICAgemlya3VsYXJpemVcbiAgICBjYW5vbmljYWxpemU6ICAgY2Fub25pY2FsaXplXG4gICAgY2Fub25pY2FsWFlaOiAgIGNhbm9uaWNhbFhZWlxuICAgICJdfQ==
//# sourceURL=../../coffee/poly/topo.coffee