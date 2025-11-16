import { readJson, dumpJson } from '../lib/fs-client'

export type PlatformsDiff = {
  layersInBothPlatforms: { newId: string; oldId: string }[]
  meta: { newLayersDownloadDate: string; oldLayersDownloadDate: string }
  newLayersNotInOldPlatform: string[]
  oldLayersNotInNewPlatform: string[]
}

const main = async () => {
  type OldLayers = { meta: { downloadedAt: string }; objects: { id: number; title: string; uuid: string }[] }
  const oldLayers = await readJson<OldLayers>('raster-layers/layers')

  type NewLayers = { meta: { downloadedAt: string }; objects: { pk: string; title: string }[] }
  const newLayers = await readJson<NewLayers>('raster-layers/new-layers')

  type CreationState = Record<string, { newId: string }>
  const creationState = await readJson<CreationState>('raster-layers/creation-state')

  const platformsDiff: PlatformsDiff = {
    layersInBothPlatforms: [],
    meta: { newLayersDownloadDate: newLayers.meta.downloadedAt, oldLayersDownloadDate: oldLayers.meta.downloadedAt },
    newLayersNotInOldPlatform: [],
    oldLayersNotInNewPlatform: [],
  }

  for (const oldLayer of oldLayers.objects) {
    const maybeNewLayers = newLayers.objects.filter(({ title }) => oldLayer.title === title)
    const maybeCreationState = creationState[oldLayer.uuid]

    if (maybeNewLayers.length === 0) {
      if (maybeCreationState?.newId) {
        console.log(`Title match not found for old layer ${oldLayer.id}, but creation state match found with new layer ${maybeCreationState.newId}. Creation state wins`)
        platformsDiff.layersInBothPlatforms.push({ newId: maybeCreationState.newId, oldId: oldLayer.id.toString() })
      } else {
        platformsDiff.oldLayersNotInNewPlatform.push(oldLayer.id.toString())
      }

      continue
    }

    if (maybeNewLayers.length === 1) {
      if (maybeCreationState?.newId && maybeCreationState.newId !== maybeNewLayers[0]!.pk) {
        console.log(`Mismatch for old layer ${oldLayer.id}: found new layer ${maybeNewLayers[0]!.pk}, but linked to new layer ${maybeCreationState.newId} in creation state. Creation state wins`)
        platformsDiff.layersInBothPlatforms.push({ newId: maybeCreationState.newId, oldId: oldLayer.id.toString() })
      } else {
        platformsDiff.layersInBothPlatforms.push({ newId: maybeNewLayers[0]!.pk, oldId: oldLayer.id.toString() })
      }

      continue
    }

    if (maybeCreationState?.newId) {
      console.log(`Title match for old layer ${oldLayer.id} got back multiple results, but creation state match found with new layer ${maybeCreationState.newId}. Creation state wins`)
      platformsDiff.layersInBothPlatforms.push({ newId: maybeCreationState.newId, oldId: oldLayer.id.toString() })
    } else {
      console.log(`Multiple new layers found for old layer with id ${oldLayer.id}: ${maybeNewLayers.map(({ pk }) => pk).join(', ')}`)
    }
  }

  for (const newLayer of newLayers.objects) {
    const maybeOldLayers = oldLayers.objects.filter(({ title }) => newLayer.title === title)

    if (maybeOldLayers.length === 0) {
      platformsDiff.newLayersNotInOldPlatform.push(newLayer.pk)
    }
  }

  await dumpJson('raster-layers/platforms-diff', platformsDiff)
}

export default async () => {
  try {
    await main()
  } catch (error) {
    console.log(error)
  }
}
