
var menuScreen = function(){};
menuScreen.prototype = {
  preload: function() {},

  create: function(){
    var menuScreenBG = game.add.image(0, 0, "bg_start_screen");
    menuScreenBG.width = constants.screenWidth;
    menuScreenBG.height = constants.screenHeight;


    // Create clickable buttons
    startBtn = game.add.button(game.world.centerX - 130, 227, 'sprite_btn_start', function() {
      game.state.start("GamePlayScreen");
    }, this, 2, 1, 0);
    startBtn.scale.setTo(0.65, 0.65);

    instructionBtn = game.add.button(game.world.centerX - 130, 288, 'sprite_btn_instruction', function() {
      game.state.start("InstructionScreen");
    }, this, 2, 1, 0);
    instructionBtn.scale.setTo(0.65, 0.65);

    creditBtn = game.add.button(game.world.centerX - 130, 348, 'sprite_btn_credit', function() {
      game.state.start("CreditScreen");
    }, this, 2, 1, 0);
    creditBtn.scale.setTo(0.65, 0.65);
  },

  update: function(){}
};
