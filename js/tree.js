// koffee 1.6.0

/*
000000000  00000000   00000000  00000000
   000     000   000  000       000     
   000     0000000    0000000   0000000 
   000     000   000  000       000     
   000     000   000  00000000  00000000
 */
var Color3, Quaternion, TransformNode, Tree, Vect, Vector3, abs, generate, klog, normal, ref, ref1, vec,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('babylonjs'), Color3 = ref.Color3, Quaternion = ref.Quaternion, TransformNode = ref.TransformNode, Vector3 = ref.Vector3;

klog = require('kxk').klog;

abs = Math.abs;

ref1 = require('./poly/math'), normal = ref1.normal, vec = ref1.vec;

Vect = require('./vect');

generate = require('./poly/generate');

Tree = (function(superClass) {
    extend(Tree, superClass);

    function Tree(world) {
        this.world = world;
        this.scene = this.world.scene;
        Tree.__super__.constructor.call(this, 'tree', this.scene);
        this.instances = [];
        this.shapes = ['I', 'C', 'djC', 'O', 'T', 'D', 'O', 'I'];
        this.colors = [new Color3(0, 0, 0.2), new Color3(0, 0, 0.4), new Color3(0, 0, 0.6), new Color3(0, 0, 0.8), new Color3(0, 0, 1)];
        this.branch('C', 0);
    }

    Tree.prototype.render = function() {
        var i, inst, len, ref2, results;
        ref2 = this.instances;
        results = [];
        for (i = 0, len = ref2.length; i < len; i++) {
            inst = ref2[i];
            if (inst.normal) {
                results.push(inst.rotationQuaternion.multiplyInPlace(Quaternion.RotationAxis(vec(0, 1, 0), 0.005)));
            } else {
                results.push(void 0);
            }
        }
        return results;
    };

    Tree.prototype.branch = function(code, depth, scale, pos, parent, normal) {
        var ax, ay, az, center, centers, ci, i, inst, len, normals, poly, results;
        if (scale == null) {
            scale = 1000;
        }
        if (pos != null) {
            pos;
        } else {
            pos = new Vector3(0, 0, 0);
        }
        code = this.shapes[depth];
        inst = this.world.shapes.create(code, this.colors[depth]);
        if (normal) {
            ay = Vector3.FromArray(normal);
            if (abs(Vector3.Dot(ay, new Vector3(0, 0, 1))) < 1) {
                ax = new Vector3(0, 0, 1).cross(ay);
                az = ax.cross(ay);
            } else {
                ax = new Vector3(1, 0, 0).cross(ay);
                az = ax.cross(ay);
            }
            inst.rotationQuaternion = Quaternion.RotationQuaternionFromAxis(ax, ay, az);
        }
        inst.parent = parent;
        inst.normal = normal;
        inst.position.copyFrom(pos);
        inst.scaling = new Vector3(scale, scale, scale);
        this.instances.push(inst);
        if (depth < 3) {
            poly = generate(code);
            centers = poly.centers();
            normals = poly.normals();
            results = [];
            for (ci = i = 0, len = centers.length; i < len; ci = ++i) {
                center = centers[ci];
                results.push(this.branch(code, depth + 1, 0.4, Vector3.FromArray(center).scale(1.5), inst, normals[ci]));
            }
            return results;
        }
    };

    return Tree;

})(TransformNode);

