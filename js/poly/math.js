// koffee 1.6.0

/*
00     00   0000000   000000000  000   000
000   000  000   000     000     000   000
000000000  000000000     000     000000000
000 0 000  000   000     000     000   000
000   000  000   000     000     000   000
 */
var LN10, PI, _, _mult, abs, acos, add, asin, atan, calcCentroid, clone, copyVecArray, cos, cross, dot, edgeDist, faceSignature, floor, intersect, linePointDist2, log, mag, mag2, midpoint, mult, normal, oneThird, orthogonal, planararea, pow, project2dface, random, randomchoice, rayPlane, reciprocal, round, sigfigs, sin, sqrt, sub, tan, tangentPoint, tween, unit;

_ = require('kxk')._;

random = Math.random, round = Math.round, floor = Math.floor, sqrt = Math.sqrt, sin = Math.sin, cos = Math.cos, tan = Math.tan, asin = Math.asin, acos = Math.acos, atan = Math.atan, abs = Math.abs, pow = Math.pow, log = Math.log, PI = Math.PI, LN10 = Math.LN10;

sigfigs = function(N, nsigs) {
    var mantissa, truncated_mantissa;
    mantissa = N / pow(10, floor(console.log(N) / LN10));
    truncated_mantissa = round(mantissa * pow(10, nsigs - 1));
    return "" + truncated_mantissa;
};

clone = function(obj) {
    var key, newInstance;
    if (!obj || typeof obj !== 'object') {
        return obj;
    }
    newInstance = new obj.constructor();
    for (key in obj) {
        newInstance[key] = clone(obj[key]);
    }
    return newInstance;
};

randomchoice = function(array) {
    return array[floor(random() * array.length)];
};

mult = function(c, vec) {
    return [c * vec[0], c * vec[1], c * vec[2]];
};

_mult = function(v1, v2) {
    return [v1[0] * v2[0], v1[1] * v2[1], v1[2] * v2[2]];
};

add = function(v1, v2) {
    return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
};

sub = function(v1, v2) {
    return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
};

dot = function(v1, v2) {
    return (v1[0] * v2[0]) + (v1[1] * v2[1]) + (v1[2] * v2[2]);
};

cross = function(d1, d2) {
    return [(d1[1] * d2[2]) - (d1[2] * d2[1]), (d1[2] * d2[0]) - (d1[0] * d2[2]), (d1[0] * d2[1]) - (d1[1] * d2[0])];
};

mag = function(vec) {
    return sqrt(dot(vec, vec));
};

mag2 = function(vec) {
    return dot(vec, vec);
};

unit = function(vec) {
    return mult(1 / sqrt(mag2(vec)), vec);
};

tween = function(v1, v2, t) {
    return [((1 - t) * v1[0]) + (t * v2[0]), ((1 - t) * v1[1]) + (t * v2[1]), ((1 - t) * v1[2]) + (t * v2[2])];
};

midpoint = function(v1, v2) {
    return mult(0.5, add(v1, v2));
};

oneThird = function(v1, v2) {
    return tween(v1, v2, 1 / 3.0);
};

reciprocal = function(vec) {
    return mult(1.0 / mag2(vec), vec);
};

tangentPoint = function(v1, v2) {
    var d;
    d = sub(v2, v1);
    return sub(v1, mult(dot(d, v1) / mag2(d), d));
};

edgeDist = function(v1, v2) {
    return sqrt(mag2(tangentPoint(v1, v2)));
};

linePointDist2 = function(v1, v2, v3) {
    var d13, d21, d23, m2, result, t;
    d21 = sub(v2, v1);
    d13 = sub(v1, v3);
    d23 = sub(v2, v3);
    m2 = mag2(d21);
    t = -dot(d13, d21) / m2;
    if (t <= 0) {
        result = mag2(d13);
    } else if (t >= 1) {
        result = mag2(d23);
    } else {
        result = mag2(cross(d21, d13)) / m2;
    }
    return result;
};

