import {DisplaySymbol} from './display_symbol.js';
import {uniqueId} from './util.js';

export class Entity extends DisplaySymbol {
  constructor(templateName, template) {
    super(template);
    this.name = template.name || template.templateName || 'no name';
    this.descr = template.descr || 'boring';

    // NOTE: data in this.attr is persisted, and other object data is not (it's just re-created on load)
    if (! ('attr' in this)) { this.attr = {}; }
    this.attr.id = uniqueId();
    this.attr.templateName = template.templateName;
    this.attr.x = template.x || 1;
    this.attr.y = template.y || 1;
    this.attr.mapId = '';
  }

  getName() { return this.name; }

  getId() { return this.attr.id; }
  
  getMapId() { return this.attr.mapId;}
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

