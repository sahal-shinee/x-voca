'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('votes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      game_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'games',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: false
      },
      fingerprint: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      period_key: {
        type: Sequelize.STRING(7),
        allowNull: false
      },
      voted_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('votes', ['game_id', 'ip_address', 'period_key'], { unique: true });
    await queryInterface.addIndex('votes', ['game_id', 'fingerprint', 'period_key'], { unique: true });
    await queryInterface.addIndex('votes', ['period_key']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('votes');
  }
};
