'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        name: 'Xion Regalia',
        email: 'xionregalia@gmail.com',
        password_hash: '$2b$12$Zrdq3tVZOS5nvGU1fX/tX.bG9zKiRqg8dK1ppF7EHQq3CjzThJACK',
        role: 'superadmin',
        avatar_url: null,
        rig_name: 'Obsidian Rig #03',
        rig_version: 'v3.4',
        is_broadcasting: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
