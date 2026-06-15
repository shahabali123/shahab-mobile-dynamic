const Product = require('./Product'); // Model root mein hai
const SiteSetting = require('./SiteSetting');
const Order = require('./Order');
const User = require('./User');
const Admin = require('./Admin');
const Inquiry = require('./Inquiry');

const installmentConfig = {
    advancePercentage: 20,
    plans: [
        { months: 3, markup: 10 },
        { months: 6, markup: 20 },
        { months: 9, markup: 30 }
    ],
    planSummary: "3, 6 & 9 Months Plans",
    advanceText: "20% Advance Payment",
    bannerDescription: "Itel, Infinix, aur Tecno ke latest mobiles ab asaan mahana qiston par available hain. Sirf 20% advance payment dein aur apna pasandida mobile ghar le jayein, 9 mahine ki asaan iqsaat par."
};

// Home Page Logic
exports.getHomePage = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;

        const filter = {};
        // Brand Filter
        if (req.query.brand) filter.brand = req.query.brand;
        // RAM & Storage Filter
        if (req.query.ram) filter['specs.ram'] = req.query.ram;
        if (req.query.storage) filter['specs.storage'] = req.query.storage;
        // Price Range Filter
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = parseInt(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = parseInt(req.query.maxPrice);
        }

        // Sorting Logic
        let sortQuery = { _id: -1 }; // Default: Newest
        if (req.query.sort === 'low') sortQuery = { price: 1 };
        if (req.query.sort === 'high') sortQuery = { price: -1 };
        if (req.query.sort === 'popular') sortQuery = { views: -1 };

        const totalProducts = await Product.countDocuments(filter);
        const dbProducts = await Product.find(filter).sort(sortQuery).skip(skip).limit(limit);
        
        // Get dynamic filter values for the UI
        const brands = await Product.distinct('brand');
        const rams = await Product.distinct('specs.ram');
        const storages = await Product.distinct('specs.storage');

        res.render('index', { 
            products: dbProducts, 
            brands,
            rams,
            storages,
            selectedBrand: req.query.brand || '',
            selectedRam: req.query.ram || '',
            selectedStorage: req.query.storage || '',
            sort: req.query.sort || '',
            title: "Shahab Mobile - Home",
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            baseUrl: '/'
        });
    } catch (err) {
        console.error('Home Page Error:', err);
        next(err);
    }
};

// Product Detail Logic
exports.getProductDetail = async (req, res, next) => {
    try {
        const productId = parseInt(req.params.id);

        // Validate productId before using it in Mongoose query
        if (isNaN(productId)) {
            // If the ID is not a valid number, it's a bad request
            return res.status(400).send('Invalid Product ID provided.'); 
        }
        // Increment product views
        const product = await Product.findOneAndUpdate(
            { id: productId }, // Use the validated and parsed productId
            { $inc: { views: 1 } },
            { new: true }
        );
        if (!product) return res.status(404).send('Product Not Found');
        
        const relatedProducts = await Product.find({
            id: { $ne: product.id },
            $or: [{ brand: product.brand }, { "specs.ram": product.specs.ram }]
        }).limit(4);

        res.render('product-detail', { 
            product, 
            installmentConfig, 
            relatedProducts,
            title: `${product.name} | Shahab Mobile`
        });
    } catch (err) {
        console.error('Detail Page Error:', err);
        next(err);
    }
};

// Offers Page Logic
exports.getOffers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;

        const filter = { freeDelivery: true };
        if (req.query.brand) filter.brand = req.query.brand;

        const totalProducts = await Product.countDocuments(filter);
        const offerProducts = await Product.find(filter).skip(skip).limit(limit).sort({ _id: -1 });
        const brands = await Product.distinct('brand', { freeDelivery: true });

        res.render('offers', { 
            products: offerProducts,
            brands,
            title: "Latest Offers | Shahab Mobile",
            selectedBrand: req.query.brand || '',
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            baseUrl: '/offers'
        });
    } catch (err) {
        console.error('Offers Page Error:', err);
        next(err);
    }
};

// Installments Page Logic
exports.getInstallments = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 8;
        const skip = (page - 1) * limit;

        const filter = { installment: true };
        if (req.query.brand) filter.brand = req.query.brand;

        const totalProducts = await Product.countDocuments(filter);
        const installmentProducts = await Product.find(filter).skip(skip).limit(limit).sort({ _id: -1 });
        const brands = await Product.distinct('brand', { installment: true });

        res.render('installments', { 
            products: installmentProducts, 
            brands,
        title: "Installment Plans | Shahab Mobile",
            selectedBrand: req.query.brand || '',
            config: installmentConfig,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            baseUrl: '/installments'
        });
    } catch (err) {
        console.error('Installments Page Error:', err);
        next(err);
    }
};

