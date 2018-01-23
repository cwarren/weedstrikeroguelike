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
      this.tryMoveReticle(-1,-1);
    } else
    if (gameCommand == COMMAND.MOVE_U) {
      this.tryMoveReticle(0,-1);
    } else
    if (gameCommand == COMMAND.MOVE_UR) {
      this.tryMoveReticle(1,-1);
    } else
    if (gameCommand == COMMAND.MOVE_L) {
      this.tryMoveReticle(-1,0);
    } else
    if (gameCommand == COMMAND.MOVE_R) {
      this.tryMoveReticle(1,0);
    } else
    if (gameCommand == COMMAND.MOVE_DL) {
      this.tryMoveReticle(-1,1);
    } else
    if (gameCommand == COMMAND.MOVE_D) {
      this.tryMoveReticle(0,1);
    } else
    if (gameCommand == COMMAND.MOVE_DR) {
      this.tryMoveReticle(1,1);
    }

    this.render();
    return false;
  }
  
  tryMoveReticle(dx,dy) {
    this.targetDX += dx;
    this.targetDY += dy;
  }
  
  handleActivate() {
    // sub-classes would override this to do something specific with the targeted location
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
  tryMoveReticle(dx,dy) {
    let newX = this.targetDX*1 + dx*1;
    let newY = this.targetDY*1 + dy*1;

    // this is where FOV checking would come in, to prevent moving the reticle to a place that the avatar can't see

    this.targetDX = newX;
    this.targetDY = newY;
  }

  getLookInfo() {
    let onTarget = this.map.getMapDataAt(this.initialTargetX+this.targetDX,
      this.initialTargetY+this.targetDY);
    
    // for now looking at something just shows the name, but once descriptions are implemented it would show that instead
    // right now there are just tiles and entities, but when items are in play that info would also be shown
    let msg = onTarget.tile.getName();
    if (onTarget.entity) {
      msg = onTarget.entity.getName() + ' on ' + onTarget.tile.getName();
    }
    
    return msg;
  }

  handleActivate() {
    Message.send("looked at "+this.getLookInfo());
    this.game.removeUILayer();
    return false;
  }

  render() {
    super.render();
    Message.sendSpecial(this.getLookInfo());
  }
}
