const logger = require('winston')
const { omit } = require('lodash/fp')

const protectUserFields = data => omit(['password', 'oneUpRefreshToken'], data)

const realtime = {}

realtime.init = app => {
  logger.info('Initializing realtime for API')

  app.on('login', (payload, { connection }) => {
    if (connection) {
      app.channel('local').join(connection)
    }
  })

  app.getService('user').publish('patched', data => app.channel('local').send({ data: protectUserFields(data) }))
  app.getService('user').publish('removed', data => app.channel('local').send({ data: protectUserFields(data) }))

  app.getService('status').publish('created', data => app.channel('local').send({ data }))
  app.getService('status').publish('patched', data => app.channel('local').send({ data }))

  logger.info('Realtime initialized for API')
}

module.exports = realtime
