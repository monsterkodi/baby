# 000   000  000  000   000  0000000     0000000   000   000
# 000 0 000  000  0000  000  000   000  000   000  000 0 000
# 000000000  000  000 0 000  000   000  000   000  000000000
# 000   000  000  000  0000  000   000  000   000  000   000
# 00     00  000  000   000  0000000     0000000   00     00

{ gamepad, keyinfo, win, $ } = require 'kxk'

World = require './world'

class MainWin extends win
    
    @: ->
        
        @last = left:{x:0 y:0}, right:{x:0 y:0}
        @inhibit = left:0 right:0
        super
            dir:    __dirname
            pkg:    require '../package.json'
            menu:   '../coffee/menu.noon'
            icon:   '../img/mini.png'
            prefsSeperator: '▸'
            context: false
            onLoad: @onLoad
                        
    onLoad: =>

        @world = new World $ '#main'
        @world.start()
        @win.on 'resize' @world.resized        
        
        gamepad.on 'button' @onPadButton
        gamepad.on 'axis'   @onPadAxis
        
    onPadButton: (button, value) =>
        
        # klog 'onPadButton' button, value
        key = switch button
            when 'Menu'  then 'esc'
            when 'Back'  then 'q'
            when 'Start' then 'e'
            when 'A'     then 'space'
            when 'B'     then 'f'
            when 'X'     then 'ctrl'
            when 'Y'     then 'c'
            when 'RT'    then 'f'
            when 'LT'    then 'ctrl'
            when 'LB'    then 'left'
            when 'RB'    then 'right'
            when 'Up' 'Down' 'Left' 'Right' then button.toLowerCase()

        if key
            if value
                @world.modKeyComboEventDown '' key, key
            else
                @world.modKeyComboEventUp '' key, key
                
    onKeyDown: (event) =>

        { mod, key, combo } = keyinfo.forEvent event
        @world.modKeyComboEventDown mod, key, combo, event
        super
        
    onKeyUp: (event) =>
        
        { mod, key, combo } = keyinfo.forEvent event
        @world.modKeyComboEventUp mod, key, combo, event
        super
        
    onMenuAction: (action, args) =>
        
        # klog "menuAction #{action}" args, @world.scene.debugLayer.isVisible()
        
        switch action
            when 'Inspector' then return @world.toggleInspector()
            
        super
                
    onPadAxis: (state) => 

        # klog 'onPadAxis' state
        
new MainWin            
