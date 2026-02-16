import json
import logging
import shlex
import subprocess
import uuid
from pathlib import Path
from typing import (
    Annotated,
    Iterator,
)
from xml.etree import ElementTree as etree

import httpx
import typer

logger = logging.getLogger(__name__)

app = typer.Typer()


@app.callback()
def main_callback(ctx: typer.Context, verbose: bool = False):
    """Utilities for importing maps on to the new platform.

    The main functionality of this script is executed by calling the commands:

    1. store-current-datasets
    2. import-maps-from-directory

    Check their own help for more details.
    """
    logging.basicConfig(level=logging.INFO if verbose else logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)


@app.command()
def import_maps_from_directory(
        current_geonode_username: Annotated[
            str,
            typer.Argument(envvar="CURRENT_GEONODE_USERNAME")
        ],
        current_geonode_password: Annotated[
            str,
            typer.Argument(envvar="CURRENT_GEONODE_PASSWORD")
        ],
        base_url: str = "https://dev.geoplatform.tools4msp.eu",
        legacy_base_dir: Annotated[
            Path,
            typer.Option(
                help=(
                    "Base directory that contains the files exported from the "
                    "legacy platform, as a result of running the "
                    "'exporter.py' script."
                )
            )
        ] = Path(__file__).parent / "legacy-data",
        current_base_dir: Annotated[
            Path,
            typer.Option(
                help=(
                        "Base directory that contains the files exported from the "
                        "current platform, as a result of running the "
                        "'store-current-datasets' command"
                )
            )
        ] = Path(__file__).parent / "current-data",
        use_imported_prefix: Annotated[
            bool,
            typer.Option(
                help=(
                        "Whether to add the 'imported__' prefix to all "
                        "imported maps or not. Note that any imported dataset "
                        "styles are not renamed"
                )
            )
        ] = True,
):
    """Imports all maps found from a previous export operation onto the new platform

    In order to run this command successfully you must have previously:

    1. Ran the `exporter.py` script to produce a local copy of the legacy system's maps and
       related information (layers, styles)
    2. Ran this script with the `store-current-datasets` command, in order to produce
       a local copy of all the datasets contained in the new platform

    So the whole export+import procedure must be something like this:

    ```shell
    export LEGACY_GEONODE_USERNAME="some-legacy-username"
    export LEGACY_GEONODE_PASSWORD="some-legacy-password"

    python exporter.py store-legacy-map-data

    export CURRENT_GEONODE_USERNAME="some-current-username"
    export CURRENT_GEONODE_PASSWORD="some-current-password"

    python importer.py store-current-datasets

    python importer.py import-maps-from-directory --no-use-imported-prefix
    ```


    """
    legacy_maps_dir = legacy_base_dir / "maps"
    if not legacy_maps_dir.exists():
        print(f"Could not find 'maps' subdir inside {legacy_base_dir}")
        raise typer.Abort()
    import_errors_path = Path(__file__).parent / "import-errors.txt"
    with import_errors_path.open("w") as fh:
        for legacy_map_file in legacy_maps_dir.glob("*.json"):
            print(f"Processing file {legacy_map_file}...")
            legacy_map_id = legacy_map_file.stem
            try:
                import_map(
                    current_geonode_username=current_geonode_username,
                    current_geonode_password=current_geonode_password,
                    legacy_map_id=legacy_map_id,
                    perform_map_import=True,
                    perform_styles_import=True,
                    base_url=base_url,
                    legacy_base_dir=legacy_base_dir,
                    current_base_dir=current_base_dir,
                    imported_prefix="imported__" if use_imported_prefix else "",
                    print_request_payload=False,
                    print_response_payload=False
                )
            except Exception as err:
                print(f"Could not process map with legacy id: {legacy_map_id!r} - {str(err)}")
                fh.write(f"{legacy_map_id!r} - {str(err)}\n\n")
    print("Done!")


