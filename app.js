// State Management
let cart = JSON.parse(localStorage.getItem('shahab_cart')) || [];
let compareList = JSON.parse(localStorage.getItem('shahab_compare')) || [];
let currentPage = 1;
let lightboxImages = [];
let lightboxIndex = 0;
const itemsPerPage = 8;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    updateCompareUI();
    initScrollReveal();
    renderProducts(true, false); 

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.group')) {
            document.getElementById('search-suggestions')?.classList.add('hidden');
        }
    });

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registered: ', registration.scope);
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }

    // Keyboard support for Lightbox
    document.addEventListener('keydown', (e) => {
        const lightbox = document.getElementById('lightbox-modal');
        if (lightbox && !lightbox.classList.contains('hidden')) {
            if (e.key === 'ArrowRight') changeLightboxImage(1);
            if (e.key === 'ArrowLeft') changeLightboxImage(-1);
            if (e.key === 'Escape') closeLightbox();
        }
    });
});

// Render Products
function renderProducts(resetPage = false, shouldScroll = false) {
    if (resetPage) currentPage = 1;

    const grid = document.getElementById('product-grid');
    if (!grid) return;

    let filtered = [...products];
    
    // Apply Navbar Search Filter
    const searchInp = document.getElementById('searchBar') || document.getElementById('searchBarMobile');
    const query = searchInp?.value.toLowerCase();
    if (query) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.brand.toLowerCase().includes(query)
        );
    }

    // Apply Brand Filter
    const brand = document.getElementById('brandFilter')?.value || 'All';
    if (brand !== 'All') filtered = filtered.filter(p => p.brand === brand);

    // Apply Installment Filter
    const installmentOnly = document.getElementById('installmentFilter')?.checked;
    if (installmentOnly) filtered = filtered.filter(p => p.installment === true);

    // Apply Price Range Filter
    const minPrice = parseInt(document.getElementById('minPrice')?.value) || 0;
    const maxPrice = parseInt(document.getElementById('maxPrice')?.value) || Infinity;
    filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // Apply Offers Filter (if on offers page)
    if (window.filterOnlyOffers) {
        filtered = filtered.filter(p => p.freeDelivery === true);
    }

    // Apply Global Installment Page Filter
    if (window.filterOnlyInstallments) {
        filtered = filtered.filter(p => p.installment === true);
    }

    // Apply Sorting
    const sortVal = document.getElementById('sortFilter')?.value;
    if (sortVal === 'low') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortVal === 'high') {
        filtered.sort((a, b) => b.price - a.price);
    }

    // Empty State Check
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-20 text-center animate-in fade-in duration-500">
                <div class="bg-white rounded-[3rem] p-12 border border-slate-100 inline-block shadow-sm max-w-lg">
                    <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-search text-4xl text-slate-300"></i>
                    </div>
                    <h3 class="text-2xl font-extrabold text-slate-800 mb-4">Koi device nahi mili!</h3>
                    <p class="text-slate-500 leading-relaxed">
                        Aap ki selected range, company ya search filter mein filhal koi product available nahi hai. <br>
                        <span class="font-bold text-blue-600 cursor-pointer hover:underline" onclick="resetFilters()">Filters reset karein</span> ya search badal kar dekhein.
                    </p>
                </div>
            </div>
        `;
        const pagination = document.getElementById('pagination-controls');
        if (pagination) pagination.innerHTML = '';
        return;
    }

    // Pagination
    const start = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);

    grid.innerHTML = paginated.map(product => {
        // Check if we are on the installments page to change the primary button
        const isInstallmentsPage = window.filterOnlyInstallments;
        const mainBtnHtml = isInstallmentsPage 
            ? `<button onclick="inquireInstallment(${product.id})" class="flex-grow bg-[#A8FF00] text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition shadow-lg flex items-center justify-center gap-2"><i class="fas fa-hand-holding-usd"></i> Inquire</button>`
            : `<button onclick="addToCart(${product.id})" class="flex-grow bg-neon-gradient text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition shadow-xl shadow-purple-500/20">Add to Cart</button>`;

        return `
        <div class="product-card reveal-item rounded-[2.5rem] p-6 group relative perspective-1000" onmousemove="handle3DTilt(event, this)" onmouseleave="reset3DTilt(this)">
            <div class="absolute top-6 left-6 flex flex-col gap-2 z-10">
                ${product.badge ? `<span class="${product.badge.color} text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-2xl">${product.badge.text}</span>` : ''}
                ${product.freeDelivery ? '<span class="bg-[#00C6FF] text-black text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-2xl">Free Delivery</span>' : ''}
                ${product.installment ? '<span class="bg-white text-black text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-2xl flex items-center gap-1"><i class="fas fa-bolt text-[8px]"></i> Installment</span>' : ''}
            </div>
            
            <div class="aspect-square bg-white/5 rounded-[2rem] mb-6 flex items-center justify-center overflow-hidden cursor-pointer group-hover:bg-white/10 transition duration-500" onclick="showDetails(${product.id})">
                <img src="${product.images[0]}" class="w-[85%] h-[85%] object-contain group-hover:scale-110 transition-transform duration-700 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
            </div>
            
            <div class="px-2">
                <p class="text-[#00C6FF] font-black text-[10px] tracking-[0.3em] uppercase mb-2">${product.brand}</p>
                <h3 class="text-lg font-black text-white mb-3 truncate uppercase tracking-tight" title="${product.name}">${product.name}</h3>
                <div class="flex justify-between items-center mb-6">
                    <p class="text-2xl font-black text-white tracking-tighter">Rs. ${product.price.toLocaleString()}</p>
                </div>
                <div class="flex gap-3 relative z-20">
                    ${mainBtnHtml}
                    <button onclick="toggleCompare(${product.id})" class="w-14 h-14 flex items-center justify-center rounded-2xl border border-white/10 text-white/50 hover:border-neon-pink hover:text-neon-pink transition-all duration-300">
                        <i class="fas fa-balance-scale"></i>
                    </button>
                </div>
            </div>
        </div>
    `}).join('');

    renderPagination(filtered.length);
    observeElements();

    // Scroll to product grid if requested
    if (shouldScroll) {
        const productGrid = document.getElementById('product-grid');
        if (productGrid) {
            productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Helper to sync mobile and desktop search without automatic rendering
function syncSearch(val) {
    const dSearch = document.getElementById('searchBar');
    const mSearch = document.getElementById('searchBarMobile');
    if (dSearch) dSearch.value = val;
    if (mSearch) mSearch.value = val;
}

function toggleFilters() {
    const dropdown = document.getElementById('filters-dropdown');
    dropdown?.classList.toggle('hidden');
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('menu-overlay');
    if (!menu) return;
    
    const isOpening = menu.classList.contains('translate-x-[120%]');
    
    menu.classList.toggle('translate-x-[120%]');
    overlay?.classList.toggle('hidden');
    
    // Fix: If opening, lock scroll. If closing, restore it.
    document.body.style.overflow = isOpening ? 'hidden' : 'auto';
}

function resetFilters() {
    document.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
    document.querySelectorAll('input[type="number"], input[type="text"]').forEach(i => i.value = '');
    document.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
    renderProducts(true, true);
}

// Comparison Logic
function toggleCompare(id) {
    const index = compareList.indexOf(id);
    if (index > -1) {
        compareList.splice(index, 1);
        showToast("Removed from comparison", "compare");
    } else {
        if (compareList.length >= 2) {
            showToast("You can only compare 2 products at a time!", "error");
            return;
        }
        compareList.push(id);
        showToast("Added to comparison", "compare");
    }
    localStorage.setItem('shahab_compare', JSON.stringify(compareList));
    updateCompareUI();
    renderProducts(false, false);
}

function updateCompareUI() {
    const btn = document.getElementById('floating-compare-btn');
    const count = document.getElementById('compare-count');
    if (!btn || !count) return;

    if (compareList.length > 0) {
        btn.classList.remove('hidden');
        count.innerText = compareList.length;
    } else {
        btn.classList.add('hidden');
    }
}

function openCompareModal() {
    if (compareList.length < 2) {
        showToast("Please select 2 products to compare");
        return;
    }
    const p1 = products.find(p => p.id === compareList[0]);
    const p2 = products.find(p => p.id === compareList[1]);
    
    const content = document.getElementById('compare-content');
    const createSlot = (p) => `
        <div class="bg-white/5 p-6 md:p-10 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center group">
            <img src="${p.images[0]}" class="w-20 h-20 md:w-32 md:h-32 object-contain mb-3 md:mb-4 rounded-xl">
            <h4 class="font-black text-xs md:text-xl mb-2 text-white uppercase tracking-tighter line-clamp-2 min-h-[3rem]">${p.name}</h4>
            <p class="text-sm md:text-3xl font-black text-neon-blue mb-8">Rs. ${p.price.toLocaleString()}</p>
            <div class="w-full space-y-3">
                <div class="bg-[#0F0F14] p-4 rounded-2xl border border-white/5 flex justify-between items-center"><span class="text-white/20 text-[9px] font-black uppercase">RAM</span> <span class="font-bold text-sm text-white">${p.specs.ram}</span></div>
                <div class="bg-[#0F0F14] p-4 rounded-2xl border border-white/5 flex justify-between items-center"><span class="text-white/20 text-[9px] font-black uppercase">STORAGE</span> <span class="font-bold text-sm text-white">${p.specs.storage}</span></div>
                <div class="bg-[#0F0F14] p-4 rounded-2xl border border-white/5 flex justify-between items-center"><span class="text-white/20 text-[9px] font-black uppercase">BATTERY</span> <span class="font-bold text-sm text-white">${p.specs.battery}</span></div>
            </div>
        </div>
    `;
    
    content.innerHTML = createSlot(p1) + createSlot(p2);
    document.getElementById('compare-modal').classList.remove('hidden');
}

function closeCompareModal() {
    document.getElementById('compare-modal').classList.add('hidden');
}

function clearCompareList() {
    compareList = [];
    localStorage.setItem('shahab_compare', JSON.stringify(compareList));
    updateCompareUI();
    renderProducts(false, false);
    closeCompareModal();
}

// Cart Logic
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({...product, quantity: 1});
    }
    localStorage.setItem('shahab_cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`Added ${product.name} to cart`, "cart");
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('#cart-count').forEach(el => el.innerText = count);
    renderCart();
}

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    sidebar.classList.toggle('translate-x-full');
}

function renderCart() {
    const itemsContainer = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    if (!itemsContainer) return;

    let total = 0;
    itemsContainer.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div class="flex gap-6 bg-white/5 p-5 rounded-3xl border border-white/5">
                <img src="${item.images[0]}" class="w-20 h-20 object-contain rounded-2xl bg-white/5 p-2">
                <div class="flex-grow">
                    <h4 class="font-black text-white uppercase text-sm mb-1">${item.name}</h4>
                    <p class="text-neon-blue font-black text-sm mb-3">Rs. ${item.price.toLocaleString()}</p>
                    <div class="flex items-center gap-4">
                        <button onclick="changeQty(${item.id}, -1)" class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white transition flex items-center justify-center">-</button>
                        <span class="font-black text-white text-lg">${item.quantity}</span>
                        <button onclick="changeQty(${item.id}, 1)" class="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white transition flex items-center justify-center">+</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    totalEl.innerText = total.toLocaleString();
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== id);
    }
    localStorage.setItem('shahab_cart', JSON.stringify(cart));
    updateCartCount();
}

function checkoutWhatsApp() {
    if (cart.length === 0) return alert("Cart is empty");
    let text = "Hello Shahab Mobile, I want to order:\n\n";
    cart.forEach(item => text += `• ${item.name} x ${item.quantity} (Rs. ${(item.price * item.quantity).toLocaleString()})\n`);
    text += `\nTotal: Rs. ${document.getElementById('cart-total').innerText}`;
    window.open(`https://wa.me/923420475187?text=${encodeURIComponent(text)}`);
}

