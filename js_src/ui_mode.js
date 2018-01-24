// the modes in which a player can interact with the game (the nodes in a state model of the player-game relationship)

import ROT from 'rot-js';
import {Message} from './message.js';
import {UIMode} from './ui_mode_base.js';
import {UILayer_Text,UILayer_TargetLook} from './ui_layer.js';
import {makeMap} from './map.js';
import {Color} from './colors.js';
import {DisplaySymbol} from './display_symbol.js';
import {DATASTORE,initializeDatastore} from './datastore.js';
import {EntityFactory} from './entities.js';
import {COMMAND,getCommandFromInput,setKeyBinding} from './commands.js';
import {SCHEDULER,TIME_ENGINE,initTiming} from './timing.js';

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
  bindCommands() {
    setKeyBinding('persistence');
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
    // console.log("command is "+getCommandFromInput(inputType,inputData));
    let gameCommand = getCommandFromInput(inputType,inputData);
    if (gameCommand == COMMAND.NULLCOMMAND) { return false; }
    
    if (gameCommand == COMMAND.NEW_GAME) {
      this.game.startNewGame();
      Message.send("New game started");
      this.game.switchMode('play');
    } else 
    if (gameCommand == COMMAND.SAVE_GAME) {
      if (this.game.isPlaying) {
        this.handleSaveGame();
      }
    } else
    if (gameCommand == COMMAND.LOAD_GAME) {
      if (this.game.hasSaved) {
        this.handleRestoreGame();
      }
    } else
    if (gameCommand == COMMAND.CANCEL) {
      if (this.game.isPlaying) {
        this.game.switchMode('play');
      }
    }
    return false;
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
    TIME_ENGINE.unlock();
  }
  exit() {
    super.exit();
    TIME_ENGINE.lock();
  }
  bindCommands() {
    setKeyBinding(['play','movement_numpad']);
  }
  
  startNewGame() {
    initializeDatastore();
    initTiming();
    DATASTORE.GAME = this.game;
    console.dir(DATASTORE);
    
    let av = EntityFactory.create('avatar');
    this.cachedAvatar = av; // to have the avatar still available after it's been destroyed (e.g. when reduced to <= 0 hp)
    let m = makeMap({xdim:30,ydim:16});
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

    let e = EntityFactory.create('dangerous worm');
    e.setpos(m.getRandomUnblockedLocation());
    m.addEntity(e);
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
  
  getMap() {
    return DATASTORE.MAPS[this.attr.curMapId];
  }
  
  render() {
    this.getMap().renderOn(this.display,
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
    let gameCommand = getCommandFromInput(inputType,inputData);
    if (gameCommand == COMMAND.NULLCOMMAND) { return false; }

    if (gameCommand == COMMAND.GAME_CONTROLS) {
      this.game.switchMode('persistence');
      return false;      
    }
    
    if (gameCommand == COMMAND.MESSAGES) {
      // this.game.switchMode('messages');
      let messageLayer = new UILayer_Text(this.game,this,Message.archivesAsText());
      this.game.addUILayer(messageLayer);
      return false;      
    }
    if (gameCommand == COMMAND.LOOK_AROUND) {
      // this.game.switchMode('messages');
      let lookLayer = new UILayer_TargetLook(this.game,this,this.getMap(),
        this.attr.cameraMapLoc.x,this.attr.cameraMapLoc.y);
      this.game.addUILayer(lookLayer);
      return false;      
    }

    let avatarMoved = false;
    if (gameCommand == COMMAND.MOVE_UL) {
      avatarMoved = DATASTORE.ENTITIES[this.attr.avatarId].tryWalk(-1,-1);
    } else
    if (gameCommand == COMMAND.MOVE_U) {
      avatarMoved = DATASTORE.ENTITIES[this.attr.avatarId].tryWalk(0,-1);
    } else
    if (gameCommand == COMMAND.MOVE_UR) {
      avatarMoved = DATASTORE.ENTITIES[this.attr.avatarId].tryWalk(1,-1);
    } else
    if (gameCommand == COMMAND.MOVE_L) {
      avatarMoved = DATASTORE.ENTITIES[this.attr.avatarId].tryWalk(-1,0);
    } else
    if (gameCommand == COMMAND.MOVE_WAIT) {
      DATASTORE.ENTITIES[this.attr.avatarId].raiseMixinEvent('actionDone');
    } else
    if (gameCommand == COMMAND.MOVE_R) {
      avatarMoved = DATASTORE.ENTITIES[this.attr.avatarId].tryWalk(1,0);
    } else
    if (gameCommand == COMMAND.MOVE_DL) {
      avatarMoved = DATASTORE.ENTITIES[this.attr.avatarId].tryWalk(-1,1);
    } else
    if (gameCommand == COMMAND.MOVE_D) {
      avatarMoved = DATASTORE.ENTITIES[this.attr.avatarId].tryWalk(0,1);
    } else
    if (gameCommand == COMMAND.MOVE_DR) {
      avatarMoved = DATASTORE.ENTITIES[this.attr.avatarId].tryWalk(1,1);
    }
    
    if (avatarMoved) {
      this.syncCameraToAvatar();
    }
    
    this.checkGameWinLose();
    return true;
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
