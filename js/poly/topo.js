// koffee 1.6.0

/*
000000000   0000000   00000000    0000000     
   000     000   000  000   000  000   000    
   000     000   000  00000000   000   000    
   000     000   000  000        000   000    
   000      0000000   000         0000000
 */
var Flag, Polyhedron, _, abs, acos, add, ambo, calcCentroid, canonicalXYZ, canonicalize, chamfer, clamp, copyVecArray, cross, dot, dual, extrude, flatten, gyro, hollow, inset, intersect, kis, klog, mag, midName, midpoint, mult, neg, oneThird, perspectiva, planarize, quinto, rayPlane, recenter, reciprocalC, reciprocalN, ref, ref1, ref2, reflect, rescale, rotate, sub, tangentify, trisub, tween, unit, whirl, zirkularize,
    indexOf = [].indexOf;

ref = require('kxk'), clamp = ref.clamp, klog = ref.klog, _ = ref._;

ref1 = require('./math'), dot = ref1.dot, add = ref1.add, neg = ref1.neg, mult = ref1.mult, mag = ref1.mag, sub = ref1.sub, unit = ref1.unit, cross = ref1.cross, rotate = ref1.rotate, oneThird = ref1.oneThird, tween = ref1.tween, intersect = ref1.intersect, rayPlane = ref1.rayPlane, midpoint = ref1.midpoint, calcCentroid = ref1.calcCentroid, copyVecArray = ref1.copyVecArray;

ref2 = require('./geo'), tangentify = ref2.tangentify, reciprocalC = ref2.reciprocalC, reciprocalN = ref2.reciprocalN, recenter = ref2.recenter, rescale = ref2.rescale, planarize = ref2.planarize;

