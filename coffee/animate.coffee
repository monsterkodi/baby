###
 0000000   000   000  000  00     00   0000000   000000000  00000000
000   000  0000  000  000  000   000  000   000     000     000     
000000000  000 0 000  000  000000000  000000000     000     0000000 
000   000  000  0000  000  000 0 000  000   000     000     000     
000   000  000   000  000  000   000  000   000     000     00000000
###

animations = []

animate = (f) -> animations.push f

animate.animations = animations

animate.tick = (delta) ->

    anims = animations.slice 0
    animations = []
    for animation in anims
        animation delta

module.exports = animate
