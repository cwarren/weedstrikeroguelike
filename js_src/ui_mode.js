// the modes in which a player can interact with the game (the nodes in a state model of the player-game relationship)

import ROT from 'rot-js';
import {Message} from './message.js';
import {makeMap} from './map.js';
import {Color} from './colors.js';
import {DisplaySymbol} from './display_symbol.js';
import {DATASTORE,initializeDatastore} from './datastore.js';
import {EntityFactory} from './entities.js';

//-----------------------------------------------------
//-----------------------------------------------------

class UIMode {
  constructor(gameRef) {
    this.game = gameRef;
    this.display = this.game.getDisplay("main");
  }
  
  enter()       {
    console.log(`UIMode enter - ${this.constructor.name}`);
  // console.log("datastore:");
  // console.dir(DATASTORE);
 }
  exit()        {
    console.log(`UIMode exit - ${this.constructor.name}`);
  // console.log("datastore:");
  // console.dir(DATASTORE);
 }
  render()      { console.log(`UIMode render - ${this.constructor.name}`); }
  renderAvatarOn(display) { return; }
  handleInput(inputType,inputData) { 
    console.log(`UIMode handleInput - ${this.constructor.name}`);
    UIMode.dumpInput(inputType,inputData);
    // NOTE: returns true if the input caused any game play changes, false otherwise
    return false;
  }

  static dumpInput(inputType,inputData) { 
    console.log(`inputType: ${inputType}`);
    console.log('inputData:');
    console.dir(inputData);
  }
  
  toJSON() {}
  fromJSON() {}
}

//-----------------------------------------------------
//-----------------------------------------------------

export class UIModeLaunch extends UIMode {
  enter() {
    super.enter();
    Message.send("Welcome to WSRL");
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
    return false;
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
        Message.send("New game started");
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
      return false;
    }
  }
  
  handleSaveGame() {
    if (! this.localStorageAvailable()) {
      return;
    }
    // let serializedGameState = this.game.serialize();
    window.localStorage.setItem(this.game._PERSISTANCE_NAMESPACE,JSON.stringify(DATASTORE));
    this.game.hasSaved = true;
    Message.send("Game saved");
    this.game.switchMode('play');
  }
  
  handleRestoreGame() {
    if (! this.localStorageAvailable()) {
      return;
    }
    let serializedGameState = window.localStorage.getItem(this.game._PERSISTANCE_NAMESPACE);
    let savedState = JSON.parse(serializedGameState);
    
    initializeDatastore();
    
    // restore game core
    DATASTORE.GAME = this.game;
    DATASTORE.ID_SEQ = savedState.ID_SEQ;

    // restore maps (note: in the future might not instantiate all maps here, but instead build some kind of instantiate on demand)
    for (let savedMapId in savedState.MAPS) {
      makeMap(JSON.parse(savedState.MAPS[savedMapId]));
    }
    
    // restore entities
    for (let savedEntityId in savedState.ENTITIES) {
      let entState = JSON.parse(savedState.ENTITIES[savedEntityId]);
      EntityFactory.create(entState.templateName,entState);
    }

    // restore play state
    this.game.fromJSON(savedState.GAME);

    Message.send("Game loaded");
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
      Message.send('Sorry, no local data storage is available for this browser so game save/load is not possible');
      return false;
    }
  }
}

//-----------------------------------------------------
//-----------------------------------------------------

export class UIModePlay extends UIMode {
  enter() {
    super.enter();
    this.game.isPlaying = true;
  }
  
  startNewGame() {
    let av = EntityFactory.create('avatar');
    this.cachedAvatar = av; // to have the avatar still available after it's been destroyed (e.g. when reduced to <= 0 hp)
    let m = makeMap({xdim:60,ydim:20});
    av.setpos(m.getUnblockedPerimeterLocation());
    m.addEntity(av);

    this.attr = {};
    this.attr.avatarId = av.getId();
    this.attr.curMapId = m.getId();
    this.attr.cameraMapLoc = {};
    this.syncCameraToAvatar();
    this.attr.cameraDisplayLoc = {
      x: Math.round(this.display.getOptions().width/2),
      y: Math.round(this.display.getOptions().height/2)
    };
    
    // populate the map with some entities (will need a better general approach to this at some point)
    let i=0;
    while (i<10) {
      let t = EntityFactory.getRandomTemplateName();
      if (t != 'avatar') {
        i++;
        let e = EntityFactory.create(t);
        e.setpos(m.getRandomUnblockedLocation());
        m.addEntity(e);
      }
    }
  }
  
