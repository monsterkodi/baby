// koffee 1.6.0
var MAX_FACE_SIDEDNESS, midName, polyflag, polyhedron,
    indexOf = [].indexOf;

polyhedron = require('./polyhedron').polyhedron;

MAX_FACE_SIDEDNESS = 1000;

polyflag = (function() {
    function polyflag() {
        this.flags = new Object();
        this.vertidxs = new Object();
        this.vertices = new Object();
    }

    polyflag.prototype.newV = function(vertName, coordinates) {
        if (!this.vertidxs[vertName]) {
            this.vertidxs[vertName] = 0;
            return this.vertices[vertName] = coordinates;
        }
    };

    polyflag.prototype.newFlag = function(faceName, vertName1, vertName2) {
        var base;
        if ((base = this.flags)[faceName] != null) {
            base[faceName];
        } else {
            base[faceName] = {};
        }
        return this.flags[faceName][vertName1] = vertName2;
    };

    polyflag.prototype.topoly = function() {
        var ctr, face, faceCTR, i, l, len, len1, m, poly, ref, ref1, v, v0;
        poly = new polyhedron("unknown polyhedron");
        ctr = 0;
        ref = this.vertidxs;
        for (l = 0, len = ref.length; l < len; l++) {
            i = ref[l];
            v = this.vertidxs[i];
            poly.vertices[ctr] = this.vertices[i];
            this.vertidxs[i] = ctr;
            ctr++;
        }
        ctr = 0;
        ref1 = this.flags;
        for (m = 0, len1 = ref1.length; m < len1; m++) {
            i = ref1[m];
            face = this.flags[i];
            poly.faces[ctr] = [];
            v0 = face[0];
            v = v0;
            poly.faces[ctr].push(this.vertidxs[v]);
            v = this.flags[i][v];
            faceCTR = 0;
            while (v !== v0) {
                poly.faces[ctr].push(this.vertidxs[v]);
                v = this.flags[i][v];
                faceCTR++;
                if (faceCTR > MAX_FACE_SIDEDNESS) {
                    console.log("Bad flag spec, have a neverending face:", i, this.flags[i]);
                    break;
                }
            }
            ctr++;
        }
        return poly;
    };

    return polyflag;

})();

midName = function(v1, v2) {
    return v1 < v2 && (v1 + "_" + v2) || (v2 + "_" + v1);
};

module.exports.kisN = function(poly, n, apexdist) {
    var apex, centers, f, flag, fname, foundAny, i, l, len, m, newpoly, normals, o, p, ref, ref1, v, v1, v2;
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
    console.log("Taking kis of " + n + "-sided faces of " + poly.name + "...");
    flag = new polyflag();
    for (i = l = 0, ref = poly.vertices.length; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        p = poly.vertices[i];
        flag.newV("v" + i, p);
    }
    normals = poly.normals();
    centers = poly.centers();
    foundAny = false;
    for (i = m = 0, ref1 = poly.faces.length; 0 <= ref1 ? m < ref1 : m > ref1; i = 0 <= ref1 ? ++m : --m) {
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
        console.log("No " + n + "-fold components were found.");
    }
    newpoly = flag.topoly();
    newpoly.name = "k" + n + poly.name;
    return newpoly;
};

module.exports.ambo = function(poly) {
    var f, flag, i, l, len, m, newpoly, ref, ref1, ref2, v1, v2, v3;
    console.log("Taking ambo of " + poly.name + "...");
    flag = new polyflag();
    for (i = l = 0, ref = poly.faces.length; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        f = poly.faces[i];
        ref1 = f.slice(-2), v1 = ref1[0], v2 = ref1[1];
        for (m = 0, len = f.length; m < len; m++) {
            v3 = f[m];
            if (v1 < v2) {
                flag.newV(midName(v1, v2), midpoint(poly.vertices[v1], poly.vertices[v2]));
            }
            flag.newFlag("orig" + i, midName(v1, v2), midName(v2, v3));
            flag.newFlag("dual" + v2, midName(v2, v3), midName(v1, v2));
            ref2 = [v2, v3], v1 = ref2[0], v2 = ref2[1];
        }
    }
    newpoly = flag.topoly();
    newpoly.name = "a" + poly.name;
    return newpoly;
};

module.exports.gyro = function(poly) {
    var centers, f, flag, fname, i, j, l, m, newpoly, o, q, ref, ref1, ref2, ref3, ref4, ref5, v, v1, v2, v3;
    console.log("Taking gyro of " + poly.name + "...");
    flag = new polyflag();
    for (i = l = 0, ref = poly.vertices.length; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        flag.newV("v" + i, unit(poly.vertices[i]));
    }
    centers = poly.centers();
    for (i = m = 0, ref1 = poly.faces.length; 0 <= ref1 ? m < ref1 : m > ref1; i = 0 <= ref1 ? ++m : --m) {
        f = poly.faces[i];
        flag.newV("center" + i, unit(centers[i]));
    }
    for (i = o = 0, ref2 = poly.faces.length; 0 <= ref2 ? o < ref2 : o > ref2; i = 0 <= ref2 ? ++o : --o) {
        f = poly.faces[i];
        ref3 = f.slice(-2), v1 = ref3[0], v2 = ref3[1];
        for (j = q = 0, ref4 = f.length; 0 <= ref4 ? q < ref4 : q > ref4; j = 0 <= ref4 ? ++q : --q) {
            v = f[j];
            v3 = v;
            flag.newV(v1 + "~" + v2, oneThird(poly.vertices[v1], poly.vertices[v2]));
            fname = i + "f" + v1;
            flag.newFlag(fname, "center" + i, v1 + "~" + v2);
            flag.newFlag(fname, v1 + "~" + v2, v2 + "~" + v1);
            flag.newFlag(fname, v2 + "~" + v1, "v" + v2);
            flag.newFlag(fname, "v" + v2, v2 + "~" + v3);
            flag.newFlag(fname, v2 + "~" + v3, "center" + i);
            ref5 = [v2, v3], v1 = ref5[0], v2 = ref5[1];
        }
    }
    newpoly = flag.topoly();
    newpoly.name = "g" + poly.name;
    return newpoly;
};

module.exports.propellor = function(poly) {
    var f, flag, fname, i, l, len, m, newpoly, o, ref, ref1, ref2, ref3, v, v1, v2, v3;
    console.log("Taking propellor of " + poly.name + "...");
    flag = new polyflag();
    for (i = l = 0, ref = poly.vertices.length; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        flag.newV("v" + i, unit(poly.vertices[i]));
    }
    for (i = m = 0, ref1 = poly.faces.length; 0 <= ref1 ? m < ref1 : m > ref1; i = 0 <= ref1 ? ++m : --m) {
        f = poly.faces[i];
        ref2 = f.slice(-2), v1 = ref2[0], v2 = ref2[1];
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
            ref3 = [v2, v3], v1 = ref3[0], v2 = ref3[1];
        }
    }
    newpoly = flag.topoly();
    newpoly.name = "p" + poly.name;
    return newpoly;
};

module.exports.reflect = function(poly) {
    var i, l, m, ref, ref1;
    console.log("Taking reflection of " + poly.name + "...");
    for (i = l = 0, ref = poly.vertices.length; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        poly.vertices[i] = mult(-1, poly.vertices[i]);
    }
    for (i = m = 0, ref1 = poly.faces.length; 0 <= ref1 ? m < ref1 : m > ref1; i = 0 <= ref1 ? ++m : --m) {
        poly.faces[i] = poly.faces[i].reverse();
    }
    poly.name = "r" + poly.name;
    return poly;
};

