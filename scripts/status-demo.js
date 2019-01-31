const { delay, getRandomBetween } = require('../src/lib/util')

let status = 'Unavailable'
const error = 'Could not connect to test dep'

module.exports = app => {
  const service = 'Test service'

  const start = async () => {
    try {
      const { total } = await app.service('status').find()

      if (!total) {
        await app.service('status').create({
          service,
          dependency: 'Test dep',
          description: 'Required to perform test action.',
          status,
          error
        })
      } else {
        status = status === 'Unavailable' ? 'Available' : 'Unavailable'

        await app.service('status').patch(null, { status, error: status === 'Unavailable' ? error : '' }, { query: { service } })
      }
    } catch (e) {
      console.log(`Status demo error ${e.message}`)
    }

    await delay(getRandomBetween(5000, 15000))

    return start()
  }

  start()
}
