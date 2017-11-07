var VEIBLIKK_route = (function () {

  var route = {};

  var proj4_25833_to_4326 = function (x, y) {
    return proj4("EPSG:25833", "EPSG:4326", [x, y]);
  };


  var get_route = function () {

    var stops = VEIBLIKK_address.route_points['start_x']
      + ',' + VEIBLIKK_address.route_points['start_y']
      + ';' + VEIBLIKK_address.route_points['destination_x']
      + ',' + VEIBLIKK_address.route_points['destination_y'];

    var route_API =
      'https://www.vegvesen.no/ws/no/vegvesen/ruteplan/routingService_v1_0/routingService?'
      + 'stops=' + stops + '&'
      + 'returnDirections=false&'
      + 'returnGeometry=true&'
      + 'route_type=best&'
      + 'format=json'

    $.ajax({
      url: route_API,
      success: get_route_success
    });
  };


  var get_route_success = function (directions_JSON) {

    var vertices = [];

    var directions = jQuery.parseJSON(directions_JSON);

    for (vertice in directions.routes.features[0].geometry.paths[0]) {
      vertices.push(proj4_25833_to_4326(
        directions.routes.features[0].geometry.paths[0][vertice][0],
        directions.routes.features[0].geometry.paths[0][vertice][1])
      );
    };

    console.log('vertices.length: ' + vertices.length);

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
        "line-color": "#FF8C00",
        "line-width": 4
      }
    });

    VEIBLIKK_webcams.find_cctvs(route);

  };

  return {
    get_route
  }

}());