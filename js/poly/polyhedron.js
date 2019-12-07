// koffee 1.6.0

/*
00000000    0000000   000      000   000  000   000  00000000  0000000    00000000    0000000   000   000  
000   000  000   000  000       000 000   000   000  000       000   000  000   000  000   000  0000  000  
00000000   000   000  000        00000    000000000  0000000   000   000  0000000    000   000  000 0 000  
000        000   000  000         000     000   000  000       000   000  000   000  000   000  000  0000  
000         0000000   0000000     000     000   000  00000000  0000000    000   000   0000000   000   000
 */
var Polyhedron, _, add, mult, normal, ref;

_ = require('kxk')._;

ref = require('./math'), add = ref.add, mult = ref.mult, normal = ref.normal;

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
            this.name = "null polyhedron";
        }
    }

    Polyhedron.prototype.faceToEdges = function(face) {
        var edges, i, len, v1, v2;
        edges = [];
        v1 = face.slice(-1)[0];
        for (i = 0, len = face.length; i < len; i++) {
            v2 = face[i];
            edges.push([v1, v2]);
            v1 = v2;
        }
        return edges;
    };

    Polyhedron.prototype.edges = function() {
        var a, b, e, edgeSet, faceEdges, i, j, len, len1, uniqEdges;
        uniqEdges = {};
        faceEdges = this.faces.map(this.faceToEdges);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWhlZHJvbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBV0UsSUFBTSxPQUFBLENBQVEsS0FBUjs7QUFDUixNQUF3QixPQUFBLENBQVEsUUFBUixDQUF4QixFQUFFLGFBQUYsRUFBTyxlQUFQLEVBQWE7O0FBRVA7SUFFQyxvQkFBQyxJQUFELEVBQVEsS0FBUixFQUFnQixRQUFoQjtRQUFDLElBQUMsQ0FBQSxPQUFEO1FBQU8sSUFBQyxDQUFBLFFBQUQ7UUFBUSxJQUFDLENBQUEsV0FBRDs7WUFFZixJQUFDLENBQUE7O1lBQUQsSUFBQyxDQUFBLFFBQVk7OztZQUNiLElBQUMsQ0FBQTs7WUFBRCxJQUFDLENBQUEsV0FBWTs7O1lBQ2IsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxPQUFZOztJQUpkOzt5QkFNSCxXQUFBLEdBQWEsU0FBQyxJQUFEO0FBQ1QsWUFBQTtRQUFBLEtBQUEsR0FBUTtRQUNQLEtBQU0sSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFDLENBQVo7QUFDUCxhQUFBLHNDQUFBOztZQUNJLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBQyxFQUFELEVBQUssRUFBTCxDQUFYO1lBQ0EsRUFBQSxHQUFLO0FBRlQ7ZUFHQTtJQU5TOzt5QkFRYixLQUFBLEdBQU8sU0FBQTtBQUNILFlBQUE7UUFBQSxTQUFBLEdBQVk7UUFDWixTQUFBLEdBQVksSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsSUFBQyxDQUFBLFdBQVo7QUFDWixhQUFBLDJDQUFBOztBQUNJLGlCQUFBLDJDQUFBOztnQkFDSSxJQUFHLENBQUUsQ0FBQSxDQUFBLENBQUYsR0FBSyxDQUFFLENBQUEsQ0FBQSxDQUFWO29CQUFtQixRQUFELEVBQUksU0FBdEI7aUJBQUEsTUFBQTtvQkFDbUIsUUFBRCxFQUFJLFNBRHRCOztnQkFFQSxTQUFVLENBQUcsQ0FBRCxHQUFHLEdBQUgsR0FBTSxDQUFSLENBQVYsR0FBeUI7QUFIN0I7QUFESjtlQUtBLENBQUMsQ0FBQyxNQUFGLENBQVMsU0FBVDtJQVJHOzt5QkFVUCxPQUFBLEdBQVMsU0FBQTtBQUNMLFlBQUE7UUFBQSxZQUFBLEdBQWU7QUFDZjtBQUFBLGFBQUEsc0NBQUE7O1lBQ0ksT0FBQSxHQUFVLENBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxDQUFMO0FBQ1YsaUJBQUEsd0NBQUE7O2dCQUNJLE9BQUEsR0FBVSxHQUFBLENBQUksT0FBSixFQUFhLElBQUMsQ0FBQSxRQUFTLENBQUEsSUFBQSxDQUF2QjtBQURkO1lBRUEsWUFBWSxDQUFDLElBQWIsQ0FBa0IsSUFBQSxDQUFLLEdBQUEsR0FBSSxJQUFJLENBQUMsTUFBZCxFQUFzQixPQUF0QixDQUFsQjtBQUpKO2VBS0E7SUFQSzs7eUJBU1QsT0FBQSxHQUFTLFNBQUE7QUFDTCxZQUFBO1FBQUEsWUFBQSxHQUFlO0FBQ2Y7QUFBQSxhQUFBLHNDQUFBOztZQUNJLFlBQVksQ0FBQyxJQUFiLENBQWtCLE1BQUEsQ0FBTyxJQUFJLENBQUMsR0FBTCxDQUFTLENBQUEsU0FBQSxLQUFBO3VCQUFBLFNBQUMsSUFBRDsyQkFBVSxLQUFDLENBQUEsUUFBUyxDQUFBLElBQUE7Z0JBQXBCO1lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFULENBQVAsQ0FBbEI7QUFESjtlQUVBO0lBSks7O3lCQU1ULElBQUEsR0FBTSxTQUFBO0FBQ0YsWUFBQTtRQUFBLE1BQUEsR0FBUyxDQUFDLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxHQUFnQixJQUFDLENBQUEsUUFBUSxDQUFDLE1BQTNCLENBQUEsR0FBcUM7ZUFDM0MsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFSLEdBQWUsVUFBZixHQUF5QixNQUF6QixHQUFnQyxVQUFoQyxHQUEwQyxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQXBELEdBQTJEO0lBRjNEOzt5QkFJTixRQUFBLEdBQVUsU0FBQyxNQUFEO0FBRU4sWUFBQTs7WUFGTyxTQUFPOztRQUVkLElBQUMsQ0FBQSxNQUFELEdBQVU7UUFDVixXQUFBLEdBQWM7UUFDZCxXQUFBLEdBQWMsU0FBQyxJQUFEOytDQUFVLFdBQVksQ0FBQSxJQUFBLElBQVosV0FBWSxDQUFBLElBQUEsSUFBUyxDQUFDLENBQUMsSUFBRixDQUFPLFdBQVA7UUFBL0I7QUFFZDtBQUFBLGFBQUEsc0NBQUE7O0FBQ0ksb0JBQU8sTUFBUDtBQUFBLHFCQUNTLE1BRFQ7b0JBRVEsVUFBQSxHQUFhLENBQUMsQ0FBQyxHQUFGLENBQU0sQ0FBQSxTQUFBLEtBQUE7K0JBQUEsU0FBQyxDQUFEO21DQUFPLEtBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQTt3QkFBakI7b0JBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFOO29CQUNiLEdBQUEsR0FBTSxXQUFBLENBQVksT0FBQSxDQUFRLFVBQUEsQ0FBVyxVQUFYLENBQVIsRUFBZ0MsQ0FBaEMsQ0FBWjtBQUZMO0FBRFQscUJBSVMsV0FKVDtvQkFLUSxVQUFBLEdBQWEsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxDQUFBLFNBQUEsS0FBQTsrQkFBQSxTQUFDLENBQUQ7bUNBQU8sS0FBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBO3dCQUFqQjtvQkFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQU47b0JBQ2IsR0FBQSxHQUFNLFdBQUEsQ0FBWSxhQUFBLENBQWMsVUFBZCxFQUEwQixDQUExQixDQUFaO0FBRkw7QUFKVDtvQkFRUSxHQUFBLEdBQU0sQ0FBQyxDQUFDLE1BQUYsR0FBVztBQVJ6QjtZQVNBLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLEdBQWI7QUFWSjtlQWFBO0lBbkJNOzs7Ozs7QUFxQmQsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuMDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAgMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbjAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4wMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyMjXG4jXG4jIFBvbHlow6lkcm9uaXNtZSwgQ29weXJpZ2h0IDIwMTksIEFuc2VsbSBMZXZza2F5YSwgTUlUIExpY2Vuc2VcbiNcblxueyBfIH0gPSByZXF1aXJlICdreGsnXG57IGFkZCwgbXVsdCwgbm9ybWFsIH0gPSByZXF1aXJlICcuL21hdGgnXG5cbmNsYXNzIFBvbHloZWRyb24gXG5cbiAgICBAOiAoQG5hbWUsIEBmYWNlcywgQHZlcnRpY2VzKSAtPlxuXG4gICAgICAgIEBmYWNlcyAgICA/PSBbXSAjIHZlcnRpY2VzIGxpc3RlZCBjbG9ja3dpc2UgYXMgc2VlbiBmcm9tIG91dHNpZGUuXG4gICAgICAgIEB2ZXJ0aWNlcyA/PSBbXSBcbiAgICAgICAgQG5hbWUgICAgID89IFwibnVsbCBwb2x5aGVkcm9uXCJcbiAgXG4gICAgZmFjZVRvRWRnZXM6IChmYWNlKSAtPiAjIGFycmF5IG9mIGVkZ2VzIFt2MSx2Ml0gZm9yIGZhY2VcbiAgICAgICAgZWRnZXMgPSBbXVxuICAgICAgICBbdjFdID0gZmFjZS5zbGljZSAtMVxuICAgICAgICBmb3IgdjIgaW4gZmFjZVxuICAgICAgICAgICAgZWRnZXMucHVzaCBbdjEsIHYyXVxuICAgICAgICAgICAgdjEgPSB2MlxuICAgICAgICBlZGdlc1xuICAgICAgICBcbiAgICBlZGdlczogLT5cbiAgICAgICAgdW5pcUVkZ2VzID0ge31cbiAgICAgICAgZmFjZUVkZ2VzID0gQGZhY2VzLm1hcCBAZmFjZVRvRWRnZXNcbiAgICAgICAgZm9yIGVkZ2VTZXQgaW4gZmFjZUVkZ2VzXG4gICAgICAgICAgICBmb3IgZSBpbiBlZGdlU2V0XG4gICAgICAgICAgICAgICAgaWYgZVswXTxlWzFdIHRoZW4gW2EsIGJdID0gZVxuICAgICAgICAgICAgICAgIGVsc2UgICAgICAgICAgICAgIFtiLCBhXSA9IGVcbiAgICAgICAgICAgICAgICB1bmlxRWRnZXNbXCIje2F9fiN7Yn1cIl0gPSBlXG4gICAgICAgIF8udmFsdWVzIHVuaXFFZGdlc1xuICAgICAgXG4gICAgY2VudGVyczogLT4gXG4gICAgICAgIGNlbnRlcnNBcnJheSA9IFtdXG4gICAgICAgIGZvciBmYWNlIGluIEBmYWNlc1xuICAgICAgICAgICAgZmNlbnRlciA9IFswIDAgMF1cbiAgICAgICAgICAgIGZvciB2aWR4IGluIGZhY2VcbiAgICAgICAgICAgICAgICBmY2VudGVyID0gYWRkIGZjZW50ZXIsIEB2ZXJ0aWNlc1t2aWR4XVxuICAgICAgICAgICAgY2VudGVyc0FycmF5LnB1c2ggbXVsdCAxLjAvZmFjZS5sZW5ndGgsIGZjZW50ZXJcbiAgICAgICAgY2VudGVyc0FycmF5XG4gIFxuICAgIG5vcm1hbHM6IC0+IFxuICAgICAgICBub3JtYWxzQXJyYXkgPSBbXVxuICAgICAgICBmb3IgZmFjZSBpbiBAZmFjZXNcbiAgICAgICAgICAgIG5vcm1hbHNBcnJheS5wdXNoIG5vcm1hbCBmYWNlLm1hcCAodmlkeCkgPT4gQHZlcnRpY2VzW3ZpZHhdXG4gICAgICAgIG5vcm1hbHNBcnJheVxuICBcbiAgICBkYXRhOiAtPlxuICAgICAgICBuRWRnZXMgPSAoQGZhY2VzLmxlbmd0aCArIEB2ZXJ0aWNlcy5sZW5ndGgpIC0gMjsgIyBFID0gViArIEYgLSAyXG4gICAgICAgIFwiI3tAZmFjZXMubGVuZ3RofSBmYWNlcywgI3tuRWRnZXN9IGVkZ2VzLCAje0B2ZXJ0aWNlcy5sZW5ndGh9IHZlcnRpY2VzXCJcbiAgICAgICAgXG4gICAgY29sb3JpemU6IChtZXRob2Q9J3NpZGVkbmVzcycpIC0+ICMgYXNzaWduIGNvbG9yIGluZGljZXMgdG8gZmFjZXNcbiAgICAgICAgXG4gICAgICAgIEBjb2xvcnMgPSBbXVxuICAgICAgICBjb2xvcm1lbW9yeSA9IHt9XG4gICAgICAgIGNvbG9yYXNzaWduID0gKGhhc2gpIC0+IGNvbG9ybWVtb3J5W2hhc2hdID89IF8uc2l6ZSBjb2xvcm1lbW9yeVxuICAgICAgXG4gICAgICAgIGZvciBmIGluIEBmYWNlc1xuICAgICAgICAgICAgc3dpdGNoIG1ldGhvZFxuICAgICAgICAgICAgICAgIHdoZW4gJ2FyZWEnICMgY29sb3IgYnkgZmFjZSBwbGFuYXIgYXJlYSBhc3N1bWluZyBmbGF0bmVzc1xuICAgICAgICAgICAgICAgICAgICBmYWNlX3ZlcnRzID0gZi5tYXAgKHYpID0+IEB2ZXJ0aWNlc1t2XVxuICAgICAgICAgICAgICAgICAgICBjbHIgPSBjb2xvcmFzc2lnbiBzaWdmaWdzIHBsYW5hcmFyZWEoZmFjZV92ZXJ0cyksIDJcbiAgICAgICAgICAgICAgICB3aGVuICdzaWduYXR1cmUnICMgY29sb3IgYnkgY29uZ3J1ZW5jZSBzaWduYXR1cmVcbiAgICAgICAgICAgICAgICAgICAgZmFjZV92ZXJ0cyA9IGYubWFwICh2KSA9PiBAdmVydGljZXNbdl1cbiAgICAgICAgICAgICAgICAgICAgY2xyID0gY29sb3Jhc3NpZ24gZmFjZVNpZ25hdHVyZSBmYWNlX3ZlcnRzLCAyXG4gICAgICAgICAgICAgICAgZWxzZSAjIGNvbG9yIGJ5IGZhY2Utc2lkZWRuZXNzXG4gICAgICAgICAgICAgICAgICAgIGNsciA9IGYubGVuZ3RoIC0gM1xuICAgICAgICAgICAgQGNvbG9ycy5wdXNoIGNsclxuICAgIFxuICAgICAgICAjIGtsb2cgXCIje18uc2l6ZShjb2xvcm1lbW9yeSkrMX0gY29sb3JzOlwiIEBjb2xvcnNcbiAgICAgICAgQFxuXG5tb2R1bGUuZXhwb3J0cyA9IFBvbHloZWRyb25cbiAgICAiXX0=
//# sourceURL=../../coffee/poly/polyhedron.coffee