// Admin Dashboard - List Products
exports.getAdminDashboard = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || "";
        const brand = req.query.brand || "";

        let query = {};
        if (search) query.name = { $regex: search, $options: "i" };
        if (brand) query.brand = brand;

        const totalProducts = await Product.countDocuments(query);
        const products = await Product.find(query).sort({ _id: -1 }).skip(skip).limit(limit);
        
        // For Analytics
        const topProducts = await Product.find().sort({ views: -1 }).limit(5);
        const brands = await Product.distinct('brand');
        const allProdsForStats = await Product.find();
        const users = await User.find().sort({ createdAt: -1 }); // Fetch all users

        const stats = {
            total: totalProducts,
            installments: allProdsForStats.filter(p => p.installment).length,
            totalValue: allProdsForStats.reduce((sum, p) => sum + p.price, 0),
            siteVisits: res.locals.settings.siteVisits || 0
        };

        res.render('admin-dashboard', { 
            products, 
            stats, 
            topProducts,
            users, // Pass users to dashboard
            brands,
            search,
            selectedBrand: brand,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            // Base URL with existing filters for pagination
            baseUrl: `/admin?search=${search}&brand=${brand}`,
            title: "Admin Dashboard" 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Dashboard Error");
    }
};

// Admin - Add Product Form
exports.getAddProduct = async (req, res) => {
    const brands = await Product.distinct('brand');
    res.render('admin-form', { product: null, brands, title: "Add New Product" });
};

// Admin - Create Product
exports.postAddProduct = async (req, res) => {
    try {
        const images = req.files ? req.files.map(file => file.path) : [];
        const lastProduct = await Product.findOne().sort({ id: -1 });
        const newId = lastProduct ? lastProduct.id + 1 : 1;

        let brandName = req.body.brand;
        if (brandName === 'other' && req.body.newBrand) {
            brandName = req.body.newBrand.trim();
        }

        const newProduct = new Product({
            ...req.body,
            id: newId,
            brand: brandName,
            images: images,
            price: parseInt(req.body.price),
            freeDelivery: req.body.freeDelivery === 'on',
            installment: req.body.installment === 'on',
            specs: {
                ram: req.body.ram,
                storage: req.body.storage,
                battery: req.body.battery
            }
        });

        await newProduct.save();
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding product");
    }
};

// Admin - Edit Product Form
exports.getEditProduct = async (req, res) => {
    const product = await Product.findOne({ id: req.params.id });
    const brands = await Product.distinct('brand');
    res.render('admin-form', { product, brands, title: "Edit Product" });
};

// Admin - Update Product
exports.postEditProduct = async (req, res) => {
    try {
        let brandName = req.body.brand;
        if (brandName === 'other' && req.body.newBrand) {
            brandName = req.body.newBrand.trim();
        }

        const updateData = {
            ...req.body,
            brand: brandName,
            price: parseInt(req.body.price),
            freeDelivery: req.body.freeDelivery === 'on',
            installment: req.body.installment === 'on',
            specs: {
                ram: req.body.ram,
                storage: req.body.storage,
                battery: req.body.battery
            }
        };

        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map(file => file.path);
        }

        await Product.findOneAndUpdate({ id: req.params.id }, updateData);
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send("Error updating product");
    }
};

// Admin - Delete Product
exports.postDeleteProduct = async (req, res) => {
    try {
        await Product.findOneAndDelete({ id: req.params.id });
        res.redirect('/admin');
    } catch (err) {
        res.status(500).send("Error deleting product");
    }
};

