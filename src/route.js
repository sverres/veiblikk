/**
 * Module VEIBLIKK_route
 * 
 * Gets route data from route API.
 * 
 * - displays route on map
 * - displays route data
 * - exports route data to webcams module 
 *    with VEIBLIKK_webcams.import_route function
 * - calls VEIBLIKK_webcams.get_cctvs_file
 * 
 * https://github.com/sverres/veiblikk
 * 
 * sverre.stikbakke 27.11.2017
 */

var VEIBLIKK_route = (function () {

  var t_s = null;

  var route = null;

  var proj4_25833_to_4326 = function (x, y) {
    return proj4('EPSG:25833', 'EPSG:4326', [x, y]);
  };


  var get_route = function () {

    VEIBLIKK_messages.ux_message(
      '#status_message',
      'Finner reiserute . .',
      'working_on_route');

    VEIBLIKK_messages.ux_message(
      '#travel_data',
      '&nbsp;',
      'no_data');

    $('#webcams').empty();

    if (map.getLayer('svv_route')) {
      map.removeLayer('svv_route');
      map.removeSource('svv_route');
    };

    var stops =
      VEIBLIKK_address.route_points['start_x'] + ',' +
      VEIBLIKK_address.route_points['start_y'] + ';' +
      VEIBLIKK_address.route_points['destination_x'] + ',' +
      VEIBLIKK_address.route_points['destination_y'];

    var route_API =
      'https://www.vegvesen.no/ws/no/vegvesen/' +
      'ruteplan/routingService_v1_0/routingService' + '?' +
      'stops=' + stops + '&' +
      'returnDirections=false' + '&' +
      'returnGeometry=true' + '&' +
      'route_type=best' + '&' +
      'format=json';

    t0 = performance.now();

    $.ajax({
      url: route_API,
      type: 'POST',
      timeout: 50000
    })
      .done(display_route_data)
      .fail(get_route_error);
  };


  var display_route_data = function (directions_JSON) {

    t_s = performance.now();
    VEIBLIKK_messages.ux_debug(
      '#debug_data',
      'Time route_data: ' +
      parseFloat(t_s - t0).toFixed(0) + ' ms');

    if (directions_JSON == false) {
      VEIBLIKK_messages.ux_message(
        '#status_message',
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
      'show_data');

    // Short timeout to avoid map freeze
    setTimeout(get_webcams, 500);

  };


  var get_route_error = function (ajax_object) {
    t_e = performance.now();
    VEIBLIKK_messages.ux_debug(
      '#debug_data',
      'Time get_route_error: ' +
      parseFloat(t_e - t0).toFixed(0) + ' ms');
    VEIBLIKK_messages.ux_message(
      '#status_message',
      'Feil i ruteberegningen: ' +
      ajax_object.statusText + ' ' +
      (ajax_object.errorThrown || ''),
      'error');
  };


  var get_webcams = function () {
    VEIBLIKK_webcams.import_route(route);
    VEIBLIKK_webcams.get_cctvs_file();
  };


  return {
    get_route: get_route
  };

}());