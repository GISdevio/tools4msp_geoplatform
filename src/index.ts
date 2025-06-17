import logger from 'node-color-log'

const main = async () => {
  logger.log('Hey!')
}

main().catch((err) => logger.error(err))
