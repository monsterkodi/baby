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

    MainWin.prototype.onPadAxis = function(state) {
        return klog('onPadAxis', state);
    };

    return MainWin;

})(win);

new MainWin;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luZG93LmpzIiwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBTUEsSUFBQSwwQ0FBQTtJQUFBOzs7O0FBQUEsTUFBNEIsT0FBQSxDQUFRLEtBQVIsQ0FBNUIsRUFBRSxxQkFBRixFQUFXLGFBQVgsRUFBZ0IsZUFBaEIsRUFBc0I7O0FBRXRCLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7QUFFRjs7O0lBRUMsaUJBQUE7Ozs7UUFFQyxJQUFDLENBQUEsSUFBRCxHQUFRO1lBQUEsSUFBQSxFQUFLO2dCQUFDLENBQUEsRUFBRSxDQUFIO2dCQUFLLENBQUEsRUFBRSxDQUFQO2FBQUw7WUFBZ0IsS0FBQSxFQUFNO2dCQUFDLENBQUEsRUFBRSxDQUFIO2dCQUFLLENBQUEsRUFBRSxDQUFQO2FBQXRCOztRQUNSLElBQUMsQ0FBQSxPQUFELEdBQVc7WUFBQSxJQUFBLEVBQUssQ0FBTDtZQUFPLEtBQUEsRUFBTSxDQUFiOztRQUNYLHlDQUNJO1lBQUEsR0FBQSxFQUFRLFNBQVI7WUFDQSxHQUFBLEVBQVEsT0FBQSxDQUFRLGlCQUFSLENBRFI7WUFFQSxJQUFBLEVBQVEscUJBRlI7WUFHQSxJQUFBLEVBQVEsaUJBSFI7WUFJQSxjQUFBLEVBQWdCLEdBSmhCO1lBS0EsT0FBQSxFQUFTLEtBTFQ7WUFNQSxNQUFBLEVBQVEsSUFBQyxDQUFBLE1BTlQ7U0FESjtJQUpEOztzQkFhSCxNQUFBLEdBQVEsU0FBQTtRQUVKLElBQUMsQ0FBQSxLQUFELEdBQVMsSUFBSSxLQUFKLENBQVUsQ0FBQSxDQUFFLE9BQUYsQ0FBVjtRQUNULElBQUMsQ0FBQSxLQUFLLENBQUMsS0FBUCxDQUFBO1FBQ0EsSUFBQyxDQUFBLEdBQUcsQ0FBQyxFQUFMLENBQVEsUUFBUixFQUFpQixJQUFDLENBQUEsS0FBSyxDQUFDLE9BQXhCO1FBRUEsT0FBTyxDQUFDLEVBQVIsQ0FBVyxRQUFYLEVBQW9CLElBQUMsQ0FBQSxXQUFyQjtlQUNBLE9BQU8sQ0FBQyxFQUFSLENBQVcsTUFBWCxFQUFvQixJQUFDLENBQUEsU0FBckI7SUFQSTs7c0JBU1IsV0FBQSxHQUFhLFNBQUMsTUFBRCxFQUFTLEtBQVQ7QUFFVCxZQUFBO1FBQUEsSUFBQSxDQUFLLGFBQUwsRUFBbUIsTUFBbkIsRUFBMkIsS0FBM0I7UUFDQSxHQUFBO0FBQU0sb0JBQU8sTUFBUDtBQUFBLHFCQUNHLE1BREg7MkJBQ2dCO0FBRGhCLHFCQUVHLE1BRkg7MkJBRWdCO0FBRmhCLHFCQUdHLE9BSEg7MkJBR2dCO0FBSGhCLHFCQUlHLEdBSkg7MkJBSWdCO0FBSmhCLHFCQUtHLEdBTEg7MkJBS2dCO0FBTGhCLHFCQU1HLEdBTkg7MkJBTWdCO0FBTmhCLHFCQU9HLEdBUEg7MkJBT2dCO0FBUGhCLHFCQVFHLElBUkg7MkJBUWdCO0FBUmhCLHFCQVNHLElBVEg7MkJBU2dCO0FBVGhCLHFCQVVHLElBVkg7MkJBVWdCO0FBVmhCLHFCQVdHLElBWEg7MkJBV2dCO0FBWGhCLHFCQVlHLElBWkg7QUFBQSxxQkFZUSxNQVpSO0FBQUEscUJBWWUsTUFaZjtBQUFBLHFCQVlzQixPQVp0QjsyQkFZbUMsTUFBTSxDQUFDLFdBQVAsQ0FBQTtBQVpuQzs7UUFjTixJQUFHLEdBQUg7WUFDSSxJQUFHLEtBQUg7dUJBQ0ksSUFBQyxDQUFBLEtBQUssQ0FBQyxvQkFBUCxDQUE0QixFQUE1QixFQUErQixHQUEvQixFQUFvQyxHQUFwQyxFQURKO2FBQUEsTUFBQTt1QkFHSSxJQUFDLENBQUEsS0FBSyxDQUFDLGtCQUFQLENBQTBCLEVBQTFCLEVBQTZCLEdBQTdCLEVBQWtDLEdBQWxDLEVBSEo7YUFESjs7SUFqQlM7O3NCQXVCYixTQUFBLEdBQVcsU0FBQyxLQUFEO2VBRVAsSUFBQSxDQUFLLFdBQUwsRUFBaUIsS0FBakI7SUFGTzs7OztHQS9DTzs7QUFtRHRCLElBQUkiLCJzb3VyY2VzQ29udGVudCI6WyIjIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAwIDAwMFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwICAgICAwMFxuXG57IGdhbWVwYWQsIHdpbiwga2xvZywgJCB9ID0gcmVxdWlyZSAna3hrJ1xuXG5Xb3JsZCA9IHJlcXVpcmUgJy4vd29ybGQnXG5cbmNsYXNzIE1haW5XaW4gZXh0ZW5kcyB3aW5cbiAgICBcbiAgICBAOiAtPlxuICAgICAgICBcbiAgICAgICAgQGxhc3QgPSBsZWZ0Ont4OjAgeTowfSwgcmlnaHQ6e3g6MCB5OjB9XG4gICAgICAgIEBpbmhpYml0ID0gbGVmdDowIHJpZ2h0OjBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgIGRpcjogICAgX19kaXJuYW1lXG4gICAgICAgICAgICBwa2c6ICAgIHJlcXVpcmUgJy4uL3BhY2thZ2UuanNvbidcbiAgICAgICAgICAgIG1lbnU6ICAgJy4uL2NvZmZlZS9tZW51Lm5vb24nXG4gICAgICAgICAgICBpY29uOiAgICcuLi9pbWcvbWluaS5wbmcnXG4gICAgICAgICAgICBwcmVmc1NlcGVyYXRvcjogJ+KWuCdcbiAgICAgICAgICAgIGNvbnRleHQ6IGZhbHNlXG4gICAgICAgICAgICBvbkxvYWQ6IEBvbkxvYWRcbiAgICAgICAgICAgIFxuICAgIG9uTG9hZDogPT5cblxuICAgICAgICBAd29ybGQgPSBuZXcgV29ybGQgJCAnI21haW4nXG4gICAgICAgIEB3b3JsZC5zdGFydCgpXG4gICAgICAgIEB3aW4ub24gJ3Jlc2l6ZScgQHdvcmxkLnJlc2l6ZWQgICAgICAgIFxuICAgICAgICBcbiAgICAgICAgZ2FtZXBhZC5vbiAnYnV0dG9uJyBAb25QYWRCdXR0b25cbiAgICAgICAgZ2FtZXBhZC5vbiAnYXhpcycgICBAb25QYWRBeGlzXG4gICAgICAgIFxuICAgIG9uUGFkQnV0dG9uOiAoYnV0dG9uLCB2YWx1ZSkgPT5cbiAgICAgICAgXG4gICAgICAgIGtsb2cgJ29uUGFkQnV0dG9uJyBidXR0b24sIHZhbHVlXG4gICAgICAgIGtleSA9IHN3aXRjaCBidXR0b25cbiAgICAgICAgICAgIHdoZW4gJ01lbnUnICB0aGVuICdlc2MnXG4gICAgICAgICAgICB3aGVuICdCYWNrJyAgdGhlbiAncSdcbiAgICAgICAgICAgIHdoZW4gJ1N0YXJ0JyB0aGVuICdlJ1xuICAgICAgICAgICAgd2hlbiAnQScgICAgIHRoZW4gJ3NwYWNlJ1xuICAgICAgICAgICAgd2hlbiAnQicgICAgIHRoZW4gJ2YnXG4gICAgICAgICAgICB3aGVuICdYJyAgICAgdGhlbiAnY3RybCdcbiAgICAgICAgICAgIHdoZW4gJ1knICAgICB0aGVuICdjJ1xuICAgICAgICAgICAgd2hlbiAnUlQnICAgIHRoZW4gJ2YnXG4gICAgICAgICAgICB3aGVuICdMVCcgICAgdGhlbiAnY3RybCdcbiAgICAgICAgICAgIHdoZW4gJ0xCJyAgICB0aGVuICdsZWZ0J1xuICAgICAgICAgICAgd2hlbiAnUkInICAgIHRoZW4gJ3JpZ2h0J1xuICAgICAgICAgICAgd2hlbiAnVXAnICdEb3duJyAnTGVmdCcgJ1JpZ2h0JyB0aGVuIGJ1dHRvbi50b0xvd2VyQ2FzZSgpXG5cbiAgICAgICAgaWYga2V5XG4gICAgICAgICAgICBpZiB2YWx1ZVxuICAgICAgICAgICAgICAgIEB3b3JsZC5tb2RLZXlDb21ib0V2ZW50RG93biAnJyBrZXksIGtleVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIEB3b3JsZC5tb2RLZXlDb21ib0V2ZW50VXAgJycga2V5LCBrZXlcblxuICAgIG9uUGFkQXhpczogKHN0YXRlKSA9PiBcblxuICAgICAgICBrbG9nICdvblBhZEF4aXMnIHN0YXRlXG4gICAgICAgIFxubmV3IE1haW5XaW4gICAgICAgICAgICBcbiJdfQ==
//# sourceURL=../coffee/window.coffee