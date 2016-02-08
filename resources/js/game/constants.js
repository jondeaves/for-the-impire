module.exports = function() {
  return {

    world: {
      minWidth: 860,
      minHeight: 480,
      width: 1280,
      height: 720
    },

    physics: {
      restitution: 5
    },

    game: {
      start: {
        impCount: 6
      }
    },

    imp: {
      startHealth: 100,
      spawnRate: '',

      bumpDamage: 15,
      damping: 6,

      baseThrust: 50,
      rotationSpeed: 0.0025,

      targetOffset: 30,               // Within this distance the target will be dropped
    }

  };

};
