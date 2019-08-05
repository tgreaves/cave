'use strict';

const { Random } = require('rando-js');
const { Broadcast, Logger } = require('ranvier');

/**
 * An example behavior that causes an NPC to wander around an area when not in combat
 * Options:
 *   areaRestricted: boolean, true to restrict the NPC's wandering to his home area. Default: false
 *   restrictTo: Array<EntityReference>, list of room entity references to restrict the NPC to. For
 *     example if you want them to wander along a set path
 *   interval: number, delay in seconds between room movements. Default: 20
 */
module.exports = {
  listeners: {
    updateTick: state => function (config) {
      if (this.isInCombat() || !this.room || this.room.getMeta('no-wander') == true) {
        return;
      }

      if (config === true) {
        config = {};
      }

      config = Object.assign({
        areaRestricted: false,
        restrictTo: null,
        interval: 20,
      }, config);

      if (!this._lastWanderTime) {
        this._lastWanderTime = Date.now();
      }

      if (Date.now() - this._lastWanderTime < config.interval * 1000) {
        return;
      }

      this._lastWanderTime = Date.now();

      const exits = this.room.getExits();
      if (!exits.length) {
        return;
      }

      const roomExit = Random.fromArray(exits);
      const randomRoom = state.RoomManager.getRoom(roomExit.roomId);

      const door = this.room.getDoor(randomRoom) || randomRoom.getDoor(this.room);
      if (randomRoom && door && (door.locked || door.closed)) {
        // maybe a possible feature where it could be configured that they can open doors
        // or even if they have the key they can unlock the doors
        Logger.verbose(`NPC [${this.name}] wander blocked by door.`);
        return;
      }

      if (
        !randomRoom ||
        (config.restrictTo && !config.restrictTo.includes(randomRoom.entityReference)) ||
        (config.areaRestricted && randomRoom.area !== this.area)
      ) {
        return;
      }

      Logger.verbose(`NPC [${this.name}] wandering from ${this.room.entityReference} to ${randomRoom.entityReference}.`);
      Broadcast.sayAt(this.room, `${this.name} wanders ${roomExit.direction}.`);
      this.moveTo(randomRoom);
      Broadcast.sayAt(randomRoom, `${this.name} has just wandered in.`);
    }
  }
};
