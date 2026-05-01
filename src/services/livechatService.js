import apiClient from './apiClient';

export const livechatService = {
  syncIdentity: async () => {
    const response = await apiClient.post('/api/livechat/identity');
    return response.data;
  },

  clearIdentity: async () => {
    const response = await apiClient.post('/api/livechat/identity/clear');
    return response.data;
  },

  resetSession: async () => {
    const response = await apiClient.post('/api/livechat/session/reset');
    return response.data;
  },

    restoreSession: async () => {
      const response = await apiClient.post('/api/livechat/session/restore');
      return response.data;
    },
};

export default livechatService;
