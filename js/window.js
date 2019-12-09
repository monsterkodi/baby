// koffee 1.6.0

/*
000   000  000  000   000  0000000     0000000   000   000
000 0 000  000  0000  000  000   000  000   000  000 0 000
000000000  000  000 0 000  000   000  000   000  000000000
000   000  000  000  0000  000   000  000   000  000   000
00     00  000  000   000  0000000     0000000   00     00
 */
var $, MainWin, World, gamepad, keyinfo, ref, win,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), $ = ref.$, gamepad = ref.gamepad, keyinfo = ref.keyinfo, win = ref.win;

World = require('./world');

MainWin = (function(superClass) {
    extend(MainWin, superClass);

    function MainWin() {
        this.onMenuAction = bind(this.onMenuAction, this);
        this.onKeyUp = bind(this.onKeyUp, this);
        this.onKeyDown = bind(this.onKeyDown, this);
        this.onPadAxis = bind(this.onPadAxis, this);
        this.onPadButton = bind(this.onPadButton, this);
        this.onLoad = bind(this.onLoad, this);
        this.last = {
            left: {
                x: 0,
                y: 0
            },
            right: {
                x: 0,
                y: 0
            }
        };
        this.inhibit = {
            left: 0,
            right: 0
        };
        MainWin.__super__.constructor.call(this, {
            dir: __dirname,
            pkg: require('../package.json'),
            menu: '../coffee/menu.noon',
            icon: '../img/mini.png',
            prefsSeperator: '▸',
            context: false,
            onLoad: this.onLoad
        });
    }

    MainWin.prototype.onLoad = function() {
        this.world = new World($('#main'));
        this.world.start();
        this.win.on('resize', this.world.resized);
        gamepad.on('button', this.onPadButton);
        return gamepad.on('axis', this.onPadAxis);
    };

    MainWin.prototype.onPadButton = function(button, value) {
        var key;
        key = (function() {
            switch (button) {
                case 'Menu':
                    return 'esc';
                case 'Back':
                    return 'q';
                case 'Start':
                    return 'e';
                case 'A':
                    return 'space';
                case 'B':
                    return 'f';
                case 'X':
                    return 'ctrl';
                case 'Y':
                    return 'c';
                case 'RT':
                    return 'f';
                case 'LT':
                    return 'ctrl';
                case 'LB':
                    return 'left';
                case 'RB':
                    return 'right';
                case 'Up':
                case 'Down':
                case 'Left':
                case 'Right':
                    return button.toLowerCase();
            }
        })();
        if (key) {
            if (value) {
                return this.world.modKeyComboEventDown('', key, key);
            } else {
                return this.world.modKeyComboEventUp('', key, key);
            }
        }
    };

    MainWin.prototype.onPadAxis = function(state) {};

    MainWin.prototype.onKeyDown = function(event) {
        var combo, key, mod, ref1, ref2;
        ref1 = keyinfo.forEvent(event), mod = ref1.mod, key = ref1.key, combo = ref1.combo;
        if ((ref2 = this.world) != null) {
            ref2.modKeyComboEventDown(mod, key, combo, event);
        }
        return MainWin.__super__.onKeyDown.apply(this, arguments);
    };

    MainWin.prototype.onKeyUp = function(event) {
        var combo, key, mod, ref1, ref2;
        ref1 = keyinfo.forEvent(event), mod = ref1.mod, key = ref1.key, combo = ref1.combo;
        if ((ref2 = this.world) != null) {
            ref2.modKeyComboEventUp(mod, key, combo, event);
        }
        return MainWin.__super__.onKeyUp.apply(this, arguments);
    };

    MainWin.prototype.onMenuAction = function(action, args) {
        switch (action) {
            case 'Inspector':
                return this.world.toggleInspector();
        }
        return MainWin.__super__.onMenuAction.apply(this, arguments);
    };

    return MainWin;

})(win);

