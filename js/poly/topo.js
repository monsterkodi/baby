// koffee 1.6.0

/*
000000000   0000000   00000000    0000000     
   000     000   000  000   000  000   000    
   000     000   000  00000000   000   000    
   000     000   000  000        000   000    
   000      0000000   000         0000000
 */
var Flag, Polyhedron, _, add, ambo, calcCentroid, canonicalXYZ, canonicalize, chamfer, copyVecArray, dual, extrude, flatten, gyro, hollow, inset, intersect, kis, klog, loft, mag, midName, midpoint, mult, oneThird, perspectiva, planarize, quinto, recenter, reciprocalC, reciprocalN, ref, ref1, ref2, reflect, sub, tangentify, trisub, tween, unit, whirl, zirkularize,
    indexOf = [].indexOf;

ref = require('kxk'), klog = ref.klog, _ = ref._;

ref1 = require('./math'), add = ref1.add, mult = ref1.mult, mag = ref1.mag, sub = ref1.sub, unit = ref1.unit, oneThird = ref1.oneThird, tween = ref1.tween, intersect = ref1.intersect, midpoint = ref1.midpoint, calcCentroid = ref1.calcCentroid, copyVecArray = ref1.copyVecArray;

ref2 = require('./geo'), tangentify = ref2.tangentify, reciprocalC = ref2.reciprocalC, reciprocalN = ref2.reciprocalN, recenter = ref2.recenter, planarize = ref2.planarize;

Flag = require('./flag');

Polyhedron = require('./polyhedron');

midName = function(v1, v2) {
    return v1 < v2 && (v1 + "_" + v2) || (v2 + "_" + v1);
};

zirkularize = function(poly) {
    return poly;
};

