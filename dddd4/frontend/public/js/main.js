// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// API Configuration
const API_BASE_URL = 'http://localhost:3000';

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', savedTheme);
themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

// Toast Notification
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, duration);
}

// Modal Handling
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const loginBtn = document.getElementById('login-btn');
const signupLink = document.getElementById('signup-link');
const loginLink = document.getElementById('login-link');
const closeButtons = document.querySelectorAll('.close');

function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

if (loginBtn) loginBtn.addEventListener('click', () => openModal(loginModal));
if (signupLink) signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(loginModal);
    openModal(signupModal);
});
if (loginLink) loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal(signupModal);
    openModal(loginModal);
});

if (closeButtons) closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        closeModal(loginModal);
        closeModal(signupModal);
    });
});

window.addEventListener('click', (e) => {
    if (loginModal && e.target === loginModal) closeModal(loginModal);
    if (signupModal && e.target === signupModal) closeModal(signupModal);
});

// Search Functionality
const searchInput = document.querySelector('.nav-search input');
const searchButton = document.querySelector('.nav-search button');

function performSearch() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm) {
        window.location.href = `/?search=${encodeURIComponent(searchTerm)}`;
    }
}

if (searchButton) searchButton.addEventListener('click', performSearch);
if (searchInput) searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

// Category Navigation
const categoryCards = document.querySelectorAll('.category-card');
if (categoryCards) categoryCards.forEach(card => {
    card.addEventListener('click', () => {
        const category = card.dataset.category;
        window.location.href = `/?category=${category}`;
    });
});

// Loading State
function showLoading(element) {
    element.classList.add('skeleton');
}

function hideLoading(element) {
    element.classList.remove('skeleton');
}

// Remove static sampleProducts and use backend API for all product data
window.allProducts = [];

// Fetch and display all products from backend on page load
async function fetchAndDisplayAllProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    try {
        showLoading(container);
        const response = await fetch(`${API_BASE_URL}/api/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const products = await response.json();
        window.allProducts = products;
        hideLoading(container);
        renderProducts(products);
        initializeProductFilters(products, container);
    } catch (error) {
        hideLoading(container);
        container.innerHTML = '<p class="no-products">No products found</p>';
        showToast('Failed to load products');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayAllProducts();
    updateCartCount();
    updateWishlistCount();
    // ...existing category/nav event listeners...

    // My Orders button scrolls to orders section
    const ordersBtn = document.getElementById('ordersBtn');
    if (ordersBtn) {
        ordersBtn.addEventListener('click', () => {
            const ordersSection = document.getElementById('orders');
            if (ordersSection) {
                ordersSection.scrollIntoView({ behavior: 'smooth' });
                // Optionally, trigger loading orders if not already loaded
                if (typeof loadOrders === 'function') loadOrders();
            }
        });
    }
});

// Product Rendering
function renderProducts(products) {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p class="text-muted">No products found</p></div>';
        return;
    }
    container.innerHTML = `
        <div class="row">
            ${products.map(product => `
                <div class="col-md-4 col-lg-3 mb-4">
                    <div class="card h-100 product-card">
                        <img src="${product.imageUrl}" alt="${product.name}" class="card-img-top" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x180?text=No+Image';">
                        <div class="card-body">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text">${product.description}</p>
                            <p class="price">$${product.price}</p>
                            <div class="d-grid gap-2">
                                <button class="btn btn-success buy-now" data-product-id="${product.id}">
                                    Buy Now
                                </button>
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
            `).join('')}
        </div>
    `;

    // Add event listeners to buttons
    container.querySelectorAll('.buy-now').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.closest('button').dataset.productId;
            handleBuyNow(productId);
        });
    });

    container.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.closest('button').dataset.productId;
            addToCart(productId);
        });
    });

    container.querySelectorAll('.add-to-wishlist').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.closest('button').dataset.productId;
            addToWishlist(productId);
        });
    });
}

// Handle Buy Now
async function handleBuyNow(productId) {
    try {
        // showLoading(); // Removed because no element is passed
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please login to continue', 'warning');
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/purchases`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                productId,
                quantity: 1
            })
        });

        if (!response.ok) {
            throw new Error('Purchase failed');
        }

        const result = await response.json();
        showToast(`Purchase successful! Total: $${result.totalAmount.toFixed(2)}`, 'success');
        if (result.product) {
            showPurchaseConfirmation(result.product, 1, result.totalAmount);
        } else {
            showToast('Purchase successful, but product details missing.', 'success');
        }
    } catch (error) {
        console.error('Error making purchase:', error);
        showToast('Error making purchase', 'danger');
    } finally {
        // hideLoading(); // Removed because no element is passed
    }
}

