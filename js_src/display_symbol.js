import {Color} from './colors.js';

export class DisplaySymbol {
  constructor(chr=' ',fgHexColor=Color.FG,bgHexColor=Color.BG) {
    this._chr = chr;
    this._fgHexColor = fgHexColor;
    this._bgHexColor = bgHexColor;
  }
  
  getRepresentation() {
    return '%c{' + this._fgHexColor + '}%b{' + this._bgHexColor + '}' + this._chr;
  }
  
  drawOn(display, dispX, dispY) {
    display.draw(dispX, dispY, this._chr, this._fgHexColor, this._bgHexColor);
  }
}
