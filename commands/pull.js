'use strict';

const { Broadcast } = require('ranvier');

module.exports = {
  usage: 'pull <object>',
  command: (state) => (args, player, arg0, commandState) => {
    if (!commandState) {
      
      if (!args || !args.length) {
        return Broadcast.sayAt(player, 'Pull what?');
      }

      if (args != 'rope') {
        return Broadcast.sayAt(player, 'I can\'t pull that.');
      }

      if ( !player.room.getMeta('rope') == true) {
        return Broadcast.sayAt(player, 'You can\'t do that here.');
      }
      
      if (player.room.area.getMeta('rope-pulled') == true) {
        return Broadcast.sayAt(player, 'The rope is already being pulled!');
      }

      player.room.area.setMeta('rope-pulled', true);
      const targetRoom = state.RoomManager.getRoom('cave:30');
      targetRoom.openDoor(player.room);

      Broadcast.sayAtExcept(player.room, 'The portcullis goes UP', player);
      Broadcast.sayAt(targetRoom, 'The portcullis goes UP');

      Broadcast.sayAt(player, 'You pull the rope and the Portcullis goes up!!');
      Broadcast.at(player, 'Press \<RETURN\> to let go:');
      return 'dropit';
    }

    // Returning after letting go.
    player.room.area.setMeta('rope-pulled', false);
    const targetRoom = state.RoomManager.getRoom('cave:30');
    targetRoom.closeDoor(player.room);

    Broadcast.sayAtExcept(player.room, 'The portcullis FALLS!', player);
    Broadcast.sayAt(targetRoom, 'The portcullis FALLS!');

    Broadcast.sayAt(player, 'You let go.');
  
  }
};