def _find_map_by_title(
        title: str,
        http_client: httpx.Client,
        base_url: str,
) -> dict | None:
    """Uses the old GeoNode API to find a map by its title"""
    response = http_client.get(
        f"{base_url}/api/maps/",
        params={"title": title}
    )
    response.raise_for_status()
    payload = response.json()
    try:
        return payload.get("objects", [])[0]
    except IndexError:
        return None


@app.command()
def import_map(
        legacy_map_id: str,
        current_geonode_username: Annotated[
            str,
            typer.Argument(envvar="CURRENT_GEONODE_USERNAME")
        ],
        current_geonode_password: Annotated[
            str,
            typer.Argument(envvar="CURRENT_GEONODE_PASSWORD")
        ],
        perform_map_import: bool = False,
        perform_styles_import: bool = False,
        base_url: str = "https://dev.geoplatform.tools4msp.eu",
        legacy_base_dir: Path = Path(__file__).parent / "legacy-data",
        current_base_dir: Path = Path(__file__).parent / "current-data",
        imported_prefix: str = "imported__",
        print_request_payload: bool = False,
        print_response_payload: bool = False
):
    """Testing command that imports a single map onto the new platform."""
    legacy_maps_dir = legacy_base_dir / "maps"
    legacy_map_path = legacy_maps_dir / f"{legacy_map_id}.json"
    matched_datasets, not_matched = _get_matched_dataset_ids(
        legacy_base_dir / "layers",
        current_base_dir / "datasets"
    )
    legacy_map_details = json.loads(legacy_map_path.read_text())

    try:
        new_map_repr, new_extra_map_layers_details = _convert_legacy_map_representation_to_current(
            legacy_map_details, matched_datasets,
            current_datasets_dir=current_base_dir / "datasets",
            legacy_layers_dir=legacy_base_dir / "layers",
        )
    except RuntimeError as err:
        logger.error(f"Cannot import map: {legacy_map_id!r} - {str(err)}")
        return

    map_title = f"{imported_prefix}{legacy_map_details['title']}"
    http_client = _login_to_geonode(
        current_geonode_username, current_geonode_password, base_url)
    if _find_map_by_title(map_title, http_client, base_url):
        print(f"Map with title {map_title!r} already exists - skipping")
        return

    new_map_details = {
        "abstract": legacy_map_details.get("abstract") or map_title,
        "title": map_title,
        "data": {
            "map": new_map_repr,
        },
        "maplayers": new_extra_map_layers_details
    }
    if print_request_payload:
        print(json.dumps(new_map_details, indent=2))

    # gather styles that are used in this map, to be created
    styles_to_create = []
    for layer_repr in new_map_repr["layers"]:
        if style_info := layer_repr.get("style"):

            # style_info is either a string, identifying a GeoServer style or
            # a dict with embedded style config
            if isinstance(style_info, dict):
                continue

            style_name_fragment = style_info.replace("geonode:", "")
            new_pk = layer_repr.get("extendedParams", {}).get("mapLayer", {}).get("pk")
            try:
                legacy_pk = [k for k, v in matched_datasets.items() if v == new_pk][0]
            except IndexError:
                logger.warning(
                    f"Could not map dataset {new_pk!r} to a corresponding "
                    f"legacy layer - skipping..."
                )
                continue
            logger.info(
                f"need to create style {style_name_fragment!r} for dataset with "
                f"id {new_pk!r}, which corresponds to a legacy layer with {legacy_pk!r}"
            )
            try:
                legacy_style = _get_legacy_style(
                    legacy_pk, style_name_fragment, legacy_base_dir / "layers")
                logger.info(f"got legacy style: {bool(legacy_style)!r}")
            except TypeError:
                logger.warning(
                    f"Could not retrieve legacy style {style_info!r} from layer "
                    f"with pk {legacy_pk!r} - skipping ..."
                )
                continue

            logger.info(f"{legacy_style=}")
            if legacy_style:
                styles_to_create.append(
                    (
                        style_name_fragment,
                        _convert_style_properties_to_lowercase(legacy_style)
                    )
                )

    if not any((perform_map_import, perform_styles_import)):
        return

    access_token = _get_geoserver_access_token(http_client, base_url)
    logger.info(f"{access_token=}")

    if perform_map_import:
        print(f"Importing map with legacy id {legacy_map_id!r} with title {map_title!r}...")
        new_map_creation_result = http_client.post(
            f"{base_url}/api/v2/maps/",
            json=new_map_details,
            headers={
                "content-type": "application/json",
                "authorization": f"Bearer {access_token}",
                "x-csrftoken": _get_csrf_token(http_client),
                "referer": f"{base_url}/catalogue"
            },
            timeout=5 * 60.0
        )
        try:
            new_map_creation_result.raise_for_status()
        except httpx.HTTPStatusError as err:
            print(f"Map creation failed with {new_map_creation_result.status_code} - {new_map_creation_result.content}")
            print(err)
        response_payload = new_map_creation_result.json()
        if print_response_payload:
            print(response_payload)

    if perform_styles_import:
        print(f"Importing styles...")
        for style_info, style_sld in styles_to_create:
            logger.info(f"Creating style {style_info!r}...")
            try:
                _create_geonode_style(
                    http_client,
                    access_token,
                    style_info,
                    style_sld,
                    base_url
                )
            except httpx.HTTPStatusError as err:
                logger.warning(f"Failed to create style {style_info!r} - {err}")

    print("Done!")


