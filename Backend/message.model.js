const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    messageId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    subject: {
        type: String
    },
    body: {
        type: String,
        required: true
    },
    sentAt: {
        type: Date,
        default: Date.now
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    type: {
        type: String,
        enum: ['Notification', 'Message', 'Alert'],
        default: 'Message'
    },
    attachments: [{
        type: String
    }],
    status: {
        type: String,
        enum: ['Sent', 'Delivered', 'Read'],
        default: 'Sent'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', messageSchema); 