// koffee 1.6.0

/*
000000000   0000000   00000000    0000000     
   000     000   000  000   000  000   000    
   000     000   000  00000000   000   000    
   000     000   000  000        000   000    
   000      0000000   000         0000000
 */
var Flag, Polyhedron, ambo, chamfer, dual, extrudeN, gyro, hollow, insetN, intersect, kerror, kisN, klog, loft, midName, perspectiva1, propellor, quinto, ref, reflect, trisub, whirl,
    indexOf = [].indexOf;

ref = require('kxk'), kerror = ref.kerror, klog = ref.klog;

intersect = require('./geo').intersect;

Polyhedron = require('./polyhedron').Polyhedron;

Flag = (function() {
    function Flag() {
        this.flags = {};
        this.vertidxs = {};
        this.vertices = {};
    }

    Flag.prototype.newV = function(vertName, coordinates) {
        if (!this.vertidxs[vertName]) {
            this.vertidxs[vertName] = 0;
            return this.vertices[vertName] = coordinates;
        }
    };

    Flag.prototype.newFlag = function(faceName, vertName1, vertName2) {
        var base;
        if ((base = this.flags)[faceName] != null) {
            base[faceName];
        } else {
            base[faceName] = {};
        }
        return this.flags[faceName][vertName1] = vertName2;
    };

    Flag.prototype.topoly = function(name) {
        var ctr, face, faceCount, i, j, newFace, poly, ref1, ref2, v, v0;
        if (name == null) {
            name = 'polyhedron';
        }
        poly = new Polyhedron(name);
        klog('topoly', this);
        ctr = 0;
        ref1 = this.vertidxs;
        for (i in ref1) {
            v = ref1[i];
            poly.vertices[ctr] = this.vertices[i];
            this.vertidxs[i] = ctr;
            ctr++;
        }
        ctr = 0;
        ref2 = this.flags;
        for (i in ref2) {
            face = ref2[i];
            newFace = [];
            for (j in face) {
                v0 = face[j];
                v = v0;
                break;
            }
            newFace.push(this.vertidxs[v]);
            v = this.flags[i][v];
            faceCount = 0;
            while (v !== v0) {
                newFace.push(this.vertidxs[v]);
                v = this.flags[i][v];
                if (faceCount++ > 100) {
                    kerror("Bad flag with neverending face:", i, this.flags[i]);
                    break;
                }
            }
            poly.faces[ctr] = newFace;
            ctr++;
        }
        klog('poly', poly);
        return poly;
    };

    return Flag;

})();

midName = function(v1, v2) {
    return v1 < v2 && (v1 + "_" + v2) || (v2 + "_" + v1);
};

