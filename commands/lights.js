'use strict';

const { Broadcast, PlayerRoles, WorldAudience } = require('ranvier');

module.exports = {
  aliases: ['power','light','switch'],
  usage: 'lights <on | off>',
  command: (state) => (args, player) => {
    if ( !player.room.getMeta('light-switch') == true) {
      return Broadcast.sayAt(player, 'You can\'t do that here.');
    }
    if (!args || !args.length) {
      return Broadcast.sayAt(player, 'I can only switch the lights on or off.');
    }

    const wa = new WorldAudience();

    if (args === 'on')
    {
      if (player.room.area.getMeta('lights') === 'on') {
        return Broadcast.sayAt(player, 'The lights are already on.');
      }

      player.room.area.setMeta('lights', 'on');
      return Broadcast.sayAt(state.PlayerManager, 'The lights come ON!');
    } else if (args === 'off') {
      if (player.room.area.getMeta('lights') == 'off') {
        return Broadcast.sayAt(player, 'The lights are already off.')
      }

      player.room.area.setMeta('lights', 'off');
      return Broadcast.sayAt(state.PlayerManager, 'The lights go OFF!');
    }

    return Broadcast.sayAt(player, 'I can only switch the lights on or off.');

  }
};