def _find_legacy_layer_id(map_layers_config: list[dict], layer_name: str) -> int | None:
    for idx, layer_config in enumerate(map_layers_config):
        if layer_config.get("name") == layer_name:
            return layer_config.get("geonode_internal_layer_id")
    else:
        return None


def generate_layers_representation(
        new_map_layers: list[dict],
        legacy_map_layers: list[dict],
        matched: dict[int, int]
):
    result = []
    for layer_repr in new_map_layers:
        if layer_repr.get("group") == "background":
            continue

        try:
            map_layer_details = [
                la for la in legacy_map_layers if la["name"] == layer_repr["name"]
            ][0]
        except IndexError:
            logger.warning(f"Could not find details for layer {layer_repr['name']!r}")
            continue
        if not map_layer_details.get("local"):
            logger.info(f"layer {layer_repr['name']!r} is not a local layer, skipping...")
            continue
        try:
            internal_id = map_layer_details["geonode_internal_layer_id"]
        except KeyError:
            logger.warning(
                f"Could not determine internal id for local layer {layer_repr['name']} - ignoring this layer"
            )
            continue
        if not (matching_dataset_id := matched.get(internal_id)):
            logger.warning(f"Could not match legacy layer with id {internal_id!r} to a current dataset")
            continue
        result.append(
            {
                "pk": matching_dataset_id,
                "name": layer_repr["name"],
                "extra_params": {
                    "msId": layer_repr["id"],
                },
            }
        )
    return result


def _find_layer_by_scanning_dir(
        look_for: str,
        layers_dir: Path,
) -> str | None:
    """Look for a layer by doing a full-text search with grep"""
    layer_files = [str(f) for f in layers_dir.iterdir() if f.is_file()]
    search_result = subprocess.run(
        shlex.split(f"grep --files-with-matches --word-regexp {look_for}") + layer_files,
        capture_output=True,
    )
    if search_result.returncode != 0:
        return None

    found_files = search_result.stdout.strip().splitlines()
    if len(found_files) > 1:
        logger.warning(f"Found more than one possible file for {look_for!r}")
        return None

    raw_contents = Path(found_files[0].decode()).read_text()
    parsed = json.loads(raw_contents)
    return parsed.get("raw_layer_result", {}).get("id")


