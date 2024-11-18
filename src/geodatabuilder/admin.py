from django.contrib import admin

from .models import  GeoDataBuilder, GeoDataBuilderVariable

admin.site.register(GeoDataBuilder)
admin.site.register(GeoDataBuilderVariable)