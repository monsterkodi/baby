// koffee 1.7.0

/*
 0000000   0000000  00000000  000   000  00000000
000       000       000       0000  000  000     
0000000   000       0000000   000 0 000  0000000 
     000  000       000       000  0000  000     
0000000    0000000  00000000  000   000  00000000
 */
var Color3, GUI, Legend, Mesh, MeshBuilder, Scene, StandardMaterial, Vect, Vector3, VertexBuffer, babylon, generate, ref, valid, vec,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

valid = require('kxk').valid;

ref = require('babylonjs'), Color3 = ref.Color3, Mesh = ref.Mesh, MeshBuilder = ref.MeshBuilder, Scene = ref.Scene, StandardMaterial = ref.StandardMaterial, Vector3 = ref.Vector3, VertexBuffer = ref.VertexBuffer;

vec = require('./poly/math').vec;

babylon = require('babylonjs');

GUI = require('babylonjs-gui');

Vect = require('./vect');

Legend = require('./legend');

generate = require('./poly/generate');

Scene = (function(superClass) {
    extend(Scene, superClass);

    function Scene(world) {
        this.world = world;
        Scene.__super__.constructor.call(this, this.world.engine);
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
        this.style.height = '20px';
    }

    Scene.prototype.initFog = function(color) {
        if (color != null) {
            color;
        } else {
            color = new Color3(0, 0, 0);
        }
        this.fogColor = color;
        return this.fogMode = Scene.FOGMODE_LINEAR;
    };

    Scene.prototype.render = function() {
        var ref1, ref2;
        this.fogStart = ((ref1 = (ref2 = this.world.space) != null ? ref2.distFactor : void 0) != null ? ref1 : 0.2) * 50000;
        this.fogEnd = 2 * this.fogStart;
        return Scene.__super__.render.apply(this, arguments);
    };

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
        if (valid(poly.debug)) {
            lines = poly.debug.map(function(dbg) {
                return dbg.map(function(v) {
                    return vec(v);
                });
            });
            system = MeshBuilder.CreateLineSystem('faces', {
                lines: lines
            });
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
            v1 = poly.vert(face.slice(-1)[0]);
            for (vi = k = 0, ref2 = face.length; 0 <= ref2 ? k < ref2 : k > ref2; vi = 0 <= ref2 ? ++k : --k) {
                v2 = poly.vert(face[vi]);
                lines.push([v1, v2]);
                v1 = v2;
            }
        }
        system = MeshBuilder.CreateLineSystem('faces', {
            lines: lines,
            useVertexAlpha: false
        });
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
            d.lookAt(poly.vert(vi).plus(vec(poly.vertexNormal(vi))));
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
            c.locallyTranslate(vec(ctr));
            c.lookAt(vec(ctr).plus(normals[fi]));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NlbmUuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLGdJQUFBO0lBQUE7OztBQVFFLFFBQVUsT0FBQSxDQUFRLEtBQVI7O0FBQ1osTUFBZ0YsT0FBQSxDQUFRLFdBQVIsQ0FBaEYsRUFBRSxtQkFBRixFQUFVLGVBQVYsRUFBZ0IsNkJBQWhCLEVBQTZCLGlCQUE3QixFQUFvQyx1Q0FBcEMsRUFBc0QscUJBQXRELEVBQStEOztBQUM3RCxNQUFRLE9BQUEsQ0FBUSxhQUFSOztBQUNWLE9BQUEsR0FBVyxPQUFBLENBQVEsV0FBUjs7QUFDWCxHQUFBLEdBQVcsT0FBQSxDQUFRLGVBQVI7O0FBQ1gsSUFBQSxHQUFXLE9BQUEsQ0FBUSxRQUFSOztBQUNYLE1BQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFDWCxRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztBQUVMOzs7SUFFQyxlQUFDLEtBQUQ7UUFBQyxJQUFDLENBQUEsUUFBRDtRQUVBLHVDQUFNLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBYjtRQUVBLElBQUMsQ0FBQSxFQUFELEdBQU0sR0FBRyxDQUFDLHNCQUFzQixDQUFDLGtCQUEzQixDQUE4QyxJQUE5QztRQUVOLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBSSxNQUFKLENBQVcsSUFBQyxDQUFBLEVBQVo7UUFFVixJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFJLGdCQUFKLENBQXFCLGNBQXJCO1FBQ2hCLElBQUMsQ0FBQSxZQUFZLENBQUMsWUFBZCxHQUE2QixJQUFJLE1BQUosQ0FBVyxFQUFYLEVBQWMsRUFBZCxFQUFpQixDQUFqQjtRQUM3QixJQUFDLENBQUEsWUFBWSxDQUFDLEtBQWQsR0FBc0I7UUFFdEIsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFBSSxnQkFBSixDQUFxQixjQUFyQjtRQUNoQixJQUFDLENBQUEsWUFBWSxDQUFDLFlBQWQsR0FBNkIsSUFBSSxNQUFKLENBQVcsQ0FBWCxFQUFhLENBQWIsRUFBZSxDQUFmO1FBQzdCLElBQUMsQ0FBQSxZQUFZLENBQUMsS0FBZCxHQUFzQjtRQUV0QixJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxFQUFFLENBQUMsV0FBSixDQUFBO1FBQ1QsSUFBQyxDQUFBLEtBQUssQ0FBQyxRQUFQLEdBQWtCO1FBQ2xCLElBQUMsQ0FBQSxLQUFLLENBQUMsVUFBUCxHQUFvQjtRQUNwQixJQUFDLENBQUEsS0FBSyxDQUFDLE1BQVAsR0FBZ0I7SUFuQmpCOztvQkFxQkgsT0FBQSxHQUFTLFNBQUMsS0FBRDs7WUFFTDs7WUFBQSxRQUFTLElBQUksTUFBSixDQUFXLENBQVgsRUFBYSxDQUFiLEVBQWUsQ0FBZjs7UUFDVCxJQUFDLENBQUEsUUFBRCxHQUFZO2VBQ1osSUFBQyxDQUFBLE9BQUQsR0FBWSxLQUFLLENBQUM7SUFKYjs7b0JBTVQsTUFBQSxHQUFRLFNBQUE7QUFFSixZQUFBO1FBQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSx3RkFBNEIsR0FBNUIsQ0FBQSxHQUFtQztRQUMvQyxJQUFDLENBQUEsTUFBRCxHQUFZLENBQUEsR0FBRSxJQUFDLENBQUE7ZUFDZixtQ0FBQSxTQUFBO0lBSkk7O29CQVlSLFdBQUEsR0FBYSxTQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsS0FBYjtBQUVULFlBQUE7UUFBQSxPQUFBLEdBQVksSUFBSSxDQUFDLGVBQUwsQ0FBcUIsWUFBWSxDQUFDLFVBQWxDO1FBQ1osU0FBQSxHQUFZLElBQUksQ0FBQyxlQUFMLENBQXFCLFlBQVksQ0FBQyxZQUFsQzs7WUFDWjs7WUFBQSxRQUFTLElBQUksTUFBSixDQUFXLEdBQVgsRUFBZSxHQUFmLEVBQW1CLEdBQW5COzs7WUFDVDs7WUFBQSxPQUFTOztRQUNULEtBQUEsR0FBUztBQUVULGFBQVMsc0RBQVQ7WUFDSSxFQUFBLEdBQUssT0FBTyxDQUFDLFNBQVIsQ0FBa0IsU0FBbEIsRUFBNkIsQ0FBN0I7WUFDTCxFQUFBLEdBQUssRUFBRSxDQUFDLFVBQUgsQ0FBYyxPQUFPLENBQUMsU0FBUixDQUFrQixPQUFsQixFQUEyQixDQUEzQixDQUE2QixDQUFDLFlBQTlCLENBQTJDLElBQTNDLENBQWQ7WUFDTCxLQUFLLENBQUMsSUFBTixDQUFXLENBQUMsRUFBRCxFQUFLLEVBQUwsQ0FBWDtBQUhKO1FBS0EsTUFBQSxHQUFTLFdBQVcsQ0FBQyxnQkFBWixDQUE2QixTQUE3QixFQUF1QztZQUFBLEtBQUEsRUFBTSxLQUFOO1NBQXZDO1FBQ1QsTUFBTSxDQUFDLEtBQVAsR0FBZTtRQUNmLElBQUksQ0FBQyxRQUFMLENBQWMsTUFBZDtlQUNBO0lBaEJTOztvQkF3QmIsU0FBQSxHQUFXLFNBQUMsSUFBRCxFQUFPLElBQVA7QUFFUCxZQUFBO1FBQUEsSUFBRyxLQUFBLENBQU0sSUFBSSxDQUFDLEtBQVgsQ0FBSDtZQUNJLEtBQUEsR0FBUSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQVgsQ0FBZSxTQUFDLEdBQUQ7dUJBQVMsR0FBRyxDQUFDLEdBQUosQ0FBUSxTQUFDLENBQUQ7MkJBQU8sR0FBQSxDQUFJLENBQUo7Z0JBQVAsQ0FBUjtZQUFULENBQWY7WUFDUixNQUFBLEdBQVMsV0FBVyxDQUFDLGdCQUFaLENBQTZCLE9BQTdCLEVBQXFDO2dCQUFBLEtBQUEsRUFBTSxLQUFOO2FBQXJDO1lBRVQsTUFBTSxDQUFDLEtBQVAsR0FBZSxJQUFJLE1BQUosQ0FBVyxDQUFYLEVBQWEsQ0FBYixFQUFlLENBQWY7WUFDZixNQUFNLENBQUMsS0FBUCxHQUFlO1lBQ2YsSUFBSSxDQUFDLFFBQUwsQ0FBYyxNQUFkO21CQUNBLE9BUEo7O0lBRk87O29CQWlCWCxTQUFBLEdBQVcsU0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLEtBQWI7QUFFUCxZQUFBOztZQUFBOztZQUFBLFFBQVMsSUFBSSxNQUFKLENBQVcsQ0FBWCxFQUFhLENBQWIsRUFBZSxDQUFmOztRQUNULEtBQUEsR0FBUztBQUVUO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxFQUFBLEdBQUssSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFLLFVBQUUsQ0FBQSxDQUFBLENBQWpCO0FBQ0wsaUJBQVUsMkZBQVY7Z0JBQ0ksRUFBQSxHQUFLLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSyxDQUFBLEVBQUEsQ0FBZjtnQkFDTCxLQUFLLENBQUMsSUFBTixDQUFXLENBQUMsRUFBRCxFQUFLLEVBQUwsQ0FBWDtnQkFDQSxFQUFBLEdBQUs7QUFIVDtBQUZKO1FBT0EsTUFBQSxHQUFTLFdBQVcsQ0FBQyxnQkFBWixDQUE2QixPQUE3QixFQUFxQztZQUFBLEtBQUEsRUFBTSxLQUFOO1lBQWEsY0FBQSxFQUFlLEtBQTVCO1NBQXJDO1FBR1QsTUFBTSxDQUFDLEtBQVAsR0FBZTtRQUNmLElBQUksQ0FBQyxRQUFMLENBQWMsTUFBZDtlQUNBO0lBakJPOztvQkF5QlgsV0FBQSxHQUFhLFNBQUMsSUFBRCxFQUFPLElBQVA7QUFFVCxZQUFBO0FBQUE7QUFBQSxhQUFBLGdEQUFBOztZQUNJLENBQUEsR0FBSSxJQUFJLENBQUMsZ0JBQUwsQ0FBc0IsRUFBQSxHQUFHLEVBQXpCLEVBQThCO2dCQUFDLE1BQUEsRUFBTyxRQUFBLENBQVMsR0FBVCxDQUFhLENBQUMsS0FBZCxDQUFvQixHQUFwQixDQUFSO2FBQTlCLEVBQWlFLElBQWpFO1lBQ0osQ0FBQyxDQUFDLFFBQUYsR0FBYSxJQUFDLENBQUE7WUFDZCxJQUFJLENBQUMsUUFBTCxDQUFjLENBQWQ7WUFDQSxDQUFDLENBQUMsZ0JBQUYsQ0FBbUIsSUFBSSxDQUFDLElBQUwsQ0FBVSxFQUFWLENBQW5CO1lBQ0EsQ0FBQyxDQUFDLE1BQUYsQ0FBUyxJQUFJLENBQUMsSUFBTCxDQUFVLEVBQVYsQ0FBYSxDQUFDLElBQWQsQ0FBbUIsR0FBQSxDQUFJLElBQUksQ0FBQyxZQUFMLENBQWtCLEVBQWxCLENBQUosQ0FBbkIsQ0FBVDtZQUNBLElBQUMsQ0FBQSxLQUFELENBQU8sQ0FBUDtBQU5KO1FBUUEsT0FBQSxHQUFVLElBQUksQ0FBQyxPQUFMLENBQUE7QUFFVjtBQUFBO2FBQUEsa0RBQUE7O1lBQ0ksQ0FBQSxHQUFJLElBQUksQ0FBQyxnQkFBTCxDQUFzQixFQUFBLEdBQUcsRUFBekIsRUFBOEI7Z0JBQUMsTUFBQSxFQUFPLFFBQUEsQ0FBUyxHQUFULENBQWEsQ0FBQyxLQUFkLENBQW9CLEdBQXBCLENBQVI7YUFBOUIsRUFBaUUsSUFBakU7WUFDSixDQUFDLENBQUMsUUFBRixHQUFhLElBQUMsQ0FBQTtZQUNkLElBQUksQ0FBQyxRQUFMLENBQWMsQ0FBZDtZQUNBLENBQUMsQ0FBQyxnQkFBRixDQUFtQixHQUFBLENBQUksR0FBSixDQUFuQjtZQUNBLENBQUMsQ0FBQyxNQUFGLENBQVMsR0FBQSxDQUFJLEdBQUosQ0FBUSxDQUFDLElBQVQsQ0FBYyxPQUFRLENBQUEsRUFBQSxDQUF0QixDQUFUO3lCQUNBLElBQUMsQ0FBQSxLQUFELENBQU8sQ0FBUDtBQU5KOztJQVpTOztvQkEwQmIsS0FBQSxHQUFPLFNBQUMsSUFBRCxFQUFPLElBQVA7QUFZSCxZQUFBOztZQVpVLE9BQUssSUFBSSxDQUFDOztRQVlwQixJQUFBLEdBQU8sSUFBSSxHQUFHLENBQUMsU0FBUixDQUFBO1FBQ1AsSUFBSSxDQUFDLElBQUwsR0FBWTtRQUNaLElBQUksQ0FBQyxLQUFMLEdBQWE7UUFDYixJQUFJLENBQUMsS0FBTCxHQUFhLElBQUMsQ0FBQTtRQUNkLElBQUMsQ0FBQSxFQUFFLENBQUMsVUFBSixDQUFlLElBQWY7ZUFDQSxJQUFJLENBQUMsWUFBTCxDQUFrQixJQUFsQjtJQWpCRzs7OztHQXJJUyxPQUFPLENBQUM7O0FBd0o1QixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAgIFxuMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwIFxuICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAgIFxuMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMFxuIyMjXG5cbnsgdmFsaWQgfSA9IHJlcXVpcmUgJ2t4aydcbnsgQ29sb3IzLCBNZXNoLCBNZXNoQnVpbGRlciwgU2NlbmUsIFN0YW5kYXJkTWF0ZXJpYWwsIFZlY3RvcjMsIFZlcnRleEJ1ZmZlciB9ID0gcmVxdWlyZSAnYmFieWxvbmpzJ1xueyB2ZWMgfSA9IHJlcXVpcmUgJy4vcG9seS9tYXRoJ1xuYmFieWxvbiAgPSByZXF1aXJlICdiYWJ5bG9uanMnXG5HVUkgICAgICA9IHJlcXVpcmUgJ2JhYnlsb25qcy1ndWknXG5WZWN0ICAgICA9IHJlcXVpcmUgJy4vdmVjdCdcbkxlZ2VuZCAgID0gcmVxdWlyZSAnLi9sZWdlbmQnXG5nZW5lcmF0ZSA9IHJlcXVpcmUgJy4vcG9seS9nZW5lcmF0ZSdcblxuY2xhc3MgU2NlbmUgZXh0ZW5kcyBiYWJ5bG9uLlNjZW5lIFxuXG4gICAgQDogKEB3b3JsZCkgLT5cbiAgICBcbiAgICAgICAgc3VwZXIgQHdvcmxkLmVuZ2luZVxuICAgICAgICBcbiAgICAgICAgQHVpID0gR1VJLkFkdmFuY2VkRHluYW1pY1RleHR1cmUuQ3JlYXRlRnVsbHNjcmVlblVJICd1aSdcbiAgICAgICAgXG4gICAgICAgIEBsZWdlbmQgPSBuZXcgTGVnZW5kIEB1aVxuICAgICAgICBcbiAgICAgICAgQGZhY2VJbmRleE1hdCA9IG5ldyBTdGFuZGFyZE1hdGVyaWFsICdmYWNlSW5kZXhNYXQnXG4gICAgICAgIEBmYWNlSW5kZXhNYXQuZGlmZnVzZUNvbG9yID0gbmV3IENvbG9yMyAuNSAuNSAxICAgICAgICAgICAgXG4gICAgICAgIEBmYWNlSW5kZXhNYXQuYWxwaGEgPSAwLjVcblxuICAgICAgICBAdmVydEluZGV4TWF0ID0gbmV3IFN0YW5kYXJkTWF0ZXJpYWwgJ3ZlcnRJbmRleE1hdCdcbiAgICAgICAgQHZlcnRJbmRleE1hdC5kaWZmdXNlQ29sb3IgPSBuZXcgQ29sb3IzIDEgMSAxXG4gICAgICAgIEB2ZXJ0SW5kZXhNYXQuYWxwaGEgPSAwLjVcbiAgICAgICAgXG4gICAgICAgIEBzdHlsZSA9IEB1aS5jcmVhdGVTdHlsZSgpXG4gICAgICAgIEBzdHlsZS5mb250U2l6ZSA9IDEwXG4gICAgICAgIEBzdHlsZS5mb250RmFtaWx5ID0gJ2ZvbnRNb25vJ1xuICAgICAgICBAc3R5bGUuaGVpZ2h0ID0gJzIwcHgnXG5cbiAgICBpbml0Rm9nOiAoY29sb3IpIC0+XG5cbiAgICAgICAgY29sb3IgPz0gbmV3IENvbG9yMyAwIDAgMFxuICAgICAgICBAZm9nQ29sb3IgPSBjb2xvclxuICAgICAgICBAZm9nTW9kZSAgPSBTY2VuZS5GT0dNT0RFX0xJTkVBUlxuICAgICAgICBcbiAgICByZW5kZXI6IC0+XG4gICAgICAgICAgICBcbiAgICAgICAgQGZvZ1N0YXJ0ID0gKEB3b3JsZC5zcGFjZT8uZGlzdEZhY3RvciA/IDAuMikgKiA1MDAwMFxuICAgICAgICBAZm9nRW5kICAgPSAyKkBmb2dTdGFydFxuICAgICAgICBzdXBlclxuICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBzaG93Tm9ybWFsczogKG1lc2gsIHNpemUsIGNvbG9yKVxyLT5cbiAgICAgICAgXG4gICAgICAgIG5vcm1hbHMgICA9IG1lc2guZ2V0VmVydGljZXNEYXRhIFZlcnRleEJ1ZmZlci5Ob3JtYWxLaW5kXG4gICAgICAgIHBvc2l0aW9ucyA9IG1lc2guZ2V0VmVydGljZXNEYXRhIFZlcnRleEJ1ZmZlci5Qb3NpdGlvbktpbmRcbiAgICAgICAgY29sb3IgPz0gbmV3IENvbG9yMyAwLjIgMC4yIDAuMlxuICAgICAgICBzaXplICA/PSAwLjJcbiAgICAgICAgbGluZXMgID0gW11cbiAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFswLi4ubm9ybWFscy5sZW5ndGhdIGJ5IDNcbiAgICAgICAgICAgIHYxID0gVmVjdG9yMy5Gcm9tQXJyYXkgcG9zaXRpb25zLCBpXG4gICAgICAgICAgICB2MiA9IHYxLmFkZEluUGxhY2UgVmVjdG9yMy5Gcm9tQXJyYXkobm9ybWFscywgaSkuc2NhbGVJblBsYWNlKHNpemUpXG4gICAgICAgICAgICBsaW5lcy5wdXNoIFt2MSwgdjJdXG4gICAgICAgICAgICBcbiAgICAgICAgc3lzdGVtID0gTWVzaEJ1aWxkZXIuQ3JlYXRlTGluZVN5c3RlbSAnbm9ybWFscycgbGluZXM6bGluZXNcbiAgICAgICAgc3lzdGVtLmNvbG9yID0gY29sb3JcbiAgICAgICAgbWVzaC5hZGRDaGlsZCBzeXN0ZW1cbiAgICAgICAgc3lzdGVtXG4gICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBzaG93RGVidWc6IChtZXNoLCBwb2x5KVxyLT5cbiAgICAgICAgXG4gICAgICAgIGlmIHZhbGlkIHBvbHkuZGVidWdcbiAgICAgICAgICAgIGxpbmVzID0gcG9seS5kZWJ1Zy5tYXAgKGRiZykgLT4gZGJnLm1hcCAodikgLT4gdmVjIHZcbiAgICAgICAgICAgIHN5c3RlbSA9IE1lc2hCdWlsZGVyLkNyZWF0ZUxpbmVTeXN0ZW0gJ2ZhY2VzJyBsaW5lczpsaW5lc1xuICAgICAgICAgICAgIyBzeXN0ZW0uc2NhbGluZyA9IHZlYyAxLjAzIDEuMDMgMS4wM1xuICAgICAgICAgICAgc3lzdGVtLmNvbG9yID0gbmV3IENvbG9yMyAxIDEgMFxuICAgICAgICAgICAgc3lzdGVtLmFscGhhID0gMC41XG4gICAgICAgICAgICBtZXNoLmFkZENoaWxkIHN5c3RlbVxuICAgICAgICAgICAgc3lzdGVtXG4gICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBzaG93RmFjZXM6IChtZXNoLCBwb2x5LCBjb2xvcilcci0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGNvbG9yID89IG5ldyBDb2xvcjMgMCAwIDAgIzAuMDYgMC4wNiAwLjA2XG4gICAgICAgIGxpbmVzICA9IFtdXG5cbiAgICAgICAgZm9yIGZhY2UgaW4gcG9seS5mYWNlXG4gICAgICAgICAgICB2MSA9IHBvbHkudmVydCBmYWNlWy0xXVxuICAgICAgICAgICAgZm9yIHZpIGluIFswLi4uZmFjZS5sZW5ndGhdXG4gICAgICAgICAgICAgICAgdjIgPSBwb2x5LnZlcnQgZmFjZVt2aV1cbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoIFt2MSwgdjJdXG4gICAgICAgICAgICAgICAgdjEgPSB2MlxuICAgICAgICAgICAgXG4gICAgICAgIHN5c3RlbSA9IE1lc2hCdWlsZGVyLkNyZWF0ZUxpbmVTeXN0ZW0gJ2ZhY2VzJyBsaW5lczpsaW5lcywgdXNlVmVydGV4QWxwaGE6ZmFsc2VcbiAgICAgICAgIyBzeXN0ZW0gPSBuZXcgTGluZXNNZXNoICdmYWNlcycgcGFyZW50Om1lc2gsIHVzZVZlcnRleEFscGhhOmZhbHNlXG4gICAgICAgICMgc3lzdGVtLnNjYWxpbmcgPSB2ZWMgMS4wMDUgMS4wMDUgMS4wMDVcbiAgICAgICAgc3lzdGVtLmNvbG9yID0gY29sb3JcbiAgICAgICAgbWVzaC5hZGRDaGlsZCBzeXN0ZW1cbiAgICAgICAgc3lzdGVtXG4gICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgICAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBzaG93SW5kaWNlczogKG1lc2gsIHBvbHkpIC0+XG5cbiAgICAgICAgZm9yIHZ4LHZpIGluIHBvbHkudmVydGV4XG4gICAgICAgICAgICBkID0gTWVzaC5DcmVhdGVQb2x5aGVkcm9uIFwiI3t2aX1cIiB7Y3VzdG9tOmdlbmVyYXRlKCdPJykuc2NhbGUoMC4xKX0sIEBcbiAgICAgICAgICAgIGQubWF0ZXJpYWwgPSBAdmVydEluZGV4TWF0XG4gICAgICAgICAgICBtZXNoLmFkZENoaWxkIGRcbiAgICAgICAgICAgIGQubG9jYWxseVRyYW5zbGF0ZSBwb2x5LnZlcnQgdmlcbiAgICAgICAgICAgIGQubG9va0F0IHBvbHkudmVydCh2aSkucGx1cyB2ZWMgcG9seS52ZXJ0ZXhOb3JtYWwgdmlcbiAgICAgICAgICAgIEBsYWJlbCBkIFxuICAgICAgICAgICAgXG4gICAgICAgIG5vcm1hbHMgPSBwb2x5Lm5vcm1hbHMoKVxuICAgICAgICAgICAgXG4gICAgICAgIGZvciBjdHIsZmkgaW4gcG9seS5jZW50ZXJzKClcbiAgICAgICAgICAgIGMgPSBNZXNoLkNyZWF0ZVBvbHloZWRyb24gXCIje2ZpfVwiIHtjdXN0b206Z2VuZXJhdGUoJ0MnKS5zY2FsZSgwLjEpfSwgQFxuICAgICAgICAgICAgYy5tYXRlcmlhbCA9IEBmYWNlSW5kZXhNYXRcbiAgICAgICAgICAgIG1lc2guYWRkQ2hpbGQgY1xuICAgICAgICAgICAgYy5sb2NhbGx5VHJhbnNsYXRlIHZlYyBjdHJcbiAgICAgICAgICAgIGMubG9va0F0IHZlYyhjdHIpLnBsdXMgbm9ybWFsc1tmaV1cbiAgICAgICAgICAgIEBsYWJlbCBjIFxuICAgICAgICBcbiAgICAjIDAwMCAgICAgICAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIGxhYmVsOiAobWVzaCwgbmFtZT1tZXNoLm5hbWUpIC0+XG4gICAgICAgIFxuICAgICAgICAjIGxhYmVsID0gbmV3IEdVSS5SZWN0YW5nbGUgXCJsYWJlbF8je21lc2gubmFtZX1cIlxyXG4gICAgICAgICMgbGFiZWwuYmFja2dyb3VuZCA9IFwid2hpdGVcIlxyXG4gICAgICAgICMgbGFiZWwuaGVpZ2h0ID0gXCIyMHB4XCJcbiAgICAgICAgIyBsYWJlbC5hbHBoYSA9IDFcbiAgICAgICAgIyBsYWJlbC53aWR0aCA9IFwiI3tuYW1lLmxlbmd0aCo4fXB4XCJcbiAgICAgICAgIyBsYWJlbC5jb3JuZXJSYWRpdXMgPSAxMFxuICAgICAgICAjIGxhYmVsLnRoaWNrbmVzcyA9IDBcbiAgICAgICAgIyBAdWkuYWRkQ29udHJvbCBsYWJlbFxuICAgICAgICAjIGxhYmVsLmxpbmtXaXRoTWVzaCBtZXNoXG5cclxuICAgICAgICB0ZXh0ID0gbmV3IEdVSS5UZXh0QmxvY2soKVxuICAgICAgICB0ZXh0LnRleHQgPSBuYW1lXG4gICAgICAgIHRleHQuY29sb3IgPSBcImJsYWNrXCJcclxuICAgICAgICB0ZXh0LnN0eWxlID0gQHN0eWxlXG4gICAgICAgIEB1aS5hZGRDb250cm9sIHRleHRcbiAgICAgICAgdGV4dC5saW5rV2l0aE1lc2ggbWVzaFxyXG5cbm1vZHVsZS5leHBvcnRzID0gU2NlbmVcbiJdfQ==
//# sourceURL=../coffee/scene.coffee