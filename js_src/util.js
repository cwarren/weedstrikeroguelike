
let randStringCharSource = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
export function randomString(len = 8) {
  var res='';
    for (var i=0; i<len; i++) {
        res += randStringCharSource.random();
    }
    return res;
}

let ID_SEQ = 0;
export function uniqueId() {
  ID_SEQ++;
  return `${ID_SEQ}-${randomString()}`;
}

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