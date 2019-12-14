// koffee 1.6.0

/*
00000000    0000000   000      000   000  000   000  00000000  0000000    00000000    0000000   000   000  
000   000  000   000  000       000 000   000   000  000       000   000  000   000  000   000  0000  000  
00000000   000   000  000        00000    000000000  0000000   000   000  0000000    000   000  000 0 000  
000        000   000  000         000     000   000  000       000   000  000   000  000   000  000  0000  
000         0000000   0000000     000     000   000  00000000  0000000    000   000   0000000   000   000
 */
var Polyhedron, Vect, _, abs, add, center, cross, dot, faceToEdges, facesToWings, mag, min, mult, normal, pointPlaneDist, rad2deg, ref, ref1, sub, tangentPoint, valid, vec,
    indexOf = [].indexOf;

ref = require('kxk'), _ = ref._, rad2deg = ref.rad2deg, valid = ref.valid;

ref1 = require('./math'), add = ref1.add, center = ref1.center, cross = ref1.cross, dot = ref1.dot, faceToEdges = ref1.faceToEdges, facesToWings = ref1.facesToWings, mag = ref1.mag, mult = ref1.mult, normal = ref1.normal, pointPlaneDist = ref1.pointPlaneDist, sub = ref1.sub, tangentPoint = ref1.tangentPoint, vec = ref1.vec;

abs = Math.abs, min = Math.min;

Vect = require('../vect');

Polyhedron = (function() {
    function Polyhedron(name, face1, vertex) {
        this.name = name;
        this.face = face1;
        this.vertex = vertex;
        if (this.name != null) {
            this.name;
        } else {
            this.name = "polyhedron";
        }
        if (this.face != null) {
            this.face;
        } else {
            this.face = [];
        }
        if (this.vertex != null) {
            this.vertex;
        } else {
            this.vertex = [];
        }
        this.debug = [];
    }

    Polyhedron.prototype.debugLine = function(v1, v2) {
        var a;
        if (v1.constructor.name === 'Number') {
            v1 = this.vertex[v1];
        } else if (v1.toArray != null) {
            a = [];
            v1.toArray(a);
            v1 = a;
        }
        if (v2.constructor.name === 'Number') {
            v2 = this.vertex[v2];
        } else if (v2.toArray != null) {
            a = [];
            v2 = v2.toArray(a);
            v2 = a;
        }
        return this.debug.push([v1, v2]);
    };

    Polyhedron.prototype.neighbors = function() {
        var face, i, j, l, len, neighbors, ni, perp, ref2, ref3, ref4, ref5, ref6, toN0, toVertex, v, vi;
        neighbors = (function() {
            var i, len, ref2, results;
            ref2 = this.vertex;
            results = [];
            for (i = 0, len = ref2.length; i < len; i++) {
                v = ref2[i];
                results.push([]);
            }
            return results;
        }).call(this);
        ref2 = this.face;
        for (i = 0, len = ref2.length; i < len; i++) {
            face = ref2[i];
            for (vi = j = 0, ref3 = face.length; 0 <= ref3 ? j < ref3 : j > ref3; vi = 0 <= ref3 ? ++j : --j) {
                ni = (vi + 1) % face.length;
                if (ref4 = face[ni], indexOf.call(neighbors[face[vi]], ref4) < 0) {
                    neighbors[face[vi]].push(face[ni]);
                }
                if (ref5 = face[vi], indexOf.call(neighbors[face[ni]], ref5) < 0) {
                    neighbors[face[ni]].push(face[vi]);
                }
            }
        }
        for (vi = l = 0, ref6 = neighbors.length; 0 <= ref6 ? l < ref6 : l > ref6; vi = 0 <= ref6 ? ++l : --l) {
            toVertex = this.vert(vi);
            toVertex.normalize();
            toN0 = this.vert(neighbors[vi][0]);
            perp = toVertex.crossed(toN0);
            neighbors[vi].sort((function(_this) {
                return function(a, b) {
                    var aa, bb;
                    aa = Vect.GetAngleBetweenVectors(perp, _this.vert(a), toVertex);
                    bb = Vect.GetAngleBetweenVectors(perp, _this.vert(b), toVertex);
                    return aa - bb;
                };
            })(this));
        }
        return neighbors;
    };

    Polyhedron.prototype.neighborsAndFaces = function() {
        var face, fi, i, j, l, len, neighbors, ni, perp, ref2, ref3, ref4, ref5, ref6, toN0, toVertex, v, vi;
        neighbors = (function() {
            var i, len, ref2, results;
            ref2 = this.vertex;
            results = [];
            for (i = 0, len = ref2.length; i < len; i++) {
                v = ref2[i];
                results.push([]);
            }
            return results;
        }).call(this);
        ref2 = this.face;
        for (fi = i = 0, len = ref2.length; i < len; fi = ++i) {
            face = ref2[fi];
            for (vi = j = 0, ref3 = face.length; 0 <= ref3 ? j < ref3 : j > ref3; vi = 0 <= ref3 ? ++j : --j) {
                ni = (vi + 1) % face.length;
                if (ref4 = face[ni], indexOf.call(neighbors[face[vi]], ref4) < 0) {
                    neighbors[face[vi]].push({
                        vertex: face[ni],
                        face: fi
                    });
                }
                if (ref5 = face[vi], indexOf.call(neighbors[face[ni]], ref5) < 0) {
                    neighbors[face[ni]].push({
                        vertex: face[vi],
                        face: fi
                    });
                }
            }
        }
        for (vi = l = 0, ref6 = neighbors.length; 0 <= ref6 ? l < ref6 : l > ref6; vi = 0 <= ref6 ? ++l : --l) {
            toVertex = this.vert(vi);
            toVertex.normalize();
            toN0 = this.vert(neighbors[vi][0]);
            perp = toVertex.crossed(toN0);
            neighbors[vi].sort((function(_this) {
                return function(a, b) {
                    var aa, bb;
                    aa = Vect.GetAngleBetweenVectors(perp, _this.vert(a.vertex), toVertex);
                    bb = Vect.GetAngleBetweenVectors(perp, _this.vert(b.vertex), toVertex);
                    return aa - bb;
                };
            })(this));
        }
        return neighbors;
    };

    Polyhedron.prototype.wings = function() {
        return facesToWings(this.face);
    };

    Polyhedron.prototype.edges = function() {
        var a, b, e, edgeSet, faceEdges, i, j, len, len1, uniqEdges;
        uniqEdges = {};
        faceEdges = this.face.map(faceToEdges);
        for (i = 0, len = faceEdges.length; i < len; i++) {
            edgeSet = faceEdges[i];
            for (j = 0, len1 = edgeSet.length; j < len1; j++) {
                e = edgeSet[j];
                if (e[0] < e[1]) {
                    a = e[0], b = e[1];
                } else {
                    b = e[0], a = e[1];
                }
                uniqEdges[a + "~" + b] = e;
            }
        }
        return _.values(uniqEdges);
    };

    Polyhedron.prototype.edge = function(v1, v2) {
        return this.vert(v2).subtract(this.vert(v1));
    };

    Polyhedron.prototype.edgeNormal = function(v1, v2) {
        return this.vertexNormal(v1).addInPlace(this.vertexNormal(v2)).scale(0.5);
    };

    Polyhedron.prototype.minEdgeLength = function() {
        var edge, i, len, minEdgeLength, ref2;
        minEdgeLength = 2e308;
        ref2 = this.edges();
        for (i = 0, len = ref2.length; i < len; i++) {
            edge = ref2[i];
            minEdgeLength = min(minEdgeLength, this.vert(edge[0]).dist(this.vert(edge[1])));
        }
        return minEdgeLength;
    };

    Polyhedron.prototype.maxEdgeDifference = function() {
        var diffs, edge, face, i, j, len, len1, length, ref2, ref3;
        diffs = [];
        ref2 = this.face;
        for (i = 0, len = ref2.length; i < len; i++) {
            face = ref2[i];
            length = [];
            ref3 = faceToEdges(face);
            for (j = 0, len1 = ref3.length; j < len1; j++) {
                edge = ref3[j];
                length.push(this.vert(edge[0]).to(this.vert(edge[1])).length());
            }
            diffs.push(_.max(length) - _.min(length));
        }
        return _.max(diffs);
    };

    Polyhedron.prototype.vert = function(vi) {
        return new Vect(this.vertex[vi]);
    };

    Polyhedron.prototype.vertexNormal = function(vi) {
        var i, len, ni, ref2, sum;
        sum = new Vect(0, 0, 0);
        ref2 = this.neighbors(vi);
        for (i = 0, len = ref2.length; i < len; i++) {
            ni = ref2[i];
            sum.addInPlace(this.edge(vi, ni));
        }
        sum.normalize();
        return sum;
    };

    Polyhedron.prototype.facesAtVertex = function(vi) {
        var face, faces, fi, i, len, ref2;
        faces = [];
        ref2 = this.face;
        for (fi = i = 0, len = ref2.length; i < len; fi = ++i) {
            face = ref2[fi];
            if (indexOf.call(face, vi) >= 0) {
                faces.push(fi);
            }
        }
        return faces;
    };

    Polyhedron.prototype.scale = function(factor) {
        var i, len, ref2, v;
        ref2 = this.vertex;
        for (i = 0, len = ref2.length; i < len; i++) {
            v = ref2[i];
            v[0] *= factor;
            v[1] *= factor;
            v[2] *= factor;
        }
        return this;
    };

    Polyhedron.prototype.normalize = function() {
        this.recenter();
        this.rescale();
        return this;
    };

    Polyhedron.prototype.recenter = function() {
        var edgecenters, edges, i, len, polycenter, v;
        edges = this.edges();
        edgecenters = edges.map((function(_this) {
            return function(arg) {
                var a, b;
                a = arg[0], b = arg[1];
                return tangentPoint(_this.vertex[a], _this.vertex[b]);
            };
        })(this));
        polycenter = [0, 0, 0];
        for (i = 0, len = edgecenters.length; i < len; i++) {
            v = edgecenters[i];
            polycenter = add(polycenter, v);
        }
        polycenter = mult(1 / edges.length, polycenter);
        this.vertex = _.map(this.vertex, function(x) {
            return sub(x, polycenter);
        });
        this.debug = _.map(this.debug, function(dbg) {
            return dbg.map(function(x) {
                return sub(x, polycenter);
            });
        });
        return this;
    };

    Polyhedron.prototype.rescale = function() {
        var maxExtent, polycenter, s;
        polycenter = [0, 0, 0];
        maxExtent = _.max(_.map(this.vertex, function(x) {
            return mag(x);
        }));
        s = 1 / maxExtent;
        this.vertex = _.map(this.vertex, function(x) {
            return [s * x[0], s * x[1], s * x[2]];
        });
        this.debug = _.map(this.debug, function(dbg) {
            return dbg.map(function(x) {
                return [s * x[0], s * x[1], s * x[2]];
            });
        });
        return this;
    };

    Polyhedron.prototype.centers = function() {
        return this.face.map((function(_this) {
            return function(f) {
                return center(f.map(function(vi) {
                    return _this.vertex[vi];
                }));
            };
        })(this));
    };

    Polyhedron.prototype.minFaceDist = function() {
        var ctr, i, len, minFaceDist, ref2;
        minFaceDist = 2e308;
        ref2 = this.centers();
        for (i = 0, len = ref2.length; i < len; i++) {
            ctr = ref2[i];
            minFaceDist = min(minFaceDist, mag(ctr));
        }
        return minFaceDist;
    };

    Polyhedron.prototype.flatness = function() {
        var avg, cent, d, face, fi, flatness, i, j, k, l, len, len1, len2, len3, m, n, neighbors, norm, offsets, others, ref2, ref3, ref4, s, vd, vdist, vertexdist, vi;
        vertexdist = {};
        offsets = {};
        neighbors = this.neighbors();
        ref2 = this.face;
        for (fi = i = 0, len = ref2.length; i < len; fi = ++i) {
            face = ref2[fi];
            if (face.length <= 3) {
                continue;
            }
            for (j = 0, len1 = face.length; j < len1; j++) {
                vi = face[j];
                others = face.filter((function(_this) {
                    return function(v) {
                        return v !== vi;
                    };
                })(this)).map((function(_this) {
                    return function(v) {
                        return _this.vertex[v];
                    };
                })(this));
                norm = normal(others);
                cent = center(others);
                d = pointPlaneDist(this.vertex[vi], cent, norm);
                s = dot(norm, sub(this.vertex[vi], cent)) > 0 && 1 || -1;
                vertexdist[fi + "▸" + vi] = s * d;
            }
        }
        avg = this.vertex.map(function(v) {
            return vec();
        });
        ref3 = this.face;
        for (fi = l = 0, len2 = ref3.length; l < len2; fi = ++l) {
            face = ref3[fi];
            if (face.length <= 3) {
                continue;
            }
            fi = parseInt(fi);
            face = this.face[fi];
            for (m = 0, len3 = face.length; m < len3; m++) {
                vi = face[m];
                others = face.filter(function(v) {
                    return v !== vi;
                }).map((function(_this) {
                    return function(v) {
                        return _this.vertex[v];
                    };
                })(this));
                norm = normal(others);
                vdist = vertexdist[fi + "▸" + vi];
                avg[vi].addInPlace(vec(mult(-vdist, norm)));
            }
        }
        for (vi = n = 0, ref4 = this.vertex.length; 0 <= ref4 ? n < ref4 : n > ref4; vi = 0 <= ref4 ? ++n : --n) {
            offsets[vi] = avg[vi].mul(1 / neighbors[vi].length).coords();
        }
        flatness = 0;
        if (valid(vertexdist)) {
            for (k in vertexdist) {
                vd = vertexdist[k];
                flatness += abs(vd);
            }
            flatness /= _.size(vertexdist);
        }
        return [flatness, vertexdist, offsets];
    };

    Polyhedron.prototype.normals = function() {
        var face, i, len, normalsArray, ref2;
        normalsArray = [];
        ref2 = this.face;
        for (i = 0, len = ref2.length; i < len; i++) {
            face = ref2[i];
            normalsArray.push(normal(face.map((function(_this) {
                return function(vidx) {
                    return _this.vertex[vidx];
                };
            })(this))));
        }
        return normalsArray;
    };

    Polyhedron.prototype.data = function() {
        var nEdges;
        nEdges = (this.face.length + this.vertex.length) - 2;
        return this.face.length + " faces, " + nEdges + " edges, " + this.vertex.length + " vertices";
    };

    Polyhedron.prototype.colorize = function(method) {
        var colorassign, colormemory;
        if (method == null) {
            method = 'sidedness';
        }
        this.colors = [];
        colormemory = {};
        colorassign = function(hash) {
            return colormemory[hash] != null ? colormemory[hash] : colormemory[hash] = _.size(colormemory);
        };
        switch (method) {
            case 'signature':
                this.colors = this.face.map((function(_this) {
                    return function(f) {
                        return colorassign(_this.signature(f));
                    };
                })(this));
                break;
            default:
                this.colors = this.face.map(function(f) {
                    return f.length - 3;
                });
        }
        return this;
    };

    Polyhedron.prototype.signature = function(face) {
        var angles, i, len, ref2, ref3, v1, v2, v3, vertices;
        vertices = face.map((function(_this) {
            return function(v) {
                return _this.vertex[v];
            };
        })(this));
        angles = [];
        ref2 = vertices.slice(-2), v1 = ref2[0], v2 = ref2[1];
        for (i = 0, len = vertices.length; i < len; i++) {
            v3 = vertices[i];
            angles.push(parseInt(rad2deg(mag(cross(sub(v1, v2), sub(v3, v2))))));
            ref3 = [v2, v3], v1 = ref3[0], v2 = ref3[1];
        }
        return angles.sort().join('_');
    };

    return Polyhedron;

})();

