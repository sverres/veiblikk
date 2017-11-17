var VEIBLIKK_route = (function () {

  var route = null;

  var proj4_25833_to_4326 = function (x, y) {
    return proj4("EPSG:25833", "EPSG:4326", [x, y]);
  };


  var get_route = function () {

    VEIBLIKK_messages.status_message(
      'Finner reiserute . .', 'working_on_route');    

    $('#webcams').empty();

    if (map.getLayer('svv_route')) {
      map.removeLayer('svv_route');
      map.removeSource('svv_route');
    };

    var stops = VEIBLIKK_address.route_points['start_x']
      + ',' + VEIBLIKK_address.route_points['start_y']
      + ';' + VEIBLIKK_address.route_points['destination_x']
      + ',' + VEIBLIKK_address.route_points['destination_y'];

    var route_API =
      'https://www.vegvesen.no/ws/no/vegvesen/'
      + 'ruteplan/routingService_v1_0/routingService?'
      + 'stops=' + stops + '&'
      + 'returnDirections=false&'
      + 'returnGeometry=true&'
      + 'route_type=best&'
      + 'format=json';

    $.ajax({
      url: route_API,
      success: get_route_success,
      error: get_route_error
    });
  };


  var get_route_success = function (directions_JSON) {

    if (directions_JSON == false) {
      VEIBLIKK_messages.status_message(
        'Ruteberegningen gav ikke noe resultat. Ukjent feil. Avslutter.',
        'error');      
      return false;
    };

    var directions = $.parseJSON(directions_JSON);

    var vertices = [];
    $(directions.routes.features[0].geometry.paths[0])
      .each(function (index, vertice) {
        vertices.push(proj4_25833_to_4326(vertice[0], vertice[1]));
      });

    var route = turf.lineString(vertices);
    map.addLayer({
      'id': 'svv_route',
      'type': 'line',
      'source': {
        'type': 'geojson',
        'data': route
      },
      'layout': {
        "line-join": "round",
        "line-cap": "round"
      },
      'paint': {
        "line-color": "#e94e1b",
        "line-width": 4
      }
    });
    var route_bbox = turf.bbox(route);
    map.fitBounds(route_bbox, {
      'padding': 25,
      'animate': false
    });

    VEIBLIKK_webcams.import_route(route);
    VEIBLIKK_webcams.get_cctvs_file();

  };


  var get_route_error = function () {
    VEIBLIKK_messages.status_message(
      'Ukjent feil i ruteberegningen. Avslutter.',
      'error');   
  }


  return { get_route: get_route };

}());