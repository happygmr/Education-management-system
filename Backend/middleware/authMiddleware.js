const jwt = require('jsonwebtoken');
const User = require('../user.model');
const Role = require('../role.model');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Middleware to verify JWT and attach user to request
async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = await User.findById(decoded.id).populate('roles');
        if (!req.user) return res.status(401).json({ error: 'User not found' });
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// Middleware for role-based access control
function roleMiddleware(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const userRoles = req.user.roles.map(role => role.name);

        // Super admin check
        if (userRoles.includes('admin')) {
            return next();
        }

        const hasRole = allowedRoles.some(role => userRoles.includes(role));
        if (!hasRole) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
}

module.exports = { authMiddleware, roleMiddleware }; 