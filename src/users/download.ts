import dayjs from 'dayjs'
import logger from 'node-color-log'

import { dumpJson, dumpMd, readJson } from '../lib/fs-client'
import v3Client from '../lib/v3-client'

import type { DownloadState, OwnersResponse, ProfilesResponse, UsersResponse, V3User } from './types'

const NEW_PWD = 'Password123'

const buildEmailsToRedact = (usersRes: UsersResponse, ownersRes: OwnersResponse): string[] => {
  const emailsCount: Record<string, number> = {}

  for (const user of usersRes.users) {
    const owner = ownersRes.objects.find(({ username }) => username === user.username)

    const email = owner?.email
    if (!email) { continue }

    emailsCount[email] = (emailsCount[email] || 0) + 1
  }

  return Object
    .entries(emailsCount)
    .reduce<string[]>((acc, [key, val]) => {
      if (val > 1) { acc.push(key) }
      return acc
    }, [])
}

const downloadUsers = async () => {
  logger.info('Downloading users...')

  let downloadState: DownloadState = []
  try {
    downloadState = await readJson<DownloadState>('users/download-state')
  } catch {
    logger.warn('No existing download state')
  }

  let data: V3User[] = []
  try {
    data = await readJson<V3User[]>('users/data')
  } catch {
    logger.warn('No existing data')
  }

  const usersRes = await v3Client.getJson<UsersResponse>('/api/v2/users/?page_size=1000')
  const profilesRes = await v3Client.getJson<ProfilesResponse>('/api/profiles/?limit=200&offset=0')
  const ownersRes = await v3Client.getJson<OwnersResponse>('/api/owners/?page_size=1000')

  const emailsToRedact = buildEmailsToRedact(usersRes, ownersRes)
  logger.dim().log('Emails to redact:', emailsToRedact)

  const changedUsers: { reason: string; username: string }[] = []
  const skippedUsers: string[] = []

  let processesCount = 0
  let alreadyDownloadedCount = 0
  let newUsersCount = 0

  const reportPath = `users/download-report/${dayjs().format('YYYY-MM-DD HH:mm:ss')}`

  const dumpResults = async () => {
    await dumpJson('users/data', data)
    await dumpJson('users/download-state', downloadState)

    const report = `# Downloaded users

Date: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}

Profiles: ${profilesRes.meta.total_count}
Users: ${usersRes.total}
Owners: ${ownersRes.meta.total_count}

Processed users: ${processesCount}
Downloaded users: ${data.length}
Already downloaded users: ${alreadyDownloadedCount}
Newly downloaded users: ${newUsersCount}
Skipped users: ${skippedUsers.length}
Changed users: ${Object.keys(changedUsers).length}

## Changed users

${
  changedUsers.length > 0
    ? changedUsers.map(({ username, reason }) => `${username}: ${reason}`).join('\n\n')
    : '-'
}

## Skipped users

- ${skippedUsers.sort().join('\n- ')}
`

    await dumpMd(reportPath, report)
  }

  for (const [idx, user] of usersRes.users.entries()) {
    logger.log(`\nProcessing ${idx + 1}/${usersRes.users.length} - ${user.username}`)

    if (downloadState.includes(user.username)) {
      logger.log('Already downloaded, skipping...')

      processesCount += 1
      alreadyDownloadedCount += 1
      await dumpResults()

      continue
    }

    if (user.username === 'admin') {
      logger.log('Skipping admin...')

      processesCount += 1
      skippedUsers.push(user.username)
      await dumpResults()

      continue
    }

    if (!profilesRes.objects.find(({ username }) => username === user.username)) {
      logger.log('User does not have a profile, skipping...')

      processesCount += 1
      skippedUsers.push(user.username)
      await dumpResults()

      continue
    }

    const owner = ownersRes.objects.find(({ username }) => username === user.username)

    let email = owner?.email || undefined

    if (!email) {
      email = `tools4msp+${Math.floor(Math.random() * 1000)}@ismar.cnr.it`
      changedUsers.push({ reason: 'Missing email', username: user.username })
    } else if (emailsToRedact.includes(email ?? '')) {
      const emailSegments = email?.split('@') as [string, string]
      email = `${emailSegments[0]}+${Math.floor(Math.random() * 1000)}@${emailSegments[1]}`
      changedUsers.push({ reason: `Email is used by multiple users`, username: user.username })
    }

    const userData: V3User = {
      area: owner?.area || null,
      city: owner?.city || null,
      country: owner?.country || null,
      delivery: owner?.delivery || null,
      email,
      fax: owner?.fax || null,
      first_name: user.first_name,
      is_staff: user.is_staff,
      is_superuser: user.is_superuser,
      last_name: user.last_name,
      organization: owner?.organization || null,
      password: NEW_PWD,
      perms: user.perms ?? [],
      pk: user.pk.toString(),
      position: owner?.position || null,
      profile: owner?.profile || null,
      timezone: owner?.timezone || null,
      username: user.username,
      voice: owner?.voice || null,
      zipcode: owner?.zipcode || null,
    }

    data.push(userData)

    processesCount += 1
    newUsersCount += 1
    downloadState.push(user.username)

    await dumpResults()
  }

  logger.success('Downloaded users')
}

export default downloadUsers
