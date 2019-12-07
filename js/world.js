// koffee 1.6.0

/*
000   000   0000000   00000000   000      0000000    
000 0 000  000   000  000   000  000      000   000  
000000000  000   000  0000000    000      000   000  
000   000  000   000  000   000  000      000   000  
00     00   0000000   000   000  0000000  0000000
 */
var AmbientLight, ArcRotateCamera, Camera, Color3, DirectionalLight, Engine, FramingBehavior, HemisphericLight, Mesh, MeshBuilder, Poly, Scene, ShadowGenerator, SimplificationType, SpotLight, StandardMaterial, Vect, Vector3, World, animate, elem, generate, prefs, ref, ref1,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('kxk'), prefs = ref.prefs, elem = ref.elem;

ref1 = require('babylonjs'), ArcRotateCamera = ref1.ArcRotateCamera, FramingBehavior = ref1.FramingBehavior, Engine = ref1.Engine, Scene = ref1.Scene, Color3 = ref1.Color3, Vector3 = ref1.Vector3, Mesh = ref1.Mesh, SimplificationType = ref1.SimplificationType, DirectionalLight = ref1.DirectionalLight, AmbientLight = ref1.AmbientLight, ShadowGenerator = ref1.ShadowGenerator, StandardMaterial = ref1.StandardMaterial, MeshBuilder = ref1.MeshBuilder, HemisphericLight = ref1.HemisphericLight, SpotLight = ref1.SpotLight;

generate = require('./poly/parser').generate;

Poly = require('./poly/polyold');

Vect = require('./vect');

Camera = require('./camera');

animate = require('./animate');

