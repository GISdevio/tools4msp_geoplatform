/* eslint-disable require-atomic-updates */
import { dumpJson, readJson } from '../lib/fs-client'
import v3Client from '../lib/v3-client'
import v4Client from '../lib/v4-client'

import type { PlatformsDiff } from './compare-platform-states'

type Report = {
  meta: {
    lastIssuedAt: string
    platformDiffMeta: PlatformsDiff['meta']
  }
  spec: Array<{
    keywords: Array<{
      newId: string
      oldId: string
    }>
    newLayerId: string
    oldLayerId: string
    state: 'downloaded-keywords' | 'done' | null
  }>
}

const processLayer = async (oldId: string, newId: string, keywordsMap: Record<string, string>, report: Report['spec'][number]) => {
  if (report.state !== 'downloaded-keywords') {
    const oldLayer = await v3Client.getJson<{ tkeywords?: string[] }>(`/api/layers/${oldId}/`)
    if (!oldLayer.tkeywords?.length) {
      console.log('No thesaurus keywords found on old layer, skipping...')
      report.state = 'done'
      return
    }

    for (const keywordUrl of oldLayer.tkeywords) {
      const keywordId = keywordUrl.match(/\/(\d+)\//)?.[1]
      if (!keywordId) {
        console.log(`ERROR: Could not extract keyword id from keyword url ${keywordUrl}, skipping...`)
        continue
      }

      const newKeywordId = keywordsMap[keywordId]
      if (!keywordId) {
        console.log(`ERROR: Could not find keyword with id ${keywordId} in new platform keywords, skipping...`)
        continue
      }

      report.keywords.push({ newId: newKeywordId!, oldId: keywordId })
    }

    report.state = 'downloaded-keywords'
  } else {
    console.log('Keywords already downloaded')
  }

  await v4Client.sendJson(`/api/v2/datasets/${newId}/`, { tkeywords: report.keywords.map(({ newId }) => newId) }, 'PATCH')
  report.state = 'done'
}

const main = async () => {
  const platformsDiff = await readJson<PlatformsDiff>('raster-layers/platforms-diff')
  const keywordsMap = await readJson<Record<string, string>>('thesauri/keywords-keys-map')

  let report: Report = {
    meta: {
      lastIssuedAt: new Date().toISOString(),
      platformDiffMeta: platformsDiff.meta,
    },
    spec: [],
  }

  try {
    report = await readJson<Report>('raster-layers/fix-keyword-state')
  } catch {
    console.warn('No existing report')
  }

  for (const [idx, layersMap] of platformsDiff.layersInBothPlatforms.entries()) {
    // if (idx > 2) { continue }

    console.log(`Processing ${idx + 1}/${platformsDiff.layersInBothPlatforms.length} - [old layer ${layersMap.oldId}]`)

    let _report: Report['spec'][number]
    if (report.spec.find(({ oldLayerId }) => oldLayerId === layersMap.oldId)) {
      _report = report.spec.find(({ oldLayerId }) => oldLayerId === layersMap.oldId)!
    } else {
      _report = { keywords: [], newLayerId: layersMap.newId, oldLayerId: layersMap.oldId, state: null }
      report.spec.push(_report)
    }

    if (_report.state === 'done') {
      console.log('Layer already processed, skipping...')
      continue
    }

    try {
      await processLayer(layersMap.oldId, layersMap.newId, keywordsMap, _report)
    } catch (error) {
      console.log('ERROR: error processing layer')
      console.log(error)
    }

    console.log('Done')

    await dumpJson('raster-layers/fix-keyword-state', report)
  }
}

export default async () => {
  try {
    await main()
  } catch (error) {
    console.log(error)
  }
}
