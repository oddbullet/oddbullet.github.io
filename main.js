import {carbonCal} from './carbon.js';

// initialize Leaflet
const map = L.map('map').setView([37.8, -96], 4);

// add the OpenStreetMap tiles
const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);

var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  this.update();
  return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
  this._div.innerHTML = '<h4>US Travel Info</h4>' +  (props ?
  '<b>' + props.name + '</b><br />' + (props.density > 0 ? props.density + ' Trip(s) to this state' : 'No trips')
  : 'Hover over a state');
};

info.addTo(map);

// get color depending on population density value
  function getColor(d) {
      return d >= 8 ? '#800026' :
          d >= 7  ? '#bd0026' :
    d >= 6  ? '#e31a1c' :
          d >= 5  ? '#fc4e2a' :
          d >= 4  ? '#fd8d3c' :
          d >= 3   ? '#feb24c' :
          d >= 2   ? '#fed976' :
          d >= 1   ? '#ffeda0' : '#ffffcc';
  }

function style(feature) {
      return {
          weight: 2,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7,
          fillColor: getColor(feature.properties.density)
      };
  }      

var geojson;

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
  });

  layer.bringToFront();

  info.update(layer.feature.properties);
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);

  info.update();
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    //click: zoomToFeature
  });
}

geojson = L.geoJson(statesData, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(map)

// show the scale bar on the lower left corner
L.control.scale({imperial: true, metric: true}).addTo(map);

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

  var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 1, 2, 3, 4, 5, 6, 7, 8],
    labels = [];

  // loop through our density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' + getColor(grades[i]) + '"></i> ' +
      grades[i] + (grades[i + 1] ? '<br>' : '+');
  }

  return div;
};

legend.addTo(map);

var popup = L.popup();

function onMapClick(e) {
  popup
    .setLatLng(e.latlng)
    .setContent("toggle")
    .openOn(map);
    L.mmarker(e.latlng).addTo(Map);
}

map.on('click', onMapClick);
