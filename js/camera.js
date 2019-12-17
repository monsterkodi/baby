// koffee 1.6.0

/*
 0000000   0000000   00     00  00000000  00000000    0000000 
000       000   000  000   000  000       000   000  000   000
000       000000000  000000000  0000000   0000000    000000000
000       000   000  000 0 000  000       000   000  000   000
 0000000  000   000  000   000  00000000  000   000  000   000
 */
var Camera, PointLight, Quat, Quaternion, UniversalCamera, Vect, Vector3, animate, clamp, deg2rad, gamepad, prefs, quat, reduce, ref, ref1, vec,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), clamp = ref.clamp, deg2rad = ref.deg2rad, gamepad = ref.gamepad, prefs = ref.prefs, reduce = ref.reduce;

ref1 = require('babylonjs'), Camera = ref1.Camera, PointLight = ref1.PointLight, Quaternion = ref1.Quaternion, UniversalCamera = ref1.UniversalCamera, Vector3 = ref1.Vector3;

Vect = require('./vect');

Quat = require('./quat');

animate = require('./animate');

vec = function(x, y, z) {
    return new Vect(x, y, z);
};

quat = function(x, y, z, w) {
    return new Quat(x, y, z, w);
};

Camera = (function(superClass) {
    extend(Camera, superClass);

    function Camera(world) {
        var height, info, ref2, values, width;
        this.world = world;
        this.setDist = bind(this.setDist, this);
        this.inertZoom = bind(this.inertZoom, this);
        this.onMouseWheel = bind(this.onMouseWheel, this);
        this.moveCenter = bind(this.moveCenter, this);
        this.fadeCenter = bind(this.fadeCenter, this);
        this.onMouseDrag = bind(this.onMouseDrag, this);
        this.onMouseUp = bind(this.onMouseUp, this);
        this.onMouseDown = bind(this.onMouseDown, this);
        this.onPadButton = bind(this.onPadButton, this);
        this.onPadAxis = bind(this.onPadAxis, this);
        this.del = bind(this.del, this);
        ref2 = this.world, this.scene = ref2.scene, this.canvas = ref2.canvas, this.view = ref2.view;
        width = this.view.clientWidth;
        height = this.view.clientHeight;
        info = {
            dist: 10,
            degree: 90,
            rotate: 0,
            pos: {
                x: 0,
                y: 0,
                z: 0
            },
            center: {
                x: 0,
                y: 0,
                z: 0
            }
        };
        values = prefs.get('camera', info);
        this.size = vec(width, height);
        this.moveFade = vec(0, 0, 0);
        this.center = vec(values.center);
        this.degree = values.degree;
        this.rotate = values.rotate;
        this.dist = values.dist;
        this.minDist = 2;
        this.maxDist = 800;
        this.moveDist = 0.1;
        this.wheelInert = 0;
        this.moveX = 0;
        this.moveY = 0;
        this.moveZ = 0;
        this.quat = quat();
        Camera.__super__.constructor.call(this, 'Camera', new Vector3(0, 0, 0), this.scene);
        this.maxZ = 100000;
        this.minZ = 1;
        this.fov = deg2rad(60);
        this.rotationQuaternion = new Quaternion();
        this.position.copyFrom(values.pos);
        this.inertia = 0.8;
        this.light = new PointLight('spot', this.position, this.scene);
        this.light.intensity = 0.5;
        this.gamepad = new gamepad(true);
        this.gamepad.on('button', this.onPadButton);
        this.view.addEventListener('mousewheel', this.onMouseWheel);
        this.navigate();
    }

    Camera.prototype.getDir = function() {
        return quat(this.rotationQuaternion).rotated(Vect.unitZ);
    };

    Camera.prototype.getUp = function() {
        return quat(this.rotationQuaternion).rotated(Vect.unitY);
    };

    Camera.prototype.getRight = function() {
        return quat(this.rotationQuaternion).rotated(Vect.unitX);
    };

    Camera.prototype.setCenter = function(p) {
        this.center = vec(p);
        return this.navigate();
    };

    Camera.prototype.reset = function() {
        this.center = vec();
        this.degree = 90;
        this.rotate = 0;
        this.dist = 800;
        return this.navigate();
    };

    Camera.prototype.del = function() {
        return this.view.removeEventListener('mousewheel', this.onMouseWheel);
    };

    Camera.prototype.render = function() {
        var state;
        if (state = this.gamepad.getState()) {
            return this.onPadAxis(state);
        }
    };

    Camera.prototype.onPadAxis = function(state) {
        var ref2, ref3, ref4, speed;
        this.rotate += state.right.x;
        this.degree -= state.right.y;
        if ((((state.left.x === (ref4 = state.left.y) && ref4 === (ref3 = state.right.x)) && ref3 === (ref2 = state.right.y)) && ref2 === 0)) {
            return true;
        } else {
            this.fading = false;
            if (this.dist > this.moveDist) {
                this.dist = this.moveDist;
                this.center = this.getDir().mul(this.dist).add(this.position);
            }
            speed = 100 * this.world.space.distFactor;
            this.moveRelative(speed * state.left.x, 0, 2 * speed * state.left.y);
            return this.navigate();
        }
    };

    Camera.prototype.onPadButton = function(button, value) {
        if (value) {
            switch (button) {
                case 'LB':
                    return this.moveDown();
                case 'RB':
                    return this.moveUp();
                case 'LT':
                    return this.moveLeft();
                case 'RT':
                    return this.moveRight();
            }
        } else {
            switch (button) {
                case 'LB':
                    return this.stopDown();
                case 'RB':
                    return this.stopUp();
                case 'LT':
                    return this.stopLeft();
                case 'RT':
                    return this.stopRight();
            }
        }
    };

    Camera.prototype.onMouseDown = function(event) {
        this.downButtons = event.buttons;
        this.mouseMoved = false;
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
        return this.downPos = vec(this.mouseX, this.mouseY);
    };

    Camera.prototype.onMouseUp = function(event) {};

    Camera.prototype.onMouseDrag = function(event) {
        var ref2, s, x, y;
        x = event.clientX - this.mouseX;
        y = event.clientY - this.mouseY;
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
        if (((ref2 = this.downPos) != null ? ref2.dist(vec(this.mouseX, this.mouseY)) : void 0) > 60) {
            this.mouseMoved = true;
        }
        if (event.buttons & 4) {
            s = this.dist;
            this.pan(x * 2 * s / this.size.x, y * s / this.size.y);
        }
        if (event.buttons & 3) {
            s = this.dist === this.moveDist && 500 || 2000;
            return this.pivot(s * x / this.size.x, s * y / this.size.y);
        }
    };

    Camera.prototype.pivot = function(x, y) {
        this.rotate += 0.1 * x;
        this.degree += 0.1 * y;
        return this.navigate();
    };

    Camera.prototype.pan = function(x, y) {
        var ref2, right, up;
        right = vec(-x, 0, 0);
        right.applyQuaternion(this.rotationQuaternion);
        up = vec(0, y, 0);
        up.applyQuaternion(this.rotationQuaternion);
        this.center.add(right.plus(up));
        if ((ref2 = this.centerTarget) != null) {
            ref2.copy(this.center);
        }
        return this.navigate();
    };

    Camera.prototype.fadeToPos = function(v) {
        this.centerTarget = vec(v);
        if (this.dist <= this.moveDist) {
            this.dist = this.centerTarget.dist(this.position);
            this.center = this.getDir().mul(this.dist).add(this.position);
        }
        return this.startFadeCenter();
    };

    Camera.prototype.startFadeCenter = function() {
        if (!this.fading) {
            animate(this.fadeCenter);
            return this.fading = true;
        }
    };

    Camera.prototype.fadeCenter = function(deltaSeconds) {
        if (!this.fading) {
            return;
        }
        this.center.fade(this.centerTarget, deltaSeconds);
        this.navigate();
        if (this.center.dist(this.centerTarget) > 0.05) {
            animate(this.fadeCenter);
            return true;
        } else {
            return delete this.fading;
        }
    };

    Camera.prototype.moveForward = function(v) {
        if (v == null) {
            v = 1;
        }
        return this.startMove(this.moveZ = v);
    };

    Camera.prototype.moveRight = function(v) {
        if (v == null) {
            v = 1;
        }
        return this.startMove(this.moveX = v);
    };

    Camera.prototype.moveUp = function(v) {
        if (v == null) {
            v = 1;
        }
        return this.startMove(this.moveY = v);
    };

    Camera.prototype.moveLeft = function(v) {
        if (v == null) {
            v = -1;
        }
        return this.startMove(this.moveX = v);
    };

    Camera.prototype.moveDown = function(v) {
        if (v == null) {
            v = -1;
        }
        return this.startMove(this.moveY = v);
    };

    Camera.prototype.moveBackward = function(v) {
        if (v == null) {
            v = -1;
        }
        return this.startMove(this.moveZ = v);
    };

    Camera.prototype.stopRight = function() {
        return this.moveX = clamp(-1, 0, this.moveX);
    };

    Camera.prototype.stopLeft = function() {
        return this.moveX = clamp(0, 1, this.moveX);
    };

    Camera.prototype.stopUp = function() {
        return this.moveY = clamp(-1, 0, this.moveY);
    };

    Camera.prototype.stopDown = function() {
        return this.moveY = clamp(0, 1, this.moveY);
    };

    Camera.prototype.stopForward = function() {
        return this.moveZ = clamp(-1, 0, this.moveZ);
    };

    Camera.prototype.stopBackward = function() {
        return this.moveZ = clamp(0, 1, this.moveZ);
    };

    Camera.prototype.stopMoving = function() {
        this.fading = false;
        this.moving = false;
        this.moveX = 0;
        this.moveY = 0;
        return this.moveZ = 0;
    };

    Camera.prototype.startMove = function() {
        this.fading = false;
        if (!this.moving) {
            this.dist = this.moveDist;
            this.center = this.getDir().mul(this.dist).plus(this.position);
            animate(this.moveCenter);
            return this.moving = true;
        }
    };

    Camera.prototype.moveCenter = function(deltaSeconds) {
        var speed;
        if (!this.moving) {
            return;
        }
        speed = 1000 * this.world.space.distFactor;
        this.moveRelative(deltaSeconds * speed * (this.moveX || this.moveFade.x), deltaSeconds * speed * (this.moveY || this.moveFade.y), deltaSeconds * 2 * speed * (this.moveZ || this.moveFade.z));
        this.navigate();
        this.moveFade.x = this.moveX || reduce(this.moveFade.x, deltaSeconds);
        this.moveFade.y = this.moveY || reduce(this.moveFade.y, deltaSeconds);
        this.moveFade.z = this.moveZ || reduce(this.moveFade.z, deltaSeconds);
        if (this.moveFade.length() > 0.001) {
            return animate(this.moveCenter);
        } else {
            return this.stopMoving();
        }
    };

    Camera.prototype.moveRelative = function(x, y, z) {
        var v;
        v = new Vector3(x, y, z);
        v.rotateByQuaternionAroundPointToRef(this.rotationQuaternion, Vector3.ZeroReadOnly, v);
        return this.center.add(v);
    };

    Camera.prototype.onMouseWheel = function(event) {
        if (this.wheelInert > 0 && event.wheelDelta < 0) {
            this.wheelInert = 0;
            return;
        }
        if (this.wheelInert < 0 && event.wheelDelta > 0) {
            this.wheelInert = 0;
            return;
        }
        this.wheelInert += event.wheelDelta * (1 + (this.dist / this.maxDist) * 3) * 0.0001;
        return this.startZoom();
    };

    Camera.prototype.startZoomIn = function() {
        this.wheelInert = (1 + (this.dist / this.maxDist) * 3) * 10;
        return this.startZoom();
    };

    Camera.prototype.startZoomOut = function() {
        this.wheelInert = -(1 + (this.dist / this.maxDist) * 3) * 10;
        return this.startZoom();
    };

    Camera.prototype.startZoom = function() {
        if (!this.zooming) {
            animate(this.inertZoom);
            return this.zooming = true;
        }
    };

    Camera.prototype.stopZoom = function() {
        this.wheelInert = 0;
        return this.zooming = false;
    };

    Camera.prototype.inertZoom = function(deltaSeconds) {
        this.setDist(1 - clamp(-0.02, 0.02, this.wheelInert));
        this.wheelInert = reduce(this.wheelInert, deltaSeconds * 0.2);
        if (Math.abs(this.wheelInert) > 0.001) {
            if (this.wheelInert > 0 && this.dist > this.minDist || this.wheelInert < 0 && this.dist < this.maxDist) {
                animate(this.inertZoom);
                return true;
            }
        }
        delete this.zooming;
        return this.wheelInert = 0;
    };

    Camera.prototype.setDist = function(factor) {
        this.dist = clamp(this.minDist, this.maxDist, this.dist * factor);
        return this.navigate();
    };

    Camera.prototype.setFov = function(fov) {
        return this.fov = Math.max(2.0, Math.min(fov, 175.0));
    };

    Camera.prototype.scaleDown = function() {
        this.center.scale(0.01);
        this.position.scaleInPlace(0.01);
        this.dist *= 0.01;
        return this.navigate();
    };

    Camera.prototype.scaleUp = function(offset) {
        this.center.sub(offset);
        this.position.sub(offset);
        this.center.scale(100);
        this.position.scaleInPlace(100);
        this.dist *= 100;
        return this.navigate();
    };

    Camera.prototype.navigate = function() {
        var info, pitch, v, yaw;
        this.degree = clamp(1, 179, this.degree);
        yaw = deg2rad(this.rotate);
        pitch = deg2rad(this.degree);
        this.rotationQuaternion.copyFrom(Quaternion.RotationYawPitchRoll(yaw, pitch, 0));
        v = new Vector3(0, 0 - this.dist);
        v.rotateByQuaternionAroundPointToRef(this.rotationQuaternion, Vector3.ZeroReadOnly, v);
        this.position.copyFrom(this.center.plus(v));
        this.setTarget(new Vector3(this.center));
        info = {
            rotate: this.rotate,
            degree: this.degree,
            dist: this.dist,
            pos: {
                x: this.position.x,
                y: this.position.y,
                z: this.position.z
            },
            center: {
                x: this.center.x,
                y: this.center.y,
                z: this.center.z
            }
        };
        prefs.set('camera', info);
        if (12 * this.minDist / this.dist >= 8) {
            return this.scene.style.fontSize = 12 * this.minDist / this.dist;
        } else {
            return this.scene.style.fontSize = 0;
        }
    };

    return Camera;

})(UniversalCamera);

