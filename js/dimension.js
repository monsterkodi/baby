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
            poly = generate('h0.02D', true);
            p = Mesh.CreatePolyhedron(poly.name, {
                custom: poly
            }, this.scene);
            p.parent = this;
            p.material = new StandardMaterial;
            p.material.diffuseColor = new Color3(0.5, 0.5, 1);
            for (i = j = 0; j < 5; i = ++j) {
                inst = p.createInstance(poly.name + "_" + i);
                s = 1 - i * 0.2;
                inst.scaling.copyFromFloats(s, s, s);
                inst.parent = this;
            }
        }
    }

    Dimension.prototype.del = function() {
        return this.dispose();
    };

    return Dimension;

})(TransformNode);

module.exports = Dimension;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGltZW5zaW9uLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw2RkFBQTtJQUFBOzs7QUFRQSxNQUFvRCxPQUFBLENBQVEsV0FBUixDQUFwRCxFQUFFLG1CQUFGLEVBQVUsZUFBVixFQUFnQix1Q0FBaEIsRUFBa0M7O0FBQ2hDLFVBQVksT0FBQSxDQUFRLEtBQVI7O0FBQ1osU0FBVzs7QUFDWCxNQUFRLE9BQUEsQ0FBUSxhQUFSOztBQUNWLFFBQUEsR0FBVyxPQUFBLENBQVEsaUJBQVI7O0FBRUw7OztJQUVDLG1CQUFDLEtBQUQsRUFBUyxLQUFULEVBQWlCLEdBQWpCO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxRQUFEO1FBQVEsSUFBQyxDQUFBLFFBQUQ7O1lBQVEsTUFBSSxHQUFBLENBQUE7O1FBRXBCLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQztRQUNoQiwyQ0FBTSxXQUFOLEVBQWtCLElBQUMsQ0FBQSxLQUFuQjtRQUVBLElBQUMsQ0FBQSxRQUFRLENBQUMsUUFBVixDQUFtQixHQUFuQjtRQUVBLENBQUEsR0FBSSxJQUFDLENBQUE7UUFDTCxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVY7UUFFWCxJQUFHLENBQUg7WUFDSSxJQUFBLEdBQU8sUUFBQSxDQUFTLFFBQVQsRUFBa0IsSUFBbEI7WUFFUCxDQUFBLEdBQUksSUFBSSxDQUFDLGdCQUFMLENBQXNCLElBQUksQ0FBQyxJQUEzQixFQUFpQztnQkFBQyxNQUFBLEVBQU8sSUFBUjthQUFqQyxFQUFnRCxJQUFDLENBQUEsS0FBakQ7WUFDSixDQUFDLENBQUMsTUFBRixHQUFXO1lBQ1gsQ0FBQyxDQUFDLFFBQUYsR0FBYSxJQUFJO1lBQ2pCLENBQUMsQ0FBQyxRQUFRLENBQUMsWUFBWCxHQUEwQixJQUFJLE1BQUosQ0FBVyxHQUFYLEVBQWUsR0FBZixFQUFtQixDQUFuQjtBQUUxQixpQkFBUyx5QkFBVDtnQkFDSSxJQUFBLEdBQU8sQ0FBQyxDQUFDLGNBQUYsQ0FBb0IsSUFBSSxDQUFDLElBQU4sR0FBVyxHQUFYLEdBQWMsQ0FBakM7Z0JBQ1AsQ0FBQSxHQUFJLENBQUEsR0FBSSxDQUFBLEdBQUU7Z0JBQ1YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFiLENBQTRCLENBQTVCLEVBQStCLENBQS9CLEVBQWtDLENBQWxDO2dCQUNBLElBQUksQ0FBQyxNQUFMLEdBQWM7QUFKbEIsYUFSSjs7SUFWRDs7d0JBMEJILEdBQUEsR0FBSyxTQUFBO2VBRUQsSUFBQyxDQUFBLE9BQUQsQ0FBQTtJQUZDOzs7O0dBNUJlOztBQWdDeEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAgICAgMDAwICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMFxuMDAwICAgMDAwICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbjAwMCAgIDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgICAgICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwXG4wMDAwMDAwICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuIyMjXG5cbnsgQ29sb3IzLCBNZXNoLCBTdGFuZGFyZE1hdGVyaWFsLCBUcmFuc2Zvcm1Ob2RlIH0gPSByZXF1aXJlICdiYWJ5bG9uanMnXG57IGRlZzJyYWQgfSA9IHJlcXVpcmUgJ2t4aydcbnsgcmFuZG9tIH0gPSBNYXRoXG57IHZlYyB9ID0gcmVxdWlyZSAnLi9wb2x5L21hdGgnXG5nZW5lcmF0ZSA9IHJlcXVpcmUgJy4vcG9seS9nZW5lcmF0ZSdcblxuY2xhc3MgRGltZW5zaW9uIGV4dGVuZHMgVHJhbnNmb3JtTm9kZVxuXG4gICAgQDogKEB3b3JsZCwgQHNjYWxlLCBwb3M9dmVjKCkpIC0+XG4gICAgICAgIFxuICAgICAgICBAc2NlbmUgPSBAd29ybGQuc2NlbmVcbiAgICAgICAgc3VwZXIgJ2RpbWVuc2lvbicgQHNjZW5lXG4gICAgICAgIFxuICAgICAgICBAcG9zaXRpb24uY29weUZyb20gcG9zXG5cbiAgICAgICAgcyA9IEBzY2FsZVxuICAgICAgICBAc2NhbGluZyA9IHZlYyBzLCBzLCBzXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBpZiAxXG4gICAgICAgICAgICBwb2x5ID0gZ2VuZXJhdGUgJ2gwLjAyRCcgdHJ1ZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBwID0gTWVzaC5DcmVhdGVQb2x5aGVkcm9uIHBvbHkubmFtZSwge2N1c3RvbTpwb2x5fSwgQHNjZW5lXG4gICAgICAgICAgICBwLnBhcmVudCA9IEBcbiAgICAgICAgICAgIHAubWF0ZXJpYWwgPSBuZXcgU3RhbmRhcmRNYXRlcmlhbFxuICAgICAgICAgICAgcC5tYXRlcmlhbC5kaWZmdXNlQ29sb3IgPSBuZXcgQ29sb3IzIDAuNSAwLjUgMVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IgaSBpbiBbMC4uLjVdXG4gICAgICAgICAgICAgICAgaW5zdCA9IHAuY3JlYXRlSW5zdGFuY2UgXCIje3BvbHkubmFtZX1fI3tpfVwiIFxuICAgICAgICAgICAgICAgIHMgPSAxIC0gaSowLjJcbiAgICAgICAgICAgICAgICBpbnN0LnNjYWxpbmcuY29weUZyb21GbG9hdHMgcywgcywgc1xuICAgICAgICAgICAgICAgIGluc3QucGFyZW50ID0gQFxuICAgICAgICAgICAgICAgICMgaW5zdC5yb3RhdGUgdmVjKDAsMSwwKSwgZGVnMnJhZCBpKjZcbiAgICAgICAgICAgICAgICAjIGluc3Qucm90YXRlIHZlYygxLDAsMCksIGRlZzJyYWQgcmFuZG9tKCkqMTgwXG4gICAgICAgIFxuICAgIGRlbDogLT5cbiAgICAgICAgIyBrbG9nIFwiZGltIGRlbCAje0BuYW1lfVwiXG4gICAgICAgIEBkaXNwb3NlKClcbiAgICAgICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gRGltZW5zaW9uXG4iXX0=
//# sourceURL=../coffee/dimension.coffee