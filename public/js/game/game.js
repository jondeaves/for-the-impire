window.onload = function() {
  game = new Phaser.Game(constants.screenWidth, constants.screenHeight, Phaser.AUTO, 'game_canvas');

  // Load up our different game states
  game.state.add("LoadingScreen", loadingScreen);
  game.state.add("MenuScreen", menuScreen);
  game.state.add("InstructionScreen", instructionScreen);
  game.state.add("CreditScreen", creditScreen);
  game.state.add("GamePlayScreen", gamePlayScreen);

  game.state.add("WinScreen", winScreen);
  game.state.add("LoseScreen", loseScreen);

  // Where to begin
  game.state.start("LoadingScreen");
};
