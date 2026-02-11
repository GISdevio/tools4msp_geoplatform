import json
import logging
from pathlib import Path
from typing import (
    Annotated,
    Iterator,
)

import httpx
import typer
from playwright.sync_api import sync_playwright

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

@app.callback()
def main_callback():
    """Export items from the legacy tools4msp-geoplatform system.

    The main functionality of this script is executed by calling the
    store-legacy-map-data command. Check its own help for more detail.
    """


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
        target_directory: Path = Path(__file__).parent / "legacy-data",
):
    """Download all GeoNode maps from the legacy system

    This command uses the legacy system's GeoNode APIs to retrieve JSON
    representations of maps and also the layers and styles used in the maps.

    This command generates the following files:

    - `<target_directory>/maps/<map_id>.json` - contains the exported representation
      of each map

    - `<target_directory>/layers/<layer_id>.json` - contains the exported
      representation of each layer that is used in a map, including all the
      layer's styles

    - `<target_directory>/ignored_layers.txt` - contains a listing of layers
      which could not be exported and were ignored

    - `<target_directory>/ignored_styles.txt` - contains a listing of styles
      which could not be exported and were ignored

    The output of this command can be used by the `importer.py` script to
    import the maps on to the new system.
    """
    http_client = httpx.Client()
    target_directory.mkdir(parents=True, exist_ok=True)
    target_maps_dir = target_directory / "maps"
    target_maps_dir.mkdir(parents=True, exist_ok=True)
    target_layers_dir = target_directory / "layers"
    target_layers_dir.mkdir(parents=True, exist_ok=True)
    detail_generator = gather_map_details_via_api(
        http_client=http_client,
        base_url=base_url,
        limit=10,
        geonode_auth=(legacy_geonode_username, legacy_geonode_password)
    )
    for processed_maps, processed_layers, ignored_layers, ignored_styles in detail_generator:
        for map_id, map_details in processed_maps.items():
            target_map_details_file = target_maps_dir / f"{map_id}.json"
            target_map_details_file.write_text(json.dumps(map_details, indent=2))
        for layer_id, layer_details in processed_layers.items():
            target_layers_file = target_layers_dir / f"{layer_id}.json"
            target_layers_file.write_text(json.dumps(layer_details, indent=2))
        if len(ignored_layers) > 0:
            target_ignored_layers_file = target_directory / "ignored_layers.txt"
            serialized_ignored_layers = ""
            for map_id, map_layer_index, layer_name, detail in ignored_layers:
                serialized_line = f"{map_id}; {map_layer_index}; {layer_name}; {detail}\n"
                serialized_ignored_layers += serialized_line
            with target_ignored_layers_file.open(mode="a", encoding="utf-8") as ignored_layers_fh:
                ignored_layers_fh.write(serialized_ignored_layers + "\n")
        if len(ignored_styles) > 0:
            target_ignored_styles_file = target_directory / "ignored_styles.txt"
            serialized_ignored_styles = ""
            for ignored_layer_id, ignored_style_id, ignore_detail in ignored_styles:
                serialized_line = f"{ignored_layer_id}; {ignored_style_id}; {ignore_detail}\n"
                serialized_ignored_styles += serialized_line
            with target_ignored_styles_file.open(mode="a", encoding="utf-8") as ignored_styles_fh:
                ignored_styles_fh.write(serialized_ignored_styles + "\n")


