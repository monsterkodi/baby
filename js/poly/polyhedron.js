// koffee 1.6.0

/*
00000000    0000000   000      000   000  000   000  00000000  0000000    00000000    0000000   000   000  
000   000  000   000  000       000 000   000   000  000       000   000  000   000  000   000  0000  000  
00000000   000   000  000        00000    000000000  0000000   000   000  0000000    000   000  000 0 000  
000        000   000  000         000     000   000  000       000   000  000   000  000   000  000  0000  
000         0000000   0000000     000     000   000  00000000  0000000    000   000   0000000   000   000
 */
var Polyhedron, Vect, _, add, faceSignature, faceToEdges, facesToWings, mag, min, mult, normal, planararea, ref, sigfigs,
    indexOf = [].indexOf;

_ = require('kxk')._;

ref = require('./math'), add = ref.add, faceSignature = ref.faceSignature, faceToEdges = ref.faceToEdges, facesToWings = ref.facesToWings, mag = ref.mag, mult = ref.mult, normal = ref.normal, planararea = ref.planararea, sigfigs = ref.sigfigs;

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
        var face, i, j, k, len, neighbors, ni, perp, ref1, ref2, ref3, ref4, ref5, toN0, toVertex, v, vi;
        neighbors = (function() {
            var i, len, ref1, results;
            ref1 = this.vertex;
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
                v = ref1[i];
                results.push([]);
            }
            return results;
        }).call(this);
        ref1 = this.face;
        for (i = 0, len = ref1.length; i < len; i++) {
            face = ref1[i];
            for (vi = j = 0, ref2 = face.length; 0 <= ref2 ? j < ref2 : j > ref2; vi = 0 <= ref2 ? ++j : --j) {
                ni = (vi + 1) % face.length;
                if (ref3 = face[ni], indexOf.call(neighbors[face[vi]], ref3) < 0) {
                    neighbors[face[vi]].push(face[ni]);
                }
                if (ref4 = face[vi], indexOf.call(neighbors[face[ni]], ref4) < 0) {
                    neighbors[face[ni]].push(face[vi]);
                }
            }
        }
        for (vi = k = 0, ref5 = neighbors.length; 0 <= ref5 ? k < ref5 : k > ref5; vi = 0 <= ref5 ? ++k : --k) {
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
        return this.vertNormal(v1).addInPlace(this.vertNormal(v2)).scale(0.5);
    };

    Polyhedron.prototype.minEdgeLength = function() {
        var edge, i, len, minEdgeLength, ref1;
        minEdgeLength = 2e308;
        ref1 = this.edges();
        for (i = 0, len = ref1.length; i < len; i++) {
            edge = ref1[i];
            minEdgeLength = min(minEdgeLength, this.vert(edge[0]).dist(this.vert(edge[1])));
        }
        return minEdgeLength;
    };

    Polyhedron.prototype.maxEdgeDifference = function() {
        var diffs, edge, face, i, j, len, len1, length, ref1, ref2;
        diffs = [];
        ref1 = this.face;
        for (i = 0, len = ref1.length; i < len; i++) {
            face = ref1[i];
            length = [];
            ref2 = faceToEdges(face);
            for (j = 0, len1 = ref2.length; j < len1; j++) {
                edge = ref2[j];
                length.push(this.vert(edge[0]).to(this.vert(edge[1])).length());
            }
            diffs.push(_.max(length) - _.min(length));
        }
        return _.max(diffs);
    };

    Polyhedron.prototype.vert = function(vi) {
        return new Vect(this.vertex[vi]);
    };

    Polyhedron.prototype.vertNormal = function(vi) {
        var i, len, ni, ref1, sum;
        sum = new Vector3(0, 0, 0);
        ref1 = this.neighbors(vi);
        for (i = 0, len = ref1.length; i < len; i++) {
            ni = ref1[i];
            sum.addInPlace(this.edge(vi, ni));
        }
        sum.normalize();
        return sum;
    };

    Polyhedron.prototype.centers = function() {
        var centersArray, face, fcenter, i, j, len, len1, ref1, vidx;
        centersArray = [];
        ref1 = this.face;
        for (i = 0, len = ref1.length; i < len; i++) {
            face = ref1[i];
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
        var center, i, len, minFaceDist, ref1;
        minFaceDist = 2e308;
        ref1 = this.centers();
        for (i = 0, len = ref1.length; i < len; i++) {
            center = ref1[i];
            minFaceDist = min(minFaceDist, mag(center));
        }
        return minFaceDist;
    };

    Polyhedron.prototype.normals = function() {
        var face, i, len, normalsArray, ref1;
        normalsArray = [];
        ref1 = this.face;
        for (i = 0, len = ref1.length; i < len; i++) {
            face = ref1[i];
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
        var clr, colorassign, colormemory, f, face_verts, i, len, ref1;
        if (method == null) {
            method = 'sidedness';
        }
        this.colors = [];
        colormemory = {};
        colorassign = function(hash) {
            return colormemory[hash] != null ? colormemory[hash] : colormemory[hash] = _.size(colormemory);
        };
        ref1 = this.face;
        for (i = 0, len = ref1.length; i < len; i++) {
            f = ref1[i];
            switch (method) {
                case 'area':
                    face_verts = f.map((function(_this) {
                        return function(v) {
                            return _this.vertex[v];
                        };
                    })(this));
                    clr = colorassign(sigfigs(planararea(face_verts), 2));
                    break;
                case 'signature':
                    face_verts = f.map((function(_this) {
                        return function(v) {
                            return _this.vertex[v];
                        };
                    })(this));
                    clr = colorassign(faceSignature(face_verts, 2));
                    break;
                default:
                    clr = f.length - 3;
            }
            this.colors.push(clr);
        }
        return this;
    };

    return Polyhedron;

})();

