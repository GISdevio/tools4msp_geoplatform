import path from 'path'

import dayjs from 'dayjs'
import { globSync } from 'glob'
import logger from 'node-color-log'

import { dataDirPath, dumpJson, dumpMd, readFile, readFileAsBase64, readJson } from '../lib/fs-client'
import v4Client from '../lib/v4-client'

import type { CreationState, CreationStateMap, V3Layer } from './types'

const BATCH_SIZE = 50
const BATCH_NUMBER = 4

const waitForUpload = async <R>(url: string): Promise<R> => {
  const maxIterations = 10
  let iterations = 0

  while (true) {
    iterations += 1

    const res = await v4Client.getJson<{ request: { status: 'running' | 'finished' | 'failed' } }>(url)

    if (res.request.status === 'finished') { return res as R }

    if (res.request.status === 'failed') { throw new Error('Upload failed') }

    if (iterations > maxIterations) { throw new Error('Upload took too long') }

    logger.dim().log('Upload not completed, waiting 5 seconds...')

    await new Promise<void>((resolve) => { setTimeout(() => resolve(), 5_000) })
  }
}

const uploadDataset = async (layer: V3Layer): Promise<{ id: string; title: string }> => {
  const filesPath = `${dataDirPath}/raster-layers/download/${layer.id}`

  const tifFilePath = globSync(`${filesPath}/*.{tif,tiff}`)
  if (tifFilePath.length !== 1) { throw new Error(`Unexpected number ${tifFilePath.length} of "tif"/"tiff" files found in path`) }

  const tifFile = await readFile(tifFilePath[0]!) as Blob

  const formdata = new FormData()
  formdata.append('base_file', tifFile, path.basename(tifFilePath[0]!))
  formdata.append('charset', 'UTF-8')
  formdata.append('store_spatial_files', 'true')
  formdata.append('time', 'false')
  formdata.append('tif_file', tifFile, path.basename(tifFilePath[0]!))

  const { execution_id: execId } = await v4Client.sendForm<{ execution_id: string }>('/api/v2/uploads/upload', formdata)

  type UploadResponse = { request: { output_params: { resources: [{ id: number }] } } }
  const uploadResponse = await waitForUpload<UploadResponse>(`/api/v2/executionrequest/${execId}`)

  const id = uploadResponse.request.output_params.resources[0].id.toString()

  const details = await v4Client.getJson<{ dataset: { title: string } }>(`/api/v2/datasets/${id}`)

  return { id, title: `geonode:${details.dataset.title}` }
}

const uploadStyle = async (layer: V3Layer, datasetTitle: string) => {
  if (!layer.stylePath) { throw new Error('The layer has no style') }

  const sldFile = await readFile(layer.stylePath) as Blob

  const formdata = new FormData()
  formdata.append('base_file', sldFile, path.basename(layer.stylePath))
  formdata.append('permissions', '{}')
  formdata.append('sld_file', sldFile, path.basename(layer.stylePath))
  formdata.append('charset', 'undefined')
  formdata.append('style_upload_form', 'true')
  formdata.append('dataset_title', datasetTitle)

  const { execution_id: execId } = await v4Client.sendForm<{ execution_id: string }>('/upload/uploads/upload', formdata)

  await waitForUpload(`/api/v2/executionrequest/${execId}`)
}

const uploadMetadata = async (layer: V3Layer, datasetTitle: string) => {
  const filesPath = `${dataDirPath}/raster-layers/download/${layer.id}`

  const metaFilePath = globSync(`${filesPath}/iso.xml`)
  if (metaFilePath.length !== 1) { throw new Error(`Unexpected number ${metaFilePath.length} of "iso.xml" files found in path`) }

  const metaFile = await readFile(metaFilePath[0]!) as Blob

  const formdata = new FormData()
  formdata.append('base_file', metaFile, path.basename(metaFilePath[0]!))
  formdata.append('permissions', '{}')
  formdata.append('xml_file', metaFile, path.basename(metaFilePath[0]!))
  formdata.append('charset', 'undefined')
  formdata.append('metadata_upload_form', 'true')
  formdata.append('dataset_title', datasetTitle)

  const { execution_id: execId } = await v4Client.sendForm<{ execution_id: string }>('/upload/uploads/upload', formdata)

  await waitForUpload(`/api/v2/executionrequest/${execId}`)
}

