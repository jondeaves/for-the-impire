
var creditScreen = function(){};
creditScreen.prototype = {
  preload: function() {},

  create: function(){
    var creditScreenBG = game.add.image(0, 0, "bg_credit_screen");
    creditScreenBG.width = constants.screenWidth;
    creditScreenBG.height = constants.screenHeight;
  },

  update: function(){
    game.input.onTap.add(function() {
      game.state.start('MenuScreen');
    }, this);
  }
};
