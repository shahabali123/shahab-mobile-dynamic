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
            navigator.serviceWorker.register('/service-worker.js')
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

    grid.innerHTML = paginated.map(product => `
        <div class="product-card bg-white rounded-3xl p-5 border border-slate-100 group relative">
            <div class="absolute top-4 left-4 flex flex-col gap-2 z-10">
                ${product.badge ? `<span class="${product.badge.color} text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">${product.badge.text}</span>` : ''}
                ${product.freeDelivery ? '<span class="bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-green-100">FREE DELIVERY</span>' : ''}
                ${product.installment ? '<span class="bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1"><i class="fas fa-calendar-alt text-[8px]"></i> Installment</span>' : ''}
                ${product.installmentText ? `<span class="bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">${product.installmentText}</span>` : ''}
            </div>
            
            <div class="aspect-square bg-slate-50 rounded-2xl mb-5 flex items-center justify-center overflow-hidden cursor-pointer" onclick="showDetails(${product.id})">
                <img src="${product.images[0]}" class="w-4/5 h-4/5 object-contain group-hover:scale-110 transition duration-500">
            </div>
            <p class="text-blue-600 font-bold text-[10px] tracking-widest uppercase mb-1">${product.brand}</p>
            <h3 class="font-bold text-slate-800 mb-2 truncate" title="${product.name}">${product.name}</h3>
            <div class="flex justify-between items-center mb-4">
                <p class="text-xl font-extrabold text-slate-900">Rs. ${product.price.toLocaleString()}</p>
            </div>
            <div class="flex gap-2 relative z-20">
                <button onclick="addToCart(${product.id})" class="flex-grow bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-100">Add to Cart</button>
                <button onclick="toggleCompare(${product.id})" class="w-12 h-12 flex items-center justify-center rounded-xl border-2 ${compareList.includes(product.id) ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-100 text-slate-400 hover:border-blue-600 hover:text-blue-600'} transition">
                    <i class="fas fa-balance-scale"></i>
                </button>
            </div>
        </div>
    `).join('');

    renderPagination(filtered.length);

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
        <div class="bg-slate-50 p-3 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 flex flex-col items-center text-center">
            <img src="${p.images[0]}" class="w-20 h-20 md:w-32 md:h-32 object-contain mb-3 md:mb-4 rounded-xl">
            <h4 class="font-bold text-xs md:text-lg mb-1 md:mb-2 text-slate-800 line-clamp-2 min-h-[2.5rem]">${p.name}</h4>
            <p class="text-sm md:text-2xl font-black text-blue-600 mb-4 md:mb-6">Rs. ${p.price.toLocaleString()}</p>
            <div class="w-full space-y-2 md:space-y-3">
                <div class="bg-white p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center md:items-start gap-1"><span class="text-slate-400 text-[8px] md:text-xs font-bold">RAM</span> <span class="font-bold text-[10px] md:text-sm">${p.specs.ram}</span></div>
                <div class="bg-white p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center md:items-start gap-1"><span class="text-slate-400 text-[8px] md:text-xs font-bold">STORAGE</span> <span class="font-bold text-[10px] md:text-sm">${p.specs.storage}</span></div>
                <div class="bg-white p-2 md:p-3 rounded-lg md:rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center md:items-start gap-1"><span class="text-slate-400 text-[8px] md:text-xs font-bold">BATTERY</span> <span class="font-bold text-[10px] md:text-sm">${p.specs.battery}</span></div>
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
            <div class="flex gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <img src="${item.images[0]}" class="w-16 h-16 object-contain">
                <div class="flex-grow">
                    <h4 class="font-bold text-sm">${item.name}</h4>
                    <p class="text-blue-600 font-bold text-sm">Rs. ${item.price.toLocaleString()}</p>
                    <div class="flex items-center gap-3 mt-2">
                        <button onclick="changeQty(${item.id}, -1)" class="w-6 h-6 rounded-full bg-slate-100">-</button>
                        <span class="font-bold">${item.quantity}</span>
                        <button onclick="changeQty(${item.id}, 1)" class="w-6 h-6 rounded-full bg-slate-100">+</button>
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
            <div class="flex items-center gap-4 p-4 hover:bg-slate-50 cursor-pointer transition border-b border-slate-50 last:border-0" onclick="showDetails(${p.id})">
                <img src="${p.images[0]}" class="w-12 h-12 object-contain rounded-lg">
                <div>
                    <p class="font-bold text-slate-800 text-sm">${p.name}</p>
                    <p class="text-blue-600 font-bold text-xs">Rs. ${p.price.toLocaleString()}</p>
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
    brandBadge.innerHTML = `<span class="bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">${p.brand}</span>`;

    const mainImg = document.getElementById('modal-main-image');
    mainImg.innerHTML = `<img src="${p.images[0]}" class="w-4/5 h-4/5 object-contain cursor-zoom-in" onclick="openLightbox()">`;

    const thumbnails = document.getElementById('modal-thumbnails');
    thumbnails.innerHTML = p.images.map((img, idx) => `
        <div class="w-16 h-16 md:w-20 md:h-20 rounded-xl border border-slate-100 flex-shrink-0 cursor-pointer overflow-hidden p-2 bg-white hover:border-blue-600 transition" onclick="updateMainImage(${idx})">
            <img src="${img}" class="w-full h-full object-contain">
        </div>
    `).join('');

    const specs = document.getElementById('modal-specs');
    specs.innerHTML = `
        <div class="bg-slate-50 p-3 rounded-xl text-center"><p class="text-[10px] text-slate-400 font-bold uppercase mb-1">RAM</p><p class="text-sm font-bold text-slate-700">${p.specs.ram}</p></div>
        <div class="bg-slate-50 p-3 rounded-xl text-center"><p class="text-[10px] text-slate-400 font-bold uppercase mb-1">Storage</p><p class="text-sm font-bold text-slate-700">${p.specs.storage}</p></div>
        <div class="bg-slate-50 p-3 rounded-xl text-center"><p class="text-[10px] text-slate-400 font-bold uppercase mb-1">Battery</p><p class="text-sm font-bold text-slate-700">${p.specs.battery}</p></div>
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
            installmentTextEl.className = "text-blue-600 font-bold text-sm mb-4";
            installmentTextEl.innerText = p.installmentText;
            modalActions.insertBefore(installmentTextEl, addBtn);
        }

        const calcBox = document.createElement('div');
        calcBox.id = 'modal-calc-box';
        calcBox.className = "mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4";
        calcBox.innerHTML = `
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Installment Estimate (${config.advancePercentage}% Advance)</p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div class="bg-white p-2 rounded-lg text-center shadow-sm border border-slate-100"><p class="text-[9px] text-slate-400 font-bold mb-1">Advance</p><p class="text-[10px] font-bold text-slate-800">Rs. ${downPayment.toLocaleString()}</p></div>
                ${planResults.map(plan => `
                    <div class="bg-white p-2 rounded-lg text-center shadow-sm border border-slate-100"><p class="text-[9px] text-slate-400 font-bold mb-1">${plan.months} Months</p><p class="text-[10px] font-bold text-blue-600">Rs. ${plan.perMonth.toLocaleString()}/mo</p></div>
                `).join('')}
            </div>
        `;
        modalActions.insertBefore(calcBox, addBtn);

        const instBtn = document.createElement('button');
        instBtn.id = 'modal-installment-btn';
        instBtn.className = "w-full mt-3 bg-slate-100 text-slate-900 py-4 rounded-2xl font-bold hover:bg-slate-200 transition flex items-center justify-center gap-2 border border-slate-200";
        instBtn.innerHTML = `<i class="fas fa-hand-holding-usd text-blue-600"></i> Inquire Installment Plan`;
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
        html += `<button onclick="currentPage=${i}; renderProducts(false, true);" class="w-10 h-10 rounded-xl font-bold transition ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-600 focus:border-blue-600'}">${i}</button>`;
    }
    container.innerHTML = html;
}