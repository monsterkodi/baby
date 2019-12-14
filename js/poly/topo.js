// koffee 1.6.0

/*
000000000   0000000   00000000    0000000     
   000     000   000  000   000  000   000    
   000     000   000  00000000   000   000    
   000     000   000  000        000   000    
   000      0000000   000         0000000
 */
var Flag, Polyhedron, Vect, _, add, ambo, angle, bevel, calcCentroid, canonicalize, chamfer, clamp, clockwise, copyVecArray, cross, dot, dual, expand, extrude, flatten, gyro, hollow, inset, intersect, kis, klog, mag, midName, midpoint, min, mult, neg, oneThird, perspectiva, planarize, pointPlaneDist, quinto, rayPlane, rayRay, recenter, ref, ref1, rescale, rotate, sphericalize, sub, tangentify, trisub, truncate, tween, unit, valid, whirl, zirkularize,
    indexOf = [].indexOf;

ref = require('kxk'), _ = ref._, clamp = ref.clamp, klog = ref.klog, valid = ref.valid;

ref1 = require('./math'), add = ref1.add, angle = ref1.angle, calcCentroid = ref1.calcCentroid, clockwise = ref1.clockwise, copyVecArray = ref1.copyVecArray, cross = ref1.cross, dot = ref1.dot, intersect = ref1.intersect, mag = ref1.mag, midpoint = ref1.midpoint, mult = ref1.mult, neg = ref1.neg, oneThird = ref1.oneThird, planarize = ref1.planarize, pointPlaneDist = ref1.pointPlaneDist, rayPlane = ref1.rayPlane, rayRay = ref1.rayRay, recenter = ref1.recenter, rescale = ref1.rescale, rotate = ref1.rotate, sub = ref1.sub, tangentify = ref1.tangentify, tween = ref1.tween, unit = ref1.unit;

min = Math.min;

Vect = require('../vect');

Flag = require('./flag');

Polyhedron = require('./polyhedron');

midName = function(v1, v2) {
    return v1 < v2 && (v1 + "_" + v2) || (v2 + "_" + v1);
};

flatten = function(poly, iterations) {
    var centers, d, face, fi, l, len, len1, len2, len3, m, nf, nonplanar, normals, q, r, ref2, ref3, ref4, s, saveToMove, vertexdist, vi;
    if (iterations == null) {
        iterations = 1;
    }
    normals = poly.normals();
    centers = poly.centers();
    nonplanar = {};
    vertexdist = {};
    ref2 = poly.face;
    for (fi = l = 0, len = ref2.length; l < len; fi = ++l) {
        face = ref2[fi];
        for (m = 0, len1 = face.length; m < len1; m++) {
            vi = face[m];
            d = pointPlaneDist(poly.vertex[vi], centers[fi], normals[fi]);
            if (d > 0.0001) {
                if (nonplanar[fi] != null) {
                    nonplanar[fi];
                } else {
                    nonplanar[fi] = 0;
                }
                nonplanar[fi] += d;
                s = dot(normals[fi], sub(poly.vertex[vi], centers[fi])) > 0 && 1 || -1;
                if (vertexdist[vi] != null) {
                    vertexdist[vi];
                } else {
                    vertexdist[vi] = 0;
                }
                vertexdist[vi] += s * d;
            }
        }
    }
    if (valid(nonplanar)) {
        klog("nonplanar " + poly.name);
        for (fi in nonplanar) {
            d = nonplanar[fi];
            fi = parseInt(fi);
            klog("fi " + fi + " numv " + poly.face[fi].length + " " + d);
            ref3 = poly.face[fi];
            for (q = 0, len2 = ref3.length; q < len2; q++) {
                vi = ref3[q];
                saveToMove = true;
                ref4 = poly.facesAtVertex(vi);
                for (r = 0, len3 = ref4.length; r < len3; r++) {
                    nf = ref4[r];
                    if (nf !== fi) {
                        if (poly.face[nf].length > 3) {
                            saveToMove = false;
                            break;
                        }
                    }
                }
                if (saveToMove) {
                    d = -vertexdist[vi];
                    klog("move " + vi + " by " + d);
                    poly.vertex[vi] = add(poly.vertex[vi], mult(d, normals[fi]));
                }
            }
        }
    } else {
        klog("flach wie ''ne plunder " + poly.name);
    }
    return new Polyhedron(poly.name, poly.face, poly.vertex);
};

hollow = function(poly, insetf, thickness) {
    var centers, det, edge, f, f1, f2, face, fi, fl, flag, fname, fr, i, i1, i2, il, ind, ins, ir, j1, k1, l, len, len1, len2, len3, len4, len5, lr, m, name, name1, neighbors, ni, nl, normals, nr, ns, p, q, r, ref2, ref3, ref4, set, t, u, v, v1, v2, v3, v4, vertexMap, vi, wing, wings, z;
    if (insetf == null) {
        insetf = 0.5;
    }
    if (thickness == null) {
        thickness = 0.5;
    }
    insetf = clamp(0.1, 0.9, insetf);
    normals = poly.normals();
    centers = poly.centers();
    wings = poly.wings();
    neighbors = poly.neighbors();
    if (thickness != null) {
        thickness;
    } else {
        thickness = 2e308;
    }
    set = {};
    ins = function(e, f) {
        if (set[e] != null) {
            set[e];
        } else {
            set[e] = {};
        }
        if (!set[e][f]) {
            set[e][f] = tween(poly.vertex[e], centers[f], insetf);
        }
        return set[e][f];
    };
    det = {};
    ind = function(e, f) {
        if (det[e] != null) {
            det[e];
        } else {
            det[e] = {};
        }
        if (!det[e][f]) {
            det[e][f] = add(ins(e, f), mult(-thickness, normals[f]));
        }
        return det[e][f];
    };
    for (l = 0, len = wings.length; l < len; l++) {
        wing = wings[l];
        fr = wing[2].fr;
        fl = wing[2].fl;
        ir = ins(wing[1], fr);
        il = ins(wing[1], fl);
        nr = neg(normals[fr]);
        nl = neg(normals[fl]);
        lr = rayRay([ir, add(ir, nr)], [il, add(il, nl)]);
        thickness = min(thickness, mag(sub(ir, lr)));
        thickness = min(thickness, mag(sub(il, lr)));
    }
    flag = new Flag();
    for (i = m = 0, ref2 = poly.vertex.length; 0 <= ref2 ? m < ref2 : m > ref2; i = 0 <= ref2 ? ++m : --m) {
        p = poly.vertex[i];
        flag.vert("v" + i, p);
    }
    for (fi = q = 0, ref3 = poly.face.length; 0 <= ref3 ? q < ref3 : q > ref3; fi = 0 <= ref3 ? ++q : --q) {
        face = poly.face[fi];
        for (r = 0, len1 = face.length; r < len1; r++) {
            vi = face[r];
            flag.vert("fin" + fi + "v" + vi, ins(vi, fi));
            flag.vert("findown" + fi + "v" + vi, ind(vi, fi));
        }
    }
    for (fi = t = 0, ref4 = poly.face.length; 0 <= ref4 ? t < ref4 : t > ref4; fi = 0 <= ref4 ? ++t : --t) {
        f = poly.face[fi];
        v1 = "v" + f[f.length - 1];
        for (u = 0, len2 = f.length; u < len2; u++) {
            v = f[u];
            v2 = "v" + v;
            i1 = "fin" + fi + v1;
            i2 = "fin" + fi + v2;
            f1 = "findown" + fi + v1;
            f2 = "findown" + fi + v2;
            fname = "tops" + fi + v1;
            flag.edge(fname, v1, v2);
            flag.edge(fname, v2, i2);
            flag.edge(fname, i2, i1);
            flag.edge(fname, i1, v1);
            fname = "sides" + fi + v1;
            flag.edge(fname, i1, i2);
            flag.edge(fname, i2, f2);
            flag.edge(fname, f2, f1);
            flag.edge(fname, f1, i1);
            v1 = v2;
        }
    }
    vertexMap = {};
    for (z = 0, len3 = wings.length; z < len3; z++) {
        wing = wings[z];
        fr = wing[2].fr;
        fl = wing[2].fl;
        v1 = "findown" + fr + "v" + wing[0];
        v2 = "findown" + fr + "v" + wing[1];
        v3 = "findown" + fl + "v" + wing[1];
        v4 = "findown" + fl + "v" + wing[0];
        if (0.001 < mag(sub(ind(wing[1], fr), ind(wing[1], fl)))) {
            fname = "stitch_" + fl + "_" + fr;
            flag.edge(fname, v1, v2);
            flag.edge(fname, v2, v3);
            flag.edge(fname, v3, v4);
            flag.edge(fname, v4, v1);
        }
        if (vertexMap[name = wing[0]] != null) {
            vertexMap[name];
        } else {
            vertexMap[name] = {};
        }
        vertexMap[wing[0]][wing[1]] = [v1, v4];
        if (vertexMap[name1 = wing[1]] != null) {
            vertexMap[name1];
        } else {
            vertexMap[name1] = {};
        }
        vertexMap[wing[1]][wing[0]] = [v3, v2];
    }
    for (vi = j1 = 0, len4 = neighbors.length; j1 < len4; vi = ++j1) {
        ns = neighbors[vi];
        for (k1 = 0, len5 = ns.length; k1 < len5; k1++) {
            ni = ns[k1];
            edge = vertexMap[vi][ni];
            flag.edge("snitch_" + vi, edge[0], edge[1]);
        }
    }
    return flag.topoly("h" + poly.name);
};

expand = function(poly, amount) {
    var a, b, centers, d, f, face, faces, fi, imap, l, len, len1, m, n, neighbors, newV, nextV, o, oldedges, q, ref2, v, verts, vi, vmap, wing, wings;
    if (amount == null) {
        amount = 0.5;
    }
    amount = clamp(0, 10, amount);
    oldedges = poly.edges();
    centers = poly.centers();
    neighbors = poly.neighbors();
    wings = poly.wings();
    verts = [];
    faces = [];
    vmap = {};
    imap = {};
    newV = 0;
    for (fi = l = 0, ref2 = poly.face.length; 0 <= ref2 ? l < ref2 : l > ref2; fi = 0 <= ref2 ? ++l : --l) {
        d = sub(mult(1 + amount, centers[fi]), centers[fi]);
        f = poly.face[fi];
        face = [];
        for (vi = m = 0, len = f.length; m < len; vi = ++m) {
            v = f[vi];
            if (vmap[v] != null) {
                vmap[v];
            } else {
                vmap[v] = [];
            }
            vmap[v].push(newV);
            imap[newV] = v;
            verts.push(add(poly.vertex[v], d));
            nextV = newV + (vi === f.length - 1 && -f.length + 1 || 1);
            face.push(newV);
            newV++;
        }
        faces.push(face);
    }
    for (q = 0, len1 = wings.length; q < len1; q++) {
        wing = wings[q];
        a = wing[0], b = wing[1];
        face = vmap[a].concat(vmap[b]);
        face = face.filter(function(v) {
            return (indexOf.call(faces[wing[2].fr], v) >= 0) || (indexOf.call(faces[wing[2].fl], v) >= 0);
        });
        clockwise(verts, face);
        faces.push(face);
    }
    for (o in vmap) {
        n = vmap[o];
        clockwise(verts, n);
        faces.push(n);
    }
    return new Polyhedron("e" + poly.name, faces, verts);
};

sphericalize = function(poly) {
    var l, len, ref2, vertex, verts, vi;
    verts = [];
    ref2 = poly.vertex;
    for (vi = l = 0, len = ref2.length; l < len; vi = ++l) {
        vertex = ref2[vi];
        verts.push(unit(poly.vertex[vi]));
    }
    return new Polyhedron("z" + poly.name, poly.face, verts);
};

