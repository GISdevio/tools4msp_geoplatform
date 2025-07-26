import dayjs from 'dayjs'
import logger from 'node-color-log'

import { dumpJson, dumpMd, readJson } from '../lib/fs-client'
import v4Client from '../lib/v4-client'

import type { ThesaurusKeyword, ThesaurusKeywordLabel } from './types'

const createThesaurusKeywords = async () => {
  logger.info('Creating thesaurus keywords...')

  const v3Keywords = await readJson<ThesaurusKeyword[]>('thesauri/keywords')
  const thesauriKeysMap = await readJson<Record<string, string>>('thesauri/thesauri-key-map')

  let createCount = 0

  let errorReport = `## Error`
  let errorCount = 0

  // Calculated by manually creating an entry, and adding 1 to its id
  const idOffset = 3

  const keysMap: Record<string, string> = {}

  for (const [idx, v3Keyword] of v3Keywords.entries()) {
    logger.log(`Processing ${idx + 1}/${v3Keywords.length} - ${v3Keyword.id}`)

    try {
      const middlewareToken = await v4Client.getMiddlewareToken('en-us/admin/base/thesauruskeyword/add/')

      const urlencoded = new URLSearchParams()
      urlencoded.append('csrfmiddlewaretoken', middlewareToken)
      urlencoded.append('about', v3Keyword.about)
      urlencoded.append('alt_label', v3Keyword.altLabel)
      urlencoded.append('thesaurus', thesauriKeysMap[v3Keyword.thesaurus]!)
      urlencoded.append('image', '')
      urlencoded.append('_save', 'Save')

      await v4Client.sendUrlEncodedForm('en-us/admin/base/thesauruskeyword/add/', urlencoded)

      const newEntityId = idx + idOffset
      keysMap[v3Keyword.id] = newEntityId.toString()

      createCount += 1
    } catch (err) {
      errorReport += `\n\n### ${v3Keyword.id}\n\nError creating keyword\n${err as string}`
      errorCount += 1
      continue
    }
  }

  await dumpJson('thesauri/keywords-keys-map', keysMap)

  const report = `# Created keywords
    
Created: ${createCount}
Errors: ${errorCount}
    
${errorReport}
    `

  await dumpMd(`thesauri/create-report/keywords-${dayjs().format('YYYY-MM-DD HH:mm:ss')}`, report)
}

const createThesaurusLabels = async () => {
  logger.info('Creating thesaurus labels...')

  const v3Labels = await readJson<ThesaurusKeywordLabel[]>('thesauri/labels')
  const keywordsKeysMap = await readJson<Record<string, string>>('thesauri/keywords-keys-map')

  let createCount = 0

  let errorReport = `## Error`
  let errorCount = 0

  // Calculated by manually creating an entry, and adding 1 to its id
  const idOffset = 2

  const keysMap: Record<string, string> = {}

  for (const [idx, v3Label] of v3Labels.entries()) {
    logger.log(`Processing ${idx + 1}/${v3Labels.length} - ${v3Label.id}`)

    try {
      const middlewareToken = await v4Client.getMiddlewareToken('en-us/admin/base/thesauruskeywordlabel/add/')

      const urlencoded = new URLSearchParams()
      urlencoded.append('csrfmiddlewaretoken', middlewareToken)
      urlencoded.append('lang', v3Label.lang)
      urlencoded.append('label', v3Label.label)
      urlencoded.append('keyword', keywordsKeysMap[v3Label.keyword]!)
      urlencoded.append('_save', 'Save')

      await v4Client.sendUrlEncodedForm('en-us/admin/base/thesauruskeywordlabel/add/', urlencoded)

      const newEntityId = idx + idOffset
      keysMap[v3Label.id] = newEntityId.toString()

      createCount += 1
    } catch (err) {
      errorReport += `\n\n### ${v3Label.id}\n\nError creating keyword\n${err as string}`
      errorCount += 1
      continue
    }
  }

  await dumpJson('thesauri/labels-keys-map', keysMap)

  const report = `# Created labels
    
Created: ${createCount}
Errors: ${errorCount}
    
${errorReport}
    `

  await dumpMd(`thesauri/create-report/labels-${dayjs().format('YYYY-MM-DD HH:mm:ss')}`, report)
}

const create = async () => {
  await createThesaurusKeywords()

  console.log('\n')

  await createThesaurusLabels()
}

export default create
