const Sequelize = require('sequelize')

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient')
  const user = sequelizeClient.define('user', {
    id: {
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4
    },
    firstName: Sequelize.STRING(60),
    lastName: Sequelize.STRING(60),
    email: {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true
    },
    role: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'advisor',
      validate: {
        is: /^(owner|navigator|advisor|internal)$/
      }
    },
    password: Sequelize.STRING(255),
    lastLoginDate: Sequelize.DATE,
    addressLine1: Sequelize.STRING(120),
    addressLine2: Sequelize.STRING(120),
    city: Sequelize.STRING(60),
    postal: Sequelize.STRING(10),
    state: Sequelize.STRING(60),
    stateCode: Sequelize.STRING(3),
    country: Sequelize.STRING(60),
    countryCode: Sequelize.STRING(3),
    oneUpAccessToken: Sequelize.STRING(100),
    oneUpRefreshToken: Sequelize.STRING(100),
    oneUpClientId: Sequelize.STRING(100),
    createdAt: Sequelize.DATE,
    updatedAt: Sequelize.DATE
  }, {
    hooks: {
      beforeCount (options) {
        options.raw = true
      }
    }
  })

  return user
}
