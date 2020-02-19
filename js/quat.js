// koffee 1.7.0

/*
 0000000   000   000   0000000   000000000
000   000  000   000  000   000     000   
000 00 00  000   000  000000000     000   
000 0000   000   000  000   000     000   
 00000 00   0000000   000   000     000
 */
var Quat, Vect, acos, asin, atan2, cos, deg2rad, rad2deg, ref, sin, sqrt;

ref = require('kxk'), deg2rad = ref.deg2rad, rad2deg = ref.rad2deg;

acos = Math.acos, asin = Math.asin, atan2 = Math.atan2, cos = Math.cos, sin = Math.sin, sqrt = Math.sqrt;

Vect = require('./vect');

Quat = (function() {
    function Quat(x, y, z, w) {
        var ref1;
        if (x == null) {
            x = 0;
        }
        if (y == null) {
            y = 0;
        }
        if (z == null) {
            z = 0;
        }
        if (w == null) {
            w = 1;
        }
        if ((x.x != null) && (x.y != null) && (x.z != null)) {
            this.set(x.x, x.y, x.z, (ref1 = x.w) != null ? ref1 : 0);
        } else if (Array.isArray(w)) {
            this.set(w[0], w[1], w[2], w[3]);
        } else {
            this.set(x, y, z, w);
        }
        if (Number.isNaN(this.x)) {
            throw new Error;
        }
    }

    Quat.prototype.set = function(x1, y1, z1, w1) {
        this.x = x1;
        this.y = y1;
        this.z = z1;
        this.w = w1 != null ? w1 : 1;
    };

    Quat.prototype.rotateAxisAngle = function(axis, angle) {
        this.multiplyInPlace(Quat.axisAngle(axis, angle));
        return this;
    };

    Quat.prototype.rotate = function(v) {
        return v.applyQuaternion(this);
    };

    Quat.prototype.rotated = function(v) {
        return new Vect(v).applyQuaternion(this);
    };

    Quat.prototype.clone = function() {
        return new Quat(this);
    };

    Quat.prototype.copy = function(q) {
        this.x = q.x;
        this.y = q.y;
        this.z = q.z;
        this.w = q.w;
        return this;
    };

    Quat.prototype.rounded = function() {
        var back, backDiff, i, l, len, minDist, minQuat, q, ref1, up, upDiff;
        minDist = 1000;
        minQuat = null;
        up = this.rotate(Vect.unitY);
        back = this.rotate(Vect.unitZ);
        ref1 = [Quat.XupY, Quat.XupZ, Quat.XdownY, Quat.XdownZ, Quat.YupX, Quat.YupZ, Quat.YdownX, Quat.YdownZ, Quat.ZupX, Quat.ZupY, Quat.ZdownX, Quat.ZdownY, Quat.minusXupY, Quat.minusXupZ, Quat.minusXdownY, Quat.minusXdownZ, Quat.minusYupX, Quat.minusYupZ, Quat.minusYdownX, Quat.minusYdownZ, Quat.minusZupX, Quat.minusZupY, Quat.minusZdownX, Quat.minusZdownY];
        for (i = 0, len = ref1.length; i < len; i++) {
            q = ref1[i];
            upDiff = 1 - up.dot(q.rotate(Vect.unitY));
            backDiff = 1 - back.dot(q.rotate(Vect.unitZ));
            l = upDiff + backDiff;
            if (l < minDist) {
                minDist = l;
                minQuat = q;
                if (l < 0.0001) {
                    break;
                }
            }
        }
        return minQuat;
    };

    Quat.prototype.round = function() {
        return this.clone(this.normalize().rounded());
    };

    Quat.prototype.euler = function() {
        return [rad2deg(atan2(2 * (this.w * this.x + this.y * this.z), 1 - 2 * (this.x * this.x + this.y * this.y))), rad2deg(asin(2 * (this.w * this.y - this.z * this.x))), rad2deg(atan2(2 * (this.w * this.z + this.x * this.y), 1 - 2 * (this.y * this.y + this.z * this.z)))];
    };

    Quat.prototype.add = function(quat) {
        this.w += quat.w;
        this.x += quat.x;
        this.y += quat.y;
        this.z += quat.z;
        return this;
    };

    Quat.prototype.sub = function(quat) {
        this.w -= quat.w;
        this.x -= quat.x;
        this.y -= quat.y;
        this.z -= quat.z;
        return this;
    };

    Quat.prototype.minus = function(quat) {
        return this.clone().sub(quat);
    };

    Quat.prototype.dot = function(q) {
        return this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w;
    };

    Quat.prototype.normalize = function() {
        var l;
        l = sqrt(this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z);
        if (l !== 0.0) {
            this.w /= l;
            this.x /= l;
            this.y /= l;
            this.z /= l;
        }
        return this;
    };

    Quat.prototype.invert = function() {
        var l;
        l = sqrt(this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z);
        if (l !== 0.0) {
            this.w /= l;
            this.x = -this.x / l;
            this.y = -this.y / l;
            this.z = -this.z / l;
        }
        return this;
    };

    Quat.prototype.isZero = function() {
        var ref1, ref2;
        return ((this.x === (ref2 = this.y) && ref2 === (ref1 = this.z)) && ref1 === 0) && this.w === 1;
    };

    Quat.prototype.reset = function() {
        this.x = this.y = this.z = 0;
        this.w = 1;
        return this;
    };

    Quat.prototype.conjugate = function() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    };

    Quat.prototype.getNormal = function() {
        return this.clone().normalize();
    };

    Quat.prototype.getConjugate = function() {
        return this.clone().conjugate();
    };

    Quat.prototype.getInverse = function() {
        return this.clone().invert();
    };

    Quat.prototype.neg = function() {
        return new Quat(-this.w, -this.x, -this.y, -this.z);
    };

    Quat.prototype.vector = function() {
        return new Vect(this.x, this.y, this.z);
    };

    Quat.prototype.length = function() {
        return sqrt(this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z);
    };

    Quat.prototype.eql = function(q) {
        return this.w === q.w && (this.x = q.x && this.y === q.y && this.z === q.z);
    };

    Quat.prototype.mul = function(quatOrScalar) {
        var a, b, c, d, e, f, g, h, quat;
        if (quatOrScalar instanceof Quat) {
            quat = quatOrScalar;
            a = (this.w + this.x) * (quat.w + quat.x);
            b = (this.z - this.y) * (quat.y - quat.z);
            c = (this.w - this.x) * (quat.y + quat.z);
            d = (this.y + this.z) * (quat.w - quat.x);
            e = (this.x + this.z) * (quat.x + quat.y);
            f = (this.x - this.z) * (quat.x - quat.y);
            g = (this.w + this.y) * (quat.w - quat.z);
            h = (this.w - this.y) * (quat.w + quat.z);
            return new Quat(b + (-e - f + g + h) / 2, a - (e + f + g + h) / 2, c + (e - f + g - h) / 2, d + (e - f - g + h) / 2);
        } else {
            f = parseFloat(quatOrScalar);
            return new Quat(this.w * f, this.x * f, this.y * f, this.z * f);
        }
    };

    Quat.prototype.slerp = function(quat, t) {
        var cosom, omega, scale0, scale1, sinom, to1;
        to1 = [0, 0, 0, 0];
        cosom = this.x * quat.x + this.y * quat.y + this.z * quat.z + this.w * quat.w;
        if (cosom < 0) {
            cosom = -cosom;
            to1[0] = -quat.x;
            to1[1] = -quat.y;
            to1[2] = -quat.z;
            to1[3] = -quat.w;
        } else {
            to1[0] = quat.x;
            to1[1] = quat.y;
            to1[2] = quat.z;
            to1[3] = quat.w;
        }
        if ((1.0 - cosom) > 0.001) {
            omega = acos(cosom);
            sinom = sin(omega);
            scale0 = sin((1.0 - t) * omega) / sinom;
            scale1 = sin(t * omega) / sinom;
        } else {
            scale0 = 1.0 - t;
            scale1 = t;
        }
        return new Quat(scale0 * this.w + scale1 * to1[3], scale0 * this.x + scale1 * to1[0], scale0 * this.y + scale1 * to1[1], scale0 * this.z + scale1 * to1[2]);
    };

    Quat.axisAngle = function(axis, angle) {
        var halfAngle, s;
        halfAngle = deg2rad(angle) / 2;
        s = sin(halfAngle);
        return new Quat(axis.x * s, axis.y * s, axis.z * s, cos(halfAngle));
    };

    Quat.rotationFromEuler = function(x, y, z) {
        var q;
        x = deg2rad(x);
        y = deg2rad(y);
        z = deg2rad(z);
        q = new Quat(cos(x / 2) * cos(y / 2) * cos(z / 2) + sin(x / 2) * sin(y / 2) * sin(z / 2), sin(x / 2) * cos(y / 2) * cos(z / 2) - cos(x / 2) * sin(y / 2) * sin(z / 2), cos(x / 2) * sin(y / 2) * cos(z / 2) + sin(x / 2) * cos(y / 2) * sin(z / 2), cos(x / 2) * cos(y / 2) * sin(z / 2) - sin(x / 2) * sin(y / 2) * cos(z / 2));
        return q.normalize();
    };

    return Quat;

})();

