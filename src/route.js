/**
 * Module route
 * 
 * Gets route data from route API.
 * 
 * - displays route on map
 * - exports route data
 * 
 * Normal flow:
 * - route_points object imported from adresses module
 * - get_route is called from store_destination_point
 *   in adresses module
 * - display_route updates the map
 * - exports route GeoJSON object
 * 
 * Side effects:
 * - data from previous calculations removed from map and DOM tree
 * - status messages to ui
 * - route data to ui
 * - map update
 * 
 * https://github.com/sverres/veiblikk
 * 
 * sverre.stikbakke 27.11.2017
 */

import { route_points } from "./addresses.js";
import { make_segments } from "./webcams.js";
import { ux_message } from "./messages.js"

let route = null;

const line_width = 4; //pixels
const line_color = "#e94e1b";
const route_padding = 25; //pixels
const draw_route_timeout = 700; //ms

const proj4_25833_to_4326 =
  (x, y) => proj4('EPSG:25833', 'EPSG:4326', [x, y]);


const get_route = () => {
  ux_message(
    '#status_message',
    'Finner reiserute . .',
    'working_on_route'
  );

  ux_message(
    '#travel_data',
    '&nbsp;',
    'no_data'
  );

  const webcams = document.querySelector('#webcams');
  while (webcams.lastChild) {
    webcams.removeChild(webcams.lastChild);
  };

  if (map.getLayer('svv_route')) {
    map.removeLayer('svv_route');
    map.removeSource('svv_route');
  };

  const stops =
    route_points['start_x'] + ',' +
    route_points['start_y'] + ';' +
    route_points['destination_x'] + ',' +
    route_points['destination_y'];

  const route_API_request =
    'https://www.vegvesen.no/ws/no/vegvesen/'
    + 'ruteplan/routingService_v1_0/routingService?'
    + 'stops=' + stops + '&'
    + 'returnDirections=false&'
    + 'returnGeometry=true&'
    + 'route_type=best&'
    + 'format=json';

  const route_API_response_type = { 'responseType': 'json' };

  Bliss.fetch(route_API_request, route_API_response_type)
    .then(display_route)
    .catch(get_route_error);
};


const display_route = xhr => {
  var directions = xhr.response;

  if (directions == false) {
    ux_message(
      '#status_message',
      'Ruteberegningen gav ikke noe resultat. Ukjent feil. Avslutter.',
      'error');
    return false;
  };

  const vertices = [];

  directions.routes.features[0].geometry.paths[0].map(
    vertice => vertices.push(proj4_25833_to_4326(vertice[0], vertice[1])));

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
      "line-color": line_color,
      "line-width": line_width
    }
  });
  const route_bbox = turf.bbox(route);
  map.fitBounds(route_bbox, {
    'padding': route_padding,
    'animate': false
  });

  const travel_meters = directions.routes.features[0].attributes.Total_Meters;
  const travel_km = (parseFloat(travel_meters) * 0.001).toFixed(1);

  const travel_minutes = directions.routes.features[0].attributes.Total_Minutes;
  let hours = Math.floor(parseFloat(travel_minutes) / 60);
  let minutes = (parseFloat(travel_minutes) % 60).toFixed(0);

  if (minutes == 60) {
    minutes = 0;
    hours = hours + 1;
  };

  const travel_data =
    hours + ' t ' + minutes + ' min' +
    '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
    travel_km + ' km';

  ux_message(
    '#travel_data',
    travel_data,
    'show_data'
  );

  // Short timeout to avoid ui freeze
  setTimeout(make_segments, draw_route_timeout);
};


const get_route_error = error =>
  ux_message(
    '#status_message',
    'Feil i ruteberegningen: ' + error,
    'error');


export { get_route, route };