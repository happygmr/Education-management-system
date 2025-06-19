const mongoose = require('mongoose');

const gradeScaleSchema = new mongoose.Schema({
    gradeScaleId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    minScore: {
        type: Number,
        required: true
    },
    maxScore: {
        type: Number,
        required: true
    },
    grade: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('GradeScale', gradeScaleSchema); 