var gamePlayScreen = function(){};
module.exports = gamePlayScreen;

gamePlayScreen.prototype = {
  preload: function() {},

  create: function(){
    var gamePlayScreenBG = game.add.image(0, 0, "bg_gameplay_screen");
    gamePlayScreenBG.width = game.width;
    gamePlayScreenBG.height = game.height;
  },

  update: function(){}
};
