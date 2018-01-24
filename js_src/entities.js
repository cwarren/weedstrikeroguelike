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
  meleeHit: 3,
  meleeDamage: 2,
  mixins: ["ActorPlayer","PlayerMessager","WalkerCorporeal","TimeTracker","KillTracker","HitPoints","MeleeAttacker"]
});

EntityFactory.learn({
  templateName: 'moss',
  descr: 'a patch of tiny, fuzzy-looking plants',
  chr: '%',
  fg: '#3a4',
  maxHp: 1,
  mixins: ["HitPoints"]
});

EntityFactory.learn({
  templateName: 'vine',
  descr: 'a twisty, windy mess',
  chr: '&',
  fg: '#7d6',
  maxHp: 10,
  mixins: ["HitPoints"]
});

EntityFactory.learn({
  templateName: 'briar',
  descr: 'a sharp, twisty, windy mess',
  chr: '#',
  fg: '#7d6',
  maxHp: 10,
  meleeThornDamage: 3,
  mixins: ["HitPoints","MeleeThorns"]
});
