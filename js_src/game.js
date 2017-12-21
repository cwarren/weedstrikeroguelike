import ROT from 'rot-js';
import * as U from './util.js';
import {Message} from './message.js';
import {UIColor, UIModeStart, UIModePersistence, UIModePlay, UIModeWin, UIModeLose} from './ui_mode.js';

console.log('ROT is:');
console.dir(ROT);

export let Game = {

  messageHandler: Message,
  
  _mode: {
    start: '',
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

  _STATE: {},
  
  init: function() {
    console.log("Game object:");
    console.dir(Game);  

    this._setupDisplays();    
    this.messageHandler.init(this.getDisplay('message'));
    this._setupUIModes();
    
    this.switchMode('start');
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
    this._mode.start = new UIModeStart(this);
    this._mode.persistence = new UIModePersistence(this);
    this._mode.play = new UIModePlay(this);
    this._mode.win = new UIModeWin(this);
    this._mode.lose = new UIModeLose(this);
  },

  startNewGame: function() {
    this._STATE.randomSeed = 5 + Math.floor(Math.random()*100000);
    //this._STATE._randomSeed = 76250;
    console.log("using random seed "+this._STATE._randomSeed);
    ROT.RNG.setSeed(this._STATE._randomSeed);
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
    for (let i = 0; i < 10; i++) {
      d.drawText(5,i+5,"avatar");
    }
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
    this.messageHandler.render();
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
  }
};