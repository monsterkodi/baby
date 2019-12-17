// koffee 1.6.0

/*
 0000000  00000000    0000000    0000000  00000000
000       000   000  000   000  000       000     
0000000   00000000   000000000  000       0000000 
     000  000        000   000  000       000     
0000000   000        000   000   0000000  00000000
 */
var Dimension, Space, TransformNode, generate, klog, random, ref, vec;

ref = require('babylonjs'), Space = ref.Space, TransformNode = ref.TransformNode;

klog = require('kxk').klog;

random = Math.random;

vec = require('./poly/math').vec;

generate = require('./poly/generate');

Dimension = require('./dimension');

Space = (function() {
    function Space(world) {
        var d, dim, dims, j, k, l, len, len1, len2, m, ref1, ref2, ref3, sz;
        this.world = world;
        this.scene = this.world.scene;
        this.dimstack = [];
        this.trans = new TransformNode('trans', this.scene, true);
        sz = 1;
        for (d = j = 0; j <= 2; d = ++j) {
            dims = this.dimstack.push(this.newDims(sz));
            sz *= 100;
        }
        ref1 = this.dimstack[0];
        for (k = 0, len = ref1.length; k < len; k++) {
            dim = ref1[k];
            dim.parent = this.trans;
        }
        ref2 = this.dimstack[1];
        for (l = 0, len1 = ref2.length; l < len1; l++) {
            dim = ref2[l];
            dim.parent = null;
        }
        ref3 = this.dimstack[2];
        for (m = 0, len2 = ref3.length; m < len2; m++) {
            dim = ref3[m];
            dim.parent = null;
        }
    }

    Space.prototype.newDims = function(sz) {
        var dims, i, j;
        dims = [];
        for (i = j = 0; j < 8; i = ++j) {
            dims.push(new Dimension(this.world, sz, vec(2 * sz * (i % 2), 2 * sz * ((i >> 1) % 2), 2 * sz * ((i >> 2) % 2))));
            dims.slice(-1)[0].name = "dim_" + i;
        }
        return dims;
    };

    Space.prototype.render = function() {
        var campos, dim, high, j, k, l, len, len1, len10, len11, len2, len3, len4, len5, len6, len7, len8, len9, low, m, n, o, offset, oldDistance, p, q, r, ref1, ref10, ref11, ref12, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, results, results1, s, swapDist, t, u;
        campos = vec(this.world.camera.position);
        oldDistance = this.distance;
        swapDist = 19000;
        this.distance = campos.length();
        this.distFactor = this.distance / swapDist;
        klog('distance', this.distance);
        if (this.distance >= swapDist) {
            if (oldDistance < swapDist) {
                klog('distance', this.distance, 'distFactor', this.distFactor);
                ref1 = this.dimstack[0];
                for (j = 0, len = ref1.length; j < len; j++) {
                    low = ref1[j];
                    low.del();
                }
                ref2 = this.dimstack[1];
                for (k = 0, len1 = ref2.length; k < len1; k++) {
                    high = ref2[k];
                    high.scaleDown();
                }
                ref3 = this.dimstack[2];
                for (l = 0, len2 = ref3.length; l < len2; l++) {
                    high = ref3[l];
                    high.scaleDown();
                }
                this.dimstack[0] = this.dimstack[1];
                this.dimstack[1] = this.dimstack[2];
                this.world.camera.scaleDown();
                this.distance *= 0.01;
                this.distFactor = this.distance / swapDist;
                klog('newDistance', this.distance, this.world.camera.position.length());
                this.dimstack[2] = this.newDims(10000);
                ref4 = this.dimstack[0];
                for (m = 0, len3 = ref4.length; m < len3; m++) {
                    dim = ref4[m];
                    dim.parent = this.trans;
                }
                ref5 = this.dimstack[1];
                for (n = 0, len4 = ref5.length; n < len4; n++) {
                    dim = ref5[n];
                    dim.parent = null;
                }
                ref6 = this.dimstack[2];
                results = [];
                for (o = 0, len5 = ref6.length; o < len5; o++) {
                    dim = ref6[o];
                    results.push(dim.parent = null);
                }
                return results;
            }
        } else {
            this.dimstack[1].sort(function(a, b) {
                return campos.to(a.position).length() - campos.to(b.position).length();
            });
            this.trans.position.copyFrom(this.dimstack[1][0].position);
            this.distance = campos.to(this.dimstack[1][0].position).length();
            this.distFactor = this.distance / swapDist;
            if (this.distance < swapDist / 100 && oldDistance > swapDist / 100) {
                klog('distance', this.distance, 'distFactor', this.distFactor);
                offset = vec(this.dimstack[1][0].position);
                ref7 = this.dimstack[2];
                for (p = 0, len6 = ref7.length; p < len6; p++) {
                    high = ref7[p];
                    high.del();
                }
                ref8 = this.dimstack[1];
                for (q = 0, len7 = ref8.length; q < len7; q++) {
                    low = ref8[q];
                    low.scaleUp(offset);
                }
                ref9 = this.dimstack[0];
                for (r = 0, len8 = ref9.length; r < len8; r++) {
                    low = ref9[r];
                    low.scaleUp(offset);
                }
                this.dimstack[2] = this.dimstack[1];
                this.dimstack[1] = this.dimstack[0];
                this.world.camera.scaleUp(offset);
                this.distance *= 100;
                this.distFactor = this.distance / swapDist;
                klog('newDistance', this.distance, this.world.camera.position.length());
                this.dimstack[0] = this.newDims(1);
                ref10 = this.dimstack[0];
                for (s = 0, len9 = ref10.length; s < len9; s++) {
                    dim = ref10[s];
                    dim.parent = this.trans;
                }
                ref11 = this.dimstack[1];
                for (t = 0, len10 = ref11.length; t < len10; t++) {
                    dim = ref11[t];
                    dim.parent = null;
                }
                ref12 = this.dimstack[2];
                results1 = [];
                for (u = 0, len11 = ref12.length; u < len11; u++) {
                    dim = ref12[u];
                    results1.push(dim.parent = null);
                }
                return results1;
            }
        }
    };

    return Space;

})();

