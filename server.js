require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const session = require('express-session');
const path = require('path');
const SiteSetting = require('./SiteSetting');
const Order = require('./Order');
const Inquiry = require('./Inquiry');
const productRoutes = require('./productRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Critical Environment Variables Check
if (!process.env.MONGO_URI) {
    console.error('❌ FATAL ERROR: MONGO_URI is not defined in Environment Variables.');
}
if (!process.env.SESSION_SECRET) {
    console.warn('⚠️ WARNING: SESSION_SECRET is not defined. Using default key.');
}

// Cloudinary Configuration Verification
if (!process.env.CLOUDINARY_API_KEY) {
    console.error('❌ Cloudinary keys missing in .env file!');
}

// 0. MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // 5 seconds mein connect na ho toh fail karein
    connectTimeoutMS: 10000,
})
    .then(() => {
        console.log('✅ Successfully connected to MongoDB Atlas');
    })
    .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// Local Development ke liye listen (Vercel isay ignore karega)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 Local Server: http://localhost:${PORT}`));
}

// Global Cloudinary Base URL helper for EJS (Using your cloud name: dl8elynnw)
// Also pass cloud name to client-side for app.js
app.locals.cloudinaryBase = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/`;

// Middleware to parse form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'shahab_mobile_secure_key_123', // Use env var, fallback for local dev
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days validity
}));

// Global Settings Middleware
app.use(async (req, res, next) => {
    try {
        // Fallback defaults in case DB is not ready
        res.locals.settings = { heroBrandName: "SHAHAB MOBILE", logo: 'logo' };
        res.locals.pendingOrdersCount = 0;
        res.locals.pendingInquiriesCount = 0;
        res.locals.unreadInquiriesCount = 0;
        res.locals.activePath = req.path;
        res.locals.admin = req.session.admin || null;
        res.locals.customer = req.session.customer || null;
        res.locals.cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;

        // Database checks (Only if connected)
        if (mongoose.connection.readyState === 1) {
            // Track visits (upsert used to avoid crashes)
            const isAsset = req.path.includes('.') || req.path.startsWith('/admin') || req.path.startsWith('/login');
            if (!isAsset && req.method === 'GET') {
                await SiteSetting.updateOne({ key: 'main' }, { $inc: { siteVisits: 1 } }, { upsert: true });
            }

            let settings = await SiteSetting.findOne({ key: 'main' });
            if (settings) res.locals.settings = settings;
            
            res.locals.pendingOrdersCount = await Order.countDocuments({ status: 'Pending' });
            res.locals.pendingInquiriesCount = await Inquiry.countDocuments({ status: 'Pending' });
            
            if (req.session.customer) {
                res.locals.unreadInquiriesCount = await Inquiry.countDocuments({ 
                    userId: req.session.customer._id, 
                    isReadByCustomer: false 
                });
            }
        }
        
        next();
    } catch (err) {
        console.error("⚠️ Settings Middleware Error:", err.message);
        next(); // Move forward even if settings fail
    }
});

// 1. EJS View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './')); // Ensure path resolution for Vercel

// 2. Static Files Middleware
app.use(express.static(path.join(__dirname, './')));

// 3. Use Modular Routes
app.use('/', productRoutes);

// 4. Export for Vercel
module.exports = app;

// 4. 404 Error Handler (Keep this after all routes)
app.use((req, res, next) => {
    res.status(404).render('index', {
        products: [], 
        brands: [],
        selectedBrand: '',
        title: "404 - Not Found",
        currentPage: 1,
        totalPages: 0,
        baseUrl: '/'
    });
});

// 5. Global 500 Error Handler
app.use((err, req, res, next) => {
    console.error('🔥 Detailed Server Error:', err);
    // Ab generic message ke bajaye asal error message screen par ayega
    res.status(500).send(`
        <div style="padding: 20px; font-family: sans-serif; line-height: 1.6;">
            <h1 style="color: #e11d48;">Server Error (500)</h1>
            <p><strong>Message:</strong> ${err.message}</p>
            <p><strong>Note:</strong> Agar ye error 'MONGO_URI' ya 'buffering timed out' se mutalliq hai, toh check karein ke MongoDB Atlas mein Network Access (0.0.0.0/0) enabled hai ya nahi.</p>
            <hr>
            <p style="font-size: 12px; color: #64748b;">Shahab Mobile Debugging Mode</p>
        </div>
    `);
});