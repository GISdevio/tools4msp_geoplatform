import logging
import traceback

from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from casestudies.libs import create_remote_user


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


@receiver(post_save, sender=User)
def populate_profile(sender, instance, **kwargs):
    if not hasattr(instance, 'remote_profile'):
        # invoke API to create a user on tools4msp
        try:
            result, status = create_remote_user(instance)
            if result.get('user'):
                RemoteProfile.objects.create(user=instance, remote_id=result.get('user'), token=result.get('token'))
                logger.debug(f'added profile to user {instance} ')
            else:
                logger.error(f'response from remote profile not found for user {instance}')
                logger.debug(f'{result}')
        except:
            logger.error(traceback.format_exc())
