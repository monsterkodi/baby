// koffee 1.4.0

/*
000   000   0000000   00000000   000      0000000    
000 0 000  000   000  000   000  000      000   000  
000000000  000   000  0000000    000      000   000  
000   000  000   000  000   000  000      000   000  
00     00   0000000   000   000  0000000  0000000
 */
var AmbientLight, ArcRotateCamera, Color3, DirectionalLight, Engine, FlyCamera, HemisphericLight, Mesh, MeshBuilder, Scene, ShadowGenerator, SpotLight, StandardMaterial, Vector3, World, elem, klog, poly, ref, ref1,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('kxk'), elem = ref.elem, klog = ref.klog;

ref1 = require('babylonjs'), Engine = ref1.Engine, Scene = ref1.Scene, Color3 = ref1.Color3, Vector3 = ref1.Vector3, Mesh = ref1.Mesh, DirectionalLight = ref1.DirectionalLight, AmbientLight = ref1.AmbientLight, ShadowGenerator = ref1.ShadowGenerator, StandardMaterial = ref1.StandardMaterial, MeshBuilder = ref1.MeshBuilder, HemisphericLight = ref1.HemisphericLight, SpotLight = ref1.SpotLight, ArcRotateCamera = ref1.ArcRotateCamera, FlyCamera = ref1.FlyCamera;

poly = require('./poly');

