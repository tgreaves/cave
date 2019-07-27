'use strict';

const { Broadcast } = require('ranvier');
const ItemUtil = require('../lib/ItemUtil');

module.exports = {
  usage: 'inventory',
  aliases: [ 'invent' ],
  command : (state) => (args, player) => {
    if (!player.inventory || !player.inventory.size) {
      return Broadcast.sayAt(player, "You aren't carrying anything.");
    }

    Broadcast.at(player, "You are carrying");
    if (isFinite(player.inventory.getMax())) {
      Broadcast.at(player, ` (${player.inventory.size}/${player.inventory.getMax()})`);
    }
    Broadcast.sayAt(player, ':');

    // TODO: Implement grouping
    for (const [, item ] of player.inventory) {
      Broadcast.sayAt(player, ItemUtil.display(item));
    }
  }
};
