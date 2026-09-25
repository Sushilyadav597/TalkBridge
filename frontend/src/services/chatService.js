import api from './api';

export const chatService = {
  async getConversations() {
    return await api.get('/conversations');
  },

  async startConversation(partnerId) {
    return await api.post(`/conversations/start/${partnerId}`, {});
  },

  async getMessages(conversationId) {
    return await api.get(`/conversations/${conversationId}/messages`);
  },

  async sendMessage(conversationId, content) {
    return await api.post(`/conversations/${conversationId}/messages`, { content });
  },

  async sendDirectMessage(recipientId, content) {
    return await api.post('/conversations/send-direct', { recipientId, content });
  },

  async markAsRead(conversationId) {
    return await api.put(`/conversations/${conversationId}/read`, {});
  },

  async sendCallSignal(signal) {
    return await api.post('/call/signal', signal);
  },
};

export default chatService;
