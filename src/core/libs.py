import logging
import urllib.parse
from json.decoder import JSONDecodeError

import requests
from django.conf import settings
from django.contrib.auth.models import User

from casestudies import models


logger = logging.getLogger('casestudies')


class APIError(Exception):
    def __init__(self, message, status, data=None):
        self.message = message
        self.status = status
        self.data = data

class APIValidationError(APIError):
    pass


def create_remote_user(
        local_user_name: str,
        remote_user_prefix: str,
        remote_api_base_url: str,
        remote_api_token: str
) -> tuple[str, str]:
    """Creates a user on the remote Tools4MSP instance."""

    response = requests.post(
        f'{remote_api_base_url}/api/v2/auth/createuser/',
        headers={
            'Authorization': f'Token {remote_api_token}'
        },
        json={
            'username': f'{remote_user_prefix}__{local_user_name}'
        }
    )
    logger.debug(
        f'Tried to create remote user at {response.request.url=} '
        f'with {response.request.headers=} and {response.request.body=}'
    )
    logger.debug(f'{response.status_code=} {response.text=}')
    if response.status_code not in (200, 201):
        # remote API is currently returning HTTP 200 - OK instead of the
        # usual HTTP 201 - Created on creation, so let's accept both
        raise APIError(
            'Could not create remote user',
            status=response.status_code,
            data=response.text
        )
    try:
        payload = response.json()
        remote_user_name = payload['user']
        token = payload['token']
    except JSONDecodeError:
        raise APIError(
            'Could not decode remote response',
            status=400,
            data=response.text
        )
    except KeyError:
        raise APIError(
            'Could not extract new user details from the remote response',
            status=400,
            data=response.text
        )
    return remote_user_name, token


def create_local_user_remote_profile(
        user: User,
        remote_api_base_url: str,
        remote_user_prefix: str,
        remote_api_token: str,
) -> models.RemoteProfile:
    """Creates a local RemoteProfile for the given user.

    This function assumes that the user does not have a RemoteProfile yet.
    It creates a remote user on the Tools4MSP instance and then creates
    a local RemoteProfile linked to the given user.
    """
    remote_user_name, token = create_remote_user(
        user.username,
        remote_api_base_url=remote_api_base_url,
        remote_user_prefix=remote_user_prefix,
        remote_api_token=remote_api_token,
    )
    profile = models.RemoteProfile.objects.create(
        user=user,
        remote_id=remote_user_name,
        token=token
    )
    return profile


def call_api(
        params=None,
        method='GET',
        url=None,
        full_url=None,
        json=None,
        user: User | None = None
):
    headers = {}
    qparams = ''

    if params:
        qparams = '?' + urllib.parse.urlencode(params, doseq=False)

    if user:
        if not hasattr(user, 'remote_profile'):
            create_local_user_remote_profile(
                user,
                remote_api_base_url=settings.TOOLS4MSP_API_URL,
                remote_user_prefix=settings.TOOLS4MSP_USER_PREFIX,
                remote_api_token=settings.TOOLS4MSP_ADMIN_TOKEN,
            )
        headers.update(
            {
                'Authorization': f'Token {user.remote_profile.token}'
            }
        )

    internal_url = full_url if full_url else f"{settings.TOOLS4MSP_API_URL}/{url}{qparams}"

    logger.debug(internal_url)
    response = requests.request(
        method=method,
        url=internal_url,
        headers=headers or None,
        json=json
    )
    logger.debug(f'API returned {response.status_code} {response.text}')

    if response.status_code >= 500:
        # when upstream returns with 50x we raise a 502 - Bad Gateway to denote
        # the server error is on the upstream, not here
        raise APIError(response.text, 502)
    elif response.status_code >= 400:
        try:
            content = response.json()

            if response.status_code == 403:
                raise PermissionError(content.get('detail'))

            if response.status_code == 400 and type(content) is list:
                raise APIValidationError('Tools4MSP Error', response.status_code, content)

            raise APIError(content.get('detail'), response.status_code, content)
        except JSONDecodeError:
            raise APIError('Invalid JSON returned', response.status_code)
    try:
        return response.json()
    except JSONDecodeError:
        raise APIError('Invalid JSON returned', response.status_code)
