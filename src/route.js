/**
 * Module VEIBLIKK_route
 * 
 * Gets route data from route API.
 * 
 * - displays route on map
 * - displays route data
 * 
 * https://github.com/sverres/veiblikk
 * 
 * sverre.stikbakke 27.11.2017
 */

var VEIBLIKK_route = (function () {


  var proj4_25833_to_4326 = function (x, y) {
    return proj4('EPSG:25833', 'EPSG:4326', [x, y]);
  };


  var get_route = function (route_points) {

    VEIBLIKK_messages.ux_message(
      '#status_message',
      'Finner reiserute . .',
      'working_on_route'
    );

    VEIBLIKK_messages.ux_message(
      '#travel_data',
      '&nbsp;',
      'no_data'
    );

    var webcams = Bliss('#webcams');
    while (webcams.lastChild) {
      webcams.removeChild(webcams.lastChild);
    };

    if (map.getLayer('svv_route')) {
      map.removeLayer('svv_route');
      map.removeSource('svv_route');
    };

    var stops =
      route_points['start_x'] + ',' +
      route_points['start_y'] + ';' +
      route_points['destination_x'] + ',' +
      route_points['destination_y'];

    var route_API_request =
      'https://www.vegvesen.no/ws/no/vegvesen/' +
      'ruteplan/routingService_v1_0/routingService' + '?' +
      'stops=' + stops + '&' +
      'returnDirections=false' + '&' +
      'returnGeometry=true' + '&' +
      'route_type=best' + '&' +
      'format=json';

    Bliss.fetch(route_API_request)
      .then(display_route_data)
      .catch(get_route_error);
  };


  var display_route_data = function (xhr) {

    var directions_JSON = xhr.response;

    if (directions_JSON == false) {
      VEIBLIKK_messages.ux_message(
        '#status_message',
        'Ruteberegningen gav ikke noe resultat. Ukjent feil. Avslutter.',
        'error');
      return false;
    };

    var directions = JSON.parse(directions_JSON);

    var vertices = [];

    Bliss.each(directions.routes.features[0].geometry.paths[0],
      function (index, vertice) {
        vertices.push(proj4_25833_to_4326(vertice[0], vertice[1]));
      }
    );

    route = turf.lineString(vertices);
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

    var travel_meters = directions.routes.features[0].attributes.Total_Meters;
    var travel_km = (parseFloat(travel_meters) * 0.001).toFixed(1);

    var travel_minutes = directions.routes.features[0].attributes.Total_Minutes;
    var hours = Math.floor(parseFloat(travel_minutes) / 60);
    var minutes = (parseFloat(travel_minutes) % 60).toFixed(0);

    if (minutes == 60) {
      minutes = 0;
      hours = hours + 1;
    };

    var travel_data =
      hours + ' t ' + minutes + ' min' +
      '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
      travel_km + ' km';

    VEIBLIKK_messages.ux_message(
      '#travel_data',
      travel_data,
      'show_data'
    );

    VEIBLIKK_messages.ux_message(
      '#status_message',
      'Finner webkamerabilder . . . .',
      'working_on_images'
    );

    // Short timeout to avoid map freeze
    setTimeout(function () {
      VEIBLIKK_webcams.make_segments(route);
    }, 700);
  };


  var get_route_error = function (error) {

    VEIBLIKK_messages.ux_message(
      '#status_message',
      'Feil i ruteberegningen: ' + error,
      'error');
  };


  return {
    get_route: get_route
  };

}());