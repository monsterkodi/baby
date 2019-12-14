// koffee 1.6.0

/*
 0000000   0000000  00000000  000   000  00000000
000       000       000       0000  000  000     
0000000   000       0000000   000 0 000  0000000 
     000  000       000       000  0000  000     
0000000    0000000  00000000  000   000  00000000
 */
var Color3, GUI, Legend, Mesh, MeshBuilder, Scene, StandardMaterial, Vect, Vector3, VertexBuffer, babylon, generate, klog, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

klog = require('kxk').klog;

ref = require('babylonjs'), Color3 = ref.Color3, Mesh = ref.Mesh, MeshBuilder = ref.MeshBuilder, Scene = ref.Scene, StandardMaterial = ref.StandardMaterial, Vector3 = ref.Vector3, VertexBuffer = ref.VertexBuffer;

babylon = require('babylonjs');

GUI = require('babylonjs-gui');

Vect = require('./vect');

Legend = require('./legend');

generate = require('./poly/generate');

Scene = (function(superClass) {
    extend(Scene, superClass);

    function Scene(engine) {
        Scene.__super__.constructor.apply(this, arguments);
        this.ui = GUI.AdvancedDynamicTexture.CreateFullscreenUI('ui');
        this.legend = new Legend(this.ui);
        this.faceIndexMat = new StandardMaterial('faceIndexMat');
        this.faceIndexMat.diffuseColor = new Color3(.5, .5, 1);
        this.faceIndexMat.alpha = 0.5;
        this.vertIndexMat = new StandardMaterial('vertIndexMat');
        this.vertIndexMat.diffuseColor = new Color3(1, 1, 1);
        this.vertIndexMat.alpha = 0.5;
        this.style = this.ui.createStyle();
        this.style.fontSize = 10;
        this.style.fontFamily = 'fontMono';
        this.style.height = "20px";
    }

    Scene.prototype.showNormals = function(mesh, size, color) {
        var i, j, lines, normals, positions, ref1, system, v1, v2;
        normals = mesh.getVerticesData(VertexBuffer.NormalKind);
        positions = mesh.getVerticesData(VertexBuffer.PositionKind);
        if (color != null) {
            color;
        } else {
            color = new Color3(0.2, 0.2, 0.2);
        }
        if (size != null) {
            size;
        } else {
            size = 0.2;
        }
        lines = [];
        for (i = j = 0, ref1 = normals.length; j < ref1; i = j += 3) {
            v1 = Vector3.FromArray(positions, i);
            v2 = v1.addInPlace(Vector3.FromArray(normals, i).scaleInPlace(size));
            lines.push([v1, v2]);
        }
        system = MeshBuilder.CreateLineSystem('normals', {
            lines: lines
        });
        system.color = color;
        mesh.addChild(system);
        return system;
    };

    Scene.prototype.showDebug = function(mesh, poly) {
        var lines, system;
        if (poly.debug) {
            lines = poly.debug.map(function(dbg) {
                return dbg.map(function(v) {
                    return new Vector3(v[0], v[1], v[2]);
                });
            });
            system = MeshBuilder.CreateLineSystem('faces', {
                lines: lines
            });
            system.scaling = new Vector3(1.03, 1.03, 1.03);
            system.color = new Color3(1, 1, 0);
            system.alpha = 0.5;
            mesh.addChild(system);
            return system;
        }
    };

    Scene.prototype.showFaces = function(mesh, poly, color) {
        var face, j, k, len, lines, ref1, ref2, system, v1, v2, vi;
        if (color != null) {
            color;
        } else {
            color = new Color3(0, 0, 0);
        }
        lines = [];
        ref1 = poly.face;
        for (j = 0, len = ref1.length; j < len; j++) {
            face = ref1[j];
            v1 = new Vect(poly.vertex[face.slice(-1)[0]]);
            for (vi = k = 0, ref2 = face.length; 0 <= ref2 ? k < ref2 : k > ref2; vi = 0 <= ref2 ? ++k : --k) {
                v2 = new Vect(poly.vertex[face[vi]]);
                lines.push([v1, v2]);
                v1 = v2;
            }
        }
        system = MeshBuilder.CreateLineSystem('faces', {
            lines: lines
        });
        system.scaling = new Vector3(1.005, 1.005, 1.005);
        system.color = color;
        mesh.addChild(system);
        return system;
    };

    Scene.prototype.showIndices = function(mesh, poly) {
        var c, ctr, d, fi, j, k, len, len1, normals, ref1, ref2, results, vi, vx;
        ref1 = poly.vertex;
        for (vi = j = 0, len = ref1.length; j < len; vi = ++j) {
            vx = ref1[vi];
            d = Mesh.CreatePolyhedron("" + vi, {
                custom: generate('O').scale(0.1)
            }, this);
            d.material = this.vertIndexMat;
            mesh.addChild(d);
            d.locallyTranslate(poly.vert(vi));
            d.lookAt(poly.vert(vi).plus(new Vect(poly.vertexNormal(vi))));
            this.label(d);
        }
        normals = poly.normals();
        ref2 = poly.centers();
        results = [];
        for (fi = k = 0, len1 = ref2.length; k < len1; fi = ++k) {
            ctr = ref2[fi];
            c = Mesh.CreatePolyhedron("" + fi, {
                custom: generate('C').scale(0.1)
            }, this);
            c.material = this.faceIndexMat;
            mesh.addChild(c);
            c.locallyTranslate(new Vect(ctr));
            c.lookAt(new Vect(ctr).plus(normals[fi]));
            results.push(this.label(c));
        }
        return results;
    };

    Scene.prototype.label = function(mesh, name) {
        var text;
        if (name == null) {
            name = mesh.name;
        }
        text = new GUI.TextBlock();
        text.text = name;
        text.color = "black";
        text.style = this.style;
        this.ui.addControl(text);
        return text.linkWithMesh(mesh);
    };

    return Scene;

})(babylon.Scene);

