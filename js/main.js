/* global ol */


var policeAPIURL = 'http://data.police.uk/api/crimes-street/all-crime?';
var map;
var mapView;
var policeSource;
var policeLayer;

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
        projection: "EPSG:3857",
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: mapView
    });
    map.addControl(attribution);
    map.on('click', function(evt){
        // Nothing Yet
    });
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
    $.getJSON(request)
        .done(function(json) {
            addFeaturesToMap(json);
        });
}

function addFeaturesToMap(json){
    //var mapFeatures = [];
    var JSObjects = json.map(JSON.stringify);
    //console.log(JSObjects);
    policeSource = new ol.source.Vector({
        projection: "EPSG:3857"
    });
    $.each(JSObjects, function(key, value) {
        var feature = [];
        var jsObj = JSON.parse(value);
        var y = jsObj.location.latitude;
        var x = jsObj.location.longitude;
        feature.push(parseFloat(x), parseFloat(y));
        feature = ol.proj.transform(feature, "EPSG:4326", "EPSG:3857");
        var policeFeature = new ol.Feature({
            geometry: new ol.geom.Point(feature),
            name: key
        });
        policeSource.addFeature(policeFeature);
    });
    policeLayer = new ol.layer.Vector({
        source: policeSource
    });
    map.addLayer(policeLayer);
}

$(document).ready(function () {
    $( "#getFeatures" ).click(function(){
        generatePoliceRequest();
    });

});