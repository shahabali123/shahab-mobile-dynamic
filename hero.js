// Shahab Mobile - Hero Section & Promotions Configuration
// Is file mein changes kar k aap website ka banner/promotion update kar saktay hain.
const heroConfig = {
    badge: "New Season 2024",
    title: "Elevate Your Digital Experience.",
    description: "Premium mobile shop with the latest flagship devices. Authentic products, official warranty, and lightning-fast delivery.",
    primaryBtn: { text: "Shop Collection", link: "#product-grid" },
    secondaryBtn: { text: "View Offers", link: "offers.html" },
    watermark: "MOBILE" // Background mein bara text jo nazar ata hai
};

function renderHero() {
    const container = document.getElementById('hero-container');
    if (!container) return;

    container.innerHTML = `
        <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-10 md:p-20 text-white relative overflow-hidden shadow-2xl">
            <div class="relative z-10 max-w-2xl">
                <span class="bg-blue-500/20 text-blue-400 px-4 py-1 rounded-full text-sm font-semibold mb-6 inline-block border border-blue-500/30 uppercase tracking-wider">${heroConfig.badge}</span>
                <h2 class="text-5xl md:text-7xl font-bold mb-6 leading-tight">${heroConfig.title}</h2>
                <p class="text-slate-400 text-lg mb-8 leading-relaxed">${heroConfig.description}</p>
                <div class="flex flex-wrap gap-4">
                    <a href="${heroConfig.primaryBtn.link}" class="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition shadow-lg">${heroConfig.primaryBtn.text}</a>
                    <a href="${heroConfig.secondaryBtn.link}" class="border border-slate-700 px-8 py-4 rounded-xl font-bold hover:bg-slate-700 transition">${heroConfig.secondaryBtn.text}</a>
                </div>
            </div>
            <div class="absolute right-[-10%] bottom-[-10%] opacity-20 text-[15rem] md:text-[20rem] font-bold select-none italic pointer-events-none uppercase tracking-tighter">${heroConfig.watermark}</div>
        </div>
    `;
}

// Initialize hero section
document.addEventListener('DOMContentLoaded', renderHero);