// Shahab Mobile - Hero Section & Promotions Configuration
// Is file mein changes kar k aap website ka banner/promotion update kar saktay hain.
const heroConfig = {
    badge: "Trusted in Mansehra",
    brandName: "SHAHAB MOBILE",
    title: "Premium Devices. <br> Trusted Quality.",
    description: "Mansehra's leading destination for original Phones, Samsung, and top brands. Official warranty and easy installments on Shinkiari Road.",
    image: "./images/logo.png",
    primaryBtn: { text: "Explore Collection", link: "#product-grid" },
    secondaryBtn: { text: "Latest Offers", link: "offers.html" }, 
    installmentBtn: { text: "Easy Installments", link: "installments.html" }, // Added new button for Installments
    watermark: "SHAHAB" // Background mein bara text jo nazar ata hai
};

function renderHero() {
    const container = document.getElementById('hero-container');
    if (!container) return;

    container.innerHTML = `
        <div class="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-20 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-8 md:gap-16 border border-white/5">
            <div class="relative z-10 flex-1 text-center md:text-left">
                <div class="flex items-center justify-center md:justify-start gap-3 mb-6">
                    <span class="text-indigo-400 text-xs font-bold uppercase tracking-widest">${heroConfig.badge}</span>
                </div>
                <h2 class="text-3xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
                    ${heroConfig.title}
                </h2>
                <p class="text-slate-300 text-base md:text-lg mb-10 max-w-xl leading-relaxed mx-auto md:mx-0">
                    ${heroConfig.description}
                </p>
                <div class="flex flex-wrap justify-center md:justify-start gap-4">
                    <a href="${heroConfig.primaryBtn.link}" class="bg-neon-gradient text-white px-6 py-3 md:px-8 md:py-4 rounded-2xl font-black uppercase tracking-widest hover:brightness-110 transition shadow-lg shadow-purple-500/20 duration-300 text-xs">
                        ${heroConfig.primaryBtn.text}
                    </a>
                    <a href="${heroConfig.installmentBtn.link}" class="bg-white/5 border border-white/10 text-white px-6 py-3 md:px-8 md:py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition shadow-lg duration-300 flex items-center gap-2 text-xs">
                        <i class="fas fa-calendar-check"></i> ${heroConfig.installmentBtn.text}
                    </a>
                </div>
            </div>
            
            <div class="relative z-10 flex-1 flex justify-center mt-8 md:mt-0">
                <img src="${heroConfig.image}" alt="Featured" class="w-full max-w-sm h-auto drop-shadow-2xl">
            </div>

            <div class="absolute right-[-5%] bottom-[-5%] opacity-5 text-9xl font-black select-none pointer-events-none uppercase italic whitespace-nowrap">
                ${heroConfig.watermark}
            </div>
        </div>
    `;
}

// Initialize hero section
document.addEventListener('DOMContentLoaded', renderHero);