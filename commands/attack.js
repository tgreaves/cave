'use strict';

const Ranvier = require('ranvier');
const B = Ranvier.Broadcast;
const Logger = Ranvier.Logger;

const Combat = require('../lib/Combat');
const CombatErrors = require('../lib/CombatErrors');

module.exports = {
  aliases: ['hit','shoot','burn','zap','stab','bite','strike','thump','punch','kick'],
  usage: 'attack <player/npc>',

  command: (state) => (args, player) => {
    //if (player.level < 4) {
    //  return Broadcast.sayAt(player, 'You can\'t do that.');
    //}

    if (!args || !args.length) {
      return B.sayAt(player, 'Attack what?');
    }

    let target = null;
    try {
      target = Combat.findCombatant(player, args);
    } catch (e) {
      if (
        e instanceof CombatErrors.CombatNotInThisRoomError ||
        e instanceof CombatErrors.CombatSelfError ||
        e instanceof CombatErrors.CombatNonPvpError ||
        e instanceof CombatErrors.CombatInvalidTargetError ||
        e instanceof CombatErrors.CombatPacifistError
      ) {
        return B.sayAt(player, e.message);
      }

      Logger.error(e.message);
    }

    if (!target) {
      return B.sayAt(player, "They aren't here.");
    }

    B.sayAt(player, `You attack ${target.name}.`);

  }
};
