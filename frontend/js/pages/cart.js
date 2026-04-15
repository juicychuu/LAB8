async function handleCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    try {
        await api.request('/orders/checkout', 'POST', {
            items: cart,
            total_amount: total
        });
        alert('Order placed!');
        localStorage.removeItem('cart');
        window.location.href = 'index.html';
    } catch (err) {
        alert('Checkout failed: ' + err.message);
    }
}