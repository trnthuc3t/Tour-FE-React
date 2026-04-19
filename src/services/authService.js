import apiClient from './apiClient';

const _extractAuthData = (result) => {
  const { user, token, session_id, csrf_token } = result.response || {};
  if (token) localStorage.setItem('auth_token', token);
  if (session_id) localStorage.setItem('odoo_session_id', session_id);
  if (csrf_token) localStorage.setItem('odoo_csrf_token', csrf_token);
  return { user, token, session_id, csrf_token };
};

// AUTH SERVICE

export const authService = {

  login: async (credentials) => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      // Backend tra: { code: 200, message: '...', response: {...} }
      const result = response.data;

      if (result.code === 200) {
        _extractAuthData(result);
        return result;
      }

      // Loi validation
      if (result.response && typeof result.response === 'object') {
        const err = new Error(result.message || 'Dang nhap that bai');
        err.responseData = result.response;
        throw err;
      }

      throw new Error(result.message || 'Dang nhap that bai');
    } catch (error) {
      console.error('[authService] Login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await apiClient.post('/api/auth/register', {
        name: userData.fullName || userData.name,
        email: userData.email,
        phone: userData.phone || '',
        password: userData.password,
      });

      const result = response.data;

      if (result.code === 201 || result.code === 200) {
        if (result.response?.token) {
          localStorage.setItem('auth_token', result.response.token);
        }
        return result;
      }

      // Validation errors
      if (result.response && typeof result.response === 'object') {
        const err = new Error(result.message || 'Dang ky that bai');
        err.validationErrors = result.response;
        throw err;
      }

      throw new Error(result.message || 'Dang ky that bai');
    } catch (error) {
      console.error('[authService] Register error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.warn('[authService] Logout API error (ignored):', error.message);
    }

    localStorage.removeItem('auth_token');
    localStorage.removeItem('odoo_session_id');
    localStorage.removeItem('odoo_csrf_token');
    localStorage.removeItem('admin_api_key');

    return { code: 200, message: 'Dang xuat thanh cong', response: { message: 'Dang xuat thanh cong' } };
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.post('/api/auth/me');
      return response.data;
    } catch (error) {
      console.warn('[authService] getCurrentUser failed:', error.message);
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.warn('[authService] forgotPassword failed:', error.message);
      return { code: 200, message: 'Da gui lien ket dat lai mat khau', response: { message: 'Da gui lien ket dat lai mat khau' } };
    }
  },

  refreshToken: async () => {
    try {
      const response = await apiClient.post('/api/auth/refresh');
      const result = response.data;
      if (result.code === 200 && result.response?.token) {
        localStorage.setItem('auth_token', result.response.token);
      }
      return result;
    } catch (error) {
      console.warn('[authService] refreshToken failed:', error.message);
      throw error;
    }
  },

  setAdminApiKey: async (apiKey) => {
    try {
      const response = await apiClient.post('/api/auth/api-key/set', { api_key: apiKey });
      const result = response.data;
      if (result.code === 200 && result.response?.api_key) {
        localStorage.setItem('admin_api_key', result.response.api_key);
      }
      return result;
    } catch (error) {
      console.warn('[authService] setAdminApiKey failed:', error.message);
      throw error;
    }
  },
};

export default authService;
