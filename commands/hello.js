'use strict';

const Ranvier = require('ranvier');
const B = Ranvier.Broadcast;
const Logger = Ranvier.Logger;

module.exports = {
  usage: 'hello',

  command: (state) => (args, player, invokedCommand) => {
    
    B.sayAtExcept(player.room, player.name + " says HELLO!", player);
    return B.sayAt(player, 'HELLO!!');
    
  }
};
