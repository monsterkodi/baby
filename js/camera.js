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
            dist: 12,
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
        this.minDist = 1;
        this.maxDist = 20;
        this.moveDist = 0.1;
        this.wheelInert = 0;
        this.moveX = 0;
        this.moveY = 0;
        this.moveZ = 0;
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
        this.degree = 90;
        this.rotate = 0;
        this.dist = 12;
        return this.navigate();
    };

    Camera.prototype.del = function() {
        return this.view.removeEventListener('mousewheel', this.onMouseWheel);
    };

    Camera.prototype.render = function() {
        var state;
        if (this.world.space != null) {
            this.speedFactor = this.world.space.distFactor * 10000;
        } else {
            this.speedFactor = 1;
        }
        if (this.fastSpeed) {
            this.speedFactor *= 4;
        }
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
            speed = 0.02;
            this.moveRelative(speed * state.left.x, 0, speed * state.left.y);
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
        return this.mouse.down = this.mouse.pos;
    };

    Camera.prototype.onMouseUp = function(event) {
        this.mouse.buttons = 0;
        return this.mouse.up = this.mouse.pos;
    };

    Camera.prototype.onMouseDrag = function(event) {
        var br, ref2, s;
        br = this.canvas.getBoundingClientRect();
        this.mouse.delta = vec(event.clientX, event.clientY).minus(this.mouse.pos);
        this.mouse.pos = vec(event.clientX - br.left, event.clientY - br.top);
        if (((ref2 = this.downPos) != null ? ref2.dist(vec(this.mouseX, this.mouseY)) : void 0) > 60) {
            this.mouseMoved = true;
        }
        if (event.buttons & 4) {
            s = this.speedFactor * 4;
            this.pan(this.mouse.delta.x * 2 * s / this.size.x, this.mouse.delta.y * s / this.size.y);
        }
        if (event.buttons & 3) {
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
        this.moveRelative(deltaSeconds * (this.moveX || this.moveFade.x), deltaSeconds * (this.moveY || this.moveFade.y), deltaSeconds * 2 * (this.moveZ || this.moveFade.z));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FtZXJhLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwySUFBQTtJQUFBOzs7O0FBUUEsTUFBNkMsT0FBQSxDQUFRLEtBQVIsQ0FBN0MsRUFBRSxpQkFBRixFQUFTLHFCQUFULEVBQWtCLHFCQUFsQixFQUEyQixpQkFBM0IsRUFBa0M7O0FBQ2xDLE9BQStELE9BQUEsQ0FBUSxXQUFSLENBQS9ELEVBQUUsb0JBQUYsRUFBVSw0QkFBVixFQUFzQiw0QkFBdEIsRUFBa0Msc0NBQWxDLEVBQW1EOztBQUVuRCxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0FBQ1AsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztBQUVQLE9BQUEsR0FBVSxPQUFBLENBQVEsV0FBUjs7QUFFVixHQUFBLEdBQU8sU0FBQyxDQUFELEVBQUcsQ0FBSCxFQUFLLENBQUw7V0FBVyxJQUFJLElBQUosQ0FBUyxDQUFULEVBQVksQ0FBWixFQUFlLENBQWY7QUFBWDs7QUFDUCxJQUFBLEdBQU8sU0FBQyxDQUFELEVBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQO1dBQWEsSUFBSSxJQUFKLENBQVMsQ0FBVCxFQUFZLENBQVosRUFBZSxDQUFmLEVBQWtCLENBQWxCO0FBQWI7O0FBRUQ7OztJQUVDLGdCQUFDLEtBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLFFBQUQ7Ozs7Ozs7Ozs7OztRQUVBLE9BQTJCLElBQUMsQ0FBQSxLQUE1QixFQUFDLElBQUMsQ0FBQSxhQUFBLEtBQUYsRUFBUyxJQUFDLENBQUEsY0FBQSxNQUFWLEVBQWtCLElBQUMsQ0FBQSxZQUFBO1FBRW5CLEtBQUEsR0FBUyxJQUFDLENBQUEsSUFBSSxDQUFDO1FBQ2YsTUFBQSxHQUFTLElBQUMsQ0FBQSxJQUFJLENBQUM7UUFFZixJQUFBLEdBQ0k7WUFBQSxJQUFBLEVBQVEsRUFBUjtZQUNBLE1BQUEsRUFBUSxFQURSO1lBRUEs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ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwICAgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgICAgMDAwMDAwMCBcbjAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAgICAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIyNcblxueyBjbGFtcCwgZGVnMnJhZCwgZ2FtZXBhZCwgcHJlZnMsIHJlZHVjZSB9ID0gcmVxdWlyZSAna3hrJ1xueyBDYW1lcmEsIFBvaW50TGlnaHQsIFF1YXRlcm5pb24sIFVuaXZlcnNhbENhbWVyYSwgVmVjdG9yMyB9ID0gcmVxdWlyZSAnYmFieWxvbmpzJ1xuXG5WZWN0ID0gcmVxdWlyZSAnLi92ZWN0J1xuUXVhdCA9IHJlcXVpcmUgJy4vcXVhdCdcblxuYW5pbWF0ZSA9IHJlcXVpcmUgJy4vYW5pbWF0ZSdcblxudmVjICA9ICh4LHkseikgLT4gbmV3IFZlY3QgeCwgeSwgelxucXVhdCA9ICh4LHkseix3KSAtPiBuZXcgUXVhdCB4LCB5LCB6LCB3XG5cbmNsYXNzIENhbWVyYSBleHRlbmRzIFVuaXZlcnNhbENhbWVyYVxuXG4gICAgQDogKEB3b3JsZCkgLT5cbiAgICAgICAgXG4gICAgICAgIHtAc2NlbmUsIEBjYW52YXMsIEB2aWV3fSA9IEB3b3JsZFxuXG4gICAgICAgIHdpZHRoICA9IEB2aWV3LmNsaWVudFdpZHRoXG4gICAgICAgIGhlaWdodCA9IEB2aWV3LmNsaWVudEhlaWdodFxuICAgICAgICAgICAgIFxuICAgICAgICBpbmZvID0gXG4gICAgICAgICAgICBkaXN0OiAgIDEyXG4gICAgICAgICAgICBkZWdyZWU6IDkwIFxuICAgICAgICAgICAgcm90YXRlOiAwIFxuICAgICAgICAgICAgcG9zOiAgICB7eDowLHk6MCx6OjB9XG4gICAgICAgICAgICBjZW50ZXI6IHt4OjAseTowLHo6MH1cbiAgICAgICAgICAgIFxuICAgICAgICB2YWx1ZXMgPSBwcmVmcy5nZXQgJ2NhbWVyYScgaW5mb1xuICAgICAgICBcbiAgICAgICAgQHNpemUgICAgICAgPSB2ZWMgd2lkdGgsIGhlaWdodFxuICAgICAgICBAbW92ZUZhZGUgICA9IHZlYyAwIDAgMFxuICAgICAgICBAY2VudGVyICAgICA9IHZlYyB2YWx1ZXMuY2VudGVyXG4gICAgICAgIEBkZWdyZWUgICAgID0gdmFsdWVzLmRlZ3JlZVxuICAgICAgICBAcm90YXRlICAgICA9IHZhbHVlcy5yb3RhdGVcbiAgICAgICAgQGRpc3QgICAgICAgPSB2YWx1ZXMuZGlzdFxuICAgICAgICBAbWluRGlzdCAgICA9IDFcbiAgICAgICAgQG1heERpc3QgICAgPSAyMFxuICAgICAgICBAbW92ZURpc3QgICA9IDAuMVxuICAgICAgICBAd2hlZWxJbmVydCA9IDBcbiAgICAgICAgQG1vdmVYICAgICAgPSAwXG4gICAgICAgIEBtb3ZlWSAgICAgID0gMFxuICAgICAgICBAbW92ZVogICAgICA9IDBcbiAgICAgICAgQHF1YXQgICAgICAgPSBxdWF0KClcbiAgICAgICAgXG4gICAgICAgIEBtb3VzZSA9IFxuICAgICAgICAgICAgYnV0dG9uczogMFxuICAgICAgICAgICAgZGVsdGE6IHZlYyAwIDBcbiAgICAgICAgICAgIGRvd246ICB2ZWMgMCAwXG4gICAgICAgICAgICBwb3M6ICAgdmVjIDAgMFxuICAgICAgICAgICAgdXA6ICAgIHZlYyAwIDBcbiAgICAgICAgICAgIFxuICAgICAgICBzdXBlciAnQ2FtZXJhJyBuZXcgVmVjdG9yMygwIDAgMCksIEBzY2VuZVxuXG4gICAgICAgIEBtYXhaICAgICAgID0gMTAwMDAwXG4gICAgICAgIEBtaW5aICAgICAgID0gMVxuICAgICAgICBcbiAgICAgICAgQGZvdiA9IGRlZzJyYWQgNjBcbiAgICAgICAgQHJvdGF0aW9uUXVhdGVybmlvbiA9IG5ldyBRdWF0ZXJuaW9uKClcbiAgICAgICAgQHBvc2l0aW9uLmNvcHlGcm9tIHZhbHVlcy5wb3NcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQGluZXJ0aWEgPSAwLjhcbiAgICAgICAgXG4gICAgICAgIEBsaWdodCA9IG5ldyBQb2ludExpZ2h0ICdzcG90JyBAcG9zaXRpb24sIEBzY2VuZVxuICAgICAgICBAbGlnaHQuaW50ZW5zaXR5ID0gMC41XG4gICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIEBnYW1lcGFkID0gbmV3IGdhbWVwYWQgdHJ1ZVxuICAgICAgICBAZ2FtZXBhZC5vbiAnYnV0dG9uJyBAb25QYWRCdXR0b25cbiAgICAgICAgXG4gICAgICAgIEB2aWV3LmFkZEV2ZW50TGlzdGVuZXIgJ21vdXNld2hlZWwnIEBvbk1vdXNlV2hlZWxcbiAgICAgICAgQG5hdmlnYXRlKClcblxuICAgIGdldERpcjogICAtPiBxdWF0KEByb3RhdGlvblF1YXRlcm5pb24pLnJvdGF0ZWQgVmVjdC51bml0WlxuICAgIGdldFVwOiAgICAtPiBxdWF0KEByb3RhdGlvblF1YXRlcm5pb24pLnJvdGF0ZWQgVmVjdC51bml0WVxuICAgIGdldFJpZ2h0OiAtPiBxdWF0KEByb3RhdGlvblF1YXRlcm5pb24pLnJvdGF0ZWQgVmVjdC51bml0WFxuXG4gICAgc2V0Q2VudGVyOiAocCkgLT5cblxuICAgICAgICBAY2VudGVyID0gdmVjIHBcbiAgICAgICAgQG5hdmlnYXRlKClcbiAgICBcbiAgICByZXNldDogLT5cbiAgICAgICAgQGNlbnRlciA9IHZlYygpXG4gICAgICAgIEBkZWdyZWUgPSA5MFxuICAgICAgICBAcm90YXRlID0gMFxuICAgICAgICBAZGlzdCAgID0gMTJcbiAgICAgICAgQG5hdmlnYXRlKClcbiAgICAgICAgXG4gICAgZGVsOiA9PlxuICAgICAgICBcbiAgICAgICAgQHZpZXcucmVtb3ZlRXZlbnRMaXN0ZW5lciAnbW91c2V3aGVlbCcgQG9uTW91c2VXaGVlbFxuICAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAwMDAwMCAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgIFxuICAgIHJlbmRlcjogLT5cbiAgICAgICAgXG4gICAgICAgIGlmIEB3b3JsZC5zcGFjZT9cbiAgICAgICAgICAgIEBzcGVlZEZhY3RvciA9IEB3b3JsZC5zcGFjZS5kaXN0RmFjdG9yICogMTAwMDBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgIyBAc3BlZWRGYWN0b3IgPSAxMDAwXG4gICAgICAgICAgICBAc3BlZWRGYWN0b3IgPSAxXG4gICAgICAgIEBzcGVlZEZhY3RvciAqPSA0IGlmIEBmYXN0U3BlZWRcbiAgICAgICAgXG4gICAgICAgIGlmIHN0YXRlID0gQGdhbWVwYWQuZ2V0U3RhdGUoKVxuICAgICAgICAgICAgQG9uUGFkQXhpcyBzdGF0ZVxuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgICAgIFxuICAgIG9uUGFkQXhpczogKHN0YXRlKSA9PiBcbiAgICBcbiAgICAgICAgQHJvdGF0ZSArPSBzdGF0ZS5yaWdodC54XG4gICAgICAgIEBkZWdyZWUgLT0gc3RhdGUucmlnaHQueVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgaWYgc3RhdGUubGVmdC54ID09IHN0YXRlLmxlZnQueSA9PSBzdGF0ZS5yaWdodC54ID09IHN0YXRlLnJpZ2h0LnkgPT0gMFxuICAgICAgICAgICAgdHJ1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAZmFkaW5nID0gZmFsc2VcbiAgICAgICAgICAgIGlmIEBkaXN0ID4gQG1vdmVEaXN0XG4gICAgICAgICAgICAgICAgQGRpc3QgICA9IEBtb3ZlRGlzdFxuICAgICAgICAgICAgICAgIEBjZW50ZXIgPSBAZ2V0RGlyKCkubXVsKEBkaXN0KS5hZGQgQHBvc2l0aW9uXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHNwZWVkID0gMC4wMlxuICAgICAgICAgICAgQG1vdmVSZWxhdGl2ZSBzcGVlZCpzdGF0ZS5sZWZ0LngsIDAsIHNwZWVkKnN0YXRlLmxlZnQueVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBAbmF2aWdhdGUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIG9uUGFkQnV0dG9uOiAoYnV0dG9uLCB2YWx1ZSkgPT5cbiAgICAgICAgXG4gICAgICAgIGlmIHZhbHVlXG4gICAgICAgICAgICBzd2l0Y2ggYnV0dG9uXG4gICAgICAgICAgICAgICAgd2hlbiAnTEInIHRoZW4gQG1vdmVEb3duKClcbiAgICAgICAgICAgICAgICB3aGVuICdSQicgdGhlbiBAbW92ZVVwKClcbiAgICAgICAgICAgICAgICB3aGVuICdMVCcgdGhlbiBAZmFzdFNwZWVkID0gdHJ1ZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBzd2l0Y2ggYnV0dG9uXG4gICAgICAgICAgICAgICAgd2hlbiAnTEInIHRoZW4gQHN0b3BEb3duKClcbiAgICAgICAgICAgICAgICB3aGVuICdSQicgdGhlbiBAc3RvcFVwKClcbiAgICAgICAgICAgICAgICB3aGVuICdMVCcgdGhlbiBAZmFzdFNwZWVkID0gZmFsc2VcbiAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBvbk1vdXNlRG93bjogKGV2ZW50KSA9PiBcbiAgICAgICAgXG4gICAgICAgIGJyID0gQGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBcbiAgICAgICAgQG1vdXNlLm1vdmVkICAgPSBmYWxzZVxuICAgICAgICBAbW91c2UuYnV0dG9ucyA9IGV2ZW50LmJ1dHRvbnNcbiAgICAgICAgQG1vdXNlLnBvcyAgICAgPSB2ZWMgZXZlbnQuY2xpZW50WC1ici5sZWZ0LCBldmVudC5jbGllbnRZLWJyLnRvcCBcbiAgICAgICAgQG1vdXNlLmRvd24gICAgPSBAbW91c2UucG9zIFxuICAgICAgICBcbiAgICBvbk1vdXNlVXA6IChldmVudCkgPT4gXG4gICAgXG4gICAgICAgIEBtb3VzZS5idXR0b25zID0gMFxuICAgICAgICBAbW91c2UudXAgICAgICA9IEBtb3VzZS5wb3NcblxuICAgIG9uTW91c2VEcmFnOiAoZXZlbnQpID0+XG5cbiAgICAgICAgYnIgPSBAY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIFxuICAgICAgICBAbW91c2UuZGVsdGEgPSB2ZWMoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSkubWludXMgQG1vdXNlLnBvc1xuICAgICAgICBAbW91c2UucG9zICAgPSB2ZWMgZXZlbnQuY2xpZW50WC1ici5sZWZ0LCBldmVudC5jbGllbnRZLWJyLnRvcFxuICAgICAgICBcbiAgICAgICAgaWYgQGRvd25Qb3M/LmRpc3QodmVjIEBtb3VzZVgsIEBtb3VzZVkpID4gNjBcbiAgICAgICAgICAgIEBtb3VzZU1vdmVkID0gdHJ1ZVxuICAgICAgICBcbiAgICAgICAgaWYgZXZlbnQuYnV0dG9ucyAmIDRcbiAgICAgICAgICAgIHMgPSBAc3BlZWRGYWN0b3IgKiA0XG4gICAgICAgICAgICBAcGFuIEBtb3VzZS5kZWx0YS54KjIqcy9Ac2l6ZS54LCBAbW91c2UuZGVsdGEueSpzL0BzaXplLnlcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBldmVudC5idXR0b25zICYgM1xuICAgICAgICAgICAgcyA9IEBkaXN0ID09IEBtb3ZlRGlzdCBhbmQgNTAwIG9yIDIwMDBcbiAgICAgICAgICAgIEBwaXZvdCBzKkBtb3VzZS5kZWx0YS54L0BzaXplLngsIHMqQG1vdXNlLmRlbHRhLnkvQHNpemUueSAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgICAgIDAgICAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgcGl2b3Q6ICh4LHkpIC0+XG4gICAgICAgICBcbiAgICAgICAgQHJvdGF0ZSArPSAwLjEqeFxuICAgICAgICBAZGVncmVlICs9IDAuMSp5XG4gICAgICAgICAgICAgICAgIFxuICAgICAgICBAbmF2aWdhdGUoKVxuICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgcGFuOiAoeCx5KSAtPlxuICAgICAgICBcbiAgICAgICAgcmlnaHQgPSB2ZWMgLXgsIDAsIDAgXG4gICAgICAgIHJpZ2h0LmFwcGx5UXVhdGVybmlvbiBAcm90YXRpb25RdWF0ZXJuaW9uXG5cbiAgICAgICAgdXAgPSB2ZWMgMCwgeSwgMCBcbiAgICAgICAgdXAuYXBwbHlRdWF0ZXJuaW9uIEByb3RhdGlvblF1YXRlcm5pb25cbiAgICAgICAgXG4gICAgICAgIEBjZW50ZXIuYWRkIHJpZ2h0LnBsdXMgdXBcbiAgICAgICAgQGNlbnRlclRhcmdldD8uY29weSBAY2VudGVyXG4gICAgICAgIFxuICAgICAgICBAbmF2aWdhdGUoKVxuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgICAgICAgICAgICAgICAgICBcbiAgICBmYWRlVG9Qb3M6ICh2KSAtPiBcbiAgICAgICAgQGNlbnRlclRhcmdldCA9IHZlYyB2XG4gICAgICAgIFxuICAgICAgICBpZiBAZGlzdCA8PSBAbW92ZURpc3RcbiAgICAgICAgICAgIEBkaXN0ID0gQGNlbnRlclRhcmdldC5kaXN0IEBwb3NpdGlvblxuICAgICAgICAgICAgQGNlbnRlciA9IEBnZXREaXIoKS5tdWwoQGRpc3QpLmFkZCBAcG9zaXRpb25cblxuICAgICAgICBAc3RhcnRGYWRlQ2VudGVyKClcblxuICAgIHN0YXJ0RmFkZUNlbnRlcjogLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBub3QgQGZhZGluZ1xuICAgICAgICAgICAgYW5pbWF0ZSBAZmFkZUNlbnRlclxuICAgICAgICAgICAgQGZhZGluZyA9IHRydWVcbiAgICAgICAgICAgIFxuICAgIGZhZGVDZW50ZXI6IChkZWx0YVNlY29uZHMpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IEBmYWRpbmdcbiAgICAgICAgQGNlbnRlci5mYWRlIEBjZW50ZXJUYXJnZXQsIGRlbHRhU2Vjb25kc1xuICAgICAgICBAbmF2aWdhdGUoKVxuICAgICAgICBpZiBAY2VudGVyLmRpc3QoQGNlbnRlclRhcmdldCkgPiAwLjA1XG4gICAgICAgICAgICBhbmltYXRlIEBmYWRlQ2VudGVyXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRlbGV0ZSBAZmFkaW5nXG5cbiAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgMCAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBtb3ZlRm9yd2FyZDogICh2PTEpICAtPiBAc3RhcnRNb3ZlIEBtb3ZlWiA9IHZcbiAgICBtb3ZlUmlnaHQ6ICAgICh2PTEpICAtPiBAc3RhcnRNb3ZlIEBtb3ZlWCA9IHZcbiAgICBtb3ZlVXA6ICAgICAgICh2PTEpICAtPiBAc3RhcnRNb3ZlIEBtb3ZlWSA9IHZcbiAgICBtb3ZlTGVmdDogICAgICh2PS0xKSAtPiBAc3RhcnRNb3ZlIEBtb3ZlWCA9IHZcbiAgICBtb3ZlRG93bjogICAgICh2PS0xKSAtPiBAc3RhcnRNb3ZlIEBtb3ZlWSA9IHZcbiAgICBtb3ZlQmFja3dhcmQ6ICh2PS0xKSAtPiBAc3RhcnRNb3ZlIEBtb3ZlWiA9IHYgICAgICAgICAgXG5cbiAgICBzdG9wUmlnaHQ6ICAgIC0+IEBtb3ZlWCA9IGNsYW1wIC0xIDAgQG1vdmVYXG4gICAgc3RvcExlZnQ6ICAgICAtPiBAbW92ZVggPSBjbGFtcCAgMCAxIEBtb3ZlWFxuICAgIHN0b3BVcDogICAgICAgLT4gQG1vdmVZID0gY2xhbXAgLTEgMCBAbW92ZVlcbiAgICBzdG9wRG93bjogICAgIC0+IEBtb3ZlWSA9IGNsYW1wICAwIDEgQG1vdmVZXG4gICAgc3RvcEZvcndhcmQ6ICAtPiBAbW92ZVogPSBjbGFtcCAtMSAwIEBtb3ZlWlxuICAgIHN0b3BCYWNrd2FyZDogLT4gQG1vdmVaID0gY2xhbXAgIDAgMSBAbW92ZVpcbiAgICAgICAgXG4gICAgc3RvcE1vdmluZzogLT5cbiAgICAgICAgXG4gICAgICAgIEBmYWRpbmcgPSBmYWxzZVxuICAgICAgICBAbW92aW5nID0gZmFsc2VcbiAgICAgICAgQG1vdmVYID0gMFxuICAgICAgICBAbW92ZVkgPSAwXG4gICAgICAgIEBtb3ZlWiA9IDBcbiAgICAgICBcbiAgICBzdGFydE1vdmU6IC0+IFxuICAgICAgICBcbiAgICAgICAgQGZhZGluZyA9IGZhbHNlXG4gICAgICAgIGlmIG5vdCBAbW92aW5nXG4gICAgICAgICAgICBAZGlzdCAgID0gQG1vdmVEaXN0XG4gICAgICAgICAgICBAY2VudGVyID0gQGdldERpcigpLm11bChAZGlzdCkucGx1cyBAcG9zaXRpb25cbiAgICAgICAgICAgIGFuaW1hdGUgQG1vdmVDZW50ZXJcbiAgICAgICAgICAgIEBtb3ZpbmcgPSB0cnVlXG4gICAgICAgICAgICBcbiAgICBtb3ZlQ2VudGVyOiAoZGVsdGFTZWNvbmRzKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAbW92aW5nXG4gICAgICAgIFxuICAgICAgICBAbW92ZVJlbGF0aXZlKGRlbHRhU2Vjb25kcyAqICAgICAoQG1vdmVYIG9yIEBtb3ZlRmFkZS54KVxuICAgICAgICAgICAgICAgICAgICAgIGRlbHRhU2Vjb25kcyAqICAgICAoQG1vdmVZIG9yIEBtb3ZlRmFkZS55KVxuICAgICAgICAgICAgICAgICAgICAgIGRlbHRhU2Vjb25kcyAqIDIgKiAoQG1vdmVaIG9yIEBtb3ZlRmFkZS56KSlcbiAgICAgICAgXG4gICAgICAgIEBuYXZpZ2F0ZSgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBtb3ZlRmFkZS54ID0gQG1vdmVYIG9yIHJlZHVjZSBAbW92ZUZhZGUueCwgZGVsdGFTZWNvbmRzXG4gICAgICAgIEBtb3ZlRmFkZS55ID0gQG1vdmVZIG9yIHJlZHVjZSBAbW92ZUZhZGUueSwgZGVsdGFTZWNvbmRzXG4gICAgICAgIEBtb3ZlRmFkZS56ID0gQG1vdmVaIG9yIHJlZHVjZSBAbW92ZUZhZGUueiwgZGVsdGFTZWNvbmRzXG4gICAgICAgIFxuICAgICAgICBpZiBAbW92ZUZhZGUubGVuZ3RoKCkgPiAwLjAwMVxuICAgICAgICAgICAgYW5pbWF0ZSBAbW92ZUNlbnRlclxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc3RvcE1vdmluZygpXG4gICAgICAgIFxuICAgIG1vdmVSZWxhdGl2ZTogKHgsIHksIHopIC0+XG4gICAgICAgIFxuICAgICAgICB2ID0gdmVjIHgsIHksIHpcbiAgICAgICAgdi5zY2FsZSBAc3BlZWRGYWN0b3JcbiAgICAgICAgdi5hcHBseVF1YXRlcm5pb24gQHJvdGF0aW9uUXVhdGVybmlvblxuICAgICAgICBcbiAgICAgICAgQGNlbnRlci5hZGQgdlxuICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIG9uTW91c2VXaGVlbDogKGV2ZW50KSA9PiBcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBAd2hlZWxJbmVydCA+IDAgYW5kIGV2ZW50LndoZWVsRGVsdGEgPCAwXG4gICAgICAgICAgICBAd2hlZWxJbmVydCA9IDBcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEB3aGVlbEluZXJ0IDwgMCBhbmQgZXZlbnQud2hlZWxEZWx0YSA+IDBcbiAgICAgICAgICAgIEB3aGVlbEluZXJ0ID0gMFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgQHdoZWVsSW5lcnQgKz0gZXZlbnQud2hlZWxEZWx0YSAqICgxKyhAZGlzdC9AbWF4RGlzdCkqMykgKiAwLjAwMDFcbiAgICAgICAgXG4gICAgICAgIEBzdGFydFpvb20oKVxuXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAgICAgIDAwICBcbiAgICAjICAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG4gICAgc3RhcnRab29tSW46IC0+XG4gICAgICAgIFxuICAgICAgICBAd2hlZWxJbmVydCA9ICgxKyhAZGlzdC9AbWF4RGlzdCkqMykqMTBcbiAgICAgICAgQHN0YXJ0Wm9vbSgpXG4gICAgICAgIFxuICAgIHN0YXJ0Wm9vbU91dDogLT5cbiAgICAgICAgXG4gICAgICAgIEB3aGVlbEluZXJ0ID0gLSgxKyhAZGlzdC9AbWF4RGlzdCkqMykqMTBcbiAgICAgICAgQHN0YXJ0Wm9vbSgpXG4gICAgXG4gICAgc3RhcnRab29tOiAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBAem9vbWluZ1xuICAgICAgICAgICAgYW5pbWF0ZSBAaW5lcnRab29tXG4gICAgICAgICAgICBAem9vbWluZyA9IHRydWVcbiAgICAgICAgICAgIFxuICAgIHN0b3Bab29tOiAtPiBcbiAgICAgICAgXG4gICAgICAgIEB3aGVlbEluZXJ0ID0gMFxuICAgICAgICBAem9vbWluZyA9IGZhbHNlXG4gICAgXG4gICAgaW5lcnRab29tOiAoZGVsdGFTZWNvbmRzKSA9PlxuXG4gICAgICAgIEBzZXREaXN0IDEgLSBjbGFtcCAtMC4wMiAwLjAyIEB3aGVlbEluZXJ0XG4gICAgICAgIEB3aGVlbEluZXJ0ID0gcmVkdWNlIEB3aGVlbEluZXJ0LCBkZWx0YVNlY29uZHMqMC4yXG4gICAgICAgIGlmIE1hdGguYWJzKEB3aGVlbEluZXJ0KSA+IDAuMDAxXG4gICAgICAgICAgICBpZiBAd2hlZWxJbmVydCA+IDAgYW5kIEBkaXN0ID4gQG1pbkRpc3Qgb3IgQHdoZWVsSW5lcnQgPCAwIGFuZCBAZGlzdCA8IEBtYXhEaXN0XG4gICAgICAgICAgICAgICAgYW5pbWF0ZSBAaW5lcnRab29tXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcblxuICAgICAgICBkZWxldGUgQHpvb21pbmdcbiAgICAgICAgQHdoZWVsSW5lcnQgPSAwXG4gICAgXG4gICAgc2V0RGlzdDogKGZhY3RvcikgPT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQGRpc3QgPSBjbGFtcCBAbWluRGlzdCwgQG1heERpc3QsIEBkaXN0KmZhY3RvclxuICAgICAgICBAbmF2aWdhdGUoKVxuICAgICAgICBcbiAgICBzZXRGb3Y6IChmb3YpIC0+IEBmb3YgPSBNYXRoLm1heCAyLjAgTWF0aC5taW4gZm92LCAxNzUuMFxuICAgIFxuICAgIHNjYWxlRG93bjogLT5cbiAgICAgICAgXG4gICAgICAgIEBjZW50ZXIuc2NhbGUgMC4wMVxuICAgICAgICBAcG9zaXRpb24uc2NhbGVJblBsYWNlIDAuMDFcbiAgICAgICAgQGRpc3QgKj0gMC4wMVxuICAgICAgICBAbmF2aWdhdGUoKVxuXG4gICAgc2NhbGVVcDogKG9mZnNldCkgLT5cbiAgICAgICAgXG4gICAgICAgIEBjZW50ZXIuc3ViIG9mZnNldFxuICAgICAgICBAcG9zaXRpb24uc3ViIG9mZnNldFxuICAgICAgICBcbiAgICAgICAgQGNlbnRlci5zY2FsZSAxMDBcbiAgICAgICAgQHBvc2l0aW9uLnNjYWxlSW5QbGFjZSAxMDBcbiAgICAgICAgQGRpc3QgKj0gMTAwXG4gICAgICAgIEBuYXZpZ2F0ZSgpXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAgMDAwIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgIDAgICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBuYXZpZ2F0ZTogLT4gXG4gICAgICAgIFxuICAgICAgICBAZGVncmVlID0gY2xhbXAgMSAxNzkgQGRlZ3JlZVxuICAgICAgICBcbiAgICAgICAgeWF3ICAgPSBkZWcycmFkIEByb3RhdGVcbiAgICAgICAgcGl0Y2ggPSBkZWcycmFkIEBkZWdyZWVcbiAgICAgICAgXG4gICAgICAgIEByb3RhdGlvblF1YXRlcm5pb24uY29weUZyb20gUXVhdGVybmlvbi5Sb3RhdGlvbllhd1BpdGNoUm9sbCB5YXcsIHBpdGNoLCAwXG4gICAgICAgIHYgPSBuZXcgVmVjdG9yMyAwIDAgLUBkaXN0XG4gICAgICAgIHYucm90YXRlQnlRdWF0ZXJuaW9uQXJvdW5kUG9pbnRUb1JlZiBAcm90YXRpb25RdWF0ZXJuaW9uLCBWZWN0b3IzLlplcm9SZWFkT25seSwgdlxuICAgICAgICBAcG9zaXRpb24uY29weUZyb20gQGNlbnRlci5wbHVzIHZcbiAgICAgICAgQHNldFRhcmdldCBuZXcgVmVjdG9yMyBAY2VudGVyLngsIEBjZW50ZXIueSwgQGNlbnRlci56XG4gICAgICAgIFxuICAgICAgICBpbmZvID0gXG4gICAgICAgICAgICByb3RhdGU6IEByb3RhdGUgXG4gICAgICAgICAgICBkZWdyZWU6IEBkZWdyZWUgXG4gICAgICAgICAgICBkaXN0OiAgIEBkaXN0XG4gICAgICAgICAgICBwb3M6ICAgIHt4OkBwb3NpdGlvbi54LCB5OkBwb3NpdGlvbi55LCB6OkBwb3NpdGlvbi56fVxuICAgICAgICAgICAgY2VudGVyOiB7eDpAY2VudGVyLngsIHk6QGNlbnRlci55LCB6OkBjZW50ZXIuen1cblxuICAgICAgICBwcmVmcy5zZXQgJ2NhbWVyYScgaW5mb1xuICAgICAgICBcbiAgICAgICAgaWYgMTIqQG1pbkRpc3QvQGRpc3QgPj0gOFxuICAgICAgICAgICAgQHNjZW5lLnN0eWxlLmZvbnRTaXplID0gMTIqQG1pbkRpc3QvQGRpc3RcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNjZW5lLnN0eWxlLmZvbnRTaXplID0gMFxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gQ2FtZXJhXG4iXX0=
//# sourceURL=../coffee/camera.coffee