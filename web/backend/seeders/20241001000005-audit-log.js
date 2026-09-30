'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('audit_logs', [
      {
        action_type: 'vote_in',
        detail: '58 vote baru ditambahkan',
        sub_detail: 'Outer Wilds: Echoes of the Eye',
        created_at: new Date()
      },
      {
        action_type: 'schedule_updated',
        detail: 'Siaran diset ke LIVE NOW',
        sub_detail: 'Signalis: Solitary Resonance · Slot 21:00 UTC+7',
        created_at: new Date()
      },
      {
        action_type: 'game_requested',
        detail: 'Viewer #1042 mengajukan usulan baru',
        sub_detail: 'Silent Hill 2 Remake',
        created_at: new Date()
      },
      {
        action_type: 'asset_archived',
        detail: 'VOD Night 14 berhasil diekspor',
        sub_detail: 'Ghost in the Shell Soundscape Archive 4K',
        created_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('audit_logs', null, {});
  }
};
