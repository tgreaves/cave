'use strict';

const { Broadcast: B, CommandType, Logger, PlayerRoles } = require('ranvier');
const { NoPartyError, NoRecipientError, NoMessageError } = require('ranvier').Channel;
const { CommandParser, InvalidCommandError, RestrictedCommandError } = require('../lib/CommandParser');

/**
 * Main command loop. All player input after login goes through here.
 * If you want to swap out the command parser this is the place to do it
 */
module.exports = {
  event: state => player => {
    player.socket.once('data', data => {
      function loop () {
        player.socket.emit('commands', player);
      }
      data = data.toString().trim();

      if (!data.length) {
        return loop();
      }

      if ( player.hasEffectType('force-input')) {
        const effect = player.effects.getByType('force-input');
        player.removeEffect(effect);
        return loop();
      }

      player._lastCommandTime = Date.now();

      try {
        // allow for modal commands, _commandState is set below when command.execute() returns a value
        if (player._commandState) {
          const { state: commandState, command } = player._commandState;
          // note this calls command.func(), not command.execute()
          const newState = command.func(data, player, command.name, commandState);
          if (newState) {
            player._commandState.state = newState;
          } else {
            player._commandState = null;
            B.prompt(player);
          }

          loop();
          return;
        }

        const result = CommandParser.parse(state, data, player);
        if (!result) {
          throw null;
        }
        switch (result.type) {
          case CommandType.MOVEMENT: {
            player.emit('move', result);
            break;
          }

          case CommandType.COMMAND: {
            const { requiredRole = PlayerRoles.PLAYER } = result.command;
            if (requiredRole > player.role) {
              throw new RestrictedCommandError();
            }
            // commands have no lag and are not queued, just immediately execute them
            const state = result.command.execute(result.args, player, result.originalCommand);
            if (state) {
              player._commandState = {
                command: result.command,
                state,
              };

              // bypasses prompt
              loop();
              return;
            }

            player._commandState = null;
            break;
          }

          case CommandType.CHANNEL: {
            const { channel } = result;
            if (channel.minRequiredRole !== null && channel.minRequiredRole > player.role) {
              throw new RestrictedCommandError();
            }
            // same with channels
            try {
              channel.send(state, player, result.args);
            } catch (error) {
              switch (true) {
                case error instanceof NoPartyError:
                  B.sayAt(player, "You aren't in a group.");
                  break;
                case error instanceof NoRecipientError:
                  B.sayAt(player, "Send the message to whom?");
                  break;
                case error instanceof NoMessageError:
                  B.sayAt(player, `\r\nChannel: ${channel.name}`);
                  B.sayAt(player, 'Syntax: ' + channel.getUsage());
                  if (channel.description) {
                    B.sayAt(player, channel.description);
                  }
                  break;
              }
            }
            break;
          }

          case CommandType.SKILL: {
            // See bundles/ranvier-player-events/player-events.js commandQueued and updateTick for when these
            // actually get executed
            player.queueCommand({
              execute: _ => {
                player.emit('useAbility', result.skill, result.args);
              },
              label: data,
            }, result.skill.lag || state.Config.get('skillLag') || 1000);
            break;
          }
        }
      } catch (error) {
        switch(true) {
          case error instanceof InvalidCommandError:
            // check to see if room has a matching context-specific command
            const roomCommands = player.room.getMeta('commands');
            const [commandName, ...args] = data.split(' ');
            if (roomCommands && roomCommands.includes(commandName)) {
              player.room.emit('command', player, commandName, args.join(' '));
            } else {
              B.sayAt(player, "Huh?");
              Logger.warn(`WARNING: Player tried non-existent command '${data}'`);
            }
            break;
          case error instanceof RestrictedCommandError:
            B.sayAt(player, "You can't do that.");
            break;
          default:
            Logger.error(error);
        }
      }

      if (player.getAttribute('stamina') < 5) {
        B.sayAt(player, "<red>You are almost dead</red>");
      }

      B.prompt(player);
      loop();
    });
  }
};
