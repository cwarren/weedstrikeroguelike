// a single space on a map, has a type and various characteristics

import {DisplaySymbol} from './display_symbol.js';

export class Tile extends DisplaySymbol {
  constructor(template) {
    super(template);
    this._name = template.name || 'NO NAME';
    this.walkable = template.walkable || false;
    this.transparent = template.transparent || false;
  }
  
  getName() {
    return this._name;
  }

  isA(matchingTile) {
    return this.getName() == matchingTile.getName();
  }
  
  // flag accessors, with a bit of sytactic sugar to make thinking easier in other parts of the code
  isWalkable() {
    return this.walkable;
  }
  isImpassable() {
    return ! this.walkable;
  }
  isTransparent() {
    return this.transparent;
  }
  isOpaque() {
    return ! this.transparent;
  }
}

export let TILES = {
  NULLTILE: new Tile({name: 'NULLTILE'}),
  FLOOR: new Tile(   {name: 'FLOOR',  chr:'.', walkable: true, transparent: true}),
  WALL: new Tile(    {name: 'WALL',   chr:'#'})
}
