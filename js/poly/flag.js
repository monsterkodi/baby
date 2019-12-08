// koffee 1.6.0

/*
00000000  000       0000000    0000000 
000       000      000   000  000      
000000    000      000000000  000  0000
000       000      000   000  000   000
000       0000000  000   000   0000000
 */
var Flag, Polyhedron, add, kerror, klog, mag, mult, ref, ref1, sub;

ref = require('kxk'), kerror = ref.kerror, klog = ref.klog;

ref1 = require('./math'), mag = ref1.mag, add = ref1.add, sub = ref1.sub, mult = ref1.mult;

Polyhedron = require('./polyhedron');

Flag = (function() {
    function Flag() {
        this.flags = {};
        this.vertices = {};
    }

    Flag.prototype.newV = function(vertName, coords) {
        var diff;
        if (!this.vertices[vertName]) {
            this.vertices[vertName] = coords;
        } else {
            diff = sub(coords, this.vertices[vertName]);
            if (mag(diff) > 0.0001) {
                klog("" + vertName, mag(diff));
                return true;
            }
        }
        return false;
    };

    Flag.prototype.newFlag = function(faceName, vertName1, vertName2) {
        var base;
        if ((base = this.flags)[faceName] != null) {
            base[faceName];
        } else {
            base[faceName] = {};
        }
        return this.flags[faceName][vertName1] = vertName2;
    };

    Flag.prototype.topoly = function(name) {
        var ctr, face, faceCount, i, j, newFace, nm2idx, poly, ref2, ref3, v, v0, vN;
        if (name == null) {
            name = 'polyhedron';
        }
        poly = new Polyhedron(name);
        nm2idx = {};
        ctr = 0;
        ref2 = this.vertices;
        for (name in ref2) {
            v = ref2[name];
            poly.vertices[ctr] = this.vertices[name];
            nm2idx[name] = ctr++;
        }
        ctr = 0;
        ref3 = this.flags;
        for (i in ref3) {
            face = ref3[i];
            newFace = [];
            for (j in face) {
                v0 = face[j];
                vN = v0;
                break;
            }
            newFace.push(nm2idx[vN]);
            vN = this.flags[i][vN];
            faceCount = 0;
            while (vN !== v0) {
                newFace.push(nm2idx[vN]);
                vN = this.flags[i][vN];
                if (faceCount++ > 100) {
                    kerror("Bad flag with neverending face:", i, this.flags[i]);
                    break;
                }
            }
            poly.faces[ctr] = newFace;
            ctr++;
        }
        return poly;
    };

    return Flag;

})();

