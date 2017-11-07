var VEIBLIKK = (function () {

var from = null;
var to = null;

$('#search_button').click(function(){
  from = $('#from').val();
  to = $('#to').val();
  get_startpoint();
});

var get_startpoint = function () {
  $.ajax({
    url: 'http://www.norgeskart.no/ws/adr.py?' + encodeURI(from),
    success: get_startpoint_success
  });
};

var get_startpoint_success = function (start_address) {
  console.log(start_address);
  get_endpoint();
}

var get_endpoint = function () {
  $.ajax({
    url: 'http://www.norgeskart.no/ws/adr.py?' + encodeURI(to),
    success: get_endpoint_success
  });
};

var get_endpoint_success = function (destination_address) {
  console.log(destination_address);
}

}())