World = (function() {
    function World(view) {
        var a, code, ground, i, j, k, l, len, len1, light, light0, m, n, names, p, poly, ref2, shadowGenerator, truncated;
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
        names = ['tetrahedron', 'cube', 'octahedron', 'dodecahedron', 'icosahedron', 'cuboctahedron', 'icosidodecahedron', 'truncatedicosidodecahedron', 'rhombicosidodecahedron', 'rhombicubocahedron', 'snubicosidodecahedron', 'snubcuboctahedron'];
        for (j = k = 0, len = names.length; k < len; j = ++k) {
            m = names[j];
            for (i = l = 0; l <= 10; i = ++l) {
                truncated = Poly.truncate(Poly[m](), i * 0.1);
                p = Mesh.CreatePolyhedron(m, {
                    custom: truncated
                }, this.scene);
                p.receiveShadows = true;
                p.convertToFlatShadedMesh();
                p.position.x = 3 * j;
                p.position.z = 3 * i;
                shadowGenerator.addShadowCaster(p);
                p.material = new StandardMaterial('mat', this.scene);
                p.material.alpha = 1;
                p.material.diffuseColor = new Color3(i / 12, (j / 6) % 1, 1 - j / 12);
            }
        }
        j = 0;
        ref2 = ['Y3', 'Y4', 'Y5', 'Y6', 'Y7', 'Y8', 'Y9', 'Y10', 'Y11', 'Y12', 'Y13', 'Y14'];
        for (n = 0, len1 = ref2.length; n < len1; n++) {
            code = ref2[n];
            poly = generate(code);
            p = Mesh.CreatePolyhedron(m, {
                custom: poly
            }, this.scene);
            p.receiveShadows = true;
            p.position.x = 3 * j++;
            p.position.z = -3;
            shadowGenerator.addShadowCaster(p);
            p.material = new StandardMaterial('mat', this.scene);
            p.material.alpha = 1;
            p.material.diffuseColor = new Color3(i / 12, (j / 6) % 1, 1 - j / 12);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ybGQuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLDZRQUFBO0lBQUE7O0FBUUEsTUFBa0IsT0FBQSxDQUFRLEtBQVIsQ0FBbEIsRUFBRSxpQkFBRixFQUFTOztBQUVULE9BQThNLE9BQUEsQ0FBUSxXQUFSLENBQTlNLEVBQUUsc0NBQUYsRUFBbUIsc0NBQW5CLEVBQW9DLG9CQUFwQyxFQUE0QyxrQkFBNUMsRUFBbUQsb0JBQW5ELEVBQTJELHNCQUEzRCxFQUFvRSxnQkFBcEUsRUFBMEUsNENBQTFFLEVBQThGLHdDQUE5RixFQUFnSCxnQ0FBaEgsRUFBOEgsc0NBQTlILEVBQStJLHdDQUEvSSxFQUFpSyw4QkFBakssRUFBOEssd0NBQTlLLEVBQWdNOztBQUU5TCxXQUFhLE9BQUEsQ0FBUSxlQUFSOztBQUNmLElBQUEsR0FBVSxPQUFBLENBQVEsZ0JBQVI7O0FBQ1YsSUFBQSxHQUFVLE9BQUEsQ0FBUSxRQUFSOztBQUNWLE1BQUEsR0FBVSxPQUFBLENBQVEsVUFBUjs7QUFDVixPQUFBLEdBQVUsT0FBQSxDQUFRLFdBQVI7O0FBRUo7SUFFQyxlQUFDLElBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLE9BQUQ7Ozs7OztRQUVBLElBQUMsQ0FBQSxNQUFELEdBQVU7UUFDVixJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sQ0FBQTtRQUVBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQSxDQUFLLFFBQUwsRUFBYztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sU0FBTjtZQUFnQixNQUFBLEVBQU8sSUFBQyxDQUFBLElBQXhCO1NBQWQ7UUFFVixJQUFDLENBQUEsT0FBRCxDQUFBO1FBQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFJLE1BQUosQ0FBVyxJQUFDLENBQUEsTUFBWixFQUFvQixJQUFwQjtRQUNWLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBSSxLQUFKLENBQVUs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R1MsR0FIVDt1QkFHa0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxRQUFSLENBQUE7QUFIbEIsaUJBSVMsR0FKVDt1QkFJa0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxTQUFSLENBQUE7QUFKbEIsaUJBS1MsR0FMVDt1QkFLa0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxXQUFSLENBQUE7QUFMbEIsaUJBTVMsR0FOVDt1QkFNa0IsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQUE7QUFObEIsaUJBT1MsR0FQVDtBQUFBLGlCQU9hLEtBUGI7dUJBT3dCLElBQUMsQ0FBQSxNQUFNLENBQUMsVUFBUixDQUFBO0FBUHhCO0lBSGtCOztvQkFZdEIsa0JBQUEsR0FBb0IsU0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEtBQVgsRUFBa0IsS0FBbEI7QUFFaEIsZ0JBQU8sR0FBUDtBQUFBLGlCQUNTLEdBRFQ7dUJBQ2tCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFBO0FBRGxCLGlCQUVTLEdBRlQ7dUJBRWtCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFBO0FBRmxCLGlCQUdTLEdBSFQ7dUJBR2tCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFBO0FBSGxCLGlCQUlTLEdBSlQ7dUJBSWtCLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixDQUFBO0FBSmxCLGlCQUtTLEdBTFQ7dUJBS2tCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixDQUFBO0FBTGxCLGlCQU1TLEdBTlQ7dUJBTWtCLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFBO0FBTmxCO0lBRmdCOzs7Ozs7QUFZeEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAgICAgXG4wMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgXG4wMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyMjXG5cbnsgcHJlZnMsIGVsZW0gfSA9IHJlcXVpcmUgJ2t4aydcblxueyBBcmNSb3RhdGVDYW1lcmEsIEZyYW1pbmdCZWhhdmlvciwgRW5naW5lLCBTY2VuZSwgQ29sb3IzLCBWZWN0b3IzLCBNZXNoLCBTaW1wbGlmaWNhdGlvblR5cGUsIERpcmVjdGlvbmFsTGlnaHQsIEFtYmllbnRMaWdodCwgU2hhZG93R2VuZXJhdG9yLCBTdGFuZGFyZE1hdGVyaWFsLCBNZXNoQnVpbGRlciwgSGVtaXNwaGVyaWNMaWdodCwgU3BvdExpZ2h0IH0gPSByZXF1aXJlICdiYWJ5bG9uanMnXG5cbnsgZ2VuZXJhdGUgfSA9IHJlcXVpcmUgJy4vcG9seS9wYXJzZXInXG5Qb2x5ICAgID0gcmVxdWlyZSAnLi9wb2x5L3BvbHlvbGQnXG5WZWN0ICAgID0gcmVxdWlyZSAnLi92ZWN0J1xuQ2FtZXJhICA9IHJlcXVpcmUgJy4vY2FtZXJhJ1xuYW5pbWF0ZSA9IHJlcXVpcmUgJy4vYW5pbWF0ZSdcblxuY2xhc3MgV29ybGRcbiAgICBcbiAgICBAOiAoQHZpZXcpIC0+XG4gICAgICAgIFxuICAgICAgICBAcGF1c2VkID0gZmFsc2VcbiAgICAgICAgQHZpZXcuZm9jdXMoKVxuICAgICAgICBcbiAgICAgICAgQGNhbnZhcyA9IGVsZW0gJ2NhbnZhcycgY2xhc3M6J2JhYnlsb24nIHBhcmVudDpAdmlld1xuICAgICAgICBcbiAgICAgICAgQHJlc2l6ZWQoKVxuICAgICAgICBAZW5naW5lID0gbmV3IEVuZ2luZSBAY2FudmFzLCB0cnVlXG4gICAgICAgIEBzY2VuZSA9IG5ldyBTY2VuZSBAZW5naW5lIFxuICAgICAgICBcbiAgICAgICAgYSA9IDAuMDZcbiAgICAgICAgQHNjZW5lLmNsZWFyQ29sb3IgPSBuZXcgQ29sb3IzIGEsIGEsIGFcblxuICAgICAgICBAY2FtZXJhID0gbmV3IENhbWVyYSBAc2NlbmUsIEB2aWV3LCBAY2FudmFzXG4gICAgICAgIFxuICAgICAgICBsaWdodDAgPSBuZXcgSGVtaXNwaGVyaWNMaWdodCAnbGlnaHQxJyBuZXcgVmVjdCgwIDEgMCksIEBzY2VuZVxuICAgICAgICBsaWdodDAuaW50ZW5zaXR5ID0gMVxuICAgICAgICBsaWdodCA9IG5ldyBEaXJlY3Rpb25hbExpZ2h0ICdsaWdodCcgbmV3IFZlY3QoMCAtMSAwKSwgQHNjZW5lXG4gICAgICAgIGxpZ2h0LnBvc2l0aW9uLnkgPSAxMDBcbiAgICAgICAgbGlnaHQuaW50ZW5zaXR5ID0gMC4xXG4gICAgICAgIFxuICAgICAgICBzaGFkb3dHZW5lcmF0b3IgPSBuZXcgU2hhZG93R2VuZXJhdG9yIDgqMTAyNCwgbGlnaHRcbiAgICAgICAgc2hhZG93R2VuZXJhdG9yLnVzZUV4cG9uZW50aWFsU2hhZG93TWFwID0gdHJ1ZVxuICAgICAgICBzaGFkb3dHZW5lcmF0b3IudXNlUG9pc3NvblNhbXBsaW5nID0gdHJ1ZVxuICAgICAgICBzaGFkb3dHZW5lcmF0b3IudXNlUGVyY2VudGFnZUNsb3NlckZpbHRlcmluZyA9IHRydWVcbiAgICAgICAgc2hhZG93R2VuZXJhdG9yLnVzZUNvbnRhY3RIYXJkZW5pbmdTaGFkb3cgPSB0cnVlXG4gICAgICAgIFxuICAgICAgICBncm91bmQgPSBNZXNoQnVpbGRlci5DcmVhdGVHcm91bmQgXCJncm91bmRcIiB7d2lkdGg6MTAwMCBoZWlnaHQ6MTAwMCBzdWJkaXZpc2lvbnM6IDR9LCBAc2NlbmVcbiAgICAgICAgZ3JvdW5kLm1hdGVyaWFsID0gbmV3IFN0YW5kYXJkTWF0ZXJpYWwgXCJtYXRcIiBAc2NlbmVcbiAgICAgICAgZ3JvdW5kLm1hdGVyaWFsLnNwZWN1bGFyQ29sb3IgPSBuZXcgQ29sb3IzIDAuMDUgMC4wNSAwLjA1XG4gICAgICAgIGEgPSAwLjA1XG4gICAgICAgIGdyb3VuZC5tYXRlcmlhbC5kaWZmdXNlQ29sb3IgPSBuZXcgQ29sb3IzIGEsIGEsIGFcbiAgICAgICAgZ3JvdW5kLnJlY2VpdmVTaGFkb3dzID0gdHJ1ZVxuICAgICAgICBncm91bmQucG9zaXRpb24ueSA9IC00XG4gICAgICAgICAgICAgXG4gICAgICAgIEBlbmdpbmUucnVuUmVuZGVyTG9vcCBAYW5pbWF0ZVxuICAgICAgICBpZiBwcmVmcy5nZXQgJ2luc3BlY3RvcidcbiAgICAgICAgICAgIEB0b2dnbGVJbnNwZWN0b3IoKVxuICAgICAgICAgICAgIFxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAncG9pbnRlcmRvd24nIEBvbk1vdXNlRG93blxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAncG9pbnRlcnVwJyAgIEBvbk1vdXNlVXBcbiAgICAgICAgICAgIFxuICAgICAgICBuYW1lcyA9IFtcbiAgICAgICAgICAgICd0ZXRyYWhlZHJvbidcbiAgICAgICAgICAgICdjdWJlJ1xuICAgICAgICAgICAgJ29jdGFoZWRyb24nXG4gICAgICAgICAgICAnZG9kZWNhaGVkcm9uJ1xuICAgICAgICAgICAgJ2ljb3NhaGVkcm9uJ1xuICAgICAgICAgICAgJ2N1Ym9jdGFoZWRyb24nXG4gICAgICAgICAgICAnaWNvc2lkb2RlY2FoZWRyb24nXG4gICAgICAgICAgICAndHJ1bmNhdGVkaWNvc2lkb2RlY2FoZWRyb24nIFxuICAgICAgICAgICAgJ3Job21iaWNvc2lkb2RlY2FoZWRyb24nIFxuICAgICAgICAgICAgJ3Job21iaWN1Ym9jYWhlZHJvbicgXG4gICAgICAgICAgICAnc251Ymljb3NpZG9kZWNhaGVkcm9uJyBcbiAgICAgICAgICAgICdzbnViY3Vib2N0YWhlZHJvbidcbiAgICAgICAgXVxuICAgICAgICBcbiAgICAgICAgZm9yIG0saiBpbiBuYW1lc1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IgaSBpbiBbMC4uMTBdXG4gICAgICAgICAgICAgICAgdHJ1bmNhdGVkID0gUG9seS50cnVuY2F0ZSBQb2x5W21dKCksIGkqMC4xXG4gICAgICAgICAgICAgICAgcCA9IE1lc2guQ3JlYXRlUG9seWhlZHJvbiBtLCB7Y3VzdG9tOnRydW5jYXRlZH0sIEBzY2VuZVxuICAgICAgICAgICAgICAgIHAucmVjZWl2ZVNoYWRvd3MgPSB0cnVlXG4gICAgICAgICAgICAgICAgcC5jb252ZXJ0VG9GbGF0U2hhZGVkTWVzaCgpXG4gICAgICAgICAgICAgICAgcC5wb3NpdGlvbi54ID0gMypqXG4gICAgICAgICAgICAgICAgcC5wb3NpdGlvbi56ID0gMyppXG4gICAgICAgICAgICAgICAgc2hhZG93R2VuZXJhdG9yLmFkZFNoYWRvd0Nhc3RlciBwXG4gICAgICAgICAgICAgICAgcC5tYXRlcmlhbCA9IG5ldyBTdGFuZGFyZE1hdGVyaWFsICdtYXQnIEBzY2VuZVxuICAgICAgICAgICAgICAgIHAubWF0ZXJpYWwuYWxwaGEgPSAxICMgMC44XG4gICAgICAgICAgICAgICAgcC5tYXRlcmlhbC5kaWZmdXNlQ29sb3IgPSBuZXcgQ29sb3IzIGkvMTIgKGovNiklMSAxLWovMTJcbiAgICAgICAgICAgIFxuICAgICAgICBqID0gMFxuICAgICAgICAjIGZvciBjb2RlIGluIFsnVCcgJ3RUJyAnQycgJ3RDJyAnTycgJ3RPJyAnRCcgJ3REJyAnSScgJ3RJJyAnUDMnICdQNCcgJ1A1J11cbiAgICAgICAgIyBmb3IgY29kZSBpbiBbJ0EzJydBNCcnQTUnJ0E2JydBNycnQTgnJ0E5JydBMTAnJ0ExMScnQTEyJ11cbiAgICAgICAgIyBmb3IgY29kZSBpbiBbJ1AzJydQNCcnUDUnJ1A2JydQNycnUDgnJ1A5JydQMTAnJ1AxMScnUDEyJydQMTMnJ1AxNCddXG4gICAgICAgIGZvciBjb2RlIGluIFsnWTMnJ1k0JydZNScnWTYnJ1k3JydZOCcnWTknJ1kxMCcnWTExJydZMTInJ1kxMycnWTE0J11cbiAgICAgICAgICAgIHBvbHkgPSBnZW5lcmF0ZSBjb2RlXG4gICAgICAgICAgICAjIGtsb2cgcG9seVxuICAgICAgICAgICAgcCA9IE1lc2guQ3JlYXRlUG9seWhlZHJvbiBtLCB7Y3VzdG9tOnBvbHl9LCBAc2NlbmVcbiAgICAgICAgICAgIHAucmVjZWl2ZVNoYWRvd3MgPSB0cnVlXG4gICAgICAgICAgICBwLnBvc2l0aW9uLnggPSAgMypqKytcbiAgICAgICAgICAgIHAucG9zaXRpb24ueiA9IC0zXG4gICAgICAgICAgICBzaGFkb3dHZW5lcmF0b3IuYWRkU2hhZG93Q2FzdGVyIHBcbiAgICAgICAgICAgIHAubWF0ZXJpYWwgPSBuZXcgU3RhbmRhcmRNYXRlcmlhbCAnbWF0JyBAc2NlbmVcbiAgICAgICAgICAgIHAubWF0ZXJpYWwuYWxwaGEgPSAxICMgMC44XG4gICAgICAgICAgICBwLm1hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IG5ldyBDb2xvcjMgaS8xMiAoai82KSUxIDEtai8xMlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAjIFBvbHkuZHVtcCBQb2x5LnRydW5jYXRlIFBvbHkuaWNvc2FoZWRyb24oKSwgMVxuICAgICAgICAjIFBvbHkuZHVtcCBQb2x5LnRydW5jYXRlIFBvbHkuZG9kZWNhaGVkcm9uKCksIDFcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgICAgMDAwICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgIFxuICAgIFxuICAgIG9uTW91c2VEb3duOiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciAncG9pbnRlcm1vdmUnIEBvbk1vdXNlTW92ZVxuICAgICAgICBcbiAgICAgICAgcmVzdWx0ID0gQHNjZW5lLnBpY2sgQHNjZW5lLnBvaW50ZXJYLCBAc2NlbmUucG9pbnRlcllcbiAgICAgICAgaWYgZXZlbnQuYnV0dG9ucyAmIDJcbiAgICAgICAgICAgIEBtb3VzZURvd25NZXNoID0gcmVzdWx0LnBpY2tlZE1lc2ggICAgICAgICBcbiAgICAgICAgQGNhbWVyYS5vbk1vdXNlRG93biBldmVudFxuXG4gICAgb25Nb3VzZU1vdmU6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIEBjYW1lcmEub25Nb3VzZURyYWcgZXZlbnRcbiAgICAgICAgXG4gICAgb25Nb3VzZVVwOiAoZXZlbnQpID0+ICAgICAgICAgICAgICAgIFxuXG4gICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyICdwb2ludGVybW92ZScgQG9uTW91c2VNb3ZlXG4gICAgICAgICBcbiAgICAgICAgcmVzdWx0ID0gQHNjZW5lLnBpY2sgQHNjZW5lLnBvaW50ZXJYLCBAc2NlbmUucG9pbnRlcllcbiAgICAgICAgaWYgbWVzaCA9IHJlc3VsdC5waWNrZWRNZXNoXG4gICAgICAgICAgICBpZiBtZXNoLm5hbWUgIT0gJ2dyb3VuZCcgYW5kIG1lc2ggPT0gQG1vdXNlRG93bk1lc2hcbiAgICAgICAgICAgICAgICBAY2FtZXJhLmZhZGVUb1BvcyBtZXNoLmdldEFic29sdXRlUG9zaXRpb24oKVxuICAgICAgICAgICAgICAgIFxuICAgICAgICBAY2FtZXJhLm9uTW91c2VVcCBldmVudFxuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICB0b2dnbGVJbnNwZWN0b3I6IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBAc2NlbmUuZGVidWdMYXllci5pc1Zpc2libGUoKVxuICAgICAgICAgICAgQHNjZW5lLmRlYnVnTGF5ZXIuaGlkZSgpXG4gICAgICAgICAgICBwcmVmcy5zZXQgJ2luc3BlY3RvcicgZmFsc2VcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNjZW5lLmRlYnVnTGF5ZXIuc2hvdyBvdmVybGF5OnRydWUgc2hvd0luc3BlY3Rvcjp0cnVlXG4gICAgICAgICAgICBwcmVmcy5zZXQgJ2luc3BlY3RvcicgdHJ1ZVxuICAgICAgICBcbiAgICBzdGFydDogLT4gQHZpZXcuZm9jdXMoKVxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgYW5pbWF0ZTogPT5cblxuICAgICAgICBpZiBub3QgQHBhdXNlZFxuICAgICAgICAgICAgQHNjZW5lLnJlbmRlcigpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGFuaW1hdGUudGljayBAZW5naW5lLmdldERlbHRhVGltZSgpLzEwMDBcbiAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICByZXNpemVkOiA9PiBcblxuICAgICAgICBAY2FudmFzLndpZHRoID0gQHZpZXcuY2xpZW50V2lkdGhcbiAgICAgICAgQGNhbnZhcy5oZWlnaHQgPSBAdmlldy5jbGllbnRIZWlnaHRcbiAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG1vZEtleUNvbWJvRXZlbnREb3duOiAobW9kLCBrZXksIGNvbWJvLCBldmVudCkgLT5cbiAgICAgICAgXG4gICAgICAgICMga2xvZyAnbW9kS2V5Q29tYm9FdmVudERvd24nIG1vZCwga2V5LCBjb21ibywgZXZlbnQud2hpY2hcbiAgICAgICAgc3dpdGNoIGtleVxuICAgICAgICAgICAgd2hlbiAnZScgdGhlbiBAY2FtZXJhLm1vdmVVcCgpXG4gICAgICAgICAgICB3aGVuICdxJyB0aGVuIEBjYW1lcmEubW92ZURvd24oKVxuICAgICAgICAgICAgd2hlbiAnYScgdGhlbiBAY2FtZXJhLm1vdmVMZWZ0KClcbiAgICAgICAgICAgIHdoZW4gJ2QnIHRoZW4gQGNhbWVyYS5tb3ZlUmlnaHQoKVxuICAgICAgICAgICAgd2hlbiAndycgdGhlbiBAY2FtZXJhLm1vdmVGb3J3YXJkKClcbiAgICAgICAgICAgIHdoZW4gJ3MnIHRoZW4gQGNhbWVyYS5tb3ZlQmFja3dhcmQoKVxuICAgICAgICAgICAgd2hlbiAneCcgJ2VzYycgdGhlbiBAY2FtZXJhLnN0b3BNb3ZpbmcoKVxuICAgICAgICBcbiAgICBtb2RLZXlDb21ib0V2ZW50VXA6IChtb2QsIGtleSwgY29tYm8sIGV2ZW50KSAtPlxuXG4gICAgICAgIHN3aXRjaCBrZXlcbiAgICAgICAgICAgIHdoZW4gJ2UnIHRoZW4gQGNhbWVyYS5zdG9wVXAoKVxuICAgICAgICAgICAgd2hlbiAncScgdGhlbiBAY2FtZXJhLnN0b3BEb3duKClcbiAgICAgICAgICAgIHdoZW4gJ2EnIHRoZW4gQGNhbWVyYS5zdG9wTGVmdCgpXG4gICAgICAgICAgICB3aGVuICdkJyB0aGVuIEBjYW1lcmEuc3RvcFJpZ2h0KClcbiAgICAgICAgICAgIHdoZW4gJ3cnIHRoZW4gQGNhbWVyYS5zdG9wRm9yd2FyZCgpXG4gICAgICAgICAgICB3aGVuICdzJyB0aGVuIEBjYW1lcmEuc3RvcEJhY2t3YXJkKClcbiAgICAgICAgXG4gICAgICAgICMga2xvZyAnbW9kS2V5Q29tYm9FdmVudFVwJyBtb2QsIGtleSwgY29tYm8sIGV2ZW50LmNvZGVcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFdvcmxkXG4iXX0=
//# sourceURL=../coffee/world.coffee