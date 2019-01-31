const { promisify } = require('util')
const { verify } = require('jsonwebtoken')
const verifyAsync = promisify(verify)

module.exports = {
  verifyJWT (accessToken, secret) {
    return verifyAsync(accessToken, secret)
  }
}
