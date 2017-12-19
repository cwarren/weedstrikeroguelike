import 'babel-polyfill';
import ROT from 'rot-js';
import {Game} from './game.js';

window.onload = function() {
  console.log("starting WSRL - window loaded");
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

  // Game.render();
  
  console.log("Game object:");
  console.dir(Game);
};
