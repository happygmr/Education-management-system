const mongoose = require('mongoose');

const feeCategorySchema = new mongoose.Schema({
    feeCategoryId: {
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
    },
    amount: {
        type: Number,
        required: true
    },
    isRecurring: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FeeCategory', feeCategorySchema); 