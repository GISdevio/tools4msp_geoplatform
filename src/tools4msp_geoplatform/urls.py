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
# from django.conf.urls import url, include
from django.urls import path
from django.views.generic import TemplateView

from geonode.urls import urlpatterns as geonode_urlpatterns
from geonode.base import register_url_event

from .views import HomePageView

# from wagtail.admin import urls as wagtailadmin_urls
# from wagtail import urls as wagtail_urls
# from wagtail.documents import urls as wagtaildocs_urls

"""
# You can register your own urlpatterns here
urlpatterns = [
    url(r'^/?$',
        homepage,
        name='home'),
 ] + urlpatterns
"""

urlpatterns = [
    path('', include('casestudies.urls')),
    path('', include('geodatabuilder.urls')),

    # Needed to migrate data from old platform
    path('', include('tools4msp_geoplatform.upmigrate.urls')),
] + geonode_urlpatterns

homepage = register_url_event()(HomePageView.as_view())

# urlpatterns = [
#     path('', homepage, name='home'),
# ] + urlpatterns
#
# urlpatterns = [
#     path('cms/', include(wagtailadmin_urls)),
#     path('documents/', include(wagtaildocs_urls)),
#     path('pages/', include(wagtail_urls)),
# ] + urlpatterns

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