module.exports.dual = function(poly) {
    var centers, dpoly, f, face, flag, i, k, l, len, len1, len2, m, o, q, r, ref, ref1, ref2, ref3, ref4, s, sortF, t, v1, v2;
    console.log("Taking dual of " + poly.name + "...", poly);
    flag = new polyflag();
    face = [];
    for (i = l = 0, ref = poly.vertices.length; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        face[i] = {};
    }
    for (i = m = 0, ref1 = poly.faces.length; 0 <= ref1 ? m < ref1 : m > ref1; i = 0 <= ref1 ? ++m : --m) {
        f = poly.faces[i];
        v1 = f[f.length - 1];
        for (o = 0, len = f.length; o < len; o++) {
            v2 = f[o];
            face[v1]["v" + v2] = "" + i;
            v1 = v2;
        }
    }
    centers = poly.centers();
    for (i = q = 0, ref2 = poly.faces.length; 0 <= ref2 ? q < ref2 : q > ref2; i = 0 <= ref2 ? ++q : --q) {
        flag.newV("" + i, centers[i]);
    }
    for (i = r = 0, ref3 = poly.faces.length; 0 <= ref3 ? r < ref3 : r > ref3; i = 0 <= ref3 ? ++r : --r) {
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
    ref4 = dpoly.faces;
    for (t = 0, len2 = ref4.length; t < len2; t++) {
        f = ref4[t];
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

module.exports.chamfer = function(poly, dist) {
    var f, facename, flag, i, l, len, m, newpoly, normals, obj, ref, ref1, v1, v1new, v2, v2new;
    console.log("Taking chamfer of " + poly.name + "...");
    if (dist != null) {
        dist;
    } else {
        dist = 0.5;
    }
    flag = new polyflag();
    normals = poly.normals();
    for (i = l = 0, ref = poly.faces.length; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        f = poly.faces[i];
        v1 = f[f.length - 1];
        v1new = i + "_" + v1;
        for (m = 0, len = f.length; m < len; m++) {
            v2 = f[m];
            flag.newV(v2, mult(1.0 + dist, poly.vertices[v2]));
            v2new = i + "_" + v2;
            flag.newV(v2new, add(poly.vertices[v2], mult(dist * 1.5, normals[i])));
            flag.newFlag("orig" + i, v1new, v2new);
            facename = (ref1 = v1 < v2) != null ? ref1 : (
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
    newpoly = flag.topoly();
    newpoly.name = "c" + poly.name;
    return newpoly;
};

module.exports.whirl = function(poly, n) {
    var centers, cv1name, cv2name, f, flag, fname, i, j, l, m, newpoly, o, ref, ref1, ref2, ref3, ref4, v, v1, v1_2, v2, v3;
    console.log("Taking whirl of " + poly.name + "...");
    if (n != null) {
        n;
    } else {
        n = 0;
    }
    flag = new polyflag();
    for (i = l = 0, ref = poly.vertices.length; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        flag.newV("v" + i, unit(poly.vertices[i]));
    }
    centers = poly.centers();
    for (i = m = 0, ref1 = poly.faces.length; 0 <= ref1 ? m < ref1 : m > ref1; i = 0 <= ref1 ? ++m : --m) {
        f = poly.faces[i];
        ref2 = f.slice(-2), v1 = ref2[0], v2 = ref2[1];
        for (j = o = 0, ref3 = f.length; 0 <= ref3 ? o < ref3 : o > ref3; j = 0 <= ref3 ? ++o : --o) {
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
            ref4 = [v2, v3], v1 = ref4[0], v2 = ref4[1];
        }
    }
    newpoly = flag.topoly();
    newpoly.name = "w" + poly.name;
    return newpoly;
};

module.exports.quinto = function(poly) {
    var centroid, f, flag, i, innerpt, l, len, m, midpt, newpoly, ref, ref1, ref2, v1, v2, v3;
    console.log("Taking quinto of " + poly.name + "...");
    flag = new polyflag();
    for (i = l = 0, ref = poly.faces.length; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        f = poly.faces[i];
        centroid = calcCentroid(f.map(function(idx) {
            return poly.vertices[idx];
        }));
        ref1 = f.slice(-2), v1 = ref1[0], v2 = ref1[1];
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
            ref2 = [v2, v3], v1 = ref2[0], v2 = ref2[1];
        }
    }
    newpoly = flag.topoly();
    newpoly.name = "q" + poly.name;
    return newpoly;
};

module.exports.insetN = function(poly, n, inset_dist, popout_dist) {
    var centers, f, flag, fname, foundAny, i, l, len, len1, m, newpoly, normals, o, p, q, r, ref, ref1, ref2, v, v1, v2;
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
    console.log("Taking inset of " + n + "-sided faces of " + poly.name + "...");
    flag = new polyflag();
    for (i = l = 0, ref = poly.vertices.length; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        p = poly.vertices[i];
        flag.newV("v" + i, p);
    }
    normals = poly.normals();
    centers = poly.centers();
    for (i = m = 0, ref1 = poly.faces.length; 0 <= ref1 ? m < ref1 : m > ref1; i = 0 <= ref1 ? ++m : --m) {
        f = poly.faces[i];
        if (f.length === n || n === 0) {
            for (o = 0, len = f.length; o < len; o++) {
                v = f[o];
                flag.newV("f" + i + "v" + v, add(tween(poly.vertices[v], centers[i], inset_dist), mult(popout_dist, normals[i])));
            }
        }
    }
    foundAny = false;
    for (i = q = 0, ref2 = poly.faces.length; 0 <= ref2 ? q < ref2 : q > ref2; i = 0 <= ref2 ? ++q : --q) {
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
        console.log("No " + n + "-fold components were found.");
    }
    newpoly = flag.topoly();
    newpoly.name = "n" + n + poly.name;
    return newpoly;
};

module.exports.extrudeN = function(poly, n) {
    var newpoly;
    newpoly = insetN(poly, n, 0.0, 0.3);
    newpoly.name = "x" + n + poly.name;
    return newpoly;
};

module.exports.loft = function(poly, n, alpha) {
    var newpoly;
    newpoly = insetN(poly, n, alpha, 0.0);
    newpoly.name = "l" + n + poly.name;
    return newpoly;
};

module.exports.hollow = function(poly, inset_dist, thickness) {
    var centers, dualnormals, f, flag, fname, i, l, len, len1, m, newpoly, normals, o, p, q, r, ref, ref1, ref2, v, v1, v2;
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
    console.log("Hollowing " + poly.name + "...");
    dualnormals = dual(poly).normals();
    normals = poly.normals();
    centers = poly.centers();
    flag = new polyflag();
    for (i = l = 0, ref = poly.vertices.length; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        p = poly.vertices[i];
        flag.newV("v" + i, p);
        flag.newV("downv" + i, add(p, mult(-1 * thickness, dualnormals[i])));
    }
    for (i = m = 0, ref1 = poly.faces.length; 0 <= ref1 ? m < ref1 : m > ref1; i = 0 <= ref1 ? ++m : --m) {
        f = poly.faces[i];
        for (o = 0, len = f.length; o < len; o++) {
            v = f[o];
            flag.newV("fin" + i + "v" + v, tween(poly.vertices[v], centers[i], inset_dist));
            flag.newV("findown" + i + "v" + v, add(tween(poly.vertices[v], centers[i], inset_dist), mult(-1 * thickness, normals[i])));
        }
    }
    for (i = q = 0, ref2 = poly.faces.length; 0 <= ref2 ? q < ref2 : q > ref2; i = 0 <= ref2 ? ++q : --q) {
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
    newpoly = flag.topoly();
    newpoly.name = "H" + poly.name;
    return newpoly;
};

module.exports.perspectiva1 = function(poly) {
    var centers, f, flag, i, l, len, m, newpoly, o, ref, ref1, ref2, ref3, v, v1, v12, v2, v21, v23, v3, vert1, vert2, vert3;
    console.log("Taking stella of " + poly.name + "...");
    centers = poly.centers();
    flag = new polyflag();
    for (i = l = 0, ref = poly.vertices.length; 0 <= ref ? l < ref : l > ref; i = 0 <= ref ? ++l : --l) {
        flag.newV("v" + i, poly.vertices[i]);
    }
    for (i = m = 0, ref1 = poly.faces.length; 0 <= ref1 ? m < ref1 : m > ref1; i = 0 <= ref1 ? ++m : --m) {
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
            ref2 = [v2, v3], v1 = ref2[0], v2 = ref2[1];
            ref3 = [vert2, vert3], vert1 = ref3[0], vert2 = ref3[1];
        }
    }
    newpoly = flag.topoly();
    newpoly.name = "P" + poly.name;
    return newpoly;
};

module.exports.trisub = function(poly, n) {
    var EPSILON_CLOSE, f, faces, fn, i, i1, i2, i3, j, l, len, m, newVs, newpoly, newpos, o, pos, q, r, ref, ref1, ref10, ref11, ref12, ref13, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, s, t, u, uniqVs, uniqmap, v, v1, v2, v21, v3, v31, vmap, w, x, y, z;
    console.log("Taking trisub of " + poly.name + "...");
    if (n != null) {
        n;
    } else {
        n = 2;
    }
    for (fn = l = 0, ref = poly.faces.length; 0 <= ref ? l < ref : l > ref; fn = 0 <= ref ? ++l : --l) {
        if (poly.faces[fn].length !== 3) {
            return poly;
        }
    }
    newVs = [];
    vmap = {};
    pos = 0;
    for (fn = m = 0, ref1 = poly.faces.length; 0 <= ref1 ? m < ref1 : m > ref1; fn = 0 <= ref1 ? ++m : --m) {
        f = poly.faces[fn];
        ref2 = f.slice(-3), i1 = ref2[0], i2 = ref2[1], i3 = ref2[2];
        v1 = poly.vertices[i1];
        v2 = poly.vertices[i2];
        v3 = poly.vertices[i3];
        v21 = sub(v2, v1);
        v31 = sub(v3, v1);
        for (i = o = 0, ref3 = n; 0 <= ref3 ? o <= ref3 : o >= ref3; i = 0 <= ref3 ? ++o : --o) {
            for (j = q = 0, ref4 = n - i; 0 <= ref4 ? q <= ref4 : q >= ref4; j = 0 <= ref4 ? ++q : --q) {
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
    ref5 = newVs.entries();
    for (r = 0, len = ref5.length; r < len; r++) {
        ref6 = ref5[r], i = ref6[0], v = ref6[1];
        if (indexOf.call(uniqmap, i) >= 0) {
            continue;
        }
        uniqmap[i] = newpos;
        uniqVs.push(v);
        for (j = s = ref7 = i + 1, ref8 = newVs.length; ref7 <= ref8 ? s < ref8 : s > ref8; j = ref7 <= ref8 ? ++s : --s) {
            w = newVs[j];
            if (mag(sub(v, w)) < EPSILON_CLOSE) {
                uniqmap[j] = newpos;
            }
        }
        newpos++;
    }
    faces = [];
    for (fn = t = 0, ref9 = poly.faces.length; 0 <= ref9 ? t < ref9 : t > ref9; fn = 0 <= ref9 ? ++t : --t) {
        for (i = u = 0, ref10 = n; 0 <= ref10 ? u < ref10 : u > ref10; i = 0 <= ref10 ? ++u : --u) {
            for (j = x = 0, ref11 = n - i; 0 <= ref11 ? x < ref11 : x > ref11; j = 0 <= ref11 ? ++x : --x) {
                faces.push([uniqmap[vmap["v" + fn + "-" + i + "-" + j]], uniqmap[vmap["v" + fn + "-" + (i + 1) + "-" + j]], uniqmap[vmap["v" + fn + "-" + i + "-" + (j + 1)]]]);
            }
        }
        for (i = y = 1, ref12 = n; 1 <= ref12 ? y < ref12 : y > ref12; i = 1 <= ref12 ? ++y : --y) {
            for (j = z = 0, ref13 = n - i; 0 <= ref13 ? z < ref13 : z > ref13; j = 0 <= ref13 ? ++z : --z) {
                faces.push([uniqmap[vmap["v" + fn + "-" + i + "-" + j]], uniqmap[vmap["v" + fn + "-" + i + "-" + (j + 1)]], uniqmap[vmap["v" + fn + "-" + (i - 1) + "-" + (j + 1)]]]);
            }
        }
    }
    newpoly = new polyhedron();
    newpoly.name = "u" + n + poly.name;
    newpoly.faces = faces;
    newpoly.vertices = uniqVs;
    return newpoly;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9wby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQTBCQSxJQUFBLGlEQUFBO0lBQUE7O0FBQUUsYUFBZSxPQUFBLENBQVEsY0FBUjs7QUFFakIsa0JBQUEsR0FBcUI7O0FBRWY7SUFFQyxrQkFBQTtRQUNDLElBQUMsQ0FBQSxLQUFELEdBQVksSUFBSSxNQUFKLENBQUE7UUFDWixJQUFDLENBQUEsUUFBRCxHQUFZLElBQUksTUFBSixDQUFBO1FBQ1osSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJLE1BQUosQ0FBQTtJQUhiOzt1QkFNSCxJQUFBLEdBQU0sU0FBQyxRQUFELEVBQVcsV0FBWDtRQUNGLElBQUcsQ0FBSSxJQUFDLENBQUEsUUFBUyxDQUFBLFFBQUEsQ0FBakI7WUFDSSxJQUFDLENBQUEsUUFBUyxDQUFBLFFBQUEsQ0FBVixHQUFzQjttQkFDdEIsSUFBQyxDQUFBLFFBQVMsQ0FBQSxRQUFBLENBQVYsR0FBc0IsWUFGMUI7O0lBREU7O3VCQUtOLE9BQUEsR0FBUyxTQUFDLFFBQUQsRUFBVyxTQUFYLEVBQXNCLFNBQXRCO0FBQ0wsWUFBQTs7Z0JBQU8sQ0FBQSxRQUFBOztnQkFBQSxDQUFBLFFBQUEsSUFBYTs7ZUFDcEIsSUFBQyxDQUFBLEtBQU0sQ0FBQSxRQUFBLENBQVUsQ0FBQSxTQUFBLENBQWpCLEdBQThCO0lBRnpCOzt1QkFJVCxNQUFBLEdBQVEsU0FBQTtBQUVKLFlBQUE7UUFBQSxJQUFBLEdBQU8sSUFBSSxVQUFKLENBQWUsb0JBQWY7UUFFUCxHQUFBLEdBQU07QUFDTjtBQUFBLGFBQUEscUNBQUE7O1lBQ0ksQ0FBQSxHQUFJLElBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQTtZQUNkLElBQUksQ0FBQyxRQUFTLENBQUEsR0FBQSxDQUFkLEdBQW1CLElBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQTtZQUM3QixJQUFDLENBQUEsUUFBUyxDQUFBLENBQUEsQ0FBVixHQUFlO1lBQ2YsR0FBQTtB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LENBQUEsSUFBSyxDQUFBLEdBQUEsR0FBSSxFQUFKLEdBQU8sR0FBUCxHQUFVLENBQVYsR0FBWSxHQUFaLEdBQWMsQ0FBQyxDQUFBLEdBQUUsQ0FBSCxDQUFkLENBQUwsQ0FGVCxDQUFYO0FBREo7QUFESjtBQUtBLGFBQVMsb0ZBQVQ7QUFDSSxpQkFBUyx3RkFBVDtnQkFDSSxLQUFLLENBQUMsSUFBTixDQUFXLENBQUMsT0FBUSxDQUFBLElBQUssQ0FBQSxHQUFBLEdBQUksRUFBSixHQUFPLEdBQVAsR0FBVSxDQUFWLEdBQVksR0FBWixHQUFlLENBQWYsQ0FBTCxDQUFULEVBQ0MsT0FBUSxDQUFBLElBQUssQ0FBQSxHQUFBLEdBQUksRUFBSixHQUFPLEdBQVAsR0FBVSxDQUFWLEdBQVksR0FBWixHQUFjLENBQUMsQ0FBQSxHQUFFLENBQUgsQ0FBZCxDQUFMLENBRFQsRUFFQyxPQUFRLENBQUEsSUFBSyxDQUFBLEdBQUEsR0FBSSxFQUFKLEdBQU8sR0FBUCxHQUFTLENBQUMsQ0FBQSxHQUFFLENBQUgsQ0FBVCxHQUFjLEdBQWQsR0FBZ0IsQ0FBQyxDQUFBLEdBQUUsQ0FBSCxDQUFoQixDQUFMLENBRlQsQ0FBWDtBQURKO0FBREo7QUFOSjtJQWFBLE9BQUEsR0FBVSxJQUFJLFVBQUosQ0FBQTtJQUNWLE9BQU8sQ0FBQyxJQUFSLEdBQWUsR0FBQSxHQUFJLENBQUosR0FBUSxJQUFJLENBQUM7SUFDNUIsT0FBTyxDQUFDLEtBQVIsR0FBZ0I7SUFDaEIsT0FBTyxDQUFDLFFBQVIsR0FBbUI7V0FFbkI7QUFqRW9CIiwic291cmNlc0NvbnRlbnQiOlsiIyBQb2x5aMOpZHJvbmlzbWVcbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgQSB0b3kgZm9yIGNvbnN0cnVjdGluZyBhbmQgbWFuaXB1bGF0aW5nIHBvbHloZWRyYSBhbmQgb3RoZXIgbWVzaGVzXG4jXG4jIEluY2x1ZGVzIGltcGxlbWVudGF0aW9uIG9mIHRoZSBjb253YXkgcG9seWhlZHJhbCBvcGVyYXRvcnMgZGVyaXZlZFxuIyBmcm9tIGNvZGUgYnkgbWF0aGVtYXRpY2lhbiBhbmQgbWF0aGVtYXRpY2FsIHNjdWxwdG9yXG4jIEdlb3JnZSBXLiBIYXJ0IGh0dHA6I3d3dy5nZW9yZ2VoYXJ0LmNvbS9cbiNcbiMgQ29weXJpZ2h0IDIwMTksIEFuc2VsbSBMZXZza2F5YVxuIyBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2VcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBQb2x5aGVkcm9uIEZsYWdzZXQgQ29uc3RydWN0XG4jXG4jIEEgRmxhZyBpcyBhbiBhc3NvY2lhdGl2ZSB0cmlwbGUgb2YgYSBmYWNlIGluZGV4IGFuZCB0d28gYWRqYWNlbnQgdmVydGV4IHZlcnRpZHhzLFxuIyBsaXN0ZWQgaW4gZ2VvbWV0cmljIGNsb2Nrd2lzZSBvcmRlciAoc3RhcmluZyBpbnRvIHRoZSBub3JtYWwpXG4jXG4jIEZhY2VfaSAtPiBWX2kgLT4gVl9qXG4jXG4jIFRoZXkgYXJlIGEgdXNlZnVsIGFic3RyYWN0aW9uIGZvciBkZWZpbmluZyB0b3BvbG9naWNhbCB0cmFuc2Zvcm1hdGlvbnMgb2YgdGhlIHBvbHloZWRyYWwgbWVzaCwgYXNcbiMgb25lIGNhbiByZWZlciB0byB2ZXJ0aWNlcyBhbmQgZmFjZXMgdGhhdCBkb24ndCB5ZXQgZXhpc3Qgb3IgaGF2ZW4ndCBiZWVuIHRyYXZlcnNlZCB5ZXQgaW4gdGhlXG4jIHRyYW5zZm9ybWF0aW9uIGNvZGUuXG4jXG4jIEEgZmxhZyBpcyBzaW1pbGFyIGluIGNvbmNlcHQgdG8gYSBkaXJlY3RlZCBoYWxmZWRnZSBpbiBoYWxmZWRnZSBkYXRhIHN0cnVjdHVyZXMuXG5cbnsgcG9seWhlZHJvbiB9ID0gcmVxdWlyZSAnLi9wb2x5aGVkcm9uJ1xuXG5NQVhfRkFDRV9TSURFRE5FU1MgPSAxMDAwXG5cbmNsYXNzIHBvbHlmbGFnXG4gICAgXG4gICAgQDogLT5cbiAgICAgICAgQGZsYWdzICAgID0gbmV3IE9iamVjdCgpICMgZmxhZ3NbZmFjZV1bdmVydGV4XSA9IG5leHQgdmVydGV4IG9mIGZsYWc7IHN5bWJvbGljIHRyaXBsZXNcbiAgICAgICAgQHZlcnRpZHhzID0gbmV3IE9iamVjdCgpICMgW3N5bWJvbGljIG5hbWVzXSBob2xkcyB2ZXJ0ZXggaW5kZXhcbiAgICAgICAgQHZlcnRpY2VzID0gbmV3IE9iamVjdCgpICMgWFlaIGNvb3JkaW5hdGVzXG4gIFxuICAgICMgQWRkIGEgbmV3IHZlcnRleCBuYW1lZCBcIm5hbWVcIiB3aXRoIGNvb3JkaW5hdGVzIFwieHl6XCIuXG4gICAgbmV3VjogKHZlcnROYW1lLCBjb29yZGluYXRlcykgLT5cbiAgICAgICAgaWYgbm90IEB2ZXJ0aWR4c1t2ZXJ0TmFtZV1cbiAgICAgICAgICAgIEB2ZXJ0aWR4c1t2ZXJ0TmFtZV0gPSAwXG4gICAgICAgICAgICBAdmVydGljZXNbdmVydE5hbWVdID0gY29vcmRpbmF0ZXNcbiAgXG4gICAgbmV3RmxhZzogKGZhY2VOYW1lLCB2ZXJ0TmFtZTEsIHZlcnROYW1lMikgLT5cbiAgICAgICAgQGZsYWdzW2ZhY2VOYW1lXSA/PSB7fVxuICAgICAgICBAZmxhZ3NbZmFjZU5hbWVdW3ZlcnROYW1lMV0gPSB2ZXJ0TmFtZTJcbiAgXG4gICAgdG9wb2x5OiAtPlxuXG4gICAgICAgIHBvbHkgPSBuZXcgcG9seWhlZHJvbiBcInVua25vd24gcG9seWhlZHJvblwiXG4gICAgXG4gICAgICAgIGN0ciA9IDAgIyBmaXJzdCBudW1iZXIgdGhlIHZlcnRpY2VzXG4gICAgICAgIGZvciBpIGluIEB2ZXJ0aWR4c1xuICAgICAgICAgICAgdiA9IEB2ZXJ0aWR4c1tpXVxuICAgICAgICAgICAgcG9seS52ZXJ0aWNlc1tjdHJdPUB2ZXJ0aWNlc1tpXVxuICAgICAgICAgICAgQHZlcnRpZHhzW2ldID0gY3RyXG4gICAgICAgICAgICBjdHIrK1xuICAgIFxuICAgICAgICBjdHIgPSAwXG4gICAgICAgIGZvciBpIGluIEBmbGFnc1xuXG4gICAgICAgICAgICBmYWNlID0gQGZsYWdzW2ldXG4gICAgICAgICAgICBwb2x5LmZhY2VzW2N0cl0gPSBbXSAjIG5ldyBmYWNlXG4gICAgICAgICAgICAjIGdyYWIgX2FueV8gdmVydGV4IGFzIHN0YXJ0aW5nIHBvaW50XG4gICAgICAgICAgICB2MCA9IGZhY2VbMF1cbiAgICAgICAgICAgICMgYnVpbGQgZmFjZSBvdXQgb2YgYWxsIHRoZSBlZGdlIHJlbGF0aW9ucyBpbiB0aGUgZmxhZyBhc3NvYyBhcnJheVxuICAgICAgICAgICAgdiA9IHYwICMgdiBtb3ZlcyBhcm91bmQgZmFjZVxuICAgICAgICAgICAgcG9seS5mYWNlc1tjdHJdLnB1c2ggQHZlcnRpZHhzW3ZdICNyZWNvcmQgaW5kZXhcbiAgICAgICAgICAgIHYgPSBAZmxhZ3NbaV1bdl0gIyBnb3RvIG5leHQgdmVydGV4XG4gICAgICAgICAgICBmYWNlQ1RSID0gMFxuICAgICAgICAgICAgd2hpbGUgdiAhPSB2MCAjIGxvb3AgdW50aWwgYmFjayB0byBzdGFydFxuICAgICAgICAgICAgICAgIHBvbHkuZmFjZXNbY3RyXS5wdXNoIEB2ZXJ0aWR4c1t2XVxuICAgICAgICAgICAgICAgIHYgPSBAZmxhZ3NbaV1bdl1cbiAgICAgICAgICAgICAgICBmYWNlQ1RSKytcbiAgICAgICAgICAgICAgICAjIG5lY2Vzc2FyeSBkdXJpbmcgZGV2ZWxvcG1lbnQgdG8gcHJldmVudCBicm93c2VyIGhhbmdzIG9uIGJhZGx5IGZvcm1lZCBmbGFnc2V0c1xuICAgICAgICAgICAgICAgIGlmIGZhY2VDVFIgPiBNQVhfRkFDRV9TSURFRE5FU1NcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgXCJCYWQgZmxhZyBzcGVjLCBoYXZlIGEgbmV2ZXJlbmRpbmcgZmFjZTpcIiwgaSwgQGZsYWdzW2ldXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBjdHIrK1xuICAgICAgICBwb2x5XG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgUG9seWhlZHJvbiBPcGVyYXRvcnNcbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgZm9yIGVhY2ggdmVydGV4IG9mIG5ldyBwb2x5aGVkcm9uOlxuIyAgICAgY2FsbCBuZXdWKFZuYW1lLCB4eXopIHdpdGggYSBzeW1ib2xpYyBuYW1lIGFuZCBjb29yZGluYXRlc1xuIyBmb3IgZWFjaCBmbGFnIG9mIG5ldyBwb2x5aGVkcm9uOlxuIyAgICAgY2FsbCBuZXdGbGFnKEZuYW1lLCBWbmFtZTEsIFZuYW1lMikgd2l0aCBhIHN5bWJvbGljIG5hbWUgZm9yIHRoZSBuZXcgZmFjZVxuIyAgICAgYW5kIHRoZSBzeW1ib2xpYyBuYW1lIGZvciB0d28gdmVydGljZXMgZm9ybWluZyBhbiBvcmllbnRlZCBlZGdlXG4jIE9SSUVOVEFUSU9OIC1tdXN0LSBiZSBkZWFsdCB3aXRoIHByb3Blcmx5IHRvIG1ha2UgYSBtYW5pZm9sZCAoY29ycmVjdCkgbWVzaC5cbiMgU3BlY2lmaWNhbGx5LCBubyBlZGdlIHYxLT52MiBjYW4gZXZlciBiZSBjcm9zc2VkIGluIHRoZSAtc2FtZSBkaXJlY3Rpb24tIGJ5XG4jIHR3byBkaWZmZXJlbnQgZmFjZXNcbiMgXG4jIGNhbGwgdG9wb2x5KCkgdG8gYXNzZW1ibGUgZmxhZ3MgaW50byBwb2x5aGVkcm9uIHN0cnVjdHVyZSBieSBmb2xsb3dpbmcgdGhlIG9yYml0c1xuIyBvZiB0aGUgdmVydGV4IG1hcHBpbmcgc3RvcmVkIGluIHRoZSBmbGFnc2V0IGZvciBlYWNoIG5ldyBmYWNlXG4jIFxuIyBzZXQgbmFtZSBhcyBhcHByb3ByaWF0ZVxuXG5taWROYW1lID0gKHYxLCB2MikgLT4gdjE8djIgYW5kIFwiI3t2MX1fI3t2Mn1cIiBvciBcIiN7djJ9XyN7djF9XCIgIyB1bmlxdWUgbmFtZXMgb2YgbWlkcG9pbnRzXG5cbiMgS2lzKE4pXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBLaXMgKGFiYnJldmlhdGVkIGZyb20gdHJpYWtpcykgdHJhbnNmb3JtcyBhbiBOLXNpZGVkIGZhY2UgaW50byBhbiBOLXB5cmFtaWQgcm9vdGVkIGF0IHRoZVxuIyBzYW1lIGJhc2UgdmVydGljZXMuIG9ubHkga2lzIG4tc2lkZWQgZmFjZXMsIGJ1dCBuPT0wIG1lYW5zIGtpcyBhbGwuXG5cbm1vZHVsZS5leHBvcnRzLmtpc04gPSAocG9seSwgbiwgYXBleGRpc3QpIC0+XG5cbiAgICBuID89IDBcbiAgICBhcGV4ZGlzdCA/PSAwLjFcblxuICAgIGNvbnNvbGUubG9nIFwiVGFraW5nIGtpcyBvZiAje259LXNpZGVkIGZhY2VzIG9mICN7cG9seS5uYW1lfS4uLlwiXG5cbiAgICBmbGFnID0gbmV3IHBvbHlmbGFnKClcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXVxuICAgICAgICAjIGVhY2ggb2xkIHZlcnRleCBpcyBhIG5ldyB2ZXJ0ZXhcbiAgICAgICAgcCA9IHBvbHkudmVydGljZXNbaV1cbiAgICAgICAgZmxhZy5uZXdWIFwidiN7aX1cIiBwXG4gIFxuICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIGZvdW5kQW55ID0gZmFsc2VcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MiA9IFwidiN7dn1cIlxuICAgICAgICAgICAgaWYgZi5sZW5ndGggPT0gbiBvciBuID09IDBcbiAgICAgICAgICAgICAgICBmb3VuZEFueSA9IHRydWU7XG4gICAgICAgICAgICAgICAgYXBleCA9IFwiYXBleCN7aX1cIlxuICAgICAgICAgICAgICAgIGZuYW1lID0gXCIje2l9I3t2MX1cIlxuICAgICAgICAgICAgICAgICMgbmV3IHZlcnRpY2VzIGluIGNlbnRlcnMgb2Ygbi1zaWRlZCBmYWNlXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdWIGFwZXgsIGFkZCBjZW50ZXJzW2ldLCBtdWx0IGFwZXhkaXN0LCBub3JtYWxzW2ldXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCAgIHYxLCAgIHYyICMgdGhlIG9sZCBlZGdlIG9mIG9yaWdpbmFsIGZhY2VcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsICAgdjIsIGFwZXggIyB1cCB0byBhcGV4IG9mIHB5cmFtaWRcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIGFwZXgsICAgdjEgIyBhbmQgYmFjayBkb3duIGFnYWluXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiI3tpfVwiLCB2MSwgdjIgICMgc2FtZSBvbGQgZmxhZywgaWYgbm9uLW5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdjEgPSB2MiAjIGN1cnJlbnQgYmVjb21lcyBwcmV2aW91c1xuICBcbiAgICBpZiBub3QgZm91bmRBbnlcbiAgICAgICAgY29uc29sZS5sb2cgXCJObyAje259LWZvbGQgY29tcG9uZW50cyB3ZXJlIGZvdW5kLlwiXG4gIFxuICAgIG5ld3BvbHkgPSBmbGFnLnRvcG9seSgpXG4gICAgbmV3cG9seS5uYW1lID0gXCJrI3tufSN7cG9seS5uYW1lfVwiXG4gICAgcmV0dXJuIG5ld3BvbHlcblxuIyBBbWJvXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBUaGUgYmVzdCB3YXkgdG8gdGhpbmsgb2YgdGhlIGFtYm8gb3BlcmF0b3IgaXMgYXMgYSB0b3BvbG9naWNhbCBcInR3ZWVuXCIgYmV0d2VlbiBhIHBvbHloZWRyb25cbiMgYW5kIGl0cyBkdWFsIHBvbHloZWRyb24uICBUaHVzIHRoZSBhbWJvIG9mIGEgZHVhbCBwb2x5aGVkcm9uIGlzIHRoZSBzYW1lIGFzIHRoZSBhbWJvIG9mIHRoZVxuIyBvcmlnaW5hbC4gQWxzbyBjYWxsZWQgXCJSZWN0aWZ5XCIuXG5cbm1vZHVsZS5leHBvcnRzLmFtYm8gPSAocG9seSkgLT5cbiAgICBjb25zb2xlLmxvZyBcIlRha2luZyBhbWJvIG9mICN7cG9seS5uYW1lfS4uLlwiXG4gICAgZmxhZyA9IG5ldyBwb2x5ZmxhZygpXG4gIFxuICAgICMgRm9yIGVhY2ggZmFjZSBmIGluIHRoZSBvcmlnaW5hbCBwb2x5XG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlKC0yKVxuICAgICAgICBmb3IgdjMgaW4gZlxuICAgICAgICAgICAgaWYgdjEgPCB2MiAjIHZlcnRpY2VzIGFyZSB0aGUgbWlkcG9pbnRzIG9mIGFsbCBlZGdlcyBvZiBvcmlnaW5hbCBwb2x5XG4gICAgICAgICAgICAgICAgZmxhZy5uZXdWIG1pZE5hbWUodjEsdjIpLCBtaWRwb2ludCBwb2x5LnZlcnRpY2VzW3YxXSwgcG9seS52ZXJ0aWNlc1t2Ml1cbiAgICAgICAgICAgICMgZmFjZSBjb3JyZXNwb25kcyB0byB0aGUgb3JpZ2luYWwgZlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwib3JpZyN7aX1cIiAgbWlkTmFtZSh2MSx2MiksIG1pZE5hbWUodjIsdjMpXG4gICAgICAgICAgICAjIGZhY2UgY29ycmVzcG9uZHMgdG8gKHRoZSB0cnVuY2F0ZWQpIHYyXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJkdWFsI3t2Mn1cIiBtaWROYW1lKHYyLHYzKSwgbWlkTmFtZSh2MSx2MilcbiAgICAgICAgICAgICMgc2hpZnQgb3ZlciBvbmVcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M11cbiAgXG4gICAgbmV3cG9seSA9IGZsYWcudG9wb2x5KClcbiAgICBuZXdwb2x5Lm5hbWUgPSBcImEje3BvbHkubmFtZX1cIlxuICAgIG5ld3BvbHlcblxuIyBHeXJvXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgVGhpcyBpcyB0aGUgZHVhbCBvcGVyYXRvciB0byBcInNudWJcIiwgaS5lIGR1YWwqR3lybyA9IFNudWIuICBJdCBpcyBhIGJpdCBlYXNpZXIgdG8gaW1wbGVtZW50XG4jIHRoaXMgd2F5LlxuI1xuIyBTbnViIGNyZWF0ZXMgYXQgZWFjaCB2ZXJ0ZXggYSBuZXcgZmFjZSwgZXhwYW5kcyBhbmQgdHdpc3RzIGl0LCBhbmQgYWRkcyB0d28gbmV3IHRyaWFuZ2xlcyB0b1xuIyByZXBsYWNlIGVhY2ggZWRnZS5cblxubW9kdWxlLmV4cG9ydHMuZ3lybyA9IChwb2x5KSAtPlxuXG4gICAgY29uc29sZS5sb2cgXCJUYWtpbmcgZ3lybyBvZiAje3BvbHkubmFtZX0uLi5cIlxuICBcbiAgICBmbGFnID0gbmV3IHBvbHlmbGFnKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgZmxhZy5uZXdWIFwidiN7aX1cIiB1bml0IHBvbHkudmVydGljZXNbaV0gIyBlYWNoIG9sZCB2ZXJ0ZXggaXMgYSBuZXcgdmVydGV4XG5cbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKCkgIyBuZXcgdmVydGljZXMgaW4gY2VudGVyIG9mIGVhY2ggZmFjZVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIGZsYWcubmV3VihcImNlbnRlciN7aX1cIiwgdW5pdChjZW50ZXJzW2ldKSlcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlKC0yKVxuICAgICAgICBmb3IgaiBpbiBbMC4uLmYubGVuZ3RoXVxuICAgICAgICAgICAgdiA9IGZbal1cbiAgICAgICAgICAgIHYzID0gdlxuICAgICAgICAgICAgZmxhZy5uZXdWKHYxK1wiflwiK3YyLCBvbmVUaGlyZChwb2x5LnZlcnRpY2VzW3YxXSxwb2x5LnZlcnRpY2VzW3YyXSkpOyAgIyBuZXcgdiBpbiBmYWNlXG4gICAgICAgICAgICBmbmFtZSA9IGkrXCJmXCIrdjFcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgXCJjZW50ZXIje2l9XCIsICAgICAgdjErXCJ+XCIrdjIpICMgZml2ZSBuZXcgZmxhZ3NcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgdjErXCJ+XCIrdjIsICB2MitcIn5cIit2MSlcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgdjIrXCJ+XCIrdjEsICBcInYje3YyfVwiKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCBcInYje3YyfVwiLCAgICAgdjIrXCJ+XCIrdjMpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsIHYyK1wiflwiK3YzLCAgXCJjZW50ZXIje2l9XCIpXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdOyAjIHNoaWZ0IG92ZXIgb25lXG4gIFxuICAgIG5ld3BvbHkgPSBmbGFnLnRvcG9seSgpXG4gICAgbmV3cG9seS5uYW1lID0gXCJnI3twb2x5Lm5hbWV9XCJcbiAgICBuZXdwb2x5XG5cbiMgUHJvcGVsbG9yXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBidWlsZHMgYSBuZXcgJ3NrZXcgZmFjZScgYnkgbWFraW5nIG5ldyBwb2ludHMgYWxvbmcgZWRnZXMsIDEvM3JkIHRoZSBkaXN0YW5jZSBmcm9tIHYxLT52MixcbiMgdGhlbiBjb25uZWN0aW5nIHRoZXNlIGludG8gYSBuZXcgaW5zZXQgZmFjZS4gIFRoaXMgYnJlYWtzIHJvdGF0aW9uYWwgc3ltbWV0cnkgYWJvdXQgdGhlXG4jIGZhY2VzLCB3aGlybGluZyB0aGVtIGludG8gZ3lyZXNcbiNcbm1vZHVsZS5leHBvcnRzLnByb3BlbGxvciA9IChwb2x5KSAtPlxuXG4gICAgY29uc29sZS5sb2cgXCJUYWtpbmcgcHJvcGVsbG9yIG9mICN7cG9seS5uYW1lfS4uLlwiXG4gIFxuICAgIGZsYWcgPSBuZXcgcG9seWZsYWcoKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXSAjIGVhY2ggb2xkIHZlcnRleCBpcyBhIG5ldyB2ZXJ0ZXhcbiAgICAgICAgZmxhZy5uZXdWIFwidiN7aX1cIiB1bml0IHBvbHkudmVydGljZXNbaV1cbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlKC0yKVxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MyA9IFwiI3t2fVwiXG4gICAgICAgICAgICBmbGFnLm5ld1YodjErXCJ+XCIrdjIsIG9uZVRoaXJkKHBvbHkudmVydGljZXNbdjFdLCBwb2x5LnZlcnRpY2VzW3YyXSkpOyAgIyBuZXcgdiBpbiBmYWNlLCAxLzNyZCBhbG9uZyBlZGdlXG4gICAgICAgICAgICBmbmFtZSA9IFwiI3tpfWYje3YyfVwiO1xuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKFwidiN7aX1cIiwgdjErXCJ+XCIrdjIsICB2MitcIn5cIit2Myk7ICMgZml2ZSBuZXcgZmxhZ3NcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgICB2MStcIn5cIit2MiwgIHYyK1wiflwiK3YxKTtcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgICB2MitcIn5cIit2MSwgICAgIFwidiN7djJ9XCIpO1xuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCAgICAgIFwidiN7djJ9XCIsICB2MitcIn5cIit2Myk7XG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsICAgdjIrXCJ+XCIrdjMsICB2MStcIn5cIit2Mik7XG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gICAgXG4gICAgbmV3cG9seSA9IGZsYWcudG9wb2x5KClcbiAgICBuZXdwb2x5Lm5hbWUgPSBcInAje3BvbHkubmFtZX1cIlxuICAgIG5ld3BvbHlcblxuIyBSZWZsZWN0aW9uXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBnZW9tZXRyaWMgcmVmbGVjdGlvbiB0aHJvdWdoIG9yaWdpblxubW9kdWxlLmV4cG9ydHMucmVmbGVjdCA9IChwb2x5KSAtPlxuXG4gICAgY29uc29sZS5sb2cgXCJUYWtpbmcgcmVmbGVjdGlvbiBvZiAje3BvbHkubmFtZX0uLi5cIlxuICAgICMgcmVmbGVjdCBlYWNoIHBvaW50IHRocm91Z2ggb3JpZ2luXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgcG9seS52ZXJ0aWNlc1tpXSA9IG11bHQgLTEsIHBvbHkudmVydGljZXNbaV1cbiAgICAjIHJlcGFpciBjbG9ja3dpc2UtbmVzcyBvZiBmYWNlc1xuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIHBvbHkuZmFjZXNbaV0gPSBwb2x5LmZhY2VzW2ldLnJldmVyc2UoKVxuICAgIHBvbHkubmFtZSA9IFwiciN7cG9seS5uYW1lfVwiXG4gICAgcG9seVxuXG4jIER1YWxcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFRoZSBkdWFsIG9mIGEgcG9seWhlZHJvbiBpcyBhbm90aGVyIG1lc2ggd2hlcmVpbjpcbiMgLSBldmVyeSBmYWNlIGluIHRoZSBvcmlnaW5hbCBiZWNvbWVzIGEgdmVydGV4IGluIHRoZSBkdWFsXG4jIC0gZXZlcnkgdmVydGV4IGluIHRoZSBvcmlnaW5hbCBiZWNvbWVzIGEgZmFjZSBpbiB0aGUgZHVhbFxuI1xuIyBTbyBOX2ZhY2VzLCBOX3ZlcnRpY2VzID0gTl9kdWFsZmFjZXMsIE5fZHVhbHZlcnRpY2VzXG4jXG4jIFRoZSBuZXcgdmVydGV4IGNvb3JkaW5hdGVzIGFyZSBjb252ZW5pZW50IHRvIHNldCB0byB0aGUgb3JpZ2luYWwgZmFjZSBjZW50cm9pZHMuXG5cbm1vZHVsZS5leHBvcnRzLmR1YWwgPSAocG9seSkgLT5cblxuICAgIGNvbnNvbGUubG9nIFwiVGFraW5nIGR1YWwgb2YgI3twb2x5Lm5hbWV9Li4uXCIgcG9seVxuICBcbiAgICBmbGFnID0gbmV3IHBvbHlmbGFnKClcbiAgXG4gICAgZmFjZSA9IFtdICMgbWFrZSB0YWJsZSBvZiBmYWNlIGFzIGZuIG9mIGVkZ2VcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXSAjIGNyZWF0ZSBlbXB0eSBhc3NvY2lhdGl2ZSB0YWJsZVxuICAgICAgICBmYWNlW2ldID0ge31cblxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gZltmLmxlbmd0aC0xXSAjcHJldmlvdXMgdmVydGV4XG4gICAgICAgIGZvciB2MiBpbiBmXG4gICAgICAgICAgICAjIFRISVMgQVNTVU1FUyB0aGF0IG5vIDIgZmFjZXMgdGhhdCBzaGFyZSBhbiBlZGdlIHNoYXJlIGl0IGluIHRoZSBzYW1lIG9yaWVudGF0aW9uIVxuICAgICAgICAgICAgIyB3aGljaCBvZiBjb3Vyc2UgbmV2ZXIgaGFwcGVucyBmb3IgcHJvcGVyIG1hbmlmb2xkIG1lc2hlcywgc28gZ2V0IHlvdXIgbWVzaGVzIHJpZ2h0LlxuICAgICAgICAgICAgZmFjZVt2MV1bXCJ2I3t2Mn1cIl0gPSBcIiN7aX1cIlxuICAgICAgICAgICAgdjEgPSB2MiAjIGN1cnJlbnQgYmVjb21lcyBwcmV2aW91c1xuICBcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmbGFnLm5ld1YgXCIje2l9XCIgY2VudGVyc1tpXVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IGZbZi5sZW5ndGgtMV0gI3ByZXZpb3VzIHZlcnRleFxuICAgICAgICBmb3IgdjIgaW4gZlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIHYxLCBmYWNlW3YyXVtcInYje3YxfVwiXSwgXCIje2l9XCJcbiAgICAgICAgICAgIHYxPXYyICMgY3VycmVudCBiZWNvbWVzIHByZXZpb3VzXG4gIFxuICAgIGRwb2x5ID0gZmxhZy50b3BvbHkoKSAjIGJ1aWxkIHRvcG9sb2dpY2FsIGR1YWwgZnJvbSBmbGFnc1xuICBcbiAgICAjIG1hdGNoIEYgaW5kZXggb3JkZXJpbmcgdG8gViBpbmRleCBvcmRlcmluZyBvbiBkdWFsXG4gICAgc29ydEYgPSBbXVxuICAgIGZvciBmIGluIGRwb2x5LmZhY2VzXG4gICAgICAgIGsgPSBpbnRlcnNlY3QgcG9seS5mYWNlc1tmWzBdXSwgcG9seS5mYWNlc1tmWzFdXSwgcG9seS5mYWNlc1tmWzJdXVxuICAgICAgICBzb3J0RltrXSA9IGZcbiAgICBkcG9seS5mYWNlcyA9IHNvcnRGXG4gIFxuICAgIGlmIHBvbHkubmFtZVswXSAhPSBcImRcIlxuICAgICAgICBkcG9seS5uYW1lID0gXCJkI3twb2x5Lm5hbWV9XCJcbiAgICBlbHNlIFxuICAgICAgICBkcG9seS5uYW1lID0gcG9seS5uYW1lLnNsaWNlKDEpXG4gIFxuICAgIGRwb2x5XG5cbiMgQ2hhbWZlclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEEgdHJ1bmNhdGlvbiBhbG9uZyBhIHBvbHloZWRyb24ncyBlZGdlcy5cbiMgQ2hhbWZlcmluZyBvciBlZGdlLXRydW5jYXRpb24gaXMgc2ltaWxhciB0byBleHBhbnNpb24sIG1vdmluZyBmYWNlcyBhcGFydCBhbmQgb3V0d2FyZCxcbiMgYnV0IGFsc28gbWFpbnRhaW5zIHRoZSBvcmlnaW5hbCB2ZXJ0aWNlcy4gQWRkcyBhIG5ldyBoZXhhZ29uYWwgZmFjZSBpbiBwbGFjZSBvZiBlYWNoXG4jIG9yaWdpbmFsIGVkZ2UuXG4jIEEgcG9seWhlZHJvbiB3aXRoIGUgZWRnZXMgd2lsbCBoYXZlIGEgY2hhbWZlcmVkIGZvcm0gY29udGFpbmluZyAyZSBuZXcgdmVydGljZXMsXG4jIDNlIG5ldyBlZGdlcywgYW5kIGUgbmV3IGhleGFnb25hbCBmYWNlcy4gLS0gV2lraXBlZGlhXG4jIFNlZSBhbHNvIGh0dHA6I2RtY2Nvb2V5LmNvbS9wb2x5aGVkcmEvQ2hhbWZlci5odG1sXG4jXG4jIFRoZSBkaXN0IHBhcmFtZXRlciBjb3VsZCBjb250cm9sIGhvdyBkZWVwbHkgdG8gY2hhbWZlci5cbiMgQnV0IEknbSBub3Qgc3VyZSBhYm91dCBpbXBsZW1lbnRpbmcgdGhhdCB5ZXQuXG4jXG4jIFE6IHdoYXQgaXMgdGhlIGR1YWwgb3BlcmF0aW9uIG9mIGNoYW1mZXJpbmc/IEkuZS5cbiMgaWYgY1ggPSBkeGRYLCBhbmQgeFggPSBkY2RYLCB3aGF0IG9wZXJhdGlvbiBpcyB4P1xuXG4jIFdlIGNvdWxkIFwiYWxtb3N0XCIgZG8gdGhpcyBpbiB0ZXJtcyBvZiBhbHJlYWR5LWltcGxlbWVudGVkIG9wZXJhdGlvbnM6XG4jIGNDID0gdDRkYUMgPSB0NGpDLCBjTyA9IHQzZGFPLCBjRCA9IHQ1ZGFELCBjSSA9IHQzZGFJXG4jIEJ1dCBpdCBkb2Vzbid0IHdvcmsgZm9yIGNhc2VzIGxpa2UgVC5cblxubW9kdWxlLmV4cG9ydHMuY2hhbWZlciA9IChwb2x5LCBkaXN0KSAtPlxuICAgIGNvbnNvbGUubG9nIFwiVGFraW5nIGNoYW1mZXIgb2YgI3twb2x5Lm5hbWV9Li4uXCJcbiAgXG4gICAgZGlzdCA/PSAwLjVcbiAgXG4gICAgZmxhZyA9IG5ldyBwb2x5ZmxhZygpXG4gIFxuICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICBcbiAgICAjIEZvciBlYWNoIGZhY2UgZiBpbiB0aGUgb3JpZ2luYWwgcG9seVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gZltmLmxlbmd0aC0xXVxuICAgICAgICB2MW5ldyA9IGkgKyBcIl9cIiArIHYxXG4gICAgXG4gICAgICAgIGZvciB2MiBpbiBmXG4gICAgICAgICAgIyBUT0RPOiBmaWd1cmUgb3V0IHdoYXQgZGlzdGFuY2VzIHdpbGwgZ2l2ZSB1cyBhIHBsYW5hciBoZXggZmFjZS5cbiAgICAgICAgICAjIE1vdmUgZWFjaCBvbGQgdmVydGV4IGZ1cnRoZXIgZnJvbSB0aGUgb3JpZ2luLlxuICAgICAgICAgIGZsYWcubmV3Vih2MiwgbXVsdCgxLjAgKyBkaXN0LCBwb2x5LnZlcnRpY2VzW3YyXSkpXG4gICAgICAgICAgIyBBZGQgYSBuZXcgdmVydGV4LCBtb3ZlZCBwYXJhbGxlbCB0byBub3JtYWwuXG4gICAgICAgICAgdjJuZXcgPSBpICsgXCJfXCIgKyB2MlxuICAgICAgICAgIGZsYWcubmV3Vih2Mm5ldywgYWRkKHBvbHkudmVydGljZXNbdjJdLCBtdWx0KGRpc3QqMS41LCBub3JtYWxzW2ldKSkpXG4gICAgICAgICAgIyBGb3VyIG5ldyBmbGFnczpcbiAgICAgICAgICAjIE9uZSB3aG9zZSBmYWNlIGNvcnJlc3BvbmRzIHRvIHRoZSBvcmlnaW5hbCBmYWNlOlxuICAgICAgICAgIGZsYWcubmV3RmxhZyhcIm9yaWcje2l9XCIsIHYxbmV3LCB2Mm5ldylcbiAgICAgICAgICAjIEFuZCB0aHJlZSBmb3IgdGhlIGVkZ2VzIG9mIHRoZSBuZXcgaGV4YWdvbjpcbiAgICAgICAgICBmYWNlbmFtZSA9ICh2MTx2MiA/IFwiaGV4I3t2MX1fI3t2Mn1cIiA6IFwiaGV4I3t2Mn1fI3t2MX1cIilcbiAgICAgICAgICBmbGFnLm5ld0ZsYWcoZmFjZW5hbWUsIHYyLCB2Mm5ldylcbiAgICAgICAgICBmbGFnLm5ld0ZsYWcoZmFjZW5hbWUsIHYybmV3LCB2MW5ldylcbiAgICAgICAgICBmbGFnLm5ld0ZsYWcoZmFjZW5hbWUsIHYxbmV3LCB2MSlcbiAgICAgICAgICB2MSA9IHYyO1xuICAgICAgICAgIHYxbmV3ID0gdjJuZXdcblxuICAgIG5ld3BvbHkgPSBmbGFnLnRvcG9seSgpXG4gICAgbmV3cG9seS5uYW1lID0gXCJjI3twb2x5Lm5hbWV9XCJcbiAgICBuZXdwb2x5XG5cbiMgV2hpcmxcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBHeXJvIGZvbGxvd2VkIGJ5IHRydW5jYXRpb24gb2YgdmVydGljZXMgY2VudGVyZWQgb24gb3JpZ2luYWwgZmFjZXMuXG4jIFRoaXMgY3JlYXRlIDIgbmV3IGhleGFnb25zIGZvciBldmVyeSBvcmlnaW5hbCBlZGdlLlxuIyAoaHR0cHM6I2VuLndpa2lwZWRpYS5vcmcvd2lraS9Db253YXlfcG9seWhlZHJvbl9ub3RhdGlvbiNPcGVyYXRpb25zX29uX3BvbHloZWRyYSlcbiNcbiMgUG9zc2libGUgZXh0ZW5zaW9uOiB0YWtlIGEgcGFyYW1ldGVyIG4gdGhhdCBtZWFucyBvbmx5IHdoaXJsIG4tc2lkZWQgZmFjZXMuXG4jIElmIHdlIGRvIHRoYXQsIHRoZSBmbGFncyBtYXJrZWQgIyogYmVsb3cgd2lsbCBuZWVkIHRvIGhhdmUgdGhlaXIgb3RoZXIgc2lkZXNcbiMgZmlsbGVkIGluIG9uZSB3YXkgb3IgYW5vdGhlciwgZGVwZW5kaW5nIG9uIHdoZXRoZXIgdGhlIGFkamFjZW50IGZhY2UgaXNcbiMgd2hpcmxlZCBvciBub3QuXG5cbm1vZHVsZS5leHBvcnRzLndoaXJsID0gKHBvbHksIG4pIC0+XG5cbiAgICBjb25zb2xlLmxvZyBcIlRha2luZyB3aGlybCBvZiAje3BvbHkubmFtZX0uLi5cIlxuICAgIG4gPz0gMFxuICAgIFxuICAgIGZsYWcgPSBuZXcgcG9seWZsYWcoKVxuICBcbiAgICAjIGVhY2ggb2xkIHZlcnRleCBpcyBhIG5ldyB2ZXJ0ZXhcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXVxuICAgICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHVuaXQgcG9seS52ZXJ0aWNlc1tpXVxuXG4gICAgIyBuZXcgdmVydGljZXMgYXJvdW5kIGNlbnRlciBvZiBlYWNoIGZhY2VcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlKC0yKVxuICAgICAgICBmb3IgaiBpbiBbMC4uLmYubGVuZ3RoXVxuICAgICAgICAgICAgdiA9IGZbal1cbiAgICAgICAgICAgIHYzID0gdlxuICAgICAgICAgICAgIyBOZXcgdmVydGV4IGFsb25nIGVkZ2VcbiAgICAgICAgICAgIHYxXzIgPSBvbmVUaGlyZChwb2x5LnZlcnRpY2VzW3YxXSxwb2x5LnZlcnRpY2VzW3YyXSlcbiAgICAgICAgICAgIGZsYWcubmV3Vih2MStcIn5cIit2MiwgdjFfMilcbiAgICAgICAgICAgICMgTmV3IHZlcnRpY2VzIG5lYXIgY2VudGVyIG9mIGZhY2VcbiAgICAgICAgICAgIGN2MW5hbWUgPSBcImNlbnRlciN7aX1+I3t2MX1cIlxuICAgICAgICAgICAgY3YybmFtZSA9IFwiY2VudGVyI3tpfX4je3YyfVwiXG4gICAgICAgICAgICBmbGFnLm5ld1YoY3YxbmFtZSwgdW5pdChvbmVUaGlyZChjZW50ZXJzW2ldLCB2MV8yKSkpXG4gICAgICAgICAgICBmbmFtZSA9IGkrXCJmXCIrdjFcbiAgICAgICAgICAgICMgTmV3IGhleGFnb24gZm9yIGVhY2ggb3JpZ2luYWwgZWRnZVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCBjdjFuYW1lLCAgIHYxK1wiflwiK3YyKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCB2MStcIn5cIit2MiwgdjIrXCJ+XCIrdjEpICMqXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsIHYyK1wiflwiK3YxLCBcInYje3YyfVwiKSAgIypcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgXCJ2I3t2Mn1cIiwgIHYyK1wiflwiK3YzKSAjKlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCB2MitcIn5cIit2MywgY3YybmFtZSlcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgY3YybmFtZSwgICBjdjFuYW1lKVxuICAgICAgICAgICAgIyBOZXcgZmFjZSBpbiBjZW50ZXIgb2YgZWFjaCBvbGQgZmFjZSAgICAgIFxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKFwiYyN7aX1cIiwgY3YxbmFtZSwgY3YybmFtZSlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXSAjIHNoaWZ0IG92ZXIgb25lXG4gIFxuICAgIG5ld3BvbHkgPSBmbGFnLnRvcG9seSgpXG4gICAgbmV3cG9seS5uYW1lID0gXCJ3I3twb2x5Lm5hbWV9XCJcbiAgICBuZXdwb2x5XG5cbiMgUXVpbnRvXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgVGhpcyBjcmVhdGVzIGEgcGVudGFnb24gZm9yIGV2ZXJ5IHBvaW50IGluIHRoZSBvcmlnaW5hbCBmYWNlLCBhcyB3ZWxsIGFzIG9uZSBuZXcgaW5zZXQgZmFjZS5cbm1vZHVsZS5leHBvcnRzLnF1aW50byA9IChwb2x5KSAtPlxuICAgIFxuICAgIGNvbnNvbGUubG9nKFwiVGFraW5nIHF1aW50byBvZiAje3BvbHkubmFtZX0uLi5cIilcbiAgICBmbGFnID0gbmV3IHBvbHlmbGFnKClcbiAgXG4gICAgIyBGb3IgZWFjaCBmYWNlIGYgaW4gdGhlIG9yaWdpbmFsIHBvbHlcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBjZW50cm9pZCA9IGNhbGNDZW50cm9pZCBmLm1hcCAoaWR4KSAtPiBwb2x5LnZlcnRpY2VzW2lkeF1cbiAgICAgICAgIyB3YWxrIG92ZXIgZmFjZSB2ZXJ0ZXgtdHJpcGxldHNcbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlKC0yKVxuICAgICAgICBmb3IgdjMgaW4gZlxuICAgICAgICAgICAgIyBmb3IgZWFjaCBmYWNlLWNvcm5lciwgd2UgbWFrZSB0d28gbmV3IHBvaW50czpcbiAgICAgICAgICAgIG1pZHB0ID0gbWlkcG9pbnQocG9seS52ZXJ0aWNlc1t2MV0sIHBvbHkudmVydGljZXNbdjJdKVxuICAgICAgICAgICAgaW5uZXJwdCA9IG1pZHBvaW50KG1pZHB0LCBjZW50cm9pZClcbiAgICAgICAgICAgIGZsYWcubmV3VihtaWROYW1lKHYxLHYyKSwgbWlkcHQpXG4gICAgICAgICAgICBmbGFnLm5ld1YoXCJpbm5lcl8je2l9X1wiICsgbWlkTmFtZSh2MSx2MiksIGlubmVycHQpXG4gICAgICAgICAgICAjIGFuZCBhZGQgdGhlIG9sZCBjb3JuZXItdmVydGV4XG4gICAgICAgICAgICBmbGFnLm5ld1YoXCIje3YyfVwiLCBwb2x5LnZlcnRpY2VzW3YyXSlcbiAgICAgICAgICBcbiAgICAgICAgICAgICMgcGVudGFnb24gZm9yIGVhY2ggdmVydGV4IGluIG9yaWdpbmFsIGZhY2VcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImYje2l9XyN7djJ9XCIsIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYxLCB2MiksIG1pZE5hbWUodjEsIHYyKSlcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImYje2l9XyN7djJ9XCIsIG1pZE5hbWUodjEsIHYyKSwgXCIje3YyfVwiKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKFwiZiN7aX1fI3t2Mn1cIiwgXCIje3YyfVwiLCBtaWROYW1lKHYyLCB2MykpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoXCJmI3tpfV8je3YyfVwiLCBtaWROYW1lKHYyLCB2MyksIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYyLCB2MykpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoXCJmI3tpfV8je3YyfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpKVxuICAgICAgXG4gICAgICAgICAgICAjIGlubmVyIHJvdGF0ZWQgZmFjZSBvZiBzYW1lIHZlcnRleC1udW1iZXIgYXMgb3JpZ2luYWxcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImZfaW5fI3tpfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpKVxuICAgICAgXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdICMgc2hpZnQgb3ZlciBvbmVcbiAgXG4gICAgbmV3cG9seSA9IGZsYWcudG9wb2x5KClcbiAgICBuZXdwb2x5Lm5hbWUgPSBcInEje3BvbHkubmFtZX1cIlxuICAgIG5ld3BvbHlcblxuIyBpbnNldCAvIGV4dHJ1ZGUgLyBcIkxvZnRcIiBvcGVyYXRvclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbm1vZHVsZS5leHBvcnRzLmluc2V0TiA9IChwb2x5LCBuLCBpbnNldF9kaXN0LCBwb3BvdXRfZGlzdCktPlxuXG4gICAgbiA/PSAwXG4gICAgaW5zZXRfZGlzdCA/PSAwLjVcbiAgICBwb3BvdXRfZGlzdCA/PSAtMC4yXG4gIFxuICAgIGNvbnNvbGUubG9nIFwiVGFraW5nIGluc2V0IG9mICN7bn0tc2lkZWQgZmFjZXMgb2YgI3twb2x5Lm5hbWV9Li4uXCJcbiAgXG4gICAgZmxhZyA9IG5ldyBwb2x5ZmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgIyBlYWNoIG9sZCB2ZXJ0ZXggaXMgYSBuZXcgdmVydGV4XG4gICAgICAgIHAgPSBwb2x5LnZlcnRpY2VzW2ldXG4gICAgICAgIGZsYWcubmV3ViBcInYje2l9XCIgcFxuXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF0gI25ldyBpbnNldCB2ZXJ0ZXggZm9yIGV2ZXJ5IHZlcnQgaW4gZmFjZVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBpZiBmLmxlbmd0aCA9PSBuIG9yIG4gPT0gMFxuICAgICAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgICAgIGZsYWcubmV3ViBcImYje2l9diN7dn1cIiBhZGQgdHdlZW4ocG9seS52ZXJ0aWNlc1t2XSxjZW50ZXJzW2ldLGluc2V0X2Rpc3QpLCBtdWx0KHBvcG91dF9kaXN0LG5vcm1hbHNbaV0pXG4gIFxuICAgIGZvdW5kQW55ID0gZmFsc2UgIyBhbGVydCBpZiBkb24ndCBmaW5kIGFueVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gXCJ2I3tmW2YubGVuZ3RoLTFdfVwiXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIHYyID0gXCJ2I3t2fVwiO1xuICAgICAgICAgICAgaWYgZi5sZW5ndGggPT0gbiBvciBuID09IDBcbiAgICAgICAgICAgICAgICBmb3VuZEFueSA9IHRydWVcbiAgICAgICAgICAgICAgICBmbmFtZSA9IGkgKyB2MVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgICAgICB2MSwgICAgICAgdjIpXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCAgICAgIHYyLCAgICAgICBcImYje2l9I3t2Mn1cIilcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsIFwiZiN7aX0je3YyfVwiLCAgXCJmI3tpfSN7djF9XCIpXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCBcImYje2l9I3t2MX1cIiwgIHYxKVxuICAgICAgICAgICAgICAgICNuZXcgaW5zZXQsIGV4dHJ1ZGVkIGZhY2VcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcoXCJleCN7aX1cIiwgXCJmI3tpfSN7djF9XCIsICBcImYje2l9I3t2Mn1cIilcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcoaSwgdjEsIHYyKSAgIyBzYW1lIG9sZCBmbGFnLCBpZiBub24tblxuICAgICAgICAgICAgdjE9djIgIyBjdXJyZW50IGJlY29tZXMgcHJldmlvdXNcbiAgXG4gICAgaWYgbm90IGZvdW5kQW55XG4gICAgICAgIGNvbnNvbGUubG9nIFwiTm8gI3tufS1mb2xkIGNvbXBvbmVudHMgd2VyZSBmb3VuZC5cIlxuICBcbiAgICBuZXdwb2x5ID0gZmxhZy50b3BvbHkoKVxuICAgIG5ld3BvbHkubmFtZSA9IFwibiN7bn0je3BvbHkubmFtZX1cIlxuICAgIG5ld3BvbHlcblxuIyBleHRydWRlTlxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBvbGRlciBvcGVyYXRvciBzcGVjXG5tb2R1bGUuZXhwb3J0cy5leHRydWRlTiA9IChwb2x5LCBuKSAtPlxuICAgIG5ld3BvbHkgPSBpbnNldE4gcG9seSwgbiwgMC4wLCAwLjNcbiAgICBuZXdwb2x5Lm5hbWUgPSBcIngje259I3twb2x5Lm5hbWV9XCJcbiAgICBuZXdwb2x5XG5cbiMgbG9mdFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbm1vZHVsZS5leHBvcnRzLmxvZnQgPSAocG9seSwgbiwgYWxwaGEpIC0+XG4gICAgbmV3cG9seSA9IGluc2V0TiBwb2x5LCBuLCBhbHBoYSwgMC4wXG4gICAgbmV3cG9seS5uYW1lID0gXCJsI3tufSN7cG9seS5uYW1lfVwiXG4gICAgbmV3cG9seVxuXG4jIEhvbGxvdyAoc2tlbGV0b25pemUpXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxubW9kdWxlLmV4cG9ydHMuaG9sbG93ID0gKHBvbHksIGluc2V0X2Rpc3QsIHRoaWNrbmVzcykgLT5cblxuICAgIGluc2V0X2Rpc3QgPz0gMC41XG4gICAgdGhpY2tuZXNzID89IDAuMlxuICBcbiAgICBjb25zb2xlLmxvZyBcIkhvbGxvd2luZyAje3BvbHkubmFtZX0uLi5cIlxuICBcbiAgICBkdWFsbm9ybWFscyA9IGR1YWwocG9seSkubm9ybWFscygpXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gIFxuICAgIGZsYWcgPSBuZXcgcG9seWZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAjIGVhY2ggb2xkIHZlcnRleCBpcyBhIG5ldyB2ZXJ0ZXhcbiAgICAgIHAgPSBwb2x5LnZlcnRpY2VzW2ldXG4gICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHBcbiAgICAgIGZsYWcubmV3ViBcImRvd252I3tpfVwiIGFkZCBwLCBtdWx0IC0xKnRoaWNrbmVzcyxkdWFsbm9ybWFsc1tpXVxuXG4gICAgIyBuZXcgaW5zZXQgdmVydGV4IGZvciBldmVyeSB2ZXJ0IGluIGZhY2VcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICBmbGFnLm5ld1YgXCJmaW4je2l9diN7dn1cIiB0d2VlbiBwb2x5LnZlcnRpY2VzW3ZdLCBjZW50ZXJzW2ldLCBpbnNldF9kaXN0XG4gICAgICAgICAgICBmbGFnLm5ld1YgXCJmaW5kb3duI3tpfXYje3Z9XCIgYWRkIHR3ZWVuKHBvbHkudmVydGljZXNbdl0sY2VudGVyc1tpXSxpbnNldF9kaXN0KSwgbXVsdCgtMSp0aGlja25lc3Msbm9ybWFsc1tpXSlcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgdjIgPSBcInYje3Z9XCJcbiAgICAgICAgICAgIGZuYW1lID0gaSArIHYxXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsICAgICAgdjEsICAgICAgIHYyKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCAgICAgIHYyLCAgICAgICBcImZpbiN7aX0je3YyfVwiKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCBcImZpbiN7aX0je3YyfVwiLCAgXCJmaW4je2l9I3t2MX1cIilcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgXCJmaW4je2l9I3t2MX1cIiwgIHYxKVxuICAgICAgXG4gICAgICAgICAgICBmbmFtZSA9IFwic2lkZXMje2l9I3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCBcImZpbiN7aX0je3YxfVwiLCAgICAgXCJmaW4je2l9I3t2Mn1cIilcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgXCJmaW4je2l9I3t2Mn1cIiwgICAgIFwiZmluZG93biN7aX0je3YyfVwiKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCBcImZpbmRvd24je2l9I3t2Mn1cIiwgXCJmaW5kb3duI3tpfSN7djF9XCIpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsIFwiZmluZG93biN7aX0je3YxfVwiLCBcImZpbiN7aX0je3YxfVwiKVxuICAgICAgXG4gICAgICAgICAgICBmbmFtZSA9IFwiYm90dG9tI3tpfSN7djF9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgIFwiZG93biN7djJ9XCIsICAgICAgXCJkb3duI3t2MX1cIilcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgIFwiZG93biN7djF9XCIsICAgICAgXCJmaW5kb3duI3tpfSN7djF9XCIpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsICBcImZpbmRvd24je2l9I3t2MX1cIiwgXCJmaW5kb3duI3tpfSN7djJ9XCIpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsICBcImZpbmRvd24je2l9I3t2Mn1cIiwgXCJkb3duI3t2Mn1cIilcbiAgICAgIFxuICAgICAgICAgICAgdjEgPSB2MiAjIGN1cnJlbnQgYmVjb21lcyBwcmV2aW91c1xuICBcbiAgICBuZXdwb2x5ID0gZmxhZy50b3BvbHkoKVxuICAgIG5ld3BvbHkubmFtZSA9IFwiSCN7cG9seS5uYW1lfVwiXG4gICAgbmV3cG9seVxuXG4jIFBlcnNwZWN0aXZhIDFcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIGFuIG9wZXJhdGlvbiByZXZlcnNlLWVuZ2luZWVyZWQgZnJvbSBQZXJzcGVjdGl2YSBDb3Jwb3J1bSBSZWd1bGFyaXVtXG5tb2R1bGUuZXhwb3J0cy5wZXJzcGVjdGl2YTEgPSAocG9seSkgLT5cblxuICAgIGNvbnNvbGUubG9nKFwiVGFraW5nIHN0ZWxsYSBvZiAje3BvbHkubmFtZX0uLi5cIilcbiAgXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpICMgY2FsY3VsYXRlIGZhY2UgY2VudGVyc1xuICBcbiAgICBmbGFnID0gbmV3IHBvbHlmbGFnKClcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXVxuICAgICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHBvbHkudmVydGljZXNbaV1cbiAgXG4gICAgIyBpdGVyYXRlIG92ZXIgdHJpcGxldHMgb2YgZmFjZXMgdjEsdjIsdjNcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0yXX1cIlxuICAgICAgICB2MiA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICB2ZXJ0MSA9IHBvbHkudmVydGljZXNbZltmLmxlbmd0aC0yXV1cbiAgICAgICAgdmVydDIgPSBwb2x5LnZlcnRpY2VzW2ZbZi5sZW5ndGgtMV1dXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIHYzID0gXCJ2I3t2fVwiXG4gICAgICAgICAgICB2ZXJ0MyA9IHBvbHkudmVydGljZXNbdl1cbiAgICAgICAgICAgIHYxMiA9IHYxK1wiflwiK3YyICMgbmFtZXMgZm9yIFwib3JpZW50ZWRcIiBtaWRwb2ludHNcbiAgICAgICAgICAgIHYyMSA9IHYyK1wiflwiK3YxXG4gICAgICAgICAgICB2MjMgPSB2MitcIn5cIit2M1xuICAgICAgXG4gICAgICAgICAgICAjIG9uIGVhY2ggTmZhY2UsIE4gbmV3IHBvaW50cyBpbnNldCBmcm9tIGVkZ2UgbWlkcG9pbnRzIHRvd2FyZHMgY2VudGVyID0gXCJzdGVsbGF0ZWRcIiBwb2ludHNcbiAgICAgICAgICAgIGZsYWcubmV3Vih2MTIsIG1pZHBvaW50KCBtaWRwb2ludCh2ZXJ0MSx2ZXJ0MiksIGNlbnRlcnNbaV0gKSlcbiAgICAgIFxuICAgICAgICAgICAgIyBpbnNldCBOZmFjZSBtYWRlIG9mIG5ldywgc3RlbGxhdGVkIHBvaW50c1xuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKFwiaW4je2l9XCIsICAgICAgdjEyLCAgICAgICB2MjMpXG4gICAgICBcbiAgICAgICAgICAgICMgbmV3IHRyaSBmYWNlIGNvbnN0aXR1dGluZyB0aGUgcmVtYWluZGVyIG9mIHRoZSBzdGVsbGF0ZWQgTmZhY2VcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImYje2l9I3t2Mn1cIiwgICAgICB2MjMsICAgICAgdjEyKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKFwiZiN7aX0je3YyfVwiLCAgICAgICB2MTIsICAgICAgdjIpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoXCJmI3tpfSN7djJ9XCIsICAgICAgdjIsICAgICAgdjIzKVxuICAgICAgXG4gICAgICAgICAgICAjIG9uZSBvZiB0aGUgdHdvIG5ldyB0cmlhbmdsZXMgcmVwbGFjaW5nIG9sZCBlZGdlIGJldHdlZW4gdjEtPnYyXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoXCJmI3t2MTJ9XCIsICAgICB2MSwgICAgICAgIHYyMSlcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImYje3YxMn1cIiwgICAgIHYyMSwgICAgICAgdjEyKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKFwiZiN7djEyfVwiLCAgICAgIHYxMiwgICAgICAgdjEpXG4gICAgICBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M107ICAjIGN1cnJlbnQgYmVjb21lcyBwcmV2aW91c1xuICAgICAgICAgICAgW3ZlcnQxLCB2ZXJ0Ml0gPSBbdmVydDIsIHZlcnQzXVxuICBcbiAgICBuZXdwb2x5ID0gZmxhZy50b3BvbHkoKVxuICAgIG5ld3BvbHkubmFtZSA9IFwiUCN7cG9seS5uYW1lfVwiXG4gICAgbmV3cG9seVxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIEdvbGRiZXJnLUNveGV0ZXIgT3BlcmF0b3JzICAoaW4gcHJvZ3Jlc3MuLi4pXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiMgVHJpYW5ndWxhciBTdWJkaXZpc2lvbiBPcGVyYXRvclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIGxpbWl0ZWQgdmVyc2lvbiBvZiB0aGUgR29sZGJlcmctQ294ZXRlciB1X24gb3BlcmF0b3IgZm9yIHRyaWFuZ3VsYXIgbWVzaGVzXG4jIFdlIHN1YmRpdmlkZSBtYW51YWxseSBoZXJlLCBpbnN0ZWFkIG9mIHVzaW5nIHRoZSB1c3VhbCBmbGFnIG1hY2hpbmVyeS5cbm1vZHVsZS5leHBvcnRzLnRyaXN1YiA9IChwb2x5LCBuKSAtPlxuICAgIFxuICAgIGNvbnNvbGUubG9nKFwiVGFraW5nIHRyaXN1YiBvZiAje3BvbHkubmFtZX0uLi5cIilcbiAgICBcbiAgICBuID89IDJcbiAgICBcbiAgICAjIE5vLU9wIGZvciBub24tdHJpYW5ndWxhciBtZXNoZXNcbiAgICBmb3IgZm4gaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgaWYgcG9seS5mYWNlc1tmbl0ubGVuZ3RoICE9IDNcbiAgICAgICAgICAgIHJldHVybiBwb2x5XG4gIFxuICAgICMgQ2FsY3VsYXRlIHJlZHVuZGFudCBzZXQgb2YgbmV3IHZlcnRpY2VzIGZvciBzdWJkaXZpZGVkIG1lc2guXG4gICAgbmV3VnMgPSBbXVxuICAgIHZtYXAgPSB7fVxuICAgIHBvcyA9IDBcbiAgICBmb3IgZm4gaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbZm5dXG4gICAgICAgIFtpMSwgaTIsIGkzXSA9IGYuc2xpY2UgLTNcbiAgICAgICAgdjEgPSBwb2x5LnZlcnRpY2VzW2kxXVxuICAgICAgICB2MiA9IHBvbHkudmVydGljZXNbaTJdXG4gICAgICAgIHYzID0gcG9seS52ZXJ0aWNlc1tpM11cbiAgICAgICAgdjIxID0gc3ViIHYyLCB2MVxuICAgICAgICB2MzEgPSBzdWIgdjMsIHYxXG4gICAgICAgIGZvciBpIGluIFswLi5uXVxuICAgICAgICAgICAgZm9yIGogaW4gWzAuLm4taV1cbiAgICAgICAgICAgICAgICB2ID0gYWRkIGFkZCh2MSwgbXVsdChpICogMS4wIC8gbiwgdjIxKSksIG11bHQoaiAqIDEuMCAvIG4sIHYzMSlcbiAgICAgICAgICAgICAgICB2bWFwW1widiN7Zm59LSN7aX0tI3tqfVwiXSA9IHBvcysrXG4gICAgICAgICAgICAgICAgbmV3VnMucHVzaCB2XG4gIFxuICAgICMgVGhlIGFib3ZlIHZlcnRpY2VzIGFyZSByZWR1bmRhbnQgYWxvbmcgb3JpZ2luYWwgZWRnZXMsIFxuICAgICMgd2UgbmVlZCB0byBidWlsZCBhbiBpbmRleCBtYXAgaW50byBhIHVuaXF1ZWlmaWVkIGxpc3Qgb2YgdGhlbS5cbiAgICAjIFdlIGlkZW50aWZ5IHZlcnRpY2VzIHRoYXQgYXJlIGNsb3NlciB0aGFuIGEgY2VydGFpbiBlcHNpbG9uIGRpc3RhbmNlLlxuICAgIEVQU0lMT05fQ0xPU0UgPSAxLjBlLThcbiAgICB1bmlxVnMgPSBbXVxuICAgIG5ld3BvcyA9IDBcbiAgICB1bmlxbWFwID0ge31cbiAgICBmb3IgW2ksIHZdIGluIG5ld1ZzLmVudHJpZXMoKVxuICAgICAgICBpZiBpIGluIHVuaXFtYXAgdGhlbiBjb250aW51ZSAjIGFscmVhZHkgbWFwcGVkXG4gICAgICAgIHVuaXFtYXBbaV0gPSBuZXdwb3NcbiAgICAgICAgdW5pcVZzLnB1c2ggdlxuICAgICAgICBmb3IgaiBpbiBbaSsxLi4ubmV3VnMubGVuZ3RoXVxuICAgICAgICAgICAgdyA9IG5ld1ZzW2pdXG4gICAgICAgICAgICBpZiBtYWcoc3ViKHYsIHcpKSA8IEVQU0lMT05fQ0xPU0VcbiAgICAgICAgICAgICAgICB1bmlxbWFwW2pdID0gbmV3cG9zXG4gICAgICAgIG5ld3BvcysrXG4gIFxuICAgIGZhY2VzID0gW11cbiAgICBmb3IgZm4gaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZm9yIGkgaW4gWzAuLi5uXVxuICAgICAgICAgICAgZm9yIGogaW4gWzAuLi5uLWldXG4gICAgICAgICAgICAgICAgZmFjZXMucHVzaCBbdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2krMX0tI3tqfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2l9LSN7aisxfVwiXV1dXG4gICAgICAgIGZvciBpIGluIFsxLi4ubl1cbiAgICAgICAgICAgIGZvciBqIGluIFswLi4ubi1pXVxuICAgICAgICAgICAgICAgIGZhY2VzLnB1c2ggW3VuaXFtYXBbdm1hcFtcInYje2ZufS0je2l9LSN7an1cIl1dLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2orMX1cIl1dLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpLTF9LSN7aisxfVwiXV1dXG4gIFxuICAgICMgQ3JlYXRlIG5ldyBwb2x5Z29uIG91dCBvZiBmYWNlcyBhbmQgdW5pcXVlIHZlcnRpY2VzLlxuICAgIG5ld3BvbHkgPSBuZXcgcG9seWhlZHJvbigpXG4gICAgbmV3cG9seS5uYW1lID0gXCJ1I3tufSN7cG9seS5uYW1lfVwiXG4gICAgbmV3cG9seS5mYWNlcyA9IGZhY2VzXG4gICAgbmV3cG9seS52ZXJ0aWNlcyA9IHVuaXFWc1xuICBcbiAgICBuZXdwb2x5XG4iXX0=
//# sourceURL=../../coffee/polyhedronisme/topo.coffee