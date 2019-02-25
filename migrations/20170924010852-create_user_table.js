'use strict'

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('user', {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      firstName: Sequelize.STRING(60),
      lastName: Sequelize.STRING(60),
      email: {
        type: Sequelize.STRING(120),
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
      oneUpClientId: Sequelize.STRING(100),
      oneUpAccessToken: Sequelize.STRING(100),
      oneUpRefreshToken: Sequelize.STRING(100),
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    }, {
      indexes: [ { unique: true, fields: ['email'] } ]
    }),

  down: (queryInterface, Sequelize) => queryInterface.dropTable('user')
}
