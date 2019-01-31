const Sequelize = require('sequelize')

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient')
  const tempToken = sequelizeClient.define('temp_token', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    },
    type: Sequelize.STRING(60),
    value: {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true
    },
    nonce: Sequelize.STRING(255),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  }, {
    hooks: {
      beforeCount (options) {
        options.raw = true
      }
    }
  })

  return tempToken
}
