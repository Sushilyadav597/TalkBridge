import api from './api';

export const authService = {
  async register(data) {
    const response = await api.post('/auth/register', data);
    if (response && response.token) {
      localStorage.setItem('talkbridge_token', response.token);
      localStorage.setItem('talkbridge_user', JSON.stringify(response.user));
    }
    return response;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    if (response && response.token) {
      localStorage.setItem('talkbridge_token', response.token);
      localStorage.setItem('talkbridge_user', JSON.stringify(response.user));
    }
    return response;
  },

  async logout() {
    try {
      await api.post('/auth/logout', {});
    } catch (e) {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem('talkbridge_token');
      localStorage.removeItem('talkbridge_user');
    }
  },

  getCurrentUser() {
    const userJson = localStorage.getItem('talkbridge_user');
    try {
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('talkbridge_token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('talkbridge_token');
  },
};

export default authService;
