let cart = JSON.parse(localStorage.getItem('shahab_cart')) || [];
let currentPage = 1;
const itemsPerPage = 8;

function renderProducts() {
    const grid = document.getElementById('product-grid');
    const brandFilter = document.getElementById('brandFilter');
    const searchBar = document.getElementById('searchBar');
    
    const brand = brandFilter ? brandFilter.value : "All";
    const search = searchBar ? searchBar.value.toLowerCase() : "";

    const filtered = products.filter(p => 
        (window.filterOnlyOffers ? p.oldPrice : true) &&
        (brand === "All" || p.brand === brand) &&
        (p.name.toLowerCase().includes(search) || p.brand.toLowerCase().includes(search))
    );

    // Pagination logic
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

    grid.innerHTML = paginatedItems.map(p => {
        const isOutOfStock = p.stock === 0;
        const isLowStock = p.stock > 0 && p.stock < 5;

        return `
        <div class="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 product-card group relative">
            <div class="absolute top-6 left-6 z-10 flex flex-col gap-2">
                ${p.freeDelivery ? '<span class="bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">FREE DELIVERY</span>' : ''}
                ${isOutOfStock ? '<span class="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">OUT OF STOCK</span>' : ''}
                ${isLowStock ? `<span class="bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">ONLY ${p.stock} LEFT</span>` : ''}
            </div>
            <div class="aspect-square rounded-2xl overflow-hidden bg-slate-50 mb-6 relative">
                <img src="${p.images[0]}" class="w-full h-full object-cover transition duration-500 group-hover:scale-110 cursor-pointer" onclick="viewDetails(${p.id})">
                ${!isOutOfStock ? `
                    <button onclick="addToCart(${p.id})" class="absolute bottom-4 right-4 bg-white text-slate-900 w-12 h-12 rounded-xl shadow-xl flex items-center justify-center translate-y-20 group-hover:translate-y-0 transition duration-300 hover:bg-blue-600 hover:text-white">
                        <i class="fas fa-plus"></i>
                    </button>
                ` : `
                    <div class="absolute inset-0 bg-white/20 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition pointer-events-none text-red-600 font-bold">Sold Out</div>
                `}
            </div>
            <div class="px-2">
                <p class="text-blue-600 font-bold text-xs uppercase tracking-widest mb-1">${p.brand}</p>
                <h3 class="font-bold text-xl mb-1 text-slate-800 line-clamp-1">${p.name}</h3>
                <div class="flex justify-between items-center mt-4">
                    <div>
                        ${p.oldPrice ? `<p class="text-slate-400 line-through text-xs font-bold">Rs. ${p.oldPrice.toLocaleString()}</p>` : ''}
                        <p class="text-slate-900 font-extrabold text-xl">Rs. ${p.price.toLocaleString()}</p>
                    </div>
                    <button onclick="compareProduct(${p.id})" class="text-slate-300 hover:text-blue-500 transition"><i class="fas fa-exchange-alt"></i></button>
                </div>
            </div>
        </div>
    `}).join('');

    updateCartUI();
    renderPaginationControls(totalPages);
}

function renderPaginationControls(totalPages) {
    const container = document.getElementById('pagination-controls');
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="w-12 h-12 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm">
            <i class="fas fa-chevron-left"></i>
        </button>
        <span class="text-sm font-bold text-slate-500 uppercase tracking-widest px-4">Page ${currentPage} of ${totalPages}</span>
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="w-12 h-12 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    container.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    renderProducts();
    window.scrollTo({ top: document.getElementById('product-grid').offsetTop - 100, behavior: 'smooth' });
}

function handleSearch(e) {
    currentPage = 1; // Reset to first page on search
    const query = e.target.value.toLowerCase();
    const suggestionsContainer = document.getElementById('search-suggestions');
    
    if (!query) {
        suggestionsContainer.classList.add('hidden');
        renderProducts();
        return;
    }

    const matches = products.filter(p => 
        p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query)
    ).slice(0, 5);

    if (matches.length > 0) {
        suggestionsContainer.innerHTML = matches.map(p => `
            <div onclick="viewDetails(${p.id}); document.getElementById('search-suggestions').classList.add('hidden');" class="flex items-center gap-4 p-4 hover:bg-blue-50 cursor-pointer transition border-b border-slate-50 last:border-none">
                <img src="${p.images[0]}" class="w-10 h-10 object-cover rounded-lg">
                <div>
                    <p class="font-bold text-slate-800 text-sm">${p.name}</p>
                    <p class="text-xs text-slate-500">${p.brand}</p>
                </div>
            </div>
        `).join('');
        suggestionsContainer.classList.remove('hidden');
    } else {
        suggestionsContainer.classList.add('hidden');
    }
    renderProducts();
}

