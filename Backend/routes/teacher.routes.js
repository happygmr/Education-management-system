const express = require('express');
const router = express.Router();
const Teacher = require('../teacher.model');
const User = require('../user.model');
const Role = require('../role.model');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// Protect all routes with authentication
router.use(authMiddleware);

// Create a new teacher and corresponding user account (Admin only)
router.post('/', roleMiddleware('admin'), async (req, res) => {
    const { firstName, lastName, email, password, employeeNumber, hireDate, subjects, classes } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        // Find the 'teacher' role
        const teacherRole = await Role.findOne({ name: 'teacher' }).session(session);
        if (!teacherRole) {
            throw new Error('Teacher role not found');
        }

        // Create a new user for the teacher
        const newUser = new User({
            firstName,
            lastName,
            email,
            password, // In a real app, this should be handled more securely
            roles: [teacherRole._id],
        });
        const savedUser = await newUser.save({ session });

        // Create the new teacher
        const newTeacher = new Teacher({
            user: savedUser._id,
            employeeNumber,
            hireDate,
            subjects,
            classes,
            // Automatically generate teacherId for now
            teacherId: `TCH_${Date.now()}` 
        });
        await newTeacher.save({ session });
        
        await session.commitTransaction();
        res.status(201).json(newTeacher);

    } catch (err) {
        await session.abortTransaction();
        res.status(400).json({ error: err.message });
    } finally {
        session.endSession();
    }
});

// Get all teachers (Admin and Teachers) with search/filter
router.get('/', roleMiddleware('admin', 'teacher'), async (req, res) => {
    try {
        const { name, employeeId, subject, qualification } = req.query;
        let query = {};
        if (name) {
            // Search in the user's fullName field
            query['user.fullName'] = { $regex: name, $options: 'i' };
        }
        if (employeeId) query.employeeNumber = employeeId;
        if (subject) query.subjects = subject;
        if (qualification) query.qualifications = qualification;
        const teachers = await Teacher.find(query)
            .populate('user')
            .populate('subjects')
            .populate('classes');
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single teacher
router.get('/:id', async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id)
            .populate('user')
            .populate('subjects')
            .populate('classes');
        
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        // Allow access if user is admin or the teacher themselves
        const userRoles = req.user.roles.map(r => r.name);
        const isAuthorized = userRoles.includes('admin') || 
                           teacher.user && teacher.user._id.toString() === req.user.id;
        
        if (!isAuthorized) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(teacher);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a teacher (Admin or the teacher themselves)
router.put('/:id', async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        // Check if user is admin or the teacher themselves
        const userRoles = req.user.roles.map(r => r.name);
        const isAuthorized = userRoles.includes('admin') || 
                           teacher._id.toString() === req.user.id;
        
        if (!isAuthorized) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // If not admin, restrict which fields can be updated
        if (!userRoles.includes('admin')) {
            const allowedUpdates = ['email', 'phone', 'address'];
            const updates = Object.keys(req.body);
            const isValidOperation = updates.every(update => allowedUpdates.includes(update));
            
            if (!isValidOperation) {
                return res.status(400).json({ error: 'Invalid updates' });
            }
        }

        Object.assign(teacher, req.body);
        await teacher.save();
        res.json(teacher);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a teacher (Admin only)
router.delete('/:id', roleMiddleware('admin'), async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndDelete(req.params.id);
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        res.json({ message: 'Teacher deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router; 