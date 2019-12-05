// koffee 1.6.0

/*
000   000  00000000   0000000  000000000
000   000  000       000          000   
 000 000   0000000   000          000   
   000     000       000          000   
    0      00000000   0000000     000
 */
var Vect, Vector3, abs, acos, atan2, rad2deg, randRange, ref, round, sqrt,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), randRange = ref.randRange, rad2deg = ref.rad2deg;

Vector3 = require('babylonjs').Vector3;

round = Math.round, acos = Math.acos, atan2 = Math.atan2, abs = Math.abs, sqrt = Math.sqrt;

Vect = (function(superClass) {
    extend(Vect, superClass);

    Vect.counter = 0;

    Vect.tmp = new Vect;

    function Vect(x, y, z) {
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
        Vect.counter += 1;
        if ((x.x != null) && (x.y != null)) {
            Vect.__super__.constructor.call(this, x.x, x.y, (ref1 = x.z) != null ? ref1 : 0);
        } else if (Array.isArray(x)) {
            Vect.__super__.constructor.call(this, x[0], x[1], (ref2 = x[2]) != null ? ref2 : 0);
        } else {
            Vect.__super__.constructor.call(this, x, y, z != null ? z : 0);
        }
        if (Number.isNaN(this.x)) {
            throw new Error;
        }
    }

    Vect.prototype.applyQuaternion = function(quaternion) {
        return this.rotateByQuaternionAroundPointToRef(quaternion, Vect.Zero, this);
    };

    Vect.prototype.toString = function() {
        return this.x + " " + this.y + " " + this.z;
    };

    Vect.prototype.clone = function() {
        return new Vect(this);
    };

    Vect.prototype.copy = function(v) {
        var ref1;
        this.x = v.x;
        this.y = v.y;
        this.z = (ref1 = v.z) != null ? ref1 : 0;
        return this;
    };

    Vect.prototype.parallel = function(n) {
        var dot;
        dot = this.x * n.x + this.y * n.y + this.z * n.z;
        return new Vect(dot * n.x, dot * n.y, dot * n.z);
    };

    Vect.prototype.perpendicular = function(n) {
        var dot;
        dot = this.x * n.x + this.y * n.y + this.z * n.z;
        return new Vect(this.x - dot * n.x, this.y - dot * n.y, this.z - dot * n.z);
    };

    Vect.prototype.reflect = function(n) {
        var dot;
        dot = 2 * (this.x * n.x + this.y * n.y + this.z * n.z);
        return new Vect(this.x - dot * n.x, this.y - dot * n.y, this.z - dot * n.z);
    };

    Vect.prototype.rotated = function(axis, angle) {
        return this.clone().rotate(axis, angle);
    };

    Vect.prototype.rotate = function(axis, angle) {
        var Quat;
        Quat = require('./quat');
        this.applyQuaternion(Quat.axisAngle(axis, angle));
        return this;
    };

    Vect.prototype.crossed = function(v) {
        return this.clone().cross(v);
    };

    Vect.prototype.cross = function(v) {
        var ax, ay, az;
        ax = this.x;
        ay = this.y;
        az = this.z;
        this.x = ay * v.z - az * v.y;
        this.y = az * v.x - ax * v.z;
        this.z = ax * v.y - ay * v.x;
        return this;
    };

    Vect.prototype.normal = function() {
        return this.clone().normalize();
    };

    Vect.prototype.normalize = function() {
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

    Vect.prototype.xyperp = function() {
        return new Vect(-this.y, this.x);
    };

    Vect.prototype.rounded = function() {
        return this.clone().round();
    };

    Vect.prototype.round = function() {
        this.x = round(this.x);
        this.y = round(this.y);
        this.z = round(this.z);
        return this;
    };

    Vect.prototype.equals = function(o) {
        return this.manhattan(o) < 0.001;
    };

    Vect.prototype.same = function(o) {
        var z;
        return this.x === o.x && this.y === o.y && (z = o.z);
    };

    Vect.prototype.faded = function(o, val) {
        return this.clone().fade(o, val);
    };

    Vect.prototype.fade = function(o, val) {
        this.x = this.x * (1 - val) + o.x * val;
        this.y = this.y * (1 - val) + o.y * val;
        this.z = this.z * (1 - val) + o.z * val;
        return this;
    };

    Vect.prototype.xyangle = function(v) {
        var otherXY, thisXY;
        thisXY = new Vect(this.x, this.y).normal();
        otherXY = new Vect(v.x, v.y).normal();
        if (thisXY.xyperp().dot(otherXY >= 0)) {
            return rad2deg(acos(thisXY.dot(otherXY)));
        }
        return -rad2deg(acos(thisXY.dot(otherXY)));
    };

    Vect.prototype.paris = function(o) {
        var m;
        m = [abs(o.x - this.x), abs(o.y - this.y), abs(o.z - this.z)];
        m.sort(function(a, b) {
            return b - a;
        });
        return m[0] + 0.2 * m[1] + 0.1 * m[2];
    };

    Vect.prototype.manhattan = function(o) {
        return abs(o.x - this.x) + abs(o.y - this.y) + abs(o.z - this.z);
    };

    Vect.prototype.dist = function(o) {
        return this.minus(o).length();
    };

    Vect.prototype.length = function() {
        return sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    };

    Vect.prototype.dot = function(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    };

    Vect.prototype.add = function(v) {
        return this.addInPlace(v);
    };

    Vect.prototype.mul = function(f) {
        return new Vect(this.x * f, this.y * f, this.z * f);
    };

    Vect.prototype.div = function(d) {
        return new Vect(this.x / d, this.y / d, this.z / d);
    };

    Vect.prototype.plus = function(v) {
        return new Vect(v).add(this);
    };

    Vect.prototype.minus = function(v) {
        return new Vect(v).neg().add(this);
    };

    Vect.prototype.neg = function() {
        return new Vect(-this.x, -this.y, -this.z);
    };

    Vect.prototype.to = function(v) {
        return new Vect(v).sub(this);
    };

    Vect.prototype.angle = function(v) {
        var l, o, p, q, r, x, y, z;
        if (l = this.length()) {
            if (o = v.length()) {
                x = this.x / l;
                y = this.y / l;
                z = this.z / l;
                p = v.x / o;
                q = v.y / o;
                r = v.z / o;
                return rad2deg(acos(x * p + y * q + z * r));
            }
        }
        return 0;
    };

    Vect.prototype.negate = function() {
        return this.scale(-1);
    };

    Vect.prototype.scale = function(f) {
        this.x *= f;
        this.y *= f;
        this.z *= f;
        return this;
    };

    Vect.prototype.reset = function() {
        this.x = this.y = this.z = 0;
        return this;
    };

    Vect.prototype.isZero = function() {
        var ref1, ref2;
        return ((this.x === (ref2 = this.y) && ref2 === (ref1 = this.z)) && ref1 === 0);
    };

    Vect.prototype.randomize = function() {
        this.set(randRange(-1, 1), randRange(-1, 1), randRange(-1, 1));
        this.normalize();
        return this;
    };

    Vect.prototype.polarize = function() {
        var phi, radius, theta;
        radius = this.length();
        theta = atan2(this.y, this.x);
        phi = acos(this.z / radius);
        this.x = theta;
        this.y = phi;
        this.z = radius;
        return this;
    };

    Vect.random = function() {
        return new Vect().randomize();
    };

    Vect.rayPlaneIntersection = function(rayPos, rayDirection, planePos, planeNormal) {
        var x;
        x = planePos.minus(rayPos).dot(planeNormal) / rayDirection.dot(planeNormal);
        return rayPos.plus(rayDirection.mul(x));
    };

    Vect.pointMappedToPlane = function(point, planePos, planeNormal) {
        return point.minus(planeNormal).dot(point.minus(planePos).dot(planeNormal));
    };

    Vect.rayPlaneIntersectionFactor = function(rayPos, rayDir, planePos, planeNormal) {
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

    Vect.PX = 0;

    Vect.PY = 1;

    Vect.PZ = 2;

    Vect.NX = 3;

    Vect.NY = 4;

    Vect.NZ = 5;

    Vect.Zero = new Vect(0, 0, 0);

    Vect.unitX = new Vect(1, 0, 0);

    Vect.unitY = new Vect(0, 1, 0);

    Vect.unitZ = new Vect(0, 0, 1);

    Vect.minusX = new Vect(-1, 0, 0);

    Vect.minusY = new Vect(0, -1, 0);

    Vect.minusZ = new Vect(0, 0, -1);

    Vect.normals = [Vect.unitX, Vect.unitY, Vect.unitZ, Vect.minusX, Vect.minusY, Vect.minusZ];

    Vect.perpNormals = function(v) {
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

    Vect.normalIndex = function(v) {
        var cn, i, j;
        cn = this.closestNormal(v);
        for (i = j = 0; j < 6; i = ++j) {
            if (Vect.normals[i].equals(cn)) {
                return i;
            }
        }
        return -1;
    };

    Vect.closestNormal = function(v) {
        var angles, j, len, n, ref1;
        Vect.tmp.copy(v);
        Vect.tmp.normalize();
        angles = [];
        ref1 = Vect.normals;
        for (j = 0, len = ref1.length; j < len; j++) {
            n = ref1[j];
            if (n.equals(Vect.tmp)) {
                return n;
            }
            angles.push([n.angle(Vect.tmp), n]);
        }
        angles.sort(function(a, b) {
            return a[0] - b[0];
        });
        return angles[0][1];
    };

    return Vect;

})(Vector3);

module.exports = Vect;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVjdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEscUVBQUE7SUFBQTs7O0FBUUEsTUFBeUIsT0FBQSxDQUFRLEtBQVIsQ0FBekIsRUFBRSx5QkFBRixFQUFhOztBQUNYLFVBQVksT0FBQSxDQUFRLFdBQVI7O0FBQ1osa0JBQUYsRUFBUyxnQkFBVCxFQUFlLGtCQUFmLEVBQXNCLGNBQXRCLEVBQTJCOztBQUVyQjs7O0lBRUYsSUFBQyxDQUFBLE9BQUQsR0FBVzs7SUFDWCxJQUFDLENBQUEsR0FBRCxHQUFPLElBQUk7O0lBRVIsY0FBQyxDQUFELEVBQUssQ0FBTCxFQUFTLENBQVQ7QUFFQyxZQUFBOztZQUZBLElBQUU7OztZQUFFLElBQUU7OztZQUFFLElBQUU7O1FBRVYsSUFBSSxDQUFDLE9BQUwsSUFBZ0I7UUFFaEIsSUFBRyxhQUFBLElBQVMsYUFBWjtZQUNJLHNDQUFNLENBQUMsQ0FBQyxDQUFSLEVBQVcsQ0FBQyxDQUFDLENBQWIsZ0NBQXNCLENBQXRCLEVBREo7U0FBQSxNQUVLLElBQUcsS0FBSyxDQUFDLE9BQU4sQ0FBYyxDQUFkLENBQUg7WUFDRCxzQ0FBTSxDQUFFLENBQUEsQ0FBQSxDQUFSLEVBQVksQ0FBRSxDQUFBLENBQUEsQ0FBZCxpQ0FBeUIsQ0FBekIsRUFEQztTQUFBLE1BQUE7WUFHRCxzQ0FBTSxDQUFOLEVBQVMsQ0FBVCxjQUFZLElBQUksQ0FBaEIsRUFIQzs7UUFJTCxJQUFHLE1BQU0sQ0FBQyxLQUFQLENBQWEsSUFBQyxDQUFBLENBQWQsQ0FBSDtBQUNJLGtCQUFNLElBQUksTUFEZDs7SUFWRDs7bUJBYUgsZUFBQSxHQUFpQixTQUFDLFVBQUQ7ZUFFYixJQUFDLENBQUEsa0NBQUQsQ0FBb0MsVUFBcEMsRUFBZ0QsSUFBSSxDQUFDLElBQXJELEVBQTJELElBQTNEO0lBRmE7O21CQUlqQixRQUFBLEdBQVUsU0FBQTtlQUFNLElBQUMsQ0FBQSxDQUFGLEdBQUksR0FBSixHQUFPLElBQUMsQ0FBQSxDQUFSLEdBQVUsR0FBVixHQUFhLElBQUMsQ0FBQTtJQUFuQjs7bUJBRVYsS0FBQSxHQUFPLFNBQUE7ZUFBRyxJQUFJLElBQUosQ0FBUyxJQUFUO0lBQUg7O21CQUNQLElBQUEsR0FBTSxTQUFDLENBQUQ7QUFDRixZQUFBO1FBQUEsSUFBQyxDQUFBLENBQUQsR0FBSyxDQUFDLENBQUM7UUFDUCxJQUFDLENBQUEsQ0FBRCxHQUFLLENBQUMsQ0FBQztRQUNQLElBQUMsQ0FBQSxDQUFELGlDQUFXO2VBQ1g7SUFKRTs7bUJBTU4sUUFBQSxHQUFVLFNBQUMsQ0FBRDtBQUNOLFlBQUE7UUFBQSxHQUFBLEdBQU0sSUFBQyxDQUFBLENBQUQsR0FBRyxDQUFDLENBQUMsQ0FBTCxHQUFTLElBQUMsQ0FBQSxDQUFELEdBQUcsQ0FBQyxDQUFDLENBQWQsR0FBa0IsSUFBQyxDQUFBLENBQUQsR0FBRyxDQUFDLENBQUM7ZUFDN0IsSUFBSSxJQUFKLENBQVMsR0FBQSxHQUFJLENBQUMsQ0FBQyxDQUFmLEVBQWtCLEdBQUEsR0FBSSxDQUFDLENBQUMsQ0FBeEIsRUFBMkIsR0FBQSxHQUFJLENBQUMsQ0FBQyxDQUFqQztJQUZNOzttQkFJVixhQUFBLEdBQWUsU0FBQyxDQUFEO0FBQ1gsWUFBQTtRQUFBLEdBQUEsR0FBTSxJQUFDLENBQUEsQ0FBRCxHQUFHLENBQUMsQ0FBQyxDQUFMLEdBQVMsSUFBQyxDQUFBLENBQUQsR0FBRyxDQUFDLENBQUMsQ0FBZCxHQUFrQixJQUFDLENBQUEsQ0FBRCxHQUFHLENBQUMsQ0FBQztlQUM3QixJQUFJLElBQUosQ0FBUyxJQUFDLENBQUEsQ0FBRCxHQUFHLEdBQUEsR0FBSSxDQUFDLENBQUMsQ0FBbEIsRUFBcUIsSUFBQyxDQUFBLENBQUQsR0FBRyxHQUFBLEdBQUksQ0FBQyxDQUFDLENBQTlCLEVBQWlDLElBQUMsQ0FBQSxDQUFELEdBQUcsR0FBQSxHQUFJLENBQUMsQ0FBQyxDQUExQztJQUZXOzttQkFJZixPQUFBLEdBQVMsU0FBQyxDQUFEO0FBQ0wsWUFBQTtRQUFBLEdBQUEsR0FBTSxDQUFBLEdBQUUsQ0FBQyxJQUFDLENBQUEsQ0FBRCxHQUFHLENBQUMsQ0FBQyxDQUFMLEdBQVMsSUFBQyxDQUFBLENBQUQsR0FBRyxDQUFDLENBQUMsQ0FBZCxHQUFrQixJQUFDLENBQUEsQ0FBRCxHQUFHLENBQUMsQ0FBQyxDQUF4QjtlQUNSLElBQUksSUFBSixDQUFTLElBQUMsQ0FBQSxDQUFELEdBQUcsR0FBQSxHQUFJLENBQUMsQ0FBQyxDQUFsQixFQUFxQixJQUFDLENBQUEsQ0FBRCxHQUFHLEdBQUEsR0FBSSxDQUFDLENBQUMsQ0FBOUIsRUFBaUMsSUFBQyxDQUFBLENBQUQsR0FBRyxHQUFBLEdBQUksQ0FBQyxDQUFDLENBQTFDO0lBRks7O21CQUlULE9BQUEsR0FBUyxTQUFDLElBQUQsRUFBTyxLQUFQO2VBQWlCLElBQUMsQ0FBQSxLQUFELENBQUEsQ0FBUSxDQUFDLE1BQVQsQ0FBZ0IsSUFBaEIsRUFBcUIsS0FBckI7SUFBakI7O21CQUNULE1BQUEsR0FBUSxTQUFDLElBQUQsRUFBTyxLQUFQO0FBQ0osWUFBQTtRQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjtRQUNQLElBQUMsQ0FBQSxlQUFELENBQWlCLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBZixFQUFxQixLQUFyQixDQUFqQjtlQUNBO0lBSEk7O21CQUtSLE9BQUEsR0FBUyxTQUFDLENBQUQ7ZUFBTyxJQUFDLENBQUEsS0FBRCxDQUFBLENBQVEsQ0FBQyxLQUFULENBQWUsQ0FBZjtJQUFQOzttQkFDVCxLQUFBLEdBQU8sU0FBQyxDQUFEO0FBQ0gsWUFBQTtRQUFBLEVBQUEsR0FBSyxJQUFDLENBQUE7UUFDTixFQUFBLEdBQUssSUFBQyxDQUFBO1FBQ04sRUFBQSxHQUFLLElBQUMsQ0FBQTtRQUNOLElBQUMsQ0FBQSxDQUFELEdBQUssRUFBQSxHQUFLLENBQUMsQ0FBQyxDQUFQLEdBQVcsRUFBQSxHQUFLLENBQUMsQ0FBQztRQUN2QixJQUFDLENBQUEsQ0FBRCxHQUFLLEVBQUEsR0FBSyxDQUFDLENBQUMsQ0FBUCxHQUFXLEVBQUEsR0FBSyxDQUFDLENBQUM7UUFDdkIsSUFBQyxDQUFBLENBQUQsR0FBSyxFQUFBLEdBQUssQ0FBQyxDQUFDLENBQVAsR0FBVyxFQUFBLEdBQUssQ0FBQyxDQUFDO2VBQ3ZCO0lBUEc7O21CQVNQLE1BQUEsR0FBUSxTQUFBO2VBQUcsSUFBQyxDQUFBLEtBQUQsQ0FBQSxDQUFRLENBQUMsU0FBVCxDQUFBO0lBQUg7O21CQUNSLFNBQUEsR0FBVyxTQUFBO0FBQ1AsWUFBQTtRQUFBLENBQUEsR0FBSSxJQUFDLENBQUEsTUFBRCxDQUFBO1FBQ0osSUFBRyxDQUFIO1lBQ0ksQ0FBQSxHQUFJLEdBQUEsR0FBSTtZQUNSLElBQUMsQ0FBQSxDQUFELElBQU07WUFDTixJQUFDLENBQUEsQ0FBRCxJQUFNO1lBQ04sSUFBQyxDQUFBLENBQUQsSUFBTSxFQUpWOztlQUtBO0lBUE87O21CQVNYLE1BQUEsR0FBUSxTQUFBO2VBQUcsSUFBSSxJQUFKLENBQVMsQ0FBQyxJQUFDLENBQUEsQ0FBWCxFQUFjLElBQUMsQ0FBQSxDQUFmO0lBQUg7O21CQUVSLE9BQUEsR0FBUyxTQUFBO2VBQUcsSUFBQyxDQUFBLEtBQUQsQ0FBQSxDQUFRLENBQUMsS0FBVCxDQUFBO0lBQUg7O21CQUNULEtBQUEsR0FBTyxTQUFBO1FBQ0gsSUFBQyxDQUFBLENBQUQsR0FBSyxLQUFBLENBQU0sSUFBQyxDQUFBLENBQVA7UUFDTCxJQUFDLENBQUEsQ0FBRCxHQUFLLEtBQUEsQ0FBTSxJQUFDLENBQUEsQ0FBUDtRQUNMLElBQUMsQ0FBQSxDQUFELEdBQUssS0FBQSxDQUFNLElBQUMsQ0FBQSxDQUFQO2VBQ0w7SUFKRzs7bUJBTVAsTUFBQSxHQUFRLFNBQUMsQ0FBRDtlQUFPLElBQUMsQ0FBQSxTQUFELENBQVcsQ0FBWCxDQUFBLEdBQWdCO0lBQXZCOzttQkFDUixJQUFBLEdBQVEsU0FBQyxDQUFEO0FBQU8sWUFBQTtlQUFBLElBQUMsQ0FBQSxDQUFELEtBQUksQ0FBQyxDQUFDLENBQU4sSUFBWSxJQUFDLENBQUEsQ0FBRCxLQUFJLENBQUMsQ0FBQyxDQUFsQixJQUF3QixDQUFBLENBQUEsR0FBRSxDQUFDLENBQUMsQ0FBSjtJQUEvQjs7bUJBRVIsS0FBQSxHQUFPLFNBQUMsQ0FBRCxFQUFJLEdBQUo7ZUFBWSxJQUFDLENBQUEsS0FBRCxDQUFBLENBQVEsQ0FBQyxJQUFULENBQWMsQ0FBZCxFQUFpQixHQUFqQjtJQUFaOzttQkFDUCxJQUFBLEdBQU0sU0FBQyxDQUFELEVBQUksR0FBSjtRQUVGLElBQUMsQ0FBQSxDQUFELEdBQUssSUFBQyxDQUFBLENBQUQsR0FBSyxDQUFDLENBQUEsR0FBRSxHQUFILENBQUwsR0FBZSxDQUFDLENBQUMsQ0FBRixHQUFNO1FBQzFCLElBQUMsQ0FBQSxDQUFELEdBQUssSUFBQyxDQUFBLENBQUQsR0FBSyxDQUFDLENBQUEsR0FBRSxHQUFILENBQUwsR0FBZSxDQUFDLENBQUMsQ0FBRixHQUFNO1FBQzFCLElBQUMsQ0FBQSxDQUFELEdBQUssSUFBQyxDQUFBLENBQUQsR0FBSyxDQUFDLENBQUEsR0FBRSxHQUFILENBQUwsR0FBZSxDQUFDLENBQUMsQ0FBRixHQUFNO2VBQzFCO0lBTEU7O21CQU9OLE9BQUEsR0FBUyxTQUFDLENBQUQ7QUFFTCxZQUFBO1FBQUEsTUFBQSxHQUFVLElBQUksSUFBSixDQUFTLElBQUMsQ0FBQSxDQUFWLEVBQWEsSUFBQyxDQUFBLENBQWQsQ0FBZ0IsQ0FBQyxNQUFqQixDQUFBO1FBQ1YsT0FBQSxHQUFVLElBQUksSUFBSixDQUFTLENBQUMsQ0FBQyxDQUFYLEVBQWMsQ0FBQyxDQUFDLENBQWhCLENBQWtCLENBQUMsTUFBbkIsQ0FBQTtRQUNWLElBQUcsTUFBTSxDQUFDLE1BQVAsQ0FBQSxDQUFlLENBQUMsR0FBaEIsQ0FBb0IsT0FBQSxJQUFXLENBQS9CLENBQUg7QUFDSSxtQkFBTyxPQUFBLENBQVEsSUFBQSxDQUFLLE1BQU0sQ0FBQyxHQUFQLENBQVcsT0FBWCxDQUFMLENBQVIsRUFEWDs7ZUFFQSxDQUFDLE9BQUEsQ0FBUSxJQUFBLENBQUssTUFBTSxDQUFDLEdBQVAsQ0FBVyxPQUFYLENBQUwsQ0FBUjtJQU5JOzttQkFRVCxLQUFBLEdBQU8sU0FBQyxDQUFEO0FBQ0gsWUFBQTtRQUFBLENBQUEsR0FBSSxDQUFDLEdBQUEsQ0FBSSxDQUFDLENBQUMsQ0FBRixHQUFJLElBQUMsQ0FBQSxDQUFULENBQUQsRUFBYSxHQUFBLENBQUksQ0FBQyxDQUFDLENBQUYsR0FBSSxJQUFDLENBQUEsQ0FBVCxDQUFiLEVBQXlCLEdBQUEsQ0FBSSxDQUFDLENBQUMsQ0FBRixHQUFJLElBQUMsQ0FBQSxDQUFULENBQXpCO1FBQ0osQ0FBQyxDQUFDLElBQUYsQ0FBTyxTQUFDLENBQUQsRUFBRyxDQUFIO21CQUFTLENBQUEsR0FBRTtRQUFYLENBQVA7ZUFDQSxDQUFFLENBQUEsQ0FBQSxDQUFGLEdBQUssR0FBQSxHQUFJLENBQUUsQ0FBQSxDQUFBLENBQVgsR0FBYyxHQUFBLEdBQUksQ0FBRSxDQUFBLENBQUE7SUFIakI7O21CQUtQLFNBQUEsR0FBVyxTQUFDLENBQUQ7ZUFBTyxHQUFBLENBQUksQ0FBQyxDQUFDLENBQUYsR0FBSSxJQUFDLENBQUEsQ0FBVCxDQUFBLEdBQVksR0FBQSxDQUFJLENBQUMsQ0FBQyxDQUFGLEdBQUksSUFBQyxDQUFBLENBQVQsQ0FBWixHQUF3QixHQUFBLENBQUksQ0FBQyxDQUFDLENBQUYsR0FBSSxJQUFDLENBQUEsQ0FBVDtJQUEvQjs7bUJBQ1gsSUFBQSxHQUFRLFNBQUMsQ0FBRDtlQUFPLElBQUMsQ0FBQSxLQUFELENBQU8sQ0FBUCxDQUFTLENBQUMsTUFBVixDQUFBO0lBQVA7O21CQUNSLE1BQUEsR0FBVyxTQUFBO2VBQUcsSUFBQSxDQUFLLElBQUMsQ0FBQSxDQUFELEdBQUcsSUFBQyxDQUFBLENBQUosR0FBUSxJQUFDLENBQUEsQ0FBRCxHQUFHLElBQUMsQ0FBQSxDQUFaLEdBQWdCLElBQUMsQ0FBQSxDQUFELEdBQUcsSUFBQyxDQUFBLENBQXpCO0lBQUg7O21CQUNYLEdBQUEsR0FBTyxTQUFDLENBQUQ7ZUFBTyxJQUFDLENBQUEsQ0FBRCxHQUFHLENBQUMsQ0FBQyxDQUFMLEdBQVMsSUFBQyxDQUFBLENBQUQsR0FBRyxDQUFDLENBQUMsQ0FBZCxHQUFrQixJQUFDLENBQUEsQ0FBRCxHQUFHLENBQUMsQ0FBQztJQUE5Qjs7bUJBRVAsR0FBQSxHQUFPLFNBQUMsQ0FBRDtlQUFPLElBQUMsQ0FBQSxVQUFELENBQVksQ0FBWjtJQUFQOzttQkFDUCxHQUFBLEdBQU8sU0FBQyxDQUFEO2VBQU8sSUFBSSxJQUFKLENBQVMsSUFBQyxDQUFBLENBQUQsR0FBRyxDQUFaLEVBQWUsSUFBQyxDQUFBLENBQUQsR0FBRyxDQUFsQixFQUFxQixJQUFDLENBQUEsQ0FBRCxHQUFHLENBQXhCO0lBQVA7O21CQUNQLEdBQUEsR0FBTyxTQUFDLENBQUQ7ZUFBTyxJQUFJLElBQUosQ0FBUyxJQUFDLENBQUEsQ0FBRCxHQUFHLENBQVosRUFBZSxJQUFDLENBQUEsQ0FBRCxHQUFHLENBQWxCLEVBQXFCLElBQUMsQ0FBQSxDQUFELEdBQUcsQ0FBeEI7SUFBUDs7bUJBQ1AsSUFBQSxHQUFPLFNBQUMsQ0FBRDtlQUFPLElBQUksSUFBSixDQUFTLENBQVQsQ0FBVyxDQUFDLEdBQVosQ0FBZ0IsSUFBaEI7SUFBUDs7bUJBQ1AsS0FBQSxHQUFPLFNBQUMsQ0FBRDtlQUFPLElBQUksSUFBSixDQUFTLENBQVQsQ0FBVyxDQUFDLEdBQVosQ0FBQSxDQUFpQixDQUFDLEdBQWxCLENBQXNCLElBQXRCO0lBQVA7O21CQUNQLEdBQUEsR0FBVyxTQUFBO2VBQUcsSUFBSSxJQUFKLENBQVMsQ0FBQyxJQUFDLENBQUEsQ0FBWCxFQUFjLENBQUMsSUFBQyxDQUFBLENBQWhCLEVBQW1CLENBQUMsSUFBQyxDQUFBLENBQXJCO0lBQUg7O21CQUNYLEVBQUEsR0FBTyxTQUFDLENBQUQ7ZUFBTyxJQUFJLElBQUosQ0FBUyxDQUFULENBQVcsQ0FBQyxHQUFaLENBQWdCLElBQWhCO0lBQVA7O21CQUVQLEtBQUEsR0FBTyxTQUFDLENBQUQ7QUFFSCxZQUFBO1FBQUEsSUFBRyxDQUFBLEdBQUksSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFQO1lBQ0ksSUFBRyxDQUFBLEdBQUksQ0FBQyxDQUFDLE1BQUYsQ0FBQSxDQUFQO2dCQUNJLENBQUEsR0FBSSxJQUFDLENBQUEsQ0FBRCxHQUFLO2dCQUNULENBQUEsR0FBSSxJQUFDLENBQUEsQ0FBRCxHQUFLO2dCQUNULENBQUEsR0FBSSxJQUFDLENBQUEsQ0FBRCxHQUFLO2dCQUNULENBQUEsR0FBSSxDQUFDLENBQUMsQ0FBRixHQUFNO2dCQUNWLENBQUEsR0FBSSxDQUFDLENBQUMsQ0FBRixHQUFNO2dCQUNWLENBQUEsR0FBSSxDQUFDLENBQUMsQ0FBRixHQUFNO0FBQ1YsdUJBQU8sT0FBQSxDQUFRLElBQUEsQ0FBSyxDQUFBLEdBQUUsQ0FBRixHQUFNLENBQUEsR0FBRSxDQUFSLEdBQVksQ0FBQSxHQUFFLENBQW5CLENBQVIsRUFQWDthQURKOztlQVNBO0lBWEc7O21CQWFQLE1BQUEsR0FBUyxTQUFBO2VBQUcsSUFBQyxDQUFBLEtBQUQsQ0FBTyxDQUFDLENBQVI7SUFBSDs7bUJBQ1QsS0FBQSxHQUFPLFNBQUMsQ0FBRDtRQUNILElBQUMsQ0FBQSxDQUFELElBQU07UUFDTixJQUFDLENBQUEsQ0FBRCxJQUFNO1FBQ04sSUFBQyxDQUFBLENBQUQsSUFBTTtlQUNOO0lBSkc7O21CQU1QLEtBQUEsR0FBTyxTQUFBO1FBQ0gsSUFBQyxDQUFBLENBQUQsR0FBSyxJQUFDLENBQUEsQ0FBRCxHQUFLLElBQUMsQ0FBQSxDQUFELEdBQUs7ZUFDZjtJQUZHOzttQkFJUCxNQUFBLEdBQVEsU0FBQTtBQUFHLFlBQUE7ZUFBQSxDQUFBLENBQUEsSUFBQyxDQUFBLENBQUQsYUFBTSxJQUFDLENBQUEsRUFBUCxRQUFBLGFBQVksSUFBQyxDQUFBLEVBQWIsQ0FBQSxRQUFBLEtBQWtCLENBQWxCO0lBQUg7O21CQUVSLFNBQUEsR0FBVyxTQUFBO1FBQ1AsSUFBQyxDQUFBLEdBQUQsQ0FBSyxTQUFBLENBQVUsQ0FBQyxDQUFYLEVBQWEsQ0FBYixDQUFMLEVBQXFCLFNBQUEsQ0FBVSxDQUFDLENBQVgsRUFBYSxDQUFiLENBQXJCLEVBQXFDLFNBQUEsQ0FBVSxDQUFDLENBQVgsRUFBYSxDQUFiLENBQXJDO1FBQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBQTtlQUNBO0lBSE87O21CQUtYLFFBQUEsR0FBVSxTQUFBO0FBQ04sWUFBQTtRQUFBLE1BQUEsR0FBUyxJQUFDLENBQUEsTUFBRCxDQUFBO1FBQ1QsS0FBQSxHQUFRLEtBQUEsQ0FBTSxJQUFDLENBQUEsQ0FBUCxFQUFVLElBQUMsQ0FBQSxDQUFYO1FBQ1IsR0FBQSxHQUFRLElBQUEsQ0FBSyxJQUFDLENBQUEsQ0FBRCxHQUFLLE1BQVY7UUFDUixJQUFDLENBQUEsQ0FBRCxHQUFLO1FBQ0wsSUFBQyxDQUFBLENBQUQsR0FBSztRQUNMLElBQUMsQ0FBQSxDQUFELEdBQUs7ZUFDTDtJQVBNOztJQVNWLElBQUMsQ0FBQSxNQUFELEdBQVMsU0FBQTtlQUFHLElBQUksSUFBSixDQUFBLENBQVUsQ0FBQyxTQUFYLENBQUE7SUFBSDs7SUFFVCxJQUFDLENBQUEsb0JBQUQsR0FBdUIsU0FBQyxNQUFELEVBQVMsWUFBVCxFQUF1QixRQUF2QixFQUFpQyxXQUFqQztBQUNuQixZQUFBO1FBQUEsQ0FBQSxHQUFJLFFBQVEsQ0FBQyxLQUFULENBQWUsTUFBZixDQUFzQixDQUFDLEdBQXZCLENBQTJCLFdBQTNCLENBQUEsR0FBMEMsWUFBWSxDQUFDLEdBQWIsQ0FBaUIsV0FBakI7QUFDOUMsZUFBTyxNQUFNLENBQUMsSUFBUCxDQUFZLFlBQVksQ0FBQyxHQUFiLENBQWlCLENBQWpCLENBQVo7SUFGWTs7SUFJdkIsSUFBQyxDQUFBLGtCQUFELEdBQXFCLFNBQUMsS0FBRCxFQUFRLFFBQVIsRUFBa0IsV0FBbEI7ZUFDakIsS0FBSyxDQUFDLEtBQU4sQ0FBWSxXQUFaLENBQXdCLENBQUMsR0FBekIsQ0FBNkIsS0FBSyxDQUFDLEtBQU4sQ0FBWSxRQUFaLENBQXFCLENBQUMsR0FBdEIsQ0FBMEIsV0FBMUIsQ0FBN0I7SUFEaUI7O0lBR3JCLElBQUMsQ0FBQSwwQkFBRCxHQUE2QixTQUFDLE1BQUQsRUFBUyxNQUFULEVBQWlCLFFBQWpCLEVBQTJCLFdBQTNCO0FBQ3pCLFlBQUE7UUFBQSxNQUFBLEdBQVMsTUFBTSxDQUFDLEdBQVAsQ0FBVyxXQUFYO1FBQ1QsSUFBRyxNQUFNLENBQUMsS0FBUCxDQUFhLE1BQWIsQ0FBSDtBQUNJLGtCQUFNLElBQUksTUFEZDs7UUFFQSxJQUFZLE1BQUEsS0FBVSxDQUF0QjtBQUFBLG1CQUFPLEVBQVA7O1FBQ0EsQ0FBQSxHQUFJLFFBQVEsQ0FBQyxLQUFULENBQWUsTUFBZixDQUFzQixDQUFDLEdBQXZCLENBQTJCLFdBQTNCLENBQUEsR0FBMEM7UUFDOUMsSUFBRyxNQUFNLENBQUMsS0FBUCxDQUFhLENBQWIsQ0FBSDtZQUNHLE9BQUEsQ0FBQyxHQUFELENBQUssUUFBTCxFQUFjLE1BQWQ7WUFBb0IsT0FBQSxDQUNuQixHQURtQixDQUNmLFFBRGUsRUFDTixNQURNO1lBQ0EsT0FBQSxDQUNuQixHQURtQixDQUNmLFVBRGUsRUFDSixRQURJO1lBQ0ksT0FBQSxDQUN2QixHQUR1QixDQUNuQixhQURtQixFQUNMLFdBREs7QUFFdkIsa0JBQU0sSUFBSSxNQUxkOztlQU1BO0lBWnlCOztJQWM3QixJQUFDLENBQUEsRUFBRCxHQUFNOztJQUNOLElBQUMsQ0FBQSxFQUFELEdBQU07O0lBQ04sSUFBQyxDQUFBLEVBQUQsR0FBTTs7SUFDTixJQUFDLENBQUEsRUFBRCxHQUFNOztJQUNOLElBQUMsQ0FBQSxFQUFELEdBQU07O0lBQ04sSUFBQyxDQUFBLEVBQUQsR0FBTTs7SUFFTixJQUFDLENBQUEsSUFBRCxHQUFVLElBQUksSUFBSixDQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCOztJQUNWLElBQUMsQ0FBQSxLQUFELEdBQVUsSUFBSSxJQUFKLENBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEI7O0lBQ1YsSUFBQyxDQUFBLEtBQUQsR0FBVSxJQUFJLElBQUosQ0FBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQjs7SUFDVixJQUFDLENBQUEsS0FBRCxHQUFVLElBQUksSUFBSixDQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCOztJQUNWLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBSSxJQUFKLENBQVMsQ0FBQyxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQjs7SUFDVixJQUFDLENBQUEsTUFBRCxHQUFVLElBQUksSUFBSixDQUFVLENBQVYsRUFBWSxDQUFDLENBQWIsRUFBZ0IsQ0FBaEI7O0lBQ1YsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFJLElBQUosQ0FBVSxDQUFWLEVBQWEsQ0FBYixFQUFlLENBQUMsQ0FBaEI7O0lBRVYsSUFBQyxDQUFBLE9BQUQsR0FBVyxDQUFDLElBQUksQ0FBQyxLQUFOLEVBQWEsSUFBSSxDQUFDLEtBQWxCLEVBQXlCLElBQUksQ0FBQyxLQUE5QixFQUFxQyxJQUFJLENBQUMsTUFBMUMsRUFBa0QsSUFBSSxDQUFDLE1BQXZELEVBQStELElBQUksQ0FBQyxNQUFwRTs7SUFFWCxJQUFDLENBQUEsV0FBRCxHQUFjLFNBQUMsQ0FBRDtBQUNWLFlBQUE7UUFBQSxDQUFBLEdBQUksSUFBQyxDQUFBLFdBQUQsQ0FBYSxDQUFiO0FBQ0osZ0JBQU8sQ0FBUDtBQUFBLGlCQUNTLElBQUMsQ0FBQSxFQURWO3VCQUNrQixDQUFDLElBQUMsQ0FBQSxLQUFGLEVBQVMsSUFBQyxDQUFBLEtBQVYsRUFBaUIsSUFBQyxDQUFBLE1BQWxCLEVBQTBCLElBQUMsQ0FBQSxNQUEzQjtBQURsQixpQkFFUyxJQUFDLENBQUEsRUFGVjt1QkFFa0IsQ0FBQyxJQUFDLENBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxLQUFYLEVBQWtCLElBQUMsQ0FBQSxLQUFuQixFQUEwQixJQUFDLENBQUEsTUFBM0I7QUFGbEIsaUJBR1MsSUFBQyxDQUFBLEVBSFY7dUJBR2tCLENBQUMsSUFBQyxDQUFBLEtBQUYsRUFBUyxJQUFDLENBQUEsTUFBVixFQUFrQixJQUFDLENBQUEsTUFBbkIsRUFBMkIsSUFBQyxDQUFBLEtBQTVCO0FBSGxCLGlCQUlTLElBQUMsQ0FBQSxFQUpWO3VCQUlrQixDQUFDLElBQUMsQ0FBQSxLQUFGLEVBQVMsSUFBQyxDQUFBLE1BQVYsRUFBa0IsSUFBQyxDQUFBLE1BQW5CLEVBQTJCLElBQUMsQ0FBQSxLQUE1QjtBQUpsQixpQkFLUyxJQUFDLENBQUEsRUFMVjt1QkFLa0IsQ0FBQyxJQUFDLENBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxNQUFYLEVBQW1CLElBQUMsQ0FBQSxLQUFwQixFQUEyQixJQUFDLENBQUEsS0FBNUI7QUFMbEIsaUJBTVMsSUFBQyxDQUFBLEVBTlY7dUJBTWtCLENBQUMsSUFBQyxDQUFBLEtBQUYsRUFBUyxJQUFDLENBQUEsS0FBVixFQUFpQixJQUFDLENBQUEsTUFBbEIsRUFBMEIsSUFBQyxDQUFBLE1BQTNCO0FBTmxCO0lBRlU7O0lBVWQsSUFBQyxDQUFBLFdBQUQsR0FBYyxTQUFDLENBQUQ7QUFFVixZQUFBO1FBQUEsRUFBQSxHQUFLLElBQUMsQ0FBQSxhQUFELENBQWUsQ0FBZjtBQUNMLGFBQVMseUJBQVQ7WUFDSSxJQUFHLElBQUksQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsTUFBaEIsQ0FBdUIsRUFBdkIsQ0FBSDtBQUNJLHVCQUFPLEVBRFg7O0FBREo7ZUFHQSxDQUFDO0lBTlM7O0lBUWQsSUFBQyxDQUFBLGFBQUQsR0FBZ0IsU0FBQyxDQUFEO0FBRVosWUFBQTtRQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBVCxDQUFjLENBQWQ7UUFDQSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVQsQ0FBQTtRQUNBLE1BQUEsR0FBUztBQUNUO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxJQUFHLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBSSxDQUFDLEdBQWQsQ0FBSDtBQUNJLHVCQUFPLEVBRFg7O1lBRUEsTUFBTSxDQUFDLElBQVAsQ0FBWSxDQUFDLENBQUMsQ0FBQyxLQUFGLENBQVEsSUFBSSxDQUFDLEdBQWIsQ0FBRCxFQUFvQixDQUFwQixDQUFaO0FBSEo7UUFLQSxNQUFNLENBQUMsSUFBUCxDQUFZLFNBQUMsQ0FBRCxFQUFHLENBQUg7bUJBQVMsQ0FBRSxDQUFBLENBQUEsQ0FBRixHQUFLLENBQUUsQ0FBQSxDQUFBO1FBQWhCLENBQVo7ZUFDQSxNQUFPLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQTtJQVhFOzs7O0dBck5EOztBQWtPbkIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICBcbiAwMDAgMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgICAgICAwMDAgICBcbiAgIDAwMCAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICBcbiAgICAwICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICBcbiMjI1xuXG57IHJhbmRSYW5nZSwgcmFkMmRlZyB9ID0gcmVxdWlyZSAna3hrJ1xueyBWZWN0b3IzIH0gPSByZXF1aXJlICdiYWJ5bG9uanMnXG57IHJvdW5kLCBhY29zLCBhdGFuMiwgYWJzLCBzcXJ0IH0gPSBNYXRoIFxuXG5jbGFzcyBWZWN0IGV4dGVuZHMgVmVjdG9yM1xuXG4gICAgQGNvdW50ZXIgPSAwXG4gICAgQHRtcCA9IG5ldyBWZWN0XG4gICAgXG4gICAgQDogKHg9MCx5PTAsej0wKSAtPlxuICAgICAgICBcbiAgICAgICAgVmVjdC5jb3VudGVyICs9IDFcbiAgICAgICAgXG4gICAgICAgIGlmIHgueD8gYW5kIHgueT9cbiAgICAgICAgICAgIHN1cGVyIHgueCwgeC55LCB4LnogPyAwXG4gICAgICAgIGVsc2UgaWYgQXJyYXkuaXNBcnJheSB4XG4gICAgICAgICAgICBzdXBlciB4WzBdLCB4WzFdLCB4WzJdID8gMFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBzdXBlciB4LCB5LCB6ID8gMFxuICAgICAgICBpZiBOdW1iZXIuaXNOYU4gQHhcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvclxuICAgICAgICAgICAgXG4gICAgYXBwbHlRdWF0ZXJuaW9uOiAocXVhdGVybmlvbikgLT5cbiAgICAgICAgXG4gICAgICAgIEByb3RhdGVCeVF1YXRlcm5pb25Bcm91bmRQb2ludFRvUmVmIHF1YXRlcm5pb24sIFZlY3QuWmVybywgQFxuICAgICAgICAgICAgXG4gICAgdG9TdHJpbmc6IC0+IFwiI3tAeH0gI3tAeX0gI3tAen1cIlxuICAgICAgICAgICAgXG4gICAgY2xvbmU6IC0+IG5ldyBWZWN0IEBcbiAgICBjb3B5OiAodikgLT4gXG4gICAgICAgIEB4ID0gdi54XG4gICAgICAgIEB5ID0gdi55IFxuICAgICAgICBAeiA9IHYueiA/IDBcbiAgICAgICAgQFxuXG4gICAgcGFyYWxsZWw6IChuKSAtPlxuICAgICAgICBkb3QgPSBAeCpuLnggKyBAeSpuLnkgKyBAeipuLnpcbiAgICAgICAgbmV3IFZlY3QgZG90Km4ueCwgZG90Km4ueSwgZG90Km4uelxuXG4gICAgcGVycGVuZGljdWxhcjogKG4pIC0+ICMgcHJvamVjdGlvbiBvZiBub3JtYWxpemVkIHZlY3RvciBuIHRvIHZlY3RvciB0aGF0IGlzIHBlcnBlbmRpY3VsYXIgdG8gdGhpc1xuICAgICAgICBkb3QgPSBAeCpuLnggKyBAeSpuLnkgKyBAeipuLnpcbiAgICAgICAgbmV3IFZlY3QgQHgtZG90Km4ueCwgQHktZG90Km4ueSwgQHotZG90Km4ueiBcblxuICAgIHJlZmxlY3Q6IChuKSAtPlxuICAgICAgICBkb3QgPSAyKihAeCpuLnggKyBAeSpuLnkgKyBAeipuLnopXG4gICAgICAgIG5ldyBWZWN0IEB4LWRvdCpuLngsIEB5LWRvdCpuLnksIEB6LWRvdCpuLnpcbiAgICAgICAgXG4gICAgcm90YXRlZDogKGF4aXMsIGFuZ2xlKSAtPiBAY2xvbmUoKS5yb3RhdGUgYXhpcyxhbmdsZVxuICAgIHJvdGF0ZTogKGF4aXMsIGFuZ2xlKSAtPlxuICAgICAgICBRdWF0ID0gcmVxdWlyZSAnLi9xdWF0J1xuICAgICAgICBAYXBwbHlRdWF0ZXJuaW9uIFF1YXQuYXhpc0FuZ2xlIGF4aXMsIGFuZ2xlXG4gICAgICAgIEBcblxuICAgIGNyb3NzZWQ6ICh2KSAtPiBAY2xvbmUoKS5jcm9zcyh2KVxuICAgIGNyb3NzOiAodikgLT5cbiAgICAgICAgYXggPSBAeCBcbiAgICAgICAgYXkgPSBAeSBcbiAgICAgICAgYXogPSBAelxuICAgICAgICBAeCA9IGF5ICogdi56IC0gYXogKiB2LnlcbiAgICAgICAgQHkgPSBheiAqIHYueCAtIGF4ICogdi56XG4gICAgICAgIEB6ID0gYXggKiB2LnkgLSBheSAqIHYueFxuICAgICAgICBAXG4gICAgXG4gICAgbm9ybWFsOiAtPiBAY2xvbmUoKS5ub3JtYWxpemUoKVxuICAgIG5vcm1hbGl6ZTogLT5cbiAgICAgICAgbCA9IEBsZW5ndGgoKVxuICAgICAgICBpZiBsXG4gICAgICAgICAgICBsID0gMS4wL2xcbiAgICAgICAgICAgIEB4ICo9IGxcbiAgICAgICAgICAgIEB5ICo9IGxcbiAgICAgICAgICAgIEB6ICo9IGxcbiAgICAgICAgQCAgICBcblxuICAgIHh5cGVycDogLT4gbmV3IFZlY3QgLUB5LCBAeFxuICAgIFxuICAgIHJvdW5kZWQ6IC0+IEBjbG9uZSgpLnJvdW5kKClcbiAgICByb3VuZDogLT4gXG4gICAgICAgIEB4ID0gcm91bmQgQHggXG4gICAgICAgIEB5ID0gcm91bmQgQHkgXG4gICAgICAgIEB6ID0gcm91bmQgQHpcbiAgICAgICAgQFxuXG4gICAgZXF1YWxzOiAobykgLT4gQG1hbmhhdHRhbihvKSA8IDAuMDAxXG4gICAgc2FtZTogICAobykgLT4gQHg9PW8ueCBhbmQgQHk9PW8ueSBhbmQgej1vLnpcblxuICAgIGZhZGVkOiAobywgdmFsKSAtPiBAY2xvbmUoKS5mYWRlIG8sIHZhbFxuICAgIGZhZGU6IChvLCB2YWwpIC0+ICMgbGluZWFyIGludGVycG9sYXRpb24gZnJvbSB0aGlzICh2YWw9PTApIHRvIG90aGVyICh2YWw9PTEpXG4gICAgICAgIFxuICAgICAgICBAeCA9IEB4ICogKDEtdmFsKSArIG8ueCAqIHZhbFxuICAgICAgICBAeSA9IEB5ICogKDEtdmFsKSArIG8ueSAqIHZhbFxuICAgICAgICBAeiA9IEB6ICogKDEtdmFsKSArIG8ueiAqIHZhbFxuICAgICAgICBAXG4gICAgXG4gICAgeHlhbmdsZTogKHYpIC0+XG4gICAgICAgIFxuICAgICAgICB0aGlzWFkgID0gbmV3IFZlY3QoQHgsIEB5KS5ub3JtYWwoKVxuICAgICAgICBvdGhlclhZID0gbmV3IFZlY3Qodi54LCB2LnkpLm5vcm1hbCgpXG4gICAgICAgIGlmIHRoaXNYWS54eXBlcnAoKS5kb3Qgb3RoZXJYWSA+PSAwIFxuICAgICAgICAgICAgcmV0dXJuIHJhZDJkZWcoYWNvcyh0aGlzWFkuZG90IG90aGVyWFkpKVxuICAgICAgICAtcmFkMmRlZyhhY29zKHRoaXNYWS5kb3Qgb3RoZXJYWSkpXG4gICAgICAgIFxuICAgIHBhcmlzOiAobykgLT4gXG4gICAgICAgIG0gPSBbYWJzKG8ueC1AeCksYWJzKG8ueS1AeSksYWJzKG8uei1AeildXG4gICAgICAgIG0uc29ydCAoYSxiKSAtPiBiLWFcbiAgICAgICAgbVswXSswLjIqbVsxXSswLjEqbVsyXVxuICAgIFxuICAgIG1hbmhhdHRhbjogKG8pIC0+IGFicyhvLngtQHgpK2FicyhvLnktQHkpK2FicyhvLnotQHopXG4gICAgZGlzdDogICAobykgLT4gQG1pbnVzKG8pLmxlbmd0aCgpXG4gICAgbGVuZ3RoOiAgICAtPiBzcXJ0IEB4KkB4ICsgQHkqQHkgKyBAeipAelxuICAgIGRvdDogICAodikgLT4gQHgqdi54ICsgQHkqdi55ICsgQHoqdi56XG4gICAgXG4gICAgYWRkOiAgICh2KSAtPiBAYWRkSW5QbGFjZSB2XG4gICAgbXVsOiAgIChmKSAtPiBuZXcgVmVjdCBAeCpmLCBAeSpmLCBAeipmXG4gICAgZGl2OiAgIChkKSAtPiBuZXcgVmVjdCBAeC9kLCBAeS9kLCBAei9kXG4gICAgcGx1czogICh2KSAtPiBuZXcgVmVjdCh2KS5hZGQgQFxuICAgIG1pbnVzOiAodikgLT4gbmV3IFZlY3QodikubmVnKCkuYWRkIEBcbiAgICBuZWc6ICAgICAgIC0+IG5ldyBWZWN0IC1AeCwgLUB5LCAtQHpcbiAgICB0bzogICAgKHYpIC0+IG5ldyBWZWN0KHYpLnN1YiBAXG4gICAgICAgIFxuICAgIGFuZ2xlOiAodikgLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBsID0gQGxlbmd0aCgpXG4gICAgICAgICAgICBpZiBvID0gdi5sZW5ndGgoKVxuICAgICAgICAgICAgICAgIHggPSBAeCAvIGxcbiAgICAgICAgICAgICAgICB5ID0gQHkgLyBsXG4gICAgICAgICAgICAgICAgeiA9IEB6IC8gbFxuICAgICAgICAgICAgICAgIHAgPSB2LnggLyBvXG4gICAgICAgICAgICAgICAgcSA9IHYueSAvIG9cbiAgICAgICAgICAgICAgICByID0gdi56IC8gb1xuICAgICAgICAgICAgICAgIHJldHVybiByYWQyZGVnIGFjb3MgeCpwICsgeSpxICsgeipyXG4gICAgICAgIDAgICAgXG4gICAgXG4gICAgbmVnYXRlOiAgLT4gQHNjYWxlIC0xXG4gICAgc2NhbGU6IChmKSAtPlxuICAgICAgICBAeCAqPSBmXG4gICAgICAgIEB5ICo9IGZcbiAgICAgICAgQHogKj0gZlxuICAgICAgICBAXG4gICAgICAgIFxuICAgIHJlc2V0OiAtPlxuICAgICAgICBAeCA9IEB5ID0gQHogPSAwXG4gICAgICAgIEBcbiAgICBcbiAgICBpc1plcm86IC0+IEB4ID09IEB5ID09IEB6ID09IDBcblxuICAgIHJhbmRvbWl6ZTogLT4gXG4gICAgICAgIEBzZXQgcmFuZFJhbmdlKC0xLDEpLHJhbmRSYW5nZSgtMSwxKSxyYW5kUmFuZ2UoLTEsMSlcbiAgICAgICAgQG5vcm1hbGl6ZSgpXG4gICAgICAgIEBcbiAgICAgICAgXG4gICAgcG9sYXJpemU6IC0+XG4gICAgICAgIHJhZGl1cyA9IEBsZW5ndGgoKVxuICAgICAgICB0aGV0YSA9IGF0YW4yIEB5LCBAeFxuICAgICAgICBwaGkgICA9IGFjb3MgQHogLyByYWRpdXNcbiAgICAgICAgQHggPSB0aGV0YVxuICAgICAgICBAeSA9IHBoaVxuICAgICAgICBAeiA9IHJhZGl1c1xuICAgICAgICBAXG4gICAgICAgIFxuICAgIEByYW5kb206IC0+IG5ldyBWZWN0KCkucmFuZG9taXplKClcbiAgICAgICAgICAgIFxuICAgIEByYXlQbGFuZUludGVyc2VjdGlvbjogKHJheVBvcywgcmF5RGlyZWN0aW9uLCBwbGFuZVBvcywgcGxhbmVOb3JtYWwpIC0+XG4gICAgICAgIHggPSBwbGFuZVBvcy5taW51cyhyYXlQb3MpLmRvdChwbGFuZU5vcm1hbCkgLyByYXlEaXJlY3Rpb24uZG90KHBsYW5lTm9ybWFsKVxuICAgICAgICByZXR1cm4gcmF5UG9zLnBsdXMgcmF5RGlyZWN0aW9uLm11bCB4XG5cbiAgICBAcG9pbnRNYXBwZWRUb1BsYW5lOiAocG9pbnQsIHBsYW5lUG9zLCBwbGFuZU5vcm1hbCkgLT5cbiAgICAgICAgcG9pbnQubWludXMocGxhbmVOb3JtYWwpLmRvdCBwb2ludC5taW51cyhwbGFuZVBvcykuZG90KHBsYW5lTm9ybWFsKVxuXG4gICAgQHJheVBsYW5lSW50ZXJzZWN0aW9uRmFjdG9yOiAocmF5UG9zLCByYXlEaXIsIHBsYW5lUG9zLCBwbGFuZU5vcm1hbCkgLT5cbiAgICAgICAgcmF5RG90ID0gcmF5RGlyLmRvdCBwbGFuZU5vcm1hbFxuICAgICAgICBpZiBOdW1iZXIuaXNOYU4gcmF5RG90XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3JcbiAgICAgICAgcmV0dXJuIDIgaWYgcmF5RG90ID09IDBcbiAgICAgICAgciA9IHBsYW5lUG9zLm1pbnVzKHJheVBvcykuZG90KHBsYW5lTm9ybWFsKSAvIHJheURvdFxuICAgICAgICBpZiBOdW1iZXIuaXNOYU4gclxuICAgICAgICAgICAgbG9nICdyYXlQb3MnIHJheVBvc1xuICAgICAgICAgICAgbG9nICdyYXlEaXInIHJheURpclxuICAgICAgICAgICAgbG9nICdwbGFuZVBvcycgcGxhbmVQb3NcbiAgICAgICAgICAgIGxvZyAncGxhbmVOb3JtYWwnIHBsYW5lTm9ybWFsXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3JcbiAgICAgICAgclxuXG4gICAgQFBYID0gMFxuICAgIEBQWSA9IDFcbiAgICBAUFogPSAyXG4gICAgQE5YID0gM1xuICAgIEBOWSA9IDRcbiAgICBATlogPSA1XG4gICAgXG4gICAgQFplcm8gICA9IG5ldyBWZWN0ICAwICAwICAwXG4gICAgQHVuaXRYICA9IG5ldyBWZWN0ICAxICAwICAwXG4gICAgQHVuaXRZICA9IG5ldyBWZWN0ICAwICAxICAwXG4gICAgQHVuaXRaICA9IG5ldyBWZWN0ICAwICAwICAxXG4gICAgQG1pbnVzWCA9IG5ldyBWZWN0IC0xICAwICAwXG4gICAgQG1pbnVzWSA9IG5ldyBWZWN0ICAwIC0xICAwXG4gICAgQG1pbnVzWiA9IG5ldyBWZWN0ICAwICAwIC0xXG4gICAgXG4gICAgQG5vcm1hbHMgPSBbVmVjdC51bml0WCwgVmVjdC51bml0WSwgVmVjdC51bml0WiwgVmVjdC5taW51c1gsIFZlY3QubWludXNZLCBWZWN0Lm1pbnVzWl1cbiAgICAgICAgXG4gICAgQHBlcnBOb3JtYWxzOiAodikgLT4gXG4gICAgICAgIGkgPSBAbm9ybWFsSW5kZXgodilcbiAgICAgICAgc3dpdGNoIGlcbiAgICAgICAgICAgIHdoZW4gQFBYIHRoZW4gW0B1bml0WSwgQHVuaXRaLCBAbWludXNZLCBAbWludXNaXVxuICAgICAgICAgICAgd2hlbiBAUFkgdGhlbiBbQG1pbnVzWCwgQHVuaXRaLCBAdW5pdFgsIEBtaW51c1pdXG4gICAgICAgICAgICB3aGVuIEBQWiB0aGVuIFtAdW5pdFksIEBtaW51c1gsIEBtaW51c1ksIEB1bml0WF1cbiAgICAgICAgICAgIHdoZW4gQE5YIHRoZW4gW0B1bml0WSwgQG1pbnVzWiwgQG1pbnVzWSwgQHVuaXRaXSAgICAgICAgICAgIFxuICAgICAgICAgICAgd2hlbiBATlkgdGhlbiBbQG1pbnVzWCwgQG1pbnVzWiwgQHVuaXRYLCBAdW5pdFpdICAgICAgICAgICAgXG4gICAgICAgICAgICB3aGVuIEBOWiB0aGVuIFtAdW5pdFksIEB1bml0WCwgQG1pbnVzWSwgQG1pbnVzWF0gICAgICAgICAgICBcbiAgICBcbiAgICBAbm9ybWFsSW5kZXg6ICh2KSAtPiBcbiAgICBcbiAgICAgICAgY24gPSBAY2xvc2VzdE5vcm1hbCB2XG4gICAgICAgIGZvciBpIGluIFswLi4uNl1cbiAgICAgICAgICAgIGlmIFZlY3Qubm9ybWFsc1tpXS5lcXVhbHMgY25cbiAgICAgICAgICAgICAgICByZXR1cm4gaVxuICAgICAgICAtMVxuICAgIFxuICAgIEBjbG9zZXN0Tm9ybWFsOiAodikgLT5cbiAgICAgICAgXG4gICAgICAgIFZlY3QudG1wLmNvcHkgdlxuICAgICAgICBWZWN0LnRtcC5ub3JtYWxpemUoKVxuICAgICAgICBhbmdsZXMgPSBbXVxuICAgICAgICBmb3IgbiBpbiBWZWN0Lm5vcm1hbHNcbiAgICAgICAgICAgIGlmIG4uZXF1YWxzIFZlY3QudG1wXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5cbiAgICAgICAgICAgIGFuZ2xlcy5wdXNoIFtuLmFuZ2xlKFZlY3QudG1wKSwgbl1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgYW5nbGVzLnNvcnQgKGEsYikgLT4gYVswXS1iWzBdXG4gICAgICAgIGFuZ2xlc1swXVsxXVxuICAgIFxubW9kdWxlLmV4cG9ydHMgPSBWZWN0XG4iXX0=
//# sourceURL=../coffee/vect.coffee