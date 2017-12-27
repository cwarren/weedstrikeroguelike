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
  
  getXDim() { return this.xdim; }
  getYDim() { return this.ydim; }
  getTile(x,y) {
    if ((x < 0) || (x >= this.xdim) || (y<0) || (y >= this.ydim)) {
      return TILES.NULLTILE;
    }
    return this.tileGrid[x][y] || TILES.NULLTILE;
  }
  
  renderOn(display, camX, camY) {
    let o = display.getOptions();
    let xStart = camX-Math.round(o.width/2);
    let yStart = camY-Math.round(o.height/2);   
    for (let x=0;x<this.xdim;x++) {
      for (let y=0;y<this.ydim;y++) {
        let tile = this.getTile(x+xStart, y+yStart);
        if (tile.isA(TILES.NULLTILE)) {
          tile = TILES.WALL;
        }
        tile.drawOn(display,x,y);
      }      
    }
  }
  
}

let TILE_GRID_GENERATORS = {
  basicCaves: function(xdim,ydim) {
    let tg = init2DArray(xdim,ydim,TILES.NULLTILE);
    let gen = new ROT.Map.Cellular(xdim, ydim, { connected: true });
    gen.randomize(.49);
    for(let i=3;i>=0;i--) {
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