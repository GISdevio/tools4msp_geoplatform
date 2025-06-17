import fs from 'node:fs/promises'
import path from 'node:path'

import logger from 'node-color-log'

import { readJson } from '../lib/fs-client'

import type { V3Layer } from './types'

const extractExtraStyles = async () => {
  logger.info('Collecting vector layers extra styles...\n')

  const report: string[] = []

  const extraStylesDir = path.resolve(process.cwd(), 'data/vector-layers/extra-styles')
  await fs.rm(extraStylesDir, { force: true, recursive: true })
  await fs.mkdir(extraStylesDir, { recursive: true })

  const layers = await readJson<V3Layer[]>('vector-layers/data')

  for (const [idx, layer] of layers.entries()) {
    logger.log(`\nProcessing ${idx + 1}/${layers.length} - [${layer.id}] ${layer.title}`)

    if (!layer.stylePath) {
      logger.warn(`Layer "${layer.id}" does not have property "stylePath"`)
      continue
    }

    const { dir: layerDir, base: defaultStyleFilename } = path.parse(layer.stylePath)

    const sldFilePaths = fs.glob(`${layerDir}/*.sld`)

    let hasMultipleStyles = false

    for await (const sldFilePath of sldFilePaths) {
      if (path.basename(sldFilePath) === defaultStyleFilename) { continue }

      hasMultipleStyles = true

      const layerOutDir = path.resolve(extraStylesDir, layer.id)

      await fs.mkdir(layerOutDir, { recursive: true })
      await fs.copyFile(sldFilePath, path.resolve(layerOutDir, path.basename(sldFilePath)))
    }

    if (hasMultipleStyles) {
      report.push(`[${layer.id}] ${layer.name} (uploaded by \`${layer.ownerUsername}\`)`)
    }
  }

  logger.log('\nComputation results:', JSON.stringify(report, null, 2))
}

export default extractExtraStyles
