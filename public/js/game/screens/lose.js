
var loseScreen = function(){};
loseScreen.prototype = {
  preload: function() {},

  create: function(){
    var loseScreenBG = game.add.image(0, 0, "bg_lose_screen");
    loseScreenBG.width = constants.screenWidth;
    loseScreenBG.height = constants.screenHeight;
  },

  update: function(){
    game.input.onTap.add(function() {
      game.state.start('MenuScreen');
    }, this);
  }
};
