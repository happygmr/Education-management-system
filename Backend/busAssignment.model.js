const mongoose = require('mongoose');

const busAssignmentSchema = new mongoose.Schema({
    busAssignmentId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    bus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    pickupLocation: {
        type: String
    },
    dropoffLocation: {
        type: String
    },
    assignedDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    remarks: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BusAssignment', busAssignmentSchema); 