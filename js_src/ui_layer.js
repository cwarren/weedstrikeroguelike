// interface layers that 'sit on top of' ui modes - e.g. a text display layer, which could show some help text, then revert to whatever the underlying layer or mode is when exited.

import {UIMode} from './ui_mode_base.js';

class UILayer extends UIMode {
  constructor(gameRef, laysOver) {
    super(gameRef);
    this.laysOver = laysOver;
  }
  isLayer() { return true; }
  exit() {
    super.exit();
    this.laysOver.bindCommands();
  }
}

// *******************************

class UILayer_Text extends UILayer {
  constructor(gameRef, laysOver,text) {
    super(gameRef,laysOver);
    this.text = text;
  }
  bindCommands() {
    setKeyBinding(['textnav']);
  }
  setText(text) {
    this.text = text;
  }
  handleInput(inputType,inputData) {
    let gameCommand = getCommandFromInput(inputType,inputData);
    if (gameCommand == COMMAND.NULLCOMMAND) { return false; }

    if (gameCommand == COMMAND.CANCEL) {
      this.game.removeModeLayer();
      return false;
    }
  }
  render() {
    this.display.drawText(1,1,this.text,Color.FG,Color.BG);
  }
}