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
  game.impDeaths = 0; // End goal tracking
  game.impWins = 0;   // End goal tracking
  game.constants = constants;
  game.Imp = require('./game/sprites/imp');

  game.turnToFace = function(obj1, obj2) {

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
    var rotateDiff = delta * timeSinceLastTick;
    obj1.body.rotation += rotateDiff;

  };

  // Ready to go
  this.game = game;

};
