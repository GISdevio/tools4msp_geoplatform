from django.contrib.sites.models import Site
from django.conf import settings
from casestudies.models import Tools4MSPOptions

def theme_configs(*args, **kwargs):
    site = Site.objects.get_current()
    modules = Tools4MSPOptions.objects.filter(group='module')

    return {
        "THEME_SITE_NAME": site.name,
        'MODULES': modules,
        'GMAPS_TOKEN': settings.GMAPS_TOKEN,
    }
