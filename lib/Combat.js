'use strict';

const { Random } = require('rando-js');
const { Damage, Logger, RoomManager } = require('ranvier');
const Parser = require('../../cave/lib/ArgParser');
const CombatErrors = require('./CombatErrors');

class Combat {

  static updateRound(state, attacker) {
    if (attacker.combatData.killed) {
      // entity was removed from the game but update event was still in flight, ignore it
      return false;
    }

    if (!attacker.isInCombat()) {
      if (!attacker.isNpc) {
        attacker.removePrompt('combat');
      }
      return false;
    }

    let lastRoundStarted = attacker.combatData.roundStarted;
    attacker.combatData.roundStarted = Date.now();

    // cancel if the attacker's combat lag hasn't expired yet
    if (attacker.combatData.lag > 0) {
      const elapsed = Date.now() - lastRoundStarted;
      attacker.combatData.lag -= elapsed;
      return false;
    }

    // currently just grabs the first combatant from their list but could easily be modified to
    // implement a threat table and grab the attacker with the highest threat
    let target = null;
    try {
      target = Combat.chooseCombatant(attacker);
    } catch (e) {
      attacker.removeFromCombat();
      attacker.combatData = {};
      throw e;
    }

    // no targets left, remove attacker from combat
    if (!target) {
      attacker.removeFromCombat();
      // reset combat data to remove any lag
      attacker.combatData = {};
      return false;
    }

    if (target.combatData.killed) {
      // entity was removed from the game but update event was still in flight, ignore it
      return false;
    }

    Combat.makeAttack(attacker, target);
    return true;
  }

   /**
   * Actually apply some damage from an attacker to a target
   * @param {Character} attacker
   * @param {Character} target
   */
  static makeAttack(attacker, target) {
    
    // TODO: Vary damage + attack speed etc.
    
    let amount = 5;

    const damage = new Damage('stamina', amount, attacker, attacker, { attackDescription: 'FLOGGED'});
    damage.commit(target);

    // currently lag is really simple, the character's weapon speed = lag
    attacker.combatData.lag = 5 * 1000;
  }

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

      static chooseCombatant(attacker) {
        if (!attacker.combatants.size) {
          return null;
        }
    
        for (const target of attacker.combatants) {
          if (!target.hasAttribute('stamina')) {
            throw new CombatErrors.CombatInvalidTargetError();
          }
          if (target.getAttribute('stamina') > 0) {
            return target;
          }
        }
    
        return null;
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