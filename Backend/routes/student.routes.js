const express = require('express');
const router = express.Router();
const Student = require('../student.model');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware);

// Create a new student (Admin only)
router.post('/', roleMiddleware('admin'), async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json(student);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all students (Admin and Teachers)
router.get('/', roleMiddleware('admin', 'teacher'), async (req, res) => {
    try {
        const students = await Student.find()
            .populate('class')
            .populate('guardians');
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single student
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('class')
            .populate('guardians');
        
        // Check permissions
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        // Allow access if user is admin, teacher, the student themselves, or their guardian
        const userRoles = req.user.roles.map(r => r.name);
        const isAuthorized = userRoles.includes('admin') || 
                           userRoles.includes('teacher') ||
                           student._id.toString() === req.user.id ||
                           student.guardians.some(g => g._id.toString() === req.user.id);
        
        if (!isAuthorized) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(student);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a student (Admin only)
router.put('/:id', roleMiddleware('admin'), async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a student (Admin only)
router.delete('/:id', roleMiddleware('admin'), async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; 