'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Using future dates for upcoming schedules
    const now = new Date();
    const sept27 = new Date('2026-09-27T20:00:00');
    const sept28_1 = new Date('2026-09-28T19:30:00');
    const sept28_2 = new Date('2026-09-28T21:00:00');

    await queryInterface.bulkInsert('schedules', [
      {
        user_id: 1,
        title: 'Cyberpunk 2077 Night Stream',
        game_category: 'Cyberpunk 2077',
        scheduled_at: sept27,
        description: 'Night city adventures with viewers!',
        youtube_url: null,
        thumbnail_url: null,
        stream_platform: 'YouTube',
        countdown_enabled: true,
        status: 'upcoming',
        created_at: now,
        updated_at: now
      },
      {
        user_id: 1,
        title: 'Minecraft Chill Stream – Mega Build Project',
        game_category: 'Minecraft',
        scheduled_at: sept28_1,
        description: 'Building the Regalia Sanctuary continues',
        youtube_url: null,
        thumbnail_url: null,
        stream_platform: 'YouTube',
        countdown_enabled: true,
        status: 'upcoming',
        created_at: now,
        updated_at: now
      },
      {
        user_id: 1,
        title: 'Genshin Impact Live – New Region Pulls',
        game_category: 'Genshin Impact',
        scheduled_at: sept28_2,
        description: 'Exploring the new region with community',
        youtube_url: null,
        thumbnail_url: null,
        stream_platform: 'YouTube',
        countdown_enabled: true,
        status: 'upcoming',
        created_at: now,
        updated_at: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('schedules', null, {});
  }
};
