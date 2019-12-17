###
000      00000000   0000000   00000000  000   000  0000000  
000      000       000        000       0000  000  000   000
000      0000000   000  0000  0000000   000 0 000  000   000
000      000       000   000  000       000  0000  000   000
0000000  00000000   0000000   00000000  000   000  0000000  
###

GUI = require 'babylonjs-gui'
{ Color4 } = require 'babylonjs'

class Legend

    @: (@ui) ->
        
        @panel = new GUI.StackPanel
        @panel.width = "200px"
        @panel.fontSize = "24px"
        @panel.background = "rgba(18,18,18,0.75)"
        @panel.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
        @panel.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
        @ui.addControl @panel

        @header = new GUI.TextBlock
        @header.text = "Legend"
        @header.fontFamily = 'fontMono'
        @header.paddingLeft = "10px"
        @header.paddingBottom = "10px"
        @header.height = "40px"
        @header.color = "white"
        @header.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
        @header.paddingTop = "10px"
        @panel.addControl @header
        @hide()
        
    show: (text) -> 
        
        return @hide() if not text
        @header.text = text
        @panel.isVisible = true
        
    hide: -> @panel.isVisible = false
        
module.exports = Legend