def _convert_legacy_map_representation_to_current(
        full_map_config: dict,
        matched_layers: dict[int, int],
        current_datasets_dir: Path,
        legacy_layers_dir: Path,
        old_domain: str = "geoplatform.tools4msp.eu",
        new_domain: str = "dev.geoplatform.tools4msp.eu",
) -> tuple[dict | None, list[dict]]:
    ui_map_config = full_map_config.get("ui_map_config", {})
    if ui_map_config is None:
        raise RuntimeError("map config is not available")
    serialized_ui_map_config = json.dumps(ui_map_config)
    new_ui_map_config = json.loads(
        serialized_ui_map_config.replace(old_domain, new_domain))

    to_remove = []
    new_map_layers = []
    for idx, layer_info in enumerate(new_ui_map_config.get("layers", [])):

        if layer_info.get("group") == "background":
            continue
        if layer_info.get("type") == "vector":
            continue

        if (
                layer_info.get("catalogURL") is None
                and layer_info.get("type") == "wms"
                and old_domain not in layer_info.get("url")
        ):
            # external layer
            continue

        try:
            map_layer_details = [
                la for la in full_map_config["layers"] if la["name"] == layer_info["name"]
            ][0]
        except IndexError:
            internal_id = _find_layer_by_scanning_dir(layer_info["name"], legacy_layers_dir)
            if not internal_id:
                logger.warning(f"Could not find details for layer {layer_info['name']!r}")
                to_remove.append(idx)
                continue
        else:
            if not map_layer_details.get("local"):
                logger.info(f"layer {layer_info['name']!r} is not a local layer, skipping...")
                # to_remove.append(idx)
                continue

            try:
                internal_id = map_layer_details["geonode_internal_layer_id"]
            except KeyError:
                logger.warning(
                    f"Could not determine internal id for local layer {layer_info['name']} - ignoring this layer"
                )
                to_remove.append(idx)
                continue
        logger.debug(f"{internal_id=}")
        if not (dataset_id := matched_layers.get(internal_id)):
            logger.info(f"Could not find new dataset_id for layer_id {internal_id!r} - skipping...")
            to_remove.append(idx)
            continue

        # the name of these layers has been altered during the import process
        # therefore we need to match each layer to their current dataset
        # counterpart and then replace the old name with the current one
        current_dataset_details = _get_current_dataset_by_id(
            dataset_id, current_datasets_dir)
        layer_info["name"] = current_dataset_details["name"]

        layer_msid = str(uuid.uuid4())
        layer_info["id"] = layer_msid
        layer_info["extendedParams"] = {
            "mapLayer": {
                "pk": dataset_id,
                "extraParams": {
                    "msId": layer_msid,
                },
            },
        }

        new_layer = {
            "pk": dataset_id,
            "name": current_dataset_details["name"],
            "title": layer_info["title"],
            "extra_params": {
                "msId": layer_msid,
            }
        }
        new_map_layers.append(new_layer)


    new_layer_list = [la for index, la in enumerate(new_ui_map_config.get("layers", [])) if index not in to_remove]
    new_ui_map_config["layers"] = new_layer_list
    return new_ui_map_config, new_map_layers


def recreate_map_layer_style(
        map_layer_title: str,
        dataset_pk: int,
        http_client: httpx.Client,
        access_token: str,
        legacy_layers_dir: Path,
        current_datasets_dir: Path,
        current_base_url: str,
        perform_creation: bool = False,

):
    matches, non_matched = _get_matched_dataset_ids(legacy_layers_dir, current_datasets_dir)
    legacy_layer_id = [k for k, v in matches.items() if v == dataset_pk][0]
    legacy_style_name = map_layer_title
    legacy_style_sld = _get_legacy_style(
        legacy_layer_id, legacy_style_name, legacy_layers_dir
    )
    logger.info(f"{legacy_style_sld=}")
    if perform_creation:
        new_style_name = f"imported__{legacy_style_name}"
        logger.info(f"About to create style {new_style_name!r}")
        _create_geonode_style(
            http_client,
            access_token,
            new_style_name,
            legacy_style_sld,
            current_base_url,
        )


def _get_legacy_style(
        legacy_layer_id: int,
        style_name: str,
        legacy_layers_dir: Path
) -> str | None:
    legacy_contents_path = legacy_layers_dir / f"{legacy_layer_id}.json"
    legacy_contents = json.loads(legacy_contents_path.read_text())
    for style_pk, style_info in legacy_contents.get("styles", {}).items():
        if style_info["name"] == style_name:
            return style_info["sld"]
    else:
        return None


