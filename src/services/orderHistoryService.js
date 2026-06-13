import apiClient from './apiClient';

export const orderHistoryService = {
  getOrderHistory: async (params = {}) => {
    const response = await apiClient.get('/api/orders/history', { params });
    const result = response.data;

    if (result.code === 200) {
      return result.response;
    }

    throw new Error(result.message || 'Khong the lay lich su don hang');
  },
};

export default orderHistoryService;
