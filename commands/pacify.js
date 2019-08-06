'use strict';

const Ranvier = require('ranvier');
const B = Ranvier.Broadcast;
const Logger = Ranvier.Logger;
const ArgParser = require('../lib/ArgParser');

module.exports = {
  usage: 'pacify <npc>',

  command: (state) => (args, player, invokedCommand) => {
    if (player.level < 4) {
      return Broadcast.sayAt(player, 'You can\'t do that.');
    }

    if (!args || !args.length) {
      return B.sayAt(player, 'Pacify what?');
    }

    let targetRoom = player.room;
    const target = ArgParser.parseDot(args, targetRoom.npcs);

    if (!target) {
      return B.sayAt(player, 'Could not see that here.');
    }

    if (!target.isInCombat()) {
      return B.sayAt(player, target.name + " is not in combat.");
    }

    target.removeFromCombat()

    return B.sayAt(targetRoom, `${target.name} is pacified.`);
  }
};
