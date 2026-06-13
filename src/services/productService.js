/**
 * Product Service - Ket noi React voi Odoo Product API
 * Backend: /api/products, /api/products/<id>
 * Response format: { code: int, message: str, response: any }
 */

import apiClient from './apiClient';

const normalizeOdooAssetUrl = (value = '') => {
  if (!value || /^(https?:|data:|blob:|mailto:|tel:|#)/i.test(value)) {
    return value;
  }

  return value.startsWith('/') ? value : `/${value}`;
};

const getFirstImageFromDetailInformation = (html = '') => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] || '';
};

const getProductImageUrl = (product = {}) => {
  // Priority: image_url from API = field image_1920 on Odoo product (Label Image)
  const rawImage = (product.image_url || '').trim();
  if (rawImage) {
    return normalizeOdooAssetUrl(rawImage);
  }

  return '';
};

const getProductDisplayPrice = (product = {}) => {
  const priceFrom = Number(product.price_from ?? product.combo_price_from);
  if (Number.isFinite(priceFrom) && priceFrom > 0) {
    return priceFrom;
  }

  const listPrice = Number(product.list_price || 0);
  return Number.isFinite(listPrice) ? listPrice : 0;
};

const normalizeProduct = (product = {}) => ({
  ...product,
  image_url: getProductImageUrl(product),
  display_price: getProductDisplayPrice(product),
});

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
        const payload = result.response || {};
        const products = (payload.products || []).map(normalizeProduct);
        return {
          ...payload,
          products,
          total: payload.total ?? products.length,
        };
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
        const payload = result.response || {};
        return {
          ...payload,
          product: normalizeProduct(payload.product || {}),
        };
      }

      throw new Error(result.message || 'San pham khong ton tai');
    } catch (error) {
      console.error('[productService] getProductById error:', error);
      throw error;
    }
  },

  /**
   * Tu dong bung tat ca combo items theo so luong moi combo.
   * @param {number} productId
   * @param {Object} comboQuantities - { [comboId]: quantity }
   */
  prepareComboItems: async (productId, comboQuantities = {}, comboSelections = {}) => {
    try {
      const response = await apiClient.post(`/api/products/${productId}/combo-items`, {
        combo_quantities: comboQuantities,
        combo_selections: comboSelections,
      });
      const result = response.data;

      if (result.code === 200) {
        return result.response; // { product_id, expanded_items, warnings }
      }

      throw new Error(result.message || 'Khong the xu ly combo items');
    } catch (error) {
      console.error('[productService] prepareComboItems error:', error);
      throw error;
    }
  },

  /**
   * Tao don hang tren Odoo.
   */
  createOrder: async (payload) => {
    try {
      const response = await apiClient.post('/api/orders', payload);
      const result = response.data;

      if (result.code === 201 || result.code === 200) {
        return result.response;
      }

      throw new Error(result.message || 'Khong the tao don hang');
    } catch (error) {
      console.error('[productService] createOrder error:', error);
      throw error;
    }
  },
};

export default productService;