module.exports = Quat;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVhdC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBdUIsT0FBQSxDQUFRLEtBQVIsQ0FBdkIsRUFBRSxxQkFBRixFQUFXOztBQUNULGdCQUFGLEVBQVEsZ0JBQVIsRUFBYyxrQkFBZCxFQUFxQixjQUFyQixFQUEwQixjQUExQixFQUErQjs7QUFFL0IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztBQUVEO0lBRUMsY0FBQyxDQUFELEVBQU0sQ0FBTixFQUFXLENBQVgsRUFBZ0IsQ0FBaEI7QUFFQyxZQUFBOztZQUZBLElBQUU7OztZQUFHLElBQUU7OztZQUFHLElBQUU7OztZQUFHLElBQUU7O1FBRWpCLElBQUcsYUFBQSxJQUFTLGFBQVQsSUFBa0IsYUFBckI7WUFDSSxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUMsQ0FBQyxDQUFQLEVBQVUsQ0FBQyxDQUFDLENBQVosRUFBZSxDQUFDLENBQUMsQ0FBakIsZ0NBQTBCLENBQTFCLEVBREo7U0FBQSxNQUVLLElBQUcsS0FBSyxDQUFDLE9BQU4sQ0FBYyxDQUFkLENBQUg7WUFDRCxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUUsQ0FBQSxDQUFBLENBQVAsRUFBVyxDQUFFLENBQUEsQ0FBQSxDQUFiLEVBQWlCLENBQUUsQ0FBQSxDQUFBLENBQW5CLEVBQXVCLENBQUUsQ0FBQSxDQUFBLENBQXpCLEVBREM7U0FBQSxNQUFBO1lBR0QsSUFBQyxDQUFBLEdBQUQsQ0FBSyxDQUFMLEVBQVEsQ0FBUixFQUFXLENBQVgsRUFBYyxDQUFkLEVBSEM7O1FBS0wsSUFBRyxNQUFNLENBQUMsS0FBUCxDQUFhLElBQUMsQ0FBQSxDQUFkLENBQUg7QUFDSSxrQkFBTSxJQUFJLE1BRGQ7O0lBVEQ7O21CQVlILEdBQUEsR0FBSyxTQUFDLEVBQUQsRUFBSyxFQUFMLEVBQVMsRUFBVCxFQUFhLEVBQWI7UUFBQyxJQUFDLENBQUEs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QU4sQ0FEaEUsRUFFUyxHQUFBLENBQUksQ0FBQSxHQUFFLENBQU4sQ0FBQSxHQUFXLEdBQUEsQ0FBSSxDQUFBLEdBQUUsQ0FBTixDQUFYLEdBQXNCLEdBQUEsQ0FBSSxDQUFBLEdBQUUsQ0FBTixDQUF0QixHQUFpQyxHQUFBLENBQUksQ0FBQSxHQUFFLENBQU4sQ0FBQSxHQUFXLEdBQUEsQ0FBSSxDQUFBLEdBQUUsQ0FBTixDQUFYLEdBQXNCLEdBQUEsQ0FBSSxDQUFBLEdBQUUsQ0FBTixDQUZoRSxFQUdTLEdBQUEsQ0FBSSxDQUFBLEdBQUUsQ0FBTixDQUFBLEdBQVcsR0FBQSxDQUFJLENBQUEsR0FBRSxDQUFOLENBQVgsR0FBc0IsR0FBQSxDQUFJLENBQUEsR0FBRSxDQUFOLENBQXRCLEdBQWlDLEdBQUEsQ0FBSSxDQUFBLEdBQUUsQ0FBTixDQUFBLEdBQVcsR0FBQSxDQUFJLENBQUEsR0FBRSxDQUFOLENBQVgsR0FBc0IsR0FBQSxDQUFJLENBQUEsR0FBRSxDQUFOLENBSGhFO2VBSUosQ0FBQyxDQUFDLFNBQUYsQ0FBQTtJQVJnQjs7Ozs7O0FBVXhCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgIFxuMDAwIDAwIDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgXG4wMDAgMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICBcbiAwMDAwMCAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgIFxuIyMjXG5cbnsgZGVnMnJhZCwgcmFkMmRlZyB9ID0gcmVxdWlyZSAna3hrJ1xueyBhY29zLCBhc2luLCBhdGFuMiwgY29zLCBzaW4sIHNxcnQgfSA9IE1hdGhcblxuVmVjdCA9IHJlcXVpcmUgJy4vdmVjdCdcblxuY2xhc3MgUXVhdFxuICAgIFxuICAgIEA6ICh4PTAsIHk9MCwgej0wLCB3PTEpIC0+XG4gICAgICAgIFxuICAgICAgICBpZiB4Lng/IGFuZCB4Lnk/IGFuZCB4Lno/XG4gICAgICAgICAgICBAc2V0IHgueCwgeC55LCB4LnosIHgudyA/IDBcbiAgICAgICAgZWxzZSBpZiBBcnJheS5pc0FycmF5IHdcbiAgICAgICAgICAgIEBzZXQgd1swXSwgd1sxXSwgd1syXSwgd1szXVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2V0IHgsIHksIHosIHdcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBOdW1iZXIuaXNOYU4gQHhcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvclxuICAgICAgICAgICAgIFxuICAgIHNldDogKEB4LCBAeSwgQHosIEB3PTEpIC0+XG4gICAgICAgICAgICBcbiAgICByb3RhdGVBeGlzQW5nbGU6IChheGlzLCBhbmdsZSkgLT5cbiAgICAgICAgXG4gICAgICAgIEBtdWx0aXBseUluUGxhY2UgUXVhdC5heGlzQW5nbGUgYXhpcywgYW5nbGVcbiAgICAgICAgQFxuICAgICAgIFxuICAgIHJvdGF0ZTogICh2KSAtPiB2LmFwcGx5UXVhdGVybmlvbiBAXG4gICAgcm90YXRlZDogKHYpIC0+IG5ldyBWZWN0KHYpLmFwcGx5UXVhdGVybmlvbiBAXG4gICAgICAgIFxuICAgIGNsb25lOiAtPiBuZXcgUXVhdCBAXG4gICAgY29weTogKHEpIC0+XG4gICAgICAgIEB4ID0gcS54XG4gICAgICAgIEB5ID0gcS55XG4gICAgICAgIEB6ID0gcS56XG4gICAgICAgIEB3ID0gcS53XG4gICAgICAgIEBcbiAgICAgICAgXG4gICAgcm91bmRlZDogLT4gICAgICAgIFxuICAgICAgICBtaW5EaXN0ID0gMTAwMFxuICAgICAgICBtaW5RdWF0ID0gbnVsbFxuICAgICAgICB1cCAgID0gQHJvdGF0ZSBWZWN0LnVuaXRZXG4gICAgICAgIGJhY2sgPSBAcm90YXRlIFZlY3QudW5pdFpcbiAgICAgICAgZm9yIHEgaW4gWyAgUXVhdC5YdXBZXG4gICAgICAgICAgICAgICAgICAgIFF1YXQuWHVwWlxuICAgICAgICAgICAgICAgICAgICBRdWF0Llhkb3duWVxuICAgICAgICAgICAgICAgICAgICBRdWF0Llhkb3duWlxuICAgICAgICAgICAgICAgICAgICBRdWF0Lll1cFhcbiAgICAgICAgICAgICAgICAgICAgUXVhdC5ZdXBaXG4gICAgICAgICAgICAgICAgICAgIFF1YXQuWWRvd25YXG4gICAgICAgICAgICAgICAgICAgIFF1YXQuWWRvd25aXG4gICAgICAgICAgICAgICAgICAgIFF1YXQuWnVwWFxuICAgICAgICAgICAgICAgICAgICBRdWF0Llp1cFlcbiAgICAgICAgICAgICAgICAgICAgUXVhdC5aZG93blhcbiAgICAgICAgICAgICAgICAgICAgUXVhdC5aZG93bllcbiAgICAgICAgICAgICAgICAgICAgUXVhdC5taW51c1h1cFlcbiAgICAgICAgICAgICAgICAgICAgUXVhdC5taW51c1h1cFpcbiAgICAgICAgICAgICAgICAgICAgUXVhdC5taW51c1hkb3duWVxuICAgICAgICAgICAgICAgICAgICBRdWF0Lm1pbnVzWGRvd25aXG4gICAgICAgICAgICAgICAgICAgIFF1YXQubWludXNZdXBYXG4gICAgICAgICAgICAgICAgICAgIFF1YXQubWludXNZdXBaXG4gICAgICAgICAgICAgICAgICAgIFF1YXQubWludXNZZG93blhcbiAgICAgICAgICAgICAgICAgICAgUXVhdC5taW51c1lkb3duWlxuICAgICAgICAgICAgICAgICAgICBRdWF0Lm1pbnVzWnVwWFxuICAgICAgICAgICAgICAgICAgICBRdWF0Lm1pbnVzWnVwWVxuICAgICAgICAgICAgICAgICAgICBRdWF0Lm1pbnVzWmRvd25YXG4gICAgICAgICAgICAgICAgICAgIFF1YXQubWludXNaZG93bllcbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgdXBEaWZmICAgPSAxIC0gdXAuZG90IHEucm90YXRlIFZlY3QudW5pdFlcbiAgICAgICAgICAgIGJhY2tEaWZmID0gMSAtIGJhY2suZG90IHEucm90YXRlIFZlY3QudW5pdFpcbiAgICAgICAgICAgIGwgPSB1cERpZmYgKyBiYWNrRGlmZlxuICAgICAgICAgICAgaWYgbCA8IG1pbkRpc3RcbiAgICAgICAgICAgICAgICBtaW5EaXN0ID0gbFxuICAgICAgICAgICAgICAgIG1pblF1YXQgPSBxXG4gICAgICAgICAgICAgICAgaWYgbCA8IDAuMDAwMVxuICAgICAgICAgICAgICAgICAgICBicmVha1xuICAgICAgICBtaW5RdWF0XG4gICAgICAgIFxuICAgIHJvdW5kOiAtPiBAY2xvbmUgQG5vcm1hbGl6ZSgpLnJvdW5kZWQoKVxuXG4gICAgZXVsZXI6IC0+IFtcbiAgICAgICAgcmFkMmRlZyBhdGFuMiAyKihAdypAeCtAeSpAeiksIDEtMiooQHgqQHgrQHkqQHkpXG4gICAgICAgIHJhZDJkZWcgYXNpbiAgMiooQHcqQHktQHoqQHgpXG4gICAgICAgIHJhZDJkZWcgYXRhbjIgMiooQHcqQHorQHgqQHkpLCAxLTIqKEB5KkB5K0B6KkB6KV1cblxuICAgIGFkZDogKHF1YXQpIC0+XG4gICAgICAgIEB3ICs9IHF1YXQudyBcbiAgICAgICAgQHggKz0gcXVhdC54IFxuICAgICAgICBAeSArPSBxdWF0LnkgXG4gICAgICAgIEB6ICs9IHF1YXQuelxuICAgICAgICBAXG4gICAgXG4gICAgc3ViOiAocXVhdCkgLT5cbiAgICAgICAgQHcgLT0gcXVhdC53IFxuICAgICAgICBAeCAtPSBxdWF0LnggXG4gICAgICAgIEB5IC09IHF1YXQueSBcbiAgICAgICAgQHogLT0gcXVhdC56XG4gICAgICAgIEBcbiAgICBcbiAgICBtaW51czogKHF1YXQpIC0+IEBjbG9uZSgpLnN1YiBxdWF0XG5cbiAgICBkb3Q6IChxKSAtPiBAeCpxLnggKyBAeSpxLnkgKyBAeipxLnogKyBAdypxLndcbiAgICBcbiAgICBub3JtYWxpemU6IC0+XG4gICAgICAgIGwgPSBzcXJ0IEB3KkB3ICsgQHgqQHggKyBAeSpAeSArIEB6KkB6IFxuICAgICAgICBpZiBsICE9IDAuMFxuICAgICAgICAgICAgQHcgLz0gbCBcbiAgICAgICAgICAgIEB4IC89IGwgXG4gICAgICAgICAgICBAeSAvPSBsIFxuICAgICAgICAgICAgQHogLz0gbFxuICAgICAgICBAXG5cbiAgICBpbnZlcnQ6IC0+XG4gICAgICAgIGwgPSBzcXJ0IEB3KkB3ICsgQHgqQHggKyBAeSpAeSArIEB6KkB6IFxuICAgICAgICBpZiBsICE9IDAuMCBcbiAgICAgICAgICAgIEB3IC89IGwgXG4gICAgICAgICAgICBAeCA9IC1AeC9sXG4gICAgICAgICAgICBAeSA9IC1AeS9sXG4gICAgICAgICAgICBAeiA9IC1Aei9sIFxuICAgICAgICBAXG5cbiAgICBpc1plcm86IC0+IEB4PT1AeT09QHo9PTAgYW5kIEB3PT0xXG4gICAgcmVzZXQ6IC0+IFxuICAgICAgICBAeD1AeT1Aej0wXG4gICAgICAgIEB3PTEgXG4gICAgICAgIEBcbiAgICAgICAgXG4gICAgY29uanVnYXRlOiAtPiBcbiAgICAgICAgQHggPSAtQHhcbiAgICAgICAgQHkgPSAtQHlcbiAgICAgICAgQHogPSAtQHpcbiAgICAgICAgQCBcbiAgICAgICAgXG4gICAgZ2V0Tm9ybWFsOiAgICAgLT4gQGNsb25lKCkubm9ybWFsaXplKClcbiAgICBnZXRDb25qdWdhdGU6ICAtPiBAY2xvbmUoKS5jb25qdWdhdGUoKVxuICAgIGdldEludmVyc2U6ICAgIC0+IEBjbG9uZSgpLmludmVydCgpXG4gICAgbmVnOiAgICAgICAgICAgLT4gbmV3IFF1YXQgLUB3LC1AeCwtQHksLUB6XG4gICAgdmVjdG9yOiAgICAgICAgLT4gbmV3IFZlY3QgQHgsIEB5LCBAelxuICAgIGxlbmd0aDogICAgICAgIC0+IHNxcnQgQHcqQHcgKyBAeCpAeCArIEB5KkB5ICsgQHoqQHpcbiAgICBlcWw6ICAgICAgIChxKSAtPiBAdz09cS53IGFuZCBAeD1xLnggYW5kIEB5PT1xLnkgYW5kIEB6PT1xLnpcbiAgICBcbiAgICBtdWw6IChxdWF0T3JTY2FsYXIpIC0+XG4gICAgICAgIGlmIHF1YXRPclNjYWxhciBpbnN0YW5jZW9mIFF1YXRcbiAgICAgICAgICAgIHF1YXQgPSBxdWF0T3JTY2FsYXJcbiAgICAgICAgICAgIGEgPSAoQHcgKyBAeCkgKiAocXVhdC53ICsgcXVhdC54KVxuICAgICAgICAgICAgYiA9IChAeiAtIEB5KSAqIChxdWF0LnkgLSBxdWF0LnopXG4gICAgICAgICAgICBjID0gKEB3IC0gQHgpICogKHF1YXQueSArIHF1YXQueikgXG4gICAgICAgICAgICBkID0gKEB5ICsgQHopICogKHF1YXQudyAtIHF1YXQueClcbiAgICAgICAgICAgIGUgPSAoQHggKyBAeikgKiAocXVhdC54ICsgcXVhdC55KVxuICAgICAgICAgICAgZiA9IChAeCAtIEB6KSAqIChxdWF0LnggLSBxdWF0LnkpXG4gICAgICAgICAgICBnID0gKEB3ICsgQHkpICogKHF1YXQudyAtIHF1YXQueilcbiAgICAgICAgICAgIGggPSAoQHcgLSBAeSkgKiAocXVhdC53ICsgcXVhdC56KVxuICAgICAgICAgICAgbmV3IFF1YXQgYiArICgtZSAtIGYgKyBnICsgaCkvMixcbiAgICAgICAgICAgICAgICAgICAgIGEgLSAgKGUgKyBmICsgZyArIGgpLzIsXG4gICAgICAgICAgICAgICAgICAgICBjICsgIChlIC0gZiArIGcgLSBoKS8yLFxuICAgICAgICAgICAgICAgICAgICAgZCArICAoZSAtIGYgLSBnICsgaCkvMlxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBmID0gcGFyc2VGbG9hdCBxdWF0T3JTY2FsYXJcbiAgICAgICAgICAgIG5ldyBRdWF0IEB3KmYsIEB4KmYsIEB5KmYsIEB6KmZcblxuICAgIHNsZXJwOiAocXVhdCwgdCkgLT5cblxuICAgICAgICB0bzEgICA9IFswLDAsMCwwXVxuICAgICAgICBjb3NvbSA9IEB4ICogcXVhdC54ICsgQHkgKiBxdWF0LnkgKyBAeiAqIHF1YXQueiArIEB3ICogcXVhdC53ICMgY2FsYyBjb3NpbmVcbiAgICAgICAgXG4gICAgICAgIGlmIGNvc29tIDwgMCAjIGFkanVzdCBzaWducyAoaWYgbmVjZXNzYXJ5KVxuICAgICAgICAgICAgY29zb20gPSAtY29zb20gXG4gICAgICAgICAgICB0bzFbMF0gPSAtcXVhdC54XG4gICAgICAgICAgICB0bzFbMV0gPSAtcXVhdC55XG4gICAgICAgICAgICB0bzFbMl0gPSAtcXVhdC56XG4gICAgICAgICAgICB0bzFbM10gPSAtcXVhdC53XG4gICAgICAgIGVsc2UgIFxuICAgICAgICAgICAgdG8xWzBdID0gcXVhdC54XG4gICAgICAgICAgICB0bzFbMV0gPSBxdWF0LnlcbiAgICAgICAgICAgIHRvMVsyXSA9IHF1YXQuelxuICAgICAgICAgICAgdG8xWzNdID0gcXVhdC53XG4gICAgICAgIFxuICAgICAgICBpZiAoMS4wIC0gY29zb20pID4gMC4wMDEgIyBjYWxjdWxhdGUgY29lZmZpY2llbnRzXG4gICAgICAgICAgICBvbWVnYSAgPSBhY29zIGNvc29tICAjIHN0YW5kYXJkIGNhc2UgKHNsZXJwKVxuICAgICAgICAgICAgc2lub20gID0gc2luIG9tZWdhIFxuICAgICAgICAgICAgc2NhbGUwID0gc2luKCgxLjAgLSB0KSAqIG9tZWdhKSAvIHNpbm9tXG4gICAgICAgICAgICBzY2FsZTEgPSBzaW4odCAqIG9tZWdhKSAvIHNpbm9tXG4gICAgICAgIGVsc2UgIyBcImZyb21cIiBhbmQgXCJ0b1wiIHF1YXRlcm5pb25zIGFyZSB2ZXJ5IGNsb3NlIC0+IHdlIGNhbiBkbyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uXG4gICAgICAgICAgICBzY2FsZTAgPSAxLjAgLSB0XG4gICAgICAgICAgICBzY2FsZTEgPSB0XG5cbiAgICAgICAgbmV3IFF1YXQgc2NhbGUwICogQHcgKyBzY2FsZTEgKiB0bzFbM10sXG4gICAgICAgICAgICAgICAgIHNjYWxlMCAqIEB4ICsgc2NhbGUxICogdG8xWzBdLCBcbiAgICAgICAgICAgICAgICAgc2NhbGUwICogQHkgKyBzY2FsZTEgKiB0bzFbMV0sXG4gICAgICAgICAgICAgICAgIHNjYWxlMCAqIEB6ICsgc2NhbGUxICogdG8xWzJdXG5cbiAgICAjICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgICAgICAgXG4gICAgIyAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAgICAgICBcbiAgICAjICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgICAgICAgIFxuICAgICMgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgQGF4aXNBbmdsZTogKGF4aXMsIGFuZ2xlKSAtPiBcbiAgICAgICAgXG4gICAgICAgIGhhbGZBbmdsZSA9IGRlZzJyYWQoYW5nbGUpLzIgXG4gICAgICAgIHMgPSBzaW4gaGFsZkFuZ2xlXG4gICAgICAgIFxuICAgICAgICBuZXcgUXVhdCBheGlzLnggKiBzLFxuICAgICAgICAgICAgICAgICBheGlzLnkgKiBzLFxuICAgICAgICAgICAgICAgICBheGlzLnogKiBzLFxuICAgICAgICAgICAgICAgICBjb3MgaGFsZkFuZ2xlXG4gICAgICAgICAgICAgICAgIFxuICAgIEByb3RhdGlvbkZyb21FdWxlcjogKHgseSx6KSAtPlxuICAgICAgICB4ID0gZGVnMnJhZCB4XG4gICAgICAgIHkgPSBkZWcycmFkIHlcbiAgICAgICAgeiA9IGRlZzJyYWQgelxuICAgICAgICBxID0gbmV3IFF1YXQgY29zKHgvMikgKiBjb3MoeS8yKSAqIGNvcyh6LzIpICsgc2luKHgvMikgKiBzaW4oeS8yKSAqIHNpbih6LzIpLFxuICAgICAgICAgICAgICAgICAgICAgc2luKHgvMikgKiBjb3MoeS8yKSAqIGNvcyh6LzIpIC0gY29zKHgvMikgKiBzaW4oeS8yKSAqIHNpbih6LzIpLFxuICAgICAgICAgICAgICAgICAgICAgY29zKHgvMikgKiBzaW4oeS8yKSAqIGNvcyh6LzIpICsgc2luKHgvMikgKiBjb3MoeS8yKSAqIHNpbih6LzIpLFxuICAgICAgICAgICAgICAgICAgICAgY29zKHgvMikgKiBjb3MoeS8yKSAqIHNpbih6LzIpIC0gc2luKHgvMikgKiBzaW4oeS8yKSAqIGNvcyh6LzIpXG4gICAgICAgIHEubm9ybWFsaXplKClcbiAgICBcbm1vZHVsZS5leHBvcnRzID0gUXVhdFxuIl19
//# sourceURL=../coffee/quat.coffee