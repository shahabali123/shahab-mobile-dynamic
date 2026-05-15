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
            document.querySelectorAll('[id^="search-suggestions"]').forEach(el => el.classList.add('hidden'));
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
    const searchInp = document.getElementById('searchBar');
    const searchInpDesktop = document.getElementById('searchBarDesktop');
    const query = (searchInp?.value || searchInpDesktop?.value || "").toLowerCase();
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
            ? `<button onclick="inquireInstallment(${product.id})" class="flex-grow bg-slate-900 text-white py-2 rounded-lg font-bold text-[9px] sm:text-xs hover:bg-slate-800 transition flex items-center justify-center gap-1"><i class="fas fa-hand-holding-usd text-indigo-400"></i> Inquire</button>`
            : `<button onclick="addToCart(${product.id})" class="flex-grow bg-indigo-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">Add to Cart</button>`;

        return `
        <div class="product-card reveal-item bg-white rounded-xl sm:rounded-2xl p-2 sm:p-4 border border-slate-100 group relative transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div class="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-1 sm:gap-2 z-10">
                ${product.badge ? `<span class="${product.badge.color} text-white text-[8px] sm:text-[10px] font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md">${product.badge.text}</span>` : ''}
                ${product.freeDelivery ? '<span class="bg-emerald-500 text-white text-[8px] sm:text-[10px] font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md">Free Delivery</span>' : ''}
                ${product.installment ? '<span class="bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1"><i class="fas fa-calendar-alt text-[8px]"></i> Installment</span>' : ''}
            </div>
            
            <div class="aspect-square bg-slate-50 rounded-2xl mb-4 flex items-center justify-center overflow-hidden cursor-pointer" onclick="showDetails(${product.id})">
                <img src="${product.images[0]}" class="w-4/5 h-4/5 object-contain group-hover:scale-110 transition-transform duration-500">
            </div>
            
            <p class="text-indigo-600 font-bold text-[10px] tracking-widest uppercase mb-1">${product.brand}</p>
            <h3 class="font-bold text-slate-800 mb-1 sm:mb-2 truncate text-[11px] sm:text-sm" title="${product.name}">${product.name}</h3>
            <div class="flex justify-between items-center mb-3 sm:mb-4">
                <p class="text-sm sm:text-lg font-extrabold text-slate-900">Rs. ${product.price.toLocaleString()}</p>
            </div>
            <div class="flex gap-2 relative z-20">
                ${mainBtnHtml}
                <button onclick="toggleCompare(${product.id})" class="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg sm:rounded-xl border-2 ${compareList.includes(product.id) ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-100 text-slate-400 hover:border-indigo-600 hover:text-indigo-600'} transition text-xs sm:text-base">
                    <i class="fas fa-balance-scale"></i>
                </button>
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

function toggleFilters() {
    const dropdown = document.getElementById('filters-dropdown');
    dropdown?.classList.toggle('hidden');
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const overlay = document.getElementById('menu-overlay');
    if (!menu) return;
    
    const isOpening = menu.classList.contains('translate-x-full');
    
    menu.classList.toggle('translate-x-full');
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
        <div class="bg-white/10 p-2 sm:p-4 rounded-xl border border-white/10 flex flex-col items-center text-center w-full overflow-hidden">
            <img src="${p.images[0]}" class="w-10 h-10 sm:w-20 sm:h-20 object-contain mb-2 rounded-lg">
            <h4 class="font-bold text-[10px] sm:text-sm mb-1 text-white line-clamp-1">${p.name}</h4>
            <p class="text-[9px] sm:text-lg font-black text-blue-400 mb-2 sm:mb-4">Rs. ${p.price.toLocaleString()}</p>
            <div class="w-full space-y-2">
                <div class="bg-white/5 p-1 rounded-lg flex justify-between items-center gap-1"><span class="text-white/40 text-[6px] sm:text-[8px] font-bold uppercase shrink-0">RAM</span> <span class="font-bold text-[7px] sm:text-xs text-white truncate text-right">${p.specs.ram}</span></div>
                <div class="bg-white/5 p-1 rounded-lg flex justify-between items-center gap-1"><span class="text-white/40 text-[6px] sm:text-[8px] font-bold uppercase shrink-0">STR</span> <span class="font-bold text-[7px] sm:text-xs text-white truncate text-right">${p.specs.storage}</span></div>
                <div class="bg-white/5 p-1 rounded-lg flex justify-between items-center gap-1"><span class="text-white/40 text-[6px] sm:text-[8px] font-bold uppercase shrink-0">BAT</span> <span class="font-bold text-[7px] sm:text-xs text-white truncate text-right">${p.specs.battery}</span></div>
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
            <div class="flex gap-3 sm:gap-4 bg-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-white/20 shadow-sm">
                <img src="${item.images[0]}" class="w-12 h-12 sm:w-16 sm:h-16 object-contain">
                <div class="flex-grow">
                    <h4 class="font-bold text-white text-xs sm:text-sm mb-1">${item.name}</h4>
                    <p class="text-blue-400 font-bold text-xs sm:text-sm mb-2">Rs. ${item.price.toLocaleString()}</p>
                    <div class="flex items-center gap-2">
                        <button onclick="changeQty(${item.id}, -1)" class="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs text-white hover:bg-white/20">-</button>
                        <span class="font-bold text-white text-sm">${item.quantity}</span>
                        <button onclick="changeQty(${item.id}, 1)" class="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-xs text-white hover:bg-white/20">+</button>
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
    const suggestions = e.target.id === 'searchBarDesktop' 
        ? document.getElementById('search-suggestions-desktop') 
        : document.getElementById('search-suggestions');
    
    if (!suggestions) return;

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
            <div class="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer transition border-b border-white/5 last:border-0" onclick="showDetails(${p.id})">
                <img src="${p.images[0]}" class="w-12 h-12 object-contain rounded-lg">
                <div>
                    <p class="font-bold text-white text-sm">${p.name}</p>
                    <p class="text-blue-400 font-bold text-xs uppercase">Rs. ${p.price.toLocaleString()}</p>
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
    brandBadge.innerHTML = `<span class="bg-indigo-50 text-indigo-600 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-100">${p.brand}</span>`;

    const mainImg = document.getElementById('modal-main-image');
    mainImg.innerHTML = `<img src="${p.images[0]}" class="w-full h-full max-h-[220px] sm:max-h-[350px] object-contain cursor-zoom-in" onclick="openLightbox()">`;

    const thumbnails = document.getElementById('modal-thumbnails');
    thumbnails.innerHTML = p.images.map((img, idx) => `
        <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-lg border border-slate-200 flex-shrink-0 cursor-pointer overflow-hidden p-1 bg-white hover:border-indigo-600 transition" onclick="updateMainImage(${idx})">
            <img src="${img}" class="w-full h-full object-contain">
        </div>
    `).join('');

    const specs = document.getElementById('modal-specs');
    specs.innerHTML = `
        <div class="bg-white/5 p-2 rounded-lg text-center border border-white/5"><p class="text-[7px] text-white/40 font-bold uppercase">RAM</p><p class="text-[10px] sm:text-xs font-bold text-white">${p.specs.ram}</p></div>
        <div class="bg-white/5 p-2 rounded-lg text-center border border-white/5"><p class="text-[7px] text-white/40 font-bold uppercase">Storage</p><p class="text-[10px] sm:text-xs font-bold text-white">${p.specs.storage}</p></div>
        <div class="bg-white/5 p-2 rounded-lg text-center border border-white/5"><p class="text-[7px] text-white/40 font-bold uppercase">Battery</p><p class="text-[10px] sm:text-xs font-bold text-white">${p.specs.battery}</p></div>
    `;
    specs.className = "grid grid-cols-3 gap-2 sm:gap-4";

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
            installmentTextEl.className = "text-emerald-600 font-bold text-sm mb-4";
            installmentTextEl.innerText = p.installmentText;
            modalActions.insertBefore(installmentTextEl, addBtn);
        }
        
        const calcBox = document.createElement('div');
        calcBox.id = 'modal-calc-box';
        calcBox.className = "mt-4 bg-white/5 p-3 rounded-xl border border-white/5 mb-4";
        calcBox.innerHTML = `
            <p class="text-[9px] font-bold text-white/40 uppercase mb-2">Installment Estimate</p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div class="bg-white/5 p-2 rounded-lg text-center"><p class="text-[8px] text-white/40 font-bold uppercase">Advance</p><p class="text-[10px] font-bold text-white">Rs. ${downPayment.toLocaleString()}</p></div>
                ${planResults.map(plan => `
                    <div class="bg-white/5 p-2 rounded-lg text-center"><p class="text-[8px] text-white/40 font-bold uppercase">${plan.months} Mo</p><p class="text-[10px] font-bold text-neon-blue">Rs. ${plan.perMonth.toLocaleString()}</p></div>
                `).join('')}
            </div>
        `;
        modalActions.insertBefore(calcBox, addBtn);

        const instBtn = document.createElement('button');
        instBtn.id = 'modal-installment-btn';
        instBtn.className = "w-full mt-3 bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 text-sm";
        instBtn.innerHTML = `<i class="fas fa-hand-holding-usd text-indigo-400"></i> Inquire Plan`;
        instBtn.onclick = () => inquireInstallment(p.id);
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
        html += `<button onclick="currentPage=${i}; renderProducts(false, true);" class="w-10 h-10 rounded-xl font-bold text-sm transition ${currentPage === i ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-600'}">${i}</button>`;
    }
    container.innerHTML = html;
}