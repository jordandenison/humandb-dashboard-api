require('app-module-path').addPath(__dirname)
require('dotenv').config()

const logger = require('winston')
const app = require('app')
const port = app.get('port')
const realtime = require('lib/realtime')
const { delay } = require('lib/util')
const seedInitialData = require('../scripts/seed-initial-data')

process.on('uncaughtException', e => {
  logger.error('Uncaught exception: ', e.stack)
  process.exit(1)
})

process.on('unhandledRejection', reason =>
  logger.error('Unhandled Promise Rejection: ', reason.toString().substring(0, 500))
)

const listen = () => {
  if (!app.getService('user') || !app.getService('user').Model) {
    return delay(250).then(listen)
  }

  const server = app.listen(port)

  server.on('listening', () => {
    logger.info('HumanDB Dashboard API started on http://%s:%d', app.get('host'), port)

    seedInitialData(app)

    realtime.init(app)
  })

  server.on('error', e => logger.error('App startup error ', e.stack))
}

listen()
