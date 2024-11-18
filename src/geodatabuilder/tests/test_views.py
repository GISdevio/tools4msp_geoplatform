import json
from geodatabuilder.models import GeoDataBuilder
import pytest
from unittest import mock, TestCase
from django.urls import reverse
from django.test import Client
from django.http import HttpResponse
from urllib.parse import urlparse
from django.urls import resolve

from rest_framework.test import APIClient

from django.contrib.auth import get_user_model

User = get_user_model()


class ExtendedHttpResponse(HttpResponse):
    def __init__(self, content, *args, debug_context = {}, **kwargs):
        super().__init__(content, *args, **kwargs)
        self.debug_context = debug_context


def return_context(_req, _template, context):
    return ExtendedHttpResponse('', status=200, debug_context=context)


def return_empty(*args, **kwargs):
    return "TEST"


def get_empty_template(*args, **kwargs):
    return ['test/base.html']


@pytest.mark.django_db
class TestGeodatabuilderList(TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.url = reverse('geodatabuilder_list')
        self.auth_client = Client()
        self.client = Client()

    def setUp(self):
        u = User.objects.create(username='test', email='test@test.it')
        self.auth_client.force_login(u)


    @mock.patch('geodatabuilder.views.call_api', return_value={
        "tag": 'test',
        "layers": [],
    })
    @mock.patch('geodatabuilder.views.render', side_effect=return_context)
    def test_list(self, *args, **kwargs):
        resp = self.client.get(self.url)
        print(resp.debug_context)
        assert resp.status_code == 200
        assert resp.debug_context['current_page'] == '1'
        assert resp.debug_context['num_pages'] == 1
        assert len(resp.debug_context['items']) == 0
        assert len(resp.debug_context['geodatabuilders_user']) == 0


@pytest.mark.django_db
class TestGeodatabuilderDetail(TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.auth_client = Client()
        self.client = Client()

    def setUp(self):
        u = User.objects.create(username='test', email='test@test.it')
        self.auth_client.force_login(u)
        self.user = u
        self.gdb = GeoDataBuilder.objects.create(
            desc_expression='',
            expression_id_string='',
            owner=u,
            label='test',
            casestudy_api_id='1',
        )

    @mock.patch('geodatabuilder.views.render', side_effect=return_context)
    def test_detail_unauth(self, *args, **kwargs):
        url = reverse('geodatabuilder_detail', kwargs={'id': self.gdb.id})
        resp = self.client.get(url)
        assert resp.status_code == 200
        assert resp.debug_context['geodatabuilder'] == self.gdb

    @mock.patch('geodatabuilder.views.render', side_effect=return_context)
    def test_detail(self, *args, **kwargs):
        url = reverse('geodatabuilder_detail', kwargs={'id': self.gdb.id})
        resp = self.auth_client.get(url)
        assert resp.status_code == 200
        assert resp.debug_context['geodatabuilder'] == self.gdb
        assert resp.debug_context['user'] == self.user

    @mock.patch('geodatabuilder.views.render', side_effect=return_context)
    def test_detail_404(self, *args, **kwargs):
        url = reverse('geodatabuilder_detail', kwargs={'id': 99999 })
        resp = self.auth_client.get(url)
        assert resp.status_code == 404


@pytest.mark.django_db
class TestGeodatabuilderEdit(TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.auth_client = Client()
        self.client = Client()

    def setUp(self):
        u = User.objects.create(username='test', email='test@test.it')
        self.auth_client.force_login(u)
        self.user = u
        self.gdb = GeoDataBuilder.objects.create(
            desc_expression='',
            expression_id_string='',
            owner=u,
            label='test',
            casestudy_api_id='1',
        )

    @mock.patch('geodatabuilder.views.render', side_effect=return_context)
    def test_edit_unauth(self, *args, **kwargs):
        url = reverse('geodatabuilder_edit', kwargs={'id': self.gdb.id})
        resp = self.client.get(url)
        assert resp.status_code == 302

    @mock.patch('geodatabuilder.views.UpdateView.get_template_names', side_effect=get_empty_template)
    def test_edit_get(self, *args, **kwargs):
        url = reverse('geodatabuilder_edit', kwargs={'id': self.gdb.id})
        resp = self.auth_client.get(url)
        assert resp.status_code == 200

    @mock.patch('geodatabuilder.views.UpdateView.get_template_names', side_effect=get_empty_template)
    def test_edit_post_invalid(self, *args, **kwargs):
        url = reverse('geodatabuilder_edit', kwargs={'id': self.gdb.id})
        resp = self.auth_client.post(url, {
            'label': 'test updated',
            'expression_id_string': '',
            'casestudy_api_id': '1',
        })
        assert resp.status_code == 200

    def test_edit_post(self, *args, **kwargs):
        url = reverse('geodatabuilder_edit', kwargs={'id': self.gdb.id})
        resp = self.auth_client.post(url, {
            'label': 'test updated',
            'expression_id_string': '1',
            'casestudy_api_id': '1',
            'desc_expression': 'test',
            'expression': 'test'
        })
        assert resp.status_code == 302

    def test_edit_post_json(self, *args, **kwargs):
        url = reverse('geodatabuilder_edit', kwargs={'id': self.gdb.id})
        headers = {'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest'}
        resp = self.auth_client.post(url, {
            'label': 'test updated',
            'expression_id_string': '1',
            'casestudy_api_id': '1',
            'desc_expression': 'test',
            'expression': 'test'
        }, **headers)
        assert resp.status_code == 200

    @mock.patch('geodatabuilder.views.render', side_effect=return_context)
    def test_edit_404(self, *args, **kwargs):
        url = reverse('geodatabuilder_edit', kwargs={'id': 99999 })
        resp = self.auth_client.get(url)
        assert resp.status_code == 404


@pytest.mark.django_db
class TestGeodatabuilderCreate(TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.auth_client = Client()
        self.client = Client()
        self.url = reverse('geodatabuilder_create')

    def setUp(self):
        u = User.objects.create(username='test', email='test@test.it')
        self.auth_client.force_login(u)
        self.user = u

    @mock.patch('geodatabuilder.views.render', side_effect=return_context)
    def test_create_unauth(self, *args, **kwargs):
        resp = self.client.get(self.url)
        assert resp.status_code == 302

    @mock.patch('geodatabuilder.views.CreateView.get_template_names', side_effect=get_empty_template)
    def test_create_get(self, *args, **kwargs):
        resp = self.auth_client.get(self.url)
        assert resp.status_code == 200

    @mock.patch('geodatabuilder.views.CreateView.get_template_names', side_effect=get_empty_template)
    def test_create_post_invalid(self, *args, **kwargs):
        resp = self.auth_client.post(self.url, {
            'label': 'test updated',
            'expression_id_string': '',
            'casestudy_api_id': '1',
        })
        assert resp.status_code == 200

    def test_create_post(self, *args, **kwargs):
        resp = self.auth_client.post(self.url, {
            'label': 'test updated',
            'expression_id_string': '1',
            'casestudy_api_id': '1',
            'desc_expression': 'test',
            'expression': 'test'
        })
        assert resp.status_code == 302

    def test_create_post_invalid_ajax(self, *args, **kwargs):
        resp = self.auth_client.post(self.url + '?no__redirect=1', {
            'label': 'test',
        })
        assert resp.status_code == 400

    def test_create_post_ajax(self, *args, **kwargs):
        resp = self.auth_client.post(self.url + '?no__redirect=1', {
            'label': 'test',
            'expression_id_string': '1',
            'casestudy_api_id': '1',
            'desc_expression': 'test',
            'expression': 'test'
        })
        assert resp.status_code == 200


@pytest.mark.django_db
class TestGeodatabuilderDelete(TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.auth_client = Client()
        self.other_client = Client()
        self.client = Client()

    def setUp(self):
        u = User.objects.create(username='test', email='test@test.it')
        other = User.objects.create(username='test2', email='test2@test.it')
        self.auth_client.force_login(u)
        self.other_client.force_login(other)
        self.user = u
        self.gdb = GeoDataBuilder.objects.create(
            desc_expression='',
            expression_id_string='',
            owner=u,
            label='test',
            casestudy_api_id='1',
        )
        self.url = reverse('geodatabuilder_remove', kwargs={'id': self.gdb.id })

    @mock.patch('geodatabuilder.views.render', side_effect=return_context)
    def test_delete_unauth(self, *args, **kwargs):
        resp = self.client.get(self.url)
        assert resp.status_code == 302

    @mock.patch('geodatabuilder.views.DeleteView.get_template_names', side_effect=get_empty_template)
    def test_delete_get(self, *args, **kwargs):
        resp = self.auth_client.get(self.url)
        assert resp.status_code == 200

    def test_delete_other_post(self, *args, **kwargs):
        resp = self.other_client.post(self.url)
        assert resp.status_code == 302
        assert GeoDataBuilder.objects.get(id=self.gdb.id)

    def test_delete_post(self, *args, **kwargs):
        id = self.gdb.id
        resp = self.auth_client.post(self.url)
        assert resp.status_code == 302
        with pytest.raises(GeoDataBuilder.DoesNotExist):
            GeoDataBuilder.objects.get(id=id)

    def test_delete_post_json_plain_text(self, *args, **kwargs):
        self.gdb = GeoDataBuilder.objects.create(
            desc_expression='',
            expression_id_string='',
            owner=self.user,
            label='test',
            casestudy_api_id='1',
        )
        id = self.gdb.id
        self.url = reverse('geodatabuilder_remove', kwargs={'id': self.gdb.id })
        headers = {'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest'}
        resp = self.auth_client.post(self.url, **headers)
        assert resp.status_code == 200
        assert resp.content.decode('utf-8') == 'true'
        assert resp['Content-Type'] == "text/plain"
        with pytest.raises(GeoDataBuilder.DoesNotExist):
            GeoDataBuilder.objects.get(id=id)
    
    def test_delete_post_json_with_accept_json(self, *args, **kwargs):
        self.gdb = GeoDataBuilder.objects.create(
            desc_expression='',
            expression_id_string='',
            owner=self.user,
            label='test',
            casestudy_api_id='1',
        )
        id = self.gdb.id
        self.url = reverse('geodatabuilder_remove', kwargs={'id': self.gdb.id })
        headers = {'HTTP_X_REQUESTED_WITH': 'XMLHttpRequest', 'HTTP_ACCEPT': 'application/json'}
        resp = self.auth_client.post(self.url, **headers)
        assert resp.status_code == 200
        assert resp.content.decode('utf-8') == 'true'
        assert resp['Content-Type'] == "application/json"
        with pytest.raises(GeoDataBuilder.DoesNotExist):
            GeoDataBuilder.objects.get(id=id)


@pytest.mark.django_db
class TestGeodatabuilderClone(TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.auth_client = Client()
        self.other_client = Client()
        self.client = Client()

    def setUp(self):
        u = User.objects.create(username='test', email='test@test.it')
        other = User.objects.create(username='test2', email='test2@test.it')
        self.auth_client.force_login(u)
        self.other_client.force_login(other)
        self.user = u
        self.gdb = GeoDataBuilder.objects.create(
            desc_expression='',
            expression_id_string='',
            owner=other,
            label='test',
            casestudy_api_id='1',
        )
        self.url = reverse('geodatabuilder_clone', kwargs={'id': self.gdb.id })

    @mock.patch('geodatabuilder.views.render', side_effect=return_context)
    def test_clone_unauth(self, *args, **kwargs):
        resp = self.client.get(self.url)
        assert resp.status_code == 302

    @mock.patch('geodatabuilder.views.render', side_effect=return_context)
    def test_clone_post(self, *args, **kwargs):
        resp = self.auth_client.post(self.url, {
            'desc_expression': 'test',
        })
        assert resp.status_code == 302
        view, args, kwargs = resolve(urlparse(resp.url)[2])
        gdb = GeoDataBuilder.objects.get(id=kwargs['id'])
        assert gdb.id != self.gdb.id
        assert gdb.label == self.gdb.label
        assert gdb.desc_expression != self.gdb.desc_expression
        assert gdb.owner == self.user


@pytest.mark.django_db
class TestGeodatabuilderExpressionLayers(TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.auth_client = Client()
        self.other_client = Client()
        self.client = Client()

    def setUp(self):
        u = User.objects.create(username='test', email='test@test.it')
        other = User.objects.create(username='test2', email='test2@test.it')
        self.auth_client.force_login(u)
        self.other_client.force_login(other)
        self.user = u
        self.gdb = GeoDataBuilder.objects.create(
            desc_expression='',
            expression_id_string='',
            owner=other,
            label='test',
            casestudy_api_id='1',
        )
        self.url = reverse('geodatabuilder_expressionlayers')

    @mock.patch('geodatabuilder.management.commands.expressionlayers.subprocess.check_output', side_effect=return_empty)
    @mock.patch('geodatabuilder.views.render', side_effect=return_context)
    def test_get(self, *args, **kwargs):
        resp = self.client.get(f'{self.url}?expression=0&grid=test')
        assert resp.status_code == 200
        content = json.loads(resp.content)
        assert content['success'] == True


    @mock.patch('geodatabuilder.views.render', side_effect=return_context)
    def test_get_fail(self, *args, **kwargs):
        resp = self.client.get(f'{self.url}?expression=')
        assert resp.status_code == 200
        content = json.loads(resp.content)
        assert content['success'] == False