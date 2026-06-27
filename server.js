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

// Disable Mongoose buffering: Agar connection nahi hai toh queries wait nahi karengi
// Vercel par isay false rakhna behtar hai taake timeout errors jaldi milain
mongoose.set('bufferCommands', false);

// Log the MONGO_URI to Vercel logs for verification (only first 50 chars for security)
console.log('Attempting to connect to MongoDB with URI (first 50 chars):', process.env.MONGO_URI.substring(0, 50) + '...');

// 0. MongoDB Connection
// Isay ek variable mein save kar letay hain taake middleware mein await kiya ja sakay
let dbPromise = mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Keep this for initial connection attempts
    connectTimeoutMS: 10000, // Keep this for initial connection attempts
});

// Handle initial connection success/failure for logging
dbPromise.then(() => {
    console.log('✅ Initial MongoDB connection promise resolved.');
}).catch(err => {
    console.error('❌ Initial MongoDB connection promise rejected:', err.message);
    // No process.exit(1) here, let the Vercel export function handle it for each request
});

// Mongoose connection events for robustness (optional, but good for debugging)
mongoose.connection.on('connected', () => console.log('MongoDB connection established.'));
mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err));
mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected!'));

// This function will ensure connection is ready for each request.
// It will be called inside the exported serverless function.
async function ensureDbConnection() { await dbPromise; }

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
    // Basic locals available on every request
    res.locals.activePath = req.path;
    res.locals.admin = req.session.admin || null;
    res.locals.customer = req.session.customer || null;
    res.locals.cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;

    try {
        // Fetch global site settings for ALL requests
        const settings = await SiteSetting.findOne({ key: 'main' }).lean();
        res.locals.settings = settings || { heroBrandName: "SHAHAB MOBILE", logo: 'logo-placeholder.png' }; // Use a placeholder
    } catch (err) {
        console.error("⚠️ Global Settings Middleware Error:", err.message);
        // Fallback defaults in case of DB error
        res.locals.settings = { heroBrandName: "SHAHAB MOBILE", logo: 'logo-placeholder.png' };
    }

    // Sirf Admin routes ke liye extra data fetch karein
    if (req.path.startsWith('/admin')) {
        try {
            // Admin-specific data
            res.locals.pendingOrdersCount = await Order.countDocuments({ status: 'Pending' });
            res.locals.pendingInquiriesCount = await Inquiry.countDocuments({ status: 'Pending' });

        } catch (err) {
            console.error("⚠️ Admin Settings Middleware Error:", err.message);
            // Fallback defaults for admin-specific data
            res.locals.pendingOrdersCount = 0;
            res.locals.pendingInquiriesCount = 0;
        }
    }

    // Customer ke liye unread messages count fetch karein
    if (req.session.customer) {
        try {
            res.locals.unreadInquiriesCount = await Inquiry.countDocuments({ userId: req.session.customer._id, isReadByCustomer: false }); // No .lean() needed here
        } catch (err) {
            console.error("⚠️ Unread Inquiries Middleware Error:", err.message);
            res.locals.unreadInquiriesCount = 0;
        }
    }
    
    next();
});

// 1. EJS View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname)); // Absolute path lookup for Vercel

// 2. Use Modular Routes (Pehle routes check honge)
app.use('/', productRoutes);

// 3. Static Files Middleware (Routes ke baad)
app.use(express.static(path.resolve(__dirname)));

// 5. Global 500 Error Handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    console.error('🔥 Detailed Server Error:', err.message);
    console.error(err.stack);
    
    // Ab generic message ke bajaye asal error message screen par ayega
    res.status(500).send(`
        <div style="padding: 20px; font-family: sans-serif; line-height: 1.6;">
            <h1 style="color: #e11d48; margin-bottom: 10px;">Server Error (500)</h1>
            <p><strong>Message:</strong> ${err.message}</p>
            <p><strong>Debugging Tip:</strong> Vercel dashboard par ja kar 'Logs' tab check karein. Wahan aapko is error ki mazeed tafseelat milengi.</p>
            <hr>
            <p style="font-size: 12px; color: #64748b;">Shahab Mobile Debugging Mode</p>
        </div>
    `);
});

// 4. 404 Error Handler (Keep this after all routes and middleware)
app.use((req, res, next) => {
    res.status(404).render('404', { // Assuming you have a 404.ejs file
        title: "404 - Page Not Found"
    });
});

// 6. Export for Vercel (Must be the last thing, and handle connection)
let cachedApp = null;

module.exports = async (req, res) => {
    // On cold start, or if app not cached, initialize
    if (!cachedApp) {
        console.log('Vercel Cold Start: Initializing app and ensuring DB connection...');
        try {
            await ensureDbConnection(); // Ensure DB connection is ready
            cachedApp = app; // Cache the Express app instance
            console.log('Vercel Cold Start: App initialized and DB connected.');
        } catch (error) {
            console.error('Vercel Cold Start Error during DB connection:', error);
            res.status(500).send('Server initialization failed due to database connection error.');
            return;
        }
    }
    // Use the cached app to handle the request
    return cachedApp(req, res);
};