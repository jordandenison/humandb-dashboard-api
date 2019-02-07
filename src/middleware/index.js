const superagent = require('superagent')
const { URLSearchParams } = require('url')

const { verifyJWT } = require('lib/authentication')
const proxy = require('lib/proxy')
const discourse = require('./discourse')

const bearerRegexp = /^bearer /i

module.exports = function () {
  const app = this

  discourse.init(app)

  app.get(/(\/auth)?\/set-cookie/, async (req, res, next) => {
    try {
      const accessToken = req.headers.authorization.replace(bearerRegexp, '') || req.cookies.jwt
      const secret = app.get('authentication').secret

      await verifyJWT(accessToken, secret)

      res.cookie('jwt', accessToken, { maxAge: 90000000, httpOnly: true })

      res.json({ status: 'ok' })
    } catch (e) {
      return next(e)
    }
  })

  app.use(/(\/auth)?\/fhir\/stu2/, proxy('http://stu2:4002/baseDstu2'))
  app.use(/(\/auth)?\/fhir\/stu3/, proxy('http://stu3:4003/baseDstu3'))
  app.use(/(\/auth)?\/fhir\/browser/, proxy('http://fhir-viewer'))
  app.use(/(\/auth)?\/fhir-ui\/stu2/, proxy('http://stu2:4002'))
  app.use(/(\/auth)?\/fhir-ui\/stu3/, proxy('http://stu3:4003'))

  app.post(/(\/auth)?\/discussion\/post\/message/, async (req, res, next) => {
    try {
      const accessToken = req.headers.authorization.replace(bearerRegexp, '') || req.cookies.jwt
      const secret = app.get('authentication').secret

      await verifyJWT(accessToken, secret)

      const { title, raw } = req.body

      const data = new URLSearchParams({
        raw,
        title,
        api_key: 'd757e112ab624d50f8ad4dde9b2df67f08b9980fedd7608a91edaadd087cc614', // process.env.DISCOURSE_API_KEY,
        api_username: 'humandb'
      })

      const { body: json } = await superagent
        .post(`http://discourse-web/discussion/posts`)
        .set({
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        })
        .send(data)

      res.json(json)
    } catch (e) {
      return next(e)
    }
  })
}
