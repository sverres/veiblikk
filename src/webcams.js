var VEIBLIKK_webcams = (function () {

  var route = null;
  
  var import_route = function (exported_route) {
    route = exported_route;
  };

  var get_cctvs_file = function () {
    $.ajax({
      url: 'GetCCTVSiteTable.xml',
      success: get_cctvs_file_success
    });
  };


  var get_cctvs_file_success = function (cctv_xml) {

    var route_buffer = turf.buffer(route, 50, 'meters');

    var cctv_locations = [];

    $(cctv_xml).find("cctvCameraMetadataRecord").each(function () {
      var xml_element = $(this);
      var cctv_lon = parseFloat(xml_element.find("longitude").text());
      var cctv_lat = parseFloat(xml_element.find("latitude").text());
      var cctv_point = turf.point([cctv_lon, cctv_lat]);
      if (turf.inside(cctv_point, route_buffer)) {

        var cctv_snapped = turf.pointOnLine(route, cctv_point, 'kilometers');

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

    console.log("Antall webcams: " + cctv_locations.length);
    //console.log(cctv_locations);

    $(cctv_locations).each(function (){
      //console.log(this["properties"]["stillImageUrl"]);
      var distance = parseFloat(this["properties"]["location"]).toFixed(0);
      var web_image_url = this["properties"]["stillImageUrl"];
      var yr_url = this["properties"]["urlLinkDescription"];
      $('#webcams').append('<h3>' + distance + ' km:</h3>');
      $('#webcams').append('<p><img src="' + web_image_url + '" /></p>');
      $('#webcams').append('<p><a href="' + yr_url + '" target="_blank">' + decodeURI(yr_url) + '</a></p>');
    })

  };


  return {
    get_cctvs_file, 
    import_route
  };

}());