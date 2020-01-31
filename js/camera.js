// koffee 1.7.0

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
            pos: vec(0, 0)
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
        return this.mouse.buttons = 0;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FtZXJhLmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSwySUFBQTtJQUFBOzs7O0FBUUEsTUFBNkMsT0FBQSxDQUFRLEtBQVIsQ0FBN0MsRUFBRSxpQkFBRixFQUFTLHFCQUFULEVBQWtCLHFCQUFsQixFQUEyQixpQkFBM0IsRUFBa0M7O0FBQ2xDLE9BQStELE9BQUEsQ0FBUSxXQUFSLENBQS9ELEVBQUUsb0JBQUYsRUFBVSw0QkFBVixFQUFzQiw0QkFBdEIsRUFBa0Msc0NBQWxDLEVBQW1EOztBQUVuRCxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0FBQ1AsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztBQUVQLE9BQUEsR0FBVSxPQUFBLENBQVEsV0FBUjs7QUFFVixHQUFBLEdBQU8sU0FBQyxDQUFELEVBQUcsQ0FBSCxFQUFLLENBQUw7V0FBVyxJQUFJLElBQUosQ0FBUyxDQUFULEVBQVksQ0FBWixFQUFlLENBQWY7QUFBWDs7QUFDUCxJQUFBLEdBQU8sU0FBQyxDQUFELEVBQUcsQ0FBSCxFQUFLLENBQUwsRUFBTyxDQUFQO1dBQWEsSUFBSSxJQUFKLENBQVMsQ0FBVCxFQUFZLENBQVosRUFBZSxDQUFmLEVBQWtCLENBQWxCO0FBQWI7O0FBRUQ7OztJQUVDLGdCQUFDLEtBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLFFBQUQ7Ozs7Ozs7Ozs7OztRQUVBLE9BQTJCLElBQUMsQ0FBQSxLQUE1QixFQUFDLElBQUMsQ0FBQSxhQUFBLEtBQUYsRUFBUyxJQUFDLENBQUEsY0FBQSxNQUFWLEVBQWtCLElBQUMsQ0FBQSxZQUFBO1FBRW5CLEtBQUEsR0FBUyxJQUFDLENBQUEsSUFBSSxDQUFDO1FBQ2YsTUFBQSxHQUFTLElBQUMsQ0FBQSxJQUFJLENBQUM7UUFFZixJQUFBLEdBQ0k7WUFBQSxJQUFBLEVBQVEsRUFBUjtZQUNBLE1BQUEsRUFBUSxFQURSO1lBRUEs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Q0FBcEIsRUFBdUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxDQUEvQixFQUFrQyxJQUFDLENBQUEsTUFBTSxDQUFDLENBQTFDLENBQVg7UUFFQSxJQUFBLEdBQ0k7WUFBQSxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BQVQ7WUFDQSxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BRFQ7WUFFQSxJQUFBLEVBQVEsSUFBQyxDQUFBLElBRlQ7WUFHQSxHQUFBLEVBQVE7Z0JBQUMsQ0FBQSxFQUFFLElBQUMsQ0FBQSxRQUFRLENBQUMsQ0FBYjtnQkFBZ0IsQ0FBQSxFQUFFLElBQUMsQ0FBQSxRQUFRLENBQUMsQ0FBNUI7Z0JBQStCLENBQUEsRUFBRSxJQUFDLENBQUEsUUFBUSxDQUFDLENBQTNDO2FBSFI7WUFJQSxNQUFBLEVBQVE7Z0JBQUMsQ0FBQSxFQUFFLElBQUMsQ0FBQSxNQUFNLENBQUMsQ0FBWDtnQkFBYyxDQUFBLEVBQUUsSUFBQyxDQUFBLE1BQU0sQ0FBQyxDQUF4QjtnQkFBMkIsQ0FBQSxFQUFFLElBQUMsQ0FBQSxNQUFNLENBQUMsQ0FBckM7YUFKUjs7UUFNSixLQUFLLENBQUMsR0FBTixDQUFVLFFBQVYsRUFBbUIsSUFBbkI7UUFFQSxJQUFHLEVBQUEsR0FBRyxJQUFDLENBQUEsT0FBSixHQUFZLElBQUMsQ0FBQSxJQUFiLElBQXFCLENBQXhCO21CQUNJLElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQWIsR0FBd0IsRUFBQSxHQUFHLElBQUMsQ0FBQSxPQUFKLEdBQVksSUFBQyxDQUFBLEtBRHpDO1NBQUEsTUFBQTttQkFHSSxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFiLEdBQXdCLEVBSDVCOztJQXRCTTs7OztHQXBZTzs7QUErWnJCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAgICAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAwMDAwMCAgICAwMDAwMDAwIFxuMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbjAwMCAgICAgICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMDAwXG4wMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IGNsYW1wLCBkZWcycmFkLCBnYW1lcGFkLCBwcmVmcywgcmVkdWNlIH0gPSByZXF1aXJlICdreGsnXG57IENhbWVyYSwgUG9pbnRMaWdodCwgUXVhdGVybmlvbiwgVW5pdmVyc2FsQ2FtZXJhLCBWZWN0b3IzIH0gPSByZXF1aXJlICdiYWJ5bG9uanMnXG5cblZlY3QgPSByZXF1aXJlICcuL3ZlY3QnXG5RdWF0ID0gcmVxdWlyZSAnLi9xdWF0J1xuXG5hbmltYXRlID0gcmVxdWlyZSAnLi9hbmltYXRlJ1xuXG52ZWMgID0gKHgseSx6KSAtPiBuZXcgVmVjdCB4LCB5LCB6XG5xdWF0ID0gKHgseSx6LHcpIC0+IG5ldyBRdWF0IHgsIHksIHosIHdcblxuY2xhc3MgQ2FtZXJhIGV4dGVuZHMgVW5pdmVyc2FsQ2FtZXJhXG5cbiAgICBAOiAoQHdvcmxkKSAtPlxuICAgICAgICBcbiAgICAgICAge0BzY2VuZSwgQGNhbnZhcywgQHZpZXd9ID0gQHdvcmxkXG5cbiAgICAgICAgd2lkdGggID0gQHZpZXcuY2xpZW50V2lkdGhcbiAgICAgICAgaGVpZ2h0ID0gQHZpZXcuY2xpZW50SGVpZ2h0XG4gICAgICAgICAgICAgXG4gICAgICAgIGluZm8gPSBcbiAgICAgICAgICAgIGRpc3Q6ICAgMTJcbiAgICAgICAgICAgIGRlZ3JlZTogOTAgXG4gICAgICAgICAgICByb3RhdGU6IDAgXG4gICAgICAgICAgICBwb3M6ICAgIHt4OjAseTowLHo6MH1cbiAgICAgICAgICAgIGNlbnRlcjoge3g6MCx5OjAsejowfVxuICAgICAgICAgICAgXG4gICAgICAgIHZhbHVlcyA9IHByZWZzLmdldCAnY2FtZXJhJyBpbmZvXG4gICAgICAgIFxuICAgICAgICBAc2l6ZSAgICAgICA9IHZlYyB3aWR0aCwgaGVpZ2h0XG4gICAgICAgIEBtb3ZlRmFkZSAgID0gdmVjIDAgMCAwXG4gICAgICAgIEBjZW50ZXIgICAgID0gdmVjIHZhbHVlcy5jZW50ZXJcbiAgICAgICAgQGRlZ3JlZSAgICAgPSB2YWx1ZXMuZGVncmVlXG4gICAgICAgIEByb3RhdGUgICAgID0gdmFsdWVzLnJvdGF0ZVxuICAgICAgICBAZGlzdCAgICAgICA9IHZhbHVlcy5kaXN0XG4gICAgICAgIEBtaW5EaXN0ICAgID0gMVxuICAgICAgICBAbWF4RGlzdCAgICA9IDIwXG4gICAgICAgIEBtb3ZlRGlzdCAgID0gMC4xXG4gICAgICAgIEB3aGVlbEluZXJ0ID0gMFxuICAgICAgICBAbW92ZVggICAgICA9IDBcbiAgICAgICAgQG1vdmVZICAgICAgPSAwXG4gICAgICAgIEBtb3ZlWiAgICAgID0gMFxuICAgICAgICBAcXVhdCAgICAgICA9IHF1YXQoKVxuICAgICAgICBcbiAgICAgICAgQG1vdXNlID0gXG4gICAgICAgICAgICBidXR0b25zOiAwXG4gICAgICAgICAgICBkZWx0YTogdmVjIDAgMFxuICAgICAgICAgICAgZG93bjogIHZlYyAwIDBcbiAgICAgICAgICAgIHBvczogICB2ZWMgMCAwXG4gICAgICAgICAgICBcbiAgICAgICAgc3VwZXIgJ0NhbWVyYScgbmV3IFZlY3RvcjMoMCAwIDApLCBAc2NlbmVcblxuICAgICAgICBAbWF4WiAgICAgICA9IDEwMDAwMFxuICAgICAgICBAbWluWiAgICAgICA9IDFcbiAgICAgICAgXG4gICAgICAgIEBmb3YgPSBkZWcycmFkIDYwXG4gICAgICAgIEByb3RhdGlvblF1YXRlcm5pb24gPSBuZXcgUXVhdGVybmlvbigpXG4gICAgICAgIEBwb3NpdGlvbi5jb3B5RnJvbSB2YWx1ZXMucG9zXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBpbmVydGlhID0gMC44XG4gICAgICAgIFxuICAgICAgICBAbGlnaHQgPSBuZXcgUG9pbnRMaWdodCAnc3BvdCcgQHBvc2l0aW9uLCBAc2NlbmVcbiAgICAgICAgQGxpZ2h0LmludGVuc2l0eSA9IDAuNVxuICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBAZ2FtZXBhZCA9IG5ldyBnYW1lcGFkIHRydWVcbiAgICAgICAgQGdhbWVwYWQub24gJ2J1dHRvbicgQG9uUGFkQnV0dG9uXG4gICAgICAgIFxuICAgICAgICBAdmlldy5hZGRFdmVudExpc3RlbmVyICdtb3VzZXdoZWVsJyBAb25Nb3VzZVdoZWVsXG4gICAgICAgIEBuYXZpZ2F0ZSgpXG5cbiAgICBnZXREaXI6ICAgLT4gcXVhdChAcm90YXRpb25RdWF0ZXJuaW9uKS5yb3RhdGVkIFZlY3QudW5pdFpcbiAgICBnZXRVcDogICAgLT4gcXVhdChAcm90YXRpb25RdWF0ZXJuaW9uKS5yb3RhdGVkIFZlY3QudW5pdFlcbiAgICBnZXRSaWdodDogLT4gcXVhdChAcm90YXRpb25RdWF0ZXJuaW9uKS5yb3RhdGVkIFZlY3QudW5pdFhcblxuICAgIHNldENlbnRlcjogKHApIC0+XG5cbiAgICAgICAgQGNlbnRlciA9IHZlYyBwXG4gICAgICAgIEBuYXZpZ2F0ZSgpXG4gICAgXG4gICAgcmVzZXQ6IC0+XG4gICAgICAgIEBjZW50ZXIgPSB2ZWMoKVxuICAgICAgICBAZGVncmVlID0gOTBcbiAgICAgICAgQHJvdGF0ZSA9IDBcbiAgICAgICAgQGRpc3QgICA9IDEyXG4gICAgICAgIEBuYXZpZ2F0ZSgpXG4gICAgICAgIFxuICAgIGRlbDogPT5cbiAgICAgICAgXG4gICAgICAgIEB2aWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIgJ21vdXNld2hlZWwnIEBvbk1vdXNlV2hlZWxcbiAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICBcbiAgICByZW5kZXI6IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBAd29ybGQuc3BhY2U/XG4gICAgICAgICAgICBAc3BlZWRGYWN0b3IgPSBAd29ybGQuc3BhY2UuZGlzdEZhY3RvciAqIDEwMDAwXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgICMgQHNwZWVkRmFjdG9yID0gMTAwMFxuICAgICAgICAgICAgQHNwZWVkRmFjdG9yID0gMVxuICAgICAgICBAc3BlZWRGYWN0b3IgKj0gNCBpZiBAZmFzdFNwZWVkXG4gICAgICAgIFxuICAgICAgICBpZiBzdGF0ZSA9IEBnYW1lcGFkLmdldFN0YXRlKClcbiAgICAgICAgICAgIEBvblBhZEF4aXMgc3RhdGVcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICAgICBcbiAgICBvblBhZEF4aXM6IChzdGF0ZSkgPT4gXG4gICAgXG4gICAgICAgIEByb3RhdGUgKz0gc3RhdGUucmlnaHQueFxuICAgICAgICBAZGVncmVlIC09IHN0YXRlLnJpZ2h0LnlcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIHN0YXRlLmxlZnQueCA9PSBzdGF0ZS5sZWZ0LnkgPT0gc3RhdGUucmlnaHQueCA9PSBzdGF0ZS5yaWdodC55ID09IDBcbiAgICAgICAgICAgIHRydWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQGZhZGluZyA9IGZhbHNlXG4gICAgICAgICAgICBpZiBAZGlzdCA+IEBtb3ZlRGlzdFxuICAgICAgICAgICAgICAgIEBkaXN0ICAgPSBAbW92ZURpc3RcbiAgICAgICAgICAgICAgICBAY2VudGVyID0gQGdldERpcigpLm11bChAZGlzdCkuYWRkIEBwb3NpdGlvblxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzcGVlZCA9IDAuMDJcbiAgICAgICAgICAgIEBtb3ZlUmVsYXRpdmUgc3BlZWQqc3RhdGUubGVmdC54LCAwLCBzcGVlZCpzdGF0ZS5sZWZ0LnlcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQG5hdmlnYXRlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBvblBhZEJ1dHRvbjogKGJ1dHRvbiwgdmFsdWUpID0+XG4gICAgICAgIFxuICAgICAgICBpZiB2YWx1ZVxuICAgICAgICAgICAgc3dpdGNoIGJ1dHRvblxuICAgICAgICAgICAgICAgIHdoZW4gJ0xCJyB0aGVuIEBtb3ZlRG93bigpXG4gICAgICAgICAgICAgICAgd2hlbiAnUkInIHRoZW4gQG1vdmVVcCgpXG4gICAgICAgICAgICAgICAgd2hlbiAnTFQnIHRoZW4gQGZhc3RTcGVlZCA9IHRydWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgc3dpdGNoIGJ1dHRvblxuICAgICAgICAgICAgICAgIHdoZW4gJ0xCJyB0aGVuIEBzdG9wRG93bigpXG4gICAgICAgICAgICAgICAgd2hlbiAnUkInIHRoZW4gQHN0b3BVcCgpXG4gICAgICAgICAgICAgICAgd2hlbiAnTFQnIHRoZW4gQGZhc3RTcGVlZCA9IGZhbHNlXG4gICAgICAgIFxuICAgICMgMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgMDAwMDAwMCAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgb25Nb3VzZURvd246IChldmVudCkgPT4gXG4gICAgICAgIFxuICAgICAgICBiciA9IEBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgXG4gICAgICAgIEBtb3VzZS5tb3ZlZCAgID0gZmFsc2VcbiAgICAgICAgQG1vdXNlLmJ1dHRvbnMgPSBldmVudC5idXR0b25zXG4gICAgICAgIEBtb3VzZS5wb3MgICAgID0gdmVjIGV2ZW50LmNsaWVudFgtYnIubGVmdCwgZXZlbnQuY2xpZW50WS1ici50b3AgXG4gICAgICAgIEBtb3VzZS5kb3duICAgID0gQG1vdXNlLnBvcyBcbiAgICAgICAgXG4gICAgb25Nb3VzZVVwOiAoZXZlbnQpID0+IFxuICAgIFxuICAgICAgICBAbW91c2UuYnV0dG9ucyA9IDBcblxuICAgIG9uTW91c2VEcmFnOiAoZXZlbnQpID0+XG5cbiAgICAgICAgYnIgPSBAY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICAgIFxuICAgICAgICBAbW91c2UuZGVsdGEgPSB2ZWMoZXZlbnQuY2xpZW50WCwgZXZlbnQuY2xpZW50WSkubWludXMgQG1vdXNlLnBvc1xuICAgICAgICBAbW91c2UucG9zICAgPSB2ZWMgZXZlbnQuY2xpZW50WC1ici5sZWZ0LCBldmVudC5jbGllbnRZLWJyLnRvcFxuICAgICAgICBcbiAgICAgICAgaWYgQGRvd25Qb3M/LmRpc3QodmVjIEBtb3VzZVgsIEBtb3VzZVkpID4gNjBcbiAgICAgICAgICAgIEBtb3VzZU1vdmVkID0gdHJ1ZVxuICAgICAgICBcbiAgICAgICAgaWYgZXZlbnQuYnV0dG9ucyAmIDRcbiAgICAgICAgICAgIHMgPSBAc3BlZWRGYWN0b3IgKiA0XG4gICAgICAgICAgICBAcGFuIEBtb3VzZS5kZWx0YS54KjIqcy9Ac2l6ZS54LCBAbW91c2UuZGVsdGEueSpzL0BzaXplLnlcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBldmVudC5idXR0b25zICYgM1xuICAgICAgICAgICAgcyA9IEBkaXN0ID09IEBtb3ZlRGlzdCBhbmQgNTAwIG9yIDIwMDBcbiAgICAgICAgICAgIEBwaXZvdCBzKkBtb3VzZS5kZWx0YS54L0BzaXplLngsIHMqQG1vdXNlLmRlbHRhLnkvQHNpemUueSAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMCAgIDAwMCAwMDAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgICAgIDAgICAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgcGl2b3Q6ICh4LHkpIC0+XG4gICAgICAgICBcbiAgICAgICAgQHJvdGF0ZSArPSAwLjEqeFxuICAgICAgICBAZGVncmVlICs9IDAuMSp5XG4gICAgICAgICAgICAgICAgIFxuICAgICAgICBAbmF2aWdhdGUoKVxuICAgICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgXG4gICAgcGFuOiAoeCx5KSAtPlxuICAgICAgICBcbiAgICAgICAgcmlnaHQgPSB2ZWMgLXgsIDAsIDAgXG4gICAgICAgIHJpZ2h0LmFwcGx5UXVhdGVybmlvbiBAcm90YXRpb25RdWF0ZXJuaW9uXG5cbiAgICAgICAgdXAgPSB2ZWMgMCwgeSwgMCBcbiAgICAgICAgdXAuYXBwbHlRdWF0ZXJuaW9uIEByb3RhdGlvblF1YXRlcm5pb25cbiAgICAgICAgXG4gICAgICAgIEBjZW50ZXIuYWRkIHJpZ2h0LnBsdXMgdXBcbiAgICAgICAgQGNlbnRlclRhcmdldD8uY29weSBAY2VudGVyXG4gICAgICAgIFxuICAgICAgICBAbmF2aWdhdGUoKVxuICAgICAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAgICAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgICAgICAgICAgICAgICAgICBcbiAgICBmYWRlVG9Qb3M6ICh2KSAtPiBcbiAgICAgICAgQGNlbnRlclRhcmdldCA9IHZlYyB2XG4gICAgICAgIFxuICAgICAgICBpZiBAZGlzdCA8PSBAbW92ZURpc3RcbiAgICAgICAgICAgIEBkaXN0ID0gQGNlbnRlclRhcmdldC5kaXN0IEBwb3NpdGlvblxuICAgICAgICAgICAgQGNlbnRlciA9IEBnZXREaXIoKS5tdWwoQGRpc3QpLmFkZCBAcG9zaXRpb25cblxuICAgICAgICBAc3RhcnRGYWRlQ2VudGVyKClcblxuICAgIHN0YXJ0RmFkZUNlbnRlcjogLT4gXG4gICAgICAgIFxuICAgICAgICBpZiBub3QgQGZhZGluZ1xuICAgICAgICAgICAgYW5pbWF0ZSBAZmFkZUNlbnRlclxuICAgICAgICAgICAgQGZhZGluZyA9IHRydWVcbiAgICAgICAgICAgIFxuICAgIGZhZGVDZW50ZXI6IChkZWx0YVNlY29uZHMpID0+XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gaWYgbm90IEBmYWRpbmdcbiAgICAgICAgQGNlbnRlci5mYWRlIEBjZW50ZXJUYXJnZXQsIGRlbHRhU2Vjb25kc1xuICAgICAgICBAbmF2aWdhdGUoKVxuICAgICAgICBpZiBAY2VudGVyLmRpc3QoQGNlbnRlclRhcmdldCkgPiAwLjA1XG4gICAgICAgICAgICBhbmltYXRlIEBmYWRlQ2VudGVyXG4gICAgICAgICAgICB0cnVlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGRlbGV0ZSBAZmFkaW5nXG5cbiAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgIDAwMDAwMDAgICAgICAgMCAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBtb3ZlRm9yd2FyZDogICh2PTEpICAtPiBAc3RhcnRNb3ZlIEBtb3ZlWiA9IHZcbiAgICBtb3ZlUmlnaHQ6ICAgICh2PTEpICAtPiBAc3RhcnRNb3ZlIEBtb3ZlWCA9IHZcbiAgICBtb3ZlVXA6ICAgICAgICh2PTEpICAtPiBAc3RhcnRNb3ZlIEBtb3ZlWSA9IHZcbiAgICBtb3ZlTGVmdDogICAgICh2PS0xKSAtPiBAc3RhcnRNb3ZlIEBtb3ZlWCA9IHZcbiAgICBtb3ZlRG93bjogICAgICh2PS0xKSAtPiBAc3RhcnRNb3ZlIEBtb3ZlWSA9IHZcbiAgICBtb3ZlQmFja3dhcmQ6ICh2PS0xKSAtPiBAc3RhcnRNb3ZlIEBtb3ZlWiA9IHYgICAgICAgICAgXG5cbiAgICBzdG9wUmlnaHQ6ICAgIC0+IEBtb3ZlWCA9IGNsYW1wIC0xIDAgQG1vdmVYXG4gICAgc3RvcExlZnQ6ICAgICAtPiBAbW92ZVggPSBjbGFtcCAgMCAxIEBtb3ZlWFxuICAgIHN0b3BVcDogICAgICAgLT4gQG1vdmVZID0gY2xhbXAgLTEgMCBAbW92ZVlcbiAgICBzdG9wRG93bjogICAgIC0+IEBtb3ZlWSA9IGNsYW1wICAwIDEgQG1vdmVZXG4gICAgc3RvcEZvcndhcmQ6ICAtPiBAbW92ZVogPSBjbGFtcCAtMSAwIEBtb3ZlWlxuICAgIHN0b3BCYWNrd2FyZDogLT4gQG1vdmVaID0gY2xhbXAgIDAgMSBAbW92ZVpcbiAgICAgICAgXG4gICAgc3RvcE1vdmluZzogLT5cbiAgICAgICAgXG4gICAgICAgIEBmYWRpbmcgPSBmYWxzZVxuICAgICAgICBAbW92aW5nID0gZmFsc2VcbiAgICAgICAgQG1vdmVYID0gMFxuICAgICAgICBAbW92ZVkgPSAwXG4gICAgICAgIEBtb3ZlWiA9IDBcbiAgICAgICBcbiAgICBzdGFydE1vdmU6IC0+IFxuICAgICAgICBcbiAgICAgICAgQGZhZGluZyA9IGZhbHNlXG4gICAgICAgIGlmIG5vdCBAbW92aW5nXG4gICAgICAgICAgICBAZGlzdCAgID0gQG1vdmVEaXN0XG4gICAgICAgICAgICBAY2VudGVyID0gQGdldERpcigpLm11bChAZGlzdCkucGx1cyBAcG9zaXRpb25cbiAgICAgICAgICAgIGFuaW1hdGUgQG1vdmVDZW50ZXJcbiAgICAgICAgICAgIEBtb3ZpbmcgPSB0cnVlXG4gICAgICAgICAgICBcbiAgICBtb3ZlQ2VudGVyOiAoZGVsdGFTZWNvbmRzKSA9PlxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGlmIG5vdCBAbW92aW5nXG4gICAgICAgIFxuICAgICAgICBAbW92ZVJlbGF0aXZlKGRlbHRhU2Vjb25kcyAqICAgICAoQG1vdmVYIG9yIEBtb3ZlRmFkZS54KVxuICAgICAgICAgICAgICAgICAgICAgIGRlbHRhU2Vjb25kcyAqICAgICAoQG1vdmVZIG9yIEBtb3ZlRmFkZS55KVxuICAgICAgICAgICAgICAgICAgICAgIGRlbHRhU2Vjb25kcyAqIDIgKiAoQG1vdmVaIG9yIEBtb3ZlRmFkZS56KSlcbiAgICAgICAgXG4gICAgICAgIEBuYXZpZ2F0ZSgpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBtb3ZlRmFkZS54ID0gQG1vdmVYIG9yIHJlZHVjZSBAbW92ZUZhZGUueCwgZGVsdGFTZWNvbmRzXG4gICAgICAgIEBtb3ZlRmFkZS55ID0gQG1vdmVZIG9yIHJlZHVjZSBAbW92ZUZhZGUueSwgZGVsdGFTZWNvbmRzXG4gICAgICAgIEBtb3ZlRmFkZS56ID0gQG1vdmVaIG9yIHJlZHVjZSBAbW92ZUZhZGUueiwgZGVsdGFTZWNvbmRzXG4gICAgICAgIFxuICAgICAgICBpZiBAbW92ZUZhZGUubGVuZ3RoKCkgPiAwLjAwMVxuICAgICAgICAgICAgYW5pbWF0ZSBAbW92ZUNlbnRlclxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc3RvcE1vdmluZygpXG4gICAgICAgIFxuICAgIG1vdmVSZWxhdGl2ZTogKHgsIHksIHopIC0+XG4gICAgICAgIFxuICAgICAgICB2ID0gdmVjIHgsIHksIHpcbiAgICAgICAgdi5zY2FsZSBAc3BlZWRGYWN0b3JcbiAgICAgICAgdi5hcHBseVF1YXRlcm5pb24gQHJvdGF0aW9uUXVhdGVybmlvblxuICAgICAgICBcbiAgICAgICAgQGNlbnRlci5hZGQgdlxuICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAwICAwMDAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgIFxuICAgIFxuICAgIG9uTW91c2VXaGVlbDogKGV2ZW50KSA9PiBcbiAgICAgICAgICAgIFxuICAgICAgICBpZiBAd2hlZWxJbmVydCA+IDAgYW5kIGV2ZW50LndoZWVsRGVsdGEgPCAwXG4gICAgICAgICAgICBAd2hlZWxJbmVydCA9IDBcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIGlmIEB3aGVlbEluZXJ0IDwgMCBhbmQgZXZlbnQud2hlZWxEZWx0YSA+IDBcbiAgICAgICAgICAgIEB3aGVlbEluZXJ0ID0gMFxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgQHdoZWVsSW5lcnQgKz0gZXZlbnQud2hlZWxEZWx0YSAqICgxKyhAZGlzdC9AbWF4RGlzdCkqMykgKiAwLjAwMDFcbiAgICAgICAgXG4gICAgICAgIEBzdGFydFpvb20oKVxuXG4gICAgIyAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAgICAgIDAwICBcbiAgICAjICAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgICAwMDAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMCAgXG4gICAgIyAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwICBcbiAgICAjIDAwMDAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAwMDAgIFxuXG4gICAgc3RhcnRab29tSW46IC0+XG4gICAgICAgIFxuICAgICAgICBAd2hlZWxJbmVydCA9ICgxKyhAZGlzdC9AbWF4RGlzdCkqMykqMTBcbiAgICAgICAgQHN0YXJ0Wm9vbSgpXG4gICAgICAgIFxuICAgIHN0YXJ0Wm9vbU91dDogLT5cbiAgICAgICAgXG4gICAgICAgIEB3aGVlbEluZXJ0ID0gLSgxKyhAZGlzdC9AbWF4RGlzdCkqMykqMTBcbiAgICAgICAgQHN0YXJ0Wm9vbSgpXG4gICAgXG4gICAgc3RhcnRab29tOiAtPiBcbiAgICAgICAgXG4gICAgICAgIGlmIG5vdCBAem9vbWluZ1xuICAgICAgICAgICAgYW5pbWF0ZSBAaW5lcnRab29tXG4gICAgICAgICAgICBAem9vbWluZyA9IHRydWVcbiAgICAgICAgICAgIFxuICAgIHN0b3Bab29tOiAtPiBcbiAgICAgICAgXG4gICAgICAgIEB3aGVlbEluZXJ0ID0gMFxuICAgICAgICBAem9vbWluZyA9IGZhbHNlXG4gICAgXG4gICAgaW5lcnRab29tOiAoZGVsdGFTZWNvbmRzKSA9PlxuXG4gICAgICAgIEBzZXREaXN0IDEgLSBjbGFtcCAtMC4wMiAwLjAyIEB3aGVlbEluZXJ0XG4gICAgICAgIEB3aGVlbEluZXJ0ID0gcmVkdWNlIEB3aGVlbEluZXJ0LCBkZWx0YVNlY29uZHMqMC4yXG4gICAgICAgIGlmIE1hdGguYWJzKEB3aGVlbEluZXJ0KSA+IDAuMDAxXG4gICAgICAgICAgICBpZiBAd2hlZWxJbmVydCA+IDAgYW5kIEBkaXN0ID4gQG1pbkRpc3Qgb3IgQHdoZWVsSW5lcnQgPCAwIGFuZCBAZGlzdCA8IEBtYXhEaXN0XG4gICAgICAgICAgICAgICAgYW5pbWF0ZSBAaW5lcnRab29tXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcblxuICAgICAgICBkZWxldGUgQHpvb21pbmdcbiAgICAgICAgQHdoZWVsSW5lcnQgPSAwXG4gICAgXG4gICAgc2V0RGlzdDogKGZhY3RvcikgPT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgQGRpc3QgPSBjbGFtcCBAbWluRGlzdCwgQG1heERpc3QsIEBkaXN0KmZhY3RvclxuICAgICAgICBAbmF2aWdhdGUoKVxuICAgICAgICBcbiAgICBzZXRGb3Y6IChmb3YpIC0+IEBmb3YgPSBNYXRoLm1heCAyLjAgTWF0aC5taW4gZm92LCAxNzUuMFxuICAgIFxuICAgIHNjYWxlRG93bjogLT5cbiAgICAgICAgXG4gICAgICAgIEBjZW50ZXIuc2NhbGUgMC4wMVxuICAgICAgICBAcG9zaXRpb24uc2NhbGVJblBsYWNlIDAuMDFcbiAgICAgICAgQGRpc3QgKj0gMC4wMVxuICAgICAgICBAbmF2aWdhdGUoKVxuXG4gICAgc2NhbGVVcDogKG9mZnNldCkgLT5cbiAgICAgICAgXG4gICAgICAgIEBjZW50ZXIuc3ViIG9mZnNldFxuICAgICAgICBAcG9zaXRpb24uc3ViIG9mZnNldFxuICAgICAgICBcbiAgICAgICAgQGNlbnRlci5zY2FsZSAxMDBcbiAgICAgICAgQHBvc2l0aW9uLnNjYWxlSW5QbGFjZSAxMDBcbiAgICAgICAgQGRpc3QgKj0gMTAwXG4gICAgICAgIEBuYXZpZ2F0ZSgpXG4gICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAgMDAwIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAwMDAwMDAgICAgIDAwMCAgICAgMDAwMDAwMCAgIFxuICAgICMgMDAwICAwMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgIDAgICAgICAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBuYXZpZ2F0ZTogLT4gXG4gICAgICAgIFxuICAgICAgICBAZGVncmVlID0gY2xhbXAgMSAxNzkgQGRlZ3JlZVxuICAgICAgICBcbiAgICAgICAgeWF3ICAgPSBkZWcycmFkIEByb3RhdGVcbiAgICAgICAgcGl0Y2ggPSBkZWcycmFkIEBkZWdyZWVcbiAgICAgICAgXG4gICAgICAgIEByb3RhdGlvblF1YXRlcm5pb24uY29weUZyb20gUXVhdGVybmlvbi5Sb3RhdGlvbllhd1BpdGNoUm9sbCB5YXcsIHBpdGNoLCAwXG4gICAgICAgIHYgPSBuZXcgVmVjdG9yMyAwIDAgLUBkaXN0XG4gICAgICAgIHYucm90YXRlQnlRdWF0ZXJuaW9uQXJvdW5kUG9pbnRUb1JlZiBAcm90YXRpb25RdWF0ZXJuaW9uLCBWZWN0b3IzLlplcm9SZWFkT25seSwgdlxuICAgICAgICBAcG9zaXRpb24uY29weUZyb20gQGNlbnRlci5wbHVzIHZcbiAgICAgICAgQHNldFRhcmdldCBuZXcgVmVjdG9yMyBAY2VudGVyLngsIEBjZW50ZXIueSwgQGNlbnRlci56XG4gICAgICAgIFxuICAgICAgICBpbmZvID0gXG4gICAgICAgICAgICByb3RhdGU6IEByb3RhdGUgXG4gICAgICAgICAgICBkZWdyZWU6IEBkZWdyZWUgXG4gICAgICAgICAgICBkaXN0OiAgIEBkaXN0XG4gICAgICAgICAgICBwb3M6ICAgIHt4OkBwb3NpdGlvbi54LCB5OkBwb3NpdGlvbi55LCB6OkBwb3NpdGlvbi56fVxuICAgICAgICAgICAgY2VudGVyOiB7eDpAY2VudGVyLngsIHk6QGNlbnRlci55LCB6OkBjZW50ZXIuen1cblxuICAgICAgICBwcmVmcy5zZXQgJ2NhbWVyYScgaW5mb1xuICAgICAgICBcbiAgICAgICAgaWYgMTIqQG1pbkRpc3QvQGRpc3QgPj0gOFxuICAgICAgICAgICAgQHNjZW5lLnN0eWxlLmZvbnRTaXplID0gMTIqQG1pbkRpc3QvQGRpc3RcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNjZW5lLnN0eWxlLmZvbnRTaXplID0gMFxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gQ2FtZXJhXG4iXX0=
//# sourceURL=../coffee/camera.coffee