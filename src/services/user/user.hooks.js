const authentication = require('@feathersjs/authentication')
const { hashPassword, protect } = require('@feathersjs/authentication-local').hooks

const search = () =>
  hook => {
    if (hook.params.query && hook.params.query.search) {
      const searchString = `%${hook.params.query.search}%`

      hook.params.query.$or = [
        { firstName: { $like: searchString } },
        { lastName: { $like: searchString } },
        { email: { $like: searchString } }
      ]

      delete hook.params.query.search
    }

    return hook
  }

module.exports = {
  before: {
    all: [ authentication.hooks.authenticate('jwt') ],
    find: [ search() ],
    get: [],
    create: [ hashPassword() ],
    update: [],
    patch: [ hashPassword() ],
    remove: []
  },

  after: {
    all: [ protect('password', 'oneUpRefreshToken') ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
