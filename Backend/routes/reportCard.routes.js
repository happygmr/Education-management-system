const express = require('express');
const router = express.Router();
const ReportCard = require('../reportCard.model');
const Student = require('../student.model');
const Class = require('../class.model');
const Grade = require('../grade.model');
const Subject = require('../subject.model');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// GET /api/report-cards/:studentId?term=1st&session=2023
router.get('/:studentId', authMiddleware, async (req, res) => {
  try {
    const { term, session } = req.query;
    if (!term || !session) {
      return res.status(400).json({ error: 'Term and session are required' });
    }
    // Fetch student and class
    const student = await Student.findById(req.params.studentId).populate('class');
    if (!student) return res.status(404).json({ error: 'Student not found' });
    // Fetch grades for this student, term, session
    const grades = await Grade.find({
      student: student._id,
      term,
      session
    })
      .populate('subject', 'name')
      .populate('class', 'name');
    if (!grades.length) return res.status(404).json({ error: 'No grades found for this term/session' });
    // Compute total, average, and build scores array
    const scores = grades.map(g => ({
      subject: g.subject,
      score: g.score,
      grade: g.grade,
      remark: g.remarks
    }));
    const total = grades.reduce((sum, g) => sum + (g.score || 0), 0);
    const average = grades.length ? (total / grades.length).toFixed(2) : 0;
    // Compute position in class (by average)
    const classmates = await Grade.aggregate([
      { $match: { class: student.class._id, term, session } },
      { $group: { _id: '$student', total: { $sum: '$score' }, count: { $sum: 1 } } },
      { $project: { _id: 1, avg: { $divide: ['$total', '$count'] } } },
      { $sort: { avg: -1 } }
    ]);
    let position = null;
    for (let i = 0; i < classmates.length; i++) {
      if (String(classmates[i]._id) === String(student._id)) {
        position = i + 1;
        break;
      }
    }
    // Optionally, fetch report card remarks
    const reportCard = await ReportCard.findOne({ student: student._id, class: student.class._id, term, session });
    res.json({
      student: {
        firstName: student.firstName,
        lastName: student.lastName,
        admissionNumber: student.admissionNumber
      },
      class: { name: student.class.name },
      term,
      session,
      scores,
      total,
      average,
      position,
      remarks: reportCard?.remarks || ''
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/report-cards/:studentId/remarks
router.put('/:studentId/remarks', authMiddleware, roleMiddleware('admin', 'teacher'), async (req, res) => {
  try {
    const { term, session, remarks } = req.body;
    if (!term || !session) {
      return res.status(400).json({ error: 'Term and session are required' });
    }
    // Fetch student and class
    const student = await Student.findById(req.params.studentId).populate('class');
    if (!student) return res.status(404).json({ error: 'Student not found' });
    // Find or create report card
    let reportCard = await ReportCard.findOne({ student: student._id, class: student.class._id, term, session });
    if (!reportCard) {
      reportCard = new ReportCard({
        reportCardId: `${student._id}-${term}-${session}`,
        student: student._id,
        class: student.class._id,
        term,
        session,
        remarks,
        generatedBy: req.user.id
      });
    } else {
      reportCard.remarks = remarks;
      reportCard.generatedBy = req.user.id;
      reportCard.generatedAt = new Date();
    }
    await reportCard.save();
    res.json({ success: true, remarks: reportCard.remarks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 