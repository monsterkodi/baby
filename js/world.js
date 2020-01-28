// koffee 1.6.0

/*
000   000   0000000   00000000   000      0000000    
000 0 000  000   000  000   000  000      000   000  
000000000  000   000  0000000    000      000   000  
000   000  000   000  000   000  000      000   000  
00     00   0000000   000   000  0000000  0000000
 */
var Camera, Color3, DirectionalLight, Engine, HemisphericLight, MeshBuilder, Scene, Shader, Shapes, Space, StandardMaterial, Tree, Vect, Vector3, World, animate, elem, generate, prefs, ref, ref1, vec, ϕ,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

ref = require('kxk'), elem = ref.elem, prefs = ref.prefs;

ref1 = require('babylonjs'), Camera = ref1.Camera, Color3 = ref1.Color3, DirectionalLight = ref1.DirectionalLight, Engine = ref1.Engine, HemisphericLight = ref1.HemisphericLight, MeshBuilder = ref1.MeshBuilder, Scene = ref1.Scene, Space = ref1.Space, StandardMaterial = ref1.StandardMaterial, Vector3 = ref1.Vector3;

vec = require('./poly/math').vec;

generate = require('./poly/generate');

Vect = require('./vect');

Camera = require('./camera');

Scene = require('./scene');

Space = require('./space');

Tree = require('./tree');

Shapes = require('./shapes');

Shader = require('./shader');

animate = require('./animate');

ϕ = (Math.sqrt(5) - 1) / 2;

