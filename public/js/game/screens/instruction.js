
var instructionScreen = function(){};
instructionScreen.prototype = {
  preload: function() {},

  create: function(){
    var instructionScreenBG = game.add.image(0, 0, "bg_instruction_screen");
    instructionScreenBG.width = constants.screenWidth;
    instructionScreenBG.height = constants.screenHeight;
  },

  update: function(){
    game.input.onTap.add(function() {
      game.state.start('MenuScreen');
    }, this);
  }
};
