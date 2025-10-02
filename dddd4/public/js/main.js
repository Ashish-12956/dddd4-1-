// Function to load products by category
async function loadProducts(category = null) {
    try {
        const url = category
            ? `/api/products/category/${encodeURIComponent(category)}`
            : '/api/products';

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.statusText}`);
        }

        const products = await response.json();
        const productsContainer = document.getElementById('products');

        if (!productsContainer) {
            console.error('Products container not found');
            return;
        }

        productsContainer.innerHTML = ''; // Clear existing products

        if (products.length === 0) {
            productsContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="lead">No products found in this category.</p>
                </div>
            `;
            return;
        }

        products.forEach(product => {
            const productCard = createProductCard(product);
            productsContainer.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        const productsContainer = document.getElementById('products');
        if (productsContainer) {
            productsContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-danger">Error loading products. Please try again later.</p>
                </div>
            `;
        }
        showToast('Error loading products', 'error');
    }
}

// Function to create a product card
function createProductCard(product) {
    const col = document.createElement('div');
    col.className = 'col-md-4 col-lg-3 mb-4';

    // Use product.imageUrl or fallback
    const imageUrl = product.imageUrl || 'https://placehold.co/300x180?text=No+Image';

    col.innerHTML = `
        <div class="card product-card h-100">
            <img src="${imageUrl}" class="card-img-top" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/300x180?text=No+Image';">
            <div class="card-body">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text">₹${product.price}</p>
                <div class="d-flex justify-content-between">
                    <button class="btn btn-primary btn-sm" onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="addToWishlist(${product.id})">
                        <i class="bi bi-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    return col;
}

// Function to show toast notifications
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
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

    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    // Remove toast after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Function to create toast container if it doesn't exist
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
    return container;
} 