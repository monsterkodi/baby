// koffee 1.6.0

/*
0000000    000  00     00  00000000  000   000   0000000  000   0000000   000   000
000   000  000  000   000  000       0000  000  000       000  000   000  0000  000
000   000  000  000000000  0000000   000 0 000  0000000   000  000   000  000 0 000
000   000  000  000 0 000  000       000  0000       000  000  000   000  000  0000
0000000    000  000   000  00000000  000   000  0000000   000   0000000   000   000
 */
var Color3, Dimension, Mesh, StandardMaterial, TransformNode, generate, klog, random, ref, vec,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('babylonjs'), Color3 = ref.Color3, Mesh = ref.Mesh, StandardMaterial = ref.StandardMaterial, TransformNode = ref.TransformNode;

klog = require('kxk').klog;

random = Math.random;

vec = require('./poly/math').vec;

generate = require('./poly/generate');

Dimension = (function(superClass) {
    extend(Dimension, superClass);

    function Dimension(world, scale, pos) {
        var i, j, p, s;
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
        for (i = j = 0; j <= 9; i = ++j) {
            p = Mesh.CreatePolyhedron("dim_" + i, {
                custom: generate('h0.01I')
            }, this.scene);
            s = 1 - i * 0.1;
            p.scaling = vec(s, s, s);
            p.parent = this;
            p.material = new StandardMaterial;
            p.material.diffuseColor = new Color3(1, 1, 1);
        }
    }

    Dimension.prototype.del = function() {
        klog("dim del " + this.name);
        return this.dispose();
    };

    Dimension.prototype.scaleDown = function() {
        var s;
        s = this.scaling.x / 100;
        return this.scaling = vec(s, s, s);
    };

    Dimension.prototype.scaleUp = function(offset) {
        var s;
        this.position.subtractInPlace(offset);
        s = this.scaling.x * 100;
        return this.scaling = vec(s, s, s);
    };

    return Dimension;

})(TransformNode);

