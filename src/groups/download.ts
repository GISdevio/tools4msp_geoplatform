import path from 'path'
import type { ReadableStream } from 'stream/web'

import dayjs from 'dayjs'
import jsdom from 'jsdom'
import logger from 'node-color-log'

import { dumpJson, dumpMd, readJson, saveFile } from '../lib/fs-client'
import v3Client from '../lib/v3-client'
import type { CreationStateMap } from '../users/types'

import type { DownloadState, GroupsResponse, GroupsV2Response, V3Group } from './types'

const downloadLogo = async (slug: string, logo?: string | null): Promise<[string | null, string | null]> => {
  if (!logo) { return [null, null] }

  try {
    const [bin] = await v3Client.getBinary(logo)

    const filePath = `groups/download/${slug}${path.extname(logo)}`

    await saveFile(filePath, bin as ReadableStream | null)

    return [filePath, null]
  } catch (err) {
    const errorReport = `Error downloading logo\n${err as string}`
    return [null, errorReport]
  }
}

const downloadManagers = async (slug: string, usersCreationStateMap: CreationStateMap): Promise<[string[], string | null]> => {
  const keys: string[] = []
  let errorReport = ''

  try {
    const htmlText = await v3Client.getText(`groups/group/${slug}/?limit=200&offset=0`)
    const htmlDoc = new jsdom.JSDOM(htmlText)

    const sections = htmlDoc.window.document.querySelectorAll('section.last')

    sections.values().forEach((element) => {
      const anchors = element.querySelectorAll('a')

      const username = anchors?.[1]?.innerHTML
      if (!username) { return }

      const newPk = usersCreationStateMap[username]?.newPk
      if (!newPk) {
        errorReport += `\n\nManager ${username} not found in users`
        return
      }

      keys.push(newPk)
    })

    return [keys, errorReport || null]
  } catch (err) {
    errorReport = `Error downloading managers\n${err as string}`
    return [[], errorReport]
  }
}

const downloadMembers = async (slug: string, usersCreationStateMap: CreationStateMap): Promise<[string[], string | null]> => {
  type ProfilesRes = { objects: Array<{ id: number; username: string }> }

  const keys: string[] = []
  let errorReport = ''

  try {
    const profilesRes = await v3Client.getJson<ProfilesRes>(`/api/profiles/?group=${slug}&limit=200&offset=0`)

    profilesRes.objects.forEach(({ id, username }) => {
      const newKey = usersCreationStateMap[username]?.newPk

      if (newKey) {
        keys.push(newKey)
        return
      }

      errorReport += `\n\nMember ${username} with v3 key ${id} not found`
    })

    return [keys, errorReport || null]
  } catch (err) {
    errorReport = `Error downloading members\n${err as string}`
    return [[], errorReport]
  }
}

const downloadGroups = async () => {
  logger.info('Downloading groups...\n')

  let downloadState: DownloadState = []
  try {
    downloadState = await readJson<DownloadState>('groups/download-state')
  } catch {
    logger.warn('No existing download state')
  }

  let data: V3Group[] = []
  try {
    data = await readJson<V3Group[]>('groups/data')
  } catch {
    logger.warn('No existing data')
  }

  const groupsRes = await v3Client.getJson<GroupsResponse>('/api/groups/?page_size=1000')
  const groupsV2Res = await v3Client.getJson<GroupsV2Response>('/api/v2/groups/?page_size=1000')

  const usersCreationStateMap = await readJson<CreationStateMap>('users/creation-state')

  let processesCount = 0
  let alreadyDownloadedCount = 0
  let newGroupsCount = 0

  let errorCount = 0
  let errorReport = `## Errors`

  const reportPath = `groups/download-report/${dayjs().format('YYYY-MM-DD HH:mm:ss')}`

  const dumpResults = async () => {
    await dumpJson('groups/data', data)
    await dumpJson('groups/download-state', downloadState)

    const report = `# Downloaded groups

Date: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}

Groups: ${groupsRes.meta.total_count}
Groups v2: ${groupsV2Res.total}

Processed groups: ${processesCount}
Downloaded groups: ${data.length}
Already downloaded groups: ${alreadyDownloadedCount}
Newly downloaded groups: ${newGroupsCount}
Errors: ${errorCount}

${errorReport}
`

    await dumpMd(reportPath, report)
  }

  for (const [idx, group] of groupsRes.objects.entries()) {
    logger.log(`\nProcessing ${idx + 1}/${groupsRes.objects.length} - ${group.group_profile.slug}`)

    if (downloadState.includes(group.group_profile.slug)) {
      logger.log('Already downloaded, skipping...')

      processesCount += 1
      alreadyDownloadedCount += 1
      await dumpResults()

      continue
    }

    if (group.name === 'registered-members') {
      logger.log('Skipping registered-members...')

      processesCount += 1
      await dumpResults()

      continue
    }

    const groupV2 = groupsV2Res.group_profiles.find(({ pk }) => pk === group.group_profile.id)

    const groupData: V3Group = {
      access: group.group_profile.access,
      description: group.group_profile.description,
      email: group.group_profile.email,
      keywords: groupV2?.keywords.join(',') ?? null,
      logo: null,
      managers: [],
      members: [],
      slug: group.group_profile.slug,
      title: group.group_profile.title,
    }

    let hasError = false
    let _errorReport = `\n### ${group.group_profile.title}`

    const [logo, logoErrorReport] = await downloadLogo(group.group_profile.slug, groupV2?.logo)
    groupData.logo = logo
    if (logoErrorReport) {
      hasError = true
      _errorReport += `\n${logoErrorReport}`
    }

    const [managers, managersErrorReport] = await downloadManagers(group.group_profile.slug, usersCreationStateMap)
    groupData.managers = managers
    if (managersErrorReport) {
      hasError = true
      _errorReport += `\n${managersErrorReport}`
    }

    const [members, membersErrorReport] = await downloadMembers(group.group_profile.slug, usersCreationStateMap)
    groupData.members = members
    if (membersErrorReport) {
      hasError = true
      _errorReport += `\n${membersErrorReport}`
    }

    if (hasError) {
      errorCount += 1
      errorReport += `\n${_errorReport}`
    } else {
      newGroupsCount += 1
    }

    data.push(groupData)

    processesCount += 1

    downloadState.push(groupData.slug)

    await dumpResults()
  }

  logger.success('\nDownloaded groups')
}

export default downloadGroups
