// koffee 1.7.0

/*
00000000  000       0000000    0000000 
000       000      000   000  000      
000000    000      000000000  000  0000
000       000      000   000  000   000
000       0000000  000   000   0000000
 */
var Flag, Polyhedron, kerror, mag, ref, sub;

kerror = require('kxk').kerror;

ref = require('./math'), mag = ref.mag, sub = ref.sub;

Polyhedron = require('./polyhedron');

Flag = (function() {
    function Flag() {
        this.flags = {};
        this.vertices = {};
    }

    Flag.prototype.vert = function(vertName, coords) {
        var diff;
        if (!this.vertices[vertName]) {
            this.vertices[vertName] = coords;
        } else {
            diff = sub(coords, this.vertices[vertName]);
            if (mag(diff) > 0.02) {
                return true;
            }
        }
        return false;
    };

    Flag.prototype.edge = function(faceName, vertName1, vertName2) {
        var base;
        if ((base = this.flags)[faceName] != null) {
            base[faceName];
        } else {
            base[faceName] = {};
        }
        return this.flags[faceName][vertName1] = vertName2;
    };

    Flag.prototype.topoly = function(name) {
        var ctr, face, faceCount, i, j, newFace, nm2idx, poly, ref1, ref2, v, v0, vN;
        if (name == null) {
            name = 'polyhedron';
        }
        poly = new Polyhedron(name);
        nm2idx = {};
        ctr = 0;
        ref1 = this.vertices;
        for (name in ref1) {
            v = ref1[name];
            poly.vertex[ctr] = this.vertices[name];
            nm2idx[name] = ctr++;
        }
        ctr = 0;
        ref2 = this.flags;
        for (i in ref2) {
            face = ref2[i];
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
            poly.face[ctr] = newFace;
            ctr++;
        }
        return poly;
    };

    return Flag;

})();

