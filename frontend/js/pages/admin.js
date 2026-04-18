// ── Guard: admins only ───────────────────────────────────────
const user = JSON.parse(localStorage.getItem('user') || 'null');
if (!user || user.role !== 'admin') window.location.href = 'login.html';

// ── Sidebar navigation ────────────────────────────────────────
document.querySelectorAll('.sidebar-nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(`panel-${btn.dataset.panel}`).classList.add('active');
    
    // Add this line to make sure it refreshes whenever you click Overview
    if (btn.dataset.panel === 'overview') loadOverview(); 
    
    if (btn.dataset.panel === 'products') loadProducts();
    if (btn.dataset.panel === 'orders')   loadOrders();
    if (btn.dataset.panel === 'users')    loadUsers();
  });
});

document.getElementById('nav-logout').addEventListener('click', async e => {
  e.preventDefault();
  await api.request('/api/auth/logout','POST');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
});

// ── Overview ─────────────────────────────────────────────────
async function loadOverview() {
  const [products, orders, users] = await Promise.all([
    api.request('/api/products'),
    api.request('/api/orders/all'),
    api.request('/api/users'),
  ]);
  document.getElementById('stat-products').textContent = products.length;
  document.getElementById('stat-orders').textContent   = orders.length;
  document.getElementById('stat-users').textContent    = users.length;
  const revenue = orders.reduce((s, o) => s + parseFloat(o.total_amount), 0);
  document.getElementById('stat-revenue').textContent  = `$${revenue.toFixed(0)}`;
}

// ── Products ─────────────────────────────────────────────────
async function loadProducts() {
  const products = await api.request('/api/products');
  const tbody = document.getElementById('products-tbody');
  tbody.innerHTML = '';
  products.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>$${parseFloat(p.price).toFixed(2)}</td>
      <td>${p.stock}</td>
      <td style="display:flex;gap:8px">
        <button class="btn btn-secondary btn-sm" onclick="openEditModal(${JSON.stringify(p).replace(/"/g,'&quot;')})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function openEditModal(product) {
  document.getElementById('modal-title').textContent = 'Edit Product';
  document.getElementById('product-id').value   = product.id;
  document.getElementById('p-name').value        = product.name;
  document.getElementById('p-desc').value        = product.description || '';
  document.getElementById('p-price').value       = product.price;
  document.getElementById('p-stock').value       = product.stock;

  // 👇 ADD THIS LINE:
  document.getElementById('p-category').value    = product.category || 'Electronics';

  document.getElementById('product-modal').classList.add('open');
}

document.getElementById('add-product-btn').addEventListener('click', () => {
  document.getElementById('modal-title').textContent = 'Add Product';
  document.getElementById('product-form').reset();
  document.getElementById('product-id').value = '';
  document.getElementById('product-modal').classList.add('open');
});

document.getElementById('modal-close-btn').addEventListener('click', () => {
  document.getElementById('product-modal').classList.remove('open');
});

document.getElementById('product-form').addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('product-id').value;
  const formData = new FormData();
  formData.append('name',        document.getElementById('p-name').value);
  formData.append('description', document.getElementById('p-desc').value);
  formData.append('price',       document.getElementById('p-price').value);
  formData.append('stock',       document.getElementById('p-stock').value);
  
  // 👇 GRAB THE CATEGORY VALUE
  formData.append('category',    document.getElementById('p-category').value);

  const imgFile = document.getElementById('p-image').files[0];
  if (imgFile) formData.append('image', imgFile);

  try {
    const errEl = document.getElementById('product-form-error');
    errEl.classList.remove('show');
    if (id) await api.request(`/api/products/${id}`, 'PUT', formData);
    else     await api.request('/api/products', 'POST', formData);
    document.getElementById('product-modal').classList.remove('open');
    loadProducts();
  } catch (err) {
    const errEl = document.getElementById('product-form-error');
    errEl.textContent = err.message; errEl.classList.add('show');
  }
});

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  await api.request(`/api/products/${id}`, 'DELETE');
  loadProducts();
}

// ── Orders ───────────────────────────────────────────────────
async function loadOrders() {
  const orders = await api.request('/api/orders/all');
  const tbody = document.getElementById('orders-tbody');
  tbody.innerHTML = '';
  orders.forEach(o => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${o.id}</td>
      <td>${o.username}</td>
      <td>$${parseFloat(o.total_amount).toFixed(2)}</td>
      <td><span class="status-badge status-${o.status}">${o.status}</span></td>
      <td>${new Date(o.created_at).toLocaleDateString()}</td>
      <td>
        <select class="form-input" style="padding:4px 8px;font-size:.8rem;width:130px" onchange="updateStatus(${o.id},this.value)">
          ${['pending','processing','shipped','delivered','cancelled'].map(s =>
            `<option value="${s}" ${s===o.status?'selected':''}>${s}</option>`).join('')}
        </select>
      </td>`;
    tbody.appendChild(tr);
  });
}

async function updateStatus(id, status) {
  await api.request(`/api/orders/${id}/status`, 'PUT', { status });
}

// ── Users ─────────────────────────────────────────────────────
async function loadUsers() {
  const users = await api.request('/api/users');
  const tbody = document.getElementById('users-tbody');
  tbody.innerHTML = '';
  users.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.username}</td>
      <td>${u.email}</td>
      <td><span class="status-badge ${u.role==='admin'?'status-processing':'status-pending'}">${u.role}</span></td>
      <td>${new Date(u.created_at).toLocaleDateString()}</td>
      <td>${u.id !== user.id
        ? `<button class="btn btn-danger btn-sm" onclick="deleteUser(${u.id})">Delete</button>`
        : '<span style="color:var(--text-muted);font-size:.8rem">You</span>'
      }</td>`;
    tbody.appendChild(tr);
  });
}

async function deleteUser(id) {
  if (!confirm('Delete this user?')) return;
  await api.request(`/api/users/${id}`, 'DELETE');
  loadUsers();
}

// ── Init ──────────────────────────────────────────────────────
loadOverview();