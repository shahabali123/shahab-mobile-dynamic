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

// Cloudinary Configuration Verification
if (!process.env.CLOUDINARY_API_KEY) {
    console.error('❌ Cloudinary keys missing in .env file!');
}

// 0. MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
    })
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

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
    secret: 'shahab_mobile_secure_key_123',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 days validity
}));

// Global Settings Middleware
app.use(async (req, res, next) => {
    try {
        // Track visits (except admin and static files)
        const isAsset = req.path.includes('.') || req.path.startsWith('/admin') || req.path.startsWith('/login');
        if (!isAsset && req.method === 'GET') {
            await SiteSetting.updateOne({ key: 'main' }, { $inc: { siteVisits: 1 } });
        }

        let settings = await SiteSetting.findOne({ key: 'main' });
        if (!settings) {
            settings = new SiteSetting({
                key: 'main',
                logo: 'logo', // Cloudinary public ID or URL
                heroBadge: "Trusted in Mansehra",
                heroBrandName: "SHAHAB MOBILE",
                heroTitle: "Premium Devices. <br> Trusted Quality.",
                heroDescription: "Mansehra's leading destination for original Phones, Samsung, and top brands.",
                heroImage: "https://res.cloudinary.com/dl8elynnw/image/upload/f_auto,q_auto/logo",
                heroWatermark: "SHAHAB",
                heroPrimaryBtnText: "Explore Collection",
                heroPrimaryBtnLink: "#product-grid",
                heroSecondaryBtnText: "Latest Offers",
                heroSecondaryBtnLink: "/offers",
                heroInstallmentBtnText: "Easy Installments",
                heroInstallmentBtnLink: "/installments",
                // Default Installment Page Hero Text
                instHeroBadge: "Easy Payments",
                instHeroTitle: "Abhi Installment Pe Lein! 💳",
                instHeroDescription: "Itel, Infinix, aur Tecno ke latest mobiles ab asaan mahana qiston par available hain. Sirf 20% advance payment dein aur apna pasandida mobile ghar le jayein, 9 mahine ki asaan iqsaat par.",
                instHeroAdvanceText: "20% Advance Payment",
                instHeroPlanSummary: "3, 6 & 9 Months Plans"
            });
            await settings.save();
        }
        res.locals.settings = settings;
        res.locals.activePath = req.path;
        res.locals.admin = req.session.admin || null;
        
        // New Orders Notification logic (Count pending orders)
        res.locals.pendingOrdersCount = await Order.countDocuments({ status: 'Pending' });
        res.locals.pendingInquiriesCount = await Inquiry.countDocuments({ status: 'Pending' });
        
        // Customer Notifications
        res.locals.unreadInquiriesCount = req.session.customer 
            ? await Inquiry.countDocuments({ userId: req.session.customer._id, isReadByCustomer: false })
            : 0;

        res.locals.cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME; // Pass to EJS
        res.locals.customer = req.session.customer || null;
        next();
    } catch (err) {
        console.error("Settings Middleware Error:", err);
        next();
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
    console.error('🔥 Server Error:', err.stack);
    res.status(500).send('Kuch ghalat ho gaya hai! Hum jald theek kar lenge.');
});