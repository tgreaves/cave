'use strict';

const { Broadcast } = require('ranvier');

/**
 * Flush the command queue
 */
module.exports = {
  usage: 'kill',
  command : (state) => (args, player) => {
    Broadcast.sayAt(player, 'Life is not that simple...try HIT');
  }
};
