// encapsulates sending messages/notes to the player

export let Message = {
  _curMessage: '',
  _targetDisplay: '',
  init: function(targetDisplay) {
    this._targetDisplay = targetDisplay;
  },
  render: function () {
    if (! this._targetDisplay) { return; }
    this._targetDisplay.clear();
    this._targetDisplay.drawText(1,1,this._curMessage,'#fff','#000');
  },
  send: function (msg) {
    this._curMessage = msg;
    this.render();
  },
  clear: function () {
    this._curMessage = '';
  }
};