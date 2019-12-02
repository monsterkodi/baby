// koffee 1.4.0

/*
000   000   0000000   00000000   000      0000000    
000 0 000  000   000  000   000  000      000   000  
000000000  000   000  0000000    000      000   000  
000   000  000   000  000   000  000      000   000  
00     00   0000000   000   000  0000000  0000000
 */
var AmbientLight, ArcRotateCamera, Color3, DirectionalLight, Engine, FlyCamera, FramingBehavior, HemisphericLight, Mesh, MeshBuilder, PolyGen, Scene, ShadowGenerator, SimplificationType, SpotLight, StandardMaterial, Vector3, World, _, elem, klog, poly, prefs, ref, ref1,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('kxk'), prefs = ref.prefs, elem = ref.elem, klog = ref.klog, _ = ref._;

ref1 = require('babylonjs'), Engine = ref1.Engine, Scene = ref1.Scene, Color3 = ref1.Color3, Vector3 = ref1.Vector3, FramingBehavior = ref1.FramingBehavior, Mesh = ref1.Mesh, SimplificationType = ref1.SimplificationType, DirectionalLight = ref1.DirectionalLight, AmbientLight = ref1.AmbientLight, ShadowGenerator = ref1.ShadowGenerator, StandardMaterial = ref1.StandardMaterial, MeshBuilder = ref1.MeshBuilder, HemisphericLight = ref1.HemisphericLight, SpotLight = ref1.SpotLight, ArcRotateCamera = ref1.ArcRotateCamera, FlyCamera = ref1.FlyCamera;

poly = require('./poly');

PolyGen = require('./polygen');

