/**
 * Module index
 * 
 * App entry point. 
 * Adds event listeners to ui.
 * Calls get_starting_point in addresses module.
 * Exports addresses from text boxes.
 * 
 * https://github.com/sverres/veiblikk
 * 
 * sverre.stikbakke 22.10.2018
 */

import { get_starting_point } from "./addresses.js";

let start_address = null;
let destination_address = null;

const search_button = document.querySelector('#search_button');
search_button.addEventListener('click', () => {
  start_address = document.querySelector('#start_address').value;
  destination_address = document.querySelector('#destination_address').value;
  get_starting_point();
});

const about_link = document.querySelector("#about_link");
about_link.addEventListener('click', () => {
  document.querySelector("#about").style.visibility = 'visible';
});

const about = document.querySelector("#about");
about.addEventListener('click', () => {
  document.querySelector("#about").style.visibility = 'hidden';
});

export { start_address, destination_address };