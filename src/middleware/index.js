const superagent = require('superagent')
const filemanagerMiddleware = require('@opuscapita/filemanager-server').middleware

const { getLocalDeveloperToken, getLocalToken, verifyJWT } = require('lib/authentication')
const proxy = require('lib/proxy')
const discourse = require('./discourse')

const bearerRegexp = /^bearer /i

const fileManagerConfig = {
  fsRoot: '/resources',
  rootName: 'resources'
}

const verifyToken = app => async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization.replace(bearerRegexp, '') || req.cookies.jwt
    const secret = app.get('authentication').secret

    await verifyJWT(accessToken, secret)

    return next()
  } catch (e) {
    return next(e)
  }
}

const postDiscourseMessage = async (raw, title, category) => {
  const url = 'http://discourse-web/discussion/posts'

  let superagentRequest = superagent
    .post(url)
    .send(`raw=${raw}`)
    .send(`title=${title}`)
    .send(`api_key=${process.env.DISCOURSE_ADMIN_API_KEY}`)
    .send(`api_username=${process.env.DISCOURSE_ADMIN_USERNAME}`)

  if (category) {
    superagentRequest = superagentRequest.send(`category=${category}`)
  }

  const { body } = await superagentRequest

  return body
}

module.exports = function () {
  const app = this

  app.use(/^(\/auth)?\/files/, filemanagerMiddleware(fileManagerConfig))

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

  app.post(/(\/auth)?\/sso-login/, async (req, res, next) => {
    try {
      const accessToken = req.body.accessToken

      const { body: { user } } = await superagent.post(process.env.SSO_VERIFY_TOKEN_URL).send({ accessToken })

      const localAccessToken = await getLocalToken(app, user.userId)

      res.json({ localAccessToken })
    } catch (e) {
      return next(e)
    }
  })

  app.get(/(\/auth)?\/set-cookie/, verifyToken(app), async (req, res, next) => {
    try {
      const accessToken = req.headers.authorization.replace(bearerRegexp, '') || req.cookies.jwt

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

  app.post(/(\/auth)?\/discussion\/post\/message/, verifyToken(app), async (req, res, next) => {
    try {
      const { raw, title } = req.body

      const result = await postDiscourseMessage(raw, title)

      res.json(result)
    } catch (e) {
      return next(`Error posting message to Discourse ${e.message}`)
    }
  })

  app.post(/(\/auth)?\/discussion\/post\/event/, verifyToken(app), async (req, res, next) => {
    try {
      const { raw, title } = req.body

      const result = await postDiscourseMessage(raw, title, 'Logs')

      res.json(result)
    } catch (e) {
      return next(`Error posting event to Discourse ${e.message}`)
    }
  })

  app.post(/(\/auth)?\/generate-data-report/, verifyToken(app), async (req, res, next) => {
    try {
      await superagent.post(`http://data-reporting/generate-report`)

      res.json({ status: 'ok' })
    } catch (e) {
      return next(`Error generating data report ${e.message}`)
    }
  })

  app.post(/(\/auth)?\/sync-1up-data/, verifyToken(app), async (req, res, next) => {
    try {
      await superagent.post(`http://1up/sync-data`)

      res.json({ status: 'ok' })
    } catch (e) {
      return next(`Error syncing 1up data ${e.message}`)
    }
  })
}
