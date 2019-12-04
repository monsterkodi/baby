// koffee 1.6.0
var $, MainWin, World, gamepad, keyinfo, klog, ref, win,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), gamepad = ref.gamepad, keyinfo = ref.keyinfo, win = ref.win, klog = ref.klog, $ = ref.$;

World = require('./world');

MainWin = (function(superClass) {
    extend(MainWin, superClass);

    function MainWin() {
        this.onPadAxis = bind(this.onPadAxis, this);
        this.onMenuAction = bind(this.onMenuAction, this);
        this.onKeyUp = bind(this.onKeyUp, this);
        this.onKeyDown = bind(this.onKeyDown, this);
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

    MainWin.prototype.onKeyDown = function(event) {
        var combo, key, mod, ref1;
        klog('key down');
        ref1 = keyinfo.forEvent(event), mod = ref1.mod, key = ref1.key, combo = ref1.combo;
        this.world.modKeyComboEventDown(mod, key, combo, event);
        return MainWin.__super__.onKeyDown.apply(this, arguments);
    };

    MainWin.prototype.onKeyUp = function(event) {
        var combo, key, mod, ref1;
        ref1 = keyinfo.forEvent(event), mod = ref1.mod, key = ref1.key, combo = ref1.combo;
        this.world.modKeyComboEventUp(mod, key, combo, event);
        return MainWin.__super__.onKeyUp.apply(this, arguments);
    };

    MainWin.prototype.onMenuAction = function(action, args) {
        switch (action) {
            case 'Inspector':
                return this.world.toggleInspector();
        }
        return MainWin.__super__.onMenuAction.apply(this, arguments);
    };

    MainWin.prototype.onPadAxis = function(state) {};

    return MainWin;

})(win);

new MainWin;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBTUEsSUFBQSxtREFBQTtJQUFBOzs7O0FBQUEsTUFBcUMsT0FBQSxDQUFRLEtBQVIsQ0FBckMsRUFBRSxxQkFBRixFQUFXLHFCQUFYLEVBQW9CLGFBQXBCLEVBQXlCLGVBQXpCLEVBQStCOztBQUUvQixLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0FBRUY7OztJQUVDLGlCQUFBOzs7Ozs7O1FBRUMsSUFBQyxDQUFBLElBQUQsR0FBUTtZQUFBLElBQUEsRUFBSztnQkFBQyxDQUFBLEVBQUUsQ0FBSDtnQkFBSyxDQUFBLEVBQUUsQ0FBUDthQUFMO1lBQWdCLEtBQUEsRUFBTTtnQkFBQyxDQUFBLEVBQUUsQ0FBSDtnQkFBSyxDQUFBLEVBQUUsQ0FBUDthQUF0Qjs7UUFDUixJQUFDLENBQUEsT0FBRCxHQUFXO1lBQUEsSUFBQSxFQUFLLENBQUw7WUFBTyxLQUFBLEVBQU0sQ0FBYjs7UUFDWCx5Q0FDSTtZQUFBLEdBQUEsRUFBUSxTQUFSO1lBQ0EsR0FBQSxFQUFRLE9BQUEsQ0FBUSxpQkFBUixDQURSO1lBRUEsSUFBQSxFQUFRLHFCQUZSO1lBR0EsSUFBQSxFQUFRLGlCQUhSO1lBSUEsY0FBQSxFQUFnQixHQUpoQjtZQUtBLE9BQUEsRUFBUyxLQUxUO1lBTUEsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQU5UO1NBREo7SUFKRDs7c0JBYUgsTUFBQSxHQUFRLFNBQUE7UUFFSixJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksS0FBSixDQUFVLENBQUEsQ0FBRSxPQUFGLENBQVY7UUFDVCxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBQTtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLFFBQVIsRUFBaUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUF4QjtRQUVBLE9BQU8sQ0FBQyxFQUFSLENBQVcsUUFBWCxFQUFvQixJQUFDLENBQUEsV0FBckI7ZUFDQSxPQUFPLENBQUMsRUFBUixDQUFXLE1BQVgsRUFBb0IsSUFBQyxDQUFBLFNBQXJCO0lBUEk7O3NCQVNSLFdBQUEsR0FBYSxTQUFDLE1BQUQsRUFBUyxLQUFUO0FBR1QsWUFBQTtRQUFBLEdBQUE7QUFBTSxvQkFBTyxNQUFQO0FBQUEscUJBQ0csTUFESDsyQkFDZ0I7QUFEaEIscUJBRUcsTUFGSDsyQkFFZ0I7QUFGaEIscUJBR0csT0FISDsyQkFHZ0I7QUFIaEIscUJBSUcsR0FKSDsyQkFJZ0I7QUFKaEIscUJBS0csR0FMSDsyQkFLZ0I7QUFMaEIscUJBTUcsR0FOSDsyQkFNZ0I7QUFOaEIscUJBT0csR0FQSDsyQkFPZ0I7QUFQaEIscUJBUUcsSUFSSDsyQkFRZ0I7QUFSaEIscUJBU0csSUFUSDsyQkFTZ0I7QUFUaEIscUJBVUcsSUFWSDsyQkFVZ0I7QUFWaEIscUJBV0csSUFYSDsyQkFXZ0I7QUFYaEIscUJBWUcsSUFaSDtBQUFBLHFCQVlRLE1BWlI7QUFBQSxxQkFZZSxNQVpmO0FBQUEscUJBWXNCLE9BWnRCOzJCQVltQyxNQUFNLENBQUMsV0FBUCxDQUFBO0FBWm5DOztRQWNOLElBQUcsR0FBSDtZQUNJLElBQUcsS0FBSDt1QkFDSSxJQUFDLENBQUEsS0FBSyxDQUFDLG9CQUFQLENBQTRCLEVBQTVCLEVBQStCLEdBQS9CLEVBQW9DLEdBQXBDLEVBREo7YUFBQSxNQUFBO3VCQUdJLElBQUMsQ0FBQSxLQUFLLENBQUMsa0JBQVAsQ0FBMEIsRUFBMUIsRUFBNkIsR0FBN0IsRUFBa0MsR0FBbEMsRUFISjthQURKOztJQWpCUzs7c0JBdUJiLFNBQUEsR0FBVyxTQUFDLEtBQUQ7QUFDUCxZQUFBO1FBQUEsSUFBQSxDQUFLLFVBQUw7UUFDQSxPQUFzQixPQUFPLENBQUMsUUFBUixDQUFpQixLQUFqQixDQUF0QixFQUFFLGNBQUYsRUFBTyxjQUFQLEVBQVk7UUFDWixJQUFDLENBQUEsS0FBSyxDQUFDLG9CQUFQLENBQTRCLEdBQTVCLEVBQWlDLEdBQWpDLEVBQXNDLEtBQXRDLEVBQTZDLEtBQTdDO2VBQ0Esd0NBQUEsU0FBQTtJQUpPOztzQkFNWCxPQUFBLEdBQVMsU0FBQyxLQUFEO0FBQ0wsWUFBQTtRQUFBLE9BQXNCLE9BQU8sQ0FBQyxRQUFSLENBQWlCLEtBQWpCLENBQXRCLEVBQUUsY0FBRixFQUFPLGNBQVAsRUFBWTtRQUNaLElBQUMsQ0FBQSxLQUFLLENBQUMsa0JBQVAsQ0FBMEIsR0FBMUIsRUFBK0IsR0FBL0IsRUFBb0MsS0FBcEMsRUFBMkMsS0FBM0M7ZUFDQSxzQ0FBQSxTQUFBO0lBSEs7O3NCQUtULFlBQUEsR0FBYyxTQUFDLE1BQUQsRUFBUyxJQUFUO0FBSVYsZ0JBQU8sTUFBUDtBQUFBLGlCQUNTLFdBRFQ7QUFDMEIsdUJBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxlQUFQLENBQUE7QUFEakM7ZUFHQSwyQ0FBQSxTQUFBO0lBUFU7O3NCQVNkLFNBQUEsR0FBVyxTQUFDLEtBQUQsR0FBQTs7OztHQW5FTzs7QUF1RXRCLElBQUkiLCJzb3VyY2VzQ29udGVudCI6WyIjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwICAgICAwMFxuXG57IGdhbWVwYWQsIGtleWluZm8sIHdpbiwga2xvZywgJCB9ID0gcmVxdWlyZSAna3hrJ1xuXG5Xb3JsZCA9IHJlcXVpcmUgJy4vd29ybGQnXG5cbmNsYXNzIE1haW5XaW4gZXh0ZW5kcyB3aW5cbiAgICBcbiAgICBAOiAtPlxuICAgICAgICBcbiAgICAgICAgQGxhc3QgPSBsZWZ0Ont4OjAgeTowfSwgcmlnaHQ6e3g6MCB5OjB9XG4gICAgICAgIEBpbmhpYml0ID0gbGVmdDowIHJpZ2h0OjBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgIGRpcjogICAgX19kaXJuYW1lXG4gICAgICAgICAgICBwa2c6ICAgIHJlcXVpcmUgJy4uL3BhY2thZ2UuanNvbidcbiAgICAgICAgICAgIG1lbnU6ICAgJy4uL2NvZmZlZS9tZW51Lm5vb24nXG4gICAgICAgICAgICBpY29uOiAgICcuLi9pbWcvbWluaS5wbmcnXG4gICAgICAgICAgICBwcmVmc1NlcGVyYXRvcjogJ+KWuCdcbiAgICAgICAgICAgIGNvbnRleHQ6IGZhbHNlXG4gICAgICAgICAgICBvbkxvYWQ6IEBvbkxvYWRcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIG9uTG9hZDogPT5cblxuICAgICAgICBAd29ybGQgPSBuZXcgV29ybGQgJCAnI21haW4nXG4gICAgICAgIEB3b3JsZC5zdGFydCgpXG4gICAgICAgIEB3aW4ub24gJ3Jlc2l6ZScgQHdvcmxkLnJlc2l6ZWQgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgZ2FtZXBhZC5vbiAnYnV0dG9uJyBAb25QYWRCdXR0b25cbiAgICAgICAgZ2FtZXBhZC5vbiAnYXhpcycgICBAb25QYWRBeGlzXG4gICAgICAgIFxuICAgIG9uUGFkQnV0dG9uOiAoYnV0dG9uLCB2YWx1ZSkgPT5cbiAgICAgICAgXG4gICAgICAgICMga2xvZyAnb25QYWRCdXR0b24nIGJ1dHRvbiwgdmFsdWVcbiAgICAgICAga2V5ID0gc3dpdGNoIGJ1dHRvblxuICAgICAgICAgICAgd2hlbiAnTWVudScgIHRoZW4gJ2VzYydcbiAgICAgICAgICAgIHdoZW4gJ0JhY2snICB0aGVuICdxJ1xuICAgICAgICAgICAgd2hlbiAnU3RhcnQnIHRoZW4gJ2UnXG4gICAgICAgICAgICB3aGVuICdBJyAgICAgdGhlbiAnc3BhY2UnXG4gICAgICAgICAgICB3aGVuICdCJyAgICAgdGhlbiAnZidcbiAgICAgICAgICAgIHdoZW4gJ1gnICAgICB0aGVuICdjdHJsJ1xuICAgICAgICAgICAgd2hlbiAnWScgICAgIHRoZW4gJ2MnXG4gICAgICAgICAgICB3aGVuICdSVCcgICAgdGhlbiAnZidcbiAgICAgICAgICAgIHdoZW4gJ0xUJyAgICB0aGVuICdjdHJsJ1xuICAgICAgICAgICAgd2hlbiAnTEInICAgIHRoZW4gJ2xlZnQnXG4gICAgICAgICAgICB3aGVuICdSQicgICAgdGhlbiAncmlnaHQnXG4gICAgICAgICAgICB3aGVuICdVcCcgJ0Rvd24nICdMZWZ0JyAnUmlnaHQnIHRoZW4gYnV0dG9uLnRvTG93ZXJDYXNlKClcblxuICAgICAgICBpZiBrZXlcbiAgICAgICAgICAgIGlmIHZhbHVlXG4gICAgICAgICAgICAgICAgQHdvcmxkLm1vZEtleUNvbWJvRXZlbnREb3duICcnIGtleSwga2V5XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgQHdvcmxkLm1vZEtleUNvbWJvRXZlbnRVcCAnJyBrZXksIGtleVxuICAgICAgICAgICAgICAgIFxuICAgIG9uS2V5RG93bjogKGV2ZW50KSA9PlxuICAgICAgICBrbG9nICdrZXkgZG93bidcbiAgICAgICAgeyBtb2QsIGtleSwgY29tYm8gfSA9IGtleWluZm8uZm9yRXZlbnQgZXZlbnRcbiAgICAgICAgQHdvcmxkLm1vZEtleUNvbWJvRXZlbnREb3duIG1vZCwga2V5LCBjb21ibywgZXZlbnRcbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgb25LZXlVcDogKGV2ZW50KSA9PlxuICAgICAgICB7IG1vZCwga2V5LCBjb21ibyB9ID0ga2V5aW5mby5mb3JFdmVudCBldmVudFxuICAgICAgICBAd29ybGQubW9kS2V5Q29tYm9FdmVudFVwIG1vZCwga2V5LCBjb21ibywgZXZlbnRcbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgb25NZW51QWN0aW9uOiAoYWN0aW9uLCBhcmdzKSA9PlxuICAgICAgICBcbiAgICAgICAgIyBrbG9nIFwibWVudUFjdGlvbiAje2FjdGlvbn1cIiBhcmdzLCBAd29ybGQuc2NlbmUuZGVidWdMYXllci5pc1Zpc2libGUoKVxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGFjdGlvblxuICAgICAgICAgICAgd2hlbiAnSW5zcGVjdG9yJyB0aGVuIHJldHVybiBAd29ybGQudG9nZ2xlSW5zcGVjdG9yKClcbiAgICAgICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICAgICAgICAgIFxuICAgIG9uUGFkQXhpczogKHN0YXRlKSA9PiBcblxuICAgICAgICAjIGtsb2cgJ29uUGFkQXhpcycgc3RhdGVcbiAgICAgICAgXG5uZXcgTWFpbldpbiAgICAgICAgICAgIFxuIl19
//# sourceURL=../coffee/window.coffee