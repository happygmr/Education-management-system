const mongoose = require('mongoose');

const guardianSchema = new mongoose.Schema({
    guardianId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    relationship: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    address: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Guardian', guardianSchema); 