const patchMeta = async (layer: V3Layer, newId: string) => {
  await v4Client.sendJson('/api/v2/extra/admin-set-resource-owner/', { resource_id: newId, username: layer.ownerUsername })

  await v4Client.sendJson(
    `/api/v2/datasets/${newId}/`,
    { license: layer.license, metadata_author: layer.ownerUsername, poc: layer.ownerUsername },
    'PATCH'
  )
}

const uploadThumbnail = async (layer: V3Layer, newId: string) => {
  const filesPath = `${dataDirPath}/raster-layers/download/${layer.id}`

  const thumbnailPath = globSync(`${filesPath}/thumbnail.*`)
  if (thumbnailPath.length === 0) {
    logger.warn('No thumbnail found')
    return
  }

  if (thumbnailPath.length > 1) {
    throw new Error(`Unexpected number ${thumbnailPath.length} of "thumbnail" files found in path`)
  }

  const thumbnailString = await readFileAsBase64(thumbnailPath[0]!)

  await v4Client.sendJson(`/api/v2/resources/${newId}/set_thumbnail`, { file: thumbnailString }, 'PUT')
}

const createLayers = async () => {
  logger.info('Creating raster layers...\n')

  const startIdx = BATCH_SIZE * (BATCH_NUMBER - 1)
  const endIdx = startIdx + BATCH_SIZE

  let creationStateMap: CreationStateMap = {}
  try {
    creationStateMap = await readJson<CreationStateMap>('raster-layers/creation-state')
  } catch {
    logger.warn('No existing creation state')
  }

  const layers = await readJson<V3Layer[]>('raster-layers/data')

  const reportPath = `raster-layers/create-report/${dayjs().format('YYYY-MM-DD HH:mm:ss')}`

  let processesCount = 0
  let alreadyCreatedCount = 0
  let newlyCreatedCount = 0

  let successReport = `## Success\n`

  let warnReport = `## Warn`
  let warnCount = 0

  let errorReport = `## Error`
  let errorCount = 0

  const dumpResults = async () => {
    await dumpJson('raster-layers/creation-state', creationStateMap)

    const report = `# Created raster layers

Layers to be created: ${BATCH_SIZE} (from idx ${startIdx + 1} to idx ${endIdx})

Processed layers: ${processesCount}
Created layers: ${Object.keys(creationStateMap).length}
Already created documents: ${alreadyCreatedCount}
Newly created documents: ${newlyCreatedCount}
Created with warning: ${warnCount}
Not created: ${errorCount}

${successReport}

${warnReport}

${errorReport}
`

    await dumpMd(reportPath, report)
  }


  for (const [idx, layer] of layers.entries()) {
    if (idx < startIdx || idx >= endIdx) { continue }

    logger.log(`\nProcessing ${idx + 1}/${layers.length} - [${layer.id}] ${layer.title}`)

    processesCount += 1

    const creationState: CreationState = creationStateMap[layer.uuid] ?? { datasetTitle: '', lastCompletedStep: null, newId: '' }
    creationStateMap[layer.uuid] = creationState

    if (creationState.lastCompletedStep === 'upload-thumbnail') {
      logger.log('Already created, skipping...')

      alreadyCreatedCount += 1
      await dumpResults()

      continue
    }

    if (layer.filesState === 'no-details') {
      errorReport += `\n\n### [${layer.id}] ${layer.title}\n\nOriginal layer did not have details`
      errorCount += 1

      await dumpResults()

      continue
    }

    if (layer.filesState === 'no-original-files') {
      errorReport += `\n\n### [${layer.id}] ${layer.title}\n\nOriginal layer did not have original files`
      errorCount += 1

      await dumpResults()

      continue
    }


    /* Upload dataset */
    if (creationState.lastCompletedStep === null) {
      try {
        logger.log('Uploading dataset...')

        const { id: _id, title: _datasetTitle } = await uploadDataset(layer)
        logger.dim().color('green').log(`Dataset uploaded, new id is ${_id}`)

        creationState.datasetTitle = _datasetTitle
        creationState.lastCompletedStep = 'upload-dataset'
        creationState.newId = _id

        await dumpResults()
      } catch (err) {
        logger.warn('Error uploading dataset')

        errorReport += `\n\n### [${layer.id}] ${layer.title}\n\nDataset upload: ${err as string}`
        errorCount += 1

        await dumpResults()

        continue
      }
    } else {
      logger.log('Dataset already uploaded, skipping...')
    }


    /* Upload style */
    if (creationState.lastCompletedStep === 'upload-dataset') {
      try {
        logger.log('Uploading style...')

        await uploadStyle(layer, creationState.datasetTitle)
        logger.dim().color('green').log('Style uploaded')

        creationState.lastCompletedStep = 'upload-style'

        await dumpResults()
      } catch (err) {
        logger.warn('Error uploading style')
        warnReport += `\n\n### [${layer.id}] ${layer.title}\n\nStyle upload: ${err as string}`
        warnCount += 1

        await dumpResults()

        continue
      }
    } else {
      logger.log('Style already uploaded, skipping...')
    }


    /* Upload metadata */
    if (creationState.lastCompletedStep === 'upload-style') {
      try {
        logger.log('Uploading metadata...')

        await uploadMetadata(layer, creationState.datasetTitle)
        logger.dim().color('green').log('Metadata uploaded')

        creationState.lastCompletedStep = 'upload-metadata'

        await dumpResults()
      } catch (err) {
        logger.warn('Error uploading metadata')

        warnReport += `\n\n### [${layer.id}] ${layer.title}\n\nMetadata upload: ${err as string}`
        warnCount += 1

        await dumpResults()

        continue
      }
    } else {
      logger.log('Metadata already uploaded, skipping...')
    }


    /* Patch metadata */
    if (creationState.lastCompletedStep === 'upload-metadata') {
      try {
        logger.log('Patching metadata...')

        await patchMeta(layer, creationState.newId)
        logger.dim().color('green').log('Metadata patched')

        creationState.lastCompletedStep = 'patch-metadata'

        await dumpResults()
      } catch (err) {
        logger.warn('Error patching metadata')

        warnReport += `\n\n### [${layer.id}] ${layer.title}\n\nMetadata patch: ${err as string}`
        warnCount += 1

        await dumpResults()

        continue
      }
    } else {
      logger.log('Metadata already patched, skipping...')
    }

    /* Upload thumbnail */
    if (creationState.lastCompletedStep === 'patch-metadata') {
      try {
        logger.log('Uploading thumbnail...')

        await uploadThumbnail(layer, creationState.newId)
        logger.dim().color('green').log('Thumbnail uploaded')

        creationState.lastCompletedStep = 'upload-thumbnail'

        await dumpResults()
      } catch (err) {
        logger.warn('Error uploading thumbnail')

        warnReport += `\n\n### [${layer.id}] ${layer.title}\n\nThumbnail upload: ${err as string}`
        warnCount += 1

        await dumpResults()

        continue
      }
    } else {
      logger.log('Thumbnail already uploaded, skipping...')
    }


    successReport += `\n- [${layer.id}] ${layer.title}`
    newlyCreatedCount += 1

    await dumpResults()
  }

  logger.log('\n')
  logger.success('Created raster layers')
}

export default createLayers
