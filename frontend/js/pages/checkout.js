function getCart() { return JSON.parse(localStorage.getItem('cart') || '[]'); }

// ── Redirect if not logged in ────────────────────────────────
const user = JSON.parse(localStorage.getItem('user') || 'null');
if (!user) { window.location.href = 'login.html'; }

// ── Render order items ───────────────────────────────────────
const cart  = getCart();
const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

if (!cart.length) { window.location.href = 'cart.html'; }

const itemsEl = document.getElementById('checkout-items');
cart.forEach(item => {
  const row = document.createElement('div');
  row.className = 'order-summary-row';
  row.innerHTML = `<span>${item.name} × ${item.quantity}</span><span>$${(item.price*item.quantity).toFixed(2)}</span>`;
  itemsEl.appendChild(row);
});
document.getElementById('checkout-total').textContent = `$${total.toFixed(2)}`;
document.getElementById('pay-amount').textContent = `$${total.toFixed(2)}`;

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
      items:        cart,
      total_amount: total,
      payment: {
        cardNumber: ccNum.value.replace(/\s/g,''),
        cardName:   ccName.value,
        expiry:     ccExpiry.value,
      },
    });

    localStorage.removeItem('cart');

    // Show success
    document.getElementById('checkout-form-wrap').style.display = 'none';
    const ss = document.getElementById('success-screen');
    ss.style.display = 'block';
    document.getElementById('success-msg').textContent =
      `Payment approved. Transaction ID: ${result.simulatedPayment.transactionId} | Card: •••• ${result.simulatedPayment.last4}`;

    const receiptEl = document.getElementById('receipt');
    receiptEl.innerHTML = `
      <p style="font-size:.8rem;color:var(--text-secondary);margin-bottom:.8rem;text-transform:uppercase;letter-spacing:.06em">Receipt</p>
      ${cart.map(i => `<div class="order-summary-row"><span>${i.name} × ${i.quantity}</span><span>$${(i.price*i.quantity).toFixed(2)}</span></div>`).join('')}
      <div class="order-summary-total"><span>Total Paid</span><span>$${total.toFixed(2)}</span></div>`;
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.add('show');
    btn.disabled = false;
    btn.innerHTML = `Pay $${total.toFixed(2)}`;
  }
});