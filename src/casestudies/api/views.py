import json
import traceback
from logging import getLogger

import requests
from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.http import HttpResponse
from dynamic_rest.viewsets import DynamicModelViewSet
from dynamic_rest.filters import DynamicFilterBackend, DynamicSortingFilter
from geonode.people.models import Profile
from geonode.maps.models import Map
from geonode.documents.models import Document
from rest_framework.exceptions import ValidationError, APIException
from rest_framework.decorators import action
from rest_framework import permissions
from rest_framework.parsers import MultiPartParser

from casestudies.api import serializers
from casestudies.libs import (
    Matrix,
    randomString,
)
from casestudies.models import (
    RemoteProfile,
    Tools4MSPOptions,
)
from core.libs import (
    APIError,
    call_api,
)
from core.views import RESTBaseViewSet
from geodatabuilder.libs import (
    compute_expression,
    GDALGenenericException,
    rasterize_layer_to_grid,
)


logger = getLogger(__name__)


class CasestudyViewSet(RESTBaseViewSet):
    def list(self, request, **kwargs):
        extra = {}
        if request.GET.get('search', ''):
            extra['search'] = request.GET.get('search', '')
        try:
            result = call_api(
                url="api/v2/casestudies/",
                params = {
                    "cstype": request.GET.get('cstype', ''),
                    "module": request.GET.get('module', ''),
                    "page": request.GET.get('page', ''),
                    "owner": request.GET.get('owner', ''),
                    **extra,
                },
                user=request.user,
            )
        except APIError as err:
            return self.handle_exception(err)
        logger.debug(result)
        return self.build_response(data=result)

    def retrieve(self, request, pk = None, **kwargs):
        try:
            result = call_api(
                url=f"api/v2/casestudies/{pk}/",
                user=request.user,
            )
        except APIError as err:
            return self.handle_exception(err)
        return self.build_response(data=result)

    def create(self, request, *args, **kwargs):
        serializer = serializers.CreateCaseStudySerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            result = call_api(
                url="api/v2/casestudies/",
                method='POST',
                json = {
                    "label": serializer.validated_data.get('label'),
                    "description": serializer.validated_data.get('description'),
                    "cstype": "customized",
                    "resolution": serializer.validated_data.get('resolution'),
                    "module": serializer.validated_data.get('module'),
                    "domain_area_terms": serializer.validated_data.get('domain_area_terms'),
                },
                user=request.user,
            )
            logger.debug(result)

            call_api(
                url=f"api/v2/casestudies/{result.get('id')}/setcontext/{serializer.validated_data.get('context')}/",
                user=request.user,
            )

            return self.build_response(data=result)
        except APIError as err:
            return self.handle_exception(err)
        except ValidationError:
            logger.debug(serializer.errors)
            return self.build_validation_error(validation_errors=serializer.errors)

    def update(self, request, pk, *args, **kwargs):
        serializer = serializers.EditCaseStudySerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            result = call_api(
                url=f"api/v2/casestudies/{pk}/",
                method='PATCH',
                json = {
                    "label": serializer.validated_data.get('label'),
                    "description": serializer.validated_data.get('description'),
                    "visibility": serializer.validated_data.get('visibility'),
                },
                user=request.user,
            )
            logger.debug(result)
            return self.build_response(data=result)
        except APIError as err:
            return self.handle_exception(err)
        except ValidationError:
            logger.debug(serializer.errors)
            return self.build_validation_error(validation_errors=serializer.errors)


    def destroy(self, request, pk = None, *args, **kwargs):
        try:
            result = call_api(
                url=f"api/v2/casestudies/{pk}/",
                method='DELETE',
                user=request.user,
                )
        except APIError as err:
            return self.handle_exception(err)

        logger.debug(result)
        return self.build_response(data=result)

    @action(detail=True, methods=['POST'])
    def run(self, request, pk):
        serializer = serializers.RunCaseStudySerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            result = call_api(
                    url=f"api/v2/casestudies/{pk}/asyncrunpost/",
                    method='POST',
                    json={
                        "selected_layers" : serializer.validated_data.get('selected_layers'),
                        "domain_area": serializer.validated_data.get('domain_area'),
                    },
                    user=request.user,
                )
            logger.debug(result)
            return self.build_response(data=result)
        except APIError as err:
            return self.handle_exception(err)
        except ValidationError:
            return self.build_validation_error(validation_errors=serializer.errors)

    @action(detail=True, methods=['POST'])
    def clone(self, request, pk):
        serializer = serializers.CloneCaseStudySerializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
            result = call_api(
                url=f"api/v2/casestudies/{pk}/cloneupdate/",
                method='POST',
                json = {
                    "label": serializer.validated_data.get('label'),
                    "description": serializer.validated_data.get('description'),
                },
                user=request.user,
            )
            logger.debug(result)
            return self.build_response(data=result)
        except APIError as err:
            return self.handle_exception(err)
        except ValidationError:
            return self.build_validation_error(validation_errors=serializer.errors)


