// koffee 1.6.0

/*
0000000    000  00     00  00000000  000   000   0000000  000   0000000   000   000
000   000  000  000   000  000       0000  000  000       000  000   000  0000  000
000   000  000  000000000  0000000   000 0 000  0000000   000  000   000  000 0 000
000   000  000  000 0 000  000       000  0000       000  000  000   000  000  0000
0000000    000  000   000  00000000  000   000  0000000   000   0000000   000   000
 */
var Color3, Dimension, Mesh, StandardMaterial, TransformNode, deg2rad, generate, random, ref, vec,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('babylonjs'), Color3 = ref.Color3, Mesh = ref.Mesh, StandardMaterial = ref.StandardMaterial, TransformNode = ref.TransformNode;

deg2rad = require('kxk').deg2rad;

random = Math.random;

vec = require('./poly/math').vec;

generate = require('./poly/generate');

Dimension = (function(superClass) {
    extend(Dimension, superClass);

    function Dimension(world, scale, pos) {
        var i, inst, j, p, poly, s;
        this.world = world;
        this.scale = scale;
        if (pos == null) {
            pos = vec();
        }
        this.scene = this.world.scene;
        Dimension.__super__.constructor.call(this, 'dimension', this.scene);
        this.position.copyFrom(pos);
        s = this.scale;
        this.scaling = vec(s, s, s);
        if (1) {
            poly = generate('h0.02jgD', true);
            p = Mesh.CreatePolyhedron(poly.name, {
                custom: poly
            }, this.scene);
            p.parent = this;
            p.material = new StandardMaterial;
            p.material.diffuseColor = new Color3(0.5, 0.5, 1);
            for (i = j = 0; j < 1; i = ++j) {
                inst = p.createInstance(poly.name + "_" + i);
                s = 1 - i * 0.2;
                inst.scaling = vec(s, s, s);
                inst.parent = this;
                inst.rotate(vec(0, 1, 0), deg2rad(i * 6));
            }
        }
    }

    Dimension.prototype.del = function() {
        return this.dispose();
    };

    Dimension.prototype.scaleDown = function() {
        var s;
        s = this.scaling.x / 100;
        this.scaling = vec(s, s, s);
        return this.position.scaleInPlace(0.01);
    };

    Dimension.prototype.scaleUp = function(offset) {
        var s;
        this.position.subtractInPlace(offset);
        s = this.scaling.x * 100;
        this.scaling = vec(s, s, s);
        return this.position.scaleInPlace(100);
    };

    return Dimension;

})(TransformNode);

