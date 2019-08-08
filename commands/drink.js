'use strict';

const { Broadcast, ItemType } = require('ranvier');
const ArgParser = require('../lib/ArgParser');
const ItemUtil = require('../lib/ItemUtil');

module.exports = {
  usage: 'drink <item>',
  command : (state) => (args, player) => {
    args = args.trim();

    if (!args.length) {
      return Broadcast.sayAt(player, 'Drink what?');
    }

    const item = ArgParser.parseDot(args, player.inventory);

    if (!item) {
      return Broadcast.sayAt(player, "You aren't carrying anything like that.");
    }

    if (item.type != ItemType.POTION) {
      Broadcast.sayAt(player, 'That isn\'t drinkable!');
    }

    if (item.id == 'poison') {
      const effect = state.EffectFactory.create(
        'poison', {
          tickInterval: item.getMeta('poisonRate'),
          poisonDamage: item.getMeta('poisonDamage')
        });
      effect.attacker = player;

      player.addEffect(effect);
      return Broadcast.sayAt(player, 'It tastes terrible!');
    }

    if (item.id == 'medicine') {
      if (! player.hasEffectType('poison')) {
        return Broadcast.sayAt(player, 'YUCK!!');
      }

      const effect = player.effects.getByType('poison');

      player.removeEffect(effect);
      return Broadcast.sayAt(player, 'You are cured');
    }

    // TODO: Implement vodka !  
  }
};
