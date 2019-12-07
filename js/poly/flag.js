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
        this.vertidxs = {};
        this.vertices = {};
    }

    Flag.prototype.newV = function(vertName, coordinates) {
        if (!this.vertidxs[vertName]) {
            this.vertidxs[vertName] = 0;
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
        var ctr, face, faceCount, i, j, newFace, poly, ref, ref1, v, v0;
        if (name == null) {
            name = 'polyhedron';
        }
        poly = new Polyhedron(name);
        ctr = 0;
        ref = this.vertidxs;
        for (i in ref) {
            v = ref[i];
            poly.vertices[ctr] = this.vertices[i];
            this.vertidxs[i] = ctr;
            ctr++;
        }
        ctr = 0;
        ref1 = this.flags;
        for (i in ref1) {
            face = ref1[i];
            newFace = [];
            for (j in face) {
                v0 = face[j];
                v = v0;
                break;
            }
            newFace.push(this.vertidxs[v]);
            v = this.flags[i][v];
            faceCount = 0;
            while (v !== v0) {
                newFace.push(this.vertidxs[v]);
                v = this.flags[i][v];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhZy5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBVUUsU0FBVyxPQUFBLENBQVEsS0FBUjs7QUFDYixVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0FBRVA7SUFFQyxjQUFBO1FBQ0MsSUFBQyxDQUFBLEtBQUQsR0FBWTtRQUNaLElBQUMsQ0FBQSxRQUFELEdBQVk7UUFDWixJQUFDLENBQUEsUUFBRCxHQUFZO0lBSGI7O21CQUtILElBQUEsR0FBTSxTQUFDLFFBQUQsRUFBVyxXQUFYO1FBRUYsSUFBRyxDQUFJLElBQUMsQ0FBQSxRQUFTLENBQUEsUUFBQSxDQUFqQjtZQUNJLElBQUMsQ0FBQSxRQUFTLENBQUEsUUFBQSxDQUFWLEdBQXNCO21CQUN0QixJQUFDLENBQUEsUUFBUyxDQUFBLFFBQUEsQ0FBVixHQUFzQixZQUYxQjs7SUFGRTs7bUJBTU4sT0FBQSxHQUFTLFNBQUMsUUFBRCxFQUFXLFNBQVgsRUFBc0IsU0FBdEI7QUFFTCxZQUFBOztnQkFBTyxDQUFBLFFBQUE7O2dCQUFBLENBQUEsUUFBQSxJQUFhOztlQUNwQixJQUFDLENBQUEsS0FBTSxDQUFBLFFBQUEsQ0FBVSxDQUFBLFNBQUEsQ0FBakIsR0FBOEI7SUFIekI7O21CQUtULE1BQUEsR0FBUSxTQUFDLElBQUQ7QUFFSixZQUFBOztZQUZLLE9BQUs7O1FBRVYsSUFBQSxHQUFPLElBQUksVUFBSixDQUFlLElBQWY7UUFJUCxHQUFBLEdBQU07QUFDTjtBQUFBLGFBQUEsUUFBQTs7WUFDSSxJQUFJLENBQUMsUUFBUyxDQUFBLEdBQUEsQ0FBZCxHQUFxQixJQUFDLENBQUEsUUFBUyxDQUFBLENBQUE7WUFDL0IsSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLENBQVYsR0FBZTtZQUNmLEdBQUE7QUFISjtRQUtBLEdBQUEsR0FBTTtBQUNOO0FBQUEsYUFBQSxTQUFBOztZQUNJLE9BQUEsR0FBVTtBQUNWLGlCQUFBLFNBQUE7O2dCQUNJLENBQUEsR0FBSTtBQUNKO0FBRko7WUFJQSxPQUFPLENBQUMsSUFBUixDQUFhLElBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQSxDQUF2QjtZQUNBLENBQUEsR0FBSSxJQUFDLENBQUEsS0FBTSxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUE7WUFDZCxTQUFBLEdBQVk7QUFDWixtQkFBTSxDQUFBLEtBQUssRUFBWDtnQkFDSSxPQUFPLENBQUMsSUFBUixDQUFhLElBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQSxDQUF2QjtnQkFDQSxDQUFBLEdBQUksSUFBQyxDQUFBLEtBQU0sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBO2dCQUNkLElBQUcsU0FBQSxFQUFBLEdBQWMsR0FBakI7b0JBQ0ksTUFBQSxDQUFPLGlDQUFQLEVBQXlDLENBQXpDLEVBQTRDLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFuRDtBQUNBLDBCQUZKOztZQUhKO1lBTUEsSUFBSSxDQUFDLEtBQU0sQ0FBQSxHQUFBLENBQVgsR0FBa0I7WUFDbEIsR0FBQTtBQWhCSjtlQW9CQTtJQWpDSTs7Ozs7O0FBbUNaLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCBcbjAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwXG4wMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMCAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwIFxuIyMjXG4jXG4jIFBvbHlow6lkcm9uaXNtZSwgQ29weXJpZ2h0IDIwMTksIEFuc2VsbSBMZXZza2F5YSwgTUlUIExpY2Vuc2VcblxueyBrZXJyb3IgfSA9IHJlcXVpcmUgJ2t4aydcblBvbHloZWRyb24gPSByZXF1aXJlICcuL3BvbHloZWRyb24nXG5cbmNsYXNzIEZsYWdcbiAgICBcbiAgICBAOiAtPlxuICAgICAgICBAZmxhZ3MgICAgPSB7fSAjIFtmYWNlXVt2ZXJ0ZXhdIC0+IG5leHQgdmVydGV4XG4gICAgICAgIEB2ZXJ0aWR4cyA9IHt9ICMgW25hbWVdIC0+IHZlcnRleCBpbmRleFxuICAgICAgICBAdmVydGljZXMgPSB7fSAjIFtuYW1lXSAtPiBjb29yZGluYXRlc1xuICBcbiAgICBuZXdWOiAodmVydE5hbWUsIGNvb3JkaW5hdGVzKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbm90IEB2ZXJ0aWR4c1t2ZXJ0TmFtZV1cbiAgICAgICAgICAgIEB2ZXJ0aWR4c1t2ZXJ0TmFtZV0gPSAwXG4gICAgICAgICAgICBAdmVydGljZXNbdmVydE5hbWVdID0gY29vcmRpbmF0ZXNcbiAgXG4gICAgbmV3RmxhZzogKGZhY2VOYW1lLCB2ZXJ0TmFtZTEsIHZlcnROYW1lMikgLT5cbiAgICAgICAgXG4gICAgICAgIEBmbGFnc1tmYWNlTmFtZV0gPz0ge31cbiAgICAgICAgQGZsYWdzW2ZhY2VOYW1lXVt2ZXJ0TmFtZTFdID0gdmVydE5hbWUyXG4gIFxuICAgIHRvcG9seTogKG5hbWU9J3BvbHloZWRyb24nKSAtPlxuXG4gICAgICAgIHBvbHkgPSBuZXcgUG9seWhlZHJvbiBuYW1lXG4gICAgXG4gICAgICAgICMga2xvZyAndG9wb2x5JyBAXG4gICAgICAgIFxuICAgICAgICBjdHIgPSAwIFxuICAgICAgICBmb3IgaSx2IG9mIEB2ZXJ0aWR4cyBcbiAgICAgICAgICAgIHBvbHkudmVydGljZXNbY3RyXSA9IEB2ZXJ0aWNlc1tpXVxuICAgICAgICAgICAgQHZlcnRpZHhzW2ldID0gY3RyICMgbnVtYmVyIHRoZSB2ZXJ0aWNlc1xuICAgICAgICAgICAgY3RyKytcbiAgICAgICAgICAgIFxuICAgICAgICBjdHIgPSAwXG4gICAgICAgIGZvciBpLGZhY2Ugb2YgQGZsYWdzXG4gICAgICAgICAgICBuZXdGYWNlID0gW11cbiAgICAgICAgICAgIGZvciBqLHYwIG9mIGZhY2VcbiAgICAgICAgICAgICAgICB2ID0gdjAgIyBhbnkgdmVydGV4IGFzIHN0YXJ0aW5nIHBvaW50XG4gICAgICAgICAgICAgICAgYnJlYWtcblxuICAgICAgICAgICAgbmV3RmFjZS5wdXNoIEB2ZXJ0aWR4c1t2XSAjIHJlY29yZCBpbmRleFxuICAgICAgICAgICAgdiA9IEBmbGFnc1tpXVt2XSAjIGdvdG8gbmV4dCB2ZXJ0ZXhcbiAgICAgICAgICAgIGZhY2VDb3VudCA9IDBcbiAgICAgICAgICAgIHdoaWxlIHYgIT0gdjAgIyBsb29wIHVudGlsIGJhY2sgdG8gc3RhcnRcbiAgICAgICAgICAgICAgICBuZXdGYWNlLnB1c2ggQHZlcnRpZHhzW3ZdXG4gICAgICAgICAgICAgICAgdiA9IEBmbGFnc1tpXVt2XVxuICAgICAgICAgICAgICAgIGlmIGZhY2VDb3VudCsrID4gMTAwICMgcHJldmVudCBpbmZpbml0ZSBsb29wXG4gICAgICAgICAgICAgICAgICAgIGtlcnJvciBcIkJhZCBmbGFnIHdpdGggbmV2ZXJlbmRpbmcgZmFjZTpcIiBpLCBAZmxhZ3NbaV1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIHBvbHkuZmFjZXNbY3RyXSA9IG5ld0ZhY2VcbiAgICAgICAgICAgIGN0cisrXG4gICAgICAgICAgICBcbiAgICAgICAgIyBrbG9nICdwb2x5JyBwb2x5XG4gICAgICAgIFxuICAgICAgICBwb2x5XG5cbm1vZHVsZS5leHBvcnRzID0gRmxhZ1xuIl19
//# sourceURL=../../coffee/poly/flag.coffee