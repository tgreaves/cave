'use strict';

const { Broadcast: B } = require('ranvier');

module.exports = {
  aliases: [ 'status' ],
  command : (state) => (args, p) => {
    const say = message => B.sayAt(p, message);

    // 1560IFC$="SCORE"ORC$="STATUS"PRINT"Score is ";E'"Stamina is ";INTD'"Stamina limit is ";INTH':ENDPROC
    B.sayAt(p, `Score is ${p.getAttribute('score')}`)
    B.sayAt(p, `Stamina is ${p.getAttribute('stamina')}`)
    B.sayAt(p, `Stamina limit is ${p.getBaseAttribute('stamina')}`)
  }
};