dual = function(poly) {
    var centers, dpoly, f, face, flag, i, k, l, len, len1, len2, m, o, q, r, ref1, ref2, ref3, ref4, ref5, s, sortF, t, v1, v2;
    klog("dual of " + poly.name);
    flag = new Flag();
    face = [];
    for (i = l = 0, ref1 = poly.vertices.length; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
        face[i] = {};
    }
    for (i = m = 0, ref2 = poly.faces.length; 0 <= ref2 ? m < ref2 : m > ref2; i = 0 <= ref2 ? ++m : --m) {
        f = poly.faces[i];
        v1 = f[f.length - 1];
        for (o = 0, len = f.length; o < len; o++) {
            v2 = f[o];
            face[v1]["v" + v2] = "" + i;
            v1 = v2;
        }
    }
    centers = poly.centers();
    for (i = q = 0, ref3 = poly.faces.length; 0 <= ref3 ? q < ref3 : q > ref3; i = 0 <= ref3 ? ++q : --q) {
        flag.newV("" + i, centers[i]);
    }
    for (i = r = 0, ref4 = poly.faces.length; 0 <= ref4 ? r < ref4 : r > ref4; i = 0 <= ref4 ? ++r : --r) {
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
    ref5 = dpoly.faces;
    for (t = 0, len2 = ref5.length; t < len2; t++) {
        f = ref5[t];
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

kisN = function(poly, n, apexdist) {
    var apex, centers, f, flag, fname, foundAny, i, l, len, m, normals, o, p, ref1, ref2, v, v1, v2;
    if (n != null) {
        n;
    } else {
        n = 0;
    }
    if (apexdist != null) {
        apexdist;
    } else {
        apexdist = 0.1;
    }
    klog("kis of " + (n && (n + "-sided") || 'all') + " faces of " + poly.name, poly);
    flag = new Flag();
    for (i = l = 0, ref1 = poly.vertices.length; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
        p = poly.vertices[i];
        flag.newV("v" + i, p);
    }
    normals = poly.normals();
    centers = poly.centers();
    foundAny = false;
    for (i = m = 0, ref2 = poly.faces.length; 0 <= ref2 ? m < ref2 : m > ref2; i = 0 <= ref2 ? ++m : --m) {
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
    var f, flag, i, l, len, m, ref1, ref2, ref3, v1, v2, v3;
    klog("ambo of " + poly.name);
    flag = new Flag();
    for (i = l = 0, ref1 = poly.faces.length; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
        f = poly.faces[i];
        ref2 = f.slice(-2), v1 = ref2[0], v2 = ref2[1];
        for (m = 0, len = f.length; m < len; m++) {
            v3 = f[m];
            if (v1 < v2) {
                flag.newV(midName(v1, v2), midpoint(poly.vertices[v1], poly.vertices[v2]));
            }
            flag.newFlag("orig" + i, midName(v1, v2), midName(v2, v3));
            flag.newFlag("dual" + v2, midName(v2, v3), midName(v1, v2));
            ref3 = [v2, v3], v1 = ref3[0], v2 = ref3[1];
        }
    }
    return flag.topoly("a" + poly.name);
};

gyro = function(poly) {
    var centers, f, flag, fname, i, j, l, m, o, q, ref1, ref2, ref3, ref4, ref5, ref6, v, v1, v2, v3;
    klog("gyro of " + poly.name);
    flag = new Flag();
    for (i = l = 0, ref1 = poly.vertices.length; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
        flag.newV("v" + i, unit(poly.vertices[i]));
    }
    centers = poly.centers();
    for (i = m = 0, ref2 = poly.faces.length; 0 <= ref2 ? m < ref2 : m > ref2; i = 0 <= ref2 ? ++m : --m) {
        f = poly.faces[i];
        flag.newV("center" + i, unit(centers[i]));
    }
    for (i = o = 0, ref3 = poly.faces.length; 0 <= ref3 ? o < ref3 : o > ref3; i = 0 <= ref3 ? ++o : --o) {
        f = poly.faces[i];
        ref4 = f.slice(-2), v1 = ref4[0], v2 = ref4[1];
        for (j = q = 0, ref5 = f.length; 0 <= ref5 ? q < ref5 : q > ref5; j = 0 <= ref5 ? ++q : --q) {
            v = f[j];
            v3 = v;
            flag.newV(v1 + "~" + v2, oneThird(poly.vertices[v1], poly.vertices[v2]));
            fname = i + "f" + v1;
            flag.newFlag(fname, "center" + i, v1 + "~" + v2);
            flag.newFlag(fname, v1 + "~" + v2, v2 + "~" + v1);
            flag.newFlag(fname, v2 + "~" + v1, "v" + v2);
            flag.newFlag(fname, "v" + v2, v2 + "~" + v3);
            flag.newFlag(fname, v2 + "~" + v3, "center" + i);
            ref6 = [v2, v3], v1 = ref6[0], v2 = ref6[1];
        }
    }
    return flag.topoly("g" + poly.name);
};

propellor = function(poly) {
    var f, flag, fname, i, l, len, m, o, ref1, ref2, ref3, ref4, v, v1, v2, v3;
    klog("propellor of " + poly.name);
    flag = new Flag();
    for (i = l = 0, ref1 = poly.vertices.length; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
        flag.newV("v" + i, unit(poly.vertices[i]));
    }
    for (i = m = 0, ref2 = poly.faces.length; 0 <= ref2 ? m < ref2 : m > ref2; i = 0 <= ref2 ? ++m : --m) {
        f = poly.faces[i];
        ref3 = f.slice(-2), v1 = ref3[0], v2 = ref3[1];
        for (o = 0, len = f.length; o < len; o++) {
            v = f[o];
            v3 = "" + v;
            flag.newV(v1 + "~" + v2, oneThird(poly.vertices[v1], poly.vertices[v2]));
            fname = i + "f" + v2;
            flag.newFlag("v" + i, v1 + "~" + v2, v2 + "~" + v3);
            flag.newFlag(fname, v1 + "~" + v2, v2 + "~" + v1);
            flag.newFlag(fname, v2 + "~" + v1, "v" + v2);
            flag.newFlag(fname, "v" + v2, v2 + "~" + v3);
            flag.newFlag(fname, v2 + "~" + v3, v1 + "~" + v2);
            ref4 = [v2, v3], v1 = ref4[0], v2 = ref4[1];
        }
    }
    return flag.topoly("p" + poly.name);
};

reflect = function(poly) {
    var i, l, m, ref1, ref2;
    klog("reflection of " + poly.name);
    for (i = l = 0, ref1 = poly.vertices.length; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
        poly.vertices[i] = mult(-1, poly.vertices[i]);
    }
    for (i = m = 0, ref2 = poly.faces.length; 0 <= ref2 ? m < ref2 : m > ref2; i = 0 <= ref2 ? ++m : --m) {
        poly.faces[i] = poly.faces[i].reverse();
    }
    poly.name = "r" + poly.name;
    return poly;
};

chamfer = function(poly, dist) {
    var f, facename, flag, i, l, len, m, normals, obj, ref1, ref2, v1, v1new, v2, v2new;
    klog("chamfer of " + poly.name);
    if (dist != null) {
        dist;
    } else {
        dist = 0.5;
    }
    flag = new Flag();
    normals = poly.normals();
    for (i = l = 0, ref1 = poly.faces.length; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
        f = poly.faces[i];
        v1 = f[f.length - 1];
        v1new = i + "_" + v1;
        for (m = 0, len = f.length; m < len; m++) {
            v2 = f[m];
            flag.newV(v2, mult(1.0 + dist, poly.vertices[v2]));
            v2new = i + "_" + v2;
            flag.newV(v2new, add(poly.vertices[v2], mult(dist * 1.5, normals[i])));
            flag.newFlag("orig" + i, v1new, v2new);
            facename = (ref2 = v1 < v2) != null ? ref2 : (
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
    var centers, cv1name, cv2name, f, flag, fname, i, j, l, m, o, ref1, ref2, ref3, ref4, ref5, v, v1, v1_2, v2, v3;
    klog("whirl of " + poly.name);
    if (n != null) {
        n;
    } else {
        n = 0;
    }
    flag = new Flag();
    for (i = l = 0, ref1 = poly.vertices.length; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
        flag.newV("v" + i, unit(poly.vertices[i]));
    }
    centers = poly.centers();
    for (i = m = 0, ref2 = poly.faces.length; 0 <= ref2 ? m < ref2 : m > ref2; i = 0 <= ref2 ? ++m : --m) {
        f = poly.faces[i];
        ref3 = f.slice(-2), v1 = ref3[0], v2 = ref3[1];
        for (j = o = 0, ref4 = f.length; 0 <= ref4 ? o < ref4 : o > ref4; j = 0 <= ref4 ? ++o : --o) {
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
            ref5 = [v2, v3], v1 = ref5[0], v2 = ref5[1];
        }
    }
    return flag.topoly("w" + poly.name);
};

quinto = function(poly) {
    var centroid, f, flag, i, innerpt, l, len, m, midpt, ref1, ref2, ref3, v1, v2, v3;
    klog("quinto of " + poly.name);
    flag = new Flag();
    for (i = l = 0, ref1 = poly.faces.length; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
        f = poly.faces[i];
        centroid = calcCentroid(f.map(function(idx) {
            return poly.vertices[idx];
        }));
        ref2 = f.slice(-2), v1 = ref2[0], v2 = ref2[1];
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
            ref3 = [v2, v3], v1 = ref3[0], v2 = ref3[1];
        }
    }
    return flag.topoly("q" + poly.name);
};

insetN = function(poly, n, inset_dist, popout_dist) {
    var centers, f, flag, fname, foundAny, i, l, len, len1, m, normals, o, p, q, r, ref1, ref2, ref3, v, v1, v2;
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
    for (i = l = 0, ref1 = poly.vertices.length; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
        p = poly.vertices[i];
        flag.newV("v" + i, p);
    }
    normals = poly.normals();
    centers = poly.centers();
    for (i = m = 0, ref2 = poly.faces.length; 0 <= ref2 ? m < ref2 : m > ref2; i = 0 <= ref2 ? ++m : --m) {
        f = poly.faces[i];
        if (f.length === n || n === 0) {
            for (o = 0, len = f.length; o < len; o++) {
                v = f[o];
                flag.newV("f" + i + "v" + v, add(tween(poly.vertices[v], centers[i], inset_dist), mult(popout_dist, normals[i])));
            }
        }
    }
    foundAny = false;
    for (i = q = 0, ref3 = poly.faces.length; 0 <= ref3 ? q < ref3 : q > ref3; i = 0 <= ref3 ? ++q : --q) {
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

extrudeN = function(poly, n) {
    var newpoly;
    newpoly = insetN(poly, n, 0.0, 0.3);
    newpoly.name = "x" + n + poly.name;
    return newpoly;
};

loft = function(poly, n, alpha) {
    var newpoly;
    newpoly = insetN(poly, n, alpha, 0.0);
    newpoly.name = "l" + n + poly.name;
    return newpoly;
};

hollow = function(poly, inset_dist, thickness) {
    var centers, dualnormals, f, flag, fname, i, l, len, len1, m, normals, o, p, q, r, ref1, ref2, ref3, v, v1, v2;
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
    for (i = l = 0, ref1 = poly.vertices.length; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
        p = poly.vertices[i];
        flag.newV("v" + i, p);
        flag.newV("downv" + i, add(p, mult(-1 * thickness, dualnormals[i])));
    }
    for (i = m = 0, ref2 = poly.faces.length; 0 <= ref2 ? m < ref2 : m > ref2; i = 0 <= ref2 ? ++m : --m) {
        f = poly.faces[i];
        for (o = 0, len = f.length; o < len; o++) {
            v = f[o];
            flag.newV("fin" + i + "v" + v, tween(poly.vertices[v], centers[i], inset_dist));
            flag.newV("findown" + i + "v" + v, add(tween(poly.vertices[v], centers[i], inset_dist), mult(-1 * thickness, normals[i])));
        }
    }
    for (i = q = 0, ref3 = poly.faces.length; 0 <= ref3 ? q < ref3 : q > ref3; i = 0 <= ref3 ? ++q : --q) {
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

perspectiva1 = function(poly) {
    var centers, f, flag, i, l, len, m, o, ref1, ref2, ref3, ref4, v, v1, v12, v2, v21, v23, v3, vert1, vert2, vert3;
    klog("stella of " + poly.name);
    centers = poly.centers();
    flag = new Flag();
    for (i = l = 0, ref1 = poly.vertices.length; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
        flag.newV("v" + i, poly.vertices[i]);
    }
    for (i = m = 0, ref2 = poly.faces.length; 0 <= ref2 ? m < ref2 : m > ref2; i = 0 <= ref2 ? ++m : --m) {
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
            ref3 = [v2, v3], v1 = ref3[0], v2 = ref3[1];
            ref4 = [vert2, vert3], vert1 = ref4[0], vert2 = ref4[1];
        }
    }
    return flag.topoly("P" + poly.name);
};

trisub = function(poly, n) {
    var EPSILON_CLOSE, f, faces, fn, i, i1, i2, i3, j, l, len, m, newVs, newpos, o, pos, q, r, ref1, ref10, ref11, ref12, ref13, ref14, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, s, t, u, uniqVs, uniqmap, v, v1, v2, v21, v3, v31, vmap, w, x, y, z;
    klog("trisub of " + poly.name);
    if (n != null) {
        n;
    } else {
        n = 2;
    }
    for (fn = l = 0, ref1 = poly.faces.length; 0 <= ref1 ? l < ref1 : l > ref1; fn = 0 <= ref1 ? ++l : --l) {
        if (poly.faces[fn].length !== 3) {
            return poly;
        }
    }
    newVs = [];
    vmap = {};
    pos = 0;
    for (fn = m = 0, ref2 = poly.faces.length; 0 <= ref2 ? m < ref2 : m > ref2; fn = 0 <= ref2 ? ++m : --m) {
        f = poly.faces[fn];
        ref3 = f.slice(-3), i1 = ref3[0], i2 = ref3[1], i3 = ref3[2];
        v1 = poly.vertices[i1];
        v2 = poly.vertices[i2];
        v3 = poly.vertices[i3];
        v21 = sub(v2, v1);
        v31 = sub(v3, v1);
        for (i = o = 0, ref4 = n; 0 <= ref4 ? o <= ref4 : o >= ref4; i = 0 <= ref4 ? ++o : --o) {
            for (j = q = 0, ref5 = n - i; 0 <= ref5 ? q <= ref5 : q >= ref5; j = 0 <= ref5 ? ++q : --q) {
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
    ref6 = newVs.entries();
    for (r = 0, len = ref6.length; r < len; r++) {
        ref7 = ref6[r], i = ref7[0], v = ref7[1];
        if (indexOf.call(uniqmap, i) >= 0) {
            continue;
        }
        uniqmap[i] = newpos;
        uniqVs.push(v);
        for (j = s = ref8 = i + 1, ref9 = newVs.length; ref8 <= ref9 ? s < ref9 : s > ref9; j = ref8 <= ref9 ? ++s : --s) {
            w = newVs[j];
            if (mag(sub(v, w)) < EPSILON_CLOSE) {
                uniqmap[j] = newpos;
            }
        }
        newpos++;
    }
    faces = [];
    for (fn = t = 0, ref10 = poly.faces.length; 0 <= ref10 ? t < ref10 : t > ref10; fn = 0 <= ref10 ? ++t : --t) {
        for (i = u = 0, ref11 = n; 0 <= ref11 ? u < ref11 : u > ref11; i = 0 <= ref11 ? ++u : --u) {
            for (j = x = 0, ref12 = n - i; 0 <= ref12 ? x < ref12 : x > ref12; j = 0 <= ref12 ? ++x : --x) {
                faces.push([uniqmap[vmap["v" + fn + "-" + i + "-" + j]], uniqmap[vmap["v" + fn + "-" + (i + 1) + "-" + j]], uniqmap[vmap["v" + fn + "-" + i + "-" + (j + 1)]]]);
            }
        }
        for (i = y = 1, ref13 = n; 1 <= ref13 ? y < ref13 : y > ref13; i = 1 <= ref13 ? ++y : --y) {
            for (j = z = 0, ref14 = n - i; 0 <= ref14 ? z < ref14 : z > ref14; j = 0 <= ref14 ? ++z : --z) {
                faces.push([uniqmap[vmap["v" + fn + "-" + i + "-" + j]], uniqmap[vmap["v" + fn + "-" + i + "-" + (j + 1)]], uniqmap[vmap["v" + fn + "-" + (i - 1) + "-" + (j + 1)]]]);
            }
        }
    }
    return new Polyhedron("u" + n + poly.name, faces, uniqVs);
};

module.exports = {
    dual: dual,
    trisub: trisub,
    perspectiva1: perspectiva1,
    kisN: kisN,
    ambo: ambo,
    gyro: gyro,
    propellor: propellor,
    reflect: reflect,
    chamfer: chamfer,
    whirl: whirl,
    quinto: quinto,
    insetN: insetN,
    extrudeN: extrudeN,
    loft: loft,
    hollow: hollow
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9wby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsaUxBQUE7SUFBQTs7QUFrQ0EsTUFBbUIsT0FBQSxDQUFRLEtBQVIsQ0FBbkIsRUFBRSxtQkFBRixFQUFVOztBQUNSLFlBQWMsT0FBQSxDQUFRLE9BQVI7O0FBQ2QsYUFBZSxPQUFBLENBQVEsY0FBUjs7QUFRWDtJQUVDLGNBQUE7UUFDQyxJQUFDLENBQUEsS0FBRCxHQUFZO1FBQ1osSUFBQyxDQUFBLFFBQUQsR0FBWTtRQUNaLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFIYjs7bUJBS0gsSUFBQSxHQUFNLFNBQUMsUUFBRCxFQUFXLFdBQVg7UUFFRixJQUFHLENBQUksSUFBQyxDQUFBLFFBQVMsQ0FBQSxRQUFBLENBQWpCO1lBQ0ksSUFBQyxDQUFBLFFBQVMsQ0FBQSxRQUFBLENBQVYsR0FBc0I7bUJBQ3RCLElBQUMsQ0FBQSxRQUFTLENBQUEsUUFBQSxDQUFWLEdBQXNCLFlBRjFCOztJQUZFOzttQkFNTixPQUFBLEdBQVMsU0FBQyxRQUFELEVBQVcsU0FBWCxFQUFzQixTQUF0QjtBQUVMLFlBQUE7O2dCQUFPLENBQUEsUUFBQTs7Z0JBQUEsQ0FBQSxRQUFBLElBQWE7O2VBQ3BCLElBQUMsQ0FBQSxLQUFNLENBQUEsUUFBQSxDQUFVLENBQUEsU0FBQSxDQUFqQixHQUE4QjtJQUh6Qjs7bUJBS1QsTUFBQSxHQUFRLFNBQUMsSUFBRDtBQUVKLFlBQUE7O1lBRkssT0FBSzs7UUFFVixJQUFBLEdBQU8sSUFBSSxVQUFKLENBQWUsSUFBZjtRQUVQLElBQUEsQ0FBSyxRQUFMLEVBQWMsSUFBZDtRQUVBLEdBQUEsR0FBTTtBQUNOO0FBQUEsYUFBQSxTQUFBOztZQUNJLElBQUksQ0FBQyxRQUFTLENBQUEsR0FBQSxDQUFkLEdBQXFCLElBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQTtZQUMvQixJQUFDLENBQUEsUUFBUyxDQUFB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dGVudCI6WyIjIyNcbjAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICAgICBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgICBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgICBcbiAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAwMDAwMDAwICAgICBcbiMjI1xuIyBQb2x5aMOpZHJvbmlzbWVcbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgQSB0b3kgZm9yIGNvbnN0cnVjdGluZyBhbmQgbWFuaXB1bGF0aW5nIHBvbHloZWRyYSBhbmQgb3RoZXIgbWVzaGVzXG4jXG4jIEluY2x1ZGVzIGltcGxlbWVudGF0aW9uIG9mIHRoZSBjb253YXkgcG9seWhlZHJhbCBvcGVyYXRvcnMgZGVyaXZlZFxuIyBmcm9tIGNvZGUgYnkgbWF0aGVtYXRpY2lhbiBhbmQgbWF0aGVtYXRpY2FsIHNjdWxwdG9yXG4jIEdlb3JnZSBXLiBIYXJ0IGh0dHA6I3d3dy5nZW9yZ2VoYXJ0LmNvbS9cbiNcbiMgQ29weXJpZ2h0IDIwMTksIEFuc2VsbSBMZXZza2F5YVxuIyBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2VcbiNcbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBcbiMgUG9seWhlZHJvbiBGbGFnIENvbnN0cnVjdFxuI1xuIyBBIEZsYWcgaXMgYW4gYXNzb2NpYXRpdmUgdHJpcGxlIG9mIGEgZmFjZSBpbmRleCBhbmQgdHdvIGFkamFjZW50IHZlcnRleCB2ZXJ0aWR4cyxcbiMgbGlzdGVkIGluIGdlb21ldHJpYyBjbG9ja3dpc2Ugb3JkZXIgKHN0YXJpbmcgaW50byB0aGUgbm9ybWFsKVxuI1xuIyBGYWNlX2kgLT4gVl9pIC0+IFZfalxuI1xuIyBUaGV5IGFyZSBhIHVzZWZ1bCBhYnN0cmFjdGlvbiBmb3IgZGVmaW5pbmcgdG9wb2xvZ2ljYWwgdHJhbnNmb3JtYXRpb25zIG9mIHRoZSBwb2x5aGVkcmFsIG1lc2gsIGFzXG4jIG9uZSBjYW4gcmVmZXIgdG8gdmVydGljZXMgYW5kIGZhY2VzIHRoYXQgZG9uJ3QgeWV0IGV4aXN0IG9yIGhhdmVuJ3QgYmVlbiB0cmF2ZXJzZWQgeWV0IGluIHRoZVxuIyB0cmFuc2Zvcm1hdGlvbiBjb2RlLlxuI1xuIyBBIGZsYWcgaXMgc2ltaWxhciBpbiBjb25jZXB0IHRvIGEgZGlyZWN0ZWQgaGFsZmVkZ2UgaW4gaGFsZmVkZ2UgZGF0YSBzdHJ1Y3R1cmVzLlxuXG57IGtlcnJvciwga2xvZyB9ID0gcmVxdWlyZSAna3hrJ1xueyBpbnRlcnNlY3QgfSA9IHJlcXVpcmUgJy4vZ2VvJ1xueyBQb2x5aGVkcm9uIH0gPSByZXF1aXJlICcuL3BvbHloZWRyb24nXG5cbiMgMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiMgMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcblxuY2xhc3MgRmxhZ1xuICAgIFxuICAgIEA6IC0+XG4gICAgICAgIEBmbGFncyAgICA9IHt9ICMgZmxhZ3NbZmFjZV1bdmVydGV4XSA9IG5leHQgdmVydGV4XG4gICAgICAgIEB2ZXJ0aWR4cyA9IHt9ICMgW3N5bWJvbGljIG5hbWVzXSBob2xkcyB2ZXJ0ZXggaW5kZXhcbiAgICAgICAgQHZlcnRpY2VzID0ge30gIyBYWVogY29vcmRpbmF0ZXNcbiAgXG4gICAgbmV3VjogKHZlcnROYW1lLCBjb29yZGluYXRlcykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBAdmVydGlkeHNbdmVydE5hbWVdXG4gICAgICAgICAgICBAdmVydGlkeHNbdmVydE5hbWVdID0gMFxuICAgICAgICAgICAgQHZlcnRpY2VzW3ZlcnROYW1lXSA9IGNvb3JkaW5hdGVzXG4gIFxuICAgIG5ld0ZsYWc6IChmYWNlTmFtZSwgdmVydE5hbWUxLCB2ZXJ0TmFtZTIpIC0+XG4gICAgICAgIFxuICAgICAgICBAZmxhZ3NbZmFjZU5hbWVdID89IHt9XG4gICAgICAgIEBmbGFnc1tmYWNlTmFtZV1bdmVydE5hbWUxXSA9IHZlcnROYW1lMlxuICBcbiAgICB0b3BvbHk6IChuYW1lPSdwb2x5aGVkcm9uJykgLT5cblxuICAgICAgICBwb2x5ID0gbmV3IFBvbHloZWRyb24gbmFtZVxuICAgIFxuICAgICAgICBrbG9nICd0b3BvbHknIEBcbiAgICAgICAgXG4gICAgICAgIGN0ciA9IDAgXG4gICAgICAgIGZvciBpLHYgb2YgQHZlcnRpZHhzIFxuICAgICAgICAgICAgcG9seS52ZXJ0aWNlc1tjdHJdID0gQHZlcnRpY2VzW2ldXG4gICAgICAgICAgICBAdmVydGlkeHNbaV0gPSBjdHIgIyBudW1iZXIgdGhlIHZlcnRpY2VzXG4gICAgICAgICAgICBjdHIrK1xuICAgICAgICAgICAgXG4gICAgICAgIGN0ciA9IDBcbiAgICAgICAgZm9yIGksZmFjZSBvZiBAZmxhZ3NcbiAgICAgICAgICAgIG5ld0ZhY2UgPSBbXVxuICAgICAgICAgICAgZm9yIGosdjAgb2YgZmFjZVxuICAgICAgICAgICAgICAgIHYgPSB2MCAjIGFueSB2ZXJ0ZXggYXMgc3RhcnRpbmcgcG9pbnRcbiAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgIyBrbG9nICd2MCcgdiwgdjBcbiAgICAgICAgICAgIG5ld0ZhY2UucHVzaCBAdmVydGlkeHNbdl0gIyByZWNvcmQgaW5kZXhcbiAgICAgICAgICAgIHYgPSBAZmxhZ3NbaV1bdl0gIyBnb3RvIG5leHQgdmVydGV4XG4gICAgICAgICAgICBmYWNlQ291bnQgPSAwXG4gICAgICAgICAgICB3aGlsZSB2ICE9IHYwICMgbG9vcCB1bnRpbCBiYWNrIHRvIHN0YXJ0XG4gICAgICAgICAgICAgICAgbmV3RmFjZS5wdXNoIEB2ZXJ0aWR4c1t2XVxuICAgICAgICAgICAgICAgIHYgPSBAZmxhZ3NbaV1bdl1cbiAgICAgICAgICAgICAgICBpZiBmYWNlQ291bnQrKyA+IDEwMCAjIHByZXZlbnQgaW5maW5pdGUgbG9vcCBvbiBiYWRseSBmb3JtZWQgZmxhZ3NldHNcbiAgICAgICAgICAgICAgICAgICAga2Vycm9yIFwiQmFkIGZsYWcgd2l0aCBuZXZlcmVuZGluZyBmYWNlOlwiIGksIEBmbGFnc1tpXVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgcG9seS5mYWNlc1tjdHJdID0gbmV3RmFjZVxuICAgICAgICAgICAgY3RyKytcbiAgICAgICAga2xvZyAncG9seScgcG9seVxuICAgICAgICBwb2x5XG5cbiMgUG9seWhlZHJvbiBPcGVyYXRvcnNcbiNcbiMgZm9yIGVhY2ggdmVydGV4IG9mIG5ldyBwb2x5aGVkcm9uXG4jICAgICBjYWxsIG5ld1YoVm5hbWUsIHh5eikgd2l0aCBhIHN5bWJvbGljIG5hbWUgYW5kIGNvb3JkaW5hdGVzXG4jXG4jIGZvciBlYWNoIGZsYWcgb2YgbmV3IHBvbHloZWRyb25cbiMgICAgIGNhbGwgbmV3RmxhZyhGbmFtZSwgVm5hbWUxLCBWbmFtZTIpIHdpdGggYSBzeW1ib2xpYyBuYW1lIGZvciB0aGUgbmV3IGZhY2VcbiMgICAgIGFuZCB0aGUgc3ltYm9saWMgbmFtZSBmb3IgdHdvIHZlcnRpY2VzIGZvcm1pbmcgYW4gb3JpZW50ZWQgZWRnZVxuI1xuIyBPcmllbnRhdGlvbiBtdXN0IGJlIGRlYWx0IHdpdGggcHJvcGVybHkgdG8gbWFrZSBhIG1hbmlmb2xkIG1lc2hcbiMgU3BlY2lmaWNhbGx5LCBubyBlZGdlIHYxLT52MiBjYW4gZXZlciBiZSBjcm9zc2VkIGluIHRoZSBzYW1lIGRpcmVjdGlvbiBieSB0d28gZGlmZmVyZW50IGZhY2VzXG4jIGNhbGwgdG9wb2x5KCkgdG8gYXNzZW1ibGUgZmxhZ3MgaW50byBwb2x5aGVkcm9uIHN0cnVjdHVyZSBieSBmb2xsb3dpbmcgdGhlIG9yYml0c1xuIyBvZiB0aGUgdmVydGV4IG1hcHBpbmcgc3RvcmVkIGluIHRoZSBmbGFnc2V0IGZvciBlYWNoIG5ldyBmYWNlXG5cbm1pZE5hbWUgPSAodjEsIHYyKSAtPiB2MTx2MiBhbmQgXCIje3YxfV8je3YyfVwiIG9yIFwiI3t2Mn1fI3t2MX1cIiAjIHVuaXF1ZSBuYW1lcyBvZiBtaWRwb2ludHNcblxuIyAwMDAwMDAwICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgXG5cbmR1YWwgPSAocG9seSkgLT5cblxuICAgIGtsb2cgXCJkdWFsIG9mICN7cG9seS5uYW1lfVwiICNwb2x5XG4gIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZhY2UgPSBbXSAjIG1ha2UgdGFibGUgb2YgZmFjZSBhcyBmbiBvZiBlZGdlXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF0gIyBjcmVhdGUgZW1wdHkgYXNzb2NpYXRpdmUgdGFibGVcbiAgICAgICAgZmFjZVtpXSA9IHt9XG5cbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IGZbZi5sZW5ndGgtMV0gIyBsYXN0IHZlcnRleFxuICAgICAgICBmb3IgdjIgaW4gZiAjIGFzc3VtZXMgdGhhdCBubyAyIGZhY2VzIHNoYXJlIGFuIGVkZ2UgaW4gdGhlIHNhbWUgb3JpZW50YXRpb24hXG4gICAgICAgICAgICBmYWNlW3YxXVtcInYje3YyfVwiXSA9IFwiI3tpfVwiXG4gICAgICAgICAgICB2MSA9IHYyICMgY3VycmVudCBiZWNvbWVzIHByZXZpb3VzXG4gIFxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGZsYWcubmV3ViBcIiN7aX1cIiBjZW50ZXJzW2ldXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gZltmLmxlbmd0aC0xXSAjcHJldmlvdXMgdmVydGV4XG4gICAgICAgIGZvciB2MiBpbiBmXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgdjEsIGZhY2VbdjJdW1widiN7djF9XCJdLCBcIiN7aX1cIlxuICAgICAgICAgICAgdjE9djIgIyBjdXJyZW50IGJlY29tZXMgcHJldmlvdXNcbiAgXG4gICAgZHBvbHkgPSBmbGFnLnRvcG9seSgpICMgYnVpbGQgdG9wb2xvZ2ljYWwgZHVhbCBmcm9tIGZsYWdzXG4gIFxuICAgICMgbWF0Y2ggRiBpbmRleCBvcmRlcmluZyB0byBWIGluZGV4IG9yZGVyaW5nIG9uIGR1YWxcbiAgICBzb3J0RiA9IFtdXG4gICAgZm9yIGYgaW4gZHBvbHkuZmFjZXNcbiAgICAgICAgayA9IGludGVyc2VjdCBwb2x5LmZhY2VzW2ZbMF1dLCBwb2x5LmZhY2VzW2ZbMV1dLCBwb2x5LmZhY2VzW2ZbMl1dXG4gICAgICAgIHNvcnRGW2tdID0gZlxuICAgIGRwb2x5LmZhY2VzID0gc29ydEZcbiAgXG4gICAgaWYgcG9seS5uYW1lWzBdICE9IFwiZFwiXG4gICAgICAgIGRwb2x5Lm5hbWUgPSBcImQje3BvbHkubmFtZX1cIlxuICAgIGVsc2UgXG4gICAgICAgIGRwb2x5Lm5hbWUgPSBwb2x5Lm5hbWUuc2xpY2UgMVxuICBcbiAgICBkcG9seVxuXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIFxuIyAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG4jIEtpcyAoYWJicmV2aWF0ZWQgZnJvbSB0cmlha2lzKSB0cmFuc2Zvcm1zIGFuIE4tc2lkZWQgZmFjZSBpbnRvIGFuIE4tcHlyYW1pZCByb290ZWQgYXQgdGhlXG4jIHNhbWUgYmFzZSB2ZXJ0aWNlcy4gb25seSBraXMgbi1zaWRlZCBmYWNlcywgYnV0IG49PTAgbWVhbnMga2lzIGFsbC5cblxua2lzTiA9IChwb2x5LCBuLCBhcGV4ZGlzdCkgLT5cblxuICAgIG4gPz0gMFxuICAgIGFwZXhkaXN0ID89IDAuMVxuXG4gICAga2xvZyBcImtpcyBvZiAje24gYW5kIFwiI3tufS1zaWRlZFwiIG9yICdhbGwnfSBmYWNlcyBvZiAje3BvbHkubmFtZX1cIiBwb2x5XG5cbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgIHAgPSBwb2x5LnZlcnRpY2VzW2ldICMgZWFjaCBvbGQgdmVydGV4IGlzIGEgbmV3IHZlcnRleFxuICAgICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHBcbiAgXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm91bmRBbnkgPSBmYWxzZVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gXCJ2I3tmW2YubGVuZ3RoLTFdfVwiXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIHYyID0gXCJ2I3t2fVwiXG4gICAgICAgICAgICBpZiBmLmxlbmd0aCA9PSBuIG9yIG4gPT0gMFxuICAgICAgICAgICAgICAgIGZvdW5kQW55ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBhcGV4ID0gXCJhcGV4I3tpfVwiXG4gICAgICAgICAgICAgICAgZm5hbWUgPSBcIiN7aX0je3YxfVwiXG4gICAgICAgICAgICAgICAgIyBuZXcgdmVydGljZXMgaW4gY2VudGVycyBvZiBuLXNpZGVkIGZhY2VcbiAgICAgICAgICAgICAgICBmbGFnLm5ld1YgYXBleCwgYWRkIGNlbnRlcnNbaV0sIG11bHQgYXBleGRpc3QsIG5vcm1hbHNbaV1cbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsICAgdjEsICAgdjIgIyB0aGUgb2xkIGVkZ2Ugb2Ygb3JpZ2luYWwgZmFjZVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgICB2MiwgYXBleCAjIHVwIHRvIGFwZXggb2YgcHlyYW1pZFxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgYXBleCwgICB2MSAjIGFuZCBiYWNrIGRvd24gYWdhaW5cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCIje2l9XCIsIHYxLCB2MiAgIyBzYW1lIG9sZCBmbGFnLCBpZiBub24tblxuICAgICAgICAgICAgXG4gICAgICAgICAgICB2MSA9IHYyICMgY3VycmVudCBiZWNvbWVzIHByZXZpb3VzXG4gIFxuICAgIGlmIG5vdCBmb3VuZEFueVxuICAgICAgICBrbG9nIFwiTm8gI3tufS1mb2xkIGNvbXBvbmVudHMgd2VyZSBmb3VuZC5cIlxuICBcbiAgICBmbGFnLnRvcG9seSBcImsje259I3twb2x5Lm5hbWV9XCJcblxuIyAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuXG4jIFRoZSBiZXN0IHdheSB0byB0aGluayBvZiB0aGUgYW1ibyBvcGVyYXRvciBpcyBhcyBhIHRvcG9sb2dpY2FsIFwidHdlZW5cIiBiZXR3ZWVuIGEgcG9seWhlZHJvblxuIyBhbmQgaXRzIGR1YWwgcG9seWhlZHJvbi4gIFRodXMgdGhlIGFtYm8gb2YgYSBkdWFsIHBvbHloZWRyb24gaXMgdGhlIHNhbWUgYXMgdGhlIGFtYm8gb2YgdGhlXG4jIG9yaWdpbmFsLiBBbHNvIGNhbGxlZCBcIlJlY3RpZnlcIi5cblxuYW1ibyA9IChwb2x5KSAtPlxuICAgIFxuICAgIGtsb2cgXCJhbWJvIG9mICN7cG9seS5uYW1lfVwiXG4gICAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgIyBGb3IgZWFjaCBmYWNlIGYgaW4gdGhlIG9yaWdpbmFsIHBvbHlcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UoLTIpXG4gICAgICAgIGZvciB2MyBpbiBmXG4gICAgICAgICAgICBpZiB2MSA8IHYyICMgdmVydGljZXMgYXJlIHRoZSBtaWRwb2ludHMgb2YgYWxsIGVkZ2VzIG9mIG9yaWdpbmFsIHBvbHlcbiAgICAgICAgICAgICAgICBmbGFnLm5ld1YgbWlkTmFtZSh2MSx2MiksIG1pZHBvaW50IHBvbHkudmVydGljZXNbdjFdLCBwb2x5LnZlcnRpY2VzW3YyXVxuICAgICAgICAgICAgIyBmYWNlIGNvcnJlc3BvbmRzIHRvIHRoZSBvcmlnaW5hbCBmXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJvcmlnI3tpfVwiICBtaWROYW1lKHYxLHYyKSwgbWlkTmFtZSh2Mix2MylcbiAgICAgICAgICAgICMgZmFjZSBjb3JyZXNwb25kcyB0byAodGhlIHRydW5jYXRlZCkgdjJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImR1YWwje3YyfVwiIG1pZE5hbWUodjIsdjMpLCBtaWROYW1lKHYxLHYyKVxuICAgICAgICAgICAgIyBzaGlmdCBvdmVyIG9uZVxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICBcbiAgICBmbGFnLnRvcG9seSBcImEje3BvbHkubmFtZX1cIlxuXG4jICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwMCAgICAwMDAwMCAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG5cbmd5cm8gPSAocG9seSkgLT5cblxuICAgIGtsb2cgXCJneXJvIG9mICN7cG9seS5uYW1lfVwiXG4gIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgIGZsYWcubmV3ViBcInYje2l9XCIgdW5pdCBwb2x5LnZlcnRpY2VzW2ldICMgZWFjaCBvbGQgdmVydGV4IGlzIGEgbmV3IHZlcnRleFxuXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpICMgbmV3IHZlcnRpY2VzIGluIGNlbnRlciBvZiBlYWNoIGZhY2VcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBmbGFnLm5ld1YgXCJjZW50ZXIje2l9XCIgdW5pdCBjZW50ZXJzW2ldXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSgtMilcbiAgICAgICAgZm9yIGogaW4gWzAuLi5mLmxlbmd0aF1cbiAgICAgICAgICAgIHYgPSBmW2pdXG4gICAgICAgICAgICB2MyA9IHZcbiAgICAgICAgICAgIGZsYWcubmV3Vih2MStcIn5cIit2Miwgb25lVGhpcmQocG9seS52ZXJ0aWNlc1t2MV0scG9seS52ZXJ0aWNlc1t2Ml0pKTsgICMgbmV3IHYgaW4gZmFjZVxuICAgICAgICAgICAgZm5hbWUgPSBpK1wiZlwiK3YxXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIFwiY2VudGVyI3tpfVwiICB2MStcIn5cIit2MiAjIGZpdmUgbmV3IGZsYWdzXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIHYxK1wiflwiK3YyLCAgdjIrXCJ+XCIrdjFcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgdjIrXCJ+XCIrdjEsICBcInYje3YyfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIFwidiN7djJ9XCIgICAgIHYyK1wiflwiK3YzXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIHYyK1wiflwiK3YzLCAgXCJjZW50ZXIje2l9XCJcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M10gIyBzaGlmdCBvdmVyIG9uZVxuICBcbiAgICBmbGFnLnRvcG9seSBcImcje3BvbHkubmFtZX1cIlxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4jIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG4jIGJ1aWxkcyBhIG5ldyAnc2tldyBmYWNlJyBieSBtYWtpbmcgbmV3IHBvaW50cyBhbG9uZyBlZGdlcywgMS8zcmQgdGhlIGRpc3RhbmNlIGZyb20gdjEtPnYyLFxuIyB0aGVuIGNvbm5lY3RpbmcgdGhlc2UgaW50byBhIG5ldyBpbnNldCBmYWNlLiAgVGhpcyBicmVha3Mgcm90YXRpb25hbCBzeW1tZXRyeSBhYm91dCB0aGVcbiMgZmFjZXMsIHdoaXJsaW5nIHRoZW0gaW50byBneXJlc1xuXG5wcm9wZWxsb3IgPSAocG9seSkgLT5cblxuICAgIGtsb2cgXCJwcm9wZWxsb3Igb2YgI3twb2x5Lm5hbWV9XCJcbiAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF0gIyBlYWNoIG9sZCB2ZXJ0ZXggaXMgYSBuZXcgdmVydGV4XG4gICAgICAgIGZsYWcubmV3ViBcInYje2l9XCIgdW5pdCBwb2x5LnZlcnRpY2VzW2ldXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSgtMilcbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgdjMgPSBcIiN7dn1cIlxuICAgICAgICAgICAgZmxhZy5uZXdWKHYxK1wiflwiK3YyLCBvbmVUaGlyZChwb2x5LnZlcnRpY2VzW3YxXSwgcG9seS52ZXJ0aWNlc1t2Ml0pKTsgICMgbmV3IHYgaW4gZmFjZSwgMS8zcmQgYWxvbmcgZWRnZVxuICAgICAgICAgICAgZm5hbWUgPSBcIiN7aX1mI3t2Mn1cIjtcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcInYje2l9XCIsIHYxK1wiflwiK3YyLCAgdjIrXCJ+XCIrdjMpOyAjIGZpdmUgbmV3IGZsYWdzXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsICAgdjErXCJ+XCIrdjIsICB2MitcIn5cIit2MSk7XG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsICAgdjIrXCJ+XCIrdjEsICAgICBcInYje3YyfVwiKTtcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgICAgICBcInYje3YyfVwiLCAgdjIrXCJ+XCIrdjMpO1xuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCAgIHYyK1wiflwiK3YzLCAgdjErXCJ+XCIrdjIpO1xuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICAgIFxuICAgIGZsYWcudG9wb2x5IFwicCN7cG9seS5uYW1lfVwiXG5cbiMgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICBcblxucmVmbGVjdCA9IChwb2x5KSAtPiAjIGdlb21ldHJpYyByZWZsZWN0aW9uIHRocm91Z2ggb3JpZ2luXG5cbiAgICBrbG9nIFwicmVmbGVjdGlvbiBvZiAje3BvbHkubmFtZX1cIlxuICAgICMgcmVmbGVjdCBlYWNoIHBvaW50IHRocm91Z2ggb3JpZ2luXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgcG9seS52ZXJ0aWNlc1tpXSA9IG11bHQgLTEsIHBvbHkudmVydGljZXNbaV1cbiAgICAjIHJlcGFpciBjbG9ja3dpc2UtbmVzcyBvZiBmYWNlc1xuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIHBvbHkuZmFjZXNbaV0gPSBwb2x5LmZhY2VzW2ldLnJldmVyc2UoKVxuICAgIHBvbHkubmFtZSA9IFwiciN7cG9seS5uYW1lfVwiXG4gICAgcG9seVxuXG4jICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbiMgQSB0cnVuY2F0aW9uIGFsb25nIGEgcG9seWhlZHJvbidzIGVkZ2VzLlxuIyBDaGFtZmVyaW5nIG9yIGVkZ2UtdHJ1bmNhdGlvbiBpcyBzaW1pbGFyIHRvIGV4cGFuc2lvbiwgbW92aW5nIGZhY2VzIGFwYXJ0IGFuZCBvdXR3YXJkLFxuIyBidXQgYWxzbyBtYWludGFpbnMgdGhlIG9yaWdpbmFsIHZlcnRpY2VzLiBBZGRzIGEgbmV3IGhleGFnb25hbCBmYWNlIGluIHBsYWNlIG9mIGVhY2hcbiMgb3JpZ2luYWwgZWRnZS5cbiMgQSBwb2x5aGVkcm9uIHdpdGggZSBlZGdlcyB3aWxsIGhhdmUgYSBjaGFtZmVyZWQgZm9ybSBjb250YWluaW5nIDJlIG5ldyB2ZXJ0aWNlcyxcbiMgM2UgbmV3IGVkZ2VzLCBhbmQgZSBuZXcgaGV4YWdvbmFsIGZhY2VzLiAtLSBXaWtpcGVkaWFcbiMgU2VlIGFsc28gaHR0cDojZG1jY29vZXkuY29tL3BvbHloZWRyYS9DaGFtZmVyLmh0bWxcbiNcbiMgVGhlIGRpc3QgcGFyYW1ldGVyIGNvdWxkIGNvbnRyb2wgaG93IGRlZXBseSB0byBjaGFtZmVyLlxuIyBCdXQgSSdtIG5vdCBzdXJlIGFib3V0IGltcGxlbWVudGluZyB0aGF0IHlldC5cbiNcbiMgUTogd2hhdCBpcyB0aGUgZHVhbCBvcGVyYXRpb24gb2YgY2hhbWZlcmluZz8gSS5lLlxuIyBpZiBjWCA9IGR4ZFgsIGFuZCB4WCA9IGRjZFgsIHdoYXQgb3BlcmF0aW9uIGlzIHg/XG5cbiMgV2UgY291bGQgXCJhbG1vc3RcIiBkbyB0aGlzIGluIHRlcm1zIG9mIGFscmVhZHktaW1wbGVtZW50ZWQgb3BlcmF0aW9uczpcbiMgY0MgPSB0NGRhQyA9IHQ0akMsIGNPID0gdDNkYU8sIGNEID0gdDVkYUQsIGNJID0gdDNkYUlcbiMgQnV0IGl0IGRvZXNuJ3Qgd29yayBmb3IgY2FzZXMgbGlrZSBULlxuXG5jaGFtZmVyID0gKHBvbHksIGRpc3QpIC0+XG4gICAga2xvZyBcImNoYW1mZXIgb2YgI3twb2x5Lm5hbWV9XCJcbiAgXG4gICAgZGlzdCA/PSAwLjVcbiAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gIFxuICAgICMgRm9yIGVhY2ggZmFjZSBmIGluIHRoZSBvcmlnaW5hbCBwb2x5XG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgdjEgPSBmW2YubGVuZ3RoLTFdXG4gICAgICAgIHYxbmV3ID0gaSArIFwiX1wiICsgdjFcbiAgICBcbiAgICAgICAgZm9yIHYyIGluIGZcbiAgICAgICAgICAjIFRPRE86IGZpZ3VyZSBvdXQgd2hhdCBkaXN0YW5jZXMgd2lsbCBnaXZlIHVzIGEgcGxhbmFyIGhleCBmYWNlLlxuICAgICAgICAgICMgTW92ZSBlYWNoIG9sZCB2ZXJ0ZXggZnVydGhlciBmcm9tIHRoZSBvcmlnaW4uXG4gICAgICAgICAgZmxhZy5uZXdWKHYyLCBtdWx0KDEuMCArIGRpc3QsIHBvbHkudmVydGljZXNbdjJdKSlcbiAgICAgICAgICAjIEFkZCBhIG5ldyB2ZXJ0ZXgsIG1vdmVkIHBhcmFsbGVsIHRvIG5vcm1hbC5cbiAgICAgICAgICB2Mm5ldyA9IGkgKyBcIl9cIiArIHYyXG4gICAgICAgICAgZmxhZy5uZXdWKHYybmV3LCBhZGQocG9seS52ZXJ0aWNlc1t2Ml0sIG11bHQoZGlzdCoxLjUsIG5vcm1hbHNbaV0pKSlcbiAgICAgICAgICAjIEZvdXIgbmV3IGZsYWdzOlxuICAgICAgICAgICMgT25lIHdob3NlIGZhY2UgY29ycmVzcG9uZHMgdG8gdGhlIG9yaWdpbmFsIGZhY2U6XG4gICAgICAgICAgZmxhZy5uZXdGbGFnKFwib3JpZyN7aX1cIiwgdjFuZXcsIHYybmV3KVxuICAgICAgICAgICMgQW5kIHRocmVlIGZvciB0aGUgZWRnZXMgb2YgdGhlIG5ldyBoZXhhZ29uOlxuICAgICAgICAgIGZhY2VuYW1lID0gKHYxPHYyID8gXCJoZXgje3YxfV8je3YyfVwiIDogXCJoZXgje3YyfV8je3YxfVwiKVxuICAgICAgICAgIGZsYWcubmV3RmxhZyhmYWNlbmFtZSwgdjIsIHYybmV3KVxuICAgICAgICAgIGZsYWcubmV3RmxhZyhmYWNlbmFtZSwgdjJuZXcsIHYxbmV3KVxuICAgICAgICAgIGZsYWcubmV3RmxhZyhmYWNlbmFtZSwgdjFuZXcsIHYxKVxuICAgICAgICAgIHYxID0gdjI7XG4gICAgICAgICAgdjFuZXcgPSB2Mm5ld1xuXG4gICAgZmxhZy50b3BvbHkgXCJjI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuXG4jIEd5cm8gZm9sbG93ZWQgYnkgdHJ1bmNhdGlvbiBvZiB2ZXJ0aWNlcyBjZW50ZXJlZCBvbiBvcmlnaW5hbCBmYWNlcy5cbiMgVGhpcyBjcmVhdGUgMiBuZXcgaGV4YWdvbnMgZm9yIGV2ZXJ5IG9yaWdpbmFsIGVkZ2UuXG4jIChodHRwczojZW4ud2lraXBlZGlhLm9yZy93aWtpL0NvbndheV9wb2x5aGVkcm9uX25vdGF0aW9uI09wZXJhdGlvbnNfb25fcG9seWhlZHJhKVxuI1xuIyBQb3NzaWJsZSBleHRlbnNpb246IHRha2UgYSBwYXJhbWV0ZXIgbiB0aGF0IG1lYW5zIG9ubHkgd2hpcmwgbi1zaWRlZCBmYWNlcy5cbiMgSWYgd2UgZG8gdGhhdCwgdGhlIGZsYWdzIG1hcmtlZCAjKiBiZWxvdyB3aWxsIG5lZWQgdG8gaGF2ZSB0aGVpciBvdGhlciBzaWRlc1xuIyBmaWxsZWQgaW4gb25lIHdheSBvciBhbm90aGVyLCBkZXBlbmRpbmcgb24gd2hldGhlciB0aGUgYWRqYWNlbnQgZmFjZSBpc1xuIyB3aGlybGVkIG9yIG5vdC5cblxud2hpcmwgPSAocG9seSwgbikgLT5cblxuICAgIGtsb2cgXCJ3aGlybCBvZiAje3BvbHkubmFtZX1cIlxuICAgIG4gPz0gMFxuICAgIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgICMgZWFjaCBvbGQgdmVydGV4IGlzIGEgbmV3IHZlcnRleFxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgIGZsYWcubmV3ViBcInYje2l9XCIgdW5pdCBwb2x5LnZlcnRpY2VzW2ldXG5cbiAgICAjIG5ldyB2ZXJ0aWNlcyBhcm91bmQgY2VudGVyIG9mIGVhY2ggZmFjZVxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UoLTIpXG4gICAgICAgIGZvciBqIGluIFswLi4uZi5sZW5ndGhdXG4gICAgICAgICAgICB2ID0gZltqXVxuICAgICAgICAgICAgdjMgPSB2XG4gICAgICAgICAgICAjIE5ldyB2ZXJ0ZXggYWxvbmcgZWRnZVxuICAgICAgICAgICAgdjFfMiA9IG9uZVRoaXJkKHBvbHkudmVydGljZXNbdjFdLHBvbHkudmVydGljZXNbdjJdKVxuICAgICAgICAgICAgZmxhZy5uZXdWKHYxK1wiflwiK3YyLCB2MV8yKVxuICAgICAgICAgICAgIyBOZXcgdmVydGljZXMgbmVhciBjZW50ZXIgb2YgZmFjZVxuICAgICAgICAgICAgY3YxbmFtZSA9IFwiY2VudGVyI3tpfX4je3YxfVwiXG4gICAgICAgICAgICBjdjJuYW1lID0gXCJjZW50ZXIje2l9fiN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcubmV3VihjdjFuYW1lLCB1bml0KG9uZVRoaXJkKGNlbnRlcnNbaV0sIHYxXzIpKSlcbiAgICAgICAgICAgIGZuYW1lID0gaStcImZcIit2MVxuICAgICAgICAgICAgIyBOZXcgaGV4YWdvbiBmb3IgZWFjaCBvcmlnaW5hbCBlZGdlXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsIGN2MW5hbWUsICAgdjErXCJ+XCIrdjIpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsIHYxK1wiflwiK3YyLCB2MitcIn5cIit2MSkgIypcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgdjIrXCJ+XCIrdjEsIFwidiN7djJ9XCIpICAjKlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCBcInYje3YyfVwiLCAgdjIrXCJ+XCIrdjMpICMqXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsIHYyK1wiflwiK3YzLCBjdjJuYW1lKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCBjdjJuYW1lLCAgIGN2MW5hbWUpXG4gICAgICAgICAgICAjIE5ldyBmYWNlIGluIGNlbnRlciBvZiBlYWNoIG9sZCBmYWNlICAgICAgXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoXCJjI3tpfVwiLCBjdjFuYW1lLCBjdjJuYW1lKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdICMgc2hpZnQgb3ZlciBvbmVcbiAgXG4gICAgZmxhZy50b3BvbHkgXCJ3I3twb2x5Lm5hbWV9XCJcblxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAwMCAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuIyAwMDAgMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiMgIDAwMDAwIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgXG5cbnF1aW50byA9IChwb2x5KSAtPiAjIGNyZWF0ZXMgYSBwZW50YWdvbiBmb3IgZXZlcnkgcG9pbnQgaW4gdGhlIG9yaWdpbmFsIGZhY2UsIGFzIHdlbGwgYXMgb25lIG5ldyBpbnNldCBmYWNlLlxuICAgIFxuICAgIGtsb2coXCJxdWludG8gb2YgI3twb2x5Lm5hbWV9XCIpXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgIyBGb3IgZWFjaCBmYWNlIGYgaW4gdGhlIG9yaWdpbmFsIHBvbHlcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBjZW50cm9pZCA9IGNhbGNDZW50cm9pZCBmLm1hcCAoaWR4KSAtPiBwb2x5LnZlcnRpY2VzW2lkeF1cbiAgICAgICAgIyB3YWxrIG92ZXIgZmFjZSB2ZXJ0ZXgtdHJpcGxldHNcbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlKC0yKVxuICAgICAgICBmb3IgdjMgaW4gZlxuICAgICAgICAgICAgIyBmb3IgZWFjaCBmYWNlLWNvcm5lciwgd2UgbWFrZSB0d28gbmV3IHBvaW50czpcbiAgICAgICAgICAgIG1pZHB0ID0gbWlkcG9pbnQocG9seS52ZXJ0aWNlc1t2MV0sIHBvbHkudmVydGljZXNbdjJdKVxuICAgICAgICAgICAgaW5uZXJwdCA9IG1pZHBvaW50KG1pZHB0LCBjZW50cm9pZClcbiAgICAgICAgICAgIGZsYWcubmV3VihtaWROYW1lKHYxLHYyKSwgbWlkcHQpXG4gICAgICAgICAgICBmbGFnLm5ld1YoXCJpbm5lcl8je2l9X1wiICsgbWlkTmFtZSh2MSx2MiksIGlubmVycHQpXG4gICAgICAgICAgICAjIGFuZCBhZGQgdGhlIG9sZCBjb3JuZXItdmVydGV4XG4gICAgICAgICAgICBmbGFnLm5ld1YoXCIje3YyfVwiLCBwb2x5LnZlcnRpY2VzW3YyXSlcbiAgICAgICAgICBcbiAgICAgICAgICAgICMgcGVudGFnb24gZm9yIGVhY2ggdmVydGV4IGluIG9yaWdpbmFsIGZhY2VcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImYje2l9XyN7djJ9XCIsIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYxLCB2MiksIG1pZE5hbWUodjEsIHYyKSlcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImYje2l9XyN7djJ9XCIsIG1pZE5hbWUodjEsIHYyKSwgXCIje3YyfVwiKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKFwiZiN7aX1fI3t2Mn1cIiwgXCIje3YyfVwiLCBtaWROYW1lKHYyLCB2MykpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoXCJmI3tpfV8je3YyfVwiLCBtaWROYW1lKHYyLCB2MyksIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYyLCB2MykpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoXCJmI3tpfV8je3YyfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpKVxuICAgICAgXG4gICAgICAgICAgICAjIGlubmVyIHJvdGF0ZWQgZmFjZSBvZiBzYW1lIHZlcnRleC1udW1iZXIgYXMgb3JpZ2luYWxcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImZfaW5fI3tpfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpKVxuICAgICAgXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdICMgc2hpZnQgb3ZlciBvbmVcbiAgXG4gICAgZmxhZy50b3BvbHkgXCJxI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwMCAgMDAwICBcbiMgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAgMCAwMDAgIFxuIyAwMDAgIDAwMCAgMDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcblxuaW5zZXROID0gKHBvbHksIG4sIGluc2V0X2Rpc3QsIHBvcG91dF9kaXN0KSAtPlxuXG4gICAgbiA/PSAwXG4gICAgaW5zZXRfZGlzdCA/PSAwLjVcbiAgICBwb3BvdXRfZGlzdCA/PSAtMC4yXG4gIFxuICAgIGtsb2cgXCJpbnNldCBvZiAje24gYW5kIFwiI3tufS1zaWRlZFwiIG9yICdhbGwnfSBmYWNlcyBvZiAje3BvbHkubmFtZX1cIlxuICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgICMgZWFjaCBvbGQgdmVydGV4IGlzIGEgbmV3IHZlcnRleFxuICAgICAgICBwID0gcG9seS52ZXJ0aWNlc1tpXVxuICAgICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHBcblxuICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdICMgbmV3IGluc2V0IHZlcnRleCBmb3IgZXZlcnkgdmVydCBpbiBmYWNlXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdWIFwiZiN7aX12I3t2fVwiIGFkZCB0d2Vlbihwb2x5LnZlcnRpY2VzW3ZdLGNlbnRlcnNbaV0saW5zZXRfZGlzdCksIG11bHQocG9wb3V0X2Rpc3Qsbm9ybWFsc1tpXSlcbiAgXG4gICAgZm91bmRBbnkgPSBmYWxzZSAjIGFsZXJ0IGlmIGRvbid0IGZpbmQgYW55XG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgdjIgPSBcInYje3Z9XCI7XG4gICAgICAgICAgICBpZiBmLmxlbmd0aCA9PSBuIG9yIG4gPT0gMFxuICAgICAgICAgICAgICAgIGZvdW5kQW55ID0gdHJ1ZVxuICAgICAgICAgICAgICAgIGZuYW1lID0gaSArIHYxXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCAgICAgIHYxLCAgICAgICB2MilcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsICAgICAgdjIsICAgICAgIFwiZiN7aX0je3YyfVwiKVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgXCJmI3tpfSN7djJ9XCIsICBcImYje2l9I3t2MX1cIilcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsIFwiZiN7aX0je3YxfVwiLCAgdjEpXG4gICAgICAgICAgICAgICAgIyBuZXcgaW5zZXQsIGV4dHJ1ZGVkIGZhY2VcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcoXCJleCN7aX1cIiwgXCJmI3tpfSN7djF9XCIsICBcImYje2l9I3t2Mn1cIilcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcoaSwgdjEsIHYyKSAgIyBzYW1lIG9sZCBmbGFnLCBpZiBub24tblxuICAgICAgICAgICAgdjE9djIgIyBjdXJyZW50IGJlY29tZXMgcHJldmlvdXNcbiAgXG4gICAgaWYgbm90IGZvdW5kQW55XG4gICAgICAgIGtsb2cgXCJObyAje259LWZvbGQgY29tcG9uZW50cyB3ZXJlIGZvdW5kLlwiXG4gIFxuICAgIGZsYWcudG9wb2x5IFwibiN7bn0je3BvbHkubmFtZX1cIlxuXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG5cbmV4dHJ1ZGVOID0gKHBvbHksIG4pIC0+XG4gICAgbmV3cG9seSA9IGluc2V0TiBwb2x5LCBuLCAwLjAsIDAuM1xuICAgIG5ld3BvbHkubmFtZSA9IFwieCN7bn0je3BvbHkubmFtZX1cIlxuICAgIG5ld3BvbHlcblxuIyAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMDAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMDAwMCAgICAgICAwMDAgICAgIFxuIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuXG5sb2Z0ID0gKHBvbHksIG4sIGFscGhhKSAtPlxuICAgIG5ld3BvbHkgPSBpbnNldE4gcG9seSwgbiwgYWxwaGEsIDAuMFxuICAgIG5ld3BvbHkubmFtZSA9IFwibCN7bn0je3BvbHkubmFtZX1cIlxuICAgIG5ld3BvbHlcblxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIFxuXG5ob2xsb3cgPSAocG9seSwgaW5zZXRfZGlzdCwgdGhpY2tuZXNzKSAtPlxuXG4gICAgaW5zZXRfZGlzdCA/PSAwLjVcbiAgICB0aGlja25lc3MgPz0gMC4yXG4gIFxuICAgIGtsb2cgXCJob2xsb3cgI3twb2x5Lm5hbWV9XCJcbiAgXG4gICAgZHVhbG5vcm1hbHMgPSBkdWFsKHBvbHkpLm5vcm1hbHMoKVxuICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAgICMgZWFjaCBvbGQgdmVydGV4IGlzIGEgbmV3IHZlcnRleFxuICAgICAgICBwID0gcG9seS52ZXJ0aWNlc1tpXVxuICAgICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHBcbiAgICAgICAgZmxhZy5uZXdWIFwiZG93bnYje2l9XCIgYWRkIHAsIG11bHQgLTEqdGhpY2tuZXNzLGR1YWxub3JtYWxzW2ldXG5cbiAgICAjIG5ldyBpbnNldCB2ZXJ0ZXggZm9yIGV2ZXJ5IHZlcnQgaW4gZmFjZVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIGZsYWcubmV3ViBcImZpbiN7aX12I3t2fVwiIHR3ZWVuIHBvbHkudmVydGljZXNbdl0sIGNlbnRlcnNbaV0sIGluc2V0X2Rpc3RcbiAgICAgICAgICAgIGZsYWcubmV3ViBcImZpbmRvd24je2l9diN7dn1cIiBhZGQgdHdlZW4ocG9seS52ZXJ0aWNlc1t2XSxjZW50ZXJzW2ldLGluc2V0X2Rpc3QpLCBtdWx0KC0xKnRoaWNrbmVzcyxub3JtYWxzW2ldKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MiA9IFwidiN7dn1cIlxuICAgICAgICAgICAgZm5hbWUgPSBpICsgdjFcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgdjEsICAgICAgICAgICAgdjJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgdjIsICAgICAgICAgICAgXCJmaW4je2l9I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBcImZpbiN7aX0je3YyfVwiIFwiZmluI3tpfSN7djF9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgXCJmaW4je2l9I3t2MX1cIiB2MVxuICAgICAgXG4gICAgICAgICAgICBmbmFtZSA9IFwic2lkZXMje2l9I3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCBcImZpbiN7aX0je3YxfVwiICAgICBcImZpbiN7aX0je3YyfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIFwiZmluI3tpfSN7djJ9XCIgICAgIFwiZmluZG93biN7aX0je3YyfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIFwiZmluZG93biN7aX0je3YyfVwiIFwiZmluZG93biN7aX0je3YxfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIFwiZmluZG93biN7aX0je3YxfVwiIFwiZmluI3tpfSN7djF9XCJcbiAgICAgIFxuICAgICAgICAgICAgZm5hbWUgPSBcImJvdHRvbSN7aX0je3YxfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsICBcImRvd24je3YyfVwiICAgICAgICBcImRvd24je3YxfVwiXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsICBcImRvd24je3YxfVwiICAgICAgICBcImZpbmRvd24je2l9I3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCAgXCJmaW5kb3duI3tpfSN7djF9XCIgXCJmaW5kb3duI3tpfSN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBmbmFtZSwgIFwiZmluZG93biN7aX0je3YyfVwiIFwiZG93biN7djJ9XCJcbiAgICAgIFxuICAgICAgICAgICAgdjEgPSB2MiAjIGN1cnJlbnQgYmVjb21lcyBwcmV2aW91c1xuICBcbiAgICBmbGFnLnRvcG9seSBcIkgje3BvbHkubmFtZX1cIlxuXG4jIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAgIDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMCAgXG4jIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMCAgXG4jIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgXG4jIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgXG5cbnBlcnNwZWN0aXZhMSA9IChwb2x5KSAtPiAjIGFuIG9wZXJhdGlvbiByZXZlcnNlLWVuZ2luZWVyZWQgZnJvbSBQZXJzcGVjdGl2YSBDb3Jwb3J1bSBSZWd1bGFyaXVtXG5cbiAgICBrbG9nIFwic3RlbGxhIG9mICN7cG9seS5uYW1lfVwiXG4gIFxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKSAjIGNhbGN1bGF0ZSBmYWNlIGNlbnRlcnNcbiAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXVxuICAgICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHBvbHkudmVydGljZXNbaV1cbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF0gIyBpdGVyYXRlIG92ZXIgdHJpcGxldHMgb2YgZmFjZXMgdjEsdjIsdjNcbiAgICAgICAgXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gXCJ2I3tmW2YubGVuZ3RoLTJdfVwiXG4gICAgICAgIHYyID0gXCJ2I3tmW2YubGVuZ3RoLTFdfVwiXG4gICAgICAgIHZlcnQxID0gcG9seS52ZXJ0aWNlc1tmW2YubGVuZ3RoLTJdXVxuICAgICAgICB2ZXJ0MiA9IHBvbHkudmVydGljZXNbZltmLmxlbmd0aC0xXV1cbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgdjMgPSBcInYje3Z9XCJcbiAgICAgICAgICAgIHZlcnQzID0gcG9seS52ZXJ0aWNlc1t2XVxuICAgICAgICAgICAgdjEyID0gdjErXCJ+XCIrdjIgIyBuYW1lcyBmb3IgXCJvcmllbnRlZFwiIG1pZHBvaW50c1xuICAgICAgICAgICAgdjIxID0gdjIrXCJ+XCIrdjFcbiAgICAgICAgICAgIHYyMyA9IHYyK1wiflwiK3YzXG4gICAgICBcbiAgICAgICAgICAgICMgb24gZWFjaCBOZmFjZSwgTiBuZXcgcG9pbnRzIGluc2V0IGZyb20gZWRnZSBtaWRwb2ludHMgdG93YXJkcyBjZW50ZXIgPSBcInN0ZWxsYXRlZFwiIHBvaW50c1xuICAgICAgICAgICAgZmxhZy5uZXdWIHYxMiwgbWlkcG9pbnQgbWlkcG9pbnQodmVydDEsdmVydDIpLCBjZW50ZXJzW2ldIFxuICAgICAgXG4gICAgICAgICAgICAjIGluc2V0IE5mYWNlIG1hZGUgb2YgbmV3LCBzdGVsbGF0ZWQgcG9pbnRzXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJpbiN7aX1cIiB2MTIsIHYyM1xuICAgICAgXG4gICAgICAgICAgICAjIG5ldyB0cmkgZmFjZSBjb25zdGl0dXRpbmcgdGhlIHJlbWFpbmRlciBvZiB0aGUgc3RlbGxhdGVkIE5mYWNlXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmI3tpfSN7djJ9XCIgdjIzLCB2MTJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImYje2l9I3t2Mn1cIiB2MTIsIHYyXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmI3tpfSN7djJ9XCIgdjIsICB2MjNcbiAgICAgIFxuICAgICAgICAgICAgIyBvbmUgb2YgdGhlIHR3byBuZXcgdHJpYW5nbGVzIHJlcGxhY2luZyBvbGQgZWRnZSBiZXR3ZWVuIHYxLT52MlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiZiN7djEyfVwiIHYxLCAgdjIxXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJmI3t2MTJ9XCIgdjIxLCB2MTJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyBcImYje3YxMn1cIiB2MTIsIHYxXG4gICAgICBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M10gICMgY3VycmVudCBiZWNvbWVzIHByZXZpb3VzXG4gICAgICAgICAgICBbdmVydDEsIHZlcnQyXSA9IFt2ZXJ0MiwgdmVydDNdXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiUCN7cG9seS5uYW1lfVwiXG5cbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcblxudHJpc3ViID0gKHBvbHksIG4pIC0+XG4gICAgXG4gICAga2xvZyBcInRyaXN1YiBvZiAje3BvbHkubmFtZX1cIlxuICAgIFxuICAgIG4gPz0gMlxuICAgIFxuICAgICMgTm8tT3AgZm9yIG5vbi10cmlhbmd1bGFyIG1lc2hlc1xuICAgIGZvciBmbiBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBpZiBwb2x5LmZhY2VzW2ZuXS5sZW5ndGggIT0gM1xuICAgICAgICAgICAgcmV0dXJuIHBvbHlcbiAgXG4gICAgIyBDYWxjdWxhdGUgcmVkdW5kYW50IHNldCBvZiBuZXcgdmVydGljZXMgZm9yIHN1YmRpdmlkZWQgbWVzaC5cbiAgICBuZXdWcyA9IFtdXG4gICAgdm1hcCA9IHt9XG4gICAgcG9zID0gMFxuICAgIGZvciBmbiBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tmbl1cbiAgICAgICAgW2kxLCBpMiwgaTNdID0gZi5zbGljZSAtM1xuICAgICAgICB2MSA9IHBvbHkudmVydGljZXNbaTFdXG4gICAgICAgIHYyID0gcG9seS52ZXJ0aWNlc1tpMl1cbiAgICAgICAgdjMgPSBwb2x5LnZlcnRpY2VzW2kzXVxuICAgICAgICB2MjEgPSBzdWIgdjIsIHYxXG4gICAgICAgIHYzMSA9IHN1YiB2MywgdjFcbiAgICAgICAgZm9yIGkgaW4gWzAuLm5dXG4gICAgICAgICAgICBmb3IgaiBpbiBbMC4ubi1pXVxuICAgICAgICAgICAgICAgIHYgPSBhZGQgYWRkKHYxLCBtdWx0KGkgKiAxLjAgLyBuLCB2MjEpKSwgbXVsdChqICogMS4wIC8gbiwgdjMxKVxuICAgICAgICAgICAgICAgIHZtYXBbXCJ2I3tmbn0tI3tpfS0je2p9XCJdID0gcG9zKytcbiAgICAgICAgICAgICAgICBuZXdWcy5wdXNoIHZcbiAgXG4gICAgIyBUaGUgYWJvdmUgdmVydGljZXMgYXJlIHJlZHVuZGFudCBhbG9uZyBvcmlnaW5hbCBlZGdlcywgXG4gICAgIyB3ZSBuZWVkIHRvIGJ1aWxkIGFuIGluZGV4IG1hcCBpbnRvIGEgdW5pcXVlaWZpZWQgbGlzdCBvZiB0aGVtLlxuICAgICMgV2UgaWRlbnRpZnkgdmVydGljZXMgdGhhdCBhcmUgY2xvc2VyIHRoYW4gYSBjZXJ0YWluIGVwc2lsb24gZGlzdGFuY2UuXG4gICAgRVBTSUxPTl9DTE9TRSA9IDEuMGUtOFxuICAgIHVuaXFWcyA9IFtdXG4gICAgbmV3cG9zID0gMFxuICAgIHVuaXFtYXAgPSB7fVxuICAgIGZvciBbaSwgdl0gaW4gbmV3VnMuZW50cmllcygpXG4gICAgICAgIGlmIGkgaW4gdW5pcW1hcCB0aGVuIGNvbnRpbnVlICMgYWxyZWFkeSBtYXBwZWRcbiAgICAgICAgdW5pcW1hcFtpXSA9IG5ld3Bvc1xuICAgICAgICB1bmlxVnMucHVzaCB2XG4gICAgICAgIGZvciBqIGluIFtpKzEuLi5uZXdWcy5sZW5ndGhdXG4gICAgICAgICAgICB3ID0gbmV3VnNbal1cbiAgICAgICAgICAgIGlmIG1hZyhzdWIodiwgdykpIDwgRVBTSUxPTl9DTE9TRVxuICAgICAgICAgICAgICAgIHVuaXFtYXBbal0gPSBuZXdwb3NcbiAgICAgICAgbmV3cG9zKytcbiAgXG4gICAgZmFjZXMgPSBbXVxuICAgIGZvciBmbiBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmb3IgaSBpbiBbMC4uLm5dXG4gICAgICAgICAgICBmb3IgaiBpbiBbMC4uLm4taV1cbiAgICAgICAgICAgICAgICBmYWNlcy5wdXNoIFt1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2p9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aSsxfS0je2p9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqKzF9XCJdXV1cbiAgICAgICAgZm9yIGkgaW4gWzEuLi5uXVxuICAgICAgICAgICAgZm9yIGogaW4gWzAuLi5uLWldXG4gICAgICAgICAgICAgICAgZmFjZXMucHVzaCBbdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2l9LSN7aisxfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2ktMX0tI3tqKzF9XCJdXV1cbiAgXG4gICAgbmV3IFBvbHloZWRyb24gXCJ1I3tufSN7cG9seS5uYW1lfVwiIGZhY2VzLCB1bmlxVnNcblxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwICBcbiMgMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwICBcbiMgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgICBkdWFsOiAgICAgICAgICAgZHVhbFxuICAgIHRyaXN1YjogICAgICAgICB0cmlzdWJcbiAgICBwZXJzcGVjdGl2YTE6ICAgcGVyc3BlY3RpdmExXG4gICAga2lzTjogICAgICAgICAgIGtpc05cbiAgICBhbWJvOiAgICAgICAgICAgYW1ib1xuICAgIGd5cm86ICAgICAgICAgICBneXJvXG4gICAgcHJvcGVsbG9yOiAgICAgIHByb3BlbGxvclxuICAgIHJlZmxlY3Q6ICAgICAgICByZWZsZWN0XG4gICAgY2hhbWZlcjogICAgICAgIGNoYW1mZXJcbiAgICB3aGlybDogICAgICAgICAgd2hpcmxcbiAgICBxdWludG86ICAgICAgICAgcXVpbnRvXG4gICAgaW5zZXROOiAgICAgICAgIGluc2V0TlxuICAgIGV4dHJ1ZGVOOiAgICAgICBleHRydWRlTlxuICAgIGxvZnQ6ICAgICAgICAgICBsb2Z0XG4gICAgaG9sbG93OiAgICAgICAgIGhvbGxvd1xuICAgICJdfQ==
//# sourceURL=../../coffee/poly/topo.coffee