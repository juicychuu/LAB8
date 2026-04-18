// ── Guard: Logged in users only ─────────────────────────────
const user = JSON.parse(localStorage.getItem('user') || 'null');
if (!user) window.location.href = 'login.html';

function updateCartBadge() {
    const rawCart = localStorage.getItem('cart');
    const cart = (rawCart && rawCart !== "undefined") ? JSON.parse(rawCart) : [];
    const countEl = document.getElementById('nav-cart-count'); 
    
    if (countEl) {
        countEl.textContent = cart.reduce((s, i) => s + i.quantity, 0);
    }
}

updateCartBadge();

// ── Initialize Page ──────────────────────────────────────────
async function initProfile() {
    // 1. Fill in Static User Info
    document.getElementById('profile-username').value = user.username;
    document.getElementById('profile-email').value = user.email;
    
    // --- NEW: Load Profile Picture ---
    const previewImg = document.getElementById('profile-img-preview');
    
    if (user.profile_pic) {
        // Option A: Use the uploaded photo from backend
        previewImg.src = `http://localhost:5000/${user.profile_pic}`;
    } else {
        // Option B: Explicitly set a placeholder if no pic exists to avoid 404
        previewImg.src = `https://ui-avatars.com/api/?name=${user.username}&background=333&color=fff`;
    }

    // Handle image load errors (e.g., if server is down)
    previewImg.onerror = function() {
        this.src = 'https://ui-avatars.com/api/?name=User&background=333&color=fff';
    };

    // --- NEW: Avatar Upload Logic ---
    const avatarInput = document.getElementById('avatar-input');
    if (avatarInput) {
        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // 1. Instant local preview
            const reader = new FileReader();
            reader.onload = (event) => previewImg.src = event.target.result;
            reader.readAsDataURL(file);

            // 2. Prepare for upload
            const formData = new FormData();
            formData.append('profile_pic', file);

            try {
                const response = await fetch('http://localhost:5000/api/users/upload-avatar', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Profile picture updated!');
                    user.profile_pic = data.profile_pic;
                    localStorage.setItem('user', JSON.stringify(user));
                    
                    // Optional: Force the preview to the new permanent URL
                    previewImg.src = `http://localhost:5000/${data.profile_pic}`;
                } else {
                    alert(data.message || 'Upload failed');
                }
            } catch (err) {
                console.error('Upload Error:', err);
                alert('Server connection failed');
            }
        });
    }

    // 2. Setup Logout
    document.getElementById('nav-logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('user');
        localStorage.removeItem('token'); // Don't forget to clear the token!
        window.location.href = 'login.html';
    });

    // 3. Setup Admin Link
    if (user.role === 'admin') {
        const adminWrap = document.getElementById('nav-admin-wrap');
        if(adminWrap) adminWrap.style.display = 'block';
    }

    // 4. Load Order History
    loadOrderHistory();
}

// ... (Rest of your loadOrderHistory function stays exactly the same)
async function loadOrderHistory() {
    try {
        const orders = await api.request('/api/orders/my-orders');
        const tbody = document.getElementById('order-history-tbody');
        const emptyState = document.getElementById('no-orders');
        
        const countEl = document.getElementById('total-orders-count');
        if(countEl) countEl.textContent = orders.length;

        if (orders.length === 0) {
            if(emptyState) emptyState.style.display = 'block';
            return;
        }

        tbody.innerHTML = '';
        let displayNum = orders.length; 

        orders.forEach(o => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div style="font-weight: 600;">${displayNum}</div>
                    <div style="font-size: 0.7rem; color: var(--text-muted);">Ref: #${o.id}</div>
                </td>
                <td>${new Date(o.created_at).toLocaleDateString()}</td>
                <td>$${parseFloat(o.total_amount).toFixed(2)}</td>
                <td><span class="status-badge status-${o.status}">${o.status}</span></td>
            `;
            tbody.appendChild(tr);
            displayNum--; 
        });

    } catch (err) {
        console.error('Failed to load orders:', err);
    }
}

initProfile();