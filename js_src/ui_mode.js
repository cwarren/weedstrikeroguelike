import ROT from 'rot-js';
import {makeMap} from './map.js';
import {Color} from './colors.js';
import {DisplaySymbol} from './display_symbol.js';
import {DATASTORE,initializeDatastore} from './datastore.js';

//-----------------------------------------------------
//-----------------------------------------------------

class UIMode {
  constructor(gameRef) {
    this.game = gameRef;
    this.display = this.game.getDisplay("main");
  }
  
  enter()       { console.log(`UIMode enter - ${this.constructor.name}`); }
  exit()        { console.log(`UIMode exit - ${this.constructor.name}`); }
  render()      { console.log(`UIMode render - ${this.constructor.name}`); }
  handleInput(inputType,inputData) { 
    console.log(`UIMode handleInput - ${this.constructor.name}`);
    UIMode.dumpInput(inputType,inputData);
  }

  static dumpInput(inputType,inputData) { 
    console.log(`inputType: ${inputType}`);
    console.log('inputData:');
    console.dir(inputData);
  }
}

//-----------------------------------------------------
//-----------------------------------------------------

export class UIModeLaunch extends UIMode {
  enter() {
    super.enter();
    this.game.messageHandler.send("Welcome to WSRL");
    this.keyPressGate = false;
  }
  
  render() {
    this.display.drawText(1,1,"game start",Color.FG,Color.BG);
    this.display.drawText(1,3,"press any key to continue",Color.FG,Color.BG);
  }

  handleInput(inputType,inputData) {
    if (inputType == 'keypress' && inputData.charCode !== 0) { 
                                   // ignore the various modding keys - control, shift, etc.
      this.keyPressGate = true;
    }
    if (inputType == 'keyup' && this.keyPressGate) {
      this.game.switchMode('persistence');
    }
  }
}

//-----------------------------------------------------
//-----------------------------------------------------

export class UIModePersistence extends UIMode {
  enter() {
    super.enter();
    if (window.localStorage.getItem(this.game._PERSISTANCE_NAMESPACE)) {
      this.game.hasSaved = true;
    }
  }
  
  render() {
    this.display.drawText(1,1,"Game Control",Color.FG,Color.BG);
    this.display.drawText(5,3,"N - start a new game",Color.FG,Color.BG);
    if (this.game.isPlaying) {
      this.display.drawText(5,4,"S - save the current game",Color.FG,Color.BG);
      this.display.drawText(1,8,"[Escape] - cancel/return to play",Color.FG,Color.BG);
    }
    if (this.game.hasSaved) {
      this.display.drawText(5,5,"L - load the saved game",Color.FG,Color.BG);
    }
  }

  handleInput(inputType,inputData) {
    // super.handleInput(inputType,inputData);
    if (inputType == 'keyup') {
      if (inputData.key == 'n' || inputData.key == 'N') {
        this.game.startNewGame();
        this.game.messageHandler.send("New game started");
        this.game.switchMode('play');
      }
      else if (inputData.key == 's' || inputData.key == 'S') {
        if (this.game.isPlaying) {
          this.handleSaveGame();
        }
      }
      else if (inputData.key == 'l' || inputData.key == 'L') {
        if (this.game.hasSaved) {
          this.handleRestoreGame();
        }
      }
      else if (inputData.key == 'Escape') {
        if (this.game.isPlaying) {
          this.game.switchMode('play');
        }
      }
    }
  }
  
  handleSaveGame() {
    if (! this.localStorageAvailable()) {
      return;
    }
    // let serializedGameState = this.game.serialize();
    window.localStorage.setItem(this.game._PERSISTANCE_NAMESPACE,JSON.stringify(DATASTORE));
    this.game.hasSaved = true;
    this.game.messageHandler.send("Game saved");
    this.game.switchMode('play');
  }
  
  handleRestoreGame() {
    if (! this.localStorageAvailable()) {
      return;
    }
    let serializedGameState = window.localStorage.getItem(this.game._PERSISTANCE_NAMESPACE);
    let savedState = JSON.parse(serializedGameState);
    
    console.log("savedState");
    console.dir(savedState);
    
    initializeDatastore();
    
    DATASTORE.GAME = this.game;
    this.game.fromJSON(savedState.GAME);

    for (let savedMapId in savedState.MAPS) {
      makeMap(JSON.parse(savedState.MAPS[savedMapId]));
    }

    console.log("datastore:");
    console.dir(DATASTORE);

    this.game.messageHandler.send("Game loaded");
    this.game.switchMode('play');
  }
  
