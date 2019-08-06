'use strict';

const Ranvier = require('ranvier');
const B = Ranvier.Broadcast;
const Logger = Ranvier.Logger;
const ArgParser = require('../lib/ArgParser');

module.exports = {
  usage: 'deploy <npc>',

  command: (state) => (args, player, invokedCommand) => {
    if (player.level < 4) {
      return Broadcast.sayAt(player, 'You can\'t do that.');
    }

    if (!args || !args.length) {
      return B.sayAt(player, 'Deploy what?');
    }

    let targetRoom = state.RoomManager.getRoom('cave:19');
    const target = ArgParser.parseDot(args, targetRoom.npcs);

    if (!target) {
      return B.sayAt(player, 'Could not find that in the Mortuary.');
    }

    target.setAttributeToMax('stamina');
    target.combatData.killed = false;
    target.moveTo( state.RoomManager.getRoom( 'cave:' + target.getMeta('spawnRoom')));

    B.sayAt(targetRoom, `${target.name} dematerialises.`);
    B.sayAt(target.room, `${target.name} materialises.`);
    return B.sayAt(player, 'Deployed.');

  }
};