module.exports = Tree;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsbUdBQUE7SUFBQTs7O0FBUUEsTUFBaUQsT0FBQSxDQUFRLFdBQVIsQ0FBakQsRUFBRSxtQkFBRixFQUFVLDJCQUFWLEVBQXNCLGlDQUF0QixFQUFxQzs7QUFDbkMsT0FBUyxPQUFBLENBQVEsS0FBUjs7QUFDVCxNQUFROztBQUNWLE9BQWtCLE9BQUEsQ0FBUSxhQUFSLENBQWxCLEVBQUUsb0JBQUYsRUFBVTs7QUFDVixJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0FBQ1AsUUFBQSxHQUFXLE9BQUEsQ0FBUSxpQkFBUjs7QUFFTDs7O0lBRUMsY0FBQyxLQUFEO1FBQUMsSUFBQyxDQUFBLFFBQUQ7UUFFQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxLQUFLLENBQUM7UUFDaEIsc0NBQU0sTUFBTixFQUFhLElBQUMsQ0FBQSxLQUFkO1FBRUEsSUFBQyxDQUFBLFNBQUQsR0FBYTtRQUNiLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBQyxHQUFELEVBQUksR0FBSixFQUFPLEtBQVAsRUFBWSxHQUFaLEVBQWUsR0FBZixFQUFrQixHQUFsQixFQUFxQixHQUFyQixFQUF3QixHQUF4QjtRQUNWLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FDTixJQUFJLE1BQUosQ0FBVyxDQUFYLEVBQWEsQ0FBYixFQUFlLEdBQWYsQ0FETSxFQUVOLElBQUksTUFBSixDQUFXLENBQVgsRUFBYSxDQUFiLEVBQWUsR0FBZixDQUZNLEVBR04sSUFBSSxNQUFKLENBQVcsQ0FBWCxFQUFhLENBQWIsRUFBZSxHQUFmLENBSE0sRUFJTixJQUFJLE1BQUosQ0FBVyxDQUFYLEVBQWEsQ0FBYixFQUFlLEdBQWYsQ0FKTSxFQUtOLElBQUksTUFBSixDQUFXLENBQVgsRUFBYSxDQUFiLEVBQWUsQ0FBZixDQUxNO1FBUVYsSUFBQyxDQUFBLE1BQUQsQ0FBUSxHQUFSLEVBQVksQ0FBWjtJQWZEOzttQkFpQkgsTUFBQSxHQUFRLFNBQUE7QUFFSixZQUFBO0FBQUE7QUFBQTthQUFBLHNDQUFBOztZQUNJLElBQUcsSUFBSSxDQUFDLE1BQVI7NkJBQ0ksSUFBSSxDQUFDLGtCQUFrQixDQUFDLGVBQXhCLENBQXdDLFVBQVUsQ0FBQyxZQUFYLENBQXdCLEdBQUEsQ0FBSSxDQUFKLEVBQU0sQ0FBTixFQUFRLENBQVIsQ0FBeEIsRUFBb0MsS0FBcEMsQ0FBeEMsR0FESjthQUFBLE1BQUE7cUNBQUE7O0FBREo7O0lBRkk7O21CQU1SLE1BQUEsR0FBUSxTQUFDLElBQUQsRUFBTyxLQUFQLEVBQWMsS0FBZCxFQUEwQixHQUExQixFQUErQixNQUEvQixFQUF1QyxNQUF2QztBQUVKLFlBQUE7O1lBRmtCLFFBQU07OztZQUV4Qjs7WUFBQSxNQUFPLElBQUksT0FBSixDQUFZLENBQVosRUFBYyxDQUFkLEVBQWdCLENBQWhCOztRQUNQLElBQUEsR0FBTyxJQUFDLENBQUEsTUFBTyxDQUFBLEtBQUE7UUFDZixJQUFBLEdBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBZCxDQUFxQixJQUFyQixFQUEyQixJQUFDLENBQUEsTUFBTyxDQUFBLEtBQUEsQ0FBbkM7UUFDUCxJQUFHLE1BQUg7WUFDSSxFQUFBLEdBQUssT0FBTyxDQUFDLFNBQVIsQ0FBa0IsTUFBbEI7WUFDTCxJQUFHLEdBQUEsQ0FBSSxPQUFPLENBQUMsR0FBUixDQUFZLEVBQVosRUFBZ0IsSUFBSSxPQUFKLENBQVksQ0FBWixFQUFjLENBQWQsRUFBZ0IsQ0FBaEIsQ0FBaEIsQ0FBSixDQUFBLEdBQTJDLENBQTlDO2dCQUNJLEVBQUEsR0FBSyxJQUFJLE9BQUosQ0FBWSxDQUFaLEVBQWMsQ0FBZCxFQUFnQixDQUFoQixDQUFrQixDQUFDLEtBQW5CLENBQXlCLEVBQXpCO2dCQUNMLEVBQUEsR0FBSyxFQUFFLENBQUMsS0FBSCxDQUFTLEVBQVQsRUFGVDthQUFBLE1BQUE7Z0JBSUksRUFBQSxHQUFLLElBQUksT0FBSixDQUFZLENBQVosRUFBYyxDQUFkLEVBQWdCLENBQWhCLENBQWtCLENBQUMsS0FBbkIsQ0FBeUIsRUFBekI7Z0JBQ0wsRUFBQSxHQUFLLEVBQUUsQ0FBQyxLQUFILENBQVMsRUFBVCxFQUxUOztZQU1BLElBQUksQ0FBQyxrQkFBTCxHQUEwQixVQUFVLENBQUMsMEJBQVgsQ0FBc0MsRUFBdEMsRUFBMEMsRUFBMUMsRUFBOEMsRUFBOUMsRUFSOUI7O1FBU0EsSUFBSSxDQUFDLE1BQUwsR0FBYztRQUNkLElBQUksQ0FBQyxNQUFMLEdBQWM7UUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQWQsQ0FBdUIsR0FBdkI7UUFDQSxJQUFJLENBQUMsT0FBTCxHQUFlLElBQUksT0FBSixDQUFZLEtBQVosRUFBbUIsS0FBbkIsRUFBMEIsS0FBMUI7UUFFZixJQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsSUFBaEI7UUFFQSxJQUFHLEtBQUEsR0FBUSxDQUFYO1lBQ0ksSUFBQSxHQUFPLFFBQUEsQ0FBUyxJQUFUO1lBQ1AsT0FBQSxHQUFVLElBQUksQ0FBQyxPQUFMLENBQUE7WUFDVixPQUFBLEdBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBQTtBQUNWO2lCQUFBLG1EQUFBOzs2QkFDSSxJQUFDLENBQUEsTUFBRCxDQUFRLElBQVIsRUFBYyxLQUFBLEdBQU0sQ0FBcEIsRUFBdUIsR0FBdkIsRUFBNEIsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsTUFBbEIsQ0FBeUIsQ0FBQyxLQUExQixDQUFnQyxHQUFoQyxDQUE1QixFQUFrRSxJQUFsRSxFQUF3RSxPQUFRLENBQUEsRUFBQSxDQUFoRjtBQURKOzJCQUpKOztJQXJCSTs7OztHQXpCTzs7QUFxRG5CLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMDAwMDAwXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4gICAwMDAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4gICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwXG4jIyNcblxueyBDb2xvcjMsIFF1YXRlcm5pb24sIFRyYW5zZm9ybU5vZGUsIFZlY3RvcjMgfSA9IHJlcXVpcmUgJ2JhYnlsb25qcydcbnsga2xvZyB9ID0gcmVxdWlyZSAna3hrJ1xueyBhYnMgfSA9IE1hdGhcbnsgbm9ybWFsLCB2ZWMgfSA9IHJlcXVpcmUgJy4vcG9seS9tYXRoJ1xuVmVjdCA9IHJlcXVpcmUgJy4vdmVjdCdcbmdlbmVyYXRlID0gcmVxdWlyZSAnLi9wb2x5L2dlbmVyYXRlJ1xuXG5jbGFzcyBUcmVlIGV4dGVuZHMgVHJhbnNmb3JtTm9kZVxuXG4gICAgQDogKEB3b3JsZCkgLT5cbiAgICAgICAgXG4gICAgICAgIEBzY2VuZSA9IEB3b3JsZC5zY2VuZVxuICAgICAgICBzdXBlciAndHJlZScgQHNjZW5lXG4gICAgICAgIFxuICAgICAgICBAaW5zdGFuY2VzID0gW11cbiAgICAgICAgQHNoYXBlcyA9IFsnSScnQycnZGpDJydPJydUJydEJydPJydJJ11cbiAgICAgICAgQGNvbG9ycyA9IFtcbiAgICAgICAgICAgIG5ldyBDb2xvcjMgMCAwIDAuMlxuICAgICAgICAgICAgbmV3IENvbG9yMyAwIDAgMC40XG4gICAgICAgICAgICBuZXcgQ29sb3IzIDAgMCAwLjZcbiAgICAgICAgICAgIG5ldyBDb2xvcjMgMCAwIDAuOFxuICAgICAgICAgICAgbmV3IENvbG9yMyAwIDAgMVxuICAgICAgICAgICAgXVxuICAgICAgICAgICAgXG4gICAgICAgIEBicmFuY2ggJ0MnIDBcbiAgICAgICAgXG4gICAgcmVuZGVyOiAtPlxuICAgICAgICBcbiAgICAgICAgZm9yIGluc3QgaW4gQGluc3RhbmNlc1xuICAgICAgICAgICAgaWYgaW5zdC5ub3JtYWxcbiAgICAgICAgICAgICAgICBpbnN0LnJvdGF0aW9uUXVhdGVybmlvbi5tdWx0aXBseUluUGxhY2UgUXVhdGVybmlvbi5Sb3RhdGlvbkF4aXMgdmVjKDAsMSwwKSwgMC4wMDVcbiAgICAgICAgICAgIFxuICAgIGJyYW5jaDogKGNvZGUsIGRlcHRoLCBzY2FsZT0xMDAwLCBwb3MsIHBhcmVudCwgbm9ybWFsKSAtPlxuICAgICAgICBcbiAgICAgICAgcG9zID89IG5ldyBWZWN0b3IzKDAgMCAwKVxuICAgICAgICBjb2RlID0gQHNoYXBlc1tkZXB0aF1cbiAgICAgICAgaW5zdCA9IEB3b3JsZC5zaGFwZXMuY3JlYXRlIGNvZGUsIEBjb2xvcnNbZGVwdGhdXG4gICAgICAgIGlmIG5vcm1hbFxuICAgICAgICAgICAgYXkgPSBWZWN0b3IzLkZyb21BcnJheSBub3JtYWxcbiAgICAgICAgICAgIGlmIGFicyhWZWN0b3IzLkRvdChheSwgbmV3IFZlY3RvcjMoMCwwLDEpKSkgPCAxXG4gICAgICAgICAgICAgICAgYXggPSBuZXcgVmVjdG9yMygwLDAsMSkuY3Jvc3MoYXkpXG4gICAgICAgICAgICAgICAgYXogPSBheC5jcm9zcyhheSlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBheCA9IG5ldyBWZWN0b3IzKDEsMCwwKS5jcm9zcyhheSlcbiAgICAgICAgICAgICAgICBheiA9IGF4LmNyb3NzKGF5KVxuICAgICAgICAgICAgaW5zdC5yb3RhdGlvblF1YXRlcm5pb24gPSBRdWF0ZXJuaW9uLlJvdGF0aW9uUXVhdGVybmlvbkZyb21BeGlzIGF4LCBheSwgYXpcbiAgICAgICAgaW5zdC5wYXJlbnQgPSBwYXJlbnRcbiAgICAgICAgaW5zdC5ub3JtYWwgPSBub3JtYWxcbiAgICAgICAgaW5zdC5wb3NpdGlvbi5jb3B5RnJvbSBwb3NcbiAgICAgICAgaW5zdC5zY2FsaW5nID0gbmV3IFZlY3RvcjMgc2NhbGUsIHNjYWxlLCBzY2FsZVxuICAgICAgICBcbiAgICAgICAgQGluc3RhbmNlcy5wdXNoIGluc3RcbiAgICAgICAgXG4gICAgICAgIGlmIGRlcHRoIDwgM1xuICAgICAgICAgICAgcG9seSA9IGdlbmVyYXRlIGNvZGVcbiAgICAgICAgICAgIGNlbnRlcnMgPSBwb2x5LmNlbnRlcnMoKVxuICAgICAgICAgICAgbm9ybWFscyA9IHBvbHkubm9ybWFscygpXG4gICAgICAgICAgICBmb3IgY2VudGVyLGNpIGluIGNlbnRlcnNcbiAgICAgICAgICAgICAgICBAYnJhbmNoIGNvZGUsIGRlcHRoKzEsIDAuNCwgVmVjdG9yMy5Gcm9tQXJyYXkoY2VudGVyKS5zY2FsZSgxLjUpLCBpbnN0LCBub3JtYWxzW2NpXVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyZWVcbiJdfQ==
//# sourceURL=../coffee/tree.coffee