module.exports = Flag;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhZy5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBVUEsTUFBbUIsT0FBQSxDQUFRLEtBQVIsQ0FBbkIsRUFBRSxtQkFBRixFQUFVOztBQUNWLE9BQTBCLE9BQUEsQ0FBUSxRQUFSLENBQTFCLEVBQUUsY0FBRixFQUFPLGNBQVAsRUFBWSxjQUFaLEVBQWlCOztBQUNqQixVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0FBRVA7SUFFQyxjQUFBO1FBQ0MsSUFBQyxDQUFBLEtBQUQsR0FBWTtRQUNaLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFGYjs7bUJBSUgsSUFBQSxHQUFNLFNBQUMsUUFBRCxFQUFXLE1BQVg7QUFDRixZQUFBO1FBQUEsSUFBRyxDQUFJLElBQUMsQ0FBQSxRQUFTLENBQUEsUUFBQSxDQUFqQjtZQUNJLElBQUMsQ0FBQSxRQUFTLENBQUEsUUFBQSxDQUFWLEdBQXNCLE9BRDFCO1NBQUEsTUFBQTtZQUdJLElBQUEsR0FBTyxHQUFBLENBQUksTUFBSixFQUFZLElBQUMsQ0FBQSxRQUFTLENBQUEsUUFBQSxDQUF0QjtZQUNQLElBQUcsR0FBQSxDQUFJLElBQUosQ0FBQSxHQUFZLE1BQWY7Z0JBQ0ksSUFBQSxDQUFLLEVBQUEsR0FBRyxRQUFSLEVBQW1CLEdBQUEsQ0FBSSxJQUFKLENBQW5CO0FBQ0EsdUJBQU8sS0FGWDthQUpKOztlQU9BO0lBUkU7O21CQVdOLE9BQUEsR0FBUyxTQUFDLFFBQUQsRUFBVyxTQUFYLEVBQXNCLFNBQXRCO0FBRUwsWUFBQTs7Z0JBQU8sQ0FBQSxRQUFBOztnQkFBQSxDQUFBLFFBQUEsSUFBYTs7ZUFDcEIsSUFBQyxDQUFBLEtBQU0sQ0FBQSxRQUFBLENBQVUsQ0FBQSxTQUFBLENBQWpCLEdBQThCO0lBSHpCOzttQkFLVCxNQUFBLEdBQVEsU0FBQyxJQUFEO0FBRUosWUFBQTs7WUFGSyxPQUFLOztRQUVWLElBQUEsR0FBTyxJQUFJLFVBQUosQ0FBZSxJQUFmO1FBRVAsTUFBQSxHQUFTO1FBQ1QsR0FBQSxHQUFNO0FBQ047QUFBQSxhQUFBLFlBQUE7O1lBQ0ksSUFBSSxDQUFDLFFBQVMsQ0FBQSxHQUFBLENBQWQsR0FBcUIsSUFBQyxDQUFBLFFBQVMsQ0FBQSxJQUFBO1lBQy9CLE1BQU8sQ0FBQSxJQUFBLENBQVAsR0FBZSxHQUFBO0FBRm5CO1FBTUEsR0FBQSxHQUFNO0FBQ047QUFBQSxhQUFBLFNBQUE7O1lBQ0ksT0FBQSxHQUFVO0FBQ1YsaUJBQUEsU0FBQTs7Z0JBQ0ksRUFBQSxHQUFLO0FBQ0w7QUFGSjtZQUlBLE9BQU8sQ0FBQyxJQUFSLENBQWEsTUFBTyxDQUFBLEVBQUEsQ0FBcEI7WUFDQSxFQUFBLEdBQUssSUFBQyxDQUFBLEtBQU0sQ0FBQSxDQUFBLENBQUcsQ0FBQSxFQUFBO1lBQ2YsU0FBQSxHQUFZO0FBQ1osbUJBQU0sRUFBQSxLQUFNLEVBQVo7Z0JBQ0ksT0FBTyxDQUFDLElBQVIsQ0FBYSxNQUFPLENBQUEsRUFBQSxDQUFwQjtnQkFDQSxFQUFBLEdBQUssSUFBQyxDQUFBLEtBQU0sQ0FBQSxDQUFBLENBQUcsQ0FBQSxFQUFBO2dCQUNmLElBQUcsU0FBQSxFQUFBLEdBQWMsR0FBakI7b0JBQ0ksTUFBQSxDQUFPLGlDQUFQLEVBQXlDLENBQXpDLEVBQTRDLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFuRDtBQUNBLDBCQUZKOztZQUhKO1lBTUEsSUFBSSxDQUFDLEtBQU0sQ0FBQSxHQUFBLENBQVgsR0FBa0I7WUFDbEIsR0FBQTtBQWhCSjtlQW9CQTtJQWpDSTs7Ozs7O0FBbUNaLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCBcbjAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwXG4wMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMCAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwIFxuIyMjXG4jXG4jIFBvbHlow6lkcm9uaXNtZSwgQ29weXJpZ2h0IDIwMTksIEFuc2VsbSBMZXZza2F5YSwgTUlUIExpY2Vuc2VcblxueyBrZXJyb3IsIGtsb2cgfSA9IHJlcXVpcmUgJ2t4aydcbnsgbWFnLCBhZGQsIHN1YiwgbXVsdCB9ID0gcmVxdWlyZSAnLi9tYXRoJ1xuUG9seWhlZHJvbiA9IHJlcXVpcmUgJy4vcG9seWhlZHJvbidcblxuY2xhc3MgRmxhZ1xuICAgIFxuICAgIEA6IC0+XG4gICAgICAgIEBmbGFncyAgICA9IHt9ICMgW2ZhY2VdW3ZlcnRleF0gLT4gbmV4dCB2ZXJ0ZXhcbiAgICAgICAgQHZlcnRpY2VzID0ge30gIyBbbmFtZV0gLT4gY29vcmRpbmF0ZXNcbiAgXG4gICAgbmV3VjogKHZlcnROYW1lLCBjb29yZHMpIC0+XG4gICAgICAgIGlmIG5vdCBAdmVydGljZXNbdmVydE5hbWVdXG4gICAgICAgICAgICBAdmVydGljZXNbdmVydE5hbWVdID0gY29vcmRzXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRpZmYgPSBzdWIgY29vcmRzLCBAdmVydGljZXNbdmVydE5hbWVdXG4gICAgICAgICAgICBpZiBtYWcoZGlmZikgPiAwLjAwMDFcbiAgICAgICAgICAgICAgICBrbG9nIFwiI3t2ZXJ0TmFtZX1cIiBtYWcgZGlmZlxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgIyBAdmVydGljZXNbdmVydE5hbWVdID0gYWRkIEB2ZXJ0aWNlc1t2ZXJ0TmFtZV0sIG11bHQgMC41IGRpZmZcbiAgXG4gICAgbmV3RmxhZzogKGZhY2VOYW1lLCB2ZXJ0TmFtZTEsIHZlcnROYW1lMikgLT5cbiAgICAgICAgXG4gICAgICAgIEBmbGFnc1tmYWNlTmFtZV0gPz0ge31cbiAgICAgICAgQGZsYWdzW2ZhY2VOYW1lXVt2ZXJ0TmFtZTFdID0gdmVydE5hbWUyXG4gIFxuICAgIHRvcG9seTogKG5hbWU9J3BvbHloZWRyb24nKSAtPlxuXG4gICAgICAgIHBvbHkgPSBuZXcgUG9seWhlZHJvbiBuYW1lXG4gICAgXG4gICAgICAgIG5tMmlkeCA9IHt9XG4gICAgICAgIGN0ciA9IDBcbiAgICAgICAgZm9yIG5hbWUsdiBvZiBAdmVydGljZXNcbiAgICAgICAgICAgIHBvbHkudmVydGljZXNbY3RyXSA9IEB2ZXJ0aWNlc1tuYW1lXVxuICAgICAgICAgICAgbm0yaWR4W25hbWVdID0gY3RyKysgIyBudW1iZXIgdGhlIHZlcnRpY2VzXG4gICAgICAgICAgICBcbiAgICAgICAgIyBrbG9nICd0b3BvbHknIEBcbiAgICAgICAgICAgIFxuICAgICAgICBjdHIgPSAwXG4gICAgICAgIGZvciBpLGZhY2Ugb2YgQGZsYWdzXG4gICAgICAgICAgICBuZXdGYWNlID0gW11cbiAgICAgICAgICAgIGZvciBqLHYwIG9mIGZhY2VcbiAgICAgICAgICAgICAgICB2TiA9IHYwICMgYW55IHZlcnRleCBhcyBzdGFydGluZyBwb2ludFxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIG5ld0ZhY2UucHVzaCBubTJpZHhbdk5dICMgcmVjb3JkIGluZGV4XG4gICAgICAgICAgICB2TiA9IEBmbGFnc1tpXVt2Tl0gIyBnb3RvIG5leHQgdmVydGV4XG4gICAgICAgICAgICBmYWNlQ291bnQgPSAwXG4gICAgICAgICAgICB3aGlsZSB2TiAhPSB2MCAjIGxvb3AgdW50aWwgYmFjayB0byBzdGFydFxuICAgICAgICAgICAgICAgIG5ld0ZhY2UucHVzaCBubTJpZHhbdk5dXG4gICAgICAgICAgICAgICAgdk4gPSBAZmxhZ3NbaV1bdk5dXG4gICAgICAgICAgICAgICAgaWYgZmFjZUNvdW50KysgPiAxMDAgIyBwcmV2ZW50IGluZmluaXRlIGxvb3BcbiAgICAgICAgICAgICAgICAgICAga2Vycm9yIFwiQmFkIGZsYWcgd2l0aCBuZXZlcmVuZGluZyBmYWNlOlwiIGksIEBmbGFnc1tpXVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgcG9seS5mYWNlc1tjdHJdID0gbmV3RmFjZVxuICAgICAgICAgICAgY3RyKytcbiAgICAgICAgICAgIFxuICAgICAgICAjIGtsb2cgJ3BvbHknIHBvbHlcbiAgICAgICAgXG4gICAgICAgIHBvbHlcblxubW9kdWxlLmV4cG9ydHMgPSBGbGFnXG4iXX0=
//# sourceURL=../../coffee/poly/flag.coffee