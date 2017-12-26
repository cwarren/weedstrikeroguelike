import {DisplaySymbol} from './display_symbol.js';

export class Tile {
  constructor(name,symbol) {
    this._name = name;
    this._symbol = symbol;
  }
  
  getDisplaySymbol() {
    return this._sym;
  }
  
  getName() {
    return this._name;
  }

  drawOn(display, dispX, dispY) {
    this._sym.drawOn(display, dispX, dispY);
  }
}

export let TILE = {
  NULLTILE: new Tile('NULLTILE',new DisplaySymbol()),
  FLOOR: new Tile('FLOOR',new DisplaySymbol('.')),
  WALL: new Tile('WALL',new DisplaySymbol('#'))
}
