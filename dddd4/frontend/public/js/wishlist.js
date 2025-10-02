// Wishlist State Management
let wishlistItems = [];
let currentUser = null;

// Initialize user state
function initializeUserState() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        currentUser = user;
    }
}

// Update wishlist count in UI
function updateWishlistCount() {
    const wishlistCount = document.getElementById('wishlistCount');
    wishlistCount.textContent = wishlistItems.length;
}

// Add to wishlist handler
async function handleAddToWishlist(e) {
    if (!currentUser) {
        showToast('Please login to add items to wishlist', 'warning');
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
        return;
    }

    const productId = e.target.dataset.productId;

    try {
        const response = await fetch(`/api/wishlist/${productId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            wishlistItems.push(productId);
            updateWishlistCount();
            showToast('Product added to wishlist');
        } else {
            const data = await response.json();
            showToast(data.message || 'Failed to add to wishlist', 'danger');
        }
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        showToast('Failed to add to wishlist', 'danger');
    }
}

// Remove from wishlist handler
async function handleRemoveFromWishlist(productId) {
    try {
        const response = await fetch(`/api/wishlist/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            wishlistItems = wishlistItems.filter(id => id !== productId);
            updateWishlistCount();
            showToast('Product removed from wishlist');
            loadWishlistItems(); // Reload wishlist items
        } else {
            const data = await response.json();
            showToast(data.message || 'Failed to remove from wishlist', 'danger');
        }
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        showToast('Failed to remove from wishlist', 'danger');
    }
}

// Load wishlist items
async function loadWishlistItems() {
    if (!currentUser) return;

    try {
        const response = await fetch('/api/wishlist', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const items = await response.json();
            wishlistItems = items.map(item => item.id);
            updateWishlistCount();

            // Update wishlist modal content
            const wishlistItemsContainer = document.getElementById('wishlistItems');
            if (wishlistItemsContainer) {
                wishlistItemsContainer.innerHTML = items.map(item => `
                    <div class="card mb-3">
                        <div class="row g-0">
                            <div class="col-md-4">
                                <img src="${item.image}" class="img-fluid rounded-start" alt="${item.name}">
                            </div>
                            <div class="col-md-8">
                                <div class="card-body">
                                    <h5 class="card-title">${item.name}</h5>
                                    <p class="card-text">$${item.price}</p>
                                    <div class="btn-group">
                                        <button class="btn btn-primary btn-sm" onclick="moveToCart(${item.id})">
                                            Move to Cart
                                        </button>
                                        <button class="btn btn-danger btn-sm" onclick="handleRemoveFromWishlist(${item.id})">
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading wishlist:', error);
    }
}

// Clear wishlist
async function clearWishlist() {
    if (!currentUser) return;

    try {
        const response = await fetch('/api/wishlist', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            wishlistItems = [];
            updateWishlistCount();
            showToast('Wishlist cleared');
            loadWishlistItems(); // Reload wishlist items
        } else {
            const data = await response.json();
            showToast(data.message || 'Failed to clear wishlist', 'danger');
        }
    } catch (error) {
        console.error('Error clearing wishlist:', error);
        showToast('Failed to clear wishlist', 'danger');
    }
}

// Move item from wishlist to cart
async function moveToCart(productId) {
    try {
        const response = await fetch(`/api/wishlist/${productId}/move-to-cart`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            wishlistItems = wishlistItems.filter(id => id !== productId);
            updateWishlistCount();
            showToast('Product moved to cart');
            loadWishlistItems(); // Reload wishlist items
            loadCartItems(); // Reload cart items
        } else {
            const data = await response.json();
            showToast(data.message || 'Failed to move to cart', 'danger');
        }
    } catch (error) {
        console.error('Error moving to cart:', error);
        showToast('Failed to move to cart', 'danger');
    }
}

// Wishlist modal content
function createWishlistModalContent() {
    return `
        <div class="modal fade" id="wishlistModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Wishlist</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div id="wishlistItems">
                            <!-- Wishlist items will be loaded here -->
                        </div>
                        <div class="text-end mt-3">
                            <button class="btn btn-danger" onclick="clearWishlist()">Clear Wishlist</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Initialize wishlist modal
document.addEventListener('DOMContentLoaded', () => {
    initializeUserState();
    // Add wishlist modal to body
    document.body.insertAdjacentHTML('beforeend', createWishlistModalContent());

    // Add click handler to wishlist button
    document.getElementById('wishlistBtn').addEventListener('click', () => {
        if (!currentUser) {
            showToast('Please login to view wishlist', 'warning');
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
            return;
        }
        const wishlistModal = new bootstrap.Modal(document.getElementById('wishlistModal'));
        wishlistModal.show();
        loadWishlistItems();
    });
}); 