function inquireInstallment(id) {
    const p = products.find(product => product.id === id);
    if (!p) return;

    const config = typeof installmentConfig !== 'undefined' ? installmentConfig : { advancePercentage: 20, plans: [] };
    const downPayment = Math.round(p.price * (config.advancePercentage / 100));
    const options = config.plans.map(pl => pl.months).join(', ') + " Months";
    
    const msg = `Asalam-o-Alaikum Shahab Mobile! Mujhay is product ki installments ki details chahiye:\n\nDevice: ${p.name}\nTotal Price: Rs. ${p.price.toLocaleString()}\nAdvance Payment (${config.advancePercentage}%): Rs. ${downPayment.toLocaleString()}\nPlan options: ${options}`;
    
    window.open(`https://wa.me/923420475187?text=${encodeURIComponent(msg)}`);
}

// Search Logic
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const suggestions = document.getElementById('search-suggestions');
    
    if (!query) {
        suggestions.classList.add('hidden');
        return;
    }

    const matched = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.brand.toLowerCase().includes(query)
    ).slice(0, 5);

    if (matched.length > 0) {
        suggestions.innerHTML = matched.map(p => `
            <div class="flex items-center gap-4 p-5 hover:bg-white/5 cursor-pointer transition border-b border-white/5 last:border-0" onclick="showDetails(${p.id})">
                <img src="${p.images[0]}" class="w-14 h-14 object-contain rounded-xl bg-white/5 p-1">
                <div>
                    <p class="font-black text-white uppercase text-sm">${p.name}</p>
                    <p class="text-neon-blue font-black text-xs uppercase">Rs. ${p.price.toLocaleString()}</p>
                </div>
            </div>
        `).join('');
        suggestions.classList.remove('hidden');
    } else {
        suggestions.innerHTML = `<p class="p-4 text-slate-400 text-sm text-center">No devices found</p>`;
        suggestions.classList.remove('hidden');
    }
}

