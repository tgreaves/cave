'use strict';

const { Broadcast, PlayerRoles } = require('ranvier');

/**
 * Collapse the Cave.  Note that this does NOT save players.
 * The user issuing the command is NOT removed.
 */
module.exports = {
  requiredRole: PlayerRoles.ADMIN,
  command: state => (args, player) => {
    
    Broadcast.sayAt(state.PlayerManager, `<b><yellow>Cave collapses.</yellow></b>`);
    
    state.PlayerManager.players.forEach((targetPlayer) => {
      if (targetPlayer.name != player.name)  {
        targetPlayer.emit('dropEverything');
        state.PlayerManager.removePlayer(targetPlayer, true);
      }
     
    });

  }

};
