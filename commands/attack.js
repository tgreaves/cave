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

    if (  invokedCommand == 'strike' ||
          invokedCommand == 'thump'  ||
          invokedCommand == 'punch'  || 
          invokedCommand == 'kick') {
            invokedCommand = 'hit';
          }

    // Table of attack types.
    let attackTypes = {  
      "hit":    ['stick',         'HIT',      1],
      "stab":   ['knife',         'STABbed',  1],
      "burn":   ['flamethrower',  'BURNed',   1],
      "shoot":  ['bow',           'SHOT',     1],
      "bite":   ['INNATE',        'BITEn',    1],
      "zap":    ['INNATE',        'ZAPped!',  4]
    };

    if ( !attackTypes[invokedCommand]) {
      return B.sayAt(player, 'NYI: ' + invokedCommand);
    }
    
    let [weaponRequired, attackDescription, minimumLevel] = attackTypes[invokedCommand];

    if (player.level < minimumLevel) {
      return B.sayAt(player, 'You can\'t do that.');
    }

    // Check if the player is carrying the required item.
    const item = ArgParser.parseDot(weaponRequired, player.inventory);
    const arrowItem = ArgParser.parseDot('arrow', player.inventory);

    if (weaponRequired != 'INNATE' && !item && invokedCommand != 'hit') {
      return B.sayAt(player, "But you do not have the " + weaponRequired);
    }

    if (invokedCommand == 'shoot' && !arrowItem) {
      return B.sayAt(player, "You have no Arrow.");
    }
    
    player.initiateCombat(target);
  
    // Damage calculation.
    let amount = 0;

    // HIT is a special case.  You can HIT with or without having the Stick.
    if (invokedCommand == 'hit' && !item)
    {
      // Hitting without a stick.
      amount = Random.inRange(1,3);
    } else if (invokedCommand == 'zap') {
      amount = Random.inRange(1, 40) + 100;
    } else if (invokedCommand == 'bite') {
      if (Random.inRange(1,3) != 1) {
        B.sayAt(target, player.name + " tries to BITE you!");
        return B.sayAt(player, target.name + " dodges away!");
      }

      amount = 3 + Random.inRange(1,3);
      
      if (player.hasEffectType('poison') && !target.isNpc) {
        const effect = player.effects.getByType('poison');

        const newEffect = state.EffectFactory.create(
          'poison', {
            tickInterval: effect.config.tickInterval,
            poisonDamage: effect.config.poisonDamage
          });
        effect.attacker = player;
  
        target.addEffect(newEffect);
      }

    } else {
      amount = Random.inRange(item.getMeta('minDamage'), item.getMeta('maxDamage'));

      if (item && item.getMeta('multiplier')) {
        amount = amount * item.getMeta('multiplier');
      }
    }

    if (item && item.name == 'Stick') {
      attackDescription = attackDescription + ' using the stick';
    }

    if (invokedCommand == 'shoot') {
      player.removeItem(arrowItem);
      player.room.addItem(arrowItem);
    }

    const damage = new Damage('stamina', amount, player, item , { "attackDescription": attackDescription  });
    damage.commit(target);

  }
};