def _translate_legacy_remote_map_layer_to_current_map_layer(
        legacy_map_layer: dict,
) -> dict:
    legacy_layer_params = json.loads(legacy_map_layer["layer_params"])
    name = legacy_map_layer["name"]
    mapstore_id = str(uuid.uuid4())
    result = {
        "id": "__".join((name, mapstore_id)),
        "type": legacy_layer_params["type"],
        "url": legacy_layer_params["url"],
        "name": name,
        "title": legacy_layer_params["title"],
        "description": legacy_layer_params["description"],
    }
    if search_info := legacy_layer_params.get("search"):
        result["search"] = search_info
    return result


def _translate_legacy_local_map_layer_to_current_map_layer(
        legacy_map_layer: dict,
        matching_dataset_id: int,
        new_map_representation: dict,
) -> dict:
    for map_layer in new_map_representation["layers"]:
        if legacy_map_layer["name"] == map_layer["name"]:
            ms_id = map_layer["id"]
            break
    else:
        ms_id = None
        logger.warning(f"Could not find maplayer's mapstore id")
    return {
        "pk": matching_dataset_id,
        "name": legacy_map_layer["name"],
        "extraParams": {
            "msId": ms_id,
        },
    }


def _get_extra_maplayers_key(id_: str, name: str) -> dict:
    return {
        "extra_params": {
            "msId": id_,
        },
        "name": name
    }


@app.command()
def store_maps(
    current_geonode_username: Annotated[
        str,
        typer.Argument(envvar="CURRENT_GEONODE_USERNAME")
    ],
    current_geonode_password: Annotated[
        str,
        typer.Argument(envvar="CURRENT_GEONODE_PASSWORD")
    ],
    base_url: str = "https://dev.geoplatform.tools4msp.eu",
    target_directory: Path = Path(__file__).parent / "current-data"
):
    """Export currently existing maps onto a local directory."""
    http_client = httpx.Client(
        auth=(current_geonode_username, current_geonode_password)
    )


@app.command(name="store-current-datasets")
def store_dataset_api_responses(
        current_geonode_username: Annotated[
            str,
            typer.Argument(envvar="CURRENT_GEONODE_USERNAME")
        ],
        current_geonode_password: Annotated[
            str,
            typer.Argument(envvar="CURRENT_GEONODE_PASSWORD")
        ],
        base_url: str = "https://dev.geoplatform.tools4msp.eu",
        target_directory: Path = Path(__file__).parent / "current-data"
):
    """Export currently existing datasets onto a local directory.

    This command downloads a JSON representation of all datasets that exist on
    the new platform. It creates the following files:

    - `<target_directory>/datasets/<dataset_id>.json` - contains the exported
      representation of each GeoNode dataset that exist on the new platform.
    """
    http_client = httpx.Client(
        auth=(current_geonode_username, current_geonode_password)
    )
    target_directory.mkdir(parents=True, exist_ok=True)
    target_datasets_dir = target_directory / "datasets"
    target_datasets_dir.mkdir(parents=True, exist_ok=True)
    detail_generator = gather_datasets_details_via_api(
        http_client, base_url, page_size=20)
    for dataset in detail_generator:
        print(f"Processing dataset {dataset['pk']}")
        target_dataset_file = target_datasets_dir / f"{dataset['pk']}.json"
        target_dataset_file.write_text(json.dumps(dataset, indent=2))


