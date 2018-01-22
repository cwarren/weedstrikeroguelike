// interface layers that 'sit on top of' ui modes - e.g. a text display layer, which could show some help text, then revert to whatever the underlying layer or mode is when exited.

import {UIMode} from './ui_mode_base.js';
import {COMMAND,getCommandFromInput,setKeyBinding} from './commands.js';
import {Color} from './colors.js';

//================================================================
//================================================================

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

//================================================================
//================================================================

export class UILayer_Text extends UILayer {
  constructor(gameRef, laysOver,text) {
    super(gameRef,laysOver);
    this.yDim = this.display.getOptions().height;
    this.text = text;
    this.yBase = 0;
    this.totalTextLines = 0;
    this.canUseLineUp = false;
    this.canUseLineDown = false;
  }
  bindCommands() {
    setKeyBinding(['textnav']);
  }
  setText(text) {
    this.text = text;
    this.yBase = 0;
    this.totalTextLines = 0;
    this.canUseLineUp = false;
    this.canUseLineDown = false;
    this.render();
  }
  handleInput(inputType,inputData) {
    let gameCommand = getCommandFromInput(inputType,inputData);
    if (gameCommand == COMMAND.NULLCOMMAND) { return false; }

    if (gameCommand == COMMAND.CANCEL) {
      this.game.removeUILayer();
      return false;
    }

    if (gameCommand == COMMAND.LINE_UP) {
      this.tryLineUp();
    } else
    if (gameCommand == COMMAND.LINE_DOWN) {
      this.tryLineDown();
    } else
    if (gameCommand == COMMAND.PAGE_UP) {
      for (let c=0; c<this.yDim;c++) { this.tryLineUp(); }
    } else
    if (gameCommand == COMMAND.PAGE_DOWN) {
      for (let c=0; c<this.yDim;c++) { this.tryLineDown(); }
    }
    this.render();
    return false;
  }
  
  tryLineUp() {
    this.calcNavValidity();
    if (this.canUseLineUp) {
      this.yBase = Math.min(0,this.yBase+1);
    }
  }
  
  tryLineDown() {
    this.calcNavValidity();
    if (this.canUseLineDown) {
      this.yBase--;
    }
  }

  calcNavValidity() {
    let linesDrawn = Math.min(this.totalTextLines,this.yDim);
    let linesAboveFold = this.yBase * -1;
    let linesBelowFold = this.totalTextLines - linesAboveFold - linesDrawn;
    this.canUseLineUp = linesAboveFold > 0;
    this.canUseLineDown = linesBelowFold > 0;
  }
  
  render() {
    this.display.clear();
    this.totalTextLines = this.display.drawText(1,this.yBase,this.text,Color.FG,Color.BG);

    this.calcNavValidity();
    if (this.canUseLineUp) {
      this.display.draw(0,0,'\u21d1',Color.BLUE,Color.WHITE);
    }
    if (this.canUseLineDown) {
      this.display.draw(0,this.yDim-1,'\u21d3',Color.BLUE,Color.WHITE);
    }
  }
}

//================================================================
//================================================================
