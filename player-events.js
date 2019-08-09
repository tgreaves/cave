'use strict';

const sprintf = require('sprintf-js').sprintf;
const { Random }= require('rando-js');
const LevelUtil = require('../cave/lib/LevelUtil');
const { Broadcast: B, Config, Logger } = require('ranvier');
const Combat = require('./lib/Combat');
const ArgParser = require('./lib/ArgParser');

module.exports = {
  listeners: {
    /**
     * Handle a player movement command. From: 'commands' input event.
     * movementCommand is a result of CommandParser.parse
     */
    move: state => function (movementCommand) {
      const { roomExit } = movementCommand;

      if (!roomExit) {
        return B.sayAt(this, "You can't go that way!");
      }

      if (this.isInCombat()) {
        return B.sayAt(this, 'You are in the middle of a fight!');
      }

      const nextRoom = state.RoomManager.getRoom(roomExit.roomId);
      const oldRoom = this.room;

      const door = oldRoom.getDoor(nextRoom) || nextRoom.getDoor(oldRoom);

      if (door) {
        if (door.locked) {
          return B.sayAt(this, "The door is locked.");
        }

        if (door.closed) {
          return B.sayAt(this, "The door is closed.");
        }
      }

      this.moveTo(nextRoom, _ => {
        state.CommandManager.get('look').execute('', this);
      });

      B.sayAt(oldRoom, `${this.name} leaves.`);
      B.sayAtExcept(nextRoom, `${this.name} enters.`, this);

      for (const follower of this.followers) {
        if (follower.room !== oldRoom) {
          continue;
        }

        if (follower.isNpc) {
          follower.moveTo(nextRoom);
        } else {
          B.sayAt(follower, `\r\nYou follow ${this.name} to ${nextRoom.title}.`);
          follower.emit('move', movementCommand);
        }
      }
    },

    save: state => async function (callback) {
      await state.PlayerManager.save(this);
      if (typeof callback === 'function') {
        callback();
      }
    },

    commandQueued: state => function (commandIndex) {
      const command = this.commandQueue.queue[commandIndex];
      const ttr = sprintf('%.1f', this.commandQueue.getTimeTilRun(commandIndex));
      B.sayAt(this, `<bold><yellow>Executing</yellow> '<white>${command.label}</white>' <yellow>in</yellow> <white>${ttr}</white> <yellow>seconds.</yellow>`);
    },

    updateTick: state => function () {
      if (this.commandQueue.hasPending && this.commandQueue.lagRemaining <= 0) {
        B.sayAt(this);
        this.commandQueue.execute();
        B.prompt(this);
      }
      const lastCommandTime = this._lastCommandTime || Infinity;
      const timeSinceLastCommand = Date.now() - lastCommandTime;
      const maxIdleTime = (Math.abs(Config.get('maxIdleTime')) * 60000) || Infinity;

      if (timeSinceLastCommand > maxIdleTime && !this.isInCombat()) {
	this.emit('dropEverything');
        this.save(() => {
          B.sayAt(this, `You were kicked for being idle for more than ${maxIdleTime / 60000} minutes!`);
          B.sayAtExcept(this.room, `${this.name} disappears.`, this);
          Logger.log(`Kicked ${this.name} for being idle.`);
          state.PlayerManager.removePlayer(this, true);
        });
      }
    },

    /**
     * Handle player gaining experience
     * 
     * As per the original game, any levelling up etc only occurs when logging in.
     * Also, no auto-saving just because you got points!
     * @param {number} amount Exp gained
     */
    experience: state => function (amount) {
      B.sayAt(this, `<blue>You are credited with <bold>${amount}</bold> points</blue>`);

      this.setAttributeBase('score', this.getAttribute('score') + amount);
    },

    dropEverything: state => function () {
      if (!this.inventory || !this.inventory.size) {
        return;
      }

      for (const [, item ] of this.inventory) {
        this.removeItem(item);
        this.room.addItem(item);
        this.emit('drop', item);
        item.emit('drop', this);

       for (const npc of this.room.npcs) {
          npc.emit('playerDropItem', this, item);
       }
      }
    },

    hit: state => function (damage, target, finalAmount) {
      if ( damage.metadata.attackDescription != 'poisoned') {
        B.sayAtExcept(this.room, 
          target.name + " is " + damage.metadata.attackDescription + ". Stamina=" + target.getAttribute('stamina'), 
          target);
      }
    },

    damaged: state => function (damage, finalAmount) 
      { 
        if ( damage.metadata.attackDescription != 'poisoned') {
          B.sayAt(this, "You are " + damage.metadata.attackDescription + " by " + damage.attacker.name);
        }

        if (this.getAttribute('stamina') <= 0) {
          Combat.handleDeath(state, this, damage.attacker);
        }
      },

    /**
     * Player was killed
     * @param {Character} killer
     */
    killed: state => {
      const startingRoomRef = Config.get('startingRoom');
      if (!startingRoomRef) {
        Logger.error('No startingRoom defined in ranvier.json');
      }

      return function (killer) {
       this.removePrompt('combat');

       const othersDeathMessage = killer ?
         `<b><red>${this.name} collapses to the ground, dead at the hands of ${killer.name}.</b></red>` :
         `<b><red>${this.name} collapses to the ground, dead</b></red>`;

       B.sayAtExcept(this.room, othersDeathMessage, (killer ? [killer, this] : this));

       if (this.party) {
         B.sayAt(this.party, `<b><green>${this.name} was killed!</green></b>`);
       }

       this.setAttributeToMax('stamina');

       let home = state.RoomManager.getRoom(this.getMeta('waypoint.home'));
       if (!home) {
         home = state.RoomManager.getRoom(startingRoomRef);
       }

       this.moveTo(home, _ => {
         B.sayAt(this, '<b><red>Life is slipping away...You are going</red></b>');
         if (killer && killer !== this) {
           B.sayAt(this, `You were killed by ${killer.name}.`);
         }

         state.CommandManager.get('look').execute(null, this);

         B.prompt(this);
       });
     };
   },

    /**
     * Player killed a target
     * @param {Character} target
     */
    deathblow: state => function (target, skipParty) {
      if (target && !this.isNpc) {
        B.sayAt(this, `<b><red>You killed ${target.name}!</red></b>`);
      }

      // Calculate XP reward.
      // Killed a player:   10 + RND( Score / 20 )
      // Killed a CCM:      1 + RND ( (Starting health / 30) ) +  (Starting health / 30 )

      let xp = 0;

      if (target.isNpc) {
        let stamina = target.getBaseAttribute('stamina') / 30;
        xp = 1 + Random.inRange( 1, stamina ) + stamina;
      } else {
        xp = 10 + Random.inRange( 1, target.getBaseAttribute('score') / 20);
      }

      xp = Math.round(xp);

      this.emit('experience', xp);
    },

    forced: state => function (forcer, forceCommand, forceCommandParam) {
      let fullCommand = forceCommand;
      if (forceCommandParam) {
        fullCommand = fullCommand + " " + forceCommandParam;
      }

      B.sayAt(this, 'You are being <yellow>FORCEd</yellow> by ' + forcer + ' to: ' + fullCommand );
      
      const targetCommand = state.CommandManager.get(forceCommand);

      if (! targetCommand) {
        B.sayAt(this, 'Huh?');
      } else {
        targetCommand.execute(forceCommandParam, this, forceCommand);
      }

      return B.sayAt(this, 'You regain control.');

    },

    forcing: state => function (player, target, forceCommand, forceCommandParam, forceChoice) {
    
      // STRENGTH check:  IF(H-10)<!(T+12)ORRND(3)=1PROCC(7,?(T+8),E$):PRINT"Failure":C$="":ENDPROC
      //   "If my stamina minus 10 < target stamina, OR 1/3 chance, fail"
      // MAGIC check:     IFRND(20/s)>1-3*(!&A28=A*&100)PRINT"Nothing Happens":ENDPROC
      //  s = 1 by default, or 2 for Master Cavers (level 3)
      //  "If RND(20/s) > 1 - 3*(1 if carrying ruby), fail"

      let forceSuccess = false;
      let forceSource = player.name;
      let failureMessage = '';

      if (player.level == 4) {
        // Wizards are always successful, and target does not need to be in same room.
        forceSuccess = true;
        forceSource = 'Magic!';
      } else {
        if (forceChoice == 's') {
          // Strength.  Target must be in the same room.
          if (target.room != player.room) {
            return B.sayAt(player, 'They aren\'t here.');
          }

          if (    ( player.getAttribute('stamina')-10 < target.getAttribute('stamina')) || 
                  Random.inRange( 1, 3 ) == 1) {
                    forceSuccess = false;
                    failureMessage = 'Failure.';
                  } else {
                    forceSuccess = true;
                  }
        } else {
          // Magic.  Target can be anywhere.
          let s = 1;
          if (player.level==3) {
            s=2;
          }

          const hasRuby = ArgParser.parseDot('ruby', player.inventory);
          let magicPower = 1;

          if (hasRuby) { magicPower = 3; }

          if ( Random.inRange(1, 20/s) > magicPower) {
            forceSuccess = false;
            failureMessage = 'Nothing Happens.'
          } else {
            forceSuccess = true;
          }
        }
      }
  
      if (forceSuccess) {
        target.emit('forced', forceSource, forceCommand, forceCommandParam);
        B.sayAt(this, 'Forced!');
      } else {
        B.sayAt(this, failureMessage);
      }
      

    }

  }
};
