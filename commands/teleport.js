'use strict';

const { Broadcast, PlayerRoles } = require('ranvier');

module.exports = {
  usage: 'teleport <player/object>',
  requiredRole: PlayerRoles.ADMIN,
  command: (state) => (args, player) => {
    if (!args || !args.length) {
      return Broadcast.sayAt(player, 'Teleport to what?');
    }

    const target = args;
    const targetPlayer = state.PlayerManager.getPlayer(target);
    if (!targetPlayer) {
      return Broadcast.sayAt(player, 'No such player online.');
    }

    const targetRoom = targetPlayer.room;
  
    player.followers.forEach(follower => {
      follower.unfollow();
      if (!follower.isNpc) {
        Broadcast.sayAt(follower, `You stop following ${player.name}.`);
      }
    });

    if (player.isInCombat()) {
      player.removeFromCombat();
    }

    const oldRoom = player.room;

    player.moveTo(targetRoom, () => {
      Broadcast.sayAt(player, 'You vanish in a puff of smoke\r\n');
      state.CommandManager.get('look').execute('', player);
    });

    Broadcast.sayAtExcept(oldRoom, `${player.name} teleported away.`, player);
    Broadcast.sayAtExcept(targetRoom, `${player.name} appears.`, player);
  }
};
