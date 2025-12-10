import path from 'path'

import dayjs from 'dayjs'
import logger from 'node-color-log'

import type { CategoriesKeysMap } from '../categories/types'
import { dumpJson, dumpMd, readFile, readJson } from '../lib/fs-client'
import v4Client from '../lib/v4-client'
import type { CreationStateMap as UsersCreationStateMap } from '../users/types'

import type { CreationState, CreationStateMap, V3Document } from './types'

const BATCH_SIZE = 500
const BATCH_NUMBER = 1

type Group = { group: { pk: number }; slug: string }

const uploadDoc = async (document: V3Document): Promise<string> => {
  const doc = await readFile(document.docPath) as Blob

  const formdata = new FormData()
  formdata.append('doc_file', doc, path.basename(document.docPath))
  formdata.append('title', document.title)

  const res = await v4Client.sendForm<{ success: boolean; url: string }>('documents/upload?no__redirect=true', formdata)
  if (!res.success) {
    throw new Error('Error uploading document')
  }

  return res.url.split('/').pop() as string
}

const applyMetadata = async (
  id: string,
  document: V3Document,
  categoriesKeysMap: CategoriesKeysMap,
  usersCreationStateMap: UsersCreationStateMap,
  groups: Group[]
) => {
  const middlewareToken = await v4Client.getMiddlewareToken(`/documents/${id}/metadata_advanced`)

  const urlencoded = new URLSearchParams()

  urlencoded.append('csrfmiddlewaretoken', middlewareToken)
  urlencoded.append('resource-title', document.title)
  urlencoded.append('resource-abstract', document.abstract)
  urlencoded.append('resource-date', document.publicationDate)
  urlencoded.append('resource-date_type', 'publication')

  const userData = Object
    .entries(usersCreationStateMap)
    .find(([_, val]) => val.oldPk === document.owner)

  if (!userData) { throw new Error(`Owner "${document.owner}" data not found`) }

  urlencoded.append('resource-owner', userData[1].newPk)
  urlencoded.append('resource-metadata_author', userData[0])
  urlencoded.append('resource-poc', userData[0])

  document.regions.forEach((region) => {
    let code
    switch (region) {
      case 'Europe': code = 5; break
      case 'Global': code = 1; break
      case 'Italy': code = 121; break
      default: throw new Error(`Unrecognized region ${region}`)
    }

    urlencoded.append('resource-regions', code.toString())
  })

  if (document.category !== null) {
    const categoryKey = categoriesKeysMap[document.category]
    if (!categoryKey) { throw new Error(`New key not found for category ${document.category}`) }
    urlencoded.append('category_choice_field', categoryKey)
  }

  if (document.group !== null) {
    const groupKey = groups.find(({ slug }) => slug === document.group)?.group.pk.toString()
    if (!groupKey) { throw new Error(`Key not found for group ${document.group}`) }
    urlencoded.append('resource-group', groupKey)
  }

  urlencoded.append('resource-purpose', '')
  urlencoded.append('resource-alternate', '')
  urlencoded.append('resource-edition', '')
  urlencoded.append('resource-attribution', '')
  urlencoded.append('resource-doi', '')
  urlencoded.append('resource-maintenance_frequency', '')
  urlencoded.append('resource-restriction_code_type', '')
  urlencoded.append('resource-constraints_other', '')
  urlencoded.append('resource-license', '1')
  urlencoded.append('resource-language', 'eng')
  urlencoded.append('resource-spatial_representation_type', '')
  urlencoded.append('resource-temporal_extent_start', '')
  urlencoded.append('resource-temporal_extent_end', '')
  urlencoded.append('resource-supplemental_information', '<p>No information provided</p>')
  urlencoded.append('resource-data_quality_statement', '')
  urlencoded.append('resource-is_published', 'on')
  urlencoded.append('resource-is_approved', 'on')
  urlencoded.append('resource-advertised', 'on')
  urlencoded.append('resource-sourcetype', 'LOCAL')
  urlencoded.append('resource-remote_typename', '')
  urlencoded.append('resource-resource_type', 'document')
  urlencoded.append('resource-ptype', '')
  urlencoded.append('resource-extra_metadata', '')
  urlencoded.append('poc-first_name', '')
  urlencoded.append('poc-last_name', '')
  urlencoded.append('poc-email', '')
  urlencoded.append('poc-organization', '')
  urlencoded.append('poc-profile', '')
  urlencoded.append('poc-position', '')
  urlencoded.append('poc-voice', '')
  urlencoded.append('poc-fax', '')
  urlencoded.append('poc-delivery', '')
  urlencoded.append('poc-city', '')
  urlencoded.append('poc-area', '')
  urlencoded.append('poc-zipcode', '')
  urlencoded.append('poc-country', '')
  urlencoded.append('poc-keywords', '')
  urlencoded.append('poc-timezone', '')
  urlencoded.append('metadata_author-first_name', '')
  urlencoded.append('metadata_author-last_name', '')
  urlencoded.append('metadata_author-email', '')
  urlencoded.append('metadata_author-organization', '')
  urlencoded.append('metadata_author-profile', '')
  urlencoded.append('metadata_author-position', '')
  urlencoded.append('metadata_author-voice', '')
  urlencoded.append('metadata_author-fax', '')
  urlencoded.append('metadata_author-delivery', '')
  urlencoded.append('metadata_author-city', '')
  urlencoded.append('metadata_author-area', '')
  urlencoded.append('metadata_author-zipcode', '')
  urlencoded.append('metadata_author-country', '')
  urlencoded.append('metadata_author-keywords', '')
  urlencoded.append('metadata_author-timezone', '')

  await v4Client.sendUrlEncodedForm(`/documents/${id}/metadata`, urlencoded)
}

