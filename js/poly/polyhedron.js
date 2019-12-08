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

    Polyhedron.prototype.wings = function() {
        var edge, edges, epool, fi, i, j, oi, other, ref1, ref2, wings;
        epool = [];
        for (fi = i = 0, ref1 = this.faces.length; 0 <= ref1 ? i < ref1 : i > ref1; fi = 0 <= ref1 ? ++i : --i) {
            edges = this.faceToEdges(this.faces[fi]);
            edges.forEach(function(e) {
                return e.push({
                    fr: fi
                });
            });
            epool = epool.concat(edges);
        }
        wings = [];
        while (epool.length) {
            edge = epool.shift();
            for (oi = j = 0, ref2 = epool.length; 0 <= ref2 ? j < ref2 : j > ref2; oi = 0 <= ref2 ? ++j : --j) {
                other = epool[oi];
                if (other[0] === edge[1] && other[1] === edge[0]) {
                    edge[2].fl = other[2].fr;
                    epool.splice(oi, 1);
                    break;
                }
            }
            wings.push(edge);
        }
        return wings;
    };

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWhlZHJvbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBV0UsSUFBTSxPQUFBLENBQVEsS0FBUjs7QUFDUixNQUF3QixPQUFBLENBQVEsUUFBUixDQUF4QixFQUFFLGFBQUYsRUFBTyxlQUFQLEVBQWE7O0FBRVA7SUFFQyxvQkFBQyxJQUFELEVBQVEsS0FBUixFQUFnQixRQUFoQjtRQUFDLElBQUMsQ0FBQSxPQUFEO1FBQU8sSUFBQyxDQUFBLFFBQUQ7UUFBUSxJQUFDLENBQUEsV0FBRDs7WUFFZixJQUFDLENBQUE7O1lBQUQsSUFBQyxDQUFBLFFBQVk7OztZQUNiLElBQUMsQ0FBQTs7WUFBRCxJQUFDLENBQUEsV0FBWTs7O1lBQ2IsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxPQUFZOztJQUpkOzt5QkFNSCxLQUFBLEdBQU8sU0FBQTtBQUVILFlBQUE7UUFBQSxLQUFBLEdBQVE7QUFDUixhQUFVLGlHQUFWO1lBQ0ksS0FBQSxHQUFRLElBQUMsQ0FBQSxXQUFELENBQWEsSUFBQyxDQUFBLEtBQU0sQ0FBQSxFQUFBLENBQXBCO1lBQ1IsS0FBSyxDQUFDLE9BQU4sQ0FBYyxTQUFDLENBQUQ7dUJBQU8sQ0FBQyxDQUFDLElBQUYsQ0FBTztvQkFBQSxFQUFBLEVBQUcsRUFBSDtpQkFBUDtZQUFQLENBQWQ7WUFDQSxLQUFBLEdBQVEsS0FBSyxDQUFDLE1BQU4sQ0FBYSxLQUFiO0FBSFo7UUFLQSxLQUFBLEdBQVE7QUFFUixlQUFNLEtBQUssQ0FBQyxNQUFaO1lBQ0ksSUFBQSxHQUFPLEtBQUssQ0FBQyxLQUFOLENBQUE7QUFFUCxpQkFBVSw0RkFBVjtnQkFDSSxLQUFBLEdBQVEsS0FBTSxDQUFBLEVBQUE7Z0JBQ2QsSUFBRyxLQUFNLENBQUEsQ0FBQSxDQUFOLEtBQVksSUFBSyxDQUFBLENBQUEsQ0FBakIsSUFBd0IsS0FBTSxDQUFBLENBQUEsQ0FBTixL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U0FBQSxLQUFBOytCQUFBLFNBQUMsQ0FBRDttQ0FBTyxLQUFDLENBQUEsUUFBUyxDQUFBLENBQUE7d0JBQWpCO29CQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTjtvQkFDYixHQUFBLEdBQU0sV0FBQSxDQUFZLE9BQUEsQ0FBUSxVQUFBLENBQVcsVUFBWCxDQUFSLEVBQWdDLENBQWhDLENBQVo7QUFGTDtBQURULHFCQUlTLFdBSlQ7b0JBS1EsVUFBQSxHQUFhLENBQUMsQ0FBQyxHQUFGLENBQU0sQ0FBQSxTQUFBLEtBQUE7K0JBQUEsU0FBQyxDQUFEO21DQUFPLEtBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQTt3QkFBakI7b0JBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFOO29CQUNiLEdBQUEsR0FBTSxXQUFBLENBQVksYUFBQSxDQUFjLFVBQWQsRUFBMEIsQ0FBMUIsQ0FBWjtBQUZMO0FBSlQ7b0JBUVEsR0FBQSxHQUFNLENBQUMsQ0FBQyxNQUFGLEdBQVc7QUFSekI7WUFTQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxHQUFiO0FBVko7ZUFhQTtJQW5CTTs7Ozs7O0FBcUJkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbjAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMjI1xuI1xuIyBQb2x5aMOpZHJvbmlzbWUsIENvcHlyaWdodCAyMDE5LCBBbnNlbG0gTGV2c2theWEsIE1JVCBMaWNlbnNlXG4jXG5cbnsgXyB9ID0gcmVxdWlyZSAna3hrJ1xueyBhZGQsIG11bHQsIG5vcm1hbCB9ID0gcmVxdWlyZSAnLi9tYXRoJ1xuXG5jbGFzcyBQb2x5aGVkcm9uIFxuXG4gICAgQDogKEBuYW1lLCBAZmFjZXMsIEB2ZXJ0aWNlcykgLT5cblxuICAgICAgICBAZmFjZXMgICAgPz0gW10gIyB2ZXJ0aWNlcyBsaXN0ZWQgY2xvY2t3aXNlIGFzIHNlZW4gZnJvbSBvdXRzaWRlLlxuICAgICAgICBAdmVydGljZXMgPz0gW10gXG4gICAgICAgIEBuYW1lICAgICA/PSBcIm51bGwgcG9seWhlZHJvblwiXG5cbiAgICB3aW5nczogLT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgZXBvb2wgPSBbXVxuICAgICAgICBmb3IgZmkgaW4gWzAuLi5AZmFjZXMubGVuZ3RoXVxuICAgICAgICAgICAgZWRnZXMgPSBAZmFjZVRvRWRnZXMgQGZhY2VzW2ZpXVxuICAgICAgICAgICAgZWRnZXMuZm9yRWFjaCAoZSkgLT4gZS5wdXNoIGZyOmZpXG4gICAgICAgICAgICBlcG9vbCA9IGVwb29sLmNvbmNhdCBlZGdlc1xuICAgICAgICAgICAgXG4gICAgICAgIHdpbmdzID0gW11cbiAgICAgICAgXG4gICAgICAgIHdoaWxlIGVwb29sLmxlbmd0aFxuICAgICAgICAgICAgZWRnZSA9IGVwb29sLnNoaWZ0KClcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIG9pIGluIFswLi4uZXBvb2wubGVuZ3RoXVxuICAgICAgICAgICAgICAgIG90aGVyID0gZXBvb2xbb2ldXG4gICAgICAgICAgICAgICAgaWYgb3RoZXJbMF0gPT0gZWRnZVsxXSBhbmQgb3RoZXJbMV0gPT0gZWRnZVswXVxuICAgICAgICAgICAgICAgICAgICBlZGdlWzJdLmZsID0gb3RoZXJbMl0uZnJcbiAgICAgICAgICAgICAgICAgICAgZXBvb2wuc3BsaWNlIG9pLCAxXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdpbmdzLnB1c2ggZWRnZVxuICAgIFxuICAgICAgICB3aW5nc1xuICAgICAgICBcbiAgICBmYWNlVG9FZGdlczogKGZhY2UpIC0+ICMgYXJyYXkgb2YgZWRnZXMgW3YxLHYyXSBmb3IgZmFjZVxuICAgICAgICBlZGdlcyA9IFtdXG4gICAgICAgIHYxID0gZmFjZVstMV1cbiAgICAgICAgZm9yIHYyIGluIGZhY2VcbiAgICAgICAgICAgIGVkZ2VzLnB1c2ggW3YxLCB2Ml1cbiAgICAgICAgICAgIHYxID0gdjJcbiAgICAgICAgZWRnZXNcbiAgICAgICAgXG4gICAgZWRnZXM6IC0+XG4gICAgICAgIHVuaXFFZGdlcyA9IHt9XG4gICAgICAgIGZhY2VFZGdlcyA9IEBmYWNlcy5tYXAgQGZhY2VUb0VkZ2VzXG4gICAgICAgIGZvciBlZGdlU2V0IGluIGZhY2VFZGdlc1xuICAgICAgICAgICAgZm9yIGUgaW4gZWRnZVNldFxuICAgICAgICAgICAgICAgIGlmIGVbMF08ZVsxXSB0aGVuIFthLCBiXSA9IGVcbiAgICAgICAgICAgICAgICBlbHNlICAgICAgICAgICAgICBbYiwgYV0gPSBlXG4gICAgICAgICAgICAgICAgdW5pcUVkZ2VzW1wiI3thfX4je2J9XCJdID0gZVxuICAgICAgICBfLnZhbHVlcyB1bmlxRWRnZXNcbiAgICAgIFxuICAgIGNlbnRlcnM6IC0+IFxuICAgICAgICBjZW50ZXJzQXJyYXkgPSBbXVxuICAgICAgICBmb3IgZmFjZSBpbiBAZmFjZXNcbiAgICAgICAgICAgIGZjZW50ZXIgPSBbMCAwIDBdXG4gICAgICAgICAgICBmb3IgdmlkeCBpbiBmYWNlXG4gICAgICAgICAgICAgICAgZmNlbnRlciA9IGFkZCBmY2VudGVyLCBAdmVydGljZXNbdmlkeF1cbiAgICAgICAgICAgIGNlbnRlcnNBcnJheS5wdXNoIG11bHQgMS4wL2ZhY2UubGVuZ3RoLCBmY2VudGVyXG4gICAgICAgIGNlbnRlcnNBcnJheVxuICBcbiAgICBub3JtYWxzOiAtPiBcbiAgICAgICAgbm9ybWFsc0FycmF5ID0gW11cbiAgICAgICAgZm9yIGZhY2UgaW4gQGZhY2VzXG4gICAgICAgICAgICBub3JtYWxzQXJyYXkucHVzaCBub3JtYWwgZmFjZS5tYXAgKHZpZHgpID0+IEB2ZXJ0aWNlc1t2aWR4XVxuICAgICAgICBub3JtYWxzQXJyYXlcbiAgXG4gICAgZGF0YTogLT5cbiAgICAgICAgbkVkZ2VzID0gKEBmYWNlcy5sZW5ndGggKyBAdmVydGljZXMubGVuZ3RoKSAtIDI7ICMgRSA9IFYgKyBGIC0gMlxuICAgICAgICBcIiN7QGZhY2VzLmxlbmd0aH0gZmFjZXMsICN7bkVkZ2VzfSBlZGdlcywgI3tAdmVydGljZXMubGVuZ3RofSB2ZXJ0aWNlc1wiXG4gICAgICAgIFxuICAgIGNvbG9yaXplOiAobWV0aG9kPSdzaWRlZG5lc3MnKSAtPiAjIGFzc2lnbiBjb2xvciBpbmRpY2VzIHRvIGZhY2VzXG4gICAgICAgIFxuICAgICAgICBAY29sb3JzID0gW11cbiAgICAgICAgY29sb3JtZW1vcnkgPSB7fVxuICAgICAgICBjb2xvcmFzc2lnbiA9IChoYXNoKSAtPiBjb2xvcm1lbW9yeVtoYXNoXSA/PSBfLnNpemUgY29sb3JtZW1vcnlcbiAgICAgIFxuICAgICAgICBmb3IgZiBpbiBAZmFjZXNcbiAgICAgICAgICAgIHN3aXRjaCBtZXRob2RcbiAgICAgICAgICAgICAgICB3aGVuICdhcmVhJyAjIGNvbG9yIGJ5IGZhY2UgcGxhbmFyIGFyZWEgYXNzdW1pbmcgZmxhdG5lc3NcbiAgICAgICAgICAgICAgICAgICAgZmFjZV92ZXJ0cyA9IGYubWFwICh2KSA9PiBAdmVydGljZXNbdl1cbiAgICAgICAgICAgICAgICAgICAgY2xyID0gY29sb3Jhc3NpZ24gc2lnZmlncyBwbGFuYXJhcmVhKGZhY2VfdmVydHMpLCAyXG4gICAgICAgICAgICAgICAgd2hlbiAnc2lnbmF0dXJlJyAjIGNvbG9yIGJ5IGNvbmdydWVuY2Ugc2lnbmF0dXJlXG4gICAgICAgICAgICAgICAgICAgIGZhY2VfdmVydHMgPSBmLm1hcCAodikgPT4gQHZlcnRpY2VzW3ZdXG4gICAgICAgICAgICAgICAgICAgIGNsciA9IGNvbG9yYXNzaWduIGZhY2VTaWduYXR1cmUgZmFjZV92ZXJ0cywgMlxuICAgICAgICAgICAgICAgIGVsc2UgIyBjb2xvciBieSBmYWNlLXNpZGVkbmVzc1xuICAgICAgICAgICAgICAgICAgICBjbHIgPSBmLmxlbmd0aCAtIDNcbiAgICAgICAgICAgIEBjb2xvcnMucHVzaCBjbHJcbiAgICBcbiAgICAgICAgIyBrbG9nIFwiI3tfLnNpemUoY29sb3JtZW1vcnkpKzF9IGNvbG9yczpcIiBAY29sb3JzXG4gICAgICAgIEBcblxubW9kdWxlLmV4cG9ydHMgPSBQb2x5aGVkcm9uXG4gICAgIl19
//# sourceURL=../../coffee/poly/polyhedron.coffee