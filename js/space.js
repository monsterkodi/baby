// koffee 1.6.0

/*
 0000000  00000000    0000000    0000000  00000000
000       000   000  000   000  000       000     
0000000   00000000   000000000  000       0000000 
     000  000        000   000  000       000     
0000000   000        000   000   0000000  00000000
 */
var Color3, Dimension, Mesh, Space, StandardMaterial, deg2rad, generate, klog, random, ref, ref1, vec;

ref = require('babylonjs'), Color3 = ref.Color3, Mesh = ref.Mesh, Space = ref.Space, StandardMaterial = ref.StandardMaterial;

ref1 = require('kxk'), deg2rad = ref1.deg2rad, klog = ref1.klog;

random = Math.random;

vec = require('./poly/math').vec;

generate = require('./poly/generate');

Dimension = require('./dimension');

Space = (function() {
    function Space(world) {
        var i, inst, j, k, l, p, poly, ref2, s;
        this.world = world;
        this.scene = this.world.scene;
        this.dimension = new Dimension(this.world, 10000);
        this.lower = [];
        for (i = j = 0; j < 8; i = ++j) {
            this.lower.push(new Dimension(this.world, 100, vec(200 * (i % 2), 200 * ((i >> 1) % 2), 200 * ((i >> 2) % 2))));
            this.lower.slice(-1)[0].name = "lower_" + i;
        }
        if (0) {
            poly = generate('h0.1jgD', true);
            poly.colorize('signature');
            p = Mesh.CreatePolyhedron(poly.name, {
                custom: poly
            }, this.scene);
            this.scene.showFaces(p, poly);
            p.material = new StandardMaterial;
            p.material.diffuseColor = new Color3(0, 0, 0.1);
            for (i = k = 0; k < 10; i = ++k) {
                inst = p.createInstance(poly.name + "_" + i);
                s = 40 + i * 40;
                inst.scaling = vec(s, s, s);
                inst.rotate(vec(0, 1, 0), deg2rad(random() * 180));
                inst.rotate(vec(1, 0, 0), deg2rad(random() * 180));
                if ((ref2 = this.scene.shadowGenerator) != null) {
                    ref2.addShadowCaster(inst);
                }
            }
        }
        if (0) {
            poly = generate('h0.6O', true);
            poly.colorize('signature');
            p = Mesh.CreatePolyhedron(poly.name, {
                custom: poly
            }, this.scene);
            this.scene.showFaces(p, poly);
            for (i = l = 0; l < 100; i = ++l) {
                inst = p.createInstance(poly.name + "_" + i);
                s = (1 + random() * 3) * .1;
                inst.scaling = vec(s, s, s);
                inst.position.x = (random() - 0.5) * 20;
                inst.position.z = (random() - 0.5) * 20;
                inst.position.y = (random()) * 5;
                inst.rotate(vec(0, 1, 0), random());
            }
        }
    }

    Space.prototype.render = function() {
        var campos, i, j, k, l, len, len1, lower, offset, oldDistance, ref2, ref3, results, swapDist;
        campos = vec(this.world.camera.position);
        oldDistance = this.distance;
        swapDist = 5000;
        this.distance = campos.length();
        this.distFactor = this.distance / swapDist;
        if (this.distance >= swapDist) {
            if (oldDistance < swapDist) {
                klog('distance', this.distance, 'distFactor', this.distFactor, 'lower', this.lower.length);
                ref2 = this.lower;
                for (j = 0, len = ref2.length; j < len; j++) {
                    lower = ref2[j];
                    lower.del();
                }
                this.dimension.scaleDown();
                this.world.camera.scaleDown();
                this.distance *= 0.01;
                this.distFactor = this.distance / swapDist;
                klog('newDistance', this.distance, this.world.camera.position.length());
                this.lower = [this.dimension];
                return this.dimension = new Dimension(this.world, swapDist);
            }
        } else {
            this.lower.sort(function(a, b) {
                return campos.to(a.position).length() - campos.to(b.position).length();
            });
            this.distance = campos.to(this.lower[0].position).length();
            this.distFactor = this.distance / swapDist;
            if (this.distance < 50 && oldDistance > 50) {
                klog('distance', this.distance, 'distFactor', this.distFactor, 'lower', this.lower[0].name);
                this.dimension.del();
                this.dimension = this.lower.shift();
                ref3 = this.lower;
                for (k = 0, len1 = ref3.length; k < len1; k++) {
                    lower = ref3[k];
                    lower.del();
                }
                offset = vec(this.dimension.position);
                this.dimension.scaleUp(offset);
                this.world.camera.scaleUp(offset);
                this.distance *= 100;
                this.distFactor = this.distance / swapDist;
                klog('newDistance', this.distance, this.world.camera.position.length());
                this.lower = [];
                results = [];
                for (i = l = 0; l < 4; i = ++l) {
                    this.lower.push(new Dimension(this.world, 100, vec(200 * (i % 2), 200 * ((i >> 1) % 2), 200 * ((i >> 2) % 2))));
                    results.push(this.lower.slice(-1)[0].name = "lower_" + i);
                }
                return results;
            }
        }
    };

    return Space;

})();