// Cart and Wishlist Functions
async function addToCart(productId) {
    console.log('[DEBUG] addToCart called with productId:', productId);
    try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || !user) {
            console.log('[DEBUG] No token or user found.');
            showToast('Please login to add items to cart');
            openModal(loginModal);
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/cart/${productId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('[DEBUG] Cart API response:', response);

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                showToast('Session expired. Please login again.');
                openModal(loginModal);
                return;
            }
            const data = await response.json();
            console.log('[DEBUG] Cart API error data:', data);
            throw new Error(data.message || 'Failed to add to cart');
        }

        // Instantly increment the cart count visually
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = parseInt(cartCount.textContent || '0', 10) + 1;
        }
        await updateCartCount();
        showToast('Added to cart successfully');
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast(error.message || 'Failed to add to cart');
    }
}

async function addToWishlist(productId) {
    console.log('[DEBUG] addToWishlist called with productId:', productId);
    try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || !user) {
            console.log('[DEBUG] No token or user found.');
            showToast('Please login to add items to wishlist');
            openModal(loginModal);
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/wishlist/${productId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('[DEBUG] Wishlist API response:', response);

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                showToast('Session expired. Please login again.');
                openModal(loginModal);
                return;
            }
            const data = await response.json();
            console.log('[DEBUG] Wishlist API error data:', data);
            throw new Error(data.message || 'Failed to add to wishlist');
        }

        // Instantly increment the wishlist count visually
        const wishlistCount = document.getElementById('wishlistCount');
        if (wishlistCount) {
            wishlistCount.textContent = parseInt(wishlistCount.textContent || '0', 10) + 1;
        }
        await updateWishlistCount();
        showToast('Added to wishlist successfully');
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        showToast(error.message || 'Failed to add to wishlist');
    }
}

