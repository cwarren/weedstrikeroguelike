import {Message} from './message.js';

// chunks of functionality that can be added to entity instances

let _exampleMixin = {
  META: {
    mixinName: 'NameOfMixin',
    mixinGroup: 'NameOfMixinGroup',
    stateNamespace: '_UniqueNamespaceForMixinDataToBePersisted', 
      // accessible as this.attr._UniqueNamespaceForMixinDataToBePersisted
    stateModel: { // mixin data initialized to this
      turnCounter: 0
    },
    init: function(template) {
      // this is called once the mixin has been added to an entity; generally
      // used to initialized the state model from template data
    }
  },
  METHODS: { // OPTIONAL, though without at least one method or listener the mixin's less useful
    m: function() {
      // the methods listed here are (effectively) added to the object
      //NOTE/WARN: these methods are NOT partitioned in their own namespaces on the object, so method names should be unique
    }
  },
  LISTENERS: { // OPTIONAL, though without at least one method or listener the mixin's less useful
    'eventLabel': function(evtData) { // handler for 'eventLabel' events
      let evtResp = {};
      return evtResp;
    }
  }
}

//############################################################


export let PlayerMessager = {
  META: {
    mixinName: 'PlayerMessager',
    mixinGroup: 'PlayerMessager',
  },
  LISTENERS: {
    'turnTaken': function(evtData) {
      Message.send(evtData.turnAction);
      return {};
    },
    'movementBlocked': function(evtData) {
      Message.send(`${this.getName()} cannot move there because ${evtData.reasonBlocked}`);
      return {};
    }
  }
}

//############################################################

export let WalkerCorporeal = {
  META: {
    mixinName: 'WalkerCorporeal',
    mixinGroup: 'Walker'
  },
  METHODS: {
    tryWalk: function(dx,dy) {
      let newx = this.getx()+dx;
      let newy = this.gety()+dy;
      let md = this.getMap().getMapDataAt(newx,newy);
      if (md.entity) { // NOTE: this is entity interaction! later will be combat (or other?)
        this.raiseMixinEvent('movementBlocked',{'reasonBlocked':'the space is occupied'});
        return false;
      }
      if (md.tile.isImpassable()) {
        this.raiseMixinEvent('movementBlocked',{'reasonBlocked':'the space is impassable'});
        return false;
      }
      this.getMap().moveEntityTo(this,newx,newy);
      this.raiseMixinEvent('turnTaken',{'turnAction':'walk'});
      return true;
    }
  }
}

//############################################################

export let TimeTracker = {
  META: {
    mixinName: 'TimeTracker',
    mixinGroup: 'Chronicle',
    stateNamespace: '_TimeTracker',
    stateModel: {
      timeCounter: 0
    }
  },
  METHODS: {
    getTime: function() {
      return this.attr._TimeTracker.timeCounter;
    },
    setTime: function(t) {
      this.attr._TimeTracker.timeCounter = t;
    },
    addTime: function(t) {
      this.attr._TimeTracker.timeCounter += t;
    }
  },
  LISTENERS: {
    'turnTaken': function(evtData) {
      let evtResp = {};
      this.addTime(1);
      return evtResp;
    }
  }

};