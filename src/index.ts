import logger from 'node-color-log'

import categories from './categories'
import documents from './documents'
import groups from './groups'
import keywords from './keywords'
import rasterLayers from './raster-layers'
import thesauri from './thesauri'
import users from './users'
import vectorLayers from './vector-layers'

logger.setDate(() => '')

const main = async () => {
  // await users.download()
  // await users.upload()

  // await groups.download()
  // await groups.upload()

  // await categories.download()
  await categories.upload()

  // await keywords.download()
  // await keywords.upload()

  // await thesauri.download()
  // await thesauri.upload()

  // await documents.download()
  // await documents.upload()

  // await rasterLayers.download()
  // await rasterLayers.upload()

  // await vectorLayers.download()
  // await vectorLayers.upload()
}

main().catch((err) => logger.error(err))
