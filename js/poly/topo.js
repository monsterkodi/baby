// koffee 1.6.0

/*
000000000   0000000   00000000    0000000     
   000     000   000  000   000  000   000    
   000     000   000  00000000   000   000    
   000     000   000  000        000   000    
   000      0000000   000         0000000
 */
var Flag, Polyhedron, _, abs, add, ambo, calcCentroid, canonicalXYZ, canonicalize, chamfer, copyVecArray, cross, dual, extrude, flatten, gyro, hollow, inset, intersect, kis, klog, mag, midName, midpoint, mult, oneThird, perspectiva, planarize, quinto, rayPlane, recenter, reciprocalC, reciprocalN, ref, ref1, ref2, reflect, rescale, sub, tangentify, trisub, tween, unit, whirl, zirkularize,
    indexOf = [].indexOf;

ref = require('kxk'), klog = ref.klog, _ = ref._;

ref1 = require('./math'), add = ref1.add, mult = ref1.mult, mag = ref1.mag, sub = ref1.sub, unit = ref1.unit, cross = ref1.cross, oneThird = ref1.oneThird, tween = ref1.tween, intersect = ref1.intersect, rayPlane = ref1.rayPlane, midpoint = ref1.midpoint, calcCentroid = ref1.calcCentroid, copyVecArray = ref1.copyVecArray;

ref2 = require('./geo'), tangentify = ref2.tangentify, reciprocalC = ref2.reciprocalC, reciprocalN = ref2.reciprocalN, recenter = ref2.recenter, rescale = ref2.rescale, planarize = ref2.planarize;

abs = Math.abs;

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

