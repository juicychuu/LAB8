const user = JSON.parse(localStorage.getItem('user') || 'null');
if (!user) window.location.href = 'login.html';

let currentOrderPage = 1;
let totalOrderPages = 1;

function updateCartBadge() {
    const rawCart = localStorage.getItem('cart');
    const cart = (rawCart && rawCart !== "undefined") ? JSON.parse(rawCart) : [];
    const countEl = document.getElementById('nav-cart-count'); 
    if (countEl) {
        countEl.textContent = cart.reduce((s, i) => s + i.quantity, 0);
    }
}

async function initProfile() {
    document.getElementById('profile-username').value = user.username;
    document.getElementById('profile-email').value = user.email;
    
    const previewImg = document.getElementById('profile-img-preview');
    if (user.profile_pic) {
        previewImg.src = `http://localhost:5000/${user.profile_pic}`;
    } else {
        previewImg.src = `https://ui-avatars.com/api/?name=${user.username}&background=333&color=fff`;
    }

    previewImg.onerror = function() {
        this.src = 'https://ui-avatars.com/api/?name=User&background=333&color=fff';
    };

    const avatarInput = document.getElementById('avatar-input');
    if (avatarInput) {
        avatarInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => previewImg.src = event.target.result;
            reader.readAsDataURL(file);

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

    document.getElementById('nav-logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    if (user.role === 'admin') {
        const adminWrap = document.getElementById('nav-admin-wrap');
        if(adminWrap) adminWrap.style.display = 'block';
    }

    // --- PASSWORD MODAL LOGIC ---
    const pwdModal = document.getElementById('password-modal');
    const openBtn = document.getElementById('open-password-modal');
    const closeBtn = document.getElementById('close-password-modal');
    const passwordForm = document.getElementById('change-password-form');
    const messageEl = document.getElementById('password-message');

    if (openBtn) {
        openBtn.onclick = () => {
            if(messageEl) messageEl.style.display = 'none';
            if(passwordForm) passwordForm.reset();
            pwdModal.classList.add('active');
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => pwdModal.classList.remove('active');
    }

    window.onclick = (e) => {
        if (e.target === pwdModal) pwdModal.classList.remove('active');
    };

    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;

            try {
                await api.request('/api/users/change-password', 'POST', {
                    currentPassword,
                    newPassword
                });

                messageEl.textContent = 'Password updated successfully!';
                messageEl.style.color = 'var(--success)';
                messageEl.style.display = 'block';
                
                setTimeout(() => {
                    pwdModal.classList.remove('active');
                }, 1500);
            } catch (err) {
                messageEl.textContent = err.message || 'Failed to change password';
                messageEl.style.color = 'var(--danger)';
                messageEl.style.display = 'block';
            }
        });
    }

    loadOrderHistory(1);
}

async function loadOrderHistory(page = 1) {
    try {
        const res = await api.request(`/api/orders/my-orders?page=${page}`);
        
        currentOrderPage = res.currentPage;
        totalOrderPages = res.totalPages;

        const tbody = document.getElementById('order-history-tbody');
        const emptyState = document.getElementById('no-orders');
        const countEl = document.getElementById('total-orders-count');

        if(countEl) countEl.textContent = res.totalItems;

        tbody.innerHTML = '';

        if (!res.orders || res.orders.length === 0) {
            if(emptyState) emptyState.style.display = 'block';
            renderPagination();
            return;
        }

        if(emptyState) emptyState.style.display = 'none';

        res.orders.forEach(o => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div style="font-weight: 600;">#${o.id}</div>
                </td>
                <td>${new Date(o.created_at).toLocaleDateString()}</td>
                <td>$${parseFloat(o.total_amount).toFixed(2)}</td>
                <td><span class="status-badge status-${o.status}">${o.status}</span></td>
            `;
            tbody.appendChild(tr);
        });

        renderPagination();
    } catch (err) {
        console.error('Failed to load orders:', err);
    }
}

function renderPagination() {
    const pgContainer = document.getElementById('user-orders-pagination');
    if (!pgContainer) return;

    if (totalOrderPages <= 1) {
        pgContainer.innerHTML = '';
        return;
    }

    pgContainer.innerHTML = `
        <button class="btn-pagination" ${currentOrderPage === 1 ? 'disabled' : ''} onclick="loadOrderHistory(${currentOrderPage - 1})">Prev</button>
        <span style="font-weight: 600;">Page ${currentOrderPage} of ${totalOrderPages}</span>
        <button class="btn-pagination" ${currentOrderPage === totalOrderPages ? 'disabled' : ''} onclick="loadOrderHistory(${currentOrderPage + 1})">Next</button>
    `;
}

updateCartBadge();
initProfile();