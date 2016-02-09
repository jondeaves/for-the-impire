var Imp = function(game, spriteSheet) {

  // Bit of prep work
  var impScale = 0.1;
  var frames = game.cache.getFrameData(spriteSheet).getFrames();
  var impSpawn = this.getSpawnLocation();

  // Instansiate
  Phaser.Sprite.call(this, game, impSpawn.position.x, impSpawn.position.y, spriteSheet);
  this.id = 'imp_'+game.totalImpCount;

  // Appearance
  this.scale.setTo(impScale, impScale);
  this.animations.add('walk', [0, 1, 2]);
  this.animations.add('death', [3]);
  this.animations.play('walk', 10, true);

  // Setup physics
  game.physics.p2.enable(this, false);
  this.anchor.y = 0.33;
  this.body.setCircle((frames[0].width * impScale) / 3.3);
  this.body.damping = (game.constants.imp.damping * impScale);
  this.body.rotation = impSpawn.rotation;
  this.body.health = game.constants.imp.startHealth;

  // Collisions with other objects
  this.body.collideWorldBounds = false;
  this.body.setCollisionGroup(game.worldCollideGroup);
  this.body.collides([game.worldCollideGroup]);
  this.body.onBeginContact.add(this.beginCollision, this);

  // Death
  this.deathSpinSpeed = game.constants.imp.deathSpinSpeed;
  game.time.events.add(1000, function(){
    this.updateTTL();
  }, this);

};

Imp.prototype = Object.create(Phaser.Sprite.prototype);
Imp.prototype.constructor = Imp;
Imp.prototype.update = function() {
  this.UpdateMovement();
  this.UpdateHealth();
};

Imp.prototype.UpdateMovement = function() {

  // Check if we are within
  var isOutside =
    (this.x+this.width < 0 - game.constants.world.boundOffset) || // off to left
    (this.y+this.height < 0 - game.constants.world.boundOffset) || // off to top
    (this.x > game.width + game.constants.world.boundOffset) || // off to right
    (this.y > game.height + game.constants.world.boundOffset); // off to left

  if(isOutside) {
    this.Target = null;
    var point1 = new Phaser.Point(this.x, this.y);
    var point2 = new Phaser.Point(game.width / 2, game.height / 2);
    var targetAngle = point1.angle(point2) + game.math.degToRad(90);
    this.body.rotation = targetAngle;
  }


  if(this.Target !== null) {
    this.accelerateToObject(this, this.Target, game.constants.imp.baseThrust);
    this.turnToFace(this, this.Target);
    var distanceFromTarget = this.getDistance(this, this.Target);
    if(distanceFromTarget < game.constants.imp.targetOffset) {
      this.Target = null;
    }
  } else {
      this.body.thrust(game.constants.imp.baseThrust);
  }


  // Limit max speed
  this.constrainVelocity();
};

Imp.prototype.constrainVelocity = function() {
  var body = this.body;
  var maxVelocity = game.constants.imp.maxVelocity;
  var angle, currVelocitySqr, vx, vy;

  vx = body.data.velocity[0];
  vy = body.data.velocity[1];

  currVelocitySqr = vx * vx + vy * vy;

  if(currVelocitySqr > maxVelocity * maxVelocity) {
    angle = Math.atan2(vy, vx);

    vx = Math.cos(angle) * maxVelocity;
    vy = Math.sin(angle) * maxVelocity;

    body.data.velocity[0] = vx;
    body.data.velocity[1] = vy;
  }
};

Imp.prototype.UpdateHealth = function() {

  // Are we ready to die?
  if(this.body.health <= 0 && !this.isDying) {

    this.isDying = true;
    game.soundeffects.impaled.play();
    this.animations.play('death', 10, true);

    game.time.events.add(game.constants.imp.deathDuration, function(){
      game.soundeffects.crash.play();
      // addBlobs({x:this.x, y:this.y}, Math.floor((Math.random() * 12) + 8));
      this.destroy();
      this.isDying = false;
    }, this);


    // Finally
    game.impDeaths++;   // One step closer to lose screen

  }


  // Animate if we are dying, by rotating and shrinking
  if(this.isDying) {
    this.body.rotation += game.math.degToRad(game.constants.imp.deathSpinSpeed);
    var newScaleX = this.scale.x - game.constants.imp.deathScaleSpeed;
    var newScaleY = this.scale.y - game.constants.imp.deathScaleSpeed;

    this.scale.setTo(newScaleX, newScaleY);
    this.deathSpinSpeed += game.constants.imp.deathSpinSpeedIncrement;
  }

};


