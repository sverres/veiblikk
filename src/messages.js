var VEIBLIKK_messages = (function () {

  var status_message = function (message, css_class) {
    $('#status_message')
      .html(message)
      .removeClass()
      .addClass(css_class);
  };


  var travel_data_message = function (message, css_class) {
    $('#travel_data')
      .html(message)
      .removeClass()
      .addClass(css_class);
  };


  return {
    status_message: status_message,
    travel_data_message: travel_data_message
  };

}());