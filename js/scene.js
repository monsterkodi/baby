// koffee 1.6.0

/*
 0000000   0000000  00000000  000   000  00000000
000       000       000       0000  000  000     
0000000   000       0000000   000 0 000  0000000 
     000  000       000       000  0000  000     
0000000    0000000  00000000  000   000  00000000
 */
var Color3, MeshBuilder, Scene, Vect, Vector3, VertexBuffer, babylon, klog, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

klog = require('kxk').klog;

babylon = require('babylonjs');

Vect = require('./vect');

ref = require('babylonjs'), Color3 = ref.Color3, Vector3 = ref.Vector3, VertexBuffer = ref.VertexBuffer, MeshBuilder = ref.MeshBuilder;

Scene = (function(superClass) {
    extend(Scene, superClass);

    function Scene(engine) {
        Scene.__super__.constructor.apply(this, arguments);
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
            v2 = v1.add(Vector3.FromArray(normals, i).scaleInPlace(size));
            lines.push([v1, v2]);
        }
        system = MeshBuilder.CreateLineSystem('normals', {
            lines: lines
        });
        system.color = color;
        mesh.addChild(system);
        return system;
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

    return Scene;

})(babylon.Scene);

module.exports = Scene;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NlbmUuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDJFQUFBO0lBQUE7OztBQVFFLE9BQVMsT0FBQSxDQUFRLEtBQVI7O0FBQ1gsT0FBQSxHQUFVLE9BQUEsQ0FBUSxXQUFSOztBQUVWLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7QUFDUCxNQUFpRCxPQUFBLENBQVEsV0FBUixDQUFqRCxFQUFFLG1CQUFGLEVBQVUscUJBQVYsRUFBbUIsK0JBQW5CLEVBQWlDOztBQUUzQjs7O0lBRUMsZUFBQyxNQUFEO1FBQVksd0NBQUEsU0FBQTtJQUFaOztvQkFFSCxXQUFBLEdBQWEsU0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLEtBQWI7QUFFVCxZQUFBO1FBQUEsT0FBQSxHQUFZLElBQUksQ0FBQyxlQUFMLENBQXFCLFlBQVksQ0FBQyxVQUFsQztRQUNaLFNBQUEsR0FBWSxJQUFJLENBQUMsZUFBTCxDQUFxQixZQUFZLENBQUMsWUFBbEM7O1lBQ1o7O1lBQUEsUUFBUyxJQUFJLE1BQUosQ0FBVyxHQUFYLEVBQWUsR0FBZixFQUFtQixHQUFuQjs7O1lBQ1Q7O1lBQUEsT0FBUzs7UUFDVCxLQUFBLEdBQVM7QUFFVCxhQUFTLHNEQUFUO1lBQ0ksRUFBQSxHQUFLLE9BQU8sQ0FBQyxTQUFSLENBQWtCLFNBQWxCLEVBQTZCLENBQTdCO1lBQ0wsRUFBQSxHQUFLLEVBQUUsQ0FBQyxHQUFILENBQU8sT0FBTyxDQUFDLFNBQVIsQ0FBa0IsT0FBbEIsRUFBMkIsQ0FBM0IsQ0FBNkIsQ0FBQyxZQUE5QixDQUEyQyxJQUEzQyxDQUFQO1lBQ0wsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFDLEVBQUQsRUFBSyxFQUFMLENBQVg7QUFISjtRQUtBLE1BQUEsR0FBUyxXQUFXLENBQUMsZ0JBQVosQ0FBNkIsU0FBN0IsRUFBdUM7WUFBQSxLQUFBLEVBQU0sS0FBTjtTQUF2QztRQUNULE1BQU0sQ0FBQyxLQUFQLEdBQWU7UUFDZixJQUFJLENBQUMsUUFBTCxDQUFjLE1BQWQ7ZUFDQTtJQWhCUzs7b0JBa0JiLFNBQUEsR0FBVyxTQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsS0FBYjtBQUVQLFlBQUE7O1lBQUE7O1lBQUEsUUFBUyxJQUFJLE1BQUosQ0FBVyxDQUFYLEVBQWEsQ0FBYixFQUFlLENBQWY7O1FBQ1QsS0FBQSxHQUFTO0FBRVQ7QUFBQSxhQUFBLHNDQUFBOztZQUNJLEVBQUEsR0FBSyxJQUFJLElBQUosQ0FBUyxJQUFJLENBQUMsTUFBTyxDQUFBLElBQUssVUFBRSxDQUFBLENBQUEsQ0FBUCxDQUFyQjtBQUNMLGlCQUFVLDJGQUFWO2dCQUNJLEVBQUEsR0FBSyxJQUFJLElBQUosQ0FBUyxJQUFJLENBQUMsTUFBTyxDQUFBLElBQUssQ0FBQSxFQUFBLENBQUwsQ0FBckI7Z0JBQ0wsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFDLEVBQUQsRUFBSyxFQUFMLENBQVg7Z0JBQ0EsRUFBQSxHQUFLO0FBSFQ7QUFGSjtRQU9BLE1BQUEsR0FBUyxXQUFXLENBQUMsZ0JBQVosQ0FBNkIsT0FBN0IsRUFBcUM7WUFBQSxLQUFBLEVBQU0sS0FBTjtTQUFyQztRQUNULE1BQU0sQ0FBQyxPQUFQLEdBQWlCLElBQUksT0FBSixDQUFZLEtBQVosRUFBa0IsS0FBbEIsRUFBd0IsS0FBeEI7UUFDakIsTUFBTSxDQUFDLEtBQVAsR0FBZTtRQUNmLElBQUksQ0FBQyxRQUFMLENBQWMsTUFBZDtlQUNBO0lBaEJPOzs7O0dBdEJLLE9BQU8sQ0FBQzs7QUF3QzVCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwXG4wMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgICAgXG4wMDAwMDAwICAgMDAwICAgICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMDAwMDAgXG4gICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgICAgXG4wMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwXG4jIyNcblxueyBrbG9nIH0gPSByZXF1aXJlICdreGsnXG5iYWJ5bG9uID0gcmVxdWlyZSAnYmFieWxvbmpzJ1xuXG5WZWN0ID0gcmVxdWlyZSAnLi92ZWN0J1xueyBDb2xvcjMsIFZlY3RvcjMsIFZlcnRleEJ1ZmZlciwgTWVzaEJ1aWxkZXIgfSA9IHJlcXVpcmUgJ2JhYnlsb25qcydcblxuY2xhc3MgU2NlbmUgZXh0ZW5kcyBiYWJ5bG9uLlNjZW5lIFxuXG4gICAgQDogKGVuZ2luZSkgLT4gc3VwZXJcblxuICAgIHNob3dOb3JtYWxzOiAobWVzaCwgc2l6ZSwgY29sb3IpXHItPlxuICAgICAgICBcbiAgICAgICAgbm9ybWFscyAgID0gbWVzaC5nZXRWZXJ0aWNlc0RhdGEgVmVydGV4QnVmZmVyLk5vcm1hbEtpbmRcbiAgICAgICAgcG9zaXRpb25zID0gbWVzaC5nZXRWZXJ0aWNlc0RhdGEgVmVydGV4QnVmZmVyLlBvc2l0aW9uS2luZFxuICAgICAgICBjb2xvciA/PSBuZXcgQ29sb3IzIDAuMiAwLjIgMC4yXG4gICAgICAgIHNpemUgID89IDAuMlxuICAgICAgICBsaW5lcyAgPSBbXVxuICAgICAgICBcbiAgICAgICAgZm9yIGkgaW4gWzAuLi5ub3JtYWxzLmxlbmd0aF0gYnkgM1xuICAgICAgICAgICAgdjEgPSBWZWN0b3IzLkZyb21BcnJheSBwb3NpdGlvbnMsIGlcbiAgICAgICAgICAgIHYyID0gdjEuYWRkIFZlY3RvcjMuRnJvbUFycmF5KG5vcm1hbHMsIGkpLnNjYWxlSW5QbGFjZShzaXplKVxuICAgICAgICAgICAgbGluZXMucHVzaCBbdjEsIHYyXVxuICAgICAgICAgICAgXG4gICAgICAgIHN5c3RlbSA9IE1lc2hCdWlsZGVyLkNyZWF0ZUxpbmVTeXN0ZW0gJ25vcm1hbHMnIGxpbmVzOmxpbmVzXG4gICAgICAgIHN5c3RlbS5jb2xvciA9IGNvbG9yXG4gICAgICAgIG1lc2guYWRkQ2hpbGQgc3lzdGVtXG4gICAgICAgIHN5c3RlbVxuICAgICAgICBcbiAgICBzaG93RmFjZXM6IChtZXNoLCBwb2x5LCBjb2xvcilcci0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGNvbG9yID89IG5ldyBDb2xvcjMgMCAwIDBcbiAgICAgICAgbGluZXMgID0gW11cblxuICAgICAgICBmb3IgZmFjZSBpbiBwb2x5LmZhY2VcbiAgICAgICAgICAgIHYxID0gbmV3IFZlY3QgcG9seS52ZXJ0ZXhbZmFjZVstMV1dXG4gICAgICAgICAgICBmb3IgdmkgaW4gWzAuLi5mYWNlLmxlbmd0aF1cbiAgICAgICAgICAgICAgICB2MiA9IG5ldyBWZWN0IHBvbHkudmVydGV4W2ZhY2VbdmldXVxuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2ggW3YxLCB2Ml1cbiAgICAgICAgICAgICAgICB2MSA9IHYyXG4gICAgICAgICAgICBcbiAgICAgICAgc3lzdGVtID0gTWVzaEJ1aWxkZXIuQ3JlYXRlTGluZVN5c3RlbSAnZmFjZXMnIGxpbmVzOmxpbmVzXG4gICAgICAgIHN5c3RlbS5zY2FsaW5nID0gbmV3IFZlY3RvcjMgMS4wMDUgMS4wMDUgMS4wMDVcbiAgICAgICAgc3lzdGVtLmNvbG9yID0gY29sb3JcbiAgICAgICAgbWVzaC5hZGRDaGlsZCBzeXN0ZW1cbiAgICAgICAgc3lzdGVtXG5cbm1vZHVsZS5leHBvcnRzID0gU2NlbmVcbiJdfQ==
//# sourceURL=../coffee/scene.coffee