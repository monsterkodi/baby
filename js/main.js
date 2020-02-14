// koffee 1.6.0

/*
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
 */
var Main, app, args, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

ref = require('kxk'), app = ref.app, args = ref.args;

Main = (function(superClass) {
    extend(Main, superClass);

    function Main() {
        Main.__super__.constructor.call(this, {
            dir: __dirname,
            dirs: ['poly', '../shader'],
            pkg: require('../package.json'),
            index: 'index.html',
            icon: '../img/app.ico',
            about: '../img/about.png',
            prefsSeperator: '▸',
            width: 1024,
            height: 768,
            minWidth: 300,
            minHeight: 300
        });
        args.watch = true;
        args.devtools = true;
    }

    return Main;

})(app);

new Main;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsb0JBQUE7SUFBQTs7O0FBUUEsTUFBZ0IsT0FBQSxDQUFRLEtBQVIsQ0FBaEIsRUFBRSxhQUFGLEVBQU87O0FBRUQ7OztJQUVDLGNBQUE7UUFFQyxzQ0FDSTtZQUFBLEdBQUEsRUFBZ0IsU0FBaEI7WUFDQSxJQUFBLEVBQWdCLENBQUMsTUFBRCxFQUFPLFdBQVAsQ0FEaEI7WUFFQSxHQUFBLEVBQWdCLE9BQUEsQ0FBUSxpQkFBUixDQUZoQjtZQUdBLEtBQUEsRUFBZ0IsWUFIaEI7WUFJQSxJQUFBLEVBQWdCLGdCQUpoQjtZQUtBLEtBQUEsRUFBZ0Isa0JBTGhCO1lBTUEsY0FBQSxFQUFnQixHQU5oQjtZQU9BLEtBQUEsRUFBZ0IsSUFQaEI7WUFRQSxNQUFBLEVBQWdCLEdBUmhCO1lBU0EsUUFBQSxFQUFnQixHQVRoQjtZQVVBLFNBQUEsRUFBZ0IsR0FWaEI7U0FESjtRQWFBLElBQUksQ0FBQyxLQUFMLEdBQWdCO1FBQ2hCLElBQUksQ0FBQyxRQUFMLEdBQWdCO0lBaEJqQjs7OztHQUZZOztBQW9CbkIsSUFBSSIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbjAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IGFwcCwgYXJncyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5jbGFzcyBNYWluIGV4dGVuZHMgYXBwXG5cbiAgICBAOiAtPlxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgIGRpcjogICAgICAgICAgICBfX2Rpcm5hbWVcbiAgICAgICAgICAgIGRpcnM6ICAgICAgICAgICBbJ3BvbHknJy4uL3NoYWRlciddXG4gICAgICAgICAgICBwa2c6ICAgICAgICAgICAgcmVxdWlyZSAnLi4vcGFja2FnZS5qc29uJ1xuICAgICAgICAgICAgaW5kZXg6ICAgICAgICAgICdpbmRleC5odG1sJ1xuICAgICAgICAgICAgaWNvbjogICAgICAgICAgICcuLi9pbWcvYXBwLmljbydcbiAgICAgICAgICAgIGFib3V0OiAgICAgICAgICAnLi4vaW1nL2Fib3V0LnBuZydcbiAgICAgICAgICAgIHByZWZzU2VwZXJhdG9yOiAn4pa4J1xuICAgICAgICAgICAgd2lkdGg6ICAgICAgICAgIDEwMjRcbiAgICAgICAgICAgIGhlaWdodDogICAgICAgICA3NjhcbiAgICAgICAgICAgIG1pbldpZHRoOiAgICAgICAzMDBcbiAgICAgICAgICAgIG1pbkhlaWdodDogICAgICAzMDBcbiAgICAgICAgICAgIFxuICAgICAgICBhcmdzLndhdGNoICAgID0gdHJ1ZVxuICAgICAgICBhcmdzLmRldnRvb2xzID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbm5ldyBNYWluIl19
//# sourceURL=../coffee/main.coffee