// koffee 1.6.0
var MAX_FACE_SIDEDNESS, faces, fn, i, j, l, m, midName, newpoly, o, polyflag, q, r, ref, ref1, ref2, ref3, ref4,
    indexOf = [].indexOf;

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
    console.log("Taking dual of " + poly.name + "...");
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
    var EPSILON_CLOSE, f, fn, i, i1, i2, i3, j, l, len, m, newVs, newpos, o, pos, q, r, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, s, uniqVs, uniqmap, v, v1, v2, v21, v3, v31, vmap, w;
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
    }
    return newpos++;
};

faces = [];

for (fn = l = 0, ref = poly.faces.length; 0 <= ref ? l < ref : l > ref; fn = 0 <= ref ? ++l : --l) {
    for (i = m = 0, ref1 = n; 0 <= ref1 ? m < ref1 : m > ref1; i = 0 <= ref1 ? ++m : --m) {
        for (j = o = 0, ref2 = n - i; 0 <= ref2 ? o < ref2 : o > ref2; j = 0 <= ref2 ? ++o : --o) {
            faces.push([uniqmap[vmap["v" + fn + "-" + i + "-" + j]], uniqmap[vmap["v" + fn + "-" + (i + 1) + "-" + j]], uniqmap[vmap["v" + fn + "-" + i + "-" + (j + 1)]]]);
        }
    }
    for (i = q = 1, ref3 = n; 1 <= ref3 ? q < ref3 : q > ref3; i = 1 <= ref3 ? ++q : --q) {
        for (j = r = 0, ref4 = n - i; 0 <= ref4 ? r < ref4 : r > ref4; j = 0 <= ref4 ? ++r : --r) {
            faces.push([uniqmap[vmap["v" + fn + "-" + i + "-" + j]], uniqmap[vmap["v" + fn + "-" + i + "-" + (j + 1)]], uniqmap[vmap["v" + fn + "-" + (i - 1) + "-" + (j + 1)]]]);
        }
    }
}

newpoly = new polyhedron();

newpoly.name = "u" + n + poly.name;

newpoly.faces = faces;

newpoly.vertices = uniqVs;

