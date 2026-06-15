const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String, required: true },
    items: [{
        productId: Number,
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    totalAmount: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Packed', 'Ready for Delivery', 'Out for Delivery', 'Shipped', 'Cancelled'], 
        default: 'Pending'
    },
    createdAt: { type: Date, default: Date.now },
    cancelledByCustomer: { type: Boolean, default: false } // New field to track customer cancellations
});

module.exports = mongoose.model('Order', orderSchema);