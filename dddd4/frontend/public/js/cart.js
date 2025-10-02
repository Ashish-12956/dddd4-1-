// Use window.API_BASE_URL instead of declaring it again.

// Cart State Management
let cartItems = [];
let currentUser = null;

// Initialize user state
function initializeUserState() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        currentUser = user;
    }
}

// Update cart count in UI
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    cartCount.textContent = cartItems.length;
}

// Add to cart handler
async function handleAddToCart(e) {
    if (!currentUser) {
        showToast('Please login to add items to cart', 'warning');
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
        return;
    }

    const productId = e.target.dataset.productId;

    try {
        const response = await fetch(`${window.API_BASE_URL}/api/cart/${productId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            cartItems.push(productId);
            updateCartCount();
            showToast('Product added to cart');
        } else {
            const data = await response.json();
            showToast(data.message || 'Failed to add to cart', 'danger');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Failed to add to cart', 'danger');
    }
}

// Remove from cart handler
async function handleRemoveFromCart(productId) {
    try {
        const response = await fetch(`${window.API_BASE_URL}/api/cart/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            cartItems = cartItems.filter(id => id !== productId);
            updateCartCount();
            showToast('Product removed from cart');
            loadCartItems(); // Reload cart items
        } else {
            const data = await response.json();
            showToast(data.message || 'Failed to remove from cart', 'danger');
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
        showToast('Failed to remove from cart', 'danger');
    }
}

// Load cart items
async function loadCartItems() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${window.API_BASE_URL}/api/cart`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const items = await response.json();
            cartItems = items.map(item => item.id);
            updateCartCount();

            // Update cart modal content
            renderCartItems(items);
        }
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

// Clear cart
async function clearCart() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${window.API_BASE_URL}/api/cart`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            cartItems = [];
            updateCartCount();
            showToast('Cart cleared');
            loadCartItems(); // Reload cart items
        } else {
            const data = await response.json();
            showToast(data.message || 'Failed to clear cart', 'danger');
        }
    } catch (error) {
        console.error('Error clearing cart:', error);
        showToast('Failed to clear cart', 'danger');
    }
}

// Purchase items
async function purchaseItems() {
    if (!currentUser) {
        showToast('Please login to make a purchase', 'warning');
        return;
    }

    if (cartItems.length === 0) {
        showToast('Your cart is empty', 'warning');
        return;
    }

    try {
        const response = await fetch(`${window.API_BASE_URL}/api/cart/purchase`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            cartItems = [];
            updateCartCount();
            showToast('Purchase successful!', 'success');
            loadCartItems(); // Reload cart items
        } else {
            const data = await response.json();
            showToast(data.message || 'Purchase failed', 'danger');
        }
    } catch (error) {
        console.error('Error processing purchase:', error);
        showToast('Purchase failed', 'danger');
    }
}

// Cart modal content
function createCartModalContent() {
    return `
        <div class="modal fade" id="cartModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Shopping Cart</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div id="cartItems">
                            <!-- Cart items will be loaded here -->
                        </div>
                        <div class="text-end mt-3">
                            <button class="btn btn-danger me-2" onclick="clearCart()">Clear Cart</button>
                            <button class="btn btn-primary" onclick="purchaseItems()">Purchase</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Initialize cart modal
document.addEventListener('DOMContentLoaded', () => {
    initializeUserState();
    // Add cart modal to body
    document.body.insertAdjacentHTML('beforeend', createCartModalContent());

    // Add click handler to cart button
    document.getElementById('cartBtn').addEventListener('click', () => {
        if (!currentUser) {
            showToast('Please login to view cart', 'warning');
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
            return;
        }
        const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
        cartModal.show();
        loadCartItems();
    });
});

function renderCartItems(items) {
    const cartItemsContainer = document.getElementById('cartItems');
    if (!cartItemsContainer) return;

    if (items.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-center">Your cart is empty</p>';
        return;
    }

    cartItemsContainer.innerHTML = items.map(item => `
        <div class="cart-item" data-product-id="${item.product.id}">
            <div class="row align-items-center">
                <div class="col-md-2">
                    <img src="${item.product.image}" alt="${item.product.name}" class="img-fluid">
                </div>
                <div class="col-md-4">
                    <h6>${item.product.name}</h6>
                    <p class="text-muted">$${item.product.price.toFixed(2)}</p>
                </div>
                <div class="col-md-2">
                    <div class="input-group">
                        <button class="btn btn-outline-secondary decrease-quantity" type="button">-</button>
                        <input type="number" class="form-control text-center quantity-input" value="${item.quantity}" min="1">
                        <button class="btn btn-outline-secondary increase-quantity" type="button">+</button>
                    </div>
                </div>
                <div class="col-md-2">
                    <p class="mb-0">$${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
                <div class="col-md-2">
                    <div class="d-grid gap-2">
                        <button class="btn btn-success buy-now-cart" data-product-id="${item.product.id}">
                            Buy Now
                        </button>
                        <button class="btn btn-danger remove-from-cart" data-product-id="${item.product.id}">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners
    document.querySelectorAll('.buy-now-cart').forEach(button => {
        button.addEventListener('click', handleBuyNowFromCart);
    });
}

// Handle Buy Now from Cart
async function handleBuyNowFromCart(event) {
    const productId = event.target.dataset.productId;
    const cartItem = document.querySelector(`.cart-item[data-product-id="${productId}"]`);
    const quantity = parseInt(cartItem.querySelector('.quantity-input').value);

    try {
        showLoading();
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please login to continue', 'warning');
            return;
        }

        const response = await fetch(`${window.API_BASE_URL}/api/purchases`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                productId,
                quantity
            })
        });

        if (!response.ok) {
            throw new Error('Purchase failed');
        }

        const result = await response.json();

        // Remove item from cart after successful purchase
        await removeFromCart(productId);

        // Show success message
        showToast(`Purchase successful! Total: $${result.totalAmount.toFixed(2)}`, 'success');

        // Show purchase confirmation
        showPurchaseConfirmation(result.product, quantity, result.totalAmount);

        // Refresh cart
        loadCartItems();
    } catch (error) {
        console.error('Error making purchase:', error);
        showToast('Error making purchase', 'danger');
    } finally {
        hideLoading();
    }
}

// Show purchase confirmation
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