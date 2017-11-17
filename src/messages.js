var VEIBLIKK_messages = (function () {
  
    var status_message = function (message, css_class) {
      $('#status_message')
      .html(message)
      .removeClass()
      .addClass(css_class);
    };
  
  
    return { status_message: status_message };
  
  }());