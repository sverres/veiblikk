/**
 * Module VEIBLIKK_messages
 * 
 * https://github.com/sverres/veiblikk
 * 
 * sverre.stikbakke 27.11.2017
 */

const VEIBLIKK_messages = (function () {

  const ux_message = function (selector, message, css_class) {
    selector = Bliss(selector);
    while (selector.classList.length > 0){
      selector.classList.remove(selector.classList[0]);
    };
    selector.classList.add(css_class);
    selector.innerHTML = message;
  };

  const ux_debug = function (selector, message) {
    selector = Bliss(selector);
    const msg = document.createElement('p');
    msg.innerHTML = message;
    selector.appendChild(msg);
  };

  return {
    ux_message: ux_message,
    ux_debug: ux_debug
  };

}());