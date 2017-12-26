import ROT from 'rot-js';
import {randomString,init2DArray} from './util.js';
import {TILES} from './tile.js';

console.log('Map ROT: ');
console.dir(ROT);

export class Map {
  constructor(mapType, xdim=1,ydim=1) {
    if (! TILE_GRID_GENERATORS.hasOwnProperty(mapType)) {
      mapType = 'basicCaves';
    }
    this.xdim = xdim;
    this.ydim = ydim;
    this.tileGrid = TILE_GRID_GENERATORS[mapType](xdim,ydim);
    this.id = randomString();
  }
}

let TILE_GRID_GENERATORS = {
  basicCaves: function(xdim,ydim) {
    let tg = init2DArray(xdim,ydim,TILES.NULLTILE);
    
    return tg;
  }
}