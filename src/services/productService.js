/**
 * Product Service - Ket noi React voi Odoo Product API
 * Backend: /api/products, /api/products/<id>
 * Response format: { code: int, message: str, response: any }
 */

import apiClient from './apiClient';

export const productService = {

  /**
   * Lay danh sach san pham
   * @param {Object} params - { limit, offset, search }
   */
  getProducts: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/products', { params });
      const result = response.data;

      if (result.code === 200) {
        return result.response;  // { products, total, limit, offset }
      }

      throw new Error(result.message || 'Khong the lay danh sach san pham');
    } catch (error) {
      console.error('[productService] getProducts error:', error);
      throw error;
    }
  },

  /**
   * Lay chi tiet 1 san pham
   * @param {number} productId
   */
  getProductById: async (productId) => {
    try {
      const response = await apiClient.get(`/api/products/${productId}`);
      const result = response.data;

      if (result.code === 200) {
        return result.response;  // { product, combos }
      }

      throw new Error(result.message || 'San pham khong ton tai');
    } catch (error) {
      console.error('[productService] getProductById error:', error);
      throw error;
    }
  },
};

export default productService;
