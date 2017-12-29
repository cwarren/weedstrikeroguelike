// a display symbol that can have mixins to add functionality

import {DisplaySymbol} from './display_symbol.js';

export class MixableSymbol extends DisplaySymbol {
  constructor(template) {
    super(template);
    if (! ('attr' in this)) { this.attr = {}; }   
  }
}