'use strict';

const { Random } = require('rando-js');
const { Damage, Logger, RoomManager } = require('ranvier');
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
    
        if (!target.hasAttribute('stamina')) {
          throw new CombatErrors.CombatInvalidTargetError("You can't attack that target");
        }
    
        return target;
      }

     /**
     * Any cleanup that has to be done if the character is killed
     * @param {Character} deadEntity
     * @param {?Character} killer Optionally the character that killed the dead entity
     */
      static handleDeath(state, deadEntity, killer) {
        if (deadEntity.combatData.killed) {
          return;
        }

        deadEntity.combatData.killed = true;
        deadEntity.removeFromCombat();

        Logger.log(`${killer ? killer.name : 'Something'} killed ${deadEntity.name}.`);

        if (killer) {
          deadEntity.combatData.killedBy = killer;
          killer.emit('deathblow', deadEntity);
        }
        deadEntity.emit('killed', killer);

      }

}

module.exports = Combat;