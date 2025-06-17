import dayjs from 'dayjs'
import jsdom from 'jsdom'
import logger from 'node-color-log'

import { dumpJson, dumpMd } from '../lib/fs-client'
import v3Client from '../lib/v3-client'

import type { Category } from './types'

export const parseCategoriesTable = (html: jsdom.JSDOM): Category[] => {
  const categories: Category[] = []

  const rows = html.window.document.querySelectorAll('tbody > tr')

  for (const row of rows) {
    const cellId = row.querySelector('th.field-identifier')
    const idAncor = cellId?.querySelector('a')
    const idLink = idAncor?.getAttribute('href')
    const idLinkSegments = idLink!.split('/')

    const cellDescription = row.querySelector('td.field-description')
    const cellGnDescription = row.querySelector('td.field-gn_description')
    const cellIcon = row.querySelector('td.field-fa_class')

    categories.push({
      description: cellDescription!.textContent === ' ' ? '-' : cellDescription!.textContent!,
      gnDescription: cellGnDescription!.textContent === ' ' ? '-' : cellGnDescription!.textContent!,
      icon: cellIcon!.textContent!,
      id: idAncor!.textContent!,
      pk: idLinkSegments[idLinkSegments.length - 3]!,
    })
  }

  return categories
}

const downloadCategories = async () => {
  logger.info('Downloading categories...')

  const htmlText = await v3Client.getText('/it/admin/base/topiccategory/')
  const htmlDoc = new jsdom.JSDOM(htmlText)

  const categories = parseCategoriesTable(htmlDoc)

  await dumpJson('categories/data', categories)

  const report = `# Downloaded categories

Date: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}

Processes: ${categories.length}
`

  await dumpMd('categories/download-report', report)

  logger.success('Downloaded categories')
}

export default downloadCategories
