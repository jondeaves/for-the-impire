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


    // Level setup
    setupClickLine();
    this.setupAudio();


    // Spawn time imps
    this.spawnImps(game.constants.game.start.impCount, true);

  },

  update: function(){

    // Update click line and circle if present
    handleClickCircle();
    if(clickLine.x !== 0 && clickNearestImp !== undefined && clickNearestImp !== null){
      updateClickLine(clickNearestImp.x, clickNearestImp.y, game.input.x, game.input.y );
    }

    // Keep track of elapsed time/etc
    this.updateTimer();
  },

  render: function() {
    game.debug.geom(clickLine, '#ff0000');
    game.debug.geom(clickCircle,'#cfffff', false);
  }
};

gamePlayScreen.prototype.setupAudio = function () {

  // BG Music
  var gameplayBgMusic = game.add.audio('music_game_bg');
  gameplayBgMusic.play();
  gameplayBgMusic.loopFull(1);

  game.soundeffects = {
    'click': game.add.audio('click_sfx'),

    'bump1': game.add.audio('bump1_sfx'),
    'bump2': game.add.audio('bump2_sfx'),
    'bump3': game.add.audio('bump3_sfx'),
    'bump4': game.add.audio('bump4_sfx'),
    'crash': game.add.audio('crash_sfx'),

    'impudent': game.add.audio('impudent_vox'),
    'nuuuu': game.add.audio('nuuuu_vox'),
    'whoop': game.add.audio('whoop_vox'),
    'impaled': game.add.audio('impaled_vox')
  };

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

gamePlayScreen.prototype.spawnImps = function(count, first) {

  if(first === undefined) { first = false; }

  // Initialize the imp physics group if not already
  if(impObjectGroup === undefined) {
    impObjectGroup = game.add.physicsGroup(Phaser.Physics.P2JS);
  }

  // Create new Imps up to the count provided.
  for(var i = 0; i < count; ++i) {

    // Randomize chance of spawning
    var canSpawn = false;
    if(first) {
      canSpawn = true;
    } else {
      var spawnRndChecker = game.rnd.integerInRange(0, 100);
      if(spawnRndChecker <= game.constants.game.spawn.chance) {
        canSpawn = true;
      }
    }

    if(canSpawn) {
      var imp = new game.Imp(game, 'spritesheet_imp_one');
      game.add.existing(imp);
      impObjectGroup.add(imp);
      game.totalImpCount++;
    }

  }


  // Schedule the next spawn
  game.time.events.add(game.constants.game.spawn.rate, function(){
    this.spawnImps(1);
  }, this);

};





function handleClickCircle(){
  if(clickCircle.radius >= 35) {
    clickCircle.setTo(0, 0, 0);
  } else if(clickCircle.radius > 0) {
    clickCircle.radius += 2;
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
    if(clickNearestImp !== undefined && clickNearestImp !== null) {
      updateClickLine(clickNearestImp.x, clickNearestImp.y, clickPoint.x, clickPoint.y );
    }
  };

  var release = function(e) {
    updateClickLine(0, 0, 0, 0);
    if(clickNearestImp !== undefined && clickNearestImp !== null) {
      clickNearestImp.Target = {x: e.x, y: e.y};
    }
    clickCircle.setTo(game.input.x, game.input.y, 2);
    game.soundeffects.click.play();
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
