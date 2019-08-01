'use strict';

const { Random } = require('rando-js');
const { Damage, Logger } = require('ranvier');
const Parser = require('../../cave/lib/ArgParser');
const CombatErrors = require('./CombatErrors');

class Combat {

    static findCombatant(attacker, search) {
        if (!search.length) {
          return null;
        }
    
        let possibleTargets = [...attacker.room.npcs];
        possibleTargets = [...possibleTargets, ...attacker.room.players];
        
        const target = Parser.parseDot(search, possibleTargets);
    
        if (!target) {
          return null;
        }

        if (target.room.getMeta('no-combat') == true) {
          throw new CombatErrors.CombatNotInThisRoomError("You can't do it here");
        }
    
        if (target === attacker) {
          throw new CombatErrors.CombatSelfError("You can't attack yourself!");
        }

        if (!target.hasBehavior('combat')) {
          throw new CombatErrors.CombatPacifistError(`${target.name} is a pacifist and will not fight you.`, target);
        }
    
        if (!target.hasAttribute('health')) {
          throw new CombatErrors.CombatInvalidTargetError("You can't attack that target");
        }
    
        return target;
      }

}

module.exports = Combat;