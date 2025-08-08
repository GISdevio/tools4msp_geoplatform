from django.shortcuts import render
from django.conf import settings


def index(request):
  context = {
      'siteUrl': settings.CLIENTURL,
  }
  return render(request, 'casestudies/app.html', context)

def projects(request):
    return render(request, 'projects.html')

def publications(request):
    return render(request, 'publications.html')

def team(request):
    return render(request, 'team.html')
