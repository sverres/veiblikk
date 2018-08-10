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

const VEIBLIKK_webcams = (() => {

  let route = null;
  let route_segment = null;
  let route_segments = null;
  let segment_index = null;

  let cctv_JSON = null;
  let cctv_locations_route = null;

  const option_units_meters = {
    units: 'meters'
  };

  const option_units_kilometers = {
    units: 'kilometers'
  };

  const segment_length = 30; // kilometers
  const buffer_width = 50; // meters


  const preprocess_cctv_records = xhr => {
    cctv_JSON = parser.parse(xhr.response);
  };


  const get_cctv_file_error = error =>
    VEIBLIKK_messages.ux_message(
      '#status_message',
      'Får ikke hentet webkamera-info. ' + error,
      'error');


  const import_route = exported_route => {
    route = exported_route;
    setTimeout(make_segments, 0);
  };


  const make_segments = () => {

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

    setTimeout(route_segments_loop, 0);
  };


  const store_cctv_point = (cctv_point, cctv_record) => {
    const cctv_snapped = turf.nearestPointOnLine(
      route,
      cctv_point,
      option_units_kilometers
    );

    cctv_snapped['properties']['stillImageUrl'] = cctv_record
      .cctvStillImageService
      .stillImageUrl
      .urlLinkAddress;

    cctv_snapped['properties']['urlLinkDescription'] = cctv_record
      .cctvStillImageService
      .stillImageUrl
      .urlLinkDescription
      .values
      .value;

    cctv_snapped['properties']['cctvCameraSite'] = cctv_record
      .cctvCameraSiteLocalDescription
      .values
      .value;

    cctv_locations_route.push(cctv_snapped);
  };

  const cctv_display = () => {

    cctv_locations_route.sort((distance_1, distance_2) =>
      parseFloat(distance_1['properties']['location']) -
      parseFloat(distance_2['properties']['location']));

    VEIBLIKK_messages.ux_message(
      '#status_message',
      'Fant ' + cctv_locations_route.length + ' webkamerabilder',
      'idle'
    );

    cctv_locations_route.map(webcam => {
      const distance = parseFloat(webcam['properties']['location']).toFixed(0);
      const web_image_url = webcam['properties']['stillImageUrl'];
      const yr_url = webcam['properties']['urlLinkDescription'];
      const camera_site = webcam['properties']['cctvCameraSite'];

      const svv_image = document.createElement('div');
      svv_image.className = 'svv_image';
      svv_image.innerHTML =
        '<h4>' + distance + ' km - ' + camera_site + '</h4>' +
        '<p><img src="' + web_image_url + '" /></p>' +
        '<p><a href="' + yr_url + '" target="_blank">' +
        decodeURI(yr_url) + '</a></p></div>';
      const webcams = document.getElementById('webcams');
      webcams.appendChild(svv_image);
    });
  };


  const cctvs_in_segment = () => {
    const route_buffer = turf.buffer(
      route_segment,
      buffer_width,
      option_units_meters
    );

    cctv_JSON
      .d2LogicalModel
      .payloadPublication
      .genericPublicationExtension
      .cctvSiteTablePublication
      .cctvCameraList
      .cctvCameraMetadataRecord.map(cctv_record => {
        const cctv_lon = parseFloat(cctv_record
          .cctvCameraLocation
          .pointByCoordinates
          .pointCoordinates.longitude
        );

        const cctv_lat = parseFloat(cctv_record
          .cctvCameraLocation
          .pointByCoordinates
          .pointCoordinates.latitude
        );

        const cctv_point = turf.point([cctv_lon, cctv_lat]);

        if (turf.booleanPointInPolygon(cctv_point, route_buffer)) {
          store_cctv_point(cctv_point, cctv_record);
        };
      });
    setTimeout(route_segments_loop, 0);
  };


  const route_segments_loop = () => {
    route_segment = route_segments.features[segment_index];
    segment_index++;

    if (segment_index > route_segments.features.length) {
      setTimeout(cctv_display, 0);
      return true;
    };

    setTimeout(cctvs_in_segment, 0);
  };


  Bliss.fetch('GetCCTVSiteTable.xml')
    .then(preprocess_cctv_records)
    .catch(get_cctv_file_error);


  return {
    import_route: import_route
  };

})();