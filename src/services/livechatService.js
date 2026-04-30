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
};

export default livechatService;
