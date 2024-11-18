from django.shortcuts import render

def index(request):
  if request.GET.get('iframe'):
    return render(request, 'geodatabuilder/iframe.html')
  return render(request, 'geodatabuilder/app.html')
