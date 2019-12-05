// koffee 1.6.0

/*
000   000   0000000   00000000   000      0000000    
000 0 000  000   000  000   000  000      000   000  
000000000  000   000  0000000    000      000   000  
000   000  000   000  000   000  000      000   000  
00     00   0000000   000   000  0000000  0000000
 */
var AmbientLight, ArcRotateCamera, Camera, Color3, DirectionalLight, Engine, FramingBehavior, HemisphericLight, Mesh, MeshBuilder, Poly, Scene, ShadowGenerator, SimplificationType, SpotLight, StandardMaterial, Vect, Vector3, World, animate, elem, prefs, ref, ref1,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('kxk'), prefs = ref.prefs, elem = ref.elem;

ref1 = require('babylonjs'), ArcRotateCamera = ref1.ArcRotateCamera, FramingBehavior = ref1.FramingBehavior, Engine = ref1.Engine, Scene = ref1.Scene, Color3 = ref1.Color3, Vector3 = ref1.Vector3, Mesh = ref1.Mesh, SimplificationType = ref1.SimplificationType, DirectionalLight = ref1.DirectionalLight, AmbientLight = ref1.AmbientLight, ShadowGenerator = ref1.ShadowGenerator, StandardMaterial = ref1.StandardMaterial, MeshBuilder = ref1.MeshBuilder, HemisphericLight = ref1.HemisphericLight, SpotLight = ref1.SpotLight;

Poly = require('./poly');

Vect = require('./vect');

Camera = require('./camera');

animate = require('./animate');

