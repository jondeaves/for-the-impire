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