module.exports = Scene;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NlbmUuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDBIQUFBO0lBQUE7OztBQVFFLE9BQVMsT0FBQSxDQUFRLEtBQVI7O0FBQ1gsTUFBZ0YsT0FBQSxDQUFRLFdBQVIsQ0FBaEYsRUFBRSxtQkFBRixFQUFVLGVBQVYsRUFBZ0IsNkJBQWhCLEVBQTZCLGlCQUE3QixFQUFvQyx1Q0FBcEMsRUFBc0QscUJBQXRELEVBQStEOztBQUUvRCxPQUFBLEdBQVcsT0FBQSxDQUFRLFdBQVI7O0FBQ1gsR0FBQSxHQUFXLE9BQUEsQ0FBUSxlQUFSOztBQUNYLElBQUEsR0FBVyxPQUFBLENBQVEsUUFBUjs7QUFDWCxNQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUjs7QUFFTDs7O0lBRUMsZUFBQyxNQUFEO1FBRUMsd0NBQUEsU0FBQTtRQUNBLElBQUMsQ0FBQSxFQUFELEdBQU0sR0FBRyxDQUFDLHNCQUFzQixDQUFDLGtCQUEzQixDQUE4QyxJQUE5QztRQUVOLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBSSxNQUFKLENBQVcsSUFBQyxDQUFBLEVBQVo7UUFFVixJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFJLGdCQUFKLENBQXFCLGNBQXJCO1FBQ2hCLElBQUMsQ0FBQSxZQUFZLENBQUMsWUFBZCxHQUE2QixJQUFJLE1BQUosQ0FBVyxFQUFYLEVBQWMsRUFBZCxFQUFpQixDQUFqQjtRQUM3QixJQUFDLENBQUEsWUFBWSxDQUFDLEtBQWQsR0FBc0I7UUFFdEIsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBSSxnQkFBSixDQUFxQixjQUFyQjtRQUNoQixJQUFDLENBQUEsWUFBWSxDQUFDLFlBQWQsR0FBNkIsSUFBSSxNQUFKLENBQVcsQ0FBWCxFQUFhLENBQWIsRUFBZSxDQUFmO1FBQzdCLElBQUMsQ0FBQSxZQUFZLENBQUMsS0FBZCxH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RixHQUFhLElBQUMsQ0FBQTtZQUNkLElBQUksQ0FBQyxRQUFMLENBQWMsQ0FBZDtZQUNBLENBQUMsQ0FBQyxnQkFBRixDQUFtQixJQUFJLElBQUosQ0FBUyxHQUFULENBQW5CO1lBQ0EsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFJLElBQUosQ0FBUyxHQUFULENBQWEsQ0FBQyxJQUFkLENBQW1CLE9BQVEsQ0FBQSxFQUFBLENBQTNCLENBQVQ7eUJBQ0EsSUFBQyxDQUFBLEtBQUQsQ0FBTyxDQUFQO0FBTko7O0lBWlM7O29CQTBCYixLQUFBLEdBQU8sU0FBQyxJQUFELEVBQU8sSUFBUDtBQVlILFlBQUE7O1lBWlUsT0FBSyxJQUFJLENBQUM7O1FBWXBCLElBQUEsR0FBTyxJQUFJLEdBQUcsQ0FBQyxTQUFSLENBQUE7UUFDUCxJQUFJLENBQUMsSUFBTCxHQUFZO1FBQ1osSUFBSSxDQUFDLEtBQUwsR0FBYTtRQUNiLElBQUksQ0FBQyxLQUFMLEdBQWEsSUFBQyxDQUFBO1FBQ2QsSUFBQyxDQUFBLEVBQUUsQ0FBQyxVQUFKLENBQWUsSUFBZjtlQUNBLElBQUksQ0FBQyxZQUFMLENBQWtCLElBQWxCO0lBakJHOzs7O0dBdkhTLE9BQU8sQ0FBQzs7QUEwSTVCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwXG4wMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgICAgXG4wMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDAgXG4gICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwXG4jIyNcblxueyBrbG9nIH0gPSByZXF1aXJlICdreGsnXG57IENvbG9yMywgTWVzaCwgTWVzaEJ1aWxkZXIsIFNjZW5lLCBTdGFuZGFyZE1hdGVyaWFsLCBWZWN0b3IzLCBWZXJ0ZXhCdWZmZXIgfSA9IHJlcXVpcmUgJ2JhYnlsb25qcydcblxuYmFieWxvbiAgPSByZXF1aXJlICdiYWJ5bG9uanMnXG5HVUkgICAgICA9IHJlcXVpcmUgJ2JhYnlsb25qcy1ndWknXG5WZWN0ICAgICA9IHJlcXVpcmUgJy4vdmVjdCdcbkxlZ2VuZCAgID0gcmVxdWlyZSAnLi9sZWdlbmQnXG5nZW5lcmF0ZSA9IHJlcXVpcmUgJy4vcG9seS9nZW5lcmF0ZSdcblxuY2xhc3MgU2NlbmUgZXh0ZW5kcyBiYWJ5bG9uLlNjZW5lIFxuXG4gICAgQDogKGVuZ2luZSkgLT4gXG4gICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgIEB1aSA9IEdVSS5BZHZhbmNlZER5bmFtaWNUZXh0dXJlLkNyZWF0ZUZ1bGxzY3JlZW5VSSAndWknXG4gICAgICAgIFxuICAgICAgICBAbGVnZW5kID0gbmV3IExlZ2VuZCBAdWlcbiAgICAgICAgXG4gICAgICAgIEBmYWNlSW5kZXhNYXQgPSBuZXcgU3RhbmRhcmRNYXRlcmlhbCAnZmFjZUluZGV4TWF0J1xuICAgICAgICBAZmFjZUluZGV4TWF0LmRpZmZ1c2VDb2xvciA9IG5ldyBDb2xvcjMgLjUgLjUgMSAgICAgICAgICAgIFxuICAgICAgICBAZmFjZUluZGV4TWF0LmFscGhhID0gMC41XG5cbiAgICAgICAgQHZlcnRJbmRleE1hdCA9IG5ldyBTdGFuZGFyZE1hdGVyaWFsICd2ZXJ0SW5kZXhNYXQnXG4gICAgICAgIEB2ZXJ0SW5kZXhNYXQuZGlmZnVzZUNvbG9yID0gbmV3IENvbG9yMyAxIDEgMVxuICAgICAgICBAdmVydEluZGV4TWF0LmFscGhhID0gMC41XG4gICAgICAgIFxuICAgICAgICBAc3R5bGUgPSBAdWkuY3JlYXRlU3R5bGUoKVxuICAgICAgICBAc3R5bGUuZm9udFNpemUgPSAxMFxuICAgICAgICBAc3R5bGUuZm9udEZhbWlseSA9ICdmb250TW9ubydcbiAgICAgICAgQHN0eWxlLmhlaWdodCA9IFwiMjBweFwiXG5cbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIHNob3dOb3JtYWxzOiAobWVzaCwgc2l6ZSwgY29sb3IpXHItPlxuICAgICAgICBcbiAgICAgICAgbm9ybWFscyAgID0gbWVzaC5nZXRWZXJ0aWNlc0RhdGEgVmVydGV4QnVmZmVyLk5vcm1hbEtpbmRcbiAgICAgICAgcG9zaXRpb25zID0gbWVzaC5nZXRWZXJ0aWNlc0RhdGEgVmVydGV4QnVmZmVyLlBvc2l0aW9uS2luZFxuICAgICAgICBjb2xvciA/PSBuZXcgQ29sb3IzIDAuMiAwLjIgMC4yXG4gICAgICAgIHNpemUgID89IDAuMlxuICAgICAgICBsaW5lcyAgPSBbXVxuICAgICAgICBcbiAgICAgICAgZm9yIGkgaW4gWzAuLi5ub3JtYWxzLmxlbmd0aF0gYnkgM1xuICAgICAgICAgICAgdjEgPSBWZWN0b3IzLkZyb21BcnJheSBwb3NpdGlvbnMsIGlcbiAgICAgICAgICAgIHYyID0gdjEuYWRkSW5QbGFjZSBWZWN0b3IzLkZyb21BcnJheShub3JtYWxzLCBpKS5zY2FsZUluUGxhY2Uoc2l6ZSlcbiAgICAgICAgICAgIGxpbmVzLnB1c2ggW3YxLCB2Ml1cbiAgICAgICAgICAgIFxuICAgICAgICBzeXN0ZW0gPSBNZXNoQnVpbGRlci5DcmVhdGVMaW5lU3lzdGVtICdub3JtYWxzJyBsaW5lczpsaW5lc1xuICAgICAgICBzeXN0ZW0uY29sb3IgPSBjb2xvclxuICAgICAgICBtZXNoLmFkZENoaWxkIHN5c3RlbVxuICAgICAgICBzeXN0ZW1cbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgIFxuICAgIFxuICAgIHNob3dEZWJ1ZzogKG1lc2gsIHBvbHkpXHItPlxuICAgICAgICBcbiAgICAgICAgaWYgcG9seS5kZWJ1Z1xuICAgICAgICAgICAgbGluZXMgPSBwb2x5LmRlYnVnLm1hcCAoZGJnKSAtPiBkYmcubWFwICh2KSAtPiBuZXcgVmVjdG9yMyB2WzBdLCB2WzFdLCB2WzJdXG4gICAgICAgICAgICBzeXN0ZW0gPSBNZXNoQnVpbGRlci5DcmVhdGVMaW5lU3lzdGVtICdmYWNlcycgbGluZXM6bGluZXNcbiAgICAgICAgICAgIHN5c3RlbS5zY2FsaW5nID0gbmV3IFZlY3RvcjMgMS4wMyAxLjAzIDEuMDNcbiAgICAgICAgICAgIHN5c3RlbS5jb2xvciA9IG5ldyBDb2xvcjMgMSAxIDBcbiAgICAgICAgICAgIHN5c3RlbS5hbHBoYSA9IDAuNVxuICAgICAgICAgICAgbWVzaC5hZGRDaGlsZCBzeXN0ZW1cbiAgICAgICAgICAgIHN5c3RlbVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgICAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgc2hvd0ZhY2VzOiAobWVzaCwgcG9seSwgY29sb3IpXHItPlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBjb2xvciA/PSBuZXcgQ29sb3IzIDAgMCAwXG4gICAgICAgIGxpbmVzICA9IFtdXG5cbiAgICAgICAgZm9yIGZhY2UgaW4gcG9seS5mYWNlXG4gICAgICAgICAgICB2MSA9IG5ldyBWZWN0IHBvbHkudmVydGV4W2ZhY2VbLTFdXVxuICAgICAgICAgICAgZm9yIHZpIGluIFswLi4uZmFjZS5sZW5ndGhdXG4gICAgICAgICAgICAgICAgdjIgPSBuZXcgVmVjdCBwb2x5LnZlcnRleFtmYWNlW3ZpXV1cbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoIFt2MSwgdjJdXG4gICAgICAgICAgICAgICAgdjEgPSB2MlxuICAgICAgICAgICAgXG4gICAgICAgIHN5c3RlbSA9IE1lc2hCdWlsZGVyLkNyZWF0ZUxpbmVTeXN0ZW0gJ2ZhY2VzJyBsaW5lczpsaW5lc1xuICAgICAgICBzeXN0ZW0uc2NhbGluZyA9IG5ldyBWZWN0b3IzIDEuMDA1IDEuMDA1IDEuMDA1XG4gICAgICAgIHN5c3RlbS5jb2xvciA9IGNvbG9yXG4gICAgICAgIG1lc2guYWRkQ2hpbGQgc3lzdGVtXG4gICAgICAgIHN5c3RlbVxuICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgICAgICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICAgXG4gICAgXG4gICAgc2hvd0luZGljZXM6IChtZXNoLCBwb2x5KSAtPlxuXG4gICAgICAgIGZvciB2eCx2aSBpbiBwb2x5LnZlcnRleFxuICAgICAgICAgICAgZCA9IE1lc2guQ3JlYXRlUG9seWhlZHJvbiBcIiN7dml9XCIge2N1c3RvbTpnZW5lcmF0ZSgnTycpLnNjYWxlKDAuMSl9LCBAXG4gICAgICAgICAgICBkLm1hdGVyaWFsID0gQHZlcnRJbmRleE1hdFxuICAgICAgICAgICAgbWVzaC5hZGRDaGlsZCBkXG4gICAgICAgICAgICBkLmxvY2FsbHlUcmFuc2xhdGUgcG9seS52ZXJ0IHZpXG4gICAgICAgICAgICBkLmxvb2tBdCBwb2x5LnZlcnQodmkpLnBsdXMgbmV3IFZlY3QgcG9seS52ZXJ0ZXhOb3JtYWwgdmlcbiAgICAgICAgICAgIEBsYWJlbCBkIFxuICAgICAgICAgICAgXG4gICAgICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICAgICAgICAgICAgXG4gICAgICAgIGZvciBjdHIsZmkgaW4gcG9seS5jZW50ZXJzKClcbiAgICAgICAgICAgIGMgPSBNZXNoLkNyZWF0ZVBvbHloZWRyb24gXCIje2ZpfVwiIHtjdXN0b206Z2VuZXJhdGUoJ0MnKS5zY2FsZSgwLjEpfSwgQFxuICAgICAgICAgICAgYy5tYXRlcmlhbCA9IEBmYWNlSW5kZXhNYXRcbiAgICAgICAgICAgIG1lc2guYWRkQ2hpbGQgY1xuICAgICAgICAgICAgYy5sb2NhbGx5VHJhbnNsYXRlIG5ldyBWZWN0IGN0clxuICAgICAgICAgICAgYy5sb29rQXQgbmV3IFZlY3QoY3RyKS5wbHVzIG5vcm1hbHNbZmldXG4gICAgICAgICAgICBAbGFiZWwgYyBcbiAgICAgICAgXG4gICAgIyAwMDAgICAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICBsYWJlbDogKG1lc2gsIG5hbWU9bWVzaC5uYW1lKSAtPlxuICAgICAgICBcbiAgICAgICAgIyBsYWJlbCA9IG5ldyBHVUkuUmVjdGFuZ2xlIFwibGFiZWxfI3ttZXNoLm5hbWV9XCJcclxuICAgICAgICAjIGxhYmVsLmJhY2tncm91bmQgPSBcIndoaXRlXCJcclxuICAgICAgICAjIGxhYmVsLmhlaWdodCA9IFwiMjBweFwiXG4gICAgICAgICMgbGFiZWwuYWxwaGEgPSAxXG4gICAgICAgICMgbGFiZWwud2lkdGggPSBcIiN7bmFtZS5sZW5ndGgqOH1weFwiXG4gICAgICAgICMgbGFiZWwuY29ybmVyUmFkaXVzID0gMTBcbiAgICAgICAgIyBsYWJlbC50aGlja25lc3MgPSAwXG4gICAgICAgICMgQHVpLmFkZENvbnRyb2wgbGFiZWxcbiAgICAgICAgIyBsYWJlbC5saW5rV2l0aE1lc2ggbWVzaFxuXHJcbiAgICAgICAgdGV4dCA9IG5ldyBHVUkuVGV4dEJsb2NrKClcbiAgICAgICAgdGV4dC50ZXh0ID0gbmFtZVxuICAgICAgICB0ZXh0LmNvbG9yID0gXCJibGFja1wiXHJcbiAgICAgICAgdGV4dC5zdHlsZSA9IEBzdHlsZVxuICAgICAgICBAdWkuYWRkQ29udHJvbCB0ZXh0XG4gICAgICAgIHRleHQubGlua1dpdGhNZXNoIG1lc2hcclxuXG5tb2R1bGUuZXhwb3J0cyA9IFNjZW5lXG4iXX0=
//# sourceURL=../coffee/scene.coffee