module.exports = Flag;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhZy5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBVUUsU0FBVyxPQUFBLENBQVEsS0FBUjs7QUFDYixNQUFlLE9BQUEsQ0FBUSxRQUFSLENBQWYsRUFBRSxhQUFGLEVBQU87O0FBRVAsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztBQUVQO0lBRUMsY0FBQTtRQUNDLElBQUMsQ0FBQSxLQUFELEdBQVk7UUFDWixJQUFDLENBQUEsUUFBRCxHQUFZO0lBRmI7O21CQUlILElBQUEsR0FBTSxTQUFDLFFBQUQsRUFBVyxNQUFYO0FBQ0YsWUFBQTtRQUFBLElBQUcsQ0FBSSxJQUFDLENBQUEsUUFBUyxDQUFBLFFBQUEsQ0FBakI7WUFDSSxJQUFDLENBQUEsUUFBUyxDQUFBLFFBQUEsQ0FBVixHQUFzQixPQUQxQjtTQUFBLE1BQUE7WUFHSSxJQUFBLEdBQU8sR0FBQSxDQUFJLE1BQUosRUFBWSxJQUFDLENBQUEsUUFBUyxDQUFBLFFBQUEsQ0FBdEI7WUFDUCxJQUFHLEdBQUEsQ0FBSSxJQUFKLENBQUEsR0FBWSxJQUFmO0FBQ0ksdUJBQU8sS0FEWDthQUpKOztlQU1BO0lBUEU7O21CQVNOLElBQUEsR0FBTSxTQUFDLFFBQUQsRUFBVyxTQUFYLEVBQXNCLFNBQXRCO0FBRUYsWUFBQTs7Z0JBQU8sQ0FBQSxRQUFBOztnQkFBQSxDQUFBLFFBQUEsSUFBYTs7ZUFDcEIsSUFBQyxDQUFBLEtBQU0sQ0FBQSxRQUFBLENBQVUsQ0FBQSxTQUFBLENBQWpCLEdBQThCO0lBSDVCOzttQkFLTixNQUFBLEdBQVEsU0FBQyxJQUFEO0FBRUosWUFBQTs7WUFGSyxPQUFLOztRQUVWLElBQUEsR0FBTyxJQUFJLFVBQUosQ0FBZSxJQUFmO1FBRVAsTUFBQSxHQUFTO1FBQ1QsR0FBQSxHQUFNO0FBQ047QUFBQSxhQUFBLFlBQUE7O1lBQ0ksSUFBSSxDQUFDLE1BQU8sQ0FBQSxHQUFBLENBQVosR0FBbUIsSUFBQyxDQUFBLFFBQVMsQ0FBQSxJQUFBO1lBQzdCLE1BQU8sQ0FBQSxJQUFBLENBQVAsR0FBZSxHQUFBO0FBRm5CO1FBSUEsR0FBQSxHQUFNO0FBQ047QUFBQSxhQUFBLFNBQUE7O1lBQ0ksT0FBQSxHQUFVO0FBQ1YsaUJBQUEsU0FBQTs7Z0JBQ0ksRUFBQSxHQUFLO0FBQ0w7QUFGSjtZQUlBLE9BQU8sQ0FBQyxJQUFSLENBQWEsTUFBTyxDQUFBLEVBQUEsQ0FBcEI7WUFDQSxFQUFBLEdBQUssSUFBQyxDQUFBLEtBQU0sQ0FBQSxDQUFBLENBQUcsQ0FBQSxFQUFBO1lBQ2YsU0FBQSxHQUFZO0FBQ1osbUJBQU0sRUFBQSxLQUFNLEVBQVo7Z0JBQ0ksT0FBTyxDQUFDLElBQVIsQ0FBYSxNQUFPLENBQUEsRUFBQSxDQUFwQjtnQkFDQSxFQUFBLEdBQUssSUFBQyxDQUFBLEtBQU0sQ0FBQSxDQUFBLENBQUcsQ0FBQSxFQUFBO2dCQUNmLElBQUcsU0FBQSxFQUFBLEdBQWMsR0FBakI7b0JBQ0ksTUFBQSxDQUFPLGlDQUFQLEVBQXlDLENBQXpDLEVBQTRDLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFuRDtBQUNBLDBCQUZKOztZQUhKO1lBTUEsSUFBSSxDQUFDLElBQUssQ0FBQSxHQUFBLENBQVYsR0FBaUI7WUFDakIsR0FBQTtBQWhCSjtlQWtCQTtJQTdCSTs7Ozs7O0FBK0JaLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCBcbjAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwXG4wMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMCAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwIFxuIyMjXG5cbiMgUG9seWjDqWRyb25pc21lLCBDb3B5cmlnaHQgMjAxOSwgQW5zZWxtIExldnNrYXlhLCBNSVQgTGljZW5zZVxuXG57IGtlcnJvciB9ID0gcmVxdWlyZSAna3hrJ1xueyBtYWcsIHN1YiB9ID0gcmVxdWlyZSAnLi9tYXRoJ1xuXG5Qb2x5aGVkcm9uID0gcmVxdWlyZSAnLi9wb2x5aGVkcm9uJ1xuXG5jbGFzcyBGbGFnXG4gICAgXG4gICAgQDogLT5cbiAgICAgICAgQGZsYWdzICAgID0ge30gIyBbZmFjZV1bdmVydGV4XSAtPiBuZXh0IHZlcnRleFxuICAgICAgICBAdmVydGljZXMgPSB7fSAjIFtuYW1lXSAtPiBjb29yZGluYXRlc1xuICBcbiAgICB2ZXJ0OiAodmVydE5hbWUsIGNvb3JkcykgLT5cbiAgICAgICAgaWYgbm90IEB2ZXJ0aWNlc1t2ZXJ0TmFtZV1cbiAgICAgICAgICAgIEB2ZXJ0aWNlc1t2ZXJ0TmFtZV0gPSBjb29yZHNcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgZGlmZiA9IHN1YiBjb29yZHMsIEB2ZXJ0aWNlc1t2ZXJ0TmFtZV1cbiAgICAgICAgICAgIGlmIG1hZyhkaWZmKSA+IDAuMDJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICBmYWxzZVxuICBcbiAgICBlZGdlOiAoZmFjZU5hbWUsIHZlcnROYW1lMSwgdmVydE5hbWUyKSAtPlxuICAgICAgICBcbiAgICAgICAgQGZsYWdzW2ZhY2VOYW1lXSA/PSB7fVxuICAgICAgICBAZmxhZ3NbZmFjZU5hbWVdW3ZlcnROYW1lMV0gPSB2ZXJ0TmFtZTJcbiAgXG4gICAgdG9wb2x5OiAobmFtZT0ncG9seWhlZHJvbicpIC0+XG5cbiAgICAgICAgcG9seSA9IG5ldyBQb2x5aGVkcm9uIG5hbWVcbiAgICBcbiAgICAgICAgbm0yaWR4ID0ge31cbiAgICAgICAgY3RyID0gMFxuICAgICAgICBmb3IgbmFtZSx2IG9mIEB2ZXJ0aWNlc1xuICAgICAgICAgICAgcG9seS52ZXJ0ZXhbY3RyXSA9IEB2ZXJ0aWNlc1tuYW1lXVxuICAgICAgICAgICAgbm0yaWR4W25hbWVdID0gY3RyKytcbiAgICAgICAgICAgIFxuICAgICAgICBjdHIgPSAwXG4gICAgICAgIGZvciBpLGZhY2Ugb2YgQGZsYWdzXG4gICAgICAgICAgICBuZXdGYWNlID0gW11cbiAgICAgICAgICAgIGZvciBqLHYwIG9mIGZhY2VcbiAgICAgICAgICAgICAgICB2TiA9IHYwICMgYW55IHZlcnRleCBhcyBzdGFydGluZyBwb2ludFxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIG5ld0ZhY2UucHVzaCBubTJpZHhbdk5dXG4gICAgICAgICAgICB2TiA9IEBmbGFnc1tpXVt2Tl0gIyBuZXh0IHZlcnRleFxuICAgICAgICAgICAgZmFjZUNvdW50ID0gMFxuICAgICAgICAgICAgd2hpbGUgdk4gIT0gdjBcbiAgICAgICAgICAgICAgICBuZXdGYWNlLnB1c2ggbm0yaWR4W3ZOXVxuICAgICAgICAgICAgICAgIHZOID0gQGZsYWdzW2ldW3ZOXVxuICAgICAgICAgICAgICAgIGlmIGZhY2VDb3VudCsrID4gMTAwICMgcHJldmVudCBpbmZpbml0ZSBsb29wXG4gICAgICAgICAgICAgICAgICAgIGtlcnJvciBcIkJhZCBmbGFnIHdpdGggbmV2ZXJlbmRpbmcgZmFjZTpcIiBpLCBAZmxhZ3NbaV1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIHBvbHkuZmFjZVtjdHJdID0gbmV3RmFjZVxuICAgICAgICAgICAgY3RyKytcbiAgICAgICAgICAgIFxuICAgICAgICBwb2x5XG5cbm1vZHVsZS5leHBvcnRzID0gRmxhZ1xuIl19
//# sourceURL=../../coffee/poly/flag.coffee