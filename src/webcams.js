var VEIBLIKK_webcams = (function () {

  var route = null;


  var import_route = function (exported_route) {
    route = exported_route;
  };


  var get_cctvs_file = function () {
    VEIBLIKK_messages.status_message(
      'Finner webkamerabilder . .', 'working_on_images');
    $.ajax({
      url: 'GetCCTVSiteTable.xml',
      success: get_cctvs_file_success,
      error: get_cctvs_file_error
    });
  };


  var get_cctvs_file_success = function (cctv_xml) {

    var option_units_meters = { units: 'meters' };
    var option_units_kilometers = { units: 'kilometers' };

    var route_buffer = turf.buffer(route, 50, option_units_meters);

    var cctv_locations = [];

    $(cctv_xml).find("cctvCameraMetadataRecord").each(function () {
      var xml_element = $(this);
      var cctv_lon = parseFloat(xml_element.find("longitude").text());
      var cctv_lat = parseFloat(xml_element.find("latitude").text());
      var cctv_point = turf.point([cctv_lon, cctv_lat]);
      if (turf.inside(cctv_point, route_buffer)) {

        var cctv_snapped = turf.pointOnLine(route, cctv_point, option_units_kilometers);

        cctv_snapped["properties"]["stillImageUrl"]
          = xml_element.find("stillImageUrl").find("urlLinkAddress").text();
        cctv_snapped["properties"]["urlLinkDescription"]
          = xml_element.find("stillImageUrl").find("urlLinkDescription")
            .find("values").find("value").text();

        cctv_locations.push(cctv_snapped);
      };
    });

    cctv_locations.sort(function (distance_1, distance_2) {
      return parseFloat(distance_1["properties"]["location"])
        - parseFloat(distance_2["properties"]["location"]);
    });

    VEIBLIKK_messages.status_message(
      'Fant ' + cctv_locations.length + ' webkamerabilder', 'idle');

    $(cctv_locations).each(function () {
      var distance = parseFloat(this["properties"]["location"]).toFixed(0);
      var web_image_url = this["properties"]["stillImageUrl"];
      var yr_url = this["properties"]["urlLinkDescription"];
      $('#webcams').append('<div class="svv_image"><h4>' + distance + ' km</h4>'
        + '<p><img src="' + web_image_url + '" /></p>'
        + '<p><a href="' + yr_url + '" target="_blank">' + decodeURI(yr_url) + '</a></p></div>');
    })

  };


  var get_cctvs_file_error = function () {
    VEIBLIKK_messages.status_message(
      'Får ikke hentet webkamera-info. Ukjent feil.', 'error');
  }


  return {
    get_cctvs_file: get_cctvs_file,
    import_route: import_route
  };

}());