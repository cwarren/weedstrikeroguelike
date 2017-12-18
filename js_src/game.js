import 'babel-polyfill';
import {utilAlert} from './util.js';
import ROT from 'rot-js';

console.dir(ROT);

document.write("ROT support status: "+ROT.isSupported()+"<br/>");

let name = "Bob", time = "today";
console.log(`Hello ${name}, how are you ${time}?`);

utilAlert();
