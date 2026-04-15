async function loadProducts() {
    try {
        const products = await api.request('/products');
        const grid = document.getElementById('product-grid');
        
        grid.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image_url || 'https://via.placeholder.com/200'}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>$${product.price}</p>
                <button onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">Add to Cart</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load products:', error);
    }
}

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existing = cart.find(item => item.id === product.id);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({...product, quantity: 1});
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added to cart!');
}

loadProducts();