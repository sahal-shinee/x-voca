const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/schedule.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// GET /api/schedules - Get all schedules (public)
router.get('/', scheduleController.getSchedules);

// GET /api/schedules/next - Get next upcoming schedule (public)
router.get('/next', scheduleController.getNextSchedule);

// GET /api/schedules/:id - Get schedule by ID (public)
router.get('/:id', scheduleController.getScheduleById);

// POST /api/schedules - Create new schedule (protected)
router.post('/', authMiddleware, scheduleController.createSchedule);

// PATCH /api/schedules/:id - Update schedule (protected)
router.patch('/:id', authMiddleware, scheduleController.updateSchedule);

// DELETE /api/schedules/:id - Delete schedule (protected)
router.delete('/:id', authMiddleware, scheduleController.deleteSchedule);

module.exports = router;
