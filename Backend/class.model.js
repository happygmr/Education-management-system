const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    classId: {
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
    section: {
        type: String
    },
    classTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }]
}, {
    timestamps: true
});

// Cascade delete related documents when a class is deleted
classSchema.pre('findOneAndDelete', async function(next) {
    const classId = this.getQuery()['_id'];
    await Promise.all([
        mongoose.model('Student').deleteMany({ class: classId }),
        mongoose.model('ClassSubject').deleteMany({ class: classId }),
        mongoose.model('ReportCard').deleteMany({ class: classId })
    ]);
    next();
});

classSchema.index({ classId: 1 });

module.exports = mongoose.model('Class', classSchema); 