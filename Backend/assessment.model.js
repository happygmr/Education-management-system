const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
    assessmentId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    maxScore: {
        type: Number,
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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Assessment', assessmentSchema); 