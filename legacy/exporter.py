"""Export items from the legacy v3.3.4 GeoNode platform to a file system location."""

import argparse
import dataclasses
import datetime as dt
import json
import logging
import os
import re
import time
import uuid
from pathlib import Path
from typing import Iterator

import httpx
import psycopg

logger = logging.getLogger(__name__)


@dataclasses.dataclass(frozen=True)
class DbConfig:
    port: int
    name: str
    user: str
    password: str
    host: str = "localhost"

    @property
    def connection_string(self) -> str:
        return (
            f"host={self.host} port={self.port} dbname={self.name} "
            f"user={self.user} password={self.password}"
        )

    @classmethod
    def from_env(cls):
        try:
            return cls(
                host=os.environ.get("LEGACY_DB_HOST", "localhost"),
                port=int(os.environ.get("LEGACY_DB_PORT", "5432")),
                name=os.environ.get("LEGACY_DB_NAME", "geoportal"),
                user=os.environ.get("LEGACY_DB_USER", "geoportal"),
                password=os.environ["LEGACY_DB_PASSWORD"]
            )
        except ValueError as err:
            logger.error("Environment variable LEGACY_DB_PASSWORD is not set.")
            raise SystemExit(1) from err


@dataclasses.dataclass(frozen=True)
class GeonodeUser:
    id: int
    username: str
    email: str | None = None


@dataclasses.dataclass(frozen=True)
class RestrictionCodeType:
    id: int
    identifier: str


@dataclasses.dataclass(frozen=True)
class License:
    id: int
    identifier: str
    name: str


@dataclasses.dataclass(frozen=True)
class TopicCategory:
    id: int
    identifier: str


@dataclasses.dataclass(frozen=True)
class SpatialRepresentationType:
    id: int
    identifier: str


@dataclasses.dataclass(frozen=True)
class GeonodeGroup:
    id: int
    name: str


@dataclasses.dataclass(frozen=True)
class HierarchicalTag:
    id: int
    slug: str
    path: str


@dataclasses.dataclass(frozen=True)
class Thesaurus:
    id: int
    identifier: str
    slug: str


@dataclasses.dataclass(frozen=True)
class ThesaurusKeyword:
    id: int
    alt_label: str
    thesaurus: Thesaurus


@dataclasses.dataclass(frozen=True)
class SpatialRegion:
    id: int
    code: str


@dataclasses.dataclass(frozen=True)
class UserPermission:
    id: int
    codename: str


@dataclasses.dataclass(frozen=True)
class GroupPermission:
    id: int
    codename: str


@dataclasses.dataclass(frozen=True)
class GeonodeResource:
    id: uuid.UUID
    title: str
    abstract: str
    purpose: str | None
    owner: GeonodeUser
    alternate: str | None
    date: dt.datetime
    date_type: str
    edition: str | None
    attribution: str | None
    doi: str | None
    maintenance_frequency: str | None
    keywords: list[HierarchicalTag] | None
    thesaurus_keywords: list[HierarchicalTag] | None
    spatial_regions: list[SpatialRegion] | None
    restriction_code_type: RestrictionCodeType | None
    constraints_other: str | None
    license: License | None
    language: str
    category: TopicCategory | None
    spatial_representation_type: SpatialRepresentationType | None
    temporal_extent_start: dt.datetime | None
    temporal_extent_end: dt.datetime | None
    supplemental_information: str
    data_quality_statement: str | None
    group: GeonodeGroup | None
    bbox_polygon: str | None
    ll_bbox_polygon: str | None
    srid: str | None
    csw_typename: str
    csw_schema: str
    csw_mdsource: str
    csw_insert_date: dt.datetime | None
    csw_type: str
    csw_anytext: str | None
    csw_wkt_geometry: str
    metadata_uploaded: bool
    metadata_uploaded_preserve: bool
    metadata_xml: str | None
    popular_count: int
    share_count: int
    featured: bool
    was_published: bool
    is_published: bool
    was_approved: bool
    is_approved: bool
    thumbnail_url: str | None
    detail_url: str | None
    rating: int | None
    created: dt.datetime | None
    last_updated: dt.datetime | None
    dirty_state: bool
    # skipping user_geolimits - the table is empty on the legacy instance
    # skipping group_geolimits - the table is empty on the legacy instance
    resource_type: str | None
    metadata_only: bool
    # skipping metadata - the entries do not belong to any map
    user_permissions: list[tuple[GeonodeUser, UserPermission]]
    group_permissions: list[tuple[GeonodeGroup, UserPermission]]
    contacts: list[tuple[GeonodeUser, str]]


