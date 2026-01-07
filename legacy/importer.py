import json
from pathlib import Path
from typing import Iterator

import httpx
import typer

app = typer.Typer()


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


@app.command(name="store-current-datasets")
def store_dataset_api_responses():
    http_client = httpx.Client()
    base_target_dir = Path(__file__).parent / "current"
    base_target_dir.mkdir(parents=True, exist_ok=True)
    target_datasets_dir = base_target_dir / "datasets"
    target_datasets_dir.mkdir(parents=True, exist_ok=True)
    detail_generator = gather_datasets_details_via_api(
        http_client, page_size=20)
    for dataset in detail_generator:
        print(f"Processing dataset {dataset['pk']}")
        target_dataset_file = target_datasets_dir / f"{dataset['pk']}.json"
        target_dataset_file.write_text(json.dumps(dataset, indent=2))


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
        for dataset in response_repr["datasets"]:
            yield dataset
        next_url = response_repr["links"]["next"]


@app.command()
def match_dataset_ids(
        legacy_layers_dir: Path = Path(__file__).parent / "exported/layers",
        current_datasets_dir: Path = Path(__file__).parent / "current/datasets"
):
    legacy_layers = {}
    current_datasets = {}
    for legacy_item in legacy_layers_dir.glob("*.json"):
        legacy_contents = json.loads(legacy_item.read_text())
        legacy_layer = legacy_contents["raw_layer_result"]
        legacy_layers[legacy_layer["id"]] = legacy_layer["title"]
    for current_item in current_datasets_dir.glob("*.json"):
        current_dataset = json.loads(current_item.read_text())
        current_datasets[current_dataset["pk"]] = current_dataset["title"]

    # print(current_datasets)

    for legacy_id, legacy_title in legacy_layers.items():
        for current_id, current_title in current_datasets.items():
            if legacy_title == current_title:
                print(f"Found match for legacy layer {legacy_id} - current dataset {current_id}")
                break
        else:
            print(f"No match found for legacy layer {legacy_id} - {legacy_title!r}")


if __name__ == "__main__":
    app()