import ROT from 'rot-js';
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
    },
    'movementBlocked': function(evtData) {
      Message.send(`${this.getName()} cannot move there because ${evtData.reasonBlocked}`);
    },
    'damaged': function(evtData) {
      Message.send(`${this.getName()} took ${evtData.damageAmt} from ${evtData.damageSrc.getName()}`);
    },
    'healed': function(evtData) {
      Message.send(`${this.getName()} healed ${evtData.healAmt} from ${evtData.healSrc.getName()}`);
    },
    'killed': function(evtData) {
      Message.send(`${this.getName()} killed by ${evtData.killer.getName()}`);
    },
    'kills': function(evtData) {
      Message.send(`${this.getName()} kills ${evtData.kills.getName()}`);
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
        if (ROT.RNG.getUniform() < .5) {
          this.raiseMixinEvent('damaged',{'damageAmt': 1, 'damageSrc': md.wallDamager});
          this.raiseMixinEvent('turnTaken',{'turnAction':'bumped wall'});
          return true;
        }
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
    getTimeTaken: function() {
      return this.attr._TimeTracker.timeCounter;
    },
    setTimeTaken: function(t) {
      this.attr._TimeTracker.timeCounter = t;
    },
    addTimeTaken: function(t) {
      this.attr._TimeTracker.timeCounter += t;
    }
  },
  LISTENERS: {
    'turnTaken': function(evtData) {
      this.addTimeTaken(1);
    }
  }
};

//############################################################

export let HitPoints = {
  META: {
    mixinName: 'HitPoints',
    mixinGroup: 'HitPoints',
    stateNamespace: '_HitPoints', 
    stateModel: {
      curHp: 0,
      maxHp: 0
    },
    init: function(template) {
      this.attr._HitPoints.maxHp = template.maxHp || 1;
      this.attr._HitPoints.curHp = template.curHp || this.attr._HitPoints.maxHp;
    }
  },
  METHODS: {
    setHp: function(newHp) {
      this.attr._HitPoints.curHp = newHp;
    },
    gainHp: function(dHp) {
      if (dHp < 0) { return; }
      this.attr._HitPoints.curHp = Math.min(this.attr._HitPoints.curHp+dHp,this.attr._HitPoints.maxHp);
    },
    loseHp: function(dHp) {
      if (dHp < 0) { return; }
      this.attr._HitPoints.curHp -= dHp;
    },
    setMaxHp: function(newMaxHp) {
      this.attr._HitPoints.maxHp = newMaxHp;
    },
    getCurHp: function() {
      return this.attr._HitPoints.curHp;
    },
    getMaxHp: function() {
      return this.attr._HitPoints.maxHp;
    }
  },
  LISTENERS: {
    'damaged': function(evtData) { // handler for 'eventLabel' events
      this.loseHp(evtData.damageAmt);
      if (this.attr._HitPoints.curHp <= 0) {
        this.raiseMixinEvent("killed",{'killer':evtData.damageSrc});
        evtData.damageSrc.raiseMixinEvent("kills",{'kills':this});
      }
    }
  }
}
