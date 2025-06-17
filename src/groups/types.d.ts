export type GroupsResponse = {
  meta: { total_count: number }
  objects: Array<{
    group_profile: {
      access: 'private' | 'public'
      categories: string[]
      created: string
      description: string
      description_en: string
      detail_url: string
      email: string | null
      id: number
      last_modified: string
      logo: string
      logo_url: string
      manager_count: number
      member_count: number
      resource_uri: string
      slug: string
      title: string
      title_en: string
    }
    id: number
    name: string
    resource_counts: Record<string, unknown>
    resource_uri: string
  }>
}

export type GroupsV2Response = {
  group_profiles: Array<{
    access: 'public' | 'private'
    categories: string[]
    description: string
    email: number | null
    group: { name: string; pk: number }
    keywords: string[]
    link: string
    logo: string | null
    pk: number
    slug: string
    title: string
  }>
  total: number
}

export type V3Group = {
  access: 'public' | 'private'
  description: string | null
  email: string | null
  keywords: string | null
  logo: string | null
  managers: string[]
  members: string[]
  slug: string
  title: string
}

export type PostGroupPayload = {
  access: 'public' | 'private'
  action: 'create'
  csrfmiddlewaretoken: string
  description: string | null
  email: string | null
  keywords: string | null
  title: string
}


export type DownloadState = string[]

export type CreationStep = 'create' | 'add-managers' | 'add-members'

export type CreationState = {
  lastCompletedStep: CreationStep | null
  name: string
}

export type CreationStateMap = Record<string, CreationState>
