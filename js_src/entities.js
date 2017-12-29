import {Entity} from './entity.js';
import {Factory} from './factory.js';

export let EntityFactory = new Factory('entities', Entity);

EntityFactory.learn({
  name: 'avatar',
  descr: 'a mighty gardener',
  chr: '@',
  fg: '#ee1'
});
