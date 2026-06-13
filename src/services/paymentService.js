import apiClient from './apiClient';

export const paymentService = {
  createPayosPayment: async (payload) => {
    try {
      const response = await apiClient.post('/api/payments/payos/create', payload);
      const result = response.data;

      if (result.code === 200 || result.code === 201) {
        return result.response || {};
      }

      throw new Error(result.message || 'Khong the tao giao dich PayOS');
    } catch (error) {
      console.error('[paymentService] createPayosPayment error:', error);
      throw error;
    }
  },

  getPayosPaymentStatus: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/payments/payos/status', { params });
      const result = response.data;

      if (result.code === 200) {
        return result.response || {};
      }

      throw new Error(result.message || 'Khong the truy van trang thai thanh toan PayOS');
    } catch (error) {
      console.error('[paymentService] getPayosPaymentStatus error:', error);
      throw error;
    }
  },
};

export default paymentService;