def gather_datasets_details_via_api(
        http_client: httpx.Client,
        base_url: str,
        page_size: int = 10
) -> Iterator[dict]:
    """Gather id and title of existing datasets"""
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
        legacy_layers_dir: Path = Path(__file__).parent / "legacy-data/layers",
        current_datasets_dir: Path = Path(__file__).parent / "current-data/datasets",
        print_matched: bool = False,
        print_unmatched: bool = True,
        match_key: str = "title",
):
    match_found, no_match_found = _get_matched_dataset_ids(
        legacy_layers_dir, current_datasets_dir,
        match_key=match_key,
    )
    if print_matched:
        print("====== matched ======")
        for legacy_id, current_id in match_found.items():
            print(f"{legacy_id=}\t{current_id=}")
    matched_path = Path(__file__).parent / "current-data/dataset-matches.json"
    matched_path.write_text(json.dumps(match_found, indent=2))
    print(f"wrote {matched_path} with matched datasets")
    if len(no_match_found) > 0:
        if print_unmatched:
            print("====== not matched ======")
            for legacy_id, legacy_matched_key in no_match_found:
                print(f"{legacy_id}\t{legacy_matched_key}")
        unmatched_path = Path(__file__).parent / "current-data/match-errors.json"
        unmatched_path.write_text("\n".join(str(i) for i in no_match_found))
        print(f"wrote {unmatched_path} with unmatched datasets")


def _get_current_dataset_by_id(
        current_dataset_id: int, current_datasets_dir: Path) -> dict:
    dataset_path = current_datasets_dir / f"{current_dataset_id}.json"
    return json.loads(dataset_path.read_text())


def _get_matched_dataset_ids(
        legacy_layers_dir: Path,
        current_datasets_dir: Path,
        match_key: str = "title"
) -> tuple[dict[int, int], list[tuple[int, str]]]:
    """Match old layers with new datasets.

    Matching should be done using `title` as the match key. This is because the
    imported layers seem to have both their `name` and
    `alternate` properties (which would likely be better identifiers than the
    title) slightly altered.
    """
    legacy_layers = {}
    current_datasets = {}

    for legacy_item in legacy_layers_dir.glob("*.json"):
        legacy_contents = json.loads(legacy_item.read_text())
        legacy_layer = legacy_contents["raw_layer_result"]
        legacy_layers[legacy_layer["id"]] = legacy_layer[match_key]
    for current_item in current_datasets_dir.glob("*.json"):
        current_dataset = json.loads(current_item.read_text())
        current_datasets[int(current_dataset["pk"])] = current_dataset[match_key]
    match_found = {}
    no_match_found = []
    for legacy_id, legacy_matched_key in legacy_layers.items():
        for current_id, current_matched_key in current_datasets.items():
            if legacy_matched_key == current_matched_key:
                match_found[legacy_id] = current_id
                logger.debug(f"Found match for legacy layer {legacy_id} - current dataset {current_id}")
                break
        else:
            no_match_found.append((legacy_id, legacy_matched_key))
            logger.debug(f"No match found for legacy layer {legacy_id} - {legacy_matched_key!r}")
    return match_found, no_match_found


@app.command()
def check_number_of_legacy_layer_styles(
        legacy_layers_dir: Path = Path(__file__).parent / "legacy-data/layers",
):
    style_counts =  []
    for layer_details_path in legacy_layers_dir.glob("*.json"):
        layer_details = json.loads(layer_details_path.read_text())
        layer_styles = layer_details.get("styles", {})
        style_counts.append(
            (
                layer_details["raw_layer_result"]["id"],
                len(layer_styles),
            ),
        )
    style_counts.sort(key=lambda x: x[1])
    for item in style_counts:
        print(f"layer_id: {item[0]} - number of styles: {item[1]}")


@app.command()
def recreate_layer_styles(
        layer_id: str,
        geonode_username: Annotated[
            str,
            typer.Argument(envvar="GEONODE_USERNAME")
        ],
        geonode_password: Annotated[
            str,
            typer.Argument(envvar="GEONODE_PASSWORD")
        ],
        base_url: str = "https://dev.geoplatform.tools4msp.eu",
        legacy_layers_dir: Path = Path(__file__).parent / "legacy-data/layers",
):
    http_client = _login_to_geonode(
        geonode_username, geonode_password, base_url)
    access_token = _get_geoserver_access_token(http_client, base_url)
    logger.info(f"{access_token=}")
    layer_path = legacy_layers_dir / f"{layer_id}.json"
    layer_details = json.loads(layer_path.read_text())
    abrev_alternate = layer_details["raw_layer_result"]["alternate"].rpartition(":")[-1]
    for style_details in layer_details.get("styles", {}).values():
        style_uuid = uuid.uuid4()
        geoserver_style_id = "_".join((
            "imported",
            str(style_uuid),
            "ms",
            abrev_alternate.lower()
        ))
        geonode_style_title = style_details.get("name", abrev_alternate)
        geonode_style_name = f"geonode:{geoserver_style_id}"
        style_sld = style_details["sld"]
        logger.info(f"recreating style: {geoserver_style_id!r} on geoserver...")
        _create_geonode_style(
            http_client,
            access_token,
            geoserver_style_id,
            style_sld,
            base_url,
        )


