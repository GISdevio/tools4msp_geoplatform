import logging

from django.db import models
from django.contrib.auth import get_user_model


User = get_user_model()

logger = logging.getLogger(__name__)


class CasestudiesModule(models.Model):
    """
    LISTA DEI MODULI CASE STUDIES
    """
    name = models.CharField(max_length=128, unique=True)
    slug = models.SlugField(max_length=128, unique=True)

    def __str__(self):
        return self.name
    class Meta:
        verbose_name_plural = 'Modules'


class CasestudiesCsType(models.Model):
    """
    LISTA DEI Cs Type CASE STUDIES
    """
    name = models.CharField(max_length=128, unique=True)
    slug = models.SlugField(max_length=128, unique=True)

    def __str__(self):
        return self.name
    class Meta:
        verbose_name_plural = 'Types'


class Tools4MSPOptions(models.Model):
    label = models.CharField(max_length=250)
    value = models.CharField(max_length=250)
    group = models.CharField(max_length=250)

    def __str__(self):
        return f'{self.group} - {self.value}'

class RemoteProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='remote_profile')
    remote_id = models.IntegerField()
    token = models.CharField(max_length=255)

    def __str__(self):
        return str(self.remote_id)
