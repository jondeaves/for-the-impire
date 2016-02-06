var winScreen = function(){};
module.exports = winScreen;

winScreen.prototype = {
  preload: function() {},

  create: function(){
    var winScreenBG = game.add.image(0, 0, "bg_win_screen");
    winScreenBG.width = game.width;
    winScreenBG.height = game.height;
  },

  update: function(){
    game.input.onTap.add(function() {
      game.state.start('MenuScreen');
    }, this);
  }
};