module.exports = Dimension;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGltZW5zaW9uLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw2RkFBQTtJQUFBOzs7QUFRQSxNQUFvRCxPQUFBLENBQVEsV0FBUixDQUFwRCxFQUFFLG1CQUFGLEVBQVUsZUFBVixFQUFnQix1Q0FBaEIsRUFBa0M7O0FBQ2hDLFVBQVksT0FBQSxDQUFRLEtBQVI7O0FBQ1osU0FBVzs7QUFDWCxNQUFRLE9BQUEsQ0FBUSxhQUFSOztBQUNWLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0FBRUw7OztJQUVDLG1CQUFDLEtBQUQsRUFBUyxLQUFULEVBQWlCLEdBQWpCO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxRQUFEO1FBQVEsSUFBQyxDQUFBLFFBQUQ7O1lBQVEsTUFBSSxHQUFBLENBQUE7O1FBRXBCLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQztRQUNoQiwyQ0FBTSxXQUFOLEVBQWtCLElBQUMsQ0FBQSxLQUFuQjtRQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsUUFBVixDQUFtQixHQUFuQjtRQUVBLENBQUEsR0FBSSxJQUFDLENBQUE7UUFDTCxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVY7UUFZWCxJQUFHLENBQUg7WUFDSSxJQUFBLEdBQU8sUUFBQSxDQUFTLFVBQVQsRUFBb0IsSUFBcEI7WUFFUCxDQUFBLEdBQUksSUFBSSxDQUFDLGdCQUFMLENBQXNCLElBQUksQ0FBQyxJQUEzQixFQUFpQztnQkFBQyxNQUFBLEVBQU8sSUFBUjthQUFqQyxFQUFnRCxJQUFDLENBQUEsS0FBakQ7WUFDSixDQUFDLENBQUMsTUFBRixHQUFXO1lBQ1gsQ0FBQyxDQUFDLFFBQUYsR0FBYSxJQUFJO1lBQ2pCLENBQUMsQ0FBQyxRQUFRLENBQUMsWUFBWCxHQUEwQixJQUFJLE1BQUosQ0FBVyxHQUFYLEVBQWUsR0FBZixFQUFtQixDQUFuQjtBQUUxQixpQkFBUyx5QkFBVDtnQkFDSSxJQUFBLEdBQU8sQ0FBQyxDQUFDLGNBQUYsQ0FBb0IsSUFBSSxDQUFDLElBQU4sR0FBVyxHQUFYLEdBQWMsQ0FBakM7Z0JBQ1AsQ0FBQSxHQUFJLENBQUEsR0FBSSxDQUFBLEdBQUU7Z0JBQ1YsSUFBSSxDQUFDLE9BQUwsR0FBZSxHQUFBLENBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWO2dCQUNmLElBQUksQ0FBQyxNQUFMLEdBQWM7Z0JBQ2QsSUFBSSxDQUFDLE1BQUwsQ0FBWSxHQUFBLENBQUksQ0FBSixFQUFNLENBQU4sRUFBUSxDQUFSLENBQVosRUFBd0IsT0FBQSxDQUFRLENBQUEsR0FBRSxDQUFWLENBQXhCO0FBTEosYUFSSjs7SUFwQkQ7O3dCQW9DSCxHQUFBLEdBQUssU0FBQTtlQUVELElBQUMsQ0FBQSxPQUFELENBQUE7SUFGQzs7d0JBSUwsU0FBQSxHQUFXLFNBQUE7QUFFUCxZQUFBO1FBQUEsQ0FBQSxHQUFJLElBQUMsQ0FBQSxPQUFPLENBQUMsQ0FBVCxHQUFXO1FBQ2YsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWO2VBQ1gsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLElBQXZCO0lBSk87O3dCQU1YLE9BQUEsR0FBUyxTQUFDLE1BQUQ7QUFFTCxZQUFBO1FBQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxlQUFWLENBQTBCLE1BQTFCO1FBQ0EsQ0FBQSxHQUFJLElBQUMsQ0FBQSxPQUFPLENBQUMsQ0FBVCxHQUFXO1FBQ2YsSUFBQyxDQUFBLE9BQUQsR0FBVyxHQUFBLENBQUksQ0FBSixFQUFPLENBQVAsRUFBVyxDQUFYO2VBQ1gsSUFBQyxDQUFBLFFBQVEsQ0FBQyxZQUFWLENBQXVCLEdBQXZCO0lBTEs7Ozs7R0FoRFc7O0FBdUR4QixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMCAgICAwMDAgIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcbjAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4wMDAgICAwMDAgIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuMDAwICAgMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMDBcbjAwMDAwMDAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4jIyNcblxueyBDb2xvcjMsIE1lc2gsIFN0YW5kYXJkTWF0ZXJpYWwsIFRyYW5zZm9ybU5vZGUgfSA9IHJlcXVpcmUgJ2JhYnlsb25qcydcbnsgZGVnMnJhZCB9ID0gcmVxdWlyZSAna3hrJ1xueyByYW5kb20gfSA9IE1hdGhcbnsgdmVjIH0gPSByZXF1aXJlICcuL3BvbHkvbWF0aCdcbmdlbmVyYXRlID0gcmVxdWlyZSAnLi9wb2x5L2dlbmVyYXRlJ1xuXG5jbGFzcyBEaW1lbnNpb24gZXh0ZW5kcyBUcmFuc2Zvcm1Ob2RlXG5cbiAgICBAOiAoQHdvcmxkLCBAc2NhbGUsIHBvcz12ZWMoKSkgLT5cbiAgICAgICAgXG4gICAgICAgIEBzY2VuZSA9IEB3b3JsZC5zY2VuZVxuICAgICAgICBzdXBlciAnZGltZW5zaW9uJyBAc2NlbmVcbiAgICAgICAgXG4gICAgICAgIEBwb3NpdGlvbi5jb3B5RnJvbSBwb3NcblxuICAgICAgICBzID0gQHNjYWxlXG4gICAgICAgIEBzY2FsaW5nID0gdmVjIHMsIHMsIHNcbiAgICAgICAgXG4gICAgICAgICMgZm9yIGkgaW4gWzAuLi4xXVxuIyAgICAgICAgIFxuICAgICAgICAgICAgIyBwID0gTWVzaC5DcmVhdGVQb2x5aGVkcm9uIFwiZGltXyN7aX1cIiB7Y3VzdG9tOmdlbmVyYXRlICdoMC4wMUknfSwgQHNjZW5lXG4gICAgICAgICAgICAjIHMgPSAxIC0gaSowLjFcbiAgICAgICAgICAgICMgcC5zY2FsaW5nID0gdmVjIHMsIHMsIHNcbiAgICAgICAgICAgICMgcC5wYXJlbnQgPSBAXG4gICAgICAgICAgICAjIHAubWF0ZXJpYWwgPSBuZXcgU3RhbmRhcmRNYXRlcmlhbFxuICAgICAgICAgICAgIyBwLm1hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IG5ldyBDb2xvcjMgMSAxIDFcbiAgICAgICAgICAgICMgcC5tYXRlcmlhbC5hbHBoYSA9IDAuNVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIDFcbiAgICAgICAgICAgIHBvbHkgPSBnZW5lcmF0ZSAnaDAuMDJqZ0QnIHRydWVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcCA9IE1lc2guQ3JlYXRlUG9seWhlZHJvbiBwb2x5Lm5hbWUsIHtjdXN0b206cG9seX0sIEBzY2VuZVxuICAgICAgICAgICAgcC5wYXJlbnQgPSBAXG4gICAgICAgICAgICBwLm1hdGVyaWFsID0gbmV3IFN0YW5kYXJkTWF0ZXJpYWxcbiAgICAgICAgICAgIHAubWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gbmV3IENvbG9yMyAwLjUgMC41IDFcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yIGkgaW4gWzAuLi4xXVxuICAgICAgICAgICAgICAgIGluc3QgPSBwLmNyZWF0ZUluc3RhbmNlIFwiI3twb2x5Lm5hbWV9XyN7aX1cIiBcbiAgICAgICAgICAgICAgICBzID0gMSAtIGkqMC4yXG4gICAgICAgICAgICAgICAgaW5zdC5zY2FsaW5nID0gdmVjIHMsIHMsIHNcbiAgICAgICAgICAgICAgICBpbnN0LnBhcmVudCA9IEBcbiAgICAgICAgICAgICAgICBpbnN0LnJvdGF0ZSB2ZWMoMCwxLDApLCBkZWcycmFkIGkqNlxuICAgICAgICAgICAgICAgICMgaW5zdC5yb3RhdGUgdmVjKDEsMCwwKSwgZGVnMnJhZCByYW5kb20oKSoxODBcbiAgICAgICAgXG4gICAgZGVsOiAtPlxuICAgICAgICAjIGtsb2cgXCJkaW0gZGVsICN7QG5hbWV9XCJcbiAgICAgICAgQGRpc3Bvc2UoKVxuICAgICAgICBcbiAgICBzY2FsZURvd246IC0+XG4gICAgICAgIFxuICAgICAgICBzID0gQHNjYWxpbmcueC8xMDBcbiAgICAgICAgQHNjYWxpbmcgPSB2ZWMgcywgcywgc1xuICAgICAgICBAcG9zaXRpb24uc2NhbGVJblBsYWNlIDAuMDFcblxuICAgIHNjYWxlVXA6IChvZmZzZXQpIC0+XG4gICAgICAgIFxuICAgICAgICBAcG9zaXRpb24uc3VidHJhY3RJblBsYWNlIG9mZnNldFxuICAgICAgICBzID0gQHNjYWxpbmcueCoxMDBcbiAgICAgICAgQHNjYWxpbmcgPSB2ZWMgcywgcyAsIHNcbiAgICAgICAgQHBvc2l0aW9uLnNjYWxlSW5QbGFjZSAxMDBcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IERpbWVuc2lvblxuIl19
//# sourceURL=../coffee/dimension.coffee