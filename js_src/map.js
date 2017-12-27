import ROT from 'rot-js';
import {randomString,init2DArray} from './util.js';
import {TILES} from './tile.js';

export class Map {
  constructor(xdim=1,ydim=1, mapType) {
    if (! TILE_GRID_GENERATORS.hasOwnProperty(mapType)) {
      mapType = 'basicCaves';
    }
    this.xdim = xdim;
    this.ydim = ydim;
    this.tileGrid = TILE_GRID_GENERATORS[mapType](xdim,ydim);
    this.id = randomString();
  }
  
  getTile(x,y) {
    if ((x < 0) || (x >= this.xdim) || (y<0) || (y >= this.ydim)) {
      return Game.Tile.nullTile;
    }
    return this.tileGrid[x][y] || TILES.NULLTILE;
  }
  
  renderOn(display) {
    for (let x=0;x<this.xdim;x++) {
      for (let y=0;y<this.ydim;y++) {
        this.getTile(x,y).drawOn(display,x,y);
      }      
    }
  }
}

let TILE_GRID_GENERATORS = {
  basicCaves: function(xdim,ydim) {
    let tg = init2DArray(xdim,ydim,TILES.NULLTILE);
    let gen = new ROT.Map.Cellular(xdim, ydim, { connected: true });
    gen.randomize(.49);
    for(var i=3;i>=0;i--) {
      gen.create();
      // set the boundary to all wall each pass
      for (let x=0;x<xdim;x++) {
        for (let y=0;y<ydim;y++) {
          if (x<=1 || y<=1 || x>=xdim-2 || y>=ydim-2) {
            gen.set(x,y,1);
          }
        }      
      }
    }
    gen.connect(function(x,y,isWall) {
      tg[x][y] = (isWall || x==0 || y==0 || x==xdim-1 || y==ydim-1) ? TILES.WALL : TILES.FLOOR;
    });
    return tg;
  }
}