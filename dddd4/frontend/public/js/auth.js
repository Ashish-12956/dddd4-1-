// Auth State Management
let currentUser = null;

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (token && user) {
        setAuthState(user);
    } else {
        clearAuthState();
    }
}

// Set authenticated state
function setAuthState(user) {
    currentUser = user;
    if (user.token) {
        localStorage.setItem('token', user.token);
    }
    localStorage.setItem('user', JSON.stringify(user));

    // Update UI
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('signupBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'block';

    // Update user dropdown
    const userDropdown = document.getElementById('userDropdown');
    userDropdown.innerHTML = `
        <i class="fas fa-user"></i>
        <span class="ms-2">${user.name}</span>
    `;
}

// Clear authenticated state
function clearAuthState() {
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Update UI
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('signupBtn').style.display = 'block';
    document.getElementById('logoutBtn').style.display = 'none';

    // Reset user dropdown
    const userDropdown = document.getElementById('userDropdown');
    userDropdown.innerHTML = '<i class="fas fa-user"></i>';
}

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password')
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Store user data and token in localStorage
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                setAuthState({ ...data.user, token: data.token });
            } else {
                setAuthState(data);
            }
            bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
            showToast('Login successful');
        } else {
            showToast(data.message || 'Login failed', 'danger');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed', 'danger');
    }
});

// Signup Form Handler
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password')
            })
        });

        const data = await response.json();

        if (response.ok) {
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                setAuthState({ ...data.user, token: data.token });
            } else {
                setAuthState(data);
            }
            bootstrap.Modal.getInstance(document.getElementById('signupModal')).hide();
            showToast('Registration successful');
        } else {
            showToast(data.message || 'Registration failed', 'danger');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showToast('Registration failed', 'danger');
    }
});

// Logout Handler
document.getElementById('logoutBtn').addEventListener('click', () => {
    clearAuthState();
    showToast('Logged out successfully');
});

// Modal Triggers
document.getElementById('loginBtn').addEventListener('click', () => {
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
});

document.getElementById('signupBtn').addEventListener('click', () => {
    const signupModal = new bootstrap.Modal(document.getElementById('signupModal'));
    signupModal.show();
});

// Check auth state on page load
document.addEventListener('DOMContentLoaded', checkAuth);

// Add styles for user profile
const style = document.createElement('style');
style.textContent = `
    .user-profile {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
    }
    
    .avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        object-fit: cover;
    }
`;
document.head.appendChild(style); 