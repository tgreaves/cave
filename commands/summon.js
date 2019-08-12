'use strict';

const { Random } = require('rando-js');

const { Broadcast, PlayerRoles } = require('ranvier');
const ArgParser = require('../lib/ArgParser');

module.exports = {
  usage: 'summon <player/ccm>',
  command: (state) => (args, player) => {
    if (!args || !args.length) {
      return Broadcast.sayAt(player, 'Summon who?');
    }

    const target = args;
    let targetCharacter= state.PlayerManager.getPlayer(target);

    if (!targetCharacter) {
      for (let [uuid, mob] of Object.entries([...state.MobManager.mobs])) {
        targetCharacter = mob.find(mob => mob.id === target);
        if (targetCharacter) {
          break;
        }
      }
    }
     
    if (!targetCharacter) {
      return Broadcast.sayAt(player, 'Who?');
    }

    if (targetCharacter.room.id == 19 && targetCharacter.isNpc()) {
      return Broadcast.sayAt(player, 'Currently in the Mortuary!');
    }

    // Magic checks.
    // Wizards always pass.
    // 1140IFRND(20/s)>1-3*(!&A28=A*&100)PRINT"Nothing Happens":ENDPROC
    if (player.level < 4) {
      let s = 1;
      if (player.level == 3) {
        s = 2;
      }
     
      const hasRuby = ArgParser.parseDot('ruby', player.inventory);
      let magicPower = 1;

      if (hasRuby) { magicPower = 3; }

      if (Random.inRange(1, 20/s) > magicPower) {
        return Broadcast.sayAt(player, 'Nothing happens.');
      }
    }

    if (targetCharacter.isInCombat()) {
      targetCharacter.removeFromCombat();
    }

    const oldRoom = targetCharacter.room;

    targetCharacter.moveTo(player.room, () => {
      Broadcast.sayAt(targetCharacter, 'You vanish in a puff of smoke\r\n');
      state.CommandManager.get('look').execute('', targetCharacter);
    });

    Broadcast.sayAtExcept(oldRoom, `${targetCharacter.name} teleported away.`, targetCharacter);
    Broadcast.sayAtExcept(targetCharacter.room, `${targetCharacter.name} appears.`, targetCharacter);
  }
};
