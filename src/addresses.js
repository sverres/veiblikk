var VEIBLIKK_address = (function () {

  var route_points = {
    'start_x': null,
    'start_y': null,
    'destination_x': null,
    'destination_y': null
  };

  var start_address = null;
  var destination_address = null;


  $('#search_button').click(function () {
    start_address = $('#start_address').val();
    destination_address = $('#destination_address').val();
    get_starting_point();
  });


  var proj4_25832_to_25833 = function (x, y) {
    return proj4("EPSG:25832", "EPSG:25833", [x, y]);
  };


  var parse_address_JSON = function (address_JSON) {
    var address = $.parseJSON(address_JSON)[0];
    if (address == null) {
      return false;
    } else {
      var address_x = parseFloat(address["LONGITUDE"]);
      var address_y = parseFloat(address["LATITUDE"]);
      var address_point = proj4_25832_to_25833(address_x, address_y);
      return address_point;
    };
  };


  var get_starting_point = function () {
    $.ajax({
      url: 'https://www.norgeskart.no/ws/adr.py?' + encodeURI(start_address),
      success: get_starting_point_success,
      error: get_starting_point_error
    });
  };


  var get_starting_point_success = function (start_address_JSON) {
    var start_point = parse_address_JSON(start_address_JSON);
    if (start_point == false) {
      alert('Finner ikke start-adresse. Skrives som "gatenavn husnummer, sted"');
      return false;
    } else {
      route_points['start_x'] = start_point[0];
      route_points['start_y'] = start_point[1];
      get_destination_point();
    }
  }


  var get_starting_point_error = function () {
    alert("Ukjent feil i fra-adresse-søk");
  }


  var get_destination_point = function () {
    $.ajax({
      url: 'https://www.norgeskart.no/ws/adr.py?' + encodeURI(destination_address),
      success: get_destination_point_success,
      error: get_destination_point_error
    });
  };


  var get_destination_point_success = function (destination_address_JSON) {
    var destination_point = parse_address_JSON(destination_address_JSON);
    if (destination_point == false) {
      alert('Finner ikke til-adresse. Skrives som "gatenavn husnummer, sted"');
      return false;
    } else {
      route_points['destination_x'] = destination_point[0];
      route_points['destination_y'] = destination_point[1];
      VEIBLIKK_route.get_route();
    };
  };


  var get_destination_point_error = function () {
    alert("Ukjent feil i til-adresse-søk");
  }


  return { route_points };

}());