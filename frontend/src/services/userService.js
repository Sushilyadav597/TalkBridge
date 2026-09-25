import api from './api';

export const userService = {
  async getMe() {
    const user = await api.get('/users/me');
    localStorage.setItem('talkbridge_user', JSON.stringify(user));
    return user;
  },

  async updateProfile(profileData) {
    const updated = await api.put('/users/me', profileData);
    localStorage.setItem('talkbridge_user', JSON.stringify(updated));
    return updated;
  },

  async changePassword(passwordData) {
    return await api.put('/users/change-password', passwordData);
  },

  async getUserById(id) {
    return await api.get(`/users/${id}`);
  },

  async searchUsers(query = '') {
    const endpoint = query ? `/users?search=${encodeURIComponent(query)}` : '/users';
    return await api.get(endpoint);
  },

  async getRecommendations(limit = 10) {
    return await api.get(`/recommendations?limit=${limit}`);
  },

  async deleteAccount() {
    return await api.delete('/users/me');
  },
};

export default userService;
