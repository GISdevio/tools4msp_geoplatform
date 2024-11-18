import requests
import logging
import urllib
import coreapi
import string, random
from json.decoder import JSONDecodeError
from django.conf import settings


logger = logging.getLogger('casestudies')


class APIError(Exception):
    def __init__(self, message, status, data=None):
        self.message = message
        self.status = status
        self.data = data

class APIValidationError(APIError):
    pass


def call_api(params=None, method='GET', url=None, full_url=None, json=None, user=None):
    headers = None
    qparams = ''

    if params:
        qparams = '?' + urllib.parse.urlencode(params, doseq=False)

    if user and user.is_authenticated and hasattr(user, 'remote_profile'):
        token = user.remote_profile.token
        headers = {'Authorization': f'Token {token}'}

    internal_url = full_url if full_url else f"{settings.TOOLS4MSP_API_URL}/{url}{qparams}"

    logger.debug(internal_url)
    r = requests.request(method=method, url=internal_url, headers=headers, json=json)
    logger.debug(f'API returned {r.status_code} {r.text}')

    if r.status_code >= 500:
        logger.error(f'API returned {r.status_code} {r.text}')
        raise APIError('Internal Server Error', r.status_code)
    elif r.status_code >= 400:
        try:
            content = r.json()

            if r.status_code == 403:
                raise PermissionError(content.get('detail'))

            if r.status_code == 400 and type(content) is list:
                raise APIValidationError('Tools4MSP Error', r.status_code, content)

            raise APIError(content.get('detail'), r.status_code, content)
        except JSONDecodeError:
            raise APIError('Invalid JSON returned', r.status_code)
    try:
        return r.json()
    except JSONDecodeError:
        raise APIError('Invalid JSON returned', r.status_code)
