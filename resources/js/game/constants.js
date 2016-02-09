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
      }

    },

    imp: {
      ttl: 30,                        // Number of seconds to live
      startHealth: 110,
      spawnRate: '',

      bumpDamage: 15,
      damping: 6,

      maxVelocity: 5,
      baseThrust: 50,
      rotationSpeed: 0.0025,

      targetOffset: 30,               // Within this distance the target will be dropped


      deathDuration: 1000,
      deathSpinSpeedIncrement: 0.075,   // Speed increase by this much each time
      deathSpinSpeed: 8,
      deathScaleSpeed: 0.001,
    }

  };

};
