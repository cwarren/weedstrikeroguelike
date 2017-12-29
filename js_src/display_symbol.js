// a symbol/character that can be shown on the main game display; the base class for everything that's shown on the map

import {Color} from './colors.js';

export class DisplaySymbol {
  constructor(template) {
    // chr=' ',fgHexColor=Color.FG,bgHexColor=Color.BG) {
    this._chr = template.chr || ' ';
    this._fgHexColor = template.fg || Color.FG;
    this._bgHexColor = template.bg || Color.BG;
  }
  
  getRepresentation() {
    return '%c{' + this._fgHexColor + '}%b{' + this._bgHexColor + '}' + this._chr;
  }
  
  drawOn(display, dispX, dispY) {
    display.draw(dispX, dispY, this._chr, this._fgHexColor, this._bgHexColor);
  }
}