const createDocuments = async () => {
  logger.info('Creating documents...\n')

  const startIdx = BATCH_SIZE * (BATCH_NUMBER - 1)
  const endIdx = startIdx + BATCH_SIZE

  let creationStateMap: CreationStateMap = {}
  try {
    creationStateMap = await readJson<CreationStateMap>('documents/creation-state')
  } catch {
    logger.warn('No existing creation state')
  }

  const documents = await readJson<V3Document[]>('documents/data')
  const categoriesKeysMap = await readJson<CategoriesKeysMap>('categories/keys-map')
  const usersCreationStateMap = await readJson<UsersCreationStateMap>('users/creation-state')
  const groups = await v4Client.getJson<{ group_profiles: Group[] }>('/api/v2/groups?page_size=200')


  const reportPath = `documents/create-report/${dayjs().format('YYYY-MM-DD HH:mm:ss')}`

  let processesCount = 0
  let alreadyCreatedCount = 0
  let newlyCreatedCount = 0

  let successReport = `## Success\n`

  let errorReport = `## Error`
  let errorCount = 0

  const dumpResults = async () => {
    await dumpJson('documents/creation-state', creationStateMap)

    const report = `# Created documents

Documents to be created: ${BATCH_SIZE} (from idx ${startIdx + 1} to idx ${endIdx})

Processed documents: ${processesCount}
Created documents: ${Object.keys(creationStateMap).length}
Already created documents: ${alreadyCreatedCount}
Newly created documents: ${newlyCreatedCount}
Not created: ${errorCount}

${successReport}

${errorReport}
`

    await dumpMd(reportPath, report)
  }


  for (const [idx, document] of documents.entries()) {
    if (idx < startIdx || idx >= endIdx) { continue }

    logger.log(`\nProcessing ${idx + 1}/${documents.length} - [${document.id}] ${document.title}`)

    processesCount += 1

    const creationState: CreationState = creationStateMap[document.id] ?? { lastCompletedStep: null, newId: '', title: document.title }
    creationStateMap[document.id] = creationState

    if (creationState.lastCompletedStep === 'apply-metadata') {
      logger.log('Already created, skipping...')

      alreadyCreatedCount += 1
      await dumpResults()

      continue
    }


    /* Create document */
    if (creationState.lastCompletedStep === null) {
      try {
        logger.log('Creating document...')

        const newid = await uploadDoc(document)
        logger.dim().color('green').log(`Document create, new id is ${newid}`)

        creationState.newId = newid
        creationState.lastCompletedStep = 'upload'

        await dumpResults()
      } catch (err) {
        logger.warn('Error creating document')

        errorReport += `\n\n### [${document.id}] ${document.title}\n\nCreating: ${err as string}`
        errorCount += 1

        await dumpResults()

        continue
      }
    } else {
      logger.log('Document already created, skipping...')
    }


    /* Apply metadata */
    if (creationState.lastCompletedStep === 'upload') {
      try {
        logger.log('Applying metadata...')

        await applyMetadata(creationState.newId, document, categoriesKeysMap, usersCreationStateMap, groups.group_profiles)
        logger.dim().color('green').log('Metadata applied')

        creationState.lastCompletedStep = 'apply-metadata'

        await dumpResults()
      } catch (err) {
        logger.warn('Error applying metadata')

        errorReport += `\n\n### [${document.id}] ${document.title}\n\nApplying metadata: ${err as string}`
        errorCount += 1

        await dumpResults()

        continue
      }
    } else {
      logger.log('Metadata already applied, skipping...')
    }

    successReport += `\n- [${document.id}] ${document.title}`
    newlyCreatedCount += 1

    await dumpResults()
  }

  logger.log('\n')
  logger.success('Created documents')
}

export default createDocuments
