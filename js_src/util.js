export function utilTest() {
  console.log("this is a util function<br/>");
}

let randStringCharSource = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
export function randomString(len = 8) {
  var res='';
    for (var i=0; i<len; i++) {
        res += randStringCharSource.random();
    }
    return res;
}