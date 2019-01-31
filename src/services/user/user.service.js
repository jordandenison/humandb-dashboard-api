const createService = require('feathers-sequelize')
const createModel = require('models/user.model')
const hooks = require('services/user/user.hooks')

module.exports = function () {
  const app = this
  const Model = createModel(app)
  const paginate = app.get('paginate')

  const options = {
    name: 'user',
    Model,
    paginate
  }

  // Initialize our service with any options it requires
  app.use('/user', createService(options))

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('user')

  service.hooks(hooks)
}
