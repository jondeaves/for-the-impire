
var winScreen = function(){};
winScreen.prototype = {
  preload: function() {},

  create: function(){
    var winScreenBG = game.add.image(0, 0, "bg_win_screen");
    winScreenBG.width = constants.screenWidth;
    winScreenBG.height = constants.screenHeight;
  },

  update: function(){
    game.input.onTap.add(function() {
      game.state.start('MenuScreen');
    }, this);
  }
};