@dataclasses.dataclass(frozen=True)
class GeonodeMapLayer:
    stack_order: int
    format_: str | None
    name: str | None
    store: str | None
    opacity: float
    styles: str | None
    transparent: bool
    fixed: bool
    group: str | None
    visibility: bool
    ows_url: str | None
    layer_params: dict
    source_params: str
    local: bool


@dataclasses.dataclass(frozen=True)
class GeonodeMap:
    resource: GeonodeResource
    zoom: int
    projection: str
    center_x: float
    center_y: float
    last_modified: dt.datetime
    urlsuffix: str
    featuredurl: str
    layers: list[GeonodeMapLayer]


def _gather_tags(cursor: psycopg.Cursor) -> dict[int, HierarchicalTag]:
    cursor.execute(
        "SELECT DISTINCT tci.tag_id, hk.slug, hk.path "
        "FROM base_taggedcontentitem AS tci "
        "JOIN base_resourcebase AS rb ON rb.id = tci.content_object_id "
        "JOIN maps_map AS m ON m.resourcebase_ptr_id = rb.id "
        "JOIN base_hierarchicalkeyword AS hk ON tci.tag_id = hk.id;"
    )
    return {
        record[0]: HierarchicalTag(
            id=record[0],
            slug=record[1],
            path=record[2],
        )
        for record in cursor
    }


def _gather_restriction_code_types(
        cursor: psycopg.Cursor) -> dict[int, RestrictionCodeType]:
    cursor.execute(
        "SELECT DISTINCT rb.restriction_code_type_id, rc.identifier "
        "FROM base_resourcebase AS rb "
        "JOIN base_restrictioncodetype AS rc ON rc.id = rb.restriction_code_type_id;"
    )
    return {
        record[0]: RestrictionCodeType(
            id=record[0],
            identifier=record[1]
        ) for record in cursor
    }


def _gather_topic_categories(
        cursor: psycopg.Cursor) -> dict[int, TopicCategory]:
    cursor.execute(
        "SELECT DISTINCT rb.category_id, tc.identifier "
        "FROM base_resourcebase AS rb "
        "JOIN maps_map AS m ON rb.id = m.resourcebase_ptr_id "
        "JOIN base_topiccategory AS tc ON tc.id = rb.category_id;"
    )
    return {
        record[0]: TopicCategory(
            id=record[0],
            identifier=record[1],
        ) for record in cursor
    }


def _gather_licenses(
        cursor: psycopg.Cursor) -> dict[int, License]:
    cursor.execute(
        "SELECT DISTINCT rb.license_id, li.identifier, li.name "
        "FROM base_resourcebase AS rb "
        "JOIN maps_map AS m ON rb.id = m.resourcebase_ptr_id "
        "JOIN base_license AS li ON li.id = rb.license_id;"
    )
    return {
        record[0]: License(
            id=record[0],
            identifier=record[1],
            name=record[2]
        ) for record in cursor
    }


def _gather_spatial_representation_types(
        cursor: psycopg.Cursor) -> dict[int, SpatialRepresentationType]:
    cursor.execute(
        "SELECT DISTINCT rb.spatial_representation_type_id, sr.identifier "
        "FROM base_resourcebase AS rb "
        "JOIN maps_map AS m ON rb.id = m.resourcebase_ptr_id "
        "JOIN base_spatialrepresentationtype AS sr ON sr.id = rb.spatial_representation_type_id;"
    )
    return {
        record[0]: SpatialRepresentationType(
            id=record[0],
            identifier=record[1],
        ) for record in cursor
    }


