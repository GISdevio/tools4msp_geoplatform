import dayjs from 'dayjs'
import logger from 'node-color-log'

import { dumpMd, readJson } from '../lib/fs-client'
import v4Client from '../lib/v4-client'

import type { Keyword } from './types'

// type v4Keyword = { id: string; slug: string }

// const downloadV4Keywords = async (): Promise<v4Keyword[]> => {
//   const pages = 3
//   const keywordIds: string[] = []

//   for (let page = 1; page <= pages; page++) {
//     const htmlText = await v4Client.getText(`/en-us/admin/base/hierarchicalkeyword/?p=${page}`)
//     const htmlDoc = new jsdom.JSDOM(htmlText)

//     Array
//       .from(htmlDoc.window.document.querySelectorAll('a[href]'))
//       .forEach((anchor) => {
//         const href = anchor.getAttribute('href')
//         if (!href) { return }

//         const match = href.match(/\/en-us\/admin\/base\/hierarchicalkeyword\/([\w-]+)\/change\//)
//         if (!match?.at(1)) { return }

//         keywordIds.push(match.at(1)!)
//       })
//   }

//   // await dumpJson('keywords/v4-ids', keywordIds)

//   const data: v4Keyword[] = []

//   for (const [idx, keywordId] of keywordIds.entries()) {
//     logger.log(`Processing ${idx + 1}/${keywordIds.length} - ${keywordId}`)

//     const htmlText = await v4Client.getText(`/en-us/admin/base/hierarchicalkeyword/${keywordId}/change/`)
//     const htmlDoc = new jsdom.JSDOM(htmlText)

//     const slug = (htmlDoc.window.document.getElementById('id_slug') as HTMLInputElement).value

//     data.push({ id: keywordId, slug })
//   }

//   // await dumpJson('keywords/v4', data)

//   return data
// }

// const buildKeysMap = async () => {
//   logger.log('\nBuilding keys map')

//   const keysMap: Record<string, string> = {}

//   const v3Keywords = await readJson<Keyword[]>('keywords/data')
//   const v4Keywords = await downloadV4Keywords()

//   for (const v3Keyword of v3Keywords) {
//     const v4Keyword = v4Keywords.find(({ slug }) => slug === v3Keyword.slug)
//     if (!v4Keyword) { continue }

//     keysMap[v3Keyword.id] = v4Keyword.id

//     await dumpJson('keywords/keys-map', keysMap)
//   }
// }

// const createKeyword = async (v3Keyword: Keyword) => {
//   const middlewareToken = await v4Client.getMiddlewareToken('en-us/admin/base/hierarchicalkeyword/add/')

//   const urlencoded = new URLSearchParams()
//   urlencoded.append('csrfmiddlewaretoken', middlewareToken)
//   urlencoded.append('name', v3Keyword.name)
//   urlencoded.append('slug', v3Keyword.slug)
//   urlencoded.append('_position', v3Keyword.position)
//   urlencoded.append('_ref_node_id', v3Keyword.relativeTo === null ? '' : v3Keyword.relativeTo)
//   urlencoded.append('_save', 'Save')

//   await v4Client.sendUrlEncodedForm('en-us/admin/base/hierarchicalkeyword/add/', urlencoded)
// }

const createKeywords = async () => {
  logger.info('Creating keywords...')

  const v3Keywords = await readJson<Keyword[]>('keywords/data')

  let createCount = 0

  let errorReport = `## Error`
  let errorCount = 0

  // Calculated by manually creating an entry, and adding 1 to its id
  const idOffset = 2

  const keysMap: Record<string, string> = {}

  for (const [idx, v3Keyword] of v3Keywords.entries()) {
    logger.log(`Processing ${idx + 1}/${v3Keywords.length} - ${v3Keyword.id}`)

    try {
      let relativeTo = ''
      if (v3Keyword.relativeTo !== null) {
        relativeTo = keysMap[v3Keyword.relativeTo] ?? ''
      }

      const middlewareToken = await v4Client.getMiddlewareToken('en-us/admin/base/hierarchicalkeyword/add/')

      const urlencoded = new URLSearchParams()
      urlencoded.append('csrfmiddlewaretoken', middlewareToken)
      urlencoded.append('name', v3Keyword.name)
      urlencoded.append('slug', v3Keyword.slug)
      urlencoded.append('_position', v3Keyword.position)
      urlencoded.append('_ref_node_id', relativeTo)
      urlencoded.append('_save', 'Save')

      await v4Client.sendUrlEncodedForm('en-us/admin/base/hierarchicalkeyword/add/', urlencoded)

      const newEntityId = idx + idOffset
      keysMap[v3Keyword.id] = newEntityId.toString()

      createCount += 1
    } catch (err) {
      errorReport += `\n\n### ${v3Keyword.id}\n\nError creating keyword\n${err as string}`
      errorCount += 1
      continue
    }
  }

  // try {
  //   await buildKeysMap()
  // } catch (err) {
  //   logger.error('Error creating keys map', err)
  //   errorReport += `\n\n---\n\nError creating keys map\n${err as string}`
  // }

  const report = `# Created keywords
  
Created: ${createCount}
Errors: ${errorCount}
  
${errorReport}
`

  await dumpMd(`keywords/create-report/${dayjs().format('YYYY-MM-DD HH:mm:ss')}`, report)
}

export default createKeywords
