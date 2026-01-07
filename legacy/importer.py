import httpx
from typing import Iterator


def import_map():
    context = {
        "title": None,
        "abstract": None,
        "map_center_x": None,
        "map_center_y": None,
        "map_center_crs": None,
        "map_maxextent": [],  # not sure if needed
        "layers": [],
        "groups": [],
        "maplayers": []
    }


def gather_datasets_details_via_api(
        http_client: httpx.Client,
        page_size: int = 10
) -> Iterator[dict]:
    """Gather id and title of existing datasets"""
    base_url = "https://dev.geoplatform.tools4msp.eu"
    next_url  = f"{base_url}/api/v2/datasets/?page=1&page_size={page_size}"
    while next_url:
        dataset_list_response = http_client.get(next_url)
        dataset_list_response.raise_for_status()
        response_repr = dataset_list_response.json()
        for dataset in dataset_list_response["datasets"]:
            yield dataset
        next_url = response_repr["links"]["next"]
