import {get_starting_point} from "./addresses.js";

let start_address = null;
let destination_address = null;

let search_button = document.querySelector('#search_button');
search_button.addEventListener('click', () => {
  start_address = document.querySelector('#start_address').value;
  destination_address = document.querySelector('#destination_address').value;
  get_starting_point();
}
);

Bliss("#about_link").addEventListener(
  'click',
  function () {
    Bliss("#about").style.visibility = 'visible';
  }
);

Bliss("#about").addEventListener(
  'click',
  function () {
    Bliss("#about").style.visibility = 'hidden';
  }
);

export {start_address, destination_address};