/**
 * Module VEIBLIKK_webcams
 * 
 * Gets webcam locations along route.
 * 
 * Makes buffers on route segments and selects 
 * webcam locations by pointInPolygon function.
 * 
 * Locations are snapped to route linestring by
 * nearestPointOnLine function, and sorted 
 * by distance from startpoint.
 * 
 * Webcam location info is in static XML file.
 * 
 * https://github.com/sverres/veiblikk
 * 
 * sverre.stikbakke 27.11.2017
 */

var VEIBLIKK_webcams = (function () {

  var t0 = null;
  var t_s = null;

  var route = null;


  var import_route = function (exported_route) {
    route = exported_route;
  };


  var get_cctvs_file = function () {
    VEIBLIKK_messages.ux_message(
      '#status_message',
      'Finner webkamerabilder . . . .',
      'working_on_images');

    t0 = performance.now();

    Bliss.fetch('GetCCTVSiteTable.xml')
      .then(get_cctv_locations)
      .catch(get_cctvs_file_error);
  };


  var get_cctv_locations = function (xhr) {
    t_s = performance.now();

    VEIBLIKK_messages.ux_debug(
      '#debug_data',
      'Time get_cctvs_file: ' +
      parseFloat(t_s - t0).toFixed(0) + ' ms');

    t0 = performance.now();

    var cctv_xml = xhr.responseXML;

    var option_units_meters = {
      units: 'meters'
    };
    var option_units_kilometers = {
      units: 'kilometers'
    };

    var buffer_width = 50;

    /** 
     * Split route in short segments to increase
     * performance in PointInPolygon function.
     * 30 km segments may be a sweet spot.
     */

    var segment_lenght = 30;

    var route_segments = turf.lineChunk(
      route,
      segment_lenght,
      option_units_kilometers);

    var cctv_locations = [];

    Bliss.each(route_segments.features,
      function (index, route_segment) {
        var route_buffer = turf.buffer(
          route_segment,
          buffer_width,
          option_units_meters);

        var cctvs = cctv_xml
          .getElementsByTagName('cctvCameraMetadataRecord');

        for (var i = 0; i < cctvs.length; i++) {
          var xml_element = cctvs[i];

          var cctv_lon = parseFloat(xml_element
            .getElementsByTagName('longitude')[0]
            .firstChild.nodeValue);

          var cctv_lat = parseFloat(xml_element
            .getElementsByTagName('latitude')[0]
            .firstChild.nodeValue);

          var cctv_point = turf.point([cctv_lon, cctv_lat]);

          if (turf.booleanPointInPolygon(cctv_point, route_buffer)) {

            var cctv_snapped = turf.nearestPointOnLine(
              route,
              cctv_point,
              option_units_kilometers);

            var cctvStillImageService = xml_element
              .getElementsByTagName('cctvStillImageService')[0];

            var stillImageUrl = cctvStillImageService
              .getElementsByTagName('urlLinkAddress')[0]
              .firstChild.nodeValue;

            var urlLinkAddress = cctvStillImageService
              .getElementsByTagName('value')[0]
              .firstChild.nodeValue;

            cctv_snapped['properties']['stillImageUrl'] = stillImageUrl;
            cctv_snapped['properties']['urlLinkDescription'] = urlLinkAddress;

            cctv_locations.push(cctv_snapped);
          };
        };
      }
    );

    cctv_locations.sort(function (distance_1, distance_2) {
      return parseFloat(distance_1['properties']['location']) -
        parseFloat(distance_2['properties']['location']);
    });

    t_s = performance.now();
    VEIBLIKK_messages.ux_debug(
      '#debug_data',
      'Time get_cctv_locations: ' +
      parseFloat(t_s - t0).toFixed(0) + ' ms');

    VEIBLIKK_messages.ux_debug(
      '#debug_data',
      '-----------');

    VEIBLIKK_messages.ux_message(
      '#status_message',
      'Fant ' + cctv_locations.length + ' webkamerabilder',
      'idle');

    Bliss.each(cctv_locations,
      function (index, webcam) {
        var distance = parseFloat(webcam['properties']['location']).toFixed(0);
        var web_image_url = webcam['properties']['stillImageUrl'];
        var yr_url = webcam['properties']['urlLinkDescription'];

        var svv_image = document.createElement('div');
        svv_image.className = 'svv_image';
        svv_image.innerHTML =
          '<div class="svv_image"><h4>' + distance + ' km</h4>' +
          '<p><img src="' + web_image_url + '" /></p>' +
          '<p><a href="' + yr_url + '" target="_blank">' +
          decodeURI(yr_url) + '</a></p></div>';
        var webcams = document.getElementById('webcams');
        webcams.appendChild(svv_image);
      }
    );
  };


  var get_cctvs_file_error = function (error) {
    VEIBLIKK_messages.ux_message(
      '#status_message',
      'Får ikke hentet webkamera-info. ' + error,
      'error');
  };


  return {
    get_cctvs_file: get_cctvs_file,
    import_route: import_route
  };

}());