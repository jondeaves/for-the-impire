var menuScreen = function(){};
module.exports = menuScreen;

menuScreen.prototype = {
  preload: function() {},

  create: function(){
    var menuScreenBG = game.add.image(0, 0, "bg_start_screen");
    menuScreenBG.width = game.width;
    menuScreenBG.height = game.height;


    // Create clickable buttons
    var buttonScale = 0.65;
    var buttonHeight = (117 * buttonScale);
    var buttonVerticalSpacing = 30 * buttonScale;
    var buttonStartFromBottom = 50;


    var creditBtnX = game.world.centerX - (174 * buttonScale);
    var creditBtnY = game.height - buttonHeight - buttonStartFromBottom;

    var instructionBtnX = game.world.centerX - (223 * buttonScale);
    var instructionBtnY = creditBtnY - buttonVerticalSpacing - buttonHeight;

    var startBtnX = game.world.centerX - (135 * buttonScale);
    var startBtnY = instructionBtnY - buttonVerticalSpacing - buttonHeight;


    startBtn = game.add.button(startBtnX, startBtnY, 'spritesheet_start_button', function() {
      game.TriggerFullscreen();
      game.state.start("GamePlayScreen");
    }, this, 2, 1, 0);
    startBtn.scale.setTo(0.65, 0.65);

    instructionBtn = game.add.button(instructionBtnX, instructionBtnY, 'spritesheet_instruction_button', function() {
      game.TriggerFullscreen();
      game.state.start("InstructionScreen");
    }, this, 2, 1, 0);
    instructionBtn.scale.setTo(0.65, 0.65);

    creditBtn = game.add.button(creditBtnX, creditBtnY, 'spritesheet_credit_button', function() {
      game.TriggerFullscreen();
      game.state.start("CreditScreen");
    }, this, 2, 1, 0);
    creditBtn.scale.setTo(buttonScale, buttonScale);
  },

  update: function(){}
};
