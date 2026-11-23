const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const { authMiddleware, adminOnly } = require('../middleware/auth.middleware');

// GET /api/schedules - Get all schedules (public)
router.get('/', scheduleController.getSchedules);

// GET /api/schedules/next - Get next upcoming schedule (public)
router.get('/next', scheduleController.getNextSchedule);

// GET /api/schedules/:id - Get schedule by ID (public)
router.get('/:id', scheduleController.getScheduleById);

// POST /api/schedules - Create new schedule (admin only)
router.post('/', authMiddleware, adminOnly, scheduleController.createSchedule);

// PATCH /api/schedules/:id - Update schedule (admin only)
router.patch('/:id', authMiddleware, adminOnly, scheduleController.updateSchedule);
router.put('/:id', authMiddleware, adminOnly, scheduleController.updateSchedule);

// DELETE /api/schedules/:id - Delete schedule (admin only)
router.delete('/:id', authMiddleware, adminOnly, scheduleController.deleteSchedule);

module.exports = router;
