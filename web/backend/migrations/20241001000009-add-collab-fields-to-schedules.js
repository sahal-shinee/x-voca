'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('schedules', 'collab_guest', {
      type: Sequelize.STRING(200),
      allowNull: true,
      after: 'description'
    });
    await queryInterface.addColumn('schedules', 'collab_social', {
      type: Sequelize.STRING(500),
      allowNull: true,
      after: 'collab_guest'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('schedules', 'collab_social');
    await queryInterface.removeColumn('schedules', 'collab_guest');
  }
};

