/**
 * SHAHAB MOBILE - PRODUCT DATA CONFIGURATION
 * 
 * BADGE LAGANE KA TAREEKA:
 * Agar aap chahte hain k kisi product par badge nazar aaye, to uske object mein 
 * 'badge' ki property add karein is tarah:
 * 
 * badge: { text: "APNA_TEXT", color: "bg-COLOR_NAME" }
 * 
 * Mash'hoor Colors:
 * - Neela (Neon Blue):  bg-[#00C6FF]
 * - Surkh (Neon Pink):  bg-[#FF00A8]
 * - Narangi (Hot):      bg-[#FF8A00]
 * - Sabz (Lime):        bg-[#A8FF00]
 * - Jamni (Purple):     bg-[#7B2CFF]
 * 
 * Agar badge nahi dikhana, to us product se 'badge' wali line hata dein.
 * 
 * INSTALLMENT (Policy: 30% Down Payment, 10-20% Markup):
 * Agar product installment par dena hai, to product object mein:
 * installment: true
 * add karein.
 */

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

const products = [
    {
        id: 13,
        name: "Samsung A07 (4GB-64GB)",
        brand: "Samsung",
        price: 30500,
        description: "Samsung Galaxy A07 provides a smooth experience with its 6.7-inch display and reliable performance for daily tasks.",
        images: ["./images/samsung-a07.avif"],
        specs: { ram: "4GB", storage: "64GB", battery: "5000 mAh" },
        stock: 10,
        freeDelivery: true,
        badge: { text: "NEW", color: "bg-blue-600" }
    },
    {
        id: 14,
        name: "Samsung A07 (4GB-128GB)",
        brand: "Samsung",
        price: 35500,
        description: "The Galaxy A07 with 128GB storage ensures you have plenty of space for your photos, videos, and apps.",
        images: ["./images/samsung-a07.avif"],
        specs: { ram: "4GB", storage: "128GB", battery: "5000 mAh" },
        stock: 10,
        freeDelivery: true,
        badge: { text: "BEST SELLER", color: "bg-emerald-500" }
    },
    {
        id: 15,
        name: "Samsung A07 (6GB-128GB)",
        brand: "Samsung",
        price: 41500,
        description: "Enjoy enhanced multi-tasking and performance with 6GB RAM on the Samsung Galaxy A07.",
        images: ["./images/samsung-a07.avif"],
        specs: { ram: "6GB", storage: "128GB", battery: "5000 mAh" },
        stock: 8,
        freeDelivery: true
    },
    {
        id: 16,
        name: "Samsung A17 (6GB-128GB)",
        brand: "Samsung",
        price: 57000,
        description: "Experience premium features with the Samsung A17, featuring a stunning display and excellent camera quality.",
        images: ["./images/samsung-a17.avif"],
        specs: { ram: "6GB", storage: "128GB", battery: "5000 mAh" },
        stock: 5,
        freeDelivery: true
    },
    {
        id: 17,
        name: "Samsung A17 (8GB-256GB)",
        brand: "Samsung",
        price: 64000,
        description: "High-end storage and powerful performance for power users with the Samsung Galaxy A17.",
        images: ["./images/samsung-a17.avif"],
        specs: { ram: "8GB", storage: "256GB", battery: "5000 mAh" },
        stock: 6,
        freeDelivery: true
    },
    {
        id: 18,
        name: "Samsung A26 5G (8GB-256GB)",
        brand: "Samsung",
        price: 78500,
        description: "Super-fast 5G connectivity meets premium design. The Samsung A26 5G is built for the future.",
        images: ["./images/samsung-a26-5g.avif"],
        specs: { ram: "8GB", storage: "256GB", battery: "5000 mAh" },
        stock: 4,
        freeDelivery: true,
        badge: { text: "HOT", color: "bg-orange-500" }
    },
    {
        id: 19,
        name: "Samsung A56 5G (12GB-256GB)",
        brand: "Samsung",
        price: 132000,
        description: "Ultimate performance with 12GB RAM and 5G speeds. The Galaxy A56 is a true flagship contender in the A-series.",
        images: ["./images/samsung-a56-5g.avif"],
        specs: { ram: "12GB", storage: "256GB", battery: "5000 mAh" },
        stock: 3,
        freeDelivery: true
    },
    {
        id: 20,
        name: "Redmi A5 (4GB-64GB)",
        brand: "Redmi",
        price: 29500,
        description: "Affordable and reliable. The Redmi A5 is perfect for those looking for great value without compromising quality.",
        images: ["./images/redmi-a5.webp"],
        specs: { ram: "4GB", storage: "64GB", battery: "5000 mAh" },
        stock: 15,
        freeDelivery: true
    },
    {
        id: 21,
        name: "Redmi A5 (4GB-128GB)",
        brand: "Redmi",
        price: 33000,
        description: "More storage for your memories. Redmi A5 128GB version keeps you going all day.",
        images: ["./images/redmi-a5.webp"],
        specs: { ram: "4GB", storage: "128GB", battery: "5000 mAh" },
        stock: 12,
        freeDelivery: true
    },
    {
        id: 22,
        name: "Redmi 15C (4GB-128GB)",
        brand: "Redmi",
        price: 38500,
        description: "Redmi 15C features a large immersive display and a long-lasting battery for non-stop entertainment.",
        images: ["./images/redmi-15c.webp"],
        specs: { ram: "4GB", storage: "128GB", battery: "5000 mAh" },
        stock: 10,
        freeDelivery: true
    },
    {
        id: 23,
        name: "Redmi Note 14 (8GB-128GB)",
        brand: "Redmi",
        price: 55500,
        description: "The Redmi Note 14 brings pro-level camera features and a beautiful AMOLED display to the masses.",
        images: ["./images/redmi-note-14.webp"],
        specs: { ram: "8GB", storage: "128GB", battery: "5000 mAh" },
        stock: 7,
        freeDelivery: true,
        badge: { text: "POPULAR", color: "bg-purple-600" }
    },
    {
        id: 24,
        name: "Redmi Note 14 (8GB-256GB)",
        brand: "Redmi",
        price: 59000,
        description: "Double the storage for your professional photography with the Redmi Note 14 256GB model.",
        images: ["./images/redmi-note-14.webp"],
        specs: { ram: "8GB", storage: "256GB", battery: "5000 mAh" },
        stock: 5,
        freeDelivery: true
    },
    {
        id: 25,
        name: "Redmi Note 14 Pro (8GB-256GB)",
        brand: "Redmi",
        price: 78000,
        description: "Experience Pro performance with advanced AI camera features and ultra-fast charging on Redmi Note 14 Pro.",
        images: ["./images/redmi-note-14-pro.webp"],
        specs: { ram: "8GB", storage: "256GB", battery: "5000 mAh" },
        stock: 4,
        freeDelivery: true
    },
    {
        id: 26,
        name: "Redmi Note 15 (8GB-128GB)",
        brand: "Redmi",
        price: 69500,
        description: "The next generation of Redmi Note is here. Sleek design, faster processing, and improved optics.",
        images: ["./images/redmi-note-15.webp"],
        specs: { ram: "8GB", storage: "128GB", battery: "5000 mAh" },
        stock: 6,
        freeDelivery: true
    },
    {
        id: 27,
        name: "Redmi Note 15 (8GB-256GB)",
        brand: "Redmi",
        price: 74000,
        description: "Stay ahead with the Redmi Note 15, offering flagship-level features at an incredible price point.",
        images: ["./images/redmi-note-15.webp"],
        specs: { ram: "8GB", storage: "256GB", battery: "5000 mAh" },
        stock: 5,
        freeDelivery: true,
        badge: { text: "TOP DEAL", color: "bg-red-600" }
    },
    {
        id: 28,
        name: "Redmi Note 15 Pro (8GB-256GB)",
        brand: "Redmi",
        price: 93000,
        description: "The ultimate Redmi experience. Pro cameras, pro performance, and an elegant premium design.",
        images: ["./images/Redmi-note-15-pro-blue.webp"],
        specs: { ram: "8GB", storage: "256GB", battery: "5000 mAh" },
        stock: 3,
        freeDelivery: true
    },
    {
        id: 29,
        name: "Tecno Spark Go 3 (4GB-64GB)",
        brand: "Tecno",
        price: 31000,
        description: "Reliable and pocket-friendly. Spark Go 3 offers great battery life and a smooth user experience.",
        images: ["./images/tecno-spark-go-3.webp"],
        specs: { ram: "4GB", storage: "64GB", battery: "5000 mAh" },
        stock: 20,
        freeDelivery: true,
        installment: true,
        installmentText: "20% Advance, 9 Months Installments"
    },
    {
        id: 30,
        name: "Tecno Spark 40 Pro (8GB-256GB)",
        brand: "Tecno",
        price: 56500,
        description: "Stylish design with powerful specs. The Spark 40 Pro features a massive display and excellent cameras.",
        images: ["./images/tecno-spark-40-pro.webp"],
        specs: { ram: "8GB", storage: "256GB", battery: "5000 mAh" },
        stock: 10,
        freeDelivery: true,
        installment: true,
        installmentText: "20% Advance, 9 Months Installments"
    },
    {
        id: 31,
        name: "Tecno Spark 40 Pro+ (8GB-256GB)",
        brand: "Tecno",
        price: 65500,
        description: "Go even further with the Spark 40 Pro Plus, featuring enhanced camera sensors and faster charging.",
        images: ["./images/tecno-spark-40-pro-+.webp"],
        specs: { ram: "8GB", storage: "256GB", battery: "5000 mAh" },
        stock: 8,
        freeDelivery: true,
        installment: true,
        installmentText: "20% Advance, 9 Months Installments"
    },
    {
        id: 32,
        name: "Vgotel New 15 Pro (4GB-64GB)",
        brand: "Vgotel",
        price: 25000,
        description: "The Vgotel New 15 Pro offers a modern design and capable performance at an entry-level price.",
        images: ["./images/vgotel-new-15-pro.webp"],
        specs: { ram: "4GB", storage: "64GB", battery: "5000 mAh" },
        stock: 12,
        freeDelivery: true
    },
    {
        id: 33,
        name: "Vgotel Smart 8 Go (4GB-64GB)",
        brand: "Vgotel",
        price: 25500,
        description: "Smart 8 Go is designed for efficiency and style, keeping you connected throughout the day.",
        images: ["./images/vgotel-smart-8-go.webp"],
        specs: { ram: "4GB", storage: "64GB", battery: "5000 mAh" },
        stock: 15,
        freeDelivery: true
    },
    {
        id: 34,
        name: "Itel P17 Pro (2GB-32GB 3G)",
        brand: "Itel",
        price: 16800,
        description: "Compact and reliable, the Itel P17 Pro is an ideal choice for essential smartphone needs.",
        images: ["./images/itel-p-17-pro.webp"],
        specs: { ram: "2GB", storage: "32GB", battery: "4000 mAh" },
        stock: 10,
        freeDelivery: false
    },
    {
        id: 35,
        name: "Itel A100 C (2GB-64GB)",
        brand: "Itel",
        price: 21500,
        description: "Itel A100 C offers plenty of storage for your essentials in a sleek, lightweight body.",
        images: ["./images/itel-a-100-c.jpg"],
        specs: { ram: "2GB", storage: "64GB", battery: "5000 mAh" },
        stock: 18,
        freeDelivery: true,
        installment: true,
        installmentText: "20% Advance, 9 Months Installments"
    },
    {
        id: 36,
        name: "Itel A100 C (4GB-64GB)",
        brand: "Itel",
        price: 25500,
        description: "Enjoy smoother performance with 4GB RAM on the Itel A100 C model.",
        images: ["./images/itel-a-100-c.jpg"],
        specs: { ram: "4GB", storage: "64GB", battery: "5000 mAh" },
        stock: 14,
        freeDelivery: true,
        installment: true,
        installmentText: "20% Advance, 9 Months Installments"
    },
    {
        id: 37,
        name: "Itel City 200 (4GB-128GB)",
        brand: "Itel",
        price: 31500,
        description: "Itel City 200 features a massive display and generous 128GB storage for your media needs.",
        images: ["./images/itel-city-200.webp"],
        specs: { ram: "4GB", storage: "128GB", battery: "5000 mAh" },
        stock: 9,
        freeDelivery: true,
        installment: true,
        installmentText: "20% Advance, 9 Months Installments"
    },
    {
        id: 38,
        name: "Itel Super 26 Ultra (8GB-256GB)",
        brand: "Itel",
        price: 53000,
        description: "High performance meets high storage capacity. Itel Super 26 Ultra is the ultimate budget powerhouse.",
        images: ["./images/itel-super-26-ultra.webp"],
        specs: { ram: "8GB", storage: "256GB", battery: "5000 mAh" },
        stock: 7,
        freeDelivery: true,
        installment: true,
        installmentText: "20% Advance, 9 Months Installments"
    },
    {
        id: 39,
        name: "Itel A100 4.5g (4GB-128GB)",
        brand: "Itel",
        price: 29000,
        description: "Compact and reliable, the Itel A100 is an ideal choice for essential smartphone needs.",
        images: ["./images/itel-a-1oo.webp"],
        specs: { ram: "4GB", storage: "128GB", battery: "5000 mAh" },
        stock: 10,
        installment: true,
        installmentText: "20% Advance, 9 Months Installments",
        freeDelivery: false
    },
    {
        id: 40,
        name: "Infinix Smart 10 (4+4GB-64GB)",
        brand: "Infinix",
        price: 31000,
        description: "Compact and reliable, the Infinix Smart 10 is an ideal choice for essential smartphone needs.",
        images: ["./images/infinix-smart-10.webp"],
        specs: { ram: "4+4GB", storage: "64GB", battery: "5000 mAh" },
        stock: 10,
        installment: true,
        installmentText: "20% Advance, 9 Months Installments",
        freeDelivery: false
    },
    {
        id: 41,
        name: "Tecno Spark 50 (6GB-128GB)",
        brand: "Tecno",
        price: 45000,
        description: "Compact and reliable, the Tecno Spark 50 is an ideal choice for essential smartphone needs.",
        images: ["./images/tecno-spark-50.webp"],
        specs: { ram: "6GB", storage: "128GB", battery: "7000 mAh" },
        stock: 10,
        installment: true,
        installmentText: "20% Advance, 9 Months Installments",
        freeDelivery: false
    },
    {
        id: 42,
        name: "Infinix Hot 60i (6GB-128GB)",
        brand: "Infinix",
        price: 45500,
        description: "The Infinix Hot 60i delivers smooth performance and a vibrant display, perfect for daily multitasking and media.",
        images: ["./images/infinix-hot-60-i.jpg"],
        specs: { ram: "6GB", storage: "128GB", battery: "5000 mAh" },
        stock: 12,
        installment: true,
        installmentText: "20% Advance, 9 Months Installments",
        freeDelivery: true
    },
    {
        id: 43,
        name: "Infinix Note 50 (8GB-256GB)",
        brand: "Infinix",
        price: 82500,
        description: "Experience flagship-level power with the Infinix Note 50. This special bundle includes a high-capacity powerbank for non-stop energy.",
        images: ["./images/infinix-note-50.webp"],
        specs: { ram: "8GB", storage: "256GB", battery: "5000 mAh" },
        stock: 8,
        installment: true,
        installmentText: "20% Advance, 9 Months Installments",
        freeDelivery: true,
        badge: { text: "+ POWERBANK", color: "bg-purple-600" }
    },
    {
        id: 44,
        name: "Infinix Hot 60 Pro+ (8GB-256GB)",
        brand: "Infinix",
        price: 66580,
        description: "Experience flagship-level power with the Infinx Hot 60 Pro+.",
        images: ["./images/infinix-hot-60-pro+.jpg"],
        specs: { ram: "8GB", storage: "256GB", battery: "5000 mAh" },
        stock: 8,
        installment: true,
        installmentText: "20% Advance, 9 Months Installments",
        freeDelivery: true
    }
];
