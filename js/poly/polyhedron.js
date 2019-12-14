// koffee 1.6.0

/*
00000000    0000000   000      000   000  000   000  00000000  0000000    00000000    0000000   000   000  
000   000  000   000  000       000 000   000   000  000       000   000  000   000  000   000  0000  000  
00000000   000   000  000        00000    000000000  0000000   000   000  0000000    000   000  000 0 000  
000        000   000  000         000     000   000  000       000   000  000   000  000   000  000  0000  
000         0000000   0000000     000     000   000  00000000  0000000    000   000   0000000   000   000
 */
var Polyhedron, Vect, _, add, cross, faceToEdges, facesToWings, mag, min, mult, normal, rad2deg, ref, ref1, sub,
    indexOf = [].indexOf;

ref = require('kxk'), _ = ref._, rad2deg = ref.rad2deg;

ref1 = require('./math'), add = ref1.add, cross = ref1.cross, faceToEdges = ref1.faceToEdges, facesToWings = ref1.facesToWings, mag = ref1.mag, mult = ref1.mult, normal = ref1.normal, sub = ref1.sub;

min = Math.min;

Vect = require('../vect');

Polyhedron = (function() {
    function Polyhedron(name, face1, vertex) {
        this.name = name;
        this.face = face1;
        this.vertex = vertex;
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
        if (this.name != null) {
            this.name;
        } else {
            this.name = "polyhedron";
        }
    }

    Polyhedron.prototype.neighbors = function() {
        var face, i, j, k, len, neighbors, ni, perp, ref2, ref3, ref4, ref5, ref6, toN0, toVertex, v, vi;
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
        for (vi = k = 0, ref6 = neighbors.length; 0 <= ref6 ? k < ref6 : k > ref6; vi = 0 <= ref6 ? ++k : --k) {
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
        var face, fi, i, j, k, len, neighbors, ni, perp, ref2, ref3, ref4, ref5, ref6, toN0, toVertex, v, vi;
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
        for (vi = k = 0, ref6 = neighbors.length; 0 <= ref6 ? k < ref6 : k > ref6; vi = 0 <= ref6 ? ++k : --k) {
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

    Polyhedron.prototype.centers = function() {
        var centersArray, face, fcenter, i, j, len, len1, ref2, vidx;
        centersArray = [];
        ref2 = this.face;
        for (i = 0, len = ref2.length; i < len; i++) {
            face = ref2[i];
            fcenter = [0, 0, 0];
            for (j = 0, len1 = face.length; j < len1; j++) {
                vidx = face[j];
                fcenter = add(fcenter, this.vertex[vidx]);
            }
            centersArray.push(mult(1.0 / face.length, fcenter));
        }
        return centersArray;
    };

    Polyhedron.prototype.minFaceDist = function() {
        var center, i, len, minFaceDist, ref2;
        minFaceDist = 2e308;
        ref2 = this.centers();
        for (i = 0, len = ref2.length; i < len; i++) {
            center = ref2[i];
            minFaceDist = min(minFaceDist, mag(center));
        }
        return minFaceDist;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWhlZHJvbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsMkdBQUE7SUFBQTs7QUFVQSxNQUFpQixPQUFBLENBQVEsS0FBUixDQUFqQixFQUFFLFNBQUYsRUFBSzs7QUFDTCxPQUFvRSxPQUFBLENBQVEsUUFBUixDQUFwRSxFQUFFLGNBQUYsRUFBTyxrQkFBUCxFQUFjLDhCQUFkLEVBQTJCLGdDQUEzQixFQUF5QyxjQUF6QyxFQUE4QyxnQkFBOUMsRUFBb0Qsb0JBQXBELEVBQTREOztBQUMxRCxNQUFROztBQUNWLElBQUEsR0FBTyxPQUFBLENBQVEsU0FBUjs7QUFFRDtJQUVDLG9CQUFDLElBQUQsRUFBUSxLQUFSLEVBQWUsTUFBZjtRQUFDLElBQUMsQ0FBQSxPQUFEO1FBQU8sSUFBQyxDQUFBLE9BQUQ7UUFBTyxJQUFDLENBQUEsU0FBRDs7WUFFZCxJQUFDLENBQUE7O1lBQUQsSUFBQyxDQUFBLE9BQVU7OztZQUNYLElBQUMsQ0FBQTs7WUFBRCxJQUFDLENBQUEsU0FBVTs7O1lBQ1gsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxPQUFVOztJQUpaOzt5QkFZSCxTQUFBLEdBQVcsU0FBQTtBQUVQLFlBQUE7UUFBQSxTQUFBOztBQUFhO0FBQUE7aUJBQUEsc0NBQUE7OzZCQUFBO0FBQUE7OztBQUNiO0FBQUEsYUFBQSxzQ0FBQTs7QUFDSSxpQkFBVSwyRkFBVjtnQkFDSSxFQUFBLEdBQUssQ0FBQyxFQUFBLEdBQUcsQ0FBSixDQUFBLEdBQVMsSUFBSSxDQUFDO2dCQUNuQixXQUFHLElBQUssQ0FBQSxFQUFBLENBQUwsRUFBQSxhQUFnQixTQUFVLENBQUEsSUFBSyxDQUFBLEVBQUEsQ0FBTCxDQUExQixFQUFBLElBQUEsS0FBSDtvQkFDSSxTQUFVLENBQUEsSUFBSyxDQUFBLEVBQUEsQ0FBTCxDQUFTLENBQUMsSUFBcEIsQ0FBeUIsSUFBSyxDQUFBLEVBQUEs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Q0FBUyxDQUFBLFNBQUEsS0FBQTttQkFBQSxTQUFDLENBQUQ7dUJBQU8sS0FBQyxDQUFBLE1BQU8sQ0FBQSxDQUFBO1lBQWY7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQVQ7UUFDWCxNQUFBLEdBQVM7UUFFVCxPQUFXLFFBQVEsQ0FBQyxLQUFULENBQWUsQ0FBQyxDQUFoQixDQUFYLEVBQUMsWUFBRCxFQUFLO0FBQ0wsYUFBQSwwQ0FBQTs7WUFDSSxNQUFNLENBQUMsSUFBUCxDQUFZLFFBQUEsQ0FBUyxPQUFBLENBQVEsR0FBQSxDQUFJLEtBQUEsQ0FBTSxHQUFBLENBQUksRUFBSixFQUFRLEVBQVIsQ0FBTixFQUFtQixHQUFBLENBQUksRUFBSixFQUFRLEVBQVIsQ0FBbkIsQ0FBSixDQUFSLENBQVQsQ0FBWjtZQUNBLE9BQVcsQ0FBQyxFQUFELEVBQUssRUFBTCxDQUFYLEVBQUMsWUFBRCxFQUFLO0FBRlQ7ZUFJQSxNQUFNLENBQUMsSUFBUCxDQUFBLENBQWEsQ0FBQyxJQUFkLENBQW1CLEdBQW5CO0lBVk87Ozs7OztBQVlmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbjAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMjI1xuXG4jIFBvbHlow6lkcm9uaXNtZSwgQ29weXJpZ2h0IDIwMTksIEFuc2VsbSBMZXZza2F5YSwgTUlUIExpY2Vuc2VcblxueyBfLCByYWQyZGVnIH0gPSByZXF1aXJlICdreGsnXG57IGFkZCwgY3Jvc3MsIGZhY2VUb0VkZ2VzLCBmYWNlc1RvV2luZ3MsIG1hZywgbXVsdCwgbm9ybWFsLCBzdWIgfSA9IHJlcXVpcmUgJy4vbWF0aCdcbnsgbWluIH0gPSBNYXRoXG5WZWN0ID0gcmVxdWlyZSAnLi4vdmVjdCdcblxuY2xhc3MgUG9seWhlZHJvbiBcblxuICAgIEA6IChAbmFtZSwgQGZhY2UsIEB2ZXJ0ZXgpIC0+XG5cbiAgICAgICAgQGZhY2UgICA/PSBbXVxuICAgICAgICBAdmVydGV4ID89IFtdIFxuICAgICAgICBAbmFtZSAgID89IFwicG9seWhlZHJvblwiXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBuZWlnaGJvcnM6IC0+XG5cbiAgICAgICAgbmVpZ2hib3JzID0gKFtdIGZvciB2IGluIEB2ZXJ0ZXgpXG4gICAgICAgIGZvciBmYWNlIGluIEBmYWNlXG4gICAgICAgICAgICBmb3IgdmkgaW4gWzAuLi5mYWNlLmxlbmd0aF1cbiAgICAgICAgICAgICAgICBuaSA9ICh2aSsxKSAlIGZhY2UubGVuZ3RoXG4gICAgICAgICAgICAgICAgaWYgZmFjZVtuaV0gbm90IGluIG5laWdoYm9yc1tmYWNlW3ZpXV1cbiAgICAgICAgICAgICAgICAgICAgbmVpZ2hib3JzW2ZhY2VbdmldXS5wdXNoIGZhY2VbbmldXG4gICAgICAgICAgICAgICAgaWYgZmFjZVt2aV0gbm90IGluIG5laWdoYm9yc1tmYWNlW25pXV1cbiAgICAgICAgICAgICAgICAgICAgbmVpZ2hib3JzW2ZhY2VbbmldXS5wdXNoIGZhY2VbdmldXG4gICAgICAgICAgICAgIFxuICAgICAgICBmb3IgdmkgaW4gWzAuLi5uZWlnaGJvcnMubGVuZ3RoXVxuICAgICAgICAgICAgdG9WZXJ0ZXggPSBAdmVydCB2aVxuICAgICAgICAgICAgdG9WZXJ0ZXgubm9ybWFsaXplKClcbiAgICAgICAgICAgIHRvTjAgPSBAdmVydCBuZWlnaGJvcnNbdmldWzBdXG4gICAgICAgICAgICBwZXJwID0gdG9WZXJ0ZXguY3Jvc3NlZCB0b04wXG4gICAgICAgICAgICBuZWlnaGJvcnNbdmldLnNvcnQgKGEsYikgPT5cbiAgICAgICAgICAgICAgICBhYSA9IFZlY3QuR2V0QW5nbGVCZXR3ZWVuVmVjdG9ycyBwZXJwLCBAdmVydChhKSwgdG9WZXJ0ZXhcbiAgICAgICAgICAgICAgICBiYiA9IFZlY3QuR2V0QW5nbGVCZXR3ZWVuVmVjdG9ycyBwZXJwLCBAdmVydChiKSwgdG9WZXJ0ZXhcbiAgICAgICAgICAgICAgICBhYSAtIGJiXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBuZWlnaGJvcnNcbiAgICAgICAgXG4gICAgbmVpZ2hib3JzQW5kRmFjZXM6IC0+XG5cbiAgICAgICAgbmVpZ2hib3JzID0gKFtdIGZvciB2IGluIEB2ZXJ0ZXgpXG4gICAgICAgIGZvciBmYWNlLGZpIGluIEBmYWNlXG4gICAgICAgICAgICBmb3IgdmkgaW4gWzAuLi5mYWNlLmxlbmd0aF1cbiAgICAgICAgICAgICAgICBuaSA9ICh2aSsxKSAlIGZhY2UubGVuZ3RoXG4gICAgICAgICAgICAgICAgaWYgZmFjZVtuaV0gbm90IGluIG5laWdoYm9yc1tmYWNlW3ZpXV1cbiAgICAgICAgICAgICAgICAgICAgbmVpZ2hib3JzW2ZhY2VbdmldXS5wdXNoIHZlcnRleDpmYWNlW25pXSwgZmFjZTpmaVxuICAgICAgICAgICAgICAgIGlmIGZhY2VbdmldIG5vdCBpbiBuZWlnaGJvcnNbZmFjZVtuaV1dXG4gICAgICAgICAgICAgICAgICAgIG5laWdoYm9yc1tmYWNlW25pXV0ucHVzaCB2ZXJ0ZXg6ZmFjZVt2aV0sIGZhY2U6ZmlcbiAgICAgICAgICAgICAgXG4gICAgICAgIGZvciB2aSBpbiBbMC4uLm5laWdoYm9ycy5sZW5ndGhdXG4gICAgICAgICAgICB0b1ZlcnRleCA9IEB2ZXJ0IHZpXG4gICAgICAgICAgICB0b1ZlcnRleC5ub3JtYWxpemUoKVxuICAgICAgICAgICAgdG9OMCA9IEB2ZXJ0IG5laWdoYm9yc1t2aV1bMF1cbiAgICAgICAgICAgIHBlcnAgPSB0b1ZlcnRleC5jcm9zc2VkIHRvTjBcbiAgICAgICAgICAgIG5laWdoYm9yc1t2aV0uc29ydCAoYSxiKSA9PlxuICAgICAgICAgICAgICAgIGFhID0gVmVjdC5HZXRBbmdsZUJldHdlZW5WZWN0b3JzIHBlcnAsIEB2ZXJ0KGEudmVydGV4KSwgdG9WZXJ0ZXhcbiAgICAgICAgICAgICAgICBiYiA9IFZlY3QuR2V0QW5nbGVCZXR3ZWVuVmVjdG9ycyBwZXJwLCBAdmVydChiLnZlcnRleCksIHRvVmVydGV4XG4gICAgICAgICAgICAgICAgYWEgLSBiYlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgbmVpZ2hib3JzXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICB3aW5nczogLT4gZmFjZXNUb1dpbmdzIEBmYWNlXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBlZGdlczogLT5cbiAgICAgICAgXG4gICAgICAgIHVuaXFFZGdlcyA9IHt9XG4gICAgICAgIGZhY2VFZGdlcyA9IEBmYWNlLm1hcCBmYWNlVG9FZGdlc1xuICAgICAgICBmb3IgZWRnZVNldCBpbiBmYWNlRWRnZXNcbiAgICAgICAgICAgIGZvciBlIGluIGVkZ2VTZXRcbiAgICAgICAgICAgICAgICBpZiBlWzBdPGVbMV0gdGhlbiBbYSwgYl0gPSBlXG4gICAgICAgICAgICAgICAgZWxzZSAgICAgICAgICAgICAgW2IsIGFdID0gZVxuICAgICAgICAgICAgICAgIHVuaXFFZGdlc1tcIiN7YX1+I3tifVwiXSA9IGVcbiAgICAgICAgXy52YWx1ZXMgdW5pcUVkZ2VzXG4gICAgICBcbiAgICBlZGdlOiAodjEsIHYyKSAtPlxuICAgICAgICBcbiAgICAgICAgQHZlcnQodjIpLnN1YnRyYWN0IEB2ZXJ0KHYxKVxuICAgIFxuICAgIGVkZ2VOb3JtYWw6ICh2MSwgdjIpIC0+XG4gICAgICAgIFxuICAgICAgICBAdmVydGV4Tm9ybWFsKHYxKS5hZGRJblBsYWNlKEB2ZXJ0ZXhOb3JtYWwodjIpKS5zY2FsZSgwLjUpXG4gICAgICAgIFxuICAgIG1pbkVkZ2VMZW5ndGg6IC0+XG4gICAgICAgIFxuICAgICAgICBtaW5FZGdlTGVuZ3RoID0gSW5maW5pdHlcbiAgICAgICAgXG4gICAgICAgIGZvciBlZGdlIGluIEBlZGdlcygpXG4gICAgICAgICAgICBtaW5FZGdlTGVuZ3RoID0gbWluIG1pbkVkZ2VMZW5ndGgsIEB2ZXJ0KGVkZ2VbMF0pLmRpc3QgQHZlcnQgZWRnZVsxXVxuICAgICAgICAgICAgXG4gICAgICAgIG1pbkVkZ2VMZW5ndGhcblxuICAgIG1heEVkZ2VEaWZmZXJlbmNlOiAtPlxuICAgICAgICBkaWZmcyA9IFtdXG4gICAgICAgIGZvciBmYWNlIGluIEBmYWNlXG4gICAgICAgICAgICBsZW5ndGggPSBbXVxuICAgICAgICAgICAgZm9yIGVkZ2UgaW4gZmFjZVRvRWRnZXMgZmFjZVxuICAgICAgICAgICAgICAgIGxlbmd0aC5wdXNoIEB2ZXJ0KGVkZ2VbMF0pLnRvKEB2ZXJ0KGVkZ2VbMV0pKS5sZW5ndGgoKVxuICAgICAgICAgICAgZGlmZnMucHVzaCBfLm1heChsZW5ndGgpIC0gXy5taW4obGVuZ3RoKVxuICAgICAgICBfLm1heCBkaWZmc1xuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICBcbiAgICAjICAwMDAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgICAgMDAwICAgICAwMDAwMDAwICAgICAwMDAwMCAgICBcbiAgICAjICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgIDAwMCAwMDAgICBcbiAgICAjICAgICAwICAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICB2ZXJ0OiAodmkpIC0+IFxuICAgIFxuICAgICAgICBuZXcgVmVjdCBAdmVydGV4W3ZpXVxuICAgICAgICAgICAgICAgIFxuICAgIHZlcnRleE5vcm1hbDogKHZpKSAtPlxuICAgICAgICAgXG4gICAgICAgIHN1bSA9IG5ldyBWZWN0IDAgMCAwXG4gICAgICAgIGZvciBuaSBpbiBAbmVpZ2hib3JzKHZpKVxuICAgICAgICAgICAgc3VtLmFkZEluUGxhY2UgQGVkZ2UgdmksIG5pXG4gICAgICAgIHN1bS5ub3JtYWxpemUoKVxuICAgICAgICBzdW1cbiAgICAgICAgICAgICAgICBcbiAgICBmYWNlc0F0VmVydGV4OiAodmkpIC0+XG4gICAgICAgIFxuICAgICAgICBmYWNlcyA9IFtdXG4gICAgICAgIGZvciBmYWNlLGZpIGluIEBmYWNlXG4gICAgICAgICAgICBpZiB2aSBpbiBmYWNlXG4gICAgICAgICAgICAgICAgZmFjZXMucHVzaCBmaVxuICAgICAgICBmYWNlc1xuICAgICAgICBcbiAgICBzY2FsZTogKGZhY3RvcikgLT5cbiAgICAgICAgXG4gICAgICAgIGZvciB2IGluIEB2ZXJ0ZXhcbiAgICAgICAgICAgIHZbMF0gKj0gZmFjdG9yXG4gICAgICAgICAgICB2WzFdICo9IGZhY3RvclxuICAgICAgICAgICAgdlsyXSAqPSBmYWN0b3JcbiAgICAgICAgQFxuICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBjZW50ZXJzOiAtPiBcbiAgICAgICAgY2VudGVyc0FycmF5ID0gW11cbiAgICAgICAgZm9yIGZhY2UgaW4gQGZhY2VcbiAgICAgICAgICAgIGZjZW50ZXIgPSBbMCAwIDBdXG4gICAgICAgICAgICBmb3IgdmlkeCBpbiBmYWNlXG4gICAgICAgICAgICAgICAgZmNlbnRlciA9IGFkZCBmY2VudGVyLCBAdmVydGV4W3ZpZHhdXG4gICAgICAgICAgICBjZW50ZXJzQXJyYXkucHVzaCBtdWx0IDEuMC9mYWNlLmxlbmd0aCwgZmNlbnRlclxuICAgICAgICBjZW50ZXJzQXJyYXlcbiAgICAgICAgXG4gICAgbWluRmFjZURpc3Q6IC0+XG4gICAgICAgIFxuICAgICAgICBtaW5GYWNlRGlzdCA9IEluZmluaXR5XG4gICAgICAgIFxuICAgICAgICBmb3IgY2VudGVyIGluIEBjZW50ZXJzKClcbiAgICAgICAgICAgIG1pbkZhY2VEaXN0ID0gbWluIG1pbkZhY2VEaXN0LCBtYWcgY2VudGVyXG4gICAgICAgICAgICBcbiAgICAgICAgbWluRmFjZURpc3RcbiAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBub3JtYWxzOiAtPiBcbiAgICAgICAgXG4gICAgICAgIG5vcm1hbHNBcnJheSA9IFtdXG4gICAgICAgIGZvciBmYWNlIGluIEBmYWNlXG4gICAgICAgICAgICBub3JtYWxzQXJyYXkucHVzaCBub3JtYWwgZmFjZS5tYXAgKHZpZHgpID0+IEB2ZXJ0ZXhbdmlkeF1cbiAgICAgICAgbm9ybWFsc0FycmF5XG4gIFxuICAgIGRhdGE6IC0+XG4gICAgICAgIFxuICAgICAgICBuRWRnZXMgPSAoQGZhY2UubGVuZ3RoICsgQHZlcnRleC5sZW5ndGgpIC0gMiAjIEUgPSBWICsgRiAtIDJcbiAgICAgICAgXCIje0BmYWNlLmxlbmd0aH0gZmFjZXMsICN7bkVkZ2VzfSBlZGdlcywgI3tAdmVydGV4Lmxlbmd0aH0gdmVydGljZXNcIlxuICAgICAgICBcbiAgICBjb2xvcml6ZTogKG1ldGhvZD0nc2lkZWRuZXNzJykgLT4gIyBhc3NpZ24gY29sb3IgaW5kaWNlcyB0byBmYWNlc1xuICAgICAgICBcbiAgICAgICAgQGNvbG9ycyA9IFtdXG4gICAgICAgIGNvbG9ybWVtb3J5ID0ge31cbiAgICAgICAgY29sb3Jhc3NpZ24gPSAoaGFzaCkgLT4gY29sb3JtZW1vcnlbaGFzaF0gPz0gXy5zaXplIGNvbG9ybWVtb3J5XG4gICAgICBcbiAgICAgICAgc3dpdGNoIG1ldGhvZFxuICAgICAgICAgICAgd2hlbiAnc2lnbmF0dXJlJyAjIGNvbG9yIGJ5IGNvbmdydWVuY2Ugc2lnbmF0dXJlXG4gICAgICAgICAgICAgICAgQGNvbG9ycyA9IEBmYWNlLm1hcCAoZikgPT4gY29sb3Jhc3NpZ24gQHNpZ25hdHVyZSBmXG4gICAgICAgICAgICBlbHNlICMgY29sb3IgYnkgZmFjZS1zaWRlZG5lc3NcbiAgICAgICAgICAgICAgICBAY29sb3JzID0gQGZhY2UubWFwIChmKSAtPiBmLmxlbmd0aCAtIDNcbiAgICBcbiAgICAgICAgIyBrbG9nIFwiI3tfLnNpemUoY29sb3JtZW1vcnkpKzF9IGNvbG9yczpcIiBAY29sb3JzXG4gICAgICAgIEBcblxuICAgICMgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgICAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIFxuICAgIFxuICAgIHNpZ25hdHVyZTogKGZhY2UpIC0+XG4gICAgXG4gICAgICAgIHZlcnRpY2VzID0gZmFjZS5tYXAgKHYpID0+IEB2ZXJ0ZXhbdl1cbiAgICAgICAgYW5nbGVzID0gW11cbiAgICAgICAgXG4gICAgICAgIFt2MSwgdjJdID0gdmVydGljZXMuc2xpY2UgLTJcbiAgICAgICAgZm9yIHYzIGluIHZlcnRpY2VzICMgYWNjdW11bGF0ZSBpbm5lciBhbmdsZXMgICAgICAgIFxuICAgICAgICAgICAgYW5nbGVzLnB1c2ggcGFyc2VJbnQgcmFkMmRlZyBtYWcgY3Jvc3Mgc3ViKHYxLCB2MiksIHN1Yih2MywgdjIpXG4gICAgICAgICAgICBbdjEsIHYyXSA9IFt2MiwgdjNdXG4gICAgXG4gICAgICAgIGFuZ2xlcy5zb3J0KCkuam9pbiAnXydcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFBvbHloZWRyb25cbiAgICAiXX0=
//# sourceURL=../../coffee/poly/polyhedron.coffee