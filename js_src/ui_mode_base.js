//-----------------------------------------------------
//-----------------------------------------------------


export class UIMode {
  constructor(gameRef) {
    this.game = gameRef;
    this.display = this.game.getDisplay("main");
    this.overlay = null;
  }
  
  enter()       {
    console.log(`UIMode enter - ${this.constructor.name}`);
    // console.log("datastore:");
    // console.dir(DATASTORE);
    this.bindCommands();
  }
  bindCommands() { }
  exit()        {
    console.log(`UIMode exit - ${this.constructor.name}`);
    // console.log("datastore:");
    // console.dir(DATASTORE);
  }
  isLayer() {
    return false;
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

