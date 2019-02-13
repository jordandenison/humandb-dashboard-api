const httpProxy = require('http-proxy-middleware')
const configuration = require('@feathersjs/configuration')
const { verify } = require('jsonwebtoken')
const express = require('express')
const basicAuth = require('basic-auth')

const bearerRegexp = /^bearer /i
const config = configuration()()

const verifyJWT = (req, res, next) => {
  const user = basicAuth(req)

  if ((!user || !user.pass) && !req.cookies.jwt) {
    return res.status(401).send('Invalid \'Athentication\' header or jwt cookie not present!')
  }

  const token = (user && user.pass && user.pass.replace(bearerRegexp, '')) || req.cookies.jwt

  try {
    verify(token, config.authentication.secret)

    return next()
  } catch (e) {
    console.error(`Error verifying proxy JWT ${e.message}`)
    return res.status(401).send('Unauthorized!')
  }
}

module.exports = target => {
  const router = express.Router()
  const proxyOptions = {
    target,
    changeOrigin: true,
    // ws: true, // Enabling this causes the main dashboard app ws connection to stop working after visiting the FHIR Server UI
    pathRewrite: {
      '^/auth/fhir(-stu[23]-ui)?(/stu[23])?': ''
    }
  }

  const proxy = httpProxy(proxyOptions)

  router.use(verifyJWT, proxy)

  return router
}
