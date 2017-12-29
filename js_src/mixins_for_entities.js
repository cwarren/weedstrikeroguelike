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
  }
};