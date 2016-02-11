(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function() {
  return {

    world: {
      minWidth: 600,
      minHeight: 360,
      width: 1280,
      height: 720,
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
      spawnRate: '',

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
    this.game.scale.minWidth =  this.game.constants.world.minWidth;
    this.game.scale.minHeight = this.game.constants.world.minHeight;
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
    game.debug.geom(pentagramRectangle, 'rgba(200,0,0,0.5)');

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

  pentagram = game.add.sprite(120, (game.height / 2) - 70, 'sprite_goal_one');
  pentagramRectangle = new Phaser.Rectangle(pentagram.x, pentagram.y, pentagram.width, pentagram.height);

  // Impress appears at the end
  impressBG = game.add.sprite(180, 10, 'sprite_impress');
  impressBG.visible = false;

};

gamePlayScreen.prototype.CheckForSacrifice = function() {
  for(var i = 0; i < impObjectGroup.length; i++) {
    var pentImp = impObjectGroup.children[i];
    var impRectangle = new Phaser.Rectangle(pentImp.x, pentImp.y, pentImp.width, pentImp.height);
    var intersects = Phaser.Rectangle.intersection(impRectangle, pentagramRectangle);
    if(intersects.width > 30 && intersects.height > 30) {
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
      game.state.start("GamePlayScreen");
    }, this, 2, 1, 0);
    startBtn.scale.setTo(0.65, 0.65);

    instructionBtn = game.add.button(instructionBtnX, instructionBtnY, 'spritesheet_instruction_button', function() {
      game.state.start("InstructionScreen");
    }, this, 2, 1, 0);
    instructionBtn.scale.setTo(0.65, 0.65);

    creditBtn = game.add.button(creditBtnX, creditBtnY, 'spritesheet_credit_button', function() {
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
  var impSpriteNumber = game.rnd.integerInRange(1, 2);
  var spriteSheet = 'spritesheet_imp_'+impSpriteNumber;
  var impScale = 0.1;
  var frames = game.cache.getFrameData(spriteSheet).getFrames();
  var impSpawn = this.GetSpawnLocation();

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
};


// Properties
Imp.prototype.Target = null;
Imp.prototype.isDying = false;
Imp.prototype.deathSpinSpeed = 0;
Imp.prototype.CanMove = true;


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
  game.totalImpCount = 0;
  game.impDeaths = 0; // End goal tracking
  game.impWins = 0;   // End goal tracking
  game.constants = constants;
  game.Imp = require('./game/sprites/imp');

  game.particleRenders = [];
  game.starRenders = [];




  // Game wide helper functions, should be moved to a helper
  game.TurnToFace = function(obj1, obj2, rotationSpeed) {

    var point1 = new Phaser.Point(obj1.x, obj1.y);
    var point2 = new Phaser.Point(obj2.x, obj2.y);
    var targetAngle = point1.angle(point2) + game.math.degToRad(90);
    var difference = targetAngle - obj1.body.rotation;

    if(difference > game.math.PI) {
      difference = ((2 * game.math) - difference);
    } else if(difference < -game.math.PI) {
      difference = ((2 * game.math) + difference);
    }

    // Move the character's rotation a set amount per unit time
    var delta = (difference < 0) ? -rotationSpeed : rotationSpeed;
    var rotateDiff = delta * game.timeSinceLastTick;
    obj1.body.rotation += rotateDiff;

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




  // Ready to go
  this.game = game;

};

},{"./game/constants":1,"./game/screens/boot":2,"./game/screens/credit":3,"./game/screens/gameplay":4,"./game/screens/instruction":5,"./game/screens/loading":6,"./game/screens/lose":7,"./game/screens/menu":8,"./game/screens/win":9,"./game/sprites/imp":10}]},{},[11]);