def _create_geonode_style(
        http_client: httpx.Client,
        access_token: str,
        style_identifier: str,
        style_sld: str,
        base_url: str = "https://dev.geonode.tools4msp.eu",
) -> None:
    # style is created by POSTING the SLD contents with a specific content-type
    response = http_client.post(
        f"{base_url}/gs/rest/workspaces/geonode/styles/",
        #f"{base_url}/gs/rest/workspaces/geonode/styles/{style_identifier}",
        params={
            "raw": True,
            "access_token": access_token,
            "name": style_identifier,
        },
        content=style_sld.encode("utf-8"),
        headers={
            "Content-Type": "application/vnd.ogc.sld+xml",
        }
    )
    response.raise_for_status()


def _get_geoserver_access_token(
        http_client: httpx.Client,
        base_url: str = "https://dev.geonode.tools4msp.eu",
) -> str:
    """Retrieve OAuth access token after session login"""
    response = http_client.get(f"{base_url}/api/o/v4/userinfo")
    response.raise_for_status()
    userinfo = response.json()
    return userinfo["access_token"]


def _get_csrf_token(http_client: httpx.Client) -> str:
    for cookie in http_client.cookies.jar:
        if cookie.name == 'csrftoken':
            csrf_token = cookie.value
            break
    else:
        raise RuntimeError(f"Could not find CSRF token in response cookies")
    return csrf_token


def _login_to_geonode(
        username: str,
        password: str,
        base_url: str = "https://dev.geonode.tools4msp.eu",
) -> httpx.Client:
    """Login to GeoNode by emulating a browser.

    This uses a session-based approach to login to GeoNode. This is done in
    order to be able to issue commands to GeoServer and have oauth work
    correctly.
    """
    http_client = httpx.Client(follow_redirects=True)
    logger.info("Getting login page to extract CSRF token...")
    login_page_url = f"{base_url}/account/login/"
    # now visiting the login page in order to get csrftoken
    http_client.get(login_page_url)
    csrf_token = _get_csrf_token(http_client)
    login_response = http_client.post(
        login_page_url,
        data={
            "login": username,
            "password": password,
            "csrfmiddlewaretoken": csrf_token,
            "next": "/"
        },
        headers={
            "Referer": login_page_url,
            "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0"
        },
    )

    if login_response.status_code == 200:
        if '/account/login/' in str(login_response.url):
            logger.error("Login appears to have failed - still on login page")
            logger.error(f"Response URL: {login_response.url}")
            raise RuntimeError("Login failed - check credentials")

    has_session = any(
        cookie.name in ['sessionid', 'csrftoken']
        for cookie in http_client.cookies.jar
    )

    if not has_session:
        raise RuntimeError("No session cookie found after login")

    logger.info("Session established successfully")
    return http_client


def _convert_style_properties_to_lowercase(sld_style: str) -> str:
    """Converts dataset property names mentioned in SLD style to lower case."""
    ogc_ns = "http://www.opengis.net/ogc"
    root = etree.fromstring(sld_style)
    for property_name_el in root.findall(f".//{{{ogc_ns}}}PropertyName"):
        old_text = property_name_el.text
        property_name_el.text = old_text.lower()
    return etree.tostring(root).decode("utf-8")


if __name__ == "__main__":
    app()