class CasestudyRunViewSet(RESTBaseViewSet):
    def list(self, request, *args, casestudy_id = None, **kwargs):
        try:
            result = call_api(
                url="api/v2/casestudyruns/",
                params={
                    'casestudy': casestudy_id,
                    'page': request.GET.get('page', 1)
                },
                user=request.user,
            )
        except APIError as err:
            return self.handle_exception(err)
        logger.debug(result)
        return self.build_response(data=result)

    def retrieve(self, request, pk = None, **kwargs):
        try:
            result = call_api(
                url=f"api/v2/casestudyruns/{pk}/",
                user=request.user,
            )
        except APIError as err:
            return self.handle_exception(err)
        logger.debug(result)
        return self.build_response(data=result)

    def partial_update(self, request, pk, *args, **kwargs):
        serializer = serializers.EditCaseStudyRunSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            result = call_api(
                url=f"api/v2/casestudyruns/{pk}/",
                method='PATCH',
                json = {
                    "description": serializer.validated_data.get('description'),
                    "label": serializer.validated_data.get('label'),
                    "visibility": serializer.validated_data.get('visibility'),
                },
                user=request.user,
            )
            logger.debug(result)
            return self.build_response(data=result)
        except APIError as err:
            return self.handle_exception(err)
        except ValidationError:
            logger.debug(serializer.errors)
            return self.build_validation_error(validation_errors=serializer.errors)

    def destroy(self, request, pk = None, *args, **kwargs):
        try:
            result = call_api(
                url=f"api/v2/casestudyruns/{pk}/",
                method='DELETE',
                user=request.user,
                )
        except APIError as err:
            return self.handle_exception(err)

        logger.debug(result)
        return self.build_response(data=result)

    @action(detail=True, methods=['POST'])
    def upload_to_geonode(self, request, pk = None, casestudy_id = None, *args, **kwargs):
        try:
            res = call_api(
                url=f"api/v2/casestudyruns/{pk}/",
                user=request.user,
            )
        except APIError as err:
            return self.handle_exception(err)

        m = None

        with transaction.atomic():
            m = Map.objects.get(id=request.data.get('map_id'))
            map_ctid = ContentType.objects.get_for_model(Map)
            for doc in res.get('outputs'):
                d = Document.objects.create(title=doc.get('label'), owner=request.user, doc_url=doc.get('file'))
                # debug this
                # DocumentResourceLink.objects.create(document=d, object_id=m.id, content_type=map_ctid)

        return self.build_response(data={ 'id': m.pk })


class CasestudyRunOutputLayerViewSet(RESTBaseViewSet):
    def retrieve(self, request, run_id = None, pk = None, *args, **kwargs):
        try:
            result = call_api(
                url=f"api/v2/casestudyruns/{run_id}/",
                user=request.user,
            )
        
        except APIError as err:
            return self.handle_exception(err)

        # First try to find in outputlayers (for layers)
        out = list(filter(lambda l: l.get('code') == pk, result.get('outputlayers', [])))
        
        # If not found in outputlayers, try outputs (for documents)
        if not out:
            out = list(filter(lambda l: l.get('code') == pk, result.get('outputs', [])))
        
        # If still not found, return 404
        if not out:
            return HttpResponse('File not found', status=404)

        response = requests.get(out[0].get('file')).content
        return HttpResponse(response, content_type='application/octet-stream')


    @action(detail=True, methods=['GET'])
    def style(self, request, run_id = None, pk = None, *args, **kwargs):
        try:
            result = call_api(
                url=f"api/v2/casestudyruns/{run_id}/",
                user=request.user,
            )
        except APIError as err:
            return self.handle_exception(err)
        out = list(filter(lambda l: l.get('code') == pk, result.get('outputlayers')))

        response = requests.get(out[0].get('file').replace('tiff', 'sld')).content
        return HttpResponse(response, content_type='application/octet-stream')


