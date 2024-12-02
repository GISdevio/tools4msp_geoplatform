import re
import string
import random
import tempfile
import os
import subprocess
import shutil
import logging
import operator
import ntpath
import json
import traceback
from pathlib import Path
from functools import reduce

import rasterio
from matplotlib import pyplot as plt

from django.db.models import Q
from django.db import models
from geodatabuilder.models import GeoDataBuilder, GeoDataBuilderVariable

from geonode.layers.models import Dataset
from owslib.wps import WebProcessingService
from geonode.geoserver.helpers import ogc_server_settings


ALLOWED_EXTENSION = ['.geotiff', '.tif', '.shp', '.tiff']
ALLOWED_EXTENSIONS_FILTER = reduce(operator.or_, (Q(file__endswith=x) for x in ALLOWED_EXTENSION))

logger = logging.getLogger('geonode')


def default_reporter(*args):
    for arg in args:
        logger.debug(arg)


def replaceStrFunctions(str):
    str = str.replace("MAX","numpy.nanmax")
    str = str.replace("MIN","numpy.nanmin")
    str = str.replace("AVG","numpy.nanmean")
    str = str.replace("LOG","numpy.log")
    str = str.replace("RESCALE", "rescale")
    str = str.replace("GAUSSIAN_FILTER","gaussian_filter")
    str = str.replace("MASK_GREAT","ma.masked_greater")
    return str


def randomString(stringLength=10):
    """Generate a random string of fixed length """
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(stringLength))


class GDALGenenericException(Exception):
    pass


class GDALRasterizationException(GDALGenenericException):
    pass


class GDALWarpException(GDALGenenericException):
    pass



def build_temp_dir(directory=None, with_output=False):
    if not directory:
        directory = tempfile.mkdtemp()

    dir_temp = f'{tempfile.mkdtemp()[1:]}/'
    base_dir = f'{directory}{dir_temp}'
    out_dir = None
    if with_output:
        out_dir = f'{base_dir}output/'
        if not os.path.exists(out_dir):
            os.makedirs(out_dir)

    return base_dir, out_dir if out_dir else None


def subprocess_success(res):
    return res.decode('utf-8').lower().find('100 - done') != -1


def vector_to_raster(bounds, base_dir, layer, file_path, attribute, where_condition, srs, resolution, filename):
    filename_only, original_ext = os.path.splitext(filename)

    if not os.path.exists(base_dir+'rasterize/'):
        os.makedirs(base_dir+'rasterize/')

    if not srs:
        srs = layer.crs

    insert_value = "-burn 1"
    if (attribute):
        insert_value = f"-a {attribute}"

    where_condition_value = ""
    if where_condition and where_condition !='' and len(where_condition)>0:
        where_condition_value = f'-where "{where_condition}"'
    file_path = "/vsizip/{{{}}}".format(file_path)
    command_reproject = f'ogr2ogr -preserve_fid -t_srs {srs} {where_condition_value} {base_dir}rasterize/reprojected.shp {file_path}'
    print(command_reproject)
    subprocess.check_output([command_reproject], shell=True)

    target_path = f"{base_dir}{filename_only}.tif"
    command = f'gdal_rasterize -a_nodata "nan" -init 0 -te {bounds} -a_srs {srs} -tr {resolution} {resolution} -tap {insert_value} -l reprojected {base_dir}/rasterize/ {target_path}'
    print(command)
    result_rasterize = subprocess.check_output([command], shell=True)

    merge_path = f"{base_dir}{filename_only}_merged.tif"
    command_merge = f'gdal_merge.py -o {merge_path} -init 0 -a_nodata "nan" {target_path}'
    merge_result = subprocess.check_output([command_merge], shell=True)

    if subprocess_success(result_rasterize) and subprocess_success(merge_result):
        return merge_path
    else:
        raise GDALRasterizationException(result_rasterize)


def raster_warp(bounds, srs, resolution, filepath, directory):
    # shutil.copy2(filepath, directory)
    directory = Path(filepath).parent.absolute()

    filename_tmp = randomString(8)
    logger.error(filepath)

    out_dir = f'{directory}/output/'
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)

    target = f'{out_dir}{filename_tmp}.tif'
    command = f'gdalwarp -r bilinear -dstnodata "nan" -te {bounds} -t_srs {srs} -tr {resolution} {resolution} -tap {filepath} {target}'
    cmd_result = subprocess.check_output([command], shell=True)
    if subprocess_success(cmd_result):
        return target
    else:
        raise GDALWarpException(cmd_result)


def create_thumbnail(raster_path):
    src = rasterio.open(raster_path)
    plt.imshow(src.read(1), cmap='jet')

    directory = Path(raster_path).parent.absolute()
    filename = Path(raster_path).stem

    target = f'{directory}/{filename}.png'
    plt.savefig(target)
    return target

