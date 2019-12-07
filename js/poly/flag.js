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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhZy5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUUsU0FBVyxPQUFBLENBQVEsS0FBUjs7QUFDYixVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0FBZVA7SUFFQyxjQUFBO1FBQ0MsSUFBQyxDQUFBLEtBQUQsR0FBWTtRQUNaLElBQUMsQ0FBQSxRQUFELEdBQVk7UUFDWixJQUFDLENBQUEsUUFBRCxHQUFZO0lBSGI7O21CQUtILElBQUEsR0FBTSxTQUFDLFFBQUQsRUFBVyxXQUFYO1FBRUYsSUFBRyxDQUFJLElBQUMsQ0FBQSxRQUFTLENBQUEsUUFBQSxDQUFqQjtZQUNJLElBQUMsQ0FBQSxRQUFTLENBQUEsUUFBQSxDQUFWLEdBQXNCO21CQUN0QixJQUFDLENBQUEsUUFBUyxDQUFBLFFBQUEsQ0FBVixHQUFzQixZQUYxQjs7SUFGRTs7bUJBTU4sT0FBQSxHQUFTLFNBQUMsUUFBRCxFQUFXLFNBQVgsRUFBc0IsU0FBdEI7QUFFTCxZQUFBOztnQkFBTyxDQUFBLFFBQUE7O2dCQUFBLENBQUEsUUFBQSxJQUFhOztlQUNwQixJQUFDLENBQUEsS0FBTSxDQUFBLFFBQUEsQ0FBVSxDQUFBLFNBQUEsQ0FBakIsR0FBOEI7SUFIekI7O21CQUtULE1BQUEsR0FBUSxTQUFDLElBQUQ7QUFFSixZQUFBOztZQUZLLE9BQUs7O1FBRVYsSUFBQSxHQUFPLElBQUksVUFBSixDQUFlLElBQWY7UUFJUCxHQUFBLEdBQU07QUFDTjtBQUFBLGFBQUEsUUFBQTs7WUFDSSxJQUFJLENBQUMsUUFBUyxDQUFBLEdBQUEsQ0FBZCxHQUFxQixJQUFDLENBQUEsUUFBUyxDQUFBLENBQUE7WUFDL0IsSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBLENBQVYsR0FBZTtZQUNmLEdBQUE7QUFISjtRQUtBLEdBQUEsR0FBTTtBQUNOO0FBQUEsYUFBQSxTQUFBOztZQUNJLE9BQUEsR0FBVTtBQUNWLGlCQUFBLFNBQUE7O2dCQUNJLENBQUEsR0FBSTtBQUNKO0FBRko7WUFJQSxPQUFPLENBQUMsSUFBUixDQUFhLElBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQSxDQUF2QjtZQUNBLENBQUEsR0FBSSxJQUFDLENBQUEsS0FBTSxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUE7WUFDZCxTQUFBLEdBQVk7QUFDWixtQkFBTSxDQUFBLEtBQUssRUFBWDtnQkFDSSxPQUFPLENBQUMsSUFBUixDQUFhLElBQUMsQ0FBQSxRQUFTLENBQUEsQ0FBQSxDQUF2QjtnQkFDQSxDQUFBLEdBQUksSUFBQyxDQUFBLEtBQU0sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBO2dCQUNkLElBQUcsU0FBQSxFQUFBLEdBQWMsR0FBakI7b0JBQ0ksTUFBQSxDQUFPLGlDQUFQLEVBQXlDLENBQXpDLEVBQTRDLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFuRDtBQUNBLDBCQUZKOztZQUhKO1lBTUEsSUFBSSxDQUFDLEtBQU0sQ0FBQSxHQUFBLENBQVgsR0FBa0I7WUFDbEIsR0FBQTtBQWhCSjtlQW9CQTtJQWpDSTs7Ozs7O0FBbUNaLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCBcbjAwMCAgICAgICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgIFxuMDAwMDAwICAgIDAwMCAgICAgIDAwMDAwMDAwMCAgMDAwICAwMDAwXG4wMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMCAgICAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwIFxuIyMjXG5cbnsga2Vycm9yIH0gPSByZXF1aXJlICdreGsnXG5Qb2x5aGVkcm9uID0gcmVxdWlyZSAnLi9wb2x5aGVkcm9uJ1xuXG4jIFBvbHloZWRyb24gRmxhZyBDb25zdHJ1Y3RcbiNcbiMgQSBGbGFnIGlzIGFuIGFzc29jaWF0aXZlIHRyaXBsZSBvZiBhIGZhY2UgaW5kZXggYW5kIHR3byBhZGphY2VudCB2ZXJ0ZXggdmVydGlkeHMsXG4jIGxpc3RlZCBpbiBnZW9tZXRyaWMgY2xvY2t3aXNlIG9yZGVyIChzdGFyaW5nIGludG8gdGhlIG5vcm1hbClcbiNcbiMgRmFjZV9pIC0+IFZfaSAtPiBWX2pcbiNcbiMgVGhleSBhcmUgYSB1c2VmdWwgYWJzdHJhY3Rpb24gZm9yIGRlZmluaW5nIHRvcG9sb2dpY2FsIHRyYW5zZm9ybWF0aW9ucyBvZiB0aGUgcG9seWhlZHJhbCBtZXNoLCBhc1xuIyBvbmUgY2FuIHJlZmVyIHRvIHZlcnRpY2VzIGFuZCBmYWNlcyB0aGF0IGRvbid0IHlldCBleGlzdCBvciBoYXZlbid0IGJlZW4gdHJhdmVyc2VkIHlldCBpbiB0aGVcbiMgdHJhbnNmb3JtYXRpb24gY29kZS5cbiNcbiMgQSBmbGFnIGlzIHNpbWlsYXIgaW4gY29uY2VwdCB0byBhIGRpcmVjdGVkIGhhbGZlZGdlIGluIGhhbGZlZGdlIGRhdGEgc3RydWN0dXJlcy5cblxuY2xhc3MgRmxhZ1xuICAgIFxuICAgIEA6IC0+XG4gICAgICAgIEBmbGFncyAgICA9IHt9ICMgZmxhZ3NbZmFjZV1bdmVydGV4XSA9IG5leHQgdmVydGV4XG4gICAgICAgIEB2ZXJ0aWR4cyA9IHt9ICMgW3N5bWJvbGljIG5hbWVzXSBob2xkcyB2ZXJ0ZXggaW5kZXhcbiAgICAgICAgQHZlcnRpY2VzID0ge30gIyBYWVogY29vcmRpbmF0ZXNcbiAgXG4gICAgbmV3VjogKHZlcnROYW1lLCBjb29yZGluYXRlcykgLT5cbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBAdmVydGlkeHNbdmVydE5hbWVdXG4gICAgICAgICAgICBAdmVydGlkeHNbdmVydE5hbWVdID0gMFxuICAgICAgICAgICAgQHZlcnRpY2VzW3ZlcnROYW1lXSA9IGNvb3JkaW5hdGVzXG4gIFxuICAgIG5ld0ZsYWc6IChmYWNlTmFtZSwgdmVydE5hbWUxLCB2ZXJ0TmFtZTIpIC0+XG4gICAgICAgIFxuICAgICAgICBAZmxhZ3NbZmFjZU5hbWVdID89IHt9XG4gICAgICAgIEBmbGFnc1tmYWNlTmFtZV1bdmVydE5hbWUxXSA9IHZlcnROYW1lMlxuICBcbiAgICB0b3BvbHk6IChuYW1lPSdwb2x5aGVkcm9uJykgLT5cblxuICAgICAgICBwb2x5ID0gbmV3IFBvbHloZWRyb24gbmFtZVxuICAgIFxuICAgICAgICAjIGtsb2cgJ3RvcG9seScgQFxuICAgICAgICBcbiAgICAgICAgY3RyID0gMCBcbiAgICAgICAgZm9yIGksdiBvZiBAdmVydGlkeHMgXG4gICAgICAgICAgICBwb2x5LnZlcnRpY2VzW2N0cl0gPSBAdmVydGljZXNbaV1cbiAgICAgICAgICAgIEB2ZXJ0aWR4c1tpXSA9IGN0ciAjIG51bWJlciB0aGUgdmVydGljZXNcbiAgICAgICAgICAgIGN0cisrXG4gICAgICAgICAgICBcbiAgICAgICAgY3RyID0gMFxuICAgICAgICBmb3IgaSxmYWNlIG9mIEBmbGFnc1xuICAgICAgICAgICAgbmV3RmFjZSA9IFtdXG4gICAgICAgICAgICBmb3Igaix2MCBvZiBmYWNlXG4gICAgICAgICAgICAgICAgdiA9IHYwICMgYW55IHZlcnRleCBhcyBzdGFydGluZyBwb2ludFxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIG5ld0ZhY2UucHVzaCBAdmVydGlkeHNbdl0gIyByZWNvcmQgaW5kZXhcbiAgICAgICAgICAgIHYgPSBAZmxhZ3NbaV1bdl0gIyBnb3RvIG5leHQgdmVydGV4XG4gICAgICAgICAgICBmYWNlQ291bnQgPSAwXG4gICAgICAgICAgICB3aGlsZSB2ICE9IHYwICMgbG9vcCB1bnRpbCBiYWNrIHRvIHN0YXJ0XG4gICAgICAgICAgICAgICAgbmV3RmFjZS5wdXNoIEB2ZXJ0aWR4c1t2XVxuICAgICAgICAgICAgICAgIHYgPSBAZmxhZ3NbaV1bdl1cbiAgICAgICAgICAgICAgICBpZiBmYWNlQ291bnQrKyA+IDEwMCAjIHByZXZlbnQgaW5maW5pdGUgbG9vcCBvbiBiYWRseSBmb3JtZWQgZmxhZ3NldHNcbiAgICAgICAgICAgICAgICAgICAga2Vycm9yIFwiQmFkIGZsYWcgd2l0aCBuZXZlcmVuZGluZyBmYWNlOlwiIGksIEBmbGFnc1tpXVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICAgICAgcG9seS5mYWNlc1tjdHJdID0gbmV3RmFjZVxuICAgICAgICAgICAgY3RyKytcbiAgICAgICAgICAgIFxuICAgICAgICAjIGtsb2cgJ3BvbHknIHBvbHlcbiAgICAgICAgXG4gICAgICAgIHBvbHlcblxubW9kdWxlLmV4cG9ydHMgPSBGbGFnXG4iXX0=
//# sourceURL=../../coffee/poly/flag.coffee