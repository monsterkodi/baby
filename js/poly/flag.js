// koffee 1.6.0

/*
00000000  000       0000000    0000000 
000       000      000   000  000      
000000    000      000000000  000  0000
000       000      000   000  000   000
000       0000000  000   000   0000000
 */
var Flag, Polyhedron, kerror, klog, ref;

ref = require('kxk'), kerror = ref.kerror, klog = ref.klog;

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
        var ctr, face, faceCount, i, j, newFace, poly, ref1, ref2, v, v0;
        if (name == null) {
            name = 'polyhedron';
        }
        poly = new Polyhedron(name);
        ref1 = this.vertices;
        for (i in ref1) {
            v = ref1[i];
            poly.vertices[ctr] = this.vertices[i];
        }
        klog('topoly', this);
        ctr = 0;
        ref2 = this.flags;
        for (i in ref2) {
            face = ref2[i];
            newFace = [];
            for (j in face) {
                v0 = face[j];
                v = v0;
                break;
            }
            newFace.push(v);
            v = this.flags[i][v];
            faceCount = 0;
            while (v !== v0) {
                newFace.push(v);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxhZy5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBVUEsTUFBbUIsT0FBQSxDQUFRLEtBQVIsQ0FBbkIsRUFBRSxtQkFBRixFQUFVOztBQUNWLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7QUFFUDtJQUVDLGNBQUE7UUFDQyxJQUFDLENBQUEsS0FBRCxHQUFZO1FBQ1osSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUZiOzttQkFJSCxJQUFBLEdBQU0sU0FBQyxRQUFELEVBQVcsV0FBWDtRQUVGLElBQUcsQ0FBSSxJQUFDLENBQUEsUUFBUyxDQUFBLFFBQUEsQ0FBakI7bUJBQ0ksSUFBQyxDQUFBLFFBQVMsQ0FBQSxRQUFBLENBQVYsR0FBc0IsWUFEMUI7O0lBRkU7O21CQUtOLE9BQUEsR0FBUyxTQUFDLFFBQUQsRUFBVyxTQUFYLEVBQXNCLFNBQXRCO0FBRUwsWUFBQTs7Z0JBQU8sQ0FBQSxRQUFBOztnQkFBQSxDQUFBLFFBQUEsSUFBYTs7ZUFDcEIsSUFBQyxDQUFBLEtBQU0sQ0FBQSxRQUFBLENBQVUsQ0FBQSxTQUFBLENBQWpCLEdBQThCO0lBSHpCOzttQkFLVCxNQUFBLEdBQVEsU0FBQyxJQUFEO0FBRUosWUFBQTs7WUFGSyxPQUFLOztRQUVWLElBQUEsR0FBTyxJQUFJLFVBQUosQ0FBZSxJQUFmO0FBR1A7QUFBQSxhQUFBLFNBQUE7O1lBQ0ksSUFBSSxDQUFDLFFBQVMsQ0FBQSxHQUFBLENBQWQsR0FBcUIsSUFBQyxDQUFBLFFBQVMsQ0FBQSxDQUFBO0FBRG5DO1FBS0EsSUFBQSxDQUFLLFFBQUwsRUFBYyxJQUFkO1FBRUEsR0FBQSxHQUFNO0FBQ047QUFBQSxhQUFBLFNBQUE7O1lBQ0ksT0FBQSxHQUFVO0FBQ1YsaUJBQUEsU0FBQTs7Z0JBQ0ksQ0FBQSxHQUFJO0FBQ0o7QUFGSjtZQUlBLE9BQU8sQ0FBQyxJQUFSLENBQWEsQ0FBYjtZQUNBLENBQUEsR0FBSSxJQUFDLENBQUEsS0FBTSxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUE7WUFDZCxTQUFBLEdBQVk7QUFDWixtQkFBTSxDQUFBLEtBQUssRUFBWDtnQkFDSSxPQUFPLENBQUMsSUFBUixDQUFhLENBQWI7Z0JBQ0EsQ0FBQSxHQUFJLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQTtnQkFDZCxJQUFHLFNBQUEsRUFBQSxHQUFjLEdBQWpCO29CQUNJLE1BQUEsQ0FBTyxpQ0FBUCxFQUF5QyxDQUF6QyxFQUE0QyxJQUFDLENBQUEsS0FBTSxDQUFBLENBQUEsQ0FBbkQ7QUFDQSwwQkFGSjs7WUFISjtZQU1BLElBQUksQ0FBQyxLQUFNLENBQUEsR0FBQSxDQUFYLEdBQWtCO1lBQ2xCLEdBQUE7QUFoQko7ZUFvQkE7SUFqQ0k7Ozs7OztBQW1DWixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgXG4wMDAgICAgICAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICBcbjAwMDAwMCAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMCAgMDAwMFxuMDAwICAgICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCBcbiMjI1xuI1xuIyBQb2x5aMOpZHJvbmlzbWUsIENvcHlyaWdodCAyMDE5LCBBbnNlbG0gTGV2c2theWEsIE1JVCBMaWNlbnNlXG5cbnsga2Vycm9yLCBrbG9nIH0gPSByZXF1aXJlICdreGsnXG5Qb2x5aGVkcm9uID0gcmVxdWlyZSAnLi9wb2x5aGVkcm9uJ1xuXG5jbGFzcyBGbGFnXG4gICAgXG4gICAgQDogLT5cbiAgICAgICAgQGZsYWdzICAgID0ge30gIyBbZmFjZV1bdmVydGV4XSAtPiBuZXh0IHZlcnRleFxuICAgICAgICBAdmVydGljZXMgPSB7fSAjIFtuYW1lXSAtPiBjb29yZGluYXRlc1xuICBcbiAgICBuZXdWOiAodmVydE5hbWUsIGNvb3JkaW5hdGVzKSAtPlxuICAgICAgICBcbiAgICAgICAgaWYgbm90IEB2ZXJ0aWNlc1t2ZXJ0TmFtZV1cbiAgICAgICAgICAgIEB2ZXJ0aWNlc1t2ZXJ0TmFtZV0gPSBjb29yZGluYXRlc1xuICBcbiAgICBuZXdGbGFnOiAoZmFjZU5hbWUsIHZlcnROYW1lMSwgdmVydE5hbWUyKSAtPlxuICAgICAgICBcbiAgICAgICAgQGZsYWdzW2ZhY2VOYW1lXSA/PSB7fVxuICAgICAgICBAZmxhZ3NbZmFjZU5hbWVdW3ZlcnROYW1lMV0gPSB2ZXJ0TmFtZTJcbiAgXG4gICAgdG9wb2x5OiAobmFtZT0ncG9seWhlZHJvbicpIC0+XG5cbiAgICAgICAgcG9seSA9IG5ldyBQb2x5aGVkcm9uIG5hbWVcbiAgICBcbiAgICAgICAgIyBjdHIgPSAwXG4gICAgICAgIGZvciBpLHYgb2YgQHZlcnRpY2VzXG4gICAgICAgICAgICBwb2x5LnZlcnRpY2VzW2N0cl0gPSBAdmVydGljZXNbaV1cbiAgICAgICAgICAgICMgdmVydGlkeHNbaV0gPSBjdHIgIyBudW1iZXIgdGhlIHZlcnRpY2VzXG4gICAgICAgICAgICAjIGN0cisrXG4gICAgICAgICAgICBcbiAgICAgICAga2xvZyAndG9wb2x5JyBAXG4gICAgICAgICAgICBcbiAgICAgICAgY3RyID0gMFxuICAgICAgICBmb3IgaSxmYWNlIG9mIEBmbGFnc1xuICAgICAgICAgICAgbmV3RmFjZSA9IFtdXG4gICAgICAgICAgICBmb3Igaix2MCBvZiBmYWNlXG4gICAgICAgICAgICAgICAgdiA9IHYwICMgYW55IHZlcnRleCBhcyBzdGFydGluZyBwb2ludFxuICAgICAgICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgICAgIG5ld0ZhY2UucHVzaCB2ICMgQHZlcnRpZHhzW3ZdICMgcmVjb3JkIGluZGV4XG4gICAgICAgICAgICB2ID0gQGZsYWdzW2ldW3ZdICMgZ290byBuZXh0IHZlcnRleFxuICAgICAgICAgICAgZmFjZUNvdW50ID0gMFxuICAgICAgICAgICAgd2hpbGUgdiAhPSB2MCAjIGxvb3AgdW50aWwgYmFjayB0byBzdGFydFxuICAgICAgICAgICAgICAgIG5ld0ZhY2UucHVzaCB2ICMgQHZlcnRpZHhzW3ZdXG4gICAgICAgICAgICAgICAgdiA9IEBmbGFnc1tpXVt2XVxuICAgICAgICAgICAgICAgIGlmIGZhY2VDb3VudCsrID4gMTAwICMgcHJldmVudCBpbmZpbml0ZSBsb29wXG4gICAgICAgICAgICAgICAgICAgIGtlcnJvciBcIkJhZCBmbGFnIHdpdGggbmV2ZXJlbmRpbmcgZmFjZTpcIiBpLCBAZmxhZ3NbaV1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICAgIHBvbHkuZmFjZXNbY3RyXSA9IG5ld0ZhY2VcbiAgICAgICAgICAgIGN0cisrXG4gICAgICAgICAgICBcbiAgICAgICAgIyBrbG9nICdwb2x5JyBwb2x5XG4gICAgICAgIFxuICAgICAgICBwb2x5XG5cbm1vZHVsZS5leHBvcnRzID0gRmxhZ1xuIl19
//# sourceURL=../../coffee/poly/flag.coffee