zirkularize = function(poly, grow, n) {
    var angl, axis, centers, f, fi, l, len, len1, m, q, ref2, ref3, results, v, vertices, verts;
    if (grow == null) {
        grow = 1;
    }
    if (n == null) {
        n = 6;
    }
    vertices = [];
    centers = poly.centers();
    ref2 = poly.face;
    for (fi = l = 0, len = ref2.length; l < len; fi = ++l) {
        f = ref2[fi];
        if (f.length === n || n === 0) {
            for (m = 0, len1 = f.length; m < len1; m++) {
                v = f[m];
                axis = cross(centers[fi], poly.vertex[v]);
                angl = angle(centers[fi], poly.vertex[v]);
                vertices[v] = rotate(centers[fi], axis, angl * grow);
            }
        }
    }
    verts = (function() {
        results = [];
        for (var q = 0, ref3 = poly.vertex.length; 0 <= ref3 ? q < ref3 : q > ref3; 0 <= ref3 ? q++ : q--){ results.push(q); }
        return results;
    }).apply(this).map(function(i) {
        var ref3;
        return (ref3 = vertices[i]) != null ? ref3 : poly.vertex[i];
    });
    return new Polyhedron("z" + poly.name, poly.face, verts);
};

dual = function(poly) {
    var centers, dpoly, f, face, flag, i, k, l, len, len1, len2, m, q, r, ref2, ref3, ref4, ref5, ref6, sortF, t, u, v1, v2, z;
    flag = new Flag();
    face = [];
    for (i = l = 0, ref2 = poly.vertex.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        face[i] = {};
    }
    for (i = m = 0, ref3 = poly.face.length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        f = poly.face[i];
        v1 = f.slice(-1)[0];
        for (q = 0, len = f.length; q < len; q++) {
            v2 = f[q];
            face[v1]["v" + v2] = "" + i;
            v1 = v2;
        }
    }
    centers = poly.centers();
    for (i = r = 0, ref4 = poly.face.length; 0 <= ref4 ? r < ref4 : r > ref4; i = 0 <= ref4 ? ++r : --r) {
        flag.vert("" + i, centers[i]);
    }
    for (i = t = 0, ref5 = poly.face.length; 0 <= ref5 ? t < ref5 : t > ref5; i = 0 <= ref5 ? ++t : --t) {
        f = poly.face[i];
        v1 = f.slice(-1)[0];
        for (u = 0, len1 = f.length; u < len1; u++) {
            v2 = f[u];
            flag.edge(v1, face[v2]["v" + v1], "" + i);
            v1 = v2;
        }
    }
    dpoly = flag.topoly();
    sortF = [];
    ref6 = dpoly.face;
    for (z = 0, len2 = ref6.length; z < len2; z++) {
        f = ref6[z];
        k = intersect(poly.face[f[0]], poly.face[f[1]], poly.face[f[2]]);
        sortF[k] = f;
    }
    dpoly.face = sortF;
    if (poly.name[0] !== "d") {
        dpoly.name = "d" + poly.name;
    } else {
        dpoly.name = poly.name.slice(1);
    }
    return dpoly;
};

