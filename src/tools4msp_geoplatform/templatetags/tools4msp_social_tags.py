from django import template

try:
    from allauth.socialaccount import providers
except ImportError:
    providers = None

register = template.Library()


@register.simple_tag(takes_context=True)
def get_social_providers_with_apps(context, user):
    """
    Returns social providers that have a SocialApp configured.
    Returns list of dicts with provider info and pre-generated login URL.
    
    This bypasses allauth's provider_login_url template tag which can fail
    in certain configurations with geonode's custom adapter.
    """
    if providers is None:
        return []
    
    from allauth.socialaccount.models import SocialApp
    from django.contrib.sites.models import Site
    from allauth.socialaccount.adapter import get_adapter
    
    # Get current site
    request = context.get('request')
    if request:
        from django.contrib.sites.shortcuts import get_current_site
        current_site = get_current_site(request)
    else:
        current_site = Site.objects.get_current()
    
    # Get provider IDs that have apps for this site
    configured_providers = set(
        SocialApp.objects.filter(sites=current_site).values_list('provider', flat=True)
    )
    
    # Get user's already-connected providers
    user_provider_ids = set()
    if user.is_authenticated:
        user_provider_ids = set(user.socialaccount_set.values_list('provider', flat=True))
    
    # Return provider info with pre-generated login URLs
    providers_with_apps = []
    adapter = get_adapter()
    
    for provider_cls in providers.registry.get_class_list():
        if provider_cls.id in configured_providers and provider_cls.id not in user_provider_ids:
            try:
                # Get provider instance and generate login URL
                provider_instance = adapter.get_provider(request, provider_cls.id)
                login_url = provider_instance.get_login_url(request, process='connect')
                
                providers_with_apps.append({
                    'id': provider_cls.id,
                    'name': provider_cls.name,
                    'login_url': login_url,
                })
            except Exception:
                # Skip providers that can't be instantiated
                pass
    
    return providers_with_apps
