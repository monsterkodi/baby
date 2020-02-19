// koffee 1.7.0

/*
 0000000   000   000  000  00     00   0000000   000000000  00000000
000   000  0000  000  000  000   000  000   000     000     000     
000000000  000 0 000  000  000000000  000000000     000     0000000 
000   000  000  0000  000  000 0 000  000   000     000     000     
000   000  000   000  000  000   000  000   000     000     00000000
 */
var animate, animations;

animations = [];

animate = function(f) {
    return animations.push(f);
};

animate.animations = animations;

animate.tick = function(delta) {
    var animation, anims, i, len, results;
    anims = animations.slice(0);
    animations = [];
    results = [];
    for (i = 0, len = anims.length; i < len; i++) {
        animation = anims[i];
        results.push(animation(delta));
    }
    return results;
};

module.exports = animate;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0ZS5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsVUFBQSxHQUFhOztBQUViLE9BQUEsR0FBVSxTQUFDLENBQUQ7V0FBTyxVQUFVLENBQUMsSUFBWCxDQUFnQixDQUFoQjtBQUFQOztBQUVWLE9BQU8sQ0FBQyxVQUFSLEdBQXFCOztBQUVyQixPQUFPLENBQUMsSUFBUixHQUFlLFNBQUMsS0FBRDtBQUVYLFFBQUE7SUFBQSxLQUFBLEdBQVEsVUFBVSxDQUFDLEtBQVgsQ0FBaUIsQ0FBakI7SUFDUixVQUFBLEdBQWE7QUFDYjtTQUFBLHVDQUFBOztxQkFDSSxTQUFBLENBQVUsS0FBVjtBQURKOztBQUpXOztBQU9mLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwMFxuMDAwICAgMDAwICAwMDAwICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwICAgICBcbjAwMDAwMDAwMCAgMDAwIDAgMDAwICAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAgICAwMDAgICAgIDAwMDAwMDAgXG4wMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAgICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMDBcbiMjI1xuXG5hbmltYXRpb25zID0gW11cblxuYW5pbWF0ZSA9IChmKSAtPiBhbmltYXRpb25zLnB1c2ggZlxuXG5hbmltYXRlLmFuaW1hdGlvbnMgPSBhbmltYXRpb25zXG5cbmFuaW1hdGUudGljayA9IChkZWx0YSkgLT5cblxuICAgIGFuaW1zID0gYW5pbWF0aW9ucy5zbGljZSAwXG4gICAgYW5pbWF0aW9ucyA9IFtdXG4gICAgZm9yIGFuaW1hdGlvbiBpbiBhbmltc1xuICAgICAgICBhbmltYXRpb24gZGVsdGFcblxubW9kdWxlLmV4cG9ydHMgPSBhbmltYXRlXG4iXX0=
//# sourceURL=../coffee/animate.coffee