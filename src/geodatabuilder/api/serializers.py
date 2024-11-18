from geodatabuilder.models import GeoDataBuilder, GeoDataBuilderVariable
from dynamic_rest.serializers import DynamicModelSerializer, DynamicRelationField
from rest_framework import serializers

from geodatabuilder.validators import validate_expression

class GeoDataBuilderVariableSerializer(DynamicModelSerializer):
    class Meta:
        model = GeoDataBuilderVariable
        fields = (
            'id',
            'name',
            'layer',
            'attribute',
            'where_condition',
            'geodatabuilder',
        )

    layer = DynamicRelationField('geonode.layers.api.serializers.DatasetSerializer', embed=True)
    geodatabuilder = DynamicRelationField('GeodataBuilderSerializer')


class GeodataBuilderSerializer(DynamicModelSerializer):
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = GeoDataBuilder
        fields = (
            'id',
            'label',
            'owner',
            'desc_expression',
            'expression',
            'expression_id_string',
            'file_path',
            'status',
            'created',
            'updated',
            'file_updated',
            'variables',
            'is_owner',
        )
        deferred = ('variables',)


    owner = DynamicRelationField('geonode.base.api.serializers.OwnerSerializer', embed=True, read_only=True)
    variables = DynamicRelationField('GeoDataBuilderVariableSerializer', embed=True, many=True)

    def get_is_owner(self, obj):
        """
        you can pass request in context
        """
        return self.context['request'].user.id == obj.owner.id

class ExpressionValidatorSerializer(serializers.Serializer):
    expression = serializers.CharField(validators=[validate_expression])