World = (function() {
    function World(view) {
        var a, ground, i, j, k, l, len, light, light0, m, n, o, p, q, r, ref2, s, shadowGenerator, t, truncated, u;
        this.view = view;
        this.resized = bind(this.resized, this);
        this.animate = bind(this.animate, this);
        this.onMouseUp = bind(this.onMouseUp, this);
        this.onMouseMove = bind(this.onMouseMove, this);
        this.onMouseDown = bind(this.onMouseDown, this);
        this.paused = false;
        this.view.focus();
        this.canvas = elem('canvas', {
            "class": 'babylon',
            parent: this.view
        });
        this.resized();
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);
        a = 0.06;
        this.scene.clearColor = new Color3(a, a, a);
        this.camera = new Camera(this.scene, this.view, this.canvas);
        light0 = new HemisphericLight('light1', new Vect(0, 1, 0), this.scene);
        light0.intensity = 1;
        light = new DirectionalLight('light', new Vect(0, -1, 0), this.scene);
        light.position.y = 100;
        light.intensity = 0.1;
        shadowGenerator = new ShadowGenerator(8 * 1024, light);
        shadowGenerator.useExponentialShadowMap = true;
        shadowGenerator.usePoissonSampling = true;
        shadowGenerator.usePercentageCloserFiltering = true;
        shadowGenerator.useContactHardeningShadow = true;
        ground = MeshBuilder.CreateGround("ground", {
            width: 1000,
            height: 1000,
            subdivisions: 4
        }, this.scene);
        ground.material = new StandardMaterial("mat", this.scene);
        ground.material.specularColor = new Color3(0.05, 0.05, 0.05);
        a = 0.05;
        ground.material.diffuseColor = new Color3(a, a, a);
        ground.receiveShadows = true;
        ground.position.y = -4;
        this.engine.runRenderLoop(this.animate);
        if (prefs.get('inspector')) {
            this.toggleInspector();
        }
        window.addEventListener('pointerdown', this.onMouseDown);
        window.addEventListener('pointerup', this.onMouseUp);
        for (i = k = 0; k <= 10; i = ++k) {
            truncated = Poly.truncate(Poly.tetrahedron(), i * 0.1);
            p = Mesh.CreatePolyhedron("icosahedron", {
                custom: truncated
            }, this.scene);
            p.receiveShadows = true;
            p.position.z = -3 * i;
            shadowGenerator.addShadowCaster(p);
            p.material = new StandardMaterial('mat', this.scene);
            p.material.alpha = 0.8;
            p.material.diffuseColor = new Color3(0, 1, 1);
        }
        for (i = l = 0; l <= 10; i = ++l) {
            truncated = Poly.truncate(Poly.cube(), i * 0.1);
            p = Mesh.CreatePolyhedron("icosahedron", {
                custom: truncated
            }, this.scene);
            p.receiveShadows = true;
            p.position.x = 3;
            p.position.z = -3 * i;
            shadowGenerator.addShadowCaster(p);
            p.material = new StandardMaterial('mat', this.scene);
            p.material.alpha = 0.8;
            p.material.diffuseColor = new Color3(1, 0, 1);
        }
        for (i = n = 0; n <= 10; i = ++n) {
            truncated = Poly.truncate(Poly.octahedron(), i * 0.1);
            p = Mesh.CreatePolyhedron("icosahedron", {
                custom: truncated
            }, this.scene);
            p.receiveShadows = true;
            p.position.x = 6;
            p.position.z = -3 * i;
            shadowGenerator.addShadowCaster(p);
            p.material = new StandardMaterial('mat', this.scene);
            p.material.alpha = 0.8;
            p.material.diffuseColor = new Color3(1, 1, 0);
        }
        for (i = o = 0; o <= 10; i = ++o) {
            truncated = Poly.truncate(Poly.dodecahedron(), i * 0.1);
            p = Mesh.CreatePolyhedron("icosahedron", {
                custom: truncated
            }, this.scene);
            p.receiveShadows = true;
            p.position.x = 9;
            p.position.z = -3 * i;
            shadowGenerator.addShadowCaster(p);
            p.material = new StandardMaterial('mat', this.scene);
            p.material.alpha = 0.8;
            p.material.diffuseColor = new Color3(0, 0, 1);
        }
        for (i = q = 0; q <= 10; i = ++q) {
            truncated = Poly.truncate(Poly.icosahedron(), i * 0.1);
            p = Mesh.CreatePolyhedron("icosahedron", {
                custom: truncated
            }, this.scene);
            p.receiveShadows = true;
            p.position.x = 12;
            p.position.z = -3 * i;
            shadowGenerator.addShadowCaster(p);
            p.material = new StandardMaterial('mat', this.scene);
            p.material.alpha = 0.8;
            p.material.diffuseColor = new Color3(1, 0, 0);
        }
        for (i = r = 0; r <= 10; i = ++r) {
            truncated = Poly.truncate(Poly.cuboctahedron(), i * 0.1);
            p = Mesh.CreatePolyhedron("cuboctahedron", {
                custom: truncated
            }, this.scene);
            p.receiveShadows = true;
            p.position.x = 15;
            p.position.z = -3 * i;
            shadowGenerator.addShadowCaster(p);
            p.material = new StandardMaterial('mat', this.scene);
            p.material.alpha = 0.8;
            p.material.diffuseColor = new Color3(0, 1, 0);
        }
        for (i = s = 0; s <= 10; i = ++s) {
            truncated = Poly.truncate(Poly.icosidodecahedron(), i * 0.1);
            p = Mesh.CreatePolyhedron("icosidodecahedron", {
                custom: truncated
            }, this.scene);
            p.receiveShadows = true;
            p.position.x = 18;
            p.position.z = -3 * i;
            shadowGenerator.addShadowCaster(p);
            p.material = new StandardMaterial('mat', this.scene);
            p.material.alpha = 0.8;
            p.material.diffuseColor = new Color3(1, 1, 0);
        }
        ref2 = ['truncatedicosidodecahedron', 'rhombicosidodecahedron', 'rhombicubocahedron', 'snubicosidodecahedron', 'snubcuboctahedron'];
        for (j = t = 0, len = ref2.length; t < len; j = ++t) {
            m = ref2[j];
            for (i = u = 0; u <= 10; i = ++u) {
                truncated = Poly.truncate(Poly[m](), i * 0.1);
                p = Mesh.CreatePolyhedron("icosahedron", {
                    custom: truncated
                }, this.scene);
                p.receiveShadows = true;
                p.position.x = 21 + j * 3;
                p.position.z = -3 * i;
                shadowGenerator.addShadowCaster(p);
                p.material = new StandardMaterial('mat', this.scene);
                p.material.alpha = 0.8;
                p.material.diffuseColor = new Color3(1, 1, 1);
            }
        }
    }

    World.prototype.onMouseDown = function(event) {
        var result;
        window.addEventListener('pointermove', this.onMouseMove);
        result = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
        if (event.buttons & 2) {
            this.mouseDownMesh = result.pickedMesh;
        }
        return this.camera.onMouseDown(event);
    };

    World.prototype.onMouseMove = function(event) {
        return this.camera.onMouseDrag(event);
    };

    World.prototype.onMouseUp = function(event) {
        var mesh, result;
        window.removeEventListener('pointermove', this.onMouseMove);
        result = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
        if (mesh = result.pickedMesh) {
            if (mesh.name !== 'ground' && mesh === this.mouseDownMesh) {
                this.camera.fadeToPos(mesh.getAbsolutePosition());
            }
        }
        return this.camera.onMouseUp(event);
    };

    World.prototype.toggleInspector = function() {
        if (this.scene.debugLayer.isVisible()) {
            this.scene.debugLayer.hide();
            return prefs.set('inspector', false);
        } else {
            this.scene.debugLayer.show({
                overlay: true,
                showInspector: true
            });
            return prefs.set('inspector', true);
        }
    };

    World.prototype.start = function() {
        return this.view.focus();
    };

    World.prototype.animate = function() {
        if (!this.paused) {
            this.scene.render();
            return animate.tick(this.engine.getDeltaTime() / 1000);
        }
    };

    World.prototype.resized = function() {
        this.canvas.width = this.view.clientWidth;
        return this.canvas.height = this.view.clientHeight;
    };

    World.prototype.modKeyComboEventDown = function(mod, key, combo, event) {
        switch (key) {
            case 'e':
                return this.camera.moveUp();
            case 'q':
                return this.camera.moveDown();
            case 'a':
                return this.camera.moveLeft();
            case 'd':
                return this.camera.moveRight();
            case 'w':
                return this.camera.moveForward();
            case 's':
                return this.camera.moveBackward();
            case 'x':
            case 'esc':
                return this.camera.stopMoving();
        }
    };

    World.prototype.modKeyComboEventUp = function(mod, key, combo, event) {
        switch (key) {
            case 'e':
                return this.camera.stopUp();
            case 'q':
                return this.camera.stopDown();
            case 'a':
                return this.camera.stopLeft();
            case 'd':
                return this.camera.stopRight();
            case 'w':
                return this.camera.stopForward();
            case 's':
                return this.camera.stopBackward();
        }
    };

    return World;

})();

