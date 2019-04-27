const createService = require('feathers-sequelize')
const createModel = require('models/status.model')
const hooks = require('./status.hooks')

module.exports = function (app) {
  const Model = createModel(app)
  const paginate = app.get('paginate')

  const options = {
    name: 'status',
    Model,
    paginate
  }

  // Initialize our service with any options it requires
  app.use('/auth/status', createService(options))

  // Get our initialized service so that we can register hooks
  const service = app.service('auth/status')

  service.hooks(hooks)
}
