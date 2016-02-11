var Boot = function () {};
module.exports = Boot;

Boot.prototype = {

  preload: function () { },

  create: function () {
    this.game.input.maxPointers = 2;

    // Scale the game on smaller devices
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.maxWidth = this.game.constants.world.width;
    this.game.scale.maxHeight = this.game.constants.world.height;
    this.game.scale.forceLandscape = true;
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.refresh();

    this.game.state.start('LoadingScreen');
  }
};
