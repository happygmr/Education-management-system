const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    teacherId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    employeeNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    }],
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }],
    hireDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Cascade delete related documents when a teacher is deleted
teacherSchema.pre('findOneAndDelete', async function(next) {
    const teacherId = this.getQuery()['_id'];
    await Promise.all([
        mongoose.model('ClassSubject').deleteMany({ teacher: teacherId })
    ]);
    next();
});

teacherSchema.index({ teacherId: 1 });
teacherSchema.index({ employeeNumber: 1 });

module.exports = mongoose.model('Teacher', teacherSchema); 