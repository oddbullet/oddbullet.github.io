import {carbonCal} from './carbon.js';

// initialize Leaflet
const map = L.map('map').setView([37.8, -96], 4);

// add the OpenStreetMap tiles
const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(map);

let info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  this.update();
  return this._div;
};

let distance = 0;
let CO2 = 0.0;

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
  this._div.innerHTML = '<h4>US Travel Info</h4>' +  (props ?
  '<b>' + props.name + '</b><br />' + (props.density > 0 ? props.density + ' Trip(s) to this state' : 'No trips')
  : 'Hover over a state') + 
  '<br/>'+
  '<p>Distance: ' + (distance / 1000).toFixed(2) + ' KM</p>'+
  '<br/>'+
  '<p>CO2: ' + (CO2).toFixed(2) + ' kg/passenger-km</p>'+
  '<p>Keyboard shortcuts:</p>'+
  '<P>Shift+R: Remove all markers & lines</p>'+
  '<P>Shift+Z: Undo</p>'+
  '<p>Shift+T: Change transportation method</p>'+
  '<p>Blue: Car Red: Airplane</p>'
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

let geojson;

function highlightFeature(e) {
  let layer = e.target;

  layer.setStyle({
    weight: 2,
    color: 'white',
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

function handleClick(e) {
  let layer = e.target;
  layer.setStyle({
    weight: 2,
    color: 'white',
    ddashArray: '',
    fillOpacity: 0.7,
    fillColor: getColor(layer.feature.properties.density+=1)
  })
   layer.bringToFront;
   info.update(layer.feature.properties);
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: handleClick
  });
}

geojson = L.geoJson(statesData, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(map)

// show the scale bar on the lower left corner
L.control.scale({imperial: true, metric: true}).addTo(map);

let legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

  let div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 1, 2, 3, 4, 5, 6, 7, 8],
    labels = [];

  // loop through our density intervals and generate a label with a colored square for each interval
  for (let i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' + getColor(grades[i]) + '"></i> ' +
      grades[i] + (grades[i + 1] ? '<br>' : '+');
  }

  return div;
};

legend.addTo(map);

let popup = L.popup();

let markerList = [];
let lastMarker = null;
let lineList = [];
let transportation = "Airplane";

function onMapClick(e) {
    let marker = L.marker(e.latlng).addTo(map);
    markerList.push(marker);

    // Draw the line
    if (lastMarker) {
      // Create a polyline connecting the lastMarker and the new marker
      let latlngs = [lastMarker.getLatLng(), marker.getLatLng()];
      let polyLine;
      if (transportation == "Airplane") {
        polyLine = L.polyline(latlngs, { color: 'red' }).addTo(map);
      }
      if (transportation == "Car") {
        polyLine = L.polyline(latlngs, { color: 'blue'}).addTo(map);
      }
      lineList.push(polyLine);

      let newDist = lastMarker.getLatLng().distanceTo(marker.getLatLng());
      distance += newDist;
      CO2 += carbonCal(transportation, newDist);

    }
    
    lastMarker = marker;
    
    
    info.update();
}

map.on('click', onMapClick);

function removeLastMarker() {
  if(markerList.length > 1){
    let newDist = markerList[markerList.length-1].getLatLng().distanceTo(markerList[markerList.length-2].getLatLng());
    distance -= newDist;
    let recentMarker = markerList.pop();
    let lastLine = lineList.pop();
    CO2 -= carbonCal(transportation, newDist);
    map.removeLayer(recentMarker);
    map.removeLayer(lastLine);

  } else {
    map.removeLayer(markerList.pop());
    lastMarker = null;
    C02 = 0;
    distance = 0;
  }
  if (distance == 0) {
    C02 = 0;
  }
  info.update();
}

/* Remove mark function */
function removeAllMarker() {
  for (let i = 0; i < markerList.length; i++) {
    map.removeLayer(markerList[i]);
  }
  markerList = [];
  lastMarker = null;
}

function removeAllLines() {
  for (let i = 0; i < lineList.length; i++) {
    map.removeLayer(lineList[i]);
  }
  lineList = [];
}

function toggleTransportation() {
  if (transportation == "Airplane"){
    transportation = "Car";
  }
  else {
    transportation = "Airplane";
  }
}

document.addEventListener("keydown", function(event) {
  if (event.key === "R") {
    removeAllMarker();
    removeAllLines();
  } else if (event.key === "Z") {
    removeLastMarker();
    lastMarker = markerList[markerList.length - 1];
  } else if (event.key === "T" && markerList.length == 0) {
    toggleTransportation();
  }
});
