import dayjs from 'dayjs'
import logger from 'node-color-log'

import { dumpJson, dumpMd, readJson } from '../lib/fs-client'
import v4Client from '../lib/v4-client'

import type { CreationState, CreationStateMap, PatchUserPayload, PostUserPayload, V3User } from './types'

const postUser = async (data: V3User): Promise<string> => {
  const postPayload: PostUserPayload = {
    email: data.email,
    first_name: data.first_name,
    is_staff: data.is_staff,
    is_superuser: data.is_superuser,
    last_name: data.last_name,
    perms: data.perms,
    username: data.username,
  }

  const { user: { pk: newPk } } = await v4Client.sendJson<{ user: { pk: number } }>('/api/v2/users', postPayload)

  return newPk.toString()
}

const patchUser = async (data: V3User) => {
  const token = await v4Client.getMiddlewareToken(`/people/profile/${data.username}/`)

  const payload: PatchUserPayload = {
    area: data.area,
    city: data.city,
    country: data.country,
    csrfmiddlewaretoken: token,
    delivery: data.delivery,
    email: data.email,
    fax: data.fax,
    first_name: data.first_name,
    last_name: data.last_name,
    organization: data.organization,
    position: data.position,
    profile: data.profile,
    timezone: data.timezone,
    voice: data.voice,
    zipcode: data.zipcode,
  }

  const formdata = new FormData()

  Object
    .entries(payload)
    .forEach(([key, val]) => { formdata.append(key, val ?? '') })

  await v4Client.sendForm(`/people/edit/${data.username}`, formdata)
}

const changePwd = async (data: V3User, newkey: string) => {
  // const payload: ChangePwdPayload = { password: user.password, username: user.username }
  // await v4Client.sendJson('/api/v2/extra/admin-set-user-password/', payload)

  const middlewareToken = await v4Client.getMiddlewareToken(`/en-us/admin/people/profile/${newkey}/password/`)

  const urlencoded = new URLSearchParams()
  urlencoded.append('csrfmiddlewaretoken', middlewareToken)
  urlencoded.append('password1', data.password)
  urlencoded.append('password2', data.password)

  await v4Client.sendUrlEncodedForm(`/en-us/admin/people/profile/${newkey}/password/`, urlencoded)
}

const createUsers = async () => {
  logger.info('Creating users...\n')

  let creationStateMap: CreationStateMap = {}
  try {
    creationStateMap = await readJson<CreationStateMap>('users/creation-state')
  } catch {
    logger.warn('No existing creation state')
  }

  const users = await readJson<V3User[]>('users/data')

  const reportPath = `users/create-report/${dayjs().format('YYYY-MM-DD HH:mm:ss')}`

  let processesCount = 0
  let alreadyCreatedCount = 0
  let newlyCreatedCount = 0

  let successReport = `## Success\n`

  let warnReport = `## Warn`
  let warnCount = 0

  let errorReport = `## Error`
  let errorCount = 0

  const dumpResults = async () => {
    await dumpJson('users/creation-state', creationStateMap)

    const report = `# Created users

Users to be processes: ${users.length}

Processed users: ${processesCount}
Created users: ${Object.keys(creationStateMap).length}
Already created users: ${alreadyCreatedCount}
Newly created users: ${newlyCreatedCount}
Created with warning: ${warnCount}
Not created: ${errorCount}

${successReport}

${warnReport}

${errorReport}
`

    await dumpMd(reportPath, report)
  }

  for (const [idx, user] of users.entries()) {
    logger.log(`\nProcessing ${idx + 1}/${users.length} - ${user.username}`)

    processesCount += 1

    const creationState: CreationState = creationStateMap[user.username] ?? { lastCompletedStep: null, newPk: '', oldPk: user.pk }
    creationStateMap[user.username] = creationState

    if (creationState.lastCompletedStep === 'change-password') {
      logger.log('Already created, skipping...')

      alreadyCreatedCount += 1
      await dumpResults()

      continue
    }


    /* Create user */
    if (creationState.lastCompletedStep === null) {
      try {
        logger.log('Creating user...')

        const newKey = await postUser(user)
        logger.dim().color('green').log(`User create, new pk is ${newKey}`)

        creationState.newPk = newKey
        creationState.lastCompletedStep = 'create'

        await dumpResults()
      } catch (err) {
        logger.warn('Error creating user')

        errorReport += `\n\n### ${user.username}\n\nCreating: ${err as string}`
        errorCount += 1

        await dumpResults()

        continue
      }
    } else {
      logger.log('User already created, skipping...')
    }


    /* Patch user metadata */
    if (creationState.lastCompletedStep === 'create') {
      try {
        logger.log('Patching metadata...')

        await patchUser(user)
        logger.dim().color('green').log('Metadata patched')

        creationState.lastCompletedStep = 'patch-metadata'

        await dumpResults()
      } catch (err) {
        logger.warn('Error patching metadata')

        warnReport += `\n\n### ${user.username}\n\nPatch metadata: ${err as string}`
        warnCount += 1

        continue
      }
    } else {
      logger.log('User metadata already patched, skipping...')
    }


    /* Change password */
    if (creationState.lastCompletedStep === 'patch-metadata') {
      try {
        logger.log('Changing password...')

        await changePwd(user, creationState.newPk)
        logger.dim().color('green').log('Password changed')

        creationState.lastCompletedStep = 'change-password'

        await dumpResults()
      } catch (err) {
        logger.warn('Error changing password')

        warnReport += `\n\n### ${user.username}\n\nChange password: ${err as string}`
        warnCount += 1

        await dumpResults()

        continue
      }
    } else {
      logger.log('User password already changed, skipping...')
    }

    successReport += `\n- ${user.username}`
    newlyCreatedCount += 1

    await dumpResults()
  }

  logger.info('\nCreated users')
}

export default createUsers
