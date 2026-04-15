const user = JSON.parse(localStorage.getItem('user'));
if (!user || user.role !== 'admin') {
    alert('Access Denied');
    window.location.href = 'index.html';
}

// Product Management
async function createProduct() {
    const nameInput = document.getElementById('product-name');
    const priceInput = document.getElementById('product-price');
    const imageFileInput = document.getElementById('product-image');

    const formData = new FormData();
    formData.append('name', nameInput.value);
    formData.append('price', priceInput.value);
    formData.append('image', imageFileInput.files[0]);

    await api.request('/products', 'POST', formData);
    alert('Product created');
    location.reload();
}

// Order Management
async function updateStatus(orderId, newStatus) {
    await api.request(`/orders/${orderId}/status`, 'PUT', { status: newStatus });
    alert('Status Updated');
}

// User Management
async function loadUsers() {
    const users = await api.request('/users', 'GET');
    // Render user table...
}