rayPlane = function(rayPos, rayDirection, planePos, planeNormal) {
    var x;
    x = dot(sub(planePos, rayPos), planeNormal) / dot(rayDirection, planeNormal);
    return add(rayPos, mult(x, rayDirection));
};

orthogonal = function(v1, v2, v3) {
    return cross(sub(v2, v1), sub(v3, v2));
};

intersect = function(set1, set2, set3) {
    var j, k, l, len, len1, len2, s1, s2, s3;
    for (j = 0, len = set1.length; j < len; j++) {
        s1 = set1[j];
        for (k = 0, len1 = set2.length; k < len1; k++) {
            s2 = set2[k];
            if (s1 === s2) {
                for (l = 0, len2 = set3.length; l < len2; l++) {
                    s3 = set3[l];
                    if (s1 === s3) {
                        return s1;
                    }
                }
            }
        }
    }
    return null;
};

calcCentroid = function(vertices) {
    var centroidV, j, len, v;
    centroidV = [0, 0, 0];
    for (j = 0, len = vertices.length; j < len; j++) {
        v = vertices[j];
        centroidV = add(centroidV, v);
    }
    return mult(1 / vertices.length, centroidV);
};

normal = function(vertices) {
    var j, len, normalV, ref, ref1, v1, v2, v3;
    normalV = [0, 0, 0];
    ref = vertices.slice(-2), v1 = ref[0], v2 = ref[1];
    for (j = 0, len = vertices.length; j < len; j++) {
        v3 = vertices[j];
        normalV = add(normalV, orthogonal(v1, v2, v3));
        ref1 = [v2, v3], v1 = ref1[0], v2 = ref1[1];
    }
    return unit(normalV);
};

planararea = function(vertices) {
    var area, j, len, ref, ref1, v1, v2, v3, vsum;
    area = 0.0;
    vsum = [0, 0, 0];
    ref = vertices.slice(-2), v1 = ref[0], v2 = ref[1];
    for (j = 0, len = vertices.length; j < len; j++) {
        v3 = vertices[j];
        vsum = add(vsum, cross(v1, v2));
        ref1 = [v2, v3], v1 = ref1[0], v2 = ref1[1];
    }
    return area = abs(dot(normal(vertices), vsum) / 2.0);
};

faceSignature = function(vertices, sensitivity) {
    var cross_array, j, k, l, len, len1, len2, ref, ref1, ref2, sig, v1, v2, v3, x;
    cross_array = [];
    ref = vertices.slice(-2), v1 = ref[0], v2 = ref[1];
    for (j = 0, len = vertices.length; j < len; j++) {
        v3 = vertices[j];
        cross_array.push(mag(cross(sub(v1, v2), sub(v3, v2))));
        ref1 = [v2, v3], v1 = ref1[0], v2 = ref1[1];
    }
    cross_array.sort(function(a, b) {
        return a - b;
    });
    sig = '';
    for (k = 0, len1 = cross_array.length; k < len1; k++) {
        x = cross_array[k];
        sig += sigfigs(x, sensitivity);
    }
    ref2 = cross_array.reverse();
    for (l = 0, len2 = ref2.length; l < len2; l++) {
        x = ref2[l];
        sig += sigfigs(x, sensitivity);
    }
    return sig;
};

project2dface = function(verts) {
    var c, n, p, tmpverts, v0;
    tmpverts = clone(verts);
    v0 = verts[0];
    tmpverts = _.map(function(tmpverts, x) {
        return x - v0;
    });
    n = normal(verts);
    c = unit(calcCentroid(verts));
    p = cross(n, c);
    return tmpverts.map((function(_this) {
        return function(v) {
            return [dot(n, v), dot(p, v)];
        };
    })(this));
};

copyVecArray = function(vecArray) {
    var end, i, j, newVecArray, ref;
    newVecArray = new Array(vecArray.length);
    end = vecArray.length;
    for (i = j = 0, ref = end; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        newVecArray[i] = vecArray[i].slice(0);
    }
    return newVecArray;
};

