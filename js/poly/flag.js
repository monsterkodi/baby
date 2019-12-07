// koffee 1.6.0

/*
00000000  000       0000000    0000000 
000       000      000   000  000      
000000    000      000000000  000  0000
000       000      000   000  000   000
000       0000000  000   000   0000000
 */
var Flag, Polyhedron, kerror;

kerror = require('kxk').kerror;

Polyhedron = require('./polyhedron');

Flag = (function() {
    function Flag() {
        this.flags = {};
        this.vertices = {};
    }

    Flag.prototype.newV = function(vertName, coordinates) {
        if (!this.vertices[vertName]) {
            return this.vertices[vertName] = coordinates;
        }
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
        var ctr, face, faceCount, i, j, newFace, nm2idx, poly, ref, ref1, v, v0, vN;
        if (name == null) {
            name = 'polyhedron';
        }
        poly = new Polyhedron(name);
        nm2idx = {};
        ctr = 0;
        ref = this.vertices;
        for (name in ref) {
            v = ref[name];
            poly.vertices[ctr] = this.vertices[name];
            nm2idx[name] = ctr++;
        }
        ctr = 0;
        ref1 = this.flags;
        for (i in ref1) {
            face = ref1[i];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhZy5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBVUUsU0FBVyxPQUFBLENBQVEsS0FBUjs7QUFDYixVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0FBRVA7SUFFQyxjQUFBO1FBQ0MsSUFBQyxDQUFBLEtBQUQsR0FBWTtRQUNaLElBQUMsQ0FBQSxRQUFELEdBQVk7SUFGYjs7bUJBSUgsSUFBQSxHQUFNLFNBQUMsUUFBRCxFQUFXLFdBQVg7UUFFRixJQUFHLENBQUksSUFBQyxDQUFBLFFBQVMsQ0FBQSxRQUFBLENBQWpCO21CQUNJLElBQUMsQ0FBQSxRQUFTLENBQUEsUUFBQSxDQUFWLEdBQXNCLFlBRDFCOztJQUZFOzttQkFLTixPQUFBLEdBQVMsU0FBQyxRQUFELEVBQVcsU0FBWCxFQUFzQixTQUF0QjtBQUVMLFlBQUE7O2dCQUFPLENBQUEsUUFBQTs7Z0JBQUEsQ0FBQSxRQUFBLElBQWE7O2VBQ3BCLElBQUMsQ0FBQSxLQUFNLENBQUEsUUFBQSxDQUFVLENBQUEsU0FBQSxDQUFqQixHQUE4QjtJQUh6Qjs7bUJBS1QsTUFBQSxHQUFRLFNBQUMsSUFBRDtBQUVKLFlBQUE7O1lBRkssT0FBSzs7UUFFVixJQUFBLEdBQU8sSUFBSSxVQUFKLENBQWUsSUFBZjtRQUVQLE1BQUEsR0FBUztRQUNULEdBQUEsR0FBTTtBQUNOO0FBQUEsYUFBQSxXQUFBOztZQUNJLElBQUksQ0FBQyxRQUFTLENBQUEsR0FBQSxDQUFkLEdBQXFCLElBQUMsQ0FBQSxRQUFTLENBQUEsSUFBQTtZQUMvQixNQUFPLENBQUEsSUFBQSxDQUFQLEdBQWUsR0FBQTtBQUZuQjtRQU1BLEdBQUEsR0FBTTtBQUNOO0FBQUEsYUFBQSxTQUFBOztZQUNJLE9BQUEsR0FBVTtBQUNWLGlCQUFBLFNBQUE7O2dCQUNJLEVBQUEsR0FBSztBQUNMO0FBRko7WUFJQSxPQUFPLENBQUMsSUFBUixDQUFhLE1BQU8sQ0FBQSxFQUFBLENBQXBCO1lBQ0EsRUFBQSxHQUFLLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFHLENBQUEsRUFBQTtZQUNmLFNBQUEsR0FBWTtBQUNaLG1CQUFNLEVBQUEsS0FBTSxFQUFaO2dCQUNJLE9BQU8sQ0FBQyxJQUFSLENBQWEsTUFBTyxDQUFBLEVBQUEsQ0FBcEI7Z0JBQ0EsRUFBQSxHQUFLLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFHLENBQUEsRUFBQTtnQkFDZixJQUFHLFNBQUEsRUFBQSxHQUFjLEdBQWpCO29CQUNJLE1BQUEsQ0FBTyxpQ0FBUCxFQUF5QyxDQUF6QyxFQUE0QyxJQUFDLENBQUEsS0FBTSxDQUFBLENBQUEsQ0FBbkQ7QUFDQSwwQkFGSjs7WUFISjtZQU1BLElBQUksQ0FBQyxLQUFNLENBQUEsR0FBQSxDQUFYLEdBQWtCO1lBQ2xCLEdBQUE7QUFoQko7ZUFvQkE7SUFqQ0k7Ozs7OztBQW1DWixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgXG4wMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICBcbjAwMDAwMCAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCBcbiMjI1xuI1xuIyBQb2x5aMOpZHJvbmlzbWUsIENvcHlyaWdodCAyMDE5LCBBbnNlbG0gTGV2c2theWEsIE1JVCBMaWNlbnNlXG5cbnsga2Vycm9yIH0gPSByZXF1aXJlICdreGsnXG5Qb2x5aGVkcm9uID0gcmVxdWlyZSAnLi9wb2x5aGVkcm9uJ1xuXG5jbGFzcyBGbGFnXG4gICAgXG4gICAgQDogLT5cbiAgICAgICAgQGZsYWdzICAgID0ge30gIyBbZmFjZV1bdmVydGV4XSAtPiBuZXh0IHZlcnRleFxuICAgICAgICBAdmVydGljZXMgPSB7fSAjIFtuYW1lXSAtPiBjb29yZGluYXRlc1xuICBcbiAgICBuZXdWOiAodmVydE5hbWUsIGNvb3JkaW5hdGVzKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbm90IEB2ZXJ0aWNlc1t2ZXJ0TmFtZV1cbiAgICAgICAgICAgIEB2ZXJ0aWNlc1t2ZXJ0TmFtZV0gPSBjb29yZGluYXRlc1xuICBcbiAgICBuZXdGbGFnOiAoZmFjZU5hbWUsIHZlcnROYW1lMSwgdmVydE5hbWUyKSAtPlxuICAgICAgICBcbiAgICAgICAgQGZsYWdzW2ZhY2VOYW1lXSA/PSB7fVxuICAgICAgICBAZmxhZ3NbZmFjZU5hbWVdW3ZlcnROYW1lMV0gPSB2ZXJ0TmFtZTJcbiAgXG4gICAgdG9wb2x5OiAobmFtZT0ncG9seWhlZHJvbicpIC0+XG5cbiAgICAgICAgcG9seSA9IG5ldyBQb2x5aGVkcm9uIG5hbWVcbiAgICBcbiAgICAgICAgbm0yaWR4ID0ge31cbiAgICAgICAgY3RyID0gMFxuICAgICAgICBmb3IgbmFtZSx2IG9mIEB2ZXJ0aWNlc1xuICAgICAgICAgICAgcG9seS52ZXJ0aWNlc1tjdHJdID0gQHZlcnRpY2VzW25hbWVdXG4gICAgICAgICAgICBubTJpZHhbbmFtZV0gPSBjdHIrKyAjIG51bWJlciB0aGUgdmVydGljZXNcbiAgICAgICAgICAgIFxuICAgICAgICAjIGtsb2cgJ3RvcG9seScgQFxuICAgICAgICAgICAgXG4gICAgICAgIGN0ciA9IDBcbiAgICAgICAgZm9yIGksZmFjZSBvZiBAZmxhZ3NcbiAgICAgICAgICAgIG5ld0ZhY2UgPSBbXVxuICAgICAgICAgICAgZm9yIGosdjAgb2YgZmFjZVxuICAgICAgICAgICAgICAgIHZOID0gdjAgIyBhbnkgdmVydGV4IGFzIHN0YXJ0aW5nIHBvaW50XG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgbmV3RmFjZS5wdXNoIG5tMmlkeFt2Tl0gIyByZWNvcmQgaW5kZXhcbiAgICAgICAgICAgIHZOID0gQGZsYWdzW2ldW3ZOXSAjIGdvdG8gbmV4dCB2ZXJ0ZXhcbiAgICAgICAgICAgIGZhY2VDb3VudCA9IDBcbiAgICAgICAgICAgIHdoaWxlIHZOICE9IHYwICMgbG9vcCB1bnRpbCBiYWNrIHRvIHN0YXJ0XG4gICAgICAgICAgICAgICAgbmV3RmFjZS5wdXNoIG5tMmlkeFt2Tl1cbiAgICAgICAgICAgICAgICB2TiA9IEBmbGFnc1tpXVt2Tl1cbiAgICAgICAgICAgICAgICBpZiBmYWNlQ291bnQrKyA+IDEwMCAjIHByZXZlbnQgaW5maW5pdGUgbG9vcFxuICAgICAgICAgICAgICAgICAgICBrZXJyb3IgXCJCYWQgZmxhZyB3aXRoIG5ldmVyZW5kaW5nIGZhY2U6XCIgaSwgQGZsYWdzW2ldXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBwb2x5LmZhY2VzW2N0cl0gPSBuZXdGYWNlXG4gICAgICAgICAgICBjdHIrK1xuICAgICAgICAgICAgXG4gICAgICAgICMga2xvZyAncG9seScgcG9seVxuICAgICAgICBcbiAgICAgICAgcG9seVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZsYWdcbiJdfQ==
//# sourceURL=../../coffee/poly/flag.coffee