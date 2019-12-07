// koffee 1.6.0

/*
000000000   0000000   00000000    0000000     
   000     000   000  000   000  000   000    
   000     000   000  00000000   000   000    
   000     000   000  000        000   000    
   000      0000000   000         0000000
 */
var Flag, Polyhedron, _, add, ambo, calcCentroid, canonicalXYZ, canonicalize, chamfer, copyVecArray, dual, extrude, flatten, gyro, hollow, inset, intersect, kis, klog, loft, mag, midName, midpoint, mult, oneThird, perspectiva, planarize, quinto, recenter, reciprocalC, reciprocalN, ref, ref1, ref2, reflect, sub, tangentify, trisub, tween, unit, whirl,
    indexOf = [].indexOf;

ref = require('kxk'), klog = ref.klog, _ = ref._;

ref1 = require('./math'), add = ref1.add, mult = ref1.mult, mag = ref1.mag, sub = ref1.sub, unit = ref1.unit, oneThird = ref1.oneThird, tween = ref1.tween, intersect = ref1.intersect, midpoint = ref1.midpoint, calcCentroid = ref1.calcCentroid, copyVecArray = ref1.copyVecArray;

ref2 = require('./geo'), tangentify = ref2.tangentify, reciprocalC = ref2.reciprocalC, reciprocalN = ref2.reciprocalN, recenter = ref2.recenter, planarize = ref2.planarize;

Flag = require('./flag');

Polyhedron = require('./polyhedron');

