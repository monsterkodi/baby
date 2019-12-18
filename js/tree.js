// koffee 1.6.0

/*
000000000  00000000   00000000  00000000
   000     000   000  000       000     
   000     0000000    0000000   0000000 
   000     000   000  000       000     
   000     000   000  00000000  00000000
 */
var Color3, TransformNode, Tree, Vector3, colors, generate, random, ref, vec,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('babylonjs'), Color3 = ref.Color3, TransformNode = ref.TransformNode, Vector3 = ref.Vector3;

colors = require('kxk').colors;

random = Math.random;

vec = require('./poly/math').vec;

generate = require('./poly/generate');

Tree = (function(superClass) {
    extend(Tree, superClass);

    function Tree(world) {
        var i, index, inst, ref1, shapes;
        this.world = world;
        this.scene = this.world.scene;
        Tree.__super__.constructor.call(this, 'tree', this.scene);
        shapes = ['hC', 'hO', 'hD', 'hdjC', 'hT', 'hI'];
        colors = [new Color3(1, 0, 0), new Color3(0, .5, 0), new Color3(0, 0, 1), new Color3(1, 0, 1), new Color3(1, 1, 0), new Color3(.3, .3, .3)];
        for (index = i = 0, ref1 = shapes.length; 0 <= ref1 ? i < ref1 : i > ref1; index = 0 <= ref1 ? ++i : --i) {
            inst = this.world.shapes.create(shapes[index], colors[index]);
            inst.scaling = new Vector3(100, 100, 100);
            inst.position.x = index * 200;
            inst.parent = this;
        }
    }

    return Tree;

})(TransformNode);

module.exports = Tree;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsd0VBQUE7SUFBQTs7O0FBUUEsTUFBcUMsT0FBQSxDQUFRLFdBQVIsQ0FBckMsRUFBRSxtQkFBRixFQUFVLGlDQUFWLEVBQXlCOztBQUN2QixTQUFXLE9BQUEsQ0FBUSxLQUFSOztBQUNYLFNBQVc7O0FBQ1gsTUFBUSxPQUFBLENBQVEsYUFBUjs7QUFDVixRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztBQUVMOzs7SUFFQyxjQUFDLEtBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLFFBQUQ7UUFFQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQUMsQ0FBQSxLQUFLLENBQUM7UUFDaEIsc0NBQU0sTUFBTixFQUFhLElBQUMsQ0FBQSxLQUFkO1FBRUEsTUFBQSxHQUFTLENBQUMsSUFBRCxFQUFLLElBQUwsRUFBUyxJQUFULEVBQWEsTUFBYixFQUFtQixJQUFuQixFQUF1QixJQUF2QjtRQUNULE1BQUEsR0FBUyxDQUNMLElBQUksTUFBSixDQUFXLENBQVgsRUFBYSxDQUFiLEVBQWUsQ0FBZixDQURLLEVBRUwsSUFBSSxNQUFKLENBQVcsQ0FBWCxFQUFhLEVBQWIsRUFBZ0IsQ0FBaEIsQ0FGSyxFQUdMLElBQUksTUFBSixDQUFXLENBQVgsRUFBYSxDQUFiLEVBQWUsQ0FBZixDQUhLLEVBSUwsSUFBSSxNQUFKLENBQVcsQ0FBWCxFQUFhLENBQWIsRUFBZSxDQUFmLENBSkssRUFLTCxJQUFJLE1BQUosQ0FBVyxDQUFYLEVBQWEsQ0FBYixFQUFlLENBQWYsQ0FMSyxFQU1MLElBQUksTUFBSixDQUFXLEVBQVgsRUFBYyxFQUFkLEVBQWlCLEVBQWpCLENBTks7QUFTVCxhQUFhLG1HQUFiO1lBQ0ksSUFBQSxHQUFPLElBQUMsQ0FBQSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQWQsQ0FBcUIsTUFBTyxDQUFBLEtBQUEsQ0FBNUIsRUFBb0MsTUFBTyxDQUFBLEtBQUEsQ0FBM0M7WUFDUCxJQUFJLENBQUMsT0FBTCxHQUFlLElBQUksT0FBSixDQUFZLEdBQVosRUFBaUIsR0FBakIsRUFBc0IsR0FBdEI7WUFDZixJQUFJLENBQUMsUUFBUSxDQUFDLENBQWQsR0FBa0IsS0FBQSxHQUFNO1lBQ3hCLElBQUksQ0FBQyxNQUFMLEdBQWM7QUFKbEI7SUFmRDs7OztHQUZZOztBQXVCbkIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMDBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbiAgIDAwMCAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbiAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDBcbiMjI1xuXG57IENvbG9yMywgVHJhbnNmb3JtTm9kZSwgVmVjdG9yMyB9ID0gcmVxdWlyZSAnYmFieWxvbmpzJ1xueyBjb2xvcnMgfSA9IHJlcXVpcmUgJ2t4aydcbnsgcmFuZG9tIH0gPSBNYXRoXG57IHZlYyB9ID0gcmVxdWlyZSAnLi9wb2x5L21hdGgnXG5nZW5lcmF0ZSA9IHJlcXVpcmUgJy4vcG9seS9nZW5lcmF0ZSdcblxuY2xhc3MgVHJlZSBleHRlbmRzIFRyYW5zZm9ybU5vZGVcblxuICAgIEA6IChAd29ybGQpIC0+XG4gICAgICAgIFxuICAgICAgICBAc2NlbmUgPSBAd29ybGQuc2NlbmVcbiAgICAgICAgc3VwZXIgJ3RyZWUnIEBzY2VuZVxuICAgICAgICBcbiAgICAgICAgc2hhcGVzID0gWydoQycnaE8nJ2hEJydoZGpDJydoVCcnaEknXVxuICAgICAgICBjb2xvcnMgPSBbXG4gICAgICAgICAgICBuZXcgQ29sb3IzIDEgMCAwXG4gICAgICAgICAgICBuZXcgQ29sb3IzIDAgLjUgMFxuICAgICAgICAgICAgbmV3IENvbG9yMyAwIDAgMVxuICAgICAgICAgICAgbmV3IENvbG9yMyAxIDAgMVxuICAgICAgICAgICAgbmV3IENvbG9yMyAxIDEgMFxuICAgICAgICAgICAgbmV3IENvbG9yMyAuMyAuMyAuM1xuICAgICAgICAgICAgXVxuICAgICAgICBcbiAgICAgICAgZm9yIGluZGV4IGluIFswLi4uc2hhcGVzLmxlbmd0aF1cbiAgICAgICAgICAgIGluc3QgPSBAd29ybGQuc2hhcGVzLmNyZWF0ZSBzaGFwZXNbaW5kZXhdLCBjb2xvcnNbaW5kZXhdXG4gICAgICAgICAgICBpbnN0LnNjYWxpbmcgPSBuZXcgVmVjdG9yMyAxMDAsIDEwMCwgMTAwXG4gICAgICAgICAgICBpbnN0LnBvc2l0aW9uLnggPSBpbmRleCoyMDBcbiAgICAgICAgICAgIGluc3QucGFyZW50ID0gQFxuXG5tb2R1bGUuZXhwb3J0cyA9IFRyZWVcbiJdfQ==
//# sourceURL=../coffee/tree.coffee