// Product Details Logic
function showDetails(id) {
    const p = products.find(product => product.id === id);
    if (!p) return;

    lightboxImages = p.images;
    lightboxIndex = 0;

    document.getElementById('modal-title').innerText = p.name;
    document.getElementById('modal-price').innerText = `Rs. ${p.price.toLocaleString()}`;
    document.getElementById('modal-desc').innerText = p.description;
    
    const brandBadge = document.getElementById('modal-brand-badge');
    brandBadge.innerHTML = `<span class="bg-[#00C6FF]/20 text-[#00C6FF] px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">${p.brand}</span>`;

    const mainImg = document.getElementById('modal-main-image');
    mainImg.innerHTML = `<img src="${p.images[0]}" class="w-[85%] h-[85%] object-contain cursor-zoom-in group-hover:scale-105 transition-transform duration-700" onclick="openLightbox()">`;

    const thumbnails = document.getElementById('modal-thumbnails');
    thumbnails.innerHTML = p.images.map((img, idx) => `
        <div class="w-20 h-20 md:w-24 md:h-24 rounded-2xl border border-white/5 flex-shrink-0 cursor-pointer overflow-hidden p-3 bg-white/5 hover:border-neon-blue hover:bg-white/10 transition" onclick="updateMainImage(${idx})">
            <img src="${img}" class="w-full h-full object-contain">
        </div>
    `).join('');

    const specs = document.getElementById('modal-specs');
    specs.innerHTML = `
        <div class="bg-white/5 p-4 rounded-2xl text-center border border-white/5"><p class="text-[9px] text-white/20 font-black uppercase mb-1">RAM</p><p class="text-base font-black text-white">${p.specs.ram}</p></div>
        <div class="bg-white/5 p-4 rounded-2xl text-center border border-white/5"><p class="text-[9px] text-white/20 font-black uppercase mb-1">Storage</p><p class="text-base font-black text-white">${p.specs.storage}</p></div>
        <div class="bg-white/5 p-4 rounded-2xl text-center border border-white/5"><p class="text-[9px] text-white/20 font-black uppercase mb-1">Battery</p><p class="text-base font-black text-white">${p.specs.battery}</p></div>
    `;

    // Action Buttons
    const addBtn = document.getElementById('modal-add-btn');
    addBtn.onclick = () => { addToCart(p.id); closeDetails(); };

    // Installment Calculator & Button Logic
    const modalActions = addBtn.parentElement;
    const existingInstallBtn = document.getElementById('modal-installment-btn');
    const existingCalc = document.getElementById('modal-calc-box');
    const existingInstallmentText = document.getElementById('modal-installment-text');

    if (existingInstallmentText) existingInstallmentText.remove();
    if (existingInstallBtn) existingInstallBtn.remove();
    if (existingCalc) existingCalc.remove();

    if (p.installment) {
        // Global config from products.js
        const config = typeof installmentConfig !== 'undefined' ? installmentConfig : { advancePercentage: 20, plans: [] };
        
        const downPayment = Math.round(p.price * (config.advancePercentage / 100));
        const remaining = p.price - downPayment;

        const planResults = config.plans.map(plan => ({
            months: plan.months,
            perMonth: Math.round((remaining * (1 + plan.markup / 100)) / plan.months)
        }));

        if (p.installmentText) {
            const installmentTextEl = document.createElement('p');
            installmentTextEl.id = 'modal-installment-text';
            installmentTextEl.className = "text-[#A8FF00] font-black uppercase tracking-widest text-xs mb-6";
            installmentTextEl.innerText = p.installmentText;
            modalActions.insertBefore(installmentTextEl, addBtn);
        }

        const calcBox = document.createElement('div');
        calcBox.id = 'modal-calc-box';
        calcBox.className = "mt-8 bg-white/5 p-6 rounded-3xl border border-white/5 mb-8";
        calcBox.innerHTML = `
            <p class="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Payment Estimate (${config.advancePercentage}% Advance)</p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="bg-[#0F0F14] p-3 rounded-xl text-center border border-white/5"><p class="text-[8px] text-white/20 font-black mb-1 uppercase">Advance</p><p class="text-xs font-black text-white">Rs. ${downPayment.toLocaleString()}</p></div>
                ${planResults.map(plan => `
                    <div class="bg-[#0F0F14] p-3 rounded-xl text-center border border-white/5"><p class="text-[8px] text-white/20 font-black mb-1 uppercase">${plan.months} Mo</p><p class="text-xs font-black text-neon-blue">Rs. ${plan.perMonth.toLocaleString()}</p></div>
                `).join('')}
            </div>
        `;
        modalActions.insertBefore(calcBox, addBtn);

        const instBtn = document.createElement('button');
        instBtn.id = 'modal-installment-btn';
        instBtn.className = "w-full mt-4 bg-white/5 text-white/70 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition flex items-center justify-center gap-3 border border-white/5";
        instBtn.innerHTML = `<i class="fas fa-hand-holding-usd text-[#A8FF00]"></i> Inquire Flexi Plan`;
        instBtn.onclick = () => {
            const options = config.plans.map(pl => pl.months).join(', ') + " Months";
            const msg = `Asalam-o-Alaikum Shahab Mobile! Mujhay is product ki installments ki details chahiye:\n\nDevice: ${p.name}\nTotal Price: Rs. ${p.price.toLocaleString()}\nAdvance Payment (${config.advancePercentage}%): Rs. ${downPayment.toLocaleString()}\nPlan options: ${options}`;
            window.open(`https://wa.me/923420475187?text=${encodeURIComponent(msg)}`);
        };
        modalActions.appendChild(instBtn);
    }

    document.getElementById('product-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    document.getElementById('search-suggestions')?.classList.add('hidden');
}

function updateMainImage(index) {
    lightboxIndex = index;
    const mainImg = document.querySelector('#modal-main-image img');
    if (mainImg) mainImg.src = lightboxImages[index];
}

function openLightbox() {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    if (!modal || !img) return;

    img.src = lightboxImages[lightboxIndex];
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    updateLightboxUI();
}

function closeLightbox() {
    document.getElementById('lightbox-modal').classList.add('hidden');
    
    // Fix: If product details modal is STILL open, keep the body scroll locked.
    // Otherwise, restore scrolling.
    const detailsModal = document.getElementById('product-modal');
    if (detailsModal && !detailsModal.classList.contains('hidden')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

function changeLightboxImage(dir) {
    if (lightboxImages.length <= 1) return;
    lightboxIndex = (lightboxIndex + dir + lightboxImages.length) % lightboxImages.length;
    document.getElementById('lightbox-img').src = lightboxImages[lightboxIndex];
    updateLightboxUI();
}

function updateLightboxUI() {
    const counter = document.getElementById('lightbox-counter');
    const prev = document.getElementById('lightbox-prev');
    const next = document.getElementById('lightbox-next');
    
    if (counter) counter.innerText = `${lightboxIndex + 1} / ${lightboxImages.length}`;
    
    const showNav = lightboxImages.length > 1;
    if (prev) prev.style.display = showNav ? 'block' : 'none';
    if (next) next.style.display = showNav ? 'block' : 'none';
}

// Swipe Logic for Lightbox
let touchStartX = 0;
document.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
}, {passive: true});

document.addEventListener('touchend', e => {
    const lightbox = document.getElementById('lightbox-modal');
    if (!lightbox || lightbox.classList.contains('hidden')) return;

    let touchEndX = e.changedTouches[0].clientX;
    if (touchStartX - touchEndX > 50) changeLightboxImage(1); // Left Swipe
    if (touchEndX - touchStartX > 50) changeLightboxImage(-1); // Right Swipe
}, {passive: true});

function closeDetails() {
    document.getElementById('product-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// 3D Scroll Reveal Logic
let revealObserver;
function initScrollReveal() {
    revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
            }
        });
    }, { threshold: 0.1 });
}