World = (function() {
    function World(view) {
        var a, ground, hemi, light;
        this.view = view;
        this.resized = bind(this.resized, this);
        this.animate = bind(this.animate, this);
        this.onMouseUp = bind(this.onMouseUp, this);
        this.onMouseMove = bind(this.onMouseMove, this);
        this.onMouseDown = bind(this.onMouseDown, this);
        this.paused = false;
        this.view.focus();
        this.keys = new Float32Array(3 * 256);
        this.canvas = elem('canvas', {
            "class": 'babylon',
            parent: this.view
        });
        this.engine = new Engine(this.canvas);
        this.scene = new Scene(this);
        this.shapes = new Shapes(this.scene);
        this.resized();
        a = 0.0;
        this.scene.clearColor = new Color3(a, a, a);
        this.camera = new Camera(this);
        hemi = new HemisphericLight('hemi', new Vector3(0, 1, 0), this.scene);
        hemi.intensity = 0.5;
        light = new DirectionalLight('light', new Vector3(0, -1, 0), this.scene);
        light.position.y = 3;
        this.scene.initFog();
        if (0) {
            ground = MeshBuilder.CreateGround('ground', {
                width: 1000,
                height: 1000,
                subdivisions: 4
            }, this.scene);
            ground.material = new StandardMaterial('ground', this.scene);
            ground.material.specularColor = new Color3(0.05, 0.05, 0.05);
            a = 0.05;
            ground.material.diffuseColor = new Color3(a, a, a);
            ground.receiveShadows = true;
            ground.position.y = -2;
        }
        this.cursor = MeshBuilder.CreateIcoSphere('cursor', {
            flat: false,
            radius: 1.1
        }, this.scene);
        this.cursor.material = new StandardMaterial('mat', this.scene);
        this.cursor.material.diffuseColor = new Color3(0.05, 0.05, 0.05);
        this.cursor.material.specularColor = new Color3(0, 0, 0);
        this.cursor.material.alpha = 0.5;
        this.cursor.position = [0, -1000, 0];
        this.cursor.backFaceCulling = true;
        this.cursor = this.cursor.flipFaces(true);
        this.engine.runRenderLoop(this.animate);
        if (prefs.get('inspector')) {
            this.toggleInspector();
        }
        window.addEventListener('pointerdown', this.onMouseDown);
        window.addEventListener('pointermove', this.onMouseMove);
        window.addEventListener('pointerup', this.onMouseUp);
        this.shader = new Shader(this);
    }

    World.prototype.onMouseDown = function(event) {
        this.mouseDownMesh = this.pickedMesh();
        return this.camera.onMouseDown(event);
    };

    World.prototype.onMouseMove = function(event) {
        var mesh;
        this.camera.onMouseDrag(event);
        if (mesh = this.pickedMesh()) {
            return this.scene.legend.show(mesh.name);
        } else {
            return this.scene.legend.show(this.legendMesh);
        }
    };

    World.prototype.onMouseUp = function(event) {
        var mesh;
        if (mesh = this.pickedMesh()) {
            if (mesh === this.mouseDownMesh) {
                this.cursor.position = mesh.getAbsolutePosition();
                this.camera.fadeToPos(mesh.getAbsolutePosition());
                this.scene.legend.show(mesh.name);
                this.legendMesh = mesh.name;
            }
        } else if (!this.mouseDownMesh) {
            this.cursor.position = [0, -1000, 0];
            this.scene.legend.hide();
            this.legendMesh = null;
        }
        return this.camera.onMouseUp(event);
    };

    World.prototype.pickedMesh = function() {
        var ref2, ref3, result;
        return null;
        if (result = this.scene.pick(this.scene.pointerX, this.scene.pointerY, function(m) {
            var ref2;
            return (ref2 = m.name) !== 'ground' && ref2 !== 'cursor';
        })) {
            if ((ref2 = (ref3 = result.pickedMesh) != null ? ref3.name : void 0) === 'faces' || ref2 === 'normals') {
                return result.pickedMesh.parent;
            } else {
                return result.pickedMesh;
            }
        }
    };

    World.prototype.highlight = function(mesh) {
        var ref2, ref3, ref4, ref5;
        if ((ref2 = this.highlightMesh) != null) {
            if ((ref3 = ref2.material) != null) {
                ref3.diffuseColor = this.preHighlightColor;
            }
        }
        this.preHighlightColor = mesh != null ? (ref4 = mesh.material) != null ? ref4.diffuseColor : void 0 : void 0;
        if (mesh != null) {
            if ((ref5 = mesh.material) != null) {
                ref5.diffuseColor = this.preHighlightColor.multiply(new Color3(1.5, 1.5, 1.5));
            }
        }
        return this.highlightMesh = mesh;
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
        var ref2, ref3, ref4;
        if (!this.paused) {
            if ((ref2 = this.space) != null) {
                ref2.render();
            }
            if ((ref3 = this.tree) != null) {
                ref3.render();
            }
            if ((ref4 = this.shader) != null) {
                ref4.render();
            }
            this.camera.render();
            this.scene.render();
            return animate.tick(this.engine.getDeltaTime() / 1000);
        }
    };

    World.prototype.resized = function() {
        var dpr;
        dpr = window.devicePixelRatio;
        this.engine.setSize(this.view.clientWidth * dpr, this.view.clientHeight * dpr);
        this.canvas.style.transform = "scale(" + (1 / dpr) + ")";
        return this.canvas.style.transformOrigin = "top left";
    };

    World.prototype.modKeyComboEventDown = function(mod, key, combo, event) {
        if (event.which < 256 && !event.repeat) {
            this.keys[event.which] = 1;
            this.keys[event.which + 256] = 1;
            this.keys[event.which + 512] = 1 - this.keys[event.which + 512];
        }
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
            case 'r':
                return this.camera.reset();
        }
    };

    World.prototype.modKeyComboEventUp = function(mod, key, combo, event) {
        if (event.which < 256) {
            this.keys[event.which] = 0;
        }
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ybGQuanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLHNNQUFBO0lBQUE7O0FBUUEsTUFBa0IsT0FBQSxDQUFRLEtBQVIsQ0FBbEIsRUFBRSxlQUFGLEVBQVE7O0FBQ1IsT0FBdUgsT0FBQSxDQUFRLFdBQVIsQ0FBdkgsRUFBRSxvQkFBRixFQUFVLG9CQUFWLEVBQWtCLHdDQUFsQixFQUFvQyxvQkFBcEMsRUFBNEMsd0NBQTVDLEVBQThELDhCQUE5RCxFQUEyRSxrQkFBM0UsRUFBa0Ysa0JBQWxGLEVBQXlGLHdDQUF6RixFQUEyRzs7QUFDekcsTUFBUSxPQUFBLENBQVEsYUFBUjs7QUFDVixRQUFBLEdBQVcsT0FBQSxDQUFRLGlCQUFSOztBQUNYLElBQUEsR0FBVyxPQUFBLENBQVEsUUFBUjs7QUFDWCxNQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0FBQ1gsS0FBQSxHQUFXLE9BQUEsQ0FBUSxTQUFSOztBQUNYLEtBQUEsR0FBVyxPQUFBLENBQVEsU0FBUjs7QUFDWCxJQUFBLEdBQVcsT0FBQSxDQUFRLFFBQVI7O0FBQ1gsTUFBQSxHQUFXLE9BQUEsQ0FBUSxVQUFSOztBQUNYLE1BQUEsR0FBVyxPQUFBLENBQVEsVUFBUjs7QUFDWCxPQUFBLEdBQVcsT0FBQSxDQUFRLFdBQVI7O0FBRVgsQ0FBQSxHQUFJLENBQUMsSUFBSSxDQUFDLElBQUwsQ0FBVSxDQUFWLENBQUEsR0FBYSxDQUFkLENBQUEsR0FBaUI7O0FBRWY7SUFFQyxlQUFDLElBQUQ7QUFFQyxZQUFBO1FBRkEsSUFBQyxDQUFBLE9BQUQ7Ozs7OztRQUVBLElBQUMsQ0FBQSxNQUFELEdBQVU7UUFDVixJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sQ0FBQTtRQUVBLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBSSxZQUFKLENBQWlCLENBQUEsR0FBRSxHQUFuQjtRQUVSLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFB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UixDQUFBO0FBTGxCLGlCQU1TLEdBTlQ7dUJBTWtCLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFBO0FBTmxCLGlCQU9TLEdBUFQ7QUFBQSxpQkFPYSxLQVBiO3VCQU93QixJQUFDLENBQUEsTUFBTSxDQUFDLFVBQVIsQ0FBQTtBQVB4QixpQkFRUyxHQVJUO3VCQVFrQixJQUFDLENBQUEsTUFBTSxDQUFDLEtBQVIsQ0FBQTtBQVJsQjtJQVJrQjs7b0JBa0J0QixrQkFBQSxHQUFvQixTQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsS0FBWCxFQUFrQixLQUFsQjtRQUdoQixJQUFHLEtBQUssQ0FBQyxLQUFOLEdBQWMsR0FBakI7WUFDSSxJQUFDLENBQUEsSUFBSyxDQUFBLEtBQUssQ0FBQyxLQUFOLENBQU4sR0FBcUIsRUFEekI7O0FBR0EsZ0JBQU8sR0FBUDtBQUFBLGlCQUNTLEdBRFQ7dUJBQ2tCLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFBO0FBRGxCLGlCQUVTLEdBRlQ7dUJBRWtCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFBO0FBRmxCLGlCQUdTLEdBSFQ7dUJBR2tCLElBQUMsQ0FBQSxNQUFNLENBQUMsUUFBUixDQUFBO0FBSGxCLGlCQUlTLEdBSlQ7dUJBSWtCLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixDQUFBO0FBSmxCLGlCQUtTLEdBTFQ7dUJBS2tCLElBQUMsQ0FBQSxNQUFNLENBQUMsV0FBUixDQUFBO0FBTGxCLGlCQU1TLEdBTlQ7dUJBTWtCLElBQUMsQ0FBQSxNQUFNLENBQUMsWUFBUixDQUFBO0FBTmxCO0lBTmdCOzs7Ozs7QUFleEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMCAgIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAgICAgXG4wMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIFxuMDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgMDAwICAgICAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgXG4wMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAwMDAwICAwMDAwMDAwICAgIFxuIyMjXG5cbnsgZWxlbSwgcHJlZnMgfSA9IHJlcXVpcmUgJ2t4aydcbnsgQ2FtZXJhLCBDb2xvcjMsIERpcmVjdGlvbmFsTGlnaHQsIEVuZ2luZSwgSGVtaXNwaGVyaWNMaWdodCwgTWVzaEJ1aWxkZXIsIFNjZW5lLCBTcGFjZSwgU3RhbmRhcmRNYXRlcmlhbCwgVmVjdG9yMyB9ID0gcmVxdWlyZSAnYmFieWxvbmpzJ1xueyB2ZWMgfSA9IHJlcXVpcmUgJy4vcG9seS9tYXRoJ1xuZ2VuZXJhdGUgPSByZXF1aXJlICcuL3BvbHkvZ2VuZXJhdGUnXG5WZWN0ICAgICA9IHJlcXVpcmUgJy4vdmVjdCdcbkNhbWVyYSAgID0gcmVxdWlyZSAnLi9jYW1lcmEnXG5TY2VuZSAgICA9IHJlcXVpcmUgJy4vc2NlbmUnXG5TcGFjZSAgICA9IHJlcXVpcmUgJy4vc3BhY2UnXG5UcmVlICAgICA9IHJlcXVpcmUgJy4vdHJlZSdcblNoYXBlcyAgID0gcmVxdWlyZSAnLi9zaGFwZXMnXG5TaGFkZXIgICA9IHJlcXVpcmUgJy4vc2hhZGVyJ1xuYW5pbWF0ZSAgPSByZXF1aXJlICcuL2FuaW1hdGUnXG5cbs+VID0gKE1hdGguc3FydCg1KS0xKS8yXG5cbmNsYXNzIFdvcmxkXG4gICAgXG4gICAgQDogKEB2aWV3KSAtPlxuICAgICAgICBcbiAgICAgICAgQHBhdXNlZCA9IGZhbHNlXG4gICAgICAgIEB2aWV3LmZvY3VzKClcbiAgICAgICAgXG4gICAgICAgIEBrZXlzID0gbmV3IEZsb2F0MzJBcnJheSAzKjI1NlxuICAgICAgICBcbiAgICAgICAgQGNhbnZhcyA9IGVsZW0gJ2NhbnZhcycgY2xhc3M6J2JhYnlsb24nIHBhcmVudDpAdmlld1xuICAgICAgICBcbiAgICAgICAgQGVuZ2luZSA9IG5ldyBFbmdpbmUgQGNhbnZhc1xuICAgICAgICBcbiAgICAgICAgQHNjZW5lICA9IG5ldyBTY2VuZSBAXG4gICAgICAgIEBzaGFwZXMgPSBuZXcgU2hhcGVzIEBzY2VuZVxuICAgICAgICBAcmVzaXplZCgpXG4gICAgICAgIFxuICAgICAgICBhID0gMC4wICMwLjA2NVxuICAgICAgICBAc2NlbmUuY2xlYXJDb2xvciA9IG5ldyBDb2xvcjMgYSwgYSwgYVxuXG4gICAgICAgIEBjYW1lcmEgPSBuZXcgQ2FtZXJhIEBcbiAgICAgICAgXG4gICAgICAgIGhlbWkgPSBuZXcgSGVtaXNwaGVyaWNMaWdodCAnaGVtaScgbmV3IFZlY3RvcjMoMCAxIDApLCBAc2NlbmVcbiAgICAgICAgaGVtaS5pbnRlbnNpdHkgPSAwLjVcbiAgICAgICAgXG4gICAgICAgIGxpZ2h0ID0gbmV3IERpcmVjdGlvbmFsTGlnaHQgJ2xpZ2h0JyBuZXcgVmVjdG9yMygwIC0xIDApLCBAc2NlbmVcbiAgICAgICAgbGlnaHQucG9zaXRpb24ueSA9IDNcblxuICAgICAgICBAc2NlbmUuaW5pdEZvZygpXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIGlmIDBcbiAgICAgICAgICAgIGdyb3VuZCA9IE1lc2hCdWlsZGVyLkNyZWF0ZUdyb3VuZCAnZ3JvdW5kJyB7d2lkdGg6MTAwMCBoZWlnaHQ6MTAwMCBzdWJkaXZpc2lvbnM6IDR9LCBAc2NlbmVcbiAgICAgICAgICAgIGdyb3VuZC5tYXRlcmlhbCA9IG5ldyBTdGFuZGFyZE1hdGVyaWFsICdncm91bmQnIEBzY2VuZVxuICAgICAgICAgICAgZ3JvdW5kLm1hdGVyaWFsLnNwZWN1bGFyQ29sb3IgPSBuZXcgQ29sb3IzIDAuMDUgMC4wNSAwLjA1XG4gICAgICAgICAgICBhID0gMC4wNVxuICAgICAgICAgICAgZ3JvdW5kLm1hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IG5ldyBDb2xvcjMgYSwgYSwgYVxuICAgICAgICAgICAgZ3JvdW5kLnJlY2VpdmVTaGFkb3dzID0gdHJ1ZVxuICAgICAgICAgICAgZ3JvdW5kLnBvc2l0aW9uLnkgPSAtMlxuICAgICAgICAgICAgIFxuICAgICAgICBAY3Vyc29yID0gTWVzaEJ1aWxkZXIuQ3JlYXRlSWNvU3BoZXJlICdjdXJzb3InIGZsYXQ6ZmFsc2UgcmFkaXVzOjEuMSwgQHNjZW5lXG4gICAgICAgIEBjdXJzb3IubWF0ZXJpYWwgPSBuZXcgU3RhbmRhcmRNYXRlcmlhbCAnbWF0JyBAc2NlbmVcbiAgICAgICAgQGN1cnNvci5tYXRlcmlhbC5kaWZmdXNlQ29sb3IgPSBuZXcgQ29sb3IzIDAuMDUgMC4wNSAwLjA1XG4gICAgICAgIEBjdXJzb3IubWF0ZXJpYWwuc3BlY3VsYXJDb2xvciA9IG5ldyBDb2xvcjMgMCAwIDBcbiAgICAgICAgQGN1cnNvci5tYXRlcmlhbC5hbHBoYSA9IDAuNVxuICAgICAgICBAY3Vyc29yLnBvc2l0aW9uID0gWzAgLTEwMDAgMF1cbiAgICAgICAgQGN1cnNvci5iYWNrRmFjZUN1bGxpbmcgPSB0cnVlXG4gICAgICAgIEBjdXJzb3IgPSBAY3Vyc29yLmZsaXBGYWNlcyB0cnVlXG4gICAgICAgIFxuICAgICAgICBAZW5naW5lLnJ1blJlbmRlckxvb3AgQGFuaW1hdGVcbiAgICAgICAgXG4gICAgICAgIGlmIHByZWZzLmdldCAnaW5zcGVjdG9yJ1xuICAgICAgICAgICAgQHRvZ2dsZUluc3BlY3RvcigpXG4gICAgICAgICAgICAgXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdwb2ludGVyZG93bicgQG9uTW91c2VEb3duXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdwb2ludGVybW92ZScgQG9uTW91c2VNb3ZlXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyICdwb2ludGVydXAnICAgQG9uTW91c2VVcFxuICBcbiAgICAgICAgIyB2eSA9IHZlYygwLDEsMCk7XG4gICAgICAgICMgdnggPSB2ZWMoMSwwLDApO1xuIyAgICAgICAgIFxuICAgICAgICAjIGMxID0gdmVjKCAxLjAsIDEuMCwgMS4wKS5ub3JtYWxpemUoKS5yb3RhdGUodnksIC00NS4wKS5yb3RhdGUodngsIC01NC43MzUpXG4gICAgICAgICMgYzIgPSB2ZWMoIDEuMCwtMS4wLC0xLjApLm5vcm1hbGl6ZSgpLnJvdGF0ZSh2eSwgLTQ1LjApLnJvdGF0ZSh2eCwgLTU0LjczNSlcbiAgICAgICAgIyBjMyA9IHZlYygtMS4wLCAxLjAsLTEuMCkubm9ybWFsaXplKCkucm90YXRlKHZ5LCAtNDUuMCkucm90YXRlKHZ4LCAtNTQuNzM1KVxuICAgICAgICAjIGM0ID0gdmVjKC0xLjAsLTEuMCwgMS4wKS5ub3JtYWxpemUoKS5yb3RhdGUodnksIC00NS4wKS5yb3RhdGUodngsIC01NC43MzUpXG4jICAgICAgICAgXG4gICAgICAgICMgbjEgPSBjMS5taW51cyhjNCkuY3Jvc3NlZChjNC5taW51cyhjMikpLm5vcm1hbGl6ZSgpXG4gICAgICAgICMgbjIgPSBjMi5taW51cyhjMykuY3Jvc3NlZChjMy5taW51cyhjMSkpLm5vcm1hbGl6ZSgpXG4gICAgICAgICMgbjMgPSBjMy5taW51cyhjMikuY3Jvc3NlZChjMi5taW51cyhjNCkpLm5vcm1hbGl6ZSgpXG4gICAgICAgICMgbjQgPSBjNC5taW51cyhjMSkuY3Jvc3NlZChjMS5taW51cyhjMykpLm5vcm1hbGl6ZSgpXG4jICAgICAgICAgXG4gICAgICAgICMga2xvZyBcInZlYzMgYzEgPSB2ZWMzKCN7YzEueH0sICN7YzEueX0sICN7YzEuen0pO1wiXG4gICAgICAgICMga2xvZyBcInZlYzMgYzIgPSB2ZWMzKCN7YzIueH0sICN7YzIueX0sICN7YzIuen0pO1wiXG4gICAgICAgICMga2xvZyBcInZlYzMgYzMgPSB2ZWMzKCN7YzMueH0sICN7YzMueX0sICN7YzMuen0pO1wiXG4gICAgICAgICMga2xvZyBcInZlYzMgYzQgPSB2ZWMzKCN7YzQueH0sICN7YzQueX0sICN7YzQuen0pO1wiXG4jICAgICAgICAgICAgICBcbiAgICAgICAgIyBrbG9nIFwidmVjMyBuMSA9IHZlYzMoI3tuMS54fSwgI3tuMS55fSwgI3tuMS56fSk7XCJcbiAgICAgICAgIyBrbG9nIFwidmVjMyBuMiA9IHZlYzMoI3tuMi54fSwgI3tuMi55fSwgI3tuMi56fSk7XCJcbiAgICAgICAgIyBrbG9nIFwidmVjMyBuMyA9IHZlYzMoI3tuMy54fSwgI3tuMy55fSwgI3tuMy56fSk7XCJcbiAgICAgICAgIyBrbG9nIFwidmVjMyBuNCA9IHZlYzMoI3tuNC54fSwgI3tuNC55fSwgI3tuNC56fSk7XCJcbiAgICAgICAgXG4gICAgICAgIEBzaGFkZXIgPSBuZXcgU2hhZGVyIEBcbiAgICAgICAgIyBpZiAwXG4gICAgICAgICAgICAjIEBzcGFjZSA9IG5ldyBTcGFjZSBAXG4gICAgICAgICMgZWxzZSBpZiAwXG4gICAgICAgICAgICAjIEB0cmVlID0gbmV3IFRyZWUgQFxuICAgICAgICAjIGVsc2VcbiAgICAgICAgICAgICMgQHNoYXBlcy5kYWgoKVxuICAgICAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAgIDAwMCAgMDAwICAgICAgIFxuICAgICMgMDAwICAgMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICBcbiAgICBcbiAgICBvbk1vdXNlRG93bjogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgQG1vdXNlRG93bk1lc2ggPSBAcGlja2VkTWVzaCgpXG4gICAgICAgIEBjYW1lcmEub25Nb3VzZURvd24gZXZlbnRcblxuICAgIG9uTW91c2VNb3ZlOiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICBAY2FtZXJhLm9uTW91c2VEcmFnIGV2ZW50XG4gICAgICAgIGlmIG1lc2ggPSBAcGlja2VkTWVzaCgpXG4gICAgICAgICAgICAjIEBoaWdobGlnaHQgbWVzaCAgICBcbiAgICAgICAgICAgIEBzY2VuZS5sZWdlbmQuc2hvdyBtZXNoLm5hbWVcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNjZW5lLmxlZ2VuZC5zaG93IEBsZWdlbmRNZXNoXG4gICAgICAgIFxuICAgIG9uTW91c2VVcDogKGV2ZW50KSA9PiAgICAgICAgICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGlmIG1lc2ggPSBAcGlja2VkTWVzaCgpXG4gICAgICAgICAgICBpZiBtZXNoID09IEBtb3VzZURvd25NZXNoXG4gICAgICAgICAgICAgICAgQGN1cnNvci5wb3NpdGlvbiA9IG1lc2guZ2V0QWJzb2x1dGVQb3NpdGlvbigpXG4gICAgICAgICAgICAgICAgQGNhbWVyYS5mYWRlVG9Qb3MgbWVzaC5nZXRBYnNvbHV0ZVBvc2l0aW9uKClcbiAgICAgICAgICAgICAgICBAc2NlbmUubGVnZW5kLnNob3cgbWVzaC5uYW1lXG4gICAgICAgICAgICAgICAgQGxlZ2VuZE1lc2ggPSBtZXNoLm5hbWVcblxuICAgICAgICBlbHNlIGlmIG5vdCBAbW91c2VEb3duTWVzaFxuICAgICAgICAgICAgQGN1cnNvci5wb3NpdGlvbiA9IFswIC0xMDAwIDBdXG4gICAgICAgICAgICBAc2NlbmUubGVnZW5kLmhpZGUoKVxuICAgICAgICAgICAgQGxlZ2VuZE1lc2ggPSBudWxsXG4gICAgICAgICAgICAgICAgXG4gICAgICAgIEBjYW1lcmEub25Nb3VzZVVwIGV2ZW50XG4gICAgICAgICAgXG4gICAgcGlja2VkTWVzaDogLT5cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIFxuICAgICAgICBpZiByZXN1bHQgPSBAc2NlbmUucGljayhAc2NlbmUucG9pbnRlclgsIEBzY2VuZS5wb2ludGVyWSwgKG0pIC0+IG0ubmFtZSBub3QgaW4gWydncm91bmQnICdjdXJzb3InXSlcbiAgICAgICAgICAgIGlmIHJlc3VsdC5waWNrZWRNZXNoPy5uYW1lIGluIFsnZmFjZXMnJ25vcm1hbHMnXVxuICAgICAgICAgICAgICAgIHJlc3VsdC5waWNrZWRNZXNoLnBhcmVudFxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlc3VsdC5waWNrZWRNZXNoXG4gICAgICAgIFxuICAgIGhpZ2hsaWdodDogKG1lc2gpIC0+XG4gICAgICAgIFxuICAgICAgICBAaGlnaGxpZ2h0TWVzaD8ubWF0ZXJpYWw/LmRpZmZ1c2VDb2xvciA9IEBwcmVIaWdobGlnaHRDb2xvclxuICAgICAgICBAcHJlSGlnaGxpZ2h0Q29sb3IgPSBtZXNoPy5tYXRlcmlhbD8uZGlmZnVzZUNvbG9yXG4gICAgICAgIG1lc2g/Lm1hdGVyaWFsPy5kaWZmdXNlQ29sb3IgPSBAcHJlSGlnaGxpZ2h0Q29sb3IubXVsdGlwbHkgbmV3IENvbG9yMyAxLjUgMS41IDEuNVxuICAgICAgICBAaGlnaGxpZ2h0TWVzaCA9IG1lc2ggICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgXG4gICAgIyAwMDAgIDAwMDAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwIDAgMDAwICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAgIDAwMDAgICAgICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgIDAwMCAgICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICBcbiAgICBcbiAgICB0b2dnbGVJbnNwZWN0b3I6IC0+XG4gICAgICAgIFxuICAgICAgICBpZiBAc2NlbmUuZGVidWdMYXllci5pc1Zpc2libGUoKVxuICAgICAgICAgICAgQHNjZW5lLmRlYnVnTGF5ZXIuaGlkZSgpXG4gICAgICAgICAgICBwcmVmcy5zZXQgJ2luc3BlY3RvcicgZmFsc2VcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgQHNjZW5lLmRlYnVnTGF5ZXIuc2hvdyBvdmVybGF5OnRydWUgc2hvd0luc3BlY3Rvcjp0cnVlXG4gICAgICAgICAgICBwcmVmcy5zZXQgJ2luc3BlY3RvcicgdHJ1ZVxuICAgICAgICBcbiAgICBzdGFydDogLT4gQHZpZXcuZm9jdXMoKVxuXG4gICAgIyAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMCAwIDAwMCAgMDAwICAwMDAwMDAwMDAgIDAwMDAwMDAwMCAgICAgMDAwICAgICAwMDAwMDAwICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwMCAgXG4gICAgXG4gICAgYW5pbWF0ZTogPT5cblxuICAgICAgICBpZiBub3QgQHBhdXNlZFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBAc3BhY2U/LnJlbmRlcigpXG4gICAgICAgICAgICBAdHJlZT8ucmVuZGVyKClcbiAgICAgICAgICAgIEBzaGFkZXI/LnJlbmRlcigpXG4gICAgICAgICAgICBAY2FtZXJhLnJlbmRlcigpXG4gICAgICAgICAgICBAc2NlbmUucmVuZGVyKClcbiAgICAgICAgICAgIGFuaW1hdGUudGljayBAZW5naW5lLmdldERlbHRhVGltZSgpLzEwMDBcbiAgICBcbiAgICAjIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgICAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgMDAwICAgIDAwMDAwMDAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgICAgICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwICBcbiAgICBcbiAgICByZXNpemVkOiA9PiBcblxuICAgICAgICBkcHIgPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpb1xuICAgICAgICBAZW5naW5lLnNldFNpemUgQHZpZXcuY2xpZW50V2lkdGggKiBkcHIsIEB2aWV3LmNsaWVudEhlaWdodCAqIGRwclxuICAgICAgICBAY2FudmFzLnN0eWxlLnRyYW5zZm9ybSA9IFwic2NhbGUoI3sxL2Rwcn0pXCJcbiAgICAgICAgQGNhbnZhcy5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSBcInRvcCBsZWZ0XCJcbiAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG1vZEtleUNvbWJvRXZlbnREb3duOiAobW9kLCBrZXksIGNvbWJvLCBldmVudCkgLT5cbiAgICAgICAgXG4gICAgICAgICMga2xvZyAnbW9kS2V5Q29tYm9FdmVudERvd24nIGtleSwgZXZlbnQud2hpY2hcbiAgICAgICAgaWYgZXZlbnQud2hpY2ggPCAyNTYgYW5kIG5vdCBldmVudC5yZXBlYXRcbiAgICAgICAgICAgIEBrZXlzW2V2ZW50LndoaWNoXSAgICAgPSAxXG4gICAgICAgICAgICBAa2V5c1tldmVudC53aGljaCsyNTZdID0gMVxuICAgICAgICAgICAgQGtleXNbZXZlbnQud2hpY2grNTEyXSA9IDEtQGtleXNbZXZlbnQud2hpY2grNTEyXVxuICAgICAgICAgICAgXG4gICAgICAgIHN3aXRjaCBrZXlcbiAgICAgICAgICAgIHdoZW4gJ2UnIHRoZW4gQGNhbWVyYS5tb3ZlVXAoKVxuICAgICAgICAgICAgd2hlbiAncScgdGhlbiBAY2FtZXJhLm1vdmVEb3duKClcbiAgICAgICAgICAgIHdoZW4gJ2EnIHRoZW4gQGNhbWVyYS5tb3ZlTGVmdCgpXG4gICAgICAgICAgICB3aGVuICdkJyB0aGVuIEBjYW1lcmEubW92ZVJpZ2h0KClcbiAgICAgICAgICAgIHdoZW4gJ3cnIHRoZW4gQGNhbWVyYS5tb3ZlRm9yd2FyZCgpXG4gICAgICAgICAgICB3aGVuICdzJyB0aGVuIEBjYW1lcmEubW92ZUJhY2t3YXJkKClcbiAgICAgICAgICAgIHdoZW4gJ3gnICdlc2MnIHRoZW4gQGNhbWVyYS5zdG9wTW92aW5nKClcbiAgICAgICAgICAgIHdoZW4gJ3InIHRoZW4gQGNhbWVyYS5yZXNldCgpXG4gICAgICAgIFxuICAgIG1vZEtleUNvbWJvRXZlbnRVcDogKG1vZCwga2V5LCBjb21ibywgZXZlbnQpIC0+XG5cbiAgICAgICAgIyBrbG9nICdtb2RLZXlDb21ib0V2ZW50VXAnIG1vZCwga2V5LCBjb21ibywgZXZlbnQuY29kZVxuICAgICAgICBpZiBldmVudC53aGljaCA8IDI1NlxuICAgICAgICAgICAgQGtleXNbZXZlbnQud2hpY2hdID0gMFxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGtleVxuICAgICAgICAgICAgd2hlbiAnZScgdGhlbiBAY2FtZXJhLnN0b3BVcCgpXG4gICAgICAgICAgICB3aGVuICdxJyB0aGVuIEBjYW1lcmEuc3RvcERvd24oKVxuICAgICAgICAgICAgd2hlbiAnYScgdGhlbiBAY2FtZXJhLnN0b3BMZWZ0KClcbiAgICAgICAgICAgIHdoZW4gJ2QnIHRoZW4gQGNhbWVyYS5zdG9wUmlnaHQoKVxuICAgICAgICAgICAgd2hlbiAndycgdGhlbiBAY2FtZXJhLnN0b3BGb3J3YXJkKClcbiAgICAgICAgICAgIHdoZW4gJ3MnIHRoZW4gQGNhbWVyYS5zdG9wQmFja3dhcmQoKVxuICAgICAgICBcbiAgICAgICAgXG5tb2R1bGUuZXhwb3J0cyA9IFdvcmxkXG4iXX0=
//# sourceURL=../coffee/world.coffee