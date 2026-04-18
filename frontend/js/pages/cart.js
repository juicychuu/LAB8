function getCart() { return JSON.parse(localStorage.getItem('cart') || '[]'); }
function saveCart(c) { localStorage.setItem('cart', JSON.stringify(c)); }

function getTotal(cart) {
  return cart.reduce((s, i) => s + i.price * i.quantity, 0);
}

function updateNav() {
  const cart = getCart();
  const el = document.getElementById('nav-cart-count');
  if (el) el.textContent = cart.reduce((s, i) => s + i.quantity, 0);

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  // 1. Handle Logout/Auth Link
  const authEl = document.getElementById('nav-auth-link');
  if (user && authEl) {
    authEl.textContent = 'Logout'; 
    authEl.href = '#';
    authEl.onclick = async (e) => {
      e.preventDefault();
      try {
        await api.request('/api/auth/logout', 'POST');
      } catch (err) {
        console.error("Logout error:", err);
      }
      localStorage.removeItem('user');
      localStorage.removeItem('token'); // Clear token too!
      location.href = 'index.html';
    };
  }

  // 2. NEW: Handle Admin Link Visibility
  const adminWrap = document.getElementById('nav-admin-wrap');
  if (adminWrap) {
    adminWrap.style.display = (user && user.role === 'admin') ? 'block' : 'none';
  }

  // 3. NEW: Ensure Profile link is visible if logged in
  const profileLink = document.querySelector('a[href="profile.html"]');
  if (profileLink) {
    profileLink.style.display = user ? 'block' : 'none';
  }
}

function renderCart() {
  const cart = getCart();
  const wrap = document.getElementById('cart-content');
  const empty = document.getElementById('empty-cart');
  if (!cart.length) { wrap.style.display = 'none'; empty.style.display = 'flex'; return; }
  wrap.style.display = 'grid'; empty.style.display = 'none';

  const itemsEl   = document.getElementById('cart-items');
  const summaryEl = document.getElementById('summary-items');
  const totalEl   = document.getElementById('cart-total');
  const total     = getTotal(cart);

  itemsEl.innerHTML = '';
  summaryEl.innerHTML = '';
  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${parseFloat(item.price).toFixed(2)} each</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" data-id="${item.id}" data-action="dec">−</button>
        <span style="min-width:24px;text-align:center">${item.quantity}</span>
        <button class="qty-btn" data-id="${item.id}" data-action="inc">+</button>
        <button class="qty-btn" data-id="${item.id}" data-action="del" style="color:var(--danger)">✕</button>
      </div>`;
    itemsEl.appendChild(row);

    const s = document.createElement('div');
    s.className = 'order-summary-row';
    s.innerHTML = `<span>${item.name} × ${item.quantity}</span><span>$${(item.price*item.quantity).toFixed(2)}</span>`;
    summaryEl.appendChild(s);
  });

  totalEl.textContent = `$${total.toFixed(2)}`;

  itemsEl.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const action = btn.dataset.action;
      const cart = getCart();
      const idx = cart.findIndex(i => i.id === id);
      if (action === 'inc') cart[idx].quantity++;
      else if (action === 'dec') { cart[idx].quantity--; if (cart[idx].quantity <= 0) cart.splice(idx, 1); }
      else if (action === 'del') cart.splice(idx, 1);
      saveCart(cart); updateNav(); renderCart();
    });
  });
}

document.getElementById('checkout-btn').addEventListener('click', () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) { window.location.href = 'login.html'; return; }
  window.location.href = 'checkout.html';
});

updateNav();
renderCart();