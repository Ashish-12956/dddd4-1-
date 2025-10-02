// Product State Management
let currentProducts = [];
let currentCategory = null;

// Load products by category
async function loadProductsByCategory(category) {
    try {
        showLoading();
        const response = await fetch(`/api/products?category=${category}`);
        const products = await response.json();

        currentProducts = products;
        currentCategory = category;

        renderProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Error loading products', 'danger');
    } finally {
        hideLoading();
    }
}

// Search products
async function searchProducts(query) {
    try {
        showLoading();
        const response = await fetch(`/api/products/search/${encodeURIComponent(query)}`);
        const products = await response.json();

        currentProducts = products;
        currentCategory = null;

        renderProducts(products);
    } catch (error) {
        console.error('Error searching products:', error);
        showToast('Error searching products', 'danger');
    } finally {
        hideLoading();
    }
}

// Get product recommendations
async function getProductRecommendations(productId) {
    try {
        const response = await fetch(`/api/products/${productId}/recommendations`);
        const recommendations = await response.json();
        return recommendations;
    } catch (error) {
        console.error('Error getting recommendations:', error);
        return [];
    }
}

// Render products
function renderProducts(products) {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted">No products found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="col-md-4 col-lg-3 mb-4">
            <div class="product-card h-100">
                <img src="${product.imageUrl || product.image}" alt="${product.name}" class="card-img-top">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">${product.description}</p>
                    <p class="price">$${product.price.toFixed(2)}</p>
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
    `).join('');

    // Add event listeners to buttons
    document.querySelectorAll('.buy-now').forEach(button => {
        button.addEventListener('click', handleBuyNow);
    });

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', handleAddToCart);
    });

    document.querySelectorAll('.add-to-wishlist').forEach(button => {
        button.addEventListener('click', handleAddToWishlist);
    });
}

// Filter products
function filterProducts(filters) {
    let filteredProducts = [...currentProducts];

    if (filters.category) {
        filteredProducts = filteredProducts.filter(product =>
            product.category === filters.category
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

    renderProducts(filteredProducts);
}

// Initialize product filters
function initializeProductFilters() {
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
    productsSection.insertBefore(filterForm, productsSection.firstChild);

    // Add event listeners to filters
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('minPrice').addEventListener('change', applyFilters);
    document.getElementById('maxPrice').addEventListener('change', applyFilters);
    document.getElementById('sortBy').addEventListener('change', applyFilters);
}

// Apply filters
function applyFilters() {
    const filters = {
        category: document.getElementById('categoryFilter').value,
        minPrice: parseFloat(document.getElementById('minPrice').value) || null,
        maxPrice: parseFloat(document.getElementById('maxPrice').value) || null,
        sortBy: document.getElementById('sortBy').value
    };

    filterProducts(filters);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeProductFilters();
    // Use the sample products data for initial display
    currentProducts = products;
    renderProducts(products);
});

// Sample Products Data
const products = [
    {
        id: 1,
        name: "Classic White T-Shirt",
        price: 24.99,
        category: "T-Shirts",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        description: "Premium cotton t-shirt with a comfortable fit"
    },
    {
        id: 2,
        name: "Slim Fit Jeans",
        price: 49.99,
        category: "Jeans",
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        description: "Modern slim fit jeans with stretch comfort"
    },
    {
        id: 3,
        name: "Casual Hoodie",
        price: 39.99,
        category: "Hoodies",
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        description: "Warm and cozy hoodie for everyday wear"
    },
    {
        id: 4,
        name: "Summer Dress",
        price: 59.99,
        category: "Dresses",
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        description: "Light and flowy summer dress"
    },
    {
        id: 5,
        name: "Leather Jacket",
        price: 129.99,
        category: "Jackets",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        description: "Classic leather jacket with modern styling"
    },
    {
        id: 6,
        name: "Running Shoes",
        price: 89.99,
        category: "Shoes",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        description: "Comfortable running shoes for daily use"
    },
    {
        id: 7,
        name: "Floral Maxi Dress",
        price: 69.99,
        category: "Dresses",
        image: "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        description: "Beautiful floral pattern maxi dress"
    },
    {
        id: 8,
        name: "Denim Jacket",
        price: 79.99,
        category: "Jackets",
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        description: "Classic denim jacket for all seasons"
    },
    {
        id: 9,
        name: "Striped Polo Shirt",
        price: 34.99,
        category: "T-Shirts",
        image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        description: "Casual striped polo shirt"
    },
    {
        id: 10,
        name: "High-Waisted Jeans",
        price: 54.99,
        category: "Jeans",
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        description: "Stylish high-waisted jeans"
    },
    {
        id: 11,
        name: "Winter Boots",
        price: 99.99,
        category: "Shoes",
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        description: "Warm and waterproof winter boots"
    },
    {
        id: 12,
        name: "Knit Sweater",
        price: 44.99,
        category: "Sweaters",
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        description: "Cozy knit sweater for cold days"
    }
];

async function handleAddToCart(event) {
    const productId = event.target.getAttribute('data-product-id');
    try {
        const response = await fetch(`/api/cart/${productId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (response.ok) {
            showToast('Added to cart!');
        } else {
            showToast('Please login to add to cart', 'danger');
        }
    } catch (err) {
        showToast('Error adding to cart', 'danger');
    }
}

