const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

// Hash a password
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

// Compare a password with a hash
async function comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
}

// Generate a JWT token
function generateJWT(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify a JWT token
function verifyJWT(token) {
    return jwt.verify(token, JWT_SECRET);
}

module.exports = {
    hashPassword,
    comparePassword,
    generateJWT,
    verifyJWT
}; 