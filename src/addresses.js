/**
 * Module VEIBLIKK_address
 * 
 * Gets coordinates for route endpoints.
 * 
 * - calls VEIBLIKK_route.get_route;
 * 
 * https://github.com/sverres/veiblikk
 * 
 * sverre.stikbakke 27.11.2017
 */

var t0 = null;
var t_s = null;
var t_e = null;

var VEIBLIKK_address = (function () {

  var address_API = 'https://www.norgeskart.no/ws/adr.py?';

  var route_points = {
    'start_x': null,
    'start_y': null,
    'destination_x': null,
    'destination_y': null
  };


  var proj4_25832_to_25833 = function (x, y) {
    return proj4('EPSG:25832', 'EPSG:25833', [x, y]);
  };


  var parse_address_JSON = function (address_JSON) {
    var address = JSON.parse(address_JSON)[0];
    if (address == null) {
      return false;
    } else {
      var address_x = parseFloat(address['LONGITUDE']);
      var address_y = parseFloat(address['LATITUDE']);
      var address_point = proj4_25832_to_25833(address_x, address_y);
      return address_point;
    };
  };


  var get_starting_point = function () {
    VEIBLIKK_messages.ux_message(
      '#status_message',
      'Finner fra-adresse . .',
      'working_on_addresses');

    t0 = performance.now();

    Bliss.fetch(address_API + encodeURI(start_address))
      .then(store_starting_point)
      .catch(get_starting_point_error);
  };


  var store_starting_point = function (xhr) {
    t_s = performance.now();
    VEIBLIKK_messages.ux_debug(
      '#debug_data',
      'Time starting_point: ' +
      parseFloat(t_s - t0).toFixed(0) + ' ms');
    var start_address_JSON = xhr.response;
    var start_point = parse_address_JSON(start_address_JSON);
    if (start_point == false) {
      VEIBLIKK_messages.ux_message(
        '#status_message',
        'Finner ikke fra-adresse (gatenavn husnummer, sted)',
        'error');
      return false;
    } else {
      route_points['start_x'] = start_point[0];
      route_points['start_y'] = start_point[1];
      get_destination_point();
    };
  };


  var get_starting_point_error = function (error) {
    t_e = performance.now();
    VEIBLIKK_messages.ux_debug(
      '#debug_data',
      'Time starting_point_error: ' +
      parseFloat(t_e - t0).toFixed(0) + ' ms');
    VEIBLIKK_messages.ux_message(
      '#status_message',
      'Feil i fra-adresse-søk: ' + error,
      'error');
  };


  var get_destination_point = function () {
    VEIBLIKK_messages.ux_message(
      '#status_message',
      'Finner til-adresse . .',
      'working_on_addresses');

    t0 = performance.now();

    Bliss.fetch(address_API + encodeURI(destination_address))
      .then(store_destination_point)
      .catch(get_destination_point_error);
  };


  var store_destination_point = function (xhr) {
    var t_s = performance.now();
    VEIBLIKK_messages.ux_debug(
      '#debug_data',
      'Time destination_point: ' +
      parseFloat(t_s - t0).toFixed(0) + ' ms');
    var destination_address_JSON = xhr.response;
    var destination_point = parse_address_JSON(destination_address_JSON);
    if (destination_point == false) {
      VEIBLIKK_messages.ux_message(
        '#status_message',
        'Finner ikke til-adresse (gatenavn husnummer, sted)',
        'error');
      return false;
    } else if (turf.booleanEqual(
      turf.point(destination_point),
      turf.point([route_points['start_x'], route_points['start_y']]))) {
      VEIBLIKK_messages.ux_message(
        '#status_message',
        'Fra- og til-adresse gir samme resultat',
        'error');
      return false;
    } else {
      route_points['destination_x'] = destination_point[0];
      route_points['destination_y'] = destination_point[1];
      VEIBLIKK_route.get_route();
    };
  };


  var get_destination_point_error = function (error) {
    console.log(store_destination_point);
    t_e = performance.now();
    VEIBLIKK_messages.ux_debug(
      '#debug_data',
      'Time destination_point_error: ' +
      parseFloat(t_e - t0).toFixed(0) + ' ms');
    VEIBLIKK_messages.ux_message(
      '#status_message',
      'Feil i til-adresse-søk: ' + error,
      'error');
  };


  return {
    route_points: route_points,
    get_starting_point: get_starting_point
  };

}());