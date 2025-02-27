from django.views.generic import TemplateView
from django.core.cache import cache

from geonode.themes.models import GeoNodeThemeCustomization, THEME_CACHE_KEY


class HomePageView(TemplateView):
    template_name = 'site_index.html'

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)

        theme = cache.get(THEME_CACHE_KEY)
        if theme is None:
            try:
                theme = GeoNodeThemeCustomization.objects.get(is_enabled=True)
            except Exception:
                theme = None
            cache.set(THEME_CACHE_KEY, theme)

        if theme:
            context['partners'] = theme.partners.filter(name__contains='[partner]').order_by('name')
            context['sponsors'] = theme.partners.filter(name__contains='[sponsor]').order_by('name')

        return context
