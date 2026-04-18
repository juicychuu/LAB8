const API_BASE_URL = 'http://localhost:5000';

const api = {
  async request(endpoint, method = 'GET', body = null) {
    const config = {
      method,
      credentials: 'include', // send cookies
      headers: {},
    };
    if (body && !(body instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(body);
    } else if (body instanceof FormData) {
      config.body = body;
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP error ${response.status}`);
    return data;
  }
};