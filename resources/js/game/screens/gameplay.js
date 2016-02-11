var gamePlayScreen = function(){};
module.exports = gamePlayScreen;


// Track in-game objects
var impObjectGroup;

// Audio
var gameplayBgMusic;

// Tracking line for clicks
var clickLine = new Phaser.Line(0, 0, 0, 0);
var clickCircle = new Phaser.Circle(0, 0, 0);
var clickPoint = null;
var clickNearestImp = null;

// Image that needs faded
var gamePlayScreenBG;
var bgFlames;
var filterFlame;
var impressBG;


gamePlayScreen.prototype = {
  preload: function() {},

  create: function(){

    // Fire filter, for behind main image
    filterFlame = game.add.filter('Fire', 800, 600);
  	filterFlame.alpha = 0.0;


    // Set the stage
    bgFlames = game.add.image(0, 0, "bg_gameplay_screen");
    bgFlames.width = game.width;
    bgFlames.height = game.height;
    bgFlames.alpha = 0.1;
    bgFlames.filters = [filterFlame];

    gamePlayScreenBG = game.add.image(0, 0, "bg_gameplay_screen");
    gamePlayScreenBG.width = game.width;
    gamePlayScreenBG.height = game.height;


    // Enable the physics
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);
    game.physics.p2.restitution = game.constants.physics.restitution;
    game.worldCollideGroup = game.physics.p2.createCollisionGroup();


    // Level setup
    setupClickLine();
    this.SetupAudio();
    this.SetupDropoff();


    // Spawn time imps
    this.SpawnImps(game.constants.game.start.impCount, true);


    // Render text about scores
    this.sacrificeText = game.add.text(5, game.height - 80, "Sacrifices: "+game.impWins, { font: "36px Arial", fill: "#333333", align: "left" });
    this.deathText = game.add.text(5, game.height - 40, "Deaths: "+game.impDeaths, { font: "36px Arial", fill: "#333333", align: "left" });

  },

  update: function(){

    // Check for imps being in pentagram
    this.CheckForSacrifice();

    // Update click line and circle if present
    handleClickCircle();
    if(clickLine.x !== 0 && clickNearestImp !== undefined && clickNearestImp !== null){
      updateClickLine(clickNearestImp.x, clickNearestImp.y, game.input.x, game.input.y );
    }

    // Keep track of elapsed time/etc
    this.UpdateTimer();


    // Update score display
    this.sacrificeText.text = "Sacrifices: "+game.impWins;
    this.deathText.text = "Deaths: "+game.impDeaths;


    // Check for loss condition
    if(game.impDeaths >= game.constants.game.end.loseCount) {
      game.soundeffects.bgMusic.stop();
      game.state.start("LoseScreen");
    }

    // Update Filters
    filterFlame.update();
  },

  render: function() {
    game.debug.geom(clickLine, '#ff0000');
    game.debug.geom(clickCircle,'#cfffff', false);

    this.RenderParticles();
  }
};

gamePlayScreen.prototype.RenderParticles = function() {
  for (var iParticle=game.particleRenders.length-1; iParticle>0; iParticle--){
    particle = game.particleRenders[iParticle];
    game.debug.geom(particle,'#af111c', true);
    particle.x += particle.vx;
    particle.y += particle.vy;
    if(particle.radius > 1) {
      particle.radius -= 0.1;
      particle.vx *= 0.985;
      particle.vy *= 0.985;
    } else {
      game.particleRenders.splice(iParticle,1);
    }
  }

  for (var iStar=game.starRenders.length-1; iStar>0; iStar--){
    star = game.starRenders[iStar];
    game.debug.geom(star,'#FFD700', true);
    star.x += star.vx;
    star.y += star.vy;
    if (!star.shrink){
      star.radius += 0.35;
      star.vx *= 0.985;
      star.vy *= 0.985;
      if (star.radius > 18){
        star.shrink = true;
      }
    } else {
      star.radius -= 0.3;
      if (star.radius <1){
        game.starRenders.splice(iStar,1);
      }
    }
  }
};

