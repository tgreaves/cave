'use strict';

const { Random } = require('rando-js');
const Ranvier = require('ranvier');
const B = Ranvier.Broadcast;
const Logger = Ranvier.Logger;
const Damage = Ranvier.Damage;

const Combat = require('../lib/Combat');
const CombatErrors = require('../lib/CombatErrors');
const ArgParser = require('../lib/ArgParser');

module.exports = {
  aliases: ['hit','shoot','burn','zap','stab','bite','strike','thump','punch','kick'],
  usage: 'attack <player/npc>',

  command: (state) => (args, player, invokedCommand) => {
    // TODO: Implement command permissions.
    //if (player.level < 4) {
    //  return Broadcast.sayAt(player, 'You can\'t do that.');
    //}

    if (!args || !args.length) {
      return B.sayAt(player, 'Attack what?');
    }

    let target = null;
    try {
      target = Combat.findCombatant(player, args);
    } catch (e) {
      if (
        e instanceof CombatErrors.CombatNotInThisRoomError ||
        e instanceof CombatErrors.CombatSelfError ||
        e instanceof CombatErrors.CombatNonPvpError ||
        e instanceof CombatErrors.CombatInvalidTargetError
      ) {
        return B.sayAt(player, e.message);
      }

      Logger.error(e.message);
    }

    if (!target) {
      return B.sayAt(player, "They aren't here.");
    }

    // Table of attack types.
    let attackTypes = {  
      "stab": ["knife", 'STABbed']
    };

    B.sayAt(player, "Trying " + invokedCommand);

    if ( !attackTypes[invokedCommand]) {
      return B.sayAt(player, 'NYI');
    }
    
    let [weaponRequired, attackDescription] = attackTypes[invokedCommand];

    // Check if the player is carrying the required item.
    const item = ArgParser.parseDot(weaponRequired, player.inventory);

    if (!item) {
      return B.sayAt(player, "But you do not have the " + weaponRequired);
    }

    player.initiateCombat(target);
    B.sayAt(player, `You attack ${target.name}.`);

    // Damage calculation.
    let amount = Random.inRange(item.getMeta('minDamage'), item.getMeta('maxDamage'));
    if (item.getMeta('multiplier')) {
      amount = amount * item.getMeta('multiplier');
    }

    B.sayAt(player, 'Damage calc was ' + amount);

    const damage = new Damage('stamina', amount, player, item);
    damage.commit(target);

    B.sayAt(player, target.name + " is " + attackDescription + ". Stamina=" + target.getAttribute('stamina'));

  }
};
