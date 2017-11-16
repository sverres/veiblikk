map.on('load', function () {
  
  var minZoomThreshold = 13;

  map.addLayer({
    'id': 'topo2',
    'type': 'raster',
    'minzoom': minZoomThreshold,
    'source': {
      'type': 'raster',
      'tiles': [
        'https://opencache.statkart.no/gatekeeper/gk/gk.open_wmts'
        + '?Service=WMTS'
        + '&Version=1.0.0'
        + '&Request=GetTile'
        + '&Format=image/png'
        + '&Style=default'
        + '&Layer=topo2graatone'
        + '&TileMatrixSet=EPSG:3857'
        + '&TileMatrix=EPSG:3857:{z}'
        + '&TileCol={x}'
        + '&TileRow={y}'
      ],
      'tileSize': 256
    },
    'paint': {}
  });
});
