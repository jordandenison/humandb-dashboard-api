const authentication = require('@feathersjs/authentication')
const jwt = require('@feathersjs/authentication-jwt')
const local = require('@feathersjs/authentication-local')
const oauth2 = require('@feathersjs/authentication-oauth2')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const errors = require('@feathersjs/errors')

const populateUser = () =>
  hook =>
    hook.app.service('user').get(hook.params.user.id)
      .then(user => {
        hook.result.user = user
        delete hook.result.user.password
        delete hook.result.user.oneUpRefreshToken

        return hook
      })

const oauthRedirectHandler = (app, url) => {
  const config = app.get('authentication')
  const options = {
    jwt: config.jwt,
    secret: config.secret
  }

  return (req, res, next) => {
    if (req.feathers && req.feathers.payload) {
      return app.passport.createJWT(req.feathers.payload, options)
        .then(token => res.redirect(`${url}?accessToken=${token}`))
        .catch(error => next(error))
    }
  }
}

class CustomVerifier extends oauth2.Verifier {
  _updateEntity (entity, data) {
    const options = this.options
    const name = options.name
    const id = entity[this.service.id]

    return this.service.get(id)
      .then(oldData => {
        const newData = {
          [options.idField]: data.profile.id,
          [name]: data,
          lastLoginDate: new Date()
        }

        return this.service.patch(id, newData, { oauth: { provider: name } })
      })
  }

  verify (req, accessToken, refreshToken, profile, done) { // Templated from https://github.com/feathersjs/authentication-oauth2/blob/master/lib/verifier.js#L71
    const options = this.options
    const email = profile.emails[0].value
    const query = {
      email,
      $limit: 1
    }
    const data = {
      profile,
      accessToken,
      refreshToken
    }
    let existing

    // Check request object for an existing entity
    if (req && req[options.entity]) {
      existing = req[options.entity]
    }

    // Check the request that came from a hook for an existing entity
    if (!existing && req && req.params && req.params[options.entity]) {
      existing = req.params[options.entity]
    }

    const processEntity = () => {
      // If there is already an entity on the request object (ie. they are
      // already authenticated) attach the profile to the existing entity
      // because they are likely "linking" social accounts/profiles.
      if (existing) {
        return this._updateEntity(existing, data)
          .then(entity => done(null, entity))
          .catch(error => error ? done(error) : done(null, error))
      }

      // Find or create the user since they could have signed up via facebook.
      return this.service
        .find({ query })
        .then(this._normalizeResult)
        .then(entity => {
          if (!entity) { throw (new errors.NotAuthenticated()) }

          return this._updateEntity(entity, data)
        })
        .then(entity => {
          const id = entity[this.service.id]
          const payload = { [`${this.options.entity}Id`]: id }
          done(null, entity, payload)
        })
        .catch(done)
    }

    return processEntity()
  }
}

module.exports = function () {
  const app = this
  const config = app.get('authentication')

  // Secret should be loaded from the env file
  app.configure(authentication(config))
  app.configure(jwt())
  app.configure(local())

  app.configure(oauth2({
    name: 'google',
    Strategy: GoogleStrategy,
    handler: oauthRedirectHandler(app, config.google.successRedirect),
    Verifier: CustomVerifier
  }))

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