module.exports = Dimension;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGltZW5zaW9uLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwwRkFBQTtJQUFBOzs7QUFRQSxNQUFvRCxPQUFBLENBQVEsV0FBUixDQUFwRCxFQUFFLG1CQUFGLEVBQVUsZUFBVixFQUFnQix1Q0FBaEIsRUFBa0M7O0FBQ2hDLE9BQVMsT0FBQSxDQUFRLEtBQVI7O0FBQ1QsU0FBVzs7QUFDWCxNQUFRLE9BQUEsQ0FBUSxhQUFSOztBQUNWLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0FBRUw7OztJQUVDLG1CQUFDLEtBQUQsRUFBUyxLQUFULEVBQWlCLEdBQWpCO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxRQUFEO1FBQVEsSUFBQyxDQUFBLFFBQUQ7O1lBQVEsTUFBSSxHQUFBLENBQUE7O1FBRXBCLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQztRQUNoQiwyQ0FBTSxXQUFOLEVBQWtCLElBQUMsQ0FBQSxLQUFuQjtRQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsUUFBVixDQUFtQixHQUFuQjtRQUVBLENBQUEsR0FBSSxJQUFDLENBQUE7UUFDTCxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVY7QUFFWCxhQUFTLDBCQUFUO1lBRUksQ0FBQSxHQUFJLElBQUksQ0FBQyxnQkFBTCxDQUFzQixNQUFBLEdBQU8sQ0FBN0IsRUFBaUM7Z0JBQUMsTUFBQSxFQUFPLFFBQUEsQ0FBUyxRQUFULENBQVI7YUFBakMsRUFBNkQsSUFBQyxDQUFBLEtBQTlEO1lBQ0osQ0FBQSxHQUFJLENBQUEsR0FBSSxDQUFBLEdBQUU7WUFDVixDQUFDLENBQUMsT0FBRixHQUFZLEdBQUEsQ0FBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVY7WUFDWixDQUFDLENBQUMsTUFBRixHQUFXO1lBQ1gsQ0FBQyxDQUFDLFFBQUYsR0FBYSxJQUFJO1lBQ2pCLENBQUMsQ0FBQyxRQUFRLENBQUMsWUFBWCxHQUEwQixJQUFJLE1BQUosQ0FBVyxDQUFYLEVBQWEsQ0FBYixFQUFlLENBQWY7QUFQOUI7SUFWRDs7d0JBb0JILEdBQUEsR0FBSyxTQUFBO1FBQ0QsSUFBQSxDQUFLLFVBQUEsR0FBVyxJQUFDLENBQUEsSUFBakI7ZUFDQSxJQUFDLENBQUEsT0FBRCxDQUFBO0lBRkM7O3dCQUlMLFNBQUEsR0FBVyxTQUFBO0FBRVAsWUFBQTtRQUFBLENBQUEsR0FBSSxJQUFDLENBQUEsT0FBTyxDQUFDLENBQVQsR0FBVztlQUNmLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFJLENBQUosRUFBTyxDQUFQLEVBQVcsQ0FBWDtJQUhKOzt3QkFLWCxPQUFBLEdBQVMsU0FBQyxNQUFEO0FBRUwsWUFBQTtRQUFBLElBQUMsQ0FBQSxRQUFRLENBQUMsZUFBVixDQUEwQixNQUExQjtRQUNBLENBQUEsR0FBSSxJQUFDLENBQUEsT0FBTyxDQUFDLENBQVQsR0FBVztlQUNmLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFJLENBQUosRUFBTyxDQUFQLEVBQVcsQ0FBWDtJQUpOOzs7O0dBL0JXOztBQXFDeEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAgICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbjAwMCAgIDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwXG4wMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgQ29sb3IzLCBNZXNoLCBTdGFuZGFyZE1hdGVyaWFsLCBUcmFuc2Zvcm1Ob2RlIH0gPSByZXF1aXJlICdiYWJ5bG9uanMnXG57IGtsb2cgfSA9IHJlcXVpcmUgJ2t4aydcbnsgcmFuZG9tIH0gPSBNYXRoXG57IHZlYyB9ID0gcmVxdWlyZSAnLi9wb2x5L21hdGgnXG5nZW5lcmF0ZSA9IHJlcXVpcmUgJy4vcG9seS9nZW5lcmF0ZSdcblxuY2xhc3MgRGltZW5zaW9uIGV4dGVuZHMgVHJhbnNmb3JtTm9kZVxuXG4gICAgQDogKEB3b3JsZCwgQHNjYWxlLCBwb3M9dmVjKCkpIC0+XG4gICAgICAgIFxuICAgICAgICBAc2NlbmUgPSBAd29ybGQuc2NlbmVcbiAgICAgICAgc3VwZXIgJ2RpbWVuc2lvbicgQHNjZW5lXG4gICAgICAgIFxuICAgICAgICBAcG9zaXRpb24uY29weUZyb20gcG9zXG5cbiAgICAgICAgcyA9IEBzY2FsZVxuICAgICAgICBAc2NhbGluZyA9IHZlYyBzLCBzLCBzXG4gICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMC4uOV1cbiAgICAgICAgXG4gICAgICAgICAgICBwID0gTWVzaC5DcmVhdGVQb2x5aGVkcm9uIFwiZGltXyN7aX1cIiB7Y3VzdG9tOmdlbmVyYXRlICdoMC4wMUknfSwgQHNjZW5lXG4gICAgICAgICAgICBzID0gMSAtIGkqMC4xXG4gICAgICAgICAgICBwLnNjYWxpbmcgPSB2ZWMgcywgcywgc1xuICAgICAgICAgICAgcC5wYXJlbnQgPSBAXG4gICAgICAgICAgICBwLm1hdGVyaWFsID0gbmV3IFN0YW5kYXJkTWF0ZXJpYWxcbiAgICAgICAgICAgIHAubWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gbmV3IENvbG9yMyAxIDEgMVxuICAgICAgICAgICAgIyBwLm1hdGVyaWFsLmFscGhhID0gMC41XG4gICAgICAgIFxuICAgIGRlbDogLT5cbiAgICAgICAga2xvZyBcImRpbSBkZWwgI3tAbmFtZX1cIlxuICAgICAgICBAZGlzcG9zZSgpXG4gICAgICAgIFxuICAgIHNjYWxlRG93bjogLT5cbiAgICAgICAgXG4gICAgICAgIHMgPSBAc2NhbGluZy54LzEwMFxuICAgICAgICBAc2NhbGluZyA9IHZlYyBzLCBzICwgc1xuXG4gICAgc2NhbGVVcDogKG9mZnNldCkgLT5cbiAgICAgICAgXG4gICAgICAgIEBwb3NpdGlvbi5zdWJ0cmFjdEluUGxhY2Ugb2Zmc2V0XG4gICAgICAgIHMgPSBAc2NhbGluZy54KjEwMFxuICAgICAgICBAc2NhbGluZyA9IHZlYyBzLCBzICwgc1xuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gRGltZW5zaW9uXG4iXX0=
//# sourceURL=../coffee/dimension.coffee