abs = Math.abs, acos = Math.acos;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9wby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsZ2FBQUE7SUFBQTs7QUF3QkEsTUFBcUIsT0FBQSxDQUFRLEtBQVIsQ0FBckIsRUFBRSxpQkFBRixFQUFTLGVBQVQsRUFBZTs7QUFDZixPQUFxSSxPQUFBLENBQVEsUUFBUixDQUFySSxFQUFFLGNBQUYsRUFBTyxjQUFQLEVBQVksY0FBWixFQUFpQixnQkFBakIsRUFBdUIsY0FBdkIsRUFBNEIsY0FBNUIsRUFBaUMsZ0JBQWpDLEVBQXVDLGtCQUF2QyxFQUE4QyxvQkFBOUMsRUFBc0Qsd0JBQXRELEVBQWdFLGtCQUFoRSxFQUF1RSwwQkFBdkUsRUFBa0Ysd0JBQWxGLEVBQTRGLHdCQUE1RixFQUFzRyxnQ0FBdEcsRUFBb0g7O0FBQ3BILE9BQXlFLE9BQUEsQ0FBUSxPQUFSLENBQXpFLEVBQUUsNEJBQUYsRUFBYyw4QkFBZCxFQUEyQiw4QkFBM0IsRUFBd0Msd0JBQXhDLEVBQWtELHNCQUFsRCxFQUEyRDs7QUFDekQsY0FBRixFQUFPOztBQUVQLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7QUFDUCxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0FBRWIsT0FBQSxHQUFVLFNBQUMsRUFBRCxFQUFLLEVBQUw7V0FBWSxFQUFBLEdBQUcsRUFBSCxJQUFVLENBQUcsRUFBRCxHQUFJLEdBQUosR0FBTyxFQUFULENBQVYsSUFBMkIsQ0FBRyxFQUFELEdBQUksR0FBSixHQUFPLEVBQVQ7QUFBdkM7O0FBUVYsV0FBQSxHQUFjLFNBQUMsSUFBRCxFQUFPLENBQVA7QUFFVixRQUFBOztRQUFBOztRQUFBLElBQUs7O0lBQ0wsUUFBQSxHQUFXO0FBRVgsU0FBUywrRkFBVDtRQUNJLENBQUEsR0FBSSxJQUFJLENBQUMsS0FBTSxDQUFBLENBQUE7UUFDZixJQUFHLENBQUMsQ0FBQyxNQUFGLEtBQVksQ0FBWixJQUFpQixDQUFB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QixPQVBoQjtJQVFBLEtBQUEsRUFBZ0IsS0FSaEI7SUFTQSxNQUFBLEVBQWdCLE1BVGhCO0lBVUEsS0FBQSxFQUFnQixLQVZoQjtJQVdBLE9BQUEsRUFBZ0IsT0FYaEI7SUFZQSxNQUFBLEVBQWdCLE1BWmhCO0lBYUEsT0FBQSxFQUFnQixPQWJoQjtJQWNBLFdBQUEsRUFBZ0IsV0FkaEI7SUFlQSxZQUFBLEVBQWdCLFlBZmhCO0lBZ0JBLFlBQUEsRUFBZ0IsWUFoQmhCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgICAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgICAgXG4gICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICAgMDAwMDAwMCAgICAgXG4jIyNcbiNcbiMgUG9seWjDqWRyb25pc21lLCBDb3B5cmlnaHQgMjAxOSwgQW5zZWxtIExldnNrYXlhLCBNSVQgTGljZW5zZVxuI1xuIyBQb2x5aGVkcm9uIE9wZXJhdG9yc1xuI1xuIyBmb3IgZWFjaCB2ZXJ0ZXggb2YgbmV3IHBvbHloZWRyb25cbiMgICAgIGNhbGwgbmV3VihWbmFtZSwgeHl6KSB3aXRoIGEgc3ltYm9saWMgbmFtZSBhbmQgY29vcmRpbmF0ZXNcbiNcbiMgZm9yIGVhY2ggZmxhZyBvZiBuZXcgcG9seWhlZHJvblxuIyAgICAgY2FsbCBuZXdGbGFnKEZuYW1lLCBWbmFtZTEsIFZuYW1lMikgd2l0aCBhIHN5bWJvbGljIG5hbWUgZm9yIHRoZSBuZXcgZmFjZVxuIyAgICAgYW5kIHRoZSBzeW1ib2xpYyBuYW1lIGZvciB0d28gdmVydGljZXMgZm9ybWluZyBhbiBvcmllbnRlZCBlZGdlXG4jXG4jIE9yaWVudGF0aW9uIG11c3QgYmUgZGVhbHQgd2l0aCBwcm9wZXJseSB0byBtYWtlIGEgbWFuaWZvbGQgbWVzaFxuIyBTcGVjaWZpY2FsbHksIG5vIGVkZ2UgdjEtPnYyIGNhbiBldmVyIGJlIGNyb3NzZWQgaW4gdGhlIHNhbWUgZGlyZWN0aW9uIGJ5IHR3byBkaWZmZXJlbnQgZmFjZXNcbiMgY2FsbCB0b3BvbHkoKSB0byBhc3NlbWJsZSBmbGFncyBpbnRvIHBvbHloZWRyb24gc3RydWN0dXJlIGJ5IGZvbGxvd2luZyB0aGUgb3JiaXRzXG4jIG9mIHRoZSB2ZXJ0ZXggbWFwcGluZyBzdG9yZWQgaW4gdGhlIGZsYWdzZXQgZm9yIGVhY2ggbmV3IGZhY2VcblxueyBjbGFtcCwga2xvZywgXyB9ID0gcmVxdWlyZSAna3hrJ1xueyBkb3QsIGFkZCwgbmVnLCBtdWx0LCBtYWcsIHN1YiwgdW5pdCwgY3Jvc3MsIHJvdGF0ZSwgb25lVGhpcmQsIHR3ZWVuLCBpbnRlcnNlY3QsIHJheVBsYW5lLCBtaWRwb2ludCwgY2FsY0NlbnRyb2lkLCBjb3B5VmVjQXJyYXkgfSA9IHJlcXVpcmUgJy4vbWF0aCdcbnsgdGFuZ2VudGlmeSwgcmVjaXByb2NhbEMsIHJlY2lwcm9jYWxOLCByZWNlbnRlciwgcmVzY2FsZSwgcGxhbmFyaXplIH0gPSByZXF1aXJlICcuL2dlbydcbnsgYWJzLCBhY29zIH0gPSBNYXRoXG5cbkZsYWcgPSByZXF1aXJlICcuL2ZsYWcnXG5Qb2x5aGVkcm9uID0gcmVxdWlyZSAnLi9wb2x5aGVkcm9uJ1xuXG5taWROYW1lID0gKHYxLCB2MikgLT4gdjE8djIgYW5kIFwiI3t2MX1fI3t2Mn1cIiBvciBcIiN7djJ9XyN7djF9XCIgIyB1bmlxdWUgbmFtZXMgb2YgbWlkcG9pbnRzXG5cbiMgMDAwMDAwMCAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAgIDAwMCAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiMgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG56aXJrdWxhcml6ZSA9IChwb2x5LCBuKSAtPlxuICAgIFxuICAgIG4gPz0gMFxuICAgIHZlcnRpY2VzID0gW11cbiAgICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBpZiBmLmxlbmd0aCA9PSBuIG9yIG4gPT0gMFxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlIC0yXG4gICAgICAgICAgICBmb3IgdjMgaW4gZlxuICAgICAgICAgICAgICAgIHYxMiA9IHN1YiBwb2x5LnZlcnRpY2VzW3YyXSwgcG9seS52ZXJ0aWNlc1t2MV1cbiAgICAgICAgICAgICAgICB2MzIgPSBzdWIgcG9seS52ZXJ0aWNlc1t2Ml0sIHBvbHkudmVydGljZXNbdjNdXG4gICAgICAgICAgICAgICAgaWYgYWJzKG1hZyh2MTIpIC0gbWFnKHYzMikpID4gMC4wMDFcbiAgICAgICAgICAgICAgICAgICAgbTEyID0gbWlkcG9pbnQgcG9seS52ZXJ0aWNlc1t2MV0sIHBvbHkudmVydGljZXNbdjJdXG4gICAgICAgICAgICAgICAgICAgIG0zMiA9IG1pZHBvaW50IHBvbHkudmVydGljZXNbdjNdLCBwb2x5LnZlcnRpY2VzW3YyXVxuICAgICAgICAgICAgICAgICAgICB1MTIgPSB1bml0IG0xMlxuICAgICAgICAgICAgICAgICAgICB1MzIgPSB1bml0IG0zMlxuICAgICAgICAgICAgICAgICAgICBuYyA9IGFkZCB1MTIsIHUzMlxuICAgICAgICAgICAgICAgICAgICBwbiA9IGNyb3NzIG5jLCBjcm9zcyBwb2x5LnZlcnRpY2VzW3YxXSwgcG9seS52ZXJ0aWNlc1t2M11cbiAgICAgICAgICAgICAgICAgICAgaWYgbWFnKHYxMikgPiBtYWcodjMyKVxuICAgICAgICAgICAgICAgICAgICAgICAgciA9IHJheVBsYW5lIHBvbHkudmVydGljZXNbdjNdLCB2MzIsIFswIDAgMF0sIHBuXG4gICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgIHIgPSByYXlQbGFuZSBwb2x5LnZlcnRpY2VzW3YxXSwgdjEyLCBbMCAwIDBdLCBwblxuICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNlc1t2Ml0gPSByXG4gICAgICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICBcbiAgICB2ZXJ0cyA9IFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdLm1hcCAoaSkgLT4gdmVydGljZXNbaV0gPyBwb2x5LnZlcnRpY2VzW2ldXG4gICAgXG4gICAgbmV3IFBvbHloZWRyb24gXCJ6I3twb2x5Lm5hbWV9XCIgcG9seS5mYWNlcywgdmVydHNcblxuIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG5cbmR1YWwgPSAocG9seSkgLT5cblxuICAgICMga2xvZyBcImR1YWwgI3twb2x5Lm5hbWV9XCIgXG4gIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZhY2UgPSBbXSBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXSBcbiAgICAgICAgZmFjZVtpXSA9IHt9XG5cbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IGZbZi5sZW5ndGgtMV0gIyBsYXN0IHZlcnRleFxuICAgICAgICBmb3IgdjIgaW4gZiAjIGFzc3VtZXMgdGhhdCBubyAyIGZhY2VzIHNoYXJlIGFuIGVkZ2UgaW4gdGhlIHNhbWUgb3JpZW50YXRpb24hXG4gICAgICAgICAgICBmYWNlW3YxXVtcInYje3YyfVwiXSA9IFwiI3tpfVwiXG4gICAgICAgICAgICB2MSA9IHYyICMgY3VycmVudCBiZWNvbWVzIHByZXZpb3VzXG4gIFxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGZsYWcubmV3ViBcIiN7aX1cIiBjZW50ZXJzW2ldXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gZltmLmxlbmd0aC0xXSAjcHJldmlvdXMgdmVydGV4XG4gICAgICAgIGZvciB2MiBpbiBmXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgdjEsIGZhY2VbdjJdW1widiN7djF9XCJdLCBcIiN7aX1cIlxuICAgICAgICAgICAgdjE9djIgIyBjdXJyZW50IGJlY29tZXMgcHJldmlvdXNcbiAgXG4gICAgZHBvbHkgPSBmbGFnLnRvcG9seSgpICMgYnVpbGQgdG9wb2xvZ2ljYWwgZHVhbCBmcm9tIGZsYWdzXG4gIFxuICAgICMgbWF0Y2ggRiBpbmRleCBvcmRlcmluZyB0byBWIGluZGV4IG9yZGVyaW5nIG9uIGR1YWxcbiAgICBzb3J0RiA9IFtdXG4gICAgZm9yIGYgaW4gZHBvbHkuZmFjZXNcbiAgICAgICAgayA9IGludGVyc2VjdCBwb2x5LmZhY2VzW2ZbMF1dLCBwb2x5LmZhY2VzW2ZbMV1dLCBwb2x5LmZhY2VzW2ZbMl1dXG4gICAgICAgIHNvcnRGW2tdID0gZlxuICAgIGRwb2x5LmZhY2VzID0gc29ydEZcbiAgXG4gICAgaWYgcG9seS5uYW1lWzBdICE9IFwiZFwiXG4gICAgICAgIGRwb2x5Lm5hbWUgPSBcImQje3BvbHkubmFtZX1cIlxuICAgIGVsc2UgXG4gICAgICAgIGRwb2x5Lm5hbWUgPSBwb2x5Lm5hbWUuc2xpY2UgMVxuICBcbiAgICBkcG9seVxuXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG4jIEtpcyAoYWJicmV2aWF0ZWQgZnJvbSB0cmlha2lzKSB0cmFuc2Zvcm1zIGFuIE4tc2lkZWQgZmFjZSBpbnRvIGFuIE4tcHlyYW1pZCByb290ZWQgYXQgdGhlXG4jIHNhbWUgYmFzZSB2ZXJ0aWNlcy4gb25seSBraXMgbi1zaWRlZCBmYWNlcywgYnV0IG49PTAgbWVhbnMga2lzIGFsbC5cblxua2lzID0gKHBvbHksIG4sIGFwZXhkaXN0KSAtPlxuXG4gICAgbiA/PSAwXG4gICAgYXBleGRpc3QgPz0gMFxuXG4gICAgIyBrbG9nIFwia2lzIG9mICN7biBhbmQgXCIje259LXNpZGVkIGZhY2VzIG9mIFwiIG9yICcnfSN7cG9seS5uYW1lfVwiXG5cbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgIHAgPSBwb2x5LnZlcnRpY2VzW2ldICMgZWFjaCBvbGQgdmVydGV4IGlzIGEgbmV3IHZlcnRleFxuICAgICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHBcbiAgXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm91bmRBbnkgPSBmYWxzZVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gXCJ2I3tmW2YubGVuZ3RoLTFdfVwiXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIHYyID0gXCJ2I3t2fVwiXG4gICAgICAgICAgICBpZiBmLmxlbmd0aCA9PSBuIG9yIG4gPT0gMFxuICAgICAgICAgICAgICAgIGZvdW5kQW55ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBhcGV4ID0gXCJhcGV4I3tpfVwiXG4gICAgICAgICAgICAgICAgZm5hbWUgPSBcIiN7aX0je3YxfVwiXG4gICAgICAgICAgICAgICAgIyBuZXcgdmVydGljZXMgaW4gY2VudGVycyBvZiBuLXNpZGVkIGZhY2VcbiAgICAgICAgICAgICAgICBmbGFnLm5ld1YgYXBleCwgYWRkIGNlbnRlcnNbaV0sIG11bHQgYXBleGRpc3QsIG5vcm1hbHNbaV1cbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsICAgdjEsICAgdjIgIyB0aGUgb2xkIGVkZ2Ugb2Ygb3JpZ2luYWwgZmFjZVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgICB2MiwgYXBleCAjIHVwIHRvIGFwZXggb2YgcHlyYW1pZFxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgYXBleCwgICB2MSAjIGFuZCBiYWNrIGRvd24gYWdhaW5cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCIje2l9XCIsIHYxLCB2MiAgIyBzYW1lIG9sZCBmbGFnLCBpZiBub24tblxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2MSA9IHYyICMgY3VycmVudCBiZWNvbWVzIHByZXZpb3VzXG4gIFxuICAgIGlmIG5vdCBmb3VuZEFueVxuICAgICAgICBrbG9nIFwiTm8gI3tufS1mb2xkIGNvbXBvbmVudHMgd2VyZSBmb3VuZC5cIlxuICBcbiAgICBmbGFnLnRvcG9seSBcImsje259I3twb2x5Lm5hbWV9XCJcblxuIyAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuXG4jIFRoZSBiZXN0IHdheSB0byB0aGluayBvZiB0aGUgYW1ibyBvcGVyYXRvciBpcyBhcyBhIHRvcG9sb2dpY2FsIFwidHdlZW5cIiBiZXR3ZWVuIGEgcG9seWhlZHJvblxuIyBhbmQgaXRzIGR1YWwgcG9seWhlZHJvbi4gIFRodXMgdGhlIGFtYm8gb2YgYSBkdWFsIHBvbHloZWRyb24gaXMgdGhlIHNhbWUgYXMgdGhlIGFtYm8gb2YgdGhlXG4jIG9yaWdpbmFsLiBBbHNvIGNhbGxlZCBcIlJlY3RpZnlcIi5cblxuYW1ibyA9IChwb2x5KSAtPlxuICAgIFxuICAgICMga2xvZyBcImFtYm8gb2YgI3twb2x5Lm5hbWV9XCJcbiAgICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICAjIEZvciBlYWNoIGZhY2UgZiBpbiB0aGUgb3JpZ2luYWwgcG9seVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSgtMilcbiAgICAgICAgZm9yIHYzIGluIGZcbiAgICAgICAgICAgIGlmIHYxIDwgdjIgIyB2ZXJ0aWNlcyBhcmUgdGhlIG1pZHBvaW50cyBvZiBhbGwgZWRnZXMgb2Ygb3JpZ2luYWwgcG9seVxuICAgICAgICAgICAgICAgIGZsYWcubmV3ViBtaWROYW1lKHYxLHYyKSwgbWlkcG9pbnQgcG9seS52ZXJ0aWNlc1t2MV0sIHBvbHkudmVydGljZXNbdjJdXG4gICAgICAgICAgICAjIGZhY2UgY29ycmVzcG9uZHMgdG8gdGhlIG9yaWdpbmFsIGZcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcIm9yaWcje2l9XCIgIG1pZE5hbWUodjEsdjIpLCBtaWROYW1lKHYyLHYzKVxuICAgICAgICAgICAgIyBmYWNlIGNvcnJlc3BvbmRzIHRvICh0aGUgdHJ1bmNhdGVkKSB2MlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiZHVhbCN7djJ9XCIgbWlkTmFtZSh2Mix2MyksIG1pZE5hbWUodjEsdjIpXG4gICAgICAgICAgICAjIHNoaWZ0IG92ZXIgb25lXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiYSN7cG9seS5uYW1lfVwiXG5cbiMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAwICAgIDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcblxuZ3lybyA9IChwb2x5KSAtPlxuXG4gICAgIyBrbG9nIFwiZ3lybyBvZiAje3BvbHkubmFtZX1cIlxuICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXVxuICAgICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHVuaXQgcG9seS52ZXJ0aWNlc1tpXSAjIGVhY2ggb2xkIHZlcnRleCBpcyBhIG5ldyB2ZXJ0ZXhcblxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKSAjIG5ldyB2ZXJ0aWNlcyBpbiBjZW50ZXIgb2YgZWFjaCBmYWNlXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgZmxhZy5uZXdWIFwiY2VudGVyI3tpfVwiIHVuaXQgY2VudGVyc1tpXVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UoLTIpXG4gICAgICAgIGZvciBqIGluIFswLi4uZi5sZW5ndGhdXG4gICAgICAgICAgICB2ID0gZltqXVxuICAgICAgICAgICAgdjMgPSB2XG4gICAgICAgICAgICBmbGFnLm5ld1YodjErXCJ+XCIrdjIsIG9uZVRoaXJkKHBvbHkudmVydGljZXNbdjFdLHBvbHkudmVydGljZXNbdjJdKSk7ICAjIG5ldyB2IGluIGZhY2VcbiAgICAgICAgICAgIGZuYW1lID0gaStcImZcIit2MVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBcImNlbnRlciN7aX1cIiAgdjErXCJ+XCIrdjIgIyBmaXZlIG5ldyBmbGFnc1xuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCB2MStcIn5cIit2MiwgIHYyK1wiflwiK3YxXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIHYyK1wiflwiK3YxLCAgXCJ2I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBcInYje3YyfVwiICAgICB2MitcIn5cIit2M1xuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCB2MitcIn5cIit2MywgIFwiY2VudGVyI3tpfVwiXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiZyN7cG9seS5uYW1lfVwiXG5cbiMgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICBcblxucmVmbGVjdCA9IChwb2x5KSAtPiAjIGdlb21ldHJpYyByZWZsZWN0aW9uIHRocm91Z2ggb3JpZ2luXG5cbiAgICBrbG9nIFwicmVmbGVjdGlvbiBvZiAje3BvbHkubmFtZX1cIlxuICAgICMgcmVmbGVjdCBlYWNoIHBvaW50IHRocm91Z2ggb3JpZ2luXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgcG9seS52ZXJ0aWNlc1tpXSA9IG11bHQgLTEsIHBvbHkudmVydGljZXNbaV1cbiAgICAjIHJlcGFpciBjbG9ja3dpc2UtbmVzcyBvZiBmYWNlc1xuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIHBvbHkuZmFjZXNbaV0gPSBwb2x5LmZhY2VzW2ldLnJldmVyc2UoKVxuICAgIHBvbHkubmFtZSA9IFwiciN7cG9seS5uYW1lfVwiXG4gICAgcG9seVxuXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbmNoYW1mZXIgPSAocG9seSwgZmFjdG9yPTAuNSkgLT5cblxuICAgIGZhY3RvciA9IGNsYW1wIDAuMDAxIDAuOTk1IGZhY3RvclxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgd2luZ3MgICA9IHBvbHkud2luZ3MoKVxuICAgIFxuICAgIGZvciBlZGdlIGluIHdpbmdzXG4gICAgICAgIGUwICA9IHBvbHkudmVydGljZXNbZWRnZVswXV1cbiAgICAgICAgZTEgID0gcG9seS52ZXJ0aWNlc1tlZGdlWzFdXVxuICAgICAgICBuZmwgPSBub3JtYWxzW2VkZ2VbMl0uZmxdXG4gICAgICAgIG5mciA9IG5vcm1hbHNbZWRnZVsyXS5mcl1cbiAgICAgICAgZW1wID0gbWlkcG9pbnQgZTAsIGUxXG4gICAgICAgIGVkaXIgPSBzdWIgZTEsIGUwXG4gICAgICAgIGZhY2VBbmdsZSA9IGFjb3MgZG90IG5mbCwgbmZyXG4gICAgICAgIFxuICAgICAgICBtcHIgPSByb3RhdGUgZW1wLCBlZGlyLCAtZmFjdG9yKmZhY2VBbmdsZS8yXG4gICAgICAgIG1wbCA9IHJvdGF0ZSBlbXAsIGVkaXIsICBmYWN0b3IqZmFjZUFuZ2xlLzJcbiAgICAgICAgXG4gICAgICAgIGUxZnIgPSBzdWIgY2VudGVyc1tlZGdlWzJdLmZyXSwgZTFcbiAgICAgICAgZTFmbCA9IHN1YiBjZW50ZXJzW2VkZ2VbMl0uZmxdLCBlMVxuICAgICAgICBlMGZyID0gc3ViIGNlbnRlcnNbZWRnZVsyXS5mcl0sIGUwXG4gICAgICAgIGUwZmwgPSBzdWIgY2VudGVyc1tlZGdlWzJdLmZsXSwgZTBcbiAgICAgICAgXG4gICAgICAgIG5yID0gcmF5UGxhbmUgbXByLCBlZGlyLCAgICAgIGUxLCB1bml0IGNyb3NzIG5mciwgZTFmclxuICAgICAgICBubCA9IHJheVBsYW5lIG1wbCwgZWRpciwgICAgICBlMSwgdW5pdCBjcm9zcyBuZmwsIGUxZmxcbiAgICAgICAgcHIgPSByYXlQbGFuZSBtcHIsIG5lZyhlZGlyKSwgZTAsIHVuaXQgY3Jvc3MgbmZyLCBlMGZyXG4gICAgICAgIHBsID0gcmF5UGxhbmUgbXBsLCBuZWcoZWRpciksIGUwLCB1bml0IGNyb3NzIG5mbCwgZTBmbFxuXG4gICAgICAgIG5mICA9IFwiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1cIiBcbiAgICAgICAgbl9oID0gXCIje2VkZ2VbMV19XCJcbiAgICAgICAgbl90ID0gXCIje2VkZ2VbMF19XCJcblxuICAgICAgICBubnIgPSBcIiN7bl9ofeKWuCN7ZWRnZVsyXS5mcn1cIlxuICAgICAgICBubmwgPSBcIiN7bl9ofeKWuCN7ZWRnZVsyXS5mbH1cIlxuICAgICAgICBucHIgPSBcIiN7bl90feKWuCN7ZWRnZVsyXS5mcn1cIlxuICAgICAgICBucGwgPSBcIiN7bl90feKWuCN7ZWRnZVsyXS5mbH1cIiAgICAgICAgICAgICAgICBcblxuICAgICAgICBuZm4gPSB1bml0IGVtcFxuICAgICAgICBubXAgPSBtaWRwb2ludCBuciwgcGxcbiAgICAgICAgXG4gICAgICAgIGZsYWcubmV3ViBuX2gsIHJheVBsYW5lIFswIDAgMF0sIGUxLCBubXAsIG5mbiBcbiAgICAgICAgZmxhZy5uZXdWIG5fdCwgcmF5UGxhbmUgWzAgMCAwXSwgZTAsIG5tcCwgbmZuIFxuICAgICAgICBmbGFnLm5ld1Ygbm5yLCBuclxuICAgICAgICBmbGFnLm5ld1Ygbm5sLCBubFxuICAgICAgICBmbGFnLm5ld1YgbnBsLCBwbFxuICAgICAgICBmbGFnLm5ld1YgbnByLCBwclxuXG4gICAgICAgIGZsYWcubmV3RmxhZyBuZiwgbl9oLCBubnJcbiAgICAgICAgZmxhZy5uZXdGbGFnIG5mLCBubnIsIG5wclxuICAgICAgICBmbGFnLm5ld0ZsYWcgbmYsIG5wciwgbl90XG4gICAgICAgIGZsYWcubmV3RmxhZyBuZiwgbl90LCBucGxcbiAgICAgICAgZmxhZy5uZXdGbGFnIG5mLCBucGwsIG5ubFxuICAgICAgICBmbGFnLm5ld0ZsYWcgbmYsIG5ubCwgbl9oXG4gICAgICAgIFxuICAgICAgICBmbGFnLm5ld0ZsYWcgXCIje2VkZ2VbMl0uZnJ9XCIgbnByLCBubnJcbiAgICAgICAgZmxhZy5uZXdGbGFnIFwiI3tlZGdlWzJdLmZsfVwiIG5ubCwgbnBsXG4gICAgICAgIFxuICAgIGZsYWcudG9wb2x5IFwiYyN7cG9seS5uYW1lfVwiXG5cbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICBcblxuIyBHeXJvIGZvbGxvd2VkIGJ5IHRydW5jYXRpb24gb2YgdmVydGljZXMgY2VudGVyZWQgb24gb3JpZ2luYWwgZmFjZXMuXG4jIFRoaXMgY3JlYXRlIDIgbmV3IGhleGFnb25zIGZvciBldmVyeSBvcmlnaW5hbCBlZGdlLlxuIyAoaHR0cHM6I2VuLndpa2lwZWRpYS5vcmcvd2lraS9Db253YXlfcG9seWhlZHJvbl9ub3RhdGlvbiNPcGVyYXRpb25zX29uX3BvbHloZWRyYSlcbiNcbiMgUG9zc2libGUgZXh0ZW5zaW9uOiB0YWtlIGEgcGFyYW1ldGVyIG4gdGhhdCBtZWFucyBvbmx5IHdoaXJsIG4tc2lkZWQgZmFjZXMuXG4jIElmIHdlIGRvIHRoYXQsIHRoZSBmbGFncyBtYXJrZWQgIyogYmVsb3cgd2lsbCBuZWVkIHRvIGhhdmUgdGhlaXIgb3RoZXIgc2lkZXNcbiMgZmlsbGVkIGluIG9uZSB3YXkgb3IgYW5vdGhlciwgZGVwZW5kaW5nIG9uIHdoZXRoZXIgdGhlIGFkamFjZW50IGZhY2UgaXNcbiMgd2hpcmxlZCBvciBub3QuXG5cbndoaXJsID0gKHBvbHksIG4pIC0+XG5cbiAgICBrbG9nIFwid2hpcmwgb2YgI3twb2x5Lm5hbWV9XCJcbiAgICBuID89IDBcbiAgICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXVxuICAgICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHVuaXQgcG9seS52ZXJ0aWNlc1tpXVxuXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSAtMlxuICAgICAgICBmb3IgaiBpbiBbMC4uLmYubGVuZ3RoXVxuICAgICAgICAgICAgdiA9IGZbal1cbiAgICAgICAgICAgIHYzID0gdlxuICAgICAgICAgICAgdjFfMiA9IG9uZVRoaXJkIHBvbHkudmVydGljZXNbdjFdLCBwb2x5LnZlcnRpY2VzW3YyXVxuICAgICAgICAgICAgZmxhZy5uZXdWKHYxK1wiflwiK3YyLCB2MV8yKVxuICAgICAgICAgICAgY3YxbmFtZSA9IFwiY2VudGVyI3tpfX4je3YxfVwiXG4gICAgICAgICAgICBjdjJuYW1lID0gXCJjZW50ZXIje2l9fiN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcubmV3ViBjdjFuYW1lLCB1bml0IG9uZVRoaXJkIGNlbnRlcnNbaV0sIHYxXzJcbiAgICAgICAgICAgIGZuYW1lID0gaStcImZcIit2MVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBjdjFuYW1lLCAgIHYxK1wiflwiK3YyXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIHYxK1wiflwiK3YyLCB2MitcIn5cIit2MSBcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgdjIrXCJ+XCIrdjEsIFwidiN7djJ9XCIgIFxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBcInYje3YyfVwiLCAgdjIrXCJ+XCIrdjMgXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIHYyK1wiflwiK3YzLCBjdjJuYW1lXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIGN2Mm5hbWUsICAgY3YxbmFtZVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiYyN7aX1cIiwgY3YxbmFtZSwgY3YybmFtZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdICMgc2hpZnQgb3ZlciBvbmVcbiAgXG4gICAgZmxhZy50b3BvbHkgXCJ3I3twb2x5Lm5hbWV9XCJcblxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAwMCAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuIyAwMDAgMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiMgIDAwMDAwIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgXG5cbnF1aW50byA9IChwb2x5KSAtPiAjIGNyZWF0ZXMgYSBwZW50YWdvbiBmb3IgZXZlcnkgcG9pbnQgaW4gdGhlIG9yaWdpbmFsIGZhY2UsIGFzIHdlbGwgYXMgb25lIG5ldyBpbnNldCBmYWNlLlxuICAgIFxuICAgICMga2xvZyBcInF1aW50byBvZiAje3BvbHkubmFtZX1cIlxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgICMgRm9yIGVhY2ggZmFjZSBmIGluIHRoZSBvcmlnaW5hbCBwb2x5XG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgY2VudHJvaWQgPSBjYWxjQ2VudHJvaWQgZi5tYXAgKGlkeCkgLT4gcG9seS52ZXJ0aWNlc1tpZHhdXG4gICAgICAgICMgd2FsayBvdmVyIGZhY2UgdmVydGV4LXRyaXBsZXRzXG4gICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSAtMlxuICAgICAgICBmb3IgdjMgaW4gZlxuICAgICAgICAgICAgIyBmb3IgZWFjaCBmYWNlLWNvcm5lciwgd2UgbWFrZSB0d28gbmV3IHBvaW50czpcbiAgICAgICAgICAgIG1pZHB0ID0gbWlkcG9pbnQgcG9seS52ZXJ0aWNlc1t2MV0sIHBvbHkudmVydGljZXNbdjJdXG4gICAgICAgICAgICBpbm5lcnB0ID0gbWlkcG9pbnQgbWlkcHQsIGNlbnRyb2lkXG4gICAgICAgICAgICBmbGFnLm5ld1YgbWlkTmFtZSh2MSx2MiksIG1pZHB0XG4gICAgICAgICAgICBmbGFnLm5ld1YgXCJpbm5lcl8je2l9X1wiICsgbWlkTmFtZSh2MSx2MiksIGlubmVycHRcbiAgICAgICAgICAgICMgYW5kIGFkZCB0aGUgb2xkIGNvcm5lci12ZXJ0ZXhcbiAgICAgICAgICAgIGZsYWcubmV3ViBcIiN7djJ9XCIgcG9seS52ZXJ0aWNlc1t2Ml1cbiAgICAgICAgICBcbiAgICAgICAgICAgICMgcGVudGFnb24gZm9yIGVhY2ggdmVydGV4IGluIG9yaWdpbmFsIGZhY2VcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImYje2l9XyN7djJ9XCIsIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYxLCB2MiksIG1pZE5hbWUodjEsIHYyKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiZiN7aX1fI3t2Mn1cIiwgbWlkTmFtZSh2MSwgdjIpLCBcIiN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImYje2l9XyN7djJ9XCIsIFwiI3t2Mn1cIiwgbWlkTmFtZSh2MiwgdjMpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmI3tpfV8je3YyfVwiLCBtaWROYW1lKHYyLCB2MyksIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYyLCB2MylcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImYje2l9XyN7djJ9XCIsIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYyLCB2MyksIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYxLCB2MilcbiAgICAgIFxuICAgICAgICAgICAgIyBpbm5lciByb3RhdGVkIGZhY2Ugb2Ygc2FtZSB2ZXJ0ZXgtbnVtYmVyIGFzIG9yaWdpbmFsXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmX2luXyN7aX1cIiwgXCJpbm5lcl8je2l9X1wiK21pZE5hbWUodjEsIHYyKSwgXCJpbm5lcl8je2l9X1wiK21pZE5hbWUodjIsIHYzKVxuICAgICAgXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdICMgc2hpZnQgb3ZlciBvbmVcbiAgXG4gICAgZmxhZy50b3BvbHkgXCJxI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDBcbiMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgXG4jIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgIFxuIyAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgMDAwICAgXG5cbmluc2V0ID0gKHBvbHksIG4sIGluc2V0X2Rpc3QsIHBvcG91dF9kaXN0KSAtPlxuXG4gICAgbiA/PSAwXG4gICAgaW5zZXRfZGlzdCA/PSAwLjVcbiAgICBwb3BvdXRfZGlzdCA/PSAtMC4yXG4gIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgIyBlYWNoIG9sZCB2ZXJ0ZXggaXMgYSBuZXcgdmVydGV4XG4gICAgICAgIHAgPSBwb2x5LnZlcnRpY2VzW2ldXG4gICAgICAgIGZsYWcubmV3ViBcInYje2l9XCIgcFxuXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF0gIyBuZXcgaW5zZXQgdmVydGV4IGZvciBldmVyeSB2ZXJ0IGluIGZhY2VcbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgaWYgZi5sZW5ndGggPT0gbiBvciBuID09IDBcbiAgICAgICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgICAgICBmbGFnLm5ld1YgXCJmI3tpfXYje3Z9XCIgYWRkIHR3ZWVuKHBvbHkudmVydGljZXNbdl0sY2VudGVyc1tpXSxpbnNldF9kaXN0KSwgbXVsdChwb3BvdXRfZGlzdCxub3JtYWxzW2ldKVxuICBcbiAgICBmb3VuZEFueSA9IGZhbHNlICMgYWxlcnQgaWYgZG9uJ3QgZmluZCBhbnlcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MiA9IFwidiN7dn1cIjtcbiAgICAgICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICAgICAgZm91bmRBbnkgPSB0cnVlXG4gICAgICAgICAgICAgICAgZm5hbWUgPSBpICsgdjFcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsICAgICAgdjEsICAgICAgIHYyKVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgICAgICB2MiwgICAgICAgXCJmI3tpfSN7djJ9XCIpXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCBcImYje2l9I3t2Mn1cIiwgIFwiZiN7aX0je3YxfVwiKVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgXCJmI3tpfSN7djF9XCIsICB2MSlcbiAgICAgICAgICAgICAgICAjIG5ldyBpbnNldCwgZXh0cnVkZWQgZmFjZVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImV4I3tpfVwiLCBcImYje2l9I3t2MX1cIiwgIFwiZiN7aX0je3YyfVwiKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyhpLCB2MSwgdjIpICAjIHNhbWUgb2xkIGZsYWcsIGlmIG5vbi1uXG4gICAgICAgICAgICB2MT12MiAjIGN1cnJlbnQgYmVjb21lcyBwcmV2aW91c1xuICBcbiAgICBpZiBub3QgZm91bmRBbnlcbiAgICAgICAga2xvZyBcIk5vICN7bn0tZm9sZCBjb21wb25lbnRzIHdlcmUgZm91bmQuXCJcbiAgXG4gICAgZmxhZy50b3BvbHkgXCJuI3tufSN7cG9seS5uYW1lfVwiXG5cbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG5cbmV4dHJ1ZGUgPSAocG9seSwgbiwgcG9wb3V0PTEsIGluc2V0Zj0wLjUpIC0+XG4gICAgbmV3cG9seSA9IGluc2V0IHBvbHksIG4sIGluc2V0ZiwgcG9wb3V0XG4gICAgbmV3cG9seS5uYW1lID0gXCJ4I3tufSN7cG9seS5uYW1lfVwiXG4gICAgbmV3cG9seVxuXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgXG5cbmhvbGxvdyA9IChwb2x5LCBpbnNldF9kaXN0LCB0aGlja25lc3MpIC0+XG5cbiAgICBpbnNldF9kaXN0ID89IDAuNVxuICAgIHRoaWNrbmVzcyA/PSAwLjJcbiAgXG4gICAgZHVhbG5vcm1hbHMgPSBkdWFsKHBvbHkpLm5vcm1hbHMoKVxuICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgICMgZWFjaCBvbGQgdmVydGV4IGlzIGEgbmV3IHZlcnRleFxuICAgICAgICBwID0gcG9seS52ZXJ0aWNlc1tpXVxuICAgICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHBcbiAgICAgICAgZmxhZy5uZXdWIFwiZG93bnYje2l9XCIgYWRkIHAsIG11bHQgLTEqdGhpY2tuZXNzLGR1YWxub3JtYWxzW2ldXG5cbiAgICAjIG5ldyBpbnNldCB2ZXJ0ZXggZm9yIGV2ZXJ5IHZlcnQgaW4gZmFjZVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIGZsYWcubmV3ViBcImZpbiN7aX12I3t2fVwiIHR3ZWVuIHBvbHkudmVydGljZXNbdl0sIGNlbnRlcnNbaV0sIGluc2V0X2Rpc3RcbiAgICAgICAgICAgIGZsYWcubmV3ViBcImZpbmRvd24je2l9diN7dn1cIiBhZGQgdHdlZW4ocG9seS52ZXJ0aWNlc1t2XSxjZW50ZXJzW2ldLGluc2V0X2Rpc3QpLCBtdWx0KC0xKnRoaWNrbmVzcyxub3JtYWxzW2ldKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MiA9IFwidiN7dn1cIlxuICAgICAgICAgICAgZm5hbWUgPSBpICsgdjFcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgdjEsICAgICAgICAgICAgdjJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgdjIsICAgICAgICAgICAgXCJmaW4je2l9I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBcImZpbiN7aX0je3YyfVwiIFwiZmluI3tpfSN7djF9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgXCJmaW4je2l9I3t2MX1cIiB2MVxuICAgICAgXG4gICAgICAgICAgICBmbmFtZSA9IFwic2lkZXMje2l9I3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBcImZpbiN7aX0je3YxfVwiICAgICBcImZpbiN7aX0je3YyfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIFwiZmluI3tpfSN7djJ9XCIgICAgIFwiZmluZG93biN7aX0je3YyfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIFwiZmluZG93biN7aX0je3YyfVwiIFwiZmluZG93biN7aX0je3YxfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIFwiZmluZG93biN7aX0je3YxfVwiIFwiZmluI3tpfSN7djF9XCJcbiAgICAgIFxuICAgICAgICAgICAgZm5hbWUgPSBcImJvdHRvbSN7aX0je3YxfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsICBcImRvd24je3YyfVwiICAgICAgICBcImRvd24je3YxfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsICBcImRvd24je3YxfVwiICAgICAgICBcImZpbmRvd24je2l9I3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCAgXCJmaW5kb3duI3tpfSN7djF9XCIgXCJmaW5kb3duI3tpfSN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgIFwiZmluZG93biN7aX0je3YyfVwiIFwiZG93biN7djJ9XCJcbiAgICAgIFxuICAgICAgICAgICAgdjEgPSB2MiAjIGN1cnJlbnQgYmVjb21lcyBwcmV2aW91c1xuICBcbiAgICBmbGFnLnRvcG9seSBcIkgje3BvbHkubmFtZX1cIlxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMDAwXG4jIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcbiMgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMCAgICAgIDAwMCAgIDAwMFxuXG5wZXJzcGVjdGl2YSA9IChwb2x5KSAtPiAjIGFuIG9wZXJhdGlvbiByZXZlcnNlLWVuZ2luZWVyZWQgZnJvbSBQZXJzcGVjdGl2YSBDb3Jwb3J1bSBSZWd1bGFyaXVtXG5cbiAgICAjIGtsb2cgXCJzdGVsbGEgb2YgI3twb2x5Lm5hbWV9XCJcbiAgXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpICMgY2FsY3VsYXRlIGZhY2UgY2VudGVyc1xuICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgIGZsYWcubmV3ViBcInYje2l9XCIgcG9seS52ZXJ0aWNlc1tpXVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBcbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMl19XCJcbiAgICAgICAgdjIgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgdmVydDEgPSBwb2x5LnZlcnRpY2VzW2ZbZi5sZW5ndGgtMl1dXG4gICAgICAgIHZlcnQyID0gcG9seS52ZXJ0aWNlc1tmW2YubGVuZ3RoLTFdXVxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MyA9IFwidiN7dn1cIlxuICAgICAgICAgICAgdmVydDMgPSBwb2x5LnZlcnRpY2VzW3ZdXG4gICAgICAgICAgICB2MTIgPSB2MStcIn5cIit2MlxuICAgICAgICAgICAgdjIxID0gdjIrXCJ+XCIrdjFcbiAgICAgICAgICAgIHYyMyA9IHYyK1wiflwiK3YzXG4gICAgICBcbiAgICAgICAgICAgICMgb24gZWFjaCBOZmFjZSwgTiBuZXcgcG9pbnRzIGluc2V0IGZyb20gZWRnZSBtaWRwb2ludHMgdG93YXJkcyBjZW50ZXIgPSBcInN0ZWxsYXRlZFwiIHBvaW50c1xuICAgICAgICAgICAgZmxhZy5uZXdWIHYxMiwgbWlkcG9pbnQgbWlkcG9pbnQodmVydDEsdmVydDIpLCBjZW50ZXJzW2ldIFxuICAgICAgXG4gICAgICAgICAgICAjIGluc2V0IE5mYWNlIG1hZGUgb2YgbmV3LCBzdGVsbGF0ZWQgcG9pbnRzXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJpbiN7aX1cIiB2MTIsIHYyM1xuICAgICAgXG4gICAgICAgICAgICAjIG5ldyB0cmkgZmFjZSBjb25zdGl0dXRpbmcgdGhlIHJlbWFpbmRlciBvZiB0aGUgc3RlbGxhdGVkIE5mYWNlXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmI3tpfSN7djJ9XCIgdjIzLCB2MTJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImYje2l9I3t2Mn1cIiB2MTIsIHYyXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmI3tpfSN7djJ9XCIgdjIsICB2MjNcbiAgICAgIFxuICAgICAgICAgICAgIyBvbmUgb2YgdGhlIHR3byBuZXcgdHJpYW5nbGVzIHJlcGxhY2luZyBvbGQgZWRnZSBiZXR3ZWVuIHYxLT52MlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiZiN7djEyfVwiIHYxLCAgdjIxXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmI3t2MTJ9XCIgdjIxLCB2MTJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImYje3YxMn1cIiB2MTIsIHYxXG4gICAgICBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M10gICMgY3VycmVudCBiZWNvbWVzIHByZXZpb3VzXG4gICAgICAgICAgICBbdmVydDEsIHZlcnQyXSA9IFt2ZXJ0MiwgdmVydDNdXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiUCN7cG9seS5uYW1lfVwiXG5cbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcblxudHJpc3ViID0gKHBvbHksIG49MikgLT5cbiAgICBcbiAgICAjIE5vLU9wIGZvciBub24tdHJpYW5ndWxhciBtZXNoZXNcbiAgICBmb3IgZm4gaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgaWYgcG9seS5mYWNlc1tmbl0ubGVuZ3RoICE9IDNcbiAgICAgICAgICAgIHJldHVybiBwb2x5XG4gIFxuICAgIG5ld1ZzID0gW11cbiAgICB2bWFwID0ge31cbiAgICBwb3MgPSAwXG4gICAgZm9yIGZuIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ZuXVxuICAgICAgICBbaTEsIGkyLCBpM10gPSBmLnNsaWNlIC0zXG4gICAgICAgIHYxID0gcG9seS52ZXJ0aWNlc1tpMV1cbiAgICAgICAgdjIgPSBwb2x5LnZlcnRpY2VzW2kyXVxuICAgICAgICB2MyA9IHBvbHkudmVydGljZXNbaTNdXG4gICAgICAgIHYyMSA9IHN1YiB2MiwgdjFcbiAgICAgICAgdjMxID0gc3ViIHYzLCB2MVxuICAgICAgICBmb3IgaSBpbiBbMC4ubl1cbiAgICAgICAgICAgIGZvciBqIGluIFswLi5uLWldXG4gICAgICAgICAgICAgICAgdiA9IGFkZCBhZGQodjEsIG11bHQoaS9uLCB2MjEpKSwgbXVsdChqL24sIHYzMSlcbiAgICAgICAgICAgICAgICB2bWFwW1widiN7Zm59LSN7aX0tI3tqfVwiXSA9IHBvcysrXG4gICAgICAgICAgICAgICAgbmV3VnMucHVzaCB2XG4gIFxuICAgIEVQU0lMT05fQ0xPU0UgPSAxLjBlLThcbiAgICB1bmlxVnMgPSBbXVxuICAgIG5ld3BvcyA9IDBcbiAgICB1bmlxbWFwID0ge31cbiAgICBmb3IgdixpIGluIG5ld1ZzXG4gICAgICAgIGlmIGkgaW4gdW5pcW1hcCB0aGVuIGNvbnRpbnVlICMgYWxyZWFkeSBtYXBwZWRcbiAgICAgICAgdW5pcW1hcFtpXSA9IG5ld3Bvc1xuICAgICAgICB1bmlxVnMucHVzaCB2XG4gICAgICAgIGZvciBqIGluIFtpKzEuLi5uZXdWcy5sZW5ndGhdXG4gICAgICAgICAgICB3ID0gbmV3VnNbal1cbiAgICAgICAgICAgIGlmIG1hZyhzdWIodiwgdykpIDwgRVBTSUxPTl9DTE9TRVxuICAgICAgICAgICAgICAgIHVuaXFtYXBbal0gPSBuZXdwb3NcbiAgICAgICAgbmV3cG9zKytcbiAgXG4gICAgZmFjZXMgPSBbXVxuICAgIGZvciBmbiBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmb3IgaSBpbiBbMC4uLm5dXG4gICAgICAgICAgICBmb3IgaiBpbiBbMC4uLm4taV1cbiAgICAgICAgICAgICAgICBmYWNlcy5wdXNoIFt1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2p9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aSsxfS0je2p9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqKzF9XCJdXV1cbiAgICAgICAgZm9yIGkgaW4gWzEuLi5uXVxuICAgICAgICAgICAgZm9yIGogaW4gWzAuLi5uLWldXG4gICAgICAgICAgICAgICAgZmFjZXMucHVzaCBbdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2l9LSN7aisxfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2ktMX0tI3tqKzF9XCJdXV1cbiAgXG4gICAgIyBrbG9nICdmYWNlcycgZmFjZXNcbiAgICAjIGtsb2cgJ3ZlcnRpY2VzJyB1bmlxVnMgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgXG4gICAgbmV3IFBvbHloZWRyb24gXCJ1I3tufSN7cG9seS5uYW1lfVwiIGZhY2VzLCB1bmlxVnNcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG5jYW5vbmljYWxpemUgPSAocG9seSwgaXRlcj0yMDApIC0+XG5cbiAgICAjIGtsb2cgXCJjYW5vbmljYWxpemUgI3twb2x5Lm5hbWV9XCJcbiAgICBmYWNlcyA9IHBvbHkuZmFjZXNcbiAgICBlZGdlcyA9IHBvbHkuZWRnZXMoKVxuICAgIG5ld1ZzID0gcG9seS52ZXJ0aWNlc1xuICAgIG1heENoYW5nZSA9IDEuMCAjIGNvbnZlcmdlbmNlIHRyYWNrZXJcbiAgICBmb3IgaSBpbiBbMC4uaXRlcl1cbiAgICAgICAgb2xkVnMgPSBjb3B5VmVjQXJyYXkgbmV3VnNcbiAgICAgICAgbmV3VnMgPSB0YW5nZW50aWZ5IG5ld1ZzLCBlZGdlc1xuICAgICAgICBuZXdWcyA9IHJlY2VudGVyIG5ld1ZzLCBlZGdlc1xuICAgICAgICBuZXdWcyA9IHBsYW5hcml6ZSBuZXdWcywgZmFjZXNcbiAgICAgICAgbWF4Q2hhbmdlID0gXy5tYXggXy5tYXAgXy56aXAobmV3VnMsIG9sZFZzKSwgKFt4LCB5XSkgLT4gbWFnIHN1YiB4LCB5XG4gICAgICAgIGlmIG1heENoYW5nZSA8IDFlLThcbiAgICAgICAgICAgIGJyZWFrXG4gICAgIyBvbmUgc2hvdWxkIG5vdyByZXNjYWxlLCBidXQgbm90IHJlc2NhbGluZyBoZXJlIG1ha2VzIGZvciB2ZXJ5IGludGVyZXN0aW5nIG51bWVyaWNhbFxuICAgICMgaW5zdGFiaWxpdGllcyB0aGF0IG1ha2UgaW50ZXJlc3RpbmcgbXV0YW50cyBvbiBtdWx0aXBsZSBhcHBsaWNhdGlvbnMuLi5cbiAgICAjIG1vcmUgZXhwZXJpZW5jZSB3aWxsIHRlbGwgd2hhdCB0byBkb1xuICAgIG5ld1ZzID0gcmVzY2FsZShuZXdWcylcbiAgICAjIGtsb2cgXCJbY2Fub25pY2FsaXphdGlvbiBkb25lLCBsYXN0IHxkZWx0YVZ8PSN7bWF4Q2hhbmdlfV1cIlxuICAgIG5ld3BvbHkgPSBuZXcgUG9seWhlZHJvbiBwb2x5Lm5hbWUsIHBvbHkuZmFjZXMsIG5ld1ZzXG4gICAgIyBrbG9nIFwiY2Fub25pY2FsaXplXCIgbmV3cG9seVxuICAgIG5ld3BvbHlcbiAgICBcbmNhbm9uaWNhbFhZWiA9IChwb2x5LCBpdGVyYXRpb25zKSAtPlxuXG4gICAgaXRlcmF0aW9ucyA/PSAxXG4gICAgZHBvbHkgPSBkdWFsIHBvbHlcbiAgICAjIGtsb2cgXCJjYW5vbmljYWxYWVogI3twb2x5Lm5hbWV9XCJcbiAgXG4gICAgZm9yIGNvdW50IGluIFswLi4uaXRlcmF0aW9uc10gIyByZWNpcHJvY2F0ZSBmYWNlIG5vcm1hbHNcbiAgICAgICAgZHBvbHkudmVydGljZXMgPSByZWNpcHJvY2FsTiBwb2x5XG4gICAgICAgIHBvbHkudmVydGljZXMgID0gcmVjaXByb2NhbE4gZHBvbHlcbiAgXG4gICAgbmV3IFBvbHloZWRyb24gcG9seS5uYW1lLCBwb2x5LmZhY2VzLCBwb2x5LnZlcnRpY2VzXG5cbmZsYXR0ZW4gPSAocG9seSwgaXRlcmF0aW9ucykgLT4gIyBxdWljayBwbGFuYXJpemF0aW9uXG4gICAgXG4gICAgaXRlcmF0aW9ucyA/PSAxXG4gICAgZHBvbHkgPSBkdWFsIHBvbHkgIyB2J3Mgb2YgZHVhbCBhcmUgaW4gb3JkZXIgb2YgYXJnJ3MgZidzXG4gICAgIyBrbG9nIFwiZmxhdHRlbiAje3BvbHkubmFtZX1cIlxuICBcbiAgICBmb3IgY291bnQgaW4gWzAuLi5pdGVyYXRpb25zXSAjIHJlY2lwcm9jYXRlIGZhY2UgY2VudGVyc1xuICAgICAgICBkcG9seS52ZXJ0aWNlcyA9IHJlY2lwcm9jYWxDIHBvbHlcbiAgICAgICAgcG9seS52ZXJ0aWNlcyAgPSByZWNpcHJvY2FsQyBkcG9seVxuICBcbiAgICBuZXcgUG9seWhlZHJvbiBwb2x5Lm5hbWUsIHBvbHkuZmFjZXMsIHBvbHkudmVydGljZXNcbiAgICBcbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gICAgZHVhbDogICAgICAgICAgIGR1YWxcbiAgICB0cmlzdWI6ICAgICAgICAgdHJpc3ViXG4gICAgcGVyc3BlY3RpdmE6ICAgIHBlcnNwZWN0aXZhXG4gICAga2lzOiAgICAgICAgICAgIGtpc1xuICAgIGFtYm86ICAgICAgICAgICBhbWJvXG4gICAgZ3lybzogICAgICAgICAgIGd5cm9cbiAgICByZWZsZWN0OiAgICAgICAgcmVmbGVjdFxuICAgIGNoYW1mZXI6ICAgICAgICBjaGFtZmVyXG4gICAgd2hpcmw6ICAgICAgICAgIHdoaXJsXG4gICAgcXVpbnRvOiAgICAgICAgIHF1aW50b1xuICAgIGluc2V0OiAgICAgICAgICBpbnNldFxuICAgIGV4dHJ1ZGU6ICAgICAgICBleHRydWRlXG4gICAgaG9sbG93OiAgICAgICAgIGhvbGxvd1xuICAgIGZsYXR0ZW46ICAgICAgICBmbGF0dGVuXG4gICAgemlya3VsYXJpemU6ICAgIHppcmt1bGFyaXplXG4gICAgY2Fub25pY2FsaXplOiAgIGNhbm9uaWNhbGl6ZVxuICAgIGNhbm9uaWNhbFhZWjogICBjYW5vbmljYWxYWVpcbiAgICAiXX0=
//# sourceURL=../../coffee/poly/topo.coffee