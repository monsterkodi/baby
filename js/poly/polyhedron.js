// koffee 1.6.0
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWhlZHJvbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQVFBLElBQUE7O0FBQUUsSUFBTSxPQUFBLENBQVEsS0FBUjs7QUFDUixNQUF3QixPQUFBLENBQVEsUUFBUixDQUF4QixFQUFFLGFBQUYsRUFBTyxlQUFQLEVBQWE7O0FBUVA7SUFFQyxvQkFBQyxJQUFELEVBQVEsS0FBUixFQUFnQixRQUFoQjtRQUFDLElBQUMsQ0FBQSxPQUFEO1FBQU8sSUFBQyxDQUFBLFFBQUQ7UUFBUSxJQUFDLENBQUEsV0FBRDs7WUFFZixJQUFDLENBQUE7O1lBQUQsSUFBQyxDQUFBLFFBQVk7OztZQUNiLElBQUMsQ0FBQTs7WUFBRCxJQUFDLENBQUEsV0FBWTs7O1lBQ2IsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxPQUFZOztJQUpkOzt5QkFNSCxXQUFBLEdBQWEsU0FBQyxJQUFEO0FBQ1QsWUFBQTtRQUFBLEtBQUEsR0FBUTtRQUNQLEtBQU0sSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFDLENBQVo7QUFDUCxhQUFBLHNDQUFBOztZQUNJLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBQyxFQUFELEVBQUssRUFBTCxDQUFYO1lBQ0EsRUFBQSxHQUFLO0FBRlQ7ZUFHQTtJQU5TOzt5QkFRYixLQUFBLEdBQU8sU0FBQTtBQUNILFlBQUE7UUFBQSxTQUFBLEdBQVk7UUFDWixTQUFBLEdBQVksSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsSUFBQyxDQUFBLFdBQVo7QUFDWixhQUFBLDJDQUFBOztBQUNJLGlCQUFBLDJDQUFBOztnQkFDSSxJQUFHLENBQUUsQ0FBQSxDQUFBLENBQUYsR0FBSyxDQUFFLENBQUEsQ0FBQSxDQUFWO29CQUFtQixRQUFELEVBQUksU0FBdEI7aUJBQUEsTUFBQTtvQkFDbUIsUUFBRCxFQUFJLFNBRHRCOztnQkFFQSxTQUFVLENBQUcsQ0FBRCxHQUFHLEdBQUgsR0FBTSxDQUFSLENBQVYsR0FBeUI7QUFIN0I7QUFESjtlQUtBLENBQUMsQ0FBQyxNQUFGLENBQVMsU0FBVDtJQVJHOzt5QkFVUCxPQUFBLEdBQVMsU0FBQTtBQUNMLFlBQUE7UUFBQSxZQUFBLEdBQWU7QUFDZjtBQUFBLGFBQUEsc0NBQUE7O1lBQ0ksT0FBQSxHQUFVLENBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxDQUFMO0FBQ1YsaUJBQUEsd0NBQUE7O2dCQUNJLE9BQUEsR0FBVSxHQUFBLENBQUksT0FBSixFQUFhLElBQUMsQ0FBQSxRQUFTLENBQUEsSUFBQSxDQUF2QjtBQURkO1lBRUEsWUFBWSxDQUFDLElBQWIsQ0FBa0IsSUFBQSxDQUFLLEdBQUEsR0FBSSxJQUFJLENBQUMsTUFBZCxFQUFzQixPQUF0QixDQUFsQjtBQUpKO2VBS0E7SUFQSzs7eUJBU1QsT0FBQSxHQUFTLFNBQUE7QUFDTCxZQUFBO1FBQUEsWUFBQSxHQUFlO0FBQ2Y7QUFBQSxhQUFBLHNDQUFBOztZQUNJLFlBQVksQ0FBQyxJQUFiLENBQWtCLE1BQUEsQ0FBTyxJQUFJLENBQUMsR0FBTCxDQUFTLENBQUEsU0FBQSxLQUFBO3VCQUFBLFNBQUMsSUFBRDsyQkFBVSxLQUFDLENBQUEsUUFBUyxDQUFBLElBQUE7Z0JBQXBCO1lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFULENBQVAsQ0FBbEI7QUFESjtlQUVBO0lBSks7O3lCQU1ULElBQUEsR0FBTSxTQUFBO0FBQ0YsWUFBQTtRQUFBLE1BQUEsR0FBUyxDQUFDLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBUCxHQUFnQixJQUFDLENBQUEsUUFBUSxDQUFDLE1BQTNCLENBQUEsR0FBcUM7ZUFDM0MsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFSLEdBQWUsVUFBZixHQUF5QixNQUF6QixHQUFnQyxVQUFoQyxHQUEwQyxJQUFDLENBQUEsUUFBUSxDQUFDLE1BQXBELEdBQTJEO0lBRjNEOzt5QkFJTixRQUFBLEdBQVUsU0FBQyxNQUFEO0FBRU4sWUFBQTs7WUFGTyxTQUFPOztRQUVkLElBQUMsQ0FBQSxNQUFELEdBQVU7UUFDVixXQUFBLEdBQWM7UUFDZCxXQUFBLEdBQWMsU0FBQyxJQUFEOytDQUFVLFdBQVksQ0FBQSxJQUFBLElBQVosV0FBWSxDQUFBLElBQUEsSUFBUyxDQUFDLENBQUMsSUFBRixDQUFPLFdBQVA7UUFBL0I7QUFFZDtBQUFBLGFBQUEsc0NBQUE7O0FBQ0ksb0JBQU8sTUFBUDtBQUFBLHFCQUNTLE1BRFQ7b0JBRVEsVUFBQSxHQUFhLENBQUMsQ0FBQyxHQUFGLENBQU0sQ0FBQSxTQUFBLEtBQUE7K0JBQUEsU0FBQyxDQUFEO21DQUFPLEtBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQTt3QkFBakI7b0JBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFOO29CQUNiLEdBQUEsR0FBTSxXQUFBLENBQVksT0FBQSxDQUFRLFVBQUEsQ0FBVyxVQUFYLENBQVIsRUFBZ0MsQ0FBaEMsQ0FBWjtBQUZMO0FBRFQscUJBSVMsV0FKVDtvQkFLUSxVQUFBLEdBQWEsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxDQUFBLFNBQUEsS0FBQTsrQkFBQSxTQUFDLENBQUQ7bUNBQU8sS0FBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBO3dCQUFqQjtvQkFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQU47b0JBQ2IsR0FBQSxHQUFNLFdBQUEsQ0FBWSxhQUFBLENBQWMsVUFBZCxFQUEwQixDQUExQixDQUFaO0FBRkw7QUFKVDtvQkFRUSxHQUFBLEdBQU0sQ0FBQyxDQUFDLE1BQUYsR0FBVztBQVJ6QjtZQVNBLElBQUMsQ0FBQSxNQUFNLENBQUMsSUFBUixDQUFhLEdBQWI7QUFWSjtlQWFBO0lBbkJNOzs7Ozs7QUFxQmQsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIFBvbHlow6lkcm9uaXNtZVxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIyBBIHRveSBmb3IgY29uc3RydWN0aW5nIGFuZCBtYW5pcHVsYXRpbmcgcG9seWhlZHJhLlxuI1xuIyBDb3B5cmlnaHQgMjAxOSwgQW5zZWxtIExldnNrYXlhXG4jIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZVxuXG57IF8gfSA9IHJlcXVpcmUgJ2t4aydcbnsgYWRkLCBtdWx0LCBub3JtYWwgfSA9IHJlcXVpcmUgJy4vbWF0aCdcblxuIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAwMDAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuIyAwMDAgICAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG5jbGFzcyBQb2x5aGVkcm9uIFxuXG4gICAgQDogKEBuYW1lLCBAZmFjZXMsIEB2ZXJ0aWNlcykgLT5cblxuICAgICAgICBAZmFjZXMgICAgPz0gW10gIyB2ZXJ0aWNlcyBsaXN0ZWQgY2xvY2t3aXNlIGFzIHNlZW4gZnJvbSBvdXRzaWRlLlxuICAgICAgICBAdmVydGljZXMgPz0gW10gXG4gICAgICAgIEBuYW1lICAgICA/PSBcIm51bGwgcG9seWhlZHJvblwiXG4gIFxuICAgIGZhY2VUb0VkZ2VzOiAoZmFjZSkgLT4gIyBhcnJheSBvZiBlZGdlcyBbdjEsdjJdIGZvciBmYWNlXG4gICAgICAgIGVkZ2VzID0gW11cbiAgICAgICAgW3YxXSA9IGZhY2Uuc2xpY2UgLTFcbiAgICAgICAgZm9yIHYyIGluIGZhY2VcbiAgICAgICAgICAgIGVkZ2VzLnB1c2ggW3YxLCB2Ml1cbiAgICAgICAgICAgIHYxID0gdjJcbiAgICAgICAgZWRnZXNcbiAgICAgICAgXG4gICAgZWRnZXM6IC0+XG4gICAgICAgIHVuaXFFZGdlcyA9IHt9XG4gICAgICAgIGZhY2VFZGdlcyA9IEBmYWNlcy5tYXAgQGZhY2VUb0VkZ2VzXG4gICAgICAgIGZvciBlZGdlU2V0IGluIGZhY2VFZGdlc1xuICAgICAgICAgICAgZm9yIGUgaW4gZWRnZVNldFxuICAgICAgICAgICAgICAgIGlmIGVbMF08ZVsxXSB0aGVuIFthLCBiXSA9IGVcbiAgICAgICAgICAgICAgICBlbHNlICAgICAgICAgICAgICBbYiwgYV0gPSBlXG4gICAgICAgICAgICAgICAgdW5pcUVkZ2VzW1wiI3thfX4je2J9XCJdID0gZVxuICAgICAgICBfLnZhbHVlcyB1bmlxRWRnZXNcbiAgICAgIFxuICAgIGNlbnRlcnM6IC0+IFxuICAgICAgICBjZW50ZXJzQXJyYXkgPSBbXVxuICAgICAgICBmb3IgZmFjZSBpbiBAZmFjZXNcbiAgICAgICAgICAgIGZjZW50ZXIgPSBbMCAwIDBdXG4gICAgICAgICAgICBmb3IgdmlkeCBpbiBmYWNlXG4gICAgICAgICAgICAgICAgZmNlbnRlciA9IGFkZCBmY2VudGVyLCBAdmVydGljZXNbdmlkeF1cbiAgICAgICAgICAgIGNlbnRlcnNBcnJheS5wdXNoIG11bHQgMS4wL2ZhY2UubGVuZ3RoLCBmY2VudGVyXG4gICAgICAgIGNlbnRlcnNBcnJheVxuICBcbiAgICBub3JtYWxzOiAtPiBcbiAgICAgICAgbm9ybWFsc0FycmF5ID0gW11cbiAgICAgICAgZm9yIGZhY2UgaW4gQGZhY2VzXG4gICAgICAgICAgICBub3JtYWxzQXJyYXkucHVzaCBub3JtYWwgZmFjZS5tYXAgKHZpZHgpID0+IEB2ZXJ0aWNlc1t2aWR4XVxuICAgICAgICBub3JtYWxzQXJyYXlcbiAgXG4gICAgZGF0YTogLT5cbiAgICAgICAgbkVkZ2VzID0gKEBmYWNlcy5sZW5ndGggKyBAdmVydGljZXMubGVuZ3RoKSAtIDI7ICMgRSA9IFYgKyBGIC0gMlxuICAgICAgICBcIiN7QGZhY2VzLmxlbmd0aH0gZmFjZXMsICN7bkVkZ2VzfSBlZGdlcywgI3tAdmVydGljZXMubGVuZ3RofSB2ZXJ0aWNlc1wiXG4gICAgICAgIFxuICAgIGNvbG9yaXplOiAobWV0aG9kPSdzaWRlZG5lc3MnKSAtPiAjIGFzc2lnbiBjb2xvciBpbmRpY2VzIHRvIGZhY2VzXG4gICAgICAgIFxuICAgICAgICBAY29sb3JzID0gW11cbiAgICAgICAgY29sb3JtZW1vcnkgPSB7fVxuICAgICAgICBjb2xvcmFzc2lnbiA9IChoYXNoKSAtPiBjb2xvcm1lbW9yeVtoYXNoXSA/PSBfLnNpemUgY29sb3JtZW1vcnlcbiAgICAgIFxuICAgICAgICBmb3IgZiBpbiBAZmFjZXNcbiAgICAgICAgICAgIHN3aXRjaCBtZXRob2RcbiAgICAgICAgICAgICAgICB3aGVuICdhcmVhJyAjIGNvbG9yIGJ5IGZhY2UgcGxhbmFyIGFyZWEgYXNzdW1pbmcgZmxhdG5lc3NcbiAgICAgICAgICAgICAgICAgICAgZmFjZV92ZXJ0cyA9IGYubWFwICh2KSA9PiBAdmVydGljZXNbdl1cbiAgICAgICAgICAgICAgICAgICAgY2xyID0gY29sb3Jhc3NpZ24gc2lnZmlncyBwbGFuYXJhcmVhKGZhY2VfdmVydHMpLCAyXG4gICAgICAgICAgICAgICAgd2hlbiAnc2lnbmF0dXJlJyAjIGNvbG9yIGJ5IGNvbmdydWVuY2Ugc2lnbmF0dXJlXG4gICAgICAgICAgICAgICAgICAgIGZhY2VfdmVydHMgPSBmLm1hcCAodikgPT4gQHZlcnRpY2VzW3ZdXG4gICAgICAgICAgICAgICAgICAgIGNsciA9IGNvbG9yYXNzaWduIGZhY2VTaWduYXR1cmUgZmFjZV92ZXJ0cywgMlxuICAgICAgICAgICAgICAgIGVsc2UgIyBjb2xvciBieSBmYWNlLXNpZGVkbmVzc1xuICAgICAgICAgICAgICAgICAgICBjbHIgPSBmLmxlbmd0aCAtIDNcbiAgICAgICAgICAgIEBjb2xvcnMucHVzaCBjbHJcbiAgICBcbiAgICAgICAgIyBrbG9nIFwiI3tfLnNpemUoY29sb3JtZW1vcnkpKzF9IGNvbG9yczpcIiBAY29sb3JzXG4gICAgICAgIEBcblxubW9kdWxlLmV4cG9ydHMgPSBQb2x5aGVkcm9uXG4gICAgIl19
//# sourceURL=../../coffee/poly/polyhedron.coffee