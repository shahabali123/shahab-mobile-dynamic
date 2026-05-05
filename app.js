// State Management
let cart = JSON.parse(localStorage.getItem('shahab_cart')) || [];
let compareList = JSON.parse(localStorage.getItem('shahab_compare')) || [];
let currentPage = 1;
const itemsPerPage = 8;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    updateCompareUI();
    renderProducts();
});

// Render Products
function renderProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    let filtered = products;
    
    // Apply Brand Filter
    const brand = document.getElementById('brandFilter')?.value || 'All';
    if (brand !== 'All') filtered = filtered.filter(p => p.brand === brand);

    // Apply Offers Filter (if on offers page)
    if (window.filterOnlyOffers) {
        filtered = filtered.filter(p => p.freeDelivery === true);
    }

    // Pagination
    const start = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);

    grid.innerHTML = paginated.map(product => `
        <div class="product-card bg-white rounded-3xl p-5 border border-slate-100 group relative">
            ${product.freeDelivery ? '<span class="absolute top-4 left-4 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full z-10 shadow-lg shadow-green-100">FREE DELIVERY</span>' : ''}
            <div class="aspect-square bg-slate-50 rounded-2xl mb-5 flex items-center justify-center overflow-hidden cursor-pointer" onclick="showDetails(${product.id})">
                <img src="${product.images[0]}" class="w-4/5 h-4/5 object-contain group-hover:scale-110 transition duration-500">
            </div>
            <p class="text-blue-600 font-bold text-[10px] tracking-widest uppercase mb-1">${product.brand}</p>
            <h3 class="font-bold text-slate-800 mb-2 truncate" title="${product.name}">${product.name}</h3>
            <div class="flex justify-between items-center mb-4">
                <p class="text-xl font-extrabold text-slate-900">Rs. ${product.price.toLocaleString()}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="addToCart(${product.id})" class="flex-grow bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-100">Add to Cart</button>
                <button onclick="toggleCompare(${product.id})" class="w-12 h-12 flex items-center justify-center rounded-xl border-2 ${compareList.includes(product.id) ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-100 text-slate-400 hover:border-blue-600 hover:text-blue-600'} transition">
                    <i class="fas fa-balance-scale"></i>
                </button>
            </div>
        </div>
    `).join('');

    renderPagination(filtered.length);
}

// Comparison Logic
function toggleCompare(id) {
    const index = compareList.indexOf(id);
    if (index > -1) {
        compareList.splice(index, 1);
        showToast("Removed from comparison");
    } else {
        if (compareList.length >= 2) {
            showToast("You can only compare 2 products at a time!");
            return;
        }
        compareList.push(id);
        showToast("Added to comparison");
    }
    localStorage.setItem('shahab_compare', JSON.stringify(compareList));
    updateCompareUI();
    renderProducts();
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
        <div class="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
            <img src="${p.images[0]}" class="w-32 h-32 object-contain mb-4 rounded-xl">
            <h4 class="font-bold text-lg mb-2 text-slate-800">${p.name}</h4>
            <p class="text-2xl font-black text-blue-600 mb-6">Rs. ${p.price.toLocaleString()}</p>
            <div class="w-full space-y-3">
                <div class="bg-white p-3 rounded-xl shadow-sm flex justify-between"><span class="text-slate-400 text-xs font-bold">RAM</span> <span class="font-bold text-sm">${p.specs.ram}</span></div>
                <div class="bg-white p-3 rounded-xl shadow-sm flex justify-between"><span class="text-slate-400 text-xs font-bold">STORAGE</span> <span class="font-bold text-sm">${p.specs.storage}</span></div>
                <div class="bg-white p-3 rounded-xl shadow-sm flex justify-between"><span class="text-slate-400 text-xs font-bold">BATTERY</span> <span class="font-bold text-sm">${p.specs.battery}</span></div>
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
    renderProducts();
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
    showToast(`Added ${product.name} to cart`);
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

// Toast System
function showToast(msg) {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-msg');
    msgEl.innerText = msg;
    toast.classList.remove('hidden');
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
        html += `<button onclick="currentPage=${i}; renderProducts(); window.scrollTo({top: 400, behavior: 'smooth'});" class="w-10 h-10 rounded-xl font-bold transition ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-600'}">${i}</button>`;
    }
    container.innerHTML = html;
}