export type DocumentsResponse = {
  meta: { total_count: number }
  objects: Array<{
    abstract: string
    bbox_polygon: string
    constraints_other: null
    csw_type: string
    csw_wkt_geometry: string
    data_quality_statement: null
    date: string
    date_type: string
    detail_url: string
    dirty_state: boolean
    edition: null
    id: number
    is_approved: boolean
    is_published: boolean
    keywords: string[]
    language: string
    license: number
    maintenance_frequency: null
    metadata_only: boolean
    online: boolean
    owner__username: string
    owner_name: string
    popular_count: number
    purpose: null
    rating: number
    regions: string[]
    restriction_code_type: null
    share_count: number
    site_url: string
    spatial_representation_type: null
    srid: string
    store_type: string
    supplemental_information: string
    temporal_extent_end: null
    temporal_extent_start: null
    thumbnail_url: string
    title: string
    uuid: string
  }>
}

export type DocumentResponse = {
  abstract: string
  abstract_en: string
  alternate: string | null
  attribution: null
  bbox_polygon: string
  category: { id: number } | null
  constraints_other: null
  constraints_other_en: null
  created: string
  csw_anytext: string
  csw_insert_date: string
  csw_mdsource: string
  csw_schema: string
  csw_type: string
  csw_typename: string
  csw_wkt_geometry: string
  data_quality_statement: null
  data_quality_statement_en: null
  date: string
  date_type: string
  detail_url: string
  dirty_state: boolean
  doc_file: string
  doc_type: string
  doc_url: null
  doi: null
  edition: null
  extension: string
  featured: boolean
  group: { group_profile: { slug: string } } | null
  id: number
  is_approved: boolean
  is_published: boolean
  keywords: string[]
  language: string
  last_updated: string
  ll_bbox_polygon: string
  maintenance_frequency: null
  metadata_only: boolean
  metadata_uploaded: boolean
  metadata_uploaded_preserve: boolean
  metadata_xml: string
  owner: { id: number }
  popular_count: number
  purpose: null
  purpose_en: null
  rating: number
  regions: string[]
  resource_type: string
  resource_uri: string
  share_count: number
  srid: string
  supplemental_information: string
  supplemental_information_en: string
  temporal_extent_end: null
  temporal_extent_start: null
  thumbnail_url: string
  title: string
  title_en: string
  tkeywords: string[]
  uuid: string
  was_approved: boolean
  was_published: boolean
}

export type V3Document = {
  abstract: string
  category: string | null
  docPath: string
  group: string | null
  id: string
  owner: string
  publicationDate: string
  regions: string[]
  title: string
}


export type DownloadState = string[]

export type LastCompletedStep = 'upload' | 'apply-metadata' | null

export type CreationState = {
  lastCompletedStep: LastCompletedStep
  newId: string
  title: string
}

export type CreationStateMap = Record<string, CreationState>