module.exports = Space;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3BhY2UuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQTJCLE9BQUEsQ0FBUSxXQUFSLENBQTNCLEVBQUUsaUJBQUYsRUFBUzs7QUFDUCxPQUFTLE9BQUEsQ0FBUSxLQUFSOztBQUNULFNBQVc7O0FBQ1gsTUFBUSxPQUFBLENBQVEsYUFBUjs7QUFDVixRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztBQUNYLFNBQUEsR0FBWSxPQUFBLENBQVEsYUFBUjs7QUFFTjtJQUVDLGVBQUMsS0FBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsUUFBRDtRQUVBLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBQyxDQUFBLEtBQUssQ0FBQztRQUNoQixJQUFDLENBQUEsUUFBRCxHQUFZO1FBRVosSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLGFBQUosQ0FBa0IsT0FBbEIsRUFBMEIsSUFBQyxDQUFBLEtBQTNCLEVBQWtDLElBQWxDO1FBRVQsRUFBQSxHQUFLO0FBQ0wsYUFBUywwQkFBVDtZQUNJLElBQUEsR0FDQSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxJQUFDLENBQUEsT0FBRCxDQUFTLEVBQVQsQ0FBZjtZQUNBLEVBQUEsSUFBTTtBQUhWO0FBS0E7QUFBQSxhQUFBLHNDQUFBOztZQUNJLEdBQUcsQ0FBQyxNQUFKLEdBQWEsSUFBQyxDQUFBO0FBRGxCO0FBRUE7QUFBQSxhQUFBLHdDQUFBOztZQUNJLEdBQUcsQ0FBQyxNQUFKLEdBQWE7QUFEakI7QUFFQTtBQUFBLGFBQUEsd0NBQUE7O1lBQ0ksR0FBRyxDQUFDLE1BQUosR0FBYTtBQURqQjtJQWpCRDs7b0JBb0JILE9BQUEsR0FBUyxTQUFDLEVBQUQ7QUFFTCxZQUFBO1FBQUEsSUFBQSxHQUFPO0FBQ1AsYUFBUyx5QkFBVDtZQUNJLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxTQUFKLENBQWMsSUFB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RUFBOEIsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQXZCLENBQUEsQ0FBOUI7Z0JBRUEsSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLENBQVYsR0FBZSxJQUFDLENBQUEsT0FBRCxDQUFTLENBQVQ7QUFFZjtBQUFBLHFCQUFBLHlDQUFBOztvQkFDSSxHQUFHLENBQUMsTUFBSixHQUFhLElBQUMsQ0FBQTtBQURsQjtBQUVBO0FBQUEscUJBQUEsMkNBQUE7O29CQUNJLEdBQUcsQ0FBQyxNQUFKLEdBQWE7QUFEakI7QUFFQTtBQUFBO3FCQUFBLDJDQUFBOztrQ0FDSSxHQUFHLENBQUMsTUFBSixHQUFhO0FBRGpCO2dDQTVCSjthQXJDSjs7SUFaSTs7Ozs7O0FBZ0ZaLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICBcbjAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgXG4gICAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgIFxuMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDBcbiMjI1xuXG57IFNwYWNlLCBUcmFuc2Zvcm1Ob2RlIH0gPSByZXF1aXJlICdiYWJ5bG9uanMnXG57IGtsb2cgfSA9IHJlcXVpcmUgJ2t4aydcbnsgcmFuZG9tIH0gPSBNYXRoXG57IHZlYyB9ID0gcmVxdWlyZSAnLi9wb2x5L21hdGgnXG5nZW5lcmF0ZSA9IHJlcXVpcmUgJy4vcG9seS9nZW5lcmF0ZSdcbkRpbWVuc2lvbiA9IHJlcXVpcmUgJy4vZGltZW5zaW9uJ1xuXG5jbGFzcyBTcGFjZVxuXG4gICAgQDogKEB3b3JsZCkgLT5cblxuICAgICAgICBAc2NlbmUgPSBAd29ybGQuc2NlbmVcbiAgICAgICAgQGRpbXN0YWNrID0gW11cbiAgICAgICAgXG4gICAgICAgIEB0cmFucyA9IG5ldyBUcmFuc2Zvcm1Ob2RlICd0cmFucycgQHNjZW5lLCB0cnVlXG4gICAgICAgIFxuICAgICAgICBzeiA9IDFcbiAgICAgICAgZm9yIGQgaW4gWzAuLjJdXG4gICAgICAgICAgICBkaW1zID0gXG4gICAgICAgICAgICBAZGltc3RhY2sucHVzaCBAbmV3RGltcyBzelxuICAgICAgICAgICAgc3ogKj0gMTAwXG4gICAgICAgICAgICBcbiAgICAgICAgZm9yIGRpbSBpbiBAZGltc3RhY2tbMF1cbiAgICAgICAgICAgIGRpbS5wYXJlbnQgPSBAdHJhbnNcbiAgICAgICAgZm9yIGRpbSBpbiBAZGltc3RhY2tbMV1cbiAgICAgICAgICAgIGRpbS5wYXJlbnQgPSBudWxsXG4gICAgICAgIGZvciBkaW0gaW4gQGRpbXN0YWNrWzJdXG4gICAgICAgICAgICBkaW0ucGFyZW50ID0gbnVsbFxuICAgICAgICAgICAgXG4gICAgbmV3RGltczogKHN6KSAtPlxuICAgICAgICBcbiAgICAgICAgZGltcyA9IFtdXG4gICAgICAgIGZvciBpIGluIFswLi4uOF1cbiAgICAgICAgICAgIGRpbXMucHVzaCBuZXcgRGltZW5zaW9uIEB3b3JsZCwgc3osIHZlYyAyKnN6KihpJTIpLCAyKnN6KigoaT4+MSklMiksIDIqc3oqKChpPj4yKSUyKVxuICAgICAgICAgICAgZGltc1stMV0ubmFtZSA9IFwiZGltXyN7aX1cIlxuICAgICAgICBkaW1zICAgICAgICBcbiAgICAgICAgXG4gICAgcmVuZGVyOiAtPlxuICAgICAgICBcbiAgICAgICAgY2FtcG9zID0gdmVjIEB3b3JsZC5jYW1lcmEucG9zaXRpb25cbiAgICAgICAgb2xkRGlzdGFuY2UgPSBAZGlzdGFuY2VcbiAgICAgICAgXG4gICAgICAgIHN3YXBEaXN0ID0gMTkwMDBcbiAgICAgICAgXG4gICAgICAgIEBkaXN0YW5jZSA9IGNhbXBvcy5sZW5ndGgoKVxuICAgICAgICBAZGlzdEZhY3RvciA9IEBkaXN0YW5jZSAvIHN3YXBEaXN0XG4gICAgICAgIFxuICAgICAgICBrbG9nICdkaXN0YW5jZScgQGRpc3RhbmNlXG4gICAgICAgIFxuICAgICAgICBpZiBAZGlzdGFuY2UgPj0gc3dhcERpc3RcbiAgICAgICAgICAgIGlmIG9sZERpc3RhbmNlIDwgc3dhcERpc3RcbiAgICAgICAgICAgICAgICBrbG9nICdkaXN0YW5jZScgQGRpc3RhbmNlLCAnZGlzdEZhY3RvcicgQGRpc3RGYWN0b3JcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgbG93IGluIEBkaW1zdGFja1swXVxuICAgICAgICAgICAgICAgICAgICBsb3cuZGVsKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgaGlnaCBpbiBAZGltc3RhY2tbMV1cbiAgICAgICAgICAgICAgICAgICAgaGlnaC5zY2FsZURvd24oKVxuXG4gICAgICAgICAgICAgICAgZm9yIGhpZ2ggaW4gQGRpbXN0YWNrWzJdXG4gICAgICAgICAgICAgICAgICAgIGhpZ2guc2NhbGVEb3duKClcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQGRpbXN0YWNrWzBdID0gQGRpbXN0YWNrWzFdXG4gICAgICAgICAgICAgICAgQGRpbXN0YWNrWzFdID0gQGRpbXN0YWNrWzJdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEB3b3JsZC5jYW1lcmEuc2NhbGVEb3duKClcbiAgICAgICAgICAgICAgICBAZGlzdGFuY2UgKj0gMC4wMVxuICAgICAgICAgICAgICAgIEBkaXN0RmFjdG9yID0gQGRpc3RhbmNlIC8gc3dhcERpc3RcbiAgICAgICAgICAgICAgICBrbG9nICduZXdEaXN0YW5jZScgQGRpc3RhbmNlLCBAd29ybGQuY2FtZXJhLnBvc2l0aW9uLmxlbmd0aCgpXG4gICAgICAgICAgICAgICAgQGRpbXN0YWNrWzJdID0gQG5ld0RpbXMgMTAwMDBcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgZGltIGluIEBkaW1zdGFja1swXVxuICAgICAgICAgICAgICAgICAgICBkaW0ucGFyZW50ID0gQHRyYW5zXG4gICAgICAgICAgICAgICAgZm9yIGRpbSBpbiBAZGltc3RhY2tbMV1cbiAgICAgICAgICAgICAgICAgICAgZGltLnBhcmVudCA9IG51bGxcbiAgICAgICAgICAgICAgICBmb3IgZGltIGluIEBkaW1zdGFja1syXVxuICAgICAgICAgICAgICAgICAgICBkaW0ucGFyZW50ID0gbnVsbFxuICAgICAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZGltc3RhY2tbMV0uc29ydCAoYSxiKSAtPlxuICAgICAgICAgICAgICAgIGNhbXBvcy50byhhLnBvc2l0aW9uKS5sZW5ndGgoKS1jYW1wb3MudG8oYi5wb3NpdGlvbikubGVuZ3RoKClcbiAgICAgICAgICAgIEB0cmFucy5wb3NpdGlvbi5jb3B5RnJvbSBAZGltc3RhY2tbMV1bMF0ucG9zaXRpb25cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQGRpc3RhbmNlID0gY2FtcG9zLnRvKEBkaW1zdGFja1sxXVswXS5wb3NpdGlvbikubGVuZ3RoKClcbiAgICAgICAgICAgIEBkaXN0RmFjdG9yID0gQGRpc3RhbmNlIC8gc3dhcERpc3RcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgQGRpc3RhbmNlIDwgc3dhcERpc3QvMTAwIGFuZCBvbGREaXN0YW5jZSA+IHN3YXBEaXN0LzEwMFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAga2xvZyAnZGlzdGFuY2UnIEBkaXN0YW5jZSwgJ2Rpc3RGYWN0b3InIEBkaXN0RmFjdG9yXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gdmVjIEBkaW1zdGFja1sxXVswXS5wb3NpdGlvblxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGZvciBoaWdoIGluIEBkaW1zdGFja1syXVxuICAgICAgICAgICAgICAgICAgICBoaWdoLmRlbCgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yIGxvdyBpbiBAZGltc3RhY2tbMV1cbiAgICAgICAgICAgICAgICAgICAgbG93LnNjYWxlVXAgb2Zmc2V0XG5cbiAgICAgICAgICAgICAgICBmb3IgbG93IGluIEBkaW1zdGFja1swXVxuICAgICAgICAgICAgICAgICAgICBsb3cuc2NhbGVVcCBvZmZzZXRcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQGRpbXN0YWNrWzJdID0gQGRpbXN0YWNrWzFdXG4gICAgICAgICAgICAgICAgQGRpbXN0YWNrWzFdID0gQGRpbXN0YWNrWzBdXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgQHdvcmxkLmNhbWVyYS5zY2FsZVVwIG9mZnNldFxuICAgICAgICAgICAgICAgIEBkaXN0YW5jZSAqPSAxMDBcbiAgICAgICAgICAgICAgICBAZGlzdEZhY3RvciA9IEBkaXN0YW5jZSAvIHN3YXBEaXN0XG4gICAgICAgICAgICAgICAga2xvZyAnbmV3RGlzdGFuY2UnIEBkaXN0YW5jZSwgQHdvcmxkLmNhbWVyYS5wb3NpdGlvbi5sZW5ndGgoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIEBkaW1zdGFja1swXSA9IEBuZXdEaW1zIDFcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBmb3IgZGltIGluIEBkaW1zdGFja1swXVxuICAgICAgICAgICAgICAgICAgICBkaW0ucGFyZW50ID0gQHRyYW5zXG4gICAgICAgICAgICAgICAgZm9yIGRpbSBpbiBAZGltc3RhY2tbMV1cbiAgICAgICAgICAgICAgICAgICAgZGltLnBhcmVudCA9IG51bGxcbiAgICAgICAgICAgICAgICBmb3IgZGltIGluIEBkaW1zdGFja1syXVxuICAgICAgICAgICAgICAgICAgICBkaW0ucGFyZW50ID0gbnVsbFxuICAgICAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFNwYWNlXG4iXX0=
//# sourceURL=../coffee/space.coffee