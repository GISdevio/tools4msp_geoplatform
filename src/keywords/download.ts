import dayjs from 'dayjs'
import jsdom from 'jsdom'
import logger from 'node-color-log'

import { dumpJson, dumpMd } from '../lib/fs-client'
import v3Client from '../lib/v3-client'

import type { Keyword } from './types'

const parseKeywordsList = (html: jsdom.JSDOM): string[] => {
  const ids: string[] = []

  Array
    .from(html.window.document.querySelectorAll('a[href]'))
    .forEach((anchor) => {
      const href = anchor.getAttribute('href')
      if (!href) { return }

      const match = href.match(/\/en\/admin\/base\/hierarchicalkeyword\/([\w-]+)\/change\//)
      if (!match?.at(1)) { return }

      ids.push(match.at(1)!)
    })

  return ids
}

const extractKeywordData = async (id: string): Promise<Keyword> => {
  const htmlText = await v3Client.getText(`/en/admin/base/hierarchicalkeyword/${id}/change/`)
  const htmlDoc = new jsdom.JSDOM(htmlText)

  const name = (htmlDoc.window.document.getElementById('id_name') as HTMLInputElement).value
  const slug = (htmlDoc.window.document.getElementById('id_slug') as HTMLInputElement).value

  const positionSelect = htmlDoc.window.document.getElementById('id__position') as HTMLSelectElement
  const position = (positionSelect.querySelector('option[selected]') as HTMLOptionElement).value

  const refSelect = htmlDoc.window.document.getElementById('id__ref_node_id') as HTMLSelectElement
  const relativeTo = (refSelect.querySelector('option[selected]') as HTMLOptionElement).value || null

  return {
    id,
    name,
    position,
    relativeTo,
    slug,
  }
}

const downloadKeywords = async () => {
  logger.info('Downloading keywords...')

  const pages = 3
  const keywordIds: string[] = []

  for (let page = 0; page < pages; page++) {
    const htmlText = await v3Client.getText(`/en/admin/base/hierarchicalkeyword/?p=${page}`)
    const htmlDoc = new jsdom.JSDOM(htmlText)
    keywordIds.push(...parseKeywordsList(htmlDoc))
  }

  const data: Keyword[] = []

  for (const [idx, keywordId] of keywordIds.entries()) {
    logger.log(`\nProcessing ${idx + 1}/${keywordIds.length} - ${keywordId}`)

    const keywordData = await extractKeywordData(keywordId)
    data.push(keywordData)
  }

  await dumpJson('keywords/data', data)

  const report = `# Downloaded Keywords

  Date: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}

  Processes: ${data.length}
  `

  await dumpMd('keywords/download-report', report)

  logger.success('\nDownloaded keywords')
}

export default downloadKeywords
