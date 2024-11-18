# from django.conf.urls import url, include
from django.urls import path, re_path, include

from casestudies import views

urlpatterns = [
    re_path("^api/v2/", include('casestudies.api.urls')),
    re_path('^casestudies/.*', views.index, name='casestudies'),
]
