'use strict';

const Ranvier = require('ranvier');
const B = Ranvier.Broadcast;
const Logger = Ranvier.Logger;
const ArgParser = require('../lib/ArgParser');

module.exports = {
  usage: 'force <player> <command>',

  command: (state) => (args, player, invokedCommand) => {
    if (!args || !args.length) {
      return B.sayAt(player, 'Force who?');
    }

    let [ targetArg, forceCommand, forceCommandParam] = args.split(' ');

    let target = state.PlayerManager.getPlayer(targetArg);

    if (!target) {
      return B.sayAt(player, 'I don\'t know who that is.');
    }
    
    if (!forceCommand) {
      return B.sayAt(player, 'To do what?');
    }

    // These commands are banned for non-wizards to force.
    if (player.level < 4) {
      switch (forceCommand.toLowerCase()) {
        case 'quit':
        case 'force':
        case 'tell':
        case 'say':
        case 'activity':
        case 'collapse':
          return B.sayAt(player, 'NOT THAT ONE!');
      }
    }

    if (player.level == 4) {
      // Automatic success, no need to prompt for type of forcing.
      return player.emit('forcing', player, target, forceCommand, forceCommandParam, 'm');
    } else {
      // Caver needs to select HOW to force (Magic or strength?)
      return player.socket.emit('force-magic-or-strength', player.socket, { player, target, forceCommand, forceCommandParam });
    }

  }
};
