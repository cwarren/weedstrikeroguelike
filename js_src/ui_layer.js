// interface layers that 'sit on top of' ui modes - e.g. a text display layer, which could show some help text, then revert to whatever the underlying layer or mode is when exited.

import {UIMode} from './ui_mode_base.js';
import {COMMAND,getCommandFromInput,setKeyBinding} from './commands.js';
import {Color} from './colors.js';

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

export class UILayer_Text extends UILayer {
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
      this.game.removeUILayer();
      return false;
    }
    if (gameCommand == COMMAND.LINE_UP) {
      ;
    } else
    if (gameCommand == COMMAND.LINE_DOWN) {
      ;
    } else
    if (gameCommand == COMMAND.PAGE_UP) {
      ;
    } else
    if (gameCommand == COMMAND.PAGE_DOWN) {
      ;
    }
    return true;

  }
  render() {
    this.display.drawText(1,1,this.text,Color.FG,Color.BG);
  }
}