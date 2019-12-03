// koffee 1.6.0

/*
000   000  00000000   0000000  000000000   0000000   00000000 
000   000  000       000          000     000   000  000   000
 000 000   0000000   000          000     000   000  0000000  
   000     000       000          000     000   000  000   000
    0      00000000   0000000     000      0000000   000   000
 */
var Vector, Vector3, rad2deg, randRange, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), randRange = ref.randRange, rad2deg = ref.rad2deg;

Vector3 = require('babylonjs').Vector3;

Vector = (function(superClass) {
    extend(Vector, superClass);

    Vector.counter = 0;

    Vector.tmp = new Vector;

    function Vector(x, y, z) {
        var ref1, ref2;
        if (x == null) {
            x = 0;
        }
        if (y == null) {
            y = 0;
        }
        if (z == null) {
            z = 0;
        }
        Vector.counter += 1;
        if ((x.x != null) && (x.y != null)) {
            Vector.__super__.constructor.call(this, x.x, x.y, (ref1 = x.z) != null ? ref1 : 0);
        } else if (Array.isArray(x)) {
            Vector.__super__.constructor.call(this, x[0], x[1], (ref2 = x[2]) != null ? ref2 : 0);
        } else {
            Vector.__super__.constructor.call(this, x, y, z != null ? z : 0);
        }
        if (Number.isNaN(this.x)) {
            throw new Error;
        }
    }

    Vector.prototype.clone = function() {
        return new Vector(this);
    };

    Vector.prototype.copy = function(v) {
        var ref1;
        this.x = v.x;
        this.y = v.y;
        this.z = (ref1 = v.z) != null ? ref1 : 0;
        return this;
    };

    Vector.prototype.parallel = function(n) {
        var dot;
        dot = this.x * n.x + this.y * n.y + this.z * n.z;
        return new Vector(dot * n.x, dot * n.y, dot * n.z);
    };

    Vector.prototype.perpendicular = function(n) {
        var dot;
        dot = this.x * n.x + this.y * n.y + this.z * n.z;
        return new Vector(this.x - dot * n.x, this.y - dot * n.y, this.z - dot * n.z);
    };

    Vector.prototype.reflect = function(n) {
        var dot;
        dot = 2 * (this.x * n.x + this.y * n.y + this.z * n.z);
        return new Vector(this.x - dot * n.x, this.y - dot * n.y, this.z - dot * n.z);
    };

    Vector.prototype.rotated = function(axis, angle) {
        return this.clone().rotate(axis, angle);
    };

    Vector.prototype.rotate = function(axis, angle) {
        this.applyQuaternion(Quaternion.axisAngle(axis, angle));
        return this;
    };

    Vector.prototype.crossed = function(v) {
        return this.clone().cross(v);
    };

    Vector.prototype.cross = function(v) {
        return this.crossVectors(this, v);
    };

    Vector.prototype.normal = function() {
        return this.clone().normalize();
    };

    Vector.prototype.normalize = function() {
        var l;
        l = this.length();
        if (l) {
            l = 1.0 / l;
            this.x *= l;
            this.y *= l;
            this.z *= l;
        }
        return this;
    };

    Vector.prototype.xyperp = function() {
        return new Vector(-this.y, this.x);
    };

    Vector.prototype.rounded = function() {
        return this.clone().round();
    };

    Vector.prototype.round = function() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.z = Math.round(this.z);
        return this;
    };

    Vector.prototype.equals = function(o) {
        return this.manhattan(o) < 0.001;
    };

    Vector.prototype.same = function(o) {
        var z;
        return this.x === o.x && this.y === o.y && (z = o.z);
    };

    Vector.prototype.faded = function(o, val) {
        return this.clone().fade(o, val);
    };

    Vector.prototype.fade = function(o, val) {
        this.x = this.x * (1 - val) + o.x * val;
        this.y = this.y * (1 - val) + o.y * val;
        this.z = this.z * (1 - val) + o.z * val;
        return this;
    };

    Vector.prototype.xyangle = function(v) {
        var otherXY, thisXY;
        thisXY = new Vector(this.x, this.y).normal();
        otherXY = new Vector(v.x, v.y).normal();
        if (thisXY.xyperp().dot(otherXY >= 0)) {
            return rad2deg(Math.acos(thisXY.dot(otherXY)));
        }
        return -rad2deg(Math.acos(thisXY.dot(otherXY)));
    };

    Vector.prototype.paris = function(o) {
        var m;
        m = [Math.abs(o.x - this.x), Math.abs(o.y - this.y), Math.abs(o.z - this.z)];
        m.sort(function(a, b) {
            return b - a;
        });
        return m[0] + 0.2 * m[1] + 0.1 * m[2];
    };

    Vector.prototype.manhattan = function(o) {
        return Math.abs(o.x - this.x) + Math.abs(o.y - this.y) + Math.abs(o.z - this.z);
    };

    Vector.prototype.dist = function(o) {
        return this.minus(o).length();
    };

    Vector.prototype.length = function() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    };

    Vector.prototype.dot = function(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    };

    Vector.prototype.mul = function(f) {
        return new Vector(this.x * f, this.y * f, this.z * f);
    };

    Vector.prototype.div = function(d) {
        return new Vector(this.x / d, this.y / d, this.z / d);
    };

    Vector.prototype.plus = function(v) {
        return new Vector(v).add(this);
    };

    Vector.prototype.minus = function(v) {
        return new Vector(v).neg().add(this);
    };

    Vector.prototype.neg = function() {
        return new Vector(-this.x, -this.y, -this.z);
    };

    Vector.prototype.to = function(v) {
        return new Vector(v).sub(this);
    };

    Vector.prototype.angle = function(v) {
        var l, o, p, q, r, x, y, z;
        if (l = this.length()) {
            if (o = v.length()) {
                x = this.x / l;
                y = this.y / l;
                z = this.z / l;
                p = v.x / o;
                q = v.y / o;
                r = v.z / o;
                return rad2deg(Math.acos(x * p + y * q + z * r));
            }
        }
        return 0;
    };

    Vector.prototype.negate = function() {
        return this.scale(-1);
    };

    Vector.prototype.scale = function(f) {
        this.x *= f;
        this.y *= f;
        this.z *= f;
        return this;
    };

    Vector.prototype.reset = function() {
        this.x = this.y = this.z = 0;
        return this;
    };

    Vector.prototype.isZero = function() {
        var ref1, ref2;
        return ((this.x === (ref2 = this.y) && ref2 === (ref1 = this.z)) && ref1 === 0);
    };

    Vector.prototype.randomize = function() {
        this.set(randRange(-1, 1), randRange(-1, 1), randRange(-1, 1));
        this.normalize();
        return this;
    };

    Vector.random = function() {
        return new Vector().randomize();
    };

    Vector.rayPlaneIntersection = function(rayPos, rayDirection, planePos, planeNormal) {
        var x;
        x = planePos.minus(rayPos).dot(planeNormal) / rayDirection.dot(planeNormal);
        return rayPos.plus(rayDirection.mul(x));
    };

    Vector.pointMappedToPlane = function(point, planePos, planeNormal) {
        return point.minus(planeNormal).dot(point.minus(planePos).dot(planeNormal));
    };

    Vector.rayPlaneIntersectionFactor = function(rayPos, rayDir, planePos, planeNormal) {
        var r, rayDot;
        rayDot = rayDir.dot(planeNormal);
        if (Number.isNaN(rayDot)) {
            throw new Error;
        }
        if (rayDot === 0) {
            return 2;
        }
        r = planePos.minus(rayPos).dot(planeNormal) / rayDot;
        if (Number.isNaN(r)) {
            console.log('rayPos', rayPos);
            console.log('rayDir', rayDir);
            console.log('planePos', planePos);
            console.log('planeNormal', planeNormal);
            throw new Error;
        }
        return r;
    };

    Vector.PX = 0;

    Vector.PY = 1;

    Vector.PZ = 2;

    Vector.NX = 3;

    Vector.NY = 4;

    Vector.NZ = 5;

    Vector.unitX = new Vector(1, 0, 0);

    Vector.unitY = new Vector(0, 1, 0);

    Vector.unitZ = new Vector(0, 0, 1);

    Vector.minusX = new Vector(-1, 0, 0);

    Vector.minusY = new Vector(0, -1, 0);

    Vector.minusZ = new Vector(0, 0, -1);

    Vector.normals = [Vector.unitX, Vector.unitY, Vector.unitZ, Vector.minusX, Vector.minusY, Vector.minusZ];

    Vector.perpNormals = function(v) {
        var i;
        i = this.normalIndex(v);
        switch (i) {
            case this.PX:
                return [this.unitY, this.unitZ, this.minusY, this.minusZ];
            case this.PY:
                return [this.minusX, this.unitZ, this.unitX, this.minusZ];
            case this.PZ:
                return [this.unitY, this.minusX, this.minusY, this.unitX];
            case this.NX:
                return [this.unitY, this.minusZ, this.minusY, this.unitZ];
            case this.NY:
                return [this.minusX, this.minusZ, this.unitX, this.unitZ];
            case this.NZ:
                return [this.unitY, this.unitX, this.minusY, this.minusX];
        }
    };

    Vector.normalIndex = function(v) {
        var cn, i, j;
        cn = this.closestNormal(v);
        for (i = j = 0; j < 6; i = ++j) {
            if (Vector.normals[i].equals(cn)) {
                return i;
            }
        }
        return -1;
    };

    Vector.closestNormal = function(v) {
        var angles, j, len, n, ref1;
        Vector.tmp.copy(v);
        Vector.tmp.normalize();
        angles = [];
        ref1 = Vector.normals;
        for (j = 0, len = ref1.length; j < len; j++) {
            n = ref1[j];
            if (n.equals(Vector.tmp)) {
                return n;
            }
            angles.push([n.angle(Vector.tmp), n]);
        }
        angles.sort(function(a, b) {
            return a[0] - b[0];
        });
        return angles[0][1];
    };

    return Vector;

})(Vector3);

