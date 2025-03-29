# from django.conf.urls import url, include
from django.urls import path, re_path, include

from casestudies import views

urlpatterns = [
    re_path("^api/v2/", include('casestudies.api.urls')),
    re_path('^casestudies/.*', views.index, name='casestudies'),
    path('projects/', views.projects, name='projects'),
    path('publications/', views.publications, name='publications'),
    path('team/', views.team, name='team'),

]