new MainWin;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw2Q0FBQTtJQUFBOzs7O0FBUUEsTUFBK0IsT0FBQSxDQUFRLEtBQVIsQ0FBL0IsRUFBRSxTQUFGLEVBQUsscUJBQUwsRUFBYyxxQkFBZCxFQUF1Qjs7QUFFdkIsS0FBQSxHQUFRLE9BQUEsQ0FBUSxTQUFSOztBQUVGOzs7SUFFQyxpQkFBQTs7Ozs7OztRQUVDLElBQUMsQ0FBQSxJQUFELEdBQVE7WUFBQSxJQUFBLEVBQUs7Z0JBQUMsQ0FBQSxFQUFFLENBQUg7Z0JBQUssQ0FBQSxFQUFFLENBQVA7YUFBTDtZQUFnQixLQUFBLEVBQU07Z0JBQUMsQ0FBQSxFQUFFLENBQUg7Z0JBQUssQ0FBQSxFQUFFLENBQVA7YUFBdEI7O1FBQ1IsSUFBQyxDQUFBLE9BQUQsR0FBVztZQUFBLElBQUEsRUFBSyxDQUFMO1lBQU8sS0FBQSxFQUFNLENBQWI7O1FBQ1gseUNBQ0k7WUFBQSxHQUFBLEVBQVEsU0FBUjtZQUNBLEdBQUEsRUFBUSxPQUFBLENBQVEsaUJBQVIsQ0FEUjtZQUVBLElBQUEsRUFBUSxxQkFGUjtZQUdBLElBQUEsRUFBUSxpQkFIUjtZQUlBLGNBQUEsRUFBZ0IsR0FKaEI7WUFLQSxPQUFBLEVBQVMsS0FMVDtZQU1BLE1BQUEsRUFBUSxJQUFDLENBQUEsTUFOVDtTQURKO0lBSkQ7O3NCQWFILE1BQUEsR0FBUSxTQUFBO1FBRUosSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLEtBQUosQ0FBVSxDQUFBLENBQUUsT0FBRixDQUFWO1FBQ1QsSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUFQLENBQUE7UUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxRQUFSLEVBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBeEI7UUFFQSxPQUFPLENBQUMsRUFBUixDQUFXLFFBQVgsRUFBb0IsSUFBQyxDQUFBLFdBQXJCO2VBQ0EsT0FBTyxDQUFDLEVBQVIsQ0FBVyxNQUFYLEVBQW9CLElBQUMsQ0FBQSxTQUFyQjtJQVBJOztzQkFlUixXQUFBLEdBQWEsU0FBQyxNQUFELEVBQVMsS0FBVDtBQUdULFlBQUE7UUFBQSxHQUFBO0FBQU0sb0JBQU8sTUFBUDtBQUFBLHFCQUNHLE1BREg7MkJBQ2dCO0FBRGhCLHFCQUVHLE1BRkg7MkJBRWdCO0FBRmhCLHFCQUdHLE9BSEg7MkJBR2dCO0FBSGhCLHFCQUlHLEdBSkg7MkJBSWdCO0FBSmhCLHFCQUtHLEdBTEg7MkJBS2dCO0FBTGhCLHFCQU1HLEdBTkg7MkJBTWdCO0FBTmhCLHFCQU9HLEdBUEg7MkJBT2dCO0FBUGhCLHFCQVFHLElBUkg7MkJBUWdCO0FBUmhCLHFCQVNHLElBVEg7MkJBU2dCO0FBVGhCLHFCQVVHLElBVkg7MkJBVWdCO0FBVmhCLHFCQVdHLElBWEg7MkJBV2dCO0FBWGhCLHFCQVlHLElBWkg7QUFBQSxxQkFZUSxNQVpSO0FBQUEscUJBWWUsTUFaZjtBQUFBLHFCQVlzQixPQVp0QjsyQkFZbUMsTUFBTSxDQUFDLFdBQVAsQ0FBQTtBQVpuQzs7UUFjTixJQUFHLEdBQUg7WUFDSSxJQUFHLEtBQUg7dUJBQ0ksSUFBQyxDQUFBLEtBQUssQ0FBQyxvQkFBUCxDQUE0QixFQUE1QixFQUErQixHQUEvQixFQUFvQyxHQUFwQyxFQURKO2FBQUEsTUFBQTt1QkFHSSxJQUFDLENBQUEsS0FBSyxDQUFDLGtCQUFQLENBQTBCLEVBQTFCLEVBQTZCLEdBQTdCLEVBQWtDLEdBQWxDLEVBSEo7YUFESjs7SUFqQlM7O3NCQXVCYixTQUFBLEdBQVcsU0FBQyxLQUFELEdBQUE7O3NCQVVYLFNBQUEsR0FBVyxTQUFDLEtBQUQ7QUFFUCxZQUFBO1FBQUEsT0FBc0IsT0FBTyxDQUFDLFFBQVIsQ0FBaUIsS0FBakIsQ0FBdEIsRUFBRSxjQUFGLEVBQU8sY0FBUCxFQUFZOztnQkFDTixDQUFFLG9CQUFSLENBQTZCLEdBQTdCLEVBQWtDLEdBQWxDLEVBQXVDLEtBQXZDLEVBQThDLEtBQTlDOztlQUNBLHdDQUFBLFNBQUE7SUFKTzs7c0JBTVgsT0FBQSxHQUFTLFNBQUMsS0FBRDtBQUVMLFlBQUE7UUFBQSxPQUFzQixPQUFPLENBQUMsUUFBUixDQUFpQixLQUFqQixDQUF0QixFQUFFLGNBQUYsRUFBTyxjQUFQLEVBQVk7O2dCQUNOLENBQUUsa0JBQVIsQ0FBMkIsR0FBM0IsRUFBZ0MsR0FBaEMsRUFBcUMsS0FBckMsRUFBNEMsS0FBNUM7O2VBQ0Esc0NBQUEsU0FBQTtJQUpLOztzQkFZVCxZQUFBLEdBQWMsU0FBQyxNQUFELEVBQVMsSUFBVDtBQUlWLGdCQUFPLE1BQVA7QUFBQSxpQkFDUyxXQURUO0FBQzBCLHVCQUFPLElBQUMsQ0FBQSxLQUFLLENBQUMsZUFBUCxDQUFBO0FBRGpDO2VBR0EsMkNBQUEsU0FBQTtJQVBVOzs7O0dBakZJOztBQTBGdEIsSUFBSSIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMFxuMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwICAgICAwMFxuIyMjXG5cbnsgJCwgZ2FtZXBhZCwga2V5aW5mbywgd2luIH0gPSByZXF1aXJlICdreGsnXG5cbldvcmxkID0gcmVxdWlyZSAnLi93b3JsZCdcblxuY2xhc3MgTWFpbldpbiBleHRlbmRzIHdpblxuICAgIFxuICAgIEA6IC0+XG4gICAgICAgIFxuICAgICAgICBAbGFzdCA9IGxlZnQ6e3g6MCB5OjB9LCByaWdodDp7eDowIHk6MH1cbiAgICAgICAgQGluaGliaXQgPSBsZWZ0OjAgcmlnaHQ6MFxuICAgICAgICBzdXBlclxuICAgICAgICAgICAgZGlyOiAgICBfX2Rpcm5hbWVcbiAgICAgICAgICAgIHBrZzogICAgcmVxdWlyZSAnLi4vcGFja2FnZS5qc29uJ1xuICAgICAgICAgICAgbWVudTogICAnLi4vY29mZmVlL21lbnUubm9vbidcbiAgICAgICAgICAgIGljb246ICAgJy4uL2ltZy9taW5pLnBuZydcbiAgICAgICAgICAgIHByZWZzU2VwZXJhdG9yOiAn4pa4J1xuICAgICAgICAgICAgY29udGV4dDogZmFsc2VcbiAgICAgICAgICAgIG9uTG9hZDogQG9uTG9hZFxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgb25Mb2FkOiA9PlxuXG4gICAgICAgIEB3b3JsZCA9IG5ldyBXb3JsZCAkICcjbWFpbidcbiAgICAgICAgQHdvcmxkLnN0YXJ0KClcbiAgICAgICAgQHdpbi5vbiAncmVzaXplJyBAd29ybGQucmVzaXplZCAgICAgICAgXG4gICAgICAgIFxuICAgICAgICBnYW1lcGFkLm9uICdidXR0b24nIEBvblBhZEJ1dHRvblxuICAgICAgICBnYW1lcGFkLm9uICdheGlzJyAgIEBvblBhZEF4aXNcbiAgICAgICAgXG4gICAgIyAwMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuICAgIFxuICAgIG9uUGFkQnV0dG9uOiAoYnV0dG9uLCB2YWx1ZSkgPT5cbiAgICAgICAgXG4gICAgICAgICMga2xvZyAnb25QYWRCdXR0b24nIGJ1dHRvbiwgdmFsdWVcbiAgICAgICAga2V5ID0gc3dpdGNoIGJ1dHRvblxuICAgICAgICAgICAgd2hlbiAnTWVudScgIHRoZW4gJ2VzYydcbiAgICAgICAgICAgIHdoZW4gJ0JhY2snICB0aGVuICdxJ1xuICAgICAgICAgICAgd2hlbiAnU3RhcnQnIHRoZW4gJ2UnXG4gICAgICAgICAgICB3aGVuICdBJyAgICAgdGhlbiAnc3BhY2UnXG4gICAgICAgICAgICB3aGVuICdCJyAgICAgdGhlbiAnZidcbiAgICAgICAgICAgIHdoZW4gJ1gnICAgICB0aGVuICdjdHJsJ1xuICAgICAgICAgICAgd2hlbiAnWScgICAgIHRoZW4gJ2MnXG4gICAgICAgICAgICB3aGVuICdSVCcgICAgdGhlbiAnZidcbiAgICAgICAgICAgIHdoZW4gJ0xUJyAgICB0aGVuICdjdHJsJ1xuICAgICAgICAgICAgd2hlbiAnTEInICAgIHRoZW4gJ2xlZnQnXG4gICAgICAgICAgICB3aGVuICdSQicgICAgdGhlbiAncmlnaHQnXG4gICAgICAgICAgICB3aGVuICdVcCcgJ0Rvd24nICdMZWZ0JyAnUmlnaHQnIHRoZW4gYnV0dG9uLnRvTG93ZXJDYXNlKClcblxuICAgICAgICBpZiBrZXlcbiAgICAgICAgICAgIGlmIHZhbHVlXG4gICAgICAgICAgICAgICAgQHdvcmxkLm1vZEtleUNvbWJvRXZlbnREb3duICcnIGtleSwga2V5XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHdvcmxkLm1vZEtleUNvbWJvRXZlbnRVcCAnJyBrZXksIGtleVxuICAgICAgICAgICAgICAgIFxuICAgIG9uUGFkQXhpczogKHN0YXRlKSA9PiBcblxuICAgICAgICAjIGtsb2cgJ29uUGFkQXhpcycgc3RhdGVcbiAgICAgICAgICAgICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgMDAwIDAwMCAgIFxuICAgICMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMCAgICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAgIDAwMCAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAwMDAgICAgIFxuICAgIFxuICAgIG9uS2V5RG93bjogKGV2ZW50KSA9PlxuXG4gICAgICAgIHsgbW9kLCBrZXksIGNvbWJvIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgICAgIEB3b3JsZD8ubW9kS2V5Q29tYm9FdmVudERvd24gbW9kLCBrZXksIGNvbWJvLCBldmVudFxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICBvbktleVVwOiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICB7IG1vZCwga2V5LCBjb21ibyB9ID0ga2V5aW5mby5mb3JFdmVudCBldmVudFxuICAgICAgICBAd29ybGQ/Lm1vZEtleUNvbWJvRXZlbnRVcCBtb2QsIGtleSwgY29tYm8sIGV2ZW50XG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgICMgMDAgICAgIDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwMDAwMDAwICAwMDAwMDAwICAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwIDAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgIFxuICAgIFxuICAgIG9uTWVudUFjdGlvbjogKGFjdGlvbiwgYXJncykgPT5cbiAgICAgICAgXG4gICAgICAgICMga2xvZyBcIm1lbnVBY3Rpb24gI3thY3Rpb259XCIgYXJncywgQHdvcmxkLnNjZW5lLmRlYnVnTGF5ZXIuaXNWaXNpYmxlKClcbiAgICAgICAgXG4gICAgICAgIHN3aXRjaCBhY3Rpb25cbiAgICAgICAgICAgIHdoZW4gJ0luc3BlY3RvcicgdGhlbiByZXR1cm4gQHdvcmxkLnRvZ2dsZUluc3BlY3RvcigpXG4gICAgICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIFxubmV3IE1haW5XaW4gICAgICAgICAgICBcbiJdfQ==
//# sourceURL=../coffee/window.coffee