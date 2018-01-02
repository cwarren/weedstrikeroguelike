// definitions for the various entities in the game

import {Entity} from './entity.js';
import {Factory} from './factory.js';

export let EntityFactory = new Factory('ENTITIES', Entity);

EntityFactory.learn({
  templateName: 'avatar',
  descr: 'a mighty gardener',
  chr: '@',
  fg: '#ee1',
  mixins: ["PlayerMessager","WalkerCorporeal","TimeTracker"]
});