World = (function() {
    function World(view) {
        var a, box, c, ground, i, j, k, l, light, light0, m, n, o, p, shadowGenerator, sphere, truncated, v, x, z;
        this.view = view;
        this.resized = bind(this.resized, this);
        this.animate = bind(this.animate, this);
        this.onMouseUp = bind(this.onMouseUp, this);
        this.onMouseDown = bind(this.onMouseDown, this);
        this.paused = false;
        this.view.focus();
        this.canvas = elem('canvas', {
            "class": 'babylon',
            parent: this.view
        });
        window.addEventListener('pointerdown', this.onMouseDown);
        window.addEventListener('pointerup', this.onMouseUp);
        this.resized();
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);
        a = 0.06;
        this.scene.clearColor = new Color3(a, a, a);
        if (1) {
            this.camera = new ArcRotateCamera("Camera", 0, 0, 0, Vector3.Zero(), this.scene);
            this.camera.lowerRadiusLimit = 2;
            this.camera.upperRadiusLimit = 100;
            this.camera.setPosition(new Vector3(0, 0, -10));
            this.camera.useFramingBehavior = true;
            FramingBehavior.mode = FramingBehavior.FitFrustumSidesMode;
            FramingBehavior.radiusScale = 4;
        } else {
            this.camera = new FlyCamera("FlyCamera", new Vector3(0, 0, -10), this.scene);
        }
        this.camera.attachControl(this.canvas, false);
        this.camera.wheelDeltaPercentage = 0.02;
        this.camera.inertia = 0.7;
        this.camera.speed = 1;
        light0 = new HemisphericLight('light1', new Vector3(0, 1, 0), this.scene);
        light0.intensity = 1;
        light = new DirectionalLight('light', new Vector3(0, -1, 0), this.scene);
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
        if (0) {
            sphere = MeshBuilder.CreateSphere('sphere', {
                diameter: 1
            }, this.scene);
            sphere.material = new StandardMaterial("mat", this.scene);
            sphere.material.diffuseColor = new Color3(1, 1, 0);
            sphere.material.specularPower = 6;
            sphere.translate(new Vector3(0, 1, 0), 2);
            sphere.receiveShadows = true;
            shadowGenerator.addShadowCaster(sphere);
            box = MeshBuilder.CreateBox('box', {}, this.scene);
            box.material = new StandardMaterial("boxMat", this.scene);
            box.material.diffuseColor = new Color3(1, 0, 0);
            box.translate(new Vector3(1, 1, 0), 2);
            box.receiveShadows = true;
            shadowGenerator.addShadowCaster(box);
            box = MeshBuilder.CreateBox('box', {}, this.scene);
            box.material = new StandardMaterial("boxMat", this.scene);
            box.material.diffuseColor = new Color3(0, 1, 0);
            box.translate(new Vector3(0, 2, 0), 2);
            box.receiveShadows = true;
            shadowGenerator.addShadowCaster(box);
            box = MeshBuilder.CreateBox('box', {}, this.scene);
            box.material = new StandardMaterial("boxMat", this.scene);
            box.material.diffuseColor = new Color3(0, 0, 1);
            box.translate(new Vector3(0, 1, 1), 2);
            box.receiveShadows = true;
            shadowGenerator.addShadowCaster(box);
        }
        i = 0;
        z = 0;
        x = 0;
        for (k in poly) {
            v = poly[k];
            p = Mesh.CreatePolyhedron(k, {
                custom: poly[k]
            }, this.scene);
            p.receiveShadows = true;
            shadowGenerator.addShadowCaster(p);
            p.material = new StandardMaterial("mat", this.scene);
            c = (function() {
                switch (poly[k].category) {
                    case "Platonic Solid":
                        return new Color3(0.1, 0.1, 0.1);
                    case "Archimedean Solid":
                        return new Color3(1, 1, 1);
                    case "Johnson Solid":
                        return new Color3(1, 0, 0);
                    case "Antiprism":
                        return new Color3(0, 0.3, 0);
                    case "Prism":
                        return new Color3(1, 1, 0);
                    case "Disk":
                        return new Color3(0, 0, 1);
                    default:
                        return new Color3(0, 0, 1);
                }
            })();
            p.material.diffuseColor = c;
            p.position.x = x;
            p.position.z = z;
            p.position.y = -3;
            x += 3;
            i++;
            if (i > 9) {
                i = 0;
                x = 0;
                z += 3;
            }
        }
        p = Mesh.CreatePolyhedron("tetrahedron", {
            custom: PolyGen.tetrahedron
        }, this.scene);
        p.receiveShadows = true;
        shadowGenerator.addShadowCaster(p);
        p.material = new StandardMaterial('mat', this.scene);
        p.material.diffuseColor = new Color3(1, 1, 0);
        p = Mesh.CreatePolyhedron("cube", {
            custom: PolyGen.cube
        }, this.scene);
        p.receiveShadows = true;
        p.position.x = 3;
        shadowGenerator.addShadowCaster(p);
        p.material = new StandardMaterial('mat', this.scene);
        p.material.diffuseColor = new Color3(1, 1, 0);
        p = Mesh.CreatePolyhedron("octahedron", {
            custom: PolyGen.octahedron
        }, this.scene);
        p.receiveShadows = true;
        p.position.x = 6;
        shadowGenerator.addShadowCaster(p);
        p.material = new StandardMaterial('mat', this.scene);
        p.material.diffuseColor = new Color3(1, 1, 0);
        p = Mesh.CreatePolyhedron("dodecahedron", {
            custom: PolyGen.dodecahedron()
        }, this.scene);
        p.receiveShadows = true;
        p.position.x = 9;
        shadowGenerator.addShadowCaster(p);
        p.material = new StandardMaterial('mat', this.scene);
        p.material.diffuseColor = new Color3(1, 1, 0);
        if (0) {
            p = Mesh.CreatePolyhedron("dodecahedron0", {
                custom: PolyGen.dodecahedron(0)
            }, this.scene);
            p.receiveShadows = true;
            p.position.x = 9;
            p.position.z = -3;
            shadowGenerator.addShadowCaster(p);
            p.material = new StandardMaterial('mat', this.scene);
            p.material.diffuseColor = new Color3(1, 1, 0);
            p = Mesh.CreatePolyhedron("dodecahedron1", {
                custom: PolyGen.dodecahedron(1)
            }, this.scene);
            p.receiveShadows = true;
            p.position.x = 9;
            p.position.z = 3;
            shadowGenerator.addShadowCaster(p);
            p.material = new StandardMaterial('mat', this.scene);
            p.material.diffuseColor = new Color3(1, 1, 0);
        }
        p = Mesh.CreatePolyhedron("icosahedron", {
            custom: PolyGen.icosahedron()
        }, this.scene);
        p.receiveShadows = true;
        p.position.x = 12;
        shadowGenerator.addShadowCaster(p);
        p.material = new StandardMaterial('mat', this.scene);
        p.material.diffuseColor = new Color3(1, 1, 0);
        this.engine.runRenderLoop(this.animate);
        if (0) {
            PolyGen.neighbors(PolyGen.tetrahedron);
            PolyGen.neighbors(PolyGen.cube);
            PolyGen.neighbors(PolyGen.octahedron);
            PolyGen.neighbors(PolyGen.dodecahedron());
            PolyGen.neighbors(PolyGen.icosahedron());
            return;
        }
        for (i = j = 0; j <= 10; i = ++j) {
            truncated = PolyGen.truncate(_.cloneDeep(PolyGen.tetrahedron), i * 0.1);
            p = Mesh.CreatePolyhedron("icosahedron", {
                custom: truncated
            }, this.scene);
            p.convertToFlatShadedMesh();
            p.receiveShadows = true;
            p.position.z = -3 * (i - 0);
            shadowGenerator.addShadowCaster(p);
            p.material = new StandardMaterial('mat', this.scene);
            p.material.diffuseColor = new Color3(0, 1, 1);
            if (prefs.get('inspector')) {
                this.toggleInspector();
            }
        }
        for (i = l = 0; l <= 10; i = ++l) {
            truncated = PolyGen.truncate(_.cloneDeep(PolyGen.cube), i * 0.1);
            p = Mesh.CreatePolyhedron("icosahedron", {
                custom: truncated
            }, this.scene);
            p.convertToFlatShadedMesh();
            p.receiveShadows = true;
            p.position.x = 3;
            p.position.z = -3 * (i - 0);
            shadowGenerator.addShadowCaster(p);
            p.material = new StandardMaterial('mat', this.scene);
            p.material.diffuseColor = new Color3(1, 0, 1);
            if (prefs.get('inspector')) {
                this.toggleInspector();
            }
        }
        for (i = m = 0; m <= 10; i = ++m) {
            truncated = PolyGen.truncate(_.cloneDeep(PolyGen.octahedron), i * 0.1);
            p = Mesh.CreatePolyhedron("icosahedron", {
                custom: truncated
            }, this.scene);
            p.convertToFlatShadedMesh();
            p.receiveShadows = true;
            p.position.x = 6;
            p.position.z = -3 * (i - 0);
            shadowGenerator.addShadowCaster(p);
            p.material = new StandardMaterial('mat', this.scene);
            p.material.diffuseColor = new Color3(1, 1, 0);
            if (prefs.get('inspector')) {
                this.toggleInspector();
            }
        }
        for (i = n = 0; n <= 10; i = ++n) {
            truncated = PolyGen.truncate(PolyGen.dodecahedron(), i * 0.1);
            p = Mesh.CreatePolyhedron("icosahedron", {
                custom: truncated
            }, this.scene);
            p.convertToFlatShadedMesh();
            p.receiveShadows = true;
            p.position.x = 9;
            p.position.z = -3 * (i - 0);
            shadowGenerator.addShadowCaster(p);
            p.material = new StandardMaterial('mat', this.scene);
            p.material.diffuseColor = new Color3(0, 0, 1);
            if (prefs.get('inspector')) {
                this.toggleInspector();
            }
        }
        for (i = o = 0; o <= 10; i = ++o) {
            truncated = PolyGen.truncate(PolyGen.icosahedron(), i * 0.1);
            p = Mesh.CreatePolyhedron("icosahedron", {
                custom: truncated
            }, this.scene);
            p.convertToFlatShadedMesh();
            p.receiveShadows = true;
            p.position.x = 12;
            p.position.z = -3 * (i - 0);
            shadowGenerator.addShadowCaster(p);
            p.material = new StandardMaterial('mat', this.scene);
            p.material.diffuseColor = new Color3(1, 0, 0);
            if (prefs.get('inspector')) {
                this.toggleInspector();
            }
        }
    }

    World.prototype.onMouseDown = function(event) {
        var result;
        result = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
        return this.mouseDownMesh = result.pickedMesh;
    };

    World.prototype.onMouseUp = function(event) {
        var mesh, result;
        result = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
        if (mesh = result.pickedMesh) {
            if (mesh.name !== 'ground' && mesh === this.mouseDownMesh) {
                return this.camera.setTarget(mesh);
            }
        }
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
            return this.scene.render();
        }
    };

    World.prototype.resized = function() {
        this.canvas.width = this.view.clientWidth;
        return this.canvas.height = this.view.clientHeight;
    };

    World.prototype.modKeyComboEventDown = function(mod, key, combo, event) {
        return klog('modKeyComboEventDown', mod, key, combo, event);
    };

    World.prototype.modKeyComboEventUp = function(mod, key, combo, event) {
        return klog('modKeyComboEventUp', mod, key, combo, event);
    };

    return World;

})();

