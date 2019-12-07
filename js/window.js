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

ref = require('kxk'), gamepad = ref.gamepad, keyinfo = ref.keyinfo, win = ref.win, $ = ref.$;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSw2Q0FBQTtJQUFBOzs7O0FBUUEsTUFBK0IsT0FBQSxDQUFRLEtBQVIsQ0FBL0IsRUFBRSxxQkFBRixFQUFXLHFCQUFYLEVBQW9CLGFBQXBCLEVBQXlCOztBQUV6QixLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0FBRUY7OztJQUVDLGlCQUFBOzs7Ozs7O1FBRUMsSUFBQyxDQUFBLElBQUQsR0FBUTtZQUFBLElBQUEsRUFBSztnQkFBQyxDQUFBLEVBQUUsQ0FBSDtnQkFBSyxDQUFBLEVBQUUsQ0FBUDthQUFMO1lBQWdCLEtBQUEsRUFBTTtnQkFBQyxDQUFBLEVBQUUsQ0FBSDtnQkFBSyxDQUFBLEVBQUUsQ0FBUDthQUF0Qjs7UUFDUixJQUFDLENBQUEsT0FBRCxHQUFXO1lBQUEsSUFBQSxFQUFLLENBQUw7WUFBTyxLQUFBLEVBQU0sQ0FBYjs7UUFDWCx5Q0FDSTtZQUFBLEdBQUEsRUFBUSxTQUFSO1lBQ0EsR0FBQSxFQUFRLE9BQUEsQ0FBUSxpQkFBUixDQURSO1lBRUEsSUFBQSxFQUFRLHFCQUZSO1lBR0EsSUFBQSxFQUFRLGlCQUhSO1lBSUEsY0FBQSxFQUFnQixHQUpoQjtZQUtBLE9BQUEsRUFBUyxLQUxUO1lBTUEsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQU5UO1NBREo7SUFKRDs7c0JBYUgsTUFBQSxHQUFRLFNBQUE7UUFFSixJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksS0FBSixDQUFVLENBQUEsQ0FBRSxPQUFGLENBQVY7UUFDVCxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBQTtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLFFBQVIsRUFBaUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUF4QjtRQUVBLE9BQU8sQ0FBQyxFQUFSLENBQVcsUUFBWCxFQUFvQixJQUFDLENBQUEsV0FBckI7ZUFDQSxPQUFPLENBQUMsRUFBUixDQUFXLE1BQVgsRUFBb0IsSUFBQyxDQUFBLFNBQXJCO0lBUEk7O3NCQWVSLFdBQUEsR0FBYSxTQUFDLE1BQUQsRUFBUyxLQUFUO0FBR1QsWUFBQTtRQUFBLEdBQUE7QUFBTSxvQkFBTyxNQUFQO0FBQUEscUJBQ0csTUFESDsyQkFDZ0I7QUFEaEIscUJBRUcsTUFGSDsyQkFFZ0I7QUFGaEIscUJBR0csT0FISDsyQkFHZ0I7QUFIaEIscUJBSUcsR0FKSDsyQkFJZ0I7QUFKaEIscUJBS0csR0FMSDsyQkFLZ0I7QUFMaEIscUJBTUcsR0FOSDsyQkFNZ0I7QUFOaEIscUJBT0csR0FQSDsyQkFPZ0I7QUFQaEIscUJBUUcsSUFSSDsyQkFRZ0I7QUFSaEIscUJBU0csSUFUSDsyQkFTZ0I7QUFUaEIscUJBVUcsSUFWSDsyQkFVZ0I7QUFWaEIscUJBV0csSUFYSDsyQkFXZ0I7QUFYaEIscUJBWUcsSUFaSDtBQUFBLHFCQVlRLE1BWlI7QUFBQSxxQkFZZSxNQVpmO0FBQUEscUJBWXNCLE9BWnRCOzJCQVltQyxNQUFNLENBQUMsV0FBUCxDQUFBO0FBWm5DOztRQWNOLElBQUcsR0FBSDtZQUNJLElBQUcsS0FBSDt1QkFDSSxJQUFDLENBQUEsS0FBSyxDQUFDLG9CQUFQLENBQTRCLEVBQTVCLEVBQStCLEdBQS9CLEVBQW9DLEdBQXBDLEVBREo7YUFBQSxNQUFBO3VCQUdJLElBQUMsQ0FBQSxLQUFLLENBQUMsa0JBQVAsQ0FBMEIsRUFBMUIsRUFBNkIsR0FBN0IsRUFBa0MsR0FBbEMsRUFISjthQURKOztJQWpCUzs7c0JBdUJiLFNBQUEsR0FBVyxTQUFDLEtBQUQsR0FBQTs7c0JBVVgsU0FBQSxHQUFXLFNBQUMsS0FBRDtBQUVQLFlBQUE7UUFBQSxPQUFzQixPQUFPLENBQUMsUUFBUixDQUFpQixLQUFqQixDQUF0QixFQUFFLGNBQUYsRUFBTyxjQUFQLEVBQVk7O2dCQUNOLENBQUUsb0JBQVIsQ0FBNkIsR0FBN0IsRUFBa0MsR0FBbEMsRUFBdUMsS0FBdkMsRUFBOEMsS0FBOUM7O2VBQ0Esd0NBQUEsU0FBQTtJQUpPOztzQkFNWCxPQUFBLEdBQVMsU0FBQyxLQUFEO0FBRUwsWUFBQTtRQUFBLE9BQXNCLE9BQU8sQ0FBQyxRQUFSLENBQWlCLEtBQWpCLENBQXRCLEVBQUUsY0FBRixFQUFPLGNBQVAsRUFBWTs7Z0JBQ04sQ0FBRSxrQkFBUixDQUEyQixHQUEzQixFQUFnQyxHQUFoQyxFQUFxQyxLQUFyQyxFQUE0QyxLQUE1Qzs7ZUFDQSxzQ0FBQSxTQUFBO0lBSks7O3NCQVlULFlBQUEsR0FBYyxTQUFDLE1BQUQsRUFBUyxJQUFUO0FBSVYsZ0JBQU8sTUFBUDtBQUFBLGlCQUNTLFdBRFQ7QUFDMEIsdUJBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxlQUFQLENBQUE7QUFEakM7ZUFHQSwyQ0FBQSxTQUFBO0lBUFU7Ozs7R0FqRkk7O0FBMEZ0QixJQUFJIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4wMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4wMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAgICAgIDAwXG4jIyNcblxueyBnYW1lcGFkLCBrZXlpbmZvLCB3aW4sICQgfSA9IHJlcXVpcmUgJ2t4aydcblxuV29ybGQgPSByZXF1aXJlICcuL3dvcmxkJ1xuXG5jbGFzcyBNYWluV2luIGV4dGVuZHMgd2luXG4gICAgXG4gICAgQDogLT5cbiAgICAgICAgXG4gICAgICAgIEBsYXN0ID0gbGVmdDp7eDowIHk6MH0sIHJpZ2h0Ont4OjAgeTowfVxuICAgICAgICBAaW5oaWJpdCA9IGxlZnQ6MCByaWdodDowXG4gICAgICAgIHN1cGVyXG4gICAgICAgICAgICBkaXI6ICAgIF9fZGlybmFtZVxuICAgICAgICAgICAgcGtnOiAgICByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG4gICAgICAgICAgICBtZW51OiAgICcuLi9jb2ZmZWUvbWVudS5ub29uJ1xuICAgICAgICAgICAgaWNvbjogICAnLi4vaW1nL21pbmkucG5nJ1xuICAgICAgICAgICAgcHJlZnNTZXBlcmF0b3I6ICfilrgnXG4gICAgICAgICAgICBjb250ZXh0OiBmYWxzZVxuICAgICAgICAgICAgb25Mb2FkOiBAb25Mb2FkXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBvbkxvYWQ6ID0+XG5cbiAgICAgICAgQHdvcmxkID0gbmV3IFdvcmxkICQgJyNtYWluJ1xuICAgICAgICBAd29ybGQuc3RhcnQoKVxuICAgICAgICBAd2luLm9uICdyZXNpemUnIEB3b3JsZC5yZXNpemVkICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGdhbWVwYWQub24gJ2J1dHRvbicgQG9uUGFkQnV0dG9uXG4gICAgICAgIGdhbWVwYWQub24gJ2F4aXMnICAgQG9uUGFkQXhpc1xuICAgICAgICBcbiAgICAjIDAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAwMDAwICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAgICAgICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4gICAgXG4gICAgb25QYWRCdXR0b246IChidXR0b24sIHZhbHVlKSA9PlxuICAgICAgICBcbiAgICAgICAgIyBrbG9nICdvblBhZEJ1dHRvbicgYnV0dG9uLCB2YWx1ZVxuICAgICAgICBrZXkgPSBzd2l0Y2ggYnV0dG9uXG4gICAgICAgICAgICB3aGVuICdNZW51JyAgdGhlbiAnZXNjJ1xuICAgICAgICAgICAgd2hlbiAnQmFjaycgIHRoZW4gJ3EnXG4gICAgICAgICAgICB3aGVuICdTdGFydCcgdGhlbiAnZSdcbiAgICAgICAgICAgIHdoZW4gJ0EnICAgICB0aGVuICdzcGFjZSdcbiAgICAgICAgICAgIHdoZW4gJ0InICAgICB0aGVuICdmJ1xuICAgICAgICAgICAgd2hlbiAnWCcgICAgIHRoZW4gJ2N0cmwnXG4gICAgICAgICAgICB3aGVuICdZJyAgICAgdGhlbiAnYydcbiAgICAgICAgICAgIHdoZW4gJ1JUJyAgICB0aGVuICdmJ1xuICAgICAgICAgICAgd2hlbiAnTFQnICAgIHRoZW4gJ2N0cmwnXG4gICAgICAgICAgICB3aGVuICdMQicgICAgdGhlbiAnbGVmdCdcbiAgICAgICAgICAgIHdoZW4gJ1JCJyAgICB0aGVuICdyaWdodCdcbiAgICAgICAgICAgIHdoZW4gJ1VwJyAnRG93bicgJ0xlZnQnICdSaWdodCcgdGhlbiBidXR0b24udG9Mb3dlckNhc2UoKVxuXG4gICAgICAgIGlmIGtleVxuICAgICAgICAgICAgaWYgdmFsdWVcbiAgICAgICAgICAgICAgICBAd29ybGQubW9kS2V5Q29tYm9FdmVudERvd24gJycga2V5LCBrZXlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAd29ybGQubW9kS2V5Q29tYm9FdmVudFVwICcnIGtleSwga2V5XG4gICAgICAgICAgICAgICAgXG4gICAgb25QYWRBeGlzOiAoc3RhdGUpID0+IFxuXG4gICAgICAgICMga2xvZyAnb25QYWRBeGlzJyBzdGF0ZVxuICAgICAgICAgICAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwICAgXG4gICAgIyAwMDAwMDAwICAgIDAwMDAwMDAgICAgIDAwMDAwICAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwICAgICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMCAgICAgXG4gICAgXG4gICAgb25LZXlEb3duOiAoZXZlbnQpID0+XG5cbiAgICAgICAgeyBtb2QsIGtleSwgY29tYm8gfSA9IGtleWluZm8uZm9yRXZlbnQgZXZlbnRcbiAgICAgICAgQHdvcmxkPy5tb2RLZXlDb21ib0V2ZW50RG93biBtb2QsIGtleSwgY29tYm8sIGV2ZW50XG4gICAgICAgIHN1cGVyXG4gICAgICAgIFxuICAgIG9uS2V5VXA6IChldmVudCkgPT5cbiAgICAgICAgXG4gICAgICAgIHsgbW9kLCBrZXksIGNvbWJvIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG4gICAgICAgIEB3b3JsZD8ubW9kS2V5Q29tYm9FdmVudFVwIG1vZCwga2V5LCBjb21ibywgZXZlbnRcbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgIyAwMCAgICAgMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAwMDAwMDAgIDAwMDAwMDAgICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgMCAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAgXG4gICAgXG4gICAgb25NZW51QWN0aW9uOiAoYWN0aW9uLCBhcmdzKSA9PlxuICAgICAgICBcbiAgICAgICAgIyBrbG9nIFwibWVudUFjdGlvbiAje2FjdGlvbn1cIiBhcmdzLCBAd29ybGQuc2NlbmUuZGVidWdMYXllci5pc1Zpc2libGUoKVxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGFjdGlvblxuICAgICAgICAgICAgd2hlbiAnSW5zcGVjdG9yJyB0aGVuIHJldHVybiBAd29ybGQudG9nZ2xlSW5zcGVjdG9yKClcbiAgICAgICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICAgICAgICAgICAgICAgICAgXG5uZXcgTWFpbldpbiAgICAgICAgICAgIFxuIl19
//# sourceURL=../coffee/window.coffee