class CasestudyInputsViewSet(RESTBaseViewSet):
    def list(self, request, casestudy_id, **kwargs):
        try:
            result = call_api(
                url=f"api/v2/casestudies/{casestudy_id}/inputs/",
                user=request.user
            )
            return self.build_response(data=result)
        except APIError as err:
            return self.handle_exception(err)

    def retrieve(self, request, casestudy_id, pk=None, *args, **kwargs):
        try:
            result = call_api(
                url=f"api/v2/casestudies/{casestudy_id}/inputs/{pk}/",
                user=request.user
            )
        except APIError as err:
            return self.handle_exception(err)
        else:
            try:
                if result.get('file') and '.json' in result.get('file'):
                    content = call_api(full_url=result.get('file'), params={})
                    result["content"] = content
                else:
                    result["content"] = None
            except Exception as e:
                logger.warn(f"Error while reading content of {result.get('code')} for casestudy {casestudy_id} {str(e)}")

            if result["content"]:
                try:
                    result['matrix'] = Matrix.from_json_array(result)
                except KeyError as e:
                    logger.error(traceback.format_exc())
                    logger.error(f"missing {result.get('code')} definition in CODE_MAP")
                except Exception:
                    logger.error(traceback.format_exc())

            logger.debug(result)
            return self.build_response(data=result)

    @action(detail=True, methods=['POST'])
    def upload(self, request, casestudy_id, pk=None):
        serializer = serializers.UploadInputFileSerializer(data=request.data)
        user = request.user
        try:
            serializer.is_valid(raise_exception=True)
            result = call_api(
                url=f"api/v2/casestudies/{casestudy_id}/inputs/{pk}/",
                user=user
            )
            data = Matrix.to_json_array(serializer.validated_data)

            headers = {}
            if user and user.is_authenticated and hasattr(user, 'remote_profile'):
                token = user.remote_profile.token
                headers = {'Authorization': f'Token {token}'}

            filename = f"{randomString()}.json"
            r = requests.put(f"{result.get('url')}/upload/", headers=headers, files={'file': (filename, json.dumps(data))})
            logger.error(f"tools4msp responded with {r.status_code} - {r.text}")
            return self.build_response()
        except APIError as err:
            return self.handle_exception(err)
        except ValidationError:
            return self.build_validation_error(validation_errors=serializer.errors)

    @action(detail=True, methods=['POST'], parser_classes=(MultiPartParser, ))
    def thumbnailupload(self, request, casestudy_id, pk=None):
        user = request.user
        try:
            result = call_api(
                url=f"api/v2/casestudies/{casestudy_id}/inputs/{pk}/",
                user=user
            )

            headers = {}
            if user and user.is_authenticated and hasattr(user, 'remote_profile'):
                token = user.remote_profile.token
                headers = {'Authorization': f'Token {token}'}

            file = request.FILES.get('file')
            r = requests.put(f"{result.get('url')}/tupload/", headers=headers, files={'file': (file.name, file)})
            logger.error(f"tools4msp responded with {r.status_code} - {r.text}")
            return self.build_response()
        except APIError as err:
            return self.handle_exception(err)
        except Exception as e:
            return self.build_response(data={
                'success': False,
                'detail': e.message
            })


