'use strict';

const fs = require('fs');

const { EventUtil } = require('ranvier');

/**
 * MOTD event
 */
module.exports = {
  event: state => socket => {
    const motd = fs.readFileSync(__dirname + '/../resources/motd').toString('utf8');
    if (motd) {
      EventUtil.genSay(socket)(motd);
    }

    return socket.emit('login', socket);
  }
};