module.exports = Polyhedron;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWhlZHJvbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsb0hBQUE7SUFBQTs7QUFVRSxJQUFNLE9BQUEsQ0FBUSxLQUFSOztBQUNSLE1BQTRGLE9BQUEsQ0FBUSxRQUFSLENBQTVGLEVBQUUsYUFBRixFQUFPLGlDQUFQLEVBQXNCLDZCQUF0QixFQUFtQywrQkFBbkMsRUFBaUQsYUFBakQsRUFBc0QsZUFBdEQsRUFBNEQsbUJBQTVELEVBQW9FLDJCQUFwRSxFQUFnRjs7QUFDOUUsTUFBUTs7QUFDVixJQUFBLEdBQU8sT0FBQSxDQUFRLFNBQVI7O0FBRUQ7SUFFQyxvQkFBQyxJQUFELEVBQVEsS0FBUixFQUFlLE1BQWY7UUFBQyxJQUFDLENBQUEsT0FBRDtRQUFPLElBQUMsQ0FBQSxPQUFEO1FBQU8sSUFBQyxDQUFBLFNBQUQ7O1lBRWQsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxPQUFVOzs7WUFDWCxJQUFDLENBQUE7O1lBQUQsSUFBQyxDQUFBLFNBQVU7OztZQUNYLElBQUMsQ0FBQTs7WUFBRCxJQUFDLENBQUEsT0FBVTs7SUFKWjs7eUJBWUgsU0FBQSxHQUFXLFNBQUE7QUFFUCxZQUFBO1FBQUEsU0FBQTs7QUFBYTtBQUFBO2lCQUFBLHNDQUFBOzs2QkFBQTtBQUFBOzs7QUFDYjtBQUFBLGFBQUEsc0NBQUE7O0FBQ0ksaUJBQVUsMkZBQVY7Z0JBQ0ksRUFBQSxHQUFLLENBQUMsRUFBQSxHQUFHLENBQUosQ0FBQSxHQUFTLElBQUksQ0FBQztnQkFDbkIsV0FBRyxJQUFLLENBQUEsRUFBQSxDQUFMLEVBQUEsYUFBZ0IsU0FBVSxDQUFBLElBQUssQ0FBQSxFQUFBLENBQUwsQ0FBMUIsRUFBQSxJQUFBLEtBQUg7b0JBQ0ksU0FBVSxDQUFBLElBQUssQ0FBQSxFQUFBLENBQUwsQ0FBUyxDQUFDLElBQXBCLENBQXlCLElBQUssQ0FBQSxFQUFBLENBQTlCLEVB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QUMsQ0FBQSxNQUFPLENBQUEsQ0FBQTt3QkFBZjtvQkFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQU47b0JBQ2IsR0FBQSxHQUFNLFdBQUEsQ0FBWSxPQUFBLENBQVEsVUFBQSxDQUFXLFVBQVgsQ0FBUixFQUFnQyxDQUFoQyxDQUFaO0FBRkw7QUFEVCxxQkFJUyxXQUpUO29CQUtRLFVBQUEsR0FBYSxDQUFDLENBQUMsR0FBRixDQUFNLENBQUEsU0FBQSxLQUFBOytCQUFBLFNBQUMsQ0FBRDttQ0FBTyxLQUFDLENBQUEsTUFBTyxDQUFBLENBQUE7d0JBQWY7b0JBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFOO29CQUNiLEdBQUEsR0FBTSxXQUFBLENBQVksYUFBQSxDQUFjLFVBQWQsRUFBMEIsQ0FBMUIsQ0FBWjtBQUZMO0FBSlQ7b0JBUVEsR0FBQSxHQUFNLENBQUMsQ0FBQyxNQUFGLEdBQVc7QUFSekI7WUFTQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxHQUFiO0FBVko7ZUFhQTtJQW5CTTs7Ozs7O0FBcUJkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbjAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMjI1xuXG4jIFBvbHlow6lkcm9uaXNtZSwgQ29weXJpZ2h0IDIwMTksIEFuc2VsbSBMZXZza2F5YSwgTUlUIExpY2Vuc2VcblxueyBfIH0gPSByZXF1aXJlICdreGsnXG57IGFkZCwgZmFjZVNpZ25hdHVyZSwgZmFjZVRvRWRnZXMsIGZhY2VzVG9XaW5ncywgbWFnLCBtdWx0LCBub3JtYWwsIHBsYW5hcmFyZWEsIHNpZ2ZpZ3MgfSA9IHJlcXVpcmUgJy4vbWF0aCdcbnsgbWluIH0gPSBNYXRoXG5WZWN0ID0gcmVxdWlyZSAnLi4vdmVjdCdcblxuY2xhc3MgUG9seWhlZHJvbiBcblxuICAgIEA6IChAbmFtZSwgQGZhY2UsIEB2ZXJ0ZXgpIC0+XG5cbiAgICAgICAgQGZhY2UgICA/PSBbXVxuICAgICAgICBAdmVydGV4ID89IFtdIFxuICAgICAgICBAbmFtZSAgID89IFwicG9seWhlZHJvblwiXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBuZWlnaGJvcnM6IC0+XG5cbiAgICAgICAgbmVpZ2hib3JzID0gKFtdIGZvciB2IGluIEB2ZXJ0ZXgpXG4gICAgICAgIGZvciBmYWNlIGluIEBmYWNlXG4gICAgICAgICAgICBmb3IgdmkgaW4gWzAuLi5mYWNlLmxlbmd0aF1cbiAgICAgICAgICAgICAgICBuaSA9ICh2aSsxKSAlIGZhY2UubGVuZ3RoXG4gICAgICAgICAgICAgICAgaWYgZmFjZVtuaV0gbm90IGluIG5laWdoYm9yc1tmYWNlW3ZpXV1cbiAgICAgICAgICAgICAgICAgICAgbmVpZ2hib3JzW2ZhY2VbdmldXS5wdXNoIGZhY2VbbmldXG4gICAgICAgICAgICAgICAgaWYgZmFjZVt2aV0gbm90IGluIG5laWdoYm9yc1tmYWNlW25pXV1cbiAgICAgICAgICAgICAgICAgICAgbmVpZ2hib3JzW2ZhY2VbbmldXS5wdXNoIGZhY2VbdmldICAgICAgICAgIFxuICAgICAgICAgICAgICBcbiAgICAgICAgZm9yIHZpIGluIFswLi4ubmVpZ2hib3JzLmxlbmd0aF1cbiAgICAgICAgICAgIHRvVmVydGV4ID0gQHZlcnQgdmlcbiAgICAgICAgICAgIHRvVmVydGV4Lm5vcm1hbGl6ZSgpXG4gICAgICAgICAgICB0b04wID0gQHZlcnQgbmVpZ2hib3JzW3ZpXVswXVxuICAgICAgICAgICAgcGVycCA9IHRvVmVydGV4LmNyb3NzZWQgdG9OMFxuICAgICAgICAgICAgbmVpZ2hib3JzW3ZpXS5zb3J0IChhLGIpID0+XG4gICAgICAgICAgICAgICAgYWEgPSBWZWN0LkdldEFuZ2xlQmV0d2VlblZlY3RvcnMgcGVycCwgQHZlcnQoYSksIHRvVmVydGV4XG4gICAgICAgICAgICAgICAgYmIgPSBWZWN0LkdldEFuZ2xlQmV0d2VlblZlY3RvcnMgcGVycCwgQHZlcnQoYiksIHRvVmVydGV4XG4gICAgICAgICAgICAgICAgYWEgLSBiYlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgbmVpZ2hib3JzXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICB3aW5nczogLT4gZmFjZXNUb1dpbmdzIEBmYWNlXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgMDAwICBcbiAgICAjIDAwMDAwMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBlZGdlczogLT5cbiAgICAgICAgXG4gICAgICAgIHVuaXFFZGdlcyA9IHt9XG4gICAgICAgIGZhY2VFZGdlcyA9IEBmYWNlLm1hcCBmYWNlVG9FZGdlc1xuICAgICAgICBmb3IgZWRnZVNldCBpbiBmYWNlRWRnZXNcbiAgICAgICAgICAgIGZvciBlIGluIGVkZ2VTZXRcbiAgICAgICAgICAgICAgICBpZiBlWzBdPGVbMV0gdGhlbiBbYSwgYl0gPSBlXG4gICAgICAgICAgICAgICAgZWxzZSAgICAgICAgICAgICAgW2IsIGFdID0gZVxuICAgICAgICAgICAgICAgIHVuaXFFZGdlc1tcIiN7YX1+I3tifVwiXSA9IGVcbiAgICAgICAgXy52YWx1ZXMgdW5pcUVkZ2VzXG4gICAgICBcbiAgICBlZGdlOiAodjEsIHYyKSAtPlxuICAgICAgICBcbiAgICAgICAgQHZlcnQodjIpLnN1YnRyYWN0IEB2ZXJ0KHYxKVxuICAgIFxuICAgIGVkZ2VOb3JtYWw6ICh2MSwgdjIpIC0+XG4gICAgICAgIFxuICAgICAgICBAdmVydE5vcm1hbCh2MSkuYWRkSW5QbGFjZShAdmVydE5vcm1hbCh2MikpLnNjYWxlKDAuNSlcbiAgICAgICAgXG4gICAgbWluRWRnZUxlbmd0aDogLT5cbiAgICAgICAgXG4gICAgICAgIG1pbkVkZ2VMZW5ndGggPSBJbmZpbml0eVxuICAgICAgICBcbiAgICAgICAgZm9yIGVkZ2UgaW4gQGVkZ2VzKClcbiAgICAgICAgICAgIG1pbkVkZ2VMZW5ndGggPSBtaW4gbWluRWRnZUxlbmd0aCwgQHZlcnQoZWRnZVswXSkuZGlzdCBAdmVydCBlZGdlWzFdXG4gICAgICAgICAgICBcbiAgICAgICAgbWluRWRnZUxlbmd0aFxuXG4gICAgbWF4RWRnZURpZmZlcmVuY2U6IC0+XG4gICAgICAgIGRpZmZzID0gW11cbiAgICAgICAgZm9yIGZhY2UgaW4gQGZhY2VcbiAgICAgICAgICAgIGxlbmd0aCA9IFtdXG4gICAgICAgICAgICBmb3IgZWRnZSBpbiBmYWNlVG9FZGdlcyBmYWNlXG4gICAgICAgICAgICAgICAgbGVuZ3RoLnB1c2ggQHZlcnQoZWRnZVswXSkudG8oQHZlcnQoZWRnZVsxXSkpLmxlbmd0aCgpXG4gICAgICAgICAgICBkaWZmcy5wdXNoIF8ubWF4KGxlbmd0aCkgLSBfLm1pbihsZW5ndGgpXG4gICAgICAgIF8ubWF4IGRpZmZzXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgIFxuICAgICMgIDAwMCAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgIFxuICAgICMgICAgIDAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHZlcnQ6ICh2aSkgLT4gXG4gICAgXG4gICAgICAgIG5ldyBWZWN0IEB2ZXJ0ZXhbdmldXG4gICAgICAgICAgICAgICAgXG4gICAgdmVydE5vcm1hbDogKHZpKSAtPlxuICAgICAgICAgXG4gICAgICAgIHN1bSA9IG5ldyBWZWN0b3IzIDAgMCAwXG4gICAgICAgIGZvciBuaSBpbiBAbmVpZ2hib3JzKHZpKVxuICAgICAgICAgICAgc3VtLmFkZEluUGxhY2UgQGVkZ2UgdmksIG5pXG4gICAgICAgIHN1bS5ub3JtYWxpemUoKVxuICAgICAgICBzdW1cbiAgICAgICAgICAgICAgICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBjZW50ZXJzOiAtPiBcbiAgICAgICAgY2VudGVyc0FycmF5ID0gW11cbiAgICAgICAgZm9yIGZhY2UgaW4gQGZhY2VcbiAgICAgICAgICAgIGZjZW50ZXIgPSBbMCAwIDBdXG4gICAgICAgICAgICBmb3IgdmlkeCBpbiBmYWNlXG4gICAgICAgICAgICAgICAgZmNlbnRlciA9IGFkZCBmY2VudGVyLCBAdmVydGV4W3ZpZHhdXG4gICAgICAgICAgICBjZW50ZXJzQXJyYXkucHVzaCBtdWx0IDEuMC9mYWNlLmxlbmd0aCwgZmNlbnRlclxuICAgICAgICBjZW50ZXJzQXJyYXlcbiAgICAgICAgXG4gICAgbWluRmFjZURpc3Q6IC0+XG4gICAgICAgIFxuICAgICAgICBtaW5GYWNlRGlzdCA9IEluZmluaXR5XG4gICAgICAgIFxuICAgICAgICBmb3IgY2VudGVyIGluIEBjZW50ZXJzKClcbiAgICAgICAgICAgIG1pbkZhY2VEaXN0ID0gbWluIG1pbkZhY2VEaXN0LCBtYWcgY2VudGVyXG4gICAgICAgICAgICBcbiAgICAgICAgbWluRmFjZURpc3RcbiAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBub3JtYWxzOiAtPiBcbiAgICAgICAgbm9ybWFsc0FycmF5ID0gW11cbiAgICAgICAgZm9yIGZhY2UgaW4gQGZhY2VcbiAgICAgICAgICAgIG5vcm1hbHNBcnJheS5wdXNoIG5vcm1hbCBmYWNlLm1hcCAodmlkeCkgPT4gQHZlcnRleFt2aWR4XVxuICAgICAgICBub3JtYWxzQXJyYXlcbiAgXG4gICAgZGF0YTogLT5cbiAgICAgICAgbkVkZ2VzID0gKEBmYWNlLmxlbmd0aCArIEB2ZXJ0ZXgubGVuZ3RoKSAtIDI7ICMgRSA9IFYgKyBGIC0gMlxuICAgICAgICBcIiN7QGZhY2UubGVuZ3RofSBmYWNlcywgI3tuRWRnZXN9IGVkZ2VzLCAje0B2ZXJ0ZXgubGVuZ3RofSB2ZXJ0aWNlc1wiXG4gICAgICAgIFxuICAgIGNvbG9yaXplOiAobWV0aG9kPSdzaWRlZG5lc3MnKSAtPiAjIGFzc2lnbiBjb2xvciBpbmRpY2VzIHRvIGZhY2VzXG4gICAgICAgIFxuICAgICAgICBAY29sb3JzID0gW11cbiAgICAgICAgY29sb3JtZW1vcnkgPSB7fVxuICAgICAgICBjb2xvcmFzc2lnbiA9IChoYXNoKSAtPiBjb2xvcm1lbW9yeVtoYXNoXSA/PSBfLnNpemUgY29sb3JtZW1vcnlcbiAgICAgIFxuICAgICAgICBmb3IgZiBpbiBAZmFjZVxuICAgICAgICAgICAgc3dpdGNoIG1ldGhvZFxuICAgICAgICAgICAgICAgIHdoZW4gJ2FyZWEnICMgY29sb3IgYnkgZmFjZSBwbGFuYXIgYXJlYSBhc3N1bWluZyBmbGF0bmVzc1xuICAgICAgICAgICAgICAgICAgICBmYWNlX3ZlcnRzID0gZi5tYXAgKHYpID0+IEB2ZXJ0ZXhbdl1cbiAgICAgICAgICAgICAgICAgICAgY2xyID0gY29sb3Jhc3NpZ24gc2lnZmlncyBwbGFuYXJhcmVhKGZhY2VfdmVydHMpLCAyXG4gICAgICAgICAgICAgICAgd2hlbiAnc2lnbmF0dXJlJyAjIGNvbG9yIGJ5IGNvbmdydWVuY2Ugc2lnbmF0dXJlXG4gICAgICAgICAgICAgICAgICAgIGZhY2VfdmVydHMgPSBmLm1hcCAodikgPT4gQHZlcnRleFt2XVxuICAgICAgICAgICAgICAgICAgICBjbHIgPSBjb2xvcmFzc2lnbiBmYWNlU2lnbmF0dXJlIGZhY2VfdmVydHMsIDJcbiAgICAgICAgICAgICAgICBlbHNlICMgY29sb3IgYnkgZmFjZS1zaWRlZG5lc3NcbiAgICAgICAgICAgICAgICAgICAgY2xyID0gZi5sZW5ndGggLSAzXG4gICAgICAgICAgICBAY29sb3JzLnB1c2ggY2xyXG4gICAgXG4gICAgICAgICMga2xvZyBcIiN7Xy5zaXplKGNvbG9ybWVtb3J5KSsxfSBjb2xvcnM6XCIgQGNvbG9yc1xuICAgICAgICBAXG5cbm1vZHVsZS5leHBvcnRzID0gUG9seWhlZHJvblxuICAgICJdfQ==
//# sourceURL=../../coffee/poly/polyhedron.coffee