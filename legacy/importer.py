import json
import logging
import uuid
from pathlib import Path
from typing import (
    Annotated,
    Iterator,
)

import httpx
import typer

logger = logging.getLogger(__name__)

app = typer.Typer()


@app.command()
def import_map(
        legacy_map_id: str,
        geonode_username: Annotated[
            str,
            typer.Argument(envvar="GEONODE_USERNAME")
        ],
        geonode_password: Annotated[
            str,
            typer.Argument(envvar="GEONODE_PASSWORD")
        ],
        base_url: str = "https://dev.geoplatform.tools4msp.eu",
        legacy_base_dir: Path = Path(__file__).parent / "legacy-data",
        current_base_dir: Path = Path(__file__).parent / "current-data",
        imported_prefix: str = "imported__"
):
    legacy_maps_dir = legacy_base_dir / "maps"
    legacy_map_path = legacy_maps_dir / f"{legacy_map_id}.json"
    matched_datasets, not_matched = _get_matched_dataset_ids(
        legacy_base_dir / "layers",
        current_base_dir / "datasets"
    )
    legacy_map_details = json.loads(legacy_map_path.read_text())

    new_map_repr = _convert_legacy_map_representation_to_current(
        legacy_map_details, matched_datasets
    )
    for map_layer in new_map_repr["layers"]:
        if map_layer.get("group") == "background" or map_layer.get("local"):
            continue

    # new_map_layers_details = []
    new_extra_map_layers_details = []
    for legacy_map_layer in legacy_map_details["layers"]:
        if legacy_map_layer.get("group") == "background":
            continue
        legacy_map_layer_name = legacy_map_layer["name"]
        logger.info(f"Processing legacy map layer: {legacy_map_layer_name!r}...")
        if legacy_map_layer.get("local"):
            legacy_layer_id = legacy_map_layer["geonode_internal_layer_id"]
            matching_dataset_id = matched_datasets.get(legacy_layer_id)
            if matching_dataset_id is None:
                if legacy_layer_id in not_matched:
                    logger.warning(f"ignoring not matched layer with id {legacy_layer_id!r}")
                    continue
                else:
                    raise RuntimeError(
                        f"Could not match legacy map layer {legacy_map_layer_name!r}({legacy_layer_id!r}) to an "
                        f"existing dataset"
                    )
            try:
                new_repr = [la for la in new_map_repr.get("layers", []) if la.get("name") == legacy_map_layer_name][0]
            except IndexError:
                logger.warning(f"Could not find this layer in the new set of layers - ignoring...")
                continue
            # map_layer_details = _translate_legacy_local_map_layer_to_current_map_layer(
            #     legacy_map_layer, matching_dataset_id
            # )
            # new_map_layers_details.append(map_layer_details)
            # extra_map_layer_details = _get_extra_maplayers_key(legacy_map_layer_name, ms_ids[legacy_map_layer_name])
            new_extra_map_layers_details.append(
                {
                    "pk": matching_dataset_id,
                    "name": legacy_map_layer_name,
                    "extra_params": {
                        "msId": new_repr["id"],
                    },
                }
            )
        else:
            ...
            # map_layer_details = _translate_legacy_remote_map_layer_to_current_map_layer(legacy_map_layer)

    try:
        new_map_details = {
            "abstract": legacy_map_details["abstract"],
            "title": f'{imported_prefix}{legacy_map_details["title"]}',
            "data": {
                "map": new_map_repr,
            },
            "maplayers": new_extra_map_layers_details
        }
        # print(json.dumps(new_map_details, indent=2))
    except KeyError:
        logger.exception(f"Got an error converting map {legacy_map_id}")
        raise

    http_client = _login_to_geonode(
        geonode_username, geonode_password, base_url)
    access_token = _get_geoserver_access_token(http_client, base_url)
    logger.info(f"{access_token=}")
    new_map_creation_result = http_client.post(
        f"{base_url}/api/v2/maps/",
        json=new_map_details,
        headers={
            "authorization": f"Bearer {access_token}",
            "x-csrftoken": _get_csrf_token(http_client),
            "referer": f"{base_url}/catalogue"
        },
        timeout=60.0
    )
    try:
        new_map_creation_result.raise_for_status()
    except httpx.HTTPStatusError as err:
        print(f"Map creation failed with {new_map_creation_result.status_code} - {new_map_creation_result.content}")
        print(err)
    response_payload = new_map_creation_result.json()
    print(response_payload)