def _gather_groups(
        cursor: psycopg.Cursor) -> dict[int, GeonodeGroup]:
    cursor.execute(
        "SELECT DISTINCT rb.group_id, g.name "
        "FROM base_resourcebase AS rb "
        "JOIN maps_map AS m ON rb.id = m.resourcebase_ptr_id "
        "JOIN auth_group AS g ON g.id = rb.group_id;"
    )
    return {
        record[0]: GeonodeGroup(
            id=record[0],
            name=record[1],
        ) for record in cursor
    }


def _gather_all_groups(
        cursor: psycopg.Cursor) -> dict[int, GeonodeGroup]:
    cursor.execute(
        "SELECT g.id, g.name "
        "FROM auth_group AS g;"
    )
    return {
        record[0]: GeonodeGroup(
            id=record[0],
            name=record[1],
        ) for record in cursor
    }


def _gather_map_owners(cursor: psycopg.Cursor) -> dict[int, GeonodeUser]:
    cursor.execute(
        "WITH map_owner AS "
        "("
        "SELECT DISTINCT owner_id "
        "FROM base_resourcebase AS rb "
        "JOIN maps_map AS m ON m.resourcebase_ptr_id = rb.id"
        ") "
        "SELECT p.id, p.username, p.email "
        "FROM people_profile AS p "
        "JOIN map_owner AS m ON p.id = m.owner_id;"
    )
    return {
        record[0]: GeonodeUser(
            id=record[0],
            username=record[1],
            email=record[2]
        ) for record in cursor
    }


def _gather_all_users(cursor: psycopg.Cursor) -> dict[int, GeonodeUser]:
    cursor.execute(
        "SELECT p.id, p.username, p.email "
        "FROM people_profile AS p;"
    )
    return {
        record[0]: GeonodeUser(
            id=record[0],
            username=record[1],
            email=record[2]
        ) for record in cursor
    }


def _gather_thesaurus_keywords(cursor: psycopg.Cursor) -> dict[int, ThesaurusKeyword]:
    cursor.execute(
        "SELECT t.id, t.identifier, t.slug, tk.id, tk.alt_label "
        "FROM base_resourcebase_tkeywords AS rbtk "
        "JOIN maps_map AS m ON m.resourcebase_ptr_id = rbtk.resourcebase_id "
        "JOIN base_thesauruskeyword AS tk ON tk.id = rbtk.thesauruskeyword_id "
        "JOIN base_thesaurus AS t ON t.id = tk.thesaurus_id;"
    )
    result = {}
    for record in cursor:
        thesaurus = Thesaurus(
            id=record[0],
            identifier=record[1],
            slug=record[2],
        )
        keyword = ThesaurusKeyword(
            id=record[3],
            alt_label=record[4],
            thesaurus=thesaurus
        )
        result[keyword.id] = keyword
    return result


def _gather_spatial_regions(cursor: psycopg.Cursor) -> dict[int, SpatialRegion]:
    cursor.execute(
        "WITH featured_region AS "
        "("
        "SELECT DISTINCT rr.region_id "
        "FROM base_resourcebase_regions AS rr "
        "JOIN maps_map AS m ON m.resourcebase_ptr_id = rr.resourcebase_id"
        ") "
        "SELECT r.id, r.code "
        "FROM base_region AS r "
        "JOIN featured_region AS fr ON fr.region_id = r.id;"
    )
    return {
        record[0]: SpatialRegion(
            id=record[0],
            code=record[1],
        ) for record in cursor}


def _gather_user_permissions(cursor: psycopg.Cursor) -> dict[int, UserPermission]:
    cursor.execute(
        "SELECT DISTINCT p.id, p.codename "
        "FROM guardian_userobjectpermission AS up "
        "JOIN maps_map AS m ON m.resourcebase_ptr_id = cast(up.object_pk AS integer) "
        "JOIN auth_permission AS p ON p.id = up.permission_id;"
    )
    return {
        record[0]: UserPermission(
            id=record[0],
            codename=record[1]
        )
        for record in cursor
    }


