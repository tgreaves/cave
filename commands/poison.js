'use strict';

const Ranvier = require('ranvier');
const B = Ranvier.Broadcast;
const Logger = Ranvier.Logger;
const ArgParser = require('../lib/ArgParser');

module.exports = {
  usage: 'poison <target>',

  command: (state) => (args, player, invokedCommand) => {
    if (!args || !args.length) {
      return B.sayAt(player, 'Poison who?');
    }

    const hasPoison = ArgParser.parseDot('poison', player.inventory);

    if (!hasPoison) {
      return B.sayAt(player, "You do not have the poison.");
    }

    let targetRoom = player.room;
    const targetNpc = ArgParser.parseDot(args, targetRoom.npcs);

    if (targetNpc) {
      return B.sayAt(player, "The cave " + targetNpc.name + " thrives on POISON!!");
    }

    const target = ArgParser.parseDot(args, targetRoom.players);

    if (!target) {
      return B.sayAt(player, 'They aren\'t here.');
    }

    const area = state.AreaManager.getArea('cave');
    const poisonItem = state.ItemFactory.create(area, 'cave:poison');

    const effect = state.EffectFactory.create(
      'poison', {
        tickInterval: poisonItem.getMeta('poisonRate'),
        poisonDamage: poisonItem.getMeta('poisonDamage')
      });
    effect.attacker = player;

    target.addEffect(effect);
    
    B.sayAt(target, `${player.name} has POISONed you!`)
    return B.sayAt(player, `${target.name} is POISONed!`);

  }
};
