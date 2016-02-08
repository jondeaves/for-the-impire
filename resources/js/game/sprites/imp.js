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
  this.body.onBeginContact.add(this.beginCollision, this);

};

Imp.prototype = Object.create(Phaser.Sprite.prototype);
Imp.prototype.constructor = Imp;
Imp.prototype.update = function() {

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

};
Imp.prototype.Target = null;


Imp.prototype.beginCollision = function(body, bodyB, shapeA, shapeB, equation) {
  console.log('collision');

  if(body && body.health) {
    body.health -= game.constants.imp.bumpDamange;
  } else if(bodyB && bodyB.health) {
    bodyB.health -= game.constants.imp.bumpDamange;
  } else if(this.body && this.body.health) {
    this.body.health -= game.constants.imp.bumpDamange;
  }

  /*
  playBump(); // boiiing
  playOuch(); // sometimes says ouch
   */
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