module.exports = Polyhedron;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWhlZHJvbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsdUtBQUE7SUFBQTs7QUFVQSxNQUF3QixPQUFBLENBQVEsS0FBUixDQUF4QixFQUFFLFNBQUYsRUFBSyxxQkFBTCxFQUFjOztBQUNkLE9BQW9ILE9BQUEsQ0FBUSxRQUFSLENBQXBILEVBQUUsY0FBRixFQUFPLG9CQUFQLEVBQWUsa0JBQWYsRUFBc0IsY0FBdEIsRUFBMkIsOEJBQTNCLEVBQXdDLGdDQUF4QyxFQUFzRCxjQUF0RCxFQUEyRCxnQkFBM0QsRUFBaUUsb0JBQWpFLEVBQXlFLG9DQUF6RSxFQUF5RixjQUF6RixFQUE4RixnQ0FBOUYsRUFBNEc7O0FBQzFHLGNBQUYsRUFBTzs7QUFDUCxJQUFBLEdBQU8sT0FBQSxDQUFRLFNBQVI7O0FBRUQ7SUFFQyxvQkFBQyxJQUFELEVBQVEsS0FBUixFQUFlLE1BQWY7UUFBQyxJQUFDLENBQUEsT0FBRDtRQUFPLElBQUMsQ0FBQSxPQUFEO1FBQU8sSUFBQyxDQUFBLFNBQUQ7O1lBRWQsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxPQUFVOzs7WUFDWCxJQUFDLENBQUE7O1lBQUQsSUFBQyxDQUFBLE9BQVU7OztZQUNYLElBQUMsQ0FBQTs7WUFBRCxJQUFDLENBQUEsU0FBVTs7UUFDWCxJQUFDLENBQUEsS0FBRCxHQUFXO0lBTFo7O3lCQWFILFNBQUEsR0FBVyxTQUFDLEVBQUQsRUFBSyxFQUFMO0FBRVAsWUFBQTtRQUFBLElBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFmLEtBQXVCLFFBQTFCO1lBQ0ksRUFBQSxHQUFLLElBQUMsQ0FBQSxNQUFPLENBQUEsRUFBQSxFQURqQjtTQUFBLE1BRUssSUFBRyxrQkFBSDtZQUNELENBQUEsR0FBSTtZQUNKLEVBQUUsQ0FBQyxPQUFILENBQVcsQ0FBWDtZQUNBLEVBQUEsR0FBSyxFQUhKOztRQUtMLElBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFmLEtBQXVCLFFBQTFCO1lBQ0ksRUFBQSxHQUFLLElBQUMsQ0FBQSxNQUFPLENBQUEsRUFBQSxFQURqQjtTQUFBLE1BRUssSUFBRyxrQkFBSDtZQUNELENBQUEsR0FBSTtZQUNKLEVBQUEsR0FBSyxFQUFFLENBQUMsT0FBSCxDQUFXLENBQVg7WUFDTCxFQUFBLEdBQUssRUFISjs7ZUFLTCxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxDQUFDLEVBQUQsRUFBSyxFQUFMLENBQVo7SUFoQk87O3lCQXdCWCxTQUFBLEdBQVcsU0FBQTtBQUVQLFlBQUE7UUFBQSxTQUFBOztBQUFhO0FBQUE7aUJBQUEsc0NBQUE7OzZCQUFBO0FBQUE7OztBQUNiO0FBQUEsYUFBQSxzQ0FBQTs7QUFDSSxpQkFBVSwyRkFBVjtnQkFDSSxFQUFBLEdBQUssQ0FBQyxFQUFBLEdBQUcsQ0FBSixDQUFBLEdBQVMsSUFBSSxDQUFDO2dCQUNuQixXQUFHLElBQUssQ0FBQSxFQUFBLENBQUwsRUFBQSxhQUFnQixTQUFVLENBQUEsSUFBSyxDQUFBLEVBQUEsQ0FBTCxDQUExQixFQUFBLElBQUEsS0FBSDtvQkFDSSxTQUFVLENBQUEsSUFBSyxDQUFBLEVBQUEsQ0FBTCxDQUFTLENBQUMsSUFBcEIsQ0FBeUIsSUFBSyxDQUFBLEVBQUEsQ0FBOUIsRUFESjs7Z0JBRUEsV0FBRyxJQUFLLENBQUEsRUFBQSxDQUFMLEVBQUEsYUFBZ0IsU0FBVSxDQUFBLElBQUssQ0FBQSxFQUFBLENBQUwsQ0FBMUIsRUFBQSxJQUFBLEtBQUg7b0JBQ0ksU0FBVSxDQUFBLElBQUssQ0FBQSxFQUFBLENBQUwsQ0FBUyxDQUFDLElBQXBCLENBQXlCLElBQUssQ0FBQSxFQUFBLENBQTlCLEVBREo7O0FBSko7QUFESjtBQVFBLGFBQVUsZ0dBQVY7WUFDSSxRQUFBLEdBQVcsSUFBQyxDQUFBLElBQUQsQ0FBTSxFQUFOO1lBQ1gsUUFBUSxDQUFDLFNBQVQsQ0FBQTtZQUNBLElBQUEsR0FBTyxJQUFDLENBQUEsSUFBRCxDQUFNLFNBQVUsQ0FBQSxFQUFBLENBQUksQ0FBQSxDQUFBLENBQXBCO1lBQ1AsSUFBQSxHQUFPLFFBQVEsQ0FBQyxPQUFULENBQWlCLElBQWpCO1lBQ1AsU0FBVSxDQUFBLEVBQUEsQ0FBRyxDQUFDLElBQWQsQ0FBbUIsQ0FBQSxTQUFBLEtBQUE7dUJBQUEsU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUNmLHdCQUFBO29CQUFBLEVBQUEsR0FBSyxJQUFJLENBQUMsc0JBQUwsQ0FBNEIsSUFBNUIsRUFBa0MsS0FBQyxDQUFBLElBQUQsQ0FBTSxDQUFOLENBQWxDLEVBQTRDLFFBQTVDO29CQUNMLEVBQUEsR0FBSyxJQUFJLENBQUMsc0JBQUwsQ0FBNEIsSUFBNUIsRUFBa0MsS0FBQyxDQUFBLElBQUQsQ0FBTSxDQUFOLENBQWxDLEVBQTRDLFFBQTVDOzJCQUNMLEVBQUEsR0FBSztnQkFIVTtZQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkI7QUFMSjtlQVVBO0lBckJPOzt5QkF1QlgsaUJBQUEsR0FBbUIsU0FBQTtBQUVmLFlBQUE7UUFBQSxTQUFBOztBQUFhO0FBQUE7aUJBQUEsc0NBQUE7OzZCQUFBO0FBQUE7OztBQUNiO0FBQUEsYUFBQSxnREFBQTs7QUFDSSxpQkFBVSwyRkFBVjtnQkFDSSxFQUFBLEdBQUssQ0FBQyxFQUFBLEdBQUcsQ0FBSixDQUFBLEdBQVMsSUFBSSxDQUFDO2dCQUNuQixXQUFHLElBQUssQ0FBQSxFQUFBLENBQUwsRUFBQSxhQUFnQixTQUFVLENBQUEsSUFBSyxDQUFBLEVBQUEsQ0FBTCxDQUExQixFQUFBLElBQUEsS0FBSDtvQkFDSSxTQUFVLENBQUEsSUFBSyxDQUFBLEVBQUEsQ0FBTCxDQUFTLENBQUMsSUFBcEIsQ0FBeUI7d0JBQUEsTUFBQSxFQUFPLElBQUssQ0FBQSxFQUFBLENBQVo7d0JBQWlCLElBQUEsRUFBSyxFQUF0QjtxQkFBekIsRUFESjs7Z0JBRUEsV0FBRyxJQUFLLENBQUEsRUFBQSxDQUFMLEVBQUEsYUFBZ0IsU0FBVSxDQUFBLElBQUssQ0FBQSxFQUFBLENBQUwsQ0FBMUIsRUFBQSxJQUFBLEtBQUg7b0JBQ0ksU0FBVSxDQUFBLElBQUssQ0FBQSxFQUFBLENBQUwsQ0FBUyxDQUFDLElBQXBCLENBQXlCO3dCQUFBLE1BQUEsRUFBTyxJQUFLLENBQUEsRUFBQSxDQUFaO3dCQUFpQixJQUFBLEVBQUssRUFBdEI7cUJBQXpCLEVBREo7O0FBSko7QUFESjtBQVFBLGFBQVUsZ0dBQVY7WUFDSSxRQUFBLEdBQVcsSUFBQyxDQUFBLElBQUQsQ0FBTSxFQUFOO1lBQ1gsUUFBUSxDQUFDLFNBQVQsQ0FBQTtZQUNBLElBQUEsR0FBTyxJQUFDLENBQUEsSUFBRCxDQUFNLFNBQVUsQ0FBQSxFQUFBLENBQUksQ0FBQSxDQUFBLENBQXBCO1lBQ1AsSUFBQSxHQUFPLFFBQVEsQ0FBQyxPQUFULENBQWlCLElBQWpCO1lBQ1AsU0FBVSxDQUFBLEVBQUEsQ0FBRyxDQUFDLElBQWQsQ0FBbUIsQ0FBQSxTQUFBLEtBQUE7dUJBQUEsU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUNmLHdCQUFBO29CQUFBLEVBQUEsR0FBSyxJQUFJLENBQUMsc0JBQUwsQ0FBNEIsSUFBNUIsRUFBa0MsS0FBQyxDQUFBLElBQUQsQ0FBTSxDQUFDLENBQUMsTUFBUixDQUFsQyxFQUFtRCxRQUFuRDtvQkFDTCxFQUFBLEdBQUssSUFBSSxDQUFDLHNCQUFMLENBQTRCLElBQTVCLEVBQWtDLEtBQUMsQ0FBQSxJQUFELENBQU0sQ0FBQyxDQUFDLE1BQVIsQ0FBbEMsRUFBbUQsUUFBbkQ7MkJBQ0wsRUFBQSxHQUFLO2dCQUhVO1lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQjtBQUxKO2VBVUE7SUFyQmU7O3lCQTZCbkIsS0FBQSxHQUFPLFNBQUE7ZUFBRyxZQUFBLENBQWEsSUFBQyxDQUFBLElBQWQ7SUFBSDs7eUJBUVAsS0FBQSxHQUFPLFNBQUE7QUFFSCxZQUFBO1FBQUEsU0FBQSxHQUFZO1FBQ1osU0FBQSxHQUFZLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLFdBQVY7QUFDWixhQUFBLDJDQUFBOztBQUNJLGlCQUFBLDJDQUFBOztnQkFDSSxJQUFHLENBQUUsQ0FBQSxDQUFBLENBQUYsR0FBSyxDQUFFLENBQUEsQ0FBQSxDQUFWO29CQUFtQixRQUFELEVBQUksU0FBdEI7aUJBQUEsTUFBQTtvQkFDbUIsUUFBRCxFQUFJLFNBRHRCOztnQkFFQSxTQUFVLENBQUcsQ0FBRCxHQUFHLEdBQUgsR0FBTSxDQUFSLENBQVYsR0FBeUI7QUFIN0I7QUFESjtlQUtBLENBQUMsQ0FBQyxNQUFGLENBQVMsU0FBVDtJQVRHOzt5QkFXUCxJQUFBLEdBQU0sU0FBQyxFQUFELEVBQUssRUFBTDtlQUVGLElBQUMsQ0FBQSxJQUFELENBQU0sRUFBTixDQUFTLENBQUMsUUFBVixDQUFtQixJQUFDLENBQUEsSUFBRCxDQUFNLEVBQU4sQ0FBbkI7SUFGRTs7eUJBSU4sVUFBQSxHQUFZLFNBQUMsRUFBRCxFQUFLLEVBQUw7ZUFFUixJQUFDLENBQUEsWUFBRCxDQUFjLEVBQWQsQ0FBaUIsQ0FBQyxVQUFsQixDQUE2QixJQUFDLENBQUEsWUFBRCxDQUFjLEVBQWQsQ0FBN0IsQ0FBK0MsQ0FBQyxLQUFoRCxDQUFzRCxHQUF0RDtJQUZROzt5QkFJWixhQUFBLEdBQWUsU0FBQTtBQUVYLFlBQUE7UUFBQSxhQUFBLEdBQWdCO0FBRWhCO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxhQUFBLEdBQWdCLEdBQUEsQ0FBSSxhQUFKLEVBQW1CLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBSyxDQUFBLENBQUEsQ0FBWCxDQUFjLENBQUMsSUFBZixDQUFvQixJQUFDLENBQUEsSUFBRCxDQUFNLElBQUssQ0FBQSxDQUFBLENBQVgsQ0FBcEIsQ0FBbkI7QUFEcEI7ZUFHQTtJQVBXOzt5QkFTZixpQkFBQSxHQUFtQixTQUFBO0FBQ2YsWUFBQTtRQUFBLEtBQUEsR0FBUTtBQUNSO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxNQUFBLEdBQVM7QUFDVDtBQUFBLGlCQUFBLHdDQUFBOztnQkFDSSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBSyxDQUFBLENBQUEsQ0FBWCxDQUFjLENBQUMsRUFBZixDQUFrQixJQUFDLENBQUEsSUFBRCxDQUFNLElBQUssQ0FBQSxDQUFBLENBQVgsQ0FBbEIsQ0FBaUMsQ0FBQyxNQUFsQyxDQUFBLENBQVo7QUFESjtZQUVBLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxNQUFOLENBQUEsR0FBZ0IsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxNQUFOLENBQTNCO0FBSko7ZUFLQSxDQUFDLENBQUMsR0FBRixDQUFNLEtBQU47SUFQZTs7eUJBZW5CLElBQUEsR0FBTSxTQUFDLEVBQUQ7ZUFFRixJQUFJLElBQUosQ0FBUyxJQUFDLENBQUEsTUFBTyxDQUFBLEVBQUEsQ0FBakI7SUFGRTs7eUJBSU4sWUFBQSxHQUFjLFNBQUMsRUFBRDtBQUVWLFlBQUE7UUFBQSxHQUFBLEdBQU0sSUFBSSxJQUFKLENBQVMsQ0FBVCxFQUFXLENBQVgsRUFBYSxDQUFiO0FBQ047QUFBQSxhQUFBLHNDQUFBOztZQUNJLEdBQUcsQ0FBQyxVQUFKLENBQWUsSUFBQyxDQUFBLElBQUQsQ0FBTSxFQUFOLEVBQVUsRUFBVixDQUFmO0FBREo7UUFFQSxHQUFHLENBQUMsU0FBSixDQUFBO2VBQ0E7SUFOVTs7eUJBUWQsYUFBQSxHQUFlLFNBQUMsRUFBRDtBQUVYLFlBQUE7UUFBQSxLQUFBLEdBQVE7QUFDUjtBQUFBLGFBQUEsZ0RBQUE7O1lBQ0ksSUFBRyxhQUFNLElBQU4sRUFBQSxFQUFBLE1BQUg7Z0JBQ0ksS0FBSyxDQUFDLElBQU4sQ0FBVyxFQUFYLEVBREo7O0FBREo7ZUFHQTtJQU5XOzt5QkFRZixLQUFBLEdBQU8sU0FBQyxNQUFEO0FBRUgsWUFBQTtBQUFBO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxDQUFFLENBQUEsQ0FBQSxDQUFGLElBQVE7WUFDUixDQUFFLENBQUEsQ0FBQSxDQUFGLElBQVE7WUFDUixDQUFFLENBQUEsQ0FBQSxDQUFGLElBQVE7QUFIWjtlQUlBO0lBTkc7O3lCQVFQLFNBQUEsR0FBVyxTQUFBO1FBRVAsSUFBQyxDQUFBLFFBQUQsQ0FBQTtRQUNBLElBQUMsQ0FBQSxPQUFELENBQUE7ZUFDQTtJQUpPOzt5QkFZWCxRQUFBLEdBQVUsU0FBQTtBQUVOLFlBQUE7UUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLEtBQUQsQ0FBQTtRQUNSLFdBQUEsR0FBYyxLQUFLLENBQUMsR0FBTixDQUFVLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsR0FBRDtBQUFZLG9CQUFBO2dCQUFWLFlBQUc7dUJBQU8sWUFBQSxDQUFhLEtBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFyQixFQUF5QixLQUFDLENBQUEsTUFBTyxDQUFBLENBQUEsQ0FBakM7WUFBWjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVjtRQUVkLFVBQUEsR0FBYSxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTDtBQUViLGFBQUEsNkNBQUE7O1lBQ0ksVUFBQSxHQUFhLEdBQUEsQ0FBSSxVQUFKLEVBQWdCLENBQWhCO0FBRGpCO1FBR0EsVUFBQSxHQUFhLElBQUEsQ0FBSyxDQUFBLEdBQUUsS0FBSyxDQUFDLE1BQWIsRUFBcUIsVUFBckI7UUFFYixJQUFDLENBQUEsTUFBRCxHQUFVLENBQUMsQ0FBQyxHQUFGLENBQU0sSUFBQyxDQUFBLE1BQVAsRUFBZSxTQUFDLENBQUQ7bUJBQU8sR0FBQSxDQUFJLENBQUosRUFBTyxVQUFQO1FBQVAsQ0FBZjtRQUNWLElBQUMsQ0FBQSxLQUFELEdBQVMsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxJQUFDLENBQUEsS0FBUCxFQUFjLFNBQUMsR0FBRDttQkFBUyxHQUFHLENBQUMsR0FBSixDQUFRLFNBQUMsQ0FBRDt1QkFBTyxHQUFBLENBQUksQ0FBSixFQUFPLFVBQVA7WUFBUCxDQUFSO1FBQVQsQ0FBZDtlQUNUO0lBZE07O3lCQXNCVixPQUFBLEdBQVMsU0FBQTtBQUVMLFlBQUE7UUFBQSxVQUFBLEdBQWEsQ0FBQyxDQUFELEVBQUcsQ0FBSCxFQUFLLENBQUw7UUFDYixTQUFBLEdBQVksQ0FBQyxDQUFDLEdBQUYsQ0FBTSxDQUFDLENBQUMsR0FBRixDQUFNLElBQUMsQ0FBQSxNQUFQLEVBQWUsU0FBQyxDQUFEO21CQUFPLEdBQUEsQ0FBSSxDQUFKO1FBQVAsQ0FBZixDQUFOO1FBQ1osQ0FBQSxHQUFJLENBQUEsR0FBSTtRQUNSLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxJQUFDLENBQUEsTUFBUCxFQUFlLFNBQUMsQ0FBRDttQkFBTyxDQUFDLENBQUEsR0FBRSxDQUFFLENBQUEsQ0FBQSxDQUFMLEVBQVMsQ0FBQSxHQUFFLENBQUUsQ0FBQSxDQUFBLENBQWIsRUFBaUIsQ0FBQSxHQUFFLENBQUUsQ0FBQSxDQUFBLENBQXJCO1FBQVAsQ0FBZjtRQUNWLElBQUMsQ0FBQSxLQUFELEdBQVMsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxJQUFDLENBQUEsS0FBUCxFQUFjLFNBQUMsR0FBRDttQkFBUyxHQUFHLENBQUMsR0FBSixDQUFRLFNBQUMsQ0FBRDt1QkFBTyxDQUFDLENBQUEsR0FBRSxDQUFFLENBQUEsQ0FBQSxDQUFMLEVBQVMsQ0FBQSxHQUFFLENBQUUsQ0FBQSxDQUFBLENBQWIsRUFBaUIsQ0FBQSxHQUFFLENBQUUsQ0FBQSxDQUFBLENBQXJCO1lBQVAsQ0FBUjtRQUFULENBQWQ7ZUFDVDtJQVBLOzt5QkFlVCxPQUFBLEdBQVMsU0FBQTtlQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsQ0FBRDt1QkFBTyxNQUFBLENBQU8sQ0FBQyxDQUFDLEdBQUYsQ0FBTSxTQUFDLEVBQUQ7MkJBQVEsS0FBQyxDQUFBLE1BQU8sQ0FBQSxFQUFBO2dCQUFoQixDQUFOLENBQVA7WUFBUDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVjtJQUFIOzt5QkFFVCxXQUFBLEdBQWEsU0FBQTtBQUVULFlBQUE7UUFBQSxXQUFBLEdBQWM7QUFFZDtBQUFBLGFBQUEsc0NBQUE7O1lBQ0ksV0FBQSxHQUFjLEdBQUEsQ0FBSSxXQUFKLEVBQWlCLEdBQUEsQ0FBSSxHQUFKLENBQWpCO0FBRGxCO2VBR0E7SUFQUzs7eUJBZWIsUUFBQSxHQUFVLFNBQUE7QUFFTixZQUFBO1FBQUEsVUFBQSxHQUFhO1FBQ2IsT0FBQSxHQUFVO1FBQ1YsU0FBQSxHQUFZLElBQUMsQ0FBQSxTQUFELENBQUE7QUFFWjtBQUFBLGFBQUEsZ0RBQUE7O1lBQ0ksSUFBWSxJQUFJLENBQUMsTUFBTCxJQUFlLENBQTNCO0FBQUEseUJBQUE7O0FBRUEsaUJBQUEsd0NBQUE7O2dCQUNJLE1BQUEsR0FBUyxJQUFJLENBQUMsTUFBTCxDQUFZLENBQUEsU0FBQSxLQUFBOzJCQUFBLFNBQUMsQ0FBRDsrQkFBTyxDQUFBLEtBQUs7b0JBQVo7Z0JBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFaLENBQTJCLENBQUMsR0FBNUIsQ0FBZ0MsQ0FBQSxTQUFBLEtBQUE7MkJBQUEsU0FBQyxDQUFEOytCQUFPLEtBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQTtvQkFBZjtnQkFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhDO2dCQUNULElBQUEsR0FBTyxNQUFBLENBQU8sTUFBUDtnQkFDUCxJQUFBLEdBQU8sTUFBQSxDQUFPLE1BQVA7Z0JBQ1AsQ0FBQSxHQUFJLGNBQUEsQ0FBZSxJQUFDLENBQUEsTUFBTyxDQUFBLEVBQUEsQ0FBdkIsRUFBNEIsSUFBNUIsRUFBa0MsSUFBbEM7Z0JBQ0osQ0FBQSxHQUFJLEdBQUEsQ0FBSSxJQUFKLEVBQVMsR0FBQSxDQUFJLElBQUMsQ0FBQSxNQUFPLENBQUEsRUFBQSxDQUFaLEVBQWdCLElBQWhCLENBQVQsQ0FBQSxHQUFnQyxDQUFoQyxJQUFzQyxDQUF0QyxJQUEyQyxDQUFDO2dCQUNoRCxVQUFXLENBQUcsRUFBRCxHQUFJLEdBQUosR0FBTyxFQUFULENBQVgsR0FBNEIsQ0FBQSxHQUFFO0FBTmxDO0FBSEo7UUFXQSxHQUFBLEdBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksU0FBQyxDQUFEO21CQUFPLEdBQUEsQ0FBQTtRQUFQLENBQVo7QUFFTjtBQUFBLGFBQUEsa0RBQUE7O1lBQ0ksSUFBWSxJQUFJLENBQUMsTUFBTCxJQUFlLENBQTNCO0FBQUEseUJBQUE7O1lBRUEsRUFBQSxHQUFLLFFBQUEsQ0FBUyxFQUFUO1lBQ0wsSUFBQSxHQUFPLElBQUMsQ0FBQSxJQUFLLENBQUEsRUFBQTtBQUNiLGlCQUFBLHdDQUFBOztnQkFDSSxNQUFBLEdBQVMsSUFBSSxDQUFDLE1BQUwsQ0FBWSxTQUFDLENBQUQ7MkJBQU8sQ0FBQSxLQUFLO2dCQUFaLENBQVosQ0FBMkIsQ0FBQyxHQUE1QixDQUFnQyxDQUFBLFNBQUEsS0FBQTsyQkFBQSxTQUFDLENBQUQ7K0JBQU8sS0FBQyxDQUFBLE1BQU8sQ0FBQSxDQUFBO29CQUFmO2dCQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEM7Z0JBQ1QsSUFBQSxHQUFPLE1BQUEsQ0FBTyxNQUFQO2dCQUNQLEtBQUEsR0FBUSxVQUFXLENBQUcsRUFBRCxHQUFJLEdBQUosR0FBTyxFQUFUO2dCQUNuQixHQUFJLENBQUEsRUFBQSxDQUFHLENBQUMsVUFBUixDQUFtQixHQUFBLENBQUksSUFBQSxDQUFLLENBQUMsS0FBTixFQUFhLElBQWIsQ0FBSixDQUFuQjtBQUpKO0FBTEo7QUFXQSxhQUFVLGtHQUFWO1lBQ0ksT0FBUSxDQUFBLEVBQUEsQ0FBUixHQUFjLEdBQUksQ0FBQSxFQUFBLENBQUcsQ0FBQyxHQUFSLENBQVksQ0FBQSxHQUFFLFNBQVUsQ0FBQSxFQUFBLENBQUcsQ0FBQyxNQUE1QixDQUFtQyxDQUFDLE1BQXBDLENBQUE7QUFEbEI7UUFHQSxRQUFBLEdBQVc7UUFFWCxJQUFHLEtBQUEsQ0FBTSxVQUFOLENBQUg7QUFDSSxpQkFBQSxlQUFBOztnQkFDSSxRQUFBLElBQVksR0FBQSxDQUFJLEVBQUo7QUFEaEI7WUFFQSxRQUFBLElBQVksQ0FBQyxDQUFDLElBQUYsQ0FBTyxVQUFQLEVBSGhCOztlQUtBLENBQUUsUUFBRixFQUFZLFVBQVosRUFBd0IsT0FBeEI7SUF4Q007O3lCQWdEVixPQUFBLEdBQVMsU0FBQTtBQUVMLFlBQUE7UUFBQSxZQUFBLEdBQWU7QUFDZjtBQUFBLGFBQUEsc0NBQUE7O1lBQ0ksWUFBWSxDQUFDLElBQWIsQ0FBa0IsTUFBQSxDQUFPLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBQSxTQUFBLEtBQUE7dUJBQUEsU0FBQyxJQUFEOzJCQUFVLEtBQUMsQ0FBQSxNQUFPLENBQUEsSUFBQTtnQkFBbEI7WUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQsQ0FBUCxDQUFsQjtBQURKO2VBRUE7SUFMSzs7eUJBT1QsSUFBQSxHQUFNLFNBQUE7QUFFRixZQUFBO1FBQUEsTUFBQSxHQUFTLENBQUMsSUFBQyxDQUFBLElBQUksQ0FBQyxNQUFOLEdBQWUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUF4QixDQUFBLEdBQWtDO2VBQ3hDLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBUCxHQUFjLFVBQWQsR0FBd0IsTUFBeEIsR0FBK0IsVUFBL0IsR0FBeUMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFqRCxHQUF3RDtJQUh4RDs7eUJBS04sUUFBQSxHQUFVLFNBQUMsTUFBRDtBQUVOLFlBQUE7O1lBRk8sU0FBTzs7UUFFZCxJQUFDLENBQUEsTUFBRCxHQUFVO1FBQ1YsV0FBQSxHQUFjO1FBQ2QsV0FBQSxHQUFjLFNBQUMsSUFBRDsrQ0FBVSxXQUFZLENBQUEsSUFBQSxJQUFaLFdBQVksQ0FBQSxJQUFBLElBQVMsQ0FBQyxDQUFDLElBQUYsQ0FBTyxXQUFQO1FBQS9CO0FBRWQsZ0JBQU8sTUFBUDtBQUFBLGlCQUNTLFdBRFQ7Z0JBRVEsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxDQUFBLFNBQUEsS0FBQTsyQkFBQSxTQUFDLENBQUQ7K0JBQU8sV0FBQSxDQUFZLEtBQUMsQ0FBQSxTQUFELENBQVcsQ0FBWCxDQUFaO29CQUFQO2dCQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVjtBQURUO0FBRFQ7Z0JBSVEsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxTQUFDLENBQUQ7MkJBQU8sQ0FBQyxDQUFDLE1BQUYsR0FBVztnQkFBbEIsQ0FBVjtBQUpsQjtlQU9BO0lBYk07O3lCQXFCVixTQUFBLEdBQVcsU0FBQyxJQUFEO0FBRVAsWUFBQTtRQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsR0FBTCxDQUFTLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsQ0FBRDt1QkFBTyxLQUFDLENBQUEsTUFBTyxDQUFBLENBQUE7WUFBZjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVDtRQUNYLE1BQUEsR0FBUztRQUVULE9BQVcsUUFBUSxDQUFDLEtBQVQsQ0FBZSxDQUFDLENBQWhCLENBQVgsRUFBQyxZQUFELEVBQUs7QUFDTCxhQUFBLDBDQUFBOztZQUNJLE1BQU0sQ0FBQyxJQUFQLENBQVksUUFBQSxDQUFTLE9BQUEsQ0FBUSxHQUFBLENBQUksS0FBQSxDQUFNLEdBQUEsQ0FBSSxFQUFKLEVBQVEsRUFBUixDQUFOLEVBQW1CLEdBQUEsQ0FBSSxFQUFKLEVBQVEsRUFBUixDQUFuQixDQUFKLENBQVIsQ0FBVCxDQUFaO1lBQ0EsT0FBVyxDQUFDLEVBQUQsRUFBSyxFQUFMLENBQVgsRUFBQyxZQUFELEVBQUs7QUFGVDtlQUlBLE1BQU0sQ0FBQyxJQUFQLENBQUEsQ0FBYSxDQUFDLElBQWQsQ0FBbUIsR0FBbkI7SUFWTzs7Ozs7O0FBWWYsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4wMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyMjXG5cbiMgUG9seWjDqWRyb25pc21lLCBDb3B5cmlnaHQgMjAxOSwgQW5zZWxtIExldnNrYXlhLCBNSVQgTGljZW5zZVxuXG57IF8sIHJhZDJkZWcsIHZhbGlkIH0gPSByZXF1aXJlICdreGsnXG57IGFkZCwgY2VudGVyLCBjcm9zcywgZG90LCBmYWNlVG9FZGdlcywgZmFjZXNUb1dpbmdzLCBtYWcsIG11bHQsIG5vcm1hbCwgcG9pbnRQbGFuZURpc3QsIHN1YiwgdGFuZ2VudFBvaW50LCB2ZWMgfSA9IHJlcXVpcmUgJy4vbWF0aCdcbnsgYWJzLCBtaW4gfSA9IE1hdGhcblZlY3QgPSByZXF1aXJlICcuLi92ZWN0J1xuXG5jbGFzcyBQb2x5aGVkcm9uIFxuXG4gICAgQDogKEBuYW1lLCBAZmFjZSwgQHZlcnRleCkgLT5cblxuICAgICAgICBAbmFtZSAgID89IFwicG9seWhlZHJvblwiXG4gICAgICAgIEBmYWNlICAgPz0gW11cbiAgICAgICAgQHZlcnRleCA/PSBbXSBcbiAgICAgICAgQGRlYnVnICAgPSBbXVxuXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGRlYnVnTGluZTogKHYxLCB2MikgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHYxLmNvbnN0cnVjdG9yLm5hbWUgPT0gJ051bWJlcidcbiAgICAgICAgICAgIHYxID0gQHZlcnRleFt2MV1cbiAgICAgICAgZWxzZSBpZiB2MS50b0FycmF5P1xuICAgICAgICAgICAgYSA9IFtdXG4gICAgICAgICAgICB2MS50b0FycmF5IGFcbiAgICAgICAgICAgIHYxID0gYVxuXG4gICAgICAgIGlmIHYyLmNvbnN0cnVjdG9yLm5hbWUgPT0gJ051bWJlcidcbiAgICAgICAgICAgIHYyID0gQHZlcnRleFt2Ml1cbiAgICAgICAgZWxzZSBpZiB2Mi50b0FycmF5P1xuICAgICAgICAgICAgYSA9IFtdXG4gICAgICAgICAgICB2MiA9IHYyLnRvQXJyYXkgYVxuICAgICAgICAgICAgdjIgPSBhXG4gICAgICAgIFxuICAgICAgICBAZGVidWcucHVzaCBbdjEsIHYyXVxuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBuZWlnaGJvcnM6IC0+XG5cbiAgICAgICAgbmVpZ2hib3JzID0gKFtdIGZvciB2IGluIEB2ZXJ0ZXgpXG4gICAgICAgIGZvciBmYWNlIGluIEBmYWNlXG4gICAgICAgICAgICBmb3IgdmkgaW4gWzAuLi5mYWNlLmxlbmd0aF1cbiAgICAgICAgICAgICAgICBuaSA9ICh2aSsxKSAlIGZhY2UubGVuZ3RoXG4gICAgICAgICAgICAgICAgaWYgZmFjZVtuaV0gbm90IGluIG5laWdoYm9yc1tmYWNlW3ZpXV1cbiAgICAgICAgICAgICAgICAgICAgbmVpZ2hib3JzW2ZhY2VbdmldXS5wdXNoIGZhY2VbbmldXG4gICAgICAgICAgICAgICAgaWYgZmFjZVt2aV0gbm90IGluIG5laWdoYm9yc1tmYWNlW25pXV1cbiAgICAgICAgICAgICAgICAgICAgbmVpZ2hib3JzW2ZhY2VbbmldXS5wdXNoIGZhY2VbdmldXG4gICAgICAgICAgICAgIFxuICAgICAgICBmb3IgdmkgaW4gWzAuLi5uZWlnaGJvcnMubGVuZ3RoXVxuICAgICAgICAgICAgdG9WZXJ0ZXggPSBAdmVydCB2aVxuICAgICAgICAgICAgdG9WZXJ0ZXgubm9ybWFsaXplKClcbiAgICAgICAgICAgIHRvTjAgPSBAdmVydCBuZWlnaGJvcnNbdmldWzBdXG4gICAgICAgICAgICBwZXJwID0gdG9WZXJ0ZXguY3Jvc3NlZCB0b04wXG4gICAgICAgICAgICBuZWlnaGJvcnNbdmldLnNvcnQgKGEsYikgPT5cbiAgICAgICAgICAgICAgICBhYSA9IFZlY3QuR2V0QW5nbGVCZXR3ZWVuVmVjdG9ycyBwZXJwLCBAdmVydChhKSwgdG9WZXJ0ZXhcbiAgICAgICAgICAgICAgICBiYiA9IFZlY3QuR2V0QW5nbGVCZXR3ZWVuVmVjdG9ycyBwZXJwLCBAdmVydChiKSwgdG9WZXJ0ZXhcbiAgICAgICAgICAgICAgICBhYSAtIGJiXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBuZWlnaGJvcnNcbiAgICAgICAgXG4gICAgbmVpZ2hib3JzQW5kRmFjZXM6IC0+ICMgdW51c2VkXG5cbiAgICAgICAgbmVpZ2hib3JzID0gKFtdIGZvciB2IGluIEB2ZXJ0ZXgpXG4gICAgICAgIGZvciBmYWNlLGZpIGluIEBmYWNlXG4gICAgICAgICAgICBmb3IgdmkgaW4gWzAuLi5mYWNlLmxlbmd0aF1cbiAgICAgICAgICAgICAgICBuaSA9ICh2aSsxKSAlIGZhY2UubGVuZ3RoXG4gICAgICAgICAgICAgICAgaWYgZmFjZVtuaV0gbm90IGluIG5laWdoYm9yc1tmYWNlW3ZpXV1cbiAgICAgICAgICAgICAgICAgICAgbmVpZ2hib3JzW2ZhY2VbdmldXS5wdXNoIHZlcnRleDpmYWNlW25pXSwgZmFjZTpmaVxuICAgICAgICAgICAgICAgIGlmIGZhY2VbdmldIG5vdCBpbiBuZWlnaGJvcnNbZmFjZVtuaV1dXG4gICAgICAgICAgICAgICAgICAgIG5laWdoYm9yc1tmYWNlW25pXV0ucHVzaCB2ZXJ0ZXg6ZmFjZVt2aV0sIGZhY2U6ZmlcbiAgICAgICAgICAgICAgXG4gICAgICAgIGZvciB2aSBpbiBbMC4uLm5laWdoYm9ycy5sZW5ndGhdXG4gICAgICAgICAgICB0b1ZlcnRleCA9IEB2ZXJ0IHZpXG4gICAgICAgICAgICB0b1ZlcnRleC5ub3JtYWxpemUoKVxuICAgICAgICAgICAgdG9OMCA9IEB2ZXJ0IG5laWdoYm9yc1t2aV1bMF1cbiAgICAgICAgICAgIHBlcnAgPSB0b1ZlcnRleC5jcm9zc2VkIHRvTjBcbiAgICAgICAgICAgIG5laWdoYm9yc1t2aV0uc29ydCAoYSxiKSA9PlxuICAgICAgICAgICAgICAgIGFhID0gVmVjdC5HZXRBbmdsZUJldHdlZW5WZWN0b3JzIHBlcnAsIEB2ZXJ0KGEudmVydGV4KSwgdG9WZXJ0ZXhcbiAgICAgICAgICAgICAgICBiYiA9IFZlY3QuR2V0QW5nbGVCZXR3ZWVuVmVjdG9ycyBwZXJwLCBAdmVydChiLnZlcnRleCksIHRvVmVydGV4XG4gICAgICAgICAgICAgICAgYWEgLSBiYlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgbmVpZ2hib3JzXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICB3aW5nczogLT4gZmFjZXNUb1dpbmdzIEBmYWNlXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBlZGdlczogLT5cbiAgICAgICAgXG4gICAgICAgIHVuaXFFZGdlcyA9IHt9XG4gICAgICAgIGZhY2VFZGdlcyA9IEBmYWNlLm1hcCBmYWNlVG9FZGdlc1xuICAgICAgICBmb3IgZWRnZVNldCBpbiBmYWNlRWRnZXNcbiAgICAgICAgICAgIGZvciBlIGluIGVkZ2VTZXRcbiAgICAgICAgICAgICAgICBpZiBlWzBdPGVbMV0gdGhlbiBbYSwgYl0gPSBlXG4gICAgICAgICAgICAgICAgZWxzZSAgICAgICAgICAgICAgW2IsIGFdID0gZVxuICAgICAgICAgICAgICAgIHVuaXFFZGdlc1tcIiN7YX1+I3tifVwiXSA9IGVcbiAgICAgICAgXy52YWx1ZXMgdW5pcUVkZ2VzXG4gICAgICBcbiAgICBlZGdlOiAodjEsIHYyKSAtPlxuICAgICAgICBcbiAgICAgICAgQHZlcnQodjIpLnN1YnRyYWN0IEB2ZXJ0KHYxKVxuICAgIFxuICAgIGVkZ2VOb3JtYWw6ICh2MSwgdjIpIC0+XG4gICAgICAgIFxuICAgICAgICBAdmVydGV4Tm9ybWFsKHYxKS5hZGRJblBsYWNlKEB2ZXJ0ZXhOb3JtYWwodjIpKS5zY2FsZSgwLjUpXG4gICAgICAgIFxuICAgIG1pbkVkZ2VMZW5ndGg6IC0+XG4gICAgICAgIFxuICAgICAgICBtaW5FZGdlTGVuZ3RoID0gSW5maW5pdHlcbiAgICAgICAgXG4gICAgICAgIGZvciBlZGdlIGluIEBlZGdlcygpXG4gICAgICAgICAgICBtaW5FZGdlTGVuZ3RoID0gbWluIG1pbkVkZ2VMZW5ndGgsIEB2ZXJ0KGVkZ2VbMF0pLmRpc3QgQHZlcnQgZWRnZVsxXVxuICAgICAgICAgICAgXG4gICAgICAgIG1pbkVkZ2VMZW5ndGhcblxuICAgIG1heEVkZ2VEaWZmZXJlbmNlOiAtPlxuICAgICAgICBkaWZmcyA9IFtdXG4gICAgICAgIGZvciBmYWNlIGluIEBmYWNlXG4gICAgICAgICAgICBsZW5ndGggPSBbXVxuICAgICAgICAgICAgZm9yIGVkZ2UgaW4gZmFjZVRvRWRnZXMgZmFjZVxuICAgICAgICAgICAgICAgIGxlbmd0aC5wdXNoIEB2ZXJ0KGVkZ2VbMF0pLnRvKEB2ZXJ0KGVkZ2VbMV0pKS5sZW5ndGgoKVxuICAgICAgICAgICAgZGlmZnMucHVzaCBfLm1heChsZW5ndGgpIC0gXy5taW4obGVuZ3RoKVxuICAgICAgICBfLm1heCBkaWZmc1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICBcbiAgICAjICAwMDAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwICAgICAwMDAwMCAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICBcbiAgICAjICAgICAwICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICB2ZXJ0OiAodmkpIC0+IFxuICAgIFxuICAgICAgICBuZXcgVmVjdCBAdmVydGV4W3ZpXVxuICAgICAgICAgICAgICAgIFxuICAgIHZlcnRleE5vcm1hbDogKHZpKSAtPlxuICAgICAgICAgXG4gICAgICAgIHN1bSA9IG5ldyBWZWN0IDAgMCAwXG4gICAgICAgIGZvciBuaSBpbiBAbmVpZ2hib3JzKHZpKVxuICAgICAgICAgICAgc3VtLmFkZEluUGxhY2UgQGVkZ2UgdmksIG5pXG4gICAgICAgIHN1bS5ub3JtYWxpemUoKVxuICAgICAgICBzdW1cbiAgICAgICAgICAgICAgICBcbiAgICBmYWNlc0F0VmVydGV4OiAodmkpIC0+XG4gICAgICAgIFxuICAgICAgICBmYWNlcyA9IFtdXG4gICAgICAgIGZvciBmYWNlLGZpIGluIEBmYWNlXG4gICAgICAgICAgICBpZiB2aSBpbiBmYWNlXG4gICAgICAgICAgICAgICAgZmFjZXMucHVzaCBmaVxuICAgICAgICBmYWNlc1xuICAgICAgICBcbiAgICBzY2FsZTogKGZhY3RvcikgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciB2IGluIEB2ZXJ0ZXhcbiAgICAgICAgICAgIHZbMF0gKj0gZmFjdG9yXG4gICAgICAgICAgICB2WzFdICo9IGZhY3RvclxuICAgICAgICAgICAgdlsyXSAqPSBmYWN0b3JcbiAgICAgICAgQFxuICAgICAgICBcbiAgICBub3JtYWxpemU6IC0+XG4gICAgICAgIFxuICAgICAgICBAcmVjZW50ZXIoKVxuICAgICAgICBAcmVzY2FsZSgpXG4gICAgICAgIEAgICAgICAgIFxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgcmVjZW50ZXI6IC0+XG4gICAgICAgICMgcmVjZW50ZXJzIGVudGlyZSBwb2x5aGVkcm9uIHN1Y2ggdGhhdCBjZW50ZXIgb2YgbWFzcyBpcyBhdCBvcmlnaW5cbiAgICAgICAgZWRnZXMgPSBAZWRnZXMoKVxuICAgICAgICBlZGdlY2VudGVycyA9IGVkZ2VzLm1hcCAoW2EsIGJdKSA9PiB0YW5nZW50UG9pbnQgQHZlcnRleFthXSwgQHZlcnRleFtiXVxuICAgICAgICBcbiAgICAgICAgcG9seWNlbnRlciA9IFswIDAgMF1cbiAgICBcbiAgICAgICAgZm9yIHYgaW4gZWRnZWNlbnRlcnNcbiAgICAgICAgICAgIHBvbHljZW50ZXIgPSBhZGQgcG9seWNlbnRlciwgdlxuICAgICAgICAgICAgXG4gICAgICAgIHBvbHljZW50ZXIgPSBtdWx0IDEvZWRnZXMubGVuZ3RoLCBwb2x5Y2VudGVyXG4gICAgXG4gICAgICAgIEB2ZXJ0ZXggPSBfLm1hcCBAdmVydGV4LCAoeCkgLT4gc3ViIHgsIHBvbHljZW50ZXJcbiAgICAgICAgQGRlYnVnID0gXy5tYXAgQGRlYnVnLCAoZGJnKSAtPiBkYmcubWFwICh4KSAtPiBzdWIgeCwgcG9seWNlbnRlclxuICAgICAgICBAXG4gICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICByZXNjYWxlOiAtPlxuICAgICAgICAjIHJlc2NhbGVzIG1heGltdW0gcmFkaXVzIG9mIHBvbHloZWRyb24gdG8gMVxuICAgICAgICBwb2x5Y2VudGVyID0gWzAgMCAwXVxuICAgICAgICBtYXhFeHRlbnQgPSBfLm1heCBfLm1hcCBAdmVydGV4LCAoeCkgLT4gbWFnIHhcbiAgICAgICAgcyA9IDEgLyBtYXhFeHRlbnRcbiAgICAgICAgQHZlcnRleCA9IF8ubWFwIEB2ZXJ0ZXgsICh4KSAtPiBbcyp4WzBdLCBzKnhbMV0sIHMqeFsyXV1cbiAgICAgICAgQGRlYnVnID0gXy5tYXAgQGRlYnVnLCAoZGJnKSAtPiBkYmcubWFwICh4KSAtPiBbcyp4WzBdLCBzKnhbMV0sIHMqeFsyXV1cbiAgICAgICAgQFxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgY2VudGVyczogLT4gQGZhY2UubWFwIChmKSA9PiBjZW50ZXIgZi5tYXAgKHZpKSA9PiBAdmVydGV4W3ZpXVxuICAgICAgICBcbiAgICBtaW5GYWNlRGlzdDogLT5cbiAgICAgICAgXG4gICAgICAgIG1pbkZhY2VEaXN0ID0gSW5maW5pdHlcbiAgICAgICAgXG4gICAgICAgIGZvciBjdHIgaW4gQGNlbnRlcnMoKVxuICAgICAgICAgICAgbWluRmFjZURpc3QgPSBtaW4gbWluRmFjZURpc3QsIG1hZyBjdHJcbiAgICAgICAgICAgIFxuICAgICAgICBtaW5GYWNlRGlzdFxuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwMCAgMDAwICAgICAgICAgICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgZmxhdG5lc3M6IC0+XG4gICAgICAgIFxuICAgICAgICB2ZXJ0ZXhkaXN0ID0ge31cbiAgICAgICAgb2Zmc2V0cyA9IHt9XG4gICAgICAgIG5laWdoYm9ycyA9IEBuZWlnaGJvcnMoKVxuICAgICAgICBcbiAgICAgICAgZm9yIGZhY2UsZmkgaW4gQGZhY2VcbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIGZhY2UubGVuZ3RoIDw9IDNcbiAgICAgICAgICAgICMgY29udGludWUgaWYgZmFjZS5sZW5ndGggPj0gNlxuICAgICAgICAgICAgZm9yIHZpIGluIGZhY2VcbiAgICAgICAgICAgICAgICBvdGhlcnMgPSBmYWNlLmZpbHRlcigodikgPT4gdiAhPSB2aSkubWFwICh2KSA9PiBAdmVydGV4W3ZdXG4gICAgICAgICAgICAgICAgbm9ybSA9IG5vcm1hbCBvdGhlcnNcbiAgICAgICAgICAgICAgICBjZW50ID0gY2VudGVyIG90aGVyc1xuICAgICAgICAgICAgICAgIGQgPSBwb2ludFBsYW5lRGlzdCBAdmVydGV4W3ZpXSwgY2VudCwgbm9ybVxuICAgICAgICAgICAgICAgIHMgPSBkb3Qobm9ybSxzdWIoQHZlcnRleFt2aV0sY2VudCkpPjAgYW5kIDEgb3IgLTFcbiAgICAgICAgICAgICAgICB2ZXJ0ZXhkaXN0W1wiI3tmaX3ilrgje3ZpfVwiXSA9IHMqZFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgYXZnID0gQHZlcnRleC5tYXAgKHYpIC0+IHZlYygpXG4gICAgICAgIFxuICAgICAgICBmb3IgZmFjZSxmaSBpbiBAZmFjZVxuICAgICAgICAgICAgY29udGludWUgaWYgZmFjZS5sZW5ndGggPD0gM1xuICAgICAgICAgICAgIyBjb250aW51ZSBpZiBmYWNlLmxlbmd0aCA+PSA2XG4gICAgICAgICAgICBmaSA9IHBhcnNlSW50IGZpXG4gICAgICAgICAgICBmYWNlID0gQGZhY2VbZmldXG4gICAgICAgICAgICBmb3IgdmkgaW4gZmFjZVxuICAgICAgICAgICAgICAgIG90aGVycyA9IGZhY2UuZmlsdGVyKCh2KSAtPiB2ICE9IHZpKS5tYXAgKHYpID0+IEB2ZXJ0ZXhbdl1cbiAgICAgICAgICAgICAgICBub3JtID0gbm9ybWFsIG90aGVyc1xuICAgICAgICAgICAgICAgIHZkaXN0ID0gdmVydGV4ZGlzdFtcIiN7Zml94pa4I3t2aX1cIl1cbiAgICAgICAgICAgICAgICBhdmdbdmldLmFkZEluUGxhY2UgdmVjIG11bHQgLXZkaXN0LCBub3JtXG4gICAgICAgIFxuICAgICAgICBmb3IgdmkgaW4gWzAuLi5AdmVydGV4Lmxlbmd0aF1cbiAgICAgICAgICAgIG9mZnNldHNbdmldID0gYXZnW3ZpXS5tdWwoMS9uZWlnaGJvcnNbdmldLmxlbmd0aCkuY29vcmRzKClcblxuICAgICAgICBmbGF0bmVzcyA9IDBcbiAgICAgICAgXG4gICAgICAgIGlmIHZhbGlkIHZlcnRleGRpc3RcbiAgICAgICAgICAgIGZvciBrLHZkIG9mIHZlcnRleGRpc3RcbiAgICAgICAgICAgICAgICBmbGF0bmVzcyArPSBhYnMgdmRcbiAgICAgICAgICAgIGZsYXRuZXNzIC89IF8uc2l6ZSB2ZXJ0ZXhkaXN0XG4gICAgICAgICAgICBcbiAgICAgICAgWyBmbGF0bmVzcywgdmVydGV4ZGlzdCwgb2Zmc2V0cyBdXG4gIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgbm9ybWFsczogLT4gXG4gICAgICAgIFxuICAgICAgICBub3JtYWxzQXJyYXkgPSBbXVxuICAgICAgICBmb3IgZmFjZSBpbiBAZmFjZVxuICAgICAgICAgICAgbm9ybWFsc0FycmF5LnB1c2ggbm9ybWFsIGZhY2UubWFwICh2aWR4KSA9PiBAdmVydGV4W3ZpZHhdXG4gICAgICAgIG5vcm1hbHNBcnJheVxuICBcbiAgICBkYXRhOiAtPlxuICAgICAgICBcbiAgICAgICAgbkVkZ2VzID0gKEBmYWNlLmxlbmd0aCArIEB2ZXJ0ZXgubGVuZ3RoKSAtIDIgIyBFID0gViArIEYgLSAyXG4gICAgICAgIFwiI3tAZmFjZS5sZW5ndGh9IGZhY2VzLCAje25FZGdlc30gZWRnZXMsICN7QHZlcnRleC5sZW5ndGh9IHZlcnRpY2VzXCJcbiAgICAgICAgXG4gICAgY29sb3JpemU6IChtZXRob2Q9J3NpZGVkbmVzcycpIC0+ICMgYXNzaWduIGNvbG9yIGluZGljZXMgdG8gZmFjZXNcbiAgICAgICAgXG4gICAgICAgIEBjb2xvcnMgPSBbXVxuICAgICAgICBjb2xvcm1lbW9yeSA9IHt9XG4gICAgICAgIGNvbG9yYXNzaWduID0gKGhhc2gpIC0+IGNvbG9ybWVtb3J5W2hhc2hdID89IF8uc2l6ZSBjb2xvcm1lbW9yeVxuICAgICAgXG4gICAgICAgIHN3aXRjaCBtZXRob2RcbiAgICAgICAgICAgIHdoZW4gJ3NpZ25hdHVyZScgIyBjb2xvciBieSBjb25ncnVlbmNlIHNpZ25hdHVyZVxuICAgICAgICAgICAgICAgIEBjb2xvcnMgPSBAZmFjZS5tYXAgKGYpID0+IGNvbG9yYXNzaWduIEBzaWduYXR1cmUgZlxuICAgICAgICAgICAgZWxzZSAjIGNvbG9yIGJ5IGZhY2Utc2lkZWRuZXNzXG4gICAgICAgICAgICAgICAgQGNvbG9ycyA9IEBmYWNlLm1hcCAoZikgLT4gZi5sZW5ndGggLSAzXG4gICAgXG4gICAgICAgICMga2xvZyBcIiN7Xy5zaXplKGNvbG9ybWVtb3J5KSsxfSBjb2xvcnM6XCIgQGNvbG9yc1xuICAgICAgICBAXG5cbiAgICAjICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjICAgICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBzaWduYXR1cmU6IChmYWNlKSAtPlxuICAgIFxuICAgICAgICB2ZXJ0aWNlcyA9IGZhY2UubWFwICh2KSA9PiBAdmVydGV4W3ZdXG4gICAgICAgIGFuZ2xlcyA9IFtdXG4gICAgICAgIFxuICAgICAgICBbdjEsIHYyXSA9IHZlcnRpY2VzLnNsaWNlIC0yXG4gICAgICAgIGZvciB2MyBpbiB2ZXJ0aWNlcyAjIGFjY3VtdWxhdGUgaW5uZXIgYW5nbGVzICAgICAgICBcbiAgICAgICAgICAgIGFuZ2xlcy5wdXNoIHBhcnNlSW50IHJhZDJkZWcgbWFnIGNyb3NzIHN1Yih2MSwgdjIpLCBzdWIodjMsIHYyKVxuICAgICAgICAgICAgW3YxLCB2Ml0gPSBbdjIsIHYzXVxuICAgIFxuICAgICAgICBhbmdsZXMuc29ydCgpLmpvaW4gJ18nXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBQb2x5aGVkcm9uXG4gICAgIl19
//# sourceURL=../../coffee/poly/polyhedron.coffee