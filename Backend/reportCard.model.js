const mongoose = require('mongoose');

const reportCardSchema = new mongoose.Schema({
    reportCardId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    term: {
        type: String,
        enum: ['1st', '2nd', '3rd'],
        required: true
    },
    session: {
        type: String,
        required: true
    },
    grades: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Grade'
    }],
    remarks: {
        type: String
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    generatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ReportCard', reportCardSchema); 