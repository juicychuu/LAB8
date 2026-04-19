// ── Nav helpers ────────────────────────────────────────────
function updateNav() {
  const rawUser = localStorage.getItem('user');
  const user = (rawUser && rawUser !== "undefined") ? JSON.parse(rawUser) : null;

  const countEl   = document.getElementById('nav-cart-count');
  const authEl    = document.getElementById('nav-auth-link');
  const adminEl   = document.getElementById('nav-admin-wrap');
  const profileEl = document.getElementById('nav-profile-wrap'); 

  const rawCart = localStorage.getItem('cart');
  const cart = (rawCart && rawCart !== "undefined") ? JSON.parse(rawCart) : [];

  if (countEl) countEl.textContent = cart.reduce((s, i) => s + i.quantity, 0);

  if (user) {
    // 🔓 LOGGED IN STATE
    if (authEl) { 
      authEl.textContent = 'Logout'; 
      authEl.href = '#';
      authEl.onclick = async () => { 
        await api.request('/api/auth/logout','POST'); 
        localStorage.removeItem('user'); 
        location.reload(); 
      }; 
    }
    
    // Show Profile for any logged-in user
    if (profileEl) profileEl.style.display = 'block'; 
    
    // Show Admin only if role is admin
    if (adminEl && user.role === 'admin') adminEl.style.display = 'block';

  } else {
    // 🔒 LOGGED OUT STATE
    if (authEl) {
      authEl.textContent = 'Login';
      authEl.href = 'login.html';
      authEl.onclick = null;
    }
    if (profileEl) profileEl.style.display = 'none';
    if (adminEl) adminEl.style.display = 'none';
  }
}

function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existing = cart.find(i => i.id === product.id);

  // 🛡️ STOCK CHECK
  const currentQtyInCart = existing ? existing.quantity : 0;
  
  if (currentQtyInCart + 1 > product.stock) {
    showToast(`❌ Cannot add more. Only ${product.stock} available!`);
    return; // 🛑 Stops the function here so it doesn't add to cart
  }

  // If we pass the check, proceed as usual
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateNav();
  showToast(`"${product.name}" added to cart`);
}

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `position:fixed;bottom:2rem;right:2rem;background:#1a1a1a;border:1px solid #2a2a2a;
      color:#f0f0f0;padding:12px 20px;border-radius:8px;font-size:.9rem;z-index:999;
      opacity:0;transition:opacity .3s;pointer-events:none`;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

async function loadProducts() {
  try {
    const products = await api.request('/api/products');
    const grid = document.getElementById('product-grid'); // This will now act as our main container
    const loading = document.getElementById('loading');
    const empty = document.getElementById('empty');
    
    loading.style.display = 'none';
    if (!products.length) { empty.style.display = 'flex'; return; }

    // 1. Group products by category
    const grouped = products.reduce((acc, p) => {
      const cat = p.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(p);
      return acc;
    }, {});

    // 2. Clear the container and change its display
    // We remove the 'grid' display because the category-sections handle their own layout
    grid.style.display = 'block'; 
    grid.innerHTML = '';

    // 3. Create a Section and Scroll-Row for each category
    for (const category in grouped) {
      const section = document.createElement('section');
      section.className = 'category-section';

      section.innerHTML = `
        <div class="category-header">
          <h2 class="category-title">${category}</h2>
          <span class="category-count">${grouped[category].length} Items</span>
        </div>
        <div class="horizontal-scroll-row" id="row-${category.replace(/\s+/g, '-')}"></div>
      `;

      grid.appendChild(section);

      // 4. Fill the Row with product cards
      const row = section.querySelector('.horizontal-scroll-row');
      
      grouped[category].forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        const imgHtml = p.image_url
          ? `<img src="http://localhost:5000${p.image_url}" alt="${p.name}" loading="lazy"/>`
          : `<div class="product-card-placeholder">📦</div>`;

        card.innerHTML = `
          ${imgHtml}
          <div class="product-card-body">
            <div class="product-card-title">${p.name}</div>
            <div class="product-card-desc">${p.description || 'No description available.'}</div>
            <div class="product-card-footer">
              <div>
                <div class="product-price">$${parseFloat(p.price).toFixed(2)}</div>
                <div class="stock-badge">${p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</div>
              </div>
              <button class="btn btn-primary btn-sm add-btn" ${p.stock === 0 ? 'disabled' : ''}>
                Add
              </button>
            </div>
          </div>`;

        card.querySelector('.add-btn').addEventListener('click', (e) => {
          e.stopPropagation(); // Prevents clicking the card itself if you add links later
          addToCart(p);
        });
        
        row.appendChild(card);
      });
    }
  } catch (err) {
    console.error(err);
    document.getElementById('loading').style.display = 'none';
    document.getElementById('empty').style.display = 'flex';
  }
}

updateNav();
loadProducts();