module.exports = Vector;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVjdG9yLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSx3Q0FBQTtJQUFBOzs7QUFRQSxNQUF5QixPQUFBLENBQVEsS0FBUixDQUF6QixFQUFFLHlCQUFGLEVBQWE7O0FBQ1gsVUFBWSxPQUFBLENBQVEsV0FBUjs7QUFFUjs7O0lBRUYsTUFBQyxDQUFBLE9BQUQsR0FBVzs7SUFDWCxNQUFDLENBQUEsR0FBRCxHQUFPLElBQUk7O0lBRVIsZ0JBQUMsQ0FBRCxFQUFLLENBQUwsRUFBUyxDQUFUO0FBRUMsWUFBQTs7WUFGQSxJQUFFOzs7WUFBRSxJQUFFOzs7WUFBRSxJQUFFOztRQUVWLE1BQU0sQ0FBQyxPQUFQLElBQWtCO1FBRWxCLElBQUcsYUFBQSxJQUFTLGFBQVo7WUFDSSx3Q0FBTSxDQUFDLENBQUMsQ0FBUixFQUFXLENBQUMsQ0FBQyxDQUFiLGdDQUFzQixDQUF0QixFQURKO1NBQUEsTUFFSyxJQUFHLEtBQUssQ0FBQyxPQUFOLENBQWMsQ0FBZCxDQUFIO1lBQ0Qsd0NBQU0sQ0FBRSxDQUFBLENBQUEsQ0FBUixFQUFZLENBQUUsQ0FBQSxDQUFBLENBQWQsaUNBQXlCLENBQXpCLEVBREM7U0FBQSxNQUFBO1lBR0Qsd0NBQU0sQ0FBTixFQUFTLENBQVQsY0FBWSxJQUFJLENBQWhCLEVBSEM7O1FBSUwsSUFBRyxNQUFNLENBQUMsS0FBUCxDQUFhLElBQUMsQ0FBQSxDQUFkLENBQUg7QUFDSSxrQkFBTSxJQUFJLE1BRGQ7O0lBVkQ7O3FCQWFILEtBQUEsR0FBTyxTQUFBO2VBQUcsSUFBSSxNQUFKLENBQVcsSUFBWDtJQUFIOztxQkFDUCxJQUFBLEdBQU0sU0FBQyxDQUFEO0FBQ0YsWUFBQTtRQUFBLElBQUMsQ0FBQSxDQUFELEdBQUssQ0FBQyxDQUFDO1FBQ1AsSUFBQyxDQUFBLENBQUQsR0FBSyxDQUFDLENBQUM7UUFDUCxJQUFDLENBQUEsQ0FBRCxpQ0FBVztl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UCxDQUFZLENBQUMsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxNQUFNLENBQUMsR0FBZixDQUFELEVBQXNCLENBQXRCLENBQVo7QUFISjtRQUtBLE1BQU0sQ0FBQyxJQUFQLENBQVksU0FBQyxDQUFELEVBQUcsQ0FBSDttQkFBUyxDQUFFLENBQUEsQ0FBQSxDQUFGLEdBQUssQ0FBRSxDQUFBLENBQUE7UUFBaEIsQ0FBWjtlQUNBLE1BQU8sQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBO0lBWEU7Ozs7R0E5TEM7O0FBMk1yQixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4gMDAwIDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMDAwMDAgIFxuICAgMDAwICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAgICAwICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4jIyNcblxueyByYW5kUmFuZ2UsIHJhZDJkZWcgfSA9IHJlcXVpcmUgJ2t4aydcbnsgVmVjdG9yMyB9ID0gcmVxdWlyZSAnYmFieWxvbmpzJ1xuXG5jbGFzcyBWZWN0b3IgZXh0ZW5kcyBWZWN0b3IzXG5cbiAgICBAY291bnRlciA9IDBcbiAgICBAdG1wID0gbmV3IFZlY3RvclxuICAgIFxuICAgIEA6ICh4PTAseT0wLHo9MCkgLT5cbiAgICAgICAgXG4gICAgICAgIFZlY3Rvci5jb3VudGVyICs9IDFcbiAgICAgICAgXG4gICAgICAgIGlmIHgueD8gYW5kIHgueT9cbiAgICAgICAgICAgIHN1cGVyIHgueCwgeC55LCB4LnogPyAwXG4gICAgICAgIGVsc2UgaWYgQXJyYXkuaXNBcnJheSB4XG4gICAgICAgICAgICBzdXBlciB4WzBdLCB4WzFdLCB4WzJdID8gMFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBzdXBlciB4LCB5LCB6ID8gMFxuICAgICAgICBpZiBOdW1iZXIuaXNOYU4gQHhcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvclxuICAgICAgICAgICAgXG4gICAgY2xvbmU6IC0+IG5ldyBWZWN0b3IgQFxuICAgIGNvcHk6ICh2KSAtPiBcbiAgICAgICAgQHggPSB2LnhcbiAgICAgICAgQHkgPSB2LnkgXG4gICAgICAgIEB6ID0gdi56ID8gMFxuICAgICAgICBAXG5cbiAgICBcbiAgICBwYXJhbGxlbDogKG4pIC0+XG4gICAgICAgIGRvdCA9IEB4Km4ueCArIEB5Km4ueSArIEB6Km4uelxuICAgICAgICBuZXcgVmVjdG9yIGRvdCpuLngsIGRvdCpuLnksIGRvdCpuLnpcblxuICAgICMgcmV0dXJucyB0aGUgcHJvamVjdGlvbiBvZiBub3JtYWxpemVkIHZlY3RvciBuIHRvIHZlY3RvciB0aGF0IGlzIHBlcnBlbmRpY3VsYXIgdG8gdGhpc1xuICAgIHBlcnBlbmRpY3VsYXI6IChuKSAtPlxuICAgICAgICBkb3QgPSBAeCpuLnggKyBAeSpuLnkgKyBAeipuLnpcbiAgICAgICAgbmV3IFZlY3RvciBAeC1kb3Qqbi54LCBAeS1kb3Qqbi55LCBAei1kb3Qqbi56IFxuXG4gICAgcmVmbGVjdDogKG4pIC0+XG4gICAgICAgIGRvdCA9IDIqKEB4Km4ueCArIEB5Km4ueSArIEB6Km4ueilcbiAgICAgICAgbmV3IFZlY3RvciBAeC1kb3Qqbi54LCBAeS1kb3Qqbi55LCBAei1kb3Qqbi56XG4gICAgICAgIFxuICAgIHJvdGF0ZWQ6IChheGlzLCBhbmdsZSkgLT4gQGNsb25lKCkucm90YXRlIGF4aXMsYW5nbGVcbiAgICByb3RhdGU6IChheGlzLCBhbmdsZSkgLT5cbiAgICAgICAgQGFwcGx5UXVhdGVybmlvbiBRdWF0ZXJuaW9uLmF4aXNBbmdsZSBheGlzLCBhbmdsZVxuICAgICAgICBAXG5cbiAgICBjcm9zc2VkOiAodikgLT4gQGNsb25lKCkuY3Jvc3ModilcbiAgICBjcm9zczogKHYpIC0+IEBjcm9zc1ZlY3RvcnMgQCwgdlxuICAgIFxuICAgIG5vcm1hbDogLT4gQGNsb25lKCkubm9ybWFsaXplKClcbiAgICBub3JtYWxpemU6IC0+XG4gICAgICAgIGwgPSBAbGVuZ3RoKClcbiAgICAgICAgaWYgbFxuICAgICAgICAgICAgbCA9IDEuMC9sXG4gICAgICAgICAgICBAeCAqPSBsXG4gICAgICAgICAgICBAeSAqPSBsXG4gICAgICAgICAgICBAeiAqPSBsXG4gICAgICAgIEAgICAgXG5cbiAgICB4eXBlcnA6IC0+IG5ldyBWZWN0b3IgLUB5LCBAeFxuICAgIFxuICAgIHJvdW5kZWQ6IC0+IEBjbG9uZSgpLnJvdW5kKClcbiAgICByb3VuZDogLT4gXG4gICAgICAgIEB4ID0gTWF0aC5yb3VuZCBAeCBcbiAgICAgICAgQHkgPSBNYXRoLnJvdW5kIEB5IFxuICAgICAgICBAeiA9IE1hdGgucm91bmQgQHpcbiAgICAgICAgQFxuXG4gICAgZXF1YWxzOiAobykgLT4gQG1hbmhhdHRhbihvKSA8IDAuMDAxXG4gICAgc2FtZTogICAobykgLT4gQHg9PW8ueCBhbmQgQHk9PW8ueSBhbmQgej1vLnpcblxuICAgIGZhZGVkOiAobywgdmFsKSAtPiBAY2xvbmUoKS5mYWRlIG8sIHZhbFxuICAgIGZhZGU6IChvLCB2YWwpIC0+ICMgbGluZWFyIGludGVycG9sYXRpb24gZnJvbSB0aGlzICh2YWw9PTApIHRvIG90aGVyICh2YWw9PTEpXG4gICAgICAgIFxuICAgICAgICBAeCA9IEB4ICogKDEtdmFsKSArIG8ueCAqIHZhbFxuICAgICAgICBAeSA9IEB5ICogKDEtdmFsKSArIG8ueSAqIHZhbFxuICAgICAgICBAeiA9IEB6ICogKDEtdmFsKSArIG8ueiAqIHZhbFxuICAgICAgICBAXG4gICAgXG4gICAgeHlhbmdsZTogKHYpIC0+XG4gICAgICAgIFxuICAgICAgICB0aGlzWFkgID0gbmV3IFZlY3RvcihAeCwgQHkpLm5vcm1hbCgpXG4gICAgICAgIG90aGVyWFkgPSBuZXcgVmVjdG9yKHYueCwgdi55KS5ub3JtYWwoKVxuICAgICAgICBpZiB0aGlzWFkueHlwZXJwKCkuZG90IG90aGVyWFkgPj0gMCBcbiAgICAgICAgICAgIHJldHVybiByYWQyZGVnKE1hdGguYWNvcyh0aGlzWFkuZG90IG90aGVyWFkpKVxuICAgICAgICAtcmFkMmRlZyhNYXRoLmFjb3ModGhpc1hZLmRvdCBvdGhlclhZKSlcbiAgICAgICAgXG4gICAgcGFyaXM6IChvKSAtPiBcbiAgICAgICAgbSA9IFtNYXRoLmFicyhvLngtQHgpLE1hdGguYWJzKG8ueS1AeSksTWF0aC5hYnMoby56LUB6KV1cbiAgICAgICAgbS5zb3J0IChhLGIpIC0+IGItYVxuICAgICAgICBtWzBdKzAuMiptWzFdKzAuMSptWzJdXG4gICAgXG4gICAgbWFuaGF0dGFuOiAobykgLT4gTWF0aC5hYnMoby54LUB4KStNYXRoLmFicyhvLnktQHkpK01hdGguYWJzKG8uei1AeilcbiAgICBkaXN0OiAgIChvKSAtPiBAbWludXMobykubGVuZ3RoKClcbiAgICBsZW5ndGg6ICAgIC0+IE1hdGguc3FydCBAeCpAeCArIEB5KkB5ICsgQHoqQHpcbiAgICBkb3Q6ICAgKHYpIC0+IEB4KnYueCArIEB5KnYueSArIEB6KnYuelxuICAgIFxuICAgIG11bDogICAoZikgLT4gbmV3IFZlY3RvciBAeCpmLCBAeSpmLCBAeipmXG4gICAgZGl2OiAgIChkKSAtPiBuZXcgVmVjdG9yIEB4L2QsIEB5L2QsIEB6L2RcbiAgICBwbHVzOiAgKHYpIC0+IG5ldyBWZWN0b3IodikuYWRkIEBcbiAgICBtaW51czogKHYpIC0+IG5ldyBWZWN0b3IodikubmVnKCkuYWRkIEBcbiAgICBuZWc6ICAgICAgIC0+IG5ldyBWZWN0b3IgLUB4LCAtQHksIC1AelxuICAgIHRvOiAgICAodikgLT4gbmV3IFZlY3Rvcih2KS5zdWIgQFxuICAgICAgICBcbiAgICBhbmdsZTogKHYpIC0+IFxuICAgICAgICBcbiAgICAgICAgaWYgbCA9IEBsZW5ndGgoKVxuICAgICAgICAgICAgaWYgbyA9IHYubGVuZ3RoKClcbiAgICAgICAgICAgICAgICB4ID0gQHggLyBsXG4gICAgICAgICAgICAgICAgeSA9IEB5IC8gbFxuICAgICAgICAgICAgICAgIHogPSBAeiAvIGxcbiAgICAgICAgICAgICAgICBwID0gdi54IC8gb1xuICAgICAgICAgICAgICAgIHEgPSB2LnkgLyBvXG4gICAgICAgICAgICAgICAgciA9IHYueiAvIG9cbiAgICAgICAgICAgICAgICByZXR1cm4gcmFkMmRlZyBNYXRoLmFjb3MgeCpwICsgeSpxICsgeipyXG4gICAgICAgIDAgICAgXG4gICAgXG4gICAgbmVnYXRlOiAgLT4gQHNjYWxlIC0xXG4gICAgc2NhbGU6IChmKSAtPlxuICAgICAgICBAeCAqPSBmXG4gICAgICAgIEB5ICo9IGZcbiAgICAgICAgQHogKj0gZlxuICAgICAgICBAXG4gICAgICAgIFxuICAgIHJlc2V0OiAtPlxuICAgICAgICBAeCA9IEB5ID0gQHogPSAwXG4gICAgICAgIEBcbiAgICBcbiAgICBpc1plcm86IC0+IEB4ID09IEB5ID09IEB6ID09IDBcblxuICAgIHJhbmRvbWl6ZTogLT4gXG4gICAgICAgIEBzZXQgcmFuZFJhbmdlKC0xLDEpLHJhbmRSYW5nZSgtMSwxKSxyYW5kUmFuZ2UoLTEsMSlcbiAgICAgICAgQG5vcm1hbGl6ZSgpXG4gICAgICAgIEBcbiAgICBcbiAgICBAcmFuZG9tOiAtPiBuZXcgVmVjdG9yKCkucmFuZG9taXplKClcbiAgICAgICAgICAgIFxuICAgIEByYXlQbGFuZUludGVyc2VjdGlvbjogKHJheVBvcywgcmF5RGlyZWN0aW9uLCBwbGFuZVBvcywgcGxhbmVOb3JtYWwpIC0+XG4gICAgICAgIHggPSBwbGFuZVBvcy5taW51cyhyYXlQb3MpLmRvdChwbGFuZU5vcm1hbCkgLyByYXlEaXJlY3Rpb24uZG90KHBsYW5lTm9ybWFsKVxuICAgICAgICByZXR1cm4gcmF5UG9zLnBsdXMgcmF5RGlyZWN0aW9uLm11bCB4XG5cbiAgICBAcG9pbnRNYXBwZWRUb1BsYW5lOiAocG9pbnQsIHBsYW5lUG9zLCBwbGFuZU5vcm1hbCkgLT5cbiAgICAgICAgcG9pbnQubWludXMocGxhbmVOb3JtYWwpLmRvdCBwb2ludC5taW51cyhwbGFuZVBvcykuZG90KHBsYW5lTm9ybWFsKVxuXG4gICAgQHJheVBsYW5lSW50ZXJzZWN0aW9uRmFjdG9yOiAocmF5UG9zLCByYXlEaXIsIHBsYW5lUG9zLCBwbGFuZU5vcm1hbCkgLT5cbiAgICAgICAgcmF5RG90ID0gcmF5RGlyLmRvdCBwbGFuZU5vcm1hbFxuICAgICAgICBpZiBOdW1iZXIuaXNOYU4gcmF5RG90XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3JcbiAgICAgICAgcmV0dXJuIDIgaWYgcmF5RG90ID09IDBcbiAgICAgICAgciA9IHBsYW5lUG9zLm1pbnVzKHJheVBvcykuZG90KHBsYW5lTm9ybWFsKSAvIHJheURvdFxuICAgICAgICBpZiBOdW1iZXIuaXNOYU4gclxuICAgICAgICAgICAgbG9nICdyYXlQb3MnLCByYXlQb3NcbiAgICAgICAgICAgIGxvZyAncmF5RGlyJywgcmF5RGlyXG4gICAgICAgICAgICBsb2cgJ3BsYW5lUG9zJywgcGxhbmVQb3NcbiAgICAgICAgICAgIGxvZyAncGxhbmVOb3JtYWwnLCBwbGFuZU5vcm1hbFxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yXG4gICAgICAgIHJcblxuICAgIEBQWCA9IDBcbiAgICBAUFkgPSAxXG4gICAgQFBaID0gMlxuICAgIEBOWCA9IDNcbiAgICBATlkgPSA0XG4gICAgQE5aID0gNVxuICAgICAgICBcbiAgICBAdW5pdFggID0gbmV3IFZlY3RvciAxLDAsMFxuICAgIEB1bml0WSAgPSBuZXcgVmVjdG9yIDAsMSwwXG4gICAgQHVuaXRaICA9IG5ldyBWZWN0b3IgMCwwLDFcbiAgICBAbWludXNYID0gbmV3IFZlY3RvciAtMSwwLDBcbiAgICBAbWludXNZID0gbmV3IFZlY3RvciAwLC0xLDBcbiAgICBAbWludXNaID0gbmV3IFZlY3RvciAwLDAsLTFcbiAgICBcbiAgICBAbm9ybWFscyA9IFtWZWN0b3IudW5pdFgsIFZlY3Rvci51bml0WSwgVmVjdG9yLnVuaXRaLCBWZWN0b3IubWludXNYLCBWZWN0b3IubWludXNZLCBWZWN0b3IubWludXNaXVxuICAgIFxuICAgIEBwZXJwTm9ybWFsczogKHYpIC0+IFxuICAgICAgICBpID0gQG5vcm1hbEluZGV4KHYpXG4gICAgICAgIHN3aXRjaCBpXG4gICAgICAgICAgICB3aGVuIEBQWCB0aGVuIFtAdW5pdFksIEB1bml0WiwgQG1pbnVzWSwgQG1pbnVzWl1cbiAgICAgICAgICAgIHdoZW4gQFBZIHRoZW4gW0BtaW51c1gsIEB1bml0WiwgQHVuaXRYLCBAbWludXNaXVxuICAgICAgICAgICAgd2hlbiBAUFogdGhlbiBbQHVuaXRZLCBAbWludXNYLCBAbWludXNZLCBAdW5pdFhdXG4gICAgICAgICAgICB3aGVuIEBOWCB0aGVuIFtAdW5pdFksIEBtaW51c1osIEBtaW51c1ksIEB1bml0Wl0gICAgICAgICAgICBcbiAgICAgICAgICAgIHdoZW4gQE5ZIHRoZW4gW0BtaW51c1gsIEBtaW51c1osIEB1bml0WCwgQHVuaXRaXSAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hlbiBATlogdGhlbiBbQHVuaXRZLCBAdW5pdFgsIEBtaW51c1ksIEBtaW51c1hdICAgICAgICAgICAgXG4gICAgXG4gICAgQG5vcm1hbEluZGV4OiAodikgLT4gXG4gICAgXG4gICAgICAgIGNuID0gQGNsb3Nlc3ROb3JtYWwgdlxuICAgICAgICBmb3IgaSBpbiBbMC4uLjZdXG4gICAgICAgICAgICBpZiBWZWN0b3Iubm9ybWFsc1tpXS5lcXVhbHMgY25cbiAgICAgICAgICAgICAgICByZXR1cm4gaVxuICAgICAgICAtMVxuICAgIFxuICAgIEBjbG9zZXN0Tm9ybWFsOiAodikgLT5cbiAgICAgICAgXG4gICAgICAgIFZlY3Rvci50bXAuY29weSB2XG4gICAgICAgIFZlY3Rvci50bXAubm9ybWFsaXplKClcbiAgICAgICAgYW5nbGVzID0gW11cbiAgICAgICAgZm9yIG4gaW4gVmVjdG9yLm5vcm1hbHNcbiAgICAgICAgICAgIGlmIG4uZXF1YWxzIFZlY3Rvci50bXBcbiAgICAgICAgICAgICAgICByZXR1cm4gblxuICAgICAgICAgICAgYW5nbGVzLnB1c2ggW24uYW5nbGUoVmVjdG9yLnRtcCksIG5dXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGFuZ2xlcy5zb3J0IChhLGIpIC0+IGFbMF0tYlswXVxuICAgICAgICBhbmdsZXNbMF1bMV1cbiAgICBcbm1vZHVsZS5leHBvcnRzID0gVmVjdG9yXG4iXX0=
//# sourceURL=../coffee/vector.coffee