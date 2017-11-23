var VEIBLIKK_messages = (function () {

  var ux_message = function (selector, message, css_class) {
    $(selector)
      .html(message)
      .removeClass()
      .addClass(css_class);
  };


  return { ux_message: ux_message };

}());