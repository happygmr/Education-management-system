const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    gradeId: {
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
    assessment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment',
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    grade: {
        type: String
    },
    remarks: {
        type: String
    },
    gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Grade', gradeSchema); 