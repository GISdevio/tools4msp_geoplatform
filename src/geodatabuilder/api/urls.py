from dynamic_rest.routers import DynamicRouter
from . import views

router = DynamicRouter()
router.register(f'geodatabuilders', views.GeodatabuilderViewSet, 'geodatabuilders')
router.register(f'geodatabuilder-variables', views.GeodatabuilderVariableViewSet, 'geodatabuilder-variables')

urlpatterns = router.urls
