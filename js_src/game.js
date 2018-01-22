// the core of the game - does reatively little on its own but organizes/manages and kicks off everything else

import ROT from 'rot-js';
import * as U from './util.js';
import {Message} from './message.js';
import {UIModeLaunch, UIModePersistence, UIModePlay, UIModeMessages, UIModeWin, UIModeLose} from './ui_mode.js';
import {DATASTORE, initializeDatastore} from './datastore.js';

console.log('ROT is:');
console.dir(ROT);

export let Game = {

  // messageHandler: Message,
  
  _mode: {
    launch: '',
    persistence: '',
    play: '',
    // messages: '',
    win: '',
    lose: ''
  },
  _curModeStack: [],

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
    console.log("DATASTORE:");
    console.dir(DATASTORE);  

    this._setupDisplays();
    this._setupUIModes();

    Message.init(this._display.message);
    
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
    // this._mode.messages = new UIModeMessages(this);
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
    if (this._curModeStack.length == 0) {
      return;
    } else {
      this._curModeStack[0].renderAvatarOn(d);
    }
  },

  renderDisplayMain: function() {
    this._display.main.o.clear();
    if (this._curModeStack.length == 0) {
      return;
    } else {
      this._curModeStack[0].render();
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
    if (this._curModeStack.length > 0) {
      if (this._curModeStack[0].handleInput(eventType, evt)) {
        this.render();
        Message.ageMessages();
      }
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

    if (this._curModeStack.length > 0) {
      this.removeAllUILayers();
      this._curModeStack[0].exit();
    }
    this._curModeStack[0] = newMode;
    this._curModeStack[0].enter();
    this.render();
  },
  
  addUILayer: function(layer) {
    this._curModeStack.unshift(layer);
    this._curModeStack[0].enter();
    this.render();
  },
  removeUILayer: function() {
    if (this._curModeStack.length > 0 && this._curModeStack[0].isLayer()) {
      this._curModeStack[0].exit();
      this._curModeStack.shift();
    }
    this.render();
  },
  removeAllUILayers: function() {
    while (this._curModeStack.length > 0 && this._curModeStack[0].isLayer()) {
      this.removeUILayer();
    }
  },
  
  toJSON: function() {
    return this._mode.play.toJSON();
  },
  
  fromJSON: function(json) {
    this._mode.play.fromJSON(json);
  }
  
};