"""Export items from the legacy v3.3.4 GeoNode platform to a file system location."""

import json
import logging
from pathlib import Path
from typing import (
    Annotated,
    Iterator,
)

import httpx
import typer

app = typer.Typer()
logger = logging.getLogger(__name__)


BASEMAP_LAYER_NAMES = (
    "mapnik",
    "OpenTopoMap",
    "StamenToner",
    "s2cloudless:s2cloudless",
    "OpenSeaMap",
    "empty",
)


@app.command(name="store-legacy-map-data")
def store_api_responses(
        legacy_geonode_username: Annotated[
            str,
            typer.Argument(envvar="LEGACY_GEONODE_USERNAME")
        ],
        legacy_geonode_password: Annotated[
            str,
            typer.Argument(envvar="LEGACY_GEONODE_PASSWORD")
        ],
        base_url: str = "https://geoplatform.tools4msp.eu",
):
    http_client = httpx.Client()
    base_target_dir = Path(__file__).parent / "legacy-data"
    base_target_dir.mkdir(parents=True, exist_ok=True)
    target_maps_dir = base_target_dir / "maps"
    target_maps_dir.mkdir(parents=True, exist_ok=True)
    target_layers_dir = base_target_dir / "layers"
    target_layers_dir.mkdir(parents=True, exist_ok=True)
    detail_generator = gather_map_details_via_api(
        http_client=http_client,
        base_url=base_url,
        limit=10,
        geonode_admin_username=legacy_geonode_username,
        geonode_admin_password=legacy_geonode_password,
    )
    for processed_maps, processed_layers, ignored_layers, ignored_styles in detail_generator:
        for map_id, map_details in processed_maps.items():
            target_map_details_file = target_maps_dir / f"{map_id}.json"
            target_map_details_file.write_text(json.dumps(map_details, indent=2))
        for layer_id, layer_details in processed_layers.items():
            target_layers_file = target_layers_dir / f"{layer_id}.json"
            target_layers_file.write_text(json.dumps(layer_details, indent=2))
        if len(ignored_layers) > 0:
            target_ignored_layers_file = target_layers_dir / "ignored_layers.txt"
            serialized_ignored_layers = ""
            for map_id, map_layer_index, layer_name, detail in ignored_layers:
                serialized_line = f"{map_id}; {map_layer_index}; {layer_name}; {detail}\n"
                serialized_ignored_layers += serialized_line
            with target_ignored_layers_file.open(mode="a", encoding="utf-8") as ignored_layers_fh:
                ignored_layers_fh.write(serialized_ignored_layers + "\n")
        if len(ignored_styles) > 0:
            target_ignored_styles_file = target_layers_dir / "ignored_styles.txt"
            serialized_ignored_styles = ""
            for ignored_style_id, ignore_detail in ignored_styles:
                serialized_line = f"{ignored_style_id}; {ignore_detail}\n"
                serialized_ignored_styles += serialized_line
            with target_ignored_styles_file.open(mode="a", encoding="utf-8") as ignored_styles_fh:
                ignored_styles_fh.write(serialized_ignored_styles + "\n")


def gather_map_details_via_api(
        *,
        http_client: httpx.Client,
        base_url: str = "https://geoplatform.tools4msp.eu",
        limit: int = 20,
        geonode_admin_username: str | None = None,
        geonode_admin_password: str | None = None,
) -> Iterator[tuple[dict, dict, list[tuple[int, int, str, str]], list[tuple[int, str]]]]:
    current_offset = 0
    next_url = f"{base_url}/api/maps/?limit={limit}&offset={current_offset}"
    seen_layers = []
    request_auth = (
        (geonode_admin_username, geonode_admin_password)
        if geonode_admin_username else None
    )
    while next_url:
        maps_processed = {}
        layers_processed = {}
        layers_ignored = []
        styles_ignored = []
        map_list_response = http_client.get(
            next_url,
            auth=request_auth
        )
        logger.info(f"Processing response from URL: {map_list_response.request.url!r}")
        map_list_response.raise_for_status()
        response_repr = map_list_response.json()
        for map_list_repr in response_repr["objects"]:
            map_id = map_list_repr["id"]
            logger.info(f"Processing map: {map_id!r}")
            maps_processed[map_id] = map_list_repr
            for map_layer_index, map_layer_repr in enumerate(map_list_repr["layers"]):

                if map_layer_repr.get("group") == "background":
                    # base layer, which is configured in the settings,
                    # no need to store further details
                    continue

                if not map_layer_repr.get("local"):
                    # remote layer, the map layer already has relevant details
                    continue

                alternate_identifier = (
                    alternate
                    if (alternate:=map_layer_repr["name"]).startswith("geonode:")
                    else f"geonode:{alternate}"
                )
                layer_list_response = http_client.get(
                    f"{base_url}/api/layers/",
                    params={"alternate": alternate_identifier},
                    auth=request_auth
                )
                layer_list_response.raise_for_status()
                try:
                    layer_list_repr = layer_list_response.json()["objects"][0]
                except IndexError:
                    layers_ignored.append(
                        (
                            map_id, map_layer_index, map_layer_repr["name"],
                            f"Could not extract layer representation from list response - ignoring layer"
                        )
                    )
                    continue
                layer_id = int(layer_list_repr["resource_uri"].split("/")[3])
                if layer_id in seen_layers:
                    logger.info(f"layer {layer_id} is already known - skipping...")
                    continue
                seen_layers.append(layer_id)
                layer_detail_response = http_client.get(
                    f"{base_url}/api/layers/{layer_id}/",
                    auth=request_auth
                )
                layer_detail_repr = layer_detail_response.json()
                layer_result = {
                    "raw_layer_result": layer_detail_repr,
                    "styles": {}
                }
                layer_style_ids = [
                    int(style_repr.split("/")[3]) for style_repr in layer_detail_repr["styles"]
                ]
                for style_id in layer_style_ids:
                    style_detail_response = http_client.get(
                        f"{base_url}/api/styles/{style_id}/",
                        auth=request_auth
                    )
                    try:
                        style_detail_response.raise_for_status()
                    except httpx.HTTPStatusError as err:
                        styles_ignored.append((style_id, str(err)))
                        continue
                    style_detail = style_detail_response.json()
                    layer_result["styles"][style_detail["name"]] = style_detail
                layers_processed[layer_id] = layer_result
        try:
            next_url = f"{base_url}" + response_repr["meta"]["next"]
        except TypeError:
            next_url = None
        yield maps_processed, layers_processed, layers_ignored, styles_ignored


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    app()