// Authentication Middleware
exports.isAdmin = (req, res, next) => {
    if (req.session.admin) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Login Page logic
exports.getLogin = (req, res) => {
    res.render('login', { title: "Login | Shahab Mobile", error: null });
};

// Handle Login POST
exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const searchEmail = email.toLowerCase().trim();
        
        console.log("🔍 Attempting Login for:", searchEmail);
        console.log("📁 Checking collection 'admins' in DB:", Admin.db.name);
        
        const admin = await Admin.findOne({ email: searchEmail });

        console.log("👤 Admin record found:", admin ? "YES" : "NO");

        if (admin && (await admin.comparePassword(password))) {
            console.log("✅ Password Matched!");
            req.session.admin = admin.email;
            res.redirect('/admin');
        } else {
            console.log("❌ Login Failed: User not found or Password incorrect");
            res.render('login', { 
                title: "Login | Shahab Mobile", 
                error: "Ghalat Email ya Password! Dobara koshish karein." 
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Login failure");
    }
};

// Handle Logout
exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};

// Site Settings Form
exports.getSettings = (req, res) => {
    res.render('admin-settings', { title: "Site Settings | Admin" });
};

// Update Site Settings
exports.postSettings = async (req, res) => {
    try {
        const updateData = { ...req.body };
        
        if (req.files['logo']) {
            updateData.logo = req.files['logo'][0].path;
        }
        if (req.files['heroImage']) {
            updateData.heroImage = req.files['heroImage'][0].path;
        }

        await SiteSetting.findOneAndUpdate({ key: 'main' }, updateData);
        res.redirect('/admin/settings');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating settings");
    }
};

// Checkout Page
exports.getCheckout = (req, res) => {
    res.render('checkout', { title: "Checkout | Shahab Mobile" });
};

// Place Order
exports.postPlaceOrder = async (req, res) => {
    try {
        const { customerName, customerPhone, customerAddress, cartData } = req.body;
        const items = JSON.parse(cartData);
        
        const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const newOrder = new Order({
            orderId,
            userId: req.session.customer ? req.session.customer._id : null,
            customerName,
            customerPhone,
            customerAddress,
            items,
            totalAmount
        });

        await newOrder.save();
        res.json({ success: true, orderId: orderId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Order placement failed" });
    }
};

// Customer Registration
exports.getRegister = (req, res) => {
    res.render('register', { title: "Create Account | Shahab Mobile", error: null });
};

exports.postRegister = async (req, res) => {
    try {
        const { fullName, email, password, phone, address } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.render('register', { title: "Register", error: "Email pehle se registered hai!" });

        const newUser = new User({ fullName, email, password, phone, address });
        await newUser.save();
        req.session.customer = newUser;
        res.redirect('/profile');
    } catch (err) {
        res.status(500).send("Registration failed");
    }
};

// Customer Login
exports.getCustomerLogin = (req, res) => {
    res.render('login-customer', { title: "Login | Shahab Mobile", error: null });
};

exports.postCustomerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.render('login-customer', { title: "Login", error: "Ghalat Email ya Password!" });
        }
        req.session.customer = user;
        const returnTo = req.query.returnTo || '/profile';
        res.redirect(returnTo);
    } catch (err) {
        res.status(500).send("Login failed");
    }
};

// Customer Profile & Order History
exports.getProfile = async (req, res) => {
    if (!req.session.customer) return res.redirect('/login-customer');
    try {
        const orders = await Order.find({ userId: req.session.customer._id }).sort({ createdAt: -1 });
        const inquiries = await Inquiry.find({ userId: req.session.customer._id }).sort({ updatedAt: -1 });
        
        // Mark as read when profile is opened
        await Inquiry.updateMany(
            { userId: req.session.customer._id, isReadByCustomer: false },
            { isReadByCustomer: true }
        );

        res.render('profile', { 
            title: "My Account | Shahab Mobile", 
            customer: req.session.customer,
            orders,
            inquiries
        });
    } catch (err) {
        res.status(500).send("Error loading profile");
    }
};

// Customer Logout
exports.logoutCustomer = (req, res) => {
    req.session.customer = null;
    res.redirect('/');
};

// Track Order View
exports.getTrackOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.id });
        if (!order) return res.status(404).send("Order not found");
        res.render('order-status', { order, title: "Track Order | Shahab Mobile" });
    } catch (err) {
        res.status(500).send("Tracking error");
    }
};

// Admin: Get All Orders
exports.getAdminOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).lean();
        
        // Images format karein orders ke items ke liye
        const formattedOrders = orders.map(order => ({
            ...order,
            items: order.items.map(item => ({
                ...item,
                displayImage: (item.images && item.images[0]) 
                    ? (item.images[0].startsWith('http') ? item.images[0] : `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${item.images[0].replace(/^\.\/|images\//g, '')}`)
                    : 'https://placehold.co/100x100?text=No+Image'
            }))
        }));

        res.render('admin-orders', { orders: formattedOrders, title: "Orders Management | Admin" });
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).send("Error fetching orders");
    }
};

// API: Get All Orders for Admin (Real-time polling)
exports.getAdminOrdersAPI = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).lean();
        const formattedOrders = orders.map(order => ({
            ...order,
            items: order.items.map(item => ({
                ...item,
                displayImage: (item.images && item.images[0]) 
                    ? (item.images[0].startsWith('http') ? item.images[0] : `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${item.images[0].replace(/^\.\/|images\//g, '')}`)
                    : 'https://placehold.co/100x100?text=No+Image'
            }))
        }));
        res.json({ success: true, orders: formattedOrders });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching orders" });
    }
};

