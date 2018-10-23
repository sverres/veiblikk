/**
 * Module messages
 * 
 * https://github.com/sverres/veiblikk
 * 
 * sverre.stikbakke 27.11.2017
 */

const ux_message = (selector, message, css_class) => {
  selector = Bliss(selector);
  while (selector.classList.length > 0) {
    selector.classList.remove(selector.classList[0]);
  };
  selector.classList.add(css_class);
  selector.innerHTML = message;
};


export { ux_message };