'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('content_guides', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      game_tag: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      youtube_url: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      thumbnail_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      video_count: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1
      },
      total_duration: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      content_type: {
        type: Sequelize.ENUM('video', 'playlist'),
        allowNull: false,
        defaultValue: 'playlist'
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      is_visible: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
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

    await queryInterface.addIndex('content_guides', ['is_visible']);
    await queryInterface.addIndex('content_guides', ['is_featured']);
    await queryInterface.addIndex('content_guides', ['sort_order']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('content_guides');
  }
};