def _find_legacy_layer_id(map_config: dict, layer_name: str) -> int | None:
    for idx, layer_config in enumerate(map_config.get("layers", [])):
        if layer_config.get("name") == layer_name:
            return layer_config.get("geonode_internal_layer_id")
    else:
        return None


def _convert_legacy_map_representation_to_current(
        full_map_config: dict,
        matched_layers: dict[str, int],
        old_domain: str = "geoplatform.tools4msp.eu",
        new_domain: str = "dev.geoplatform.tools4msp.eu"
) -> dict | None:
    ui_map_config = full_map_config.get("ui_map_config", {})
    serialized_ui_map_config = json.dumps(ui_map_config)
    new_ui_map_config = json.loads(
        serialized_ui_map_config.replace(old_domain, new_domain))
    layer_msid = str(uuid.uuid4())
    for layer_info in new_ui_map_config.get("layers", []):
        if not (
                internal_id := _find_legacy_layer_id(
                    full_map_config, layer_info.get("name"))
        ):
            logger.info(f"Could not find internal id for layer {layer_info['name']!r} - skipping...")
            continue
        logger.debug(f"{internal_id=}")

        if not (dataset_id := matched_layers.get(internal_id)):
            logger.info(f"Could not find new dataset_id for layer_id {internal_id!r} - skipping...")
            continue
        layer_info["id"] = layer_msid
        layer_info["extendedParams"] = {
            "mapLayer": {
                "pk": dataset_id,
                "extraParams": {
                    "msId": layer_msid,
                },
            },
        }
    return new_ui_map_config


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
):
    http_client = httpx.Client(
        auth=(current_geonode_username, current_geonode_password)
    )
    base_target_dir = Path(__file__).parent / "current-data"
    base_target_dir.mkdir(parents=True, exist_ok=True)
    target_datasets_dir = base_target_dir / "datasets"
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
        current_datasets_dir: Path = Path(__file__).parent / "current-data/datasets"
):
    match_found, no_match_found = _get_matched_dataset_ids(
        legacy_layers_dir, current_datasets_dir)
    matched_path = Path(__file__).parent / "current-data/dataset-matches.json"
    unmatched_path = Path(__file__).parent / "current-data/match-errors.json"
    matched_path.write_text(json.dumps(match_found, indent=2))
    print(f"wrote {matched_path} with matched datasets")
    if len(no_match_found) > 0:
        unmatched_path.write_text("\n".join(str(i) for i in no_match_found))
        print(f"wrote {unmatched_path} with unmatched datasets")


def _get_matched_dataset_ids(
        legacy_layers_dir: Path,
        current_datasets_dir: Path
) -> tuple[dict[str, str], list[str]]:
    legacy_layers = {}
    current_datasets = {}
    for legacy_item in legacy_layers_dir.glob("*.json"):
        legacy_contents = json.loads(legacy_item.read_text())
        legacy_layer = legacy_contents["raw_layer_result"]
        legacy_layers[legacy_layer["id"]] = legacy_layer["title"]
    for current_item in current_datasets_dir.glob("*.json"):
        current_dataset = json.loads(current_item.read_text())
        current_datasets[current_dataset["pk"]] = current_dataset["title"]
    match_found = {}
    no_match_found = []
    for legacy_id, legacy_title in legacy_layers.items():
        for current_id, current_title in current_datasets.items():
            if legacy_title == current_title:
                match_found[legacy_id] = int(current_id)
                logger.debug(f"Found match for legacy layer {legacy_id} - current dataset {current_id}")
                break
        else:
            no_match_found.append(legacy_id)
            logger.debug(f"No match found for legacy layer {legacy_id} - {legacy_title!r}")
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
):
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


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    app()