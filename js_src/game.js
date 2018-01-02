// the core of the game - does reatively little on its own but organizes/manages and kicks off everything else

import ROT from 'rot-js';
import * as U from './util.js';
import {Message} from './message.js';
import {UIModeLaunch, UIModePersistence, UIModePlay, UIModeWin, UIModeLose} from './ui_mode.js';
import {DATASTORE, initializeDatastore} from './datastore.js';

console.log('ROT is:');
console.dir(ROT);

export let Game = {

  // messageHandler: Message,
  
  _mode: {
    launch: '',
    persistence: '',
    play: '',
    win: '',
    lose: ''
  },
  _curMode: '',

  _DISPLAY_SPACING: 1.1,
  _display: {
    main: {
      w: 80,
      h: 24,
      o: null
    },
    avatar: {
      w: 20,
      h: 24,
      o: null
    },
    message: {
      w: 100,
      h: 6,
      o: null
    }
  },

  // _STATE: {},
  _PERSISTANCE_NAMESPACE: 'weedstrikegame',

  isPlaying: false,
  hasSaved: false,
  
  init: function() {
    console.log("Game object:");
    console.dir(Game);  

    this._setupDisplays();
    this._setupUIModes();

    Message.init(this.getDisplay('message'));
    
    this.switchMode('launch');
  },
  _setupDisplays: function() {
    for (var display_key in this._display) {
      this._display[display_key].o = new ROT.Display({
        width: this._display[display_key].w,
        height: this._display[display_key].h,
        spacing: this._DISPLAY_SPACING});
    }
  },
  _setupUIModes: function() {
    this._mode.launch = new UIModeLaunch(this);
    this._mode.persistence = new UIModePersistence(this);
    this._mode.play = new UIModePlay(this);
    this._mode.win = new UIModeWin(this);
    this._mode.lose = new UIModeLose(this);
  },

  // handy dev function to access the DATASTORE on the browser console
  DEV_dslog: function() {
    console.log("datastore:");
    console.dir(DATASTORE);
  },

  startNewGame: function() {
    console.log("starting new game");
    initializeDatastore();
    DATASTORE.GAME = this;
    this._mode.play.startNewGame();
  },

  getDisplay: function (displayId) {
    if (this._display.hasOwnProperty(displayId)) {
      return this._display[displayId].o;
    }
    return null;
  },

  render: function() {
    this.renderDisplayAvatar();
    this.renderDisplayMain();
    this.renderDisplayMessage();
  },

  renderDisplayAvatar: function() {
    let d = this._display.avatar.o;
    d.clear();
    if (this._curMode === null || this._curMode == '') {
      return;
    } else {
      this._curMode.renderAvatarOn(d);
    }

    // 
    // d.drawText(1,1,"Avatar");
    // let a = this._mode.play.getAvatar();
    // if (! a) {
    //   return;
    // }
    // d.drawText(3,2,`loc: ${a.getxcy()}`);
    // d.drawText(3,3,`trn: ${a.getTime()}`);
  },

  renderDisplayMain: function() {
    this._display.main.o.clear();
    if (this._curMode === null || this._curMode == '') {
      return;
    } else {
      this._curMode.render();
    }
  },
  
  renderDisplayMessage: function() {
    Message.render();
  },
  
  bindEvent: function(eventType) {
    window.addEventListener(eventType, (evt) => {
      this.eventHandler(eventType, evt);
    });
  },
  
  eventHandler: function (eventType, evt) {
    // When an event is received have the current ui handle it
    if (this._curMode !== null && this._curMode != '') {
        this._curMode.handleInput(eventType, evt);
        this.render();
    }
  },

  switchMode: function (newMode) {
    if (typeof newMode == 'string' || newMode instanceof String) {
      if (this._mode.hasOwnProperty(newMode)) {
        newMode = this._mode[newMode];
      } else {
        return;
      }
    }

    if (this._curMode !== null && this._curMode != '') {
      this._curMode.exit();
    }
    this._curMode = newMode;
    if (this._curMode !== null && this._curMode != '') {
      this._curMode.enter();
    }
    this.render();
  },
  
  toJSON: function() {
    return this._mode.play.toJSON();
  },
  
  fromJSON: function(json) {
    this._mode.play.fromJSON(json);
  }
  
};