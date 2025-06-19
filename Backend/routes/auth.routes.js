const express = require('express');
const router = express.Router();
const User = require('../user.model');
const Role = require('../role.model');
const { hashPassword, comparePassword, generateJWT } = require('../utils/auth');

// Helper to get role by name
async function getRoleByName(roleName) {
    let role = await Role.findOne({ name: roleName });
    if (!role) {
        role = await Role.create({ name: roleName });
    }
    return role;
}

// Register endpoint (for all roles)
router.post('/register/:role', async (req, res) => {
    try {
        const { username, email, password, fullName } = req.body;
        const { role } = req.params;
        const roleDoc = await getRoleByName(role);
        if (!roleDoc) return res.status(400).json({ error: 'Invalid role' });
        const hashedPassword = await hashPassword(password);
        const user = new User({
            username,
            email,
            password: hashedPassword,
            fullName,
            roles: [roleDoc._id]
        });
        await user.save();
        res.status(201).json({ message: `${role} registered successfully` });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login endpoint (for all roles)
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username }).populate('roles');
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
        const token = generateJWT({ id: user._id, roles: user.roles.map(r => r.name) });
        res.json({ token, user: { id: user._id, username: user.username, roles: user.roles.map(r => r.name) } });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router; 