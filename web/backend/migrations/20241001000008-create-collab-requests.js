'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('collab_requests', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      viewer_identifier: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'fingerprint or IP address'
      },
      requested_streamer_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'nama streamer yang di-request'
      },
      requested_streamer_social: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'link sosial media streamer'
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'pesan opsional dari viewer'
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'expired'),
        defaultValue: 'pending'
      },
      reviewed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      review_notes: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('collab_requests', ['status'], { name: 'idx_status' });
    await queryInterface.addIndex('collab_requests', ['period_key'], { name: 'idx_period' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('collab_requests');
  }
};

