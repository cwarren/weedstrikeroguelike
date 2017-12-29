import {DisplaySymbol} from './display_symbol.js';
import {uniqueId} from './util.js';
import {DATASTORE} from './datastore.js';

export class Entity extends DisplaySymbol {
  constructor(template) {
    super(template);
    this.name = template.name || 'no name';
    this.descr = template.descr || 'boring';

    // NOTE: data in this.attr is persisted, and other object data is not (it's just re-created on load)
    if (! ('attr' in this)) { this.attr = {}; }
    this.attr.id = template.existingId || uniqueId();
    DATASTORE.ENTITIES[this.attr.id] = this;
    this.attr.x = template.x || 1;
    this.attr.y = template.y || 1;
  }

  getName() { return this.name; }
  
  getx() { return this.attr.x; }
  gety() { return this.attr.y; }
  getpos() { return {x:this.attr.x,y:this.attr.y}; }
  setx(x) { this.attr.x = x; }
  sety(y) { this.attr.y = y; }
  setpos(x_or_xy,y) {
    if (typeof x_or_xy == 'object') {
      this.attr.x = x_or_xy.x;
      this.attr.y = x_or_xy.y;
    } else {
      this.attr.x = x_or_xy;
      this.attr.y = y;
    }
  }
  
}

