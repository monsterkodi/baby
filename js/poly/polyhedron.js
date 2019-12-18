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
                    aa = perp.angle(_this.vert(a), toVertex);
                    bb = perp.angle(_this.vert(b), toVertex);
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
                    aa = perp.angle(_this.vert(a), toVertex);
                    bb = perp.angle(_this.vert(b), toVertex);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWhlZHJvbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsdUtBQUE7SUFBQTs7QUFVQSxNQUF3QixPQUFBLENBQVEsS0FBUixDQUF4QixFQUFFLFNBQUYsRUFBSyxxQkFBTCxFQUFjOztBQUNkLE9BQW9ILE9BQUEsQ0FBUSxRQUFSLENBQXBILEVBQUUsY0FBRixFQUFPLG9CQUFQLEVBQWUsa0JBQWYsRUFBc0IsY0FBdEIsRUFBMkIsOEJBQTNCLEVBQXdDLGdDQUF4QyxFQUFzRCxjQUF0RCxFQUEyRCxnQkFBM0QsRUFBaUUsb0JBQWpFLEVBQXlFLG9DQUF6RSxFQUF5RixjQUF6RixFQUE4RixnQ0FBOUYsRUFBNEc7O0FBQzFHLGNBQUYsRUFBTzs7QUFDUCxJQUFBLEdBQU8sT0FBQSxDQUFRLFNBQVI7O0FBRUQ7SUFFQyxvQkFBQyxJQUFELEVBQVEsS0FBUixFQUFlLE1BQWY7UUFBQyxJQUFDLENBQUEsT0FBRDtRQUFPLElBQUMsQ0FBQSxPQUFEO1FBQU8sSUFBQyxDQUFBLFNBQUQ7O1lBRWQsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxPQUFVOzs7WUFDWCxJQUFDLENBQUE7O1lBQUQsSUFBQyxDQUFBLE9BQVU7OztZQUNYLElBQUMsQ0FBQTs7WUFBRCxJQUFDLENBQUEsU0FBVTs7UUFDWCxJQUFDLENBQUEsS0FBRCxHQUFXO0lBTFo7O3lCQWFILFNBQUEsR0FBVyxTQUFDLEVBQUQsRUFBSyxFQUFMO0FBRVAsWUFBQTtRQUFBLElBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFmLEtBQXVCLFFBQTFCO1lBQ0ksRUFBQSxHQUFLLElBQUMsQ0FBQSxNQUFPLENBQUEsRUFBQSxFQURqQjtTQUFBLE1BRUssSUFBRyxrQkFBSDtZQUNELENBQUEsR0FBSTtZQUNKLEVBQUUsQ0FBQyxPQUFILENBQVcsQ0FBWDtZQUNBLEVBQUEsR0FBSyxFQUhKOztRQUtMLElBQUcs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QUMsSUFBRDtBQUVQLFlBQUE7UUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLENBQUQ7dUJBQU8sS0FBQyxDQUFBLE1BQU8sQ0FBQSxDQUFBO1lBQWY7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQ7UUFDWCxNQUFBLEdBQVM7UUFFVCxPQUFXLFFBQVEsQ0FBQyxLQUFULENBQWUsQ0FBQyxDQUFoQixDQUFYLEVBQUMsWUFBRCxFQUFLO0FBQ0wsYUFBQSwwQ0FBQTs7WUFDSSxNQUFNLENBQUMsSUFBUCxDQUFZLFFBQUEsQ0FBUyxPQUFBLENBQVEsR0FBQSxDQUFJLEtBQUEsQ0FBTSxHQUFBLENBQUksRUFBSixFQUFRLEVBQVIsQ0FBTixFQUFtQixHQUFBLENBQUksRUFBSixFQUFRLEVBQVIsQ0FBbkIsQ0FBSixDQUFSLENBQVQsQ0FBWjtZQUNBLE9BQVcsQ0FBQyxFQUFELEVBQUssRUFBTCxDQUFYLEVBQUMsWUFBRCxFQUFLO0FBRlQ7ZUFJQSxNQUFNLENBQUMsSUFBUCxDQUFBLENBQWEsQ0FBQyxJQUFkLENBQW1CLEdBQW5CO0lBVk87Ozs7OztBQVlmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbjAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMjI1xuXG4jIFBvbHlow6lkcm9uaXNtZSwgQ29weXJpZ2h0IDIwMTksIEFuc2VsbSBMZXZza2F5YSwgTUlUIExpY2Vuc2VcblxueyBfLCByYWQyZGVnLCB2YWxpZCB9ID0gcmVxdWlyZSAna3hrJ1xueyBhZGQsIGNlbnRlciwgY3Jvc3MsIGRvdCwgZmFjZVRvRWRnZXMsIGZhY2VzVG9XaW5ncywgbWFnLCBtdWx0LCBub3JtYWwsIHBvaW50UGxhbmVEaXN0LCBzdWIsIHRhbmdlbnRQb2ludCwgdmVjIH0gPSByZXF1aXJlICcuL21hdGgnXG57IGFicywgbWluIH0gPSBNYXRoXG5WZWN0ID0gcmVxdWlyZSAnLi4vdmVjdCdcblxuY2xhc3MgUG9seWhlZHJvbiBcblxuICAgIEA6IChAbmFtZSwgQGZhY2UsIEB2ZXJ0ZXgpIC0+XG5cbiAgICAgICAgQG5hbWUgICA/PSBcInBvbHloZWRyb25cIlxuICAgICAgICBAZmFjZSAgID89IFtdXG4gICAgICAgIEB2ZXJ0ZXggPz0gW10gXG4gICAgICAgIEBkZWJ1ZyAgID0gW11cblxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBkZWJ1Z0xpbmU6ICh2MSwgdjIpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB2MS5jb25zdHJ1Y3Rvci5uYW1lID09ICdOdW1iZXInXG4gICAgICAgICAgICB2MSA9IEB2ZXJ0ZXhbdjFdXG4gICAgICAgIGVsc2UgaWYgdjEudG9BcnJheT9cbiAgICAgICAgICAgIGEgPSBbXVxuICAgICAgICAgICAgdjEudG9BcnJheSBhXG4gICAgICAgICAgICB2MSA9IGFcblxuICAgICAgICBpZiB2Mi5jb25zdHJ1Y3Rvci5uYW1lID09ICdOdW1iZXInXG4gICAgICAgICAgICB2MiA9IEB2ZXJ0ZXhbdjJdXG4gICAgICAgIGVsc2UgaWYgdjIudG9BcnJheT9cbiAgICAgICAgICAgIGEgPSBbXVxuICAgICAgICAgICAgdjIgPSB2Mi50b0FycmF5IGFcbiAgICAgICAgICAgIHYyID0gYVxuICAgICAgICBcbiAgICAgICAgQGRlYnVnLnB1c2ggW3YxLCB2Ml1cbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMDAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgbmVpZ2hib3JzOiAtPlxuXG4gICAgICAgIG5laWdoYm9ycyA9IChbXSBmb3IgdiBpbiBAdmVydGV4KVxuICAgICAgICBmb3IgZmFjZSBpbiBAZmFjZVxuICAgICAgICAgICAgZm9yIHZpIGluIFswLi4uZmFjZS5sZW5ndGhdXG4gICAgICAgICAgICAgICAgbmkgPSAodmkrMSkgJSBmYWNlLmxlbmd0aFxuICAgICAgICAgICAgICAgIGlmIGZhY2VbbmldIG5vdCBpbiBuZWlnaGJvcnNbZmFjZVt2aV1dXG4gICAgICAgICAgICAgICAgICAgIG5laWdoYm9yc1tmYWNlW3ZpXV0ucHVzaCBmYWNlW25pXVxuICAgICAgICAgICAgICAgIGlmIGZhY2VbdmldIG5vdCBpbiBuZWlnaGJvcnNbZmFjZVtuaV1dXG4gICAgICAgICAgICAgICAgICAgIG5laWdoYm9yc1tmYWNlW25pXV0ucHVzaCBmYWNlW3ZpXVxuICAgICAgICAgICAgICBcbiAgICAgICAgZm9yIHZpIGluIFswLi4ubmVpZ2hib3JzLmxlbmd0aF1cbiAgICAgICAgICAgIHRvVmVydGV4ID0gQHZlcnQgdmlcbiAgICAgICAgICAgIHRvVmVydGV4Lm5vcm1hbGl6ZSgpXG4gICAgICAgICAgICB0b04wID0gQHZlcnQgbmVpZ2hib3JzW3ZpXVswXVxuICAgICAgICAgICAgcGVycCA9IHRvVmVydGV4LmNyb3NzZWQgdG9OMFxuICAgICAgICAgICAgbmVpZ2hib3JzW3ZpXS5zb3J0IChhLGIpID0+XG4gICAgICAgICAgICAgICAgYWEgPSBwZXJwLmFuZ2xlIEB2ZXJ0KGEpLCB0b1ZlcnRleFxuICAgICAgICAgICAgICAgIGJiID0gcGVycC5hbmdsZSBAdmVydChiKSwgdG9WZXJ0ZXhcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIGFhID0gVmVjdC5HZXRBbmdsZUJldHdlZW5WZWN0b3JzIHBlcnAsIEB2ZXJ0KGEpLCB0b1ZlcnRleFxuICAgICAgICAgICAgICAgICMgYmIgPSBWZWN0LkdldEFuZ2xlQmV0d2VlblZlY3RvcnMgcGVycCwgQHZlcnQoYiksIHRvVmVydGV4XG4gICAgICAgICAgICAgICAgYWEgLSBiYlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgbmVpZ2hib3JzXG4gICAgICAgIFxuICAgIG5laWdoYm9yc0FuZEZhY2VzOiAtPiAjIHVudXNlZFxuXG4gICAgICAgIG5laWdoYm9ycyA9IChbXSBmb3IgdiBpbiBAdmVydGV4KVxuICAgICAgICBmb3IgZmFjZSxmaSBpbiBAZmFjZVxuICAgICAgICAgICAgZm9yIHZpIGluIFswLi4uZmFjZS5sZW5ndGhdXG4gICAgICAgICAgICAgICAgbmkgPSAodmkrMSkgJSBmYWNlLmxlbmd0aFxuICAgICAgICAgICAgICAgIGlmIGZhY2VbbmldIG5vdCBpbiBuZWlnaGJvcnNbZmFjZVt2aV1dXG4gICAgICAgICAgICAgICAgICAgIG5laWdoYm9yc1tmYWNlW3ZpXV0ucHVzaCB2ZXJ0ZXg6ZmFjZVtuaV0sIGZhY2U6ZmlcbiAgICAgICAgICAgICAgICBpZiBmYWNlW3ZpXSBub3QgaW4gbmVpZ2hib3JzW2ZhY2VbbmldXVxuICAgICAgICAgICAgICAgICAgICBuZWlnaGJvcnNbZmFjZVtuaV1dLnB1c2ggdmVydGV4OmZhY2VbdmldLCBmYWNlOmZpXG4gICAgICAgICAgICAgIFxuICAgICAgICBmb3IgdmkgaW4gWzAuLi5uZWlnaGJvcnMubGVuZ3RoXVxuICAgICAgICAgICAgdG9WZXJ0ZXggPSBAdmVydCB2aVxuICAgICAgICAgICAgdG9WZXJ0ZXgubm9ybWFsaXplKClcbiAgICAgICAgICAgIHRvTjAgPSBAdmVydCBuZWlnaGJvcnNbdmldWzBdXG4gICAgICAgICAgICBwZXJwID0gdG9WZXJ0ZXguY3Jvc3NlZCB0b04wXG4gICAgICAgICAgICBuZWlnaGJvcnNbdmldLnNvcnQgKGEsYikgPT5cbiAgICAgICAgICAgICAgICBhYSA9IHBlcnAuYW5nbGUgQHZlcnQoYSksIHRvVmVydGV4XG4gICAgICAgICAgICAgICAgYmIgPSBwZXJwLmFuZ2xlIEB2ZXJ0KGIpLCB0b1ZlcnRleCAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAjIGFhID0gVmVjdC5HZXRBbmdsZUJldHdlZW5WZWN0b3JzIHBlcnAsIEB2ZXJ0KGEudmVydGV4KSwgdG9WZXJ0ZXhcbiAgICAgICAgICAgICAgICAjIGJiID0gVmVjdC5HZXRBbmdsZUJldHdlZW5WZWN0b3JzIHBlcnAsIEB2ZXJ0KGIudmVydGV4KSwgdG9WZXJ0ZXhcbiAgICAgICAgICAgICAgICBhYSAtIGJiXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBuZWlnaGJvcnNcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIHdpbmdzOiAtPiBmYWNlc1RvV2luZ3MgQGZhY2VcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGVkZ2VzOiAtPlxuICAgICAgICBcbiAgICAgICAgdW5pcUVkZ2VzID0ge31cbiAgICAgICAgZmFjZUVkZ2VzID0gQGZhY2UubWFwIGZhY2VUb0VkZ2VzXG4gICAgICAgIGZvciBlZGdlU2V0IGluIGZhY2VFZGdlc1xuICAgICAgICAgICAgZm9yIGUgaW4gZWRnZVNldFxuICAgICAgICAgICAgICAgIGlmIGVbMF08ZVsxXSB0aGVuIFthLCBiXSA9IGVcbiAgICAgICAgICAgICAgICBlbHNlICAgICAgICAgICAgICBbYiwgYV0gPSBlXG4gICAgICAgICAgICAgICAgdW5pcUVkZ2VzW1wiI3thfX4je2J9XCJdID0gZVxuICAgICAgICBfLnZhbHVlcyB1bmlxRWRnZXNcbiAgICAgIFxuICAgIGVkZ2U6ICh2MSwgdjIpIC0+XG4gICAgICAgIFxuICAgICAgICBAdmVydCh2Mikuc3ViIEB2ZXJ0KHYxKVxuICAgIFxuICAgIGVkZ2VOb3JtYWw6ICh2MSwgdjIpIC0+XG4gICAgICAgIFxuICAgICAgICBAdmVydGV4Tm9ybWFsKHYxKS5hZGQoQHZlcnRleE5vcm1hbCh2MikpLnNjYWxlKDAuNSlcbiAgICAgICAgXG4gICAgbWluRWRnZUxlbmd0aDogLT5cbiAgICAgICAgXG4gICAgICAgIG1pbkVkZ2VMZW5ndGggPSBJbmZpbml0eVxuICAgICAgICBcbiAgICAgICAgZm9yIGVkZ2UgaW4gQGVkZ2VzKClcbiAgICAgICAgICAgIG1pbkVkZ2VMZW5ndGggPSBtaW4gbWluRWRnZUxlbmd0aCwgQHZlcnQoZWRnZVswXSkuZGlzdCBAdmVydCBlZGdlWzFdXG4gICAgICAgICAgICBcbiAgICAgICAgbWluRWRnZUxlbmd0aFxuXG4gICAgbWF4RWRnZURpZmZlcmVuY2U6IC0+XG4gICAgICAgIGRpZmZzID0gW11cbiAgICAgICAgZm9yIGZhY2UgaW4gQGZhY2VcbiAgICAgICAgICAgIGxlbmd0aCA9IFtdXG4gICAgICAgICAgICBmb3IgZWRnZSBpbiBmYWNlVG9FZGdlcyBmYWNlXG4gICAgICAgICAgICAgICAgbGVuZ3RoLnB1c2ggQHZlcnQoZWRnZVswXSkudG8oQHZlcnQoZWRnZVsxXSkpLmxlbmd0aCgpXG4gICAgICAgICAgICBkaWZmcy5wdXNoIF8ubWF4KGxlbmd0aCkgLSBfLm1pbihsZW5ndGgpXG4gICAgICAgIF8ubWF4IGRpZmZzXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgIFxuICAgICMgIDAwMCAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgIFxuICAgICMgICAgIDAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHZlcnQ6ICh2aSkgLT4gXG4gICAgXG4gICAgICAgIHZlYyBAdmVydGV4W3ZpXVxuICAgICAgICAgICAgICAgIFxuICAgIHZlcnRleE5vcm1hbDogKHZpKSAtPlxuICAgICAgICAgXG4gICAgICAgIHN1bSA9IHZlYyAwIDAgMFxuICAgICAgICBmb3IgbmkgaW4gQG5laWdoYm9ycyh2aSlcbiAgICAgICAgICAgIHN1bS5hZGQgQGVkZ2UgdmksIG5pXG4gICAgICAgIHN1bS5ub3JtYWxpemUoKVxuICAgICAgICBzdW1cbiAgICAgICAgICAgICAgICBcbiAgICBmYWNlc0F0VmVydGV4OiAodmkpIC0+XG4gICAgICAgIFxuICAgICAgICBmYWNlcyA9IFtdXG4gICAgICAgIGZvciBmYWNlLGZpIGluIEBmYWNlXG4gICAgICAgICAgICBpZiB2aSBpbiBmYWNlXG4gICAgICAgICAgICAgICAgZmFjZXMucHVzaCBmaVxuICAgICAgICBmYWNlc1xuICAgICAgICBcbiAgICBzY2FsZTogKGZhY3RvcikgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciB2IGluIEB2ZXJ0ZXhcbiAgICAgICAgICAgIHZbMF0gKj0gZmFjdG9yXG4gICAgICAgICAgICB2WzFdICo9IGZhY3RvclxuICAgICAgICAgICAgdlsyXSAqPSBmYWN0b3JcbiAgICAgICAgQFxuICAgICAgICBcbiAgICBub3JtYWxpemU6IC0+XG4gICAgICAgIFxuICAgICAgICBAcmVjZW50ZXIoKVxuICAgICAgICBAcmVzY2FsZSgpXG4gICAgICAgIEAgICAgICAgIFxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgcmVjZW50ZXI6IC0+XG4gICAgICAgICMgcmVjZW50ZXJzIGVudGlyZSBwb2x5aGVkcm9uIHN1Y2ggdGhhdCBjZW50ZXIgb2YgbWFzcyBpcyBhdCBvcmlnaW5cbiAgICAgICAgZWRnZXMgPSBAZWRnZXMoKVxuICAgICAgICBlZGdlY2VudGVycyA9IGVkZ2VzLm1hcCAoW2EsIGJdKSA9PiB0YW5nZW50UG9pbnQgQHZlcnRleFthXSwgQHZlcnRleFtiXVxuICAgICAgICBcbiAgICAgICAgcG9seWNlbnRlciA9IFswIDAgMF1cbiAgICBcbiAgICAgICAgZm9yIHYgaW4gZWRnZWNlbnRlcnNcbiAgICAgICAgICAgIHBvbHljZW50ZXIgPSBhZGQgcG9seWNlbnRlciwgdlxuICAgICAgICAgICAgXG4gICAgICAgIHBvbHljZW50ZXIgPSBtdWx0IDEvZWRnZXMubGVuZ3RoLCBwb2x5Y2VudGVyXG4gICAgXG4gICAgICAgIEB2ZXJ0ZXggPSBfLm1hcCBAdmVydGV4LCAoeCkgLT4gc3ViIHgsIHBvbHljZW50ZXJcbiAgICAgICAgQGRlYnVnID0gXy5tYXAgQGRlYnVnLCAoZGJnKSAtPiBkYmcubWFwICh4KSAtPiBzdWIgeCwgcG9seWNlbnRlclxuICAgICAgICBAXG4gICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICByZXNjYWxlOiAtPlxuICAgICAgICAjIHJlc2NhbGVzIG1heGltdW0gcmFkaXVzIG9mIHBvbHloZWRyb24gdG8gMVxuICAgICAgICBwb2x5Y2VudGVyID0gWzAgMCAwXVxuICAgICAgICBtYXhFeHRlbnQgPSBfLm1heCBfLm1hcCBAdmVydGV4LCAoeCkgLT4gbWFnIHhcbiAgICAgICAgcyA9IDEgLyBtYXhFeHRlbnRcbiAgICAgICAgQHZlcnRleCA9IF8ubWFwIEB2ZXJ0ZXgsICh4KSAtPiBbcyp4WzBdLCBzKnhbMV0sIHMqeFsyXV1cbiAgICAgICAgQGRlYnVnID0gXy5tYXAgQGRlYnVnLCAoZGJnKSAtPiBkYmcubWFwICh4KSAtPiBbcyp4WzBdLCBzKnhbMV0sIHMqeFsyXV1cbiAgICAgICAgQFxuICAgICAgICAgICAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgIDAwMDAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgY2VudGVyczogLT4gQGZhY2UubWFwIChmKSA9PiBjZW50ZXIgZi5tYXAgKHZpKSA9PiBAdmVydGV4W3ZpXVxuICAgICAgICBcbiAgICBtaW5GYWNlRGlzdDogLT5cbiAgICAgICAgXG4gICAgICAgIG1pbkZhY2VEaXN0ID0gSW5maW5pdHlcbiAgICAgICAgXG4gICAgICAgIGZvciBjdHIgaW4gQGNlbnRlcnMoKVxuICAgICAgICAgICAgbWluRmFjZURpc3QgPSBtaW4gbWluRmFjZURpc3QsIG1hZyBjdHJcbiAgICAgICAgICAgIFxuICAgICAgICBtaW5GYWNlRGlzdFxuXG4gICAgIyAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgICAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwMCAgMDAwICAgICAgICAgICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgZmxhdG5lc3M6IC0+XG4gICAgICAgIFxuICAgICAgICB2ZXJ0ZXhkaXN0ID0ge31cbiAgICAgICAgb2Zmc2V0cyA9IHt9XG4gICAgICAgIG5laWdoYm9ycyA9IEBuZWlnaGJvcnMoKVxuICAgICAgICBcbiAgICAgICAgZm9yIGZhY2UsZmkgaW4gQGZhY2VcbiAgICAgICAgICAgIGNvbnRpbnVlIGlmIGZhY2UubGVuZ3RoIDw9IDNcbiAgICAgICAgICAgICMgY29udGludWUgaWYgZmFjZS5sZW5ndGggPj0gNlxuICAgICAgICAgICAgZm9yIHZpIGluIGZhY2VcbiAgICAgICAgICAgICAgICBvdGhlcnMgPSBmYWNlLmZpbHRlcigodikgPT4gdiAhPSB2aSkubWFwICh2KSA9PiBAdmVydGV4W3ZdXG4gICAgICAgICAgICAgICAgbm9ybSA9IG5vcm1hbCBvdGhlcnNcbiAgICAgICAgICAgICAgICBjZW50ID0gY2VudGVyIG90aGVyc1xuICAgICAgICAgICAgICAgIGQgPSBwb2ludFBsYW5lRGlzdCBAdmVydGV4W3ZpXSwgY2VudCwgbm9ybVxuICAgICAgICAgICAgICAgIHMgPSBkb3Qobm9ybSxzdWIoQHZlcnRleFt2aV0sY2VudCkpPjAgYW5kIDEgb3IgLTFcbiAgICAgICAgICAgICAgICB2ZXJ0ZXhkaXN0W1wiI3tmaX3ilrgje3ZpfVwiXSA9IHMqZFxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgYXZnID0gQHZlcnRleC5tYXAgKHYpIC0+IHZlYygpXG4gICAgICAgIFxuICAgICAgICBmb3IgZmFjZSxmaSBpbiBAZmFjZVxuICAgICAgICAgICAgY29udGludWUgaWYgZmFjZS5sZW5ndGggPD0gM1xuICAgICAgICAgICAgIyBjb250aW51ZSBpZiBmYWNlLmxlbmd0aCA+PSA2XG4gICAgICAgICAgICBmaSA9IHBhcnNlSW50IGZpXG4gICAgICAgICAgICBmYWNlID0gQGZhY2VbZmldXG4gICAgICAgICAgICBmb3IgdmkgaW4gZmFjZVxuICAgICAgICAgICAgICAgIG90aGVycyA9IGZhY2UuZmlsdGVyKCh2KSAtPiB2ICE9IHZpKS5tYXAgKHYpID0+IEB2ZXJ0ZXhbdl1cbiAgICAgICAgICAgICAgICBub3JtID0gbm9ybWFsIG90aGVyc1xuICAgICAgICAgICAgICAgIHZkaXN0ID0gdmVydGV4ZGlzdFtcIiN7Zml94pa4I3t2aX1cIl1cbiAgICAgICAgICAgICAgICBhdmdbdmldLmFkZCB2ZWMgbXVsdCAtdmRpc3QsIG5vcm1cbiAgICAgICAgXG4gICAgICAgIGZvciB2aSBpbiBbMC4uLkB2ZXJ0ZXgubGVuZ3RoXVxuICAgICAgICAgICAgb2Zmc2V0c1t2aV0gPSBhdmdbdmldLm11bCgxL25laWdoYm9yc1t2aV0ubGVuZ3RoKS5jb29yZHMoKVxuXG4gICAgICAgIGZsYXRuZXNzID0gMFxuICAgICAgICBcbiAgICAgICAgaWYgdmFsaWQgdmVydGV4ZGlzdFxuICAgICAgICAgICAgZm9yIGssdmQgb2YgdmVydGV4ZGlzdFxuICAgICAgICAgICAgICAgIGZsYXRuZXNzICs9IGFicyB2ZFxuICAgICAgICAgICAgZmxhdG5lc3MgLz0gXy5zaXplIHZlcnRleGRpc3RcbiAgICAgICAgICAgIFxuICAgICAgICBbIGZsYXRuZXNzLCB2ZXJ0ZXhkaXN0LCBvZmZzZXRzIF1cbiAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBub3JtYWxzOiAtPiBcbiAgICAgICAgXG4gICAgICAgIG5vcm1hbHNBcnJheSA9IFtdXG4gICAgICAgIGZvciBmYWNlIGluIEBmYWNlXG4gICAgICAgICAgICBub3JtYWxzQXJyYXkucHVzaCBub3JtYWwgZmFjZS5tYXAgKHZpZHgpID0+IEB2ZXJ0ZXhbdmlkeF1cbiAgICAgICAgbm9ybWFsc0FycmF5XG4gIFxuICAgIGRhdGE6IC0+XG4gICAgICAgIFxuICAgICAgICBuRWRnZXMgPSAoQGZhY2UubGVuZ3RoICsgQHZlcnRleC5sZW5ndGgpIC0gMiAjIEUgPSBWICsgRiAtIDJcbiAgICAgICAgXCIje0BmYWNlLmxlbmd0aH0gZmFjZXMsICN7bkVkZ2VzfSBlZGdlcywgI3tAdmVydGV4Lmxlbmd0aH0gdmVydGljZXNcIlxuICAgICAgICBcbiAgICBjb2xvcml6ZTogKG1ldGhvZD0nc2lkZWRuZXNzJykgLT4gIyBhc3NpZ24gY29sb3IgaW5kaWNlcyB0byBmYWNlc1xuICAgICAgICBcbiAgICAgICAgQGNvbG9ycyA9IFtdXG4gICAgICAgIGNvbG9ybWVtb3J5ID0ge31cbiAgICAgICAgY29sb3Jhc3NpZ24gPSAoaGFzaCkgLT4gY29sb3JtZW1vcnlbaGFzaF0gPz0gXy5zaXplIGNvbG9ybWVtb3J5XG4gICAgICBcbiAgICAgICAgc3dpdGNoIG1ldGhvZFxuICAgICAgICAgICAgd2hlbiAnc2lnbmF0dXJlJyAjIGNvbG9yIGJ5IGNvbmdydWVuY2Ugc2lnbmF0dXJlXG4gICAgICAgICAgICAgICAgQGNvbG9ycyA9IEBmYWNlLm1hcCAoZikgPT4gY29sb3Jhc3NpZ24gQHNpZ25hdHVyZSBmXG4gICAgICAgICAgICBlbHNlICMgY29sb3IgYnkgZmFjZS1zaWRlZG5lc3NcbiAgICAgICAgICAgICAgICBAY29sb3JzID0gQGZhY2UubWFwIChmKSAtPiBmLmxlbmd0aCAtIDNcbiAgICBcbiAgICAgICAgIyBrbG9nIFwiI3tfLnNpemUoY29sb3JtZW1vcnkpKzF9IGNvbG9yczpcIiBAY29sb3JzXG4gICAgICAgIEBcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHNpZ25hdHVyZTogKGZhY2UpIC0+XG4gICAgXG4gICAgICAgIHZlcnRpY2VzID0gZmFjZS5tYXAgKHYpID0+IEB2ZXJ0ZXhbdl1cbiAgICAgICAgYW5nbGVzID0gW11cbiAgICAgICAgXG4gICAgICAgIFt2MSwgdjJdID0gdmVydGljZXMuc2xpY2UgLTJcbiAgICAgICAgZm9yIHYzIGluIHZlcnRpY2VzICMgYWNjdW11bGF0ZSBpbm5lciBhbmdsZXMgICAgICAgIFxuICAgICAgICAgICAgYW5nbGVzLnB1c2ggcGFyc2VJbnQgcmFkMmRlZyBtYWcgY3Jvc3Mgc3ViKHYxLCB2MiksIHN1Yih2MywgdjIpXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gICAgXG4gICAgICAgIGFuZ2xlcy5zb3J0KCkuam9pbiAnXydcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFBvbHloZWRyb25cbiAgICAiXX0=
//# sourceURL=../../coffee/poly/polyhedron.coffee