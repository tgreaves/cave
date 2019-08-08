'use strict';

const { Broadcast, Damage, EffectFlag } = require('ranvier');

/**
 * POISON !
 */
module.exports = {
  config: {
    name: 'Poison',
    type: 'poison',
    maxStacks: 1,
    tickInterval: 5,
    poisonDamage: 1
  },
  listeners: {
    effectActivated: function () {
      //Broadcast.sayAt(this.target, "<bold><red>You've suffered a deep wound, it's bleeding profusely</red></bold>");
    },

    effectDeactivated: function () {
      //Broadcast.sayAt(this.target, "Your wound has stopped bleeding.");
    },

    updateTick: function () {
      Broadcast.sayAt(this.target, "I am poisoned");
      const damage = new Damage("stamina", 1, this.attacker, this, { attackDescription: 'poisoned' });
      damage.commit(this.target);
    },

    killed: function () {
      this.remove();
    }
  }
};
