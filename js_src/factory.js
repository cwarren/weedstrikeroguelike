// a general tool for creating instances of objects from a set of templates
// also handles datastore management for those things, and restores from saved state

import {DATASTORE} from './datastore.js';

export class Factory {
  constructor(datastoreKey,productClass) {
    this.datastoreKey = datastoreKey;
    this.productClass = productClass;
    this.templates = {};
  }
  
  learn(template) {
    if (! template.templateName) {
      console.log("factory requires a name in a template it's trying to learn");
      console.dir(template);
      return false;
    }
    this.templates[template.templateName] = template;
  }
  
  // the existingId is used during persistence restores
  create(templateName, restorationState) {
    let p = new this.productClass(templateName,this.templates[templateName]);
    if (restorationState) {
      p.fromState(restorationState);
    }
    DATASTORE[this.datastoreKey][p.getId()] = p;
    return p;
  }
}