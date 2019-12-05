// koffee 1.6.0
var $, MainWin, World, gamepad, keyinfo, ref, win,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), gamepad = ref.gamepad, keyinfo = ref.keyinfo, win = ref.win, $ = ref.$;

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBTUEsSUFBQSw2Q0FBQTtJQUFBOzs7O0FBQUEsTUFBK0IsT0FBQSxDQUFRLEtBQVIsQ0FBL0IsRUFBRSxxQkFBRixFQUFXLHFCQUFYLEVBQW9CLGFBQXBCLEVBQXlCOztBQUV6QixLQUFBLEdBQVEsT0FBQSxDQUFRLFNBQVI7O0FBRUY7OztJQUVDLGlCQUFBOzs7Ozs7O1FBRUMsSUFBQyxDQUFBLElBQUQsR0FBUTtZQUFBLElBQUEsRUFBSztnQkFBQyxDQUFBLEVBQUUsQ0FBSDtnQkFBSyxDQUFBLEVBQUUsQ0FBUDthQUFMO1lBQWdCLEtBQUEsRUFBTTtnQkFBQyxDQUFBLEVBQUUsQ0FBSDtnQkFBSyxDQUFBLEVBQUUsQ0FBUDthQUF0Qjs7UUFDUixJQUFDLENBQUEsT0FBRCxHQUFXO1lBQUEsSUFBQSxFQUFLLENBQUw7WUFBTyxLQUFBLEVBQU0sQ0FBYjs7UUFDWCx5Q0FDSTtZQUFBLEdBQUEsRUFBUSxTQUFSO1lBQ0EsR0FBQSxFQUFRLE9BQUEsQ0FBUSxpQkFBUixDQURSO1lBRUEsSUFBQSxFQUFRLHFCQUZSO1lBR0EsSUFBQSxFQUFRLGlCQUhSO1lBSUEsY0FBQSxFQUFnQixHQUpoQjtZQUtBLE9BQUEsRUFBUyxLQUxUO1lBTUEsTUFBQSxFQUFRLElBQUMsQ0FBQSxNQU5UO1NBREo7SUFKRDs7c0JBYUgsTUFBQSxHQUFRLFNBQUE7UUFFSixJQUFDLENBQUEsS0FBRCxHQUFTLElBQUksS0FBSixDQUFVLENBQUEsQ0FBRSxPQUFGLENBQVY7UUFDVCxJQUFDLENBQUEsS0FBSyxDQUFDLEtBQVAsQ0FBQTtRQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsRUFBTCxDQUFRLFFBQVIsRUFBaUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUF4QjtRQUVBLE9BQU8sQ0FBQyxFQUFSLENBQVcsUUFBWCxFQUFvQixJQUFDLENBQUEsV0FBckI7ZUFDQSxPQUFPLENBQUMsRUFBUixDQUFXLE1BQVgsRUFBb0IsSUFBQyxDQUFBLFNBQXJCO0lBUEk7O3NCQVNSLFdBQUEsR0FBYSxTQUFDLE1BQUQsRUFBUyxLQUFUO0FBR1QsWUFBQTtRQUFBLEdBQUE7QUFBTSxvQkFBTyxNQUFQO0FBQUEscUJBQ0csTUFESDsyQkFDZ0I7QUFEaEIscUJBRUcsTUFGSDsyQkFFZ0I7QUFGaEIscUJBR0csT0FISDsyQkFHZ0I7QUFIaEIscUJBSUcsR0FKSDsyQkFJZ0I7QUFKaEIscUJBS0csR0FMSDsyQkFLZ0I7QUFMaEIscUJBTUcsR0FOSDsyQkFNZ0I7QUFOaEIscUJBT0csR0FQSDsyQkFPZ0I7QUFQaEIscUJBUUcsSUFSSDsyQkFRZ0I7QUFSaEIscUJBU0csSUFUSDsyQkFTZ0I7QUFUaEIscUJBVUcsSUFWSDsyQkFVZ0I7QUFWaEIscUJBV0csSUFYSDsyQkFXZ0I7QUFYaEIscUJBWUcsSUFaSDtBQUFBLHFCQVlRLE1BWlI7QUFBQSxxQkFZZSxNQVpmO0FBQUEscUJBWXNCLE9BWnRCOzJCQVltQyxNQUFNLENBQUMsV0FBUCxDQUFBO0FBWm5DOztRQWNOLElBQUcsR0FBSDtZQUNJLElBQUcsS0FBSDt1QkFDSSxJQUFDLENBQUEsS0FBSyxDQUFDLG9CQUFQLENBQTRCLEVBQTVCLEVBQStCLEdBQS9CLEVBQW9DLEdBQXBDLEVBREo7YUFBQSxNQUFBO3VCQUdJLElBQUMsQ0FBQSxLQUFLLENBQUMsa0JBQVAsQ0FBMEIsRUFBMUIsRUFBNkIsR0FBN0IsRUFBa0MsR0FBbEMsRUFISjthQURKOztJQWpCUzs7c0JBdUJiLFNBQUEsR0FBVyxTQUFDLEtBQUQ7QUFFUCxZQUFBO1FBQUEsT0FBc0IsT0FBTyxDQUFDLFFBQVIsQ0FBaUIsS0FBakIsQ0FBdEIsRUFBRSxjQUFGLEVBQU8sY0FBUCxFQUFZO1FBQ1osSUFBQyxDQUFBLEtBQUssQ0FBQyxvQkFBUCxDQUE0QixHQUE1QixFQUFpQyxHQUFqQyxFQUFzQyxLQUF0QyxFQUE2QyxLQUE3QztlQUNBLHdDQUFBLFNBQUE7SUFKTzs7c0JBTVgsT0FBQSxHQUFTLFNBQUMsS0FBRDtBQUVMLFlBQUE7UUFBQSxPQUFzQixPQUFPLENBQUMsUUFBUixDQUFpQixLQUFqQixDQUF0QixFQUFFLGNBQUYsRUFBTyxjQUFQLEVBQVk7UUFDWixJQUFDLENBQUEsS0FBSyxDQUFDLGtCQUFQLENBQTBCLEdBQTFCLEVBQStCLEdBQS9CLEVBQW9DLEtBQXBDLEVBQTJDLEtBQTNDO2VBQ0Esc0NBQUEsU0FBQTtJQUpLOztzQkFNVCxZQUFBLEdBQWMsU0FBQyxNQUFELEVBQVMsSUFBVDtBQUlWLGdCQUFPLE1BQVA7QUFBQSxpQkFDUyxXQURUO0FBQzBCLHVCQUFPLElBQUMsQ0FBQSxLQUFLLENBQUMsZUFBUCxDQUFBO0FBRGpDO2VBR0EsMkNBQUEsU0FBQTtJQVBVOztzQkFTZCxTQUFBLEdBQVcsU0FBQyxLQUFELEdBQUE7Ozs7R0FwRU87O0FBd0V0QixJQUFJIiwic291cmNlc0NvbnRlbnQiOlsiIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4jIDAwMCAwIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jIDAwICAgICAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMCAgICAgMDBcblxueyBnYW1lcGFkLCBrZXlpbmZvLCB3aW4sICQgfSA9IHJlcXVpcmUgJ2t4aydcblxuV29ybGQgPSByZXF1aXJlICcuL3dvcmxkJ1xuXG5jbGFzcyBNYWluV2luIGV4dGVuZHMgd2luXG4gICAgXG4gICAgQDogLT5cbiAgICAgICAgXG4gICAgICAgIEBsYXN0ID0gbGVmdDp7eDowIHk6MH0sIHJpZ2h0Ont4OjAgeTowfVxuICAgICAgICBAaW5oaWJpdCA9IGxlZnQ6MCByaWdodDowXG4gICAgICAgIHN1cGVyXG4gICAgICAgICAgICBkaXI6ICAgIF9fZGlybmFtZVxuICAgICAgICAgICAgcGtnOiAgICByZXF1aXJlICcuLi9wYWNrYWdlLmpzb24nXG4gICAgICAgICAgICBtZW51OiAgICcuLi9jb2ZmZWUvbWVudS5ub29uJ1xuICAgICAgICAgICAgaWNvbjogICAnLi4vaW1nL21pbmkucG5nJ1xuICAgICAgICAgICAgcHJlZnNTZXBlcmF0b3I6ICfilrgnXG4gICAgICAgICAgICBjb250ZXh0OiBmYWxzZVxuICAgICAgICAgICAgb25Mb2FkOiBAb25Mb2FkXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICBvbkxvYWQ6ID0+XG5cbiAgICAgICAgQHdvcmxkID0gbmV3IFdvcmxkICQgJyNtYWluJ1xuICAgICAgICBAd29ybGQuc3RhcnQoKVxuICAgICAgICBAd2luLm9uICdyZXNpemUnIEB3b3JsZC5yZXNpemVkICAgICAgICBcbiAgICAgICAgXG4gICAgICAgIGdhbWVwYWQub24gJ2J1dHRvbicgQG9uUGFkQnV0dG9uXG4gICAgICAgIGdhbWVwYWQub24gJ2F4aXMnICAgQG9uUGFkQXhpc1xuICAgICAgICBcbiAgICBvblBhZEJ1dHRvbjogKGJ1dHRvbiwgdmFsdWUpID0+XG4gICAgICAgIFxuICAgICAgICAjIGtsb2cgJ29uUGFkQnV0dG9uJyBidXR0b24sIHZhbHVlXG4gICAgICAgIGtleSA9IHN3aXRjaCBidXR0b25cbiAgICAgICAgICAgIHdoZW4gJ01lbnUnICB0aGVuICdlc2MnXG4gICAgICAgICAgICB3aGVuICdCYWNrJyAgdGhlbiAncSdcbiAgICAgICAgICAgIHdoZW4gJ1N0YXJ0JyB0aGVuICdlJ1xuICAgICAgICAgICAgd2hlbiAnQScgICAgIHRoZW4gJ3NwYWNlJ1xuICAgICAgICAgICAgd2hlbiAnQicgICAgIHRoZW4gJ2YnXG4gICAgICAgICAgICB3aGVuICdYJyAgICAgdGhlbiAnY3RybCdcbiAgICAgICAgICAgIHdoZW4gJ1knICAgICB0aGVuICdjJ1xuICAgICAgICAgICAgd2hlbiAnUlQnICAgIHRoZW4gJ2YnXG4gICAgICAgICAgICB3aGVuICdMVCcgICAgdGhlbiAnY3RybCdcbiAgICAgICAgICAgIHdoZW4gJ0xCJyAgICB0aGVuICdsZWZ0J1xuICAgICAgICAgICAgd2hlbiAnUkInICAgIHRoZW4gJ3JpZ2h0J1xuICAgICAgICAgICAgd2hlbiAnVXAnICdEb3duJyAnTGVmdCcgJ1JpZ2h0JyB0aGVuIGJ1dHRvbi50b0xvd2VyQ2FzZSgpXG5cbiAgICAgICAgaWYga2V5XG4gICAgICAgICAgICBpZiB2YWx1ZVxuICAgICAgICAgICAgICAgIEB3b3JsZC5tb2RLZXlDb21ib0V2ZW50RG93biAnJyBrZXksIGtleVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEB3b3JsZC5tb2RLZXlDb21ib0V2ZW50VXAgJycga2V5LCBrZXlcbiAgICAgICAgICAgICAgICBcbiAgICBvbktleURvd246IChldmVudCkgPT5cblxuICAgICAgICB7IG1vZCwga2V5LCBjb21ibyB9ID0ga2V5aW5mby5mb3JFdmVudCBldmVudFxuICAgICAgICBAd29ybGQubW9kS2V5Q29tYm9FdmVudERvd24gbW9kLCBrZXksIGNvbWJvLCBldmVudFxuICAgICAgICBzdXBlclxuICAgICAgICBcbiAgICBvbktleVVwOiAoZXZlbnQpID0+XG4gICAgICAgIFxuICAgICAgICB7IG1vZCwga2V5LCBjb21ibyB9ID0ga2V5aW5mby5mb3JFdmVudCBldmVudFxuICAgICAgICBAd29ybGQubW9kS2V5Q29tYm9FdmVudFVwIG1vZCwga2V5LCBjb21ibywgZXZlbnRcbiAgICAgICAgc3VwZXJcbiAgICAgICAgXG4gICAgb25NZW51QWN0aW9uOiAoYWN0aW9uLCBhcmdzKSA9PlxuICAgICAgICBcbiAgICAgICAgIyBrbG9nIFwibWVudUFjdGlvbiAje2FjdGlvbn1cIiBhcmdzLCBAd29ybGQuc2NlbmUuZGVidWdMYXllci5pc1Zpc2libGUoKVxuICAgICAgICBcbiAgICAgICAgc3dpdGNoIGFjdGlvblxuICAgICAgICAgICAgd2hlbiAnSW5zcGVjdG9yJyB0aGVuIHJldHVybiBAd29ybGQudG9nZ2xlSW5zcGVjdG9yKClcbiAgICAgICAgICAgIFxuICAgICAgICBzdXBlclxuICAgICAgICAgICAgICAgIFxuICAgIG9uUGFkQXhpczogKHN0YXRlKSA9PiBcblxuICAgICAgICAjIGtsb2cgJ29uUGFkQXhpcycgc3RhdGVcbiAgICAgICAgXG5uZXcgTWFpbldpbiAgICAgICAgICAgIFxuIl19
//# sourceURL=../coffee/window.coffee