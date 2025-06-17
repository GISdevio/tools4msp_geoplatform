
import type { ReadableStream } from 'stream/web'

import dayjs from 'dayjs'
import logger from 'node-color-log'

import { dumpJson, dumpMd, readJson, saveFile } from '../lib/fs-client'
import v3Client from '../lib/v3-client'

import type { DocumentsResponse, DocumentResponse, V3Document, DownloadState } from './types'

const BATCH_SIZE = 50
const BATCH_NUMBER = 3

const downloadDoc = async (id: number): Promise<[string | null, string | null]> => {
  try {
    const [bin, filename] = await v3Client.getBinary(`${v3Client.baseUrl}/documents/${id}/download`)

    const filepath = `documents/download/${filename}`
    await saveFile(filepath, bin as ReadableStream | null)

    return [filepath, null]
  } catch (err) {
    const errorReport = `Error downloading doc\n${err as string}`
    return [null, errorReport]
  }
}

const downloadMeta = async (id: number): Promise<[DocumentResponse | null, string | null]> => {
  try {
    const documentRes = await v3Client.getJson<DocumentResponse>(`/api/documents/${id}`)
    return [documentRes, null]
  } catch (err) {
    const errorReport = `Error downloading metadata\n${err as string}`
    return [null, errorReport]
  }
}

const downloadDocuments = async () => {
  logger.info('Downloading documents...\n')

  const startIdx = BATCH_SIZE * (BATCH_NUMBER - 1)
  const endIdx = startIdx + BATCH_SIZE

  let downloadState: DownloadState = []
  try {
    downloadState = await readJson<DownloadState>('documents/download-state')
  } catch {
    logger.warn('No existing download state')
  }

  let data: V3Document[] = []
  try {
    data = await readJson<V3Document[]>('documents/data')
  } catch {
    logger.warn('No existing data\n')
  }

  const documentsRes = await v3Client.getJson<DocumentsResponse>('/api/documents/?page_size=1000')

  let processesCount = 0
  let successCount = 0
  let errorCount = 0
  let errorReport = `## Errors`

  const reportPath = `documents/download-report/${dayjs().format('YYYY-MM-DD HH:mm:ss')}`

  const dumpResults = async () => {
    await dumpJson('documents/data', data)
    await dumpJson('documents/download-state', downloadState)

    const report = `# Downloaded documents

Date: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}

Documents on platform: ${documentsRes.meta.total_count}
Documents to be downloaded: ${BATCH_SIZE} (from idx ${startIdx + 1} to idx ${endIdx})

Processes: ${processesCount}
Downloaded successfully: ${successCount}
Errors: ${errorCount}

${errorReport}
`

    await dumpMd(reportPath, report)
  }

  for (const [idx, document] of documentsRes.objects.entries()) {
    if (idx < startIdx || idx >= endIdx) { continue }

    logger.log(`Processing ${idx + 1}/${documentsRes.objects.length} - [${document.id}] ${document.title}`)

    processesCount += 1

    if (downloadState.includes(document.id.toString())) {
      logger.log('Already downloaded, skipping...')

      await dumpResults()

      continue
    }

    const [doc, docErrorReport] = await downloadDoc(document.id)
    if (docErrorReport) {
      errorCount += 1
      errorReport += `\n\n### ${document.title}\n${docErrorReport}`

      await dumpResults()

      continue
    }

    const [meta, metaErrorReport] = await downloadMeta(document.id)
    if (metaErrorReport) {
      errorCount += 1
      errorReport += `\n\n### ${document.title}\n${metaErrorReport}`

      await dumpResults()

      continue
    }

    data.push({
      abstract: document.abstract,
      category: meta?.category?.id.toString() ?? null,
      docPath: doc!,
      group: meta?.group?.group_profile.slug ?? null,
      id: document.id.toString(),
      owner: meta!.owner.id.toString(),
      publicationDate: document.date,
      regions: document.regions,
      title: document.title,
    })

    successCount += 1

    await dumpResults()
  }

  logger.log('\n')
  logger.success('Downloaded documents')
}

export default downloadDocuments
