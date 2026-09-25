import api from './api';

export const friendService = {
  async sendFriendRequest(userId) {
    return await api.post(`/friends/request/${userId}`, {});
  },

  async acceptFriendRequest(requestId) {
    return await api.put(`/friends/request/${requestId}/accept`, {});
  },

  async rejectFriendRequest(requestId) {
    return await api.put(`/friends/request/${requestId}/reject`, {});
  },

  async cancelFriendRequest(requestId) {
    return await api.delete(`/friends/request/${requestId}/cancel`);
  },

  async removeFriend(friendId) {
    return await api.delete(`/friends/${friendId}`);
  },

  async getFriends() {
    return await api.get('/friends');
  },

  async getPendingReceivedRequests() {
    return await api.get('/friends/requests/pending');
  },

  async getPendingSentRequests() {
    return await api.get('/friends/requests/sent');
  },

  async getConnectionStatus(userId) {
    return await api.get(`/friends/status/${userId}`);
  },
};

export default friendService;
