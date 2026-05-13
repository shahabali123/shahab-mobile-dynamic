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
        <div class="bg-[#151521]/50 backdrop-blur-3xl rounded-[4rem] p-10 md:p-24 text-white relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col md:flex-row items-center gap-20 border border-white/10 group">
            <div class="relative z-10 flex-1 text-center md:text-left">
                <div class="flex items-center justify-center md:justify-start gap-4 mb-10">
                    <div class="w-16 h-[2px] bg-gradient-to-r from-[#00C6FF] to-transparent hidden md:block"></div>
                    <span class="text-[#00C6FF] text-[10px] font-black uppercase tracking-[0.8em] drop-shadow-[0_0_8px_rgba(0,198,255,0.6)]">${heroConfig.badge}</span>
                </div>
                <h2 class="text-6xl md:text-7xl lg:text-9xl font-black mb-10 leading-[0.9] tracking-tighter uppercase">
                    NEXT GEN <br>
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#00C6FF] via-[#7B2CFF] to-[#FF00A8] filter drop-shadow-[0_0_20px_rgba(123,44,255,0.3)]">${heroConfig.brandName}</span>
                </h2>
                <p class="text-white/40 text-xl md:text-2xl mb-12 max-w-xl leading-relaxed mx-auto md:mx-0 font-medium tracking-tight">
                    ${heroConfig.description}
                </p>
                <div class="flex flex-wrap justify-center md:justify-start gap-6">
                    <a href="${heroConfig.primaryBtn.link}" class="bg-neon-gradient text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:scale-105 transition shadow-2xl shadow-purple-500/40 duration-300">
                        ${heroConfig.primaryBtn.text}
                    </a>
                    <a href="${heroConfig.secondaryBtn.link}" class="bg-white/5 border border-white/10 px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-white/10 transition duration-300 flex items-center gap-3">
                        ${heroConfig.secondaryBtn.text} <i class="fas fa-chevron-right text-[8px] text-[#FF00A8]"></i>
                    </a>
                    <a href="${heroConfig.installmentBtn.link}" class="bg-[#A8FF00] text-black px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:scale-105 transition shadow-2xl shadow-[#A8FF00]/20 duration-300 flex items-center gap-3">
                        <i class="fas fa-hand-holding-usd"></i> ${heroConfig.installmentBtn.text}
                    </a>
                </div>
            </div>
            
            <div class="relative z-10 flex-1 flex justify-center items-center mt-12 md:mt-0">
                <div class="relative">
                    <div class="absolute -top-32 -right-32 w-80 h-80 bg-[#FF00A8]/20 rounded-full blur-[120px] animate-pulse"></div>
                    <div class="absolute -bottom-32 -left-32 w-80 h-80 bg-[#00C6FF]/20 rounded-full blur-[120px] animate-pulse"></div>
                    <img src="${heroConfig.image}" alt="Shahab Mobile Featured" class="relative z-20 w-full max-w-lg h-auto drop-shadow-[0_0_100px_rgba(123,44,255,0.4)] animate-float-3d brightness-110">
                </div>
            </div>

            <div class="absolute right-[-10%] bottom-[-10%] opacity-[0.02] text-[25rem] font-black select-none pointer-events-none uppercase tracking-tighter italic whitespace-nowrap group-hover:opacity-[0.04] transition-opacity duration-1000">
                ${heroConfig.watermark}
            </div>
        </div>
    `;
}

// Initialize hero section
document.addEventListener('DOMContentLoaded', renderHero);