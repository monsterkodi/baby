// koffee 1.12.0

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
            dirs: ['poly'],
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbIm1haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLG9CQUFBO0lBQUE7OztBQVFBLE1BQWdCLE9BQUEsQ0FBUSxLQUFSLENBQWhCLEVBQUUsYUFBRixFQUFPOztBQUVEOzs7SUFFQyxjQUFBO1FBRUMsc0NBQ0k7WUFBQSxHQUFBLEVBQWdCLFNBQWhCO1lBQ0EsSUFBQSxFQUFnQixDQUFDLE1BQUQsQ0FEaEI7WUFFQSxHQUFBLEVBQWdCLE9BQUEsQ0FBUSxpQkFBUixDQUZoQjtZQUdBLEtBQUEsRUFBZ0IsWUFIaEI7WUFJQSxJQUFBLEVBQWdCLGdCQUpoQjtZQUtBLEtBQUEsRUFBZ0Isa0JBTGhCO1lBTUEsY0FBQSxFQUFnQixHQU5oQjtZQU9BLEtBQUEsRUFBZ0IsSUFQaEI7WUFRQSxNQUFBLEVBQWdCLEdBUmhCO1lBU0EsUUFBQSxFQUFnQixHQVRoQjtZQVVBLFNBQUEsRUFBZ0IsR0FWaEI7U0FESjtRQWFBLElBQUksQ0FBQyxLQUFMLEdBQWdCO1FBQ2hCLElBQUksQ0FBQyxRQUFMLEdBQWdCO0lBaEJqQjs7OztHQUZZOztBQW9CbkIsSUFBSSIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAgICAgIDAwICAgMDAwMDAwMCAgIDAwMCAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbjAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuMDAwIDAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcbiMjI1xuXG57IGFwcCwgYXJncyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5jbGFzcyBNYWluIGV4dGVuZHMgYXBwXG5cbiAgICBAOiAtPlxuICAgICAgICBcbiAgICAgICAgc3VwZXJcbiAgICAgICAgICAgIGRpcjogICAgICAgICAgICBfX2Rpcm5hbWVcbiAgICAgICAgICAgIGRpcnM6ICAgICAgICAgICBbJ3BvbHknXVxuICAgICAgICAgICAgcGtnOiAgICAgICAgICAgIHJlcXVpcmUgJy4uL3BhY2thZ2UuanNvbidcbiAgICAgICAgICAgIGluZGV4OiAgICAgICAgICAnaW5kZXguaHRtbCdcbiAgICAgICAgICAgIGljb246ICAgICAgICAgICAnLi4vaW1nL2FwcC5pY28nXG4gICAgICAgICAgICBhYm91dDogICAgICAgICAgJy4uL2ltZy9hYm91dC5wbmcnXG4gICAgICAgICAgICBwcmVmc1NlcGVyYXRvcjogJ+KWuCdcbiAgICAgICAgICAgIHdpZHRoOiAgICAgICAgICAxMDI0XG4gICAgICAgICAgICBoZWlnaHQ6ICAgICAgICAgNzY4XG4gICAgICAgICAgICBtaW5XaWR0aDogICAgICAgMzAwXG4gICAgICAgICAgICBtaW5IZWlnaHQ6ICAgICAgMzAwXG4gICAgICAgICAgICBcbiAgICAgICAgYXJncy53YXRjaCAgICA9IHRydWVcbiAgICAgICAgYXJncy5kZXZ0b29scyA9IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG5uZXcgTWFpbiJdfQ==
//# sourceURL=../coffee/main.coffee