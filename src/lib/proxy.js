const configuration = require('@feathersjs/configuration')
const { verify } = require('jsonwebtoken')
const express = require('express')
const httpProxy = require('http-proxy')
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

const handler = (proxy, target) => async (req, res) => {
  delete req.headers['authorization']

  proxy.web(req, res, { target, changeOrigin: true, ws: true })
}

module.exports = target => {
  const router = express.Router()
  const proxy = httpProxy.createProxyServer()

  router.use(verifyJWT, handler(proxy, target))

  return router
}
