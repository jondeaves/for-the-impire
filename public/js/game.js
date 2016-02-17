(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function() {
  return {

    world: {
      width: 1280,
      height: 800,
      boundOffset: 50
    },

    physics: {
      restitution: 5
    },

    game: {
      start: {
        impCount: 2
      },
      spawn: {
        rate: 2500,   // Time in milliseconds between spawn attemtps
        chance: 60    // Percentage of chance a spawn succeeds
      },
      end: {
        winCount: 15,
        loseCount: 25
      }

    },

    imp: {
      ttl: 30,                        // Number of seconds to live
      startHealth: 110,

      bumpDamage: 15,
      damping: 6,

      maxVelocity: 8,
      baseThrust: 80,
      rotationSpeed: 0.0025,

      targetOffset: 30,               // Within this distance the target will be dropped


      deathDuration: 1000,
      deathSpinSpeedIncrement: 0.075,   // Speed increase by this much each time
      deathSpinSpeed: 8,
      deathScaleSpeed: 0.001,
    },

    sheep: {
      spawnRate: 8000,
      spawnChance: 40,

      damping: 6,
      startHealth: 50,

      actionStateTimeout: 5000,         // Number of milliseconds before changin AI state

      idle: {
        timeout: 800
      },

      rotation: {
        angle: 45,
        speed: 0.0025,
        threshold: 0.003,
        timeout: 1050
      },

      moving: {
        thrust: 3000,
        timeout: 1600,
        threshold: 0.03
      }
    },

    spider: {
      spawnRate: 12000,
      spawnChance: 40,

      damping: 6,
      startHealth: 100,

      actionStateTimeout: 3000,         // Number of milliseconds before changin AI state

      fleeDistance: 120,                 // Distance from a spider before turning the other way

      idle: {
        timeout: 800
      },

      rotation: {
        angle: 45,
        speed: 0.0025,
        threshold: 0.003,
        timeout: 1000
      },

      moving: {
        thrust: 3000,
        timeout: 1500,
        threshold: 0.03
      }
    }

  };

};

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
var creditScreen = function(){};
module.exports = creditScreen;

creditScreen.prototype = {
  preload: function() {},

  create: function(){
    var creditScreenBG = game.add.image(0, 0, "bg_credit_screen");
    creditScreenBG.width = game.width;
    creditScreenBG.height = game.height;
  },

  update: function(){
    game.input.onTap.add(function() {
      game.state.start('MenuScreen');
    }, this);
  }
};

},{}],4:[function(require,module,exports){
var gamePlayScreen = function(){};
module.exports = gamePlayScreen;

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

// End Goal
var pentagram;
var pentagramRectangle;


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


    // Spawn elements
    this.SpawnSheep();
    this.SpawnSpider();
    this.SpawnImps(game.constants.game.start.impCount, true);


    // Render text about scores
    this.timeText = game.add.text(5, game.height - 120, "Time: 00:00", { font: "36px Arial", fill: "#333333", align: "left" });
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
    this.timeText.text = "Time: " + game.GetFormattedTime(game.totalTimeActive);
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

    // These renders are for debug
    if(game.IsDebug) {
      game.debug.geom(pentagramRectangle, 'rgba(200,0,0,0.5)');

      for(var iImp = 0; iImp < game.ImpObjectGroup.length; iImp++) {
        var imp = game.ImpObjectGroup.children[iImp];
        game.debug.geom(imp.BoundingBox, 'rgba(0,200,0,0.5)');
      }

      for(var iSheep = 0; iSheep < game.SheepObjectGroup.length; iSheep++) {
        var sheep = game.SheepObjectGroup.children[iSheep];
        game.debug.geom(sheep.BoundingBox, 'rgba(0,0,200,0.5)');
      }

      for(var iSpider = 0; iSpider < game.spiderObjectGroup.length; iSpider++) {
        var spider = game.spiderObjectGroup.children[iSpider];
        game.debug.geom(spider.BoundingBox, 'rgba(200,0,0,0.5)');
      }
    }


    // These renders are for game
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

  // Pentgram is the target for Imps to reach
  pentagram = game.add.sprite(120, (game.height / 2) - 70, 'sprite_goal_one');
  pentagramRectangle = new Phaser.Rectangle(pentagram.x, pentagram.y, pentagram.width, pentagram.height);


  // Cones will create a funnel for Imps to get into.
  var coneLine1 = game.add.sprite(260, 300, 'sprite_cone_horizontal');
  var coneLine2 = game.add.sprite(270, 500, 'sprite_cone_horizontal');
  var coneLine3 = game.add.sprite(80, 390, 'sprite_cone_vertical');

  // Cones are immovable
  game.physics.p2.enable( [ coneLine1, coneLine2, coneLine3 ]);
  coneLine1.body.static = true;
  coneLine2.body.static = true;
  coneLine3.body.static = true;

  // Add cones to same collision group as Imps
  coneLine1.body.setCollisionGroup(game.worldCollideGroup);
  coneLine2.body.setCollisionGroup(game.worldCollideGroup);
  coneLine3.body.setCollisionGroup(game.worldCollideGroup);
  coneLine1.body.collides([game.worldCollideGroup]);
  coneLine2.body.collides([game.worldCollideGroup]);
  coneLine3.body.collides([game.worldCollideGroup]);


  // Impress appears at the end
  impressBG = game.add.sprite(180, 10, 'sprite_impress');
  impressBG.visible = false;

};

gamePlayScreen.prototype.CheckForSacrifice = function() {
  for(var i = 0; i < game.ImpObjectGroup.length; i++) {
    var pentImp = game.ImpObjectGroup.children[i];
    var contains = Phaser.Rectangle.containsRect(pentImp.BoundingBox, pentagramRectangle);
    var intersects = Phaser.Rectangle.intersection(pentImp.BoundingBox, pentagramRectangle);
    if((intersects.width > 30 && intersects.height > 30) || contains) {
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
    for(var i = 0; i < game.ImpObjectGroup.length; i++) {
      var currentImp = game.ImpObjectGroup.children[i];
      currentImp.SetWin();
    }

    game.time.events.add(2000, function(){
      game.state.start("WinScreen");
    }, this);
  }

  imp.destroy();
};

gamePlayScreen.prototype.UpdateTimer = function() {
  if(game.totalTimeActive === undefined) { game.totalTimeActive = 0; }
  game.totalTimeActive += game.time.elapsed;
};

gamePlayScreen.prototype.SpawnSheep = function() {

  if(game.SheepObjectGroup === undefined) {
    game.SheepObjectGroup = game.add.physicsGroup(Phaser.Physics.P2JS);
  }

  // A chance to spawn, not guaranteed
  var spawnRndChecker = game.rnd.integerInRange(0, 100);
  if(spawnRndChecker <= game.constants.sheep.spawnChance) {
    var sheep = new game.Sheep(game);
    game.add.existing(sheep);
    game.SheepObjectGroup.add(sheep);
    game.totalSheepCount++;
  }

  // Schedule the next spawn
  game.time.events.add(game.constants.sheep.spawnRate, function(){
    this.SpawnSheep();
  }, this);

};

gamePlayScreen.prototype.SpawnSpider = function() {

  if(game.spiderObjectGroup === undefined) {
    game.spiderObjectGroup = game.add.physicsGroup(Phaser.Physics.P2JS);
  }

  // A chance to spawn, not guaranteed
  var spawnRndChecker = game.rnd.integerInRange(0, 100);
  if(spawnRndChecker <= game.constants.spider.spawnChance) {
    var spider = new game.Spider(game);
    game.add.existing(spider);
    game.spiderObjectGroup.add(spider);
    game.totalSpiderCount++;
  }

  // Schedule the next spawn
  game.time.events.add(game.constants.spider.spawnRate, function(){
    this.SpawnSpider();
  }, this);

};

gamePlayScreen.prototype.SpawnImps = function(count, first) {

  // No point spawning if we are winners
  if(game.impWins >= game.constants.game.end.winCount) {
    return;
  }

  if(first === undefined) { first = false; }

  // Initialize the imp physics group if not already
  if(game.ImpObjectGroup === undefined) {
    game.ImpObjectGroup = game.add.physicsGroup(Phaser.Physics.P2JS);
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
      game.ImpObjectGroup.add(imp);
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
    clickNearestImp = game.GetNearest(game.ImpObjectGroup, game.input);
    clickPoint = {x:game.input.x, y:game.input.y};
    if(clickNearestImp !== undefined && clickNearestImp !== null) {
      updateClickLine(clickNearestImp.x, clickNearestImp.y, clickPoint.x, clickPoint.y );
    }
  };

  var release = function(e) {
    updateClickLine(0, 0, 0, 0);
    if(clickNearestImp !== undefined && clickNearestImp !== null) {
      clickNearestImp.Target = {x: e.x, y: e.y};
      clickNearestImp.FleeingFrom = null;       // NO FEAR!!!!
    }
    clickCircle.setTo(game.input.x, game.input.y, 2);
    game.soundeffects.click.play();
  };

  game.input.onDown.add(function(e) { clickDown(e); }, this);
  game.input.onUp.add(function(e) { release(e); }, this);
}

},{}],5:[function(require,module,exports){
var instructionScreen = function(){};
module.exports = instructionScreen;

instructionScreen.prototype = {
  preload: function() {},

  create: function(){
    var instructionScreenBG = game.add.image(0, 0, "bg_instruction_screen");
    instructionScreenBG.width = game.width;
    instructionScreenBG.height = game.height;
  },

  update: function(){
    game.input.onTap.add(function() {
      game.state.start('MenuScreen');
    }, this);
  }
};

},{}],6:[function(require,module,exports){
var loadingScreen = function(){};
module.exports = loadingScreen;

var loadingText;
loadingScreen.prototype = {
  preload: function() {
    // Load anything needed before the actual asset loading is done.
    game.load.script('filter', 'https://cdn.rawgit.com/photonstorm/phaser/master/filters/Fire.js');
  },
  create: function(){

    // Just to get us started
    game.stage.backgroundColor = '#182d3b';

    // Hook into some load events
    game.load.onLoadStart.add(loadStart, this);
    game.load.onFileComplete.add(fileComplete, this);
    game.load.onLoadComplete.add(loadComplete, this);

    // Begin the load
    game.load.pack('menuScreen', '/assets/asset-pack.json', null, this);
    game.load.pack('instructionScreen', '/assets/asset-pack.json', null, this);
    game.load.pack('creditScreen', '/assets/asset-pack.json', null, this);
    game.load.pack('gameplayScreen', '/assets/asset-pack.json', null, this);
    game.load.pack('winScreen', '/assets/asset-pack.json', null, this);
    game.load.pack('loseScreen', '/assets/asset-pack.json', null, this);

    game.load.start();

  },
  update: function(){}
};



function loadStart() {
  text = game.add.text(32, 32, 'Loading...', { fill: '#ffffff' });
}

function fileComplete(progress, cacheKey, success, totalLoaded, totalFiles) {
  text.setText("File Complete: " + progress + "% - " + totalLoaded + " out of " + totalFiles);
}

function loadComplete() {
  text.setText("Load Complete");
  game.state.start("MenuScreen");
}

},{}],7:[function(require,module,exports){
var loseScreen = function(){};
module.exports = loseScreen;

loseScreen.prototype = {
  preload: function() {},

  create: function(){
    var loseScreenBG = game.add.image(0, 0, "bg_lose_screen");
    loseScreenBG.width = game.width;
    loseScreenBG.height = game.height;
  },

  update: function(){
    game.input.onTap.add(function() {
      game.state.start('MenuScreen');
    }, this);
  }
};

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
var winScreen = function(){};
module.exports = winScreen;

winScreen.prototype = {
  preload: function() {},

  create: function(){
    var winScreenBG = game.add.image(0, 0, "bg_win_screen");
    winScreenBG.width = game.width;
    winScreenBG.height = game.height;
  },

  update: function(){
    game.input.onTap.add(function() {
      game.state.start('MenuScreen');
    }, this);
  }
};

},{}],10:[function(require,module,exports){
var Imp = function(game) {

  // Bit of prep work
  var spriteNumber = game.rnd.integerInRange(1, 2);
  var spriteSheet = 'spritesheet_imp_'+spriteNumber;
  var scale = 0.1;
  var frames = game.cache.getFrameData(spriteSheet).getFrames();
  var spawnPoint = this.GetSpawnLocation();

  // Instansiate
  Phaser.Sprite.call(this, game, spawnPoint.position.x, spawnPoint.position.y, spriteSheet);
  this.id = 'imp_'+game.totalImpCount;

  // Appearance
  this.scale.setTo(scale, scale);
  this.animations.add('walk', [0, 1, 2]);
  this.animations.add('death', [3]);
  this.animations.play('walk', 10, true);

  // Setup physics
  game.physics.p2.enable(this, false);
  this.anchor.y = 0.33;
  this.body.setCircle((frames[0].width * scale) / 3.3);
  this.body.damping = (game.constants.imp.damping * scale);
  this.body.rotation = spawnPoint.rotation;
  this.body.health = game.constants.imp.startHealth;

  // Collisions with other objects
  this.body.collideWorldBounds = false;
  this.body.setCollisionGroup(game.worldCollideGroup);
  this.body.collides([game.worldCollideGroup]);
  this.body.onBeginContact.add(this.BeginCollision, this);

  // Death
  this.deathSpinSpeed = game.constants.imp.deathSpinSpeed;
  game.time.events.add(1000, function(){
    this.UpdateTTL();
  }, this);

};

Imp.prototype = Object.create(Phaser.Sprite.prototype);
Imp.prototype.constructor = Imp;
Imp.prototype.update = function() {
  this.UpdateMovement();
  this.UpdateHealth();
  this.CheckForSpiders();

  // Update BoundingBox
  this.BoundingBox = new Phaser.Rectangle(
    this.x - (this.width / 2),
    this.y - (this.height / 2),
    this.width,
    this.height
  );
};


// Properties
Imp.prototype.Target = null;
Imp.prototype.isDying = false;
Imp.prototype.deathSpinSpeed = 0;
Imp.prototype.CanMove = true;
Imp.prototype.BoundingBox = new Phaser.Rectangle(0, 0, 0, 0);
Imp.prototype.FleeingFrom = null;     // Spider we are currently fleeing from


// Imp Specific helper functions
Imp.prototype.UpdateMovement = function() {

  // Check if we are within
  if(this.CanMove) {
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
      game.AccelerateToObject(this, this.Target, game.constants.imp.baseThrust);
      game.TurnToFace(this, this.Target, game.constants.imp.rotationSpeed);
      var distanceFromTarget = game.GetDistance(this, this.Target);
      if(distanceFromTarget < game.constants.imp.targetOffset) {
        this.Target = null;
      }
    } else {
        this.body.thrust(game.constants.imp.baseThrust);
    }


    // Limit max speed
    this.ConstrainVelocity();

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
      game.AddBlobs({x:this.x, y:this.y}, Math.floor((Math.random() * 12) + 8));
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

Imp.prototype.CheckForSpiders = function() {

  var nearestSpider = game.GetNearest(game.spiderObjectGroup, this.position);
  if(nearestSpider !== null && this.FleeingFrom !== nearestSpider) {
    var nearestSpiderDistance = game.GetDistance(this.position, nearestSpider.position);
    if(nearestSpiderDistance <= game.constants.spider.fleeDistance) {
      this.FleeingFrom = nearestSpider;
      this.Target = null;

      var newAngle = game.rnd.integerInRange(90, 270);
      this.body.rotation = this.body.rotation + game.math.degToRad(newAngle);
      this.body.thrust(game.constants.imp.baseThrust * 5);
    }
  }


  if(this.FleeingFrom !== null) {
    var fleeFromDistance = game.GetDistance(this.position, nearestSpider.position);
    if(fleeFromDistance > game.constants.spider.fleeDistance) {
      this.FleeingFrom = null;
    }
  }

};


Imp.prototype.ConstrainVelocity = function() {
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

Imp.prototype.UpdateTTL = function() {
  if(this.body !== null) {
    var healthLossPerSecond = game.constants.imp.startHealth / game.constants.imp.ttl;
    this.body.health -= healthLossPerSecond;

    // Keep the loop going every second until imp is dead
    if(this.body.health > 0) {
      game.time.events.add(1000, function(){
        this.UpdateTTL();
      }, this);
    }
  }
};

Imp.prototype.BeginCollision = function(body, bodyB, shapeA, shapeB, equation) {

  if(body && body.health) {
    body.health -= game.constants.imp.bumpDamage;
  } else if(bodyB && bodyB.health) {
    bodyB.health -= game.constants.imp.bumpDamage;
  } else if(this.body && this.body.health) {
    this.body.health -= game.constants.imp.bumpDamage;
  }

  // Bump Sound
  this.PlayBump();
  this.PlayOuch();
};

Imp.prototype.PlayBump = function() {
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

Imp.prototype.PlayOuch = function() {
  var result = Math.floor((Math.random() * 6) + 1);
  if (result ===1){
    game.soundeffects.impudent.play();
  } else if (result ===2){
    game.soundeffects.nuuuu.play();
  } else if (result ===3){
    game.soundeffects.whoop.play();
  }
};

Imp.prototype.GetSpawnLocation = function() {
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

Imp.prototype.SetWin = function() {
  this.animations.play('death', 10, true);
  this.body.data.velocity[0] = 0;
  this.body.data.velocity[1] = 0;
  this.CanMove = false;
};


module.exports = Imp;

},{}],11:[function(require,module,exports){
var Sheep = function(game) {

  // Bit of prep work
  var scale = 0.12;
  var spriteSheet = 'spritesheet_sheep_1';
  var frames = game.cache.getFrameData(spriteSheet).getFrames();
  var spriteSpawn = this.GetSpawnLocation();

  // Instansiate
  Phaser.Sprite.call(this, game, spriteSpawn.position.x, spriteSpawn.position.y, spriteSheet);
  this.id = 'sheep_'+game.totalSheepCount;

  // Appearance
  this.scale.setTo(scale, scale);
  this.animations.add('walk', [0, 1]);

  // Setup physics
  game.physics.p2.enable(this, false);
  this.anchor.y = 0.33;
  this.body.setCircle((frames[0].width * scale) / 3.3);
  this.body.damping = (game.constants.sheep.damping * scale);
  this.body.rotation = spriteSpawn.rotation;
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

},{}],12:[function(require,module,exports){
var Spider = function(game) {

  // Bit of prep work
  var scale = 0.12;
  var spriteSheet = 'spritesheet_spider_1';
  var frames = game.cache.getFrameData(spriteSheet).getFrames();
  var spriteSpawn = this.GetSpawnLocation();

  // Instansiate
  Phaser.Sprite.call(this, game, spriteSpawn.position.x, spriteSpawn.position.y, spriteSheet);
  this.id = 'spider_'+game.totalSpiderCount;

  // Appearance
  this.scale.setTo(scale, scale);
  this.animations.add('walk', [0, 1]);

  // Setup physics
  game.physics.p2.enable(this, false);
  this.anchor.y = 0.33;
  this.body.setCircle((frames[0].width * scale) / 3.3);
  this.body.damping = (game.constants.spider.damping * scale);
  this.body.rotation = spriteSpawn.rotation;
  this.body.health = game.constants.spider.startHealth;

  // A.I. Phase
  this.ActionState = this.ActionStateEnum.IDLE;
  this.ChangeActionState();
  this.PerformActionState();

};

Spider.prototype = Object.create(Phaser.Sprite.prototype);
Spider.prototype.constructor = Spider;
Spider.prototype.update = function() {

  // Play animation if we are moving
  if(this.body.data.velocity[0] > game.constants.spider.moving.threshold || this.body.data.velocity[1] > game.constants.spider.moving.threshold) {
    this.animations.play('walk', 2, false);
  }


  // Turn if we need to
  if(this.TurnToAngle !== null) {
    var newRotation = game.TurnToAngle(this.body.rotation, this.TurnToAngle, game.constants.spider.rotation.speed);
    if(newRotation < game.constants.spider.rotation.threshold && newRotation > -game.constants.spider.rotation.threshold) {
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
Spider.prototype.ActionStateEnum = { IDLE: 0, TURNING: 1, MOVING: 2 };           // Current active AI State
Spider.prototype.BoundingBox = new Phaser.Rectangle(0, 0, 0, 0);                 // Rectangle surrounding entire sprite
Spider.prototype.TurnToAngle = null;                                             // If not null will turn to face this during update


// Pick a location on the map to spawn
Spider.prototype.GetSpawnLocation = function() {

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
Spider.prototype.ChangeActionState = function(){

  // Randomize between 1 and the total number of ActionStateEnum
  var newState = game.rnd.integerInRange(1, Object.keys(this.ActionStateEnum).length);
  this.ActionState = this.ActionStateEnum[Object.keys(this.ActionStateEnum)[newState-1]];

  // Requeue the change
  game.time.events.add(game.constants.spider.actionStateTimeout, function(){
    this.ChangeActionState();
  }, this);

};

Spider.prototype.PerformActionState = function() {

  // Reset all states
  this.TurnToAngle = null;
  this.animations.stop(null, true);


  // Perform whichever state is active
  var nextTimeout = 1000;
  if(this.ActionState == this.ActionStateEnum.IDLE) {
    nextTimeout = game.constants.spider.idle.timeout;
  } else if(this.ActionState == this.ActionStateEnum.TURNING) {
    nextTimeout = game.constants.spider.rotation.timeout;
    if(game.rnd.integerInRange(0, 1) === 0) {
      this.TurnToAngle = this.body.rotation + game.math.degToRad(45);
    } else {
      this.TurnToAngle = this.body.rotation - game.math.degToRad(45);
    }
  } else if(this.ActionState == this.ActionStateEnum.MOVING) {
    nextTimeout = game.constants.spider.moving.timeout;
    this.body.thrust(3000);

    // Reset to idle after a move
    this.ActionState = this.ActionStateEnum.IDLE;
  }


  // Line up the next one
  game.time.events.add(nextTimeout, function(){
    this.PerformActionState();
  }, this);
};



module.exports = Spider;

},{}],13:[function(require,module,exports){
// Load our files
var constantsModule = require('./game/constants');


// Initialize everything
var constants = constantsModule();
window.onload = function() {

  var game = new Phaser.Game(constants.world.width, constants.world.height, Phaser.CANVAS, 'game_canvas');

  // Load up our different game states and begin with the booting
  game.state.add('Boot', require('./game/screens/boot'));
  game.state.add("LoadingScreen", require('./game/screens/loading'));

  game.state.add("MenuScreen", require('./game/screens/menu'));
  game.state.add("InstructionScreen", require('./game/screens/instruction'));
  game.state.add("CreditScreen", require('./game/screens/credit'));
  game.state.add("GamePlayScreen", require('./game/screens/gameplay'));

  game.state.add("WinScreen", require('./game/screens/win'));
  game.state.add("LoseScreen", require('./game/screens/lose'));

  // Where to begin
  game.state.start("Boot");


  // Connect things
  game.IsDebug = checkForDebug();
  console.log(game.IsDebug);
  game.totalImpCount = 0;
  game.totalSheepCount = 0;
  game.totalSpiderCount = 0;

  game.impDeaths = 0; // End goal tracking
  game.impWins = 0;   // End goal tracking

  game.particleRenders = [];
  game.starRenders = [];

  game.constants = constants;
  game.Imp = require('./game/sprites/imp');
  game.Sheep = require('./game/sprites/sheep');
  game.Spider = require('./game/sprites/spider');




  // Game wide helper functions, should be moved to a helper
  game.TurnToFace = function(obj1, obj2, rotationSpeed) {

    var point1 = new Phaser.Point(obj1.x, obj1.y);
    var point2 = new Phaser.Point(obj2.x, obj2.y);
    var targetAngle = point1.angle(point2) + game.math.degToRad(90);
    var rotateDiff = this.TurnToAngle(obj1.body.rotation, targetAngle, rotationSpeed);
    obj1.body.rotation += rotateDiff;

  };

  game.TurnToAngle = function(currentAngle, targetAngle, rotationSpeed) {
    var difference = targetAngle - currentAngle;

    if(difference > game.math.PI) {
      difference = ((2 * game.math) - difference);
    } else if(difference < -game.math.PI) {
      difference = ((2 * game.math) + difference);
    }

    // Move the character's rotation a set amount per unit time
    var delta = (difference < 0) ? -rotationSpeed : rotationSpeed;
    return delta * game.time.elapsed;
  };

  game.AddBlobs = function(e, num){
    var blob;
    for (var i=0; i<num; i++){
      blob = new Phaser.Circle(e.x + Math.floor((Math.random() * 40) - 20),e.y + Math.floor((Math.random() * 40) - 20), Math.floor((Math.random() * 20) + 10));
      blob.vx = (blob.x-e.x) /10;//  (Math.random() * 4) - 2;
      blob.vy = (blob.y-e.y) /10; // (Math.random() * 4) - 2;
      this.particleRenders.push(blob);
    }
  };

  game.AddStars = function(e, num){
    var blob;
    for (var i=0; i<num; i++){
      blob = new Phaser.Circle(e.x + Math.floor((Math.random() * 40) - 20),e.y + Math.floor((Math.random() * 40) - 20), Math.floor((Math.random() * 20) + 10));
      blob.vx = (blob.x-e.x) /6;//  (Math.random() * 4) - 2;
      blob.vy = (blob.y-e.y) /6; // (Math.random() * 4) - 2;
      this.starRenders.push(blob);
    }
  };

  game.GetDistance = function(pointA, pointB){
    return Math.sqrt( Math.pow((pointA.x-pointB.x), 2) + Math.pow((pointA.y-pointB.y), 2) );
  };

  game.AccelerateToObject = function(obj1, obj2, speed) {
    var angle = Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);
    obj1.body.force.x = Math.cos(angle) * speed;
    obj1.body.force.y = Math.sin(angle) * speed;
  };

  game.GetFormattedTime = function(milliseconds) {

    var min = (milliseconds/1000/60) << 0,
        sec = (milliseconds/1000) % 60 << 0;

    if(String(min).length === 1) {
      min = "0" + min;
    }

    if(String(sec).length === 1) {
      sec = "0" + sec;
    }

    return min + ":" + sec;

  };

  game.GetNearest = function(arrIn, pointIn) {
    var nearest = null;
    var currentNearestDistance = 10000000000000;
    var dist;
    arrIn.forEach(function(obj){
      dist = game.GetDistance(pointIn, obj.position);
      if(dist < currentNearestDistance) {
        currentNearestDistance = dist;
        nearest = obj;
      }
    });
    return nearest || null;
  };

  game.GetDistance = function(pointA, pointB){
    return Math.sqrt( Math.pow((pointA.x-pointB.x), 2) + Math.pow((pointA.y-pointB.y), 2) );
  };


  game.TriggerFullscreen = function() {
    if(!game.scale.isFullScreen) {
        game.scale.startFullScreen(false);
    }
  };


  function checkForDebug() {
    return (getParameterByName('debug') === '1');
  }

  function getParameterByName(name, url) {
      if (!url) url = window.location.href;
      name = name.replace(/[\[\]]/g, "\\$&");
      var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
          results = regex.exec(url);
      if (!results) return null;
      if (!results[2]) return '';
      return decodeURIComponent(results[2].replace(/\+/g, " "));
  }


  // Ready to go
  this.game = game;

};

},{"./game/constants":1,"./game/screens/boot":2,"./game/screens/credit":3,"./game/screens/gameplay":4,"./game/screens/instruction":5,"./game/screens/loading":6,"./game/screens/lose":7,"./game/screens/menu":8,"./game/screens/win":9,"./game/sprites/imp":10,"./game/sprites/sheep":11,"./game/sprites/spider":12}]},{},[13]);
