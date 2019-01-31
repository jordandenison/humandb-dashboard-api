const tempToken = require('services/tempToken/tempToken.service.js')
const user = require('services/user/user.service.js')
const status = require('./status/status.service.js')

module.exports = function () {
  const app = this

  app.configure(user)
  app.configure(tempToken)
  app.configure(status)
}