def _gather_group_permissions(cursor: psycopg.Cursor) -> dict[int, GroupPermission]:
    cursor.execute(
        "SELECT DISTINCT p.id, p.codename "
        "FROM guardian_groupobjectpermission AS gp "
        "JOIN maps_map AS m ON m.resourcebase_ptr_id = cast(gp.object_pk AS integer) "
        "JOIN auth_permission AS p ON p.id = gp.permission_id;"
    )
    return {
        record[0]: GroupPermission(
            id=record[0],
            codename=record[1]
        )
        for record in cursor
    }


def _gather_map_related_resources(
        cursor: psycopg.Cursor,
        owners: dict[int, GeonodeUser],
        all_users: dict[int, GeonodeUser],
        all_groups: dict[int, GeonodeGroup],
        tags: dict[int, HierarchicalTag],
        thesaurus_keywords: dict[int, ThesaurusKeyword],
        spatial_regions: dict[int, SpatialRegion],
        restriction_code_types: dict[int, RestrictionCodeType],
        licenses: dict[int, License],
        topic_categories: dict[int, TopicCategory],
        spatial_representation_types: dict[int, SpatialRepresentationType],
        groups: dict[int, GeonodeGroup],
        user_permissions: dict[int, UserPermission],
        group_permissions: dict[int, GroupPermission],
) -> dict[int, GeonodeResource]:
    raw_related_keywords = {}
    cursor.execute(
        "SELECT tci.content_object_id, tci.tag_id "
        "FROM base_taggedcontentitem AS tci "
        "JOIN maps_map AS m ON m.resourcebase_ptr_id = tci.content_object_id;"
    )
    for record in cursor:
        keyword_set = raw_related_keywords.setdefault(record[0], set())
        keyword_set.add(tags[record[1]])

    raw_thesaurus_keywords = {}
    cursor.execute(
        "SELECT tk.resourcebase_id, tk.thesauruskeyword_id "
        "FROM base_resourcebase_tkeywords AS tk "
        "JOIN maps_map AS m ON m.resourcebase_ptr_id = tk.resourcebase_id;"
    )
    for record in cursor:
        keyword_set = raw_thesaurus_keywords.setdefault(record[0], set())
        keyword_set.add(thesaurus_keywords[record[1]])

    raw_related_regions = {}
    cursor.execute(
        "SELECT rr.resourcebase_id, rr.region_id "
        "FROM base_resourcebase_regions AS rr "
        "JOIN maps_map AS m ON m.resourcebase_ptr_id = rr.resourcebase_id;"
    )
    for record in cursor:
        region_set = raw_related_regions.setdefault(record[0], set())
        region_set.add(spatial_regions[record[1]])

    raw_related_user_permissions = {}
    cursor.execute(
        "SELECT CAST(up.object_pk AS INTEGER), up.permission_id, up.user_id "
        "FROM guardian_userobjectpermission AS up "
        "JOIN maps_map AS m ON m.resourcebase_ptr_id = CAST(up.object_pk AS INTEGER);"
    )
    for record in cursor:
        user_permission_set = raw_related_user_permissions.setdefault(record[0], set())
        user_permission_set.add(
            (all_users[record[2]], user_permissions[record[1]])
        )

    raw_related_group_permissions = {}
    cursor.execute(
        "SELECT CAST(gp.object_pk AS INTEGER), gp.permission_id, gp.group_id "
        "FROM guardian_groupobjectpermission AS gp "
        "JOIN maps_map AS m ON m.resourcebase_ptr_id = CAST(gp.object_pk AS INTEGER);"
    )
    for record in cursor:
        group_permission_set = raw_related_group_permissions.setdefault(record[0], set())
        group_permission_set.add(
            (all_groups[record[2]], group_permissions[record[1]])
        )

    raw_related_contacts = {}
    cursor.execute(
        "SELECT cr.role, cr.contact_id, cr.resource_id "
        "FROM base_contactrole AS cr "
        "JOIN maps_map AS m ON m.resourcebase_ptr_id = cr.resource_id;"
    )
    for record in cursor:
        contact_set = raw_related_contacts.setdefault(record[2], set())
        contact_set.add(
            (all_users[record[1]], record[0])
        )

    cursor.execute(
        "SELECT "
        "rb.id, "  # 0
        "rb.title, "  # 1
        "rb.abstract, "  # 2
        "rb.purpose, "  # 3
        "rb.owner_id, "  # 4
        "rb.alternate, "  # 5
        "rb.date, "  # 6
        "rb.date_type, "  # 7
        "rb.edition, "  # 8
        "rb.attribution, "  # 9
        "rb.doi, "  # 10
        "rb.maintenance_frequency, "  # 11
        "rb.restriction_code_type_id, "  # 12
        "rb.constraints_other, "  # 13
        "rb.license_id, "  # 14
        "rb.language, "  # 15
        "rb.category_id, "  # 16
        "rb.spatial_representation_type_id, "  # 17
        "rb.temporal_extent_start, "  # 18
        "rb.temporal_extent_end, "  # 19
        "rb.supplemental_information, "  # 20
        "rb.data_quality_statement, "  # 21
        "rb.group_id, "  # 22
        "st_astext(rb.bbox_polygon), "  # 23
        "st_astext(rb.ll_bbox_polygon), "  # 24
        "rb.srid, "  # 25
        "rb.csw_typename, "  # 26
        "rb.csw_schema, "  # 27
        "rb.csw_mdsource, "  # 28
        "rb.csw_insert_date, "  # 29
        "rb.csw_type, "  # 30
        "rb.csw_anytext, "  # 31
        "rb.csw_wkt_geometry, "  # 32
        "rb.metadata_uploaded, "  # 33
        "rb.metadata_uploaded_preserve, "  # 34
        "rb.metadata_xml, "  # 35
        "rb.popular_count, "  # 36
        "rb.share_count, "  # 37
        "rb.featured, "  # 38
        "rb.was_published, "  # 39
        "rb.is_published, "  # 40
        "rb.was_approved, "  # 41
        "rb.is_approved, "  # 42
        "rb.thumbnail_url, "  # 43
        "rb.detail_url, "  # 44
        "rb.rating, "  # 45
        "rb.created, "  # 46
        "rb.last_updated, "  # 47
        "rb.dirty_state, "  # 48
        "rb.resource_type, "  # 49
        "rb.metadata_only "  # 50
        "FROM base_resourcebase AS rb "
        "JOIN maps_map AS m ON rb.id = m.resourcebase_ptr_id "
    )
    result = {}
    for record in cursor:
        resource_id = record[0]
        result[resource_id] = GeonodeResource(
            id=resource_id,
            title=record[1],
            abstract=record[2],
            purpose=record[3],
            owner=owners[record[4]],
            alternate=record[5],
            date=record[6],
            date_type=record[7],
            edition=record[8],
            attribution=record[9],
            doi=record[10],
            maintenance_frequency=record[11],
            keywords=list(raw_related_keywords.get(resource_id, [])),
            thesaurus_keywords=raw_thesaurus_keywords.get(resource_id, []),
            spatial_regions=list(raw_related_regions.get(resource_id, [])),
            restriction_code_type=restriction_code_types[record[12]] if record[12] else None,
            constraints_other=record[13],
            license=licenses[record[14]],
            language=record[15],
            category=topic_categories[record[16]] if record[16] else None,
            spatial_representation_type=spatial_representation_types[record[17]] if record[17] else None,
            temporal_extent_start=record[18],
            temporal_extent_end=record[19],
            supplemental_information=record[20],
            data_quality_statement=record[21],
            group=groups[record[22]] if record[22] else None,
            bbox_polygon=record[23],
            ll_bbox_polygon=record[24],
            srid=record[25],
            csw_typename=record[26],
            csw_schema=record[27],
            csw_mdsource=record[28],
            csw_insert_date=record[29],
            csw_type=record[30],
            csw_anytext=record[31],
            csw_wkt_geometry=record[32],
            metadata_uploaded=record[33],
            metadata_uploaded_preserve=record[34],
            metadata_xml=record[35],
            popular_count=record[36],
            share_count=record[37],
            featured=record[38],
            was_published=record[39],
            is_published=record[40],
            was_approved=record[41],
            is_approved=record[42],
            thumbnail_url=record[43],
            detail_url=record[44],
            rating=record[45],
            created=record[46],
            last_updated=record[47],
            dirty_state=record[48],
            resource_type=record[49],
            metadata_only=record[50],
            user_permissions=list(raw_related_user_permissions.get(resource_id, [])),
            group_permissions=list(raw_related_group_permissions.get(resource_id, [])),
            contacts=list(raw_related_contacts.get(resource_id, []))
        )
    return result


