import { readJson } from '../lib/fs-client'
import v4Client from '../lib/v4-client'
import type { ThesaurusKeyword } from '../thesauri/types'

type V4Layer = { pk: string; title: string }

type V4LayerDetail = {
  resource: {
    alternate: string
    keywords?: { name: string; slug: string }[]
    pk: string
  }
}

type Thesaurus = {
  keywordsKeysMap: Record<string, string>
  thesauriKeyMap: Record<string, string>
  thesaurusKeywords: ThesaurusKeyword[]
}

const processLayer = async (layer: V4Layer, thesaurus: Thesaurus) => {
  const { resource } = await v4Client.getJson<V4LayerDetail>(`/api/v2/resources/${layer.pk}?format=json`)
  if (!resource.keywords?.length) {
    console.log('No keywords found, skipping...\n')
    return
  }

  const keywordsToKeep: V4LayerDetail['resource']['keywords'] = [{
    name: 'MSP_Italy',
    slug: 'msp_italy',
  },
  // {
  //   name: 'european-seas',
  //   slug: 'european-seas',
  // }, {
  //   name: 'mspdf-legal-governance-planning-theme-legal-status-maritime-zones',
  //   slug: 'mspdf-legal-governance-planning-theme-legal-status-maritime-zones',
  // }
  ]

  // for (const keyword of resource.keywords) {
  //   const thesaurusKeyword = thesaurus.thesaurusKeywords.filter(({ altLabel }) => altLabel === keyword.name)

  //   if (thesaurusKeyword.length === 0) {
  //     console.log(`${keyword.name} -> No correspondence in Thesaurus, keeping...`)
  //     keywordsToKeep.push(keyword)
  //     continue
  //   }

  //   if (thesaurusKeyword.length > 1) {
  //     console.log(`${keyword.name} -> Multiple correspondences in Thesaurus, skipping layer...`)
  //     return
  //   }

  //   console.log(`${keyword.name} -> Found correspondence in Thesaurus`)

  //   const thesaurusKey = thesaurus.thesauriKeyMap[thesaurusKeyword[0]!.thesaurus]
  //   if (!thesaurusKey) {
  //     console.log(`Parent Thesaurus new key not found`)
  //     continue
  //   }

  //   const keywordKey = thesaurus.keywordsKeysMap[thesaurusKeyword[0]!.id]
  //   if (!keywordKey) {
  //     console.log(`Keyword new key not found`)
  //     continue
  //   }

  //   console.log(`Keyword is of thesaurus ${thesaurusKey} and has key ${keywordKey}`)
  // }

  try {
    // const middlewareToken = await v4Client.getMiddlewareToken(`/datasets/tools4msp_geoplatform_data:${resource.alternate}/metadata`)

    // const urlencoded = new URLSearchParams()
    // urlencoded.append('csrfmiddlewaretoken', middlewareToken)

    // keywordsToKeep.forEach((keyword) => urlencoded.append('resource-keywords', keyword))

    // await v4Client.sendUrlEncodedForm(`/datasets/tools4msp_geoplatform_data:${resource.alternate}/metadata`, urlencoded)

    // const res = await v4Client.sendJson(
    //   `/api/v2/resources/${layer.pk}/`,
    //   { keywords: keywordsToKeep },
    //   'PATCH'
    // )

    await v4Client.sendJson(
      `/api/v2/datasets/${layer.pk}/`,
      { keywords: ['MSP_Italy'] },
      'PATCH'
    )

    console.log('Metadata updated successfully')
  } catch (error) {
    console.log('Error updated metadata', error)
  }
}

const main = async () => {
  const v4Layers = await readJson<V4Layer[]>('vector-layers/new-layers')

  const thesaurusKeywords = await readJson<ThesaurusKeyword[]>('thesauri/keywords')
  const thesauriKeyMap = await readJson<Record<string, string>>('thesauri/thesauri-key-map')
  const keywordsKeysMap = await readJson<Record<string, string>>('thesauri/keywords-keys-map')

  for (const [idx, layer] of v4Layers.entries()) {
    if (idx > 0) { continue }

    console.log(`Processing ${idx + 1}/${v4Layers.length} - [${layer.pk}] ${layer.title}`)

    await processLayer(layer, { keywordsKeysMap, thesauriKeyMap, thesaurusKeywords })

    console.log('\n')
  }
}

export default main
