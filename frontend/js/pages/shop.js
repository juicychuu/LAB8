// Global variable to store products so we can filter them without re-fetching from the database
let ALL_PRODUCTS = [];

// ── Nav helpers ────────────────────────────────────────────
function updateNav() {
  const rawUser = localStorage.getItem('user');
  const user = (rawUser && rawUser !== "undefined") ? JSON.parse(rawUser) : null;
  const countEl = document.getElementById('nav-cart-count');
  const authEl = document.getElementById('nav-auth-link');
  const adminEl = document.getElementById('nav-admin-wrap');
  const profileEl = document.getElementById('nav-profile-wrap'); 

  const rawCart = localStorage.getItem('cart');
  const cart = (rawCart && rawCart !== "undefined") ? JSON.parse(rawCart) : [];

  if (countEl) countEl.textContent = cart.reduce((s, i) => s + i.quantity, 0);

  if (user) {
    if (authEl) { 
      authEl.textContent = 'Logout'; 
      authEl.href = '#';
      authEl.onclick = async () => { 
        await api.request('/api/auth/logout','POST'); 
        localStorage.removeItem('user'); 
        location.reload(); 
      }; 
    }
    if (profileEl) profileEl.style.display = 'block'; 
    if (adminEl && user.role === 'admin') adminEl.style.display = 'block';
  } else {
    if (authEl) {
      authEl.textContent = 'Login';
      authEl.href = 'login.html';
      authEl.onclick = null;
    }
    if (profileEl) profileEl.style.display = 'none';
    if (adminEl) adminEl.style.display = 'none';
  }
}

// ── Cart Logic ──────────────────────────────────────────────
function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existing = cart.find(i => i.id === product.id);

  const currentQtyInCart = existing ? existing.quantity : 0;
  
  if (currentQtyInCart + 1 > product.stock) {
    showToast(`❌ Cannot add more. Only ${product.stock} available!`);
    return;
  }

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
      color:#f0f0f0;padding:12px 20px;border-radius:8px;font-size:.9rem;z-index:2000;
      opacity:0;transition:opacity .3s;pointer-events:none`;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}

// ── Product Loading & Rendering ─────────────────────────────
async function loadProducts() {
  try {
    const products = await api.request('/api/products');
    ALL_PRODUCTS = products; 
    
    document.getElementById('loading').style.display = 'none';
    renderProducts(ALL_PRODUCTS);
  } catch (err) {
    console.error(err);
    document.getElementById('loading').style.display = 'none';
    document.getElementById('empty').style.display = 'flex';
  }
}

function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  const empty = document.getElementById('empty');
  
  grid.innerHTML = ''; 

  if (products.length === 0) {
    grid.style.display = 'none';
    empty.style.display = 'flex'; 
    return;
  }

  grid.style.display = 'block';
  empty.style.display = 'none';

  const grouped = products.reduce((acc, p) => {
    const cat = p.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

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
            <button class="btn btn-primary btn-sm add-btn" ${p.stock === 0 ? 'disabled' : ''}>Add</button>
          </div>
        </div>`;
      
      card.querySelector('.add-btn').onclick = (e) => {
        e.stopPropagation();
        addToCart(p);
      };
      row.appendChild(card);
    });
  }
}

// ── Search & Overlay Interaction (Smart Version) ─────────────
const searchInput = document.getElementById('product-search');
const overlay = document.getElementById('search-overlay');

if (searchInput) {
  // 1. Focus listener: only blur if there's text
  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim() !== "") {
      document.body.classList.add('searching');
    }
  });

  // 2. Typing listener: handles the blur toggle and filtering
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    
    // Auto-remove blur if the search box is emptied
    if (term === "") {
      document.body.classList.remove('searching');
    } else {
      document.body.classList.add('searching');
    }

    const filtered = ALL_PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(term) || 
      (p.category && p.category.toLowerCase().includes(term))
    );
    renderProducts(filtered);
  });
}

if (overlay) {
  overlay.addEventListener('click', () => {
    document.body.classList.remove('searching');
    searchInput.blur();
    
  });
}

// Initialize
updateNav();
loadProducts();