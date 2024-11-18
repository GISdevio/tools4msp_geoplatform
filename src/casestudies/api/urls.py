from rest_framework_extensions.routers import ExtendedSimpleRouter
from dynamic_rest.routers import DynamicRouter

from . import views

casestudy_router = ExtendedSimpleRouter()
casestudy_nested_router = casestudy_router.register('casestudies', views.CasestudyViewSet, basename='casestudy')
runs_router = casestudy_nested_router.register('runs', views.CasestudyRunViewSet, basename='casestudyrun', parents_query_lookups=['casestudy_id'])
runs_router.register('outputlayers', views.CasestudyRunOutputLayerViewSet, basename='casestudyrunoutput', parents_query_lookups=['casestudy_id', 'run_id'])
casestudy_nested_router.register('inputs', views.CasestudyInputsViewSet, basename='casestudyinput', parents_query_lookups=['casestudy_id'])
casestudy_nested_router.register('layers', views.CasestudyLayersViewSet, basename='casestudylayer', parents_query_lookups=['casestudy_id'])


extra_router = DynamicRouter()
extra_router.register('codedlabels', views.CodedlabelsViewSet)
extra_router.register('contexts', views.ContextsViewSet)
extra_router.register('domainareas', views.DomainAreaViewSet)
extra_router.register('tools4msp-options', views.Tools4MSPOptionsViewSet)
extra_router.register('remote-profiles', views.RemoteProfileViewSet)


urlpatterns = casestudy_router.urls + extra_router.urls
