// interface layers that 'sit on top of' ui modes - e.g. a text display layer, which could show some help text, then revert to whatever the underlying layer or mode is when exited.

import {Message} from './message.js';
import {UIMode} from './ui_mode_base.js';
import {COMMAND,getCommandFromInput,setKeyBinding} from './commands.js';
import {Color} from './colors.js';
import {DisplaySymbol} from './display_symbol.js';

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
    this.setText(text);
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

export class UILayer_Target extends UILayer {
  constructor(gameRef, laysOver, map, initialX, initialY) {
    super(gameRef,laysOver);
    this.map = map;
    this.targetDX = 0;
    this.targetDY = 0;
    this.initialTargetX = initialX;
    this.initialTargetY = initialY;
    this.displayCenterX = this.display.getOptions().width/2;
    this.displayCenterY = this.display.getOptions().height/2;
    this.targetReticle = new DisplaySymbol({chr:'*',fg:'#e33'});
  }
  bindCommands() {
    setKeyBinding(['movement_numpad','activate']);
  }
  handleInput(inputType,inputData) {
    let gameCommand = getCommandFromInput(inputType,inputData);
    if (gameCommand == COMMAND.NULLCOMMAND) { return false; }

    if (gameCommand == COMMAND.CANCEL) {
      this.game.removeUILayer();
      return false;
    }

    if (gameCommand == COMMAND.ACTIVATE) {
      return this.handleActivate();
    }

    if (gameCommand == COMMAND.MOVE_UL) {
      this.targetDX--;
      this.targetDY--;
    } else
    if (gameCommand == COMMAND.MOVE_U) {
      this.targetDY--;
    } else
    if (gameCommand == COMMAND.MOVE_UR) {
      this.targetDX++;
      this.targetDY--;
    } else
    if (gameCommand == COMMAND.MOVE_L) {
      this.targetDX--;
    } else
    if (gameCommand == COMMAND.MOVE_WAIT) {
    } else
    if (gameCommand == COMMAND.MOVE_R) {
      this.targetDX++;
    } else
    if (gameCommand == COMMAND.MOVE_DL) {
      this.targetDX--;
      this.targetDY++;
    } else
    if (gameCommand == COMMAND.MOVE_D) {
      this.targetDY++;
    } else
    if (gameCommand == COMMAND.MOVE_DR) {
      this.targetDX++;
      this.targetDY++;
    }

    this.render();
    return false;
  }
  
  handleActivate() {
    this.game.removeUILayer();
    return false;
  }
  
  render() {
    this.display.clear();
    this.map.renderOn(this.display,this.initialTargetX,this.initialTargetY);
    this.targetReticle.drawOn(this.display,
      this.displayCenterX+this.targetDX,this.displayCenterY+this.targetDY);
  }
}

//================================================================
//================================================================

export class UILayer_TargetLook extends UILayer_Target {
  render() {
    super.render();
    let onTarget = this.map.getMapDataAt(this.initialTargetX+this.targetDX,
      this.initialTargetY+this.targetDY);
    let msg = onTarget.tile.getName();
    if (onTarget.entity) {
      msg = onTarget.entity.getName();
    }
    Message.sendSpecial(msg);
  }
}