class CasestudyLayersViewSet(RESTBaseViewSet):
    def list(self, request, casestudy_id, **kwargs):
        try:
            result = call_api(
                url=f"api/v2/casestudies/{casestudy_id}/layers/",
                user=request.user
            )
        except APIError as err:
            return self.handle_exception(err)
        logger.debug(result)
        return self.build_response(data=result)

    @action(detail=False, methods=['POST'])
    def upload(self, request, casestudy_id):
        try:
            rasterized_path = rasterize_layer_to_grid(attribute=request.data.get('attribute'),
                                    grid=request.data.get('grid'),
                                    layer_id=request.data.get('layer_id'),
                                    res=request.data.get('resolution'))

            result = call_api(
                url=f"api/v2/casestudies/{casestudy_id}/layers/",
                method='POST',
                json = {
                    "coded_label": request.data.get('codedlabel').get('url'),
                    "description": request.data.get('description')
                },
                user=request.user)

            logger.error(result)

            headers = {'Authorization': f'Token {request.user.remote_profile.token}'}

            with open(rasterized_path, 'rb') as f:
                r = requests.put(f'{result.get("url")}upload/', headers=headers, files={'file': f})
                if r.status_code != 201:
                    logger.error(r.status_code, r.content)

            return self.build_response(data={
                'success': True,
            })
        except APIError as err:
            return self.handle_exception(err)
        except GDALGenenericException as e:
            return self.build_response(data={
                'success': False,
                'detail': e.message
            })

    @action(detail=False, methods=['POST'])
    def upload_geodatabuilder(self, request, casestudy_id):
        try:
            rasterized_path = compute_expression(grid=request.data.get('grid'),
                                    geodatabuilder_id=request.data.get('geodatabuilder_id'),
                                    resolution=request.data.get('resolution'))

            result = call_api(
                url=f"api/v2/casestudies/{casestudy_id}/layers/",
                method='POST',
                json={
                    "coded_label": request.data.get('codedlabel').get('url'),
                    "description": request.data.get('description')
                },
                user=request.user)

            headers = {'Authorization': f'Token {request.user.remote_profile.token}'}

            with open(rasterized_path, 'rb') as f:
                r = requests.put(f'{result.get("url")}upload/', headers=headers, files={'file': f})
                if r.status_code != 201:
                    logger.error(r.status_code, r.content)


            return self.build_response(data={
                'success': True,
            })
        except APIError as err:
            return self.handle_exception(err)
        except GDALGenenericException as e:
            return self.build_response(data={
                'success': False,
                'detail': e.message
            })

    def update(self, request, casestudy_id, pk=None, *args, **kwargs):
        try:
            result = call_api(
                url=f"api/v2/casestudies/{casestudy_id}/layers/{pk}/",
                user=request.user,
                method='PATCH',
                json=request.data,
            )
        except APIError as err:
            return self.handle_exception(err)
        logger.debug(result)
        return self.build_response(data=result)


    def destroy(self, request, casestudy_id, pk = None, *args, **kwargs):
        try:
            result = call_api(
                url=f"api/v2/casestudies/{casestudy_id}/layers/{pk}/",
                user=request.user,
                method='DELETE'
                )
        except APIError as err:
            return self.handle_exception(err)

        logger.debug(result)
        return self.build_response(data=result)


class CodedlabelsViewSet(RESTBaseViewSet):
    def list(self, request, **kwargs):
        csid = request.GET.get('case_study_id', None)
        params = {}

        if csid:
            params['case_study_id'] = int(csid)

        if request.GET.get('search'):
            params['search'] = request.GET.get('search')

        try:
            result = call_api(
                url="api/v2/codedlabels/", params=params,
                user=request.user
            )
        except APIError as err:
            return self.handle_exception(err)
        return self.build_response(data=result)


class ContextsViewSet(RESTBaseViewSet):
    def list(self, request, **kwargs):
        try:
            result = call_api(
                url="api/v2/contexts/",
                params=request.GET,
                user=request.user
            )
        except APIError as err:
            return self.handle_exception(err)
        return self.build_response(data=result)


class DomainAreaViewSet(RESTBaseViewSet):
    def list(self, request, **kwargs):
        try:
            result = call_api(
                url="api/v2/domainareas/",
                user=request.user,
                params=request.GET,
            )
        except APIError as err:
            return self.handle_exception(err)
        return self.build_response(data=result)


class Tools4MSPOptionsViewSet(DynamicModelViewSet):
    queryset = Tools4MSPOptions.objects.all()
    serializer_class = serializers.Tools4MSPOptionsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [
        DynamicFilterBackend, DynamicSortingFilter,
    ]


class RemoteProfileViewSet(DynamicModelViewSet):
    queryset = RemoteProfile.objects.all()
    serializer_class = serializers.RemoteProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [
        DynamicFilterBackend, DynamicSortingFilter,
    ]
