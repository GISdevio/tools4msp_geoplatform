# from django.conf.urls import include
from django.urls import path, re_path, include

from geodatabuilder import views

urlpatterns = [
    re_path("^api/v2/", include('geodatabuilder.api.urls')),
    re_path('^geodatabuilders/.*', views.index, name="geodatabuilder"),
]
