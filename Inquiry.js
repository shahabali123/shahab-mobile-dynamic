const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String, required: true },
    messages: [{
        sender: { type: String, enum: ['customer', 'admin'] },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    status: { type: String, default: 'Pending', enum: ['Pending', 'Resolved'] },
    isReadByCustomer: { type: Boolean, default: true },
    isReadByAdmin: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);