function viewDetails(id) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;

    document.getElementById('modal-title').innerText = p.name;
    document.getElementById('modal-brand-badge').innerHTML = `<span class="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-blue-100">${p.brand}</span>`;
    document.getElementById('modal-price').innerText = `Rs. ${p.price.toLocaleString()}`;
    document.getElementById('modal-desc').innerText = p.description;
    
    // Gallery System
    const mainImgContainer = document.getElementById('modal-main-image');
    mainImgContainer.innerHTML = `<img src="${p.images[0]}" class="max-w-full max-h-full object-contain animate-in fade-in duration-500" id="current-modal-img">`;
    
    document.getElementById('modal-thumbnails').innerHTML = p.images.map((img, i) => 
        `<img src="${img}" onclick="updateModalImage('${img}')" class="w-20 h-20 object-cover rounded-xl cursor-pointer border-2 border-transparent hover:border-blue-500 transition shadow-sm">`
    ).join('');

    document.getElementById('modal-specs').innerHTML = `
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center"><p class="text-[10px] text-slate-400 font-bold uppercase mb-1">RAM</p><p class="text-sm font-bold">${p.specs.ram}</p></div>
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center"><p class="text-[10px] text-slate-400 font-bold uppercase mb-1">Storage</p><p class="text-sm font-bold">${p.specs.storage}</p></div>
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center"><p class="text-[10px] text-slate-400 font-bold uppercase mb-1">Battery</p><p class="text-sm font-bold">${p.specs.battery}</p></div>
    `;

    // Trust Badges in Modal
    const modalDesc = document.getElementById('modal-desc');
    modalDesc.innerHTML = `
        <div class="flex gap-4 mb-6">
            <div class="flex items-center gap-2 text-[11px] font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100"><i class="fas fa-shield-alt"></i> Official Warranty</div>
            <div class="flex items-center gap-2 text-[11px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100"><i class="fas fa-sync"></i> 7 Days Replacement</div>
        </div>
        ${p.description}
    `;

    const addBtn = document.getElementById('modal-add-btn');
    if (p.stock === 0) {
        addBtn.innerText = "Out of Stock";
        addBtn.disabled = true;
        addBtn.classList.replace('bg-blue-600', 'bg-slate-300');
        addBtn.classList.remove('hover:bg-blue-700');
    } else {
        addBtn.innerText = "Add to Cart";
        addBtn.disabled = false;
        addBtn.classList.replace('bg-slate-300', 'bg-blue-600');
        addBtn.classList.add('hover:bg-blue-700');
        addBtn.onclick = () => { addToCart(p.id); closeDetails(); };
    }

    document.getElementById('product-modal').classList.remove('hidden');
}

function closeDetails() {
    document.getElementById('product-modal').classList.add('hidden');
}

function updateModalImage(src) {
    document.getElementById('current-modal-img').src = src;
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    
    if (product.stock === 0) {
        showToast("Sorry, this item is out of stock!");
        return;
    }

    cart.push(product);
    saveCart();
    showToast(`${product.name} added to cart! Go to cart to place order.`);
}

function compareProduct(id) {
    const p = products.find(prod => prod.id === id);
    alert(`Compare mode for ${p.name} activated! (Feature coming soon)`);
}

function saveCart() {
    localStorage.setItem('shahab_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const itemsContainer = document.getElementById('cart-items');
    const count = document.getElementById('cart-count');
    const total = document.getElementById('cart-total');
    
    count.innerText = cart.length;
    let totalPrice = 0;

    itemsContainer.innerHTML = cart.map((item, index) => {
        totalPrice += item.price;
        return `
            <div class="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm animate-in slide-in-from-right duration-300">
                <img src="${item.images[0]}" class="w-16 h-16 object-cover rounded-xl">
                <div class="flex-grow">
                    <p class="font-bold text-slate-800">${item.name}</p>
                    <p class="text-sm text-blue-600 font-bold">Rs. ${item.price.toLocaleString()}</p>
                </div>
                <button onclick="removeFromCart(${index})" class="w-8 h-8 flex items-center justify-center rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
    }).join('');
    
    total.innerText = totalPrice.toLocaleString();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
}

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    sidebar.classList.toggle('translate-x-full');
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = msg;
    toast.classList.remove('hidden');
    
    if (window.toastTimer) clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(hideToast, 5000);
}

function hideToast() {
    document.getElementById('toast').classList.add('hidden');
}

function checkoutWhatsApp() {
    if (cart.length === 0) return alert("Cart is empty!");

    let message = "Salaam Shahab Mobile! I want to order:\n\n";
    cart.forEach((item, i) => {
        message += `${i+1}. ${item.name} - Rs. ${item.price}\n`;
    });
    message += `\nTotal: Rs. ${document.getElementById('cart-total').innerText}`;
    
    const phone = "923420475187";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('#searchBar') && !e.target.closest('#search-suggestions')) {
        document.getElementById('search-suggestions')?.classList.add('hidden');
    }
});

// Initial Render
renderProducts();
