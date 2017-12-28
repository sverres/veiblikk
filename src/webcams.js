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
  var route_segment = null;
  var route_segments = null;
  var segment_index = null;

  var cctv_JSON = null;
  var cctv_locations_route = null;

  var option_units_meters = {
    units: 'meters'
  };

  var option_units_kilometers = {
    units: 'kilometers'
  };

  var segment_length = 30;
  var buffer_width = 50;


  var preprocess_cctv_locations = function (xhr) {
    cctv_JSON = parser.parse(xhr.response);
  };


  var import_route = function (exported_route) {
    route = exported_route;
    setTimeout(make_segments, 0);
  };


  var make_segments = function () {
    segment_index = 0;
    cctv_locations_route = [];

    /** 
   * Split route in short segments to increase
   * performance in PointInPolygon function.
   * 30 km segments may be a sweet spot.
   */

    route_segments = turf.lineChunk(
      route,
      segment_length,
      option_units_kilometers
    );

    t0 = performance.now();

    setTimeout(cctv_segment_loop(), 0);
  };


  var cctv_segment_loop = function () {
    route_segment = route_segments.features[segment_index];
    segment_index++;

    if (segment_index > route_segments.features.length) {
      setTimeout(cctv_display, 0);
      return true;
    };

    setTimeout(cctvs_in_segment, 0);
  };


  var cctvs_in_segment = function () {
    var route_buffer = turf.buffer(
      route_segment,
      buffer_width,
      option_units_meters
    );

    Bliss.each(cctv_JSON
      .d2LogicalModel
      .payloadPublication
      .genericPublicationExtension
      .cctvSiteTablePublication
      .cctvCameraList
      .cctvCameraMetadataRecord,
      function (index, cctv_location) {

        var cctv_lon = parseFloat(cctv_location
          .cctvCameraLocation
          .pointByCoordinates
          .pointCoordinates.longitude
        );

        var cctv_lat = parseFloat(cctv_location
          .cctvCameraLocation
          .pointByCoordinates
          .pointCoordinates.latitude
        );

        var cctv_point = turf.point([cctv_lon, cctv_lat]);

        if (turf.booleanPointInPolygon(cctv_point, route_buffer)) {

          var cctv_snapped = turf.nearestPointOnLine(
            route,
            cctv_point,
            option_units_kilometers
          );

          cctv_snapped['properties']['stillImageUrl'] = cctv_location
            .cctvStillImageService
            .stillImageUrl
            .urlLinkAddress;

          cctv_snapped['properties']['urlLinkDescription'] = cctv_location
            .cctvStillImageService
            .stillImageUrl
            .urlLinkDescription
            .values
            .value;

          cctv_snapped['properties']['cctvCameraSite'] = cctv_location
            .cctvCameraSiteLocalDescription
            .values
            .value;

          cctv_locations_route.push(cctv_snapped);
        };
      }
    );
    setTimeout(cctv_segment_loop, 0);
  };


  var cctv_display = function () {

    cctv_locations_route.sort(function (distance_1, distance_2) {
      return parseFloat(distance_1['properties']['location']) -
        parseFloat(distance_2['properties']['location']);
    });

    t_s = performance.now();

    VEIBLIKK_messages.ux_debug(
      '#debug_data',
      'Time cctv_display: ' +
      parseFloat(t_s - t0).toFixed(0) + ' ms'
    );

    VEIBLIKK_messages.ux_debug(
      '#debug_data',
      '-----------'
    );

    VEIBLIKK_messages.ux_message(
      '#status_message',
      'Fant ' + cctv_locations_route.length + ' webkamerabilder',
      'idle'
    );

    Bliss.each(cctv_locations_route,
      function (index, webcam) {
        var distance = parseFloat(webcam['properties']['location']).toFixed(0);
        var web_image_url = webcam['properties']['stillImageUrl'];
        var yr_url = webcam['properties']['urlLinkDescription'];
        var camera_site = webcam['properties']['cctvCameraSite'];

        var svv_image = document.createElement('div');
        svv_image.className = 'svv_image';
        svv_image.innerHTML =
          '<h4>' + distance + ' km - ' + camera_site + '</h4>' +
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


  Bliss.fetch('GetCCTVSiteTable.xml')
    .then(preprocess_cctv_locations)
    .catch(get_cctvs_file_error);


  return {
    import_route: import_route
  };

}());