chamfer = function(poly, dist) {
    var f, facename, flag, i, l, len, m, normals, ref3, v1, v1new, v2, v2new;
    if (dist == null) {
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
            facename = v1 < v2 && ("hex" + v1 + "_" + v2) || ("hex" + v2 + "_" + v1);
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
        iter = 100;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9wby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsaVlBQUE7SUFBQTs7QUF3QkEsTUFBYyxPQUFBLENBQVEsS0FBUixDQUFkLEVBQUUsZUFBRixFQUFROztBQUNSLE9BQW1ILE9BQUEsQ0FBUSxRQUFSLENBQW5ILEVBQUUsY0FBRixFQUFPLGdCQUFQLEVBQWEsY0FBYixFQUFrQixjQUFsQixFQUF1QixnQkFBdkIsRUFBNkIsa0JBQTdCLEVBQW9DLHdCQUFwQyxFQUE4QyxrQkFBOUMsRUFBcUQsMEJBQXJELEVBQWdFLHdCQUFoRSxFQUEwRSx3QkFBMUUsRUFBb0YsZ0NBQXBGLEVBQWtHOztBQUNsRyxPQUF5RSxPQUFBLENBQVEsT0FBUixDQUF6RSxFQUFFLDRCQUFGLEVBQWMsOEJBQWQsRUFBMkIsOEJBQTNCLEVBQXdDLHdCQUF4QyxFQUFrRCxzQkFBbEQsRUFBMkQ7O0FBQ3pELE1BQVE7O0FBQ1YsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztBQUNQLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7QUFFYixPQUFBLEdBQVUsU0FBQyxFQUFELEVBQUssRUFBTDtXQUFZLEVBQUEsR0FBRyxFQUFILElBQVUsQ0FBRyxFQUFELEdBQUksR0FBSixHQUFPLEVBQVQsQ0FBVixJQUEyQixDQUFHLEVBQUQsR0FBSSxHQUFKLEdBQU8sRUFBVDtBQUF2Qzs7QUFRVixXQUFBLEdBQWMsU0FBQyxJQUFELEVBQU8sQ0FBUDtBQUVWLFFBQUE7O1FBQUE7O1FBQUEsSUFBSzs7SUFDTCxRQUFBLEdBQVc7QUFFWCxTQUFTLCtGQUFUO1FBQ0ksQ0FBQSxHQUFJLElBQUksQ0FBQyxLQUFNLENBQUEsQ0FBQTtRQUNmLElBQUcsQ0FBQyxDQUFDLE1BQUYsS0FBWSxDQUFaLElBQWlCLENBQUEsS0FBSyxDQUF6QjtZQUNJLE9BQVcsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxDQUFDLENBQVQsQ0FB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b3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgICBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgICBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgICBcbiAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAwMDAwMDAwICAgICBcbiMjI1xuI1xuIyBQb2x5aMOpZHJvbmlzbWUsIENvcHlyaWdodCAyMDE5LCBBbnNlbG0gTGV2c2theWEsIE1JVCBMaWNlbnNlXG4jXG4jIFBvbHloZWRyb24gT3BlcmF0b3JzXG4jXG4jIGZvciBlYWNoIHZlcnRleCBvZiBuZXcgcG9seWhlZHJvblxuIyAgICAgY2FsbCBuZXdWKFZuYW1lLCB4eXopIHdpdGggYSBzeW1ib2xpYyBuYW1lIGFuZCBjb29yZGluYXRlc1xuI1xuIyBmb3IgZWFjaCBmbGFnIG9mIG5ldyBwb2x5aGVkcm9uXG4jICAgICBjYWxsIG5ld0ZsYWcoRm5hbWUsIFZuYW1lMSwgVm5hbWUyKSB3aXRoIGEgc3ltYm9saWMgbmFtZSBmb3IgdGhlIG5ldyBmYWNlXG4jICAgICBhbmQgdGhlIHN5bWJvbGljIG5hbWUgZm9yIHR3byB2ZXJ0aWNlcyBmb3JtaW5nIGFuIG9yaWVudGVkIGVkZ2VcbiNcbiMgT3JpZW50YXRpb24gbXVzdCBiZSBkZWFsdCB3aXRoIHByb3Blcmx5IHRvIG1ha2UgYSBtYW5pZm9sZCBtZXNoXG4jIFNwZWNpZmljYWxseSwgbm8gZWRnZSB2MS0+djIgY2FuIGV2ZXIgYmUgY3Jvc3NlZCBpbiB0aGUgc2FtZSBkaXJlY3Rpb24gYnkgdHdvIGRpZmZlcmVudCBmYWNlc1xuIyBjYWxsIHRvcG9seSgpIHRvIGFzc2VtYmxlIGZsYWdzIGludG8gcG9seWhlZHJvbiBzdHJ1Y3R1cmUgYnkgZm9sbG93aW5nIHRoZSBvcmJpdHNcbiMgb2YgdGhlIHZlcnRleCBtYXBwaW5nIHN0b3JlZCBpbiB0aGUgZmxhZ3NldCBmb3IgZWFjaCBuZXcgZmFjZVxuXG57IGtsb2csIF8gfSA9IHJlcXVpcmUgJ2t4aydcbnsgYWRkLCBtdWx0LCBtYWcsIHN1YiwgdW5pdCwgY3Jvc3MsIG9uZVRoaXJkLCB0d2VlbiwgaW50ZXJzZWN0LCByYXlQbGFuZSwgbWlkcG9pbnQsIGNhbGNDZW50cm9pZCwgY29weVZlY0FycmF5IH0gPSByZXF1aXJlICcuL21hdGgnXG57IHRhbmdlbnRpZnksIHJlY2lwcm9jYWxDLCByZWNpcHJvY2FsTiwgcmVjZW50ZXIsIHJlc2NhbGUsIHBsYW5hcml6ZSB9ID0gcmVxdWlyZSAnLi9nZW8nXG57IGFicyB9ID0gTWF0aFxuRmxhZyA9IHJlcXVpcmUgJy4vZmxhZydcblBvbHloZWRyb24gPSByZXF1aXJlICcuL3BvbHloZWRyb24nXG5cbm1pZE5hbWUgPSAodjEsIHYyKSAtPiB2MTx2MiBhbmQgXCIje3YxfV8je3YyfVwiIG9yIFwiI3t2Mn1fI3t2MX1cIiAjIHVuaXF1ZSBuYW1lcyBvZiBtaWRwb2ludHNcblxuIyAwMDAwMDAwICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4jICAgMDAwICAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuIyAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbnppcmt1bGFyaXplID0gKHBvbHksIG4pIC0+XG4gICAgXG4gICAgbiA/PSAwXG4gICAgdmVydGljZXMgPSBbXVxuICAgIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UgLTJcbiAgICAgICAgICAgIGZvciB2MyBpbiBmXG4gICAgICAgICAgICAgICAgdjEyID0gc3ViIHBvbHkudmVydGljZXNbdjJdLCBwb2x5LnZlcnRpY2VzW3YxXVxuICAgICAgICAgICAgICAgIHYzMiA9IHN1YiBwb2x5LnZlcnRpY2VzW3YyXSwgcG9seS52ZXJ0aWNlc1t2M11cbiAgICAgICAgICAgICAgICBpZiBhYnMobWFnKHYxMikgLSBtYWcodjMyKSkgPiAwLjAwMVxuICAgICAgICAgICAgICAgICAgICBtMTIgPSBtaWRwb2ludCBwb2x5LnZlcnRpY2VzW3YxXSwgcG9seS52ZXJ0aWNlc1t2Ml1cbiAgICAgICAgICAgICAgICAgICAgbTMyID0gbWlkcG9pbnQgcG9seS52ZXJ0aWNlc1t2M10sIHBvbHkudmVydGljZXNbdjJdXG4gICAgICAgICAgICAgICAgICAgIHUxMiA9IHVuaXQgbTEyXG4gICAgICAgICAgICAgICAgICAgIHUzMiA9IHVuaXQgbTMyXG4gICAgICAgICAgICAgICAgICAgIG5jID0gYWRkIHUxMiwgdTMyXG4gICAgICAgICAgICAgICAgICAgIHBuID0gY3Jvc3MgbmMsIGNyb3NzIHBvbHkudmVydGljZXNbdjFdLCBwb2x5LnZlcnRpY2VzW3YzXVxuICAgICAgICAgICAgICAgICAgICBpZiBtYWcodjEyKSA+IG1hZyh2MzIpXG4gICAgICAgICAgICAgICAgICAgICAgICByID0gcmF5UGxhbmUgcG9seS52ZXJ0aWNlc1t2M10sIHYzMiwgWzAgMCAwXSwgcG5cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgciA9IHJheVBsYW5lIHBvbHkudmVydGljZXNbdjFdLCB2MTIsIFswIDAgMF0sIHBuXG4gICAgICAgICAgICAgICAgICAgIHZlcnRpY2VzW3YyXSA9IHJcbiAgICAgICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gIFxuICAgIHZlcnRzID0gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF0ubWFwIChpKSAtPiB2ZXJ0aWNlc1tpXSA/IHBvbHkudmVydGljZXNbaV1cbiAgICBcbiAgICBuZXcgUG9seWhlZHJvbiBcInoje3BvbHkubmFtZX1cIiBwb2x5LmZhY2VzLCB2ZXJ0c1xuXG4jIDAwMDAwMDAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICBcblxuZHVhbCA9IChwb2x5KSAtPlxuXG4gICAgIyBrbG9nIFwiZHVhbCAje3BvbHkubmFtZX1cIiBcbiAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgZmFjZSA9IFtdIFxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdIFxuICAgICAgICBmYWNlW2ldID0ge31cblxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gZltmLmxlbmd0aC0xXSAjIGxhc3QgdmVydGV4XG4gICAgICAgIGZvciB2MiBpbiBmICMgYXNzdW1lcyB0aGF0IG5vIDIgZmFjZXMgc2hhcmUgYW4gZWRnZSBpbiB0aGUgc2FtZSBvcmllbnRhdGlvbiFcbiAgICAgICAgICAgIGZhY2VbdjFdW1widiN7djJ9XCJdID0gXCIje2l9XCJcbiAgICAgICAgICAgIHYxID0gdjIgIyBjdXJyZW50IGJlY29tZXMgcHJldmlvdXNcbiAgXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZmxhZy5uZXdWIFwiI3tpfVwiIGNlbnRlcnNbaV1cbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgdjEgPSBmW2YubGVuZ3RoLTFdICNwcmV2aW91cyB2ZXJ0ZXhcbiAgICAgICAgZm9yIHYyIGluIGZcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyB2MSwgZmFjZVt2Ml1bXCJ2I3t2MX1cIl0sIFwiI3tpfVwiXG4gICAgICAgICAgICB2MT12MiAjIGN1cnJlbnQgYmVjb21lcyBwcmV2aW91c1xuICBcbiAgICBkcG9seSA9IGZsYWcudG9wb2x5KCkgIyBidWlsZCB0b3BvbG9naWNhbCBkdWFsIGZyb20gZmxhZ3NcbiAgXG4gICAgIyBtYXRjaCBGIGluZGV4IG9yZGVyaW5nIHRvIFYgaW5kZXggb3JkZXJpbmcgb24gZHVhbFxuICAgIHNvcnRGID0gW11cbiAgICBmb3IgZiBpbiBkcG9seS5mYWNlc1xuICAgICAgICBrID0gaW50ZXJzZWN0IHBvbHkuZmFjZXNbZlswXV0sIHBvbHkuZmFjZXNbZlsxXV0sIHBvbHkuZmFjZXNbZlsyXV1cbiAgICAgICAgc29ydEZba10gPSBmXG4gICAgZHBvbHkuZmFjZXMgPSBzb3J0RlxuICBcbiAgICBpZiBwb2x5Lm5hbWVbMF0gIT0gXCJkXCJcbiAgICAgICAgZHBvbHkubmFtZSA9IFwiZCN7cG9seS5uYW1lfVwiXG4gICAgZWxzZSBcbiAgICAgICAgZHBvbHkubmFtZSA9IHBvbHkubmFtZS5zbGljZSAxXG4gIFxuICAgIGRwb2x5XG5cbiMgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgXG4jIDAwMDAwMDAgICAgMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgIDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbiMgS2lzIChhYmJyZXZpYXRlZCBmcm9tIHRyaWFraXMpIHRyYW5zZm9ybXMgYW4gTi1zaWRlZCBmYWNlIGludG8gYW4gTi1weXJhbWlkIHJvb3RlZCBhdCB0aGVcbiMgc2FtZSBiYXNlIHZlcnRpY2VzLiBvbmx5IGtpcyBuLXNpZGVkIGZhY2VzLCBidXQgbj09MCBtZWFucyBraXMgYWxsLlxuXG5raXMgPSAocG9seSwgbiwgYXBleGRpc3QpIC0+XG5cbiAgICBuID89IDBcbiAgICBhcGV4ZGlzdCA/PSAwXG5cbiAgICAjIGtsb2cgXCJraXMgb2YgI3tuIGFuZCBcIiN7bn0tc2lkZWQgZmFjZXMgb2YgXCIgb3IgJyd9I3twb2x5Lm5hbWV9XCJcblxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgcCA9IHBvbHkudmVydGljZXNbaV0gIyBlYWNoIG9sZCB2ZXJ0ZXggaXMgYSBuZXcgdmVydGV4XG4gICAgICAgIGZsYWcubmV3ViBcInYje2l9XCIgcFxuICBcbiAgICBub3JtYWxzID0gcG9seS5ub3JtYWxzKClcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgICBmb3VuZEFueSA9IGZhbHNlXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgdjIgPSBcInYje3Z9XCJcbiAgICAgICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICAgICAgZm91bmRBbnkgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGFwZXggPSBcImFwZXgje2l9XCJcbiAgICAgICAgICAgICAgICBmbmFtZSA9IFwiI3tpfSN7djF9XCJcbiAgICAgICAgICAgICAgICAjIG5ldyB2ZXJ0aWNlcyBpbiBjZW50ZXJzIG9mIG4tc2lkZWQgZmFjZVxuICAgICAgICAgICAgICAgIGZsYWcubmV3ViBhcGV4LCBhZGQgY2VudGVyc1tpXSwgbXVsdCBhcGV4ZGlzdCwgbm9ybWFsc1tpXVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgICB2MSwgICB2MiAjIHRoZSBvbGQgZWRnZSBvZiBvcmlnaW5hbCBmYWNlXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCAgIHYyLCBhcGV4ICMgdXAgdG8gYXBleCBvZiBweXJhbWlkXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBhcGV4LCAgIHYxICMgYW5kIGJhY2sgZG93biBhZ2FpblxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcIiN7aX1cIiwgdjEsIHYyICAjIHNhbWUgb2xkIGZsYWcsIGlmIG5vbi1uXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHYxID0gdjIgIyBjdXJyZW50IGJlY29tZXMgcHJldmlvdXNcbiAgXG4gICAgaWYgbm90IGZvdW5kQW55XG4gICAgICAgIGtsb2cgXCJObyAje259LWZvbGQgY29tcG9uZW50cyB3ZXJlIGZvdW5kLlwiXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiayN7bn0je3BvbHkubmFtZX1cIlxuXG4jICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgXG5cbiMgVGhlIGJlc3Qgd2F5IHRvIHRoaW5rIG9mIHRoZSBhbWJvIG9wZXJhdG9yIGlzIGFzIGEgdG9wb2xvZ2ljYWwgXCJ0d2VlblwiIGJldHdlZW4gYSBwb2x5aGVkcm9uXG4jIGFuZCBpdHMgZHVhbCBwb2x5aGVkcm9uLiAgVGh1cyB0aGUgYW1ibyBvZiBhIGR1YWwgcG9seWhlZHJvbiBpcyB0aGUgc2FtZSBhcyB0aGUgYW1ibyBvZiB0aGVcbiMgb3JpZ2luYWwuIEFsc28gY2FsbGVkIFwiUmVjdGlmeVwiLlxuXG5hbWJvID0gKHBvbHkpIC0+XG4gICAgXG4gICAgIyBrbG9nIFwiYW1ibyBvZiAje3BvbHkubmFtZX1cIlxuICAgIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgICMgRm9yIGVhY2ggZmFjZSBmIGluIHRoZSBvcmlnaW5hbCBwb2x5XG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlKC0yKVxuICAgICAgICBmb3IgdjMgaW4gZlxuICAgICAgICAgICAgaWYgdjEgPCB2MiAjIHZlcnRpY2VzIGFyZSB0aGUgbWlkcG9pbnRzIG9mIGFsbCBlZGdlcyBvZiBvcmlnaW5hbCBwb2x5XG4gICAgICAgICAgICAgICAgZmxhZy5uZXdWIG1pZE5hbWUodjEsdjIpLCBtaWRwb2ludCBwb2x5LnZlcnRpY2VzW3YxXSwgcG9seS52ZXJ0aWNlc1t2Ml1cbiAgICAgICAgICAgICMgZmFjZSBjb3JyZXNwb25kcyB0byB0aGUgb3JpZ2luYWwgZlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwib3JpZyN7aX1cIiAgbWlkTmFtZSh2MSx2MiksIG1pZE5hbWUodjIsdjMpXG4gICAgICAgICAgICAjIGZhY2UgY29ycmVzcG9uZHMgdG8gKHRoZSB0cnVuY2F0ZWQpIHYyXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJkdWFsI3t2Mn1cIiBtaWROYW1lKHYyLHYzKSwgbWlkTmFtZSh2MSx2MilcbiAgICAgICAgICAgICMgc2hpZnQgb3ZlciBvbmVcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M11cbiAgXG4gICAgZmxhZy50b3BvbHkgXCJhI3twb2x5Lm5hbWV9XCJcblxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgIDAwMDAgICAgMDAwMDAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuXG5neXJvID0gKHBvbHkpIC0+XG5cbiAgICAjIGtsb2cgXCJneXJvIG9mICN7cG9seS5uYW1lfVwiXG4gIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgIGZsYWcubmV3ViBcInYje2l9XCIgdW5pdCBwb2x5LnZlcnRpY2VzW2ldICMgZWFjaCBvbGQgdmVydGV4IGlzIGEgbmV3IHZlcnRleFxuXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpICMgbmV3IHZlcnRpY2VzIGluIGNlbnRlciBvZiBlYWNoIGZhY2VcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBmbGFnLm5ld1YgXCJjZW50ZXIje2l9XCIgdW5pdCBjZW50ZXJzW2ldXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSgtMilcbiAgICAgICAgZm9yIGogaW4gWzAuLi5mLmxlbmd0aF1cbiAgICAgICAgICAgIHYgPSBmW2pdXG4gICAgICAgICAgICB2MyA9IHZcbiAgICAgICAgICAgIGZsYWcubmV3Vih2MStcIn5cIit2Miwgb25lVGhpcmQocG9seS52ZXJ0aWNlc1t2MV0scG9seS52ZXJ0aWNlc1t2Ml0pKTsgICMgbmV3IHYgaW4gZmFjZVxuICAgICAgICAgICAgZm5hbWUgPSBpK1wiZlwiK3YxXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIFwiY2VudGVyI3tpfVwiICB2MStcIn5cIit2MiAjIGZpdmUgbmV3IGZsYWdzXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIHYxK1wiflwiK3YyLCAgdjIrXCJ+XCIrdjFcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgdjIrXCJ+XCIrdjEsICBcInYje3YyfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIFwidiN7djJ9XCIgICAgIHYyK1wiflwiK3YzXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIHYyK1wiflwiK3YzLCAgXCJjZW50ZXIje2l9XCJcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M11cbiAgXG4gICAgZmxhZy50b3BvbHkgXCJnI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIFxuXG5yZWZsZWN0ID0gKHBvbHkpIC0+ICMgZ2VvbWV0cmljIHJlZmxlY3Rpb24gdGhyb3VnaCBvcmlnaW5cblxuICAgIGtsb2cgXCJyZWZsZWN0aW9uIG9mICN7cG9seS5uYW1lfVwiXG4gICAgIyByZWZsZWN0IGVhY2ggcG9pbnQgdGhyb3VnaCBvcmlnaW5cbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXVxuICAgICAgICBwb2x5LnZlcnRpY2VzW2ldID0gbXVsdCAtMSwgcG9seS52ZXJ0aWNlc1tpXVxuICAgICMgcmVwYWlyIGNsb2Nrd2lzZS1uZXNzIG9mIGZhY2VzXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgcG9seS5mYWNlc1tpXSA9IHBvbHkuZmFjZXNbaV0ucmV2ZXJzZSgpXG4gICAgcG9seS5uYW1lID0gXCJyI3twb2x5Lm5hbWV9XCJcbiAgICBwb2x5XG5cbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiMgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcblxuIyBBIHRydW5jYXRpb24gYWxvbmcgYSBwb2x5aGVkcm9uJ3MgZWRnZXMuXG4jIENoYW1mZXJpbmcgb3IgZWRnZS10cnVuY2F0aW9uIGlzIHNpbWlsYXIgdG8gZXhwYW5zaW9uLCBtb3ZpbmcgZmFjZXMgYXBhcnQgYW5kIG91dHdhcmQsXG4jIGJ1dCBhbHNvIG1haW50YWlucyB0aGUgb3JpZ2luYWwgdmVydGljZXMuIEFkZHMgYSBuZXcgaGV4YWdvbmFsIGZhY2UgaW4gcGxhY2Ugb2YgZWFjaFxuIyBvcmlnaW5hbCBlZGdlLlxuIyBBIHBvbHloZWRyb24gd2l0aCBlIGVkZ2VzIHdpbGwgaGF2ZSBhIGNoYW1mZXJlZCBmb3JtIGNvbnRhaW5pbmcgMmUgbmV3IHZlcnRpY2VzLFxuIyAzZSBuZXcgZWRnZXMsIGFuZCBlIG5ldyBoZXhhZ29uYWwgZmFjZXMuIC0tIFdpa2lwZWRpYVxuIyBTZWUgYWxzbyBodHRwOi8vZG1jY29vZXkuY29tL3BvbHloZWRyYS9DaGFtZmVyLmh0bWxcbiNcbiMgVGhlIGRpc3QgcGFyYW1ldGVyIGNvdWxkIGNvbnRyb2wgaG93IGRlZXBseSB0byBjaGFtZmVyLlxuIyBCdXQgSSdtIG5vdCBzdXJlIGFib3V0IGltcGxlbWVudGluZyB0aGF0IHlldC5cbiNcbiMgUTogd2hhdCBpcyB0aGUgZHVhbCBvcGVyYXRpb24gb2YgY2hhbWZlcmluZz8gSS5lLlxuIyBpZiBjWCA9IGR4ZFgsIGFuZCB4WCA9IGRjZFgsIHdoYXQgb3BlcmF0aW9uIGlzIHg/XG5cbiMgV2UgY291bGQgXCJhbG1vc3RcIiBkbyB0aGlzIGluIHRlcm1zIG9mIGFscmVhZHktaW1wbGVtZW50ZWQgb3BlcmF0aW9uczpcbiMgY0MgPSB0NGRhQyA9IHQ0akMsIGNPID0gdDNkYU8sIGNEID0gdDVkYUQsIGNJID0gdDNkYUlcbiMgQnV0IGl0IGRvZXNuJ3Qgd29yayBmb3IgY2FzZXMgbGlrZSBULlxuXG5jaGFtZmVyID0gKHBvbHksIGRpc3Q9MC41KSAtPlxuICAgIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IGZbZi5sZW5ndGgtMV1cbiAgICAgICAgdjFuZXcgPSBpICsgXCJfXCIgKyB2MVxuICAgIFxuICAgICAgICBmb3IgdjIgaW4gZlxuICAgICAgICAgICMgVE9ETzogZmlndXJlIG91dCB3aGF0IGRpc3RhbmNlcyB3aWxsIGdpdmUgdXMgYSBwbGFuYXIgaGV4IGZhY2UuXG4gICAgICAgICAgZmxhZy5uZXdWIHYyLCBtdWx0IDEuMCArIGRpc3QsIHBvbHkudmVydGljZXNbdjJdXG4gICAgICAgICAgdjJuZXcgPSBpICsgXCJfXCIgKyB2MlxuICAgICAgICAgIGZsYWcubmV3ViB2Mm5ldywgYWRkIHBvbHkudmVydGljZXNbdjJdLCBtdWx0IGRpc3QqMS41LCBub3JtYWxzW2ldXG4gICAgICAgICAgZmxhZy5uZXdGbGFnIFwib3JpZyN7aX1cIiB2MW5ldywgdjJuZXdcbiAgICAgICAgICBmYWNlbmFtZSA9ICh2MTx2MiBhbmQgXCJoZXgje3YxfV8je3YyfVwiIG9yIFwiaGV4I3t2Mn1fI3t2MX1cIilcbiAgICAgICAgICBmbGFnLm5ld0ZsYWcgZmFjZW5hbWUsIHYyLCB2Mm5ld1xuICAgICAgICAgIGZsYWcubmV3RmxhZyBmYWNlbmFtZSwgdjJuZXcsIHYxbmV3XG4gICAgICAgICAgZmxhZy5uZXdGbGFnIGZhY2VuYW1lLCB2MW5ldywgdjFcbiAgICAgICAgICB2MSA9IHYyO1xuICAgICAgICAgIHYxbmV3ID0gdjJuZXdcblxuICAgIGZsYWcudG9wb2x5IFwiYyN7cG9seS5uYW1lfVwiXG5cbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAgICBcbiMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICBcblxuIyBHeXJvIGZvbGxvd2VkIGJ5IHRydW5jYXRpb24gb2YgdmVydGljZXMgY2VudGVyZWQgb24gb3JpZ2luYWwgZmFjZXMuXG4jIFRoaXMgY3JlYXRlIDIgbmV3IGhleGFnb25zIGZvciBldmVyeSBvcmlnaW5hbCBlZGdlLlxuIyAoaHR0cHM6I2VuLndpa2lwZWRpYS5vcmcvd2lraS9Db253YXlfcG9seWhlZHJvbl9ub3RhdGlvbiNPcGVyYXRpb25zX29uX3BvbHloZWRyYSlcbiNcbiMgUG9zc2libGUgZXh0ZW5zaW9uOiB0YWtlIGEgcGFyYW1ldGVyIG4gdGhhdCBtZWFucyBvbmx5IHdoaXJsIG4tc2lkZWQgZmFjZXMuXG4jIElmIHdlIGRvIHRoYXQsIHRoZSBmbGFncyBtYXJrZWQgIyogYmVsb3cgd2lsbCBuZWVkIHRvIGhhdmUgdGhlaXIgb3RoZXIgc2lkZXNcbiMgZmlsbGVkIGluIG9uZSB3YXkgb3IgYW5vdGhlciwgZGVwZW5kaW5nIG9uIHdoZXRoZXIgdGhlIGFkamFjZW50IGZhY2UgaXNcbiMgd2hpcmxlZCBvciBub3QuXG5cbndoaXJsID0gKHBvbHksIG4pIC0+XG5cbiAgICBrbG9nIFwid2hpcmwgb2YgI3twb2x5Lm5hbWV9XCJcbiAgICBuID89IDBcbiAgICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXVxuICAgICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHVuaXQgcG9seS52ZXJ0aWNlc1tpXVxuXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSAtMlxuICAgICAgICBmb3IgaiBpbiBbMC4uLmYubGVuZ3RoXVxuICAgICAgICAgICAgdiA9IGZbal1cbiAgICAgICAgICAgIHYzID0gdlxuICAgICAgICAgICAgdjFfMiA9IG9uZVRoaXJkIHBvbHkudmVydGljZXNbdjFdLCBwb2x5LnZlcnRpY2VzW3YyXVxuICAgICAgICAgICAgZmxhZy5uZXdWKHYxK1wiflwiK3YyLCB2MV8yKVxuICAgICAgICAgICAgY3YxbmFtZSA9IFwiY2VudGVyI3tpfX4je3YxfVwiXG4gICAgICAgICAgICBjdjJuYW1lID0gXCJjZW50ZXIje2l9fiN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcubmV3ViBjdjFuYW1lLCB1bml0IG9uZVRoaXJkIGNlbnRlcnNbaV0sIHYxXzJcbiAgICAgICAgICAgIGZuYW1lID0gaStcImZcIit2MVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBjdjFuYW1lLCAgIHYxK1wiflwiK3YyXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIHYxK1wiflwiK3YyLCB2MitcIn5cIit2MSBcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgdjIrXCJ+XCIrdjEsIFwidiN7djJ9XCIgIFxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBcInYje3YyfVwiLCAgdjIrXCJ+XCIrdjMgXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIHYyK1wiflwiK3YzLCBjdjJuYW1lXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIGN2Mm5hbWUsICAgY3YxbmFtZVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiYyN7aX1cIiwgY3YxbmFtZSwgY3YybmFtZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdICMgc2hpZnQgb3ZlciBvbmVcbiAgXG4gICAgZmxhZy50b3BvbHkgXCJ3I3twb2x5Lm5hbWV9XCJcblxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAwMCAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuIyAwMDAgMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiMgIDAwMDAwIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgXG5cbnF1aW50byA9IChwb2x5KSAtPiAjIGNyZWF0ZXMgYSBwZW50YWdvbiBmb3IgZXZlcnkgcG9pbnQgaW4gdGhlIG9yaWdpbmFsIGZhY2UsIGFzIHdlbGwgYXMgb25lIG5ldyBpbnNldCBmYWNlLlxuICAgIFxuICAgICMga2xvZyBcInF1aW50byBvZiAje3BvbHkubmFtZX1cIlxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgICMgRm9yIGVhY2ggZmFjZSBmIGluIHRoZSBvcmlnaW5hbCBwb2x5XG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgY2VudHJvaWQgPSBjYWxjQ2VudHJvaWQgZi5tYXAgKGlkeCkgLT4gcG9seS52ZXJ0aWNlc1tpZHhdXG4gICAgICAgICMgd2FsayBvdmVyIGZhY2UgdmVydGV4LXRyaXBsZXRzXG4gICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSAtMlxuICAgICAgICBmb3IgdjMgaW4gZlxuICAgICAgICAgICAgIyBmb3IgZWFjaCBmYWNlLWNvcm5lciwgd2UgbWFrZSB0d28gbmV3IHBvaW50czpcbiAgICAgICAgICAgIG1pZHB0ID0gbWlkcG9pbnQgcG9seS52ZXJ0aWNlc1t2MV0sIHBvbHkudmVydGljZXNbdjJdXG4gICAgICAgICAgICBpbm5lcnB0ID0gbWlkcG9pbnQgbWlkcHQsIGNlbnRyb2lkXG4gICAgICAgICAgICBmbGFnLm5ld1YgbWlkTmFtZSh2MSx2MiksIG1pZHB0XG4gICAgICAgICAgICBmbGFnLm5ld1YgXCJpbm5lcl8je2l9X1wiICsgbWlkTmFtZSh2MSx2MiksIGlubmVycHRcbiAgICAgICAgICAgICMgYW5kIGFkZCB0aGUgb2xkIGNvcm5lci12ZXJ0ZXhcbiAgICAgICAgICAgIGZsYWcubmV3ViBcIiN7djJ9XCIgcG9seS52ZXJ0aWNlc1t2Ml1cbiAgICAgICAgICBcbiAgICAgICAgICAgICMgcGVudGFnb24gZm9yIGVhY2ggdmVydGV4IGluIG9yaWdpbmFsIGZhY2VcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImYje2l9XyN7djJ9XCIsIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYxLCB2MiksIG1pZE5hbWUodjEsIHYyKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiZiN7aX1fI3t2Mn1cIiwgbWlkTmFtZSh2MSwgdjIpLCBcIiN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImYje2l9XyN7djJ9XCIsIFwiI3t2Mn1cIiwgbWlkTmFtZSh2MiwgdjMpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmI3tpfV8je3YyfVwiLCBtaWROYW1lKHYyLCB2MyksIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYyLCB2MylcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImYje2l9XyN7djJ9XCIsIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYyLCB2MyksIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYxLCB2MilcbiAgICAgIFxuICAgICAgICAgICAgIyBpbm5lciByb3RhdGVkIGZhY2Ugb2Ygc2FtZSB2ZXJ0ZXgtbnVtYmVyIGFzIG9yaWdpbmFsXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmX2luXyN7aX1cIiwgXCJpbm5lcl8je2l9X1wiK21pZE5hbWUodjEsIHYyKSwgXCJpbm5lcl8je2l9X1wiK21pZE5hbWUodjIsIHYzKVxuICAgICAgXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdICMgc2hpZnQgb3ZlciBvbmVcbiAgXG4gICAgZmxhZy50b3BvbHkgXCJxI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDBcbiMgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgXG4jIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgIFxuIyAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAgMDAwICAgXG5cbmluc2V0ID0gKHBvbHksIG4sIGluc2V0X2Rpc3QsIHBvcG91dF9kaXN0KSAtPlxuXG4gICAgbiA/PSAwXG4gICAgaW5zZXRfZGlzdCA/PSAwLjVcbiAgICBwb3BvdXRfZGlzdCA/PSAtMC4yXG4gIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgIyBlYWNoIG9sZCB2ZXJ0ZXggaXMgYSBuZXcgdmVydGV4XG4gICAgICAgIHAgPSBwb2x5LnZlcnRpY2VzW2ldXG4gICAgICAgIGZsYWcubmV3ViBcInYje2l9XCIgcFxuXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF0gIyBuZXcgaW5zZXQgdmVydGV4IGZvciBldmVyeSB2ZXJ0IGluIGZhY2VcbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgaWYgZi5sZW5ndGggPT0gbiBvciBuID09IDBcbiAgICAgICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgICAgICBmbGFnLm5ld1YgXCJmI3tpfXYje3Z9XCIgYWRkIHR3ZWVuKHBvbHkudmVydGljZXNbdl0sY2VudGVyc1tpXSxpbnNldF9kaXN0KSwgbXVsdChwb3BvdXRfZGlzdCxub3JtYWxzW2ldKVxuICBcbiAgICBmb3VuZEFueSA9IGZhbHNlICMgYWxlcnQgaWYgZG9uJ3QgZmluZCBhbnlcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MiA9IFwidiN7dn1cIjtcbiAgICAgICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICAgICAgZm91bmRBbnkgPSB0cnVlXG4gICAgICAgICAgICAgICAgZm5hbWUgPSBpICsgdjFcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsICAgICAgdjEsICAgICAgIHYyKVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgICAgICB2MiwgICAgICAgXCJmI3tpfSN7djJ9XCIpXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCBcImYje2l9I3t2Mn1cIiwgIFwiZiN7aX0je3YxfVwiKVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgXCJmI3tpfSN7djF9XCIsICB2MSlcbiAgICAgICAgICAgICAgICAjIG5ldyBpbnNldCwgZXh0cnVkZWQgZmFjZVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImV4I3tpfVwiLCBcImYje2l9I3t2MX1cIiwgIFwiZiN7aX0je3YyfVwiKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyhpLCB2MSwgdjIpICAjIHNhbWUgb2xkIGZsYWcsIGlmIG5vbi1uXG4gICAgICAgICAgICB2MT12MiAjIGN1cnJlbnQgYmVjb21lcyBwcmV2aW91c1xuICBcbiAgICBpZiBub3QgZm91bmRBbnlcbiAgICAgICAga2xvZyBcIk5vICN7bn0tZm9sZCBjb21wb25lbnRzIHdlcmUgZm91bmQuXCJcbiAgXG4gICAgZmxhZy50b3BvbHkgXCJuI3tufSN7cG9seS5uYW1lfVwiXG5cbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwXG5cbmV4dHJ1ZGUgPSAocG9seSwgbiwgcG9wb3V0PTEsIGluc2V0Zj0wLjUpIC0+XG4gICAgbmV3cG9seSA9IGluc2V0IHBvbHksIG4sIGluc2V0ZiwgcG9wb3V0XG4gICAgbmV3cG9seS5uYW1lID0gXCJ4I3tufSN7cG9seS5uYW1lfVwiXG4gICAgbmV3cG9seVxuXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4jIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgXG5cbmhvbGxvdyA9IChwb2x5LCBpbnNldF9kaXN0LCB0aGlja25lc3MpIC0+XG5cbiAgICBpbnNldF9kaXN0ID89IDAuNVxuICAgIHRoaWNrbmVzcyA/PSAwLjJcbiAgXG4gICAgZHVhbG5vcm1hbHMgPSBkdWFsKHBvbHkpLm5vcm1hbHMoKVxuICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgICMgZWFjaCBvbGQgdmVydGV4IGlzIGEgbmV3IHZlcnRleFxuICAgICAgICBwID0gcG9seS52ZXJ0aWNlc1tpXVxuICAgICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHBcbiAgICAgICAgZmxhZy5uZXdWIFwiZG93bnYje2l9XCIgYWRkIHAsIG11bHQgLTEqdGhpY2tuZXNzLGR1YWxub3JtYWxzW2ldXG5cbiAgICAjIG5ldyBpbnNldCB2ZXJ0ZXggZm9yIGV2ZXJ5IHZlcnQgaW4gZmFjZVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIGZsYWcubmV3ViBcImZpbiN7aX12I3t2fVwiIHR3ZWVuIHBvbHkudmVydGljZXNbdl0sIGNlbnRlcnNbaV0sIGluc2V0X2Rpc3RcbiAgICAgICAgICAgIGZsYWcubmV3ViBcImZpbmRvd24je2l9diN7dn1cIiBhZGQgdHdlZW4ocG9seS52ZXJ0aWNlc1t2XSxjZW50ZXJzW2ldLGluc2V0X2Rpc3QpLCBtdWx0KC0xKnRoaWNrbmVzcyxub3JtYWxzW2ldKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MiA9IFwidiN7dn1cIlxuICAgICAgICAgICAgZm5hbWUgPSBpICsgdjFcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgdjEsICAgICAgICAgICAgdjJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgdjIsICAgICAgICAgICAgXCJmaW4je2l9I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBcImZpbiN7aX0je3YyfVwiIFwiZmluI3tpfSN7djF9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgXCJmaW4je2l9I3t2MX1cIiB2MVxuICAgICAgXG4gICAgICAgICAgICBmbmFtZSA9IFwic2lkZXMje2l9I3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBcImZpbiN7aX0je3YxfVwiICAgICBcImZpbiN7aX0je3YyfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIFwiZmluI3tpfSN7djJ9XCIgICAgIFwiZmluZG93biN7aX0je3YyfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIFwiZmluZG93biN7aX0je3YyfVwiIFwiZmluZG93biN7aX0je3YxfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIFwiZmluZG93biN7aX0je3YxfVwiIFwiZmluI3tpfSN7djF9XCJcbiAgICAgIFxuICAgICAgICAgICAgZm5hbWUgPSBcImJvdHRvbSN7aX0je3YxfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsICBcImRvd24je3YyfVwiICAgICAgICBcImRvd24je3YxfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsICBcImRvd24je3YxfVwiICAgICAgICBcImZpbmRvd24je2l9I3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCAgXCJmaW5kb3duI3tpfSN7djF9XCIgXCJmaW5kb3duI3tpfSN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgIFwiZmluZG93biN7aX0je3YyfVwiIFwiZG93biN7djJ9XCJcbiAgICAgIFxuICAgICAgICAgICAgdjEgPSB2MiAjIGN1cnJlbnQgYmVjb21lcyBwcmV2aW91c1xuICBcbiAgICBmbGFnLnRvcG9seSBcIkgje3BvbHkubmFtZX1cIlxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgMDAwICAgMDAwMDAwMDAwXG4jIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcbiMgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgMCAgICAgIDAwMCAgIDAwMFxuXG5wZXJzcGVjdGl2YSA9IChwb2x5KSAtPiAjIGFuIG9wZXJhdGlvbiByZXZlcnNlLWVuZ2luZWVyZWQgZnJvbSBQZXJzcGVjdGl2YSBDb3Jwb3J1bSBSZWd1bGFyaXVtXG5cbiAgICAjIGtsb2cgXCJzdGVsbGEgb2YgI3twb2x5Lm5hbWV9XCJcbiAgXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpICMgY2FsY3VsYXRlIGZhY2UgY2VudGVyc1xuICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgIGZsYWcubmV3ViBcInYje2l9XCIgcG9seS52ZXJ0aWNlc1tpXVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBcbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMl19XCJcbiAgICAgICAgdjIgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgdmVydDEgPSBwb2x5LnZlcnRpY2VzW2ZbZi5sZW5ndGgtMl1dXG4gICAgICAgIHZlcnQyID0gcG9seS52ZXJ0aWNlc1tmW2YubGVuZ3RoLTFdXVxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MyA9IFwidiN7dn1cIlxuICAgICAgICAgICAgdmVydDMgPSBwb2x5LnZlcnRpY2VzW3ZdXG4gICAgICAgICAgICB2MTIgPSB2MStcIn5cIit2MlxuICAgICAgICAgICAgdjIxID0gdjIrXCJ+XCIrdjFcbiAgICAgICAgICAgIHYyMyA9IHYyK1wiflwiK3YzXG4gICAgICBcbiAgICAgICAgICAgICMgb24gZWFjaCBOZmFjZSwgTiBuZXcgcG9pbnRzIGluc2V0IGZyb20gZWRnZSBtaWRwb2ludHMgdG93YXJkcyBjZW50ZXIgPSBcInN0ZWxsYXRlZFwiIHBvaW50c1xuICAgICAgICAgICAgZmxhZy5uZXdWIHYxMiwgbWlkcG9pbnQgbWlkcG9pbnQodmVydDEsdmVydDIpLCBjZW50ZXJzW2ldIFxuICAgICAgXG4gICAgICAgICAgICAjIGluc2V0IE5mYWNlIG1hZGUgb2YgbmV3LCBzdGVsbGF0ZWQgcG9pbnRzXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJpbiN7aX1cIiB2MTIsIHYyM1xuICAgICAgXG4gICAgICAgICAgICAjIG5ldyB0cmkgZmFjZSBjb25zdGl0dXRpbmcgdGhlIHJlbWFpbmRlciBvZiB0aGUgc3RlbGxhdGVkIE5mYWNlXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmI3tpfSN7djJ9XCIgdjIzLCB2MTJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImYje2l9I3t2Mn1cIiB2MTIsIHYyXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmI3tpfSN7djJ9XCIgdjIsICB2MjNcbiAgICAgIFxuICAgICAgICAgICAgIyBvbmUgb2YgdGhlIHR3byBuZXcgdHJpYW5nbGVzIHJlcGxhY2luZyBvbGQgZWRnZSBiZXR3ZWVuIHYxLT52MlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiZiN7djEyfVwiIHYxLCAgdjIxXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmI3t2MTJ9XCIgdjIxLCB2MTJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImYje3YxMn1cIiB2MTIsIHYxXG4gICAgICBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M10gICMgY3VycmVudCBiZWNvbWVzIHByZXZpb3VzXG4gICAgICAgICAgICBbdmVydDEsIHZlcnQyXSA9IFt2ZXJ0MiwgdmVydDNdXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiUCN7cG9seS5uYW1lfVwiXG5cbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcblxudHJpc3ViID0gKHBvbHksIG49MikgLT5cbiAgICBcbiAgICAjIE5vLU9wIGZvciBub24tdHJpYW5ndWxhciBtZXNoZXNcbiAgICBmb3IgZm4gaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgaWYgcG9seS5mYWNlc1tmbl0ubGVuZ3RoICE9IDNcbiAgICAgICAgICAgIHJldHVybiBwb2x5XG4gIFxuICAgIG5ld1ZzID0gW11cbiAgICB2bWFwID0ge31cbiAgICBwb3MgPSAwXG4gICAgZm9yIGZuIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ZuXVxuICAgICAgICBbaTEsIGkyLCBpM10gPSBmLnNsaWNlIC0zXG4gICAgICAgIHYxID0gcG9seS52ZXJ0aWNlc1tpMV1cbiAgICAgICAgdjIgPSBwb2x5LnZlcnRpY2VzW2kyXVxuICAgICAgICB2MyA9IHBvbHkudmVydGljZXNbaTNdXG4gICAgICAgIHYyMSA9IHN1YiB2MiwgdjFcbiAgICAgICAgdjMxID0gc3ViIHYzLCB2MVxuICAgICAgICBmb3IgaSBpbiBbMC4ubl1cbiAgICAgICAgICAgIGZvciBqIGluIFswLi5uLWldXG4gICAgICAgICAgICAgICAgdiA9IGFkZCBhZGQodjEsIG11bHQoaS9uLCB2MjEpKSwgbXVsdChqL24sIHYzMSlcbiAgICAgICAgICAgICAgICB2bWFwW1widiN7Zm59LSN7aX0tI3tqfVwiXSA9IHBvcysrXG4gICAgICAgICAgICAgICAgbmV3VnMucHVzaCB2XG4gIFxuICAgIEVQU0lMT05fQ0xPU0UgPSAxLjBlLThcbiAgICB1bmlxVnMgPSBbXVxuICAgIG5ld3BvcyA9IDBcbiAgICB1bmlxbWFwID0ge31cbiAgICBmb3IgdixpIGluIG5ld1ZzXG4gICAgICAgIGlmIGkgaW4gdW5pcW1hcCB0aGVuIGNvbnRpbnVlICMgYWxyZWFkeSBtYXBwZWRcbiAgICAgICAgdW5pcW1hcFtpXSA9IG5ld3Bvc1xuICAgICAgICB1bmlxVnMucHVzaCB2XG4gICAgICAgIGZvciBqIGluIFtpKzEuLi5uZXdWcy5sZW5ndGhdXG4gICAgICAgICAgICB3ID0gbmV3VnNbal1cbiAgICAgICAgICAgIGlmIG1hZyhzdWIodiwgdykpIDwgRVBTSUxPTl9DTE9TRVxuICAgICAgICAgICAgICAgIHVuaXFtYXBbal0gPSBuZXdwb3NcbiAgICAgICAgbmV3cG9zKytcbiAgXG4gICAgZmFjZXMgPSBbXVxuICAgIGZvciBmbiBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmb3IgaSBpbiBbMC4uLm5dXG4gICAgICAgICAgICBmb3IgaiBpbiBbMC4uLm4taV1cbiAgICAgICAgICAgICAgICBmYWNlcy5wdXNoIFt1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2p9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aSsxfS0je2p9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqKzF9XCJdXV1cbiAgICAgICAgZm9yIGkgaW4gWzEuLi5uXVxuICAgICAgICAgICAgZm9yIGogaW4gWzAuLi5uLWldXG4gICAgICAgICAgICAgICAgZmFjZXMucHVzaCBbdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2l9LSN7aisxfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2ktMX0tI3tqKzF9XCJdXV1cbiAgXG4gICAgIyBrbG9nICdmYWNlcycgZmFjZXNcbiAgICAjIGtsb2cgJ3ZlcnRpY2VzJyB1bmlxVnMgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgXG4gICAgbmV3IFBvbHloZWRyb24gXCJ1I3tufSN7cG9seS5uYW1lfVwiIGZhY2VzLCB1bmlxVnNcblxuIyAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgICAwMDAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG5jYW5vbmljYWxpemUgPSAocG9seSwgaXRlcj0xMDApIC0+XG5cbiAgICAjIGtsb2cgXCJjYW5vbmljYWxpemUgI3twb2x5Lm5hbWV9XCJcbiAgICBmYWNlcyA9IHBvbHkuZmFjZXNcbiAgICBlZGdlcyA9IHBvbHkuZWRnZXMoKVxuICAgIG5ld1ZzID0gcG9seS52ZXJ0aWNlc1xuICAgIG1heENoYW5nZSA9IDEuMCAjIGNvbnZlcmdlbmNlIHRyYWNrZXJcbiAgICBmb3IgaSBpbiBbMC4uaXRlcl1cbiAgICAgICAgb2xkVnMgPSBjb3B5VmVjQXJyYXkgbmV3VnNcbiAgICAgICAgbmV3VnMgPSB0YW5nZW50aWZ5IG5ld1ZzLCBlZGdlc1xuICAgICAgICBuZXdWcyA9IHJlY2VudGVyIG5ld1ZzLCBlZGdlc1xuICAgICAgICBuZXdWcyA9IHBsYW5hcml6ZSBuZXdWcywgZmFjZXNcbiAgICAgICAgbWF4Q2hhbmdlID0gXy5tYXggXy5tYXAgXy56aXAobmV3VnMsIG9sZFZzKSwgKFt4LCB5XSkgLT4gbWFnIHN1YiB4LCB5XG4gICAgICAgIGlmIG1heENoYW5nZSA8IDFlLThcbiAgICAgICAgICAgIGJyZWFrXG4gICAgIyBvbmUgc2hvdWxkIG5vdyByZXNjYWxlLCBidXQgbm90IHJlc2NhbGluZyBoZXJlIG1ha2VzIGZvciB2ZXJ5IGludGVyZXN0aW5nIG51bWVyaWNhbFxuICAgICMgaW5zdGFiaWxpdGllcyB0aGF0IG1ha2UgaW50ZXJlc3RpbmcgbXV0YW50cyBvbiBtdWx0aXBsZSBhcHBsaWNhdGlvbnMuLi5cbiAgICAjIG1vcmUgZXhwZXJpZW5jZSB3aWxsIHRlbGwgd2hhdCB0byBkb1xuICAgIG5ld1ZzID0gcmVzY2FsZShuZXdWcylcbiAgICAjIGtsb2cgXCJbY2Fub25pY2FsaXphdGlvbiBkb25lLCBsYXN0IHxkZWx0YVZ8PSN7bWF4Q2hhbmdlfV1cIlxuICAgIG5ld3BvbHkgPSBuZXcgUG9seWhlZHJvbiBwb2x5Lm5hbWUsIHBvbHkuZmFjZXMsIG5ld1ZzXG4gICAgIyBrbG9nIFwiY2Fub25pY2FsaXplXCIgbmV3cG9seVxuICAgIG5ld3BvbHlcbiAgICBcbmNhbm9uaWNhbFhZWiA9IChwb2x5LCBpdGVyYXRpb25zKSAtPlxuXG4gICAgaXRlcmF0aW9ucyA/PSAxXG4gICAgZHBvbHkgPSBkdWFsIHBvbHlcbiAgICAjIGtsb2cgXCJjYW5vbmljYWxYWVogI3twb2x5Lm5hbWV9XCJcbiAgXG4gICAgZm9yIGNvdW50IGluIFswLi4uaXRlcmF0aW9uc10gIyByZWNpcHJvY2F0ZSBmYWNlIG5vcm1hbHNcbiAgICAgICAgZHBvbHkudmVydGljZXMgPSByZWNpcHJvY2FsTiBwb2x5XG4gICAgICAgIHBvbHkudmVydGljZXMgID0gcmVjaXByb2NhbE4gZHBvbHlcbiAgXG4gICAgbmV3IFBvbHloZWRyb24gcG9seS5uYW1lLCBwb2x5LmZhY2VzLCBwb2x5LnZlcnRpY2VzXG5cbmZsYXR0ZW4gPSAocG9seSwgaXRlcmF0aW9ucykgLT4gIyBxdWljayBwbGFuYXJpemF0aW9uXG4gICAgXG4gICAgaXRlcmF0aW9ucyA/PSAxXG4gICAgZHBvbHkgPSBkdWFsIHBvbHkgIyB2J3Mgb2YgZHVhbCBhcmUgaW4gb3JkZXIgb2YgYXJnJ3MgZidzXG4gICAgIyBrbG9nIFwiZmxhdHRlbiAje3BvbHkubmFtZX1cIlxuICBcbiAgICBmb3IgY291bnQgaW4gWzAuLi5pdGVyYXRpb25zXSAjIHJlY2lwcm9jYXRlIGZhY2UgY2VudGVyc1xuICAgICAgICBkcG9seS52ZXJ0aWNlcyA9IHJlY2lwcm9jYWxDIHBvbHlcbiAgICAgICAgcG9seS52ZXJ0aWNlcyAgPSByZWNpcHJvY2FsQyBkcG9seVxuICBcbiAgICBuZXcgUG9seWhlZHJvbiBwb2x5Lm5hbWUsIHBvbHkuZmFjZXMsIHBvbHkudmVydGljZXNcbiAgICBcbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMCAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAgIDAwMCAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gICAgZHVhbDogICAgICAgICAgIGR1YWxcbiAgICB0cmlzdWI6ICAgICAgICAgdHJpc3ViXG4gICAgcGVyc3BlY3RpdmE6ICAgIHBlcnNwZWN0aXZhXG4gICAga2lzOiAgICAgICAgICAgIGtpc1xuICAgIGFtYm86ICAgICAgICAgICBhbWJvXG4gICAgZ3lybzogICAgICAgICAgIGd5cm9cbiAgICByZWZsZWN0OiAgICAgICAgcmVmbGVjdFxuICAgIGNoYW1mZXI6ICAgICAgICBjaGFtZmVyXG4gICAgd2hpcmw6ICAgICAgICAgIHdoaXJsXG4gICAgcXVpbnRvOiAgICAgICAgIHF1aW50b1xuICAgIGluc2V0OiAgICAgICAgICBpbnNldFxuICAgIGV4dHJ1ZGU6ICAgICAgICBleHRydWRlXG4gICAgaG9sbG93OiAgICAgICAgIGhvbGxvd1xuICAgIGZsYXR0ZW46ICAgICAgICBmbGF0dGVuXG4gICAgemlya3VsYXJpemU6ICAgIHppcmt1bGFyaXplXG4gICAgY2Fub25pY2FsaXplOiAgIGNhbm9uaWNhbGl6ZVxuICAgIGNhbm9uaWNhbFhZWjogICBjYW5vbmljYWxYWVpcbiAgICAiXX0=
//# sourceURL=../../coffee/poly/topo.coffee