function observeElements() {
    document.querySelectorAll('.reveal-item').forEach(el => revealObserver.observe(el));
}

// Interactive 3D Tilt Logic (Desktop Only)
function handle3DTilt(e, card) {
    if (window.innerWidth < 768) return; // Disable on mobile for performance
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    card.style.boxShadow = `0 40px 80px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(123, 44, 255, 0.3)`;
}

function reset3DTilt(card) {
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    card.style.zIndex = "1";
}

// Toast System
function showToast(msg, type = "cart") {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-msg');
    const actionBtn = document.getElementById('toast-action');
    
    if (!toast || !msgEl || !actionBtn) return;

    msgEl.innerText = msg;
    toast.classList.remove('hidden');

    if (type === "cart") {
        actionBtn.innerText = "Go to Cart →";
        actionBtn.onclick = () => { toggleCart(); hideToast(); };
        actionBtn.classList.remove('hidden');
    } else if (type === "compare" && compareList.length === 2) {
        actionBtn.innerText = "Compare Now →";
        actionBtn.onclick = () => { openCompareModal(); hideToast(); };
        actionBtn.classList.remove('hidden');
    } else {
        actionBtn.classList.add('hidden');
    }

    setTimeout(hideToast, 4000);
}

function hideToast() {
    document.getElementById('toast').classList.add('hidden');
}

// Pagination Logic
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const container = document.getElementById('pagination-controls');
    if (!container) return;

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button onclick="currentPage=${i}; renderProducts(false, true);" class="w-14 h-14 rounded-2xl font-black uppercase transition ${currentPage === i ? 'bg-neon-gradient text-white shadow-xl shadow-purple-500/20' : 'bg-white/5 border border-white/5 text-white/30 hover:text-white hover:border-white/20'}">${i}</button>`;
    }
    container.innerHTML = html;
}