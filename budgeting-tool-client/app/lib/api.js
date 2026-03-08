const API_URL = 'http://localhost:5001/api';

// Token storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function setTokens(accessToken, refreshToken) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('user');
}

function getAuthHeaders() {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Token refresh failed' }));
      throw new Error(error.error || 'Token refresh failed');
    }

    const data = await response.json();
    setTokens(data.accessToken, null); // Don't update refresh token
    return data.accessToken;
  } catch (error) {
    clearTokens();
    window.location.href = '/login';
    throw error;
  }
}

export async function fetchWithAuth(url, options = {}, retry = true) {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  });

  // If token expired, try to refresh
  if (response.status === 401 && retry) {
    try {
      const newAccessToken = await refreshAccessToken();
      // Retry the request with new token
      return fetchWithAuth(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${newAccessToken}`
        }
      }, false); // Don't retry again
    } catch (error) {
      // Refresh failed, redirect to login
      clearTokens();
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  if (response.status === 401 || response.status === 403) {
    clearTokens();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    // Check if error message indicates authentication failure
    if (error.error && (error.error.includes('token') || error.error.includes('Unauthorized') || error.error.includes('Invalid') || error.error.includes('expired'))) {
      clearTokens();
      window.location.href = '/login';
    }
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const auth = {
  me: () => fetchWithAuth('/auth/me'),
  refresh: (refreshToken) => fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  }).then(res => res.json()),
  logout: (refreshToken) => fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  }).then(res => res.json()),
  logoutAll: () => fetchWithAuth('/auth/logout-all', {
    method: 'POST'
  }),
  getSessions: () => fetchWithAuth('/auth/sessions')
};

export const budgets = {
  getAll: () => fetchWithAuth('/budgets'),
  create: (data) => fetchWithAuth('/budgets', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => fetchWithAuth(`/budgets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => fetchWithAuth(`/budgets/${id}`, {
    method: 'DELETE'
  })
};

export const transactions = {
  getAll: () => fetchWithAuth('/transactions'),
  create: (data) => fetchWithAuth('/transactions', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => fetchWithAuth(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => fetchWithAuth(`/transactions/${id}`, {
    method: 'DELETE'
  })
};

export const dashboard = {
  getStats: () => fetchWithAuth('/dashboard/stats')
};

export const logs = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/logs${queryString ? `?${queryString}` : ''}`);
  }
};

export const admin = {
  getSystemStats: () => fetchWithAuth('/admin/stats'),
  getAllUsers: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return fetchWithAuth(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },
  getUserById: (id) => fetchWithAuth(`/admin/users/${id}`),
  createUser: (data) => fetchWithAuth('/admin/users', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateUser: (id, data) => fetchWithAuth(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteUser: (id) => fetchWithAuth(`/admin/users/${id}`, {
    method: 'DELETE'
  }),
  getUserStats: (id) => fetchWithAuth(`/admin/users/${id}/stats`),
  // Joint Account methods
  linkJointAccount: (user1Id, user2Id) => fetchWithAuth('/admin/joint-accounts', {
    method: 'POST',
    body: JSON.stringify({ user1Id, user2Id })
  }),
  unlinkJointAccount: (linkId) => fetchWithAuth(`/admin/joint-accounts/${linkId}`, {
    method: 'DELETE'
  }),
  getJointAccounts: () => fetchWithAuth('/admin/joint-accounts')
};