Imp.prototype.updateTTL = function() {
  if(this.body !== null) {
    var healthLossPerSecond = game.constants.imp.startHealth / game.constants.imp.ttl;
    this.body.health -= healthLossPerSecond;

    // Keep the loop going every second until imp is dead
    if(this.body.health > 0) {
      game.time.events.add(1000, function(){
        this.updateTTL();
      }, this);
    }
  }
};




Imp.prototype.Target = null;
Imp.prototype.isDying = false;
Imp.prototype.deathSpinSpeed = 0;


Imp.prototype.beginCollision = function(body, bodyB, shapeA, shapeB, equation) {

  if(body && body.health) {
    body.health -= game.constants.imp.bumpDamage;
  } else if(bodyB && bodyB.health) {
    bodyB.health -= game.constants.imp.bumpDamage;
  } else if(this.body && this.body.health) {
    this.body.health -= game.constants.imp.bumpDamage;
  }

  // Bump Sound
  this.playBump();
  this.playOuch();
};

Imp.prototype.playBump = function() {
  var result = Math.floor((Math.random() * 4) + 1);
  if (result ===1){
    game.soundeffects.bump1.play();
  } else if (result ===2){
    game.soundeffects.bump2.play();
  } else if (result ===3){
    game.soundeffects.bump3.play();
  } else if (result === 4){
    game.soundeffects.bump4.play();
  }
};

Imp.prototype.playOuch = function() {
  var result = Math.floor((Math.random() * 6) + 1);
  if (result ===1){
    game.soundeffects.impudent.play();
  } else if (result ===2){
    game.soundeffects.nuuuu.play();
  } else if (result ===3){
    game.soundeffects.whoop.play();
  }
};

Imp.prototype.getSpawnLocation = function() {
  var theReturn = {
    position : {
      x: 0,
      y: 0
    },
    rotation: 0
  };

  var result = Math.floor((Math.random() * 3) + 1);
  if (result ===1){ // top wall
    theReturn.position.y = 10;
    theReturn.position.x = game.world.randomX;
    theReturn.rotation = (Math.random() * 2)+2;
  } else if (result ===2){ // bottom wall
    theReturn.position.y = game.height -10;
    theReturn.position.x = game.world.randomX;
    theReturn.rotation = (Math.random() * 2)-1;
  } else if (result ===3){ // right wall
    theReturn.position.y = game.world.randomY;
    theReturn.position.x = game.width-10;
    theReturn.rotation = (Math.random() * 2.8)+2.5;
  }

  return theReturn;

};

Imp.prototype.turnToFace = function(obj1, obj2) {

  var point1 = new Phaser.Point(obj1.x, obj1.y);
  var point2 = new Phaser.Point(obj2.x, obj2.y);
  var targetAngle = point1.angle(point2) + game.math.degToRad(90);
  var difference = targetAngle - obj1.body.rotation;

  if (difference > game.math.PI) {
    difference = ((2 * game.math) - difference);
  }
  if (difference < -game.math.PI) {
    difference = ((2 * game.math) + difference);
  }

  // Move the character's rotation a set amount per unit time
  var delta = (difference < 0) ? -game.constants.imp.rotationSpeed : game.constants.imp.rotationSpeed;
  var rotateDiff = delta * game.timeSinceLastTick;
  obj1.body.rotation += rotateDiff;

};

Imp.prototype.accelerateToObject = function(obj1, obj2, speed) {
  if(typeof speed === 'undefined') { speed = game.constants.imp.baseThrust; }
  var angle = Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);
  obj1.body.force.x = Math.cos(angle) * speed;
  obj1.body.force.y = Math.sin(angle) * speed;
};

Imp.prototype.getDistance = function(pointA, pointB){
  return Math.sqrt( Math.pow((pointA.x-pointB.x), 2) + Math.pow((pointA.y-pointB.y), 2) );
};


module.exports = Imp;
