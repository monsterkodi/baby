// koffee 1.6.0

/*
00000000    0000000   000      000   000  000   000  00000000  0000000    00000000    0000000   000   000  
000   000  000   000  000       000 000   000   000  000       000   000  000   000  000   000  0000  000  
00000000   000   000  000        00000    000000000  0000000   000   000  0000000    000   000  000 0 000  
000        000   000  000         000     000   000  000       000   000  000   000  000   000  000  0000  
000         0000000   0000000     000     000   000  00000000  0000000    000   000   0000000   000   000
 */
var Polyhedron, Vect, _, add, faceToEdges, facesToWings, mag, min, mult, normal, ref,
    indexOf = [].indexOf;

_ = require('kxk')._;

ref = require('./math'), add = ref.add, faceToEdges = ref.faceToEdges, facesToWings = ref.facesToWings, mag = ref.mag, mult = ref.mult, normal = ref.normal;

min = Math.min;

Vect = require('../vect');

Polyhedron = (function() {
    function Polyhedron(name, faces, vertices) {
        this.name = name;
        this.faces = faces;
        this.vertices = vertices;
        if (this.faces != null) {
            this.faces;
        } else {
            this.faces = [];
        }
        if (this.vertices != null) {
            this.vertices;
        } else {
            this.vertices = [];
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
            ref1 = this.vertices;
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
                v = ref1[i];
                results.push([]);
            }
            return results;
        }).call(this);
        ref1 = this.faces;
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
        return facesToWings(this.faces);
    };

    Polyhedron.prototype.edges = function() {
        var a, b, e, edgeSet, faceEdges, i, j, len, len1, uniqEdges;
        uniqEdges = {};
        faceEdges = this.faces.map(faceToEdges);
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

    Polyhedron.prototype.vert = function(vi) {
        return new Vect(this.vertices[vi]);
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
        ref1 = this.faces;
        for (i = 0, len = ref1.length; i < len; i++) {
            face = ref1[i];
            fcenter = [0, 0, 0];
            for (j = 0, len1 = face.length; j < len1; j++) {
                vidx = face[j];
                fcenter = add(fcenter, this.vertices[vidx]);
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
        ref1 = this.faces;
        for (i = 0, len = ref1.length; i < len; i++) {
            face = ref1[i];
            normalsArray.push(normal(face.map((function(_this) {
                return function(vidx) {
                    return _this.vertices[vidx];
                };
            })(this))));
        }
        return normalsArray;
    };

    Polyhedron.prototype.data = function() {
        var nEdges;
        nEdges = (this.faces.length + this.vertices.length) - 2;
        return this.faces.length + " faces, " + nEdges + " edges, " + this.vertices.length + " vertices";
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
        ref1 = this.faces;
        for (i = 0, len = ref1.length; i < len; i++) {
            f = ref1[i];
            switch (method) {
                case 'area':
                    face_verts = f.map((function(_this) {
                        return function(v) {
                            return _this.vertices[v];
                        };
                    })(this));
                    clr = colorassign(sigfigs(planararea(face_verts), 2));
                    break;
                case 'signature':
                    face_verts = f.map((function(_this) {
                        return function(v) {
                            return _this.vertices[v];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWhlZHJvbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsZ0ZBQUE7SUFBQTs7QUFVRSxJQUFNLE9BQUEsQ0FBUSxLQUFSOztBQUNSLE1BQXdELE9BQUEsQ0FBUSxRQUFSLENBQXhELEVBQUUsYUFBRixFQUFPLDZCQUFQLEVBQW9CLCtCQUFwQixFQUFrQyxhQUFsQyxFQUF1QyxlQUF2QyxFQUE2Qzs7QUFDM0MsTUFBUTs7QUFDVixJQUFBLEdBQU8sT0FBQSxDQUFRLFNBQVI7O0FBRUQ7SUFFQyxvQkFBQyxJQUFELEVBQVEsS0FBUixFQUFnQixRQUFoQjtRQUFDLElBQUMsQ0FBQSxPQUFEO1FBQU8sSUFBQyxDQUFBLFFBQUQ7UUFBUSxJQUFDLENBQUEsV0FBRDs7WUFFZixJQUFDLENBQUE7O1lBQUQsSUFBQyxDQUFBLFFBQVk7OztZQUNiLElBQUMsQ0FBQTs7WUFBRCxJQUFDLENBQUEsV0FBWTs7O1lBQ2IsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxPQUFZOztJQUpkOzt5QkFZSCxTQUFBLEdBQVcsU0FBQTtBQUVQLFlBQUE7UUFBQSxTQUFBOztBQUFhO0FBQUE7aUJBQUEsc0NBQUE7OzZCQUFBO0FBQUE7OztBQUNiO0FBQUEsYUFBQSxzQ0FBQTs7QUFDSSxpQkFBVSwyRkFBVjtnQkFDSSxFQUFBLEdBQUssQ0FBQyxFQUFBLEdBQUcsQ0FBSixDQUFBLEdBQVMsSUFBSSxDQUFDO2dCQUNuQixXQUFHLElBQUssQ0FBQSxFQUFBLENBQUwsRUFBQSxhQUFnQixTQUFVLENBQUEsSUFBSyxDQUFBLEVBQUEsQ0FBTCxDQUExQixFQUFBLElBQUEsS0FBSDtvQkFDSSxTQUFVLENBQUEsSUFBSyxDQUFBLEVBQUEsQ0FBTCxDQUFTLENBQUMsSUFBcEIsQ0FBeUIsSUFBSyxDQUFBLEVBQUEsQ0FBOUIsRUFESjs7Z0JBRUEsV0FBRyxJQUFLLENBQUEsRUFBQSxDQUFMLEVBQUEsYUFBZ0IsU0FBVSxDQUFBLElBQUssQ0FBQSxFQUFBLENBQUwsQ0FBMUIsRUFBQSxJQUFBLEtBQUg7b0JBQ0ksU0FBVSxDQUFBLElBQUssQ0FBQSxFQUFBLENBQUwsQ0FBUyxDQUFDLElBQXBCLENBQXlCLElBQUssQ0FBQSxFQUFBLENBQTlCLEVBREo7O0FBSko7QUFESjtBQVFBLGFBQVUsZ0dBQVY7WUFDSSxRQUFBLEdBQVcsSUFBQyxDQUFBLElBQUQsQ0FBTSxFQUFOO1lBQ1gsUUFBUSxDQUFDLFNBQVQsQ0FBQTtZQUNBLElBQUEsR0FBTyxJQUFDLENBQUEsSUFBRCxDQUFNLFNBQVUsQ0FBQSxFQUFBLENBQUksQ0FBQSxDQUFBLENBQXBCO1lBQ1AsSUFBQSxHQUFPLFFBQVEsQ0FBQyxPQUFULENBQWlCLElBQWpCO1lBQ1AsU0FBVSxDQUFBLEVBQUEsQ0FBRyxDQUFDLElBQWQsQ0FBbUIsQ0FBQSxTQUFBLEtBQUE7dUJBQUEsU0FBQyxDQUFELEVBQUcsQ0FBSDtBQUNmLHdCQUFBO29CQUFBLEVBQUEsR0FBSyxJQUFJLENBQUMsc0JBQUwsQ0FBNEIsSUFBNUIsRUFBa0MsS0FBQyxDQUFBLElBQUQsQ0FBTSxDQUFOLENBQWxDLEVBQTRDLFFBQTVDO29CQUNMLEVBQUEsR0FBSyxJQUFJLENBQUMsc0JBQUwsQ0FBNEIsSUFBNUIsRUFBa0MsS0FBQyxDQUFBLElBQUQsQ0FBTSxDQUFOLENBQWxDLEVBQTRDLFFBQTVDOzJCQUNMLEVBQUEsR0FBSztnQkFIVTtZQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkI7QUFMSjtlQVVBO0lBckJPOzt5QkE2QlgsS0FBQSxHQUFPLFNBQUE7ZUFBRyxZQUFBLENBQWEsSUFBQyxDQUFBLEtBQWQ7SUFBSDs7eUJBUVAsS0FBQSxHQUFPLFNBQUE7QUFFSCxZQUFBO1FBQUEsU0FBQSxHQUFZO1FBQ1osU0FBQSxHQUFZLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLFdBQVg7QUFDWixhQUFBLDJDQUFBOztBQUNJLGlCQUFBLDJDQUFBOztnQkFDSSxJQUFHLENBQUUsQ0FBQSxDQUFBLENBQUYsR0FBSyxDQUFFLENBQUEsQ0FBQSxDQUFWO29CQUFtQixRQUFELEVBQUksU0FBdEI7aUJBQUEsTUFBQTtvQkFDbUIsUUFBRCxFQUFJLFNBRHRCOztnQkFFQSxTQUFVLENBQUcsQ0FBRCxHQUFHLEdBQUgsR0FBTSxDQUFSLENBQVYsR0FBeUI7QUFIN0I7QUFESjtlQUtBLENBQUMsQ0FBQyxNQUFGLENBQVMsU0FBVDtJQVRHOzt5QkFXUCxJQUFBLEdBQU0sU0FBQyxFQUFELEVBQUssRUFBTDtlQUVGLElBQUMsQ0FBQSxJQUFELENBQU0sRUFBTixDQUFTLENBQUMsUUFBVixDQUFtQixJQUFDLENBQUEsSUFBRCxDQUFNLEVBQU4sQ0FBbkI7SUFGRTs7eUJBSU4sVUFBQSxHQUFZLFNBQUMsRUFBRCxFQUFLLEVBQUw7ZUFFUixJQUFDLENBQUEsVUFBRCxDQUFZLEVBQVosQ0FBZSxDQUFDLFVBQWhCLENBQTJCLElBQUMsQ0FBQSxVQUFELENBQVksRUFBWixDQUEzQixDQUEyQyxDQUFDLEtBQTVDLENBQWtELEdBQWxEO0lBRlE7O3lCQUlaLGFBQUEsR0FBZSxTQUFBO0FBRVgsWUFBQTtRQUFBLGFBQUEsR0FBZ0I7QUFFaEI7QUFBQSxhQUFBLHNDQUFBOztZQUNJLGFBQUEsR0FBZ0IsR0FBQSxDQUFJLGFBQUosRUFBbUIsSUFBQyxDQUFBLElBQUQsQ0FBTSxJQUFLLENBQUEsQ0FBQSxDQUFYLENBQWMsQ0FBQyxJQUFmLENBQW9CLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBSyxDQUFBLENBQUEsQ0FBWCxDQUFwQixDQUFuQjtBQURwQjtlQUdBO0lBUFc7O3lCQWVmLElBQUEsR0FBTSxTQUFDLEVBQUQ7ZUFFRixJQUFJLElBQUosQ0FBUyxJQUFDLENBQUEsUUFBUyxDQUFBLEVBQUEsQ0FBbkI7SUFGRTs7eUJBSU4sVUFBQSxHQUFZLFNBQUMsRUFBRDtBQUVSLFlBQUE7UUFBQSxHQUFBLEdBQU0sSUFBSSxPQUFKLENBQVksQ0FBWixFQUFjLENBQWQsRUFBZ0IsQ0FBaEI7QUFDTjtBQUFBLGFBQUEsc0NBQUE7O1lBQ0ksR0FBRyxDQUFDLFVBQUosQ0FBZSxJQUFDLENBQUEsSUFBRCxDQUFNLEVBQU4sRUFBVSxFQUFWLENBQWY7QUFESjtRQUVBLEdBQUcsQ0FBQyxTQUFKLENBQUE7ZUFDQTtJQU5ROzt5QkFjWixPQUFBLEdBQVMsU0FBQTtBQUNMLFlBQUE7UUFBQSxZQUFBLEdBQWU7QUFDZjtBQUFBLGFBQUEsc0NBQUE7O1lBQ0ksT0FBQSxHQUFVLENBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxDQUFMO0FBQ1YsaUJBQUEsd0NBQUE7O2dCQUNJLE9BQUEsR0FBVSxHQUFBLENBQUksT0FBSixFQUFhLElBQUMsQ0FBQSxRQUFTLENBQUEsSUFBQSxDQUF2QjtBQURkO1lBRUEsWUFBWSxDQUFDLElBQWIsQ0FBa0IsSUFBQSxDQUFLLEdBQUEsR0FBSSxJQUFJLENBQUMsTUFBZCxFQUFzQixPQUF0QixDQUFsQjtBQUpKO2VBS0E7SUFQSzs7eUJBU1QsV0FBQSxHQUFhLFNBQUE7QUFFVCxZQUFBO1FBQUEsV0FBQSxHQUFjO0FBRWQ7QUFBQSxhQUFBLHNDQUFBOztZQUNJLFdBQUEsR0FBYyxHQUFBLENBQUksV0FBSixFQUFpQixHQUFBLENBQUksTUFBSixDQUFqQjtBQURsQjtlQUdBO0lBUFM7O3lCQWViLE9BQUEsR0FBUyxTQUFBO0FBQ0wsWUFBQTtRQUFBLFlBQUEsR0FBZTtBQUNmO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxZQUFZLENBQUMsSUFBYixDQUFrQixNQUFBLENBQU8sSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFBLFNBQUEsS0FBQTt1QkFBQSxTQUFDLElBQUQ7MkJBQVUsS0FBQyxDQUFBLFFBQVMsQ0FBQSxJQUFBO2dCQUFwQjtZQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBVCxDQUFQLENBQWxCO0FBREo7ZUFFQTtJQUpLOzt5QkFNVCxJQUFBLEdBQU0sU0FBQTtBQUNGLFlBQUE7UUFBQSxNQUFBLEdBQVMsQ0FBQyxJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsR0FBZ0IsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUEzQixDQUFBLEdBQXFDO2VBQzNDLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUixHQUFlLFVBQWYsR0FBeUIsTUFBekIsR0FBZ0MsVUFBaEMsR0FBMEMsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFwRCxHQUEyRDtJQUYzRDs7eUJBSU4sUUFBQSxHQUFVLFNBQUMsTUFBRDtBQUVOLFlBQUE7O1lBRk8sU0FBTzs7UUFFZCxJQUFDLENBQUEsTUFBRCxHQUFVO1FBQ1YsV0FBQSxHQUFjO1FBQ2QsV0FBQSxHQUFjLFNBQUMsSUFBRDsrQ0FBVSxXQUFZLENBQUEsSUFBQSxJQUFaLFdBQVksQ0FBQSxJQUFBLElBQVMsQ0FBQyxDQUFDLElBQUYsQ0FBTyxXQUFQO1FBQS9CO0FBRWQ7QUFBQSxhQUFBLHNDQUFBOztBQUNJLG9CQUFPLE1BQVA7QUFBQSxxQkFDUyxNQURUO29CQUVRLFVBQUEsR0FBYSxDQUFDLENBQUMsR0FBRixDQUFNLENBQUEsU0FBQSxLQUFBOytCQUFBLFNBQUMsQ0FBRDttQ0FBTyxLQUFDLENBQUEsUUFBUyxDQUFBLENBQUE7d0JBQWpCO29CQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTjtvQkFDYixHQUFBLEdBQU0sV0FBQSxDQUFZLE9BQUEsQ0FBUSxVQUFBLENBQVcsVUFBWCxDQUFSLEVBQWdDLENBQWhDLENBQVo7QUFGTDtBQURULHFCQUlTLFdBSlQ7b0JBS1EsVUFBQSxHQUFhLENBQUMsQ0FBQyxHQUFGLENBQU0sQ0FBQSxTQUFBLEtBQUE7K0JBQUEsU0FBQyxDQUFEO21DQUFPLEtBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQTt3QkFBakI7b0JBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFOO29CQUNiLEdBQUEsR0FBTSxXQUFBLENBQVksYUFBQSxDQUFjLFVBQWQsRUFBMEIsQ0FBMUIsQ0FBWjtBQUZMO0FBSlQ7b0JBUVEsR0FBQSxHQUFNLENBQUMsQ0FBQyxNQUFGLEdBQVc7QUFSekI7WUFTQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxHQUFiO0FBVko7ZUFhQTtJQW5CTTs7Ozs7O0FBcUJkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbjAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMjI1xuXG4jIFBvbHlow6lkcm9uaXNtZSwgQ29weXJpZ2h0IDIwMTksIEFuc2VsbSBMZXZza2F5YSwgTUlUIExpY2Vuc2VcblxueyBfIH0gPSByZXF1aXJlICdreGsnXG57IGFkZCwgZmFjZVRvRWRnZXMsIGZhY2VzVG9XaW5ncywgbWFnLCBtdWx0LCBub3JtYWwgfSA9IHJlcXVpcmUgJy4vbWF0aCdcbnsgbWluIH0gPSBNYXRoXG5WZWN0ID0gcmVxdWlyZSAnLi4vdmVjdCdcblxuY2xhc3MgUG9seWhlZHJvbiBcblxuICAgIEA6IChAbmFtZSwgQGZhY2VzLCBAdmVydGljZXMpIC0+XG5cbiAgICAgICAgQGZhY2VzICAgID89IFtdXG4gICAgICAgIEB2ZXJ0aWNlcyA/PSBbXSBcbiAgICAgICAgQG5hbWUgICAgID89IFwicG9seWhlZHJvblwiXG5cbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBuZWlnaGJvcnM6IC0+XG5cbiAgICAgICAgbmVpZ2hib3JzID0gKFtdIGZvciB2IGluIEB2ZXJ0aWNlcylcbiAgICAgICAgZm9yIGZhY2UgaW4gQGZhY2VzXG4gICAgICAgICAgICBmb3IgdmkgaW4gWzAuLi5mYWNlLmxlbmd0aF1cbiAgICAgICAgICAgICAgICBuaSA9ICh2aSsxKSAlIGZhY2UubGVuZ3RoXG4gICAgICAgICAgICAgICAgaWYgZmFjZVtuaV0gbm90IGluIG5laWdoYm9yc1tmYWNlW3ZpXV1cbiAgICAgICAgICAgICAgICAgICAgbmVpZ2hib3JzW2ZhY2VbdmldXS5wdXNoIGZhY2VbbmldXG4gICAgICAgICAgICAgICAgaWYgZmFjZVt2aV0gbm90IGluIG5laWdoYm9yc1tmYWNlW25pXV1cbiAgICAgICAgICAgICAgICAgICAgbmVpZ2hib3JzW2ZhY2VbbmldXS5wdXNoIGZhY2VbdmldICAgICAgICAgIFxuICAgICAgICAgICAgICBcbiAgICAgICAgZm9yIHZpIGluIFswLi4ubmVpZ2hib3JzLmxlbmd0aF1cbiAgICAgICAgICAgIHRvVmVydGV4ID0gQHZlcnQgdmlcbiAgICAgICAgICAgIHRvVmVydGV4Lm5vcm1hbGl6ZSgpXG4gICAgICAgICAgICB0b04wID0gQHZlcnQgbmVpZ2hib3JzW3ZpXVswXVxuICAgICAgICAgICAgcGVycCA9IHRvVmVydGV4LmNyb3NzZWQgdG9OMFxuICAgICAgICAgICAgbmVpZ2hib3JzW3ZpXS5zb3J0IChhLGIpID0+XG4gICAgICAgICAgICAgICAgYWEgPSBWZWN0LkdldEFuZ2xlQmV0d2VlblZlY3RvcnMgcGVycCwgQHZlcnQoYSksIHRvVmVydGV4XG4gICAgICAgICAgICAgICAgYmIgPSBWZWN0LkdldEFuZ2xlQmV0d2VlblZlY3RvcnMgcGVycCwgQHZlcnQoYiksIHRvVmVydGV4XG4gICAgICAgICAgICAgICAgYWEgLSBiYlxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgbmVpZ2hib3JzXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICB3aW5nczogLT4gZmFjZXNUb1dpbmdzIEBmYWNlc1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAgICAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgZWRnZXM6IC0+XG4gICAgICAgIFxuICAgICAgICB1bmlxRWRnZXMgPSB7fVxuICAgICAgICBmYWNlRWRnZXMgPSBAZmFjZXMubWFwIGZhY2VUb0VkZ2VzXG4gICAgICAgIGZvciBlZGdlU2V0IGluIGZhY2VFZGdlc1xuICAgICAgICAgICAgZm9yIGUgaW4gZWRnZVNldFxuICAgICAgICAgICAgICAgIGlmIGVbMF08ZVsxXSB0aGVuIFthLCBiXSA9IGVcbiAgICAgICAgICAgICAgICBlbHNlICAgICAgICAgICAgICBbYiwgYV0gPSBlXG4gICAgICAgICAgICAgICAgdW5pcUVkZ2VzW1wiI3thfX4je2J9XCJdID0gZVxuICAgICAgICBfLnZhbHVlcyB1bmlxRWRnZXNcbiAgICAgIFxuICAgIGVkZ2U6ICh2MSwgdjIpIC0+XG4gICAgICAgIFxuICAgICAgICBAdmVydCh2Mikuc3VidHJhY3QgQHZlcnQodjEpXG4gICAgXG4gICAgZWRnZU5vcm1hbDogKHYxLCB2MikgLT5cbiAgICAgICAgXG4gICAgICAgIEB2ZXJ0Tm9ybWFsKHYxKS5hZGRJblBsYWNlKEB2ZXJ0Tm9ybWFsKHYyKSkuc2NhbGUoMC41KVxuICAgICAgICBcbiAgICBtaW5FZGdlTGVuZ3RoOiAtPlxuICAgICAgICBcbiAgICAgICAgbWluRWRnZUxlbmd0aCA9IEluZmluaXR5XG4gICAgICAgIFxuICAgICAgICBmb3IgZWRnZSBpbiBAZWRnZXMoKVxuICAgICAgICAgICAgbWluRWRnZUxlbmd0aCA9IG1pbiBtaW5FZGdlTGVuZ3RoLCBAdmVydChlZGdlWzBdKS5kaXN0IEB2ZXJ0IGVkZ2VbMV1cbiAgICAgICAgICAgIFxuICAgICAgICBtaW5FZGdlTGVuZ3RoXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgIFxuICAgICMgIDAwMCAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgICAwMDAgICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIFxuICAgICMgICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICAgMDAwIDAwMCAgIFxuICAgICMgICAgIDAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHZlcnQ6ICh2aSkgLT4gXG4gICAgXG4gICAgICAgIG5ldyBWZWN0IEB2ZXJ0aWNlc1t2aV1cbiAgICAgICAgICAgICAgICBcbiAgICB2ZXJ0Tm9ybWFsOiAodmkpIC0+XG4gICAgICAgICBcbiAgICAgICAgc3VtID0gbmV3IFZlY3RvcjMgMCAwIDBcbiAgICAgICAgZm9yIG5pIGluIEBuZWlnaGJvcnModmkpXG4gICAgICAgICAgICBzdW0uYWRkSW5QbGFjZSBAZWRnZSB2aSwgbmlcbiAgICAgICAgc3VtLm5vcm1hbGl6ZSgpXG4gICAgICAgIHN1bVxuICAgICAgICAgICAgICAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIGNlbnRlcnM6IC0+IFxuICAgICAgICBjZW50ZXJzQXJyYXkgPSBbXVxuICAgICAgICBmb3IgZmFjZSBpbiBAZmFjZXNcbiAgICAgICAgICAgIGZjZW50ZXIgPSBbMCAwIDBdXG4gICAgICAgICAgICBmb3IgdmlkeCBpbiBmYWNlXG4gICAgICAgICAgICAgICAgZmNlbnRlciA9IGFkZCBmY2VudGVyLCBAdmVydGljZXNbdmlkeF1cbiAgICAgICAgICAgIGNlbnRlcnNBcnJheS5wdXNoIG11bHQgMS4wL2ZhY2UubGVuZ3RoLCBmY2VudGVyXG4gICAgICAgIGNlbnRlcnNBcnJheVxuICAgICAgICBcbiAgICBtaW5GYWNlRGlzdDogLT5cbiAgICAgICAgXG4gICAgICAgIG1pbkZhY2VEaXN0ID0gSW5maW5pdHlcbiAgICAgICAgXG4gICAgICAgIGZvciBjZW50ZXIgaW4gQGNlbnRlcnMoKVxuICAgICAgICAgICAgbWluRmFjZURpc3QgPSBtaW4gbWluRmFjZURpc3QsIG1hZyBjZW50ZXJcbiAgICAgICAgICAgIFxuICAgICAgICBtaW5GYWNlRGlzdFxuICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIG5vcm1hbHM6IC0+IFxuICAgICAgICBub3JtYWxzQXJyYXkgPSBbXVxuICAgICAgICBmb3IgZmFjZSBpbiBAZmFjZXNcbiAgICAgICAgICAgIG5vcm1hbHNBcnJheS5wdXNoIG5vcm1hbCBmYWNlLm1hcCAodmlkeCkgPT4gQHZlcnRpY2VzW3ZpZHhdXG4gICAgICAgIG5vcm1hbHNBcnJheVxuICBcbiAgICBkYXRhOiAtPlxuICAgICAgICBuRWRnZXMgPSAoQGZhY2VzLmxlbmd0aCArIEB2ZXJ0aWNlcy5sZW5ndGgpIC0gMjsgIyBFID0gViArIEYgLSAyXG4gICAgICAgIFwiI3tAZmFjZXMubGVuZ3RofSBmYWNlcywgI3tuRWRnZXN9IGVkZ2VzLCAje0B2ZXJ0aWNlcy5sZW5ndGh9IHZlcnRpY2VzXCJcbiAgICAgICAgXG4gICAgY29sb3JpemU6IChtZXRob2Q9J3NpZGVkbmVzcycpIC0+ICMgYXNzaWduIGNvbG9yIGluZGljZXMgdG8gZmFjZXNcbiAgICAgICAgXG4gICAgICAgIEBjb2xvcnMgPSBbXVxuICAgICAgICBjb2xvcm1lbW9yeSA9IHt9XG4gICAgICAgIGNvbG9yYXNzaWduID0gKGhhc2gpIC0+IGNvbG9ybWVtb3J5W2hhc2hdID89IF8uc2l6ZSBjb2xvcm1lbW9yeVxuICAgICAgXG4gICAgICAgIGZvciBmIGluIEBmYWNlc1xuICAgICAgICAgICAgc3dpdGNoIG1ldGhvZFxuICAgICAgICAgICAgICAgIHdoZW4gJ2FyZWEnICMgY29sb3IgYnkgZmFjZSBwbGFuYXIgYXJlYSBhc3N1bWluZyBmbGF0bmVzc1xuICAgICAgICAgICAgICAgICAgICBmYWNlX3ZlcnRzID0gZi5tYXAgKHYpID0+IEB2ZXJ0aWNlc1t2XVxuICAgICAgICAgICAgICAgICAgICBjbHIgPSBjb2xvcmFzc2lnbiBzaWdmaWdzIHBsYW5hcmFyZWEoZmFjZV92ZXJ0cyksIDJcbiAgICAgICAgICAgICAgICB3aGVuICdzaWduYXR1cmUnICMgY29sb3IgYnkgY29uZ3J1ZW5jZSBzaWduYXR1cmVcbiAgICAgICAgICAgICAgICAgICAgZmFjZV92ZXJ0cyA9IGYubWFwICh2KSA9PiBAdmVydGljZXNbdl1cbiAgICAgICAgICAgICAgICAgICAgY2xyID0gY29sb3Jhc3NpZ24gZmFjZVNpZ25hdHVyZSBmYWNlX3ZlcnRzLCAyXG4gICAgICAgICAgICAgICAgZWxzZSAjIGNvbG9yIGJ5IGZhY2Utc2lkZWRuZXNzXG4gICAgICAgICAgICAgICAgICAgIGNsciA9IGYubGVuZ3RoIC0gM1xuICAgICAgICAgICAgQGNvbG9ycy5wdXNoIGNsclxuICAgIFxuICAgICAgICAjIGtsb2cgXCIje18uc2l6ZShjb2xvcm1lbW9yeSkrMX0gY29sb3JzOlwiIEBjb2xvcnNcbiAgICAgICAgQFxuXG5tb2R1bGUuZXhwb3J0cyA9IFBvbHloZWRyb25cbiAgICAiXX0=
//# sourceURL=../../coffee/poly/polyhedron.coffee