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
    newGroupId?: number
    newLayerId: string
    oldGroupSlug?: string
    oldLayerId: string
    state: 'downloaded-group' | 'done' | null
  }>
}

const processLayer = async (oldId: string, newId: string, groupsMap: Record<string, number>, report: Report['spec'][number]) => {
  if (report.state !== 'downloaded-group') {
    const oldLayer = await v3Client.getJson<{ group?: { name?: string } }>(`/api/layers/${oldId}/`)
    if (!oldLayer.group?.name) {
      console.log('No group found on old layer, skipping...')
      report.state = 'done'
      return
    }

    const newGroupId = groupsMap[oldLayer.group.name]
    if (!newGroupId) {
      console.log(`ERROR: Could not find group with slug ${oldLayer.group.name} in new platform groups, skipping...`)
    } else {
      report.oldGroupSlug = oldLayer.group.name
      report.newGroupId = newGroupId
    }

    report.state = 'downloaded-group'
  } else {
    console.log('Group already downloaded')
  }

  if (report.newGroupId) {
    await v4Client.sendJson(`/api/v2/datasets/${newId}/`, { group: report.newGroupId }, 'PATCH')
    report.state = 'done'
  } else {
    console.log('No group to add, skipping...')
  }
}

const main = async () => {
  const platformsDiff = await readJson<PlatformsDiff>('vector-layers/platforms-diff')
  const groupsMap = await readJson<Record<string, number>>('groups/groups-map')

  let report: Report = {
    meta: {
      lastIssuedAt: new Date().toISOString(),
      platformDiffMeta: platformsDiff.meta,
    },
    spec: [],
  }

  try {
    report = await readJson<Report>('vector-layers/fix-groups-state')
  } catch {
    console.warn('No existing report')
  }

  for (const [idx, layersMap] of platformsDiff.layersInBothPlatforms.entries()) {
    // if (layersMap.oldId !== '1323') { continue }

    console.log(`Processing ${idx + 1}/${platformsDiff.layersInBothPlatforms.length} - [old layer ${layersMap.oldId}]`)

    let _report: Report['spec'][number]
    if (report.spec.find(({ oldLayerId }) => oldLayerId === layersMap.oldId)) {
      _report = report.spec.find(({ oldLayerId }) => oldLayerId === layersMap.oldId)!
    } else {
      _report = { newLayerId: layersMap.newId, oldLayerId: layersMap.oldId, state: null }
      report.spec.push(_report)
    }

    if (_report.state === 'done') {
      console.log('Layer already processed, skipping...')
      continue
    }

    try {
      await processLayer(layersMap.oldId, layersMap.newId, groupsMap, _report)
    } catch (error) {
      console.log('ERROR: error processing layer')
      console.log(error)
    }

    console.log('Done')

    await dumpJson('vector-layers/fix-groups-state', report)
  }
}

export default async () => {
  try {
    await main()
  } catch (error) {
    console.log(error)
  }
}
