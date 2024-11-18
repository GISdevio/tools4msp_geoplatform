from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class GeoDataBuilder(models.Model):

    expression_help_text = _(
            'an Expression... HELP')

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        blank=False,
        null=False,
        related_name='owned_geodatabuilder',
        on_delete=models.CASCADE,
        verbose_name=_("Owner"))

    label = models.CharField(
        _('label'),
        max_length=255,
        blank=False,
        null=False)

    desc_expression = models.TextField(
        _('expression description'),
        max_length=2000,
        blank=False,
        help_text=expression_help_text)

    expression = models.TextField(
        _('expression'),
        max_length=2000,
        blank=True,
        null=True,
        help_text=expression_help_text)

    expression_id_string = models.TextField(
        _('expression id'),
        max_length=2000,
        blank=True,
        null=True,
        help_text=expression_help_text)

    file_path = models.CharField(
        _('file'),
        max_length=2000,
        blank=True,
        null=True)

    file_updated = models.DateTimeField(
        _('file data update'),
        blank=True,
        null=True)

    created = models.DateTimeField(auto_now_add=True)

    updated = models.DateTimeField(_('last modified'), auto_now=True, help_text=_(
         'date when expression were last updated'))  # passing the method itself, not

    status = models.CharField(
        _('status'),
        max_length=128,
        blank=True,
        null=True)

    def __str__(self):
        return self.label

    class Meta:
        ordering = ("label", "created", "updated")
        verbose_name_plural = 'GeoDataBuilders'


class GeoDataBuilderVariable(models.Model):
    geodatabuilder = models.ForeignKey('geodatabuilder.GeoDataBuilder', on_delete=models.CASCADE, related_name='variables')
    name = models.CharField(max_length=255)
    layer = models.ForeignKey('layers.Dataset', on_delete=models.PROTECT)
    attribute = models.CharField(max_length=255, null=True, blank=True)
    where_condition = models.CharField(max_length=500, null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(_('last modified'), auto_now=True)
