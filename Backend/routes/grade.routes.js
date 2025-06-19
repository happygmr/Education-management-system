const express = require('express');
const router = express.Router();
const Grade = require('../grade.model');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware);

// Create a new grade (Admin and Teachers)
router.post('/', roleMiddleware('admin', 'teacher'), async (req, res) => {
    try {
        const grade = new Grade({
            ...req.body,
            createdBy: req.user.id
        });
        await grade.save();
        res.status(201).json(grade);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all grades (filtered by role)
router.get('/', async (req, res) => {
    try {
        let query = {};
        const userRoles = req.user.roles.map(r => r.name);

        // If teacher, only show grades for their subjects/classes
        if (userRoles.includes('teacher') && !userRoles.includes('admin')) {
            query.$or = [
                { createdBy: req.user.id },
                { 'subject.teacher': req.user.id }
            ];
        }
        // If student, only show their grades
        else if (userRoles.includes('student')) {
            query.student = req.user.id;
        }
        // If guardian, only show their ward's grades
        else if (userRoles.includes('guardian')) {
            query.student = { $in: req.user.wards };
        }

        const grades = await Grade.find(query)
            .populate('student', 'firstName lastName admissionNumber')
            .populate('subject', 'name code')
            .populate('class', 'name grade section')
            .populate('createdBy', 'firstName lastName');

        res.json(grades);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single grade
router.get('/:id', async (req, res) => {
    try {
        const grade = await Grade.findById(req.params.id)
            .populate('student', 'firstName lastName admissionNumber')
            .populate('subject', 'name code')
            .populate('class', 'name grade section')
            .populate('createdBy', 'firstName lastName');

        if (!grade) {
            return res.status(404).json({ error: 'Grade not found' });
        }

        const userRoles = req.user.roles.map(r => r.name);
        
        // Check authorization
        const isAdmin = userRoles.includes('admin');
        const isCreator = grade.createdBy._id.toString() === req.user.id;
        const isTeacherOfSubject = userRoles.includes('teacher') && 
                                  grade.subject.teacher.toString() === req.user.id;
        const isStudent = userRoles.includes('student') && 
                         grade.student._id.toString() === req.user.id;
        const isGuardian = userRoles.includes('guardian') && 
                          req.user.wards.includes(grade.student._id.toString());

        if (!isAdmin && !isCreator && !isTeacherOfSubject && !isStudent && !isGuardian) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(grade);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a grade (Admin and Creator only)
router.put('/:id', async (req, res) => {
    try {
        const grade = await Grade.findById(req.params.id);
        if (!grade) {
            return res.status(404).json({ error: 'Grade not found' });
        }

        // Check if user is admin or creator
        const userRoles = req.user.roles.map(r => r.name);
        const isAuthorized = userRoles.includes('admin') || 
                           grade.createdBy.toString() === req.user.id;

        if (!isAuthorized) {
            return res.status(403).json({ error: 'Access denied' });
        }

        Object.assign(grade, req.body);
        await grade.save();
        res.json(grade);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a grade (Admin and Creator only)
router.delete('/:id', async (req, res) => {
    try {
        const grade = await Grade.findById(req.params.id);
        if (!grade) {
            return res.status(404).json({ error: 'Grade not found' });
        }

        // Check if user is admin or creator
        const userRoles = req.user.roles.map(r => r.name);
        const isAuthorized = userRoles.includes('admin') || 
                           grade.createdBy.toString() === req.user.id;

        if (!isAuthorized) {
            return res.status(403).json({ error: 'Access denied' });
        }

        await grade.remove();
        res.json({ message: 'Grade deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get grades by student ID (Admin, Teachers, Student themselves, and their Guardians)
router.get('/student/:studentId', async (req, res) => {
    try {
        const userRoles = req.user.roles.map(r => r.name);
        
        // Check authorization
        const isAdmin = userRoles.includes('admin');
        const isTeacher = userRoles.includes('teacher');
        const isStudent = userRoles.includes('student') && req.params.studentId === req.user.id;
        const isGuardian = userRoles.includes('guardian') && 
                          req.user.wards.includes(req.params.studentId);

        if (!isAdmin && !isTeacher && !isStudent && !isGuardian) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const grades = await Grade.find({ student: req.params.studentId })
            .populate('subject', 'name code')
            .populate('class', 'name grade section')
            .populate('createdBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.json(grades);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get grades by subject ID (Admin and Teachers)
router.get('/subject/:subjectId', roleMiddleware('admin', 'teacher'), async (req, res) => {
    try {
        const grades = await Grade.find({ subject: req.params.subjectId })
            .populate('student', 'firstName lastName admissionNumber')
            .populate('class', 'name grade section')
            .populate('createdBy', 'firstName lastName')
            .sort({ 'student.firstName': 1 });

        // If teacher, only show grades for their subjects
        if (!req.user.roles.includes('admin')) {
            const subject = await Subject.findById(req.params.subjectId);
            if (!subject || !subject.teachers.includes(req.user.id)) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        res.json(grades);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; 