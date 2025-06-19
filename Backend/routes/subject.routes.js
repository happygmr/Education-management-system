const express = require('express');
const router = express.Router();
const Subject = require('../subject.model');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware);

// Create a new subject (Admin only)
router.post('/', roleMiddleware('admin'), async (req, res) => {
    try {
        const subject = new Subject(req.body);
        await subject.save();
        res.status(201).json(subject);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all subjects (All authenticated users)
router.get('/', async (req, res) => {
    try {
        const subjects = await Subject.find()
            .populate('teachers', 'firstName lastName email')
            .populate('classes', 'name grade section');
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single subject
router.get('/:id', async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id)
            .populate('teachers', 'firstName lastName email')
            .populate('classes', 'name grade section');

        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        // Check if user is admin or a teacher of this subject for detailed info
        const userRoles = req.user.roles.map(r => r.name);
        const isTeacherOfSubject = subject.teachers.some(
            teacher => teacher._id.toString() === req.user.id
        );

        if (!userRoles.includes('admin') && !isTeacherOfSubject) {
            // Remove sensitive information for non-authorized users
            subject.teachers = subject.teachers.map(teacher => ({
                firstName: teacher.firstName,
                lastName: teacher.lastName
            }));
        }

        res.json(subject);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a subject (Admin only)
router.put('/:id', roleMiddleware('admin'), async (req, res) => {
    try {
        const subject = await Subject.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        res.json(subject);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a subject (Admin only)
router.delete('/:id', roleMiddleware('admin'), async (req, res) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }
        res.json({ message: 'Subject deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Assign teacher to subject (Admin only)
router.post('/:id/teachers', roleMiddleware('admin'), async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        const { teacherId } = req.body;
        if (!teacherId) {
            return res.status(400).json({ error: 'Teacher ID is required' });
        }

        if (subject.teachers.includes(teacherId)) {
            return res.status(400).json({ error: 'Teacher already assigned to subject' });
        }

        subject.teachers.push(teacherId);
        await subject.save();
        res.json(subject);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Remove teacher from subject (Admin only)
router.delete('/:id/teachers/:teacherId', roleMiddleware('admin'), async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        const teacherIndex = subject.teachers.indexOf(req.params.teacherId);
        if (teacherIndex === -1) {
            return res.status(404).json({ error: 'Teacher not found in subject' });
        }

        subject.teachers.splice(teacherIndex, 1);
        await subject.save();
        res.json(subject);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Assign class to subject (Admin only)
router.post('/:id/classes', roleMiddleware('admin'), async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        const { classId } = req.body;
        if (!classId) {
            return res.status(400).json({ error: 'Class ID is required' });
        }

        if (subject.classes.includes(classId)) {
            return res.status(400).json({ error: 'Class already assigned to subject' });
        }

        subject.classes.push(classId);
        await subject.save();
        res.json(subject);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Remove class from subject (Admin only)
router.delete('/:id/classes/:classId', roleMiddleware('admin'), async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        const classIndex = subject.classes.indexOf(req.params.classId);
        if (classIndex === -1) {
            return res.status(404).json({ error: 'Class not found in subject' });
        }

        subject.classes.splice(classIndex, 1);
        await subject.save();
        res.json(subject);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router; 