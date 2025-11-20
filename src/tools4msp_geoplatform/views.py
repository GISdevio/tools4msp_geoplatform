from django.views.generic import TemplateView
from geonode.layers.models import Dataset
from geonode.geoapps.models import GeoApp
from geonode.maps.models import Map
from django.urls import reverse
from geonode.people.models import Profile 

class HomePageView(TemplateView):
    template_name = 'index.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        # Dataset più recente
        latest_dataset = Dataset.objects.filter(is_published=True).order_by('-created').first()

        # Mappa più recente
        latest_map = Map.objects.filter(is_published=True).order_by('-created').first()

        # GeoStory più recente (resource_type = 'geostory')
        latest_geoapp = GeoApp.objects.filter(
                    is_published=True
                ).order_by('-created').first()


        featured_items = []

        # ----- DATASET -----
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

        # ----- MAPPA -----
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

        # ----- GEOAPP (Geostory o Dashboard) -----
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
        
        # --- CONTATORI IN TEMPO REALE ---
        layers_count = Dataset.objects.filter(is_published=True).count()
        maps_count = Map.objects.filter(is_published=True).count()
        users_count = Profile.objects.count()
        geoapp_count = GeoApp.objects.filter(is_published=True).count() 

   

        context['counters'] = [
            ('fa-database', layers_count, 'Dataset','http://localhost/catalogue/#/?f=dataset'),
            ('fa-map', maps_count, 'Mappe','http://localhost/catalogue/#/?f=map'),
            ('fa-gears', geoapp_count, 'App','http://localhost/catalogue/#/all?f=geostory&f=dashboard'),
            ('fa-users', users_count, 'Utenti','http://localhost/people/?limit=5&offset=0'),
]

        
        return context

