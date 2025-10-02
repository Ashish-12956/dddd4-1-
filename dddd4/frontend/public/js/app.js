// Theme Management
const themeToggle = document.getElementById('themeToggle');

themeToggle.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggle.innerHTML = `<i class="fas fa-${isDark ? 'moon' : 'sun'}"></i>`;
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
});

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.setAttribute('data-theme', savedTheme);
themeToggle.innerHTML = `<i class="fas fa-${savedTheme === 'dark' ? 'sun' : 'moon'}"></i>`;

// Toast Notification System
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    document.querySelector('.toast-container').appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Loading State Management
function showLoading() {
    const loading = document.createElement('div');
    loading.className = 'loading-spinner';
    loading.id = 'loadingSpinner';
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('loadingSpinner');
    if (loading) {
        loading.remove();
    }
}

// Product Card Template
function createProductCard(product) {
    return `
        <div class="col-md-4 col-lg-3">
            <div class="product-card">
                <img src="${product.imageUrl}" alt="${product.name}" class="card-img-top">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description}</p>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <div class="d-grid gap-2">
                        <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">
                            Add to Cart
                        </button>
                        <button class="btn btn-outline-primary add-to-wishlist" data-product-id="${product.id}">
                            Add to Wishlist
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Load Products
async function loadProducts(category = null) {
    try {
        showLoading();
        const url = category ? `/api/products?category=${category}` : '/api/products';
        const response = await fetch(url);
        const products = await response.json();

        const container = document.getElementById('productsContainer');
        container.innerHTML = products.map(createProductCard).join('');

        // Add event listeners to buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', handleAddToCart);
        });

        document.querySelectorAll('.add-to-wishlist').forEach(button => {
            button.addEventListener('click', handleAddToWishlist);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Error loading products', 'danger');
    } finally {
        hideLoading();
    }
}

// Search Functionality
const searchForm = document.querySelector('form.d-flex');
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = e.target.querySelector('input').value.trim();
    if (!query) return;

    try {
        showLoading();
        const response = await fetch(`/api/products/search/${encodeURIComponent(query)}`);
        const products = await response.json();

        const container = document.getElementById('productsContainer');
        container.innerHTML = products.map(createProductCard).join('');

        // Add event listeners to buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', handleAddToCart);
        });

        document.querySelectorAll('.add-to-wishlist').forEach(button => {
            button.addEventListener('click', handleAddToWishlist);
        });
    } catch (error) {
        console.error('Error searching products:', error);
        showToast('Error searching products', 'danger');
    } finally {
        hideLoading();
    }
});

// Category Navigation
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
        const category = card.dataset.category;
        loadProducts(category);
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartCount();
    updateWishlistCount();
}); 