const promise = require('bluebird'); 
var tj = require('togeojson');
var fs = require('fs');

// node doesn't have xml parsing or a dom. use xmldom
var DOMParser = require('xmldom').DOMParser;

const initOptions = {
    promiseLib: promise // overriding the default (ES6 Promise);
};

const pgp = require('pg-promise')(initOptions);

// Database connection details
// Swap out with own db credentials
// create table with setup.sql
const cn = {
    host: 'nutty-blueberry.db.elephantsql.com', 
    port: 5432, // 5432 is the default;
    database: 'postgres',
    user: 'jcfcqrso',
    password: 'ExNoFtbZT7_BNnmb5XFIwDIDwJHOVDK0'
};

const db = pgp(cn); // database instance;

// convert kml to geojson
var kml = new DOMParser().parseFromString(fs.readFileSync('map.kml', 'utf8'));
var converted = tj.kml(kml);
var convertedWithStyles = tj.kml(kml, { styles: true });
var myJSON = JSON.stringify(convertedWithStyles);

//extract geometries from feature collection
var myGeometries = myJSON.slice(69, -2);

// prepare and execute insert query
var myQuery = "INSERT INTO kmlTable(id,geom) values(1,ST_SetSRID(ST_GeomFromGeoJSON(" + "'" +  myGeometries + "'"+ "),4326))"
db.any(myQuery)
    .then(data => {
        console.log('DATA:', data); // print data;
    })
    .catch(error => {
        console.log('ERROR:', error); // print the error;
    })
    .finally(db.$pool.end);




/////////////////////////////////////////////////////////////////////////////////
// mapbox js

L.mapbox.accessToken = 'pk.eyJ1Ijoid3RnZW9ncmFwaGVyIiwiYSI6ImNpdGFicWJqYjAwdzUydHM2M2g0MmhsYXAifQ.oO-MYNUC2tVeXa1xYbCIyw';

var map = L.map("map", {
    zoom: 4,
    maxzoom: 19,
    center: [35.603718, -109.291992],
    zoomControl: false,
    attributionControl: false
  });

L.control.layers({
    'Mapbox Streets': L.mapbox.tileLayer('mapbox.streets').addTo(map),
    'Mapbox Satellite': L.mapbox.tileLayer('mapbox.satellite'),
    'Mapbox Outdoors': L.mapbox.tileLayer('mapbox.outdoors')
}).addTo(map);


/////////////////////////////////////////////////////////////////////////////////
// jquery ui

$(".dropdown-toggle").dropdown();

$(".dropdown-menu a").click(function(){
    $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
    $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
  });

// Navbar Menu
$("#menu-toggle").click(function (e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});
$(document).ready(function () {
    $("#menu-toggle").click();
});
$("#filter-menu-toggle").click(function (e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});