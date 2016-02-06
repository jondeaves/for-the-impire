var loadingScreen = function(){};
module.exports = loadingScreen;

var loadingText;
loadingScreen.prototype = {
  preload: function() {
    // Load anything needed before the actual asset loading is done.
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
