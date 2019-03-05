const superagent = require('superagent')

const { getLocalDeveloperToken, verifyJWT } = require('lib/authentication')
const proxy = require('lib/proxy')
const discourse = require('./discourse')

const bearerRegexp = /^bearer /i

module.exports = function () {
  const app = this

  discourse.init(app)

  if (process.env.ALLOW_DEV_LOGIN) {
    app.get(/(\/auth)?\/dev-login/, async (req, res, next) => {
      try {
        const accessToken = await getLocalDeveloperToken(app)

        res.json({ accessToken })
      } catch (e) {
        return next(e)
      }
    })
  }

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

  app.use(/^(\/auth)?\/fhir\/stu2/, proxy('http://stu2:4002/baseDstu2'))
  app.use(/^(\/auth)?\/fhir\/stu3/, proxy('http://stu3:4003/baseDstu3'))
  app.use(/^\/auth\/fhir-stu2-ui(\/stu2)?/, proxy('http://stu2:4002'))
  app.use(/^\/auth\/fhir-stu3-ui(\/stu3)?/, proxy('http://stu3:4003'))

  app.post(/(\/auth)?\/discussion\/post\/message/, async (req, res, next) => {
    try {
      const accessToken = req.headers.authorization.replace(bearerRegexp, '') || req.cookies.jwt
      const secret = app.get('authentication').secret

      await verifyJWT(accessToken, secret)

      const { title, raw } = req.body

      const { body: json } = await superagent
        .post(`http://discourse-web/discussion/posts`)
        .send(`raw=${raw}`)
        .send(`title=${title}`)
        .send(`api_key=${process.env.DISCOURSE_ADMIN_API_KEY}`)
        .send(`api_username=${process.env.DISCOURSE_ADMIN_USERNAME}`)

      res.json(json)
    } catch (e) {
      return next(`Error posting message to Discourse ${e.message}`)
    }
  })

  app.post(/(\/auth)?\/generate-data-report/, async (req, res, next) => {
    try {
      const accessToken = req.headers.authorization.replace(bearerRegexp, '') || req.cookies.jwt
      const secret = app.get('authentication').secret

      await verifyJWT(accessToken, secret)

      await superagent.post(`http://data-reporting/generate-report`)

      res.json({ status: 'ok' })
    } catch (e) {
      return next(`Error posting message to Discourse ${e.message}`)
    }
  })
}
