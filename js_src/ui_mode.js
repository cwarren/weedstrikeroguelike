export let UIColor = {};
UIColor.FG = '#fff';
UIColor.BG = '#000';
UIColor.DEFAULT = '%c{'+UIColor.FG+'}%b{'+UIColor.BG+'}';

//-----------------------------------------------------
//-----------------------------------------------------

class UIMode {
  constructor(gameRef) {
    this.game = gameRef;
    console.dir(this);
    this.display = this.game.getDisplay("main");
  }
  enter()       { console.log("UIMode enter - "+this.constructor.name); }
  exit()        { console.log("UIMode exit - default"); }
  render()      { console.log("UIMode render - default"); }
  handleInput(inputType,inputData) { 
    console.log("UIMode handleInput - default");
    UIMode.dumpInput(inputType,inputData);
  }

  static dumpInput(inputType,inputData) { 
    console.log('gameStart inputType:');
    console.dir(inputType);
    console.log('gameStart inputData:');
    console.dir(inputData);
  }
}

//-----------------------------------------------------
//-----------------------------------------------------

export class UIModeStart extends UIMode {
  enter() {
    super.enter();
    console.log('game starting');
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
    console.log('game playing');
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

  enter() {
    console.log('game win');
  }
  
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

  enter() {
    console.log('game lose');
  }
  
  render() {
    this.display.drawText(1,1,"game lose",UIColor.FG,UIColor.BG);
    this.display.drawText(1,3,"you lose :(",UIColor.FG,UIColor.BG);
  }

  handleInput(inputType,inputData) {
  }
}
