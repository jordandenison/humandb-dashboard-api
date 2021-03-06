const Promise = require('bluebird')
const { each } = Promise

const delay = time => new Promise((resolve) => setTimeout(resolve, time))

const purgeData = app => {
  const promises = [
    app.service('auth/user').remove(null)
  ]

  return Promise.all(promises)
}

const getUsers = () => {
  const users = process.env.PRIMARY_EMAIL_ADDRESS.split(',').map(email => {
    return { email, role: 'admin' }
  })

  users[0].role = 'owner'

  users.push({
    email: process.env.INTERNAL_API_USERNAME,
    password: process.env.INTERNAL_API_USERNAME,
    role: 'internal'
  })

  if (process.env.ADVAITABIO_API_USERNAME) {
    users.push({
      email: process.env.ADVAITABIO_API_USERNAME,
      password: process.env.ADVAITABIO_API_PASSWORD,
      role: 'internal'
    })
  }

  if (process.env.NODE_ENV !== 'production') {
    users.push({
      email: 'test',
      password: 'test',
      role: 'internal'
    })
  }

  return users
}

module.exports = app => {
  const seed = async () => {
    if (!app.service('auth/user') || !app.service('auth/user').Model) {
      await delay(250)

      return seed()
    }

    try {
      await process.env.PURGE_DATA && process.env.NODE_ENV !== 'production' ? purgeData(app) : Promise.resolve()

      const users = getUsers()

      return each(users, async user => {
        const find = { query: {} }
        if (user.email) { find.query.email = user.email }
        if (user.id) { find.query.id = user.id }

        const { total } = await app.service('auth/user').find(find)

        if (total) {
          return app.service('auth/user').patch(null, user, find)
        }

        return app.service('auth/user').create(user)
      })
    } catch (e) {
      console.log(`Error seeding initial data: ${e.message}`)
    }
  }

  seed()
}
