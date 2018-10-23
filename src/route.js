/**
 * Module route
 * 
 * Gets route data from route API.
 * 
 * - displays route on map
 * - exports route data 
 * 
 * https://github.com/sverres/veiblikk
 * 
 * sverre.stikbakke 27.11.2017
 */

import { route_points } from "./addresses.js";
import { make_segments } from "./webcams.js";
import { ux_message } from "./messages.js"

let route = null;

const line_width = 4;
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

  const webcams = Bliss('#webcams');
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
    'https://www.vegvesen.no/ws/no/vegvesen/' +
    'ruteplan/routingService_v1_0/routingService' + '?' +
    'stops=' + stops + '&' +
    'returnDirections=false' + '&' +
    'returnGeometry=true' + '&' +
    'route_type=best' + '&' +
    'format=json';

  Bliss.fetch(route_API_request, {
    responseType: 'json'
  })
    .then(display_route_data)
    .catch(get_route_error);
};


const display_route_data = xhr => {

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

  ux_message(
    '#status_message',
    'Finner webkamerabilder . . . .',
    'working_on_images'
  );

  // Short timeout to avoid map freeze
  setTimeout(make_segments, draw_route_timeout);
};


const get_route_error = error =>
  ux_message(
    '#status_message',
    'Feil i ruteberegningen: ' + error,
    'error');


export { get_route, route };