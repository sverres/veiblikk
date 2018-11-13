/**
 * Module VEIBLIKK_addresses
 * 
 * Gets coordinates for route endpoints:
 * 
 * Normal flow:
 * - get_starting_point called from click event in index module
 * - store_starting_point
 * - get_destination_point
 * - store_destination-point which finally calls
 *   get_route in route module
 * 
 * Helper functions:
 * - proj4_25832_to_25833 to reproject address coordinates
 * - parse_address_JSON to extract coordinates from API response
 * 
 * Side effects:
 * - status messages to UI
 * 
 * https://github.com/sverres/veiblikk
 * 
 * sverre.stikbakke 27.11.2017
 */

const VEIBLIKK_address = (function () {

  let start_address = null;
  let destination_address = null;

  const address_API = 'https://www.norgeskart.no/ws/adr.py?';

  const route_points = {
    'start_x': null,
    'start_y': null,
    'destination_x': null,
    'destination_y': null
  };


  const proj4_25832_to_25833 = function (x, y) {
    return proj4('EPSG:25832', 'EPSG:25833', [x, y]);
  };


  const parse_address_JSON = function (address_JSON) {
    const address = JSON.parse(address_JSON)[0];
    if (address == null) {
      return false;
    } else {
      const address_x = parseFloat(address['LONGITUDE']);
      const address_y = parseFloat(address['LATITUDE']);
      const address_point = proj4_25832_to_25833(address_x, address_y);
      return address_point;
    };
  };


  const get_starting_point = function (
    ui_input_start_address,
    ui_input_destination_address
  ) {
    VEIBLIKK_messages.ux_message(
      '#status_message',
      'Finner fra-adresse . .',
      'working_on_addresses');

    start_address = ui_input_start_address;
    destination_address = ui_input_destination_address;

    Bliss.fetch(address_API + encodeURI(start_address))
      .then(store_starting_point)
      .catch(get_starting_point_error);
  };


  const store_starting_point = function (xhr) {
    const start_address_JSON = xhr.response;
    const start_point = parse_address_JSON(start_address_JSON);
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


  const get_starting_point_error = function (error) {
    VEIBLIKK_messages.ux_message(
      '#status_message',
      'Feil i fra-adresse-søk: ' + error,
      'error')
  };


  const get_destination_point = function () {
    VEIBLIKK_messages.ux_message(
      '#status_message',
      'Finner til-adresse . .',
      'working_on_addresses'
    );

    Bliss.fetch(address_API + encodeURI(destination_address))
      .then(store_destination_point)
      .catch(get_destination_point_error);
  };


  const store_destination_point = function (xhr) {
    const destination_address_JSON = xhr.response;
    const destination_point = parse_address_JSON(destination_address_JSON);
    if (destination_point == false) {
      VEIBLIKK_messages.ux_message(
        '#status_message',
        'Finner ikke til-adresse (gatenavn husnummer, sted)',
        'error'
      );
      return false;
    } else if (turf.booleanEqual(
      turf.point(destination_point),
      turf.point([route_points['start_x'], route_points['start_y']]))) {
      VEIBLIKK_messages.ux_message(
        '#status_message',
        'Fra- og til-adresse gir samme resultat',
        'error'
      );
      return false;
    } else {
      route_points['destination_x'] = destination_point[0];
      route_points['destination_y'] = destination_point[1];
      setTimeout(function () {
        VEIBLIKK_route.get_route(route_points)
      }, 0)
    };
  };


  const get_destination_point_error = function (error) {
    VEIBLIKK_messages.ux_message(
      '#status_message',
      'Feil i til-adresse-søk: ' + error,
      'error')
  };


  return {
    get_starting_point: get_starting_point
  };

}());