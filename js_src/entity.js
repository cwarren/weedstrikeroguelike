// a creature/mob in the game

import {MixableSymbol} from './mixable_symbol.js';
import {DATASTORE} from './datastore.js';

export class Entity extends MixableSymbol {
  constructor(templateName, template) {
    super(template);
    if (! ('attr' in this)) { this.attr = {}; }

    // NOTE: data in this.attr is persisted, and other object data is not (it's just re-created on load)
    this.attr.templateName = template.templateName;
    this.attr.x = template.x || 1;
    this.attr.y = template.y || 1;
    this.attr.mapId = '';
  }

  getMapId() { return this.attr.mapId;}
  getMap() { return DATASTORE.MAPS[this.attr.mapId];}
  setMapId(m) { this.attr.mapId = m;}

  getx() { return this.attr.x; }
  gety() { return this.attr.y; }
  getxcy() { return `${this.attr.x},${this.attr.y}`; }
  getpos() { return {x:this.attr.x,y:this.attr.y}; }
  setx(x) { this.attr.x = x; }
  sety(y) { this.attr.y = y; }
  setxcy(xcy) { [this.attr.x,this.attr.y] = xcy.split(','); }
  setpos(x_or_xy,y) {
    if (typeof x_or_xy == 'object') {
      this.attr.x = x_or_xy.x;
      this.attr.y = x_or_xy.y;
    } else {
      this.attr.x = x_or_xy;
      this.attr.y = y;
    }
  }

  // moveBy(dx,dy) {
  //   if (! this.attr.mapId) {
  //     this.attr.x += dx;
  //     this.attr.y += dy;
  //     return true;
  //   }
  //   return DATASTORE.MAPS[this.attr.mapId].moveEntityTo(this,this.attr.x + dx,this.attr.y + dy);
  // }
  
  toJSON() {
    return JSON.stringify(this.attr);
  }
  
  fromJSON(json) {
    this.attr = JSON.parse(json);
  }
 
  fromState(state) {
    this.attr = state;
  }
}

