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
                    aa = perp.angle(_this.vert(a));
                    bb = perp.angle(_this.vert(b));
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
                    aa = perp.angle(_this.vert(a));
                    bb = perp.angle(_this.vert(b));
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
        return this.vert(v2).sub(this.vert(v1));
    };

    Polyhedron.prototype.edgeNormal = function(v1, v2) {
        return this.vertexNormal(v1).add(this.vertexNormal(v2)).scale(0.5);
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
        return vec(this.vertex[vi]);
    };

    Polyhedron.prototype.vertexNormal = function(vi) {
        var i, len, ni, ref2, sum;
        sum = vec(0, 0, 0);
        ref2 = this.neighbors(vi);
        for (i = 0, len = ref2.length; i < len; i++) {
            ni = ref2[i];
            sum.add(this.edge(vi, ni));
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
                avg[vi].add(vec(mult(-vdist, norm)));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWhlZHJvbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsdUtBQUE7SUFBQTs7QUFVQSxNQUF3QixPQUFBLENBQVEsS0FBUixDQUF4QixFQUFFLFNBQUYsRUFBSyxxQkFBTCxFQUFjOztBQUNkLE9BQW9ILE9BQUEsQ0FBUSxRQUFSLENBQXBILEVBQUUsY0FBRixFQUFPLG9CQUFQLEVBQWUsa0JBQWYsRUFBc0IsY0FBdEIsRUFBMkIsOEJBQTNCLEVBQXdDLGdDQUF4QyxFQUFzRCxjQUF0RCxFQUEyRCxnQkFBM0QsRUFBaUUsb0JBQWpFLEVBQXlFLG9DQUF6RSxFQUF5RixjQUF6RixFQUE4RixnQ0FBOUYsRUFBNEc7O0FBQzFHLGNBQUYsRUFBTzs7QUFDUCxJQUFBLEdBQU8sT0FBQSxDQUFRLFNBQVI7O0FBRUQ7SUFFQyxvQkFBQyxJQUFELEVBQVEsS0FBUixFQUFlLE1BQWY7UUFBQyxJQUFDLENBQUEsT0FBRDtRQUFPLElBQUMsQ0FBQSxPQUFEO1FBQU8sSUFBQyxDQUFBLFNBQUQ7O1lBRWQsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxPQUFVOzs7WUFDWCxJQUFDLENBQUE7O1lBQUQsSUFBQyxDQUFBLE9BQVU7OztZQUNYLElBQUMsQ0FBQTs7WUFBRCxJQUFDLENBQUEsU0FBVTs7UUFDWCxJQUFDLENBQUEsS0FBRCxHQUFXO0lBTFo7O3lCQWFILFNBQUEsR0FBVyxTQUFDLEVBQUQsRUFBSyxFQUFMO0FBRVAsWUFBQTtRQUFBLElBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFmLEtBQXVCLFFBQTFCO1lBQ0ksRUFBQSxHQUFLLElBQUMsQ0FBQSxNQUFPLENBQUEsRUFBQSxFQURqQjtTQUFBLE1BRUssSUFBRyxrQkFBSDtZQUNELENBQUEsR0FBSTtZQUNKLEVBQUUsQ0FBQyxPQUFILENBQVcsQ0FBWDtZQUNBLEVBQUEsR0FBSyxFQUhKOztRQUtMLElBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFmLEtBQXVCLFFBQTFCO1lBQ0ksRUFBQSxHQUFLLElBQUMsQ0FBQSxNQUFPLENBQUEsRUFBQSxFQURqQjtTQUFBLE1BRUssSUFBRyxrQkFBSDtZQUNELENBQUEsR0FBSTtZQUNKLEVBQUEsR0FBSyxFQUFFLENBQUMsT0FBSCxDQUFXLENBQVg7WUFDTCxFQUFBLEdBQUssRUFISjs7ZUFLTCxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxDQUFDLEVBQUQsRUFBSyxFQUFMLENBQVo7SUFoQk87O3lCQXdCWCxTQUFBLEdBQVcsU0FBQTtBQUVQLFlBQUE7UUFBQSxTQUFBOztBQUFhO0FBQUE7aUJBQUEsc0NBQUE7OzZCQUFBO0FBQUE7OztBQUNiO0FBQUEsYUFBQSxzQ0FBQTs7QUFDSSxpQkFBVSwyRkFBVjtnQkFDSSxFQUFBLEdBQUssQ0FBQyxFQUFBLEdBQUcsQ0FBSixDQUFBLEdBQVMsSUFBSSxDQUFDO2dCQUNuQixXQUFHLElBQUssQ0FBQSxFQUFBLENBQUwsRUFBQSxhQUFnQixTQUFVLENBQUEsSUFBSyxDQUFBLEVBQUEsQ0FBTCxDQUExQixFQUFBLElBQUEsS0FBSDtvQkFDSSxTQUFVLENBQUEsSUFBSyxDQUFBLEVBQUEsQ0FBTCxDQUFTLENBQUMsSUFBcEIsQ0FBeUIsSUFBSyxDQUFBLEVBQUEsQ0FBOUIsRUFESjs7Z0JBRUEsV0FBRyxJQUFLLENBQUEsRUFBQSxDQUFMLEVBQUEsYUFBZ0IsU0FBVSxDQUFBLElBQUssQ0FBQSxFQUFBLENBQUwsQ0FBMUIsRUFBQSxJQUFBLEtBQUg7b0JBQ0ksU0FBVSxDQUFBLElBQUssQ0FBQSxFQUFBLENBQUwsQ0FBUyxDQUFDLElBQXBCLENBQXlCLElBQUssQ0FBQSxFQUFBLENBQTlCLEVBREo7O0FBSko7QUFESjtBQVFBLGFBQVUsZ0dBQVY7WUFDSSxRQUFBLEdBQVcsSUFBQyxDQUFBLElBQUQsQ0FBTSxFQUFOO1lBQ1gsUUFBUSxDQUFDLFNBQVQsQ0FBQTtZQUNBLElBQUEsR0FBTyxJQUFDLENBQUEsSUFBRCxDQUFNLFNBQVUsQ0FBQSxFQUFBLENBQUksQ0FBQSxDQUFBLENBQXBCO1lBQ1AsSUFBQSxHQUFPLFFBQVEsQ0FBQyxPQUFULENBQWlCLElBQWpCO1lBQ1AsU0FBVSxDQUFBLEVBQUEsQ0FBRyxDQUFDLElBQWQsQ0FBbUIsQ0FBQSxTQUFBLEtBQUE7dUJBQUEsU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUNmLHdCQUFBO29CQUFBLEVBQUEsR0FBSyxJQUFJLENBQUMsS0FBTCxDQUFXLEtBQUMsQ0FBQSxJQUFELENBQU0sQ0FBTixDQUFYO29CQUNMLEVBQUEsR0FBSyxJQUFJLENBQUMsS0FBTCxDQUFXLEtBQUMsQ0FBQSxJQUFELENBQU0sQ0FBTixDQUFYOzJCQUdMLEVBQUEsR0FBSztnQkFMVTtZQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkI7QUFMSjtlQVlBO0lBdkJPOzt5QkF5QlgsaUJBQUEsR0FBbUIsU0FBQTtBQUVmLFlBQUE7UUFBQSxTQUFBOztBQUFhO0FBQUE7aUJBQUEsc0NBQUE7OzZCQUFBO0FBQUE7OztBQUNiO0FBQUEsYUFBQSxnREFBQTs7QUFDSSxpQkFBVSwyRkFBVjtnQkFDSSxFQUFBLEdBQUssQ0FBQyxFQUFBLEdBQUcsQ0FBSixDQUFBLEdBQVMsSUFBSSxDQUFDO2dCQUNuQixXQUFHLElBQUssQ0FBQSxFQUFBLENBQUwsRUFBQSxhQUFnQixTQUFVLENBQUEsSUFBSyxDQUFBLEVBQUEsQ0FBTCxDQUExQixFQUFBLElBQUEsS0FBSDtvQkFDSSxTQUFVLENBQUEsSUFBSyxDQUFBLEVBQUEsQ0FBTCxDQUFTLENBQUMsSUFBcEIsQ0FBeUI7d0JBQUEsTUFBQSxFQUFPLElBQUssQ0FBQSxFQUFBLENBQVo7d0JBQWlCLElBQUEsRUFBSyxFQUF0QjtxQkFBekIsRUFESjs7Z0JBRUEsV0FBRyxJQUFLLENBQUEsRUFBQSxDQUFMLEVBQUEsYUFBZ0IsU0FBVSxDQUFBLElBQUssQ0FBQSxFQUFBLENBQUwsQ0FBMUIsRUFBQSxJQUFBLEtBQUg7b0JBQ0ksU0FBVSxDQUFBLElBQUssQ0FBQSxFQUFBLENBQUwsQ0FBUyxDQUFDLElBQXBCLENBQXlCO3dCQUFBLE1BQUEsRUFBTyxJQUFLLENBQUEsRUFBQSxDQUFaO3dCQUFpQixJQUFBLEVBQUssRUFBdEI7cUJBQXpCLEVBREo7O0FBSko7QUFESjtBQVFBLGFBQVUsZ0dBQVY7WUFDSSxRQUFBLEdBQVcsSUFBQyxDQUFBLElBQUQsQ0FBTSxFQUFOO1lBQ1gsUUFBUSxDQUFDLFNBQVQsQ0FBQTtZQUNBLElBQUEsR0FBTyxJQUFDLENBQUEsSUFBRCxDQUFNLFNBQVUsQ0FBQSxFQUFBLENBQUksQ0FBQSxDQUFBLENBQXBCO1lBQ1AsSUFBQSxHQUFPLFFBQVEsQ0FBQyxPQUFULENBQWlCLElBQWpCO1lBQ1AsU0FBVSxDQUFBLEVBQUEsQ0FBRyxDQUFDLElBQWQsQ0FBbUIsQ0FBQSxTQUFBLEtBQUE7dUJBQUEsU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUNmLHdCQUFBO29CQUFBLEVBQUEsR0FBSyxJQUFJLENBQUMsS0FBTCxDQUFXLEtBQUMsQ0FBQSxJQUFELENBQU0sQ0FBTixDQUFYO29CQUNMLEVBQUEsR0FBSyxJQUFJLENBQUMsS0FBTCxDQUFXLEtBQUMsQ0FBQSxJQUFELENBQU0sQ0FBTixDQUFYOzJCQUdMLEVBQUEsR0FBSztnQkFMVTtZQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkI7QUFMSjtlQVlBO0lBdkJlOzt5QkErQm5CLEtBQUEsR0FBTyxTQUFBO2VBQUcsWUFBQSxDQUFhLElBQUMsQ0FBQSxJQUFkO0lBQUg7O3lCQVFQLEtBQUEsR0FBTyxTQUFBO0FBRUgsWUFBQTtRQUFBLFNBQUEsR0FBWTtRQUNaLFNBQUEsR0FBWSxJQUFDLENBQUEsSUFBSSxDQUFDLEdBQU4sQ0FBVSxXQUFWO0FBQ1osYUFBQSwyQ0FBQTs7QUFDSSxpQkFBQSwyQ0FBQTs7Z0JBQ0ksSUFBRyxDQUFFLENBQUEsQ0FBQSxDQUFGLEdBQUssQ0FBRSxDQUFBLENBQUEsQ0FBVjtvQkFBbUIsUUFBRCxFQUFJLFNBQXRCO2lCQUFBLE1BQUE7b0JBQ21CLFFBQUQsRUFBSSxTQUR0Qjs7Z0JBRUEsU0FBVSxDQUFHLENBQUQsR0FBRyxHQUFILEdBQU0sQ0FBUixDQUFWLEdBQXlCO0FBSDdCO0FBREo7ZUFLQSxDQUFDLENBQUMsTUFBRixDQUFTLFNBQVQ7SUFURzs7eUJBV1AsSUFBQSxHQUFNLFNBQUMsRUFBRCxFQUFLLEVBQUw7ZUFFRixJQUFDLENBQUEsSUFBRCxDQUFNLEVBQU4sQ0FBUyxDQUFDLEdBQVYsQ0FBYyxJQUFDLENBQUEsSUFBRCxDQUFNLEVBQU4sQ0FBZDtJQUZFOzt5QkFJTixVQUFBLEdBQVksU0FBQyxFQUFELEVBQUssRUFBTDtlQUVSLElBQUMsQ0FBQSxZQUFELENBQWMsRUFBZCxDQUFpQixDQUFDLEdBQWxCLENBQXNCLElBQUMsQ0FBQSxZQUFELENBQWMsRUFBZCxDQUF0QixDQUF3QyxDQUFDLEtBQXpDLENBQStDLEdBQS9DO0lBRlE7O3lCQUlaLGFBQUEsR0FBZSxTQUFBO0FBRVgsWUFBQTtRQUFBLGFBQUEsR0FBZ0I7QUFFaEI7QUFBQSxhQUFBLHNDQUFBOztZQUNJLGFBQUEsR0FBZ0IsR0FBQSxDQUFJLGFBQUosRUFBbUIsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFLLENBQUEsQ0FBQSxDQUFYLENBQWMsQ0FBQyxJQUFmLENBQW9CLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBSyxDQUFBLENBQUEsQ0FBWCxDQUFwQixDQUFuQjtBQURwQjtlQUdBO0lBUFc7O3lCQVNmLGlCQUFBLEdBQW1CLFNBQUE7QUFDZixZQUFBO1FBQUEsS0FBQSxHQUFRO0FBQ1I7QUFBQSxhQUFBLHNDQUFBOztZQUNJLE1BQUEsR0FBUztBQUNUO0FBQUEsaUJBQUEsd0NBQUE7O2dCQUNJLE1BQU0sQ0FBQyxJQUFQLENBQVksSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFLLENBQUEsQ0FBQSxDQUFYLENBQWMsQ0FBQyxFQUFmLENBQWtCLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBSyxDQUFBLENBQUEsQ0FBWCxDQUFsQixDQUFpQyxDQUFDLE1BQWxDLENBQUEsQ0FBWjtBQURKO1lBRUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFDLENBQUMsR0FBRixDQUFNLE1BQU4sQ0FBQSxHQUFnQixDQUFDLENBQUMsR0FBRixDQUFNLE1BQU4sQ0FBM0I7QUFKSjtlQUtBLENBQUMsQ0FBQyxHQUFGLENBQU0sS0FBTjtJQVBlOzt5QkFlbkIsSUFBQSxHQUFNLFNBQUMsRUFBRDtlQUVGLEdBQUEsQ0FBSSxJQUFDLENBQUEsTUFBTyxDQUFBLEVBQUEsQ0FBWjtJQUZFOzt5QkFJTixZQUFBLEdBQWMsU0FBQyxFQUFEO0FBRVYsWUFBQTtRQUFBLEdBQUEsR0FBTSxHQUFBLENBQUksQ0FBSixFQUFNLENBQU4sRUFBUSxDQUFSO0FBQ047QUFBQSxhQUFBLHNDQUFBOztZQUNJLEdBQUcsQ0FBQyxHQUFKLENBQVEsSUFBQyxDQUFBLElBQUQsQ0FBTSxFQUFOLEVBQVUsRUFBVixDQUFSO0FBREo7UUFFQSxHQUFHLENBQUMsU0FBSixDQUFBO2VBQ0E7SUFOVTs7eUJBUWQsYUFBQSxHQUFlLFNBQUMsRUFBRDtBQUVYLFlBQUE7UUFBQSxLQUFBLEdBQVE7QUFDUjtBQUFBLGFBQUEsZ0RBQUE7O1lBQ0ksSUFBRyxhQUFNLElBQU4sRUFBQSxFQUFBLE1BQUg7Z0JBQ0ksS0FBSyxDQUFDLElBQU4sQ0FBVyxFQUFYLEVBREo7O0FBREo7ZUFHQTtJQU5XOzt5QkFRZixLQUFBLEdBQU8sU0FBQyxNQUFEO0FBRUgsWUFBQTtBQUFBO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxDQUFFLENBQUEsQ0FBQSxDQUFGLElBQVE7WUFDUixDQUFFLENBQUEsQ0FBQSxDQUFGLElBQVE7WUFDUixDQUFFLENBQUEsQ0FBQSxDQUFGLElBQVE7QUFIWjtlQUlBO0lBTkc7O3lCQVFQLFNBQUEsR0FBVyxTQUFBO1FBRVAsSUFBQyxDQUFBLFFBQUQsQ0FBQTtRQUNBLElBQUMsQ0FBQSxPQUFELENBQUE7ZUFDQTtJQUpPOzt5QkFZWCxRQUFBLEdBQVUsU0FBQTtBQUVOLFlBQUE7UUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLEtBQUQsQ0FBQTtRQUNSLFdBQUEsR0FBYyxLQUFLLENBQUMsR0FBTixDQUFVLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsR0FBRDtBQUFZLG9CQUFBO2dCQUFWLFlBQUc7dUJBQU8sWUFBQSxDQUFhLEtBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQSxDQUFyQixFQUF5QixLQUFDLENBQUEsTUFBTyxDQUFBLENBQUEsQ0FBakM7WUFBWjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVjtRQUVkLFVBQUEsR0FBYSxDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTDtBQUViLGFBQUEsNkNBQUE7O1lBQ0ksVUFBQSxHQUFhLEdBQUEsQ0FBSSxVQUFKLEVBQWdCLENBQWhCO0FBRGpCO1FBR0EsVUFBQSxHQUFhLElBQUEsQ0FBSyxDQUFBLEdBQUUsS0FBSyxDQUFDLE1BQWIsRUFBcUIsVUFBckI7UUFFYixJQUFDLENBQUEsTUFBRCxHQUFVLENBQUMsQ0FBQyxHQUFGLENBQU0sSUFBQyxDQUFBLE1BQVAsRUFBZSxTQUFDLENBQUQ7bUJBQU8sR0FBQSxDQUFJLENBQUosRUFBTyxVQUFQO1FBQVAsQ0FBZjtRQUNWLElBQUMsQ0FBQSxLQUFELEdBQVMsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxJQUFDLENBQUEsS0FBUCxFQUFjLFNBQUMsR0FBRDttQkFBUyxHQUFHLENBQUMsR0FBSixDQUFRLFNBQUMsQ0FBRDt1QkFBTyxHQUFBLENBQUksQ0FBSixFQUFPLFVBQVA7WUFBUCxDQUFSO1FBQVQsQ0FBZDtlQUNUO0lBZE07O3lCQXNCVixPQUFBLEdBQVMsU0FBQTtBQUVMLFlBQUE7UUFBQSxVQUFBLEdBQWEsQ0FBQyxDQUFELEVBQUcsQ0FBSCxFQUFLLENBQUw7UUFDYixTQUFBLEdBQVksQ0FBQyxDQUFDLEdBQUYsQ0FBTSxDQUFDLENBQUMsR0FBRixDQUFNLElBQUMsQ0FBQSxNQUFQLEVBQWUsU0FBQyxDQUFEO21CQUFPLEdBQUEsQ0FBSSxDQUFKO1FBQVAsQ0FBZixDQUFOO1FBQ1osQ0FBQSxHQUFJLENBQUEsR0FBSTtRQUNSLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxJQUFDLENBQUEsTUFBUCxFQUFlLFNBQUMsQ0FBRDttQkFBTyxDQUFDLENBQUEsR0FBRSxDQUFFLENBQUEsQ0FBQSxDQUFMLEVBQVMsQ0FBQSxHQUFFLENBQUUsQ0FBQSxDQUFBLENBQWIsRUFBaUIsQ0FBQSxHQUFFLENBQUUsQ0FBQSxDQUFBLENBQXJCO1FBQVAsQ0FBZjtRQUNWLElBQUMsQ0FBQSxLQUFELEdBQVMsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxJQUFDLENBQUEsS0FBUCxFQUFjLFNBQUMsR0FBRDttQkFBUyxHQUFHLENBQUMsR0FBSixDQUFRLFNBQUMsQ0FBRDt1QkFBTyxDQUFDLENBQUEsR0FBRSxDQUFFLENBQUEsQ0FBQSxDQUFMLEVBQVMsQ0FBQSxHQUFFLENBQUUsQ0FBQSxDQUFBLENBQWIsRUFBaUIsQ0FBQSxHQUFFLENBQUUsQ0FBQSxDQUFBLENBQXJCO1lBQVAsQ0FBUjtRQUFULENBQWQ7ZUFDVDtJQVBLOzt5QkFlVCxPQUFBLEdBQVMsU0FBQTtlQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLENBQUEsU0FBQSxLQUFBO21CQUFBLFNBQUMsQ0FBRDt1QkFBTyxNQUFBLENBQU8sQ0FBQyxDQUFDLEdBQUYsQ0FBTSxTQUFDLEVBQUQ7MkJBQVEsS0FBQyxDQUFBLE1BQU8sQ0FBQSxFQUFBO2dCQUFoQixDQUFOLENBQVA7WUFBUDtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVjtJQUFIOzt5QkFFVCxXQUFBLEdBQWEsU0FBQTtBQUVULFlBQUE7UUFBQSxXQUFBLEdBQWM7QUFFZDtBQUFBLGFBQUEsc0NBQUE7O1lBQ0ksV0FBQSxHQUFjLEdBQUEsQ0FBSSxXQUFKLEVBQWlCLEdBQUEsQ0FBSSxHQUFKLENBQWpCO0FBRGxCO2VBR0E7SUFQUzs7eUJBZWIsUUFBQSxHQUFVLFNBQUE7QUFFTixZQUFBO1FBQUEsVUFBQSxHQUFhO1FBQ2IsT0FBQSxHQUFVO1FBQ1YsU0FBQSxHQUFZLElBQUMsQ0FBQSxTQUFELENBQUE7QUFFWjtBQUFBLGFBQUEsZ0RBQUE7O1lBQ0ksSUFBWSxJQUFJLENBQUMsTUFBTCxJQUFlLENBQTNCO0FBQUEseUJBQUE7O0FBRUEsaUJBQUEsd0NBQUE7O2dCQUNJLE1BQUEsR0FBUyxJQUFJLENBQUMsTUFBTCxDQUFZLENBQUEsU0FBQSxLQUFBOzJCQUFBLFNBQUMsQ0FBRDsrQkFBTyxDQUFBLEtBQUs7b0JBQVo7Z0JBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFaLENBQTJCLENBQUMsR0FBNUIsQ0FBZ0MsQ0FBQSxTQUFBLEtBQUE7MkJBQUEsU0FBQyxDQUFEOytCQUFPLEtBQUMsQ0FBQSxNQUFPLENBQUEsQ0FBQTtvQkFBZjtnQkFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhDO2dCQUNULElBQUEsR0FBTyxNQUFBLENBQU8sTUFBUDtnQkFDUCxJQUFBLEdBQU8sTUFBQSxDQUFPLE1BQVA7Z0JBQ1AsQ0FBQSxHQUFJLGNBQUEsQ0FBZSxJQUFDLENBQUEsTUFBTyxDQUFBLEVBQUEsQ0FBdkIsRUFBNEIsSUFBNUIsRUFBa0MsSUFBbEM7Z0JBQ0osQ0FBQSxHQUFJLEdBQUEsQ0FBSSxJQUFKLEVBQVMsR0FBQSxDQUFJLElBQUMsQ0FBQSxNQUFPLENBQUEsRUFBQSxDQUFaLEVBQWdCLElBQWhCLENBQVQsQ0FBQSxHQUFnQyxDQUFoQyxJQUFzQyxDQUF0QyxJQUEyQyxDQUFDO2dCQUNoRCxVQUFXLENBQUcsRUFBRCxHQUFJLEdBQUosR0FBTyxFQUFULENBQVgsR0FBNEIsQ0FBQSxHQUFFO0FBTmxDO0FBSEo7UUFXQSxHQUFBLEdBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksU0FBQyxDQUFEO21CQUFPLEdBQUEsQ0FBQTtRQUFQLENBQVo7QUFFTjtBQUFBLGFBQUEsa0RBQUE7O1lBQ0ksSUFBWSxJQUFJLENBQUMsTUFBTCxJQUFlLENBQTNCO0FBQUEseUJBQUE7O1lBRUEsRUFBQSxHQUFLLFFBQUEsQ0FBUyxFQUFUO1lBQ0wsSUFBQSxHQUFPLElBQUMsQ0FBQSxJQUFLLENBQUEsRUFBQTtBQUNiLGlCQUFBLHdDQUFBOztnQkFDSSxNQUFBLEdBQVMsSUFBSSxDQUFDLE1BQUwsQ0FBWSxTQUFDLENBQUQ7MkJBQU8sQ0FBQSxLQUFLO2dCQUFaLENBQVosQ0FBMkIsQ0FBQyxHQUE1QixDQUFnQyxDQUFBLFNBQUEsS0FBQTsyQkFBQSxTQUFDLENBQUQ7K0JBQU8sS0FBQyxDQUFBLE1BQU8sQ0FBQSxDQUFBO29CQUFmO2dCQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEM7Z0JBQ1QsSUFBQSxHQUFPLE1BQUEsQ0FBTyxNQUFQO2dCQUNQLEtBQUEsR0FBUSxVQUFXLENBQUcsRUFBRCxHQUFJLEdBQUosR0FBTyxFQUFUO2dCQUNuQixHQUFJLENBQUEsRUFBQSxDQUFHLENBQUMsR0FBUixDQUFZLEdBQUEsQ0FBSSxJQUFBLENBQUssQ0FBQyxLQUFOLEVBQWEsSUFBYixDQUFKLENBQVo7QUFKSjtBQUxKO0FBV0EsYUFBVSxrR0FBVjtZQUNJLE9BQVEsQ0FBQSxFQUFBLENBQVIsR0FBYyxHQUFJLENBQUEsRUFBQSxDQUFHLENBQUMsR0FBUixDQUFZLENBQUEsR0FBRSxTQUFVLENBQUEsRUFBQSxDQUFHLENBQUMsTUFBNUIsQ0FBbUMsQ0FBQyxNQUFwQyxDQUFBO0FBRGxCO1FBR0EsUUFBQSxHQUFXO1FBRVgsSUFBRyxLQUFBLENBQU0sVUFBTixDQUFIO0FBQ0ksaUJBQUEsZUFBQTs7Z0JBQ0ksUUFBQSxJQUFZLEdBQUEsQ0FBSSxFQUFKO0FBRGhCO1lBRUEsUUFBQSxJQUFZLENBQUMsQ0FBQyxJQUFGLENBQU8sVUFBUCxFQUhoQjs7ZUFLQSxDQUFFLFFBQUYsRUFBWSxVQUFaLEVBQXdCLE9BQXhCO0lBeENNOzt5QkFnRFYsT0FBQSxHQUFTLFNBQUE7QUFFTCxZQUFBO1FBQUEsWUFBQSxHQUFlO0FBQ2Y7QUFBQSxhQUFBLHNDQUFBOztZQUNJLFlBQVksQ0FBQyxJQUFiLENBQWtCLE1BQUEsQ0FBTyxJQUFJLENBQUMsR0FBTCxDQUFTLENBQUEsU0FBQSxLQUFBO3VCQUFBLFNBQUMsSUFBRDsyQkFBVSxLQUFDLENBQUEsTUFBTyxDQUFBLElBQUE7Z0JBQWxCO1lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFULENBQVAsQ0FBbEI7QUFESjtlQUVBO0lBTEs7O3lCQU9ULElBQUEsR0FBTSxTQUFBO0FBRUYsWUFBQTtRQUFBLE1BQUEsR0FBUyxDQUFDLElBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixHQUFlLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBeEIsQ0FBQSxHQUFrQztlQUN4QyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQVAsR0FBYyxVQUFkLEdBQXdCLE1BQXhCLEdBQStCLFVBQS9CLEdBQXlDLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBakQsR0FBd0Q7SUFIeEQ7O3lCQUtOLFFBQUEsR0FBVSxTQUFDLE1BQUQ7QUFFTixZQUFBOztZQUZPLFNBQU87O1FBRWQsSUFBQyxDQUFBLE1BQUQsR0FBVTtRQUNWLFdBQUEsR0FBYztRQUNkLFdBQUEsR0FBYyxTQUFDLElBQUQ7K0NBQVUsV0FBWSxDQUFBLElBQUEsSUFBWixXQUFZLENBQUEsSUFBQSxJQUFTLENBQUMsQ0FBQyxJQUFGLENBQU8sV0FBUDtRQUEvQjtBQUVkLGdCQUFPLE1BQVA7QUFBQSxpQkFDUyxXQURUO2dCQUVRLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQVUsQ0FBQSxTQUFBLEtBQUE7MkJBQUEsU0FBQyxDQUFEOytCQUFPLFdBQUEsQ0FBWSxLQUFDLENBQUEsU0FBRCxDQUFXLENBQVgsQ0FBWjtvQkFBUDtnQkFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVY7QUFEVDtBQURUO2dCQUlRLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQVUsU0FBQyxDQUFEOzJCQUFPLENBQUMsQ0FBQyxNQUFGLEdBQVc7Z0JBQWxCLENBQVY7QUFKbEI7ZUFPQTtJQWJNOzt5QkFxQlYsU0FBQSxHQUFXLFNBQUMsSUFBRDtBQUVQLFlBQUE7UUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLENBQUQ7dUJBQU8sS0FBQyxDQUFBLE1BQU8sQ0FBQSxDQUFBO1lBQWY7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQ7UUFDWCxNQUFBLEdBQVM7UUFFVCxPQUFXLFFBQVEsQ0FBQyxLQUFULENBQWUsQ0FBQyxDQUFoQixDQUFYLEVBQUMsWUFBRCxFQUFLO0FBQ0wsYUFBQSwwQ0FBQTs7WUFDSSxNQUFNLENBQUMsSUFBUCxDQUFZLFFBQUEsQ0FBUyxPQUFBLENBQVEsR0FBQSxDQUFJLEtBQUEsQ0FBTSxHQUFBLENBQUksRUFBSixFQUFRLEVBQVIsQ0FBTixFQUFtQixHQUFBLENBQUksRUFBSixFQUFRLEVBQVIsQ0FBbkIsQ0FBSixDQUFSLENBQVQsQ0FBWjtZQUNBLE9BQVcsQ0FBQyxFQUFELEVBQUssRUFBTCxDQUFYLEVBQUMsWUFBRCxFQUFLO0FBRlQ7ZUFJQSxNQUFNLENBQUMsSUFBUCxDQUFBLENBQWEsQ0FBQyxJQUFkLENBQW1CLEdBQW5CO0lBVk87Ozs7OztBQVlmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbjAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMjI1xuXG4jIFBvbHlow6lkcm9uaXNtZSwgQ29weXJpZ2h0IDIwMTksIEFuc2VsbSBMZXZza2F5YSwgTUlUIExpY2Vuc2VcblxueyBfLCByYWQyZGVnLCB2YWxpZCB9ID0gcmVxdWlyZSAna3hrJ1xueyBhZGQsIGNlbnRlciwgY3Jvc3MsIGRvdCwgZmFjZVRvRWRnZXMsIGZhY2VzVG9XaW5ncywgbWFnLCBtdWx0LCBub3JtYWwsIHBvaW50UGxhbmVEaXN0LCBzdWIsIHRhbmdlbnRQb2ludCwgdmVjIH0gPSByZXF1aXJlICcuL21hdGgnXG57IGFicywgbWluIH0gPSBNYXRoXG5WZWN0ID0gcmVxdWlyZSAnLi4vdmVjdCdcblxuY2xhc3MgUG9seWhlZHJvbiBcblxuICAgIEA6IChAbmFtZSwgQGZhY2UsIEB2ZXJ0ZXgpIC0+XG5cbiAgICAgICAgQG5hbWUgICA/PSBcInBvbHloZWRyb25cIlxuICAgICAgICBAZmFjZSAgID89IFtdXG4gICAgICAgIEB2ZXJ0ZXggPz0gW10gXG4gICAgICAgIEBkZWJ1ZyAgID0gW11cblxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBkZWJ1Z0xpbmU6ICh2MSwgdjIpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB2MS5jb25zdHJ1Y3Rvci5uYW1lID09ICdOdW1iZXInXG4gICAgICAgICAgICB2MSA9IEB2ZXJ0ZXhbdjFdXG4gICAgICAgIGVsc2UgaWYgdjEudG9BcnJheT9cbiAgICAgICAgICAgIGEgPSBbXVxuICAgICAgICAgICAgdjEudG9BcnJheSBhXG4gICAgICAgICAgICB2MSA9IGFcblxuICAgICAgICBpZiB2Mi5jb25zdHJ1Y3Rvci5uYW1lID09ICdOdW1iZXInXG4gICAgICAgICAgICB2MiA9IEB2ZXJ0ZXhbdjJdXG4gICAgICAgIGVsc2UgaWYgdjIudG9BcnJheT9cbiAgICAgICAgICAgIGEgPSBbXVxuICAgICAgICAgICAgdjIgPSB2Mi50b0FycmF5IGFcbiAgICAgICAgICAgIHYyID0gYVxuICAgICAgICBcbiAgICAgICAgQGRlYnVnLnB1c2ggW3YxLCB2Ml1cbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgbmVpZ2hib3JzOiAtPlxuXG4gICAgICAgIG5laWdoYm9ycyA9IChbXSBmb3IgdiBpbiBAdmVydGV4KVxuICAgICAgICBmb3IgZmFjZSBpbiBAZmFjZVxuICAgICAgICAgICAgZm9yIHZpIGluIFswLi4uZmFjZS5sZW5ndGhdXG4gICAgICAgICAgICAgICAgbmkgPSAodmkrMSkgJSBmYWNlLmxlbmd0aFxuICAgICAgICAgICAgICAgIGlmIGZhY2VbbmldIG5vdCBpbiBuZWlnaGJvcnNbZmFjZVt2aV1dXG4gICAgICAgICAgICAgICAgICAgIG5laWdoYm9yc1tmYWNlW3ZpXV0ucHVzaCBmYWNlW25pXVxuICAgICAgICAgICAgICAgIGlmIGZhY2VbdmldIG5vdCBpbiBuZWlnaGJvcnNbZmFjZVtuaV1dXG4gICAgICAgICAgICAgICAgICAgIG5laWdoYm9yc1tmYWNlW25pXV0ucHVzaCBmYWNlW3ZpXVxuICAgICAgICAgICAgICBcbiAgICAgICAgZm9yIHZpIGluIFswLi4ubmVpZ2hib3JzLmxlbmd0aF1cbiAgICAgICAgICAgIHRvVmVydGV4ID0gQHZlcnQgdmlcbiAgICAgICAgICAgIHRvVmVydGV4Lm5vcm1hbGl6ZSgpXG4gICAgICAgICAgICB0b04wID0gQHZlcnQgbmVpZ2hib3JzW3ZpXVswXVxuICAgICAgICAgICAgcGVycCA9IHRvVmVydGV4LmNyb3NzZWQgdG9OMFxuICAgICAgICAgICAgbmVpZ2hib3JzW3ZpXS5zb3J0IChhLGIpID0+XG4gICAgICAgICAgICAgICAgYWEgPSBwZXJwLmFuZ2xlIEB2ZXJ0KGEpXG4gICAgICAgICAgICAgICAgYmIgPSBwZXJwLmFuZ2xlIEB2ZXJ0KGIpXG4gICAgICAgICAgICAgICAgIyBhYSA9IFZlY3QuR2V0QW5nbGVCZXR3ZWVuVmVjdG9ycyBwZXJwLCBAdmVydChhKSwgdG9WZXJ0ZXhcbiAgICAgICAgICAgICAgICAjIGJiID0gVmVjdC5HZXRBbmdsZUJldHdlZW5WZWN0b3JzIHBlcnAsIEB2ZXJ0KGIpLCB0b1ZlcnRleFxuICAgICAgICAgICAgICAgIGFhIC0gYmJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIG5laWdoYm9yc1xuICAgICAgICBcbiAgICBuZWlnaGJvcnNBbmRGYWNlczogLT4gIyB1bnVzZWRcblxuICAgICAgICBuZWlnaGJvcnMgPSAoW10gZm9yIHYgaW4gQHZlcnRleClcbiAgICAgICAgZm9yIGZhY2UsZmkgaW4gQGZhY2VcbiAgICAgICAgICAgIGZvciB2aSBpbiBbMC4uLmZhY2UubGVuZ3RoXVxuICAgICAgICAgICAgICAgIG5pID0gKHZpKzEpICUgZmFjZS5sZW5ndGhcbiAgICAgICAgICAgICAgICBpZiBmYWNlW25pXSBub3QgaW4gbmVpZ2hib3JzW2ZhY2VbdmldXVxuICAgICAgICAgICAgICAgICAgICBuZWlnaGJvcnNbZmFjZVt2aV1dLnB1c2ggdmVydGV4OmZhY2VbbmldLCBmYWNlOmZpXG4gICAgICAgICAgICAgICAgaWYgZmFjZVt2aV0gbm90IGluIG5laWdoYm9yc1tmYWNlW25pXV1cbiAgICAgICAgICAgICAgICAgICAgbmVpZ2hib3JzW2ZhY2VbbmldXS5wdXNoIHZlcnRleDpmYWNlW3ZpXSwgZmFjZTpmaVxuICAgICAgICAgICAgICBcbiAgICAgICAgZm9yIHZpIGluIFswLi4ubmVpZ2hib3JzLmxlbmd0aF1cbiAgICAgICAgICAgIHRvVmVydGV4ID0gQHZlcnQgdmlcbiAgICAgICAgICAgIHRvVmVydGV4Lm5vcm1hbGl6ZSgpXG4gICAgICAgICAgICB0b04wID0gQHZlcnQgbmVpZ2hib3JzW3ZpXVswXVxuICAgICAgICAgICAgcGVycCA9IHRvVmVydGV4LmNyb3NzZWQgdG9OMFxuICAgICAgICAgICAgbmVpZ2hib3JzW3ZpXS5zb3J0IChhLGIpID0+XG4gICAgICAgICAgICAgICAgYWEgPSBwZXJwLmFuZ2xlIEB2ZXJ0KGEpXG4gICAgICAgICAgICAgICAgYmIgPSBwZXJwLmFuZ2xlIEB2ZXJ0KGIpICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICMgYWEgPSBWZWN0LkdldEFuZ2xlQmV0d2VlblZlY3RvcnMgcGVycCwgQHZlcnQoYS52ZXJ0ZXgpLCB0b1ZlcnRleFxuICAgICAgICAgICAgICAgICMgYmIgPSBWZWN0LkdldEFuZ2xlQmV0d2VlblZlY3RvcnMgcGVycCwgQHZlcnQoYi52ZXJ0ZXgpLCB0b1ZlcnRleFxuICAgICAgICAgICAgICAgIGFhIC0gYmJcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIG5laWdoYm9yc1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgd2luZ3M6IC0+IGZhY2VzVG9XaW5ncyBAZmFjZVxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgZWRnZXM6IC0+XG4gICAgICAgIFxuICAgICAgICB1bmlxRWRnZXMgPSB7fVxuICAgICAgICBmYWNlRWRnZXMgPSBAZmFjZS5tYXAgZmFjZVRvRWRnZXNcbiAgICAgICAgZm9yIGVkZ2VTZXQgaW4gZmFjZUVkZ2VzXG4gICAgICAgICAgICBmb3IgZSBpbiBlZGdlU2V0XG4gICAgICAgICAgICAgICAgaWYgZVswXTxlWzFdIHRoZW4gW2EsIGJdID0gZVxuICAgICAgICAgICAgICAgIGVsc2UgICAgICAgICAgICAgIFtiLCBhXSA9IGVcbiAgICAgICAgICAgICAgICB1bmlxRWRnZXNbXCIje2F9fiN7Yn1cIl0gPSBlXG4gICAgICAgIF8udmFsdWVzIHVuaXFFZGdlc1xuICAgICAgXG4gICAgZWRnZTogKHYxLCB2MikgLT5cbiAgICAgICAgXG4gICAgICAgIEB2ZXJ0KHYyKS5zdWIgQHZlcnQodjEpXG4gICAgXG4gICAgZWRnZU5vcm1hbDogKHYxLCB2MikgLT5cbiAgICAgICAgXG4gICAgICAgIEB2ZXJ0ZXhOb3JtYWwodjEpLmFkZChAdmVydGV4Tm9ybWFsKHYyKSkuc2NhbGUoMC41KVxuICAgICAgICBcbiAgICBtaW5FZGdlTGVuZ3RoOiAtPlxuICAgICAgICBcbiAgICAgICAgbWluRWRnZUxlbmd0aCA9IEluZmluaXR5XG4gICAgICAgIFxuICAgICAgICBmb3IgZWRnZSBpbiBAZWRnZXMoKVxuICAgICAgICAgICAgbWluRWRnZUxlbmd0aCA9IG1pbiBtaW5FZGdlTGVuZ3RoLCBAdmVydChlZGdlWzBdKS5kaXN0IEB2ZXJ0IGVkZ2VbMV1cbiAgICAgICAgICAgIFxuICAgICAgICBtaW5FZGdlTGVuZ3RoXG5cbiAgICBtYXhFZGdlRGlmZmVyZW5jZTogLT5cbiAgICAgICAgZGlmZnMgPSBbXVxuICAgICAgICBmb3IgZmFjZSBpbiBAZmFjZVxuICAgICAgICAgICAgbGVuZ3RoID0gW11cbiAgICAgICAgICAgIGZvciBlZGdlIGluIGZhY2VUb0VkZ2VzIGZhY2VcbiAgICAgICAgICAgICAgICBsZW5ndGgucHVzaCBAdmVydChlZGdlWzBdKS50byhAdmVydChlZGdlWzFdKSkubGVuZ3RoKClcbiAgICAgICAgICAgIGRpZmZzLnB1c2ggXy5tYXgobGVuZ3RoKSAtIF8ubWluKGxlbmd0aClcbiAgICAgICAgXy5tYXggZGlmZnNcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgMDAwICAgXG4gICAgIyAgMDAwIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgICAgIDAwMCAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgXG4gICAgIyAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgICAwMDAgMDAwICAgXG4gICAgIyAgICAgMCAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgdmVydDogKHZpKSAtPiBcbiAgICBcbiAgICAgICAgdmVjIEB2ZXJ0ZXhbdmldXG4gICAgICAgICAgICAgICAgXG4gICAgdmVydGV4Tm9ybWFsOiAodmkpIC0+XG4gICAgICAgICBcbiAgICAgICAgc3VtID0gdmVjIDAgMCAwXG4gICAgICAgIGZvciBuaSBpbiBAbmVpZ2hib3JzKHZpKVxuICAgICAgICAgICAgc3VtLmFkZCBAZWRnZSB2aSwgbmlcbiAgICAgICAgc3VtLm5vcm1hbGl6ZSgpXG4gICAgICAgIHN1bVxuICAgICAgICAgICAgICAgIFxuICAgIGZhY2VzQXRWZXJ0ZXg6ICh2aSkgLT5cbiAgICAgICAgXG4gICAgICAgIGZhY2VzID0gW11cbiAgICAgICAgZm9yIGZhY2UsZmkgaW4gQGZhY2VcbiAgICAgICAgICAgIGlmIHZpIGluIGZhY2VcbiAgICAgICAgICAgICAgICBmYWNlcy5wdXNoIGZpXG4gICAgICAgIGZhY2VzXG4gICAgICAgIFxuICAgIHNjYWxlOiAoZmFjdG9yKSAtPlxuICAgICAgICBcbiAgICAgICAgZm9yIHYgaW4gQHZlcnRleFxuICAgICAgICAgICAgdlswXSAqPSBmYWN0b3JcbiAgICAgICAgICAgIHZbMV0gKj0gZmFjdG9yXG4gICAgICAgICAgICB2WzJdICo9IGZhY3RvclxuICAgICAgICBAXG4gICAgICAgIFxuICAgIG5vcm1hbGl6ZTogLT5cbiAgICAgICAgXG4gICAgICAgIEByZWNlbnRlcigpXG4gICAgICAgIEByZXNjYWxlKClcbiAgICAgICAgQCAgICAgICAgXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICByZWNlbnRlcjogLT5cbiAgICAgICAgIyByZWNlbnRlcnMgZW50aXJlIHBvbHloZWRyb24gc3VjaCB0aGF0IGNlbnRlciBvZiBtYXNzIGlzIGF0IG9yaWdpblxuICAgICAgICBlZGdlcyA9IEBlZGdlcygpXG4gICAgICAgIGVkZ2VjZW50ZXJzID0gZWRnZXMubWFwIChbYSwgYl0pID0+IHRhbmdlbnRQb2ludCBAdmVydGV4W2FdLCBAdmVydGV4W2JdXG4gICAgICAgIFxuICAgICAgICBwb2x5Y2VudGVyID0gWzAgMCAwXVxuICAgIFxuICAgICAgICBmb3IgdiBpbiBlZGdlY2VudGVyc1xuICAgICAgICAgICAgcG9seWNlbnRlciA9IGFkZCBwb2x5Y2VudGVyLCB2XG4gICAgICAgICAgICBcbiAgICAgICAgcG9seWNlbnRlciA9IG11bHQgMS9lZGdlcy5sZW5ndGgsIHBvbHljZW50ZXJcbiAgICBcbiAgICAgICAgQHZlcnRleCA9IF8ubWFwIEB2ZXJ0ZXgsICh4KSAtPiBzdWIgeCwgcG9seWNlbnRlclxuICAgICAgICBAZGVidWcgPSBfLm1hcCBAZGVidWcsIChkYmcpIC0+IGRiZy5tYXAgKHgpIC0+IHN1YiB4LCBwb2x5Y2VudGVyXG4gICAgICAgIEBcbiAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHJlc2NhbGU6IC0+XG4gICAgICAgICMgcmVzY2FsZXMgbWF4aW11bSByYWRpdXMgb2YgcG9seWhlZHJvbiB0byAxXG4gICAgICAgIHBvbHljZW50ZXIgPSBbMCAwIDBdXG4gICAgICAgIG1heEV4dGVudCA9IF8ubWF4IF8ubWFwIEB2ZXJ0ZXgsICh4KSAtPiBtYWcgeFxuICAgICAgICBzID0gMSAvIG1heEV4dGVudFxuICAgICAgICBAdmVydGV4ID0gXy5tYXAgQHZlcnRleCwgKHgpIC0+IFtzKnhbMF0sIHMqeFsxXSwgcyp4WzJdXVxuICAgICAgICBAZGVidWcgPSBfLm1hcCBAZGVidWcsIChkYmcpIC0+IGRiZy5tYXAgKHgpIC0+IFtzKnhbMF0sIHMqeFsxXSwgcyp4WzJdXVxuICAgICAgICBAXG4gICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBjZW50ZXJzOiAtPiBAZmFjZS5tYXAgKGYpID0+IGNlbnRlciBmLm1hcCAodmkpID0+IEB2ZXJ0ZXhbdmldXG4gICAgICAgIFxuICAgIG1pbkZhY2VEaXN0OiAtPlxuICAgICAgICBcbiAgICAgICAgbWluRmFjZURpc3QgPSBJbmZpbml0eVxuICAgICAgICBcbiAgICAgICAgZm9yIGN0ciBpbiBAY2VudGVycygpXG4gICAgICAgICAgICBtaW5GYWNlRGlzdCA9IG1pbiBtaW5GYWNlRGlzdCwgbWFnIGN0clxuICAgICAgICAgICAgXG4gICAgICAgIG1pbkZhY2VEaXN0XG5cbiAgICAjIDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMCAgICAwMDAgICAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAwICAwMDAgICAgICAgICAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBmbGF0bmVzczogLT5cbiAgICAgICAgXG4gICAgICAgIHZlcnRleGRpc3QgPSB7fVxuICAgICAgICBvZmZzZXRzID0ge31cbiAgICAgICAgbmVpZ2hib3JzID0gQG5laWdoYm9ycygpXG4gICAgICAgIFxuICAgICAgICBmb3IgZmFjZSxmaSBpbiBAZmFjZVxuICAgICAgICAgICAgY29udGludWUgaWYgZmFjZS5sZW5ndGggPD0gM1xuICAgICAgICAgICAgIyBjb250aW51ZSBpZiBmYWNlLmxlbmd0aCA+PSA2XG4gICAgICAgICAgICBmb3IgdmkgaW4gZmFjZVxuICAgICAgICAgICAgICAgIG90aGVycyA9IGZhY2UuZmlsdGVyKCh2KSA9PiB2ICE9IHZpKS5tYXAgKHYpID0+IEB2ZXJ0ZXhbdl1cbiAgICAgICAgICAgICAgICBub3JtID0gbm9ybWFsIG90aGVyc1xuICAgICAgICAgICAgICAgIGNlbnQgPSBjZW50ZXIgb3RoZXJzXG4gICAgICAgICAgICAgICAgZCA9IHBvaW50UGxhbmVEaXN0IEB2ZXJ0ZXhbdmldLCBjZW50LCBub3JtXG4gICAgICAgICAgICAgICAgcyA9IGRvdChub3JtLHN1YihAdmVydGV4W3ZpXSxjZW50KSk+MCBhbmQgMSBvciAtMVxuICAgICAgICAgICAgICAgIHZlcnRleGRpc3RbXCIje2ZpfeKWuCN7dml9XCJdID0gcypkXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBhdmcgPSBAdmVydGV4Lm1hcCAodikgLT4gdmVjKClcbiAgICAgICAgXG4gICAgICAgIGZvciBmYWNlLGZpIGluIEBmYWNlXG4gICAgICAgICAgICBjb250aW51ZSBpZiBmYWNlLmxlbmd0aCA8PSAzXG4gICAgICAgICAgICAjIGNvbnRpbnVlIGlmIGZhY2UubGVuZ3RoID49IDZcbiAgICAgICAgICAgIGZpID0gcGFyc2VJbnQgZmlcbiAgICAgICAgICAgIGZhY2UgPSBAZmFjZVtmaV1cbiAgICAgICAgICAgIGZvciB2aSBpbiBmYWNlXG4gICAgICAgICAgICAgICAgb3RoZXJzID0gZmFjZS5maWx0ZXIoKHYpIC0+IHYgIT0gdmkpLm1hcCAodikgPT4gQHZlcnRleFt2XVxuICAgICAgICAgICAgICAgIG5vcm0gPSBub3JtYWwgb3RoZXJzXG4gICAgICAgICAgICAgICAgdmRpc3QgPSB2ZXJ0ZXhkaXN0W1wiI3tmaX3ilrgje3ZpfVwiXVxuICAgICAgICAgICAgICAgIGF2Z1t2aV0uYWRkIHZlYyBtdWx0IC12ZGlzdCwgbm9ybVxuICAgICAgICBcbiAgICAgICAgZm9yIHZpIGluIFswLi4uQHZlcnRleC5sZW5ndGhdXG4gICAgICAgICAgICBvZmZzZXRzW3ZpXSA9IGF2Z1t2aV0ubXVsKDEvbmVpZ2hib3JzW3ZpXS5sZW5ndGgpLmNvb3JkcygpXG5cbiAgICAgICAgZmxhdG5lc3MgPSAwXG4gICAgICAgIFxuICAgICAgICBpZiB2YWxpZCB2ZXJ0ZXhkaXN0XG4gICAgICAgICAgICBmb3Igayx2ZCBvZiB2ZXJ0ZXhkaXN0XG4gICAgICAgICAgICAgICAgZmxhdG5lc3MgKz0gYWJzIHZkXG4gICAgICAgICAgICBmbGF0bmVzcyAvPSBfLnNpemUgdmVydGV4ZGlzdFxuICAgICAgICAgICAgXG4gICAgICAgIFsgZmxhdG5lc3MsIHZlcnRleGRpc3QsIG9mZnNldHMgXVxuICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIG5vcm1hbHM6IC0+IFxuICAgICAgICBcbiAgICAgICAgbm9ybWFsc0FycmF5ID0gW11cbiAgICAgICAgZm9yIGZhY2UgaW4gQGZhY2VcbiAgICAgICAgICAgIG5vcm1hbHNBcnJheS5wdXNoIG5vcm1hbCBmYWNlLm1hcCAodmlkeCkgPT4gQHZlcnRleFt2aWR4XVxuICAgICAgICBub3JtYWxzQXJyYXlcbiAgXG4gICAgZGF0YTogLT5cbiAgICAgICAgXG4gICAgICAgIG5FZGdlcyA9IChAZmFjZS5sZW5ndGggKyBAdmVydGV4Lmxlbmd0aCkgLSAyICMgRSA9IFYgKyBGIC0gMlxuICAgICAgICBcIiN7QGZhY2UubGVuZ3RofSBmYWNlcywgI3tuRWRnZXN9IGVkZ2VzLCAje0B2ZXJ0ZXgubGVuZ3RofSB2ZXJ0aWNlc1wiXG4gICAgICAgIFxuICAgIGNvbG9yaXplOiAobWV0aG9kPSdzaWRlZG5lc3MnKSAtPiAjIGFzc2lnbiBjb2xvciBpbmRpY2VzIHRvIGZhY2VzXG4gICAgICAgIFxuICAgICAgICBAY29sb3JzID0gW11cbiAgICAgICAgY29sb3JtZW1vcnkgPSB7fVxuICAgICAgICBjb2xvcmFzc2lnbiA9IChoYXNoKSAtPiBjb2xvcm1lbW9yeVtoYXNoXSA/PSBfLnNpemUgY29sb3JtZW1vcnlcbiAgICAgIFxuICAgICAgICBzd2l0Y2ggbWV0aG9kXG4gICAgICAgICAgICB3aGVuICdzaWduYXR1cmUnICMgY29sb3IgYnkgY29uZ3J1ZW5jZSBzaWduYXR1cmVcbiAgICAgICAgICAgICAgICBAY29sb3JzID0gQGZhY2UubWFwIChmKSA9PiBjb2xvcmFzc2lnbiBAc2lnbmF0dXJlIGZcbiAgICAgICAgICAgIGVsc2UgIyBjb2xvciBieSBmYWNlLXNpZGVkbmVzc1xuICAgICAgICAgICAgICAgIEBjb2xvcnMgPSBAZmFjZS5tYXAgKGYpIC0+IGYubGVuZ3RoIC0gM1xuICAgIFxuICAgICAgICAjIGtsb2cgXCIje18uc2l6ZShjb2xvcm1lbW9yeSkrMX0gY29sb3JzOlwiIEBjb2xvcnNcbiAgICAgICAgQFxuXG4gICAgIyAgMDAwMDAwMCAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAgICAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgXG4gICAgc2lnbmF0dXJlOiAoZmFjZSkgLT5cbiAgICBcbiAgICAgICAgdmVydGljZXMgPSBmYWNlLm1hcCAodikgPT4gQHZlcnRleFt2XVxuICAgICAgICBhbmdsZXMgPSBbXVxuICAgICAgICBcbiAgICAgICAgW3YxLCB2Ml0gPSB2ZXJ0aWNlcy5zbGljZSAtMlxuICAgICAgICBmb3IgdjMgaW4gdmVydGljZXMgIyBhY2N1bXVsYXRlIGlubmVyIGFuZ2xlcyAgICAgICAgXG4gICAgICAgICAgICBhbmdsZXMucHVzaCBwYXJzZUludCByYWQyZGVnIG1hZyBjcm9zcyBzdWIodjEsIHYyKSwgc3ViKHYzLCB2MilcbiAgICAgICAgICAgIFt2MSwgdjJdID0gW3YyLCB2M11cbiAgICBcbiAgICAgICAgYW5nbGVzLnNvcnQoKS5qb2luICdfJ1xuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gUG9seWhlZHJvblxuICAgICJdfQ==
//# sourceURL=../../coffee/poly/polyhedron.coffee