const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:expired'));
    }
    throw new Error(data.message || 'An error occurred');
  }

  return data;
};

// Auth APIs
export const authAPI = {
  register: (username, email, password) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }),

  login: (email, password) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => apiCall('/auth/me', { method: 'GET' }),

  logout: () => apiCall('/auth/logout', { method: 'POST' }),
};

// Trade APIs
export const tradeAPI = {
  getStocks: () => apiCall('/trade/stocks', { method: 'GET' }),

  buyStock: (symbol, quantity) =>
    apiCall('/trade/buy', {
      method: 'POST',
      body: JSON.stringify({ symbol, quantity: parseInt(quantity) }),
    }),

  sellStock: (symbol, quantity) =>
    apiCall('/trade/sell', {
      method: 'POST',
      body: JSON.stringify({ symbol, quantity: parseInt(quantity) }),
    }),

  getPortfolio: () => apiCall('/trade/portfolio', { method: 'GET' }),

};
