from django.conf.urls import url
from django.contrib import admin
from main import views

urlpatterns = [
    url(r'^$', views.home),
    url(r'^route/$', views.route), 
]