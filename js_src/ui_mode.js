import ROT from 'rot-js';

export let UIColor = {};
UIColor.FG = '#fff';
UIColor.BG = '#000';
UIColor.DEFAULT = '%c{'+UIColor.FG+'}%b{'+UIColor.BG+'}';

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

export class UIModeStart extends UIMode {
  enter() {
    super.enter();
    this.game.messageHandler.send("Welcome to WSRL");
  }
  
  render() {
    this.display.drawText(1,1,"game start",UIColor.FG,UIColor.BG);
    this.display.drawText(1,3,"press any key to play",UIColor.FG,UIColor.BG);
  }

  handleInput(inputType,inputData) {
    if (inputData.charCode !== 0) { // ignore the various modding keys - control, shift, etc.
      this.game.switchMode('persistence');
    }
  }
}

//-----------------------------------------------------
//-----------------------------------------------------

export class UIModePersistence extends UIMode {
  enter() {
    super.enter();
  }
  
  render() {
    this.display.drawText(1,1,"Game Control",UIColor.FG,UIColor.BG);
    this.display.drawText(5,3,"N - start a new game",UIColor.FG,UIColor.BG);
    this.display.drawText(5,4,"S - save the current game",UIColor.FG,UIColor.BG);
    this.display.drawText(5,5,"L - load the saved game",UIColor.FG,UIColor.BG);
  }

  handleInput(inputType,inputData) {
    // super.handleInput(inputType,inputData);
    if (inputType == 'keyup') {
      if (inputData.key == 'n' || inputData.key == 'N') {
        this.game.switchMode('play');
        this.game.messageHandler.send("New game started");
        console.log("TODO: implement new game");
      }
      else if (inputData.key == 's' || inputData.key == 'S') {
        this.game.switchMode('play');
        this.game.messageHandler.send("Game saved");
        console.log("TODO: implement save game");
      }
      else if (inputData.key == 'l' || inputData.key == 'L') {
        this.game.switchMode('play');
        this.game.messageHandler.send("Game loaded");
        console.log("TODO: implement load game");
      }
      else if (inputData.key == 'Escape') {
        this.game.switchMode('play'); 
      }
    }
  }
}

//-----------------------------------------------------
//-----------------------------------------------------

export class UIModePlay extends UIMode {
  enter() {
    super.enter();
    // this.game.messageHandler.clear();
  }
  
  render() {
    this.display.drawText(1,1,"game play",UIColor.FG,UIColor.BG);
    this.display.drawText(3,3,"'w' to win",UIColor.FG,UIColor.BG);
    this.display.drawText(3,5,"'l' to lose",UIColor.FG,UIColor.BG);
    this.display.drawText(1,9,"= - new game, save, or load",UIColor.FG,UIColor.BG);
  }

  handleInput(inputType,inputData) {
    // super.handleInput(inputType,inputData);
    this.game.messageHandler.send(`you pressed the ${String.fromCharCode(inputData.charCode)} key`);
    if (inputType == 'keyup') {
      if (inputData.key == 'w') {
        this.game.switchMode('win');
      }
      else if (inputData.key == 'l') {
        this.game.switchMode('lose');
      }
      else if (inputData.key == '=') {
        this.game.switchMode('persistence');
      }
    }
  }
}

//-----------------------------------------------------
//-----------------------------------------------------

export class UIModeWin extends UIMode {
  render() {
    this.display.drawText(1,1,"game win",UIColor.FG,UIColor.BG);
    this.display.drawText(1,3,"you WIN!!!",UIColor.FG,UIColor.BG);
  }
}

//-----------------------------------------------------
//-----------------------------------------------------

export class UIModeLose extends UIMode {
  render() {
    this.display.drawText(1,1,"game lose",UIColor.FG,UIColor.BG);
    this.display.drawText(1,3,"you lose :(",UIColor.FG,UIColor.BG);
  }
}