def gather_map_layers(
        cursor: psycopg.Cursor,
        map_id: int
) -> list[GeonodeMapLayer]:
    cursor.execute(
        f"SELECT "
        f"id, "  # 0
        f"stack_order, "  # 1
        f"format, "  # 2
        f"name, "  # 3
        f"opacity, "  # 4
        f"styles, "  # 5
        f"transparent, "  # 6
        f"fixed, "  # 7
        f"\"group\", "  # 8
        f"visibility, "  # 9
        f"ows_url, "  # 10
        f"layer_params, "  # 11
        f"source_params, "  # 12
        f"local, "  # 13
        f"store "  # 14
        f"FROM maps_maplayer "
        f"WHERE map_id = {map_id};"
    )
    return [
        GeonodeMapLayer(
            stack_order=record[1],
            format_=record[2],
            name=record[3],
            opacity=record[4],
            styles=record[5],
            transparent=record[6],
            fixed=record[7],
            group=record[8],
            visibility=record[9],
            ows_url=record[10],
            layer_params=json.loads(record[11]),
            source_params=record[12],
            local=record[13],
            store=record[14],
        )
        for record in cursor
    ]


def _gather_map_details(
        cursor: psycopg.Cursor,
        resources: dict[int, GeonodeResource],
) -> dict[int, GeonodeMap]:
    cursor.execute(
        "SELECT "
        "m.resourcebase_ptr_id, "
        "m.zoom, "
        "m.projection, "
        "m.center_x, "
        "m.center_y, "
        "m.last_modified, "
        "m.urlsuffix, "
        "m.featuredurl "
        "FROM maps_map AS m;"
    )
    result = {}
    for record in cursor:
        map_id = record[0]
        result[map_id] = GeonodeMap(
            resource=resources[map_id],
            zoom=record[1],
            projection=record[2],
            center_x=record[3],
            center_y=record[4],
            last_modified=record[5],
            urlsuffix=record[6],
            featuredurl=record[7],
            layers=[],
        )
    for map_id, geonode_map in result.items():
        geonode_map.layers.extend(gather_map_layers(cursor, map_id))
    return result