// Update cart count
async function updateCartCount() {
    try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || !user) {
            const cartCount = document.getElementById('cartCount');
            if (cartCount) {
                cartCount.textContent = '0';
            }
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/cart`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            const cartCount = document.getElementById('cartCount');
            if (cartCount) {
                cartCount.textContent = '0';
            }
            return;
        }

        if (response.ok) {
            const items = await response.json();
            const cartCount = document.getElementById('cartCount');
            if (cartCount) {
                cartCount.textContent = items.length;
            }
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = '0';
        }
    }
}

// Update wishlist count
async function updateWishlistCount() {
    try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (!token || !user) {
            const wishlistCount = document.getElementById('wishlistCount');
            if (wishlistCount) {
                wishlistCount.textContent = '0';
            }
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            const wishlistCount = document.getElementById('wishlistCount');
            if (wishlistCount) {
                wishlistCount.textContent = '0';
            }
            return;
        }

        if (response.ok) {
            const items = await response.json();
            const wishlistCount = document.getElementById('wishlistCount');
            if (wishlistCount) {
                wishlistCount.textContent = items.length;
            }
        }
    } catch (error) {
        console.error('Error updating wishlist count:', error);
        const wishlistCount = document.getElementById('wishlistCount');
        if (wishlistCount) {
            wishlistCount.textContent = '0';
        }
    }
}

// Product Filtering and Sorting
function filterProducts(filters, products) {
    let filteredProducts = [...products];

    if (filters.category) {
        filteredProducts = filteredProducts.filter(product =>
            product.category && product.category.toLowerCase() === filters.category.toLowerCase()
        );
    }

    if (filters.minPrice) {
        filteredProducts = filteredProducts.filter(product =>
            product.price >= filters.minPrice
        );
    }

    if (filters.maxPrice) {
        filteredProducts = filteredProducts.filter(product =>
            product.price <= filters.maxPrice
        );
    }

    if (filters.sortBy) {
        filteredProducts.sort((a, b) => {
            switch (filters.sortBy) {
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });
    }

    return filteredProducts;
}

function applyFilters() {
    const container = document.getElementById('productsContainer');
    const filters = {
        category: document.getElementById('categoryFilter')?.value,
        minPrice: parseFloat(document.getElementById('minPrice')?.value) || null,
        maxPrice: parseFloat(document.getElementById('maxPrice')?.value) || null,
        sortBy: document.getElementById('sortBy')?.value
    };
    const filtered = filterProducts(filters, window.allProducts);
    renderProducts(filtered);
}

function initializeProductFilters(products, container) {
    const filterForm = document.createElement('form');
    filterForm.className = 'mb-4';
    filterForm.innerHTML = `
        <div class="row g-3">
            <div class="col-md-3">
                <select class="form-select" id="categoryFilter">
                    <option value="">All Categories</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="kids">Kids</option>
                </select>
            </div>
            <div class="col-md-3">
                <input type="number" class="form-control" id="minPrice" placeholder="Min Price">
            </div>
            <div class="col-md-3">
                <input type="number" class="form-control" id="maxPrice" placeholder="Max Price">
            </div>
            <div class="col-md-3">
                <select class="form-select" id="sortBy">
                    <option value="">Sort By</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                </select>
            </div>
        </div>
    `;
    const productsSection = document.querySelector('.products-section');
    if (productsSection) {
        productsSection.insertBefore(filterForm, productsSection.firstChild);
    }
    // Add event listeners to filters
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('minPrice').addEventListener('change', applyFilters);
    document.getElementById('maxPrice').addEventListener('change', applyFilters);
    document.getElementById('sortBy').addEventListener('change', applyFilters);
}

// Load products by category
async function loadProductsByCategory(category, container) {
    try {
        showLoading(container);
        const response = await fetch(`${API_BASE_URL}/api/products?category=${category}`);
        const products = await response.json();
        hideLoading(container);
        renderProducts(products, container);
        initializeProductFilters(products, container);
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Error loading products', 'danger');
        hideLoading(container);
    }
}

// Category Navigation (override default link behavior)
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const category = card.dataset.category;
            const container = document.getElementById('featured-products') || document.getElementById('productsContainer');
            if (container) {
                loadProductsByCategory(category, container);
            }
        });
    });
    // Optionally, override nav links for Men/Women/Kids
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href').startsWith('/category/')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = link.getAttribute('href').split('/').pop();
                const container = document.getElementById('featured-products') || document.getElementById('productsContainer');
                if (container) {
                    loadProductsByCategory(category, container);
                }
            });
        }
    });
});

// Render cart items in modal
async function renderCartModal() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    if (!cartItemsContainer) return;
    if (!token || !user) {
        cartItemsContainer.innerHTML = '<p class="text-center text-muted">Please login to view your cart.</p>';
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/api/cart`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch cart items');
        const items = await response.json();
        if (!items.length) {
            cartItemsContainer.innerHTML = '<p class="text-center text-muted">Your cart is empty.</p>';
            return;
        }
        cartItemsContainer.innerHTML = `
            <ul class="list-group">
                ${items.map(item => `
                    <li class="list-group-item d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center">
                            <img src="${item.imageUrl || item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 16px;">
                            <div>
                                <div class="fw-bold">${item.name}</div>
                                <div class="text-muted">$${item.price}</div>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-danger remove-from-cart" data-product-id="${item.id}" title="Remove"><i class="fas fa-trash"></i></button>
                    </li>
                `).join('')}
            </ul>
        `;
        // Add event listeners for remove buttons
        cartItemsContainer.querySelectorAll('.remove-from-cart').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const productId = e.target.closest('button').dataset.productId;
                await removeFromCart(productId);
                await renderCartModal();
                await updateCartCount();
            });
        });
    } catch (error) {
        cartItemsContainer.innerHTML = '<p class="text-center text-danger">Failed to load cart items.</p>';
    }
}

