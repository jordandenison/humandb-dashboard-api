const JWT = require('jsonwebtoken')

const JWT_OPTIONS = {
  header: {
    type: 'access'
  },
  audience: 'https://invest.aboveboard.ai',
  subject: 'Aboveboard',
  issuer: 'feathers',
  algorithm: 'HS256',
  expiresIn: '30d'
}

const getJWT = (_id) => `Bearer ${JWT.sign({ userId: String(_id) }, process.env.JWT_SECRET, JWT_OPTIONS)}`

module.exports = {
  getJWT
}
