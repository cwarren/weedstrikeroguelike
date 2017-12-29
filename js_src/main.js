// general organization of the project and supporting tools/libraries (as opposed to the actual game)

import 'babel-polyfill';
import ROT from 'rot-js';
import {Game} from './game.js';

window.onload = function() {
  // Check if rot.js can work on this browser
  if (!ROT.isSupported()) {
    alert("The rot.js library isn't supported by your browser.");
    return;
  }
  
  Game.init();

  // Add the containers to our HTML page
  document.getElementById('ws-avatar-display').appendChild(Game.getDisplay('avatar').getContainer());
  document.getElementById('ws-main-display').appendChild(Game.getDisplay('main').getContainer());
  document.getElementById('ws-message-display').appendChild(Game.getDisplay('message').getContainer());

  Game.bindEvent('keypress');
  Game.bindEvent('keydown');
  Game.bindEvent('keyup');
};
