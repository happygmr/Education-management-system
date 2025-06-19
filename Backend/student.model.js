const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String
    },
    address: {
        type: String
    },
    email: {
        type: String,
        unique: true,
        sparse: true
    },
    phone: {
        type: String
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    guardians: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guardian'
    }],
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    admission_number: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    photo_url: {
        type: String
    },
    medical_info: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Cascade delete related documents when a student is deleted
studentSchema.pre('findOneAndDelete', async function(next) {
    const studentId = this.getQuery()['_id'];
    const mongoose = require('mongoose');
    await Promise.all([
        mongoose.model('Grade').deleteMany({ student: studentId }),
        mongoose.model('Attendance').deleteMany({ student: studentId }),
        mongoose.model('Invoice').deleteMany({ student: studentId }),
        mongoose.model('Payment').deleteMany({ student: studentId }),
        mongoose.model('BusAssignment').deleteMany({ student: studentId }),
        mongoose.model('RoomAssignment').deleteMany({ student: studentId }),
        mongoose.model('ReportCard').deleteMany({ student: studentId })
    ]);
    next();
});

studentSchema.index({ studentId: 1 });
studentSchema.index({ admission_number: 1 });

module.exports = mongoose.model('Student', studentSchema); 