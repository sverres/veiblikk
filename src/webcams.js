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
 * http://github.com/sverres/veiblikk
 * 
 * sverre.stikbakke 27.11.2017
 */

var VEIBLIKK_webcams = (function () {

  var route = null;


  var import_route = function (exported_route) {
    route = exported_route;
  };


  var get_cctvs_file = function () {
    VEIBLIKK_messages.ux_message(
      '#status_message',
      'Finner webkamerabilder. Dette kan ta litt tid . .',
      'working_on_images');

    $.get('GetCCTVSiteTable.xml')
      .done(get_cctv_locations)
      .fail(get_cctvs_file_error);
  };


  var get_cctv_locations = function (cctv_xml) {

    var option_units_meters = { units: 'meters' };
    var option_units_kilometers = { units: 'kilometers' };

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

    $.each(route_segments.features, function (index, route_segment) {

      var route_buffer = turf.buffer(
        route_segment,
        buffer_width,
        option_units_meters);

      $(cctv_xml).find("cctvCameraMetadataRecord").each(function () {
        var xml_element = $(this);
        var cctv_lon = parseFloat(xml_element.find("longitude").text());
        var cctv_lat = parseFloat(xml_element.find("latitude").text());
        var cctv_point = turf.point([cctv_lon, cctv_lat]);
        if (turf.booleanPointInPolygon(cctv_point, route_buffer)) {

          var cctv_snapped = turf.nearestPointOnLine(
            route,
            cctv_point,
            option_units_kilometers);

          cctv_snapped["properties"]["stillImageUrl"] 
            = xml_element.find("stillImageUrl").find("urlLinkAddress").text();
          cctv_snapped["properties"]["urlLinkDescription"]
            = xml_element.find("stillImageUrl").find("urlLinkDescription")
              .find("values").find("value").text();

          cctv_locations.push(cctv_snapped);
        };
      });
    });

    cctv_locations.sort(function (distance_1, distance_2) {
      return parseFloat(distance_1["properties"]["location"])
        - parseFloat(distance_2["properties"]["location"]);
    });

    VEIBLIKK_messages.ux_message(
      '#status_message',
      'Fant ' + cctv_locations.length + ' webkamerabilder',
      'idle');

    $(cctv_locations).each(function () {
      var distance = parseFloat(this["properties"]["location"]).toFixed(0);
      var web_image_url = this["properties"]["stillImageUrl"];
      var yr_url = this["properties"]["urlLinkDescription"];

      $('#webcams').append(
        '<div class="svv_image"><h4>' + distance + ' km</h4>'
        + '<p><img src="' + web_image_url + '" /></p>'
        + '<p><a href="' + yr_url + '" target="_blank">'
        + decodeURI(yr_url) + '</a></p></div>');
    });

  };


  var get_cctvs_file_error = function () {
    VEIBLIKK_messages.ux_message(
      '#status_message',
      'Får ikke hentet webkamera-info. Ukjent feil.',
      'error');
  };


  return {
    get_cctvs_file: get_cctvs_file,
    import_route: import_route
  };

}());