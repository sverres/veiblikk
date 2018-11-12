/**
 * Module VEIBLIKK_index
 * 
 * App entry point. 
 * Adds event listeners to ui.
 * Calls get_starting_point in address module.
 * Exports addresses from text boxes.
 * 
 * https://github.com/sverres/veiblikk
 * 
 * sverre.stikbakke 22.10.2018
 */

const VEIBLIKK_index = (function () {

  let start_address = null;
  let destination_address = null;

  const search_button = document.querySelector('#search_button');
  search_button.addEventListener('click', function () {
    start_address = document.querySelector('#start_address').value;
    destination_address = document.querySelector('#destination_address').value;
    VEIBLIKK_address.get_starting_point(start_address, destination_address);
  });

  const about_link = document.querySelector("#about_link");
  about_link.addEventListener('click', function () {
    document.querySelector("#about").style.visibility = 'visible';
  });

  const about = document.querySelector("#about");
  about.addEventListener('click', function () {
    document.querySelector("#about").style.visibility = 'hidden';
  });

}());