'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('games', [
      {
        title: 'Elden Ring: Shadow of the Erdtree',
        genre: 'Action RPG',
        publisher: 'FromSoftware',
        cover_url: null,
        vote_count: 247,
        status: 'requested',
        added_by: 'viewer',
        requester_info: 'Viewer #1042',
        period_key: '2026-09',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Hollow Knight: Silksong',
        genre: 'Metroidvania',
        publisher: 'Team Cherry',
        cover_url: null,
        vote_count: 198,
        status: 'accepted',
        added_by: 'viewer',
        requester_info: 'Viewer #1056',
        period_key: '2026-09',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Minecraft: Regalia Sanctuary',
        genre: 'Sandbox',
        publisher: 'Mojang',
        cover_url: null,
        vote_count: 156,
        status: 'playing',
        added_by: 'creator',
        requester_info: null,
        period_key: '2026-09',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Silent Hill 2 Remake',
        genre: 'Atmospheric Horror',
        publisher: 'Bloober Team',
        cover_url: null,
        vote_count: 142,
        status: 'requested',
        added_by: 'viewer',
        requester_info: 'Viewer #1089',
        period_key: '2026-09',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        title: 'Subnautica: Void Depths',
        genre: 'Survival',
        publisher: 'Unknown Worlds',
        cover_url: null,
        vote_count: 95,
        status: 'done',
        added_by: 'creator',
        requester_info: null,
        period_key: '2026-09',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('games', null, {});
  }
};
