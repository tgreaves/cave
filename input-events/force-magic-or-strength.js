'use strict';

const { EventUtil, Broadcast } = require('ranvier');

/**
 * FORCE command.  Use magic or strength?
 */
module.exports = {
  event: state => (socket, args) => {
    const write = EventUtil.genWrite(socket);
    const say = EventUtil.genSay(socket);
    const player = args.player;
    const target = args.target;

    write("<cyan>Use Magic or Strength (M/S)?</cyan> ");

    // This is adding a flag that commands.js can use to not try processing this input as a command.
    const newEffect = state.EffectFactory.create('force-input', {});
    player.addEffect(newEffect);

    socket.once('data', forceChoice => {
      if ( forceChoice.toString().toLowerCase() != 'm' && forceChoice.toString().toLowerCase() != 's') {
        Broadcast.sayAt(player, 'Abandoned!');
        //player.socket.emit('commands', player);
      }

      return player.emit('forcing', player, target, args.forceCommand, args.forceCommandParam, forceChoice.toString());

    });

    
  }
};