def wps_dowload(ogc_server, layer_name, filepath, username=None, password=None, public_ows=None, max_iteration=100):
        wps = WebProcessingService(ogc_server, skip_caps=True, username=username, password=password)
        inputs = [("layerName", layer_name), ('outputFormat', 'application/zip')]
        output = "result"
        processid = 'gs:Download'
        execution = wps.execute(processid, inputs, output=[("result", True, None)])
        if public_ows is not None:
            execution.statusLocation = execution.statusLocation.replace(public_ows, ogc_server)
        for i in range(0, max_iteration):
            execution.checkStatus(sleepSecs=3)
            if execution.isComplete():
                break
        if execution.isSucceeded():
            if public_ows is not None:
                reference = execution.processOutputs[0].reference
                reference = reference.replace(public_ows, ogc_server)
                execution.processOutputs[0].reference = reference
            execution.getOutput(filepath=filepath)
            return True
        else:
            for ex in execution.errors:
                print('Error: code=%s, locator=%s, text=%s' % (ex.code, ex.locator, ex.text))
            return False

                                                                                                                            
def rasterize_layer_to_grid(layer_id, grid, res, attribute, where_condition='', directory=None):
    layer = Dataset.objects.get(id=layer_id)

    if not directory:
        directory, _ = build_temp_dir()


    logger.error(directory)
    logger.info(f"Dataset Files: {dir(layer)}")


    if (grid):
        grid_json = json.loads(grid) if isinstance(grid, str) else grid
        resolution = str(grid_json["resolution"])
        srs = f"EPSG:{str(grid_json['epsg'])}"
        json_bounds = f'{str(grid_json["bounds"][0])} {str(grid_json["bounds"][1])} {str(grid_json["bounds"][2])} {str(grid_json["bounds"][3])}'

    else:
        resolution = str(res)
        srs = None

    # resolution to improve rasterization
    hd_factor = 3
    resolution_hd = str(int(float(resolution) / hd_factor))

    # # Use get_base_file() to get the base file
    # base_file, list_col = layer.get_base_file()

    # if base_file is None:

    #     raise Exception("No base file found for this dataset.")

    # Prepare a list of files to process
    files_to_process = layer.files


    # upload_session = layer.get_upload_session()
    # layer_files = models.ForeignKey(upload_session, on_delete=models.CASCADE).filter(ALLOWED_EXTENSIONS_FILTER)
    # layer_files = LayerFile.objects.filter(upload_session=upload_session).filter(ALLOWED_EXTENSIONS_FILTER)
    print(f'found files: {files_to_process}')

    for file_path in files_to_process:
        filename_with_extension = ntpath.basename(file_path)
        filename, extension = os.path.splitext(filename_with_extension)
        rasterized_layer_path = None

        print(f'processing {filename} {extension}')

        if layer.is_vector() and extension.lower() == '.shp':
            _user, _password = ogc_server_settings.credentials
            zipped_shapefile = tempfile.NamedTemporaryFile(suffix='.zip').name
            execution = wps_dowload(ogc_server_settings.internal_ows,
                                    layer.name,
                                    zipped_shapefile,
                                    username=_user,
                                    password=_password, public_ows=ogc_server_settings.ows)

            # use resolution_hd only for Polygon and MultiPolygon
            _resolution = resolution_hd if layer.gtype in ['Polygon', 'MultiPolygon'] else resolution
            rasterized_layer_path = vector_to_raster(bounds=json_bounds,
                                                     layer=layer,
                                                     file_path=zipped_shapefile,
                                      filename=filename,
                                      resolution=_resolution,
                                      srs=srs,
                                      base_dir=directory,
                                      attribute=attribute,
                                      where_condition=where_condition
                                      )

        if not layer.is_vector() or rasterized_layer_path:
            raster_path =  raster_warp(bounds=json_bounds,
                               directory=directory,
                               filepath=rasterized_layer_path or file_path,
                               resolution=resolution,
                               srs=srs)

            # thumbnail = create_thumbnail(raster_path=raster_path)
            print(f'generated in {raster_path}')

            return raster_path

    return None



def compute_expression(*args, geodatabuilder_id=None, grid=None, resolution=None, reporter=default_reporter, **kwargs):
    base_dir, output = build_temp_dir(with_output=True)
    gdb = GeoDataBuilder.objects.get(id=geodatabuilder_id)

    filename = randomString(8)
    result_tif = f'result_{filename}.tif'

    str_input = []
    expression = replaceStrFunctions(gdb.expression)
    print(f'evaluating expression: {expression}')

    used_variables = {}

    for variable in gdb.variables.all():
        print(f'found variable {variable.name}')
        # rasterize and reproject only layers found in expression
        if variable.name.replace('$', '') in expression:
            print('variable is in expression')
            used_variables[variable.name] = rasterize_layer_to_grid(
                attribute=variable.attribute,
                where_condition=variable.where_condition,
                directory=base_dir,
                grid=grid,
                res=resolution,
                layer_id=variable.layer_id,
            )
            print(f'generated {used_variables[variable.name]}')

    str_input = ''

    for index, (key, file) in enumerate(used_variables.items()):
        print(f'index {index}, variable {key} with file {file}')
        # convert variables to letters, gdal expects variable to be -A path_to_var for an expression like (A * 2)
        letter = string.ascii_uppercase[index]
        str_input += f' -{letter} {file}'
        expression = expression.replace(key, letter)

    print(f'writing to {result_tif}')
    output += result_tif

    command = f'gdal_calc.py {str_input} --outfile={output} --calc="{expression}"'
    logger.error(command)

    result = subprocess.check_output(command, shell=True)

    # shutil.rmtree(base_dir)

    if subprocess_success(result):
        reporter('success: '+result_tif)
        return output
    else:
        reporter(result)
        raise GDALGenenericException('Failed')
