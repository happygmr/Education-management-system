const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    busId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    numberPlate: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    model: {
        type: String
    },
    capacity: {
        type: Number,
        required: true
    },
    driverName: {
        type: String
    },
    driverPhone: {
        type: String
    },
    route: {
        type: String
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Maintenance'],
        default: 'Active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Bus', busSchema); 