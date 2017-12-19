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
  enter()       { 
    console.log("UIMode enter - "+this.constructor.name);
    this.game.messageHandler.clear();
  }
  exit()        { console.log("UIMode exit - "+this.constructor.name); }
  render()      { console.log("UIMode render - "+this.constructor.name); }
  handleInput(inputType,inputData) { 
    console.log("UIMode handleInput - "+this.constructor.name);
    UIMode.dumpInput(inputType,inputData);
  }

  static dumpInput(inputType,inputData) { 
    console.log('inputType:');
    console.dir(inputType);
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
    super.dumpInput(inputType,inputData);
  }
}

//-----------------------------------------------------
//-----------------------------------------------------

export class UIModePlay extends UIMode {
  enter() {
    super.enter();
    this.game.messageHandler.clear();
  }
  render() {
    this.display.drawText(1,1,"game play",UIColor.FG,UIColor.BG);
    this.display.drawText(1,3,"press any [Enter] to win",UIColor.FG,UIColor.BG);
    this.display.drawText(1,5,"press any [Escape] to lose",UIColor.FG,UIColor.BG);
  }

  handleInput(inputType,inputData) {
    super.dumpInput(inputType,inputData);
    this.game.messageHandler.send("you pressed the '"+String.fromCharCode(inputData.charCode)+"' key");
  }
}

//-----------------------------------------------------
//-----------------------------------------------------

export class UIModeWin extends UIMode {
  render() {
    this.display.drawText(1,1,"game win",UIColor.FG,UIColor.BG);
    this.display.drawText(1,3,"you WIN!!!",UIColor.FG,UIColor.BG);
  }

  handleInput(inputType,inputData) {
  }
}

//-----------------------------------------------------
//-----------------------------------------------------

export class UIModeLose extends UIMode {
  render() {
    this.display.drawText(1,1,"game lose",UIColor.FG,UIColor.BG);
    this.display.drawText(1,3,"you lose :(",UIColor.FG,UIColor.BG);
  }

  handleInput(inputType,inputData) {
  }
}
