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
    $.ajax({
      url: 'GetCCTVSiteTable.xml',
      success: get_cctvs_file_success,
      error: get_cctvs_file_error
    });
  };


  var get_cctvs_file_success = function (cctv_xml) {

    var t0 = performance.now();

    var option_units_meters = { units: 'meters' };
    var option_units_kilometers = { units: 'kilometers' };

    var route_segment_1 = turf.lineSliceAlong(route, 0, 150, {units: 'kilometers'});
    var route_segment_2 = turf.lineSliceAlong(route, 150, 300, {units: 'kilometers'});
    var route_segment_3 = turf.lineSliceAlong(route, 300, 450, {units: 'kilometers'});
    var route_segment_4 = turf.lineSliceAlong(route, 450, 600, {units: 'kilometers'});
    var route_segment_5 = turf.lineSliceAlong(route, 600, 9999, {units: 'kilometers'});
    
    var route_buffer_1 = turf.buffer(route_segment_1, 50, option_units_meters);
    var route_buffer_2 = turf.buffer(route_segment_2, 50, option_units_meters);
    var route_buffer_3 = turf.buffer(route_segment_3, 50, option_units_meters);
    var route_buffer_4 = turf.buffer(route_segment_4, 50, option_units_meters);
    var route_buffer_5 = turf.buffer(route_segment_5, 50, option_units_meters);

    var buffer_collection = [route_buffer_1, route_buffer_2, 
      route_buffer_3, route_buffer_4, route_buffer_5];

    var cctv_locations = [];

    $.each(buffer_collection, function (index, route_buffer) {
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

    var t1 = performance.now();
    console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");

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