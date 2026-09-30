'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('games', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      genre: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      publisher: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      cover_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      vote_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('requested', 'accepted', 'playing', 'done'),
        allowNull: false,
        defaultValue: 'requested'
      },
      added_by: {
        type: Sequelize.ENUM('viewer', 'creator'),
        allowNull: false,
        defaultValue: 'viewer'
      },
      requester_info: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      period_key: {
        type: Sequelize.STRING(7),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('games', ['status']);
    await queryInterface.addIndex('games', ['period_key']);
    await queryInterface.addIndex('games', ['vote_count']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('games');
  }
};
