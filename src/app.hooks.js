const { disallow } = require('feathers-hooks-common')
const logger = require('hooks/logger')
const uuid = require('uuid/v4')

const setId = () =>
  hook => {
    if (!hook.data.id) {
      hook.data.id = uuid()
    }

    return hook
  }

const setCreatedAt = () =>
  hook => {
    if (!hook.data.createdAt) {
      hook.data.createdAt = new Date()
    }

    return hook
  }

const setUpdatedAt = () =>
  hook => {
    if (!hook.data.updatedAt) {
      hook.data.updatedAt = new Date()
    }

    return hook
  }

const setUserId = () =>
  hook => {
    if (hook.params.user) {
      hook.data.userId = hook.params.user.id
    }

    return hook
  }

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [ setId(), setCreatedAt(), setUserId() ],
    update: [ disallow() ],
    patch: [ setUpdatedAt() ],
    remove: []
  },

  after: {
    all: [ logger() ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [ logger() ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
