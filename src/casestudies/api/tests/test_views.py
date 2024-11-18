import json
import pytest
from unittest import mock, TestCase
from django.urls import reverse
from django.test import Client
from django.conf import settings

from rest_framework.test import APIClient

from django.contrib.auth import get_user_model

User = get_user_model()


def is_valid_json(string):
    try:
        return True, json.loads(string)
    except ValueError:
        return False, None


def raise_connection_error(*args, **kwargs):
    raise ConnectionError()


def handle_call(arg, *args, **kwargs):
    if arg == 'test.json':
        return [{'u': 'A', 'p': 'C', 'v': 1 }]

    else:
        return {'file': 'test.json', 'code': 'SENS'}

@pytest.mark.django_db
class TestCaseStudyList(TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.url = reverse('casestudy-list')
        self.auth_client = Client()
        self.client = Client()

    def setUp(self):
        u = User.objects.create(username='test', email='test@test.it')
        self.auth_client.force_login(u)

    @mock.patch('casestudies.api.views.call_api', return_value=[])
    @pytest.mark.skip(reason='Review of the authentication')
    def test_unauthenticated(self, mock):
        response = self.client.get(self.url)
        assert response.status_code == 302

    @mock.patch('casestudies.api.views.call_api', return_value=[{ 'tag': 'test'}])
    def test_get(self, mock):
        c = self.auth_client
        response = c.get(self.url)
        assert response.status_code == 200
        valid, content = is_valid_json(response.content)
        assert valid
        assert 'data' in content
        assert 'error' not in content

        assert content['data'][0]['pdm_owner']['full_name'] == 'test'

    @mock.patch('casestudies.api.views.call_api', return_value=[{ 'tag': 'test2'}])
    def test_get_populate(self, mock):
        c = self.auth_client
        response = c.get(self.url)
        assert response.status_code == 200
        valid, content = is_valid_json(response.content)
        assert valid
        assert 'data' in content
        assert 'error' not in content

        assert content['data'][0]['pdm_owner']['full_name'] == 'test2'

    
    @mock.patch('casestudies.api.views.call_api', side_effect=raise_connection_error)
    def test_connection_error(self, mock):
        c = self.auth_client
        response = c.get(self.url)
        assert response.status_code == 503
        valid, content = is_valid_json(response.content)
        assert valid
        assert 'error' in content


@pytest.mark.django_db
class TestCaseStudyDetail(TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.url = reverse('casestudy-detail', kwargs={'pk': '100'})
        self.auth_client = Client()
        self.client = Client()

    def setUp(self):
        u = User.objects.create(username='test', email='test@test.it')
        self.auth_client.force_login(u)

    @mock.patch('casestudies.api.views.call_api', return_value=[])
    @pytest.mark.skip(reason='Review of the authentication')
    def test_unauthenticated(self, mock):
        response = self.client.get(self.url)
        assert response.status_code == 302

    @mock.patch('casestudies.api.views.call_api', return_value=[])
    def test_get(self, mock):
        c = self.auth_client
        response = c.get(self.url)
        assert response.status_code == 200
        valid, content = is_valid_json(response.content)
        assert valid
        assert 'data' in content
        assert 'error' not in content


@pytest.mark.django_db
class TestCaseStudyInputList(TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.url = reverse('casestudyinput-list', kwargs={"casestudy_id": '100'})
        self.auth_client = Client()
        self.client = Client()

    def setUp(self):
        u = User.objects.create(username='test', email='test@test.it')
        self.auth_client.force_login(u)

    @mock.patch('casestudies.api.views.call_api', return_value=[])
    @pytest.mark.skip(reason='Review of the authentication')
    def test_unauthenticated(self, mock):
        response = self.client.get(self.url)
        assert response.status_code == 302

    @mock.patch('casestudies.api.views.call_api', return_value=[])
    def test_get(self, mock):
        c = self.auth_client
        response = c.get(self.url)
        assert response.status_code == 200
        valid, content = is_valid_json(response.content)
        assert valid
        assert 'data' in content
        assert 'error' not in content


@pytest.mark.django_db
class TestCaseStudyInputDetail(TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.url = reverse('casestudyinput-detail', kwargs={"casestudy_id": '100', 'pk': '100'})
        self.auth_client = Client()
        self.client = Client()

    def setUp(self):
        u = User.objects.create(username='test', email='test@test.it')
        self.auth_client.force_login(u)

    @mock.patch('casestudies.api.views.call_api', return_value={})
    @pytest.mark.skip(reason='Review of the authentication')
    def test_unauthenticated(self, mock):
        response = self.client.get(self.url)
        assert response.status_code == 302

    @mock.patch('casestudies.api.views.call_api', side_effect=handle_call)
    def test_get(self, mock):
        c = self.auth_client
        response = c.get(self.url)
        assert response.status_code == 200
        valid, content = is_valid_json(response.content)
        assert valid
        assert 'data' in content
        assert 'error' not in content


@pytest.mark.django_db
class TestCaseStudyInputUpload(TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.url = reverse('casestudyinput-upload', kwargs={'pk': '100', 'casestudy_id': '100'})
        self.auth_client = APIClient()
        self.client = Client()

    def setUp(self):
        u = User.objects.create(username='test', email='test@test.it')
        self.auth_client.force_login(u)


    @mock.patch('casestudies.api.views.call_api', return_value=[])
    @pytest.mark.skip(reason='review authentication')
    def test_unauthenticated(self, mock):
        response = self.client.get(self.url)
        assert response.status_code == 302
    
        response = self.client.post(self.url)
        assert response.status_code == 302

    @mock.patch('casestudies.api.views.call_api', return_value={ 'tag': 'test-fail' })
    @pytest.mark.skip(reason='TODO')
    def test_post_fail_permissions(self, mock):
        c = self.auth_client
        response = c.post(self.url, {})
        assert response.status_code == 403
        valid, content = is_valid_json(response.content)
        assert valid
        assert 'error' in content
        assert content['error']['message']


    @mock.patch('casestudies.api.views.call_api', return_value={ 'tag': 'test-fail' })
    def test_post_fail(self, mock):
        c = self.auth_client
        response = c.post(self.url, {})
        assert response.status_code == 400
        valid, content = is_valid_json(response.content)
        assert valid
        assert 'error' in content
        assert content['error']['message']
        details = content['error']['details']
        targets = list(map(lambda err: err.get('target'), details))
        assert all([
            'x' in targets,
            'y' in targets,
            'index' in targets,
            'cols' in targets,
            'rows' in targets,
            'values' in targets,
        ])

        response = c.post(self.url, {'cols': 'test', 'values': 1, 'rows': 'test', 'index': '', 'x': 'a', 'y': 'b'})
        valid, content = is_valid_json(response.content)
        assert valid
        assert 'error' in content
        assert content['error']['message']
        details = content['error']['details']
        targets = list(map(lambda err: err.get('target'), details))
        assert all([
            'index' in targets,
            # 'cols' in targets,
            # 'rows' in targets,
            # 'values' in targets,
        ])


    @mock.patch('casestudies.api.views.call_api', return_value={ 'tag': 'test' })
    @mock.patch('casestudies.api.views.requests.put', return_value=None)
    def test_post_success(self, mock, mock2):
        c = self.auth_client
        response = c.post(self.url, {
            'cols': ['A', 'B'], 
            'rows': ['C', 'D'],
            'x': 'x',
            'y': 'y',
            'values': ['v'],
            'index': {
                "x$A#y$C": { 'v': 1 },
                "x$A#y$D": { 'v': 1 },
                "x$B#y$C": { 'v': 2 },
                "x$B#y$D": { 'v': 1 },
            }
        }, format='json')
        assert response.status_code == 200
        valid, content = is_valid_json(response.content)
        assert valid
        assert 'error' not in content



@pytest.mark.django_db
class TestCaseStudyRun(TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.url = reverse('casestudy-run', kwargs={'pk': '100'})
        self.auth_client = Client()
        self.client = Client()
    
    def setUp(self):
        u, created = User.objects.get_or_create(username='test', email='test@test.it')
        self.auth_client.force_login(u)

    @mock.patch('casestudies.api.views.call_api', return_value=[])
    @pytest.mark.skip(reason='Permissioning must be reviewed')
    def test_unauthenticated(self, mock):
        c = self.client
        response = c.post(self.url, {})
        assert response.status_code == 302

    @mock.patch('casestudies.api.views.call_api', return_value={ 'test': 1 })
    def test_no_id_provided(self, mock):
        print(self.url)
        c = self.auth_client
        response = c.post(self.url, {})
        print(response.content)
        assert response.status_code == 400
        valid, content = is_valid_json(response.content)
        assert 'error' in content
        assert content['error']['message']
        assert content['error']['details'][0]['target'] == 'selected_layers'

    @mock.patch('casestudies.api.views.call_api', return_value={ 'test': 1 })
    def test_id_provided(self, mock):
        c = self.auth_client
        response = c.post(self.url, {'selected_layers': '10,11'})
        assert response.status_code == 200
        valid, content = is_valid_json(response.content)
        assert valid
        assert 'data' in content
        assert 'error' not in content


@pytest.mark.django_db
class TestCaseStudyRunList(TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.url = reverse('casestudyrun-list', kwargs={"casestudy_id": '100'})
        self.auth_client = Client()
        self.client = Client()

    def setUp(self):
        u = User.objects.create(username='test', email='test@test.it')
        self.auth_client.force_login(u)

    @mock.patch('casestudies.api.views.call_api', return_value=[])
    @pytest.mark.skip(reason='Review of the authentication')
    def test_unauthenticated(self, mock):
        response = self.client.get(self.url)
        assert response.status_code == 302

    @mock.patch('casestudies.api.views.call_api', return_value=[])
    def test_get(self, mock):
        c = self.auth_client
        response = c.get(self.url)
        assert response.status_code == 200
        valid, content = is_valid_json(response.content)
        assert valid
        assert 'data' in content
        assert 'error' not in content


@pytest.mark.django_db
class TestCaseStudyRunDetail(TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.url = reverse('casestudyrun-detail', kwargs={"casestudy_id": '100', 'pk': '1'})
        self.auth_client = Client()
        self.client = Client()

    def setUp(self):
        u = User.objects.create(username='test', email='test@test.it')
        self.auth_client.force_login(u)

    @mock.patch('casestudies.api.views.call_api', return_value=[])
    @pytest.mark.skip(reason='Review of the authentication')
    def test_unauthenticated(self, mock):
        response = self.client.get(self.url)
        assert response.status_code == 302

    @mock.patch('casestudies.api.views.call_api', return_value=[])
    def test_get(self, mock):
        c = self.auth_client
        response = c.get(self.url)
        assert response.status_code == 200
        valid, content = is_valid_json(response.content)
        assert valid
        assert 'data' in content
        assert 'error' not in content


@pytest.mark.django_db
class TestCaseStudyLayersList(TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.url = reverse('casestudylayer-list', kwargs={"casestudy_id": '100'})
        self.auth_client = Client()
        self.client = Client()

    def setUp(self):
        u = User.objects.create(username='test', email='test@test.it')
        self.auth_client.force_login(u)

    @mock.patch('casestudies.api.views.call_api', return_value=[])
    @pytest.mark.skip(reason='Review of the authentication')
    def test_unauthenticated(self, mock):
        response = self.client.get(self.url)
        assert response.status_code == 302

    @mock.patch('casestudies.api.views.call_api', return_value=[])
    def test_get(self, mock):
        c = self.auth_client
        response = c.get(self.url)
        assert response.status_code == 200
        valid, content = is_valid_json(response.content)
        assert valid
        assert 'data' in content
        assert 'error' not in content


@pytest.mark.django_db
class TestCaseStudyClone(TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.url = reverse('casestudy-clone', kwargs={'pk': '100'})
        self.auth_client = Client()
        self.client = Client()

    def setUp(self):
        u = User.objects.create(username='test', email='test@test.it')
        self.auth_client.force_login(u)

    @mock.patch('casestudies.api.views.call_api', return_value=[])
    @pytest.mark.skip(reason='Review of the authentication')
    def test_unauthenticated(self, mock):
        response = self.client.get(self.url)
        assert response.status_code == 302

    @mock.patch('casestudies.api.views.call_api', return_value=[{ 'test': 1 }])
    def test_using_get(self, mock):
        response = self.auth_client.get(self.url)
        assert response.status_code == 405

    @mock.patch('casestudies.api.views.call_api', return_value=[{ 'test': 1 }])
    def test_post(self, mock):
        c = self.auth_client
        response = c.post(self.url, {'label': 'test', 'description': 'test'})
        assert response.status_code == 200
        valid, content = is_valid_json(response.content)
        assert valid
        assert 'error' not in content


    @mock.patch('casestudies.api.views.call_api', return_value=[{ 'test': 1 }])
    def test_post_fail(self, mock):
        c = self.auth_client
        response = c.post(self.url, {'description': 'test'})
        assert response.status_code == 400
        valid, content = is_valid_json(response.content)
        assert valid
        assert 'error' in content
        assert content['error']['message']
        assert content['error']['details'][0]['target'] == 'label'


@pytest.mark.django_db
class TestCaseStudyEdit(TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.url = reverse('casestudy-detail', kwargs={'pk': '100'})
        self.auth_client = APIClient()
        self.client = Client()

    def setUp(self):
        u = User.objects.create(username='test', email='test@test.it')
        self.auth_client.force_login(u)


    @mock.patch('casestudies.api.views.call_api', return_value=[])
    @pytest.mark.skip(reason='review authentication')
    def test_unauthenticated(self, mock):
        response = self.client.get(self.url)
        assert response.status_code == 302
    
        response = self.client.post(self.url)
        assert response.status_code == 302

    @mock.patch('casestudies.api.views.call_api', return_value={ 'tag': 'test-fail' })
    def test_post_fail_permissions(self, mock):
        c = self.auth_client
        response = c.put(self.url, {'label': 'test', 'description': 'test'})
        assert response.status_code == 403
        valid, content = is_valid_json(response.content)
        assert valid
        assert 'error' in content
        assert content['error']['message']


    @mock.patch('casestudies.api.views.call_api', return_value={ 'tag': 'test-fail' })
    def test_post_fail(self, mock):
        c = self.auth_client
        response = c.put(self.url, {'description': 'test'})
        assert response.status_code == 400
        valid, content = is_valid_json(response.content)
        assert valid
        assert 'error' in content
        assert content['error']['message']
        assert content['error']['details'][0]['target'] == 'label'

    @mock.patch('casestudies.api.views.call_api', return_value={ 'tag': 'test' })
    def test_post_success(self, mock):
        c = self.auth_client
        response = c.put(self.url, {'label': 'test', 'description': 'test'})
        assert response.status_code == 200
        valid, content = is_valid_json(response.content)
        assert valid
        assert 'error' not in content


@pytest.mark.django_db
class TestCaseStudyDelete(TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.url = reverse('casestudy-detail', kwargs={'pk': '100'})
        self.auth_client = Client()
        self.client = Client()

    def setUp(self):
        u = User.objects.create(username='test', email='test@test.it')
        self.auth_client.force_login(u)

    @mock.patch('casestudies.api.views.call_api', return_value=[])
    @pytest.mark.skip()
    def test_unauthenticated(self, mock):
        response = self.client.get(self.url)
        assert response.status_code == 302
    
        response = self.client.post(self.url)
        assert response.status_code == 302

    @mock.patch('casestudies.api.views.call_api', return_value={ 'tag': 'test-fail' })
    def test_post_fail(self, mock):
        c = self.auth_client
        response = c.delete(self.url)
        assert response.status_code == 403
        valid, content = is_valid_json(response.content)
        assert valid
        assert 'error' in content
        assert content['error']['message']


    @mock.patch('casestudies.api.views.call_api', return_value={ 'tag': 'test' })
    def test_post_success(self, mock):
        c = self.auth_client
        response = c.delete(self.url)
        assert response.status_code == 200
        valid, content = is_valid_json(response.content)
        assert valid
        assert 'error' not in content




@pytest.mark.django_db
class TestCaseStudyLayerDelete(TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.url = reverse('casestudylayer-detail', kwargs={'pk': '100', 'casestudy_id': '100'})
        self.auth_client = Client()
        self.client = Client()

    def setUp(self):
        u = User.objects.create(username='test', email='test@test.it')
        self.auth_client.force_login(u)

    @mock.patch('casestudies.api.views.call_api', return_value=[])
    @pytest.mark.skip()
    def test_unauthenticated(self, mock):
        response = self.client.get(self.url)
        assert response.status_code == 302
    
        response = self.client.post(self.url)
        assert response.status_code == 302

    @mock.patch('casestudies.api.views.call_api', return_value={ 'tag': 'test-fail' })
    def test_post_fail(self, mock):
        c = self.auth_client
        response = c.delete(self.url)
        assert response.status_code == 403
        valid, content = is_valid_json(response.content)
        assert valid
        assert 'error' in content
        assert content['error']['message']


    @mock.patch('casestudies.api.views.call_api', return_value={ 'tag': 'test' })
    def test_post_success(self, mock):
        c = self.auth_client
        response = c.delete(self.url)
        assert response.status_code == 200
        valid, content = is_valid_json(response.content)
        assert valid
        assert 'error' not in content

