'use strict';

const Combat = require('../../lib/Combat');
const { Logger, Broadcast } = require('ranvier');

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

        Broadcast.sayAt(this.room, "The " + this.name + " has passed away.")

        if ( this.getMeta('death-broadcast')) {
          let da = this.getMeta('death-broadcast');
          Broadcast.sayAt(state.PlayerManager, `<b><yellow>${da}</yellow></b>`);
        }

        this.moveTo( state.RoomManager.getRoom('cave:19'));

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
        //Broadcast.sayAt(this.room, this.name + " is " + damage.metadata.attackDescription + ". Stamina=" + this.getAttribute('stamina'));

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
