import path from 'path'

import dayjs from 'dayjs'
import logger from 'node-color-log'

import { dumpJson, dumpMd, readFile, readJson } from '../lib/fs-client'
import v4Client from '../lib/v4-client'
import type { CreationStateMap as UsersCreationStateMap } from '../users/types'

import type { V3Group, PostGroupPayload, CreationStateMap, CreationState } from './types'

export const calcSlug = (title: string): string => title.replace(/\s+/g, '-').toLowerCase()

const postGroup = async (group: V3Group) => {
  const middlewareToken = await v4Client.getMiddlewareToken('groups/create/')

  const payload: PostGroupPayload = {
    access: group.access,
    action: 'create',
    csrfmiddlewaretoken: middlewareToken,
    description: group.description,
    email: group.email,
    keywords: group.keywords,
    title: group.title,
  }

  const formdata = new FormData()

  Object
    .entries(payload)
    .forEach(([key, val]) => { formdata.append(key, val ?? '') })

  if (group.logo) {
    const logo = await readFile(group.logo) as Blob
    formdata.append('logo', logo, path.basename(group.logo))
  }

  await v4Client.sendForm('groups/create/', formdata)
}

const addUsers = async (group: V3Group, type: 'members' | 'managers', usersCreationStateMap: UsersCreationStateMap) => {
  const users = group[type]
  const slug = calcSlug(group.title)

  if (users.length === 0) { return }

  const middlewareToken = await v4Client.getMiddlewareToken(`groups/group/${slug}/members/`)

  const urlencoded = new URLSearchParams()
  urlencoded.append('csrfmiddlewaretoken', middlewareToken)

  for (const username of users) {
    const pk = usersCreationStateMap[username]?.newPk
    if (!pk) { throw new Error(`User with username "${username}" not found in users creation map`) }

    urlencoded.append('user_identifiers', pk)
  }

  if (type === 'managers') { urlencoded.append('manager_role', 'on') }

  await v4Client.sendUrlEncodedForm(`groups/group/${slug}/members_add/`, urlencoded)
}

const createGroups = async () => {
  logger.info('Creating groups...\n')

  let creationStateMap: CreationStateMap = {}
  try {
    creationStateMap = await readJson<CreationStateMap>('groups/creation-state')
  } catch {
    logger.warn('No existing creation state')
  }

  const groups = await readJson<V3Group[]>('groups/data')
  const usersCreationStateMap = await readJson<UsersCreationStateMap>('users/creation-state')

  const reportPath = `groups/create-report/${dayjs().format('YYYY-MM-DD HH:mm:ss')}`

  let processesCount = 0
  let alreadyCreatedCount = 0
  let newlyCreatedCount = 0

  let successReport = `## Success\n`

  let warnReport = `## Warn`
  let warnCount = 0

  let errorReport = `## Error`
  let errorCount = 0

  const dumpResults = async () => {
    await dumpJson('groups/creation-state', creationStateMap)

    const report = `# Created groups

Groups to be processes: ${groups.length}

Processed groups: ${processesCount}
Created groups: ${Object.keys(creationStateMap).length}
Already created groups: ${alreadyCreatedCount}
Newly created groups: ${newlyCreatedCount}
Created with warning: ${warnCount}
Not created: ${errorCount}

${successReport}

${warnReport}

${errorReport}
`

    await dumpMd(reportPath, report)
  }

  for (const [idx, group] of groups.entries()) {
    logger.log(`\nProcessing ${idx + 1}/${groups.length} - ${group.slug}`)

    processesCount += 1

    const creationState: CreationState = creationStateMap[group.slug] ?? { lastCompletedStep: null, name: group.title }
    creationStateMap[group.slug] = creationState

    if (creationState.lastCompletedStep === 'add-members') {
      logger.log('Already created, skipping...')

      alreadyCreatedCount += 1
      await dumpResults()

      continue
    }


    /* Crete group */
    if (creationState.lastCompletedStep === null) {
      try {
        logger.log('Creating group...')

        await postGroup(group)
        logger.dim().color('green').log('Group created')

        creationState.lastCompletedStep = 'create'

        await dumpResults()
      } catch (err) {
        logger.warn('Error creating group')

        errorReport += `\n\n### ${group.slug}\n\nCreating: ${err as string}`
        errorCount += 1

        await dumpResults()

        continue
      }
    } else {
      logger.log('Group already created, skipping...')
    }


    /* Add managers */
    if (creationState.lastCompletedStep === 'create') {
      try {
        logger.log('Adding managers...')

        await addUsers(group, 'managers', usersCreationStateMap)
        logger.dim().color('green').log('Managers added')

        creationState.lastCompletedStep = 'add-managers'

        await dumpResults()
      } catch (err) {
        logger.warn('Error adding managers')

        warnReport += `\n\n### ${group.slug}\n\\nAdding managers: ${err as string}`
        warnCount += 1

        continue
      }
    } else {
      logger.log('Managers already added, skipping...')
    }


    /* Add members */
    if (creationState.lastCompletedStep === 'add-managers') {
      try {
        logger.log('Adding members...')

        await addUsers(group, 'members', usersCreationStateMap)

        logger.dim().color('green').log('members added')

        creationState.lastCompletedStep = 'add-members'

        await dumpResults()
      } catch (err) {
        logger.warn('Error adding members')

        warnReport += `\n\n### ${group.slug}\n\\nAdding members: ${err as string}`
        warnCount += 1

        continue
      }
    } else {
      logger.log('Members already added, skipping...')
    }

    successReport += `\n-${group.slug}`
    newlyCreatedCount += 1

    await dumpResults()
  }

  logger.log('\n')
  logger.info('Created groups')
}

export default createGroups
