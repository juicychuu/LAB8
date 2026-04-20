// ── Redirect if not logged in ────────────────────────────────
const user = JSON.parse(localStorage.getItem('user') || 'null');
if (!user) { window.location.href = 'login.html'; }

let CURRENT_CART = [];
let TOTAL_AMOUNT = 0;

// ── Initialize Checkout ──────────────────────────────────────
async function initCheckout() {
  try {
    // 1. Fetch cart from DATABASE
    CURRENT_CART = await api.request('/api/cart');

    // 2. Redirect if database cart is empty
    if (!CURRENT_CART || CURRENT_CART.length === 0) {
      window.location.href = 'cart.html';
      return;
    }

    // 3. Calculate and Render
    renderOrderReview();
  } catch (err) {
    console.error("Checkout Load Error:", err);
    window.location.href = 'cart.html';
  }
}

// Add this helper inside checkout.js or just use the logic below
function renderOrderReview() {
  const itemsEl = document.getElementById('checkout-items');
  itemsEl.innerHTML = '';
  TOTAL_AMOUNT = 0;

  CURRENT_CART.forEach(item => {
    // FIX: Look for product_id (DB) OR id (Guest/Local)
    const pId = item.product_id || item.id; 
    const sub = item.price * item.quantity;
    TOTAL_AMOUNT += sub;

    const row = document.createElement('div');
    row.className = 'order-summary-row';
    // Add the ID as a data attribute just in case you need to reference it
    row.setAttribute('data-product-id', pId); 
    row.innerHTML = `<span>${item.name} × ${item.quantity}</span><span>$${sub.toFixed(2)}</span>`;
    itemsEl.appendChild(row);
  });

  document.getElementById('checkout-total').textContent = `$${TOTAL_AMOUNT.toFixed(2)}`;
  document.getElementById('pay-amount').textContent = `$${TOTAL_AMOUNT.toFixed(2)}`;
}

// ── Card visual live update ──────────────────────────────────
const ccNum    = document.getElementById('cc-number');
const ccName   = document.getElementById('cc-name');
const ccExpiry = document.getElementById('cc-expiry');

ccNum.addEventListener('input', () => {
  let v = ccNum.value.replace(/\D/g,'').substring(0,16);
  ccNum.value = v.replace(/(.{4})/g,'$1 ').trim();
  const parts = v.padEnd(16,'•').match(/.{4}/g);
  document.getElementById('cc-visual-number').textContent = parts.join(' ');
});

ccName.addEventListener('input', () => {
  document.getElementById('cc-visual-name').textContent = ccName.value || 'Full Name';
});

ccExpiry.addEventListener('input', () => {
  let v = ccExpiry.value.replace(/\D/g,'');
  if (v.length >= 2) v = v.substring(0,2) + ' / ' + v.substring(2,4);
  ccExpiry.value = v;
  document.getElementById('cc-visual-expiry').textContent = ccExpiry.value || 'MM / YY';
});

// ── Submit payment ───────────────────────────────────────────
document.getElementById('payment-form').addEventListener('submit', async e => {
  e.preventDefault();
  const errEl = document.getElementById('checkout-error');
  errEl.classList.remove('show');
  const btn = document.getElementById('pay-btn');
  btn.disabled = true;
  btn.textContent = 'Processing…';

  try {
    const result = await api.request('/api/orders/checkout', 'POST', {
      // We transform the items so the backend sees 'id'
      items: CURRENT_CART.map(item => ({
        id: item.product_id || item.id, 
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      total_amount: TOTAL_AMOUNT,
      payment: {
        cardNumber: ccNum.value.replace(/\s/g,''),
        cardName:   ccName.value,
        expiry:     ccExpiry.value,
      },
    });

    await api.request('/api/cart', 'DELETE');

    // Clear the guest cart just in case, though the backend 
    // should handle clearing the database cart.
    localStorage.removeItem('cart');

    // Show success
    document.getElementById('checkout-form-wrap').style.display = 'none';
    const ss = document.getElementById('success-screen');
    ss.style.display = 'block';
    
    // Check if result has the expected simulated payment info
    const txId = result.simulatedPayment?.transactionId || 'N/A';
    const last4 = result.simulatedPayment?.last4 || '****';

    document.getElementById('success-msg').textContent =
      `Payment approved. Transaction ID: ${txId} | Card: •••• ${last4}`;

    const receiptEl = document.getElementById('receipt');
    receiptEl.innerHTML = `
      <p style="font-size:.8rem;color:var(--text-secondary);margin-bottom:.8rem;text-transform:uppercase;letter-spacing:.06em">Receipt</p>
      ${CURRENT_CART.map(i => `<div class="order-summary-row"><span>${i.name} × ${i.quantity}</span><span>$${(i.price*i.quantity).toFixed(2)}</span></div>`).join('')}
      <div class="order-summary-total"><span>Total Paid</span><span>$${TOTAL_AMOUNT.toFixed(2)}</span></div>`;
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.add('show');
    btn.disabled = false;
    btn.innerHTML = `Pay $${TOTAL_AMOUNT.toFixed(2)}`;
  }
});

// Start the page logic
initCheckout();