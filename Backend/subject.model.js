const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    subjectId: {
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
    description: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema); 