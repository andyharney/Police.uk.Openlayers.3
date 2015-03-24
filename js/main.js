/* global ol */

var policeAPIURL = 'http://data.police.uk/api/crimes-street/all-crime?';
var map;
var mapView;
var policeSource = new ol.source.Vector({
    projection: "EPSG:3857"
});

var crimeHeatmap = new ol.layer.Heatmap({
    source: policeSource,
    blur: 40,
    radius: 20,
    opacity: 0.15,
    gradient: ['#e3ff00', '#ffc100', '#f00']
});

function mapInit() {

    mapView = new ol.View({
        center: ol.proj.transform([-2.5, 53.5], 'EPSG:4326', 'EPSG:3857'),
        zoom: 6
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
    map.on('moveend', function () {
        if (mapView.getZoom() >= 13) {
            $("#zoomMessageDiv").css("display", "none");
            $("#heatmapControls").css("display", "inline");
            $("#crimeList").css("display", "inline");
            generatePoliceRequest();
        } else {
            policeSource.clear();
            $("#zoomMessageDiv").css("display", "inline");
            $("#heatmapControls").css("display", "none");
            $("#crimeList").css("display", "none");
            clearCrimeTable();
        }
    });
}

function constructPolicePoly(viewExtent) {
    var returnString;
    returnString = 'poly=' + viewExtent[1] + ',' + viewExtent[0] + ':' +
    viewExtent[1] + ',' + viewExtent[2] + ':' +
    viewExtent[3] + ',' + viewExtent[2] + ':' +
    viewExtent[3] + ',' + viewExtent[0];
    return returnString;
}

function generatePoliceRequest() {
    var mapExtent = map.getView().calculateExtent(map.getSize());
    mapExtent = ol.proj.transformExtent(mapExtent, 'EPSG:3857', 'EPSG:4326');
    var request = policeAPIURL + constructPolicePoly(mapExtent);
    $.getJSON(request)
        .done(function (json) {
            addFeaturesToMap(json);
        });
}

function addFeaturesToMap(json) {
    var JSObjects = json.map(JSON.stringify);
    policeSource.clear(true);
    var crimeList = [];
    $.each(JSObjects, function (key, value) {
        var feature = [];
        var jsObj = JSON.parse(value);
        var crimeType = jsObj.category;
        var y = jsObj.location.latitude;
        var x = jsObj.location.longitude;
        crimeList.push(crimeType.replace(/-/g, ' '));
        feature.push(parseFloat(x), parseFloat(y));
        feature = ol.proj.transform(feature, "EPSG:4326", "EPSG:3857");
        var policeFeature = new ol.Feature({
            geometry: new ol.geom.Point(feature),
            name: key
        });
        policeSource.addFeature(policeFeature);
    });
    map.addLayer(crimeHeatmap);
    updateCrimeTable(crimeList);
}

function updateCrimeTable(crimeList) {
    crimeList.sort();
    var counts = {};
    for (var i = 0; i < crimeList.length; i++) {
        counts[crimeList[i]] = 1 + (counts[crimeList[i]] || 0);
    }
    var textArea = document.getElementById('crimeList');
    textArea.innerHTML = '';
    textArea.innerHTML = '<p>Crime In This Area<hr>';
    $.each(counts, function (crime, number) {

        textArea.innerHTML = textArea.innerHTML + crime + ' : <b>' + number + '</b><br>';
    });
}

function clearCrimeTable() {
    var textArea = document.getElementById('crimeList');
    textArea.innerHTML = '<p>Crime In This Area<hr>';
}

$(function () {
    var blur = $('#blur');
    var radius = $('#radius');
    $(document).on('click', '#blur', function () {
        crimeHeatmap.setBlur(parseInt(blur.val(), 10));
    });
    $(document).on('click', '#radius', function () {
        crimeHeatmap.setRadius(parseInt(radius.val(), 10));
    });
});