const createService = require('feathers-sequelize')
const createModel = require('models/tempToken.model')
const hooks = require('services/tempToken/tempToken.hooks')

module.exports = function () {
  const app = this
  const Model = createModel(app)
  const paginate = app.get('paginate')

  const options = {
    name: 'tempToken',
    Model,
    paginate
  }

  // Initialize our service with any options it requires
  app.use('/auth/tempToken', createService(options))

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('auth/tempToken')

  service.hooks(hooks)
}
