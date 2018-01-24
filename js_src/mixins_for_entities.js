
// chunks of functionality that can be added to entity instances
import ROT from 'rot-js';
import {Message} from './message.js';
import * as U from './util.js';
import {SCHEDULER,TIME_ENGINE} from './timing.js';
import {DATASTORE} from './datastore.js';


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
    'movementBlocked': function(evtData) {
      Message.send(`${this.getName()} cannot move there because ${evtData.reasonBlocked}`);
    },
    'damagedBy': function(evtData) {
      Message.send(`${this.getName()} took ${evtData.damageAmt} from ${evtData.damageSrc.getName()}`);
    },
    'damages': function(evtData) {
      Message.send(`${this.getName()} dealt ${evtData.damageAmt} to ${evtData.target.getName()}`);
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
      // console.log(`${this.getName()} walking by ${dx},${dy}`);
      let newx = this.getx()+dx;
      let newy = this.gety()+dy;
      let md = this.getMap().getMapDataAt(newx,newy);
      if (md.entity) {
        let bumpRes = this.raiseMixinEvent('bumpEntity',{'target':md.entity});
        let tookAction = U.collapseArrayByOr(bumpRes.acted);
        if (tookAction) {
          this.raiseMixinEvent('actionDone');
        }
        return tookAction;
      }
      if (md.tile.isImpassable()) {
        this.raiseMixinEvent('movementBlocked',{'reasonBlocked':'the space is impassable'});
        return false;
      }
      this.getMap().moveEntityTo(this,newx,newy);
      this.raiseMixinEvent('turnTaken',{'turnAction':'walk'});
      this.raiseMixinEvent('actionDone');
      return true;
    }
  },
  LISTENERS: {
    'walkAttempt': function(evtData) {
      this.tryWalk(evtData.dx,evtData.dy);
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

export let KillTracker = {
  META: {
    mixinName: 'KillTracker',
    mixinGroup: 'Chronicle',
    stateNamespace: '_KillTracker',
    stateModel: {
      killCounter: 0
    }
  },
  METHODS: {
    getNumKills: function() {
      return this.attr._KillTracker.killCounter;
    }
  },
  LISTENERS: {
    'kills': function(evtData) {
      this.attr._KillTracker.killCounter++;
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
    'damagedBy': function(evtData) { // handler for 'eventLabel' events
      this.loseHp(evtData.damageAmt);
      evtData.damageSrc.raiseMixinEvent('damages',{'target':this,'damageAmt':evtData.damageAmt})
      if (this.attr._HitPoints.curHp <= 0) {
        this.raiseMixinEvent("killed",{'killer':evtData.damageSrc});
        evtData.damageSrc.raiseMixinEvent("kills",{'kills':this});
      }
    },
    'killed': function(evtData) {
      // console.log(this.getName()+' killed');
      this.destroy();
    }
  }
}

//############################################################

export let MeleeAttacker = {
  META: {
    mixinName: 'MeleeAttacker',
    mixinGroup: 'BumpActivated',
    stateNamespace: '_MeleeAttacker', 
    stateModel: {
      meleeHit: 0,
      meleeDamage: 0
    },
    init: function(template) {
      this.attr._MeleeAttacker.meleeHit = template.meleeHit || 1;
      this.attr._MeleeAttacker.meleeDamage = template.meleeDamage || 1;
    }
  },
  METHODS: {
    getMeleeHit: function() {
      return this.attr._MeleeAttacker.meleeHit;
    },
    setMeleeHit: function(h) {
      this.attr._MeleeAttacker.meleeHit = h;
    },
    getMeleeDamage: function() {
      return this.attr._MeleeAttacker.meleeDamage;
    },
    setMeleeDamage: function(d) {
      this.attr._MeleeAttacker.meleeDamage = d;
    },
  },
  LISTENERS: {
    'bumpEntity': function(evtData) {
      // NOTE: no to-hit calc yet
      let evtResp = {'acted': true};
      evtData.target.raiseMixinEvent('damagedBy',{'damageSrc': this, 'damageAmt':this.getMeleeDamage()});
      evtData.target.raiseMixinEvent('meleeAttackedBy',{'attacker': this});
      return evtResp;
    }
  }
}

//############################################################

export let MeleeThorns = {
  META: {
    mixinName: 'MeleeThorns',
    mixinGroup: 'BumpedActivated',
    stateNamespace: '_MeleeThorns', 
    stateModel: {
      meleeThornHit: 0,
      meleeThornDamage: 0
    },
    init: function(template) {
      this.attr._MeleeThorns.meleeThornHit = template.meleeThornHit || 1;
      this.attr._MeleeThorns.meleeThornDamage = template.meleeThornDamage || 1;
    }
  },
  METHODS: {
    getMeleeThornHit: function() {
      return this.attr._MeleeThorns.meleeThornHit;
    },
    setMeleeThornHit: function(h) {
      this.attr._MeleeThorns.meleeThornHit = h;
    },
    getMeleeThornDamage: function() {
      return this.attr._MeleeThorns.meleeThornDamage;
    },
    setMeleeThornDamage: function(d) {
      this.attr._MeleeThorns.meleeThornDamage = d;
    },
  },
  LISTENERS: {
    'meleeAttackedBy': function(evtData) {
      evtData.attacker.raiseMixinEvent('damagedBy',{'damageSrc': this, 'damageAmt':this.getMeleeThornDamage()});
    }
  }
}

//############################################################

export let ActorPlayer = {
  META:{
    mixinName: 'ActorPlayer',
    mixinGroupName: 'Actor',
    stateNamespace: '_ActorPlayer',
    stateModel: {
      baseActionDuration: 1000,
      actingState: false,
      currentActionDuration: 1000
    },
    init: function(template) {
      SCHEDULER.add(this,true,1);
    }
  },
  METHODS:{
    getBaseActionDuration: function () {
      return this.attr._ActorPlayer.baseActionDuration;
    },
    setBaseActionDuration: function (n) {
      this.attr._ActorPlayer.baseActionDuration = n;
    },
    getCurrentActionDuration: function () {
      return this.attr._ActorPlayer.currentActionDuration;
    },
    setCurrentActionDuration: function (n) {
      this.attr._ActorPlayer.currentActionDuration = n;
    },
    isActing: function (state) {
      if (state !== undefined) {
        this.attr._ActorPlayer.actingState = state;
      }
      return this.attr._ActorPlayer.actingState;
    },
    act: function () {
      if (this.isActing()) { return; } // a gate to deal with JS timing issues
      this.isActing(true);
      TIME_ENGINE.lock();
      DATASTORE.GAME.render();
      this.isActing(false);
      console.log("player is acting");
    }
  },
  LISTENERS:{
    'actionDone': function(evtData) {
      SCHEDULER.setDuration(this.getCurrentActionDuration());
      this.setCurrentActionDuration(this.getBaseActionDuration()+U.randomInt(-5,5));
      this.raiseMixinEvent('turnTaken',{timeUsed: 1});
      setTimeout(function() {TIME_ENGINE.unlock();},1); // NOTE: this tiny delay ensures console output happens in the right order, which in turn means I have confidence in the turn-taking order of the various entities
      console.log("end player acting");
    }
  }
};

//############################################################

export let ActorWanderer = {
  META:{
    mixinName: 'ActorWanderer',
    mixinGroupName: 'Actor',
    stateNamespace: '_ActorWanderer',
    stateModel: {
      baseActionDuration: 1000,
      actingState: false,
      currentActionDuration: 1000
    },
    init: function(template) {
      SCHEDULER.add(this,true,U.randomInt(2,this.attr._ActorWanderer.baseActionDuration));
    }
  },
  METHODS:{
    getBaseActionDuration: function () {
      return this.attr._ActorWanderer.baseActionDuration;
    },
    setBaseActionDuration: function (n) {
      this.attr._ActorWanderer.baseActionDuration = n;
    },
    getCurrentActionDuration: function () {
      return this.attr._ActorWanderer.currentActionDuration;
    },
    setCurrentActionDuration: function (n) {
      this.attr._ActorWanderer.currentActionDuration = n;
    },
    isActing: function (state) {
      if (state !== undefined) {
        this.attr._ActorWanderer.actingState = state;
      }
      return this.attr._ActorWanderer.actingState;
    },
    act: function () {
      if (this.isActing()) { return; } // a gate to deal with JS timing issues
      this.isActing(true);
      console.log("wanderer is acting");

      // do wandering here
      let dx = U.randomInt(-1,1);
      let dy = U.randomInt(-1,1);
      // console.log(`wandering attempting walk: ${dx},${dy}`);
      if (dx != 0 || dy !=0) {
        this.raiseMixinEvent('walkAttempt',{'dx':dx,'dy':dy});
      }
      // TIME_ENGINE.lock();
      SCHEDULER.setDuration(this.getCurrentActionDuration());
      this.setCurrentActionDuration(this.getBaseActionDuration()+U.randomInt(-5,5));
      this.isActing(false);
    }
  },
  LISTENERS:{
    'actionDone': function(evtData) {
      // TIME_ENGINE.unlock();
      console.log("end wanderer acting");
    }
  }
};

//############################################################
