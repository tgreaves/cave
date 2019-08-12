'use strict';

const { Random } = require('rando-js');

const { Broadcast, PlayerRoles } = require('ranvier');
const ArgParser = require('../lib/ArgParser');

module.exports = {
  usage: 'teleport <player/ccm>',
  command: (state) => (args, player) => {
    if (!args || !args.length) {
      return Broadcast.sayAt(player, 'Teleport to what?');
    }

    const target = args;
    const targetPlayer = state.PlayerManager.getPlayer(target);
    let targetRoom = '';

    if (targetPlayer) {
      targetRoom = targetPlayer.room;
    } else {
      for (let [uuid, mob] of Object.entries([...state.MobManager.mobs])) {
        const targetMob = mob.find(mob => mob.id === target);
        if (targetMob) {
          targetRoom = targetMob.room;
          break;
        }
      }
    }
     
    if (!targetRoom) {
      // Finally, try objects 
      const targetItem = [...state.ItemManager.items].find(item => item.id === target);
      if (targetItem) {

        if (targetItem.carriedBy) {
          return Broadcast.sayAt(player, 'That object is being carried by a CAVER');
        }
        targetRoom = targetItem.room;
      }
    }

    if (!targetRoom) {
      return Broadcast.sayAt(player, 'Known OBJECTS & CCMS only!');
    }

    if (player.level < 4) {
      if (targetRoom.id > 15 && targetRoom.id < 21) {
        return Broadcast.sayAt(player, 'That is in the WIZARD\'s domain');
      }
    }

    // Magic checks.
    // Wizards always pass.
    // 1950IFF=FALSEANDRND(50/s)>1-4*((A*&100)=!&A28)PRINT"Nothing happens":ENDPROC
    if (player.level < 4) {
      let s = 1;
      if (player.level == 3) {
        s = 2;
      }
     
      const hasRuby = ArgParser.parseDot('ruby', player.inventory);
      let magicPower = 1;

      if (hasRuby) { magicPower = 4; }

      if (Random.inRange(1, 50/s) > magicPower) {
        return Broadcast.sayAt(player, 'Nothing happens.');
      }
    }

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