// Admin: Delete Order
exports.postDeleteOrder = async (req, res) => {
    try {
        await Order.findOneAndDelete({ orderId: req.params.id });
        res.redirect('/admin/orders');
    } catch (err) {
        res.status(500).send("Error deleting order");
    }
};

// Admin: Update Order Status
exports.postUpdateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        await Order.findOneAndUpdate({ orderId }, { status });
        res.redirect('/admin/orders');
    } catch (err) {
        res.status(500).send("Status update failed");
    }
};

// Customer: Cancel Order (Only if Pending)
exports.postCancelOrderCustomer = async (req, res) => {
    if (!req.session.customer) return res.status(401).json({ success: false, message: "Aap ka session khatam ho chuka hai. Dubara login karein." });
    try {
        const order = await Order.findOne({ orderId: req.params.id, userId: req.session.customer._id });
        if (!order) return res.status(404).json({ success: false, message: "Order nahi mila." });

        // Cancellation allowed until 'Ready for Delivery'
        const allowedForCancellation = ['Pending', 'Packed', 'Ready for Delivery'];
        if (!allowedForCancellation.includes(order.status)) {
            return res.status(400).json({ 
                success: false, 
                message: "Maafi chahte hain! Order cancel nahi kiya ja sakta kyunke ye delivery ke liye nikal chuka hai ya status tabdeel ho chuka hai." 
            });
        }

        order.status = 'Cancelled';
        order.cancelledByCustomer = true; // Mark as cancelled by customer
        await order.save();
        res.json({ success: true, message: "Order kamyabi se cancel kar diya gaya hai." });
    } catch (err) {
        console.error("Order Cancellation Error:", err);
        res.status(500).json({ success: false, message: "Order cancel karne mein masla pesh aaya. Dobara koshish karein." });
    }
};

// API: Get single order status for tracking page
exports.getOrderStatusAPI = async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.id }).select('status orderId customerName items totalAmount createdAt').lean();
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error tracking order" });
    }
};

// Global: Get Invoice
exports.getInvoice = async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.id });
        if (!order) return res.status(404).send("Order not found");

        // Security check: Sirf Admin ya wahi customer jis ka order hai invoice dekh sakay
        const isAdmin = !!req.session.admin;
        const isOwner = req.session.customer && req.session.customer._id.toString() === order.userId?.toString();

        if (!isAdmin && !isOwner) {
            return res.status(403).send("Aap ko ye invoice dekhne ki ijazat nahi hai.");
        }

        res.render('invoice', { order, title: `Invoice - ${order.orderId}` });
    } catch (err) {
        res.status(500).send("Error generating invoice");
    }
};

// Customer: Chat List Page
exports.getChatPage = async (req, res) => {
    try {
        const userId = req.session.customer._id;
        const inquiries = await Inquiry.find({ userId }).sort({ updatedAt: -1 });
        
        res.render('chat', { 
            title: "My Support Chats | Shahab Mobile", 
            inquiries, 
            selectedChat: null
        });
    } catch (err) {
        res.status(500).send("Chat system loading failed");
    }
};

// Customer: View Specific Chat Thread
exports.getChatThread = async (req, res) => {
    try {
        const userId = req.session.customer._id;
        const inquiries = await Inquiry.find({ userId }).sort({ updatedAt: -1 });
        const selectedChat = await Inquiry.findOne({ _id: req.params.id, userId });

        if (!selectedChat) return res.redirect('/chat');

        // Mark as read by customer
        selectedChat.isReadByCustomer = true;
        await selectedChat.save();

        res.render('chat', { 
            title: `Chat: ${selectedChat.subject}`, 
            inquiries, 
            selectedChat
        });
    } catch (err) {
        res.status(500).send("Error loading chat");
    }
};

// Customer: Post Inquiry
exports.postInquiry = async (req, res) => {
    try {
        const { subject, message } = req.body;
        const userId = req.session.customer._id;

        // Aik hi subject pe chat continue karne ke liye check
        let inquiry = await Inquiry.findOne({ userId, subject, status: 'Pending' });

        if (inquiry) {
            inquiry.messages.push({ sender: 'customer', text: message });
            inquiry.isReadByAdmin = false;
            await inquiry.save();
        } else {
            inquiry = new Inquiry({
                userId,
                name: req.session.customer.fullName,
                email: req.session.customer.email,
                subject,
                messages: [{ sender: 'customer', text: message }],
                isReadByAdmin: false
            });
            await inquiry.save();
        }

        // Message bhejne ke baad usi chat thread par redirect karein
        res.redirect(`/chat/${inquiry._id}`);
    } catch (err) {
        res.status(500).send("Message send karne mein masla hua.");
    }
};