dual = function(poly) {
    var centers, dpoly, f, face, flag, i, k, l, len, len1, len2, m, o, q, r, ref3, ref4, ref5, ref6, ref7, s, sortF, t, v1, v2;
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
    for (i = r = 0, ref6 = poly.faces.length; 0 <= ref6 ? r < ref6 : r > ref6; i = 0 <= ref6 ? ++r : --r) {
        f = poly.faces[i];
        v1 = f[f.length - 1];
        for (s = 0, len1 = f.length; s < len1; s++) {
            v2 = f[s];
            flag.newFlag(v1, face[v2]["v" + v1], "" + i);
            v1 = v2;
        }
    }
    dpoly = flag.topoly();
    sortF = [];
    ref7 = dpoly.faces;
    for (t = 0, len2 = ref7.length; t < len2; t++) {
        f = ref7[t];
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
    klog("gyro of " + poly.name);
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

chamfer = function(poly, dist) {
    var f, facename, flag, i, l, len, m, normals, obj, ref3, ref4, v1, v1new, v2, v2new;
    klog("chamfer of " + poly.name);
    if (dist != null) {
        dist;
    } else {
        dist = 0.5;
    }
    flag = new Flag();
    normals = poly.normals();
    for (i = l = 0, ref3 = poly.faces.length; 0 <= ref3 ? l < ref3 : l > ref3; i = 0 <= ref3 ? ++l : --l) {
        f = poly.faces[i];
        v1 = f[f.length - 1];
        v1new = i + "_" + v1;
        for (m = 0, len = f.length; m < len; m++) {
            v2 = f[m];
            flag.newV(v2, mult(1.0 + dist, poly.vertices[v2]));
            v2new = i + "_" + v2;
            flag.newV(v2new, add(poly.vertices[v2], mult(dist * 1.5, normals[i])));
            flag.newFlag("orig" + i, v1new, v2new);
            facename = (ref4 = v1 < v2) != null ? ref4 : (
                obj = {},
                obj["hex" + v1 + "_" + v2] = "hex" + v2 + "_" + v1,
                obj
            );
            flag.newFlag(facename, v2, v2new);
            flag.newFlag(facename, v2new, v1new);
            flag.newFlag(facename, v1new, v1);
            v1 = v2;
            v1new = v2new;
        }
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
    var centers, f, flag, fname, foundAny, i, l, len, len1, m, normals, o, p, q, r, ref3, ref4, ref5, v, v1, v2;
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
    klog("inset of " + (n && (n + "-sided") || 'all') + " faces of " + poly.name);
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
        for (r = 0, len1 = f.length; r < len1; r++) {
            v = f[r];
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

extrude = function(poly, n) {
    var newpoly;
    newpoly = inset(poly, n, 0.0, 0.3);
    newpoly.name = "x" + n + poly.name;
    return newpoly;
};

loft = function(poly, n, alpha) {
    var newpoly;
    newpoly = inset(poly, n, alpha, 0.0);
    newpoly.name = "l" + n + poly.name;
    return newpoly;
};

hollow = function(poly, inset_dist, thickness) {
    var centers, dualnormals, f, flag, fname, i, l, len, len1, m, normals, o, p, q, r, ref3, ref4, ref5, v, v1, v2;
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
    klog("hollow " + poly.name);
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
        for (r = 0, len1 = f.length; r < len1; r++) {
            v = f[r];
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
    var EPSILON_CLOSE, f, faces, fn, i, i1, i2, i3, j, j1, k1, l, len, m, newVs, newpos, o, pos, q, r, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref3, ref4, ref5, ref6, ref7, ref8, ref9, s, t, u, uniqVs, uniqmap, v, v1, v2, v21, v3, v31, vmap, w, z;
    klog("trisub of " + poly.name);
    if (n != null) {
        n;
    } else {
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
                v = add(add(v1, mult(i * 1.0 / n, v21)), mult(j * 1.0 / n, v31));
                vmap["v" + fn + "-" + i + "-" + j] = pos++;
                newVs.push(v);
            }
        }
    }
    EPSILON_CLOSE = 1.0e-8;
    uniqVs = [];
    newpos = 0;
    uniqmap = {};
    ref8 = newVs.entries();
    for (r = 0, len = ref8.length; r < len; r++) {
        ref9 = ref8[r], i = ref9[0], v = ref9[1];
        if (indexOf.call(uniqmap, i) >= 0) {
            continue;
        }
        uniqmap[i] = newpos;
        uniqVs.push(v);
        for (j = s = ref10 = i + 1, ref11 = newVs.length; ref10 <= ref11 ? s < ref11 : s > ref11; j = ref10 <= ref11 ? ++s : --s) {
            w = newVs[j];
            if (mag(sub(v, w)) < EPSILON_CLOSE) {
                uniqmap[j] = newpos;
            }
        }
        newpos++;
    }
    faces = [];
    for (fn = t = 0, ref12 = poly.faces.length; 0 <= ref12 ? t < ref12 : t > ref12; fn = 0 <= ref12 ? ++t : --t) {
        for (i = u = 0, ref13 = n; 0 <= ref13 ? u < ref13 : u > ref13; i = 0 <= ref13 ? ++u : --u) {
            for (j = z = 0, ref14 = n - i; 0 <= ref14 ? z < ref14 : z > ref14; j = 0 <= ref14 ? ++z : --z) {
                faces.push([uniqmap[vmap["v" + fn + "-" + i + "-" + j]], uniqmap[vmap["v" + fn + "-" + (i + 1) + "-" + j]], uniqmap[vmap["v" + fn + "-" + i + "-" + (j + 1)]]]);
            }
        }
        for (i = j1 = 1, ref15 = n; 1 <= ref15 ? j1 < ref15 : j1 > ref15; i = 1 <= ref15 ? ++j1 : --j1) {
            for (j = k1 = 0, ref16 = n - i; 0 <= ref16 ? k1 < ref16 : k1 > ref16; j = 0 <= ref16 ? ++k1 : --k1) {
                faces.push([uniqmap[vmap["v" + fn + "-" + i + "-" + j]], uniqmap[vmap["v" + fn + "-" + i + "-" + (j + 1)]], uniqmap[vmap["v" + fn + "-" + (i - 1) + "-" + (j + 1)]]]);
            }
        }
    }
    return new Polyhedron("u" + n + poly.name, faces, uniqVs);
};

canonicalize = function(poly, Niter) {
    var edges, faces, i, l, maxChange, newVs, newpoly, oldVs, ref3;
    if (Niter != null) {
        Niter;
    } else {
        Niter = 1;
    }
    faces = poly.faces;
    edges = poly.edges();
    newVs = poly.vertices;
    maxChange = 1.0;
    for (i = l = 0, ref3 = Niter; 0 <= ref3 ? l <= ref3 : l >= ref3; i = 0 <= ref3 ? ++l : --l) {
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
    newpoly = new Polyhedron(poly.name, poly.faces, newVs);
    return newpoly;
};

canonicalXYZ = function(poly, nIterations) {
    var count, dpoly, l, ref3;
    if (nIterations != null) {
        nIterations;
    } else {
        nIterations = 1;
    }
    dpoly = dual(poly);
    for (count = l = 0, ref3 = nIterations; 0 <= ref3 ? l < ref3 : l > ref3; count = 0 <= ref3 ? ++l : --l) {
        dpoly.vertices = reciprocalN(poly);
        poly.vertices = reciprocalN(dpoly);
    }
    return new Polyhedron(poly.name, poly.faces, poly.vertices);
};

flatten = function(poly, nIterations) {
    var count, dpoly, l, ref3;
    if (nIterations != null) {
        nIterations;
    } else {
        nIterations = 1;
    }
    dpoly = dual(poly);
    for (count = l = 0, ref3 = nIterations; 0 <= ref3 ? l < ref3 : l > ref3; count = 0 <= ref3 ? ++l : --l) {
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
    loft: loft,
    hollow: hollow,
    flatten: flatten,
    zirkularize: zirkularize,
    canonicalize: canonicalize,
    canonicalXYZ: canonicalXYZ
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9wby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsd1dBQUE7SUFBQTs7QUF3QkEsTUFBYyxPQUFBLENBQVEsS0FBUixDQUFkLEVBQUUsZUFBRixFQUFROztBQUNSLE9BQWtHLE9BQUEsQ0FBUSxRQUFSLENBQWxHLEVBQUUsY0FBRixFQUFPLGdCQUFQLEVBQWEsY0FBYixFQUFrQixjQUFsQixFQUF1QixnQkFBdkIsRUFBNkIsd0JBQTdCLEVBQXVDLGtCQUF2QyxFQUE4QywwQkFBOUMsRUFBeUQsd0JBQXpELEVBQW1FLGdDQUFuRSxFQUFpRjs7QUFDakYsT0FBZ0UsT0FBQSxDQUFRLE9BQVIsQ0FBaEUsRUFBRSw0QkFBRixFQUFjLDhCQUFkLEVBQTJCLDhCQUEzQixFQUF3Qyx3QkFBeEMsRUFBa0Q7O0FBRWxELElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7QUFDUCxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0FBRWIsT0FBQSxHQUFVLFNBQUMsRUFBRCxFQUFLLEVBQUw7V0FBWSxFQUFBLEdBQUcsRUFBSCxJQUFVLENBQUcsRUFBRCxHQUFJLEdBQUosR0FBTyxFQUFULENBQVYsSUFBMkIsQ0FBRyxFQUFELEdBQUksR0FBSixHQUFPLEVBQVQ7QUFBdkM7O0FBRVYsV0FBQSxHQUFjLFNBQUMsSUFBRDtXQUVWO0FBRlU7O0FBVWQsSUFBQSxHQUFPLFNBQUMsSUFBRDtBQUlILFFBQUE7SUFBQSxJQUFBLEdBQU8sSUFBSSxJQUFKLENBQUE7SUFFUCxJQUFBLEdBQU87QUFDUCxTQUFTLGtHQUFUO1FBQ0ksSUFBSyxDQUFBLENBQUEsQ0FBTCxHQUFVO0FBRGQ7QUFHQSxTQUFTLCtGQUFUO1FBQ0ksQ0FBQSxHQUFJLElBQUksQ0FBQyxLQUFNLENBQUEsQ0FBQTtRQUNmLEVBQUEsR0FBSyxDQUFFLENBQUEsQ0FBQyxDQUFDLE1BQUYsR0FBUyxDQUFUO0FBQ1AsYUFBQSxt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QUFBLGNBQWU7O0lBQ2YsS0FBQSxHQUFRLElBQUEsQ0FBSyxJQUFMO0FBR1IsU0FBYSxpR0FBYjtRQUNJLEtBQUssQ0FBQyxRQUFOLEdBQWlCLFdBQUEsQ0FBWSxJQUFaO1FBQ2pCLElBQUksQ0FBQyxRQUFMLEdBQWlCLFdBQUEsQ0FBWSxLQUFaO0FBRnJCO1dBSUEsSUFBSSxVQUFKLENBQWUsSUFBSSxDQUFDLElBQXBCLEVBQTBCLElBQUksQ0FBQyxLQUEvQixFQUFzQyxJQUFJLENBQUMsUUFBM0M7QUFWTTs7QUFrQlYsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLElBQUEsRUFBZ0IsSUFBaEI7SUFDQSxNQUFBLEVBQWdCLE1BRGhCO0lBRUEsV0FBQSxFQUFnQixXQUZoQjtJQUdBLEdBQUEsRUFBZ0IsR0FIaEI7SUFJQSxJQUFBLEVBQWdCLElBSmhCO0lBS0EsSUFBQSxFQUFnQixJQUxoQjtJQU1BLE9BQUEsRUFBZ0IsT0FOaEI7SUFPQSxPQUFBLEVBQWdCLE9BUGhCO0lBUUEsS0FBQSxFQUFnQixLQVJoQjtJQVNBLE1BQUEsRUFBZ0IsTUFUaEI7SUFVQSxLQUFBLEVBQWdCLEtBVmhCO0lBV0EsT0FBQSxFQUFnQixPQVhoQjtJQVlBLElBQUEsRUFBZ0IsSUFaaEI7SUFhQSxNQUFBLEVBQWdCLE1BYmhCO0lBY0EsT0FBQSxFQUFnQixPQWRoQjtJQWVBLFdBQUEsRUFBZ0IsV0FmaEI7SUFnQkEsWUFBQSxFQUFnQixZQWhCaEI7SUFpQkEsWUFBQSxFQUFnQixZQWpCaEIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgICBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgICBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgICBcbiAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAwMDAwMDAwICAgICBcbiMjI1xuI1xuIyBQb2x5aMOpZHJvbmlzbWUsIENvcHlyaWdodCAyMDE5LCBBbnNlbG0gTGV2c2theWEsIE1JVCBMaWNlbnNlXG4jXG4jIFBvbHloZWRyb24gT3BlcmF0b3JzXG4jXG4jIGZvciBlYWNoIHZlcnRleCBvZiBuZXcgcG9seWhlZHJvblxuIyAgICAgY2FsbCBuZXdWKFZuYW1lLCB4eXopIHdpdGggYSBzeW1ib2xpYyBuYW1lIGFuZCBjb29yZGluYXRlc1xuI1xuIyBmb3IgZWFjaCBmbGFnIG9mIG5ldyBwb2x5aGVkcm9uXG4jICAgICBjYWxsIG5ld0ZsYWcoRm5hbWUsIFZuYW1lMSwgVm5hbWUyKSB3aXRoIGEgc3ltYm9saWMgbmFtZSBmb3IgdGhlIG5ldyBmYWNlXG4jICAgICBhbmQgdGhlIHN5bWJvbGljIG5hbWUgZm9yIHR3byB2ZXJ0aWNlcyBmb3JtaW5nIGFuIG9yaWVudGVkIGVkZ2VcbiNcbiMgT3JpZW50YXRpb24gbXVzdCBiZSBkZWFsdCB3aXRoIHByb3Blcmx5IHRvIG1ha2UgYSBtYW5pZm9sZCBtZXNoXG4jIFNwZWNpZmljYWxseSwgbm8gZWRnZSB2MS0+djIgY2FuIGV2ZXIgYmUgY3Jvc3NlZCBpbiB0aGUgc2FtZSBkaXJlY3Rpb24gYnkgdHdvIGRpZmZlcmVudCBmYWNlc1xuIyBjYWxsIHRvcG9seSgpIHRvIGFzc2VtYmxlIGZsYWdzIGludG8gcG9seWhlZHJvbiBzdHJ1Y3R1cmUgYnkgZm9sbG93aW5nIHRoZSBvcmJpdHNcbiMgb2YgdGhlIHZlcnRleCBtYXBwaW5nIHN0b3JlZCBpbiB0aGUgZmxhZ3NldCBmb3IgZWFjaCBuZXcgZmFjZVxuXG57IGtsb2csIF8gfSA9IHJlcXVpcmUgJ2t4aydcbnsgYWRkLCBtdWx0LCBtYWcsIHN1YiwgdW5pdCwgb25lVGhpcmQsIHR3ZWVuLCBpbnRlcnNlY3QsIG1pZHBvaW50LCBjYWxjQ2VudHJvaWQsIGNvcHlWZWNBcnJheSB9ID0gcmVxdWlyZSAnLi9tYXRoJ1xueyB0YW5nZW50aWZ5LCByZWNpcHJvY2FsQywgcmVjaXByb2NhbE4sIHJlY2VudGVyLCBwbGFuYXJpemUgfSA9IHJlcXVpcmUgJy4vZ2VvJ1xuXG5GbGFnID0gcmVxdWlyZSAnLi9mbGFnJ1xuUG9seWhlZHJvbiA9IHJlcXVpcmUgJy4vcG9seWhlZHJvbidcblxubWlkTmFtZSA9ICh2MSwgdjIpIC0+IHYxPHYyIGFuZCBcIiN7djF9XyN7djJ9XCIgb3IgXCIje3YyfV8je3YxfVwiICMgdW5pcXVlIG5hbWVzIG9mIG1pZHBvaW50c1xuXG56aXJrdWxhcml6ZSA9IChwb2x5KSAtPlxuICAgIFxuICAgIHBvbHlcblxuIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG5cbmR1YWwgPSAocG9seSkgLT5cblxuICAgICMga2xvZyBcImR1YWwgI3twb2x5Lm5hbWV9XCIgXG4gIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZhY2UgPSBbXSBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXSBcbiAgICAgICAgZmFjZVtpXSA9IHt9XG5cbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IGZbZi5sZW5ndGgtMV0gIyBsYXN0IHZlcnRleFxuICAgICAgICBmb3IgdjIgaW4gZiAjIGFzc3VtZXMgdGhhdCBubyAyIGZhY2VzIHNoYXJlIGFuIGVkZ2UgaW4gdGhlIHNhbWUgb3JpZW50YXRpb24hXG4gICAgICAgICAgICBmYWNlW3YxXVtcInYje3YyfVwiXSA9IFwiI3tpfVwiXG4gICAgICAgICAgICB2MSA9IHYyICMgY3VycmVudCBiZWNvbWVzIHByZXZpb3VzXG4gIFxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGZsYWcubmV3ViBcIiN7aX1cIiBjZW50ZXJzW2ldXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gZltmLmxlbmd0aC0xXSAjcHJldmlvdXMgdmVydGV4XG4gICAgICAgIGZvciB2MiBpbiBmXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgdjEsIGZhY2VbdjJdW1widiN7djF9XCJdLCBcIiN7aX1cIlxuICAgICAgICAgICAgdjE9djIgIyBjdXJyZW50IGJlY29tZXMgcHJldmlvdXNcbiAgXG4gICAgZHBvbHkgPSBmbGFnLnRvcG9seSgpICMgYnVpbGQgdG9wb2xvZ2ljYWwgZHVhbCBmcm9tIGZsYWdzXG4gIFxuICAgICMgbWF0Y2ggRiBpbmRleCBvcmRlcmluZyB0byBWIGluZGV4IG9yZGVyaW5nIG9uIGR1YWxcbiAgICBzb3J0RiA9IFtdXG4gICAgZm9yIGYgaW4gZHBvbHkuZmFjZXNcbiAgICAgICAgayA9IGludGVyc2VjdCBwb2x5LmZhY2VzW2ZbMF1dLCBwb2x5LmZhY2VzW2ZbMV1dLCBwb2x5LmZhY2VzW2ZbMl1dXG4gICAgICAgIHNvcnRGW2tdID0gZlxuICAgIGRwb2x5LmZhY2VzID0gc29ydEZcbiAgXG4gICAgaWYgcG9seS5uYW1lWzBdICE9IFwiZFwiXG4gICAgICAgIGRwb2x5Lm5hbWUgPSBcImQje3BvbHkubmFtZX1cIlxuICAgIGVsc2UgXG4gICAgICAgIGRwb2x5Lm5hbWUgPSBwb2x5Lm5hbWUuc2xpY2UgMVxuICBcbiAgICBkcG9seVxuXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG4jIEtpcyAoYWJicmV2aWF0ZWQgZnJvbSB0cmlha2lzKSB0cmFuc2Zvcm1zIGFuIE4tc2lkZWQgZmFjZSBpbnRvIGFuIE4tcHlyYW1pZCByb290ZWQgYXQgdGhlXG4jIHNhbWUgYmFzZSB2ZXJ0aWNlcy4gb25seSBraXMgbi1zaWRlZCBmYWNlcywgYnV0IG49PTAgbWVhbnMga2lzIGFsbC5cblxua2lzID0gKHBvbHksIG4sIGFwZXhkaXN0KSAtPlxuXG4gICAgbiA/PSAwXG4gICAgYXBleGRpc3QgPz0gMFxuXG4gICAgIyBrbG9nIFwia2lzIG9mICN7biBhbmQgXCIje259LXNpZGVkIGZhY2VzIG9mIFwiIG9yICcnfSN7cG9seS5uYW1lfVwiXG5cbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgIHAgPSBwb2x5LnZlcnRpY2VzW2ldICMgZWFjaCBvbGQgdmVydGV4IGlzIGEgbmV3IHZlcnRleFxuICAgICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHBcbiAgXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm91bmRBbnkgPSBmYWxzZVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gXCJ2I3tmW2YubGVuZ3RoLTFdfVwiXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIHYyID0gXCJ2I3t2fVwiXG4gICAgICAgICAgICBpZiBmLmxlbmd0aCA9PSBuIG9yIG4gPT0gMFxuICAgICAgICAgICAgICAgIGZvdW5kQW55ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBhcGV4ID0gXCJhcGV4I3tpfVwiXG4gICAgICAgICAgICAgICAgZm5hbWUgPSBcIiN7aX0je3YxfVwiXG4gICAgICAgICAgICAgICAgIyBuZXcgdmVydGljZXMgaW4gY2VudGVycyBvZiBuLXNpZGVkIGZhY2VcbiAgICAgICAgICAgICAgICBmbGFnLm5ld1YgYXBleCwgYWRkIGNlbnRlcnNbaV0sIG11bHQgYXBleGRpc3QsIG5vcm1hbHNbaV1cbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsICAgdjEsICAgdjIgIyB0aGUgb2xkIGVkZ2Ugb2Ygb3JpZ2luYWwgZmFjZVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgICB2MiwgYXBleCAjIHVwIHRvIGFwZXggb2YgcHlyYW1pZFxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgYXBleCwgICB2MSAjIGFuZCBiYWNrIGRvd24gYWdhaW5cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCIje2l9XCIsIHYxLCB2MiAgIyBzYW1lIG9sZCBmbGFnLCBpZiBub24tblxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2MSA9IHYyICMgY3VycmVudCBiZWNvbWVzIHByZXZpb3VzXG4gIFxuICAgIGlmIG5vdCBmb3VuZEFueVxuICAgICAgICBrbG9nIFwiTm8gI3tufS1mb2xkIGNvbXBvbmVudHMgd2VyZSBmb3VuZC5cIlxuICBcbiAgICBmbGFnLnRvcG9seSBcImsje259I3twb2x5Lm5hbWV9XCJcblxuIyAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuXG4jIFRoZSBiZXN0IHdheSB0byB0aGluayBvZiB0aGUgYW1ibyBvcGVyYXRvciBpcyBhcyBhIHRvcG9sb2dpY2FsIFwidHdlZW5cIiBiZXR3ZWVuIGEgcG9seWhlZHJvblxuIyBhbmQgaXRzIGR1YWwgcG9seWhlZHJvbi4gIFRodXMgdGhlIGFtYm8gb2YgYSBkdWFsIHBvbHloZWRyb24gaXMgdGhlIHNhbWUgYXMgdGhlIGFtYm8gb2YgdGhlXG4jIG9yaWdpbmFsLiBBbHNvIGNhbGxlZCBcIlJlY3RpZnlcIi5cblxuYW1ibyA9IChwb2x5KSAtPlxuICAgIFxuICAgICMga2xvZyBcImFtYm8gb2YgI3twb2x5Lm5hbWV9XCJcbiAgICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICAjIEZvciBlYWNoIGZhY2UgZiBpbiB0aGUgb3JpZ2luYWwgcG9seVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSgtMilcbiAgICAgICAgZm9yIHYzIGluIGZcbiAgICAgICAgICAgIGlmIHYxIDwgdjIgIyB2ZXJ0aWNlcyBhcmUgdGhlIG1pZHBvaW50cyBvZiBhbGwgZWRnZXMgb2Ygb3JpZ2luYWwgcG9seVxuICAgICAgICAgICAgICAgIGZsYWcubmV3ViBtaWROYW1lKHYxLHYyKSwgbWlkcG9pbnQgcG9seS52ZXJ0aWNlc1t2MV0sIHBvbHkudmVydGljZXNbdjJdXG4gICAgICAgICAgICAjIGZhY2UgY29ycmVzcG9uZHMgdG8gdGhlIG9yaWdpbmFsIGZcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcIm9yaWcje2l9XCIgIG1pZE5hbWUodjEsdjIpLCBtaWROYW1lKHYyLHYzKVxuICAgICAgICAgICAgIyBmYWNlIGNvcnJlc3BvbmRzIHRvICh0aGUgdHJ1bmNhdGVkKSB2MlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiZHVhbCN7djJ9XCIgbWlkTmFtZSh2Mix2MyksIG1pZE5hbWUodjEsdjIpXG4gICAgICAgICAgICAjIHNoaWZ0IG92ZXIgb25lXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiYSN7cG9seS5uYW1lfVwiXG5cbiMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAwICAgIDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcblxuZ3lybyA9IChwb2x5KSAtPlxuXG4gICAga2xvZyBcImd5cm8gb2YgI3twb2x5Lm5hbWV9XCJcbiAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgZmxhZy5uZXdWIFwidiN7aX1cIiB1bml0IHBvbHkudmVydGljZXNbaV0gIyBlYWNoIG9sZCB2ZXJ0ZXggaXMgYSBuZXcgdmVydGV4XG5cbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKCkgIyBuZXcgdmVydGljZXMgaW4gY2VudGVyIG9mIGVhY2ggZmFjZVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIGZsYWcubmV3ViBcImNlbnRlciN7aX1cIiB1bml0IGNlbnRlcnNbaV1cbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlKC0yKVxuICAgICAgICBmb3IgaiBpbiBbMC4uLmYubGVuZ3RoXVxuICAgICAgICAgICAgdiA9IGZbal1cbiAgICAgICAgICAgIHYzID0gdlxuICAgICAgICAgICAgZmxhZy5uZXdWKHYxK1wiflwiK3YyLCBvbmVUaGlyZChwb2x5LnZlcnRpY2VzW3YxXSxwb2x5LnZlcnRpY2VzW3YyXSkpOyAgIyBuZXcgdiBpbiBmYWNlXG4gICAgICAgICAgICBmbmFtZSA9IGkrXCJmXCIrdjFcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgXCJjZW50ZXIje2l9XCIgIHYxK1wiflwiK3YyICMgZml2ZSBuZXcgZmxhZ3NcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgdjErXCJ+XCIrdjIsICB2MitcIn5cIit2MVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCB2MitcIn5cIit2MSwgIFwidiN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgXCJ2I3t2Mn1cIiAgICAgdjIrXCJ+XCIrdjNcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgdjIrXCJ+XCIrdjMsICBcImNlbnRlciN7aX1cIlxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXSAjIHNoaWZ0IG92ZXIgb25lXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiZyN7cG9seS5uYW1lfVwiXG5cbiMgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICBcblxucmVmbGVjdCA9IChwb2x5KSAtPiAjIGdlb21ldHJpYyByZWZsZWN0aW9uIHRocm91Z2ggb3JpZ2luXG5cbiAgICBrbG9nIFwicmVmbGVjdGlvbiBvZiAje3BvbHkubmFtZX1cIlxuICAgICMgcmVmbGVjdCBlYWNoIHBvaW50IHRocm91Z2ggb3JpZ2luXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgcG9seS52ZXJ0aWNlc1tpXSA9IG11bHQgLTEsIHBvbHkudmVydGljZXNbaV1cbiAgICAjIHJlcGFpciBjbG9ja3dpc2UtbmVzcyBvZiBmYWNlc1xuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIHBvbHkuZmFjZXNbaV0gPSBwb2x5LmZhY2VzW2ldLnJldmVyc2UoKVxuICAgIHBvbHkubmFtZSA9IFwiciN7cG9seS5uYW1lfVwiXG4gICAgcG9seVxuXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbiMgQSB0cnVuY2F0aW9uIGFsb25nIGEgcG9seWhlZHJvbidzIGVkZ2VzLlxuIyBDaGFtZmVyaW5nIG9yIGVkZ2UtdHJ1bmNhdGlvbiBpcyBzaW1pbGFyIHRvIGV4cGFuc2lvbiwgbW92aW5nIGZhY2VzIGFwYXJ0IGFuZCBvdXR3YXJkLFxuIyBidXQgYWxzbyBtYWludGFpbnMgdGhlIG9yaWdpbmFsIHZlcnRpY2VzLiBBZGRzIGEgbmV3IGhleGFnb25hbCBmYWNlIGluIHBsYWNlIG9mIGVhY2hcbiMgb3JpZ2luYWwgZWRnZS5cbiMgQSBwb2x5aGVkcm9uIHdpdGggZSBlZGdlcyB3aWxsIGhhdmUgYSBjaGFtZmVyZWQgZm9ybSBjb250YWluaW5nIDJlIG5ldyB2ZXJ0aWNlcyxcbiMgM2UgbmV3IGVkZ2VzLCBhbmQgZSBuZXcgaGV4YWdvbmFsIGZhY2VzLiAtLSBXaWtpcGVkaWFcbiMgU2VlIGFsc28gaHR0cDojZG1jY29vZXkuY29tL3BvbHloZWRyYS9DaGFtZmVyLmh0bWxcbiNcbiMgVGhlIGRpc3QgcGFyYW1ldGVyIGNvdWxkIGNvbnRyb2wgaG93IGRlZXBseSB0byBjaGFtZmVyLlxuIyBCdXQgSSdtIG5vdCBzdXJlIGFib3V0IGltcGxlbWVudGluZyB0aGF0IHlldC5cbiNcbiMgUTogd2hhdCBpcyB0aGUgZHVhbCBvcGVyYXRpb24gb2YgY2hhbWZlcmluZz8gSS5lLlxuIyBpZiBjWCA9IGR4ZFgsIGFuZCB4WCA9IGRjZFgsIHdoYXQgb3BlcmF0aW9uIGlzIHg/XG5cbiMgV2UgY291bGQgXCJhbG1vc3RcIiBkbyB0aGlzIGluIHRlcm1zIG9mIGFscmVhZHktaW1wbGVtZW50ZWQgb3BlcmF0aW9uczpcbiMgY0MgPSB0NGRhQyA9IHQ0akMsIGNPID0gdDNkYU8sIGNEID0gdDVkYUQsIGNJID0gdDNkYUlcbiMgQnV0IGl0IGRvZXNuJ3Qgd29yayBmb3IgY2FzZXMgbGlrZSBULlxuXG5jaGFtZmVyID0gKHBvbHksIGRpc3QpIC0+XG4gICAga2xvZyBcImNoYW1mZXIgb2YgI3twb2x5Lm5hbWV9XCJcbiAgXG4gICAgZGlzdCA/PSAwLjVcbiAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gIFxuICAgICMgRm9yIGVhY2ggZmFjZSBmIGluIHRoZSBvcmlnaW5hbCBwb2x5XG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgdjEgPSBmW2YubGVuZ3RoLTFdXG4gICAgICAgIHYxbmV3ID0gaSArIFwiX1wiICsgdjFcbiAgICBcbiAgICAgICAgZm9yIHYyIGluIGZcbiAgICAgICAgICAjIFRPRE86IGZpZ3VyZSBvdXQgd2hhdCBkaXN0YW5jZXMgd2lsbCBnaXZlIHVzIGEgcGxhbmFyIGhleCBmYWNlLlxuICAgICAgICAgICMgTW92ZSBlYWNoIG9sZCB2ZXJ0ZXggZnVydGhlciBmcm9tIHRoZSBvcmlnaW4uXG4gICAgICAgICAgZmxhZy5uZXdWKHYyLCBtdWx0KDEuMCArIGRpc3QsIHBvbHkudmVydGljZXNbdjJdKSlcbiAgICAgICAgICAjIEFkZCBhIG5ldyB2ZXJ0ZXgsIG1vdmVkIHBhcmFsbGVsIHRvIG5vcm1hbC5cbiAgICAgICAgICB2Mm5ldyA9IGkgKyBcIl9cIiArIHYyXG4gICAgICAgICAgZmxhZy5uZXdWKHYybmV3LCBhZGQocG9seS52ZXJ0aWNlc1t2Ml0sIG11bHQoZGlzdCoxLjUsIG5vcm1hbHNbaV0pKSlcbiAgICAgICAgICAjIEZvdXIgbmV3IGZsYWdzOlxuICAgICAgICAgICMgT25lIHdob3NlIGZhY2UgY29ycmVzcG9uZHMgdG8gdGhlIG9yaWdpbmFsIGZhY2U6XG4gICAgICAgICAgZmxhZy5uZXdGbGFnKFwib3JpZyN7aX1cIiwgdjFuZXcsIHYybmV3KVxuICAgICAgICAgICMgQW5kIHRocmVlIGZvciB0aGUgZWRnZXMgb2YgdGhlIG5ldyBoZXhhZ29uOlxuICAgICAgICAgIGZhY2VuYW1lID0gKHYxPHYyID8gXCJoZXgje3YxfV8je3YyfVwiIDogXCJoZXgje3YyfV8je3YxfVwiKVxuICAgICAgICAgIGZsYWcubmV3RmxhZyhmYWNlbmFtZSwgdjIsIHYybmV3KVxuICAgICAgICAgIGZsYWcubmV3RmxhZyhmYWNlbmFtZSwgdjJuZXcsIHYxbmV3KVxuICAgICAgICAgIGZsYWcubmV3RmxhZyhmYWNlbmFtZSwgdjFuZXcsIHYxKVxuICAgICAgICAgIHYxID0gdjI7XG4gICAgICAgICAgdjFuZXcgPSB2Mm5ld1xuXG4gICAgZmxhZy50b3BvbHkgXCJjI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuXG4jIEd5cm8gZm9sbG93ZWQgYnkgdHJ1bmNhdGlvbiBvZiB2ZXJ0aWNlcyBjZW50ZXJlZCBvbiBvcmlnaW5hbCBmYWNlcy5cbiMgVGhpcyBjcmVhdGUgMiBuZXcgaGV4YWdvbnMgZm9yIGV2ZXJ5IG9yaWdpbmFsIGVkZ2UuXG4jIChodHRwczojZW4ud2lraXBlZGlhLm9yZy93aWtpL0NvbndheV9wb2x5aGVkcm9uX25vdGF0aW9uI09wZXJhdGlvbnNfb25fcG9seWhlZHJhKVxuI1xuIyBQb3NzaWJsZSBleHRlbnNpb246IHRha2UgYSBwYXJhbWV0ZXIgbiB0aGF0IG1lYW5zIG9ubHkgd2hpcmwgbi1zaWRlZCBmYWNlcy5cbiMgSWYgd2UgZG8gdGhhdCwgdGhlIGZsYWdzIG1hcmtlZCAjKiBiZWxvdyB3aWxsIG5lZWQgdG8gaGF2ZSB0aGVpciBvdGhlciBzaWRlc1xuIyBmaWxsZWQgaW4gb25lIHdheSBvciBhbm90aGVyLCBkZXBlbmRpbmcgb24gd2hldGhlciB0aGUgYWRqYWNlbnQgZmFjZSBpc1xuIyB3aGlybGVkIG9yIG5vdC5cblxud2hpcmwgPSAocG9seSwgbikgLT5cblxuICAgIGtsb2cgXCJ3aGlybCBvZiAje3BvbHkubmFtZX1cIlxuICAgIG4gPz0gMFxuICAgIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgICMgZWFjaCBvbGQgdmVydGV4IGlzIGEgbmV3IHZlcnRleFxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgIGZsYWcubmV3ViBcInYje2l9XCIgdW5pdCBwb2x5LnZlcnRpY2VzW2ldXG5cbiAgICAjIG5ldyB2ZXJ0aWNlcyBhcm91bmQgY2VudGVyIG9mIGVhY2ggZmFjZVxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UoLTIpXG4gICAgICAgIGZvciBqIGluIFswLi4uZi5sZW5ndGhdXG4gICAgICAgICAgICB2ID0gZltqXVxuICAgICAgICAgICAgdjMgPSB2XG4gICAgICAgICAgICAjIE5ldyB2ZXJ0ZXggYWxvbmcgZWRnZVxuICAgICAgICAgICAgdjFfMiA9IG9uZVRoaXJkKHBvbHkudmVydGljZXNbdjFdLHBvbHkudmVydGljZXNbdjJdKVxuICAgICAgICAgICAgZmxhZy5uZXdWKHYxK1wiflwiK3YyLCB2MV8yKVxuICAgICAgICAgICAgIyBOZXcgdmVydGljZXMgbmVhciBjZW50ZXIgb2YgZmFjZVxuICAgICAgICAgICAgY3YxbmFtZSA9IFwiY2VudGVyI3tpfX4je3YxfVwiXG4gICAgICAgICAgICBjdjJuYW1lID0gXCJjZW50ZXIje2l9fiN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcubmV3VihjdjFuYW1lLCB1bml0KG9uZVRoaXJkKGNlbnRlcnNbaV0sIHYxXzIpKSlcbiAgICAgICAgICAgIGZuYW1lID0gaStcImZcIit2MVxuICAgICAgICAgICAgIyBOZXcgaGV4YWdvbiBmb3IgZWFjaCBvcmlnaW5hbCBlZGdlXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsIGN2MW5hbWUsICAgdjErXCJ+XCIrdjIpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsIHYxK1wiflwiK3YyLCB2MitcIn5cIit2MSkgIypcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgdjIrXCJ+XCIrdjEsIFwidiN7djJ9XCIpICAjKlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCBcInYje3YyfVwiLCAgdjIrXCJ+XCIrdjMpICMqXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsIHYyK1wiflwiK3YzLCBjdjJuYW1lKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCBjdjJuYW1lLCAgIGN2MW5hbWUpXG4gICAgICAgICAgICAjIE5ldyBmYWNlIGluIGNlbnRlciBvZiBlYWNoIG9sZCBmYWNlICAgICAgXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoXCJjI3tpfVwiLCBjdjFuYW1lLCBjdjJuYW1lKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdICMgc2hpZnQgb3ZlciBvbmVcbiAgXG4gICAgZmxhZy50b3BvbHkgXCJ3I3twb2x5Lm5hbWV9XCJcblxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAwMCAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuIyAwMDAgMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiMgIDAwMDAwIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgXG5cbnF1aW50byA9IChwb2x5KSAtPiAjIGNyZWF0ZXMgYSBwZW50YWdvbiBmb3IgZXZlcnkgcG9pbnQgaW4gdGhlIG9yaWdpbmFsIGZhY2UsIGFzIHdlbGwgYXMgb25lIG5ldyBpbnNldCBmYWNlLlxuICAgIFxuICAgICMga2xvZyBcInF1aW50byBvZiAje3BvbHkubmFtZX1cIlxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgICMgRm9yIGVhY2ggZmFjZSBmIGluIHRoZSBvcmlnaW5hbCBwb2x5XG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgY2VudHJvaWQgPSBjYWxjQ2VudHJvaWQgZi5tYXAgKGlkeCkgLT4gcG9seS52ZXJ0aWNlc1tpZHhdXG4gICAgICAgICMgd2FsayBvdmVyIGZhY2UgdmVydGV4LXRyaXBsZXRzXG4gICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSAtMlxuICAgICAgICBmb3IgdjMgaW4gZlxuICAgICAgICAgICAgIyBmb3IgZWFjaCBmYWNlLWNvcm5lciwgd2UgbWFrZSB0d28gbmV3IHBvaW50czpcbiAgICAgICAgICAgIG1pZHB0ID0gbWlkcG9pbnQgcG9seS52ZXJ0aWNlc1t2MV0sIHBvbHkudmVydGljZXNbdjJdXG4gICAgICAgICAgICBpbm5lcnB0ID0gbWlkcG9pbnQgbWlkcHQsIGNlbnRyb2lkXG4gICAgICAgICAgICBmbGFnLm5ld1YgbWlkTmFtZSh2MSx2MiksIG1pZHB0XG4gICAgICAgICAgICBmbGFnLm5ld1YgXCJpbm5lcl8je2l9X1wiICsgbWlkTmFtZSh2MSx2MiksIGlubmVycHRcbiAgICAgICAgICAgICMgYW5kIGFkZCB0aGUgb2xkIGNvcm5lci12ZXJ0ZXhcbiAgICAgICAgICAgIGZsYWcubmV3ViBcIiN7djJ9XCIgcG9seS52ZXJ0aWNlc1t2Ml1cbiAgICAgICAgICBcbiAgICAgICAgICAgICMgcGVudGFnb24gZm9yIGVhY2ggdmVydGV4IGluIG9yaWdpbmFsIGZhY2VcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImYje2l9XyN7djJ9XCIsIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYxLCB2MiksIG1pZE5hbWUodjEsIHYyKSlcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImYje2l9XyN7djJ9XCIsIG1pZE5hbWUodjEsIHYyKSwgXCIje3YyfVwiKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKFwiZiN7aX1fI3t2Mn1cIiwgXCIje3YyfVwiLCBtaWROYW1lKHYyLCB2MykpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoXCJmI3tpfV8je3YyfVwiLCBtaWROYW1lKHYyLCB2MyksIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYyLCB2MykpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoXCJmI3tpfV8je3YyfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpKVxuICAgICAgXG4gICAgICAgICAgICAjIGlubmVyIHJvdGF0ZWQgZmFjZSBvZiBzYW1lIHZlcnRleC1udW1iZXIgYXMgb3JpZ2luYWxcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImZfaW5fI3tpfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpKVxuICAgICAgXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdICMgc2hpZnQgb3ZlciBvbmVcbiAgXG4gICAgZmxhZy50b3BvbHkgXCJxI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDBcbiMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgXG4jIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgIFxuIyAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgMDAwICAgXG5cbmluc2V0ID0gKHBvbHksIG4sIGluc2V0X2Rpc3QsIHBvcG91dF9kaXN0KSAtPlxuXG4gICAgbiA/PSAwXG4gICAgaW5zZXRfZGlzdCA/PSAwLjVcbiAgICBwb3BvdXRfZGlzdCA/PSAtMC4yXG4gIFxuICAgIGtsb2cgXCJpbnNldCBvZiAje24gYW5kIFwiI3tufS1zaWRlZFwiIG9yICdhbGwnfSBmYWNlcyBvZiAje3BvbHkubmFtZX1cIlxuICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgICMgZWFjaCBvbGQgdmVydGV4IGlzIGEgbmV3IHZlcnRleFxuICAgICAgICBwID0gcG9seS52ZXJ0aWNlc1tpXVxuICAgICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHBcblxuICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdICMgbmV3IGluc2V0IHZlcnRleCBmb3IgZXZlcnkgdmVydCBpbiBmYWNlXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdWIFwiZiN7aX12I3t2fVwiIGFkZCB0d2Vlbihwb2x5LnZlcnRpY2VzW3ZdLGNlbnRlcnNbaV0saW5zZXRfZGlzdCksIG11bHQocG9wb3V0X2Rpc3Qsbm9ybWFsc1tpXSlcbiAgXG4gICAgZm91bmRBbnkgPSBmYWxzZSAjIGFsZXJ0IGlmIGRvbid0IGZpbmQgYW55XG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgdjIgPSBcInYje3Z9XCI7XG4gICAgICAgICAgICBpZiBmLmxlbmd0aCA9PSBuIG9yIG4gPT0gMFxuICAgICAgICAgICAgICAgIGZvdW5kQW55ID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGZuYW1lID0gaSArIHYxXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCAgICAgIHYxLCAgICAgICB2MilcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsICAgICAgdjIsICAgICAgIFwiZiN7aX0je3YyfVwiKVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgXCJmI3tpfSN7djJ9XCIsICBcImYje2l9I3t2MX1cIilcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsIFwiZiN7aX0je3YxfVwiLCAgdjEpXG4gICAgICAgICAgICAgICAgIyBuZXcgaW5zZXQsIGV4dHJ1ZGVkIGZhY2VcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcoXCJleCN7aX1cIiwgXCJmI3tpfSN7djF9XCIsICBcImYje2l9I3t2Mn1cIilcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcoaSwgdjEsIHYyKSAgIyBzYW1lIG9sZCBmbGFnLCBpZiBub24tblxuICAgICAgICAgICAgdjE9djIgIyBjdXJyZW50IGJlY29tZXMgcHJldmlvdXNcbiAgXG4gICAgaWYgbm90IGZvdW5kQW55XG4gICAgICAgIGtsb2cgXCJObyAje259LWZvbGQgY29tcG9uZW50cyB3ZXJlIGZvdW5kLlwiXG4gIFxuICAgIGZsYWcudG9wb2x5IFwibiN7bn0je3BvbHkubmFtZX1cIlxuXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMFxuXG5leHRydWRlID0gKHBvbHksIG4pIC0+XG4gICAgbmV3cG9seSA9IGluc2V0IHBvbHksIG4sIDAuMCwgMC4zXG4gICAgbmV3cG9seS5uYW1lID0gXCJ4I3tufSN7cG9seS5uYW1lfVwiXG4gICAgbmV3cG9seVxuXG4jIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwICAgICAgIDAwMCAgICAgXG4jIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG5cbmxvZnQgPSAocG9seSwgbiwgYWxwaGEpIC0+XG4gICAgbmV3cG9seSA9IGluc2V0IHBvbHksIG4sIGFscGhhLCAwLjBcbiAgICBuZXdwb2x5Lm5hbWUgPSBcImwje259I3twb2x5Lm5hbWV9XCJcbiAgICBuZXdwb2x5XG5cbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICBcblxuaG9sbG93ID0gKHBvbHksIGluc2V0X2Rpc3QsIHRoaWNrbmVzcykgLT5cblxuICAgIGluc2V0X2Rpc3QgPz0gMC41XG4gICAgdGhpY2tuZXNzID89IDAuMlxuICBcbiAgICBrbG9nIFwiaG9sbG93ICN7cG9seS5uYW1lfVwiXG4gIFxuICAgIGR1YWxub3JtYWxzID0gZHVhbChwb2x5KS5ub3JtYWxzKClcbiAgICBub3JtYWxzID0gcG9seS5ub3JtYWxzKClcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXVxuICAgICAgICAjIGVhY2ggb2xkIHZlcnRleCBpcyBhIG5ldyB2ZXJ0ZXhcbiAgICAgICAgcCA9IHBvbHkudmVydGljZXNbaV1cbiAgICAgICAgZmxhZy5uZXdWIFwidiN7aX1cIiBwXG4gICAgICAgIGZsYWcubmV3ViBcImRvd252I3tpfVwiIGFkZCBwLCBtdWx0IC0xKnRoaWNrbmVzcyxkdWFsbm9ybWFsc1tpXVxuXG4gICAgIyBuZXcgaW5zZXQgdmVydGV4IGZvciBldmVyeSB2ZXJ0IGluIGZhY2VcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICBmbGFnLm5ld1YgXCJmaW4je2l9diN7dn1cIiB0d2VlbiBwb2x5LnZlcnRpY2VzW3ZdLCBjZW50ZXJzW2ldLCBpbnNldF9kaXN0XG4gICAgICAgICAgICBmbGFnLm5ld1YgXCJmaW5kb3duI3tpfXYje3Z9XCIgYWRkIHR3ZWVuKHBvbHkudmVydGljZXNbdl0sY2VudGVyc1tpXSxpbnNldF9kaXN0KSwgbXVsdCgtMSp0aGlja25lc3Msbm9ybWFsc1tpXSlcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgdjIgPSBcInYje3Z9XCJcbiAgICAgICAgICAgIGZuYW1lID0gaSArIHYxXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIHYxLCAgICAgICAgICAgIHYyXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIHYyLCAgICAgICAgICAgIFwiZmluI3tpfSN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgXCJmaW4je2l9I3t2Mn1cIiBcImZpbiN7aX0je3YxfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIFwiZmluI3tpfSN7djF9XCIgdjFcbiAgICAgIFxuICAgICAgICAgICAgZm5hbWUgPSBcInNpZGVzI3tpfSN7djF9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgXCJmaW4je2l9I3t2MX1cIiAgICAgXCJmaW4je2l9I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBcImZpbiN7aX0je3YyfVwiICAgICBcImZpbmRvd24je2l9I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBcImZpbmRvd24je2l9I3t2Mn1cIiBcImZpbmRvd24je2l9I3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBcImZpbmRvd24je2l9I3t2MX1cIiBcImZpbiN7aX0je3YxfVwiXG4gICAgICBcbiAgICAgICAgICAgIGZuYW1lID0gXCJib3R0b20je2l9I3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCAgXCJkb3duI3t2Mn1cIiAgICAgICAgXCJkb3duI3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCAgXCJkb3duI3t2MX1cIiAgICAgICAgXCJmaW5kb3duI3tpfSN7djF9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgIFwiZmluZG93biN7aX0je3YxfVwiIFwiZmluZG93biN7aX0je3YyfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsICBcImZpbmRvd24je2l9I3t2Mn1cIiBcImRvd24je3YyfVwiXG4gICAgICBcbiAgICAgICAgICAgIHYxID0gdjIgIyBjdXJyZW50IGJlY29tZXMgcHJldmlvdXNcbiAgXG4gICAgZmxhZy50b3BvbHkgXCJII3twb2x5Lm5hbWV9XCJcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAwMFxuIyAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4jIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAgICAgICAwMDAgICAwMDBcblxucGVyc3BlY3RpdmEgPSAocG9seSkgLT4gIyBhbiBvcGVyYXRpb24gcmV2ZXJzZS1lbmdpbmVlcmVkIGZyb20gUGVyc3BlY3RpdmEgQ29ycG9ydW0gUmVndWxhcml1bVxuXG4gICAgIyBrbG9nIFwic3RlbGxhIG9mICN7cG9seS5uYW1lfVwiXG4gIFxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKSAjIGNhbGN1bGF0ZSBmYWNlIGNlbnRlcnNcbiAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXVxuICAgICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHBvbHkudmVydGljZXNbaV1cbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gXCJ2I3tmW2YubGVuZ3RoLTJdfVwiXG4gICAgICAgIHYyID0gXCJ2I3tmW2YubGVuZ3RoLTFdfVwiXG4gICAgICAgIHZlcnQxID0gcG9seS52ZXJ0aWNlc1tmW2YubGVuZ3RoLTJdXVxuICAgICAgICB2ZXJ0MiA9IHBvbHkudmVydGljZXNbZltmLmxlbmd0aC0xXV1cbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgdjMgPSBcInYje3Z9XCJcbiAgICAgICAgICAgIHZlcnQzID0gcG9seS52ZXJ0aWNlc1t2XVxuICAgICAgICAgICAgdjEyID0gdjErXCJ+XCIrdjJcbiAgICAgICAgICAgIHYyMSA9IHYyK1wiflwiK3YxXG4gICAgICAgICAgICB2MjMgPSB2MitcIn5cIit2M1xuICAgICAgXG4gICAgICAgICAgICAjIG9uIGVhY2ggTmZhY2UsIE4gbmV3IHBvaW50cyBpbnNldCBmcm9tIGVkZ2UgbWlkcG9pbnRzIHRvd2FyZHMgY2VudGVyID0gXCJzdGVsbGF0ZWRcIiBwb2ludHNcbiAgICAgICAgICAgIGZsYWcubmV3ViB2MTIsIG1pZHBvaW50IG1pZHBvaW50KHZlcnQxLHZlcnQyKSwgY2VudGVyc1tpXSBcbiAgICAgIFxuICAgICAgICAgICAgIyBpbnNldCBOZmFjZSBtYWRlIG9mIG5ldywgc3RlbGxhdGVkIHBvaW50c1xuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiaW4je2l9XCIgdjEyLCB2MjNcbiAgICAgIFxuICAgICAgICAgICAgIyBuZXcgdHJpIGZhY2UgY29uc3RpdHV0aW5nIHRoZSByZW1haW5kZXIgb2YgdGhlIHN0ZWxsYXRlZCBOZmFjZVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiZiN7aX0je3YyfVwiIHYyMywgdjEyXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmI3tpfSN7djJ9XCIgdjEyLCB2MlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiZiN7aX0je3YyfVwiIHYyLCAgdjIzXG4gICAgICBcbiAgICAgICAgICAgICMgb25lIG9mIHRoZSB0d28gbmV3IHRyaWFuZ2xlcyByZXBsYWNpbmcgb2xkIGVkZ2UgYmV0d2VlbiB2MS0+djJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImYje3YxMn1cIiB2MSwgIHYyMVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiZiN7djEyfVwiIHYyMSwgdjEyXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmI3t2MTJ9XCIgdjEyLCB2MVxuICAgICAgXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdICAjIGN1cnJlbnQgYmVjb21lcyBwcmV2aW91c1xuICAgICAgICAgICAgW3ZlcnQxLCB2ZXJ0Ml0gPSBbdmVydDIsIHZlcnQzXVxuICBcbiAgICBmbGFnLnRvcG9seSBcIlAje3BvbHkubmFtZX1cIlxuXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG5cbnRyaXN1YiA9IChwb2x5LCBuKSAtPlxuICAgIFxuICAgIGtsb2cgXCJ0cmlzdWIgb2YgI3twb2x5Lm5hbWV9XCJcbiAgICBcbiAgICBuID89IDJcbiAgICBcbiAgICAjIE5vLU9wIGZvciBub24tdHJpYW5ndWxhciBtZXNoZXNcbiAgICBmb3IgZm4gaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgaWYgcG9seS5mYWNlc1tmbl0ubGVuZ3RoICE9IDNcbiAgICAgICAgICAgIHJldHVybiBwb2x5XG4gIFxuICAgICMgQ2FsY3VsYXRlIHJlZHVuZGFudCBzZXQgb2YgbmV3IHZlcnRpY2VzIGZvciBzdWJkaXZpZGVkIG1lc2guXG4gICAgbmV3VnMgPSBbXVxuICAgIHZtYXAgPSB7fVxuICAgIHBvcyA9IDBcbiAgICBmb3IgZm4gaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbZm5dXG4gICAgICAgIFtpMSwgaTIsIGkzXSA9IGYuc2xpY2UgLTNcbiAgICAgICAgdjEgPSBwb2x5LnZlcnRpY2VzW2kxXVxuICAgICAgICB2MiA9IHBvbHkudmVydGljZXNbaTJdXG4gICAgICAgIHYzID0gcG9seS52ZXJ0aWNlc1tpM11cbiAgICAgICAgdjIxID0gc3ViIHYyLCB2MVxuICAgICAgICB2MzEgPSBzdWIgdjMsIHYxXG4gICAgICAgIGZvciBpIGluIFswLi5uXVxuICAgICAgICAgICAgZm9yIGogaW4gWzAuLm4taV1cbiAgICAgICAgICAgICAgICB2ID0gYWRkIGFkZCh2MSwgbXVsdChpICogMS4wIC8gbiwgdjIxKSksIG11bHQoaiAqIDEuMCAvIG4sIHYzMSlcbiAgICAgICAgICAgICAgICB2bWFwW1widiN7Zm59LSN7aX0tI3tqfVwiXSA9IHBvcysrXG4gICAgICAgICAgICAgICAgbmV3VnMucHVzaCB2XG4gIFxuICAgICMgVGhlIGFib3ZlIHZlcnRpY2VzIGFyZSByZWR1bmRhbnQgYWxvbmcgb3JpZ2luYWwgZWRnZXMsIFxuICAgICMgd2UgbmVlZCB0byBidWlsZCBhbiBpbmRleCBtYXAgaW50byBhIHVuaXF1ZWlmaWVkIGxpc3Qgb2YgdGhlbS5cbiAgICAjIFdlIGlkZW50aWZ5IHZlcnRpY2VzIHRoYXQgYXJlIGNsb3NlciB0aGFuIGEgY2VydGFpbiBlcHNpbG9uIGRpc3RhbmNlLlxuICAgIEVQU0lMT05fQ0xPU0UgPSAxLjBlLThcbiAgICB1bmlxVnMgPSBbXVxuICAgIG5ld3BvcyA9IDBcbiAgICB1bmlxbWFwID0ge31cbiAgICBmb3IgW2ksIHZdIGluIG5ld1ZzLmVudHJpZXMoKVxuICAgICAgICBpZiBpIGluIHVuaXFtYXAgdGhlbiBjb250aW51ZSAjIGFscmVhZHkgbWFwcGVkXG4gICAgICAgIHVuaXFtYXBbaV0gPSBuZXdwb3NcbiAgICAgICAgdW5pcVZzLnB1c2ggdlxuICAgICAgICBmb3IgaiBpbiBbaSsxLi4ubmV3VnMubGVuZ3RoXVxuICAgICAgICAgICAgdyA9IG5ld1ZzW2pdXG4gICAgICAgICAgICBpZiBtYWcoc3ViKHYsIHcpKSA8IEVQU0lMT05fQ0xPU0VcbiAgICAgICAgICAgICAgICB1bmlxbWFwW2pdID0gbmV3cG9zXG4gICAgICAgIG5ld3BvcysrXG4gIFxuICAgIGZhY2VzID0gW11cbiAgICBmb3IgZm4gaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZm9yIGkgaW4gWzAuLi5uXVxuICAgICAgICAgICAgZm9yIGogaW4gWzAuLi5uLWldXG4gICAgICAgICAgICAgICAgZmFjZXMucHVzaCBbdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2krMX0tI3tqfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2l9LSN7aisxfVwiXV1dXG4gICAgICAgIGZvciBpIGluIFsxLi4ubl1cbiAgICAgICAgICAgIGZvciBqIGluIFswLi4ubi1pXVxuICAgICAgICAgICAgICAgIGZhY2VzLnB1c2ggW3VuaXFtYXBbdm1hcFtcInYje2ZufS0je2l9LSN7an1cIl1dLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2orMX1cIl1dLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpLTF9LSN7aisxfVwiXV1dXG4gIFxuICAgIG5ldyBQb2x5aGVkcm9uIFwidSN7bn0je3BvbHkubmFtZX1cIiBmYWNlcywgdW5pcVZzXG5cbiMgY29tYmluZXMgYWJvdmUgdGhyZWUgY29uc3RyYWludCBhZGp1c3RtZW50cyBpbiBpdGVyYXRpdmUgY3ljbGVcbmNhbm9uaWNhbGl6ZSA9IChwb2x5LCBOaXRlcikgLT5cblxuICAgIE5pdGVyID89IDFcbiAgICAjIGtsb2cgXCJjYW5vbmljYWxpemUgI3twb2x5Lm5hbWV9XCJcbiAgICBmYWNlcyA9IHBvbHkuZmFjZXNcbiAgICBlZGdlcyA9IHBvbHkuZWRnZXMoKVxuICAgIG5ld1ZzID0gcG9seS52ZXJ0aWNlc1xuICAgIG1heENoYW5nZSA9IDEuMCAjIGNvbnZlcmdlbmNlIHRyYWNrZXJcbiAgICBmb3IgaSBpbiBbMC4uTml0ZXJdXG4gICAgICAgIG9sZFZzID0gY29weVZlY0FycmF5IG5ld1ZzICNjb3B5IHZlcnRpY2VzXG4gICAgICAgIG5ld1ZzID0gdGFuZ2VudGlmeSBuZXdWcywgZWRnZXNcbiAgICAgICAgbmV3VnMgPSByZWNlbnRlciBuZXdWcywgZWRnZXNcbiAgICAgICAgbmV3VnMgPSBwbGFuYXJpemUgbmV3VnMsIGZhY2VzXG4gICAgICAgIG1heENoYW5nZSA9IF8ubWF4IF8ubWFwIF8uemlwKG5ld1ZzLCBvbGRWcyksIChbeCwgeV0pIC0+IG1hZyBzdWIgeCwgeVxuICAgICAgICBpZiBtYXhDaGFuZ2UgPCAxZS04XG4gICAgICAgICAgICBicmVha1xuICAgICMgb25lIHNob3VsZCBub3cgcmVzY2FsZSwgYnV0IG5vdCByZXNjYWxpbmcgaGVyZSBtYWtlcyBmb3IgdmVyeSBpbnRlcmVzdGluZyBudW1lcmljYWxcbiAgICAjIGluc3RhYmlsaXRpZXMgdGhhdCBtYWtlIGludGVyZXN0aW5nIG11dGFudHMgb24gbXVsdGlwbGUgYXBwbGljYXRpb25zLi4uXG4gICAgIyBtb3JlIGV4cGVyaWVuY2Ugd2lsbCB0ZWxsIHdoYXQgdG8gZG9cbiAgICAjbmV3VnMgPSByZXNjYWxlKG5ld1ZzKVxuICAgICMga2xvZyBcIltjYW5vbmljYWxpemF0aW9uIGRvbmUsIGxhc3QgfGRlbHRhVnw9I3ttYXhDaGFuZ2V9XVwiXG4gICAgbmV3cG9seSA9IG5ldyBQb2x5aGVkcm9uIHBvbHkubmFtZSwgcG9seS5mYWNlcywgbmV3VnNcbiAgICAjIGtsb2cgXCJjYW5vbmljYWxpemVcIiBuZXdwb2x5XG4gICAgbmV3cG9seVxuICAgIFxuY2Fub25pY2FsWFlaID0gKHBvbHksIG5JdGVyYXRpb25zKSAtPlxuXG4gICAgbkl0ZXJhdGlvbnMgPz0gMVxuICAgIGRwb2x5ID0gZHVhbCBwb2x5XG4gICAgIyBrbG9nIFwiY2Fub25pY2FsWFlaICN7cG9seS5uYW1lfVwiXG4gIFxuICAgIGZvciBjb3VudCBpbiBbMC4uLm5JdGVyYXRpb25zXSAjIHJlY2lwcm9jYXRlIGZhY2Ugbm9ybWFsc1xuICAgICAgICBkcG9seS52ZXJ0aWNlcyA9IHJlY2lwcm9jYWxOIHBvbHlcbiAgICAgICAgcG9seS52ZXJ0aWNlcyAgPSByZWNpcHJvY2FsTiBkcG9seVxuICBcbiAgICBuZXcgUG9seWhlZHJvbiBwb2x5Lm5hbWUsIHBvbHkuZmFjZXMsIHBvbHkudmVydGljZXNcblxuZmxhdHRlbiA9IChwb2x5LCBuSXRlcmF0aW9ucykgLT4gIyBxdWljayBwbGFuYXJpemF0aW9uXG4gICAgXG4gICAgbkl0ZXJhdGlvbnMgPz0gMVxuICAgIGRwb2x5ID0gZHVhbCBwb2x5ICMgdidzIG9mIGR1YWwgYXJlIGluIG9yZGVyIG9mIGFyZydzIGYnc1xuICAgICMga2xvZyBcImZsYXR0ZW4gI3twb2x5Lm5hbWV9XCJcbiAgXG4gICAgZm9yIGNvdW50IGluIFswLi4ubkl0ZXJhdGlvbnNdICMgcmVjaXByb2NhdGUgZmFjZSBjZW50ZXJzXG4gICAgICAgIGRwb2x5LnZlcnRpY2VzID0gcmVjaXByb2NhbEMgcG9seVxuICAgICAgICBwb2x5LnZlcnRpY2VzICA9IHJlY2lwcm9jYWxDIGRwb2x5XG4gIFxuICAgIG5ldyBQb2x5aGVkcm9uIHBvbHkubmFtZSwgcG9seS5mYWNlcywgcG9seS52ZXJ0aWNlc1xuICAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICBcbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgICBkdWFsOiAgICAgICAgICAgZHVhbFxuICAgIHRyaXN1YjogICAgICAgICB0cmlzdWJcbiAgICBwZXJzcGVjdGl2YTogICAgcGVyc3BlY3RpdmFcbiAgICBraXM6ICAgICAgICAgICAga2lzXG4gICAgYW1ibzogICAgICAgICAgIGFtYm9cbiAgICBneXJvOiAgICAgICAgICAgZ3lyb1xuICAgIHJlZmxlY3Q6ICAgICAgICByZWZsZWN0XG4gICAgY2hhbWZlcjogICAgICAgIGNoYW1mZXJcbiAgICB3aGlybDogICAgICAgICAgd2hpcmxcbiAgICBxdWludG86ICAgICAgICAgcXVpbnRvXG4gICAgaW5zZXQ6ICAgICAgICAgIGluc2V0XG4gICAgZXh0cnVkZTogICAgICAgIGV4dHJ1ZGVcbiAgICBsb2Z0OiAgICAgICAgICAgbG9mdFxuICAgIGhvbGxvdzogICAgICAgICBob2xsb3dcbiAgICBmbGF0dGVuOiAgICAgICAgZmxhdHRlblxuICAgIHppcmt1bGFyaXplOiAgICB6aXJrdWxhcml6ZVxuICAgIGNhbm9uaWNhbGl6ZTogICBjYW5vbmljYWxpemVcbiAgICBjYW5vbmljYWxYWVo6ICAgY2Fub25pY2FsWFlaXG4gICAgIl19
//# sourceURL=../../coffee/poly/topo.coffee