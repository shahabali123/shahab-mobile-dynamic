const products = [
    {
        id: 1,
        name: "iPhone 15 Pro",
        brand: "Apple",
        price: 350000,
        description: "Experience the next level of innovation with the iPhone 15 Pro. Featuring a strong and lightweight aerospace-grade titanium design, the revolutionary A17 Pro chip for pro-level gaming, and a more versatile Pro camera system with 7 pro lenses. It's the most powerful iPhone ever.",
        images: [
            "https://picsum.photos/400/400?random=1",
            "https://picsum.photos/400/400?random=2"
        ],
        oldPrice: 380000,
        specs: { ram: "8GB", storage: "256GB", battery: "3274 mAh" },
        stock: 12,
        freeDelivery: true
    },
    {
        id: 2,
        name: "Samsung S24 Ultra",
        brand: "Samsung",
        price: 390000,
        description: "Welcome to the era of mobile AI. With Galaxy S24 Ultra, you can unleash whole new levels of creativity and productivity. Built with a titanium exterior and a 6.8-inch flat display, it features the Snapdragon 8 Gen 3 for Galaxy and a massive 200MP camera system with advanced AI processing.",
        images: [
            "https://picsum.photos/400/400?random=3",
            "https://picsum.photos/400/400?random=4"
        ],
        oldPrice: 420000,
        specs: { ram: "12GB", storage: "512GB", battery: "5000 mAh" },
        stock: 3,
        freeDelivery: true
    },
    {
        id: 3,
        name: "Google Pixel 8 Pro",
        brand: "Google",
        price: 285000,
        description: "Pixel 8 Pro is the all-pro phone engineered by Google. It's sleek, sophisticated, and has a stunning 6.7-inch Super Actua display. The Google Tensor G3 chip is custom-designed with Google AI for cutting-edge photo and video features and smarter ways to help throughout your day.",
        images: [
            "https://picsum.photos/400/400?random=5",
            "https://picsum.photos/400/400?random=6"
        ],
        specs: { ram: "12GB", storage: "128GB", battery: "5050 mAh" },
        stock: 0,
        freeDelivery: false
    },
    {
        id: 4,
        name: "iPhone 14 Plus",
        brand: "Apple",
        price: 215000,
        description: "Big and bigger. iPhone 14 Plus has a 6.7-inch Super Retina XDR display, an advanced dual-camera system for better photos in any light, and the fastest chip in a smartphone. Plus, the best battery life ever on an iPhone.",
        images: [
            "https://picsum.photos/400/400?random=7",
            "https://picsum.photos/400/400?random=8"
        ],
        specs: { ram: "6GB", storage: "128GB", battery: "4323 mAh" },
        stock: 8,
        freeDelivery: true
    },
    {
        id: 5,
        name: "Samsung Galaxy Z Fold 5",
        brand: "Samsung",
        price: 450000,
        description: "The ultimate productivity powerhouse. Unfold a massive 7.6-inch screen for immersive gaming and multi-tasking. Features the Snapdragon 8 Gen 2 for Galaxy and an improved hinge design for a thinner, lighter feel.",
        images: ["https://picsum.photos/400/400?random=9", "https://picsum.photos/400/400?random=10"],
        specs: { ram: "12GB", storage: "512GB", battery: "4400 mAh" },
        stock: 5,
        freeDelivery: true
    },
    {
        id: 6,
        name: "Google Pixel 7a",
        brand: "Google",
        price: 135000,
        description: "The best of Google for less. Pixel 7a is fast, secure, and incredibly helpful. Featuring the Google Tensor G2 chip, an amazing 64MP camera system, and all-day battery life.",
        images: ["https://picsum.photos/400/400?random=11", "https://picsum.photos/400/400?random=12"],
        specs: { ram: "8GB", storage: "128GB", battery: "4385 mAh" },
        stock: 15,
        freeDelivery: true
    },
    {
        id: 7,
        name: "iPhone 13",
        brand: "Apple",
        price: 185000,
        description: "Advanced dual-camera system, A15 Bionic chip, and a big leap in battery life. Durable design and super-bright Super Retina XDR display.",
        images: ["https://picsum.photos/400/400?random=13", "https://picsum.photos/400/400?random=14"],
        specs: { ram: "4GB", storage: "128GB", battery: "3227 mAh" },
        stock: 0,
        freeDelivery: false
    },
    {
        id: 8,
        name: "Samsung A54 5G",
        brand: "Samsung",
        price: 115000,
        description: "Awesome 5G speed, awesome display, and awesome camera. Samsung Galaxy A54 5G brings flagship-inspired design and features to a more accessible price point.",
        images: ["https://picsum.photos/400/400?random=15", "https://picsum.photos/400/400?random=16"],
        specs: { ram: "8GB", storage: "256GB", battery: "5000 mAh" },
        stock: 20,
        freeDelivery: true
    },
    {
        id: 9,
        name: "OnePlus 12",
        brand: "OnePlus",
        price: 245000,
        description: "Smooth Beyond Belief. The OnePlus 12 features the Snapdragon 8 Gen 3, a 2K 120Hz ProXDR display, and the 4th Gen Hasselblad Camera for Mobile.",
        images: ["https://picsum.photos/400/400?random=17", "https://picsum.photos/400/400?random=18"],
        specs: { ram: "16GB", storage: "512GB", battery: "5400 mAh" },
        stock: 4,
        freeDelivery: true
    },
    {
        id: 10,
        name: "Xiaomi 14 Ultra",
        brand: "Xiaomi",
        price: 310000,
        description: "Lens to Legend. Leica Summilux optical lens, Snapdragon 8 Gen 3, and a stunning WQHD+ AMOLED display. This is the pinnacle of mobile photography.",
        images: ["https://picsum.photos/400/400?random=19", "https://picsum.photos/400/400?random=20"],
        specs: { ram: "16GB", storage: "512GB", battery: "5000 mAh" },
        stock: 2,
        freeDelivery: true
    },
    {
        id: 11,
        name: "Samsung S23 FE",
        brand: "Samsung",
        price: 155000,
        description: "The Fan Edition is back. Iconic design, pro-grade camera, and smooth gaming performance. Galaxy S23 FE is built to last with IP68 water and dust resistance.",
        images: ["https://picsum.photos/400/400?random=21", "https://picsum.photos/400/400?random=22"],
        specs: { ram: "8GB", storage: "128GB", battery: "4500 mAh" },
        stock: 10,
        freeDelivery: true
    },
    {
        id: 12,
        name: "Google Pixel 8",
        brand: "Google",
        price: 210000,
        description: "The power and brains behind Pixel 8. Google Tensor G3 is Google's most powerful chip yet. It makes Pixel 8 fast and efficient, with advanced AI for better photos and videos.",
        images: ["https://picsum.photos/400/400?random=23", "https://picsum.photos/400/400?random=24"],
        specs: { ram: "8GB", storage: "128GB", battery: "4575 mAh" },
        stock: 7,
        freeDelivery: true
    }
];
