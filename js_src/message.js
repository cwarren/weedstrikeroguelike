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
    if (! this._targetDisplay) { return; }
    this._targetDisplay.clear();
    let y = 0;
    let mi = 0;
    while (y<6) {
      console.log(`y =  ${y}`);
      y += Math.max(1,this._targetDisplay.drawText(1,y,'%c{'+this._fades[mi]+'}'+
                                                   (this._messageQueue[mi]||'')+
                                                   Color.DEFAULT));
      mi++;
    }
  },
  send: function (msg) {
    this._messageQueue.unshift(msg);
    while (this._messageQueue.length > this._maxArchiveSize) {
      this._messageQueue.pop();
    }
    this.render();
  },
  clear: function () {
    this._messageQueue = '';
  }
};