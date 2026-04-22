const user = JSON.parse(localStorage.getItem('user') || 'null');
if (!user || user.role !== 'admin') window.location.href = 'login.html';

let roleTarget = null;   
let deleteTarget = null; 

let currentOrderPage = 1;
let totalOrderPages = 1;

// --- SIDEBAR NAVIGATION ---
document.querySelectorAll('.sidebar-nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(`panel-${btn.dataset.panel}`).classList.add('active');
    
    if (btn.dataset.panel === 'overview') loadOverview(); 
    if (btn.dataset.panel === 'products') loadProducts();
    if (btn.dataset.panel === 'orders')   loadOrders(1); 
    if (btn.dataset.panel === 'users')    loadUsers();
  });
});

document.getElementById('nav-logout').addEventListener('click', async e => {
  e.preventDefault();
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

// --- OVERVIEW PANEL ---
async function loadOverview() {
  try {
    const [products, ordersData, users] = await Promise.all([
      api.request('/api/products'),
      api.request('/api/orders/all'), 
      api.request('/api/users'),
    ]);

    const orders = ordersData.orders || (Array.isArray(ordersData) ? ordersData : []); 
    
    document.getElementById('stat-products').textContent = products.length;
    document.getElementById('stat-orders').textContent   = ordersData.totalItems || orders.length;
    document.getElementById('stat-users').textContent    = users.length;
    
    const revenue = orders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0);
    document.getElementById('stat-revenue').textContent  = `$${revenue.toFixed(2)}`;
  } catch (err) {
    console.error("Overview Load Error:", err);
  }
}

// --- PRODUCT MANAGEMENT ---
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
        <button class="btn btn-danger btn-sm" onclick="prepDeleteProduct(${p.id}, '${p.name.replace(/'/g, "\\'")}')">Delete</button>
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
  document.getElementById('p-category').value    = product.category || 'Electronics';
  document.getElementById('product-modal').classList.add('active');
}

document.getElementById('add-product-btn').addEventListener('click', () => {
  document.getElementById('modal-title').textContent = 'Add Product';
  document.getElementById('product-form').reset();
  document.getElementById('product-id').value = '';
  document.getElementById('product-modal').classList.add('active');
});

document.getElementById('modal-close-btn').addEventListener('click', () => {
  document.getElementById('product-modal').classList.remove('active');
});

document.getElementById('product-form').addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('product-id').value;
  const formData = new FormData();
  formData.append('name',         document.getElementById('p-name').value);
  formData.append('description', document.getElementById('p-desc').value);
  formData.append('price',       document.getElementById('p-price').value);
  formData.append('stock',       document.getElementById('p-stock').value);
  formData.append('category',    document.getElementById('p-category').value);

  const imgFile = document.getElementById('p-image').files[0];
  if (imgFile) formData.append('image', imgFile);

  try {
    const errEl = document.getElementById('product-form-error');
    if(errEl) errEl.classList.remove('show');
    
    if (id) await api.request(`/api/products/${id}`, 'PUT', formData);
    else    await api.request('/api/products', 'POST', formData);
    
    document.getElementById('product-modal').classList.remove('active');
    loadProducts();
    loadOverview();
  } catch (err) {
    const errEl = document.getElementById('product-form-error');
    if(errEl) { errEl.textContent = err.message; errEl.classList.add('show'); }
  }
});

