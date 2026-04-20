async function loadCartData() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // GUEST LOGIC
  if (!user) {
    const guestItems = JSON.parse(localStorage.getItem('cart') || '[]');
    renderCart(guestItems);
    return;
  }

  // LOGGED IN LOGIC
  try {
    const items = await api.request('/api/cart');
    renderCart(items);
  } catch (err) {
    console.error(err);
    renderCart([]);
  }
}

async function updateNav() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const countEl = document.getElementById('nav-cart-count');
  const authEl = document.getElementById('nav-auth-link');
  const adminWrap = document.getElementById('nav-admin-wrap');
  const profileLink = document.querySelector('a[href="profile.html"]');

  if (user) {
    try {
      const items = await api.request('/api/cart');
      const totalCount = items.reduce((s, i) => s + i.quantity, 0);
      if (countEl) countEl.textContent = totalCount;
    } catch (err) {
      if (countEl) countEl.textContent = '0';
    }
  } else {
    // Show guest count in nav
    const guestCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalCount = guestCart.reduce((s, i) => s + i.quantity, 0);
    if (countEl) countEl.textContent = totalCount;
  }

  if (user && authEl) {
    authEl.textContent = 'Logout'; 
    authEl.href = '#';
    authEl.onclick = async (e) => {
      e.preventDefault();
      try {
        await api.request('/api/auth/logout', 'POST');
      } catch (err) {}
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      location.href = 'index.html';
    };
  }

  if (adminWrap) {
    adminWrap.style.display = (user && user.role === 'admin') ? 'block' : 'none';
  }

  if (profileLink) {
    profileLink.style.display = user ? 'block' : 'none';
  }
}

function renderCart(cart) {
  const wrap = document.getElementById('cart-content');
  const empty = document.getElementById('empty-cart');
  
  if (!cart || !cart.length) { 
    wrap.style.display = 'none'; 
    empty.style.display = 'flex'; 
    return; 
  }
  
  wrap.style.display = 'grid'; 
  empty.style.display = 'none';

  const itemsEl = document.getElementById('cart-items');
  const summaryEl = document.getElementById('summary-items');
  const totalEl = document.getElementById('cart-total');

  itemsEl.innerHTML = '';
  summaryEl.innerHTML = '';
  let total = 0;

  cart.forEach(item => {
    // Guest items use .id from ALL_PRODUCTS, Database uses .product_id
    const itemId = item.product_id || item.id;
    const itemSubtotal = item.price * item.quantity;
    total += itemSubtotal;

    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${parseFloat(item.price).toFixed(2)} each</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" data-id="${itemId}" data-qty="${item.quantity - 1}" data-action="update">−</button>
        <span style="min-width:24px;text-align:center">${item.quantity}</span>
        <button class="qty-btn" data-id="${itemId}" data-qty="${item.quantity + 1}" data-action="update">+</button>
        <button class="qty-btn" data-id="${itemId}" data-action="del" style="color:var(--danger)">✕</button>
      </div>`;
    itemsEl.appendChild(row);

    const s = document.createElement('div');
    s.className = 'order-summary-row';
    s.innerHTML = `<span>${item.name} × ${item.quantity}</span><span>$${itemSubtotal.toFixed(2)}</span>`;
    summaryEl.appendChild(s);
  });

  totalEl.textContent = `$${total.toFixed(2)}`;

  itemsEl.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const productId = parseInt(btn.dataset.id);
      const action = btn.dataset.action;
      const user = JSON.parse(localStorage.getItem('user') || 'null');

      if (!user) {
        // GUEST UPDATE LOGIC
        let localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const idx = localCart.findIndex(i => i.id === productId);

        if (action === 'update') {
          const newQty = parseInt(btn.dataset.qty);
          if (newQty <= 0) localCart.splice(idx, 1);
          else localCart[idx].quantity = newQty;
        } else if (action === 'del') {
          localCart.splice(idx, 1);
        }
        localStorage.setItem('cart', JSON.stringify(localCart));
        loadCartData();
        updateNav();
      } else {
        // LOGGED IN UPDATE LOGIC
        try {
          if (action === 'update') {
            const newQty = parseInt(btn.dataset.qty);
            if (newQty <= 0) {
              await api.request(`/api/cart/${productId}`, 'DELETE');
            } else {
              await api.request('/api/cart', 'POST', { productId, quantity: newQty, updateQuantity: true });
            }
          } else if (action === 'del') {
            await api.request(`/api/cart/${productId}`, 'DELETE');
          }
          loadCartData();
          updateNav();
        } catch (err) { console.error(err); }
      }
    });
  });
}

document.getElementById('checkout-btn').addEventListener('click', () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) { 
    window.location.href = 'login.html'; 
    return; 
  }
  window.location.href = 'checkout.html';
});

updateNav();
loadCartData();