module.exports = {
    add: add,
    sub: sub,
    dot: dot,
    mag: mag,
    mult: mult,
    unit: unit,
    cross: cross,
    tween: tween,
    normal: normal,
    oneThird: oneThird,
    midpoint: midpoint,
    calcCentroid: calcCentroid,
    copyVecArray: copyVecArray,
    reciprocal: reciprocal,
    edgeDist: edgeDist,
    intersect: intersect,
    orthogonal: orthogonal,
    tangentPoint: tangentPoint,
    rayPlane: rayPlane
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0aC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBV0UsSUFBTSxPQUFBLENBQVEsS0FBUjs7QUFDTixvQkFBRixFQUFVLGtCQUFWLEVBQWlCLGtCQUFqQixFQUF3QixnQkFBeEIsRUFBOEIsY0FBOUIsRUFBbUMsY0FBbkMsRUFBd0MsY0FBeEMsRUFBNkMsZ0JBQTdDLEVBQW1ELGdCQUFuRCxFQUF5RCxnQkFBekQsRUFBK0QsY0FBL0QsRUFBb0UsY0FBcEUsRUFBeUUsY0FBekUsRUFBOEUsWUFBOUUsRUFBa0Y7O0FBRWxGLE9BQUEsR0FBVSxTQUFDLENBQUQsRUFBSSxLQUFKO0FBRVIsUUFBQTtJQUFBLFFBQUEsR0FBVyxDQUFBLEdBQUksR0FBQSxDQUFJLEVBQUosRUFBTyxLQUFBLENBQUksT0FBQSxDQUFFLEdBQUYsQ0FBTSxDQUFOLENBQUEsR0FBUyxJQUFiLENBQVA7SUFDZixrQkFBQSxHQUFxQixLQUFBLENBQU0sUUFBQSxHQUFXLEdBQUEsQ0FBSSxFQUFKLEVBQU8sS0FBQSxHQUFNLENBQWIsQ0FBakI7V0FDckIsRUFBQSxHQUFHO0FBSks7O0FBTVYsS0FBQSxHQUFRLFNBQUMsR0FBRDtBQUVKLFFBQUE7SUFBQSxJQUFHLENBQUksR0FBSixJQUFXLE9BQU8sR0FBUCxLQUFlLFFBQTdCO0FBQ0ksZUFBTyxJQURYOztJQUVBLFdBQUEsR0FBYyxJQUFJLEdBQUcsQ0FBQyxXQUFSLENBQUE7QUFDZCxTQUFBLFVBQUE7UUFDSSxXQUFZLENBQUEsR0FBQSxDQUFaLEdBQW1CLEtBQUEsQ0FBTSxHQUFJLENBQUEsR0FBQSxDQUFWO0FBRHZCO1dBRUE7QUFQSTs7QUFTUixZQUFBLEdBQWUsU0FBQyxLQUFEO1dBQVcsS0FBTSxDQUFBLEtBQUEsQ0FBTSxNQUFBLENBQUEsQ0FBQSxHQUFTLEtBQUssQ0FBQyxNQUFyQixDQUFBO0FBQWpCOztBQUVmLElBQUEsR0FB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QyxHQUFULENBQWEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLENBQUQ7bUJBQU8sQ0FBQyxHQUFBLENBQUksQ0FBSixFQUFPLENBQVAsQ0FBRCxFQUFZLEdBQUEsQ0FBSSxDQUFKLEVBQU8sQ0FBUCxDQUFaO1FBQVA7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWI7QUFUWTs7QUFXaEIsWUFBQSxHQUFlLFNBQUMsUUFBRDtBQUVYLFFBQUE7SUFBQSxXQUFBLEdBQWMsSUFBSSxLQUFKLENBQVUsUUFBUSxDQUFDLE1BQW5CO0lBQ2QsR0FBQSxHQUFNLFFBQVEsQ0FBQztBQUNmLFNBQVMsNEVBQVQ7UUFDSSxXQUFZLENBQUEsQ0FBQSxDQUFaLEdBQWlCLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFaLENBQWtCLENBQWxCO0FBRHJCO1dBRUE7QUFOVzs7QUFRZixNQUFNLENBQUMsT0FBUCxHQUNJO0lBQUEsR0FBQSxFQUFnQixHQUFoQjtJQUNBLEdBQUEsRUFBZ0IsR0FEaEI7SUFFQSxHQUFBLEVBQWdCLEdBRmhCO0lBR0EsR0FBQSxFQUFnQixHQUhoQjtJQUlBLElBQUEsRUFBZ0IsSUFKaEI7SUFLQSxJQUFBLEVBQWdCLElBTGhCO0lBTUEsS0FBQSxFQUFnQixLQU5oQjtJQU9BLEtBQUEsRUFBZ0IsS0FQaEI7SUFRQSxNQUFBLEVBQWdCLE1BUmhCO0lBU0EsUUFBQSxFQUFnQixRQVRoQjtJQVVBLFFBQUEsRUFBZ0IsUUFWaEI7SUFXQSxZQUFBLEVBQWdCLFlBWGhCO0lBWUEsWUFBQSxFQUFnQixZQVpoQjtJQWFBLFVBQUEsRUFBZ0IsVUFiaEI7SUFjQSxRQUFBLEVBQWdCLFFBZGhCO0lBZUEsU0FBQSxFQUFnQixTQWZoQjtJQWdCQSxVQUFBLEVBQWdCLFVBaEJoQjtJQWlCQSxZQUFBLEVBQWdCLFlBakJoQjtJQWtCQSxRQUFBLEVBQWdCLFFBbEJoQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcbjAwMDAwMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAwMFxuMDAwIDAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDBcbiMjI1xuI1xuIyBQb2x5aMOpZHJvbmlzbWUsIENvcHlyaWdodCAyMDE5LCBBbnNlbG0gTGV2c2theWEsIE1JVCBMaWNlbnNlXG4jXG4gICAgXG57IF8gfSA9IHJlcXVpcmUgJ2t4aydcbnsgcmFuZG9tLCByb3VuZCwgZmxvb3IsIHNxcnQsIHNpbiwgY29zLCB0YW4sIGFzaW4sIGFjb3MsIGF0YW4sIGFicywgcG93LCBsb2csIFBJLCBMTjEwIH0gPSBNYXRoXG5cbnNpZ2ZpZ3MgPSAoTiwgbnNpZ3MpIC0+ICMgc3RyaW5nIHdpdGggbnNpZ3MgZGlnaXRzIGlnbm9yaW5nIG1hZ25pdHVkZVxuICAgIFxuICBtYW50aXNzYSA9IE4gLyBwb3cgMTAgZmxvb3IgbG9nKE4pL0xOMTBcbiAgdHJ1bmNhdGVkX21hbnRpc3NhID0gcm91bmQgbWFudGlzc2EgKiBwb3cgMTAgbnNpZ3MtMVxuICBcIiN7dHJ1bmNhdGVkX21hbnRpc3NhfVwiXG5cbmNsb25lID0gKG9iaikgLT4gIyBkZWVwLWNvcHlcbiAgICBcbiAgICBpZiBub3Qgb2JqIG9yIHR5cGVvZihvYmopICE9ICdvYmplY3QnXG4gICAgICAgIHJldHVybiBvYmpcbiAgICBuZXdJbnN0YW5jZSA9IG5ldyBvYmouY29uc3RydWN0b3IoKVxuICAgIGZvciBrZXkgb2Ygb2JqIFxuICAgICAgICBuZXdJbnN0YW5jZVtrZXldID0gY2xvbmUgb2JqW2tleV1cbiAgICBuZXdJbnN0YW5jZVxuXG5yYW5kb21jaG9pY2UgPSAoYXJyYXkpIC0+IGFycmF5W2Zsb29yIHJhbmRvbSgpKmFycmF5Lmxlbmd0aF1cblxubXVsdCAgICAgPSAoYywgdmVjKSAtPiBbYyp2ZWNbMF0sIGMqdmVjWzFdLCBjKnZlY1syXV1cbl9tdWx0ICAgID0gKHYxLCB2MikgLT4gW3YxWzBdKnYyWzBdLCB2MVsxXSp2MlsxXSwgdjFbMl0qdjJbMl1dXG5hZGQgICAgICA9ICh2MSwgdjIpIC0+IFt2MVswXSt2MlswXSwgdjFbMV0rdjJbMV0sIHYxWzJdK3YyWzJdXVxuc3ViICAgICAgPSAodjEsIHYyKSAtPiBbdjFbMF0tdjJbMF0sIHYxWzFdLXYyWzFdLCB2MVsyXS12MlsyXV1cbmRvdCAgICAgID0gKHYxLCB2MikgLT4gKHYxWzBdKnYyWzBdKSArICh2MVsxXSp2MlsxXSkgKyAodjFbMl0qdjJbMl0pXG5jcm9zcyAgICA9IChkMSwgZDIpIC0+IFsoZDFbMV0qZDJbMl0pIC0gKGQxWzJdKmQyWzFdKSwgKGQxWzJdKmQyWzBdKSAtIChkMVswXSpkMlsyXSksIChkMVswXSpkMlsxXSkgLSAoZDFbMV0qZDJbMF0pXVxubWFnICAgICAgPSAodmVjKSAtPiBzcXJ0IGRvdCB2ZWMsIHZlY1xubWFnMiAgICAgPSAodmVjKSAtPiBkb3QgdmVjLCB2ZWNcbnVuaXQgICAgID0gKHZlYykgLT4gbXVsdCAxL3NxcnQobWFnMih2ZWMpKSwgdmVjXG50d2VlbiAgICA9ICh2MSwgdjIsIHQpIC0+IFsoKDEtdCkqdjFbMF0pICsgKHQqdjJbMF0pLCAoKDEtdCkqdjFbMV0pICsgKHQqdjJbMV0pLCAoKDEtdCkqdjFbMl0pICsgKHQqdjJbMl0pXVxubWlkcG9pbnQgPSAodjEsIHYyKSAtPiBtdWx0IDAuNSwgYWRkIHYxLCB2Mlxub25lVGhpcmQgPSAodjEsIHYyKSAtPiB0d2VlbiB2MSwgdjIsIDEvMy4wXG5cbnJlY2lwcm9jYWwgPSAodmVjKSAtPiBtdWx0IDEuMC9tYWcyKHZlYyksIHZlYyAjIHJlZmxlY3QgaW4gdW5pdCBzcGhlcmVcblxudGFuZ2VudFBvaW50ID0gKHYxLCB2MikgLT4gIyBwb2ludCB3aGVyZSBsaW5lIHYxLi4udjIgdGFuZ2VudCB0byBhbiBvcmlnaW4gc3BoZXJlXG4gICAgZCA9IHN1YiB2MiwgdjFcbiAgICBzdWIgdjEsIG11bHQgZG90KGQsIHYxKS9tYWcyKGQpLCBkXG5cbmVkZ2VEaXN0ID0gKHYxLCB2MikgLT4gc3FydCBtYWcyIHRhbmdlbnRQb2ludCB2MSwgdjIgIyBkaXN0YW5jZSBvZiBsaW5lIHYxLi4udjIgdG8gb3JpZ2luXG5cbiMgc3F1YXJlIG9mIGRpc3RhbmNlIGZyb20gcG9pbnQgdjMgdG8gbGluZSBzZWdtZW50IHYxLi4udjJcbiMgaHR0cDojbWF0aHdvcmxkLndvbGZyYW0uY29tL1BvaW50LUxpbmVEaXN0YW5jZTMtRGltZW5zaW9uYWwuaHRtbFxuIyBjYWxjdWxhdGVzIG1pbiBkaXN0YW5jZSBmcm9tIHBvaW50IHYzIHRvIGZpbml0ZSBsaW5lIHNlZ21lbnQgYmV0d2VlbiB2MSBhbmQgdjJcblxubGluZVBvaW50RGlzdDIgPSAodjEsIHYyLCB2MykgLT5cblxuICAgIGQyMSA9IHN1YiB2MiwgdjFcbiAgICBkMTMgPSBzdWIgdjEsIHYzXG4gICAgZDIzID0gc3ViIHYyLCB2M1xuICAgIG0yID0gbWFnMiBkMjFcbiAgICB0ID0gLWRvdChkMTMsIGQyMSkvbTJcbiAgICBpZiB0IDw9IDBcbiAgICAgICAgIyBjbG9zZXN0IHRvIHBvaW50IGJleW9uZCB2MSwgY2xpcCB0byB8djMtdjF8XjJcbiAgICAgICAgcmVzdWx0ID0gbWFnMiBkMTNcbiAgICBlbHNlIGlmICh0ID49IDEpIFxuICAgICAgICAjIGNsb3Nlc3QgdG8gcG9pbnQgYmV5b25kIHYyLCBjbGlwIHRvIHx2My12MnxeMlxuICAgICAgICByZXN1bHQgPSBtYWcyIGQyM1xuICAgIGVsc2VcbiAgICAgICAgIyBjbG9zZXN0IGluLWJldHdlZW4gdjEsIHYyXG4gICAgICAgIHJlc3VsdCA9IG1hZzIoY3Jvc3MgZDIxLCBkMTMpL20yXG4gICAgcmVzdWx0XG4gICAgXG5yYXlQbGFuZSA9IChyYXlQb3MsIHJheURpcmVjdGlvbiwgcGxhbmVQb3MsIHBsYW5lTm9ybWFsKSAtPlxuICAgIFxuICAgIHggPSBkb3Qoc3ViKHBsYW5lUG9zLCByYXlQb3MpLCBwbGFuZU5vcm1hbCkgLyBkb3QocmF5RGlyZWN0aW9uLCBwbGFuZU5vcm1hbClcbiAgICBhZGQgcmF5UG9zLCBtdWx0IHgsIHJheURpcmVjdGlvblxuICBcbiMgZmluZCB2ZWN0b3Igb3J0aG9nb25hbCB0byBwbGFuZSBvZiAzIHB0c1xub3J0aG9nb25hbCA9ICh2MSx2Mix2MykgLT4gY3Jvc3Mgc3ViKHYyLCB2MSksIHN1Yih2MywgdjIpXG5cbiMgZmluZCBmaXJzdCBlbGVtZW50IGNvbW1vbiB0byAzIHNldHMgYnkgYnJ1dGUgZm9yY2Ugc2VhcmNoXG5pbnRlcnNlY3QgPSAoc2V0MSwgc2V0Miwgc2V0MykgLT5cbiAgICBmb3IgczEgaW4gc2V0MVxuICAgICAgICBmb3IgczIgaW4gc2V0MlxuICAgICAgICAgICAgaWYgczEgPT0gczJcbiAgICAgICAgICAgICAgICBmb3IgczMgaW4gc2V0M1xuICAgICAgICAgICAgICAgICAgICBpZiBzMSA9PSBzM1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHMxXG4gICAgbnVsbCAjIGVtcHR5IGludGVyc2VjdGlvblxuXG5jYWxjQ2VudHJvaWQgPSAodmVydGljZXMpIC0+XG4gICAgY2VudHJvaWRWID0gWzAgMCAwXVxuICAgIGZvciB2IGluIHZlcnRpY2VzXG4gICAgICAgIGNlbnRyb2lkViA9IGFkZCBjZW50cm9pZFYsIHZcbiAgICBtdWx0IDEgLyB2ZXJ0aWNlcy5sZW5ndGgsIGNlbnRyb2lkViBcblxuIyBjYWxjdWxhdGUgYXZlcmFnZSBub3JtYWwgdmVjdG9yIGZvciBhcnJheSBvZiB2ZXJ0aWNlc1xubm9ybWFsID0gKHZlcnRpY2VzKSAtPlxuICAgIG5vcm1hbFYgPSBbMCAwIDBdIFxuICAgIFt2MSwgdjJdID0gdmVydGljZXMuc2xpY2UgLTJcbiAgICBmb3IgdjMgaW4gdmVydGljZXNcbiAgICAgICAgbm9ybWFsViA9IGFkZCBub3JtYWxWLCBvcnRob2dvbmFsIHYxLCB2MiwgdjNcbiAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICAgIHVuaXQgbm9ybWFsVlxuXG4jIGNhbGN1bGF0ZXMgYXJlYSBwbGFuYXIgZmFjZSBieSBzdW1taW5nIG92ZXIgc3VidHJpYW5nbGUgYXJlYXMsIGFzc3VtZXMgcGxhbmFyaXR5LlxucGxhbmFyYXJlYSA9ICh2ZXJ0aWNlcykgLT5cbiAgICBhcmVhID0gMC4wXG4gICAgdnN1bSA9IFswIDAgMF1cbiAgICBbdjEsIHYyXSA9IHZlcnRpY2VzLnNsaWNlKC0yKVxuICAgIGZvciB2MyBpbiB2ZXJ0aWNlc1xuICAgICAgICB2c3VtID0gYWRkIHZzdW0sIGNyb3NzIHYxLCB2MlxuICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gICAgYXJlYSA9IGFicyBkb3Qobm9ybWFsKHZlcnRpY2VzKSwgdnN1bSkgLyAyLjBcblxuIyBjb25ncnVlbmNlIHNpZ25hdHVyZSBmb3IgYXNzaWduaW5nIHNhbWUgY29sb3JzIHRvIGNvbmdydWVudCBmYWNlc1xuZmFjZVNpZ25hdHVyZSA9ICh2ZXJ0aWNlcywgc2Vuc2l0aXZpdHkpIC0+XG5cbiAgICBjcm9zc19hcnJheSA9IFtdXG4gICAgW3YxLCB2Ml0gPSB2ZXJ0aWNlcy5zbGljZSAtMlxuICAgIGZvciB2MyBpbiB2ZXJ0aWNlc1xuICAgICAgICAjIGFjY3VtdWxhdGUgaW5uZXIgYW5nbGVzXG4gICAgICAgIGNyb3NzX2FycmF5LnB1c2ggbWFnIGNyb3NzIHN1Yih2MSwgdjIpLCBzdWIodjMsIHYyKVxuICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG5cbiAgICAjIHNvcnQgYW5nbGVzIHRvIGNyZWF0ZSB1bmlxdWUgc2VxdWVuY2VcbiAgICBjcm9zc19hcnJheS5zb3J0IChhLGIpIC0+IGEtYlxuICBcbiAgICAjIHJlbmRlciBzb3J0ZWQgYW5nbGVzIGFzIHF1YW50aXplZCBkaWdpdCBzdHJpbmdzXG4gICAgIyB0aGlzIGlzIHRoZSBjb25ncnVlbmNlIHNpZ25hdHVyZVxuICAgIHNpZyA9ICcnXG4gICAgZm9yIHggaW4gY3Jvc3NfYXJyYXkgXG4gICAgICAgIHNpZyArPSBzaWdmaWdzIHgsIHNlbnNpdGl2aXR5XG4gICAgIyBoYWNrIHRvIG1ha2UgcmVmbGVjdGVkIGZhY2VzIHNoYXJlIHRoZSBzYW1lIHNpZ25hdHVyZVxuICAgIGZvciB4IGluIGNyb3NzX2FycmF5LnJldmVyc2UoKSBcbiAgICAgICAgc2lnICs9IHNpZ2ZpZ3MgeCwgc2Vuc2l0aXZpdHlcbiAgICBzaWdcblxuIyBwcm9qZWN0cyAzZCBwb2x5aGVkcmFsIGZhY2UgdG8gMmQgcG9seWdvbiBmb3IgdHJpYW5ndWxhdGlvbiBhbmQgZmFjZSBkaXNwbGF5XG5wcm9qZWN0MmRmYWNlID0gKHZlcnRzKSAtPlxuICAgIHRtcHZlcnRzID0gY2xvbmUgdmVydHNcbiAgICB2MCA9IHZlcnRzWzBdXG4gICAgdG1wdmVydHMgPSBfLm1hcCAodG1wdmVydHMseCkgLT4geC12MFxuICBcbiAgICBuID0gbm9ybWFsIHZlcnRzXG4gICAgYyA9IHVuaXQgY2FsY0NlbnRyb2lkIHZlcnRzICNYWFg6IGNvcnJlY3Q/XG4gICAgcCA9IGNyb3NzIG4sIGNcbiAgXG4gICAgdG1wdmVydHMubWFwICh2KSA9PiBbZG90KG4sIHYpLCBkb3QocCwgdildXG5cbmNvcHlWZWNBcnJheSA9ICh2ZWNBcnJheSkgLT4gIyBjb3BpZXMgYXJyYXkgb2YgYXJyYXlzIGJ5IHZhbHVlIChkZWVwIGNvcHkpXG4gICAgXG4gICAgbmV3VmVjQXJyYXkgPSBuZXcgQXJyYXkgdmVjQXJyYXkubGVuZ3RoXG4gICAgZW5kID0gdmVjQXJyYXkubGVuZ3RoXG4gICAgZm9yIGkgaW4gWzAuLi5lbmRdXG4gICAgICAgIG5ld1ZlY0FycmF5W2ldID0gdmVjQXJyYXlbaV0uc2xpY2UgMFxuICAgIG5ld1ZlY0FycmF5XG5cbm1vZHVsZS5leHBvcnRzID1cbiAgICBhZGQ6ICAgICAgICAgICAgYWRkXG4gICAgc3ViOiAgICAgICAgICAgIHN1YlxuICAgIGRvdDogICAgICAgICAgICBkb3RcbiAgICBtYWc6ICAgICAgICAgICAgbWFnXG4gICAgbXVsdDogICAgICAgICAgIG11bHRcbiAgICB1bml0OiAgICAgICAgICAgdW5pdFxuICAgIGNyb3NzOiAgICAgICAgICBjcm9zc1xuICAgIHR3ZWVuOiAgICAgICAgICB0d2VlblxuICAgIG5vcm1hbDogICAgICAgICBub3JtYWxcbiAgICBvbmVUaGlyZDogICAgICAgb25lVGhpcmRcbiAgICBtaWRwb2ludDogICAgICAgbWlkcG9pbnRcbiAgICBjYWxjQ2VudHJvaWQ6ICAgY2FsY0NlbnRyb2lkXG4gICAgY29weVZlY0FycmF5OiAgIGNvcHlWZWNBcnJheVxuICAgIHJlY2lwcm9jYWw6ICAgICByZWNpcHJvY2FsXG4gICAgZWRnZURpc3Q6ICAgICAgIGVkZ2VEaXN0XG4gICAgaW50ZXJzZWN0OiAgICAgIGludGVyc2VjdFxuICAgIG9ydGhvZ29uYWw6ICAgICBvcnRob2dvbmFsXG4gICAgdGFuZ2VudFBvaW50OiAgIHRhbmdlbnRQb2ludFxuICAgIHJheVBsYW5lOiAgICAgICByYXlQbGFuZVxuICAgICJdfQ==
//# sourceURL=../../coffee/poly/math.coffee