World = (function() {
    function World(view) {
        var a, box, c, camera, ground, i, j, k, len, light, light0, p, ref2, shadowGenerator, sphere, x, z;
        this.view = view;
        this.resized = bind(this.resized, this);
        this.animate = bind(this.animate, this);
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
        if (1) {
            camera = new ArcRotateCamera("Camera", 0, 0, 0, Vector3.Zero(), this.scene);
            camera.lowerRadiusLimit = 2;
            camera.upperRadiusLimit = 100;
            camera.setPosition(new Vector3(0, 0, -10));
        } else {
            camera = new FlyCamera("FlyCamera", new Vector3(0, 0, -10), this.scene);
        }
        camera.attachControl(this.canvas, true);
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
        ref2 = ['Cuboctahedron', 'TruncatedCuboctahedron'];
        for (j = 0, len = ref2.length; j < len; j++) {
            k = ref2[j];
            p = Mesh.CreatePolyhedron("sap", {
                custom: poly[k]
            }, this.scene);
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
            x += 3;
            i++;
            if (i > 9) {
                i = 0;
                x = 0;
                z += 3;
            }
        }
        this.engine.runRenderLoop(this.animate);
    }

    World.prototype.start = function() {
        return this.view.focus();
    };

    World.prototype.animate = function() {
        if (!this.paused) {
            return this.scene.render();
        }
    };

    World.prototype.resized = function() {
        klog('resized', this.view.clientWidth, this.view.clientHeight);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ybGQuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLGlOQUFBO0lBQUE7O0FBUUEsTUFBaUIsT0FBQSxDQUFRLEtBQVIsQ0FBakIsRUFBRSxlQUFGLEVBQVE7O0FBRVIsT0FBb0wsT0FBQSxDQUFRLFdBQVIsQ0FBcEwsRUFBRSxvQkFBRixFQUFVLGtCQUFWLEVBQWlCLG9CQUFqQixFQUF5QixzQkFBekIsRUFBa0MsZ0JBQWxDLEVBQXdDLHdDQUF4QyxFQUEwRCxnQ0FBMUQsRUFBd0Usc0NBQXhFLEVBQXlGLHdDQUF6RixFQUEyRyw4QkFBM0csRUFBd0gsd0NBQXhILEVBQTBJLDBCQUExSSxFQUFxSixzQ0FBckosRUFBc0s7O0FBRXRLLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUjs7QUFFRDtJQUVDLGVBQUMsSUFBRDtBQUVDLFlBQUE7UUFGQSxJQUFDLENBQUEsT0FBRDs7O1FBRUEsSUFBQyxDQUFBLE1BQUQsR0FBVTtRQUNWLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBTixDQUFBO1FBRUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFBLENBQUssUUFBTCxFQUFjO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxTQUFOO1lBQWdCLE1BQUEsRUFBTyxJQUFDLENBQUEsSUFBeEI7U0FBZDtRQUVWLElBQUMsQ0FBQSxPQUFELENBQUE7UUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUksTUFBSixDQUFXLElBQUMsQ0FBQSxNQUFaLEVBQW9CLElBQXBCO1FBRVYsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLEtBQUosQ0FBVSxJQUFDLENBQUEsTUFBWDtRQUNULENBQUEsR0FBSTtRQUNKLElBQUMsQ0FBQSxLQUFLLENBQUMsVUFBUCxHQUFvQixJQUFJLE1BQUosQ0FBVyxDQUFYLEVBQWMsQ0FBZCxFQUFpQixDQUFqQjtRQUVwQixJQUFHLENBQUg7WUFDSSxNQUFBLEdBQVMs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LEVBQWtCLEtBQWxCO2VBRWhCLElBQUEsQ0FBSyxvQkFBTCxFQUEwQixHQUExQixFQUErQixHQUEvQixFQUFvQyxLQUFwQyxFQUEyQyxLQUEzQztJQUZnQjs7Ozs7O0FBSXhCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwICAgIFxuMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICBcbjAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIFxuMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMCAgICBcbiMjI1xuXG57IGVsZW0sIGtsb2cgfSA9IHJlcXVpcmUgJ2t4aydcblxueyBFbmdpbmUsIFNjZW5lLCBDb2xvcjMsIFZlY3RvcjMsIE1lc2gsIERpcmVjdGlvbmFsTGlnaHQsIEFtYmllbnRMaWdodCwgU2hhZG93R2VuZXJhdG9yLCBTdGFuZGFyZE1hdGVyaWFsLCBNZXNoQnVpbGRlciwgSGVtaXNwaGVyaWNMaWdodCwgU3BvdExpZ2h0LCBBcmNSb3RhdGVDYW1lcmEsIEZseUNhbWVyYSB9ID0gcmVxdWlyZSAnYmFieWxvbmpzJ1xuXG5wb2x5ID0gcmVxdWlyZSAnLi9wb2x5J1xuXG5jbGFzcyBXb3JsZFxuICAgIFxuICAgIEA6IChAdmlldykgLT5cbiAgICAgICAgXG4gICAgICAgIEBwYXVzZWQgPSBmYWxzZVxuICAgICAgICBAdmlldy5mb2N1cygpXG4gICAgICAgIFxuICAgICAgICBAY2FudmFzID0gZWxlbSAnY2FudmFzJyBjbGFzczonYmFieWxvbicgcGFyZW50OkB2aWV3XG5cbiAgICAgICAgQHJlc2l6ZWQoKVxuICAgICAgICBAZW5naW5lID0gbmV3IEVuZ2luZSBAY2FudmFzLCB0cnVlXG4gICAgICAgIFxyXG4gICAgICAgIEBzY2VuZSA9IG5ldyBTY2VuZSBAZW5naW5lIFxyXG4gICAgICAgIGEgPSAwLjA2XG4gICAgICAgIEBzY2VuZS5jbGVhckNvbG9yID0gbmV3IENvbG9yMyBhLCBhLCBhXG5cbiAgICAgICAgaWYgMVxuICAgICAgICAgICAgY2FtZXJhID0gbmV3IEFyY1JvdGF0ZUNhbWVyYSBcIkNhbWVyYVwiLCAwIDAgMCBWZWN0b3IzLlplcm8oKSwgQHNjZW5lXG4gICAgICAgICAgICBjYW1lcmEubG93ZXJSYWRpdXNMaW1pdCA9IDJcbiAgICAgICAgICAgIGNhbWVyYS51cHBlclJhZGl1c0xpbWl0ID0gMTAwXG4gICAgICAgICAgICBjYW1lcmEuc2V0UG9zaXRpb24gbmV3IFZlY3RvcjMgMCAwLCAtMTBcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgY2FtZXJhID0gbmV3IEZseUNhbWVyYSBcIkZseUNhbWVyYVwiLCBuZXcgVmVjdG9yMygwLCAwLCAtMTApLCBAc2NlbmVcbiAgICAgICAgY2FtZXJhLmF0dGFjaENvbnRyb2wgQGNhbnZhcywgdHJ1ZVxuXG4gICAgICAgIGxpZ2h0MCA9IG5ldyBIZW1pc3BoZXJpY0xpZ2h0ICdsaWdodDEnIG5ldyBWZWN0b3IzKDAsIDEsIDApLCBAc2NlbmVcbiAgICAgICAgbGlnaHQwLmludGVuc2l0eSA9IDFcbiAgICAgICAgbGlnaHQgPSBuZXcgRGlyZWN0aW9uYWxMaWdodCAnbGlnaHQnIG5ldyBWZWN0b3IzKDAsIC0xLCAwKSwgQHNjZW5lXG4gICAgICAgIGxpZ2h0LnBvc2l0aW9uLnkgPSAxMDBcbiAgICAgICAgbGlnaHQuaW50ZW5zaXR5ID0gMC4xXG4gICAgICAgIFxuICAgICAgICBzaGFkb3dHZW5lcmF0b3IgPSBuZXcgU2hhZG93R2VuZXJhdG9yIDgqMTAyNCwgbGlnaHRcbiAgICAgICAgc2hhZG93R2VuZXJhdG9yLnVzZUV4cG9uZW50aWFsU2hhZG93TWFwID0gdHJ1ZVxuICAgICAgICBzaGFkb3dHZW5lcmF0b3IudXNlUG9pc3NvblNhbXBsaW5nID0gdHJ1ZVxuICAgICAgICBzaGFkb3dHZW5lcmF0b3IudXNlUGVyY2VudGFnZUNsb3NlckZpbHRlcmluZyA9IHRydWVcbiAgICAgICAgc2hhZG93R2VuZXJhdG9yLnVzZUNvbnRhY3RIYXJkZW5pbmdTaGFkb3cgPSB0cnVlXG4gICAgICAgIFxuICAgICAgICBncm91bmQgPSBNZXNoQnVpbGRlci5DcmVhdGVHcm91bmQgXCJncm91bmRcIiB7d2lkdGg6MTAwMCBoZWlnaHQ6MTAwMCBzdWJkaXZpc2lvbnM6IDR9LCBAc2NlbmVcbiAgICAgICAgZ3JvdW5kLm1hdGVyaWFsID0gbmV3IFN0YW5kYXJkTWF0ZXJpYWwgXCJtYXRcIiwgQHNjZW5lXG4gICAgICAgIGEgPSAwLjA1XG4gICAgICAgIGdyb3VuZC5tYXRlcmlhbC5kaWZmdXNlQ29sb3IgPSBuZXcgQ29sb3IzIGEsIGEsIGFcbiAgICAgICAgZ3JvdW5kLnJlY2VpdmVTaGFkb3dzID0gdHJ1ZVxuICAgICAgICBncm91bmQucG9zaXRpb24ueSA9IC00XG5cbiAgICAgICAgaWYgMFxuICAgICAgICAgICAgc3BoZXJlID0gTWVzaEJ1aWxkZXIuQ3JlYXRlU3BoZXJlICdzcGhlcmUnIHsgZGlhbWV0ZXI6IDEgfSwgQHNjZW5lXG4gICAgICAgICAgICBzcGhlcmUubWF0ZXJpYWwgPSBuZXcgU3RhbmRhcmRNYXRlcmlhbCBcIm1hdFwiLCBAc2NlbmVcbiAgICAgICAgICAgIHNwaGVyZS5tYXRlcmlhbC5kaWZmdXNlQ29sb3IgPSBuZXcgQ29sb3IzIDEgMSAwXG4gICAgICAgICAgICBzcGhlcmUubWF0ZXJpYWwuc3BlY3VsYXJQb3dlciA9IDZcbiAgICAgICAgICAgIHNwaGVyZS50cmFuc2xhdGUgbmV3IFZlY3RvcjMoMCAxIDApLCAyXG4gICAgICAgICAgICBzcGhlcmUucmVjZWl2ZVNoYWRvd3MgPSB0cnVlXG4gICAgICAgICAgICBzaGFkb3dHZW5lcmF0b3IuYWRkU2hhZG93Q2FzdGVyIHNwaGVyZVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBib3ggPSBNZXNoQnVpbGRlci5DcmVhdGVCb3ggJ2JveCcge30sIEBzY2VuZVxuICAgICAgICAgICAgYm94Lm1hdGVyaWFsID0gbmV3IFN0YW5kYXJkTWF0ZXJpYWwgXCJib3hNYXRcIiwgQHNjZW5lXG4gICAgICAgICAgICBib3gubWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gbmV3IENvbG9yMyAxIDAgMFxuICAgICAgICAgICAgYm94LnRyYW5zbGF0ZSBuZXcgVmVjdG9yMygxIDEgMCksIDJcbiAgICAgICAgICAgIGJveC5yZWNlaXZlU2hhZG93cyA9IHRydWUgICAgICAgIFxuICAgICAgICAgICAgc2hhZG93R2VuZXJhdG9yLmFkZFNoYWRvd0Nhc3RlciBib3hcbiAgICBcbiAgICAgICAgICAgIGJveCA9IE1lc2hCdWlsZGVyLkNyZWF0ZUJveCAnYm94JyB7fSwgQHNjZW5lXG4gICAgICAgICAgICBib3gubWF0ZXJpYWwgPSBuZXcgU3RhbmRhcmRNYXRlcmlhbCBcImJveE1hdFwiLCBAc2NlbmVcbiAgICAgICAgICAgIGJveC5tYXRlcmlhbC5kaWZmdXNlQ29sb3IgPSBuZXcgQ29sb3IzIDAgMSAwXG4gICAgICAgICAgICBib3gudHJhbnNsYXRlIG5ldyBWZWN0b3IzKDAgMiAwKSwgMlxuICAgICAgICAgICAgYm94LnJlY2VpdmVTaGFkb3dzID0gdHJ1ZSAgICAgICAgXG4gICAgICAgICAgICBzaGFkb3dHZW5lcmF0b3IuYWRkU2hhZG93Q2FzdGVyIGJveFxuICAgICAgICAgICAgXG4gICAgICAgICAgICBib3ggPSBNZXNoQnVpbGRlci5DcmVhdGVCb3ggJ2JveCcge30sIEBzY2VuZVxuICAgICAgICAgICAgYm94Lm1hdGVyaWFsID0gbmV3IFN0YW5kYXJkTWF0ZXJpYWwgXCJib3hNYXRcIiwgQHNjZW5lXG4gICAgICAgICAgICBib3gubWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gbmV3IENvbG9yMyAwIDAgMVxuICAgICAgICAgICAgYm94LnRyYW5zbGF0ZSBuZXcgVmVjdG9yMygwIDEgMSksIDJcbiAgICAgICAgICAgIGJveC5yZWNlaXZlU2hhZG93cyA9IHRydWUgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBzaGFkb3dHZW5lcmF0b3IuYWRkU2hhZG93Q2FzdGVyIGJveFxuICAgICAgICAgICAgIFxuICAgICAgICBpID0gMFxuICAgICAgICB6ID0gMFxuICAgICAgICB4ID0gMFxuICAgICAgICAjIGZvciBrLHYgb2YgcG9seVxuICAgICAgICBmb3IgayBpbiBbJ0N1Ym9jdGFoZWRyb24nLCAnVHJ1bmNhdGVkQ3Vib2N0YWhlZHJvbiddXG4gICAgICAgICAgICBwID0gTWVzaC5DcmVhdGVQb2x5aGVkcm9uIFwic2FwXCIge2N1c3RvbTogcG9seVtrXX0sIEBzY2VuZVxuICAgICAgICAgICAgIyBwLnJlY2VpdmVTaGFkb3dzID0gdHJ1ZVxuICAgICAgICAgICAgc2hhZG93R2VuZXJhdG9yLmFkZFNoYWRvd0Nhc3RlciBwXG4gICAgICAgICAgICBwLm1hdGVyaWFsID0gbmV3IFN0YW5kYXJkTWF0ZXJpYWwgXCJtYXRcIiwgQHNjZW5lXG4gICAgICAgICAgICBjID0gc3dpdGNoIHBvbHlba10uY2F0ZWdvcnlcbiAgICAgICAgICAgICAgICB3aGVuIFwiUGxhdG9uaWMgU29saWRcIiB0aGVuIG5ldyBDb2xvcjMgMC4xIDAuMSAwLjFcbiAgICAgICAgICAgICAgICB3aGVuIFwiQXJjaGltZWRlYW4gU29saWRcIiB0aGVuIG5ldyBDb2xvcjMgMSAxIDFcbiAgICAgICAgICAgICAgICB3aGVuIFwiSm9obnNvbiBTb2xpZFwiIHRoZW4gbmV3IENvbG9yMyAxIDAgMFxuICAgICAgICAgICAgICAgIHdoZW4gXCJBbnRpcHJpc21cIiB0aGVuIG5ldyBDb2xvcjMgMCAwLjMgMFxuICAgICAgICAgICAgICAgIHdoZW4gXCJQcmlzbVwiIHRoZW4gbmV3IENvbG9yMyAxIDEgMFxuICAgICAgICAgICAgICAgIHdoZW4gXCJEaXNrXCIgdGhlbiBuZXcgQ29sb3IzIDAgMCAxXG4gICAgICAgICAgICAgICAgZWxzZSBuZXcgQ29sb3IzIDAgMCAxXG4gICAgICAgICAgICBwLm1hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IGNcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcC5wb3NpdGlvbi54ID0geFxuICAgICAgICAgICAgcC5wb3NpdGlvbi56ID0gelxuICAgICAgICAgICAgeCArPSAzXG4gICAgICAgICAgICBpKytcbiAgICAgICAgICAgIGlmIGkgPiA5XG4gICAgICAgICAgICAgICAgaSA9IDBcbiAgICAgICAgICAgICAgICB4ID0gMFxuICAgICAgICAgICAgICAgIHogKz0gM1xuICAgICAgICBcbiAgICAgICAgQGVuZ2luZS5ydW5SZW5kZXJMb29wIEBhbmltYXRlXG4gICAgXG4gICAgc3RhcnQ6IC0+IEB2aWV3LmZvY3VzKClcblxuICAgIGFuaW1hdGU6ID0+XG5cbiAgICAgICAgaWYgbm90IEBwYXVzZWRcbiAgICAgICAgICAgIEBzY2VuZS5yZW5kZXIoKVxuICAgIFxuICAgIHJlc2l6ZWQ6ID0+IFxuICAgICAgICBrbG9nICdyZXNpemVkJyBAdmlldy5jbGllbnRXaWR0aCwgQHZpZXcuY2xpZW50SGVpZ2h0XG4gICAgICAgIEBjYW52YXMud2lkdGggPSBAdmlldy5jbGllbnRXaWR0aFxuICAgICAgICBAY2FudmFzLmhlaWdodCA9IEB2aWV3LmNsaWVudEhlaWdodFxuICAgIFxuICAgIG1vZEtleUNvbWJvRXZlbnREb3duOiAobW9kLCBrZXksIGNvbWJvLCBldmVudCkgLT5cbiAgICAgICAgXG4gICAgICAgIGtsb2cgJ21vZEtleUNvbWJvRXZlbnREb3duJyBtb2QsIGtleSwgY29tYm8sIGV2ZW50XG4gICAgICAgIFxuICAgIG1vZEtleUNvbWJvRXZlbnRVcDogKG1vZCwga2V5LCBjb21ibywgZXZlbnQpIC0+XG4gICAgICAgIFxuICAgICAgICBrbG9nICdtb2RLZXlDb21ib0V2ZW50VXAnIG1vZCwga2V5LCBjb21ibywgZXZlbnRcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFdvcmxkXG4iXX0=
//# sourceURL=../coffee/world.coffee