// Customer: Mark read
exports.postMarkInquiriesRead = async (req, res) => {
    try {
        await Inquiry.updateMany(
            { userId: req.session.customer._id, isReadByCustomer: false },
            { isReadByCustomer: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};

// API: Get messages for a specific inquiry (for real-time polling)
exports.getInquiryMessages = async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);
        if (!inquiry) return res.status(404).json({ success: false, message: "Inquiry not found" });
        
        // Security check: Ensure customer owns this inquiry
        if (req.session.customer && inquiry.userId.toString() !== req.session.customer._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized access" });
        }
        res.json({ success: true, messages: inquiry.messages });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching messages" });
    }
};

// Admin: Get All Inquiries
exports.getAdminQueries = async (req, res) => {
    try {
        // Fetch all users who have sent inquiries
        const usersWithChats = await Inquiry.find().distinct('userId');
        const users = await User.find({ _id: { $in: usersWithChats } }).lean();
        
        // Har user ki latest inquiry fetch karein status ke liye
        const userList = await Promise.all(users.map(async (u) => {
            const latestInquiry = await Inquiry.findOne({ userId: u._id }).sort({ updatedAt: -1 });
            return {
                ...u,
                latestInquiry
            };
        }));

        // Sort: Pehle unread (isReadByAdmin: false) phir latest update
        userList.sort((a, b) => (b.latestInquiry?.updatedAt || 0) - (a.latestInquiry?.updatedAt || 0));
        userList.sort((a, b) => (a.latestInquiry?.isReadByAdmin === b.latestInquiry?.isReadByAdmin) ? 0 : a.latestInquiry?.isReadByAdmin ? 1 : -1);

        res.render('admin-queries', { userList, title: "Inbox | Admin", selectedUser: null, chat: [] });
    } catch (err) {
        res.status(500).send("Inbox fetch karne mein masla hua.");
    }
};

// Admin: Get Chat for Specific User
exports.getAdminChat = async (req, res) => {
    try {
        const userId = req.params.userId;
        const usersWithChats = await Inquiry.find().distinct('userId');
        const users = await User.find({ _id: { $in: usersWithChats } }).lean();
        
        const userList = await Promise.all(users.map(async (u) => {
            const latestInquiry = await Inquiry.findOne({ userId: u._id }).sort({ updatedAt: -1 });
            return { ...u, latestInquiry };
        }));

        userList.sort((a, b) => (b.latestInquiry?.updatedAt || 0) - (a.latestInquiry?.updatedAt || 0));
        userList.sort((a, b) => (a.latestInquiry?.isReadByAdmin === b.latestInquiry?.isReadByAdmin) ? 0 : a.latestInquiry?.isReadByAdmin ? 1 : -1);

        const selectedUser = await User.findById(userId);
        const chat = await Inquiry.find({ userId }).sort({ createdAt: 1 });

        // Mark messages as read by admin
        await Inquiry.updateMany({ userId, isReadByAdmin: false }, { isReadByAdmin: true });

        res.render('admin-queries', { userList, selectedUser, chat, title: `Chat with ${selectedUser.fullName}` });
    } catch (err) {
        res.status(500).send("Chat fetch failed");
    }
};

// API: Get messages for a specific user (for admin real-time polling)
exports.getAdminChatMessages = async (req, res) => {
    try {
        const userId = req.params.userId;
        const chat = await Inquiry.find({ userId }).sort({ createdAt: 1 });
        res.json({ success: true, chat });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching admin chat messages" });
    }
};



// Admin: Respond/Update Query Status
exports.postQueryResponse = async (req, res) => {
    try {
        const { inquiryId, adminResponse } = req.body;
        const inquiry = await Inquiry.findById(inquiryId);
        
        inquiry.messages.push({ sender: 'admin', text: adminResponse });
        inquiry.isReadByCustomer = false; // Trigger notification for customer
        inquiry.isReadByAdmin = true;
        await inquiry.save();
        
        res.redirect(`/admin/chat/${inquiry.userId}`);
    } catch (err) {
        res.status(500).send("Status update failed");
    }
};

// Admin: Delete Query
exports.postDeleteQuery = async (req, res) => {
    try {
        await Inquiry.findByIdAndDelete(req.params.id);
        res.redirect('/admin/queries');
    } catch (err) {
        res.status(500).send("Error deleting query");
    }
};