gamePlayScreen.prototype.SetupAudio = function () {

  game.soundeffects = {
    'bgMusic': game.add.audio('music_game_bg'),

    'click': game.add.audio('click_sfx'),

    'bump1': game.add.audio('bump1_sfx'),
    'bump2': game.add.audio('bump2_sfx'),
    'bump3': game.add.audio('bump3_sfx'),
    'bump4': game.add.audio('bump4_sfx'),
    'crash': game.add.audio('crash_sfx'),
    'impWin': game.add.audio('imp_win_sfx'),
    'impWin2': game.add.audio('imp_win_2_sfx'),

    'impudent': game.add.audio('impudent_vox'),
    'nuuuu': game.add.audio('nuuuu_vox'),
    'whoop': game.add.audio('whoop_vox'),
    'impaled': game.add.audio('impaled_vox'),
    'imadeit': game.add.audio('imadeit_vox'),
    'yes': game.add.audio('yes_vox'),


  };


  // Always playing bg music
  game.soundeffects.bgMusic.play();
  game.soundeffects.bgMusic.loopFull(1);

};

gamePlayScreen.prototype.SetupDropoff = function() {

  pentagram = game.add.sprite(55, (game.height / 2) - 70, 'sprite_goal_one');

  // Impress appears at the end
  impressBG = game.add.sprite(180, 10, 'sprite_impress');
  impressBG.visible = false;

};

gamePlayScreen.prototype.CheckForSacrifice = function() {

  for(var i = 0; i < impObjectGroup.length; i++) {
    var pentImp = impObjectGroup.children[i];
    var pentInRight = pentImp.x < pentagram.x + pentagram.width;
    var pentInLeft = pentImp.x + pentImp.width > pentagram.x;
    var pentInBottom = pentImp.y < pentagram.y + pentagram.height;
    var pentInTop = pentImp.height + pentImp.y > pentagram.y;

    if(pentInRight && pentInLeft && pentInTop && pentInBottom){
      this.TriggerSacrifice(pentImp);
    }
  }

};

gamePlayScreen.prototype.TriggerSacrifice = function(imp) {

  // Particle Effect
  game.AddStars({x:imp.x, y:imp.y}, Math.floor((Math.random() * 8) + 6));


  // Audio effects
  if(Math.floor((Math.random() * 2)) === true){
    game.soundeffects.imadeit.play();
  } else {
    game.soundeffects.yes.play();
  }

  if(Math.floor((Math.random() * 2)) === true){
    game.soundeffects.impWin.play();
  } else {
    game.soundeffects.impWin2.play();
  }


  // Slowly fade out the main image
  gamePlayScreenBG.alpha -= 1/game.constants.game.end.winCount;

  // Check for victory
  game.impWins++;
  if(game.impWins >= game.constants.game.end.winCount) {
    // win condition triggered;
    impressBG.visible = true;
    game.soundeffects.bgMusic.stop();

    // Stop imps moving and set graphic to "win" appropriate
    for(var i = 0; i < impObjectGroup.length; i++) {
      var currentImp = impObjectGroup.children[i];
      currentImp.SetWin();
    }

    game.time.events.add(2000, function(){
      game.state.start("WinScreen");
    }, this);
  }

  imp.destroy();
};

gamePlayScreen.prototype.UpdateTimer = function() {

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

gamePlayScreen.prototype.SpawnImps = function(count, first) {

  // No point spawning if we are winners
  if(game.impWins >= game.constants.game.end.winCount) {
    return;
  }

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
      var imp = new game.Imp(game);
      game.add.existing(imp);
      impObjectGroup.add(imp);
      game.totalImpCount++;
    }

  }


  // Schedule the next spawn
  game.time.events.add(game.constants.game.spawn.rate, function(){
    this.SpawnImps(1);
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
