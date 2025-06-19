const mongoose = require('mongoose');

const classSubjectSchema = new mongoose.Schema({
    classSubjectId: {
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
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ClassSubject', classSubjectSchema); 