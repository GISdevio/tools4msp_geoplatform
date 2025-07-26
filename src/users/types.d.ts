export type OwnersResponse = {
  meta: { total_count: number }
  objects: Array<{
    area: string | null
    city: string | null
    count: number
    country: string | null
    date_joined: string
    delivery: string | null
    email: string
    fax: string | null
    first_name: string
    full_name: string
    id: number
    language: string
    last_name: string
    organization: string | null
    position: string | null
    profile: string
    resource_uri: string
    timezone: string
    username: string
    voice: string | null
    zipcode: string | null
  }>
}

export type UsersResponse = {
  total: 170
  users: Array<{
    avatar: string
    first_name: string
    is_staff: boolean
    is_superuser: boolean
    last_name: string
    link: string
    perms?: string[]
    pk: number
    username: string
  }>
}

export type ProfilesResponse = {
  meta: { total_count: number }
  objects: Array<{ username: string }>
}

export type V3User = {
  area: string | null
  city: string | null
  country: string | null
  delivery: string | null
  email: string | undefined
  fax: string | null
  first_name: string
  is_staff: boolean
  is_superuser: boolean
  last_name: string
  organization: string | null
  password: string
  perms: string[]
  pk: string
  position: string | null
  profile: string | null
  timezone: string | null
  username: string
  voice: string | null
  zipcode: string | null
}

export type PostUserPayload = {
  email: string | undefined
  first_name: string
  is_staff: boolean
  is_superuser: boolean
  last_name: string
  perms: string[]
  username: string
}

export type PatchUserPayload = {
  area: string | null
  city: string | null
  country: string | null
  csrfmiddlewaretoken: string
  delivery: string | null
  email: string | undefined
  fax: string | null
  first_name: string
  last_name: string
  organization: string | null
  position: string | null
  profile: string | null
  timezone: string | null
  voice: string | null
  zipcode: string | null
}

export type ChangePwdPayload = {
  password: string
  username: string
}


export type DownloadState = string[]

export type CreationStep = 'create' | 'patch-metadata' | 'change-password'

export type CreationState = {
  lastCompletedStep: CreationStep | null
  newPk: string
  oldPk: string
}

export type CreationStateMap = Record<string, CreationState>
