'use strict';

const { Broadcast, Damage, EffectFlag } = require('ranvier');

/**
 * force-input !
 */
module.exports = {
  config: {
    name: 'Force Input',
    type: 'force-input',
  },
  listeners: {
    effectActivated: function () {
      //Broadcast.sayAt(this.target, "<bold><red>You've suffered a deep wound, it's bleeding profusely</red></bold>");
    },

    effectDeactivated: function () {
      //Broadcast.sayAt(this.target, "Your wound has stopped bleeding.");
    },

    killed: function () {
      this.remove();
    }
  }
};
