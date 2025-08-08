import fs from 'fs/promises'
import path from 'path'
import type { ReadableStream } from 'stream/web'

import dayjs from 'dayjs'
import jsdom from 'jsdom'
import logger from 'node-color-log'

import { dataDirPath, dumpJson, dumpMd, isDirFull, readJson, saveFile, unzip } from '../lib/fs-client'
import v3Client from '../lib/v3-client'

import type { DownloadState, Layer, LayersResponse, V3Layer } from './types'

const BATCH_SIZE = 50
const BATCH_NUMBER = 10

type DownloadFilesResult = {
  errorReport: string | null
  filesState: V3Layer['filesState'] | null
  stylePath?: string
  warningReport: string | null
}

const adjustStyle = async (path: string): Promise<string> => {
  const styleStr = await fs.readFile(path, 'utf-8')

  const dom = new jsdom.JSDOM(styleStr, { contentType: 'text/xml' })

  const propertyNameElements = dom.window.document.querySelectorAll('PropertyName')
  if (propertyNameElements.length === 0) { return dom.serialize() }

  for (const propertyNameElement of propertyNameElements) {
    propertyNameElement.innerHTML = propertyNameElement.innerHTML.toLowerCase()
  }

  return dom.serialize()
}

const downloadFiles = async (layer: Layer): Promise<DownloadFilesResult> => {
  const warnings = new Array<string>()

  const filesPath = `vector-layers/download/${layer.id}`
  const fullPath = path.resolve(dataDirPath, filesPath)

  // await fs.rm(filesPath, { force: true, recursive: true })

  const _isDirFull = await isDirFull(fullPath)
  if (!_isDirFull) {
    if (!layer.detail_url) {
      return { errorReport: null, filesState: 'no-details', warningReport: null }
    }

    try {
      const htmlText = await v3Client.getText(layer.detail_url)
      const htmlDoc = new jsdom.JSDOM(htmlText)

      const filesAnchor = htmlDoc.window.document.getElementById('original-layer')
      const filesUrl = filesAnchor?.getAttribute('href')
      if (!filesUrl) {
        return { errorReport: null, filesState: 'no-original-files', warningReport: null }
      }

      const [filesBin] = await v3Client.getBinary(filesUrl)

      await unzip(filesPath, filesBin as ReadableStream | null)
    } catch {
      const errorReport = `Error downloading layers`
      return { errorReport, filesState: null, warningReport: null }
    }
  }

  try {
    await fs.copyFile(path.resolve(fullPath, '.metadata/iso.xml'), path.resolve(fullPath, 'iso.xml'))
    await fs.rm(path.resolve(fullPath, '.metadata'), { force: true, recursive: true })

    const sldFilePaths = fs.glob(`${fullPath}/*.sld`)

    let stylesCount = 0

    for await (const sldFilePath of sldFilePaths) {
      if (!sldFilePath.includes('_remote')) {
        await fs.rm(sldFilePath, { force: true, recursive: true })
        continue
      }

      const adjustedStyle = await adjustStyle(sldFilePath)
      await fs.writeFile(sldFilePath, adjustedStyle)
      stylesCount += 1
    }

    if (stylesCount > 1) {
      warnings.push(`The layer has ${stylesCount} styles. Only the default one will be migrated`)
    }
  } catch {
    warnings.push('Error adjusting layer style(s)')
  }

  let stylePath
  try {
    const defaultStyle = await v3Client.getJson<{ sld_url: string }>(layer.default_style)
    stylePath = `${fullPath}/${path.basename(defaultStyle.sld_url, '.sld')}_remote.sld`
  } catch {
    warnings.push('Error computing the default style')
  }

  try {
    const [bin] = await v3Client.getBinary(layer.thumbnail_url)
    const filepath = `${fullPath}/thumbnail${path.extname(layer.thumbnail_url)}`
    await saveFile(filepath, bin as ReadableStream | null)
  } catch {
    warnings.push('Error downloading thumbnail')
  }

  const warningReport = warnings.length > 0 ? warnings.join('\n') : null

  return { errorReport: null, filesState: 'ok', stylePath, warningReport }
}

const downloadVectorLayers = async () => {
  logger.info('Downloading vector layers...\n')

  const startIdx = BATCH_SIZE * (BATCH_NUMBER - 1)
  const endIdx = startIdx + BATCH_SIZE

  let downloadState: DownloadState = []
  try {
    downloadState = await readJson<DownloadState>('vector-layers/download-state')
  } catch {
    logger.warn('No existing download state')
  }

  let data: V3Layer[] = []
  try {
    data = await readJson<V3Layer[]>('vector-layers/data')
  } catch {
    logger.warn('No existing data')
  }

  // const layersRes = await v3Client.getJson<LayersResponse>('/api/layers/?limit=1000&offset=0&order_by=title&type__in=vector')
  const layersRes = await readJson<LayersResponse>('vector-layers/layers')

  let processesCount = 0
  let errorCount = 0
  let warningCount = 0

  let errorReport = `## Errors`
  let warningReport = `## Warnings`

  const reportPath = `vector-layers/download-report/${dayjs().format('YYYY-MM-DD HH:mm:ss')}`

  const dumpResults = async () => {
    await dumpJson('vector-layers/data', data)
    await dumpJson('vector-layers/download-state', downloadState)

    const report = `# Downloaded vector layers

Date: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}

Layers on platform: ${layersRes.meta.total_count}
Layers to be downloaded: ${BATCH_SIZE} (from idx ${startIdx + 1} to idx ${endIdx})

Processes: ${processesCount}
Warnings: ${warningCount}
Errors: ${errorCount}

${warningReport}

${errorReport}
`

    await dumpMd(reportPath, report)
  }

  for (const [idx, layer] of layersRes.objects.entries()) {
    if (idx < startIdx || idx >= endIdx) { continue }

    logger.log(`Processing ${idx + 1}/${layersRes.objects.length} - [${layer.id}] ${layer.title}`)

    processesCount += 1

    if (downloadState.includes(layer.id.toString())) {
      logger.log('Already downloaded, skipping...')

      await dumpResults()

      continue
    }

    const filesRes = await downloadFiles(layer)
    if (filesRes.filesState === null) {
      errorCount += 1
      errorReport += `\n\n### [${layer.id}] ${layer.title}\n\n${filesRes.errorReport}`

      await dumpResults()

      continue
    }

    if (filesRes.warningReport) {
      warningCount += 1
      warningReport += `\n\n### [${layer.id}] ${layer.title}\n\n${filesRes.warningReport}`
    }

    data.push({
      filesState: filesRes.filesState,
      id: layer.id.toString(),
      license: layer.license,
      name: layer.name,
      ownerUsername: layer.owner__username,
      stylePath: filesRes.stylePath,
      title: layer.title,
      uuid: layer.uuid,
    })

    downloadState.push(layer.id.toString())

    await dumpResults()
  }

  logger.log('\n')
  logger.success('Downloaded vector layers')
}

export default downloadVectorLayers
