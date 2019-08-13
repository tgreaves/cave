'use strict';

const Ranvier = require('ranvier');
const B = Ranvier.Broadcast;
const Logger = Ranvier.Logger;

const Combat = require('../lib/Combat');
const CombatErrors = require('../lib/CombatErrors');

module.exports = {
  usage: 'annoy <player/npc>',

  command: (state) => (args, player, invokedCommand) => {
    if (!args || !args.length) {
      return B.sayAt(player, 'Annoy who?');
    }

    let target = null;
    try {
      target = Combat.findCombatant(player, args);
    } catch (e) {
      if (
        e instanceof CombatErrors.CombatNotInThisRoomError ||
        e instanceof CombatErrors.CombatSelfError ||
        e instanceof CombatErrors.CombatNonPvpError ||
        e instanceof CombatErrors.CombatInvalidTargetError
      ) {
        return B.sayAt(player, e.message);
      }

      Logger.error(e.message);
    }

    if (!target) {
      return B.sayAt(player, "They aren't here.");
    }

    if (target.isNpc) {
      player.initiateCombat(target);
    } else {
      B.sayAt(target, player.name + " is ANNOYing you!");
    }

    B.sayAt(player, target.name + " is ANNOYed!");
    
  }
};
