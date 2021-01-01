/**
 * Mapbox image tile layer with topo4 map tiles
 * 
 * https://github.com/sverres/veiblikk
 * 
 * sverre.stikbakke 27.11.2017
 */

map.on('load', () => {

  const minZoomThreshold = 15;

  map.addLayer({
    'id': 'topo2',
    'type': 'raster',
    'minzoom': minZoomThreshold,
    'source': {
      'type': 'raster',
      'tiles': [
        'https://opencache.statkart.no/gatekeeper/gk/gk.open_wmts?'
        + 'Service=WMTS&'
        + 'Version=1.0.0&'
        + 'Request=GetTile&'
        + 'Format=image/png&'
        + 'Style=default&'
        + 'Layer=topo4graatone&'
        + 'TileMatrixSet=EPSG:3857&'
        + 'TileMatrix=EPSG:3857:{z}&'
        + 'TileCol={x}&'
        + 'TileRow={y}'
      ],
      'tileSize': 256
    },
    'paint': {}
  });
});