midName = function(v1, v2) {
    return v1 < v2 && (v1 + "_" + v2) || (v2 + "_" + v1);
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
    canonicalize: canonicalize,
    canonicalXYZ: canonicalXYZ
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9wby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsMlZBQUE7SUFBQTs7QUF3QkEsTUFBYyxPQUFBLENBQVEsS0FBUixDQUFkLEVBQUUsZUFBRixFQUFROztBQUNSLE9BQWtHLE9BQUEsQ0FBUSxRQUFSLENBQWxHLEVBQUUsY0FBRixFQUFPLGdCQUFQLEVBQWEsY0FBYixFQUFrQixjQUFsQixFQUF1QixnQkFBdkIsRUFBNkIsd0JBQTdCLEVBQXVDLGtCQUF2QyxFQUE4QywwQkFBOUMsRUFBeUQsd0JBQXpELEVBQW1FLGdDQUFuRSxFQUFpRjs7QUFDakYsT0FBZ0UsT0FBQSxDQUFRLE9BQVIsQ0FBaEUsRUFBRSw0QkFBRixFQUFjLDhCQUFkLEVBQTJCLDhCQUEzQixFQUF3Qyx3QkFBeEMsRUFBa0Q7O0FBRWxELElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7QUFDUCxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0FBRWIsT0FBQSxHQUFVLFNBQUMsRUFBRCxFQUFLLEVBQUw7V0FBWSxFQUFBLEdBQUcsRUFBSCxJQUFVLENBQUcsRUFBRCxHQUFJLEdBQUosR0FBTyxFQUFULENBQVYsSUFBMkIsQ0FBRyxFQUFELEdBQUksR0FBSixHQUFPLEVBQVQ7QUFBdkM7O0FBUVYsSUFBQSxHQUFPLFNBQUMsSUFBRDtBQUlILFFBQUE7SUFBQSxJQUFBLEdBQU8sSUFBSSxJQUFKLENBQUE7SUFFUCxJQUFBLEdBQU87QUFDUCxTQUFTLGtHQUFUO1FBQ0ksSUFBSyxDQUFBLENBQUEsQ0FBTCxHQUFVO0FBRGQ7QUFHQSxTQUFTLCtGQUFUO1FBQ0ksQ0FBQSxHQUFJLElBQUksQ0FBQyxLQUFNLENBQUEsQ0FBQTtRQUNmLEVBQUEsR0FBSyxDQUFFLENBQUEsQ0FBQyxDQUFDLE1BQUYsR0FBUyxDQUFUO0FBQ1AsYUFBQSxtQ0FBQTs7WUFDSSxJQUFLLENBQUEsRUFBQSxDQUFJLENBQUEs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QUFMO0FBR1IsU0FBYSxpR0FBYjtRQUNJLEtBQUssQ0FBQyxRQUFOLEdBQWlCLFdBQUEsQ0FBWSxJQUFaO1FBQ2pCLElBQUksQ0FBQyxRQUFMLEdBQWlCLFdBQUEsQ0FBWSxLQUFaO0FBRnJCO1dBSUEsSUFBSSxVQUFKLENBQWUsSUFBSSxDQUFDLElBQXBCLEVBQTBCLElBQUksQ0FBQyxLQUEvQixFQUFzQyxJQUFJLENBQUMsUUFBM0M7QUFWTTs7QUFrQlYsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLElBQUEsRUFBZ0IsSUFBaEI7SUFDQSxNQUFBLEVBQWdCLE1BRGhCO0lBRUEsV0FBQSxFQUFnQixXQUZoQjtJQUdBLEdBQUEsRUFBZ0IsR0FIaEI7SUFJQSxJQUFBLEVBQWdCLElBSmhCO0lBS0EsSUFBQSxFQUFnQixJQUxoQjtJQU1BLE9BQUEsRUFBZ0IsT0FOaEI7SUFPQSxPQUFBLEVBQWdCLE9BUGhCO0lBUUEsS0FBQSxFQUFnQixLQVJoQjtJQVNBLE1BQUEsRUFBZ0IsTUFUaEI7SUFVQSxLQUFBLEVBQWdCLEtBVmhCO0lBV0EsT0FBQSxFQUFnQixPQVhoQjtJQVlBLElBQUEsRUFBZ0IsSUFaaEI7SUFhQSxNQUFBLEVBQWdCLE1BYmhCO0lBY0EsT0FBQSxFQUFnQixPQWRoQjtJQWVBLFlBQUEsRUFBZ0IsWUFmaEI7SUFnQkEsWUFBQSxFQUFnQixZQWhCaEIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgICBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgICBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgICBcbiAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAwMDAwMDAwICAgICBcbiMjI1xuI1xuIyBQb2x5aMOpZHJvbmlzbWUsIENvcHlyaWdodCAyMDE5LCBBbnNlbG0gTGV2c2theWEsIE1JVCBMaWNlbnNlXG4jXG4jIFBvbHloZWRyb24gT3BlcmF0b3JzXG4jXG4jIGZvciBlYWNoIHZlcnRleCBvZiBuZXcgcG9seWhlZHJvblxuIyAgICAgY2FsbCBuZXdWKFZuYW1lLCB4eXopIHdpdGggYSBzeW1ib2xpYyBuYW1lIGFuZCBjb29yZGluYXRlc1xuI1xuIyBmb3IgZWFjaCBmbGFnIG9mIG5ldyBwb2x5aGVkcm9uXG4jICAgICBjYWxsIG5ld0ZsYWcoRm5hbWUsIFZuYW1lMSwgVm5hbWUyKSB3aXRoIGEgc3ltYm9saWMgbmFtZSBmb3IgdGhlIG5ldyBmYWNlXG4jICAgICBhbmQgdGhlIHN5bWJvbGljIG5hbWUgZm9yIHR3byB2ZXJ0aWNlcyBmb3JtaW5nIGFuIG9yaWVudGVkIGVkZ2VcbiNcbiMgT3JpZW50YXRpb24gbXVzdCBiZSBkZWFsdCB3aXRoIHByb3Blcmx5IHRvIG1ha2UgYSBtYW5pZm9sZCBtZXNoXG4jIFNwZWNpZmljYWxseSwgbm8gZWRnZSB2MS0+djIgY2FuIGV2ZXIgYmUgY3Jvc3NlZCBpbiB0aGUgc2FtZSBkaXJlY3Rpb24gYnkgdHdvIGRpZmZlcmVudCBmYWNlc1xuIyBjYWxsIHRvcG9seSgpIHRvIGFzc2VtYmxlIGZsYWdzIGludG8gcG9seWhlZHJvbiBzdHJ1Y3R1cmUgYnkgZm9sbG93aW5nIHRoZSBvcmJpdHNcbiMgb2YgdGhlIHZlcnRleCBtYXBwaW5nIHN0b3JlZCBpbiB0aGUgZmxhZ3NldCBmb3IgZWFjaCBuZXcgZmFjZVxuXG57IGtsb2csIF8gfSA9IHJlcXVpcmUgJ2t4aydcbnsgYWRkLCBtdWx0LCBtYWcsIHN1YiwgdW5pdCwgb25lVGhpcmQsIHR3ZWVuLCBpbnRlcnNlY3QsIG1pZHBvaW50LCBjYWxjQ2VudHJvaWQsIGNvcHlWZWNBcnJheSB9ID0gcmVxdWlyZSAnLi9tYXRoJ1xueyB0YW5nZW50aWZ5LCByZWNpcHJvY2FsQywgcmVjaXByb2NhbE4sIHJlY2VudGVyLCBwbGFuYXJpemUgfSA9IHJlcXVpcmUgJy4vZ2VvJ1xuXG5GbGFnID0gcmVxdWlyZSAnLi9mbGFnJ1xuUG9seWhlZHJvbiA9IHJlcXVpcmUgJy4vcG9seWhlZHJvbidcblxubWlkTmFtZSA9ICh2MSwgdjIpIC0+IHYxPHYyIGFuZCBcIiN7djF9XyN7djJ9XCIgb3IgXCIje3YyfV8je3YxfVwiICMgdW5pcXVlIG5hbWVzIG9mIG1pZHBvaW50c1xuXG4jIDAwMDAwMDAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICBcblxuZHVhbCA9IChwb2x5KSAtPlxuXG4gICAgIyBrbG9nIFwiZHVhbCAje3BvbHkubmFtZX1cIiBcbiAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgZmFjZSA9IFtdICMgbWFrZSB0YWJsZSBvZiBmYWNlIGFzIGZuIG9mIGVkZ2VcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXSAjIGNyZWF0ZSBlbXB0eSBhc3NvY2lhdGl2ZSB0YWJsZVxuICAgICAgICBmYWNlW2ldID0ge31cblxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gZltmLmxlbmd0aC0xXSAjIGxhc3QgdmVydGV4XG4gICAgICAgIGZvciB2MiBpbiBmICMgYXNzdW1lcyB0aGF0IG5vIDIgZmFjZXMgc2hhcmUgYW4gZWRnZSBpbiB0aGUgc2FtZSBvcmllbnRhdGlvbiFcbiAgICAgICAgICAgIGZhY2VbdjFdW1widiN7djJ9XCJdID0gXCIje2l9XCJcbiAgICAgICAgICAgIHYxID0gdjIgIyBjdXJyZW50IGJlY29tZXMgcHJldmlvdXNcbiAgXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZmxhZy5uZXdWIFwiI3tpfVwiIGNlbnRlcnNbaV1cbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgdjEgPSBmW2YubGVuZ3RoLTFdICNwcmV2aW91cyB2ZXJ0ZXhcbiAgICAgICAgZm9yIHYyIGluIGZcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyB2MSwgZmFjZVt2Ml1bXCJ2I3t2MX1cIl0sIFwiI3tpfVwiXG4gICAgICAgICAgICB2MT12MiAjIGN1cnJlbnQgYmVjb21lcyBwcmV2aW91c1xuICBcbiAgICBkcG9seSA9IGZsYWcudG9wb2x5KCkgIyBidWlsZCB0b3BvbG9naWNhbCBkdWFsIGZyb20gZmxhZ3NcbiAgXG4gICAgIyBtYXRjaCBGIGluZGV4IG9yZGVyaW5nIHRvIFYgaW5kZXggb3JkZXJpbmcgb24gZHVhbFxuICAgIHNvcnRGID0gW11cbiAgICBmb3IgZiBpbiBkcG9seS5mYWNlc1xuICAgICAgICBrID0gaW50ZXJzZWN0IHBvbHkuZmFjZXNbZlswXV0sIHBvbHkuZmFjZXNbZlsxXV0sIHBvbHkuZmFjZXNbZlsyXV1cbiAgICAgICAgc29ydEZba10gPSBmXG4gICAgZHBvbHkuZmFjZXMgPSBzb3J0RlxuICBcbiAgICBpZiBwb2x5Lm5hbWVbMF0gIT0gXCJkXCJcbiAgICAgICAgZHBvbHkubmFtZSA9IFwiZCN7cG9seS5uYW1lfVwiXG4gICAgZWxzZSBcbiAgICAgICAgZHBvbHkubmFtZSA9IHBvbHkubmFtZS5zbGljZSAxXG4gIFxuICAgIGRwb2x5XG5cbiMgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgIDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbiMgS2lzIChhYmJyZXZpYXRlZCBmcm9tIHRyaWFraXMpIHRyYW5zZm9ybXMgYW4gTi1zaWRlZCBmYWNlIGludG8gYW4gTi1weXJhbWlkIHJvb3RlZCBhdCB0aGVcbiMgc2FtZSBiYXNlIHZlcnRpY2VzLiBvbmx5IGtpcyBuLXNpZGVkIGZhY2VzLCBidXQgbj09MCBtZWFucyBraXMgYWxsLlxuXG5raXMgPSAocG9seSwgbiwgYXBleGRpc3QpIC0+XG5cbiAgICBuID89IDBcbiAgICBhcGV4ZGlzdCA/PSAwXG5cbiAgICAjIGtsb2cgXCJraXMgb2YgI3tuIGFuZCBcIiN7bn0tc2lkZWQgZmFjZXMgb2YgXCIgb3IgJyd9I3twb2x5Lm5hbWV9XCJcblxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgcCA9IHBvbHkudmVydGljZXNbaV0gIyBlYWNoIG9sZCB2ZXJ0ZXggaXMgYSBuZXcgdmVydGV4XG4gICAgICAgIGZsYWcubmV3ViBcInYje2l9XCIgcFxuICBcbiAgICBub3JtYWxzID0gcG9seS5ub3JtYWxzKClcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgICBmb3VuZEFueSA9IGZhbHNlXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgdjIgPSBcInYje3Z9XCJcbiAgICAgICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICAgICAgZm91bmRBbnkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGFwZXggPSBcImFwZXgje2l9XCJcbiAgICAgICAgICAgICAgICBmbmFtZSA9IFwiI3tpfSN7djF9XCJcbiAgICAgICAgICAgICAgICAjIG5ldyB2ZXJ0aWNlcyBpbiBjZW50ZXJzIG9mIG4tc2lkZWQgZmFjZVxuICAgICAgICAgICAgICAgIGZsYWcubmV3ViBhcGV4LCBhZGQgY2VudGVyc1tpXSwgbXVsdCBhcGV4ZGlzdCwgbm9ybWFsc1tpXVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgICB2MSwgICB2MiAjIHRoZSBvbGQgZWRnZSBvZiBvcmlnaW5hbCBmYWNlXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCAgIHYyLCBhcGV4ICMgdXAgdG8gYXBleCBvZiBweXJhbWlkXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBhcGV4LCAgIHYxICMgYW5kIGJhY2sgZG93biBhZ2FpblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcIiN7aX1cIiwgdjEsIHYyICAjIHNhbWUgb2xkIGZsYWcsIGlmIG5vbi1uXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHYxID0gdjIgIyBjdXJyZW50IGJlY29tZXMgcHJldmlvdXNcbiAgXG4gICAgaWYgbm90IGZvdW5kQW55XG4gICAgICAgIGtsb2cgXCJObyAje259LWZvbGQgY29tcG9uZW50cyB3ZXJlIGZvdW5kLlwiXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiayN7bn0je3BvbHkubmFtZX1cIlxuXG4jICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgXG5cbiMgVGhlIGJlc3Qgd2F5IHRvIHRoaW5rIG9mIHRoZSBhbWJvIG9wZXJhdG9yIGlzIGFzIGEgdG9wb2xvZ2ljYWwgXCJ0d2VlblwiIGJldHdlZW4gYSBwb2x5aGVkcm9uXG4jIGFuZCBpdHMgZHVhbCBwb2x5aGVkcm9uLiAgVGh1cyB0aGUgYW1ibyBvZiBhIGR1YWwgcG9seWhlZHJvbiBpcyB0aGUgc2FtZSBhcyB0aGUgYW1ibyBvZiB0aGVcbiMgb3JpZ2luYWwuIEFsc28gY2FsbGVkIFwiUmVjdGlmeVwiLlxuXG5hbWJvID0gKHBvbHkpIC0+XG4gICAgXG4gICAgIyBrbG9nIFwiYW1ibyBvZiAje3BvbHkubmFtZX1cIlxuICAgIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgICMgRm9yIGVhY2ggZmFjZSBmIGluIHRoZSBvcmlnaW5hbCBwb2x5XG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlKC0yKVxuICAgICAgICBmb3IgdjMgaW4gZlxuICAgICAgICAgICAgaWYgdjEgPCB2MiAjIHZlcnRpY2VzIGFyZSB0aGUgbWlkcG9pbnRzIG9mIGFsbCBlZGdlcyBvZiBvcmlnaW5hbCBwb2x5XG4gICAgICAgICAgICAgICAgZmxhZy5uZXdWIG1pZE5hbWUodjEsdjIpLCBtaWRwb2ludCBwb2x5LnZlcnRpY2VzW3YxXSwgcG9seS52ZXJ0aWNlc1t2Ml1cbiAgICAgICAgICAgICMgZmFjZSBjb3JyZXNwb25kcyB0byB0aGUgb3JpZ2luYWwgZlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwib3JpZyN7aX1cIiAgbWlkTmFtZSh2MSx2MiksIG1pZE5hbWUodjIsdjMpXG4gICAgICAgICAgICAjIGZhY2UgY29ycmVzcG9uZHMgdG8gKHRoZSB0cnVuY2F0ZWQpIHYyXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJkdWFsI3t2Mn1cIiBtaWROYW1lKHYyLHYzKSwgbWlkTmFtZSh2MSx2MilcbiAgICAgICAgICAgICMgc2hpZnQgb3ZlciBvbmVcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M11cbiAgXG4gICAgZmxhZy50b3BvbHkgXCJhI3twb2x5Lm5hbWV9XCJcblxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgIDAwMDAgICAgMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuXG5neXJvID0gKHBvbHkpIC0+XG5cbiAgICBrbG9nIFwiZ3lybyBvZiAje3BvbHkubmFtZX1cIlxuICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXVxuICAgICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHVuaXQgcG9seS52ZXJ0aWNlc1tpXSAjIGVhY2ggb2xkIHZlcnRleCBpcyBhIG5ldyB2ZXJ0ZXhcblxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKSAjIG5ldyB2ZXJ0aWNlcyBpbiBjZW50ZXIgb2YgZWFjaCBmYWNlXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgZmxhZy5uZXdWIFwiY2VudGVyI3tpfVwiIHVuaXQgY2VudGVyc1tpXVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UoLTIpXG4gICAgICAgIGZvciBqIGluIFswLi4uZi5sZW5ndGhdXG4gICAgICAgICAgICB2ID0gZltqXVxuICAgICAgICAgICAgdjMgPSB2XG4gICAgICAgICAgICBmbGFnLm5ld1YodjErXCJ+XCIrdjIsIG9uZVRoaXJkKHBvbHkudmVydGljZXNbdjFdLHBvbHkudmVydGljZXNbdjJdKSk7ICAjIG5ldyB2IGluIGZhY2VcbiAgICAgICAgICAgIGZuYW1lID0gaStcImZcIit2MVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBcImNlbnRlciN7aX1cIiAgdjErXCJ+XCIrdjIgIyBmaXZlIG5ldyBmbGFnc1xuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCB2MStcIn5cIit2MiwgIHYyK1wiflwiK3YxXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIHYyK1wiflwiK3YxLCAgXCJ2I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBcInYje3YyfVwiICAgICB2MitcIn5cIit2M1xuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCB2MitcIn5cIit2MywgIFwiY2VudGVyI3tpfVwiXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdICMgc2hpZnQgb3ZlciBvbmVcbiAgXG4gICAgZmxhZy50b3BvbHkgXCJnI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIFxuXG5yZWZsZWN0ID0gKHBvbHkpIC0+ICMgZ2VvbWV0cmljIHJlZmxlY3Rpb24gdGhyb3VnaCBvcmlnaW5cblxuICAgIGtsb2cgXCJyZWZsZWN0aW9uIG9mICN7cG9seS5uYW1lfVwiXG4gICAgIyByZWZsZWN0IGVhY2ggcG9pbnQgdGhyb3VnaCBvcmlnaW5cbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXVxuICAgICAgICBwb2x5LnZlcnRpY2VzW2ldID0gbXVsdCAtMSwgcG9seS52ZXJ0aWNlc1tpXVxuICAgICMgcmVwYWlyIGNsb2Nrd2lzZS1uZXNzIG9mIGZhY2VzXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgcG9seS5mYWNlc1tpXSA9IHBvbHkuZmFjZXNbaV0ucmV2ZXJzZSgpXG4gICAgcG9seS5uYW1lID0gXCJyI3twb2x5Lm5hbWV9XCJcbiAgICBwb2x5XG5cbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcblxuIyBBIHRydW5jYXRpb24gYWxvbmcgYSBwb2x5aGVkcm9uJ3MgZWRnZXMuXG4jIENoYW1mZXJpbmcgb3IgZWRnZS10cnVuY2F0aW9uIGlzIHNpbWlsYXIgdG8gZXhwYW5zaW9uLCBtb3ZpbmcgZmFjZXMgYXBhcnQgYW5kIG91dHdhcmQsXG4jIGJ1dCBhbHNvIG1haW50YWlucyB0aGUgb3JpZ2luYWwgdmVydGljZXMuIEFkZHMgYSBuZXcgaGV4YWdvbmFsIGZhY2UgaW4gcGxhY2Ugb2YgZWFjaFxuIyBvcmlnaW5hbCBlZGdlLlxuIyBBIHBvbHloZWRyb24gd2l0aCBlIGVkZ2VzIHdpbGwgaGF2ZSBhIGNoYW1mZXJlZCBmb3JtIGNvbnRhaW5pbmcgMmUgbmV3IHZlcnRpY2VzLFxuIyAzZSBuZXcgZWRnZXMsIGFuZCBlIG5ldyBoZXhhZ29uYWwgZmFjZXMuIC0tIFdpa2lwZWRpYVxuIyBTZWUgYWxzbyBodHRwOiNkbWNjb29leS5jb20vcG9seWhlZHJhL0NoYW1mZXIuaHRtbFxuI1xuIyBUaGUgZGlzdCBwYXJhbWV0ZXIgY291bGQgY29udHJvbCBob3cgZGVlcGx5IHRvIGNoYW1mZXIuXG4jIEJ1dCBJJ20gbm90IHN1cmUgYWJvdXQgaW1wbGVtZW50aW5nIHRoYXQgeWV0LlxuI1xuIyBROiB3aGF0IGlzIHRoZSBkdWFsIG9wZXJhdGlvbiBvZiBjaGFtZmVyaW5nPyBJLmUuXG4jIGlmIGNYID0gZHhkWCwgYW5kIHhYID0gZGNkWCwgd2hhdCBvcGVyYXRpb24gaXMgeD9cblxuIyBXZSBjb3VsZCBcImFsbW9zdFwiIGRvIHRoaXMgaW4gdGVybXMgb2YgYWxyZWFkeS1pbXBsZW1lbnRlZCBvcGVyYXRpb25zOlxuIyBjQyA9IHQ0ZGFDID0gdDRqQywgY08gPSB0M2RhTywgY0QgPSB0NWRhRCwgY0kgPSB0M2RhSVxuIyBCdXQgaXQgZG9lc24ndCB3b3JrIGZvciBjYXNlcyBsaWtlIFQuXG5cbmNoYW1mZXIgPSAocG9seSwgZGlzdCkgLT5cbiAgICBrbG9nIFwiY2hhbWZlciBvZiAje3BvbHkubmFtZX1cIlxuICBcbiAgICBkaXN0ID89IDAuNVxuICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICBub3JtYWxzID0gcG9seS5ub3JtYWxzKClcbiAgXG4gICAgIyBGb3IgZWFjaCBmYWNlIGYgaW4gdGhlIG9yaWdpbmFsIHBvbHlcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IGZbZi5sZW5ndGgtMV1cbiAgICAgICAgdjFuZXcgPSBpICsgXCJfXCIgKyB2MVxuICAgIFxuICAgICAgICBmb3IgdjIgaW4gZlxuICAgICAgICAgICMgVE9ETzogZmlndXJlIG91dCB3aGF0IGRpc3RhbmNlcyB3aWxsIGdpdmUgdXMgYSBwbGFuYXIgaGV4IGZhY2UuXG4gICAgICAgICAgIyBNb3ZlIGVhY2ggb2xkIHZlcnRleCBmdXJ0aGVyIGZyb20gdGhlIG9yaWdpbi5cbiAgICAgICAgICBmbGFnLm5ld1YodjIsIG11bHQoMS4wICsgZGlzdCwgcG9seS52ZXJ0aWNlc1t2Ml0pKVxuICAgICAgICAgICMgQWRkIGEgbmV3IHZlcnRleCwgbW92ZWQgcGFyYWxsZWwgdG8gbm9ybWFsLlxuICAgICAgICAgIHYybmV3ID0gaSArIFwiX1wiICsgdjJcbiAgICAgICAgICBmbGFnLm5ld1YodjJuZXcsIGFkZChwb2x5LnZlcnRpY2VzW3YyXSwgbXVsdChkaXN0KjEuNSwgbm9ybWFsc1tpXSkpKVxuICAgICAgICAgICMgRm91ciBuZXcgZmxhZ3M6XG4gICAgICAgICAgIyBPbmUgd2hvc2UgZmFjZSBjb3JyZXNwb25kcyB0byB0aGUgb3JpZ2luYWwgZmFjZTpcbiAgICAgICAgICBmbGFnLm5ld0ZsYWcoXCJvcmlnI3tpfVwiLCB2MW5ldywgdjJuZXcpXG4gICAgICAgICAgIyBBbmQgdGhyZWUgZm9yIHRoZSBlZGdlcyBvZiB0aGUgbmV3IGhleGFnb246XG4gICAgICAgICAgZmFjZW5hbWUgPSAodjE8djIgPyBcImhleCN7djF9XyN7djJ9XCIgOiBcImhleCN7djJ9XyN7djF9XCIpXG4gICAgICAgICAgZmxhZy5uZXdGbGFnKGZhY2VuYW1lLCB2MiwgdjJuZXcpXG4gICAgICAgICAgZmxhZy5uZXdGbGFnKGZhY2VuYW1lLCB2Mm5ldywgdjFuZXcpXG4gICAgICAgICAgZmxhZy5uZXdGbGFnKGZhY2VuYW1lLCB2MW5ldywgdjEpXG4gICAgICAgICAgdjEgPSB2MjtcbiAgICAgICAgICB2MW5ldyA9IHYybmV3XG5cbiAgICBmbGFnLnRvcG9seSBcImMje3BvbHkubmFtZX1cIlxuXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwICAgMDAwICAgICAgXG4jIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG5cbiMgR3lybyBmb2xsb3dlZCBieSB0cnVuY2F0aW9uIG9mIHZlcnRpY2VzIGNlbnRlcmVkIG9uIG9yaWdpbmFsIGZhY2VzLlxuIyBUaGlzIGNyZWF0ZSAyIG5ldyBoZXhhZ29ucyBmb3IgZXZlcnkgb3JpZ2luYWwgZWRnZS5cbiMgKGh0dHBzOiNlbi53aWtpcGVkaWEub3JnL3dpa2kvQ29ud2F5X3BvbHloZWRyb25fbm90YXRpb24jT3BlcmF0aW9uc19vbl9wb2x5aGVkcmEpXG4jXG4jIFBvc3NpYmxlIGV4dGVuc2lvbjogdGFrZSBhIHBhcmFtZXRlciBuIHRoYXQgbWVhbnMgb25seSB3aGlybCBuLXNpZGVkIGZhY2VzLlxuIyBJZiB3ZSBkbyB0aGF0LCB0aGUgZmxhZ3MgbWFya2VkICMqIGJlbG93IHdpbGwgbmVlZCB0byBoYXZlIHRoZWlyIG90aGVyIHNpZGVzXG4jIGZpbGxlZCBpbiBvbmUgd2F5IG9yIGFub3RoZXIsIGRlcGVuZGluZyBvbiB3aGV0aGVyIHRoZSBhZGphY2VudCBmYWNlIGlzXG4jIHdoaXJsZWQgb3Igbm90LlxuXG53aGlybCA9IChwb2x5LCBuKSAtPlxuXG4gICAga2xvZyBcIndoaXJsIG9mICN7cG9seS5uYW1lfVwiXG4gICAgbiA/PSAwXG4gICAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgIyBlYWNoIG9sZCB2ZXJ0ZXggaXMgYSBuZXcgdmVydGV4XG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgZmxhZy5uZXdWIFwidiN7aX1cIiB1bml0IHBvbHkudmVydGljZXNbaV1cblxuICAgICMgbmV3IHZlcnRpY2VzIGFyb3VuZCBjZW50ZXIgb2YgZWFjaCBmYWNlXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSgtMilcbiAgICAgICAgZm9yIGogaW4gWzAuLi5mLmxlbmd0aF1cbiAgICAgICAgICAgIHYgPSBmW2pdXG4gICAgICAgICAgICB2MyA9IHZcbiAgICAgICAgICAgICMgTmV3IHZlcnRleCBhbG9uZyBlZGdlXG4gICAgICAgICAgICB2MV8yID0gb25lVGhpcmQocG9seS52ZXJ0aWNlc1t2MV0scG9seS52ZXJ0aWNlc1t2Ml0pXG4gICAgICAgICAgICBmbGFnLm5ld1YodjErXCJ+XCIrdjIsIHYxXzIpXG4gICAgICAgICAgICAjIE5ldyB2ZXJ0aWNlcyBuZWFyIGNlbnRlciBvZiBmYWNlXG4gICAgICAgICAgICBjdjFuYW1lID0gXCJjZW50ZXIje2l9fiN7djF9XCJcbiAgICAgICAgICAgIGN2Mm5hbWUgPSBcImNlbnRlciN7aX1+I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy5uZXdWKGN2MW5hbWUsIHVuaXQob25lVGhpcmQoY2VudGVyc1tpXSwgdjFfMikpKVxuICAgICAgICAgICAgZm5hbWUgPSBpK1wiZlwiK3YxXG4gICAgICAgICAgICAjIE5ldyBoZXhhZ29uIGZvciBlYWNoIG9yaWdpbmFsIGVkZ2VcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgY3YxbmFtZSwgICB2MStcIn5cIit2MilcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgdjErXCJ+XCIrdjIsIHYyK1wiflwiK3YxKSAjKlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCB2MitcIn5cIit2MSwgXCJ2I3t2Mn1cIikgICMqXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsIFwidiN7djJ9XCIsICB2MitcIn5cIit2MykgIypcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgdjIrXCJ+XCIrdjMsIGN2Mm5hbWUpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsIGN2Mm5hbWUsICAgY3YxbmFtZSlcbiAgICAgICAgICAgICMgTmV3IGZhY2UgaW4gY2VudGVyIG9mIGVhY2ggb2xkIGZhY2UgICAgICBcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImMje2l9XCIsIGN2MW5hbWUsIGN2Mm5hbWUpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M10gIyBzaGlmdCBvdmVyIG9uZVxuICBcbiAgICBmbGFnLnRvcG9seSBcIncje3BvbHkubmFtZX1cIlxuXG4jICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiMgMDAwIDAwIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuIyAgMDAwMDAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICBcblxucXVpbnRvID0gKHBvbHkpIC0+ICMgY3JlYXRlcyBhIHBlbnRhZ29uIGZvciBldmVyeSBwb2ludCBpbiB0aGUgb3JpZ2luYWwgZmFjZSwgYXMgd2VsbCBhcyBvbmUgbmV3IGluc2V0IGZhY2UuXG4gICAgXG4gICAgIyBrbG9nIFwicXVpbnRvIG9mICN7cG9seS5uYW1lfVwiXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgIyBGb3IgZWFjaCBmYWNlIGYgaW4gdGhlIG9yaWdpbmFsIHBvbHlcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBjZW50cm9pZCA9IGNhbGNDZW50cm9pZCBmLm1hcCAoaWR4KSAtPiBwb2x5LnZlcnRpY2VzW2lkeF1cbiAgICAgICAgIyB3YWxrIG92ZXIgZmFjZSB2ZXJ0ZXgtdHJpcGxldHNcbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlIC0yXG4gICAgICAgIGZvciB2MyBpbiBmXG4gICAgICAgICAgICAjIGZvciBlYWNoIGZhY2UtY29ybmVyLCB3ZSBtYWtlIHR3byBuZXcgcG9pbnRzOlxuICAgICAgICAgICAgbWlkcHQgPSBtaWRwb2ludCBwb2x5LnZlcnRpY2VzW3YxXSwgcG9seS52ZXJ0aWNlc1t2Ml1cbiAgICAgICAgICAgIGlubmVycHQgPSBtaWRwb2ludCBtaWRwdCwgY2VudHJvaWRcbiAgICAgICAgICAgIGZsYWcubmV3ViBtaWROYW1lKHYxLHYyKSwgbWlkcHRcbiAgICAgICAgICAgIGZsYWcubmV3ViBcImlubmVyXyN7aX1fXCIgKyBtaWROYW1lKHYxLHYyKSwgaW5uZXJwdFxuICAgICAgICAgICAgIyBhbmQgYWRkIHRoZSBvbGQgY29ybmVyLXZlcnRleFxuICAgICAgICAgICAgZmxhZy5uZXdWIFwiI3t2Mn1cIiBwb2x5LnZlcnRpY2VzW3YyXVxuICAgICAgICAgIFxuICAgICAgICAgICAgIyBwZW50YWdvbiBmb3IgZWFjaCB2ZXJ0ZXggaW4gb3JpZ2luYWwgZmFjZVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKFwiZiN7aX1fI3t2Mn1cIiwgXCJpbm5lcl8je2l9X1wiK21pZE5hbWUodjEsIHYyKSwgbWlkTmFtZSh2MSwgdjIpKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKFwiZiN7aX1fI3t2Mn1cIiwgbWlkTmFtZSh2MSwgdjIpLCBcIiN7djJ9XCIpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoXCJmI3tpfV8je3YyfVwiLCBcIiN7djJ9XCIsIG1pZE5hbWUodjIsIHYzKSlcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImYje2l9XyN7djJ9XCIsIG1pZE5hbWUodjIsIHYzKSwgXCJpbm5lcl8je2l9X1wiK21pZE5hbWUodjIsIHYzKSlcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImYje2l9XyN7djJ9XCIsIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYyLCB2MyksIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYxLCB2MikpXG4gICAgICBcbiAgICAgICAgICAgICMgaW5uZXIgcm90YXRlZCBmYWNlIG9mIHNhbWUgdmVydGV4LW51bWJlciBhcyBvcmlnaW5hbFxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKFwiZl9pbl8je2l9XCIsIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYxLCB2MiksIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYyLCB2MykpXG4gICAgICBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M10gIyBzaGlmdCBvdmVyIG9uZVxuICBcbiAgICBmbGFnLnRvcG9seSBcInEje3BvbHkubmFtZX1cIlxuXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMFxuIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICBcbiMgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgXG4jIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAwMDAgICBcblxuaW5zZXQgPSAocG9seSwgbiwgaW5zZXRfZGlzdCwgcG9wb3V0X2Rpc3QpIC0+XG5cbiAgICBuID89IDBcbiAgICBpbnNldF9kaXN0ID89IDAuNVxuICAgIHBvcG91dF9kaXN0ID89IC0wLjJcbiAgXG4gICAga2xvZyBcImluc2V0IG9mICN7biBhbmQgXCIje259LXNpZGVkXCIgb3IgJ2FsbCd9IGZhY2VzIG9mICN7cG9seS5uYW1lfVwiXG4gIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgIyBlYWNoIG9sZCB2ZXJ0ZXggaXMgYSBuZXcgdmVydGV4XG4gICAgICAgIHAgPSBwb2x5LnZlcnRpY2VzW2ldXG4gICAgICAgIGZsYWcubmV3ViBcInYje2l9XCIgcFxuXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF0gIyBuZXcgaW5zZXQgdmVydGV4IGZvciBldmVyeSB2ZXJ0IGluIGZhY2VcbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgaWYgZi5sZW5ndGggPT0gbiBvciBuID09IDBcbiAgICAgICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgICAgICBmbGFnLm5ld1YgXCJmI3tpfXYje3Z9XCIgYWRkIHR3ZWVuKHBvbHkudmVydGljZXNbdl0sY2VudGVyc1tpXSxpbnNldF9kaXN0KSwgbXVsdChwb3BvdXRfZGlzdCxub3JtYWxzW2ldKVxuICBcbiAgICBmb3VuZEFueSA9IGZhbHNlICMgYWxlcnQgaWYgZG9uJ3QgZmluZCBhbnlcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MiA9IFwidiN7dn1cIjtcbiAgICAgICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICAgICAgZm91bmRBbnkgPSB0cnVlXG4gICAgICAgICAgICAgICAgZm5hbWUgPSBpICsgdjFcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsICAgICAgdjEsICAgICAgIHYyKVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgICAgICB2MiwgICAgICAgXCJmI3tpfSN7djJ9XCIpXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCBcImYje2l9I3t2Mn1cIiwgIFwiZiN7aX0je3YxfVwiKVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgXCJmI3tpfSN7djF9XCIsICB2MSlcbiAgICAgICAgICAgICAgICAjIG5ldyBpbnNldCwgZXh0cnVkZWQgZmFjZVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImV4I3tpfVwiLCBcImYje2l9I3t2MX1cIiwgIFwiZiN7aX0je3YyfVwiKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyhpLCB2MSwgdjIpICAjIHNhbWUgb2xkIGZsYWcsIGlmIG5vbi1uXG4gICAgICAgICAgICB2MT12MiAjIGN1cnJlbnQgYmVjb21lcyBwcmV2aW91c1xuICBcbiAgICBpZiBub3QgZm91bmRBbnlcbiAgICAgICAga2xvZyBcIk5vICN7bn0tZm9sZCBjb21wb25lbnRzIHdlcmUgZm91bmQuXCJcbiAgXG4gICAgZmxhZy50b3BvbHkgXCJuI3tufSN7cG9seS5uYW1lfVwiXG5cbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG5cbmV4dHJ1ZGUgPSAocG9seSwgbikgLT5cbiAgICBuZXdwb2x5ID0gaW5zZXQgcG9seSwgbiwgMC4wLCAwLjNcbiAgICBuZXdwb2x5Lm5hbWUgPSBcIngje259I3twb2x5Lm5hbWV9XCJcbiAgICBuZXdwb2x5XG5cbiMgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAgICAgICAgMDAwICAgICBcbiMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcblxubG9mdCA9IChwb2x5LCBuLCBhbHBoYSkgLT5cbiAgICBuZXdwb2x5ID0gaW5zZXQgcG9seSwgbiwgYWxwaGEsIDAuMFxuICAgIG5ld3BvbHkubmFtZSA9IFwibCN7bn0je3BvbHkubmFtZX1cIlxuICAgIG5ld3BvbHlcblxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIFxuXG5ob2xsb3cgPSAocG9seSwgaW5zZXRfZGlzdCwgdGhpY2tuZXNzKSAtPlxuXG4gICAgaW5zZXRfZGlzdCA/PSAwLjVcbiAgICB0aGlja25lc3MgPz0gMC4yXG4gIFxuICAgIGtsb2cgXCJob2xsb3cgI3twb2x5Lm5hbWV9XCJcbiAgXG4gICAgZHVhbG5vcm1hbHMgPSBkdWFsKHBvbHkpLm5vcm1hbHMoKVxuICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgICMgZWFjaCBvbGQgdmVydGV4IGlzIGEgbmV3IHZlcnRleFxuICAgICAgICBwID0gcG9seS52ZXJ0aWNlc1tpXVxuICAgICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHBcbiAgICAgICAgZmxhZy5uZXdWIFwiZG93bnYje2l9XCIgYWRkIHAsIG11bHQgLTEqdGhpY2tuZXNzLGR1YWxub3JtYWxzW2ldXG5cbiAgICAjIG5ldyBpbnNldCB2ZXJ0ZXggZm9yIGV2ZXJ5IHZlcnQgaW4gZmFjZVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIGZsYWcubmV3ViBcImZpbiN7aX12I3t2fVwiIHR3ZWVuIHBvbHkudmVydGljZXNbdl0sIGNlbnRlcnNbaV0sIGluc2V0X2Rpc3RcbiAgICAgICAgICAgIGZsYWcubmV3ViBcImZpbmRvd24je2l9diN7dn1cIiBhZGQgdHdlZW4ocG9seS52ZXJ0aWNlc1t2XSxjZW50ZXJzW2ldLGluc2V0X2Rpc3QpLCBtdWx0KC0xKnRoaWNrbmVzcyxub3JtYWxzW2ldKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MiA9IFwidiN7dn1cIlxuICAgICAgICAgICAgZm5hbWUgPSBpICsgdjFcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgdjEsICAgICAgICAgICAgdjJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgdjIsICAgICAgICAgICAgXCJmaW4je2l9I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBcImZpbiN7aX0je3YyfVwiIFwiZmluI3tpfSN7djF9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgXCJmaW4je2l9I3t2MX1cIiB2MVxuICAgICAgXG4gICAgICAgICAgICBmbmFtZSA9IFwic2lkZXMje2l9I3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBcImZpbiN7aX0je3YxfVwiICAgICBcImZpbiN7aX0je3YyfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIFwiZmluI3tpfSN7djJ9XCIgICAgIFwiZmluZG93biN7aX0je3YyfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIFwiZmluZG93biN7aX0je3YyfVwiIFwiZmluZG93biN7aX0je3YxfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIFwiZmluZG93biN7aX0je3YxfVwiIFwiZmluI3tpfSN7djF9XCJcbiAgICAgIFxuICAgICAgICAgICAgZm5hbWUgPSBcImJvdHRvbSN7aX0je3YxfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsICBcImRvd24je3YyfVwiICAgICAgICBcImRvd24je3YxfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsICBcImRvd24je3YxfVwiICAgICAgICBcImZpbmRvd24je2l9I3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCAgXCJmaW5kb3duI3tpfSN7djF9XCIgXCJmaW5kb3duI3tpfSN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgIFwiZmluZG93biN7aX0je3YyfVwiIFwiZG93biN7djJ9XCJcbiAgICAgIFxuICAgICAgICAgICAgdjEgPSB2MiAjIGN1cnJlbnQgYmVjb21lcyBwcmV2aW91c1xuICBcbiAgICBmbGFnLnRvcG9seSBcIkgje3BvbHkubmFtZX1cIlxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMDAwXG4jIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcbiMgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMCAgICAgIDAwMCAgIDAwMFxuXG5wZXJzcGVjdGl2YSA9IChwb2x5KSAtPiAjIGFuIG9wZXJhdGlvbiByZXZlcnNlLWVuZ2luZWVyZWQgZnJvbSBQZXJzcGVjdGl2YSBDb3Jwb3J1bSBSZWd1bGFyaXVtXG5cbiAgICAjIGtsb2cgXCJzdGVsbGEgb2YgI3twb2x5Lm5hbWV9XCJcbiAgXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpICMgY2FsY3VsYXRlIGZhY2UgY2VudGVyc1xuICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgIGZsYWcubmV3ViBcInYje2l9XCIgcG9seS52ZXJ0aWNlc1tpXVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBcbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMl19XCJcbiAgICAgICAgdjIgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgdmVydDEgPSBwb2x5LnZlcnRpY2VzW2ZbZi5sZW5ndGgtMl1dXG4gICAgICAgIHZlcnQyID0gcG9seS52ZXJ0aWNlc1tmW2YubGVuZ3RoLTFdXVxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MyA9IFwidiN7dn1cIlxuICAgICAgICAgICAgdmVydDMgPSBwb2x5LnZlcnRpY2VzW3ZdXG4gICAgICAgICAgICB2MTIgPSB2MStcIn5cIit2MlxuICAgICAgICAgICAgdjIxID0gdjIrXCJ+XCIrdjFcbiAgICAgICAgICAgIHYyMyA9IHYyK1wiflwiK3YzXG4gICAgICBcbiAgICAgICAgICAgICMgb24gZWFjaCBOZmFjZSwgTiBuZXcgcG9pbnRzIGluc2V0IGZyb20gZWRnZSBtaWRwb2ludHMgdG93YXJkcyBjZW50ZXIgPSBcInN0ZWxsYXRlZFwiIHBvaW50c1xuICAgICAgICAgICAgZmxhZy5uZXdWIHYxMiwgbWlkcG9pbnQgbWlkcG9pbnQodmVydDEsdmVydDIpLCBjZW50ZXJzW2ldIFxuICAgICAgXG4gICAgICAgICAgICAjIGluc2V0IE5mYWNlIG1hZGUgb2YgbmV3LCBzdGVsbGF0ZWQgcG9pbnRzXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJpbiN7aX1cIiB2MTIsIHYyM1xuICAgICAgXG4gICAgICAgICAgICAjIG5ldyB0cmkgZmFjZSBjb25zdGl0dXRpbmcgdGhlIHJlbWFpbmRlciBvZiB0aGUgc3RlbGxhdGVkIE5mYWNlXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmI3tpfSN7djJ9XCIgdjIzLCB2MTJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImYje2l9I3t2Mn1cIiB2MTIsIHYyXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmI3tpfSN7djJ9XCIgdjIsICB2MjNcbiAgICAgIFxuICAgICAgICAgICAgIyBvbmUgb2YgdGhlIHR3byBuZXcgdHJpYW5nbGVzIHJlcGxhY2luZyBvbGQgZWRnZSBiZXR3ZWVuIHYxLT52MlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiZiN7djEyfVwiIHYxLCAgdjIxXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmI3t2MTJ9XCIgdjIxLCB2MTJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImYje3YxMn1cIiB2MTIsIHYxXG4gICAgICBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M10gICMgY3VycmVudCBiZWNvbWVzIHByZXZpb3VzXG4gICAgICAgICAgICBbdmVydDEsIHZlcnQyXSA9IFt2ZXJ0MiwgdmVydDNdXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiUCN7cG9seS5uYW1lfVwiXG5cbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcblxudHJpc3ViID0gKHBvbHksIG4pIC0+XG4gICAgXG4gICAga2xvZyBcInRyaXN1YiBvZiAje3BvbHkubmFtZX1cIlxuICAgIFxuICAgIG4gPz0gMlxuICAgIFxuICAgICMgTm8tT3AgZm9yIG5vbi10cmlhbmd1bGFyIG1lc2hlc1xuICAgIGZvciBmbiBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBpZiBwb2x5LmZhY2VzW2ZuXS5sZW5ndGggIT0gM1xuICAgICAgICAgICAgcmV0dXJuIHBvbHlcbiAgXG4gICAgIyBDYWxjdWxhdGUgcmVkdW5kYW50IHNldCBvZiBuZXcgdmVydGljZXMgZm9yIHN1YmRpdmlkZWQgbWVzaC5cbiAgICBuZXdWcyA9IFtdXG4gICAgdm1hcCA9IHt9XG4gICAgcG9zID0gMFxuICAgIGZvciBmbiBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tmbl1cbiAgICAgICAgW2kxLCBpMiwgaTNdID0gZi5zbGljZSAtM1xuICAgICAgICB2MSA9IHBvbHkudmVydGljZXNbaTFdXG4gICAgICAgIHYyID0gcG9seS52ZXJ0aWNlc1tpMl1cbiAgICAgICAgdjMgPSBwb2x5LnZlcnRpY2VzW2kzXVxuICAgICAgICB2MjEgPSBzdWIgdjIsIHYxXG4gICAgICAgIHYzMSA9IHN1YiB2MywgdjFcbiAgICAgICAgZm9yIGkgaW4gWzAuLm5dXG4gICAgICAgICAgICBmb3IgaiBpbiBbMC4ubi1pXVxuICAgICAgICAgICAgICAgIHYgPSBhZGQgYWRkKHYxLCBtdWx0KGkgKiAxLjAgLyBuLCB2MjEpKSwgbXVsdChqICogMS4wIC8gbiwgdjMxKVxuICAgICAgICAgICAgICAgIHZtYXBbXCJ2I3tmbn0tI3tpfS0je2p9XCJdID0gcG9zKytcbiAgICAgICAgICAgICAgICBuZXdWcy5wdXNoIHZcbiAgXG4gICAgIyBUaGUgYWJvdmUgdmVydGljZXMgYXJlIHJlZHVuZGFudCBhbG9uZyBvcmlnaW5hbCBlZGdlcywgXG4gICAgIyB3ZSBuZWVkIHRvIGJ1aWxkIGFuIGluZGV4IG1hcCBpbnRvIGEgdW5pcXVlaWZpZWQgbGlzdCBvZiB0aGVtLlxuICAgICMgV2UgaWRlbnRpZnkgdmVydGljZXMgdGhhdCBhcmUgY2xvc2VyIHRoYW4gYSBjZXJ0YWluIGVwc2lsb24gZGlzdGFuY2UuXG4gICAgRVBTSUxPTl9DTE9TRSA9IDEuMGUtOFxuICAgIHVuaXFWcyA9IFtdXG4gICAgbmV3cG9zID0gMFxuICAgIHVuaXFtYXAgPSB7fVxuICAgIGZvciBbaSwgdl0gaW4gbmV3VnMuZW50cmllcygpXG4gICAgICAgIGlmIGkgaW4gdW5pcW1hcCB0aGVuIGNvbnRpbnVlICMgYWxyZWFkeSBtYXBwZWRcbiAgICAgICAgdW5pcW1hcFtpXSA9IG5ld3Bvc1xuICAgICAgICB1bmlxVnMucHVzaCB2XG4gICAgICAgIGZvciBqIGluIFtpKzEuLi5uZXdWcy5sZW5ndGhdXG4gICAgICAgICAgICB3ID0gbmV3VnNbal1cbiAgICAgICAgICAgIGlmIG1hZyhzdWIodiwgdykpIDwgRVBTSUxPTl9DTE9TRVxuICAgICAgICAgICAgICAgIHVuaXFtYXBbal0gPSBuZXdwb3NcbiAgICAgICAgbmV3cG9zKytcbiAgXG4gICAgZmFjZXMgPSBbXVxuICAgIGZvciBmbiBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmb3IgaSBpbiBbMC4uLm5dXG4gICAgICAgICAgICBmb3IgaiBpbiBbMC4uLm4taV1cbiAgICAgICAgICAgICAgICBmYWNlcy5wdXNoIFt1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2p9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aSsxfS0je2p9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqKzF9XCJdXV1cbiAgICAgICAgZm9yIGkgaW4gWzEuLi5uXVxuICAgICAgICAgICAgZm9yIGogaW4gWzAuLi5uLWldXG4gICAgICAgICAgICAgICAgZmFjZXMucHVzaCBbdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2l9LSN7aisxfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2ktMX0tI3tqKzF9XCJdXV1cbiAgXG4gICAgbmV3IFBvbHloZWRyb24gXCJ1I3tufSN7cG9seS5uYW1lfVwiIGZhY2VzLCB1bmlxVnNcblxuIyBjb21iaW5lcyBhYm92ZSB0aHJlZSBjb25zdHJhaW50IGFkanVzdG1lbnRzIGluIGl0ZXJhdGl2ZSBjeWNsZVxuY2Fub25pY2FsaXplID0gKHBvbHksIE5pdGVyKSAtPlxuXG4gICAgTml0ZXIgPz0gMVxuICAgICMga2xvZyBcImNhbm9uaWNhbGl6ZSAje3BvbHkubmFtZX1cIlxuICAgIGZhY2VzID0gcG9seS5mYWNlc1xuICAgIGVkZ2VzID0gcG9seS5lZGdlcygpXG4gICAgbmV3VnMgPSBwb2x5LnZlcnRpY2VzXG4gICAgbWF4Q2hhbmdlID0gMS4wICMgY29udmVyZ2VuY2UgdHJhY2tlclxuICAgIGZvciBpIGluIFswLi5OaXRlcl1cbiAgICAgICAgb2xkVnMgPSBjb3B5VmVjQXJyYXkgbmV3VnMgI2NvcHkgdmVydGljZXNcbiAgICAgICAgbmV3VnMgPSB0YW5nZW50aWZ5IG5ld1ZzLCBlZGdlc1xuICAgICAgICBuZXdWcyA9IHJlY2VudGVyIG5ld1ZzLCBlZGdlc1xuICAgICAgICBuZXdWcyA9IHBsYW5hcml6ZSBuZXdWcywgZmFjZXNcbiAgICAgICAgbWF4Q2hhbmdlID0gXy5tYXggXy5tYXAgXy56aXAobmV3VnMsIG9sZFZzKSwgKFt4LCB5XSkgLT4gbWFnIHN1YiB4LCB5XG4gICAgICAgIGlmIG1heENoYW5nZSA8IDFlLThcbiAgICAgICAgICAgIGJyZWFrXG4gICAgIyBvbmUgc2hvdWxkIG5vdyByZXNjYWxlLCBidXQgbm90IHJlc2NhbGluZyBoZXJlIG1ha2VzIGZvciB2ZXJ5IGludGVyZXN0aW5nIG51bWVyaWNhbFxuICAgICMgaW5zdGFiaWxpdGllcyB0aGF0IG1ha2UgaW50ZXJlc3RpbmcgbXV0YW50cyBvbiBtdWx0aXBsZSBhcHBsaWNhdGlvbnMuLi5cbiAgICAjIG1vcmUgZXhwZXJpZW5jZSB3aWxsIHRlbGwgd2hhdCB0byBkb1xuICAgICNuZXdWcyA9IHJlc2NhbGUobmV3VnMpXG4gICAgIyBrbG9nIFwiW2Nhbm9uaWNhbGl6YXRpb24gZG9uZSwgbGFzdCB8ZGVsdGFWfD0je21heENoYW5nZX1dXCJcbiAgICBuZXdwb2x5ID0gbmV3IFBvbHloZWRyb24gcG9seS5uYW1lLCBwb2x5LmZhY2VzLCBuZXdWc1xuICAgICMga2xvZyBcImNhbm9uaWNhbGl6ZVwiIG5ld3BvbHlcbiAgICBuZXdwb2x5XG4gICAgXG5jYW5vbmljYWxYWVogPSAocG9seSwgbkl0ZXJhdGlvbnMpIC0+XG5cbiAgICBuSXRlcmF0aW9ucyA/PSAxXG4gICAgZHBvbHkgPSBkdWFsIHBvbHlcbiAgICAjIGtsb2cgXCJjYW5vbmljYWxYWVogI3twb2x5Lm5hbWV9XCJcbiAgXG4gICAgZm9yIGNvdW50IGluIFswLi4ubkl0ZXJhdGlvbnNdICMgcmVjaXByb2NhdGUgZmFjZSBub3JtYWxzXG4gICAgICAgIGRwb2x5LnZlcnRpY2VzID0gcmVjaXByb2NhbE4gcG9seVxuICAgICAgICBwb2x5LnZlcnRpY2VzICA9IHJlY2lwcm9jYWxOIGRwb2x5XG4gIFxuICAgIG5ldyBQb2x5aGVkcm9uIHBvbHkubmFtZSwgcG9seS5mYWNlcywgcG9seS52ZXJ0aWNlc1xuXG5mbGF0dGVuID0gKHBvbHksIG5JdGVyYXRpb25zKSAtPiAjIHF1aWNrIHBsYW5hcml6YXRpb25cbiAgICBcbiAgICBuSXRlcmF0aW9ucyA/PSAxXG4gICAgZHBvbHkgPSBkdWFsIHBvbHkgIyB2J3Mgb2YgZHVhbCBhcmUgaW4gb3JkZXIgb2YgYXJnJ3MgZidzXG4gICAgIyBrbG9nIFwiZmxhdHRlbiAje3BvbHkubmFtZX1cIlxuICBcbiAgICBmb3IgY291bnQgaW4gWzAuLi5uSXRlcmF0aW9uc10gIyByZWNpcHJvY2F0ZSBmYWNlIGNlbnRlcnNcbiAgICAgICAgZHBvbHkudmVydGljZXMgPSByZWNpcHJvY2FsQyBwb2x5XG4gICAgICAgIHBvbHkudmVydGljZXMgID0gcmVjaXByb2NhbEMgZHBvbHlcbiAgXG4gICAgbmV3IFBvbHloZWRyb24gcG9seS5uYW1lLCBwb2x5LmZhY2VzLCBwb2x5LnZlcnRpY2VzXG4gICAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcblxubW9kdWxlLmV4cG9ydHMgPVxuICAgIGR1YWw6ICAgICAgICAgICBkdWFsXG4gICAgdHJpc3ViOiAgICAgICAgIHRyaXN1YlxuICAgIHBlcnNwZWN0aXZhOiAgICBwZXJzcGVjdGl2YVxuICAgIGtpczogICAgICAgICAgICBraXNcbiAgICBhbWJvOiAgICAgICAgICAgYW1ib1xuICAgIGd5cm86ICAgICAgICAgICBneXJvXG4gICAgcmVmbGVjdDogICAgICAgIHJlZmxlY3RcbiAgICBjaGFtZmVyOiAgICAgICAgY2hhbWZlclxuICAgIHdoaXJsOiAgICAgICAgICB3aGlybFxuICAgIHF1aW50bzogICAgICAgICBxdWludG9cbiAgICBpbnNldDogICAgICAgICAgaW5zZXRcbiAgICBleHRydWRlOiAgICAgICAgZXh0cnVkZVxuICAgIGxvZnQ6ICAgICAgICAgICBsb2Z0XG4gICAgaG9sbG93OiAgICAgICAgIGhvbGxvd1xuICAgIGZsYXR0ZW46ICAgICAgICBmbGF0dGVuXG4gICAgY2Fub25pY2FsaXplOiAgIGNhbm9uaWNhbGl6ZVxuICAgIGNhbm9uaWNhbFhZWjogICBjYW5vbmljYWxYWVpcbiAgICAiXX0=
//# sourceURL=../../coffee/poly/topo.coffee