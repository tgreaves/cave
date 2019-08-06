'use strict';

const { Logger } = require('ranvier');

module.exports = {
  listeners: {
    spawn: state => function () {
      this.setMeta('spawnRoom', this.room.id);
    },
  }
};
