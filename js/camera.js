// koffee 1.12.0

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
            dist: 12,
            degree: 90,
            rotate: 0,
            pos: {
                x: 0,
                y: 5,
                z: 12
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
        this.minDist = 300;
        this.maxDist = 3000;
        this.moveDist = 0.1;
        this.wheelInert = 0;
        this.moveX = 0;
        this.moveY = 0;
        this.moveZ = 0;
        this.moveSpeed = 1000.0;
        this.quat = quat();
        this.mouse = {
            buttons: 0,
            delta: vec(0, 0),
            down: vec(0, 0),
            pos: vec(0, 0),
            up: vec(0, 0)
        };
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
        this.degree = 120;
        this.rotate = 40;
        this.dist = 1000;
        return this.navigate();
    };

    Camera.prototype.del = function() {
        return this.view.removeEventListener('mousewheel', this.onMouseWheel);
    };

    Camera.prototype.render = function() {
        var state;
        this.speedFactor = 1;
        if (this.fastSpeed) {
            this.speedFactor *= 4;
        }
        if (state = this.gamepad.getState()) {
            return this.onPadAxis(state);
        }
    };

    Camera.prototype.onPadAxis = function(state) {
        var ref2, ref3, ref4;
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
            this.moveRelative(0.03 * this.moveSpeed * state.left.x, 0, 0.03 * this.moveSpeed * state.left.y);
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
                    return this.fastSpeed = true;
            }
        } else {
            switch (button) {
                case 'LB':
                    return this.stopDown();
                case 'RB':
                    return this.stopUp();
                case 'LT':
                    return this.fastSpeed = false;
            }
        }
    };

    Camera.prototype.onMouseDown = function(event) {
        var br;
        br = this.canvas.getBoundingClientRect();
        this.mouse.moved = false;
        this.mouse.buttons = event.buttons;
        this.mouse.pos = vec(event.clientX - br.left, event.clientY - br.top);
        return this.mouse.down = vec(this.mouse.pos);
    };

    Camera.prototype.onMouseUp = function(event) {
        this.mouse.buttons = 0;
        return this.mouse.up = vec(this.mouse.pos);
    };

    Camera.prototype.onMouseDrag = function(event) {
        var br, newPos, s;
        br = this.canvas.getBoundingClientRect();
        newPos = vec(event.clientX - br.left, event.clientY - br.top);
        this.mouse.delta = newPos.minus(this.mouse.pos);
        this.mouse.pos = newPos;
        if (this.mouse.down.dist(this.mouse.pos) > 60) {
            this.mouse.moved = true;
        }
        if (event.buttons & 4) {
            s = this.moveSpeed * 4;
            this.pan(this.mouse.delta.x * 2 * s / this.size.x, this.mouse.delta.y * s / this.size.y);
        }
        if (event.buttons & 2) {
            s = this.dist === this.moveDist && 500 || 2000;
            return this.pivot(s * this.mouse.delta.x / this.size.x, s * this.mouse.delta.y / this.size.y);
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
        if (!this.moving) {
            return;
        }
        this.moveRelative(deltaSeconds * (this.moveSpeed * this.moveX || this.moveFade.x), deltaSeconds * (this.moveSpeed * this.moveY || this.moveFade.y), deltaSeconds * 2 * (this.moveSpeed * this.moveZ || this.moveFade.z));
        this.navigate();
        this.moveFade.x = this.moveSpeed * this.moveX || reduce(this.moveFade.x, this.moveSpeed * deltaSeconds);
        this.moveFade.y = this.moveSpeed * this.moveY || reduce(this.moveFade.y, this.moveSpeed * deltaSeconds);
        this.moveFade.z = this.moveSpeed * this.moveZ || reduce(this.moveFade.z, this.moveSpeed * deltaSeconds);
        if (this.moveFade.length() > 0.001) {
            return animate(this.moveCenter);
        } else {
            return this.stopMoving();
        }
    };

    Camera.prototype.moveRelative = function(x, y, z) {
        var v;
        v = vec(x, y, z);
        v.scale(this.speedFactor);
        v.applyQuaternion(this.rotationQuaternion);
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
        this.setTarget(new Vector3(this.center.x, this.center.y, this.center.z));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FtZXJhLmpzIiwic291cmNlUm9vdCI6Ii4uL2NvZmZlZSIsInNvdXJjZXMiOlsiY2FtZXJhLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwySUFBQTtJQUFBOzs7O0FBUUEsTUFBNkMsT0FBQSxDQUFRLEtBQVIsQ0FBN0MsRUFBRSxpQkFBRixFQUFTLHFCQUFULEVBQWtCLHFCQUFsQixFQUEyQixpQkFBM0IsRUFBa0M7O0FBQ2xDLE9BQStELE9BQUEsQ0FBUSxXQUFSLENBQS9ELEVBQUUsb0JBQUYsRUFBVSw0QkFBVixFQUFzQiw0QkFBdEIsRUFBa0Msc0NBQWxDLEVBQW1EOztBQUVuRCxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0FBQ1AsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztBQUVQLE9BQUEsR0FBVSxPQUFBLENBQVEsV0FBUjs7QUFFVixHQUFBLEdBQU8sU0FBQyxDQUFELEVBQUcsQ0FBSCxFQUFLLENBQUw7V0FBVyxJQUFJLElBQUosQ0FBUyxDQUFULEVBQVksQ0FBWixFQUFlLENBQWY7QUFBWDs7QUFDUCxJQUFBLEdBQU8sU0FBQyxDQUFELEVBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQO1dBQWEsSUFBSSxJQUFKLENBQVMsQ0FBVCxFQUFZLENBQVosRUFBZSxDQUFmLEVBQWtCLENBQWxCO0FBQWI7O0FBRUQ7OztJQUVDLGdCQUFDLEtBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLFFBQUQ7Ozs7Ozs7Ozs7OztRQUVBLE9BQTJCLElBQUMsQ0FBQSxLQUE1QixFQUFDLElBQUMsQ0FBQSxhQUFBLEtBQUYsRUFBUyxJQUFDLENBQUEsY0FBQSxNQUFWLEVBQWtCLElBQUMsQ0FBQSxZQUFBO1FBRW5CLEtBQUEsR0FBUyxJQUFDLENBQUEsSUFBSSxDQUFDO1FBQ2YsTUFBQSxHQUFTLElBQUMsQ0FBQSxJQUFJLENBQUM7UUFFZixJQUFBLEdBQ0k7WUFBQSxJQUFBLEVBQVEsRUFBUjtZQUNB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LElBQUMsQ0FBQSxPQUFKLEdBQVksSUFBQyxDQUFBLEtBRHpDO1NBQUEsTUFBQTttQkFHSSxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFiLEdBQXdCLEVBSDVCOztJQXRCTTs7OztHQW5ZTzs7QUE4WnJCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwIFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IGNsYW1wLCBkZWcycmFkLCBnYW1lcGFkLCBwcmVmcywgcmVkdWNlIH0gPSByZXF1aXJlICdreGsnXG57IENhbWVyYSwgUG9pbnRMaWdodCwgUXVhdGVybmlvbiwgVW5pdmVyc2FsQ2FtZXJhLCBWZWN0b3IzIH0gPSByZXF1aXJlICdiYWJ5bG9uanMnXG5cblZlY3QgPSByZXF1aXJlICcuL3ZlY3QnXG5RdWF0ID0gcmVxdWlyZSAnLi9xdWF0J1xuXG5hbmltYXRlID0gcmVxdWlyZSAnLi9hbmltYXRlJ1xuXG52ZWMgID0gKHgseSx6KSAtPiBuZXcgVmVjdCB4LCB5LCB6XG5xdWF0ID0gKHgseSx6LHcpIC0+IG5ldyBRdWF0IHgsIHksIHosIHdcblxuY2xhc3MgQ2FtZXJhIGV4dGVuZHMgVW5pdmVyc2FsQ2FtZXJhXG5cbiAgICBAOiAoQHdvcmxkKSAtPlxuICAgICAgICBcbiAgICAgICAge0BzY2VuZSwgQGNhbnZhcywgQHZpZXd9ID0gQHdvcmxkXG5cbiAgICAgICAgd2lkdGggID0gQHZpZXcuY2xpZW50V2lkdGhcbiAgICAgICAgaGVpZ2h0ID0gQHZpZXcuY2xpZW50SGVpZ2h0XG4gICAgICAgICAgICAgXG4gICAgICAgIGluZm8gPSBcbiAgICAgICAgICAgIGRpc3Q6ICAgMTJcbiAgICAgICAgICAgIGRlZ3JlZTogOTAgXG4gICAgICAgICAgICByb3RhdGU6IDAgXG4gICAgICAgICAgICBwb3M6ICAgIHt4OjAseTo1LHo6MTJ9XG4gICAgICAgICAgICBjZW50ZXI6IHt4OjAseTowLHo6MH1cbiAgICAgICAgICAgIFxuICAgICAgICB2YWx1ZXMgPSBwcmVmcy5nZXQgJ2NhbWVyYScgaW5mb1xuICAgICAgICBcbiAgICAgICAgQHNpemUgICAgICAgPSB2ZWMgd2lkdGgsIGhlaWdodFxuICAgICAgICBAbW92ZUZhZGUgICA9IHZlYyAwIDAgMFxuICAgICAgICBAY2VudGVyICAgICA9IHZlYyB2YWx1ZXMuY2VudGVyXG4gICAgICAgIEBkZWdyZWUgICAgID0gdmFsdWVzLmRlZ3JlZVxuICAgICAgICBAcm90YXRlICAgICA9IHZhbHVlcy5yb3RhdGVcbiAgICAgICAgQGRpc3QgICAgICAgPSB2YWx1ZXMuZGlzdFxuICAgICAgICBAbWluRGlzdCAgICA9IDMwMFxuICAgICAgICBAbWF4RGlzdCAgICA9IDMwMDBcbiAgICAgICAgQG1vdmVEaXN0ICAgPSAwLjFcbiAgICAgICAgQHdoZWVsSW5lcnQgPSAwXG4gICAgICAgIEBtb3ZlWCAgICAgID0gMFxuICAgICAgICBAbW92ZVkgICAgICA9IDBcbiAgICAgICAgQG1vdmVaICAgICAgPSAwXG4gICAgICAgIEBtb3ZlU3BlZWQgID0gMTAwMC4wXG4gICAgICAgIEBxdWF0ICAgICAgID0gcXVhdCgpXG4gICAgICAgIFxuICAgICAgICBAbW91c2UgPSBcbiAgICAgICAgICAgIGJ1dHRvbnM6IDBcbiAgICAgICAgICAgIGRlbHRhOiB2ZWMgMCAwXG4gICAgICAgICAgICBkb3duOiAgdmVjIDAgMFxuICAgICAgICAgICAgcG9zOiAgIHZlYyAwIDBcbiAgICAgICAgICAgIHVwOiAgICB2ZWMgMCAwXG4gICAgICAgICAgICBcbiAgICAgICAgc3VwZXIgJ0NhbWVyYScgbmV3IFZlY3RvcjMoMCAwIDApLCBAc2NlbmVcblxuICAgICAgICBAbWF4WiAgICAgICA9IDEwMDAwMFxuICAgICAgICBAbWluWiAgICAgICA9IDFcbiAgICAgICAgXG4gICAgICAgIEBmb3YgPSBkZWcycmFkIDYwXG4gICAgICAgIEByb3RhdGlvblF1YXRlcm5pb24gPSBuZXcgUXVhdGVybmlvbigpXG4gICAgICAgIEBwb3NpdGlvbi5jb3B5RnJvbSB2YWx1ZXMucG9zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBpbmVydGlhID0gMC44XG4gICAgICAgIFxuICAgICAgICBAbGlnaHQgPSBuZXcgUG9pbnRMaWdodCAnc3BvdCcgQHBvc2l0aW9uLCBAc2NlbmVcbiAgICAgICAgQGxpZ2h0LmludGVuc2l0eSA9IDAuNVxuICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAZ2FtZXBhZCA9IG5ldyBnYW1lcGFkIHRydWVcbiAgICAgICAgQGdhbWVwYWQub24gJ2J1dHRvbicgQG9uUGFkQnV0dG9uXG4gICAgICAgIFxuICAgICAgICBAdmlldy5hZGRFdmVudExpc3RlbmVyICdtb3VzZXdoZWVsJyBAb25Nb3VzZVdoZWVsXG4gICAgICAgIEBuYXZpZ2F0ZSgpXG5cbiAgICBnZXREaXI6ICAgLT4gcXVhdChAcm90YXRpb25RdWF0ZXJuaW9uKS5yb3RhdGVkIFZlY3QudW5pdFpcbiAgICBnZXRVcDogICAgLT4gcXVhdChAcm90YXRpb25RdWF0ZXJuaW9uKS5yb3RhdGVkIFZlY3QudW5pdFlcbiAgICBnZXRSaWdodDogLT4gcXVhdChAcm90YXRpb25RdWF0ZXJuaW9uKS5yb3RhdGVkIFZlY3QudW5pdFhcblxuICAgIHNldENlbnRlcjogKHApIC0+XG5cbiAgICAgICAgQGNlbnRlciA9IHZlYyBwXG4gICAgICAgIEBuYXZpZ2F0ZSgpXG4gICAgXG4gICAgcmVzZXQ6IC0+XG4gICAgICAgIEBjZW50ZXIgPSB2ZWMoKVxuICAgICAgICBAZGVncmVlID0gMTIwXG4gICAgICAgIEByb3RhdGUgPSA0MFxuICAgICAgICBAZGlzdCAgID0gMTAwMFxuICAgICAgICBAbmF2aWdhdGUoKVxuICAgICAgICBcbiAgICBkZWw6ID0+XG4gICAgICAgIFxuICAgICAgICBAdmlldy5yZW1vdmVFdmVudExpc3RlbmVyICdtb3VzZXdoZWVsJyBAb25Nb3VzZVdoZWVsXG4gICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgcmVuZGVyOiAtPlxuICAgICAgICBcbiAgICAgICAgQHNwZWVkRmFjdG9yID0gMVxuICAgICAgICBAc3BlZWRGYWN0b3IgKj0gNCBpZiBAZmFzdFNwZWVkXG4gICAgICAgIFxuICAgICAgICBpZiBzdGF0ZSA9IEBnYW1lcGFkLmdldFN0YXRlKClcbiAgICAgICAgICAgIEBvblBhZEF4aXMgc3RhdGVcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICAgICBcbiAgICBvblBhZEF4aXM6IChzdGF0ZSkgPT4gXG4gICAgXG4gICAgICAgIEByb3RhdGUgKz0gc3RhdGUucmlnaHQueFxuICAgICAgICBAZGVncmVlIC09IHN0YXRlLnJpZ2h0LnlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIHN0YXRlLmxlZnQueCA9PSBzdGF0ZS5sZWZ0LnkgPT0gc3RhdGUucmlnaHQueCA9PSBzdGF0ZS5yaWdodC55ID09IDBcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGZhZGluZyA9IGZhbHNlXG4gICAgICAgICAgICBpZiBAZGlzdCA+IEBtb3ZlRGlzdFxuICAgICAgICAgICAgICAgIEBkaXN0ICAgPSBAbW92ZURpc3RcbiAgICAgICAgICAgICAgICBAY2VudGVyID0gQGdldERpcigpLm11bChAZGlzdCkuYWRkIEBwb3NpdGlvblxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAbW92ZVJlbGF0aXZlIDAuMDMqQG1vdmVTcGVlZCpzdGF0ZS5sZWZ0LngsIDAsIDAuMDMqQG1vdmVTcGVlZCpzdGF0ZS5sZWZ0LnlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQG5hdmlnYXRlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBvblBhZEJ1dHRvbjogKGJ1dHRvbiwgdmFsdWUpID0+XG4gICAgICAgIFxuICAgICAgICBpZiB2YWx1ZVxuICAgICAgICAgICAgc3dpdGNoIGJ1dHRvblxuICAgICAgICAgICAgICAgIHdoZW4gJ0xCJyB0aGVuIEBtb3ZlRG93bigpXG4gICAgICAgICAgICAgICAgd2hlbiAnUkInIHRoZW4gQG1vdmVVcCgpXG4gICAgICAgICAgICAgICAgd2hlbiAnTFQnIHRoZW4gQGZhc3RTcGVlZCA9IHRydWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgc3dpdGNoIGJ1dHRvblxuICAgICAgICAgICAgICAgIHdoZW4gJ0xCJyB0aGVuIEBzdG9wRG93bigpXG4gICAgICAgICAgICAgICAgd2hlbiAnUkInIHRoZW4gQHN0b3BVcCgpXG4gICAgICAgICAgICAgICAgd2hlbiAnTFQnIHRoZW4gQGZhc3RTcGVlZCA9IGZhbHNlXG4gICAgICAgIFxuICAgICMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgb25Nb3VzZURvd246IChldmVudCkgPT4gXG4gICAgICAgIFxuICAgICAgICBiciA9IEBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgXG4gICAgICAgIEBtb3VzZS5tb3ZlZCAgID0gZmFsc2VcbiAgICAgICAgQG1vdXNlLmJ1dHRvbnMgPSBldmVudC5idXR0b25zXG4gICAgICAgIEBtb3VzZS5wb3MgICAgID0gdmVjIGV2ZW50LmNsaWVudFgtYnIubGVmdCwgZXZlbnQuY2xpZW50WS1ici50b3AgXG4gICAgICAgIEBtb3VzZS5kb3duICAgID0gdmVjIEBtb3VzZS5wb3MgXG4gICAgICAgIFxuICAgIG9uTW91c2VVcDogKGV2ZW50KSA9PiBcbiAgICBcbiAgICAgICAgQG1vdXNlLmJ1dHRvbnMgPSAwXG4gICAgICAgIEBtb3VzZS51cCAgICAgID0gdmVjIEBtb3VzZS5wb3NcblxuICAgIG9uTW91c2VEcmFnOiAoZXZlbnQpID0+XG5cbiAgICAgICAgYnIgPSBAY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIFxuICAgICAgICBuZXdQb3MgPSB2ZWMoZXZlbnQuY2xpZW50WC1ici5sZWZ0LCBldmVudC5jbGllbnRZLWJyLnRvcClcbiAgICAgICAgQG1vdXNlLmRlbHRhID0gbmV3UG9zLm1pbnVzIEBtb3VzZS5wb3NcbiAgICAgICAgQG1vdXNlLnBvcyAgID0gbmV3UG9zXG4gICAgICAgIFxuICAgICAgICBpZiBAbW91c2UuZG93bi5kaXN0KEBtb3VzZS5wb3MpID4gNjBcbiAgICAgICAgICAgIEBtb3VzZS5tb3ZlZCA9IHRydWVcbiAgICAgICAgXG4gICAgICAgIGlmIGV2ZW50LmJ1dHRvbnMgJiA0XG4gICAgICAgICAgICBzID0gQG1vdmVTcGVlZCAqIDRcbiAgICAgICAgICAgIEBwYW4gQG1vdXNlLmRlbHRhLngqMipzL0BzaXplLngsIEBtb3VzZS5kZWx0YS55KnMvQHNpemUueVxuICAgICAgICAgICAgXG4gICAgICAgIGlmIGV2ZW50LmJ1dHRvbnMgJiAyXG4gICAgICAgICAgICBzID0gQGRpc3QgPT0gQG1vdmVEaXN0IGFuZCA1MDAgb3IgMjAwMFxuICAgICAgICAgICAgQHBpdm90IHMqQG1vdXNlLmRlbHRhLngvQHNpemUueCwgcypAbW91c2UuZGVsdGEueS9Ac2l6ZS55ICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgICAgMCAgICAgICAwMDAwMDAwICAgICAgMDAwICAgICBcbiAgICBcbiAgICBwaXZvdDogKHgseSkgLT5cbiAgICAgICAgXG4gICAgICAgIEByb3RhdGUgKz0gMC4xKnhcbiAgICAgICAgQGRlZ3JlZSArPSAwLjEqeVxuICAgICAgICAgICAgICAgICBcbiAgICAgICAgQG5hdmlnYXRlKClcbiAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwICAwMDAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHBhbjogKHgseSkgLT5cbiAgICAgICAgXG4gICAgICAgIHJpZ2h0ID0gdmVjIC14LCAwLCAwIFxuICAgICAgICByaWdodC5hcHBseVF1YXRlcm5pb24gQHJvdGF0aW9uUXVhdGVybmlvblxuXG4gICAgICAgIHVwID0gdmVjIDAsIHksIDAgXG4gICAgICAgIHVwLmFwcGx5UXVhdGVybmlvbiBAcm90YXRpb25RdWF0ZXJuaW9uXG4gICAgICAgIFxuICAgICAgICBAY2VudGVyLmFkZCByaWdodC5wbHVzIHVwXG4gICAgICAgIEBjZW50ZXJUYXJnZXQ/LmNvcHkgQGNlbnRlclxuICAgICAgICBcbiAgICAgICAgQG5hdmlnYXRlKClcbiAgICAgICAgICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgICAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICAgICAgICAgICAgICAgICAgXG4gICAgZmFkZVRvUG9zOiAodikgLT4gXG4gICAgICAgIEBjZW50ZXJUYXJnZXQgPSB2ZWMgdlxuICAgICAgICBcbiAgICAgICAgaWYgQGRpc3QgPD0gQG1vdmVEaXN0XG4gICAgICAgICAgICBAZGlzdCA9IEBjZW50ZXJUYXJnZXQuZGlzdCBAcG9zaXRpb25cbiAgICAgICAgICAgIEBjZW50ZXIgPSBAZ2V0RGlyKCkubXVsKEBkaXN0KS5hZGQgQHBvc2l0aW9uXG5cbiAgICAgICAgQHN0YXJ0RmFkZUNlbnRlcigpXG5cbiAgICBzdGFydEZhZGVDZW50ZXI6IC0+IFxuICAgICAgICBcbiAgICAgICAgaWYgbm90IEBmYWRpbmdcbiAgICAgICAgICAgIGFuaW1hdGUgQGZhZGVDZW50ZXJcbiAgICAgICAgICAgIEBmYWRpbmcgPSB0cnVlXG4gICAgICAgICAgICBcbiAgICBmYWRlQ2VudGVyOiAoZGVsdGFTZWNvbmRzKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAZmFkaW5nXG4gICAgICAgIEBjZW50ZXIuZmFkZSBAY2VudGVyVGFyZ2V0LCBkZWx0YVNlY29uZHNcbiAgICAgICAgQG5hdmlnYXRlKClcbiAgICAgICAgaWYgQGNlbnRlci5kaXN0KEBjZW50ZXJUYXJnZXQpID4gMC4wNVxuICAgICAgICAgICAgYW5pbWF0ZSBAZmFkZUNlbnRlclxuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBkZWxldGUgQGZhZGluZ1xuXG4gICAgIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgICAgIDAgICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgbW92ZUZvcndhcmQ6ICAodj0xKSAgLT4gQHN0YXJ0TW92ZSBAbW92ZVogPSB2XG4gICAgbW92ZVJpZ2h0OiAgICAodj0xKSAgLT4gQHN0YXJ0TW92ZSBAbW92ZVggPSB2XG4gICAgbW92ZVVwOiAgICAgICAodj0xKSAgLT4gQHN0YXJ0TW92ZSBAbW92ZVkgPSB2XG4gICAgbW92ZUxlZnQ6ICAgICAodj0tMSkgLT4gQHN0YXJ0TW92ZSBAbW92ZVggPSB2XG4gICAgbW92ZURvd246ICAgICAodj0tMSkgLT4gQHN0YXJ0TW92ZSBAbW92ZVkgPSB2XG4gICAgbW92ZUJhY2t3YXJkOiAodj0tMSkgLT4gQHN0YXJ0TW92ZSBAbW92ZVogPSB2ICAgICAgICAgIFxuXG4gICAgc3RvcFJpZ2h0OiAgICAtPiBAbW92ZVggPSBjbGFtcCAtMSAwIEBtb3ZlWFxuICAgIHN0b3BMZWZ0OiAgICAgLT4gQG1vdmVYID0gY2xhbXAgIDAgMSBAbW92ZVhcbiAgICBzdG9wVXA6ICAgICAgIC0+IEBtb3ZlWSA9IGNsYW1wIC0xIDAgQG1vdmVZXG4gICAgc3RvcERvd246ICAgICAtPiBAbW92ZVkgPSBjbGFtcCAgMCAxIEBtb3ZlWVxuICAgIHN0b3BGb3J3YXJkOiAgLT4gQG1vdmVaID0gY2xhbXAgLTEgMCBAbW92ZVpcbiAgICBzdG9wQmFja3dhcmQ6IC0+IEBtb3ZlWiA9IGNsYW1wICAwIDEgQG1vdmVaXG4gICAgICAgIFxuICAgIHN0b3BNb3Zpbmc6IC0+XG4gICAgICAgIFxuICAgICAgICBAZmFkaW5nID0gZmFsc2VcbiAgICAgICAgQG1vdmluZyA9IGZhbHNlXG4gICAgICAgIEBtb3ZlWCA9IDBcbiAgICAgICAgQG1vdmVZID0gMFxuICAgICAgICBAbW92ZVogPSAwXG4gICAgICAgXG4gICAgc3RhcnRNb3ZlOiAtPiBcbiAgICAgICAgXG4gICAgICAgIEBmYWRpbmcgPSBmYWxzZVxuICAgICAgICBpZiBub3QgQG1vdmluZ1xuICAgICAgICAgICAgQGRpc3QgICA9IEBtb3ZlRGlzdFxuICAgICAgICAgICAgQGNlbnRlciA9IEBnZXREaXIoKS5tdWwoQGRpc3QpLnBsdXMgQHBvc2l0aW9uXG4gICAgICAgICAgICBhbmltYXRlIEBtb3ZlQ2VudGVyXG4gICAgICAgICAgICBAbW92aW5nID0gdHJ1ZVxuICAgICAgICAgICAgXG4gICAgbW92ZUNlbnRlcjogKGRlbHRhU2Vjb25kcykgPT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBpZiBub3QgQG1vdmluZ1xuICAgICAgICBcbiAgICAgICAgQG1vdmVSZWxhdGl2ZShkZWx0YVNlY29uZHMgKiAgICAgKEBtb3ZlU3BlZWQqQG1vdmVYIG9yIEBtb3ZlRmFkZS54KVxuICAgICAgICAgICAgICAgICAgICAgIGRlbHRhU2Vjb25kcyAqICAgICAoQG1vdmVTcGVlZCpAbW92ZVkgb3IgQG1vdmVGYWRlLnkpXG4gICAgICAgICAgICAgICAgICAgICAgZGVsdGFTZWNvbmRzICogMiAqIChAbW92ZVNwZWVkKkBtb3ZlWiBvciBAbW92ZUZhZGUueikpXG4gICAgICAgIFxuICAgICAgICBAbmF2aWdhdGUoKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAbW92ZUZhZGUueCA9IEBtb3ZlU3BlZWQqQG1vdmVYIG9yIHJlZHVjZSBAbW92ZUZhZGUueCwgQG1vdmVTcGVlZCpkZWx0YVNlY29uZHNcbiAgICAgICAgQG1vdmVGYWRlLnkgPSBAbW92ZVNwZWVkKkBtb3ZlWSBvciByZWR1Y2UgQG1vdmVGYWRlLnksIEBtb3ZlU3BlZWQqZGVsdGFTZWNvbmRzXG4gICAgICAgIEBtb3ZlRmFkZS56ID0gQG1vdmVTcGVlZCpAbW92ZVogb3IgcmVkdWNlIEBtb3ZlRmFkZS56LCBAbW92ZVNwZWVkKmRlbHRhU2Vjb25kc1xuICAgICAgICBcbiAgICAgICAgaWYgQG1vdmVGYWRlLmxlbmd0aCgpID4gMC4wMDFcbiAgICAgICAgICAgIGFuaW1hdGUgQG1vdmVDZW50ZXJcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHN0b3BNb3ZpbmcoKVxuICAgICAgICBcbiAgICBtb3ZlUmVsYXRpdmU6ICh4LCB5LCB6KSAtPlxuICAgICAgICBcbiAgICAgICAgdiA9IHZlYyB4LCB5LCB6XG4gICAgICAgIHYuc2NhbGUgQHNwZWVkRmFjdG9yXG4gICAgICAgIHYuYXBwbHlRdWF0ZXJuaW9uIEByb3RhdGlvblF1YXRlcm5pb25cbiAgICAgICAgXG4gICAgICAgIEBjZW50ZXIuYWRkIHZcbiAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAwMDAwICBcbiAgICBcbiAgICBvbk1vdXNlV2hlZWw6IChldmVudCkgPT4gXG4gICAgICAgICAgICBcbiAgICAgICAgaWYgQHdoZWVsSW5lcnQgPiAwIGFuZCBldmVudC53aGVlbERlbHRhIDwgMFxuICAgICAgICAgICAgQHdoZWVsSW5lcnQgPSAwXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIFxuICAgICAgICBpZiBAd2hlZWxJbmVydCA8IDAgYW5kIGV2ZW50LndoZWVsRGVsdGEgPiAwXG4gICAgICAgICAgICBAd2hlZWxJbmVydCA9IDBcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIEB3aGVlbEluZXJ0ICs9IGV2ZW50LndoZWVsRGVsdGEgKiAoMSsoQGRpc3QvQG1heERpc3QpKjMpICogMC4wMDAxXG4gICAgICAgIFxuICAgICAgICBAc3RhcnRab29tKClcblxuICAgICMgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwICAgICAwMCAgXG4gICAgIyAgICAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjICAgMDAwICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDAgIFxuICAgICMgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcblxuICAgIHN0YXJ0Wm9vbUluOiAtPlxuICAgICAgICBcbiAgICAgICAgQHdoZWVsSW5lcnQgPSAoMSsoQGRpc3QvQG1heERpc3QpKjMpKjEwXG4gICAgICAgIEBzdGFydFpvb20oKVxuICAgICAgICBcbiAgICBzdGFydFpvb21PdXQ6IC0+XG4gICAgICAgIFxuICAgICAgICBAd2hlZWxJbmVydCA9IC0oMSsoQGRpc3QvQG1heERpc3QpKjMpKjEwXG4gICAgICAgIEBzdGFydFpvb20oKVxuICAgIFxuICAgIHN0YXJ0Wm9vbTogLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBub3QgQHpvb21pbmdcbiAgICAgICAgICAgIGFuaW1hdGUgQGluZXJ0Wm9vbVxuICAgICAgICAgICAgQHpvb21pbmcgPSB0cnVlXG4gICAgICAgICAgICBcbiAgICBzdG9wWm9vbTogLT4gXG4gICAgICAgIFxuICAgICAgICBAd2hlZWxJbmVydCA9IDBcbiAgICAgICAgQHpvb21pbmcgPSBmYWxzZVxuICAgIFxuICAgIGluZXJ0Wm9vbTogKGRlbHRhU2Vjb25kcykgPT5cblxuICAgICAgICBAc2V0RGlzdCAxIC0gY2xhbXAgLTAuMDIgMC4wMiBAd2hlZWxJbmVydFxuICAgICAgICBAd2hlZWxJbmVydCA9IHJlZHVjZSBAd2hlZWxJbmVydCwgZGVsdGFTZWNvbmRzKjAuMlxuICAgICAgICBpZiBNYXRoLmFicyhAd2hlZWxJbmVydCkgPiAwLjAwMVxuICAgICAgICAgICAgaWYgQHdoZWVsSW5lcnQgPiAwIGFuZCBAZGlzdCA+IEBtaW5EaXN0IG9yIEB3aGVlbEluZXJ0IDwgMCBhbmQgQGRpc3QgPCBAbWF4RGlzdFxuICAgICAgICAgICAgICAgIGFuaW1hdGUgQGluZXJ0Wm9vbVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXG5cbiAgICAgICAgZGVsZXRlIEB6b29taW5nXG4gICAgICAgIEB3aGVlbEluZXJ0ID0gMFxuICAgIFxuICAgIHNldERpc3Q6IChmYWN0b3IpID0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBkaXN0ID0gY2xhbXAgQG1pbkRpc3QsIEBtYXhEaXN0LCBAZGlzdCpmYWN0b3JcbiAgICAgICAgQG5hdmlnYXRlKClcbiAgICAgICAgXG4gICAgc2V0Rm92OiAoZm92KSAtPiBAZm92ID0gTWF0aC5tYXggMi4wIE1hdGgubWluIGZvdiwgMTc1LjBcbiAgICBcbiAgICBzY2FsZURvd246IC0+XG4gICAgICAgIFxuICAgICAgICBAY2VudGVyLnNjYWxlIDAuMDFcbiAgICAgICAgQHBvc2l0aW9uLnNjYWxlSW5QbGFjZSAwLjAxXG4gICAgICAgIEBkaXN0ICo9IDAuMDFcbiAgICAgICAgQG5hdmlnYXRlKClcblxuICAgIHNjYWxlVXA6IChvZmZzZXQpIC0+XG4gICAgICAgIFxuICAgICAgICBAY2VudGVyLnN1YiBvZmZzZXRcbiAgICAgICAgQHBvc2l0aW9uLnN1YiBvZmZzZXRcbiAgICAgICAgXG4gICAgICAgIEBjZW50ZXIuc2NhbGUgMTAwXG4gICAgICAgIEBwb3NpdGlvbi5zY2FsZUluUGxhY2UgMTAwXG4gICAgICAgIEBkaXN0ICo9IDEwMFxuICAgICAgICBAbmF2aWdhdGUoKVxuICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgIDAwMCAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgMDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAwICAgICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgbmF2aWdhdGU6IC0+IFxuICAgICAgICBcbiAgICAgICAgQGRlZ3JlZSA9IGNsYW1wIDEgMTc5IEBkZWdyZWVcbiAgICAgICAgXG4gICAgICAgIHlhdyAgID0gZGVnMnJhZCBAcm90YXRlXG4gICAgICAgIHBpdGNoID0gZGVnMnJhZCBAZGVncmVlXG4gICAgICAgIFxuICAgICAgICBAcm90YXRpb25RdWF0ZXJuaW9uLmNvcHlGcm9tIFF1YXRlcm5pb24uUm90YXRpb25ZYXdQaXRjaFJvbGwgeWF3LCBwaXRjaCwgMFxuICAgICAgICB2ID0gbmV3IFZlY3RvcjMgMCAwIC1AZGlzdFxuICAgICAgICB2LnJvdGF0ZUJ5UXVhdGVybmlvbkFyb3VuZFBvaW50VG9SZWYgQHJvdGF0aW9uUXVhdGVybmlvbiwgVmVjdG9yMy5aZXJvUmVhZE9ubHksIHZcbiAgICAgICAgQHBvc2l0aW9uLmNvcHlGcm9tIEBjZW50ZXIucGx1cyB2XG4gICAgICAgIEBzZXRUYXJnZXQgbmV3IFZlY3RvcjMgQGNlbnRlci54LCBAY2VudGVyLnksIEBjZW50ZXIuelxuICAgICAgICBcbiAgICAgICAgaW5mbyA9IFxuICAgICAgICAgICAgcm90YXRlOiBAcm90YXRlIFxuICAgICAgICAgICAgZGVncmVlOiBAZGVncmVlIFxuICAgICAgICAgICAgZGlzdDogICBAZGlzdFxuICAgICAgICAgICAgcG9zOiAgICB7eDpAcG9zaXRpb24ueCwgeTpAcG9zaXRpb24ueSwgejpAcG9zaXRpb24uen1cbiAgICAgICAgICAgIGNlbnRlcjoge3g6QGNlbnRlci54LCB5OkBjZW50ZXIueSwgejpAY2VudGVyLnp9XG5cbiAgICAgICAgcHJlZnMuc2V0ICdjYW1lcmEnIGluZm9cbiAgICAgICAgXG4gICAgICAgIGlmIDEyKkBtaW5EaXN0L0BkaXN0ID49IDhcbiAgICAgICAgICAgIEBzY2VuZS5zdHlsZS5mb250U2l6ZSA9IDEyKkBtaW5EaXN0L0BkaXN0XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzY2VuZS5zdHlsZS5mb250U2l6ZSA9IDBcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IENhbWVyYVxuIl19
//# sourceURL=../coffee/camera.coffee