// Remove from cart
async function removeFromCart(productId) {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || !user) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/cart/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to remove from cart');
        showToast('Removed from cart');
    } catch (error) {
        showToast('Failed to remove from cart');
    }
}

// Open cart modal and render items
const cartBtn = document.getElementById('cartBtn');
if (cartBtn) {
    cartBtn.addEventListener('click', renderCartModal);
}

// Render wishlist items in modal
async function renderWishlistModal() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const wishlistItemsContainer = document.getElementById('wishlistItemsContainer');
    if (!wishlistItemsContainer) return;
    if (!token || !user) {
        wishlistItemsContainer.innerHTML = '<p class="text-center text-muted">Please login to view your wishlist.</p>';
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to fetch wishlist items');
        const items = await response.json();
        if (!items.length) {
            wishlistItemsContainer.innerHTML = '<p class="text-center text-muted">Your wishlist is empty.</p>';
            return;
        }
        wishlistItemsContainer.innerHTML = `
            <ul class="list-group">
                ${items.map(item => `
                    <li class="list-group-item d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center">
                            <img src="${item.imageUrl || item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 16px;">
                            <div>
                                <div class="fw-bold">${item.name}</div>
                                <div class="text-muted">$${item.price}</div>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-danger remove-from-wishlist" data-product-id="${item.id}" title="Remove"><i class="fas fa-trash"></i></button>
                    </li>
                `).join('')}
            </ul>
        `;
        // Add event listeners for remove buttons
        wishlistItemsContainer.querySelectorAll('.remove-from-wishlist').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const productId = e.target.closest('button').dataset.productId;
                await removeFromWishlist(productId);
                await renderWishlistModal();
                await updateWishlistCount();
            });
        });
    } catch (error) {
        wishlistItemsContainer.innerHTML = '<p class="text-center text-danger">Failed to load wishlist items.</p>';
    }
}

// Remove from wishlist
async function removeFromWishlist(productId) {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || !user) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/wishlist/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to remove from wishlist');
        showToast('Removed from wishlist');
    } catch (error) {
        showToast('Failed to remove from wishlist');
    }
}

// Open wishlist modal and render items
const wishlistBtn = document.getElementById('wishlistBtn');
if (wishlistBtn) {
    wishlistBtn.addEventListener('click', renderWishlistModal);
}

// Login form handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    if (!email || !password) {
        showToast('Please enter both email and password', 'danger');
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok && data.token && data.user) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showToast('Login successful');
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            if (loginModal) loginModal.hide();
            updateUIForLoggedInUser();
        } else {
            showToast(data.message || 'Login failed', 'danger');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed', 'danger');
    }
});

// Signup form handler
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    if (!name || !email || !password) {
        showToast('Please fill all fields', 'danger');
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();
        if (response.ok && data.token && data.user) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            showToast('Signup successful');
            const signupModal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
            if (signupModal) signupModal.hide();
            updateUIForLoggedInUser();
        } else {
            showToast(data.message || 'Signup failed', 'danger');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showToast('Signup failed', 'danger');
    }
});

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const user = JSON.parse(localStorage.getItem('user'));
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userDropdown = document.getElementById('userDropdown');

    if (user) {
        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        userDropdown.innerHTML = `<i class="fas fa-user"></i> ${user.name}`;
    } else {
        loginBtn.style.display = 'block';
        signupBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        userDropdown.innerHTML = '<i class="fas fa-user"></i>';
    }
}

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateUIForLoggedInUser();
    showToast('Logged out successfully');
});

// Initialize UI state
document.addEventListener('DOMContentLoaded', () => {
    updateUIForLoggedInUser();
    // ... rest of the initialization code ...
});

function showPurchaseConfirmation(product, quantity, totalAmount) {
    // Show a modal or toast with purchase details
    alert(`Purchase successful!\nProduct: ${product.name}\nQuantity: ${quantity}\nTotal: $${totalAmount}`);
} 