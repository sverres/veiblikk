/**
 * Module addresses
 * 
 * Gets coordinates for route endpoints:
 * 
 * Normal flow:
 * - imports adresses from index module
 * - imports get_route from route module
 * - get_starting_point called from click event in index module
 * - store_starting_point
 * - get_destination_point
 * - store_destination-point which finally calls
 *   get_route in route module
 * - exports route_points object, get_starting_point function
 * 
 * Helper functions:
 * - proj4_25832_to_25833 to reproject address coordinates
 * - parse_address_JSON to extract coordinates from API response
 * 
 * Side effects:
 * - status messages to ui
 * 
 * https://github.com/sverres/veiblikk
 * 
 * sverre.stikbakke 27.11.2017
 */

import { start_address, destination_address } from "./index.js";
import { get_route } from "./route.js";
import { ux_message } from "./messages.js"

var address_API = 'https://ws.geonorge.no/adresser/v1/sok?sok=';
var address_hits = '&treffPerSide=1';

const route_points = {
    'start_x': null,
    'start_y': null,
    'destination_x': null,
    'destination_y': null
};


var proj4_4258_to_25833 = function (x, y) {
    return proj4('EPSG:4258', 'EPSG:25833', [x, y]);
};


var parse_address_JSON = function (address_JSON) {
    var address = JSON.parse(address_JSON);
    if (address == null) {
        return false;
    } else {
        var address_x = parseFloat(address.adresser[0].representasjonspunkt.lon);
        var address_y = parseFloat(address.adresser[0].representasjonspunkt.lat);
        var address_point = proj4_4258_to_25833(address_x, address_y);
        return address_point;
    };
};


const get_starting_point = () => {
    ux_message(
        '#status_message',
        'Finner fra-adresse . .',
        'working_on_addresses');

    Bliss.fetch(address_API + encodeURI(start_address) + address_hits)
        .then(store_starting_point)
        .catch(get_starting_point_error);
};


const store_starting_point = xhr => {
    const start_address_JSON = xhr.response;
    const start_point = parse_address_JSON(start_address_JSON);
    if (start_point == false) {
        ux_message(
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


const get_starting_point_error = error =>
    ux_message(
        '#status_message',
        'Feil i fra-adresse-søk: ' + error,
        'error');


var get_destination_point = function () {
    ux_message(
        '#status_message',
        'Finner til-adresse . .',
        'working_on_addresses'
    );

    Bliss.fetch(address_API + encodeURI(destination_address) + address_hits)
        .then(store_destination_point)
        .catch(get_destination_point_error);
};


var store_destination_point = function (xhr) {

    var destination_address_JSON = xhr.response;
    var destination_point = parse_address_JSON(destination_address_JSON);
    if (destination_point == false) {
        ux_message(
            '#status_message',
            'Finner ikke til-adresse (gatenavn husnummer, sted)',
            'error'
        );
        return false;
    } else if (turf.booleanEqual(
        turf.point(destination_point),
        turf.point([route_points['start_x'], route_points['start_y']]))) {
        ux_message(
            '#status_message',
            'Fra- og til-adresse gir samme resultat',
            'error'
        );
        return false;
    } else {
        route_points['destination_x'] = destination_point[0];
        route_points['destination_y'] = destination_point[1];
        setTimeout(function () {
            get_route(route_points);
        }, 0);
    };
};


const get_destination_point_error = error =>
    ux_message(
        '#status_message',
        'Feil i til-adresse-søk: ' + error,
        'error');


export { get_starting_point };