kis = function(poly, apexdist, n) {
    var apex, centers, f, flag, fname, foundAny, i, l, len, m, normals, q, ref2, ref3, v, v1, v2;
    if (apexdist == null) {
        apexdist = 0.5;
    }
    if (n == null) {
        n = 0;
    }
    apexdist = clamp(-1, 10, apexdist);
    if (apexdist < 0) {
        apexdist = apexdist * poly.minFaceDist();
    }
    flag = new Flag();
    for (i = l = 0, ref2 = poly.vertex.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        flag.vert("v" + i, poly.vertex[i]);
    }
    normals = poly.normals();
    centers = poly.centers();
    foundAny = false;
    for (i = m = 0, ref3 = poly.face.length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        f = poly.face[i];
        v1 = "v" + f[f.length - 1];
        for (q = 0, len = f.length; q < len; q++) {
            v = f[q];
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

truncate = function(poly, factor) {
    var depth, edgeMap, face, fi, i, ii, l, len, m, neighbors, newFace, ni, nl, numFaces, numVertices, q, r, ref2, ref3, ref4, ref5, ref6, ref7, t, u, vertexIndex, vi, vp;
    if (factor == null) {
        factor = 0.5;
    }
    factor = clamp(0, 1, factor);
    edgeMap = {};
    numFaces = poly.face.length;
    numVertices = poly.vertex.length;
    neighbors = poly.neighbors();
    depth = 0.5 * factor * poly.minEdgeLength();
    for (vertexIndex = l = 0, ref2 = numVertices; 0 <= ref2 ? l < ref2 : l > ref2; vertexIndex = 0 <= ref2 ? ++l : --l) {
        if (edgeMap[vertexIndex] != null) {
            edgeMap[vertexIndex];
        } else {
            edgeMap[vertexIndex] = {};
        }
        face = [];
        nl = neighbors[vertexIndex].length;
        for (ii = m = 0, ref3 = nl; 0 <= ref3 ? m < ref3 : m > ref3; ii = 0 <= ref3 ? ++m : --m) {
            ni = neighbors[vertexIndex][ii];
            edgeMap[vertexIndex][ni] = poly.vertex.length;
            vp = poly.edge(vertexIndex, ni);
            vp.normalize();
            vp.scaleInPlace(depth);
            vp.addInPlace(poly.vert(vertexIndex));
            face.push(poly.vertex.length);
            poly.vertex.push([vp.x, vp.y, vp.z]);
        }
        poly.face.push(face);
    }
    for (fi = q = 0, ref4 = numFaces; 0 <= ref4 ? q < ref4 : q > ref4; fi = 0 <= ref4 ? ++q : --q) {
        face = poly.face[fi];
        newFace = [];
        for (vi = r = 0, ref5 = face.length; 0 <= ref5 ? r < ref5 : r > ref5; vi = 0 <= ref5 ? ++r : --r) {
            ni = (vi + 1) % face.length;
            newFace.push(edgeMap[face[vi]][face[ni]]);
            if (factor < 1) {
                newFace.push(edgeMap[face[ni]][face[vi]]);
            }
        }
        poly.face[fi] = newFace;
    }
    poly.vertex.splice(0, numVertices);
    ref6 = poly.face;
    for (t = 0, len = ref6.length; t < len; t++) {
        face = ref6[t];
        for (i = u = 0, ref7 = face.length; 0 <= ref7 ? u < ref7 : u > ref7; i = 0 <= ref7 ? ++u : --u) {
            face[i] -= numVertices;
        }
    }
    return poly;
};

ambo = function(poly) {
    var f, flag, i, l, len, m, ref2, ref3, ref4, v1, v2, v3;
    flag = new Flag();
    for (i = l = 0, ref2 = poly.face.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        f = poly.face[i];
        ref3 = f.slice(-2), v1 = ref3[0], v2 = ref3[1];
        for (m = 0, len = f.length; m < len; m++) {
            v3 = f[m];
            if (v1 < v2) {
                flag.vert(midName(v1, v2), midpoint(poly.vertex[v1], poly.vertex[v2]));
            }
            flag.edge("orig" + i, midName(v1, v2), midName(v2, v3));
            flag.edge("dual" + v2, midName(v2, v3), midName(v1, v2));
            ref4 = [v2, v3], v1 = ref4[0], v2 = ref4[1];
        }
    }
    return flag.topoly("a" + poly.name);
};

bevel = function(poly, factor) {
    var p;
    if (factor == null) {
        factor = 0.5;
    }
    p = truncate(ambo(poly), factor);
    p.name = "b" + poly.name;
    return p;
};

chamfer = function(poly, factor) {
    var centers, cmid, cr, e0, e1, ed, edge, el, flag, head, l, len, len1, len2, lr, m, minEdgeLength, moved, n_h, n_t, nf, nl, nmid, nnl, nnr, normals, npl, npr, nr, pl, pmid, pnm, pr, q, rr, tail, wings;
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
        e0 = poly.vertex[edge[0]];
        e1 = poly.vertex[edge[1]];
        ed = unit(sub(e1, e0));
        nr = unit(sub(poly.vertex[edge[2].nr], e1));
        pr = unit(sub(poly.vertex[edge[2].pr], e0));
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
        e0 = poly.vertex[edge[0]];
        e1 = poly.vertex[edge[1]];
        rr = [add(e0, mult(minEdgeLength, unit(sub(poly.vertex[edge[2].pr], e0)))), add(e1, mult(minEdgeLength, unit(sub(poly.vertex[edge[2].nr], e1))))];
        lr = [add(e0, mult(minEdgeLength, unit(sub(poly.vertex[edge[2].pl], e0)))), add(e1, mult(minEdgeLength, unit(sub(poly.vertex[edge[2].nl], e1))))];
        moved[edge[1] + "▸" + edge[0] + "l"] = rr;
        moved[edge[0] + "▸" + edge[1] + "r"] = rr;
        moved[edge[1] + "▸" + edge[0] + "r"] = lr;
        moved[edge[0] + "▸" + edge[1] + "l"] = lr;
    }
    for (q = 0, len2 = wings.length; q < len2; q++) {
        edge = wings[q];
        e0 = poly.vertex[edge[0]];
        e1 = poly.vertex[edge[1]];
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
    var centers, cv1name, cv2name, f, flag, fname, i, j, l, m, q, ref2, ref3, ref4, ref5, ref6, v, v1, v1_2, v2, v3;
    if (n == null) {
        n = 0;
    }
    flag = new Flag();
    for (i = l = 0, ref2 = poly.vertex.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        flag.vert("v" + i, unit(poly.vertex[i]));
    }
    centers = poly.centers();
    for (i = m = 0, ref3 = poly.face.length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        f = poly.face[i];
        ref4 = f.slice(-2), v1 = ref4[0], v2 = ref4[1];
        for (j = q = 0, ref5 = f.length; 0 <= ref5 ? q < ref5 : q > ref5; j = 0 <= ref5 ? ++q : --q) {
            v = f[j];
            v3 = v;
            v1_2 = oneThird(poly.vertex[v1], poly.vertex[v2]);
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
    var centers, f, flag, fname, i, j, l, m, q, r, ref2, ref3, ref4, ref5, ref6, ref7, v, v1, v2, v3;
    flag = new Flag();
    for (i = l = 0, ref2 = poly.vertex.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        flag.vert("v" + i, unit(poly.vertex[i]));
    }
    centers = poly.centers();
    for (i = m = 0, ref3 = poly.face.length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        f = poly.face[i];
        flag.vert("center" + i, unit(centers[i]));
    }
    for (i = q = 0, ref4 = poly.face.length; 0 <= ref4 ? q < ref4 : q > ref4; i = 0 <= ref4 ? ++q : --q) {
        f = poly.face[i];
        ref5 = f.slice(-2), v1 = ref5[0], v2 = ref5[1];
        for (j = r = 0, ref6 = f.length; 0 <= ref6 ? r < ref6 : r > ref6; j = 0 <= ref6 ? ++r : --r) {
            v = f[j];
            v3 = v;
            flag.vert(v1 + "~" + v2, oneThird(poly.vertex[v1], poly.vertex[v2]));
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
    for (i = l = 0, ref2 = poly.face.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        f = poly.face[i];
        centroid = calcCentroid(f.map(function(idx) {
            return poly.vertex[idx];
        }));
        ref3 = f.slice(-2), v1 = ref3[0], v2 = ref3[1];
        for (m = 0, len = f.length; m < len; m++) {
            v3 = f[m];
            midpt = midpoint(poly.vertex[v1], poly.vertex[v2]);
            innerpt = midpoint(midpt, centroid);
            flag.vert(midName(v1, v2), midpt);
            flag.vert(("inner_" + i + "_") + midName(v1, v2), innerpt);
            flag.vert("" + v2, poly.vertex[v2]);
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
    var centers, f, flag, fname, foundAny, i, l, len, len1, m, normals, p, q, r, ref2, ref3, ref4, t, v, v1, v2;
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
    for (i = l = 0, ref2 = poly.vertex.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        p = poly.vertex[i];
        flag.vert("v" + i, p);
    }
    normals = poly.normals();
    centers = poly.centers();
    for (i = m = 0, ref3 = poly.face.length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        f = poly.face[i];
        if (f.length === n || n === 0) {
            for (q = 0, len = f.length; q < len; q++) {
                v = f[q];
                flag.vert("f" + i + "v" + v, add(tween(poly.vertex[v], centers[i], inset), mult(popout, normals[i])));
            }
        }
    }
    foundAny = false;
    for (i = r = 0, ref4 = poly.face.length; 0 <= ref4 ? r < ref4 : r > ref4; i = 0 <= ref4 ? ++r : --r) {
        f = poly.face[i];
        v1 = "v" + f[f.length - 1];
        for (t = 0, len1 = f.length; t < len1; t++) {
            v = f[t];
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

perspectiva = function(poly) {
    var centers, f, flag, i, l, len, m, q, ref2, ref3, ref4, ref5, v, v1, v12, v2, v21, v23, v3, vert1, vert2, vert3;
    centers = poly.centers();
    flag = new Flag();
    for (i = l = 0, ref2 = poly.vertex.length; 0 <= ref2 ? l < ref2 : l > ref2; i = 0 <= ref2 ? ++l : --l) {
        flag.vert("v" + i, poly.vertex[i]);
    }
    for (i = m = 0, ref3 = poly.face.length; 0 <= ref3 ? m < ref3 : m > ref3; i = 0 <= ref3 ? ++m : --m) {
        f = poly.face[i];
        v1 = "v" + f[f.length - 2];
        v2 = "v" + f[f.length - 1];
        vert1 = poly.vertex[f[f.length - 2]];
        vert2 = poly.vertex[f[f.length - 1]];
        for (q = 0, len = f.length; q < len; q++) {
            v = f[q];
            v3 = "v" + v;
            vert3 = poly.vertex[v];
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
    var EPSILON_CLOSE, f, faces, fn, i, i1, i2, i3, j, j1, k1, l, l1, len, m, m1, newpos, pos, q, r, ref10, ref11, ref12, ref13, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, t, u, uniqVs, uniqmap, v, v1, v2, v21, v3, v31, verts, vmap, w, z;
    if (n == null) {
        n = 2;
    }
    for (fn = l = 0, ref2 = poly.face.length; 0 <= ref2 ? l < ref2 : l > ref2; fn = 0 <= ref2 ? ++l : --l) {
        if (poly.face[fn].length !== 3) {
            return poly;
        }
    }
    verts = [];
    vmap = {};
    pos = 0;
    for (fn = m = 0, ref3 = poly.face.length; 0 <= ref3 ? m < ref3 : m > ref3; fn = 0 <= ref3 ? ++m : --m) {
        f = poly.face[fn];
        ref4 = f.slice(-3), i1 = ref4[0], i2 = ref4[1], i3 = ref4[2];
        v1 = poly.vertex[i1];
        v2 = poly.vertex[i2];
        v3 = poly.vertex[i3];
        v21 = sub(v2, v1);
        v31 = sub(v3, v1);
        for (i = q = 0, ref5 = n; 0 <= ref5 ? q <= ref5 : q >= ref5; i = 0 <= ref5 ? ++q : --q) {
            for (j = r = 0, ref6 = n - i; 0 <= ref6 ? r <= ref6 : r >= ref6; j = 0 <= ref6 ? ++r : --r) {
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
    for (i = t = 0, len = verts.length; t < len; i = ++t) {
        v = verts[i];
        if (indexOf.call(uniqmap, i) >= 0) {
            continue;
        }
        uniqmap[i] = newpos;
        uniqVs.push(v);
        for (j = u = ref7 = i + 1, ref8 = verts.length; ref7 <= ref8 ? u < ref8 : u > ref8; j = ref7 <= ref8 ? ++u : --u) {
            w = verts[j];
            if (mag(sub(v, w)) < EPSILON_CLOSE) {
                uniqmap[j] = newpos;
            }
        }
        newpos++;
    }
    faces = [];
    for (fn = z = 0, ref9 = poly.face.length; 0 <= ref9 ? z < ref9 : z > ref9; fn = 0 <= ref9 ? ++z : --z) {
        for (i = j1 = 0, ref10 = n; 0 <= ref10 ? j1 < ref10 : j1 > ref10; i = 0 <= ref10 ? ++j1 : --j1) {
            for (j = k1 = 0, ref11 = n - i; 0 <= ref11 ? k1 < ref11 : k1 > ref11; j = 0 <= ref11 ? ++k1 : --k1) {
                faces.push([uniqmap[vmap["v" + fn + "-" + i + "-" + j]], uniqmap[vmap["v" + fn + "-" + (i + 1) + "-" + j]], uniqmap[vmap["v" + fn + "-" + i + "-" + (j + 1)]]]);
            }
        }
        for (i = l1 = 1, ref12 = n; 1 <= ref12 ? l1 < ref12 : l1 > ref12; i = 1 <= ref12 ? ++l1 : --l1) {
            for (j = m1 = 0, ref13 = n - i; 0 <= ref13 ? m1 < ref13 : m1 > ref13; j = 0 <= ref13 ? ++m1 : --m1) {
                faces.push([uniqmap[vmap["v" + fn + "-" + i + "-" + j]], uniqmap[vmap["v" + fn + "-" + i + "-" + (j + 1)]], uniqmap[vmap["v" + fn + "-" + (i - 1) + "-" + (j + 1)]]]);
            }
        }
    }
    return new Polyhedron("u" + n + poly.name, faces, uniqVs);
};

canonicalize = function(poly, iter) {
    var edges, faces, i, l, maxChange, oldVs, ref2, verts;
    if (iter == null) {
        iter = 200;
    }
    faces = poly.face;
    edges = poly.edges();
    verts = poly.vertex;
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
    return new Polyhedron(poly.name, poly.face, verts);
};

module.exports = {
    dual: dual,
    bevel: bevel,
    trisub: trisub,
    truncate: truncate,
    perspectiva: perspectiva,
    kis: kis,
    ambo: ambo,
    gyro: gyro,
    chamfer: chamfer,
    whirl: whirl,
    quinto: quinto,
    inset: inset,
    extrude: extrude,
    expand: expand,
    hollow: hollow,
    flatten: flatten,
    zirkularize: zirkularize,
    sphericalize: sphericalize,
    canonicalize: canonicalize
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9wby5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsaWNBQUE7SUFBQTs7QUFVQSxNQUE0QixPQUFBLENBQVEsS0FBUixDQUE1QixFQUFFLFNBQUYsRUFBSyxpQkFBTCxFQUFZLGVBQVosRUFBa0I7O0FBQ2xCLE9BQXlOLE9BQUEsQ0FBUSxRQUFSLENBQXpOLEVBQUUsY0FBRixFQUFPLGtCQUFQLEVBQWMsZ0NBQWQsRUFBNEIsMEJBQTVCLEVBQXVDLGdDQUF2QyxFQUFxRCxrQkFBckQsRUFBNEQsY0FBNUQsRUFBaUUsMEJBQWpFLEVBQTRFLGNBQTVFLEVBQWlGLHdCQUFqRixFQUEyRixnQkFBM0YsRUFBaUcsY0FBakcsRUFBc0csd0JBQXRHLEVBQWdILDBCQUFoSCxFQUEySCxvQ0FBM0gsRUFBMkksd0JBQTNJLEVBQXFKLG9CQUFySixFQUE2Six3QkFBN0osRUFBdUssc0JBQXZLLEVBQWdMLG9CQUFoTCxFQUF3TCxjQUF4TCxFQUE2TCw0QkFBN0wsRUFBeU0sa0JBQXpNLEVBQWdOOztBQUM5TSxNQUFROztBQUVWLElBQUEsR0FBTyxPQUFBLENBQVEsU0FBUjs7QUFDUCxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0FBQ1AsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztBQUViLE9BQUEsR0FBVSxTQUFDLEVBQUQsRUFBSyxFQUFMO1dBQVksRUFBQSxHQUFHLEVBQUgsSUFBVSxDQUFHLEVBQUQsR0FBSSxHQUFKLEdBQU8sRUFBVCxDQUFWLElBQTJCLENBQUcsRUFBRCxHQUFJLEdBQUosR0FBTyxFQUFUO0FBQXZDOztBQVFWLE9BQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxVQUFQO0FBRU4sUUFBQTs7UUFGYSxhQUFXOztJQUV4QixPQUFBLEdBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBQTtJQUNWLE9BQUEsR0FBVSxJQUFJLENBQUMsT0FBTCxDQUFBO0lBRVYsU0FBQSxH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SUFXQSxLQUFBLEVBQWdCLEtBWGhCO0lBWUEsT0FBQSxFQUFnQixPQVpoQjtJQWFBLE1BQUEsRUFBZ0IsTUFiaEI7SUFjQSxNQUFBLEVBQWdCLE1BZGhCO0lBZUEsT0FBQSxFQUFnQixPQWZoQjtJQWdCQSxXQUFBLEVBQWdCLFdBaEJoQjtJQWlCQSxZQUFBLEVBQWdCLFlBakJoQjtJQWtCQSxZQUFBLEVBQWdCLFlBbEJoQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAgIFxuICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgIFxuICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAgIDAwMDAwMDAgICAgIFxuIyMjXG5cbiMgUG9seWjDqWRyb25pc21lLCBDb3B5cmlnaHQgMjAxOSwgQW5zZWxtIExldnNrYXlhLCBNSVQgTGljZW5zZVxuXG57IF8sIGNsYW1wLCBrbG9nLCB2YWxpZCB9ID0gcmVxdWlyZSAna3hrJ1xueyBhZGQsIGFuZ2xlLCBjYWxjQ2VudHJvaWQsIGNsb2Nrd2lzZSwgY29weVZlY0FycmF5LCBjcm9zcywgZG90LCBpbnRlcnNlY3QsIG1hZywgbWlkcG9pbnQsIG11bHQsIG5lZywgb25lVGhpcmQsIHBsYW5hcml6ZSwgcG9pbnRQbGFuZURpc3QsIHJheVBsYW5lLCByYXlSYXksIHJlY2VudGVyLCByZXNjYWxlLCByb3RhdGUsIHN1YiwgdGFuZ2VudGlmeSwgdHdlZW4sIHVuaXQgfSA9IHJlcXVpcmUgJy4vbWF0aCdcbnsgbWluIH0gPSBNYXRoXG5cblZlY3QgPSByZXF1aXJlICcuLi92ZWN0J1xuRmxhZyA9IHJlcXVpcmUgJy4vZmxhZydcblBvbHloZWRyb24gPSByZXF1aXJlICcuL3BvbHloZWRyb24nXG5cbm1pZE5hbWUgPSAodjEsIHYyKSAtPiB2MTx2MiBhbmQgXCIje3YxfV8je3YyfVwiIG9yIFwiI3t2Mn1fI3t2MX1cIlxuXG4jIDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAwICAwMDAgIFxuIyAwMDAwMDAgICAgMDAwICAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAwMDAwICBcbiMgMDAwICAgICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5mbGF0dGVuID0gKHBvbHksIGl0ZXJhdGlvbnM9MSkgLT5cbiAgICBcbiAgICBub3JtYWxzID0gcG9seS5ub3JtYWxzKClcbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgICBcbiAgICBub25wbGFuYXIgPSB7fVxuICAgIHZlcnRleGRpc3QgPSB7fVxuICAgIGZvciBmYWNlLGZpIGluIHBvbHkuZmFjZVxuICAgICAgICBmb3IgdmkgaW4gZmFjZVxuICAgICAgICAgICAgZCA9IHBvaW50UGxhbmVEaXN0IHBvbHkudmVydGV4W3ZpXSwgY2VudGVyc1tmaV0sIG5vcm1hbHNbZmldXG4gICAgICAgICAgICBpZiBkID4gMC4wMDAxXG4gICAgICAgICAgICAgICAgbm9ucGxhbmFyW2ZpXSA/PSAwXG4gICAgICAgICAgICAgICAgbm9ucGxhbmFyW2ZpXSArPSBkXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcyA9IGRvdChub3JtYWxzW2ZpXSxzdWIocG9seS52ZXJ0ZXhbdmldLGNlbnRlcnNbZmldKSk+MCBhbmQgMSBvciAtMVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZlcnRleGRpc3RbdmldID89IDBcbiAgICAgICAgICAgICAgICB2ZXJ0ZXhkaXN0W3ZpXSArPSBzKmRcbiAgICBcbiAgICAjIGtsb2cgdmVydGV4ZGlzdFxuICAgIGlmIHZhbGlkIG5vbnBsYW5hclxuICAgICAgICBrbG9nIFwibm9ucGxhbmFyICN7cG9seS5uYW1lfVwiXG4gICAgICAgICMga2xvZyB2ZXJ0ZXhkaXN0XG4gICAgICAgIGZvciBmaSxkIG9mIG5vbnBsYW5hclxuICAgICAgICAgICAgZmkgPSBwYXJzZUludCBmaVxuICAgICAgICAgICAga2xvZyBcImZpICN7Zml9IG51bXYgI3twb2x5LmZhY2VbZmldLmxlbmd0aH0gI3tkfVwiXG4gICAgICAgICAgICBmb3IgdmkgaW4gcG9seS5mYWNlW2ZpXVxuICAgICAgICAgICAgICAgICMga2xvZyBcIiN7dml9IGQ6I3t2ZXJ0ZXhkaXN0W3ZpXX1cIlxuICAgICAgICAgICAgICAgIHNhdmVUb01vdmUgPSB0cnVlXG4gICAgICAgICAgICAgICAgZm9yIG5mIGluIHBvbHkuZmFjZXNBdFZlcnRleCB2aVxuICAgICAgICAgICAgICAgICAgICBpZiBuZiAhPSBmaVxuICAgICAgICAgICAgICAgICAgICAgICAgIyBrbG9nIFwiI3tmaX0gI3tuZn0gdjoje3BvbHkuZmFjZVtuZl0ubGVuZ3RofVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiBwb2x5LmZhY2VbbmZdLmxlbmd0aCA+IDNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzYXZlVG9Nb3ZlID0gZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgICAgIGlmIHNhdmVUb01vdmVcbiAgICAgICAgICAgICAgICAgICAgZCA9IC12ZXJ0ZXhkaXN0W3ZpXVxuICAgICAgICAgICAgICAgICAgICBrbG9nIFwibW92ZSAje3ZpfSBieSAje2R9XCJcbiAgICAgICAgICAgICAgICAgICAgcG9seS52ZXJ0ZXhbdmldID0gYWRkIHBvbHkudmVydGV4W3ZpXSwgbXVsdCBkLCBub3JtYWxzW2ZpXVxuICAgIGVsc2VcbiAgICAgICAga2xvZyBcImZsYWNoIHdpZSAnJ25lIHBsdW5kZXIgI3twb2x5Lm5hbWV9XCJcbiAgICAgICAgXG4gICAgbmV3IFBvbHloZWRyb24gcG9seS5uYW1lLCBwb2x5LmZhY2UsIHBvbHkudmVydGV4XG5cbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICBcblxuaG9sbG93ID0gKHBvbHksIGluc2V0Zj0wLjUsIHRoaWNrbmVzcz0wLjUpIC0+XG5cbiAgICBpbnNldGYgICAgPSBjbGFtcCAwLjEgMC45IGluc2V0ZlxuICAgIG5vcm1hbHMgICA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyAgID0gcG9seS5jZW50ZXJzKClcbiAgICB3aW5ncyAgICAgPSBwb2x5LndpbmdzKClcbiAgICBuZWlnaGJvcnMgPSBwb2x5Lm5laWdoYm9ycygpXG4gICAgXG4gICAgdGhpY2tuZXNzID89IEluZmluaXR5XG4gICAgXG4gICAgc2V0ID0ge31cbiAgICBpbnMgPSAoZSxmKSAtPlxuICAgICAgICBzZXRbZV0gPz0ge31cbiAgICAgICAgaWYgbm90IHNldFtlXVtmXVxuICAgICAgICAgICAgc2V0W2VdW2ZdID0gdHdlZW4gcG9seS52ZXJ0ZXhbZV0sIGNlbnRlcnNbZl0sIGluc2V0ZlxuICAgICAgICBzZXRbZV1bZl1cbiAgICAgICAgXG4gICAgZGV0ID0ge31cbiAgICBpbmQgPSAoZSxmKSAtPlxuICAgICAgICBkZXRbZV0gPz0ge31cbiAgICAgICAgaWYgbm90IGRldFtlXVtmXVxuICAgICAgICAgICAgZGV0W2VdW2ZdID0gYWRkIGlucyhlLGYpLCBtdWx0IC10aGlja25lc3MsIG5vcm1hbHNbZl1cbiAgICAgICAgZGV0W2VdW2ZdXG4gICAgICAgIFxuICAgIGZvciB3aW5nIGluIHdpbmdzXG4gICAgICAgIGZyID0gd2luZ1syXS5mclxuICAgICAgICBmbCA9IHdpbmdbMl0uZmxcbiAgICAgICAgaXIgPSBpbnMgd2luZ1sxXSwgZnJcbiAgICAgICAgaWwgPSBpbnMgd2luZ1sxXSwgZmxcbiAgICAgICAgICBcbiAgICAgICAgbnIgPSBuZWcgbm9ybWFsc1tmcl1cbiAgICAgICAgbmwgPSBuZWcgbm9ybWFsc1tmbF1cbiAgICAgICAgICAgXG4gICAgICAgIGxyID0gcmF5UmF5IFtpciwgYWRkIGlyLCBucl0sIFtpbCwgYWRkIGlsLCBubF1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgdGhpY2tuZXNzID0gbWluIHRoaWNrbmVzcywgbWFnIHN1YiBpciwgbHJcbiAgICAgICAgdGhpY2tuZXNzID0gbWluIHRoaWNrbmVzcywgbWFnIHN1YiBpbCwgbHJcbiAgICAgICAgICAgICAgICBcbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICAgIFxuICAgIGZvciBpIGluIFswLi4ucG9seS52ZXJ0ZXgubGVuZ3RoXVxuICAgICAgICBwID0gcG9seS52ZXJ0ZXhbaV1cbiAgICAgICAgZmxhZy52ZXJ0IFwidiN7aX1cIiBwXG5cbiAgICBmb3IgZmkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmYWNlID0gcG9seS5mYWNlW2ZpXVxuICAgICAgICBmb3IgdmkgaW4gZmFjZVxuICAgICAgICAgICAgZmxhZy52ZXJ0IFwiZmluI3tmaX12I3t2aX1cIiAgICAgaW5zIHZpLCBmaVxuICAgICAgICAgICAgZmxhZy52ZXJ0IFwiZmluZG93biN7Zml9diN7dml9XCIgaW5kIHZpLCBmaVxuICBcbiAgICBmb3IgZmkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ZpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHYyID0gXCJ2I3t2fVwiXG4gICAgICAgICAgICBpMSA9IFwiZmluI3tmaX0je3YxfVwiXG4gICAgICAgICAgICBpMiA9IFwiZmluI3tmaX0je3YyfVwiXG4gICAgICAgICAgICBmMSA9IFwiZmluZG93biN7Zml9I3t2MX1cIlxuICAgICAgICAgICAgZjIgPSBcImZpbmRvd24je2ZpfSN7djJ9XCJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm5hbWUgPSBcInRvcHMje2ZpfSN7djF9XCJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjEsIHYyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYyLCBpMlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBpMiwgaTFcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgaTEsIHYxXG4gICAgICBcbiAgICAgICAgICAgIGZuYW1lID0gXCJzaWRlcyN7Zml9I3t2MX1cIlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBpMSwgaTJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgaTIsIGYyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIGYyLCBmMVxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBmMSwgaTFcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdjEgPSB2MlxuICAgICAgIFxuICAgIHZlcnRleE1hcCA9IHt9XG4gICAgZm9yIHdpbmcgaW4gd2luZ3NcbiAgICAgICAgZnIgPSB3aW5nWzJdLmZyXG4gICAgICAgIGZsID0gd2luZ1syXS5mbCAgICAgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIHYxID0gXCJmaW5kb3duI3tmcn12I3t3aW5nWzBdfVwiXG4gICAgICAgIHYyID0gXCJmaW5kb3duI3tmcn12I3t3aW5nWzFdfVwiXG4gICAgICAgIHYzID0gXCJmaW5kb3duI3tmbH12I3t3aW5nWzFdfVwiXG4gICAgICAgIHY0ID0gXCJmaW5kb3duI3tmbH12I3t3aW5nWzBdfVwiXG4gICAgICAgIFxuICAgICAgICBpZiAwLjAwMSA8IG1hZyBzdWIgaW5kKHdpbmdbMV0sIGZyKSwgaW5kKHdpbmdbMV0sIGZsKVxuICAgICAgICBcbiAgICAgICAgICAgIGZuYW1lID0gXCJzdGl0Y2hfI3tmbH1fI3tmcn1cIlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MSwgdjJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjIsIHYzXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYzLCB2NFxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2NCwgdjFcbiAgICAgICAgICAgIFxuICAgICAgICB2ZXJ0ZXhNYXBbd2luZ1swXV0gPz0ge31cbiAgICAgICAgdmVydGV4TWFwW3dpbmdbMF1dW3dpbmdbMV1dID0gW3YxLCB2NF1cbiAgICAgICAgdmVydGV4TWFwW3dpbmdbMV1dID89IHt9XG4gICAgICAgIHZlcnRleE1hcFt3aW5nWzFdXVt3aW5nWzBdXSA9IFt2MywgdjJdXG5cbiAgICBmb3IgbnMsdmkgaW4gbmVpZ2hib3JzXG4gICAgICAgIGZvciBuaSBpbiBuc1xuICAgICAgICAgICAgZWRnZSA9IHZlcnRleE1hcFt2aV1bbmldXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJzbml0Y2hfI3t2aX1cIiwgZWRnZVswXSwgZWRnZVsxXVxuICBcbiAgICBmbGFnLnRvcG9seSBcImgje3BvbHkubmFtZX1cIlxuXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG5cbmV4cGFuZCA9IChwb2x5LCBhbW91bnQ9MC41KSAtPlxuXG4gICAgYW1vdW50ICAgID0gY2xhbXAgMCAxMCBhbW91bnRcbiAgICBvbGRlZGdlcyAgPSBwb2x5LmVkZ2VzKClcbiAgICBjZW50ZXJzICAgPSBwb2x5LmNlbnRlcnMoKVxuICAgIG5laWdoYm9ycyA9IHBvbHkubmVpZ2hib3JzKClcbiAgICB3aW5ncyAgICAgPSBwb2x5LndpbmdzKClcbiAgICAgICAgXG4gICAgdmVydHMgPSBbXVxuICAgIGZhY2VzID0gW11cbiAgICB2bWFwICA9IHt9XG4gICAgaW1hcCAgPSB7fVxuICAgIG5ld1YgID0gMFxuICAgIGZvciBmaSBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgIGQgPSBzdWIgbXVsdCgxK2Ftb3VudCwgY2VudGVyc1tmaV0pLCBjZW50ZXJzW2ZpXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ZpXVxuICAgICAgICBmYWNlID0gW11cbiAgICAgICAgZm9yIHYsdmkgaW4gZlxuICAgICAgICAgICAgdm1hcFt2XSA/PSBbXVxuICAgICAgICAgICAgdm1hcFt2XS5wdXNoIG5ld1ZcbiAgICAgICAgICAgIGltYXBbbmV3Vl0gPSB2XG4gICAgICAgICAgICB2ZXJ0cy5wdXNoIGFkZCBwb2x5LnZlcnRleFt2XSwgZFxuICAgICAgICAgICAgbmV4dFYgPSBuZXdWKyh2aT09Zi5sZW5ndGgtMSBhbmQgLWYubGVuZ3RoKzEgb3IgMSlcbiAgICAgICAgICAgIGZhY2UucHVzaCBuZXdWXG4gICAgICAgICAgICBuZXdWKytcbiAgICAgICAgZmFjZXMucHVzaCBmYWNlXG4gICAgICAgICAgICBcbiAgICBmb3Igd2luZyBpbiB3aW5nc1xuICAgICAgICBbYSxiXSA9IHdpbmdcbiAgICAgICAgZmFjZSA9IHZtYXBbYV0uY29uY2F0IHZtYXBbYl1cbiAgICAgICAgZmFjZSA9IGZhY2UuZmlsdGVyICh2KSAtPiAodiBpbiBmYWNlc1t3aW5nWzJdLmZyXSkgb3IgKHYgaW4gZmFjZXNbd2luZ1syXS5mbF0pXG4gICAgICAgIGNsb2Nrd2lzZSB2ZXJ0cywgZmFjZVxuICAgICAgICBmYWNlcy5wdXNoIGZhY2VcblxuICAgIGZvciBvLG4gb2Ygdm1hcFxuICAgICAgICBjbG9ja3dpc2UgdmVydHMsIG5cbiAgICAgICAgZmFjZXMucHVzaCBuXG4gICAgICAgIFxuICAgIG5ldyBQb2x5aGVkcm9uIFwiZSN7cG9seS5uYW1lfVwiIGZhY2VzLCB2ZXJ0c1xuXG4jICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG5zcGhlcmljYWxpemUgPSAocG9seSkgLT5cblxuICAgIHZlcnRzID0gW11cbiAgICBmb3IgdmVydGV4LHZpIGluIHBvbHkudmVydGV4XG4gICAgICAgIHZlcnRzLnB1c2ggdW5pdCBwb2x5LnZlcnRleFt2aV1cbiAgICAgICAgXG4gICAgbmV3IFBvbHloZWRyb24gXCJ6I3twb2x5Lm5hbWV9XCIgcG9seS5mYWNlLCB2ZXJ0c1xuXG4jIDAwMDAwMDAgIDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuIyAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiMgICAwMDAgICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgIFxuIyAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcblxuemlya3VsYXJpemUgPSAocG9seSwgZ3Jvdz0xLCBuPTYpIC0+XG5cbiAgICB2ZXJ0aWNlcyA9IFtdXG4gICAgXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgXG4gICAgZm9yIGYsZmkgaW4gcG9seS5mYWNlXG5cbiAgICAgICAgaWYgZi5sZW5ndGggPT0gbiBvciBuID09IDBcbiAgICAgICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgICAgICBheGlzID0gY3Jvc3MgY2VudGVyc1tmaV0sIHBvbHkudmVydGV4W3ZdXG4gICAgICAgICAgICAgICAgYW5nbCA9IGFuZ2xlIGNlbnRlcnNbZmldLCBwb2x5LnZlcnRleFt2XVxuICAgICAgICAgICAgICAgIHZlcnRpY2VzW3ZdID0gcm90YXRlIGNlbnRlcnNbZmldLCBheGlzLCBhbmdsICogZ3Jvd1xuICAgICAgICAgICAgICAgIFxuICAgIHZlcnRzID0gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdLm1hcCAoaSkgLT4gdmVydGljZXNbaV0gPyBwb2x5LnZlcnRleFtpXVxuICAgICBcbiAgICBuZXcgUG9seWhlZHJvbiBcInoje3BvbHkubmFtZX1cIiBwb2x5LmZhY2UsIHZlcnRzXG5cbiMgMDAwMDAwMCAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgXG4jIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuXG5kdWFsID0gKHBvbHkpIC0+XG5cbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICBmYWNlID0gW10gXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdIFxuICAgICAgICBmYWNlW2ldID0ge31cblxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICB2MSA9IGZbLTFdXG4gICAgICAgIGZvciB2MiBpbiBmXG4gICAgICAgICAgICBmYWNlW3YxXVtcInYje3YyfVwiXSA9IFwiI3tpfVwiXG4gICAgICAgICAgICB2MSA9IHYyXG4gIFxuICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZmxhZy52ZXJ0IFwiI3tpfVwiIGNlbnRlcnNbaV1cbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIHYxID0gZlstMV1cbiAgICAgICAgZm9yIHYyIGluIGZcbiAgICAgICAgICAgIGZsYWcuZWRnZSB2MSwgZmFjZVt2Ml1bXCJ2I3t2MX1cIl0sIFwiI3tpfVwiXG4gICAgICAgICAgICB2MSA9IHYyXG4gIFxuICAgIGRwb2x5ID0gZmxhZy50b3BvbHkoKVxuICBcbiAgICBzb3J0RiA9IFtdXG4gICAgZm9yIGYgaW4gZHBvbHkuZmFjZVxuICAgICAgICBrID0gaW50ZXJzZWN0IHBvbHkuZmFjZVtmWzBdXSwgcG9seS5mYWNlW2ZbMV1dLCBwb2x5LmZhY2VbZlsyXV1cbiAgICAgICAgc29ydEZba10gPSBmXG4gICAgZHBvbHkuZmFjZSA9IHNvcnRGXG4gIFxuICAgIGlmIHBvbHkubmFtZVswXSAhPSBcImRcIlxuICAgICAgICBkcG9seS5uYW1lID0gXCJkI3twb2x5Lm5hbWV9XCJcbiAgICBlbHNlIFxuICAgICAgICBkcG9seS5uYW1lID0gcG9seS5uYW1lLnNsaWNlIDFcbiAgXG4gICAgZHBvbHlcblxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4jIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICBcbiMgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgMDAwMCAgXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICBcblxuIyBLaXMgKGFiYnJldmlhdGVkIGZyb20gdHJpYWtpcykgdHJhbnNmb3JtcyBhbiBOLXNpZGVkIGZhY2UgaW50byBhbiBOLXB5cmFtaWQgcm9vdGVkIGF0IHRoZVxuIyBzYW1lIGJhc2UgdmVydGljZXMuIG9ubHkga2lzIG4tc2lkZWQgZmFjZXMsIGJ1dCBuPT0wIG1lYW5zIGtpcyBhbGwuXG5cbmtpcyA9IChwb2x5LCBhcGV4ZGlzdD0wLjUsIG49MCkgLT5cblxuICAgIGFwZXhkaXN0ID0gY2xhbXAgLTEgMTAgYXBleGRpc3RcbiAgICBcbiAgICBpZiBhcGV4ZGlzdCA8IDBcbiAgICAgICAgYXBleGRpc3QgPSBhcGV4ZGlzdCAqIHBvbHkubWluRmFjZURpc3QoKVxuICAgIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgcG9seS52ZXJ0ZXhbaV1cbiAgXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm91bmRBbnkgPSBmYWxzZVxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICB2MiA9IFwidiN7dn1cIlxuICAgICAgICAgICAgaWYgZi5sZW5ndGggPT0gbiBvciBuID09IDBcbiAgICAgICAgICAgICAgICBmb3VuZEFueSA9IHRydWU7XG4gICAgICAgICAgICAgICAgYXBleCA9IFwiYXBleCN7aX1cIlxuICAgICAgICAgICAgICAgIGZuYW1lID0gXCIje2l9I3t2MX1cIlxuXG4gICAgICAgICAgICAgICAgZmxhZy52ZXJ0IGFwZXgsIGFkZCBjZW50ZXJzW2ldLCBtdWx0IGFwZXhkaXN0LCBub3JtYWxzW2ldXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCAgIHYxLCAgIHYyXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCAgIHYyLCBhcGV4XG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBhcGV4LCAgIHYxXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlIFwiI3tpfVwiLCB2MSwgdjJcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdjEgPSB2MlxuICBcbiAgICBpZiBub3QgZm91bmRBbnlcbiAgICAgICAga2xvZyBcIk5vICN7bn0tZm9sZCBjb21wb25lbnRzIHdlcmUgZm91bmQuXCJcbiAgXG4gICAgZmxhZy50b3BvbHkgXCJrI3tufSN7cG9seS5uYW1lfVwiXG5cbiMgMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcblxudHJ1bmNhdGUgPSAocG9seSwgZmFjdG9yPTAuNSkgLT5cblxuICAgIGZhY3RvciA9IGNsYW1wIDAgMSBmYWN0b3JcbiAgICBlZGdlTWFwID0ge31cbiAgICBcbiAgICBudW1GYWNlcyAgICA9IHBvbHkuZmFjZS5sZW5ndGhcbiAgICBudW1WZXJ0aWNlcyA9IHBvbHkudmVydGV4Lmxlbmd0aFxuICAgIG5laWdoYm9ycyAgID0gcG9seS5uZWlnaGJvcnMoKVxuICAgIFxuICAgIGRlcHRoID0gMC41ICogZmFjdG9yICogcG9seS5taW5FZGdlTGVuZ3RoKClcbiAgICBcbiAgICBmb3IgdmVydGV4SW5kZXggaW4gWzAuLi5udW1WZXJ0aWNlc11cbiAgICAgICAgXG4gICAgICAgIGVkZ2VNYXBbdmVydGV4SW5kZXhdID89IHt9XG4gICAgICAgIGZhY2UgPSBbXVxuICAgICAgICBcbiAgICAgICAgbmwgPSBuZWlnaGJvcnNbdmVydGV4SW5kZXhdLmxlbmd0aFxuICAgICAgICBmb3IgaWkgaW4gWzAuLi5ubF1cbiAgICAgICAgICAgIG5pID0gbmVpZ2hib3JzW3ZlcnRleEluZGV4XVtpaV1cbiAgICAgICAgICAgIGVkZ2VNYXBbdmVydGV4SW5kZXhdW25pXSA9IHBvbHkudmVydGV4Lmxlbmd0aFxuICAgICAgICAgICAgdnAgPSBwb2x5LmVkZ2UgdmVydGV4SW5kZXgsIG5pXG4gICAgICAgICAgICB2cC5ub3JtYWxpemUoKVxuICAgICAgICAgICAgdnAuc2NhbGVJblBsYWNlIGRlcHRoXG4gICAgICAgICAgICB2cC5hZGRJblBsYWNlIHBvbHkudmVydCB2ZXJ0ZXhJbmRleFxuICAgICAgICAgICAgZmFjZS5wdXNoIHBvbHkudmVydGV4Lmxlbmd0aFxuICAgICAgICAgICAgcG9seS52ZXJ0ZXgucHVzaCBbdnAueCwgdnAueSwgdnAuel1cbiAgICAgICAgICAgIFxuICAgICAgICBwb2x5LmZhY2UucHVzaCBmYWNlXG4gICAgXG4gICAgZm9yIGZpIGluIFswLi4ubnVtRmFjZXNdXG4gICAgICAgIGZhY2UgPSBwb2x5LmZhY2VbZmldXG4gICAgICAgIG5ld0ZhY2UgPSBbXVxuICAgICAgICBmb3IgdmkgaW4gWzAuLi5mYWNlLmxlbmd0aF1cbiAgICAgICAgICAgIG5pID0gKHZpKzEpICUgZmFjZS5sZW5ndGhcbiAgICAgICAgICAgIG5ld0ZhY2UucHVzaCBlZGdlTWFwW2ZhY2VbdmldXVtmYWNlW25pXV1cbiAgICAgICAgICAgIGlmIGZhY3RvciA8IDFcbiAgICAgICAgICAgICAgICBuZXdGYWNlLnB1c2ggZWRnZU1hcFtmYWNlW25pXV1bZmFjZVt2aV1dXG4gICAgICAgIHBvbHkuZmFjZVtmaV0gPSBuZXdGYWNlXG4gICAgICBcbiAgICBwb2x5LnZlcnRleC5zcGxpY2UgMCwgbnVtVmVydGljZXNcbiAgICBmb3IgZmFjZSBpbiBwb2x5LmZhY2VcbiAgICAgICAgZm9yIGkgaW4gWzAuLi5mYWNlLmxlbmd0aF1cbiAgICAgICAgICAgIGZhY2VbaV0gLT0gbnVtVmVydGljZXNcbiAgICAgICAgXG4gICAgcG9seVxuICAgIFxuIyAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIFxuXG4jIFRvcG9sb2dpY2FsIFwidHdlZW5cIiBiZXR3ZWVuIGEgcG9seWhlZHJvbiBhbmQgaXRzIGR1YWwgcG9seWhlZHJvbi5cblxuYW1ibyA9IChwb2x5KSAtPlxuICAgIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gIFxuICAgIGZvciBpIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UoLTIpXG4gICAgICAgIGZvciB2MyBpbiBmXG4gICAgICAgICAgICBpZiB2MSA8IHYyXG4gICAgICAgICAgICAgICAgZmxhZy52ZXJ0IG1pZE5hbWUodjEsdjIpLCBtaWRwb2ludCBwb2x5LnZlcnRleFt2MV0sIHBvbHkudmVydGV4W3YyXVxuXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJvcmlnI3tpfVwiICBtaWROYW1lKHYxLHYyKSwgbWlkTmFtZSh2Mix2MylcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImR1YWwje3YyfVwiIG1pZE5hbWUodjIsdjMpLCBtaWROYW1lKHYxLHYyKVxuXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gIFxuICAgIGZsYWcudG9wb2x5IFwiYSN7cG9seS5uYW1lfVwiXG5cbmJldmVsID0gKHBvbHksIGZhY3Rvcj0wLjUpIC0+XG4gICAgXG4gICAgcCA9IHRydW5jYXRlIGFtYm8ocG9seSksIGZhY3RvclxuICAgIHAubmFtZSA9IFwiYiN7cG9seS5uYW1lfVwiXG4gICAgcFxuICAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuXG5jaGFtZmVyID0gKHBvbHksIGZhY3Rvcj0wLjUpIC0+XG4gICAgXG4gICAgZmFjdG9yICA9IGNsYW1wIDAuMDAxIDAuOTk1IGZhY3RvclxuICAgIGZsYWcgICAgPSBuZXcgRmxhZygpXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgd2luZ3MgICA9IHBvbHkud2luZ3MoKVxuICAgICAgICBcbiAgICBtaW5FZGdlTGVuZ3RoID0gSW5maW5pdHlcbiAgICBcbiAgICBmb3IgZWRnZSBpbiB3aW5nc1xuICAgICAgICBlMCA9IHBvbHkudmVydGV4W2VkZ2VbMF1dXG4gICAgICAgIGUxID0gcG9seS52ZXJ0ZXhbZWRnZVsxXV1cbiAgICAgICAgZWQgPSB1bml0IHN1YiBlMSwgZTBcbiAgICAgICAgXG4gICAgICAgIG5yID0gdW5pdCBzdWIgcG9seS52ZXJ0ZXhbZWRnZVsyXS5ucl0sIGUxXG4gICAgICAgIHByID0gdW5pdCBzdWIgcG9seS52ZXJ0ZXhbZWRnZVsyXS5wcl0sIGUwXG4gICAgICAgIGNyID0gcmF5UmF5IFtlMSwgbXVsdCAwLjUsIGFkZCBhZGQoZTEsIG5yKSwgc3ViKGUxLCBlZCldLFxuICAgICAgICAgICAgICAgICAgICBbZTAsIG11bHQgMC41LCBhZGQgYWRkKGUwLCBwciksIGFkZChlMCwgZWQpXVxuXG4gICAgICAgIGVsID0gbWFnIHN1YiBlMSwgcmF5UmF5IFtlMSwgYWRkKGUxLCBucildLCBbY3IsIGFkZChjciwgZWQpXVxuICAgICAgICBtaW5FZGdlTGVuZ3RoID0gbWluIG1pbkVkZ2VMZW5ndGgsIGVsXG5cbiAgICAgICAgZWwgPSBtYWcgc3ViIGUwLCByYXlSYXkgW2UwLCBhZGQoZTAsIHByKV0sIFtjciwgc3ViKGNyLCBlZCldXG4gICAgICAgIG1pbkVkZ2VMZW5ndGggPSBtaW4gbWluRWRnZUxlbmd0aCwgZWxcbiAgICAgICAgXG4gICAgbWluRWRnZUxlbmd0aCAqPSBmYWN0b3JcbiAgICAgICAgXG4gICAgbW92ZWQgPSB7fVxuICAgIGZvciBlZGdlIGluIHdpbmdzXG4gICAgICAgIGUwICA9IHBvbHkudmVydGV4W2VkZ2VbMF1dXG4gICAgICAgIGUxICA9IHBvbHkudmVydGV4W2VkZ2VbMV1dXG4gICAgICAgIHJyID0gW1xuICAgICAgICAgICAgYWRkKGUwLCBtdWx0IG1pbkVkZ2VMZW5ndGgsIHVuaXQgc3ViIHBvbHkudmVydGV4W2VkZ2VbMl0ucHJdLCBlMCksXG4gICAgICAgICAgICBhZGQoZTEsIG11bHQgbWluRWRnZUxlbmd0aCwgdW5pdCBzdWIgcG9seS52ZXJ0ZXhbZWRnZVsyXS5ucl0sIGUxKV1cbiAgICAgICAgbHIgPSBbXG4gICAgICAgICAgICBhZGQoZTAsIG11bHQgbWluRWRnZUxlbmd0aCwgdW5pdCBzdWIgcG9seS52ZXJ0ZXhbZWRnZVsyXS5wbF0sIGUwKSxcbiAgICAgICAgICAgIGFkZChlMSwgbXVsdCBtaW5FZGdlTGVuZ3RoLCB1bml0IHN1YiBwb2x5LnZlcnRleFtlZGdlWzJdLm5sXSwgZTEpXVxuICAgICAgICAgICAgXG4gICAgICAgIG1vdmVkW1wiI3tlZGdlWzFdfeKWuCN7ZWRnZVswXX1sXCJdID0gcnJcbiAgICAgICAgbW92ZWRbXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfXJcIl0gPSByclxuICAgICAgICBtb3ZlZFtcIiN7ZWRnZVsxXX3ilrgje2VkZ2VbMF19clwiXSA9IGxyXG4gICAgICAgIG1vdmVkW1wiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1sXCJdID0gbHJcbiAgICAgICAgICAgIFxuICAgIGZvciBlZGdlIGluIHdpbmdzXG4gICAgICAgIGUwICAgPSBwb2x5LnZlcnRleFtlZGdlWzBdXVxuICAgICAgICBlMSAgID0gcG9seS52ZXJ0ZXhbZWRnZVsxXV1cbiAgICAgICAgXG4gICAgICAgIG5mICA9IFwiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1cIiBcbiAgICAgICAgbl9oID0gXCIje2VkZ2VbMV19XCJcbiAgICAgICAgbl90ID0gXCIje2VkZ2VbMF19XCJcbiAgICAgICAgXG4gICAgICAgIG5uciA9IFwiI3tuX2h94pa4I3tlZGdlWzJdLmZyfVwiXG4gICAgICAgIG5ubCA9IFwiI3tuX2h94pa4I3tlZGdlWzJdLmZsfVwiXG4gICAgICAgIG5wciA9IFwiI3tuX3R94pa4I3tlZGdlWzJdLmZyfVwiXG4gICAgICAgIG5wbCA9IFwiI3tuX3R94pa4I3tlZGdlWzJdLmZsfVwiICAgICAgICBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgbnIgPSByYXlSYXkgbW92ZWRbXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfXJcIl0sIG1vdmVkW1wiI3tlZGdlWzFdfeKWuCN7ZWRnZVsyXS5ucn1yXCJdXG4gICAgICAgIG5sID0gcmF5UmF5IG1vdmVkW1wiI3tlZGdlWzBdfeKWuCN7ZWRnZVsxXX1sXCJdLCBtb3ZlZFtcIiN7ZWRnZVsxXX3ilrgje2VkZ2VbMl0ubmx9bFwiXVxuICAgICAgICBwciA9IHJheVJheSBtb3ZlZFtcIiN7ZWRnZVswXX3ilrgje2VkZ2VbMV19clwiXSwgbW92ZWRbXCIje2VkZ2VbMl0ucHJ94pa4I3tlZGdlWzBdfXJcIl1cbiAgICAgICAgcGwgPSByYXlSYXkgbW92ZWRbXCIje2VkZ2VbMF194pa4I3tlZGdlWzFdfWxcIl0sIG1vdmVkW1wiI3tlZGdlWzJdLnBsfeKWuCN7ZWRnZVswXX1sXCJdXG4gICAgICAgIFxuICAgICAgICBwbWlkID0gbWlkcG9pbnQgcGwsIHByXG4gICAgICAgIG5taWQgPSBtaWRwb2ludCBubCwgbnJcbiAgICAgICAgY21pZCA9IG1pZHBvaW50IHBtaWQsIG5taWRcbiAgICAgICAgcG5tICA9IGNyb3NzIHN1YihwbWlkLG5taWQpLCBzdWIocGwscHIpXG5cbiAgICAgICAgaGVhZCA9IHJheVBsYW5lIFswIDAgMF0sIGUxLCBjbWlkLCBwbm1cbiAgICAgICAgdGFpbCA9IHJheVBsYW5lIFswIDAgMF0sIGUwLCBjbWlkLCBwbm1cbiAgICAgICAgXG4gICAgICAgIGZsYWcudmVydCBuX2gsIGhlYWRcbiAgICAgICAgZmxhZy52ZXJ0IG5fdCwgdGFpbFxuICAgICAgICBmbGFnLnZlcnQgbm5yLCBuclxuICAgICAgICBmbGFnLnZlcnQgbm5sLCBubFxuICAgICAgICBmbGFnLnZlcnQgbnBsLCBwbFxuICAgICAgICBmbGFnLnZlcnQgbnByLCBwclxuXG4gICAgICAgIGZsYWcuZWRnZSBuZiwgbl9oLCBubnJcbiAgICAgICAgZmxhZy5lZGdlIG5mLCBubnIsIG5wclxuICAgICAgICBmbGFnLmVkZ2UgbmYsIG5wciwgbl90XG4gICAgICAgIGZsYWcuZWRnZSBuZiwgbl90LCBucGxcbiAgICAgICAgZmxhZy5lZGdlIG5mLCBucGwsIG5ubFxuICAgICAgICBmbGFnLmVkZ2UgbmYsIG5ubCwgbl9oXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGZsYWcuZWRnZSBcIiN7ZWRnZVsyXS5mcn1cIiBucHIsIG5uclxuICAgICAgICBmbGFnLmVkZ2UgXCIje2VkZ2VbMl0uZmx9XCIgbm5sLCBucGxcbiAgICAgICAgXG4gICAgZmxhZy50b3BvbHkgXCJjI3twb2x5Lm5hbWV9XCJcblxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwMCAgIDAwMCAgICAgIFxuIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIFxuIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuXG53aGlybCA9IChwb2x5LCBuPTApIC0+XG5cbiAgICBmbGFnID0gbmV3IEZsYWcoKVxuICBcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGV4Lmxlbmd0aF1cbiAgICAgICAgZmxhZy52ZXJ0IFwidiN7aX1cIiB1bml0IHBvbHkudmVydGV4W2ldXG5cbiAgICBjZW50ZXJzID0gcG9seS5jZW50ZXJzKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSAtMlxuICAgICAgICBmb3IgaiBpbiBbMC4uLmYubGVuZ3RoXVxuICAgICAgICAgICAgdiA9IGZbal1cbiAgICAgICAgICAgIHYzID0gdlxuICAgICAgICAgICAgdjFfMiA9IG9uZVRoaXJkIHBvbHkudmVydGV4W3YxXSwgcG9seS52ZXJ0ZXhbdjJdXG4gICAgICAgICAgICBmbGFnLnZlcnQodjErXCJ+XCIrdjIsIHYxXzIpXG4gICAgICAgICAgICBjdjFuYW1lID0gXCJjZW50ZXIje2l9fiN7djF9XCJcbiAgICAgICAgICAgIGN2Mm5hbWUgPSBcImNlbnRlciN7aX1+I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy52ZXJ0IGN2MW5hbWUsIHVuaXQgb25lVGhpcmQgY2VudGVyc1tpXSwgdjFfMlxuICAgICAgICAgICAgZm5hbWUgPSBpK1wiZlwiK3YxXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIGN2MW5hbWUsICAgdjErXCJ+XCIrdjJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjErXCJ+XCIrdjIsIHYyK1wiflwiK3YxIFxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MitcIn5cIit2MSwgXCJ2I3t2Mn1cIiAgXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIFwidiN7djJ9XCIsICB2MitcIn5cIit2MyBcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgdjIrXCJ+XCIrdjMsIGN2Mm5hbWVcbiAgICAgICAgICAgIGZsYWcuZWRnZSBmbmFtZSwgY3YybmFtZSwgICBjdjFuYW1lXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJjI3tpfVwiLCBjdjFuYW1lLCBjdjJuYW1lXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M11cbiAgXG4gICAgY2Fub25pY2FsaXplIGZsYWcudG9wb2x5IFwidyN7cG9seS5uYW1lfVwiXG5cbiMgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiMgMDAwICAgICAgICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgMDAwICAwMDAwICAgIDAwMDAwICAgIDAwMDAwMDAgICAgMDAwICAgMDAwICBcbiMgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiMgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcblxuZ3lybyA9IChwb2x5KSAtPlxuXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgdW5pdCBwb2x5LnZlcnRleFtpXVxuXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIGZsYWcudmVydCBcImNlbnRlciN7aX1cIiB1bml0IGNlbnRlcnNbaV1cbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIFt2MSwgdjJdID0gZi5zbGljZSgtMilcbiAgICAgICAgZm9yIGogaW4gWzAuLi5mLmxlbmd0aF1cbiAgICAgICAgICAgIHYgPSBmW2pdXG4gICAgICAgICAgICB2MyA9IHZcbiAgICAgICAgICAgIGZsYWcudmVydCB2MStcIn5cIit2Miwgb25lVGhpcmQgcG9seS52ZXJ0ZXhbdjFdLHBvbHkudmVydGV4W3YyXVxuICAgICAgICAgICAgZm5hbWUgPSBpK1wiZlwiK3YxXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIFwiY2VudGVyI3tpfVwiICB2MStcIn5cIit2MlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MStcIn5cIit2MiwgIHYyK1wiflwiK3YxXG4gICAgICAgICAgICBmbGFnLmVkZ2UgZm5hbWUsIHYyK1wiflwiK3YxLCAgXCJ2I3t2Mn1cIlxuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCBcInYje3YyfVwiICAgICB2MitcIn5cIit2M1xuICAgICAgICAgICAgZmxhZy5lZGdlIGZuYW1lLCB2MitcIn5cIit2MywgIFwiY2VudGVyI3tpfVwiXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gIFxuICAgIGNhbm9uaWNhbGl6ZSBmbGFnLnRvcG9seSBcImcje3BvbHkubmFtZX1cIlxuICAgIFxuIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgXG4jIDAwMCAwMCAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIFxuIyAwMDAgMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICBcbiMgIDAwMDAwIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgXG5cbnF1aW50byA9IChwb2x5KSAtPiAjIGNyZWF0ZXMgYSBwZW50YWdvbiBmb3IgZXZlcnkgdmVydGV4IGFuZCBhIG5ldyBpbnNldCBmYWNlXG4gICAgXG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIGNlbnRyb2lkID0gY2FsY0NlbnRyb2lkIGYubWFwIChpZHgpIC0+IHBvbHkudmVydGV4W2lkeF1cblxuICAgICAgICBbdjEsIHYyXSA9IGYuc2xpY2UgLTJcbiAgICAgICAgZm9yIHYzIGluIGZcbiAgICAgICAgICAgIG1pZHB0ID0gbWlkcG9pbnQgcG9seS52ZXJ0ZXhbdjFdLCBwb2x5LnZlcnRleFt2Ml1cbiAgICAgICAgICAgIGlubmVycHQgPSBtaWRwb2ludCBtaWRwdCwgY2VudHJvaWRcbiAgICAgICAgICAgIGZsYWcudmVydCBtaWROYW1lKHYxLHYyKSwgbWlkcHRcbiAgICAgICAgICAgIGZsYWcudmVydCBcImlubmVyXyN7aX1fXCIgKyBtaWROYW1lKHYxLHYyKSwgaW5uZXJwdFxuICAgICAgICAgICAgZmxhZy52ZXJ0IFwiI3t2Mn1cIiBwb2x5LnZlcnRleFt2Ml1cbiAgICAgICAgICBcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9XyN7djJ9XCIsIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYxLCB2MiksIG1pZE5hbWUodjEsIHYyKVxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7aX1fI3t2Mn1cIiwgbWlkTmFtZSh2MSwgdjIpLCBcIiN7djJ9XCJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9XyN7djJ9XCIsIFwiI3t2Mn1cIiwgbWlkTmFtZSh2MiwgdjMpXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3tpfV8je3YyfVwiLCBtaWROYW1lKHYyLCB2MyksIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYyLCB2MylcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9XyN7djJ9XCIsIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYyLCB2MyksIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYxLCB2MilcbiAgICAgIFxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZl9pbl8je2l9XCIsIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYxLCB2MiksIFwiaW5uZXJfI3tpfV9cIittaWROYW1lKHYyLCB2MylcbiAgICAgIFxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICBcbiAgICBmbGFnLnRvcG9seSBcInEje3BvbHkubmFtZX1cIlxuXG4jIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwMFxuIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICBcbiMgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgMDAwICAgXG4jIDAwMCAgMDAwICAwMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgIFxuIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAwICAgICAwMDAgICBcblxuaW5zZXQgPSAocG9seSwgaW5zZXQ9MC41LCBwb3BvdXQ9LTAuMiwgbj0wKSAtPlxuICBcbiAgICBpbnNldCA9IGNsYW1wIDAuMjUgMC45OSBpbnNldFxuICAgIHBvcG91dCA9IG1pbiBwb3BvdXQsIGluc2V0XG4gICAgZmxhZyA9IG5ldyBGbGFnKClcbiAgICBmb3IgaSBpbiBbMC4uLnBvbHkudmVydGV4Lmxlbmd0aF1cbiAgICAgICAgcCA9IHBvbHkudmVydGV4W2ldXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgcFxuXG4gICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIGlmIGYubGVuZ3RoID09IG4gb3IgbiA9PSAwXG4gICAgICAgICAgICBmb3IgdiBpbiBmXG4gICAgICAgICAgICAgICAgZmxhZy52ZXJ0IFwiZiN7aX12I3t2fVwiIGFkZCB0d2Vlbihwb2x5LnZlcnRleFt2XSxjZW50ZXJzW2ldLGluc2V0KSwgbXVsdChwb3BvdXQsbm9ybWFsc1tpXSlcbiAgXG4gICAgZm91bmRBbnkgPSBmYWxzZSAjIGFsZXJ0IGlmIGRvbid0IGZpbmQgYW55XG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ldXG4gICAgICAgIHYxID0gXCJ2I3tmW2YubGVuZ3RoLTFdfVwiXG4gICAgICAgIGZvciB2IGluIGZcbiAgICAgICAgICAgIHYyID0gXCJ2I3t2fVwiO1xuICAgICAgICAgICAgaWYgZi5sZW5ndGggPT0gbiBvciBuID09IDBcbiAgICAgICAgICAgICAgICBmb3VuZEFueSA9IHRydWVcbiAgICAgICAgICAgICAgICBmbmFtZSA9IGkgKyB2MVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZShmbmFtZSwgICAgICB2MSwgICAgICAgdjIpXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlKGZuYW1lLCAgICAgIHYyLCAgICAgICBcImYje2l9I3t2Mn1cIilcbiAgICAgICAgICAgICAgICBmbGFnLmVkZ2UoZm5hbWUsIFwiZiN7aX0je3YyfVwiLCAgXCJmI3tpfSN7djF9XCIpXG4gICAgICAgICAgICAgICAgZmxhZy5lZGdlKGZuYW1lLCBcImYje2l9I3t2MX1cIiwgIHYxKVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZShcImV4I3tpfVwiLCBcImYje2l9I3t2MX1cIiwgIFwiZiN7aX0je3YyfVwiKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGZsYWcuZWRnZShpLCB2MSwgdjIpICBcbiAgICAgICAgICAgIHYxPXYyXG4gIFxuICAgIGlmIG5vdCBmb3VuZEFueVxuICAgICAgICBrbG9nIFwiTm8gI3tufS1mb2xkIGNvbXBvbmVudHMgd2VyZSBmb3VuZC5cIlxuICBcbiAgICBmbGFnLnRvcG9seSBcIm4je259I3twb2x5Lm5hbWV9XCJcblxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDBcblxuZXh0cnVkZSA9IChwb2x5LCBwb3BvdXQ9MSwgaW5zZXRmPTAuNSwgbj0wKSAtPlxuICAgIG5ld3BvbHkgPSBpbnNldCBwb2x5LCBpbnNldGYsIHBvcG91dCwgblxuICAgIG5ld3BvbHkubmFtZSA9IFwieCN7bn0je3BvbHkubmFtZX1cIlxuICAgIG5ld3BvbHlcblxuIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAwMFxuIyAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4jIDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgIDAgICAgICAwMDAgICAwMDBcblxucGVyc3BlY3RpdmEgPSAocG9seSkgLT4gIyBhbiBvcGVyYXRpb24gcmV2ZXJzZS1lbmdpbmVlcmVkIGZyb20gUGVyc3BlY3RpdmEgQ29ycG9ydW0gUmVndWxhcml1bVxuXG4gICAgY2VudGVycyA9IHBvbHkuY2VudGVycygpXG4gIFxuICAgIGZsYWcgPSBuZXcgRmxhZygpXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LnZlcnRleC5sZW5ndGhdXG4gICAgICAgIGZsYWcudmVydCBcInYje2l9XCIgcG9seS52ZXJ0ZXhbaV1cbiAgXG4gICAgZm9yIGkgaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBcbiAgICAgICAgZiA9IHBvbHkuZmFjZVtpXVxuICAgICAgICB2MSA9IFwidiN7ZltmLmxlbmd0aC0yXX1cIlxuICAgICAgICB2MiA9IFwidiN7ZltmLmxlbmd0aC0xXX1cIlxuICAgICAgICB2ZXJ0MSA9IHBvbHkudmVydGV4W2ZbZi5sZW5ndGgtMl1dXG4gICAgICAgIHZlcnQyID0gcG9seS52ZXJ0ZXhbZltmLmxlbmd0aC0xXV1cbiAgICAgICAgZm9yIHYgaW4gZlxuICAgICAgICAgICAgdjMgPSBcInYje3Z9XCJcbiAgICAgICAgICAgIHZlcnQzID0gcG9seS52ZXJ0ZXhbdl1cbiAgICAgICAgICAgIHYxMiA9IHYxK1wiflwiK3YyXG4gICAgICAgICAgICB2MjEgPSB2MitcIn5cIit2MVxuICAgICAgICAgICAgdjIzID0gdjIrXCJ+XCIrdjNcbiAgICAgIFxuICAgICAgICAgICAgIyBvbiBlYWNoIE5mYWNlLCBOIG5ldyBwb2ludHMgaW5zZXQgZnJvbSBlZGdlIG1pZHBvaW50cyB0b3dhcmRzIGNlbnRlciA9IFwic3RlbGxhdGVkXCIgcG9pbnRzXG4gICAgICAgICAgICBmbGFnLnZlcnQgdjEyLCBtaWRwb2ludCBtaWRwb2ludCh2ZXJ0MSx2ZXJ0MiksIGNlbnRlcnNbaV0gXG4gICAgICBcbiAgICAgICAgICAgICMgaW5zZXQgTmZhY2UgbWFkZSBvZiBuZXcsIHN0ZWxsYXRlZCBwb2ludHNcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImluI3tpfVwiIHYxMiwgdjIzXG4gICAgICBcbiAgICAgICAgICAgICMgbmV3IHRyaSBmYWNlIGNvbnN0aXR1dGluZyB0aGUgcmVtYWluZGVyIG9mIHRoZSBzdGVsbGF0ZWQgTmZhY2VcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9I3t2Mn1cIiB2MjMsIHYxMlxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7aX0je3YyfVwiIHYxMiwgdjJcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje2l9I3t2Mn1cIiB2MiwgIHYyM1xuICAgICAgXG4gICAgICAgICAgICAjIG9uZSBvZiB0aGUgdHdvIG5ldyB0cmlhbmdsZXMgcmVwbGFjaW5nIG9sZCBlZGdlIGJldHdlZW4gdjEtPnYyXG4gICAgICAgICAgICBmbGFnLmVkZ2UgXCJmI3t2MTJ9XCIgdjEsICB2MjFcbiAgICAgICAgICAgIGZsYWcuZWRnZSBcImYje3YxMn1cIiB2MjEsIHYxMlxuICAgICAgICAgICAgZmxhZy5lZGdlIFwiZiN7djEyfVwiIHYxMiwgdjFcbiAgICAgIFxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICAgICAgICAgICAgW3ZlcnQxLCB2ZXJ0Ml0gPSBbdmVydDIsIHZlcnQzXVxuICBcbiAgICBmbGFnLnRvcG9seSBcIlAje3BvbHkubmFtZX1cIlxuXG4jIDAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jICAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG5cbnRyaXN1YiA9IChwb2x5LCBuPTIpIC0+XG4gICAgXG4gICAgZm9yIGZuIGluIFswLi4ucG9seS5mYWNlLmxlbmd0aF1cbiAgICAgICAgaWYgcG9seS5mYWNlW2ZuXS5sZW5ndGggIT0gM1xuICAgICAgICAgICAgcmV0dXJuIHBvbHlcbiAgXG4gICAgdmVydHMgPSBbXVxuICAgIHZtYXAgPSB7fVxuICAgIHBvcyA9IDBcbiAgICBmb3IgZm4gaW4gWzAuLi5wb2x5LmZhY2UubGVuZ3RoXVxuICAgICAgICBmID0gcG9seS5mYWNlW2ZuXVxuICAgICAgICBbaTEsIGkyLCBpM10gPSBmLnNsaWNlIC0zXG4gICAgICAgIHYxID0gcG9seS52ZXJ0ZXhbaTFdXG4gICAgICAgIHYyID0gcG9seS52ZXJ0ZXhbaTJdXG4gICAgICAgIHYzID0gcG9seS52ZXJ0ZXhbaTNdXG4gICAgICAgIHYyMSA9IHN1YiB2MiwgdjFcbiAgICAgICAgdjMxID0gc3ViIHYzLCB2MVxuICAgICAgICBmb3IgaSBpbiBbMC4ubl1cbiAgICAgICAgICAgIGZvciBqIGluIFswLi5uLWldXG4gICAgICAgICAgICAgICAgdiA9IGFkZCBhZGQodjEsIG11bHQoaS9uLCB2MjEpKSwgbXVsdChqL24sIHYzMSlcbiAgICAgICAgICAgICAgICB2bWFwW1widiN7Zm59LSN7aX0tI3tqfVwiXSA9IHBvcysrXG4gICAgICAgICAgICAgICAgdmVydHMucHVzaCB2XG4gIFxuICAgIEVQU0lMT05fQ0xPU0UgPSAxLjBlLThcbiAgICB1bmlxVnMgPSBbXVxuICAgIG5ld3BvcyA9IDBcbiAgICB1bmlxbWFwID0ge31cbiAgICBmb3IgdixpIGluIHZlcnRzXG4gICAgICAgIGlmIGkgaW4gdW5pcW1hcCB0aGVuIGNvbnRpbnVlICMgYWxyZWFkeSBtYXBwZWRcbiAgICAgICAgdW5pcW1hcFtpXSA9IG5ld3Bvc1xuICAgICAgICB1bmlxVnMucHVzaCB2XG4gICAgICAgIGZvciBqIGluIFtpKzEuLi52ZXJ0cy5sZW5ndGhdXG4gICAgICAgICAgICB3ID0gdmVydHNbal1cbiAgICAgICAgICAgIGlmIG1hZyhzdWIodiwgdykpIDwgRVBTSUxPTl9DTE9TRVxuICAgICAgICAgICAgICAgIHVuaXFtYXBbal0gPSBuZXdwb3NcbiAgICAgICAgbmV3cG9zKytcbiAgXG4gICAgZmFjZXMgPSBbXVxuICAgIGZvciBmbiBpbiBbMC4uLnBvbHkuZmFjZS5sZW5ndGhdXG4gICAgICAgIGZvciBpIGluIFswLi4ubl1cbiAgICAgICAgICAgIGZvciBqIGluIFswLi4ubi1pXVxuICAgICAgICAgICAgICAgIGZhY2VzLnB1c2ggW3VuaXFtYXBbdm1hcFtcInYje2ZufS0je2l9LSN7an1cIl1dLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpKzF9LSN7an1cIl1dLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2orMX1cIl1dXVxuICAgICAgICBmb3IgaSBpbiBbMS4uLm5dXG4gICAgICAgICAgICBmb3IgaiBpbiBbMC4uLm4taV1cbiAgICAgICAgICAgICAgICBmYWNlcy5wdXNoIFt1bmlxbWFwW3ZtYXBbXCJ2I3tmbn0tI3tpfS0je2p9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aX0tI3tqKzF9XCJdXSwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pcW1hcFt2bWFwW1widiN7Zm59LSN7aS0xfS0je2orMX1cIl1dXVxuICBcbiAgICBuZXcgUG9seWhlZHJvbiBcInUje259I3twb2x5Lm5hbWV9XCIgZmFjZXMsIHVuaXFWc1xuXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAwMDAgICAwMDAgICAgICAgXG4jIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwICAgIDAwMCAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgICAgXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgXG5cbiMgU2xvdyBDYW5vbmljYWxpemF0aW9uIEFsZ29yaXRobVxuI1xuIyBUaGlzIGFsZ29yaXRobSBoYXMgc29tZSBjb252ZXJnZW5jZSBwcm9ibGVtcywgd2hhdCByZWFsbHkgbmVlZHMgdG8gYmUgZG9uZSBpcyB0b1xuIyBzdW0gdGhlIHRocmVlIGZvcmNpbmcgZmFjdG9ycyB0b2dldGhlciBhcyBhIGNvaGVyZW50IGZvcmNlIGFuZCB0byB1c2UgYSBoYWxmLWRlY2VudFxuIyBpbnRlZ3JhdG9yIHRvIG1ha2Ugc3VyZSB0aGF0IGl0IGNvbnZlcmdlcyB3ZWxsIGFzIG9wcG9zZWQgdG8gdGhlIGN1cnJlbnQgaGFjayBvZlxuIyBhZC1ob2Mgc3RhYmlsaXR5IG11bHRpcGxpZXJzLiAgSWRlYWxseSBvbmUgd291bGQgaW1wbGVtZW50IGEgY29uanVnYXRlIGdyYWRpZW50XG4jIGRlc2NlbnQgb3Igc2ltaWxhciBwcmV0dHkgdGhpbmcuXG4jXG4jIE9ubHkgdHJ5IHRvIHVzZSB0aGlzIG9uIGNvbnZleCBwb2x5aGVkcmEgdGhhdCBoYXZlIGEgY2hhbmNlIG9mIGJlaW5nIGNhbm9uaWNhbGl6ZWQsXG4jIG90aGVyd2lzZSBpdCB3aWxsIHByb2JhYmx5IGJsb3cgdXAgdGhlIGdlb21ldHJ5LiAgQSBtdWNoIHRyaWNraWVyIC8gc21hcnRlciBzZWVkLXN5bW1ldHJ5XG4jIGJhc2VkIGdlb21ldHJpY2FsIHJlZ3VsYXJpemVyIHNob3VsZCBiZSB1c2VkIGZvciBmYW5jaWVyL3dlaXJkZXIgcG9seWhlZHJhLlxuXG5jYW5vbmljYWxpemUgPSAocG9seSwgaXRlcj0yMDApIC0+XG5cbiAgICBmYWNlcyA9IHBvbHkuZmFjZVxuICAgIGVkZ2VzID0gcG9seS5lZGdlcygpXG4gICAgdmVydHMgPSBwb2x5LnZlcnRleFxuICAgIG1heENoYW5nZSA9IDEuMFxuICAgIGZvciBpIGluIFswLi5pdGVyXVxuICAgICAgICBvbGRWcyA9IGNvcHlWZWNBcnJheSB2ZXJ0c1xuICAgICAgICB2ZXJ0cyA9IHRhbmdlbnRpZnkgdmVydHMsIGVkZ2VzXG4gICAgICAgIHZlcnRzID0gcmVjZW50ZXIgdmVydHMsIGVkZ2VzXG4gICAgICAgIHZlcnRzID0gcGxhbmFyaXplIHZlcnRzLCBmYWNlc1xuICAgICAgICBtYXhDaGFuZ2UgPSBfLm1heCBfLm1hcCBfLnppcCh2ZXJ0cywgb2xkVnMpLCAoW3gsIHldKSAtPiBtYWcgc3ViIHgsIHlcbiAgICAgICAgaWYgbWF4Q2hhbmdlIDwgMWUtOFxuICAgICAgICAgICAgYnJlYWtcbiAgICB2ZXJ0cyA9IHJlc2NhbGUgdmVydHNcbiAgICBuZXcgUG9seWhlZHJvbiBwb2x5Lm5hbWUsIHBvbHkuZmFjZSwgdmVydHNcbiAgICAgICAgXG4jIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiMgMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwICAgXG4jIDAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDAgIFxuIyAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcblxubW9kdWxlLmV4cG9ydHMgPVxuICAgIGR1YWw6ICAgICAgICAgICBkdWFsXG4gICAgYmV2ZWw6ICAgICAgICAgIGJldmVsXG4gICAgdHJpc3ViOiAgICAgICAgIHRyaXN1YlxuICAgIHRydW5jYXRlOiAgICAgICB0cnVuY2F0ZVxuICAgIHBlcnNwZWN0aXZhOiAgICBwZXJzcGVjdGl2YVxuICAgIGtpczogICAgICAgICAgICBraXNcbiAgICBhbWJvOiAgICAgICAgICAgYW1ib1xuICAgIGd5cm86ICAgICAgICAgICBneXJvXG4gICAgY2hhbWZlcjogICAgICAgIGNoYW1mZXJcbiAgICB3aGlybDogICAgICAgICAgd2hpcmxcbiAgICBxdWludG86ICAgICAgICAgcXVpbnRvXG4gICAgaW5zZXQ6ICAgICAgICAgIGluc2V0XG4gICAgZXh0cnVkZTogICAgICAgIGV4dHJ1ZGVcbiAgICBleHBhbmQ6ICAgICAgICAgZXhwYW5kXG4gICAgaG9sbG93OiAgICAgICAgIGhvbGxvd1xuICAgIGZsYXR0ZW46ICAgICAgICBmbGF0dGVuXG4gICAgemlya3VsYXJpemU6ICAgIHppcmt1bGFyaXplXG4gICAgc3BoZXJpY2FsaXplOiAgIHNwaGVyaWNhbGl6ZVxuICAgIGNhbm9uaWNhbGl6ZTogICBjYW5vbmljYWxpemVcbiAgICAiXX0=
//# sourceURL=../../coffee/poly/topo.coffee