def gather_map_details_via_api(
        *,
        http_client: httpx.Client,
        base_url: str = "https://geoplatform.tools4msp.eu",
        limit: int = 20,
        geonode_auth: tuple[str, str] | None = None,
) -> Iterator[tuple[dict, dict, list[tuple[int, int, str, str]], list[tuple[int, str]]]]:
    current_offset = 0
    next_url = f"{base_url}/api/maps/?limit={limit}&offset={current_offset}"
    seen_layers = []
    while next_url:
        maps_processed = {}
        layers_processed = {}
        layers_ignored = []
        styles_ignored = []
        map_list_response = http_client.get(
            next_url,
            auth=geonode_auth
        )
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
                    auth=geonode_auth
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
                map_list_repr["layers"][map_layer_index]["geonode_internal_layer_id"] = layer_id
                if layer_id in seen_layers:
                    logger.debug(f"layer {layer_id} is already known - skipping...")
                    continue
                seen_layers.append(layer_id)
                layer_detail_response = http_client.get(
                    f"{base_url}/api/layers/{layer_id}/",
                    auth=geonode_auth
                )
                layer_detail_repr = layer_detail_response.json()
                layer_result = {
                    "raw_layer_result": layer_detail_repr,
                    "styles": {}
                }
                style_info, ignored_styles = _gather_layer_styles_via_api(
                    layer_id,
                    http_client=http_client,
                    base_url=base_url,
                    geonode_auth=geonode_auth
                )
                layer_result["styles"] = style_info
                styles_ignored.extend(ignored_styles)
                layers_processed[layer_id] = layer_result
            # now access the map via the GeoNode UI and extract missing
            # details, like groups
            map_config_for_ui = _extract_map_details_from_ui(
                map_id,
                base_url=base_url,
                username=geonode_auth[0],
                password=geonode_auth[1]
            )
            maps_processed[map_id]["ui_map_config"] = map_config_for_ui
        try:
            next_url = f"{base_url}" + response_repr["meta"]["next"]
        except TypeError:
            next_url = None
        yield maps_processed, layers_processed, layers_ignored, styles_ignored


@app.command()
def store_legacy_layer_data(
        legacy_geonode_username: Annotated[
            str,
            typer.Argument(envvar="LEGACY_GEONODE_USERNAME")
        ],
        legacy_geonode_password: Annotated[
            str,
            typer.Argument(envvar="LEGACY_GEONODE_PASSWORD")
        ],
        base_url: str = "https://geoplatform.tools4msp.eu",
        target_directory: Path = Path(__file__).parent / "legacy-data/new-layers-export",
        overwrite: bool = False,
        only_process: int = 3,
):
    _write_layers_to_file(
        target_directory,
        http_client = httpx.Client(),
        base_url=base_url,
        geonode_auth=(legacy_geonode_username, legacy_geonode_password),
        overwrite=overwrite,
        only_process=only_process if only_process > 0 else None,
    )


def _write_layers_to_file(
        target_dir: Path,
        *,
        http_client: httpx.Client,
        base_url: str = "https://geoplatform.tools4msp.eu",
        geonode_auth: tuple[str, str] | None = None,
        overwrite: bool = False,
        only_process: int | None = None,
):
    total_layers_response = http_client.get(
        f"{base_url}/api/layers/", params={"limit": 1}
    )
    total_layers_response.raise_for_status()
    num_total_layers = total_layers_response.json()["meta"]["total_count"]
    seen_layers = (
        [int(p.stem) for p in target_dir.glob("*.json")]
        if not overwrite else None
    )
    layer_detail_generator = _gather_layer_details_via_api(
        http_client=http_client,
        base_url=base_url,
        geonode_auth=geonode_auth,
        seen_layers=seen_layers
    )
    for idx, layer_detail in enumerate(layer_detail_generator):
        if only_process and idx >= only_process:
            break
        id_ = layer_detail["id"]
        target_path = target_dir / f"{id_}.json"
        logger.info(f"Processing layer [{idx+1}/{num_total_layers}]...")
        if target_path.exists() and not overwrite:
            logger.info(f"Layer {id_!r} already present - skipping...")
            continue
        try:
            layer_styles, ignored_styles = _gather_layer_styles_via_api(
                id_,
                http_client=http_client,
                base_url=base_url,
                geonode_auth=geonode_auth
            )
        except RuntimeError:
            layer_styles = []
            pass
        to_write = {
            "raw_layer_result": layer_detail,
            "styles": layer_styles
        }
        target_dir.mkdir(parents=True, exist_ok=True)
        target_path.write_text(json.dumps(to_write, indent=2))
        logger.info(f"Wrote {target_path!r}")
    print("Done!")


