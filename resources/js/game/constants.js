module.exports = function() {
  return {

    world: {
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

      scale: {low: 0.07, high: 0.1}
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
