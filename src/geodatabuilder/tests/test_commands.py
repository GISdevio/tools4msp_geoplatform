from io import StringIO
import os, zipfile, pathlib

from django.conf import settings
from geodatabuilder.models import GeoDataBuilder
import pytest
from unittest import mock
from django.test import TestCase
from django.core.management import call_command

from geodatabuilder.management.commands.expressionlayers import getCheckAttributes, getFileToId, replaceStrFunctions, representsInt, getNumbers


def test_getNumbers():
    assert ['12'] == getNumbers('test + 12')
    assert [] == getNumbers('test')
    assert ['1.29'] == getNumbers('test + 1.29')
    assert ['12', '3', '4'] == getNumbers('test 12 * 3 / 4')


def test_getCheckAttributes():
    assert getCheckAttributes('$1*$34*RESIZE($5)') == ['$1', '$34', '$5']


def test_getFileToId():
    pass


def test_replaceStrFunctions():
    assert replaceStrFunctions('MAX(#1)') == 'numpy.max(#1)'
    assert replaceStrFunctions('MIN(#1) + MAX(#2)') == 'numpy.min(#1) + numpy.max(#2)'


def test_representsInt():
    assert representsInt('12')
    assert not representsInt('test')
    assert not representsInt('1.3')


class TestGeodatabuilderExecution(TestCase):
    fixtures = ['test_layers.json',]

    @classmethod
    def setUpTestData(cls):
        layers_path = pathlib.Path(settings.MEDIA_ROOT).joinpath('layers', 'tests')
        layers_path.mkdir(parents=True, exist_ok=True)

        current_dir = pathlib.Path(__file__).parent.resolve()
        layers_files_zip = current_dir.joinpath('assets', 'test_layers_file.zip')

        with zipfile.ZipFile(layers_files_zip, 'r') as zip_ref:
            zip_ref.extractall(layers_path)

    def test_sum_raster(self):
        out = StringIO()
        grid = '{"resolution": 250, "epsg": 4326, "bounds": [8.3, 40, 9.8, 41]}'
        call_command('expressionlayers', expression='1 + 2', grid=grid, stdout=out)
        assert 'success:' in out.getvalue()

    def test_sum_vector(self):
        out = StringIO()
        grid = '{"resolution": 250, "epsg": 4326, "bounds": [8.3, 40, 9.8, 41]}'
        call_command('expressionlayers', expression='3 + 4', grid=grid, stdout=out)
        assert 'success:' in out.getvalue()

    def test_sum_vector_raster(self):
        out = StringIO()
        grid = '{"resolution": 250, "epsg": 4326, "bounds": [8.3, 40, 9.8, 41]}'
        call_command('expressionlayers', expression='3 + 1', grid=grid, stdout=out)
        assert 'success:' in out.getvalue()

    def test_vector_to_raster_fid(self):
        out = StringIO()
        grid = '{"resolution": 250, "epsg": 4326, "bounds": [8.3, 40, 9.8, 41]}'
        call_command('expressionlayers', expression='3[fid]', grid=grid, stdout=out)
        assert 'success:' in out.getvalue()