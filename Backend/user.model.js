const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    }],
    fullName: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Cascade delete related documents when a user is deleted
userSchema.pre('findOneAndDelete', async function(next) {
    const userId = this.getQuery()['_id'];
    await Promise.all([
        mongoose.model('Teacher').deleteMany({ user: userId }),
        mongoose.model('Message').deleteMany({ sender: userId }),
        mongoose.model('ActivityLog').deleteMany({ user: userId }),
        mongoose.model('ReportCard').deleteMany({ generatedBy: userId })
    ]);
    next();
});

module.exports = mongoose.model('User', userSchema); 