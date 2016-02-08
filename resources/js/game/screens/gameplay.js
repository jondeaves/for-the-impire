var gamePlayScreen = function(){};
module.exports = gamePlayScreen;

// Track in-game objects
var impObjectGroup;


// Audio
var clickSoundEffect;


// Tracking line for clicks
var clickLine = new Phaser.Line(0, 0, 0, 0);
var clickCircle = new Phaser.Circle(0, 0, 0);
var clickPoint = null;
var clickNearestImp = null;


gamePlayScreen.prototype = {
  preload: function() {},

  create: function(){

    // Set the stage
    var gamePlayScreenBG = game.add.image(0, 0, "bg_gameplay_screen");
    gamePlayScreenBG.width = game.width;
    gamePlayScreenBG.height = game.height;
    game.totalImpCount = 0;

    // Enable the physics
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);
    game.physics.p2.restitution = game.constants.physics.restitution;
    game.worldCollideGroup = game.physics.p2.createCollisionGroup();


    // Click Handler
    setupClickLine();


    // Testing audio
    var gameplayBgMusic = game.add.audio('music_game_bg');
    gameplayBgMusic.play();
    gameplayBgMusic.loopFull(1);

    clickSoundEffect = game.add.audio('click_sfx');


    // Testing our sprite
    spawnImps(game.constants.game.start.impCount);

  },

  update: function(){

    // Update click line if present
    if(clickLine.x !== 0 && clickNearestImp !== undefined){
      updateClickLine(clickNearestImp.x, clickNearestImp.y, game.input.x, game.input.y );
    }

    // Keep track of elapsed time/etc
    this.updateTimer();
  },

  render: function() {
    game.debug.geom(clickLine, '#ff0000');
  }
};

gamePlayScreen.prototype.updateTimer = function() {

  if(game.startTime === undefined) { game.startTime = 0; }
  if(game.elapsedTime === undefined) { game.elapsedTime = 0; }
  if(game.previousElapsedTime === undefined) { game.previousElapsedTime = 0; }
  if(game.timeSinceLastTick === undefined) { game.timeSinceLastTick = 0; }

  // Time Tracking
  game.elapsedTime = game.time.time - game.startTime;
  if(game.previousElapsedTime === 0) {
    game.previousElapsedTime = game.elapsedTime;
  }
  game.timeSinceLastTick = game.elapsedTime - game.previousElapsedTime;
  game.previousElapsedTime = game.elapsedTime;                                          // We are finished previous time at time point
};




function spawnImps(count) {

  // Initialize the imp physics group if not already
  if(impObjectGroup === undefined) {
    impObjectGroup = game.add.physicsGroup(Phaser.Physics.P2JS);
  }

  // Create new Imps up to the count provided.
  for(var i = 0; i < count; ++i) {
    var imp = new game.Imp(game, 'spritesheet_imp_one');
    game.add.existing(imp);
    impObjectGroup.add(imp);
    game.totalImpCount++;
  }
}








function updateClickLine(x1, y1, x2, y2) {
  clickLine.start.x = x1;
  clickLine.start.y = y1;
  clickLine.end.x =  x2;
  clickLine.end.y = y2;
}

function setupClickLine() {

  var clickDown = function(e) {
    clickNearestImp = getNearest(impObjectGroup, game.input);
    clickPoint = {x:game.input.x, y:game.input.y};
    updateClickLine(clickNearestImp.x, clickNearestImp.y, clickPoint.x, clickPoint.y );
  };

  var release = function(e) {
    updateClickLine(0, 0, 0, 0);
    clickNearestImp.Target = {x: e.x, y: e.y};
    clickCircle.setTo(e.x, e.y, 2);
    clickSoundEffect.play();
  };

  game.input.onDown.add(function(e) { clickDown(e); }, this);
  game.input.onUp.add(function(e) { release(e); }, this);
}








function getNearest(arrIn, pointIn) {
  var nearest = null;
  var currentNearestDistance = 10000000000000;
  var dist;
  arrIn.forEach(function(obj){
    dist = getDistance(pointIn, obj.position);
    if(dist < currentNearestDistance) {
      currentNearestDistance = dist;
      nearest = obj;
    }
  });
  return nearest || null;
}

function getDistance(pointA, pointB){
  return Math.sqrt( Math.pow((pointA.x-pointB.x), 2) + Math.pow((pointA.y-pointB.y), 2) );
}
