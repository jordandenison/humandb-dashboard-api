const superagent = require('superagent') //
const uuid = require('uuid/v4')

const { verifyJWT } = require('lib/authentication')
const sso = require('lib/sso')

const bearerRegexp = /^bearer /i

const discourseHostname = process.env.DISCOURSE_HOSTNAME
const discourseApiKey = process.env.DISCOURSE_ADMIN_API_KEY
const discourseApiUsername = process.env.DISCOURSE_ADMIN_USERNAME

module.exports = {
  init: app => {
    app.get(/(\/auth)?\/discourse\/sso/, async (req, res, next) => {
      try {
        const { sso: payload, sig } = req.query

        if (!sso.verifyPayload(payload, sig)) {
          return res.status(401).send({ error: 'Discourse sso payload and/or signature invalid' })
        }

        const nonce = sso.getNonce(payload)
        const value = uuid()

        await app.service('tempToken').create({
          nonce,
          value,
          type: 'discourse_sso'
        })

        res.redirect(`https://${req.headers.host}/login?discourseSSOTempToken=${value}`)
      } catch (e) {
        console.log(`Discourse sso error ${e.message}`)
        return next(e)
      }
    })

    app.post(/(\/auth)?\/discourse\/redirect/, async (req, res) => {
      try {
        const accessToken = req.headers.authorization.replace(bearerRegexp, '') || req.cookies.jwt
        const secret = app.get('authentication').secret

        const jwt = await verifyJWT(accessToken, secret)
        const { discourseSSOTempToken } = req.body

        const { data } = await app.service('tempToken').find({ query: { value: discourseSSOTempToken } })
        const [tempToken] = data

        if (!tempToken) {
          return res.status(401).send({ error: 'Temporary token invalid' })
        }

        const user = await app.service('user').get(jwt.userId)

        const path = sso.getRedirectString(tempToken.nonce, user.id, user.email)

        res.json({ path })
      } catch (e) {
        console.log(`Discourse redirect error ${e.message}`)
        return res.status(401).send({ error: `JWT invalid: ${e.message}` })
      }
    })

    app.post(/(\/auth)?\/discourse\/logout/, async (req, res) => {
      try {
        const accessToken = req.headers.authorization.replace(bearerRegexp, '') || req.cookies.jwt
        const secret = app.get('authentication').secret

        const { userId } = await verifyJWT(accessToken, secret)

        const response = await superagent.post(`https://${discourseHostname}/discussion/users/by-external/${userId}.json?api_key=${discourseApiKey}&api_username=${discourseApiUsername}`)

        const discourseUserId = response.body.user.id

        await superagent.post(`https://${discourseHostname}/admin/users/${discourseUserId}/log_out?api_key=${discourseApiKey}&api_username=${discourseApiUsername}`)

        res.json({ status: 'ok' })
      } catch (e) {
        console.log(`Discourse logout error ${e.message}`)
        return res.status(401).send({ error: `Error logging out: ${e.message}` })
      }
    })
  }
}
