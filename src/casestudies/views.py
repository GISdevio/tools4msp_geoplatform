from django.shortcuts import render
from django.conf import settings


def index(request):
  context = {
      'siteUrl': settings.CLIENTURL,
  }
  return render(request, 'casestudies/app.html', context)
