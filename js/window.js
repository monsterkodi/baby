// koffee 1.6.0

/*
000   000  000  000   000  0000000     0000000   000   000
000 0 000  000  0000  000  000   000  000   000  000 0 000
000000000  000  000 0 000  000   000  000   000  000000000
000   000  000  000  0000  000   000  000   000  000   000
00     00  000  000   000  0000000     0000000   00     00
 */
var $, MainWin, World, keyinfo, ref, win,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), $ = ref.$, keyinfo = ref.keyinfo, win = ref.win;

World = require('./world');

MainWin = (function(superClass) {
    extend(MainWin, superClass);

    function MainWin() {
        this.onMenuAction = bind(this.onMenuAction, this);
        this.onKeyUp = bind(this.onKeyUp, this);
        this.onKeyDown = bind(this.onKeyDown, this);
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
        return this.win.on('resize', this.world.resized);
    };

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0FBQUEsSUFBQSxvQ0FBQTtJQUFBOzs7O0FBUUEsTUFBc0IsT0FBQSxDQUFRLEtBQVIsQ0FBdEIsRUFBRSxTQUFGLEVBQUsscUJBQUwsRUFBYzs7QUFFZCxLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0FBRUY7OztJQUVDLGlCQUFBOzs7OztRQUVDLElBQUMsQ0FBQSxJQUFELEdBQVE7WUFBQSxJQUFBLEVBQUs7Z0JBQUMsQ0FBQSxFQUFFLENBQUg7Z0JBQUssQ0FBQSxFQUFFLENBQVA7YUFBTDtZQUFnQixLQUFBLEVBQU07Z0JBQUMsQ0FBQSxFQUFFLENBQUg7Z0JBQUssQ0FBQSxFQUFFLENBQVA7YUFBdEI7O1FBQ1IsSUFBQyxDQUFBLE9BQUQsR0FBVztZQUFBLElBQUEsRUFBSyxDQUFMO1lBQU8sS0FBQSxFQUFNLENBQWI7O1FBQ1gseUNBQ0k7WUFBQSxHQUFBLEVBQVEsU0FBUjtZQUNBLEdBQUEsRUFBUSxPQUFBLENBQVEsaUJBQVIsQ0FEUjtZQUVBLElBQUEsRUFBUSxxQkFGUjtZQUdBLElBQUEsRUFBUSxpQkFIUjtZQUlBLGNBQUEsRUFBZ0IsR0FKaEI7WUFLQSxPQUFBLEVBQVMsS0FMVDtZQU1BLE1BQUEsRUFBUSxJQUFDLENBQUEsTUFOVDtTQURKO0lBSkQ7O3NCQWFILE1BQUEsR0FBUSxTQUFBO1FBRUosSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFJLEtBQUosQ0FBVSxDQUFBLENBQUUsT0FBRixDQUFWO1FBQ1QsSUFBQyxDQUFBLEtBQUssQ0FBQyxLQUFQLENBQUE7ZUFDQSxJQUFDLENBQUEsR0FBRyxDQUFDLEVBQUwsQ0FBUSxRQUFSLEVBQWlCLElBQUMsQ0FBQSxLQUFLLENBQUMsT0FBeEI7SUFKSTs7c0JBWVIsU0FBQSxHQUFXLFNBQUMsS0FBRDtBQUVQLFlBQUE7UUFBQSxPQUFzQixPQUFPLENBQUMsUUFBUixDQUFpQixLQUFqQixDQUF0QixFQUFFLGNBQUYsRUFBTyxjQUFQLEVBQVk7O2dCQUNOLENBQUUsb0JBQVIsQ0FBNkIsR0FBN0IsRUFBa0MsR0FBbEMsRUFBdUMsS0FBdkMsRUFBOEMsS0FBOUM7O2VBQ0Esd0NBQUEsU0FBQTtJQUpPOztzQkFNWCxPQUFBLEdBQVMsU0FBQyxLQUFEO0FBRUwsWUFBQTtRQUFBLE9BQXNCLE9BQU8sQ0FBQyxRQUFSLENBQWlCLEtBQWpCLENBQXRCLEVBQUUsY0FBRixFQUFPLGNBQVAsRUFBWTs7Z0JBQ04sQ0FBRSxrQkFBUixDQUEyQixHQUEzQixFQUFnQyxHQUFoQyxFQUFxQyxLQUFyQyxFQUE0QyxLQUE1Qzs7ZUFDQSxzQ0FBQSxTQUFBO0lBSks7O3NCQVlULFlBQUEsR0FBYyxTQUFDLE1BQUQsRUFBUyxJQUFUO0FBSVYsZ0JBQU8sTUFBUDtBQUFBLGlCQUNTLFdBRFQ7QUFDMEIsdUJBQU8sSUFBQyxDQUFBLEtBQUssQ0FBQyxlQUFQLENBQUE7QUFEakM7ZUFHQSwyQ0FBQSxTQUFBO0lBUFU7Ozs7R0E3Q0k7O0FBc0R0QixJQUFJIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4wMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4wMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4wMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAgICAgIDAwXG4jIyNcblxueyAkLCBrZXlpbmZvLCB3aW4gfSA9IHJlcXVpcmUgJ2t4aydcblxuV29ybGQgPSByZXF1aXJlICcuL3dvcmxkJ1xuXG5jbGFzcyBNYWluV2luIGV4dGVuZHMgd2luXG4gICAgXG4gICAgQDogLT5cbiAgICAgICAgXG4gICAgICAgIEBsYXN0ID0gbGVmdDp7eDowIHk6MH0sIHJpZ2h0Ont4OjAgeTowfVxuICAgICAgICBAaW5oaWJpdCA9IGxlZnQ6MCByaWdodDowXG4gICAgICAgIHN1cGVyXG4gICAgICAgICAgICBkaXI6ICAgIF9fZGlybmFtZVxuICAgICAgICAgICAgcGtnOiAgICByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG4gICAgICAgICAgICBtZW51OiAgICcuLi9jb2ZmZWUvbWVudS5ub29uJ1xuICAgICAgICAgICAgaWNvbjogICAnLi4vaW1nL21pbmkucG5nJ1xuICAgICAgICAgICAgcHJlZnNTZXBlcmF0b3I6ICfilrgnXG4gICAgICAgICAgICBjb250ZXh0OiBmYWxzZVxuICAgICAgICAgICAgb25Mb2FkOiBAb25Mb2FkXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBvbkxvYWQ6ID0+XG5cbiAgICAgICAgQHdvcmxkID0gbmV3IFdvcmxkICQgJyNtYWluJ1xuICAgICAgICBAd29ybGQuc3RhcnQoKVxuICAgICAgICBAd2luLm9uICdyZXNpemUnIEB3b3JsZC5yZXNpemVkICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgIFxuICAgICMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDAgICBcbiAgICAjIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDAgICAgXG4gICAgIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDAgICAgIFxuICAgICMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwICAgICBcbiAgICBcbiAgICBvbktleURvd246IChldmVudCkgPT5cblxuICAgICAgICB7IG1vZCwga2V5LCBjb21ibyB9ID0ga2V5aW5mby5mb3JFdmVudCBldmVudFxuICAgICAgICBAd29ybGQ/Lm1vZEtleUNvbWJvRXZlbnREb3duIG1vZCwga2V5LCBjb21ibywgZXZlbnRcbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgb25LZXlVcDogKGV2ZW50KSA9PlxuICAgICAgICBcbiAgICAgICAgeyBtb2QsIGtleSwgY29tYm8gfSA9IGtleWluZm8uZm9yRXZlbnQgZXZlbnRcbiAgICAgICAgQHdvcmxkPy5tb2RLZXlDb21ib0V2ZW50VXAgbW9kLCBrZXksIGNvbWJvLCBldmVudFxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICAjIDAwICAgICAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMDAwMDAwMCAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAwIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbiAgICAjIDAwMCAgIDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgICBcbiAgICBcbiAgICBvbk1lbnVBY3Rpb246IChhY3Rpb24sIGFyZ3MpID0+XG4gICAgICAgIFxuICAgICAgICAjIGtsb2cgXCJtZW51QWN0aW9uICN7YWN0aW9ufVwiIGFyZ3MsIEB3b3JsZC5zY2VuZS5kZWJ1Z0xheWVyLmlzVmlzaWJsZSgpXG4gICAgICAgIFxuICAgICAgICBzd2l0Y2ggYWN0aW9uXG4gICAgICAgICAgICB3aGVuICdJbnNwZWN0b3InIHRoZW4gcmV0dXJuIEB3b3JsZC50b2dnbGVJbnNwZWN0b3IoKVxuICAgICAgICAgICAgXG4gICAgICAgIHN1cGVyXG4gICAgICAgICAgICAgICAgICAgICAgICBcbm5ldyBNYWluV2luICAgICAgICAgICAgXG4iXX0=
//# sourceURL=../coffee/window.coffee