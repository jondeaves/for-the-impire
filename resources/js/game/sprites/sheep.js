var Sheep = function(game) {

  // Bit of prep work
  var scale = 0.12;
  var spriteSheet = 'spritesheet_sheep_1';
  var frames = game.cache.getFrameData(spriteSheet).getFrames();
  var sheepSpawn = this.GetSpawnLocation();

  // Instansiate
  Phaser.Sprite.call(this, game, sheepSpawn.position.x, sheepSpawn.position.y, spriteSheet);
  this.id = 'sheep_'+game.totalSheepCount;

  // Appearance
  this.scale.setTo(scale, scale);
  this.animations.add('walk', [0, 1]);

  // Setup physics
  game.physics.p2.enable(this, false);
  this.anchor.y = 0.33;
  this.body.setCircle((frames[0].width * scale) / 3.3);
  this.body.damping = (game.constants.sheep.damping * scale);
  this.body.rotation = sheepSpawn.rotation;
  this.body.health = game.constants.sheep.startHealth;

  // A.I. Phase
  this.ActionState = this.ActionStateEnum.IDLE;
  this.ChangeActionState();
  this.PerformActionState();

};

Sheep.prototype = Object.create(Phaser.Sprite.prototype);
Sheep.prototype.constructor = Sheep;
Sheep.prototype.update = function() {

  // Play animation if we are moving
  if(this.body.data.velocity[0] > game.constants.sheep.moving.threshold || this.body.data.velocity[1] > game.constants.sheep.moving.threshold) {
    this.animations.play('walk', 2, false);
  }


  // Turn if we need to
  if(this.TurnToAngle !== null) {
    var newRotation = game.TurnToAngle(this.body.rotation, this.TurnToAngle, game.constants.sheep.rotation.speed);
    if(newRotation < game.constants.sheep.rotation.threshold && newRotation > -game.constants.sheep.rotation.threshold) {
      this.TurnToAngle = null;
    } else {
      this.body.rotation += newRotation;
    }
  }


  // Update BoundingBox
  this.BoundingBox = new Phaser.Rectangle(
    this.x - (this.width / 2),
    this.y - (this.height / 2),
    this.width,
    this.height
  );
};


// Properties
Sheep.prototype.ActionStateEnum = { IDLE: 0, TURNING: 1, MOVING: 2 };           // Current active AI State
Sheep.prototype.BoundingBox = new Phaser.Rectangle(0, 0, 0, 0);                 // Rectangle surrounding entire sprite
Sheep.prototype.TurnToAngle = null;                                             // If not null will turn to face this during update


// Pick a location on the map to spawn
Sheep.prototype.GetSpawnLocation = function() {

  // hard coded exclusion zone for now
  var randomX = game.world.randomX;
  var randomY = game.world.randomY;
  if(randomY >= 200 && randomY <= 530 && randomX < 480) {
    randomX = game.rnd.integerInRange(480, game.width);
  }

  var theReturn = {
    position : {
      x: randomX,
      y: randomY
    },
    rotation: game.math.degToRad(game.rnd.integerInRange(0, 360))
  };

  return theReturn;

};


// Will pick a random state to be active for this timeout
Sheep.prototype.ChangeActionState = function(){

  // Randomize between 1 and the total number of ActionStateEnum
  var newState = game.rnd.integerInRange(1, Object.keys(this.ActionStateEnum).length);
  this.ActionState = this.ActionStateEnum[Object.keys(this.ActionStateEnum)[newState-1]];

  // Requeue the change
  game.time.events.add(game.constants.sheep.actionStateTimeout, function(){
    this.ChangeActionState();
  }, this);

};

Sheep.prototype.PerformActionState = function() {

  // Reset all states
  this.TurnToAngle = null;
  this.animations.stop(null, true);


  // Perform whichever state is active
  var nextTimeout = 1000;
  if(this.ActionState == this.ActionStateEnum.IDLE) {
    nextTimeout = game.constants.sheep.idle.timeout;
  } else if(this.ActionState == this.ActionStateEnum.TURNING) {
    nextTimeout = game.constants.sheep.rotation.timeout;
    if(game.rnd.integerInRange(0, 1) === 0) {
      this.TurnToAngle = this.body.rotation + game.math.degToRad(45);
    } else {
      this.TurnToAngle = this.body.rotation - game.math.degToRad(45);
    }
  } else if(this.ActionState == this.ActionStateEnum.MOVING) {
    nextTimeout = game.constants.sheep.moving.timeout;
    this.body.thrust(3000);

    // Reset to idle after a move
    this.ActionState = this.ActionStateEnum.IDLE;
  }


  // Line up the next one
  game.time.events.add(nextTimeout, function(){
    this.PerformActionState();
  }, this);
};



module.exports = Sheep;