// --- ORDER MANAGEMENT ---
async function loadOrders(page = 1) {
  try {
    const res = await api.request(`/api/orders/all?page=${page}`);
    currentOrderPage = res.currentPage;
    totalOrderPages = res.totalPages;

    const tbody = document.getElementById('orders-tbody');
    tbody.innerHTML = '';

    res.orders.forEach(o => {
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
    renderOrderPagination();
  } catch (err) {
    console.error("Order Load Error:", err);
  }
}

function renderOrderPagination() {
  let pgContainer = document.getElementById('orders-pagination');
  if (!pgContainer) {
    pgContainer = document.createElement('div');
    pgContainer.id = 'orders-pagination';
    pgContainer.className = 'pagination-controls';
    document.querySelector('#panel-orders .table-wrap').after(pgContainer);
  }
  pgContainer.innerHTML = `
    <button class="btn-pagination" ${currentOrderPage === 1 ? 'disabled' : ''} onclick="loadOrders(${currentOrderPage - 1})">Prev</button>
    <span style="font-size: 0.9rem; font-weight: 600;">Page ${currentOrderPage} of ${totalOrderPages}</span>
    <button class="btn-pagination" ${currentOrderPage === totalOrderPages ? 'disabled' : ''} onclick="loadOrders(${currentOrderPage + 1})">Next</button>
  `;
}

async function updateStatus(id, status) {
  await api.request(`/api/orders/${id}/status`, 'PUT', { status });
}

// --- USER MANAGEMENT ---
async function loadUsers() {
  const users = await api.request('/api/users');
  const tbody = document.getElementById('users-tbody');
  const ROOT_ADMIN = 'Admin@gmail.com';
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isRoot = (currentUser.email === ROOT_ADMIN); 

  tbody.innerHTML = '';
  users.forEach(u => {
    const isTargetRoot = (u.email === ROOT_ADMIN);
    const isMe = (u.email === currentUser.email);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${u.username}</td>
      <td>${u.email}</td>
      <td>
        ${(!isRoot || isTargetRoot || isMe) 
          ? `<span class="status-badge status-processing">${u.role}</span>` 
          : `<select class="role-select" onchange="openRoleModal(${u.id}, this.value, '${u.username}')">
              <option value="user" ${u.role === 'user' ? 'selected' : ''}>User</option>
              <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
             </select>`
        }
      </td>
      <td>${new Date(u.created_at).toLocaleDateString()}</td>
      <td>
        ${(isRoot && !isMe && !isTargetRoot)
          ? `<button class="btn btn-danger btn-sm" onclick="prepDeleteUser(${u.id}, '${u.username}', '${u.email}')">Delete</button>`
          : `<span style="color:var(--text-muted); font-size:.8rem">${isTargetRoot ? 'ROOT' : 'LOCKED'}</span>`
        }
      </td>`;
    tbody.appendChild(tr);
  });
}

// --- MODALS (ROLE & DELETE) ---
function openRoleModal(id, role, username) {
  roleTarget = { id, role, username };
  document.getElementById('role-modal-text').innerHTML = `Are you sure you want to change <b>${username}</b>'s role to <b>${role.toUpperCase()}</b>?`;
  document.getElementById('role-modal').classList.add('active');
}

function closeRoleModal() {
  document.getElementById('role-modal').classList.remove('active');
  roleTarget = null;
  loadUsers(); 
}

document.getElementById('confirm-role-btn').addEventListener('click', async () => {
  if (!roleTarget) return;
  try {
    await api.request(`/api/users/${roleTarget.id}/role`, 'PATCH', { role: roleTarget.role });
    document.getElementById('role-modal').classList.remove('active');
    loadUsers();
  } catch (err) {
    alert('Failed to update role: ' + err.message);
    closeRoleModal();
  }
});

function prepDeleteProduct(id, name) {
    deleteTarget = { id, type: 'product', name };
    openDeleteModal(`Are you sure you want to delete the product: <b>${name}</b>?`);
}

function prepDeleteUser(id, username, email) {
    const ROOT_ADMIN = 'Admin@gmail.com';
    if (email === ROOT_ADMIN) {
        alert("CRITICAL: The Master Admin cannot be deleted.");
        return;
    }
    deleteTarget = { id, type: 'user', name: username };
    openDeleteModal(`Are you sure you want to delete user: <b>${username}</b>?`);
}

function openDeleteModal(message) {
    document.getElementById('delete-modal-text').innerHTML = message;
    document.getElementById('delete-modal').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('delete-modal').classList.remove('active');
    deleteTarget = null;
}


document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
    if (!deleteTarget) return;

    
    const type = deleteTarget.type;
    const id = deleteTarget.id;

    try {
        const endpoint = type === 'product' ? `/api/products/${id}` : `/api/users/${id}`;
        await api.request(endpoint, 'DELETE');
        
        
        closeDeleteModal();
        
        
        if (type === 'product') loadProducts();
        else loadUsers();
        
        loadOverview();
    } catch (err) {
        alert("Error: " + err.message);
        closeDeleteModal();
    }
});

// Initial Load
loadOverview();