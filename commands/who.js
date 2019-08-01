'use strict';

const { Broadcast: B } = require('ranvier');

module.exports = {
  aliases: ['users','cavers'],
  usage: 'who',
  command: (state) => (args, player) => {
    B.sayAt(player, "These people are in CAVE:");
    B.sayAt(player, "=========================");
    
    state.PlayerManager.players.forEach((otherPlayer) => {
      B.sayAt(player, ` *  ${otherPlayer.name}${getStaminaString(otherPlayer.getAttribute('stamina'))}${getRoleString(otherPlayer.role)}`);
    });

    B.sayAt(player, state.PlayerManager.players.size + ' total');

    function getRoleString(role = 0) {
      return [
        '',
        ' <white>[Builder]</white>',
        ' <b><white>[Admin]</white></b>'
      ][role] || '';
    }

    function getStaminaString(otherPlayerStamina) {
      if (player.level == 4) {
        return " stamina " + otherPlayerStamina;
      } else {
        return '';
      }
    }
  }
};
