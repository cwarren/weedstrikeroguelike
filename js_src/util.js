// various generally useful functions

import {DATASTORE} from './datastore.js';

// get a string of random characters
let randStringCharSource = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
export function randomString(len = 8) {
  var res='';
    for (var i=0; i<len; i++) {
        res += randStringCharSource.random();
    }
    return res;
}

// get a string of random characters that's unique to a given game instance
export function uniqueId() {
  DATASTORE.ID_SEQ++;
  return `${DATASTORE.ID_SEQ}-${randomString()}`;
}

// create (and return) a 2D array that's been initialized with a given value
export function init2DArray(x=1,y=1,initVal='') {
  var a = [];
  for (var xdim=0; xdim < x; xdim++) {
    a.push([]);
    for (var ydim=0; ydim < y; ydim++) {
      a[xdim].push(initVal);
    }
  }
  return a;
}