const { Client } = require('pg')

const NODE_ENV = process.env.NODE_ENV

if (NODE_ENV === 'production') {
  throw new Error('Test cleanup script should not be run in production')
}

const host = process.env.POSTGRES_HOST
const port = process.env.POSTGRES_PORT
const database = process.env.POSTGRES_DB
const user = process.env.POSTGRES_USER
const password = process.env.POSTGRES_PASSWORD

const connectionString = `postgres://${user}:${password}@${host}:${port}/postgres`

const client = new Client({ connectionString })

client.connect()

client.query(`DROP DATABASE IF EXISTS "${database}-test"`, (err, res) => client.end()) // eslint-disable-line
