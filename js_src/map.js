// a square grid of spaces/tiles, which can have entities and items in/on them

import ROT from 'rot-js';
import {uniqueId,init2DArray} from './util.js';
import {TILES} from './tile.js';
import {DATASTORE} from './datastore.js';
import {EntityFactory} from './entities.js';

class Map {
  constructor(xdim=1,ydim=1, mapType) {
    if (! TILE_GRID_GENERATORS.hasOwnProperty(mapType)) {
      mapType = 'basicCaves';
    }
    this.attr = {};
    this.attr.id = uniqueId();
    this.attr.mapType = mapType;
    this.attr.xdim = xdim;
    this.attr.ydim = ydim;
    this.rng = ROT.RNG.clone();
    this.attr.rngBaseState = this.rng.getState();
    this.attr.entityIdToLocation = {};
    this.attr.locationToEntityId = {};
    this.wallDamager = EntityFactory.create('jaggedprotrusion');
  }
  
  setUp() {
    this.rng.setState(this.attr.rngBaseState);
    this.tileGrid = TILE_GRID_GENERATORS[this.attr.mapType](this.attr.xdim,this.attr.ydim,this.attr.rngBaseState);
  }

  addEntity(e) {
    e.setMapId(this.attr.id);
    this.attr.entityIdToLocation[e.getId()] = e.getxcy();
    this.attr.locationToEntityId[e.getxcy()] = e.getId();
  }
  
  removeEntity(e) {
    e.setMapId('');
    delete this.attr.entityIdToLocation[e.getId()];
    delete this.attr.locationToEntityId[e.getxcy()]
  }

  moveEntityTo(e,x,y) {
    if ((x < 0) || (x >= this.attr.xdim) || (y<0) || (y >= this.attr.ydim)) {
      return false;
    }
    if (this.testLocationBlocked(x,y)) {
      return false;
    }
    
    delete this.attr.locationToEntityId[e.getxcy()];
    e.setpos(x,y);
    this.attr.locationToEntityId[e.getxcy()] = e.getId();
    this.attr.entityIdToLocation[e.getId()] = e.getxcy();
    return true;
  }
  
  getRandomUnblockedLocation() {
    let rx = Math.trunc(this.rng.getUniform()*this.attr.xdim);
    let ry = Math.trunc(this.rng.getUniform()*this.attr.ydim);
    if (this.testLocationBlocked(rx,ry)) {
      return this.getRandomWalkableOpenLocation();
    }
    return {x: rx, y: ry};
  }

  // this mess finds an unblocked random space close to the map perimeter
  getUnblockedPerimeterLocation(inset) {
    inset = inset || 2;
    let bounds = {
      lx: inset,
      ux: this.attr.xdim-1-inset,
      ly: inset,
      uy: this.attr.ydim-1-inset
    };
    let range = {
      rx: this.attr.xdim-1-inset-inset,
      ry: this.attr.ydim-1-inset-inset
    };
    let [x,y] = [0,0];
    if (this.rng.getUniform() < .5) {
      x = this.rng.getUniform() < .5 ? bounds.lx : bounds.ux;
      y = Math.trunc(this.rng.getUniform() * range.ry);
    } else {
      x = Math.trunc(this.rng.getUniform() * range.rx);
      y = this.rng.getUniform() < .5 ? bounds.ly : bounds.uy;
    }
    
    let perimLen = range.rx * 2 + range.ry * 2 - 4;
    for (let i=0; i<perimLen; i++) {
      if (! this.testLocationBlocked(x,y)) {
        return {'x': x, 'y': y};
      }
      if (y==bounds.ly && x < bounds.ux) { x++; continue; }
      if (x==bounds.ux && y < bounds.uy) { y++; continue; }
      if (y==bounds.uy && x > bounds.lx) { x--; continue; }
      if (x==bounds.lx && y > bounds.ly) { y--; continue; }
    }
    return this.getUnblockedPerimeterLocation(inset+1);
  }
  
  testLocationBlocked(x,y) {
    return (this.attr.locationToEntityId[`${x},${y}`] || this.getTile(x,y).isImpassable());
  }
  
  getMapDataAt(x,y) {
    let d = {
      entity: false,
      tile: this.getTile(x,y),
      wallDamager: this.wallDamager
    }
    if (this.attr.locationToEntityId[`${x},${y}`]) {
      d.e = DATASTORE.ENTITIES[this.attr.locationToEntityId[`${x},${y}`]];
    }
    return d;
  }
  
  getId() { return this.attr.id; }
  setId(newId) { this.attr.id = newId; }
  getRngBaseState() { return this.attr.rngBaseState; }
  setRngBaseState(newRngBaseState) { this.attr.rngBaseState = newRngBaseState; }
  
  getXDim() { return this.attr.xdim; }
  getYDim() { return this.attr.ydim; }
  
  getTile(x,y) {
    if ((x < 0) || (x >= this.attr.xdim) || (y<0) || (y >= this.attr.ydim)) {
      return TILES.NULLTILE;
    }
    return this.tileGrid[x][y] || TILES.NULLTILE;
  }
  
  renderOn(display, camX, camY) {
    let o = display.getOptions();
    let xStart = camX-Math.round(o.width/2);
    let yStart = camY-Math.round(o.height/2);   
    for (let x=0;x<o.width;x++) {
      for (let y=0;y<o.height;y++) {
        this.getDisplaySymbolAtMapLocation(x+xStart, y+yStart).drawOn(display,x,y);
      }      
    }
  }
  
  getDisplaySymbolAtMapLocation(mapX,mapY) {
    // priority is: entity, tile
    let entityId = this.attr.locationToEntityId[`${mapX},${mapY}`];
    if (entityId) { return DATASTORE.ENTITIES[entityId]; }
    
    let tile = this.getTile(mapX, mapY);
    if (tile.isA(TILES.NULLTILE)) {
      tile = TILES.WALL;
    }
    return tile;
  }
  
  toJSON() {
    return JSON.stringify(this.attr);
  }
  
  fromState(state) {
    this.attr = state;
  }
}

let TILE_GRID_GENERATORS = {
  basicCaves: function(xdim,ydim,rngState) {
    let origRngState = ROT.RNG.getState();
    ROT.RNG.setState(rngState);
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
    ROT.RNG.setState(origRngState);    
    return tg;
  }
}

export function makeMap(mapData) {
  let m = new Map(mapData.xdim, mapData.ydim, mapData.mapType);
  // if (mapData.id !== undefined) { m.setId(mapData.id); }
  // if (mapData.rngBaseState !== undefined) { m.setRngBaseState(mapData.rngBaseState); }
  if (mapData.id !== undefined) { 
    m.fromState(mapData);
  }
  m.setUp();
  
  DATASTORE.MAPS[m.getId()] = m;
  
  return m;
}