async function handleAddToWishlist(event) {
    const productId = event.target.getAttribute('data-product-id');
    try {
        const response = await fetch(`/api/wishlist/${productId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if (response.ok) {
            showToast('Added to wishlist!');
        } else {
            showToast('Please login to add to wishlist', 'danger');
        }
    } catch (err) {
        showToast('Error adding to wishlist', 'danger');
    }
}

// Handle Buy Now
async function handleBuyNow(event) {
    const productId = event.target.dataset.productId;
    const product = currentProducts.find(p => p.id === productId);

    if (!product) {
        showToast('Product not found', 'danger');
        return;
    }

    // Show quantity modal
    const quantity = await showQuantityModal(product);
    if (!quantity) return;

    try {
        showLoading();
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please login to continue', 'warning');
            return;
        }

        const response = await fetch('/api/purchases', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                productId,
                quantity: parseInt(quantity)
            })
        });

        if (!response.ok) {
            throw new Error('Purchase failed');
        }

        const result = await response.json();
        showToast(`Purchase successful! Total: $${result.totalAmount.toFixed(2)}`, 'success');

        // Show purchase confirmation modal
        showPurchaseConfirmation(product, quantity, result.totalAmount);
    } catch (error) {
        console.error('Error making purchase:', error);
        showToast('Error making purchase', 'danger');
    } finally {
        hideLoading();
    }
}

// Show quantity modal
function showQuantityModal(product) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Select Quantity</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>Product: ${product.name}</p>
                        <p>Price: $${product.price.toFixed(2)}</p>
                        <div class="mb-3">
                            <label for="quantity" class="form-label">Quantity:</label>
                            <input type="number" class="form-control" id="quantity" min="1" value="1">
                        </div>
                        <p class="total-price">Total: $${product.price.toFixed(2)}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="confirmQuantity">Confirm</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();

        const quantityInput = modal.querySelector('#quantity');
        const totalPriceElement = modal.querySelector('.total-price');
        const confirmButton = modal.querySelector('#confirmQuantity');

        quantityInput.addEventListener('input', () => {
            const quantity = parseInt(quantityInput.value) || 1;
            const total = product.price * quantity;
            totalPriceElement.textContent = `Total: $${total.toFixed(2)}`;
        });

        confirmButton.addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value) || 1;
            modalInstance.hide();
            modal.addEventListener('hidden.bs.modal', () => {
                modal.remove();
                resolve(quantity);
            });
        });

        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
            resolve(null);
        });
    });
}

// Show purchase confirmation modal
function showPurchaseConfirmation(product, quantity, totalAmount) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Purchase Successful!</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="text-center mb-4">
                        <i class="fas fa-check-circle text-success" style="font-size: 48px;"></i>
                    </div>
                    <h6>Order Details:</h6>
                    <p>Product: ${product.name}</p>
                    <p>Quantity: ${quantity}</p>
                    <p>Total Amount: $${totalAmount.toFixed(2)}</p>
                    <p class="text-muted">Thank you for your purchase!</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
} 