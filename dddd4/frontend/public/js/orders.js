// Use window.API_BASE_URL instead of declaring it again.

// Load user's orders
async function loadOrders() {
    const ordersContainer = document.getElementById('ordersContainer');
    try {
        showLoading(ordersContainer);
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Please login to view orders', 'warning');
            return;
        }

        const response = await fetch(`${window.API_BASE_URL}/api/purchases/history`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load orders');
        }

        const orders = await response.json();
        renderOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Error loading orders', 'danger');
    } finally {
        hideLoading(ordersContainer);
    }
}

// Render orders
function renderOrders(orders) {
    const ordersContainer = document.getElementById('ordersContainer');
    if (!ordersContainer) return;

    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted">No orders found</p>
            </div>
        `;
        return;
    }

    ordersContainer.innerHTML = orders.map(order => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card order-card">
                <img src="${order.product.image || order.product.imageUrl}" class="card-img-top" alt="${order.product.name}">
                <div class="card-body">
                    <h5 class="card-title">${order.product.name}</h5>
                    <p class="card-text">Quantity: ${order.purchaseDetails.quantity}</p>
                    <p class="card-text">Total: $${order.purchaseDetails.totalAmount.toFixed(2)}</p>
                    <p class="card-text">
                        <small class="text-muted">Purchased on: ${new Date(order.purchaseDetails.purchaseDate).toLocaleDateString()}</small>
                    </p>
                </div>
            </div>
        </div>
    `).join('');
}

// Initialize orders section
document.addEventListener('DOMContentLoaded', () => {
    // Load orders when the orders section is visible
    const ordersSection = document.getElementById('orders');
    if (ordersSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadOrders();
                    observer.unobserve(entry.target);
                }
            });
        });

        observer.observe(ordersSection);
    }
});

window.loadOrders = loadOrders; 