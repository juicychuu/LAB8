document.getElementById('show-register').addEventListener('click', e => {
  e.preventDefault();
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('register-section').style.display = 'block';
});

document.getElementById('show-login').addEventListener('click', e => {
  e.preventDefault();
  document.getElementById('register-section').style.display = 'none';
  document.getElementById('login-section').style.display = 'block';
});

document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const err = document.getElementById('login-error');
  err.classList.remove('show');
  
  try {
    const data = await api.request('/api/auth/login', 'POST', {
      email:    document.getElementById('login-email').value,
      password: document.getElementById('login-password').value,
    });

    // --- ADD THESE LOGS TO SEE THE TRUTH ---
    console.log("FULL BACKEND DATA:", data); 
    
    // This will try all common names for a token
    const actualToken = data.token || data.accessToken || data.jwt || data.tokenString;
    console.log("TOKEN FOUND:", actualToken);

    localStorage.setItem('user', JSON.stringify(data.user));

    if (actualToken) {
        localStorage.setItem('token', actualToken);
    } else {
        alert("The server didn't send a token! Check the console.");
    }

    window.location.href = data.user.role === 'admin' ? 'admin.html' : 'index.html';
  } catch (error) {
    err.textContent = error.message;
    err.classList.add('show');
  }
});

document.getElementById('register-form').addEventListener('submit', async e => {
  e.preventDefault();
  const errEl  = document.getElementById('register-error');
  const succEl = document.getElementById('register-success');
  errEl.classList.remove('show'); succEl.classList.remove('show');
  try {
    await api.request('/api/auth/register', 'POST', {
      username: document.getElementById('reg-username').value,
      email:    document.getElementById('reg-email').value,
      password: document.getElementById('reg-password').value,
    });
    succEl.textContent = 'Account created! You can now sign in.';
    succEl.classList.add('show');
    setTimeout(() => {
      document.getElementById('register-section').style.display = 'none';
      document.getElementById('login-section').style.display = 'block';
    }, 1500);
  } catch (error) {
    errEl.textContent = error.message;
    errEl.classList.add('show');
  }
});