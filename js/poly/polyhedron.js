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
        var edge, edges, epool, fi, i, j, nvert, oi, other, pvert, ref1, ref2, wings;
        nvert = {};
        pvert = {};
        epool = [];
        for (fi = i = 0, ref1 = this.faces.length; 0 <= ref1 ? i < ref1 : i > ref1; fi = 0 <= ref1 ? ++i : --i) {
            edges = this.faceToEdges(this.faces[fi]);
            edges.forEach(function(edge) {
                if (nvert[fi] != null) {
                    nvert[fi];
                } else {
                    nvert[fi] = {};
                }
                if (pvert[fi] != null) {
                    pvert[fi];
                } else {
                    pvert[fi] = {};
                }
                nvert[fi][edge[0]] = edge[1];
                pvert[fi][edge[1]] = edge[0];
                return edge.push({
                    fr: fi
                });
            });
            epool = epool.concat(edges);
        }
        wings = [];
        while (epool.length) {
            edge = epool.shift();
            edge[2].nr = nvert[edge[2].fr][edge[1]];
            edge[2].pr = pvert[edge[2].fr][edge[0]];
            for (oi = j = 0, ref2 = epool.length; 0 <= ref2 ? j < ref2 : j > ref2; oi = 0 <= ref2 ? ++j : --j) {
                other = epool[oi];
                if (other[0] === edge[1] && other[1] === edge[0]) {
                    edge[2].fl = other[2].fr;
                    edge[2].nl = pvert[edge[2].fl][edge[1]];
                    edge[2].pl = nvert[edge[2].fl][edge[0]];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWhlZHJvbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBV0UsSUFBTSxPQUFBLENBQVEsS0FBUjs7QUFDUixNQUF3QixPQUFBLENBQVEsUUFBUixDQUF4QixFQUFFLGFBQUYsRUFBTyxlQUFQLEVBQWE7O0FBRVA7SUFFQyxvQkFBQyxJQUFELEVBQVEsS0FBUixFQUFnQixRQUFoQjtRQUFDLElBQUMsQ0FBQSxPQUFEO1FBQU8sSUFBQyxDQUFBLFFBQUQ7UUFBUSxJQUFDLENBQUEsV0FBRDs7WUFFZixJQUFDLENBQUE7O1lBQUQsSUFBQyxDQUFBLFFBQVk7OztZQUNiLElBQUMsQ0FBQTs7WUFBRCxJQUFDLENBQUEsV0FBWTs7O1lBQ2IsSUFBQyxDQUFBOztZQUFELElBQUMsQ0FBQSxPQUFZOztJQUpkOzt5QkFNSCxLQUFBLEdBQU8sU0FBQTtBQUVILFlBQUE7UUFBQSxLQUFBLEdBQVE7UUFDUixLQUFBLEdBQVE7UUFDUixLQUFBLEdBQVE7QUFDUixhQUFVLGlHQUFWO1lBQ0ksS0FBQSxHQUFRLElBQUMsQ0FBQSxXQUFELENBQWEsSUFBQyxDQUFBLEtBQU0sQ0FBQSxFQUFBLENBQXBCO1lBQ1IsS0FBSyxDQUFDLE9BQU4sQ0FBYyxTQUFDLElBQUQ7O29CQUNWLEtBQU0sQ0FBQSxFQUFBOztvQkFBTixLQUFNLENBQUEsRUFBQSxJQUFPOzs7b0JBQ2IsS0FBTSxDQUFBLEVBQUE7O29CQUFOLEtBQU0sQ0FBQSxFQUFBLElBQU87O2dCQUNiLEtBQU0sQ0FBQSxFQUFBLENBQUksQ0FBQSxJQUFLLENBQUEsQ0FBQSxDQUFMLENBQVYsR0FBcUIsSUFBSyxDQUFBLENBQUE7Z0JBQzFCLEtBQU0sQ0FBQSxFQUFBLENBQUksQ0FBQSxJQUFLLENBQUEsQ0FBQSxDQUFMLENBQVYsR0FBcUIsSUFBSyxDQUFBLENBQUE7dUJBQzFCLElBQUksQ0FBQyxJQUFMLENBQVU7b0JB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QUFGTDtBQURULHFCQUlTLFdBSlQ7b0JBS1EsVUFBQSxHQUFhLENBQUMsQ0FBQyxHQUFGLENBQU0sQ0FBQSxTQUFBLEtBQUE7K0JBQUEsU0FBQyxDQUFEO21DQUFPLEtBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQTt3QkFBakI7b0JBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFOO29CQUNiLEdBQUEsR0FBTSxXQUFBLENBQVksYUFBQSxDQUFjLFVBQWQsRUFBMEIsQ0FBMUIsQ0FBWjtBQUZMO0FBSlQ7b0JBUVEsR0FBQSxHQUFNLENBQUMsQ0FBQyxNQUFGLEdBQVc7QUFSekI7WUFTQSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxHQUFiO0FBVko7ZUFhQTtJQW5CTTs7Ozs7O0FBcUJkLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwICBcbjAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4wMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuMDAwICAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiMjI1xuI1xuIyBQb2x5aMOpZHJvbmlzbWUsIENvcHlyaWdodCAyMDE5LCBBbnNlbG0gTGV2c2theWEsIE1JVCBMaWNlbnNlXG4jXG5cbnsgXyB9ID0gcmVxdWlyZSAna3hrJ1xueyBhZGQsIG11bHQsIG5vcm1hbCB9ID0gcmVxdWlyZSAnLi9tYXRoJ1xuXG5jbGFzcyBQb2x5aGVkcm9uIFxuXG4gICAgQDogKEBuYW1lLCBAZmFjZXMsIEB2ZXJ0aWNlcykgLT5cblxuICAgICAgICBAZmFjZXMgICAgPz0gW10gIyB2ZXJ0aWNlcyBsaXN0ZWQgY2xvY2t3aXNlIGFzIHNlZW4gZnJvbSBvdXRzaWRlLlxuICAgICAgICBAdmVydGljZXMgPz0gW10gXG4gICAgICAgIEBuYW1lICAgICA/PSBcIm51bGwgcG9seWhlZHJvblwiXG5cbiAgICB3aW5nczogLT5cbiAgICAgICAgXG4gICAgICAgIG52ZXJ0ID0ge31cbiAgICAgICAgcHZlcnQgPSB7fVxuICAgICAgICBlcG9vbCA9IFtdXG4gICAgICAgIGZvciBmaSBpbiBbMC4uLkBmYWNlcy5sZW5ndGhdXG4gICAgICAgICAgICBlZGdlcyA9IEBmYWNlVG9FZGdlcyBAZmFjZXNbZmldXG4gICAgICAgICAgICBlZGdlcy5mb3JFYWNoIChlZGdlKSAtPiBcbiAgICAgICAgICAgICAgICBudmVydFtmaV0gPz0ge31cbiAgICAgICAgICAgICAgICBwdmVydFtmaV0gPz0ge31cbiAgICAgICAgICAgICAgICBudmVydFtmaV1bZWRnZVswXV0gPSBlZGdlWzFdXG4gICAgICAgICAgICAgICAgcHZlcnRbZmldW2VkZ2VbMV1dID0gZWRnZVswXVxuICAgICAgICAgICAgICAgIGVkZ2UucHVzaCBmcjpmaVxuICAgICAgICAgICAgZXBvb2wgPSBlcG9vbC5jb25jYXQgZWRnZXNcbiAgICAgICAgICAgIFxuICAgICAgICB3aW5ncyA9IFtdXG4gICAgICAgIFxuICAgICAgICB3aGlsZSBlcG9vbC5sZW5ndGhcbiAgICAgICAgICAgIGVkZ2UgPSBlcG9vbC5zaGlmdCgpXG4gICAgICAgICAgICBlZGdlWzJdLm5yID0gbnZlcnRbZWRnZVsyXS5mcl1bZWRnZVsxXV1cbiAgICAgICAgICAgIGVkZ2VbMl0ucHIgPSBwdmVydFtlZGdlWzJdLmZyXVtlZGdlWzBdXVxuICAgICAgICAgICAgZm9yIG9pIGluIFswLi4uZXBvb2wubGVuZ3RoXVxuICAgICAgICAgICAgICAgIG90aGVyID0gZXBvb2xbb2ldXG4gICAgICAgICAgICAgICAgaWYgb3RoZXJbMF0gPT0gZWRnZVsxXSBhbmQgb3RoZXJbMV0gPT0gZWRnZVswXVxuICAgICAgICAgICAgICAgICAgICBlZGdlWzJdLmZsID0gb3RoZXJbMl0uZnJcbiAgICAgICAgICAgICAgICAgICAgZWRnZVsyXS5ubCA9IHB2ZXJ0W2VkZ2VbMl0uZmxdW2VkZ2VbMV1dXG4gICAgICAgICAgICAgICAgICAgIGVkZ2VbMl0ucGwgPSBudmVydFtlZGdlWzJdLmZsXVtlZGdlWzBdXVxuICAgICAgICAgICAgICAgICAgICBlcG9vbC5zcGxpY2Ugb2ksIDFcbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2luZ3MucHVzaCBlZGdlXG4gICAgXG4gICAgICAgIHdpbmdzXG4gICAgICAgIFxuICAgIGZhY2VUb0VkZ2VzOiAoZmFjZSkgLT4gIyBhcnJheSBvZiBlZGdlcyBbdjEsdjJdIGZvciBmYWNlXG4gICAgICAgIGVkZ2VzID0gW11cbiAgICAgICAgdjEgPSBmYWNlWy0xXVxuICAgICAgICBmb3IgdjIgaW4gZmFjZVxuICAgICAgICAgICAgZWRnZXMucHVzaCBbdjEsIHYyXVxuICAgICAgICAgICAgdjEgPSB2MlxuICAgICAgICBlZGdlc1xuICAgICAgICBcbiAgICBlZGdlczogLT5cbiAgICAgICAgdW5pcUVkZ2VzID0ge31cbiAgICAgICAgZmFjZUVkZ2VzID0gQGZhY2VzLm1hcCBAZmFjZVRvRWRnZXNcbiAgICAgICAgZm9yIGVkZ2VTZXQgaW4gZmFjZUVkZ2VzXG4gICAgICAgICAgICBmb3IgZSBpbiBlZGdlU2V0XG4gICAgICAgICAgICAgICAgaWYgZVswXTxlWzFdIHRoZW4gW2EsIGJdID0gZVxuICAgICAgICAgICAgICAgIGVsc2UgICAgICAgICAgICAgIFtiLCBhXSA9IGVcbiAgICAgICAgICAgICAgICB1bmlxRWRnZXNbXCIje2F9fiN7Yn1cIl0gPSBlXG4gICAgICAgIF8udmFsdWVzIHVuaXFFZGdlc1xuICAgICAgXG4gICAgY2VudGVyczogLT4gXG4gICAgICAgIGNlbnRlcnNBcnJheSA9IFtdXG4gICAgICAgIGZvciBmYWNlIGluIEBmYWNlc1xuICAgICAgICAgICAgZmNlbnRlciA9IFswIDAgMF1cbiAgICAgICAgICAgIGZvciB2aWR4IGluIGZhY2VcbiAgICAgICAgICAgICAgICBmY2VudGVyID0gYWRkIGZjZW50ZXIsIEB2ZXJ0aWNlc1t2aWR4XVxuICAgICAgICAgICAgY2VudGVyc0FycmF5LnB1c2ggbXVsdCAxLjAvZmFjZS5sZW5ndGgsIGZjZW50ZXJcbiAgICAgICAgY2VudGVyc0FycmF5XG4gIFxuICAgIG5vcm1hbHM6IC0+IFxuICAgICAgICBub3JtYWxzQXJyYXkgPSBbXVxuICAgICAgICBmb3IgZmFjZSBpbiBAZmFjZXNcbiAgICAgICAgICAgIG5vcm1hbHNBcnJheS5wdXNoIG5vcm1hbCBmYWNlLm1hcCAodmlkeCkgPT4gQHZlcnRpY2VzW3ZpZHhdXG4gICAgICAgIG5vcm1hbHNBcnJheVxuICBcbiAgICBkYXRhOiAtPlxuICAgICAgICBuRWRnZXMgPSAoQGZhY2VzLmxlbmd0aCArIEB2ZXJ0aWNlcy5sZW5ndGgpIC0gMjsgIyBFID0gViArIEYgLSAyXG4gICAgICAgIFwiI3tAZmFjZXMubGVuZ3RofSBmYWNlcywgI3tuRWRnZXN9IGVkZ2VzLCAje0B2ZXJ0aWNlcy5sZW5ndGh9IHZlcnRpY2VzXCJcbiAgICAgICAgXG4gICAgY29sb3JpemU6IChtZXRob2Q9J3NpZGVkbmVzcycpIC0+ICMgYXNzaWduIGNvbG9yIGluZGljZXMgdG8gZmFjZXNcbiAgICAgICAgXG4gICAgICAgIEBjb2xvcnMgPSBbXVxuICAgICAgICBjb2xvcm1lbW9yeSA9IHt9XG4gICAgICAgIGNvbG9yYXNzaWduID0gKGhhc2gpIC0+IGNvbG9ybWVtb3J5W2hhc2hdID89IF8uc2l6ZSBjb2xvcm1lbW9yeVxuICAgICAgXG4gICAgICAgIGZvciBmIGluIEBmYWNlc1xuICAgICAgICAgICAgc3dpdGNoIG1ldGhvZFxuICAgICAgICAgICAgICAgIHdoZW4gJ2FyZWEnICMgY29sb3IgYnkgZmFjZSBwbGFuYXIgYXJlYSBhc3N1bWluZyBmbGF0bmVzc1xuICAgICAgICAgICAgICAgICAgICBmYWNlX3ZlcnRzID0gZi5tYXAgKHYpID0+IEB2ZXJ0aWNlc1t2XVxuICAgICAgICAgICAgICAgICAgICBjbHIgPSBjb2xvcmFzc2lnbiBzaWdmaWdzIHBsYW5hcmFyZWEoZmFjZV92ZXJ0cyksIDJcbiAgICAgICAgICAgICAgICB3aGVuICdzaWduYXR1cmUnICMgY29sb3IgYnkgY29uZ3J1ZW5jZSBzaWduYXR1cmVcbiAgICAgICAgICAgICAgICAgICAgZmFjZV92ZXJ0cyA9IGYubWFwICh2KSA9PiBAdmVydGljZXNbdl1cbiAgICAgICAgICAgICAgICAgICAgY2xyID0gY29sb3Jhc3NpZ24gZmFjZVNpZ25hdHVyZSBmYWNlX3ZlcnRzLCAyXG4gICAgICAgICAgICAgICAgZWxzZSAjIGNvbG9yIGJ5IGZhY2Utc2lkZWRuZXNzXG4gICAgICAgICAgICAgICAgICAgIGNsciA9IGYubGVuZ3RoIC0gM1xuICAgICAgICAgICAgQGNvbG9ycy5wdXNoIGNsclxuICAgIFxuICAgICAgICAjIGtsb2cgXCIje18uc2l6ZShjb2xvcm1lbW9yeSkrMX0gY29sb3JzOlwiIEBjb2xvcnNcbiAgICAgICAgQFxuXG5tb2R1bGUuZXhwb3J0cyA9IFBvbHloZWRyb25cbiAgICAiXX0=
//# sourceURL=../../coffee/poly/polyhedron.coffee