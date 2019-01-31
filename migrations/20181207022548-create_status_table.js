'use strict'

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('status', {
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
      indexes: [ { unique: true, fields: ['service', 'dependency'] } ]
    }),

  down: (queryInterface, Sequelize) => queryInterface.dropTable('status')
}
