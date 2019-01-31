const compress = require('compression')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const feathers = require('@feathersjs/feathers')
const express = require('@feathersjs/express')
const configuration = require('@feathersjs/configuration')
const rest = require('@feathersjs/express/rest')
const socketio = require('@feathersjs/socketio')

const handler = require('@feathersjs/express/errors')
const notFound = require('feathers-errors/not-found')

const middleware = require('./middleware')
const services = require('./services')
const appHooks = require(`./app.hooks`)
const authentication = require('./authentication')
const sequelize = require('./sequelize')

const app = express(feathers())

sequelize(app).then(() => app.configure(services))

app.configure(configuration())

app.use(cors())
app.use(helmet())
app.use(compress())
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.configure(rest())
app.configure(socketio({ path: '/auth/socket.io' }))

app.configure(middleware)
app.configure(authentication)

app.get(/(\/auth)?\/health/, (req, res) => res.send('OK'))

app.get('/robots.txt', (req, res) => {
  res.type('text/plain')
  res.send(`User-agent: *\nDisallow:${process.env.ROBOTS_INDEX === 'true' ? '' : ' /'}\n`)
})

app.use(notFound())
app.use(handler())

app.hooks(appHooks)

module.exports = app