module.exports = Space;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BhY2UuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQTRDLE9BQUEsQ0FBUSxXQUFSLENBQTVDLEVBQUUsbUJBQUYsRUFBVSxlQUFWLEVBQWdCLGlCQUFoQixFQUF1Qjs7QUFDdkIsT0FBb0IsT0FBQSxDQUFRLEtBQVIsQ0FBcEIsRUFBRSxzQkFBRixFQUFXOztBQUNULFNBQVc7O0FBQ1gsTUFBUSxPQUFBLENBQVEsYUFBUjs7QUFDVixRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztBQUNYLFNBQUEsR0FBWSxPQUFBLENBQVEsYUFBUjs7QUFFTjtJQUVDLGVBQUMsS0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsUUFBRDtRQUVBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQztRQUNoQixJQUFDLENBQUEsU0FBRCxHQUFhLElBQUksU0FBSixDQUFjLElBQUMsQ0FBQSxLQUFmLEVBQXNCLEtBQXRCO1FBRWIsSUFBQyxDQUFBLEtBQUQsR0FBUztBQUNULGFBQVMseUJBQVQ7WUFDSSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxJQUFJLFNBQUosQ0FBYyxJQUFDLENBQUEsS0FBZixFQUFzQixHQUF0QixFQUEyQixHQUFBLENBQUksR0FBQSxHQUFJLENBQUMsQ0FBQSxHQUFFLENBQUgsQ0FBUixFQUFlLEdBQUEsR0FBSSxDQUFDLENBQUMsQ0FBQSxJQUFHLENBQUosQ0FBQSxHQUFPLENBQVIsQ0FBbkIsRUFBK0IsR0FBQSxHQUFJLENBQUMsQ0FBQyxDQUFBLElBQUcsQ0FBSixDQUFBLEdBQU8sQ0FBUixDQUFuQyxDQUEzQixDQUFaO1lBQ0EsSUFBQyxDQUFBLEtBQU0sVUFBRSxDQUFBLENBQUEsQ0FBQyxDQUFDLElBQVgsR0FBa0IsUUFBQSxHQUFTO0FBRi9CO1FBSUEsSUFBRyxDQUFIO1lBQ0ksSUFBQSxHQUFP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R0FBSSxDQUFDLENBQUEsR0FBRSxDQUFILENBQVIsRUFBZSxHQUFBLEdBQUksQ0FBQyxDQUFDLENBQUEsSUFBRyxDQUFKLENBQUEsR0FBTyxDQUFSLENBQW5CLEVBQStCLEdBQUEsR0FBSSxDQUFDLENBQUMsQ0FBQSxJQUFHLENBQUosQ0FBQSxHQUFPLENBQVIsQ0FBbkMsQ0FBM0IsQ0FBWjtpQ0FDQSxJQUFDLENBQUEsS0FBTSxVQUFFLENBQUEsQ0FBQSxDQUFDLENBQUMsSUFBWCxHQUFrQixRQUFBLEdBQVM7QUFGL0I7K0JBbEJKO2FBdEJKOztJQVZJOzs7Ozs7QUFzRFosTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMDAwMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCBcbiAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgXG4wMDAwMDAwICAgMDAwICAgICAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMFxuIyMjXG5cbnsgQ29sb3IzLCBNZXNoLCBTcGFjZSwgU3RhbmRhcmRNYXRlcmlhbCB9ID0gcmVxdWlyZSAnYmFieWxvbmpzJ1xueyBkZWcycmFkLCBrbG9nIH0gPSByZXF1aXJlICdreGsnXG57IHJhbmRvbSB9ID0gTWF0aFxueyB2ZWMgfSA9IHJlcXVpcmUgJy4vcG9seS9tYXRoJ1xuZ2VuZXJhdGUgPSByZXF1aXJlICcuL3BvbHkvZ2VuZXJhdGUnXG5EaW1lbnNpb24gPSByZXF1aXJlICcuL2RpbWVuc2lvbidcblxuY2xhc3MgU3BhY2VcblxuICAgIEA6IChAd29ybGQpIC0+XG5cbiAgICAgICAgQHNjZW5lID0gQHdvcmxkLnNjZW5lXG4gICAgICAgIEBkaW1lbnNpb24gPSBuZXcgRGltZW5zaW9uIEB3b3JsZCwgMTAwMDBcbiAgICAgICAgXG4gICAgICAgIEBsb3dlciA9IFtdXG4gICAgICAgIGZvciBpIGluIFswLi4uOF1cbiAgICAgICAgICAgIEBsb3dlci5wdXNoIG5ldyBEaW1lbnNpb24gQHdvcmxkLCAxMDAsIHZlYyAyMDAqKGklMiksIDIwMCooKGk+PjEpJTIpLCAyMDAqKChpPj4yKSUyKVxuICAgICAgICAgICAgQGxvd2VyWy0xXS5uYW1lID0gXCJsb3dlcl8je2l9XCJcbiAgICAgICAgXG4gICAgICAgIGlmIDBcbiAgICAgICAgICAgIHBvbHkgPSBnZW5lcmF0ZSAnaDAuMWpnRCcgdHJ1ZVxuICAgICAgICAgICAgcG9seS5jb2xvcml6ZSAnc2lnbmF0dXJlJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBwID0gTWVzaC5DcmVhdGVQb2x5aGVkcm9uIHBvbHkubmFtZSwge2N1c3RvbTpwb2x5fSwgQHNjZW5lXG4gICAgICAgICAgICBAc2NlbmUuc2hvd0ZhY2VzIHAsIHBvbHlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcC5tYXRlcmlhbCA9IG5ldyBTdGFuZGFyZE1hdGVyaWFsXG4gICAgICAgICAgICBwLm1hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IG5ldyBDb2xvcjMgMCAwIDAuMVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IgaSBpbiBbMC4uLjEwXVxuICAgICAgICAgICAgICAgIGluc3QgPSBwLmNyZWF0ZUluc3RhbmNlIFwiI3twb2x5Lm5hbWV9XyN7aX1cIiBcbiAgICAgICAgICAgICAgICBzID0gNDAraSo0MCAjKDErcmFuZG9tKCkqMykqMTAwXG4gICAgICAgICAgICAgICAgaW5zdC5zY2FsaW5nID0gdmVjIHMsIHMsIHNcbiAgICAgICAgICAgICAgICAjIGluc3QucG9zaXRpb24ueCA9IChyYW5kb20oKS0wLjUpKjEwXG4gICAgICAgICAgICAgICAgIyBpbnN0LnBvc2l0aW9uLnogPSAocmFuZG9tKCktMC41KSoxMFxuICAgICAgICAgICAgICAgICMgaW5zdC5wb3NpdGlvbi55ID0gMTArKHJhbmRvbSgpKSoyMFxuXG4gICAgICAgICAgICAgICAgaW5zdC5yb3RhdGUgdmVjKDAsMSwwKSwgZGVnMnJhZCByYW5kb20oKSoxODBcbiAgICAgICAgICAgICAgICBpbnN0LnJvdGF0ZSB2ZWMoMSwwLDApLCBkZWcycmFkIHJhbmRvbSgpKjE4MFxuICAgIFxuICAgICAgICAgICAgICAgIEBzY2VuZS5zaGFkb3dHZW5lcmF0b3I/LmFkZFNoYWRvd0Nhc3RlciBpbnN0XG5cbiAgICAgICAgaWYgMFxuICAgICAgICAgICAgcG9seSA9IGdlbmVyYXRlICdoMC42TycgdHJ1ZVxuICAgICAgICAgICAgcG9seS5jb2xvcml6ZSAnc2lnbmF0dXJlJ1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBwID0gTWVzaC5DcmVhdGVQb2x5aGVkcm9uIHBvbHkubmFtZSwge2N1c3RvbTpwb2x5fSwgQHNjZW5lXG4gICAgICAgICAgICBAc2NlbmUuc2hvd0ZhY2VzIHAsIHBvbHlcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciBpIGluIFswLi4uMTAwXVxuICAgICAgICAgICAgICAgIGluc3QgPSBwLmNyZWF0ZUluc3RhbmNlIFwiI3twb2x5Lm5hbWV9XyN7aX1cIiBcbiAgICAgICAgICAgICAgICBzID0gKDErcmFuZG9tKCkqMykqLjFcbiAgICAgICAgICAgICAgICBpbnN0LnNjYWxpbmcgPSB2ZWMgcywgcywgc1xuICAgICAgICAgICAgICAgIGluc3QucG9zaXRpb24ueCA9IChyYW5kb20oKS0wLjUpKjIwXG4gICAgICAgICAgICAgICAgaW5zdC5wb3NpdGlvbi56ID0gKHJhbmRvbSgpLTAuNSkqMjBcbiAgICAgICAgICAgICAgICBpbnN0LnBvc2l0aW9uLnkgPSAocmFuZG9tKCkpKjVcbiAgICAgICAgICAgICAgICBpbnN0LnJvdGF0ZSB2ZWMoMCwxLDApLCByYW5kb20oKVxuXG4gICAgcmVuZGVyOiAtPlxuICAgICAgICBcbiAgICAgICAgY2FtcG9zID0gdmVjIEB3b3JsZC5jYW1lcmEucG9zaXRpb25cbiAgICAgICAgb2xkRGlzdGFuY2UgPSBAZGlzdGFuY2VcbiAgICAgICAgXG4gICAgICAgIHN3YXBEaXN0ID0gNTAwMFxuICAgICAgICBcbiAgICAgICAgQGRpc3RhbmNlID0gY2FtcG9zLmxlbmd0aCgpXG4gICAgICAgIEBkaXN0RmFjdG9yID0gQGRpc3RhbmNlIC8gc3dhcERpc3RcbiAgICAgICAgXG4gICAgICAgIGlmIEBkaXN0YW5jZSA+PSBzd2FwRGlzdFxuICAgICAgICAgICAgaWYgb2xkRGlzdGFuY2UgPCBzd2FwRGlzdFxuICAgICAgICAgICAgICAgIGtsb2cgJ2Rpc3RhbmNlJyBAZGlzdGFuY2UsICdkaXN0RmFjdG9yJyBAZGlzdEZhY3RvciwgJ2xvd2VyJyBAbG93ZXIubGVuZ3RoXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yIGxvd2VyIGluIEBsb3dlclxuICAgICAgICAgICAgICAgICAgICBsb3dlci5kZWwoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBkaW1lbnNpb24uc2NhbGVEb3duKClcbiAgICAgICAgICAgICAgICBAd29ybGQuY2FtZXJhLnNjYWxlRG93bigpXG4gICAgICAgICAgICAgICAgQGRpc3RhbmNlICo9IDAuMDFcbiAgICAgICAgICAgICAgICBAZGlzdEZhY3RvciA9IEBkaXN0YW5jZSAvIHN3YXBEaXN0XG4gICAgICAgICAgICAgICAga2xvZyAnbmV3RGlzdGFuY2UnIEBkaXN0YW5jZSwgQHdvcmxkLmNhbWVyYS5wb3NpdGlvbi5sZW5ndGgoKVxuICAgICAgICAgICAgICAgIEBsb3dlciA9IFtAZGltZW5zaW9uXVxuICAgICAgICAgICAgICAgIEBkaW1lbnNpb24gPSBuZXcgRGltZW5zaW9uIEB3b3JsZCwgc3dhcERpc3RcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgIyBrbG9nICdpbm5lcidcbiAgICAgICAgICAgIEBsb3dlci5zb3J0IChhLGIpIC0+XG4gICAgICAgICAgICAgICAgY2FtcG9zLnRvKGEucG9zaXRpb24pLmxlbmd0aCgpLWNhbXBvcy50byhiLnBvc2l0aW9uKS5sZW5ndGgoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgQGRpc3RhbmNlID0gY2FtcG9zLnRvKEBsb3dlclswXS5wb3NpdGlvbikubGVuZ3RoKClcbiAgICAgICAgICAgIEBkaXN0RmFjdG9yID0gQGRpc3RhbmNlIC8gc3dhcERpc3RcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQGRpc3RhbmNlIDwgNTAgYW5kIG9sZERpc3RhbmNlID4gNTAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBrbG9nICdkaXN0YW5jZScgQGRpc3RhbmNlLCAnZGlzdEZhY3RvcicgQGRpc3RGYWN0b3IsICdsb3dlcicgQGxvd2VyWzBdLm5hbWVcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBAZGltZW5zaW9uLmRlbCgpXG4gICAgICAgICAgICAgICAgQGRpbWVuc2lvbiA9IEBsb3dlci5zaGlmdCgpXG5cbiAgICAgICAgICAgICAgICBmb3IgbG93ZXIgaW4gQGxvd2VyXG4gICAgICAgICAgICAgICAgICAgIGxvd2VyLmRlbCgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gdmVjIEBkaW1lbnNpb24ucG9zaXRpb25cbiAgICAgICAgICAgICAgICBAZGltZW5zaW9uLnNjYWxlVXAgb2Zmc2V0XG4gICAgICAgICAgICAgICAgQHdvcmxkLmNhbWVyYS5zY2FsZVVwIG9mZnNldFxuICAgICAgICAgICAgICAgIEBkaXN0YW5jZSAqPSAxMDBcbiAgICAgICAgICAgICAgICBAZGlzdEZhY3RvciA9IEBkaXN0YW5jZSAvIHN3YXBEaXN0XG4gICAgICAgICAgICAgICAga2xvZyAnbmV3RGlzdGFuY2UnIEBkaXN0YW5jZSwgQHdvcmxkLmNhbWVyYS5wb3NpdGlvbi5sZW5ndGgoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBsb3dlciA9IFtdXG4gICAgICAgICAgICAgICAgZm9yIGkgaW4gWzAuLi40XVxuICAgICAgICAgICAgICAgICAgICBAbG93ZXIucHVzaCBuZXcgRGltZW5zaW9uIEB3b3JsZCwgMTAwLCB2ZWMgMjAwKihpJTIpLCAyMDAqKChpPj4xKSUyKSwgMjAwKigoaT4+MiklMilcbiAgICAgICAgICAgICAgICAgICAgQGxvd2VyWy0xXS5uYW1lID0gXCJsb3dlcl8je2l9XCJcbiAgICAgICAgICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gU3BhY2VcbiJdfQ==
//# sourceURL=../coffee/space.coffee