module.exports = Camera;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FtZXJhLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwySUFBQTtJQUFBOzs7O0FBUUEsTUFBNkMsT0FBQSxDQUFRLEtBQVIsQ0FBN0MsRUFBRSxpQkFBRixFQUFTLHFCQUFULEVBQWtCLHFCQUFsQixFQUEyQixpQkFBM0IsRUFBa0M7O0FBQ2xDLE9BQStELE9BQUEsQ0FBUSxXQUFSLENBQS9ELEVBQUUsb0JBQUYsRUFBVSw0QkFBVixFQUFzQiw0QkFBdEIsRUFBa0Msc0NBQWxDLEVBQW1EOztBQUVuRCxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0FBQ1AsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztBQUVQLE9BQUEsR0FBVSxPQUFBLENBQVEsV0FBUjs7QUFFVixHQUFBLEdBQU0sU0FBQyxDQUFELEVBQUcsQ0FBSCxFQUFLLENBQUw7V0FBVyxJQUFJLElBQUosQ0FBUyxDQUFULEVBQVksQ0FBWixFQUFlLENBQWY7QUFBWDs7QUFDTixJQUFBLEdBQU8sU0FBQyxDQUFELEVBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQO1dBQWEsSUFBSSxJQUFKLENBQVMsQ0FBVCxFQUFZLENBQVosRUFBZSxDQUFmLEVBQWtCLENBQWxCO0FBQWI7O0FBRUQ7OztJQUVDLGdCQUFDLEtBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLFFBQUQ7Ozs7Ozs7Ozs7OztRQUVBLE9BQTJCLElBQUMsQ0FBQSxLQUE1QixFQUFDLElBQUMsQ0FBQSxhQUFBLEtBQUYsRUFBUyxJQUFDLENBQUEsY0FBQSxNQUFWLEVBQWtCLElBQUMsQ0FBQSxZQUFBO1FBRW5CLEtBQUEsR0FBUyxJQUFDLENBQUEsSUFBSSxDQUFDO1FBQ2YsTUFBQSxHQUFTLElBQUMsQ0FBQSxJQUFJLENBQUM7UUFFZixJQUFBLEdBQ0k7WUFBQSxJQUFBLEVBQVEsRUFBUjtZQUNBLE1BQUEsRUFBUSxFQURSO1lBRUEs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RUFBQSxHQUFHLElBQUMsQ0FBQSxPQUFKLEdBQVksSUFBQyxDQUFBLEtBRHpDO1NBQUEsTUFBQTttQkFHSSxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFiLEdBQXdCLEVBSDVCOztJQXJCTTs7OztHQXRYTzs7QUFnWnJCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwIFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IGNsYW1wLCBkZWcycmFkLCBnYW1lcGFkLCBwcmVmcywgcmVkdWNlIH0gPSByZXF1aXJlICdreGsnXG57IENhbWVyYSwgUG9pbnRMaWdodCwgUXVhdGVybmlvbiwgVW5pdmVyc2FsQ2FtZXJhLCBWZWN0b3IzIH0gPSByZXF1aXJlICdiYWJ5bG9uanMnXG5cblZlY3QgPSByZXF1aXJlICcuL3ZlY3QnXG5RdWF0ID0gcmVxdWlyZSAnLi9xdWF0J1xuXG5hbmltYXRlID0gcmVxdWlyZSAnLi9hbmltYXRlJ1xuXG52ZWMgPSAoeCx5LHopIC0+IG5ldyBWZWN0IHgsIHksIHpcbnF1YXQgPSAoeCx5LHosdykgLT4gbmV3IFF1YXQgeCwgeSwgeiwgd1xuXG5jbGFzcyBDYW1lcmEgZXh0ZW5kcyBVbml2ZXJzYWxDYW1lcmFcblxuICAgIEA6IChAd29ybGQpIC0+XG4gICAgICAgIFxuICAgICAgICB7QHNjZW5lLCBAY2FudmFzLCBAdmlld30gPSBAd29ybGRcblxuICAgICAgICB3aWR0aCAgPSBAdmlldy5jbGllbnRXaWR0aFxuICAgICAgICBoZWlnaHQgPSBAdmlldy5jbGllbnRIZWlnaHRcbiAgICAgICAgICAgICBcbiAgICAgICAgaW5mbyA9IFxuICAgICAgICAgICAgZGlzdDogICAxMCBcbiAgICAgICAgICAgIGRlZ3JlZTogOTAgXG4gICAgICAgICAgICByb3RhdGU6IDAgXG4gICAgICAgICAgICBwb3M6ICAgIHt4OjAseTowLHo6MH1cbiAgICAgICAgICAgIGNlbnRlcjoge3g6MCx5OjAsejowfVxuICAgICAgICAgICAgXG4gICAgICAgIHZhbHVlcyA9IHByZWZzLmdldCAnY2FtZXJhJyBpbmZvXG4gICAgICAgIFxuICAgICAgICBAc2l6ZSAgICAgICA9IHZlYyB3aWR0aCwgaGVpZ2h0XG4gICAgICAgIEBtb3ZlRmFkZSAgID0gdmVjIDAgMCAwXG4gICAgICAgIEBjZW50ZXIgICAgID0gdmVjIHZhbHVlcy5jZW50ZXJcbiAgICAgICAgQGRlZ3JlZSAgICAgPSB2YWx1ZXMuZGVncmVlXG4gICAgICAgIEByb3RhdGUgICAgID0gdmFsdWVzLnJvdGF0ZVxuICAgICAgICBAZGlzdCAgICAgICA9IHZhbHVlcy5kaXN0XG4gICAgICAgIEBtaW5EaXN0ICAgID0gMlxuICAgICAgICBAbWF4RGlzdCAgICA9IDgwMFxuICAgICAgICBAbW92ZURpc3QgICA9IDAuMVxuICAgICAgICBAd2hlZWxJbmVydCA9IDBcbiAgICAgICAgQG1vdmVYICAgICAgPSAwXG4gICAgICAgIEBtb3ZlWSAgICAgID0gMFxuICAgICAgICBAbW92ZVogICAgICA9IDBcbiAgICAgICAgQHF1YXQgICAgICAgPSBxdWF0KClcbiAgICAgICAgXG4gICAgICAgIHN1cGVyICdDYW1lcmEnIG5ldyBWZWN0b3IzKDAgMCAwKSwgQHNjZW5lXG5cbiAgICAgICAgQG1heFogICAgICAgPSAxMDAwMDBcbiAgICAgICAgQG1pblogICAgICAgPSAxXG4gICAgICAgIFxuICAgICAgICBAZm92ID0gZGVnMnJhZCA2MFxuICAgICAgICBAcm90YXRpb25RdWF0ZXJuaW9uID0gbmV3IFF1YXRlcm5pb24oKVxuICAgICAgICBAcG9zaXRpb24uY29weUZyb20gdmFsdWVzLnBvc1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBAaW5lcnRpYSA9IDAuOFxuICAgICAgICBcbiAgICAgICAgQGxpZ2h0ID0gbmV3IFBvaW50TGlnaHQgJ3Nwb3QnIEBwb3NpdGlvbiwgQHNjZW5lXG4gICAgICAgIEBsaWdodC5pbnRlbnNpdHkgPSAwLjVcbiAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgQGdhbWVwYWQgPSBuZXcgZ2FtZXBhZCB0cnVlXG4gICAgICAgIEBnYW1lcGFkLm9uICdidXR0b24nIEBvblBhZEJ1dHRvblxuICAgICAgICBcbiAgICAgICAgQHZpZXcuYWRkRXZlbnRMaXN0ZW5lciAnbW91c2V3aGVlbCcgQG9uTW91c2VXaGVlbFxuICAgICAgICBAbmF2aWdhdGUoKVxuXG4gICAgZ2V0RGlyOiAgIC0+IHF1YXQoQHJvdGF0aW9uUXVhdGVybmlvbikucm90YXRlZCBWZWN0LnVuaXRaXG4gICAgZ2V0VXA6ICAgIC0+IHF1YXQoQHJvdGF0aW9uUXVhdGVybmlvbikucm90YXRlZCBWZWN0LnVuaXRZXG4gICAgZ2V0UmlnaHQ6IC0+IHF1YXQoQHJvdGF0aW9uUXVhdGVybmlvbikucm90YXRlZCBWZWN0LnVuaXRYXG5cbiAgICBzZXRDZW50ZXI6IChwKSAtPlxuXG4gICAgICAgIEBjZW50ZXIgPSB2ZWMgcFxuICAgICAgICBAbmF2aWdhdGUoKVxuICAgIFxuICAgIHJlc2V0OiAtPlxuICAgICAgICBAY2VudGVyID0gdmVjKClcbiAgICAgICAgQGRlZ3JlZSA9IDkwXG4gICAgICAgIEByb3RhdGUgPSAwXG4gICAgICAgIEBkaXN0ICAgPSA4MDBcbiAgICAgICAgQG5hdmlnYXRlKClcbiAgICAgICAgXG4gICAgZGVsOiA9PlxuICAgICAgICBcbiAgICAgICAgQHZpZXcucmVtb3ZlRXZlbnRMaXN0ZW5lciAnbW91c2V3aGVlbCcgQG9uTW91c2VXaGVlbFxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgcmVuZGVyOiAtPlxuICAgICAgICBpZiBzdGF0ZSA9IEBnYW1lcGFkLmdldFN0YXRlKClcbiAgICAgICAgICAgICMga2xvZyAnc3RhdGUnIHN0YXRlXG4gICAgICAgICAgICBAb25QYWRBeGlzIHN0YXRlXG4gICAgICAgICAgICAjIGZvciBidXR0b24sdmFsdWUgb2Ygc3RhdGUuYnV0dG9uc1xuICAgICAgICAgICAgICAgICMgQG9uUGFkQnV0dG9uIGJ1dHRvbiwgdmFsdWVcbiAgICBcbiAgICBvblBhZEF4aXM6IChzdGF0ZSkgPT4gXG4gICAgXG4gICAgICAgIEByb3RhdGUgKz0gc3RhdGUucmlnaHQueFxuICAgICAgICBAZGVncmVlIC09IHN0YXRlLnJpZ2h0LnlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIHN0YXRlLmxlZnQueCA9PSBzdGF0ZS5sZWZ0LnkgPT0gc3RhdGUucmlnaHQueCA9PSBzdGF0ZS5yaWdodC55ID09IDBcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGZhZGluZyA9IGZhbHNlXG4gICAgICAgICAgICBpZiBAZGlzdCA+IEBtb3ZlRGlzdFxuICAgICAgICAgICAgICAgIEBkaXN0ICAgPSBAbW92ZURpc3RcbiAgICAgICAgICAgICAgICBAY2VudGVyID0gQGdldERpcigpLm11bChAZGlzdCkuYWRkIEBwb3NpdGlvblxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzcGVlZCA9IDEwMCpAd29ybGQuc3BhY2UuZGlzdEZhY3RvclxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgQG1vdmVSZWxhdGl2ZSBzcGVlZCpzdGF0ZS5sZWZ0LngsIDAsIDIqc3BlZWQqc3RhdGUubGVmdC55XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIEBuYXZpZ2F0ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgb25QYWRCdXR0b246IChidXR0b24sIHZhbHVlKSA9PlxuICAgICAgICBcbiAgICAgICAgaWYgdmFsdWVcbiAgICAgICAgICAgIHN3aXRjaCBidXR0b25cbiAgICAgICAgICAgICAgICB3aGVuICdMQicgdGhlbiBAbW92ZURvd24oKVxuICAgICAgICAgICAgICAgIHdoZW4gJ1JCJyB0aGVuIEBtb3ZlVXAoKVxuICAgICAgICAgICAgICAgIHdoZW4gJ0xUJyB0aGVuIEBtb3ZlTGVmdCgpXG4gICAgICAgICAgICAgICAgd2hlbiAnUlQnIHRoZW4gQG1vdmVSaWdodCgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHN3aXRjaCBidXR0b25cbiAgICAgICAgICAgICAgICB3aGVuICdMQicgdGhlbiBAc3RvcERvd24oKVxuICAgICAgICAgICAgICAgIHdoZW4gJ1JCJyB0aGVuIEBzdG9wVXAoKVxuICAgICAgICAgICAgICAgIHdoZW4gJ0xUJyB0aGVuIEBzdG9wTGVmdCgpXG4gICAgICAgICAgICAgICAgd2hlbiAnUlQnIHRoZW4gQHN0b3BSaWdodCgpXG4gICAgICAgIFxuICAgICMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgb25Nb3VzZURvd246IChldmVudCkgPT4gXG4gICAgICAgIFxuICAgICAgICBAZG93bkJ1dHRvbnMgPSBldmVudC5idXR0b25zXG4gICAgICAgIEBtb3VzZU1vdmVkICA9IGZhbHNlXG4gICAgICAgICAgICBcbiAgICAgICAgQG1vdXNlWCA9IGV2ZW50LmNsaWVudFhcbiAgICAgICAgQG1vdXNlWSA9IGV2ZW50LmNsaWVudFlcbiAgICAgICAgXG4gICAgICAgIEBkb3duUG9zID0gdmVjIEBtb3VzZVgsIEBtb3VzZVlcbiAgICAgICAgXG4gICAgb25Nb3VzZVVwOiAoZXZlbnQpID0+ICNrbG9nICd1cCdcblxuICAgIG9uTW91c2VEcmFnOiAoZXZlbnQpID0+XG5cbiAgICAgICAgeCA9IGV2ZW50LmNsaWVudFgtQG1vdXNlWFxuICAgICAgICB5ID0gZXZlbnQuY2xpZW50WS1AbW91c2VZXG5cbiAgICAgICAgQG1vdXNlWCA9IGV2ZW50LmNsaWVudFhcbiAgICAgICAgQG1vdXNlWSA9IGV2ZW50LmNsaWVudFlcbiAgICAgICAgXG4gICAgICAgIGlmIEBkb3duUG9zPy5kaXN0KHZlYyBAbW91c2VYLCBAbW91c2VZKSA+IDYwXG4gICAgICAgICAgICBAbW91c2VNb3ZlZCA9IHRydWVcbiAgICAgICAgXG4gICAgICAgIGlmIGV2ZW50LmJ1dHRvbnMgJiA0XG4gICAgICAgICAgICBzID0gQGRpc3RcbiAgICAgICAgICAgIEBwYW4geCoyKnMvQHNpemUueCwgeSpzL0BzaXplLnlcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBldmVudC5idXR0b25zICYgM1xuICAgICAgICAgICAgcyA9IEBkaXN0ID09IEBtb3ZlRGlzdCBhbmQgNTAwIG9yIDIwMDBcbiAgICAgICAgICAgIEBwaXZvdCBzKngvQHNpemUueCwgcyp5L0BzaXplLnkgICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAgICAwMDAgMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAgICAwICAgICAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuICAgIFxuICAgIHBpdm90OiAoeCx5KSAtPlxuICAgICAgICAgXG4gICAgICAgIEByb3RhdGUgKz0gMC4xKnhcbiAgICAgICAgQGRlZ3JlZSArPSAwLjEqeVxuICAgICAgICAgICAgICAgICBcbiAgICAgICAgQG5hdmlnYXRlKClcbiAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHBhbjogKHgseSkgLT5cbiAgICAgICAgXG4gICAgICAgIHJpZ2h0ID0gdmVjIC14LCAwLCAwIFxuICAgICAgICByaWdodC5hcHBseVF1YXRlcm5pb24gQHJvdGF0aW9uUXVhdGVybmlvblxuXG4gICAgICAgIHVwID0gdmVjIDAsIHksIDAgXG4gICAgICAgIHVwLmFwcGx5UXVhdGVybmlvbiBAcm90YXRpb25RdWF0ZXJuaW9uXG4gICAgICAgIFxuICAgICAgICBAY2VudGVyLmFkZCByaWdodC5wbHVzIHVwXG4gICAgICAgIEBjZW50ZXJUYXJnZXQ/LmNvcHkgQGNlbnRlclxuICAgICAgICBAbmF2aWdhdGUoKVxuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgICAgICAgICAgICAgICAgICBcbiAgICBmYWRlVG9Qb3M6ICh2KSAtPiBcbiAgICAgICAgQGNlbnRlclRhcmdldCA9IHZlYyB2XG4gICAgICAgIFxuICAgICAgICBpZiBAZGlzdCA8PSBAbW92ZURpc3RcbiAgICAgICAgICAgIEBkaXN0ID0gQGNlbnRlclRhcmdldC5kaXN0IEBwb3NpdGlvblxuICAgICAgICAgICAgQGNlbnRlciA9IEBnZXREaXIoKS5tdWwoQGRpc3QpLmFkZCBAcG9zaXRpb25cblxuICAgICAgICBAc3RhcnRGYWRlQ2VudGVyKClcblxuICAgIHN0YXJ0RmFkZUNlbnRlcjogLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBub3QgQGZhZGluZ1xuICAgICAgICAgICAgYW5pbWF0ZSBAZmFkZUNlbnRlclxuICAgICAgICAgICAgQGZhZGluZyA9IHRydWVcbiAgICAgICAgICAgIFxuICAgIGZhZGVDZW50ZXI6IChkZWx0YVNlY29uZHMpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IEBmYWRpbmdcbiAgICAgICAgXG4gICAgICAgIEBjZW50ZXIuZmFkZSBAY2VudGVyVGFyZ2V0LCBkZWx0YVNlY29uZHNcbiAgICAgICAgQG5hdmlnYXRlKClcbiAgICAgICAgaWYgQGNlbnRlci5kaXN0KEBjZW50ZXJUYXJnZXQpID4gMC4wNVxuICAgICAgICAgICAgYW5pbWF0ZSBAZmFkZUNlbnRlclxuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBkZWxldGUgQGZhZGluZ1xuXG4gICAgIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgbW92ZUZvcndhcmQ6ICAodj0xKSAgLT4gQHN0YXJ0TW92ZSBAbW92ZVogPSB2XG4gICAgbW92ZVJpZ2h0OiAgICAodj0xKSAgLT4gQHN0YXJ0TW92ZSBAbW92ZVggPSB2XG4gICAgbW92ZVVwOiAgICAgICAodj0xKSAgLT4gQHN0YXJ0TW92ZSBAbW92ZVkgPSB2XG4gICAgbW92ZUxlZnQ6ICAgICAodj0tMSkgLT4gQHN0YXJ0TW92ZSBAbW92ZVggPSB2XG4gICAgbW92ZURvd246ICAgICAodj0tMSkgLT4gQHN0YXJ0TW92ZSBAbW92ZVkgPSB2XG4gICAgbW92ZUJhY2t3YXJkOiAodj0tMSkgLT4gQHN0YXJ0TW92ZSBAbW92ZVogPSB2ICAgICAgICAgIFxuXG4gICAgc3RvcFJpZ2h0OiAgICAtPiBAbW92ZVggPSBjbGFtcCAtMSAwIEBtb3ZlWFxuICAgIHN0b3BMZWZ0OiAgICAgLT4gQG1vdmVYID0gY2xhbXAgIDAgMSBAbW92ZVhcbiAgICBzdG9wVXA6ICAgICAgIC0+IEBtb3ZlWSA9IGNsYW1wIC0xIDAgQG1vdmVZXG4gICAgc3RvcERvd246ICAgICAtPiBAbW92ZVkgPSBjbGFtcCAgMCAxIEBtb3ZlWVxuICAgIHN0b3BGb3J3YXJkOiAgLT4gQG1vdmVaID0gY2xhbXAgLTEgMCBAbW92ZVpcbiAgICBzdG9wQmFja3dhcmQ6IC0+IEBtb3ZlWiA9IGNsYW1wICAwIDEgQG1vdmVaXG4gICAgICAgIFxuICAgIHN0b3BNb3Zpbmc6IC0+XG4gICAgICAgIFxuICAgICAgICBAZmFkaW5nID0gZmFsc2VcbiAgICAgICAgQG1vdmluZyA9IGZhbHNlXG4gICAgICAgIEBtb3ZlWCA9IDBcbiAgICAgICAgQG1vdmVZID0gMFxuICAgICAgICBAbW92ZVogPSAwXG4gICAgICAgXG4gICAgc3RhcnRNb3ZlOiAtPiBcbiAgICAgICAgXG4gICAgICAgIEBmYWRpbmcgPSBmYWxzZVxuICAgICAgICBpZiBub3QgQG1vdmluZ1xuICAgICAgICAgICAgQGRpc3QgICA9IEBtb3ZlRGlzdFxuICAgICAgICAgICAgQGNlbnRlciA9IEBnZXREaXIoKS5tdWwoQGRpc3QpLnBsdXMgQHBvc2l0aW9uXG4gICAgICAgICAgICBhbmltYXRlIEBtb3ZlQ2VudGVyXG4gICAgICAgICAgICBAbW92aW5nID0gdHJ1ZVxuICAgICAgICAgICAgXG4gICAgbW92ZUNlbnRlcjogKGRlbHRhU2Vjb25kcykgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgQG1vdmluZ1xuICAgICAgICBcbiAgICAgICAgc3BlZWQgPSAxMDAwICogQHdvcmxkLnNwYWNlLmRpc3RGYWN0b3JcbiAgICAgICAgXG4gICAgICAgIEBtb3ZlUmVsYXRpdmUoZGVsdGFTZWNvbmRzICogICAgIHNwZWVkICogKEBtb3ZlWCBvciBAbW92ZUZhZGUueClcbiAgICAgICAgICAgICAgICAgICAgICBkZWx0YVNlY29uZHMgKiAgICAgc3BlZWQgKiAoQG1vdmVZIG9yIEBtb3ZlRmFkZS55KVxuICAgICAgICAgICAgICAgICAgICAgIGRlbHRhU2Vjb25kcyAqIDIgKiBzcGVlZCAqIChAbW92ZVogb3IgQG1vdmVGYWRlLnopKVxuICAgICAgICBcbiAgICAgICAgQG5hdmlnYXRlKClcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQG1vdmVGYWRlLnggPSBAbW92ZVggb3IgcmVkdWNlIEBtb3ZlRmFkZS54LCBkZWx0YVNlY29uZHNcbiAgICAgICAgQG1vdmVGYWRlLnkgPSBAbW92ZVkgb3IgcmVkdWNlIEBtb3ZlRmFkZS55LCBkZWx0YVNlY29uZHNcbiAgICAgICAgQG1vdmVGYWRlLnogPSBAbW92ZVogb3IgcmVkdWNlIEBtb3ZlRmFkZS56LCBkZWx0YVNlY29uZHNcbiAgICAgICAgXG4gICAgICAgIGlmIEBtb3ZlRmFkZS5sZW5ndGgoKSA+IDAuMDAxXG4gICAgICAgICAgICBhbmltYXRlIEBtb3ZlQ2VudGVyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzdG9wTW92aW5nKClcbiAgICAgICAgXG4gICAgbW92ZVJlbGF0aXZlOiAoeCwgeSwgeikgLT5cbiAgICAgICAgXG4gICAgICAgIHYgPSBuZXcgVmVjdG9yMyB4LCB5LCB6XG4gICAgICAgIHYucm90YXRlQnlRdWF0ZXJuaW9uQXJvdW5kUG9pbnRUb1JlZiBAcm90YXRpb25RdWF0ZXJuaW9uLCBWZWN0b3IzLlplcm9SZWFkT25seSwgdlxuICAgICAgICBAY2VudGVyLmFkZCB2XG4gICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwMDAwMCAgXG4gICAgXG4gICAgb25Nb3VzZVdoZWVsOiAoZXZlbnQpID0+IFxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEB3aGVlbEluZXJ0ID4gMCBhbmQgZXZlbnQud2hlZWxEZWx0YSA8IDBcbiAgICAgICAgICAgIEB3aGVlbEluZXJ0ID0gMFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQHdoZWVsSW5lcnQgPCAwIGFuZCBldmVudC53aGVlbERlbHRhID4gMFxuICAgICAgICAgICAgQHdoZWVsSW5lcnQgPSAwXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICBAd2hlZWxJbmVydCArPSBldmVudC53aGVlbERlbHRhICogKDErKEBkaXN0L0BtYXhEaXN0KSozKSAqIDAuMDAwMVxuICAgICAgICBcbiAgICAgICAgQHN0YXJ0Wm9vbSgpXG5cbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMCAgICAgMDAgIFxuICAgICMgICAgMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAgIDAwMCAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwICBcbiAgICAjICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDAgIFxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG5cbiAgICBzdGFydFpvb21JbjogLT5cbiAgICAgICAgXG4gICAgICAgIEB3aGVlbEluZXJ0ID0gKDErKEBkaXN0L0BtYXhEaXN0KSozKSoxMFxuICAgICAgICBAc3RhcnRab29tKClcbiAgICAgICAgXG4gICAgc3RhcnRab29tT3V0OiAtPlxuICAgICAgICBcbiAgICAgICAgQHdoZWVsSW5lcnQgPSAtKDErKEBkaXN0L0BtYXhEaXN0KSozKSoxMFxuICAgICAgICBAc3RhcnRab29tKClcbiAgICBcbiAgICBzdGFydFpvb206IC0+IFxuICAgICAgICBcbiAgICAgICAgaWYgbm90IEB6b29taW5nXG4gICAgICAgICAgICBhbmltYXRlIEBpbmVydFpvb21cbiAgICAgICAgICAgIEB6b29taW5nID0gdHJ1ZVxuICAgICAgICAgICAgXG4gICAgc3RvcFpvb206IC0+IFxuICAgICAgICBcbiAgICAgICAgQHdoZWVsSW5lcnQgPSAwXG4gICAgICAgIEB6b29taW5nID0gZmFsc2VcbiAgICBcbiAgICBpbmVydFpvb206IChkZWx0YVNlY29uZHMpID0+XG5cbiAgICAgICAgQHNldERpc3QgMSAtIGNsYW1wIC0wLjAyIDAuMDIgQHdoZWVsSW5lcnRcbiAgICAgICAgQHdoZWVsSW5lcnQgPSByZWR1Y2UgQHdoZWVsSW5lcnQsIGRlbHRhU2Vjb25kcyowLjJcbiAgICAgICAgaWYgTWF0aC5hYnMoQHdoZWVsSW5lcnQpID4gMC4wMDFcbiAgICAgICAgICAgIGlmIEB3aGVlbEluZXJ0ID4gMCBhbmQgQGRpc3QgPiBAbWluRGlzdCBvciBAd2hlZWxJbmVydCA8IDAgYW5kIEBkaXN0IDwgQG1heERpc3RcbiAgICAgICAgICAgICAgICBhbmltYXRlIEBpbmVydFpvb21cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgICAgIGRlbGV0ZSBAem9vbWluZ1xuICAgICAgICBAd2hlZWxJbmVydCA9IDBcbiAgICBcbiAgICBzZXREaXN0OiAoZmFjdG9yKSA9PlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAZGlzdCA9IGNsYW1wIEBtaW5EaXN0LCBAbWF4RGlzdCwgQGRpc3QqZmFjdG9yXG4gICAgICAgIEBuYXZpZ2F0ZSgpXG4gICAgICAgIFxuICAgIHNldEZvdjogKGZvdikgLT4gQGZvdiA9IE1hdGgubWF4IDIuMCBNYXRoLm1pbiBmb3YsIDE3NS4wXG4gICAgXG4gICAgc2NhbGVEb3duOiAtPlxuICAgICAgICBcbiAgICAgICAgQGNlbnRlci5zY2FsZSAwLjAxXG4gICAgICAgIEBwb3NpdGlvbi5zY2FsZUluUGxhY2UgMC4wMVxuICAgICAgICBAZGlzdCAqPSAwLjAxXG4gICAgICAgIEBuYXZpZ2F0ZSgpXG5cbiAgICBzY2FsZVVwOiAob2Zmc2V0KSAtPlxuICAgICAgICBcbiAgICAgICAgQGNlbnRlci5zdWIgb2Zmc2V0XG4gICAgICAgIEBwb3NpdGlvbi5zdWIgb2Zmc2V0XG4gICAgICAgIFxuICAgICAgICBAY2VudGVyLnNjYWxlIDEwMFxuICAgICAgICBAcG9zaXRpb24uc2NhbGVJblBsYWNlIDEwMFxuICAgICAgICBAZGlzdCAqPSAxMDBcbiAgICAgICAgQG5hdmlnYXRlKClcbiAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAwMDAwMDAgICAwMDAgMDAwICAgMDAwICAwMDAgIDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgMCAgICAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIG5hdmlnYXRlOiAtPiBcbiAgICAgICAgXG4gICAgICAgIEBkZWdyZWUgPSBjbGFtcCAxIDE3OSBAZGVncmVlXG4gICAgICAgIFxuICAgICAgICB5YXcgICA9IGRlZzJyYWQgQHJvdGF0ZVxuICAgICAgICBwaXRjaCA9IGRlZzJyYWQgQGRlZ3JlZVxuICAgICAgICBAcm90YXRpb25RdWF0ZXJuaW9uLmNvcHlGcm9tIFF1YXRlcm5pb24uUm90YXRpb25ZYXdQaXRjaFJvbGwgeWF3LCBwaXRjaCwgMFxuICAgICAgICB2ID0gbmV3IFZlY3RvcjMgMCAwIC1AZGlzdFxuICAgICAgICB2LnJvdGF0ZUJ5UXVhdGVybmlvbkFyb3VuZFBvaW50VG9SZWYgQHJvdGF0aW9uUXVhdGVybmlvbiwgVmVjdG9yMy5aZXJvUmVhZE9ubHksIHZcbiAgICAgICAgQHBvc2l0aW9uLmNvcHlGcm9tIEBjZW50ZXIucGx1cyB2XG4gICAgICAgIEBzZXRUYXJnZXQgbmV3IFZlY3RvcjMgQGNlbnRlclxuICAgICAgICBcbiAgICAgICAgaW5mbyA9IFxuICAgICAgICAgICAgcm90YXRlOiBAcm90YXRlIFxuICAgICAgICAgICAgZGVncmVlOiBAZGVncmVlIFxuICAgICAgICAgICAgZGlzdDogICBAZGlzdFxuICAgICAgICAgICAgcG9zOiAgICB7eDpAcG9zaXRpb24ueCwgeTpAcG9zaXRpb24ueSwgejpAcG9zaXRpb24uen1cbiAgICAgICAgICAgIGNlbnRlcjoge3g6QGNlbnRlci54LCB5OkBjZW50ZXIueSwgejpAY2VudGVyLnp9XG4gICAgICAgICMga2xvZyBpbmZvXG4gICAgICAgIHByZWZzLnNldCAnY2FtZXJhJyBpbmZvXG4gICAgICAgIFxuICAgICAgICBpZiAxMipAbWluRGlzdC9AZGlzdCA+PSA4XG4gICAgICAgICAgICBAc2NlbmUuc3R5bGUuZm9udFNpemUgPSAxMipAbWluRGlzdC9AZGlzdFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2NlbmUuc3R5bGUuZm9udFNpemUgPSAwXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBDYW1lcmFcbiJdfQ==
//# sourceURL=../coffee/camera.coffee