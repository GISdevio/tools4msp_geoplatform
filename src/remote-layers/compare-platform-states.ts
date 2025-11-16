import { readJson, dumpJson } from '../lib/fs-client'

export type PlatformsDiff = {
  layersInBothPlatforms: { newId: string; oldId: string }[]
  meta: { newLayersDownloadDate: string; oldLayersDownloadDate: string }
  newLayersNotInOldPlatform: string[]
  oldLayersNotInNewPlatform: string[]
}

const main = async () => {
  type OldLayers = { meta: { downloadedAt: string }; objects: { id: number; title: string; uuid: string }[] }
  const oldLayers = await readJson<OldLayers>('remote-layers/layers')

  type NewLayers = { meta: { downloadedAt: string }; objects: { pk: string; title: string }[] }
  const newLayers = await readJson<NewLayers>('remote-layers/new-layers')

  const platformsDiff: PlatformsDiff = {
    layersInBothPlatforms: [],
    meta: { newLayersDownloadDate: newLayers.meta.downloadedAt, oldLayersDownloadDate: oldLayers.meta.downloadedAt },
    newLayersNotInOldPlatform: [],
    oldLayersNotInNewPlatform: [],
  }

  for (const oldLayer of oldLayers.objects) {
    const maybeNewLayers = newLayers.objects.filter(({ title }) => oldLayer.title === title)

    if (maybeNewLayers.length === 0) {
      platformsDiff.oldLayersNotInNewPlatform.push(oldLayer.id.toString())
      continue
    }

    if (maybeNewLayers.length === 1) {
      platformsDiff.layersInBothPlatforms.push({ newId: maybeNewLayers[0]!.pk, oldId: oldLayer.id.toString() })
      continue
    }

    console.log(`Multiple new layers found for old layer with id ${oldLayer.id}: ${maybeNewLayers.map(({ pk }) => pk).join(', ')}`)
  }

  for (const newLayer of newLayers.objects) {
    const maybeOldLayers = oldLayers.objects.filter(({ title }) => newLayer.title === title)

    if (maybeOldLayers.length === 0) {
      platformsDiff.newLayersNotInOldPlatform.push(newLayer.pk)
    }
  }

  await dumpJson('remote-layers/platforms-diff', platformsDiff)
}

export default async () => {
  try {
    await main()
  } catch (error) {
    console.log(error)
  }
}
