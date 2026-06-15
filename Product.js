const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    images: [String],
    specs: {
        ram: String,
        storage: String,
        battery: String
    },
    stock: { type: Number, default: 0 },
    freeDelivery: { type: Boolean, default: false },
    installment: { type: Boolean, default: false },
    installmentText: String,
    badge: {
        text: String,
        color: String
    },
    views: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);