  localStorageAvailable() { 
    // NOTE: see https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
    try {
      var x = '__storage_test__';
      window.localStorage.setItem( x, x);
      window.localStorage.removeItem(x);
      return true;
    }
    catch(e) {
      this.game.messageHandler.send('Sorry, no local data storage is available for this browser so game save/load is not possible');
      return false;
    }
  }
}

//-----------------------------------------------------
//-----------------------------------------------------

export class UIModePlay extends UIMode {
  enter() {
    super.enter();
    // this.game.messageHandler.clear();
    this.game.isPlaying = true;
    this.avatarSymbol = new DisplaySymbol('@','#ee1');
  }
  
  startNewGame() {
    this._STATE = {};
    let m = makeMap({xdim:60,ydim:20});
    this._STATE.curMapId = m.getId();
    this._STATE.cameraMapLoc = {
      x: Math.round(m.getXDim()/2),
      y: Math.round(m.getYDim()/2)
    };
    this._STATE.cameraDisplayLoc = {
      x: Math.round(this.display.getOptions().width/2),
      y: Math.round(this.display.getOptions().height/2)
    };
  }
  
  render() {
    DATASTORE.MAPS[this._STATE.curMapId].renderOn(this.display,
      this._STATE.cameraMapLoc.x,this._STATE.cameraMapLoc.y);
    this.avatarSymbol.drawOn(this.display,this._STATE.cameraDisplayLoc.x,this._STATE.cameraDisplayLoc.y);
  }

  handleInput(inputType,inputData) {
    // super.handleInput(inputType,inputData);
    if (inputType == 'keyup') {
      this.game.messageHandler.send(`you pressed the ${inputData.key} key`);
      if (inputData.key == 'w') {
        this.game.switchMode('win');
      }
      else if (inputData.key == 'l') {
        this.game.switchMode('lose');
      }
      else if (inputData.key == '=') {
        this.game.switchMode('persistence');
      }
      
      // navigation (keeping in mind that top left is 0,0, so positive y moves you down)
      else if (inputData.key == '1') {
        this.moveBy(-1,1);
      }
      else if (inputData.key == '2') {
        this.moveBy(0,1);
      }
      else if (inputData.key == '3') {
        this.moveBy(1,1);
      }
      else if (inputData.key == '4') {
        this.moveBy(-1,0);
      }
      else if (inputData.key == '5') {
        // this.moveBy(0,0);
      }
      else if (inputData.key == '6') {
        this.moveBy(1,0);
      }
      else if (inputData.key == '7') {
        this.moveBy(-1,-1);
      }
      else if (inputData.key == '8') {
        this.moveBy(0,-1);
      }
      else if (inputData.key == '9') {
        this.moveBy(1,-1);
      }
      
    }
  }

  // (keeping in mind that top left is 0,0, so positive y moves you down)
  moveBy(x,y) {
    let newX = this._STATE.cameraMapLoc.x + x;
    let newY = this._STATE.cameraMapLoc.y + y;
    if (newX < 0 || newX > DATASTORE.MAPS[this._STATE.curMapId].getXDim() - 1) { return; }
    if (newY < 0 || newY > DATASTORE.MAPS[this._STATE.curMapId].getYDim() - 1) { return; }
    this._STATE.cameraMapLoc.x = newX;
    this._STATE.cameraMapLoc.y = newY;
    this.render();
  }
}

//-----------------------------------------------------
//-----------------------------------------------------

export class UIModeWin extends UIMode {
  render() {
    this.display.drawText(1,1,"game win",Color.FG,Color.BG);
    this.display.drawText(1,3,"you WIN!!!",Color.FG,Color.BG);
  }
}

//-----------------------------------------------------
//-----------------------------------------------------

export class UIModeLose extends UIMode {
  render() {
    this.display.drawText(1,1,"game lose",Color.FG,Color.BG);
    this.display.drawText(1,3,"you lose :(",Color.FG,Color.BG);
  }
}