module.exports = World;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ybGQuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLG1RQUFBO0lBQUE7O0FBUUEsTUFBa0IsT0FBQSxDQUFRLEtBQVIsQ0FBbEIsRUFBRSxpQkFBRixFQUFTOztBQUVULE9BQThNLE9BQUEsQ0FBUSxXQUFSLENBQTlNLEVBQUUsc0NBQUYsRUFBbUIsc0NBQW5CLEVBQW9DLG9CQUFwQyxFQUE0QyxrQkFBNUMsRUFBbUQsb0JBQW5ELEVBQTJELHNCQUEzRCxFQUFvRSxnQkFBcEUsRUFBMEUsNENBQTFFLEVBQThGLHdDQUE5RixFQUFnSCxnQ0FBaEgsRUFBOEgsc0NBQTlILEVBQStJLHdDQUEvSSxFQUFpSyw4QkFBakssRUFBOEssd0NBQTlLLEVBQWdNOztBQUVoTSxJQUFBLEdBQVUsT0FBQSxDQUFRLFFBQVI7O0FBQ1YsSUFBQSxHQUFVLE9BQUEsQ0FBUSxRQUFSOztBQUNWLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVI7O0FBRUo7SUFFQyxlQUFDLElBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLE9BQUQ7Ozs7OztRQUVBLElBQUMsQ0FBQSxNQUFELEdBQVU7UUFDVixJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sQ0FBQTtRQUVBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQSxDQUFLLFFBQUwsRUFBYztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sU0FBTjtZQUFnQixNQUFBLEVBQU8sSUFBQyxDQUFBLElBQXhCO1NBQWQ7UUFFVixJQUFDLENBQUEsT0FBRCxDQUFBO1FBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFJLE1BQUosQ0FBVyxJQUFDLENBQUEsTUFBWixFQUFvQixJQUFwQjtRQUVWLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBSSxLQUFKLENBQVUsSUFBQyxDQUFBLE1BQVg7UUFFVCxDQUFBLEdB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TUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAgICAgXG4wMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgXG4wMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyMjXG5cbnsgcHJlZnMsIGVsZW0gfSA9IHJlcXVpcmUgJ2t4aydcblxueyBBcmNSb3RhdGVDYW1lcmEsIEZyYW1pbmdCZWhhdmlvciwgRW5naW5lLCBTY2VuZSwgQ29sb3IzLCBWZWN0b3IzLCBNZXNoLCBTaW1wbGlmaWNhdGlvblR5cGUsIERpcmVjdGlvbmFsTGlnaHQsIEFtYmllbnRMaWdodCwgU2hhZG93R2VuZXJhdG9yLCBTdGFuZGFyZE1hdGVyaWFsLCBNZXNoQnVpbGRlciwgSGVtaXNwaGVyaWNMaWdodCwgU3BvdExpZ2h0IH0gPSByZXF1aXJlICdiYWJ5bG9uanMnXG5cblBvbHkgICAgPSByZXF1aXJlICcuL3BvbHknXG5WZWN0ICAgID0gcmVxdWlyZSAnLi92ZWN0J1xuQ2FtZXJhICA9IHJlcXVpcmUgJy4vY2FtZXJhJ1xuYW5pbWF0ZSA9IHJlcXVpcmUgJy4vYW5pbWF0ZSdcblxuY2xhc3MgV29ybGRcbiAgICBcbiAgICBAOiAoQHZpZXcpIC0+XG4gICAgICAgIFxuICAgICAgICBAcGF1c2VkID0gZmFsc2VcbiAgICAgICAgQHZpZXcuZm9jdXMoKVxuICAgICAgICBcbiAgICAgICAgQGNhbnZhcyA9IGVsZW0gJ2NhbnZhcycgY2xhc3M6J2JhYnlsb24nIHBhcmVudDpAdmlld1xuICAgICAgICBcbiAgICAgICAgQHJlc2l6ZWQoKVxuICAgICAgICBAZW5naW5lID0gbmV3IEVuZ2luZSBAY2FudmFzLCB0cnVlXG4gICAgICAgIFxuICAgICAgICBAc2NlbmUgPSBuZXcgU2NlbmUgQGVuZ2luZSBcbiAgICAgICAgXG4gICAgICAgIGEgPSAwLjA2XG4gICAgICAgIEBzY2VuZS5jbGVhckNvbG9yID0gbmV3IENvbG9yMyBhLCBhLCBhXG5cbiAgICAgICAgQGNhbWVyYSA9IG5ldyBDYW1lcmEgQHNjZW5lLCBAdmlldywgQGNhbnZhc1xuICAgICAgICBcbiAgICAgICAgbGlnaHQwID0gbmV3IEhlbWlzcGhlcmljTGlnaHQgJ2xpZ2h0MScgbmV3IFZlY3QoMCAxIDApLCBAc2NlbmVcbiAgICAgICAgbGlnaHQwLmludGVuc2l0eSA9IDFcbiAgICAgICAgbGlnaHQgPSBuZXcgRGlyZWN0aW9uYWxMaWdodCAnbGlnaHQnIG5ldyBWZWN0KDAgLTEgMCksIEBzY2VuZVxuICAgICAgICBsaWdodC5wb3NpdGlvbi55ID0gMTAwXG4gICAgICAgIGxpZ2h0LmludGVuc2l0eSA9IDAuMVxuICAgICAgICBcbiAgICAgICAgc2hhZG93R2VuZXJhdG9yID0gbmV3IFNoYWRvd0dlbmVyYXRvciA4KjEwMjQsIGxpZ2h0XG4gICAgICAgIHNoYWRvd0dlbmVyYXRvci51c2VFeHBvbmVudGlhbFNoYWRvd01hcCA9IHRydWVcbiAgICAgICAgc2hhZG93R2VuZXJhdG9yLnVzZVBvaXNzb25TYW1wbGluZyA9IHRydWVcbiAgICAgICAgc2hhZG93R2VuZXJhdG9yLnVzZVBlcmNlbnRhZ2VDbG9zZXJGaWx0ZXJpbmcgPSB0cnVlXG4gICAgICAgIHNoYWRvd0dlbmVyYXRvci51c2VDb250YWN0SGFyZGVuaW5nU2hhZG93ID0gdHJ1ZVxuICAgICAgICBcbiAgICAgICAgZ3JvdW5kID0gTWVzaEJ1aWxkZXIuQ3JlYXRlR3JvdW5kIFwiZ3JvdW5kXCIge3dpZHRoOjEwMDAgaGVpZ2h0OjEwMDAgc3ViZGl2aXNpb25zOiA0fSwgQHNjZW5lXG4gICAgICAgIGdyb3VuZC5tYXRlcmlhbCA9IG5ldyBTdGFuZGFyZE1hdGVyaWFsIFwibWF0XCIgQHNjZW5lXG4gICAgICAgIGdyb3VuZC5tYXRlcmlhbC5zcGVjdWxhckNvbG9yID0gbmV3IENvbG9yMyAwLjA1IDAuMDUgMC4wNVxuICAgICAgICBhID0gMC4wNVxuICAgICAgICBncm91bmQubWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gbmV3IENvbG9yMyBhLCBhLCBhXG4gICAgICAgIGdyb3VuZC5yZWNlaXZlU2hhZG93cyA9IHRydWVcbiAgICAgICAgZ3JvdW5kLnBvc2l0aW9uLnkgPSAtNFxuICAgICAgICAgICAgIFxuICAgICAgICBAZW5naW5lLnJ1blJlbmRlckxvb3AgQGFuaW1hdGVcbiAgICAgICAgaWYgcHJlZnMuZ2V0ICdpbnNwZWN0b3InXG4gICAgICAgICAgICBAdG9nZ2xlSW5zcGVjdG9yKClcbiAgICAgICAgICAgICBcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3BvaW50ZXJkb3duJyBAb25Nb3VzZURvd25cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIgJ3BvaW50ZXJ1cCcgICBAb25Nb3VzZVVwXG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMC4uMTBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRydW5jYXRlZCA9IFBvbHkudHJ1bmNhdGUgUG9seS50ZXRyYWhlZHJvbigpLCBpKjAuMVxuICAgIFxuICAgICAgICAgICAgcCA9IE1lc2guQ3JlYXRlUG9seWhlZHJvbiBcImljb3NhaGVkcm9uXCIge2N1c3RvbTp0cnVuY2F0ZWR9LCBAc2NlbmVcbiAgICAgICAgICAgICMgcC5jb252ZXJ0VG9GbGF0U2hhZGVkTWVzaCgpXG4gICAgICAgICAgICBwLnJlY2VpdmVTaGFkb3dzID0gdHJ1ZVxuICAgICAgICAgICAgcC5wb3NpdGlvbi56ID0gLTMqaVxuICAgICAgICAgICAgc2hhZG93R2VuZXJhdG9yLmFkZFNoYWRvd0Nhc3RlciBwXG4gICAgICAgICAgICBwLm1hdGVyaWFsID0gbmV3IFN0YW5kYXJkTWF0ZXJpYWwgJ21hdCcgQHNjZW5lXG4gICAgICAgICAgICBwLm1hdGVyaWFsLmFscGhhID0gMC44XG4gICAgICAgICAgICBwLm1hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IG5ldyBDb2xvcjMgMCAxIDFcbiAgICAgICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMC4uMTBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRydW5jYXRlZCA9IFBvbHkudHJ1bmNhdGUgUG9seS5jdWJlKCksIGkqMC4xXG4gICAgXG4gICAgICAgICAgICBwID0gTWVzaC5DcmVhdGVQb2x5aGVkcm9uIFwiaWNvc2FoZWRyb25cIiB7Y3VzdG9tOnRydW5jYXRlZH0sIEBzY2VuZVxuICAgICAgICAgICAgIyBwLmNvbnZlcnRUb0ZsYXRTaGFkZWRNZXNoKClcbiAgICAgICAgICAgIHAucmVjZWl2ZVNoYWRvd3MgPSB0cnVlXG4gICAgICAgICAgICBwLnBvc2l0aW9uLnggPSAgM1xuICAgICAgICAgICAgcC5wb3NpdGlvbi56ID0gLTMqaVxuICAgICAgICAgICAgc2hhZG93R2VuZXJhdG9yLmFkZFNoYWRvd0Nhc3RlciBwXG4gICAgICAgICAgICBwLm1hdGVyaWFsID0gbmV3IFN0YW5kYXJkTWF0ZXJpYWwgJ21hdCcgQHNjZW5lXG4gICAgICAgICAgICBwLm1hdGVyaWFsLmFscGhhID0gMC44XG4gICAgICAgICAgICBwLm1hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IG5ldyBDb2xvcjMgMSAwIDFcbiAgICAgICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMC4uMTBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRydW5jYXRlZCA9IFBvbHkudHJ1bmNhdGUgUG9seS5vY3RhaGVkcm9uKCksIGkqMC4xXG4gICAgXG4gICAgICAgICAgICBwID0gTWVzaC5DcmVhdGVQb2x5aGVkcm9uIFwiaWNvc2FoZWRyb25cIiB7Y3VzdG9tOnRydW5jYXRlZH0sIEBzY2VuZVxuICAgICAgICAgICAgIyBwLmNvbnZlcnRUb0ZsYXRTaGFkZWRNZXNoKClcbiAgICAgICAgICAgIHAucmVjZWl2ZVNoYWRvd3MgPSB0cnVlXG4gICAgICAgICAgICBwLnBvc2l0aW9uLnggPSAgNlxuICAgICAgICAgICAgcC5wb3NpdGlvbi56ID0gLTMqaVxuICAgICAgICAgICAgc2hhZG93R2VuZXJhdG9yLmFkZFNoYWRvd0Nhc3RlciBwXG4gICAgICAgICAgICBwLm1hdGVyaWFsID0gbmV3IFN0YW5kYXJkTWF0ZXJpYWwgJ21hdCcgQHNjZW5lXG4gICAgICAgICAgICBwLm1hdGVyaWFsLmFscGhhID0gMC44XG4gICAgICAgICAgICBwLm1hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IG5ldyBDb2xvcjMgMSAxIDBcbiAgICAgICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMC4uMTBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRydW5jYXRlZCA9IFBvbHkudHJ1bmNhdGUgUG9seS5kb2RlY2FoZWRyb24oKSwgaSowLjFcbiAgICBcbiAgICAgICAgICAgIHAgPSBNZXNoLkNyZWF0ZVBvbHloZWRyb24gXCJpY29zYWhlZHJvblwiIHtjdXN0b206dHJ1bmNhdGVkfSwgQHNjZW5lXG4gICAgICAgICAgICAjIHAuY29udmVydFRvRmxhdFNoYWRlZE1lc2goKVxuICAgICAgICAgICAgcC5yZWNlaXZlU2hhZG93cyA9IHRydWVcbiAgICAgICAgICAgIHAucG9zaXRpb24ueCA9ICA5XG4gICAgICAgICAgICBwLnBvc2l0aW9uLnogPSAtMyppXG4gICAgICAgICAgICBzaGFkb3dHZW5lcmF0b3IuYWRkU2hhZG93Q2FzdGVyIHBcbiAgICAgICAgICAgIHAubWF0ZXJpYWwgPSBuZXcgU3RhbmRhcmRNYXRlcmlhbCAnbWF0JyBAc2NlbmVcbiAgICAgICAgICAgIHAubWF0ZXJpYWwuYWxwaGEgPSAwLjhcbiAgICAgICAgICAgIHAubWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gbmV3IENvbG9yMyAwIDAgMVxuICAgICAgICAgICAgXG4gICAgICAgIGZvciBpIGluIFswLi4xMF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdHJ1bmNhdGVkID0gUG9seS50cnVuY2F0ZSBQb2x5Lmljb3NhaGVkcm9uKCksIGkqMC4xXG4gICAgXG4gICAgICAgICAgICBwID0gTWVzaC5DcmVhdGVQb2x5aGVkcm9uIFwiaWNvc2FoZWRyb25cIiB7Y3VzdG9tOnRydW5jYXRlZH0sIEBzY2VuZVxuICAgICAgICAgICAgIyBwLmNvbnZlcnRUb0ZsYXRTaGFkZWRNZXNoKClcbiAgICAgICAgICAgIHAucmVjZWl2ZVNoYWRvd3MgPSB0cnVlXG4gICAgICAgICAgICBwLnBvc2l0aW9uLnggPSAgMTJcbiAgICAgICAgICAgIHAucG9zaXRpb24ueiA9IC0zKmlcbiAgICAgICAgICAgIHNoYWRvd0dlbmVyYXRvci5hZGRTaGFkb3dDYXN0ZXIgcFxuICAgICAgICAgICAgcC5tYXRlcmlhbCA9IG5ldyBTdGFuZGFyZE1hdGVyaWFsICdtYXQnIEBzY2VuZVxuICAgICAgICAgICAgcC5tYXRlcmlhbC5hbHBoYSA9IDAuOFxuICAgICAgICAgICAgcC5tYXRlcmlhbC5kaWZmdXNlQ29sb3IgPSBuZXcgQ29sb3IzIDEgMCAwXG4gICAgICAgICAgICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMC4uMTBdXG4gICAgICAgICAgICAgXG4gICAgICAgICAgICB0cnVuY2F0ZWQgPSBQb2x5LnRydW5jYXRlIFBvbHkuY3Vib2N0YWhlZHJvbigpLCBpKjAuMVxuICAgICAgICAgICAgcCA9IE1lc2guQ3JlYXRlUG9seWhlZHJvbiBcImN1Ym9jdGFoZWRyb25cIiB7Y3VzdG9tOnRydW5jYXRlZH0sIEBzY2VuZVxuICAgICAgICAgICAgIyBwLmNvbnZlcnRUb0ZsYXRTaGFkZWRNZXNoKClcbiAgICAgICAgICAgIHAucmVjZWl2ZVNoYWRvd3MgPSB0cnVlXG4gICAgICAgICAgICBwLnBvc2l0aW9uLnggPSAgMTVcbiAgICAgICAgICAgIHAucG9zaXRpb24ueiA9IC0zKmlcbiAgICAgICAgICAgIHNoYWRvd0dlbmVyYXRvci5hZGRTaGFkb3dDYXN0ZXIgcFxuICAgICAgICAgICAgcC5tYXRlcmlhbCA9IG5ldyBTdGFuZGFyZE1hdGVyaWFsICdtYXQnIEBzY2VuZVxuICAgICAgICAgICAgcC5tYXRlcmlhbC5hbHBoYSA9IDAuOFxuICAgICAgICAgICAgcC5tYXRlcmlhbC5kaWZmdXNlQ29sb3IgPSBuZXcgQ29sb3IzIDAgMSAwXG4gICAgICAgICAgICBcbiAgICAgICAgZm9yIGkgaW4gWzAuLjEwXVxuICAgICAgICAgICAgIFxuICAgICAgICAgICAgdHJ1bmNhdGVkID0gUG9seS50cnVuY2F0ZSBQb2x5Lmljb3NpZG9kZWNhaGVkcm9uKCksIGkqMC4xXG4gICAgIFxuICAgICAgICAgICAgcCA9IE1lc2guQ3JlYXRlUG9seWhlZHJvbiBcImljb3NpZG9kZWNhaGVkcm9uXCIge2N1c3RvbTp0cnVuY2F0ZWR9LCBAc2NlbmVcbiAgICAgICAgICAgICMgcC5jb252ZXJ0VG9GbGF0U2hhZGVkTWVzaCgpXG4gICAgICAgICAgICBwLnJlY2VpdmVTaGFkb3dzID0gdHJ1ZVxuICAgICAgICAgICAgcC5wb3NpdGlvbi54ID0gIDE4XG4gICAgICAgICAgICBwLnBvc2l0aW9uLnogPSAtMyppXG4gICAgICAgICAgICBzaGFkb3dHZW5lcmF0b3IuYWRkU2hhZG93Q2FzdGVyIHBcbiAgICAgICAgICAgIHAubWF0ZXJpYWwgPSBuZXcgU3RhbmRhcmRNYXRlcmlhbCAnbWF0JyBAc2NlbmVcbiAgICAgICAgICAgIHAubWF0ZXJpYWwuYWxwaGEgPSAwLjhcbiAgICAgICAgICAgIHAubWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gbmV3IENvbG9yMyAxIDEgMFxuICAgICAgICAgICAgXG4gICAgICAgIGZvciBtLGogaW4gWyd0cnVuY2F0ZWRpY29zaWRvZGVjYWhlZHJvbicgJ3Job21iaWNvc2lkb2RlY2FoZWRyb24nICdyaG9tYmljdWJvY2FoZWRyb24nICdzbnViaWNvc2lkb2RlY2FoZWRyb24nICdzbnViY3Vib2N0YWhlZHJvbiddXG4gICAgICAgICAgICBmb3IgaSBpbiBbMC4uMTBdXG4gICAgICAgICAgICAgICAgdHJ1bmNhdGVkID0gUG9seS50cnVuY2F0ZSBQb2x5W21dKCksIGkqMC4xXG4gICAgICAgICAgICAgICAgcCA9IE1lc2guQ3JlYXRlUG9seWhlZHJvbiBcImljb3NhaGVkcm9uXCIge2N1c3RvbTp0cnVuY2F0ZWR9LCBAc2NlbmVcbiAgICAgICAgICAgICAgICBwLnJlY2VpdmVTaGFkb3dzID0gdHJ1ZVxuICAgICAgICAgICAgICAgIHAucG9zaXRpb24ueCA9ICAyMSArIGoqM1xuICAgICAgICAgICAgICAgIHAucG9zaXRpb24ueiA9IC0zKmlcbiAgICAgICAgICAgICAgICBzaGFkb3dHZW5lcmF0b3IuYWRkU2hhZG93Q2FzdGVyIHBcbiAgICAgICAgICAgICAgICBwLm1hdGVyaWFsID0gbmV3IFN0YW5kYXJkTWF0ZXJpYWwgJ21hdCcgQHNjZW5lXG4gICAgICAgICAgICAgICAgcC5tYXRlcmlhbC5hbHBoYSA9IDAuOFxuICAgICAgICAgICAgICAgIHAubWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gbmV3IENvbG9yMyAxIDEgMVxuICAgICAgICAgICAgXG4gICAgb25Nb3VzZURvd246IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdwb2ludGVybW92ZScgQG9uTW91c2VNb3ZlXG4gICAgICAgIFxuICAgICAgICByZXN1bHQgPSBAc2NlbmUucGljayBAc2NlbmUucG9pbnRlclgsIEBzY2VuZS5wb2ludGVyWVxuICAgICAgICBpZiBldmVudC5idXR0b25zICYgMlxuICAgICAgICAgICAgQG1vdXNlRG93bk1lc2ggPSByZXN1bHQucGlja2VkTWVzaCAgICAgICAgIFxuICAgICAgICBAY2FtZXJhLm9uTW91c2VEb3duIGV2ZW50XG5cbiAgICBvbk1vdXNlTW92ZTogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgQGNhbWVyYS5vbk1vdXNlRHJhZyBldmVudFxuICAgICAgICBcbiAgICBvbk1vdXNlVXA6IChldmVudCkgPT4gICAgICAgICAgICAgICAgXG5cbiAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIgJ3BvaW50ZXJtb3ZlJyBAb25Nb3VzZU1vdmVcbiAgICAgICAgIFxuICAgICAgICByZXN1bHQgPSBAc2NlbmUucGljayBAc2NlbmUucG9pbnRlclgsIEBzY2VuZS5wb2ludGVyWVxuICAgICAgICBpZiBtZXNoID0gcmVzdWx0LnBpY2tlZE1lc2hcbiAgICAgICAgICAgIGlmIG1lc2gubmFtZSAhPSAnZ3JvdW5kJyBhbmQgbWVzaCA9PSBAbW91c2VEb3duTWVzaFxuICAgICAgICAgICAgICAgIEBjYW1lcmEuZmFkZVRvUG9zIG1lc2guZ2V0QWJzb2x1dGVQb3NpdGlvbigpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBjYW1lcmEub25Nb3VzZVVwIGV2ZW50XG4gICAgICAgICAgICAgICAgXG4gICAgdG9nZ2xlSW5zcGVjdG9yOiAtPlxuICAgICAgICBcbiAgICAgICAgaWYgQHNjZW5lLmRlYnVnTGF5ZXIuaXNWaXNpYmxlKClcbiAgICAgICAgICAgIEBzY2VuZS5kZWJ1Z0xheWVyLmhpZGUoKVxuICAgICAgICAgICAgcHJlZnMuc2V0ICdpbnNwZWN0b3InIGZhbHNlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBzY2VuZS5kZWJ1Z0xheWVyLnNob3cgb3ZlcmxheTp0cnVlIHNob3dJbnNwZWN0b3I6dHJ1ZVxuICAgICAgICAgICAgcHJlZnMuc2V0ICdpbnNwZWN0b3InIHRydWVcbiAgICAgICAgXG4gICAgc3RhcnQ6IC0+IEB2aWV3LmZvY3VzKClcblxuICAgIGFuaW1hdGU6ID0+XG5cbiAgICAgICAgaWYgbm90IEBwYXVzZWRcbiAgICAgICAgICAgIEBzY2VuZS5yZW5kZXIoKVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBhbmltYXRlLnRpY2sgQGVuZ2luZS5nZXREZWx0YVRpbWUoKS8xMDAwXG4gICAgXG4gICAgcmVzaXplZDogPT4gXG5cbiAgICAgICAgQGNhbnZhcy53aWR0aCA9IEB2aWV3LmNsaWVudFdpZHRoXG4gICAgICAgIEBjYW52YXMuaGVpZ2h0ID0gQHZpZXcuY2xpZW50SGVpZ2h0XG4gICAgXG4gICAgbW9kS2V5Q29tYm9FdmVudERvd246IChtb2QsIGtleSwgY29tYm8sIGV2ZW50KSAtPlxuICAgICAgICBcbiAgICAgICAgIyBrbG9nICdtb2RLZXlDb21ib0V2ZW50RG93bicgbW9kLCBrZXksIGNvbWJvLCBldmVudC53aGljaFxuICAgICAgICBzd2l0Y2gga2V5XG4gICAgICAgICAgICB3aGVuICdlJyB0aGVuIEBjYW1lcmEubW92ZVVwKClcbiAgICAgICAgICAgIHdoZW4gJ3EnIHRoZW4gQGNhbWVyYS5tb3ZlRG93bigpXG4gICAgICAgICAgICB3aGVuICdhJyB0aGVuIEBjYW1lcmEubW92ZUxlZnQoKVxuICAgICAgICAgICAgd2hlbiAnZCcgdGhlbiBAY2FtZXJhLm1vdmVSaWdodCgpXG4gICAgICAgICAgICB3aGVuICd3JyB0aGVuIEBjYW1lcmEubW92ZUZvcndhcmQoKVxuICAgICAgICAgICAgd2hlbiAncycgdGhlbiBAY2FtZXJhLm1vdmVCYWNrd2FyZCgpXG4gICAgICAgICAgICB3aGVuICd4JyAnZXNjJyB0aGVuIEBjYW1lcmEuc3RvcE1vdmluZygpXG4gICAgICAgIFxuICAgIG1vZEtleUNvbWJvRXZlbnRVcDogKG1vZCwga2V5LCBjb21ibywgZXZlbnQpIC0+XG5cbiAgICAgICAgc3dpdGNoIGtleVxuICAgICAgICAgICAgd2hlbiAnZScgdGhlbiBAY2FtZXJhLnN0b3BVcCgpXG4gICAgICAgICAgICB3aGVuICdxJyB0aGVuIEBjYW1lcmEuc3RvcERvd24oKVxuICAgICAgICAgICAgd2hlbiAnYScgdGhlbiBAY2FtZXJhLnN0b3BMZWZ0KClcbiAgICAgICAgICAgIHdoZW4gJ2QnIHRoZW4gQGNhbWVyYS5zdG9wUmlnaHQoKVxuICAgICAgICAgICAgd2hlbiAndycgdGhlbiBAY2FtZXJhLnN0b3BGb3J3YXJkKClcbiAgICAgICAgICAgIHdoZW4gJ3MnIHRoZW4gQGNhbWVyYS5zdG9wQmFja3dhcmQoKVxuICAgICAgICBcbiAgICAgICAgIyBrbG9nICdtb2RLZXlDb21ib0V2ZW50VXAnIG1vZCwga2V5LCBjb21ibywgZXZlbnQuY29kZVxuICAgICAgICBcbm1vZHVsZS5leHBvcnRzID0gV29ybGRcbiJdfQ==
//# sourceURL=../coffee/world.coffee