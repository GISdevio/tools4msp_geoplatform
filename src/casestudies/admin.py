from django.contrib import admin

from .models import  CasestudiesModule, CasestudiesCsType, RemoteProfile, Tools4MSPOptions


class RemoteProfileAdmin(admin.ModelAdmin):
    fields = ('user', 'remote_id', 'token')


class CasestudiesModuleAdmin(admin.ModelAdmin):
    fields = ('name', 'slug')

class CasestudiesCsTypeAdmin(admin.ModelAdmin):
    fields = ('name', 'slug')



admin.site.register(CasestudiesModule, CasestudiesModuleAdmin)
admin.site.register(CasestudiesCsType, CasestudiesCsTypeAdmin)
admin.site.register(RemoteProfile, RemoteProfileAdmin)
admin.site.register(Tools4MSPOptions)