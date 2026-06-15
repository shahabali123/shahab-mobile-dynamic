const express = require('express');
const router = express.Router();
const productController = require('./productController'); // Controller root mein hai
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Image Upload Setup
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'shahab_mobile_products',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif']
    }
});
const upload = multer({ storage: storage });

// Mapping URLs to Controller functions
router.get('/', productController.getHomePage);
router.get('/product/:id', productController.getProductDetail);
router.get('/offers', productController.getOffers);
router.get('/installments', productController.getInstallments);

// Checkout & Tracking Routes
router.get('/checkout', productController.getCheckout);
router.post('/place-order', productController.postPlaceOrder);
router.get('/track-order/:id', productController.getTrackOrder);
router.get('/api/track-order/:id', productController.getOrderStatusAPI);

// Customer Auth Routes
router.get('/register', productController.getRegister);
router.post('/register', productController.postRegister);
router.get('/login-customer', productController.getCustomerLogin);
router.post('/login-customer', productController.postCustomerLogin);
router.get('/profile', productController.getProfile);
router.get('/logout-customer', productController.logoutCustomer);
router.post('/profile/order/cancel/:id', productController.postCancelOrderCustomer);
router.get('/order/invoice/:id', productController.getInvoice);

// Chat System Routes
// Middleware to check if customer is logged in
const isCustomer = (req, res, next) => {
    if (req.session.customer) return next();
    res.redirect(`/login-customer?returnTo=${encodeURIComponent(req.originalUrl)}`);
};

router.get('/chat', isCustomer, productController.getChatPage);
router.get('/chat/:id', isCustomer, productController.getChatThread);
router.post('/chat/send', isCustomer, productController.postInquiry);
// API for real-time chat updates
router.get('/api/chat/messages/:id', isCustomer, productController.getInquiryMessages);
router.get('/api/admin/chat/messages/:userId', productController.isAdmin, productController.getAdminChatMessages);
router.post('/contact/mark-read', isCustomer, productController.postMarkInquiriesRead);

// Login/Logout Routes
router.get('/login', productController.getLogin);
router.post('/login', productController.postLogin);
router.get('/logout', productController.logout);

// Admin Dashboard Routes
router.use('/admin', productController.isAdmin); // Protect all /admin routes
router.get('/admin', productController.getAdminDashboard);
router.get('/admin/add', productController.getAddProduct);
router.post('/admin/add', upload.array('images', 5), productController.postAddProduct);
router.get('/admin/edit/:id', productController.getEditProduct);
router.post('/admin/edit/:id', upload.array('images', 5), productController.postEditProduct);
router.post('/admin/delete/:id', productController.postDeleteProduct);
router.get('/admin/settings', productController.getSettings);
router.post('/admin/settings', upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'heroImage', maxCount: 1 }]), productController.postSettings);
router.get('/admin/orders', productController.getAdminOrders);
router.get('/api/admin/orders', productController.isAdmin, productController.getAdminOrdersAPI);
router.post('/admin/order/update-status', productController.postUpdateOrderStatus);
router.post('/admin/order/delete/:id', productController.postDeleteOrder);
router.get('/admin/queries', productController.getAdminQueries);
router.get('/admin/chat/:userId', productController.getAdminChat);
router.post('/admin/query/respond', productController.postQueryResponse);
router.post('/admin/query/delete/:id', productController.postDeleteQuery);

module.exports = router;