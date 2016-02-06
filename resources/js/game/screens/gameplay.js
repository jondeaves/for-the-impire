var gamePlayScreen = function(){};
module.exports = gamePlayScreen;

gamePlayScreen.prototype = {
  preload: function() {},

  create: function(){

    // Set the stage
    var gamePlayScreenBG = game.add.image(0, 0, "bg_gameplay_screen");
    gamePlayScreenBG.width = game.width;
    gamePlayScreenBG.height = game.height;

    // Enable the physics
    game.world.setBounds(-400, -400, 1600, 1200);
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);
    game.physics.p2.restitution = game.constants.physics.restitution;


    // Testing audio
    var gameplayBgMusic = game.add.audio('music_game_bg');
    gameplayBgMusic.play();
    gameplayBgMusic.loopFull(1);

    // Testing our sprite
    var imp = new game.Imp(game, {x: 200, y:200}, 'spritesheet_imp_one');
    game.add.existing(imp);
  },

  update: function(){}
};
