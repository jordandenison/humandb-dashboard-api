const Sequelize = require('sequelize')

module.exports = async app => {
  const host = process.env.POSTGRES_HOST
  const port = process.env.POSTGRES_PORT
  const database = process.env.POSTGRES_DB
  const user = process.env.POSTGRES_USER
  const password = process.env.POSTGRES_PASSWORD

  const connectionString = `postgres://${user}:${password}@${host}:${port}/${database}`

  const sequelize = new Sequelize(connectionString, {
    dialect: 'postgres',
    logging: false,
    define: { freezeTableName: true }
  })

  app.set('sequelizeClient', sequelize)
}
