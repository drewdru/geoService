$(document).ready(function () {        
    var map = L.map('map').setView([55.983, 92.884], 14);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    markerA = L.marker([55.991, 92.884],{draggable: true})
        .addTo(map)
        .bindLabel('от А', {static: true})
        .bindPopup('откуда');

    markerA.on('drag', function(e) {
        var lat = e.target._latlng.lat.toFixed(3),
            lng = e.target._latlng.lng.toFixed(3);
        $('#posA').val(lng + ' ' +  lat);
    });
    markerB = L.marker([55.979, 92.860],{draggable: true})
        .addTo(map)
        .bindLabel('к В', {static: true})
        .bindPopup('куда');
    markerB.on('drag', function(e) {
        var lat = e.target._latlng.lat.toFixed(3),
            lng = e.target._latlng.lng.toFixed(3);
        $('#posB').val(lng + ' ' +  lat);
    });


    var gisKrasnPolyline = null;
    var googleMapPolyline = null;
    $('#ajaxRoute').submit(function (e) {
        e.preventDefault();
        var formData = $(this).serialize();
        $.ajax({
            type: 'POST',
            url: $(this).attr('action'),
            data: formData
        })
        .done(function (response) {
            if(gisKrasnPolyline != null)
                gisKrasnPolyline.remove();
            if(googleMapPolyline != null)
                googleMapPolyline.remove();

            var gisKrasnLine = response.gisKrasnPoints.polyLine;
            var gisKrasnLinePointList = [];
            for(var item in gisKrasnLine) {
                if(item<2) continue;
                gisKrasnLinePointList.push(
                    new L.LatLng(gisKrasnLine[item].x,
                        gisKrasnLine[item].y)
                );
            }
            gisKrasnPolyline = new L.Polyline(gisKrasnLinePointList, {
                color: 'red',
                weight: 3,
                opacity: 0.5,
                smoothFactor: 1
            });
            gisKrasnPolyline.addTo(map)
                .bindLabel('gis.krasn.ru, ' + response.gisKrasnPoints.distance, {static: true})
                .bindPopup('gis.krasn.ru, ' + response.gisKrasnPoints.distance);
            $('#gisKrasnDist').text(response.gisKrasnPoints.distance);

            var googleMapLine = response.googleMapPoints.polyLine;
            var googleMapLinePointList = [];
            for(var item in googleMapLine) {
                googleMapLinePointList.push(
                    new L.LatLng(googleMapLine[item].x,
                        googleMapLine[item].y)
                );
            }
            googleMapPolyline = new L.Polyline(googleMapLinePointList, {
                color: 'green',
                weight: 3,
                opacity: 0.5,
                smoothFactor: 1
            });
            googleMapPolyline.addTo(map)
                .bindLabel('maps.google.com, ' + response.googleMapPoints.distance, {static: true})
                .bindPopup('maps.google.com, ' + response.googleMapPoints.distance);
            $('#googleMapDist').text(response.googleMapPoints.distance);
    
        })
        .fail(function (response) {
            console.log(response);
        });
    });
});