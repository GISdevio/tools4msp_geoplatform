import jsdom from 'jsdom'
import logger from 'node-color-log'

import { dumpJson } from '../lib/fs-client'
import v3Client from '../lib/v3-client'

import type { Thesaurus, ThesaurusKeyword, ThesaurusKeywordLabel } from './types'

const downloadThesauri = async () => {
  logger.info('Downloading thesauri...')

  const htmlText = await v3Client.getText('/en/admin/base/thesaurus/')
  const htmlDoc = new jsdom.JSDOM(htmlText)

  const editThesaurusUrls = Array
    .from(htmlDoc.window.document.querySelectorAll('.field-id > a'))
    .map((ancor) => (ancor as HTMLAnchorElement).href)

  const thesauri: Thesaurus[] = []

  for (const [idx, url] of editThesaurusUrls.entries()) {
    const id = url.match(/\/en\/admin\/base\/thesaurus\/([\w-]+)\/change\//)?.at(1) as string

    logger.log(`Processing ${idx + 1}/${editThesaurusUrls.length} - ${id}`)

    const htmlText = await v3Client.getText(url)
    const htmlDoc = new jsdom.JSDOM(htmlText)

    const identifier = (htmlDoc.window.document.getElementById('id_identifier') as HTMLInputElement).value
    const title = (htmlDoc.window.document.getElementById('id_title') as HTMLInputElement).value
    const date = (htmlDoc.window.document.getElementById('id_date') as HTMLInputElement).value
    const description = (htmlDoc.window.document.getElementById('id_description') as HTMLTextAreaElement).value
    const slug = (htmlDoc.window.document.getElementById('id_slug') as HTMLInputElement).value
    const about = (htmlDoc.window.document.getElementById('id_about') as HTMLInputElement).value
    const cardMin = (htmlDoc.window.document.getElementById('id_card_min') as HTMLInputElement).value
    const cardMax = (htmlDoc.window.document.getElementById('id_card_max') as HTMLInputElement).value
    const facet = (htmlDoc.window.document.getElementById('id_facet') as HTMLInputElement).checked
    const order = (htmlDoc.window.document.getElementById('id_order') as HTMLInputElement).value

    thesauri.push({ about, cardMax, cardMin, date, description, facet, id, identifier, order, slug, title })
  }

  await dumpJson('thesauri/thesauri', thesauri)

  logger.success('Downloaded thesauri')
}

const downloadThesaurusKeywords = async () => {
  logger.info('Downloading thesaurus keywords...')

  const editUrls: string[] = []

  const pages = 5

  for (let page = 0; page < pages; page++) {
    const htmlText = await v3Client.getText(`/en/admin/base/thesauruskeyword/?p=${page}`)
    const htmlDoc = new jsdom.JSDOM(htmlText)

    const _editUrls = Array
      .from(htmlDoc.window.document.querySelectorAll('.field-about > a'))
      .map((ancor) => (ancor as HTMLAnchorElement).href)

    editUrls.push(..._editUrls)
  }

  const keywords: ThesaurusKeyword[] = []

  for (const [idx, url] of editUrls.entries()) {
    const id = url.match(/\/en\/admin\/base\/thesauruskeyword\/([\w-]+)\/change\//)?.at(1) as string

    logger.log(`Processing ${idx + 1}/${editUrls.length} - ${id}`)

    const htmlText = await v3Client.getText(url)
    const htmlDoc = new jsdom.JSDOM(htmlText)

    const about = (htmlDoc.window.document.getElementById('id_about') as HTMLInputElement).value
    const altLabel = (htmlDoc.window.document.getElementById('id_alt_label') as HTMLInputElement).value

    const thesaurusSelect = htmlDoc.window.document.getElementById('id_thesaurus') as HTMLSelectElement
    const thesaurus = (thesaurusSelect.querySelector('option[selected]') as HTMLOptionElement).value

    keywords.push({ about, altLabel, id, thesaurus })
  }

  await dumpJson('thesauri/keywords', keywords)

  logger.success('Downloaded thesaurus keywords')
}

const downloadThesaurusKeywordLabels = async () => {
  logger.info('Downloading thesaurus keyword labels...')

  const editUrls: string[] = []

  const pages = 9

  for (let page = 0; page < pages; page++) {
    const htmlText = await v3Client.getText(`/en/admin/base/thesauruskeywordlabel/?p=${page}`)
    const htmlDoc = new jsdom.JSDOM(htmlText)

    const _editUrls = Array
      .from(htmlDoc.window.document.querySelectorAll('.field-label > a'))
      .map((ancor) => (ancor as HTMLAnchorElement).href)

    editUrls.push(..._editUrls)
  }

  const labels: ThesaurusKeywordLabel[] = []

  for (const [idx, url] of editUrls.entries()) {
    const id = url.match(/\/en\/admin\/base\/thesauruskeywordlabel\/([\w-]+)\/change\//)?.at(1) as string

    logger.log(`Processing ${idx + 1}/${editUrls.length} - ${id}`)

    const htmlText = await v3Client.getText(url)
    const htmlDoc = new jsdom.JSDOM(htmlText)

    const lang = (htmlDoc.window.document.getElementById('id_lang') as HTMLInputElement).value
    const label = (htmlDoc.window.document.getElementById('id_label') as HTMLInputElement).value

    const keywordSelect = htmlDoc.window.document.getElementById('id_keyword') as HTMLSelectElement
    const keyword = (keywordSelect.querySelector('option[selected]') as HTMLOptionElement).value

    labels.push({ id, keyword, label, lang })
  }

  await dumpJson('thesauri/labels', labels)

  logger.success('Downloaded thesaurus keyword labels')
}

const download = async () => {
  await downloadThesauri()

  logger.log('\n')

  await downloadThesaurusKeywords()

  logger.log('\n')

  await downloadThesaurusKeywordLabels()
}

export default download
