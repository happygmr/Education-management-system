const express = require('express');
const router = express.Router();
const Class = require('../class.model');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware);

// Create a new class (Admin only)
router.post('/', roleMiddleware('admin'), async (req, res) => {
    try {
        const newClass = new Class(req.body);
        await newClass.save();
        res.status(201).json(newClass);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all classes (All authenticated users)
router.get('/', async (req, res) => {
    try {
        const classes = await Class.find()
            .populate('teacher')
            .populate('subjects')
            .populate({
                path: 'students',
                select: 'firstName lastName admissionNumber' // Only basic student info
            });
        res.json(classes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single class with detailed information
router.get('/:id', async (req, res) => {
    try {
        const classData = await Class.findById(req.params.id)
            .populate('teacher')
            .populate('subjects')
            .populate({
                path: 'students',
                select: 'firstName lastName admissionNumber email'
            });

        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }

        // If user is not admin or teacher of this class, restrict some information
        const userRoles = req.user.roles.map(r => r.name);
        const isAuthorized = userRoles.includes('admin') || 
                           (userRoles.includes('teacher') && 
                            classData.teacher._id.toString() === req.user.id);

        if (!isAuthorized) {
            // Remove sensitive information for non-authorized users
            classData.students = classData.students.map(student => ({
                firstName: student.firstName,
                lastName: student.lastName,
                admissionNumber: student.admissionNumber
            }));
        }

        res.json(classData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a class (Admin only)
router.put('/:id', roleMiddleware('admin'), async (req, res) => {
    try {
        const classData = await Class.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }
        res.json(classData);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a class (Admin only)
router.delete('/:id', roleMiddleware('admin'), async (req, res) => {
    try {
        const classData = await Class.findByIdAndDelete(req.params.id);
        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }
        res.json({ message: 'Class deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add student to class (Admin only)
router.post('/:id/students', roleMiddleware('admin'), async (req, res) => {
    try {
        const classData = await Class.findById(req.params.id);
        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }

        const { studentId } = req.body;
        if (!studentId) {
            return res.status(400).json({ error: 'Student ID is required' });
        }

        if (classData.students.includes(studentId)) {
            return res.status(400).json({ error: 'Student already in class' });
        }

        classData.students.push(studentId);
        await classData.save();
        res.json(classData);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Remove student from class (Admin only)
router.delete('/:id/students/:studentId', roleMiddleware('admin'), async (req, res) => {
    try {
        const classData = await Class.findById(req.params.id);
        if (!classData) {
            return res.status(404).json({ error: 'Class not found' });
        }

        const studentIndex = classData.students.indexOf(req.params.studentId);
        if (studentIndex === -1) {
            return res.status(404).json({ error: 'Student not found in class' });
        }

        classData.students.splice(studentIndex, 1);
        await classData.save();
        res.json(classData);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router; 