def export_geonode_maps(db_config: DbConfig):
    with psycopg.connect(db_config.connection_string) as conn:
        with conn.cursor() as cursor:
            map_related_resources = _gather_map_related_resources(
                cursor,
                owners=_gather_map_owners(cursor),
                all_users=_gather_all_users(cursor),
                all_groups=_gather_all_groups(cursor),
                tags=_gather_tags(cursor),
                thesaurus_keywords=_gather_thesaurus_keywords(cursor),
                spatial_regions=_gather_spatial_regions(cursor),
                restriction_code_types=_gather_restriction_code_types(cursor),
                licenses=_gather_licenses(cursor),
                topic_categories=_gather_topic_categories(cursor),
                spatial_representation_types=_gather_spatial_representation_types(cursor),
                groups=_gather_groups(cursor),
                user_permissions=_gather_user_permissions(cursor),
                group_permissions=_gather_group_permissions(cursor),
            )
            maps = _gather_map_details(cursor, map_related_resources)
    return maps


class DateTimeJsonEncoder(json.JSONEncoder):

    def default(self, obj):
        if isinstance(obj, dt.datetime):
            return obj.isoformat()
        return super().default(obj)


def serialize_exported_maps(maps: dict[int, GeonodeMap], target_dir: Path):
    for geonode_map in maps.values():
        target_path = target_dir / f"geonode-map-{geonode_map.resource.id}.json"
        logger.info(f"Writing map {geonode_map.resource.id!r} to {target_path}...")
        with open(target_path, "w", encoding="utf-8") as fh:
            json.dump(
                dataclasses.asdict(geonode_map),
                fh,
                default=str,
                indent=2,
                ensure_ascii=False,
                cls=DateTimeJsonEncoder,
            )


