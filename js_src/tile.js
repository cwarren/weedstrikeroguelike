import {DisplaySymbol} from './display_symbol.js';

export class Tile extends DisplaySymbol {
  constructor(template) {
    super(template);
    this._name = template.name || 'NO NAME';
  }
  
  getName() {
    return this._name;
  }

  isA(matchingTile) {
    return this.getName() == matchingTile.getName();
  }
}

export let TILES = {
  NULLTILE: new Tile({name: 'NULLTILE'}),
  FLOOR: new Tile(   {name: 'FLOOR',  chr:'.'}),
  WALL: new Tile(    {name: 'WALL',   chr:'#'})
}
