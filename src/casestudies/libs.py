import requests
import logging
import coreapi
import json
import string, random
from django.conf import settings

from ordered_set import OrderedSet


logger = logging.getLogger(__name__)


def create_remote_user(user):
    headers = {'Authorization': f'Token {settings.TOOLS4MSP_ADMIN_TOKEN}'}

    u = f'{settings.TOOLS4MSP_USER_PREFIX}__{user.username}'

    logger.debug(f'{settings.TOOLS4MSP_API_URL}/api/v2/auth/createuser/ with {u}')
    r = requests.post(f'{settings.TOOLS4MSP_API_URL}/api/v2/auth/createuser/', headers=headers, json={'username': u })
    logger.debug(f'{r.status_code} {r.text}')
    response = {}
    try:
        response = r.json()
    except json.decode.JSONDecodeError:
        logger.error(f'could not decode {r.text}')    

    return response, r.status_code


def randomString(stringLength=6):
    """Generate a random string of fixed length """
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(stringLength))


class Matrix:
    @staticmethod
    def from_json_array(item):
        '''
        Converts the JSON array to a structure that react can easily render as matrix
        needs to read a configuration that provides for each "code" how to interpret the matrix
        returns a dictionary containing:
        x - the name of the attribute to use as column
        y - the name of the attribute to use as row
        cols - the names of the columns
        rows - the names of the rows
        values - the names of the attribute that keeps the values
        index - a dictionary containing mapping for each position of the matrix

        Matrix index has the following structure:
        "x$COL#y$ROW": { value: 0 }

        the separators can be configured in ID_SEPARATORS
        '''

        c = item["content"]
        x = settings.CODE_MAP[item.get('code')]['x']
        y = settings.CODE_MAP[item.get('code')]['y']
        values = settings.CODE_MAP[item.get('code')]['v']
        is_squared = settings.CODE_MAP[item.get('code')].get('square')

        if is_squared:
            '''
            Some matrixes like "PCONFLICT" are squared and have rows = cols
            this implies that:
            - M[i][j] == M[j][i]
            - M[i][j] == None if i == j

            since the JSON only provides the   
            '''
            columns = list(dict.fromkeys([el for part in map(lambda e: (e.get(x), e.get(y),), c) for el in part]))
            rows = columns
        else:
            columns = list(OrderedSet(map(lambda e: e.get(x), c)))
            rows = list(OrderedSet(map(lambda e: e.get(y), c)))

        matrix = {
            'x': x,
            'y': y,
            'cols': columns,
            'rows': rows,
            "values": values,
            'index': {},
            'separators': settings.ID_SEPARATORS,
            "extra": {},
        }

        for el in c:
            id = f"{x}{settings.ID_SEPARATORS['secondary']}{el.get(x)}{settings.ID_SEPARATORS['main']}{y}{settings.ID_SEPARATORS['secondary']}{el.get(y)}"
            matrix['index'][id] = {k: el[k] for k in el if k not in [x,y] and not k.startswith('_')}
            # Put all the _attributes inside __extra removing the "_" prefix
            matrix['extra'][id] = {key[1:]: val for key, val in el.items() if key.startswith('_')}
        
        return matrix

    @staticmethod
    def to_json_array(matrix):
        '''
        Converts a matrix index back to a JSON array
        each key of the index provides attributes and values for columns and rows
        example:
        { "c$CODE1#r$CODE2": { "value": 1 } }
        becames:
        [{"c": "CODE1", "r": "CODE2", "value": 1 }]
        '''
        data = []
        extras = matrix.get('extra', {})
        logger.error(extras)

        for key, value in matrix.get('index').items():
            x = matrix.get('x')
            y = matrix.get('y')
            coords = key.split(settings.ID_SEPARATORS['main'])
            value[x] = coords[0].split(settings.ID_SEPARATORS['secondary'])[1]
            value[y] = coords[1].split(settings.ID_SEPARATORS['secondary'])[1]

            logger.error(key)

            if key in extras:
                for extra_opt, extra_opt_val in extras.get(key).items():
                    value["_" + extra_opt] = extra_opt_val

            data.append(value)

        return data