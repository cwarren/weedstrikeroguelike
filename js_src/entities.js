// definitions for the various entities in the game

import {Entity} from './entity.js';
import {Factory} from './factory.js';

export let EntityFactory = new Factory('ENTITIES', Entity);

EntityFactory.learn({
  templateName: 'avatar',
  descr: 'a mighty gardener',
  chr: '@',
  fg: '#ee1',
  maxHp: 10,
  mixins: ["PlayerMessager","WalkerCorporeal","TimeTracker","HitPoints"]
});

EntityFactory.learn({
  templateName: 'jaggedprotrusion',
  name: 'a jagged protrusion',
  descr: 'a sharp point of rock  which damages anything that walks into a wall',
  chr: '^'
});