var Imp = function(game, spawn, spriteSheet) {

  // Bit of prep work
  var impScale = 0.1;
  var frames = game.cache.getFrameData(spriteSheet).getFrames();

  // Instansiate
  Phaser.Sprite.call(this, game, spawn.x, spawn.y, spriteSheet);

  // Appearance
  this.scale.setTo(impScale, impScale);
  this.animations.add('walk', [0, 1, 2]);
  this.animations.add('death', [3]);
  this.animations.play('walk', 10, true);

  // Setup physics
  game.physics.p2.enable(this, false);
  this.anchor.y = 0.33;
  this.body.setCircle((frames[0].width * impScale) / 3.3);

};

Imp.prototype = Object.create(Phaser.Sprite.prototype);
Imp.prototype.constructor = Imp;
Imp.prototype.update = function() {};


module.exports = Imp;
