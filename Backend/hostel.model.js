const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
    hostelId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    location: {
        type: String
    },
    capacity: {
        type: Number,
        required: true
    },
    wardenName: {
        type: String
    },
    wardenPhone: {
        type: String
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Maintenance'],
        default: 'Active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Hostel', hostelSchema); 