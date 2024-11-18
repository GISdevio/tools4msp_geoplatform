from casestudies.models import Tools4MSPOptions, RemoteProfile, User
from rest_framework import serializers
from dynamic_rest.serializers import DynamicModelSerializer, DynamicRelationField

class EditCaseStudySerializer(serializers.Serializer):
    label = serializers.CharField()
    description = serializers.CharField(allow_null=True, required=False, allow_blank=True)
    visibility = serializers.IntegerField()


class CreateCaseStudySerializer(serializers.Serializer):
    label = serializers.CharField()
    description = serializers.CharField(allow_null=True, required=False, allow_blank=True)
    resolution = serializers.IntegerField()
    module = serializers.CharField()
    domain_area_terms = serializers.ListField(child=serializers.IntegerField())
    context = serializers.CharField()


class CloneCaseStudySerializer(serializers.Serializer):
    label = serializers.CharField()
    description = serializers.CharField(allow_null=True, required=False, allow_blank=True)


class RunCaseStudySerializer(serializers.Serializer):
    selected_layers = serializers.CharField(required=True)
    domain_area = serializers.JSONField(allow_null=True, required=False)


class UploadInputFileSerializer(serializers.Serializer):
    x = serializers.CharField()
    y = serializers.CharField()
    cols = serializers.ListField(child=serializers.CharField()) 
    rows = serializers.ListField(child=serializers.CharField())
    values = serializers.ListField(child=serializers.CharField())
    index = serializers.JSONField()
    extra = serializers.JSONField()


class Tools4MSPOptionsSerializer(DynamicModelSerializer):
    class Meta:
        model = Tools4MSPOptions
        fields = ['value', 'label', 'group']


class EditCaseStudyRunSerializer(serializers.Serializer):
    visibility = serializers.IntegerField()
    description = serializers.CharField(allow_null=True, required=False, allow_blank=True)
    label = serializers.CharField()


class UserSerializer(DynamicModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
        ]


class RemoteProfileSerializer(DynamicModelSerializer):
    user = DynamicRelationField('UserSerializer', embed=True)

    class Meta:
        model = RemoteProfile
        fields = ('remote_id', 'user',)
        name = 'user'

