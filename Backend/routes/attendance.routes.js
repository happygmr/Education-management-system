const express = require('express');
const router = express.Router();
const Attendance = require('../attendance.model');
const Student = require('../student.model');
const Class = require('../class.model');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware);

// Create attendance record (Admin, Teacher)
router.post('/', roleMiddleware('admin', 'teacher'), async (req, res) => {
  try {
    const { class: classId, date, records } = req.body;
    if (!classId || !date || !Array.isArray(records)) {
      return res.status(400).json({ error: 'class, date, and records are required' });
    }
    // Remove existing attendance for this class/date
    await Attendance.deleteMany({ class: classId, date });
    // Create new attendance records
    const attendance = await Attendance.create({ class: classId, date, records });
    res.status(201).json(attendance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get attendance records (Admin, Teacher, Student)
router.get('/', roleMiddleware('admin', 'teacher', 'student'), async (req, res) => {
  try {
    const { class: classId, date, student } = req.query;
    let query = {};
    if (classId) query.class = classId;
    if (date) query.date = date;
    if (student) query['records.student'] = student;
    const attendance = await Attendance.find(query)
      .populate('class', 'name')
      .populate('records.student', 'firstName lastName admissionNumber');
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get attendance for a specific class and date
router.get('/class/:classId/date/:date', roleMiddleware('admin', 'teacher'), async (req, res) => {
  try {
    const { classId, date } = req.params;
    const attendance = await Attendance.findOne({ class: classId, date })
      .populate('class', 'name')
      .populate('records.student', 'firstName lastName admissionNumber');
    if (!attendance) return res.status(404).json({ error: 'Attendance not found' });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update attendance record (Admin, Teacher)
router.put('/:id', roleMiddleware('admin', 'teacher'), async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!attendance) return res.status(404).json({ error: 'Attendance not found' });
    res.json(attendance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete attendance record (Admin only)
router.delete('/:id', roleMiddleware('admin'), async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) return res.status(404).json({ error: 'Attendance not found' });
    res.json({ message: 'Attendance deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 