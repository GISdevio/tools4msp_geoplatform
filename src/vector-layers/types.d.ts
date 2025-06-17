export type Layer = {
  default_style: string
  detail_url: string | null
  id: number
  license: string | null
  name: string
  owner__username: string
  thumbnail_url: string
  title: string
  uuid: string
}

export type LayersResponse = {
  meta: { total_count: number }
  objects: Layer[]
}

export type V3Layer = {
  filesState: 'ok' | 'no-details' | 'no-original-files'
  id: string
  license: string | null
  name: string
  ownerUsername: string
  stylePath?: string
  title: string
  uuid: string
}

export type DownloadState = string[]

export type LastCompletedStep = 'upload-dataset' | 'upload-style' | 'upload-metadata' | 'patch-metadata' | 'upload-thumbnail' | null

export type CreationState = {
  datasetTitle: string
  lastCompletedStep: LastCompletedStep
  newId: string
}

export type CreationStateMap = Record<string, CreationState>
