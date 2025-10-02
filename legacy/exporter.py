"""Export items from the legacy v3.3.4 GeoNode platform to a file system location."""

import dataclasses
import datetime as dt
import logging
import os
import uuid

import psycopg

logger = logging.getLogger(__name__)


@dataclasses.dataclass(frozen=True)
class DbConfig:
    host: str
    port: int
    name: str
    user: str
    password: str

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
    # contacts comes from an m2m relationship
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


def gather_tags(cursor: psycopg.Cursor) -> dict[int, HierarchicalTag]:
    cursor.execute(
        "SELECT DISTINCT tci.tag_id, hk.slug, hk.path "
        "FROM base_taggedcontentitem AS tci "
        "JOIN base_resourcebase AS rb ON rb.id = tci.content_object_id "
        "JOIN maps_map AS m ON m.resourcebase_ptr_id = rb.id "
        "JOIN base_hierarchicalkeyword AS hk ON tci.tag_id = hk.id;"
    )


def gather_restriction_code_types(
        cursor: psycopg.Cursor) -> dict[int, RestrictionCodeType]:
    cursor.execute(
        "SELECT DISTINCT rb.restriction_code_type_id, rc.identifier "
        "FROM base_resourcebase AS rb "
        "JOIN maps_map AS m ON m.id = rb.resourcebase_ptr_id "
        "JOIN base_restrictioncodetype AS rc ON rc.id = rb.resource_code_type_id;"
    )
    return {
        record[0]: RestrictionCodeType(
            id=record[0],
            identifier=record[1]
        ) for record in cursor
    }


def gather_topic_categories(
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


def gather_licenses(
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


def gather_spatial_representation_types(
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


def gather_groups(
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


def gather_all_groups(
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


def gather_map_owners(cursor: psycopg.Cursor) -> dict[int, GeonodeUser]:
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


def gather_all_users(cursor: psycopg.Cursor) -> dict[int, GeonodeUser]:
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


def gather_thesaurus_keywords(cursor: psycopg.Cursor) -> dict[int, ThesaurusKeyword]:
    cursor.execute(
        "SELECT t.*, tk.* "
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


def gather_spatial_regions(cursor: psycopg.Cursor) -> dict[int, SpatialRegion]:
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


def gather_user_permissions(cursor: psycopg.Cursor) -> dict[int, UserPermission]:
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


def gather_group_permissions(cursor: psycopg.Cursor) -> dict[int, GroupPermission]:
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


def gather_resources(
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
            keywords=raw_related_keywords.get(resource_id, []),
            thesaurus_keywords=raw_thesaurus_keywords.get(resource_id, []),
            spatial_regions=raw_related_regions.get(resource_id, []),
            restriction_code_type=restriction_code_types[record[12]],
            constraints_other=record[13],
            license=licenses[record[14]],
            language=record[15],
            category=topic_categories[record[16]],
            spatial_representation_type=spatial_representation_types[record[17]],
            temporal_extent_start=record[18],
            temporal_extent_end=record[19],
            supplemental_information=record[20],
            data_quality_statement=record[21],
            group=groups[record[22]],
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
            user_permissions=raw_related_user_permissions.get(resource_id, []),
            group_permissions=raw_related_group_permissions.get(resource_id, []),
        )
    return result


def gather_map_details(
        cursor: psycopg.Cursor,
        resources: dict[int, GeonodeResource],
) -> dict[int, GeonodeMap]:
    cursor.execute(
        "SELECT "
        "m.resourcebase_ptr_id, "
        "FROM maps_map AS m;"
    )
    result = {}
    for record in cursor:
        map_id = record[0]
        result[map_id] = GeonodeMap(

        )


def main(db_config: DbConfig):
    with psycopg.connect(db_config.connection_string) as conn:
        with conn.cursor() as cursor:
            map_owners = gather_map_owners(cursor)
            restriction_code_types = gather_restriction_code_types(cursor)


if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)
    db_config = DbConfig.from_env()
    main(db_config)