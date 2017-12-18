// let ROT = require ('rot-js');
// import ROT from 'rot-js';
import 'babel-polyfill';
import {utilAlert} from './util.js';
// import {ROT} from 'rot-js';
import ROT from 'rot-js';
// let ROT = require('rot-js');
// let U = require("./util.js");


console.dir(ROT);
// console.dir(U);

// let imported ={'rot': ROT, 'u': U};

console.dir(this);

alert("ROT support status: "+ROT.isSupported());

let name = "Bob", time = "today";
console.log(`Hello ${name}, how are you ${time}?`);

// console.log(U.uniqueIdString());
utilAlert();

// console.log(U);
// console.log(U.utilAlert);
// console.log(U.utilAlert());
// 
// let V = U;
// console.log(V);

let x = 10;