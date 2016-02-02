
var gamePlayScreen = function(){};
gamePlayScreen.prototype = {
  preload: function() {},

  create: function(){
    var gamePlayScreenBG = game.add.image(0, 0, "bg_gameplay_screen");
    gamePlayScreenBG.width = constants.screenWidth;
    gamePlayScreenBG.height = constants.screenHeight;
  },

  update: function(){}
};
