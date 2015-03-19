/* global ol */
/* global console */
/* global $ */


var policeAPIURL = 'http://data.police.uk/api/crimes-street/all-crime?';
var map;
var mapView;

function mapInit() {

    var attribution = new ol.control.Attribution({
        collapsible:false
    });

    mapView = new ol.View({
        center: ol.proj.transform([-2.5,53.5], 'EPSG:4326', 'EPSG:3857'),
        zoom: 16
    });

    map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: mapView
    });
    map.addControl(attribution);

    map.on('click', function (evt){
        console.log(evt);
    });
    map.on('moveend', function(){

        if (mapView.getZoom() >= 11) {
            // TODO Add Option On Page To Switch to Centre Of View
            //var mapCentre = mapView.getCenter();
            //mapCentre = ol.proj.transform(mapCentre, 'EPSG:3857', 'EPSG:4326');
            // All Points Map Centre
            //httpGet(policeAPIURL + 'lat=' + mapCentre[1] + '&lng=' + mapCentre[0]);

            var mapExtent = map.getView().calculateExtent(map.getSize());
            mapExtent = ol.proj.transformExtent(mapExtent, 'EPSG:3857', 'EPSG:4326');
            // All Points Map Extents
            //policeJSON = httpGet(policeAPIURL + constructPolicePoly(mapExtent));
        }
    });
}

function httpGet(URL){
    var xmlHttp;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", URL, true );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function constructPolicePoly(viewExtent){
    var returnString;
    returnString = 'poly=' + viewExtent[1] + ',' + viewExtent[0] + ':' +
        viewExtent[1] + ',' + viewExtent[2] + ':' +
        viewExtent[3] + ',' + viewExtent[2] + ':' +
        viewExtent[3] + ',' + viewExtent[0];
    return returnString;

}

function generatePoliceRequest(){
    var mapExtent = map.getView().calculateExtent(map.getSize());
    mapExtent = ol.proj.transformExtent(mapExtent, 'EPSG:3857', 'EPSG:4326');
    var request = policeAPIURL + constructPolicePoly(mapExtent);
    $.ajax({
        type: "GET",
        url: request,
        dataType: "json",
        async: false,
        success: function (data) {
            window.policeJSON = data;
        }
    });
}

function addPoliceFeaturesToMap(JSONObject){
    console.log(JSONObject);
}

$(document).ready(function () {
    // Bind any event handlers after jQuery is ready.
    $( "#getFeatures" ).click(function(){
        generatePoliceRequest();
        console.log(window.policeJSON);
        //addPoliceFeaturesToMap(policeJSON);
    });

});

// TODO Implement jQuery.ajax() on Click
// http://api.jquery.com/jquery.ajax/