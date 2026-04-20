let ALL_PRODUCTS = [];

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
      authEl.onclick = async (e) => { 
        e.preventDefault();
        await api.request('/api/auth/logout', 'POST'); 
        
        // --- THE FIX ---
        localStorage.removeItem('user'); 
        localStorage.removeItem('cart'); // This clears the items when you log out
        // ----------------
        
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
      color:#f0f0f0;padding:12px 20px;border-radius:8px;font-size:.9rem;z-index:99999;
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
    ALL_PRODUCTS = products; 
    const loadingEl = document.getElementById('loading');
    if (loadingEl) loadingEl.style.display = 'none';
    renderProducts(ALL_PRODUCTS);
  } catch (err) {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) loadingEl.style.display = 'none';
    const emptyEl = document.getElementById('empty');
    if (emptyEl) emptyEl.style.display = 'flex';
  }
}

function renderProducts(products) {
  const grid = document.getElementById('product-grid');
  const empty = document.getElementById('empty');
  if (!grid) return;
  
  grid.innerHTML = ''; 

  if (products.length === 0) {
    grid.style.display = 'none';
    if (empty) empty.style.display = 'flex'; 
    return;
  }

  grid.style.display = 'block';
  if (empty) empty.style.display = 'none';

  const grouped = products.reduce((acc, p) => {
    const cat = p.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  for (const category in grouped) {
    const sortedProducts = grouped[category].sort((a, b) => (b.rating || 0) - (a.rating || 0));
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
    sortedProducts.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.style.cursor = 'pointer';

      const imgHtml = p.image_url
        ? `<img src="http://localhost:5000${p.image_url}" alt="${p.name}" loading="lazy"/>`
        : `<div class="product-card-placeholder">📦</div>`;

      const starRating = (p.rating || 0);
      const starsHtml = `<div class="stars" style="color: #f1c40f; margin-bottom: 5px;">
        ${'★'.repeat(Math.floor(starRating))}${'☆'.repeat(5 - Math.floor(starRating))}
        <span style="color: #888; font-size: 0.8rem;">(${p.num_reviews || 0})</span>
      </div>`;

      card.innerHTML = `
        ${imgHtml}
        <div class="product-card-body">
          <div class="product-card-title">${p.name}</div>
          ${starsHtml}
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

      card.onclick = () => openReviewModal(p);
      row.appendChild(card);
    });
  }
}

async function openReviewModal(product) {
  try {
    const reviews = await api.request(`/api/products/${product.id}/reviews`);
    const overlay = document.createElement('div');
    overlay.className = 'review-modal-overlay';
    overlay.id = 'modal-overlay-container';
    
    overlay.innerHTML = `
      <div class="review-modal-content" style="max-width: 500px; width: 95%; background: #121212; border: 1px solid #333;">
        <button type="button" id="close-modal-btn" class="review-modal-close">&times;</button>
        
        <h2 style="margin:0; color: #fff;">${product.name}</h2>
        <p style="color:#888; margin-bottom: 15px; font-size: 0.9rem;">${product.description || ''}</p>

        <div class="reviews-feed" style="
            background: #0a0a0a; 
            border: 1px solid #222; 
            border-radius: 8px; 
            padding: 15px; 
            max-height: 280px; 
            overflow-y: auto; 
            display: flex; 
            flex-direction: column; 
            gap: 15px;
            margin-bottom: 20px;
        ">
           <h3 style="margin:0; font-size: 1rem; color: #64ffda; border-bottom: 1px solid #222; padding-bottom: 10px;">
             Reviews (${reviews.length})
           </h3>
           
           ${reviews.length > 0 ? reviews.map(r => `
             <div class="review-bubble" style="border-bottom: 1px solid #222; padding-bottom: 10px;">
               <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                 <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 24px; height: 24px; background: #333; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: #64ffda;">👤</div>
                    <strong style="font-size: 0.9rem; color: #fff;">${r.name || 'Anonymous User'}</strong>
                 </div>
                 <span style="color:#f1c40f; font-size: 0.8rem;">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span>
               </div>
               
               <p style="margin: 5px 0; color: #ccc; font-size: 0.95rem; line-height: 1.4; padding-left: 32px;">
                 ${r.comment}
               </p>
               
               <div style="padding-left: 32px; color: #555; font-size: 0.7rem;">
                 Posted on ${new Date(r.created_at).toLocaleDateString()}
               </div>
             </div>
           `).join('') : '<p style="color:#555; text-align:center;">No reviews yet.</p>'}
        </div>

        <div style="border-top: 1px solid #222; padding-top: 15px;">
            <h4 style="margin: 0 0 10px 0; color: #fff;">Add Your Review</h4>
            <select id="rev-rating" class="review-input" style="width: 100%; margin-bottom: 10px; background: #1a1a1a; color: #fff; border: 1px solid #333; padding: 8px; border-radius: 4px;">
                <option value="5">5 Stars - Excellent</option>
                <option value="4">4 Stars - Good</option>
                <option value="3">3 Stars - Average</option>
                <option value="2">2 Stars - Poor</option>
                <option value="1">1 Star - Terrible</option>
            </select>
            <textarea id="rev-comment" class="review-input" style="width: 100%; height: 60px; background: #1a1a1a; color: #fff; border: 1px solid #333; padding: 10px; border-radius: 4px; resize: none;" placeholder="What did you think?"></textarea>
            <button type="button" id="force-submit-btn" class="review-submit-btn" style="width: 100%; margin-top: 10px; padding: 10px; background: #64ffda; color: #0a192f; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
                Submit Review
            </button>
        </div>
      </div>
    `;

    // --- LOGIC FOR CLOSING AND SUBMITTING (Same as before) ---
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    document.getElementById('close-modal-btn').onclick = () => { overlay.remove(); document.body.style.overflow = 'auto'; };
    overlay.onclick = (e) => { if (e.target.id === 'modal-overlay-container') { overlay.remove(); document.body.style.overflow = 'auto'; } };

    const submitBtn = document.getElementById('force-submit-btn');
    submitBtn.onclick = async () => {
      const ratingVal = document.getElementById('rev-rating').value;
      const commentVal = document.getElementById('rev-comment').value;
      if (!commentVal.trim()) { showToast("⚠️ Please enter a comment"); return; }
      submitBtn.disabled = true;
      try {
        await api.request(`/api/products/${product.id}/reviews`, 'POST', { rating: Number(ratingVal), comment: commentVal });
        showToast("✅ Review submitted!");
        overlay.remove();
        document.body.style.overflow = 'auto';
        loadProducts(); 
      } catch (err) {
        showToast("❌ Error. Make sure you are logged in!");
        submitBtn.disabled = false;
      }
    };
  } catch (err) {
    showToast("Could not load reviews.");
  }
}

const searchInput = document.getElementById('product-search');
if (searchInput) {
  searchInput.addEventListener('input', async (e) => {
    const term = e.target.value.trim();
    if (term === "") {
      document.body.classList.remove('searching');
      renderProducts(ALL_PRODUCTS);
    } else {
      document.body.classList.add('searching');
      try {
        const filtered = await api.request(`/api/products?keyword=${term}`);
        renderProducts(filtered);
      } catch (err) {}
    }
  });
}

updateNav();
loadProducts();