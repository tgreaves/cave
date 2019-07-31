'use strict';

const { Broadcast, Logger } = require('ranvier');

/**
 * Login is done, allow the player to actually execute commands
 */
module.exports = {
  event: state => (socket, args) => {
    const player = args.player;
    player.hydrate(state);

    if (state.PlayerManager.players.size == 1) {
      Broadcast.sayAt(player, 'You are the only caver here.');
      Broadcast.sayAt(player, '');
    }

    player.inventory.setMax(2);   // Default
    player.prompt = "*";

    let health_base = 50 + player.getAttribute('score')/5;

    if (health_base > 250 && player.level != 4) {
      Broadcast.sayAt(player, "You have been given the rank of WIZARD");
      player.level = 4;
    }

    if (player.level == 4) {
      health_base=health_base+250;
      player.inventory.setMax(5);
      player.prompt = "____*";
    }

    if (player.getAttribute('score') >= 500 && (player.level != 4)) {
      Broadcast.sayAt(player, 'Master Caver');
      player.level = 3;
      health_base=health_base+50;
      player.inventory.setMax(4);
    }

    if (player.getAttribute('score') >= 150 && player.getAttribute('score') < 500) {
      Broadcast.sayAt(player, 'Warrior');
      player.level = 2;
      health_base=health_base+25;
      player.inventory.setMax(3);
    }

    // Original BBC formula: D=H/2+RND(H/2)
    player.setAttributeBase('stamina', health_base/2 + ( Math.floor(Math.random() * (health_base/2 - 1) + 1)));
    player.setAttributeBase('staminaLimit', health_base);

    Broadcast.sayAt(player, 'Your stamina is ' + player.getAttribute('stamina'));

    state.CommandManager.get('look').execute(null, player);
    Broadcast.prompt(player);
    player.socket.emit('commands', player);
    player.emit('login');
  }
};

