from django.views.generic import TemplateView
from django.core.cache import cache
from django.urls import reverse

from geonode.themes.models import GeoNodeThemeCustomization, THEME_CACHE_KEY
from geonode.layers.models import Dataset
from geonode.geoapps.models import GeoApp
from geonode.maps.models import Map
from geonode.people.models import Profile


class HomePageView(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)

        # Theme customization
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

        # Featured items - latest resources
        featured_items = []

        # Dataset più recente
        latest_dataset = Dataset.objects.filter(is_published=True).order_by('-created').first()
        if latest_dataset:
            try:
                url = latest_dataset.get_absolute_url()
            except Exception:
                url = reverse('dataset_detail', args=[latest_dataset.alternate]) if latest_dataset.alternate else '#'

            featured_items.append({
                'title': latest_dataset.title or 'Senza titolo',
                'description': latest_dataset.abstract or '',
                'thumbnail_url': latest_dataset.thumbnail_url or '',
                'url': url,
                'type': 'Dataset',
                'icon': 'fa-database'
            })

        # Mappa più recente
        latest_map = Map.objects.filter(is_published=True).order_by('-created').first()
        if latest_map:
            try:
                url = latest_map.get_absolute_url()
            except Exception:
                url = reverse('map_detail', args=[latest_map.id])

            featured_items.append({
                'title': latest_map.title or 'Senza titolo',
                'description': latest_map.abstract or '',
                'thumbnail_url': latest_map.thumbnail_url or '',
                'url': url,
                'type': 'Mappa',
                'icon': 'fa-map'
            })

        # GeoApp più recente (Geostory o Dashboard)
        latest_geoapp = GeoApp.objects.filter(is_published=True).order_by('-created').first()
        if latest_geoapp:
            try:
                url = latest_geoapp.get_absolute_url()
            except Exception:
                url = reverse('geoapp_detail', args=[latest_geoapp.id])

            # Icona corretta
            if latest_geoapp.resource_type == "geostory":
                icon = "fa-book"
                label = "GeoStory"
            elif latest_geoapp.resource_type == "dashboard":
                icon = "fa-dashboard"
                label = "Dashboard"
            else:
                icon = "fa-gears"
                label = "App"
                
            featured_items.append({
                'title': latest_geoapp.title or 'Senza titolo',
                'description': latest_geoapp.abstract or '',
                'thumbnail_url': latest_geoapp.thumbnail_url or '',
                'url': url,
                'type': label,
                'icon': icon
            })

        context['featured_items'] = featured_items
        
        # Contatori in tempo reale
        layers_count = Dataset.objects.filter(is_published=True).count()
        maps_count = Map.objects.filter(is_published=True).count()
        users_count = Profile.objects.count()
        geoapp_count = GeoApp.objects.filter(is_published=True).count() 

        context['counters'] = [
            ('fa-database', layers_count, 'Dataset', '/catalogue/#/?f=dataset'),
            ('fa-map', maps_count, 'Mappe', '/catalogue/#/?f=map'),
            ('fa-gears', geoapp_count, 'App', '/catalogue/#/all?f=geostory&f=dashboard'),
            ('fa-users', users_count, 'Utenti', '/people/?limit=5&offset=0'),
        ]

        return context