newpoly;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9wb19vcGVyYXRvcnMuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUEwQkEsSUFBQSwyR0FBQTtJQUFBOztBQUFBLGtCQUFBLEdBQXFCOztBQUVmO0lBRUMsa0JBQUE7UUFDQyxJQUFDLENBQUEsS0FBRCxHQUFZLElBQUksTUFBSixDQUFBO1FBQ1osSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFJLE1BQUosQ0FBQTtRQUNaLElBQUMsQ0FBQSxRQUFELEdBQVksSUFBSSxNQUFKLENBQUE7SUFIYjs7dUJBTUgsSUFBQSxHQUFNLFNBQUMsUUFBRCxFQUFXLFdBQVg7UUFDRixJQUFHLENBQUksSUFBQyxDQUFBLFFBQVMsQ0FBQSxRQUFBLENBQWpCO1lBQ0ksSUFBQyxDQUFBLFFBQVMsQ0FBQSxRQUFBLENBQVYsR0FBc0I7bUJBQ3RCLElBQUMsQ0FBQSxRQUFTLENBQUEsUUFBQSxDQUFWLEdBQXNCLFlBRjFCOztJQURFOzt1QkFLTixPQUFBLEdBQVMsU0FBQyxRQUFELEVBQVcsU0FBWCxFQUFzQixTQUF0QjtBQUNMLFlBQUE7O2dCQUFPLENBQUEsUUFBQTs7Z0JBQUEsQ0FBQSxRQUFBLElBQWE7O2VBQ3BCLElBQUMsQ0FBQSxLQUFNLENBQUEsUUFBQSxDQUFVLENBQUEsU0FBQSxDQUFqQixHQUE4QjtJQUZ6Qjs7dUJBSVQsTUFBQSxHQUFRLFNBQUE7QUFFSixZQUFBO1FBQUEsSUFBQSxHQUFPLElBQUksVUFBSixDQUFlLG9CQUFmO1FBRVAsR0FBQSxHQUFNO0FBQ047QUFBQSxhQUFBLHFDQUFBOztZQUNJLENBQUEsR0FBSSxJQUFDLENBQUEsUUFBUyxDQUFBLENBQUE7WUFDZCxJQUFJLENBQUMsUUFBUyxDQUFBLEdBQUEsQ0FBZCxHQUFtQixJQUFDLENBQUEsUUFBUyxDQUFBLENBQUE7WUFDN0IsSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLENBQVYsR0FBZTtZQUNmLEdBQUE7QUFKSjtRQU1BLEdBQUEsR0FB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LEdBQUksRUFBSixHQUFPLEdBQVAsR0FBVSxDQUFWLEdBQVksR0FBWixHQUFjLENBQUMsQ0FBQSxHQUFFLENBQUgsQ0FBZCxDQUFMLENBRlQsQ0FBWDtBQURKO0FBREo7QUFLQSxTQUFTLCtFQUFUO0FBQ0ksYUFBUyxtRkFBVDtZQUNJLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBQyxPQUFRLENBQUEsSUFBSyxDQUFBLEdBQUEsR0FBSSxFQUFKLEdBQU8sR0FBUCxHQUFVLENBQVYsR0FBWSxHQUFaLEdBQWUsQ0FBZixDQUFMLENBQVQsRUFDQyxPQUFRLENBQUEsSUFBSyxDQUFBLEdBQUEsR0FBSSxFQUFKLEdBQU8sR0FBUCxHQUFVLENBQVYsR0FBWSxHQUFaLEdBQWMsQ0FBQyxDQUFBLEdBQUUsQ0FBSCxDQUFkLENBQUwsQ0FEVCxFQUVDLE9BQVEsQ0FBQSxJQUFLLENBQUEsR0FBQSxHQUFJLEVBQUosR0FBTyxHQUFQLEdBQVMsQ0FBQyxDQUFBLEdBQUUsQ0FBSCxDQUFULEdBQWMsR0FBZCxHQUFnQixDQUFDLENBQUEsR0FBRSxDQUFILENBQWhCLENBQUwsQ0FGVCxDQUFYO0FBREo7QUFESjtBQU5KOztBQWFBLE9BQUEsR0FBVSxJQUFJLFVBQUosQ0FBQTs7QUFDVixPQUFPLENBQUMsSUFBUixHQUFlLEdBQUEsR0FBSSxDQUFKLEdBQVEsSUFBSSxDQUFDOztBQUM1QixPQUFPLENBQUMsS0FBUixHQUFnQjs7QUFDaEIsT0FBTyxDQUFDLFFBQVIsR0FBbUI7O0FBRW5CIiwic291cmNlc0NvbnRlbnQiOlsiIyBQb2x5aMOpZHJvbmlzbWVcbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMgQSB0b3kgZm9yIGNvbnN0cnVjdGluZyBhbmQgbWFuaXB1bGF0aW5nIHBvbHloZWRyYSBhbmQgb3RoZXIgbWVzaGVzXG4jXG4jIEluY2x1ZGVzIGltcGxlbWVudGF0aW9uIG9mIHRoZSBjb253YXkgcG9seWhlZHJhbCBvcGVyYXRvcnMgZGVyaXZlZFxuIyBmcm9tIGNvZGUgYnkgbWF0aGVtYXRpY2lhbiBhbmQgbWF0aGVtYXRpY2FsIHNjdWxwdG9yXG4jIEdlb3JnZSBXLiBIYXJ0IGh0dHA6I3d3dy5nZW9yZ2VoYXJ0LmNvbS9cbiNcbiMgQ29weXJpZ2h0IDIwMTksIEFuc2VsbSBMZXZza2F5YVxuIyBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2VcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBQb2x5aGVkcm9uIEZsYWdzZXQgQ29uc3RydWN0XG4jXG4jIEEgRmxhZyBpcyBhbiBhc3NvY2lhdGl2ZSB0cmlwbGUgb2YgYSBmYWNlIGluZGV4IGFuZCB0d28gYWRqYWNlbnQgdmVydGV4IHZlcnRpZHhzLFxuIyBsaXN0ZWQgaW4gZ2VvbWV0cmljIGNsb2Nrd2lzZSBvcmRlciAoc3RhcmluZyBpbnRvIHRoZSBub3JtYWwpXG4jXG4jIEZhY2VfaSAtPiBWX2kgLT4gVl9qXG4jXG4jIFRoZXkgYXJlIGEgdXNlZnVsIGFic3RyYWN0aW9uIGZvciBkZWZpbmluZyB0b3BvbG9naWNhbCB0cmFuc2Zvcm1hdGlvbnMgb2YgdGhlIHBvbHloZWRyYWwgbWVzaCwgYXNcbiMgb25lIGNhbiByZWZlciB0byB2ZXJ0aWNlcyBhbmQgZmFjZXMgdGhhdCBkb24ndCB5ZXQgZXhpc3Qgb3IgaGF2ZW4ndCBiZWVuIHRyYXZlcnNlZCB5ZXQgaW4gdGhlXG4jIHRyYW5zZm9ybWF0aW9uIGNvZGUuXG4jXG4jIEEgZmxhZyBpcyBzaW1pbGFyIGluIGNvbmNlcHQgdG8gYSBkaXJlY3RlZCBoYWxmZWRnZSBpbiBoYWxmZWRnZSBkYXRhIHN0cnVjdHVyZXMuXG4jXG5NQVhfRkFDRV9TSURFRE5FU1MgPSAxMDAwXG5cbmNsYXNzIHBvbHlmbGFnXG4gICAgXG4gICAgQDogLT5cbiAgICAgICAgQGZsYWdzICAgID0gbmV3IE9iamVjdCgpICMgZmxhZ3NbZmFjZV1bdmVydGV4XSA9IG5leHQgdmVydGV4IG9mIGZsYWc7IHN5bWJvbGljIHRyaXBsZXNcbiAgICAgICAgQHZlcnRpZHhzID0gbmV3IE9iamVjdCgpICMgW3N5bWJvbGljIG5hbWVzXSBob2xkcyB2ZXJ0ZXggaW5kZXhcbiAgICAgICAgQHZlcnRpY2VzID0gbmV3IE9iamVjdCgpICMgWFlaIGNvb3JkaW5hdGVzXG4gIFxuICAgICMgQWRkIGEgbmV3IHZlcnRleCBuYW1lZCBcIm5hbWVcIiB3aXRoIGNvb3JkaW5hdGVzIFwieHl6XCIuXG4gICAgbmV3VjogKHZlcnROYW1lLCBjb29yZGluYXRlcykgLT5cbiAgICAgICAgaWYgbm90IEB2ZXJ0aWR4c1t2ZXJ0TmFtZV1cbiAgICAgICAgICAgIEB2ZXJ0aWR4c1t2ZXJ0TmFtZV0gPSAwXG4gICAgICAgICAgICBAdmVydGljZXNbdmVydE5hbWVdID0gY29vcmRpbmF0ZXNcbiAgXG4gICAgbmV3RmxhZzogKGZhY2VOYW1lLCB2ZXJ0TmFtZTEsIHZlcnROYW1lMikgLT5cbiAgICAgICAgQGZsYWdzW2ZhY2VOYW1lXSA/PSB7fVxuICAgICAgICBAZmxhZ3NbZmFjZU5hbWVdW3ZlcnROYW1lMV0gPSB2ZXJ0TmFtZTJcbiAgXG4gICAgdG9wb2x5OiAtPlxuXG4gICAgICAgIHBvbHkgPSBuZXcgcG9seWhlZHJvbiBcInVua25vd24gcG9seWhlZHJvblwiXG4gICAgXG4gICAgICAgIGN0ciA9IDAgIyBmaXJzdCBudW1iZXIgdGhlIHZlcnRpY2VzXG4gICAgICAgIGZvciBpIGluIEB2ZXJ0aWR4c1xuICAgICAgICAgICAgdiA9IEB2ZXJ0aWR4c1tpXVxuICAgICAgICAgICAgcG9seS52ZXJ0aWNlc1tjdHJdPUB2ZXJ0aWNlc1tpXVxuICAgICAgICAgICAgQHZlcnRpZHhzW2ldID0gY3RyXG4gICAgICAgICAgICBjdHIrK1xuICAgIFxuICAgICAgICBjdHIgPSAwXG4gICAgICAgIGZvciBpIGluIEBmbGFnc1xuXG4gICAgICAgICAgICBmYWNlID0gQGZsYWdzW2ldXG4gICAgICAgICAgICBwb2x5LmZhY2VzW2N0cl0gPSBbXSAjIG5ldyBmYWNlXG4gICAgICAgICAgICAjIGdyYWIgX2FueV8gdmVydGV4IGFzIHN0YXJ0aW5nIHBvaW50XG4gICAgICAgICAgICB2MCA9IGZhY2VbMF1cbiAgICAgICAgICAgICMgYnVpbGQgZmFjZSBvdXQgb2YgYWxsIHRoZSBlZGdlIHJlbGF0aW9ucyBpbiB0aGUgZmxhZyBhc3NvYyBhcnJheVxuICAgICAgICAgICAgdiA9IHYwICMgdiBtb3ZlcyBhcm91bmQgZmFjZVxuICAgICAgICAgICAgcG9seS5mYWNlc1tjdHJdLnB1c2ggQHZlcnRpZHhzW3ZdICNyZWNvcmQgaW5kZXhcbiAgICAgICAgICAgIHYgPSBAZmxhZ3NbaV1bdl0gIyBnb3RvIG5leHQgdmVydGV4XG4gICAgICAgICAgICBmYWNlQ1RSID0gMFxuICAgICAgICAgICAgd2hpbGUgdiAhPSB2MCAjIGxvb3AgdW50aWwgYmFjayB0byBzdGFydFxuICAgICAgICAgICAgICAgIHBvbHkuZmFjZXNbY3RyXS5wdXNoIEB2ZXJ0aWR4c1t2XVxuICAgICAgICAgICAgICAgIHYgPSBAZmxhZ3NbaV1bdl1cbiAgICAgICAgICAgICAgICBmYWNlQ1RSKytcbiAgICAgICAgICAgICAgICAjIG5lY2Vzc2FyeSBkdXJpbmcgZGV2ZWxvcG1lbnQgdG8gcHJldmVudCBicm93c2VyIGhhbmdzIG9uIGJhZGx5IGZvcm1lZCBmbGFnc2V0c1xuICAgICAgICAgICAgICAgIGlmIGZhY2VDVFIgPiBNQVhfRkFDRV9TSURFRE5FU1NcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cgXCJCYWQgZmxhZyBzcGVjLCBoYXZlIGEgbmV2ZXJlbmRpbmcgZmFjZTpcIiwgaSwgQGZsYWdzW2ldXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBjdHIrK1xuICAgICAgICBwb2x5XG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgUG9seWhlZHJvbiBPcGVyYXRvcnNcbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMgZm9yIGVhY2ggdmVydGV4IG9mIG5ldyBwb2x5aGVkcm9uOlxuIyAgICAgY2FsbCBuZXdWKFZuYW1lLCB4eXopIHdpdGggYSBzeW1ib2xpYyBuYW1lIGFuZCBjb29yZGluYXRlc1xuIyBmb3IgZWFjaCBmbGFnIG9mIG5ldyBwb2x5aGVkcm9uOlxuIyAgICAgY2FsbCBuZXdGbGFnKEZuYW1lLCBWbmFtZTEsIFZuYW1lMikgd2l0aCBhIHN5bWJvbGljIG5hbWUgZm9yIHRoZSBuZXcgZmFjZVxuIyAgICAgYW5kIHRoZSBzeW1ib2xpYyBuYW1lIGZvciB0d28gdmVydGljZXMgZm9ybWluZyBhbiBvcmllbnRlZCBlZGdlXG4jIE9SSUVOVEFUSU9OIC1tdXN0LSBiZSBkZWFsdCB3aXRoIHByb3Blcmx5IHRvIG1ha2UgYSBtYW5pZm9sZCAoY29ycmVjdCkgbWVzaC5cbiMgU3BlY2lmaWNhbGx5LCBubyBlZGdlIHYxLT52MiBjYW4gZXZlciBiZSBjcm9zc2VkIGluIHRoZSAtc2FtZSBkaXJlY3Rpb24tIGJ5XG4jIHR3byBkaWZmZXJlbnQgZmFjZXNcbiMgXG4jIGNhbGwgdG9wb2x5KCkgdG8gYXNzZW1ibGUgZmxhZ3MgaW50byBwb2x5aGVkcm9uIHN0cnVjdHVyZSBieSBmb2xsb3dpbmcgdGhlIG9yYml0c1xuIyBvZiB0aGUgdmVydGV4IG1hcHBpbmcgc3RvcmVkIGluIHRoZSBmbGFnc2V0IGZvciBlYWNoIG5ldyBmYWNlXG4jIFxuIyBzZXQgbmFtZSBhcyBhcHByb3ByaWF0ZVxuXG5taWROYW1lID0gKHYxLCB2MikgLT4gdjE8djIgYW5kIFwiI3t2MX1fI3t2Mn1cIiBvciBcIiN7djJ9XyN7djF9XCIgIyB1bmlxdWUgbmFtZXMgb2YgbWlkcG9pbnRzXG5cbiMgS2lzKE4pXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBLaXMgKGFiYnJldmlhdGVkIGZyb20gdHJpYWtpcykgdHJhbnNmb3JtcyBhbiBOLXNpZGVkIGZhY2UgaW50byBhbiBOLXB5cmFtaWQgcm9vdGVkIGF0IHRoZVxuIyBzYW1lIGJhc2UgdmVydGljZXMuIG9ubHkga2lzIG4tc2lkZWQgZmFjZXMsIGJ1dCBuPT0wIG1lYW5zIGtpcyBhbGwuXG5cbm1vZHVsZS5leHBvcnRzLmtpc04gPSAocG9seSwgbiwgYXBleGRpc3QpIC0+XG5cbiAgICBuID89IDBcbiAgICBhcGV4ZGlzdCA/PSAwLjFcblxuICAgIGNvbnNvbGUubG9nIFwiVGFraW5nIGtpcyBvZiAje259LXNpZGVkIGZhY2VzIG9mICN7cG9seS5uYW1lfS4uLlwiXG5cbiAgICBmbGFnID0gbmV3IHBvbHlmbGFnKClcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXVxuICAgICAgICAjIGVhY2ggb2xkIHZlcnRleCBpcyBhIG5ldyB2ZXJ0ZXhcbiAgICAgICAgcCA9IHBvbHkudmVydGljZXNbaV1cbiAgICAgICAgZmxhZy5uZXdWIFwidiN7aX1cIiBwXG4gIFxuICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIGZvdW5kQW55ID0gZmFsc2VcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MiA9IFwidiN7dn1cIlxuICAgICAgICAgICAgaWYgZi5sZW5ndGggPT0gbiBvciBuID09IDBcbiAgICAgICAgICAgICAgICBmb3VuZEFueSA9IHRydWU7XG4gICAgICAgICAgICAgICAgYXBleCA9IFwiYXBleCN7aX1cIlxuICAgICAgICAgICAgICAgIGZuYW1lID0gXCIje2l9I3t2MX1cIlxuICAgICAgICAgICAgICAgICMgbmV3IHZlcnRpY2VzIGluIGNlbnRlcnMgb2Ygbi1zaWRlZCBmYWNlXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdWIGFwZXgsIGFkZCBjZW50ZXJzW2ldLCBtdWx0IGFwZXhkaXN0LCBub3JtYWxzW2ldXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnIGZuYW1lLCAgIHYxLCAgIHYyICMgdGhlIG9sZCBlZGdlIG9mIG9yaWdpbmFsIGZhY2VcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsICAgdjIsIGFwZXggIyB1cCB0byBhcGV4IG9mIHB5cmFtaWRcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcgZm5hbWUsIGFwZXgsICAgdjEgIyBhbmQgYmFjayBkb3duIGFnYWluXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwiI3tpfVwiLCB2MSwgdjIgICMgc2FtZSBvbGQgZmxhZywgaWYgbm9uLW5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdjEgPSB2MiAjIGN1cnJlbnQgYmVjb21lcyBwcmV2aW91c1xuICBcbiAgICBpZiBub3QgZm91bmRBbnlcbiAgICAgICAgY29uc29sZS5sb2cgXCJObyAje259LWZvbGQgY29tcG9uZW50cyB3ZXJlIGZvdW5kLlwiXG4gIFxuICAgIG5ld3BvbHkgPSBmbGFnLnRvcG9seSgpXG4gICAgbmV3cG9seS5uYW1lID0gXCJrI3tufSN7cG9seS5uYW1lfVwiXG4gICAgcmV0dXJuIG5ld3BvbHlcblxuIyBBbWJvXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBUaGUgYmVzdCB3YXkgdG8gdGhpbmsgb2YgdGhlIGFtYm8gb3BlcmF0b3IgaXMgYXMgYSB0b3BvbG9naWNhbCBcInR3ZWVuXCIgYmV0d2VlbiBhIHBvbHloZWRyb25cbiMgYW5kIGl0cyBkdWFsIHBvbHloZWRyb24uICBUaHVzIHRoZSBhbWJvIG9mIGEgZHVhbCBwb2x5aGVkcm9uIGlzIHRoZSBzYW1lIGFzIHRoZSBhbWJvIG9mIHRoZVxuIyBvcmlnaW5hbC4gQWxzbyBjYWxsZWQgXCJSZWN0aWZ5XCIuXG5cbm1vZHVsZS5leHBvcnRzLmFtYm8gPSAocG9seSkgLT5cbiAgICBjb25zb2xlLmxvZyBcIlRha2luZyBhbWJvIG9mICN7cG9seS5uYW1lfS4uLlwiXG4gICAgZmxhZyA9IG5ldyBwb2x5ZmxhZygpXG4gIFxuICAgICMgRm9yIGVhY2ggZmFjZSBmIGluIHRoZSBvcmlnaW5hbCBwb2x5XG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlKC0yKVxuICAgICAgICBmb3IgdjMgaW4gZlxuICAgICAgICAgICAgaWYgdjEgPCB2MiAjIHZlcnRpY2VzIGFyZSB0aGUgbWlkcG9pbnRzIG9mIGFsbCBlZGdlcyBvZiBvcmlnaW5hbCBwb2x5XG4gICAgICAgICAgICAgICAgZmxhZy5uZXdWIG1pZE5hbWUodjEsdjIpLCBtaWRwb2ludCBwb2x5LnZlcnRpY2VzW3YxXSwgcG9seS52ZXJ0aWNlc1t2Ml1cbiAgICAgICAgICAgICMgZmFjZSBjb3JyZXNwb25kcyB0byB0aGUgb3JpZ2luYWwgZlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIFwib3JpZyN7aX1cIiAgbWlkTmFtZSh2MSx2MiksIG1pZE5hbWUodjIsdjMpXG4gICAgICAgICAgICAjIGZhY2UgY29ycmVzcG9uZHMgdG8gKHRoZSB0cnVuY2F0ZWQpIHYyXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcgXCJkdWFsI3t2Mn1cIiBtaWROYW1lKHYyLHYzKSwgbWlkTmFtZSh2MSx2MilcbiAgICAgICAgICAgICMgc2hpZnQgb3ZlciBvbmVcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M11cbiAgXG4gICAgbmV3cG9seSA9IGZsYWcudG9wb2x5KClcbiAgICBuZXdwb2x5Lm5hbWUgPSBcImEje3BvbHkubmFtZX1cIlxuICAgIG5ld3BvbHlcblxuIyBHeXJvXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgVGhpcyBpcyB0aGUgZHVhbCBvcGVyYXRvciB0byBcInNudWJcIiwgaS5lIGR1YWwqR3lybyA9IFNudWIuICBJdCBpcyBhIGJpdCBlYXNpZXIgdG8gaW1wbGVtZW50XG4jIHRoaXMgd2F5LlxuI1xuIyBTbnViIGNyZWF0ZXMgYXQgZWFjaCB2ZXJ0ZXggYSBuZXcgZmFjZSwgZXhwYW5kcyBhbmQgdHdpc3RzIGl0LCBhbmQgYWRkcyB0d28gbmV3IHRyaWFuZ2xlcyB0b1xuIyByZXBsYWNlIGVhY2ggZWRnZS5cblxubW9kdWxlLmV4cG9ydHMuZ3lybyA9IChwb2x5KSAtPlxuXG4gICAgY29uc29sZS5sb2cgXCJUYWtpbmcgZ3lybyBvZiAje3BvbHkubmFtZX0uLi5cIlxuICBcbiAgICBmbGFnID0gbmV3IHBvbHlmbGFnKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgZmxhZy5uZXdWIFwidiN7aX1cIiB1bml0IHBvbHkudmVydGljZXNbaV0gIyBlYWNoIG9sZCB2ZXJ0ZXggaXMgYSBuZXcgdmVydGV4XG5cbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKCkgIyBuZXcgdmVydGljZXMgaW4gY2VudGVyIG9mIGVhY2ggZmFjZVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIGZsYWcubmV3VihcImNlbnRlciN7aX1cIiwgdW5pdChjZW50ZXJzW2ldKSlcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlKC0yKVxuICAgICAgICBmb3IgaiBpbiBbMC4uLmYubGVuZ3RoXVxuICAgICAgICAgICAgdiA9IGZbal1cbiAgICAgICAgICAgIHYzID0gdlxuICAgICAgICAgICAgZmxhZy5uZXdWKHYxK1wiflwiK3YyLCBvbmVUaGlyZChwb2x5LnZlcnRpY2VzW3YxXSxwb2x5LnZlcnRpY2VzW3YyXSkpOyAgIyBuZXcgdiBpbiBmYWNlXG4gICAgICAgICAgICBmbmFtZSA9IGkrXCJmXCIrdjFcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgXCJjZW50ZXIje2l9XCIsICAgICAgdjErXCJ+XCIrdjIpICMgZml2ZSBuZXcgZmxhZ3NcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgdjErXCJ+XCIrdjIsICB2MitcIn5cIit2MSlcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgdjIrXCJ+XCIrdjEsICBcInYje3YyfVwiKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCBcInYje3YyfVwiLCAgICAgdjIrXCJ+XCIrdjMpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsIHYyK1wiflwiK3YzLCAgXCJjZW50ZXIje2l9XCIpXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdOyAjIHNoaWZ0IG92ZXIgb25lXG4gIFxuICAgIG5ld3BvbHkgPSBmbGFnLnRvcG9seSgpXG4gICAgbmV3cG9seS5uYW1lID0gXCJnI3twb2x5Lm5hbWV9XCJcbiAgICBuZXdwb2x5XG5cbiMgUHJvcGVsbG9yXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBidWlsZHMgYSBuZXcgJ3NrZXcgZmFjZScgYnkgbWFraW5nIG5ldyBwb2ludHMgYWxvbmcgZWRnZXMsIDEvM3JkIHRoZSBkaXN0YW5jZSBmcm9tIHYxLT52MixcbiMgdGhlbiBjb25uZWN0aW5nIHRoZXNlIGludG8gYSBuZXcgaW5zZXQgZmFjZS4gIFRoaXMgYnJlYWtzIHJvdGF0aW9uYWwgc3ltbWV0cnkgYWJvdXQgdGhlXG4jIGZhY2VzLCB3aGlybGluZyB0aGVtIGludG8gZ3lyZXNcbiNcbm1vZHVsZS5leHBvcnRzLnByb3BlbGxvciA9IChwb2x5KSAtPlxuXG4gICAgY29uc29sZS5sb2cgXCJUYWtpbmcgcHJvcGVsbG9yIG9mICN7cG9seS5uYW1lfS4uLlwiXG4gIFxuICAgIGZsYWcgPSBuZXcgcG9seWZsYWcoKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXSAjIGVhY2ggb2xkIHZlcnRleCBpcyBhIG5ldyB2ZXJ0ZXhcbiAgICAgICAgZmxhZy5uZXdWIFwidiN7aX1cIiB1bml0IHBvbHkudmVydGljZXNbaV1cbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlKC0yKVxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MyA9IFwiI3t2fVwiXG4gICAgICAgICAgICBmbGFnLm5ld1YodjErXCJ+XCIrdjIsIG9uZVRoaXJkKHBvbHkudmVydGljZXNbdjFdLCBwb2x5LnZlcnRpY2VzW3YyXSkpOyAgIyBuZXcgdiBpbiBmYWNlLCAxLzNyZCBhbG9uZyBlZGdlXG4gICAgICAgICAgICBmbmFtZSA9IFwiI3tpfWYje3YyfVwiO1xuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKFwidiN7aX1cIiwgdjErXCJ+XCIrdjIsICB2MitcIn5cIit2Myk7ICMgZml2ZSBuZXcgZmxhZ3NcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgICB2MStcIn5cIit2MiwgIHYyK1wiflwiK3YxKTtcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgICB2MitcIn5cIit2MSwgICAgIFwidiN7djJ9XCIpO1xuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCAgICAgIFwidiN7djJ9XCIsICB2MitcIn5cIit2Myk7XG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsICAgdjIrXCJ+XCIrdjMsICB2MStcIn5cIit2Mik7XG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gICAgXG4gICAgbmV3cG9seSA9IGZsYWcudG9wb2x5KClcbiAgICBuZXdwb2x5Lm5hbWUgPSBcInAje3BvbHkubmFtZX1cIlxuICAgIG5ld3BvbHlcblxuIyBSZWZsZWN0aW9uXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBnZW9tZXRyaWMgcmVmbGVjdGlvbiB0aHJvdWdoIG9yaWdpblxubW9kdWxlLmV4cG9ydHMucmVmbGVjdCA9IChwb2x5KSAtPlxuXG4gICAgY29uc29sZS5sb2cgXCJUYWtpbmcgcmVmbGVjdGlvbiBvZiAje3BvbHkubmFtZX0uLi5cIlxuICAgICMgcmVmbGVjdCBlYWNoIHBvaW50IHRocm91Z2ggb3JpZ2luXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgcG9seS52ZXJ0aWNlc1tpXSA9IG11bHQgLTEsIHBvbHkudmVydGljZXNbaV1cbiAgICAjIHJlcGFpciBjbG9ja3dpc2UtbmVzcyBvZiBmYWNlc1xuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIHBvbHkuZmFjZXNbaV0gPSBwb2x5LmZhY2VzW2ldLnJldmVyc2UoKVxuICAgIHBvbHkubmFtZSA9IFwiciN7cG9seS5uYW1lfVwiXG4gICAgcG9seVxuXG4jIER1YWxcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIFRoZSBkdWFsIG9mIGEgcG9seWhlZHJvbiBpcyBhbm90aGVyIG1lc2ggd2hlcmVpbjpcbiMgLSBldmVyeSBmYWNlIGluIHRoZSBvcmlnaW5hbCBiZWNvbWVzIGEgdmVydGV4IGluIHRoZSBkdWFsXG4jIC0gZXZlcnkgdmVydGV4IGluIHRoZSBvcmlnaW5hbCBiZWNvbWVzIGEgZmFjZSBpbiB0aGUgZHVhbFxuI1xuIyBTbyBOX2ZhY2VzLCBOX3ZlcnRpY2VzID0gTl9kdWFsZmFjZXMsIE5fZHVhbHZlcnRpY2VzXG4jXG4jIFRoZSBuZXcgdmVydGV4IGNvb3JkaW5hdGVzIGFyZSBjb252ZW5pZW50IHRvIHNldCB0byB0aGUgb3JpZ2luYWwgZmFjZSBjZW50cm9pZHMuXG4jXG5tb2R1bGUuZXhwb3J0cy5kdWFsID0gKHBvbHkpIC0+XG5cbiAgICBjb25zb2xlLmxvZyBcIlRha2luZyBkdWFsIG9mICN7cG9seS5uYW1lfS4uLlwiXG4gIFxuICAgIGZsYWcgPSBuZXcgcG9seWZsYWcoKVxuICBcbiAgICBmYWNlID0gW10gIyBtYWtlIHRhYmxlIG9mIGZhY2UgYXMgZm4gb2YgZWRnZVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdICMgY3JlYXRlIGVtcHR5IGFzc29jaWF0aXZlIHRhYmxlXG4gICAgICAgIGZhY2VbaV0gPSB7fVxuXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgdjEgPSBmW2YubGVuZ3RoLTFdICNwcmV2aW91cyB2ZXJ0ZXhcbiAgICAgICAgZm9yIHYyIGluIGZcbiAgICAgICAgICAgICMgVEhJUyBBU1NVTUVTIHRoYXQgbm8gMiBmYWNlcyB0aGF0IHNoYXJlIGFuIGVkZ2Ugc2hhcmUgaXQgaW4gdGhlIHNhbWUgb3JpZW50YXRpb24hXG4gICAgICAgICAgICAjIHdoaWNoIG9mIGNvdXJzZSBuZXZlciBoYXBwZW5zIGZvciBwcm9wZXIgbWFuaWZvbGQgbWVzaGVzLCBzbyBnZXQgeW91ciBtZXNoZXMgcmlnaHQuXG4gICAgICAgICAgICBmYWNlW3YxXVtcInYje3YyfVwiXSA9IFwiI3tpfVwiXG4gICAgICAgICAgICB2MT12MiAjIGN1cnJlbnQgYmVjb21lcyBwcmV2aW91c1xuICBcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmbGFnLm5ld1YgXCIje2l9XCIgY2VudGVyc1tpXVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICB2MSA9IGZbZi5sZW5ndGgtMV0gI3ByZXZpb3VzIHZlcnRleFxuICAgICAgICBmb3IgdjIgaW4gZlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnIHYxLCBmYWNlW3YyXVtcInYje3YxfVwiXSwgXCIje2l9XCJcbiAgICAgICAgICAgIHYxPXYyICMgY3VycmVudCBiZWNvbWVzIHByZXZpb3VzXG4gIFxuICAgIGRwb2x5ID0gZmxhZy50b3BvbHkoKSAjIGJ1aWxkIHRvcG9sb2dpY2FsIGR1YWwgZnJvbSBmbGFnc1xuICBcbiAgICAjIG1hdGNoIEYgaW5kZXggb3JkZXJpbmcgdG8gViBpbmRleCBvcmRlcmluZyBvbiBkdWFsXG4gICAgc29ydEYgPSBbXVxuICAgIGZvciBmIGluIGRwb2x5LmZhY2VzXG4gICAgICAgIGsgPSBpbnRlcnNlY3QgcG9seS5mYWNlc1tmWzBdXSwgcG9seS5mYWNlc1tmWzFdXSwgcG9seS5mYWNlc1tmWzJdXVxuICAgICAgICBzb3J0RltrXSA9IGZcbiAgICBkcG9seS5mYWNlcyA9IHNvcnRGXG4gIFxuICAgIGlmIHBvbHkubmFtZVswXSAhPSBcImRcIlxuICAgICAgICBkcG9seS5uYW1lID0gXCJkI3twb2x5Lm5hbWV9XCJcbiAgICBlbHNlIFxuICAgICAgICBkcG9seS5uYW1lID0gcG9seS5uYW1lLnNsaWNlKDEpXG4gIFxuICAgIGRwb2x5XG5cbiMgQ2hhbWZlclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEEgdHJ1bmNhdGlvbiBhbG9uZyBhIHBvbHloZWRyb24ncyBlZGdlcy5cbiMgQ2hhbWZlcmluZyBvciBlZGdlLXRydW5jYXRpb24gaXMgc2ltaWxhciB0byBleHBhbnNpb24sIG1vdmluZyBmYWNlcyBhcGFydCBhbmQgb3V0d2FyZCxcbiMgYnV0IGFsc28gbWFpbnRhaW5zIHRoZSBvcmlnaW5hbCB2ZXJ0aWNlcy4gQWRkcyBhIG5ldyBoZXhhZ29uYWwgZmFjZSBpbiBwbGFjZSBvZiBlYWNoXG4jIG9yaWdpbmFsIGVkZ2UuXG4jIEEgcG9seWhlZHJvbiB3aXRoIGUgZWRnZXMgd2lsbCBoYXZlIGEgY2hhbWZlcmVkIGZvcm0gY29udGFpbmluZyAyZSBuZXcgdmVydGljZXMsXG4jIDNlIG5ldyBlZGdlcywgYW5kIGUgbmV3IGhleGFnb25hbCBmYWNlcy4gLS0gV2lraXBlZGlhXG4jIFNlZSBhbHNvIGh0dHA6I2RtY2Nvb2V5LmNvbS9wb2x5aGVkcmEvQ2hhbWZlci5odG1sXG4jXG4jIFRoZSBkaXN0IHBhcmFtZXRlciBjb3VsZCBjb250cm9sIGhvdyBkZWVwbHkgdG8gY2hhbWZlci5cbiMgQnV0IEknbSBub3Qgc3VyZSBhYm91dCBpbXBsZW1lbnRpbmcgdGhhdCB5ZXQuXG4jXG4jIFE6IHdoYXQgaXMgdGhlIGR1YWwgb3BlcmF0aW9uIG9mIGNoYW1mZXJpbmc/IEkuZS5cbiMgaWYgY1ggPSBkeGRYLCBhbmQgeFggPSBkY2RYLCB3aGF0IG9wZXJhdGlvbiBpcyB4P1xuXG4jIFdlIGNvdWxkIFwiYWxtb3N0XCIgZG8gdGhpcyBpbiB0ZXJtcyBvZiBhbHJlYWR5LWltcGxlbWVudGVkIG9wZXJhdGlvbnM6XG4jIGNDID0gdDRkYUMgPSB0NGpDLCBjTyA9IHQzZGFPLCBjRCA9IHQ1ZGFELCBjSSA9IHQzZGFJXG4jIEJ1dCBpdCBkb2Vzbid0IHdvcmsgZm9yIGNhc2VzIGxpa2UgVC5cblxubW9kdWxlLmV4cG9ydHMuY2hhbWZlciA9IChwb2x5LCBkaXN0KSAtPlxuICAgIGNvbnNvbGUubG9nIFwiVGFraW5nIGNoYW1mZXIgb2YgI3twb2x5Lm5hbWV9Li4uXCJcbiAgXG4gICAgZGlzdCA/PSAwLjVcbiAgXG4gICAgZmxhZyA9IG5ldyBwb2x5ZmxhZygpXG4gIFxuICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICBcbiAgICAjIEZvciBlYWNoIGZhY2UgZiBpbiB0aGUgb3JpZ2luYWwgcG9seVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gZltmLmxlbmd0aC0xXVxuICAgICAgICB2MW5ldyA9IGkgKyBcIl9cIiArIHYxXG4gICAgXG4gICAgICAgIGZvciB2MiBpbiBmXG4gICAgICAgICAgIyBUT0RPOiBmaWd1cmUgb3V0IHdoYXQgZGlzdGFuY2VzIHdpbGwgZ2l2ZSB1cyBhIHBsYW5hciBoZXggZmFjZS5cbiAgICAgICAgICAjIE1vdmUgZWFjaCBvbGQgdmVydGV4IGZ1cnRoZXIgZnJvbSB0aGUgb3JpZ2luLlxuICAgICAgICAgIGZsYWcubmV3Vih2MiwgbXVsdCgxLjAgKyBkaXN0LCBwb2x5LnZlcnRpY2VzW3YyXSkpXG4gICAgICAgICAgIyBBZGQgYSBuZXcgdmVydGV4LCBtb3ZlZCBwYXJhbGxlbCB0byBub3JtYWwuXG4gICAgICAgICAgdjJuZXcgPSBpICsgXCJfXCIgKyB2MlxuICAgICAgICAgIGZsYWcubmV3Vih2Mm5ldywgYWRkKHBvbHkudmVydGljZXNbdjJdLCBtdWx0KGRpc3QqMS41LCBub3JtYWxzW2ldKSkpXG4gICAgICAgICAgIyBGb3VyIG5ldyBmbGFnczpcbiAgICAgICAgICAjIE9uZSB3aG9zZSBmYWNlIGNvcnJlc3BvbmRzIHRvIHRoZSBvcmlnaW5hbCBmYWNlOlxuICAgICAgICAgIGZsYWcubmV3RmxhZyhcIm9yaWcje2l9XCIsIHYxbmV3LCB2Mm5ldylcbiAgICAgICAgICAjIEFuZCB0aHJlZSBmb3IgdGhlIGVkZ2VzIG9mIHRoZSBuZXcgaGV4YWdvbjpcbiAgICAgICAgICBmYWNlbmFtZSA9ICh2MTx2MiA/IFwiaGV4I3t2MX1fI3t2Mn1cIiA6IFwiaGV4I3t2Mn1fI3t2MX1cIilcbiAgICAgICAgICBmbGFnLm5ld0ZsYWcoZmFjZW5hbWUsIHYyLCB2Mm5ldylcbiAgICAgICAgICBmbGFnLm5ld0ZsYWcoZmFjZW5hbWUsIHYybmV3LCB2MW5ldylcbiAgICAgICAgICBmbGFnLm5ld0ZsYWcoZmFjZW5hbWUsIHYxbmV3LCB2MSlcbiAgICAgICAgICB2MSA9IHYyO1xuICAgICAgICAgIHYxbmV3ID0gdjJuZXdcblxuICAgIG5ld3BvbHkgPSBmbGFnLnRvcG9seSgpXG4gICAgbmV3cG9seS5uYW1lID0gXCJjI3twb2x5Lm5hbWV9XCJcbiAgICBuZXdwb2x5XG5cbiMgV2hpcmxcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBHeXJvIGZvbGxvd2VkIGJ5IHRydW5jYXRpb24gb2YgdmVydGljZXMgY2VudGVyZWQgb24gb3JpZ2luYWwgZmFjZXMuXG4jIFRoaXMgY3JlYXRlIDIgbmV3IGhleGFnb25zIGZvciBldmVyeSBvcmlnaW5hbCBlZGdlLlxuIyAoaHR0cHM6I2VuLndpa2lwZWRpYS5vcmcvd2lraS9Db253YXlfcG9seWhlZHJvbl9ub3RhdGlvbiNPcGVyYXRpb25zX29uX3BvbHloZWRyYSlcbiNcbiMgUG9zc2libGUgZXh0ZW5zaW9uOiB0YWtlIGEgcGFyYW1ldGVyIG4gdGhhdCBtZWFucyBvbmx5IHdoaXJsIG4tc2lkZWQgZmFjZXMuXG4jIElmIHdlIGRvIHRoYXQsIHRoZSBmbGFncyBtYXJrZWQgIyogYmVsb3cgd2lsbCBuZWVkIHRvIGhhdmUgdGhlaXIgb3RoZXIgc2lkZXNcbiMgZmlsbGVkIGluIG9uZSB3YXkgb3IgYW5vdGhlciwgZGVwZW5kaW5nIG9uIHdoZXRoZXIgdGhlIGFkamFjZW50IGZhY2UgaXNcbiMgd2hpcmxlZCBvciBub3QuXG5cbm1vZHVsZS5leHBvcnRzLndoaXJsID0gKHBvbHksIG4pIC0+XG5cbiAgICBjb25zb2xlLmxvZyBcIlRha2luZyB3aGlybCBvZiAje3BvbHkubmFtZX0uLi5cIlxuICAgIG4gPz0gMFxuICAgIFxuICAgIGZsYWcgPSBuZXcgcG9seWZsYWcoKVxuICBcbiAgICAjIGVhY2ggb2xkIHZlcnRleCBpcyBhIG5ldyB2ZXJ0ZXhcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXVxuICAgICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHVuaXQgcG9seS52ZXJ0aWNlc1tpXVxuXG4gICAgIyBuZXcgdmVydGljZXMgYXJvdW5kIGNlbnRlciBvZiBlYWNoIGZhY2VcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlKC0yKVxuICAgICAgICBmb3IgaiBpbiBbMC4uLmYubGVuZ3RoXVxuICAgICAgICAgICAgdiA9IGZbal1cbiAgICAgICAgICAgIHYzID0gdlxuICAgICAgICAgICAgIyBOZXcgdmVydGV4IGFsb25nIGVkZ2VcbiAgICAgICAgICAgIHYxXzIgPSBvbmVUaGlyZChwb2x5LnZlcnRpY2VzW3YxXSxwb2x5LnZlcnRpY2VzW3YyXSlcbiAgICAgICAgICAgIGZsYWcubmV3Vih2MStcIn5cIit2MiwgdjFfMilcbiAgICAgICAgICAgICMgTmV3IHZlcnRpY2VzIG5lYXIgY2VudGVyIG9mIGZhY2VcbiAgICAgICAgICAgIGN2MW5hbWUgPSBcImNlbnRlciN7aX1+I3t2MX1cIlxuICAgICAgICAgICAgY3YybmFtZSA9IFwiY2VudGVyI3tpfX4je3YyfVwiXG4gICAgICAgICAgICBmbGFnLm5ld1YoY3YxbmFtZSwgdW5pdChvbmVUaGlyZChjZW50ZXJzW2ldLCB2MV8yKSkpXG4gICAgICAgICAgICBmbmFtZSA9IGkrXCJmXCIrdjFcbiAgICAgICAgICAgICMgTmV3IGhleGFnb24gZm9yIGVhY2ggb3JpZ2luYWwgZWRnZVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCBjdjFuYW1lLCAgIHYxK1wiflwiK3YyKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCB2MStcIn5cIit2MiwgdjIrXCJ+XCIrdjEpICMqXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsIHYyK1wiflwiK3YxLCBcInYje3YyfVwiKSAgIypcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgXCJ2I3t2Mn1cIiwgIHYyK1wiflwiK3YzKSAjKlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCB2MitcIn5cIit2MywgY3YybmFtZSlcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgY3YybmFtZSwgICBjdjFuYW1lKVxuICAgICAgICAgICAgIyBOZXcgZmFjZSBpbiBjZW50ZXIgb2YgZWFjaCBvbGQgZmFjZSAgICAgIFxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKFwiYyN7aX1cIiwgY3YxbmFtZSwgY3YybmFtZSlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXSAjIHNoaWZ0IG92ZXIgb25lXG4gIFxuICAgIG5ld3BvbHkgPSBmbGFnLnRvcG9seSgpXG4gICAgbmV3cG9seS5uYW1lID0gXCJ3I3twb2x5Lm5hbWV9XCJcbiAgICBuZXdwb2x5XG5cbiMgUXVpbnRvXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgVGhpcyBjcmVhdGVzIGEgcGVudGFnb24gZm9yIGV2ZXJ5IHBvaW50IGluIHRoZSBvcmlnaW5hbCBmYWNlLCBhcyB3ZWxsIGFzIG9uZSBuZXcgaW5zZXQgZmFjZS5cbm1vZHVsZS5leHBvcnRzLnF1aW50byA9IChwb2x5KSAtPlxuICAgIFxuICAgIGNvbnNvbGUubG9nKFwiVGFraW5nIHF1aW50byBvZiAje3BvbHkubmFtZX0uLi5cIilcbiAgICBmbGFnID0gbmV3IHBvbHlmbGFnKClcbiAgXG4gICAgIyBGb3IgZWFjaCBmYWNlIGYgaW4gdGhlIG9yaWdpbmFsIHBvbHlcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBjZW50cm9pZCA9IGNhbGNDZW50cm9pZCBmLm1hcCAoaWR4KSAtPiBwb2x5LnZlcnRpY2VzW2lkeF1cbiAgICAgICAgIyB3YWxrIG92ZXIgZmFjZSB2ZXJ0ZXgtdHJpcGxldHNcbiAgICAgICAgW3YxLCB2Ml0gPSBmLnNsaWNlKC0yKVxuICAgICAgICBmb3IgdjMgaW4gZlxuICAgICAgICAgICAgIyBmb3IgZWFjaCBmYWNlLWNvcm5lciwgd2UgbWFrZSB0d28gbmV3IHBvaW50czpcbiAgICAgICAgICAgIG1pZHB0ID0gbWlkcG9pbnQocG9seS52ZXJ0aWNlc1t2MV0sIHBvbHkudmVydGljZXNbdjJdKVxuICAgICAgICAgICAgaW5uZXJwdCA9IG1pZHBvaW50KG1pZHB0LCBjZW50cm9pZClcbiAgICAgICAgICAgIGZsYWcubmV3VihtaWROYW1lKHYxLHYyKSwgbWlkcHQpXG4gICAgICAgICAgICBmbGFnLm5ld1YoXCJpbm5lcl8je2l9X1wiICsgbWlkTmFtZSh2MSx2MiksIGlubmVycHQpXG4gICAgICAgICAgICAjIGFuZCBhZGQgdGhlIG9sZCBjb3JuZXItdmVydGV4XG4gICAgICAgICAgICBmbGFnLm5ld1YoXCIje3YyfVwiLCBwb2x5LnZlcnRpY2VzW3YyXSlcbiAgICAgICAgICBcbiAgICAgICAgICAgICMgcGVudGFnb24gZm9yIGVhY2ggdmVydGV4IGluIG9yaWdpbmFsIGZhY2VcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImYje2l9XyN7djJ9XCIsIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYxLCB2MiksIG1pZE5hbWUodjEsIHYyKSlcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImYje2l9XyN7djJ9XCIsIG1pZE5hbWUodjEsIHYyKSwgXCIje3YyfVwiKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKFwiZiN7aX1fI3t2Mn1cIiwgXCIje3YyfVwiLCBtaWROYW1lKHYyLCB2MykpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoXCJmI3tpfV8je3YyfVwiLCBtaWROYW1lKHYyLCB2MyksIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYyLCB2MykpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoXCJmI3tpfV8je3YyfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpKVxuICAgICAgXG4gICAgICAgICAgICAjIGlubmVyIHJvdGF0ZWQgZmFjZSBvZiBzYW1lIHZlcnRleC1udW1iZXIgYXMgb3JpZ2luYWxcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImZfaW5fI3tpfVwiLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MSwgdjIpLCBcImlubmVyXyN7aX1fXCIrbWlkTmFtZSh2MiwgdjMpKVxuICAgICAgXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdICMgc2hpZnQgb3ZlciBvbmVcbiAgXG4gICAgbmV3cG9seSA9IGZsYWcudG9wb2x5KClcbiAgICBuZXdwb2x5Lm5hbWUgPSBcInEje3BvbHkubmFtZX1cIlxuICAgIG5ld3BvbHlcblxuIyBpbnNldCAvIGV4dHJ1ZGUgLyBcIkxvZnRcIiBvcGVyYXRvclxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbm1vZHVsZS5leHBvcnRzLmluc2V0TiA9IChwb2x5LCBuLCBpbnNldF9kaXN0LCBwb3BvdXRfZGlzdCktPlxuXG4gICAgbiA/PSAwXG4gICAgaW5zZXRfZGlzdCA/PSAwLjVcbiAgICBwb3BvdXRfZGlzdCA/PSAtMC4yXG4gIFxuICAgIGNvbnNvbGUubG9nIFwiVGFraW5nIGluc2V0IG9mICN7bn0tc2lkZWQgZmFjZXMgb2YgI3twb2x5Lm5hbWV9Li4uXCJcbiAgXG4gICAgZmxhZyA9IG5ldyBwb2x5ZmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRpY2VzLmxlbmd0aF1cbiAgICAgICAgIyBlYWNoIG9sZCB2ZXJ0ZXggaXMgYSBuZXcgdmVydGV4XG4gICAgICAgIHAgPSBwb2x5LnZlcnRpY2VzW2ldXG4gICAgICAgIGZsYWcubmV3ViBcInYje2l9XCIgcFxuXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF0gI25ldyBpbnNldCB2ZXJ0ZXggZm9yIGV2ZXJ5IHZlcnQgaW4gZmFjZVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBpZiBmLmxlbmd0aCA9PSBuIG9yIG4gPT0gMFxuICAgICAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgICAgIGZsYWcubmV3ViBcImYje2l9diN7dn1cIiBhZGQgdHdlZW4ocG9seS52ZXJ0aWNlc1t2XSxjZW50ZXJzW2ldLGluc2V0X2Rpc3QpLCBtdWx0KHBvcG91dF9kaXN0LG5vcm1hbHNbaV0pXG4gIFxuICAgIGZvdW5kQW55ID0gZmFsc2UgIyBhbGVydCBpZiBkb24ndCBmaW5kIGFueVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ldXG4gICAgICAgIHYxID0gXCJ2I3tmW2YubGVuZ3RoLTFdfVwiXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIHYyID0gXCJ2I3t2fVwiO1xuICAgICAgICAgICAgaWYgZi5sZW5ndGggPT0gbiBvciBuID09IDBcbiAgICAgICAgICAgICAgICBmb3VuZEFueSA9IHRydWVcbiAgICAgICAgICAgICAgICBmbmFtZSA9IGkgKyB2MVxuICAgICAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgICAgICB2MSwgICAgICAgdjIpXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCAgICAgIHYyLCAgICAgICBcImYje2l9I3t2Mn1cIilcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsIFwiZiN7aX0je3YyfVwiLCAgXCJmI3tpfSN7djF9XCIpXG4gICAgICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCBcImYje2l9I3t2MX1cIiwgIHYxKVxuICAgICAgICAgICAgICAgICNuZXcgaW5zZXQsIGV4dHJ1ZGVkIGZhY2VcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcoXCJleCN7aX1cIiwgXCJmI3tpfSN7djF9XCIsICBcImYje2l9I3t2Mn1cIilcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBmbGFnLm5ld0ZsYWcoaSwgdjEsIHYyKSAgIyBzYW1lIG9sZCBmbGFnLCBpZiBub24tblxuICAgICAgICAgICAgdjE9djIgIyBjdXJyZW50IGJlY29tZXMgcHJldmlvdXNcbiAgXG4gICAgaWYgbm90IGZvdW5kQW55XG4gICAgICAgIGNvbnNvbGUubG9nIFwiTm8gI3tufS1mb2xkIGNvbXBvbmVudHMgd2VyZSBmb3VuZC5cIlxuICBcbiAgICBuZXdwb2x5ID0gZmxhZy50b3BvbHkoKVxuICAgIG5ld3BvbHkubmFtZSA9IFwibiN7bn0je3BvbHkubmFtZX1cIlxuICAgIG5ld3BvbHlcblxuIyBleHRydWRlTlxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBvbGRlciBvcGVyYXRvciBzcGVjXG5tb2R1bGUuZXhwb3J0cy5leHRydWRlTiA9IChwb2x5LCBuKSAtPlxuICAgIG5ld3BvbHkgPSBpbnNldE4gcG9seSwgbiwgMC4wLCAwLjNcbiAgICBuZXdwb2x5Lm5hbWUgPSBcIngje259I3twb2x5Lm5hbWV9XCJcbiAgICBuZXdwb2x5XG5cbiMgbG9mdFxuIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbm1vZHVsZS5leHBvcnRzLmxvZnQgPSAocG9seSwgbiwgYWxwaGEpIC0+XG4gICAgbmV3cG9seSA9IGluc2V0TiBwb2x5LCBuLCBhbHBoYSwgMC4wXG4gICAgbmV3cG9seS5uYW1lID0gXCJsI3tufSN7cG9seS5uYW1lfVwiXG4gICAgbmV3cG9seVxuXG4jIEhvbGxvdyAoc2tlbGV0b25pemUpXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxubW9kdWxlLmV4cG9ydHMuaG9sbG93ID0gKHBvbHksIGluc2V0X2Rpc3QsIHRoaWNrbmVzcykgLT5cblxuICAgIGluc2V0X2Rpc3QgPz0gMC41XG4gICAgdGhpY2tuZXNzID89IDAuMlxuICBcbiAgICBjb25zb2xlLmxvZyBcIkhvbGxvd2luZyAje3BvbHkubmFtZX0uLi5cIlxuICBcbiAgICBkdWFsbm9ybWFscyA9IGR1YWwocG9seSkubm9ybWFscygpXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gIFxuICAgIGZsYWcgPSBuZXcgcG9seWZsYWcoKVxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0aWNlcy5sZW5ndGhdXG4gICAgICAjIGVhY2ggb2xkIHZlcnRleCBpcyBhIG5ldyB2ZXJ0ZXhcbiAgICAgIHAgPSBwb2x5LnZlcnRpY2VzW2ldXG4gICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHBcbiAgICAgIGZsYWcubmV3ViBcImRvd252I3tpfVwiIGFkZCBwLCBtdWx0IC0xKnRoaWNrbmVzcyxkdWFsbm9ybWFsc1tpXVxuXG4gICAgIyBuZXcgaW5zZXQgdmVydGV4IGZvciBldmVyeSB2ZXJ0IGluIGZhY2VcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXVxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICBmbGFnLm5ld1YgXCJmaW4je2l9diN7dn1cIiB0d2VlbiBwb2x5LnZlcnRpY2VzW3ZdLCBjZW50ZXJzW2ldLCBpbnNldF9kaXN0XG4gICAgICAgICAgICBmbGFnLm5ld1YgXCJmaW5kb3duI3tpfXYje3Z9XCIgYWRkIHR3ZWVuKHBvbHkudmVydGljZXNbdl0sY2VudGVyc1tpXSxpbnNldF9kaXN0KSwgbXVsdCgtMSp0aGlja25lc3Msbm9ybWFsc1tpXSlcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2VzLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZXNbaV1cbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgdjIgPSBcInYje3Z9XCJcbiAgICAgICAgICAgIGZuYW1lID0gaSArIHYxXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsICAgICAgdjEsICAgICAgIHYyKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCAgICAgIHYyLCAgICAgICBcImZpbiN7aX0je3YyfVwiKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCBcImZpbiN7aX0je3YyfVwiLCAgXCJmaW4je2l9I3t2MX1cIilcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgXCJmaW4je2l9I3t2MX1cIiwgIHYxKVxuICAgICAgXG4gICAgICAgICAgICBmbmFtZSA9IFwic2lkZXMje2l9I3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCBcImZpbiN7aX0je3YxfVwiLCAgICAgXCJmaW4je2l9I3t2Mn1cIilcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgXCJmaW4je2l9I3t2Mn1cIiwgICAgIFwiZmluZG93biN7aX0je3YyfVwiKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKGZuYW1lLCBcImZpbmRvd24je2l9I3t2Mn1cIiwgXCJmaW5kb3duI3tpfSN7djF9XCIpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsIFwiZmluZG93biN7aX0je3YxfVwiLCBcImZpbiN7aX0je3YxfVwiKVxuICAgICAgXG4gICAgICAgICAgICBmbmFtZSA9IFwiYm90dG9tI3tpfSN7djF9XCJcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgIFwiZG93biN7djJ9XCIsICAgICAgXCJkb3duI3t2MX1cIilcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhmbmFtZSwgIFwiZG93biN7djF9XCIsICAgICAgXCJmaW5kb3duI3tpfSN7djF9XCIpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsICBcImZpbmRvd24je2l9I3t2MX1cIiwgXCJmaW5kb3duI3tpfSN7djJ9XCIpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoZm5hbWUsICBcImZpbmRvd24je2l9I3t2Mn1cIiwgXCJkb3duI3t2Mn1cIilcbiAgICAgIFxuICAgICAgICAgICAgdjEgPSB2MiAjIGN1cnJlbnQgYmVjb21lcyBwcmV2aW91c1xuICBcbiAgICBuZXdwb2x5ID0gZmxhZy50b3BvbHkoKVxuICAgIG5ld3BvbHkubmFtZSA9IFwiSCN7cG9seS5uYW1lfVwiXG4gICAgbmV3cG9seVxuXG4jIFBlcnNwZWN0aXZhIDFcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIGFuIG9wZXJhdGlvbiByZXZlcnNlLWVuZ2luZWVyZWQgZnJvbSBQZXJzcGVjdGl2YSBDb3Jwb3J1bSBSZWd1bGFyaXVtXG5tb2R1bGUuZXhwb3J0cy5wZXJzcGVjdGl2YTEgPSAocG9seSkgLT5cblxuICAgIGNvbnNvbGUubG9nKFwiVGFraW5nIHN0ZWxsYSBvZiAje3BvbHkubmFtZX0uLi5cIilcbiAgXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpICMgY2FsY3VsYXRlIGZhY2UgY2VudGVyc1xuICBcbiAgICBmbGFnID0gbmV3IHBvbHlmbGFnKClcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGljZXMubGVuZ3RoXVxuICAgICAgICBmbGFnLm5ld1YgXCJ2I3tpfVwiIHBvbHkudmVydGljZXNbaV1cbiAgXG4gICAgIyBpdGVyYXRlIG92ZXIgdHJpcGxldHMgb2YgZmFjZXMgdjEsdjIsdjNcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlc1tpXTtcbiAgICAgICAgdjEgPSBcInYje2ZbZi5sZW5ndGgtMl19XCJcbiAgICAgICAgdjIgPSBcInYje2ZbZi5sZW5ndGgtMV19XCJcbiAgICAgICAgdmVydDEgPSBwb2x5LnZlcnRpY2VzW2ZbZi5sZW5ndGgtMl1dXG4gICAgICAgIHZlcnQyID0gcG9seS52ZXJ0aWNlc1tmW2YubGVuZ3RoLTFdXVxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MyA9IFwidiN7dn1cIlxuICAgICAgICAgICAgdmVydDMgPSBwb2x5LnZlcnRpY2VzW3ZdXG4gICAgICAgICAgICB2MTIgPSB2MStcIn5cIit2MiAjIG5hbWVzIGZvciBcIm9yaWVudGVkXCIgbWlkcG9pbnRzXG4gICAgICAgICAgICB2MjEgPSB2MitcIn5cIit2MVxuICAgICAgICAgICAgdjIzID0gdjIrXCJ+XCIrdjNcbiAgICAgIFxuICAgICAgICAgICAgIyBvbiBlYWNoIE5mYWNlLCBOIG5ldyBwb2ludHMgaW5zZXQgZnJvbSBlZGdlIG1pZHBvaW50cyB0b3dhcmRzIGNlbnRlciA9IFwic3RlbGxhdGVkXCIgcG9pbnRzXG4gICAgICAgICAgICBmbGFnLm5ld1YodjEyLCBtaWRwb2ludCggbWlkcG9pbnQodmVydDEsdmVydDIpLCBjZW50ZXJzW2ldICkpXG4gICAgICBcbiAgICAgICAgICAgICMgaW5zZXQgTmZhY2UgbWFkZSBvZiBuZXcsIHN0ZWxsYXRlZCBwb2ludHNcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImluI3tpfVwiLCAgICAgIHYxMiwgICAgICAgdjIzKVxuICAgICAgXG4gICAgICAgICAgICAjIG5ldyB0cmkgZmFjZSBjb25zdGl0dXRpbmcgdGhlIHJlbWFpbmRlciBvZiB0aGUgc3RlbGxhdGVkIE5mYWNlXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoXCJmI3tpfSN7djJ9XCIsICAgICAgdjIzLCAgICAgIHYxMilcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImYje2l9I3t2Mn1cIiwgICAgICAgdjEyLCAgICAgIHYyKVxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKFwiZiN7aX0je3YyfVwiLCAgICAgIHYyLCAgICAgIHYyMylcbiAgICAgIFxuICAgICAgICAgICAgIyBvbmUgb2YgdGhlIHR3byBuZXcgdHJpYW5nbGVzIHJlcGxhY2luZyBvbGQgZWRnZSBiZXR3ZWVuIHYxLT52MlxuICAgICAgICAgICAgZmxhZy5uZXdGbGFnKFwiZiN7djEyfVwiLCAgICAgdjEsICAgICAgICB2MjEpXG4gICAgICAgICAgICBmbGFnLm5ld0ZsYWcoXCJmI3t2MTJ9XCIsICAgICB2MjEsICAgICAgIHYxMilcbiAgICAgICAgICAgIGZsYWcubmV3RmxhZyhcImYje3YxMn1cIiwgICAgICB2MTIsICAgICAgIHYxKVxuICAgICAgXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdOyAgIyBjdXJyZW50IGJlY29tZXMgcHJldmlvdXNcbiAgICAgICAgICAgIFt2ZXJ0MSwgdmVydDJdID0gW3ZlcnQyLCB2ZXJ0M11cbiAgXG4gICAgbmV3cG9seSA9IGZsYWcudG9wb2x5KClcbiAgICBuZXdwb2x5Lm5hbWUgPSBcIlAje3BvbHkubmFtZX1cIlxuICAgIG5ld3BvbHlcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyBHb2xkYmVyZy1Db3hldGVyIE9wZXJhdG9ycyAgKGluIHByb2dyZXNzLi4uKVxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4jIFRyaWFuZ3VsYXIgU3ViZGl2aXNpb24gT3BlcmF0b3JcbiMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBsaW1pdGVkIHZlcnNpb24gb2YgdGhlIEdvbGRiZXJnLUNveGV0ZXIgdV9uIG9wZXJhdG9yIGZvciB0cmlhbmd1bGFyIG1lc2hlc1xuIyBXZSBzdWJkaXZpZGUgbWFudWFsbHkgaGVyZSwgaW5zdGVhZCBvZiB1c2luZyB0aGUgdXN1YWwgZmxhZyBtYWNoaW5lcnkuXG5tb2R1bGUuZXhwb3J0cy50cmlzdWIgPSAocG9seSwgbikgLT5cbiAgICBcbiAgICBjb25zb2xlLmxvZyhcIlRha2luZyB0cmlzdWIgb2YgI3twb2x5Lm5hbWV9Li4uXCIpXG4gICAgXG4gICAgbiA/PSAyXG4gICAgXG4gICAgIyBOby1PcCBmb3Igbm9uLXRyaWFuZ3VsYXIgbWVzaGVzXG4gICAgZm9yIGZuIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGlmIHBvbHkuZmFjZXNbZm5dLmxlbmd0aCAhPSAzXG4gICAgICAgICAgICByZXR1cm4gcG9seVxuICBcbiAgICAjIENhbGN1bGF0ZSByZWR1bmRhbnQgc2V0IG9mIG5ldyB2ZXJ0aWNlcyBmb3Igc3ViZGl2aWRlZCBtZXNoLlxuICAgIG5ld1ZzID0gW11cbiAgICB2bWFwID0ge31cbiAgICBwb3MgPSAwXG4gICAgZm9yIGZuIGluIFswLi4ucG9seS5mYWNlcy5sZW5ndGhdXG4gICAgICAgIGYgPSBwb2x5LmZhY2VzW2ZuXVxuICAgICAgICBbaTEsIGkyLCBpM10gPSBmLnNsaWNlIC0zXG4gICAgICAgIHYxID0gcG9seS52ZXJ0aWNlc1tpMV1cbiAgICAgICAgdjIgPSBwb2x5LnZlcnRpY2VzW2kyXVxuICAgICAgICB2MyA9IHBvbHkudmVydGljZXNbaTNdXG4gICAgICAgIHYyMSA9IHN1YiB2MiwgdjFcbiAgICAgICAgdjMxID0gc3ViIHYzLCB2MVxuICAgICAgICBmb3IgaSBpbiBbMC4ubl1cbiAgICAgICAgICAgIGZvciBqIGluIFswLi5uLWldXG4gICAgICAgICAgICAgICAgdiA9IGFkZCBhZGQodjEsIG11bHQoaSAqIDEuMCAvIG4sIHYyMSkpLCBtdWx0KGogKiAxLjAgLyBuLCB2MzEpXG4gICAgICAgICAgICAgICAgdm1hcFtcInYje2ZufS0je2l9LSN7an1cIl0gPSBwb3MrK1xuICAgICAgICAgICAgICAgIG5ld1ZzLnB1c2ggdlxuICBcbiAgICAjIFRoZSBhYm92ZSB2ZXJ0aWNlcyBhcmUgcmVkdW5kYW50IGFsb25nIG9yaWdpbmFsIGVkZ2VzLCBcbiAgICAjIHdlIG5lZWQgdG8gYnVpbGQgYW4gaW5kZXggbWFwIGludG8gYSB1bmlxdWVpZmllZCBsaXN0IG9mIHRoZW0uXG4gICAgIyBXZSBpZGVudGlmeSB2ZXJ0aWNlcyB0aGF0IGFyZSBjbG9zZXIgdGhhbiBhIGNlcnRhaW4gZXBzaWxvbiBkaXN0YW5jZS5cbiAgICBFUFNJTE9OX0NMT1NFID0gMS4wZS04XG4gICAgdW5pcVZzID0gW11cbiAgICBuZXdwb3MgPSAwXG4gICAgdW5pcW1hcCA9IHt9XG4gICAgZm9yIFtpLCB2XSBpbiBuZXdWcy5lbnRyaWVzKClcbiAgICAgICAgaWYgaSBpbiB1bmlxbWFwIHRoZW4gY29udGludWUgIyBhbHJlYWR5IG1hcHBlZFxuICAgICAgICB1bmlxbWFwW2ldID0gbmV3cG9zXG4gICAgICAgIHVuaXFWcy5wdXNoIHZcbiAgICAgICAgZm9yIGogaW4gW2krMS4uLm5ld1ZzLmxlbmd0aF1cbiAgICAgICAgICAgIHcgPSBuZXdWc1tqXVxuICAgICAgICAgICAgaWYgbWFnKHN1Yih2LCB3KSkgPCBFUFNJTE9OX0NMT1NFXG4gICAgICAgICAgICAgICAgdW5pcW1hcFtqXSA9IG5ld3Bvc1xuICAgICAgbmV3cG9zKytcbiAgXG4gICAgZmFjZXMgPSBbXVxuICAgIGZvciBmbiBpbiBbMC4uLnBvbHkuZmFjZXMubGVuZ3RoXVxuICAgICAgICBmb3IgaSBpbiBbMC4uLm5dXG4gICAgICAgICAgICBmb3IgaiBpbiBbMC4uLm4taV1cbiAgICAgICAgICAgICAgICBmYWNlcy5wdXNoIFt1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2p9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aSsxfS0je2p9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqKzF9XCJdXV1cbiAgICAgICAgZm9yIGkgaW4gWzEuLi5uXVxuICAgICAgICAgICAgZm9yIGogaW4gWzAuLi5uLWldXG4gICAgICAgICAgICAgICAgZmFjZXMucHVzaCBbdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2l9LSN7aisxfVwiXV0sIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFtYXBbdm1hcFtcInYje2ZufS0je2ktMX0tI3tqKzF9XCJdXV1cbiAgXG4gICAgIyBDcmVhdGUgbmV3IHBvbHlnb24gb3V0IG9mIGZhY2VzIGFuZCB1bmlxdWUgdmVydGljZXMuXG4gICAgbmV3cG9seSA9IG5ldyBwb2x5aGVkcm9uKClcbiAgICBuZXdwb2x5Lm5hbWUgPSBcInUje259I3twb2x5Lm5hbWV9XCJcbiAgICBuZXdwb2x5LmZhY2VzID0gZmFjZXNcbiAgICBuZXdwb2x5LnZlcnRpY2VzID0gdW5pcVZzXG4gIFxuICAgIG5ld3BvbHlcbiJdfQ==
//# sourceURL=../../coffee/polyhedronisme/topo_operators.coffee