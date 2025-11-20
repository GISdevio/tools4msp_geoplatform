# -*- coding: utf-8 -*-
#########################################################################
#
# Copyright (C) 2017 OSGeo
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program. If not, see <http://www.gnu.org/licenses/>.
#
#########################################################################
from django.urls import path, include
from django.conf.urls.static import static
from django.conf import settings
from django.views.generic import TemplateView

# Import dalle URL di GeoNode
from geonode.urls import urlpatterns as geonode_urlpatterns
from geonode.base import register_url_event

# Importa la view personalizzata per la home
from .views import HomePageView

# --- HomePage personalizzata ---
homepage = register_url_event()(HomePageView.as_view())

urlpatterns = [
    # Home personalizzata con sezione "In Evidenza"
    path('', homepage, name='home'),

    # Altri moduli del progetto
    path('', include('casestudies.urls')),
    path('', include('geodatabuilder.urls')),

    # Migrazione da vecchia piattaforma
    path('', include('tools4msp_geoplatform.upmigrate.urls')),
] + geonode_urlpatterns

# Gestione dei file statici in debug mode
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

