// koffee 1.4.0
var $, MainWin, World, gamepad, klog, ref, win,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), gamepad = ref.gamepad, win = ref.win, klog = ref.klog, $ = ref.$;

World = require('./world');

MainWin = (function(superClass) {
    extend(MainWin, superClass);

    function MainWin() {
        this.onPadAxis = bind(this.onPadAxis, this);
        this.onMenuAction = bind(this.onMenuAction, this);
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
        klog('onPadButton', button, value);
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

    MainWin.prototype.onMenuAction = function(action, args) {
        switch (action) {
            case 'Inspector':
                return this.world.toggleInspector();
        }
        return MainWin.__super__.onMenuAction.apply(this, arguments);
    };

    MainWin.prototype.onPadAxis = function(state) {
        return klog('onPadAxis', state);
    };

    return MainWin;

})(win);

new MainWin;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBTUEsSUFBQSwwQ0FBQTtJQUFBOzs7O0FBQUEsTUFBNEIsT0FBQSxDQUFRLEtBQVIsQ0FBNUIsRUFBRSxxQkFBRixFQUFXLGFBQVgsRUFBZ0IsZUFBaEIsRUFBc0I7O0FBRXRCLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFFRjs7O0lBRUMsaUJBQUE7Ozs7O1FBRUMsSUFBQyxDQUFBLElBQUQsR0FBUTtZQUFBLElBQUEsRUFBSztnQkFBQyxDQUFBLEVBQUUsQ0FBSDtnQkFBSyxDQUFBLEVBQUUsQ0FBUDthQUFMO1lBQWdCLEtBQUEsRUFBTTtnQkFBQyxDQUFBLEVBQUUsQ0FBSDtnQkFBSyxDQUFBLEVBQUUsQ0FBUDthQUF0Qjs7UUFDUixJQUFDLENBQUEsT0FBRCxHQUFXO1lBQUEsSUFBQSxFQUFLLENBQUw7WUFBTyxLQUFBLEVBQU0sQ0FBYjs7UUFDWCx5Q0FDSTtZQUFBLEdBQUEsRUFBUSxTQUFSO1lBQ0EsR0FBQSxFQUFRLE9BQUEsQ0FBUSxpQkFBUixDQURSO1lBRUEsSUFBQSxFQUFRLHFCQUZSO1lBR0EsSUFBQSxFQUFRLGlCQUhSO1lBSUEsY0FBQSxFQUFnQixHQUpoQjtZQUtBLE9BQUEsRUFBUyxLQUxUO1lBTUEsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQU5UO1NBREo7SUFKRDs7c0JBYUgsTUFBQSxHQUFRLFNBQUE7UUFFSixJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksS0FBSixDQUFVLENBQUEsQ0FBRSxPQUFGLENBQVY7UUFDVCxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBQTtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLFFBQVIsRUFBaUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUF4QjtRQUVBLE9BQU8sQ0FBQyxFQUFSLENBQVcsUUFBWCxFQUFvQixJQUFDLENBQUEsV0FBckI7ZUFDQSxPQUFPLENBQUMsRUFBUixDQUFXLE1BQVgsRUFBb0IsSUFBQyxDQUFBLFNBQXJCO0lBUEk7O3NCQVNSLFdBQUEsR0FBYSxTQUFDLE1BQUQsRUFBUyxLQUFUO0FBRVQsWUFBQTtRQUFBLElBQUEsQ0FBSyxhQUFMLEVBQW1CLE1BQW5CLEVBQTJCLEtBQTNCO1FBQ0EsR0FBQTtBQUFNLG9CQUFPLE1BQVA7QUFBQSxxQkFDRyxNQURIOzJCQUNnQjtBQURoQixxQkFFRyxNQUZIOzJCQUVnQjtBQUZoQixxQkFHRyxPQUhIOzJCQUdnQjtBQUhoQixxQkFJRyxHQUpIOzJCQUlnQjtBQUpoQixxQkFLRyxHQUxIOzJCQUtnQjtBQUxoQixxQkFNRyxHQU5IOzJCQU1nQjtBQU5oQixxQkFPRyxHQVBIOzJCQU9nQjtBQVBoQixxQkFRRyxJQVJIOzJCQVFnQjtBQVJoQixxQkFTRyxJQVRIOzJCQVNnQjtBQVRoQixxQkFVRyxJQVZIOzJCQVVnQjtBQVZoQixxQkFXRyxJQVhIOzJCQVdnQjtBQVhoQixxQkFZRyxJQVpIO0FBQUEscUJBWVEsTUFaUjtBQUFBLHFCQVllLE1BWmY7QUFBQSxxQkFZc0IsT0FadEI7MkJBWW1DLE1BQU0sQ0FBQyxXQUFQLENBQUE7QUFabkM7O1FBY04sSUFBRyxHQUFIO1lBQ0ksSUFBRyxLQUFIO3VCQUNJLElBQUMsQ0FBQSxLQUFLLENBQUMsb0JBQVAsQ0FBNEIsRUFBNUIsRUFBK0IsR0FBL0IsRUFBb0MsR0FBcEMsRUFESjthQUFBLE1BQUE7dUJBR0ksSUFBQyxDQUFBLEtBQUssQ0FBQyxrQkFBUCxDQUEwQixFQUExQixFQUE2QixHQUE3QixFQUFrQyxHQUFsQyxFQUhKO2FBREo7O0lBakJTOztzQkF1QmIsWUFBQSxHQUFjLFNBQUMsTUFBRCxFQUFTLElBQVQ7QUFJVixnQkFBTyxNQUFQO0FBQUEsaUJBQ1MsV0FEVDtBQUMwQix1QkFBTyxJQUFDLENBQUEsS0FBSyxDQUFDLGVBQVAsQ0FBQTtBQURqQztlQUdBLDJDQUFBLFNBQUE7SUFQVTs7c0JBU2QsU0FBQSxHQUFXLFNBQUMsS0FBRDtlQUVQLElBQUEsQ0FBSyxXQUFMLEVBQWlCLEtBQWpCO0lBRk87Ozs7R0F4RE87O0FBNER0QixJQUFJIiwic291cmNlc0NvbnRlbnQiOlsiIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4jIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMCAgICAgMDBcblxueyBnYW1lcGFkLCB3aW4sIGtsb2csICQgfSA9IHJlcXVpcmUgJ2t4aydcblxuV29ybGQgPSByZXF1aXJlICcuL3dvcmxkJ1xuXG5jbGFzcyBNYWluV2luIGV4dGVuZHMgd2luXG4gICAgXG4gICAgQDogLT5cbiAgICAgICAgXG4gICAgICAgIEBsYXN0ID0gbGVmdDp7eDowIHk6MH0sIHJpZ2h0Ont4OjAgeTowfVxuICAgICAgICBAaW5oaWJpdCA9IGxlZnQ6MCByaWdodDowXG4gICAgICAgIHN1cGVyXG4gICAgICAgICAgICBkaXI6ICAgIF9fZGlybmFtZVxuICAgICAgICAgICAgcGtnOiAgICByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG4gICAgICAgICAgICBtZW51OiAgICcuLi9jb2ZmZWUvbWVudS5ub29uJ1xuICAgICAgICAgICAgaWNvbjogICAnLi4vaW1nL21pbmkucG5nJ1xuICAgICAgICAgICAgcHJlZnNTZXBlcmF0b3I6ICfilrgnXG4gICAgICAgICAgICBjb250ZXh0OiBmYWxzZVxuICAgICAgICAgICAgb25Mb2FkOiBAb25Mb2FkXG4gICAgICAgICAgICBcbiAgICBvbkxvYWQ6ID0+XG5cbiAgICAgICAgQHdvcmxkID0gbmV3IFdvcmxkICQgJyNtYWluJ1xuICAgICAgICBAd29ybGQuc3RhcnQoKVxuICAgICAgICBAd2luLm9uICdyZXNpemUnIEB3b3JsZC5yZXNpemVkICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGdhbWVwYWQub24gJ2J1dHRvbicgQG9uUGFkQnV0dG9uXG4gICAgICAgIGdhbWVwYWQub24gJ2F4aXMnICAgQG9uUGFkQXhpc1xuICAgICAgICBcbiAgICBvblBhZEJ1dHRvbjogKGJ1dHRvbiwgdmFsdWUpID0+XG4gICAgICAgIFxuICAgICAgICBrbG9nICdvblBhZEJ1dHRvbicgYnV0dG9uLCB2YWx1ZVxuICAgICAgICBrZXkgPSBzd2l0Y2ggYnV0dG9uXG4gICAgICAgICAgICB3aGVuICdNZW51JyAgdGhlbiAnZXNjJ1xuICAgICAgICAgICAgd2hlbiAnQmFjaycgIHRoZW4gJ3EnXG4gICAgICAgICAgICB3aGVuICdTdGFydCcgdGhlbiAnZSdcbiAgICAgICAgICAgIHdoZW4gJ0EnICAgICB0aGVuICdzcGFjZSdcbiAgICAgICAgICAgIHdoZW4gJ0InICAgICB0aGVuICdmJ1xuICAgICAgICAgICAgd2hlbiAnWCcgICAgIHRoZW4gJ2N0cmwnXG4gICAgICAgICAgICB3aGVuICdZJyAgICAgdGhlbiAnYydcbiAgICAgICAgICAgIHdoZW4gJ1JUJyAgICB0aGVuICdmJ1xuICAgICAgICAgICAgd2hlbiAnTFQnICAgIHRoZW4gJ2N0cmwnXG4gICAgICAgICAgICB3aGVuICdMQicgICAgdGhlbiAnbGVmdCdcbiAgICAgICAgICAgIHdoZW4gJ1JCJyAgICB0aGVuICdyaWdodCdcbiAgICAgICAgICAgIHdoZW4gJ1VwJyAnRG93bicgJ0xlZnQnICdSaWdodCcgdGhlbiBidXR0b24udG9Mb3dlckNhc2UoKVxuXG4gICAgICAgIGlmIGtleVxuICAgICAgICAgICAgaWYgdmFsdWVcbiAgICAgICAgICAgICAgICBAd29ybGQubW9kS2V5Q29tYm9FdmVudERvd24gJycga2V5LCBrZXlcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBAd29ybGQubW9kS2V5Q29tYm9FdmVudFVwICcnIGtleSwga2V5XG5cbiAgICBvbk1lbnVBY3Rpb246IChhY3Rpb24sIGFyZ3MpID0+XG4gICAgICAgIFxuICAgICAgICAjIGtsb2cgXCJtZW51QWN0aW9uICN7YWN0aW9ufVwiIGFyZ3MsIEB3b3JsZC5zY2VuZS5kZWJ1Z0xheWVyLmlzVmlzaWJsZSgpXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICB3aGVuICdJbnNwZWN0b3InIHRoZW4gcmV0dXJuIEB3b3JsZC50b2dnbGVJbnNwZWN0b3IoKVxuICAgICAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgICAgICAgICAgXG4gICAgb25QYWRBeGlzOiAoc3RhdGUpID0+IFxuXG4gICAgICAgIGtsb2cgJ29uUGFkQXhpcycgc3RhdGVcbiAgICAgICAgXG5uZXcgTWFpbldpbiAgICAgICAgICAgIFxuIl19
//# sourceURL=../coffee/window.coffee