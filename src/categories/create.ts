import dayjs from 'dayjs'
import jsdom from 'jsdom'
import logger from 'node-color-log'

import { dumpJson, dumpMd, readJson } from '../lib/fs-client'
import v4Client from '../lib/v4-client'

import { parseCategoriesTable } from './download'
import type { CategoriesKeysMap, Category } from './types'

const downloadV4Categories = async () => {
  const htmlText = await v4Client.getText('/it-it/admin/base/topiccategory/')
  const htmlDoc = new jsdom.JSDOM(htmlText)

  return parseCategoriesTable(htmlDoc)
}

const createCategory = async (category: Category) => {
  const middlewareToken = await v4Client.getMiddlewareToken('/it-it/admin/base/topiccategory/add/')

  const urlencoded = new URLSearchParams()
  urlencoded.append('csrfmiddlewaretoken', middlewareToken)
  urlencoded.append('identifier', category.id)
  urlencoded.append('description_en', category.description)
  urlencoded.append('gn_description_en', category.gnDescription)
  urlencoded.append('is_choice', 'on')
  urlencoded.append('fa_class', category.icon)
  urlencoded.append('_save', 'Salva')

  await v4Client.sendUrlEncodedForm('/it-it/admin/base/topiccategory/add/', urlencoded)
}

const patchCategory = async (v4Category: Category, v3Category: Category) => {
  const middlewareToken = await v4Client.getMiddlewareToken(`/it-it/admin/base/topiccategory/${v4Category.pk}/change/`)

  const urlencoded = new URLSearchParams()
  urlencoded.append('csrfmiddlewaretoken', middlewareToken)
  urlencoded.append('identifier', v3Category.id)
  urlencoded.append('description_en', v3Category.description)
  urlencoded.append('gn_description_en', v3Category.gnDescription)
  urlencoded.append('is_choice', 'on')
  urlencoded.append('fa_class', v3Category.icon)
  urlencoded.append('_save', 'Salva')

  await v4Client.sendUrlEncodedForm(`/it-it/admin/base/topiccategory/${v4Category.pk}/change/`, urlencoded)
}

const createCategories = async () => {
  logger.info('Creating categories...')

  const v3Categories = await readJson<Category[]>('categories/data')
  const v4Categories = await downloadV4Categories()

  let createCount = 0
  let patchCount = 0

  let errorReport = `## Error`
  let errorCount = 0

  for (const [idx, v3Category] of v3Categories.entries()) {
    logger.log(`Processing ${idx + 1}/${v3Categories.length} - ${v3Category.id}`)

    const v4Category = v4Categories.find(({ id }) => v3Category.id === id)

    if (v4Category !== undefined) {
      logger.log('Patching...')

      try {
        await patchCategory(v4Category, v3Category)
        patchCount += 1
      } catch (err) {
        errorReport += `\n\n### ${v3Category.id}\n\nError patching category\n${err as string}`
        errorCount += 1
      }

      continue
    }

    logger.log('Creating...')

    try {
      await createCategory(v3Category)
      createCount += 1
    } catch (err) {
      errorReport += `\n\n### ${v3Category.id}\n\nError creating category\n${err as string}`
      errorCount += 1
      continue
    }
  }

  try {
    const keysMap: CategoriesKeysMap = {}

    const newV4Categories = await downloadV4Categories()
    for (const v3Category of v3Categories) {
      const v4Category = newV4Categories.find(({ id }) => v3Category.id === id)
      if (!v4Category) { continue }

      keysMap[v3Category.pk] = v4Category.pk
    }

    await dumpJson('categories/keys-map', keysMap)
  } catch (err) {
    errorReport += `\n\n---\n\nError creating keys map\n${err as string}`
  }

  const report = `# Created categories

Created: ${createCount}
Patched: ${patchCount}
Errors: ${errorCount}

${errorReport}
`

  await dumpMd(`categories/create-report/${dayjs().format('YYYY-MM-DD HH:mm:ss')}`, report)
}

export default createCategories
