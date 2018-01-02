// a display symbol that can have mixins to add functionality
import * as E from './mixins_for_entities.js'; 
import {uniqueId} from './util.js';
import {DisplaySymbol} from './display_symbol.js';

export class MixableSymbol extends DisplaySymbol {
  constructor(template) {
    super(template);
    this.name = template.name || template.templateName || 'no name';
    this.descr = template.descr || '';
    if (! ('attr' in this)) { this.attr = {}; }
    this.attr.id = uniqueId();
    
    if (!template.mixins) { template.mixins = []; }
    this.mixinNames = template.mixins.slice();
    this.mixins = [];
    this.mixinTracker = {};
    
    this.mixinSet = E; // later this will be dynamically determined based on this.constructor.name

    // pull in the actual mixins so we can easily do calls on their listeners later
    for (let i=0; i<this.mixinNames.length; i++) {
      this.mixins.push(this.mixinSet[this.mixinNames[i]]);
    }

    for (var mi=0; mi<this.mixins.length; mi++) {
      let mixin = this.mixins[mi];
      
      // track the mixin
      this.mixinTracker[mixin.META.mixinName] = true;
      this.mixinTracker[mixin.META.mixinGroup] = true;
      
      // add mixin methods to this object
      for (var mixinMethod in mixin.METHODS) {
        this[mixinMethod] = mixin.METHODS[mixinMethod];
      }
      
      // set up the mixin state
      if (mixin.META.hasOwnProperty('stateNamespace')) {
        this.attr[mixin.META.stateNamespace] = {};
        if (mixin.META.hasOwnProperty('stateModel')) {
          this.attr[mixin.META.stateNamespace] = JSON.parse(JSON.stringify(mixin.META.stateModel));
        }
      }
    
      // NOTE: listeners are not imported but instead are called as needed by the event handler
    }
    
    // initialize mixins after all attributes, functions, listeners, etc. are in place
    for (mi = 0; mi < this.mixins.length; mi++) {
      let mixin = this.mixins[mi];
      if (mixin.META.hasOwnProperty('init')) {
        mixin.META.init.call(this,template);
      }
    }
  }

  getName() { return this.name; }

  getId() { return this.attr.id; }
  

  // -----------------------------------
   
  hasMixin(checkThis) {
    if (typeof checkThis == 'object') {
      return this.mixinTracker.hasOwnProperty(checkThis.META.mixinName);
    } else {
      return this.mixinTracker.hasOwnProperty(checkThis);
    }
  }
  
  // -----------------------------------

  // call the relevant event listener for each mixin, compiling their results
  raiseMixinEvent(evtLabel,evtData) {
    // console.log('raiseSymbolActiveEvent '+evtLabel);
    // console.dir(JSON.parse(JSON.stringify(evtData)));
    var response = {};
    for (var i = 0; i < this.mixins.length; i++) {
      var mixin = this.mixins[i];
      if (mixin.LISTENERS && mixin.LISTENERS[evtLabel]) {
        var resp = mixin.LISTENERS[evtLabel].call(this,evtData);
        for (var respKey in resp) {
          if (resp.hasOwnProperty(respKey)) {
            if (! response[respKey]) { response[respKey] = []; }
            response[respKey].push(resp[respKey]);
          }
        }
      }
    }
    return response;
  }
}