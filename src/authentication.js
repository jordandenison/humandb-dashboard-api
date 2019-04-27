const authentication = require('@feathersjs/authentication')
const jwt = require('@feathersjs/authentication-jwt')
const local = require('@feathersjs/authentication-local')

const populateUser = () =>
  hook =>
  console.log('hooks params ', hook.params) ||
    hook.app.getService('user').get(hook.params.user.id)
      .then(user => {
        hook.result.user = user
        delete hook.result.user.password
        delete hook.result.user.oneUpRefreshToken

        return hook
      })

module.exports = function () {
  const app = this
  const config = app.get('authentication')

  // Secret should be loaded from the env file
  app.configure(authentication(config))
  app.configure(jwt())
  app.configure(local())

  app.service('auth/authentication').hooks({
    before: {
      create: [ authentication.hooks.authenticate(config.strategies) ],
      remove: [ authentication.hooks.authenticate('jwt') ]
    },
    after: {
      create: [ populateUser() ]
    }
  })
}
