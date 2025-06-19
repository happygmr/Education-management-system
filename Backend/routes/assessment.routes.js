const express = require('express');
const router = express.Router();
const Assessment = require('../assessment.model');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware);

// Create a new assessment (Admin and Teachers)
router.post('/', roleMiddleware('admin', 'teacher'), async (req, res) => {
    try {
        const assessment = new Assessment({
            ...req.body,
            createdBy: req.user.id
        });
        await assessment.save();
        res.status(201).json(assessment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all assessments (filtered by role)
router.get('/', async (req, res) => {
    try {
        let query = {};
        const userRoles = req.user.roles.map(r => r.name);

        // If teacher, only show their assessments and assessments for their classes
        if (userRoles.includes('teacher') && !userRoles.includes('admin')) {
            query.$or = [
                { createdBy: req.user.id },
                { 'class.teacher': req.user.id }
            ];
        }
        // If student, only show their assessments
        else if (userRoles.includes('student')) {
            query['students.student'] = req.user.id;
        }
        // If guardian, only show their ward's assessments
        else if (userRoles.includes('guardian')) {
            // Assuming guardian model has a wards field with student IDs
            query['students.student'] = { $in: req.user.wards };
        }

        const assessments = await Assessment.find(query)
            .populate('subject', 'name code')
            .populate('class', 'name grade section')
            .populate('createdBy', 'firstName lastName')
            .populate('students.student', 'firstName lastName admissionNumber');

        res.json(assessments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single assessment
router.get('/:id', async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id)
            .populate('subject', 'name code')
            .populate('class', 'name grade section')
            .populate('createdBy', 'firstName lastName')
            .populate('students.student', 'firstName lastName admissionNumber');

        if (!assessment) {
            return res.status(404).json({ error: 'Assessment not found' });
        }

        const userRoles = req.user.roles.map(r => r.name);
        
        // Check authorization
        const isAdmin = userRoles.includes('admin');
        const isCreator = assessment.createdBy._id.toString() === req.user.id;
        const isTeacherOfClass = userRoles.includes('teacher') && 
                                assessment.class.teacher.toString() === req.user.id;
        const isStudent = userRoles.includes('student') && 
                         assessment.students.some(s => s.student._id.toString() === req.user.id);
        const isGuardian = userRoles.includes('guardian') && 
                          assessment.students.some(s => req.user.wards.includes(s.student._id.toString()));

        if (!isAdmin && !isCreator && !isTeacherOfClass && !isStudent && !isGuardian) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // If student or guardian, only show their relevant scores
        if (isStudent || isGuardian) {
            const relevantStudentIds = isStudent ? [req.user.id] : req.user.wards;
            assessment.students = assessment.students.filter(s => 
                relevantStudentIds.includes(s.student._id.toString())
            );
        }

        res.json(assessment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update an assessment (Admin and Creator only)
router.put('/:id', async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id);
        if (!assessment) {
            return res.status(404).json({ error: 'Assessment not found' });
        }

        // Check if user is admin or creator
        const userRoles = req.user.roles.map(r => r.name);
        const isAuthorized = userRoles.includes('admin') || 
                           assessment.createdBy.toString() === req.user.id;

        if (!isAuthorized) {
            return res.status(403).json({ error: 'Access denied' });
        }

        Object.assign(assessment, req.body);
        await assessment.save();
        res.json(assessment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete an assessment (Admin and Creator only)
router.delete('/:id', async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id);
        if (!assessment) {
            return res.status(404).json({ error: 'Assessment not found' });
        }

        // Check if user is admin or creator
        const userRoles = req.user.roles.map(r => r.name);
        const isAuthorized = userRoles.includes('admin') || 
                           assessment.createdBy.toString() === req.user.id;

        if (!isAuthorized) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await assessment.remove();
        res.json({ message: 'Assessment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add or update student scores (Admin and Teachers only)
router.post('/:id/scores', roleMiddleware('admin', 'teacher'), async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id);
        if (!assessment) {
            return res.status(404).json({ error: 'Assessment not found' });
        }

        // Check if teacher is authorized for this class
        if (!req.user.roles.includes('admin')) {
            const isTeacherOfClass = assessment.class.teacher.toString() === req.user.id;
            if (!isTeacherOfClass) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        const { studentScores } = req.body;
        if (!Array.isArray(studentScores)) {
            return res.status(400).json({ error: 'Student scores must be an array' });
        }

        // Update or add new scores
        studentScores.forEach(score => {
            const studentIndex = assessment.students.findIndex(
                s => s.student.toString() === score.studentId
            );

            if (studentIndex === -1) {
                assessment.students.push({
                    student: score.studentId,
                    score: score.score,
                    feedback: score.feedback
                });
            } else {
                assessment.students[studentIndex].score = score.score;
                assessment.students[studentIndex].feedback = score.feedback;
            }
        });

        await assessment.save();
        res.json(assessment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router; 