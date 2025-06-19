const mongoose = require('mongoose');

const roomAssignmentSchema = new mongoose.Schema({
    roomAssignmentId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    hostel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel',
        required: true
    },
    roomNumber: {
        type: String,
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    bedNumber: {
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

module.exports = mongoose.model('RoomAssignment', roomAssignmentSchema); 