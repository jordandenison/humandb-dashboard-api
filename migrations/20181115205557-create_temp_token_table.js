'use strict'

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('temp_token', {
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
      indexes: [ { unique: true, fields: ['value'] } ]
    }),

  down: (queryInterface, Sequelize) => queryInterface.dropTable('temp_token')
}
