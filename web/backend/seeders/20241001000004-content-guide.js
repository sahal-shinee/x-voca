'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('content_guides', [
      {
        user_id: 1,
        title: 'Elden Ring: Shadow of the Erdtree — Ekspedisi Gerbang Sunyi',
        game_tag: 'Elden Ring',
        youtube_url: 'https://youtube.com/playlist?list=example1',
        thumbnail_url: null,
        video_count: 14,
        total_duration: '48.5 Jam',
        content_type: 'playlist',
        is_featured: true,
        is_visible: true,
        sort_order: 1,
        created_at: now,
        updated_at: now
      },
      {
        user_id: 1,
        title: 'Signalis: Solitary Resonance — Full Story Arc',
        game_tag: 'Signalis',
        youtube_url: 'https://youtube.com/playlist?list=example2',
        thumbnail_url: null,
        video_count: 6,
        total_duration: '19 Jam',
        content_type: 'playlist',
        is_featured: false,
        is_visible: true,
        sort_order: 2,
        created_at: now,
        updated_at: now
      },
      {
        user_id: 1,
        title: 'Midnight Tea & Fan Letters: Season 2',
        game_tag: 'Chat/Zatsu',
        youtube_url: 'https://youtube.com/playlist?list=example3',
        thumbnail_url: null,
        video_count: 21,
        total_duration: '52 Jam',
        content_type: 'playlist',
        is_featured: false,
        is_visible: true,
        sort_order: 3,
        created_at: now,
        updated_at: now
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('content_guides', null, {});
  }
};
