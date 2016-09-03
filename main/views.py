from django.shortcuts import render
from django.http import HttpResponse
import json
import urllib
import requests
import polyline
import xml.etree.ElementTree as ET

# from django.http import JsonResponse

def home(request):
    return render(request, 'home.html')

def route(request):    
    pointArray = {
        'gisKrasnPoints': {    
            'polyLine': {

            }    
        },
        'googleMapPoints': { 
            'polyLine': {

            }        
        },        
    }
    
    # route gis.krasn.ru
    fromA = request.POST['posA'].replace(' ', '%20')
    toB = request.POST['posB'].replace(' ', '%20')
    gisKrasnXml = urllib.request.urlopen('http://gis.krasn.ru/services/service.php?api=1.01&service=route&rom=3&aom=1&from='
        +fromA
        +'&to='
        +toB).read()
    root = ET.fromstring(gisKrasnXml)
    for indx, point in enumerate(root.iter('point')):
        coordinate = point.text.replace('POINT(', '').replace(')', '').split(' ')
        pointArray['gisKrasnPoints']['polyLine'][indx] = {
            'x': coordinate[1],
            'y': coordinate[0],
        }
    pointArray['gisKrasnPoints']['distance'] = root[0][2][0].text
    
    # route googleMap    
    coordList = fromA.split('%20')
    fromA = coordList[1] + '%20' + coordList[0]
    coordList = toB.split('%20')
    toB = coordList[1] + '%20' + coordList[0]    
    urlGoogleMap = ("https://maps.googleapis.com/maps/api/directions/json?origin="
        +fromA
        +'&destination='
        +toB
    )
    googleMap = urllib.request.urlopen(urlGoogleMap).read()
    googleMapJSON = json.loads(googleMap.decode("utf-8"))
    googleMapLine = polyline.decode(googleMapJSON['routes'][0]['overview_polyline']['points'])
    for indx, point in enumerate(googleMapLine):
        pointArray['googleMapPoints']['polyLine'][indx] = {
            'x': str(point[0]),
            'y': str(point[1]),
        }
    pointArray['googleMapPoints']['distance'] = googleMapJSON['routes'][0]['legs'][0]['distance']['text']
    return HttpResponse(json.dumps(pointArray), content_type ="application/json")
