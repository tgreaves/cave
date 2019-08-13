'use strict';

const { Broadcast, PlayerRoles } = require('ranvier');

module.exports = {
  command: state => (args, player) => {
    
    Broadcast.sayAtExcept(state.PlayerManager, `<b><yellow>` + player.name + ` is calling for help!</yellow></b>`, player);
    return Broadcast.sayAt(player, 'You call for HELP!');

  }

};
