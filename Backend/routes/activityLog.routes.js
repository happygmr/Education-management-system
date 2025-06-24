const express = require('express');
const router = express.Router();
const ActivityLog = require('../activityLog.model');
const User = require('../user.model');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Protect all routes with authentication and admin role
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

// List activity logs with optional filters (user, action, date)
router.get('/', async (req, res) => {
  try {
    const { user, action, dateFrom, dateTo, limit = 50, skip = 0 } = req.query;
    let query = {};
    if (user) query.user = user;
    if (action) query.action = { $regex: action, $options: 'i' };
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    const logs = await ActivityLog.find(query)
      .populate('user', 'username fullName email')
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single activity log by ID
router.get('/:id', async (req, res) => {
  try {
    const log = await ActivityLog.findById(req.params.id).populate('user', 'username fullName email');
    if (!log) return res.status(404).json({ error: 'Log not found' });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 