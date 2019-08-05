'use strict';

const Combat = require('../../lib/Combat');
const { Logger } = require('ranvier');

module.exports = () => {
  return  {
    listeners: {
      /**
       * @param {*} config Behavior config
       */

      /**
       * NPC was killed
       * @param {*} config Behavior config
       * @param {Character} killer
       */
      killed: state => function (config, killer) {
      },

      /**
       * NPC hit another character
       * @param {*} config Behavior config
       * @param {Damage} damage
       * @param {Character} target
       */
      hit: state => function (config, damage, target) {
      },

      damaged: state => function (config, damage) 
      {
        Logger.log('damage invoked.');
        
        if (this.getAttribute('stamina') <= 0) {
          Combat.handleDeath(state, this, damage.attacker);
        }
      },

      /**
       * NPC killed a target
       * @param {*} config Behavior config
       * @param {Character} target
       */
      deathblow: state => function (config, target) {
        if (!this.isInCombat()) {
         // Combat.startRegeneration(state, this);
        }
      }

      // refer to bundles/ranvier-combat/player-events.js for a further list of combat events
    }
  };
};
