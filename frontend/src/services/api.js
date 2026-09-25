/**
 * TalkBridge Base API Client
 * Automatically attaches JWT authentication header and standardizes response parsing.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('talkbridge_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    // If unauthorized, clear session and optionally redirect to login
    const isAuthRoute = endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/register');
    if (!isAuthRoute) {
      localStorage.removeItem('talkbridge_token');
      localStorage.removeItem('talkbridge_user');
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    if (typeof data === 'string' && data.trim()) {
      errorMessage = data;
    } else if (data && typeof data === 'object') {
      if (data.message) {
        errorMessage = data.message;
      } else if (data.errors && typeof data.errors === 'object') {
        errorMessage = Object.values(data.errors).join(', ');
      } else if (data.error) {
        errorMessage = data.error;
      }
    }
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint, options) => request(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options) => request(endpoint, { method: 'POST', body, ...options }),
  put: (endpoint, body, options) => request(endpoint, { method: 'PUT', body, ...options }),
  delete: (endpoint, options) => request(endpoint, { method: 'DELETE', ...options }),
};

export default api;