  getAvatar() {
    if (! this.attr || ! this.attr.avatarId) { return false; }
    return DATASTORE.ENTITIES[this.attr.avatarId];
  }

  renderAvatarOn(display) {
    let av = this.cachedAvatar;
    if (! av) { return; }
    let y = 0;
    y += display.drawText(1,y,Color.DEFAULT+"LIFE: "+av.getCurHp()+"/"+av.getMaxHp());
    y++;
    y += display.drawText(1,y,Color.DEFAULT+"TIME: "+av.getTimeTaken());
    y += display.drawText(1,y,Color.DEFAULT+"KILLS: "+av.getNumKills());
  }
  
  render() {
    DATASTORE.MAPS[this.attr.curMapId].renderOn(this.display,
      this.attr.cameraMapLoc.x,this.attr.cameraMapLoc.y);
  }

  checkGameWinLose() {
    let av = this.cachedAvatar;
    if (! av) { return; }
    if (av.isDestroyed) {
      Message.send("You lose :(");
      this.game.switchMode('lose');
    }
    else if (av.getNumKills() > 5) {
      Message.send("You WIN!!!");
      this.game.switchMode('win');
    }
  }

  handleInput(inputType,inputData) {
    // super.handleInput(inputType,inputData);
    if (inputType == 'keyup') {
      let avatarMoved = false;

      if (inputData.key == '=') {
        this.game.switchMode('persistence');
        return false;
      }
      else if (inputData.key == 'M') {
        this.game.switchMode('messages');
        return false;
      }
      
      // navigation (keeping in mind that top left is 0,0, so positive y moves you down)
      else if (inputData.key == '1') {
        avatarMoved = DATASTORE.ENTITIES[this.attr.avatarId].tryWalk(-1,1);
      }
      else if (inputData.key == '2') {
        avatarMoved = DATASTORE.ENTITIES[this.attr.avatarId].tryWalk(0,1);
      }
      else if (inputData.key == '3') {
        avatarMoved = DATASTORE.ENTITIES[this.attr.avatarId].tryWalk(1,1);
      }
      else if (inputData.key == '4') {
        avatarMoved = DATASTORE.ENTITIES[this.attr.avatarId].tryWalk(-1,0);
      }
      else if (inputData.key == '5') {
        DATASTORE.ENTITIES[this.attr.avatarId].raiseMixinEvent('turnTaken',{'turnAction':'wait'});
      }
      else if (inputData.key == '6') {
        avatarMoved = DATASTORE.ENTITIES[this.attr.avatarId].tryWalk(1,0);
      }
      else if (inputData.key == '7') {
        avatarMoved = DATASTORE.ENTITIES[this.attr.avatarId].tryWalk(-1,-1);
      }
      else if (inputData.key == '8') {
        avatarMoved = DATASTORE.ENTITIES[this.attr.avatarId].tryWalk(0,-1);
      }
      else if (inputData.key == '9') {
        avatarMoved = DATASTORE.ENTITIES[this.attr.avatarId].tryWalk(1,-1);
      }
     
      if (avatarMoved) {
        this.syncCameraToAvatar();
      }
      
      this.checkGameWinLose();

      return true;
    }
    return false;
  }
  
  syncCameraToAvatar() {
    let av = this.getAvatar();
    if (! av || av.isDestroyed) { return; }
    this.attr.cameraMapLoc.x = av.getx();
    this.attr.cameraMapLoc.y = av.gety();
  }
  
  toJSON() {
    return JSON.stringify(this.attr);
  }
  
  fromJSON(json) {
    this.attr = JSON.parse(json);
    this.cachedAvatar = this.getAvatar();
  }
}

//-----------------------------------------------------
//-----------------------------------------------------

export class UIModeMessages extends UIMode {
  render() {
    Message.renderOn(this.display);
  }

  handleInput(inputType,inputData) {
    if (inputType == 'keyup') {
      if (inputData.key == 'Escape') {
        if (this.game.isPlaying) {
          this.game.switchMode('play');
        }
      }
      return false;
    }
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