def store_api_responses():
    http_client = httpx.Client()
    base_target_dir = Path(__file__).parent / "exported"
    base_target_dir.mkdir(parents=True, exist_ok=True)
    target_maps_dir = base_target_dir / "maps"
    target_maps_dir.mkdir(parents=True, exist_ok=True)
    target_layers_dir = base_target_dir / "layers"
    target_layers_dir.mkdir(parents=True, exist_ok=True)
    detail_generator = gather_map_details_via_api(http_client, limit=10)
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
        http_client: httpx.Client,
        limit: int = 20
) -> Iterator[tuple[dict, dict, list[tuple[int, int, str, str]], list[tuple[int, str]]]]:
    base_url = "https://geoplatform.tools4msp.eu"
    current_offset = 0
    next_url = f"{base_url}/api/maps/?limit={limit}&offset={current_offset}"
    seen_layers = []
    while next_url:
        maps_processed = {}
        layers_processed = {}
        layers_ignored = []
        styles_ignored = []
        map_list_response = http_client.get(next_url)
        logger.info(f"Processing response from URL: {map_list_response.request.url!r}")
        map_list_response.raise_for_status()
        response_repr = map_list_response.json()
        for map_list_repr in response_repr["objects"]:
            map_id = map_list_repr["id"]
            logger.info(f"Processing map: {map_id!r}")
            maps_processed[map_id] = map_list_repr
            for map_layer_index, map_layer_repr in enumerate(map_list_repr["layers"]):
                layer_params = json.loads(map_layer_repr["layer_params"])
                logger.info(f"[{map_layer_index}] Processing layer {map_layer_repr['name']!r}")
                try:
                    catalog_url = layer_params["catalogURL"]
                except KeyError:
                    layers_ignored.append(
                        (
                            map_id, map_layer_index, map_layer_repr["name"],
                            "Could not find a catalogURL property on layer params"
                        )
                    )
                    continue
                if catalog_url is None:
                    layers_ignored.append(
                        (
                            map_id, map_layer_index, map_layer_repr["name"],
                            "catalogURL property is empty"
                        )
                    )
                    continue
                try:
                    layer_uuid = re.search(
                        r"[a-f0-9]{8}-([a-f0-9]{4}-){3}[a-f0-9]{12}",
                        layer_params["catalogURL"]
                    ).group()
                except TypeError:
                    layers_ignored.append(
                        (
                            map_id, map_layer_index, map_layer_repr["name"],
                            f"Could not extract layer UUID from catalogURL: {catalog_url!r}"
                        )
                    )
                    continue
                layer_list_response = http_client.get(f"{base_url}/api/layers/", params={"uuid": layer_uuid})
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
                layer_detail_response = http_client.get(f"{base_url}/api/layers/{layer_id}/")
                layer_detail_response.raise_for_status()
                layer_detail_repr = layer_detail_response.json()
                layer_result = {
                    "raw_layer_result": layer_detail_repr,
                    "styles": {}
                }
                layer_style_ids = [
                    int(style_repr.split("/")[3]) for style_repr in layer_detail_repr["styles"]
                ]
                for style_id in layer_style_ids:
                    style_detail_response = http_client.get(f"{base_url}/api/styles/{style_id}/")
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
        next_url = None



if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description=(
            "Export GeoNode maps from a legacy v3.3.4 instance onto a "
            "bunch of JSON files."
        )
    )
    parser.add_argument(
        "output_dir", type=Path, help="Directory to write exported maps to."
    )
    args = parser.parse_args()
    if not args.output_dir.is_dir():
        raise FileNotFoundError(args.output_dir)
    logging.basicConfig(level=logging.DEBUG)
    db_config = DbConfig.from_env()
    geonode_maps = export_geonode_maps(db_config)
    serialize_exported_maps(geonode_maps, args.output_dir)