def _gather_layer_details_via_api(
        *,
        http_client: httpx.Client,
        base_url: str = "https://geoplatform.tools4msp.eu",
        limit: int = 20,
        geonode_auth: tuple[str, str] | None = None,
        seen_layers: list[int] | None = None,
) -> Iterator[dict]:
    """Iterator that gathers details for all layers, one at a time"""
    next_url = f"{base_url}/api/layers/?limit={limit}&offset=0"
    while next_url:
        response = http_client.get(next_url, auth=geonode_auth)
        response.raise_for_status()
        payload = response.json()
        for layer_list_item in payload["objects"]:
            if layer_list_item["id"] in seen_layers or []:
                logger.debug(f"skipping layer {layer_list_item['id']!r}...")
                continue
            detail_url = f"{base_url}{layer_list_item['resource_uri']}"
            layer_detail_response = http_client.get(
                detail_url, auth=geonode_auth
            )
            layer_detail_response.raise_for_status()
            yield layer_detail_response.json()
        next_url = (
            f"{base_url}{next_}" if (next_ := payload["meta"]["next"]) else None
        )
        logger.info(f"next_url: {next_url}")



def _gather_layer_styles_via_api(
        layer_id: int,
        *,
        http_client: httpx.Client,
        base_url: str = "https://geoplatform.tools4msp.eu",
        geonode_auth: tuple[str, str] | None = None,
) -> tuple[dict, list]:
    """Uses API v2 to get styles for a layer.

    Must visit the layer detail page and then get the geoserver url of each style
    and visit that one.
    """
    layer_detail_response = http_client.get(
        f"{base_url}/api/v2/layers/{layer_id}/", auth=geonode_auth
    )
    ignored_styles = []
    try:
        layer_detail_response.raise_for_status()
    except httpx.HTTPStatusError as err:
        ignored_styles.append((layer_id, None, err))
        logger.info(f"failed to get API v2 layer detail response: {err}")
        raise RuntimeError from err
    layer_detail_repr = layer_detail_response.json()
    styles_processed = {}
    for style_item in layer_detail_repr["layer"]["styles"]:
        style_id = style_item["pk"]
        sld_url = style_item["sld_url"]
        style_info = styles_processed.setdefault(style_id, {})
        style_info.update({
            "id": style_id,
            "name": style_item["name"],
            "sld_url": sld_url,
        })
        sld_url_response = http_client.get(sld_url)
        try:
            sld_url_response.raise_for_status()
        except httpx.HTTPStatusError as err:
            ignored_styles.append((layer_id, style_id, err))
            continue
        style_info["sld"] = sld_url_response.content.decode("utf-8")
    return styles_processed, ignored_styles


@app.command("get-map-config-from-ui")
def export_map_details_from_ui(
        map_id: int,
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
    map_config = _extract_map_details_from_ui(
        map_id, base_url=base_url, username=legacy_geonode_username, password=legacy_geonode_password)
    print(map_config)


def _extract_map_details_from_ui(
        map_id: int,
        *,
        username: str,
        password: str,
        base_url: str = "https://geoplatform.tools4msp.eu",
) -> dict | None:
    """Uses playwright to emulate a browser session and extract map-related info."""
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context()
        page = context.new_page()
        page.goto(f"{base_url}/account/login/")
        page.fill("input[name='login']", username)
        page.fill("input[name='password']", password)
        page.click("button[type='submit']")

        page.goto(f"{base_url}/maps/{map_id}/edit#/")
        geonode_config = page.evaluate("() => window.__GEONODE_CONFIG__")
        try:
            map_config = geonode_config["resourceConfig"]["map"]
        except KeyError:
            logger.warning("Could not extract map details from UI")
            map_config = None
        return map_config


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    app()