module.exports = World;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ybGQuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHlRQUFBO0lBQUE7O0FBUUEsTUFBMkIsT0FBQSxDQUFRLEtBQVIsQ0FBM0IsRUFBRSxpQkFBRixFQUFTLGVBQVQsRUFBZSxlQUFmLEVBQXFCOztBQUVyQixPQUF5TixPQUFBLENBQVEsV0FBUixDQUF6TixFQUFFLG9CQUFGLEVBQVUsa0JBQVYsRUFBaUIsb0JBQWpCLEVBQXlCLHNCQUF6QixFQUFrQyxzQ0FBbEMsRUFBbUQsZ0JBQW5ELEVBQXlELDRDQUF6RCxFQUE2RSx3Q0FBN0UsRUFBK0YsZ0NBQS9GLEVBQTZHLHNDQUE3RyxFQUE4SCx3Q0FBOUgsRUFBZ0osOEJBQWhKLEVBQTZKLHdDQUE3SixFQUErSywwQkFBL0ssRUFBMEwsc0NBQTFMLEVBQTJNOztBQUUzTSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0FBQ1AsT0FBQSxHQUFVLE9BQUEsQ0FBUSxXQUFSOztBQUVKO0lBRUMsZUFBQyxJQUFEO0FBRUMsWUFBQTtRQUZBLElBQUMsQ0FBQSxPQUFEOzs7OztRQUVBLElBQUMsQ0FBQSxNQUFELEdBQVU7UUFDVixJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sQ0FBQTtRQUVBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQSxDQUFLLFFBQUwsRUFBYztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU0sU0FBTjtZQUFnQixNQUFBLEVBQU8sSUFBQyxDQUFBLElBQXhCO1NBQWQ7UUFFVixNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsYUFBeEIsRUFBc0MsSUFBQyxDQUFBLFdBQXZDO1FBQ0EsTUFBTSxDQUFDLGdCQUFQLENBQXdCLFdBQXhCLEVBQXNDLElBQUMsQ0FBQSxTQUF2QztRQUVBLElBQUMsQ0FBQSxPQUFELENBQUE7UUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUksTUFBSixDQUFXLElBQUMsQ0FBQSxNQUFa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LEtBQTdDO0lBRmtCOztvQkFJdEIsa0JBQUEsR0FBb0IsU0FBQyxHQUFELEVBQU0sR0FBTixFQUFXLEtBQVgsRUFBa0IsS0FBbEI7ZUFFaEIsSUFBQSxDQUFLLG9CQUFMLEVBQTBCLEdBQTFCLEVBQStCLEdBQS9CLEVBQW9DLEtBQXBDLEVBQTJDLEtBQTNDO0lBRmdCOzs7Ozs7QUFJeEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAgICAgXG4wMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgXG4wMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyMjXG5cbnsgcHJlZnMsIGVsZW0sIGtsb2csIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxueyBFbmdpbmUsIFNjZW5lLCBDb2xvcjMsIFZlY3RvcjMsIEZyYW1pbmdCZWhhdmlvciwgTWVzaCwgU2ltcGxpZmljYXRpb25UeXBlLCBEaXJlY3Rpb25hbExpZ2h0LCBBbWJpZW50TGlnaHQsIFNoYWRvd0dlbmVyYXRvciwgU3RhbmRhcmRNYXRlcmlhbCwgTWVzaEJ1aWxkZXIsIEhlbWlzcGhlcmljTGlnaHQsIFNwb3RMaWdodCwgQXJjUm90YXRlQ2FtZXJhLCBGbHlDYW1lcmEgfSA9IHJlcXVpcmUgJ2JhYnlsb25qcydcblxucG9seSA9IHJlcXVpcmUgJy4vcG9seSdcblBvbHlHZW4gPSByZXF1aXJlICcuL3BvbHlnZW4nXG5cbmNsYXNzIFdvcmxkXG4gICAgXG4gICAgQDogKEB2aWV3KSAtPlxuICAgICAgICBcbiAgICAgICAgQHBhdXNlZCA9IGZhbHNlXG4gICAgICAgIEB2aWV3LmZvY3VzKClcbiAgICAgICAgXG4gICAgICAgIEBjYW52YXMgPSBlbGVtICdjYW52YXMnIGNsYXNzOidiYWJ5bG9uJyBwYXJlbnQ6QHZpZXdcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdwb2ludGVyZG93bicgQG9uTW91c2VEb3duXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdwb2ludGVydXAnICAgQG9uTW91c2VVcFxuXG4gICAgICAgIEByZXNpemVkKClcbiAgICAgICAgQGVuZ2luZSA9IG5ldyBFbmdpbmUgQGNhbnZhcywgdHJ1ZVxuICAgICAgICBcclxuICAgICAgICBAc2NlbmUgPSBuZXcgU2NlbmUgQGVuZ2luZSBcclxuICAgICAgICBcbiAgICAgICAgYSA9IDAuMDZcbiAgICAgICAgQHNjZW5lLmNsZWFyQ29sb3IgPSBuZXcgQ29sb3IzIGEsIGEsIGFcblxuICAgICAgICBpZiAxXG4gICAgICAgICAgICBAY2FtZXJhID0gbmV3IEFyY1JvdGF0ZUNhbWVyYSBcIkNhbWVyYVwiLCAwIDAgMCBWZWN0b3IzLlplcm8oKSwgQHNjZW5lXG4gICAgICAgICAgICBAY2FtZXJhLmxvd2VyUmFkaXVzTGltaXQgPSAyXG4gICAgICAgICAgICBAY2FtZXJhLnVwcGVyUmFkaXVzTGltaXQgPSAxMDBcbiAgICAgICAgICAgIEBjYW1lcmEuc2V0UG9zaXRpb24gbmV3IFZlY3RvcjMgMCAwLCAtMTBcbiAgICAgICAgICAgIEBjYW1lcmEudXNlRnJhbWluZ0JlaGF2aW9yID0gdHJ1ZVxuICAgICAgICAgICAgRnJhbWluZ0JlaGF2aW9yLm1vZGUgPSBGcmFtaW5nQmVoYXZpb3IuRml0RnJ1c3R1bVNpZGVzTW9kZVxuICAgICAgICAgICAgRnJhbWluZ0JlaGF2aW9yLnJhZGl1c1NjYWxlID0gNFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAY2FtZXJhID0gbmV3IEZseUNhbWVyYSBcIkZseUNhbWVyYVwiLCBuZXcgVmVjdG9yMygwLCAwLCAtMTApLCBAc2NlbmVcbiAgICAgICAgQGNhbWVyYS5hdHRhY2hDb250cm9sIEBjYW52YXMsIGZhbHNlXG4gICAgICAgIEBjYW1lcmEud2hlZWxEZWx0YVBlcmNlbnRhZ2UgPSAwLjAyXG4gICAgICAgIEBjYW1lcmEuaW5lcnRpYSA9IDAuN1xuICAgICAgICBAY2FtZXJhLnNwZWVkID0gMVxuXG4gICAgICAgIGxpZ2h0MCA9IG5ldyBIZW1pc3BoZXJpY0xpZ2h0ICdsaWdodDEnIG5ldyBWZWN0b3IzKDAsIDEsIDApLCBAc2NlbmVcbiAgICAgICAgbGlnaHQwLmludGVuc2l0eSA9IDFcbiAgICAgICAgbGlnaHQgPSBuZXcgRGlyZWN0aW9uYWxMaWdodCAnbGlnaHQnIG5ldyBWZWN0b3IzKDAsIC0xLCAwKSwgQHNjZW5lXG4gICAgICAgIGxpZ2h0LnBvc2l0aW9uLnkgPSAxMDBcbiAgICAgICAgbGlnaHQuaW50ZW5zaXR5ID0gMC4xXG4gICAgICAgIFxuICAgICAgICBzaGFkb3dHZW5lcmF0b3IgPSBuZXcgU2hhZG93R2VuZXJhdG9yIDgqMTAyNCwgbGlnaHRcbiAgICAgICAgc2hhZG93R2VuZXJhdG9yLnVzZUV4cG9uZW50aWFsU2hhZG93TWFwID0gdHJ1ZVxuICAgICAgICBzaGFkb3dHZW5lcmF0b3IudXNlUG9pc3NvblNhbXBsaW5nID0gdHJ1ZVxuICAgICAgICBzaGFkb3dHZW5lcmF0b3IudXNlUGVyY2VudGFnZUNsb3NlckZpbHRlcmluZyA9IHRydWVcbiAgICAgICAgc2hhZG93R2VuZXJhdG9yLnVzZUNvbnRhY3RIYXJkZW5pbmdTaGFkb3cgPSB0cnVlXG4gICAgICAgIFxuICAgICAgICBncm91bmQgPSBNZXNoQnVpbGRlci5DcmVhdGVHcm91bmQgXCJncm91bmRcIiB7d2lkdGg6MTAwMCBoZWlnaHQ6MTAwMCBzdWJkaXZpc2lvbnM6IDR9LCBAc2NlbmVcbiAgICAgICAgZ3JvdW5kLm1hdGVyaWFsID0gbmV3IFN0YW5kYXJkTWF0ZXJpYWwgXCJtYXRcIiwgQHNjZW5lXG4gICAgICAgIGdyb3VuZC5tYXRlcmlhbC5zcGVjdWxhckNvbG9yID0gbmV3IENvbG9yMyAwLjA1IDAuMDUgMC4wNVxuICAgICAgICBhID0gMC4wNVxuICAgICAgICBncm91bmQubWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gbmV3IENvbG9yMyBhLCBhLCBhXG4gICAgICAgIGdyb3VuZC5yZWNlaXZlU2hhZG93cyA9IHRydWVcbiAgICAgICAgZ3JvdW5kLnBvc2l0aW9uLnkgPSAtNFxuXG4gICAgICAgIGlmIDBcbiAgICAgICAgICAgIHNwaGVyZSA9IE1lc2hCdWlsZGVyLkNyZWF0ZVNwaGVyZSAnc3BoZXJlJyB7IGRpYW1ldGVyOiAxIH0sIEBzY2VuZVxuICAgICAgICAgICAgc3BoZXJlLm1hdGVyaWFsID0gbmV3IFN0YW5kYXJkTWF0ZXJpYWwgXCJtYXRcIiwgQHNjZW5lXG4gICAgICAgICAgICBzcGhlcmUubWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gbmV3IENvbG9yMyAxIDEgMFxuICAgICAgICAgICAgc3BoZXJlLm1hdGVyaWFsLnNwZWN1bGFyUG93ZXIgPSA2XG4gICAgICAgICAgICBzcGhlcmUudHJhbnNsYXRlIG5ldyBWZWN0b3IzKDAgMSAwKSwgMlxuICAgICAgICAgICAgc3BoZXJlLnJlY2VpdmVTaGFkb3dzID0gdHJ1ZVxuICAgICAgICAgICAgc2hhZG93R2VuZXJhdG9yLmFkZFNoYWRvd0Nhc3RlciBzcGhlcmVcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYm94ID0gTWVzaEJ1aWxkZXIuQ3JlYXRlQm94ICdib3gnIHt9LCBAc2NlbmVcbiAgICAgICAgICAgIGJveC5tYXRlcmlhbCA9IG5ldyBTdGFuZGFyZE1hdGVyaWFsIFwiYm94TWF0XCIsIEBzY2VuZVxuICAgICAgICAgICAgYm94Lm1hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IG5ldyBDb2xvcjMgMSAwIDBcbiAgICAgICAgICAgIGJveC50cmFuc2xhdGUgbmV3IFZlY3RvcjMoMSAxIDApLCAyXG4gICAgICAgICAgICBib3gucmVjZWl2ZVNoYWRvd3MgPSB0cnVlICAgICAgICBcbiAgICAgICAgICAgIHNoYWRvd0dlbmVyYXRvci5hZGRTaGFkb3dDYXN0ZXIgYm94XG4gICAgXG4gICAgICAgICAgICBib3ggPSBNZXNoQnVpbGRlci5DcmVhdGVCb3ggJ2JveCcge30sIEBzY2VuZVxuICAgICAgICAgICAgYm94Lm1hdGVyaWFsID0gbmV3IFN0YW5kYXJkTWF0ZXJpYWwgXCJib3hNYXRcIiwgQHNjZW5lXG4gICAgICAgICAgICBib3gubWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gbmV3IENvbG9yMyAwIDEgMFxuICAgICAgICAgICAgYm94LnRyYW5zbGF0ZSBuZXcgVmVjdG9yMygwIDIgMCksIDJcbiAgICAgICAgICAgIGJveC5yZWNlaXZlU2hhZG93cyA9IHRydWUgICAgICAgIFxuICAgICAgICAgICAgc2hhZG93R2VuZXJhdG9yLmFkZFNoYWRvd0Nhc3RlciBib3hcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgYm94ID0gTWVzaEJ1aWxkZXIuQ3JlYXRlQm94ICdib3gnIHt9LCBAc2NlbmVcbiAgICAgICAgICAgIGJveC5tYXRlcmlhbCA9IG5ldyBTdGFuZGFyZE1hdGVyaWFsIFwiYm94TWF0XCIsIEBzY2VuZVxuICAgICAgICAgICAgYm94Lm1hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IG5ldyBDb2xvcjMgMCAwIDFcbiAgICAgICAgICAgIGJveC50cmFuc2xhdGUgbmV3IFZlY3RvcjMoMCAxIDEpLCAyXG4gICAgICAgICAgICBib3gucmVjZWl2ZVNoYWRvd3MgPSB0cnVlICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgc2hhZG93R2VuZXJhdG9yLmFkZFNoYWRvd0Nhc3RlciBib3hcbiAgICAgICAgICAgICBcbiAgICAgICAgaSA9IDBcbiAgICAgICAgeiA9IDBcbiAgICAgICAgeCA9IDBcbiAgICAgICAgZm9yIGssdiBvZiBwb2x5XG4gICAgICAgICMgZm9yIGsgaW4gWydDdWJvY3RhaGVkcm9uJywgJ1RydW5jYXRlZEN1Ym9jdGFoZWRyb24nXVxuICAgICAgICAjIGZvciBrIGluIFsnVGV0cmFoZWRyb24nICdDdWJlJyAnT2N0YWhlZHJvbicgJ0RvZGVjYWhlZHJvbicgJ0ljb3NhaGVkcm9uJ11cbiAgICAgICAgICAgIHAgPSBNZXNoLkNyZWF0ZVBvbHloZWRyb24gaywge2N1c3RvbTogcG9seVtrXX0sIEBzY2VuZVxuICAgICAgICAgICAgcC5yZWNlaXZlU2hhZG93cyA9IHRydWVcbiAgICAgICAgICAgIHNoYWRvd0dlbmVyYXRvci5hZGRTaGFkb3dDYXN0ZXIgcFxuICAgICAgICAgICAgcC5tYXRlcmlhbCA9IG5ldyBTdGFuZGFyZE1hdGVyaWFsIFwibWF0XCIsIEBzY2VuZVxuICAgICAgICAgICAgYyA9IHN3aXRjaCBwb2x5W2tdLmNhdGVnb3J5XG4gICAgICAgICAgICAgICAgd2hlbiBcIlBsYXRvbmljIFNvbGlkXCIgdGhlbiBuZXcgQ29sb3IzIDAuMSAwLjEgMC4xXG4gICAgICAgICAgICAgICAgd2hlbiBcIkFyY2hpbWVkZWFuIFNvbGlkXCIgdGhlbiBuZXcgQ29sb3IzIDEgMSAxXG4gICAgICAgICAgICAgICAgd2hlbiBcIkpvaG5zb24gU29saWRcIiB0aGVuIG5ldyBDb2xvcjMgMSAwIDBcbiAgICAgICAgICAgICAgICB3aGVuIFwiQW50aXByaXNtXCIgdGhlbiBuZXcgQ29sb3IzIDAgMC4zIDBcbiAgICAgICAgICAgICAgICB3aGVuIFwiUHJpc21cIiB0aGVuIG5ldyBDb2xvcjMgMSAxIDBcbiAgICAgICAgICAgICAgICB3aGVuIFwiRGlza1wiIHRoZW4gbmV3IENvbG9yMyAwIDAgMVxuICAgICAgICAgICAgICAgIGVsc2UgbmV3IENvbG9yMyAwIDAgMVxuICAgICAgICAgICAgcC5tYXRlcmlhbC5kaWZmdXNlQ29sb3IgPSBjXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHAucG9zaXRpb24ueCA9IHhcbiAgICAgICAgICAgIHAucG9zaXRpb24ueiA9IHpcbiAgICAgICAgICAgIHAucG9zaXRpb24ueSA9IC0zXG4gICAgICAgICAgICB4ICs9IDNcbiAgICAgICAgICAgIGkrK1xuICAgICAgICAgICAgaWYgaSA+IDlcbiAgICAgICAgICAgICAgICBpID0gMFxuICAgICAgICAgICAgICAgIHggPSAwXG4gICAgICAgICAgICAgICAgeiArPSAzXG5cbiAgICAgICAgcCA9IE1lc2guQ3JlYXRlUG9seWhlZHJvbiBcInRldHJhaGVkcm9uXCIge2N1c3RvbTpQb2x5R2VuLnRldHJhaGVkcm9ufSwgQHNjZW5lXG4gICAgICAgIHAucmVjZWl2ZVNoYWRvd3MgPSB0cnVlXG4gICAgICAgIHNoYWRvd0dlbmVyYXRvci5hZGRTaGFkb3dDYXN0ZXIgcFxuICAgICAgICBwLm1hdGVyaWFsID0gbmV3IFN0YW5kYXJkTWF0ZXJpYWwgJ21hdCcgQHNjZW5lXG4gICAgICAgIHAubWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gbmV3IENvbG9yMyAxIDEgMFxuXG4gICAgICAgIHAgPSBNZXNoLkNyZWF0ZVBvbHloZWRyb24gXCJjdWJlXCIge2N1c3RvbTpQb2x5R2VuLmN1YmV9LCBAc2NlbmVcbiAgICAgICAgcC5yZWNlaXZlU2hhZG93cyA9IHRydWVcbiAgICAgICAgcC5wb3NpdGlvbi54ID0gM1xuICAgICAgICBzaGFkb3dHZW5lcmF0b3IuYWRkU2hhZG93Q2FzdGVyIHBcbiAgICAgICAgcC5tYXRlcmlhbCA9IG5ldyBTdGFuZGFyZE1hdGVyaWFsICdtYXQnIEBzY2VuZVxuICAgICAgICBwLm1hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IG5ldyBDb2xvcjMgMSAxIDBcblxuICAgICAgICBwID0gTWVzaC5DcmVhdGVQb2x5aGVkcm9uIFwib2N0YWhlZHJvblwiIHtjdXN0b206UG9seUdlbi5vY3RhaGVkcm9ufSwgQHNjZW5lXG4gICAgICAgIHAucmVjZWl2ZVNoYWRvd3MgPSB0cnVlXG4gICAgICAgIHAucG9zaXRpb24ueCA9IDZcbiAgICAgICAgc2hhZG93R2VuZXJhdG9yLmFkZFNoYWRvd0Nhc3RlciBwXG4gICAgICAgIHAubWF0ZXJpYWwgPSBuZXcgU3RhbmRhcmRNYXRlcmlhbCAnbWF0JyBAc2NlbmVcbiAgICAgICAgcC5tYXRlcmlhbC5kaWZmdXNlQ29sb3IgPSBuZXcgQ29sb3IzIDEgMSAwXG5cbiAgICAgICAgcCA9IE1lc2guQ3JlYXRlUG9seWhlZHJvbiBcImRvZGVjYWhlZHJvblwiIHtjdXN0b206UG9seUdlbi5kb2RlY2FoZWRyb24oKX0sIEBzY2VuZVxuICAgICAgICBwLnJlY2VpdmVTaGFkb3dzID0gdHJ1ZVxuICAgICAgICBwLnBvc2l0aW9uLnggPSA5XG4gICAgICAgIHNoYWRvd0dlbmVyYXRvci5hZGRTaGFkb3dDYXN0ZXIgcFxuICAgICAgICBwLm1hdGVyaWFsID0gbmV3IFN0YW5kYXJkTWF0ZXJpYWwgJ21hdCcgQHNjZW5lXG4gICAgICAgIHAubWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gbmV3IENvbG9yMyAxIDEgMFxuXG4gICAgICAgIGlmIDBcbiAgICAgICAgICAgIHAgPSBNZXNoLkNyZWF0ZVBvbHloZWRyb24gXCJkb2RlY2FoZWRyb24wXCIge2N1c3RvbTpQb2x5R2VuLmRvZGVjYWhlZHJvbigwKX0sIEBzY2VuZVxuICAgICAgICAgICAgcC5yZWNlaXZlU2hhZG93cyA9IHRydWVcbiAgICAgICAgICAgIHAucG9zaXRpb24ueCA9IDlcbiAgICAgICAgICAgIHAucG9zaXRpb24ueiA9IC0zXG4gICAgICAgICAgICBzaGFkb3dHZW5lcmF0b3IuYWRkU2hhZG93Q2FzdGVyIHBcbiAgICAgICAgICAgIHAubWF0ZXJpYWwgPSBuZXcgU3RhbmRhcmRNYXRlcmlhbCAnbWF0JyBAc2NlbmVcbiAgICAgICAgICAgIHAubWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gbmV3IENvbG9yMyAxIDEgMFxuICAgIFxuICAgICAgICAgICAgcCA9IE1lc2guQ3JlYXRlUG9seWhlZHJvbiBcImRvZGVjYWhlZHJvbjFcIiB7Y3VzdG9tOlBvbHlHZW4uZG9kZWNhaGVkcm9uKDEpfSwgQHNjZW5lXG4gICAgICAgICAgICBwLnJlY2VpdmVTaGFkb3dzID0gdHJ1ZVxuICAgICAgICAgICAgcC5wb3NpdGlvbi54ID0gOVxuICAgICAgICAgICAgcC5wb3NpdGlvbi56ID0gM1xuICAgICAgICAgICAgc2hhZG93R2VuZXJhdG9yLmFkZFNoYWRvd0Nhc3RlciBwXG4gICAgICAgICAgICBwLm1hdGVyaWFsID0gbmV3IFN0YW5kYXJkTWF0ZXJpYWwgJ21hdCcgQHNjZW5lXG4gICAgICAgICAgICBwLm1hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IG5ldyBDb2xvcjMgMSAxIDBcblxuICAgICAgICBwID0gTWVzaC5DcmVhdGVQb2x5aGVkcm9uIFwiaWNvc2FoZWRyb25cIiB7Y3VzdG9tOlBvbHlHZW4uaWNvc2FoZWRyb24oKX0sIEBzY2VuZVxuICAgICAgICBwLnJlY2VpdmVTaGFkb3dzID0gdHJ1ZVxuICAgICAgICBwLnBvc2l0aW9uLnggPSAxMlxuICAgICAgICBzaGFkb3dHZW5lcmF0b3IuYWRkU2hhZG93Q2FzdGVyIHBcbiAgICAgICAgcC5tYXRlcmlhbCA9IG5ldyBTdGFuZGFyZE1hdGVyaWFsICdtYXQnIEBzY2VuZVxuICAgICAgICBwLm1hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IG5ldyBDb2xvcjMgMSAxIDBcbiAgICAgICAgXG4gICAgICAgIEBlbmdpbmUucnVuUmVuZGVyTG9vcCBAYW5pbWF0ZVxuICAgICBcbiAgICAgICAgaWYgMFxuICAgICAgICAgICAgUG9seUdlbi5uZWlnaGJvcnMgUG9seUdlbi50ZXRyYWhlZHJvblxuICAgICAgICAgICAgUG9seUdlbi5uZWlnaGJvcnMgUG9seUdlbi5jdWJlXG4gICAgICAgICAgICBQb2x5R2VuLm5laWdoYm9ycyBQb2x5R2VuLm9jdGFoZWRyb25cbiAgICAgICAgICAgIFBvbHlHZW4ubmVpZ2hib3JzIFBvbHlHZW4uZG9kZWNhaGVkcm9uKClcbiAgICAgICAgICAgIFBvbHlHZW4ubmVpZ2hib3JzIFBvbHlHZW4uaWNvc2FoZWRyb24oKVxuICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgZm9yIGkgaW4gWzAuLjEwXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0cnVuY2F0ZWQgPSBQb2x5R2VuLnRydW5jYXRlIF8uY2xvbmVEZWVwKFBvbHlHZW4udGV0cmFoZWRyb24pLCBpKjAuMVxuICAgIFxuICAgICAgICAgICAgcCA9IE1lc2guQ3JlYXRlUG9seWhlZHJvbiBcImljb3NhaGVkcm9uXCIge2N1c3RvbTp0cnVuY2F0ZWR9LCBAc2NlbmVcbiAgICAgICAgICAgIHAuY29udmVydFRvRmxhdFNoYWRlZE1lc2goKVxuICAgICAgICAgICAgcC5yZWNlaXZlU2hhZG93cyA9IHRydWVcbiAgICAgICAgICAgIHAucG9zaXRpb24ueiA9IC0zKihpLTApXG4gICAgICAgICAgICBzaGFkb3dHZW5lcmF0b3IuYWRkU2hhZG93Q2FzdGVyIHBcbiAgICAgICAgICAgIHAubWF0ZXJpYWwgPSBuZXcgU3RhbmRhcmRNYXRlcmlhbCAnbWF0JyBAc2NlbmVcbiAgICAgICAgICAgIHAubWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gbmV3IENvbG9yMyAwIDEgMVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBwcmVmcy5nZXQgJ2luc3BlY3RvcidcbiAgICAgICAgICAgICAgICBAdG9nZ2xlSW5zcGVjdG9yKClcbiAgICAgICAgICAgIFxuICAgICAgICBmb3IgaSBpbiBbMC4uMTBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRydW5jYXRlZCA9IFBvbHlHZW4udHJ1bmNhdGUgXy5jbG9uZURlZXAoUG9seUdlbi5jdWJlKSwgaSowLjFcbiAgICBcbiAgICAgICAgICAgIHAgPSBNZXNoLkNyZWF0ZVBvbHloZWRyb24gXCJpY29zYWhlZHJvblwiIHtjdXN0b206dHJ1bmNhdGVkfSwgQHNjZW5lXG4gICAgICAgICAgICBwLmNvbnZlcnRUb0ZsYXRTaGFkZWRNZXNoKClcbiAgICAgICAgICAgIHAucmVjZWl2ZVNoYWRvd3MgPSB0cnVlXG4gICAgICAgICAgICBwLnBvc2l0aW9uLnggPSAgM1xuICAgICAgICAgICAgcC5wb3NpdGlvbi56ID0gLTMqKGktMClcbiAgICAgICAgICAgIHNoYWRvd0dlbmVyYXRvci5hZGRTaGFkb3dDYXN0ZXIgcFxuICAgICAgICAgICAgcC5tYXRlcmlhbCA9IG5ldyBTdGFuZGFyZE1hdGVyaWFsICdtYXQnIEBzY2VuZVxuICAgICAgICAgICAgcC5tYXRlcmlhbC5kaWZmdXNlQ29sb3IgPSBuZXcgQ29sb3IzIDEgMCAxXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHByZWZzLmdldCAnaW5zcGVjdG9yJ1xuICAgICAgICAgICAgICAgIEB0b2dnbGVJbnNwZWN0b3IoKVxuXG4gICAgICAgIGZvciBpIGluIFswLi4xMF1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdHJ1bmNhdGVkID0gUG9seUdlbi50cnVuY2F0ZSBfLmNsb25lRGVlcChQb2x5R2VuLm9jdGFoZWRyb24pLCBpKjAuMVxuICAgIFxuICAgICAgICAgICAgcCA9IE1lc2guQ3JlYXRlUG9seWhlZHJvbiBcImljb3NhaGVkcm9uXCIge2N1c3RvbTp0cnVuY2F0ZWR9LCBAc2NlbmVcbiAgICAgICAgICAgIHAuY29udmVydFRvRmxhdFNoYWRlZE1lc2goKVxuICAgICAgICAgICAgcC5yZWNlaXZlU2hhZG93cyA9IHRydWVcbiAgICAgICAgICAgIHAucG9zaXRpb24ueCA9ICA2XG4gICAgICAgICAgICBwLnBvc2l0aW9uLnogPSAtMyooaS0wKVxuICAgICAgICAgICAgc2hhZG93R2VuZXJhdG9yLmFkZFNoYWRvd0Nhc3RlciBwXG4gICAgICAgICAgICBwLm1hdGVyaWFsID0gbmV3IFN0YW5kYXJkTWF0ZXJpYWwgJ21hdCcgQHNjZW5lXG4gICAgICAgICAgICBwLm1hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IG5ldyBDb2xvcjMgMSAxIDBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgcHJlZnMuZ2V0ICdpbnNwZWN0b3InXG4gICAgICAgICAgICAgICAgQHRvZ2dsZUluc3BlY3RvcigpXG5cbiAgICAgICAgZm9yIGkgaW4gWzAuLjEwXVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0cnVuY2F0ZWQgPSBQb2x5R2VuLnRydW5jYXRlIFBvbHlHZW4uZG9kZWNhaGVkcm9uKCksIGkqMC4xXG4gICAgXG4gICAgICAgICAgICBwID0gTWVzaC5DcmVhdGVQb2x5aGVkcm9uIFwiaWNvc2FoZWRyb25cIiB7Y3VzdG9tOnRydW5jYXRlZH0sIEBzY2VuZVxuICAgICAgICAgICAgcC5jb252ZXJ0VG9GbGF0U2hhZGVkTWVzaCgpXG4gICAgICAgICAgICBwLnJlY2VpdmVTaGFkb3dzID0gdHJ1ZVxuICAgICAgICAgICAgcC5wb3NpdGlvbi54ID0gIDlcbiAgICAgICAgICAgIHAucG9zaXRpb24ueiA9IC0zKihpLTApXG4gICAgICAgICAgICBzaGFkb3dHZW5lcmF0b3IuYWRkU2hhZG93Q2FzdGVyIHBcbiAgICAgICAgICAgIHAubWF0ZXJpYWwgPSBuZXcgU3RhbmRhcmRNYXRlcmlhbCAnbWF0JyBAc2NlbmVcbiAgICAgICAgICAgIHAubWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gbmV3IENvbG9yMyAwIDAgMVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiBwcmVmcy5nZXQgJ2luc3BlY3RvcidcbiAgICAgICAgICAgICAgICBAdG9nZ2xlSW5zcGVjdG9yKClcblxuICAgICAgICBmb3IgaSBpbiBbMC4uMTBdXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHRydW5jYXRlZCA9IFBvbHlHZW4udHJ1bmNhdGUgUG9seUdlbi5pY29zYWhlZHJvbigpLCBpKjAuMVxuICAgIFxuICAgICAgICAgICAgcCA9IE1lc2guQ3JlYXRlUG9seWhlZHJvbiBcImljb3NhaGVkcm9uXCIge2N1c3RvbTp0cnVuY2F0ZWR9LCBAc2NlbmVcbiAgICAgICAgICAgIHAuY29udmVydFRvRmxhdFNoYWRlZE1lc2goKVxuICAgICAgICAgICAgIyBwLnNpbXBsaWZ5IHtxdWFsaXR5OjAuOSBkaXN0YW5jZToxLjAgb3B0aW1pemVNZXNoOnRydWV9LCBmYWxzZSwgU2ltcGxpZmljYXRpb25UeXBlLlFVQURSQVRJQywgKG0pIC0+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBwLnJlY2VpdmVTaGFkb3dzID0gdHJ1ZVxuICAgICAgICAgICAgcC5wb3NpdGlvbi54ID0gIDEyXG4gICAgICAgICAgICBwLnBvc2l0aW9uLnogPSAtMyooaS0wKVxuICAgICAgICAgICAgc2hhZG93R2VuZXJhdG9yLmFkZFNoYWRvd0Nhc3RlciBwXG4gICAgICAgICAgICBwLm1hdGVyaWFsID0gbmV3IFN0YW5kYXJkTWF0ZXJpYWwgJ21hdCcgQHNjZW5lXG4gICAgICAgICAgICBwLm1hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IG5ldyBDb2xvcjMgMSAwIDBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgcHJlZnMuZ2V0ICdpbnNwZWN0b3InXG4gICAgICAgICAgICAgICAgQHRvZ2dsZUluc3BlY3RvcigpXG4gICAgICAgICAgICAgICBcbiAgICBvbk1vdXNlRG93bjogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgcmVzdWx0ID0gQHNjZW5lLnBpY2sgQHNjZW5lLnBvaW50ZXJYLCBAc2NlbmUucG9pbnRlcllcbiAgICAgICAgQG1vdXNlRG93bk1lc2ggPSByZXN1bHQucGlja2VkTWVzaCAgICAgICAgICAgIFxuXG4gICAgb25Nb3VzZVVwOiAoZXZlbnQpID0+ICAgICAgICAgICAgICAgIFxuXG4gICAgICAgIHJlc3VsdCA9IEBzY2VuZS5waWNrIEBzY2VuZS5wb2ludGVyWCwgQHNjZW5lLnBvaW50ZXJZXG4gICAgICAgIGlmIG1lc2ggPSByZXN1bHQucGlja2VkTWVzaFxuICAgICAgICAgICAgaWYgbWVzaC5uYW1lICE9ICdncm91bmQnIGFuZCBtZXNoID09IEBtb3VzZURvd25NZXNoXG4gICAgICAgICAgICAgICAgQGNhbWVyYS5zZXRUYXJnZXQgbWVzaFxuICAgICAgICAgICAgICAgIFxuICAgIHRvZ2dsZUluc3BlY3RvcjogLT5cbiAgICAgICAgXG4gICAgICAgIGlmIEBzY2VuZS5kZWJ1Z0xheWVyLmlzVmlzaWJsZSgpXG4gICAgICAgICAgICBAc2NlbmUuZGVidWdMYXllci5oaWRlKClcbiAgICAgICAgICAgIHByZWZzLnNldCAnaW5zcGVjdG9yJyBmYWxzZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBAc2NlbmUuZGVidWdMYXllci5zaG93IG92ZXJsYXk6dHJ1ZSBzaG93SW5zcGVjdG9yOnRydWVcbiAgICAgICAgICAgIHByZWZzLnNldCAnaW5zcGVjdG9yJyB0cnVlXG4gICAgICAgIFxuICAgIHN0YXJ0OiAtPiBAdmlldy5mb2N1cygpXG5cbiAgICBhbmltYXRlOiA9PlxuXG4gICAgICAgIGlmIG5vdCBAcGF1c2VkXG4gICAgICAgICAgICBAc2NlbmUucmVuZGVyKClcbiAgICBcbiAgICByZXNpemVkOiA9PiBcblxuICAgICAgICBAY2FudmFzLndpZHRoID0gQHZpZXcuY2xpZW50V2lkdGhcbiAgICAgICAgQGNhbnZhcy5oZWlnaHQgPSBAdmlldy5jbGllbnRIZWlnaHRcbiAgICBcbiAgICBtb2RLZXlDb21ib0V2ZW50RG93bjogKG1vZCwga2V5LCBjb21ibywgZXZlbnQpIC0+XG4gICAgICAgIFxuICAgICAgICBrbG9nICdtb2RLZXlDb21ib0V2ZW50RG93bicgbW9kLCBrZXksIGNvbWJvLCBldmVudFxuICAgICAgICBcbiAgICBtb2RLZXlDb21ib0V2ZW50VXA6IChtb2QsIGtleSwgY29tYm8sIGV2ZW50KSAtPlxuICAgICAgICBcbiAgICAgICAga2xvZyAnbW9kS2V5Q29tYm9FdmVudFVwJyBtb2QsIGtleSwgY29tYm8sIGV2ZW50XG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBXb3JsZFxuIl19
//# sourceURL=../coffee/world.coffee