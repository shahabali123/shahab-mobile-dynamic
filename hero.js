// Shahab Mobile - Hero Section & Promotions Configuration
// Is file mein changes kar k aap website ka banner/promotion update kar saktay hain.
const heroConfig = {
    badge: "Premium Collection",
    brandName: "SHAHAB MOBILE",
    title: "Luxury in Every Touch.",
    description: "Discover the world's most sophisticated smartphones. Authentic products, official warranty, and lightning-fast delivery to Mansehra.",
    image: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=800&auto=format&fit=crop",
    primaryBtn: { text: "Shop Collection", link: "#product-grid" },
    secondaryBtn: { text: "View Offers", link: "offers.html" },
    watermark: "SHAHAB" // Background mein bara text jo nazar ata hai
};

function renderHero() {
    const container = document.getElementById('hero-container');
    if (!container) return;

    container.innerHTML = `
        <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 rounded-[2rem] p-8 md:p-16 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-12">
            <div class="relative z-10 flex-1">
                <div class="flex items-center gap-3 mb-6">
                    <span class="bg-blue-500/20 text-blue-400 px-4 py-1 rounded-full text-xs font-bold border border-blue-500/30 uppercase tracking-widest">${heroConfig.badge}</span>
                    <span class="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">${heroConfig.brandName}</span>
                </div>
                <h2 class="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
                    ${heroConfig.title}
                </h2>
                <p class="text-slate-300 text-lg mb-8 max-w-xl leading-relaxed font-light">
                    ${heroConfig.description}
                </p>
                <div class="flex flex-wrap gap-4">
                    <a href="${heroConfig.primaryBtn.link}" class="bg-white text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition shadow-xl hover:-translate-y-1 duration-300 transform">
                        ${heroConfig.primaryBtn.text}
                    </a>
                    <a href="${heroConfig.secondaryBtn.link}" class="glass border border-white/10 px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition duration-300 flex items-center gap-2">
                        ${heroConfig.secondaryBtn.text} <i class="fas fa-arrow-right text-xs"></i>
                    </a>
                </div>
            </div>
            
            <div class="relative z-10 flex-1 flex justify-center items-center">
                <div class="relative group">
                    <div class="absolute -inset-4 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition duration-1000"></div>
                    <img src="${heroConfig.image}" alt="Luxury Smartphone" class="relative z-20 w-full max-w-md h-auto rounded-[2rem] shadow-2xl transform hover:scale-105 transition duration-700 md:rotate-6 hover:rotate-0 border border-white/10">
                </div>
            </div>

            <div class="absolute right-[-5%] top-[-5%] opacity-5 text-[10rem] md:text-[15rem] font-bold select-none pointer-events-none uppercase tracking-tighter italic">
                ${heroConfig.watermark}
            </div>
        </div>
    `;
}

// Initialize hero section
document.addEventListener('DOMContentLoaded', renderHero);