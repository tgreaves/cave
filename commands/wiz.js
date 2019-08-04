'use strict';

const { Broadcast, PlayerRoles } = require('ranvier');

module.exports = {
  usage: 'wiz',
  command: (state) => (args, player) => {
    if (player.level < 4) {
      return Broadcast.sayAt(player, "You can't do that.");
    }

    const targetRoom = state.RoomManager.getRoom('cave:16')
    
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
