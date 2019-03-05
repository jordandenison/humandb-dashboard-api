const { promisify } = require('util')
const { verify } = require('jsonwebtoken')
const verifyAsync = promisify(verify)

const options = {
  jwt: {
    audience: 'http://humandb-portal-local-development.com',
    issuer: 'feathers',
    subject: 'local-development-token',
    expiresIn: '365d'
  }
}

module.exports = {
  getLocalDeveloperToken: async app => {
    const { data } = await app.service('user').find({ query: { role: 'owner' } })
    const [user] = data

    return app.passport.createJWT(
      { userId: user.id },
      Object.assign({}, options, { secret: app.get('authentication').secret })
    )
  },

  verifyJWT (accessToken, secret) {
    return verifyAsync(accessToken, secret)
  }
}
