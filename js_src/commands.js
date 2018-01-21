// key bindings and game commands

// a set of game commands, and the key bindings needed to issue those commands

export function getCommandFromInput(evtType, evtData) {
  if (evtType != 'keyup') { return COMMAND.NULLCOMMAND; }
  let bindingSet = `key:${evtData.key},altKey:${evtData.altKey},ctrlKey:${evtData.ctrlKey},shiftKey:${evtData.shiftKey}`;
  if (! BINDING_LOOKUPS[bindingSet]) { return COMMAND.NULLCOMMAND; }
  return BINDING_LOOKUPS[bindingSet];
}

// This is the set of command constants. It's populated via the setKeyBinding method.
export let COMMAND = {
  'NULLCOMMAND': 1
};

// This is used by the getCommandFromInput function to the value associated with a given key binding set. It's dynamically populated by the setKeyBinding function below.
let BINDING_LOOKUPS = {};

// takes a list of key binding names and sets up the commands and binding lookups - later items in the list override earlier ones, which allows a kind of hierarchical binding system
export function setKeyBinding(bindingNameList) {
  // ensure that bindingNameList is an array which has a first element of 'universal'
  if (typeof bindingNameList === 'string') {
    bindingNameList = [bindingNameList];
  }
  if (bindingNameList[0] != 'universal') {
    bindingNameList.unshift('universal');
  }
  // console.log('bindingNameList:');
  // console.dir(bindingNameList)

  let commandNumber = 1;
  COMMAND = {
    NULLCOMMAND: commandNumber
  };
  BINDING_LOOKUPS = {};

  for (let bni=0; bni<bindingNameList.length; bni++) {
    let bindingName = bindingNameList[bni];
    if (! KEY_BINDINGS.hasOwnProperty(bindingName)) { return; }
    for (let command in KEY_BINDINGS[bindingName]) {
      commandNumber++;
      COMMAND[command] = commandNumber;
      for (let bsi=0; bsi<KEY_BINDINGS[bindingName][command].length; bsi++) {
        BINDING_LOOKUPS[KEY_BINDINGS[bindingName][command][bsi]] = commandNumber;
      }
    }
  }
  // console.log('COMMAND');
  // console.dir(COMMAND);
  // console.log('BINDING_LOOKUPS');
  // console.dir(BINDING_LOOKUPS);
}

// these define the key bindings for the various game commands, though the actual lookup uses different object that's generated from this one.
// the keybindings are broken down by mode.
// within an mode the command is mapped to a list of key binding definitions, any of which will result in the given game command.
// the key binding definitions are a string, with the relevant key, altKey, ctrlKey, and shiftKey labels and values.
let KEY_BINDINGS = {
  'universal': {
    'CANCEL': ['key:Escape,altKey:false,ctrlKey:false,shiftKey:false'],
    'HELP': ['key:?,altKey:false,ctrlKey:false,shiftKey:true']
  },
  'persistence': {
    'NEW_GAME': ['key:n,altKey:false,ctrlKey:false,shiftKey:false',
                 'key:N,altKey:false,ctrlKey:false,shiftKey:true'],
    'SAVE_GAME': ['key:s,altKey:false,ctrlKey:false,shiftKey:false',
                'key:S,altKey:false,ctrlKey:false,shiftKey:true'],
    'LOAD_GAME': ['key:l,altKey:false,ctrlKey:false,shiftKey:false',
                'key:L,altKey:false,ctrlKey:false,shiftKey:true'],
  },
  'play': {
    'GAME_CONTROLS':['key:=,altKey:false,ctrlKey:false,shiftKey:false'],
    'MESSAGES':     ['key:M,altKey:false,ctrlKey:false,shiftKey:true']
  },
  'movement_numpad': {
    'MOVE_UL':  ['key:7,altKey:false,ctrlKey:false,shiftKey:false'],
    'MOVE_U':   ['key:8,altKey:false,ctrlKey:false,shiftKey:false'],
    'MOVE_UR':  ['key:9,altKey:false,ctrlKey:false,shiftKey:false'],
    'MOVE_L':   ['key:4,altKey:false,ctrlKey:false,shiftKey:false'],
    'MOVE_WAIT':['key:5,altKey:false,ctrlKey:false,shiftKey:false'],
    'MOVE_R':   ['key:6,altKey:false,ctrlKey:false,shiftKey:false'],
    'MOVE_DL':  ['key:1,altKey:false,ctrlKey:false,shiftKey:false'],
    'MOVE_D':   ['key:2,altKey:false,ctrlKey:false,shiftKey:false'],
    'MOVE_DR':  ['key:3,altKey:false,ctrlKey:false,shiftKey:false']
  },
  'textnav': {
    'LINE_UP':   ['key:ArrowUp,altKey:false,ctrlKey:false,shiftKey:false'],
    'LINE_DOWN': ['key:ArrowDown,altKey:false,ctrlKey:false,shiftKey:false'],
    'PAGE_UP':   ['key:ArrowUp,altKey:false,ctrlKey:false,shiftKey:true'],
    'PAGE_DOWN': ['key:ArrowDown,altKey:false,ctrlKey:false,shiftKey:true']
  }
};

