from logging import getLogger
import requests, json

from rest_framework import viewsets, permissions, decorators, response

from dynamic_rest.viewsets import DynamicModelViewSet
from dynamic_rest.filters import DynamicFilterBackend, DynamicSortingFilter

from geonode.base.api.filters import DynamicSearchFilter, ExtentFilter
from geonode.base.api.pagination import GeoNodeApiPagination


from geodatabuilder.api import serializers
from geodatabuilder.models import GeoDataBuilder, GeoDataBuilderVariable



logger = getLogger('django')


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return obj.owner == request.user


class GeodatabuilderViewSet(DynamicModelViewSet):
    queryset = GeoDataBuilder.objects.all()
    serializer_class = serializers.GeodataBuilderSerializer
    pagination_class = GeoNodeApiPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    filter_backends = [
        DynamicFilterBackend, DynamicSortingFilter, DynamicSearchFilter,
        ExtentFilter
    ]

    def get_serializer_class(self):
        if self.action == 'validate_expression':
            return serializers.ExpressionValidatorSerializer
        
        return super().get_serializer_class()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @decorators.action(methods=['POST'], detail=False)
    def validate_expression(self, *args, **kwargs):
        serializer = self.get_serializer_class()(data=self.request.data)
        serializer.is_valid(raise_exception=True)
        return response.Response(serializer.data)


class GeodatabuilderVariableViewSet(DynamicModelViewSet):
    queryset = GeoDataBuilderVariable.objects.all()
    serializer_class = serializers.GeoDataBuilderVariableSerializer
    pagination_class = GeoNodeApiPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    filter_backends = [
        DynamicFilterBackend, DynamicSortingFilter, DynamicSearchFilter,
        ExtentFilter
    ]
