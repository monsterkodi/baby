###
000   000  000  000   000  0000000     0000000   000   000
000 0 000  000  0000  000  000   000  000   000  000 0 000
000000000  000  000 0 000  000   000  000   000  000000000
000   000  000  000  0000  000   000  000   000  000   000
00     00  000  000   000  0000000     0000000   00     00
###

{ $, keyinfo, win } = require 'kxk'

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
                                
    # 000   000  00000000  000   000  
    # 000  000   000        000 000   
    # 0000000    0000000     00000    
    # 000  000   000          000     
    # 000   000  00000000     000     
    
    onKeyDown: (event) =>

        { mod, key, combo } = keyinfo.forEvent event
        @world?.modKeyComboEventDown mod, key, combo, event
        super
        
    onKeyUp: (event) =>
        
        { mod, key, combo } = keyinfo.forEvent event
        @world?.modKeyComboEventUp mod, key, combo, event
        super
        
    # 00     00  00000000  000   000  000   000  
    # 000   000  000       0000  000  000   000  
    # 000000000  0000000   000 0 000  000   000  
    # 000 0 000  000       000  0000  000   000  
    # 000   000  00000000  000   000   0000000   
    
    onMenuAction: (action, args) =>
        
        # klog "menuAction #{action}" args, @world.scene.debugLayer.isVisible()
        
        switch action
            when 'Inspector' then return @world.toggleInspector()
            
        super
                        
new MainWin            
