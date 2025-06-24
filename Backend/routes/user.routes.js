const express = require('express');
const router = express.Router();
const User = require('../user.model');
const { hashPassword } = require('../utils/auth');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Protect sensitive routes with authentication and admin role
router.use(authMiddleware);

// Create a new user
router.post('/', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a user
router.put('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a user
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Activate a user (Admin only)
router.put('/:id/activate', roleMiddleware('admin'), async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User activated', user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Deactivate a user (Admin only)
router.put('/:id/deactivate', roleMiddleware('admin'), async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deactivated', user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Reset a user's password (Admin only)
router.put('/:id/reset-password', roleMiddleware('admin'), async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }
        const hashed = await hashPassword(newPassword);
        const user = await User.findByIdAndUpdate(req.params.id, { password: hashed }, { new: true });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'Password reset successfully', user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router; 