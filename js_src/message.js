// encapsulates sending messages/notes to the player
import {Color} from './colors.js';

export let Message = {
  _messageQueue: [],
  _maxArchiveSize: 100,
  _targetDisplay: '',
  _fades: ['#fff','#ddd','#bbb','#999','#777','#555'],
  init: function(targetDisplay) {
    this._targetDisplay = targetDisplay;
  },
  render: function () {
    if (! this._targetDisplay.o) { return; }
    this._targetDisplay.o.clear();
    let y = 0;
    let mi = 0;
    while (y<this._targetDisplay.h &&
           mi<this._targetDisplay.h &&
           this._messageQueue[mi])
    {
      if (this._messageQueue[mi].age < this._fades.length) {
        let msgColor = '%c{'+this._fades[this._messageQueue[mi].age]+'}';
        y += Math.max(1,this._targetDisplay.o.drawText(1,y,`${msgColor}${this._messageQueue[mi].txt}${Color.DEFAULT}`));
      }
      mi++;
    }
  },
  renderOn: function(display) {
    // this is a more generic, simple render process, which
    // skips all the aging stuff
    display.clear();
    let y = 0;
    let mi = 0;
    let yMax = display.getOptions().height - 1;
    while (y<yMax && mi<yMax && this._messageQueue[mi])
    {
      y += Math.max(1,display.drawText(1,y,this._messageQueue[mi].txt));
      mi++;
    }
  },
  send: function (msg) {
    this._messageQueue.unshift({'txt':msg,'age':0});
    while (this._messageQueue.length > this._maxArchiveSize) {
      this._messageQueue.pop();
    }
  },
  clear: function () {
    this._messageQueue = '';
  },
  ageMessages: function() {
    for (let i=0;i<10;i++) {
      if (this._messageQueue[i] && this._messageQueue[i].age < this._fades.length) {
        this._messageQueue[i].age++;
      }
    }
  }
};
console.log('Message:');
console.dir(Message);