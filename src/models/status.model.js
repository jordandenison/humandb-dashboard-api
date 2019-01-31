const Sequelize = require('sequelize')

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient')
  const status = sequelizeClient.define('status', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    },
    service: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    dependency: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    description: Sequelize.TEXT,
    status: Sequelize.STRING(30),
    error: Sequelize.TEXT,
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  }, {
    hooks: {
      beforeCount (options) {
        options.raw = true
      }
    }
  })

  return status
}
